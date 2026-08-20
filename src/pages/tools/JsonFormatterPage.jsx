import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import PageShell from "../../components/PageShell";
import { Pane, PaneHeader, PaneBody, PaneFooter, PaneAction, Segmented, Toggle } from "../../components/json-format/Pane";
import Editor from "../../components/json-format/Editor";
import CodeView from "../../components/json-format/CodeView";
import JsonTree, { OPEN_MODES } from "../../components/json-format/JsonTree";
import ErrorCard from "../../components/json-format/ErrorCard";
import Warnings from "../../components/json-format/Warnings";
import { INDENTS, DEFAULT_INDENT, indentValue, stringify, analyze, byteSize, humanSize } from "../../lib/json-format/format";
import { diagnose } from "../../lib/json-format/diagnose";
import { tryRepair, findEncodedJson } from "../../lib/json-format/repair";
import { lint } from "../../lib/json-format/lint";
import { SAMPLES } from "../../lib/json-format/samples";

const VIEWS = [
  { id: "code", label: "Code", title: "The formatted document" },
  { id: "tree", label: "Tree", title: "Collapsible explorer" },
];

const EMPTY_LINT = { duplicates: [], unsafeNumbers: [], truncated: false };

const PLACEHOLDER = `Paste JSON here, or drop a file on this pane.

Nearly-JSON is fine too — comments, single quotes,
trailing commas, a Python dict, a line of NDJSON.
Anything that doesn't parse gets a Repair button.`;

/** One copy handler for a page with a dozen things to copy. */
function useCopy() {
  const [copied, setCopied] = useState(null);

  const copy = useCallback(async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
    } catch {
      /* Denied clipboard permission. The selection is still there to copy by hand. */
    }
  }, []);

  return [copied, copy];
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(DEFAULT_INDENT);
  const [sortKeys, setSortKeys] = useState(false);
  const [view, setView] = useState("code");
  const [query, setQuery] = useState("");
  const [openMode, setOpenMode] = useState(OPEN_MODES.default);
  const [toggled, setToggled] = useState(() => new Set());
  const [notice, setNotice] = useState("");
  const [copied, copy] = useCopy();

  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  // Every derived value hangs off the deferred copy, so a large document
  // re-parses in the background instead of between two keystrokes.
  const deferred = useDeferredValue(input);
  const pending = deferred !== input;

  const parsed = useMemo(() => {
    if (!deferred.trim()) return { empty: true, ok: false, value: undefined };
    try {
      return { empty: false, ok: true, value: JSON.parse(deferred) };
    } catch {
      return { empty: false, ok: false, value: undefined };
    }
  }, [deferred]);

  const error = useMemo(() => (parsed.ok || parsed.empty ? null : diagnose(deferred)), [parsed, deferred]);
  const repair = useMemo(() => (error ? tryRepair(deferred) : null), [error, deferred]);

  const output = useMemo(
    () => (parsed.ok ? stringify(parsed.value, { indent: indentValue(indent), sortKeys }) : ""),
    [parsed, indent, sortKeys]
  );

  const warnings = useMemo(() => (parsed.ok ? lint(deferred) : EMPTY_LINT), [parsed.ok, deferred]);
  const stats = useMemo(() => (parsed.ok ? analyze(parsed.value) : null), [parsed]);
  const encoded = useMemo(() => (parsed.ok ? findEncodedJson(parsed.value) : null), [parsed]);

  const inputBytes = useMemo(() => byteSize(input), [input]);
  const outputBytes = useMemo(() => byteSize(output), [output]);
  const saved = inputBytes > 0 && outputBytes < inputBytes
    ? Math.round((1 - outputBytes / inputBytes) * 100)
    : 0;

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  /** Replaces the whole document — samples, files, repair, unwrapping. */
  const replace = useCallback((text) => {
    setInput(text);
    setNotice("");
    setToggled(new Set());
    setOpenMode(OPEN_MODES.default);
  }, []);

  const download = useCallback(() => {
    if (!output) return;
    const name = indent === "minify" ? "minified.json" : "formatted.json";
    const url = URL.createObjectURL(new Blob([output], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }, [output, indent]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.metaKey || event.ctrlKey)) return;

      if (event.key === "Enter" && output) {
        event.preventDefault();
        copy("output", output);
      }
      if (event.key.toLowerCase() === "s" && output) {
        event.preventDefault();
        download();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copy, download, output]);

  const toggleNode = useCallback((path) => {
    setToggled((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const setAllOpen = (mode) => {
    setOpenMode(mode);
    setToggled(new Set());
  };

  /** Puts the caret on the offending character and scrolls it into view. */
  const jumpToError = () => {
    const textarea = textareaRef.current;
    if (!textarea || !error) return;

    textarea.focus();
    textarea.setSelectionRange(error.offset, Math.min(error.offset + 1, input.length));
    // Matches `leading-5` on the textarea. Positioning it a third of the way
    // down leaves the surrounding lines visible, which is the point of jumping.
    textarea.scrollTop = Math.max(0, (error.line - 1) * 20 - textarea.clientHeight / 3);
  };

  const openFile = async (file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setNotice(`${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB — too large to open in the browser.`);
      return;
    }
    replace(await file.text());
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) replace(text);
    } catch {
      setNotice("The browser wouldn't grant clipboard access - paste into the box with ⌘V instead.");
    }
  };

  const status = parsed.empty
    ? null
    : parsed.ok
      ? { tone: "text-emerald-700 border-emerald-200 bg-emerald-50", dot: "bg-emerald-400", label: "Valid JSON" }
      : { tone: "text-rose-700 border-rose-200 bg-rose-50", dot: "bg-rose-400", label: `Invalid - line ${error?.line ?? "?"}` };

  return (
    <PageShell
      backTo="/tools"
      backLabel="Tools"
      width="max-w-7xl"
      eyebrow="Tool"
      title="JSON formatter"
      subtitle="Paste on the left, read the result on the right. It formats and validates as you type, tells you what broke rather than where the parser gave up, repairs the near-misses that aren't quite JSON - comments, single quotes, trailing commas, a Python dict, a log file - and warns you about the two things parsing silently changes. Runs entirely in your browser."
    >
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] uppercase tracking-[0.2em] text-neutral-400">Try</span>
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => replace(sample.text)}
            title={sample.note}
            className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900"
          >
            {sample.label}
          </button>
        ))}

        <span className="ml-auto hidden text-[11px] text-neutral-300 sm:inline">
          ⌘↵ copy · ⌘S download
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Pane>
          <PaneHeader label="Input">
            {status && (
              <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${status.tone}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            )}

            <span className="ml-auto flex items-center gap-0.5">
              <PaneAction onClick={() => fileRef.current?.click()} title="Open a .json file">
                Upload
              </PaneAction>
              <PaneAction onClick={paste} title="Paste from the clipboard">
                Paste
              </PaneAction>
              <PaneAction onClick={() => replace("")} disabled={!input}>
                Clear
              </PaneAction>
            </span>

            <input
              ref={fileRef}
              type="file"
              accept=".json,.jsonc,.ndjson,.txt,application/json,text/plain"
              className="hidden"
              onChange={(event) => {
                openFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </PaneHeader>

          <PaneBody>
            <Editor
              value={input}
              onChange={setInput}
              errorLine={error?.line}
              textareaRef={textareaRef}
              onFile={openFile}
              placeholder={PLACEHOLDER}
            />
          </PaneBody>

          <PaneFooter>
            {notice ? (
              <span className="text-rose-600">{notice}</span>
            ) : input ? (
              <span className="tabular-nums">
                {input.split("\n").length.toLocaleString()} lines · {humanSize(inputBytes)}
              </span>
            ) : (
              <span className="text-neutral-300">Nothing is uploaded - there's no server to upload to.</span>
            )}
          </PaneFooter>
        </Pane>

        <Pane>
          <PaneHeader label="Output">
            <Segmented label="Indentation" options={INDENTS} value={indent} onChange={setIndent} />
            <Toggle
              pressed={sortKeys}
              onClick={() => setSortKeys((value) => !value)}
              title="Sort object keys alphabetically. Array order is data, so it is left alone."
            >
              A→Z
            </Toggle>

            <span className="ml-auto flex items-center gap-2">
              <Segmented label="Output view" options={VIEWS} value={view} onChange={setView} />
              <PaneAction onClick={() => copy("output", output)} disabled={!output} title="⌘↵">
                {copied === "output" ? "Copied ✓" : "Copy"}
              </PaneAction>
              <PaneAction onClick={download} disabled={!output} title="⌘S">
                Download
              </PaneAction>
            </span>
          </PaneHeader>

          {view === "tree" && parsed.ok && (
            <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-1.5">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && setQuery("")}
                placeholder="Filter keys and values"
                aria-label="Filter the tree"
                className="w-44 rounded-full border border-neutral-200 px-3 py-1 font-mono text-[11px] text-neutral-700 transition-colors placeholder:font-sans placeholder:text-neutral-300 focus:border-neutral-400 focus:outline-none"
              />
              <PaneAction onClick={() => setAllOpen(OPEN_MODES.all)}>Expand all</PaneAction>
              <PaneAction onClick={() => setAllOpen(OPEN_MODES.none)}>Collapse all</PaneAction>
              {openMode !== OPEN_MODES.default && (
                <PaneAction onClick={() => setAllOpen(OPEN_MODES.default)}>Reset</PaneAction>
              )}
            </div>
          )}

          <PaneBody>
            {parsed.empty ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <p className="text-sm text-neutral-400">The formatted document appears here.</p>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-neutral-300">
                  It updates as you type - there's no Format button to press, because there's nothing
                  a Format button could do that hasn't happened already.
                </p>
              </div>
            ) : error ? (
              <ErrorCard
                error={error}
                repair={repair}
                onRepair={() => replace(repair.text)}
                onJump={jumpToError}
              />
            ) : view === "tree" ? (
              <JsonTree
                value={parsed.value}
                openMode={openMode}
                toggled={toggled}
                onToggle={toggleNode}
                query={query}
                onCopy={copy}
                copied={copied}
              />
            ) : (
              <CodeView text={output} />
            )}
          </PaneBody>

          <PaneFooter>
            {stats ? (
              <>
                <span className="tabular-nums">
                  {humanSize(outputBytes)}
                  {saved > 0 && <span className="text-neutral-300"> · {saved}% smaller</span>}
                </span>
                <span className="tabular-nums text-neutral-300">
                  {stats.keys.toLocaleString()} keys · {stats.nodes.toLocaleString()} values · depth{" "}
                  {stats.depth}
                </span>
                {pending && <span className="text-neutral-300">updating…</span>}
                <button
                  type="button"
                  onClick={() => replace(output)}
                  className="ml-auto shrink-0 text-[11px] text-neutral-400 transition-colors hover:text-neutral-900"
                >
                  Use as input ↵
                </button>
              </>
            ) : (
              <span className="text-neutral-300">—</span>
            )}
          </PaneFooter>
        </Pane>
      </div>

      <Warnings {...warnings} />

      {encoded && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
          <p className="text-sm text-neutral-700">
            This document is a string that contains more JSON.
            <span className="text-neutral-500">
              {" "}
              The usual sign of a log field or a webhook payload that was encoded twice.
            </span>
          </p>
          <button
            type="button"
            onClick={() => replace(JSON.stringify(encoded))}
            className="ml-auto shrink-0 rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Unwrap it
          </button>
        </div>
      )}

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          [
            "The error names the mistake",
            "“Unexpected token } at position 428” is where the parser stopped, which is rarely where you went wrong - the trailing comma is on the line above, the unclosed brace forty lines above. A second pass over the tokens looks for the handful of mistakes that account for almost every broken document and reports the cause, on the line that caused it.",
          ],
          [
            "Almost-JSON still gets formatted",
            "Most of what people paste into a JSON formatter isn't JSON: a JavaScript object literal, a Python dict, a config file with comments, three log lines in a row. Repair rewrites those into the real thing in one pass and lists every change it made, because a silent fix is just a quieter way of misreporting the input.",
          ],
          [
            "Two things parsing changes silently",
            "A repeated key is legal JSON and the parser keeps only the last one. An integer past 2⁵³ - every Discord, Twitter and Stripe ID - comes back as a different number. Both are invisible in a tool that only reports parse errors, so both get a warning with the path and the line.",
          ],
        ].map(([title, body]) => (
          <div key={title}>
            <h2 className="text-base text-neutral-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
          </div>
        ))}
      </section>

      <p className="mt-12 max-w-2xl border-t border-neutral-200 pt-8 text-xs leading-relaxed text-neutral-400">
        Nothing you paste is uploaded, logged or stored - there is no backend to send it to, and{" "}
        <a
          href="/architecture"
          className="border-b border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-900"
        >
          the architecture page
        </a>{" "}
        explains why that is true rather than just claimed. Opening a file reads it in the browser;
        it never leaves the tab.
      </p>
    </PageShell>
  );
}
