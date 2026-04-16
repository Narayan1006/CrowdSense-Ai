// useAlerts — Real-time alerts subscription hook
import { useState, useEffect } from 'react';
import { subscribeToAlerts } from '../services/firebaseService.js';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    const unsub = subscribeToAlerts(setAlerts);
    return unsub;
  }, []);
  return alerts;
}
