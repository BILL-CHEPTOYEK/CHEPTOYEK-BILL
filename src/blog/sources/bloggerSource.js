const BLOGGER_FEED_URL = "https://blog.cheptoyek.com/feeds/posts/default";

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toPost(entry) {
  const altLink = (entry.link || []).find((link) => link.rel === "alternate");
  const summarySource = entry.summary?.$t || entry.content?.$t || "";

  return {
    slug: null,
    title: entry.title?.$t || "Untitled",
    date: entry.published?.$t || null,
    excerpt: stripHtml(summarySource).slice(0, 200),
    content: null,
    url: altLink?.href || null,
    source: "blogger",
  };
}

// Blogger's `alt=json` feed doesn't send CORS headers, so a plain fetch()
// is blocked by Same-Origin Policy for every visitor. `alt=json-in-script`
// is Blogger's JSONP variant, loaded via a <script> tag instead of fetch,
// which isn't subject to CORS.
function fetchJsonp(url, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `bloggerJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");

    const cleanup = () => {
      delete window[callbackName];
      script.remove();
      signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("Blogger feed script failed to load"));
    };

    signal?.addEventListener("abort", onAbort);
    document.head.appendChild(script);
  });
}

export async function getBloggerPosts({ signal } = {}) {
  const data = await fetchJsonp(
    `${BLOGGER_FEED_URL}?alt=json-in-script&max-results=20`,
    { signal }
  );
  const entries = data.feed?.entry || [];
  return entries.map(toPost);
}
