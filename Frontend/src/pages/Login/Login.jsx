import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/login.css';

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/auth'
  : 'https://primeventra-vrmv.vercel.app/api/auth';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login
  const from = location.state?.from?.pathname || '/list';

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field Validations
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }

    if (isRegister) {
      if (!email.trim()) {
        setError('Email address is required.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const payload = isRegister 
        ? { username: username.trim(), email: email.trim(), password }
        : { username: username.trim(), password };

      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegister) {
        setSuccess('Registration successful! You can now log in.');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        // Save user session
        localStorage.setItem('portalUser', JSON.stringify(data.user));
        
        // Redirect back to requested page
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="login-card__subtitle">
          {isRegister 
            ? 'Sign up to list and manage your properties' 
            : 'Login to access your property listings panel'}
        </p>

        {error && (
          <div className="error-alert">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-alert">
            <span className="material-symbols-outlined">check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined">person</span>
              <input 
                id="username"
                type="text" 
                placeholder="Enter username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">mail</span>
                <input 
                  id="email"
                  type="email" 
                  placeholder="Enter email address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined">lock</span>
              <input 
                id="password"
                type="password" 
                placeholder="Enter password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">lock_reset</span>
                <input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="Confirm password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading 
              ? 'Processing...' 
              : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <p className="login-toggle">
          {isRegister ? 'Already have an account?' : 'New user?'}
          <span onClick={handleToggleMode}>
            {isRegister ? 'Log In' : 'Register Now'}
          </span>
        </p>
      </div>
    </main>
  );
}
