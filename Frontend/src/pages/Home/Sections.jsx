import { Link } from 'react-router-dom';
import '../../styles/Sections.css';

/* ============================================
   WhyChoose Component
   ============================================ */
export function WhyChoose() {
  return (
    <section className="why" id="about" style={{ backgroundColor: 'var(--color-surface)', padding: '5rem 0', borderTop: '1px solid var(--color-outline-variant)' }}>
      <div className="why__inner" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'flex-start' }} className="why-grid-split-pane">
          {/* Left Side: Topic and Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              color: 'var(--color-primary)', 
              margin: 0,
              position: 'relative',
              paddingBottom: '1rem'
            }}>
              Why Primeventra?
              <span style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                width: '60px', 
                height: '4px', 
                backgroundColor: 'var(--color-secondary)', 
                borderRadius: '4px' 
              }} />
            </h2>
            <p style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '1.2rem', 
              lineHeight: '1.6', 
              color: 'var(--color-on-surface-variant)', 
              marginTop: '1rem',
              fontWeight: 'normal' 
            }}>
              In a market where trust is everything, Primeventra stands for transparency and efficiency. We focus on:
            </p>
          </div>

          {/* Right Side: Flat list rows (not cards) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="home-why-row" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div className="why-feature-icon-box" style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                color: 'var(--color-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>forum</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>
                  Direct Connections
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.5' }}>
                  No hidden layers. Buyers and sellers talk directly.
                </p>
              </div>
            </div>

            <div className="home-why-row" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div className="why-feature-icon-box" style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                color: 'var(--color-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifycontent: 'center', 
                flexShrink: 0 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>devices</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>
                  Modern Accessibility
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.5' }}>
                  A minimalist, easy-to-use interface built for the modern Sri Lankan user.
                </p>
              </div>
            </div>

            <div className="home-why-row" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div className="why-feature-icon-box" style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                color: 'var(--color-secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>trending_up</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>
                  Results-Driven Marketing
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: '1.5' }}>
                  Using social media to turn "listings" into "sold" properties.
                </p>
              </div>
            </div>

          </div>
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
            <Link to="/contact" style={{ textDecoration: 'none' }}>
            <button className="seller-cta__btn seller-cta__btn--outline">
              Request Valuation
            </button>
            </Link>
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
