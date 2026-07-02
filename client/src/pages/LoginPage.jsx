import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'var(--bg-canvas)' }}>
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">

        {/* Technical header block */}
        <div>
          <span className="tech-header">SESSION:AUTH / LOGIN</span>
          <h1 style={{ marginTop: '8px' }}>Resume your session</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Sign in to continue where you left off.
          </p>
        </div>

        {/* Card */}
        <div className="blueprint-card" style={{ padding: '32px' }}>
          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px',
              background: 'rgba(255, 77, 106, 0.08)',
              border: '1px solid rgba(255, 77, 106, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)', fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)'
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '6px',
                fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--text-secondary)', marginBottom: '6px',
                fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="enter your password"
                className="input-field"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    width: '14px', height: '14px',
                    border: '2px solid var(--bg-canvas)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Authenticating…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Footer link */}
          <p style={{
            marginTop: '24px', textAlign: 'center',
            fontSize: '0.8125rem', color: 'var(--text-secondary)'
          }}>
            No account yet?{' '}
            <Link to="/signup" style={{ fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
