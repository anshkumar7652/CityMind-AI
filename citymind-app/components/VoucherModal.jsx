'use client';

export default function VoucherModal({ voucher, onClose }) {
  if (!voucher) return null;

  return (
    <div className="modal-overlay">
      <div className="editorial-card modal-card" style={{ maxWidth: '460px', textAlign: 'center', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--forest-800)', margin: 0 }}>
            Voucher Redeemed
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ background: 'var(--bg-cream-alt)', padding: '24px 20px', borderRadius: '12px', border: '1px solid var(--border-cream)', marginBottom: '18px' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{voucher.icon || '🎟️'}</div>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '6px' }}>{voucher.title}</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>{voucher.desc}</p>

          {/* Voucher Code Box */}
          <div style={{ background: '#FFFFFF', border: '1px dashed var(--forest-800)', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600' }}>OFFICIAL VOUCHER PASS</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--forest-800)', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>{voucher.code}</strong>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Valid through: <strong style={{ color: 'var(--text-dark)' }}>{voucher.expiresAt}</strong> | Status: <span style={{ color: 'var(--forest-700)', fontWeight: '700' }}>Active</span>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
          Present this pass at transit kiosks, municipal EV charging stations, or scan via the citizen mobile terminal.
        </p>

        <button className="btn-primary" style={{ width: '100%', padding: '11px' }} onClick={onClose}>
          Done & Return
        </button>
      </div>
    </div>
  );
}
