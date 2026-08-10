import { useState } from "react";
import { FLOWS } from "../../architecture/model.js";

function TransportButton({ label, onClick, disabled, children, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={
        primary
          ? "w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors disabled:opacity-30"
          : "w-9 h-9 rounded-full border border-neutral-200 text-neutral-500 flex items-center justify-center hover:border-neutral-400 hover:text-neutral-800 transition-colors disabled:opacity-25 disabled:pointer-events-none"
      }
    >
      {children}
    </button>
  );
}

/**
 * The scenario chips.
 *
 * Kept separate from the narration below so that choosing a flow never moves
 * the diagram — the thing you are about to watch should not jump down the page
 * at the moment you ask to watch it.
 */
export function FlowPicker({ player }) {
  const { flow, flowId } = player;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-400 mr-1">
          Trace a request
        </span>
        {FLOWS.map((item, i) => {
          const selected = item.id === flowId;
          return (
            <button
              key={item.id}
              onClick={() => player.selectFlow(item.id)}
              aria-pressed={selected}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selected
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
              }`}
            >
              <span className="tabular-nums opacity-50 mr-1.5">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-neutral-400">
        {flow
          ? flow.question
          : "Pick a scenario and the diagram will walk it hop by hop. Or click any box to read why it's there."}
      </p>
    </div>
  );
}

/**
 * Transport controls and step narration. Renders directly beneath the diagram,
 * so the wire that just lit up and the sentence explaining it are in view at
 * the same time.
 */
export default function FlowNarration({ player }) {
  const { flow, steps, step, stepIndex, lastIndex, playing } = player;
  const [copied, setCopied] = useState(false);

  // The URL already carries the flow and step, so sharing is just handing over
  // the address bar.
  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!flow) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-400">{flow.label}</p>
        <div className="shrink-0 flex items-center gap-4">
          <button
            onClick={share}
            className="text-[11px] tracking-[0.15em] uppercase text-neutral-400 hover:text-neutral-800 transition-colors"
          >
            {copied ? "Copied ✓" : "Link to step"}
          </button>
          <button
            onClick={player.exit}
            className="text-[11px] tracking-[0.15em] uppercase text-neutral-300 hover:text-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Segmented progress — each segment is also a jump target. */}
      <div className="mt-5 flex items-center gap-1.5">
        {steps.map((item, i) => (
          <button
            key={i}
            onClick={() => player.goTo(i)}
            aria-label={`Step ${i + 1}: ${item.title}`}
            aria-current={i === stepIndex}
            className="group flex-1 py-2"
          >
            <span
              className={`block h-0.5 rounded-full transition-colors ${
                i < stepIndex
                  ? "bg-neutral-400"
                  : i === stepIndex
                    ? "bg-neutral-900"
                    : "bg-neutral-200 group-hover:bg-neutral-300"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <TransportButton label="Previous step" onClick={player.prev} disabled={stepIndex === 0}>
            ‹
          </TransportButton>
          <TransportButton label={playing ? "Pause" : "Play"} onClick={player.toggle} primary>
            {playing ? "❚❚" : "▶"}
          </TransportButton>
          <TransportButton label="Next step" onClick={player.next} disabled={stepIndex === lastIndex}>
            ›
          </TransportButton>
        </div>

        <div className="min-h-[5.5rem]">
          <p className="text-[11px] tracking-[0.18em] uppercase text-neutral-400 tabular-nums">
            {String(stepIndex + 1).padStart(2, "0")} / {String(lastIndex + 1).padStart(2, "0")}
            <span className="mx-2 text-neutral-200">—</span>
            <span className="text-neutral-700">{step?.title}</span>
          </p>
          <p className="mt-2 text-sm md:text-[0.95rem] leading-relaxed text-neutral-600">
            {step?.text}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-neutral-300">
        Arrow keys step. Space plays and pauses. The URL tracks where you are.
      </p>
    </div>
  );
}
