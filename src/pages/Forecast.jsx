export default function ForecastPage({
  forecast,
  maxUnits,
  onDownload,
  onUpload,
  setFileInput,
  customStatus,
  customError
}) {
  return (
    <>
      <section className="grid main-grid">
        <div className="glass-card chart-card">
          <div className="card-header">
            <h3>6-Month Demand Forecast</h3>
            <button className="pill" onClick={onDownload}>
              Download CSV
            </button>
          </div>
          <div className="chart">
            {forecast.map((item) => (
              <div className="bar" key={item.month}>
                <div
                  className="bar-fill"
                  style={{ height: `${(item.units / maxUnits) * 100}%` }}
                >
                  <span>{item.units}k</span>
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="glass-card upload-card">
          <div className="card-header">
            <h3>Custom Forecast Upload</h3>
            <span className="pill">CSV • date, units</span>
          </div>
          <p className="muted">
            Upload your historical sales CSV to forecast future demand. Required
            columns: <strong>date</strong> and <strong>units</strong>.
          </p>
          <form className="upload-form" onSubmit={onUpload}>
            <input
              type="file"
              accept=".csv"
              onChange={(event) => setFileInput(event.target.files?.[0] || null)}
            />
            <button className="primary" type="submit">
              Generate Forecast
            </button>
          </form>
          <div className="upload-status">
            <span>{customStatus}</span>
            {customError && <span className="error">{customError}</span>}
          </div>
        </div>
      </section>
    </>
  );
}
