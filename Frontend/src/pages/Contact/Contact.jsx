import React, { useState } from 'react';
import '../../styles/Contact.css';

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/contact'
  : 'https://primeventra-vrmv.vercel.app/api/contact';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });

        // Clear success notification after 4 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 4000);
      })
      .catch((error) => {
        console.error('Error submitting contact form:', error);
        alert('Failed to send message. Please try again.');
        setIsSubmitting(false);
      });
  };

  return (
    <main className="contact-page">
      {/* Hero Banner */}
      <section className="contact-hero">
        <div className="contact-hero__bg">
          <div className="contact-hero__gradient" />
        </div>
        <div className="contact-hero__content">
          <h1 className="contact-hero__title">Contact Us Now!</h1>
          <p className="contact-hero__subtitle">We'd love to hear from you. Get in touch with our team today.</p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="contact-container">
        <div className="contact-grid">
          {/* Info Card */}
          <div className="contact-info">
            <div className="info-header">
              <span className="info-subtitle">We're here to help you</span>
              <h2 className="info-title">
                Discuss Your <br />
                <span className="title-highlight-blue">Property</span>{' '}
                <span className="title-highlight-gold">Needs</span> <br />
                With Our Expert
              </h2>
              <p className="info-description">
                Looking for strategic property solutions tailored to your goals? Get in touch with our team today.
              </p>
            </div>
            
            <div className="info-items">
              <div className="info-item info-item--email">
                <div className="info-icon-container info-icon-container--envelope">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div className="info-text-group">
                  <span className="info-item-label">E-Mail</span>
                  <a href="mailto:primeventra@gmail.com" className="info-item-value">primeventra@gmail.com</a>
                </div>
              </div>

              <div className="info-item info-item--phone">
                <div className="info-icon-container info-icon-container--phone">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div className="info-text-group">
                  <span className="info-item-label">Phone Number</span>
                  <a href="tel:+94716494884" className="info-item-value">071 64 94 884</a>
                </div>
              </div>

              <div className="info-item info-item--address">
                <div className="info-icon-container info-icon-container--address">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div className="info-text-group">
                  <span className="info-item-label">Office Address</span>
                  <p className="info-item-value info-item-value--text">No.242, Moragahahena Rd, Pitipana, Homagama</p>
                </div>
              </div>
            </div>

          </div>

          {/* Contact Form Card */}
          <div className="contact-form-card">
            <h2 className="form-title">Send a Message</h2>
            <p className="form-desc">
              Fill out the form below and we will get back to you shortly.
            </p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-group">
                <label htmlFor="name" className="contact-form-label">
                  <span className="label-text">Full Name *</span>
                  <span className="sinhala-helper-text">සම්පූර්ණ නම</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="contact-form-control"
                  required
                />
              </div>

              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="email" className="contact-form-label">
                    <span className="label-text">Email Address *</span>
                    <span className="sinhala-helper-text">විද්‍යුත් තැපෑල</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="contact-form-control"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="phone" className="contact-form-label">
                    <span className="label-text">Phone Number</span>
                    <span className="sinhala-helper-text">දුරකථන අංකය</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="07X XXX XXXX"
                    className="contact-form-control"
                  />
                </div>
              </div>

              <div className="contact-form-group">
                <label htmlFor="subject" className="contact-form-label">
                  <span className="label-text">Subject *</span>
                  <span className="sinhala-helper-text">මාතෘකාව</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What is this regarding?"
                  className="contact-form-control"
                  required
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="message" className="contact-form-label">
                  <span className="label-text">Message *</span>
                  <span className="sinhala-helper-text">පණිවිඩය</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  rows="5"
                  className="contact-form-control contact-form-control--textarea"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`contact-submit-btn ${isSuccess ? 'contact-submit-btn--success' : ''}`}
              >
                {isSubmitting && (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Sending...
                  </>
                )}
                {isSuccess && (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Message Sent!
                  </>
                )}
                {!isSubmitting && !isSuccess && 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
