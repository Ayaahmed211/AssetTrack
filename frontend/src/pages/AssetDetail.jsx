import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import assetService from '../services/assetService';
import userService from '../services/userService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import AssetTypeChip from '../components/ui/AssetTypeChip';
import './AssetDetail.css';

// ── Helper maps ────────────────────────────────────────────────────────────
const STATUS_VARIANT = {
  AVAILABLE: 'success',
  ASSIGNED: 'info',
  UNDER_MAINTENANCE: 'warning',
  DECOMMISSIONED: 'danger',
};

const WARRANTY_VARIANT = {
  VALID: 'success',
  EXPIRING_SOON: 'warning',
  EXPIRED: 'danger',
};

const CONDITION_COLORS = {
  GOOD:         { bg: '#ecfdf3', color: '#166534', border: '#bbf7d0' },
  FAIR:         { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  DAMAGED:      { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  UNDER_REPAIR: { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' },
};

// ── Sub-components ─────────────────────────────────────────────────────────

const InfoRow = ({ label, value, children }) => (
  <div className="ad-info-row">
    <span className="ad-info-label">{label}</span>
    <span className="ad-info-value">{children ?? value ?? '—'}</span>
  </div>
);

const WarrantyAlert = ({ warrantyStatus, daysUntilWarrantyExpiry }) => {
  if (warrantyStatus === 'VALID') return null;

  const isExpired = warrantyStatus === 'EXPIRED';
  const days = Math.abs(daysUntilWarrantyExpiry);

  return (
    <div className={`ad-warranty-alert ${isExpired ? 'ad-alert-danger' : 'ad-alert-warning'}`}>
      <span className={`ad-alert-marker ${isExpired ? 'ad-alert-marker--danger' : 'ad-alert-marker--warn'}`} aria-hidden />
      <div>
        <strong>{isExpired ? 'Warranty Expired' : 'Warranty Expiring Soon'}</strong>
        <p>
          {isExpired
            ? `This asset's warranty expired ${days} day${days !== 1 ? 's' : ''} ago.`
            : `Warranty expires in ${days} day${days !== 1 ? 's' : ''}.`}
        </p>
      </div>
    </div>
  );
};

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
                  <strong>{h.user?.fullName || h.user?.email || '—'}</strong>
                  {h.user?.email && h.user?.fullName && (
                    <p className="ad-sub-text">{h.user.email}</p>
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

const ConditionReportsList = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="ad-empty-section">
        <span className="ad-empty-marker ad-empty-marker--success" aria-hidden />
        <p>No condition reports filed for this asset.</p>
      </div>
    );
  }

  return (
    <div className="ad-reports-list">
      {reports.map((r) => {
        const colors = CONDITION_COLORS[r.conditionStatus] || CONDITION_COLORS.GOOD;
        return (
          <div key={r.id} className="ad-report-card" style={{ borderLeftColor: colors.color }}>
            <div className="ad-report-header">
              <span
                className="ad-condition-badge"
                style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}
              >
                {r.conditionStatus}
              </span>
              <span className="ad-report-date">
                {r.reportedAt
                  ? new Date(r.reportedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '—'}
              </span>
            </div>
            {r.description && (
              <p className="ad-report-description">{r.description}</p>
            )}
            {r.reportedBy && (
              <p className="ad-report-by">
                Reported by: <strong>{r.reportedBy.fullName || r.reportedBy.email}</strong>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AssignModal = ({ asset, isOpen, onClose, onAssignSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      userService.getAllUsers()
        .then(data => setUsers(data.filter(u => u.enabled)))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setLoading(true);
      await assetService.assignAsset({
        assetId: asset.id,
        assignedToUserId: selectedUser,
        notes: notes
      });
      onAssignSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data || 'Failed to assign asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-modal-overlay" onClick={onClose}>
      <div className="assign-modal" onClick={e => e.stopPropagation()}>
        <h3>Assign Asset: {asset.brand} {asset.model}</h3>
        <form onSubmit={handleSubmit}>
          <div className="assign-modal-body">
            <div className="form-group">
              <label>Select User</label>
              <select 
                className="form-select"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                required
              >
                <option value="">-- Choose User --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName || u.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea 
                className="form-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Reason for assignment..."
              />
            </div>
          </div>
          <div className="assign-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-assign" disabled={loading || !selectedUser}>
              {loading ? 'Assigning...' : 'Assign Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReturnModal = ({ asset, isOpen, onClose, onReturnSuccess }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await assetService.returnAsset({
        assetId: asset.id,
        notes: notes
      });
      onReturnSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data || 'Failed to return asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-modal-overlay" onClick={onClose}>
      <div className="assign-modal" onClick={e => e.stopPropagation()}>
        <h3>Return Asset: {asset.brand} {asset.model}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          This will unassign the asset and make it AVAILABLE in the pool again.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="assign-modal-body">
            <div className="form-group">
              <label>Return Notes (Optional)</label>
              <textarea 
                className="form-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Condition on return, missing parts, etc..."
              />
            </div>
          </div>
          <div className="assign-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-assign" disabled={loading} style={{ background: '#ef4444' }}>
              {loading ? 'Returning...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Page Component ─────────────────────────────────────────────────────────

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const canAssign = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchAll = async () => {
    try {
      setLoading(true);

      // Fetch asset + history + condition reports in parallel
      const [assetData, historyData, reportsData] = await Promise.all([
        assetService.getAssetById(id),
        api.get(`/allocations/history/asset/${id}`).then(r => r.data).catch(() => []),
        assetService.getReportsByAsset(id).catch(() => []),
      ]);

      setAsset(assetData);
      setHistory(historyData);
      setReports(reportsData);
    } catch (err) {
      console.error('AssetDetail: failed to fetch', err);
      setError(
        err.response?.status === 404
          ? 'Asset not found. It may have been deleted.'
          : 'Failed to load asset details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  // ── Render states
  if (loading) {
    return (
      <div className="ad-loading">
        <div className="ad-spinner" />
        <p>Loading asset details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-error">
        <div className="ad-error-icon" aria-hidden />
        <p>{error}</p>
        <button className="ad-back-btn" onClick={() => navigate('/assets')}>
          ← Back to Assets
        </button>
      </div>
    );
  }

  if (!asset) return null;

  // Only show a current owner if the asset is currently ASSIGNED
  const currentAllocation = asset.status === 'ASSIGNED' ? history[0] : null;

  return (
    <div className="ad-page">
      {/* ── Back link ── */}
      <button id="back-to-assets" className="ad-breadcrumb-btn" onClick={() => navigate('/assets')}>
        ← All Assets
      </button>

      {/* ── Asset Header Card ── */}
      <div className="ad-header-card">
        <div className="ad-header-left">
          <div className="ad-type-badge">
            <AssetTypeChip type={asset.type} size="md" />
          </div>
          <div>
            <h1 className="ad-asset-title">{asset.brand} {asset.model}</h1>
            <div className="ad-asset-meta">
              <span className="ad-serial-number">SN: {asset.serialNumber}</span>
              <span className="ad-type-label">{asset.type}</span>
            </div>
          </div>
        </div>
        <div className="ad-header-badges">
          <StatusBadge
            status={asset.status?.replace('_', ' ')}
            variant={STATUS_VARIANT[asset.status] || 'default'}
          />
          <StatusBadge
            status={`Warranty: ${asset.warrantyStatus}`}
            variant={WARRANTY_VARIANT[asset.warrantyStatus] || 'default'}
          />
        </div>
      </div>

      {/* ── Warranty Alert ── */}
      {(asset.warrantyStatus === 'EXPIRING_SOON' || asset.warrantyStatus === 'EXPIRED') && (
        <WarrantyAlert
          warrantyStatus={asset.warrantyStatus}
          daysUntilWarrantyExpiry={asset.daysUntilWarrantyExpiry}
        />
      )}

      {/* ── Main Grid ── */}
      <div className="ad-main-grid">

        {/* ── Info Grid (left column) ── */}
        <div className="ad-section-card">
          <h2 className="ad-section-title">Asset Information</h2>
          <div className="ad-info-grid">
            <InfoRow label="Brand" value={asset.brand} />
            <InfoRow label="Model" value={asset.model} />
            <InfoRow label="Type" value={asset.type} />
            <InfoRow label="Serial Number">
              <code className="ad-code">{asset.serialNumber}</code>
            </InfoRow>
            <InfoRow label="Status">
              <StatusBadge
                status={asset.status?.replace('_', ' ')}
                variant={STATUS_VARIANT[asset.status] || 'default'}
                size="small"
              />
            </InfoRow>
            <InfoRow
              label="Purchase Date"
              value={
                asset.purchaseDate
                  ? new Date(asset.purchaseDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—'
              }
            />
            <InfoRow
              label="Warranty Expires"
              value={
                asset.warrantyExpirationDate
                  ? new Date(asset.warrantyExpirationDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—'
              }
            />
            <InfoRow label="Warranty Status">
              <StatusBadge
                status={asset.warrantyStatus}
                variant={WARRANTY_VARIANT[asset.warrantyStatus] || 'default'}
                size="small"
              />
            </InfoRow>
            {asset.notes && (
              <div className="ad-notes-block">
                <span className="ad-info-label">Notes</span>
                <p className="ad-notes-text">{asset.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Current Owner (right column) ── */}
        <div className="ad-section-card">
          <h2 className="ad-section-title">Current Assignment</h2>
          {currentAllocation ? (
            <div className="ad-owner-card">
              <div className="ad-owner-avatar">
                {(currentAllocation.user?.fullName || currentAllocation.user?.email || 'U')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <strong className="ad-owner-name">
                  {currentAllocation.user?.fullName || currentAllocation.user?.email || 'Unknown User'}
                </strong>
                {currentAllocation.user?.email && currentAllocation.user?.fullName && (
                  <p className="ad-owner-email">{currentAllocation.user.email}</p>
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
                    onClick={() => setIsReturnModalOpen(true)}
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
              {asset.status === 'AVAILABLE' && canAssign && (
                 <button className="btn-assign" style={{marginTop: '1.5rem'}} onClick={() => setIsAssignModalOpen(true)}>
                    Assign to User
                 </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Allocation History ── */}
      <div className="ad-section-card">
        <h2 className="ad-section-title">
          Allocation History
          <span className="ad-section-count">{history.length}</span>
        </h2>
        <AllocationHistoryTable history={history} asset={asset} />
      </div>

      {/* ── Condition Reports ── */}
      <div className="ad-section-card">
        <h2 className="ad-section-title">
          Condition Reports
          <span className="ad-section-count">{reports.length}</span>
        </h2>
        <ConditionReportsList reports={reports} />
      </div>

      {/* ── Assign Modal ── */}
      <AssignModal 
        asset={asset}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignSuccess={() => {
          setIsAssignModalOpen(false);
          fetchAll();
        }}
      />

      {/* ── Return Modal ── */}
      <ReturnModal 
        asset={asset}
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onReturnSuccess={() => {
          setIsReturnModalOpen(false);
          fetchAll();
        }}
      />
    </div>
  );
};

export default AssetDetail;
