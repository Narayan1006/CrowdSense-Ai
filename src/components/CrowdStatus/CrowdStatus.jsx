import React, { useMemo } from 'react';
import './CrowdStatus.css';

const LEVEL_CONFIG = {
  low: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', label: 'Low', icon: '🟢' },
  medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', label: 'Busy', icon: '🟡' },
  high: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', label: 'Crowded', icon: '🔴' },
  unknown: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.3)', label: '–', icon: '⚪' },
};

function CrowdPill({ name, level, shortName }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown;
  return (
    <div
      className="crowd-pill"
      style={{ background: cfg.bg, borderColor: cfg.border }}
      title={`${name}: ${cfg.label}`}
    >
      <span className="pill-dot" style={{ background: cfg.color }} />
      <span className="pill-name">{shortName || name}</span>
      <span className="pill-level" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

function OverallBar({ crowdData }) {
  const counts = useMemo(() => {
    const vals = Object.values(crowdData);
    return {
      low: vals.filter(v => v.level === 'low').length,
      medium: vals.filter(v => v.level === 'medium').length,
      high: vals.filter(v => v.level === 'high').length,
      total: vals.length,
    };
  }, [crowdData]);

  const overallStatus = counts.high > counts.total * 0.4
    ? { label: 'High Crowd Alert', color: '#ef4444', icon: '🔴' }
    : counts.medium > counts.total * 0.4
    ? { label: 'Moderately Busy', color: '#f59e0b', icon: '🟡' }
    : { label: 'Stadium Clear', color: '#10b981', icon: '🟢' };

  return (
    <div className="overall-bar" style={{ borderColor: overallStatus.color + '40' }}>
      <div className="overall-status">
        <span className="overall-icon">{overallStatus.icon}</span>
        <span className="overall-label" style={{ color: overallStatus.color }}>
          {overallStatus.label}
        </span>
      </div>
      <div className="overall-breakdown">
        <span className="breakdown-item low">🟢 {counts.low} Low</span>
        <span className="breakdown-sep">·</span>
        <span className="breakdown-item med">🟡 {counts.medium} Medium</span>
        <span className="breakdown-sep">·</span>
        <span className="breakdown-item high">🔴 {counts.high} High</span>
      </div>
    </div>
  );
}

export default function CrowdStatus({ crowdData, lastUpdated, isLoading }) {
  const gates = Object.values(crowdData).filter(d => d.type === 'gate');
  const foods = Object.values(crowdData).filter(d => d.type === 'food');
  const washrooms = Object.values(crowdData).filter(d => d.type === 'washroom');

  return (
    <div className="crowd-status-bar">
      <div className="crowd-status-header">
        <span className="crowd-title">📊 Real-Time Crowd Status</span>
        <div className="crowd-meta">
          {isLoading ? (
            <span className="updating">⟳ Updating…</span>
          ) : lastUpdated ? (
            <span className="last-updated">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
          <span className="live-indicator">● LIVE</span>
        </div>
      </div>

      {Object.keys(crowdData).length > 0 && <OverallBar crowdData={crowdData} />}

      <div className="crowd-sections">
        <div className="crowd-section">
          <span className="section-label">🚪 Gates</span>
          <div className="pills-row">
            {gates.map(g => (
              <CrowdPill key={g.id} name={g.name} level={g.level} shortName={g.name} />
            ))}
          </div>
        </div>

        <div className="crowd-section">
          <span className="section-label">🍕 Food Stalls</span>
          <div className="pills-row">
            {foods.map(f => (
              <CrowdPill key={f.id} name={f.name} level={f.level}
                shortName={f.name.split(' ').slice(0, 2).join(' ')} />
            ))}
          </div>
        </div>

        <div className="crowd-section">
          <span className="section-label">🚻 Washrooms</span>
          <div className="pills-row">
            {washrooms.map(w => (
              <CrowdPill key={w.id} name={w.name} level={w.level}
                shortName={w.name.replace('Washroom Block ', 'WC ')} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
