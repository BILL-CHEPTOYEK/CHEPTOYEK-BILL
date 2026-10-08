import React from "react";
import { Link } from "react-router-dom";
import Decor from "../components/Decor";

/* Entrance stagger. One keyframe (.animate-rise), different delays, so the eye
   lands on the name first and the buttons last. */
const rise = (ms) => ({ animationDelay: `${ms}ms` });

export default function LandingPage() {
  return (
    /* No overflow-hidden here on purpose - Decor clips itself, and clipping
       main would cut the content off on a short landscape phone. */
    <main className="relative min-h-[100dvh] bg-white text-neutral-900 flex flex-col">
      <Decor />

      {/* A small element at the top edge so the page has a lid and the headline
          reads as deliberately low rather than as fallen. */}
      <header className="relative z-10 px-6 md:px-12 pt-7 md:pt-9">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-neutral-400">
          <span className="animate-rise" style={rise(0)}>cheptoyek.com</span>
          <span className="animate-rise" style={rise(80)}>Kampala, Uganda</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-center px-6 md:px-12 py-16">
        <div className="max-w-5xl mx-auto w-full">
          <h1
            className="animate-rise font-hero text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.02em]"
            style={rise(120)}
          >
            Cheptoyek Bill.
          </h1>

          <p
            className="animate-rise mt-6 flex items-center gap-2.5 text-sm md:text-base font-semibold text-neutral-900"
            style={rise(220)}
          >
            <MarkIcon />
            Software Engineer, Uganda Revenue Authority
          </p>

          <div
            className="animate-rise mt-4 h-[3px] w-14 rounded-full bg-[#e9c84f]"
            style={rise(300)}
          />

          <p
            className="animate-rise mt-6 italic text-base md:text-lg text-neutral-500 max-w-xl"
            style={rise(360)}
          >
            The change I want to see
          </p>

          <h2
            className="animate-rise mt-7 font-hero text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.02em] max-w-3xl"
            style={rise(430)}
          >
            Building software that uplifts humanity....
          </h2>

          <div
            className="animate-rise mt-12 md:mt-16 flex flex-wrap items-center gap-3 sm:justify-end"
            style={rise(520)}
          >
            <a
              href="https://github.com/BILL-CHEPTOYEK"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 rounded-md border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
            >
              GitHub
            </a>
            <Link
              to="/home"
              className="px-10 py-3 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/* The small glyph beside the role line. Three ruled lines and a tick - it reads
   as "filed, checked" at 16px, which is the whole job. */
function MarkIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      stroke="#3b7ea1"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M2 4h11M2 8h8M2 12h5" />
      <path d="M10.5 12.5l2 2 4-4.5" />
    </svg>
  );
}
