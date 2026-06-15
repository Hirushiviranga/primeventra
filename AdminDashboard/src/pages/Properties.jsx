import { useState } from 'react'
import { Panel, PanelHeader, Badge, Btn, ActionBtn, PropertyInfo } from '../components'
import { useAdmin } from '../context/AdminContext'

export default function Properties({ onNav }) {
  const { properties, deleteProperty } = useAdmin()
  const [filterType, setFilterType] = useState('All')
  const [selectedProperty, setSelectedProperty] = useState(null)

  const filtered = properties.filter(p => filterType === 'All' || p.type === filterType)

  if (selectedProperty) {
    return (
      <div>
        <Btn variant="light" onClick={() => setSelectedProperty(null)} style={{ marginBottom: '20px' }}>
          <i className="bx bx-arrow-back" style={{ marginRight: '6px' }}></i> Back to Listings
        </Btn>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start', borderBottom: '1px solid var(--color-surface-low)', paddingBottom: '20px', marginBottom: '20px', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', color: 'var(--color-secondary)' }}><i className={selectedProperty.icon}></i></span>
                <h2 style={{ fontSize: '24px', margin: 0 }}>{selectedProperty.name}</h2>
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
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>#{selectedProperty.id}</div>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Description</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: '1.6' }}>
              {selectedProperty.description || `This premium ${selectedProperty.type.toLowerCase()} located in the prime area of ${selectedProperty.loc} offers modern details, high quality building materials, and excellent accessibility to key urban centers. Features include spacious rooms, state of the art finishes, and is highly recommended for residential purposes or high value investment yields.`}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px' }}>Location Map</h3>
            <div style={{ width: '100%', padding: '24px', background: 'var(--color-surface-container)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-map-pin" style={{ fontSize: '24px', marginRight: '8px', color: 'var(--color-secondary)' }}></i>
                <span>Google Maps Location for {selectedProperty.loc}</span>
              </div>
              {selectedProperty.mapLink ? (
                <Btn variant="secondary" onClick={() => window.open(selectedProperty.mapLink, '_blank')}>
                  <i className="bx bx-link-external" style={{ marginRight: '6px' }}></i> Open Google Maps Location
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
      <PanelHeader title="All Property Listings">
        <Btn onClick={() => onNav('sell-property')}>
          <i className="bx bx-plus-circle"></i> Add Property
        </Btn>
      </PanelHeader>

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

      <table>
        <thead>
          <tr>
            <th>Property</th><th>Type</th><th>Location</th>
            <th>Price</th><th>Status</th><th>Listed</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
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
              <td>{p.date}</td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <ActionBtn variant="delete" onClick={() => deleteProperty(p.id)}>Delete</ActionBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}
