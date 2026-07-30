const BLOG_HOST = 'blog.cheptoyek.com';
const BLOG_PREFIX = /^\/blog(\/|$)/;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (!BLOG_PREFIX.test(url.pathname)) {
      return fetch(request);
    }

    const upstream = new URL(request.url);
    upstream.hostname = BLOG_HOST;
    upstream.pathname = url.pathname.replace(/^\/blog/, '') || '/';

    const upstreamRequest = new Request(upstream, request);
    upstreamRequest.headers.set('host', BLOG_HOST);

    const response = await fetch(upstreamRequest, { redirect: 'manual' });

    if (response.status >= 300 && response.status < 400) {
      return rewriteRedirect(response, upstream);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    return new HTMLRewriter()
      .on('a[href]', new AttributeRewriter('href'))
      .on('link[href]', new AttributeRewriter('href'))
      .on('form[action]', new AttributeRewriter('action'))
      .transform(response);
  },
};

function rewriteRedirect(response, upstream) {
  const location = response.headers.get('location');
  if (!location) return response;

  const target = toProxiedPath(location, upstream);
  if (target === null) return response;

  const headers = new Headers(response.headers);
  headers.set('location', target);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function toProxiedPath(value, base) {
  try {
    const absolute = new URL(value, base);
    if (absolute.hostname !== BLOG_HOST) return null;
    return `/blog${absolute.pathname}${absolute.search}${absolute.hash}`;
  } catch {
    return null;
  }
}

class AttributeRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName;
  }

  element(element) {
    const value = element.getAttribute(this.attributeName);
    if (!value) return;

    const rewritten = toProxiedPath(value, `https://${BLOG_HOST}/`);
    if (rewritten !== null) {
      element.setAttribute(this.attributeName, rewritten);
    }
  }
}
