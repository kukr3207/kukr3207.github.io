import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { Header, Footer } from './chrome';
export function ArticleShell({
  children,
  label,
  title,
  description,
}: {
  children: React.ReactNode;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="wrap">
      <Header />
      <main id="main">
        <div className="article-intro">
          <a className="text-link back-link" href="/#case-studies">
            <ArrowLeft size={16} /> Back to fieldnotes
          </a>
          <div className="eyebrow">{label}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <div className="article-end">
          <div>
            <span className="eyebrow">KEEP EXPLORING</span>
            <p>Good systems start with questions worth testing.</p>
          </div>
          <a className="action secondary" href="/source/">
            <Download size={16} /> Read & download the source{' '}
            <ArrowRight size={16} />
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
