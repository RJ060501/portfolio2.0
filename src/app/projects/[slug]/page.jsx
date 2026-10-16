import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/content/projects';
import Demo from '@/components/projects/ProjectDemo';
import ProjectArt from '@/components/projects/ProjectArtwork';
export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);
  return {
    title: project?.name || 'Project',
    description: project?.summary,
  };
}
export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = projects.find((project) => project.slug === slug);
  if (!project) notFound();
  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <main id="main" className="wrap detailpage">
      <Link className="backlink" href="/work/">
        ← Back to selected work
      </Link>
      <div className="eyebrow">
        PROJECT {project.number} / {project.category}
      </div>
      <h1>
        {project.name}
        <span className="accent">.</span>
      </h1>
      <p className="detailsummary">{project.summary}</p>
      <div className="detailmeta">
        <div>
          <small>MY ROLE</small>
          <span>{project.role}</span>
        </div>
        <div>
          <small>STATUS</small>
          <span>{project.status}</span>
        </div>
        <div>
          <small>TOOLKIT</small>
          <span>{project.stack.join(' / ')}</span>
        </div>
      </div>
      <div className="projectactions">
        {project.demo && (
          <a className="button primary" href="#demo">
            {project.demo === 'snake' ? 'Play the game' : 'Try the preview'} ↓
          </a>
        )}
        {project.repo && (
          <a className="button secondary" href={project.repo} target="_blank" rel="noreferrer">
            {project.repoLabel || 'View source ↗'}
          </a>
        )}
        {project.video && (
          <a className="textlink" href={project.video} target="_blank" rel="noreferrer">
            Watch original walkthrough ↗
          </a>
        )}
      </div>
      <div className="storygrid">
        <div className="storylabel">
          THE THINKING
          <br />
          BEHIND THE WORK ↘
        </div>
        <div>
          <section>
            <h2>The problem</h2>
            <p>{project.problem}</p>
          </section>
          <section>
            <h2>My approach</h2>
            <p>{project.approach}</p>
          </section>
          <section>
            <h2>What this demonstrates</h2>
            <p>{project.outcome}</p>
          </section>
          <section>
            <h2>What comes next</h2>
            <p>{project.next}</p>
          </section>
        </div>
      </div>
      {project.slug === 'snake' && (
        <aside className="algorithmnotes" aria-label="Algorithm design notes">
          <h2>What the game loop proves</h2>
          <p>At every tick, the engine computes a new head position in O(1), checks collision against the body in O(n), and returns a fresh immutable state. Reversal rules avoid invalid 180° turns; food is sampled only from free cells. Node tests cover movement, growth, body collisions, wall collisions, and immutability.</p>
          <p>The original Snake was a Python project. This interactive game uses a separate, tested JavaScript implementation so the same ideas work directly in your browser.</p>
        </aside>
      )}
      {project.demo ? (
        <section id="demo" className="demosection">
          <div className="eyebrow">EXPLORE THE INTERACTION</div>
          <h2>{project.demo === 'snake' ? 'Your turn.' : 'Try it for yourself.'}</h2>
          <p className="demonote">{project.note}</p>
          <Demo type={project.demo} />
        </section>
      ) : (
        <section className="casevisual">
          <ProjectArt
            type={
              project.slug === 'video-explorer'
                ? 'video'
                : project.slug === 'terraform-aws-ec2'
                  ? 'terraform'
                  : 'terminal'
            }
          />
          <p className="demonote">{project.note}</p>
        </section>
      )}
      <Link className="nextproject" href={'/projects/' + nextProject.slug + '/'}>
        <span>
          <small>NEXT PROJECT</small>
          <strong>{nextProject.name}</strong>
        </span>
        <span>↗</span>
      </Link>
    </main>
  );
}
