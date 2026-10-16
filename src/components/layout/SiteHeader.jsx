'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="nav wrap">
        <Link href="/" className="brand" aria-label="Ryan Russell home">
          <span className="brandmark">
            r<span>.</span>
          </span>
          <span>Ryan Russell</span>
        </Link>
        <button
          className="menu"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'} <span>{open ? '−' : '+'}</span>
        </button>
        <nav
          id="nav-links"
          className={open ? 'navlinks open' : 'navlinks'}
          aria-label="Main navigation"
        >
          <Link onClick={() => setOpen(false)} href="/work/">
            Work
          </Link>
          <Link onClick={() => setOpen(false)} href="/about/">
            About
          </Link>
          <Link onClick={() => setOpen(false)} href="/about/#experience">
            Experience
          </Link>
          <Link onClick={() => setOpen(false)} href="/resume/">
            Résumé <span>↗</span>
          </Link>
          <a onClick={() => setOpen(false)} className="navcontact" href="/contact/">
            Let’s connect <span>↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
