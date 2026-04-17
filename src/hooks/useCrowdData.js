// useCrowdData hook — subscribes to real-time crowd data (Firebase or simulated)
import { useState, useEffect } from 'react';
import { subscribeToCrowdData, subscribeToVolunteers } from '../services/firebaseService.js';

export function useCrowdData() {
  const [crowdData, setCrowdData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let currentVolunteers = [];
    const unsubVols = subscribeToVolunteers(vols => {
      currentVolunteers = vols;
      setCrowdData(prev => ({ ...prev, volunteers: vols }));
    });

    const unsubscribe = subscribeToCrowdData(data => {
      // Simulate predictions based on current level
      const dataWithPredictions = { volunteers: currentVolunteers };
      for (const [key, value] of Object.entries(data)) {
        if (key === 'volunteers') continue;
        let predictedLevel = value.level;
        if (value.level === 'medium') predictedLevel = 'high';
        else if (value.level === 'high') predictedLevel = 'high';
        else if (value.level === 'low') predictedLevel = 'low';

        dataWithPredictions[key] = {
          ...value,
          prediction: predictedLevel,
        };
      }

      setCrowdData(dataWithPredictions);
      setIsLoading(false);
      setLastUpdated(new Date());
    });
    return () => { unsubscribe(); unsubVols(); };
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
