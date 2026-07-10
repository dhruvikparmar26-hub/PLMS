import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Full Name is required';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      // 1. Call existing backend registration endpoint
      await api.post('/auth/signup', {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
      });

      // 2. Redirect to Login Page with success message state
      navigate('/login', {
        state: { successMessage: 'Account created successfully. Please login to continue.' },
      });
    } catch (err) {
      console.error('Signup error:', err);
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        maxWidth: '460px',
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>Create your account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Join Momentum to track your progress and calibrate skills.</p>
        </div>

        {serverError && (
          <div className="blueprint-card" style={{
            padding: '12px 16px',
            borderColor: 'var(--danger)',
            color: 'var(--danger)',
            marginBottom: '24px',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(239, 68, 68, 0.05)'
          }}>
            ERROR: {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Full Name */}
          <div>
            <label className="font-mono" style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ananya Sharma"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem' }}
            />
            {errors.name && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{errors.name}</div>}
          </div>

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
            {errors.email && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{errors.email}</div>}
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
            {errors.password && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-mono" style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input-field"
              style={{ width: '100%', padding: '10px 14px', fontSize: '0.875rem' }}
            />
            {errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{errors.confirmPassword}</div>}
          </div>

          {/* Show/Hide checkbox toggle */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                style={{ width: '15px', height: '15px', cursor: 'pointer' }}
              />
              Show Password
            </label>
          </div>

          {/* Create Account button */}
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
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}
