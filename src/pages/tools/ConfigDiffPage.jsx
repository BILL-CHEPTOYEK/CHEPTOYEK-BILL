import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import PageShell from "../../components/PageShell";
import ConfigPane from "../../components/config-diff/ConfigPane";
import OptionsBar from "../../components/config-diff/OptionsBar";
import DiffSummary from "../../components/config-diff/DiffSummary";
import DiffTree from "../../components/config-diff/DiffTree";
import TextDiffView from "../../components/config-diff/TextDiffView";
import { parseConfig, FORMATS } from "../../lib/config-diff/parse";
import { diffValues, formatPath, toTree, KINDS } from "../../lib/config-diff/diff";
import { diffText } from "../../lib/config-diff/textDiff";
import { toJsonPatch, toPlainLines } from "../../lib/config-diff/patch";
import { toMarkdownReport } from "../../lib/config-diff/report";
import { SAMPLES } from "../../lib/config-diff/samples";

const DEFAULT_OPTIONS = {
  // Structured mode
  ignoreArrayOrder: false,
  caseInsensitiveKeys: false,
  looseTypes: false,
  maskSecrets: true,
  ignorePathsRaw: "",
  // Text mode
  ignoreWhitespace: false,
  ignoreCase: false,
  splitView: true,
};

function useCopy() {
  const [copied, setCopied] = useState(null);

  const copy = async (key, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
  };

  return [copied, copy];
}

function ExportButton({ label, copiedLabel, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
    >
      {active ? copiedLabel : label}
    </button>
  );
}

function TextCount({ value, label, tone }) {
  return (
    <span className={`flex items-center gap-2 rounded-full border pl-2 pr-3 py-1.5 text-xs ${tone}`}>
      <span className="tabular-nums font-medium">{value}</span>
      {label}
    </span>
  );
}

export default function ConfigDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [leftFormat, setLeftFormat] = useState("auto");
  const [rightFormat, setRightFormat] = useState("auto");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [activeKinds, setActiveKinds] = useState(() => new Set(KINDS));
  const [view, setView] = useState("tree");
  const [query, setQuery] = useState("");
  const [autoCompare, setAutoCompare] = useState(true);
  const [copied, copy] = useCopy();

  // Deferring keeps typing responsive on a large document without a debounce
  // and its accompanying "why is my result stale" bug.
  const deferredLeft = useDeferredValue(left);
  const deferredRight = useDeferredValue(right);

  // What the result is actually computed from. While auto-compare is on this
  // tracks the inputs; with it off, only the Compare button moves it — which is
  // what you want when the documents are big enough that every keystroke hurts.
  const [committed, setCommitted] = useState({ left: "", right: "" });

  useEffect(() => {
    if (autoCompare) setCommitted({ left: deferredLeft, right: deferredRight });
  }, [autoCompare, deferredLeft, deferredRight]);

  const compareNow = useCallback(() => setCommitted({ left, right }), [left, right]);
  const stale = committed.left !== left || committed.right !== right;

  const parsedLeft = useMemo(
    () => parseConfig(committed.left, leftFormat),
    [committed.left, leftFormat]
  );
  const parsedRight = useMemo(
    () => parseConfig(committed.right, rightFormat),
    [committed.right, rightFormat]
  );

  const bothFilled = !parsedLeft.empty && !parsedRight.empty;

  // Structured comparison needs two documents that parsed into an object or an
  // array. Anything else — source code, prose, a broken YAML file — is compared
  // as text rather than refused.
  const mode = useMemo(() => {
    if (!bothFilled) return null;
    const structured =
      parsedLeft.ok && parsedRight.ok && parsedLeft.structured && parsedRight.structured;
    return structured ? "structured" : "text";
  }, [bothFilled, parsedLeft, parsedRight]);

  const fellBack =
    mode === "text" && leftFormat !== "text" && rightFormat !== "text";

  const ignorePaths = useMemo(
    () =>
      options.ignorePathsRaw
        .split(",")
        .map((pattern) => pattern.trim())
        .filter(Boolean),
    [options.ignorePathsRaw]
  );

  const result = useMemo(() => {
    if (mode !== "structured") return null;
    return diffValues(parsedLeft.value, parsedRight.value, {
      ignoreArrayOrder: options.ignoreArrayOrder,
      caseInsensitiveKeys: options.caseInsensitiveKeys,
      looseTypes: options.looseTypes,
      ignorePaths,
    });
  }, [mode, parsedLeft, parsedRight, options, ignorePaths]);

  const textResult = useMemo(() => {
    if (mode !== "text") return null;
    return diffText(committed.left, committed.right, {
      ignoreWhitespace: options.ignoreWhitespace,
      ignoreCase: options.ignoreCase,
    });
  }, [mode, committed, options.ignoreWhitespace, options.ignoreCase]);

  const visible = useMemo(() => {
    if (!result) return [];
    const needle = query.trim().toLowerCase();
    return result.changes.filter(
      (change) =>
        activeKinds.has(change.kind) &&
        (!needle || formatPath(change.path).toLowerCase().includes(needle))
    );
  }, [result, activeKinds, query]);

  const tree = useMemo(() => toTree(visible), [visible]);
  const filtered = result ? visible.length !== result.changes.length : false;

  const toggleKind = (kind) =>
    setActiveKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  const loadSample = (sample) => {
    setLeft(sample.left);
    setRight(sample.right);
    setLeftFormat("auto");
    setRightFormat("auto");
    setCommitted({ left: sample.left, right: sample.right });
  };

  const swap = () => {
    setLeft(right);
    setRight(left);
    setLeftFormat(rightFormat);
    setRightFormat(leftFormat);
    setCommitted({ left: right, right: left });
  };

  const reset = () => {
    setLeft("");
    setRight("");
    setCommitted({ left: "", right: "" });
  };

  return (
    <PageShell
      backTo="/tools"
      backLabel="Tools"
      width="max-w-6xl"
      eyebrow="Tool"
      title="Config diff"
      subtitle="A structural diff for JSON, YAML, .env and INI. It compares the parsed shape rather than the text, so reordering keys costs nothing, arrays are matched by identity instead of position, and the difference between 8080 and “8080” gets a category of its own. Paste anything it can't parse — source code, prose, a broken file — and it falls back to a line diff. Runs entirely in your browser."
    >
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-400 mr-1">Try</span>
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => loadSample(sample)}
            title={sample.note}
            className="px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
          >
            {sample.label}
          </button>
        ))}
        {(left || right) && (
          <>
            <button
              onClick={swap}
              className="px-3.5 py-1.5 rounded-full text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              ⇄ Swap sides
            </button>
            <button
              onClick={reset}
              className="px-3.5 py-1.5 rounded-full text-xs text-neutral-300 hover:text-neutral-700 transition-colors"
            >
              Reset
            </button>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ConfigPane
          label="Left"
          value={left}
          onChange={setLeft}
          format={leftFormat}
          onFormatChange={setLeftFormat}
          parsed={left ? parsedLeft : null}
          textMode={mode === "text"}
        />
        <ConfigPane
          label="Right"
          value={right}
          onChange={setRight}
          format={rightFormat}
          onFormatChange={setRightFormat}
          parsed={right ? parsedRight : null}
          textMode={mode === "text"}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={compareNow}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            stale && !autoCompare
              ? "bg-neutral-900 text-white hover:bg-neutral-700"
              : "border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
          }`}
        >
          Compare
        </button>

        <button
          onClick={() => setAutoCompare((value) => !value)}
          aria-pressed={autoCompare}
          title="Recompare on every keystroke, or only when you press Compare."
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
            autoCompare
              ? "bg-neutral-900 text-white border-neutral-900"
              : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800"
          }`}
        >
          Auto-compare
        </button>

        {!autoCompare && stale && (
          <span className="text-xs text-amber-600">Inputs changed since the last compare.</span>
        )}

        <div className="ml-auto">
          <OptionsBar options={options} onChange={setOptions} mode={mode ?? "structured"} />
        </div>
      </div>

      {fellBack && (
        <p className="mt-4 text-xs leading-relaxed text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3">
          <span className="text-neutral-800">Comparing as text.</span> One or both sides aren't
          structured config — {parsedLeft.ok && parsedRight.ok
            ? "they parsed to a plain value with no keys to compare"
            : "they didn't parse as JSON, YAML, .env or INI"}
          . Set a format explicitly above if that's wrong.
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        {!mode ? (
          <p className="px-6 py-16 text-center text-sm text-neutral-400">
            Fill both sides to see a diff.
          </p>
        ) : mode === "text" ? (
          <>
            <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <TextCount
                  value={textResult.summary.added}
                  label="added"
                  tone="text-emerald-700 bg-emerald-50 border-emerald-200"
                />
                <TextCount
                  value={textResult.summary.removed}
                  label="removed"
                  tone="text-rose-700 bg-rose-50 border-rose-200"
                />
                <TextCount
                  value={textResult.summary.changed}
                  label="changed"
                  tone="text-amber-700 bg-amber-50 border-amber-200"
                />
                <TextCount
                  value={textResult.summary.same}
                  label="unchanged"
                  tone="text-neutral-400 bg-neutral-50 border-neutral-200"
                />
              </div>
              <span className="ml-auto text-[11px] text-neutral-300">
                Line diff · {FORMATS.text}
              </span>
            </div>

            {textResult.summary.total === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-neutral-500">
                The two sides are identical.
              </p>
            ) : (
              <TextDiffView result={textResult} splitView={options.splitView} />
            )}
          </>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-x-4 gap-y-3">
              <DiffSummary summary={result.summary} active={activeKinds} onToggle={toggleKind} />

              <div className="flex items-center gap-2 ml-auto">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by path"
                  className="w-36 rounded-full border border-neutral-200 px-3.5 py-1.5 font-mono text-xs text-neutral-700 placeholder:font-sans placeholder:text-neutral-300 focus:border-neutral-400 focus:outline-none transition-colors"
                />

                <div className="flex rounded-full border border-neutral-200 overflow-hidden">
                  {["tree", "flat"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setView(item)}
                      aria-pressed={view === item}
                      className={`px-3 py-1.5 text-xs transition-colors ${
                        view === item
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      {item === "tree" ? "Tree" : "Flat"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {result.summary.total === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-neutral-500">
                No structural differences.
                <span className="block mt-1 text-xs text-neutral-400">
                  The documents may still differ as text — key order, formatting and comments are
                  not compared.
                </span>
              </p>
            ) : visible.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-neutral-400">
                {result.summary.total} difference{result.summary.total === 1 ? "" : "s"}, all hidden
                by the current filters.
              </p>
            ) : (
              <DiffTree
                tree={tree}
                changes={visible}
                view={view}
                maskSecrets={options.maskSecrets}
              />
            )}

            {visible.length > 0 && (
              <div className="px-5 py-4 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                <ExportButton
                  label="Copy JSON Patch"
                  copiedLabel="Copied ✓"
                  active={copied === "patch"}
                  onClick={() => copy("patch", JSON.stringify(toJsonPatch(visible), null, 2))}
                />
                <ExportButton
                  label="Copy markdown report"
                  copiedLabel="Copied ✓"
                  active={copied === "report"}
                  onClick={() =>
                    copy(
                      "report",
                      toMarkdownReport(visible, result.summary, {
                        maskSecrets: options.maskSecrets,
                      })
                    )
                  }
                />
                <ExportButton
                  label="Copy plain lines"
                  copiedLabel="Copied ✓"
                  active={copied === "lines"}
                  onClick={() => copy("lines", toPlainLines(visible).join("\n"))}
                />
                <span className="text-[11px] text-neutral-300 ml-1">
                  {filtered ? "Exports match what's shown, not the full diff." : "Exports the full diff."}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          [
            "Key order is not a change",
            "Objects are compared by key, so moving a block to the top of a YAML file produces an empty diff. This is the single biggest source of noise in reviewing config by eye.",
          ],
          [
            "Arrays match by identity",
            "If every element carries an id, name or key, elements are paired by that value rather than by index — so a reordered list reports one move, not a rewrite of every entry. Failing that, a longest-common-subsequence pass keeps an insertion from cascading through everything after it.",
          ],
          [
            "Anything else gets a line diff",
            "Source code and prose have no structure to compare, so the tool stops pretending and falls back to a line diff with word-level highlighting — the same alignment algorithm, run over lines instead of keys.",
          ],
        ].map(([title, body]) => (
          <div key={title}>
            <h2 className="text-base text-neutral-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
          </div>
        ))}
      </section>

      <p className="mt-12 pt-8 border-t border-neutral-200 text-xs leading-relaxed text-neutral-400 max-w-2xl">
        Nothing you paste is uploaded, logged or stored — there is no backend to send it to, and{" "}
        <a href="/architecture" className="text-neutral-600 border-b border-neutral-300 hover:border-neutral-900 transition-colors">
          the architecture page
        </a>{" "}
        explains why that is true rather than just claimed. Fetching a URL is the one exception: that
        request goes straight from your browser to whatever host you name.
      </p>
    </PageShell>
  );
}
