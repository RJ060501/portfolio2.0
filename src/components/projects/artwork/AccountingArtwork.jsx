export default function AccountingArtwork() {
  return (
    <div className="art chatart" aria-hidden="true">
      <div className="microhead">↗ &nbsp; LEDGER / CONVERSATIONAL UI</div>
      <div className="chatbubble userbubble">How does double-entry bookkeeping work?</div>
      <div className="chatanswer">
        <span className="aibadge">✳</span>
        <p>
          Every transaction has two sides.
          <br />
          <span>A debit. A credit. A balanced ledger.</span>
        </p>
      </div>
      <div className="fakeinput">
        Ask a question <span>↑</span>
      </div>
      <div className="artcaption">
        REACT <span>→</span> NODE.JS <span>→</span> AWS
      </div>
    </div>
  );
}
