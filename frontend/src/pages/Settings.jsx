import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const SETTINGS_KEY = 'assettrack_alert_settings';

const defaultSettings = {
  warrantyWarnDays: 30,
  lowStockThreshold: 5,
  emailNotifications: true,
  inAppNotifications: true,
  notifyOnExpiry: true,
  notifyOnLowStock: true,
  notifyOnConditionReport: true,
  darkMode: false,
};

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

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

/* ── Number input row ────────────────────────────────────────────────── */
const NumberField = ({ label, description, value, onChange, unit, min, max }) => (
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={numberInputStyle}
      />
      {unit && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{unit}</span>}
    </div>
  </div>
);

/* ── Main Settings Component ─────────────────────────────────────────── */
const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });

  // Apply theme on change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.darkMode]);

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    setSaved(false);
  };

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

        {/* ── User Profile & Last Login ───────────────────────────── */}
        <Section
          title="👤 User Profile"
          subtitle="Your account details and activity."
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
            <div style={profileItemStyle}>
              <span style={labelStyle}>Last Login</span>
              <span style={valueStyle}>{new Date().toLocaleString()} (Session start)</span>
            </div>
          </div>
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

        {/* ── Appearance Settings ─────────────────────────────────── */}
        <Section
          title="🎨 Appearance"
          subtitle="Customize how the dashboard looks for you."
        >
          <Toggle
            label="Dark Mode"
            description="Switch between light and dark visual themes."
            checked={settings.darkMode}
            onChange={(v) => update('darkMode', v)}
          />
        </Section>

        {/* ── Warranty Alert Settings ─────────────────────────────── */}
        <Section
          title="⚠️ Warranty Expiration Alerts"
          subtitle="Control when the system flags assets as expiring soon. (Project req. 2.4.3)"
        >
          <NumberField
            label="Warranty Warning Window"
            description="Flag an asset as 'Expiring Soon' this many days before its warranty ends."
            value={settings.warrantyWarnDays}
            onChange={(v) => update('warrantyWarnDays', v)}
            unit="days"
            min={1}
            max={365}
          />
          <Toggle
            label="Notify on Warranty Expiry"
            description="Receive alerts when an asset's warranty is about to expire or has expired."
            checked={settings.notifyOnExpiry}
            onChange={(v) => update('notifyOnExpiry', v)}
          />
        </Section>

        {/* ── Stock Alert Settings ────────────────────────────────── */}
        <Section
          title="📦 Low Stock Alerts"
          subtitle="Get alerted when accessory inventory drops below a threshold. (Project req. 2.4.3)"
        >
          <NumberField
            label="Low Stock Threshold"
            description="Trigger a low-stock alert when available accessories fall at or below this count."
            value={settings.lowStockThreshold}
            onChange={(v) => update('lowStockThreshold', v)}
            unit="units"
            min={1}
            max={100}
          />
          <Toggle
            label="Notify on Low Stock"
            description="Receive alerts when accessory stock reaches the threshold above."
            checked={settings.notifyOnLowStock}
            onChange={(v) => update('notifyOnLowStock', v)}
          />
        </Section>

        {/* ── Notification Channel Settings ───────────────────────── */}
        <Section
          title="🔔 Notification Channels"
          subtitle="Choose how you want to receive alerts."
        >
          <Toggle
            label="In-App Notifications"
            description="Show alerts inside the application (bell icon in the top bar)."
            checked={settings.inAppNotifications}
            onChange={(v) => update('inAppNotifications', v)}
          />
          <Toggle
            label="Email Notifications"
            description="Send alert emails via the configured SMTP server (Mailtrap / MailHog)."
            checked={settings.emailNotifications}
            onChange={(v) => update('emailNotifications', v)}
          />
        </Section>

        {/* ── Footer Actions ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={handleSave}
            style={saveBtnStyle}
          >
            {saved ? '✓ Saved!' : 'Save All Settings'}
          </button>
          <button
            onClick={handleReset}
            style={resetBtnStyle}
          >
            Reset to Defaults
          </button>
        </div>

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
const numberInputStyle = {
  width: '72px',
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid var(--color-border, #d1d5db)',
  fontSize: '0.88rem',
  textAlign: 'center',
  background: 'var(--color-background, #f9fafb)',
  color: 'var(--color-text-primary, #111)',
  outline: 'none',
};
const saveBtnStyle = {
  padding: '10px 24px',
  background: 'var(--color-primary, #8b5cf6)',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '0.88rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
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
const resetBtnStyle = {
  padding: '10px 24px',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border, #d1d5db)',
  borderRadius: '10px',
  fontWeight: 500,
  fontSize: '0.88rem',
  cursor: 'pointer',
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
