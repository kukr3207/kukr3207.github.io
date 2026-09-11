import { Header, Footer } from '@/components/portfolio/chrome';
import { LearningLibrary } from '@/components/portfolio/learning';

export const dynamic = 'force-static';
export const metadata = {
  title: 'GenAI, Agentic AI & System Design learning library',
  description:
    'Explore Uday Kondreddy’s GenAI, Agentic AI and System Design series through visual lessons, hand-drawn diagrams and practical examples.',
};

export default function LearningPage() {
  return (
    <div className="wrap">
      <Header />
      <main id="main">
        <LearningLibrary />
      </main>
      <Footer />
    </div>
  );
}
