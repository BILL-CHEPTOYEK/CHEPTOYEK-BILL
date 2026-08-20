/**
 * Making not-quite-JSON into JSON.
 *
 * Most of what people paste into a JSON formatter isn't JSON. It's a JavaScript
 * object literal, a Python dict, a config file with comments, a log line, a
 * value copied out of a database column. Refusing all of that and printing
 * "Unexpected token" is technically correct and completely useless, so this
 * rewrites the common near-misses into the real thing and reports what it
 * changed — the report matters, because a silent fix is just a different way of
 * lying about the input.
 */

const WHITESPACE = new Set([" ", "\t", "\n", "\r"]);
const OPEN_QUOTES = { "'": "'", "‘": "’", "“": "”" };
const RENAMED_LITERALS = {
  True: "true",
  False: "false",
  None: "null",
  TRUE: "true",
  FALSE: "false",
  NULL: "null",
  NaN: "null",
  Infinity: "null",
  undefined: "null",
};

/** Re-encodes the body of a loosely quoted string as a JSON string literal. */
function encode(raw) {
  let out = '"';

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];

    if (char === "\\") {
      const next = raw[i + 1];
      // \' is meaningful in the source dialect and illegal in JSON; every other
      // escape is either valid JSON already or harmless to keep.
      if (next === "'") {
        out += "'";
        i += 1;
      } else if (next === undefined) {
        out += "\\\\";
      } else {
        out += char + next;
        i += 1;
      }
      continue;
    }

    if (char === '"') out += '\\"';
    else if (char === "\n") out += "\\n";
    else if (char === "\r") out += "\\r";
    else if (char === "\t") out += "\\t";
    else if (char < " ") out += `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
    else out += char;
  }

  return `${out}"`;
}

/** The next character that isn't whitespace or a comment. */
function peekSignificant(text, from) {
  let index = from;

  while (index < text.length) {
    const char = text[index];

    if (WHITESPACE.has(char)) {
      index += 1;
      continue;
    }
    if (char === "/" && text[index + 1] === "/") {
      while (index < text.length && text[index] !== "\n") index += 1;
      continue;
    }
    if (char === "/" && text[index + 1] === "*") {
      const close = text.indexOf("*/", index + 2);
      index = close === -1 ? text.length : close + 2;
      continue;
    }

    return { char, index };
  }

  return { char: "", index };
}

/**
 * One pass, tracking string context so that a `//` inside a URL stays a URL and
 * a comma inside a sentence stays a comma.
 */
export function repair(text) {
  const fixes = new Set();
  let source = text;
  let out = "";
  let index = 0;

  if (source.charCodeAt(0) === 0xfeff) {
    source = source.slice(1);
    fixes.add("Removed a byte-order mark");
  }

  while (index < source.length) {
    const char = source[index];

    // A well-formed string is copied through untouched, escapes and all.
    if (char === '"') {
      let end = index + 1;
      let closed = false;

      while (end < source.length) {
        if (source[end] === "\\") {
          end += 2;
          continue;
        }
        if (source[end] === '"') {
          end += 1;
          closed = true;
          break;
        }
        if (source[end] === "\n") break;
        end += 1;
      }

      if (closed) {
        out += source.slice(index, end);
        index = end;
        continue;
      }

      // Unterminated. Take the rest of the line and close it — better than
      // handing back something that still won't parse.
      const lineEnd = source.indexOf("\n", index);
      const stop = lineEnd === -1 ? source.length : lineEnd;
      out += encode(source.slice(index + 1, stop));
      fixes.add("Closed an unterminated string");
      index = stop;
      continue;
    }

    if (OPEN_QUOTES[char]) {
      const closer = OPEN_QUOTES[char];
      let end = index + 1;

      while (end < source.length) {
        if (source[end] === "\\") {
          end += 2;
          continue;
        }
        if (source[end] === closer) break;
        end += 1;
      }

      out += encode(source.slice(index + 1, end));
      fixes.add(char === "'" ? "Converted single quotes to double quotes" : "Straightened curly quotes");
      index = Math.min(end + 1, source.length);
      continue;
    }

    if (char === "/" && source[index + 1] === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
      fixes.add("Stripped comments");
      continue;
    }

    if (char === "/" && source[index + 1] === "*") {
      const close = source.indexOf("*/", index + 2);
      index = close === -1 ? source.length : close + 2;
      fixes.add("Stripped comments");
      continue;
    }

    // A comma whose only remaining sibling is a closing bracket.
    if (char === ",") {
      const next = peekSignificant(source, index + 1);
      if (next.char === "}" || next.char === "]") {
        fixes.add("Removed trailing commas");
        index += 1;
        continue;
      }
      out += char;
      index += 1;
      continue;
    }

    if (/[A-Za-z_$]/.test(char)) {
      const word = /[A-Za-z_$][\w$]*/y;
      word.lastIndex = index;
      const [match] = word.exec(source);

      if (match === "true" || match === "false" || match === "null") {
        out += match;
      } else if (RENAMED_LITERALS[match] !== undefined) {
        out += RENAMED_LITERALS[match];
        fixes.add(
          match === "True" || match === "False" || match === "None"
            ? "Rewrote Python literals as JSON"
            : `Replaced ${match} with null`
        );
      } else {
        // A bareword. If a colon follows it's an unquoted key; otherwise it's an
        // unquoted value, and quoting is the only reading that preserves it.
        const next = peekSignificant(source, index + match.length);
        out += encode(match);
        fixes.add(next.char === ":" ? "Quoted unquoted keys" : "Quoted bare values");
      }

      index += match.length;
      continue;
    }

    out += char;
    index += 1;
  }

  return { text: out, fixes: [...fixes] };
}

/** Joins several standalone JSON values into one array. */
function wrapNdjson(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  for (const line of lines) {
    try {
      JSON.parse(line);
    } catch {
      return null;
    }
  }

  return `[${lines.join(",")}]`;
}

/**
 * Everything above, plus the two structural rescues that a character scanner
 * can't express. Returns null when nothing could be salvaged, so the caller can
 * keep showing the original error rather than a worse one.
 */
export function tryRepair(text) {
  if (!text.trim()) return null;

  const wrapped = wrapNdjson(text);
  if (wrapped) {
    try {
      return { value: JSON.parse(wrapped), text: wrapped, fixes: ["Wrapped newline-delimited JSON in an array"] };
    } catch {
      /* fall through to the scanner */
    }
  }

  const repaired = repair(text);

  try {
    return { value: JSON.parse(repaired.text), ...repaired };
  } catch {
    return null;
  }
}

/**
 * A JSON document that parses to a string which is itself JSON — what you get
 * from a log field, a webhook payload or a database column that stored an
 * encoded blob. Worth offering as its own action rather than doing silently,
 * because unwrapping changes what the document *is*.
 */
export function findEncodedJson(value) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;

  try {
    const inner = JSON.parse(trimmed);
    return typeof inner === "object" && inner !== null ? inner : null;
  } catch {
    return null;
  }
}
