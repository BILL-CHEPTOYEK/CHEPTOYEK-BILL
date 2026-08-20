/**
 * What parsing silently threw away.
 *
 * Valid JSON isn't the same as JSON that survives a round trip. `JSON.parse`
 * keeps the last of a set of duplicate keys and says nothing, and it rounds any
 * integer past 2^53 to something that isn't the number you were sent — which is
 * every Discord, Twitter and Twilio ID. Both are invisible in a formatter that
 * only reports parse errors, and both change your data, so they're worth a
 * warning of their own.
 */

import { tokenize, lineStarts, positionAt } from "./tokenize.js";

const MAX_REPORTED = 12;

function pathOf(stack) {
  let path = "$";

  for (const frame of stack) {
    if (frame.kind === "array") path += `[${frame.index}]`;
    else if (frame.key !== null) path += `.${frame.key}`;
  }

  return path;
}

export function lint(text) {
  if (!text.trim()) return { duplicates: [], unsafeNumbers: [], truncated: false };

  const tokens = tokenize(text);
  const starts = lineStarts(text);
  const duplicates = [];
  const unsafeNumbers = [];
  const stack = [];
  let truncated = false;

  for (const token of tokens) {
    if (token.type === "punctuation") {
      if (token.value === "{") stack.push({ kind: "object", seen: new Set(), key: null });
      else if (token.value === "[") stack.push({ kind: "array", index: 0 });
      else if (token.value === "}" || token.value === "]") stack.pop();
      else if (token.value === "," && stack[stack.length - 1]?.kind === "array") {
        stack[stack.length - 1].index += 1;
      }
      continue;
    }

    const frame = stack[stack.length - 1];

    if (token.type === "string" && token.key) {
      if (frame?.kind !== "object") continue;

      let name;
      try {
        name = JSON.parse(token.value);
      } catch {
        continue;
      }

      frame.key = name;

      if (frame.seen.has(name)) {
        if (duplicates.length < MAX_REPORTED) {
          duplicates.push({ key: name, path: pathOf(stack), ...positionAt(starts, token.start) });
        } else {
          truncated = true;
        }
      } else {
        frame.seen.add(name);
      }
      continue;
    }

    if (token.type === "number") {
      // Only plain integers. A float that doesn't round-trip is a property of
      // binary floating point, not a surprise about this document.
      if (/[.eE]/.test(token.value)) continue;

      const parsed = Number(token.value);
      if (Number.isSafeInteger(parsed)) continue;

      if (unsafeNumbers.length < MAX_REPORTED) {
        unsafeNumbers.push({
          literal: token.value,
          parsed: String(parsed),
          path: pathOf(stack),
          ...positionAt(starts, token.start),
        });
      } else {
        truncated = true;
      }
    }
  }

  return { duplicates, unsafeNumbers, truncated };
}
