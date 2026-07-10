import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/propertydetails.css';
import logo3 from '../../assets/logo3.png';

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

function parsePropertyDescription(descString) {
  if (!descString) {
    return { mainDesc: '', features: [], contacts: [], admin: [] };
  }
  const separator = '--- Property & Contact Details ---';
  let mainDesc = descString;
  let metadataBlock = '';
  
  if (descString.includes(separator)) {
    const parts = descString.split(separator);
    mainDesc = parts[0].trim();
    metadataBlock = parts[1] || '';
  }

  const lines = metadataBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const features = [];
  const contacts = [];
  const admin = [];

  const contactKeys = ['phone', 'whatsapp', 'email', 'contact person', 'google map link'];
  const adminKeys = ['submitted by', 'payment method', 'payment status', 'status', 'transaction id', 'package chosen', 'listing fee', 'featured'];

  lines.forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim();
      const lowerKey = key.toLowerCase();

      if (contactKeys.includes(lowerKey)) {
        contacts.push({ label: key, value: val });
      } else if (adminKeys.includes(lowerKey)) {
        admin.push({ label: key, value: val });
      } else {
        features.push({ label: key, value: val });
      }
    } else {
      features.push({ label: '', value: line });
    }
  });

  return { mainDesc, features, contacts, admin };
}

export default function PropertyDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const property = location.state?.property;
  const [allProperties, setAllProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  
  // Gallery active index state (single tap)
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Advertiser info state
  const [advertiser, setAdvertiser] = useState(null);

  // Reveal contact actions state
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [whatsappRevealed, setWhatsappRevealed] = useState(false);

  // Lightbox Modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [similarStartIndex, setSimilarStartIndex] = useState(0);

  useEffect(() => {
    const userStr = sessionStorage.getItem('portalUser');
    if (userStr && property) {
      const user = JSON.parse(userStr);
      const liked = JSON.parse(localStorage.getItem(`liked_properties_${user.username}`) || '[]');
      setIsLiked(liked.includes(property.id));
    }
  }, [property]);

  const handleLikeToggle = () => {
    const userStr = sessionStorage.getItem('portalUser');
    if (!userStr) {
      alert('Please log in to add properties to your favorites!');
      return;
    }
    const user = JSON.parse(userStr);
    const key = `liked_properties_${user.username}`;
    let liked = JSON.parse(localStorage.getItem(key) || '[]');
    let nextLiked = false;
    if (liked.includes(property.id)) {
      liked = liked.filter(x => x !== property.id);
      nextLiked = false;
    } else {
      liked.push(property.id);
      nextLiked = true;
    }
    localStorage.setItem(key, JSON.stringify(liked));
    setIsLiked(nextLiked);
  };

  useEffect(() => {
    if (!property) {
      navigate('/listing');
      return;
    }
    window.scrollTo(0, 0);

    const paymentsUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api/payments'
      : 'https://primeventra-vrmv.vercel.app/api/payments';

    const fetchListings = fetch(API_URL).then(res => res.json());
    const fetchPayments = fetch(paymentsUrl).then(res => res.json()).catch(() => []);

    Promise.all([fetchListings, fetchPayments])
      .then(([listingsData, paymentsData]) => {
        setAllProperties(listingsData || []);
        setPayments(paymentsData || []);
      })
      .catch(err => console.error("Error fetching similar:", err));
  }, [property, navigate]);

  if (!property) return null;

  const { mainDesc, features, contacts, admin } = parsePropertyDescription(property.description);
  
  const phoneObj = contacts.find(c => c.label.toLowerCase() === 'phone');
  const phoneVal = phoneObj ? phoneObj.value : '';
  const whatsappObj = contacts.find(c => c.label.toLowerCase() === 'whatsapp');
  const whatsappVal = whatsappObj ? whatsappObj.value : '';
  const emailObj = contacts.find(c => c.label.toLowerCase() === 'email');
  const emailVal = emailObj ? emailObj.value : '';
  const contactPersonObj = contacts.find(c => c.label.toLowerCase() === 'contact person');
  const contactPerson = contactPersonObj ? contactPersonObj.value : '';

  const negotiableObj = admin.find(a => a.label.toLowerCase() === 'negotiable');
  const negotiableVal = negotiableObj ? negotiableObj.value : 'No';

  const mapLinkObj = contacts.find(c => c.label.toLowerCase() === 'google map link');
  const mapLink = mapLinkObj ? mapLinkObj.value : '';

  const submittedByObj = admin.find(a => a.label.toLowerCase() === 'submitted by');
  const submittedBy = submittedByObj ? submittedByObj.value : '';

  const completionStatusObj = features.find(f => f.label.toLowerCase() === 'completion status');
  const completionStatusVal = completionStatusObj ? completionStatusObj.value : '';

  const furnishedStatusObj = features.find(f => f.label.toLowerCase() === 'furnished status');
  const furnishedStatusVal = furnishedStatusObj ? furnishedStatusObj.value : '';

  // Get advertiser profile info async
  const USER_API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:5000/api/users'
    : 'https://primeventra-vrmv.vercel.app/api/users';

  useEffect(() => {
    if (submittedBy) {
      fetch(`${USER_API_URL}/${submittedBy}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => setAdvertiser(data))
        .catch(err => {
          console.warn("Failed to fetch advertiser profile details:", err);
          setAdvertiser(null);
        });
    } else {
      setAdvertiser(null);
    }
  }, [submittedBy]);

  const advertiserName = advertiser 
    ? `${advertiser.first_name || ''} ${advertiser.last_name || ''}`.trim() || advertiser.username
    : contactPerson || 'Anonymous Seller';

  const memberSince = advertiser && advertiser.created_at
    ? `Member since ${new Date(advertiser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : 'Member since April 2026';

  const allCurrentPhotos = property.photos && property.photos.length > 0
    ? property.photos
    : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"];

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? allCurrentPhotos.length - 1 : prev - 1));
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev === allCurrentPhotos.length - 1 ? 0 : prev + 1));
  };

  const handleMainPhotoClick = () => {
    setLightboxIndex(activeImageIndex);
    setIsLightboxOpen(true);
  };

  const handlePhoneClick = (e) => {
    e.preventDefault();
    if (!phoneRevealed) {
      setPhoneRevealed(true);
    } else {
      window.location.href = `tel:${phoneVal}`;
    }
  };

  const handleEmailClick = (e) => {
    e.preventDefault();
    if (!emailRevealed) {
      setEmailRevealed(true);
    } else {
      window.location.href = `mailto:${emailVal}`;
    }
  };

  const handleWhatsappClick = (e) => {
    e.preventDefault();
    if (!whatsappRevealed) {
      setWhatsappRevealed(true);
    } else {
      window.open(`https://wa.me/${whatsappVal.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  // Filter similar: Same type, but not the current listing, approved, and completed payment
  const similarList = allProperties
    .filter(item => {
      const isSameTypeNotCurrent = item.type === property.type && item.id !== property.id;
      const isApproved = !(item.description && (item.description.includes('Status: Pending') || item.description.includes('Status: Draft')));
      
      const hasCompletedPaymentDesc = item.description && item.description.includes('Payment Status: Completed');
      
      let hasCompletedPaymentDB = false;
      if (Array.isArray(payments)) {
        const payment = payments.find(p => p.listing_id == item.id);
        if (payment && payment.payment_status === 'Completed') {
          hasCompletedPaymentDB = true;
        }
      }
      
      return isSameTypeNotCurrent && isApproved && (hasCompletedPaymentDesc || hasCompletedPaymentDB);
    });

  const handleSimilarNext = () => {
    if (similarStartIndex + 4 < similarList.length) {
      setSimilarStartIndex(prev => prev + 1);
    }
  };

  const handleSimilarPrev = () => {
    if (similarStartIndex > 0) {
      setSimilarStartIndex(prev => prev - 1);
    }
  };

  const visibleSimilar = similarList.slice(similarStartIndex, similarStartIndex + 4);

  return (
    <div className="page-wrapper">
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '6rem 1rem 2rem 1rem' }}>
        
        {/* Breadcrumbs */}
        <nav className="breadcrumb">
            <span onClick={() => navigate('/')} style={{cursor:'pointer'}}>Home</span>
            <span className="material-symbols-outlined breadcrumb__sep">chevron_right</span>
            <span onClick={() => navigate('/listing')} style={{cursor:'pointer'}}>Listings</span>
            <span className="material-symbols-outlined breadcrumb__sep">chevron_right</span>
            <span className="breadcrumb__current">{property.title}</span>
        </nav>

        {/* Full-width Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: 800, 
            color: 'var(--color-primary)', 
            margin: 0, 
            fontFamily: 'var(--font-display)', 
            lineHeight: '1.2',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }} title={property.title}>
            {property.title}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>Posted Date: {property.created_at ? new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
            <span>•</span>
            <span>Posted by: {contactPerson || (advertiser ? advertiserName : 'Anonymous')}</span>
          </div>

          <button 
            onClick={handleLikeToggle}
            className="detail-like-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: isLiked ? 'rgba(186, 26, 26, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              color: isLiked ? '#ba1a1a' : 'var(--color-on-surface-variant)',
              border: isLiked ? '1px solid #ba1a1a' : '1px solid var(--color-outline-variant)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              width: 'fit-content',
              marginTop: '0.5rem'
            }}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ 
                fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
                fontSize: '18px'
              }}
            >
              favorite
            </span>
            {isLiked ? 'Liked' : 'Like Property'}
          </button>
        </div>

        {/* Restructured Grid Layout */}
        <div className="detail-layout">
          
          {/* Details Part (Left column, borderless) */}
          <div className="detail-left" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Watermarked Gallery */}
            <div className="gallery" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', height: 'auto', marginBottom: '0.5rem' }}>
              <div className="gallery__main" style={{ width: '100%', height: '420px', position: 'relative', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--color-outline-variant)' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: 'pointer' }} onClick={handleMainPhotoClick}>
                  <img 
                    className="gallery__main-img" 
                    src={allCurrentPhotos[activeImageIndex]} 
                    alt={property.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className="watermark-overlay" style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${logo3})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '35%',
                    opacity: 0.4,
                    pointerEvents: 'none',
                    zIndex: 5
                  }} />
                </div>
              </div>

              {allCurrentPhotos.length > 1 && (
                <div className="gallery__thumbs" style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', overflowX: 'auto', padding: '0.25rem' }}>
                  {allCurrentPhotos.map((url, idx) => (
                    <div 
                      key={idx} 
                      className={`gallery__thumb ${idx === activeImageIndex ? 'gallery__thumb--active' : ''}`} 
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        flex: '0 0 80px',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        border: idx === activeImageIndex ? '3px solid var(--color-secondary)' : '1px solid var(--color-outline-variant)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <img src={url} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="watermark-overlay" style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${logo3})`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '40%',
                        opacity: 0.4,
                        pointerEvents: 'none',
                        zIndex: 5
                      }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Negotiable Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--color-surface-container-lowest)', padding: '1.25rem 1.75rem', borderRadius: '12px', border: '1px solid var(--color-outline-variant)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</span>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)', lineHeight: '1' }}>Rs. {Number(property.price).toLocaleString()}</span>
              </div>
              <div style={{
                padding: '8px 16px',
                borderRadius: '30px',
                backgroundColor: negotiableVal === 'Yes' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(102, 102, 102, 0.08)',
                color: negotiableVal === 'Yes' ? 'var(--color-tertiary-dark)' : 'var(--color-text-muted)',
                border: negotiableVal === 'Yes' ? '1px solid var(--color-tertiary-light)' : '1px solid var(--color-outline-variant)',
                fontSize: '0.95rem',
                fontWeight: 700
              }}>
                {negotiableVal === 'Yes' ? 'Negotiable (මිල සාකච්ඡා කළ හැක)' : 'Not Negotiable (මිල වෙනස් නොකෙරේ)'}
              </div>
            </div>

            {/* Specifications Block (Flat text list, no cards) */}
            <div className="specs-text-container" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.45rem', 
              padding: '0.25rem 0'
            }}>
              {/* Property Type Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>home</span>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Property Type: </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-on-surface)', textTransform: 'capitalize' }}>
                    {property.type}
                    {property.type === 'Land' && property.land_type ? ` (${property.land_type})` : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>location_on</span>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Location: </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{property.city}, {property.district}</span>
                </div>
              </div>

              {mapLink && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>map</span>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Google Map: </span>
                    <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}>
                      View on Map
                    </a>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>square_foot</span>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Size: </span>
                  <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>
                    {property.type === 'Land' 
                      ? `${property.land_size_perches || 0} Perches` 
                      : `${property.size_sqft || 0} Sqft`}
                  </span>
                </div>
              </div>

              {property.type === 'Land' && property.land_type && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>terrain</span>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Land Type: </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{property.land_type}</span>
                  </div>
                </div>
              )}

              {property.type !== 'Land' && property.bedrooms && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>bed</span>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Bedrooms: </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{property.bedrooms}</span>
                  </div>
                </div>
              )}

              {property.type !== 'Land' && property.bathrooms && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>bathtub</span>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Bathrooms: </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{property.bathrooms}</span>
                  </div>
                </div>
              )}

              {property.type === 'Apartment' && completionStatusVal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>construction</span>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Completion: </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{completionStatusVal}</span>
                  </div>
                </div>
              )}

              {property.type === 'Apartment' && furnishedStatusVal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: 'var(--color-on-surface)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '22px' }}>chair</span>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Furnishing: </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{furnishedStatusVal}</span>
                  </div>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', margin: '1.5rem 0' }} />

            {/* Description Box */}
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Description</h3>
              <div style={{ lineHeight: '1.75', color: 'var(--color-on-surface-variant)', fontSize: '0.975rem', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' }}>
                {mainDesc || 'No description provided.'}
              </div>
            </div>

          </div>

          {/* Contact Part (Right Column, sticky sidebar) */}
          <aside className="detail-sidebar" style={{ position: 'sticky', top: '6.5rem' }}>
            <div className="detail-sidebar__inner">
              <div 
                className="contact-card-new" 
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                {/* 1. Advertiser Header block */}
                <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--color-surface-container-low)' }}>
                  {advertiser && advertiser.avatar_url ? (
                    <img 
                      src={advertiser.avatar_url} 
                      alt={advertiserName} 
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-secondary)' }} 
                    />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {advertiserName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>{advertiserName}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFD700', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>star</span>
                      MEMBER
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {memberSince}
                    </div>
                  </div>
                </div>

                {/* 2. Contact Person block */}
                {contactPerson && (
                  <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-surface-container-low)', backgroundColor: 'var(--color-surface-container-lowest)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CONTACT PERSON</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>{contactPerson}</div>
                  </div>
                )}

                {/* 3. Action Buttons List */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Phone Row */}
                  {phoneVal && (
                    <div 
                      onClick={handlePhoneClick}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        padding: '1.25rem 1.5rem', 
                        borderBottom: '1px solid var(--color-surface-container-low)', 
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease'
                      }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#009688', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>call</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                          {phoneRevealed ? phoneVal : phoneVal.substring(0, 6) + 'XXXX'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {phoneRevealed ? 'Click to call now' : 'Click to show phone number'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat / Email Row */}
                  {emailVal && (
                    <div 
                      onClick={handleEmailClick}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        padding: '1.25rem 1.5rem', 
                        borderBottom: '1px solid var(--color-surface-container-low)', 
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease'
                      }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFC107', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                          {emailRevealed ? emailVal : 'Email / Chat'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {emailRevealed ? 'Click to send email' : 'Click to show email address'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Row */}
                  {whatsappVal && (
                    <div 
                      onClick={handleWhatsappClick}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        padding: '1.25rem 1.5rem', 
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease'
                      }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: 'translateY(-1px)' }}>
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'block' }}>
                          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.005c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                        </svg>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface)', lineHeight: '1.2', margin: 0 }}>
                          {whatsappRevealed ? whatsappVal : 'WhatsApp'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.2', margin: 0 }}>
                          {whatsappRevealed ? 'Click to send message' : 'Click to message seller'}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </aside>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', margin: '1rem 0' }} />

        {/* Similar Listings */}
        <section className="similar" style={{ marginTop: '0.5rem' }}>
          {similarList.length > 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              padding: '24px',
              border: '1px solid var(--color-outline-variant)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)', textAlign: 'left' }}>
                {property.type === 'Apartment' ? 'Similar Apartments' : property.type === 'House' ? 'Similar Houses' : property.type === 'Land' ? 'Similar Lands' : `Similar ${property.type}s`}
              </h3>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
                {/* Left Button */}
                <button 
                  onClick={handleSimilarPrev}
                  disabled={similarStartIndex === 0}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: similarStartIndex === 0 ? 'default' : 'pointer',
                    color: 'var(--color-text-muted)',
                    opacity: similarStartIndex === 0 ? 0.15 : 0.8,
                    padding: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s',
                    flexShrink: 0
                  }}
                  title="Previous similar listings"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>chevron_left</span>
                </button>
                
                <div className="similar__grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px',
                  flexGrow: 1,
                  margin: '0 5px'
                }}>
                  {visibleSimilar.map((p) => (
                    <article 
                      key={p.id}
                      onClick={() => {
                        navigate(`/listing/${p.id}`, { state: { property: p } });
                        window.scrollTo(0,0);
                      }}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid var(--color-outline-variant)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Image Wrap */}
                      <div style={{ position: 'relative', overflow: 'hidden', height: '150px', width: '100%' }}>
                        <img 
                          src={p.photos?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"} 
                          alt={p.title} 
                          loading="lazy" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div className="watermark-overlay" style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url(${logo3})`,
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '35%',
                          opacity: 0.4,
                          pointerEvents: 'none',
                          zIndex: 5
                        }} />

                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                        <h4 style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--color-on-surface)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={p.title}>
                          {p.title}
                        </h4>

                        <div style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#6d28d9', // purple/violet
                          margin: '2px 0'
                        }}>
                          Rs: {Number(p.price).toLocaleString()}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted)',
                          flexWrap: 'wrap'
                        }}>
                          <span>{p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-07-10'}</span>
                          <span>|</span>
                          <span>{p.city}</span>
                          {p.is_featured && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              color: '#1a73e8',
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              textTransform: 'uppercase',
                              marginLeft: 'auto'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>check_circle</span>
                              Partner
                            </span>
                          )}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(197, 198, 208, 0.25)', margin: '6px 0 2px 0' }} />

                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          fontWeight: 500,
                          display: 'flex',
                          gap: '6px',
                          alignItems: 'center'
                        }}>
                          <span style={{ textTransform: 'capitalize' }}>{p.type}</span>
                          <span>|</span>
                          {p.type === 'Land' ? (
                            <span>{p.land_size_perches || 0} Perches</span>
                          ) : (
                            <span>{p.bedrooms || 0} Beds, {p.bathrooms || 0} Baths</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Right Button */}
                <button 
                  onClick={handleSimilarNext}
                  disabled={similarStartIndex + 4 >= similarList.length}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: similarStartIndex + 4 >= similarList.length ? 'default' : 'pointer',
                    color: 'var(--color-text-muted)',
                    opacity: similarStartIndex + 4 >= similarList.length ? 0.15 : 0.8,
                    padding: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s',
                    flexShrink: 0
                  }}
                  title="Next similar listings"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>No similar listings found.</p>
          )}
        </section>
      </main>

      {/* Lightbox Modal Window */}
      {isLightboxOpen && allCurrentPhotos.length > 0 && (
        <div className="lightbox-modal">
          <div className="lightbox-modal__backdrop" onClick={() => setIsLightboxOpen(false)} />
          <div className="lightbox-modal__content">
            <button className="lightbox-modal__close" onClick={() => setIsLightboxOpen(false)} title="Close gallery">
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <button className="lightbox-modal__nav lightbox-modal__nav--prev" onClick={handleLightboxPrev} title="Previous image">
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </button>
            
            <div className="lightbox-modal__image-container" style={{ position: 'relative' }}>
              <img 
                src={allCurrentPhotos[lightboxIndex]} 
                alt={`Property view ${lightboxIndex + 1}`} 
                className="lightbox-modal__img"
              />
              <div className="watermark-overlay" style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${logo3})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '35%',
                opacity: 0.4,
                pointerEvents: 'none',
                zIndex: 100
              }} />
              <div className="lightbox-modal__counter">
                {lightboxIndex + 1} / {allCurrentPhotos.length}
              </div>
            </div>
            
            <button className="lightbox-modal__nav lightbox-modal__nav--next" onClick={handleLightboxNext} title="Next image">
              <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}