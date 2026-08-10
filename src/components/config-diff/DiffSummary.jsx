import { KINDS } from "../../lib/config-diff/diff";
import { KIND_META } from "../../lib/config-diff/format";

/**
 * Counts that double as filters. Every kind is always listed, including the
 * zeroes — a "0 removed" reads as a fact, while a missing row reads as a bug.
 */
export default function DiffSummary({ summary, active, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {KINDS.map((kind) => {
        const meta = KIND_META[kind];
        const count = summary[kind] ?? 0;
        const on = active.has(kind);

        return (
          <button
            key={kind}
            onClick={() => onToggle(kind)}
            aria-pressed={on}
            disabled={count === 0}
            className={`group flex items-center gap-2 rounded-full border pl-2 pr-3 py-1.5 text-xs transition-colors disabled:opacity-40 disabled:pointer-events-none ${
              on ? meta.tone : "border-neutral-200 text-neutral-400 bg-white"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${on ? meta.dot : "bg-neutral-200"}`} />
            <span className="tabular-nums font-medium">{count}</span>
            <span>{meta.label.toLowerCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
