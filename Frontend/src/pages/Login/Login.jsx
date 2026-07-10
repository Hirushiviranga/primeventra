import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { COUNTRY_CODES, validatePhoneNumber } from '../../constants/countries';
import '../../styles/login.css';

const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api/auth'
  : 'https://primeventra-vrmv.vercel.app/api/auth';

const CountrySelector = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedCountry = COUNTRY_CODES.find(c => c.iso === value) || COUNTRY_CODES[0];

  const handleSelect = (iso) => {
    if (disabled) return;
    onChange(iso);
    setIsOpen(false);
  };

  const filteredCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.includes(searchTerm)
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          paddingRight: '8px',
          borderRight: '1px solid var(--color-outline-variant)',
          marginRight: '10px'
        }}
      >
        <img 
          src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
          alt={selectedCountry.name}
          style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
        />
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-muted)' }}>{selectedCountry.code}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginLeft: '-2px' }}>
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '130%',
            left: 0,
            zIndex: 9999,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            maxHeight: '220px',
            overflowY: 'auto',
            width: '210px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', padding: '6px', borderBottom: '1px solid var(--color-outline-variant)' }}>
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                boxSizing: 'border-box'
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredCountries.map(c => (
              <div 
                key={`${c.iso}-${c.code}`}
                onClick={() => handleSelect(c.iso)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: c.iso === value ? 'var(--color-surface-container)' : 'transparent',
                  textAlign: 'left'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = c.iso === value ? 'var(--color-surface-container)' : 'transparent'}
              >
                <img 
                  src={`https://flagcdn.com/w40/${c.iso}.png`} 
                  alt={c.name}
                  style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '13px', color: 'var(--color-on-surface)' }}>{c.name} ({c.code})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileCountryCode, setMobileCountryCode] = useState('lk');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  // Register methods & steps
  const [registerMethod, setRegisterMethod] = useState('email'); // 'email' | 'mobile'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerMobileStep, setRegisterMobileStep] = useState(1); // 1: enter phone, 2: enter OTP, 3: enter name
  const [registerMobileOtp, setRegisterMobileOtp] = useState('');

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email/mobile, 2: OTP verify, 3: new password
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login
  const from = location.state?.from || '/list';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMobileNumber('');
    setFirstName('');
    setLastName('');
    setRegisterMobileStep(1);
    setRegisterMobileOtp('');
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccess('');
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    resetForm();
  };

  const handleGoogleLogin = () => {
    setError('');
    setSuccess('');
    // Store redirect location and state in sessionStorage so we can retrieve it in GoogleCallback
    if (location.state?.from) {
      sessionStorage.setItem('authRedirect', JSON.stringify(location.state.from));
    } else {
      sessionStorage.removeItem('authRedirect');
    }
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1043838029561-8g9bflk1r3e7gsc7vld4h9j8h0d3rfe8.apps.googleusercontent.com',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  // Submit handler for local login and local email-based registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegister) {
      if (!email.trim() || !password || !firstName.trim() || !lastName.trim() || !mobileNumber.trim()) {
        setError('All fields (including first name, last name, and mobile number) are required.');
        return;
      }
      if (!validatePhoneNumber(mobileNumber, mobileCountryCode)) {
        const dialCode = COUNTRY_CODES.find(c => c.iso === mobileCountryCode)?.code || '';
        setError(`Please enter a valid mobile number belonging to the selected country (${dialCode}).`);
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

      const dialCode = COUNTRY_CODES.find(c => c.iso === mobileCountryCode)?.code || '';
      const cleanNum = mobileNumber.replace(/[\s\-\(\)]/g, '');
      const numWithoutLeadingZero = cleanNum.startsWith('0') ? cleanNum.substring(1) : cleanNum;
      const fullMobileNumber = `${dialCode}${numWithoutLeadingZero}`;

      setLoading(true);
      try {
        const payload = { 
          email: email.trim(), 
          password, 
          first_name: firstName.trim(), 
          last_name: lastName.trim(),
          mobile: fullMobileNumber
        };
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setIsRegister(false);
        resetForm();
        setSuccess('Registration successful! You can now log in.');
      } catch (err) {
        console.error('Email Registration error:', err);
        setError(err.message || 'An error occurred during registration.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password) {
        setError('Email and password are required.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        sessionStorage.setItem('portalUser', JSON.stringify(data.user));
        if (typeof from === 'object') {
          navigate(from.pathname || '/list', { replace: true, state: from.state });
        } else {
          navigate(from, { replace: true });
        }
      } catch (err) {
        console.error('Login error:', err);
        setError(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Mobile OTP signup functions
  const handleGoBackToStep1 = () => {
    if (mobileNumber.startsWith('+')) {
      const cleanedMobile = mobileNumber.replace(/\s+/g, '');
      const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
      const matched = sortedCodes.find(c => cleanedMobile.startsWith(c.code));
      if (matched) {
        setMobileCountryCode(matched.iso);
        setMobileNumber(cleanedMobile.substring(matched.code.length));
      }
    }
    setRegisterMobileStep(1);
  };

  const handleMobileSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!mobileNumber.trim()) {
      setError('Mobile number is required.');
      return;
    }
    if (!validatePhoneNumber(mobileNumber, mobileCountryCode)) {
      const dialCode = COUNTRY_CODES.find(c => c.iso === mobileCountryCode)?.code || '';
      setError(`Please enter a valid mobile number belonging to the selected country (${dialCode}).`);
      return;
    }

    const dialCode = COUNTRY_CODES.find(c => c.iso === mobileCountryCode)?.code || '';
    const cleanNum = mobileNumber.replace(/[\s\-\(\)]/g, '');
    const numWithoutLeadingZero = cleanNum.startsWith('0') ? cleanNum.substring(1) : cleanNum;
    const fullMobileNumber = `${dialCode}${numWithoutLeadingZero}`;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mobile/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: fullMobileNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      setMobileNumber(fullMobileNumber);
      setSuccess('Verification code sent! (Check the backend terminal console)');
      setRegisterMobileStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!registerMobileOtp.trim()) {
      setError('OTP code is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mobile/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobileNumber.trim(), otpCode: registerMobileOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed.');

      setSuccess('OTP verified successfully!');
      if (data.isRegistered) {
        // Log them in immediately if already registered
        sessionStorage.setItem('portalUser', JSON.stringify(data.user));
        setTimeout(() => {
          if (typeof from === 'object') {
            navigate(from.pathname || '/list', { replace: true, state: from.state });
          } else {
            navigate(from, { replace: true });
          }
        }, 1000);
      } else {
        // Proceed to gather names if they are a new user
        setRegisterMobileStep(3);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileCompleteRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mobile/complete-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobileNumber: mobileNumber.trim(), 
          first_name: firstName.trim(), 
          last_name: lastName.trim() 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete registration.');

      setSuccess('Account created successfully!');
      sessionStorage.setItem('portalUser', JSON.stringify(data.user));
      setTimeout(() => {
        if (typeof from === 'object') {
          navigate(from.pathname || '/list', { replace: true, state: from.state });
        } else {
          navigate(from, { replace: true });
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (forgotStep === 1) {
        if (!email.trim() || !mobileNumber.trim()) {
          setError('Email and mobile number are required.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), mobileNumber: mobileNumber.trim() }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');

        setSuccess('OTP verification code generated! Check terminal console.');
        setForgotStep(2);
      } else if (forgotStep === 2) {
        if (!otpCode.trim()) {
          setError('OTP code is required.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), mobileNumber: mobileNumber.trim(), otpCode: otpCode.trim() }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid OTP code.');

        setSuccess('OTP verified! Choose a new password.');
        setForgotStep(3);
      } else if (forgotStep === 3) {
        if (!newPassword || !confirmNewPassword) {
          setError('Please fill in both password fields.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (newPassword.length < 4) {
          setError('Password must be at least 4 characters long.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), otpCode: otpCode.trim(), newPassword }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password.');

        setSuccess('Password reset successfully! You can now log in.');
        setIsForgotPassword(false);
        setForgotStep(1);
        resetForm();
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <main className="login-page">
        <div className="login-card">
          <h1 className="login-card__title">
            {forgotStep === 1 ? 'Forgot Password' : forgotStep === 2 ? 'Verify OTP' : 'Reset Password'}
          </h1>
          <p className="login-card__subtitle">
            {forgotStep === 1 
              ? 'Enter email & registered mobile number' 
              : forgotStep === 2 
                ? 'Enter the 6-digit OTP code from terminal console' 
                : 'Set a new password for your account'}
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

          <form onSubmit={handleForgotPasswordSubmit} className="login-form">
            {forgotStep === 1 && (
              <>
                <div className="form-group">
                  <label htmlFor="forgot-email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">mail</span>
                    <input 
                      id="forgot-email"
                      type="email" 
                      placeholder="Enter email address" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="forgot-mobile">Mobile Number</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">call</span>
                    <input 
                      id="forgot-mobile"
                      type="text" 
                      placeholder="Enter mobile number" 
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {forgotStep === 2 && (
              <div className="form-group">
                <label htmlFor="forgot-otp">OTP Verification Code</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined">sms_failed</span>
                  <input 
                    id="forgot-otp"
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            {forgotStep === 3 && (
              <>
                <div className="form-group">
                  <label htmlFor="forgot-new-password">New Password</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">lock</span>
                    <input 
                      id="forgot-new-password"
                      type="password" 
                      placeholder="Enter new password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="forgot-confirm-password">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">lock_reset</span>
                    <input 
                      id="forgot-confirm-password"
                      type="password" 
                      placeholder="Confirm new password" 
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading 
                ? 'Processing...' 
                : (forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Verify OTP' : 'Reset Password')}
            </button>
          </form>

          <p className="login-toggle">
            Remembered password?{' '}
            <span onClick={() => { setIsForgotPassword(false); resetForm(); }}>
              Back to Login
            </span>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">
          {isRegister ? 'Create Account' : 'Welcome'}
        </h1>
        <p className="login-card__subtitle">
          {isRegister 
            ? 'Sign up to post your Ads' 
            : 'Login to manage your Listed Properties'}
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

        {/* Tab selection for Registration method */}
        {isRegister && (
          <div className="register-method-tabs">
            <button 
              type="button"
              className={`tab-btn ${registerMethod === 'email' ? 'active' : ''}`}
              onClick={() => { setRegisterMethod('email'); setError(''); setSuccess(''); }}
            >
              Email & Password
            </button>
            <button 
              type="button"
              className={`tab-btn ${registerMethod === 'mobile' ? 'active' : ''}`}
              onClick={() => { setRegisterMethod('mobile'); setError(''); setSuccess(''); }}
            >
              Mobile OTP
            </button>
          </div>
        )}

        {/* EMAIL & PASSWORD LOGIN / REGISTRATION FORM */}
        {(!isRegister || registerMethod === 'email') ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address <span style={{ color: 'red' }}>*</span></label>
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

            {isRegister && (
              <>
                <div className="form-group">
                  <label htmlFor="firstName">First Name <span style={{ color: 'red' }}>*</span></label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">person</span>
                    <input 
                      id="firstName"
                      type="text" 
                      placeholder="Enter first name" 
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name <span style={{ color: 'red' }}>*</span></label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">person</span>
                    <input 
                      id="lastName"
                      type="text" 
                      placeholder="Enter last name" 
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number <span style={{ color: 'red' }}>*</span></label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    border: isPhoneFocused ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-outline-variant)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '0 10px', 
                    backgroundColor: 'var(--color-surface-low)', 
                    height: '48px',
                    transition: 'border-color var(--transition-fast)'
                  }}>
                    <CountrySelector value={mobileCountryCode} onChange={setMobileCountryCode} disabled={loading} />
                    <input 
                      id="mobileNumber"
                      type="tel" 
                      placeholder="e.g. 77 123 4567" 
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        outline: 'none', 
                        color: 'var(--color-on-surface)', 
                        width: '100%', 
                        height: '100%', 
                        fontSize: 'var(--text-sm)', 
                        fontFamily: 'var(--font-body)',
                        paddingLeft: '4px'
                      }}
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="password">Password <span style={{ color: 'red' }}>*</span></label>
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
              {!isRegister && (
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <span 
                    onClick={() => { setIsForgotPassword(true); setForgotStep(1); resetForm(); }}
                    style={{ color: 'var(--color-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}
            </div>

            {isRegister && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password <span style={{ color: 'red' }}>*</span></label>
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
        ) : (
          /* MOBILE OTP REGISTRATION FORM */
          <div className="login-form">
            {registerMobileStep === 1 && (
              <form onSubmit={handleMobileSendOtp} className="login-form">
                <div className="register-step-title">
                  <span className="material-symbols-outlined">looks_one</span>
                  Enter Mobile Number
                </div>
                <div className="form-group">
                  <label htmlFor="reg-mobileNumber">Mobile Number <span style={{ color: 'red' }}>*</span></label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    border: isPhoneFocused ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-outline-variant)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '0 10px', 
                    backgroundColor: 'var(--color-surface-low)', 
                    height: '48px',
                    transition: 'border-color var(--transition-fast)'
                  }}>
                    <CountrySelector value={mobileCountryCode} onChange={setMobileCountryCode} disabled={loading} />
                    <input 
                      id="reg-mobileNumber"
                      type="tel" 
                      placeholder="e.g. 77 123 4567" 
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        outline: 'none', 
                        color: 'var(--color-on-surface)', 
                        width: '100%', 
                        height: '100%', 
                        fontSize: 'var(--text-sm)', 
                        fontFamily: 'var(--font-body)',
                        paddingLeft: '4px'
                      }}
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {registerMobileStep === 2 && (
              <form onSubmit={handleMobileVerifyOtp} className="login-form">
                <div className="register-step-title">
                  <span className="material-symbols-outlined">looks_two</span>
                  Enter Verification Code
                </div>
                <div className="form-group">
                  <label htmlFor="reg-mobileOtp">OTP Code <span style={{ color: 'red' }}>*</span></label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">sms_failed</span>
                    <input 
                      id="reg-mobileOtp"
                      type="text" 
                      placeholder="Enter 6-digit OTP code" 
                      value={registerMobileOtp}
                      onChange={e => setRegisterMobileOtp(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button 
                  type="button" 
                  onClick={handleGoBackToStep1} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Change Mobile Number
                </button>
              </form>
            )}

            {registerMobileStep === 3 && (
              <form onSubmit={handleMobileCompleteRegister} className="login-form">
                <div className="register-step-title">
                  <span className="material-symbols-outlined">looks_3</span>
                  Complete Registration
                </div>
                <div className="form-group">
                  <label htmlFor="reg-firstName">First Name <span style={{ color: 'red' }}>*</span></label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">person</span>
                    <input 
                      id="reg-firstName"
                      type="text" 
                      placeholder="Enter your first name" 
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-lastName">Last Name <span style={{ color: 'red' }}>*</span></label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined">person</span>
                    <input 
                      id="reg-lastName"
                      type="text" 
                      placeholder="Enter your last name" 
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON SECTION */}
        {!isForgotPassword && (
          <>
            <div className="google-divider">OR</div>
            <div className="google-btn-container">
              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                className="google-login-btn"
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.25h2.9c1.69-1.55 2.69-3.85 2.69-6.58z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.25c-.8.54-1.83.87-3.06.87-2.35 0-4.34-1.58-5.05-3.72H.93v2.33C2.42 16.02 5.43 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.95 10.72c-.18-.54-.28-1.12-.28-1.72s.1-1.18.28-1.72V4.95H.93A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.97 4.05l3.02-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.1C13.46.66 11.42 0 9 0 5.43 0 2.42 1.98.93 4.95l3.02 2.33c.71-2.14 2.7-3.72 5.05-3.72z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </>
        )}

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
