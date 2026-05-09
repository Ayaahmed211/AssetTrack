import { useEffect, useMemo, useState } from 'react';
import AlertSettings from '../components/notifications/AlertSettings';
import EmailPreferences from '../components/notifications/EmailPreferences';
import NotificationList from '../components/notifications/NotificationList';
import notificationService from '../services/notificationService';

const ALERT_STORAGE_KEY = 'assettrack.alertSettings';
const EMAIL_STORAGE_KEY = 'assettrack.emailPreferences';

const defaultAlertSettings = {
  warranty: true,
  condition: true,
  assignment: true,
};

const defaultEmailPreferences = {
  warrantyEmail: true,
  lowStockEmail: true,
  conditionEmail: true,
};

const readFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertSettings, setAlertSettings] = useState(() => readFromStorage(ALERT_STORAGE_KEY, defaultAlertSettings));
  const [emailPreferences, setEmailPreferences] = useState(() =>
    readFromStorage(EMAIL_STORAGE_KEY, defaultEmailPreferences)
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.type === 'WARRANTY_EXPIRY' || n.type === 'WARRANTY_EXPIRED') return alertSettings.warranty;
      if (n.type === 'CONDITION_REPORT') return alertSettings.condition;
      if (n.type === 'ASSET_ASSIGNED') return alertSettings.assignment;
      return true;
    });
  }, [notifications, alertSettings]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alertSettings));
  }, [alertSettings]);

  useEffect(() => {
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emailPreferences));
  }, [emailPreferences]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)));
    } catch {
      setError('Failed to mark notification as read.');
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt || new Date().toISOString() })));
    } catch {
      setError('Failed to mark all notifications as read.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '0.9rem' }}>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.45rem' }}>Notifications</h2>
        <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          In-app alerts for warranty, assignments, and condition reports.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '0.9rem',
          alignItems: 'start',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ color: '#334155', fontSize: '0.85rem' }}>
              {unreadCount} unread • {filteredNotifications.length} shown
            </span>
            <button
              onClick={handleMarkAll}
              disabled={!notifications.length || unreadCount === 0}
              style={{
                border: '1px solid rgba(79, 70, 229, 0.35)',
                background: '#fff',
                color: '#4f46e5',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: !notifications.length || unreadCount === 0 ? 0.55 : 1,
              }}
            >
              Mark all as read
            </button>
          </div>
          {error && (
            <div
              style={{
                border: '1px solid rgba(239, 68, 68, 0.25)',
                background: 'rgba(239, 68, 68, 0.08)',
                borderRadius: '10px',
                padding: '0.7rem',
                color: '#b91c1c',
                marginBottom: '0.8rem',
              }}
            >
              {error}
            </div>
          )}
          <NotificationList notifications={filteredNotifications} onMarkRead={handleMarkRead} loading={loading} />
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <AlertSettings settings={alertSettings} onChange={(key, value) => setAlertSettings((prev) => ({ ...prev, [key]: value }))} />
          <EmailPreferences
            preferences={emailPreferences}
            onChange={(key, value) => setEmailPreferences((prev) => ({ ...prev, [key]: value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
