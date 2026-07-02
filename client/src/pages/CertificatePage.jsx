import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function CertificatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/certificates/${id}`);
      setCertificate(res.data.certificate);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load certificate.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>LOADING_CERTIFICATE...</div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{error || 'Certificate not found.'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back to Dashboard</button>
      </div>
    );
  }

  const issued = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', padding: '40px 24px' }} className="animate-fade-in-up">

      {/* Nav */}
      <div style={{ maxWidth: '800px', margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/dashboard" className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← DASHBOARD
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to={`/verify/${certificate.verificationCode}`}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            Public Verify Link
          </Link>
          <button onClick={handlePrint} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Certificate Card */}
      <div
        id="certificate-print"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.08)',
        }}
      >
        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '40px', height: '40px', borderTop: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)', borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '40px', height: '40px', borderTop: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)', borderRadius: '0 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '40px', height: '40px', borderBottom: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)', borderRadius: '0 0 0 4px' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '40px', height: '40px', borderBottom: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)', borderRadius: '0 0 4px 0' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-primary)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}>
            PLMS · PERSONAL LEARNING LAB
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Certificate of Completion
          </h1>
          <div style={{ width: '60px', height: '2px', background: 'var(--accent-primary)', margin: '16px auto 0' }} />
        </div>

        {/* Body */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            This certifies that
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '16px' }}>
            {certificate.user?.name || 'Learner'}
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            has successfully completed
          </p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {certificate.course?.title}
          </h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {certificate.course?.category} · {certificate.course?.difficulty}
          </p>
        </div>

        {/* Grade & Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '48px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>GRADE</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: certificate.grade === 'Distinction' ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
              {certificate.grade}
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '1.5rem' }}>
              🎓
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>ISSUED ON</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {issued}
            </p>
          </div>
        </div>

        {/* Verification Code */}
        <div style={{
          marginTop: '32px',
          padding: '12px 16px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.15em' }}>
            VERIFICATION_CODE
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.1em' }}>
            {certificate.verificationCode}
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verify at: {window.location.origin}/verify/{certificate.verificationCode}
          </p>
        </div>
      </div>
    </div>
  );
}
