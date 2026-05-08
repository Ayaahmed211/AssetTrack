import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import UsageStatsChart from '../components/ui/UsageStatsChart';
import AllocationChart from '../components/ui/AllocationChart';
import StatusBadge from '../components/ui/StatusBadge';

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [usageData, setUsageData] = useState(null);
  const [conditionData, setConditionData] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [usageRes, conditionRes] = await Promise.all([
          reportService.getUsageStats(),
          reportService.getConditionSummary()
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

  // Transform data for charts
  const conditionChartData = conditionData?.reportsByConditionStatus 
    ? Object.entries(conditionData.reportsByConditionStatus).map(([name, value]) => ({ name, value }))
    : [];

  const allocationChartData = usageData?.topAllocatedAssets
    ? usageData.topAllocatedAssets.map(asset => ({
        name: asset.serialNumber,
        value: asset.allocationCount
      }))
    : [];

  return (
    <div className="overview-content">
      <section className="overview-top">
        <div className="portfolio-card">
          <div className="portfolio-header">
            <h3>Usage Stats</h3>
          </div>
          <p className="portfolio-value">{usageData?.totalAllocationEvents || 0}</p>
          <p className="portfolio-subtitle">Total Allocation Events</p>
          <div style={{ marginTop: '20px' }}>
            <UsageStatsChart 
              data={usageData?.allocationsByActionType ? Object.entries(usageData.allocationsByActionType).map(([name, value]) => ({ name, value })) : []} 
            />
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

      <section className="market-section">
        <div className="market-header">
          <h3>Top Allocated Assets</h3>
        </div>
        <div className="portfolio-card" style={{ background: 'var(--color-bg-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          <AllocationChart data={allocationChartData} />
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
                style={{ gridTemplateColumns: '2fr 1fr 1fr', cursor: 'pointer', transition: 'background 0.15s' }}
                key={asset.assetId}
                onClick={() => navigate(`/assets/${asset.assetId}`)}
                title={`View details for ${asset.brand} ${asset.model}`}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div>
                  <strong style={{ color: 'var(--color-primary)' }}>{asset.serialNumber}</strong>
                  <p>{asset.brand} - {asset.model}</p>
                </div>
                <span>
                   <StatusBadge status={asset.latestConditionStatus} variant="warning" size="small" />
                </span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {asset.reportCount}
                  <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>View →</span>
                </span>
              </div>
            ))}
            {(!conditionData?.topReportedAssets || conditionData.topReportedAssets.length === 0) && (
               <div className="market-row"><p>No top reported assets found.</p></div>
            )}
          </div>

          <aside className="promo-card">
            <h4>Insights</h4>
            <p>Active Assignments: {usageData?.currentlyAssignedAssets || 0}</p>
            <p>Review the top reported assets to consider decommissioning or repairing them.</p>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Reports;
