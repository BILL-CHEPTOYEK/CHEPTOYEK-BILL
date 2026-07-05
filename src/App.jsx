import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';
import CitizenHomePage from './pages/CitizenHomePage';
import LandingPage from './pages/LandingPage';

function AppRoutes() {
    const location = useLocation();

    const hideNavbar = ["/", "/home"].includes(location.pathname);

    return (
        <>
            {!hideNavbar && <Navbar />}

            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<CitizenHomePage />} />
            </Routes>
        </>
    );
}

export default function App() {
  return (
    <BrowserRouter basename="/">
      <AppRoutes />
    </BrowserRouter>
  );
}
