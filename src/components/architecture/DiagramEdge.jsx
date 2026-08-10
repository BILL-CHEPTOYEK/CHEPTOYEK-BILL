import { EDGE_BY_ID, CHANNELS } from "../../architecture/model.js";
import { edgeGeometry } from "../../architecture/layout.js";

/**
 * One wire.
 *
 * Colour comes from the edge's channel, so the five kinds of hop are
 * distinguishable without reading a single label. Idle uses the light end of
 * the ramp and the active step uses the saturated end, which means "what is
 * happening right now" reads as brightness rather than as yet another hue.
 */
export default function DiagramEdge({ id, state, showLabel }) {
  const edge = EDGE_BY_ID[id];
  const geometry = edgeGeometry(id);
  if (!edge || !geometry) return null;

  const channel = CHANNELS[edge.channel];
  const active = state === "active";
  const traversed = state === "traversed";
  const dim = state === "dim";

  const stroke = active || traversed ? channel.active : channel.idle;
  const width = active ? 2.2 : traversed ? 1.6 : 1.4;

  return (
    <g
      style={{
        opacity: dim ? 0.22 : traversed ? 0.75 : 1,
        transition: "opacity 320ms ease",
      }}
    >
      <path
        d={geometry.d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={active ? "5 6" : channel.dash}
        className={active ? "architecture-edge-live" : undefined}
        markerEnd={`url(#arrow-${edge.channel}-${active || traversed ? "active" : "idle"})`}
        style={{ transition: "stroke 240ms ease, stroke-width 240ms ease" }}
      />

      {showLabel && edge.label && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={geometry.label.x - edge.label.length * 3.1 - 6}
            y={geometry.label.y - 8}
            width={edge.label.length * 6.2 + 12}
            height={16}
            rx={8}
            fill="#ffffff"
          />
          <text
            x={geometry.label.x}
            y={geometry.label.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8.5}
            letterSpacing={0.8}
            fontWeight={active ? 600 : 400}
            fill={active ? channel.active : "#a3a3a3"}
          >
            {edge.label.toUpperCase()}
          </text>
        </g>
      )}
    </g>
  );
}
