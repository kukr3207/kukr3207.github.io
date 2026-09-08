export const dynamic = 'force-static';
import { ArticleShell } from '@/components/portfolio/article';
import { VerifierLab } from '@/components/portfolio/verifier-lab';
export const metadata = { title: 'A passing test can still be wrong' };
export default function VerifierPage() {
  return (
    <ArticleShell
      label="FIELDNOTE 02 / CODING-MODEL EVALUATION"
      title="A passing test can still be wrong."
      description="A verifier is part of the system under test. Explore four ways it can reward broken behavior—and how to tighten the check without rejecting valid solutions."
    >
      <VerifierLab />
      <div className="article-prose">
        <div className="prose-heading">
          <span className="eyebrow">THE METHOD</span>
          <h2>
            Specify behavior.
            <br />
            Challenge the grader.
          </h2>
        </div>
        <div>
          <p>
            Evaluation starts with a precise contract: observable outputs,
            allowed side effects, edge cases and the conditions under which
            multiple answers are valid. A reference solution can help establish
            feasibility. It should not silently become the only acceptable
            implementation.
          </p>
          <ol>
            <li>
              <strong>Write the contract first.</strong> Distinguish
              requirements from implementation choices.
            </li>
            <li>
              <strong>Construct plausible failures.</strong> Include shortcuts
              that look correct to a weak checker.
            </li>
            <li>
              <strong>Test legitimate alternatives.</strong> A stricter verifier
              is useful only if it preserves valid behavior.
            </li>
            <li>
              <strong>Inspect disagreement.</strong> A surprising score can
              indicate a candidate error, an ambiguous task or a broken
              environment.
            </li>
          </ol>
          <p>
            The checks above execute real local JavaScript over four original
            fixtures. They demonstrate specific failure modes; passing them does
            not prove that an arbitrary program is correct.
          </p>
        </div>
      </div>
      <div className="principle-grid">
        <div>
          <span className="hand">reliability</span>
          <h3>Reproduce before you explain.</h3>
          <p>
            Record the environment, inputs and observed result. Separate
            execution failures from task failures. Repeat runs when
            nondeterminism changes the result.
          </p>
        </div>
        <div>
          <span className="hand">fairness</span>
          <h3>Keep the solution space open.</h3>
          <p>
            Test outputs and required side effects. Unless the contract demands
            it, do not require a particular algorithm, output ordering, helper
            name or exact match to a reference patch.
          </p>
        </div>
      </div>
    </ArticleShell>
  );
}
