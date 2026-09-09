'use client';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowRight, RotateCcw, Send, Check, FileText } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  documents,
  runRetrieval,
  defaultQuestion,
  type Plan,
  type Strategy,
} from '@/lib/demo-engine';
import { useWebMCP } from '@/lib/use-webmcp';
import { ModelPanel } from '@/components/lab/model-panel';
const schema = {
  type: 'object',
  properties: {
    question: { type: 'string', maxLength: 300 },
    plan: { enum: ['enterprise', 'starter'] },
    strategy: { enum: ['documents', 'graph'] },
  },
  required: ['question', 'plan', 'strategy'],
  additionalProperties: false,
};
export function RagLab() {
  const [question, setQuestion] = useState(defaultQuestion),
    [plan, setPlan] = useState<Plan>('enterprise'),
    [strategy, setStrategy] = useState<Strategy>('graph');
  const [result, setResult] = useState<ReturnType<typeof runRetrieval> | null>(
      null,
    ),
    [selected, setSelected] = useState('S2'),
    [error, setError] = useState('');
  const allDocs = documents(plan);
  function run(q = question, p = plan, s = strategy) {
    try {
      const next = runRetrieval(q, p, s);
      setResult(next);
      setSelected(next.sources[0] ?? 'S2');
      setError('');
      return next;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }
  useWebMCP(
    'run_rag_example',
    'Run the fictional audit-policy retrieval example and display the answer and evidence.',
    schema,
    (input) => {
      if (
        typeof input.question !== 'string' ||
        !['enterprise', 'starter'].includes(String(input.plan)) ||
        !['documents', 'graph'].includes(String(input.strategy))
      )
        throw new Error('Invalid question, plan or strategy.');
      const p = input.plan as Plan,
        s = input.strategy as Strategy,
        q = input.question;
      const next = runRetrieval(q, p, s);
      flushSync(() => {
        setQuestion(q);
        setPlan(p);
        setStrategy(s);
        setResult(next);
        setSelected(next.sources[0] ?? 'S2');
        setError('');
      });
      return next;
    },
  );
  return (
    <section className="experiment" aria-labelledby="rag-title">
      <div className="experiment-top">
        <div>
          <span className="live-dot" /> INTERACTIVE EXPERIMENT{' '}
          <span className="experiment-number">/ 01</span>
        </div>
        <span>5 fictional records · local computation</span>
      </div>
      <div className="rag-layout">
        <div className="rag-controls">
          <h2 id="rag-title">Ask a policy question.</h2>
          <p className="muted">
            Orbit is a workspace. Cedar is its organization. Which policy
            applies?
          </p>
          <RadioGroup
            className="strategy-picker"
            aria-label="Retrieval strategy"
            value={strategy}
            onValueChange={(v) => {
              setStrategy(v as Strategy);
              setResult(null);
            }}
          >
            <label
              htmlFor="strategy-documents"
              className={strategy === 'documents' ? 'active' : ''}
            >
              <RadioGroupItem id="strategy-documents" value="documents" />
              Document search
            </label>
            <label
              htmlFor="strategy-graph"
              className={strategy === 'graph' ? 'active' : ''}
            >
              <RadioGroupItem id="strategy-graph" value="graph" />
              With relationships
            </label>
          </RadioGroup>
          <div className="plan-control">
            <label htmlFor="enterprise-plan">
              Cedar’s plan{' '}
              <strong>
                {plan === 'enterprise' ? 'Enterprise' : 'Starter'}
              </strong>
            </label>
            <Switch
              id="enterprise-plan"
              checked={plan === 'enterprise'}
              onCheckedChange={(v) => {
                setPlan(v ? 'enterprise' : 'starter');
                setResult(null);
              }}
            />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run();
            }}
          >
            <label className="field-label" htmlFor="rag-question">
              Your question
            </label>
            <textarea
              id="rag-question"
              value={question}
              maxLength={300}
              onChange={(e) => {
                setQuestion(e.target.value);
                setResult(null);
              }}
              rows={3}
            />
            <div className="run-actions">
              <button className="action" type="submit">
                Run the workflow <Send size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Reset example"
                onClick={() => {
                  setQuestion(defaultQuestion);
                  setPlan('enterprise');
                  setStrategy('graph');
                  setResult(null);
                  setError('');
                  setSelected('S2');
                }}
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </form>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <div className="answer-box" aria-live="polite">
            {result ? (
              <>
                <span
                  className={`result-label ${result.grounded ? 'ok' : 'caution'}`}
                >
                  {result.grounded ? <Check size={15} /> : null}
                  {result.grounded
                    ? 'GROUNDED ANSWER'
                    : 'ABSTAIN / CONTEXT MISSING'}
                </span>
                <p>{result.answer}</p>
                {result.sources.length > 0 && (
                  <div className="source-pills">
                    {result.sources.map((id) => (
                      <button
                        key={id}
                        onClick={() => setSelected(id)}
                        className={selected === id ? 'selected' : ''}
                      >
                        {id} <FileText size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="hand empty-note">Follow the question →</span>
                <p>
                  Run the workflow to inspect the answer, its evidence and the
                  retrieval steps.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="rag-evidence">
          <div className="small-heading">
            THE CONTEXT MAP <span className="hand">click a source below</span>
          </div>
          <div className="context-chain">
            <button onClick={() => setSelected('S2')}>
              <span>WORKSPACE</span>
              <strong>Orbit</strong>
              <small>S2</small>
            </button>
            <ArrowRight size={18} />
            <button onClick={() => setSelected('S3')}>
              <span>ORGANIZATION</span>
              <strong>Cedar</strong>
              <small>S3</small>
            </button>
            <ArrowRight size={18} />
            <button
              onClick={() => setSelected(plan === 'enterprise' ? 'S4' : 'S1')}
              className="plan-node"
            >
              <span>PLAN</span>
              <strong>
                {plan === 'enterprise' ? 'Enterprise' : 'Starter'}
              </strong>
              <small>{plan === 'enterprise' ? '90' : '7'} days</small>
            </button>
          </div>
          <div className="source-selector" aria-label="Source documents">
            {allDocs.map((d) => (
              <button
                aria-pressed={selected === d.id}
                key={d.id}
                className={selected === d.id ? 'selected' : ''}
                onClick={() => setSelected(d.id)}
              >
                {d.id}
              </button>
            ))}
          </div>
          <div className="source-document">
            <div>
              <FileText size={17} />
              <strong>{allDocs.find((d) => d.id === selected)?.title}</strong>
            </div>
            <p>{allDocs.find((d) => d.id === selected)?.text}</p>
          </div>
          <div className="trace">
            <span className="small-heading">EXECUTION TRACE</span>
            {result ? (
              <ol>
                {result.trace.map((step, i) => (
                  <li key={step}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="trace-placeholder">
                The trace appears after you run a question.
              </p>
            )}
          </div>
        </div>
      </div>
      <ModelPanel
        key={`${plan}-${strategy}-${question}`}
        kind="rag"
        payload={{ plan, strategy }}
        question={question}
      />
      <p className="demo-disclosure">
        Original teaching demo. Document search uses term matching;
        graph-assisted answers follow explicit relationships and fixed rules.
        The optional live response uses those retrieved records through
        OmniRoute. No LangGraph runtime, Neo4j server or learned embedding model
        is connected.
      </p>
    </section>
  );
}
