body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f7f7f7;
}

.App {
  text-align: center;
  padding: 20px;
}

/* Navbar styling */
header {
  background-color: #800000;
  padding: 15px 0;
  /* Increased padding for better height */
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

/* Hamburger Menu */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  margin-left: 20px;
  /* Removed background color for a more minimal look */
}

.hamburger .bar {
  height: 3px;
  width: 25px;
  background-color: #fff;
  margin: 5px 0;
  transition: 0.3s;
}

/* Adjusted for a slight color difference between the bars */
.bar-top {
  background-color: #800000;
}

.bar-middle {
  background-color: #a52a2a;
}

/* Navbar Links */
nav ul {
  display: flex;
  justify-content: flex-end;
  list-style: none;
  margin: 0;
  padding: 0;
}

nav ul li {
  margin-right: 20px;
}

nav ul li a {
  color: white;
  text-decoration: none;
  padding: 15px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

nav ul li a:hover {
  background-color: #a52a2a;
}

/* Hamburger active state (animation) */
.navbar.active .bar:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 5px);
}

.navbar.active .bar:nth-child(2) {
  opacity: 0;
}

.navbar.active .bar:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -5px);
}

/* Small Screen (Mobile View) */
@media (max-width: 768px) {
  nav ul {
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #800000;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
    transform: translateY(-100%);
    transition: transform 0.3s ease-in;
  }

  /* Slide down menu when opened */
  .nav-links.open {
    transform: translateY(0);
  }

  /* Hamburger visible on smaller screens */
  .hamburger {
    display: flex;
  }

  nav ul li {
    margin-bottom: 30px;
  }

  nav ul li a {
    font-size: 1.5em;
    padding: 10px 0;
  }
}

/* Home Section */
.home-section {
  background: linear-gradient(135deg, #800000, #a52a2a);
  /* Gradient Maroon */
  color: white;
  padding: 150px 50px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 3em;
  font-weight: bold;
  color: #fff;
}

.highlight {
  color: #ffcccb;
}

p {
  font-size: 1.5em;
  margin: 20px 0;
}

.btn-main {
  background-color: white;
  color: #800000;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1.2em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.btn-main:hover {
  background-color: #ffcccb;
  color: #800000;
}

/* Section Styles */
section {
  padding: 70px 50px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

h2 {
  color: #800000;
}

@media (max-width: 768px) {
  section {
    padding: 100px 20px;
  }

  .home-section {
    padding: 100px 20px;
  }

  h1 {
    font-size: 2.5em;
  }

  p {
    font-size: 1.2em;
  }
}
