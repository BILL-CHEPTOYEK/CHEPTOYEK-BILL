import { diffValues, formatPath, toTree } from "./diff.js";
import { parseConfig, detectFormat } from "./parse.js";
import { toJsonPatch, toPlainLines } from "./patch.js";
import { toMarkdownReport } from "./report.js";
import { diffText, diffWords, collapseUnchanged } from "./textDiff.js";

let failures = 0;
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.log(`FAIL ${name}\n  expected ${e}\n  actual   ${a}`);
  } else console.log(`ok   ${name}`);
};

// 1. Key order is irrelevant.
check("key order ignored", diffValues({ a: 1, b: 2 }, { b: 2, a: 1 }).summary.total, 0);

// 2. Type-only difference gets its own kind.
{
  const { changes, summary } = diffValues({ port: "8080" }, { port: 8080 });
  check("type-only kind", changes[0].kind, "type");
  check("type-only count", summary.type, 1);
  check("type-only suppressed by looseTypes", diffValues({ port: "8080" }, { port: 8080 }, { looseTypes: true }).summary.total, 0);
}

// 3. 1 vs true must NOT be treated as a coincidence.
check("1 vs true is a real change", diffValues({ x: 1 }, { x: true }).changes[0].kind, "changed");

// 4. Nested add/remove/change.
{
  const { changes } = diffValues(
    { db: { host: "a", port: 5432 }, gone: 1 },
    { db: { host: "b", port: 5432, ssl: true } }
  );
  const byPath = Object.fromEntries(changes.map((c) => [formatPath(c.path), c.kind]));
  check("nested change", byPath["db.host"], "changed");
  check("nested add", byPath["db.ssl"], "added");
  check("top-level remove", byPath["gone"], "removed");
  check("unchanged omitted", byPath["db.port"], undefined);
}

// 5. Array matched by identity key, not position.
{
  const left = { svc: [{ id: "web", port: 80 }, { id: "api", port: 3000 }] };
  const right = { svc: [{ id: "api", port: 3001 }, { id: "web", port: 80 }] };
  const { changes } = diffValues(left, right);
  const kinds = changes.map((c) => `${formatPath(c.path)}:${c.kind}`).sort();
  // A swap is reported as one move, not two: the minimal set of relocations.
  check("keyed array", kinds, ["svc[0].port:changed", "svc[1]:moved"]);
}

// 6. Insertion in the middle must not cascade.
{
  const { changes } = diffValues({ a: [1, 2, 3] }, { a: [1, 9, 2, 3] });
  check("lcs insertion", changes.map((c) => c.kind), ["added"]);
  check("lcs insertion path", formatPath(changes[0].path), "a[1]");
}

// 7. Edited list item pairs up instead of remove+add.
{
  const { changes } = diffValues({ a: ["x", "y"] }, { a: ["x", "z"] });
  check("lcs zip", changes.map((c) => c.kind), ["changed"]);
}

// 8. ignoreArrayOrder.
check("array reorder ignored", diffValues({ a: [3, 1, 2] }, { a: [1, 2, 3] }, { ignoreArrayOrder: true }).summary.total, 0);

// 9. ignorePaths globs.
check("glob one segment", diffValues({ m: { a: { ts: 1 } } }, { m: { a: { ts: 2 } } }, { ignorePaths: ["m.*.ts"] }).summary.total, 0);
check("glob deep", diffValues({ m: { a: { b: { ts: 1 } } } }, { m: { a: { b: { ts: 2 } } } }, { ignorePaths: ["**.ts"] }).summary.total, 0);

// 10. caseInsensitiveKeys reports a rename, not add+remove.
{
  const { changes } = diffValues({ DB_HOST: "a" }, { db_host: "a" }, { caseInsensitiveKeys: true });
  check("case-insensitive rename", changes.length, 1);
  check("case-insensitive note", changes[0].note, "key renamed: DB_HOST → db_host");
  check("case-sensitive default", diffValues({ DB_HOST: "a" }, { db_host: "a" }).summary.total, 2);
}

// 11. Format detection.
check("detect json", detectFormat('{"a":1}'), "json");
check("detect yaml", detectFormat("a: 1\nb:\n  - c"), "yaml");
check("detect env", detectFormat("PORT=8080\nDEBUG=true\n# note"), "env");
check("detect ini", detectFormat("[server]\nport=8080"), "ini");

// 12. Parsers.
check("env parse", parseConfig("export PORT=8080\nNAME=\"a b\"\n").value, { PORT: 8080, NAME: "a b" });
check("ini parse", parseConfig("[db]\nhost=x\nnested.k=1").value, { db: { host: "x", nested: { k: 1 } } });
check("yaml parse", parseConfig("a:\n  b: 2").value, { a: { b: 2 } });
check("json error", parseConfig("{ bad }").ok, false);

// 13. Cross-format: .env vs JSON with looseTypes.
{
  const env = parseConfig("PORT=8080\nDEBUG=true").value;
  const json = parseConfig('{"PORT": 8080, "DEBUG": true}').value;
  check("cross-format equal", diffValues(env, json).summary.total, 0);
}

// 14. JSON Patch output.
{
  const { changes } = diffValues({ a: 1, b: 2 }, { a: 9, c: 3 });
  check("json patch", toJsonPatch(changes), [
    { op: "replace", path: "/a", value: 9 },
    { op: "remove", path: "/b" },
    { op: "add", path: "/c", value: 3 },
  ]);
  check("pointer escaping", toJsonPatch(diffValues({ "a/b": 1 }, { "a/b": 2 }).changes)[0].path, "/a~1b");
}

// 15. Tree building.
{
  const { changes } = diffValues({ a: { b: 1 } }, { a: { b: 2 } });
  const tree = toTree(changes);
  check("tree depth", tree.children[0].children[0].change.kind, "changed");
  check("tree kinds bubble", [...tree.children[0].kinds], ["changed"]);
}

// 16. Report + lines render without throwing, and mask secrets.
{
  const { changes, summary } = diffValues({ DB_PASSWORD: "hunter2xyz" }, { DB_PASSWORD: "correcthorse" });
  const md = toMarkdownReport(changes, summary);
  check("report masks secret", md.includes("hunter2xyz"), false);
  check("report shows path", md.includes("DB_PASSWORD"), true);
  check("plain lines", toPlainLines(changes).length, 1);
}

// 17. Root-level scalar and array-of-scalars edge cases.
check("root scalar", diffValues(1, 2).changes[0].kind, "changed");
check("empty vs empty", diffValues({}, {}).summary.total, 0);
check("obj to scalar", diffValues({ a: { b: 1 } }, { a: "x" }).changes[0].note, "object → string");

// 18. Source code must fall back to text, not blow up as YAML.
{
  const java = "package org.services;\n\npublic class InvoiceResource {\n}\n";
  const parsed = parseConfig(java);
  // Either it fails to parse, or it parses to a bare scalar — both mean "not config".
  check("java is not structured", parsed.ok && parsed.structured, false);
  check("empty stays structured", parseConfig("").structured, true);
  check("json object is structured", parseConfig('{"a":1}').structured, true);
  check("json scalar is not structured", parseConfig("42").structured, false);
  check("forced text never parses", parseConfig('{"a":1}', "text").format, "text");
}

// 19. Line diff basics.
{
  const { rows, summary } = diffText("a\nb\nc", "a\nB\nc");
  check("line diff counts", [summary.added, summary.removed, summary.changed], [0, 0, 1]);
  check("line diff keeps numbers", [rows[1].leftNo, rows[1].rightNo], [2, 2]);
  check("line diff pairs edits", rows[1].type, "changed");
}

// 20. An inserted line must not cascade into every line after it.
{
  const { rows, summary } = diffText("a\nb\nc", "a\nnew\nb\nc");
  check("insertion is one add", [summary.added, summary.removed, summary.changed], [1, 0, 0]);
  check("insertion keeps rest same", rows.filter((r) => r.type === "same").length, 3);
}

// 21. Whitespace and case options.
// Matches git's --ignore-space-change: indentation and repeated spaces are
// free, but removing a space entirely still counts.
check("ignore reindentation", diffText("    a = 1", "a  =  1", { ignoreWhitespace: true }).summary.total, 0);
check("ignore whitespace is not ignore-all", diffText("a = 1", "a=1", { ignoreWhitespace: true }).summary.total, 1);
check("whitespace matters by default", diffText("  a = 1", "a = 1").summary.total, 1);
check("ignore case", diffText("Hello", "hello", { ignoreCase: true }).summary.total, 0);

// 22. Word-level diff marks only what moved, and reassembles losslessly.
{
  const { left, right } = diffWords("private static final int PAGE_SIZE = 25;", "private static final int PAGE_SIZE = 50;");
  check("word diff left rebuilds", left.map((p) => p.text).join(""), "private static final int PAGE_SIZE = 25;");
  check("word diff right rebuilds", right.map((p) => p.text).join(""), "private static final int PAGE_SIZE = 50;");
  check("word diff marks the number", left.filter((p) => p.changed).map((p) => p.text), ["25;"]);
}

// 23. Collapsing keeps context around each change.
{
  const many = Array.from({ length: 40 }, (_, i) => `line ${i}`).join("\n");
  const edited = many.replace("line 20", "line twenty");
  const { rows } = diffText(many, edited);
  const collapsed = collapseUnchanged(rows);
  check("collapse inserts gaps", collapsed.some((row) => row.type === "gap"), true);
  check("collapse keeps the change", collapsed.some((row) => row.type === "changed"), true);
  check("collapse is much shorter", collapsed.length < rows.length / 2, true);
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
