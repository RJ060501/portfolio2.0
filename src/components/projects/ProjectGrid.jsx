'use client';

import { useEffect, useState } from 'react';
import { projects } from '@/content/projects';
import ProjectCard from './ProjectCard';

const CATEGORIES = ['All work', 'Systems & security', 'Cloud & AI', 'Development'];
const PAGE_SIZE = 4;

function readLocation() {
  const params = new URLSearchParams(window.location.search);
  const chosen = params.get('category');
  const page = Number(params.get('page'));
  return {
    category: CATEGORIES.includes(chosen) ? chosen : 'All work',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export default function ProjectGrid({ featured = false }) {
  const [category, setCategory] = useState('All work');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (featured) return;
    const sync = () => {
      const next = readLocation();
      setCategory(next.category);
      setPage(next.page);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [featured]);

  function navigate(nextPage, nextCategory) {
    const max = Math.max(1, Math.ceil(projects.filter(
      (project) => nextCategory === 'All work' || project.category === nextCategory,
    ).length / PAGE_SIZE));
    const safePage = Math.max(1, Math.min(max, nextPage));
    setPage(safePage);
    setCategory(nextCategory);
    const url = new URL(window.location.href);
    if (safePage === 1) url.searchParams.delete('page');
    else url.searchParams.set('page', String(safePage));
    if (nextCategory === 'All work') url.searchParams.delete('category');
    else url.searchParams.set('category', nextCategory);
    window.history.pushState(null, '', url);
    document.getElementById('project-list')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  const filtered = featured ? projects.slice(0, 4) : projects.filter(
    (project) => category === 'All work' || project.category === category,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = featured ? filtered : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div id="project-list">
      {!featured && (
        <div className="filters" aria-label="Filter projects">
          {CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => navigate(1, option)}
              className={category === option ? 'selected' : ''}
            >
              {option}
              {option === 'All work' && <span>{String(projects.length).padStart(2, '0')}</span>}
            </button>
          ))}
        </div>
      )}
      <div className="projectgrid">
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      {!featured && (
        <>
          <div className="pagination" aria-label="Project pages">
            <button type="button" disabled={currentPage === 1} onClick={() => navigate(currentPage - 1, category)}>
              ← Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                className={currentPage === index + 1 ? 'current' : ''}
                aria-current={currentPage === index + 1 ? 'page' : undefined}
                aria-label={`Page ${index + 1} of ${totalPages}`}
                onClick={() => navigate(index + 1, category)}
              >
                {index + 1}
              </button>
            ))}
            <button type="button" disabled={currentPage === totalPages} onClick={() => navigate(currentPage + 1, category)}>
              Next →
            </button>
          </div>
          <p className="resultcount" role="status">
            Showing {filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} projects · Page {currentPage} of {totalPages}. Interactive demos are labeled separately from original work.
          </p>
        </>
      )}
    </div>
  );
}
