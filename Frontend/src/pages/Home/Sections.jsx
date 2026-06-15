import { Link } from 'react-router-dom';
import '../../styles/Sections.css';

/* ============================================
   WhyChoose Component
   ============================================ */
const WHY_ITEMS = [
  {
    icon: 'verified',
    title: 'Verified Listings',
    desc: 'Every property on our platform undergoes a rigorous manual verification process to ensure absolute legal clarity and peace of mind.',
  },
  {
    icon: 'real_estate_agent',
    title: 'Expert Guidance',
    desc: 'Our agents possess deep local market intelligence, providing you with data-driven insights to make informed investment decisions.',
  },
  {
    icon: 'payments',
    title: 'Secure Transactions',
    desc: 'We facilitate safe financial pathways for high-stakes transactions, partnering with leading banks to streamline your mortgage process.',
  },
];

export function WhyChoose() {
  return (
    <section className="why" id="about">
      <div className="why__inner">
        <div className="why__header">
          <h2 className="why__title">Why Choose PrimeVentra</h2>
          <div className="why__divider" />
        </div>

        <div className="why__grid">
          {WHY_ITEMS.map(({ icon, title, desc }) => (
            <div className="why__item" key={title}>
              <div className="why__icon-wrap">
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <h4 className="why__item-title">{title}</h4>
              <p className="why__item-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   SellerCTA Component
   ============================================ */
const STATS = [
  { value: '5,000+',  label: 'Active Buyers'  },
  { value: 'Rs. 20B+',label: 'Sold Volume'    },
  { value: '14 Days', label: 'Avg. Sell Time' },
  { value: '98%',     label: 'Success Rate'   },
];

export function SellerCTA() {
  return (
    <section className="seller-cta">
      <div className="seller-cta__card">
        {/* Decorative pattern */}
        <svg
          className="seller-cta__pattern"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 0 L100 100 M100 0 L0 100" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Text content */}
        <div className="seller-cta__content">
          <h2 className="seller-cta__title">
            Ready to Sell Your Property in Sri Lanka?
          </h2>
          <p className="seller-cta__desc">
            Join hundreds of sellers who have successfully sold their estates through
            PrimeVentra's exclusive network of high-net-worth investors.
          </p>
          <div className="seller-cta__actions">
            <Link to="/list" style={{ textDecoration: 'none' }}>
              <button className="seller-cta__btn seller-cta__btn--primary">
                List Your Property Now
              </button>
            </Link>
            <button className="seller-cta__btn seller-cta__btn--outline">
              Request Valuation
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="seller-cta__stats" aria-label="Platform statistics">
          {STATS.map(({ value, label }) => (
            <div className="seller-cta__stat" key={label}>
              <div className="seller-cta__stat-value">{value}</div>
              <div className="seller-cta__stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
