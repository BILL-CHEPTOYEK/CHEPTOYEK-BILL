# Working on cheptoyek.com

See `README.md` for build commands and the directory layout. This file is about
how the work should be done.

## Writing rules

**No em dashes. None, anywhere.** Not in page copy, not in blog posts, not in
code comments, not in commit messages, not in replies in chat. Use a hyphen
with spaces around it instead: ` - `. If a sentence leans on an em dash to hold
itself together, the sentence usually wants to be two sentences. Applies to the
en dash in prose too: use ` - `.

So a sentence that would have read "It runs at a border [em dash] and the code
can't wait" becomes either "It runs at a border, and the code can't wait" or,
better, "It runs at a border. The code can't wait."

**Write the way a person talks.** Short declaratives. Say the concrete thing
instead of the impressive-sounding version of it. Avoid the usual tells: "delve",
"leverage", "robust", "seamless", "it's not just X, it's Y", triples that exist
only for rhythm, and paragraphs that end on a neat aphorism. One good line beats
three polished ones.

**Don't invent facts about Bill or about URA systems.** Names of systems,
courses, institutions, dates and quotes must come from him or from a source that
can be checked. If something can't be verified, ask rather than filling the gap
with something plausible.

**Prefer dates over relative time.** "Between 22 August and 22 September 2026",
not "recently". Relative wording on a static site goes stale and nobody
remembers to update it.

## UI rules

**`max-w-5xl` is the default content width.** Not `max-w-2xl`. A narrow column
of text on a wide monitor wastes the screen and is annoying to read.

When a wide container would push prose past a comfortable line length, fix it
with layout, not by shrinking the container: split into columns, put a meta rail
beside the text, use a grid. The container stays wide, the measure stays
readable.

**Position things deliberately.** Every margin, alignment and breakpoint should
have a reason. Check how it behaves at narrow widths and at full desktop width,
not just one of them.

## Code conventions

- Pure logic lives outside `components/` (`src/architecture/*.js`, `src/lib/**`)
  and has no React imports, so it can be tested with plain `node`. Those modules
  use explicit `.js` import extensions. JSX files stay extensionless.
- Run `npm run build` and `npm test` before calling work done.
- `npm run lint` has one pre-existing error in `src/components/json-format/JsonTree.jsx`.
  Don't count it as a regression, and don't fix it as a drive-by either.
