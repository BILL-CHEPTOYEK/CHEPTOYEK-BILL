import { useState } from "react";
import { FORMATS } from "../../lib/config-diff/parse";

const FORMAT_OPTIONS = [["auto", "Auto-detect"], ...Object.entries(FORMATS)];

/**
 * One side of the comparison: a textarea, a format override, and two ways to
 * fill it that aren't typing — fetch a URL, or drop a file on it.
 */
export default function ConfigPane({
  label,
  value,
  onChange,
  format,
  onFormatChange,
  parsed,
  textMode,
}) {
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [dragging, setDragging] = useState(false);

  const load = async (event) => {
    event.preventDefault();
    if (!url.trim()) return;

    setFetching(true);
    setFetchError("");

    try {
      const response = await fetch(url.trim());
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      onChange(await response.text());
      setUrlOpen(false);
    } catch (error) {
      // Almost always CORS. Say so, because the browser's message won't.
      setFetchError(
        `${error.message}. If the endpoint doesn't send CORS headers the browser blocks this — there's no server here to proxy through.`
      );
    } finally {
      setFetching(false);
    }
  };

  const readFile = async (file) => {
    if (!file) return;
    onChange(await file.text());
  };

  // Once the page has fallen back to a line diff, a parse error is no longer a
  // failure — it is the reason for the mode, and it has already been explained
  // once above. Repeating it in red here just looks broken.
  const showParseError = parsed && !parsed.ok && !textMode;
  // In text mode the detected format is whatever the guess was before it fell
  // through, so reporting it would be actively misleading.
  const detected =
    !textMode && format === "auto" && parsed?.format ? FORMATS[parsed.format] : null;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">{label}</span>
          {detected && <span className="text-[11px] text-neutral-400">detected {detected}</span>}
          {textMode && <span className="text-[11px] text-neutral-400">line diff</span>}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={format}
            onChange={(event) => onFormatChange(event.target.value)}
            aria-label={`${label} format`}
            className="text-xs text-neutral-500 bg-transparent border border-neutral-200 rounded-full px-2.5 py-1 hover:border-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
          >
            {FORMAT_OPTIONS.map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setUrlOpen((open) => !open)}
            className="text-xs text-neutral-400 hover:text-neutral-800 transition-colors"
          >
            URL
          </button>

          {value && (
            <button
              onClick={() => onChange("")}
              className="text-xs text-neutral-300 hover:text-neutral-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {urlOpen && (
        <form onSubmit={load} className="mb-2 flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://api.example.com/config.json"
            className="flex-1 rounded-full border border-neutral-200 px-4 py-1.5 text-xs text-neutral-800 focus:border-neutral-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={fetching}
            className="px-4 py-1.5 rounded-full bg-neutral-900 text-white text-xs hover:bg-neutral-700 transition-colors disabled:opacity-40"
          >
            {fetching ? "…" : "Fetch"}
          </button>
        </form>
      )}

      {fetchError && <p className="mb-2 text-xs leading-relaxed text-rose-600">{fetchError}</p>}

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          readFile(event.dataTransfer.files?.[0]);
        }}
        spellCheck={false}
        placeholder={"Paste config, drop a file, or fetch a URL.\n\nJSON, YAML, .env and INI all work —\nincluding one against another."}
        className={`w-full h-72 md:h-96 resize-y rounded-xl border bg-white p-4 font-mono text-[12.5px] leading-relaxed text-neutral-800 focus:outline-none transition-colors ${
          dragging
            ? "border-neutral-900 bg-neutral-50"
            : showParseError
              ? "border-rose-300"
              : "border-neutral-200 focus:border-neutral-400"
        }`}
      />

      <div className="mt-2 min-h-[1.25rem]">
        {showParseError ? (
          <p className="text-xs text-rose-600">
            {parsed.error.line ? `Line ${parsed.error.line} — ` : ""}
            {parsed.error.message}
          </p>
        ) : (
          value && (
            <p className="text-xs text-neutral-300 tabular-nums">
              {value.split("\n").length} lines · {value.length} chars
              {textMode && <span className="ml-2 text-neutral-400">compared as text</span>}
            </p>
          )
        )}
      </div>
    </div>
  );
}
