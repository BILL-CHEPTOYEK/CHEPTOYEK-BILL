/**
 * What the output pane shows when the input doesn't parse.
 *
 * It sits where the result would have been, because that's where you're already
 * looking. Three things, in the order you need them: what went wrong in words,
 * the line it happened on with a caret under the character, and — when the
 * mistake is one of the mechanical ones — a button that fixes it.
 */

export default function ErrorCard({ error, repair, onRepair, onJump }) {
  const { cause, line, column, lineText, message } = error;

  // Long lines would push the caret off the right edge, so the excerpt is a
  // window around the column rather than the whole line.
  const start = Math.max(0, column - 60);
  const excerpt = lineText.slice(start, start + 120);
  const caret = Math.max(0, column - 1 - start);

  return (
    <div className="h-full overflow-auto px-5 py-6">
      <div className="flex items-baseline gap-2.5">
        <span className="inline-block h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-rose-500" />
        <h2 className="text-[15px] text-neutral-900">{cause?.title ?? "Invalid JSON"}</h2>
        <button
          type="button"
          onClick={onJump}
          className="ml-auto shrink-0 rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
        >
          Line {line}, column {column}
        </button>
      </div>

      <p className="mt-2.5 max-w-prose pl-4 text-sm leading-relaxed text-neutral-600">
        {cause?.detail ?? message}
      </p>

      {lineText.trim() && (
        <pre className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-[12.5px] leading-5 text-neutral-700">
          <span className="mr-3 select-none text-neutral-300 tabular-nums">{line}</span>
          {start > 0 && <span className="text-neutral-300">…</span>}
          {excerpt}
          {"\n"}
          <span className="select-none text-rose-500">
            {" ".repeat(String(line).length + 3 + (start > 0 ? 1 : 0) + caret)}▲
          </span>
        </pre>
      )}

      {repair ? (
        <div className="mt-5 rounded-xl border border-neutral-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRepair}
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Repair and format
            </button>
            <span className="text-[11px] text-neutral-400">
              Rewrites the input — your original is one undo away.
            </span>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {repair.fixes.map((fix) => (
              <li
                key={fix}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-500"
              >
                {fix}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 text-[11px] leading-relaxed text-neutral-400">
          {message}
        </p>
      )}
    </div>
  );
}
