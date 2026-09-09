'use client';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Completion, LabStatus } from '@/lib/lab-types';
import { labFetch, ModelResult, Picker } from './shared';
let healthRequest: Promise<LabStatus> | undefined;
let healthRequestedAt = 0;
function cachedHealth() {
  if (!healthRequest || Date.now() - healthRequestedAt > 30000) {
    healthRequestedAt = Date.now();
    healthRequest = labFetch<LabStatus>('status');
  }
  return healthRequest;
}
export function ModelPanel({
  kind,
  payload,
  question: initialQuestion,
}: {
  kind: 'rag' | 'verifier' | 'vectors';
  payload?: Record<string, unknown>;
  question: string;
}) {
  const [status, setStatus] = useState<LabStatus | null>(null),
    [model, setModel] = useState('oc/mimo-v2.5-free'),
    [question, setQuestion] = useState(initialQuestion),
    [result, setResult] = useState<Completion | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    cachedHealth()
      .then((s) => {
        if (live) setStatus(s);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  async function run() {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(
        await labFetch<Completion>('complete', {
          kind,
          ...payload,
          question,
          model,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="live-model-panel">
      <div className="lab-row">
        <h3>{kind === 'rag' ? 'Ask a live model' : 'Discuss the evidence'}</h3>
        <span className="lab-status">
          {status?.gatewayReachable
            ? 'OmniRoute · local'
            : 'Local gateway required'}
        </span>
      </div>
      <p>
        The model sees this original example. Its explanation is separate from
        the computed results above.
      </p>
      <Picker
        label="Free model"
        value={model}
        items={status?.models || []}
        onChange={(v) => {
          setModel(v);
          setResult(null);
        }}
        disabled={busy}
      />
      <label className="field-label">
        {kind === 'rag' ? 'Current question' : 'Your question'}
        <textarea
          rows={2}
          value={question}
          readOnly={kind === 'rag'}
          maxLength={2000}
          onChange={(e) => {
            setQuestion(e.target.value);
            setResult(null);
          }}
        />
      </label>
      <button
        className="action"
        disabled={busy || !question.trim() || !status?.gatewayReachable}
        onClick={run}
      >
        {busy ? 'Waiting for model…' : 'Run through OmniRoute'}{' '}
        <ArrowRight size={15} />
      </button>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      {result && <ModelResult result={result} />}
    </div>
  );
}
