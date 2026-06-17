import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../../styles/propertydetails.css';

const API_URL = 'https://primeventra-vrmv.vercel.app/api/listings';

export default function PropertyDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const property = location.state?.property;
  const [allProperties, setAllProperties] = useState([]);

  useEffect(() => {
    if (!property) {
      navigate('/listing');
      return;
    }
    window.scrollTo(0, 0);

    fetch(API_URL)
      .then(res => res.json())
      .then(data => setAllProperties(data))
      .catch(err => console.error("Error fetching similar:", err));
  }, [property, navigate]);

  if (!property) return null;

  // Filter similar: Same type, but not the current listing
  const similar = allProperties
    .filter(item => item.type === property.type && item.id !== property.id)
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
                <div className="title-card__price-block">
                  <div className="title-card__price">Rs. {Number(property.price).toLocaleString()}</div>
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