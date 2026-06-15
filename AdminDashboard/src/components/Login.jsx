import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import logoImg from '../assets/logo2.png'
import styles from '../styles/Login.module.css'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const { adminPassword } = useAdmin()

  const handleLogin = () => {
    if (email === 'admin@primeventra.com' && password === adminPassword) {
      setError(false)
      onLogin()
    } else {
      setError(true)
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.box}>
        <div className={styles.logo}>
          <img src={logoImg} className={styles.logoImg} alt="Prime Ventra Logo" />
        </div>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.desc}>Sign in to manage your properties and listings.</p>

        <div className={styles.field}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="admin@primeventra.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button className={styles.btn} onClick={handleLogin}>
          Sign In to Dashboard
        </button>

        {error && (
          <p className={styles.error}>Invalid email or password. Try again.</p>
        )}
      </div>
    </div>
  )
}
