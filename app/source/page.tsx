export const dynamic = 'force-static';
import { Download, FileCode2, ArrowUpRight, Terminal } from 'lucide-react';
import { ArticleShell } from '@/components/portfolio/article';
import { verifierCases } from '@/lib/demo-engine';
export const metadata = {
  title: 'The source behind the experiments',
  description:
    'Download and inspect the original retrieval, verifier and vector examples behind Uday’s AI Fieldnotes.',
};
export default function SourcePage() {
  return (
    <ArticleShell
      label="05 / SOURCE NOTES"
      title="Nothing up the sleeve."
      description="The small, readable functions behind these experiments. Download the source, inspect the decisions, and run the checks locally."
    >
      <div className="source-grid">
        <section className="source-card">
          <FileCode2 size={25} />
          <h2>The demo engine.</h2>
          <p>
            One dependency-free TypeScript file: fictional policy retrieval,
            executable verifier examples and deterministic vector math.
          </p>
          <div className="actions">
            <a className="action" href="/downloads/demo-engine.ts" download>
              <Download size={16} /> Download source
            </a>
            <a
              className="text-link"
              href="/downloads/demo-engine.txt"
              target="_blank"
              rel="noreferrer"
            >
              Read the full file <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section className="source-card">
          <Terminal size={25} />
          <h2>Check the checks.</h2>
          <p>
            Tests cover plan changes, unsupported questions, all four loopholes,
            valid alternatives and the vector calculations.
          </p>
          <div className="actions">
            <a
              className="action secondary"
              href="/downloads/demo-engine.test.mjs"
              download
            >
              <Download size={16} /> Download tests
            </a>
            <a className="text-link" href="/downloads/README.md" download>
              Get the README <Download size={15} />
            </a>
          </div>
        </section>
      </div>
      <section className="article-prose">
        <div>
          <span className="eyebrow">RUN IT YOURSELF</span>
          <h2>
            Three files.
            <br />
            No API key.
          </h2>
        </div>
        <div>
          <p>
            Save the source, test file and README in the same folder. With
            Node.js 22.18 or later, run:
          </p>
          <pre className="code-block">
            <code>
              node --experimental-strip-types --test demo-engine.test.mjs
            </code>
          </pre>
          <p>
            The examples execute locally. There is no model endpoint, telemetry
            or paid service behind the run buttons. These are bounded teaching
            experiments, not production benchmarks.
          </p>
        </div>
      </section>
      <section className="source-example">
        <div className="eyebrow">A SMALL EXAMPLE / NUMERIC VALIDITY</div>
        <h2>One extra guard. A different result.</h2>
        <p className="muted">
          NaN makes a tolerance comparison behave unexpectedly. Explicitly
          require a finite result before checking the error.
        </p>
        <div className="source-grid">
          <div>
            <p className="code-label">WEAK CHECK</p>
            <pre className="code-block weak-code">
              <code>{verifierCases[0].weak}</code>
            </pre>
          </div>
          <div>
            <p className="code-label">REPAIRED CHECK</p>
            <pre className="code-block">
              <code>{verifierCases[0].fixed}</code>
            </pre>
          </div>
        </div>
        <a className="text-link" href="/case-studies/verifier-design/">
          Try all four cases <ArrowUpRight size={16} />
        </a>
      </section>
      <div className="fairness-note">
        <span className="hand">A note on provenance.</span>
        <p>
          All records, candidate functions and vectors here were created for
          this site. Client deliverables, private evaluation tasks and model
          trajectories are not included. Source downloads are available for
          inspection; a public repository and open-source license have not been
          selected yet.
        </p>
      </div>
    </ArticleShell>
  );
}
