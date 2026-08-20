import assert from "node:assert/strict";
import { test } from "node:test";

import { tokenize, toLines, lineStarts, positionAt } from "./tokenize.js";
import { diagnose, looksLikeNdjson } from "./diagnose.js";
import { repair, tryRepair, findEncodedJson } from "./repair.js";
import { stringify, analyze, humanSize, byteSize } from "./format.js";
import { lint } from "./lint.js";

const types = (text) => tokenize(text).filter((t) => t.type !== "whitespace").map((t) => t.type);

test("tokenize: classifies each kind of token", () => {
  assert.deepEqual(types('{"a": 1, "b": [true, null]}'), [
    "punctuation", "string", "punctuation", "number", "punctuation",
    "string", "punctuation", "punctuation", "literal", "punctuation", "literal",
    "punctuation", "punctuation",
  ]);
});

test("tokenize: marks strings that are keys, and only those", () => {
  const strings = tokenize('{"key": "value"}').filter((t) => t.type === "string");
  assert.equal(strings[0].key, true);
  assert.equal(strings[1].key, undefined);
});

test("tokenize: an escaped quote does not end a string", () => {
  const [string] = tokenize('"a \\" b"');
  assert.equal(string.type, "string");
  assert.equal(string.value, '"a \\" b"');
});

test("tokenize: a newline inside a string ends it as an error", () => {
  const tokens = tokenize('"unterminated\n');
  assert.equal(tokens[0].type, "error");
});

test("tokenize: barewords are errors, real literals are not", () => {
  assert.deepEqual(types("{foo: True}"), ["punctuation", "error", "punctuation", "error", "punctuation"]);
  assert.deepEqual(types("[true,false,null]"), [
    "punctuation", "literal", "punctuation", "literal", "punctuation", "literal", "punctuation",
  ]);
});

test("toLines: one entry per line, blank lines included", () => {
  const lines = toLines(tokenize('{\n  "a": 1\n\n}'));
  assert.equal(lines.length, 4);
  assert.deepEqual(lines[2], []);
});

test("positionAt: offsets become 1-based line and column", () => {
  const text = "{\n  \"a\": 1\n}";
  const starts = lineStarts(text);
  assert.deepEqual(positionAt(starts, 0), { line: 1, column: 1 });
  assert.deepEqual(positionAt(starts, 2), { line: 2, column: 1 });
  assert.deepEqual(positionAt(starts, 11), { line: 3, column: 1 });
});

test("diagnose: returns null for valid JSON and for empty input", () => {
  assert.equal(diagnose('{"a":1}'), null);
  assert.equal(diagnose("   \n  "), null);
});

test("diagnose: names a trailing comma and points at the comma", () => {
  const result = diagnose('{\n  "a": 1,\n}');
  assert.equal(result.cause.title, "Trailing comma");
  assert.equal(result.line, 2);
  assert.equal(result.cause.repairable, true);
});

test("diagnose: names the cause for each common near-miss", () => {
  assert.equal(diagnose("{'a': 1}").cause.title, "Single-quoted string");
  assert.equal(diagnose('{"a": 1} // note').cause.title, "Comment");
  assert.equal(diagnose("{a: 1}").cause.title, "Unquoted key");
  assert.equal(diagnose('{"a": True}').cause.title, "Python literal `True`");
  assert.equal(diagnose('{"a": NaN}').cause.title, "`NaN` is not valid JSON");
  assert.equal(diagnose('{"a": "b}').cause.title, "Unterminated string");
  assert.equal(diagnose("<html><body>500</body></html>").cause.title, "This isn't JSON");
});

test("diagnose: reports the line of the cause, not of the parser's stop", () => {
  // The parser blames the closing brace on line 4; the mistake is on line 3.
  const result = diagnose('{\n  "a": 1,\n  "b": 2,\n}');
  assert.equal(result.line, 3);
});

test("looksLikeNdjson: needs every line to parse, and more than one", () => {
  assert.equal(looksLikeNdjson('{"a":1}\n{"b":2}'), true);
  assert.equal(looksLikeNdjson('{"a":1}'), false);
  assert.equal(looksLikeNdjson('{"a":1}\nnot json'), false);
});

test("repair: strips comments but not the // inside a string", () => {
  assert.equal(repair('{"url": "http://x.dev"} // trailing').text.trim(), '{"url": "http://x.dev"}');
  assert.equal(JSON.parse(repair('{"url": "http://x.dev"}').text).url, "http://x.dev");
});

test("repair: leaves a comma that is not trailing alone", () => {
  const { value } = tryRepair('{"a": 1, "b": 2}');
  assert.deepEqual(value, { a: 1, b: 2 });
});

test("repair: fixes a whole messy document at once", () => {
  const messy = `{
    // config
    name: 'gateway',
    debug: False,
    timeout: NaN,
    routes: [{ path: '/api' },],
  }`;

  const result = tryRepair(messy);
  assert.deepEqual(result.value, {
    name: "gateway",
    debug: false,
    timeout: null,
    routes: [{ path: "/api" }],
  });
  assert.ok(result.fixes.includes("Stripped comments"));
  assert.ok(result.fixes.includes("Removed trailing commas"));
});

test("repair: a single-quoted string keeps its double quotes as content", () => {
  const { value } = tryRepair(`{'say': 'he said "hi"'}`);
  assert.deepEqual(value, { say: 'he said "hi"' });
});

test("repair: curly quotes are straightened", () => {
  const { value } = tryRepair('{“a”: “b”}');
  assert.deepEqual(value, { a: "b" });
});

test("repair: NDJSON becomes an array", () => {
  const result = tryRepair('{"a":1}\n{"a":2}');
  assert.deepEqual(result.value, [{ a: 1 }, { a: 2 }]);
  assert.deepEqual(result.fixes, ["Wrapped newline-delimited JSON in an array"]);
});

test("repair: gives up rather than returning something worse", () => {
  assert.equal(tryRepair("}{"), null);
  assert.equal(tryRepair("   "), null);
});

test("findEncodedJson: only unwraps a string that really holds JSON", () => {
  assert.deepEqual(findEncodedJson('{"a":1}'), { a: 1 });
  assert.equal(findEncodedJson("just a string"), null);
  assert.equal(findEncodedJson({ a: 1 }), null);
});

test("lint: finds duplicate keys with their path", () => {
  const { duplicates } = lint('{"a": {"b": 1, "b": 2}}');
  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].key, "b");
  assert.equal(duplicates[0].path, "$.a.b");
});

test("lint: the same key in sibling objects is not a duplicate", () => {
  assert.deepEqual(lint('[{"id": 1}, {"id": 2}]').duplicates, []);
});

test("lint: flags integers that parsing would round", () => {
  const { unsafeNumbers } = lint('{"id": 1379284410098723456}');
  assert.equal(unsafeNumbers.length, 1);
  assert.equal(unsafeNumbers[0].literal, "1379284410098723456");
  assert.notEqual(unsafeNumbers[0].parsed, unsafeNumbers[0].literal);
  assert.equal(unsafeNumbers[0].path, "$.id");
});

test("lint: safe integers and ordinary floats are left alone", () => {
  assert.deepEqual(lint('{"a": 42, "b": 0.1, "c": 1e400}').unsafeNumbers, []);
});

test("lint: array indices appear in reported paths", () => {
  const { duplicates } = lint('{"items": [{"x": 1}, {"x": 1, "x": 2}]}');
  assert.equal(duplicates[0].path, "$.items[1].x");
});

test("stringify: indent styles, and sorting that leaves arrays alone", () => {
  assert.equal(stringify({ a: 1 }, { indent: 0 }), '{"a":1}');
  assert.equal(stringify({ a: 1 }, { indent: "\t" }), '{\n\t"a": 1\n}');
  assert.equal(
    stringify({ b: 1, a: { d: 1, c: [3, 1, 2] } }, { indent: 0, sortKeys: true }),
    '{"a":{"c":[3,1,2],"d":1},"b":1}'
  );
});

test("analyze: counts nodes, keys and depth", () => {
  const stats = analyze({ a: [1, 2, { b: null }], c: "x" });
  assert.equal(stats.keys, 3);
  assert.equal(stats.depth, 4);
  assert.equal(stats.arrays, 1);
  assert.equal(stats.objects, 2);
  assert.equal(stats.nulls, 1);
});

test("byteSize counts bytes, not characters", () => {
  assert.equal(byteSize("abc"), 3);
  assert.equal(byteSize("🎉"), 4);
});

test("humanSize picks a readable unit", () => {
  assert.equal(humanSize(512), "512 B");
  assert.equal(humanSize(2048), "2.0 KB");
  assert.equal(humanSize(2 * 1024 * 1024), "2.0 MB");
});
