import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/Navbar.css';
import Logo from '../assets/logo1.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Brand/Logo */}
        <Link to="/" className="navbar__brand" onClick={closeDrawer}>
          <img src={Logo} alt="PrimeVentra Logo" className="navbar__logo" />
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/listing" 
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              Find Properties
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/about" 
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/policy" 
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              Privacy Policy
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Desktop CTA Action */}
        <div className="navbar__actions">
          <NavLink to="/list" className="navbar__cta">
            Sell Properties
          </NavLink>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className={`navbar__hamburger ${drawerOpen ? 'navbar__hamburger--open' : ''}`} 
          onClick={toggleDrawer}
          aria-label="Toggle navigation menu"
          aria-expanded={drawerOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`navbar__drawer ${drawerOpen ? 'navbar__drawer--open' : ''}`}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`}
          onClick={closeDrawer}
        >
          Home
        </NavLink>
        <NavLink 
          to="/listing" 
          className={({ isActive }) => `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`}
          onClick={closeDrawer}
        >
          Find Properties
        </NavLink>
        <NavLink 
          to="/about" 
          className={({ isActive }) => `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`}
          onClick={closeDrawer}
        >
          About
        </NavLink>
        <NavLink 
          to="/policy" 
          className={({ isActive }) => `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`}
          onClick={closeDrawer}
        >
          Privacy Policy
        </NavLink>
        <NavLink 
          to="/contact" 
          className={({ isActive }) => `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`}
          onClick={closeDrawer}
        >
          Contact
        </NavLink>
        <NavLink 
          to="/list" 
          className="navbar__cta"
          onClick={closeDrawer}
        >
          Sell Properties
        </NavLink>
      </div>
    </nav>
  );
}
