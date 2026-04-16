// useCrowdData hook — subscribes to real-time crowd data (Firebase or simulated)
import { useState, useEffect } from 'react';
import { subscribeToCrowdData } from '../services/firebaseService.js';

export function useCrowdData() {
  const [crowdData, setCrowdData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToCrowdData(data => {
      setCrowdData(data);
      setIsLoading(false);
      setLastUpdated(new Date());
    });
    return () => unsubscribe();
  }, []);

  const getCrowdLevel = id => crowdData[id]?.level || 'unknown';
  const getGateCrowds = () => Object.values(crowdData).filter(d => d.type === 'gate');
  const getFoodCrowds = () => Object.values(crowdData).filter(d => d.type === 'food');
  const getWashroomCrowds = () => Object.values(crowdData).filter(d => d.type === 'washroom');

  const getLeastCrowdedGate = () => {
    const gates = getGateCrowds();
    const low = gates.find(g => g.level === 'low');
    const med = gates.find(g => g.level === 'medium');
    return low || med || gates[0];
  };

  const getLeastCrowdedFood = () => {
    const food = getFoodCrowds();
    const low = food.find(f => f.level === 'low');
    return low || food[0];
  };

  return {
    crowdData,
    isLoading,
    lastUpdated,
    getCrowdLevel,
    getGateCrowds,
    getFoodCrowds,
    getWashroomCrowds,
    getLeastCrowdedGate,
    getLeastCrowdedFood,
  };
}
