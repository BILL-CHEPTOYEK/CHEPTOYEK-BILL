import { Marked } from "marked";
import { NOTES_REPO, REPO_URL } from "./source.js";

/**
 * Markdown rendering for content fetched at runtime.
 *
 * This is a meaningfully different trust position from the blog's markdown,
 * which Vite inlines at build time from this repository. These files arrive
 * over the network from a *different* repository and go straight into
 * dangerouslySetInnerHTML, so two things are enforced here:
 *
 *   1. Raw HTML in the source is dropped rather than passed through. Study
 *      notes have no need for it, and it is the only route to script execution.
 *   2. Relative links are rewritten to absolute GitHub URLs, because a link to
 *      `./02-core-tables.sql` means nothing once the file is being read here.
 */

const RAW_BASE = `https://raw.githubusercontent.com/${NOTES_REPO.owner}/${NOTES_REPO.name}/${NOTES_REPO.branch}/`;
const BLOB_BASE = `${REPO_URL}/blob/${NOTES_REPO.branch}/`;

const isAbsolute = (url) => /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

/** Resolve a repo-relative path against the directory the note lives in. */
function resolveFrom(directory, target) {
  const segments = `${directory ? `${directory}/` : ""}${target}`.split("/");
  const stack = [];

  segments.forEach((segment) => {
    if (segment === "." || segment === "") return;
    if (segment === "..") stack.pop();
    else stack.push(segment);
  });

  return stack.join("/");
}

export function renderNote(markdown, entry) {
  const directory = entry.path.split("/").slice(0, -1).join("/");

  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      // Drop raw HTML entirely — both block-level and inline.
      html: () => "",

      link({ href, title, text }) {
        const target = isAbsolute(href) ? href : `${BLOB_BASE}${resolveFrom(directory, href)}`;
        const external = !target.startsWith("#");
        return `<a href="${target}"${title ? ` title="${title}"` : ""}${
          external ? ' target="_blank" rel="noopener noreferrer"' : ""
        }>${text}</a>`;
      },

      image({ href, title, text }) {
        const target = isAbsolute(href) ? href : `${RAW_BASE}${resolveFrom(directory, href)}`;
        return `<img src="${target}" alt="${text}"${title ? ` title="${title}"` : ""} loading="lazy" />`;
      },
    },
  });

  return marked.parse(markdown);
}

const normalise = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Split a leading `# heading` off the body, and decide which title to show.
 *
 * These files mostly repeat their own filename as the H1
 * (`# 02-The-Accounting-Equation`), which is a worse title than the tidied-up
 * filename. So the heading is preferred only when it says something the
 * filename doesn't — and either way it leaves the body, so it isn't printed
 * twice under the page title.
 */
export function extractTitle(markdown, fallbackTitle) {
  const match = /^\s*#\s+(.+?)\s*$/m.exec(markdown);
  if (!match || markdown.slice(0, match.index).trim() !== "") {
    return { title: fallbackTitle, body: markdown };
  }

  const heading = match[1];
  const body = markdown.slice(match.index + match[0].length);
  const isEchoOfFilename = normalise(heading) === normalise(fallbackTitle);

  return { title: isEchoOfFilename ? fallbackTitle : heading, body };
}
