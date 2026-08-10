import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../blog/sources";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    getPosts().then(({ posts: fetched }) => {
      if (cancelled) return;
      setPosts(fetched);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-8 md:px-12 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/home"
          className="text-xs tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          ← Home
        </Link>

        <h1 className="mt-8 text-4xl md:text-5xl font-normal font-heathergreen text-neutral-900">
          Blog
        </h1>
        <p className="mt-3 text-neutral-500">Notes on building, learning, and refining.</p>

        {status === "loading" && (
          <p className="mt-14 text-sm text-neutral-400">Loading posts…</p>
        )}

        {status === "ready" && posts.length === 0 && (
          <p className="mt-14 text-sm text-neutral-400">No posts yet. Check back soon.</p>
        )}

        {status === "ready" && posts.length > 0 && (
          <div className="mt-14 flex flex-col divide-y divide-neutral-200 border-t border-b border-neutral-200">
            {posts.map((post) => (
              <PostRow key={post.slug || post.url || post.title} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function PostRow({ post }) {
  const date = formatDate(post.date);
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg md:text-xl font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
          {post.title}
        </h2>
        {date && (
          <span className="shrink-0 text-xs tracking-[0.1em] uppercase text-neutral-400 tabular-nums">
            {date}
          </span>
        )}
      </div>
      {post.excerpt && (
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{post.excerpt}</p>
      )}
    </>
  );

  const className = "group block py-6";

  if (post.source === "blogger" && post.url) {
    return (
      <a href={post.url} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    );
  }

  return (
    <Link to={`/blog/${post.slug}`} className={className}>
      {body}
    </Link>
  );
}
