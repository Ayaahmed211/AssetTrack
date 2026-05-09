import React from 'react';

const PermissionsMatrix = () => {
  const permissions = [
    { role: 'ADMIN', users: 'Full Access', assets: 'Full Access', reports: 'Full Access', settings: 'Full Access' },
    { role: 'MANAGER', users: 'View Only', assets: 'Create/Edit/View', reports: 'Full Access', settings: 'Update Profile' },
    { role: 'DEVELOPER', users: 'No Access', assets: 'My Assets Only', reports: 'No Access', settings: 'Update Profile' },
  ];

  return (
    <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
      <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', marginTop: 0 }}>Role Permissions Matrix</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>User Management</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Asset Management</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Reports</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Settings</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr key={p.role} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{p.role}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.users}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.assets}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.reports}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{p.settings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsMatrix;
