import React from 'react';
import { Link } from 'react-router-dom';
import 'material-symbols';
import '../../styles/list.css';
import sellImg from '../../assets/webpfiles/sell.webp';
import homeImg from '../../assets/webpfiles/home.webp';
import apartmentImg from '../../assets/webpfiles/apartment.webp';
import landImg from '../../assets/webpfiles/land.webp';

export default function ListProperty() {
  return (
    <main className="list-property-page">
      {/* Hero Section */}
      <div className="hero-banner">
        <img 
          className="hero-banner__img" 
          src={sellImg}
          alt="Modern real estate office in Colombo"
        />
      
        <div className="hero-banner__overlay">
          <h1 className="hero-banner__title">Sell Your Property</h1>
          <p className="hero-banner__subtitle">
            Choose your property type below to get started listing with PrimeVentra's premium service.
          </p>
        </div>
      </div>

      {/* Selector Cards Container */}
      <div className="form-container" style={{ minHeight: '300px' }}>
        
        <p style={{ fontWeight: 700, color: 'var(--color-tertiary-light)', fontSize: '1.25rem', marginBottom: '2.5rem', textAlign: 'center' }}>
          Select Your Property Type to Continue
        </p>

        {/* Category Cards Selector */}
        <div className="category-cards" style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/list/house" className="category-card-new">
            <div className="card-image-header" style={{ backgroundImage: `url(${homeImg})` }}>
              <div className="card-image-overlay" />
            </div>
            <div className="card-icon-badge">
              <span className="material-symbols-outlined">home</span>
            </div>
            <div className="card-info-body">
              <h3>House</h3>
              <p>List individual houses, bungalows, & townhouses</p>
            </div>
          </Link>
          <Link to="/list/apartment" className="category-card-new">
            <div className="card-image-header" style={{ backgroundImage: `url(${apartmentImg})` }}>
              <div className="card-image-overlay" />
            </div>
            <div className="card-icon-badge">
              <span className="material-symbols-outlined">apartment</span>
            </div>
            <div className="card-info-body">
              <h3>Apartment</h3>
              <p>List condos, penthouses, & apartment units</p>
            </div>
          </Link>
          <Link to="/list/land" className="category-card-new">
            <div className="card-image-header" style={{ backgroundImage: `url(${landImg})` }}>
              <div className="card-image-overlay" />
            </div>
            <div className="card-icon-badge">
              <span className="material-symbols-outlined">terrain</span>
            </div>
            <div className="card-info-body">
              <h3>Land</h3>
              <p>List residential, commercial, & farm land plots</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust-badges-container" style={{ marginTop: '5rem' }}>
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined badge-item__icon">verified_user</span>
          </div>
          <h3 className="badge-item__title">Verified Leads</h3>
          <p className="badge-item__desc">Connect only with authenticated potential buyers.</p>
        </div>
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined">speed</span>
          </div>
          <h3 className="badge-item__title">Fast Approval</h3>
          <p className="badge-item__desc">Your listing goes live within 24 hours.</p>
        </div>
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <h3 className="badge-item__title">24/7 Support</h3>
          <p className="badge-item__desc">Our dedicated team is here to help.</p>
        </div>
      </div>
    </main>
  );
}