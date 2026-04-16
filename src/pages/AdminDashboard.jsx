import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate }              from 'react-router-dom';
import { useAuth }                         from '../context/AuthContext.jsx';
import { STADIUM_GATES, FOOD_STALLS, WASHROOMS } from '../data/stadiumData.js';
import {
  subscribeToCrowdData, updateCrowdLevel,
  subscribeToAlerts,   sendAlert,   dismissAlert,
  subscribeToIncidents, logIncident, resolveIncident,
} from '../services/firebaseService.js';
import { optimizeCrowdDistribution } from '../services/geminiService.js';
import './AdminDashboard.css';

// ─── Helpers ───────────────────────────────────────────
const LEVEL_OPTS = ['low', 'medium', 'high'];
const lvlColor   = l => l === 'low' ? 'lp-low' : l === 'medium' ? 'lp-medium' : l === 'high' ? 'lp-high' : 'lp-unknown';
const lvlDot     = l => l === 'low' ? '🟢' : l === 'medium' ? '🟡' : l === 'high' ? '🔴' : '⚪';
const fmtTime    = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate    = ts => new Date(ts).toLocaleDateString([], { day:'2-digit', month:'short' });


// ─── Crowd Control Panel ───────────────────────────────
function CrowdControlPanel({ crowdData, onChange }) {
  const [flash, setFlash] = useState({});

  const handleChange = async (id, value) => {
    await onChange(id, value);
    setFlash(f => ({ ...f, [id]: true }));
    setTimeout(() => setFlash(f => ({ ...f, [id]: false })), 800);
  };

  const groups = [
    { label: '🚪 Gates', items: STADIUM_GATES,    badge: 'tb-gate' },
    { label: '🍕 Food Stalls', items: FOOD_STALLS, badge: 'tb-food' },
    { label: '🚻 Washrooms', items: WASHROOMS,     badge: 'tb-washroom' },
  ];

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <h3>📊 Crowd Control Panel</h3>
          <p className="panel-subtitle">Update crowd levels — changes sync to visitors in real-time</p>
        </div>
        <span className="panel-subtitle" style={{ color: '#475569' }}>
          {Object.keys(crowdData).length} locations
        </span>
      </div>
      <div className="crowd-table-wrap">
        <table className="crowd-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Current Level</th>
              <th>Override</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <React.Fragment key={group.label}>
                <tr className="group-row"><td colSpan={4}>{group.label}</td></tr>
                {group.items.map(loc => {
                  const data   = crowdData[loc.id] || {};
                  const level  = data.level || 'unknown';
                  return (
                    <tr key={loc.id}>
                      <td>
                        {loc.name}
                        <span className={`type-badge ${group.badge}`}>
                          {loc.type}
                        </span>
                      </td>
                      <td>
                        <span className={`level-pill ${lvlColor(level)}`}>
                          {lvlDot(level)} {level.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <select
                            className="crowd-select"
                            value={level}
                            onChange={e => handleChange(loc.id, e.target.value)}
                          >
                            {LEVEL_OPTS.map(o => (
                              <option key={o} value={o}>
                                {o === 'low' ? '🟢 Low' : o === 'medium' ? '🟡 Medium' : '🔴 High'}
                              </option>
                            ))}
                          </select>
                          {flash[loc.id] && <span className="update-indicator" title="Updated!" />}
                        </div>
                      </td>
                      <td style={{ fontSize: '11px', color: '#475569' }}>
                        {data.updatedAt ? fmtTime(data.updatedAt) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── Alerts Panel ──────────────────────────────────────
function AlertsPanel({ alerts, onDismiss }) {
  const [msg, setMsg]      = useState('');
  const [sev, setSev]      = useState('info');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    await sendAlert(msg.trim(), sev);
    setMsg('');
    setSending(false);
  };

  const sevIcons = { info: 'ℹ️', warning: '⚠️', critical: '🚨' };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <h3>📢 Broadcast Alerts</h3>
          <p className="panel-subtitle">Push real-time messages to all stadium visitors</p>
        </div>
        <span style={{ fontSize: 12, color: '#64748b' }}>{alerts.length} active</span>
      </div>

      <div className="alert-composer">
        <div className="alert-composer-row">
          <input
            className="alert-input"
            type="text"
            placeholder='e.g. "Gate 2 is closed — please use Gate 5"'
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <select className="severity-select" value={sev} onChange={e => setSev(e.target.value)}>
            <option value="info">ℹ️ Info</option>
            <option value="warning">⚠️ Warning</option>
            <option value="critical">🚨 Critical</option>
          </select>
          <button className="send-btn" onClick={handleSend} disabled={sending || !msg.trim()}>
            {sending ? 'Sending…' : '📤 Send'}
          </button>
        </div>
        <p className="alert-hint">Press Enter or click Send. Alert instantly appears in visitor app.</p>
      </div>

      <div className="active-alerts-list">
        {alerts.length === 0
          ? <p className="no-alerts">✅ No active alerts — stadium looks good!</p>
          : alerts.map(a => (
            <div key={a.id} className={`alert-item ${a.severity || 'info'}`}>
              <span className="ai-icon">{sevIcons[a.severity] || '📣'}</span>
              <div className="ai-content">
                <p className="ai-msg">{a.message}</p>
                <div className="ai-meta">
                  <span className={`sev-tag sev-${a.severity || 'info'}`}>{a.severity || 'info'}</span>
                  <span>{fmtTime(a.createdAt)}</span>
                </div>
              </div>
              <button className="dismiss-btn" onClick={() => onDismiss(a.id)} title="Delete alert">×</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}


// ─── Incidents Panel ───────────────────────────────────
function IncidentsPanel({ incidents, onLog, onResolve }) {
  const [desc, setDesc]     = useState('');
  const [logging, setLogging] = useState(false);

  const handle = async (type) => {
    setLogging(true);
    await onLog(type, desc.trim() || `${type} incident reported`);
    setDesc('');
    setLogging(false);
  };

  const incConfig = [
    { type: 'medical',  label: '🏥 Medical',  cls: 'inc-medical' },
    { type: 'lost',     label: '📍 Lost Person', cls: 'inc-lost' },
    { type: 'security', label: '👮 Security',  cls: 'inc-security' },
  ];

  const badgeCls = t => t === 'medical' ? 'ib-medical' : t === 'lost' ? 'ib-lost' : 'ib-security';
  const badgeIcon= t => t === 'medical' ? '🏥' : t === 'lost' ? '📍' : '👮';

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <h3>🚨 Incident Management</h3>
          <p className="panel-subtitle">Quick-log incidents — stored in Firebase with timestamps</p>
        </div>
        <span style={{ fontSize: 12, color: '#ef4444' }}>
          {incidents.filter(i => i.status === 'open').length} open
        </span>
      </div>

      <div className="incident-composer">
        <textarea
          className="incident-desc"
          placeholder="Optional: describe the incident, location, names…"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
        />
        <div className="incident-btns">
          {incConfig.map(cfg => (
            <button
              key={cfg.type}
              className={`inc-btn ${cfg.cls}`}
              onClick={() => handle(cfg.type)}
              disabled={logging}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="incident-log">
        {incidents.length === 0
          ? <p className="no-incidents">✅ No incidents logged yet</p>
          : (
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => (
                  <tr key={inc.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div>{fmtTime(inc.createdAt)}</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{fmtDate(inc.createdAt)}</div>
                    </td>
                    <td>
                      <span className={`inc-badge ${badgeCls(inc.type)}`}>
                        {badgeIcon(inc.type)} {inc.type}
                      </span>
                    </td>
                    <td style={{ maxWidth: 240, wordBreak: 'break-word' }}>{inc.description}</td>
                    <td>
                      <span className={inc.status === 'open' ? 'status-open' : 'status-resolved'}>
                        {inc.status === 'open' ? '● Open' : '✓ Resolved'}
                      </span>
                    </td>
                    <td>
                      {inc.status === 'open' && (
                        <button className="resolve-btn" onClick={() => onResolve(inc.id)}>
                          Resolve ✓
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}


// ─── AI Optimizer Panel ────────────────────────────────
function OptimizePanel({ crowdData }) {
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);

  const lowCount  = Object.values(crowdData).filter(d => d.level === 'low').length;
  const medCount  = Object.values(crowdData).filter(d => d.level === 'medium').length;
  const highCount = Object.values(crowdData).filter(d => d.level === 'high').length;

  const runOptimize = async () => {
    setLoading(true);
    const res = await optimizeCrowdDistribution(crowdData);
    setResult(res);
    setLoading(false);
  };

  const actionCls = a => a === 'open' ? 'a-open' : a === 'redirect' ? 'a-redirect' : a === 'close' ? 'a-close' : 'a-monitor';
  const statusCls = s => s === 'critical' ? 'sb-critical' : s === 'moderate' ? 'sb-moderate' : 'sb-normal';

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <h3>✨ AI Crowd Optimizer</h3>
          <p className="panel-subtitle">Powered by Google Gemini AI — real-time redistribution analysis</p>
        </div>
      </div>
      <div className="optimize-panel-body">
        <p className="opt-intro">
          Click <strong>Analyze &amp; Optimize</strong> to let Gemini AI analyze current crowd patterns
          and generate specific gate/zone redistribution recommendations for operations staff.
        </p>

        <div className="crowd-snapshot">
          <div className="snap-card sc-low">
            <span className="snap-count">{lowCount}</span>
            <span className="snap-label">🟢 Low Zones</span>
          </div>
          <div className="snap-card sc-med">
            <span className="snap-count">{medCount}</span>
            <span className="snap-label">🟡 Medium Zones</span>
          </div>
          <div className="snap-card sc-high">
            <span className="snap-count">{highCount}</span>
            <span className="snap-label">🔴 High Zones</span>
          </div>
        </div>

        <button className="optimize-btn" onClick={runOptimize} disabled={loading}>
          {loading
            ? <><span className="opt-spinner" /> Analyzing crowd data…</>
            : <>✨ Analyze &amp; Optimize</>
          }
        </button>

        {result && (
          <div className="opt-result">
            <div className="opt-result-header">
              <span>🤖</span>
              <h4>Gemini AI Crowd Analysis</h4>
              <span className={`status-badge ${statusCls(result.overallStatus)}`}>
                {result.overallStatus?.toUpperCase()}
              </span>
            </div>
            <div className="opt-result-body">
              {result.urgentActions?.length > 0 && (
                <div>
                  <p className="opt-section-title">⚡ Urgent Actions</p>
                  <ul className="urgent-list">
                    {result.urgentActions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              {result.gateRecommendations?.length > 0 && (
                <div>
                  <p className="opt-section-title">🚪 Gate Recommendations</p>
                  <div className="gate-recs">
                    {result.gateRecommendations.map((r, i) => (
                      <div key={i} className="gate-rec-item">
                        <span className="gate-rec-name">{r.gate}</span>
                        <span className={`action-btn ${actionCls(r.action)}`}>{r.action?.toUpperCase()}</span>
                        <span className="gate-rec-reason">{r.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.estimatedRelief && (
                <p className="relief-note">⏱ {result.estimatedRelief}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Main Admin Dashboard ──────────────────────────────
export default function AdminDashboard() {
  const [crowdData,  setCrowdData]  = useState({});
  const [alerts,     setAlerts]     = useState([]);
  const [incidents,  setIncidents]  = useState([]);
  const [activeTab,  setActiveTab]  = useState('crowd');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const u1 = subscribeToCrowdData(setCrowdData);
    const u2 = subscribeToAlerts(setAlerts);
    const u3 = subscribeToIncidents(setIncidents);
    return () => { u1(); u2(); u3(); };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const lowCount      = Object.values(crowdData).filter(d => d.level === 'low').length;
  const medCount      = Object.values(crowdData).filter(d => d.level === 'medium').length;
  const highCount     = Object.values(crowdData).filter(d => d.level === 'high').length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;

  const tabs = [
    { id: 'crowd',     label: '📊 Crowd Control', badge: highCount > 0 ? highCount : null },
    { id: 'alerts',    label: '📢 Alerts',         badge: alerts.length > 0 ? alerts.length : null },
    { id: 'incidents', label: '🚨 Incidents',      badge: openIncidents > 0 ? openIncidents : null },
    { id: 'optimize',  label: '✨ AI Optimizer',   badge: null },
  ];

  return (
    <div className="admin-app">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <span className="admin-logo-icon">🏟️</span>
          <div className="admin-logo-text">
            <h1>SenseCrowd AI</h1>
            <span className="admin-logo-sub">Admin Dashboard · Narendra Modi Stadium, Ahmedabad</span>
          </div>
        </div>
        <div className="admin-header-right">
          <span className="admin-mode-badge">🔑 Admin Mode</span>
          {user?.email && (
            <span className="admin-email-badge">📧 {user.email}</span>
          )}
          <button className="admin-logout-btn" onClick={handleLogout} title="Sign out">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="admin-stats-bar">
        <div className="admin-stat">
          <span className="stat-val val-low">{lowCount}</span>
          <span className="stat-lbl">🟢 Low Zones</span>
        </div>
        <div className="stat-divider" />
        <div className="admin-stat">
          <span className="stat-val val-med">{medCount}</span>
          <span className="stat-lbl">🟡 Med Zones</span>
        </div>
        <div className="stat-divider" />
        <div className="admin-stat">
          <span className="stat-val val-high">{highCount}</span>
          <span className="stat-lbl">🔴 High Zones</span>
        </div>
        <div className="stat-divider" />
        <div className="admin-stat">
          <span className="stat-val val-alert">{alerts.length}</span>
          <span className="stat-lbl">⚠️ Active Alerts</span>
        </div>
        <div className="stat-divider" />
        <div className="admin-stat">
          <span className="stat-val val-incident">{openIncidents}</span>
          <span className="stat-lbl">🚨 Open Incidents</span>
        </div>
      </div>

      {/* Tab nav */}
      <nav className="admin-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.badge != null && <span className="tab-badge">{t.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="admin-main">
        {activeTab === 'crowd' && (
          <CrowdControlPanel
            crowdData={crowdData}
            onChange={updateCrowdLevel}
          />
        )}
        {activeTab === 'alerts' && (
          <AlertsPanel
            alerts={alerts}
            onDismiss={dismissAlert}
          />
        )}
        {activeTab === 'incidents' && (
          <IncidentsPanel
            incidents={incidents}
            onLog={logIncident}
            onResolve={resolveIncident}
          />
        )}
        {activeTab === 'optimize' && (
          <OptimizePanel crowdData={crowdData} />
        )}
      </main>
    </div>
  );
}
