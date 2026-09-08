'use client';
import { useState } from 'react';
import { ArrowUpRight, ArrowRight, Plus, Check, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
const engagements = [
  {
    name: 'G2i',
    mark: 'g2i',
    role: 'AI evaluation & benchmark engineering',
    type: 'Evaluation engineering',
    description:
      'Three areas of contract work spanning task design, comparative model evaluation and the maintainability of generated code.',
    bullets: [
      'Long-horizon coding benchmarks — Design repository-scale tasks, reference implementations and behavioral verifiers. Analyze model trajectories to separate implementation failures from specification, grading and environment issues.',
      'Reference solutions and model evaluation — Refine reference patches, check benchmark coverage and reproduce candidate solutions in controlled environments. Compare correctness, repository compatibility and code quality using documented evidence.',
      'Generated-code maintainability — Review patches against the requested change and existing architecture. Validate automated findings and document unnecessary complexity, duplication, weak tests and other maintenance concerns.',
    ],
    link: '/case-studies/verifier-design/',
    label: 'Explore an independent verifier example',
    pending: false,
  },
  {
    name: 'Expertquery',
    mark: 'eq',
    role: 'Feature-task engineering',
    type: 'Task authoring',
    description:
      'Feature-oriented coding tasks built around clear requirements, executable tests and validated reference solutions.',
    bullets: [
      'Translate feature requirements into a bounded implementation task.',
      'Develop automated checks and validate reference behavior.',
      'Resolve ambiguity and incorporate quality-review feedback.',
    ],
    link: '/case-studies/verifier-design/',
    label: 'Read the verifier fieldnote',
    pending: false,
  },
  {
    name: 'Alignerr',
    mark: 'a',
    role: 'Contract engagement',
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
    role: 'Contract engagement',
    type: 'Project notes forthcoming',
    description:
      'A place for selected Toptal project notes. Responsibilities, dates and outcomes will be added after review.',
    bullets: [],
    link: null,
    label: null,
    pending: true,
  },
];
const roles = [
  {
    name: 'Netskope',
    role: 'Senior Developer · AI & Automation',
    focus: 'Production RAG and agent systems',
    detail:
      'LangGraph, Neo4j and CopilotKit workflows; Python services, Docker and deployments on GCP.',
  },
  {
    name: 'ServiceNow',
    role: 'Machine Learning Engineer',
    focus: 'Enterprise AI and incident automation',
    detail:
      'Retrieval pipelines and agent workflows for incident investigation, context gathering and operational automation.',
  },
  {
    name: 'SWYM',
    role: 'Software Engineer',
    focus: 'Recommendations and commerce analytics',
    detail:
      'Recommendation pipelines on Databricks and Spark, with Streamlit tools for exploring commerce data.',
  },
  {
    name: 'Synopsys',
    role: 'Technical Engineer · Machine Learning',
    focus: 'Applied ML and data systems',
    detail:
      'Anomaly detection, NLP workflows, experiment tracking and data engineering for internal systems.',
  },
];
export function Experience() {
  const [open, setOpen] = useState<number | null>(null);
  const item = open === null ? null : engagements[open];
  return (
    <section id="experience" className="section experience-section">
      <div className="section-header">
        <div>
          <div className="eyebrow">02 / SELECTED EXPERIENCE</div>
          <h2>
            Building, testing.
            <br />
            And doing it again.
          </h2>
        </div>
        <p>
          Production engineering and contract work across applied AI and model
          evaluation.
        </p>
      </div>
      <Tabs defaultValue="contracts">
        <TabsList className="experience-tabs">
          <TabsTrigger value="contracts">Contract engagements</TabsTrigger>
          <TabsTrigger value="production">Production engineering</TabsTrigger>
        </TabsList>
        <TabsContent value="contracts">
          <div className="contract-grid">
            {engagements.map((e, i) => (
              <button
                key={e.name}
                className="contract-card"
                onClick={() => setOpen(i)}
              >
                <div className="contract-card-top">
                  <span className={`contract-mark mark-${i}`}>{e.mark}</span>
                  <ArrowUpRight size={19} />
                </div>
                <span className="contract-type">{e.type}</span>
                <h3>{e.name}</h3>
                <p>{e.role}</p>
                <span className="contract-more">
                  {e.pending ? 'View placeholder' : 'View engagement'}{' '}
                  <Plus size={14} />
                </span>
              </button>
            ))}
          </div>
          <div className="evaluation-practice">
            <span className="eyebrow">HOW I EVALUATE MODELS</span>
            <h3>Prompt. Compare. Follow through.</h3>
            <p>
              Design an open-ended engineering prompt, then compare two models’
              outputs and execution trajectories. Write rubrics and
              evidence-based rationales, and develop follow-up prompts that test
              whether each model can sustain progress over an extended session.
            </p>
          </div>
          <p className="engagement-note">
            Experience summaries only. The experiments on this site are
            independently created teaching examples, not client deliverables.
          </p>
        </TabsContent>
        <TabsContent value="production">
          <Accordion className="career-list">
            {roles.map((r) => (
              <AccordionItem value={r.name} key={r.name} className="career-row">
                <AccordionTrigger>
                  <span>
                    <strong>{r.name}</strong>
                    <small>{r.role}</small>
                  </span>
                  <span>{r.focus}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p>{r.detail}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
      <Dialog
        open={open !== null}
        onOpenChange={(v) => {
          if (!v) setOpen(null);
        }}
      >
        <DialogContent className="engagement-dialog">
          <DialogHeader>
            <span className="eyebrow">CONTRACT ENGAGEMENT</span>
            <DialogTitle>{item?.name}</DialogTitle>
            <DialogDescription>{item?.role}</DialogDescription>
          </DialogHeader>
          <p>{item?.description}</p>
          {item?.bullets.length ? (
            <ul>
              {item.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <div className="placeholder-note">
              <span className="hand">Notes to come.</span>
              <p>
                This section is reserved for project details that Uday will add.
              </p>
            </div>
          )}
          {item?.link && (
            <a href={item.link} className="action secondary">
              {item.label} <ArrowRight size={16} />
            </a>
          )}
        </DialogContent>
      </Dialog>
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
