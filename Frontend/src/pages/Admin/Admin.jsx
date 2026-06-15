import React, { useState, useEffect } from 'react';
import '../../styles/Admin.css';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab navigation: 'dashboard', 'properties', 'sell-property', 'submissions', 'enquiries'
  const [activeTab, setActiveTab] = useState('dashboard');
  // Sub-tabs for Sell Property: 'land', 'house', 'apartment'
  const [sellFormTab, setSellFormTab] = useState('land');

  // Backend data states
  const [listings, setListings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [landForm, setLandForm] = useState({
    title: '',
    district: '',
    city: '',
    landType: '',
    landSize: '1',
    landUnit: 'Perches',
    description: '',
    price: '',
    negotiable: 'No',
    status: 'Available',
    mapLink: '',
    firstName: 'Admin',
    lastName: 'User',
    phone: '0771234567',
    email: 'admin@primeventra.com'
  });

  const [houseForm, setHouseForm] = useState({
    title: '',
    district: '',
    city: '',
    landSize: '1',
    landUnit: 'Perches',
    houseSize: '',
    houseType: 'Double Story',
    bedrooms: '',
    bathrooms: '',
    completionStatus: 'Ready',
    furnishedStatus: 'Unfurnished',
    description: '',
    price: '',
    negotiable: 'No',
    status: 'Available',
    mapLink: '',
    firstName: 'Admin',
    lastName: 'User',
    phone: '0771234567',
    email: 'admin@primeventra.com'
  });

  const [apartmentForm, setApartmentForm] = useState({
    title: '',
    district: '',
    city: '',
    apartmentSize: '',
    apartmentComplex: '',
    floorNumber: '',
    totalFloors: '',
    bedrooms: '',
    bathrooms: '',
    completionStatus: 'Ready',
    furnishedStatus: 'Unfurnished',
    parking: '1 Space',
    amenities: 'Full Amenities',
    description: '',
    price: '',
    negotiable: 'No',
    status: 'Available',
    mapLink: '',
    firstName: 'Admin',
    lastName: 'User',
    phone: '0771234567',
    email: 'admin@primeventra.com'
  });

  // Fetch backend data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const listingsRes = await fetch('/api/listings');
      const listingsData = await listingsRes.json();
      if (listingsData.success) {
        setListings(listingsData.data);
      }

      const contactsRes = await fetch('/api/contact');
      const contactsData = await contactsRes.json();
      if (contactsData.success) {
        setContacts(contactsData.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      document.body.classList.add('admin-body');
      fetchData();
    } else {
      document.body.classList.remove('admin-body');
    }
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, [isLoggedIn]);

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@primeventra.com' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid email or password. Try admin@primeventra.com / admin123');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  // Delete Listing
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Listing deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  // Approve / Update Listing Status
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Listing status updated to ${status}`);
        fetchData();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Submit Land Form
  const handleLandSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Land', ...landForm })
      });
      const data = await res.json();
      if (data.success) {
        alert('Land listing submitted successfully!');
        setLandForm({
          title: '', district: '', city: '', landType: '', landSize: '1', landUnit: 'Perches',
          description: '', price: '', negotiable: 'No', status: 'Available', mapLink: '',
          firstName: 'Admin', lastName: 'User', phone: '0771234567', email: 'admin@primeventra.com'
        });
        setActiveTab('properties');
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting land:', error);
    }
  };

  // Submit House Form
  const handleHouseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'House', ...houseForm })
      });
      const data = await res.json();
      if (data.success) {
        alert('House listing submitted successfully!');
        setHouseForm({
          title: '', district: '', city: '', landSize: '1', landUnit: 'Perches', houseSize: '',
          houseType: 'Double Story', bedrooms: '', bathrooms: '', completionStatus: 'Ready',
          furnishedStatus: 'Unfurnished', description: '', price: '', negotiable: 'No',
          status: 'Available', mapLink: '', firstName: 'Admin', lastName: 'User', phone: '0771234567',
          email: 'admin@primeventra.com'
        });
        setActiveTab('properties');
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting house:', error);
    }
  };

  // Submit Apartment Form
  const handleApartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Apartment', ...apartmentForm })
      });
      const data = await res.json();
      if (data.success) {
        alert('Apartment listing submitted successfully!');
        setApartmentForm({
          title: '', district: '', city: '', apartmentSize: '', apartmentComplex: '', floorNumber: '',
          totalFloors: '', bedrooms: '', bathrooms: '', completionStatus: 'Ready', furnishedStatus: 'Unfurnished',
          parking: '1 Space', amenities: 'Full Amenities', description: '', price: '', negotiable: 'No',
          status: 'Available', mapLink: '', firstName: 'Admin', lastName: 'User', phone: '0771234567',
          email: 'admin@primeventra.com'
        });
        setActiveTab('properties');
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting apartment:', error);
    }
  };

  // Helper to render type icons
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'house': return '🏠';
      case 'apartment': return '🏙️';
      case 'land': return '🌿';
      default: return '🏘️';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <div className="login-logo">
            <div className="login-icon">🏠</div>
            <div className="brand">Prime Ventra</div>
            <div className="sub">Real Estate Admin Panel</div>
          </div>
          <h2>Welcome back</h2>
          <p>Sign in to manage your properties and listings.</p>

          <form onSubmit={handleLoginSubmit}>
            <div className="login-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="admin@primeventra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">Sign In to Dashboard</button>
          </form>
          {loginError && <div className="login-error" style={{ display: 'block' }}>{loginError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <h2>Prime Ventra</h2>
          <p>Real Estate Admin Panel</p>
        </div>
        <nav className="menu">
          <div className="menu-label">Main</div>
          <a
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="icon">📊</span> Dashboard
          </a>
          <a
            className={activeTab === 'properties' ? 'active' : ''}
            onClick={() => setActiveTab('properties')}
          >
            <span className="icon">🏘️</span> Properties
          </a>
          <a
            className={activeTab === 'sell-property' ? 'active' : ''}
            onClick={() => setActiveTab('sell-property')}
          >
            <span className="icon">➕</span> Sell Property
          </a>
          <div className="menu-label">Management</div>
          <a
            className={activeTab === 'submissions' ? 'active' : ''}
            onClick={() => setActiveTab('submissions')}
          >
            <span className="icon">📋</span> Seller Submissions
          </a>
          <a
            className={activeTab === 'enquiries' ? 'active' : ''}
            onClick={() => setActiveTab('enquiries')}
          >
            <span className="icon">💬</span> Enquiries / Leads
          </a>
          <div className="menu-label" style={{ marginTop: 'auto' }}></div>
          <a onClick={handleLogout}><span className="icon">🚪</span> Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1>
              {activeTab === 'dashboard' && 'Admin Dashboard'}
              {activeTab === 'properties' && 'Property Listings'}
              {activeTab === 'sell-property' && 'Add Property'}
              {activeTab === 'submissions' && 'Seller Submissions'}
              {activeTab === 'enquiries' && 'Enquiries & Leads'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Manage property listings, enquiries, and seller submissions.'}
              {activeTab === 'properties' && 'Browse, update status, and manage active real estate listings.'}
              {activeTab === 'sell-property' && 'List new lands, houses, or apartments on the marketplace.'}
              {activeTab === 'submissions' && 'Review listings submitted by owners for approval.'}
              {activeTab === 'enquiries' && 'Read inquiries sent through the contact form.'}
            </p>
          </div>
          <div className="admin-profile">
            <strong>Admin User</strong>
            <span>admin@primeventra.com</span>
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div id="section-dashboard" className="section active">
            <div className="stats-grid">
              <div className="stat-card success">
                <h3>Total Properties</h3>
                <div className="number">{listings.length}</div>
                <div className="trend">Database entries</div>
              </div>
              <div className="stat-card">
                <h3>Available Properties</h3>
                <div className="number">{listings.filter(l => l.status === 'Available' || !l.status).length}</div>
                <div className="trend">Active listings</div>
              </div>
              <div className="stat-card warn">
                <h3>Pending Submissions</h3>
                <div className="number">{listings.filter(l => l.status === 'Pending').length}</div>
                <div className="trend">Need review</div>
              </div>
              <div className="stat-card danger">
                <h3>New Enquiries</h3>
                <div className="number">{contacts.length}</div>
                <div className="trend">Inquiries received</div>
              </div>
            </div>

            <div className="content-grid">
              <div>
                <div className="panel">
                  <div className="panel-header">
                    <h2>Recent Property Listings</h2>
                    <button className="btn" onClick={() => setActiveTab('sell-property')}>+ Add Property</button>
                  </div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Location</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.slice(-5).reverse().map((listing) => (
                          <tr key={listing.id}>
                            <td>
                              <div className="property-info">
                                <div className="property-img">{getIcon(listing.type)}</div>
                                <div>
                                  <strong>{listing.title}</strong>
                                  <small>
                                    {listing.type} • {listing.bedrooms ? `${listing.bedrooms} Beds • ` : ''}{listing.bathrooms ? `${listing.bathrooms} Baths` : ''}{listing.landSize ? `${listing.landSize} ${listing.landUnit}` : ''}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{listing.city || 'N/A'}, {listing.district}</td>
                            <td>Rs. {listing.price}</td>
                            <td>
                              <span className={`badge ${listing.status?.toLowerCase() || 'available'}`}>
                                {listing.status || 'Available'}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <button className="action-btn edit" onClick={() => handleUpdateStatus(listing.id, 'Sold')}>Sold</button>
                                <button className="action-btn delete" onClick={() => handleDeleteListing(listing.id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {listings.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)' }}>
                              No listings found in the database.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                {/* Recent Enquiries */}
                <div className="panel">
                  <div className="panel-header">
                    <h2>New Enquiries</h2>
                    <a className="btn light" onClick={() => setActiveTab('enquiries')}>View All</a>
                  </div>
                  {contacts.slice(-3).reverse().map((contact) => (
                    <div className="lead-card" key={contact.id}>
                      <h4>{contact.name}</h4>
                      <p style={{ fontWeight: '600', fontSize: '12px', color: 'var(--blue)' }}>{contact.subject}</p>
                      <p>{contact.message}</p>
                      <div className="lead-meta">
                        <span>{contact.phone || contact.email}</span>
                        <span className="badge new-badge">New</span>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p style={{ color: 'var(--gray-500)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>
                      No contact enquiries received yet.
                    </p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="panel">
                  <div className="panel-header"><h2>Quick Actions</h2></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn" onClick={() => setActiveTab('sell-property')}>+ Add New Property</button>
                    <button className="btn secondary" onClick={() => setActiveTab('submissions')}>Review Seller Requests</button>
                    <button className="btn light" onClick={() => setActiveTab('enquiries')}>View All Enquiries</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div className="section active">
            <div className="panel">
              <div className="panel-header">
                <h2>All Property Listings</h2>
                <button className="btn" onClick={() => setActiveTab('sell-property')}>+ Add Property</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.slice().reverse().map((listing) => (
                      <tr key={listing.id}>
                        <td>
                          <div className="property-info">
                            <div className="property-img">{getIcon(listing.type)}</div>
                            <div>
                              <strong>{listing.title}</strong>
                              <small>
                                {listing.type} • {listing.houseSize ? `${listing.houseSize} sqft` : ''}{listing.apartmentSize ? `${listing.apartmentSize} sqft` : ''}{listing.landSize ? `${listing.landSize} ${listing.landUnit}` : ''}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{listing.type}</td>
                        <td>{listing.city || 'N/A'}, {listing.district}</td>
                        <td>Rs. {listing.price}</td>
                        <td>
                          <span className={`badge ${listing.status?.toLowerCase() || 'available'}`}>
                            {listing.status || 'Available'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="action-btn edit" onClick={() => handleUpdateStatus(listing.id, 'Sold')}>Sold</button>
                            <button className="action-btn edit" style={{ backgroundColor: 'var(--amber-bg)', color: '#92400e' }} onClick={() => handleUpdateStatus(listing.id, 'Reserved')}>Reserve</button>
                            <button className="action-btn delete" onClick={() => handleDeleteListing(listing.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {listings.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)' }}>
                          No listings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SELL PROPERTY TAB */}
        {activeTab === 'sell-property' && (
          <div className="section active">
            <div className="prop-type-tabs">
              <div
                className={`prop-tab ${sellFormTab === 'land' ? 'active' : ''}`}
                onClick={() => setSellFormTab('land')}
              >
                <span className="tab-icon">🌿</span> Land
              </div>
              <div
                className={`prop-tab ${sellFormTab === 'house' ? 'active' : ''}`}
                onClick={() => setSellFormTab('house')}
              >
                <span className="tab-icon">🏠</span> House
              </div>
              <div
                className={`prop-tab ${sellFormTab === 'apartment' ? 'active' : ''}`}
                onClick={() => setSellFormTab('apartment')}
              >
                <span className="tab-icon">🏙️</span> Apartment
              </div>
            </div>

            {/* LAND FORM */}
            {sellFormTab === 'land' && (
              <div className="form-panel active">
                <div className="panel">
                  <div className="form-section-header">
                    <div className="fsh-icon">🌿</div>
                    <div>
                      <h2>Land Information</h2>
                      <p>List a new land directly to the marketplace database.</p>
                    </div>
                  </div>

                  <form onSubmit={handleLandSubmit}>
                    <div className="form-grid">
                      <div className="form-group full">
                        <label>Title *</label>
                        <span className="label-sinhala">දේපළේ නම</span>
                        <input
                          type="text"
                          placeholder="Enter Short Title"
                          value={landForm.title}
                          onChange={(e) => setLandForm({ ...landForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>District *</label>
                        <span className="label-sinhala">දිස්ත්‍රික්කය</span>
                        <select
                          value={landForm.district}
                          onChange={(e) => setLandForm({ ...landForm, district: e.target.value })}
                          required
                        >
                          <option value="">Select District</option>
                          <option>Colombo</option><option>Gampaha</option><option>Kalutara</option>
                          <option>Kandy</option><option>Matale</option><option>Nuwara Eliya</option>
                          <option>Galle</option><option>Matara</option><option>Hambantota</option>
                          <option>Jaffna</option><option>Kurunegala</option><option>Anuradhapura</option>
                          <option>Ratnapura</option><option>Kegalle</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>City</label>
                        <span className="label-sinhala">නගරය</span>
                        <input
                          type="text"
                          placeholder="Enter Nearest City"
                          value={landForm.city}
                          onChange={(e) => setLandForm({ ...landForm, city: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Land Type *</label>
                        <span className="label-sinhala">ඉඩම් වර්ගය</span>
                        <select
                          value={landForm.landType}
                          onChange={(e) => setLandForm({ ...landForm, landType: e.target.value })}
                          required
                        >
                          <option value="">Select Land Type</option>
                          <option>Residential</option>
                          <option>Commercial</option>
                          <option>Agricultural</option>
                          <option>Industrial</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Land Size</label>
                        <span className="label-sinhala">ඉඩමේ ප්‍රමාණය</span>
                        <input
                          type="number"
                          value={landForm.landSize}
                          onChange={(e) => setLandForm({ ...landForm, landSize: e.target.value })}
                          min="0.1"
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Unit</label>
                        <span className="label-sinhala">ඒකකය</span>
                        <select
                          value={landForm.landUnit}
                          onChange={(e) => setLandForm({ ...landForm, landUnit: e.target.value })}
                        >
                          <option>Perches (පර්චස්)</option>
                          <option>Acres (අක්කර)</option>
                        </select>
                      </div>

                      <div className="form-group full">
                        <label>Description *</label>
                        <span className="label-sinhala">විස්තරය</span>
                        <textarea
                          placeholder="Describe the land features..."
                          value={landForm.description}
                          onChange={(e) => setLandForm({ ...landForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Price *</label>
                        <span className="label-sinhala">මිල</span>
                        <input
                          type="text"
                          placeholder="Enter Price (LKR)"
                          value={landForm.price}
                          onChange={(e) => setLandForm({ ...landForm, price: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Negotiable</label>
                        <select
                          value={landForm.negotiable}
                          onChange={(e) => setLandForm({ ...landForm, negotiable: e.target.value })}
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={landForm.status}
                          onChange={(e) => setLandForm({ ...landForm, status: e.target.value })}
                        >
                          <option>Available</option>
                          <option>Pending</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Google Map Link</label>
                        <input
                          type="text"
                          placeholder="Paste Google Map URL"
                          value={landForm.mapLink}
                          onChange={(e) => setLandForm({ ...landForm, mapLink: e.target.value })}
                        />
                      </div>

                      <div className="form-group full">
                        <div className="form-actions">
                          <button type="submit" className="btn success">Submit Listing</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* HOUSE FORM */}
            {sellFormTab === 'house' && (
              <div className="form-panel active">
                <div className="panel">
                  <div className="form-section-header">
                    <div className="fsh-icon">🏠</div>
                    <div>
                      <h2>House Information</h2>
                      <p>List a new house directly to the marketplace database.</p>
                    </div>
                  </div>

                  <form onSubmit={handleHouseSubmit}>
                    <div className="form-grid">
                      <div className="form-group full">
                        <label>Title *</label>
                        <span className="label-sinhala">දේපළේ නම</span>
                        <input
                          type="text"
                          placeholder="Enter Short Title"
                          value={houseForm.title}
                          onChange={(e) => setHouseForm({ ...houseForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>District *</label>
                        <span className="label-sinhala">දිස්ත්‍රික්කය</span>
                        <select
                          value={houseForm.district}
                          onChange={(e) => setHouseForm({ ...houseForm, district: e.target.value })}
                          required
                        >
                          <option value="">Select District</option>
                          <option>Colombo</option><option>Gampaha</option><option>Kalutara</option>
                          <option>Kandy</option><option>Matale</option><option>Galle</option>
                          <option>Kurunegala</option><option>Ratnapura</option><option>Kegalle</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>City *</label>
                        <span className="label-sinhala">නගරය</span>
                        <input
                          type="text"
                          placeholder="Enter Nearest City"
                          value={houseForm.city}
                          onChange={(e) => setHouseForm({ ...houseForm, city: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Land Size *</label>
                        <span className="label-sinhala">ඉඩමේ ප්‍රමාණය</span>
                        <input
                          type="number"
                          value={houseForm.landSize}
                          onChange={(e) => setHouseForm({ ...houseForm, landSize: e.target.value })}
                          min="0.1"
                          step="0.1"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Unit *</label>
                        <select
                          value={houseForm.landUnit}
                          onChange={(e) => setHouseForm({ ...houseForm, landUnit: e.target.value })}
                        >
                          <option>Perches (පර්චස්)</option>
                          <option>Acres (අක්කර)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>House Size (sqft) *</label>
                        <span className="label-sinhala">නිවසේ ප්‍රමාණය (වර්ග අඩි)</span>
                        <input
                          type="number"
                          placeholder="House Size"
                          value={houseForm.houseSize}
                          onChange={(e) => setHouseForm({ ...houseForm, houseSize: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>House Type</label>
                        <select
                          value={houseForm.houseType}
                          onChange={(e) => setHouseForm({ ...houseForm, houseType: e.target.value })}
                        >
                          <option>Single Story</option>
                          <option>Double Story</option>
                          <option>Villa</option>
                          <option>Bungalow</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Bedrooms *</label>
                        <select
                          value={houseForm.bedrooms}
                          onChange={(e) => setHouseForm({ ...houseForm, bedrooms: e.target.value })}
                          required
                        >
                          <option value="">Select Bedrooms</option>
                          <option>1</option><option>2</option><option>3</option>
                          <option>4</option><option>5</option><option>6+</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Bathrooms *</label>
                        <select
                          value={houseForm.bathrooms}
                          onChange={(e) => setHouseForm({ ...houseForm, bathrooms: e.target.value })}
                          required
                        >
                          <option value="">Select Bathrooms</option>
                          <option>1</option><option>2</option><option>3</option>
                          <option>4</option><option>5+</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Completion Status</label>
                        <select
                          value={houseForm.completionStatus}
                          onChange={(e) => setHouseForm({ ...houseForm, completionStatus: e.target.value })}
                        >
                          <option>Ready</option>
                          <option>Under Construction</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Furnished Status</label>
                        <select
                          value={houseForm.furnishedStatus}
                          onChange={(e) => setHouseForm({ ...houseForm, furnishedStatus: e.target.value })}
                        >
                          <option>Unfurnished</option>
                          <option>Semi-Furnished</option>
                          <option>Fully Furnished</option>
                        </select>
                      </div>

                      <div className="form-group full">
                        <label>Description *</label>
                        <textarea
                          placeholder="Describe the house features..."
                          value={houseForm.description}
                          onChange={(e) => setHouseForm({ ...houseForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Price *</label>
                        <input
                          type="text"
                          placeholder="Enter Price (LKR)"
                          value={houseForm.price}
                          onChange={(e) => setHouseForm({ ...houseForm, price: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Negotiable</label>
                        <select
                          value={houseForm.negotiable}
                          onChange={(e) => setHouseForm({ ...houseForm, negotiable: e.target.value })}
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={houseForm.status}
                          onChange={(e) => setHouseForm({ ...houseForm, status: e.target.value })}
                        >
                          <option>Available</option>
                          <option>Pending</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Google Map Link</label>
                        <input
                          type="text"
                          placeholder="Paste Google Map URL"
                          value={houseForm.mapLink}
                          onChange={(e) => setHouseForm({ ...houseForm, mapLink: e.target.value })}
                        />
                      </div>

                      <div className="form-group full">
                        <div className="form-actions">
                          <button type="submit" className="btn success">Submit Listing</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* APARTMENT FORM */}
            {sellFormTab === 'apartment' && (
              <div className="form-panel active">
                <div className="panel">
                  <div className="form-section-header">
                    <div className="fsh-icon">🏙️</div>
                    <div>
                      <h2>Apartment Information</h2>
                      <p>List a new apartment directly to the marketplace database.</p>
                    </div>
                  </div>

                  <form onSubmit={handleApartmentSubmit}>
                    <div className="form-grid">
                      <div className="form-group full">
                        <label>Title *</label>
                        <input
                          type="text"
                          placeholder="Enter Short Title"
                          value={apartmentForm.title}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>District *</label>
                        <select
                          value={apartmentForm.district}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, district: e.target.value })}
                          required
                        >
                          <option value="">Select District</option>
                          <option>Colombo</option><option>Gampaha</option><option>Kalutara</option>
                          <option>Kandy</option><option>Galle</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          placeholder="Enter Nearest City"
                          value={apartmentForm.city}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, city: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Size (sqft) *</label>
                        <input
                          type="number"
                          placeholder="Size"
                          value={apartmentForm.apartmentSize}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, apartmentSize: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Apartment Complex *</label>
                        <input
                          type="text"
                          placeholder="Apartment Complex"
                          value={apartmentForm.apartmentComplex}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, apartmentComplex: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Floor Number</label>
                        <input
                          type="number"
                          placeholder="e.g. 5"
                          value={apartmentForm.floorNumber}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, floorNumber: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Total Floors in Building</label>
                        <input
                          type="number"
                          placeholder="e.g. 12"
                          value={apartmentForm.totalFloors}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, totalFloors: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Bedrooms *</label>
                        <select
                          value={apartmentForm.bedrooms}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, bedrooms: e.target.value })}
                          required
                        >
                          <option value="">Select Bedrooms</option>
                          <option>Studio</option>
                          <option>1</option><option>2</option><option>3</option>
                          <option>4</option><option>5+</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Bathrooms *</label>
                        <select
                          value={apartmentForm.bathrooms}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, bathrooms: e.target.value })}
                          required
                        >
                          <option value="">Select Bathrooms</option>
                          <option>1</option><option>2</option><option>3</option>
                          <option>4+</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Completion Status *</label>
                        <select
                          value={apartmentForm.completionStatus}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, completionStatus: e.target.value })}
                        >
                          <option>Ready</option>
                          <option>Under Construction</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Furnished Status *</label>
                        <select
                          value={apartmentForm.furnishedStatus}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, furnishedStatus: e.target.value })}
                        >
                          <option>Unfurnished</option>
                          <option>Semi-Furnished</option>
                          <option>Fully Furnished</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Parking</label>
                        <select
                          value={apartmentForm.parking}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, parking: e.target.value })}
                        >
                          <option>No Parking</option>
                          <option>1 Space</option>
                          <option>2 Spaces</option>
                        </select>
                      </div>

                      <div className="form-group full">
                        <label>Description *</label>
                        <textarea
                          placeholder="Describe the apartment features..."
                          value={apartmentForm.description}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Price *</label>
                        <input
                          type="text"
                          placeholder="Enter Price (LKR)"
                          value={apartmentForm.price}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, price: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Negotiable</label>
                        <select
                          value={apartmentForm.negotiable}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, negotiable: e.target.value })}
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={apartmentForm.status}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, status: e.target.value })}
                        >
                          <option>Available</option>
                          <option>Pending</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Google Map Link</label>
                        <input
                          type="text"
                          placeholder="Paste Google Map URL"
                          value={apartmentForm.mapLink}
                          onChange={(e) => setApartmentForm({ ...apartmentForm, mapLink: e.target.value })}
                        />
                      </div>

                      <div className="form-group full">
                        <div className="form-actions">
                          <button type="submit" className="btn success">Submit Listing</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SELLER SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="section active">
            <div className="panel">
              <div className="panel-header"><h2>Pending Seller Submissions</h2></div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Owner Details</th>
                      <th>Location</th>
                      <th>Price</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.filter(l => l.status === 'Pending').slice().reverse().map((listing) => (
                      <tr key={listing.id}>
                        <td>
                          <div className="property-info">
                            <div className="property-img">{getIcon(listing.type)}</div>
                            <div>
                              <strong>{listing.title}</strong>
                              <small>{listing.type}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{listing.firstName} {listing.lastName}</strong>
                          <br />
                          <small>{listing.phone} • {listing.email}</small>
                        </td>
                        <td>{listing.city || 'N/A'}, {listing.district}</td>
                        <td>Rs. {listing.price}</td>
                        <td>{new Date(listing.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="actions">
                            <button className="btn success" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleUpdateStatus(listing.id, 'Available')}>Approve</button>
                            <button className="action-btn delete" onClick={() => handleDeleteListing(listing.id)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {listings.filter(l => l.status === 'Pending').length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)' }}>
                          No pending submissions to review.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <div className="section active">
            <div className="panel">
              <div className="panel-header"><h2>All Client Enquiries & Leads</h2></div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Contact Info</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Received Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.slice().reverse().map((contact) => (
                      <tr key={contact.id}>
                        <td><strong>{contact.name}</strong></td>
                        <td>
                          Phone: {contact.phone || 'N/A'}
                          <br />
                          Email: {contact.email}
                        </td>
                        <td><span style={{ color: 'var(--blue)', fontWeight: '600' }}>{contact.subject}</span></td>
                        <td><div style={{ maxWidth: '350px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{contact.message}</div></td>
                        <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {contacts.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)' }}>
                          No enquiries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
