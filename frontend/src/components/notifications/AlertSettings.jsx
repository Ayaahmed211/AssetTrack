const AlertSettings = ({ settings, onChange }) => {
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    borderRadius: '10px',
    padding: '0.55rem 0.7rem',
    marginBottom: '0.45rem',
    background: '#fff',
  };

  return (
    <section
      style={{
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: '12px',
        padding: '0.85rem',
        background: '#f8fafc',
      }}
    >
      <h3 style={{ margin: '0 0 0.55rem 0', fontSize: '0.95rem', color: '#0f172a' }}>Alert Settings</h3>
      <p style={{ margin: '0 0 0.8rem 0', color: '#64748b', fontSize: '0.8rem' }}>
        UI-level notification preferences (saved locally in your browser).
      </p>
      <div style={rowStyle}>
        <span style={{ color: '#334155', fontSize: '0.86rem' }}>Warranty Alerts</span>
        <input type="checkbox" checked={settings.warranty} onChange={(e) => onChange('warranty', e.target.checked)} />
      </div>
      <div style={rowStyle}>
        <span style={{ color: '#334155', fontSize: '0.86rem' }}>Condition Reports</span>
        <input type="checkbox" checked={settings.condition} onChange={(e) => onChange('condition', e.target.checked)} />
      </div>
      <div style={rowStyle}>
        <span style={{ color: '#334155', fontSize: '0.86rem' }}>Assignment Updates</span>
        <input type="checkbox" checked={settings.assignment} onChange={(e) => onChange('assignment', e.target.checked)} />
      </div>
    </section>
  );
};

export default AlertSettings;
