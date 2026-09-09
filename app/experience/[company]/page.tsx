import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { career } from '@/lib/career';
import { projects } from '@/lib/projects';
import { Header, Footer } from '@/components/portfolio/chrome';
import { Doodle } from '@/components/portfolio/doodle';
import { ProjectCards } from '@/components/portfolio/projects';

export const dynamic = 'force-static';
type Props = { params: Promise<{ company: string }> };
export function generateStaticParams() {
  return career.map((role) => ({ company: role.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { company } = await params;
  const role = career.find((item) => item.slug === company);
  return {
    title: role
      ? `${role.name} — Projects & architecture`
      : 'Experience not found',
    description: role?.detail,
  };
}
export default async function EmployerPage({ params }: Props) {
  const { company } = await params;
  const role = career.find((item) => item.slug === company);
  if (!role) notFound();
  const work = projects.filter((project) => project.company === role.name);
  return (
    <div className="wrap">
      <Header />
      <main id="main">
        <section className="project-index-intro illustrated-intro employer-intro">
          <div>
            <a className="text-link" href="/#experience">
              <ArrowLeft size={15} /> Career timeline
            </a>
            <span className="eyebrow">
              PROFESSIONAL EXPERIENCE / {role.dates}
            </span>
            <h1>{role.name}</h1>
            <p className="employer-role">{role.role}</p>
            <p>{role.detail}</p>
            <div className="tags">
              {role.stack.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <Doodle kind="builder" />
        </section>
        <section
          className="employer-work"
          aria-labelledby="employer-work-title"
        >
          <div className="section-header">
            <div>
              <span className="eyebrow">THE WORK</span>
              <h2 id="employer-work-title">
                Architecture teardowns & deep dives.
              </h2>
            </div>
          </div>
          <ProjectCards items={work} />
        </section>
        <section className="project-contact">
          <a className="text-link" href="/#experience">
            <ArrowLeft size={16} /> Back to experience
          </a>
          <a className="text-link" href="/projects/">
            Browse all deep dives <ArrowRight size={16} />
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
