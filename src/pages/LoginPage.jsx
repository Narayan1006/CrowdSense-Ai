import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './LoginPage.css';

export default function LoginPage() {
  const [mode, setMode]       = useState('attendee'); // 'attendee' | 'admin'
  const [ticketId, setTicketId] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { name, block, gate }
  const navigate = useNavigate();
  const { loginAdmin, loginAttendee } = useAuth();

  const handleAttendeeLogin = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) { setError('Please enter your Ticket ID'); return; }
    setError('');
    setLoading(true);
    const result = await loginAttendee(ticketId.trim());
    setLoading(false);
    if (result.success) {
      setSuccess(result.data);
      setTimeout(() => navigate('/'), 1200);
    } else {
      setError(result.error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Please enter email and password'); return; }
    setError('');
    setLoading(true);
    const result = await loginAdmin(email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      {/* Background effects */}
      <div className="login-bg-grid" />
      <div className="login-bg-glow glow-1" />
      <div className="login-bg-glow glow-2" />

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-stadium-icon">🏟️</div>
          <h1 className="login-title">SenseCrowd AI</h1>
          <p className="login-subtitle">Narendra Modi Stadium · Ahmedabad</p>
        </div>

        {/* Mode Toggle */}
        <div className="login-toggle">
          <button
            className={`toggle-btn ${mode === 'attendee' ? 'active' : ''}`}
            onClick={() => { setMode('attendee'); setError(''); setSuccess(null); }}
          >
            🎟️ Attendee
          </button>
          <button
            className={`toggle-btn ${mode === 'admin' ? 'active' : ''}`}
            onClick={() => { setMode('admin'); setError(''); setSuccess(null); }}
          >
            🔑 Admin
          </button>
          <div className={`toggle-slider ${mode === 'admin' ? 'right' : 'left'}`} />
        </div>

        {/* Success message */}
        {success && (
          <div className="login-success">
            <div className="success-icon">✅</div>
            <p className="success-name">Welcome, <strong>{success.name}</strong>!</p>
            <p className="success-detail">🪑 {success.block} · 🚪 {success.gate}</p>
            <p className="success-redirect">Redirecting to stadium assistant...</p>
          </div>
        )}

        {/* Error message */}
        {error && !success && (
          <div className="login-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Attendee Form */}
        {mode === 'attendee' && !success && (
          <form className="login-form" onSubmit={handleAttendeeLogin}>
            <div className="form-group">
              <label htmlFor="ticketId">Ticket ID</label>
              <div className="input-wrap">
                <span className="input-icon">🎟️</span>
                <input
                  id="ticketId"
                  type="text"
                  placeholder="e.g. TKT-001"
                  value={ticketId}
                  onChange={e => setTicketId(e.target.value.toUpperCase())}
                  autoFocus
                  autoComplete="off"
                />
              </div>
            </div>
            <button className="login-btn attendee-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="btn-spinner" /> Verifying...</>
                : <>🎫 Verify Ticket</>
              }
            </button>
            <p className="login-hint">
              Demo tickets: <code>TKT-001</code>, <code>TKT-002</code>, <code>TKT-003</code>, <code>TKT-004</code>, <code>TKT-005</code>
            </p>
          </form>
        )}

        {/* Admin Form */}
        {mode === 'admin' && (
          <form className="login-form" onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <div className="input-wrap">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@sensecrowd.ai"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button className="login-btn admin-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="btn-spinner" /> Authenticating...</>
                : <>🔑 Sign In as Admin</>
              }
            </button>
            <p className="login-hint admin-hint">
              Admin access requires Firebase Authentication.<br />
              Create admin account in Firebase Console → Authentication.
            </p>
          </form>
        )}

        {/* Footer */}
        <div className="login-footer">
          <span>🏏 Powered by Google Gemini AI · Firebase</span>
        </div>
      </div>
    </div>
  );
}
