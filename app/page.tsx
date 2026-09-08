export const dynamic = 'force-static';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Experience, Contact } from '@/components/portfolio/experience';
import { EmbeddingLab } from '@/components/portfolio/embedding-lab';
import {
  Header,
  Footer,
  HeroDiagram,
  StudyDiagram,
} from '@/components/portfolio/chrome';
export default function Home() {
  return (
    <div className="wrap">
      <Header />
      <main id="main">
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span className="dot" /> NOTES FROM AN AI ENGINEER
            </div>
            <h1>
              Complex systems.<span className="hand">Clear thinking.</span>
            </h1>
            <p>
              I’m Uday. I build AI systems that retrieve the right context, work
              through real tasks, and stand up to careful evaluation.
            </p>
            <div className="actions">
              <a className="action" href="#case-studies">
                Explore the fieldnotes <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#about">
                A little about me <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <HeroDiagram />
        </section>
        <div className="expertise-line">
          <strong>FROM IDEA TO PRODUCTION</strong>
          <span>Python & backend systems</span>
          <span>Retrieval & agents</span>
          <span>Benchmarks & evaluation</span>
        </div>
        <section id="case-studies" className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">01 / THE FIELDNOTES</div>
              <h2>Open the black box.</h2>
            </div>
            <p>
              Architecture, tradeoffs, and small experiments you can run
              yourself.
            </p>
          </div>
          <div className="study-grid">
            <a className="study-card" href="/case-studies/graph-rag/">
              <div className="study-art rag">
                <StudyDiagram kind="rag" />
              </div>
              <div className="study-body">
                <div className="study-meta">
                  01 · RETRIEVAL SYSTEMS · INTERACTIVE
                </div>
                <h3>When search needs a map.</h3>
                <p>
                  How graph relationships resolve the context that document
                  search can miss. Follow one question all the way to its
                  evidence.
                </p>
                <div className="study-footer">
                  <div className="tags">
                    <span className="tag">Graph RAG</span>
                    <span className="tag">Architecture</span>
                  </div>
                  <span className="arrow-disc">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>
            </a>
            <a className="study-card" href="/case-studies/verifier-design/">
              <div className="study-art eval">
                <StudyDiagram kind="eval" />
              </div>
              <div className="study-body">
                <div className="study-meta">
                  02 · MODEL EVALUATION · INTERACTIVE
                </div>
                <h3>A passing test can still be wrong.</h3>
                <p>
                  Four small verifier failures, the fixes that catch them, and
                  the valid solutions a fair test should keep accepting.
                </p>
                <div className="study-footer">
                  <div className="tags">
                    <span className="tag">Coding evals</span>
                    <span className="tag">Verifier design</span>
                  </div>
                  <span className="arrow-disc">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>
        <Experience />
        <section className="lab-section" id="lab">
          <EmbeddingLab compact />
        </section>
        <section className="about-band" id="about">
          <div>
            <div className="eyebrow">04 / BEHIND THE NOTES</div>
            <h2>
              Build it.
              <br />
              Understand it.
              <br />
              <span className="hand" style={{ color: 'var(--primary)' }}>
                Make it useful.
              </span>
            </h2>
          </div>
          <div>
            <p>
              I’m Uday Kiran Reddy Kondreddy, an AI engineer based in Hyderabad.
              My work spans production retrieval systems, agent workflows,
              Python services, and coding-model evaluation.
            </p>
            <p>
              I care about the part after the demo: what breaks, how we notice,
              and whether our tests measure the behavior we actually need.
            </p>
            <p>
              These fieldnotes use original, fictional examples to make
              engineering decisions easier to inspect and discuss.
            </p>
            <a
              className="text-link"
              href="mailto:udaykiran.kondreddy@gmail.com"
            >
              Have an interesting engineering problem? Let’s talk{' '}
              <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
