import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getLabel } from '../utils/labelMap';

export default function VerifyCertificatePage() {
  const { code } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyCert();
  }, [code]);

  const verifyCert = async () => {
    try {
      setLoading(true);
      setError('');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await axios.get(`${baseUrl}/certificates/verify/${code}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate not found or invalid code.');
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  const issued = result?.certificate?.issuedAt
    ? new Date(result.certificate.issuedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-primary)', letterSpacing: '0.3em' }}>
          PLMS · CERTIFICATE VERIFICATION
        </span>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          {getLabel('VERIFYING_CODE_DISPLAY')}: {code}...
        </div>
      ) : result?.valid ? (
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            background: 'var(--bg-surface)',
            border: '2px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(52, 211, 153, 0.08)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)', margin: '0 0 8px' }}>
            Certificate Valid
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '32px', letterSpacing: '0.1em' }}>
            CODE: {code}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
            {[
              { label: 'RECIPIENT', value: result.certificate.userName },
              { label: 'COURSE', value: result.certificate.courseName },
              { label: 'CATEGORY', value: result.certificate.courseCategory },
              { label: 'GRADE', value: result.certificate.grade },
              { label: 'ISSUED', value: issued },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em', flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-surface)',
            border: '2px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(255, 77, 106, 0.08)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)', margin: '0 0 8px' }}>
            Certificate Invalid
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {error || 'This verification code does not match any issued certificate.'}
          </p>
        </div>
      )}

      <Link to="/" style={{ marginTop: '32px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← plms.app
      </Link>
    </div>
  );
}
