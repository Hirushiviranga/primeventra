import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../../styles/propertydetails.css';

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
  const [photos, setPhotos] = useState([]);
  const [mainPhoto, setMainPhoto] = useState('');
  
  // Lightbox Modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allCurrentPhotos = [mainPhoto, ...photos].filter(Boolean);

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? allCurrentPhotos.length - 1 : prev - 1));
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev === allCurrentPhotos.length - 1 ? 0 : prev + 1));
  };

  const handleMainPhotoClick = () => {
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    if (property) {
      const initialPhotos = property.photos || [];
      setMainPhoto(initialPhotos[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00");
      setPhotos(initialPhotos.slice(1));
    }
  }, [property]);

  const handleDoubleClick = (index) => {
    const newPhotos = [...photos];
    const oldMain = mainPhoto;
    const newMain = newPhotos[index];
    newPhotos[index] = oldMain;
    setMainPhoto(newMain);
    setPhotos(newPhotos);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('portalUser');
    if (userStr && property) {
      const user = JSON.parse(userStr);
      const liked = JSON.parse(localStorage.getItem(`liked_properties_${user.username}`) || '[]');
      setIsLiked(liked.includes(property.id));
    }
  }, [property]);

  const handleLikeToggle = () => {
    const userStr = localStorage.getItem('portalUser');
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

  const { mainDesc, features, contacts } = parsePropertyDescription(property.description);
  const phoneObj = contacts.find(c => c.label.toLowerCase() === 'phone');
  const phoneVal = phoneObj ? phoneObj.value : '';
  const whatsappObj = contacts.find(c => c.label.toLowerCase() === 'whatsapp');
  const whatsappVal = whatsappObj ? whatsappObj.value : '';

  // Prepare displayFeatures by combining parsed features and DB column attributes
  const displayFeatures = [...features];
  const addFeatureIfMissing = (label, value) => {
    if (value !== undefined && value !== null && value !== '') {
      const exists = displayFeatures.some(f => f.label.toLowerCase() === label.toLowerCase());
      if (!exists) {
        displayFeatures.push({ label, value: String(value) });
      }
    }
  };

  if (property.size_sqft) {
    addFeatureIfMissing('Size', `${property.size_sqft} sqft`);
  }
  if (property.bedrooms) {
    addFeatureIfMissing('Bedrooms', property.bedrooms);
  }
  if (property.bathrooms) {
    addFeatureIfMissing('Bathrooms', property.bathrooms);
  }
  if (property.land_size_perches) {
    addFeatureIfMissing('Land Area', `${property.land_size_perches} Perches`);
  }
  if (property.land_type) {
    addFeatureIfMissing('Land Type', property.land_type);
  }

  // Filter similar: Same type, but not the current listing, approved, and completed payment
  const similar = allProperties
    .filter(item => {
      const isSameTypeNotCurrent = item.type === property.type && item.id !== property.id;
      const isApproved = !(item.description && item.description.includes('Status: Pending'));
      
      const hasCompletedPaymentDesc = item.description && item.description.includes('Payment Status: Completed');
      
      let hasCompletedPaymentDB = false;
      if (Array.isArray(payments)) {
        const payment = payments.find(p => p.listing_id == item.id);
        if (payment && payment.payment_status === 'Completed') {
          hasCompletedPaymentDB = true;
        }
      }
      
      return isSameTypeNotCurrent && isApproved && (hasCompletedPaymentDesc || hasCompletedPaymentDB);
    })
    .slice(0, 3); // Limit to 3 items

  return (
    <div className="page-wrapper">
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '6rem 1rem 2rem 1rem' }}>
        {/* Breadcrumb remains unchanged */}
        <nav className="breadcrumb">
            <span onClick={() => navigate('/')} style={{cursor:'pointer'}}>Home</span>
            <span className="material-symbols-outlined breadcrumb__sep">chevron_right</span>
            <span onClick={() => navigate('/listing')} style={{cursor:'pointer'}}>Listings</span>
            <span className="material-symbols-outlined breadcrumb__sep">chevron_right</span>
            <span className="breadcrumb__current">{property.title}</span>
        </nav>

        {/* Gallery */}
        <div className="gallery">
          <div className="gallery__main">
            <img 
              className="gallery__main-img" 
              src={mainPhoto} 
              alt={property.title} 
              onClick={handleMainPhotoClick}
              style={{ cursor: 'pointer' }}
              title="Click to open full gallery viewer"
            />
          </div>
          {photos && photos.length > 0 && (
            <div className="gallery__thumbs">
              {photos.map((url, idx) => (
                <div 
                  key={idx} 
                  className="gallery__thumb" 
                  onDoubleClick={() => handleDoubleClick(idx)}
                  title="Double click to swap with the main image"
                >
                  <img src={url} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-layout">
          <div className="detail-left">
            {/* Title Card */}
            <section className="detail-card">
              <div className="title-card__top">
                <div>
                  <h1 className="title-card__name">{property.title}</h1>
                  <p className="title-card__address">
                    <span className="material-symbols-outlined">location_on</span>
                    {property.city}, {property.district}
                  </p>
                </div>
                <div className="title-card__price-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  <div className="title-card__price">Rs. {Number(property.price).toLocaleString()}</div>
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
                      transition: 'all 150ms ease'
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
              </div>
            </section>

            {/* Description Card */}
            <section className="detail-card">
              <h2 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid var(--color-outline-variant)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Property Description</h2>
              <div className="desc-body" style={{ lineHeight: '1.7', color: 'var(--color-on-surface-variant)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {mainDesc || 'No description provided.'}
              </div>
            </section>

            {/* Features Card */}
            {displayFeatures.length > 0 && (
              <section className="detail-card" style={{ marginTop: '1.5rem' }}>
                <h2 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid var(--color-outline-variant)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Key Features</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {displayFeatures.map((feat, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', background: 'var(--color-surface-container)', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{feat.label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-on-surface)', fontSize: '0.9rem' }}>{feat.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contacts Card */}
            {contacts.length > 0 && (
              <section className="detail-card" style={{ marginTop: '1.5rem' }}>
                <h2 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '2px solid var(--color-outline-variant)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Contact Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                  {contacts.map((c, idx) => {
                    const isWhatsApp = c.label.toLowerCase() === 'whatsapp';
                    const isPhone = c.label.toLowerCase() === 'phone';
                    const isEmail = c.label.toLowerCase() === 'email';
                    const isMap = c.label.toLowerCase() === 'google map link';
                    let icon = 'info';
                    if (isPhone) icon = 'call';
                    if (isWhatsApp) icon = 'sms';
                    if (isEmail) icon = 'mail';
                    if (isMap) icon = 'map';

                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--color-surface-container)', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '24px' }}>{icon}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{c.label}</span>
                          {isMap ? (
                            <a href={c.value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}>
                              View Location Map
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.9rem', color: 'var(--color-on-surface)', fontWeight: 700 }}>{c.value}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Agent Sidebar */}
          <aside className="detail-sidebar">
            <div className="detail-sidebar__inner">
              <div className="agent-card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface)', textAlign: 'left' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="agent-card__name" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Aruna Perera</div>
                  <div className="agent-card__meta" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>Premium Agent · 8 years exp.</div>
                </div>

                <div className="agent-card__actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {phoneVal && (
                    <button 
                      className="agent-btn agent-btn--call"
                      onClick={() => window.location.href = `tel:${phoneVal}`}
                    >
                      <div className="agent-btn__main" style={{ justifyContent: 'center' }}>
                        <span className="material-symbols-outlined">call</span>
                        Call Now
                      </div>
                    </button>
                  )}

                  {whatsappVal && (
                    <button 
                      className="agent-btn agent-btn--whatsapp"
                      onClick={() => window.open(`https://wa.me/${whatsappVal.replace(/[^0-9]/g, '')}`, '_blank')}
                    >
                      <div className="agent-btn__main" style={{ justifyContent: 'center' }}>
                        <span className="material-symbols-outlined">chat</span>
                        WhatsApp Seller
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Listings (Dynamic) */}
        <section className="similar">
          <div className="similar__header">
            <h2 className="similar__title">Similar {property.type}s</h2>
          </div>
          <div className="similar__grid">
            {similar.map((p) => (
              <article className="sim-card" key={p.id}>
                <div className="sim-card__image-wrap">
                  <img src={p.photos?.[0]} alt={p.title} loading="lazy" />
                  <span className={`sim-card__type-tag sim-card__type-tag--${p.type?.toLowerCase()}`}>{p.type}</span>
                </div>
                <div className="sim-card__body">
                  <div className="sim-card__price">Rs. {Number(p.price).toLocaleString()}</div>
                  <h3 className="sim-card__title">{p.title}</h3>
                  <button className="sim-card__arrow-btn" onClick={() => {
                      navigate(`/listing/${p.id}`, { state: { property: p } });
                      window.scrollTo(0,0);
                  }}>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Lightbox / Modal Window */}
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
            
            <div className="lightbox-modal__image-container">
              <img 
                src={allCurrentPhotos[lightboxIndex]} 
                alt={`Property view ${lightboxIndex + 1}`} 
                className="lightbox-modal__img"
              />
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