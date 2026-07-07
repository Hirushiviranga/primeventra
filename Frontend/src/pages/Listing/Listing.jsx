import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../../styles/listing.css';

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

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

const Listing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProperties, setLikedProperties] = useState([]);

  // Read query params
  const queryType = searchParams.get('type');
  const queryLocation = searchParams.get('location') || '';
  const queryMinPrice = searchParams.get('minPrice') || '';
  const queryMaxPrice = searchParams.get('maxPrice') || '';

  // Filter & Pagination States
  const [categories, setCategories] = useState({
    House: queryType ? queryType === 'House' : true,
    Apartment: queryType ? queryType === 'Apartment' : true,
    Land: queryType ? queryType === 'Land' : true
  });

  // Check if location matches a district
  const matchedDistrict = queryLocation
    ? DISTRICTS.find(d => d.toLowerCase() === queryLocation.toLowerCase()) || 'All Districts'
    : 'All Districts';

  const [district, setDistrict] = useState(matchedDistrict);
  const [locationSearch, setLocationSearch] = useState(matchedDistrict === 'All Districts' ? queryLocation : '');
  const [minPrice, setMinPrice] = useState(queryMinPrice);
  const [maxPrice, setMaxPrice] = useState(queryMaxPrice);
  const [sortBy, setSortBy] = useState('Newest First');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync with searchParams changes
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const locationParam = searchParams.get('location') || '';
    const minParam = searchParams.get('minPrice') || '';
    const maxParam = searchParams.get('maxPrice') || '';

    if (typeParam) {
      setCategories({
        House: typeParam === 'House',
        Apartment: typeParam === 'Apartment',
        Land: typeParam === 'Land'
      });
    } else {
      setCategories({ House: true, Apartment: true, Land: true });
    }

    const matchedDist = locationParam
      ? DISTRICTS.find(d => d.toLowerCase() === locationParam.toLowerCase()) || 'All Districts'
      : 'All Districts';
    
    setDistrict(matchedDist);
    setLocationSearch(matchedDist === 'All Districts' ? locationParam : '');
    setMinPrice(minParam);
    setMaxPrice(maxParam);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const userStr = sessionStorage.getItem('portalUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      const liked = JSON.parse(localStorage.getItem(`liked_properties_${user.username}`) || '[]');
      setLikedProperties(liked);
    }
  }, []);

  const handleLikeToggle = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const userStr = sessionStorage.getItem('portalUser');
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
          const isApproved = !(item.description && (item.description.includes('Status: Pending') || item.description.includes('Status: Draft')));
          
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
    const params = new URLSearchParams();
    const activeCats = Object.keys(categories).filter(c => categories[c]);
    // If only one category is selected, set type in URL
    if (activeCats.length === 1) {
      params.set('type', activeCats[0]);
    }
    if (district !== 'All Districts') {
      params.set('location', district);
    } else if (locationSearch) {
      params.set('location', locationSearch);
    }
    if (minPrice) {
      params.set('minPrice', minPrice);
    }
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    }
    setSearchParams(params);

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

    // 3. Free text location filter (if entered via Hero search input)
    if (district === 'All Districts' && locationSearch.trim()) {
      const term = locationSearch.toLowerCase();
      const matchCity = item.city && item.city.toLowerCase().includes(term);
      const matchDistrict = item.district && item.district.toLowerCase().includes(term);
      const matchTitle = item.title && item.title.toLowerCase().includes(term);
      if (!matchCity && !matchDistrict && !matchTitle) return false;
    }

    // 4. Min Price Filter
    if (minPrice && Number(item.price) < Number(minPrice)) return false;

    // 5. Max Price Filter
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

                </div>
              </div>

              {/* District */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">District</label>
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
                      <div className={`property-card__badge property-card__badge--category property-card__badge--${property.type?.toLowerCase()}`}>{property.type}</div>
                      
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
                      <h3 className="property-card__title">{property.title}</h3>
                      <div className="property-card__price">Rs. {Number(property.price).toLocaleString()}</div>
                      <div className="property-card__location">
                        <span className="material-symbols-outlined">location_on</span>
                        {property.city}, {property.district}
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