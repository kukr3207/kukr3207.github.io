'use client';

/* oxlint-disable next/no-img-element -- PDF covers are static assets; the site has no image optimization server. */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The reader's scroll region must receive keyboard focus for arrow and Page Down scrolling. */

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  Search,
  X,
} from 'lucide-react';
import initialCatalog from '@/lib/learning-catalog.json';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { PdfReader } from './pdf-reader';
import { Doodle } from './doodle';
import {
  groupLearningDocuments,
  seriesDescription,
  seriesAnchor,
  type LearningDocument,
  type LearningSeries,
} from '@/lib/learning-series';

function isLearningCatalog(
  value: unknown,
): value is { schemaVersion: 1; documents: LearningDocument[] } {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { schemaVersion?: number; documents?: unknown };
  return (
    candidate.schemaVersion === 1 &&
    Array.isArray(candidate.documents) &&
    candidate.documents.every((item) => {
      if (!item || typeof item !== 'object') return false;
      const doc = item as LearningDocument;
      return (
        typeof doc.id === 'string' &&
        typeof doc.filename === 'string' &&
        typeof doc.series === 'string' &&
        doc.series.trim().length > 0 &&
        (doc.lesson === null ||
          (Number.isInteger(doc.lesson) && doc.lesson > 0)) &&
        typeof doc.title === 'string' &&
        typeof doc.summary === 'string' &&
        Array.isArray(doc.topics) &&
        doc.topics.every((topic) => typeof topic === 'string') &&
        (doc.pages === null ||
          (Number.isInteger(doc.pages) && doc.pages > 0)) &&
        typeof doc.bytes === 'number' &&
        Number.isFinite(doc.bytes) &&
        doc.bytes >= 0 &&
        doc.url === `/learning/${encodeURIComponent(doc.filename)}` &&
        /\.pdf$/i.test(doc.filename) &&
        !/[\\/]/.test(doc.filename) &&
        (doc.coverVariants === undefined ||
          (Array.isArray(doc.coverVariants) &&
            doc.coverVariants.every(
              (variant) =>
                variant &&
                typeof variant.url === 'string' &&
                /^\/learning\/covers\/thumbnails\/[^/]+\.webp$/.test(
                  variant.url,
                ) &&
                Number.isInteger(variant.width) &&
                variant.width > 0 &&
                Number.isInteger(variant.height) &&
                variant.height > 0,
            ))) &&
        (doc.cover === null ||
          (typeof doc.cover === 'string' &&
            /^\/learning\/covers\/[^/]+\.(png|jpe?g|webp)$/i.test(doc.cover)))
      );
    })
  );
}

function useLearningDocuments() {
  const [documents, setDocuments] = useState<LearningDocument[]>(
    initialCatalog.documents,
  );
  useEffect(() => {
    const controller = new AbortController();
    let running = false;
    const refresh = async () => {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      try {
        const response = await fetch('/learning/catalog.json', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const catalog: unknown = await response.json();
        if (isLearningCatalog(catalog) && !controller.signal.aborted)
          setDocuments(catalog.documents);
      } catch {
        // The exported collection remains readable if refresh is unavailable.
      } finally {
        running = false;
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return documents;
}

function ModuleCard({ module }: { module: LearningDocument }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openReader = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    setOpen(true);
  };
  const size =
    module.bytes >= 1_000_000
      ? `${(module.bytes / 1_000_000).toFixed(1)} MB`
      : `${Math.max(1, Math.round(module.bytes / 1000))} KB`;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <article className="learning-card" data-series={module.series}>
        <button
          className="learning-cover"
          type="button"
          onClick={openReader}
          aria-haspopup="dialog"
          aria-label={`Read ${module.title}`}
        >
          {module.cover ? (
            <img
              src={
                module.coverVariants?.find((variant) => variant.width >= 640)
                  ?.url ??
                module.coverVariants?.[0]?.url ??
                module.cover
              }
              srcSet={
                module.coverVariants
                  ?.map((variant) => `${variant.url} ${variant.width}w`)
                  .join(', ') || undefined
              }
              sizes="(max-width: 520px) calc(100vw - 44px), (max-width: 760px) calc((100vw - 62px) / 2), (max-width: 1180px) calc((100vw - 112px) / 3), 355px"
              alt={`Original cover: ${module.title}`}
              width={650}
              height={650}
              loading="lazy"
            />
          ) : (
            <div className="learning-cover-fallback">
              <BookOpen size={34} strokeWidth={1.4} />
              <span className="hand">{module.title}</span>
              <span>AI FIELDNOTES / PDF</span>
            </div>
          )}
        </button>
        <div className="learning-card-body">
          <div className="learning-card-meta">
            <span>
              {module.series}{' '}
              {module.lesson !== null
                ? `/ ${String(module.lesson).padStart(2, '0')}`
                : '/ FIELDNOTE'}
            </span>
            <span>
              {module.pages ? `${module.pages} pages · ` : ''}
              {size}
            </span>
          </div>
          <h4>
            <button
              className="learning-title-button"
              type="button"
              onClick={openReader}
              aria-haspopup="dialog"
            >
              {module.title}
            </button>
          </h4>
          {module.summary && <p>{module.summary}</p>}
          {module.topics.length > 0 && (
            <div className="tags">
              {module.topics.slice(0, 3).map((topic) => (
                <span className="tag" key={topic}>
                  {topic}
                </span>
              ))}
            </div>
          )}
          <div className="learning-card-actions">
            <button
              className="text-link"
              type="button"
              onClick={openReader}
              aria-haspopup="dialog"
              aria-label={`Read ${module.title}`}
            >
              Read module <BookOpen size={16} />
            </button>
            <a
              className="learning-download"
              href={module.url}
              download={module.filename}
              aria-label={`Download ${module.title} PDF`}
            >
              <Download size={16} /> PDF
            </a>
          </div>
        </div>
      </article>
      <DialogContent
        className="pdf-reader-dialog"
        showCloseButton={false}
        initialFocus={closeRef}
        finalFocus={triggerRef}
      >
        <div className="pdf-reader-toolbar">
          <div className="pdf-reader-heading">
            <span className="eyebrow">
              {module.series} /{' '}
              {module.lesson !== null
                ? `LESSON ${String(module.lesson).padStart(2, '0')}`
                : 'FIELDNOTE'}
            </span>
            <DialogTitle className="pdf-reader-title">
              {module.title}
            </DialogTitle>
            <DialogDescription className="pdf-reader-hint">
              Scroll to read · Press Esc to close
            </DialogDescription>
          </div>
          <a
            className="learning-download pdf-reader-download"
            href={module.url}
            download={module.filename}
            aria-label={`Download ${module.title} PDF`}
          >
            <Download size={17} />
            <span>Download PDF</span>
          </a>
          <DialogClose
            ref={closeRef}
            className="pdf-reader-close"
            aria-label="Close PDF reader"
            title="Close (Esc)"
          >
            <X size={23} />
          </DialogClose>
        </div>
        {open && (
          <PdfReader key={module.url} url={module.url} title={module.title} />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LearningPreview() {
  const documents = useLearningDocuments();
  const groups = groupLearningDocuments(documents);
  return (
    <section className="section learning-preview" id="learning">
      <div className="section-header">
        <div>
          <div className="eyebrow">03 / LEARNING & CONTENT CREATION</div>
          <h2>
            Complex ideas. <span className="hand">Drawn simply.</span>
          </h2>
        </div>
        <div className="section-aside">
          <Doodle kind="reader" />
          <p>
            I turn AI engineering concepts into visual lessons. Explore my
            growing collection on generative AI, agents and the systems behind
            them.
          </p>
        </div>
      </div>
      <div className="learning-shelf-heading">
        <span className="learning-count">
          <BookOpen size={16} /> {documents.length}{' '}
          {documents.length === 1 ? 'learning module' : 'learning modules'}
        </span>
        <a className="text-link" href="/learning/">
          Explore the library <ArrowRight size={16} />
        </a>
      </div>
      <div className="learning-series-grid">
        {groups.map((group) => (
          <a
            key={group.name}
            className="learning-series-card"
            data-series={group.name}
            href={`/learning/#${seriesAnchor(group.name)}`}
          >
            <SeriesCardContent group={group} />
          </a>
        ))}
      </div>
      <LinkedInFollow />
    </section>
  );
}

export function LearningLibrary() {
  const documents = useLearningDocuments();
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const groups = groupLearningDocuments(documents);
  const activeSeries = groups.some((group) => group.name === selectedSeries)
    ? selectedSeries
    : null;
  const visibleGroups = groupLearningDocuments(documents, activeSeries, query);
  const resultCount = visibleGroups.reduce(
    (total, group) => total + group.documents.length,
    0,
  );
  const totalPages = documents.reduce(
    (total, module) => total + (module.pages || 0),
    0,
  );
  const allPagesKnown =
    documents.length > 0 && documents.every((module) => module.pages !== null);
  return (
    <>
      <section className="learning-intro">
        <div>
          <a className="text-link" href="/">
            <ArrowLeft size={15} /> Back to portfolio
          </a>
          <div className="eyebrow">LEARNING & CONTENT CREATION</div>
          <h1>
            AI, made clear.
            <br />
            <span className="hand">One idea at a time.</span>
          </h1>
          <p>
            Visual lessons on generative AI and agentic systems. Start with the
            fundamentals, explore a topic, or follow a series from the first
            lesson.
          </p>
          <div className="learning-byline">
            <span className="learning-author-mark">u.</span>
            <span>
              Written & illustrated by Uday Kondreddy
              <br />
              <span className="learning-handle">@learn.machinelearning</span>
            </span>
          </div>
          <LinkedInFollow />
        </div>
        <aside
          className="learning-library-note"
          aria-label="About this collection"
        >
          <Doodle kind="reader" className="library-note-doodle" />
          <span className="hand">learn it. sketch it. share it.</span>
          <div className="learning-total" aria-live="polite">
            <strong>{documents.length}</strong>
            <span>
              visual learning
              <br />
              {documents.length === 1 ? 'module' : 'modules'}
            </span>
          </div>
          <p>
            {groups.length} learning series to explore.
            <br />
            Read at your own pace.
            <br />
            New lessons added as I create them.
          </p>
          {allPagesKnown && (
            <span className="learning-page-total">
              {totalPages} pages of ideas, diagrams & examples
            </span>
          )}
        </aside>
      </section>
      <section
        className="learning-paths"
        aria-labelledby="learning-paths-title"
      >
        <div className="learning-shelf-heading">
          <h2 id="learning-paths-title">Choose a learning path</h2>
          <span>Foundations first. Deeper systems next.</span>
        </div>
        <div className="learning-series-grid">
          {groups.map((group) => (
            <button
              key={group.name}
              className="learning-series-card"
              type="button"
              data-series={group.name}
              aria-pressed={activeSeries === group.name}
              onClick={() =>
                setSelectedSeries(
                  activeSeries === group.name ? null : group.name,
                )
              }
            >
              <SeriesCardContent group={group} />
            </button>
          ))}
        </div>
      </section>
      <section
        className="learning-collection"
        aria-labelledby="collection-title"
      >
        <div className="learning-shelf-heading">
          <h2 id="collection-title">The collection</h2>
          <span aria-live="polite">
            {resultCount} {resultCount === 1 ? 'module' : 'modules'}
            {activeSeries
              ? ` in ${activeSeries}`
              : ` across ${groups.length} series`}
          </span>
        </div>
        <div className="learning-library-controls">
          <fieldset className="learning-series-filters">
            <legend className="sr-only">Filter learning series</legend>
            <button
              type="button"
              aria-pressed={activeSeries === null}
              onClick={() => setSelectedSeries(null)}
            >
              All series <span>{documents.length}</span>
            </button>
            {groups.map((group) => (
              <button
                key={group.name}
                type="button"
                aria-pressed={activeSeries === group.name}
                onClick={() => setSelectedSeries(group.name)}
              >
                {group.name} <span>{group.documents.length}</span>
              </button>
            ))}
          </fieldset>
          <label className="learning-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search lessons by title or topic</span>
            <input
              type="search"
              placeholder="Search a title or topic…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <section
              className="learning-series-section"
              id={seriesAnchor(group.name)}
              key={group.name}
              aria-label={`${group.name} modules`}
            >
              <div className="learning-series-heading">
                <h3>{group.name}</h3>
                <span>
                  {group.documents.length}{' '}
                  {group.documents.length === 1 ? 'module' : 'modules'}
                </span>
              </div>
              <div className="learning-grid">
                {group.documents.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="learning-empty">
            <BookOpen size={28} />
            <h3>
              {documents.length
                ? 'No lessons found.'
                : 'New lessons are on their way.'}
            </h3>
            <p>
              {documents.length
                ? 'Try another topic or browse the full collection.'
                : 'New modules will appear here as they are published.'}
            </p>
            {documents.length > 0 && (
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedSeries(null);
                }}
              >
                Show all lessons <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </section>
      <section className="project-contact">
        <span className="hand">From explaining systems to building them.</span>
        <a className="action" href="/projects/">
          Explore my engineering work <ArrowRight size={17} />
        </a>
      </section>
    </>
  );
}

function LinkedInFollow() {
  return (
    <a
      className="action secondary learning-linkedin"
      href="https://www.linkedin.com/in/udaykondreddy/"
      target="_blank"
      rel="noreferrer"
    >
      Follow the daily breakdowns on LinkedIn{' '}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}

function SeriesCardContent({ group }: { group: LearningSeries }) {
  const cover = group.documents[0]?.cover;
  const thumbnail = group.documents[0]?.coverVariants?.[0]?.url;
  return (
    <>
      {cover && (
        <img
          className="learning-series-cover"
          src={thumbnail ?? cover}
          alt=""
          width={120}
          height={120}
          loading="lazy"
        />
      )}
      <span className="learning-series-copy">
        <span className="eyebrow">
          {group.documents.length}{' '}
          {group.documents.length === 1 ? 'MODULE' : 'MODULES'}
        </span>
        <span className="learning-series-name">{group.name}</span>
        <span className="learning-series-description">
          {seriesDescription(group.name)}
        </span>
        <span className="learning-series-link">
          Explore series <ArrowRight size={15} />
        </span>
      </span>
    </>
  );
}
