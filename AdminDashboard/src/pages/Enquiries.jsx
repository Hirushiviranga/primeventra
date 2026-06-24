import React, { useState } from 'react'
import { Panel, PanelHeader, Badge, ActionBtn, Btn, Pagination } from '../components'
import { useAdmin } from '../context/AdminContext'

export default function Enquiries() {
  const { enquiries, replyToEnquiry } = useAdmin()
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [currentNewPage, setCurrentNewPage] = useState(1)
  const [currentConnectedPage, setCurrentConnectedPage] = useState(1)

  if (selectedEnquiry) {
    return (
      <Panel>
        <PanelHeader title="Enquiry Details">
          <Btn variant="light" onClick={() => setSelectedEnquiry(null)}>
            <i className="bx bx-arrow-back" style={{ marginRight: '5px' }}></i> Back to List
          </Btn>
        </PanelHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0', textAlign: 'left' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Client Name</strong>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{selectedEnquiry.client}</span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Contact Details</strong>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{selectedEnquiry.contact}</span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Date Submitted</strong>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary-dark)' }}>{selectedEnquiry.date}</span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Status</strong>
              <Badge type={selectedEnquiry.status}>{selectedEnquiry.statusText}</Badge>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Subject / Property Interest</strong>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{selectedEnquiry.interest}</h3>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '150px' }}>
            <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>Message Details</strong>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line' }}>{selectedEnquiry.message || selectedEnquiry.msg}</p>
          </div>

          {selectedEnquiry.status !== 'reserved' && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Btn variant="primary" onClick={() => { replyToEnquiry(selectedEnquiry.id); setSelectedEnquiry(prev => ({ ...prev, status: 'reserved', statusText: 'Contacted' })); }}>
                <i className="bx bx-reply" style={{ marginRight: '5px' }}></i> Mark as Contacted / Replied
              </Btn>
            </div>
          )}
        </div>
      </Panel>
    )
  }

  const newEnquiries = enquiries.filter(e => e.status !== 'reserved')
  const connectedEnquiries = enquiries.filter(e => e.status === 'reserved')

  const itemsPerPage = 20;
  
  const totalNewPages = Math.ceil(newEnquiries.length / itemsPerPage);
  const paginatedNewList = newEnquiries.slice((currentNewPage - 1) * itemsPerPage, currentNewPage * itemsPerPage);

  const totalConnectedPages = Math.ceil(connectedEnquiries.length / itemsPerPage);
  const paginatedConnectedList = connectedEnquiries.slice((currentConnectedPage - 1) * itemsPerPage, currentConnectedPage * itemsPerPage);

  return (
    <Panel>
      <PanelHeader title="All Enquiries / Leads" />
      
      {/* ---------------- NEW ENQUIRIES TABLE ---------------- */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }}></span>
          New Enquiries ({newEnquiries.length})
        </h3>
        
        {newEnquiries.length === 0 ? (
          <p style={{ padding: '20px 0', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-outline-variant)', borderRadius: '8px' }}>
            No new enquiries.
          </p>
        ) : (
          <>
            <table>
              <thead>
                <tr><th>Client</th><th>Property Interest</th><th>Contact</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginatedNewList.map(r => (
                  <tr key={r.id}>
                    <td>
                      <span 
                        onClick={() => setSelectedEnquiry(r)} 
                        style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 700 }}
                        title="View details"
                      >
                        {r.client}
                      </span>
                    </td>
                    <td>
                      <span 
                        onClick={() => setSelectedEnquiry(r)} 
                        style={{ cursor: 'pointer' }}
                        title="View details"
                      >
                        {r.interest}
                      </span>
                    </td>
                    <td>{r.contact}</td>
                    <td>{r.date}</td>
                    <td><Badge type={r.status}>{r.statusText}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionBtn variant="approve" onClick={() => setSelectedEnquiry(r)} title="View Details">
                          <i className="bx bx-show" style={{ fontSize: '14px' }}></i>
                        </ActionBtn>
                        <ActionBtn variant="reply" onClick={() => replyToEnquiry(r.id)} title="Reply / Contact" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentNewPage} totalPages={totalNewPages} onPageChange={setCurrentNewPage} />
          </>
        )}
      </div>

      {/* ---------------- CONNECTED ENQUIRIES TABLE ---------------- */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a7a3c' }}></span>
          Connected Enquiries ({connectedEnquiries.length})
        </h3>
        
        {connectedEnquiries.length === 0 ? (
          <p style={{ padding: '20px 0', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-outline-variant)', borderRadius: '8px' }}>
            No connected enquiries.
          </p>
        ) : (
          <>
            <table>
              <thead>
                <tr><th>Client</th><th>Property Interest</th><th>Contact</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginatedConnectedList.map(r => (
                  <tr key={r.id}>
                    <td>
                      <span 
                        onClick={() => setSelectedEnquiry(r)} 
                        style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 700 }}
                        title="View details"
                      >
                        {r.client}
                      </span>
                    </td>
                    <td>
                      <span 
                        onClick={() => setSelectedEnquiry(r)} 
                        style={{ cursor: 'pointer' }}
                        title="View details"
                      >
                        {r.interest}
                      </span>
                    </td>
                    <td>{r.contact}</td>
                    <td>{r.date}</td>
                    <td><Badge type={r.status}>{r.statusText}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionBtn variant="approve" onClick={() => setSelectedEnquiry(r)} title="View Details">
                          <i className="bx bx-show" style={{ fontSize: '14px' }}></i>
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentConnectedPage} totalPages={totalConnectedPages} onPageChange={setCurrentConnectedPage} />
          </>
        )}
      </div>
    </Panel>
  )
}
