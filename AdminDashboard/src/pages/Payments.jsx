import React, { useState, useEffect } from 'react'
import { Panel, PanelHeader } from '../components'

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

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('All') // 'All', 'Pending', 'Completed'
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)
  
  const [viewingPayment, setViewingPayment] = useState(null)
  const [paymentPropertyDetail, setPaymentPropertyDetail] = useState(null)
  const [paymentUserDetail, setPaymentUserDetail] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [allListings, setAllListings] = useState([])

  const handleViewPaymentDetails = async (payment) => {
    setLoadingDetails(true)
    setViewingPayment(payment)
    setPaymentPropertyDetail(null)
    setPaymentUserDetail(null)

    try {
      const fetchProperty = async () => {
        try {
          const listingsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
            ? 'http://localhost:5000/api/listings'
            : 'https://primeventra-vrmv.vercel.app/api/listings';
          const soldUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
            ? 'http://localhost:5000/api/sold-properties'
            : 'https://primeventra-vrmv.vercel.app/api/sold-properties';
            
          const [listingsRes, soldRes] = await Promise.all([
            fetch(listingsUrl),
            fetch(soldUrl)
          ]);
          
          const listingsData = listingsRes.ok ? await listingsRes.json() : [];
          const soldData = soldRes.ok ? await soldRes.json() : [];
          const allProps = [...listingsData, ...soldData];
          return allProps.find(item => Number(item.id) === Number(payment.listing_id));
        } catch (err) {
          console.warn("Failed to fetch property details:", err);
          return null;
        }
      };

      const fetchUser = async () => {
        if (!payment.username || payment.username === 'Guest') return null;
        try {
          const usersUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
            ? `http://localhost:5000/api/users/${payment.username}`
            : `https://primeventra-vrmv.vercel.app/api/users/${payment.username}`;
          const res = await fetch(usersUrl);
          if (res.ok) {
            return await res.json();
          }
        } catch (err) {
          console.warn("Failed to fetch user profile details:", err);
        }
        return null;
      };

      const [propertyData, userData] = await Promise.all([
        fetchProperty(),
        fetchUser()
      ]);

      setPaymentPropertyDetail(propertyData);
      setPaymentUserDetail(userData);
    } catch (error) {
      console.error("Error loading payment details:", error);
    } finally {
      setLoadingDetails(false);
    }
  }

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

      const listingsUrl = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5000/api/listings'
        : 'https://primeventra-vrmv.vercel.app/api/listings';
      const listingsRes = await fetch(listingsUrl);
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setAllListings(listingsData || []);
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
                  <th style={{ padding: '12px 10px' }}>Transaction ID</th>
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
                    
                    {/* Transaction ID */}
                    <td style={{ padding: '14px 10px', fontSize: '13px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                      {(() => {
                        const relatedListing = allListings.find(item => Number(item.id) === Number(p.listing_id));
                        const txnMatch = relatedListing?.description?.match(/Transaction ID:\s*(\S+)/);
                        return txnMatch ? txnMatch[1] : (p.transaction_id || 'N/A');
                      })()}
                    </td>
                    
                    {/* Property Details */}
                    <td style={{ padding: '14px 10px' }}>
                      <div 
                        onClick={() => handleViewPaymentDetails(p)}
                        style={{ 
                          fontSize: '14px', 
                          fontWeight: '700', 
                          color: 'var(--color-primary)', 
                          cursor: 'pointer', 
                          textDecoration: 'underline' 
                        }}
                        title="Click to view full transaction details"
                      >
                        {p.listing_title}
                      </div>
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

      {/* ---------------- PAYMENT DETAILS MODAL ---------------- */}
      {viewingPayment && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            maxWidth: '750px',
            padding: '24px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            color: 'var(--color-on-surface)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setViewingPayment(null)} 
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

             <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800', borderBottom: '2px solid var(--color-outline-variant)', paddingBottom: '10px' }}>
              Transaction & Property Profile
            </h3>
            {viewingPayment && (
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '18px', fontWeight: '600' }}>
                Transaction ID: <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  {(() => {
                    const txnMatch = paymentPropertyDetail?.description?.match(/Transaction ID:\s*(\S+)/);
                    return txnMatch ? txnMatch[1] : (viewingPayment.transaction_id || 'N/A');
                  })()}
                </span>
              </div>
            )}

            {loadingDetails ? (
              <p style={{ textAlign: 'center', padding: '40px 0', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                Retrieving related database records...
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. User / Contact Details */}
                <div style={{ background: 'var(--color-surface-low)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bx bx-user-circle" style={{ fontSize: '18px' }}></i> Contact Details of User / Submitter
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Username:</strong><br />
                      {viewingPayment.username || 'Guest'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Email:</strong><br />
                      {viewingPayment.email || 'N/A'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Registered Phone:</strong><br />
                      {paymentUserDetail?.mobile || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* 2. Property Details */}
                <div style={{ background: 'var(--color-surface-low)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bx bx-building-house" style={{ fontSize: '18px' }}></i> Property Specifications
                  </h4>
                  
                  {/* Property Photos (if available) */}
                  {paymentPropertyDetail?.photos && Array.isArray(paymentPropertyDetail.photos) && paymentPropertyDetail.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
                      {paymentPropertyDetail.photos.map((url, idx) => (
                        <img 
                          key={idx} 
                          src={url} 
                          alt={`Property ${idx + 1}`} 
                          style={{ height: '80px', width: '120px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-outline-variant)' }} 
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Title:</strong><br />
                      {viewingPayment.listing_title}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Type & Location:</strong><br />
                      {viewingPayment.listing_type} in {paymentPropertyDetail ? `${paymentPropertyDetail.city}, ${paymentPropertyDetail.district}` : 'N/A'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Selling Price:</strong><br />
                      LKR {viewingPayment.listing_price?.toLocaleString()}
                    </div>
                    {paymentPropertyDetail?.bedrooms && (
                      <div>
                        <strong style={{ color: 'var(--color-text-muted)' }}>Specs:</strong><br />
                        {paymentPropertyDetail.bedrooms} Beds | {paymentPropertyDetail.bathrooms} Baths | {paymentPropertyDetail.size_sqft} sqft
                      </div>
                    )}
                    {paymentPropertyDetail?.land_size_perches && (
                      <div>
                        <strong style={{ color: 'var(--color-text-muted)' }}>Land Size:</strong><br />
                        {paymentPropertyDetail.land_size_perches} Perches ({paymentPropertyDetail.land_type})
                      </div>
                    )}
                  </div>

                  {paymentPropertyDetail?.description && (() => {
                    const { mainDesc, features, contacts, admin } = parsePropertyDescription(paymentPropertyDetail.description);
                    return (
                      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'var(--color-surface)', padding: '12px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)' }}>
                          <strong style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>Description</strong>
                          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: 'var(--color-on-surface-variant)' }}>
                            {mainDesc || 'No description provided.'}
                          </p>
                        </div>

                        {features.length > 0 && (
                          <div>
                            <strong style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>Property Features</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                              {features.map((feat, idx) => (
                                <div key={idx} style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{feat.label}</span>
                                  <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{feat.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {contacts.length > 0 && (
                          <div>
                            <strong style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>Contact Details</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                              {contacts.map((c, idx) => (
                                <div key={idx} style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{c.label}</span>
                                  {c.label.toLowerCase() === 'google map link' ? (
                                    <a href={c.value} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--color-secondary)', textDecoration: 'underline' }}>
                                      View Location Map
                                    </a>
                                  ) : (
                                    <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{c.value}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {admin.length > 0 && (
                          <div>
                            <strong style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700 }}>Listing Administration</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                              {admin.map((adm, idx) => (
                                <div key={idx} style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{adm.label}</span>
                                  <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{adm.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* 3. Payment details */}
                <div style={{ background: 'var(--color-surface-low)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: 'var(--color-whatsapp)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bx bx-receipt" style={{ fontSize: '18px' }}></i> Transaction Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Transaction ID:</strong><br />
                      {viewingPayment.id ? (String(viewingPayment.id).startsWith('pay_') ? viewingPayment.id : `pay_${viewingPayment.id}`) : 'N/A'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Method:</strong><br />
                      {viewingPayment.payment_method}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Status:</strong><br />
                      <span style={{
                        backgroundColor: viewingPayment.payment_status === 'Completed' ? '#e6f4ea' : '#fef7e0',
                        color: viewingPayment.payment_status === 'Completed' ? '#137333' : '#b06000',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'inline-block',
                        marginTop: '2px'
                      }}>
                        {viewingPayment.payment_status}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--color-text-muted)' }}>Payment Date:</strong><br />
                      {formatDate(viewingPayment.created_at)}
                    </div>
                    
                    {/* Parse description for Package Chosen & listing fee if available */}
                    {(viewingPayment.package_name || (paymentPropertyDetail && paymentPropertyDetail.description?.match(/Package Chosen:\s*(.+)/))) && (
                      <div>
                        <strong style={{ color: 'var(--color-text-muted)' }}>Package Selected:</strong><br />
                        {viewingPayment.package_name || paymentPropertyDetail.description.match(/Package Chosen:\s*(.+)/)[1]}
                      </div>
                    )}
                    {(viewingPayment.package_price || (paymentPropertyDetail && paymentPropertyDetail.description?.match(/Listing Fee:\s*(.+)/))) && (
                      <div>
                        <strong style={{ color: 'var(--color-text-muted)' }}>Listing Fee Paid:</strong><br />
                        {viewingPayment.package_price ? `LKR ${Number(viewingPayment.package_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : paymentPropertyDetail.description.match(/Listing Fee:\s*(.+)/)[1]}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    onClick={() => setViewingPayment(null)}
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
                    Close Transaction Details
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
