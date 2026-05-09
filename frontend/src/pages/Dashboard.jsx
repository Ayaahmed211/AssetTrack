import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';
import { dashboardService } from '../services/dashboardService';
import UsageStatsChart from '../components/ui/UsageStatsChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="overview-content">
        <div className="dash-loading" role="status" aria-busy="true">
          <div className="dash-spinner" />
          <p>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overview-content">
        <div className="dash-error" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const statusChartData = stats?.assetsByStatus 
    ? Object.entries(stats.assetsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const typeChartData = stats?.assetsByType 
    ? Object.entries(stats.assetsByType).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="overview-content">
      <section className="overview-top">
        <div className="portfolio-card">
          <div className="portfolio-header">
            <h3>Overview</h3>
            <button type="button" className="portfolio-menu-btn" aria-label="More options">
              <span />
              <span />
              <span />
            </button>
          </div>
          <p className="portfolio-value">{stats?.totalAssets ?? 0}</p>
          <p className="portfolio-subtitle">Total assets in system</p>
          <div className="portfolio-chart-wrap">
            <UsageStatsChart data={statusChartData} />
          </div>
        </div>

        <div className="asset-cards">
          <article className="asset-card purple">
            <div className="asset-card-body">
              <h4>Allocations</h4>
              <p>Total events: {stats?.totalAllocations ?? 0}</p>
            </div>
            <StatusBadge status="ACTIVE" variant="info" size="small" />
          </article>
          <article className="asset-card green">
            <div className="asset-card-body">
              <h4>Warranties</h4>
              <p>Valid: {stats?.validWarranties ?? 0}</p>
            </div>
            <StatusBadge status="OK" variant="success" size="small" />
          </article>
          <article className="asset-card yellow">
            <div className="asset-card-body">
              <h4>Reports</h4>
              <p>Condition reports: {stats?.totalConditionReports ?? 0}</p>
            </div>
            <StatusBadge status="NOTE" variant="warning" size="small" />
          </article>
        </div>
      </section>

      <section className="market-section">
        <div className="market-header">
          <h3>Asset Categories</h3>
        </div>

        <div className="market-grid">
          <div className="market-table-card">
            <div className="market-table-head" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <span>Category</span>
              <span>Count</span>
            </div>
            {typeChartData.map((row) => (
              <div className="market-row" style={{ gridTemplateColumns: '1fr 1fr' }} key={row.name}>
                <div>
                  <strong>{row.name}</strong>
                </div>
                <span>{row.value}</span>
              </div>
            ))}
            {typeChartData.length === 0 && (
              <div className="market-row"><p>No category data found.</p></div>
            )}
          </div>

          <aside className="promo-card">
            <h4>System health</h4>
            <ul className="promo-metrics">
              <li><span>Users</span><strong>{stats?.totalUsers ?? 0}</strong></li>
              <li><span>Active assignments</span><strong>{stats?.activeAssignments ?? 0}</strong></li>
              <li><span>Available spare units</span><strong>{stats?.availableSpares ?? 0}</strong></li>
            </ul>
            <button type="button" className="promo-card-btn" onClick={() => navigate('/reports')}>
              View reports
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
