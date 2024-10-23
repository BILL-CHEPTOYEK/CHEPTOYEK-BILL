import React, { useState } from 'react';
import './App.css';

function App() {
  // State for menu toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle the menu when clicked
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="App">
      {/* Navbar */}
      <header>
        <nav className={`navbar ${menuOpen ? 'active' : ''}`}>
          <div className="hamburger" onClick={toggleMenu}>
            <span className="bar bar-top"></span>
            <span className="bar bar-middle"></span>
            <span className="bar bar-bottom"></span>
          </div>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#home" onClick={toggleMenu}>Home</a></li>
            <li><a href="#about" onClick={toggleMenu}>About</a></li>
            <li><a href="#skills" onClick={toggleMenu}>Skills</a></li>
            <li><a
              href="#projects" onClick={toggleMenu}>Projects</a></li>
            <li><a href="#cv"
              onClick={toggleMenu}>CV</a></li>
            <li><a href="#contact" onClick={toggleMenu}>Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Home Section */}
      <section id="home" className="home-section">
        <h1>Hi, I'm <span className="highlight">Cheptoyek Bill</span></h1>
        <p>A passionate <span className="highlight">Software Engineer</span> & Full-Stack Developer</p>
        <a href="#projects" className="btn-main">VIEW MY WORK</a>
      </section>

      {/* About Section */}
      <section id="about">
        <h2>About Me</h2>
        <p>I am a software engineering student in my final year. I specialize in building full-stack applications, with a focus on React, Node.js, and scalable web applications.</p>
      </section>

      {/* Projects Section */}
      <section id="projects">
        <h2>Projects</h2>
        <div className="project">
          <h3>Portfolio Website</h3>
          <p>A responsive personal website built with React.js.</p>
        </div>
      </section>

      {/* CV Section */}
      <section id="cv">
        <h2>Curriculum Vitae</h2>
        <p>Download my CV below:</p>
        <a href="/cv.pdf" download>
          <button>Download my CV (PDF)</button>
        </a>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <h2>Contact Me</h2>
        <p>Email: billcheptoyek60@gmail.com</p>
      </section>
    </div>
  );
}

export default App;
