import { useEffect, useState } from 'react'
import { registerAlertListener } from '../utils/alertModalStore'

export default function AlertModal() {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    registerAlertListener((msg) => setMessage(msg))
    return () => registerAlertListener(null)
  }, [])

  if (!message) return null

  return (
    <div
      onClick={() => setMessage(null)}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '28px 32px',
          maxWidth: '380px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
        }}
      >
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#1a1a1a', lineHeight: 1.5 }}>
          {message}
        </p>
        <button
          onClick={() => setMessage(null)}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 32px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}
