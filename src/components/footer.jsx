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
            <div className="footer__socials">
              <a href="https://www.facebook.com/primeventra" target="_blank" rel="noopener noreferrer" className="footer__social-btn facebook" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="16" height="16" fill="currentColor">
                  <path d="M80 299.3V256H12v-54.7h68v-38.3c0-67 32.8-101.9 101.2-101.9 28 0 57.8 5 57.8 5v63.6h-32.6c-33.2 0-43.6 20.6-43.6 41.8v39.8h71.8L225 256h-66.2v43.3h165.7c33 0 41.2-12.2 41.2-34.9V35c0-19.3-15.7-35-35-35H35C15.7 0 0 15.7 0 35v442c0 19.3 15.7 35 35 35h138.8c-1.8-9.4-2.8-19.2-2.8-29.3v-48.4H80z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/primeventra/" target="_blank" rel="noopener noreferrer" className="footer__social-btn instagram" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7 0-41.1 33.5-74.7 74.7-74.7 41.1 0 74.7 33.5 74.7 74.7 0 41.1-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
              </a>
            </div>
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
