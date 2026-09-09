import { cp, mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const packagePath = require.resolve('pdfjs-dist/package.json');
const { version } = JSON.parse(await readFile(packagePath, 'utf8'));
const source = dirname(packagePath);
const destination = new URL(`../public/pdfjs/${version}/`, import.meta.url);
await mkdir(destination, { recursive: true });
await cp(
  join(source, 'build/pdf.worker.min.mjs'),
  new URL('pdf.worker.min.mjs', destination),
);
for (const folder of ['wasm', 'cmaps', 'standard_fonts']) {
  await cp(join(source, folder), new URL(`${folder}/`, destination), {
    recursive: true,
  });
}
await cp(join(source, 'LICENSE'), new URL('LICENSE', destination));
console.log('Local PDF reader assets prepared.');
