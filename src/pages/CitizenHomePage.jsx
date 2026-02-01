import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Bug,
  BarChart,
  MessageCircle,
  Mic,
  Video,
  Building2,
  Landmark,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import firstSlide from "../assets/firstSlide.jpg";
import Footer from "../components/Footer";
import FloatingChatButton from "../components/FloatingChatButton";
// Always at least two images for swipe effect, even if identical
const heroImages = [firstSlide, firstSlide];

// Personal site: removed government lists; this page now highlights projects and contact info.

export default function CitizenHomePage() {
  // Carousel state
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);
  const images = heroImages;
  const duration = 3500; // ms, shorter for a snappier swipe

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, duration);
    return () => clearTimeout(timeoutRef.current);
  }, [current, images.length]);
  // State for mobile menu, modals, etc. (implement as needed)
  // ...

  return (
  <div className="w-full bg-gray-50 min-h-screen flex flex-col font-sans">
      {/* Hero Section (profile DP as hero) */}
      <section
        id="home"
        className="w-full relative flex items-center min-h-[360px] md:min-h-[460px] lg:min-h-[560px] py-12 px-4 md:px-12"
        style={{
          backgroundImage: `linear-gradient(rgba(235, 233, 243, 0.85), rgba(7, 1, 1, 0.85)), url('dp2.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col-reverse md:flex-row items-center gap-8">
          {/* Text */}
          <div className="flex-1 max-w-2xl text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-4 leading-snug font-poppins tracking-tight">
            <span className="text-blue-700">CHEPTOYEK BILL</span>
            </h1>
            <p className="text-base md:text-lg text-white mb-6 font-medium font-inter leading-normal">
              I am a results-driven Software Engineer with a strong background in full-stack development, cloud technologies, and modern web frameworks. Passionate about clean code, performance, and user experience.
            </p>
            <a href="#projects" className="inline-block bg-black text-white font-semibold px-6 py-2.5 shadow-lg hover:bg-blue-800 transition text-base font-poppins tracking-wide">
              Explore Projects
            </a>
          </div>

          {/* DP Image */}
          <div className="flex-shrink-0 flex items-center justify-center relative z-20">
            <div className="w-66 h-66 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-2 border-white shadow-2xl bg-white transform-gpu">
              <img src="dp.jpg" alt="Cheptoyek Bill" className="w-full h-full object-cover grayscale contrast-75 hover:grayscale-0 transition-filter duration-300" />
            </div>
          </div>

          {/* TerminalRunner - appears on the right side of hero, behind DP but above background */}
          <div className="hidden md:block absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
            <TerminalRunner />
          </div>
        </div>
      </section>
 {/* About the App Section */}
      <section className="w-full flex flex-col items-center justify-center mt-8 mb-12 px-4">
        <h2
          className="text-2xl md:text-3xl font-extrabold font-poppins text-center mb-6 text-blue-700 tracking-tight drop-shadow-sm"
        >
          Designing & building software that makes a difference
        </h2>
       
      </section>

      {/* Enhanced Hero Welcome Section */}
      <section
        className="w-full flex flex-col items-center justify-center bg-blue-600 rounded-sm px-4 py-8 md:py-12 mb-12 mx-auto relative overflow-hidden"
        style={{ maxWidth: '1100px' }}
      >
         {/* Tech stack chips */}
         <h2 className="text-2xl md:text-3xl font-extrabold font-poppins text-center mb-6 text-white tracking-tight drop-shadow-sm">Tech Stack</h2>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {['Node.js', 'Express.js', 'React.js', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Docker', 'Django', '.NET Core', 'Flutter', 'Kotlin', 'AI/ML', 'Data Science'].map((tech) => (
            <span key={tech} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-semibold text-gray-800">
              {tech}
            </span>
          ))}
        </div>
      </section>
      {/* Work Experience section */}
      <section id="experience" className="w-full py-12 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-8 font-poppins">Work Experience</h2>

          <div className="space-y-6">
            {/* Tricsoft Technologies Ltd */}
            <article className="bg-white border border-blue-100 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="md:flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">Tricsoft Technologies Ltd</h3>
                  <div className="text-sm text-gray-600 mt-1">Software Developer — <span className="font-medium">June 2025 - Present</span></div>
                  <div className="text-sm text-gray-600">Kampala, Uganda</div>
                  <a href="https://tricsoft.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 mt-2 inline-block">tricsoft.com</a>

                  <div className="mt-4 text-sm text-gray-700 space-y-3">
                    <p>Developed software including a project management system. Tech stack: React.js, Node.js, Express.js, PostgreSQL, Tailwind CSS.</p>
                    <p>Built a full-stack marketplace with real-time chat negotiation, 3-language support (EN/ES/RU), and role-based architecture for Admins, Merchants, and Customers. Implemented product reviews, sales analytics, payment integration (PayPal/Stripe), and RESTful APIs. Tech stack: React 18, Node.js, PostgreSQL, Socket.io, Redis, Tailwind CSS. Live Demo: <a href="https://thekalna.com" target="_blank" rel="noopener noreferrer" className="text-blue-700">thekalna.com</a></p>
                    <p>Built a real-time business intelligence web portal enabling remote monitoring and analytics for TillDesk POS systems. Implemented 15+ interactive reports including financial statements, stock management, customer/supplier analytics, and adaptive time-series charts. Features offline-first architecture with IndexedDB, role-based authentication, and comprehensive data export. Tech Stack: React 18, Chart.js, IndexedDB, Tailwind CSS, REST APIs. Live Demo: <a href="https://portal.tilldesk.com" target="_blank" rel="noopener noreferrer" className="text-blue-700">portal.tilldesk.com</a></p>
                    <p>Contributed to the development of the frontend of a citizen engagement platform for the Ugandan Parliament enabling direct communication between citizens and representatives. Developed comprehensive admin dashboard with role-based access, real-time AI chatbot integration, polls/surveys management, and complaint tracking with multi-status workflows. Tech Stack: React.js, React Router, WebSocket, Tailwind CSS, Context API, Vite. Live Demo: <a href="http://154.72.217.2:8791/client/login" target="_blank" rel="noopener noreferrer" className="text-blue-700">GCIC portal</a></p>
                  </div>
                </div>

                <div className="md:w-56 flex-shrink-0 mt-2 md:mt-0">
                  <div className="text-sm text-gray-600">Tech highlights</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['React', 'Node.js', 'PostgreSQL', 'Socket.io', 'Redis', 'Tailwind'].map(t => (
                      <span key={t} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs font-semibold text-gray-800">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Powellpay Limited */}
            <article className="bg-white border border-blue-100 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="md:flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">Powellpay Limited</h3>
                  <div className="text-sm text-gray-600 mt-1">Intern — <span className="font-medium">May 2024 – July 2024</span></div>
                  <div className="text-sm text-gray-600">Kampala, Uganda</div>
                  <a href="https://powellpay.com/#" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 mt-2 inline-block">powellpay.com</a>

                  <div className="mt-4 text-sm text-gray-700 space-y-2">
                    <p>Developed internal tools using React.js, Vue.js, and Node.js.</p>
                    <p>Collaborated in Agile teams and worked with Git version control.</p>
                    <p>Assisted in CI/CD setup and deployment testing.</p>
                  </div>
                </div>

                <div className="md:w-56 flex-shrink-0 mt-2 md:mt-0">
                  <div className="text-sm text-gray-600">Skills</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['React', 'Vue', 'Node.js', 'CI/CD'].map(t => (
                      <span key={t} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs font-semibold text-gray-800">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Feature Cards (Responsive for all devices including thin mobiles) */}
  <section id="services" className="w-full max-w-7xl mx-auto py-6 px-2 sm:px-4 md:py-10">
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {/* Card 1 */}
        <div className="group perspective flex-1 min-w-0 max-w-full sm:max-w-xs flex justify-center items-stretch">
          <div className="relative w-full h-[380px] sm:h-[400px] md:h-[420px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:rotate-y-180">
            {/* Front Side */}
            <div className="absolute w-full h-full bg-white shadow-lg border border-blue-100 flex flex-col items-center p-4 sm:p-6 md:p-7 justify-between [backface-visibility:hidden]">
              <div className="flex items-center justify-center bg-blue-100 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4">
                <Bug className="text-blue-700 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl text-blue-900 mb-2 font-poppins tracking-tight text-center">Project — Web App</h3>
                <p className="text-gray-700 text-center mb-4 font-inter text-xs sm:text-sm md:text-base leading-normal">
                  A full-stack web application focused on performance and accessibility. Built with modern tooling, responsive layout and thoughtful UX.
                </p>
              </div>
              <Link 
                to="/projects" 
                className="bg-blue-700 text-white px-3 sm:px-4 md:px-5 py-2 font-semibold hover:bg-blue-800 transition text-xs sm:text-sm font-poppins shadow inline-block text-center w-full"
              >
                View Project
              </Link>
            </div>
            {/* Back Side */}
            <div className="absolute w-full h-full bg-blue-700 text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-7 [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-2 font-poppins tracking-tight text-center">Project details</h3>
              <p className="text-center font-inter text-xs sm:text-sm md:text-base mb-4">Overview, technologies used, and the role I played in this project.</p>
              <Link 
                to="/projects" 
                className="bg-white text-blue-700 px-3 sm:px-4 md:px-5 py-2 font-semibold hover:bg-blue-100 transition text-xs sm:text-sm font-poppins shadow mt-2 inline-block text-center w-full"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="group perspective flex-1 min-w-0 max-w-full sm:max-w-xs flex justify-center items-stretch">
          <div className="relative w-full h-[380px] sm:h-[400px] md:h-[420px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:rotate-y-180">
            {/* Front Side */}
            <div className="absolute w-full h-full bg-white shadow-lg border border-blue-100 flex flex-col items-center p-4 sm:p-6 md:p-7 justify-between [backface-visibility:hidden]">
              <div className="flex items-center justify-center bg-blue-100 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4">
                <BarChart className="text-blue-700 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl text-blue-900 mb-2 font-poppins tracking-tight text-center">Open-source Libraries</h3>
                <p className="text-gray-700 text-center mb-4 font-inter text-xs sm:text-sm md:text-base leading-normal">
                  Small utilities and components I publish to help other developers ship faster. Focused on tiny bundle size and composability.
                </p>
              </div>
              <Link 
                to="/projects" 
                className="bg-blue-700 text-white px-3 sm:px-4 md:px-5 py-2 font-semibold hover:bg-blue-800 transition text-xs sm:text-sm font-poppins shadow inline-block text-center w-full"
              >
                View Projects
              </Link>
            </div>
            {/* Back Side */}
            <div className="absolute w-full h-full bg-blue-700 text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-7 [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-2 font-poppins tracking-tight text-center">Library & Tools</h3>
              <p className="text-center font-inter text-xs sm:text-sm md:text-base mb-4">Open-source packages and components I maintain to help other developers.</p>
              <Link 
                to="/projects" 
                className="bg-white text-blue-700 px-3 sm:px-4 md:px-5 py-2 font-semibold hover:bg-blue-100 transition text-xs sm:text-sm font-poppins shadow mt-2 inline-block text-center w-full"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="group perspective flex-1 min-w-0 max-w-full sm:max-w-xs flex justify-center items-stretch">
          <div className="relative w-full h-[380px] sm:h-[400px] md:h-[420px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:rotate-y-180">
            {/* Front Side */}
            <div className="absolute w-full h-full bg-white shadow-lg border border-blue-100 flex flex-col items-center p-4 sm:p-6 md:p-7 justify-between [backface-visibility:hidden]">
              <div className="flex items-center justify-center bg-blue-100 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4">
                <MessageCircle className="text-blue-700 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl text-blue-900 mb-2 font-poppins tracking-tight text-center">Contact & Hire</h3>
                <p className="text-gray-700 text-center mb-4 font-inter text-xs sm:text-sm md:text-base leading-normal">
                  Interested in working together? Reach out for consulting, contracting or to discuss product ideas and collaborations.
                </p>
              </div>
              <Link 
                to="/contact" 
                className="bg-blue-700 text-white px-3 sm:px-4 md:px-5 py-2 font-semibold hover:bg-blue-800 transition text-xs sm:text-sm font-poppins shadow inline-block text-center w-full"
              >
                Contact
              </Link>
            </div>
            {/* Back Side */}
            <div className="absolute w-full h-full bg-blue-700 text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-7 [transform:rotateY(180deg)] [backface-visibility:hidden]">
              <h3 className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl mb-2 font-poppins tracking-tight text-center">Get in touch</h3>
              <p className="text-center font-inter text-xs sm:text-sm md:text-base mb-4">Want to collaborate or hire me? Let's talk about your project.</p>
              <Link 
                to="/contact" 
                className="bg-white text-blue-700 px-3 sm:px-4 md:px-5 py-2 font-semibold hover:bg-blue-100 transition text-xs sm:text-sm font-poppins shadow mt-2 inline-block text-center w-full"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
        </div>
      </section>

          {/* Featured Projects Section - Fully Responsive */}
  <section id="projects" className="w-full flex flex-col items-center justify-center mb-8 sm:mb-12 py-8 sm:py-12 px-2 sm:px-4 relative overflow-hidden" style={{minHeight:'300px'}}>
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(20,30,60,0.85), rgba(20,30,60,0.85)), url(${firstSlide})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.8)'
          }}
          aria-hidden="true"
        />
        <div className="w-full max-w-6xl mx-auto z-10 relative px-2 sm:px-4 py-6 sm:py-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-poppins text-center mb-4 sm:mb-6 text-white tracking-tight drop-shadow">Featured Projects</h2>

          {/* Projects grid using ProjectCard components */}
          <div className="w-full">
            <div className="projects-grid max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
              <ProjectCard
                title="Accounting System"
                description="A web accounting suite built for small businesses to manage transactions, reconcile ledgers, and produce standard financial statements. Includes CSV import/export, role-based access, and customizable reporting templates to accelerate bookkeeping workflows."
                href="https://github.com/BILL-CHEPTOYEK/Accounting-for-software-engineers-Resources"
                tech={["React", "Node.js", "PostgreSQL"]}
                imageSrc="accountingsystem.png"
              />

              <ProjectCard
                title="TricReality — Real Estate & Project Management"
                description="Enterprise-grade platform for condominium project lifecycle: setup, financial tracking, sales management, payment scheduling, and customer relations. Supports multi-role workflows and integrates real-time negotiation chat for sales teams."
                href="https://tricreality.tricsoftdemos.com"
                tech={["React", "Node.js", "PostgreSQL", "Socket.io"]}
                imageSrc="tricreality.png"
              />

              <ProjectCard
                title="FarmConnect — Farmer-to-Market Mobile App"
                description="A Flutter-based app connecting smallholder farmers to urban buyers through trusted agents, providing escrow payments and delivery coordination to reduce intermediaries and increase farmer margins. Features offline caching and simple UX for low-literacy users."
                href="https://github.com/BILL-CHEPTOYEK/FarmConnect"
                tech={["Flutter", "Dart", "Firebase"]}
                imageSrc="farmconnect.png"
              />

              <ProjectCard
                title="Bus Ticketing System (BSE25-18)"
                description="Scalable bus ticketing platform with seat selection, booking management, and operator dashboards. Built with CI/CD processes and a Django backend for reliability and fast iteration."
                href="https://github.com/BILL-CHEPTOYEK/BSE25-18"
                tech={["Django", "PostgreSQL", "Docker"]}
                imageSrc="busticketing.svg"
              />

              <ProjectCard
                title="Hotel Management System API"
                description="RESTful API for hotel operations—reservations, room management, billing, and reporting—designed for easy integration with web and mobile frontends. Optimized for reliability and horizontal scaling."
                href="https://github.com/BILL-CHEPTOYEK/hotelms-api"
                tech={["Node.js", "MongoDB", "Express"]}
                imageSrc="hotelapi.svg"
              />
            </div>

            {/* <div className="flex justify-center mt-8 px-4">
              <Link
                to="/projects"
                className="inline-block bg-white/20 text-white font-semibold px-6 py-2 shadow hover:bg-white/40 transition text-sm sm:text-base font-poppins tracking-wide border border-blue-200"
              >
                See All Projects
              </Link>
            </div> */}
          </div>
        </div>
      </section>

      {/* */}
      {/* <section className="w-full bg-blue-50 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-7 font-poppins tracking-tight drop-shadow-sm">
            Why this site?
          </h2>
          <div className="flex flex-col md:flex-row gap-7 justify-center">
            <div className="flex-1 bg-white rounded-2xl p-6 shadow hover:shadow-xl transition flex flex-col items-center border border-blue-100">
              <Video className="text-blue-700 w-9 h-9 mb-2" />
              <h4 className="font-bold text-blue-900 mb-1 font-poppins text-base">Multimedia</h4>
              <p className="text-gray-700 text-sm font-inter">Attach videos and audio to provide comprehensive details.</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-6 shadow hover:shadow-xl transition flex flex-col items-center border border-blue-100">
              <Mic className="text-blue-700 w-9 h-9 mb-2" />
              <h4 className="font-bold text-blue-900 mb-1 font-poppins text-base">Voice Your Opinion</h4>
              <p className="text-gray-700 text-sm font-inter">Case studies and write-ups explaining technical decisions and outcomes.</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl p-6 shadow hover:shadow-xl transition flex flex-col items-center border border-blue-100">
              <MessageCircle className="text-blue-700 w-9 h-9 mb-2" />
              <h4 className="font-bold text-blue-900 mb-1 font-poppins text-base">24/7 Chat Support</h4>
              <p className="text-gray-700 text-sm font-inter">Get answers from AI or escalate to human experts instantly.</p>
            </div>
          </div>
        </div>
      </section> */}


      <Footer />
  <FloatingChatButton />
    </div>
  );
}

// ProjectCard Component
function ProjectCard({ title, description, href, tech = [], imageSrc }) {
  const isGithub = typeof href === 'string' && href.includes('github.com');
  const ctaLabel = isGithub ? 'View on GitHub' : 'Live Demo';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100 flex flex-col">
      <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img src={imageSrc} alt={title} className="object-contain h-full w-full" />
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 font-poppins">{title}</h3>
        <p className="text-sm text-gray-700 mb-4 font-inter">{description}</p>

        {tech.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tech.map(t => (
              <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{t}</span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition">
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

// SocialLink Component (used elsewhere if needed)
function SocialLink({ href, label, color }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 mr-2 mb-2 border rounded text-sm font-medium" style={{ borderColor: color }}>
      {label}
    </a>
  );
}

// TerminalRunner component: shows lines appearing top-to-bottom and loops
function TerminalRunner() {
  const lines = [
    '$ git clone',
    'Cloning into \'project-repo\'...',
    'remote: Enumerating objects: 42, done.',
    'remote: Counting objects: 100% (42/42), done.',
    'remote: Compressing objects: 100% (30/30), done.',
    'Receiving objects: 100% (42/42), 12.34 MiB | 2.45 MiB/s, done.',
    '$ cd project-repo',
    '$ npm install',
    'Initializing build environment...',
    'Fetching packages: react, tailwindcss, lucide-react...',
    'Installing dependencies (this may take a while)...',
    'Running linter...',
    'Building assets: src/pages/Bill Cheptoyek.jsx',
    'Starting local server on http://localhost:5173',
    'Ready — watching for file changes.'

  ];

  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setVisibleCount((c) => {
        const next = c + 1;
        if (next > lines.length) return 0; // loop
        return next;
      });
      idx += 1;
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-92 lg:w-106 text-green-200 font-mono text-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-black/30 text-xs text-white/70">terminal</div>
      <div className="px-3 py-3 h-40 overflow-hidden">
        <div className="flex flex-col gap-1">
          {lines.slice(0, visibleCount).map((line, i) => (
            <div key={i} className="opacity-100 animate-fade-in">{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// small fade-in animation utility: add to global styles if using Tailwind config; fallback inline styles if not
