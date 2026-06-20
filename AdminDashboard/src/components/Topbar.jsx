import styles from '../styles/Topbar.module.css'

export default function Topbar({ title, subtitle, onLogout, onToggleSidebar }) {
  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.toggleBtn} onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <i className="bx bx-menu"></i>
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
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
