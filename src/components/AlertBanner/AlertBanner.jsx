// AlertBanner — Live admin alerts display for user app
import React, { useState } from 'react';
import './AlertBanner.css';

const SEV = {
  info:     { icon: 'ℹ️',  label: 'INFO',     color: '#818cf8', border: 'rgba(99,102,241,0.35)',  bg: 'rgba(99,102,241,0.08)' },
  warning:  { icon: '⚠️',  label: 'ALERT',    color: '#f59e0b', border: 'rgba(245,158,11,0.35)',  bg: 'rgba(245,158,11,0.08)' },
  critical: { icon: '🚨',  label: 'CRITICAL', color: '#ef4444', border: 'rgba(239,68,68,0.4)',    bg: 'rgba(239,68,68,0.1)'  },
};

export default function AlertBanner({ alerts }) {
  const [dismissed, setDismissed] = useState(new Set());
  const visible = (alerts || []).filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="alert-banner-wrap">
      {visible.map(alert => {
        const cfg = SEV[alert.severity] || SEV.info;
        return (
          <div
            key={alert.id}
            className="alert-banner-item"
            style={{ background: cfg.bg, borderColor: cfg.border }}
          >
            <span className="ab-icon">{cfg.icon}</span>
            <span className="ab-label" style={{ color: cfg.color }}>{cfg.label}</span>
            <span className="ab-msg">{alert.message}</span>
            <span className="ab-time">
              {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              className="ab-dismiss"
              onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
              title="Dismiss"
            >×</button>
          </div>
        );
      })}
    </div>
  );
}
