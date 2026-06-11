import React, { useState } from 'react';
import '../../styles/propertydetails.css';

/* ── Data ─────────────────────────────────────── */
const IMAGES = {
  main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0OA1HA6A-5an44lcHU4x8Hr8za7wwUjFr5mZgVgWHpaQn9Tk3xCO7VbsKc-zCv1h2zPehLLbS0i85Hxez-gyBMwywI0gnfqk2J_fZj9mCHR5pIaWF9Js9ezKBoRrCukIUHF3udmSIB1PilGE7z_pdHkSc9lonOpjSy7Q9YFNjJWV6_jeowl2nwx1fWfOHDDb9dbOF5rWcWd8_8HIXaxBjbYTgs2xhFT3jJxvhlgT1fY1yg9AOuor1QZp5oeunlHyQ1FeyBcAiHPMp',
  thumb1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS0LJcA4jUj8CCOiw2giFjqIeaLtdoGo4caYyEh5XJKBkvQmWW_mIs-EGxcYamlW5rt9rHTcJ25NxgCL81D8Pf1yWE_r2rnDizLqA-qCoyPbqkNvEZ94CS67FOdACp2jtt_Awp4DqsrBrpox5akcbd-Un_L20hZwsG3K_UYjNp50yeXtppkiN1QZZ5qpJT_uikOB2mtbqAjGdbs9ZvVmm1VMvh6WQwIAbZVHpK6IKQ-smp_XFXkl-000F2TNt0BPpRPL9pS74vYS_f',
  thumb2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoKMsrnCiFqCWGz0v3_dLwCixtcKnKC6DqSXdqtxOR8Z-wF9KPNvzYRXNPJfB2RmeNZ2MkFBZ1YFkxFBvz4tnFaebTosMK2QsryC7UlVFtpvsYJLKXYnRc4wEfX553krdW2RtQF4VWX9ndzFInCr4dKr7P5RJmbf1Ro7eBYxnOYcEK6KPCGtBWTB0VcygSS_BDkM9pDSCTFl7L9WPxgbQ37mKzgoBTrhbyiCI9cRG_7E7enXcLUrdH2ntNlzvA4-4aFdT9XPLp5Bvh',
};

const SPECS = [
  { icon: 'bed',         value: '05',    label: 'Bedrooms'  },
  { icon: 'bathtub',     value: '04',    label: 'Bathrooms' },
  { icon: 'square_foot', value: '15.5',  label: 'Perches'   },
  { icon: 'layers',      value: '4,200', label: 'Sq Ft'     },
];

const SIMILAR = [
  {
    id: 1, type: 'Apartment', price: 'Rs. 185,000,000',
    title: 'Sky Garden Residences', location: 'Colombo 03', beds: 3, baths: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi5ChQGwvWYAKdB8aAky7ykkK4nF2AC1QLZ5n5qLhtIPSGMlJ1-Je8dkiy_EciNgu3Os8zOP50jV8MEoNXPPihuOKrebWLxmGpcWOi7D1frP2eNaUn30_qo_GzdpTxos4De2O4iLyrUfO81Mmg98KgYJSc1x-piLzs-mrznwyhCFNmyrrLi62Ua0yOshn2KstXraDXHZzfFGqdb6G4tIpYEwNXAImIhwkI-3NemWtu02Usr66dxDA02uIk0DFLeREdLbLIYlcwo_j1',
  },
  {
    id: 2, type: 'Villa', price: 'Rs. 210,000,000',
    title: 'Heritage Garden Villa', location: 'Colombo 07', beds: 4, baths: 4,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2U9HltSMriiD0Z63QYNM87d6AdERQunq2vR0IsTEsmQfSp3OAyxUfroiy_WcixVgLM9OFwUfE6qlCQJZgkIP_K9Lq8I3sVYXc94-WtGki3lkYTv7yZdYTA_jFJRqtjZqYlLXEvjA6W9GvMi4faKUjkLfn3e6jla_XWgwrrOfD5lGA5LIcoSXnd9ZXQuUp-eHAGwaJrQyeJynhzO014PGagVuUjnwxekAgg0BCCWJPsu2oBaKHk6cmkEOoI9_XfBs8P5UvMSFgpZva',
  },
  {
    id: 3, type: 'Penthouse', price: 'Rs. 320,000,000',
    title: 'Ocean View Penthouse', location: 'Colombo 03', beds: 3, baths: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP6NDbWRKh_byX4pfiSh0BHKnQFzHiwxuBhH_G8IQiJEMTeC5vwi8g5RJL03DbbolsXZzNAim9cXZ0ty4XZpPUjtsHI0qESIbs6-0skLm9155gWu3a0aYgSlmvmlErNC5poV1uyvvpGvT6QH_cZwmjxRJGD0Vruwnd__3zX-I3zcnmbHNY1iKmm3zTvcjB9TnS7_Jv27fQoZV_t2DL-ZBotUB0_FwGRHJO_QDyxSvaALtcXS9L0Xf11NtEwlvia9oYF6ARKV2mBeo0',
  },
];

const NAV_ITEMS = [
  { icon: 'home',           label: 'Home'    },
  { icon: 'explore',        label: 'Search'  },
  { icon: 'favorite',       label: 'Saved'   },
  { icon: 'account_circle', label: 'Profile' },
];

/* ── Sub-components ───────────────────────────── */
function Breadcrumb() {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <span>Home</span>
      <span className="material-symbols-outlined breadcrumb__sep">chevron_right</span>
      <span>Listings</span>
      <span className="material-symbols-outlined breadcrumb__sep">chevron_right</span>
      <span className="breadcrumb__current">Luxury Villa in Colombo 07</span>
    </nav>
  );
}

function Gallery() {
  return (
    <div className="gallery" role="group" aria-label="Property photos">
      <div className="gallery__main">
        <img className="gallery__main-img" src={IMAGES.main} alt="Luxury villa exterior with infinity pool at golden hour" />
        <span className="gallery__badge">Featured</span>
      </div>
      <div className="gallery__thumb">
        <img src={IMAGES.thumb1} alt="Minimalist interior living room" />
      </div>
      <div className="gallery__thumb gallery__thumb--overlay" role="button" tabIndex={0} aria-label="View all 15 photos">
        <img src={IMAGES.thumb2} alt="Elegant master bedroom" />
        <div className="gallery__thumb-overlay">
          <span className="material-symbols-outlined">photo_library</span>
          <span className="gallery__thumb-overlay-label">View All 15 Photos</span>
        </div>
      </div>
    </div>
  );
}

function TitleCard() {
  return (
    <section className="detail-card" aria-label="Property title and price">
      <div className="title-card__top">
        <div>
          <h1 className="title-card__name">Prime Luxury 5BR Villa</h1>
          <p className="title-card__address">
            <span className="material-symbols-outlined">location_on</span>
            Gregory's Road, Colombo 07, Sri Lanka
          </p>
        </div>
        <div className="title-card__price-block">
          <div className="title-card__price">Rs. 245,000,000</div>
          <div className="title-card__price-note">Negotiable</div>
        </div>
      </div>
      <div className="specs-row">
        {SPECS.map(({ icon, value, label }) => (
          <div className="spec-item" key={label}>
            <span className="material-symbols-outlined">{icon}</span>
            <span className="spec-item__value">{value}</span>
            <span className="spec-item__label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DescriptionCard() {
  return (
    <section className="detail-card" aria-labelledby="desc-heading">
      <h2 className="section-title" id="desc-heading">Property Description</h2>
      <div className="desc-body">
        <p>Experience the pinnacle of luxury living in the most prestigious residential enclave of Colombo. This masterfully designed architectural gem spans three floors, offering unparalleled privacy and sophistication.</p>
        <p>The ground floor features an expansive open-plan living area that flows seamlessly into the manicured garden and swimming pool. A state-of-the-art kitchen equipped with premium appliances serves both a formal dining area and a casual breakfast bar.</p>
        <ul>
          <li>Dedicated home cinema and entertainment wing</li>
          <li>Separate maid's quarters with private entrance</li>
          <li>Double car garage with automated gates</li>
          <li>Full solar power integration and backup generator</li>
          <li>24/7 Monitored security system</li>
        </ul>
      </div>
    </section>
  );
}

function LocationCard() {
  return (
    <section className="detail-card" aria-labelledby="location-heading">
      <div className="location-card__header">
        <h2 className="section-title" id="location-heading" style={{ marginBottom: 0 }}>Location</h2>
        <button className="location-card__maps-btn" type="button">
          Open in Google Maps
          <span className="material-symbols-outlined">open_in_new</span>
        </button>
      </div>
      <div className="location-map" aria-label="Map placeholder for Colombo 07">
        <div className="location-map__dots" />
        <div className="location-map__pin">
          <span className="material-symbols-outlined">location_on</span>
        </div>
      </div>
    </section>
  );
}

function AgentSidebar() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    alert('Inquiry sent!');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <aside className="detail-sidebar" aria-label="Contact agent">
      <div className="detail-sidebar__inner">
        <div className="agent-card">
          <div className="agent-card__header">
            <div className="agent-card__avatar">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzKk-kkxNYdqKUxw_0S05RamctYUa_ILuIYUQCe7AFyRc7VlP8lJc7GNwtdVQMHHm8RerXmyPXyqxp7QxXIGNtuXyz8TVZajyoDG6WD9kZmIfqAVHL79uzCOzhqAJFtmjPMB16lD0NoJQGFO5ZZIVvWUn_qv0lBluFGgTNvG99DTjHkimDyRS6jw1p7Pd4IAqh1aXpYkcrabLxfjeu0MaysXdqvFMIKeLI8pybpwJuaZDT_qr8Dcqmi_jrUTFhn_kgijmLJfzFgERM"
                alt="Agent Aruna Perera"
              />
            </div>
            <div>
              <div className="agent-card__name">Aruna Perera</div>
              <div className="agent-card__meta">Premium Agent · 8 years exp.</div>
            </div>
          </div>

          <div className="agent-card__actions">
            <button className="agent-btn agent-btn--call" type="button">
              <span className="agent-btn__main">
                <span className="material-symbols-outlined">call</span>Call Now
              </span>
              <span className="agent-btn__sub" lang="si">දැන් අමතන්න</span>
            </button>
            <button className="agent-btn agent-btn--whatsapp" type="button">
              <span className="agent-btn__main">
                <span className="material-symbols-outlined">chat</span>WhatsApp Seller
              </span>
              <span className="agent-btn__sub" lang="si">වට්ස්ඇප් පණිවිඩයක් එවන්න</span>
            </button>

            <form className="inquiry-form" onSubmit={handleSubmit}>
              <p className="inquiry-form__title">Inquire via Email</p>
              <input className="inquiry-form__input" type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
              <input className="inquiry-form__input" type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
              <textarea className="inquiry-form__textarea" name="message" rows={3} placeholder="I'm interested in this property..." value={form.message} onChange={handleChange} />
              <button className="inquiry-form__submit" type="submit">Send Inquiry</button>
            </form>
          </div>
        </div>

        <div className="verified-badge" role="note">
          <span className="material-symbols-outlined">verified_user</span>
          <div>
            <div className="verified-badge__title">Verified Property</div>
            <p className="verified-badge__desc">PrimeVentra has verified the ownership documents for this listing.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SimilarListings() {
  return (
    <section className="similar" aria-labelledby="similar-heading">
      <div className="similar__header">
        <div>
          <h2 className="similar__title" id="similar-heading">Similar Listings</h2>
          <p className="similar__subtitle">Hand-picked premium villas in Colombo 07 and 03.</p>
        </div>
        <button className="similar__view-all" type="button">
          View All <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <div className="similar__grid">
        {SIMILAR.map(({ id, type, price, title, location, beds, baths, image }) => (
          <article className="sim-card" key={id}>
            <div className="sim-card__image-wrap">
              <img src={image} alt={title} loading="lazy" />
              <span className="sim-card__type-tag">{type}</span>
            </div>
            <div className="sim-card__body">
              <div className="sim-card__price">{price}</div>
              <h3 className="sim-card__title">{title}</h3>
              <p className="sim-card__location">
                <span className="material-symbols-outlined">location_on</span>{location}
              </p>
              <div className="sim-card__footer">
                <div className="sim-card__specs">
                  <span className="sim-card__spec"><span className="material-symbols-outlined">bed</span>{beds}</span>
                  <span className="sim-card__spec"><span className="material-symbols-outlined">bathtub</span>{baths}</span>
                </div>
                <button className="sim-card__arrow-btn" type="button" aria-label={`View ${title}`}>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileBottomNav() {
  const [active, setActive] = useState('Home');
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ icon, label }) => (
        <button
          key={label}
          className={`mobile-bottom-nav__item${active === label ? ' mobile-bottom-nav__item--active' : ''}`}
          onClick={() => setActive(label)}
          type="button"
        >
          <span className="material-symbols-outlined" style={active === label ? { fontVariationSettings: "'FILL' 1" } : {}}>
            {icon}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}

/* ── Main export ──────────────────────────────── */
export default function PropertyDetail() {
  return (
    <div className="page-wrapper">
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '6rem 1rem 2rem 1rem' }}>
        <Breadcrumb />
        <Gallery />
        <div className="detail-layout">
          <div className="detail-left">
            <TitleCard />
            <DescriptionCard />
            <LocationCard />
          </div>
          <AgentSidebar />
        </div>
        <SimilarListings />
      </main>
      <MobileBottomNav />
    </div>
  );
}