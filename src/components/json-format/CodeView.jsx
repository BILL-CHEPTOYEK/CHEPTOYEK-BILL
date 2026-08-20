import { useMemo } from "react";
import { tokenize, toLines } from "../../lib/json-format/tokenize";

/**
 * The formatted document, highlighted.
 *
 * The gutter and the code live in one scroll container with the gutter stuck to
 * the left edge, so vertical scrolling needs no synchronisation at all and
 * horizontal scrolling slides the code out from under numbers that stay put.
 */

// Past this it stops being something you read and starts being something you
// copy, and thirty thousand spans is a frozen tab. The text is still exact.
const HIGHLIGHT_LINE_LIMIT = 5000;

const TOKEN_CLASS = {
  string: "text-emerald-700",
  number: "text-sky-700",
  literal: "text-violet-700",
  punctuation: "text-neutral-300",
  whitespace: "",
  error: "rounded bg-rose-50 text-rose-600",
};

function Line({ tokens }) {
  return (
    <div className="min-h-5">
      {tokens.map((token, index) => (
        <span
          key={index}
          className={token.key ? "font-medium text-neutral-800" : TOKEN_CLASS[token.type]}
        >
          {token.value}
        </span>
      ))}
    </div>
  );
}

function Numbers({ count }) {
  const text = useMemo(() => {
    let out = "";
    for (let index = 1; index <= count; index += 1) out += index > 1 ? `\n${index}` : "1";
    return out;
  }, [count]);

  return (
    <pre
      aria-hidden="true"
      className="sticky left-0 z-10 w-11 shrink-0 select-none border-r border-neutral-100 bg-neutral-50/90 py-3 pr-2 text-right font-mono text-[12.5px] leading-5 text-neutral-300 tabular-nums backdrop-blur-sm"
    >
      {text}
    </pre>
  );
}

export default function CodeView({ text }) {
  const lines = useMemo(() => {
    const lineCount = text.split("\n").length;
    if (lineCount > HIGHLIGHT_LINE_LIMIT) return null;
    return toLines(tokenize(text));
  }, [text]);

  if (!lines) {
    return (
      <div className="h-full overflow-auto">
        <pre className="p-3 font-mono text-[12.5px] leading-5 text-neutral-700">{text}</pre>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="flex min-w-max">
        <Numbers count={lines.length} />
        <pre className="py-3 pl-3 pr-6 font-mono text-[12.5px] leading-5 text-neutral-700">
          {lines.map((tokens, index) => (
            <Line key={index} tokens={tokens} />
          ))}
        </pre>
      </div>
    </div>
  );
}
