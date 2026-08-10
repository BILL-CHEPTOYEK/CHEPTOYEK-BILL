import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import { getLocalPostBySlug } from "../blog/sources";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getLocalPostBySlug(slug);
  const html = useMemo(() => (post ? marked.parse(post.content) : ""), [post]);

  if (!post) {
    return (
      <main className="min-h-screen bg-neutral-50 px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="text-xs tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            ← Blog
          </Link>
          <h1 className="mt-8 text-3xl font-normal font-heathergreen text-neutral-900">
            Post not found
          </h1>
          <p className="mt-3 text-neutral-500">
            That post doesn't exist, or it only lives on the external blog.
          </p>
        </div>
      </main>
    );
  }

  const date = formatDate(post.date);

  return (
    <main className="min-h-screen bg-neutral-50 px-8 md:px-12 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/blog"
          className="text-xs tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          ← Blog
        </Link>

        <h1 className="mt-8 text-3xl md:text-4xl font-normal font-heathergreen text-neutral-900">
          {post.title}
        </h1>
        {date && (
          <p className="mt-3 text-xs tracking-[0.15em] uppercase text-neutral-400 tabular-nums">
            {date}
          </p>
        )}

        <div className="doc-content mt-10" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
