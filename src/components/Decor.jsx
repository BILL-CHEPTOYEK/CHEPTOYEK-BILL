/**
 * Page backgrounds. Two families, picked by `variant`:
 *
 *   "hero"  - a matrix of small plus marks, the registration marks off a
 *             technical drawing. Landing page only, where there is almost no
 *             text to compete with.
 *   "home"  - a drift of small rings off the top-left corner and two soft
 *             blades sweeping up from the left edge. Used on /home.
 *   "page"  - the same shapes, smaller and fainter, behind PageShell so they
 *             stay out of the way of long-form reading.
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
   palette stays closed: neutrals, one yellow accent, this. Everything here sits
   between #dbe4f1 and #edf2f9 - light enough that body text never fights it. */
const RING = "#dbe4f1";
const BLADE = "#e2eaf6";
const BLADE_SOFT = "#edf2f9";

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

/* Rings, not filled dots. An outline holds its shape at 4px where a filled dot
   this pale just reads as a smudge, and it keeps the corner airy.
   Fixed and hand-placed: generated at random it would reshuffle on every mount
   and occasionally drop a ring under the first line of text. The drift runs on
   the diagonal, dense at the corner and thinning out as it leaves. */
const RINGS = [
  [8, 10, 4], [26, 16, 2.5], [44, 8, 3], [16, 34, 3], [36, 40, 4.5],
  [58, 28, 2], [6, 56, 2.5], [30, 62, 3], [52, 56, 3.5], [72, 46, 2.5],
  [12, 82, 4], [34, 88, 2.5], [56, 80, 3], [76, 70, 2], [94, 60, 3],
  [20, 108, 3], [44, 112, 2], [64, 100, 3.5], [86, 94, 2.5], [104, 84, 2],
  [28, 134, 2.5], [52, 138, 3], [72, 128, 2], [96, 118, 2.5], [118, 106, 3],
  [60, 160, 2], [84, 150, 2.5], [108, 142, 2], [132, 128, 2.5],
];

/* Two long strokes on the same slope and one short one under them. Round caps
   do the tapering by eye, so these stay plain <path> elements - no gradients,
   nothing to get expensive at full width. */
const BLADES = [
  { d: "M6 116 L150 28", width: 14, color: BLADE },
  { d: "M0 140 L118 68", width: 9, color: BLADE_SOFT },
  { d: "M74 136 L140 98", width: 6, color: BLADE_SOFT },
];

function SoftDecor({ page }) {
  return (
    <>
      <svg
        viewBox="0 0 200 200"
        className={`absolute top-0 left-0 -translate-x-[6%] -translate-y-[8%] ${
          page ? "w-40 sm:w-48 md:w-60 opacity-60" : "w-52 sm:w-64 md:w-80 lg:w-96"
        }`}
        fill="none"
        stroke={RING}
        strokeWidth="1.5"
        aria-hidden="true"
      >
        {RINGS.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </svg>

      {/* Anchored off the left edge at mid-height, the way the screen this
          borrows from puts them - low enough to clear a headline, high enough
          not to collide with a button row. */}
      <svg
        viewBox="0 0 160 160"
        className={`absolute left-0 top-[44%] -translate-x-[22%] ${
          page ? "w-48 sm:w-60 md:w-72 opacity-55" : "w-60 sm:w-80 md:w-[26rem]"
        }`}
        fill="none"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {BLADES.map(({ d, width, color }) => (
          <path key={d} d={d} stroke={color} strokeWidth={width} />
        ))}
      </svg>

      {/* One more off the right edge, mostly out of frame. It stops the page
          from leaning entirely to the left. */}
      <svg
        viewBox="0 0 120 200"
        className={`absolute right-0 bottom-[8%] translate-x-[34%] ${
          page ? "w-28 sm:w-36 opacity-50" : "w-36 sm:w-44 md:w-56"
        }`}
        fill="none"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M8 184 L104 56" stroke={BLADE_SOFT} strokeWidth="16" />
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
