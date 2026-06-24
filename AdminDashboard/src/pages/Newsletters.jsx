import React, { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn, StatCard, Pagination } from '../components'

export default function Newsletters() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const apiBase = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://primeventra-vrmv.vercel.app/api'

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${apiBase}/newsletter/subscribers`)
      const data = await res.json()
      setSubscribers(data || [])
    } catch (err) {
      console.error('Failed to fetch subscribers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleDownloadCSV = async () => {
    try {
      // Fetch latest list to ensure it's fully up-to-date
      const res = await fetch(`${apiBase}/newsletter/subscribers`)
      const latestSubs = await res.json()
      setSubscribers(latestSubs || [])

      if (!latestSubs || latestSubs.length === 0) {
        alert('No subscribers found to download.')
        return
      }

      // Generate CSV content
      const headers = ['ID', 'Email Address', 'Date Subscribed']
      const rows = latestSubs.map((sub, idx) => {
        const d = new Date(sub.created_at)
        const pad = (num) => String(num).padStart(2, '0')
        const dateFormatted = isNaN(d.getTime()) 
          ? '' 
          : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
        return [
          sub.id || idx + 1,
          `"${sub.email.replace(/"/g, '""')}"`,
          `"${dateFormatted}"`
        ]
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to export CSV:', err)
      alert('Error exporting subscribers as CSV.')
    }
  }

  const itemsPerPage = 20
  const totalPages = Math.ceil(subscribers.length / itemsPerPage)
  const paginatedSubscribers = subscribers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Stats Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard 
          type="primary" 
          title="Active Subscribers" 
          number={loading ? '...' : subscribers.length} 
          trend="Subscribed via footer" 
        />
      </div>

      {/* Newsletter Subscribers Table */}
      <Panel>
        <PanelHeader title="Newsletter Subscribers">
          <Btn onClick={handleDownloadCSV} variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <i className="bx bx-download"></i> Download CSV
          </Btn>
        </PanelHeader>

        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading subscribers...</p>
        ) : paginatedSubscribers.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-outline-variant)', borderRadius: '8px' }}>
            No subscribers found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-outline-variant)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--color-primary-dark)', fontWeight: 'bold', width: '80px' }}>#</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>Email Address</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>Date Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscribers.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--color-outline-variant)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '500', color: 'var(--color-on-surface)' }}>
                      {item.email}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </Panel>
    </div>
  )
}
