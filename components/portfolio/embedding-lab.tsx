'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, ArrowUpRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import {
  createVectors,
  vectorGroups,
  vectorPosition,
  cosine,
} from '@/lib/demo-engine';
export function EmbeddingLab({ compact = false }: { compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    angle = useRef({ x: 0.32, y: 0.25 }),
    drag = useRef<{ x: number; y: number } | null>(null),
    projected = useRef<{ id: number; x: number; y: number }[]>([]);
  const [separation, setSeparation] = useState(0.7),
    [group, setGroup] = useState(0),
    [rotating, setRotating] = useState(false),
    [zoom, setZoom] = useState(1),
    [selected, setSelected] = useState<number | null>(null),
    [supported, setSupported] = useState(true);
  const points = useMemo(() => createVectors(600), []);
  const nearest = useMemo(
    () =>
      points
        .map((p) => ({
          id: p.id,
          group: p.group,
          score: cosine(
            vectorPosition(p, separation),
            vectorGroups[group].center,
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [points, separation, group],
  );
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      if (media.matches) setRotating(false);
    };
    media.addEventListener('change', stop);
    return () => media.removeEventListener('change', stop);
  }, []);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) {
      const fallback = requestAnimationFrame(() => setSupported(false));
      return () => cancelAnimationFrame(fallback);
    }
    let frame = 0,
      previous = 0,
      width = 1,
      height = 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = el.clientWidth;
      height = el.clientHeight;
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    const render = (time: number) => {
      const delta = Math.min(time - previous, 32);
      previous = time;
      if (rotating && !drag.current) angle.current.y += delta * 0.00013;
      ctx.clearRect(0, 0, width, height);
      const sx = Math.sin(angle.current.x),
        cx = Math.cos(angle.current.x),
        sy = Math.sin(angle.current.y),
        cy = Math.cos(angle.current.y),
        scale = Math.min(width, height) * 0.3 * zoom;
      const project = (p: number[]) => {
        const x = p[0] * cy + p[2] * sy,
          z = -p[0] * sy + p[2] * cy,
          y = p[1] * cx - z * sx,
          zz = p[1] * sx + z * cx,
          perspective = 3.7 / (3.7 + zz);
        return {
          x: width / 2 + x * scale * perspective,
          y: height / 2 + y * scale * perspective,
          z: zz,
          perspective,
        };
      };
      ctx.strokeStyle = '#ffffff10';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const a = project([i * 0.35, 0.8, -1.4]),
          b = project([i * 0.35, 0.8, 1.4]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const c = project([-1.4, 0.8, i * 0.35]),
          d = project([1.4, 0.8, i * 0.35]);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      const dots = points
        .map((p) => ({ ...p, ...project(vectorPosition(p, separation)) }))
        .sort((a, b) => b.z - a.z);
      projected.current = dots.map((p) => ({ id: p.id, x: p.x, y: p.y }));
      const nearIds = new Set(nearest.map((p) => p.id));
      dots.forEach((p) => {
        const active = p.group === group;
        ctx.globalAlpha = active ? 0.8 : 0.26;
        ctx.fillStyle = vectorGroups[p.group].color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (active ? 2 : 1.65) * p.perspective, 0, Math.PI * 2);
        ctx.fill();
        if ((nearIds.has(p.id) && !compact) || p.id === selected) {
          ctx.globalAlpha = 0.8;
          ctx.strokeStyle = vectorGroups[p.group].color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      const query = project(vectorGroups[group].center);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(query.x - 6, query.y);
      ctx.lineTo(query.x + 6, query.y);
      ctx.moveTo(query.x, query.y - 6);
      ctx.lineTo(query.x, query.y + 6);
      ctx.stroke();
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [points, separation, group, rotating, zoom, selected, nearest, compact]);
  const chosen = selected === null ? null : points[selected];
  return (
    <div className={`embedding-lab ${compact ? 'compact' : ''}`}>
      <div className="vector-view">
        <div className="vector-topline">
          <span>
            <span className="live-dot" /> VECTOR PLAYGROUND
          </span>
          <span>600 synthetic vectors</span>
        </div>
        {supported ? (
          <canvas
            ref={canvas}
            role="img"
            aria-label="Rotatable 3D plot of synthetic vectors in Access, Billing and Reliability clusters. Numerical nearest-neighbor results are available alongside the plot."
            tabIndex={0}
            onKeyDown={(e) => {
              if (
                ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
                  e.key,
                )
              ) {
                e.preventDefault();
                setRotating(false);
                angle.current[
                  e.key === 'ArrowLeft' || e.key === 'ArrowRight' ? 'y' : 'x'
                ] += e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -0.1 : 0.1;
              }
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              angle.current.y += (e.clientX - drag.current.x) * 0.006;
              angle.current.x += (e.clientY - drag.current.y) * 0.006;
              drag.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              drag.current = null;
              e.currentTarget.releasePointerCapture(e.pointerId);
              const rect = e.currentTarget.getBoundingClientRect();
              const p = projected.current
                .map((p) => ({
                  ...p,
                  d: Math.hypot(
                    p.x - (e.clientX - rect.left),
                    p.y - (e.clientY - rect.top),
                  ),
                }))
                .sort((a, b) => a.d - b.d)[0];
              if (p && p.d < 14) setSelected(p.id);
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          />
        ) : (
          <p className="canvas-fallback">
            This browser cannot display the canvas. The controls and numerical
            neighbor results remain available.
          </p>
        )}
        <div className="vector-bottomline">
          <span>
            {chosen
              ? `Selected: document ${String(chosen.id).padStart(3, '0')} · ${vectorGroups[chosen.group].name}`
              : 'Drag or use arrow keys to rotate'}
          </span>
          <div>
            <button
              className="vector-button"
              aria-label={rotating ? 'Pause rotation' : 'Start rotation'}
              onClick={() => setRotating(!rotating)}
            >
              {rotating ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="vector-button"
              aria-label="Reset plot"
              onClick={() => {
                angle.current = { x: 0.32, y: 0.25 };
                setZoom(1);
                setSeparation(0.7);
                setGroup(0);
                setSelected(null);
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="vector-controls">
        <span className="eyebrow">03 / THE INTERACTIVE LAB</span>
        <h2>
          Find a little
          <br />
          <span className="hand">common ground.</span>
        </h2>
        <p>
          Move the clusters. Change the query. See which vectors become
          neighbors.
        </p>
        <div className="group-picker">
          <span
            id={compact ? 'compact-query-label' : 'query-label'}
            className="query-label"
          >
            Query direction
          </span>
          <RadioGroup
            value={String(group)}
            onValueChange={(v) => setGroup(Number(v))}
            aria-labelledby={compact ? 'compact-query-label' : 'query-label'}
          >
            {vectorGroups.map((g, i) => (
              <label
                htmlFor={`${compact ? 'compact' : 'full'}-query-${i}`}
                key={g.name}
                className={group === i ? 'active' : ''}
              >
                <RadioGroupItem
                  id={`${compact ? 'compact' : 'full'}-query-${i}`}
                  value={String(i)}
                />
                <span style={{ background: g.color }} />
                {g.name}
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="slider-label">
          <span id={compact ? 'compact-separation' : 'separation'}>
            Cluster separation
          </span>
          <output>{Math.round(separation * 100)}%</output>
        </div>
        <Slider
          aria-labelledby={compact ? 'compact-separation' : 'separation'}
          value={[separation * 100]}
          onValueChange={(v) =>
            setSeparation((Array.isArray(v) ? v[0] : v) / 100)
          }
          min={0}
          max={100}
          step={1}
        />
        {!compact && (
          <>
            <div className="slider-label">
              <span id="zoom-label">Zoom</span>
              <output>{zoom.toFixed(1)}×</output>
            </div>
            <Slider
              aria-labelledby="zoom-label"
              value={[zoom]}
              onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
              min={0.6}
              max={1.5}
              step={0.1}
            />
            <div className="nearest-list">
              <span className="small-heading">
                NEAREST BY COSINE SIMILARITY
              </span>
              {nearest.map((n, i) => (
                <button key={n.id} onClick={() => setSelected(n.id)}>
                  <span>
                    {i + 1}. Document {String(n.id).padStart(3, '0')}
                  </span>
                  <strong>{n.score.toFixed(3)}</strong>
                </button>
              ))}
            </div>
          </>
        )}
        {compact ? (
          <a href="/lab/embeddings/" className="text-link">
            Open the full experiment <ArrowUpRight size={16} />
          </a>
        ) : null}
        <p className="vector-disclosure">
          Illustrative 3D coordinates, not real text embeddings. Proximity alone
          does not establish relevance or correctness.
        </p>
      </div>
    </div>
  );
}
