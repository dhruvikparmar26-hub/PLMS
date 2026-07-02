import React from 'react';
import { getLabel } from '../utils/labelMap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'var(--bg-canvas)',
          padding: '24px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)'
        }}>
          <div className="blueprint-card" style={{
            maxWidth: '500px', width: '100%', padding: '32px',
            display: 'flex', flexDirection: 'column', gap: '20px',
            border: '1px solid var(--danger)', background: 'var(--bg-surface)'
          }}>
            <div>
              <span className="font-mono text-danger" style={{ fontSize: '0.6875rem', fontWeight: 700 }}>
                {getLabel('CRITICAL_SYSTEM_ERROR')} // {getLabel('CRASH_DETECTED')}
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '8px' }}>
                Application Crash
              </h1>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              The client UI encountered a rendering exception. Code execution was suspended to prevent data corruption.
            </p>

            <div style={{
              background: 'rgba(255,77,106,0.05)', border: '1px solid rgba(255,77,106,0.15)',
              padding: '12px', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem', color: 'var(--danger)', overflowX: 'auto', whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString()}
            </div>

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.8125rem', background: 'var(--danger)', color: '#fff' }}
            >
              {getLabel('REBOOT_SESSION')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
