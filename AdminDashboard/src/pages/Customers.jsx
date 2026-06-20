import { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn } from '../components'

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://primeventra-vrmv.vercel.app/api';

export default function Customers() {
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [rejectedListings, setRejectedListings] = useState([])
  const [soldListings, setSoldListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null) // User object for modal view

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [usersRes, listingsRes, rejectedRes, soldRes] = await Promise.all([
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/listings`),
        fetch(`${API_BASE}/rejected-properties`),
        fetch(`${API_BASE}/sold-properties`)
      ]);

      const [usersData, listingsData, rejectedData, soldData] = await Promise.all([
        usersRes.json(),
        listingsRes.json(),
        rejectedRes.json(),
        soldRes.json()
      ]);

      setUsers(usersData || [])
      setListings(listingsData || [])
      setRejectedListings(rejectedData || [])
      setSoldListings(soldData || [])
    } catch (error) {
      console.error('Error fetching customers data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Helper to parse description values
  const parseDescField = (desc, label) => {
    if (!desc) return '';
    const regex = new RegExp(`${label}:\\s*(.*)`);
    const match = desc.match(regex);
    return match ? match[1].trim() : '';
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter listings by user
  const getUserActivities = (user) => {
    const username = user.username;
    const email = user.email;
    const mobile = user.mobile;

    const matchesUser = (desc) => {
      if (!desc) return false;
      return (
        (username && desc.includes(`Submitted By: ${username}`)) ||
        (email && desc.includes(`Submitted By: ${email}`)) ||
        (mobile && desc.includes(`Submitted By: ${mobile}`))
      );
    };

    const userSubmitted = listings.filter(p => matchesUser(p.description));
    const userRejected = rejectedListings.filter(p => matchesUser(p.description));
    const userSold = [
      ...soldListings.filter(p => matchesUser(p.description)),
      ...userSubmitted.filter(p => p.description && p.description.includes('Status: Sold'))
    ];

    // Filter submitted into Pending and Approved (Available)
    const userPending = userSubmitted.filter(p => p.description && p.description.includes('Status: Pending'));
    const userApproved = userSubmitted.filter(p => !p.description.includes('Status: Pending') && !p.description.includes('Status: Sold'));

    return {
      submittedCount: userSubmitted.length + userRejected.length + userSold.length,
      approved: userApproved,
      pending: userPending,
      rejected: userRejected,
      sold: userSold
    };
  };

  return (
    <div>
      <Panel>
        <PanelHeader title="Customers Status Overview" />
        {isLoading ? (
          <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading customers details...</p>
        ) : users.length === 0 ? (
          <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>No customers registered yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username / Name</th>
                <th>Contact Details</th>
                <th>Member Since</th>
                <th style={{ textAlign: 'center' }}>Total Properties Submitted</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const activities = getUserActivities(u);
                const displayName = u.first_name ? `${u.first_name} ${u.last_name}` : u.username;
                return (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>{u.id}</td>
                    <td>
                      <a
                        onClick={() => setSelectedUser(u)}
                        style={{
                          color: 'var(--color-secondary)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {displayName}
                      </a>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Provider: {u.auth_provider ? u.auth_provider.toUpperCase() : 'LOCAL'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {u.email && <span style={{ fontSize: '12px' }}><i className="bx bx-envelope" style={{ marginRight: '4px' }}></i>{u.email}</span>}
                        {u.mobile && <span style={{ fontSize: '12px' }}><i className="bx bx-phone" style={{ marginRight: '4px' }}></i>{u.mobile}</span>}
                      </div>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{activities.submittedCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      {/* ---------------- CUSTOMER ACTIVITY DETAILS MODAL ---------------- */}
      {selectedUser && (() => {
        const activities = getUserActivities(selectedUser);
        const displayName = selectedUser.first_name ? `${selectedUser.first_name} ${selectedUser.last_name}` : selectedUser.username;
        return (
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
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              color: 'var(--color-on-surface)'
            }}>
              <button 
                onClick={() => setSelectedUser(null)} 
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

              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                {displayName}'s Activity Profile
              </h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Registered via {selectedUser.auth_provider ? selectedUser.auth_provider.toUpperCase() : 'LOCAL'} • Joined {formatDate(selectedUser.created_at)}
              </p>

              {/* Submitted & Approved Listings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Approved Properties Section */}
                <div>
                  <h3 style={{ borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--color-whatsapp)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bx bx-check-shield"></i> Approved Listings ({activities.approved.length})
                  </h3>
                  {activities.approved.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '10px 0' }}>No approved properties.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '12px', marginTop: '10px' }}>
                      {activities.approved.map(p => (
                        <div key={p.id} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '8px', padding: '12px', background: 'var(--color-surface-low)' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{p.title || p.name}</h4>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.city || p.loc} • {p.price} • {p.type}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending Approvals Section */}
                <div>
                  <h3 style={{ borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--color-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bx bx-time"></i> Pending Approvals ({activities.pending.length})
                  </h3>
                  {activities.pending.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '10px 0' }}>No pending submissions.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '12px', marginTop: '10px' }}>
                      {activities.pending.map(p => (
                        <div key={p.id} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '8px', padding: '12px', background: 'var(--color-surface-low)' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{p.title || p.name}</h4>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.city || p.loc} • {p.price} • {p.type}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sold Properties Section */}
                <div>
                  <h3 style={{ borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bx bx-bookmark-heart"></i> Sold Properties ({activities.sold.length})
                  </h3>
                  {activities.sold.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '10px 0' }}>No sold properties.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '12px', marginTop: '10px' }}>
                      {activities.sold.map(p => (
                        <div key={p.id} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '8px', padding: '12px', background: 'var(--color-surface-low)' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{p.title || p.name}</h4>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.city || p.loc} • {p.price} • {p.type}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rejected Properties Section */}
                <div>
                  <h3 style={{ borderBottom: '2px solid var(--color-surface-low)', paddingBottom: '6px', fontSize: '15px', fontWeight: 700, color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bx bx-error-circle"></i> Rejected Submissions ({activities.rejected.length})
                  </h3>
                  {activities.rejected.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '10px 0' }}>No rejected submissions.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '12px', marginTop: '10px' }}>
                      {activities.rejected.map(p => {
                        const reason = parseDescField(p.description, 'Rejection Reason') || 'No reason provided';
                        return (
                          <div key={p.id} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: '8px', padding: '12px', background: 'var(--color-surface-low)' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{p.title || p.name}</h4>
                            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.city || p.loc} • {p.price} • {p.type}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-error)', fontStyle: 'italic' }}>
                              <strong>Reason:</strong> {reason}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-outline-variant)' }}>
                <Btn onClick={() => setSelectedUser(null)}>Close</Btn>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  )
}
