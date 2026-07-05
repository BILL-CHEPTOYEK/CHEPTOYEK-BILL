import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react';
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = useCallback(() => setMenuOpen((s) => !s), []);

  return (
    // Navbar
    <header className={`navbar fixed top-0 left-0 right-0 z-50 transition-shadow ${scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="navbar-container max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <div className="navbar-brand text-lg font-extrabold text-gray-900">
          <Link to="/" className="hover:text-blue-700 transition-colors">
            CHEPTOYEK BILL
          </Link>
        </div>

        <nav className={`nav-links hidden md:flex gap-6 items-center`}>
          {['home', 'about', 'skills', 'projects', 'cv', 'contact'].map((section) => (
            <a key={section} href={`#${section}`} className="text-sm text-gray-700 hover:text-blue-700">
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className={`hamburger p-2 inline-flex items-center justify-center ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <span className={`block w-5 h-0.5 bg-current my-0.5 ${menuOpen ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current my-0.5 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current my-0.5 ${menuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div className={`md:hidden ${menuOpen ? 'block' : 'hidden'} bg-white/95 border-t`}>
        <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
          {['home', 'about', 'skills', 'projects', 'cv', 'contact'].map((section) => (
            <a
              key={section}
              href={`#${section}`}
              onClick={() => setMenuOpen(false)}
              className="py-2 text-gray-800 block"
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
