import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Badge, Btn, ActionBtn, PropertyInfo, FormGroup, SectionDivider, Pagination } from '../components'
import { DISTRICTS } from '../constants/districts'
import { showAlert } from '../utils/alertModalStore'
import styles from '../styles/SellProperty.module.css'

// Base URL for your live Vercel backend
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

// Helper function to safely extract metadata from the full description string
const extractMatch = (desc, prefix, defaultVal = '') => {
  if (!desc) return defaultVal;
  // Escape prefix characters for regex and find the value after the colon
  const safePrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${safePrefix}\\s*(.+)`, 'i');
  const match = desc.match(regex);
  return match ? match[1].trim() : defaultVal;
};

// Maps a property row (either editingProperty or a plain row from the properties list) to the
// PUT /api/listings/:id payload shape, always including photos so a save never wipes them.
const buildPropertyPayload = (prop) => ({
  type: prop.type,
  title: prop.name,
  description: prop.description,
  price: Number(String(prop.price).replace(/[^\d.]/g, '')),
  district: prop.district,
  city: prop.city,
  status: 'Approved', // Ensure it stays approved!
  featured: prop.featured,
  owner: prop.owner,
  phone: prop.phone,
  whatsapp: prop.whatsapp,
  email: prop.email,
  negotiable: prop.negotiable,
  mapLink: prop.mapLink,

  // Type specifics
  apartmentComplex: prop.apartmentComplex,
  completionStatus: prop.completionStatus,
  furnishedStatus: prop.furnishedStatus,
  floorNumber: prop.floorNumber,
  totalFloors: prop.totalFloors,
  parking: prop.parking,
  amenities: prop.amenities,
  landSize: prop.landSize,
  landUnit: prop.unit || 'Perches',
  landType: prop.landType,
  bedrooms: prop.bedrooms,
  bathrooms: prop.bathrooms,
  houseSize: prop.houseSize,
  apartmentSize: prop.size,

  photos: prop.photos || []
});

// Parser to split descriptions into sections
const parsePropertyDescription = (descString) => {
  if (!descString) {
    return { mainDesc: '', features: [], contacts: [], admin: [] };
  }
  const separator = '--- Property & Contact Details ---';
  let mainDesc = descString;
  let metadataBlock = '';
  
  if (descString.includes(separator)) {
    const parts = descString.split(separator);
    mainDesc = parts[0].trim();
    metadataBlock = parts[1] || '';
  }

  const lines = metadataBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const features = [];
  const contacts = [];
  const admin = [];

  const contactKeys = ['phone', 'whatsapp', 'email', 'contact person', 'google map link'];
  const adminKeys = ['submitted by', 'payment method', 'payment status', 'status', 'transaction id', 'package chosen', 'listing fee', 'featured'];

  lines.forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim();
      const lowerKey = key.toLowerCase();

      if (contactKeys.includes(lowerKey)) {
        contacts.push({ label: key, value: val });
      } else if (adminKeys.includes(lowerKey)) {
        admin.push({ label: key, value: val });
      } else {
        features.push({ label: key, value: val });
      }
    } else {
      features.push({ label: '', value: line });
    }
  });

  return { mainDesc, features, contacts, admin };
};

export default function Properties({ onNav }) {
  // Database States
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // UI States
  const [filterType, setFilterType] = useState('All')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [editingProperty, setEditingProperty] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch only approved properties from the database
  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      // Fetch payments to cross-reference
      const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/payments'
        : 'https://primeventra-vrmv.vercel.app/api/payments';
      const paymentsRes = await fetch(paymentsUrl);
      const payments = await paymentsRes.json();
      
      if (Array.isArray(data)) {
        // Filter: Keep approved listings AND those with completed payment
        const approvedListings = data.filter(item => {
          const isApproved = item.description && !item.description.includes('Status: Pending');
          
          const hasCompletedPaymentDesc = item.description && item.description.includes('Payment Status: Completed');
          
          let hasCompletedPaymentDB = false;
          if (Array.isArray(payments)) {
            const payment = payments.find(p => p.listing_id == item.id);
            if (payment && payment.payment_status === 'Completed') {
              hasCompletedPaymentDB = true;
            }
          }
          
          return isApproved && (hasCompletedPaymentDesc || hasCompletedPaymentDB);
        });

        // Map database fields perfectly into the existing UI fields
        const mappedProperties = approvedListings.map(db => {
          const desc = db.description || '';
          return {
            ...db, // Keep raw db values accessible
            id: db.id,
            type: db.type,
            name: db.title,
            price: `LKR ${db.price?.toLocaleString()}`,
            rawPrice: db.price,
            loc: `${db.city}, ${db.district}`,
            district: db.district,
            city: db.city,
            date: new Date(db.created_at).toLocaleDateString(),
            description: desc, // Keep full description for detail view
            cleanDescription: desc.split('--- Property & Contact Details ---')[0].trim(), // Clean for edit textarea
            icon: db.type === 'Land' ? 'bx bx-landscape' : db.type === 'Apartment' ? 'bx bx-building' : 'bx bx-home',
            status: desc.includes('Status: Sold') ? 'sold' : 'success', // Maps to 'Sold' or green 'Available'
            statusText: desc.includes('Status: Sold') ? 'Sold' : 'Available',
            meta: db.type === 'Land'
                ? `Land • ${db.land_size_perches || 0} Perches`
                : `${db.type} • ${db.bedrooms || 0} Beds • ${db.bathrooms || 0} Baths • ${db.size_sqft || 0} sqft`,
            
            // Extracted Contact & Meta values for the Edit Form
            owner: extractMatch(desc, 'Contact Person:'),
            phone: extractMatch(desc, 'Phone:'),
            whatsapp: extractMatch(desc, 'WhatsApp:'),
            email: extractMatch(desc, 'Email:'),
            negotiable: extractMatch(desc, 'Negotiable:', 'No'),
            featured: extractMatch(desc, 'Featured:', 'No'),
            featuredSince: extractMatch(desc, 'Featured Since:'),
            mapLink: extractMatch(desc, 'Google Map Link:'),
            landType: db.land_type || extractMatch(desc, 'Land Type:', 'Residential'),
            
            bedrooms: db.bedrooms || '',
            bathrooms: db.bathrooms || '',
            size: db.size_sqft || '',
            houseSize: db.size_sqft || '',
            landSize: db.land_size_perches || '',
            apartmentComplex: extractMatch(desc, 'Apartment Complex:'),
            floorNumber: extractMatch(desc, 'Floor Number:'),
            totalFloors: extractMatch(desc, 'Total Floors in Building:'),
            completionStatus: extractMatch(desc, 'Completion Status:', 'Ready'),
            furnishedStatus: extractMatch(desc, 'Furnished Status:', 'Unfurnished'),
            parking: extractMatch(desc, 'Parking:', 'No Parking'),
            amenities: extractMatch(desc, 'Amenities:', 'None'),
          }
        });

        setProperties(mappedProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Load properties on mount
  useEffect(() => {
    fetchProperties()
  }, [])

  // Handle Toggling Sold status of a property
  const handleToggleSold = async (id, isSold) => {
    try {
      const url = window.location.hostname === 'localhost'
        ? `http://localhost:5000/api/listings/${id}/sold`
        : `https://primeventra-vrmv.vercel.app/api/listings/${id}/sold`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSold })
      })
      if (res.ok) {
        fetchProperties()
      } else {
        alert('Failed to update status.')
      }
    } catch (error) {
      console.error('Error toggling sold status:', error)
    }
  }

  // Handle Deleting a property directly from the DB
  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== id))
      } else {
        alert('Failed to delete property.')
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  // Handle reverting approval back to pending
  const handleUnapproveProperty = async (id) => {
    if (!window.confirm("Are you sure you want to revert this property's approval? It will be moved back to Submissions as Pending.")) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${id}/unapprove`, {
        method: 'PUT'
      });
      if (res.ok) {
        showAlert("Property approval reverted successfully! It is now back in Submissions.");
        fetchProperties();
      } else {
        const errorData = await res.json();
        alert("Failed to revert approval: " + (errorData.error || 'Server error'));
      }
    } catch (err) {
      console.error("Error reverting approval:", err);
      alert("Error reverting approval: " + err.message);
    }
  }

  // Handle Editing (populating the form)
  const handleEditClick = (p) => {
    setEditingProperty({
      ...p,
      description: p.cleanDescription, // Put clean text in the textarea
      price: p.rawPrice ? String(p.rawPrice) : p.price.replace(/[^\d.]/g, ''),
    })
  }

  const MAX_FEATURED = 3;

  // Handle Saving an edit to the DB
  const handleSave = async () => {
    if (!editingProperty.name || !editingProperty.price) {
      alert('Please fill in required fields (*)')
      return
    }

    try {
      // Enforce the max-featured cap: if turning this property Featured would push the
      // count past MAX_FEATURED, un-feature the oldest-featured one first (keeping its own photos).
      if (editingProperty.featured === 'Yes') {
        const otherFeatured = properties.filter(p => p.featured === 'Yes' && String(p.id) !== String(editingProperty.id));
        if (otherFeatured.length >= MAX_FEATURED) {
          const oldest = [...otherFeatured].sort((a, b) => new Date(a.featuredSince || 0) - new Date(b.featuredSince || 0))[0];
          await fetch(`${API_URL}/${oldest.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPropertyPayload({ ...oldest, featured: 'No' }))
          });
        }
      }

      const res = await fetch(`${API_URL}/${editingProperty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPropertyPayload(editingProperty))
      })

      if (res.ok) {
        setEditingProperty(null)
        fetchProperties() // Refresh the list to reflect the update
      } else {
        const errData = await res.json()
        alert(`Failed to update: ${errData.error}`)
      }
    } catch (error) {
      console.error("Save error:", error)
      alert('An error occurred while saving.')
    }
  }

  // Apply search filtering and pagination
  const filteredAndSearched = properties.filter(p => {
    const matchesCategory = filterType === 'All' || p.type === filterType;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    const matchesTitle = p.name?.toLowerCase().includes(query);
    const matchesDistrict = p.district?.toLowerCase().includes(query);
    const matchesCity = p.city?.toLowerCase().includes(query);
    const matchesDescription = p.description?.toLowerCase().includes(query);

    return matchesTitle || matchesDistrict || matchesCity || matchesDescription;
  });

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredAndSearched.length / itemsPerPage);
  const paginatedProperties = filteredAndSearched.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ---------------- UI RENDERS ---------------- //

  if (selectedProperty) {
    return (
      <div>
        <Btn variant="light" onClick={() => setSelectedProperty(null)} style={{ marginBottom: '20px' }} title="Back to Listings">
          <i className="bx bx-arrow-back" style={{ fontSize: '18px' }}></i>
        </Btn>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', borderBottom: '1px solid var(--color-surface-low)', paddingBottom: '20px', marginBottom: '20px', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', color: 'var(--color-secondary)' }}><i className={selectedProperty.icon}></i></span>
                <h2 style={{ fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedProperty.name}
                  {selectedProperty.featured === 'Yes' && (
                    <i className="bx bxs-star" style={{ color: '#FFD700', fontSize: '20px' }} title="Featured Property"></i>
                  )}
                </h2>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                <i className="bx bx-map" style={{ marginRight: '4px' }}></i> {selectedProperty.loc}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-display)' }}>
                {selectedProperty.price}
              </div>
              <Badge type={selectedProperty.status}>{selectedProperty.statusText}</Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'var(--color-surface-low)', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Property Type</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{selectedProperty.type}</div>
            </div>
            <div style={{ background: 'var(--color-surface-low)', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Listed Date</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{selectedProperty.date}</div>
            </div>
            <div style={{ background: 'var(--color-surface-low)', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Specifications</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{selectedProperty.meta}</div>
            </div>
            <div style={{ background: 'var(--color-surface-low)', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Property ID</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  #{String(selectedProperty.id).split('-')[0]}
              </div>
            </div>
          </div>

          {(() => {
            const { mainDesc, features, contacts, admin } = parsePropertyDescription(selectedProperty.description);
            return (
              <>
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Description</h3>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
                    {mainDesc || 'No description provided.'}
                  </pre>
                </div>

                {features.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Property Features</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {features.map((feat, idx) => (
                        <div key={idx} style={{ background: 'var(--color-surface-low)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{feat.label}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{feat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contacts.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Contact Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      {contacts.map((c, idx) => (
                        <div key={idx} style={{ background: 'var(--color-surface-low)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-surface-low)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{c.label}</span>
                          {c.label.toLowerCase() === 'google map link' ? (
                            <a href={c.value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-secondary)', textDecoration: 'underline' }}>
                              View Location Map
                            </a>
                          ) : (
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{c.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {admin.length > 0 && (
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Listing Administration</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {admin.map((adm, idx) => (
                        <div key={idx} style={{ background: 'var(--color-surface-low)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{adm.label}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{adm.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Location Map</h3>
            <div style={{ width: '100%', padding: '24px', background: 'var(--color-surface-container)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-map-pin" style={{ fontSize: '24px', marginRight: '8px', color: 'var(--color-secondary)' }}></i>
                <span>Google Maps Location for {selectedProperty.loc}</span>
              </div>
              {selectedProperty.mapLink ? (
                <Btn variant="secondary" onClick={() => window.open(selectedProperty.mapLink, '_blank')} title="Open Google Maps Location">
                  <i className="bx bx-link-external" style={{ fontSize: '18px' }}></i>
                </Btn>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No Map Link Provided</span>
              )}
            </div>
          </div>
        </Panel>
      </div>
    )
  }

  if (editingProperty) {
    return (
      <Panel style={{ border: '1.5px solid var(--color-outline-variant)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Btn variant="light" onClick={() => setEditingProperty(null)} title="Cancel">
            <i className="bx bx-arrow-back" style={{ fontSize: '18px' }}></i>
          </Btn>
          <h2 style={{ fontSize: '17px', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>
            {`Edit ${editingProperty.type} Details`}
          </h2>
        </div>
        
        <div className={styles.formGrid}>
          <FormGroup label="Title *" full>
            <input type="text" value={editingProperty.name || ''} onChange={e => setEditingProperty({ ...editingProperty, name: e.target.value })} />
          </FormGroup>
          <FormGroup label="District *">
            <select value={editingProperty.district || ''} onChange={e => setEditingProperty({ ...editingProperty, district: e.target.value })}>
              <option value="">Select District</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="City *">
            <input type="text" value={editingProperty.city || ''} onChange={e => setEditingProperty({ ...editingProperty, city: e.target.value })} />
          </FormGroup>
          <FormGroup label="Price *">
            <input type="text" value={editingProperty.price || ''} onChange={e => setEditingProperty({ ...editingProperty, price: e.target.value })} />
          </FormGroup>
          <FormGroup label="Negotiable *">
            <select value={editingProperty.negotiable || 'No'} onChange={e => setEditingProperty({ ...editingProperty, negotiable: e.target.value })}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </FormGroup>
          <FormGroup label="Google Map Link">
            <input type="text" value={editingProperty.mapLink || ''} onChange={e => setEditingProperty({ ...editingProperty, mapLink: e.target.value })} placeholder="Paste Google Map URL" />
          </FormGroup>


          <SectionDivider>Contact Information</SectionDivider>
          <FormGroup label="Contact Person *">
            <input type="text" value={editingProperty.owner || ''} onChange={e => setEditingProperty({ ...editingProperty, owner: e.target.value })} />
          </FormGroup>
          <FormGroup label="Phone *">
            <input type="text" value={editingProperty.phone || ''} onChange={e => setEditingProperty({ ...editingProperty, phone: e.target.value })} />
          </FormGroup>
          <FormGroup label="WhatsApp *">
            <input type="text" value={editingProperty.whatsapp || ''} onChange={e => setEditingProperty({ ...editingProperty, whatsapp: e.target.value })} />
          </FormGroup>
          <FormGroup label="Email">
            <input type="email" value={editingProperty.email || ''} onChange={e => setEditingProperty({ ...editingProperty, email: e.target.value })} />
          </FormGroup>

          {editingProperty.type === 'Land' && (
            <>
              <FormGroup label="Land Type *">
                <select value={editingProperty.landType || 'Residential'} onChange={e => setEditingProperty({ ...editingProperty, landType: e.target.value })}>
                  <option>Residential</option>
                  <option>Agricultural</option>
                  <option>Industrial</option>
                  <option>Mixed Use</option>
                  <option>Other</option>
                </select>
              </FormGroup>
              <FormGroup label="Land Size">
                <input type="number" value={editingProperty.landSize || ''} onChange={e => setEditingProperty({ ...editingProperty, landSize: e.target.value, size: e.target.value })} min="0.1" step="0.1" />
              </FormGroup>
              <FormGroup label="Unit">
                <select value={editingProperty.unit || 'Perches'} onChange={e => setEditingProperty({ ...editingProperty, unit: e.target.value })}>
                  <option>Perches</option>
                  <option>Acres</option>
                </select>
              </FormGroup>
            </>
          )}

          {editingProperty.type === 'House' && (
            <>
              <FormGroup label="Land Size">
                <input type="number" value={editingProperty.landSize || ''} onChange={e => setEditingProperty({ ...editingProperty, landSize: e.target.value })} min="0.1" step="0.1" />
              </FormGroup>
              <FormGroup label="Unit">
                <select value={editingProperty.unit || 'Perches'} onChange={e => setEditingProperty({ ...editingProperty, unit: e.target.value })}>
                  <option>Perches</option>
                  <option>Acres</option>
                </select>
              </FormGroup>
              <FormGroup label="House Size (sqft) *">
                <input type="number" value={editingProperty.houseSize || ''} onChange={e => setEditingProperty({ ...editingProperty, houseSize: e.target.value, size: e.target.value })} />
              </FormGroup>
              <FormGroup label="Bedrooms *">
                <select value={editingProperty.bedrooms || '3'} onChange={e => setEditingProperty({ ...editingProperty, bedrooms: e.target.value })}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5</option>
                  <option>6+</option>
                </select>
              </FormGroup>
              <FormGroup label="Bathrooms *">
                <select value={editingProperty.bathrooms || '2'} onChange={e => setEditingProperty({ ...editingProperty, bathrooms: e.target.value })}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </FormGroup>
              <FormGroup label="Completion Status">
                <select value={editingProperty.completionStatus || 'Ready'} onChange={e => setEditingProperty({ ...editingProperty, completionStatus: e.target.value })}>
                  <option>Ready</option>
                  <option>Under Construction</option>
                  <option>New</option>
                  <option>Renovation Required</option>
                </select>
              </FormGroup>
              <FormGroup label="Furnished Status">
                <select value={editingProperty.furnishedStatus || 'Unfurnished'} onChange={e => setEditingProperty({ ...editingProperty, furnishedStatus: e.target.value })}>
                  <option>Unfurnished</option>
                  <option>Semi-Furnished</option>
                  <option>Fully Furnished</option>
                </select>
              </FormGroup>
            </>
          )}

          {editingProperty.type === 'Apartment' && (
            <>
              <FormGroup label="Size (sqft) *">
                <input type="number" value={editingProperty.size || ''} onChange={e => setEditingProperty({ ...editingProperty, size: e.target.value, houseSize: e.target.value })} />
              </FormGroup>
              <FormGroup label="Apartment Complex *">
                <input type="text" value={editingProperty.apartmentComplex || ''} onChange={e => setEditingProperty({ ...editingProperty, apartmentComplex: e.target.value })} />
              </FormGroup>
              <FormGroup label="Floor Number">
                <input type="number" value={editingProperty.floorNumber || ''} onChange={e => setEditingProperty({ ...editingProperty, floorNumber: e.target.value })} />
              </FormGroup>
              <FormGroup label="Total Floors in Building">
                <input type="number" value={editingProperty.totalFloors || ''} onChange={e => setEditingProperty({ ...editingProperty, totalFloors: e.target.value })} />
              </FormGroup>
              <FormGroup label="Bedrooms *">
                <select value={editingProperty.bedrooms || '2'} onChange={e => setEditingProperty({ ...editingProperty, bedrooms: e.target.value })}>
                  <option>Studio</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </FormGroup>
              <FormGroup label="Bathrooms *">
                <select value={editingProperty.bathrooms || '2'} onChange={e => setEditingProperty({ ...editingProperty, bathrooms: e.target.value })}>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </FormGroup>
              <FormGroup label="Completion Status *">
                <select value={editingProperty.completionStatus || 'Ready'} onChange={e => setEditingProperty({ ...editingProperty, completionStatus: e.target.value })}>
                  <option>Ready</option>
                  <option>Under Construction</option>
                  <option>Off-Plan</option>
                </select>
              </FormGroup>
              <FormGroup label="Furnished Status *">
                <select value={editingProperty.furnishedStatus || 'Unfurnished'} onChange={e => setEditingProperty({ ...editingProperty, furnishedStatus: e.target.value })}>
                  <option>Unfurnished</option>
                  <option>Semi-Furnished</option>
                  <option>Fully Furnished</option>
                </select>
              </FormGroup>
              <FormGroup label="Parking">
                <select value={editingProperty.parking || 'No Parking'} onChange={e => setEditingProperty({ ...editingProperty, parking: e.target.value })}>
                  <option>No Parking</option>
                  <option>1 Space</option>
                  <option>2 Spaces</option>
                  <option>3+ Spaces</option>
                </select>
              </FormGroup>
              <FormGroup label="Gym / Pool / Security">
                <select value={editingProperty.amenities || 'None'} onChange={e => setEditingProperty({ ...editingProperty, amenities: e.target.value })}>
                  <option>None</option>
                  <option>Gym Only</option>
                  <option>Pool Only</option>
                  <option>Gym + Pool</option>
                  <option>Full Amenities</option>
                </select>
              </FormGroup>
            </>
          )}
          
          <FormGroup label="Description *" full>
            <textarea value={editingProperty.description || ''} onChange={e => setEditingProperty({ ...editingProperty, description: e.target.value })} placeholder="Describe the property..." />
          </FormGroup>

          <FormGroup label="Featured Status" full>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  checked={editingProperty.featured === 'Yes'} 
                  onChange={e => setEditingProperty({ ...editingProperty, featured: e.target.checked ? 'Yes' : 'No' })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: editingProperty.featured === 'Yes' ? 'var(--color-secondary)' : '#ccc',
                  transition: '0.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px', width: '18px',
                    left: editingProperty.featured === 'Yes' ? '22px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: editingProperty.featured === 'Yes' ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}>
                {editingProperty.featured === 'Yes' ? 'Featured' : 'Standard'}
              </span>
            </div>
          </FormGroup>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Btn variant="success" onClick={handleSave}>Save Changes</Btn>
        </div>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader title="All Property Listings">
        <Btn onClick={() => onNav('sell-property')} title="Add Property">
          <i className="bx bx-plus-circle"></i>
        </Btn>
      </PanelHeader>

      {/* Search Input */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search properties by title, district, city, description..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: '100%',
            padding: '10px 16px 10px 40px',
            borderRadius: '8px',
            border: '1.5px solid var(--color-outline-variant)',
            background: 'var(--color-surface)',
            color: 'var(--color-on-surface)',
            fontSize: '14px',
            fontFamily: 'var(--font-label)',
            transition: 'border-color 0.2s',
            outline: 'none'
          }}
        />
        <i className="bx bx-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--color-text-muted)' }}></i>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['All', 'House', 'Apartment', 'Land'].map(t => (
          <button
            key={t}
            onClick={() => {
              setFilterType(t);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1.5px solid var(--color-outline-variant)',
              background: filterType === t ? 'var(--color-secondary)' : 'var(--color-surface)',
              color: filterType === t ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-label)'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>Loading properties...</p>
      ) : paginatedProperties.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Property</th><th>Type</th><th>Location</th>
                <th>Price</th><th>Status</th><th>Sold</th><th>Listed</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProperties.map(p => (
                <tr key={p.id}>
                  <td>
                    <PropertyInfo
                      icon={p.icon}
                      name={p.name}
                      meta={p.meta}
                      onClickName={() => setSelectedProperty(p)}
                    />
                  </td>
                  <td>{p.type}</td>
                  <td>{p.loc}</td>
                  <td>{p.price}</td>
                  <td><Badge type={p.status}>{p.statusText}</Badge></td>
                  <td>
                    <label style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px' }}>
                      <input 
                        type="checkbox" 
                        checked={p.status === 'sold'} 
                        onChange={e => handleToggleSold(p.id, e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: p.status === 'sold' ? 'var(--color-secondary)' : '#ccc',
                        transition: '0.4s',
                        borderRadius: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px', width: '14px',
                          left: p.status === 'sold' ? '17px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.4s',
                          borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </td>
                  <td>{p.date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>
                        <i 
                          className={p.featured === 'Yes' ? "bx bxs-star" : "bx bx-star"} 
                          style={{ 
                            color: p.featured === 'Yes' ? '#FFD700' : '#ccc', 
                            fontSize: '18px',
                            cursor: 'default'
                          }}
                          title={p.featured === 'Yes' ? "Featured Property" : "Standard Property"}
                        ></i>
                      </span>
                      <ActionBtn variant="edit" onClick={() => handleEditClick(p)} title="Edit" />
                      <ActionBtn variant="reply" onClick={() => handleUnapproveProperty(p.id)} title="Revert to Pending (Unapprove)">
                        <i className="bx bx-undo" style={{ fontSize: '14px' }}></i>
                      </ActionBtn>
                      <ActionBtn variant="delete" onClick={() => handleDeleteProperty(p.id)} title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No available properties found.</p>
      )}
    </Panel>
  )
}