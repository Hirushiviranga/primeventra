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

function PropertyCard({ badge, type, location, title, price, priceUnit, image, imgAlt }) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
      <Link to="/listing/details" className="card__link" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="card__image-wrap">
          <img className="card__image" src={image} alt={imgAlt} loading="lazy" />
          <span className={`card__badge card__badge--${badge.variant}`}>{badge.label}</span>
        </div>

        <div className="card__body" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
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
            <span className="material-symbols-outlined">chat</span>
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
