import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const copy = JSON.parse(await readFile(resolve(root, 'src/app/data/servicios.json'), 'utf8'));
const urls = ['/', '/servicios', ...copy.pages.map((page) => page.slug), '/aviso-de-privacidad', '/terminos'];
const lastmodParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Hermosillo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
const lastmod = Object.fromEntries(lastmodParts.map(({ type, value }) => [type, value]));
const lastmodDate = `${lastmod.year}-${lastmod.month}-${lastmod.day}`;
const body = urls.map((path) => `  <url>\n    <loc>https://serviciosmedicosrise.com${path}</loc>\n    <lastmod>${lastmodDate}</lastmod>\n  </url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
const browserOutput = resolve(root, 'dist/servicios-medicos-frontend/browser');
const rootOutput = resolve(root, 'dist/servicios-medicos-frontend');
const output = existsSync(browserOutput) ? browserOutput : rootOutput;
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'sitemap.xml'), xml);
console.log(`Generated ${urls.length} sitemap URLs at ${resolve(output, 'sitemap.xml')}`);
