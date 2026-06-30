import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const text = "I'm Cheptoyek Bill.";
  const [typed, setTyped] = useState("");
  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    let index = 0;

    const timer = setInterval(() => {
      setTyped(text.slice(0, index + 1));
      index++;

      if (index === text.length) {
        clearInterval(timer);

        setTimeout(() => setShowSecond(true), 400);
        setTimeout(() => setShowThird(true), 900);
        setTimeout(() => setShowButton(true), 1500);
      }
    }, 90);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="max-w-3xl w-full text-center">

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900">
          {typed}
          <span className="animate-pulse">|</span>
        </h1>

        <p
          className={`mt-8 text-lg md:text-xl text-neutral-700 transition-all duration-700 ${
            showSecond
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          I value humanity.
        </p>

        <p
          className={`mt-3 text-lg md:text-xl text-neutral-500 transition-all duration-700 ${
            showThird
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          Building software that uplifts humanity.
        </p>

        <div
          className={`mt-14 transition-all duration-700 ${
            showButton
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-neutral-800 transition-all duration-300 hover:scale-105"
          >
            Explore →
          </button>

          <p className="mt-5 text-xs text-neutral-400 tracking-wide">
            Explore my digital space.
          </p>
        </div>

      </div>
    </main>
  );
}
