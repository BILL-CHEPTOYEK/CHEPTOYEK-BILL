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
          <div className="navbar-brand">
            <img
              src="/dp.jpg"
              alt="Logo"
              className="navbar-logo"
            />
            <span className="navbar-title">Cheptoyek Bill</span>
          </div>
          <div className="hamburger" onClick={toggleMenu}>
            <span className="bar bar-top"></span>
            <span className="bar bar-middle"></span>
            <span className="bar bar-bottom"></span>
          </div>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#home" onClick={toggleMenu}>Home</a></li>
            <li><a href="#about" onClick={toggleMenu}>About</a></li>
            <li><a href="#skills" onClick={toggleMenu}>Skills</a></li>
            <li><a href="#projects" onClick={toggleMenu}>Projects</a></li>
            <li><a href="#cv" onClick={toggleMenu}>Resume</a></li>
            <li><a href="#contact" onClick={toggleMenu}>Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Home Section */}
      <section id="home" className="home-section fade-in">
        <div className="container">
          <img
            src="/dp.jpg"
            alt="Cheptoyek Bill"
            className="profile-image"
          />
          <h1>Cheptoyek Bill</h1>
          <p className="subtitle">Software Engineer & Full-Stack Developer</p>
          <a href="#projects" className="btn-main">View My Work</a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section fade-in">
        <div className="container">
          <h2>About Me</h2>
          <div className="about-content">
            <p>
              I am a results-driven Software Engineer with a strong background in full-stack development, cloud technologies, and modern web frameworks. My experience spans building scalable applications, designing robust APIs, and collaborating in agile teams to deliver impactful solutions.
            </p>
            <p>
              I am passionate about leveraging technology to solve real-world problems, with a focus on clean code, performance, and user experience. My technical toolkit includes React, Node.js, Python, Flutter, and a growing expertise in AI, machine learning, and blockchain.
            </p>
            <p>
              I am committed to continuous learning and professional growth, and I thrive in environments that challenge me to innovate and lead.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills-section">
        <div className="container">
          <h2>Skills <span role="img" aria-label="tools"></span></h2>
          <ul className="skills-list">
            <li>JavaScript (ES6+)</li>
            <li>React.js</li>
            <li>Node.js & Express</li>
            <li>Flutter</li>
            <li>Python</li>
            <li>AI & ML</li>
            <li>Data Science</li>
            <li>Blockchain</li>
            <li>DevOps</li>
            <li>Git & GitHub</li>
            <li>REST APIs</li>
            <li>Agi</li>
          </ul>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects-section">
        <div className="container">
          <h2>Projects <span role="img" aria-label="rocket"></span></h2>
          {/* Project Cards */}
          <div className="project-card">
            <h3>Bus Ticketing System (BSE25-18)</h3>
            <p>A collaborative, well-architected bus ticketing system with an integrated CI/CD pipeline. This project automates ticket bookings, user management, and trip scheduling, leveraging Django to ensure scalable, reliable deployments.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/BSE25-18" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Hotel Management System API</h3>
            <p>Developed a comprehensive RESTful API to manage hotel operations including reservations, customer data, and room assignments. Built with Node.js and MongoDB for robust data handling and quick query response times.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/hotelms-api" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Digital Verification System</h3>
            <p>An advanced academic verification system for universities, built with React.js and Node.js. Employers can authenticate transcripts and certifications securely, and users are managed via JWT authentication.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/Digital-Verification-System" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Land Sale and Purchase System</h3>
            <p>A secure system for managing property sales and purchases, featuring user authentication, document management, and transaction tracking. This project ensures transparent and efficient property transactions.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/land-sale-system" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Aquifer Foundation Website</h3>
            <p>The official website for Aquifer Foundation, a non-profit focused on water resource management. Built with React JavaScript, the site highlights more about Aquifer foundation, projects, impact stories.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/aquifer-foundation-website" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
            <a href="https://aquifer-foundation.org/" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Website</a>
          </div>
          <div className="project-card">
            <h3>Loan Management System</h3>
            <p>An efficient system for loan application and management, featuring loan request tracking, repayment scheduling, and borrower profiling. Designed to simplify loan processes for financial institutions.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/loan-management-system" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Sabiny English AI translation model</h3>
            <p>The Sabiny-English AI Translation Model is a pioneering initiative designed to bridge the language gap for the Sabiny-speaking Sebei community, an underrepresented language group. Due to the limited availability of linguistic resources for Sabiny, this AI model was developed to provide accurate translations between Sabiny and English. By leveraging machine learning, this project aims to preserve cultural heritage and improve accessibility for speakers of this indigenous language. Explore the project and contribute to enhancing language diversity in AI.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/Sabiny-English-translation-model" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Recess Term 2 Projects</h3>
            <p>A set of Data Science and ML projects developed during an academic term. Includes analyses on crime statistics and heart disease datasets, applying predictive modeling techniques.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/RECESS-TERM-2" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Anka Business Services System</h3>
            <p>A Laravel-based business management system, providing client management, invoicing, and project tracking for business operations. Built for adaptability, ensuring scalable growth.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/Anka-Business-services-System" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
          <div className="project-card">
            <h3>Medical Diagnosis AI - Prostate Cancer</h3>
            <p>Developed an AI model using Python for diagnosing prostate cancer, utilizing data-driven algorithms to enhance early detection accuracy.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/MEDICAL-DIAGNOSIS-AI-PROSTATE-CANCER-" target="_blank" rel="noopener noreferrer" className="btn-secondary">View Project</a>
          </div>
        </div>
      </section>

      {/* CV Section */}
      <section id="cv" className="cv-section fade-in">
        <div className="container">
          <h2>Curriculum Vitae</h2>
          <p>Download my resume for a detailed overview of my experience, skills, and education.</p>
          <div className="cv-button-wrapper">
            <a href="/cv.pdf" download>
              <button className="download-btn">Download Resume (PDF)</button>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Contact Me <span role="img" aria-label="mail">✉️</span></h2>
          <p>Email: <a href="mailto:billcheptoyek60@gmail.com">billcheptoyek60@gmail.com</a></p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/cheptoyekbill1" className="social-btn" target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
            </a>
            <a href="https://stackoverflow.com/users/yourprofile" className="social-btn" target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/badge/Stack_Overflow-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white" alt="Stack Overflow" />
            </a>
            <a href="https://www.kaggle.com/cheptoyekbill" className="social-btn" target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white" alt="Kaggle" />
            </a>
            <a href="https://x.com/trojan__bill" className="social-btn" target="_blank" rel="noopener noreferrer">
              <img src="https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white" alt="X (formerly Twitter)" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Cheptoyek Bill. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
