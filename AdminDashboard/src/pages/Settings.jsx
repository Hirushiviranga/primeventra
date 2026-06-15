import { useState } from 'react'
import { Panel, PanelHeader, Btn } from '../components'
import { useAdmin } from '../context/AdminContext'
import styles from '../styles/Settings.module.css'

export default function Settings({ onSave }) {
  const { changePassword } = useAdmin()
  
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPass || !newPass || !confirmPass) {
      setError('All fields are required.')
      return
    }

    if (newPass !== confirmPass) {
      setError('New passwords do not match.')
      return
    }

    if (newPass.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    const res = changePassword(currentPass, newPass)
    if (res.success) {
      setSuccess(res.message)
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
      if (onSave) onSave()
    } else {
      setError(res.message)
    }
  }

  return (
    <div className={styles.grid}>
      {/* Change Password Card */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <i className="bx bx-lock-open-alt"></i>
          Change Admin Password
        </div>
        
        <form onSubmit={handlePasswordChange} className={styles.fieldGroup}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label>Current Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={currentPass} 
              onChange={e => setCurrentPass(e.target.value)} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label>New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={newPass} 
              onChange={e => setNewPass(e.target.value)} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label>Confirm New Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPass} 
              onChange={e => setConfirmPass(e.target.value)} 
            />
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          <div className={styles.actions}>
            <Btn variant="primary" type="submit">Update Password</Btn>
          </div>
        </form>
      </div>

      {/* System Configurations Card */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <i className="bx bx-cog"></i>
          General Preferences
        </div>
        
        <div className={styles.fieldGroup}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label>System Email Address</label>
            <input type="email" defaultValue="admin@primeventra.com" disabled />
            <small style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>System emails are configured by deployment hooks.</small>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label>Notification Alerts</label>
            <select defaultValue="all">
              <option value="all">All notifications (Submissions, Enquiries)</option>
              <option value="subs">Seller submissions only</option>
              <option value="none">Mute all notification alerts</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label>Default Currency</label>
            <select defaultValue="lkr">
              <option value="lkr">Sri Lankan Rupee (LKR)</option>
              <option value="usd">US Dollar (USD)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
