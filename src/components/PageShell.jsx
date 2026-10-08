import { Link } from "react-router-dom";
import Decor from "./Decor";

/**
 * The frame every non-landing page shares: a back link, a display-face title,
 * a subtitle, and a max-width column. Extracted because four pages had
 * independently drifted copies of it.
 *
 * Title face, accent rule and soft background are the same vocabulary as the
 * landing page, so the site reads as one thing rather than a set of pages that
 * happen to share a domain.
 */
export default function PageShell({
  backTo = "/home",
  backLabel = "Home",
  eyebrow,
  title,
  subtitle,
  width = "max-w-3xl",
  /* Archivo Black carries a lot of weight per character, so anything with a
     long, arbitrary title - a blog post - wants a step down from the default. */
  titleClass = "text-3xl md:text-5xl",
  children,
}) {
  return (
    <main className="relative min-h-screen bg-white px-6 py-16 md:py-24">
      <Decor variant="page" />

      <div className={`relative z-10 ${width} mx-auto`}>
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
          className={`${
            eyebrow ? "mt-3" : "mt-8"
          } font-hero text-3xl md:text-5xl leading-[1.02] tracking-[-0.02em] text-neutral-900`}
        >
          {title}
        </h1>

        <div className="mt-5 h-[3px] w-14 rounded-full bg-[#e9c84f]" />

        {subtitle && (
          <p className="mt-5 text-neutral-500 leading-relaxed max-w-2xl">{subtitle}</p>
        )}

        {children}
      </div>
    </main>
  );
}
