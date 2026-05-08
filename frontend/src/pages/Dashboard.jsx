import StatusBadge from '../components/ui/StatusBadge';

const Dashboard = () => {
  const marketRows = [
    { name: 'Asset-001', symbol: 'IT-LAP', price: '--', change: '--', cap: 'HQ-01' },
    { name: 'Asset-002', symbol: 'IT-MON', price: '--', change: '--', cap: 'HQ-02' },
    { name: 'Asset-003', symbol: 'OPS-PRN', price: '--', change: '--', cap: 'BR-01' },
    { name: 'Asset-004', symbol: 'OPS-TAB', price: '--', change: '--', cap: 'BR-02' },
  ];

  return (
    <div className="overview-content">
      <section className="overview-top">
        <div className="portfolio-card">
          <div className="portfolio-header">
            <h3>Overview</h3>
            <span className="portfolio-menu">⋮</span>
          </div>
          <p className="portfolio-value">--</p>
          <p className="portfolio-subtitle">Total assets placeholder</p>
          <div className="portfolio-chart">
            <div className="chart-point">--</div>
          </div>
        </div>

        <div className="asset-cards">
          <article className="asset-card purple">
            <h4>Category A</h4>
            <p>Placeholder</p>
            <StatusBadge status="--" variant="info" size="small" />
          </article>
          <article className="asset-card green">
            <h4>Category B</h4>
            <p>Placeholder</p>
            <StatusBadge status="--" variant="success" size="small" />
          </article>
          <article className="asset-card yellow">
            <h4>Category C</h4>
            <p>Placeholder</p>
            <StatusBadge status="--" variant="warning" size="small" />
          </article>
        </div>
      </section>

      <section className="market-section">
        <div className="market-header">
          <h3>Asset Table</h3>
          <div className="market-filters">
            <button>Filter ▾</button>
            <button>Sort ▾</button>
          </div>
        </div>

        <div className="market-grid">
          <div className="market-table-card">
            <div className="market-table-head">
              <span>Asset</span>
              <span>Status</span>
              <span>Value</span>
              <span>Location</span>
            </div>
            {marketRows.map((row) => (
              <div className="market-row" key={row.symbol}>
                <div>
                  <strong>{row.name}</strong>
                  <p>{row.symbol}</p>
                </div>
                <span>{row.price}</span>
                <span>{row.change}</span>
                <span>{row.cap}</span>
              </div>
            ))}
          </div>

          <aside className="promo-card">
            <h4>Announcement Placeholder</h4>
            <p>Use this card for alerts, reminders, or upcoming maintenance updates.</p>
            <button>Action</button>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
