import { useEffect, useMemo, useRef, useState } from "react";
import {
  NODES,
  EDGES,
  CHANNELS,
  edgesForNode,
  stepEndpoints,
  channelOfStep,
} from "../../architecture/model.js";
import { LAYOUT, nodeGeometry } from "../../architecture/layout.js";
import DiagramNode from "./DiagramNode";
import DiagramEdge from "./DiagramEdge";
import FlowPacket from "./FlowPacket";

/**
 * The diagram surface.
 *
 * Three states are layered on top of each other, in priority order:
 *   1. a flow is playing   → the current hop is lit, everything else recedes
 *   2. a node is hovered   → that node's wires lift out of the background
 *   3. nothing is happening → a plain, quiet map
 */
export default function ArchitectureDiagram({ player, selectedNode, onSelectNode, reduced }) {
  const [hovered, setHovered] = useState(null);
  const scroller = useRef(null);
  const { flow, step, visited, traversed, stepKey } = player;

  // On a narrow screen the diagram is wider than the viewport, so the hop being
  // narrated can be off to the side. Pan to it as the flow advances — otherwise
  // playback on a phone is a caption for something you can't see.
  useEffect(() => {
    const element = scroller.current;
    if (!element || !step) return;

    const overflow = element.scrollWidth - element.clientWidth;
    if (overflow <= 0) return;

    const { from, to } = stepEndpoints(step);
    const a = nodeGeometry(from);
    const b = nodeGeometry(to);
    if (!a || !b) return;

    const scale = element.scrollWidth / LAYOUT.width;
    const centre = ((Math.min(a.left, b.left) + Math.max(a.right, b.right)) / 2) * scale;
    const target = Math.max(0, Math.min(overflow, centre - element.clientWidth / 2));

    element.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  }, [stepKey, step, reduced]);

  const hoveredEdges = useMemo(
    () => new Set(hovered ? edgesForNode(hovered).map((e) => e.id) : []),
    [hovered]
  );

  const activeNodes = step ? stepEndpoints(step) : null;
  // The colour of whatever is happening right now, shared by the lit wire, the
  // packet and the two boxes it runs between.
  const accent = step ? channelOfStep(step).active : "#171717";

  const nodeState = (id) => {
    if (flow) {
      if (activeNodes && (activeNodes.from === id || activeNodes.to === id)) return "active";
      return visited.has(id) ? "visited" : "dim";
    }
    return "idle";
  };

  const edgeState = (id) => {
    if (flow) {
      if (step?.edge === id) return "active";
      return traversed.has(id) ? "traversed" : "dim";
    }
    return hovered ? (hoveredEdges.has(id) ? "traversed" : "dim") : "idle";
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div ref={scroller} className="architecture-canvas overflow-x-auto">
      <svg
        viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
        width="100%"
        role="img"
        aria-label={
          flow
            ? `Architecture diagram, showing flow: ${flow.label}`
            : "Architecture diagram of cheptoyek.com"
        }
        style={{ minWidth: 940, display: "block" }}
      >
        <defs>
          {/* One arrowhead per channel per state — SVG markers can't inherit
              the stroke colour of the path that references them. */}
          {Object.entries(CHANNELS).flatMap(([name, channel]) =>
            ["idle", "active"].map((tone) => (
              <marker
                key={`${name}-${tone}`}
                id={`arrow-${name}-${tone}`}
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 7 4 L 0 7 z" fill={channel[tone]} />
              </marker>
            ))
          )}
          <pattern id="grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#e5e5e5" />
          </pattern>
        </defs>

        <rect width={LAYOUT.width} height={LAYOUT.height} fill="url(#grid-dots)" opacity={0.55} />

        {/* Band backgrounds and headers */}
        {LAYOUT.columns.map((column) => (
          <g key={column.id}>
            <rect
              x={column.bandX}
              y={46}
              width={column.bandW}
              height={LAYOUT.height - 66}
              rx={16}
              fill="#fafafa"
              stroke="#f5f5f5"
            />
            <text x={column.x} y={18} fontSize={9.5} letterSpacing={1.6} fill="#737373" fontWeight={500}>
              {column.label.toUpperCase()}
            </text>
            <text x={column.x} y={33} fontSize={9.5} fill="#c4c4c4">
              {column.note}
            </text>
          </g>
        ))}

        <g>
          {EDGES.map((edge) => (
            <DiagramEdge
              key={edge.id}
              id={edge.id}
              state={edgeState(edge.id)}
              showLabel={!flow || step?.edge === edge.id || traversed.has(edge.id)}
            />
          ))}
        </g>

        <g>
          {NODES.map((node) => (
            <DiagramNode
              key={node.id}
              id={node.id}
              state={nodeState(node.id)}
              selected={selectedNode === node.id}
              hovered={hovered === node.id}
              onSelect={onSelectNode}
              onHover={setHovered}
              accent={accent}
            />
          ))}
        </g>

        {step && (
          <FlowPacket
            key={player.stepKey}
            edgeId={step.edge}
            dir={step.dir}
            reduced={reduced}
            color={accent}
          />
        )}
        </svg>
      </div>

      {/* The key sits inside the card, because a legend two scroll-positions
          away from the thing it decodes is not a legend. */}
      <div className="border-t border-neutral-100 px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {Object.entries(CHANNELS).map(([name, channel]) => (
          <span
            key={name}
            title={channel.hint}
            className="inline-flex items-center gap-2 text-[11px] text-neutral-600"
          >
            <svg width="22" height="8" aria-hidden="true">
              <line
                x1="0"
                y1="4"
                x2="22"
                y2="4"
                stroke={channel.active}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={channel.dash ?? undefined}
              />
            </svg>
            {channel.label}
          </span>
        ))}
        <span className="text-[11px] text-neutral-300 ml-auto">
          Click any box for the reasoning behind it.
        </span>
      </div>
    </div>
  );
}
