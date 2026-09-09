'use client';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { Completion, CheckReport } from '@/lib/lab-types';
export async function labFetch<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(
    `/api/lab/${path}`,
    body === undefined
      ? { cache: 'no-store' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      'Live sessions need the local lab server. The static portfolio remains available.',
    );
  }
  if (!response.ok)
    throw new Error(
      data && typeof data === 'object' && 'error' in data
        ? String(data.error)
        : 'The request failed.',
    );
  return data as T;
}
export function Picker({
  label,
  value,
  onChange,
  items,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: { id: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="lab-picker">
      <span className="field-label">{label}</span>
      <Select
        value={value}
        onValueChange={(v) => v && onChange(v)}
        disabled={disabled}
      >
        <SelectTrigger aria-label={label}>
          <SelectValue>
            {items.find((i) => i.id === value)?.label || 'Choose…'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function ModelResult({ result }: { result: Completion }) {
  return (
    <div className="model-result">
      <div className="lab-meta">
        <strong>Model analysis</strong>
        <span>{result.model}</span>
        <span>
          {result.usage.total === null
            ? 'Tokens unreported'
            : `${result.usage.total.toLocaleString()} tokens`}
        </span>
        <span>{(result.durationMs / 1000).toFixed(1)}s</span>
      </div>
      <pre className="lab-prose-output">{result.text}</pre>
      {result.finishReason === 'length' && (
        <p className="lab-note">
          The response reached its output limit and may be incomplete.
        </p>
      )}
    </div>
  );
}
export function CheckEvidence({
  report,
  label,
}: {
  report?: CheckReport;
  label: string;
}) {
  return (
    <div className="check-evidence">
      <div className="lab-row">
        <strong>{label}</strong>
        <span
          className={`lab-status ${report?.status === 'passed' ? 'connected' : ''}`}
        >
          {report?.status.replaceAll('_', ' ') || 'not run'}
        </span>
      </div>
      <p>{report?.summary || 'No execution evidence yet.'}</p>
      {report && (
        <details>
          <summary>Inspect execution evidence</summary>
          <p className="lab-meta">
            Exit {report.exitCode ?? 'unavailable'} · {report.timestamp}
          </p>
          <code className="lab-hash">
            {report.imageId || 'No runner image'}
          </code>
          <div className="check-list">
            {report.checks.map((check) => (
              <div key={check.id}>
                <strong>
                  {check.passed ? '✓' : '×'} {check.id}
                </strong>
                <code>expected {check.expected}</code>
                <code>observed {check.observed}</code>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
