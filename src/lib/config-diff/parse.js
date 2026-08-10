import { parse as parseYaml } from "yaml";

/**
 * Format detection and parsing for the four shapes config actually arrives in.
 *
 * Everything here returns a plain JS value — the diff engine below never learns
 * which format a document came from, which is what makes comparing a YAML
 * manifest against a JSON API response work without a special case.
 */

export const FORMATS = {
  json: "JSON",
  yaml: "YAML",
  env: ".env",
  ini: "INI / TOML-ish",
  text: "Text / code",
};

const SECTION_LINE = /^\s*\[[^\]]+\]\s*$/;
const ASSIGNMENT_LINE = /^\s*(?:export\s+)?[\w.-]+\s*=/;
const YAML_MAPPING_LINE = /^\s*[\w."'[\]-]+\s*:(\s|$)/;
const YAML_SEQUENCE_LINE = /^\s*-\s/;

const meaningfulLines = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith(";") && !line.startsWith("//"));

/**
 * Detection is a vote, not a cascade. Formats overlap — `a: 1` is valid YAML
 * and `A=1` is valid in three of the four — so each candidate scores the
 * document and the highest score wins.
 */
export function detectFormat(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{")) return "json";
  if (trimmed.startsWith("---")) return "yaml";

  const lines = meaningfulLines(text);
  if (lines.length === 0) return null;

  const sections = lines.filter((line) => SECTION_LINE.test(line)).length;
  const assignments = lines.filter((line) => ASSIGNMENT_LINE.test(line)).length;
  const yamlish = lines.filter(
    (line) => YAML_MAPPING_LINE.test(line) || YAML_SEQUENCE_LINE.test(line)
  ).length;

  // A leading `[` is ambiguous: a JSON array and an INI section header open the
  // same way. Only the presence of `key = value` lines tells them apart.
  if (sections > 0 && assignments > 0) return "ini";
  if (trimmed.startsWith("[")) return "json";
  if (assignments >= yamlish && assignments / lines.length > 0.6) return "env";
  if (yamlish / lines.length > 0.5) return "yaml";

  // Indentation is the tiebreaker: .env files are flat, YAML rarely is.
  return /^\s+\S/m.test(text) ? "yaml" : "env";
}

/** Turn scalars that look like other types into those types. */
function coerceScalar(raw) {
  const value = raw.trim();
  if (value === "") return "";
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d*\.\d+$/.test(value)) return Number(value);
  return value;
}

function unquote(value) {
  const trimmed = value.trim();
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  if (!quoted || trimmed.length < 2) return null;
  return trimmed.slice(1, -1);
}

/**
 * .env parsing. Quoted values keep their exact string; bare values get the same
 * coercion the INI parser uses, so `PORT=8080` compares as a number against the
 * 8080 in a JSON config rather than looking like a type change.
 */
function parseEnv(text) {
  const result = {};

  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const withoutExport = trimmed.replace(/^export\s+/, "");
    const separator = withoutExport.indexOf("=");
    if (separator === -1) return;

    const key = withoutExport.slice(0, separator).trim();
    if (!key) return;

    const rawValue = withoutExport.slice(separator + 1);
    const literal = unquote(rawValue);
    result[key] = literal !== null ? literal : coerceScalar(rawValue.split(" #")[0]);
  });

  return result;
}

/** INI, with `[section]` becoming a nested object and dotted names nesting further. */
function parseIni(text) {
  const result = {};
  let target = result;

  const descend = (root, segments) =>
    segments.reduce((node, segment) => {
      if (typeof node[segment] !== "object" || node[segment] === null) node[segment] = {};
      return node[segment];
    }, root);

  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) return;

    if (SECTION_LINE.test(trimmed)) {
      target = descend(result, trimmed.slice(1, -1).trim().split("."));
      return;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1);
    const literal = unquote(rawValue);
    const value = literal !== null ? literal : coerceScalar(rawValue);

    const segments = key.split(".");
    const leaf = segments.pop();
    descend(target, segments)[leaf] = value;
  });

  return result;
}

/** Best-effort line number out of whatever the engine put in the message. */
function jsonErrorLine(text, error) {
  const explicit = /line (\d+)/i.exec(error.message);
  if (explicit) return Number(explicit[1]);

  const position = /position (\d+)/i.exec(error.message);
  if (!position) return null;
  return text.slice(0, Number(position[1])).split("\n").length;
}

/**
 * Config has a mapping or a sequence at its root. A bare scalar means YAML
 * technically accepted the input — a one-line Java file is a valid YAML string —
 * without there being any structure to compare.
 */
const isStructured = (value) => value !== null && typeof value === "object";

/**
 * Parse a document, detecting the format unless one is forced.
 *
 * Never throws. A failure comes back as `{ ok: false, error }`, and anything
 * that parses to a bare scalar comes back with `structured: false`. Either way
 * the caller has what it needs to fall back to a text diff rather than putting
 * a parse error where a result should be — pasting source code into a diff tool
 * is a reasonable thing to do, and an error page is not a reasonable answer.
 */
export function parseConfig(text, forcedFormat = "auto") {
  if (!text.trim()) {
    return { ok: true, value: undefined, format: null, empty: true, structured: true };
  }

  if (forcedFormat === "text") {
    return { ok: true, value: text, format: "text", structured: false };
  }

  const format = forcedFormat === "auto" ? detectFormat(text) : forcedFormat;

  try {
    switch (format) {
      case "json": {
        const value = JSON.parse(text);
        return { ok: true, value, format, structured: isStructured(value) };
      }
      // A non-empty document that yields no keys was never .env or INI — the
      // line-oriented parsers accept anything and simply find nothing. Without
      // this, pasting prose into both panes reports two empty objects and
      // "no differences", which is worse than being wrong loudly.
      case "env": {
        const value = parseEnv(text);
        return { ok: true, value, format, structured: Object.keys(value).length > 0 };
      }
      case "ini": {
        const value = parseIni(text);
        return { ok: true, value, format, structured: Object.keys(value).length > 0 };
      }
      case "yaml":
      default: {
        const value = parseYaml(text, { merge: true }) ?? {};
        return {
          ok: true,
          value,
          format: format ?? "yaml",
          structured: isStructured(value),
        };
      }
    }
  } catch (error) {
    return {
      ok: false,
      format,
      structured: false,
      error: {
        message: error.message.replace(/\s+at position \d+.*$/s, ""),
        line: format === "json" ? jsonErrorLine(text, error) : (error.linePos?.[0]?.line ?? null),
      },
    };
  }
}
