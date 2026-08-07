const BLOGGER_FEED_URL = "https://blog.cheptoyek.com/feeds/posts/default?alt=json&max-results=20";

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

export async function getBloggerPosts({ signal } = {}) {
  const res = await fetch(BLOGGER_FEED_URL, { signal });
  if (!res.ok) throw new Error(`Blogger feed responded with ${res.status}`);

  const data = await res.json();
  const entries = data.feed?.entry || [];
  return entries.map(toPost);
}
