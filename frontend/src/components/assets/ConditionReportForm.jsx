import React, { useState } from 'react';

const CONDITION_COLORS = {
  GOOD:         { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  FAIR:         { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  DAMAGED:      { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  UNDER_REPAIR: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
};

const ConditionReportForm = ({ asset, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({ conditionStatus: 'GOOD', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const getStatusStyle = (status) => CONDITION_COLORS[status] || CONDITION_COLORS.GOOD;

  return (
    <div style={{
      background: 'var(--color-card)', borderRadius: '1rem', padding: '2rem',
      width: '100%', maxWidth: '480px', border: '1px solid var(--color-border)'
    }} onClick={e => e.stopPropagation()}>
      <h3 style={{ color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
        Report an Issue
      </h3>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0', fontSize: '0.85rem' }}>
        {asset.brand} {asset.model} — SN: {asset.serialNumber}
      </p>

      <form onSubmit={handleSubmit}>
        {/* Condition Status */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Condition
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {[
              { value: 'GOOD', label: 'Good', desc: 'Working as expected' },
              { value: 'FAIR', label: 'Fair', desc: 'Minor issues' },
              { value: 'DAMAGED', label: 'Damaged', desc: 'Needs attention' },
              { value: 'UNDER_REPAIR', label: 'Under repair', desc: 'Being fixed' },
            ].map(opt => (
              <label key={opt.value} style={{
                display: 'flex', flexDirection: 'column', padding: '0.65rem',
                border: `2px solid ${form.conditionStatus === opt.value ? getStatusStyle(opt.value).color : 'var(--color-border)'}`,
                borderRadius: '0.6rem', cursor: 'pointer', transition: 'all 0.2s',
                background: form.conditionStatus === opt.value ? getStatusStyle(opt.value).bg : 'var(--color-background)'
              }}>
                <input type="radio" name="conditionStatus" value={opt.value}
                  checked={form.conditionStatus === opt.value}
                  onChange={e => setForm(f => ({ ...f, conditionStatus: e.target.value }))}
                  style={{ display: 'none' }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{opt.label}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the issue (e.g., broken keyboard, battery draining fast...)"
            rows={4}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
              border: '1px solid var(--color-border)', background: 'var(--color-background)',
              color: 'var(--color-text-primary)', fontSize: '0.875rem', resize: 'vertical',
              fontFamily: 'inherit', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
              border: '1px solid var(--color-border)', background: 'var(--color-background)',
              color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem'
            }}
          >Cancel</button>
          <button type="submit" disabled={submitting}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '0.5rem', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              opacity: submitting ? 0.6 : 1
            }}
          >{submitting ? 'Submitting...' : 'Submit Report'}</button>
        </div>
      </form>
    </div>
  );
};

export default ConditionReportForm;
