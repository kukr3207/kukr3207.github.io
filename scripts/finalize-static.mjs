import {
  existsSync,
  mkdirSync,
  readdirSync,
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
  'source/index.html',
  'downloads/demo-engine.ts',
  'downloads/demo-engine.txt',
  'downloads/demo-engine.test.mjs',
  'downloads/README.md',
  'favicon.svg',
];
for (const path of required) {
  if (!existsSync(join(root, path)) || statSync(join(root, path)).size === 0) {
    throw new Error(`Static export is missing a required file: ${path}`);
  }
}
console.log(
  `Static export complete: ${required.length} required pages and assets verified.`,
);
