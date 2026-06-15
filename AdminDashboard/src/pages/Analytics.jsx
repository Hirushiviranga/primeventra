import styles from '../styles/Analytics.module.css'
import { Panel, PanelHeader } from '../components'

const WEEKLY_LEADS = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 19 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 28 },
  { day: 'Fri', count: 22 },
  { day: 'Sat', count: 14 },
  { day: 'Sun', count: 9 },
]

const CATEGORY_DATA = [
  { name: 'Houses', percentage: 48, count: 60, color: 'var(--color-primary)' },
  { name: 'Apartments', percentage: 28, count: 35, color: 'var(--color-secondary)' },
  { name: 'Lands', percentage: 24, count: 29, color: 'var(--color-tertiary)' },
]

const RINGS = [
  { label: 'Lead Conversion', value: 72, color: 'var(--color-secondary)', desc: '72% of leads contacted' },
  { label: 'Approval Rate', value: 91, color: 'var(--color-whatsapp)', desc: '91% submissions approved' },
  { label: 'Featured Engagement', value: 64, color: 'var(--color-tertiary)', desc: '64% click-through rate' }
]

export default function Analytics() {
  const maxLeads = Math.max(...WEEKLY_LEADS.map(l => l.count))

  return (
    <div>
      <div className={styles.grid}>
        <div>
          {/* Weekly Leads Chart */}
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h3>Weekly Enquiries Trend</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Last 7 Days</span>
            </div>
            <div className={styles.chartBody}>
              <div className={styles.gridLines}>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
                <div className={styles.gridLine}></div>
              </div>
              {WEEKLY_LEADS.map(l => {
                const heightPercent = `${(l.count / maxLeads) * 85}%`
                return (
                  <div key={l.day} className={styles.barWrapper}>
                    <div className={styles.barValue}>{l.count}</div>
                    <div
                      className={styles.bar}
                      style={{ height: heightPercent }}
                    ></div>
                    <div className={styles.barLabel}>{l.day}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Listings Distribution */}
          <Panel>
            <PanelHeader title="Listings Category Split" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
              {CATEGORY_DATA.map(c => (
                <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{c.name}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{c.count} listings ({c.percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-surface-low)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.percentage}%`, background: c.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div>
          {/* Visual Progress Rings */}
          <Panel>
            <PanelHeader title="Conversion Rates" />
            <div className={styles.statRings}>
              {RINGS.map(r => (
                <div key={r.label} className={styles.ringItem}>
                  <div
                    className={styles.ring}
                    style={{
                      background: `conic-gradient(${r.color} ${r.value}%, var(--color-surface-container) 0)`
                    }}
                  >
                    <div className={styles.ringInner}>{r.value}%</div>
                  </div>
                  <div className={styles.ringDetails}>
                    <strong>{r.label}</strong>
                    <span>{r.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Quick Insights */}
          <Panel>
            <PanelHeader title="Monthly Insights" />
            <ul style={{ paddingLeft: '16px', fontSize: '13px', color: 'var(--color-on-surface-variant)', lineHeight: 1.8 }}>
              <li>Colombo listings have the highest enquiry rates.</li>
              <li>Featured properties are clicked 3.4x more than standard ones.</li>
              <li>Seller response times improved by 14% this week.</li>
              <li>Apartment demand is up 8% in Rajagiriya region.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
