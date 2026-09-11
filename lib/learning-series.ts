export type LearningDocument = {
  id: string;
  filename: string;
  series: string;
  lesson: number | null;
  title: string;
  summary: string;
  topics: string[];
  pages: number | null;
  order: number;
  cover: string | null;
  coverVariants?: { url: string; width: number; height: number }[];
  url: string;
  bytes: number;
  updatedAt: string;
};

export type LearningSeries = { name: string; documents: LearningDocument[] };

const seriesPriority: Record<string, number> = {
  GenAI: 0,
  'Agentic AI': 1,
  'System Design': 2,
};
export function groupLearningDocuments(
  documents: LearningDocument[],
  series: string | null = null,
  query = '',
): LearningSeries[] {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const groups = new Map<string, LearningDocument[]>();
  for (const document of documents) {
    if (series !== null && document.series !== series) continue;
    const searchable =
      `${document.series} ${document.title} ${document.summary} ${document.topics.join(' ')} ${document.lesson ? `lesson ${document.lesson} day ${document.lesson}` : ''}`.toLocaleLowerCase();
    if (!terms.every((term) => searchable.includes(term))) continue;
    const group = groups.get(document.series) || [];
    group.push(document);
    groups.set(document.series, group);
  }
  return [...groups]
    .map(([name, items]) => ({
      name,
      documents: [...items].sort(
        (a, b) =>
          a.order - b.order ||
          a.filename.localeCompare(b.filename, 'en', { numeric: true }),
      ),
    }))
    .sort(
      (a, b) =>
        (seriesPriority[a.name] ?? 3) - (seriesPriority[b.name] ?? 3) ||
        a.name.localeCompare(b.name),
    );
}

export function seriesDescription(name: string) {
  if (name === 'GenAI')
    return 'Start with AI fundamentals. Explore generative models, prompting, embeddings, RAG and practical applications.';
  if (name === 'Agentic AI')
    return 'Explore agent loops, planning, tools, memory and the design of systems that work toward a goal.';
  if (name === 'System Design')
    return 'Turn AI models into useful products. Define success, choose an architecture and connect data preparation with serving.';
  return 'More visual lessons from my AI engineering fieldnotes.';
}

export function seriesAnchor(name: string) {
  return `series-${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`;
}
