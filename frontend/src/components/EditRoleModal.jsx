import React, { useState, useEffect } from 'react';
import ModalShell from './ui/ModalShell';

const EditRoleModal = ({ user, isOpen, onClose, onSave }) => {
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, selectedRole);
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={`Edit Role for ${user.fullName}`} maxWidth="400px">
      <form onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <label>Role</label>
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
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
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default EditRoleModal;
