import { NAV } from '../constants/navigation'
import logoImg from '../assets/logo1.png'
import styles from '../styles/Sidebar.module.css'

export default function Sidebar({ active, onNav, onLogout }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={logoImg} className={styles.logoImg} alt="Prime Ventra Logo" />
      </div>
      <nav className={styles.menu}>
        {NAV.map(group => (
          <div key={group.label}>
            <div className={styles.label}>{group.label}</div>
            {group.items.map(item => (
              <a
                key={item.id}
                className={active === item.id ? styles.active : ''}
                onClick={() => onNav(item.id)}
              >
                <i className={`${item.icon} ${styles.icon}`}></i>
                {item.text}
              </a>
            ))}
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
