import React from 'react';
import './App.css';
import { Link } from 'react-scroll';  // Import Link for smooth scrolling
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import CV from './components/CV';
import Contact from './components/Contact';

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <ul>
          <li><Link to="home" smooth={true} duration={500}>Home</Link></li>
          <li><Link to="about" smooth={true} duration={500}>About</Link></li>
          <li><Link to="projects" smooth={true} duration={500}>Projects</Link></li>
          <li><Link to="cv" smooth={true} duration={500}>CV</Link></li>
          <li><Link to="contact" smooth={true} duration={500}>Contact</Link></li>
        </ul>
      </nav>
      <Home />
      <About />
      <Projects />
      <CV />
      <Contact />
    </div>
  );
}

export default App;
