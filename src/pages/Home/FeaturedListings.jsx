import { Link } from 'react-router-dom';
import '../../styles/Sections.css';

const LISTINGS = [
  {
    id: 1,
    badge: { label: 'Featured', variant: 'featured' },
    type: 'House',
    location: 'Colombo 07',
    title: 'Grand Azure Villa',
    price: 'Rs. 145,000,000',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDp-JVEZfu68FKMZZvL-tTvKyT0lC93v1yhlAXUNWSOuKMZwnPf3VMEyGXNVOs3i775J3SSv-7NpAvihhCRB-29X8RWgOJcjp9CgrujdhUATaSkj6notaCcDis3qPEKgPU398mm8ovpdl1q0WST21PM9QuCR3qoV1Qgvsb03DSFPFY6PmxKy29Em_mW-EHx0OjsnoTnSOY3GFm2_Akk7RfpC_9A96L4BQ9keIK5S0rGNQgevQxvM0jb5bmGMKEt5Ss1TNBecglQaZLC',
    imgAlt: 'Modern luxury villa in Colombo 07',
  },
  {
    id: 2,
    badge: { label: 'Apartment', variant: 'type' },
    type: 'Apartment',
    location: 'Rajagiriya',
    title: 'Skyline Residency',
    price: 'Rs. 38,500,000',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    imgAlt: 'High-rise luxury apartment with ocean view',
  },
  {
    id: 3,
    badge: { label: 'Hot Deal', variant: 'featured' },
    type: 'Land',
    location: 'Kandy',
    title: 'Riverview Acres',
    price: 'Rs. 12,000,000',
    priceUnit: '/per perch',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcmxkp8QN6fFlMcEAZVkU1TuJTRr7deSNcKw40gfO23vbVS6mDgnYlTl8OIvl0k0ePEpPDaX-yc1GkIvrcdlA513OxVBfA0DYCcz22lDky8dFSylThfw44iB8_FVJMT_AH7Td6kZaJBQndXRn70-qvt_Ajwj8dWCActuyEqLFjzzHxe2PKNliwyou7gEnFJ_nNOGA9RmdLxBb32qKbaWZ_CUL2PYd2h3OsXCQel6iwZr7f16QvsCAChwlBt2rxPcLlq6PGmetqidO0',
    imgAlt: 'Prime land in Kandy highlands',
  },
];

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

function PropertyCard({ badge, type, location, title, price, priceUnit, image, imgAlt }) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
      <Link to="/listing/details" className="card__link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="card__image-wrap">
          <img className="card__image" src={image} alt={imgAlt} loading="lazy" />
          <span className={`card__badge card__badge--${badge.variant}`}>{badge.label}</span>
        </div>

        <div className="card__body" style={{ flexGrow: 1 }}>
          <div className="card__meta">
            <span className="card__type-tag">{type}</span>
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
          <button className="card__btn card__btn--call">
            <span className="material-symbols-outlined">call</span>
            Call
          </button>
          <button className="card__btn card__btn--whatsapp">
            <WhatsAppIcon />
            WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedListings() {
  return (
    <section className="listings" id="listings">
      <div className="listings__header">
        <div>
          <h2 className="listings__title">Featured Listings</h2>
          <p className="listings__subtitle">Handpicked premium properties across the island.</p>
        </div>
        <a href="#" className="listings__view-all">
          View All
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
            arrow_forward
          </span>
        </a>
      </div>

      <div className="listings__grid">
        {LISTINGS.map(listing => (
          <PropertyCard key={listing.id} {...listing} />
        ))}
      </div>
    </section>
  );
}
