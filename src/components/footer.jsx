import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import  Logo from '../assets/logo2.png';

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
    e.target.reset();
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Brand Column */}
          <div>
            <img src={Logo} alt="PrimeVentra Logo" className="footer__brand-logo" />
            <p className="footer__brand-desc">
              Experience elite real estate services in Sri Lanka. From luxury beachfront villas to modern penthouses, we connect you to your dreams.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__link-list">
              <li>
                <Link to="/" className="footer__link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/listing" className="footer__link">
                  Search Properties
                </Link>
              </li>
              <li>
                <Link to="/list" className="footer__link">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer__link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer__link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="footer__col-title">Contact</h4>
            <ul className="footer__link-list" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
              <li>Gregory's Road, Colombo 07, Sri Lanka</li>
              <li>Phone: +94 11 234 5678</li>
              <li>Email: info@primeventra.com</li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="footer__col-title">Newsletter</h4>
            <p className="footer__newsletter-desc">
              Subscribe to get the latest premium properties and market updates.
            </p>
            <form className="footer__newsletter-form" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="footer__newsletter-input" 
                required 
              />
              <button type="submit" className="footer__newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__copyright">
            &copy; {new Date().getFullYear()} PrimeVentra. All rights reserved.
          </div>
          <div className="footer__legal-links">
            <Link to="/policy" className="footer__legal-link">
              Privacy Policy
            </Link>
            <a href="#terms" className="footer__legal-link">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
