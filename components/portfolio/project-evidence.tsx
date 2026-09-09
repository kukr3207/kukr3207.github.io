/* oxlint-disable next/no-img-element -- Architecture SVGs are local, downloadable static assets. */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Wide diagrams need a focusable scroll region for keyboard users. */
import { ArrowUpRight, Download } from 'lucide-react';
import architecture from '@/content/architecture.json';
import type { Project } from '@/lib/projects';

const samples: Record<string, { file: string; label: string }> = {
  'enterprise-knowledge-retrieval': {
    file: 'retrieval',
    label: 'Precision, recall and reciprocal rank for retrieved evidence',
  },
  'incident-intelligence': {
    file: 'incident-triage',
    label: 'Classification accuracy, coverage and abstentions',
  },
  'commerce-recommendations': {
    file: 'recommendations',
    label: 'Ranking quality for recommended products',
  },
  'inventory-revenue-analytics': {
    file: 'inventory',
    label: 'Absolute and squared error for numeric estimates',
  },
  'support-anomaly-detection': {
    file: 'anomaly-detection',
    label: 'Classification accuracy and coverage for alert labels',
  },
  'support-sentiment-analysis': {
    file: 'sentiment',
    label: 'Classification accuracy and coverage for sentiment labels',
  },
};

export function ArchitectureFigure({ project }: { project: Project }) {
  const diagram = architecture[project.slug as keyof typeof architecture];
  if (!diagram) return null;
  return (
    <figure className="architecture-figure">
      <div
        className="architecture-canvas"
        tabIndex={0}
        aria-label={`${project.title}, scrollable architecture diagram`}
      >
        <img
          src={`/architecture/${project.slug}.svg`}
          width={1200}
          height={140 + diagram.rows.length * 184 + 220}
          loading="lazy"
          alt={diagram.rows
            .map((row) =>
              row.map((node) => `${node[0]} (${node[1]})`).join(' + '),
            )
            .join(' → ')}
        />
      </div>
      <figcaption>
        <p>
          A public sketch of the documented components and workflow. Internal
          interfaces are omitted.
        </p>
        <a
          className="text-link"
          href={`/architecture/${project.slug}.svg`}
          download
        >
          <Download size={16} /> Download full-resolution SVG
        </a>
      </figcaption>
    </figure>
  );
}

export function ProjectEvidence({ project }: { project: Project }) {
  const sample = samples[project.slug];
  if (!sample && !project.reference) return null;
  return (
    <section className="project-evidence" aria-labelledby="evidence-title">
      <span className="eyebrow">CODE & EVALUATION</span>
      <h2 id="evidence-title">Inspect the work behind the explanation.</h2>
      {project.reference && (
        <article className="project-reference">
          <h3>Library used in this project</h3>
          <p>{project.reference.description}</p>
          <a
            className="text-link"
            href={project.reference.url}
            target="_blank"
            rel="noreferrer"
          >
            {project.reference.label} <ArrowUpRight size={17} />
          </a>
        </article>
      )}
      {sample && (
        <article className="benchmark-example">
          <span className="example-label">SYNTHETIC COMPANION EXAMPLE</span>
          <h3>{sample.label}</h3>
          <p>
            A new, runnable example that scores saved predictions against
            expected outputs. It uses fictional data and illustrates evaluation
            mechanics; it does not reproduce the production system or
            substantiate the impact figures above.
          </p>
          <pre>
            <code>{`python3 evaluate_outputs.py ${sample.file}.json report.json`}</code>
          </pre>
          <div className="evidence-actions">
            <a
              className="action"
              href="/artifacts/evaluation-companion.zip"
              download
            >
              <Download size={16} /> Download runnable examples
            </a>
            <a
              className="text-link"
              href="/artifacts/evaluation/evaluate_outputs.txt"
              target="_blank"
              rel="noreferrer"
            >
              Read the script <ArrowUpRight size={16} />
            </a>
            <a
              className="text-link"
              href={`/artifacts/evaluation/sample-reports/${sample.file}-report.json`}
              download
            >
              Sample report <Download size={16} />
            </a>
          </div>
          <p className="evidence-requirements">
            Python 3.10+ · Standard library only · Includes fixtures, metric
            definitions and tests
          </p>
        </article>
      )}
    </section>
  );
}
