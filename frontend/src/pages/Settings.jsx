import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const SETTINGS_KEY = 'assettrack_settings';

/* ── Section wrapper ─────────────────────────────────────────────────── */
const Section = ({ title, subtitle, children }) => (
  <div style={sectionStyle}>
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: 600 }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </div>
);

/* ── Toggle switch ───────────────────────────────────────────────────── */
const Toggle = ({ label, description, checked, onChange }) => (
  <div style={toggleRowStyle}>
    <div>
      <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        {label}
      </p>
      {description && (
        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={{
        ...switchStyle,
        background: checked ? '#8b5cf6' : '#d1d5db',
      }}
      title={checked ? 'Disable' : 'Enable'}
    >
      <span style={{
        ...thumbStyle,
        transform: checked ? 'translateX(20px)' : 'translateX(2px)',
      }} />
    </button>
  </div>
);

/* ── Main Settings Component ─────────────────────────────────────────── */
const Settings = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved).darkMode : false;
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });

  // Apply theme and persist
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ darkMode }));
  }, [darkMode]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    try {
      await userService.changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordStatus({ message: 'Password updated successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordStatus({ message: err.message || 'Failed to update password', type: 'error' });
    }
    setTimeout(() => setPasswordStatus({ message: '', type: '' }), 3000);
  };

  return (
    <div className="overview-content">
      <div style={{ maxWidth: '680px', paddingBottom: '40px' }}>

        {/* ── User Profile ───────────────────────────────────────── */}
        <Section
          title="👤 User Profile"
          subtitle="Your account details."
        >
          <div style={profileGridStyle}>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Full Name</span>
              <span style={valueStyle}>{user?.fullName || 'N/A'}</span>
            </div>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Email Address</span>
              <span style={valueStyle}>{user?.email || 'N/A'}</span>
            </div>
            <div style={profileItemStyle}>
              <span style={labelStyle}>Assigned Role</span>
              <span style={{...valueStyle, color: 'var(--color-primary)'}}>{user?.role || 'N/A'}</span>
            </div>
          </div>
        </Section>

        {/* ── Appearance ─────────────────────────────────────────── */}
        <Section
          title="🎨 Appearance"
          subtitle="Customize the look of your dashboard."
        >
          <Toggle
            label="Dark Mode"
            description="Switch between light and dark visual themes."
            checked={darkMode}
            onChange={setDarkMode}
          />
        </Section>

        {/* ── Security / Change Password ──────────────────────────── */}
        <Section
          title="🔒 Security"
          subtitle="Manage your password and account security."
        >
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                style={inputStyle}
                required
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                style={inputStyle}
                required
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                style={inputStyle}
                required
              />
            </div>
            {passwordStatus.message && (
              <p style={{ fontSize: '0.82rem', color: passwordStatus.type === 'success' ? '#10b981' : '#ef4444' }}>
                {passwordStatus.message}
              </p>
            )}
            <button type="submit" style={secondaryBtnStyle}>Update Password</button>
          </form>
        </Section>

      </div>
    </div>
  );
};

/* ── Styles ─────────────────────────────────────────────────────────── */
const sectionStyle = {
  background: 'var(--color-card, #fff)',
  border: '1px solid var(--color-border, #e5e7eb)',
  borderRadius: '14px',
  padding: '24px',
  marginBottom: '20px',
};
const secondaryBtnStyle = {
  padding: '8px 16px',
  background: 'var(--color-primary, #8b5cf6)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 500,
  fontSize: '0.8rem',
  cursor: 'pointer',
  width: 'fit-content',
};
const toggleRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderTop: '1px solid var(--color-border, #f0f2f7)',
};
const switchStyle = {
  position: 'relative',
  width: '44px',
  height: '24px',
  borderRadius: '999px',
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.2s',
  padding: 0,
};
const thumbStyle = {
  position: 'absolute',
  top: '2px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#fff',
  transition: 'transform 0.2s',
  display: 'block',
};
const profileGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  paddingTop: '10px',
  borderTop: '1px solid var(--color-border, #f0f2f7)',
};
const profileItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};
const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};
const inputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--color-border, #d1d5db)',
  fontSize: '0.9rem',
  background: 'var(--color-background)',
  color: 'var(--color-text-primary)',
  outline: 'none',
};
const labelStyle = { color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 500 };
const valueStyle = { color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '0.9rem' };

export default Settings;
