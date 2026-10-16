export default function TerminalArtwork() {
  return (
    <div className="art terminalart" aria-hidden="true">
      <div className="microhead">
        ● ● ● <span>DIAGNOSTIC NOTES</span>
      </div>
      <p>
        <b>›</b> sqllocaldb start
      </p>
      <p className="amber">Instance startup failed.</p>
      <p>
        <b>›</b> fsutil fsinfo sectorinfo
      </p>
      <div className="codefocus">
        <small>PhysicalBytesPerSectorForPerformance</small>
        <strong>
          32768 <span>bytes</span>
        </strong>
      </div>
      <p className="green">↳ Follow the evidence deeper.</p>
    </div>
  );
}
