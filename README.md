# cheptoyek.com

Personal site - React 19, Vite, Tailwind v4. Static, no backend, no database.

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
npm test         # diff engine, diagram geometry, JSON formatter, note renderer, page meta
```

Node 20.19.0 is what CI pins, what `.nvmrc` selects and what `engines` requires.
It is a floor, not a preference: Vite 7 needs `crypto.hash`, so `npm run dev`
fails outright on Node 18 even though `npm run build` still limps through.

## Fonts

Two faces, both SIL Open Font License 1.1, loaded from Google Fonts in
`index.html`:

- **Archivo Black** ([upstream](https://github.com/Omnibus-Type/ArchivoBlack))
  for display titles, via the `font-hero` utility.
- **Inter** ([upstream](https://github.com/rsms/inter)) for everything else.

Both are declared in the `@theme` block in `src/index.css`. That block is where
they have to be: Tailwind generates the `font-hero` class from the `--font-hero`
theme key, so defining it anywhere else means the class is never emitted and
every title quietly falls back to the body face, with nothing failing to warn
you.

## Layout

```
src/
  architecture/        System model, layout maths and flow playback for /architecture.
                       Pure JS - model.js is the single source of truth for the
                       diagram, the node inspector and the narration.
  lib/config-diff/     The semantic diff engine behind /tools/config-diff.
                       Parsers, diff, JSON Patch and report output. No React.
  lib/page-meta/       Title, description and canonical URL strings. Applied by
                       the useDocumentMeta hook in components/.
  components/          Shared UI, plus one folder per feature.
  pages/               One component per route.
  notes/               Fetches and renders the study notes repo at runtime.
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

There is no test runner - the suites are plain Node scripts, some using
`node --test`, that exit non-zero on failure:

- `src/lib/config-diff/diff.test.mjs` - parsing, diff semantics, array
  alignment, patch and report output.
- `src/architecture/layout.test.mjs` - diagram geometry: no overlapping nodes,
  no wire crossing an unrelated box, every node reachable by a flow.
- `src/lib/json-format/format.test.mjs` - tokenizing, linting and repair.
- `src/notes/render.test.mjs` - what the note renderer must not emit.
- `src/lib/page-meta/meta.test.mjs` - title and description string handling.

The geometry one exists because a hand-placed diagram breaks silently when a
row moves, and that is not something code review catches. The renderer one is
there for a similar reason: notes are fetched from another repository and go
into `dangerouslySetInnerHTML`, so "this input produces no attribute and no
scheme we didn't intend" needs to be a test rather than a careful reading.

CI runs `npm test` on every push and pull request. It does not run
`npm run lint`, which still reports one known error - see `CLAUDE.md`.

## Deploying

Push to `main`. GitHub Actions tests, builds and force-pushes `dist/` to
`gh-pages`; Cloudflare picks it up on the next cache miss. Asset filenames are
content-hashed, so no purge step is needed.

A pull request runs the same test and build steps but does not deploy - the
publish step is gated on `github.event_name == 'push'`.

`public/sitemap.xml` lists the static routes by hand. Adding a route to
`App.jsx` means adding it there too.

The `/blog` path is owned by the Cloudflare Worker in production, not by the
router - see the "what's still wrong with it" section on `/architecture`.
