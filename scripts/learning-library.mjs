import {
  readdir,
  readFile,
  stat,
  mkdir,
  writeFile,
  copyFile,
  unlink,
  rename,
  realpath,
} from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { prepareCoverVariants } from './learning-thumbnails.mjs';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const naturalSort = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});
const plainText = (value, fallback = '') =>
  typeof value === 'string' ? value.trim() : fallback;

export async function buildLearningCatalog(root = projectRoot) {
  const directory = join(root, 'public/learning');
  await mkdir(directory, { recursive: true });
  let metadata = {};
  try {
    metadata = JSON.parse(
      await readFile(join(root, 'content/learning-notes.json'), 'utf8'),
    );
  } catch (error) {
    if (error.code !== 'ENOENT')
      throw new Error('The learning metadata must contain valid JSON.');
  }
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata))
    throw new Error(
      'The learning metadata must be an object keyed by PDF filename.',
    );
  const files = (await readdir(directory, { withFileTypes: true })).filter(
    (file) => file.isFile() && /\.pdf$/i.test(file.name),
  );
  const documents = await Promise.all(
    files.map(async (file) => {
      const info = await stat(join(directory, file.name));
      const note = metadata[file.name] || {};
      const fallbackTitle = file.name
        .replace(/\.pdf$/i, '')
        .replace(/\s*\(\d+\)\s*$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const number = file.name.match(/\d+/)?.[0];
      const inferredSeries = /^gen[\s_-]?ai\b/i.test(file.name)
        ? 'GenAI'
        : /^agentic\b/i.test(file.name)
          ? 'Agentic AI'
          : 'Fieldnotes';
      let cover = null;
      let coverVariants = [];
      const coverFile = plainText(note.cover);
      if (
        coverFile &&
        coverFile === basename(coverFile) &&
        /\.(png|jpe?g|webp)$/i.test(coverFile)
      ) {
        try {
          if ((await stat(join(directory, 'covers', coverFile))).isFile()) {
            cover = `/learning/covers/${encodeURIComponent(coverFile)}`;
            try {
              coverVariants = await prepareCoverVariants(root, coverFile);
            } catch (error) {
              console.warn(
                `Using original cover for ${file.name}: ${error.message}`,
              );
            }
          }
        } catch {}
      }
      return {
        id: file.name,
        filename: file.name,
        series: plainText(note.series, inferredSeries) || inferredSeries,
        lesson:
          Number.isInteger(note.lesson) && note.lesson > 0
            ? note.lesson
            : number && Number(number) > 0
              ? Number(number)
              : null,
        title: plainText(note.title, fallbackTitle) || fallbackTitle,
        summary: plainText(note.summary),
        topics: Array.isArray(note.topics)
          ? note.topics
              .filter((topic) => typeof topic === 'string' && topic.trim())
              .slice(0, 5)
          : [],
        pages:
          Number.isInteger(note.pages) && note.pages > 0 ? note.pages : null,
        order: Number.isFinite(note.order)
          ? note.order
          : number
            ? Number(number)
            : Number.MAX_SAFE_INTEGER,
        cover,
        coverVariants,
        url: `/learning/${encodeURIComponent(file.name)}`,
        bytes: info.size,
        updatedAt: info.mtime.toISOString(),
      };
    }),
  );
  documents.sort(
    (a, b) => a.order - b.order || naturalSort.compare(a.filename, b.filename),
  );
  return { schemaVersion: 1, documents };
}

async function writeIfChanged(path, content) {
  try {
    if ((await readFile(path, 'utf8')) === content) return;
  } catch {}
  await mkdir(resolve(path, '..'), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporary, content);
  await rename(temporary, path);
}

export async function syncLearningLibrary(
  root = projectRoot,
  { mirror = false } = {},
) {
  const catalog = await buildLearningCatalog(root);
  const serialized = JSON.stringify(catalog, null, 2) + '\n';
  await writeIfChanged(join(root, 'public/learning/catalog.json'), serialized);
  await writeIfChanged(join(root, 'lib/learning-catalog.json'), serialized);
  if (mirror) {
    const destination = join(root, 'dist/client/learning');
    await mkdir(join(destination, 'covers'), { recursive: true });
    const activeNames = new Set(
      catalog.documents.map((document) => document.filename),
    );
    for (const entry of await readdir(destination, { withFileTypes: true })) {
      if (
        entry.isFile() &&
        /\.pdf$/i.test(entry.name) &&
        !activeNames.has(entry.name)
      )
        await unlink(join(destination, entry.name));
    }
    for (const document of catalog.documents) {
      const source = join(root, 'public/learning', document.filename),
        target = join(destination, document.filename);
      await copyFile(source, target);
      if (document.cover) {
        const coverName = decodeURIComponent(document.cover.split('/').at(-1));
        await copyFile(
          join(root, 'public/learning/covers', coverName),
          join(destination, 'covers', coverName),
        );
      }
      for (const variant of document.coverVariants) {
        const relative = decodeURIComponent(
          variant.url.slice('/learning/'.length),
        );
        await mkdir(resolve(join(destination, relative), '..'), {
          recursive: true,
        });
        await copyFile(
          join(root, 'public/learning', relative),
          join(destination, relative),
        );
      }
    }
    // Publish the manifest last, after every referenced file is available.
    await writeIfChanged(join(destination, 'catalog.json'), serialized);
  }
  return catalog;
}

if (
  process.argv[1] &&
  (await realpath(process.argv[1])) === fileURLToPath(import.meta.url)
) {
  const keepWatching = process.argv.includes('--watch');
  const run = async () => {
    const catalog = await syncLearningLibrary(projectRoot, {
      mirror: keepWatching || process.argv.includes('--mirror'),
    });
    console.log(`Learning library: ${catalog.documents.length} documents.`);
  };
  await run();
  if (keepWatching) {
    await mkdir(join(projectRoot, 'content'), { recursive: true });
    await mkdir(join(projectRoot, 'public/learning/covers'), {
      recursive: true,
    });
    // Poll file metadata so syncing also works where native filesystem watches are unavailable.
    const fingerprint = async () => {
      const paths = [join(projectRoot, 'content/learning-notes.json')];
      for (const folder of ['public/learning', 'public/learning/covers']) {
        for (const entry of await readdir(join(projectRoot, folder), {
          withFileTypes: true,
        })) {
          if (
            entry.isFile() &&
            (folder.endsWith('covers') || /\.pdf$/i.test(entry.name))
          )
            paths.push(join(projectRoot, folder, entry.name));
        }
      }
      return JSON.stringify(
        await Promise.all(
          paths
            .sort((a, b) => naturalSort.compare(a, b))
            .map(async (path) => {
              try {
                const info = await stat(path);
                return [path, info.size, info.mtimeMs, info.ctimeMs];
              } catch (error) {
                if (error.code === 'ENOENT') return [path, null];
                throw error;
              }
            }),
        ),
      );
    };
    let previous = await fingerprint();
    let running = false;
    setInterval(async () => {
      if (running) return;
      running = true;
      try {
        const current = await fingerprint();
        if (current !== previous) {
          await run();
          previous = current;
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        running = false;
      }
    }, 2000);
    console.log(
      'Watching learning PDFs, covers and metadata. Changes also update the local static preview.',
    );
  }
}
