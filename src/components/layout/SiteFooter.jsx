import Link from 'next/link';
import { profile } from '@/content/profile';

export default function SiteFooter() {
  return (
    <footer className="wrap footer">
      <Link href="/" className="brand">
        Ryan Russell<span className="accent">.</span>
      </Link>
      <span>Built with curiosity. Based in Utah.</span>
      <div>
        <a href={profile.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
        <a href="/">Back to top ↑</a>
      </div>
    </footer>
  );
}
