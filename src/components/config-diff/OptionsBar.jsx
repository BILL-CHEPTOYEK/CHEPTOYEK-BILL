const STRUCTURED_TOGGLES = [
  {
    key: "ignoreArrayOrder",
    label: "Ignore array order",
    hint: "Match list items by content instead of position.",
  },
  {
    key: "caseInsensitiveKeys",
    label: "Ignore key case",
    hint: "DB_HOST and db_host become the same key, reported as a rename.",
  },
  {
    key: "looseTypes",
    label: "Ignore type-only diffs",
    hint: 'Treat 8080 and "8080" as equal — useful when one side came from .env.',
  },
  {
    key: "maskSecrets",
    label: "Mask secrets",
    hint: "Hide values whose key looks like a password, token or API key.",
  },
];

const TEXT_TOGGLES = [
  {
    key: "ignoreWhitespace",
    label: "Ignore whitespace",
    hint: "Indentation, trailing spaces and repeated spaces stop counting as changes.",
  },
  {
    key: "ignoreCase",
    label: "Ignore case",
    hint: "Compare lines case-insensitively.",
  },
  {
    key: "splitView",
    label: "Side by side",
    hint: "Two columns instead of a unified list.",
  },
];

function Toggle({ active, label, hint, onClick }) {
  return (
    <button
      onClick={onClick}
      title={hint}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
        active
          ? "bg-neutral-900 text-white border-neutral-900"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * The options that change what counts as a difference.
 *
 * Which set is shown follows the mode, because the two engines have nothing in
 * common: "ignore array order" is meaningless for a Java file, and "ignore
 * whitespace" is meaningless once a document has been parsed.
 */
export default function OptionsBar({ options, onChange, mode }) {
  const toggles = mode === "text" ? TEXT_TOGGLES : STRUCTURED_TOGGLES;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {toggles.map((toggle) => (
        <Toggle
          key={toggle.key}
          label={toggle.label}
          hint={toggle.hint}
          active={options[toggle.key]}
          onClick={() => onChange({ ...options, [toggle.key]: !options[toggle.key] })}
        />
      ))}

      {mode !== "text" && (
        <div className="flex items-center gap-2 flex-1 min-w-[15rem]">
          <input
            value={options.ignorePathsRaw}
            onChange={(event) => onChange({ ...options, ignorePathsRaw: event.target.value })}
            placeholder="Ignore paths — metadata.**, *.timestamp"
            title="Comma-separated globs. * matches one segment, ** matches any depth."
            className="w-full rounded-full border border-neutral-200 px-4 py-1.5 font-mono text-xs text-neutral-700 placeholder:font-sans placeholder:text-neutral-300 focus:border-neutral-400 focus:outline-none transition-colors"
          />
        </div>
      )}
    </div>
  );
}
