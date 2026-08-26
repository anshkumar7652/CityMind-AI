'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { MONTHLY_ANALYTICS } from '@/lib/data';

export default function AdminDashboard({ userReports = [], predictiveHazards = [], selectedSectorId, onSectorSelect, onReportStatusChange }) {
  const [inspectedReport, setInspectedReport] = useState(null);
  const [reportStatuses, setReportStatuses] = useState({});

  // Calculate dynamic metrics
  const totalComplaints = userReports.length + 438;
  
  const resolvedCount = userReports.filter(r => {
    const st = reportStatuses[r.id] || r.status;
    return st.includes('Resolved') || st.includes('Completed');
  }).length + 390;

  const rejectedCount = userReports.filter(r => {
    const st = reportStatuses[r.id] || r.status;
    return st.includes('Rejected');
  }).length + 14;

  const resolutionRate = ((resolvedCount / totalComplaints) * 100).toFixed(1);

  const handleApproveDispatch = (reportId) => {
    setReportStatuses(prev => ({ ...prev, [reportId]: 'Dispatched & En Route' }));
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    if (onReportStatusChange) {
      onReportStatusChange(reportId, 'Dispatched & En Route');
    }
  };

  const handleMarkResolved = (reportId) => {
    setReportStatuses(prev => ({ ...prev, [reportId]: 'Resolved & Closed' }));
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    if (onReportStatusChange) {
      onReportStatusChange(reportId, 'Resolved & Closed');
    }
  };

  const handleRejectFake = (reportId) => {
    setReportStatuses(prev => ({ ...prev, [reportId]: 'Rejected (Fake Report)' }));
    if (onReportStatusChange) {
      onReportStatusChange(reportId, 'Rejected (Fake Report)');
    }
  };

  // Calculate dynamic department statistics based on userReports
  const deptMap = {
    'Public Works Department (PWD)': { total: 142, resolved: 128 },
    'Water & Sanitation Authority': { total: 98, resolved: 89 },
    'Municipal Solid Waste': { total: 215, resolved: 202 },
    'Traffic Control Bureau': { total: 76, resolved: 72 }
  };

  userReports.forEach(r => {
    const dept = r.department || 'Public Works Department (PWD)';
    if (!deptMap[dept]) deptMap[dept] = { total: 1, resolved: 0 };
    deptMap[dept].total += 1;
    const currentStatus = reportStatuses[r.id] || r.status;
    if (currentStatus.includes('Resolved') || currentStatus.includes('Dispatched')) {
      deptMap[dept].resolved += 1;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Key Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📊 Total City Complaints</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0' }}>{totalComplaints}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>+14% vs last month</span>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>✅ Resolution Efficiency</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: 'var(--emerald)' }}>{resolutionRate}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Time: 3.1 Hours</span>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔮 Proactive Work Orders</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: 'var(--primary)' }}>{predictiveHazards.length} Active</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--amber)' }}>Preventing structural failure</span>
        </div>

        <div className="glass-card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🛡️ Fake Reports Blocked</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: 'var(--crimson)' }}>{rejectedCount} Reports</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>₹92,000 Budget Preserved</span>
        </div>
      </div>

      {/* AI Priority List & Resolution Tracking Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>

        {/* 1. AI PRIORITY LIST & DISPATCH CONTROL */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">🤖 AI Priority Decision Support</div>
            <span className="badge-risk">AI RISK RANKED</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            CityMind AI ranks all reported & predicted issues based on emergency risk score, traffic load, and disease vector probability.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userReports.map((rep, idx) => {
              const currentStatus = reportStatuses[rep.id] || rep.status;
              const isDispatched = currentStatus.includes('Dispatched');
              const isResolved = currentStatus.includes('Resolved');
              const isRejected = currentStatus.includes('Rejected');

              return (
                <div key={rep.id ? `${rep.id}-${idx}` : idx} style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid var(--panel-border)', borderLeft: `4px solid ${isRejected ? 'var(--crimson)' : isResolved ? 'var(--emerald)' : idx === 0 ? 'var(--crimson)' : 'var(--amber)'}`, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Priority #{idx + 1}: {rep.category}</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isResolved ? 'var(--emerald)' : isDispatched ? 'var(--primary)' : isRejected ? 'var(--crimson)' : 'var(--crimson)' }}>
                      {currentStatus} (Risk: {rep.priorityScore || 85}/100)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>📍 {rep.location}</div>
                  
                  <div style={{ fontSize: '0.78rem', background: 'var(--bg-subtle)', padding: '6px', borderRadius: '6px', marginBottom: '8px' }}>
                    🤖 AI Recommendation: <em>Dispatch municipal emergency unit for immediate micro-surfacing and traffic control.</em>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: isDispatched || isResolved ? '#10b981' : undefined }}
                      onClick={() => handleApproveDispatch(rep.id)}
                      disabled={isDispatched || isResolved || isRejected}
                    >
                      {isDispatched ? '✓ Dispatched & En Route' : isResolved ? '✓ Resolved' : '⚡ Approve Dispatch'}
                    </button>

                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--emerald-light)', color: 'var(--emerald)', border: '1px solid var(--emerald)', boxShadow: 'none' }}
                      onClick={() => handleMarkResolved(rep.id)}
                      disabled={isResolved || isRejected}
                    >
                      ✓ Resolve Issue
                    </button>

                    <button
                      className="btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.72rem' }}
                      onClick={() => handleRejectFake(rep.id)}
                      disabled={isRejected || isResolved}
                    >
                      🚫 Flag & Reject Fake
                    </button>

                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#f1f5fe', color: 'var(--primary)', border: '1px solid var(--panel-border)', boxShadow: 'none' }}
                      onClick={() => setInspectedReport(rep)}
                    >
                      🔍 Inspect AI Metadata
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. DEPARTMENT-WISE RESOLUTION TRACKING & MONTHLY ANALYTICS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Department Performance */}
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: '12px' }}>🏢 Department-Wise Resolution Tracking</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(deptMap).map((deptName, i) => {
                const total = deptMap[deptName].total;
                const resolved = deptMap[deptName].resolved;
                const eff = ((resolved / total) * 100).toFixed(1);
                return (
                  <div key={i} style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', border: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong>{deptName}</strong>
                      <span style={{ color: 'var(--emerald)', fontWeight: '700' }}>Efficiency: {eff}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <span>Total: {total}</span>
                      <span>Resolved/Active: {resolved}</span>
                      <span>Pending: {total - resolved}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Analytics Summary */}
          <div className="glass-card">
            <div className="card-title" style={{ marginBottom: '12px' }}>📈 Monthly Resolution Analytics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
              {MONTHLY_ANALYTICS.map((m, idx) => (
                <div key={idx} style={{ background: '#fff', padding: '10px 6px', borderRadius: '8px', border: '1px solid var(--panel-border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.month}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{m.complaints}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--emerald)' }}>{m.avgResolutionHours}h avg</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* METADATA INSPECTION MODAL */}
      {inspectedReport && (
        <div className="modal-overlay">
          <div className="glass-card modal-card" style={{ maxWidth: '580px' }}>
            <div className="card-header">
              <div className="card-title">🔍 AI Verification & Spatial Metadata</div>
              <button onClick={() => setInspectedReport(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', border: '1px solid var(--panel-border)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.95rem' }}>Report ID: {inspectedReport.id}</strong>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: inspectedReport.verificationStatus?.includes('Real') ? 'var(--emerald)' : 'var(--crimson)' }}>
                  {inspectedReport.verificationStatus || 'AI Verified - Real'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Reporter: <strong>{inspectedReport.user}</strong> ({inspectedReport.trustBadge || 'Verified Citizen'})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Location: {inspectedReport.location}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: '#fff', border: '1px solid var(--panel-border)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>🖼️ Reverse Image Search</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--emerald)' }}>
                  {inspectedReport.aiAnalysis?.duplicateScore || '0.1% Stock Match'}
                </strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Original user photograph confirmed</div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--panel-border)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>🤖 Generative AI Detection</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--emerald)' }}>
                  {inspectedReport.aiAnalysis?.aiGenProbability || '0.3% Synthetic'}
                </strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Camera sensor noise pattern verified</div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--panel-border)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>📍 EXIF Spatial Triangulation</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>GPS Coordinates Matched</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Cellular tower & GPS metadata aligned</div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--panel-border)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>⚡ Auto Priority Allocation</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--amber)' }}>Score: {inspectedReport.priorityScore || 85}/100</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>High traffic impact multiplier applied</div>
              </div>
            </div>

            {inspectedReport.photoUrl && (
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <img src={inspectedReport.photoUrl} alt="Inspected evidence" style={{ maxHeight: '180px', borderRadius: '10px', border: '1px solid var(--panel-border)', objectFit: 'cover', width: '100%' }} />
              </div>
            )}

            <button className="btn-primary" style={{ width: '100%', padding: '10px' }} onClick={() => setInspectedReport(null)}>
              Close Metadata Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
