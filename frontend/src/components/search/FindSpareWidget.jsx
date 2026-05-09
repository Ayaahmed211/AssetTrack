import { useState } from 'react';
import api from '../../services/api';
import assetService from '../../services/assetService';

const cardStyle = {
  border: '1px solid rgba(15, 23, 42, 0.08)',
  borderRadius: '12px',
  padding: '1rem',
  background: '#fff',
};

const FindSpareWidget = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spares, setSpares] = useState([]);

  const handleFind = async () => {
    try {
      setLoading(true);
      setError('');
      const spareAssets = await assetService.getAvailableSpares();

      const enriched = await Promise.all(
        spareAssets.slice(0, 8).map(async (asset) => {
          try {
            const history = await api.get(`/allocations/history/asset/${asset.id}`).then((r) => r.data);
            const lastWithOwner = history.find((h) => h.assignedFrom || h.assignedTo || h.user);
            const lastOwner =
              lastWithOwner?.assignedFrom?.fullName ||
              lastWithOwner?.assignedFrom?.email ||
              lastWithOwner?.assignedTo?.fullName ||
              lastWithOwner?.assignedTo?.email ||
              lastWithOwner?.user?.fullName ||
              lastWithOwner?.user?.email ||
              null;
            return { ...asset, lastOwner };
          } catch {
            return { ...asset, lastOwner: null };
          }
        })
      );

      setSpares(enriched);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find spare laptops.');
      setSpares([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...cardStyle, marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Find Spare Laptop</h3>
        <button
          onClick={handleFind}
          disabled={loading}
          style={{
            border: 'none',
            background: '#4f46e5',
            color: '#fff',
            borderRadius: '8px',
            padding: '0.45rem 0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Loading...' : 'Find'}
        </button>
      </div>
      <p style={{ margin: '0 0 0.75rem 0', color: '#475569', fontSize: '0.85rem' }}>
        Quick action to list currently available spare laptops and their last known owner.
      </p>
      {error && <p style={{ color: '#b91c1c', margin: '0 0 0.6rem 0', fontSize: '0.85rem' }}>{error}</p>}
      {!error && spares.length === 0 && (
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>No spare results yet.</p>
      )}
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {spares.map((asset) => (
          <div key={asset.id} style={{ border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '8px', padding: '0.6rem' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
              {asset.brand} {asset.model}
            </div>
            <div style={{ color: '#475569', fontSize: '0.82rem' }}>
              Serial: {asset.serialNumber} | Warranty: {asset.warrantyStatus}
            </div>
            <div style={{ color: '#334155', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              Last owner: {asset.lastOwner || 'No previous owner'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindSpareWidget;
