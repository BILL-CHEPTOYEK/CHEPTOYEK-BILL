/**
 * Deterministic layout for the architecture diagram.
 *
 * Pure geometry: the model goes in, pixel coordinates come out. No React, no
 * DOM measurement, no randomness. That last part is deliberate — packet
 * animation needs to know where a wire is at progress `t`, and computing it
 * analytically from the polyline is both cheaper and more predictable than
 * asking the browser via getPointAtLength() on every frame.
 */

import { COLUMNS, NODES, EDGES, NODE_BY_ID } from "./model.js";

const NODE_W = 178;
const NODE_H = 62;
const COL_GAP = 300;
const ROW_GAP = 96;
const PAD_X = 40;
const PAD_TOP = 84; // room for the column headers
const PAD_BOTTOM = 44;
const CORNER = 12;

const colX = (index) => PAD_X + index * COL_GAP;
const rowY = (row) => PAD_TOP + row * ROW_GAP;

const COLUMN_INDEX = Object.fromEntries(COLUMNS.map((c, i) => [c.id, i]));

function box(node) {
  const x = colX(COLUMN_INDEX[node.column]);
  const y = rowY(node.row);
  return {
    id: node.id,
    x,
    y,
    w: NODE_W,
    h: NODE_H,
    cx: x + NODE_W / 2,
    cy: y + NODE_H / 2,
    left: x,
    right: x + NODE_W,
    top: y,
    bottom: y + NODE_H,
  };
}

/** Elbow route: leave through a side, make one vertical turn, enter a side. */
function elbowPoints(a, b, turn) {
  const goingRight = b.cx > a.cx;
  const start = { x: goingRight ? a.right : a.left, y: a.cy };
  const end = { x: goingRight ? b.left : b.right, y: b.cy };

  if (Math.abs(start.y - end.y) < 0.5) return [start, end];

  const xTurn = start.x + (end.x - start.x) * turn;
  return [start, { x: xTurn, y: start.y }, { x: xTurn, y: end.y }, end];
}

/** Straight vertical run between two boxes stacked in the same column. */
function verticalPoints(a, b) {
  const downward = b.cy > a.cy;
  return [
    { x: a.cx, y: downward ? a.bottom : a.top },
    { x: b.cx, y: downward ? b.top : b.bottom },
  ];
}

/** Straight line between facing sides, crossing whatever lies between. */
function directPoints(a, b) {
  const goingRight = b.cx > a.cx;
  return [
    { x: goingRight ? a.right : a.left, y: a.cy },
    { x: goingRight ? b.left : b.right, y: b.cy },
  ];
}

function pointsFor(edge, a, b) {
  if (edge.route === "v") return verticalPoints(a, b);
  if (edge.route === "direct") return directPoints(a, b);
  return elbowPoints(a, b, edge.turn ?? 0.5);
}

/**
 * SVG path with rounded corners. The corner radius shortens each adjoining
 * segment slightly, so the drawn path is a hair shorter than the polyline the
 * packet walks. At r=12 the discrepancy is sub-pixel per corner — not worth
 * the arc-length integration it would take to remove.
 */
function toPath(points) {
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];

    const inLen = Math.hypot(corner.x - prev.x, corner.y - prev.y);
    const outLen = Math.hypot(next.x - corner.x, next.y - corner.y);
    const r = Math.min(CORNER, inLen / 2, outLen / 2);

    const enter = {
      x: corner.x - ((corner.x - prev.x) / inLen) * r,
      y: corner.y - ((corner.y - prev.y) / inLen) * r,
    };
    const exit = {
      x: corner.x + ((next.x - corner.x) / outLen) * r,
      y: corner.y + ((next.y - corner.y) / outLen) * r,
    };

    d += ` L ${enter.x} ${enter.y} Q ${corner.x} ${corner.y} ${exit.x} ${exit.y}`;
  }

  const last = points[points.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

function measure(points) {
  const lengths = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    lengths.push(len);
    total += len;
  }
  return { lengths, total };
}

/**
 * Position along an edge at progress `t` (0 → `from`, 1 → `to`), walking the
 * polyline segment by segment. Also returns the unit direction, so a caller
 * can orient a marker without recomputing anything.
 */
export function pointAt(geometry, t) {
  const { points, lengths, length } = geometry;
  const clamped = Math.max(0, Math.min(1, t));
  let remaining = clamped * length;

  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const ratio = lengths[i] === 0 ? 0 : remaining / lengths[i];
      const a = points[i];
      const b = points[i + 1];
      return {
        x: a.x + (b.x - a.x) * ratio,
        y: a.y + (b.y - a.y) * ratio,
        dx: (b.x - a.x) / (lengths[i] || 1),
        dy: (b.y - a.y) / (lengths[i] || 1),
      };
    }
    remaining -= lengths[i];
  }

  const last = points[points.length - 1];
  return { x: last.x, y: last.y, dx: 0, dy: 0 };
}

/** Same, but respecting a flow step's direction. */
export function pointAtDirected(geometry, t, dir) {
  return pointAt(geometry, dir === -1 ? 1 - t : t);
}

function computeLayout() {
  const nodes = Object.fromEntries(NODES.map((node) => [node.id, box(node)]));

  const edges = Object.fromEntries(
    EDGES.map((edge) => {
      const points = pointsFor(edge, nodes[edge.from], nodes[edge.to]);
      const { lengths, total } = measure(points);
      const geometry = { points, lengths, length: total };
      return [
        edge.id,
        {
          id: edge.id,
          ...geometry,
          d: toPath(points),
          label: pointAt(geometry, 0.5),
        },
      ];
    })
  );

  const maxRow = Math.max(...NODES.map((n) => n.row));
  const width = PAD_X * 2 + NODE_W + (COLUMNS.length - 1) * COL_GAP;
  const height = rowY(maxRow) + NODE_H + PAD_BOTTOM;

  const columns = COLUMNS.map((column, index) => ({
    ...column,
    x: colX(index),
    bandX: colX(index) - 22,
    bandW: NODE_W + 44,
  }));

  return { nodes, edges, columns, width, height, nodeWidth: NODE_W, nodeHeight: NODE_H };
}

/** The model never changes at runtime, so the layout is computed exactly once. */
export const LAYOUT = computeLayout();

export function nodeGeometry(id) {
  return LAYOUT.nodes[id] ?? null;
}

export function edgeGeometry(id) {
  return LAYOUT.edges[id] ?? null;
}

export { NODE_BY_ID };
