import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'material-symbols';
import '../../styles/list.css';
import apartmentImg from '../../assets/webpfiles/apartment.webp';

// Import your Supabase client (Make sure this path points to your actual client file)
import { supabase } from '../../api/supabaseClient';

const WhatsAppIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512" 
    width="16" 
    height="16" 
    fill="currentColor"
    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 
  'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 
  'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
];

const ROOM_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+'];

export default function ListApartment() {
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

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
    apartmentSize: '',
    apartmentComplex: '',
    bedrooms: '',
    bathrooms: '',
    completionStatus: 'Ready',
    furnishedStatus: 'Unfurnished',
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

  const handlePhotosChange = (e) => {
    // Store actual File objects, not just names, so they can be uploaded to Supabase
    const files = Array.from(e.target.files || []);
    setUploadedPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload photos to Supabase Storage
      const photoUrls = [];
      
      for (const file of uploadedPhotos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `apartments/${fileName}`;

        // Upload to the 'property-images' bucket
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
        }

        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        photoUrls.push(publicUrl);
      }

      // 2. Prepare payload for the backend
      const payload = {
        type: 'Apartment',
        photos: photoUrls,
        ...formData
      };

      // 3. Insert listing into the database via the backend API - UPDATED TO ABSOLUTE URL
      const response = await fetch('https://primeventra-vrmv.vercel.app/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit listing. Status: ${response.status}`);
      }

      // 4. Handle Success
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset Form
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
        apartmentSize: '',
        apartmentComplex: '',
        bedrooms: '',
        bathrooms: '',
        completionStatus: 'Ready',
        furnishedStatus: 'Unfurnished',
        agreeToTerms: false,
      });
      setUploadedPhotos([]);
      setIsSameAsWhatsapp(false);

      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting listing:', error);
      alert(`Failed to submit listing: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="list-property-page">
      {/* Hero Section */}
      <div className="hero-banner">
        <img 
          className="hero-banner__img" 
          src={apartmentImg}
          alt="Modern luxury apartment"
        />
        <div className="hero-banner__overlay">
          <h1 className="hero-banner__title">Sell Your Apartment</h1>
          <p className="hero-banner__subtitle">
            List your apartment on PrimeVentra and connect directly with verified buyers and renters.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        
        {/* Navigation Category Cards */}
        <div className="category-cards">
          <div className="category-card category-card--active" style={{ cursor: 'default' }}>
            <span className="material-symbols-outlined">apartment</span>
            <h3>Apartment</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-box" id="apartmentForm">
          <p style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.125rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            Fill the Form and Submit for Review.
          </p>

          {/* Top Form Section: Apartment Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">apartment</span>
              <h2 className="form-section__title">Apartment Information</h2>
            </div>
            
            <div className="form-section__grid">
              
              {/* Title * */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Title *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>දේපලෙහි නම</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>දිස්ත්‍රික්කය</span>
                </label>
                <select 
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Your District (දිස්ත්‍රික්කය තෝරන්න)</option>
                  {DISTRICTS.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* City * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">City *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නගරය</span>
                </label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="Enter Nearest City" 
                  required
                />
              </div>

              {/* Size (sqft) * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Size (sqft) *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ප්‍රමාණය (වර්ග අඩි)</span>
                </label>
                <input 
                  type="number"
                  name="apartmentSize"
                  value={formData.apartmentSize}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Size"
                  required
                />
              </div>

              {/* Apartment Complex * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Apartment Complex *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>මහල් නිවාස සංකීර්ණය</span>
                </label>
                <input 
                  type="text"
                  name="apartmentComplex"
                  value={formData.apartmentComplex}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Apartment Complex"
                  required
                />
              </div>

              {/* Bedrooms * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Bedrooms *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නිදන කාමර</span>
                </label>
                <select 
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Bedrooms (තෝරන්න)</option>
                  {ROOM_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Bathrooms * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Bathrooms *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නාන කාමර</span>
                </label>
                <select 
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Bathrooms (තෝරන්න)</option>
                  {ROOM_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Completion Status * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Completion Status *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ඉදිකිරීම් තත්ත්වය</span>
                </label>
                <select 
                  name="completionStatus"
                  value={formData.completionStatus}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="Ready">Ready (සූදානම්)</option>
                  <option value="Upcoming">Upcoming (ඉදිරියට)</option>
                  <option value="Ongoing">Ongoing (ඉදිකරමින් පවතින)</option>
                </select>
              </div>

              {/* Furnished Status * */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Furnished Status *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ගෘහ භාණ්ඩ සහිත තත්ත්වය</span>
                </label>
                <select 
                  name="furnishedStatus"
                  value={formData.furnishedStatus}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="Unfurnished">Unfurnished (ගෘහ භාණ්ඩ රහිත)</option>
                  <option value="Fully Furnished">Fully Furnished (ගෘහ භාණ්ඩ සහිත)</option>
                  <option value="Semi Furnished">Semi Furnished (අර්ධ වශයෙන් ගෘහ භාණ්ඩ සහිත)</option>
                </select>
              </div>

              {/* Description * */}
              <div className="input-group input-group--full">
                <label className="input-label">
                  <span className="input-label__text">Description *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>විස්තරය</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>මිල</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>මිල සාකච්ඡා කළ හැක</span>
                </label>
                <select 
                  name="negotiable"
                  value={formData.negotiable}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="Yes">Yes (ඔව්)</option>
                  <option value="No">No (නැත)</option>
                </select>
              </div>

            </div>
          </section>

          {/* Photo Upload Section */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">add_a_photo</span>
              <h2 className="form-section__title">
                Media Upload
                <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.25rem' }}>මාධ්‍ය උඩුගත කිරීම</span>
              </h2>
            </div>

            <div 
              className="upload-dropzone" 
              onClick={() => document.getElementById('imageUpload').click()}
            >
              <span className="material-symbols-outlined upload-dropzone__icon">cloud_upload</span>
              <p className="upload-dropzone__title">Click to upload images</p>
              <p className="upload-dropzone__desc">Upload up to 10 high-resolution photos (JPG, PNG).</p>
              <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ marginTop: '0.5rem' }}>ඡායාරූප උඩුගත කරන්න</span>
              <input 
                type="file" 
                id="imageUpload" 
                multiple 
                accept="image/*" 
                className="hidden-file-input" 
                onChange={handlePhotosChange}
              />
            </div>

            {/* Display chosen files list */}
            {uploadedPhotos.length > 0 && (
              <div className="uploaded-files-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Selected Files ({uploadedPhotos.length}):</p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {uploadedPhotos.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Bottom Form Section: Contact Details */}
          <section className="form-section">
            <div className="form-section__header">
              <span className="material-symbols-outlined form-section__icon">contact_phone</span>
              <h2 className="form-section__title">
                Contact Details
                <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.25rem' }}>සම්බන්ධතා තොරතුරු</span>
              </h2>
            </div>
            
            <div className="form-section__grid">
              
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">First Name *</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>මුල් නම</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>වාසගම</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>දුරකථන අංකය</span>
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
                  <span>Is this also your WhatsApp number? (මෙය ඔබගේ වට්ස්ඇප් අංකයද?)</span>
                </label>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">Enter WhatsApp Number</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>වට්ස්ඇප් අංකය</span>
                </label>
                <div className="prefix-input-control prefix-input-control--whatsapp">
                  <span className="prefix-input-control__icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <WhatsAppIcon />
                  </span>
                  <span className="prefix-input-control__prefix">Sri Lanka +94</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>විද්‍යුත් තැපෑල</span>
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
                I agree to the Terms of Service and Privacy Policy. (සේවා කොන්දේසි සහ රහස්‍යතා ප්‍රතිපත්තියට මම එකඟ වෙමි.)
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