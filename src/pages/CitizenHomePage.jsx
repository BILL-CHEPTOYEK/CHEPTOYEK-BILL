import React from "react";
import { useNavigate } from "react-router-dom";

export default function CitizenHomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-white text-neutral-900 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">

        {/* Identity */}
        <div className="space-y-6">

          {/* <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              CHEPTOYEK BILL
            </h1>

            <p className="mt-3 text-2xl text-center text-neutral-600">
              Software Engineer
            </p>
          </div> */}

          {/* Philosophy */}
          <div className="space-y-4 text-center border border-gray-200">
            <p className="text-5xl font-bold leading-relaxed text-neutral-800">
              I build, I learn, I refine..
            </p>

            <p className="text-lg leading-relaxed text-neutral-600">
              Every project is an opportunity to learn something new and leave the codebase better than I found it.
            </p>

            <p className="text-sm tracking-[0.25em] text-neutral-400 pt-2">
              RELIABLE
            </p>
          </div>

          {/* Navigation */}
          <div className="pt-4 space-y-1">

            <NavItem label="Projects" onClick={() => navigate("/projects")} />
            <NavItem label="Products" onClick={() => window.open("https://docs.cheptoyek.com", "_blank")} />
            <NavItem label="Experience" onClick={() => navigate("/experience")} />
            <NavItem label="Writing" onClick={() => navigate("/writing")} />
            <NavItem label="Contact" onClick={() => navigate("/contact")} />

          </div>

        </div>
      </div>
    </main>
  );
}

// navigation
function NavItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        group w-full flex items-center justify-between
        py-3 text-left
        border-b border-neutral-200
        hover:border-neutral-900
        transition
      "
    >
      <span className="text-base md:text-lg text-neutral-800 group-hover:text-black transition">
        {label}
      </span>

      <span className="text-neutral-400 group-hover:text-black transition">
        →
      </span>
    </button>
  );
}
