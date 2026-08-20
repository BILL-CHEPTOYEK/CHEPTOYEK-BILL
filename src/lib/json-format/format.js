/**
 * Serialisation and the numbers that go under the output pane.
 */

export const INDENTS = [
  { id: "2", label: "2", title: "Two spaces", value: 2 },
  { id: "4", label: "4", title: "Four spaces", value: 4 },
  { id: "tab", label: "Tab", title: "Tab indentation", value: "\t" },
  { id: "minify", label: "Min", title: "Minify — no whitespace at all", value: 0 },
];

export const DEFAULT_INDENT = "2";

export const indentValue = (id) => INDENTS.find((option) => option.id === id)?.value ?? 2;

/** Rebuilds objects with their keys in order. Arrays keep their order — that's data. */
function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value === null || typeof value !== "object") return value;

  const sorted = {};
  for (const key of Object.keys(value).sort()) sorted[key] = sortDeep(value[key]);
  return sorted;
}

export function stringify(value, { indent = 2, sortKeys = false } = {}) {
  const prepared = sortKeys ? sortDeep(value) : value;
  // `undefined` at the top level stringifies to undefined rather than a string.
  return JSON.stringify(prepared, null, indent) ?? "";
}

const encoder = typeof TextEncoder === "undefined" ? null : new TextEncoder();

/** Bytes, not characters — an emoji costs four of them and people notice. */
export function byteSize(text) {
  if (encoder) return encoder.encode(text).length;
  return unescape(encodeURIComponent(text)).length;
}

export function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Counts every value in the tree, so the footer can say what you're looking at. */
export function analyze(value) {
  const counts = { objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 };
  let nodes = 0;
  let keys = 0;
  let depth = 0;

  const walk = (node, level) => {
    nodes += 1;
    if (level > depth) depth = level;

    if (node === null) {
      counts.nulls += 1;
      return;
    }

    if (Array.isArray(node)) {
      counts.arrays += 1;
      for (const item of node) walk(item, level + 1);
      return;
    }

    switch (typeof node) {
      case "object":
        counts.objects += 1;
        for (const key of Object.keys(node)) {
          keys += 1;
          walk(node[key], level + 1);
        }
        return;
      case "string":
        counts.strings += 1;
        return;
      case "number":
        counts.numbers += 1;
        return;
      case "boolean":
        counts.booleans += 1;
        return;
      default:
        return;
    }
  };

  walk(value, 1);
  return { nodes, keys, depth, ...counts };
}
