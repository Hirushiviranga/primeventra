import { useState } from 'react'
import styles from '../styles/Dashboard.module.css'
import { Panel, PanelHeader, Badge, Btn, ActionBtn, PropertyInfo, StatCard, LeadCard } from '../components'
import { useAdmin } from '../context/AdminContext'

export default function Dashboard({ onNav }) {
  const { properties, submissions, enquiries, approveSubmission } = useAdmin()
  const [filterType, setFilterType] = useState('All')

  // Calculate dynamic stats
  const totalProperties = properties.length
  const availableProperties = properties.filter(p => p.status === 'available').length
  const pendingSubmissions = submissions.length
  const newEnquiries = enquiries.filter(e => e.status === 'new-badge' || e.status === 'new').length

  const stats = [
    { type: 'success', title: 'Total Properties',      number: totalProperties, trend: `+${properties.filter(p => p.date.includes('2026') || p.date.includes('2025')).length} active` },
    { type: '',        title: 'Available Properties',  number: availableProperties,  trend: 'Active listings' },
    { type: 'warn',    title: 'Pending Submissions',   number: pendingSubmissions,  trend: 'Need review' },
    { type: 'danger',  title: 'New Enquiries',         number: newEnquiries,         trend: 'Follow-up required' },
  ]

  // Get recent entities filtered by category
  const filteredProperties = properties.filter(p => filterType === 'All' || p.type === filterType)
  const recentProperties = filteredProperties.slice(0, 4)
  const recentEnquiries = enquiries.slice(0, 3)
  const recentSubmissions = submissions.slice(0, 2)

  return (
    <div>
      <div className={styles.statsGrid}>
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      <div className={styles.contentGrid}>
        <div>
          <Panel>
            <PanelHeader title="Recent Property Listings">
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
                  <th>Property</th><th>Location</th><th>Price</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map(r => (
                  <tr key={r.id}>
                    <td><PropertyInfo icon={r.icon} name={r.name} meta={r.meta} /></td>
                    <td>{r.loc}</td>
                    <td>{r.price}</td>
                    <td><Badge type={r.status}>{r.statusText}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div>
          <Panel>
            <PanelHeader title="New Enquiries">
              <Btn variant="light" onClick={() => onNav('enquiries')}>View All</Btn>
            </PanelHeader>
            {recentEnquiries.map(e => (
              <LeadCard key={e.id} name={e.client} message={e.msg} date={e.date} badgeType={e.status} badgeText={e.statusText} />
            ))}
          </Panel>

          <Panel>
            <PanelHeader title="Seller Submissions" />
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map(s => (
                <LeadCard
                  key={s.id}
                  name={s.name}
                  message={s.meta}
                  date="Pending Review"
                  action={<ActionBtn variant="approve" onClick={() => approveSubmission(s.id)}>Approve</ActionBtn>}
                />
              ))
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '10px 0' }}>No pending submissions.</p>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Quick Actions" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn onClick={() => onNav('sell-property')}>+ Add New Property</Btn>
              <Btn variant="secondary" onClick={() => onNav('submissions')}>Review Seller Requests</Btn>
              <Btn variant="light" onClick={() => onNav('enquiries')}>View All Enquiries</Btn>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
