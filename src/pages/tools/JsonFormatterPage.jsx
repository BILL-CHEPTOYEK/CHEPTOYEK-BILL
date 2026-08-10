import { useState } from "react";
import PageShell from "../../components/PageShell";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const format = (spacing) => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, spacing));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clear = () => {
    setInput("");
    setError("");
  };

  return (
    <PageShell
      backTo="/tools"
      backLabel="Tools"
      title="JSON formatter"
      subtitle="Paste JSON below. Runs entirely in your browser — nothing is sent anywhere."
    >
      <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => format(2)}
            className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Format
          </button>
          <button
            onClick={() => format(0)}
            className="px-5 py-2 border border-neutral-300 text-neutral-700 rounded-full text-sm font-medium hover:border-neutral-500 transition-colors"
          >
            Minify
          </button>
          <button
            onClick={copy}
            disabled={!input}
            className="px-5 py-2 border border-neutral-300 text-neutral-700 rounded-full text-sm font-medium hover:border-neutral-500 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={clear}
            className="px-5 py-2 text-neutral-400 text-sm hover:text-neutral-700 transition-colors"
          >
            Clear
          </button>
        </div>

      {error && <p className="mt-4 text-sm text-red-500">Invalid JSON — {error}</p>}

      <textarea
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setError("");
        }}
        spellCheck={false}
        placeholder='{ "hello": "world" }'
        className="mt-6 w-full h-[28rem] resize-y rounded-xl border border-neutral-200 bg-white p-5 font-mono text-sm text-neutral-800 leading-relaxed focus:outline-none focus:border-neutral-400 transition-colors"
      />
    </PageShell>
  );
}
