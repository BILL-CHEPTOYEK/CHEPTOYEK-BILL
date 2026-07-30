import { Link } from "react-router-dom";

const TOOLS = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON.",
  },
  // More tools land here as they ship.
];

export default function ToolsIndexPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/home"
          className="text-xs tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          ← Home
        </Link>

        <h1 className="mt-8 text-4xl md:text-5xl font-normal font-heathergreen text-neutral-900">
          Tools
        </h1>
        <p className="mt-3 text-neutral-500">
          Small utilities I built for myself, shared here.
        </p>

        <div className="mt-14 grid sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              to={`/tools/${tool.slug}`}
              className="group block border border-neutral-200 rounded-xl p-6 hover:border-neutral-400 transition-colors"
            >
              <h2 className="text-lg font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                {tool.name}
              </h2>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{tool.description}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-xs text-neutral-300">More tools, as they ship.</p>
      </div>
    </main>
  );
}
