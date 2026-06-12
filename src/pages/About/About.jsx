import React from 'react';
import '../../styles/About.css';

export default function About() {
  return (
    <main className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero__bg">
          <div className="about-hero__gradient" />
        </div>
        <div className="about-hero__content">
          <h1 className="about-hero__title">Sri Lanka’s Premier Real Estate Marketplace</h1>
          <p className="about-hero__subtitle">The Future of Property in Sri Lanka</p>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="about-container">
        
        {/* Adjusted content wrapper for clean text flow */}
        <div className="about-content-wrapper">
          {/* Story Section */}
          <section className="about-section story-section">
            <h2 className="section-title">Our Vision & Mission</h2>
            <p className="story-text">
              At <strong>Primeventra</strong>, we believe that finding your dream home or selling a valuable asset shouldn’t be a complicated journey. Born out of a passion for real estate and technology, we have created a seamless digital marketplace designed specifically for the Sri Lankan community.
            </p>
          </section>

          {/* What We Do Section */}
          <section className="about-section what-we-do-section">
            
            <h2 className="section-title">What We Do</h2>
            <p className="story-text">
              We bridge the gap between motivated sellers and aspiring homeowners. Our platform is a high-visibility hub where anyone—from individual homeowners to professional developers—can list their properties.
            </p>
            <p className="story-text mt-4">
              We don’t just host listings; we actively promote them. By leveraging our website and our dedicated Facebook community, we ensure that every property gets the <strong>“Prime”</strong> exposure it deserves.
            </p>
          </section>
        </div>

        {/* Why Choose Us Section */}
        <section className="about-section why-section">
          <div className="text-center">
            <h2 className="section-title">Why Primeventra?</h2>
            <p className="section-subtitle">
              In a market where trust is everything, Primeventra stands for transparency and efficiency. We focus on:
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="material-symbols-outlined">forum</span>
              </div>
              <h3 className="feature-title">Direct Connections</h3>
              <p className="feature-desc">No hidden layers. Buyers and sellers talk directly.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="material-symbols-outlined">devices</span>
              </div>
              <h3 className="feature-title">Modern Accessibility</h3>
              <p className="feature-desc">A minimalist, easy-to-use interface built for the modern Sri Lankan user.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <h3 className="feature-title">Results-Driven Marketing</h3>
              <p className="feature-desc">Using social media to turn "listings" into "sold" properties.</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
