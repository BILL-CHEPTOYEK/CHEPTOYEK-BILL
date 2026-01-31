import React from "react";
export default function Footer() {
  return (
    <footer className="w-full bg-blue-900 text-white pt-10 pb-6 mt-auto font-inter">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-start gap-10 md:gap-8 justify-between">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center md:items-start mb-6 md:mb-0 min-w-[180px]">
          <span className="text-xl font-extrabold font-poppins tracking-tight text-green-200">CHEPTOYEK BILL</span>
          <div className="flex gap-3 mt-3">
            <a href="https://github.com/BILL-CHEPTOYEK" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 text-xs">GitHub</a>
            <a href="https://linkedin.com/in/bill-cheptoyek" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 text-xs">LinkedIn</a>
            <a href="https://twitter.com/trojan__bill" target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 text-xs">Twitter</a>
          </div>
        </div>
        {/* Contact */}
        <div className="flex-1 min-w-[180px] mb-6 md:mb-0">
          <h4 className="font-extrabold mb-2 text-base font-poppins tracking-tight">Contact</h4>
          <div className="flex flex-col gap-2 mb-2">
            <a href="mailto:billcheptoyek60@gmail.com" className="hover:text-blue-200 font-inter">billcheptoyek60@gmail.com</a>
            <a href="tel:+256785560157" className="hover:text-blue-200 font-inter">+256 785560157</a>
          </div>
        </div>
        {/* Services */}
        <div className="flex-1 min-w-[180px] mb-6 md:mb-0">
          <h4 className="font-extrabold mb-2 text-base font-poppins tracking-tight">Explore</h4>
          <ul className="space-y-1 font-inter text-sm">
            <li><a href="/about" className="hover:text-blue-200">About</a></li>
            <li><a href="/projects" className="hover:text-blue-200">Projects</a></li>
            <li><a href="/contact" className="hover:text-blue-200">Contact</a></li>
          </ul>
        </div>
        {/* What Bill Cheptoyek Buids */}
        <div className="flex-1 min-w-[220px]">
          <h4 className="font-extrabold mb-2 text-base font-poppins tracking-tight">About this site</h4>
          <p className="text-sm opacity-90 mb-2 font-inter">
            Welcome to my personal website. I build web apps, tools, and experiments focused on user experience and performance. Explore my work and get in touch.
          </p>
          <a href="/about" className="inline-block mt-2 text-blue-200 underline font-poppins">Learn More</a>
        </div>
      </div>
      <div className="text-center text-xs text-blue-200 mt-8 font-inter px-2">
        © 2025 Bill Cheptoyek. All rights reserved. | <a href="/privacy" className="underline">Privacy Policy</a> | <a href="/terms" className="underline">Terms of Service</a>
      </div>
    </footer>
  );
}
