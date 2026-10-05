import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browserOutput = resolve(root, 'dist/servicios-medicos-frontend/browser');
const rootOutput = resolve(root, 'dist/servicios-medicos-frontend');
const output = existsSync(browserOutput) ? browserOutput : rootOutput;
const csrPath = resolve(output, 'index.csr.html');

if (!existsSync(csrPath)) {
  throw new Error(`Missing CSR shell at ${csrPath}`);
}

let html = await readFile(csrPath, 'utf8');

html = html.replace(/<title>[^<]*<\/title>/i, '<title>Administración | Servicios Médicos RISE</title>');

const stripTag = (pattern) => {
  html = html.replace(pattern, '');
};

stripTag(/<link\b[^>]*\brel=(["'])canonical\1[^>]*>\s*/gi);
stripTag(/<meta\b[^>]*\bname=(["'])google-site-verification\1[^>]*>\s*/gi);
stripTag(/<meta\b[^>]*\bname=(["'])description\1[^>]*>\s*/gi);
stripTag(/<meta\b[^>]*\bproperty=(["'])og:[^"']*\1[^>]*>\s*/gi);
stripTag(/<meta\b[^>]*\bname=(["'])twitter:[^"']*\1[^>]*>\s*/gi);
stripTag(/<script\b[^>]*\btype=(["'])application\/ld\+json\1[^>]*>[\s\S]*?<\/script>\s*/gi);
stripTag(/<meta\b[^>]*\bname=(["'])robots\1[^>]*>\s*/gi);

if (/<meta\b[^>]*\bcharset=/i.test(html)) {
  html = html.replace(
    /<meta\b[^>]*\bcharset=[^>]*>/i,
    (match) => `${match}\n  <meta name="robots" content="noindex, nofollow">`,
  );
} else {
  html = html.replace(
    /<head([^>]*)>/i,
    '<head$1>\n  <meta name="robots" content="noindex, nofollow">',
  );
}

const outPath = resolve(output, 'admin.html');
await writeFile(outPath, html);
console.log(`Generated admin shell at ${outPath}`);
