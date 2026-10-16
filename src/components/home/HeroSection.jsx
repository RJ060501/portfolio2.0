import Link from 'next/link';

export default function HeroSection() {
  return (
    <section id="top" className="hero wrap">
      <div className="heroheading">
        <div className="eyebrow">
          <span className="dot" />
          SYSTEMS ADMINISTRATOR & DEVELOPER
        </div>
        <h1>
          Good systems.
          <br />
          Thoughtful code.
          <br />
          <em>Real-world impact.</em>
        </h1>
        <p className="herodesc">
          I’m Ryan. I build tools, untangle infrastructure, and turn everyday IT problems into
          better ways of working.
        </p>
        <div className="heroactions">
          <a className="button primary" href="/work/">
            Explore my work <span>↘</span>
          </a>
          <Link className="button secondary" href="/resume/">
            View résumé <span>↗</span>
          </Link>
        </div>
        <div className="location">
          <span>⌖</span> Salt Lake City, Utah <i /> Building toward cloud engineering
        </div>
      </div>
      <div
        className="herovisual"
        aria-label="Illustration of connected infrastructure above a mountain landscape"
      >
        <div className="visualcoords">
          40.7608° N &nbsp; 111.8910° W<span>FIELD NOTES / 001</span>
        </div>
        <svg className="terrain" viewBox="0 0 600 680" fill="none" aria-hidden="true">
          <defs>
            <linearGradient
              id="fade"
              x1="300"
              y1="120"
              x2="300"
              y2="680"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#a9bf84" stopOpacity=".6" />
              <stop offset="1" stopColor="#a9bf84" stopOpacity=".02" />
            </linearGradient>
          </defs>
          {Array.from({ length: 17 }, (_, i) => (
            <path
              key={i}
              d={`M-40 ${440 + i * 17} L105 ${355 + i * 15} L171 ${385 + i * 14} L295 ${210 + i * 21} L362 ${307 + i * 17} L413 ${274 + i * 18} L640 ${456 + i * 15}`}
              stroke="url(#fade)"
              strokeWidth="1"
            />
          ))}
          <circle cx="295" cy="210" r="7" fill="#c6ef8a" />
          <circle cx="295" cy="210" r="28" stroke="#c6ef8a" strokeOpacity=".25" />
          <path d="M295 210 V125 H439" stroke="#c6ef8a" strokeDasharray="4 6" strokeOpacity=".5" />
        </svg>
        <div className="visualtag">
          <span className="dot" /> ALWAYS BUILDING
        </div>
        <div className="systemcard">
          <div className="systemhead">
            <span>~/ryan/workspace</span>
            <span>− &nbsp; □ &nbsp; ×</span>
          </div>
          <div className="systembody">
            <p>
              <b>›</b> whoami
            </p>
            <div>
              Builder. Troubleshooter.
              <br />
              <span>Curious by default.</span>
            </div>
            <p>
              <b>›</b> focus --current
            </p>
            <ul>
              <li>
                <span>01</span> Secure systems <em>●</em>
              </li>
              <li>
                <span>02</span> Useful automation <em>●</em>
              </li>
              <li>
                <span>03</span> Cloud infrastructure <em>↗</em>
              </li>
            </ul>
            <p className="terminalcursor">
              › <span />
            </p>
          </div>
        </div>
        <div className="visualfoot">
          <span>ROOTED IN UTAH.</span>
          <span>THINKING BEYOND THE DESKTOP. ↗</span>
        </div>
      </div>
    </section>
  );
}
