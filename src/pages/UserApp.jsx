import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ChatPanel from '../components/ChatPanel/ChatPanel.jsx';
import StadiumMap from '../components/StadiumMap/StadiumMap.jsx';
import CrowdStatus from '../components/CrowdStatus/CrowdStatus.jsx';
import SmartSuggestions from '../components/SmartSuggestions/SmartSuggestions.jsx';
import EmergencyModal from '../components/EmergencyModal/EmergencyModal.jsx';
import AlertBanner from '../components/AlertBanner/AlertBanner.jsx';
import { useCrowdData } from '../hooks/useCrowdData.js';
import { useAlerts } from '../hooks/useAlerts.js';
import '../App.css';

export default function UserApp() {
  const [showEmergency, setShowEmergency] = useState(false);
  const { crowdData, isLoading, lastUpdated } = useCrowdData();
  const alerts = useAlerts();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Personalized gate suggestion based on ticket
  const gateSuggestion = user?.gate ? `Based on your ticket (${user.block}), your recommended entry is ${user.gate}.` : null;

  return (
    <div className="app">
      {/* ─── Header ─── */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🏟️</span>
            <div>
              <h1>SenseCrowd AI</h1>
              <span className="header-subtitle">Narendra Modi Stadium · Ahmedabad</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="header-event">
            <span className="event-dot">●</span>
            <span className="event-text">Live Event Mode</span>
          </div>
        </div>

        <div className="header-right">
          <div className="header-badges">
            <span className="badge ai">🤖 Gemini AI</span>
            <span className="badge firebase">🔥 Firebase</span>
            {user && (
              <span className="badge user-badge" title={user.ticketId || user.email}>
                👤 {user.name || user.displayName || 'User'}
                {user.block ? ` · ${user.block}` : ''}
              </span>
            )}
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Sign out"
          >
            🚪 Logout
          </button>
          <button
            className="emergency-trigger-btn"
            onClick={() => setShowEmergency(true)}
            aria-label="Emergency Help"
          >
            <span>🆘</span>
            <span className="help-text">Need Help</span>
            <span className="help-pulse" />
          </button>
        </div>
      </header>

      {/* ─── Personalized Gate Suggestion ─── */}
      {gateSuggestion && (
        <div className="gate-suggestion-bar">
          <span>💡</span>
          <span>{gateSuggestion}</span>
        </div>
      )}

      {/* ─── Live Alert Banner ─── */}
      {alerts.length > 0 && (
        <div className="alert-banner-container">
          <AlertBanner alerts={alerts} />
        </div>
      )}

      {/* ─── Crowd Status Bar ─── */}
      <div className="crowd-status-container">
        <CrowdStatus crowdData={crowdData} lastUpdated={lastUpdated} isLoading={isLoading} />
      </div>

      {/* ─── Smart Suggestions ─── */}
      <div className="suggestions-container">
        <SmartSuggestions crowdData={crowdData} />
      </div>

      {/* ─── Main Dashboard ─── */}
      <main className="dashboard">
        <div className="panel-left">
          <ChatPanel crowdData={crowdData} />
        </div>
        <div className="panel-right">
          <StadiumMap crowdData={crowdData} />
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="app-footer">
        <span>🏏 SenseCrowd AI — Powered by Google Gemini AI · Firebase · Narendra Modi Stadium</span>
        <span className="footer-sep">|</span>
        <span>For emergencies call <strong>1077</strong> (Medical) · <strong>100</strong> (Security)</span>
      </footer>

      {/* ─── Emergency Modal ─── */}
      {showEmergency && (
        <EmergencyModal crowdData={crowdData} onClose={() => setShowEmergency(false)} />
      )}
    </div>
  );
}
