const EmailPreferences = ({ preferences, onChange }) => {
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
      <h3 style={{ margin: '0 0 0.55rem 0', fontSize: '0.95rem', color: '#0f172a' }}>Email Preferences</h3>
      <p style={{ margin: '0 0 0.8rem 0', color: '#64748b', fontSize: '0.8rem' }}>
        UI-level email preference toggles for this frontend session.
      </p>
      <div style={rowStyle}>
        <span style={{ color: '#334155', fontSize: '0.86rem' }}>Warranty Expiry Emails</span>
        <input type="checkbox" checked={preferences.warrantyEmail} onChange={(e) => onChange('warrantyEmail', e.target.checked)} />
      </div>
      <div style={rowStyle}>
        <span style={{ color: '#334155', fontSize: '0.86rem' }}>Low Stock Emails</span>
        <input type="checkbox" checked={preferences.lowStockEmail} onChange={(e) => onChange('lowStockEmail', e.target.checked)} />
      </div>
      <div style={rowStyle}>
        <span style={{ color: '#334155', fontSize: '0.86rem' }}>Condition Report Emails</span>
        <input
          type="checkbox"
          checked={preferences.conditionEmail}
          onChange={(e) => onChange('conditionEmail', e.target.checked)}
        />
      </div>
    </section>
  );
};

export default EmailPreferences;
