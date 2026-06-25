import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { ThumbsUp, MapPin, Sparkles, Filter, CheckCircle2, Trash2 } from 'lucide-react'

// Helper to create custom div-based markers to avoid asset load bugs and enable rich visuals
const createCustomIcon = (severity = 'Medium', category = 'Other', status = 'Reported') => {
  let emoji = '⚠️';
  if (status === 'Resolved') {
    emoji = '✅';
  } else if (status === 'Pending Verification') {
    emoji = '⏳';
  } else {
    const cat = (category || 'Other').toLowerCase();
    if (cat.includes('waste') || cat.includes('sanitation')) emoji = '🗑️';
    else if (cat.includes('road') || cat.includes('sidewalk') || cat.includes('infrastructure')) emoji = '🕳️';
    else if (cat.includes('light') || cat.includes('utility') || cat.includes('power')) emoji = '💡';
    else if (cat.includes('water') || cat.includes('leak') || cat.includes('pipe')) emoji = '💧';
    else if (cat.includes('safety') || cat.includes('hazard')) emoji = '🚨';
  }

  let markerClass = 'marker-low';
  if (status === 'Resolved') {
    markerClass = 'marker-resolved';
  } else if (status === 'Pending Verification') {
    markerClass = 'marker-medium'; // Orange pulsing marker
  } else {
    if (severity === 'Critical') markerClass = 'marker-critical';
    else if (severity === 'High') markerClass = 'marker-medium';
    else if (severity === 'Medium') markerClass = 'marker-low';
  }

  return L.divIcon({
    html: `<div class="custom-marker ${markerClass}">${emoji}</div>`,
    className: 'custom-leaflet-marker-wrapper',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// Coordinate mapping for cities
const CITY_COORDINATES = {
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Delhi: [28.6139, 77.2090],
  Mumbai: [19.0760, 72.8777]
};

// Component to dynamically re-center map when city changes
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapView({ reports, onVote, onDelete, currentUser, currentCity }) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [selectedReportId, setSelectedReportId] = useState(null);

  const selectedReport = selectedReportId ? reports.find(r => r.id === selectedReportId) : null;

  const center = CITY_COORDINATES[currentCity] || CITY_COORDINATES.Bengaluru;

  // Filtering reports
  const filteredReports = reports.filter(rep => {
    const matchCity = (rep.city || 'Bengaluru') === currentCity;
    const matchCat = filterCategory === 'All' || rep.category === filterCategory;
    const matchSev = filterSeverity === 'All' || rep.severity === filterSeverity;
    return matchCity && matchCat && matchSev;
  });

  const uniqueCategories = ['All', ...new Set(reports.map(r => r.category))];
  const uniqueSeverities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  // Severity style helper
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical': return { bg: 'var(--severity-critical-bg)', color: 'var(--severity-critical)' };
      case 'High': return { bg: 'var(--severity-medium-bg)', color: 'var(--severity-medium)' };
      case 'Medium': return { bg: 'var(--severity-low-bg)', color: 'var(--severity-low)' };
      default: return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' };
    }
  };

  // Status style helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return { bg: 'var(--severity-resolved-bg)', color: 'var(--severity-resolved)' };
      case 'Pending Verification': return { bg: 'var(--severity-medium-bg)', color: 'var(--severity-medium)' };
      case 'In Progress': return { bg: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)' };
      case 'Reported': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' };
      default: return { bg: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-dim)' };
    }
  };

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      {/* Header & Filters */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px', fontWeight: 800 }}>Hyperlocal Live Map</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Real-time location of community reports. Use pins to verify status.</p>
        </div>

        {/* Filter Panel */}
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white', 
              border: '1px solid var(--panel-border)', 
              borderRadius: '4px', 
              padding: '4px 8px', 
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white', 
              border: '1px solid var(--panel-border)', 
              borderRadius: '4px', 
              padding: '4px 8px', 
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {uniqueSeverities.map(sev => (
              <option key={sev} value={sev}>{sev === 'All' ? 'All Severities' : sev}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Grid: Map + Sidebar Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedReport ? '2fr 1fr' : '1fr', gap: '24px', transition: 'var(--transition-smooth)' }}>
        
        {/* Map Container */}
        <div className="map-container">
          <MapContainer 
            center={center} 
            zoom={13} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeMapView center={center} />
            {/* Dark themed map tiles (CartoDB Dark Matter) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {filteredReports.map(rep => {
              if (!rep.location?.latitude || !rep.location?.longitude) return null;
              return (
                <Marker 
                  key={rep.id}
                  position={[rep.location.latitude, rep.location.longitude]}
                  icon={createCustomIcon(rep.severity, rep.category, rep.status)}
                  eventHandlers={{
                    click: () => {
                      setSelectedReportId(rep.id);
                    },
                  }}
                >
                  {/* Popup for small screen fallback / hover */}
                  <Popup>
                    <div style={{ color: '#fff', fontSize: '12px', background: 'transparent' }}>
                      <strong style={{ display: 'block', fontSize: '13px', marginBottom: '2px' }}>{rep.title}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{rep.location.address}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Floating Side Info Panel (Only appears when marker clicked) */}
        {selectedReport && (
          <aside className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', position: 'relative' }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedReportId(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '12px' }}
            >
              ✕
            </button>

            {/* Report Image */}
            <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
              <img 
                src={selectedReport.imageUrl} 
                alt={selectedReport.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Status & Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ 
                  background: getSeverityBadge(selectedReport.severity).bg, 
                  color: getSeverityBadge(selectedReport.severity).color, 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {selectedReport.severity}
                </span>
                
                <span style={{ 
                  background: getStatusBadge(selectedReport.status).bg, 
                  color: getStatusBadge(selectedReport.status).color, 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {selectedReport.status}
                </span>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{selectedReport.title}</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} />
                {selectedReport.location.address}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              {selectedReport.description}
            </p>

            {/* Consensus stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--panel-border)' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', display: 'block', fontFamily: 'var(--font-display)' }}>
                  {selectedReport.consensusScore}%
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Trust Index</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--secondary)', display: 'block', fontFamily: 'var(--font-display)' }}>
                  {selectedReport.votes}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Verifications</span>
              </div>
            </div>

            {/* Verify/Vote Action Button */}
            {selectedReport.status !== 'Resolved' && (
              <button 
                onClick={() => onVote(selectedReport.id)}
                className="glow-button"
                style={{ width: '100%', padding: '10px', justifyContent: 'center' }}
              >
                <ThumbsUp size={16} />
                Verify This Issue (+10 Karma)
              </button>
            )}

            {selectedReport.status === 'Resolved' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '8px', background: 'var(--severity-resolved-bg)', color: 'var(--severity-resolved)', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                Resolved by Community Action
              </div>
            )}

             {/* Delete Report Button */}
             {selectedReport.reportedBy === currentUser?.id && (
               <button 
                 onClick={() => {
                   if (confirm(`Are you sure you want to remove the report "${selectedReport.title}"?`)) {
                     onDelete(selectedReport.id);
                     setSelectedReportId(null);
                   }
                 }}
                 style={{
                   width: '100%',
                   padding: '10px',
                   background: 'rgba(255, 74, 90, 0.05)',
                   border: '1px solid rgba(255, 74, 90, 0.15)',
                   color: 'var(--severity-critical)',
                   borderRadius: '6px',
                   fontSize: '12px',
                   fontWeight: 600,
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '8px',
                   transition: 'var(--transition-smooth)',
                   marginTop: '8px'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.background = 'rgba(255, 74, 90, 0.15)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.background = 'rgba(255, 74, 90, 0.05)';
                 }}
               >
                 <Trash2 size={14} />
                 Delete Report from Grid
               </button>
             )}

          </aside>
        )}

      </div>

    </div>
  )
}
