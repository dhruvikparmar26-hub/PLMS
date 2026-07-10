import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMessage = location.state?.successMessage || '';

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      // 1. Call existing backend login endpoint
      await login(form.email.toLowerCase().trim(), form.password);

      // 2. Redirect back to the dashboard
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }} className="animate-fade-in">
      
      {/* Visual background grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--border-default) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        opacity: 0.25,
        pointerEvents: 'none'
      }} />

      <div className="blueprint-card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '40px',
        zIndex: 1,
        position: 'relative',
        boxShadow: '0 8px 32px rgba(12, 16, 32, 0.5)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        background: 'var(--bg-surface)'
      }}>
        
        {/* Accent strip */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
        }} />

        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              ★
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Momentum</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Login to access your personalized course catalog.</p>
        </div>

        {/* Success message banner from signup redirect */}
        {successMessage && (
          <div className="blueprint-card" style={{
            padding: '12px 16px',
            borderColor: 'var(--success)',
            color: 'var(--success)',
            marginBottom: '24px',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(16, 185, 129, 0.05)'
          }}>
            INFO: {successMessage}
          </div>
        )}

        {error && (
          <div className="blueprint-card" style={{
            padding: '12px 16px',
            borderColor: 'var(--danger)',
            color: 'var(--danger)',
            marginBottom: '24px',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(239, 68, 68, 0.05)'
          }}>
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Email */}
          <div>
            <label className="font-mono" style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="yourname@domain.com"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem' }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="font-mono" style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem' }}
            />
          </div>

          {/* Show/Hide password & Remember me options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer' }}
              />
              Show Password
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer' }}
              />
              Remember Me
            </label>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
              border: 'none',
              marginTop: '10px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
