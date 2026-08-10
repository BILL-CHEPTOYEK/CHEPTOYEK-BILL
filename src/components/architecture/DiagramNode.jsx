import { NODE_BY_ID } from "../../architecture/model";
import { nodeGeometry } from "../../architecture/layout";

/**
 * Left accent bar shade per band. The palette across the whole diagram is
 * greyscale on purpose — colour is reserved for the one thing that moves, so
 * an active path reads instantly instead of competing with decoration.
 */
const ACCENT = {
  client: "#a3a3a3",
  edge: "#171717",
  origin: "#525252",
  build: "#d4d4d4",
};

export default function DiagramNode({
  id,
  state, // "idle" | "dim" | "visited" | "active"
  selected,
  hovered,
  onSelect,
  onHover,
  accent = "#171717",
}) {
  const node = NODE_BY_ID[id];
  const geometry = nodeGeometry(id);
  if (!node || !geometry) return null;

  const { x, y, w, h } = geometry;
  const emphasised = state === "active" || selected;
  const lit = emphasised || state === "visited" || hovered;
  // A box being stepped through borrows the current channel's colour; one you
  // merely clicked stays neutral, so the two kinds of attention don't look alike.
  const edgeColour = state === "active" ? accent : "#171717";

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${node.label} — ${node.summary}`}
      aria-pressed={selected}
      className="architecture-node"
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(id);
        }
      }}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{
        opacity: state === "dim" ? 0.24 : 1,
        transition: "opacity 320ms ease",
        cursor: "pointer",
      }}
    >
      {emphasised && (
        <rect
          x={x - 5}
          y={y - 5}
          width={w + 10}
          height={h + 10}
          rx={15}
          fill="none"
          stroke={edgeColour}
          strokeOpacity={0.22}
          strokeWidth={1}
        />
      )}

      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={11}
        fill="#ffffff"
        stroke={emphasised ? edgeColour : lit ? "#a3a3a3" : "#e5e5e5"}
        strokeWidth={emphasised ? 1.6 : 1}
        style={{
          transition: "stroke 240ms ease, stroke-width 240ms ease",
          filter: emphasised
            ? "drop-shadow(0 6px 16px rgba(0,0,0,0.10))"
            : "drop-shadow(0 1px 2px rgba(0,0,0,0.03))",
        }}
      />

      {/* Band accent. Clipped to the card's radius by matching its geometry. */}
      <rect
        x={x + 1}
        y={y + 13}
        width={2.5}
        height={h - 26}
        rx={1.25}
        fill={ACCENT[node.column]}
        opacity={emphasised ? 1 : 0.55}
      />

      <text
        x={x + 18}
        y={node.source ? y + 26 : y + h / 2 + 1}
        dominantBaseline="middle"
        fontSize={13}
        fontWeight={emphasised ? 600 : 500}
        fill={state === "active" ? edgeColour : emphasised ? "#171717" : "#404040"}
        style={{ pointerEvents: "none" }}
      >
        {node.label}
      </text>

      {node.source && (
        <text
          x={x + 18}
          y={y + h - 13}
          fontSize={8.5}
          fill="#a3a3a3"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          style={{ pointerEvents: "none" }}
        >
          {node.source.split("/").pop()}
        </text>
      )}
    </g>
  );
}
