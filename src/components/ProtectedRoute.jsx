import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * ProtectedRoute — guards routes by role.
 *   role="attendee"  → allows both attendees and admins
 *   role="admin"     → only allows admins
 */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0f1e', color: '#94a3b8',
        fontFamily: 'Inter, sans-serif', gap: 12,
      }}>
        <div style={{
          width: 28, height: 28, border: '3px solid rgba(99,102,241,0.3)',
          borderTopColor: '#6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span>Loading SenseCrowd AI...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin route — only admins allowed
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Attendee route — both attendees and admins are fine
  return children;
}
