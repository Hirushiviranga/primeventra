import '../../styles/Hero.css';
import heroImg from '../../assets/webpfiles/hero.webp';

export default function Hero() {
  return (
    <section className="hero">
      {/* Background */}
      <div className="hero__bg">
        <img
          className="hero__bg-img"
          src={heroImg}
          alt="Luxury villa in Sri Lanka with infinity pool at sunset"
        />
        <div className="hero__bg-overlay" />
      </div>

      {/* Content */}
      <div className="hero__content">
        <span className="hero__pretitle">The Future of Property in Sri Lanka</span>
        <h1 className="hero__headline">Sri Lanka’s Premier Real Estate Marketplace</h1>
        <h2 className="hero__tagline">The Smartest Way to Own Your Dreams</h2>
        <p className="hero__subhead">
          Experience elite real estate services in Sri Lanka. From luxury apartments
          in Colombo to tranquil beachfront estates.
        </p>

        {/* Search Bar */}
        <div className="hero__search glass-effect">
          <div className="hero__search-field">
            <label className="hero__search-label">Property Type</label>
            <select className="hero__search-select" defaultValue="">
              <option value="">Any Type</option>
              <option>Houses</option>
              <option>Apartments</option>
              <option>Land</option>
            </select>
          </div>

          <div className="hero__search-field">
            <label className="hero__search-label">Location</label>
            <input
              className="hero__search-input"
              type="text"
              placeholder="Colombo, Kandy..."
              aria-label="Location"
            />
          </div>

          <div className="hero__search-field">
            <label className="hero__search-label">Budget (Rs)</label>
            <select className="hero__search-select" defaultValue="">
              <option value="">Any Budget</option>
              <option>Under 20M</option>
              <option>20M – 50M</option>
              <option>Over 50M</option>
            </select>
          </div>

          <button className="hero__search-btn">
            <span className="material-symbols-outlined">search</span>
            Search Properties
          </button>
        </div>
      </div>
    </section>
  );
}
