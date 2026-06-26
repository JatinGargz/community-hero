import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Map, PlusCircle, Inbox, Settings, ShieldAlert, Award, Key, Check, Gift } from 'lucide-react'
import Dashboard from './components/Dashboard'
import MapView from './components/MapView'
import ReportIssue from './components/ReportIssue'
import CivicInbox from './components/CivicInbox'
import RewardsShop from './components/RewardsShop'
import Login from './components/Login'
import { getGeminiApiKey, saveGeminiApiKey } from './services/agents'

// Initial mock reports to make the map and feeds look full and alive instantly
const INITIAL_REPORTS = [
  {
    id: 'rep-1',
    title: 'Hazardous Road Pothole',
    category: 'Roads & Infrastructure',
    description: 'A deep pothole in the middle of Sector 4 main street. Vehicles are swerving sharply, causing a traffic bottleneck and safety risk.',
    severity: 'Critical',
    status: 'In Progress',
    location: {
      latitude: 12.9782,
      longitude: 77.5912,
      address: 'Sector 4, Near Tech Park Circle, Bengaluru'
    },
    aiConfidence: 94,
    consensusScore: 92,
    reportedAt: '2026-06-24T10:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=80',
    votes: 24,
    votedBy: [],
    civicLetter: '',
    city: 'Bengaluru'
  },
  {
    id: 'rep-2',
    title: 'Overflowing Commercial Dumpster',
    category: 'Sanitation & Waste',
    description: 'Commercial waste bin overflowing with garbage bags. Street dogs and pests are gathering. Odor is spreading to nearby offices.',
    severity: 'High',
    status: 'Reported',
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
      address: 'Block B, Commercial Zone, Chennai'
    },
    aiConfidence: 89,
    consensusScore: 85,
    reportedAt: '2026-06-25T08:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80',
    votes: 12,
    votedBy: [],
    civicLetter: '',
    city: 'Chennai'
  },
  {
    id: 'rep-3',
    title: 'Broken High-Voltage Streetlight',
    category: 'Public Utilities',
    description: 'Streetlight pole #42 has a damaged bulb. The entire park lane is Pitch black at night, raising safety concerns for joggers.',
    severity: 'Low',
    status: 'Resolved',
    location: {
      latitude: 12.9652,
      longitude: 77.5841,
      address: 'Main Promenade, City Park Lane, Bengaluru'
    },
    aiConfidence: 97,
    consensusScore: 98,
    reportedAt: '2026-06-23T21:40:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1506543731388-2970d478cf84?w=600&auto=format&fit=crop&q=80',
    votes: 8,
    votedBy: [],
    civicLetter: '',
    city: 'Bengaluru'
  },
  {
    id: 'rep-4',
    title: 'Ruptured Water Main Pipeline',
    category: 'Public Utilities',
    description: 'Clean drinking water is bursting out of a pavement joint, flooding the lower street level. Hundreds of gallons wasted.',
    severity: 'High',
    status: 'In Progress',
    location: {
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Opposite Metro Station Exit, New Delhi'
    },
    aiConfidence: 92,
    consensusScore: 88,
    reportedAt: '2026-06-25T11:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=80',
    votes: 31,
    votedBy: [],
    civicLetter: '',
    city: 'Delhi'
  },
  {
    id: 'rep-5',
    title: 'Unsanctioned Commercial Banner',
    category: 'Public Safety',
    description: 'A large advertising banner blocking the pedestrian footpath signs. Blocked sightlines might cause pedestrian-vehicle collision.',
    severity: 'Low',
    status: 'Pending Verification',
    location: {
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Crossroad Junction, Sector 2, Mumbai'
    },
    aiConfidence: 82,
    consensusScore: 60,
    reportedAt: '2026-06-25T15:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80',
    votes: 1,
    votedBy: [],
    civicLetter: '',
    isLiveCapture: false,
    city: 'Mumbai'
  }
];

const INITIAL_LEADERBOARD = [
  { rank: 1, name: 'Ananya Sharma', points: 420, badges: ['🥇 Pioneer', '🔧 Resolver'], city: 'Bengaluru' },
  { rank: 2, name: 'Vikram Mehta', points: 380, badges: ['🥈 Inspector', '🗑️ Waste Warrior'], city: 'Chennai' },
  { rank: 3, name: 'Arjun Das', points: 290, badges: ['🥉 Watchdog'], city: 'Delhi' },
  { rank: 4, name: 'Jatin', points: 180, badges: ['🛡️ Guardian'], city: 'Delhi' },
  { rank: 5, name: 'Priya Nair', points: 150, badges: ['🌱 Eco Hero'], city: 'Bengaluru' }
];

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentCity, setCurrentCity] = useState(() => {
    const saved = localStorage.getItem('VIGILANT_USER');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.city || 'Bengaluru';
    }
    return 'Bengaluru';
  });
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('VIGILANT_REPORTS');
    const parsed = saved ? JSON.parse(saved) : INITIAL_REPORTS;
    
    // Auto-clean duplicates on load (specifically matching identical descriptions/addresses)
    let seenJind = false;
    return parsed.filter(rep => {
      const addr = rep.location?.address || '';
      if (addr.includes('Jind, Haryana') || addr.includes('126100')) {
        if (seenJind) return false; // filter out duplicate uploads
        seenJind = true;
      }
      return true;
    });
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('VIGILANT_USER');
    return saved ? JSON.parse(saved) : null;
  });
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('VIGILANT_LEADERBOARD');
    return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
  });
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  // Sync reports to localStorage
  useEffect(() => {
    localStorage.setItem('VIGILANT_REPORTS', JSON.stringify(reports));
  }, [reports]);

  // Sync leaderboard to localStorage
  useEffect(() => {
    localStorage.setItem('VIGILANT_LEADERBOARD', JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Sync user profile to localStorage and dynamic leaderboard
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('VIGILANT_USER', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('VIGILANT_USER');
    }
  }, [currentUser]);

  const handleLogin = (username, city) => {
    const normalizedInput = username.trim().toLowerCase();
    
    // Check if user matches any existing leaderboard name (case-insensitive)
    const matchedUser = leaderboard.find(u => {
      const name = u.name.replace(/\(You\)/i, '').trim().toLowerCase();
      return name === normalizedInput;
    });

    let finalUser;
    
    if (matchedUser) {
      const cleanName = matchedUser.name.replace(/\(You\)/i, '').trim();
      finalUser = {
        id: cleanName.toLowerCase().replace(/\s+/g, '-'),
        name: `${cleanName} (You)`,
        points: matchedUser.points,
        badges: matchedUser.badges,
        city: matchedUser.city || 'Bengaluru'
      };
      
      // Update leaderboard to append "(You)" to the active user
      setLeaderboard(prev => {
        const updated = prev.map(u => {
          const cName = u.name.replace(/\(You\)/i, '').trim();
          if (cName.toLowerCase() === normalizedInput) {
            return { ...u, name: `${cName} (You)` };
          }
          return { ...u, name: cName };
        });
        return updated;
      });
    } else {
      finalUser = {
        id: username.toLowerCase().replace(/\s+/g, '-'),
        name: `${username} (You)`,
        points: 0,
        badges: ['🌱 Rookie'],
        city: city || 'Bengaluru'
      };
      
      setLeaderboard(prev => {
        const cleaned = prev.map(u => ({ ...u, name: u.name.replace(/\(You\)/i, '').trim() }));
        return [...cleaned, {
          rank: cleaned.length + 1,
          name: `${username} (You)`,
          points: 0,
          badges: ['🌱 Rookie'],
          city: city || 'Bengaluru'
        }].sort((a, b) => b.points - a.points)
          .map((u, i) => ({ ...u, rank: i + 1 }));
      });
    }

    setCurrentUser(finalUser);
    setCurrentCity(finalUser.city);
  };

  const handleLogout = () => {
    setLeaderboard(prev => prev.map(u => ({
      ...u,
      name: u.name.replace(/\(You\)/i, '').trim()
    })));
    setCurrentUser(null);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveGeminiApiKey(tempKeyInput);
    setApiKey(tempKeyInput);
    setKeySavedMessage(true);
    setTimeout(() => {
      setKeySavedMessage(false);
      setShowKeyForm(false);
    }, 1500);
  };

  const handleRemoveKey = () => {
    saveGeminiApiKey('');
    setApiKey('');
    setTempKeyInput('');
  };

  const [redeemedCoupons, setRedeemedCoupons] = useState(() => {
    const saved = localStorage.getItem('VIGILANT_REDEEMED');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('VIGILANT_REDEEMED', JSON.stringify(redeemedCoupons));
  }, [redeemedCoupons]);

  const handleRedeemReward = (perkId, cost) => {
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, points: Math.max(0, prev.points - cost) }));
    }

    setLeaderboard(prev => {
      return prev.map(user => {
        if (user.name.includes('(You)')) {
          return { ...user, points: Math.max(0, user.points - cost) };
        }
        return user;
      }).sort((a, b) => b.points - a.points)
        .map((user, i) => ({ ...user, rank: i + 1 }));
    });

    const mockCode = 'HERO-' + perkId.split('-')[1].toUpperCase() + '-' + Math.floor(Math.random() * 8999 + 1000) + 'X';
    setRedeemedCoupons(prev => ({
      ...prev,
      [perkId]: mockCode
    }));
  };

  // Add new report to state
  const addNewReport = (newRep) => {
    const isLive = !!newRep.isLiveCapture;
    const finalReport = {
      ...newRep,
      status: isLive ? 'Reported' : 'Pending Verification',
      consensusScore: isLive ? 95 : 60,
      reportedBy: currentUser?.id || 'current-user',
      city: currentCity
    };

    setReports(prev => [finalReport, ...prev]);
    
    // Reward points based on trust tier: 75 Karma for live, 40 Karma for upload
    const pointsAwarded = isLive ? 75 : 40;

    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, points: prev.points + pointsAwarded }));
    }

    setLeaderboard(prev => {
      return prev.map(user => {
        if (user.name.includes('(You)')) {
          return { ...user, points: user.points + pointsAwarded };
        }
        return user;
      }).sort((a, b) => b.points - a.points)
        .map((user, i) => ({ ...user, rank: i + 1 }));
    });
  };

  // Delete a report
  const handleDeleteReport = (reportId) => {
    setReports(prev => prev.filter(rep => rep.id !== reportId));
  };

  // Vote for a report (Community Verification)
  const handleVote = (reportId) => {
    const repToVote = reports.find(r => r.id === reportId);
    if (repToVote && repToVote.reportedBy === currentUser?.id) {
      alert("Verification Restricted: You cannot verify/vote on your own reported issues!");
      return;
    }

    setReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        // Simple mock vote toggle
        const userId = currentUser?.id || 'current-user';
        const alreadyVoted = rep.votedBy?.includes(userId);
        const updatedVotedBy = alreadyVoted 
          ? (rep.votedBy || []).filter(u => u !== userId)
          : [...(rep.votedBy || []), userId];
        const voteDiff = alreadyVoted ? -1 : 1;

        // Verify votes change consensus score significantly (+15% or -15%)
        const newConsensus = Math.min(Math.max(rep.consensusScore + (voteDiff * 15), 0), 99);
        let newStatus = rep.status;

        // Upgrade status if consensus score goes from pending to 75%+
        if (rep.status === 'Pending Verification' && newConsensus >= 75) {
          newStatus = 'Reported';
        } else if (rep.status === 'Reported' && voteDiff < 0 && rep.isLiveCapture === false && newConsensus < 75) {
          newStatus = 'Pending Verification';
        }
        
        return {
          ...rep,
          votes: rep.votes + voteDiff,
          votedBy: updatedVotedBy,
          consensusScore: newConsensus,
          status: newStatus
        };
      }
      return rep;
    }));

    // Reward for verifying/voting (10 points)
    const pointsAwarded = 10;
    if (currentUser) {
      setCurrentUser(prev => ({ ...prev, points: prev.points + pointsAwarded }));
    }

    setLeaderboard(prev => {
      return prev.map(user => {
        if (user.name.includes('(You)')) {
          return { ...user, points: user.points + pointsAwarded };
        }
        return user;
      }).sort((a, b) => b.points - a.points)
        .map((user, i) => ({ ...user, rank: i + 1 }));
    });
  };

  const updateReportLetter = (id, letter) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, civicLetter: letter } : r));
  };

  const userKarma = currentUser?.points || 0;

  if (!currentUser) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="bg-glow-container">
          <div className="bg-glow-orb bg-glow-orb-1"></div>
          <div className="bg-glow-orb bg-glow-orb-2"></div>
        </div>
        <Login onLogin={handleLogin} leaderboard={leaderboard} currentCity={currentCity} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background Decorative Glow Orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-orb bg-glow-orb-1"></div>
        <div className="bg-glow-orb bg-glow-orb-2"></div>
      </div>
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container" style={{ marginBottom: '28px' }}>
          <div className="logo-icon">🛡️</div>
          <span className="logo-text">Vigilant</span>
        </div>

        {/* Active City Scope Selector */}
        <div style={{ marginBottom: '24px', padding: '0 4px' }}>
          <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Active Grid Scope
          </label>
          <select 
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
            className="city-select-dropdown"
            style={{ 
              width: '100%', 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white', 
              border: '1px solid var(--panel-border)', 
              borderRadius: '6px', 
              padding: '10px 12px', 
              fontSize: '13px', 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <option value="Bengaluru" style={{ background: '#0b0f19', color: '#fff' }}>📍 Bengaluru</option>
            <option value="Chennai" style={{ background: '#0b0f19', color: '#fff' }}>📍 Chennai</option>
            <option value="Delhi" style={{ background: '#0b0f19', color: '#fff' }}>📍 Delhi</option>
            <option value="Mumbai" style={{ background: '#0b0f19', color: '#fff' }}>📍 Mumbai</option>
          </select>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-links">
            <li>
              <button 
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentView === 'map' ? 'active' : ''}`}
                onClick={() => setCurrentView('map')}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
              >
                <Map size={18} />
                Interactive Map
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentView === 'report' ? 'active' : ''}`}
                onClick={() => setCurrentView('report')}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
              >
                <PlusCircle size={18} />
                Report Issue
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentView === 'inbox' ? 'active' : ''}`}
                onClick={() => setCurrentView('inbox')}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
              >
                <Inbox size={18} />
                Civic Routing Agent
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentView === 'rewards' ? 'active' : ''}`}
                onClick={() => setCurrentView('rewards')}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
              >
                <Gift size={18} />
                Karma Store
              </button>
            </li>
          </ul>
        </nav>

        {/* API Key Panel */}
        <div style={{ margin: '20px 0', padding: '12px', borderTop: '1px solid var(--panel-border)', borderBottom: '1px solid var(--panel-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Key size={12} />
              Gemini AI Status
            </span>
            {apiKey ? (
              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--severity-resolved)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                Active
              </span>
            ) : (
              <span style={{ fontSize: '10px', background: 'rgba(249, 115, 22, 0.15)', color: 'var(--severity-medium)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                Mock Mode
              </span>
            )}
          </div>
          
          {showKeyForm ? (
            <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input 
                type="password" 
                placeholder="Enter Gemini API Key..." 
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                style={{ 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid var(--panel-border)', 
                  borderRadius: '4px', 
                  padding: '6px 8px', 
                  color: 'white', 
                  fontSize: '11px' 
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  type="submit" 
                  style={{ 
                    flexGrow: 1, 
                    background: 'var(--primary)', 
                    color: '#000', 
                    border: 'none', 
                    borderRadius: '4px', 
                    padding: '4px', 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}
                >
                  {keySavedMessage ? <Check size={10} /> : 'Save Key'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowKeyForm(false)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              {apiKey ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>••••••••••••••</span>
                  <button 
                    onClick={handleRemoveKey}
                    style={{ background: 'none', border: 'none', color: 'var(--severity-critical)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setTempKeyInput(apiKey);
                    setShowKeyForm(true);
                  }}
                  className="glow-button"
                  style={{ width: '100%', padding: '6px', fontSize: '11px', justifyContent: 'center', borderRadius: '4px' }}
                >
                  Configure Gemini
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer (Profile Badge) */}
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="user-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="avatar" style={{ 
                background: currentUser?.name?.includes('Ananya') ? 'linear-gradient(135deg, #fbbf24, #d97706)' :
                            currentUser?.name?.includes('Vikram') ? 'linear-gradient(135deg, #cbd5e1, #64748b)' :
                            currentUser?.name?.includes('Arjun') ? 'linear-gradient(135deg, #d97706, #b45309)' :
                            'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                color: '#fff'
              }}>
                {(currentUser?.name || 'U').charAt(0)}
              </div>
              <div className="user-info">
                <h4 style={{ fontSize: '13px', fontWeight: 600 }}>{currentUser?.name || 'User'}</h4>
                <p style={{ fontSize: '10px' }}>{userKarma} Karma Points</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--severity-critical)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard 
            reports={reports} 
            leaderboard={leaderboard} 
            setView={setCurrentView} 
            onVote={handleVote}
            onDelete={handleDeleteReport}
            currentUser={currentUser}
            currentCity={currentCity}
          />
        )}
        {currentView === 'map' && (
          <MapView 
            reports={reports} 
            onVote={handleVote}
            onDelete={handleDeleteReport}
            currentUser={currentUser}
            currentCity={currentCity}
          />
        )}
        {currentView === 'report' && (
          <ReportIssue 
            reports={reports} 
            onAddReport={addNewReport} 
            setView={setCurrentView}
            currentUser={currentUser}
            currentCity={currentCity}
          />
        )}
        {currentView === 'inbox' && (
          <CivicInbox 
            reports={reports} 
            updateLetter={updateReportLetter}
          />
        )}
        {currentView === 'rewards' && (
          <RewardsShop 
            userPoints={userKarma} 
            onRedeemReward={handleRedeemReward} 
            redeemedCoupons={redeemedCoupons}
          />
        )}
      </main>
    </div>
  )
}
