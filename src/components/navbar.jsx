import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

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
          PrimeVentra
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
              Listings
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/list" 
              className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
            >
              List Property
            </NavLink>
          </li>
          <li>
            <Link to="/#about" className="navbar__link">
              About
            </Link>
          </li>
          <li>
            <Link to="/#contact" className="navbar__link">
              Contact
            </Link>
          </li>
          <li>
            <NavLink to="/list" className="navbar__cta">
              List Property
            </NavLink>
          </li>
        </ul>

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
          Listings
        </NavLink>
        <NavLink 
          to="/list" 
          className={({ isActive }) => `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`}
          onClick={closeDrawer}
        >
          List Property
        </NavLink>
        <Link 
          to="/#about" 
          className="navbar__drawer-link"
          onClick={closeDrawer}
        >
          About
        </Link>
        <Link 
          to="/#contact" 
          className="navbar__drawer-link"
          onClick={closeDrawer}
        >
          Contact
        </Link>
        <NavLink 
          to="/list" 
          className="navbar__cta"
          onClick={closeDrawer}
        >
          List Property
        </NavLink>
      </div>
    </nav>
  );
}
