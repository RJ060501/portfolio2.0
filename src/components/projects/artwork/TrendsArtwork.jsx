export default function TrendsArtwork() {
  return (
    <div className="art scraperart" aria-hidden="true">
      <div className="microhead">
        <span>TECH / DISCOVERY</span><span className="green">GET /api/trends</span>
      </div>
      <div className="searchvisual">
        ?topic=cloud&amp;limit=5 <span>200 OK</span>
      </div>
      {[
        ['Hacker News', 'Cloud / infrastructure'],
        ['DEV', 'Software engineering'],
        ['API', 'Cached · normalized · filtered'],
      ].map(([source, title], index) => (
        <div className="articlevisual" key={source}>
          <span>0{index + 1}</span>
          <div>{title}<small>{source} / ILLUSTRATIVE UI</small></div>
          <span>↗</span>
        </div>
      ))}
    </div>
  );
}
