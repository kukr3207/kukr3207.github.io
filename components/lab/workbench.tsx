'use client';
import { useEffect, useState } from 'react';
import {
  Plus,
  Download,
  ArrowRight,
  LockKeyhole,
  Play,
  RefreshCw,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { requirements, taskSpec, fixtureCases } from '@/lib/evaluation-fixture';
import type { LabSession, LabStatus, ModelTrajectory } from '@/lib/lab-types';
import { labFetch, Picker, ModelResult, CheckEvidence } from './shared';

type SessionSummary = Pick<LabSession, 'id' | 'title' | 'updatedAt'>;
function tokenTotal(trajectory: ModelTrajectory) {
  return trajectory.turns.reduce(
    (sum, turn) =>
      sum + (turn.response?.usage.total ?? turn.failureUsage?.total ?? 0),
    0,
  );
}
export function EvaluationWorkbench() {
  const [status, setStatus] = useState<LabStatus | null>(null),
    [sessions, setSessions] = useState<SessionSummary[]>([]),
    [session, setSession] = useState<LabSession | null>(null);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(''),
    [tab, setTab] = useState('design');
  const [task, setTask] = useState(taskSpec),
    [reference, setReference] = useState(''),
    [confirmed, setConfirmed] = useState(false);
  const [models, setModels] = useState(['oc/mimo-v2.5-free', 'oc/big-pickle']);
  const [followup, setFollowup] = useState(
      'Review your implementation against the task. Check boundary cases and input preservation. Return a complete revised solution.py.',
    ),
    [findings, setFindings] = useState('');
  const [human, setHuman] = useState<LabSession['human']>({
      rubric: '',
      rationale: '',
      evidenceNotes: '',
      qualityDecisions: '',
    }),
    [target, setTarget] = useState(1000000);
  async function refresh() {
    const [health, list] = await Promise.all([
      labFetch<LabStatus>('status'),
      labFetch<SessionSummary[]>('sessions'),
    ]);
    setStatus(health);
    setSessions(list);
    return list;
  }
  function select(next: LabSession) {
    setSession(next);
    setTask(next.task);
    setReference(next.reference);
    setHuman(next.human);
    setTarget(next.tokenTarget);
    setConfirmed(false);
  }
  useEffect(() => {
    let live = true;
    Promise.all([
      labFetch<LabStatus>('status'),
      labFetch<SessionSummary[]>('sessions'),
    ])
      .then(async ([health, list]) => {
        if (!live) return;
        setStatus(health);
        setSessions(list);
        if (list.length) {
          const saved = await labFetch<LabSession>(`sessions/${list[0].id}`);
          if (live) select(saved);
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, []);
  async function action(name: string, extra: Record<string, unknown> = {}) {
    if (!session) return;
    setBusy(name);
    setError('');
    try {
      const next = await labFetch<LabSession>(`sessions/${session.id}`, {
        action: name,
        ...extra,
      });
      setSession(next);
      if (name === 'save_task') setConfirmed(false);
      await refresh();
      return next;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  async function create() {
    setBusy('create');
    setError('');
    try {
      await persistDrafts();
      select(await labFetch<LabSession>('sessions', {}));
      setTab('design');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  async function load(id: string) {
    setBusy('load');
    setError('');
    try {
      await persistDrafts();
      select(await labFetch<LabSession>(`sessions/${id}`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  async function persistDrafts() {
    if (!session) return;
    let saved = session;
    if (task !== session.task || reference !== session.reference) {
      saved = await labFetch<LabSession>(`sessions/${session.id}`, {
        action: 'save_task',
        task,
        reference,
      });
      setSession(saved);
    }
    if (
      JSON.stringify(human) !== JSON.stringify(saved.human) ||
      target !== saved.tokenTarget
    ) {
      saved = await labFetch<LabSession>(`sessions/${session.id}`, {
        action: 'save_human',
        human,
        tokenTarget: target,
      });
      setSession(saved);
    }
    return saved;
  }
  async function download() {
    if (!session) return;
    setBusy('export');
    setError('');
    try {
      const saved = await persistDrafts();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(saved, null, 2)], {
          type: 'application/json',
        }),
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `evaluation-${session.id}.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  }
  const disabled = Boolean(busy),
    connected = Boolean(status?.gatewayReachable),
    dirty = Boolean(
      session && (task !== session.task || reference !== session.reference),
    );
  return (
    <section className="evaluation-workbench" aria-labelledby="workbench-title">
      <div className="workbench-heading">
        <div>
          <span className="eyebrow">EVALUATION NOTEBOOK / 04</span>
          <h1 id="workbench-title">Build. Run. Inspect.</h1>
          <p>
            Task design, model trajectories and the evidence behind a decision.
          </p>
        </div>
        <span className="hand">the checks need checking, too.</span>
      </div>
      <div className="lab-toolbar">
        <div className="lab-row">
          <span className={`lab-status ${connected ? 'connected' : ''}`}>
            {connected ? '● OmniRoute connected' : '○ OmniRoute offline'}
          </span>
          <span className="lab-status">
            {status?.verification ? 'Runner ready' : 'Runner unavailable'}
          </span>
          <span className="lab-meta">
            {status
              ? `${status.dailyRequests}/${status.dailyLimit} requests today`
              : 'Local sessions'}
          </span>
        </div>
        <button
          className="text-button"
          disabled={disabled}
          onClick={() => {
            setError('');
            refresh().catch((e) => setError(e.message));
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="lab-session-bar">
        <Picker
          label="Saved session"
          value={session?.id || ''}
          items={sessions.map((s) => ({
            id: s.id,
            label: s.title + ' · ' + s.id.slice(0, 6),
          }))}
          onChange={load}
          disabled={disabled || sessions.length === 0}
        />
        <button className="action" onClick={create} disabled={disabled}>
          <Plus size={16} /> New session
        </button>
        <button
          className="action secondary"
          onClick={download}
          disabled={!session || disabled}
        >
          <Download size={16} /> Save & export evidence
        </button>
      </div>
      {error && (
        <p className="lab-notice error-text" role="alert">
          {error}
        </p>
      )}
      {busy && (
        <output className="lab-notice">
          {busy.replaceAll('_', ' ')}…{' '}
          {['compare', 'follow_up', 'quality', 'audit'].includes(busy)
            ? 'Free models can take up to 90 seconds.'
            : ''}
        </output>
      )}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(String(v))}
        className="lab-tabs"
      >
        <TabsList aria-label="Evaluation workflow">
          <TabsTrigger value="design">01 Task design</TabsTrigger>
          <TabsTrigger value="reference">02 Reference & checks</TabsTrigger>
          <TabsTrigger value="compare">03 Model trajectories</TabsTrigger>
          <TabsTrigger value="quality">04 Human review</TabsTrigger>
        </TabsList>
        <TabsContent value="design">
          <div className="workbench-grid">
            <div className="lab-panel">
              <div className="lab-row">
                <h2>The task</h2>
                <span className="lab-meta">Original Python exercise</span>
              </div>
              <label className="field-label" htmlFor="lab-task">
                Observable behavior
              </label>
              <textarea
                id="lab-task"
                rows={12}
                value={task}
                readOnly={!session || Boolean(session.lock) || disabled}
                onChange={(e) => setTask(e.target.value)}
                maxLength={30000}
              />
              <p className="muted">
                Revise the wording within this fixture’s scope. Its 16 checks
                stay fixed; inspect coverage before locking.
              </p>
              <div className="lab-actions">
                <button
                  className="action secondary"
                  disabled={
                    !session || disabled || Boolean(session.lock) || !dirty
                  }
                  onClick={() => action('save_task', { task, reference })}
                >
                  Save task & reference
                </button>
                <button
                  className="action"
                  disabled={!session || disabled || !connected || dirty}
                  onClick={() => action('audit', { model: models[0] })}
                >
                  Audit coverage <ArrowRight size={15} />
                </button>
              </div>
              {session?.taskAudit && <ModelResult result={session.taskAudit} />}
            </div>
            <div className="lab-panel">
              <h2>Requirement → evidence</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Checks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <strong>{r.id}</strong> {r.text}
                      </TableCell>
                      <TableCell>{r.checks.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <details>
                <summary>Inspect all 16 fixtures</summary>
                <pre>{JSON.stringify(fixtureCases, null, 2)}</pre>
              </details>
              <p className="lab-note">
                This is a practice task built from scratch. It contains no
                client benchmark, rubric or deliverable.
              </p>
              {!session && (
                <button className="action" onClick={create} disabled={disabled}>
                  Create a working copy <Plus size={15} />
                </button>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reference">
          <div className="workbench-grid">
            <div className="lab-panel">
              <h2>Reference implementation</h2>
              <label htmlFor="lab-reference" className="field-label">
                solution.py
              </label>
              <textarea
                className="code-editor"
                id="lab-reference"
                rows={19}
                value={reference}
                readOnly={!session || Boolean(session.lock) || disabled}
                onChange={(e) => setReference(e.target.value)}
                spellCheck={false}
              />
              <div className="lab-actions">
                <button
                  className="action secondary"
                  disabled={
                    !session || disabled || Boolean(session.lock) || !dirty
                  }
                  onClick={() => action('save_task', { task, reference })}
                >
                  Save changes
                </button>
                <button
                  className="action"
                  disabled={
                    !session || disabled || dirty || Boolean(session.lock)
                  }
                  onClick={() => action('verify_reference')}
                >
                  <Play size={15} /> Run starter + reference
                </button>
              </div>
              <p className="muted">
                Each run uses the same pinned Python image, with no network and
                a read-only filesystem.
              </p>
            </div>
            <div className="lab-panel">
              <h2>Lock the evidence</h2>
              <CheckEvidence
                report={session?.baselineCheck}
                label="Unimplemented starter"
              />
              <CheckEvidence
                report={session?.referenceCheck}
                label="Reference"
              />
              {session?.lock ? (
                <div className="lab-lock">
                  <LockKeyhole size={18} />
                  <div>
                    <strong>Reference locked</strong>
                    <code className="lab-hash">{session.lock.digest}</code>
                    <p>
                      Candidate results will use this task, check set and
                      runner. Start a new session to change the reference.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <label className="lab-checkbox" htmlFor="confirm-coverage">
                    <Checkbox
                      id="confirm-coverage"
                      checked={confirmed}
                      onCheckedChange={setConfirmed}
                      disabled={!session || disabled}
                    />
                    <span>
                      I reviewed the task and fixtures, and accept this coverage
                      for the comparison.
                    </span>
                  </label>
                  <button
                    className="action"
                    disabled={
                      !session ||
                      disabled ||
                      dirty ||
                      !confirmed ||
                      session.referenceCheck?.status !== 'passed' ||
                      session.baselineCheck?.status !== 'failed'
                    }
                    onClick={async () => {
                      const next = await action('lock', {
                        coverageConfirmed: confirmed,
                      });
                      if (next) setTab('compare');
                    }}
                  >
                    <LockKeyhole size={15} /> Lock reference
                  </button>
                </>
              )}
              <p className="lab-note">
                A passing fixture set is bounded evidence. It does not establish
                complete correctness or resistance to a hostile candidate.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="compare">
          <div className="lab-panel comparison-controls">
            <div>
              <h2>Two models. Separate histories.</h2>
              <p>
                Both receive the same task and follow-up. Neither sees the
                other’s output or the reference.
              </p>
            </div>
            <div className="lab-row">
              {[0, 1].map((i) => (
                <Picker
                  key={i}
                  label={`Model ${i === 0 ? 'A' : 'B'}`}
                  value={session?.trajectories[i]?.requestedModel || models[i]}
                  items={status?.models || []}
                  disabled={disabled || Boolean(session?.trajectories.length)}
                  onChange={(value) =>
                    setModels((current) =>
                      current.map((m, j) => (i === j ? value : m)),
                    )
                  }
                />
              ))}
            </div>
            <div className="lab-actions">
              <button
                className="action"
                disabled={
                  !session?.lock ||
                  disabled ||
                  !connected ||
                  Boolean(session.trajectories.length)
                }
                onClick={() => action('compare', { models })}
              >
                <Play size={15} /> Run both models
              </button>
              <button
                className="action secondary"
                disabled={!session?.trajectories.length || disabled}
                onClick={() => action('verify_candidates')}
              >
                Check latest candidates
              </button>
              {!session?.lock && (
                <span className="muted">Lock the reference first.</span>
              )}
            </div>
          </div>
          <div className="workbench-grid">
            {(session?.trajectories.length
              ? session.trajectories
              : ([
                  { id: 'A', requestedModel: models[0], turns: [] },
                  { id: 'B', requestedModel: models[1], turns: [] },
                ] as ModelTrajectory[])
            ).map((trajectory) => (
              <div className="lab-panel trajectory" key={trajectory.id}>
                <div className="lab-row">
                  <h2>Model {trajectory.id}</h2>
                  <span className="lab-status">
                    {tokenTotal(trajectory).toLocaleString()} reported tokens
                  </span>
                </div>
                <p className="lab-meta">{trajectory.requestedModel}</p>
                {trajectory.turns.length === 0 ? (
                  <p className="trajectory-empty">
                    The first response will appear here.
                  </p>
                ) : (
                  trajectory.turns.map((turn, index) => (
                    <details
                      key={turn.id}
                      open={index === trajectory.turns.length - 1}
                    >
                      <summary>
                        Turn {index + 1} ·{' '}
                        {turn.error
                          ? 'request failed'
                          : turn.checks?.status.replaceAll('_', ' ') ||
                            'not checked'}
                      </summary>
                      <p className="lab-prompt">{turn.prompt}</p>
                      {turn.error && (
                        <p className="error-text">
                          {turn.error}{' '}
                          {turn.failureUsage?.total !== null &&
                          turn.failureUsage?.total !== undefined
                            ? `${turn.failureUsage.total} reported tokens.`
                            : 'Usage unreported.'}
                        </p>
                      )}
                      {turn.response && (
                        <>
                          <div className="lab-meta">
                            <span>{turn.response.model}</span>
                            {turn.response.settings && (
                              <span>
                                temperature {turn.response.settings.temperature}{' '}
                                · output cap{' '}
                                {turn.response.settings.maxOutputTokens} ·
                                reasoning{' '}
                                {turn.response.settings.reasoningEffort ??
                                  'provider default'}
                              </span>
                            )}
                            <span>
                              {turn.response.usage.total === null
                                ? 'Usage unreported'
                                : `${turn.response.usage.input ?? '?'} input + ${turn.response.usage.output ?? '?'} output`}
                            </span>
                          </div>
                          {turn.response.finishReason === 'length' && (
                            <p className="lab-note">
                              The response reached its output limit and may be
                              incomplete.
                            </p>
                          )}
                          <pre>{turn.code || turn.response.text}</pre>
                          <CheckEvidence
                            label="Behavioral evidence"
                            report={turn.checks}
                          />
                          <button
                            className="text-button"
                            onClick={() => {
                              setHuman((h) => ({
                                ...h,
                                evidenceNotes:
                                  h.evidenceNotes +
                                  `\nModel ${trajectory.id}, turn ${index + 1} (${turn.id}): `,
                              }));
                              setTab('quality');
                            }}
                          >
                            Bookmark in review <ArrowRight size={14} />
                          </button>
                        </>
                      )}
                    </details>
                  ))
                )}
              </div>
            ))}
          </div>
          <div className="lab-panel">
            <label className="field-label" htmlFor="followup">
              Next shared follow-up
            </label>
            <textarea
              id="followup"
              rows={3}
              maxLength={8000}
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
            />
            <div className="lab-actions">
              <button
                className="action"
                disabled={
                  !session?.trajectories.length ||
                  disabled ||
                  !connected ||
                  !followup.trim()
                }
                onClick={() => action('follow_up', { prompt: followup })}
              >
                Send to both models <ArrowRight size={15} />
              </button>
              <span className="muted">
                Manual runs only · target{' '}
                {session?.tokenTarget.toLocaleString() || '1,000,000'} tokens
                per model
              </span>
            </div>
            <p className="lab-note">
              The ledger adds provider-reported input and output usage across
              turns, including repeated context. Unreported usage is unknown. A
              target can be crossed by the final response; this is not a
              guaranteed allowance or a context-window size.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="quality">
          <div className="workbench-grid">
            <div className="lab-panel">
              <h2>Code-quality review</h2>
              <p>
                Inspect added lines, check proposed findings and separate
                maintainability from correctness.
              </p>
              <label className="field-label" htmlFor="proposed-findings">
                Proposed findings to validate (optional)
              </label>
              <textarea
                id="proposed-findings"
                rows={4}
                value={findings}
                maxLength={8000}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Line, issue and reason…"
              />
              <div className="lab-actions">
                {['A', 'B'].map((candidate) => (
                  <button
                    key={candidate}
                    className="action secondary"
                    disabled={
                      !session?.trajectories
                        .find((t) => t.id === candidate)
                        ?.turns.at(-1)?.code ||
                      disabled ||
                      !connected
                    }
                    onClick={() =>
                      action('quality', {
                        candidate,
                        findings,
                        model: models[0],
                      })
                    }
                  >
                    Review model {candidate}
                  </button>
                ))}
              </div>
              {session?.qualityReviews.map((review, i) => (
                <details key={i} open={i === session.qualityReviews.length - 1}>
                  <summary>
                    Model {review.candidate} · {review.turnId.slice(0, 8)}
                  </summary>
                  <ModelResult result={review.analysis} />
                  <details>
                    <summary>Inputs used for this review</summary>
                    <pre>{JSON.stringify(review.input, null, 2)}</pre>
                  </details>
                </details>
              ))}
            </div>
            <div className="lab-panel human-review">
              <h2>Your judgment</h2>
              <p>
                These fields remain yours. Model suggestions never fill in a
                final score, ranking or rationale.
              </p>
              {(
                [
                  ['rubric', 'Evaluation rubric'],
                  ['evidenceNotes', 'Evidence bookmarks'],
                  ['qualityDecisions', 'Accepted / rejected findings'],
                  ['rationale', 'Final rationale and decision'],
                ] as const
              ).map(([key, label]) => (
                <label className="field-label" key={key}>
                  {label}
                  <textarea
                    rows={3}
                    disabled={!session || disabled}
                    maxLength={20000}
                    value={human[key]}
                    onChange={(e) =>
                      setHuman((h) => ({ ...h, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
              <label className="field-label">
                Reported-token stop target per model
                <input
                  type="number"
                  disabled={!session || disabled}
                  min={1000}
                  max={10000000}
                  step={1000}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                />
              </label>
              <button
                className="action"
                disabled={!session || disabled}
                onClick={() =>
                  action('save_human', { human, tokenTarget: target })
                }
              >
                Save my review
              </button>
            </div>
          </div>
          {session && (
            <details className="lab-panel">
              <summary>Session activity</summary>
              {session.events.map((event, i) => (
                <p className="lab-meta" key={i}>
                  {event.timestamp} · {event.message}
                </p>
              ))}
            </details>
          )}
        </TabsContent>
      </Tabs>
      <p className="lab-footnote">
        Local practice lab · original examples · prompts are sent to the
        selected provider through OmniRoute. Sessions and exports stay on this
        computer. <a href="/source/">How it works ↗</a>
      </p>
    </section>
  );
}
