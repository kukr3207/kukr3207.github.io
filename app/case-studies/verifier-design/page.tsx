export const dynamic = 'force-static';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Header, Footer } from '@/components/portfolio/chrome';
import { Doodle } from '@/components/portfolio/doodle';
export const metadata = {
  title: 'Coding evaluation & task engineering',
  description:
    'Selected freelance work across G2i, Expertquery and Alignerr in task authoring, long-horizon model evaluation, reference solutions and code-quality review.',
};
export default function EvaluationOverview() {
  return (
    <div className="wrap">
      <Header />
      <main id="main">
        <section className="project-detail-intro illustrated-intro">
          <div>
            <a className="text-link" href="/#contracting">
              <ArrowLeft size={15} /> Freelance experience
            </a>
            <div className="eyebrow">FREELANCE / EVALUATION ENGINEERING</div>
            <h1>Evidence behind the evaluation.</h1>
            <p>
              Task design, reference solutions and careful review of model
              outputs and execution trajectories. Selected engineering
              responsibilities across G2i, Expertquery and Alignerr engagements.
            </p>
          </div>
          <Doodle kind="explainer" />
        </section>
        <section className="freelance-work-list">
          <article>
            <span className="eyebrow">G2i / TASK & BENCHMARK ENGINEERING</span>
            <h2>Designing tasks that measure useful work.</h2>
            <p>
              Design repository-scale coding tasks, build reference
              implementations and develop behavioral verifiers. Review model
              trajectories to distinguish implementation failures from
              specification, grading and environment issues.
            </p>
          </article>
          <article>
            <span className="eyebrow">G2i / REFERENCE & MODEL REVIEW</span>
            <h2>Reproducing the evidence.</h2>
            <p>
              Refine reference patches, review test coverage and reproduce
              candidate solutions in controlled environments. Compare
              correctness, repository compatibility and code quality using
              documented evidence.
            </p>
          </article>
          <article>
            <span className="eyebrow">G2i / CODE QUALITY</span>
            <h2>Reviewing what remains after the patch.</h2>
            <p>
              Inspect generated code against the requested change and
              surrounding architecture. Validate automated findings, identify
              unnecessary complexity and duplication, and assess whether tests
              protect the intended behavior.
            </p>
          </article>
          <article>
            <span className="eyebrow">
              EXPERTQUERY / SOFTWARE-ENGINEERING TASKS
            </span>
            <h2>Turning requirements into executable checks.</h2>
            <p>
              Author realistic software-engineering tasks that combine clear
              behavioral requirements, reference implementations and held-out
              tests. Build reproducible environments, check baseline and
              reference behavior, and refine tasks using validation and review
              feedback.
            </p>
            <ul className="project-contributions">
              <li>
                Describe features, bug fixes and enhancements through public
                inputs, outputs, errors and meaningful edge cases.
              </li>
              <li>
                Develop reference implementations against pinned repository
                revisions, keeping solution and test patches separate.
              </li>
              <li>
                Write held-out tests for observable behavior so that correct
                alternative implementations can pass.
              </li>
              <li>
                Verify that new tests fail on the baseline and pass with the
                reference solution, while regression tests preserve existing
                behavior.
              </li>
              <li>
                Configure versioned Docker environments with pinned dependencies
                for reproducible execution.
              </li>
              <li>
                Inspect validation and calibration feedback, then revise
                requirements, tests or environment configuration when defects
                emerge.
              </li>
            </ul>
          </article>
          <article id="alignerr">
            <span className="eyebrow">
              ALIGNERR / LONG-HORIZON MODEL EVALUATION
            </span>
            <h2>Following two models through an extended build.</h2>
            <p>
              Start with an open-ended build prompt and evaluate how two models
              carry the work forward. Author rubrics and rationales based on
              their outputs and execution trajectories, then use follow-up
              prompts to continue the task over an extended run.
            </p>
            <ol className="project-contributions">
              <li>Write an initial build prompt and give it to both models.</li>
              <li>
                Review each model’s outputs and trajectory as it works through
                the task.
              </li>
              <li>
                Write evaluation rubrics and rationales grounded in the observed
                outputs and trajectories.
              </li>
              <li>
                Add follow-up prompts until either model exceeds 1M cumulative
                tokens across its run, counted from the initial prompt.
              </li>
            </ol>
          </article>
        </section>
        <section className="project-contact">
          <span className="hand">
            Good evaluations start with clear requirements.
          </span>
          <a className="action" href="mailto:udaykiran.kondreddy@gmail.com">
            Discuss evaluation work <ArrowUpRight size={17} />
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
