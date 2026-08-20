import { useMemo, useState } from "react";

/**
 * The output as something you can navigate rather than read.
 *
 * Formatting answers "is this valid, and what shape is it". A 4,000-line
 * pretty-printed response still doesn't answer "what's in it" — collapsing every
 * container to a single line and opening only the branch you care about does.
 * So this is a second view of the same document rather than a separate tool.
 *
 * Which rows are open is derived from depth plus a set of paths toggled away
 * from that default, rather than stored as a set of open paths. It costs one
 * XOR per row and buys the thing that matters: editing the input doesn't
 * collapse the tree you were reading, because there is no per-document state to
 * throw away and rebuild on every keystroke.
 */

const CHILD_PAGE = 200;
const DEFAULT_OPEN_DEPTH = 2;

export const OPEN_MODES = { default: "default", all: "all", none: "none" };

const childPath = (path, key) => (typeof key === "number" ? `${path}[${key}]` : `${path}.${key}`);

const isContainer = (value) => value !== null && typeof value === "object";

const entriesOf = (value) =>
  Array.isArray(value)
    ? value.map((item, index) => [index, item])
    : Object.keys(value).map((key) => [key, value[key]]);

function summarize(value) {
  if (Array.isArray(value)) {
    return { brackets: "[ ]", count: `${value.length} item${value.length === 1 ? "" : "s"}` };
  }
  const size = Object.keys(value).length;
  return { brackets: "{ }", count: `${size} key${size === 1 ? "" : "s"}` };
}

const scalarText = (value) => (typeof value === "string" ? value : String(value));

function scalarClass(value) {
  if (typeof value === "string") return "text-emerald-700";
  if (typeof value === "number") return "text-sky-700";
  return "text-violet-700";
}

/** Wraps the matching run, so you can see why a row survived the filter. */
function Highlight({ text, query }) {
  if (!query) return text;

  const index = text.toLowerCase().indexOf(query);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-amber-100 text-inherit">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

/**
 * Which rows survive a filter. Built once per query in a single walk, because
 * asking every node to search its own subtree makes filtering O(n · depth).
 */
function buildIndex(root, query) {
  const matched = new Set();
  const contains = new Set();
  if (!query) return { matched, contains };

  const walk = (node, key, path) => {
    let hit = String(key).toLowerCase().includes(query);
    if (!isContainer(node) && !hit) hit = scalarText(node).toLowerCase().includes(query);

    let any = hit;
    if (isContainer(node)) {
      for (const [childKey, child] of entriesOf(node)) {
        if (walk(child, childKey, childPath(path, childKey))) any = true;
      }
    }

    if (hit) matched.add(path);
    if (any) contains.add(path);
    return any;
  };

  walk(root, "$", "$");
  return { matched, contains };
}

function Node({ name, value, path, depth, state }) {
  const { openMode, toggled, onToggle, query, index, limits, showMore, onCopy, copied } = state;

  if (query && !index.contains.has(path)) return null;

  const base =
    openMode === OPEN_MODES.all
      ? true
      : openMode === OPEN_MODES.none
        ? false
        : depth <= DEFAULT_OPEN_DEPTH;

  // A filter is only useful if it opens what it found.
  const open = query ? true : base !== toggled.has(path);
  const container = isContainer(value);

  const row = (
    <div
      className={`group flex items-center gap-1.5 rounded-md py-[3px] pl-1.5 pr-2 transition-colors hover:bg-neutral-50 ${
        index.matched.has(path) ? "bg-amber-50/60" : ""
      }`}
    >
      {container ? (
        <button
          type="button"
          onClick={() => onToggle(path)}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${path}`}
          className="w-3 shrink-0 text-[10px] leading-none text-neutral-400 transition-colors hover:text-neutral-900"
        >
          {open ? "▾" : "▸"}
        </button>
      ) : (
        <span className="w-3 shrink-0" />
      )}

      {name !== null && (
        <span
          className={
            typeof name === "number"
              ? "shrink-0 text-neutral-300 tabular-nums"
              : "shrink-0 font-medium text-neutral-800"
          }
        >
          {typeof name === "number" ? name : <Highlight text={name} query={query} />}
        </span>
      )}

      {container ? (
        <>
          <span className="shrink-0 text-neutral-300">{summarize(value).brackets}</span>
          <span className="shrink-0 text-neutral-400">{summarize(value).count}</span>
        </>
      ) : (
        <>
          {name !== null && <span className="shrink-0 text-neutral-300">:</span>}
          <span className={`min-w-0 truncate ${scalarClass(value)}`}>
            {typeof value === "string" ? '"' : ""}
            <Highlight text={scalarText(value).slice(0, 300)} query={query} />
            {scalarText(value).length > 300 ? "…" : ""}
            {typeof value === "string" ? '"' : ""}
          </span>
        </>
      )}

      <span className="ml-auto flex shrink-0 items-center gap-2 pl-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onCopy(`path:${path}`, path)}
          title={path}
          className="text-[10px] text-neutral-300 transition-colors hover:text-neutral-800"
        >
          {copied === `path:${path}` ? "copied" : "path"}
        </button>
        <button
          type="button"
          onClick={() => onCopy(`value:${path}`, JSON.stringify(value, null, 2) ?? "")}
          className="text-[10px] text-neutral-300 transition-colors hover:text-neutral-800"
        >
          {copied === `value:${path}` ? "copied" : "value"}
        </button>
      </span>
    </div>
  );

  if (!container || !open) return row;

  const entries = entriesOf(value);
  const limit = limits[path] ?? CHILD_PAGE;
  const shown = entries.slice(0, limit);
  const hidden = entries.length - shown.length;

  return (
    <>
      {row}
      {/* One wrapper per level, so the guide lines nest along with the indent. */}
      <div className="ml-3 border-l border-neutral-100">
        {shown.map(([key, child]) => (
          <Node
            key={key}
            name={key}
            value={child}
            path={childPath(path, key)}
            depth={depth + 1}
            state={state}
          />
        ))}
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => showMore(path, limit + 500)}
            className="py-1 pl-2 text-[11px] text-neutral-400 transition-colors hover:text-neutral-900"
          >
            {hidden.toLocaleString()} more — show 500
          </button>
        )}
      </div>
    </>
  );
}

export default function JsonTree({ value, openMode, toggled, onToggle, query, onCopy, copied }) {
  const [limits, setLimits] = useState({});
  const normalized = query.trim().toLowerCase();
  const index = useMemo(() => buildIndex(value, normalized), [value, normalized]);

  const state = {
    openMode,
    toggled,
    onToggle,
    query: normalized,
    index,
    limits,
    showMore: (path, next) => setLimits((current) => ({ ...current, [path]: next })),
    onCopy,
    copied,
  };

  if (normalized && index.contains.size === 0) {
    return (
      <p className="px-6 py-16 text-center text-sm text-neutral-400">
        Nothing in the document matches “{query.trim()}”.
      </p>
    );
  }

  return (
    <div className="h-full overflow-auto py-2 pr-1 font-mono text-[12.5px] leading-5">
      <Node name={null} value={value} path="$" depth={1} state={state} />
    </div>
  );
}
