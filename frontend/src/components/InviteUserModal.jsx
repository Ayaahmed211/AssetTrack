import React, { useState } from 'react';

const InviteUserModal = ({ isOpen, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', requestedRole: 'DEVELOPER'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite(formData);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1f2937', padding: '2rem', borderRadius: '0.75rem',
        width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'white' }}>Invite New User</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
            }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
            }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
            }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Role</label>
            <select name="requestedRole" value={formData.requestedRole} onChange={handleChange} style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'transparent',
              color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#6366f1',
              color: 'white', border: 'none', cursor: 'pointer'
            }}>Send Invite</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
