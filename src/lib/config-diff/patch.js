import { formatPath } from "./diff.js";

/** RFC 6901 pointer escaping: `~` and `/` are the only reserved characters. */
const escapeSegment = (segment) => String(segment).replace(/~/g, "~0").replace(/\//g, "~1");

export const toPointer = (path) =>
  path.length === 0 ? "" : `/${path.map(escapeSegment).join("/")}`;

/**
 * Render the change list as an RFC 6902 JSON Patch.
 *
 * Exact for object-shaped documents. Array `move` operations are emitted from
 * the semantic alignment, which means a patch containing several of them is
 * order-sensitive in the way the spec intends — apply it as a whole document
 * rather than cherry-picking operations out of it.
 */
export function toJsonPatch(changes) {
  return changes
    .filter((change) => change.kind !== "unchanged")
    .map((change) => {
      const path = toPointer(change.path);

      switch (change.kind) {
        case "added":
          return { op: "add", path, value: change.right };
        case "removed":
          return { op: "remove", path };
        case "moved":
          return {
            op: "move",
            from: toPointer([...change.path.slice(0, -1), change.left]),
            path,
          };
        default:
          return { op: "replace", path, value: change.right };
      }
    });
}

/** A one-line, greppable summary per change — the format CI logs want. */
export function toPlainLines(changes) {
  const symbol = { added: "+", removed: "-", changed: "~", type: "!", moved: "»" };

  return changes
    .filter((change) => change.kind !== "unchanged")
    .map((change) => {
      const path = formatPath(change.path) || "(root)";
      const mark = symbol[change.kind] ?? "?";

      if (change.kind === "added") return `${mark} ${path} = ${JSON.stringify(change.right)}`;
      if (change.kind === "removed") return `${mark} ${path} (was ${JSON.stringify(change.left)})`;
      if (change.kind === "moved") return `${mark} ${path} moved from index ${change.left}`;
      return `${mark} ${path}: ${JSON.stringify(change.left)} → ${JSON.stringify(change.right)}`;
    });
}
