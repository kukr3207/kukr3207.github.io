import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  unlink,
  utimes,
  copyFile,
} from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import {
  buildLearningCatalog,
  syncLearningLibrary,
} from '../scripts/learning-library.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'learning-library-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'public/learning/covers'), { recursive: true });
  await mkdir(join(root, 'content'), { recursive: true });
  return root;
}

test('discovers PDFs in natural order without metadata; ignores other files and directories', async (t) => {
  const root = await fixture(t);
  for (const name of [
    'Agentic - 10.pdf',
    'Agentic - 2.PDF',
    'Agentic - 1.pdf',
  ]) {
    await writeFile(join(root, 'public/learning', name), '%PDF-1.7 example');
  }
  await writeFile(join(root, 'public/learning/notes.txt'), 'not a module');
  await mkdir(join(root, 'public/learning/folder.pdf'));
  const { documents } = await buildLearningCatalog(root);
  assert.deepEqual(
    documents.map((doc) => doc.title),
    ['Agentic 1', 'Agentic 2', 'Agentic 10'],
  );
  assert.equal(documents.length, 3);
  assert.equal(documents[0].url, '/learning/Agentic%20-%201.pdf');
  assert.equal(documents[0].cover, null);
  assert.equal(documents[0].pages, null);
});

test('uses optional metadata only for existing PDFs and existing safe cover paths', async (t) => {
  const root = await fixture(t);
  await writeFile(
    join(root, 'public/learning/Agentic - 12 (1).pdf'),
    '%PDF example',
  );
  await writeFile(join(root, 'public/learning/New-topic.pdf'), '%PDF example');
  await writeFile(
    join(root, 'public/learning/covers/lesson.png'),
    'cover fixture',
  );
  await writeFile(
    join(root, 'content/learning-notes.json'),
    JSON.stringify({
      'Agentic - 12 (1).pdf': {
        title: 'Agent teams',
        pages: 20,
        order: 1,
        cover: 'lesson.png',
        topics: ['Handoffs'],
      },
      'New-topic.pdf': { cover: '../private.png' },
      'Missing.pdf': { title: 'This must not appear' },
    }),
  );
  const { documents } = await buildLearningCatalog(root);
  assert.equal(documents.length, 2);
  assert.equal(documents[0].title, 'Agent teams');
  assert.equal(documents[0].pages, 20);
  assert.equal(documents[0].cover, '/learning/covers/lesson.png');
  assert.equal(documents[1].title, 'New topic');
  assert.equal(documents[1].cover, null);
});

test('assigns series and stable lesson numbers for new PDFs without requiring metadata', async (t) => {
  const root = await fixture(t);
  for (const name of [
    'GenAI - 31.pdf',
    'Agentic - 13.pdf',
    'System Design - 5.pdf',
    'New notes.pdf',
    'Custom - 9.pdf',
  ])
    await writeFile(join(root, 'public/learning', name), '%PDF fixture');
  await writeFile(
    join(root, 'content/learning-notes.json'),
    JSON.stringify({ 'Custom - 9.pdf': { series: 'ML Systems', lesson: 4 } }),
  );
  const { documents } = await buildLearningCatalog(root);
  const byName = Object.fromEntries(
    documents.map((document) => [document.filename, document]),
  );
  assert.equal(byName['GenAI - 31.pdf'].series, 'GenAI');
  assert.equal(byName['GenAI - 31.pdf'].lesson, 31);
  assert.equal(byName['Agentic - 13.pdf'].series, 'Agentic AI');
  assert.equal(byName['Agentic - 13.pdf'].lesson, 13);
  assert.equal(byName['System Design - 5.pdf'].series, 'System Design');
  assert.equal(byName['System Design - 5.pdf'].lesson, 5);
  assert.equal(byName['New notes.pdf'].series, 'Fieldnotes');
  assert.equal(byName['New notes.pdf'].lesson, null);
  assert.equal(byName['Custom - 9.pdf'].series, 'ML Systems');
  assert.equal(byName['Custom - 9.pdf'].lesson, 4);
});

test('syncs additions, replacements and removals to the static preview without deleting its page', async (t) => {
  const root = await fixture(t);
  const source = join(root, 'public/learning/First.pdf');
  await writeFile(source, '%PDF first');
  let catalog = await syncLearningLibrary(root, { mirror: true });
  assert.equal(catalog.documents.length, 1);
  await writeFile(
    join(root, 'dist/client/learning/index.html'),
    '<main>Library</main>',
  );
  await writeFile(join(root, 'public/learning/Second.PDF'), '%PDF second');
  catalog = await syncLearningLibrary(root, { mirror: true });
  assert.equal(catalog.documents.length, 2);
  assert.equal(
    await readFile(join(root, 'dist/client/learning/Second.PDF'), 'utf8'),
    '%PDF second',
  );
  // A same-size replacement with an older modification time must still reach the preview.
  await writeFile(source, '%PDF other');
  await utimes(source, new Date(0), new Date(0));
  await syncLearningLibrary(root, { mirror: true });
  assert.equal(
    await readFile(join(root, 'dist/client/learning/First.pdf'), 'utf8'),
    '%PDF other',
  );
  await unlink(source);
  catalog = await syncLearningLibrary(root, { mirror: true });
  assert.equal(catalog.documents.length, 1);
  await assert.rejects(readFile(join(root, 'dist/client/learning/First.pdf')), {
    code: 'ENOENT',
  });
  assert.equal(
    await readFile(join(root, 'dist/client/learning/index.html'), 'utf8'),
    '<main>Library</main>',
  );
  const exported = JSON.parse(
    await readFile(join(root, 'dist/client/learning/catalog.json'), 'utf8'),
  );
  assert.deepEqual(exported, catalog);
  assert.deepEqual(
    JSON.parse(await readFile(join(root, 'lib/learning-catalog.json'), 'utf8')),
    catalog,
  );
});

test('generates responsive covers, preserves originals, and refreshes image URLs after replacement', async (t) => {
  const root = await fixture(t);
  const require = createRequire(import.meta.url);
  const pdfRequire = createRequire(require.resolve('pdfjs-dist/package.json'));
  const { createCanvas, loadImage } = pdfRequire('@napi-rs/canvas');
  const image = createCanvas(720, 360);
  const context = image.getContext('2d');
  context.fillStyle = '#243de2';
  context.fillRect(0, 0, 720, 360);
  const original = await image.encode('png');
  const source = join(root, 'public/learning/covers/lesson.png');
  await writeFile(source, original);
  await writeFile(join(root, 'public/learning/GenAI - 31.pdf'), '%PDF fixture');
  await writeFile(
    join(root, 'content/learning-notes.json'),
    JSON.stringify({
      'GenAI - 31.pdf': { cover: 'lesson.png' },
    }),
  );
  const first = await syncLearningLibrary(root, { mirror: true });
  const variants = first.documents[0].coverVariants;
  assert.deepEqual(
    variants.map((item) => [item.width, item.height]),
    [
      [320, 160],
      [640, 320],
      [720, 360],
    ],
  );
  assert.deepEqual(await readFile(source), original);
  for (const variant of variants) {
    const path = decodeURIComponent(variant.url.slice(1));
    const exported = await readFile(join(root, 'dist/client', path));
    assert.deepEqual(exported, await readFile(join(root, 'public', path)));
    const decoded = await loadImage(exported);
    assert.equal(decoded.width, variant.width);
    assert.equal(decoded.height, variant.height);
  }
  context.fillStyle = '#dbf796';
  context.fillRect(0, 0, 720, 360);
  await writeFile(source, await image.encode('png'));
  const updated = await syncLearningLibrary(root, { mirror: true });
  assert.notEqual(updated.documents[0].coverVariants[0].url, variants[0].url);
});

test('supports an empty collection and rejects broken metadata before replacing the catalog', async (t) => {
  const root = await fixture(t);
  const first = await syncLearningLibrary(root);
  assert.equal(first.documents.length, 0);
  await writeFile(join(root, 'content/learning-notes.json'), '{broken');
  await assert.rejects(syncLearningLibrary(root), /valid JSON/);
  assert.deepEqual(
    JSON.parse(
      await readFile(join(root, 'public/learning/catalog.json'), 'utf8'),
    ),
    first,
  );
});

test(
  'the CLI watcher discovers additions and removals without a rebuild',
  { timeout: 15000 },
  async (t) => {
    const root = await fixture(t);
    await mkdir(join(root, 'scripts'));
    await copyFile(
      new URL('../scripts/learning-library.mjs', import.meta.url),
      join(root, 'scripts/learning-library.mjs'),
    );
    await copyFile(
      new URL('../scripts/learning-thumbnails.mjs', import.meta.url),
      join(root, 'scripts/learning-thumbnails.mjs'),
    );
    const child = spawn(
      process.execPath,
      [join(root, 'scripts/learning-library.mjs'), '--watch'],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const finished = new Promise((resolve) => child.once('exit', resolve));
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    async function waitFor(predicate) {
      for (let i = 0; i < 120; i++) {
        if (await predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      throw new Error(`Watcher did not update: ${output}`);
    }
    async function countIs(expected) {
      try {
        return (
          JSON.parse(
            await readFile(
              join(root, 'dist/client/learning/catalog.json'),
              'utf8',
            ),
          ).documents.length === expected
        );
      } catch {
        return false;
      }
    }
    try {
      await waitFor(() => output.includes('Watching learning PDFs'));
      await writeFile(
        join(root, 'public/learning/Module 13.pdf'),
        '%PDF fixture',
      );
      await waitFor(() => countIs(1));
      assert.equal(
        await readFile(
          join(root, 'dist/client/learning/Module 13.pdf'),
          'utf8',
        ),
        '%PDF fixture',
      );
      await unlink(join(root, 'public/learning/Module 13.pdf'));
      await waitFor(() => countIs(0));
    } finally {
      child.kill();
      await finished;
    }
  },
);
