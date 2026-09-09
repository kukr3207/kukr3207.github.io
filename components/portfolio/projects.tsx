import { ArrowRight, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { projects, type Project } from '@/lib/projects';
import { Header, Footer } from './chrome';
import { Doodle } from './doodle';
import { career } from '@/lib/career';
import { ArchitectureFigure, ProjectEvidence } from './project-evidence';

export function ProjectFlow({ project }: { project: Project }) {
  return (
    <ol
      className="project-flow"
      aria-label={`High-level workflow for ${project.title}`}
    >
      {project.flow.map((step, index) => (
        <li key={step}>
          <span className="flow-number">0{index + 1}</span>
          <span>{step}</span>
          {index < 3 && <ArrowRight size={17} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
export function ProjectCards({ items = projects }: { items?: Project[] }) {
  return (
    <div className="project-showcase-grid">
      {items.map((project, index) => (
        <a
          key={project.slug}
          className={`project-showcase-card project-tone-${index % 3}`}
          href={`/projects/${project.slug}/`}
        >
          <div className="project-card-top">
            <span className="project-category">{project.category}</span>
            <span className="project-index">0{index + 1}</span>
          </div>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          {project.impact && (
            <div className="project-metric">
              <strong>{project.impact.value}</strong>
              <span>{project.impact.label}</span>
            </div>
          )}
          <span className="project-company-context">
            {project.company} · Production experience
          </span>
          <div className="project-card-bottom">
            <div className="tags">
              {project.stack.slice(0, 3).map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <span className="project-read">
              Read deep dive <ArrowUpRight size={17} />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
export function ProjectIndex() {
  return (
    <div className="wrap">
      <Header />
      <main id="main">
        <section className="project-index-intro illustrated-intro">
          <div>
            <a className="text-link" href="/">
              <ArrowLeft size={15} /> Back to portfolio
            </a>
            <div className="eyebrow">ENGINEERING FIELDNOTES</div>
            <h1>
              Architecture teardowns
              <br />
              <span className="hand">& deep dives.</span>
            </h1>
            <p>
              The engineering challenges behind production retrieval, agent
              workflows and applied machine learning. Explore the architecture,
              reported impact and companion evaluation examples.
            </p>
          </div>
          <Doodle kind="builder" />
        </section>
        <ProjectCards />
        <section className="project-contact">
          <span className="hand">Have a similar problem?</span>
          <a className="action" href="mailto:udaykiran.kondreddy@gmail.com">
            Let’s talk about it <ArrowUpRight size={17} />
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
export function ProjectDetail({ project }: { project: Project }) {
  const employer = career.find((role) => role.name === project.company);
  return (
    <div className="wrap">
      <Header />
      <main id="main">
        <section className="project-detail-intro">
          <a
            className="text-link"
            href={employer ? `/experience/${employer.slug}/` : '/projects/'}
          >
            <ArrowLeft size={15} />{' '}
            {employer ? `${employer.name} projects` : 'All deep dives'}
          </a>
          <div className="project-detail-meta">
            <span className="eyebrow">
              {project.company} / {project.category}
            </span>
            <span className="project-context">Production experience</span>
          </div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          <div className="tags">
            {project.stack.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>
        <section className="project-system-view">
          <div className="labelline">
            <span className="eyebrow">SYSTEM OVERVIEW</span>
            <div className="system-annotation">
              <span className="hand">the pieces, connected.</span>
              <Doodle kind="explainer" />
            </div>
          </div>
          <ArchitectureFigure project={project} />
        </section>
        <section className="project-detail-body">
          <div>
            <span className="eyebrow">THE PROBLEM</span>
            <h2>Where the work started.</h2>
            <p>{project.problem}</p>
          </div>
          <div>
            <span className="eyebrow">MY CONTRIBUTION</span>
            <h2>What I built.</h2>
            <ul className="project-contributions">
              {project.contributions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
        {project.engineering && (
          <section
            className="project-engineering"
            aria-labelledby="engineering-title"
          >
            <span className="eyebrow">ENGINEERING APPROACH</span>
            <h2 id="engineering-title">How the system comes together.</h2>
            <div className="engineering-grid">
              {project.engineering.map((part, index) => (
                <article key={part.title}>
                  <span className="hand engineering-step">0{index + 1}</span>
                  <h3>{part.title}</h3>
                  <p className="engineering-technology">{part.technology}</p>
                  <p>{part.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        <section className="project-outcome">
          <span className="eyebrow">THE RESULT</span>
          {project.impact && (
            <div className="project-metric">
              <strong>{project.impact.value}</strong>
              <span>{project.impact.label}</span>
            </div>
          )}
          <h2>{project.outcome}</h2>
          <p>
            Selected work from my engineering role at {project.company}.
            {project.impact
              ? ' Impact figures are reported from this work; the companion examples below use synthetic data.'
              : ''}
          </p>
        </section>
        <ProjectEvidence project={project} />
        <section className="project-contact">
          <a className="text-link" href="/projects/">
            Explore more projects <ArrowRight size={17} />
          </a>
          <a
            className="action"
            href={`mailto:udaykiran.kondreddy@gmail.com?subject=${encodeURIComponent(`Let’s discuss ${project.title}`)}`}
          >
            Discuss this project <ArrowUpRight size={17} />
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
