import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const out = new URL('../public/downloads/', import.meta.url);
mkdirSync(out, { recursive: true });
const engine = readFileSync(
  new URL('../lib/demo-engine.ts', import.meta.url),
  'utf8',
);
writeFileSync(new URL('demo-engine.ts', out), engine);
writeFileSync(new URL('demo-engine.txt', out), engine);
const tests = readFileSync(
  new URL('../tests/demo-engine.test.mjs', import.meta.url),
  'utf8',
);
writeFileSync(
  new URL('demo-engine.test.mjs', out),
  tests.replace('../lib/demo-engine.ts', './demo-engine.ts'),
);
copyFileSync(
  new URL('../examples/README.md', import.meta.url),
  new URL('README.md', out),
);
