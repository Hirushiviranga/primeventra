import React from 'react';
import '../../styles/About.css';
import about1 from '../../assets/webpfiles/about1.jpg';
import about2 from '../../assets/webpfiles/about2.jpg';

export default function About() {
  return (
    <main className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero__bg">
          <div className="about-hero__gradient" />
        </div>
        <div className="about-hero__content">
          <span className="about-eyebrow about-eyebrow--on-dark">About Primeventra</span>
          <h1 className="about-hero__title">Sri Lanka’s Premier Real Estate Marketplace</h1>
          <p className="about-hero__subtitle">The Future of Property in Sri Lanka</p>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="about-container">

        {/* Our Story: image + content split */}
        <section className="about-story">
          <div className="about-story__visual">
            <img src={about1} alt="Modern property showcased on Primeventra" className="about-story__img" />
            <div className="about-story__badge">
              <span className="material-symbols-outlined">verified</span>
              <span>Trusted by Sellers &amp; Buyers Island-Wide</span>
            </div>
          </div>

          <div className="about-story__content">
            <span className="about-eyebrow">Who We Are</span>

            <div className="about-story__block">
              <div className="about-story__block-header">
                <span className="material-symbols-outlined about-story__icon">insights</span>
                <h2 className="about-story__block-title">Our Vision &amp; Mission</h2>
              </div>
              <p className="about-story__text">
                At <strong>Primeventra</strong>, we believe that finding your dream home or selling a valuable asset shouldn’t be a complicated journey.
              </p>
              <p className="about-story__text highlight-text">
                Born out of a passion for real estate and technology, we have created a seamless digital marketplace designed specifically for the Sri Lankan community.
              </p>
            </div>

            <div className="about-story__block">
              <div className="about-story__block-header">
                <span className="material-symbols-outlined about-story__icon">handshake</span>
                <h2 className="about-story__block-title">What We Do</h2>
              </div>
              <p className="about-story__text">
                We bridge the gap between motivated sellers and aspiring homeowners. Our platform is a high-visibility hub where anyone—from individual homeowners to professional developers—can list their properties.
              </p>
              <p className="about-story__text">
                We don’t just host listings; we actively promote them. By leveraging our website and our dedicated Facebook community, we ensure that every property gets the <strong>“Prime”</strong> exposure it deserves.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="about-section why-section-new">
          <div className="why-content-split">
            <div className="why-intro-pane">
              <span className="about-eyebrow">Our Difference</span>
              <h2 className="section-title-new">Why Primeventra?</h2>
              <p className="section-subtitle-new">
                In a market where trust is everything, Primeventra stands for transparency and efficiency. We focus on:
              </p>
              <div className="why-intro-pane__visual">
                <img src={about2} alt="Primeventra property listing" className="why-intro-pane__img" />
              </div>
            </div>

            <div className="why-features-pane">
              <div className="why-feature-row">
                <div className="why-feature-icon-box">
                  <span className="material-symbols-outlined">forum</span>
                </div>
                <div className="why-feature-text">
                  <h3 className="why-feature-title">Direct Connections</h3>
                  <p className="why-feature-desc">No hidden layers. Buyers and sellers talk directly.</p>
                </div>
              </div>

              <div className="why-feature-row">
                <div className="why-feature-icon-box">
                  <span className="material-symbols-outlined">devices</span>
                </div>
                <div className="why-feature-text">
                  <h3 className="why-feature-title">Modern Accessibility</h3>
                  <p className="why-feature-desc">A minimalist, easy-to-use interface built for the modern Sri Lankan user.</p>
                </div>
              </div>

              <div className="why-feature-row">
                <div className="why-feature-icon-box">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div className="why-feature-text">
                  <h3 className="why-feature-title">Results-Driven Marketing</h3>
                  <p className="why-feature-desc">Using social media to turn "listings" into "sold" properties.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
