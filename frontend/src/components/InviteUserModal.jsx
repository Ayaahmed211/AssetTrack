import React, { useState } from 'react';
import ModalShell from './ui/ModalShell';

const InviteUserModal = ({ isOpen, onClose, onInvite }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', requestedRole: 'DEVELOPER'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onInvite(formData);
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Invite New User" maxWidth="400px">
      <form onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <label>Full Name</label>
          <input 
            required 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="modal-input" 
          />
        </div>
        <div className="modal-form-group">
          <label>Email</label>
          <input 
            required 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className="modal-input" 
          />
        </div>
        <div className="modal-form-group">
          <label>Password</label>
          <input 
            required 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            className="modal-input" 
          />
        </div>
        <div className="modal-form-group">
          <label>Role</label>
          <select 
            name="requestedRole" 
            value={formData.requestedRole} 
            onChange={handleChange} 
            className="modal-select"
          >
            <option value="DEVELOPER">DEVELOPER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="modal-btn-cancel">
            Cancel
          </button>
          <button type="submit" className="modal-btn-submit">
            Send Invite
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default InviteUserModal;
