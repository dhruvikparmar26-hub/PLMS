import { Link } from 'react-router-dom';

/**
 * HomePage — Public landing page.
 * Technical blueprint aesthetic with a single orchestrated page-load animation.
 */
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
         style={{ background: 'var(--bg-canvas)' }}>

      {/* Content */}
      <div className="max-w-2xl text-center space-y-8 relative z-10">

        {/* Technical header tag */}
        <div className="animate-fade-in-up">
          <span className="mono-badge" style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
            SYS:INIT — LEARNING_LAB v1.0
          </span>
        </div>

        {/* Main heading */}
        <h1 className="animate-fade-in-up delay-1"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          Your Personal{' '}
          <span style={{ color: 'var(--accent-primary)' }}>Learning Lab</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-2"
           style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          A workspace for self-directed learners to track real progress through
          courses, lessons, and assessments — not another dashboard template.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-3">
          <Link to="/signup" className="btn-primary" style={{ padding: '14px 40px', fontSize: '0.9375rem' }}>
            Create your lab
          </Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '14px 40px', fontSize: '0.9375rem' }}>
            Sign in to continue
          </Link>
        </div>

        {/* Technical footer line */}
        <div className="animate-fade-in-up delay-4" style={{ paddingTop: '24px' }}>
          <p className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
            MERN STACK · JWT AUTH · PERSONALIZED RECOMMENDATIONS · SERVER-GRADED ASSESSMENTS
          </p>
        </div>
      </div>

      {/* Decorative corner marks — like blueprint registration marks */}
      <div style={{
        position: 'absolute', top: '32px', left: '32px',
        width: '24px', height: '24px',
        borderTop: '2px solid var(--accent-primary)',
        borderLeft: '2px solid var(--accent-primary)',
        opacity: 0.4
      }} />
      <div style={{
        position: 'absolute', top: '32px', right: '32px',
        width: '24px', height: '24px',
        borderTop: '2px solid var(--accent-primary)',
        borderRight: '2px solid var(--accent-primary)',
        opacity: 0.4
      }} />
      <div style={{
        position: 'absolute', bottom: '32px', left: '32px',
        width: '24px', height: '24px',
        borderBottom: '2px solid var(--accent-primary)',
        borderLeft: '2px solid var(--accent-primary)',
        opacity: 0.4
      }} />
      <div style={{
        position: 'absolute', bottom: '32px', right: '32px',
        width: '24px', height: '24px',
        borderBottom: '2px solid var(--accent-primary)',
        borderRight: '2px solid var(--accent-primary)',
        opacity: 0.4
      }} />
    </div>
  );
};

export default HomePage;
