export const dynamic = 'force-static';
import { ArticleShell } from '@/components/portfolio/article';
import { RagLab } from '@/components/portfolio/rag-lab';
export const metadata = { title: 'When search needs a map' };
export default function GraphRagPage() {
  return (
    <ArticleShell
      label="FIELDNOTE 01 / RETRIEVAL SYSTEMS"
      title="When search needs a map."
      description="A relevant document is not always an applicable document. Explore how relationships help a retrieval workflow choose the right policy."
    >
      <RagLab />
      <div className="article-prose">
        <div className="prose-heading">
          <span className="eyebrow">THE ARCHITECTURE</span>
          <h2>
            Retrieve evidence.
            <br />
            Then establish context.
          </h2>
        </div>
        <div>
          <p>
            Imagine an assistant answering policy questions across many
            organizations. Search may find a perfectly relevant policy that
            belongs to the wrong subscription. The missing fact is often a
            relationship, not another paragraph.
          </p>
          <p>
            A useful workflow separates entity resolution, relationship lookup,
            policy retrieval and answer verification. In a LangGraph
            implementation, these can be explicit state transitions; Neo4j can
            store the workspace-to-organization-to-plan relationships. Separate
            agents are an option, not a requirement.
          </p>
          <ol>
            <li>
              <strong>Resolve the entity.</strong> Identify the workspace and
              the caller’s access before retrieval.
            </li>
            <li>
              <strong>Find the applicable context.</strong> Follow authorized
              relationships and check effective dates.
            </li>
            <li>
              <strong>Retrieve and compose.</strong> Retrieve the matching
              policy and keep its source identifiers.
            </li>
            <li>
              <strong>Verify or abstain.</strong> Require evidence for the
              answer’s material claims. Missing context should stay visible.
            </li>
          </ol>
        </div>
      </div>
      <div className="principle-grid">
        <div>
          <span className="hand">the useful tradeoff</span>
          <h3>Relationships add precision—and maintenance.</h3>
          <p>
            Graph traversal helps when relationships determine applicability. It
            also introduces schema design, entity resolution, access controls
            and freshness work. Pure document retrieval can be enough when the
            relevant facts are self-contained.
          </p>
        </div>
        <div>
          <span className="hand">what I would measure</span>
          <h3>Correctness before confidence.</h3>
          <p>
            Evaluate policy selection, evidence coverage, appropriate abstention
            and unauthorized disclosure. Measure latency and cost separately.
            This five-record demo reports no production performance improvement.
          </p>
        </div>
      </div>
      <div className="reference-links">
        <span>Further reading</span>
        <a
          href="https://docs.langchain.com/oss/python/langgraph/graph-api"
          target="_blank"
          rel="noreferrer"
        >
          LangGraph Graph API ↗
        </a>
        <a
          href="https://neo4j.com/docs/cypher-manual/current/introduction/"
          target="_blank"
          rel="noreferrer"
        >
          Neo4j Cypher ↗
        </a>
      </div>
    </ArticleShell>
  );
}
