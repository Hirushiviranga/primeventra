import React, { useState, useEffect } from 'react'
import { Panel, PanelHeader, Btn, StatCard } from '../components'

export default function Newsletters({ triggerToast }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [newsletters, setNewsletters] = useState([])
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState(null)

  const apiBase = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://primeventra-vrmv.vercel.app/api'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [lettersRes, subsRes] = await Promise.all([
        fetch(`${apiBase}/newsletters`).then(r => r.json()),
        fetch(`${apiBase}/newsletter/subscribers`).then(r => r.json())
      ])
      setNewsletters(lettersRes || [])
      setSubscribersCount(subsRes ? subsRes.length : 0)
    } catch (err) {
      console.error('Failed to fetch newsletter data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSending(true)
    try {
      const response = await fetch(`${apiBase}/newsletter/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      })

      const data = await response.json()
      if (response.ok) {
        triggerToast('✅ Newsletter sent successfully!')
        setTitle('')
        setContent('')
        // Refresh data
        fetchData()
      } else {
        alert(data.error || 'Failed to send newsletter.')
      }
    } catch (err) {
      console.error('Failed to send newsletter:', err)
      alert('Error connecting to the server.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Stats Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard 
          type="primary" 
          title="Active Subscribers" 
          number={loading ? '...' : subscribersCount} 
          trend="Subscribed via footer" 
        />
        <StatCard 
          type="success" 
          title="Newsletters Sent" 
          number={loading ? '...' : newsletters.length} 
          trend="Saved in database" 
        />
      </div>

      {/* Newsletter Creation Form */}
      <Panel>
        <PanelHeader title="Compose Newsletter" />
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>Subject / Title *</label>
            <input 
              type="text" 
              placeholder="Enter newsletter subject..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={sending}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-on-surface)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>Content *</label>
            <textarea 
              placeholder="Type your newsletter body content here... (supports multi-line texts)"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={10}
              disabled={sending}
              style={{
                width: '100%',
                padding: '12px',
                border: '1.5px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-on-surface)',
                fontSize: '14px',
                lineHeight: '1.6',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <Btn type="submit" variant="primary" disabled={sending} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <i className={sending ? "bx bx-loader-alt bx-spin" : "bx bx-send"}></i>
              {sending ? 'Sending Newsletter...' : 'Send Newsletter'}
            </Btn>
          </div>
        </form>
      </Panel>

      {/* Sent Newsletter History */}
      <Panel>
        <PanelHeader title="Sent Newsletters History" />
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading history...</p>
        ) : newsletters.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-outline-variant)', borderRadius: '8px' }}>
            No newsletters sent yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-outline-variant)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>Subject</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>Content Snippet</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>Date Sent</th>
                </tr>
              </thead>
              <tbody>
                {newsletters.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-outline-variant)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>
                      <span 
                        onClick={() => setSelectedLetter(item)} 
                        style={{ color: 'var(--color-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Click to view newsletter"
                      >
                        {item.title}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.content}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Modal for viewing selected newsletter */}
      {selectedLetter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => setSelectedLetter(null)}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            width: '600px',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxHeight: '85vh',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-outline-variant)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                Newsletter Details
              </h3>
              <button 
                onClick={() => setSelectedLetter(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
                aria-label="Close"
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            {/* Modal Content Area */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'left'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Subject</strong>
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary-dark)' }}>{selectedLetter.title}</span>
              </div>
              
              <div>
                <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Date Sent</strong>
                <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{new Date(selectedLetter.created_at).toLocaleString()}</span>
              </div>

              <div style={{
                borderTop: '1px solid var(--color-outline-variant)',
                paddingTop: '16px',
                marginTop: '8px'
              }}>
                <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Newsletter Content</strong>
                <div style={{
                  background: 'var(--color-surface-container)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-outline-variant)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--color-on-surface)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {selectedLetter.content}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-outline-variant)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--color-surface-container-low)',
              borderBottomLeftRadius: 'var(--radius-lg)',
              borderBottomRightRadius: 'var(--radius-lg)'
            }}>
              <Btn variant="primary" onClick={() => setSelectedLetter(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
