import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Hero.css';
import hero1 from '../../assets/webpfiles/hero1.webp';
import hero2 from '../../assets/webpfiles/hero2.jpg';
import hero3 from '../../assets/webpfiles/hero3.webp';
import hero4 from '../../assets/webpfiles/hero4.jpg';

const HERO_SLIDES = [hero1, hero2, hero3, hero4];
const SLIDE_INTERVAL_MS = 5500;

export default function Hero() {
  const navigate = useNavigate();
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (type) {
      params.set('type', type);
    }
    if (location.trim()) {
      params.set('location', location.trim());
    }
    if (budget) {
      if (budget === 'under-20m') {
        params.set('maxPrice', '20000000');
      } else if (budget === '20m-50m') {
        params.set('minPrice', '20000000');
        params.set('maxPrice', '50000000');
      } else if (budget === 'over-50m') {
        params.set('minPrice', '50000000');
      }
    }
    navigate(`/listing?${params.toString()}`);
  };

  return (
    <section className="hero">
      {/* Background Slider */}
      <div className="hero__bg">
        {HERO_SLIDES.map((slide, index) => (
          <img
            key={slide}
            className={`hero__bg-img ${index === activeSlide ? 'hero__bg-img--active' : ''}`}
            src={slide}
            alt="Premium property in Sri Lanka"
            aria-hidden={index !== activeSlide}
          />
        ))}
        <div className="hero__bg-overlay" />
        <div className="hero__dots" role="tablist" aria-label="Hero image slides">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide}
              type="button"
              role="tab"
              aria-selected={index === activeSlide}
              aria-label={`Show slide ${index + 1}`}
              className={`hero__dot ${index === activeSlide ? 'hero__dot--active' : ''}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="hero__content">
        <div className="hero__title-group">
         
          <h1 className="hero__title-main">Sri Lanka&rsquo;s Premier Real Estate Marketplace</h1>
        </div>
        <h2 className="hero__tagline">The Smartest Way to Own Your Dreams</h2>
        <p className="hero__subhead">
          Experience elite real estate services in Sri Lanka. From luxury apartments
          in Colombo to tranquil beachfront estates.
        </p>

        {/* Search Bar */}
        <div className="hero__search glass-effect">
          <div className="hero__search-field">
            <label className="hero__search-label">Property Type</label>
            <select
              className="hero__search-select"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="">Any Type</option>
              <option value="House">Houses</option>
              <option value="Apartment">Apartments</option>
              <option value="Land">Land</option>
            </select>
          </div>

          <div className="hero__search-field">
            <label className="hero__search-label">Location</label>
            <input
              className="hero__search-input"
              type="text"
              placeholder="Colombo, Kandy..."
              aria-label="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>

          <div className="hero__search-field">
            <label className="hero__search-label">Budget (Rs)</label>
            <select
              className="hero__search-select"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            >
              <option value="">Any Budget</option>
              <option value="under-20m">Under 20M</option>
              <option value="20m-50m">20M – 50M</option>
              <option value="over-50m">Over 50M</option>
            </select>
          </div>

          <button className="hero__search-btn" onClick={handleSearch}>
            <span className="material-symbols-outlined">search</span>
            Search Properties
          </button>
        </div>
      </div>
    </section>
  );
}
