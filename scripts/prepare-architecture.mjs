import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const diagrams = JSON.parse(
  await readFile(join(root, 'content/architecture.json'), 'utf8'),
);
const directory = resolve(root, 'public/architecture');
await mkdir(directory, { recursive: true });
const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
for (const [slug, diagram] of Object.entries(diagrams)) {
  const height = 140 + diagram.rows.length * 184 + 220;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">${escape(diagram.title)}</title><desc id="desc">A public architecture sketch of documented components. Connections summarize the workflow; internal interfaces are omitted.</desc>`,
    '<rect width="100%" height="100%" rx="16" fill="#fafbf9"/>',
    '<g font-family="Kalam, Comic Sans MS, Segoe Print, cursive" fill="#202523">',
    `<text x="600" y="58" text-anchor="middle" font-size="34">${escape(diagram.title)}</text>`,
    '<text x="600" y="92" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#66715e">PUBLIC ARCHITECTURE SKETCH</text>',
  ];
  const locations = diagram.rows.map((row, rowIndex) =>
    row.map((labels, index) => ({
      x: row.length === 1 ? 600 : index === 0 ? 300 : 900,
      y: 140 + rowIndex * 184,
      labels,
    })),
  );
  for (let row = 0; row < locations.length - 1; row++) {
    for (const from of locations[row])
      for (const to of locations[row + 1]) {
        const y = from.y + 118;
        parts.push(
          `<path d="M${from.x} ${y} C${from.x} ${y + 34} ${to.x} ${to.y - 34} ${to.x} ${to.y - 8}" fill="none" stroke="#202523" stroke-width="2" stroke-linecap="round"/>`,
        );
      }
    for (const to of locations[row + 1])
      parts.push(
        `<path d="M${to.x - 7} ${to.y - 19} L${to.x} ${to.y - 8} L${to.x + 7} ${to.y - 19}" fill="none" stroke="#202523" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
  }
  for (const [row, nodes] of locations.entries())
    for (const { x, y, labels } of nodes) {
      const left = x - 215;
      const fill =
        row === locations.length - 1
          ? '#dbf796'
          : row === 0
            ? '#edf0ff'
            : '#ffffff';
      parts.push(
        `<path d="M${left + 3} ${y + 2} L${left + 427} ${y} L${left + 430} ${y + 116} L${left} ${y + 119} Z" fill="${fill}" stroke="#202523" stroke-width="2" stroke-linejoin="round"/>`,
      );
      parts.push(
        `<text x="${x}" y="${y + 49}" text-anchor="middle" font-size="27">${escape(labels[0])}</text>`,
      );
      parts.push(
        `<text x="${x}" y="${y + 84}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#536549">${escape(labels[1])}</text>`,
      );
    }
  const baseline = 140 + diagram.rows.length * 184;
  parts.push(
    `<path d="M70 ${baseline + 5} H865" stroke="#aab69e" stroke-width="1.5" stroke-dasharray="5 6"/>`,
    `<text x="75" y="${baseline + 48}" font-size="25" fill="#243de2">Supporting engineering</text>`,
    `<text x="75" y="${baseline + 82}" font-size="19" font-family="Arial, sans-serif">${escape(diagram.delivery)}</text>`,
    `<text x="75" y="${baseline + 146}" font-size="16" fill="#66715e" font-family="Arial, sans-serif">High-level representation. No internal endpoints, configurations or client data.</text>`,
    '</g></svg>',
  );
  await writeFile(join(directory, `${slug}.svg`), parts.join('\n'));
}
console.log(`Architecture sketches prepared: ${Object.keys(diagrams).length}.`);
