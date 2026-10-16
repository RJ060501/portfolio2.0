export default function ScraperArtwork() {
  return (
    <div className="art scraperart" aria-hidden="true">
      <div className="microhead">⌕ &nbsp; ARTICLE / DISCOVERY</div>
      <div className="searchvisual">
        ⌕ &nbsp; cloud infrastructure <span>↵</span>
      </div>
      {[
        'Cloud architecture, explained',
        'The path to resilient systems',
        'Automation for everyday operations',
      ].map((s, i) => (
        <div className="articlevisual" key={s}>
          <span>0{i + 1}</span>
          <div>
            {s}
            <small>EXAMPLE ARTICLE · TECHNOLOGY</small>
          </div>
          <span>↗</span>
        </div>
      ))}
    </div>
  );
}
