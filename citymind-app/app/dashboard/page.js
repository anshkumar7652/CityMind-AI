'use client';

import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['tab-overview', 'tab-citizen', 'tab-admin', 'tab-predictive', 'tab-budget-green'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleTabChange = (tabId) => {
    if (!document.startViewTransition) {
      setActiveTab(tabId);
      return;
    }
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setActiveTab(tabId);
      });
    });
    
    // Catch the abort rejection to prevent the Next.js unhandled error overlay
    transition.finished.catch(() => {});
  };

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

  const handleReportUpvote = (reportId) => {
    setUserReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          priorityScore: Math.min(100, (r.priorityScore || 0) + 15),
          status: 'Verified (Multiple)',
          timeAgo: 'Just now'
        };
      }
      return r;
    }));
    setRewardPoints(prev => prev + 150);
    setTotalSavedBudget(prev => prev + 1200);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-cream)' }}>
      
      {/* Navbar Header */}
      <header className="app-header">
        <div className="logo-container">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="logo-badge">CITYMIND AI 2.0</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--forest-900)', letterSpacing: '-0.01em' }}>
              Municipal Intelligence Console
            </span>
          </Link>
          <Link href="/" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none' }}>
            ← Home
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button className={`nav-tab-btn ${activeTab === 'tab-overview' ? 'active' : ''}`} onClick={() => handleTabChange('tab-overview')}>
            Overview & Map
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-citizen' ? 'active' : ''}`} onClick={() => handleTabChange('tab-citizen')}>
            Citizen Portal
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-admin' ? 'active' : ''}`} onClick={() => handleTabChange('tab-admin')}>
            Admin Operations
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-predictive' ? 'active' : ''}`} onClick={() => handleTabChange('tab-predictive')}>
            Predictive Engine
          </button>
          <button className={`nav-tab-btn ${activeTab === 'tab-budget-green' ? 'active' : ''}`} onClick={() => handleTabChange('tab-budget-green')}>
            Impact & Credits
          </button>
        </nav>

        <div className="header-actions">
          <button className="btn-danger" onClick={() => setIsEmergency(!isEmergency)}>
            🌩️ Storm Simulation: {isEmergency ? 'ON' : 'OFF'}
          </button>
          <button className="btn-primary" onClick={() => setIsGovernorModalOpen(true)}>
            🤖 Ask AI Governor
          </button>
        </div>
      </header>

      {/* Emergency Banner */}
      {isEmergency && (
        <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '10px 32px', fontWeight: '700', fontSize: '0.85rem', textAlign: 'center', color: 'var(--crimson)' }}>
          ⚠️ EMERGENCY SIMULATION MODE: Heavy Rainfall & Severe Flood Risk Forecasted for Sector 18. Emergency Crews Dispatched.
        </div>
      )}

      {/* AI Governor Briefing Ticker */}
      <div className="governor-banner">
        <div className="governor-avatar">AI</div>
        <div>
          <span style={{ fontWeight: '700', color: 'var(--forest-800)' }}>AI City Governor Briefing:</span>
          <span style={{ marginLeft: '8px', color: 'var(--text-body)' }}>{GOVERNOR_BRIEFS[governorBriefIndex]}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content-container">

        {/* TAB 1: OVERVIEW & DIGITAL TWIN MAP */}
        {activeTab === 'tab-overview' && (
          <section className="tab-page">
            <div className="overview-grid">
              <div className="editorial-card">
                <div className="card-header">
                  <div className="card-title">Digital Twin Spatial Matrix & Sector Diagnostic</div>
                  <span style={{ background: 'var(--forest-100)', color: 'var(--forest-800)', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '999px' }}>
                    SENSORS ONLINE
                  </span>
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
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600' }}>Sector Health Diagnostic</div>
                    <div className="health-pill" style={{ color: (isEmergency && selectedSectorId === 'sec-18') ? 'var(--crimson)' : 'var(--forest-800)' }}>
                      <span>{(isEmergency && selectedSectorId === 'sec-18') ? 20 : selectedSector.healthScore}</span>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-dark)' }}>{selectedSector.name}</div>
                    <div style={{ fontSize: '0.82rem', color: (isEmergency && selectedSectorId === 'sec-18') ? 'var(--crimson)' : 'var(--amber)', fontWeight: '600', marginTop: '2px' }}>
                      {selectedSector.predictedRisk}
                    </div>
                  </div>
                </div>

                <DigitalTwinMap
                  selectedSectorId={selectedSectorId}
                  onSectorSelect={setSelectedSectorId}
                  userReports={userReports}
                  isSimulationMode={isEmergency}
                />
              </div>

              {/* Metrics Overview Side Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="editorial-card">
                  <div className="card-title" style={{ marginBottom: '14px', fontSize: '1.15rem' }}>Sector Telemetry Breakdown</div>
                  <div className="metrics-mini-list">
                    <div className="metric-row"><span>🛣️ Road Infrastructure Quality</span><strong style={{ color: 'var(--forest-800)' }}>{selectedSector.metrics.roadQuality}/100</strong></div>
                    <div className="metric-row"><span>🚗 Traffic Fluidity Index</span><strong style={{ color: 'var(--forest-800)' }}>{selectedSector.metrics.traffic}/100</strong></div>
                    <div className="metric-row"><span>💧 Water Pressure Distribution</span><strong style={{ color: (isEmergency && selectedSectorId === 'sec-18') ? 'var(--crimson)' : 'var(--forest-800)' }}>{(isEmergency && selectedSectorId === 'sec-18') ? '7.8 Bar (RISK)' : selectedSector.metrics.waterPressure}</strong></div>
                    <div className="metric-row"><span>⚡ Energy Grid Load</span><strong style={{ color: (isEmergency && selectedSectorId === 'sec-18') ? 'var(--crimson)' : 'var(--forest-800)' }}>{(isEmergency && selectedSectorId === 'sec-18') ? '98% (OVERLOAD)' : selectedSector.metrics.gridLoad}</strong></div>
                    <div className="metric-row"><span>🍃 Urban Air Quality (AQI)</span><strong style={{ color: 'var(--forest-800)' }}>{selectedSector.metrics.airQuality}/100</strong></div>
                  </div>
                </div>

                <div className="editorial-card">
                  <div className="card-title" style={{ marginBottom: '10px', fontSize: '1.15rem' }}>AI Governor Recommendation</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: '1.5', fontStyle: 'italic' }}>
                    &ldquo;Sector 62 exhibits 85% pothole risk due to upcoming monsoon storms. Proactive micro-surfacing will save ₹45,000 in asphalt damage.&rdquo;
                  </p>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '14px', padding: '9px', fontSize: '0.82rem' }} onClick={() => setIsGovernorModalOpen(true)}>
                    🔮 Ask AI Governor to Predict Risks
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
              onReportUpvote={handleReportUpvote}
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
            <div className="editorial-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
              <div className="card-header">
                <div className="card-title">Proactive Predictive Maintenance Engine</div>
                <span style={{ background: 'var(--forest-100)', color: 'var(--forest-800)', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '999px' }}>
                  ACTIVE PREDICTION
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
                CityMind AI predicts infrastructure damage <strong>before</strong> complaints occur using rainfall forecasts, pipe age, subsoil moisture, and vehicle density.
              </p>

              {/* Active Hazards List */}
              {activeHazards.map(haz => (
                <div key={haz.id} className={`hazard-card ${haz.probability > 80 ? 'high-prob' : ''}`}>
                  <div className="hazard-header">
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>{haz.issue}</strong>
                    <span className="badge-risk">{haz.probability}% PROBABILITY</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>📍 {haz.sector} | ⏳ {haz.timeframe}</div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-body)' }}>💡 <em>{haz.recommendation}</em></div>

                  <div className="impact-grid">
                    <div>Est Cost: <strong style={{ color: 'var(--text-dark)' }}>{haz.budget.cost}</strong></div>
                    <div>Workforce: <strong style={{ color: 'var(--text-dark)' }}>{haz.budget.workers} Specialists</strong></div>
                    <div>CO₂ Prevented: <strong style={{ color: 'var(--forest-700)' }}>{haz.greenImpact.co2Saved || '120 kg'}</strong></div>
                    <div>Residents Impacted: <strong style={{ color: 'var(--text-dark)' }}>{haz.greenImpact.people}</strong></div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '14px', padding: '9px', fontSize: '0.82rem', background: scheduledOrders[haz.id] ? 'var(--forest-700)' : undefined }}
                    onClick={() => triggerWorkOrder(haz.id)}
                    disabled={scheduledOrders[haz.id]}
                  >
                    {scheduledOrders[haz.id] ? '✓ Work Order Scheduled (Failure Prevented)' : '⚡ Trigger Proactive Maintenance Work Order'}
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
            <div className="editorial-card" style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card-header">
                <div className="card-title">Municipal Resource Allocation & Ecological Impact</div>
                <span style={{ background: 'var(--forest-100)', color: 'var(--forest-800)', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '999px' }}>
                  SUSTAINABILITY MATRIX
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Quantifies municipal resource allocation and environmental benefit (CO₂/Methane reduction, area restored, and citizens benefited).
              </p>

              <div className="budget-green-grid">
                <div className="impact-card">
                  <h3>Budget Preserved</h3>
                  <div className="stat-highlight">₹{totalSavedBudget.toLocaleString()}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saved by repairing infrastructure before catastrophic structural failure.</p>
                </div>
                <div className="impact-card">
                  <h3>CO₂ Offset</h3>
                  <div className="stat-highlight" style={{ color: 'var(--forest-700)' }}>{totalSavedCO2} kg</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Achieved through preventative EV routing & expedited repair cycles.</p>
                </div>
                <div className="impact-card">
                  <h3>Citizens Protected</h3>
                  <div className="stat-highlight" style={{ color: 'var(--forest-800)' }}>1,45,000</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across Sector 62, Sector 18, and Cyber City Central.</p>
                </div>
              </div>

              {/* Carbon Credit Redemption Simulator */}
              <div style={{ background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-dark)', margin: 0 }}>Redeem Citizen Carbon Credits</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--forest-700)', fontWeight: '700' }}>Balance: {rewardPoints} Credits</span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
                  Citizens can redeem accumulated reward points for public transit passes, EV charging discounts, or municipal utility bill reductions.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-cream)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🚌</div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-dark)' }}>Metro 1-Day Pass</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Cost: 200 Credits</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '7px 14px', fontSize: '0.78rem', width: '100%' }}
                      onClick={() => handleRedeemVoucher('metro', 200, 'Metro 1-Day Pass', 'Unlimited 1-day travel across all metro lines.', '🚌')}
                    >
                      Redeem Pass
                    </button>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-cream)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>⚡</div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-dark)' }}>EV Fast-Charging Discount</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Cost: 350 Credits</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '7px 14px', fontSize: '0.78rem', width: '100%' }}
                      onClick={() => handleRedeemVoucher('ev', 350, 'EV Charging Voucher', '₹150 off at any municipal EV fast-charging hub.', '⚡')}
                    >
                      Redeem Voucher
                    </button>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-cream)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>💧</div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-dark)' }}>Water Utility Rebate (5%)</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Cost: 500 Credits</span>
                    <button
                      className="btn-primary"
                      style={{ padding: '7px 14px', fontSize: '0.78rem', width: '100%' }}
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
          <div className="editorial-card modal-card" style={{ maxWidth: '640px', padding: '28px' }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '1.25rem' }}>AI City Governor Decision Terminal</div>
              <button onClick={() => setIsGovernorModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            {/* Quick Predictive Prompt Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("🔮 Predict future problems across all sectors")}>🔮 Predict All Risks</button>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("Tell me about Sector 62 pothole risk")}>🛣️ Sector 62 Potholes</button>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("Forecast Sector 18 flood emergency")}>🌧️ Sector 18 Flood</button>
              <button className="sector-pill-btn" onClick={() => handleSendGovernorQuery("Predict power grid thermal overload")}>⚡ Cyber City Power</button>
            </div>

            <div style={{ height: '300px', overflowY: 'auto', background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '12px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    background: msg.sender === 'user' ? 'var(--forest-100)' : '#FFFFFF',
                    border: '1px solid var(--border-cream)',
                    color: 'var(--text-dark)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  <div>{msg.text}</div>

                  {/* If message includes structured prediction details */}
                  {msg.prediction && (
                    <div style={{ marginTop: '10px', background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', borderLeft: '4px solid var(--crimson)', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--crimson)' }}>🚨 {msg.prediction.issue}</strong>
                        <span style={{ background: '#FEE2E2', color: 'var(--crimson)', fontWeight: '700', fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px' }}>
                          {msg.prediction.probability}% RISK
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        📍 {msg.prediction.sector} | ⏳ Window: {msg.prediction.timeframe} | 💰 Save: {msg.prediction.saved}
                      </div>

                      <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '7px', fontSize: '0.75rem', background: scheduledOrders[msg.prediction.id] ? 'var(--forest-700)' : undefined }}
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
                placeholder="Ask about sector forecasts, weather resilience, or infrastructure health..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendGovernorQuery()}
                style={{ flex: 1, background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', color: 'var(--text-dark)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}
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
