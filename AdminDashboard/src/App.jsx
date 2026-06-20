import { useState } from 'react'
import { Login, AdminLayout } from './components'
import { AdminProvider } from './context/AdminContext'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true'
  })

  const handleLogin = () => {
    setLoggedIn(true)
    localStorage.setItem('adminLoggedIn', 'true')
  }

  const handleLogout = () => {
    setLoggedIn(false)
    localStorage.removeItem('adminLoggedIn')
  }

  return (
    <AdminProvider>
      {loggedIn ? (
        <AdminLayout onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </AdminProvider>
  )
}
