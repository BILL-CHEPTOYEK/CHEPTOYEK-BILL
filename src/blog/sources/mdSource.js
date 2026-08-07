import { parseFrontmatter } from "../frontmatter";

const modules = import.meta.glob("../posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

function toPost(path, raw) {
  const slug = path.split("/").pop().replace(/\.md$/, "");
  const { data, content } = parseFrontmatter(raw);
  return {
    slug,
    title: data.title || slug,
    date: data.date || null,
    excerpt: data.excerpt || "",
    content,
    url: null,
    source: "md",
  };
}

const posts = Object.entries(modules)
  .map(([path, raw]) => toPost(path, raw))
  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

export function getMdPosts() {
  return posts;
}

export function getMdPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) || null;
}
