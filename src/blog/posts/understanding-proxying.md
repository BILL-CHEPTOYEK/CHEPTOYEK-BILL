---
title: Proxying is just a very committed lie
date: 2026-08-10
excerpt: A proxy's whole job is to make one thing look like another. The trouble starts when it forgets which lie it's telling.
---

Every proxy is the same trick wearing a different costume: a client asks for something, and instead of getting it from where it actually lives, it gets an answer from something pretending to be that place. Reverse proxy, forward proxy, CDN edge, `/blog` rewrite in a worker script - it's all one move. The interesting part isn't the routing. It's what happens when the lie is only half-finished.

## The lie has to be total

A proxy that forwards the request but not the headers is a proxy that got caught. I've shipped rewrites that stripped `Host` and left the origin server issuing redirects back to itself under its own internal hostname - technically correct, completely useless to a browser that has no idea that hostname exists. The client doesn't experience "mostly proxied." It experiences broken.

Same story with cookies, with `X-Forwarded-For`, with content-length after you've rewritten the body. Half a disguise is worse than none, because it fails in the client's face instead of failing loudly in yours.

## Statelessness is the actual feature

The reason a proxy is boring infrastructure instead of a liability is that it isn't supposed to remember anything. The moment a proxy starts caching a decision - "this user was authenticated five requests ago," "this route always resolves to origin A" - it's stopped being a proxy and started being a second, worse copy of your application state, one that drifts from the real thing in exactly the way you won't notice until it matters.

The proxies I trust are the ones I could restart mid-afternoon without anyone noticing. If restarting it is an incident, it wasn't a proxy - it was a load-bearing wall wearing a proxy's clothes.

## Where it actually breaks

Not at the routing rule. Routing rules are easy to test. It breaks at the edges of the disguise: TLS termination that drops a header the origin needs to trust the connection, a body-rewriting rule that forgets to update `Content-Length`, a fallback path with no rule for it at all, so the request just hits the origin looking foreign and gets rejected by something that was never told to expect it.

Test the seams, not the happy path. The happy path is just the client believing the lie. The seams are where it stops being believable.
