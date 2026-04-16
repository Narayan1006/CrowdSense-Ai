import React, { useState, useCallback, useEffect, useRef } from 'react';
import { STADIUM_CENTER, STADIUM_GATES, FOOD_STALLS, WASHROOMS, SEATING_BLOCKS, HELP_POINTS } from '../../data/stadiumData.js';
import './StadiumMap.css';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const hasMapKey = GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'your_google_maps_api_key_here';

// Crowd level color map
const LEVEL_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', unknown: '#6b7280' };

function CrowdBadge({ level }) {
  return (
    <span className="crowd-badge" style={{ background: LEVEL_COLORS[level] || LEVEL_COLORS.unknown }}>
      {level?.toUpperCase() || 'UNKNOWN'}
    </span>
  );
}

// SVG Stadium Map (used when no Maps API key)
function SVGStadiumMap({ crowdData, onLocationClick }) {
  const [tooltip, setTooltip] = useState(null);

  // Convert lat/lng to SVG coordinates
  // Stadium bounding box: lat 23.0884–23.0944, lng 72.5946–72.5998
  function toSVG(lat, lng) {
    const minLat = 23.0882, maxLat = 23.0944;
    const minLng = 72.5944, maxLng = 72.6000;
    const x = ((lng - minLng) / (maxLng - minLng)) * 680 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 50;
    return { x, y };
  }

  const markerConfig = {
    gate: { emoji: '🚪', color: '#3b82f6', size: 18, label: true },
    food: { emoji: '🍕', color: '#f59e0b', size: 14, label: false },
    washroom: { emoji: '🚻', color: '#06b6d4', size: 13, label: false },
    block: { emoji: '🎫', color: '#8b5cf6', size: 12, label: true },
    help: { emoji: '🆘', color: '#ef4444', size: 15, label: true },
  };

  const renderMarker = (loc) => {
    const { x, y } = toSVG(loc.position.lat, loc.position.lng);
    const cfg = markerConfig[loc.type] || markerConfig.gate;
    const crowdLevel = crowdData[loc.id]?.level;
    return (
      <g
        key={loc.id}
        transform={`translate(${x}, ${y})`}
        className="map-marker"
        onClick={() => onLocationClick(loc)}
        onMouseEnter={() => setTooltip({ loc, x, y })}
        onMouseLeave={() => setTooltip(null)}
        style={{ cursor: 'pointer' }}
      >
        <circle r={cfg.size} fill={cfg.color} fillOpacity="0.2" stroke={cfg.color} strokeWidth="2" />
        <text y="5" textAnchor="middle" fontSize={cfg.size * 0.85}>{cfg.emoji}</text>
        {crowdLevel && (
          <circle cx={cfg.size - 2} cy={-(cfg.size - 2)} r="5"
            fill={LEVEL_COLORS[crowdLevel]}
            stroke="#0a0e1a" strokeWidth="1.5" />
        )}
        {cfg.label && (
          <text y={cfg.size + 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="Inter, sans-serif">
            {loc.shortName || loc.name.replace('Gate ', 'G').replace('Block ', '')}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="svg-map-container">
      <div className="svg-map-label">🗺️ Stadium Map (Demo Mode — Add Google Maps API key for live map)</div>
      <svg
        viewBox="0 0 800 600"
        className="stadium-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="fieldGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#166534" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="800" height="600" fill="#0f172a" rx="16" />

        {/* Stadium outer boundary */}
        <ellipse cx="400" cy="300" rx="340" ry="260" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="2" strokeDasharray="8,4" />

        {/* Stadium seating bands */}
        <ellipse cx="400" cy="300" rx="310" ry="235" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)" strokeWidth="1" />
        <ellipse cx="400" cy="300" rx="275" ry="208" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.12)" strokeWidth="1" />
        <ellipse cx="400" cy="300" rx="240" ry="180" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.15)" strokeWidth="1" />

        {/* Playing field */}
        <ellipse cx="400" cy="300" rx="175" ry="140" fill="url(#fieldGrad)" stroke="#15803d" strokeWidth="2" />

        {/* Field markings */}
        <ellipse cx="400" cy="300" rx="140" ry="112" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="400" y1="165" x2="400" y2="435" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="230" y1="300" x2="570" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Pitch rectangle */}
        <rect x="380" y="255" width="40" height="90" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" rx="2" />
        {/* Stumps */}
        <rect x="393" y="257" width="14" height="4" fill="rgba(255,220,150,0.7)" rx="1" />
        <rect x="393" y="339" width="14" height="4" fill="rgba(255,220,150,0.7)" rx="1" />

        {/* Field label */}
        <text x="400" y="298" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="Inter, sans-serif">PLAYING</text>
        <text x="400" y="312" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="Inter, sans-serif">FIELD</text>

        {/* Seating Block Labels */}
        {SEATING_BLOCKS.map(block => {
          const { x, y } = toSVG(block.position.lat, block.position.lng);
          return (
            <g key={block.id}>
              <text x={x} y={y} textAnchor="middle" fill="rgba(139,92,246,0.7)" fontSize="13" fontWeight="600" fontFamily="Space Grotesk, sans-serif">
                {block.shortName}
              </text>
            </g>
          );
        })}

        {/* All markers */}
        {STADIUM_GATES.map(renderMarker)}
        {FOOD_STALLS.map(renderMarker)}
        {WASHROOMS.map(renderMarker)}
        {HELP_POINTS.map(renderMarker)}

        {/* Tooltip */}
        {tooltip && (() => {
          const { loc, x, y } = tooltip;
          const crowdLevel = crowdData[loc.id]?.level;
          const tw = 160, th = crowdLevel ? 68 : 52;
          const tx = Math.min(Math.max(x - tw / 2, 8), 800 - tw - 8);
          const ty = y < 200 ? y + 24 : y - th - 10;
          return (
            <g>
              <rect x={tx} y={ty} width={tw} height={th} rx="8" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <text x={tx + 10} y={ty + 18} fill="#f1f5f9" fontSize="12" fontWeight="600" fontFamily="Inter">{loc.name}</text>
              <text x={tx + 10} y={ty + 33} fill="#94a3b8" fontSize="10" fontFamily="Inter">{loc.description?.slice(0, 30)}…</text>
              {crowdLevel && (
                <text x={tx + 10} y={ty + 52} fill={LEVEL_COLORS[crowdLevel]} fontSize="10" fontWeight="600" fontFamily="Inter">
                  ● {crowdLevel?.toUpperCase()} CROWD
                </text>
              )}
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item"><span>🚪</span> Gate</div>
        <div className="legend-item"><span>🍕</span> Food</div>
        <div className="legend-item"><span>🚻</span> Washroom</div>
        <div className="legend-item"><span>🆘</span> Help</div>
        <div className="legend-sep">|</div>
        <div className="legend-item crowd-low">● Low</div>
        <div className="legend-item crowd-med">● Medium</div>
        <div className="legend-item crowd-high">● High</div>
      </div>
    </div>
  );
}

// Create custom marker icon SVG as a data URL
function createMarkerIcon(type, crowdLevel) {
  const typeConfig = {
    gate:     { bg: '#1d4ed8', border: '#3b82f6', label: 'G', emoji: '🚪', size: 36 },
    food:     { bg: '#92400e', border: '#f59e0b', label: 'F', emoji: '🍕', size: 30 },
    washroom: { bg: '#164e63', border: '#06b6d4', label: 'W', emoji: '🚻', size: 30 },
    help:     { bg: '#7f1d1d', border: '#ef4444', label: 'H', emoji: '🆘', size: 32 },
  };
  const cfg = typeConfig[type] || typeConfig.gate;
  const crowdColor = LEVEL_COLORS[crowdLevel] || 'transparent';
  const showCrowd = crowdLevel && crowdLevel !== 'unknown';
  const s = cfg.size;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s + 8}" viewBox="0 0 ${s} ${s + 8}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
        </filter>
      </defs>
      <circle cx="${s/2}" cy="${s/2}" r="${s/2 - 2}" fill="${cfg.bg}" stroke="${cfg.border}" stroke-width="2" filter="url(#shadow)"/>
      <text x="${s/2}" y="${s/2 + 5}" text-anchor="middle" font-size="${s * 0.42}" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif">${cfg.emoji}</text>
      ${showCrowd ? `<circle cx="${s - 6}" cy="6" r="5" fill="${crowdColor}" stroke="white" stroke-width="1.5"/>` : ''}
      <polygon points="${s/2 - 5},${s - 2} ${s/2 + 5},${s - 2} ${s/2},${s + 6}" fill="${cfg.border}"/>
    </svg>
  `;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Google Maps version
function GoogleMapsView({ crowdData, onLocationClick }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  // Dynamically load Google Maps
  useEffect(() => {
    if (window.google) { setIsLoaded(true); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Google Maps failed to load');
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center: STADIUM_CENTER,
      zoom: 17,
      mapTypeId: mapType,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });
    googleMapRef.current = map;

    const allLocs = [...STADIUM_GATES, ...FOOD_STALLS, ...WASHROOMS, ...HELP_POINTS];
    markersRef.current = allLocs.map(loc => {
      const crowdLevel = crowdData[loc.id]?.level;
      const iconUrl = createMarkerIcon(loc.type, crowdLevel);
      const s = loc.type === 'gate' ? 36 : loc.type === 'help' ? 32 : 30;
      const marker = new google.maps.Marker({
        position: loc.position,
        map,
        title: loc.name,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(s, s + 8),
          anchor: new google.maps.Point(s / 2, s + 8),
        },
      });
      marker.addListener('click', () => {
        setSelectedLocation(loc);
        onLocationClick(loc);
      });
      return { marker, loc };
    });

    // Close info card when clicking map background
    map.addListener('click', () => setSelectedLocation(null));
  }, [isLoaded]);

  // Update marker icons when crowd data changes
  useEffect(() => {
    if (!isLoaded || !window.google) return;
    markersRef.current.forEach(({ marker, loc }) => {
      const crowdLevel = crowdData[loc.id]?.level;
      const iconUrl = createMarkerIcon(loc.type, crowdLevel);
      const s = loc.type === 'gate' ? 36 : loc.type === 'help' ? 32 : 30;
      marker.setIcon({
        url: iconUrl,
        scaledSize: new window.google.maps.Size(s, s + 8),
        anchor: new window.google.maps.Point(s / 2, s + 8),
      });
    });
  }, [crowdData, isLoaded]);

  // Switch map type
  const toggleMapType = () => {
    const newType = mapType === 'satellite' ? 'roadmap' : 'satellite';
    setMapType(newType);
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(newType);
    }
  };

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <div className="map-loading-spinner" />
        <span>Loading Google Maps…</span>
      </div>
    );
  }

  return (
    <div className="google-map-wrapper">
      {/* Map type toggle */}
      <div className="map-type-toggle">
        <button
          className={`map-type-btn ${mapType === 'satellite' ? 'active' : ''}`}
          onClick={() => { setMapType('satellite'); googleMapRef.current?.setMapTypeId('satellite'); }}
        >🛰 Satellite</button>
        <button
          className={`map-type-btn ${mapType === 'roadmap' ? 'active' : ''}`}
          onClick={() => { setMapType('roadmap'); googleMapRef.current?.setMapTypeId('roadmap'); }}
        >🗺 Map</button>
      </div>

      <div ref={mapRef} className="google-map" />

      {/* Location info card overlay */}
      {selectedLocation && (
        <div className="map-info-card">
          <div className="map-info-header">
            <span className="map-info-icon">
              {selectedLocation.type === 'gate' ? '🚪' :
               selectedLocation.type === 'food' ? '🍕' :
               selectedLocation.type === 'washroom' ? '🚻' : '🆘'}
            </span>
            <div>
              <h4 className="map-info-name">{selectedLocation.name}</h4>
              <p className="map-info-desc">{selectedLocation.description}</p>
            </div>
            <button className="info-close" onClick={() => setSelectedLocation(null)}>✕</button>
          </div>
          <div className="map-info-body">
            {crowdData[selectedLocation.id] && (
              <div className="map-info-row">
                <span className="map-info-label">Crowd</span>
                <CrowdBadge level={crowdData[selectedLocation.id].level} />
              </div>
            )}
            {selectedLocation.blocks && (
              <div className="map-info-row">
                <span className="map-info-label">Serves</span>
                <span className="map-info-value">{selectedLocation.blocks.join(', ')}</span>
              </div>
            )}
            {selectedLocation.parking && (
              <div className="map-info-row">
                <span className="map-info-label">Parking</span>
                <span className="map-info-value">{selectedLocation.parking}</span>
              </div>
            )}
            {selectedLocation.transport && (
              <div className="map-info-row">
                <span className="map-info-label">Transport</span>
                <span className="map-info-value">{selectedLocation.transport}</span>
              </div>
            )}
            {selectedLocation.items && (
              <div className="map-info-row">
                <span className="map-info-label">Menu</span>
                <span className="map-info-value">{selectedLocation.items.join(' · ')}</span>
              </div>
            )}
            {selectedLocation.phone && (
              <a href={`tel:${selectedLocation.phone}`} className="map-info-phone">
                📞 Call {selectedLocation.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="google-map-legend">
        <div className="gml-item"><span className="gml-dot" style={{background:'#3b82f6'}}/>Gate</div>
        <div className="gml-item"><span className="gml-dot" style={{background:'#f59e0b'}}/>Food</div>
        <div className="gml-item"><span className="gml-dot" style={{background:'#06b6d4'}}/>Washroom</div>
        <div className="gml-item"><span className="gml-dot" style={{background:'#ef4444'}}/>Help</div>
        <div className="gml-sep">|</div>
        <div className="gml-item"><span className="gml-dot" style={{background:'#10b981'}}/>Low</div>
        <div className="gml-item"><span className="gml-dot" style={{background:'#f59e0b'}}/>Medium</div>
        <div className="gml-item"><span className="gml-dot" style={{background:'#ef4444'}}/>High</div>
      </div>
    </div>
  );
}

// Main StadiumMap component
export default function StadiumMap({ crowdData }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationClick = useCallback((loc) => {
    setSelectedLocation(loc);
  }, []);

  return (
    <div className="stadium-map-panel">
      <div className="map-header">
        <div className="map-header-left">
          <h3>🗺️ Narendra Modi Stadium</h3>
          <span className="map-subtitle">Motera, Ahmedabad · Capacity: 132,000</span>
        </div>
        <div className="map-header-right">
          {!hasMapKey && (
            <span className="demo-badge">Demo Mode</span>
          )}
          {hasMapKey && (
            <span className="live-map-badge">🛰️ Live Map</span>
          )}
        </div>
      </div>

      <div className="map-content">
        {hasMapKey ? (
          <GoogleMapsView crowdData={crowdData} onLocationClick={handleLocationClick} />
        ) : (
          <>
            <SVGStadiumMap crowdData={crowdData} onLocationClick={handleLocationClick} />
            {/* Location detail card for SVG mode */}
            {selectedLocation && (
              <div className="location-detail-card">
                <div className="location-detail-header">
                  <div className="location-icon">
                    {selectedLocation.type === 'gate' ? '🚪' :
                     selectedLocation.type === 'food' ? '🍕' :
                     selectedLocation.type === 'washroom' ? '🚻' : '🆘'}
                  </div>
                  <div>
                    <h4>{selectedLocation.name}</h4>
                    <p className="location-desc">{selectedLocation.description}</p>
                  </div>
                  <button className="detail-close" onClick={() => setSelectedLocation(null)}>✕</button>
                </div>
                <div className="location-detail-body">
                  {crowdData[selectedLocation.id] && (
                    <div className="detail-row">
                      <span>Crowd Level</span>
                      <CrowdBadge level={crowdData[selectedLocation.id].level} />
                    </div>
                  )}
                  {selectedLocation.blocks && (
                    <div className="detail-row">
                      <span>Serves Blocks</span>
                      <span className="detail-value">{selectedLocation.blocks.join(', ')}</span>
                    </div>
                  )}
                  {selectedLocation.parking && (
                    <div className="detail-row">
                      <span>Parking</span>
                      <span className="detail-value">{selectedLocation.parking}</span>
                    </div>
                  )}
                  {selectedLocation.transport && (
                    <div className="detail-row">
                      <span>Transport</span>
                      <span className="detail-value">{selectedLocation.transport}</span>
                    </div>
                  )}
                  {selectedLocation.items && (
                    <div className="detail-row">
                      <span>Menu</span>
                      <span className="detail-value">{selectedLocation.items.join(' · ')}</span>
                    </div>
                  )}
                  {selectedLocation.phone && (
                    <div className="detail-row">
                      <span>Emergency</span>
                      <span className="detail-value emergency-phone">📞 {selectedLocation.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
