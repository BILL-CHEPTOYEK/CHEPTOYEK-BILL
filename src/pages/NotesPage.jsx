import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getNoteIndex, groupBySection, REPO_URL } from "../notes/source";

function SectionBlock({ section, index }) {
  return (
    <section className="mt-12 first:mt-10">
      <div className="flex items-baseline gap-3">
        <span className="text-xs tabular-nums text-neutral-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="text-xl font-heathergreen text-neutral-900">{section.name}</h2>
        <span className="text-xs text-neutral-300">
          {section.entries.length} {section.entries.length === 1 ? "note" : "notes"}
        </span>
      </div>

      <ul className="mt-4 border-t border-neutral-100">
        {section.entries.map((entry) => (
          <li key={entry.slug}>
            <Link
              to={`/notes/${entry.slug}`}
              className="group flex items-baseline gap-4 py-3.5 border-b border-neutral-100 hover:bg-white transition-colors"
            >
              <span className="flex-1 text-[0.95rem] text-neutral-800 group-hover:text-neutral-500 transition-colors">
                {entry.title}
              </span>
              {entry.language === "sql" && (
                <span className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 border border-neutral-200 rounded-full px-2 py-0.5">
                  SQL
                </span>
              )}
              <span className="font-mono text-[11px] text-neutral-300 hidden sm:block">
                {entry.path}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function NotesPage() {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    getNoteIndex({ signal: controller.signal })
      .then(({ entries, cached }) =>
        setState({ status: "ready", sections: groupBySection(entries), count: entries.length, cached })
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", error });
      });

    return () => controller.abort();
  }, []);

  return (
    <PageShell
      eyebrow="Notes"
      title="Accounting, for software engineers"
      subtitle="Working notes on double-entry bookkeeping from the point of view of someone who has to model it in a database — the accounting equation, the chart of accounts, and what a transaction actually looks like once it's a set of rows. Written while learning, so they read like notes rather than a textbook."
    >
      {state.status === "loading" && (
        <p className="mt-14 text-sm text-neutral-400">Loading the index from GitHub…</p>
      )}

      {state.status === "error" && (
        <div className="mt-14 rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-800">The index didn't load.</p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">{state.error.message}</p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500">
            This site has no backend to fetch through and no token to raise the limit, so there is
            nothing to fall back to.{" "}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 border-b border-neutral-300 hover:border-neutral-900 transition-colors"
            >
              The notes are readable on GitHub ↗
            </a>
          </p>
        </div>
      )}

      {state.status === "ready" && (
        <>
          {state.sections.map((section, index) => (
            <SectionBlock key={section.slug} section={section} index={index} />
          ))}

          <div className="mt-16 pt-8 border-t border-neutral-200">
            <p className="text-sm leading-relaxed text-neutral-500 max-w-2xl">
              {state.count} files, read straight out of the repository at the moment you loaded this
              page — nothing is copied into this site, so the notes here and the notes on GitHub
              cannot drift apart. The same repo also contains a working double-entry accounting
              application, which is the part these notes are the reasoning for.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 hover:border-neutral-300 transition-colors"
            >
              Browse the repository ↗
            </a>
          </div>
        </>
      )}
    </PageShell>
  );
}
