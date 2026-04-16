import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginAdmin   as _loginAdmin,
  logoutAdmin   as _logoutAdmin,
  verifyTicket,
  loginAttendee as _loginAttendee,
  logoutAttendee as _logoutAttendee,
  getStoredAttendee,
  onFirebaseAuthChange,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { role, name, email, block, gate, ticketId, ... }
  const [loading, setLoading] = useState(true);

  // ─── Restore session on mount ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    // Check attendee localStorage first
    const attendee = getStoredAttendee();
    if (attendee) {
      setUser(attendee);
      setLoading(false);
    }

    // Listen for Firebase Auth changes (admin)
    const unsub = onFirebaseAuthChange((firebaseUser) => {
      if (cancelled) return;
      if (firebaseUser) {
        // Admin logged in via Firebase
        setUser({
          role: 'admin',
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Admin',
        });
      } else if (!getStoredAttendee()) {
        // No Firebase user and no attendee = logged out
        setUser(null);
      }
      setLoading(false);
    });

    // If Firebase Auth never fires (Firebase not configured), clear loading
    const timeout = setTimeout(() => {
      if (cancelled) return;
      setLoading(false);
    }, 2000);

    return () => {
      cancelled = true;
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  // ─── Login Admin ─────────────────────────────────────────────────────────
  const loginAdmin = async (email, password) => {
    const result = await _loginAdmin(email, password);
    if (result.success) {
      // Clear any attendee session
      _logoutAttendee();
      setUser(result.user);
    }
    return result;
  };

  // ─── Login Attendee ──────────────────────────────────────────────────────
  const loginAttendee = async (ticketId) => {
    const result = await verifyTicket(ticketId);
    if (result.success) {
      const session = _loginAttendee(result.data);
      setUser(session);
    }
    return result;
  };

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logout = async () => {
    if (user?.role === 'admin') {
      await _logoutAdmin();
    }
    _logoutAttendee();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, loginAttendee, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
