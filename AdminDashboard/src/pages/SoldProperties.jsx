import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Badge, Btn, ActionBtn, PropertyInfo } from '../components'

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/sold-properties'
  : 'https://primeventra-vrmv.vercel.app/api/sold-properties';

const LISTINGS_API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/listings'
  : 'https://primeventra-vrmv.vercel.app/api/listings';

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

export default function SoldProperties() {
  const [soldList, setSoldList] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch sold listings from the backend database
  const fetchSoldListings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(API_URL)
      if (res.ok) {
        const data = await res.json()
        
        // Map database fields to the UI schema
        const mapped = data.map(db => {
          const desc = db.description || '';
          
          const parseDescField = (d, label) => {
            if (!d) return '';
            const regex = new RegExp(`${label}:\\s*(.*)`, 'i');
            const match = d.match(regex);
            return match ? match[1].trim() : '';
          };

          return {
            ...db,
            id: db.id,
            type: db.type,
            name: db.title,
            price: `LKR ${db.price?.toLocaleString()}`,
            loc: `${db.city}, ${db.district}`,
            date: new Date(db.created_at).toLocaleDateString(),
            description: desc,
            icon: db.type === 'Land' ? 'bx bx-landscape' : db.type === 'Apartment' ? 'bx bx-building' : 'bx bx-home',
            status: 'sold',
            statusText: 'Sold',
            meta: db.type === 'Land'
                ? `Land • ${db.land_size_perches || 0} Perches`
                : `${db.type} • ${db.bedrooms || 0} Beds • ${db.bathrooms || 0} Baths • ${db.size_sqft || 0} sqft`,
            owner: parseDescField(desc, 'Contact Person:'),
            phone: parseDescField(desc, 'Phone:'),
            whatsapp: parseDescField(desc, 'WhatsApp:'),
            email: parseDescField(desc, 'Email:'),
            mapLink: parseDescField(desc, 'Google Map Link:'),
          }
        });

        setSoldList(mapped)
      }
    } catch (error) {
      console.error('Error fetching sold properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSoldListings()
  }, [])

  // Handle toggling sold status (reactivating the property)
  const handleToggleSold = async (id, isSold) => {
    try {
      const url = `${LISTINGS_API_URL}/${id}/sold`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSold })
      })
      if (res.ok) {
        // Refresh the list
        fetchSoldListings()
      } else {
        alert('Failed to update status.')
      }
    } catch (error) {
      console.error('Error toggling sold status:', error)
    }
  }

  if (selectedProperty) {
    return (
      <div>
        <Btn variant="light" onClick={() => setSelectedProperty(null)} style={{ marginBottom: '20px' }} title="Back to Sold Listings">
          <i className="bx bx-arrow-back" style={{ fontSize: '18px' }}></i>
        </Btn>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', borderBottom: '1px solid var(--color-surface-low)', paddingBottom: '20px', marginBottom: '20px', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', color: 'var(--color-secondary)' }}><i className={selectedProperty.icon}></i></span>
                <h2 style={{ fontSize: '24px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedProperty.name}
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
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Description</h3>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
                    {mainDesc || 'No description provided.'}
                  </pre>
                </div>

                {features.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
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
                  <div style={{ marginBottom: '20px' }}>
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
                  <div style={{ marginBottom: '20px' }}>
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Google Maps Location</h3>
            <div style={{ width: '100%', padding: '24px', background: 'var(--color-surface-container)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-map-pin" style={{ fontSize: '24px', marginRight: '8px', color: 'var(--color-secondary)' }}></i>
                <span>Google Maps Location for {selectedProperty.loc}</span>
              </div>
              {selectedProperty.mapLink ? (
                <Btn variant="secondary" onClick={() => window.open(selectedProperty.mapLink, '_blank')} title="Open Google Maps Location">
                  <i className="bx bx-link-external" style={{ fontSize: '18px' }}></i> Open Link
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

  return (
    <Panel>
      <PanelHeader title="Sold Property Listings" />

      {isLoading ? (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>Loading sold listings...</p>
      ) : soldList.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Property</th><th>Type</th><th>Location</th>
              <th>Price</th><th>Status</th><th>Sold</th><th>Listed</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {soldList.map(p => (
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
                    <ActionBtn variant="approve" onClick={() => setSelectedProperty(p)} title="View Details">
                      <i className="bx bx-show" style={{ fontSize: '14px' }}></i>
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No sold properties found.</p>
      )}
    </Panel>
  )
}
