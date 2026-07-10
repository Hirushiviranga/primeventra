import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Hero.css';
import heroImg from '../../assets/webpfiles/hero.jpg';

export default function Hero() {
  const navigate = useNavigate();
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

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
      {/* Background */}
      <div className="hero__bg">
        <img
          className="hero__bg-img"
          src={heroImg}
          alt="Luxury villa in Sri Lanka with infinity pool at sunset"
        />
        <div className="hero__bg-overlay" />
      </div>

      {/* Content */}
      <div className="hero__content">
        <h1 className="hero__title-group">
          <span className="hero__title-main">Sri Lanka’s Premier Real Estate Marketplace</span>
        </h1>
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
