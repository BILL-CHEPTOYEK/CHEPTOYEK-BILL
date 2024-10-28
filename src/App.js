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
            <li><a href="#projects" onClick={toggleMenu}>Projects</a></li>
            <li><a href="#cv" onClick={toggleMenu}>Resume</a></li>
            <li><a href="#contact" onClick={toggleMenu}>Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Home Section */}
      <section id="home" className="home-section">
        <div className="container">

          <img src="/dp.jpeg" alt="Cheptoyek Bill" className="profile-image" />

          <h1>Hi, I'm <span className="highlight">Cheptoyek Bill</span></h1>
          <p>A passionate <span className="highlight">Software Engineer</span> & Full-Stack Developer</p>
          <a href="#projects" className="btn-main">VIEW MY WORK</a>
        </div>
      </section>


      {/* About Section */}
      <section id="about">
        <div className="container">
          <h2>About Me</h2>
          <div className="project">
            <p>
              Hey there! I'm a final-year Software Engineering student, deeply passionate about automating everyday tasks and redefining how humans live through technology. My expertise? Well, let's just say I can <strong>flirt</strong> with any application or operating system using <strong>Flutter</strong> and <strong>Node.js</strong>, effortlessly syncing up with any backend. And don’t worry, I’ll always be <strong>React-ing</strong> to your user interface needs with style!
            </p>
            <p>
              Armed with my superpowers in <strong>React</strong>, <strong>Node.js</strong>, <strong>Flutter</strong>, <strong>AI</strong>, <strong>ML</strong>, <strong>Data Science</strong>, and now a growing obsession with <strong>blockchain</strong>, I’m confident that the future of tech is literally at my fingertips. Whether it’s building scalable, cutting-edge apps or exploring the realms of decentralized tech, I’m all in.
            </p>
            <p>
              Oh, and don’t be surprised if you find me diving into <strong>DevOps</strong>, making sure the pipeline is as smooth as my code. Together, I believe we can shape a future where tech doesn’t just enhance lives—it transforms them.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects">
        <div class="container">
          <h2>Projects</h2>

          <div class="project">
            <h3>Bus Ticketing System (BSE25-18)</h3>
            <p>A collaborative, well-architected bus ticketing system with an integrated CI/CD pipeline. This project automates ticket bookings, user management, and trip scheduling, leveraging Django to ensure scalable, reliable deployments.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/BSE25-18" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

          <div class="project">
            <h3>Hotel Management System API</h3>
            <p>Developed a comprehensive RESTful API to manage hotel operations including reservations, customer data, and room assignments. Built with Node.js and MongoDB for robust data handling and quick query response times.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/hotelms-api" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

          <div class="project">
            <h3>Digital Verification System</h3>
            <p>An advanced academic verification system for universities, built with React.js and Node.js. Employers can authenticate transcripts and certifications securely, and users are managed via JWT authentication.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/Digital-Verification-System" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

          <div class="project">
            <h3>Land Sale and Purchase System</h3>
            <p>A secure system for managing property sales and purchases, featuring user authentication, document management, and transaction tracking. This project ensures transparent and efficient property transactions.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/land-sale-system" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

          <div class="project">
            <h3>Aquifer Foundation Website</h3>
            <p>The official website for Aquifer Foundation, a non-profit focused on water resource management. Built with HTML, CSS, and JavaScript, the site highlights projects, impact stories, and donor opportunities.</p>
            <p><a href="https://github.com/BILL-CHEPTOYEK/aquifer-foundation-website" target="_blank" rel="noopener noreferrer">View Project</a> </p>
            <a href='https://aquifer-foundation.org/' target='blank'>View website</a>
          </div>

          <div class="project">
            <h3>Loan Management System</h3>
            <p>An efficient system for loan application and management, featuring loan request tracking, repayment scheduling, and borrower profiling. Designed to simplify loan processes for financial institutions.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/loan-management-system" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

          <div class="project">
            <h3>Recess Term 2 Projects</h3>
            <p>A set of Data Science and ML projects developed during an academic term. Includes analyses on crime statistics and heart disease datasets, applying predictive modeling techniques.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/RECESS-TERM-2" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

          <div class="project">
            <h3>Anka Business Services System</h3>
            <p>A Laravel-based business management system, providing client management, invoicing, and project tracking for business operations. Built for adaptability, ensuring scalable growth.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/Anka-Business-services-System" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

          <div class="project">
            <h3>Medical Diagnosis AI - Prostate Cancer</h3>
            <p>Developed an AI model using Python for diagnosing prostate cancer, utilizing data-driven algorithms to enhance early detection accuracy.</p>
            <a href="https://github.com/BILL-CHEPTOYEK/MEDICAL-DIAGNOSIS-AI-PROSTATE-CANCER-" target="_blank" rel="noopener noreferrer">View Project</a>
          </div>

        </div>
      </section>


      {/* CV Section */}
      <section id="cv">
        <div className="container">
          <h2>Curriculum Vitae</h2>
          <p>Interested in my work? Download my detailed resume below:</p>
          <div className="cv-button-wrapper">
            <a href="/cv.pdf" download>
              <button className="download-btn">
                <span>📄 Download Resume (PDF)</span>
              </button>
            </a>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact">
        <div className="container">
          <h2>Contact Me</h2>
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



    </div>
  );
}

export default App;
