import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PANELS = [
  { id: "philosophy", label: "Philosophy" },
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
      className="h-[100dvh] w-screen overflow-hidden bg-white text-neutral-900 relative flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 font-heathergreen text-lg text-neutral-800 hover:text-black transition-colors z-10"
      >
        Cheptoyek Bill
      </Link>

      <ArrowButton side="left" disabled={index === 0} onClick={() => goTo(index - 1)} />
      <ArrowButton side="right" disabled={index === PANELS.length - 1} onClick={() => goTo(index + 1)} />

      <div className="flex-1 flex items-center justify-center px-6 md:px-12 overflow-y-auto scrollbar-hide">
        <div key={index} className="animate-panel-in w-full">
          {index === 0 && <Philosophy onNext={() => goTo(1)} />}
          {index === 1 && <Projects />}
          {index === 2 && <Contact />}
        </div>
      </div>

      <nav className="pb-8 md:pb-10 flex items-center justify-center gap-6 md:gap-10">
        {PANELS.map((panel, i) => (
          <button
            key={panel.id}
            onClick={() => goTo(i)}
            className={`text-xs tracking-[0.15em] uppercase transition-colors ${
              i === index ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-500"
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
      } w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-neutral-700 transition-colors disabled:opacity-0 disabled:pointer-events-none z-10`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

function Eyebrow({ index, children }) {
  return (
    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-6">
      {String(index).padStart(2, "0")} - {children}
    </p>
  );
}

function PillButton({ children, onClick, href }) {
  const className =
    "inline-block px-7 py-2.5 bg-black text-white text-sm rounded-full font-medium hover:bg-neutral-800 transition-all duration-300 hover:scale-105";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
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

function Philosophy({ onNext }) {
  return (
    <div className="max-w-xl mx-auto text-center">
      <Eyebrow index={1}>Philosophy</Eyebrow>
      <p className="text-3xl md:text-5xl font-normal font-heathergreen leading-tight text-neutral-900">
        I build, I learn, I refine.
      </p>
      <p className="mt-6 text-base md:text-lg leading-relaxed text-neutral-500">
        Every project is an opportunity to learn something new and leave the
        codebase better than I found it.
      </p>
      <p className="mt-8 text-xs tracking-[0.3em] text-neutral-400">RELIABLE</p>

      <div className="mt-10">
        <PillButton onClick={onNext}>My work →</PillButton>
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
      className="group flex flex-col text-left border border-neutral-100 rounded-2xl p-6 md:p-8 hover:border-neutral-200 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl md:text-2xl font-normal font-heathergreen text-neutral-900">
          {name}
        </h3>
        {status && (
          <span className="shrink-0 text-[10px] tracking-[0.15em] uppercase text-neutral-400 border border-neutral-100 rounded-full px-2.5 py-1">
            {status}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-500">{tagline}</p>
      <p className="mt-4 text-sm md:text-base leading-relaxed text-neutral-600">
        {description}
      </p>
      <span className="mt-5 inline-block w-fit text-sm font-medium text-neutral-900 border-b border-neutral-900 group-hover:text-neutral-500 group-hover:border-neutral-300 transition-colors">
        {cta} ↗
      </span>
    </a>
  );
}

function ComingSoonCard() {
  return (
    <div className="flex flex-col items-center justify-center text-center border border-dashed border-neutral-100 rounded-2xl p-6 md:p-8">
      <p className="text-[11px] tracking-[0.2em] uppercase text-neutral-300">Next up</p>
      <p className="mt-3 text-sm md:text-base leading-relaxed text-neutral-500 max-w-xs">
        More projects are in the works. Check back soon.
      </p>
    </div>
  );
}

function Projects() {
  return (
    <div className="max-w-5xl mx-auto text-center">
      <Eyebrow index={2}>Projects</Eyebrow>

      <div className="grid gap-5 md:gap-6 sm:grid-cols-2">
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

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 tracking-[0.15em] text-2xl sm:text-3xl md:text-4xl font-normal font-heathergreen text-neutral-900">
        <a href="/blog" className="hover:text-neutral-800 transition-colors">Blog</a>
        <Link to="/notes" className="hover:text-neutral-800 transition-colors">Notes</Link>
        <Link to="/tools" className="hover:text-neutral-800 transition-colors">Tools</Link>
        <Link to="/architecture" className="hover:text-neutral-800 transition-colors">Architecture</Link>
        <Link to="/github" className="hover:text-neutral-800 transition-colors">GitHub</Link>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="max-w-xl mx-auto text-center">
      <Eyebrow index={3}>Contact</Eyebrow>
      <p className="text-3xl md:text-4xl font-normal font-heathergreen text-neutral-900">Say hello.</p>
      <p className="mt-4 text-neutral-500 max-w-sm mx-auto">
        Open to conversations about software, products, and building things
        that last.
      </p>

      <div className="mt-8">
        <PillButton href="mailto:bill@cheptoyek.com">Email me →</PillButton>
      </div>

      <div className="mt-6 flex items-center justify-center gap-5 text-xs tracking-[0.15em] uppercase text-neutral-400">
        <a href="https://github.com/BILL-CHEPTOYEK" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800 transition-colors">GitHub</a>
        {/* <a href="https://linkedin.com/in/bill-cheptoyek" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800 transition-colors">LinkedIn</a> */}
        {/* <a href="https://twitter.com/trojan__bill" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800 transition-colors">X</a> */}
      </div>
    </div>
  );
}
