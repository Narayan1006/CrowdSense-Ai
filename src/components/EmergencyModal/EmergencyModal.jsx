import React, { useState } from 'react';
import { getEmergencyInstructions } from '../../services/geminiService.js';
import ReactMarkdown from 'react-markdown';
import './EmergencyModal.css';

const EMERGENCY_TYPES = [
  {
    id: 'lost',
    icon: '📍',
    label: 'I\'m Lost',
    desc: 'Can\'t find your way or your group',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'medical',
    icon: '🏥',
    label: 'Medical Emergency',
    desc: 'Injury, illness, or health issue',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  {
    id: 'security',
    icon: '👮',
    label: 'Security Issue',
    desc: 'Threat, theft, or suspicious activity',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.3)',
  },
];

export default function EmergencyModal({ crowdData, onClose }) {
  const [selected, setSelected] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (type) => {
    setSelected(type);
    setIsLoading(true);
    setInstructions('');
    try {
      const result = await getEmergencyInstructions(type.id, crowdData);
      setInstructions(result);
    } catch {
      setInstructions('⚠️ Please find the nearest stadium staff member (yellow vest) immediately.\n\n**Emergency contacts:**\n- 🏥 Medical: **1077**\n- 👮 Security: **100**\n- 🚨 Police: **112**');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="emergency-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="emergency-modal">
        {/* Header */}
        <div className="emergency-header">
          <div className="emergency-header-left">
            <div className="emergency-siren">🚨</div>
            <div>
              <h2>Emergency Assistance</h2>
              <p>Select your situation for immediate help</p>
            </div>
          </div>
          <button className="emergency-close" onClick={onClose}>✕</button>
        </div>

        {/* Quick contacts */}
        <div className="quick-contacts">
          <a href="tel:1077" className="contact-chip medical">
            🏥 Medical: 1077
          </a>
          <a href="tel:100" className="contact-chip security">
            👮 Security: 100
          </a>
          <a href="tel:112" className="contact-chip police">
            🚨 Police: 112
          </a>
        </div>

        {/* Type selection */}
        <div className="emergency-types">
          {EMERGENCY_TYPES.map(type => (
            <button
              key={type.id}
              className={`emergency-type-btn ${selected?.id === type.id ? 'selected' : ''}`}
              style={{
                background: selected?.id === type.id ? type.bg : 'rgba(255,255,255,0.03)',
                borderColor: selected?.id === type.id ? type.color : 'rgba(255,255,255,0.1)',
              }}
              onClick={() => handleSelect(type)}
              disabled={isLoading}
            >
              <span className="type-icon">{type.icon}</span>
              <div className="type-text">
                <span className="type-label" style={{ color: selected?.id === type.id ? type.color : 'var(--text-primary)' }}>
                  {type.label}
                </span>
                <span className="type-desc">{type.desc}</span>
              </div>
              {selected?.id === type.id && <span className="type-check" style={{ color: type.color }}>✓</span>}
            </button>
          ))}
        </div>

        {/* AI Instructions */}
        {(isLoading || instructions) && (
          <div className="emergency-instructions" style={{ borderColor: selected?.border }}>
            <div className="instructions-header">
              <span className="instructions-icon">{selected?.icon}</span>
              <span className="instructions-title">
                {isLoading ? 'Getting instructions…' : 'AI Emergency Instructions'}
              </span>
            </div>
            {isLoading ? (
              <div className="instructions-loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            ) : (
              <div className="instructions-body">
                <ReactMarkdown>{instructions}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Help note */}
        <div className="emergency-note">
          📍 <strong>Gate 1 Information Desk</strong> (Lost &amp; Found) · <strong>Center Field First Aid</strong> · Staff in yellow/orange vests
        </div>
      </div>
    </div>
  );
}
