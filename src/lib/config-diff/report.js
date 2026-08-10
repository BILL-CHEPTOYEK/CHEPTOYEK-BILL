import { formatPath } from "./diff.js";
import { isSecretPath, maskValue } from "./format.js";

const HEADINGS = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
  type: "Type-only differences",
  moved: "Moved",
};

const ORDER = ["removed", "added", "changed", "type", "moved"];

const render = (value, masked) => {
  if (value === undefined) return "—";
  if (masked) return `\`${maskValue(typeof value === "string" ? value : String(value))}\``;
  return `\`${typeof value === "string" ? value : JSON.stringify(value)}\``;
};

/**
 * Markdown summary, sized for a pull request comment.
 *
 * Secrets are masked here too — the whole point of this export is that it gets
 * pasted somewhere, which is exactly where an unmasked DATABASE_PASSWORD ends
 * up being a problem.
 */
export function toMarkdownReport(changes, summary, meta = {}) {
  const { leftLabel = "Left", rightLabel = "Right", maskSecrets = true } = meta;

  const lines = [
    `# Config diff — ${leftLabel} → ${rightLabel}`,
    "",
    summary.total === 0
      ? "_No structural differences._"
      : `**${summary.total}** difference${summary.total === 1 ? "" : "s"}: ` +
        ORDER.filter((kind) => summary[kind] > 0)
          .map((kind) => `${summary[kind]} ${HEADINGS[kind].toLowerCase()}`)
          .join(", "),
    "",
  ];

  ORDER.forEach((kind) => {
    const rows = changes.filter((change) => change.kind === kind);
    if (rows.length === 0) return;

    lines.push(`## ${HEADINGS[kind]} (${rows.length})`, "");

    rows.forEach((change) => {
      const path = formatPath(change.path) || "(root)";
      const masked = maskSecrets && isSecretPath(change.path);

      if (kind === "added") lines.push(`- \`${path}\` → ${render(change.right, masked)}`);
      else if (kind === "removed") lines.push(`- \`${path}\` (was ${render(change.left, masked)})`);
      else if (kind === "moved")
        lines.push(`- \`${path}\` — index ${change.left} → ${change.right} (${change.note})`);
      else
        lines.push(
          `- \`${path}\`: ${render(change.left, masked)} → ${render(change.right, masked)}` +
            (change.note ? ` _(${change.note})_` : "")
        );
    });

    lines.push("");
  });

  lines.push("---", "", "Generated with the config diff at cheptoyek.com/tools/config-diff");
  return lines.join("\n");
}
