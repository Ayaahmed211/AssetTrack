import React from 'react';

const ActionMenu = ({ asset, canAssign, onAssign, onReturn }) => {
  if (!canAssign) return null;

  return (
    <div className="ad-action-menu" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
      {asset.status === 'AVAILABLE' && (
        <button className="btn-assign" onClick={onAssign}>
          Assign to User
        </button>
      )}
      {asset.status === 'ASSIGNED' && (
        <button className="btn-cancel" style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={onReturn}>
          Return Asset
        </button>
      )}
    </div>
  );
};

export default ActionMenu;
