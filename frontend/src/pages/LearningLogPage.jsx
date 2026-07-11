import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import DashboardLayout from '../components/layout/DashboardLayout';

function CertificatesTab() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/certificates');
        setCertificates(res.data.certificates || []);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        SCANNING_CERTIFICATE_REGISTRY...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {certificates.length === 0 ? (
        <div className="blueprint-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
            No certificates earned yet. Complete a course at 100% to earn and view your certificate here.
          </p>
        </div>
      ) : (
        certificates.map((cert) => (
          <div key={cert._id} className="blueprint-card animate-fade-in-up" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>🎓</span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: cert.grade === 'Distinction' ? 'var(--accent-secondary)' : cert.grade === 'Merit' ? 'var(--accent-primary)' : 'var(--success)',
                    border: `1px solid currentColor`,
                    padding: '1px 6px',
                    borderRadius: '3px',
                  }}
                >
                  {cert.grade}
                </span>
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {cert.course?.title}
              </h4>
              <p className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {cert.course?.category} · Issued {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
            </div>
            <Link to={`/certificates/${cert._id}`} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 16px', textDecoration: 'none', flexShrink: 0 }}>
              View
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default function LearningLogPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 24px', width: '100%' }} className="animate-fade-in-up">
        {/* Page Title */}
        <div className="notebook-margin" style={{ marginBottom: '32px' }}>
          <h1>Certificates</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            View and verify your earned course completion credentials.
          </p>
        </div>

        {/* Certificates view */}
        <CertificatesTab />
      </div>
    </DashboardLayout>
  );
}
