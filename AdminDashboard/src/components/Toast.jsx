import styles from '../styles/Toast.module.css'

export default function Toast({ visible, message }) {
  return (
    <div className={`${styles.toast} ${visible ? styles.show : ''}`}>
      {message}
    </div>
  )
}
