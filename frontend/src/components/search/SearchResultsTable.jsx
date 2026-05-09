import StatusBadge from '../ui/StatusBadge';

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

const SearchResultsTable = ({ assets, onViewAsset }) => {
  if (!assets.length) {
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.03)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          color: '#475569',
        }}
      >
        No assets match your current filters.
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['Asset', 'Type', 'Serial', 'Status', 'Warranty', 'Purchase', ''].map((h) => (
              <th
                key={h || 'actions'}
                style={{
                  textAlign: 'left',
                  padding: '0.65rem 0.8rem',
                  fontSize: '0.72rem',
                  color: '#475569',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
              <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600 }}>
                {asset.brand} {asset.model}
              </td>
              <td style={{ padding: '0.65rem 0.8rem' }}>{asset.type}</td>
              <td style={{ padding: '0.65rem 0.8rem' }}>{asset.serialNumber}</td>
              <td style={{ padding: '0.65rem 0.8rem' }}>
                <StatusBadge
                  status={asset.status?.replace('_', ' ')}
                  variant={STATUS_VARIANT[asset.status] || 'default'}
                  size="small"
                />
              </td>
              <td style={{ padding: '0.65rem 0.8rem' }}>
                <StatusBadge
                  status={asset.warrantyStatus}
                  variant={WARRANTY_VARIANT[asset.warrantyStatus] || 'default'}
                  size="small"
                />
              </td>
              <td style={{ padding: '0.65rem 0.8rem' }}>
                {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}
              </td>
              <td style={{ padding: '0.65rem 0.8rem' }}>
                <button
                  onClick={() => onViewAsset(asset.id)}
                  style={{
                    border: '1px solid rgba(79, 70, 229, 0.3)',
                    background: 'rgba(79, 70, 229, 0.08)',
                    color: '#4f46e5',
                    borderRadius: '8px',
                    padding: '0.35rem 0.6rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SearchResultsTable;
