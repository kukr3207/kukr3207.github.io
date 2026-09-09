import { createRequire } from 'node:module';
import { readFile, mkdir, access, writeFile, rename } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

let canvasLibrary;
export async function prepareCoverVariants(root, filename) {
  // Callers validate the filename before entering this function.
  if (filename !== basename(filename))
    throw new Error('Invalid cover filename.');
  const source = await readFile(join(root, 'public/learning/covers', filename));
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
  if (!canvasLibrary) {
    const require = createRequire(import.meta.url);
    const pdfRequire = createRequire(
      require.resolve('pdfjs-dist/package.json'),
    );
    canvasLibrary = pdfRequire('@napi-rs/canvas');
  }
  const { createCanvas, loadImage } = canvasLibrary;
  const image = await loadImage(source);
  const stem = basename(filename, extname(filename));
  const directory = join(root, 'public/learning/covers/thumbnails');
  await mkdir(directory, { recursive: true });
  const variants = [];
  const widths = [
    ...new Set([320, 640, 960].map((width) => Math.min(width, image.width))),
  ];
  for (const width of widths) {
    const height = Math.max(
      1,
      Math.round((image.height * width) / image.width),
    );
    const name = `${stem}-${hash}-${width}.webp`;
    const output = join(directory, name);
    try {
      await access(output);
    } catch {
      const canvas = createCanvas(width, height);
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, width, height);
      const buffer = await canvas.encode('webp', 90);
      const temporary = `${output}.${randomUUID()}.tmp`;
      await writeFile(temporary, buffer);
      await rename(temporary, output);
    }
    variants.push({
      url: `/learning/covers/thumbnails/${encodeURIComponent(name)}`,
      width,
      height,
    });
  }
  return variants;
}
