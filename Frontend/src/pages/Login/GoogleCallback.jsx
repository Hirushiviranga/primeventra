import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../styles/login.css';

const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/auth'
  : 'https://primeventra-vrmv.vercel.app/api/auth';

// Module level variables to share the exchange promise and avoid duplicate calls
let activeExchangePromise = null;
let activeCode = null;

const exchangeCode = async (code, redirectUri) => {
  if (activeCode === code && activeExchangePromise) {
    return activeExchangePromise;
  }

  activeCode = code;
  activeExchangePromise = (async () => {
    const res = await fetch(`${API_BASE}/google-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to exchange authorization code.');
    }
    return data;
  })();

  return activeExchangePromise;
};

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    const code = searchParams.get('code');
    if (!code) {
      if (active) setError('Authorization code missing from URL.');
      return;
    }

    const runExchange = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const data = await exchangeCode(code, redirectUri);

        if (active) {
          sessionStorage.setItem('portalUser', JSON.stringify(data.user));
          setSuccess('Successfully authenticated with Google!');

          let redirectTarget = '/list';
          let redirectState = null;
          const storedRedirect = sessionStorage.getItem('authRedirect');
          if (storedRedirect) {
            try {
              const parsed = JSON.parse(storedRedirect);
              if (parsed && typeof parsed === 'object') {
                redirectTarget = parsed.pathname || '/list';
                redirectState = parsed.state || null;
              } else if (typeof parsed === 'string') {
                redirectTarget = parsed;
              }
            } catch (e) {
              console.error('Error parsing stored authRedirect:', e);
            }
            sessionStorage.removeItem('authRedirect');
          }

          setTimeout(() => {
            if (active) {
              navigate(redirectTarget, { replace: true, state: redirectState });
            }
          }, 1500);
        }
      } catch (err) {
        console.error('Google callback error:', err);
        if (active) setError(err.message || 'An error occurred during Google authentication.');
      }
    };

    runExchange();

    return () => {
      active = false;
    };
  }, [searchParams, navigate]);

  return (
    <main className="login-page">
      <div className="login-card" style={{ minHeight: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {!error && !success && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="spinner-oauth"></div>
            <h1 className="login-card__title" style={{ fontSize: 'var(--text-lg)', marginBottom: 0 }}>Verifying credentials...</h1>
            <p className="login-card__subtitle" style={{ marginBottom: 0 }}>Please wait while we secure your session.</p>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
            <div className="error-alert" style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
            <button onClick={() => navigate('/login')} className="login-btn" style={{ maxWidth: '200px' }}>
              Back to Login
            </button>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
            <div className="success-alert" style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
            <p className="login-card__subtitle" style={{ marginBottom: 0 }}>Redirecting you to the portal...</p>
          </div>
        )}
      </div>
    </main>
  );
}
