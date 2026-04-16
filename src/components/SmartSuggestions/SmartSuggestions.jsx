import React, { useState, useEffect } from 'react';
import { getSmartSuggestions } from '../../services/geminiService.js';
import './SmartSuggestions.css';

const DEFAULT_SUGGESTIONS = {
  leastCrowdedGate: 'Calculating…',
  bestFoodStall: 'Calculating…',
  fastestRoute: 'Calculating…',
};

export default function SmartSuggestions({ crowdData }) {
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchSuggestions = async () => {
    if (Object.keys(crowdData).length === 0) return;
    setIsLoading(true);
    try {
      const result = await getSmartSuggestions(crowdData);
      setSuggestions(result);
      setLastFetched(new Date());
    } catch {
      setSuggestions({
        leastCrowdedGate: 'Gate 5 (Southwest) — Low crowd detected',
        bestFoodStall: 'West Refreshment Bar — Short queue right now',
        fastestRoute: 'Show ticket QR at your assigned gate for fastest access',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSuggestions, 1000);
    return () => clearTimeout(timer);
  }, [crowdData]);

  const cards = [
    {
      id: 'gate',
      icon: '🚪',
      title: 'Least Crowded Gate',
      value: suggestions.leastCrowdedGate,
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.08))',
      border: 'rgba(59,130,246,0.2)',
      accent: '#3b82f6',
      tip: 'Use this gate for fastest entry',
    },
    {
      id: 'food',
      icon: '🍕',
      title: 'Best Food Stall Now',
      value: suggestions.bestFoodStall,
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.08))',
      border: 'rgba(245,158,11,0.2)',
      accent: '#f59e0b',
      tip: 'Shortest queue & freshest food',
    },
    {
      id: 'route',
      icon: '🗺️',
      title: 'Fastest Route',
      value: suggestions.fastestRoute,
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
      border: 'rgba(16,185,129,0.2)',
      accent: '#10b981',
      tip: 'AI-optimized navigation',
    },
  ];

  return (
    <div className="smart-suggestions">
      <div className="suggestions-header">
        <div className="suggestions-title">
          <span className="suggestions-icon">✨</span>
          <h3>AI Smart Suggestions</h3>
        </div>
        <div className="suggestions-meta">
          {isLoading ? (
            <span className="suggestions-loading-text">Analyzing crowd data…</span>
          ) : lastFetched ? (
            <button className="refresh-btn" onClick={fetchSuggestions}>
              ↺ Refresh
            </button>
          ) : null}
        </div>
      </div>

      <div className="suggestions-grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`suggestion-card ${isLoading ? 'loading' : ''}`}
            style={{ background: card.gradient, borderColor: card.border }}
          >
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <div>
                <div className="card-title" style={{ color: card.accent }}>{card.title}</div>
                <div className="card-tip">{card.tip}</div>
              </div>
            </div>
            <div className="card-value">
              {isLoading ? (
                <div className="card-skeleton">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ) : (
                card.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stadium info strip */}
      <div className="stadium-info-strip">
        <div className="info-chip">🏟️ Narendra Modi Stadium</div>
        <div className="info-chip">📍 Motera, Ahmedabad</div>
        <div className="info-chip">👥 132,000 Capacity</div>
        <div className="info-chip">🏏 World's Largest Cricket Stadium</div>
      </div>
    </div>
  );
}
