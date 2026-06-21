import { NAV } from '../constants/navigation'
import logoImg from '../assets/logo1.png'
import styles from '../styles/Sidebar.module.css'

export default function Sidebar({ active, onNav, onLogout, isOpen, onClose, counts }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close sidebar">
        <i className="bx bx-x"></i>
      </button>
      <div className={styles.logo}>
        <img src={logoImg} className={styles.logoImg} alt="Prime Ventra Logo" />
      </div>
      <nav className={styles.menu}>
        {NAV.map(group => (
          <div key={group.label}>
            <div className={styles.label}>{group.label}</div>
            {group.items.map(item => {
              const countVal = counts ? counts[item.id] : null;
              return (
                <a
                  key={item.id}
                  className={active === item.id ? styles.active : ''}
                  onClick={() => onNav(item.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={`${item.icon} ${styles.icon}`}></i>
                    {item.text}
                  </span>
                  {countVal !== undefined && countVal !== null && countVal > 0 && (
                    <span style={{
                      backgroundColor: item.id === 'submissions' || item.id === 'payments' ? 'var(--color-error)' : 'var(--color-surface-container)',
                      color: item.id === 'submissions' || item.id === 'payments' ? '#fff' : 'var(--color-text-muted)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      minWidth: '22px',
                      textAlign: 'center'
                    }}>
                      {countVal}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
        <div className={styles.label} />
        <a onClick={onLogout}>
          <i className={`bx bx-log-out ${styles.icon}`}></i>
          Logout
        </a>
      </nav>
    </aside>
  )
}
