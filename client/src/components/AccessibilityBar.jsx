import { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const FONT_SIZES = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
  { label: 'XL', value: 'xl' },
];

const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function AccessibilityBar() {
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const acc = user?.accessibility || {
    fontSize: 'medium', highContrast: false, dyslexicFont: false, reduceMotion: false, playbackSpeed: 1.0,
  };

  const update = async (patch) => {
    try {
      setSaving(true);
      await api.patch('/users/accessibility', patch);
      await refreshUser();
    } catch (err) {
      console.error('Accessibility update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        title="Accessibility Settings"
        style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: open ? 'var(--accent-primary)' : 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          color: open ? 'var(--bg-canvas)' : 'var(--text-primary)',
          fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'all var(--transition-base)',
        }}
      >
        ♿
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'absolute', bottom: '56px', right: 0, width: '260px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', padding: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.1em' }}>
              ♿ ACCESSIBILITY
            </span>
            {saving && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>SAVING...</span>}
          </div>

          {/* Font size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>FONT_SIZE</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {FONT_SIZES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => update({ fontSize: value })}
                  style={{
                    flex: 1, padding: '4px 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: acc.fontSize === value ? 'rgba(0,240,255,0.1)' : 'var(--bg-elevated)',
                    border: `1px solid ${acc.fontSize === value ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    color: acc.fontSize === value ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle switches */}
          {[
            { key: 'highContrast', label: 'HIGH_CONTRAST' },
            { key: 'dyslexicFont', label: 'DYSLEXIC_FONT' },
            { key: 'reduceMotion', label: 'REDUCE_MOTION' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</span>
              <button
                onClick={() => update({ [key]: !acc[key] })}
                style={{
                  width: '40px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: acc[key] ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  position: 'relative', transition: 'background var(--transition-fast)',
                }}
              >
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: '3px',
                  left: acc[key] ? '23px' : '3px',
                  transition: 'left var(--transition-fast)',
                }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
