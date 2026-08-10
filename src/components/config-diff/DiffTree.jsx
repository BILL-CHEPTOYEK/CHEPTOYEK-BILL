import { useState } from "react";
import { formatPath } from "../../lib/config-diff/diff";
import { KIND_META, segmentLabel } from "../../lib/config-diff/format";
import DiffRow from "./DiffRow";

function KindDots({ kinds }) {
  return (
    <span className="flex items-center gap-1">
      {[...kinds].map((kind) => (
        <span
          key={kind}
          title={KIND_META[kind].label}
          className={`w-1.5 h-1.5 rounded-full ${KIND_META[kind].dot}`}
        />
      ))}
    </span>
  );
}

function Branch({ node, depth, collapsed, onToggle, maskSecrets }) {
  const key = formatPath(node.path);
  const isCollapsed = collapsed.has(key);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      {node.change ? (
        <DiffRow
          change={node.change}
          label={segmentLabel(node.key)}
          depth={depth}
          maskSecrets={maskSecrets}
        />
      ) : (
        <button
          onClick={() => onToggle(key)}
          className="w-full flex items-center gap-2 px-4 py-2 border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors text-left"
          style={{ paddingLeft: 16 + depth * 18 }}
          aria-expanded={!isCollapsed}
        >
          <span className="w-5 text-center text-neutral-300 text-[10px]">
            {isCollapsed ? "▸" : "▾"}
          </span>
          <span className="font-mono text-[12.5px] text-neutral-500">{segmentLabel(node.key)}</span>
          <KindDots kinds={node.kinds} />
          <span className="text-[11px] text-neutral-300 ml-auto tabular-nums">
            {node.children.length}
          </span>
        </button>
      )}

      {hasChildren && !isCollapsed && (
        <div>
          {node.children.map((child) => (
            <Branch
              key={formatPath(child.path)}
              node={child}
              depth={depth + 1}
              collapsed={collapsed}
              onToggle={onToggle}
              maskSecrets={maskSecrets}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Two readings of the same change list.
 *
 * Tree keeps the shape of the document, which is how you think when you are
 * looking for where a change lives. Flat gives every row its full path, which
 * is how you think when you are about to paste one into a terminal.
 */
export default function DiffTree({ tree, changes, view, maskSecrets }) {
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggle = (key) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  if (view === "flat") {
    return (
      <div>
        {changes.map((change, index) => (
          <DiffRow
            key={`${formatPath(change.path)}:${change.kind}:${index}`}
            change={change}
            label={formatPath(change.path) || "(root)"}
            maskSecrets={maskSecrets}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {tree.children.map((child) => (
        <Branch
          key={formatPath(child.path)}
          node={child}
          depth={0}
          collapsed={collapsed}
          onToggle={toggle}
          maskSecrets={maskSecrets}
        />
      ))}
    </div>
  );
}
