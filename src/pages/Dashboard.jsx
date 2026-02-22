export default function DashboardPage({
  kpis,
  loading,
  onLaunchReport,
  onShare,
  onRefresh,
  onSimulate
}) {
  return (
    <>
      <header className="hero">
        <div>
          <p className="badge">AI Powered Forecasting</p>
          <h1>Smartwatch Sales Forecast Studio</h1>
          <p className="subtitle">
            Real-time feature impact intelligence and demand projections for the next
            launch cycle.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={onLaunchReport}>
              Launch Forecast Report
            </button>
            <button className="ghost" onClick={onShare}>
              Share to Stakeholders
            </button>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top">
            <span>Forecast Confidence</span>
            <span className="status">{loading ? "Syncing" : "Live"}</span>
          </div>
          <h2>0.91</h2>
          <p>AI ensemble validated across 24 markets.</p>
          <div className="progress">
            <div style={{ width: "91%" }} />
          </div>
          <div className="hero-card-footer">
            <div>
              <h4>+18%</h4>
              <span>Projected Lift</span>
            </div>
            <div>
              <h4>6 mo</h4>
              <span>Outlook</span>
            </div>
          </div>
        </div>
      </header>

      <section className="grid kpi-grid">
        {kpis.map((kpi) => (
          <div className="glass-card" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </section>

      <section className="grid secondary-grid">
        <div className="glass-card">
          <div className="card-header">
            <h3>Market Readiness</h3>
            <button className="pill" onClick={onRefresh}>
              Refresh
            </button>
          </div>
          <div className="signal">
            <div className="signal-ring" />
            <div className="signal-ring" />
            <div className="signal-ring" />
            <div className="signal-core">92%</div>
          </div>
          <p className="muted">
            Highest conversion probability across North America and APAC.
          </p>
        </div>
        <div className="glass-card">
          <div className="card-header">
            <h3>Campaign Playbook</h3>
            <button className="pill" onClick={onLaunchReport}>
              Open
            </button>
          </div>
          <ul className="playbook">
            <li>
              <span>Luxury Tier Focus</span>
              <strong>+8% margin</strong>
            </li>
            <li>
              <span>Fitness Bundle</span>
              <strong>+11% attach</strong>
            </li>
            <li>
              <span>Enterprise Wellness</span>
              <strong>+14% pipeline</strong>
            </li>
          </ul>
          <button className="primary full" onClick={onSimulate}>
            Generate Campaign
          </button>
        </div>
      </section>
    </>
  );
}
