'use client';

import { useState } from 'react';
import { profile } from '@/content/profile';

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  async function copyEmailAddress() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <section id="contact" className="contact wrap">
      <div className="eyebrow">
        <span className="dot" />
        OPEN TO THE NEXT CHALLENGE
      </div>
      <h2>
        Let’s build something
        <br />
        <em>that matters.</em>
      </h2>
      <div className="contactbottom">
        <p>
          Looking for someone who connects code,
          <br />
          infrastructure, and the people who use it?
        </p>
        <div>
          <a className="email" href={'mailto:' + profile.email}>
            {profile.email} ↗
          </a>
          <button className="textbutton" onClick={copyEmailAddress}>
            {copied ? 'Email copied ✓' : 'Copy email address'}
          </button>
          <span className="sr" role="status">
            {copied ? 'Email address copied' : ''}
          </span>
        </div>
      </div>
    </section>
  );
}
