import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn, ActionBtn, PropertyInfo } from '../components'

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/rejected-properties'
  : 'https://primeventra-vrmv.vercel.app/api/rejected-properties';

export default function RejectedProperties() {
  const [rejectedList, setRejectedList] = useState([])
  const [viewingRejected, setViewingRejected] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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

  if (viewingRejected) {
    return (
      <Panel style={{ border: '1.5px solid var(--color-danger)', marginBottom: '20px', background: 'var(--color-surface)' }}>
        <PanelHeader title={`Rejected ${viewingRejected.type}: ${viewingRejected.title}`}>
          <Btn variant="light" onClick={() => setViewingRejected(null)} title="Back to List">
            <i className="bx bx-arrow-back" style={{ marginRight: '5px' }}></i> Back to List
          </Btn>
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

          {/* Description & Contact Box */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Original Description & Contact Details</h4>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
              {viewingRejected.description}
            </pre>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader title="Rejected Property Listings" />

      {isLoading ? (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>Loading rejected listings...</p>
      ) : rejectedList.length > 0 ? (
        <table>
          <thead>
            <tr><th>Property</th><th>Owner</th><th>Location</th><th>Price</th><th>Rejected At</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rejectedList.map(r => (
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No rejected properties on record.</p>
      )}
    </Panel>
  )
}
