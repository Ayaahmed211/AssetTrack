import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import assetService from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import './AssetList.css';

// ── Helper maps ────────────────────────────────────────────────────────────
const TYPE_ICONS = { LAPTOP: '💻', MONITOR: '🖥️', ACCESSORY: '🔌' };

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

// ── Sub-components ─────────────────────────────────────────────────────────

const SearchInput = ({ value, onChange }) => (
  <div className="al-search-wrapper">
    <span className="al-search-icon">🔍</span>
    <input
      id="asset-search"
      type="text"
      className="al-search-input"
      placeholder="Search by brand, model or serial…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button className="al-search-clear" onClick={() => onChange('')} title="Clear">
        ✕
      </button>
    )}
  </div>
);

const FilterBar = ({ typeFilter, statusFilter, onTypeChange, onStatusChange, onReset }) => (
  <div className="al-filter-bar">
    <div className="al-filter-group">
      <label htmlFor="filter-type" className="al-filter-label">Type</label>
      <select
        id="filter-type"
        className="al-filter-select"
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="">All Types</option>
        <option value="LAPTOP">💻 Laptop</option>
        <option value="MONITOR">🖥️ Monitor</option>
        <option value="ACCESSORY">🔌 Accessory</option>
      </select>
    </div>

    <div className="al-filter-group">
      <label htmlFor="filter-status" className="al-filter-label">Status</label>
      <select
        id="filter-status"
        className="al-filter-select"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="AVAILABLE">Available</option>
        <option value="ASSIGNED">Assigned</option>
        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
        <option value="DECOMMISSIONED">Decommissioned</option>
      </select>
    </div>

    {(typeFilter || statusFilter) && (
      <button className="al-filter-reset" onClick={onReset}>
        ✕ Reset Filters
      </button>
    )}
  </div>
);

const AssetTable = ({ assets, onViewDetail }) => {
  if (assets.length === 0) {
    return (
      <div className="al-empty">
        <div className="al-empty-icon">📦</div>
        <h3>No assets found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="al-table-wrapper">
      <table className="al-table" role="table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Type</th>
            <th>Serial Number</th>
            <th>Status</th>
            <th>Warranty</th>
            <th>Purchase Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="al-table-row"
              onClick={() => onViewDetail(asset.id)}
              title="Click to view details"
            >
              <td>
                <div className="al-asset-name-cell">
                  <span className="al-type-icon">
                    {TYPE_ICONS[asset.type] || '📦'}
                  </span>
                  <div>
                    <strong>{asset.brand} {asset.model}</strong>
                  </div>
                </div>
              </td>
              <td>
                <span className="al-type-pill">{asset.type}</span>
              </td>
              <td className="al-serial">{asset.serialNumber}</td>
              <td>
                <StatusBadge
                  status={asset.status?.replace('_', ' ')}
                  variant={STATUS_VARIANT[asset.status] || 'default'}
                  size="small"
                />
              </td>
              <td>
                <StatusBadge
                  status={asset.warrantyStatus}
                  variant={WARRANTY_VARIANT[asset.warrantyStatus] || 'default'}
                  size="small"
                />
              </td>
              <td className="al-date">
                {asset.purchaseDate
                  ? new Date(asset.purchaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </td>
              <td>
                <button
                  id={`view-asset-${asset.id}`}
                  className="al-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail(asset.id);
                  }}
                >
                  View →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CreateAssetModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'LAPTOP',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpirationDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await assetService.createAsset(formData);
      onSuccess();
      onClose();
      // Reset form on success
      setFormData({
        type: 'LAPTOP', brand: '', model: '', serialNumber: '',
        purchaseDate: '', warrantyExpirationDate: '', notes: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <h3>Add New Asset</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Asset Type</label>
              <select name="type" className="form-select" value={formData.type} onChange={handleChange} required>
                <option value="LAPTOP">Laptop</option>
                <option value="MONITOR">Monitor</option>
                <option value="ACCESSORY">Accessory</option>
              </select>
            </div>
            <div className="form-group">
              <label>Serial Number</label>
              <input type="text" name="serialNumber" className="form-input" value={formData.serialNumber} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input type="text" name="brand" className="form-input" value={formData.brand} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input type="text" name="model" className="form-input" value={formData.model} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" name="purchaseDate" className="form-input" value={formData.purchaseDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Warranty Expiry</label>
              <input type="date" name="warrantyExpirationDate" className="form-input" value={formData.warrantyExpirationDate} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea name="notes" className="form-textarea" value={formData.notes} onChange={handleChange} placeholder="Any additional details..." />
          </div>
          <div className="create-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Page Component ─────────────────────────────────────────────────────────

const AssetList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter / search state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // ── Fetch all assets
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAllAssets();
      setAssets(data);
    } catch (err) {
      console.error('AssetList: failed to fetch', err);
      setError('Failed to load assets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // ── Client-side filtering (fast, no extra API calls)
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter((a) => {
      const matchesSearch =
        !q ||
        a.brand?.toLowerCase().includes(q) ||
        a.model?.toLowerCase().includes(q) ||
        a.serialNumber?.toLowerCase().includes(q);

      const matchesType = !typeFilter || a.type === typeFilter;
      const matchesStatus = !statusFilter || a.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, search, typeFilter, statusFilter]);

  // ── Summary counts for the header cards
  const summary = useMemo(() => ({
    total: assets.length,
    available: assets.filter((a) => a.status === 'AVAILABLE').length,
    assigned: assets.filter((a) => a.status === 'ASSIGNED').length,
    maintenance: assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length,
  }), [assets]);

  // ── Handlers
  const handleViewDetail = (id) => navigate(`/assets/${id}`);
  const handleResetFilters = () => { setTypeFilter(''); setStatusFilter(''); };

  // ── Render
  if (loading) {
    return (
      <div className="al-loading">
        <div className="al-spinner" />
        <p>Loading assets…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="al-error">
        <div className="al-error-icon">⚠️</div>
        <p>{error}</p>
        <button className="al-retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="al-page">
      <div className="al-header-row">
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Asset Inventory</h2>
        {canManage && (
          <button className="btn-submit" onClick={() => setIsCreateModalOpen(true)}>
            + Add New Asset
          </button>
        )}
      </div>

      {/* ── Summary Cards ── */}
      <div className="al-summary-grid">
        <div className="al-summary-card al-card-total">
          <span className="al-summary-value">{summary.total}</span>
          <span className="al-summary-label">Total Assets</span>
        </div>
        <div className="al-summary-card al-card-available">
          <span className="al-summary-value">{summary.available}</span>
          <span className="al-summary-label">Available</span>
        </div>
        <div className="al-summary-card al-card-assigned">
          <span className="al-summary-value">{summary.assigned}</span>
          <span className="al-summary-label">Assigned</span>
        </div>
        <div className="al-summary-card al-card-maintenance">
          <span className="al-summary-value">{summary.maintenance}</span>
          <span className="al-summary-label">Maintenance</span>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="al-toolbar">
        <SearchInput value={search} onChange={setSearch} />
        <FilterBar
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onReset={handleResetFilters}
        />
      </div>

      {/* ── Results header ── */}
      <div className="al-results-header">
        <span className="al-results-count">
          {filtered.length} asset{filtered.length !== 1 ? 's' : ''}
          {(search || typeFilter || statusFilter) && ' (filtered)'}
        </span>
      </div>

      {/* ── Table ── */}
      <AssetTable assets={filtered} onViewDetail={handleViewDetail} />

      {/* ── Create Asset Modal ── */}
      <CreateAssetModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchAssets} 
      />
    </div>
  );
};

export default AssetList;
