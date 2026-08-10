import { Link } from "react-router-dom";

/**
 * The frame every non-landing page shares: a back link, a display-face title,
 * a subtitle, and a max-width column. Extracted because four pages had
 * independently drifted copies of it.
 */
export default function PageShell({
  backTo = "/home",
  backLabel = "Home",
  eyebrow,
  title,
  subtitle,
  width = "max-w-3xl",
  children,
}) {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16 md:py-24">
      <div className={`${width} mx-auto`}>
        <Link
          to={backTo}
          className="text-xs tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          ← {backLabel}
        </Link>

        {eyebrow && (
          <p className="mt-8 text-[11px] tracking-[0.25em] uppercase text-neutral-400">{eyebrow}</p>
        )}

        <h1
          className={`${eyebrow ? "mt-3" : "mt-8"} text-3xl md:text-5xl font-normal font-heathergreen text-neutral-900`}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 text-neutral-500 leading-relaxed max-w-2xl">{subtitle}</p>
        )}

        {children}
      </div>
    </main>
  );
}
