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
    return <div className="overview-content">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="overview-content" style={{ color: 'red' }}>{error}</div>;
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
            <span className="portfolio-menu">⋮</span>
          </div>
          <p className="portfolio-value">{stats?.totalAssets || 0}</p>
          <p className="portfolio-subtitle">Total Assets in System</p>
          <div style={{ marginTop: '20px' }}>
            <UsageStatsChart data={statusChartData} />
          </div>
        </div>

        <div className="asset-cards">
          <article className="asset-card purple">
            <h4>Allocations</h4>
            <p>Total Events: {stats?.totalAllocations || 0}</p>
            <StatusBadge status="ACTIVE" variant="info" size="small" />
          </article>
          <article className="asset-card green">
            <h4>Warranties</h4>
            <p>Valid: {stats?.validWarranties || 0}</p>
            <StatusBadge status="OK" variant="success" size="small" />
          </article>
          <article className="asset-card yellow">
            <h4>Reports</h4>
            <p>Condition Reports: {stats?.totalConditionReports || 0}</p>
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
            <h4>System Health</h4>
            <p>Users: {stats?.totalUsers || 0}</p>
            <p>Active Assignments: {stats?.activeAssignments || 0}</p>
            <p>Available Spares: {stats?.availableSpares || 0}</p>
            <button onClick={() => navigate('/reports')}>View Reports</button>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
