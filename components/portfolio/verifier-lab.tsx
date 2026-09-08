'use client';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowRight, Play, Check, X, FlaskConical } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  verifierCases,
  runVerifier,
  type VerifierId,
  type Candidate,
} from '@/lib/demo-engine';
import { useWebMCP } from '@/lib/use-webmcp';
const schema = {
  type: 'object',
  properties: {
    caseId: { enum: ['nan', 'duplicates', 'mutation', 'absence'] },
    candidate: { enum: ['loophole', 'valid'] },
  },
  required: ['caseId', 'candidate'],
  additionalProperties: false,
};
export function VerifierLab() {
  const [id, setId] = useState<VerifierId>('nan'),
    [candidate, setCandidate] = useState<Candidate>('loophole'),
    [result, setResult] = useState<ReturnType<typeof runVerifier> | null>(null),
    [suite, setSuite] = useState<ReturnType<typeof runVerifier>[] | null>(null);
  const selected = verifierCases.find((c) => c.id === id)!;
  useWebMCP(
    'run_verifier_example',
    'Run an original verifier fixture, showing the candidate result and both checker decisions.',
    schema,
    (input) => {
      const next = runVerifier(
        input.caseId as VerifierId,
        input.candidate as Candidate,
      );
      flushSync(() => {
        setId(next.id);
        setCandidate(next.candidate);
        setResult(next);
      });
      return next;
    },
  );
  function runSuite() {
    setSuite(
      verifierCases.flatMap((c) =>
        (['loophole', 'valid'] as Candidate[]).map((candidate) =>
          runVerifier(c.id, candidate),
        ),
      ),
    );
    setResult(runVerifier(id, candidate));
  }
  return (
    <section className="experiment" aria-labelledby="verifier-title">
      <div className="experiment-top">
        <div>
          <span className="live-dot" /> INTERACTIVE EXPERIMENT{' '}
          <span className="experiment-number">/ 02</span>
        </div>
        <span>4 fixtures · executable checks</span>
      </div>
      <div className="verifier-top">
        <div>
          <h2 id="verifier-title">Try to fool the verifier.</h2>
          <p className="muted">
            Select a case, then compare the loophole with a legitimate
            alternative.
          </p>
        </div>
        <button className="action secondary" onClick={runSuite}>
          <FlaskConical size={16} /> Run all 8 checks
        </button>
      </div>
      <div className="verifier-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case / failure mode</TableHead>
              <TableHead>Weak check</TableHead>
              <TableHead>Corrected check</TableHead>
              <TableHead>Valid alternative</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifierCases.map((item, i) => {
              const bad = suite?.find(
                  (r) => r.id === item.id && r.candidate === 'loophole',
                ),
                good = suite?.find(
                  (r) => r.id === item.id && r.candidate === 'valid',
                );
              return (
                <TableRow
                  key={item.id}
                  data-state={id === item.id ? 'selected' : undefined}
                >
                  <TableCell>
                    <button
                      className="case-select"
                      aria-pressed={id === item.id}
                      onClick={() => {
                        setId(item.id);
                        setResult(null);
                      }}
                    >
                      <span className="case-index">0{i + 1}</span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.category}</small>
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  </TableCell>
                  <TableCell>
                    {bad ? (
                      <span className="check-badge false-pass">
                        Accepted bad result
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bad ? (
                      <span className="check-badge ok">
                        {bad.fixed ? 'Accepted' : 'Rejected'}
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {good ? (
                      <span className="check-badge ok">
                        {good.fixed ? 'Accepted' : 'Rejected'}
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {suite && (
        <output className="suite-result">
          <Check size={16} />{' '}
          {suite.filter((r) => r.candidate === 'loophole' && !r.fixed).length}{' '}
          loopholes rejected ·{' '}
          {suite.filter((r) => r.candidate === 'valid' && r.fixed).length} valid
          alternatives accepted
        </output>
      )}
      <div className="verifier-detail">
        <div>
          <span className="small-heading">THE CONTRACT</span>
          <h3>{selected.title}</h3>
          <p>{selected.contract}</p>
          <div className="input-example">
            <span>Input</span>
            <code>{selected.input}</code>
          </div>
          <Tabs
            value={candidate}
            onValueChange={(v) => {
              setCandidate(v as Candidate);
              setResult(null);
            }}
          >
            <TabsList className="lab-tabs">
              <TabsTrigger value="loophole">Try the loophole</TabsTrigger>
              <TabsTrigger value="valid">Valid alternative</TabsTrigger>
            </TabsList>
            <TabsContent value="loophole">
              <pre className="code-block">
                <code>{selected.bad}</code>
              </pre>
            </TabsContent>
            <TabsContent value="valid">
              <pre className="code-block">
                <code>{selected.good}</code>
              </pre>
            </TabsContent>
          </Tabs>
          <button
            className="action"
            onClick={() => setResult(runVerifier(id, candidate))}
          >
            <Play size={15} /> Run this candidate
          </button>
          <div className="verifier-result" aria-live="polite">
            {result ? (
              <>
                <div className="result-output">
                  <span>RETURNED</span>
                  <code>{result.output}</code>
                </div>
                <div className="result-pair">
                  <span>
                    <strong>Weak verifier</strong>
                    <span className={result.weak ? 'ok' : 'error-text'}>
                      {result.weak ? <Check size={16} /> : <X size={16} />}{' '}
                      {result.weak ? 'PASS' : 'FAIL'}
                    </span>
                  </span>
                  <span>
                    <strong>Corrected verifier</strong>
                    <span className={result.fixed ? 'ok' : 'error-text'}>
                      {result.fixed ? <Check size={16} /> : <X size={16} />}{' '}
                      {result.fixed ? 'PASS' : 'FAIL'}
                    </span>
                  </span>
                </div>
              </>
            ) : (
              <p className="muted">
                Run the candidate to see the actual checker decisions.
              </p>
            )}
          </div>
        </div>
        <div>
          <span className="small-heading">THE CHECKER</span>
          <p className="code-label">Before / the gap</p>
          <pre className="code-block weak-code">
            <code>{selected.weak}</code>
          </pre>
          <p>{selected.explanation}</p>
          <p className="code-label">After / the fix</p>
          <pre className="code-block">
            <code>{selected.fixed}</code>
          </pre>
          <div className="fairness-note">
            <span className="hand">Keep valid solutions valid.</span>
            <p>{selected.fairness}</p>
          </div>
        </div>
      </div>
      <p className="demo-disclosure">
        Original synthetic fixtures. Only the built-in candidates run; no
        user-supplied code is executed. These examples contain no client tasks,
        private rubrics or evaluation results.
      </p>
    </section>
  );
}
