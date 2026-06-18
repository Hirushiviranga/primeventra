import React, { useState, useEffect } from 'react'
import { Panel, PanelHeader } from '../components'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('All') // 'All', 'Pending', 'Completed'
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/payments'
        : 'https://primeventra-vrmv.vercel.app/api/payments';
      const res = await fetch(paymentsUrl)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setPayments(data)
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleToggleStatus = async (payment) => {
    setTogglingId(payment.id)
    const newStatus = payment.payment_status === 'Completed' ? 'Pending' : 'Completed'
    
    try {
      const paymentsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? `http://localhost:5000/api/payments/${payment.listing_id}/pay`
        : `https://primeventra-vrmv.vercel.app/api/payments/${payment.listing_id}/pay`;
      
      const res = await fetch(paymentsUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        // Update local state
        setPayments(prev => prev.map(p => {
          if (p.id === payment.id) {
            return { ...p, payment_status: newStatus }
          }
          return p
        }))
      } else {
        alert('Failed to update payment status.')
      }
    } catch (error) {
      console.error('Error toggling payment status:', error)
      alert('Error updating payment status.')
    } finally {
      setTogglingId(null)
    }
  }

  const filteredPayments = payments.filter(p => {
    if (filter === 'Pending') return p.payment_status === 'Pending'
    if (filter === 'Completed') return p.payment_status === 'Completed'
    return true
  })

  const getStatusBadgeStyle = (status) => {
    if (status === 'Completed') {
      return {
        backgroundColor: '#e6f4ea',
        color: '#137333',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        display: 'inline-block'
      }
    }
    return {
      backgroundColor: '#fef7e0',
      color: '#b06000',
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'inline-block'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div>
      <Panel>
        <PanelHeader title="Payment Transactions Management" />

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['All', 'Pending', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid var(--color-outline-variant)',
                background: filter === f ? 'var(--color-secondary)' : 'var(--color-surface)',
                color: filter === f ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-label)'
              }}
            >
              {f} Payments ({payments.filter(p => f === 'All' || p.payment_status === f).length})
            </button>
          ))}
        </div>

        {isLoading ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
            Loading payment records...
          </p>
        ) : filteredPayments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-outline-variant)' }}>
                  <th style={{ padding: '12px 10px' }}>Payment ID</th>
                  <th style={{ padding: '12px 10px' }}>Property Details</th>
                  <th style={{ padding: '12px 10px' }}>User Details</th>
                  <th style={{ padding: '12px 10px' }}>Payment Method</th>
                  <th style={{ padding: '12px 10px' }}>Payment Status</th>
                  <th style={{ padding: '12px 10px' }}>Transaction Date</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                    {/* Payment ID */}
                    <td style={{ padding: '14px 10px', fontSize: '13px', fontWeight: 'bold' }}>
                      {p.id ? (String(p.id).startsWith('pay_') ? p.id : `pay_${p.id}`) : 'N/A'}
                    </td>
                    
                    {/* Property Details */}
                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)' }}>{p.listing_title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        ID: {p.listing_id} | Type: {p.listing_type} | Price: LKR {p.listing_price?.toLocaleString()}
                      </div>
                    </td>
                    
                    {/* User Details */}
                    <td style={{ padding: '14px 10px', fontSize: '13px' }}>
                      <div style={{ fontWeight: '600' }}>{p.username || 'Guest'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.email || 'No Email'}</div>
                    </td>
                    
                    {/* Payment Method */}
                    <td style={{ padding: '14px 10px', fontSize: '13px', fontWeight: '500' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className={p.payment_method === 'Online Payment' ? 'bx bx-credit-card' : 'bx bx-bank'} style={{ fontSize: '18px', color: 'var(--color-primary-light)' }}></i>
                        {p.payment_method}
                      </span>
                    </td>
                    
                    {/* Payment Status */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={getStatusBadgeStyle(p.payment_status)}>
                        {p.payment_status}
                      </span>
                    </td>
                    
                    {/* Transaction Date */}
                    <td style={{ padding: '14px 10px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {formatDate(p.created_at)}
                    </td>
                    
                    {/* Admin Action */}
                    <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                      {p.payment_method === 'Bank Transfer' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                            {p.payment_status === 'Completed' ? 'Payment Added' : 'Pending Verification'}
                          </span>
                          
                          {/* Premium CSS Styled Toggle Switch */}
                          <label style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '42px',
                            height: '22px',
                            cursor: togglingId === p.id ? 'wait' : 'pointer'
                          }}>
                            <input 
                              type="checkbox"
                              checked={p.payment_status === 'Completed'}
                              disabled={togglingId === p.id}
                              onChange={() => handleToggleStatus(p)}
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: p.payment_status === 'Completed' ? '#137333' : '#b06000',
                              transition: '0.3s',
                              borderRadius: '34px',
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)'
                            }}>
                              <span style={{
                                position: 'absolute',
                                content: '""',
                                height: '16px',
                                width: '16px',
                                left: p.payment_status === 'Completed' ? '22px' : '4px',
                                bottom: '3px',
                                backgroundColor: 'white',
                                transition: '0.3s',
                                borderRadius: '50%',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                              }}></span>
                            </span>
                          </label>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#137333', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <i className="bx bx-shield-quarter" style={{ fontSize: '14px' }}></i> Auto-verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No payment transactions recorded.
          </p>
        )}
      </Panel>
    </div>
  )
}
