import { useState } from 'react'
import { Panel, PanelHeader, Btn, ActionBtn, PropertyInfo, FormGroup } from '../components'
import { useAdmin } from '../context/AdminContext'
import { DISTRICTS } from '../constants/districts'
import styles from '../styles/SellProperty.module.css'

const getSubmissionType = (sub) => {
  if (sub.type) {
    if (sub.type.toLowerCase() === 'land') return 'Land';
    if (sub.type.toLowerCase() === 'apartment') return 'Apartment';
    return 'House';
  }
  if (sub.icon && sub.icon.includes('landscape')) return 'Land';
  if (sub.icon && sub.icon.includes('building')) return 'Apartment';
  return 'House';
};

export default function Submissions({ onSubmit }) {
  const { submissions, approveSubmission, rejectSubmission, updateSubmission } = useAdmin()
  const [editingSubmission, setEditingSubmission] = useState(null)
  const [filterType, setFilterType] = useState('All')

  const handleApprove = (id) => {
    approveSubmission(id)
    if (onSubmit) onSubmit()
  }

  const handleSave = () => {
    if (!editingSubmission.name || !editingSubmission.price) {
      alert('Please fill in required fields (*)')
      return
    }

    const type = getSubmissionType(editingSubmission)
    let meta = editingSubmission.meta
    if (type === 'Land') {
      const unitPart = (editingSubmission.unit || 'Perches').split(' ')[0]
      meta = `Land • ${editingSubmission.size || '1'} ${unitPart}`
    } else if (type === 'House') {
      meta = `House • ${editingSubmission.bedrooms || '3'} Beds • ${editingSubmission.bathrooms || '2'} Baths • ${editingSubmission.houseSize || '0'} sqft`
    } else if (type === 'Apartment') {
      meta = `Apartment • ${editingSubmission.bedrooms || '2'} Beds • ${editingSubmission.bathrooms || '2'} Baths • ${editingSubmission.size || '0'} sqft`
    }

    const updated = {
      ...editingSubmission,
      meta,
      loc: `${editingSubmission.city || 'Unknown'}, ${editingSubmission.district || 'Colombo'}`,
      price: editingSubmission.price.startsWith('LKR') ? editingSubmission.price : `LKR ${editingSubmission.price}`
    }

    updateSubmission(updated)
      .then(() => {
        setEditingSubmission(null)
      })
      .catch(err => {
        console.error("Save error:", err)
      })
  }

  const filteredSubmissions = submissions.filter(s => {
    if (filterType === 'All') return true
    return getSubmissionType(s) === filterType
  })

  return (
    <div>
      {editingSubmission && (
        <Panel style={{ border: '1.5px solid var(--color-outline-variant)', marginBottom: '20px' }}>
          <PanelHeader title={`Edit ${getSubmissionType(editingSubmission)} Submission`}>
            <Btn variant="light" onClick={() => setEditingSubmission(null)} title="Cancel">
              <i className="bx bx-arrow-back" style={{ fontSize: '18px' }}></i>
            </Btn>
          </PanelHeader>
          
          <div className={styles.formGrid}>
            {getSubmissionType(editingSubmission) === 'Land' && (
              <>
                <FormGroup label="Title *" full>
                  <input type="text" value={editingSubmission.name || ''} onChange={e => setEditingSubmission({ ...editingSubmission, name: e.target.value })} />
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
                <FormGroup label="Land Type *">
                  <select value={editingSubmission.landType || 'Residential'} onChange={e => setEditingSubmission({ ...editingSubmission, landType: e.target.value })}>
                    <option>Residential</option>
                    <option>Agricultural</option>
                    <option>Industrial</option>
                    <option>Mixed Use</option>
                  </select>
                </FormGroup>
                <FormGroup label="Land Size">
                  <input type="number" value={editingSubmission.size || ''} onChange={e => setEditingSubmission({ ...editingSubmission, size: e.target.value })} min="0.1" step="0.1" />
                </FormGroup>
                <FormGroup label="Unit">
                  <select value={editingSubmission.unit || 'Perches (පර්චස්)'} onChange={e => setEditingSubmission({ ...editingSubmission, unit: e.target.value })}>
                    <option>Perches (පර්චස්)</option>
                    <option>Acres (අක්කර)</option>
                    <option>Hectares</option>
                    <option>Sq. Feet</option>
                    <option>Sq. Meters</option>
                  </select>
                </FormGroup>
                <FormGroup label="Price *">
                  <input type="text" value={editingSubmission.price || ''} onChange={e => setEditingSubmission({ ...editingSubmission, price: e.target.value })} />
                </FormGroup>
                <FormGroup label="Negotiable *">
                  <select value={editingSubmission.negotiable || 'No'} onChange={e => setEditingSubmission({ ...editingSubmission, negotiable: e.target.value })}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </FormGroup>
                <FormGroup label="Google Map Link">
                  <input type="text" value={editingSubmission.mapLink || ''} onChange={e => setEditingSubmission({ ...editingSubmission, mapLink: e.target.value })} placeholder="Paste Google Map URL" />
                </FormGroup>
                <FormGroup label="Description *" full>
                  <textarea value={editingSubmission.description || ''} onChange={e => setEditingSubmission({ ...editingSubmission, description: e.target.value })} placeholder="Describe the property..." />
                </FormGroup>
              </>
            )}

            {getSubmissionType(editingSubmission) === 'House' && (
              <>
                <FormGroup label="Title *" full>
                  <input type="text" value={editingSubmission.name || ''} onChange={e => setEditingSubmission({ ...editingSubmission, name: e.target.value })} />
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
                <FormGroup label="Land Size">
                  <input type="number" value={editingSubmission.landSize || ''} onChange={e => setEditingSubmission({ ...editingSubmission, landSize: e.target.value })} min="0.1" step="0.1" />
                </FormGroup>
                <FormGroup label="Unit">
                  <select value={editingSubmission.unit || 'Perches (පර්චස්)'} onChange={e => setEditingSubmission({ ...editingSubmission, unit: e.target.value })}>
                    <option>Perches (පර්චස්)</option>
                    <option>Acres (අක්කර)</option>
                    <option>Hectares</option>
                    <option>Sq. Feet</option>
                    <option>Sq. Meters</option>
                  </select>
                </FormGroup>
                <FormGroup label="House Size (sqft) *">
                  <input type="number" value={editingSubmission.houseSize || ''} onChange={e => setEditingSubmission({ ...editingSubmission, houseSize: e.target.value })} />
                </FormGroup>
                <FormGroup label="House Type">
                  <select value={editingSubmission.houseType || 'Single Story'} onChange={e => setEditingSubmission({ ...editingSubmission, houseType: e.target.value })}>
                    <option>Single Story</option>
                    <option>Double Story</option>
                    <option>Triple Story</option>
                    <option>Villa</option>
                    <option>Bungalow</option>
                    <option>Town House</option>
                  </select>
                </FormGroup>
                <FormGroup label="Bedrooms *">
                  <select value={editingSubmission.bedrooms || '3'} onChange={e => setEditingSubmission({ ...editingSubmission, bedrooms: e.target.value })}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6+</option>
                  </select>
                </FormGroup>
                <FormGroup label="Bathrooms *">
                  <select value={editingSubmission.bathrooms || '2'} onChange={e => setEditingSubmission({ ...editingSubmission, bathrooms: e.target.value })}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5+</option>
                  </select>
                </FormGroup>
                <FormGroup label="Completion Status">
                  <select value={editingSubmission.completionStatus || 'Ready (සූදානම්)'} onChange={e => setEditingSubmission({ ...editingSubmission, completionStatus: e.target.value })}>
                    <option>Ready (සූදානම්)</option>
                    <option>Under Construction</option>
                    <option>New</option>
                    <option>Renovation Required</option>
                  </select>
                </FormGroup>
                <FormGroup label="Furnished Status">
                  <select value={editingSubmission.furnishedStatus || 'Unfurnished (ගෘහ භාණ්ඩ රහිත)'} onChange={e => setEditingSubmission({ ...editingSubmission, furnishedStatus: e.target.value })}>
                    <option>Unfurnished (ගෘහ භාණ්ඩ රහිත)</option>
                    <option>Semi-Furnished</option>
                    <option>Fully Furnished</option>
                  </select>
                </FormGroup>
                <FormGroup label="Price *">
                  <input type="text" value={editingSubmission.price || ''} onChange={e => setEditingSubmission({ ...editingSubmission, price: e.target.value })} />
                </FormGroup>
                <FormGroup label="Negotiable *">
                  <select value={editingSubmission.negotiable || 'No'} onChange={e => setEditingSubmission({ ...editingSubmission, negotiable: e.target.value })}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </FormGroup>
                <FormGroup label="Google Map Link">
                  <input type="text" value={editingSubmission.mapLink || ''} onChange={e => setEditingSubmission({ ...editingSubmission, mapLink: e.target.value })} placeholder="Paste Google Map URL" />
                </FormGroup>
                <FormGroup label="Description *" full>
                  <textarea value={editingSubmission.description || ''} onChange={e => setEditingSubmission({ ...editingSubmission, description: e.target.value })} placeholder="Describe the property..." />
                </FormGroup>
              </>
            )}

            {getSubmissionType(editingSubmission) === 'Apartment' && (
              <>
                <FormGroup label="Title *" full>
                  <input type="text" value={editingSubmission.name || ''} onChange={e => setEditingSubmission({ ...editingSubmission, name: e.target.value })} />
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
                <FormGroup label="Size (sqft) *">
                  <input type="number" value={editingSubmission.size || ''} onChange={e => setEditingSubmission({ ...editingSubmission, size: e.target.value })} />
                </FormGroup>
                <FormGroup label="Apartment Complex *">
                  <input type="text" value={editingSubmission.apartmentComplex || ''} onChange={e => setEditingSubmission({ ...editingSubmission, apartmentComplex: e.target.value })} />
                </FormGroup>
                <FormGroup label="Floor Number">
                  <input type="number" value={editingSubmission.floorNumber || ''} onChange={e => setEditingSubmission({ ...editingSubmission, floorNumber: e.target.value })} />
                </FormGroup>
                <FormGroup label="Total Floors in Building">
                  <input type="number" value={editingSubmission.totalFloors || ''} onChange={e => setEditingSubmission({ ...editingSubmission, totalFloors: e.target.value })} />
                </FormGroup>
                <FormGroup label="Bedrooms *">
                  <select value={editingSubmission.bedrooms || '2'} onChange={e => setEditingSubmission({ ...editingSubmission, bedrooms: e.target.value })}>
                    <option>Studio</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5+</option>
                  </select>
                </FormGroup>
                <FormGroup label="Bathrooms *">
                  <select value={editingSubmission.bathrooms || '2'} onChange={e => setEditingSubmission({ ...editingSubmission, bathrooms: e.target.value })}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4+</option>
                  </select>
                </FormGroup>
                <FormGroup label="Completion Status *">
                  <select value={editingSubmission.completionStatus || 'Ready (සූදානම්)'} onChange={e => setEditingSubmission({ ...editingSubmission, completionStatus: e.target.value })}>
                    <option>Ready (සූදානම්)</option>
                    <option>Under Construction</option>
                    <option>Off-Plan</option>
                  </select>
                </FormGroup>
                <FormGroup label="Furnished Status *">
                  <select value={editingSubmission.furnishedStatus || 'Unfurnished (ගෘහ භාණ්ඩ රහිත)'} onChange={e => setEditingSubmission({ ...editingSubmission, furnishedStatus: e.target.value })}>
                    <option>Unfurnished (ගෘහ භාණ්ඩ රහිත)</option>
                    <option>Semi-Furnished</option>
                    <option>Fully Furnished</option>
                  </select>
                </FormGroup>
                <FormGroup label="Parking">
                  <select value={editingSubmission.parking || 'No Parking'} onChange={e => setEditingSubmission({ ...editingSubmission, parking: e.target.value })}>
                    <option>No Parking</option>
                    <option>1 Space</option>
                    <option>2 Spaces</option>
                    <option>3+ Spaces</option>
                  </select>
                </FormGroup>
                <FormGroup label="Gym / Pool / Security">
                  <select value={editingSubmission.amenities || 'None'} onChange={e => setEditingSubmission({ ...editingSubmission, amenities: e.target.value })}>
                    <option>None</option>
                    <option>Gym Only</option>
                    <option>Pool Only</option>
                    <option>Gym + Pool</option>
                    <option>Full Amenities</option>
                  </select>
                </FormGroup>
                <FormGroup label="Price *">
                  <input type="text" value={editingSubmission.price || ''} onChange={e => setEditingSubmission({ ...editingSubmission, price: e.target.value })} />
                </FormGroup>
                <FormGroup label="Negotiable *">
                  <select value={editingSubmission.negotiable || 'No'} onChange={e => setEditingSubmission({ ...editingSubmission, negotiable: e.target.value })}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </FormGroup>
                <FormGroup label="Google Map Link">
                  <input type="text" value={editingSubmission.mapLink || ''} onChange={e => setEditingSubmission({ ...editingSubmission, mapLink: e.target.value })} placeholder="Paste Google Map URL" />
                </FormGroup>
                <FormGroup label="Description *" full>
                  <textarea value={editingSubmission.description || ''} onChange={e => setEditingSubmission({ ...editingSubmission, description: e.target.value })} placeholder="Describe the property..." />
                </FormGroup>
              </>
            )}
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

        {filteredSubmissions.length > 0 ? (
          <table>
            <thead>
              <tr><th>Property</th><th>Owner</th><th>Location</th><th>Price</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredSubmissions.map(r => (
                <tr key={r.id}>
                  <td><PropertyInfo icon={r.icon} name={r.name} meta={r.meta} /></td>
                  <td>{r.owner}</td>
                  <td>{r.loc}</td>
                  <td>{r.price}</td>
                  <td>{r.date}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn variant="edit" onClick={() => setEditingSubmission({ ...r })} title="Edit" />
                      <ActionBtn variant="approve" onClick={() => handleApprove(r.id)} title="Approve" />
                      <ActionBtn variant="reject" onClick={() => rejectSubmission(r.id)} title="Reject" />
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
