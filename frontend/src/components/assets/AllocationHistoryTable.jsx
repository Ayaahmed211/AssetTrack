import React from 'react';

const AllocationHistoryTable = ({ history, asset }) => {
  if (!history || history.length === 0) {
    return (
      <div className="ad-empty-section">
        <span className="ad-empty-marker ad-empty-marker--muted" aria-hidden />
        <p>No allocation history for this asset yet.</p>
      </div>
    );
  }

  return (
    <div className="ad-table-wrapper">
      <table className="ad-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Assigned At</th>
            <th>Returned At</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="ad-table-row">
              <td>
                <div>
                  <strong>{h.assignedTo?.fullName || h.assignedTo?.email || '—'}</strong>
                  {h.assignedTo?.email && h.assignedTo?.fullName && (
                    <p className="ad-sub-text">{h.assignedTo.email}</p>
                  )}
                </div>
              </td>
              <td>
                <span className={`ad-action-pill ${h.returnedAt ? 'ad-action-return' : 'ad-action-assign'}`}>
                  {h.returnedAt ? '↩ Returned' : '→ Assigned'}
                </span>
              </td>
              <td className="ad-date-cell">
                {h.assignedAt
                  ? new Date(h.assignedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : '—'}
              </td>
              <td className="ad-date-cell">
                {h.returnedAt
                  ? new Date(h.returnedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : (h.actionType !== 'RETURNED' && h === history[0] && asset.status === 'ASSIGNED')
                      ? <span className="ad-still-active">Still Active</span>
                      : '—'}
              </td>
              <td className="ad-notes-cell">{h.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationHistoryTable;
