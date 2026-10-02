import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
      className="h-[100dvh] w-screen overflow-hidden bg-white text-neutral-900 relative flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 text-lg text-neutral-800 hover:text-black transition-colors z-10"
      >
        Cheptoyek Bill
      </Link>

      <ArrowButton side="left" disabled={index === 0} onClick={() => goTo(index - 1)} />
      <ArrowButton side="right" disabled={index === PANELS.length - 1} onClick={() => goTo(index + 1)} />

      {/* items-start + my-auto, not items-center: a centered flex child that
          overflows its scroll container has an unreachable top edge. */}
      <div className="flex-1 flex items-start justify-center px-6 md:px-12 overflow-y-auto scrollbar-hide">
        <div key={index} className="animate-panel-in w-full my-auto">
          {index === 0 && <About onNext={() => goTo(1)} />}
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

function Eyebrow({ index, children, flush = false }) {
  return (
    <p className={`text-xs tracking-[0.3em] uppercase text-neutral-400 ${flush ? "" : "mb-6"}`}>
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

// function About({ onNext }) {
//   return (
//     <div className="max-w-5xl mx-auto w-full py-20 lg:py-0">
//       {/* <Eyebrow index={1}>About</Eyebrow> */}
//       daa
//       <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-[-0.015em] text-neutral-900 max-w-[22ch] py-10">
//         Most of the software I write,{" "}
//         <span className="text-neutral-400">you will never open.</span>
//       </h2>

//       {/* The container stays max-w-5xl; the meta rail absorbs the extra width so
//           the prose column lands at a readable measure instead of one wide slab. */}
//       <div className="mt-10 lg:mt-12 grid gap-10 lg:gap-16 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
//         <aside className="lg:sticky lg:top-0 flex flex-row lg:flex-col items-center lg:items-start gap-5 lg:gap-0">
//           <img
//             src="/dp.jpg"
//             alt="Cheptoyek Bill"
//             className="w-14 h-14 lg:w-20 lg:h-20 shrink-0 rounded-full object-cover border border-neutral-200 grayscale"
//             loading="lazy"
//           />
//           <div className="lg:mt-5 text-sm leading-relaxed">
//             <p className="text-neutral-900">Software Engineer</p>
//             <p className="text-neutral-500">Uganda Revenue Authority</p>
//             <p className="text-neutral-500">Kampala, Uganda</p>
//           </div>
//         </aside>

//         <div className="space-y-5 text-base lg:text-lg leading-relaxed text-neutral-600">
//           <p>
//             It runs at a border. At the{" "}
//             <span className="text-neutral-900">Uganda Revenue Authority</span>, in the
//             Information Technology and Innovation Department, I work on customs solutions, most
//             of them around non-intrusive inspection: the scanning that lets an image analyst see
//             inside a sealed container without breaking a seal, and the systems that carry that
//             scan into the rest of customs.
//           </p>
//           <p>
//             A scan on its own is just a picture. Matched to the right declaration, it becomes a
//             decision.
//           </p>
//           <p>
//             Cargo doesn't wait, so the code can't either. A slow response is a queue of trucks
//             at a border post. A bad match is somebody's shipment sitting still for a day. It's
//             unglamorous work with very real edges, and that's the part I like.
//           </p>
//           <p>
//             From 22 August to 22 September 2026 I was at the Oliver Reginald Tambo School of
//             Leadership and Pan-African Centre of Excellence, on the Transformational Leadership
//             Course. A lot of it stays with me. This most of all:
//           </p>

//           <blockquote className="border-l-2 border-neutral-200 pl-6 py-1">
//             <p className="font-display italic text-2xl lg:text-3xl leading-snug text-neutral-900">
//               A low level of political education breeds selfishness and mischief. It is the
//               mother of corruption in the army{" "}
//               <span className="text-neutral-400">[public service]</span>.
//             </p>
//             <cite className="mt-3 block not-italic text-xs tracking-[0.15em] uppercase text-neutral-400">
//               Yoweri Kaguta Museveni, On the Value of Political Education, 1989
//             </cite>
//           </blockquote>

//           <p>
//             The mechanics stuck with me more than the phrase. Wealth smuggled out of the country
//             isn't a private win, it's a school that doesn't get built and a road that doesn't
//             get repaired. That is the exact leak I spend my days trying to close, which makes
//             matching a scan to a declaration something other than a technical chore.
//           </p>

//           <p className="text-neutral-900">
//             I build, I learn, I refine. Everything else here, the tools, the notes, the diagram
//             of how this page even reached you, is the same instinct pointed at smaller problems.
//           </p>

//           <p className="text-sm text-neutral-500">
//             Before this: Makerere University, a stint at Tricsoft, and a long list of side
//             projects that taught me more than they were ever supposed to.
//           </p>

//           <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-4">
//             <PillButton onClick={onNext}>My work →</PillButton>
//             {/* CV stays dead until Bill says the PDF is current. Flip to false then. */}
//             <QuietLink href="/cv.pdf" disabled>
//               Full CV
//             </QuietLink>
//             <QuietLink href="https://github.com/BILL-CHEPTOYEK">GitHub</QuietLink>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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

function ProjectCard({ name, tagline, description, href, cta, status }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col text-left border border-neutral-100 rounded-2xl p-6 md:p-8 hover:border-neutral-200 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl md:text-2xl font-normal text-neutral-900">
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

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 tracking-[0.15em] text-2xl sm:text-3xl md:text-4xl font-normal text-neutral-900">
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
      <p className="text-3xl md:text-4xl font-normal text-neutral-900">Say hello.</p>
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
