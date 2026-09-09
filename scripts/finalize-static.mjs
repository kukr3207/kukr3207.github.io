import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('dist/client');
// This vinext release redirects slash-suffixed routes during prerender.
// Export without that redirect, then use directory indexes for static hosts.
function normalize(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['_next', 'downloads'].includes(entry.name)) normalize(file);
    } else if (
      entry.name.endsWith('.html') &&
      !['index.html', '404.html'].includes(entry.name)
    ) {
      const route = file.slice(0, -5);
      mkdirSync(route, { recursive: true });
      renameSync(file, join(route, 'index.html'));
      if (existsSync(`${route}.rsc`))
        renameSync(`${route}.rsc`, join(route, 'index.rsc'));
    }
  }
}
normalize(root);
writeFileSync(join(root, '.nojekyll'), '');
const required = [
  'index.html',
  '404.html',
  'case-studies/graph-rag/index.html',
  'case-studies/verifier-design/index.html',
  'lab/embeddings/index.html',
  'lab/evaluation/index.html',
  'source/index.html',
  'projects/index.html',
  'learning/index.html',
  'learning/catalog.json',
  'projects/enterprise-knowledge-retrieval/index.html',
  'projects/incident-intelligence/index.html',
  'projects/commerce-recommendations/index.html',
  'projects/inventory-revenue-analytics/index.html',
  'projects/unified-virtual-assistants/index.html',
  'projects/hospital-helpdesk-nlp/index.html',
  'projects/support-anomaly-detection/index.html',
  'projects/support-sentiment-analysis/index.html',
  'downloads/demo-engine.ts',
  'downloads/demo-engine.txt',
  'downloads/demo-engine.test.mjs',
  'downloads/README.md',
  'favicon.svg',
  'illustrations/builder.png',
  'illustrations/reader.png',
  'illustrations/explainer.png',
  'experience/netskope/index.html',
  'experience/servicenow/index.html',
  'experience/swym/index.html',
  'experience/dhan-ai/index.html',
  'experience/synopsys/index.html',
  'artifacts/evaluation-companion.zip',
  'artifacts/evaluation/evaluate_outputs.py',
  'artifacts/evaluation/evaluate_outputs.txt',
];
for (const slug of Object.keys(
  JSON.parse(readFileSync('content/architecture.json', 'utf8')),
))
  required.push(`architecture/${slug}.svg`);
for (const fixture of [
  'retrieval',
  'incident-triage',
  'recommendations',
  'inventory',
  'anomaly-detection',
  'sentiment',
]) {
  required.push(`artifacts/evaluation/${fixture}.json`);
  required.push(`artifacts/evaluation/sample-reports/${fixture}-report.json`);
}
const learningCatalog = JSON.parse(
  readFileSync(join(root, 'learning/catalog.json'), 'utf8'),
);
const { version: pdfReaderVersion } = JSON.parse(
  readFileSync('node_modules/pdfjs-dist/package.json', 'utf8'),
);
required.push(`pdfjs/${pdfReaderVersion}/pdf.worker.min.mjs`);
for (const document of learningCatalog.documents) {
  required.push(decodeURIComponent(document.url.slice(1)));
  if (document.cover)
    required.push(decodeURIComponent(document.cover.slice(1)));
  for (const variant of document.coverVariants ?? [])
    required.push(decodeURIComponent(variant.url.slice(1)));
}
for (const path of required) {
  if (!existsSync(join(root, path)) || statSync(join(root, path)).size === 0) {
    throw new Error(`Static export is missing a required file: ${path}`);
  }
}
console.log(
  `Static export complete: ${required.length} required pages and assets verified.`,
);
