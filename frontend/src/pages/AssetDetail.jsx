import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import assetService from '../services/assetService';
import userService from '../services/userService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssetHeader from '../components/assets/AssetHeader';
import InfoGrid from '../components/assets/InfoGrid';
import CurrentOwnerCard from '../components/assets/CurrentOwnerCard';
import AllocationHistoryTable from '../components/assets/AllocationHistoryTable';
import WarrantyAlert from '../components/assets/WarrantyAlert';
import ActionMenu from '../components/assets/ActionMenu';
import ConditionReportForm from '../components/assets/ConditionReportForm';
import ModalShell from '../components/ui/ModalShell';
import './AssetDetail.css';

// ── Helper maps ────────────────────────────────────────────────────────────
const CONDITION_COLORS = {
  GOOD:         { bg: '#ecfdf3', color: '#166534', border: '#bbf7d0' },
  FAIR:         { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  DAMAGED:      { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  UNDER_REPAIR: { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' },
};

// ── Sub-components (Local) ──────────────────────────────────────────────────

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
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const canAssign = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDelete = user?.role === 'ADMIN';
  const assetListPath = user?.role === 'DEVELOPER' ? '/my-assets' : '/assets';

  const fetchAll = async () => {
    try {
      setLoading(true);
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
        {user?.role === 'DEVELOPER' ? (
          <button type="button" className="ad-back-nav-btn" onClick={() => navigate(assetListPath)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to My Assets
          </button>
        ) : (
          <button type="button" className="ad-back-btn" onClick={() => navigate(assetListPath)}>
            ← Back to Assets
          </button>
        )}
      </div>
    );
  }

  if (!asset) return null;

  const currentAllocation = asset.status === 'ASSIGNED' ? history[0] : null;

  const handleConfirmDelete = async () => {
    try {
      setDeleteSubmitting(true);
      await assetService.deleteAsset(asset.id);
      setIsDeleteModalOpen(false);
      navigate('/assets');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Could not delete this asset.';
      alert(typeof msg === 'string' ? msg : 'Could not delete this asset.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="ad-page">
      {user?.role === 'DEVELOPER' ? (
        <button type="button" id="back-to-assets" className="ad-back-nav-btn" onClick={() => navigate(assetListPath)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to My Assets
        </button>
      ) : (
        <button type="button" id="back-to-assets" className="ad-breadcrumb-btn" onClick={() => navigate(assetListPath)}>
          ← All Assets
        </button>
      )}

      <AssetHeader asset={asset} />

      <WarrantyAlert
        warrantyStatus={asset.warrantyStatus}
        daysUntilWarrantyExpiry={asset.daysUntilWarrantyExpiry}
      />

      <ActionMenu 
        asset={asset} 
        canAssign={canAssign}
        onAssign={() => setIsAssignModalOpen(true)}
        onReturn={() => setIsReturnModalOpen(true)}
      />

      <button 
        className="btn-assign" 
        style={{ marginBottom: '1.5rem', background: 'var(--color-warning)', border: 'none' }}
        onClick={() => setIsReportModalOpen(true)}
      >
        📢 Report Condition
      </button>

      <div className="ad-main-grid">
        <InfoGrid asset={asset} />
        <CurrentOwnerCard 
          currentAllocation={currentAllocation}
          canAssign={canAssign}
          asset={asset}
          onReturn={() => setIsReturnModalOpen(true)}
        />
      </div>

      <div className="ad-section-card">
        <h2 className="ad-section-title">
          Allocation History
          <span className="ad-section-count">{history.length}</span>
        </h2>
        <AllocationHistoryTable history={history} asset={asset} />
      </div>

      <div className="ad-section-card">
        <h2 className="ad-section-title">
          Condition Reports
          <span className="ad-section-count">{reports.length}</span>
        </h2>
        <ConditionReportsList reports={reports} />
      </div>

      {canDelete && (
        <div className="ad-delete-admin">
          <button
            type="button"
            className="ad-delete-trigger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Delete asset
          </button>
          <p className="ad-delete-hint">Permanently removes this record, allocation history, and condition reports. This cannot be undone.</p>
        </div>
      )}

      <AssignModal 
        asset={asset}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignSuccess={() => {
          setIsAssignModalOpen(false);
          fetchAll();
        }}
      />

      <ReturnModal 
        asset={asset}
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onReturnSuccess={() => {
          setIsReturnModalOpen(false);
          fetchAll();
        }}
      />

      <ModalShell
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteSubmitting && setIsDeleteModalOpen(false)}
        title="Delete this asset?"
        maxWidth="420px"
      >
        <p className="ad-delete-modal-lead">
          <strong>{asset.brand} {asset.model}</strong>
          <span className="ad-delete-modal-sn"> · {asset.serialNumber}</span>
        </p>
        <p className="ad-delete-modal-copy">
          This will permanently delete the asset, its allocation history, and its condition reports from the system.
        </p>
        <div className="ad-delete-modal-actions">
          <button
            type="button"
            className="ad-delete-modal-cancel"
            disabled={deleteSubmitting}
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ad-delete-modal-confirm"
            disabled={deleteSubmitting}
            onClick={handleConfirmDelete}
          >
            {deleteSubmitting ? 'Deleting…' : 'Delete permanently'}
          </button>
        </div>
      </ModalShell>

      {/* ── Report Modal ── */}
      {isReportModalOpen && (
        <div className="assign-modal-overlay" onClick={() => setIsReportModalOpen(false)}>
          <ConditionReportForm 
            asset={asset}
            onSubmit={async (formData) => {
              try {
                await assetService.createConditionReport({
                  assetId: asset.id,
                  conditionStatus: formData.conditionStatus,
                  description: formData.description
                });
                setIsReportModalOpen(false);
                fetchAll();
              } catch (err) {
                alert('Failed to submit report');
              }
            }}
            onCancel={() => setIsReportModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
