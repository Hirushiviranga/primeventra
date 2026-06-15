import React, { useState } from 'react';
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

const Listing = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
                    <input defaultChecked className="filter-checkbox" type="checkbox" />
                    <span>House</span>
                  </label>
                  <label className="filter-option">
                    <input className="filter-checkbox" type="checkbox" />
                    <span>Apartment</span>
                  </label>
                  <label className="filter-option">
                    <input className="filter-checkbox" type="checkbox" />
                    <span>Land</span>
                  </label>
                  <label className="filter-option">
                    <input className="filter-checkbox" type="checkbox" />
                    <span>Commercial</span>
                  </label>
                </div>
              </div>

              {/* District */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">District / City</label>
                <select className="filter-select">
                  <option>All Districts</option>
                  <option>Colombo</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                  <option>Gampaha</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">Price Range (LKR)</label>
                <div className="price-inputs">
                  <input className="filter-input" placeholder="Min" type="text" />
                  <input className="filter-input" placeholder="Max" type="text" />
                </div>
              </div>

              {/* Sort Options */}
              <div className="filter-group">
                <label className="filter-group__label font-label-caps">Sort By</label>
                <select className="filter-select">
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              <button className="filter-submit-btn">
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Grid Content */}
        <div className="listings-content">
          <div className="listings-content__header">
            <span className="listings-count">Showing 24 properties found</span>
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
            {/* Property Card 1 */}
            <article className="property-card property-card-shadow">
              <Link to="/listing/details" className="property-card__link">
                <div className="property-card__image-container">
                  <img 
                    className="property-card__image" 
                    alt="A luxury contemporary villa in Colombo" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCse5HnrV5_bKsp7_4X230a6ChIgr58-J6yKulwtMpGWtm2NAL1UG9Rh9E25knNbknBsfXlDrRObKTrVX7G2-N1XEw85IpzkWnicQIXCqSJ8Wdlw0JkA05lCHYClKLZW7faF2Qvgt5TudeQ9lNU8hIF8QoDPxOrqHRL_d5REJL8rVfEae48kT97p5uqkcQwArwI34Ccrj1-j3AHGR0eU3Pa2gY9LHvpNgqNEB9nyVUzNVYakw6QU3ABl798FJPqBvTiAS2OsWFcVlNc" 
                  />
                  <div className="property-card__badge property-card__badge--featured">Featured</div>
                  <div className="property-card__badge property-card__badge--category">House</div>
                </div>
                
                <div className="property-card__info">
                  <div className="property-card__price">Rs. 85,000,000</div>
                  <h3 className="property-card__title">Luxury 5-Bedroom Villa with Pool</h3>
                  <div className="property-card__location">
                    <span className="material-symbols-outlined">location_on</span>
                    Colombo 07, Colombo
                  </div>
                  <div className="property-card__specs">
                    <span className="property-card__spec"><span className="material-symbols-outlined">bed</span> 5</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">bathtub</span> 4</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">square_foot</span> 4,500 sqft</span>
                  </div>
                </div>
              </Link>
              <footer className="property-card__footer">
                <button className="card-btn card-btn--call">
                  <span className="material-symbols-outlined">call</span> Call
                </button>
                <button className="card-btn card-btn--whatsapp">
                  <WhatsAppIcon /> WhatsApp
                </button>
              </footer>
            </article>

            {/* Property Card 2 */}
            <article className="property-card property-card-shadow">
              <Link to="/listing/details" className="property-card__link">
                <div className="property-card__image-container">
                  <img 
                    className="property-card__image" 
                    alt="Modern high-rise luxury apartment interior in Galle Face" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-inw3VfFAtpoqi4vAQVH2ZMhnLzkTVYkHScdixtxUnRByoR9pXarYcMVGp8FeeatxPQCnDTxXrgP-ajxwlaeCuEBW7cDo0wSHQEiWH1g6cNb6mx0a_fWft8yyhdFPiHGUhf8N3uWbrBBW1v0zE7DaigvdoU8j1oiv2kap9HTTT7u64XcmF7-cpy9_baJ4h8O0kILkojLAg62nGohMUqdPB9cU6d-7mny5_7RigrrHhSbSPwG3z6dfEWzWzCIP0F2yFXUpm4vzI2L" 
                  />
                  <div className="property-card__badge property-card__badge--category">Apartment</div>
                </div>
                
                <div className="property-card__info">
                  <div className="property-card__price">Rs. 42,500,000</div>
                  <h3 className="property-card__title">Modern Ocean View 3-Bedroom Penthouse</h3>
                  <div className="property-card__location">
                    <span className="material-symbols-outlined">location_on</span>
                    Galle Face, Colombo
                  </div>
                  <div className="property-card__specs">
                    <span className="property-card__spec"><span className="material-symbols-outlined">bed</span> 3</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">bathtub</span> 2</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">square_foot</span> 1,850 sqft</span>
                  </div>
                </div>
              </Link>
              <footer className="property-card__footer">
                <button className="card-btn card-btn--call">
                  <span className="material-symbols-outlined">call</span> Call
                </button>
                <button className="card-btn card-btn--whatsapp">
                  <WhatsAppIcon /> WhatsApp
                </button>
              </footer>
            </article>

            {/* Property Card 3 */}
            <article className="property-card property-card-shadow">
              <Link to="/listing/details" className="property-card__link">
                <div className="property-card__image-container">
                  <img 
                    className="property-card__image" 
                    alt="A vast expansive lush green land property in Kandy" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkkTU63-RXo6Li7WX7Y1KkaqatH_wJrMiEXiOCK8i-vTjpod0_SCVMFpjzloS-uSebPuchy_yPrhSCy2QKrNTDvVY1bCg-W_5-yCLatYjhOxLWu3FLfQ3GAWB4HuzWOzQhaV0Nfysr4u86I2HB8PW63UqLQFj00dc25raUwk3lNIaijigGQqkUATAqEzOD_qwTja29CTfhvKmuI3h_0hAeBTQL1nyndgXrBv1iRSkuozwnHienU_uqG273CF8Ekgx8OH1ITdLhXZl4" 
                  />
                  <div className="property-card__badge property-card__badge--category">Land</div>
                </div>
                
                <div className="property-card__info">
                  <div className="property-card__price">Rs. 12,000,000</div>
                  <h3 className="property-card__title">Prime 20-Perch Residential Land</h3>
                  <div className="property-card__location">
                    <span className="material-symbols-outlined">location_on</span>
                    Hanthana, Kandy
                  </div>
                  <div className="property-card__specs">
                    <span className="property-card__spec"><span className="material-symbols-outlined">terrain</span> 20 Perches</span>
                  </div>
                </div>
              </Link>
              <footer className="property-card__footer">
                <button className="card-btn card-btn--call">
                  <span className="material-symbols-outlined">call</span> Call
                </button>
                <button className="card-btn card-btn--whatsapp">
                  <WhatsAppIcon /> WhatsApp
                </button>
              </footer>
            </article>

            {/* Property Card 4 */}
            <article className="property-card property-card-shadow">
              <Link to="/listing/details" className="property-card__link">
                <div className="property-card__image-container">
                  <img 
                    className="property-card__image" 
                    alt="Sleek glass-fronted commercial building" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSMQ480dlcTRNPgn_jdoZchOFc7d4smOLj-dE0srCJMkoqHwIPFwfROZ48T3mxz01XzuuCVnvafK8o2MXuspFYEj5WmC4fHVi7ieyKhsITm6FpY0r0_fxz-gEouEU23EBFMDyC1QfOpZvT2yuomn7Lls0xiLqWghr_8isbLBct6STH6KmLtLAKCeGUiLuHWF2zr285mr_83zb0iiNWghnCN_DUvq3KwR6uEHsSBFy2tY6Mz4TaNwg_vSiwkiRtzJ4mQeHRJuk3SIbx" 
                  />
                  <div className="property-card__badge property-card__badge--category">Commercial</div>
                </div>
                
                <div className="property-card__info">
                  <div className="property-card__price">Rs. 150,000,000</div>
                  <h3 className="property-card__title">Prime Office Building in Business Hub</h3>
                  <div className="property-card__location">
                    <span className="material-symbols-outlined">location_on</span>
                    Nawala, Rajagiriya
                  </div>
                  <div className="property-card__specs">
                    <span className="property-card__spec"><span className="material-symbols-outlined">corporate_fare</span> 3 Floors</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">square_foot</span> 8,000 sqft</span>
                  </div>
                </div>
              </Link>
              <footer className="property-card__footer">
                <button className="card-btn card-btn--call">
                  <span className="material-symbols-outlined">call</span> Call
                </button>
                <button className="card-btn card-btn--whatsapp">
                  <WhatsAppIcon /> WhatsApp
                </button>
              </footer>
            </article>

            {/* Property Card 5 */}
            <article className="property-card property-card-shadow">
              <Link to="/listing/details" className="property-card__link">
                <div className="property-card__image-container">
                  <img 
                    className="property-card__image" 
                    alt="Traditional colonial-style bungalow in Galle" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn14uM2jj7m20-Z40vTPXfJEpr3OpxBAPfA5vrSwdCYMjH2MbS7d0l6uUUjYLBd9X2WTS6J5vA20Hv_zDQXvGM9at4nNUe8QaLmv40Mhwk0-ZInkrfGGLUW6pEG5uBhAF9Z7i8bFy1LJ82yzb8oUrYEdhWBGkLGv8vilafhQPxXhHzle9Kk1xTCMx7LuHvmgwFyKQU-68lw2Pf5LJ1U5o_nN1Ek7IC3ypeoAEZHn8zN0yoz8XlwQPw7AevfXGrSS2mUEzb8UDX1rhW" 
                  />
                  <div className="property-card__badge property-card__badge--featured">Featured</div>
                  <div className="property-card__badge property-card__badge--category">House</div>
                </div>
                
                <div className="property-card__info">
                  <div className="property-card__price">Rs. 65,000,000</div>
                  <h3 className="property-card__title">Colonial Heritage Home in Galle</h3>
                  <div className="property-card__location">
                    <span className="material-symbols-outlined">location_on</span>
                    Fort, Galle
                  </div>
                  <div className="property-card__specs">
                    <span className="property-card__spec"><span className="material-symbols-outlined">bed</span> 4</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">bathtub</span> 3</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">square_foot</span> 3,200 sqft</span>
                  </div>
                </div>
              </Link>
              <footer className="property-card__footer">
                <button className="card-btn card-btn--call">
                  <span className="material-symbols-outlined">call</span> Call
                </button>
                <button className="card-btn card-btn--whatsapp">
                  <WhatsAppIcon /> WhatsApp
                </button>
              </footer>
            </article>

            {/* Property Card 6 */}
            <article className="property-card property-card-shadow">
              <Link to="/listing/details" className="property-card__link">
                <div className="property-card__image-container">
                  <img 
                    className="property-card__image" 
                    alt="Modern studio apartment in a contemporary complex" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8iOKF28DnxMCl5Aq5UGygGBFwp_AM8H7tjULF0iTj20LkkFHygOuMfmfsnxmODs0no18qPSEioY40dV-7OxjlPLAIBMFzjKy0gNdCpfNmPuSHsd6IXb2pnBr_2AFoJV7YY_K2C15or6mfEkmkK-leqd7cVBexwGCKOAn_6YeBYxGLhMm4nNY1nnj9AaXM4Nx-ZYz5r1q0OzjbIUazXUkSUnpEcaetwC-PXPNgGjaSH8Qj8xSHwPc8bLsvYDsVNxzImLNOUSfM_qen" 
                  />
                  <div className="property-card__badge property-card__badge--category">Apartment</div>
                </div>
                
                <div className="property-card__info">
                  <div className="property-card__price">Rs. 28,000,000</div>
                  <h3 className="property-card__title">Stylish Studio in Heart of Colombo</h3>
                  <div className="property-card__location">
                    <span className="material-symbols-outlined">location_on</span>
                    Bambalapitiya, Colombo
                  </div>
                  <div className="property-card__specs">
                    <span className="property-card__spec"><span className="material-symbols-outlined">bed</span> 1</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">bathtub</span> 1</span>
                    <span className="property-card__spec"><span className="material-symbols-outlined">square_foot</span> 750 sqft</span>
                  </div>
                </div>
              </Link>
              <footer className="property-card__footer">
                <button className="card-btn card-btn--call">
                  <span className="material-symbols-outlined">call</span> Call
                </button>
                <button className="card-btn card-btn--whatsapp">
                  <WhatsAppIcon /> WhatsApp
                </button>
              </footer>
            </article>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="pagination__btn">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="pagination__btn pagination__btn--active">1</button>
            <button className="pagination__btn">2</button>
            <button className="pagination__btn">3</button>
            <span className="pagination__dots">...</span>
            <button className="pagination__btn">12</button>
            <button className="pagination__btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Listing;