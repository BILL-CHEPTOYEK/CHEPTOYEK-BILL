/**
 * Reading material pulled straight out of a GitHub repository.
 *
 * The notes live in their own repo because that is where they are written and
 * revised. Copying them into this one would create two copies to keep in sync
 * and a deploy between writing and publishing, so instead the structure is
 * derived from the repo's file tree and the prose is fetched on demand.
 *
 * Two hosts are involved, and they behave differently:
 *   api.github.com          — the file tree. Rate limited to 60/hour/IP.
 *   raw.githubusercontent.com — the file contents. Not rate limited the same
 *                               way, and it does send CORS headers, so a plain
 *                               fetch() works (unlike the Blogger feed).
 */

export const NOTES_REPO = {
  owner: "BILL-CHEPTOYEK",
  name: "Accounting-for-software-engineers-Resources",
  branch: "main",
};

export const REPO_URL = `https://github.com/${NOTES_REPO.owner}/${NOTES_REPO.name}`;

const TREE_URL = `https://api.github.com/repos/${NOTES_REPO.owner}/${NOTES_REPO.name}/git/trees/${NOTES_REPO.branch}?recursive=1`;
const rawUrl = (path) =>
  `https://raw.githubusercontent.com/${NOTES_REPO.owner}/${NOTES_REPO.name}/${NOTES_REPO.branch}/${path}`;
const blobUrl = (path) => `${REPO_URL}/blob/${NOTES_REPO.branch}/${path}`;

/**
 * Directories that hold the reference application rather than the notes. The
 * app is worth linking to, not worth paginating through as prose.
 */
const EXCLUDED = [/^04-Application\//, /^\.devcontainer\//, /^\.github\//];

const READABLE = /\.(md|sql)$/i;

/** `01-Foundations` → `Foundations`, `02-The-Accounting-Equation` → `The Accounting Equation`. */
function humanise(segment) {
  return segment
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Session-scoped memo. The tree costs a rate-limited request; the notes don't change mid-visit. */
const CACHE_KEY = "notes-index-v1";

function readCache() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Private mode, quota, whatever — the cache is an optimisation, not a
    // dependency. Losing it costs one extra request.
  }
}

function toEntry(path, order) {
  const segments = path.split("/");
  const file = segments.pop();
  const folder = segments[0] ?? null;

  const isRoot = segments.length === 0;
  const sectionName = isRoot ? "Start here" : titleCase(humanise(folder));
  const title = isRoot && /^readme/i.test(file) ? "Overview" : titleCase(humanise(file));

  return {
    path,
    title,
    slug: slugify(title),
    section: sectionName,
    sectionSlug: slugify(sectionName),
    language: file.toLowerCase().endsWith(".sql") ? "sql" : "markdown",
    order,
    rawUrl: rawUrl(path),
    blobUrl: blobUrl(path),
  };
}

/**
 * Fetch the note index.
 *
 * Order comes from the repo's numeric filename prefixes, which is why they are
 * there — the sequence is part of the content, not decoration.
 */
export async function getNoteIndex({ signal } = {}) {
  const cached = readCache();
  if (cached) return { entries: cached, cached: true };

  const response = await fetch(TREE_URL, { signal });

  if (!response.ok) {
    const rateLimited =
      response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
    const error = new Error(
      rateLimited
        ? "GitHub's unauthenticated rate limit (60 requests/hour) is exhausted for this IP."
        : `GitHub returned ${response.status} ${response.statusText}.`
    );
    error.rateLimited = rateLimited;
    throw error;
  }

  const data = await response.json();

  const entries = (data.tree ?? [])
    .filter((node) => node.type === "blob")
    .map((node) => node.path)
    .filter((path) => READABLE.test(path))
    .filter((path) => !EXCLUDED.some((pattern) => pattern.test(path)))
    // Root-level files first — the repo's README is the introduction, and a
    // plain path sort buries it under every numbered folder.
    .sort((a, b) => {
      const rootA = a.includes("/") ? 1 : 0;
      const rootB = b.includes("/") ? 1 : 0;
      return rootA - rootB || a.localeCompare(b);
    })
    .map(toEntry);

  // De-duplicate slugs by falling back to a section-qualified one.
  const seen = new Set();
  entries.forEach((entry) => {
    if (seen.has(entry.slug)) entry.slug = `${entry.sectionSlug}-${entry.slug}`;
    seen.add(entry.slug);
  });

  writeCache(entries);
  return { entries, cached: false };
}

/** Group the flat index into the sections the repo's folders imply. */
export function groupBySection(entries) {
  const sections = [];

  entries.forEach((entry) => {
    let section = sections.find((candidate) => candidate.slug === entry.sectionSlug);
    if (!section) {
      section = { slug: entry.sectionSlug, name: entry.section, entries: [] };
      sections.push(section);
    }
    section.entries.push(entry);
  });

  return sections;
}

/**
 * Fetch one note's source text.
 *
 * `.sql` files come back wrapped in a fence so they render as code rather than
 * as an accidental wall of markdown — they are part of the material, and the
 * schema is half the explanation in a repo about double-entry bookkeeping.
 */
export async function getNoteContent(entry, { signal } = {}) {
  const response = await fetch(entry.rawUrl, { signal });
  if (!response.ok) {
    throw new Error(`Couldn't load ${entry.path} — ${response.status} ${response.statusText}.`);
  }

  const text = await response.text();
  return entry.language === "sql" ? `\`\`\`sql\n${text.trim()}\n\`\`\`` : text;
}
