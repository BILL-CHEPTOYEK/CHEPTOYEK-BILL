import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { documentTitle, metaDescription, canonicalUrl } from "../lib/page-meta/meta.js";

/**
 * Find a meta/link tag already in index.html, or create it. index.html carries
 * the defaults so a crawler that doesn't run JS still gets something sensible;
 * this reuses those tags rather than appending a second, conflicting set.
 */
function upsert(selector, create) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  return element;
}

function setMeta(attribute, name, content) {
  const element = upsert(`meta[${attribute}="${name}"]`, () => {
    const created = document.createElement("meta");
    created.setAttribute(attribute, name);
    return created;
  });
  element.setAttribute("content", content);
}

/**
 * Set the document title and description for the page that calls it.
 *
 * `PageShell` calls this for every page built on it, so most routes get their
 * metadata from the title and subtitle they already pass. Pages that don't use
 * the shell - the landing page, /home, /github, /blog - call it directly.
 */
export default function useDocumentMeta(title, description) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = documentTitle(title);
    const summary = metaDescription(description);
    const url = canonicalUrl(pathname);

    document.title = fullTitle;
    setMeta("property", "og:title", fullTitle);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("property", "og:url", url);

    if (summary) {
      setMeta("name", "description", summary);
      setMeta("property", "og:description", summary);
      setMeta("name", "twitter:description", summary);
    }

    upsert('link[rel="canonical"]', () => {
      const created = document.createElement("link");
      created.setAttribute("rel", "canonical");
      return created;
    }).setAttribute("href", url);
  }, [title, description, pathname]);
}
