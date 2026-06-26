import React from 'react'
import { ShieldAlert, ClipboardCheck, CheckCircle2, Award, ThumbsUp, MapPin, Sparkles, Trash2 } from 'lucide-react'

export default function Dashboard({ reports, leaderboard, setView, onVote, onDelete, currentUser, currentCity }) {
  // Filter reports for the active city scope
  const cityReports = reports.filter(r => (r.city || 'Bengaluru') === currentCity);

  // Compute metrics
  const totalReports = cityReports.length;
  const resolvedCount = cityReports.filter(r => r.status === 'Resolved').length;
  const pendingCount = totalReports - resolvedCount;
  
  // Calculate average consensus score
  const avgConsensus = totalReports > 0
    ? Math.round(cityReports.reduce((acc, curr) => acc + curr.consensusScore, 0) / totalReports)
    : 100;

  // Get active reports (non-resolved) for feed
  const activeReports = cityReports.filter(r => r.status !== 'Resolved');

  // AI Predictive Insights Data mapping
  const cityForecasts = {
    Bengaluru: {
      hotspot: 'Sector 4, Near Tech Park Circle',
      riskName: 'Road Subsidence / Pothole Expansion',
      riskScore: 92,
      riskLevel: 'Critical',
      resolutionTime: '4.8 Days',
      queueLoad: 'High Queue Density',
      activeDepartment: 'Municipal Road Maintenance & Sidewalk Division',
      alertMessage: 'Monsoon drainage clogging detected nearby. Risk of deep street cracking is elevated.'
    },
    Chennai: {
      hotspot: 'Block B, Commercial Zone',
      riskName: 'Public Health & Pest Accumulation',
      riskScore: 85,
      riskLevel: 'High',
      resolutionTime: '2.4 Days',
      queueLoad: 'Normal Queue Density',
      activeDepartment: 'City Solid Waste Management Department',
      alertMessage: 'Increasing commercial garbage accumulations during peak hours. High risk of pest infestation.'
    },
    Delhi: {
      hotspot: 'Metro Station Exit Corridor',
      riskName: 'Pavement Wash-out & Local Flooding',
      riskScore: 88,
      riskLevel: 'High',
      resolutionTime: '3.1 Days',
      queueLoad: 'High Pressure Load',
      activeDepartment: 'Electrical & Water Board Authority',
      alertMessage: 'Clean water pipeline pressure leak is eroding road sub-base. Risk of surface sinkhole.'
    },
    Mumbai: {
      hotspot: 'Crossroad Junction, Sector 2',
      riskName: 'Pedestrian Sightline Obstruction',
      riskScore: 60,
      riskLevel: 'Medium',
      resolutionTime: '1.5 Days',
      queueLoad: 'Low Queue Density',
      activeDepartment: 'Civil Defense & Safety Commissioner',
      alertMessage: 'Unsanctioned commercial placement blocking street markers. Elevated pedestrian-vehicle collision risk.'
    }
  };

  const forecast = cityForecasts[currentCity] || cityForecasts.Bengaluru;

  // Status and Severity styling helpers
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical': return { bg: 'var(--severity-critical-bg)', color: 'var(--severity-critical)' };
      case 'High': return { bg: 'var(--severity-medium-bg)', color: 'var(--severity-medium)' };
      case 'Medium': return { bg: 'var(--severity-low-bg)', color: 'var(--severity-low)' };
      default: return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return { bg: 'var(--severity-resolved-bg)', color: 'var(--severity-resolved)' };
      case 'Pending Verification': return { bg: 'var(--severity-medium-bg)', color: 'var(--severity-medium)' };
      case 'In Progress': return { bg: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)' };
      case 'Reported': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' };
      default: return { bg: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-dim)' };
    }
  };

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Banner */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '6px', fontWeight: 800 }}>Welcome Back, Hero</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Hyperlocal action dashboard for your community. Identify, report, and verify issues.</p>
        </div>
        <button 
          onClick={() => setView('report')} 
          className="glow-button"
        >
          <ShieldAlert size={18} />
          Report New Issue
        </button>
      </header>

      {/* Metrics Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Metric 1: Total Reports */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Reports</span>
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{totalReports}</span>
          </div>
        </div>

        {/* Metric 2: Pending Action */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--severity-medium)', padding: '12px', borderRadius: '12px' }}>
            <ClipboardCheck size={28} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Grid</span>
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{pendingCount}</span>
          </div>
        </div>

        {/* Metric 3: Resolved */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--severity-resolved)', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</span>
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{resolvedCount}</span>
          </div>
        </div>

        {/* Metric 4: Trust Index */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
            <Award size={28} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consensus Rate</span>
            <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{avgConsensus}%</span>
          </div>
        </div>

      </section>

      {/* Main Grid: Feed + Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Active Local Incidents */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔴 Active Incidents Near You
            </h2>
            <button 
              onClick={() => setView('map')} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              View on Map
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeReports.map(rep => {
              const sev = getSeverityStyle(rep.severity);
              const alreadyVoted = rep.votedBy?.includes(currentUser?.id || 'current-user');
              
              return (
                 <div key={rep.id} className="glass-panel" style={{ display: 'flex', padding: '18px', gap: '16px', flexWrap: 'wrap', position: 'relative' }}>
                   
                   {/* Delete/Remove Report button */}
                   {rep.reportedBy === currentUser?.id && (
                     <button 
                       onClick={() => {
                         if (confirm(`Are you sure you want to remove the report "${rep.title}"?`)) {
                           onDelete(rep.id);
                         }
                       }}
                       style={{
                         position: 'absolute',
                         top: '18px',
                         right: '18px',
                         background: 'rgba(255, 74, 90, 0.06)',
                         border: '1px solid rgba(255, 74, 90, 0.18)',
                         color: 'var(--severity-critical)',
                         borderRadius: '6px',
                         width: '28px',
                         height: '28px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         cursor: 'pointer',
                         transition: 'var(--transition-smooth)',
                         padding: 0,
                         zIndex: 5
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.background = 'rgba(255, 74, 90, 0.18)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.background = 'rgba(255, 74, 90, 0.06)';
                       }}
                       title="Remove Report"
                     >
                       <Trash2 size={13} />
                     </button>
                   )}
                  
                  {/* Report Photo Thumbnail */}
                  <div style={{ width: '120px', height: '100px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'rgba(0,0,0,0.5)' }}>
                    <img 
                      src={rep.imageUrl} 
                      alt={rep.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '6px', 
                      left: '6px', 
                      background: 'rgba(0,0,0,0.7)', 
                      backdropFilter: 'blur(4px)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 600,
                      color: 'var(--primary)'
                    }}>
                      {rep.category.split(' ')[0]}
                    </div>
                  </div>

                  {/* Incident Text Info */}
                  <div style={{ flexGrow: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ background: sev.bg, color: sev.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {rep.severity}
                        </span>
                        <span style={{ 
                          background: getStatusStyle(rep.status).bg, 
                          color: getStatusStyle(rep.status).color, 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          textTransform: 'uppercase' 
                        }}>
                          {rep.status}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} />
                          {rep.location.address}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{rep.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{rep.description}</p>
                    </div>

                    {/* Report Stats & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>🔥 <b>{rep.consensusScore}%</b> Consensus</span>
                        <span>👍 <b>{rep.votes}</b> Verifications</span>
                      </div>
                      
                      <button 
                        onClick={() => onVote(rep.id)}
                        style={{
                          background: alreadyVoted ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: alreadyVoted ? 'var(--primary)' : 'var(--text-main)',
                          border: '1px solid ' + (alreadyVoted ? 'var(--primary)' : 'var(--panel-border)'),
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        <ThumbsUp size={12} fill={alreadyVoted ? 'var(--primary)' : 'none'} />
                        {alreadyVoted ? 'Verified' : 'Verify'}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
            
            {activeReports.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--severity-resolved)', marginBottom: '12px' }} />
                <p>All reported local issues have been resolved. Excellent job, community!</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Gamified Leaderboard */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👑 Top Heroes
          </h2>
          
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {(() => {
              const localLeaderboard = leaderboard
                .filter(user => user.city === currentCity)
                .sort((a, b) => b.points - a.points)
                .map((user, i) => ({ ...user, cityRank: i + 1 }));

              if (localLeaderboard.length === 0) {
                return (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No heroes active in {currentCity} yet. Be the first!
                  </div>
                );
              }

              return localLeaderboard.map(user => {
                const isCurrentUser = user.name.includes('(You)');
                
                return (
                  <div 
                    key={user.name} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: isCurrentUser ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      border: isCurrentUser ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Rank Indicator */}
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700,
                        fontSize: '12px',
                        background: user.cityRank === 1 ? 'gold' : user.cityRank === 2 ? '#c0c0c0' : user.cityRank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.05)',
                        color: user.cityRank <= 3 ? '#000' : 'var(--text-muted)'
                      }}>
                        {user.cityRank}
                      </div>
                      
                      {/* User Details */}
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: isCurrentUser ? 'var(--primary)' : 'var(--text-main)' }}>
                          {user.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                          {user.badges.map(b => (
                            <span key={b} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--secondary)', display: 'block' }}>
                        {user.points}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Karma</span>
                    </div>

                  </div>
                );
              });
            })()}

            {/* Gamification Tip Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(20,184,166,0.1))', padding: '12px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.15)', display: 'flex', gap: '10px' }}>
              <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Earn <b>50 Karma Points</b> by reporting new issues and <b>10 Karma Points</b> by verifying reports. Keep our neighborhood safe!
              </p>
            </div>

          </div>

          {/* AI Predictive Insights & Risks Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px', margin: 0 }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              AI Predictive Insights & Risks
            </h3>

            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                Primary Risk Hotspot
              </span>
              <span style={{ fontSize: '13px', color: 'white', fontWeight: 700 }}>
                📍 {forecast.hotspot}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {forecast.riskName}
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  color: forecast.riskLevel === 'Critical' ? 'var(--severity-critical)' : 'var(--severity-medium)'
                }}>
                  {forecast.riskLevel} ({forecast.riskScore}%)
                </span>
              </div>
              
              {/* Risk Meter Progress Bar */}
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  className="risk-pulse-bar"
                  style={{ 
                    height: '100%', 
                    width: `${forecast.riskScore}%`, 
                    background: forecast.riskLevel === 'Critical' ? 'var(--severity-critical)' : 'var(--severity-medium)',
                    borderRadius: '3px',
                    boxShadow: forecast.riskLevel === 'Critical' ? '0 0 8px var(--severity-critical)' : '0 0 8px var(--severity-medium)'
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)' }}>
              <div style={{ borderRight: '1px solid var(--panel-border)', paddingRight: '8px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                  Est. Resolution
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--secondary)' }}>
                  ⏱️ {forecast.resolutionTime}
                </span>
              </div>
              <div style={{ paddingLeft: '4px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                  Queue Workload
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  📈 {forecast.queueLoad}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                Assigned Authority Task Queue
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', lineHeight: '1.4' }}>
                🏛️ {forecast.activeDepartment}
              </span>
            </div>

            <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', padding: '12px', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              💡 <b>AI Recommendation:</b> {forecast.alertMessage}
            </div>
          </div>
        </section>
        
      </div>

    </div>
  )
}
