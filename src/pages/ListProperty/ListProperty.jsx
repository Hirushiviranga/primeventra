import React, { useState } from 'react';
import 'material-symbols';
import '../../styles/list.css';

export default function ListProperty() {
  // Form Submission States
  const [formData, setFormData] = useState({
    title: '',
    listingType: 'For Sale (විකිණීමට)',
    price: '',
    location: '',
    category: 'Land',
    description: '',
    fullName: '',
    phone: '',
    whatsapp: '',
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const selectCategory = (category) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission animation
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <main className="list-property-page">
      {/* Hero Section */}
      <div className="hero-banner">
        <img 
          className="hero-banner__img" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQSVL_WKsWW-46NDG4v-R8yP7oQaqeWm0o9yY9cnQIW99_5zfuDGyLzbHGcer-iH1Nx8DXXOFgPcu6tByx_Ax28jILYiMjs1_YxfnNphLF9Z5wvMdplfQrmqV_9CtjWIx6IpouI18VIfGUAb0G_xaGInTgEBqU6S55igRIULOU0Mvxt_m08HzJXvAYWHXONznM508b3RVDuTE5EdT3FCo0Kax-tT0aaNSQ6_j_sugPplR1KshCPvRoSbIVh8MWJ7eSbtmU3eaHKOGo"
          alt="Modern real estate office in Colombo"
        />
        <div className="hero-banner__overlay">
          <h1 className="hero-banner__title">Sell Your Property</h1>
          <p className="hero-banner__subtitle">
            Reach thousands of verified buyers and renters with PrimeVentra's premium listing service.
          </p>
        </div>
      </div>

      {/* Form Container (Overlaps bottom of Hero) */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="form-box" id="propertyForm">
          
          {/* Section: Property Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">domain</span>
              <h2 className="form-section__title">Property Information</h2>
            </div>
            
            <div className="form-section__grid">
              {/* Property Title */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Property Title</span>
                  <span className="font-sinhala-helper">දේපලෙහි නම</span>
                </label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="e.g. Modern 3-Bedroom Apartment in Colombo 07" 
                />
              </div>

              {/* Listing Type */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Listing Type</span>
                  <span className="font-sinhala-helper">ලැයිස්තුගත කිරීමේ වර්ගය</span>
                </label>
                <select 
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                >
                  <option>For Sale (විකිණීමට)</option>
                  <option>For Rent (කුලියට)</option>
                </select>
              </div>

              {/* Price */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Price (LKR)</span>
                  <span className="font-sinhala-helper">මිල (රුපියල්)</span>
                </label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="e.g. 25,000,000" 
                />
              </div>

              {/* Location */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Location</span>
                  <span className="font-sinhala-helper">ස්ථානය</span>
                </label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="e.g. Kandy Road, Kadawatha" 
                />
              </div>

              {/* Property Category Chip-set */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Property Category</span>
                  <span className="font-sinhala-helper">දේපල වර්ගය</span>
                </label>
                <div className="chips-wrapper">
                  {['Land', 'House', 'Apartment', 'Commercial'].map((cat) => (
                    <span
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className={`chip-item font-label-caps ${
                        formData.category === cat ? 'chip-item--active' : ''
                      }`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Description</span>
                  <span className="font-sinhala-helper">විස්තරය</span>
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control form-control--textarea" 
                  placeholder="Describe the property's features, nearby amenities, and key selling points..." 
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* Section: Media Upload */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">add_a_photo</span>
              <h2 className="form-section__title">Media Upload</h2>
            </div>
            
            <label htmlFor="imageUpload" className="upload-dropzone">
              <span className="material-symbols-outlined upload-dropzone__icon">cloud_upload</span>
              <p className="upload-dropzone__title">Click or drag images here</p>
              <p className="upload-dropzone__desc">Upload up to 10 high-resolution photos (JPG, PNG). Min size: 1280x720px.</p>
              <span className="font-sinhala-helper">ඡායාරූප උඩුගත කරන්න</span>
              <input type="file" id="imageUpload" name="imageUpload" className="hidden-file-input" multiple />
            </label>
          </section>

          {/* Section: Contact Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">contact_phone</span>
              <h2 className="form-section__title">Contact Details</h2>
            </div>
            
            <div className="form-section__grid">
              {/* Name */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Full Name</span>
                  <span className="font-sinhala-helper">සම්පූර්ණ නම</span>
                </label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="John Doe" 
                />
              </div>

              {/* Phone */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Phone Number</span>
                  <span className="font-sinhala-helper">දුරකථන අංකය</span>
                </label>
                <div className="prefix-input-control">
                  <span className="prefix-input-control__prefix">+94</span>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="prefix-input-control__input" 
                    placeholder="77 123 4567" 
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">WhatsApp Number</span>
                  <span className="font-sinhala-helper">වට්ස්ඇප් අංකය</span>
                </label>
                <div className="prefix-input-control prefix-input-control--whatsapp">
                  <span className="material-symbols-outlined prefix-input-control__icon">chat</span>
                  <input 
                    type="tel" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="prefix-input-control__input" 
                    placeholder="77 123 4567" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="terms" 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="form-checkbox" 
              />
              <label className="checkbox-label" htmlFor="terms">
                I agree to the <a className="checkbox-link" href="#terms">Terms of Service</a> and Privacy Policy.
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className={`form-submit-btn ${
                isSuccess ? 'form-submit-btn--success' : ''
              }`}
            >
              {isSubmitting && (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span> Submitting...
                </>
              )}
              {isSuccess && (
                <>
                  <span className="material-symbols-outlined">check_circle</span> Success!
                </>
              )}
              {!isSubmitting && !isSuccess && 'Submit Property'}
            </button>
          </div>
        </form>
      </div>

      {/* Trust Badges */}
      <div className="trust-badges-container">
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined badge-item__icon">verified_user</span>
          </div>
          <h3 className="badge-item__title">Verified Leads</h3>
          <p className="badge-item__desc">Connect only with authenticated potential buyers.</p>
        </div>
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined badge-item__icon">speed</span>
          </div>
          <h3 className="badge-item__title">Fast Approval</h3>
          <p className="badge-item__desc">Your listing goes live within 24 hours.</p>
        </div>
        <div className="badge-item">
          <div className="badge-item__icon-wrapper">
            <span className="material-symbols-outlined badge-item__icon">support_agent</span>
          </div>
          <h3 className="badge-item__title">24/7 Support</h3>
          <p className="badge-item__desc">Our dedicated team is here to help.</p>
        </div>
      </div>
    </main>
  );
}