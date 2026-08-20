import { useMemo, useRef } from "react";

/**
 * The input side: a plain textarea with a line-number gutter beside it.
 *
 * A textarea rather than a real editor widget on purpose. It keeps native
 * undo, native spell-check control, native selection, native mobile keyboards
 * and native accessibility — all of which a contenteditable re-implementation
 * gets subtly wrong, and none of which is worth losing for syntax colour on the
 * side you are pasting into rather than reading.
 *
 * Soft wrapping is off so that one visual row is always one logical line;
 * otherwise the numbers beside it are fiction the moment a line gets long.
 */

/** "1\n2\n3" without building an array of a hundred thousand strings. */
function range(from, to) {
  let text = "";
  for (let index = from; index <= to; index += 1) text += index > from ? `\n${index}` : `${index}`;
  return text;
}

function Gutter({ count, errorLine, gutterRef }) {
  const parts = useMemo(() => {
    if (!errorLine || errorLine < 1 || errorLine > count) return { head: range(1, count), tail: "" };
    return {
      head: errorLine > 1 ? `${range(1, errorLine - 1)}\n` : "",
      marked: String(errorLine),
      tail: errorLine < count ? `\n${range(errorLine + 1, count)}` : "",
    };
  }, [count, errorLine]);

  return (
    <pre
      ref={gutterRef}
      aria-hidden="true"
      className="w-11 shrink-0 select-none overflow-hidden border-r border-neutral-100 bg-neutral-50/70 py-3 pr-2 text-right font-mono text-[12.5px] leading-5 text-neutral-300 tabular-nums"
    >
      {parts.head}
      {parts.marked && <span className="font-medium text-rose-500">{parts.marked}</span>}
      {parts.tail}
    </pre>
  );
}

export default function Editor({ value, onChange, errorLine, textareaRef, onFile, placeholder }) {
  const gutterRef = useRef(null);
  const lineCount = useMemo(() => {
    let count = 1;
    for (let index = 0; index < value.length; index += 1) if (value[index] === "\n") count += 1;
    return count;
  }, [value]);

  return (
    <div className="flex h-full">
      <Gutter count={lineCount} errorLine={errorLine} gutterRef={gutterRef} />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => {
          if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFile?.(event.dataTransfer.files?.[0]);
        }}
        wrap="off"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label="JSON input"
        placeholder={placeholder}
        className="h-full w-full resize-none bg-transparent py-3 pl-3 pr-4 font-mono text-[12.5px] leading-5 text-neutral-800 placeholder:text-neutral-300 focus:outline-none"
      />
    </div>
  );
}
