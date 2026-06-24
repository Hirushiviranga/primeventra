import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn, ActionBtn, PropertyInfo, Pagination } from '../components'

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/rejected-properties'
  : 'https://primeventra-vrmv.vercel.app/api/rejected-properties';

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

export default function RejectedProperties() {
  const [rejectedList, setRejectedList] = useState([])
  const [viewingRejected, setViewingRejected] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch rejected listings from the backend database
  const fetchRejectedListings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(API_URL)
      if (res.ok) {
        const data = await res.json()
        setRejectedList(data)
      }
    } catch (error) {
      console.error('Error fetching rejected properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRejectedListings()
  }, [])

  // Helper functions for UI mapping
  const getIcon = (type) => {
    if (type === 'Land') return 'bx bx-landscape'
    if (type === 'Apartment') return 'bx bx-building'
    return 'bx bx-home'
  }

  const getMetaString = (r) => {
    if (r.type === 'Land') return `Land • ${r.land_size_perches || 0} Perches`
    if (r.type === 'Apartment') return `Apartment • ${r.bedrooms || 0} Beds • ${r.bathrooms || 0} Baths • ${r.size_sqft || 0} sqft`
    return `House • ${r.bedrooms || 0} Beds • ${r.bathrooms || 0} Baths • ${r.size_sqft || 0} sqft`
  }

  const getOwnerFromDescription = (desc) => {
    if (!desc) return 'Unknown'
    const match = desc.match(/Contact Person:\s*(.+)/)
    return match ? match[1] : 'Unknown'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  const handleRestoreRejected = async (id) => {
    if (!window.confirm("Are you sure you want to restore this property back to submissions?")) {
      return;
    }
    try {
      const restoreUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? `http://localhost:5000/api/rejected-properties/${id}/restore`
        : `https://primeventra-vrmv.vercel.app/api/rejected-properties/${id}/restore`;
      const res = await fetch(restoreUrl, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Property restored back to submissions successfully!");
        setViewingRejected(null);
        fetchRejectedListings();
      } else {
        const errorData = await res.json();
        alert("Failed to restore property: " + (errorData.error || 'Server error'));
      }
    } catch (err) {
      console.error("Error restoring property:", err);
      alert("Error restoring property: " + err.message);
    }
  }

  const itemsPerPage = 20;
  const totalPages = Math.ceil(rejectedList.length / itemsPerPage);
  const paginatedRejected = rejectedList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (viewingRejected) {
    return (
      <Panel style={{ border: '1.5px solid var(--color-danger)', marginBottom: '20px', background: 'var(--color-surface)' }}>
        <PanelHeader title={`Rejected ${viewingRejected.type}: ${viewingRejected.title}`}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Btn variant="success" onClick={() => handleRestoreRejected(viewingRejected.id)} title="Restore to Submissions">
              <i className="bx bx-undo" style={{ marginRight: '5px' }}></i> Restore to Submissions
            </Btn>
            <Btn variant="light" onClick={() => setViewingRejected(null)} title="Back to List">
              <i className="bx bx-arrow-back" style={{ marginRight: '5px' }}></i> Back to List
            </Btn>
          </div>
        </PanelHeader>

        <div style={{ padding: '10px 0', textAlign: 'left' }}>
          {/* Rejection Reason Card - Highlighted */}
          <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#e11d48', letterSpacing: '0.08em', marginBottom: '8px' }}>
              <i className="bx bx-error-circle" style={{ marginRight: '5px', verticalAlign: 'middle', fontSize: '14px' }}></i> Rejection Reason / Message
            </strong>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#9f1239', fontWeight: 600 }}>
              {viewingRejected.rejection_reason}
            </p>
          </div>

          {/* Display Photos if available */}
          {viewingRejected.photos && Array.isArray(viewingRejected.photos) && viewingRejected.photos.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', borderBottom: '1px solid var(--color-outline-variant)', marginBottom: '20px' }}>
              {viewingRejected.photos.map((url, idx) => (
                <img 
                  key={idx} 
                  src={url} 
                  alt={`Property image ${idx + 1}`} 
                  style={{ height: '140px', width: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }} 
                />
              ))}
            </div>
          )}

          {/* Core Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px', fontSize: '14px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Location</strong>{viewingRejected.city}, {viewingRejected.district}</div>
            <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Price</strong>LKR {viewingRejected.price?.toLocaleString()}</div>
            <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Date Rejected</strong>{formatDate(viewingRejected.rejected_at)}</div>
            
            {viewingRejected.bedrooms && <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Bedrooms</strong>{viewingRejected.bedrooms}</div>}
            {viewingRejected.bathrooms && <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Bathrooms</strong>{viewingRejected.bathrooms}</div>}
            {viewingRejected.size_sqft && <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Size (sqft)</strong>{viewingRejected.size_sqft}</div>}
            {viewingRejected.land_size_perches && <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Land Size</strong>{viewingRejected.land_size_perches} Perches</div>}
            {viewingRejected.land_type && <div><strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Land Type</strong>{viewingRejected.land_type}</div>}
          </div>

          {(() => {
            const { mainDesc, features, contacts, admin } = parsePropertyDescription(viewingRejected.description);
            return (
              <>
                <div style={{ marginBottom: '20px', background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Description</h4>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
                    {mainDesc || 'No description provided.'}
                  </pre>
                </div>

                {features.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Property Features</h4>
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
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Contact Details</h4>
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
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Listing Administration</h4>
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
        </div>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader title="Rejected Property Listings" />

      {isLoading ? (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>Loading rejected listings...</p>
      ) : paginatedRejected.length > 0 ? (
        <>
          <table>
            <thead>
              <tr><th>Property</th><th>Owner</th><th>Location</th><th>Price</th><th>Rejected At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {paginatedRejected.map(r => (
                <tr key={r.id}>
                  <td 
                    onClick={() => {
                      setViewingRejected(r);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    style={{ cursor: 'pointer' }}
                    title="Click to view details"
                  >
                    <PropertyInfo icon={getIcon(r.type)} name={r.title} meta={getMetaString(r)} />
                  </td>
                  <td>{getOwnerFromDescription(r.description)}</td>
                  <td>{`${r.city}, ${r.district}`}</td>
                  <td>LKR {Number(r.price).toLocaleString()}</td>
                  <td>{formatDate(r.rejected_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn variant="approve" onClick={() => setViewingRejected(r)} title="View Profile">
                        <i className="bx bx-show" style={{ fontSize: '14px' }}></i>
                      </ActionBtn>
                      <ActionBtn variant="reply" onClick={() => handleRestoreRejected(r.id)} title="Restore to Submissions">
                        <i className="bx bx-undo" style={{ fontSize: '14px' }}></i>
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No rejected properties on record.</p>
      )}
    </Panel>
  )
}
