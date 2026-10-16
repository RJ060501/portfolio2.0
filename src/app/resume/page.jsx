import { experience } from '@/content/experience';
import { profile } from '@/content/profile';
export const metadata = {
  title: 'Résumé',
};
export default function Resume() {
  return (
    <main id="main" className="wrap resumepage">
      <div className="sectionhead">
        <div>
          <div className="eyebrow">EXPERIENCE / EDUCATION / SKILLS</div>
          <h1>
            A builder’s
            <br />
            <em>background.</em>
          </h1>
        </div>
        <a className="button primary" href="/Ryan_Russell_Resume.pdf" download>
          Download résumé ↓
        </a>
      </div>
      <div className="resumesheet">
        <header>
          <h2>Ryan Russell</h2>
          <p>Systems Administrator · Software Developer</p>
          <p>
            {profile.location} · <a href={'mailto:' + profile.email}>{profile.email}</a>
          </p>
          <div>
            <a href={profile.linkedin}>LinkedIn ↗</a> &nbsp; <a href={profile.github}>GitHub ↗</a>
          </div>
        </header>
        <section>
          <h3>Profile</h3>
          <p>
            Systems administrator with a software development foundation and hands-on experience in
            Microsoft 365, infrastructure support, security monitoring, and automation. Focused on
            systems, cloud operations, and platform engineering.
          </p>
        </section>
        <section>
          <h3>Relevant experience</h3>
          {experience.map((position) => (
            <article key={position.company}>
              <div className="resumerole">
                <h4>
                  {position.title} · {position.company}
                </h4>
                <span>{position.date}</span>
              </div>
              <p>{position.text}</p>
            </article>
          ))}
          <article>
            <div className="resumerole">
              <h4>Sales Specialist / Team Lead · Musician’s Friend</h4>
              <span>2022 — 2026</span>
            </div>
            <p>
              Customer support, relationship management, team mentoring, and process improvement in
              a fast-paced environment.
            </p>
          </article>
        </section>
        <section>
          <h3>Selected work</h3>
          <p>
            <b>Security monitoring:</b> Python application using Microsoft Graph APIs, detection
            rules, SQLite state, and alerts. Exploring local AI-assisted correlation and summaries.
          </p>
          <p>
            <b>Cloud & application development:</b> AWS accounting chatbot, Node.js article
            discovery API, React video explorer, and Java Snake game.
          </p>
          <p>
            <b>Technical investigation:</b> Diagnosed a SQL Server LocalDB startup failure by
            correlating application logs with Windows storage sector reporting.
          </p>
        </section>
        <section>
          <h3>Education</h3>
          <p>
            <b>Western Governors University</b> · Bachelor’s studies in cloud and network
            engineering · Expected October 2026
          </p>
          <p>
            <b>Salt Lake Community College</b> · Associate degree, Computer Science, Software
            Development emphasis · 2024
          </p>
        </section>
        <section>
          <h3>Skills & credentials</h3>
          <p>
            Python, PowerShell, JavaScript, React, Redux, Node.js, SQL, REST APIs, Git, Docker,
            Linux, Windows Server, Microsoft 365, Entra, Freshservice, AWS.
          </p>
          <p>AWS Certified Cloud Practitioner · CompTIA A+ · CompTIA Network+</p>
          <p>AWS Solutions Architect study in progress.</p>
        </section>
      </div>
    </main>
  );
}
