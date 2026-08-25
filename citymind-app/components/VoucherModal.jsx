'use client';

export default function VoucherModal({ voucher, onClose }) {
  if (!voucher) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-card" style={{ maxWidth: '460px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
            🎉 Voucher Successfully Redeemed!
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--emerald-light))', padding: '20px', borderRadius: '16px', border: '1px solid var(--panel-border)', marginBottom: '16px' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>{voucher.icon || '🎟️'}</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>{voucher.title}</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{voucher.desc}</p>

          {/* Voucher Code Box */}
          <div style={{ background: '#fff', border: '2px dashed var(--primary)', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>VOUCHER CODE</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary)', letterSpacing: '2px', fontFamily: 'monospace' }}>{voucher.code}</strong>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Valid until: <strong>{voucher.expiresAt}</strong> | Status: <span style={{ color: 'var(--emerald)', fontWeight: '700' }}>Active</span>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Show this code at Metro Ticket Counters, EV Charging Stations, or scan QR at Municipal Payment Desks.
        </p>

        <button className="btn-primary" style={{ width: '100%', padding: '10px' }} onClick={onClose}>
          Done & Close
        </button>
      </div>
    </div>
  );
}
