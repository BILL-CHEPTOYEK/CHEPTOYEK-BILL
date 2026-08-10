import { useEffect, useRef } from "react";
import { edgeGeometry, pointAtDirected } from "../../architecture/layout";
import { TRAVEL_MS } from "../../architecture/useFlowPlayer";

/** Trailing dots, as offsets in progress behind the head. */
const TRAIL = [
  { lag: 0, r: 4.6, opacity: 1 },
  { lag: 0.045, r: 3.4, opacity: 0.4 },
  { lag: 0.09, r: 2.4, opacity: 0.18 },
];

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * The one moving thing in the diagram.
 *
 * Writes transforms straight to the DOM from a rAF loop instead of going
 * through state, so a step that takes 950ms costs zero React renders. The
 * parent remounts this component (via a `key`) to restart the clock.
 */
export default function FlowPacket({ edgeId, dir, reduced, color = "#171717" }) {
  const group = useRef(null);
  const trail = useRef([]);
  const halo = useRef(null);

  useEffect(() => {
    const geometry = edgeGeometry(edgeId);
    if (!geometry) return;

    const place = (progress) => {
      TRAIL.forEach((spec, i) => {
        const dot = trail.current[i];
        if (!dot) return;
        const point = pointAtDirected(geometry, Math.max(0, progress - spec.lag), dir);
        dot.setAttribute("cx", point.x);
        dot.setAttribute("cy", point.y);
        // The trail collapses onto the head at the ends of the run.
        dot.style.opacity = progress <= 0 ? 0 : spec.opacity;
      });

      if (halo.current) {
        const head = pointAtDirected(geometry, progress, dir);
        halo.current.setAttribute("cx", head.x);
        halo.current.setAttribute("cy", head.y);
      }

      if (group.current) group.current.style.opacity = 1;
    };

    if (reduced) {
      place(1);
      return;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / TRAVEL_MS);
      place(easeInOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    place(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [edgeId, dir, reduced]);

  return (
    <g ref={group} style={{ opacity: 0, pointerEvents: "none" }}>
      <circle ref={halo} r={13} fill={color} opacity={0.12} />
      {TRAIL.map((dot, i) => (
        <circle
          key={i}
          ref={(el) => {
            trail.current[i] = el;
          }}
          r={dot.r}
          fill={color}
          style={{ transition: "opacity 200ms ease" }}
        />
      ))}
    </g>
  );
}
