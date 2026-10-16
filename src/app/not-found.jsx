import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="wrap notfound">
      <div className="eyebrow">404 / OFF THE TRAIL</div>
      <h1>This path ends here.</h1>
      <p>There’s plenty of work to explore back at the portfolio.</p>
      <Link className="button primary" href="/">
        Back to the portfolio ↗
      </Link>
    </main>
  );
}
