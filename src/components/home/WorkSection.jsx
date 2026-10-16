import Link from 'next/link';
import ProjectGrid from '@/components/projects/ProjectGrid';

export default function WorkSection() {
  return (
    <section className="wrap section" id="work">
      <div className="sectionhead">
        <div>
          <div className="eyebrow">01 / FEATURED PROJECTS</div>
          <h2>
            Less theory.
            <br />
            <em>More building.</em>
          </h2>
        </div>
        <p>
          Four projects across security, cloud, APIs, and algorithms.
          <br className="desktop" /> See every case study in the dedicated work archive.
        </p>
      </div>
      <ProjectGrid featured />
      <div className="workmore">
        <Link href="/work/" className="button secondary">
          Browse all 8 projects →
        </Link>
      </div>
    </section>
  );
}
