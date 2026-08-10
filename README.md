# cheptoyek.com

Personal site — React 19, Vite, Tailwind v4. Static, no backend, no database.

The system it runs on is documented, with an interactive diagram, at
[`/architecture`](https://cheptoyek.com/architecture). That page is the
authoritative description of how hosting, DNS, caching and CI/CD fit together;
this file only covers working on the code.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run lint
npm test         # config diff engine + diagram geometry
```

Node 20.19.0 is what CI pins.

## Layout

```
src/
  architecture/        System model, layout maths and flow playback for /architecture.
                       Pure JS — model.js is the single source of truth for the
                       diagram, the node inspector and the narration.
  lib/config-diff/     The semantic diff engine behind /tools/config-diff.
                       Parsers, diff, JSON Patch and report output. No React.
  components/          Shared UI, plus one folder per feature.
  pages/               One component per route.
  blog/                Markdown posts and the Blogger/local post sources.
cloudflare/            The Worker that reverse-proxies /blog onto Blogger.
.github/workflows/     Build and publish to the gh-pages branch.
```

Two conventions worth knowing:

- **Pure logic lives outside `components/`.** `src/architecture/*.js` and
  `src/lib/**` have no React imports, which is what lets them be tested with
  plain `node` and no test framework.
- **Those modules use explicit `.js` import extensions** so they run under Node
  directly. JSX files follow the extensionless style used elsewhere.

## Tests

There is no test runner — the two suites are plain Node scripts that exit
non-zero on failure:

- `src/lib/config-diff/diff.test.mjs` — parsing, diff semantics, array
  alignment, patch and report output.
- `src/architecture/layout.test.mjs` — diagram geometry: no overlapping nodes,
  no wire crossing an unrelated box, every node reachable by a flow.

The second one exists because a hand-placed diagram breaks silently when a row
moves, and that is not something code review catches.

## Deploying

Push to `main`. GitHub Actions builds and force-pushes `dist/` to `gh-pages`;
Cloudflare picks it up on the next cache miss. Asset filenames are
content-hashed, so no purge step is needed.

The `/blog` path is owned by the Cloudflare Worker in production, not by the
router — see the "what's still wrong with it" section on `/architecture`.
