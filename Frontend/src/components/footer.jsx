import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import  Logo from '../assets/logo2.png';

const apiBase = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api'
  : 'https://primeventra-vrmv.vercel.app/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [latestListings, setLatestListings] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchLatestListings = async () => {
      try {
        const res = await fetch(`${apiBase}/listings`);
        if (!res.ok) return;
        const data = await res.json();
        const approved = data.filter(item =>
          !(item.description || '').includes('Status: Pending') &&
          !(item.description || '').includes('Status: Draft')
        );
        if (!cancelled) setLatestListings(approved.slice(0, 3));
      } catch (err) {
        console.error('Failed to load latest listings for footer:', err);
      }
    };

    fetchLatestListings();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Thank you for subscribing to our newsletter!');
        setEmail('');
      } else {
        alert(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      alert('Failed to connect to the server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer" id="contact">
      {/* Newsletter Band */}
      <div className="footer__newsletter-band">
        <div className="footer__newsletter-band-inner">
          <div className="footer__newsletter-copy">
            <h3 className="footer__newsletter-title">Stay Ahead of the Market</h3>
            <p className="footer__newsletter-desc">
              Subscribe to get the latest premium properties and market updates, delivered straight to your inbox.
            </p>
          </div>
          <form className="footer__newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your email address"
              className="footer__newsletter-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
            <button type="submit" className="footer__newsletter-btn" disabled={submitting}>
              {submitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

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
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
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
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <span className="material-symbols-outlined footer__contact-icon">mail</span>
                <div>
                  <span className="footer__contact-label">E-Mail</span>
                  <a href="mailto:primeventra@gmail.com" className="footer__contact-value">primeventra@gmail.com</a>
                </div>
              </li>
              <li className="footer__contact-item">
                <span className="material-symbols-outlined footer__contact-icon">call</span>
                <div>
                  <span className="footer__contact-label">Phone Number</span>
                  <a href="tel:+94716494884" className="footer__contact-value">071 64 94 884</a>
                </div>
              </li>
              <li className="footer__contact-item">
                <span className="material-symbols-outlined footer__contact-icon">location_on</span>
                <div>
                  <span className="footer__contact-label">Office Address</span>
                  <span className="footer__contact-value">No.242, Moragahahena Rd, Pitipana, Homagama</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Latest Listings Column */}
          <div>
            <h4 className="footer__col-title">Latest Listings</h4>
            {latestListings.length > 0 ? (
              <div className="footer__listings">
                {latestListings.map(listing => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    state={{ property: listing }}
                    className="footer__listing-card"
                  >
                    <img
                      className="footer__listing-img"
                      src={listing.photos?.[0] ?? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}
                      alt={listing.title}
                      loading="lazy"
                    />
                    <div className="footer__listing-info">
                      <span className="footer__listing-title">{listing.title}</span>
                      <span className="footer__listing-price">Rs. {Number(listing.price).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="footer__listings-empty">New listings will appear here as soon as they're approved.</p>
            )}
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
