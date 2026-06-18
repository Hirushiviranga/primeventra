import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../../styles/propertydetails.css';

const API_URL = 'https://primeventra-vrmv.vercel.app/api/listings';

export default function PropertyDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const property = location.state?.property;
  const [allProperties, setAllProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

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
            <img className="gallery__main-img" src={property.photos?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"} alt={property.title} />
          </div>
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
              <h2 className="section-title">Property Description</h2>
              <div className="desc-body">
                <p>{property.description}</p>
              </div>
            </section>
          </div>
          
          {/* Agent Sidebar remains unchanged */}
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
                  <span className="sim-card__type-tag">{p.type}</span>
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
    </div>
  );
}