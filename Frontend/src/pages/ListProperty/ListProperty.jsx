import React from 'react';
import { Link } from 'react-router-dom';
import 'material-symbols';
import '../../styles/list.css';
import sellImg from '../../assets/webpfiles/sell.webp';

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
        <div className="category-cards" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <Link to="/list/house" className="category-card" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>home</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>House</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>List individual houses, bungalows, & townhouses</p>
          </Link>
          <Link to="/list/apartment" className="category-card" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>apartment</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Apartment</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>List condos, penthouses, & apartment units</p>
          </Link>
          <Link to="/list/land" className="category-card" style={{ textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3.5rem' }}>terrain</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Land</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>List residential, commercial, & farm land plots</p>
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