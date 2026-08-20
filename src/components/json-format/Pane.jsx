/**
 * The chrome both panes share. Extracted so that "input" and "output" are
 * visibly the same kind of object — the moment their headers drift apart by two
 * pixels the split stops reading as one tool.
 */

export function Pane({ children }) {
  return (
    <section className="flex h-[26rem] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white md:h-[32rem] xl:h-[38rem]">
      {children}
    </section>
  );
}

export function PaneHeader({ label, children }) {
  return (
    <header className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-b border-neutral-100 px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">{label}</span>
      {children}
    </header>
  );
}

export function PaneBody({ children }) {
  return <div className="relative min-h-0 flex-1">{children}</div>;
}

export function PaneFooter({ children }) {
  return (
    <footer className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1 border-t border-neutral-100 px-3 py-1.5 text-[11px] text-neutral-400">
      {children}
    </footer>
  );
}

/** A quiet text button. Used for every pane-local action. */
export function PaneAction({ children, onClick, disabled, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-full px-2 py-1 text-xs text-neutral-400 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/** A row of mutually exclusive choices, sized to sit inside a pane header. */
export function Segmented({ label, options, value, onChange }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex overflow-hidden rounded-full border border-neutral-200"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={value === option.id}
          title={option.title}
          className={`px-2.5 py-1 text-xs transition-colors ${
            value === option.id
              ? "bg-neutral-900 text-white"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** An on/off pill, styled to match a selected segment when it is on. */
export function Toggle({ children, pressed, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      title={title}
      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
        pressed
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
      }`}
    >
      {children}
    </button>
  );
}
