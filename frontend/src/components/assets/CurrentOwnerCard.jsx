import React from 'react';

const CurrentOwnerCard = ({ currentAllocation, canAssign, onReturn, asset }) => {
  return (
    <div className="ad-section-card">
      <h2 className="ad-section-title">Current Assignment</h2>
      {currentAllocation ? (
        <div className="ad-owner-card">
          <div className="ad-owner-avatar">
            {(currentAllocation.assignedTo?.fullName || currentAllocation.assignedTo?.email || 'U')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <strong className="ad-owner-name">
              {currentAllocation.assignedTo?.fullName || currentAllocation.assignedTo?.email || 'Unknown User'}
            </strong>
            {currentAllocation.assignedTo?.email && currentAllocation.assignedTo?.fullName && (
              <p className="ad-owner-email">{currentAllocation.assignedTo.email}</p>
            )}
            <p className="ad-owner-since">
              Assigned{' '}
              {currentAllocation.assignedAt
                ? new Date(currentAllocation.assignedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })
                : '—'}
            </p>
            {canAssign && (
              <button 
                className="btn-cancel" 
                style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fecaca' }} 
                onClick={onReturn}
              >
                Return Asset
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="ad-unassigned">
          <span className="ad-unassigned-marker" aria-hidden />
          <p>This asset is not currently assigned to anyone.</p>
          {asset.status === 'AVAILABLE' && (
            <span className="ad-available-label">Available for assignment</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentOwnerCard;
