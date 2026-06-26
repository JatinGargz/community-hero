import React, { useState } from 'react'
import { User, LogIn, Shield, Sparkles } from 'lucide-react'

export default function Login({ onLogin, leaderboard = [] }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [cityInput, setCityInput] = useState('Bengaluru');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      onLogin(usernameInput.trim(), cityInput);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px',
      position: 'relative',
      zIndex: 10
    }}>
      
      {/* Login Glass Panel */}
      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '40px', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--panel-border)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        
        {/* Branding header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#030712',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.45)',
            animation: 'pulseMarkerCritical 3s infinite'
          }}>
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Vigilant
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Hyperlocal Civic Action Network
            </p>
          </div>
        </div>

        {/* Custom Username form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Create Citizen Profile
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Enter your name..." 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 16px 12px 40px', 
                  fontSize: '14px' 
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Home City
            </label>
            <select
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                border: '1px solid var(--panel-border)',
                borderRadius: '6px',
                padding: '12px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="Bengaluru" style={{ background: '#0b0f19', color: '#fff' }}>📍 Bengaluru</option>
              <option value="Chennai" style={{ background: '#0b0f19', color: '#fff' }}>📍 Chennai</option>
              <option value="Delhi" style={{ background: '#0b0f19', color: '#fff' }}>📍 Delhi</option>
              <option value="Mumbai" style={{ background: '#0b0f19', color: '#fff' }}>📍 Mumbai</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="glow-button"
            style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
          >
            <LogIn size={16} />
            Enter Vigilant Portal
          </button>
        </form>

        {/* Quick Demo Sign Ins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--panel-border)', paddingTop: '20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Quick Sign-In (Demo Profiles)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaderboard.filter(user => !user.name.includes('(You)')).map((user, i) => {
              // Pick avatar initials
              const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2);
              
              // Custom color scheme based on rank
              const gradient = i === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 
                               i === 1 ? 'linear-gradient(135deg, #cbd5e1, #64748b)' :
                               i === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' :
                               'linear-gradient(135deg, #06b6d4, #0891b2)';

              return (
                <button
                  key={user.name}
                  type="button"
                  onClick={() => onLogin(user.name, user.city)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--panel-border)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'var(--panel-border)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      background: gradient, 
                      color: '#000', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {initials}
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>{user.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{user.badges[0]} • {user.city}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--secondary)' }}>{user.points}</span>
                    <span style={{ fontSize: '8px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase' }}>Karma</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
