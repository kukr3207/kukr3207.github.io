export const dynamic = 'force-static';
import { ArticleShell } from '@/components/portfolio/article';
import { EmbeddingLab } from '@/components/portfolio/embedding-lab';
export const metadata = { title: 'The vector playground' };
export default function EmbeddingsPage() {
  return (
    <ArticleShell
      label="EXPERIMENT 03 / VECTOR GEOMETRY"
      title="What does “nearby” actually mean?"
      description="Explore 600 synthetic vectors in three dimensions. Rotate the space, move the clusters and inspect neighbors ranked by cosine similarity."
    >
      <EmbeddingLab />
      <div className="article-prose">
        <div className="prose-heading">
          <span className="eyebrow">READING THE PLOT</span>
          <h2>
            Useful geometry.
            <br />
            Incomplete evidence.
          </h2>
        </div>
        <div>
          <p>
            Each point is a seeded synthetic vector. Three topic labels make the
            groups easier to discuss; no model derived these coordinates from
            text. The white cross marks a query direction. The neighbor list is
            computed from the actual 3D coordinates using cosine similarity.
          </p>
          <p>
            The separation slider moves group centers apart while reducing
            within-group spread. Rotation changes only your view. The
            nearest-neighbor ranking uses the underlying vectors, so rotating
            the scene does not change the results.
          </p>
          <p>
            Real embedding systems typically operate in far more than three
            dimensions. A projection can hide relationships or make unrelated
            points look close. Evaluate retrieval on representative questions
            and inspect the evidence before treating distance as an answer.
          </p>
        </div>
      </div>
    </ArticleShell>
  );
}
