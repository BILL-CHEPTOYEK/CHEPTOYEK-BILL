/**
 * A scanner for JSON text.
 *
 * Deliberately tolerant: anything it can't classify becomes an `error` token
 * rather than throwing. Every consumer here — syntax highlighting, duplicate-key
 * detection, error diagnosis — needs to keep going past the first mistake, which
 * is exactly what `JSON.parse` refuses to do.
 */

const PUNCTUATION = new Set(["{", "}", "[", "]", ":", ","]);
const WHITESPACE = new Set([" ", "\t", "\n", "\r"]);
const LITERALS = new Set(["true", "false", "null"]);

// Sticky rather than anchored-on-a-slice: slicing inside the loop turns the
// whole scan quadratic, which you notice at about a megabyte.
const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const WORD = /[A-Za-z_$][\w$]*/y;

/** Reads one double-quoted string starting at `start`. */
function scanString(text, start) {
  let index = start + 1;

  while (index < text.length) {
    const char = text[index];
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === '"') return { index: index + 1, closed: true };
    // A raw newline can't appear inside a JSON string, so this is an
    // unterminated quote — stop here instead of swallowing the rest of the file.
    if (char === "\n") return { index, closed: false };
    index += 1;
  }

  return { index, closed: false };
}

/**
 * A string is a key when the next thing that isn't whitespace is a colon.
 * Highlighting and duplicate detection both want this, and neither can work it
 * out from the token alone.
 */
function markKeys(tokens) {
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i].type !== "string") continue;

    let next = i + 1;
    while (next < tokens.length && tokens[next].type === "whitespace") next += 1;

    const candidate = tokens[next];
    if (candidate?.type === "punctuation" && candidate.value === ":") tokens[i].key = true;
  }
}

export function tokenize(text) {
  const tokens = [];
  const length = text.length;
  let index = 0;

  while (index < length) {
    const char = text[index];

    if (WHITESPACE.has(char)) {
      let end = index + 1;
      while (end < length && WHITESPACE.has(text[end])) end += 1;
      tokens.push({ type: "whitespace", value: text.slice(index, end), start: index, end });
      index = end;
      continue;
    }

    if (PUNCTUATION.has(char)) {
      tokens.push({ type: "punctuation", value: char, start: index, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === '"') {
      const string = scanString(text, index);
      tokens.push({
        type: string.closed ? "string" : "error",
        value: text.slice(index, string.index),
        start: index,
        end: string.index,
      });
      index = string.index;
      continue;
    }

    if (char === "-" || (char >= "0" && char <= "9")) {
      NUMBER.lastIndex = index;
      const match = NUMBER.exec(text);
      if (match && match[0].length > 0) {
        const end = index + match[0].length;
        tokens.push({ type: "number", value: match[0], start: index, end });
        index = end;
        continue;
      }
    }

    WORD.lastIndex = index;
    const word = WORD.exec(text);
    if (word) {
      const end = index + word[0].length;
      // Barewords that aren't true/false/null are the unquoted keys and Python
      // literals that repair knows how to fix, so they need to survive as tokens.
      tokens.push({
        type: LITERALS.has(word[0]) ? "literal" : "error",
        value: word[0],
        start: index,
        end,
      });
      index = end;
      continue;
    }

    tokens.push({ type: "error", value: char, start: index, end: index + 1 });
    index += 1;
  }

  markKeys(tokens);
  return tokens;
}

/** Byte offsets of the start of every line, for turning offsets into positions. */
export function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

/** 1-based line and column for a byte offset. */
export function positionAt(starts, offset) {
  let low = 0;
  let high = starts.length - 1;

  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid] <= offset) low = mid;
    else high = mid - 1;
  }

  return { line: low + 1, column: offset - starts[low] + 1 };
}

/**
 * Regroups a token stream into one array per line, so the renderer can put a
 * line number next to each row. Safe because a JSON string can never contain a
 * literal newline — only whitespace tokens ever straddle a line boundary.
 */
export function toLines(tokens) {
  const lines = [[]];

  for (const token of tokens) {
    if (token.type !== "whitespace" || !token.value.includes("\n")) {
      lines[lines.length - 1].push(token);
      continue;
    }

    const segments = token.value.split("\n");
    segments.forEach((segment, position) => {
      if (position > 0) lines.push([]);
      if (segment) lines[lines.length - 1].push({ type: "whitespace", value: segment });
    });
  }

  return lines;
}
