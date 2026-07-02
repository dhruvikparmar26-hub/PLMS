import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
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
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await signup(form.name, form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '6px',
    fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
    letterSpacing: '0.08em',
  };

  const fieldErrorStyle = {
    marginTop: '6px', fontSize: '0.75rem',
    color: 'var(--danger)', fontFamily: 'var(--font-mono)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
         style={{ background: 'var(--bg-canvas)' }}>
      <div className="w-full max-w-md space-y-8 animate-fade-in-up">

        {/* Technical header block */}
        <div>
          <span className="tech-header">SESSION:AUTH / REGISTER</span>
          <h1 style={{ marginTop: '8px' }}>Open your learning lab</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Set up your workspace. We'll personalize it after you sign in.
          </p>
        </div>

        {/* Card */}
        <div className="blueprint-card" style={{ padding: '32px' }}>
          {/* Success message */}
          {success && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px',
              background: 'rgba(52, 211, 153, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--success)', fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
            }}>
              ✓ LAB CREATED — Redirecting to sign-in…
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px',
              background: 'rgba(255, 77, 106, 0.08)',
              border: '1px solid rgba(255, 77, 106, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)', fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
            }}>
              ⚠ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Name */}
            <div>
              <label htmlFor="signup-name" style={labelStyle}>Full Name</label>
              <input
                id="signup-name" name="name" type="text"
                value={form.name} onChange={handleChange}
                placeholder="Jane Doe"
                className={`input-field${errors.name ? ' error' : ''}`}
              />
              {errors.name && <p style={fieldErrorStyle}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" style={labelStyle}>Email Address</label>
              <input
                id="signup-email" name="email" type="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className={`input-field${errors.email ? ' error' : ''}`}
              />
              {errors.email && <p style={fieldErrorStyle}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" style={labelStyle}>Password</label>
              <input
                id="signup-password" name="password" type="password"
                value={form.password} onChange={handleChange}
                placeholder="min. 8 characters"
                className={`input-field${errors.password ? ' error' : ''}`}
              />
              {errors.password && <p style={fieldErrorStyle}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" style={labelStyle}>Confirm Password</label>
              <input
                id="signup-confirm" name="confirmPassword" type="password"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="re-enter your password"
                className={`input-field${errors.confirmPassword ? ' error' : ''}`}
              />
              {errors.confirmPassword && <p style={fieldErrorStyle}>{errors.confirmPassword}</p>}
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
                  Provisioning lab…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Footer link */}
          <p style={{
            marginTop: '24px', textAlign: 'center',
            fontSize: '0.8125rem', color: 'var(--text-secondary)',
          }}>
            Already have a lab?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
