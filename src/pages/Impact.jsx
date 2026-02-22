export default function ImpactPage({ impacts, onSimulate }) {
  return (
    <section className="grid main-grid">
      <div className="glass-card insight-card">
        <div className="card-header">
          <h3>Feature Impact Radar</h3>
          <button className="pill" onClick={onSimulate}>
            Simulate
          </button>
        </div>
        <div className="impact-list">
          {impacts.map((item) => (
            <div className="impact-row" key={item.feature}>
              <div>
                <h4>{item.feature}</h4>
                <p>{item.detail}</p>
              </div>
              <span className="impact-pill">{item.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
