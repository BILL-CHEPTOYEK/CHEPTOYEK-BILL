/**
 * Display helpers. Purely presentational — nothing here feeds the diff.
 */

const SECRET_KEY = /(pass(word|wd)?|secret|token|api[_-]?key|credential|private[_-]?key|auth|signature|salt)/i;

/** True when the final path segment names something that shouldn't be on screen. */
export function isSecretPath(path) {
  const leaf = path[path.length - 1];
  return typeof leaf === "string" && SECRET_KEY.test(leaf);
}

/**
 * Masking preserves length bucket and the first two characters, because when
 * you are comparing two environments the useful question is usually "are these
 * the same secret", not "what is the secret".
 */
export function maskValue(value) {
  if (typeof value !== "string" || value.length === 0) return "••••";
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 2)}${"•".repeat(Math.min(12, value.length - 2))}`;
}

/** A single path segment as it should read in the tree: `port`, or `[2]`. */
export const segmentLabel = (segment) =>
  typeof segment === "number" ? `[${segment}]` : String(segment);

const TYPE_LABEL = {
  string: "str",
  number: "num",
  boolean: "bool",
  null: "null",
  object: "obj",
  array: "arr",
  undefined: "—",
};

export const typeLabel = (type) => TYPE_LABEL[type] ?? type;

/** Compact one-line rendering of any value, for a diff row. */
export function formatValue(value, { masked = false, maxLength = 120 } = {}) {
  if (value === undefined) return "—";
  if (masked) return maskValue(typeof value === "string" ? value : String(value));
  if (value === null) return "null";
  if (typeof value === "string") return value === "" ? '""' : value;
  if (typeof value === "object") {
    const json = JSON.stringify(value);
    return json.length > maxLength ? `${json.slice(0, maxLength)}…` : json;
  }
  return String(value);
}

/**
 * Class names are written out in full rather than composed, because Tailwind
 * finds classes by scanning source text — anything assembled at runtime is
 * invisible to it and silently ships unstyled.
 */
export const KIND_META = {
  added: {
    label: "Added",
    symbol: "+",
    tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-400",
  },
  removed: {
    label: "Removed",
    symbol: "−",
    tone: "text-rose-700 bg-rose-50 border-rose-200",
    dot: "bg-rose-400",
  },
  changed: {
    label: "Changed",
    symbol: "~",
    tone: "text-amber-700 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  },
  type: {
    label: "Type only",
    symbol: "!",
    tone: "text-violet-700 bg-violet-50 border-violet-200",
    dot: "bg-violet-400",
  },
  moved: {
    label: "Moved",
    symbol: "»",
    tone: "text-sky-700 bg-sky-50 border-sky-200",
    dot: "bg-sky-400",
  },
  unchanged: {
    label: "Unchanged",
    symbol: "=",
    tone: "text-neutral-400 bg-neutral-50 border-neutral-200",
    dot: "bg-neutral-300",
  },
};
