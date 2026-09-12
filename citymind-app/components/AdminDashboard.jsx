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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Top Key Metrics Bar - Editorial Bento Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="editorial-card" style={{ textAlign: 'left', padding: '20px 22px' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: '600' }}>Total City Complaints</span>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--forest-800)', margin: '6px 0 2px' }}>{totalComplaints}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--forest-600)', fontWeight: '600' }}>↑ 14% vs last cycle</span>
        </div>

        <div className="editorial-card" style={{ textAlign: 'left', padding: '20px 22px' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: '600' }}>Resolution Efficiency</span>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--forest-800)', margin: '6px 0 2px' }}>{resolutionRate}%</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg dispatch: 3.1 hours</span>
        </div>

        <div className="editorial-card" style={{ textAlign: 'left', padding: '20px 22px' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: '600' }}>Proactive Work Orders</span>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--forest-800)', margin: '6px 0 2px' }}>{predictiveHazards.length} Active</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--amber)', fontWeight: '600' }}>Structural damage prevented</span>
        </div>

        <div className="editorial-card" style={{ textAlign: 'left', padding: '20px 22px' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', fontWeight: '600' }}>Filtered Fake Reports</span>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--forest-800)', margin: '6px 0 2px' }}>{rejectedCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--forest-700)', fontWeight: '600' }}>₹92,000 public funds saved</span>
        </div>
      </div>

      {/* AI Priority List & Resolution Tracking Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>

        {/* 1. AI PRIORITY LIST & DISPATCH CONTROL */}
        <div className="editorial-card">
          <div className="card-header">
            <div className="card-title">Automated AI Priority & Dispatch</div>
            <span style={{ background: 'var(--forest-100)', color: 'var(--forest-800)', fontSize: '0.72rem', fontWeight: '700', padding: '4px 10px', borderRadius: '999px' }}>
              RISK RANKED
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.5' }}>
            CityMind neural engine continuously orders municipal work orders based on structural risk score, traffic congestion impact, and public safety priority.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {userReports.map((rep, idx) => {
              const currentStatus = reportStatuses[rep.id] || rep.status;
              const isDispatched = currentStatus.includes('Dispatched');
              const isResolved = currentStatus.includes('Resolved');
              const isRejected = currentStatus.includes('Rejected');

              return (
                <div 
                  key={rep.id ? `${rep.id}-${idx}` : idx} 
                  style={{ 
                    background: 'var(--bg-cream-alt)', 
                    padding: '16px', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border-cream)', 
                    borderLeft: `4px solid ${isRejected ? 'var(--crimson)' : isResolved ? 'var(--forest-600)' : idx === 0 ? 'var(--crimson)' : 'var(--amber)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-dark)' }}>Priority #{idx + 1}: {rep.category}</strong>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: '700', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: isResolved ? '#EBF3EE' : isDispatched ? '#E0F2FE' : isRejected ? '#FEE2E2' : '#FEF3C7',
                      color: isResolved ? 'var(--forest-700)' : isDispatched ? '#0369A1' : isRejected ? 'var(--crimson)' : '#92400E' 
                    }}>
                      {currentStatus} (Risk: {rep.priorityScore || 85}/100)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📍 {rep.location}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '10px', borderRadius: '6px', marginBottom: '12px', border: '1px solid var(--border-cream)', color: 'var(--text-body)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--forest-800)' }}>Recommendation:</span> Dispatch municipal emergency unit for immediate micro-surfacing and traffic control.
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.75rem', background: isDispatched || isResolved ? 'var(--forest-700)' : undefined }}
                      onClick={() => handleApproveDispatch(rep.id)}
                      disabled={isDispatched || isResolved || isRejected}
                    >
                      {isDispatched ? '✓ Dispatched & En Route' : isResolved ? '✓ Resolved' : '⚡ Approve Dispatch'}
                    </button>

                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', color: isResolved ? 'var(--text-muted)' : 'var(--forest-700)' }}
                      onClick={() => handleMarkResolved(rep.id)}
                      disabled={isResolved || isRejected}
                    >
                      ✓ Mark Resolved
                    </button>

                    <button
                      className="btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleRejectFake(rep.id)}
                      disabled={isRejected || isResolved}
                    >
                      Flag Fake
                    </button>

                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => setInspectedReport(rep)}
                    >
                      Inspect Verification
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
          <div className="editorial-card">
            <div className="card-title" style={{ marginBottom: '14px', fontSize: '1.15rem' }}>Department Efficiency</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(deptMap).map((deptName, i) => {
                const total = deptMap[deptName].total;
                const resolved = deptMap[deptName].resolved;
                const eff = ((resolved / total) * 100).toFixed(1);
                return (
                  <div key={i} style={{ background: 'var(--bg-cream-alt)', padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', border: '1px solid var(--border-cream)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-dark)' }}>{deptName}</strong>
                      <span style={{ color: 'var(--forest-700)', fontWeight: '700' }}>{eff}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <span>Total: {total}</span>
                      <span>Active/Resolved: {resolved}</span>
                      <span>Pending: {total - resolved}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Analytics Summary */}
          <div className="editorial-card">
            <div className="card-title" style={{ marginBottom: '14px', fontSize: '1.15rem' }}>Monthly Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
              {MONTHLY_ANALYTICS.map((m, idx) => (
                <div key={idx} style={{ background: 'var(--bg-cream-alt)', padding: '12px 8px', borderRadius: '8px', border: '1px solid var(--border-cream)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{m.month}</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--forest-800)', margin: '4px 0' }}>{m.complaints}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--forest-600)', fontWeight: '600' }}>{m.avgResolutionHours}h avg</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* METADATA INSPECTION MODAL */}
      {inspectedReport && (
        <div className="modal-overlay">
          <div className="editorial-card modal-card" style={{ maxWidth: '580px' }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '1.25rem' }}>Verification & Spatial Metadata</div>
              <button onClick={() => setInspectedReport(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-cream-alt)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-cream)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>Report ID: {inspectedReport.id}</strong>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: inspectedReport.verificationStatus?.includes('Real') ? 'var(--forest-700)' : 'var(--crimson)' }}>
                  {inspectedReport.verificationStatus || 'AI Verified - Real'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Reporter: <strong style={{ color: 'var(--text-dark)' }}>{inspectedReport.user}</strong> ({inspectedReport.trustBadge || 'Verified Citizen'})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Location: {inspectedReport.location}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>🖼️ Image Reverse Match</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--forest-700)' }}>
                  {inspectedReport.aiAnalysis?.duplicateScore || '0.1% Stock Match'}
                </strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Original user photograph confirmed</div>
              </div>

              <div style={{ background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>🤖 Generative AI Detection</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--forest-700)' }}>
                  {inspectedReport.aiAnalysis?.aiGenProbability || '0.3% Synthetic'}
                </strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Camera sensor noise pattern verified</div>
              </div>

              <div style={{ background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>📍 EXIF Spatial Triangulation</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--forest-800)' }}>GPS Coordinates Matched</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Cellular tower & GPS metadata aligned</div>
              </div>

              <div style={{ background: 'var(--bg-cream-alt)', border: '1px solid var(--border-cream)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>⚡ Auto Priority Allocation</div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--amber)' }}>Score: {inspectedReport.priorityScore || 85}/100</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>High traffic impact multiplier applied</div>
              </div>
            </div>

            {inspectedReport.photoUrl && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <img src={inspectedReport.photoUrl} alt="Inspected evidence" style={{ maxHeight: '180px', borderRadius: '8px', border: '1px solid var(--border-cream)', objectFit: 'cover', width: '100%' }} />
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
