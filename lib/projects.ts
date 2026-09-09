export type Project = {
  slug: string;
  title: string;
  company: string;
  category: string;
  summary: string;
  problem: string;
  contributions: string[];
  stack: string[];
  outcome: string;
  impact?: { value: string; label: string };
  reference?: { url: string; label: string; description: string };
  flow: [string, string, string, string];
  engineering?: { title: string; technology: string; description: string }[];
};

// Public summaries and reported impact from the supplied resumes. No private client assets.
export const projects: Project[] = [
  {
    slug: 'enterprise-knowledge-retrieval',
    title: 'Hybrid GraphRAG: Merging Neo4j with Vector Retrieval',
    impact: { value: '3×', label: 'faster retrieval across internal docs' },
    company: 'Netskope',
    category: 'RAG & AGENT SYSTEMS',
    summary:
      'A production RAG application combining graph relationships, vector search and multi-agent workflows.',
    problem:
      'Enterprise knowledge spans structured records and unstructured documents. Answering a question requires finding relevant information and understanding the relationships that give it context.',
    contributions: [
      'Built a production retrieval application combining structured graph data with vector search.',
      'Developed agent workflows for document search, query decomposition and answer synthesis with LangGraph and Neo4j.',
      'Integrated CopilotKit into the application experience.',
      'Containerized Python services and automated deployments with GCP Cloud Build and Cloud Run.',
    ],
    stack: ['Python', 'LangGraph', 'Neo4j', 'CopilotKit', 'Docker', 'GCP'],
    outcome:
      'Brought enterprise knowledge retrieval into a production application with automated cloud deployments.',
    flow: [
      'Enterprise knowledge',
      'Graph + vector retrieval',
      'Agent orchestration',
      'Answer synthesis',
    ],
    engineering: [
      {
        title: 'Connect documents and relationships',
        technology: 'Neo4j · graph + vector search',
        description:
          'Architected retrieval across structured and unstructured sources, combining graph relationships with semantic document search.',
      },
      {
        title: 'Coordinate the work',
        technology: 'LangGraph · CopilotKit',
        description:
          'Developed specialized agents for query decomposition, document search and answer synthesis, with CopilotKit integrated into the application experience.',
      },
      {
        title: 'Deliver the application',
        technology: 'Python · Docker · GCP',
        description:
          'Implemented containerized Python services and automated deployments through Cloud Build and Cloud Run. Used uv to manage Python environments.',
      },
    ],
  },
  {
    slug: 'incident-intelligence',
    title: 'Multi-Agent Orchestration for Autonomous Root-Cause Analysis',
    impact: { value: '60%', label: 'less manual triage time' },
    company: 'ServiceNow',
    category: 'INCIDENT INTELLIGENCE',
    summary:
      'Retrieval and agent workflows that bring incident history into investigation and triage.',
    problem:
      'Incident investigation depends on context scattered across historical records. Teams need to find related events, identify patterns and form useful root-cause hypotheses.',
    contributions: [
      'Engineered multi-agent workflows for incident investigation and context gathering.',
      'Built a domain-specific RAG pipeline over historical incident information.',
      'Used retrieval and agent orchestration to support alert prioritization, pattern identification and root-cause hypotheses.',
    ],
    stack: ['Python', 'LangChain', 'CrewAI', 'Vector databases'],
    outcome:
      'Supported incident investigation with historical context and automated parts of the manual triage workflow.',
    flow: [
      'Incident history',
      'Domain retrieval',
      'Investigation agents',
      'Triage context',
    ],
    engineering: [
      {
        title: 'Retrieve incident context',
        technology: 'Domain-specific RAG',
        description:
          'Built retrieval over historical incident information to bring relevant prior events into root-cause analysis.',
      },
      {
        title: 'Coordinate investigation',
        technology: 'LangChain · CrewAI',
        description:
          'Engineered incident-management agents and orchestration for investigation and alert prioritization.',
      },
      {
        title: 'Support a useful next step',
        technology: 'Historical patterns · root-cause hypotheses',
        description:
          'Connected incident history with agent workflows to identify patterns and produce context for triage and root-cause investigation.',
      },
    ],
  },
  {
    slug: 'commerce-recommendations',
    reference: {
      url: 'https://github.com/recommenders-team/recommenders/tree/main/recommenders',
      label: 'Recommenders library on GitHub',
      description:
        'The open-source recommendation library used in this work. This link points to the upstream library.',
    },
    title: 'Recommendation Pipelines at Scale with Databricks & Spark',
    impact: { value: '10M+', label: 'user interactions processed daily' },
    company: 'SWYM',
    category: 'RECOMMENDATION SYSTEMS',
    summary:
      'Production data and ML pipelines that turn customer interactions into personalized product recommendations.',
    problem:
      'Merchants need product recommendations informed by customer behavior. Interaction data must move through reliable processing and ML pipelines before it can support personalized feeds.',
    contributions: [
      'Developed a production recommendation system on Databricks.',
      'Built pipelines to process customer interaction data for personalized product feeds.',
      'Worked across Python, Spark and ML workflows to connect data processing with recommendation delivery.',
    ],
    stack: ['Python', 'Databricks', 'Spark', 'Recommenders', 'ML pipelines'],
    outcome:
      'Delivered personalized product recommendations through production data and ML pipelines.',
    flow: [
      'Customer interactions',
      'Data processing',
      'Recommendation models',
      'Personalized feeds',
    ],
  },
  {
    slug: 'inventory-revenue-analytics',
    title: 'Inventory Analytics: Turning Stockouts into Revenue Signals',
    company: 'SWYM',
    category: 'COMMERCE ANALYTICS',
    summary:
      'A Streamlit dashboard that makes potential revenue loss from inventory issues easier to investigate.',
    problem:
      'Stock-outs can hide commercial opportunities. Teams need a clear view of where inventory availability may be affecting revenue.',
    contributions: [
      'Built a Streamlit analytics dashboard for investigating inventory-related revenue opportunities.',
      'Used Python to translate stock-out analysis into a dashboard that stakeholders could explore.',
    ],
    stack: ['Python', 'Streamlit', 'Analytics'],
    outcome:
      'Made potential stock-out-related revenue loss visible through an analytics dashboard.',
    flow: [
      'Inventory information',
      'Stock-out analysis',
      'Revenue opportunity',
      'Analytics dashboard',
    ],
  },
  {
    slug: 'support-anomaly-detection',
    title: 'Anomaly Detection: Reducing False Alerts in IT Support',
    impact: { value: '45%', label: 'fewer false-positive alerts' },
    company: 'Synopsys',
    category: 'APPLIED MACHINE LEARNING',
    summary:
      'Anomaly-detection models for IT support data, supported by internal ML and data workflows.',
    problem:
      'Operational alerts need to surface unusual behavior without overwhelming support teams with false positives.',
    contributions: [
      'Built anomaly-detection models for IT support data.',
      'Worked on data pipelines supporting internal ML automation.',
      'Focused on improving the usefulness of anomaly signals for support operations.',
    ],
    stack: ['Python', 'Anomaly detection', 'Data pipelines'],
    outcome:
      'Applied anomaly detection to IT support data to improve the usefulness of operational alerts.',
    flow: [
      'IT support data',
      'Data preparation',
      'Anomaly detection',
      'Operational signals',
    ],
  },
  {
    slug: 'support-sentiment-analysis',
    title: 'NLP for Support: Turning Ticket Text into Sentiment Signals',
    impact: { value: '100K+', label: 'support tickets analyzed' },
    company: 'Synopsys',
    category: 'NATURAL LANGUAGE PROCESSING',
    summary:
      'An NLP classification system that turns support-ticket text into sentiment signals.',
    problem:
      'Large collections of support tickets make it difficult to assess service experience consistently. Sentiment classification provides another way to analyze that feedback.',
    contributions: [
      'Developed a sentiment-classification system for support tickets.',
      'Applied NLP to turn ticket text into signals for service-quality analysis.',
      'Worked with experiment tracking and distributed ML infrastructure in the broader engineering role.',
    ],
    stack: ['Python', 'NLP', 'Sentiment classification'],
    outcome:
      'Turned support-ticket text into sentiment signals for service-quality analysis.',
    flow: [
      'Support tickets',
      'Text processing',
      'Sentiment classification',
      'Service insights',
    ],
  },
];
