import { useState } from 'react'
import { Panel, PanelHeader, Btn, ActionBtn, PropertyInfo } from '../components'
import { useAdmin } from '../context/AdminContext'

export default function Featured() {
  const { featured, properties, addFeaturedProperty, removeFeaturedProperty } = useAdmin()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [untilDate, setUntilDate] = useState('')

  const handleAdd = () => {
    if (!selectedPropertyId) {
      alert('Please select a property')
      return
    }
    const dateStr = untilDate ? new Date(untilDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 1, 2025'
    addFeaturedProperty(Number(selectedPropertyId), dateStr)
    setShowAddForm(false)
    setSelectedPropertyId('')
    setUntilDate('')
  }

  // Filter properties that are not already featured
  const unfeaturedProperties = properties.filter(
    p => !featured.some(f => f.propertyId === p.id)
  )

  return (
    <div>
      {showAddForm && (
        <Panel>
          <PanelHeader title="Add Property to Featured">
            <Btn variant="light" onClick={() => setShowAddForm(false)}>Cancel</Btn>
          </PanelHeader>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '10px' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Select Property</label>
              <select value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
                <option value="">Choose Listing...</option>
                {unfeaturedProperties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.loc}) - {p.price}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Featured Until</label>
              <input type="date" value={untilDate} onChange={e => setUntilDate(e.target.value)} />
            </div>
            <Btn variant="success" onClick={handleAdd}>Confirm</Btn>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHeader title="Featured Properties">
          {!showAddForm && (
            <Btn onClick={() => setShowAddForm(true)}>+ Add Featured</Btn>
          )}
        </PanelHeader>
        {featured.length > 0 ? (
          <table>
            <thead>
              <tr><th>Property</th><th>Location</th><th>Price</th><th>Featured Until</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {featured.map(r => (
                <tr key={r.id}>
                  <td><PropertyInfo icon={r.icon} name={r.name} meta={r.meta} /></td>
                  <td>{r.loc}</td>
                  <td>{r.price}</td>
                  <td>{r.until}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn variant="delete" onClick={() => removeFeaturedProperty(r.id)}>Remove</ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>No featured properties.</p>
        )}
      </Panel>
    </div>
  )
}
