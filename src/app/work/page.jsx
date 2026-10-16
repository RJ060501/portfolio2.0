import ProjectGrid from '@/components/projects/ProjectGrid';

export const metadata = {
  title: 'All Projects',
  description: 'Browse eight hands-on projects in security monitoring, APIs, Terraform, cloud, troubleshooting, and algorithms.',
};

export default function WorkPage() {
  return (
    <main id="main" className="wrap innerpage">
      <div className="eyebrow">PROJECT LIBRARY / CASE STUDIES & DEMOS</div>
      <h1>Selected <em>work.</em></h1>
      <p className="innerintro">Browse the full collection by discipline. Use the page controls to explore each project, its engineering decisions, and any playable or interactive demos.</p>
      <ProjectGrid />
    </main>
  );
}
