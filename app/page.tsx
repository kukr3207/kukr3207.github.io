export const dynamic = 'force-static';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  Experience,
  FreelanceExperience,
  Contact,
} from '@/components/portfolio/experience';
import { LearningPreview } from '@/components/portfolio/learning';
import { Header, Footer, HeroDiagram } from '@/components/portfolio/chrome';
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
              I build production<span className="hand">AI systems.</span>
            </h1>
            <p>
              I’m Uday, an AI engineer working across enterprise retrieval,
              agent workflows and Python services. These are the systems I’ve
              built, the problems behind them and the lessons along the way.
            </p>
            <div className="actions">
              <a className="action" href="#experience">
                Explore my work <ArrowRight size={17} />
              </a>
              <a className="text-link" href="/projects/">
                Architecture deep dives <ArrowUpRight size={16} />
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
        <Experience />
        <FreelanceExperience />
        <LearningPreview />
        <section className="about-band" id="about">
          <div>
            <div className="eyebrow">04 / BEHIND THE WORK</div>
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
              I care about the part after the prototype: what breaks, how we
              notice, and whether our tests measure the behavior we actually
              need.
            </p>
            <p>
              These project notes cover the problems I worked on, my engineering
              contributions and the systems behind them.
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
