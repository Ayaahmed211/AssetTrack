import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import UsageStatsChart from '../components/ui/UsageStatsChart';
import AllocationChart from '../components/ui/AllocationChart';
import StatusBadge from '../components/ui/StatusBadge';

/* ── Lifecycle Modal ────────────────────────────────────────────────────── */
const LifecycleModal = ({ assetId, onClose }) => {
  const [lifecycle, setLifecycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assetId) return;
    const fetchLifecycle = async () => {
      try {
        setLoading(true);
        const data = await reportService.getAssetLifecycle(assetId);
        setLifecycle(data);
      } catch (err) {
        console.error('Failed to fetch lifecycle', err);
        setError('Could not load asset lifecycle. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLifecycle();
  }, [assetId]);

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString();
  };

  const warrantyColor = {
    VALID: '#10b981',
    EXPIRING_SOON: '#f59e0b',
    EXPIRED: '#ef4444',
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#fff' }}>Asset Lifecycle</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {loading && <p style={{ color: '#aaa' }}>Loading timeline...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {lifecycle && (
          <>
            {/* Asset Info */}
            <div style={infoCardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <span style={labelStyle}>Serial Number</span>
                <span style={valueStyle}>{lifecycle.serialNumber}</span>
                <span style={labelStyle}>Brand / Model</span>
                <span style={valueStyle}>{lifecycle.brand} — {lifecycle.model}</span>
                <span style={labelStyle}>Type</span>
                <span style={valueStyle}>{lifecycle.type}</span>
                <span style={labelStyle}>Current Status</span>
                <span style={valueStyle}>{lifecycle.currentStatus}</span>
                <span style={labelStyle}>Warranty</span>
                <span style={{ ...valueStyle, color: warrantyColor[lifecycle.warrantyStatus] || '#fff' }}>
                  {lifecycle.warrantyStatus}
                </span>
              </div>
            </div>

            {/* Allocation History */}
            <h3 style={{ color: '#c4b5fd', marginTop: '24px', marginBottom: '12px' }}>
              Allocation history ({lifecycle.allocationHistory?.length || 0} events)
            </h3>
            {lifecycle.allocationHistory?.length === 0 && (
              <p style={{ color: '#aaa' }}>No allocation events recorded.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lifecycle.allocationHistory?.map((event, i) => (
                <div key={event.eventId || i} style={timelineEventStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: actionColor(event.actionType) }}>{event.actionType}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{formatDate(event.assignedAt)}</span>
                  </div>
                  {event.assignedToFullName && (
                    <p style={eventDetailStyle}>→ Assigned To: <strong>{event.assignedToFullName}</strong></p>
                  )}
                  {event.assignedFromFullName && (
                    <p style={eventDetailStyle}>← From: <strong>{event.assignedFromFullName}</strong></p>
                  )}
                  {event.assignedByFullName && (
                    <p style={eventDetailStyle}>By: <strong>{event.assignedByFullName}</strong></p>
                  )}
                  {event.returnedAt && (
                    <p style={eventDetailStyle}>Returned at: {formatDate(event.returnedAt)}</p>
                  )}
                  {event.notes && (
                    <p style={{ ...eventDetailStyle, fontStyle: 'italic', color: '#94a3b8' }}>
                      Notes: {event.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Condition History */}
            <h3 style={{ color: '#34d399', marginTop: '24px', marginBottom: '12px' }}>
              🔧 Condition History ({lifecycle.conditionHistory?.length || 0} reports)
            </h3>
            {lifecycle.conditionHistory?.length === 0 && (
              <p style={{ color: '#aaa' }}>No condition reports filed.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lifecycle.conditionHistory?.map((report, i) => (
                <div key={report.reportId || i} style={timelineEventStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: '#f59e0b' }}>{report.conditionStatus}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{formatDate(report.reportedAt)}</span>
                  </div>
                  <p style={eventDetailStyle}>Reported by: <strong>{report.reportedByFullName}</strong></p>
                  {report.description && (
                    <p style={{ ...eventDetailStyle, fontStyle: 'italic', color: '#94a3b8' }}>
                      "{report.description}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const actionColor = (type) => {
  if (type === 'ASSIGNED') return '#10b981';
  if (type === 'TRANSFERRED') return '#8b5cf6';
  if (type === 'RETURNED') return '#f59e0b';
  return '#aaa';
};

/* ── Modal Styles ─────────────────────────────────────────────────────── */
const modalOverlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999,
};
const modalBoxStyle = {
  background: '#1e1e2e',
  border: '1px solid #333',
  borderRadius: '16px',
  padding: '28px',
  width: '600px',
  maxWidth: '95vw',
  maxHeight: '85vh',
  overflowY: 'auto',
};
const closeBtnStyle = {
  background: 'transparent',
  border: '1px solid #555',
  color: '#ccc',
  width: '32px', height: '32px',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '14px',
};
const infoCardStyle = {
  background: '#2a2a3e',
  borderRadius: '10px',
  padding: '16px',
};
const labelStyle = { color: '#aaa', fontSize: '0.82rem' };
const valueStyle = { color: '#fff', fontWeight: 600, fontSize: '0.9rem' };
const timelineEventStyle = {
  background: '#2a2a3e',
  borderRadius: '8px',
  padding: '12px 16px',
  borderLeft: '3px solid #8b5cf6',
};
const eventDetailStyle = {
  margin: '2px 0',
  fontSize: '0.85rem',
  color: '#cbd5e1',
};

/* ── Main Reports Page ────────────────────────────────────────────────── */
const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usageData, setUsageData] = useState(null);
  const [conditionData, setConditionData] = useState(null);

  // Lifecycle modal state
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [usageRes, conditionRes] = await Promise.all([
          reportService.getUsageStats(),
          reportService.getConditionSummary(),
        ]);
        setUsageData(usageRes);
        setConditionData(conditionRes);
      } catch (err) {
        console.error('Failed to fetch reports', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="overview-content">Loading reports...</div>;
  }

  if (error) {
    return <div className="overview-content" style={{ color: 'red' }}>{error}</div>;
  }

  // Chart data transformations
  const conditionChartData = conditionData?.reportsByConditionStatus
    ? Object.entries(conditionData.reportsByConditionStatus).map(([name, value]) => ({ name, value }))
    : [];

  const allocationChartData = usageData?.topAllocatedAssets
    ? usageData.topAllocatedAssets.map(asset => ({
        name: asset.serialNumber,
        value: asset.allocationCount,
      }))
    : [];

  const actionTypeChartData = usageData?.allocationsByActionType
    ? Object.entries(usageData.allocationsByActionType).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="overview-content">

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <section className="overview-top">
        <div className="portfolio-card">
          <div className="portfolio-header">
            <h3>Usage Stats</h3>
          </div>
          <p className="portfolio-value">{usageData?.totalAllocationEvents || 0}</p>
          <p className="portfolio-subtitle">Total Allocation Events</p>
          <div style={{ marginTop: '20px' }}>
            <UsageStatsChart data={actionTypeChartData} />
          </div>
        </div>

        <div className="portfolio-card" style={{ background: 'var(--color-card-purple)' }}>
          <div className="portfolio-header">
            <h3>Condition Summary</h3>
          </div>
          <p className="portfolio-value">{conditionData?.totalReports || 0}</p>
          <p className="portfolio-subtitle">Total Condition Reports</p>
          <div style={{ marginTop: '20px' }}>
            <UsageStatsChart data={conditionChartData} />
          </div>
        </div>
      </section>

      {/* ── Top Allocated Assets (Bar Chart) ────────────────────── */}
      <section className="market-section">
        <div className="market-header">
          <h3>Top Allocated Assets</h3>
        </div>
        <div className="portfolio-card" style={{ background: 'var(--color-bg-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          <AllocationChart data={allocationChartData} />
        </div>
      </section>

      {/* ── Top Assigned Users ──────────────────────────────────── */}
      <section className="market-section">
        <div className="market-header">
          <h3>Top Assigned Users</h3>
        </div>
        <div className="market-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="market-table-card" style={{ gridColumn: '1 / -1' }}>
            <div className="market-table-head" style={{ gridTemplateColumns: '2fr 2fr 1fr' }}>
              <span>Name</span>
              <span>Email</span>
              <span>Allocations</span>
            </div>
            {usageData?.topAssignedUsers?.map((user, i) => (
              <div
                className="market-row"
                style={{ gridTemplateColumns: '2fr 2fr 1fr' }}
                key={user.userId || i}
              >
                <div>
                  <strong>{user.fullName}</strong>
                </div>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{user.email}</span>
                <span>{user.allocationCount}</span>
              </div>
            ))}
            {(!usageData?.topAssignedUsers || usageData.topAssignedUsers.length === 0) && (
              <div className="market-row"><p>No user allocation data found.</p></div>
            )}
          </div>
        </div>
      </section>

      {/* ── Top Reported Assets + Lifecycle Drill-down ──────────── */}
      <section className="market-section">
        <div className="market-header">
          <h3>Top Reported Assets</h3>
          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
            Click a row to view full lifecycle history
          </span>
        </div>
        <div className="market-grid">
          <div className="market-table-card">
            <div className="market-table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
              <span>Asset</span>
              <span>Condition</span>
              <span>Reports</span>
            </div>
            {conditionData?.topReportedAssets?.map((asset) => (
              <div
                className="market-row"
                style={{
                  gridTemplateColumns: '2fr 1fr 1fr',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                key={asset.assetId}
                onClick={() => setSelectedAssetId(asset.assetId)}
                title="Click to view full lifecycle"
              >
                <div>
                  <strong>{asset.serialNumber}</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                    {asset.brand} - {asset.model}
                  </p>
                </div>
                <span>
                  <StatusBadge status={asset.latestConditionStatus} variant="warning" size="small" />
                </span>
                <span>{asset.reportCount}</span>
              </div>
            ))}
            {(!conditionData?.topReportedAssets || conditionData.topReportedAssets.length === 0) && (
              <div className="market-row"><p>No top reported assets found.</p></div>
            )}
          </div>

          <aside className="promo-card">
            <h4>Insights</h4>
            <p>Active Assignments: {usageData?.currentlyAssignedAssets || 0}</p>
            <p style={{ marginTop: '12px', lineHeight: '1.5' }}>
              Review the top reported assets to consider decommissioning or repairing them.
            </p>
            <p style={{ marginTop: '12px', fontSize: '0.82rem', color: '#aaa' }}>
              💡 Click any asset row to view its full allocation and condition timeline.
            </p>
          </aside>
        </div>
      </section>

      {/* ── Asset Lifecycle Modal ───────────────────────────────── */}
      {selectedAssetId && (
        <LifecycleModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
        />
      )}
    </div>
  );
};

export default Reports;
