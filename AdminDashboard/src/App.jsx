import { useState } from 'react'
import { Login, AdminLayout } from './components'
import { AdminProvider } from './context/AdminContext'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <AdminProvider>
      {loggedIn ? (
        <AdminLayout onLogout={() => setLoggedIn(false)} />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </AdminProvider>
  )
}


