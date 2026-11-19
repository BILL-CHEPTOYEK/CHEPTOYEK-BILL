import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PageShell from "../components/PageShell";

const DESTINATIONS = [
  { to: "/home", name: "Home", description: "About, projects and how to get hold of me." },
  { to: "/tools", name: "Tools", description: "Config diff and the JSON formatter." },
  { to: "/notes", name: "Notes", description: "Accounting for software engineers." },
  { to: "/architecture", name: "Architecture", description: "How this site is actually hosted." },
];

/**
 * Catch-all for a path the router doesn't know.
 *
 * It matters more here than on a server-rendered site: GitHub Pages serves
 * 404.html, which bounces every unknown path back through index.html, so
 * without this route a typo'd URL mounted the app and then rendered nothing at
 * all - a blank white page with no way out.
 *
 * The 404 that Pages sent is long gone by the time this renders, so the status
 * code is 200 and a crawler would happily index this as a real page. Hence the
 * robots tag, removed again on unmount so it doesn't follow the visitor to the
 * next route.
 */
export default function NotFoundPage() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    meta.setAttribute("content", "noindex");
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <PageShell
      eyebrow="404"
      title="Nothing at this address."
      documentTitle="Page not found"
      subtitle={`There is no page at ${pathname}. It may have moved, or the link that brought you here may have been wrong.`}
    >
      <div className="mt-14 grid sm:grid-cols-2 gap-4">
        {DESTINATIONS.map((destination) => (
          <Link
            key={destination.to}
            to={destination.to}
            className="group block border border-neutral-200 rounded-xl p-6 hover:border-neutral-400 transition-colors"
          >
            <h2 className="text-lg font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
              {destination.name}
            </h2>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
              {destination.description}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
