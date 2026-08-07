import { getBloggerPosts } from "./bloggerSource";
import { getMdPosts, getMdPostBySlug } from "./mdSource";

const BLOGGER_TIMEOUT_MS = 4000;

// Posts always come back in a normalized shape regardless of where they
// came from, tagged with `source` ("blogger" | "md") so callers don't need
// to care which one actually served the request.
export async function getPosts() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BLOGGER_TIMEOUT_MS);

  try {
    const posts = await getBloggerPosts({ signal: controller.signal });
    if (posts.length === 0) throw new Error("Blogger feed returned no posts");
    return { posts, source: "blogger" };
  } catch {
    return { posts: getMdPosts(), source: "md" };
  } finally {
    clearTimeout(timeout);
  }
}

// Post detail pages only exist for locally-authored markdown posts —
// Blogger posts are always linked out to their original URL instead.
export function getLocalPostBySlug(slug) {
  return getMdPostBySlug(slug);
}
