import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import Logo from '../assets/logo4.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      const stored = sessionStorage.getItem('portalUser');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener('portalUserUpdated', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('portalUserUpdated', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem('portalUser');
    setUser(null);
    navigate('/');
  };

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
        <div className="navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="navbar__user-welcome" style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
                Hi, <Link to="/profile" title="View Profile" style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'underline', transition: 'opacity 150ms' }} onMouseOver={e => e.currentTarget.style.opacity = '0.8'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>{user.first_name || user.username}</Link>
              </span>
              <button 
                onClick={handleLogout} 
                className="navbar__logout-btn" 
                style={{ 
                  background: 'none', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '6px',
                  color: '#ffffff', 
                  cursor: 'pointer', 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  padding: '6px 12px',
                  transition: 'background-color 150ms ease, border-color 150ms ease' 
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; }}
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink 
              to="/login" 
              state={{ from: { pathname: '/profile', state: { activeTab: 'liked' } } }}
              className="navbar__link" 
              style={{ 
                color: '#ffffff', 
                fontWeight: 600, 
                fontSize: '0.95rem' 
              }}
            >
              Login
            </NavLink>
          )}
          <NavLink to="/list" className="navbar__cta">
            Post Ad
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
        {user && (
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `navbar__drawer-link ${isActive ? 'navbar__drawer-link--active' : ''}`}
            onClick={closeDrawer}
          >
            My Profile
          </NavLink>
        )}
        {!user ? (
          <NavLink 
            to="/login" 
            state={{ from: { pathname: '/profile', state: { activeTab: 'liked' } } }}
            className="navbar__drawer-link"
            onClick={closeDrawer}
          >
            Login
          </NavLink>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', width: '100%' }}>
            <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              Hi, <Link to="/profile" onClick={closeDrawer} style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'underline' }}>{user.first_name || user.username}</Link>
            </span>
            <button 
              onClick={() => { handleLogout(); closeDrawer(); }} 
              style={{ 
                background: 'none', 
                border: '1px solid rgba(255, 255, 255, 0.25)', 
                borderRadius: '6px',
                color: '#ffffff', 
                cursor: 'pointer', 
                fontSize: '0.8rem', 
                fontWeight: 700,
                padding: '6px 12px'
              }}
            >
              Logout
            </button>
          </div>
        )}
        <NavLink 
          to="/list" 
          className="navbar__cta"
          onClick={closeDrawer}
        >
          post Ad
        </NavLink>
      </div>
    </nav>
  );
}
