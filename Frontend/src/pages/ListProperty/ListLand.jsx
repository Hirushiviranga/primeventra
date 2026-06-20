import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'material-symbols';
import '../../styles/list.css';
import landImg from '../../assets/webpfiles/land.webp';
import { supabase } from '../../api/supabaseClient';
import PaymentGateway from '../../components/PaymentGateway';

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

const COUNTRY_CODES = [
  { name: 'Australia', code: '+61' },
  { name: 'Canada', code: '+1' },
  { name: 'France', code: '+33' },
  { name: 'Germany', code: '+49' },
  { name: 'India', code: '+91' },
  { name: 'Italy', code: '+39' },
  { name: 'Japan', code: '+81' },
  { name: 'Maldives', code: '+960' },
  { name: 'New Zealand', code: '+64' },
  { name: 'Singapore', code: '+65' },
  { name: 'Sri Lanka', code: '+94' },
  { name: 'UAE', code: '+971' },
  { name: 'UK', code: '+44' },
  { name: 'USA', code: '+1' },
].sort((a, b) => {
  const codeA = parseInt(a.code.replace('+', ''));
  const codeB = parseInt(b.code.replace('+', ''));
  if (codeA !== codeB) {
    return codeA - codeB;
  }
  return a.name.localeCompare(b.name);
});

export default function ListLand() {
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+94');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+94');

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
      setWhatsappCountryCode(phoneCountryCode);
    }
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - uploadedPhotos.length;
    if (files.length > remaining) {
      alert(`You can only upload up to 10 images. Only the first ${remaining} images were added.`);
      const allowedFiles = files.slice(0, remaining);
      setUploadedPhotos(prev => [...prev, ...allowedFiles]);
      const newPreviews = allowedFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    } else {
      setUploadedPhotos(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
    }
    e.target.value = ''; // Reset input so same file can be selected again
  };

  const handleRemovePhoto = (index) => {
    if (photoPreviews[index]) {
      URL.revokeObjectURL(photoPreviews[index]);
    }
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhoneCountryCodeChange = (e) => {
    const code = e.target.value;
    setPhoneCountryCode(code);
    if (isSameAsWhatsapp) {
      setWhatsappCountryCode(code);
    }
  };

  const handleWhatsappCountryCodeChange = (e) => {
    setWhatsappCountryCode(e.target.value);
  };

  const [showPayment, setShowPayment] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (uploadedPhotos.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }
    setShowPayment(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerSubmitListing = async (method, status, transactionId = null, packagePrice = null, packageName = null) => {
    setIsSubmitting(true);

    try {
      // 1. Upload photos to Supabase Storage
      const photoUrls = [];
      
      for (const file of uploadedPhotos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `lands/${fileName}`;

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

      // 2. Retrieve logged-in portal user
      const portalUserStr = localStorage.getItem('portalUser');
      const portalUser = portalUserStr ? JSON.parse(portalUserStr) : null;
      const submittedBy = portalUser ? portalUser.username : null;

      // 3. Prepare payload for the backend
      const payload = {
        type: 'Land',
        photos: photoUrls,
        ...formData,
        phone: `${phoneCountryCode} ${formData.phone}`,
        whatsapp: formData.whatsapp ? `${whatsappCountryCode} ${formData.whatsapp}` : '',
        submittedBy,
        paymentMethod: method,
        paymentStatus: status,
        transactionId,
        packagePrice,
        packageName
      };

      // 4. Post payload to the backend
      const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/listings'
        : 'https://primeventra-vrmv.vercel.app/api/listings';

      const response = await fetch(API_URL, {
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

      // 5. Handle Success
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
        landSize: '1',
        landUnit: 'Perches',
        landType: '',
        agreeToTerms: false,
      });
      // Revoke preview URLs
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
      setUploadedPhotos([]);
      setPhotoPreviews([]);

    } catch (error) {
      console.error('Error submitting listing:', error);
      alert(`Failed to submit listing: ${error.message}`);
      setIsSubmitting(false);
      throw error;
    }
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
        
        {/* Back to Selection Button */}
        <Link to="/list" className="btn-back" style={{ textDecoration: 'none', marginBottom: '2rem', width: 'fit-content' }}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Selection
        </Link>

        {/* Navigation Category Cards */}
        <div className="category-cards" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <div className="category-card-new" style={{ cursor: 'default' }}>
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
          </div>
        </div>

        {showPayment ? (
          <PaymentGateway
            propertyType="Land"
            formData={{
              ...formData,
              phone: `${phoneCountryCode} ${formData.phone}`,
              whatsapp: formData.whatsapp ? `${whatsappCountryCode} ${formData.whatsapp}` : ''
            }}
            onBack={() => setShowPayment(false)}
            onSubmitListing={triggerSubmitListing}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
          />
        ) : (
          <form onSubmit={handleNextStep} className="form-box" id="landForm">
            <p style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.125rem', marginBottom: '0.5rem', textAlign: 'left' }}>
              Fill the Form and Proceed to Payment.
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

              {/* City */}
              <div className="input-group">
                <label className="input-label">
                  <span className="input-label__text">City</span>
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>නගරය</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ඉඩම් වර්ගය</span>
                </label>
                <select 
                  name="landType"
                  value={formData.landType}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                  required
                >
                  <option value="">Select Land Type (තෝරන්න)</option>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ඉඩමේ ප්‍රමාණය</span>
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
                  <span className="font-sinhala-helper text-sinhala-helper text-text-muted" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 'normal', marginTop: '0.125rem' }}>ඒකකය</span>
                </label>
                <select 
                  name="landUnit"
                  value={formData.landUnit}
                  onChange={handleInputChange}
                  className="form-control form-control--select"
                >
                  <option value="">Unit (ඒකකය)</option>
                  <option value="Perches">Perches (පර්චස්)</option>
                  <option value="Acres">Acres (අක්කර)</option>
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
              style={{ cursor: 'pointer' }}
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

            {/* Display chosen files preview grid */}
            {uploadedPhotos.length > 0 && (
              <div className="uploaded-files-list" style={{ marginTop: '1.5rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Selected Images ({uploadedPhotos.length} of 10):</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
                  {uploadedPhotos.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '110px', height: '110px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid var(--color-outline-variant)', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' }}>
                      <img 
                        src={photoPreviews[idx]} 
                        alt={file.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(234, 67, 53, 0.95)',
                          color: '#fff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          transition: 'all 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d32f2f'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(234, 67, 53, 0.95)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        title="Remove this image"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 'bold' }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
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
                <div className="prefix-input-control" style={{ gap: '0.25rem' }}>
                  <select 
                    value={phoneCountryCode}
                    onChange={handlePhoneCountryCodeChange}
                    className="prefix-input-control__select"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-text-muted)',
                      outline: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      maxWidth: '120px'
                    }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={`phone-${c.name}-${c.code}`} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
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
                <div className="prefix-input-control prefix-input-control--whatsapp" style={{ gap: '0.25rem' }}>
                  <span className="prefix-input-control__icon" style={{ display: 'inline-flex', alignItems: 'center', marginRight: '4px' }}>
                    <WhatsAppIcon />
                  </span>
                  <select 
                    value={whatsappCountryCode}
                    onChange={handleWhatsappCountryCodeChange}
                    disabled={isSameAsWhatsapp}
                    className="prefix-input-control__select"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-text-muted)',
                      outline: 'none',
                      fontSize: '14px',
                      cursor: isSameAsWhatsapp ? 'not-allowed' : 'pointer',
                      maxWidth: '120px'
                    }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={`wa-${c.name}-${c.code}`} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
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
              className="form-submit-btn"
            >
              Next <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
        )}
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