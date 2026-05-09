import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import assetService from '../services/assetService';
import ConditionReportForm from '../components/assets/ConditionReportForm';

const MyAssets = () => {
  const navigate = useNavigate();
  const [myAssets, setMyAssets] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assets');
  const [searchQuery, setSearchQuery] = useState('');

  // Report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assets, reports] = await Promise.all([
        assetService.getMyAssets(),
        assetService.getMyConditionReports()
      ]);
      setMyAssets(assets);
      setMyReports(reports);
    } catch (err) {
      setError('Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (asset) => {
    setSelectedAsset(asset);
    setShowReportForm(true);
  };

  const handleSubmitReport = async (formData) => {
    if (!selectedAsset) return;

    try {
      setSubmitting(true);
      await assetService.createConditionReport({
        assetId: selectedAsset.id,
        conditionStatus: formData.conditionStatus,
        description: formData.description
      });
      setShowReportForm(false);
      setSelectedAsset(null);
      // Refresh data
      const reports = await assetService.getMyConditionReports();
      setMyReports(reports);
      setActiveTab('reports');
    } catch (err) {
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return myAssets;
    const q = searchQuery.toLowerCase();
    return myAssets.filter(a => 
      a.brand?.toLowerCase().includes(q) || 
      a.model?.toLowerCase().includes(q) || 
      a.serialNumber?.toLowerCase().includes(q) ||
      a.type?.toLowerCase().includes(q)
    );
  }, [myAssets, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return myReports;
    const q = searchQuery.toLowerCase();
    return myReports.filter(r => 
      r.asset?.brand?.toLowerCase().includes(q) || 
      r.asset?.model?.toLowerCase().includes(q) || 
      r.asset?.serialNumber?.toLowerCase().includes(q) ||
      r.conditionStatus?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  }, [myReports, searchQuery]);

  const getStatusStyle = (status) => {
    const styles = {
      GOOD: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
      FAIR: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
      DAMAGED: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
      UNDER_REPAIR: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
      DECOMMISSIONED: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
    };
    return styles[status] || styles.GOOD;
  };

  const getWarrantyStyle = (status) => {
    if (status === 'EXPIRED') return { color: '#ef4444' };
    if (status === 'EXPIRING_SOON') return { color: '#f59e0b' };
    return { color: '#22c55e' };
  };

  const getTypeIcon = (type) => {
    if (type === 'LAPTOP') return '💻';
    if (type === 'MONITOR') return '🖥️';
    return '🔌';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div className="ui-spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading your assets…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239,68,68,0.1)', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.2)', maxWidth: '400px' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          <button onClick={fetchData} className="btn-submit" style={{ background: 'var(--color-danger)' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: 'var(--color-text-primary)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>My Assets</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {myAssets.length} asset{myAssets.length !== 1 ? 's' : ''} assigned to you • {myReports.length} report{myReports.length !== 1 ? 's' : ''} filed
          </p>
        </div>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '0.75rem',
              border: '1px solid var(--color-border)', background: 'var(--color-card)',
              color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none'
            }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'assets', label: `My Equipment (${filteredAssets.length})` },
          { id: 'reports', label: `My Reports (${filteredReports.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
              background: activeTab === tab.id ? 'var(--color-info-light)' : 'var(--color-input-bg)',
              color: activeTab === tab.id ? 'var(--color-info)' : 'var(--color-text-secondary)',
              outline: activeTab === tab.id ? '1px solid var(--color-info)' : '1px solid var(--color-input-border)'
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ========== ASSETS TAB ========== */}
      {activeTab === 'assets' && (
        <>
          {filteredAssets.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', background: 'var(--color-table-header-bg)',
              borderRadius: '1rem', border: '1px solid var(--color-table-border)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }} aria-hidden>📦</div>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                {searchQuery ? 'No matching assets' : 'No assets assigned'}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                {searchQuery ? 'Try a different search term.' : 'When a manager assigns equipment to you, it will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {filteredAssets.map(asset => (
                <div key={asset.id} style={{
                  background: 'var(--color-card)', borderRadius: '0.75rem',
                  border: '1px solid var(--color-border)', padding: '1.25rem',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Asset Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
                      }} aria-hidden>{getTypeIcon(asset.type)}</div>
                      <div>
                        <h4 style={{ color: 'var(--color-text-primary)', margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                          {asset.brand} {asset.model}
                        </h4>
                        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.78rem' }}>
                          SN: {asset.serialNumber}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.7rem', fontWeight: 600,
                      background: 'var(--color-info-light)', color: 'var(--color-info)', border: '1px solid var(--color-info-light)'
                    }}>{asset.type}</span>
                  </div>

                  {/* Asset Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--color-background)', borderRadius: '0.4rem' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', margin: 0 }}>Status</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', margin: '0.15rem 0 0 0', fontWeight: 500 }}>
                        {asset.status}
                      </p>
                    </div>
                    <div style={{ padding: '0.5rem', background: 'var(--color-background)', borderRadius: '0.4rem' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', margin: 0 }}>Warranty</p>
                      <p style={{ fontSize: '0.85rem', margin: '0.15rem 0 0 0', fontWeight: 500, ...getWarrantyStyle(asset.warrantyStatus) }}>
                        {asset.warrantyStatus === 'EXPIRED'
                          ? 'Expired'
                          : asset.warrantyStatus === 'EXPIRING_SOON'
                          ? 'Expiring soon'
                          : 'Valid'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenReport(asset); }}
                      style={{
                        flex: 1, padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--color-warning)',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                        background: 'var(--color-warning-light)', color: 'var(--color-warning)', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-warning)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--color-warning-light)'}
                    >
                      Report Issue
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/assets/${asset.id}`); }}
                      style={{
                        padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                        background: 'var(--color-background)', color: 'var(--color-text-secondary)', transition: 'all 0.2s'
                      }}
                    >
                      History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== REPORTS TAB ========== */}
      {activeTab === 'reports' && (
        <>
          {filteredReports.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', background: 'var(--color-table-header-bg)',
              borderRadius: '1rem', border: '1px solid var(--color-table-border)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }} aria-hidden>📋</div>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                {searchQuery ? 'No matching reports' : 'No reports filed yet'}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                {searchQuery ? 'Try a different search term.' : 'Go to "My Equipment" and click "Report Issue" on any asset.'}
              </p>
            </div>
          ) : (
            <div style={{
              background: 'var(--color-card)', borderRadius: '0.75rem',
              border: '1px solid var(--color-border)', overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Asset', 'Condition', 'Description', 'Date'].map(h => (
                      <th key={h} style={{
                        padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                        fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(report => {
                    const s = getStatusStyle(report.conditionStatus);
                    return (
                      <tr key={report.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div>
                            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                              {report.asset?.brand} {report.asset?.model}
                            </span>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', margin: '0.15rem 0 0 0' }}>
                              SN: {report.asset?.serialNumber}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 600,
                            background: s.bg, color: s.color, border: `1px solid ${s.border}`
                          }}>{report.conditionStatus}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
                          {report.description || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {report.reportedAt ? new Date(report.reportedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ========== REPORT MODAL ========== */}
      {showReportForm && selectedAsset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}
          onClick={() => setShowReportForm(false)}
        >
          <ConditionReportForm 
            asset={selectedAsset}
            submitting={submitting}
            onSubmit={handleSubmitReport}
            onCancel={() => setShowReportForm(false)}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MyAssets;
