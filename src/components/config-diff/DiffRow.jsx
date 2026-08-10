import { formatPath } from "../../lib/config-diff/diff";
import { formatValue, isSecretPath, typeLabel, KIND_META } from "../../lib/config-diff/format";

function Value({ value, tone, masked }) {
  return (
    <span
      className={`inline-block max-w-full truncate rounded px-1.5 py-0.5 font-mono text-[12px] ${tone}`}
      title={masked ? "masked" : String(formatValue(value))}
    >
      {formatValue(value, { masked })}
    </span>
  );
}

const REMOVED_TONE = "bg-rose-50 text-rose-800";
const ADDED_TONE = "bg-emerald-50 text-emerald-800";

/**
 * A single difference. The value pair is the point, so it gets the width; the
 * symbol and the type chip stay out of its way.
 */
export default function DiffRow({ change, label, depth = 0, maskSecrets }) {
  const meta = KIND_META[change.kind];
  const masked = maskSecrets && isSecretPath(change.path);
  const typeShift = change.leftType !== change.rightType && change.kind !== "added" && change.kind !== "removed";

  return (
    <div
      className="flex items-start gap-3 px-4 py-2.5 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/70 transition-colors"
      style={{ paddingLeft: 16 + depth * 18 }}
    >
      <span
        aria-label={meta.label}
        className={`mt-0.5 shrink-0 w-5 h-5 rounded border text-[11px] leading-none flex items-center justify-center font-mono ${meta.tone}`}
      >
        {meta.symbol}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="font-mono text-[12.5px] text-neutral-900 break-all"
            title={formatPath(change.path)}
          >
            {label}
          </span>
          {typeShift && (
            <span className="text-[10px] font-mono text-neutral-400 border border-neutral-200 rounded px-1">
              {typeLabel(change.leftType)} → {typeLabel(change.rightType)}
            </span>
          )}
          {masked && <span className="text-[10px] text-neutral-400">masked</span>}
        </div>

        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {change.kind === "moved" ? (
            <span className="font-mono text-[12px] text-neutral-600">
              index {change.left} → {change.right}
            </span>
          ) : (
            <>
              {change.kind !== "added" && (
                <Value value={change.left} tone={REMOVED_TONE} masked={masked} />
              )}
              {change.kind === "changed" || change.kind === "type" ? (
                <span className="text-neutral-300 text-xs">→</span>
              ) : null}
              {change.kind !== "removed" && (
                <Value value={change.right} tone={ADDED_TONE} masked={masked} />
              )}
            </>
          )}

          {change.note && <span className="text-[11px] text-neutral-400">{change.note}</span>}
        </div>
      </div>
    </div>
  );
}
