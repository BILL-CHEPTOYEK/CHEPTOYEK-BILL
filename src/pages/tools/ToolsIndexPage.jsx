import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell";

const TOOLS = [
  {
    slug: "config-diff",
    name: "Config diff",
    description:
      "Structural diff for JSON, YAML, .env and INI. Ignores key order, matches arrays by identity, and calls out type-only changes. Falls back to a line diff for source code. Exports a JSON Patch.",
    tag: "New",
  },
  {
    slug: "json-formatter",
    name: "JSON formatter",
    description: "Format, validate, and minify JSON.",
  },
];

export default function ToolsIndexPage() {
  return (
    <PageShell
      title="Tools"
      subtitle="Small utilities I built for myself, shared here. All of them run entirely in the browser."
    >
      <div className="mt-14 grid sm:grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            to={`/tools/${tool.slug}`}
            className="group flex flex-col border border-neutral-200 rounded-xl p-6 hover:border-neutral-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                {tool.name}
              </h2>
              {tool.tag && (
                <span className="shrink-0 text-[10px] tracking-[0.15em] uppercase text-neutral-400 border border-neutral-200 rounded-full px-2.5 py-1">
                  {tool.tag}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{tool.description}</p>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-neutral-300">More tools, as they ship.</p>
    </PageShell>
  );
}
