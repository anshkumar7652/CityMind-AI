'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { CITY_SECTORS, PREDICTIVE_HAZARDS, INITIAL_USER_REPORTS, GOVERNOR_BRIEFS } from '@/lib/data';
import CitizenPortal from '@/components/CitizenPortal';
import AdminDashboard from '@/components/AdminDashboard';
import PredictiveSimulator from '@/components/PredictiveSimulator';
import VoucherModal from '@/components/VoucherModal';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

// Dynamically import Leaflet map for SSR safety
const DigitalTwinMap = dynamic(() => import('@/components/DigitalTwinMap'), {
  ssr: false,
  loading: () => <div style={{ height: '420px', background: 'var(--bg-subtle)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Digital Twin Interactive Map...</div>
});

export default function Home() {
  const [activeTab, setActiveTab] = useState('tab-overview');
  const [selectedSectorId, setSelectedSectorId] = useState('sec-62');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isGovernorModalOpen, setIsGovernorModalOpen] = useState(false);
  const [governorBriefIndex, setGovernorBriefIndex] = useState(0);

  // User State & Reports State
  const [userProfile, setUserProfile] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(450);
  const [userReports, setUserReports] = useState(INITIAL_USER_REPORTS);
  const [activeHazards, setActiveHazards] = useState(PREDICTIVE_HAZARDS);

  // Dynamic Impact Metrics
  const [totalSavedBudget, setTotalSavedBudget] = useState(124500);
  const [totalSavedCO2, setTotalSavedCO2] = useState(450);

  // Carbon Credit Voucher Redemption Modal
  const [activeVoucher, setActiveVoucher] = useState(null);

  // AI Governor Chatbot State
  const [chatMessages, setChatMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Hello! I am your AI City Governor. I actively scan real-time sensor streams and historical patterns to **predict future urban problems** before they occur. Ask me to forecast risks, simulate weather impacts, or inspect sector hazards!' 
    }
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [scheduledOrders, setScheduledOrders] = useState({});

  // Connect to Backend API & Firestore Realtime Sync on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const res = await fetch('/api/city-data');
        const data = await res.json();
        if (data?.reports && data.reports.length > 0) {
          setUserReports(data.reports);
        }
      } catch (err) {
        console.warn("Backend data fetch operating in client mode:", err);
      }
    }
    loadBackendData();

    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, "reports"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const firestoreReports = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserReports(firestoreReports);
          }
        }, (err) => {
          console.warn("Firestore snapshot notice:", err.message);
        });
        return () => unsubscribe();
      } catch (err) {
        console.warn("Firestore fallback mode:", err);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGovernorBriefIndex(prev => (prev + 1) % GOVERNOR_BRIEFS.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const handleNewReportSubmit = (newReport) => {
    setUserReports(prev => [newReport, ...prev]);
    setRewardPoints(prev => prev + 150);
    setTotalSavedBudget(prev => prev + 4500);
    setTotalSavedCO2(prev => prev + 35);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handleReportStatusChange = (reportId, newStatus) => {
    setUserReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
  };

  const triggerWorkOrder = (id) => {
    setScheduledOrders(prev => ({ ...prev, [id]: true }));
    setTotalSavedBudget(prev => prev + 18500);
    setTotalSavedCO2(prev => prev + 120);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  const handleScheduleSimulatedOrder = (order) => {
    setScheduledOrders(prev => ({ ...prev, [order.id]: true }));
    setTotalSavedBudget(prev => prev + 22500);
    setTotalSavedCO2(prev => prev + 180);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  };

  const handleRedeemVoucher = (type, cost, title, desc, icon) => {
    if (rewardPoints < cost) {
      alert(`You need ${cost} Carbon Credits to redeem ${title}. Current balance: ${rewardPoints} pts.`);
      return;
    }

    setRewardPoints(prev => prev - cost);
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });

    const code = `CITY-${type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

    setActiveVoucher({
      title: title,
      desc: desc,
      code: code,
      expiresAt: expiresAt,
      icon: icon
    });
  };

  const claimCarbonCredits = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setRewardPoints(prev => prev + 250);
  };

  // Connected AI City Governor Backend Request with Future Problem Predictions
  const handleSendGovernorQuery = async (customText = null) => {
    const textToSend = customText || queryInput;
    if (!textToSend.trim()) return;
    const userMsg = textToSend.trim();

    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    if (!customText) setQueryInput('');

    try {
      const res = await fetch('/api/governor-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: data.reply,
        prediction: data.prediction
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `🤖 AI Governor Response: Integrated query regarding "${userMsg}" into neural risk engine.` 
      }]);
    }
  };

  const selectedSector = CITY_SECTORS.find(s => s.id === selectedSectorId) || CITY_SECTORS[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar Header */}
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-badge">CITYMIND AI 2.0</span>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Sustainable City Intelligence</h2>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button className={`nav-tab-btn ${activeTab === 'tab-overview' ? 'active' : ''}`} onClick={() => setActiveTab('tab-overview')}>
            🌐 Overview & Twin Map
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-citizen' ? 'active' : ''}`} onClick={() => setActiveTab('tab-citizen')}>
            👤 Citizen Features
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-admin' ? 'active' : ''}`} onClick={() => setActiveTab('tab-admin')}>
            🏛️ Admin Dashboard
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-predictive' ? 'active' : ''}`} onClick={() => setActiveTab('tab-predictive')}>
            🔮 Predictive Engine
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-budget-green' ? 'active' : ''}`} onClick={() => setActiveTab('tab-budget-green')}>
            🌱 Budget & Green Impact
          </button>
        </nav>

        <div className="header-actions">
          <button className="btn-danger" onClick={() => setIsEmergency(!isEmergency)}>
            ⚡ Emergency Mode: {isEmergency ? 'ON' : 'OFF'}
          </button>
          <button className="btn-primary" onClick={() => setIsGovernorModalOpen(true)}>
            🤖 Ask AI City Governor
          </button>
        </div>
      </header>

      {/* Emergency Banner */}
      {isEmergency && (
        <div style={{ background: 'var(--crimson-light)', borderBottom: '1px solid var(--crimson)', padding: '8px 32px', fontWeight: '700', fontSize: '0.85rem', textAlign: 'center', color: 'var(--crimson)' }}>
          ⚠️ EMERGENCY MODE ACTIVE: Heavy Rainfall & Severe Flood Risk Forecasted for Sector 18. Emergency Crews Dispatched.
        </div>
      )}

      {/* AI Governor Briefing Ticker */}
      <div className="governor-banner">
        <div className="governor-avatar">AI</div>
        <div>
          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>AI City Governor Brief:</span>
          <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>{GOVERNOR_BRIEFS[governorBriefIndex]}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content-container">

        {/* TAB 1: OVERVIEW & DIGITAL TWIN MAP */}
        {activeTab === 'tab-overview' && (
          <section className="tab-page">
            <div className="overview-grid">
              <div className="glass-card">
                <div className="card-header">
                  <div className="card-title">MAP Interactive Digital Twin Map & Sector Health Score</div>
                  <span style={{ background: 'var(--emerald-light)', color: 'var(--emerald)', fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>LIVE SENSORS ONLINE</span>
                </div>

                {/* Sector Selector Pills */}
                <div className="sector-pills">
                  {CITY_SECTORS.map(sec => (
                    <button
                      key={sec.id}
                      className={`sector-pill-btn ${sec.id === selectedSectorId ? 'active' : ''}`}
                      onClick={() => setSelectedSectorId(sec.id)}
                    >
                      {sec.name.split(' ')[0]} {sec.name.split(' ')[1]}
                    </button>
                  ))}
                </div>

                {/* Health Score Hero */}
                <div className="health-score-hero">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Sector Health Score</div>
                    <div className="health-pill">
                      <span>{selectedSector.healthScore}</span>
                      <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{selectedSector.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--amber)', fontWeight: '600' }}>{selectedSector.predictedRisk}</div>
                  </div>
                </div>

                <DigitalTwinMap
                  selectedSectorId={selectedSectorId}
                  onSectorSelect={setSelectedSectorId}
                  userReports={userReports}
                />
              </div>

              {/* Metrics Overview Side Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card">
                  <div className="card-title" style={{ marginBottom: '12px' }}>📊 Sector Metrics Breakdown</div>
                  <div className="metrics-mini-list">
                    <div className="metric-row"><span>🛣️ Road Quality</span><strong>{selectedSector.metrics.roadQuality}/100</strong></div>
                    <div className="metric-row"><span>🧹 Cleanliness</span><strong>{selectedSector.metrics.cleanliness}/100</strong></div>
                    <div className="metric-row"><span>🍃 Air Quality</span><strong>{selectedSector.metrics.airQuality}/100</strong></div>
                    <div className="metric-row"><span>🚗 Traffic Flow</span><strong>{selectedSector.metrics.traffic}/100</strong></div>
                    <div className="metric-row"><span>💧 Water Main Integrity</span><strong>{selectedSector.metrics.waterLeakage}/100</strong></div>
                  </div>
                </div>

                <div className="glass-card">
                  <div className="card-title" style={{ marginBottom: '8px' }}>🤖 AI Governor Quick Insights</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    "Sector 62 exhibits 85% pothole risk due to upcoming monsoon storms. Proactive micro-surfacing will save ₹45,000 in asphalt damage."
                  </p>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.8rem' }} onClick={() => setIsGovernorModalOpen(true)}>
                    🔮 Ask AI Governor to Predict Future Risks
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: CITIZEN FEATURES SUITE */}
        {activeTab === 'tab-citizen' && (
          <section className="tab-page">
            <CitizenPortal
              userReports={userReports}
              onNewReportSubmit={handleNewReportSubmit}
              rewardPoints={rewardPoints}
              userProfile={userProfile}
              onLoginSuccess={setUserProfile}
              onClaimCarbonCredits={claimCarbonCredits}
            />
          </section>
        )}

        {/* TAB 3: ADMIN DASHBOARD SUITE */}
        {activeTab === 'tab-admin' && (
          <section className="tab-page">
            <AdminDashboard
              userReports={userReports}
              predictiveHazards={activeHazards}
              selectedSectorId={selectedSectorId}
              onSectorSelect={setSelectedSectorId}
              onReportStatusChange={handleReportStatusChange}
            />
          </section>
        )}

        {/* TAB 4: PREDICTIVE MAINTENANCE ENGINE */}
        {activeTab === 'tab-predictive' && (
          <section className="tab-page">
            <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
              <div className="card-header">
                <div className="card-title">🔮 Proactive Predictive Maintenance Engine</div>
                <span className="badge-risk">AI PREDICTIVE ACTIVE</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                CityMind AI predicts infrastructure damage <strong>before</strong> complaints occur using rainfall forecasts, pipe age, subsoil moisture, and vehicle density.
              </p>

              {/* Active Hazards List */}
              {activeHazards.map(haz => (
                <div key={haz.id} className={`hazard-card ${haz.probability > 80 ? 'high-prob' : ''}`}>
                  <div className="hazard-header">
                    <strong style={{ fontSize: '0.95rem' }}>{haz.issue}</strong>
                    <span className="badge-risk">{haz.probability}% PROBABILITY</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>📍 {haz.sector} | ⏳ {haz.timeframe}</div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>💡 <em>{haz.recommendation}</em></div>

                  <div className="impact-grid">
                    <div>💰 Est Cost: <strong>{haz.budget.cost}</strong></div>
                    <div>👷 Manpower: <strong>{haz.budget.workers} Workers</strong></div>
                    <div>🌱 CO₂ Saved: <strong>{haz.greenImpact.co2Saved || '120 kg'}</strong></div>
                    <div>👥 Impacted: <strong>{haz.greenImpact.people}</strong></div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.8rem', background: scheduledOrders[haz.id] ? '#10b981' : undefined }}
                    onClick={() => triggerWorkOrder(haz.id)}
                    disabled={scheduledOrders[haz.id]}
                  >
                    {scheduledOrders[haz.id] ? '✓ Work Order Scheduled (Prevented Complaint)' : '⚡ Trigger Proactive Maintenance Work Order'}
                  </button>
                </div>
              ))}

              {/* Interactive "What-If" AI Predictive Simulator Component */}
              <PredictiveSimulator onScheduleWorkOrder={handleScheduleSimulatedOrder} />
            </div>
          </section>
        )}

        {/* TAB 5: AI BUDGET PLANNER & GREEN IMPACT */}
        {activeTab === 'tab-budget-green' && (
          <section className="tab-page">
            <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card-header">
                <div className="card-title">🌱 AI Budget Planner & Green Impact Calculator</div>
                <span style={{ background: 'var(--emerald-light)', color: 'var(--emerald)', fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>SUSTAINABILITY MATRIX</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Quantifies municipal resource allocation and environmental benefit (CO₂/Methane reduction, area restored, and citizens benefited).
              </p>

              <div className="budget-green-grid">
                <div className="impact-card">
                  <h3>💰 Total Budget Saved</h3>
                  <div className="stat-highlight">₹{totalSavedBudget.toLocaleString()}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saved by repairing issues before structural failure.</p>
                </div>
                <div className="impact-card">
                  <h3>🌱 Methane & CO₂ Saved</h3>
                  <div className="stat-highlight" style={{ color: 'var(--emerald)' }}>{totalSavedCO2} kg</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Achieved through automated EV compaction & proactive repairs.</p>
                </div>
                <div className="impact-card">
                  <h3>👥 Citizens Benefited</h3>
                  <div className="stat-highlight" style={{ color: 'var(--primary)' }}>1,45,000</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across Sector 62, Sector 18, and Cyber City Plaza.</p>
                </div>
              </div>

              {/* Carbon Credit Redemption Simulator */}
              <div style={{ background: '#fff', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>💳 Redeem Citizen Carbon Credits</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--emerald)', fontWeight: '700' }}>Balance: {rewardPoints} Carbon Credits</span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Citizens can redeem accumulated reward points for public transit passes, EV charging discounts, or municipal utility bill reductions.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🚌</div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Metro 1-Day Pass</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Cost: 200 Credits</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%' }}
                      onClick={() => handleRedeemVoucher('metro', 200, 'Metro 1-Day Pass', 'Unlimited 1-day travel across all metro lines.', '🚌')}
                    >
                      Redeem Pass
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>⚡</div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>EV Charging Discount</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Cost: 350 Credits</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%' }}
                      onClick={() => handleRedeemVoucher('ev', 350, 'EV Charging Voucher', '₹150 off at any municipal EV fast-charging hub.', '⚡')}
                    >
                      Redeem Voucher
                    </button>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>💧</div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Water Bill Rebate (5%)</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Cost: 500 Credits</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%' }}
                      onClick={() => handleRedeemVoucher('water', 500, 'Water Utility Bill Rebate', '5% discount credited directly to next monthly water bill.', '💧')}
                    >
                      Redeem Rebate
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

      </main>

      {/* AI City Governor Chatbot Modal with Prediction Capabilities */}
      {isGovernorModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-card" style={{ maxWidth: '640px' }}>
            <div className="card-header">
              <div className="card-title">🤖 AI City Governor Decision Support</div>
              <button onClick={() => setIsGovernorModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            {/* Quick Predictive Prompt Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("🔮 Predict future problems across all sectors")}>🔮 Predict Future Risks</button>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("Tell me about Sector 62 pothole risk")}>🛣️ Sector 62 Potholes</button>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("Forecast Sector 18 flood emergency")}>🌧️ Sector 18 Flood</button>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("Predict power grid thermal overload")}>⚡ Cyber City Power</button>
            </div>

            <div style={{ height: '300px', overflowY: 'auto', background: 'var(--bg-subtle)', border: '1px solid var(--panel-border)', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    background: msg.sender === 'user' ? 'var(--primary-light)' : 'var(--emerald-light)',
                    border: msg.sender === 'user' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(5,150,105,0.25)',
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  <div>{msg.text}</div>

                  {/* If message includes structured prediction details */}
                  {msg.prediction && (
                    <div style={{ marginTop: '10px', background: '#fff', border: '1px solid var(--panel-border)', borderLeft: '4px solid var(--crimson)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--crimson)' }}>🚨 {msg.prediction.issue}</strong>
                        <span style={{ background: 'var(--crimson-light)', color: 'var(--crimson)', fontWeight: '700', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px' }}>
                          {msg.prediction.probability}% RISK
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        📍 {msg.prediction.sector} | ⏳ Window: {msg.prediction.timeframe} | 💰 Save: {msg.prediction.saved}
                      </div>

                      <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '6px', fontSize: '0.75rem', background: scheduledOrders[msg.prediction.id] ? '#10b981' : undefined }}
                        onClick={() => triggerWorkOrder(msg.prediction.id)}
                        disabled={scheduledOrders[msg.prediction.id]}
                      >
                        {scheduledOrders[msg.prediction.id] ? '✓ Preventative Action Dispatched' : msg.prediction.actionLabel || '⚡ Dispatch Preventative Team'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. Predict future risks for Sector 62 next week..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendGovernorQuery()}
                style={{ flex: 1, background: '#fff', border: '1px solid var(--panel-border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px' }}
              />
              <button className="btn-primary" onClick={() => handleSendGovernorQuery()}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Carbon Credit Redemption Voucher Modal */}
      {activeVoucher && (
        <VoucherModal voucher={activeVoucher} onClose={() => setActiveVoucher(null)} />
      )}

    </div>
  );
}
