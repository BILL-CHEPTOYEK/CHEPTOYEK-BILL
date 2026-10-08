/**
 * Page backgrounds. Two families, picked by `variant`:
 *
 *   "hero"  - a matrix of small plus marks, the registration marks off a
 *             technical drawing. Landing page only, where there is almost no
 *             text to compete with.
 *   "home"  - soft shapes: nested quarter-arcs off the top-right corner and a
 *             loose drift of dots off the bottom-left. Used on /home.
 *   "page"  - the same soft shapes, smaller and fainter, behind PageShell so
 *             they stay out of the way of long-form reading.
 *
 * Plus marks rather than a ruled grid on the landing: a square grid is the
 * default everybody reaches for, and it reads as graph paper. The same lattice
 * drawn as crosses keeps the engineering feel without the association.
 */

const MARK = "#171717";
const LATTICE = 26; // px between marks, in CSS pixels - the pattern does not scale with the panel
const ARM = 3.6; // half-length of each arm

/* Slate blue, not the sage green of the screen this borrows its shape language
   from. It picks up the blue already in the landing's role-line glyph, so the
   palette stays closed: neutrals, one yellow accent, this. */
const ARC_OUTER = "#e5ebf6";
const ARC_INNER = "#d7e2f2";
const ARC_HAIR = "#edf1f8";
const DOT = "#dde6f3";

/* Stops are front-loaded so the corner holds its weight for a while before it
   drops off. A plain two-stop fade spreads the ink evenly and ends up looking
   like haze rather than something that was drawn from the corner. */
const falloff = (origin, peak) =>
  `radial-gradient(112% 112% at ${origin}, rgba(0,0,0,${peak}) 0%, rgba(0,0,0,${(
    peak * 0.72
  ).toFixed(3)}) 18%, rgba(0,0,0,${(peak * 0.32).toFixed(3)}) 38%, rgba(0,0,0,${(
    peak * 0.16
  ).toFixed(3)}) 28%, transparent 88%)`;

const mask = (origin, peak) => ({
  maskImage: falloff(origin, peak),
  WebkitMaskImage: falloff(origin, peak),
});

function MarkField({ id, origin, peak, className }) {
  return (
    <svg className={`absolute ${className}`} style={mask(origin, peak)} aria-hidden="true">
      <defs>
        {/* userSpaceOnUse with no viewBox keeps one user unit equal to one CSS
            pixel, so the lattice stays the same size on every screen. */}
        <pattern id={id} width={LATTICE} height={LATTICE} patternUnits="userSpaceOnUse">
          <path
            d={`M${LATTICE / 2} ${LATTICE / 2 - ARM}v${ARM * 2}M${LATTICE / 2 - ARM} ${
              LATTICE / 2
            }h${ARM * 2}`}
            stroke={MARK}
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function MarkDecor() {
  return (
    <>
      <MarkField
        id="decor-tl-hero"
        origin="0% 0%"
        peak={0.62}
        className="top-0 left-0 w-[min(62vw,760px)] h-[min(64vh,660px)]"
      />
      <MarkField
        id="decor-br-hero"
        origin="100% 100%"
        peak={0.46}
        className="bottom-0 right-0 w-[min(52vw,620px)] h-[min(56vh,560px)]"
      />

      {/* One mark in the accent colour, unmasked, sitting on a lattice point.
          The only colour on the page besides the rule under the role line. */}
      <svg
        className="absolute top-0 left-0 w-[min(62vw,760px)] h-[min(64vh,660px)]"
        aria-hidden="true"
      >
        <path
          d={`M65 ${117 - ARM - 1}v${(ARM + 1) * 2}M${65 - ARM - 1} 117h${(ARM + 1) * 2}`}
          stroke="#e9c84f"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

/* Quarter-arcs sharing a centre on the top-right corner. Concentric curves
   rather than the straight tapered strokes this shape language came from - same
   softness, different handwriting, and they sit flat against the corner instead
   of cutting across it. */
const ARCS = [
  { r: 168, width: 27, color: ARC_OUTER },
  { r: 108, width: 16, color: ARC_INNER },
  { r: 62, width: 8, color: ARC_HAIR },
];

/* Fixed, hand-placed. Generating it at random would reshuffle on every mount
   and occasionally drop a dot under the first line of text. */
const DOTS = [
  [10, 150, 5.5], [34, 132, 3], [20, 108, 4], [48, 160, 2.5], [56, 118, 5],
  [74, 146, 3], [40, 86, 2.5], [68, 96, 4], [92, 124, 2.5], [96, 160, 4.5],
  [116, 136, 3], [86, 74, 3], [112, 100, 2.5], [134, 158, 3.5], [140, 118, 2.5],
  [62, 62, 2], [158, 146, 2.5],
];

function SoftDecor({ page }) {
  return (
    <>
      <svg
        viewBox="0 0 200 200"
        className={`absolute top-0 right-0 translate-x-[14%] -translate-y-[12%] ${
          page ? "w-44 sm:w-56 md:w-72 opacity-60" : "w-56 sm:w-72 md:w-96 lg:w-[26rem]"
        }`}
        fill="none"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {ARCS.map(({ r, width, color }) => (
          <path
            key={r}
            d={`M${200 - r} 0 A ${r} ${r} 0 0 0 200 ${r}`}
            stroke={color}
            strokeWidth={width}
          />
        ))}
      </svg>

      <svg
        viewBox="0 0 180 180"
        className={`absolute bottom-0 left-0 -translate-x-[8%] translate-y-[10%] ${
          page ? "w-36 sm:w-44 md:w-52 opacity-55" : "w-44 sm:w-56 md:w-72"
        }`}
        fill={DOT}
        aria-hidden="true"
      >
        {DOTS.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </svg>
    </>
  );
}

export default function Decor({ variant = "hero" }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {variant === "hero" ? <MarkDecor /> : <SoftDecor page={variant === "page"} />}
    </div>
  );
}
