import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import { getLocalPostBySlug } from "../blog/sources";
import useDocumentMeta from "../components/useDocumentMeta";

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

  // Above the early return, because a hook cannot be called conditionally. The
  // excerpt is written for exactly this and is already in the frontmatter.
  useDocumentMeta(post ? post.title : "Post not found", post ? post.excerpt : "");

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
          <h1 className="mt-8 font-hero text-3xl md:text-4xl leading-[1.05] tracking-[-0.02em] text-neutral-900">
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

        {/* A step down from the shell's default size: post titles are long and
            arbitrary, and Archivo Black at md:text-5xl wraps to three lines. */}
        <h1 className="mt-8 font-hero text-3xl md:text-4xl leading-[1.05] tracking-[-0.02em] text-neutral-900">
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
