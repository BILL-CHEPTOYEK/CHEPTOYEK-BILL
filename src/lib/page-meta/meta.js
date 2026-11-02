/**
 * Title, description and canonical URL strings for a single page.
 *
 * Kept separate from the hook that applies them so the string handling - which
 * is where the fiddly cases are - can be tested with plain node. Nothing here
 * touches the DOM.
 *
 * This is a static site with client-side routing, so every route is served the
 * same index.html and therefore the same <title>. Crawlers that don't run JS
 * see the default for all of them; Google, which does render, picks these up.
 * That's the ceiling without prerendering, and it is still better than eleven
 * pages all called "Cheptoyek Bill".
 */

export const SITE_NAME = "Cheptoyek Bill";
export const SITE_ORIGIN = "https://cheptoyek.com";

/** Google truncates around here. Past it is wasted bytes, not extra ranking. */
const DESCRIPTION_LIMIT = 160;

/**
 * `Tools - Cheptoyek Bill`, except on the landing page, where the site name is
 * already the whole title and repeating it reads as a mistake.
 */
export function documentTitle(title) {
  const trimmed = (title ?? "").trim();
  if (!trimmed || trimmed === SITE_NAME) return SITE_NAME;
  return `${trimmed} - ${SITE_NAME}`;
}

/**
 * Collapse to one line and cut at a word boundary.
 *
 * Page subtitles are written to be read under a heading, so they contain
 * newlines and run long. Cutting mid-word looks like a bug, so the cut lands
 * on the last space before the limit and gets an ellipsis to show it happened.
 */
export function metaDescription(text) {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= DESCRIPTION_LIMIT) return flat;

  const cut = flat.slice(0, DESCRIPTION_LIMIT);
  const lastSpace = cut.lastIndexOf(" ");
  const body = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${body.replace(/[,;:.\-…]+$/, "")}…`;
}

/**
 * Absolute URL for a route. Trailing slashes are dropped so `/tools` and
 * `/tools/` don't become two canonicals for one page.
 */
export function canonicalUrl(pathname) {
  const path = (pathname ?? "/").split(/[?#]/)[0];
  const normalised = path.replace(/\/+$/, "");
  return `${SITE_ORIGIN}${normalised || "/"}`;
}
