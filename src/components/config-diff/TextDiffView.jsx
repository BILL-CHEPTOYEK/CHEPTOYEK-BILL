import { useMemo, useState } from "react";
import { collapseUnchanged } from "../../lib/config-diff/textDiff";

const ROW_TONE = {
  added: "bg-emerald-50/70",
  removed: "bg-rose-50/70",
  changed: "bg-amber-50/50",
  same: "",
};

const MARK = { added: "+", removed: "−", changed: "~", same: "" };

function Gutter({ number, tone }) {
  return (
    <span
      className={`select-none shrink-0 w-10 pr-2 text-right tabular-nums text-[11px] leading-6 ${tone}`}
    >
      {number ?? ""}
    </span>
  );
}

/** A line, with the words that actually changed picked out inside it. */
function Line({ text, parts, highlight }) {
  if (text === null) return <span className="text-neutral-300 select-none">—</span>;

  if (!parts) return <span>{text || " "}</span>;

  return (
    <>
      {parts.map((part, index) =>
        part.changed ? (
          <mark key={index} className={`rounded-[2px] px-0.5 ${highlight}`}>
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}

/**
 * Side-by-side text diff, used when the input isn't structured config.
 *
 * Long runs of identical lines are collapsed to a marker that expands on
 * click — a 900-line file with one changed line should not cost 899 lines of
 * scrolling to inspect.
 */
export default function TextDiffView({ result, splitView }) {
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(
    () => (expanded ? result.rows : collapseUnchanged(result.rows)),
    [result.rows, expanded]
  );

  const hidden = result.rows.length - rows.filter((row) => row.type !== "gap").length;

  return (
    <div>
      <div className="font-mono text-[12.5px] leading-6 overflow-x-auto">
        {rows.map((row, index) => {
          if (row.type === "gap") {
            return (
              <button
                key={`gap-${index}`}
                onClick={() => setExpanded(true)}
                className="w-full px-4 py-1.5 text-left text-[11px] font-sans text-neutral-400 bg-neutral-50 border-y border-neutral-100 hover:text-neutral-700 transition-colors"
              >
                ··· {row.count} unchanged line{row.count === 1 ? "" : "s"} — click to expand
              </button>
            );
          }

          const tone = ROW_TONE[row.type];

          if (!splitView) {
            // Unified: a changed line shows as a removal followed by an addition.
            const sides =
              row.type === "changed"
                ? [
                    { text: row.left, no: row.leftNo, kind: "removed", parts: row.words?.left },
                    { text: row.right, no: row.rightNo, kind: "added", parts: row.words?.right },
                  ]
                : [
                    {
                      text: row.type === "added" ? row.right : row.left,
                      no: row.type === "added" ? row.rightNo : row.leftNo,
                      kind: row.type,
                    },
                  ];

            return sides.map((side, sideIndex) => (
              <div
                key={`${index}-${sideIndex}`}
                className={`flex items-start px-2 ${ROW_TONE[side.kind]}`}
              >
                <Gutter number={side.no} tone="text-neutral-300" />
                <span className="select-none shrink-0 w-4 text-neutral-400">
                  {MARK[side.kind]}
                </span>
                <span className="whitespace-pre-wrap break-all text-neutral-800">
                  <Line
                    text={side.text}
                    parts={side.parts}
                    highlight={side.kind === "added" ? "bg-emerald-200/70" : "bg-rose-200/70"}
                  />
                </span>
              </div>
            ));
          }

          return (
            <div key={index} className="grid grid-cols-2">
              <div className={`flex items-start px-2 border-r border-neutral-100 ${row.type === "added" ? "bg-neutral-50/50" : tone}`}>
                <Gutter number={row.leftNo} tone="text-neutral-300" />
                <span className="whitespace-pre-wrap break-all text-neutral-800">
                  <Line text={row.left} parts={row.words?.left} highlight="bg-rose-200/70" />
                </span>
              </div>
              <div className={`flex items-start px-2 ${row.type === "removed" ? "bg-neutral-50/50" : tone}`}>
                <Gutter number={row.rightNo} tone="text-neutral-300" />
                <span className="whitespace-pre-wrap break-all text-neutral-800">
                  <Line text={row.right} parts={row.words?.right} highlight="bg-emerald-200/70" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {expanded && hidden > 0 && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full px-4 py-2 text-[11px] text-neutral-400 hover:text-neutral-700 border-t border-neutral-100 transition-colors"
        >
          Collapse unchanged lines
        </button>
      )}
    </div>
  );
}
