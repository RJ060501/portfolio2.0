export default function MonitorArtwork() {
  return (
    <div className="art monitorart" aria-hidden="true">
      <div className="microhead">
        <span>◈ &nbsp; SIGNAL / EVENT MONITOR</span>
        <span className="green">● SAMPLE DATA</span>
      </div>
      <div className="ministats">
        <div>
          <small>EVENTS REVIEWED</small>
          <strong>
            128<span>↗</span>
          </strong>
        </div>
        <div>
          <small>NEEDS REVIEW</small>
          <strong>
            03<span className="amber">●</span>
          </strong>
        </div>
        <div>
          <small>SOURCES</small>
          <strong>
            02<span>⌁</span>
          </strong>
        </div>
      </div>
      <div className="chart">
        <svg viewBox="0 0 500 100" preserveAspectRatio="none">
          <path
            d="M0 83 L32 76 50 82 72 53 98 62 120 45 140 66 161 59 180 70 200 25 220 44 240 31 265 50 287 42 310 13 330 36 353 22 372 40 395 26 415 38 435 10 458 24 480 16 500 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="artrow">
        <span className="amber">●</span>
        <span>Unfamiliar sign-in location</span>
        <code>Review →</code>
      </div>
      <div className="artrow">
        <span className="green">●</span>
        <span>Scheduled service activity</span>
        <code>Expected</code>
      </div>
    </div>
  );
}
