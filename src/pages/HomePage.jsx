import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Decor from "../components/Decor";

const PANELS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(null);

  const goTo = (next) => setIndex(Math.max(0, Math.min(PANELS.length - 1, next)));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 50) goTo(index + (delta < 0 ? 1 : -1));
    touchStart.current = null;
  };

  return (
    <main
      className="relative h-[100dvh] w-screen overflow-hidden bg-white text-neutral-900 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Decor variant="home" />

      {/* Same top rail as the landing page, down to the type size and tracking,
          so stepping from / to /home doesn't feel like a different site. */}
      <header className="relative z-10 px-6 md:px-12 pt-7 md:pt-9">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-neutral-400">
          <Link to="/" className="hover:text-neutral-700 transition-colors">
            ← Cheptoyek Bill
          </Link>
          <span>Kampala, Uganda</span>
        </div>
      </header>

      <ArrowButton side="left" disabled={index === 0} onClick={() => goTo(index - 1)} />
      <ArrowButton side="right" disabled={index === PANELS.length - 1} onClick={() => goTo(index + 1)} />

      {/* items-start + my-auto, not items-center: a centered flex child that
          overflows its scroll container has an unreachable top edge. */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-6 md:px-12 overflow-y-auto scrollbar-hide">
        <div key={index} className="animate-panel-in w-full my-auto py-12 md:py-16">
          {index === 0 && <About onNext={() => goTo(1)} />}
          {index === 1 && <Projects />}
          {index === 2 && <Contact />}
        </div>
      </div>

      <nav className="relative z-10 pb-8 md:pb-10 flex items-center justify-center gap-6 md:gap-10">
        {PANELS.map((panel, i) => (
          <button
            key={panel.id}
            onClick={() => goTo(i)}
            className={`text-[11px] tracking-[0.22em] uppercase transition-colors ${
              i === index ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-600"
            }`}
          >
            <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="hidden sm:inline"> {panel.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function ArrowButton({ side, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-2 md:left-6" : "right-2 md:right-6"
      } w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-neutral-700 transition-colors disabled:opacity-0 disabled:pointer-events-none z-20`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

/* Every panel opens the same way: numbered eyebrow, display headline, the
   yellow rule. The rule is the one piece of colour the landing page and
   PageShell also use, so it ties the three together. */
function PanelHead({ index, label, children, className = "" }) {
  return (
    <>
      <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-400">
        {String(index).padStart(2, "0")} - {label}
      </p>
      <h2
        className={`mt-4 font-hero text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em] text-neutral-900 ${className}`}
      >
        {children}
      </h2>
      <div className="mt-5 h-[3px] w-14 rounded-full bg-[#e9c84f]" />
    </>
  );
}

/* Landing-page buttons: square-ish corners, dark fill for the one action that
   matters, a bordered neutral for everything else. The old rounded-full pills
   were the only control on the site shaped like that. */
function PrimaryButton({ children, onClick, href }) {
  const className =
    "inline-block px-8 py-3 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors";
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-7 py-3 rounded-md border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
    >
      {children}
    </a>
  );
}

function QuietLink({ href, children, disabled = false }) {
  if (disabled) {
    return (
      <span className="text-sm text-neutral-300 cursor-not-allowed select-none">
        {children} <span className="text-[11px] tracking-[0.15em] uppercase">updating</span>
      </span>
    );
  }

  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-sm text-neutral-500 border-b border-neutral-200 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
    >
      {children} ↗
    </a>
  );
}

function About({ onNext }) {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <PanelHead index={1} label="About" className="max-w-[22ch]">
        Most of the software I write,{" "}
        <span className="text-neutral-400">you will never open.</span>
      </PanelHead>

      {/* The container stays max-w-5xl; the meta rail absorbs the extra width so
          the prose column lands at a readable measure instead of one wide slab. */}
      <div className="mt-10 lg:mt-12 grid gap-10 lg:gap-16 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        <aside className="lg:sticky lg:top-0 flex flex-row lg:flex-col items-center lg:items-start gap-5 lg:gap-0">
          <img
            src="/dp.jpg"
            alt="Cheptoyek Bill"
            className="w-14 h-14 lg:w-20 lg:h-20 shrink-0 rounded-full object-cover border border-neutral-200 grayscale"
            loading="lazy"
          />
          <div className="lg:mt-5 text-sm leading-relaxed">
            <p className="text-neutral-900">Software Engineer</p>
            <p className="text-neutral-500">Uganda Revenue Authority</p>
            <p className="text-neutral-500">Kampala, Uganda</p>
          </div>
        </aside>

        <div className="space-y-5 text-base lg:text-lg leading-relaxed text-neutral-600">
          <p>
            It runs at a border.
          </p>
          <p>
            Cargo doesn't wait, so the code can't either. A slow response isn't a red line on a
            dashboard. It's a queue at a border post, and somebody's shipment standing still for
            a day.
          </p>
          <p className="text-neutral-900">
            I build, I learn, I refine. Everything else here, the tools, the notes, the diagram
            of how this page even reached you, is the same instinct pointed at smaller problems.
          </p>

          <p className="text-sm text-neutral-500">
            Alumni-Makerere University..
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-4">
            <PrimaryButton onClick={onNext}>My work →</PrimaryButton>
            {/* CV stays dead until Bill says the PDF is current. Flip to false then. */}
            <QuietLink href="/cv.pdf" disabled>
              Full CV
            </QuietLink>
            <QuietLink href="https://github.com/BILL-CHEPTOYEK">GitHub</QuietLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ name, tagline, description, href, cta, status }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col text-left border border-neutral-200 rounded-xl p-6 md:p-8 bg-white/70 hover:border-neutral-400 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl md:text-2xl font-normal text-neutral-900">{name}</h3>
        {status && (
          <span className="shrink-0 text-[10px] tracking-[0.15em] uppercase text-neutral-400 border border-neutral-200 rounded-full px-2.5 py-1">
            {status}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-500">{tagline}</p>
      <p className="mt-4 text-sm md:text-base leading-relaxed text-neutral-600">{description}</p>
      <span className="mt-5 inline-block w-fit text-sm font-medium text-neutral-900 border-b border-neutral-900 group-hover:text-neutral-500 group-hover:border-neutral-300 transition-colors">
        {cta} ↗
      </span>
    </a>
  );
}

function ComingSoonCard() {
  return (
    <div className="flex flex-col items-start justify-center border border-dashed border-neutral-200 rounded-xl p-6 md:p-8">
      <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-300">Next up</p>
      <p className="mt-3 text-sm md:text-base leading-relaxed text-neutral-500 max-w-xs">
        More projects are in the works. Check back soon.
      </p>
    </div>
  );
}

/* The rest of the site, as a list rather than the big link wall it used to be.
   Each row says what the thing is, which the bare word never did. */
const ELSEWHERE = [
  { to: "/blog", label: "Blog", note: "Longer pieces. Just interesting stuff." },
  { to: "/notes", label: "Notes", note: "Working notes, currently on double-entry bookkeeping." },
  { to: "/tools", label: "Tools", note: "A JSON formatter and a config diff. Both run in the browser." },
  { to: "/architecture", label: "Architecture", note: "How this site is hosted, cached and shipped." },
  { to: "/github", label: "GitHub", note: "Repositories, pulled live." },
];

function Projects() {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <PanelHead index={2} label="Projects">
        Things I have built{" "}
        <span className="text-neutral-400">and kept running.</span>
      </PanelHead>

      <div className="mt-10 lg:mt-12 grid gap-5 md:gap-6 sm:grid-cols-2">
        <ProjectCard
          name="MasterDocs"
          tagline="Master your documents."
          status="Live"
          description="Merge, split, compress, and convert PDFs - fast, private, and never stored."
          href="https://docs.cheptoyek.com"
          cta="Visit docs.cheptoyek.com"
        />
        <ComingSoonCard />
      </div>

      <p className="mt-12 text-[11px] tracking-[0.25em] uppercase text-neutral-400">Elsewhere</p>
      <ul className="mt-5 border-t border-neutral-100">
        {ELSEWHERE.map(({ to, label, note }) => {
          const external = to.startsWith("/blog");
          const Row = (
            <>
              <span className="text-lg md:text-xl text-neutral-900 group-hover:text-neutral-500 transition-colors">
                {label}
              </span>
              <span className="text-sm text-neutral-500 sm:text-right">{note}</span>
            </>
          );
          const className =
            "group grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline py-3.5 border-b border-neutral-100";
          return (
            <li key={to}>
              {external ? (
                <a href={to} className={className}>
                  {Row}
                </a>
              ) : (
                <Link to={to} className={className}>
                  {Row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Contact() {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <PanelHead index={3} label="Contact">
        Say hello.
      </PanelHead>

      <div className="mt-10 lg:mt-12 grid gap-10 lg:gap-16 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
        <aside className="text-sm leading-relaxed">
          <p className="text-neutral-900">bill@cheptoyek.com</p>
          <p className="text-neutral-500">Kampala, Uganda</p>
          <p className="text-neutral-500">UTC+3</p>
        </aside>

        <div>
          <p className="text-base lg:text-lg leading-relaxed text-neutral-600 max-w-xl">
            Open to conversations about software, products, and building things that last. Mail
            is the surest way to reach me.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryButton href="mailto:bill@cheptoyek.com">Email me →</PrimaryButton>
            <SecondaryButton href="https://github.com/BILL-CHEPTOYEK">GitHub</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
