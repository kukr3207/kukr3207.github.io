'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { Doodle } from './doodle';
import { career } from '@/lib/career';
import { projects } from '@/lib/projects';
const engagements = [
  {
    name: 'G2i',
    mark: 'g2i',
    role: 'AI evaluation & benchmark engineering',
    type: 'Evaluation engineering',
    description:
      'Three areas of freelance work spanning task design, comparative model evaluation and the maintainability of generated code.',
    bullets: [
      'Long-horizon coding benchmarks — Design repository-scale tasks, reference implementations and behavioral verifiers. Analyze model trajectories to separate implementation failures from specification, grading and environment issues.',
      'Reference solutions and model evaluation — Refine reference patches, check benchmark coverage and reproduce candidate solutions in controlled environments. Compare correctness, repository compatibility and code quality using documented evidence.',
      'Generated-code maintainability — Review patches against the requested change and existing architecture. Validate automated findings and document unnecessary complexity, duplication, weak tests and other maintenance concerns.',
    ],
    link: '/case-studies/verifier-design/',
    label: 'Read the work overview',
    pending: false,
  },
  {
    name: 'Expertquery',
    mark: 'eq',
    role: 'Software-engineering task authoring',
    type: 'Task authoring',
    description:
      'Realistic features, fixes and enhancements built around behavioral requirements, reference implementations and held-out tests in reproducible environments.',
    bullets: [
      'Define self-contained requirements through public inputs, outputs, errors and edge cases.',
      'Develop reference implementations and separate held-out behavioral tests.',
      'Check baseline failures, reference passes and existing regression coverage.',
      'Prepare reproducible environments and refine tasks using validation and review feedback.',
    ],
    link: '/case-studies/verifier-design/',
    label: 'Read the work overview',
    pending: false,
  },
  {
    name: 'Alignerr',
    mark: 'a',
    role: 'Freelance engagement',
    type: 'Project notes forthcoming',
    description:
      'A place for selected Alignerr project notes. Responsibilities, dates and outcomes will be added after review.',
    bullets: [],
    link: null,
    label: null,
    pending: true,
  },
  {
    name: 'Toptal',
    mark: 't',
    role: 'Freelance engagement',
    type: 'Project notes forthcoming',
    description:
      'A place for selected Toptal project notes. Responsibilities, dates and outcomes will be added after review.',
    bullets: [],
    link: null,
    label: null,
    pending: true,
  },
];
export function Experience() {
  return (
    <section
      id="experience"
      className="section experience-section"
      aria-labelledby="experience-title"
    >
      <div className="section-header">
        <div>
          <div className="eyebrow">01 / PROFESSIONAL EXPERIENCE</div>
          <h2 id="experience-title">
            AI systems,
            <br />
            <span className="hand" style={{ color: 'var(--primary)' }}>
              in production.
            </span>
          </h2>
        </div>
        <div className="section-aside">
          <Doodle kind="builder" />
          <p>
            Professional experience across enterprise AI, automation,
            recommendations and applied machine learning.
          </p>
        </div>
      </div>
      <span id="projects" className="section-anchor" />
      <span id="case-studies" className="section-anchor" />
      <ol className="career-timeline">
        {career.map((role) => {
          const count = projects.filter(
            (project) => project.company === role.name,
          ).length;
          return (
            <li key={role.slug}>
              <div className="career-dates">{role.dates}</div>
              <a className="career-entry" href={`/experience/${role.slug}/`}>
                <div className="career-entry-heading">
                  <div>
                    <h3>{role.name}</h3>
                    <p className="career-role">{role.role}</p>
                  </div>
                  <ArrowUpRight size={22} aria-hidden="true" />
                </div>
                <p className="career-focus">{role.focus}</p>
                <span className="career-explore">
                  Explore {count} {count === 1 ? 'project' : 'projects'} &
                  architecture notes{' '}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
export function FreelanceExperience() {
  return (
    <section
      id="contracting"
      className="section contracts-secondary"
      aria-labelledby="contracts-title"
    >
      <div className="contracts-heading">
        <div>
          <span className="eyebrow">02 / FREELANCE EXPERIENCE</span>
          <h2 id="contracts-title">Freelance & evaluation work.</h2>
        </div>
        <p>
          Selected engagements in coding benchmarks, model evaluation and task
          design.
        </p>
      </div>
      <div className="contract-grid">
        {engagements.map((e, i) => (
          <article key={e.name} className="contract-card static-engagement">
            <div className="contract-card-top">
              <span className={`contract-mark mark-${i}`}>{e.mark}</span>
            </div>
            <span className="contract-type">{e.type}</span>
            <h3>{e.name}</h3>
            <p>{e.role}</p>
            <p className="contract-summary">{e.description}</p>
            {e.link && (
              <a className="text-link" href={e.link}>
                {e.label} <ArrowUpRight size={15} />
              </a>
            )}
          </article>
        ))}
      </div>
      <div className="evaluation-practice illustrated-evaluation">
        <div>
          <span className="eyebrow">HOW I EVALUATE MODELS</span>
          <h3>Prompt. Compare. Follow through.</h3>
          <p>
            Design an open-ended engineering prompt, then compare two models’
            outputs and execution trajectories. Write rubrics and evidence-based
            rationales, and develop follow-up prompts that test whether each
            model can sustain progress over an extended session.
          </p>
          <a className="text-link" href="/case-studies/verifier-design/">
            Read the evaluation work overview <ArrowUpRight size={16} />
          </a>
        </div>
        <Doodle kind="explainer" />
      </div>
      <p className="engagement-note">
        High-level summaries of engineering responsibilities across these
        engagements.
      </p>
    </section>
  );
}
export function Contact() {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText('udaykiran.kondreddy@gmail.com');
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(true);
    }
  }
  return (
    <section className="contact-band" id="contact">
      <div className="contact-intro">
        <Doodle kind="explainer" />
        <div>
          <span className="eyebrow">GOOD QUESTIONS WELCOME</span>
          <h2>
            Let’s compare <span className="hand">notes.</span>
          </h2>
          <p>
            Working through a retrieval problem, an agent workflow, or an
            evaluation that doesn’t quite add up?
          </p>
        </div>
      </div>
      <div className="contact-actions">
        <a
          href="mailto:udaykiran.kondreddy@gmail.com?subject=Let%E2%80%99s%20compare%20AI%20engineering%20notes"
          className="action"
        >
          Start a conversation <ArrowUpRight size={17} />
        </a>
        <button className="text-link" onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}{' '}
          {copied ? 'Email copied' : 'Copy email address'}
        </button>
        <output className="copy-status">
          {error
            ? 'udaykiran.kondreddy@gmail.com'
            : copied
              ? 'Ready to paste.'
              : ''}
        </output>
      </div>
    </section>
  );
}
