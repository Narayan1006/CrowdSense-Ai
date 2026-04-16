// Auth Service — Firebase Auth (Admin) + Ticket Verification (Attendee)
// SenseCrowd AI

import { getFirebaseApp, getDb, initFirebase, isFirebaseConnected } from './firebaseService.js';

const STORAGE_KEY = 'sensecrowd_attendee';

// ─── Demo Tickets ──────────────────────────────────────────────────────────
const DEMO_TICKETS = [
  { ticketId: 'TKT-001', name: 'Aarav Sharma',  block: 'Block A', gate: 'Gate 1', isValid: true },
  { ticketId: 'TKT-002', name: 'Priya Patel',   block: 'Block C', gate: 'Gate 2', isValid: true },
  { ticketId: 'TKT-003', name: 'Rahul Verma',   block: 'Block E', gate: 'Gate 4', isValid: true },
  { ticketId: 'TKT-004', name: 'Sneha Gupta',   block: 'Block B', gate: 'Gate 1', isValid: true },
  { ticketId: 'TKT-005', name: 'Amit Kumar',    block: 'Block D', gate: 'Gate 3', isValid: true },
  { ticketId: 'TKT-006', name: 'Expired Pass',  block: 'Block F', gate: 'Gate 6', isValid: false },
];

// ─── Seed demo tickets into Firestore ──────────────────────────────────────
async function seedDemoTickets() {
  await initFirebase();
  const db = getDb();
  if (!db) return;
  try {
    const { collection, getDocs, doc, setDoc } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'tickets'));
    if (snap.size > 0) return; // Already seeded
    for (const ticket of DEMO_TICKETS) {
      await setDoc(doc(collection(db, 'tickets'), ticket.ticketId), ticket);
    }
    console.log('🎟️ Seeded 6 demo tickets into Firestore');
  } catch (e) {
    console.warn('⚠️ Failed to seed tickets:', e.message);
  }
}

// ─── ADMIN AUTH (Firebase Email/Password) ──────────────────────────────────
export async function loginAdmin(email, password) {
  await initFirebase();
  const app = getFirebaseApp();
  if (!app) {
    return { success: false, error: 'Firebase not configured. Cannot authenticate admin.' };
  }
  try {
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    const auth = getAuth(app);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        role: 'admin',
        email: cred.user.email,
        uid: cred.user.uid,
        displayName: cred.user.displayName || 'Admin',
      },
    };
  } catch (e) {
    let errorMsg = 'Authentication failed';
    if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
      errorMsg = 'Invalid email or password';
    } else if (e.code === 'auth/too-many-requests') {
      errorMsg = 'Too many attempts. Please try again later.';
    } else if (e.code === 'auth/network-request-failed') {
      errorMsg = 'Network error. Check your connection.';
    }
    return { success: false, error: errorMsg };
  }
}

export async function logoutAdmin() {
  try {
    const app = getFirebaseApp();
    if (app) {
      const { getAuth, signOut } = await import('firebase/auth');
      await signOut(getAuth(app));
    }
  } catch (e) {
    console.warn('Logout error:', e.message);
  }
}

export async function getFirebaseAuthUser() {
  await initFirebase();
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    const { getAuth } = await import('firebase/auth');
    return getAuth(app).currentUser;
  } catch { return null; }
}

export function onFirebaseAuthChange(callback) {
  let unsubscribe = () => {};
  initFirebase().then(async () => {
    const app = getFirebaseApp();
    if (!app) return;
    try {
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      unsubscribe = onAuthStateChanged(getAuth(app), callback);
    } catch { /* ignore */ }
  });
  return () => unsubscribe();
}

// ─── ATTENDEE AUTH (Ticket-based) ──────────────────────────────────────────
export async function verifyTicket(ticketId) {
  const normalizedId = ticketId.trim().toUpperCase();

  // Try Firestore first
  await initFirebase();
  const db = getDb();
  if (db) {
    try {
      const { doc, getDoc, collection } = await import('firebase/firestore');
      const docRef = doc(collection(db, 'tickets'), normalizedId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.isValid) {
          return { success: true, data: { ...data, ticketId: normalizedId } };
        } else {
          return { success: false, error: 'This ticket has expired or been revoked.' };
        }
      }
    } catch (e) {
      console.warn('⚠️ Firestore ticket query failed, trying local:', e.message);
    }
  }

  // Fallback to demo tickets (in-memory)
  const found = DEMO_TICKETS.find(t => t.ticketId === normalizedId);
  if (!found) {
    return { success: false, error: 'Ticket ID not found. Please check and try again.' };
  }
  if (!found.isValid) {
    return { success: false, error: 'This ticket has expired or been revoked.' };
  }
  return { success: true, data: { ...found } };
}

export function loginAttendee(ticketData) {
  const session = { role: 'attendee', ...ticketData, loginAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function logoutAttendee() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredAttendee() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// ─── Init: seed tickets on first load ──────────────────────────────────────
seedDemoTickets();
