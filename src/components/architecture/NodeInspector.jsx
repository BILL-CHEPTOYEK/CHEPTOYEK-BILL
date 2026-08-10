import { NODE_BY_ID, flowsForNode, edgesForNode } from "../../architecture/model";

/**
 * Detail panel for a single box in the diagram.
 *
 * A diagram that only shows shapes is a decoration. Everything worth knowing
 * about a component — what it actually is, what file defines it, which
 * scenarios touch it — is one click away here.
 */
export default function NodeInspector({ nodeId, onClose, onSelectFlow }) {
  const node = NODE_BY_ID[nodeId];
  if (!node) return null;

  const flows = flowsForNode(nodeId);
  const connections = edgesForNode(nodeId).length;

  return (
    <div key={nodeId} className="animate-panel-in mt-4 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-400">
            {node.column === "edge" ? "Edge" : node.column} · {connections} connection
            {connections === 1 ? "" : "s"}
          </p>
          <h3 className="mt-2 text-2xl font-heathergreen text-neutral-900">{node.label}</h3>
          <p className="mt-1 text-sm text-neutral-500">{node.summary}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="shrink-0 text-[11px] tracking-[0.15em] uppercase text-neutral-300 hover:text-neutral-700 transition-colors"
        >
          Close
        </button>
      </div>

      <p className="mt-6 text-[0.95rem] leading-relaxed text-neutral-600 max-w-2xl">
        {node.detail}
      </p>

      <dl className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {node.facts.map(([term, value]) => (
          <div key={term} className="border-t border-neutral-100 pt-3">
            <dt className="text-[10px] tracking-[0.18em] uppercase text-neutral-400">{term}</dt>
            <dd className="mt-1 text-sm text-neutral-800">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        {node.source && (
          <p className="text-xs text-neutral-400">
            Defined in{" "}
            <code className="font-mono text-neutral-700 bg-neutral-100 rounded px-1.5 py-0.5">
              {node.source}
            </code>
          </p>
        )}

        {flows.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400">Appears in</span>
            {flows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => onSelectFlow(flow.id)}
                className="text-xs text-neutral-700 border-b border-neutral-300 hover:border-neutral-900 transition-colors"
              >
                {flow.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
