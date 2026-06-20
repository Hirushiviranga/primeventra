import styles from '../styles/UI.module.css'

export function Panel({ children, className = '' }) {
  return <div className={`${styles.panel} ${className}`}>{children}</div>
}

export function PanelHeader({ title, children }) {
  return (
    <div className={styles.panelHeader}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  )
}

export function Badge({ type, children }) {
  const badgeClass = `${styles.badge} ${styles[type] || ''}`
  return <span className={badgeClass}>{children}</span>
}

export function Button({ variant = 'primary', onClick, children, title, className = '', ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children || title}
    </button>
  )
}
export { Button as Btn }

const ACTION_ICONS = {
  edit: 'bx bx-edit-alt',
  delete: 'bx bx-trash',
  approve: 'bx bx-check-circle',
  reject: 'bx bx-x-circle',
  reply: 'bx bx-reply',
  remove: 'bx bx-minus-circle'
}

export function ActionBtn({ variant, onClick, children }) {
  const iconClass = ACTION_ICONS[variant] || ''
  return (
    <button
      className={`${styles.actionBtn} ${styles[variant] || ''}`}
      onClick={onClick}
    >
      {iconClass && <i className={iconClass}></i>}
      {children}
    </button>
  )
}

export function PropertyInfo({ icon, name, meta, onClickName }) {
  return (
    <div className={styles.propertyInfo}>
      <div className={styles.propertyImg}>
        <i className={icon || 'bx bx-building'}></i>
      </div>
      <div>
        {onClickName ? (
          <span
            onClick={onClickName}
            style={{ color: 'var(--color-secondary)', cursor: 'pointer', display: 'block', marginBottom: '2px', fontWeight: 700 }}
            hover-style={{ textDecoration: 'underline' }}
          >
            {name}
          </span>
        ) : (
          <strong>{name}</strong>
        )}
        <small>{meta}</small>
      </div>
    </div>
  )
}

export function StatCard({ type, title, number, trend }) {
  return (
    <div className={`${styles.statCard} ${styles[type] || ''}`}>
      <h3>{title}</h3>
      <div className={styles.number}>{number}</div>
      <div className={styles.trend}>{trend}</div>
    </div>
  )
}

export function LeadCard({ name, message, date, badgeType, badgeText, action }) {
  return (
    <div className={styles.leadCard}>
      <h4>{name}</h4>
      <p>{message}</p>
      <div className={styles.leadMeta}>
        <span>{date}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {badgeType && <Badge type={badgeType}>{badgeText}</Badge>}
          {action}
        </div>
      </div>
    </div>
  )
}

export function FormGroup({ label, sinhala, full, children }) {
  return (
    <div className={`${styles.formGroup} ${full ? styles.full : ''}`}>
      <label>{label}</label>
      {sinhala && <span className={styles.labelSinhala}>{sinhala}</span>}
      {children}
    </div>
  )
}

export function SectionDivider({ children }) {
  return <div className={styles.sectionDivider}>{children}</div>
}

export function ImageUploadZone({ label, multiple = false }) {
  const handleClick = (e) => {
    e.currentTarget.querySelector('input').click()
  }

  return (
    <div className={styles.imgUploadZone} onClick={handleClick}>
      <div className={styles.uzIcon}>
        <i className="bx bx-image-add"></i>
      </div>
      <p>{label}</p>
      <input type="file" accept="image/*" multiple={multiple} style={{ display: 'none' }} />
    </div>
  )
}
