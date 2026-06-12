import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'material-symbols';
import '../../styles/list.css';
import landImg from '../../assets/webpfiles/land.webp';

const WhatsAppIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512" 
    width="16" 
    height="16" 
    fill="currentColor"
    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2( 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 
  'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
];

export default function ListLand() {
  const [mainPhotoName, setMainPhotoName] = useState('No file chosen');
  const [photoNames, setPhotoNames] = useState(Array(7).fill('No file chosen'));

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    email: '',
    title: '',
    district: '',
    city: '',
    description: '',
    price: '',
    negotiable: 'No',
    package: '5000',
    landSize: '1',
    landUnit: 'Perches',
    landType: '',
    agreeToTerms: false,
  });

  const [isSameAsWhatsapp, setIsSameAsWhatsapp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => {
        const nextData = { ...prev, [name]: value };
        if (name === 'phone' && isSameAsWhatsapp) {
          nextData.whatsapp = value;
        }
        return nextData;
      });
    }
  };

  const handleSameAsWhatsappChange = (e) => {
    const checked = e.target.checked;
    setIsSameAsWhatsapp(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const handleMainPhotoChange = (e) => {
    setMainPhotoName(e.target.files[0]?.name || 'No file chosen');
  };

  const handleAdditionalPhotoChange = (e, index) => {
    const newNames = [...photoNames];
    newNames[index] = e.target.files[0]?.name || 'No file chosen';
    setPhotoNames(newNames);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        whatsapp: '',
        email: '',
        title: '',
        district: '',
        city: '',
        description: '',
        price: '',
        negotiable: 'No',
        package: '5000',
        landSize: '1',
        landUnit: 'Perches',
        landType: '',
        agreeToTerms: false,
      });
      setMainPhotoName('No file chosen');
      setPhotoNames(Array(7).fill('No file chosen'));

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
          src={landImg}
          alt="Prime land"
        />
        <div className="hero-banner__overlay">
          <h1 className="hero-banner__title">Sell Your Land</h1>
          <p className="hero-banner__subtitle">
            List your land on PrimeVentra and connect directly with motivated property buyers.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        
        {/* Navigation Category Cards */}
        <div className="category-cards">
          <Link to="/list/house" className="category-card">
            <span className="material-symbols-outlined">home</span>
            <h3>House</h3>
          </Link>
          <Link to="/list/apartment" className="category-card">
            <span className="material-symbols-outlined">apartment</span>
            <h3>Apartment</h3>
          </Link>
          <Link to="/list/land" className="category-card category-card--active">
            <span className="material-symbols-outlined">terrain</span>
            <h3>Land</h3>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="form-box" id="landForm">
          <p style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.125rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            Fill the Form and Submit for Review.
          </p>

          {/* Top Form Section: Land Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">terrain</span>
              <h2 className="form-section__title">Land Information</h2>
            </div>
            
            <div className="form-section__grid">
              
              {/* Title * */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Title *</span>
                </label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Enter Short Title" 
                  required
                />
              </div>

              {/* District * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">District *</span>
                </label>
                <select 
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Your District</option>
                  {DISTRICTS.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">City</span>
                </label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Enter Nearest City" 
                />
              </div>

              {/* Land Type * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Land Type *</span>
                </label>
                <select 
                  name="landType"
                  value={formData.landType}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Land Type</option>
                  <option value="Residential">Residential (පදිංචියට)</option>
                  <option value="Commercial">Commercial (ව්‍යාපාරික)</option>
                  <option value="Agricultural">Agricultural (කෘෂිකාර්මික)</option>
                  <option value="Other">Other (වෙනත්)</option>
                </select>
              </div>

              {/* Land Size */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Land Size</span>
                </label>
                <input 
                  type="number"
                  name="landSize"
                  value={formData.landSize}
                  onChange={handleInputChange}
                  min="1"
                  className="form-control"
                />
              </div>

              {/* Unit */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Unit</span>
                </label>
                <select 
                  name="landUnit"
                  value={formData.landUnit}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                >
                  <option value="">Unit</option>
                  <option value="Perches">Perches</option>
                  <option value="Acres">Acres</option>
                </select>
              </div>

              {/* Description * */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Description *</span>
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control form-control--textarea" 
                  placeholder="Describe the property's features, nearby amenities, and key selling points..." 
                  rows={4}
                  required
                />
              </div>

              {/* Price * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Price *</span>
                </label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Enter Price" 
                  required
                />
              </div>

              {/* Negotiable * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Negotiable *</span>
                </label>
                <select 
                  name="negotiable"
                  value={formData.negotiable}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

            </div>
          </section>

          {/* Photo Upload Section */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">add_a_photo</span>
              <h2 className="form-section__title">Add Property Photos</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'left', marginBottom: '1.25rem' }}>
              Maximum Size : 5 MB
            </p>

            <div className="file-upload-section-grid">
              
              <div className="file-input-group">
                <span className="file-input-title">Add Main Photo *</span>
                <div className="file-input-wrapper">
                  <label className="file-input-btn">
                    Choose File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleMainPhotoChange} 
                      required 
                    />
                  </label>
                  <span className="file-input-name">{mainPhotoName}</span>
                </div>
              </div>

              {[...Array(7)].map((_, i) => (
                <div className="file-input-group" key={i}>
                  <span className="file-input-title">Add a Photo</span>
                  <div className="file-input-wrapper">
                    <label className="file-input-btn">
                      Choose File
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleAdditionalPhotoChange(e, i)} 
                      />
                    </label>
                    <span className="file-input-name">{photoNames[i]}</span>
                  </div>
                </div>
              ))}

            </div>
          </section>

          {/* Preferred Packages */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">loyalty</span>
              <h2 className="form-section__title">Select Your Preferred Package</h2>
            </div>
            
            <div className="packages-grid">
              {[
                { value: '5000', label: 'RS.5000 | 4 Days | 1 Design' },
                { value: '9000', label: 'RS.9000 | 8 Days | 2 Design' },
                { value: '12000', label: 'RS.12000 | 15 Days | 3 Design' },
                { value: '15000', label: 'RS.15000 | 20 Days | 4 Design' },
              ].map((pkg) => (
                <label 
                  key={pkg.value} 
                  className={`package-card ${formData.package === pkg.value ? 'package-card--active' : ''}`}
                >
                  <input 
                    type="radio" 
                    name="package" 
                    value={pkg.value} 
                    checked={formData.package === pkg.value} 
                    onChange={handleInputChange} 
                    className="hidden-radio" 
                  />
                  <div className="package-card__content">
                    <span className="package-card__radio-circle" />
                    <span className="package-card__text">{pkg.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Bottom Form Section: Contact Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">contact_phone</span>
              <h2 className="form-section__title">Contact Details</h2>
            </div>
            
            <div className="form-section__grid">
              
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">First Name *</span>
                </label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="First Name" 
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Last Name *</span>
                </label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Last Name" 
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Phone Number *</span>
                </label>
                <div className="prefix-input-control">
                  <span className="prefix-input-control__prefix">Sri Lanka +94</span>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="prefix-input-control__input" 
                    placeholder="77 123 4567" 
                    required
                  />
                </div>
                <label className="checkbox-label" style={{ fontSize: '0.825rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <input 
                    type="checkbox" 
                    checked={isSameAsWhatsapp} 
                    onChange={handleSameAsWhatsappChange} 
                    className="form-checkbox"
                    style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                  />
                  <span>Is this also your WhatsApp number?</span>
                </label>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Enter WhatsApp Number</span>
                </label>
                <div className="prefix-input-control prefix-input-control--whatsapp">
                  <span className="prefix-input-control__icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <WhatsAppIcon />
                  </span>
                  <input 
                    type="tel" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="prefix-input-control__input" 
                    placeholder="77 123 4567" 
                    readOnly={isSameAsWhatsapp}
                  />
                </div>
              </div>

              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Email Address *</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Email Address" 
                  required
                />
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
                required
              />
              <label className="checkbox-label" htmlFor="terms">
                I agree to the Terms of Service and Privacy Policy.
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
              {!isSubmitting && !isSuccess && 'Submit'}
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
