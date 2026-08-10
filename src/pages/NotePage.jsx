import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getNoteIndex, getNoteContent, REPO_URL } from "../notes/source";
import { renderNote, extractTitle } from "../notes/render";

/** Previous and next in reading order, so the series can be read straight through. */
function neighbours(entries, slug) {
  const index = entries.findIndex((entry) => entry.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: entries[index - 1] ?? null,
    next: entries[index + 1] ?? null,
  };
}

export default function NotePage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    (async () => {
      try {
        // The index is cached for the session, so arriving here directly costs
        // the same two requests as arriving from the listing.
        const { entries } = await getNoteIndex({ signal: controller.signal });
        const entry = entries.find((candidate) => candidate.slug === slug);

        if (!entry) {
          setState({ status: "missing" });
          return;
        }

        const markdown = await getNoteContent(entry, { signal: controller.signal });
        const { title, body } = extractTitle(markdown, entry.title);

        setState({
          status: "ready",
          entry,
          title,
          html: renderNote(body, entry),
          ...neighbours(entries, slug),
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setState({ status: "error", error });
      }
    })();

    return () => controller.abort();
  }, [slug]);

  if (state.status === "loading") {
    return (
      <PageShell backTo="/notes" backLabel="Notes" title="Loading…">
        <p className="mt-6 text-sm text-neutral-400">Fetching from GitHub.</p>
      </PageShell>
    );
  }

  if (state.status === "missing") {
    return (
      <PageShell backTo="/notes" backLabel="Notes" title="Note not found">
        <p className="mt-4 text-neutral-500">
          There's no note with that name. It may have been renamed in the repository — the index is
          built from whatever is there right now.
        </p>
      </PageShell>
    );
  }

  if (state.status === "error") {
    return (
      <PageShell backTo="/notes" backLabel="Notes" title="Couldn't load that note">
        <p className="mt-4 text-neutral-500">{state.error.message}</p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-sm text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 transition-colors"
        >
          Read it on GitHub ↗
        </a>
      </PageShell>
    );
  }

  const { entry, previous, next } = state;

  return (
    <PageShell
      backTo="/notes"
      backLabel="Notes"
      width="max-w-4xl"
      eyebrow={entry.section}
      title={state.title}
    >
      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
        <span className="font-mono">{entry.path}</span>
        <a
          href={entry.blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-neutral-200 hover:border-neutral-700 hover:text-neutral-700 transition-colors"
        >
          View source ↗
        </a>
      </p>

      <div className="doc-content mt-10" dangerouslySetInnerHTML={{ __html: state.html }} />

      <nav className="mt-20 pt-8 border-t border-neutral-200 grid gap-4 sm:grid-cols-2">
        {previous ? (
          <Link to={`/notes/${previous.slug}`} className="group">
            <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">Previous</span>
            <span className="mt-1 block text-sm text-neutral-800 group-hover:text-neutral-500 transition-colors">
              ← {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next && (
          <Link to={`/notes/${next.slug}`} className="group sm:text-right">
            <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">Next</span>
            <span className="mt-1 block text-sm text-neutral-800 group-hover:text-neutral-500 transition-colors">
              {next.title} →
            </span>
          </Link>
        )}
      </nav>
    </PageShell>
  );
}
