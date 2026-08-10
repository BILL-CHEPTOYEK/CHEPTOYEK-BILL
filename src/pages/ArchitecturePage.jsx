import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import ArchitectureDiagram from "../components/architecture/ArchitectureDiagram";
import FlowNarration, { FlowPicker } from "../components/architecture/FlowPlayer";
import NodeInspector from "../components/architecture/NodeInspector";
import { useFlowPlayer, usePrefersReducedMotion } from "../architecture/useFlowPlayer";
import { CHANNELS, FLOWS } from "../architecture/model.js";

const REPO = "https://github.com/BILL-CHEPTOYEK/CHEPTOYEK-BILL";

/**
 * The tints are pulled from the diagram's channel palette rather than picked
 * separately, so the four cards and the five wire colours below read as one
 * system instead of two unrelated decisions.
 */
const STATS = [
  { label: "Servers I run", value: "0", color: CHANNELS.request.active },
  { label: "Databases", value: "0", color: CHANNELS.proxy.active },
  { label: "Hosting cost", value: "$0/mo", color: CHANNELS.external.active },
  { label: "Steps to deploy", value: "1 push", color: CHANNELS.build.active },
];

/**
 * Pick legible text for whatever background a card is given.
 *
 * These colours are meant to be swapped around freely, and hard-coding white
 * type makes a pale card vanish. Relative luminance decides instead, so the
 * palette can change without anyone remembering to change the text with it.
 * Colours must be hex strings — a bare `gray-200` is a Tailwind class name, not
 * a value, and JavaScript reads it as subtraction.
 */
function cardStyle(background) {
  const hex = background.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const linear = (value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

  return luminance > 0.5
    ? { label: "text-neutral-500", value: "text-neutral-900" }
    : { label: "text-white/70", value: "text-white" };
}

const CACHE_LAYERS = [
  {
    layer: "Browser HTTP cache",
    holds: "Content-hashed JS, CSS and the display font",
    invalidated: "Never. A change produces a new filename, so old entries just stop being asked for.",
  },
  {
    layer: "Cloudflare PoP",
    holds: "index.html and static assets, separately in each region",
    invalidated: "The next miss after a deploy. No purge step exists, and none is needed.",
  },
  {
    layer: "GitHub Pages",
    holds: "Whatever the gh-pages branch currently points at",
    invalidated: "The force-push at the end of CI.",
  },
  {
    layer: "The JS bundle itself",
    holds: "Every markdown post, inlined by Vite at build time",
    invalidated: "A rebuild. This is the blog's offline fallback.",
  },
  {
    layer: "sessionStorage",
    holds: "One pending route for roughly one frame, plus the notes file tree",
    invalidated: "The route is deleted by the script that reads it; the tree lasts the visit.",
  },
];

const DECISIONS = [
  {
    title: "Cloudflare in front of GitHub Pages",
    why: "Pages on its own has no programmable edge — no rewrites, no headers, no logic. Proxying the zone through Cloudflare buys all three and hides the origin as a side effect.",
    cost: "A second vendor sits in the request path, and the proxy toggle that makes it all work lives in a dashboard rather than in this repository.",
  },
  {
    title: "A reverse proxy for the blog, not a link to it",
    why: "blog.cheptoyek.com is a different origin. Linking there ejects the visitor from the domain and splits the certificate, the cookie jar and the back-button history three ways. Proxying it makes the blog genuinely part of the site.",
    cost: "The rewriter is coupled to Blogger's HTML. A markup change on their side is a URL shape mine might miss.",
  },
  {
    title: "Blogger as the CMS",
    why: "Publishing should not require a build. I am not going to write an admin panel to post a few times a month, and a hosted CMS costs nothing and never needs patching.",
    cost: "I don't own the rendering, and the feed ships no CORS headers — which is why there is a JSONP loader in a 2026 codebase.",
  },
  {
    title: "No backend, no database",
    why: "Nothing here needs to persist anything. Content lives in git and in Blogger; live data comes from GitHub's API. Adding a database would create an operational burden with no user-visible benefit.",
    cost: "No contact form that stores submissions, no analytics I own, and no way to add either without changing this row.",
  },
  {
    title: "No API token in the client",
    why: "A static bundle has no secrets — anything shipped to the browser is public, and pretending otherwise is how tokens end up on GitHub search.",
    cost: "60 GitHub API requests per hour per IP instead of 5,000.",
  },
  {
    title: "Notes read from another repo, not copied into this one",
    why: "The accounting notes are written and revised in their own repository. Vendoring them here would mean two copies to keep in sync and a deploy standing between writing and publishing — so /notes derives its table of contents from that repo's file tree and fetches the prose at read time. Add a file there and it appears here.",
    cost: "The page is only as available as GitHub is, the index costs a rate-limited API call, and markdown from a second repository ends up as HTML in this one — which is why the renderer drops raw HTML rather than trusting it.",
  },
  {
    title: "404.html as the router fallback",
    why: "GitHub Pages cannot rewrite unknown paths to index.html. Bouncing through the 404 page with the path in sessionStorage is the only mechanism the platform actually offers.",
    cost: "Every deep link serves an HTTP 404 status for one round trip before it repairs itself.",
  },
];

const WARTS = [
  {
    title: "/blog is claimed twice",
    body: "The router registers /blog and the Worker owns cheptoyek.com/blog*. In production the Worker wins, so src/pages/BlogPage.jsx is reachable only in local development. It should move to a path the Worker doesn't own, or go.",
  },
  {
    title: "public/CNAME holds a URL, not a hostname",
    body: "It reads https://cheptoyek.com where GitHub Pages expects a bare cheptoyek.com. It causes no visible problem today because Cloudflare fronts the domain, which is exactly what makes it the kind of thing that surfaces at the worst moment.",
  },
  {
    title: "The blog feed executes third-party script",
    body: "JSONP works by injecting a <script> tag, so Blogger gets script execution on my origin. The 4-second timeout bounds how long I wait — not how much I trust.",
  },
  {
    title: "Test coverage is one file deep",
    body: "The config diff engine has a real suite because it is pure and the edge cases are subtle. Nothing else has anything — not the Worker's URL rewriting, not the blog source fallback, not a single component. The two pieces most likely to break silently are the two with no tests.",
  },
];

function Section({ id, eyebrow, title, lead, children }) {
  return (
    <section id={id} className="mt-24 md:mt-32">
      <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-400">{eyebrow}</p>
      <h2 className="mt-3 text-2xl md:text-3xl font-heathergreen text-neutral-900">{title}</h2>
      {lead && <p className="mt-4 text-neutral-600 leading-relaxed max-w-2xl">{lead}</p>}
      {children}
    </section>
  );
}


export default function ArchitecturePage() {
  const [params, setParams] = useSearchParams();
  const reduced = usePrefersReducedMotion();
  const [selectedNode, setSelectedNode] = useState(null);

  // Read once, on mount — after that the player owns the state and the URL
  // follows it, rather than the two trying to drive each other.
  //
  // With no flow in the URL the page opens on the first one and plays it. A
  // static box diagram is the thing this page exists to be better than, so
  // arriving at a static box diagram would rather miss the point.
  const [initial] = useState(() => ({
    initialFlowId: params.get("flow") ?? FLOWS[0].id,
    initialStep: params.has("step") ? Number(params.get("step")) - 1 : null,
    // Selecting a flow is fine either way; advancing through it on its own is
    // motion, so it waits for a click when motion is unwelcome.
    autoplay: !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  }));
  const player = useFlowPlayer(initial);

  const { flowId, stepIndex } = player;
  useEffect(() => {
    const next = new URLSearchParams();
    if (flowId) {
      next.set("flow", flowId);
      next.set("step", String(stepIndex + 1));
    }
    setParams(next, { replace: true });
  }, [flowId, stepIndex, setParams]);

  // Keyboard transport. Only bound while a flow is open, so the page behaves
  // like an ordinary document the rest of the time.
  useEffect(() => {
    if (!player.flow) return;

    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (event.key === "ArrowRight") player.next();
      else if (event.key === "ArrowLeft") player.prev();
      else if (event.key === " ") {
        event.preventDefault();
        player.toggle();
      } else if (event.key === "Escape") player.exit();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player]);

  return (
    <PageShell
      width="max-w-6xl"
      eyebrow="System design"
      title="How this site actually works"
      subtitle="Every box below is real, and every arrow is a request that happens. A portfolio grid tells you what someone made; this tells you what they decided, what it cost, and what is still wrong with it."
    >
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white rounded-xl overflow-hidden">
        {STATS.map((stat) => {
          const tone = cardStyle(stat.color);
          return (
            <div key={stat.label} style={{ backgroundColor: stat.color }} className="px-5 py-4">
              <p className={`text-[10px] tracking-[0.18em] uppercase ${tone.label}`}>{stat.label}</p>
              <p className={`mt-1 text-2xl md:text-3xl font-heathergreen tabular-nums ${tone.value}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-14">
        <FlowPicker player={player} />
      </div>

      <div className="mt-6">
        <ArchitectureDiagram
          player={player}
          selectedNode={selectedNode}
          onSelectNode={(id) => setSelectedNode((current) => (current === id ? null : id))}
          reduced={reduced}
        />
      </div>

      {player.flow && (
        <div className="mt-4">
          <FlowNarration player={player} />
        </div>
      )}

      {/* The channel key lives inside the diagram card, next to what it decodes. */}
      <p className="mt-3 text-xs text-neutral-300 lg:hidden">Diagram scrolls sideways.</p>

      {selectedNode && (
        <NodeInspector
          nodeId={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSelectFlow={(id) => {
            setSelectedNode(null);
            if (player.flowId !== id) player.selectFlow(id);
          }}
        />
      )}

      <Section
        eyebrow="The obvious question"
        title="Where's the database?"
        lead="There isn't one, and that is the design rather than an omission. Three things share the job a database would otherwise do, and each of them is better at its share than a database would be."
      >
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [
              "git",
              "Content store",
              "Markdown posts, the Worker, the CI workflow and the route table are all versioned together. Every deploy is a commit, so 'what was live on Tuesday' is a question with an exact answer.",
            ],
            [
              "Blogger",
              "Write path",
              "Publishing is someone else's uptime problem. The cost of that convenience is showing up twice on this page — once as a proxy, once as a JSONP call.",
            ],
            [
              "api.github.com",
              "Live data",
              "The /github page reads from the system of record rather than a copy of it, and /notes reads a second repository the same way. Nothing to sync, nothing to go stale, nothing to migrate.",
            ],
          ].map(([name, role, body]) => (
            <div key={name} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-[10px] tracking-[0.18em] uppercase text-neutral-400">{role}</p>
              <p className="mt-2 font-mono text-sm text-neutral-900">{name}</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-neutral-600 leading-relaxed max-w-2xl">
          The moment any of this needs to store something a visitor typed, the answer changes — and
          it becomes a Worker with a KV or D1 binding rather than a server, because the edge is
          already in the request path and a server would not be.
        </p>
      </Section>

      <Section
        eyebrow="Caching"
        title="Five places a byte can be waiting"
        lead="Static sites are supposed to be simple, and then you count the layers. Each of these holds a copy of something, and each is invalidated by a completely different event."
      >
        <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left" style={{ minWidth: 640 }}>
            <thead>
              <tr className="border-b border-neutral-100">
                {["Layer", "What it holds", "Invalidated by"].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-[10px] tracking-[0.18em] uppercase text-neutral-400 font-medium"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CACHE_LAYERS.map((row) => (
                <tr key={row.layer} className="border-b border-neutral-50 last:border-0 align-top">
                  <td className="px-6 py-4 text-sm text-neutral-900 whitespace-nowrap">{row.layer}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{row.holds}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{row.invalidated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Trade-offs"
        title="Six decisions and what each one cost"
        lead="Anyone can list the technologies they used. The interesting half is the bill that came with each choice, so both halves are here."
      >
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {DECISIONS.map((decision) => (
            <div key={decision.title} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="text-base font-medium text-neutral-900">{decision.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{decision.why}</p>
              <p className="mt-4 pt-4 border-t border-neutral-100 text-sm leading-relaxed text-neutral-500">
                <span className="text-[10px] tracking-[0.18em] uppercase text-neutral-400 block mb-1.5">
                  What it costs
                </span>
                {decision.cost}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Honesty"
        title="What's still wrong with it"
        lead="A system-design page that only lists good decisions is marketing. These are the things I know about and have not fixed."
      >
        <ol className="mt-8 space-y-6">
          {WARTS.map((wart, i) => (
            <li key={wart.title} className="flex gap-5">
              <span className="text-xs tabular-nums text-neutral-300 pt-1 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base text-neutral-900">{wart.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 max-w-2xl">{wart.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow="Scale"
        title="What breaks first at 100× traffic"
        lead="Not the origin. Cloudflare absorbs static traffic without noticing, and GitHub Pages only ever sees cache misses. The failures come from the two places where this site depends on someone else in real time."
      >
        <ol className="mt-8 space-y-6">
          {[
            [
              "The GitHub API, behind shared IPs",
              "The 60/hour limit is per client IP, so it scales naturally with visitors — right up until a few hundred of them share one corporate NAT or mobile carrier gateway, and /github starts failing for all of them at once. The fix is a Worker that holds a token in a secret and caches the response: 60 per hour per visitor becomes one upstream call per minute, for everyone.",
            ],
            [
              "Blogger, as a synchronous dependency",
              "Right now /blog is exactly as available as Blogger is. Wrapping the proxy in the Cache API with stale-while-revalidate would let the last good copy keep serving through an outage — the same trick the SPA already plays with its markdown fallback, applied one layer out.",
            ],
            [
              "Knowing any of this happened",
              "There is no observability at all. No error rate, no cache hit ratio, no idea whether the fallback has ever actually fired in production. That is the cheapest thing on this list to fix and the one I would do first.",
            ],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-5">
              <span className="text-xs tabular-nums text-neutral-300 pt-1 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 max-w-2xl">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <div className="mt-24 pt-10 border-t border-neutral-200 flex flex-wrap items-center gap-x-8 gap-y-3">
        <a
          href={REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-900 border-b border-neutral-900 hover:text-neutral-500 hover:border-neutral-300 transition-colors"
        >
          Read the source ↗
        </a>
        <Link to="/tools" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          Tools
        </Link>
        <a href="/blog" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          Blog
        </a>
        <Link to="/github" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          GitHub
        </Link>
      </div>
    </PageShell>
  );
}
