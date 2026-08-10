/**
 * Geometry checks for the architecture diagram.
 *
 * The layout is hand-placed on a grid, which means a wire can quietly end up
 * running through a box that isn't its endpoint the moment a row moves. That
 * is invisible in a code review and obvious on screen, so it gets asserted
 * here instead of discovered later.
 */

import { NODES, EDGES, FLOWS, EDGE_BY_ID, NODE_BY_ID } from "./model.js";
import { LAYOUT, pointAt } from "./layout.js";

let failures = 0;
const fail = (message) => {
  failures++;
  console.log(`FAIL ${message}`);
};
const ok = (message) => console.log(`ok   ${message}`);

const CLEARANCE = 6;
const SAMPLES = 240;

// 1. Model integrity: every edge and flow points at something real.
EDGES.forEach((edge) => {
  if (!NODE_BY_ID[edge.from]) fail(`edge ${edge.id} has unknown source ${edge.from}`);
  if (!NODE_BY_ID[edge.to]) fail(`edge ${edge.id} has unknown target ${edge.to}`);
});
FLOWS.forEach((flow) =>
  flow.steps.forEach((step, i) => {
    if (!EDGE_BY_ID[step.edge]) fail(`${flow.id} step ${i} references unknown edge ${step.edge}`);
    if (step.dir !== 1 && step.dir !== -1) fail(`${flow.id} step ${i} has invalid dir ${step.dir}`);
  })
);
if (failures === 0) ok("model references resolve");

// 2. No two nodes overlap.
NODES.forEach((a, i) =>
  NODES.slice(i + 1).forEach((b) => {
    const ga = LAYOUT.nodes[a.id];
    const gb = LAYOUT.nodes[b.id];
    const overlaps =
      ga.left < gb.right && ga.right > gb.left && ga.top < gb.bottom && ga.bottom > gb.top;
    if (overlaps) fail(`nodes ${a.id} and ${b.id} overlap`);
  })
);
ok("no node overlaps");

// 3. Vertical breathing room between stacked nodes in the same column.
const byColumn = {};
NODES.forEach((node) => {
  (byColumn[node.column] ??= []).push(node);
});
Object.entries(byColumn).forEach(([column, nodes]) => {
  const sorted = [...nodes].sort((a, b) => a.row - b.row);
  sorted.slice(1).forEach((node, i) => {
    const gap = LAYOUT.nodes[node.id].top - LAYOUT.nodes[sorted[i].id].bottom;
    if (gap < 24) fail(`only ${gap.toFixed(0)}px between ${sorted[i].id} and ${node.id} in ${column}`);
  });
});
ok("column spacing is legible");

// 4. No edge passes through a node that isn't one of its endpoints.
EDGES.forEach((edge) => {
  const geometry = LAYOUT.edges[edge.id];
  for (let s = 0; s <= SAMPLES; s++) {
    const point = pointAt(geometry, s / SAMPLES);
    NODES.forEach((node) => {
      if (node.id === edge.from || node.id === edge.to) return;
      const g = LAYOUT.nodes[node.id];
      const inside =
        point.x > g.left - CLEARANCE &&
        point.x < g.right + CLEARANCE &&
        point.y > g.top - CLEARANCE &&
        point.y < g.bottom + CLEARANCE;
      if (inside) fail(`edge ${edge.id} passes through node ${node.id}`);
    });
  }
});
ok("no edge crosses an unrelated node");

// 5. pointAt is well behaved at the ends and monotonic in between.
EDGES.forEach((edge) => {
  const geometry = LAYOUT.edges[edge.id];
  const start = pointAt(geometry, 0);
  const end = pointAt(geometry, 1);
  const first = geometry.points[0];
  const last = geometry.points[geometry.points.length - 1];

  if (Math.hypot(start.x - first.x, start.y - first.y) > 0.01) fail(`${edge.id}: t=0 is not the start`);
  if (Math.hypot(end.x - last.x, end.y - last.y) > 0.01) fail(`${edge.id}: t=1 is not the end`);
  if (geometry.length <= 0) fail(`${edge.id} has zero length`);

  // Walking t from 0 to 1 must cover the whole polyline and no more. Sampling
  // discretely cuts each corner by up to one step, so the lower bound allows
  // for that; the upper bound has no such excuse.
  let travelled = 0;
  let previous = start;
  for (let s = 1; s <= SAMPLES; s++) {
    const point = pointAt(geometry, s / SAMPLES);
    travelled += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  const corners = geometry.points.length - 2;
  const slack = corners * (geometry.length / SAMPLES) + 0.01;

  if (travelled > geometry.length + 0.01) {
    fail(`${edge.id}: sampled ${travelled.toFixed(2)} exceeds length ${geometry.length.toFixed(2)}`);
  }
  if (travelled < geometry.length - slack) {
    fail(`${edge.id}: sampled ${travelled.toFixed(2)} short of ${geometry.length.toFixed(2)}`);
  }
});
ok("pointAt spans each edge exactly once");

// 6. Everything fits inside the declared viewBox.
NODES.forEach((node) => {
  const g = LAYOUT.nodes[node.id];
  if (g.left < 0 || g.top < 0 || g.right > LAYOUT.width || g.bottom > LAYOUT.height) {
    fail(`node ${node.id} falls outside the viewBox`);
  }
});
ok("all nodes inside the viewBox");

// 7. Every node is reachable by at least one flow — an unreachable box on a
//    page about request paths is a box that should not be drawn.
const reachable = new Set();
FLOWS.forEach((flow) =>
  flow.steps.forEach((step) => {
    const edge = EDGE_BY_ID[step.edge];
    reachable.add(edge.from);
    reachable.add(edge.to);
  })
);
NODES.forEach((node) => {
  if (!reachable.has(node.id)) fail(`node ${node.id} appears in no flow`);
});
ok("every node appears in a flow");

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
