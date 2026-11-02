import { Marked } from "marked";
import { NOTES_REPO, REPO_URL } from "./source.js";

/**
 * Markdown rendering for content fetched at runtime.
 *
 * This is a meaningfully different trust position from the blog's markdown,
 * which Vite inlines at build time from this repository. These files arrive
 * over the network from a *different* repository and go straight into
 * dangerouslySetInnerHTML, so four things are enforced here:
 *
 *   1. Raw HTML in the source is dropped rather than passed through. Study
 *      notes have no need for it.
 *   2. Every value interpolated into an attribute is escaped. Overriding
 *      marked's renderer means losing the escaping its default one does, and
 *      an unescaped `"` in a link title or image alt closes the attribute and
 *      opens the next one - `![x" onerror="...](a.png)` is enough.
 *   3. URLs are checked against a scheme allow-list. Being absolute is not the
 *      same as being safe: `javascript:alert(1)` is a perfectly well-formed
 *      absolute URL, and it is a link the reader can click.
 *   4. Relative links are rewritten to absolute GitHub URLs, because a link to
 *      `./02-core-tables.sql` means nothing once the file is being read here.
 */

const RAW_BASE = `https://raw.githubusercontent.com/${NOTES_REPO.owner}/${NOTES_REPO.name}/${NOTES_REPO.branch}/`;
const BLOB_BASE = `${REPO_URL}/blob/${NOTES_REPO.branch}/`;

const isAbsolute = (url) => /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

/** Escape a value being placed inside a double-quoted HTML attribute. */
const escapeAttr = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Null unless the URL resolves to something we are willing to emit.
 *
 * Parsing rather than pattern-matching is deliberate: the URL parser strips the
 * tabs and newlines browsers also ignore, so `java\nscript:` cannot slip a
 * scheme past a regex that a browser would then honour. Images get a tighter
 * list than links - a note has no reason to inline a `data:` image, and `mailto:`
 * in an `img src` is meaningless.
 */
function safeUrl(url, allowed) {
  if (typeof url !== "string") return null;
  if (url.startsWith("#")) return url;

  try {
    const parsed = new URL(url, BLOB_BASE);
    return allowed.includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

const LINK_SCHEMES = ["http:", "https:", "mailto:"];
const IMAGE_SCHEMES = ["http:", "https:"];

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
      // Drop raw HTML entirely - both block-level and inline.
      html: () => "",

      link({ href, title, tokens }) {
        // Already HTML, and produced by this same renderer, so nested raw HTML
        // is dropped on the way through and this must not be escaped again.
        const label = this.parser.parseInline(tokens);
        const resolved = isAbsolute(href) ? href : `${BLOB_BASE}${resolveFrom(directory, href)}`;
        const target = safeUrl(resolved, LINK_SCHEMES);

        // A link we won't emit still has text worth reading, so keep the label
        // and drop only the href.
        if (target === null) return label;

        const external = !target.startsWith("#");
        return `<a href="${escapeAttr(target)}"${title ? ` title="${escapeAttr(title)}"` : ""}${
          external ? ' target="_blank" rel="noopener noreferrer"' : ""
        }>${label}</a>`;
      },

      image({ href, title, text }) {
        const resolved = isAbsolute(href) ? href : `${RAW_BASE}${resolveFrom(directory, href)}`;
        const target = safeUrl(resolved, IMAGE_SCHEMES);

        // No src worth emitting, so fall back to the alt text the author wrote.
        if (target === null) return escapeAttr(text);

        return `<img src="${escapeAttr(target)}" alt="${escapeAttr(text)}"${
          title ? ` title="${escapeAttr(title)}"` : ""
        } loading="lazy" />`;
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
 * filename doesn't - and either way it leaves the body, so it isn't printed
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
