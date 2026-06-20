import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn, ActionBtn, PropertyInfo, FormGroup } from '../components'
import { DISTRICTS } from '../constants/districts'
import styles from '../styles/SellProperty.module.css'

// Base URL for backend listings (uses localhost in development)
const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname) 
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

export default function Submissions({ onSubmit }) {
  const [submissions, setSubmissions] = useState([])
  const [editingSubmission, setEditingSubmission] = useState(null)
  const [viewingSubmission, setViewingSubmission] = useState(null) // NEW State for detailed view
  const [filterType, setFilterType] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [viewingUser, setViewingUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [allProperties, setAllProperties] = useState([])
  const [rejectingListingId, setRejectingListingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleViewUserProfile = async (username) => {
    setLoadingUser(true)
    setViewingUser({ username }) // Immediately set username for loading state
    try {
      const baseUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/users'
        : 'https://primeventra-vrmv.vercel.app/api/users';
      const res = await fetch(`${baseUrl}/${username}`)
      if (res.ok) {
        const userData = await res.json()
        setViewingUser(userData)
      } else {
        alert('Could not find profile details for user: ' + username)
        setViewingUser(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      alert('Error connecting to user profile API.')
      setViewingUser(null)
    } finally {
      setLoadingUser(false)
    }
  }

  // Fetch pending submissions from the backend database and filter by completed payment
  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      // Fetch listings
      const res = await fetch(API_URL)
      const data = await res.json()
      
      // Fetch payments
      const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/payments'
        : 'https://primeventra-vrmv.vercel.app/api/payments';
      const paymentsRes = await fetch(paymentsUrl)
      const payments = await paymentsRes.json()
      
      // Filter for listings where:
      // 1. Status is Pending
      // 2. The corresponding payment record status is Completed
      if (Array.isArray(data) && Array.isArray(payments)) {
        setAllProperties(data) // Save all properties
        const pendingListings = data.filter(item => {
          const isPending = item.description && item.description.includes('Status: Pending');
          const payment = payments.find(p => p.listing_id == item.id);
          return isPending && payment && payment.payment_status === 'Completed';
        })
        setSubmissions(pendingListings)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchSubmissions()
  }, [])

  // Approve a listing
  const handleApprove = async (id, isFeatured = 'No') => {
    try {
      const res = await fetch(`${API_URL}/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: isFeatured })
      })
      
      if (res.ok) {
        // Remove the approved listing from the pending UI list
        setSubmissions(prev => prev.filter(s => s.id !== id))
        // Close detail view if it's currently open
        if (viewingSubmission?.id === id) setViewingSubmission(null)
        if (onSubmit) onSubmit()
      } else {
        alert('Failed to approve listing.')
      }
    } catch (error) {
      console.error('Error approving:', error)
    }
  }

  // Opens rejection modal
  const handleReject = (id) => {
    setRejectingListingId(id);
    setRejectionReason('');
  };

  // Submit rejection reasoning to backend
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('A rejection reason is required.');
      return;
    }
    const id = rejectingListingId;
    const reason = rejectionReason;
    setRejectingListingId(null);
    setRejectionReason('');

    // Determine target reject endpoint depending on environment
    const rejectUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? `http://localhost:5000/api/listings/${id}/reject`
      : `https://primeventra-vrmv.vercel.app/api/listings/${id}/reject`;

    try {
      const res = await fetch(rejectUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason.trim() })
      })
      
      if (res.ok) {
        // Remove the deleted listing from the UI list
        setSubmissions(prev => prev.filter(s => s.id !== id))
        // Close detail view if it's currently open
        if (viewingSubmission?.id === id) setViewingSubmission(null)
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert('Failed to reject listing: ' + (errorData.error || 'Server error'));
      }
    } catch (error) {
      console.error('Error rejecting:', error)
    }
  };

  // Save changes to an edited listing
  const handleSave = async () => {
    if (!editingSubmission.title || !editingSubmission.price) {
      alert('Please fill in required fields (*)')
      return
    }

    try {
      // Clean up the description to remove the trailing contact details before sending it back
      // The backend will automatically re-append them on update
      let cleanDescription = editingSubmission.description || '';
      if (cleanDescription.includes('--- Property & Contact Details ---')) {
        cleanDescription = cleanDescription.split('--- Property & Contact Details ---')[0].trim();
      }

      // Map our editing state back to the expected payload for the backend
      const payload = {
        type: editingSubmission.type,
        title: editingSubmission.title,
        description: cleanDescription,
        price: editingSubmission.price,
        district: editingSubmission.district,
        city: editingSubmission.city,
        status: 'Pending', // Keep it pending after edit
        negotiable: 'No',
        featured: editingSubmission.featured || 'No',
        // Map database columns back to what the backend expects
        bedrooms: editingSubmission.bedrooms,
        bathrooms: editingSubmission.bathrooms,
        houseSize: editingSubmission.type === 'House' ? editingSubmission.size_sqft : null,
        apartmentSize: editingSubmission.type === 'Apartment' ? editingSubmission.size_sqft : null,
        landSize: editingSubmission.land_size_perches,
        landUnit: 'Perches', // Defaulting back to perches for backend math
        landType: editingSubmission.land_type
      }

      const res = await fetch(`${API_URL}/${editingSubmission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setEditingSubmission(null)
        fetchSubmissions() // Refresh the list
      } else {
        const errData = await res.json()
        alert(`Failed to update: ${errData.error}`)
      }
    } catch (error) {
      console.error("Save error:", error)
      alert('An error occurred while saving.')
    }
  }

  // Filter UI
  const filteredSubmissions = submissions.filter(s => {
    if (filterType === 'All') return true
    return s.type === filterType
  })

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

  const getSubmittedByFromDescription = (desc) => {
    if (!desc) return 'Guest'
    const match = desc.match(/Submitted By:\s*(.+)/)
    return match ? match[1].trim() : 'Guest'
  }

  const getPaymentMethodFromDescription = (desc) => {
    if (!desc) return 'Bank Transfer'
    const match = desc.match(/Payment Method:\s*(.+)/)
    return match ? match[1].trim() : 'Bank Transfer'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div>
      
      {/* ---------------- REJECT REASON MODAL ---------------- */}
      {rejectingListingId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-outline-variant)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '450px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            color: 'var(--color-on-surface)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              Reject Property Submission
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Please enter the reason for rejecting this property submission. The seller will be notified of this message.
            </p>
            <textarea
              placeholder="e.g. Incomplete property description, poor quality photos, incorrect price details..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                height: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '1.5px solid var(--color-outline-variant)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                marginTop: '8px',
                marginBottom: '20px',
                background: 'var(--color-surface)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Btn variant="light" onClick={() => setRejectingListingId(null)}>Back</Btn>
              <Btn variant="danger" onClick={handleRejectSubmit}>Reject</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- USER PROFILE MODAL ---------------- */}
      {viewingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-outline-variant)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            color: 'var(--color-on-surface)'
          }}>
            <button 
              onClick={() => setViewingUser(null)} 
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--color-text-muted)'
              }}
            >
              <i className="bx bx-x"></i>
            </button>
            
            {loadingUser ? (
              <p style={{ textAlign: 'center', padding: '20px 0', fontSize: '14px', color: 'var(--color-text-muted)' }}>Loading user details...</p>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-secondary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    {viewingUser.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{viewingUser.username}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>Registered Portal User</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '13px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>User ID</strong>
                    <span>{viewingUser.id}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</strong>
                    <span>{viewingUser.email}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Member Since</strong>
                    <span>{viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* User's Past Activities */}
                <div style={{ borderTop: '1px solid var(--color-outline-variant)', marginTop: '20px', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-primary)' }}>Past Activities / Property Listings</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                        Properties Listed ({allProperties.filter(p => p.description && p.description.includes(`Submitted By: ${viewingUser.username}`) && !p.description.includes('Status: Sold')).length})
                      </strong>
                      <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-outline-variant)', borderRadius: '6px', padding: '10px', background: 'var(--color-background)' }}>
                        {allProperties.filter(p => p.description && p.description.includes(`Submitted By: ${viewingUser.username}`) && !p.description.includes('Status: Sold')).length === 0 ? (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No properties listed.</span>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.6' }}>
                            {allProperties.filter(p => p.description && p.description.includes(`Submitted By: ${viewingUser.username}`) && !p.description.includes('Status: Sold')).map(p => (
                              <li key={p.id} style={{ marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600' }}>{p.title}</span> <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>({p.type})</span><br/>
                                <span style={{ color: 'var(--color-secondary)', fontSize: '11px', fontWeight: '600' }}>LKR {p.price?.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div>
                      <strong style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                        Sold Properties ({allProperties.filter(p => p.description && p.description.includes(`Submitted By: ${viewingUser.username}`) && p.description.includes('Status: Sold')).length})
                      </strong>
                      <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-outline-variant)', borderRadius: '6px', padding: '10px', background: 'var(--color-background)' }}>
                        {allProperties.filter(p => p.description && p.description.includes(`Submitted By: ${viewingUser.username}`) && p.description.includes('Status: Sold')).length === 0 ? (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No sold properties.</span>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.6' }}>
                            {allProperties.filter(p => p.description && p.description.includes(`Submitted By: ${viewingUser.username}`) && p.description.includes('Status: Sold')).map(p => (
                              <li key={p.id} style={{ marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600' }}>{p.title}</span> <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>({p.type})</span><br/>
                                <span style={{ color: 'var(--color-secondary)', fontSize: '11px', fontWeight: '600' }}>LKR {p.price?.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setViewingUser(null)}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- DETAIL VIEW PANEL ---------------- */}
      {viewingSubmission && !editingSubmission && (
        <Panel style={{ border: '1.5px solid var(--color-primary)', marginBottom: '20px', background: 'var(--color-surface)' }}>
          <PanelHeader title={`${viewingSubmission.type} Profile: ${viewingSubmission.title}`}>
            <Btn variant="light" onClick={() => setViewingSubmission(null)} title="Close View">
              <i className="bx bx-x" style={{ fontSize: '24px' }}></i>
            </Btn>
          </PanelHeader>
          
          <div style={{ padding: '10px 0' }}>
            {/* Display Photos if available */}
            {viewingSubmission.photos && Array.isArray(viewingSubmission.photos) && viewingSubmission.photos.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', borderBottom: '1px solid var(--color-outline-variant)', marginBottom: '16px' }}>
                {viewingSubmission.photos.map((url, idx) => (
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', fontSize: '14px' }}>
              <div><strong style={{ color: 'var(--color-text-muted)' }}>Location:</strong><br />{viewingSubmission.city}, {viewingSubmission.district}</div>
              <div><strong style={{ color: 'var(--color-text-muted)' }}>Price:</strong><br />LKR {viewingSubmission.price?.toLocaleString()}</div>
              <div><strong style={{ color: 'var(--color-text-muted)' }}>Submitted On:</strong><br />{formatDate(viewingSubmission.created_at)}</div>
              
              {viewingSubmission.bedrooms && <div><strong style={{ color: 'var(--color-text-muted)' }}>Bedrooms:</strong><br />{viewingSubmission.bedrooms}</div>}
              {viewingSubmission.bathrooms && <div><strong style={{ color: 'var(--color-text-muted)' }}>Bathrooms:</strong><br />{viewingSubmission.bathrooms}</div>}
              {viewingSubmission.size_sqft && <div><strong style={{ color: 'var(--color-text-muted)' }}>Size (sqft):</strong><br />{viewingSubmission.size_sqft}</div>}
              {viewingSubmission.land_size_perches && <div><strong style={{ color: 'var(--color-text-muted)' }}>Land Size:</strong><br />{viewingSubmission.land_size_perches} Perches</div>}
              {viewingSubmission.land_type && <div><strong style={{ color: 'var(--color-text-muted)' }}>Land Type:</strong><br />{viewingSubmission.land_type}</div>}
            </div>

            {(() => {
              const { mainDesc, features, contacts, admin } = parsePropertyDescription(viewingSubmission.description);
              return (
                <>
                  <div style={{ marginBottom: '20px', background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-outline-variant)' }}>
            <Btn variant="danger" onClick={() => handleReject(viewingSubmission.id)}>
              <i className="bx bx-trash" style={{ marginRight: '6px' }}></i> Reject Submission
            </Btn>
            <Btn variant="success" onClick={() => handleApprove(viewingSubmission.id, 'No')}>
              <i className="bx bx-check-circle" style={{ marginRight: '6px' }}></i> Approve Listing
            </Btn>
          </div>
        </Panel>
      )}

      {/* ---------------- EDIT VIEW PANEL ---------------- */}
      {editingSubmission && (
        <Panel style={{ border: '1.5px solid var(--color-outline-variant)', marginBottom: '20px' }}>
          <PanelHeader title={`Edit ${editingSubmission.type} Submission`}>
            <Btn variant="light" onClick={() => setEditingSubmission(null)} title="Cancel">
              <i className="bx bx-arrow-back" style={{ fontSize: '18px' }}></i>
            </Btn>
          </PanelHeader>
          
          <div className={styles.formGrid}>
            
            <FormGroup label="Title *" full>
              <input type="text" value={editingSubmission.title || ''} onChange={e => setEditingSubmission({ ...editingSubmission, title: e.target.value })} />
            </FormGroup>

            <FormGroup label="District *">
              <select value={editingSubmission.district || ''} onChange={e => setEditingSubmission({ ...editingSubmission, district: e.target.value })}>
                <option value="">Select District</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="City *">
              <input type="text" value={editingSubmission.city || ''} onChange={e => setEditingSubmission({ ...editingSubmission, city: e.target.value })} />
            </FormGroup>

            <FormGroup label="Price *">
              <input type="number" value={editingSubmission.price || ''} onChange={e => setEditingSubmission({ ...editingSubmission, price: e.target.value })} />
            </FormGroup>

            {(editingSubmission.type === 'House' || editingSubmission.type === 'Apartment') && (
              <>
                <FormGroup label="Bedrooms">
                  <input type="number" value={editingSubmission.bedrooms || ''} onChange={e => setEditingSubmission({ ...editingSubmission, bedrooms: e.target.value })} />
                </FormGroup>
                <FormGroup label="Bathrooms">
                  <input type="number" value={editingSubmission.bathrooms || ''} onChange={e => setEditingSubmission({ ...editingSubmission, bathrooms: e.target.value })} />
                </FormGroup>
                <FormGroup label="Size (sqft)">
                  <input type="number" value={editingSubmission.size_sqft || ''} onChange={e => setEditingSubmission({ ...editingSubmission, size_sqft: e.target.value })} />
                </FormGroup>
              </>
            )}

            {(editingSubmission.type === 'Land' || editingSubmission.type === 'House') && (
              <FormGroup label="Land Size (Perches)">
                <input type="number" value={editingSubmission.land_size_perches || ''} onChange={e => setEditingSubmission({ ...editingSubmission, land_size_perches: e.target.value })} />
              </FormGroup>
            )}

            {editingSubmission.type === 'Land' && (
              <FormGroup label="Land Type">
                <select value={editingSubmission.land_type || 'Residential'} onChange={e => setEditingSubmission({ ...editingSubmission, land_type: e.target.value })}>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Agricultural</option>
                  <option>Other</option>
                </select>
              </FormGroup>
            )}

            <FormGroup label="Description *" full>
              <textarea 
                value={editingSubmission.description || ''} 
                onChange={e => setEditingSubmission({ ...editingSubmission, description: e.target.value })} 
                placeholder="Describe the property..." 
                rows={6}
              />
            </FormGroup>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Btn variant="success" onClick={handleSave}>Save Changes</Btn>
          </div>
        </Panel>
      )}

      {/* ---------------- MAIN LIST PANEL ---------------- */}
      <Panel>
        <PanelHeader title="Seller Submissions" />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['All', 'House', 'Apartment', 'Land'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
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
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>Loading submissions...</p>
        ) : filteredSubmissions.length > 0 ? (
          <table>
            <thead>
              <tr><th>Property</th><th>Owner</th><th>Submitted By</th><th>Location</th><th>Price</th><th>Payment Info</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(r => (
                <tr key={r.id}>
                  {/* Wrapped the Property Info in a clickable container */}
                  <td 
                    onClick={() => {
                      setViewingSubmission(r);
                      setEditingSubmission(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the detail view
                    }} 
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Click to view full profile"
                  >
                    <div style={{ display: 'inline-block', padding: '4px', borderRadius: '6px' }}>
                      <PropertyInfo icon={getIcon(r.type)} name={r.title} meta={getMetaString(r)} />
                      <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '4px', fontWeight: '600' }}>
                        View Full Details <i className="bx bx-right-arrow-alt"></i>
                      </div>
                    </div>
                  </td>
                  <td>{getOwnerFromDescription(r.description)}</td>
                  <td>
                    {getSubmittedByFromDescription(r.description) !== 'Guest' ? (
                      <span 
                        onClick={() => handleViewUserProfile(getSubmittedByFromDescription(r.description))}
                        style={{
                          color: 'var(--color-primary)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        title="Click to view user profile"
                      >
                        {getSubmittedByFromDescription(r.description)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>Guest</span>
                    )}
                  </td>
                  <td>{`${r.city}, ${r.district}`}</td>
                  <td>LKR {r.price.toLocaleString()}</td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary-dark)' }}>
                      {getPaymentMethodFromDescription(r.description)}
                    </div>
                    <span style={{
                      backgroundColor: '#e6f4ea',
                      color: '#137333',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'inline-block',
                      marginTop: '4px'
                    }}>
                      Completed
                    </span>
                  </td>
                  <td>{formatDate(r.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn 
                        variant="edit" 
                        onClick={() => { 
                          setEditingSubmission({ 
                            ...r, 
                            featured: r.description?.includes('Featured: Yes') ? 'Yes' : 'No' 
                          }); 
                          setViewingSubmission(null); 
                        }} 
                        title="Edit" 
                      />
                      <ActionBtn 
                        variant="approve" 
                        onClick={() => handleApprove(r.id, r.description?.includes('Featured: Yes') ? 'Yes' : 'No')} 
                        title="Approve" 
                      />
                      <ActionBtn variant="reject" onClick={() => handleReject(r.id)} title="Reject" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No pending submissions.</p>
        )}
      </Panel>
    </div>
  )
}