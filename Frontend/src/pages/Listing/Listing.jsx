import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/listing.css';

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
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

const Listing = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState([]);

  // Filter & Pagination States
  const [categories, setCategories] = useState({
    House: true,
    Apartment: true,
    Land: true,
    Commercial: true
  });
  const [district, setDistrict] = useState('All Districts');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const userStr = localStorage.getItem('portalUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      const liked = JSON.parse(localStorage.getItem(`liked_properties_${user.username}`) || '[]');
      setLikedProperties(liked);
    }
  }, []);

  const handleLikeToggle = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const userStr = localStorage.getItem('portalUser');
    if (!userStr) {
      alert('Please log in to add properties to your favorites!');
      return;
    }
    const user = JSON.parse(userStr);
    const key = `liked_properties_${user.username}`;
    let liked = JSON.parse(localStorage.getItem(key) || '[]');
    if (liked.includes(id)) {
      liked = liked.filter(x => x !== id);
    } else {
      liked.push(id);
    }
    localStorage.setItem(key, JSON.stringify(liked));
    setLikedProperties(liked);
  };

  useEffect(() => {
    const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:5000/api/payments'
      : 'https://primeventra-vrmv.vercel.app/api/payments';

    const fetchListings = fetch(API_URL).then(res => {
      if (!res.ok) throw new Error('Failed to fetch listings');
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
        // Filter: Keep approved listings AND those with completed payment
        const approved = listingsData.filter(item => {
          const isApproved = !(item.description && item.description.includes('Status: Pending'));
          
          const hasCompletedPaymentDesc = item.description && item.description.includes('Payment Status: Completed');
          
          let hasCompletedPaymentDB = false;
          if (Array.isArray(paymentsData)) {
            const payment = paymentsData.find(p => p.listing_id == item.id);
            if (payment && payment.payment_status === 'Completed') {
              hasCompletedPaymentDB = true;
            }
          }
          
          return isApproved && (hasCompletedPaymentDesc || hasCompletedPaymentDB);
        });
        
        setProperties(approved);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching listings:", err);
        setLoading(false);
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

  const handleCategoryChange = (cat) => {
    setCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
    setCurrentPage(1);
  };

  const handlePriceChange = (setter) => (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setter(val);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    const element = document.querySelector('.listings-content__header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter & Sort listings
  const filteredProperties = properties.filter(item => {
    // 1. Category Filter
    if (!categories[item.type]) return false;

    // 2. District Filter
    if (district !== 'All Districts' && item.district !== district) return false;

    // 3. Min Price Filter
    if (minPrice && Number(item.price) < Number(minPrice)) return false;

    // 4. Max Price Filter
    if (maxPrice && Number(item.price) > Number(maxPrice)) return false;

    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'Price: Low to High') {
      return Number(a.price) - Number(b.price);
    }
    if (sortBy === 'Price: High to Low') {
      return Number(b.price) - Number(a.price);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Pagination Math
  const itemsPerPage = 12;
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  const paginatedProperties = sortedProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderPageNumbers = () => {
    const pages = [];
    pages.push(1);
    
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    if (currentPage <= 3) {
      end = Math.min(totalPages - 1, 4);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }
    
    if (start > 2) {
      pages.push('ellipsis1');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages - 1) {
      pages.push('ellipsis2');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages.map((page, idx) => {
      if (page === 'ellipsis1' || page === 'ellipsis2') {
        return <span key={`dots-${idx}`} className="pagination__dots">...</span>;
      }
      return (
        <button
          key={page}
          className={`pagination__btn ${currentPage === page ? 'pagination__btn--active' : ''}`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <main className="listing-page">
      {/* Hero Title Section */}
      <section className="listing-hero">
        <div className="listing-hero__container">
          <h1 className="listing-hero__title">Discover Exclusive Listings</h1>
          <p className="listing-hero__description">
            Browse the most premium properties across Sri Lanka, from luxury beachfront villas to modern city apartments in Colombo.
          </p>
        </div>
      </section>

      <div className="listing-container">
        {/* Filters Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-card property-card-shadow">
            <div className="filter-card__header">
              <span className="material-symbols-outlined filter-card__icon">tune</span>
              <h2 className="filter-card__title">Refine Search</h2>
            </div>
            
            <div className="filter-card__body">
              {/* Category */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">Category</label>
                <div className="filter-group__options">
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      className="filter-checkbox" 
                      checked={categories.House}
                      onChange={() => handleCategoryChange('House')}
                    />
                    <span>House</span>
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      className="filter-checkbox" 
                      checked={categories.Apartment}
                      onChange={() => handleCategoryChange('Apartment')}
                    />
                    <span>Apartment</span>
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      className="filter-checkbox" 
                      checked={categories.Land}
                      onChange={() => handleCategoryChange('Land')}
                    />
                    <span>Land</span>
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      className="filter-checkbox" 
                      checked={categories.Commercial}
                      onChange={() => handleCategoryChange('Commercial')}
                    />
                    <span>Commercial</span>
                  </label>
                </div>
              </div>

              {/* District */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">District / City</label>
                <select 
                  className="filter-select"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All Districts">All Districts</option>
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">Price Range (LKR)</label>
                <div className="price-inputs">
                  <input 
                    className="filter-input" 
                    placeholder="Min" 
                    type="text" 
                    value={minPrice}
                    onChange={handlePriceChange(setMinPrice)}
                  />
                  <input 
                    className="filter-input" 
                    placeholder="Max" 
                    type="text" 
                    value={maxPrice}
                    onChange={handlePriceChange(setMaxPrice)}
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">Sort By</label>
                <select 
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="Newest First">Newest First</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>

              <button className="filter-submit-btn" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Grid Content */}
        <div className="listings-content">
          <div className="listings-content__header">
            <span className="listings-count">Showing {sortedProperties.length} properties found</span>
            <div className="view-toggle">
              <button 
                className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button 
                className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>

          <div className={viewMode === 'list' ? 'properties-list' : 'properties-grid'}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                Loading properties...
              </div>
            ) : properties.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                No approved listings found.
              </div>
            ) : paginatedProperties.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                No listings found matching your search criteria. Try modifying your filters.
              </div>
            ) : (
              paginatedProperties.map(property => (
                <article key={property.id} className="property-card property-card-shadow">
                  <Link to={`/listing/${property.id}`} state={{ property }} className="property-card__link">
                    <div className="property-card__image-container">
                      <img 
                        className="property-card__image" 
                        alt={property.title} 
                        src={property.photos && property.photos.length > 0 ? property.photos[0] : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"} 
                      />
                      {property.description && property.description.includes('Featured: Yes') && (
                        <div className="property-card__badge property-card__badge--featured" style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFD700', color: '#000' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                          Featured
                        </div>
                      )}
                      <div className="property-card__badge property-card__badge--category">{property.type}</div>
                      
                      {/* Heart Like Button */}
                      <button 
                        className="property-card__like-btn" 
                        onClick={(e) => handleLikeToggle(property.id, e)}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          zIndex: 10,
                          transition: 'transform 150ms ease'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        title={likedProperties.includes(property.id) ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <span 
                          className="material-symbols-outlined" 
                          style={{ 
                            color: likedProperties.includes(property.id) ? '#ba1a1a' : '#666', 
                            fontSize: '20px',
                            fontVariationSettings: likedProperties.includes(property.id) ? "'FILL' 1" : "'FILL' 0"
                          }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    
                    <div className="property-card__info">
                      <div className="property-card__price">Rs. {Number(property.price).toLocaleString()}</div>
                      <h3 className="property-card__title">{property.title}</h3>
                      <div className="property-card__location">
                        <span className="material-symbols-outlined">location_on</span>
                        {property.city}, {property.district}
                      </div>
                      <div className="property-card__specs">
                        {property.bedrooms && <span className="property-card__spec"><span className="material-symbols-outlined">bed</span> {property.bedrooms}</span>}
                        {property.bathrooms && <span className="property-card__spec"><span className="material-symbols-outlined">bathtub</span> {property.bathrooms}</span>}
                        {property.size_sqft && <span className="property-card__spec"><span className="material-symbols-outlined">square_foot</span> {property.size_sqft} sqft</span>}
                        {property.land_size_perches && <span className="property-card__spec"><span className="material-symbols-outlined">terrain</span> {property.land_size_perches} Perches</span>}
                      </div>
                    </div>
                  </Link>
                  <footer className="property-card__footer">
                    <button className="card-btn card-btn--call" onClick={() => {
                      const ph = parsePhone(property.description);
                      if (ph) window.open(`tel:${ph}`);
                      else alert('Phone number not available');
                    }}>
                      <span className="material-symbols-outlined">call</span> Call
                    </button>
                    <button className="card-btn card-btn--whatsapp" onClick={() => {
                      const wa = parseWhatsApp(property.description);
                      if (wa) window.open(`https://wa.me/${wa}`);
                      else alert('WhatsApp number not available');
                    }}>
                      <WhatsAppIcon /> WhatsApp
                    </button>
                  </footer>
                </article>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination__btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {renderPageNumbers()}
              
              <button 
                className="pagination__btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Listing;