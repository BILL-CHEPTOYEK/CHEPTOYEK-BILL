import { useState } from "react";

/**
 * Valid JSON that didn't survive being parsed.
 *
 * Deliberately not an error — the document is legal and the output is real. But
 * a duplicate key is silently dropped and an oversized integer is silently
 * rounded, and a formatter that shows you the rounded number without saying so
 * has quietly become the bug.
 */

function Row({ children }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1 font-mono text-[11.5px] leading-5">
      {children}
    </li>
  );
}

export default function Warnings({ duplicates, unsafeNumbers, truncated }) {
  const [open, setOpen] = useState(false);
  const total = duplicates.length + unsafeNumbers.length;
  if (total === 0) return null;

  const headline = [
    duplicates.length &&
      `${duplicates.length} duplicate key${duplicates.length === 1 ? "" : "s"}`,
    unsafeNumbers.length &&
      `${unsafeNumbers.length} number${unsafeNumbers.length === 1 ? "" : "s"} past the safe integer range`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
        <p className="text-sm text-neutral-800">
          Parsing changed this document.{" "}
          <span className="text-neutral-500">{headline}</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto shrink-0 text-[11px] text-neutral-500 transition-colors hover:text-neutral-900"
        >
          {open ? "Hide" : "Show"} details
        </button>
      </div>

      {open && (
        <div className="mt-3 border-t border-amber-200/70 pt-2">
          <ul>
            {duplicates.map((entry) => (
              <Row key={`d-${entry.path}-${entry.line}`}>
                <span className="text-neutral-800">{entry.path}</span>
                <span className="font-sans text-neutral-500">
                  line {entry.line} — declared more than once; only the last value is kept
                </span>
              </Row>
            ))}

            {unsafeNumbers.map((entry) => (
              <Row key={`n-${entry.path}-${entry.line}`}>
                <span className="text-neutral-800">{entry.path}</span>
                <span className="text-neutral-500">
                  {entry.literal} → {entry.parsed}
                </span>
                <span className="font-sans text-neutral-500">
                  line {entry.line} — beyond 2⁵³, so the value shifted
                </span>
              </Row>
            ))}
          </ul>

          {truncated && (
            <p className="mt-2 font-sans text-[11px] text-neutral-400">
              Only the first few of each are listed.
            </p>
          )}

          <p className="mt-2 max-w-prose font-sans text-[11px] leading-relaxed text-neutral-500">
            Both are properties of JSON itself, not of this page: the spec allows repeated keys and
            leaves the winner to the parser, and JSON numbers have no size limit while JavaScript
            numbers do. If the large values are IDs, whatever produced them should be sending them as
            strings.
          </p>
        </div>
      )}
    </div>
  );
}
