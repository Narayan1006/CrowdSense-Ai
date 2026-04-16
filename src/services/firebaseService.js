// Firebase Service — Crowd Data + Admin Operations (CrowdPilot AI)
// Supports full Firebase Firestore OR in-memory simulation fallback

import { STADIUM_GATES, FOOD_STALLS, WASHROOMS } from '../data/stadiumData.js';

let app = null;
let db = null;
let useFirebase = false;

const FIREBASE_API_KEY    = import.meta.env.VITE_FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// ─── Firebase Init ─────────────────────────────────────────────────────────
let _initPromise = null;

function initFirebase() {
  if (_initPromise) return _initPromise;
  _initPromise = _doInit();
  return _initPromise;
}

async function _doInit() {
  if (!FIREBASE_API_KEY || FIREBASE_API_KEY === 'your_firebase_api_key_here' ||
      !FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID === 'your-project-id') {
    console.log('📊 SenseCrowd: Firebase not configured — using in-memory simulation');
    return;
  }
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore }           = await import('firebase/firestore');
    const existing = getApps();
    app = existing.length
      ? existing[0]
      : initializeApp({
          apiKey:            FIREBASE_API_KEY,
          authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId:         FIREBASE_PROJECT_ID,
          storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId:             import.meta.env.VITE_FIREBASE_APP_ID,
        });
    db = getFirestore(app);
    useFirebase = true;
    console.log('✅ SenseCrowd: Firebase Firestore connected');
  } catch (e) {
    console.warn('⚠️ SenseCrowd: Firebase init failed, using simulation:', e.message);
  }
}

initFirebase();

/** Get initialized Firebase app (await initFirebase() first) */
export function getFirebaseApp() { return app; }
/** Get Firestore db instance */
export function getDb() { return db; }
/** Whether Firebase is actively connected */
export function isFirebaseConnected() { return useFirebase && !!db; }
/** Wait for Firebase init to complete */
export { initFirebase };

// ─── Simulation Helpers ────────────────────────────────────────────────────
const LEVELS = ['low', 'low', 'medium', 'medium', 'medium', 'high'];
const randomLevel = () => LEVELS[Math.floor(Math.random() * LEVELS.length)];

function buildInitialCrowd() {
  const data = {};
  [...STADIUM_GATES, ...FOOD_STALLS, ...WASHROOMS].forEach(loc => {
    data[loc.id] = { id: loc.id, name: loc.name, type: loc.type, level: randomLevel(), updatedAt: Date.now() };
  });
  return data;
}

let inMemoryCrowd     = buildInitialCrowd();
let crowdSubscribers  = [];
let inMemoryAlerts    = [];
let alertSubscribers  = [];
let inMemoryIncidents = [];
let incidentSubscribers = [];

const notifyCrowd     = () => { const s = { ...inMemoryCrowd }; crowdSubscribers.forEach(cb => cb(s)); };
const notifyAlerts    = () => { const s = [...inMemoryAlerts];   alertSubscribers.forEach(cb => cb(s)); };
const notifyIncidents = () => { const s = [...inMemoryIncidents]; incidentSubscribers.forEach(cb => cb(s)); };

// ─── CROWD DATA ────────────────────────────────────────────────────────────
export function getCrowdSnapshot() { return { ...inMemoryCrowd }; }

function simulateTick() {
  Object.keys(inMemoryCrowd).forEach(k => {
    if (Math.random() < 0.25) {
      inMemoryCrowd[k] = { ...inMemoryCrowd[k], level: randomLevel(), updatedAt: Date.now() };
    }
  });
}

export function subscribeToCrowdData(callback) {
  // Always provide immediate in-memory data and register for fallback
  callback({ ...inMemoryCrowd });
  crowdSubscribers.push(callback);

  let simInterval = null;
  let unsubFS = () => {};

  if (!useFirebase || !db) {
    // Pure simulation mode — tick every 20s
    simInterval = setInterval(() => { simulateTick(); notifyCrowd(); }, 20000);
  } else {
    // Firebase mode — also tick simulation + Firestore listener
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      unsubFS = onSnapshot(collection(db, 'crowdData'), snap => {
        const data = {};
        snap.forEach(doc => { data[doc.id] = { id: doc.id, ...doc.data() }; });
        if (Object.keys(data).length > 0) callback(data);
      }, err => {
        console.warn('⚠️ Firestore crowd listener error:', err.message);
      });
      seedFirestoreCrowd();
      simInterval = setInterval(() => updateFirestoreCrowd(), 20000);
    });
  }

  return () => {
    unsubFS();
    if (simInterval) clearInterval(simInterval);
    crowdSubscribers = crowdSubscribers.filter(cb => cb !== callback);
  };
}

/** Admin: override a single location's crowd level */
export async function updateCrowdLevel(id, level) {
  if (useFirebase && db) {
    try {
      const { doc, collection, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(collection(db, 'crowdData'), id), { level, updatedAt: Date.now(), updatedBy: 'admin' });
      return;
    } catch (e) { console.warn('⚠️ Firestore updateCrowdLevel failed, using in-memory:', e.message); }
  }
  // Fallback to in-memory
  if (inMemoryCrowd[id]) {
    inMemoryCrowd[id] = { ...inMemoryCrowd[id], level, updatedAt: Date.now() };
    notifyCrowd();
  }
}

// ─── ALERTS ────────────────────────────────────────────────────────────────
export function subscribeToAlerts(callback) {
  // Always register for in-memory fallback
  callback([...inMemoryAlerts]);
  alertSubscribers.push(callback);

  let unsubFS = () => {};
  if (useFirebase && db) {
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      unsubFS = onSnapshot(collection(db, 'alerts'), snap => {
        const data = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(data);
      }, err => {
        console.warn('⚠️ Firestore alerts listener error:', err.message);
      });
    });
  }
  return () => {
    unsubFS();
    alertSubscribers = alertSubscribers.filter(cb => cb !== callback);
  };
}

export async function sendAlert(message, severity = 'info') {
  const payload = { message, severity, createdAt: Date.now() };
  if (useFirebase && db) {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'alerts'), payload);
      return;
    } catch (e) { console.warn('⚠️ Firestore sendAlert failed, using in-memory:', e.message); }
  }
  // Fallback to in-memory
  inMemoryAlerts = [{ id: Date.now().toString(), ...payload }, ...inMemoryAlerts];
  notifyAlerts();
}

export async function dismissAlert(id) {
  if (useFirebase && db) {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'alerts', id));
      return;
    } catch (e) { console.warn('⚠️ Firestore dismissAlert failed, using in-memory:', e.message); }
  }
  inMemoryAlerts = inMemoryAlerts.filter(a => a.id !== id);
  notifyAlerts();
}

// ─── INCIDENTS ─────────────────────────────────────────────────────────────
export function subscribeToIncidents(callback) {
  // Always register for in-memory fallback
  callback([...inMemoryIncidents]);
  incidentSubscribers.push(callback);

  let unsubFS = () => {};
  if (useFirebase && db) {
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      unsubFS = onSnapshot(collection(db, 'incidents'), snap => {
        const data = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(data.slice(0, 30));
      }, err => {
        console.warn('⚠️ Firestore incidents listener error:', err.message);
      });
    });
  }
  return () => {
    unsubFS();
    incidentSubscribers = incidentSubscribers.filter(cb => cb !== callback);
  };
}

export async function logIncident(type, description) {
  const payload = { type, description, status: 'open', createdAt: Date.now() };
  if (useFirebase && db) {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const ref = await addDoc(collection(db, 'incidents'), payload);
      return { id: ref.id, ...payload };
    } catch (e) { console.warn('⚠️ Firestore logIncident failed, using in-memory:', e.message); }
  }
  // Fallback to in-memory
  const incident = { id: Date.now().toString(), ...payload };
  inMemoryIncidents = [incident, ...inMemoryIncidents].slice(0, 50);
  notifyIncidents();
  return incident;
}

export async function resolveIncident(id) {
  if (useFirebase && db) {
    try {
      const { doc, collection, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(collection(db, 'incidents'), id), { status: 'resolved', resolvedAt: Date.now() });
      return;
    } catch (e) { console.warn('⚠️ Firestore resolveIncident failed, using in-memory:', e.message); }
  }
  inMemoryIncidents = inMemoryIncidents.map(i =>
    i.id === id ? { ...i, status: 'resolved', resolvedAt: Date.now() } : i
  );
  notifyIncidents();
}

// ─── Firestore Internal Helpers ────────────────────────────────────────────
async function seedFirestoreCrowd() {
  if (!useFirebase || !db) return;
  try {
    const { collection, doc, setDoc, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'crowdData'));
    if (snap.size > 0) return;
    const initial = buildInitialCrowd();
    for (const [id, data] of Object.entries(initial)) {
      await setDoc(doc(collection(db, 'crowdData'), id), data);
    }
    console.log('✅ Firestore seeded with initial crowd data');
  } catch (e) { console.error('Seed error:', e); }
}

async function updateFirestoreCrowd() {
  if (!useFirebase || !db) return;
  try {
    const { collection, doc, updateDoc } = await import('firebase/firestore');
    const keys = Object.keys(inMemoryCrowd);
    for (const key of keys) {
      if (Math.random() < 0.25) {
        const level = randomLevel();
        await updateDoc(doc(collection(db, 'crowdData'), key), { level, updatedAt: Date.now() });
      }
    }
  } catch (e) { /* ignore */ }
}
