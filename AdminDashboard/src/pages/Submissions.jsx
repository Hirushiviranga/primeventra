import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn, ActionBtn, PropertyInfo, FormGroup } from '../components'
import { DISTRICTS } from '../constants/districts'
import styles from '../styles/SellProperty.module.css'

// Base URL for your Vercel backend
const API_URL = 'https://primeventra-vrmv.vercel.app/api/listings';

export default function Submissions({ onSubmit }) {
  const [submissions, setSubmissions] = useState([])
  const [editingSubmission, setEditingSubmission] = useState(null)
  const [filterType, setFilterType] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch pending submissions from the backend database
  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      
      // Filter for listings where the description contains "Status: Pending"
      const pendingListings = data.filter(item => 
        item.description && item.description.includes('Status: Pending')
      )
      setSubmissions(pendingListings)
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
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/approve`, {
        method: 'PUT',
      })
      
      if (res.ok) {
        // Remove the approved listing from the pending UI list
        setSubmissions(prev => prev.filter(s => s.id !== id))
        if (onSubmit) onSubmit()
      } else {
        alert('Failed to approve listing.')
      }
    } catch (error) {
      console.error('Error approving:', error)
    }
  }

  // Reject / Delete a listing
  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject and permanently delete this submission?')) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        // Remove the deleted listing from the UI list
        setSubmissions(prev => prev.filter(s => s.id !== id))
      } else {
        alert('Failed to reject listing.')
      }
    } catch (error) {
      console.error('Error rejecting:', error)
    }
  }

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

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div>
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
              <tr><th>Property</th><th>Owner</th><th>Location</th><th>Price</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(r => (
                <tr key={r.id}>
                  <td><PropertyInfo icon={getIcon(r.type)} name={r.title} meta={getMetaString(r)} /></td>
                  <td>{getOwnerFromDescription(r.description)}</td>
                  <td>{`${r.city}, ${r.district}`}</td>
                  <td>LKR {r.price.toLocaleString()}</td>
                  <td>{formatDate(r.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn variant="edit" onClick={() => setEditingSubmission({ ...r })} title="Edit" />
                      <ActionBtn variant="approve" onClick={() => handleApprove(r.id)} title="Approve" />
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