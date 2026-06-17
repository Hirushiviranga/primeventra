import { Panel, PanelHeader, Badge, ActionBtn } from '../components'
import { useAdmin } from '../context/AdminContext'

export default function Enquiries() {
  const { enquiries, replyToEnquiry } = useAdmin()

  return (
    <Panel>
      <PanelHeader title="All Enquiries / Leads" />
      <table>
        <thead>
          <tr><th>Client</th><th>Property Interest</th><th>Contact</th><th>Date</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {enquiries.map(r => (
            <tr key={r.id}>
              <td><strong>{r.client}</strong></td>
              <td>{r.interest}</td>
              <td>{r.contact}</td>
              <td>{r.date}</td>
              <td><Badge type={r.status}>{r.statusText}</Badge></td>
              <td>
                {r.status !== 'reserved' && (
                  <ActionBtn variant="reply" onClick={() => replyToEnquiry(r.id)} title="Reply" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}
