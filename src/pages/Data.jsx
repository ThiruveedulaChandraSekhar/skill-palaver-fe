export default function DataPage({ usage, onExport }) {
  return (
    <section className="grid">
      <div className="glass-card table-card">
        <div className="card-header">
          <h3>Usage Dataset (Sample)</h3>
          <button className="pill" onClick={onExport}>
            Export
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Region</th>
                <th>Model</th>
                <th>Feature</th>
                <th>Sessions</th>
                <th>Active Users</th>
                <th>Conversions</th>
                <th>Revenue</th>
                <th>Retention</th>
              </tr>
            </thead>
            <tbody>
              {usage.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty">
                    No usage data loaded yet.
                  </td>
                </tr>
              ) : (
                usage.map((row, index) => (
                  <tr key={`${row.date}-${index}`}>
                    <td>{row.date}</td>
                    <td>{row.region}</td>
                    <td>{row.model}</td>
                    <td>{row.feature}</td>
                    <td>{row.sessions}</td>
                    <td>{row.active_users}</td>
                    <td>{row.conversions}</td>
                    <td>${row.revenue.toLocaleString()}</td>
                    <td>{(row.retention * 100).toFixed(0)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
