---
title: Designing for the edge first
date: 2026-05-02
excerpt: Pushing routing and proxying decisions to the CDN edge keeps the app simple — until the edge isn't there.
---

Cloudflare Workers make it tempting to push more and more decisions out to the edge: proxying, redirects, header rewriting, even whole subdomains stitched together to look like one site.

## The upside

It's genuinely nice. The app itself stays a plain single-page app with a handful of routes, and everything else — like proxying a separate blog under `/blog` — lives in a small worker script close to the request.

## The catch

An edge rule is only as good as its deployment. If the worker script exists in a repo but nothing ever runs `wrangler deploy`, or the DNS record it depends on isn't proxied, the "edge-first" design quietly becomes "edge-never," and every request falls through to whatever the origin serves instead.

That's a fine failure mode as long as the origin knows what to do with the request it wasn't expecting. A single-page app that has no route for `/blog` will happily throw a router error instead. The fix isn't just deploying the worker correctly — it's making sure the fallback behaves sensibly too.

## The lesson

Treat every edge-only behavior as optional from the origin's point of view. If the edge doesn't catch it, the origin should still do something reasonable.
