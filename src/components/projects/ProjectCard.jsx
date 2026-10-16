import Link from 'next/link';
import ProjectArtwork from './ProjectArtwork';

export default function ProjectCard({ project }) {
  const projectUrl = `/projects/${project.slug}/`;
  const artworkType =
    project.slug === 'terraform-aws-ec2'
      ? 'terraform'
      : project.demo || (project.slug === 'video-explorer' ? 'video' : 'terminal');

  return (
    <article className="project">
      <Link className="artlink" href={projectUrl} aria-label={`Explore ${project.name}`}>
        <ProjectArtwork type={artworkType} />
        <span className="artoverlay">Explore project ↗</span>
      </Link>
      <div className="projectmeta">
        <span>
          {project.number} / {project.tag}
        </span>
        <span>{project.demo ? 'INTERACTIVE PREVIEW' : 'CASE STUDY'}</span>
      </div>
      <h3>
        <Link href={projectUrl}>
          {project.name}
          <span>↗</span>
        </Link>
      </h3>
      <p>{project.summary}</p>
      <div className="tags">
        {project.stack.map((technology) => (
          <span key={technology}>{technology}</span>
        ))}
      </div>
    </article>
  );
}
