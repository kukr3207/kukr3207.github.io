'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The PDF scroll region must be focusable for keyboard scrolling. */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

function PdfPage({
  pdf,
  pageNumber,
  register,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  register: (element: HTMLElement | null) => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const canvasContainer = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<PDFPageProxy | null>(null);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    pdf
      .getPage(pageNumber)
      .then((result) => {
        if (!cancelled) setPage(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const intersection = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { root: element.closest('.pdf-reader-scroll'), rootMargin: '600px 0px' },
    );
    const resize = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    intersection.observe(element);
    resize.observe(element);
    return () => {
      intersection.disconnect();
      resize.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = canvasContainer.current;
    if (!page || !visible || !width || !container) return;
    let cancelled = false;
    let task: RenderTask | undefined;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Page ${pageNumber}`);
    container.replaceChildren(canvas);
    const base = page.getViewport({ scale: 1 });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2, 2400 / width);
    const viewport = page.getViewport({
      scale: (width * pixelRatio) / base.width,
    });
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    async function render() {
      try {
        await Promise.resolve();
        if (cancelled) return;
        setReady(false);
        setFailed(false);
        task = page!.render({ canvas, viewport });
        await task.promise;
        if (!cancelled) {
          setReady(true);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void render();
    return () => {
      cancelled = true;
      task?.cancel();
      canvas.remove();
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [page, pageNumber, visible, width]);

  const viewport = page?.getViewport({ scale: 1 });
  return (
    <figure className="pdf-reader-page" ref={register} data-page={pageNumber}>
      <div
        className="pdf-reader-paper"
        ref={frame}
        style={{
          aspectRatio: viewport
            ? `${viewport.width} / ${viewport.height}`
            : '1',
        }}
      >
        <div ref={canvasContainer} className="pdf-reader-canvas" />
        {failed ? (
          <div className="pdf-page-status">
            This page could not load. You can download the PDF above.
          </div>
        ) : (
          (!ready || !visible) && (
            <output className="pdf-page-status">
              Loading page {pageNumber}…
            </output>
          )
        )}
      </div>
      <figcaption>
        Page {pageNumber} of {pdf.numPages}
      </figcaption>
    </figure>
  );
}

function DocumentPages({
  pdf,
  title,
}: {
  pdf: PDFDocumentProxy;
  title: string;
}) {
  const scroll = useRef<HTMLElement>(null);
  const pages = useRef(new Map<number, HTMLElement>());
  const currentPage = useRef(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [availableWidth, setAvailableWidth] = useState(0);

  function goToPage(target: number) {
    const number = Math.max(1, Math.min(pdf.numPages, target));
    const element = pages.current.get(number);
    const container = scroll.current;
    if (!element || !container) return;
    container.scrollTo({
      top:
        container.scrollTop +
        element.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        12,
      behavior: 'instant',
    });
    currentPage.current = number;
    setPageNumber(number);
  }

  useEffect(() => {
    const container = scroll.current;
    if (!container) return;
    const resize = new ResizeObserver(([entry]) =>
      setAvailableWidth(Math.round(entry.contentRect.width)),
    );
    resize.observe(container);
    let frame = 0;
    function updatePage() {
      frame = 0;
      const top = container!.getBoundingClientRect().top + 32;
      let next = 1;
      for (const [number, element] of pages.current) {
        if (element.getBoundingClientRect().top <= top) next = number;
      }
      if (
        container!.scrollTop + container!.clientHeight >=
        container!.scrollHeight - 2
      )
        next = pdf.numPages;
      currentPage.current = next;
      setPageNumber(next);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(updatePage);
    }
    container.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      container.removeEventListener('scroll', schedule);
    };
  }, [pdf.numPages]);

  useLayoutEffect(() => {
    const container = scroll.current;
    const element = pages.current.get(currentPage.current);
    if (container && element) {
      container.scrollTop +=
        element.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        12;
    }
  }, [zoom]);

  return (
    <div className="pdf-reader-workspace">
      <div className="pdf-reader-controls">
        <fieldset className="pdf-control-group">
          <legend className="sr-only">Page navigation</legend>
          <button
            type="button"
            aria-label="Previous page"
            disabled={pageNumber === 1}
            onClick={() => goToPage(pageNumber - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <label>
            Page{' '}
            <select
              aria-label="Go to page"
              value={pageNumber}
              onChange={(event) => goToPage(Number(event.target.value))}
            >
              {Array.from({ length: pdf.numPages }, (_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <span>of {pdf.numPages}</span>
          </label>
          <button
            type="button"
            aria-label="Next page"
            disabled={pageNumber === pdf.numPages}
            onClick={() => goToPage(pageNumber + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </fieldset>
        <fieldset className="pdf-control-group">
          <legend className="sr-only">Document zoom</legend>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoom === 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
          >
            <Minus size={17} />
          </button>
          <select
            aria-label="Zoom level"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            <option value={1}>Fit width</option>
            {[1.25, 1.5, 1.75, 2].map((value) => (
              <option key={value} value={value}>
                {value * 100}%
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoom === 2}
            onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
          >
            <Plus size={17} />
          </button>
        </fieldset>
      </div>
      <section
        ref={scroll}
        className="pdf-reader-scroll"
        tabIndex={0}
        aria-label={`${title}, PDF pages`}
      >
        <div
          className="pdf-reader-pages"
          style={{
            width: availableWidth
              ? Math.min(880, availableWidth) * zoom
              : '100%',
          }}
        >
          {Array.from({ length: pdf.numPages }, (_, index) => (
            <PdfPage
              key={index}
              pdf={pdf}
              pageNumber={index + 1}
              register={(element) => {
                if (element) pages.current.set(index + 1, element);
                else pages.current.delete(index + 1);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function PdfReader({ url, title }: { url: string; title: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let loadingTask:
      | ReturnType<typeof import('pdfjs-dist').getDocument>
      | undefined;
    async function load() {
      try {
        const engine = await import('pdfjs-dist');
        if (cancelled) return;
        const assets = `/pdfjs/${engine.version}/`;
        engine.GlobalWorkerOptions.workerSrc = `${assets}pdf.worker.min.mjs`;
        loadingTask = engine.getDocument({
          url,
          cMapUrl: `${assets}cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `${assets}standard_fonts/`,
          wasmUrl: `${assets}wasm/`,
        });
        const document = await loadingTask.promise;
        if (!cancelled) setPdf(document);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
      void loadingTask?.destroy().catch(() => {});
    };
  }, [url, attempt]);

  if (failed)
    return (
      <div className="pdf-reader-message" role="alert">
        <p>This PDF could not load.</p>
        <p>Try again or download the PDF using the link above.</p>
        <button
          className="action"
          type="button"
          onClick={() => {
            setPdf(null);
            setFailed(false);
            setAttempt((value) => value + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  if (!pdf)
    return (
      <div className="pdf-reader-message" aria-live="polite">
        <span className="hand">Opening your fieldnotes…</span>
        <p>Loading the document</p>
      </div>
    );
  return <DocumentPages key={`${url}-${attempt}`} pdf={pdf} title={title} />;
}
