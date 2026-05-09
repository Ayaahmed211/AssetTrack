const typeLabel = (type) => {
  if (type === 'WARRANTY_EXPIRY') return 'Warranty Expiring';
  if (type === 'WARRANTY_EXPIRED') return 'Warranty Expired';
  if (type === 'ASSET_ASSIGNED') return 'Asset Assigned';
  if (type === 'CONDITION_REPORT') return 'Condition Report';
  return type || 'Notification';
};

const NotificationList = ({ notifications, onMarkRead, loading }) => {
  if (loading) {
    return <p style={{ color: '#475569' }}>Loading notifications...</p>;
  }

  if (!notifications.length) {
    return (
      <div
        style={{
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '12px',
          padding: '1.3rem',
          color: '#475569',
          background: '#f8fafc',
        }}
      >
        No notifications yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            border: `1px solid ${n.read ? 'rgba(15, 23, 42, 0.08)' : 'rgba(79, 70, 229, 0.25)'}`,
            borderRadius: '11px',
            padding: '0.85rem 0.9rem',
            background: n.read ? '#fff' : 'rgba(79, 70, 229, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                <strong style={{ color: '#0f172a' }}>{n.title}</strong>
                <span
                  style={{
                    fontSize: '0.7rem',
                    borderRadius: '999px',
                    padding: '0.15rem 0.5rem',
                    background: 'rgba(15, 23, 42, 0.08)',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  {typeLabel(n.type)}
                </span>
              </div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '0.9rem' }}>{n.message}</p>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Unknown date'}
              </span>
            </div>
            {!n.read && (
              <button
                onClick={() => onMarkRead(n.id)}
                style={{
                  border: '1px solid rgba(79, 70, 229, 0.4)',
                  background: '#fff',
                  color: '#4f46e5',
                  borderRadius: '8px',
                  padding: '0.32rem 0.55rem',
                  fontWeight: 600,
                  height: 'fit-content',
                  cursor: 'pointer',
                }}
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
