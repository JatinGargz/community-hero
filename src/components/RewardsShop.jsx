import React, { useState } from 'react'
import { Gift, Ticket, Lock, Tag, Sparkles, CheckCircle2 } from 'lucide-react'

const AVAILABLE_PERKS = [
  {
    id: 'perk-1',
    title: 'Free Fresh Brewed Espresso',
    sponsor: 'Brew & Byte Cafe',
    cost: 100,
    description: 'Exchange your civic contribution for a premium hot espresso. Valid at all Sector 4 and Sector 9 branches.',
    imageUrl: 'https://images.unsplash.com/photo-151097252790b-a4e402428877?w=500&auto=format&fit=crop&q=80',
    category: 'Food & Beverage'
  },
  {
    id: 'perk-2',
    title: '15% Off Metro Transit Pass',
    sponsor: 'City Rapid Metro',
    cost: 150,
    description: 'Get a discounted single-trip token or top-up card for public transport. Encourage green commuting!',
    imageUrl: 'https://images.unsplash.com/photo-1542640244-7e672d6cef21?w=500&auto=format&fit=crop&q=80',
    category: 'Transport'
  },
  {
    id: 'perk-3',
    title: 'Organic Reusable Canvas Bag',
    sponsor: 'GreenEarth Co-op',
    cost: 200,
    description: 'Pick up a heavy-duty organic canvas bag to replace single-use plastics during grocery shopping.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
    category: 'Eco Products'
  },
  {
    id: 'perk-4',
    title: '1-Week Free All-Access Gym Pass',
    sponsor: 'IronFit Fitness Club',
    cost: 300,
    description: 'Unlock full access to weight rooms, swimming pools, and group classes for one full week.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
    category: 'Health & Wellness'
  }
];

export default function RewardsShop({ userPoints, onRedeemReward, redeemedCoupons }) {
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px', fontWeight: 800 }}>Hero Karma Store</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Redeem your civic Karma Points for real-world rewards funded by local sponsors!
          </p>
        </div>

        {/* User Balance Chip */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '12px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            borderLeft: '4px solid var(--secondary)',
            background: 'rgba(20, 184, 166, 0.05)'
          }}
        >
          <Sparkles size={18} style={{ color: 'var(--secondary)' }} />
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Your Balance</span>
            <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'white' }}>
              {userPoints} Karma
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            background: activeTab === 'browse' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
            color: activeTab === 'browse' ? 'var(--primary)' : 'var(--text-muted)',
            border: activeTab === 'browse' ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          Browse Rewards
        </button>
        <button
          onClick={() => setActiveTab('redeemed')}
          style={{
            background: activeTab === 'redeemed' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
            color: activeTab === 'redeemed' ? 'var(--primary)' : 'var(--text-muted)',
            border: activeTab === 'redeemed' ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          My Vouchers ({Object.keys(redeemedCoupons).length})
        </button>
      </div>

      {/* View: Browse Perks */}
      {activeTab === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {AVAILABLE_PERKS.map(perk => {
            const hasEnoughPoints = userPoints >= perk.cost;
            const isAlreadyRedeemed = !!redeemedCoupons[perk.id];

            return (
              <div 
                key={perk.id} 
                className="glass-panel" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '380px',
                  borderRadius: '12px',
                  opacity: isAlreadyRedeemed ? 0.75 : 1
                }}
              >
                
                {/* Image & Category Tag */}
                <div style={{ width: '100%', height: '140px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                  <img 
                    src={perk.imageUrl} 
                    alt={perk.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px',
                    background: 'rgba(5, 7, 12, 0.8)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    border: '1px solid var(--panel-border)'
                  }}>
                    {perk.category}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Sponsored by {perk.sponsor}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginTop: '4px', marginBottom: '8px' }}>
                      {perk.title}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {perk.description}
                    </p>
                  </div>

                  {/* Actions & Price */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                    
                    {/* Cost */}
                    <div>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--secondary)', display: 'block', fontFamily: 'var(--font-display)' }}>
                        {perk.cost}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Points Needed</span>
                    </div>

                    {/* Button */}
                    {isAlreadyRedeemed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--severity-resolved)', fontSize: '12px', fontWeight: 600 }}>
                        <CheckCircle2 size={14} />
                        Unlocked
                      </div>
                    ) : hasEnoughPoints ? (
                      <button 
                        onClick={() => onRedeemReward(perk.id, perk.cost)}
                        className="glow-button"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        <Ticket size={12} />
                        Claim Reward
                      </button>
                    ) : (
                      <button 
                        disabled 
                        style={{ 
                          background: 'rgba(255,255,255,0.03)', 
                          color: 'var(--text-dim)', 
                          border: '1px solid var(--panel-border)', 
                          borderRadius: '6px', 
                          padding: '8px 16px', 
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Lock size={12} />
                        Lacks Karma
                      </button>
                    )}

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* View: Redeemed Coupons */}
      {activeTab === 'redeemed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.keys(redeemedCoupons).length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Gift size={40} style={{ color: 'var(--text-dim)', marginBottom: '12px' }} />
              <p>You haven't claimed any vouchers yet.</p>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Go clean up the community to earn points!</p>
            </div>
          ) : (
            Object.keys(redeemedCoupons).map(perkId => {
              const perk = AVAILABLE_PERKS.find(p => p.id === perkId);
              const code = redeemedCoupons[perkId];
              
              if (!perk) return null;

              return (
                <div 
                  key={perkId} 
                  className="glass-panel" 
                  style={{ 
                    display: 'flex', 
                    padding: '20px', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    borderLeft: '4px solid var(--severity-resolved)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                      <img src={perk.imageUrl} alt={perk.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{perk.sponsor}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>{perk.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--severity-resolved)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <CheckCircle2 size={10} /> Active Voucher
                      </p>
                    </div>
                  </div>

                  {/* Coupon Code Reveal Card */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--severity-resolved-border)', padding: '12px 24px', borderRadius: '8px', textAlign: 'center', minWidth: '180px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voucher Code</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)', letterSpacing: '0.1em' }}>
                      {code}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  )
}
