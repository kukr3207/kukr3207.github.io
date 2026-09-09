export const dynamic = 'force-static';
import { ProjectDetail } from '@/components/portfolio/projects';
import { projects } from '@/lib/projects';
export const metadata = {
  title: projects[0].title,
  description: projects[0].summary,
};
export default function GraphRagPage() {
  return <ProjectDetail project={projects[0]} />;
}
