import { useState, useEffect } from 'react';
import assetService from '../services/assetService';

const MyAssets = () => {
  const [myAssets, setMyAssets] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assets');

  // Report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [reportForm, setReportForm] = useState({ conditionStatus: 'GOOD', description: '' });
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
    setReportForm({ conditionStatus: 'GOOD', description: '' });
    setShowReportForm(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    try {
      setSubmitting(true);
      await assetService.createConditionReport({
        assetId: selectedAsset.id,
        conditionStatus: reportForm.conditionStatus,
        description: reportForm.description
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
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
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
          <button onClick={fetchData} style={{ padding: '0.5rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>My Assets</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {myAssets.length} asset{myAssets.length !== 1 ? 's' : ''} assigned to you • {myReports.length} report{myReports.length !== 1 ? 's' : ''} filed
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'assets', label: `My Equipment (${myAssets.length})` },
          { id: 'reports', label: `My Reports (${myReports.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
              background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#818cf8' : 'var(--text-secondary)',
              outline: activeTab === tab.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)'
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ========== ASSETS TAB ========== */}
      {activeTab === 'assets' && (
        <>
          {myAssets.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.03)',
              borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }} aria-hidden>📦</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No assets assigned</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                When a manager assigns equipment to you, it will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {myAssets.map(asset => (
                <div key={asset.id} style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
                        <h4 style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                          {asset.brand} {asset.model}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.78rem' }}>
                          SN: {asset.serialNumber}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.7rem', fontWeight: 600,
                      background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)'
                    }}>{asset.type}</span>
                  </div>

                  {/* Asset Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.4rem' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Status</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0.15rem 0 0 0', fontWeight: 500 }}>
                        {asset.status}
                      </p>
                    </div>
                    <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.4rem' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Warranty</p>
                      <p style={{ fontSize: '0.85rem', margin: '0.15rem 0 0 0', fontWeight: 500, ...getWarrantyStyle(asset.warrantyStatus) }}>
                        {asset.warrantyStatus === 'EXPIRED'
                          ? 'Expired'
                          : asset.warrantyStatus === 'EXPIRING_SOON'
                          ? 'Expiring soon'
                          : 'Valid'}
                      </p>
                    </div>
                  </div>

                  {/* Report Issue Button */}
                  <button
                    onClick={() => handleOpenReport(asset)}
                    style={{
                      width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid rgba(245,158,11,0.3)',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      background: 'rgba(245,158,11,0.1)', color: '#f59e0b', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
                  >
                    Report an issue
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== REPORTS TAB ========== */}
      {activeTab === 'reports' && (
        <>
          {myReports.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.03)',
              borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }} aria-hidden>📋</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No reports filed yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Go to "My Equipment" and click "Report an Issue" on any asset.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Asset', 'Condition', 'Description', 'Date'].map(h => (
                      <th key={h} style={{
                        padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                        fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myReports.map(report => {
                    const s = getStatusStyle(report.conditionStatus);
                    return (
                      <tr key={report.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                              {report.asset?.brand} {report.asset?.model}
                            </span>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0.15rem 0 0 0' }}>
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
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '300px' }}>
                          {report.description || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
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
          <div style={{
            background: 'var(--color-card)', borderRadius: '1rem', padding: '2rem',
            width: '90%', maxWidth: '480px', border: '1px solid rgba(255,255,255,0.1)'
          }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
              Report an Issue
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', fontSize: '0.85rem' }}>
              {selectedAsset.brand} {selectedAsset.model} — SN: {selectedAsset.serialNumber}
            </p>

            <form onSubmit={handleSubmitReport}>
              {/* Condition Status */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Condition
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {[
                    { value: 'GOOD', label: 'Good', desc: 'Working as expected' },
                    { value: 'FAIR', label: 'Fair', desc: 'Minor issues' },
                    { value: 'DAMAGED', label: 'Damaged', desc: 'Needs attention' },
                    { value: 'UNDER_REPAIR', label: 'Under repair', desc: 'Being fixed' },
                  ].map(opt => (
                    <label key={opt.value} style={{
                      display: 'flex', flexDirection: 'column', padding: '0.65rem',
                      border: `2px solid ${reportForm.conditionStatus === opt.value ? getStatusStyle(opt.value).color : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '0.6rem', cursor: 'pointer', transition: 'all 0.2s',
                      background: reportForm.conditionStatus === opt.value ? getStatusStyle(opt.value).bg : 'rgba(255,255,255,0.02)'
                    }}>
                      <input type="radio" name="conditionStatus" value={opt.value}
                        checked={reportForm.conditionStatus === opt.value}
                        onChange={e => setReportForm(f => ({ ...f, conditionStatus: e.target.value }))}
                        style={{ display: 'none' }}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{opt.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Description
                </label>
                <textarea
                  value={reportForm.description}
                  onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the issue (e.g., broken keyboard, battery draining fast...)"
                  rows={4}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowReportForm(false)}
                  style={{
                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem'
                  }}
                >Cancel</button>
                <button type="submit" disabled={submitting}
                  style={{
                    padding: '0.6rem 1.5rem', borderRadius: '0.5rem', border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                    opacity: submitting ? 0.6 : 1
                  }}
                >{submitting ? 'Submitting...' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MyAssets;
