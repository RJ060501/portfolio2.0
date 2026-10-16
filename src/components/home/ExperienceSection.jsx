import Link from 'next/link';
import { experience } from '@/content/experience';
export default function ExperienceSection() {
  return (
    <section id="experience" className="wrap section experience">
      <div className="sectionhead">
        <div>
          <div className="eyebrow">03 / THE PATH SO FAR</div>
          <h2>
            Built on
            <br />
            <em>hands-on experience.</em>
          </h2>
        </div>
        <Link className="textlink" href="/resume/">
          The full résumé ↗
        </Link>
      </div>
      {experience.map((position, index) => (
        <div className="experiencerow" key={position.company}>
          <span className="experiencedate">{position.date}</span>
          <div>
            <span className="company">{position.company}</span>
            <h3>{position.title}</h3>
          </div>
          <p>{position.text}</p>
          <span className="expnumber">0{index + 1}</span>
        </div>
      ))}
      <div className="certrow">
        <span>FOUNDATIONS & CONTINUED LEARNING</span>
        <div>
          <span>AWS Cloud Practitioner</span>
          <span>CompTIA A+</span>
          <span>CompTIA Network+</span>
          <span>AWS Solutions Architect study</span>
        </div>
      </div>
    </section>
  );
}
