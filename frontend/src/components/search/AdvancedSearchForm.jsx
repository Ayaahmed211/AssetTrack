const TYPES = ['', 'LAPTOP', 'MONITOR', 'ACCESSORY'];
const STATUSES = ['', 'AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DECOMMISSIONED'];
const WARRANTY_STATUSES = ['', 'VALID', 'EXPIRING_SOON', 'EXPIRED'];

const fieldStyle = {
  width: '100%',
  border: '1px solid rgba(15, 23, 42, 0.12)',
  borderRadius: '10px',
  padding: '0.55rem 0.7rem',
  fontSize: '0.9rem',
  background: '#fff',
  color: '#0f172a',
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.35rem',
  fontSize: '0.75rem',
  letterSpacing: '0.03em',
  color: '#475569',
  textTransform: 'uppercase',
  fontWeight: 700,
};

const AdvancedSearchForm = ({ form, onChange, onSubmit, onReset, loading }) => {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: '#f8fafc',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: '14px',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '0.9rem',
        }}
      >
        <div>
          <label style={labelStyle}>Serial Number</label>
          <input
            value={form.serialNumber}
            onChange={(e) => onChange('serialNumber', e.target.value)}
            style={fieldStyle}
            placeholder="SN-001"
          />
        </div>
        <div>
          <label style={labelStyle}>Brand</label>
          <input
            value={form.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            style={fieldStyle}
            placeholder="Dell / HP / Lenovo"
          />
        </div>
        <div>
          <label style={labelStyle}>Model</label>
          <input
            value={form.model}
            onChange={(e) => onChange('model', e.target.value)}
            style={fieldStyle}
            placeholder="XPS / ThinkPad..."
          />
        </div>
        <div>
          <label style={labelStyle}>Assigned User ID</label>
          <input
            type="number"
            min="1"
            value={form.assignedUserId}
            onChange={(e) => onChange('assignedUserId', e.target.value)}
            style={fieldStyle}
            placeholder="e.g. 3"
          />
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select value={form.type} onChange={(e) => onChange('type', e.target.value)} style={fieldStyle}>
            {TYPES.map((v) => (
              <option key={v || 'all'} value={v}>
                {v || 'All Types'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={(e) => onChange('status', e.target.value)} style={fieldStyle}>
            {STATUSES.map((v) => (
              <option key={v || 'all'} value={v}>
                {v || 'All Statuses'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Warranty</label>
          <select
            value={form.warrantyStatus}
            onChange={(e) => onChange('warrantyStatus', e.target.value)}
            style={fieldStyle}
          >
            {WARRANTY_STATUSES.map((v) => (
              <option key={v || 'all'} value={v}>
                {v || 'All Warranty States'}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.55rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            border: 'none',
            background: '#4f46e5',
            color: '#fff',
            borderRadius: '9px',
            padding: '0.55rem 1rem',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Searching...' : 'Run Search'}
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            border: '1px solid rgba(15, 23, 42, 0.2)',
            background: '#fff',
            color: '#0f172a',
            borderRadius: '9px',
            padding: '0.55rem 1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default AdvancedSearchForm;
