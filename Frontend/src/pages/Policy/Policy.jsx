import React from 'react';
import '../../styles/Policy.css';

export default function Policy() {
  return (
    <main className="policy-page">
      {/* Hero Banner */}
      <section className="policy-hero">
        <div className="policy-hero__bg">
          <div className="policy-hero__gradient" />
        </div>
        <div className="policy-hero__content">
          <h1 className="policy-hero__title">Privacy Policy</h1>
          <p className="policy-hero__subtitle">Effective Date: April 2026</p>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="policy-container">
        <div className="policy-content-wrapper">
          <p className="policy-intro">
            At <strong>Primeventra</strong>, accessible from primeventra.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Primeventra and how we use it.
          </p>

          <section className="policy-section">
            <h2 className="policy-section-title">1. Information We Collect</h2>
            <p className="policy-text">To provide a seamless property buying and selling experience, we collect the following information:</p>
            <ul className="policy-list">
              <li><strong>For Sellers:</strong> Name, contact number (WhatsApp/Phone), email address, and property details (location, photos, and status).</li>
              <li><strong>For Buyers:</strong> Name and contact information provided when inquiring about a property.</li>
              <li><strong>Automatically Collected Data:</strong> We may collect basic log information such as IP addresses, browser types, and the pages you visit to improve our website experience.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">2. How We Use Your Information</h2>
            <p className="policy-text">We use the information we collect to:</p>
            <ul className="policy-list">
              <li><strong>Facilitate Connections:</strong> Connect buyers directly with sellers.</li>
              <li><strong>Promotion:</strong> Showcase and promote your property listings on our website and official Facebook page.</li>
              <li><strong>Communication:</strong> Send you updates regarding your listings or inquiries.</li>
              <li><strong>Safety:</strong> Prevent fraudulent listings and maintain the integrity of our marketplace.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">3. Data Sharing & Third-Party Services</h2>
            <p className="policy-text">We focus on transparency in how your data is distributed:</p>
            <ul className="policy-list">
              <li><strong>Public Properties:</strong> When you list a property, certain details (like the description and your contact number) will be visible to the public to facilitate sales.</li>
              <li><strong>Facebook Promotion:</strong> By listing with us, you agree that we may share your property highlights on our Facebook page to increase visibility.</li>
              <li><strong>Legal Requirements:</strong> We will never sell your personal data. We only share information when required by Sri Lankan law or to protect the rights of our users.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">4. Direct Communication (WhatsApp & Calls)</h2>
            <p className="policy-text">
              Primeventra facilitates direct communication. Please note that once you share your contact details with a buyer or seller through our platform, that communication happens outside of our website. We encourage all users to practice safety when meeting for property viewings.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">5. Data Security</h2>
            <p className="policy-text">
              We prioritize the security of your data. We use industry-standard measures to protect your personal information from unauthorized access or disclosure.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">6. Your Rights</h2>
            <p className="policy-text">You have the right to:</p>
            <ul className="policy-list">
              <li>Request the deletion of your account or property listings at any time.</li>
              <li>Update or correct your personal information.</li>
              <li>Opt-out of promotional communications.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">7. Consent</h2>
            <p className="policy-text">
              By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
