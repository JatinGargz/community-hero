import React, { useState } from 'react'
import { Mail, Sparkles, Send, Copy, FileText, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react'
import { draftCivicComplaint } from '../services/agents'

export default function CivicInbox({ reports, updateLetter }) {
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id || null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [letterSentStatus, setLetterSentStatus] = useState(null);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Trigger agent letter drafting
  const triggerDraftingAgent = async () => {
    if (!selectedReport) return;
    setIsDrafting(true);
    setLetterSentStatus(null);
    
    try {
      const letter = await draftCivicComplaint(selectedReport);
      updateLetter(selectedReport.id, letter);
    } catch (error) {
      console.error('Drafting agent error:', error);
    } finally {
      setIsDrafting(false);
    }
  };

  const copyToClipboard = () => {
    if (!selectedReport?.civicLetter) return;
    navigator.clipboard.writeText(selectedReport.civicLetter);
    alert('Complaint draft copied to clipboard!');
  };

  const sendMockEmail = () => {
    setLetterSentStatus('sending');
    setTimeout(() => {
      setLetterSentStatus('sent');
    }, 2000);
  };

  // Get department based on category
  const getTargetDepartment = (category) => {
    switch (category) {
      case 'Roads & Infrastructure': return 'Municipal Road Maintenance & Sidewalk Division';
      case 'Sanitation & Waste': return 'City Solid Waste Management Department';
      case 'Public Utilities': return 'Electrical & Water Board Authority';
      case 'Public Safety': return 'Civil Defense & Safety Commissioner';
      default: return 'General Municipal Grievance Bureau';
    }
  };

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      <header>
        <h1 style={{ fontSize: '28px', marginBottom: '4px', fontWeight: 800 }}>AI Civic Routing Agent</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Autonomous agent that categorizes complaints, identifies correct departments, and drafts official letters.</p>
      </header>

      {reports.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Mail size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
          <h3>No reports available for routing</h3>
          <p>Please report a community issue first to activate the Routing Agent.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flexWrap: 'wrap', alignItems: 'start' }}>
          
          {/* Left Column: Report List */}
          <aside className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', paddingBottom: '8px', borderBottom: '1px solid var(--panel-border)' }}>
              Select Active Grievance
            </h3>
            
            {reports.map(rep => {
              const isSelected = rep.id === selectedReportId;
              const hasDraft = !!rep.civicLetter;

              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReportId(rep.id);
                    setLetterSentStatus(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                    border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--panel-border)'),
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'white', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '130px' }}>
                      {rep.title}
                    </h4>
                    <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                      {rep.severity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {rep.category.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '9px', color: hasDraft ? 'var(--secondary)' : 'var(--severity-medium)', fontWeight: 600 }}>
                      {hasDraft ? '✓ Draft ready' : '⚡ Needs AI'}
                    </span>
                  </div>
                </div>
              );
            })}
          </aside>

          {/* Right Column: AI Drafting Board */}
          {selectedReport && (
            <section className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Stepper Status Indicators */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--severity-resolved-bg)', color: 'var(--severity-resolved)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '11px', fontWeight: 700 }}>✓</div>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>1. Logged</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: selectedReport.civicLetter ? 'var(--severity-resolved-bg)' : 'rgba(255,255,255,0.05)', color: selectedReport.civicLetter ? 'var(--severity-resolved)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '11px', fontWeight: 700 }}>
                    {selectedReport.civicLetter ? '✓' : '2'}
                  </div>
                  <span style={{ fontSize: '11px', color: selectedReport.civicLetter ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 600 }}>2. AI Drafted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: selectedReport.civicLetter ? 'var(--severity-resolved-bg)' : 'rgba(255,255,255,0.05)', color: selectedReport.civicLetter ? 'var(--severity-resolved)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '11px', fontWeight: 700 }}>
                    {selectedReport.civicLetter ? '✓' : '3'}
                  </div>
                  <span style={{ fontSize: '11px', color: selectedReport.civicLetter ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 600 }}>3. Routed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: letterSentStatus === 'sent' ? 'var(--severity-resolved-bg)' : 'rgba(255,255,255,0.05)', color: letterSentStatus === 'sent' ? 'var(--severity-resolved)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '11px', fontWeight: 700 }}>
                    {letterSentStatus === 'sent' ? '✓' : '4'}
                  </div>
                  <span style={{ fontSize: '11px', color: letterSentStatus === 'sent' ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 600 }}>4. Dispatched</span>
                </div>
              </div>

              {/* Routing detail */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Routing Category</span>
                  <span style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>{selectedReport.category}</span>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Civic Body</span>
                  <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                    {getTargetDepartment(selectedReport.category)}
                  </span>
                </div>
              </div>

              {/* The letter layout */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} style={{ color: 'var(--primary)' }} />
                    Official Complaint Letter Draft
                  </h3>
                  
                  {selectedReport.civicLetter && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={copyToClipboard}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--panel-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                    </div>
                  )}
                </div>

                {/* Content board */}
                <div style={{ minHeight: '220px', border: '1px solid var(--panel-border)', borderRadius: '8px', background: 'rgba(0,0,0,0.35)', padding: '20px', position: 'relative' }}>
                  
                  {isDrafting && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', gap: '12px', borderRadius: '8px', zIndex: 10 }}>
                      <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Civic Routing Agent drafting official grievance letter...</span>
                    </div>
                  )}

                  {selectedReport.civicLetter ? (
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: 'Courier New, monospace', 
                      fontSize: '12.5px', 
                      color: '#e2e8f0', 
                      lineHeight: '1.5' 
                    }}>
                      {selectedReport.civicLetter}
                    </pre>
                  ) : (
                    <div style={{ height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                      <Sparkles size={32} style={{ color: 'var(--severity-medium)', opacity: 0.8 }} />
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: 600, color: 'white', marginBottom: '4px' }}>Draft not generated yet</p>
                        <p style={{ fontSize: '11.5px', maxWidth: '300px' }}>Instruct the Civic Routing Agent to synthesize the report parameters and draft the formal petition.</p>
                      </div>
                      <button 
                        onClick={triggerDraftingAgent}
                        className="glow-button"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        <Sparkles size={12} />
                        Trigger AI Grievance Writer
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Sending Actions */}
              {selectedReport.civicLetter && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--panel-border)', paddingTop: '20px', gap: '12px' }}>
                  
                  {letterSentStatus === 'sending' && (
                    <button disabled style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--panel-border)', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                      Dispatching to Municipal System...
                    </button>
                  )}

                  {letterSentStatus === 'sent' && (
                    <div style={{ background: 'var(--severity-resolved-bg)', color: 'var(--severity-resolved)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                      <CheckCircle2 size={16} />
                      Complaint Dispatched! Ticket Reference: #CH-{Math.floor(Math.random() * 89999 + 10000)}
                    </div>
                  )}

                  {!letterSentStatus && (
                    <button 
                      onClick={sendMockEmail}
                      className="glow-button"
                      style={{ padding: '10px 20px' }}
                    >
                      <Send size={14} />
                      Dispatch Grievance to Authority
                    </button>
                  )}
                </div>
              )}

            </section>
          )}

        </div>
      )}

      {/* Spinner keyframes helper inline */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />

    </div>
  )
}
