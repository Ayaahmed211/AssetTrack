import { useState, useEffect } from 'react';
import userService from '../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRole = async (userId) => {
    try {
      setActionLoading(userId);
      const updatedUser = await userService.approveRole(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      alert('Failed to approve role. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading(userId);
      const updatedUser = await userService.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      alert('Failed to toggle user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'PENDING') return user.requestedRole != null;
    if (filter === 'ALL') return true;
    return user.role === filter;
  });

  const pendingCount = users.filter(u => u.requestedRole != null).length;

  const getRoleBadgeStyle = (role) => {
    const styles = {
      ADMIN: { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' },
      MANAGER: { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' },
      DEVELOPER: { background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' },
    };
    return styles[role] || styles.DEVELOPER;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⟳</div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{
          textAlign: 'center', padding: '2rem', background: 'rgba(239,68,68,0.1)',
          borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.2)', maxWidth: '400px'
        }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          <button onClick={fetchUsers} style={{
            padding: '0.5rem 1.5rem', background: '#ef4444', color: 'white',
            border: 'none', borderRadius: '0.5rem', cursor: 'pointer'
          }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            User Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {users.length} total users • {pendingCount} pending approval{pendingCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Pending Approvals Banner */}
      {pendingCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
          border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.75rem',
          padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <p style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
              {pendingCount} user{pendingCount !== 1 ? 's' : ''} waiting for Manager approval
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
              Review and approve or reject their requests below.
            </p>
          </div>
          <button
            onClick={() => setFilter('PENDING')}
            style={{
              marginLeft: 'auto', padding: '0.4rem 1rem',
              background: '#f59e0b', color: '#000', fontWeight: 600,
              border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem'
            }}
          >
            View Pending
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'ADMIN', 'MANAGER', 'DEVELOPER'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '0.5rem', border: 'none',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
              background: filter === f ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#818cf8' : 'var(--text-secondary)',
              outline: filter === f ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {f === 'PENDING' ? `Pending (${pendingCount})` : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem',
        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                  fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No users found for this filter.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s',
                  background: user.requestedRole ? 'rgba(245,158,11,0.04)' : 'transparent'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = user.requestedRole ? 'rgba(245,158,11,0.04)' : 'transparent'}
                >
                  {/* Name */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
                      }}>
                        {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : '??'}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.fullName}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {user.email}
                  </td>

                  {/* Role */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        ...getRoleBadgeStyle(user.role),
                        padding: '0.2rem 0.6rem', borderRadius: '0.4rem',
                        fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {user.role}
                      </span>
                      {user.requestedRole && (
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '0.4rem',
                          fontSize: '0.7rem', fontWeight: 600,
                          background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                          border: '1px solid rgba(245,158,11,0.3)',
                          animation: 'pulse 2s infinite'
                        }}>
                          → {user.requestedRole}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: '0.4rem',
                      fontSize: '0.75rem', fontWeight: 600,
                      background: user.enabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: user.enabled ? '#22c55e' : '#ef4444',
                      border: `1px solid ${user.enabled ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
                    }}>
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {user.requestedRole && (
                        <button
                          onClick={() => handleApproveRole(user.id)}
                          disabled={actionLoading === user.id}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: '0.4rem',
                            border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            background: '#22c55e', color: 'white',
                            opacity: actionLoading === user.id ? 0.5 : 1
                          }}
                        >
                          {actionLoading === user.id ? '...' : '✓ Approve'}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={actionLoading === user.id}
                        style={{
                          padding: '0.35rem 0.75rem', borderRadius: '0.4rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
                          background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                          opacity: actionLoading === user.id ? 0.5 : 1
                        }}
                      >
                        {user.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Users;
