import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/forms/AuthCard';
import EmailInput from '../components/forms/EmailInput';
import PasswordInput from '../components/forms/PasswordInput';
import './Login.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    requestedRole: 'DEVELOPER',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Full name is required';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        requestedRole: formData.requestedRole
      });

      if (result.success) {
        // If user requested Manager, they are currently a DEVELOPER pending approval
        if (formData.requestedRole === 'MANAGER') {
          setPendingApproval(true);
          setIsLoading(false);
        } else {
          navigate('/my-assets');
        }
      } else {
        setError(result.error || 'Signup failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Show pending approval message after Manager signup
  if (pendingApproval) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <AuthCard title="Request Submitted" subtitle="Your manager access is pending approval">
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <div className="ui-spinner" style={{ borderColor: 'rgba(255,255,255,0.35)', borderTopColor: '#fff' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                Your account has been created as a <strong style={{ color: 'var(--text-primary)' }}>Developer</strong>.
                Your request for <strong style={{ color: '#f59e0b' }}>Manager</strong> access has been sent to an Admin for approval.
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                You can log in now and you will automatically get Manager access once an Admin approves your request.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </div>
          </AuthCard>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <AuthCard title="Create Account" subtitle="Sign up to get started with AssetTrack">
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Full Name
                <span className="required-mark">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                required
                disabled={isLoading}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <EmailInput
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />

            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              error={errors.password}
              required
              disabled={isLoading}
            />

            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              label="Confirm Password"
              error={errors.confirmPassword}
              required
              disabled={isLoading}
            />

            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">
                I am joining as a
                <span className="required-mark">*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <label style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '0.875rem', border: `2px solid ${formData.requestedRole === 'DEVELOPER' ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                  background: formData.requestedRole === 'DEVELOPER' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)'
                }}>
                  <input
                    type="radio" name="requestedRole" value="DEVELOPER"
                    checked={formData.requestedRole === 'DEVELOPER'}
                    onChange={handleChange} style={{ display: 'none' }}
                  />
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em',
                    padding: '5px 9px', borderRadius: '6px', marginBottom: '0.35rem',
                    background: 'rgba(99,102,241,0.18)', color: '#6366f1'
                  }}>DEV</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Developer</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', textAlign: 'center' }}>Instant access</span>
                </label>
                <label style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '0.875rem', border: `2px solid ${formData.requestedRole === 'MANAGER' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
                  background: formData.requestedRole === 'MANAGER' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)'
                }}>
                  <input
                    type="radio" name="requestedRole" value="MANAGER"
                    checked={formData.requestedRole === 'MANAGER'}
                    onChange={handleChange} style={{ display: 'none' }}
                  />
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em',
                    padding: '5px 9px', borderRadius: '6px', marginBottom: '0.35rem',
                    background: 'rgba(245,158,11,0.18)', color: '#d97706'
                  }}>MGR</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Manager</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', textAlign: 'center' }}>Requires approval</span>
                </label>
              </div>
              {formData.requestedRole === 'MANAGER' && (
                <p style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                  Manager access must be approved by an Admin before it activates.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span>
                  I agree to the <a href="#" className="inline-link">Terms of Service</a> and{' '}
                  <a href="#" className="inline-link">Privacy Policy</a>
                </span>
              </label>
              {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="auth-footer">
              <span>Already have an account?</span>
              <Link to="/login" className="auth-link">Sign in</Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
};

export default SignUp;
