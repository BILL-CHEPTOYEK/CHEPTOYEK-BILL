/**
 * Turning a `JSON.parse` failure into something you can act on.
 *
 * The browser's own message is the weakest part of every JSON tool: "Unexpected
 * token } in JSON at position 428" tells you where the parser gave up, which is
 * usually nowhere near where you made the mistake. The trailing comma is on the
 * line above; the unclosed brace is forty lines above. So the offset is only the
 * starting point — a second pass over the token stream looks for the handful of
 * mistakes that actually account for almost every broken JSON document, and
 * reports the cause instead of the symptom.
 */

import { tokenize, lineStarts, positionAt } from "./tokenize.js";

const PYTHON_LITERALS = new Set(["True", "False", "None"]);
const JS_LITERALS = new Set(["NaN", "Infinity", "undefined"]);
const SMART_QUOTES = /[‘’“”]/;

/** Where the engine gave up. V8, SpiderMonkey and JavaScriptCore all differ. */
function offsetFromMessage(message, text) {
  const position = /position (\d+)/i.exec(message);
  if (position) return Math.min(Number(position[1]), Math.max(0, text.length - 1));

  // Firefox: "JSON.parse: unexpected character at line 3 column 5 of the JSON data"
  const lineColumn = /line (\d+) column (\d+)/i.exec(message);
  if (lineColumn) {
    const starts = lineStarts(text);
    const start = starts[Number(lineColumn[1]) - 1] ?? 0;
    return start + Number(lineColumn[2]) - 1;
  }

  return Math.max(0, text.length - 1);
}

/** The token the parser was looking at, plus the one before it. */
function tokensAround(tokens, offset) {
  let at = null;
  let before = null;

  for (const token of tokens) {
    if (token.start <= offset && offset < token.end) {
      at = token;
      break;
    }
    if (token.end <= offset && token.type !== "whitespace") before = token;
  }

  return { at, before };
}

/**
 * The cause, not the symptom. Ordered by how specific the evidence is — a
 * trailing comma we can point at beats a generic "there's a quote character
 * somewhere in the file".
 */
function findCause(tokens, offset) {
  const significant = tokens.filter((token) => token.type !== "whitespace");
  const { at, before } = tokensAround(tokens, offset);

  // A comma with nothing after it but a closing bracket. This is the single most
  // common way to break JSON, and the reported position is always the bracket.
  const closing = at ?? significant.find((token) => token.start >= offset);
  if (closing?.type === "punctuation" && (closing.value === "}" || closing.value === "]")) {
    if (before?.type === "punctuation" && before.value === ",") {
      return {
        title: "Trailing comma",
        detail: `There's a comma before the closing ${closing.value}. JSON, unlike JavaScript, doesn't allow one.`,
        at: before,
        repairable: true,
      };
    }
  }

  const stray = significant.find((token) => token.type === "error");

  if (stray) {
    if (stray.value === "'") {
      return {
        title: "Single-quoted string",
        detail: "JSON strings must use double quotes. Single quotes are valid JavaScript but not valid JSON.",
        at: stray,
        repairable: true,
      };
    }

    if (stray.value === "/" ) {
      return {
        title: "Comment",
        detail: "JSON has no comments. This is legal in JSONC, JSON5 and most config files, but not in JSON itself.",
        at: stray,
        repairable: true,
      };
    }

    if (stray.value.startsWith('"')) {
      return {
        title: "Unterminated string",
        detail: "This string opens but never closes — the line ends first. Check for a missing quote or an unescaped one inside the value.",
        at: stray,
        repairable: false,
      };
    }

    if (PYTHON_LITERALS.has(stray.value)) {
      return {
        title: `Python literal \`${stray.value}\``,
        detail: "JSON spells these true, false and null — lowercase. This usually means the document came out of a Python repr() rather than a JSON encoder.",
        at: stray,
        repairable: true,
      };
    }

    if (JS_LITERALS.has(stray.value)) {
      return {
        title: `\`${stray.value}\` is not valid JSON`,
        detail: "JSON has no NaN, Infinity or undefined. Whatever produced this file serialised a JavaScript value that has no JSON equivalent.",
        at: stray,
        repairable: true,
      };
    }

    if (SMART_QUOTES.test(stray.value)) {
      return {
        title: "Curly quotes",
        detail: "These are typographic quotes, not straight ones — the usual sign that the JSON has been through a word processor, a chat client or a CMS.",
        at: stray,
        repairable: true,
      };
    }

    if (/^[A-Za-z_$]/.test(stray.value)) {
      const next = significant[significant.indexOf(stray) + 1];
      if (next?.type === "punctuation" && next.value === ":") {
        return {
          title: "Unquoted key",
          detail: `Object keys must be quoted strings in JSON. \`${stray.value}\` needs to be \`"${stray.value}"\`.`,
          at: stray,
          repairable: true,
        };
      }
    }
  }

  return null;
}

/** Does every non-empty line parse on its own? Then it's NDJSON, not JSON. */
export function looksLikeNdjson(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return false;

  return lines.every((line) => {
    try {
      JSON.parse(line);
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Returns null when the text parses. Otherwise: where the parser stopped, the
 * line to show, and — when we can work it out — what actually went wrong.
 */
export function diagnose(text) {
  if (!text.trim()) return null;

  try {
    JSON.parse(text);
    return null;
  } catch (error) {
    const message = error.message;
    const starts = lineStarts(text);
    const tokens = tokenize(text);

    const offset = offsetFromMessage(message, text);
    let cause = findCause(tokens, offset);

    if (!cause && looksLikeNdjson(text)) {
      cause = {
        title: "Several JSON values, one after another",
        detail: "Each line parses on its own, so this is newline-delimited JSON (NDJSON) rather than a single document. Repair wraps the lines into an array.",
        at: null,
        repairable: true,
      };
    }

    if (!cause && /^\s*</.test(text)) {
      cause = {
        title: "This isn't JSON",
        detail: "It starts with a tag — you're probably looking at an HTML error page or an XML response that came back where JSON was expected.",
        at: null,
        repairable: false,
      };
    }

    // Point at the cause when we found one; the parser's own offset is only a
    // fallback, because it is so often on the wrong line.
    const target = cause?.at?.start ?? offset;
    const position = positionAt(starts, target);
    const line = text.split("\n")[position.line - 1] ?? "";

    return {
      message,
      offset: target,
      line: position.line,
      column: position.column,
      lineText: line,
      cause,
    };
  }
}
