/**
 * The system model for cheptoyek.com.
 *
 * This file is the single source of truth for the /architecture page: the
 * diagram, the inspector and the flow narration all read from it. It holds
 * data only — no geometry (see `layout.js`) and no React.
 *
 * Everything described here is real and traceable to a file in this repo.
 * The `source` field on a node points at the file that defines it, so the
 * page stays honest as the system changes.
 */

/** Vertical bands, left to right. `label` renders as the column header. */
export const COLUMNS = [
  { id: "client", label: "Client", note: "Runs on the visitor's device" },
  { id: "edge", label: "Edge — Cloudflare", note: "Anycast, ~everywhere" },
  { id: "origin", label: "Origin", note: "Where the bytes actually live" },
  { id: "build", label: "Build & delivery", note: "Runs on push to main" },
];

const COLUMN_INDEX = Object.fromEntries(COLUMNS.map((c, i) => [c.id, i]));

/**
 * Nodes are placed on an explicit (column, row) grid rather than by a force
 * simulation. A portfolio diagram that reflows differently on every load is a
 * novelty; one that is identical every time can be reasoned about.
 */
export const NODES = [
  {
    id: "browser",
    column: "client",
    row: 1.0,
    label: "Visitor's browser",
    kind: "actor",
    summary: "Chrome, Safari, a crawler, or curl. The only client that exists.",
    detail:
      "There is no mobile app and no server-rendered variant. Everything the visitor sees is produced by static files plus whatever the browser fetches at runtime, which means the browser is also the entire compute tier.",
    facts: [
      ["Renders", "HTML shell + a single JS bundle"],
      ["State", "sessionStorage (route handoff) only"],
    ],
  },
  {
    id: "spa",
    column: "client",
    row: 2.4,
    label: "React 19 SPA",
    kind: "app",
    summary: "react-router owns every path except /blog.",
    source: "src/App.jsx",
    detail:
      "React 19 with the React Compiler enabled in the Babel pipeline, so memoisation is inferred rather than hand-written — there is not a single useMemo in the routing layer. Routing is client-side, which is what forces the 404.html trick further down the page.",
    facts: [
      ["Router", "react-router-dom 7, BrowserRouter"],
      ["Compiler", "babel-plugin-react-compiler"],
      ["Styling", "Tailwind v4 via @tailwindcss/vite"],
    ],
  },
  {
    id: "bundle",
    column: "client",
    row: 3.8,
    label: "Markdown in the bundle",
    kind: "data",
    summary: "Posts compiled into JS at build time. Reachable with zero network.",
    source: "src/blog/sources/mdSource.js",
    detail:
      "`import.meta.glob('../posts/*.md', { eager: true, query: '?raw' })` inlines every post into the bundle during the build. It costs bundle bytes and buys an offline-capable, always-available fallback for the blog index — no request can fail because there is no request.",
    facts: [
      ["Mechanism", "Vite import.meta.glob, eager"],
      ["Cost", "Post text ships to every visitor"],
      ["Buys", "A fallback that cannot time out"],
    ],
  },
  {
    id: "dns",
    column: "edge",
    row: 0,
    label: "Cloudflare DNS",
    kind: "edge",
    summary: "Authoritative for cheptoyek.com. Proxied, so the origin is hidden.",
    detail:
      "The record is proxied rather than DNS-only. Visitors resolve to a Cloudflare anycast address, never to GitHub's. That is what makes the Worker route below possible at all — a DNS-only record would hand the request straight to GitHub Pages and the Worker would never run.",
    facts: [
      ["Records", "Proxied A/AAAA at the apex"],
      ["Subdomains", "blog. → Blogger, docs. → MasterDocs"],
    ],
  },
  {
    id: "cdn",
    column: "edge",
    row: 1.6,
    label: "Cloudflare edge",
    kind: "edge",
    summary: "TLS termination, cache, and the point where routing decisions happen.",
    detail:
      "Every request for the apex domain lands here first. The edge terminates TLS, serves what it already has, and decides whether the path belongs to a Worker or to the origin. Free tier — the whole site's hosting bill is the domain registration.",
    facts: [
      ["Terminates", "TLS 1.3 / HTTP3 at the nearest PoP"],
      ["Decides", "Worker route vs. origin fetch"],
      ["Cost", "$0"],
    ],
  },
  {
    id: "worker",
    column: "edge",
    row: 3.2,
    label: "blog-proxy Worker",
    kind: "edge",
    summary: "Reverse-proxies /blog/* onto Blogger and rewrites the HTML on the way back.",
    source: "cloudflare/blog-proxy-worker.js",
    detail:
      "Bound to `cheptoyek.com/blog` and `cheptoyek.com/blog/*`. It rewrites the Host header, strips the /blog prefix, then streams the response through HTMLRewriter to pull every absolute blog.cheptoyek.com link back under /blog. Redirects get the same treatment via a manual Location rewrite, because a 302 that escapes the proxy dumps the visitor onto the bare Blogger domain.",
    facts: [
      ["Routes", "cheptoyek.com/blog, /blog/*"],
      ["Rewrites", "a[href], link[href], form[action], 3xx Location"],
      ["Streams", "HTMLRewriter — no buffering, no parse cost"],
    ],
  },
  {
    id: "pages",
    column: "origin",
    row: 0.6,
    label: "GitHub Pages",
    kind: "origin",
    summary: "Serves the gh-pages branch. Static files, no rewrite rules, no compute.",
    source: ".github/workflows/deploy.yml",
    detail:
      "The origin is a git branch. That has a pleasant property — every deploy is a commit, so rollback is `git revert` and the served state is always diffable. It also has one sharp edge: Pages will not rewrite unknown paths to index.html, which is the whole reason flow 02 exists.",
    facts: [
      ["Branch", "gh-pages, force-pushed by CI"],
      ["Rewrites", "None. This matters."],
      ["Cost", "$0"],
    ],
  },
  {
    id: "blogger",
    column: "origin",
    row: 2.4,
    label: "Blogger",
    kind: "origin",
    summary: "The CMS. Hosts posts at blog.cheptoyek.com, reached two different ways.",
    detail:
      "Writing posts should not require a deploy, so the blog lives in a hosted CMS. The site reaches it twice over: the Worker proxies the reading experience at /blog, and the SPA reads its Atom feed to build an index. Neither path requires a database or an admin panel that I have to maintain.",
    facts: [
      ["Read path A", "Worker reverse proxy → /blog"],
      ["Read path B", "Atom feed → SPA index"],
      ["Feed quirk", "No CORS headers. Hence JSONP."],
    ],
  },
  {
    id: "ghapi",
    column: "origin",
    row: 4.2,
    label: "api.github.com",
    kind: "origin",
    summary: "Live profile and repo data, called straight from the browser.",
    source: "src/pages/GitHubPage.jsx",
    detail:
      "Called unauthenticated and directly from the client. A static site has nowhere to hide a token, so rather than pretend otherwise the page ships with none — the rate limit becomes the trade-off instead of a leaked credential.",
    facts: [
      ["Calls", "/users/:u and /users/:u/repos"],
      ["Auth", "None — 60 req/hour/IP"],
      ["Why", "Nowhere in a static bundle is secret"],
    ],
  },
  {
    id: "notes",
    column: "origin",
    row: 5.6,
    label: "Notes repo",
    kind: "origin",
    summary: "A second repository, read at runtime instead of copied in.",
    source: "src/notes/source.js",
    detail:
      "The accounting notes are written and revised in their own repository, so /notes derives its structure from that repo's file tree and fetches the prose on demand. Copying the files into this one would create two copies to keep in sync and put a deploy between writing and publishing.",
    facts: [
      ["Index from", "api.github.com — 60 req/hour/IP"],
      ["Content from", "raw.githubusercontent.com — sends CORS"],
      ["Cached in", "sessionStorage, for the visit"],
    ],
  },
  {
    id: "repo",
    column: "build",
    row: 0.4,
    label: "main branch",
    kind: "build",
    summary: "The source of truth for code, content and infrastructure.",
    detail:
      "Application code, blog fallback content, the Worker and its route table all live in one repository. Infrastructure changes arrive as pull requests with the code that depends on them, which is the main argument for keeping wrangler.toml in the app repo instead of somewhere administrative.",
    facts: [
      ["Holds", "App, Worker, CI, content"],
      ["Trigger", "push / PR to main"],
    ],
  },
  {
    id: "actions",
    column: "build",
    row: 1.8,
    label: "GitHub Actions",
    kind: "build",
    summary: "One workflow. Checkout, install, build, publish.",
    source: ".github/workflows/deploy.yml",
    detail:
      "Deliberately boring: four steps, no matrix, no cache warming, no environments. The build takes long enough that optimising it would save less time than maintaining the optimisation.",
    facts: [
      ["Node", "20.19.0, pinned"],
      ["Publish", "peaceiris/actions-gh-pages@v3"],
      ["Gate", "None — main is the release branch"],
    ],
  },
  {
    id: "build",
    column: "build",
    row: 3.2,
    label: "Vite build",
    kind: "build",
    summary: "Compiles the app and content-hashes every asset.",
    source: "vite.config.js",
    detail:
      "Rollup emits filenames containing a content hash, which is what makes aggressive edge caching safe: a changed file is a new URL, so nothing ever needs purging. The markdown fallback is inlined here too — build time is the last moment content and code are the same thing.",
    facts: [
      ["Output", "dist/, content-hashed"],
      ["Inlines", "Blog markdown, fonts"],
      ["Enables", "Immutable caching, no purge step"],
    ],
  },
];

/**
 * Wires are grouped into channels, and a channel is the unit of colour.
 *
 * Colour here is information, not decoration: five categories, each answering
 * "what kind of hop is this" at a glance. Dash pattern reinforces the same
 * split rather than encoding a second, competing dimension — so a dotted amber
 * line and a solid indigo one differ in two ways that say the same thing.
 */
export const CHANNELS = {
  request: {
    label: "Request path",
    hint: "Browser to edge to origin",
    idle: "#a5b4fc",
    active: "#4f46e5",
    dash: null,
    dot: "bg-indigo-500",
  },
  proxy: {
    label: "Worker proxy",
    hint: "Intercepted at the edge, never reaches Pages",
    idle: "#c4b5fd",
    active: "#7c3aed",
    dash: null,
    dot: "bg-violet-500",
  },
  external: {
    label: "Third-party data",
    hint: "Cross-origin, straight from the browser",
    idle: "#5eead4",
    active: "#0d9488",
    dash: "6 5",
    dot: "bg-teal-500",
  },
  local: {
    label: "No network",
    hint: "Already in the bundle",
    idle: "#fcd34d",
    active: "#d97706",
    dash: "2 5",
    dot: "bg-amber-500",
  },
  build: {
    label: "Build & deploy",
    hint: "Runs in CI, not on a request",
    idle: "#fda4af",
    active: "#e11d48",
    dash: null,
    dot: "bg-rose-500",
  },
};

/**
 * Edges are directed for drawing purposes, but flows may traverse them in
 * reverse — a response follows exactly the wire a request came in on, and
 * drawing that as a second arrow would double the visual noise for no gain.
 *
 * `route` selects an orthogonal routing strategy in `layout.js`:
 *   "h"      elbow: out the side, turn once, in the side
 *   "v"      straight down the column
 *   "direct" straight line between anchors, regardless of what it crosses
 * `turn` (0..1) moves the elbow's vertical leg between the two columns.
 */
export const EDGES = [
  { id: "dns-lookup", from: "browser", to: "dns", route: "h", turn: 0.5, label: "resolve", channel: "request" },
  { id: "tls", from: "browser", to: "cdn", route: "h", turn: 0.5, label: "HTTPS", channel: "request" },
  { id: "origin-fetch", from: "cdn", to: "pages", route: "h", turn: 0.5, label: "cache miss", channel: "request" },
  { id: "worker-route", from: "cdn", to: "worker", route: "v", label: "/blog*", channel: "proxy" },
  { id: "proxy", from: "worker", to: "blogger", route: "h", turn: 0.5, label: "proxy", channel: "proxy" },
  { id: "boot", from: "browser", to: "spa", route: "v", label: "boot", channel: "local" },
  { id: "fallback", from: "spa", to: "bundle", route: "v", label: "fallback", channel: "local" },
  { id: "feed", from: "spa", to: "blogger", route: "direct", label: "JSONP", channel: "external" },
  { id: "gh-api", from: "spa", to: "ghapi", route: "h", turn: 0.16, label: "REST", channel: "external" },
  { id: "notes-fetch", from: "spa", to: "notes", route: "h", turn: 0.08, label: "tree + raw", channel: "external" },
  { id: "ci-trigger", from: "repo", to: "actions", route: "v", label: "on push", channel: "build" },
  { id: "ci-build", from: "actions", to: "build", route: "v", label: "npm run build", channel: "build" },
  { id: "publish", from: "build", to: "pages", route: "h", turn: 0.5, label: "publish dist/", channel: "build" },
];

/** The channel a flow step travels on — drives the packet and node colours. */
export const channelOfStep = (step) => CHANNELS[EDGE_BY_ID[step.edge].channel];

/**
 * Flows are the point of this diagram. A static box-and-arrow picture shows
 * what exists; a flow shows what happens, in order, which is the part that is
 * actually hard to get across in a portfolio.
 *
 * Each step names an edge and a direction. `dir: -1` walks the edge backwards.
 */
export const FLOWS = [
  {
    id: "cold-visit",
    label: "Cold visit",
    question: "What happens when someone types cheptoyek.com?",
    steps: [
      {
        edge: "dns-lookup",
        dir: 1,
        title: "Resolve",
        text: "cheptoyek.com resolves to a Cloudflare anycast address. The record is proxied, so GitHub's IPs never appear in public DNS.",
      },
      {
        edge: "tls",
        dir: 1,
        title: "Connect",
        text: "TLS terminates at whichever Cloudflare PoP is closest. For a visitor in Kampala that is a few milliseconds away; the origin is a continent away and never gets consulted for this part.",
      },
      {
        edge: "origin-fetch",
        dir: 1,
        title: "Miss",
        text: "First request for this asset at this PoP: nothing cached. Cloudflare fetches from GitHub Pages.",
      },
      {
        edge: "origin-fetch",
        dir: -1,
        title: "Fill",
        text: "index.html plus content-hashed JS and CSS come back, and the edge keeps a copy. Every later visitor served by this PoP skips the two steps above entirely.",
      },
      {
        edge: "tls",
        dir: -1,
        title: "Deliver",
        text: "The HTML shell reaches the browser. It is small — the interesting work has not started yet.",
      },
      {
        edge: "boot",
        dir: 1,
        title: "Boot",
        text: "React mounts and react-router takes over the address bar. From here, navigation costs no network at all.",
      },
    ],
  },
  {
    id: "deep-link",
    label: "Deep link",
    question: "How does /tools/config-diff work on a host with no rewrite rules?",
    steps: [
      {
        edge: "tls",
        dir: 1,
        title: "Request a path that isn't a file",
        text: "GET /tools/config-diff. In the SPA this is a route. On disk it does not exist.",
      },
      {
        edge: "origin-fetch",
        dir: 1,
        title: "Ask the origin anyway",
        text: "GitHub Pages has no rewrite rules and no configuration file that could add them. It looks for /tools/config-diff/index.html, finds nothing.",
      },
      {
        edge: "origin-fetch",
        dir: -1,
        title: "404 — but a useful one",
        text: "Pages serves public/404.html with a 404 status. That file is not an error page; it is a three-line program.",
      },
      {
        edge: "tls",
        dir: -1,
        title: "Stash and bounce",
        text: "The shim writes location.pathname + search + hash into sessionStorage and calls location.replace('/'). The visitor sees one flash of nothing.",
      },
      {
        edge: "boot",
        dir: 1,
        title: "Replay before React notices",
        text: "An inline script in index.html reads the value back and calls history.replaceState() with it — before the bundle parses. React mounts believing it was always on /tools/config-diff, and the URL bar never lies.",
      },
    ],
  },
  {
    id: "blog-read",
    label: "Blog, proxied",
    question: "Why does /blog look like it's part of the site when it isn't?",
    steps: [
      {
        edge: "tls",
        dir: 1,
        title: "Request",
        text: "GET /blog/some-post arrives at the edge like anything else.",
      },
      {
        edge: "worker-route",
        dir: 1,
        title: "Intercept",
        text: "The route pattern cheptoyek.com/blog* matches, so the Worker runs. GitHub Pages is never consulted — it does not know this path exists.",
      },
      {
        edge: "proxy",
        dir: 1,
        title: "Forward",
        text: "The Worker rewrites Host to blog.cheptoyek.com and strips the /blog prefix, then forwards with redirect: 'manual' so it can inspect 3xx responses instead of silently following them.",
      },
      {
        edge: "proxy",
        dir: -1,
        title: "Receive HTML full of the wrong links",
        text: "Blogger answers with absolute URLs pointing at blog.cheptoyek.com. Shipped as-is, the first click would eject the visitor from the domain.",
      },
      {
        edge: "worker-route",
        dir: -1,
        title: "Rewrite in flight",
        text: "HTMLRewriter streams the response and rewrites a[href], link[href] and form[action] back under /blog. Nothing is buffered, so a large post costs no extra latency.",
      },
      {
        edge: "tls",
        dir: -1,
        title: "One origin",
        text: "The visitor gets the blog on cheptoyek.com, under one certificate, with no iframe and no subdomain hop. Cookies, analytics and the back button all behave as if it were the same app — because as far as the browser is concerned, it is.",
      },
    ],
  },
  {
    id: "blog-index",
    label: "Feed + fallback",
    question: "What happens to the blog index when Blogger is slow?",
    steps: [
      {
        edge: "feed",
        dir: 1,
        title: "Ask via JSONP, not fetch",
        text: "Blogger's alt=json feed sends no CORS headers, so fetch() is blocked for every visitor. alt=json-in-script is the JSONP variant — loaded through a <script> tag, which predates and sidesteps CORS entirely.",
      },
      {
        edge: "feed",
        dir: -1,
        title: "Normalise",
        text: "Up to 20 entries come back and are flattened into the same post shape the local markdown uses, tagged with their source. Callers never branch on where a post came from.",
      },
      {
        edge: "fallback",
        dir: 1,
        title: "Or don't wait",
        text: "An AbortController caps the whole attempt at 4 seconds. On timeout, error, or an empty feed, the index renders from markdown that Vite inlined at build time. The fallback needs no network, so it cannot fail the way the thing it is replacing just did.",
      },
    ],
  },
  {
    id: "github-page",
    label: "Live GitHub data",
    question: "Where does /github get its numbers?",
    steps: [
      {
        edge: "gh-api",
        dir: 1,
        title: "Two calls, in parallel",
        text: "Promise.all over /users/:u and /users/:u/repos?sort=updated. Both fire the moment the route mounts.",
      },
      {
        edge: "gh-api",
        dir: -1,
        title: "Aggregate client-side",
        text: "Forks are filtered out, languages counted, top repos ranked — all in the browser. There is no backend to cache this in, so the work happens where the data lands.",
      },
      {
        edge: "gh-api",
        dir: 1,
        title: "And the honest trade-off",
        text: "Unauthenticated means 60 requests per hour per IP. A token would raise that to 5,000 — and would sit in a public bundle for anyone to read. The rate limit is the better bug.",
      },
    ],
  },
  {
    id: "notes-read",
    label: "Notes from a repo",
    question: "How does /notes show a different repository's content?",
    steps: [
      {
        edge: "notes-fetch",
        dir: 1,
        title: "Ask for the file tree",
        text: "One call to the trees API with recursive=1 returns every path in the notes repository. The application directory is filtered out; what's left is the reading material.",
      },
      {
        edge: "notes-fetch",
        dir: -1,
        title: "Derive the structure from the filenames",
        text: "Numbered folders become sections and numbered files become an order — the `01-`, `02-` prefixes in that repo are load-bearing, not decoration. Nothing about the table of contents is written down twice.",
      },
      {
        edge: "notes-fetch",
        dir: 1,
        title: "Fetch the prose from raw.githubusercontent.com",
        text: "A different host from the API, and a friendlier one: no rate limit of the same kind, and it does send CORS headers — so a plain fetch() works, with none of the JSONP contortion the Blogger feed needs.",
      },
      {
        edge: "notes-fetch",
        dir: -1,
        title: "Render it, carefully",
        text: "Markdown from another repository goes into the page as HTML, so raw HTML in the source is dropped rather than passed through, and relative links are rewritten to absolute GitHub URLs. The tree is memoised in sessionStorage, so browsing the series costs one API call per visit.",
      },
    ],
  },
  {
    id: "deploy",
    label: "Push to live",
    question: "What does shipping actually cost?",
    steps: [
      {
        edge: "ci-trigger",
        dir: 1,
        title: "Push",
        text: "A commit on main triggers the only workflow in the repository. There is no staging environment, no approval gate, and no release branch.",
      },
      {
        edge: "ci-build",
        dir: 1,
        title: "Build",
        text: "npm install, then vite build. Markdown, fonts and images are compiled in; Rollup stamps a content hash onto every emitted filename.",
      },
      {
        edge: "publish",
        dir: 1,
        title: "Publish",
        text: "peaceiris/actions-gh-pages force-pushes dist/ to the gh-pages branch. The deploy artefact is a commit, which means rollback is a git operation rather than a dashboard.",
      },
      {
        edge: "origin-fetch",
        dir: -1,
        title: "Propagate",
        text: "The edge picks up the new index.html on its next miss. Because asset filenames changed, no cache purge is needed — old files simply stop being referenced.",
      },
    ],
  },
];

/** Lookup helpers. Built once; the model is static. */
export const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));
export const EDGE_BY_ID = Object.fromEntries(EDGES.map((e) => [e.id, e]));
export const COLUMN_OF = (nodeId) => COLUMN_INDEX[NODE_BY_ID[nodeId].column];

/** Which flows touch a given node — shown in the inspector. */
export function flowsForNode(nodeId) {
  return FLOWS.filter((flow) =>
    flow.steps.some((step) => {
      const edge = EDGE_BY_ID[step.edge];
      return edge.from === nodeId || edge.to === nodeId;
    })
  );
}

/** Every edge attached to a node, for hover highlighting. */
export function edgesForNode(nodeId) {
  return EDGES.filter((e) => e.from === nodeId || e.to === nodeId);
}

/**
 * A step's "from" and "to" node, accounting for direction. Flow playback
 * lights up nodes as they are reached, so it needs the traversal order rather
 * than the drawing order.
 */
export function stepEndpoints(step) {
  const edge = EDGE_BY_ID[step.edge];
  return step.dir === -1
    ? { from: edge.to, to: edge.from }
    : { from: edge.from, to: edge.to };
}
