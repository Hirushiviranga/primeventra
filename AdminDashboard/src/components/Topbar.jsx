import styles from '../styles/Topbar.module.css'

export default function Topbar({ title, subtitle, onLogout }) {
  return (
    <div className={styles.topbar}>
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className={styles.profile}>
        <strong>Admin User</strong>
        <span>admin@primeventra.com</span>
        <button className={styles.logout} onClick={onLogout}>
          <i className="bx bx-log-out"></i> Sign Out
        </button>
      </div>
    </div>
  )
}
