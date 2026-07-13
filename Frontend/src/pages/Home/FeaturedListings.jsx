import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Sections.css';

const WhatsAppIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 16 16" 
    width="16" 
    height="16" 
    fill="currentColor"
    style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.005c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
  </svg>
);

function PropertyCard({ property, badge, type, location, title, price, priceUnit, image, imgAlt, phone, whatsapp }) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
      <Link to={`/listing/${property.id}`} state={{ property }} className="card__link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="card__image-wrap">
          <img className="card__image" src={image} alt={imgAlt} loading="lazy" />
          <span className={`card__badge card__badge--${badge.variant}`}>{badge.label}</span>
        </div>

        <div className="card__body" style={{ flexGrow: 1 }}>
          <div className="card__meta">
            <span className={`card__type-tag card__type-tag--${type?.toLowerCase()}`}>{type}</span>
            <span className="card__location">
              <span className="material-symbols-outlined">location_on</span>
              {location}
            </span>
          </div>

          <h3 className="card__title">{title}</h3>

          <div className="card__price">
            {price}
            {priceUnit && <span className="card__price-unit">{priceUnit}</span>}
          </div>
        </div>
      </Link>

      <div className="card__body" style={{ paddingTop: '0' }}>
        <div className="card__actions">
          <button className="card__btn card__btn--call" onClick={() => {
            if (phone) window.open(`tel:${phone}`);
            else alert('Phone number not available');
          }}>
            <span className="material-symbols-outlined">call</span>
            Call
          </button>
          <button className="card__btn card__btn--whatsapp" onClick={() => {
            if (whatsapp) window.open(`https://wa.me/${whatsapp}`);
            else alert('WhatsApp number not available');
          }}>
            <WhatsAppIcon />
            WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

export default function FeaturedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:5000/api/payments'
      : 'https://primeventra-vrmv.vercel.app/api/payments';

    const fetchListings = fetch(API_URL).then(res => {
      if (!res.ok) throw new Error('Failed to fetch featured listings');
      return res.json();
    });

    const fetchPayments = fetch(paymentsUrl).then(res => {
      if (!res.ok) throw new Error('Failed to fetch payments');
      return res.json();
    }).catch(err => {
      console.warn("Failed to fetch payments, returning empty array:", err);
      return [];
    });

    Promise.all([fetchListings, fetchPayments])
      .then(([listingsData, paymentsData]) => {
        // Filter approved listings that are marked as Featured and have completed payment status
        const featured = listingsData
          .filter(item => {
            const isApproved = !(item.description && (item.description.includes('Status: Pending') || item.description.includes('Status: Draft')));
            const isFeatured = item.description && item.description.includes('Featured: Yes');
            
            const hasCompletedPaymentDesc = item.description && item.description.includes('Payment Status: Completed');
            
            let hasCompletedPaymentDB = false;
            if (Array.isArray(paymentsData)) {
              const payment = paymentsData.find(p => p.listing_id == item.id);
              if (payment && payment.payment_status === 'Completed') {
                hasCompletedPaymentDB = true;
              }
            }
            
            return isApproved && isFeatured && (hasCompletedPaymentDesc || hasCompletedPaymentDB);
          })
          .slice(0, 3);
        setListings(featured);
        loading && setLoading(false);
      })
      .catch(err => {
        console.error("Error loading featured listings:", err);
        loading && setLoading(false);
      });
  }, []);

  const parsePhone = (desc) => {
    if (!desc) return '';
    const match = desc.match(/Phone:\s*(.*)/);
    return match ? match[1].trim() : '';
  };

  const parseWhatsApp = (desc) => {
    if (!desc) return '';
    const match = desc.match(/WhatsApp:\s*(.*)/);
    return match ? match[1].trim() : '';
  };

  return (
    <section className="listings" id="listings">
      <div className="listings__header">
        <div>
          <h2 className="listings__title">Featured Listings</h2>
          <p className="listings__subtitle">Handpicked premium properties across the island.</p>
        </div>
        <Link to="/listing" className="listings__view-all">
          View All
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="listings__grid">
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            Loading properties...
          </div>
        ) : listings.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            No featured listings available at the moment.
          </div>
        ) : (
          listings.map(listing => (
            <PropertyCard
              key={listing.id}
              property={listing}
              badge={{ label: 'New', variant: 'featured' }}
              type={listing.type}
              location={`${listing.city}, ${listing.district}`}
              title={listing.title}
              price={`Rs. ${Number(listing.price).toLocaleString()}`}
              image={listing.photos && listing.photos.length > 0 ? listing.photos[0] : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"}
              imgAlt={listing.title}
              phone={parsePhone(listing.description)}
              whatsapp={parseWhatsApp(listing.description)}
            />
          ))
        )}
      </div>
    </section>
  );
}
