import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn, ActionBtn, PropertyInfo, FormGroup, Pagination } from '../components'
import { DISTRICTS } from '../constants/districts'
import { useAdmin } from '../context/AdminContext'
import styles from '../styles/SellProperty.module.css'

const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname) 
  ? 'http://localhost:5000/api/listings' 
  : 'https://primeventra-vrmv.vercel.app/api/listings';

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

export default function Drafts({ onSubmit }) {
  const { drafts, setDrafts, updateProperty, deleteProperty, approveSubmission, toggleDraftPayment, rejectDraft } = useAdmin()
  const [editingDraft, setEditingDraft] = useState(null)
  const [viewingDraft, setViewingDraft] = useState(null)
  const [filterType, setFilterType] = useState('All')
  const [viewingUser, setViewingUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rejectingDraftId, setRejectingDraftId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleViewUserProfile = async (username) => {
    setLoadingUser(true)
    setViewingUser({ username })
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

  // Publish a draft directly to active listings
  const handlePublish = async (id) => {
    if (!window.confirm("Are you sure you want to publish this draft directly?")) {
      return;
    }
    try {
      await approveSubmission(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
      if (viewingDraft?.id === id) setViewingDraft(null);
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error publishing draft:', error)
      alert('Failed to publish draft.')
    }
  }

  // Save changes to draft, moving it to submissions (status changes to Pending) or marking it paid
  const handleSave = async () => {
    if (!editingDraft.name || !editingDraft.price) {
      alert('Please fill in required fields (*)')
      return
    }

    try {
      let cleanDescription = editingDraft.description || '';
      if (cleanDescription.includes('--- Property & Contact Details ---')) {
        cleanDescription = cleanDescription.split('--- Property & Contact Details ---')[0].trim();
      }

      // Save draft changes only (forceDraft=true ensures we always hit /api/drafts/ endpoint)
      const updated = await updateProperty(editingDraft.id, {
        ...editingDraft,
        description: cleanDescription
      }, true);

      if (updated) {
        alert('Draft details saved successfully.');
        setEditingDraft(null);
        if (viewingDraft?.id === editingDraft.id) setViewingDraft(null);
        if (onSubmit) onSubmit();
      }
    } catch (error) {
      console.error("Save error:", error)
      alert('An error occurred while saving draft.')
    }
  }

  const handlePublishPaid = async () => {
    if (!editingDraft.name || !editingDraft.price) {
      alert('Please fill in required fields (*)')
      return
    }

    try {
      let cleanDescription = editingDraft.description || '';
      if (cleanDescription.includes('--- Property & Contact Details ---')) {
        cleanDescription = cleanDescription.split('--- Property & Contact Details ---')[0].trim();
      }

      // 1. Save draft changes first (forceDraft=true ensures we always hit /api/drafts/ endpoint)
      const updated = await updateProperty(editingDraft.id, {
        ...editingDraft,
        description: cleanDescription
      }, true);

      if (updated) {
        // 2. Convert draft to manual payment
        const pkgName = editingDraft.packageName || 'Standard Package';
        const pkgPrice = editingDraft.packagePrice || 5500;
        await toggleDraftPayment(editingDraft.id, true, pkgName, pkgPrice);
        alert('Draft details saved, marked as paid, and moved to Payments.');

        setEditingDraft(null);
        if (viewingDraft?.id === editingDraft.id) setViewingDraft(null);
        if (onSubmit) onSubmit();
      }
    } catch (error) {
      console.error("Publish error:", error)
      alert('An error occurred while publishing draft.')
    }
  }

  const handleDeleteClick = (id) => {
    setRejectingDraftId(id);
    setRejectionReason('');
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('A rejection reason is required.');
      return;
    }
    try {
      await rejectDraft(rejectingDraftId, rejectionReason);
      setRejectingDraftId(null);
      setRejectionReason('');
      if (viewingDraft?.id === rejectingDraftId) setViewingDraft(null);
      if (onSubmit) onSubmit();
      alert("Draft rejected and archived successfully.");
    } catch (error) {
      console.error("Error rejecting draft:", error);
      alert("Failed to reject draft.");
    }
  }

  const handleTogglePayment = async (id) => {
    if (!window.confirm("Mark payment as completed for this draft? It will move to the Payments tab.")) {
      return;
    }
    try {
      await toggleDraftPayment(id, true);
      if (viewingDraft?.id === id) setViewingDraft(null);
      if (onSubmit) onSubmit();
      alert("Draft marked as paid successfully.");
    } catch (error) {
      console.error("Error toggling payment:", error);
      alert("Failed to mark paid.");
    }
  }

  // Filter and Paginate
  const filteredDrafts = drafts.filter(d => {
    if (filterType === 'All') return true
    return d.type === filterType
  })

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredDrafts.length / itemsPerPage);
  const paginatedDrafts = filteredDrafts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getIcon = (type) => {
    if (type === 'Land') return 'bx bx-landscape'
    if (type === 'Apartment') return 'bx bx-building'
    return 'bx bx-home'
  }

  const getMetaString = (r) => {
    if (r.type === 'Land') return `Land • ${r.landSize || 0} Perches`
    if (r.type === 'Apartment') return `Apartment • ${r.bedrooms || 0} Beds • ${r.bathrooms || 0} Baths • ${r.size || 0} sqft`
    return `House • ${r.bedrooms || 0} Beds • ${r.bathrooms || 0} Baths • ${r.size || 0} sqft`
  }

  const getSubmittedByFromDescription = (desc) => {
    if (!desc) return 'Guest'
    const match = desc.match(/Submitted By:\s*(.+)/)
    return match ? match[1].trim() : 'Guest'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div>
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
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-primary)' }}>User Profile Details</h3>
            {loadingUser ? (
              <p>Loading user profile...</p>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px', marginBottom: '20px' }}>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Username</strong>
                    <span>{viewingUser.username || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</strong>
                    <span>{[viewingUser.first_name, viewingUser.last_name].filter(Boolean).join(' ') || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Phone Number</strong>
                    <span>{viewingUser.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</strong>
                    <span>{viewingUser.email || 'N/A'}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Member Since</strong>
                    <span>{viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Btn variant="primary" onClick={() => setViewingUser(null)}>Close Profile</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- DETAIL VIEW PANEL ---------------- */}
      {viewingDraft && !editingDraft && (
        <Panel style={{ border: '1.5px solid var(--color-primary)', marginBottom: '20px', background: 'var(--color-surface)' }}>
          <PanelHeader title={`${viewingDraft.type} Draft: ${viewingDraft.name}`}>
            <Btn variant="light" onClick={() => setViewingDraft(null)} title="Close View">
              <i className="bx bx-x" style={{ fontSize: '24px' }}></i>
            </Btn>
          </PanelHeader>
          
          <div style={{ padding: '10px 0' }}>
            {viewingDraft.photos && Array.isArray(viewingDraft.photos) && viewingDraft.photos.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', borderBottom: '1px solid var(--color-outline-variant)', marginBottom: '16px' }}>
                {viewingDraft.photos.map((url, idx) => (
                  <img 
                    key={idx} 
                    src={url} 
                    alt={`Property image ${idx + 1}`} 
                    style={{ height: '140px', width: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }} 
                  />
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', fontSize: '14px' }}>
              <div><strong style={{ color: 'var(--color-text-muted)' }}>Location:</strong><br />{viewingDraft.city}, {viewingDraft.district}</div>
              <div><strong style={{ color: 'var(--color-text-muted)' }}>Price:</strong><br />{viewingDraft.price}</div>
              <div><strong style={{ color: 'var(--color-text-muted)' }}>Created On:</strong><br />{viewingDraft.date}</div>
              
              {viewingDraft.bedrooms && <div><strong style={{ color: 'var(--color-text-muted)' }}>Bedrooms:</strong><br />{viewingDraft.bedrooms}</div>}
              {viewingDraft.bathrooms && <div><strong style={{ color: 'var(--color-text-muted)' }}>Bathrooms:</strong><br />{viewingDraft.bathrooms}</div>}
              {viewingDraft.size && <div><strong style={{ color: 'var(--color-text-muted)' }}>Size:</strong><br />{viewingDraft.size} sqft</div>}
              {viewingDraft.landSize && <div><strong style={{ color: 'var(--color-text-muted)' }}>Land Size:</strong><br />{viewingDraft.landSize} Perches</div>}
              {viewingDraft.landType && <div><strong style={{ color: 'var(--color-text-muted)' }}>Land Type:</strong><br />{viewingDraft.landType}</div>}
            </div>

            {(() => {
              const { mainDesc, features, contacts, admin } = parsePropertyDescription(viewingDraft.description);
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
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{c.value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {admin.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-dark)', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>System Info</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {admin.map((adm, idx) => (
                          <div key={idx} style={{ background: 'var(--color-surface-low)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{adm.label}</span>
                            {adm.label.toLowerCase() === 'submitted by' ? (
                              <button 
                                onClick={() => handleViewUserProfile(adm.value)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-secondary)',
                                  textDecoration: 'underline',
                                  fontWeight: 700,
                                  fontSize: '13px',
                                  cursor: 'pointer'
                                }}
                              >
                                {adm.value}
                              </button>
                            ) : (
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{adm.value}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <Btn variant="danger" onClick={() => handleDeleteClick(viewingDraft.id)}>Delete Draft</Btn>
              <Btn variant="light" onClick={() => setEditingDraft(viewingDraft)}>Edit Details</Btn>
              <Btn variant="success" onClick={() => handlePublish(viewingDraft.id)}>Approve & Publish</Btn>
            </div>
          </div>
        </Panel>
      )}

      {/* ---------------- EDIT PANEL ---------------- */}
      {editingDraft && (
        <Panel style={{ border: '1.5px solid var(--color-secondary)', marginBottom: '20px', background: 'var(--color-surface)' }}>
          <PanelHeader title={`Edit Draft: ${editingDraft.name}`}>
            <Btn variant="light" onClick={() => setEditingDraft(null)}>Cancel</Btn>
          </PanelHeader>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', padding: '10px 0' }}>
            <FormGroup label="Title *">
              <input type="text" value={editingDraft.name || ''} onChange={e => setEditingDraft({ ...editingDraft, name: e.target.value })} />
            </FormGroup>

            <FormGroup label="Price (LKR) *">
              <input type="text" value={editingDraft.price || ''} onChange={e => setEditingDraft({ ...editingDraft, price: e.target.value })} />
            </FormGroup>

            <FormGroup label="District *">
              <select value={editingDraft.district || 'Colombo'} onChange={e => setEditingDraft({ ...editingDraft, district: e.target.value })}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="City *">
              <input type="text" value={editingDraft.city || ''} onChange={e => setEditingDraft({ ...editingDraft, city: e.target.value })} />
            </FormGroup>

            {editingDraft.type === 'Apartment' && (
              <>
                <FormGroup label="Apartment Complex">
                  <input type="text" value={editingDraft.apartmentComplex || ''} onChange={e => setEditingDraft({ ...editingDraft, apartmentComplex: e.target.value })} />
                </FormGroup>
                <FormGroup label="Floor Number">
                  <input type="text" value={editingDraft.floorNumber || ''} onChange={e => setEditingDraft({ ...editingDraft, floorNumber: e.target.value })} />
                </FormGroup>
                <FormGroup label="Total Floors">
                  <input type="text" value={editingDraft.totalFloors || ''} onChange={e => setEditingDraft({ ...editingDraft, totalFloors: e.target.value })} />
                </FormGroup>
              </>
            )}

            {editingDraft.type !== 'Land' && (
              <>
                <FormGroup label="Bedrooms">
                  <input type="number" value={editingDraft.bedrooms || ''} onChange={e => setEditingDraft({ ...editingDraft, bedrooms: e.target.value })} />
                </FormGroup>
                <FormGroup label="Bathrooms">
                  <input type="number" value={editingDraft.bathrooms || ''} onChange={e => setEditingDraft({ ...editingDraft, bathrooms: e.target.value })} />
                </FormGroup>
                <FormGroup label="Size (sqft)">
                  <input type="number" value={editingDraft.size || ''} onChange={e => setEditingDraft({ ...editingDraft, size: e.target.value })} />
                </FormGroup>
              </>
            )}

            {(editingDraft.type === 'Land' || editingDraft.type === 'House') && (
              <FormGroup label="Land Size (Perches)">
                <input type="number" value={editingDraft.landSize || ''} onChange={e => setEditingDraft({ ...editingDraft, landSize: e.target.value })} />
              </FormGroup>
            )}

            {editingDraft.type === 'Land' && (
              <FormGroup label="Land Type">
                <select value={editingDraft.landType || 'Residential'} onChange={e => setEditingDraft({ ...editingDraft, landType: e.target.value })}>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Agricultural</option>
                  <option>Other</option>
                </select>
              </FormGroup>
            )}

            <FormGroup label="Description *" full>
              <textarea 
                value={editingDraft.description || ''} 
                onChange={e => setEditingDraft({ ...editingDraft, description: e.target.value })} 
                placeholder="Describe the property..." 
                rows={6}
              />
            </FormGroup>

            <FormGroup label="Payment Status (Mark Paid)">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={editingDraft.paid || false} 
                  onChange={e => setEditingDraft({ 
                    ...editingDraft, 
                    paid: e.target.checked,
                    packageName: e.target.checked ? (editingDraft.packageName || 'Standard Package') : undefined,
                    packagePrice: e.target.checked ? (editingDraft.packagePrice || 5500) : undefined
                  })} 
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Mark as Paid</span>
              </div>
            </FormGroup>

            {editingDraft.paid && (
              <FormGroup label="Select Package & Price">
                <select 
                  value={`${editingDraft.packageName || 'Standard Package'}|${editingDraft.packagePrice || 5500}`} 
                  onChange={e => {
                    const [name, price] = e.target.value.split('|');
                    setEditingDraft({ 
                      ...editingDraft, 
                      packageName: name, 
                      packagePrice: Number(price) 
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-outline-variant)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    fontSize: '14px'
                  }}
                >
                  <option value="Standard Package|5500">Standard Package - LKR 5,500</option>
                  <option value="Premium Package|9000">Premium Package - LKR 9,000</option>
                  <option value="Deluxe Package|12000">Deluxe Package - LKR 12,000</option>
                  <option value="Executive Package|30000">Executive Package - LKR 30,000</option>
                </select>
              </FormGroup>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            {editingDraft.paid && (
              <Btn variant="primary" onClick={handlePublishPaid}>Publish</Btn>
            )}
            <Btn variant="success" onClick={handleSave}>Save Changes</Btn>
          </div>
        </Panel>
      )}

      {/* ---------------- MAIN LIST PANEL ---------------- */}
      {!viewingDraft && !editingDraft && (
        <Panel>
        <PanelHeader title="Draft Listings" />

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

        {filteredDrafts.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Submitted By</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Created On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDrafts.map(r => (
                  <tr key={r.id}>
                    <td onClick={() => { setViewingDraft(r); setEditingDraft(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>
                      <PropertyInfo icon={getIcon(r.type)} name={r.name} meta={getMetaString(r)} />
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewUserProfile(getSubmittedByFromDescription(r.description))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-secondary)',
                          textDecoration: 'underline',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {getSubmittedByFromDescription(r.description)}
                      </button>
                    </td>
                    <td>{r.loc}</td>
                    <td style={{ fontWeight: '700', color: 'var(--color-primary-dark)' }}>{r.price}</td>
                    <td>{r.date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <ActionBtn variant="approve" title="Publish" onClick={() => handlePublish(r.id)} />
                        <ActionBtn variant="edit" title="Edit" onClick={() => { setEditingDraft(r); setViewingDraft(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                        <ActionBtn variant="delete" title="Delete" onClick={() => handleDeleteClick(r.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No draft listings found.</p>
        )}
      </Panel>
      )}

      {/* ---------------- REJECT REASON MODAL ---------------- */}
      {rejectingDraftId && (
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
            maxWidth: '500px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            color: 'var(--color-on-surface)'
          }}>
            <button 
              onClick={() => setRejectingDraftId(null)} 
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
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: 'var(--color-danger)' }}>
              Reject Property Draft
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Please enter the reason for rejecting this property draft. The details will be logged in the rejected drafts system.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--color-outline-variant)',
                background: 'var(--color-surface)',
                color: 'var(--color-on-surface)',
                fontSize: '14px',
                marginBottom: '20px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Btn variant="light" onClick={() => setRejectingDraftId(null)}>Back</Btn>
              <Btn variant="danger" onClick={handleRejectSubmit}>Reject</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
