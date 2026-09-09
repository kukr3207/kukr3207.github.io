import { Header, Footer } from '@/components/portfolio/chrome';
import { LearningLibrary } from '@/components/portfolio/learning';

export const dynamic = 'force-static';
export const metadata = {
  title: 'GenAI & Agentic AI learning library',
  description:
    'Explore Uday Kondreddy’s GenAI and Agentic AI learning series: visual lessons on generative models, prompting, RAG, tools, memory and multi-agent systems.',
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
