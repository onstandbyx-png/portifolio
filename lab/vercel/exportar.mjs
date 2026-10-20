/* Static export of the lab for Vercel (no long-running servers there).
 * Input: the repo (this file's ../..) with lab/.versoes/* prepared by
 * lab/versoes/preparar.mjs. Output: <out>/
 *   lab files at the root, public/assets at /assets, versoes.json;
 *   every portfolio era as a manifest _m/<id>.json (URL path → stored file)
 *   with its files stored once by content under _c/<sha1><ext>.
 * HTML and CSS of each era are rewritten to /v/<id>/… (same rule as
 * lab/server.mjs); JS is kept byte-identical so it deduplicates, and the
 * middleware routes the absolute requests it makes by Referer. */
import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const LAB = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ROOT = resolve(LAB, '..');
const OUT = resolve(process.argv[2] || join(ROOT, 'dist-lab'));
// Private builds must never be written inside this public repository.
if (process.env.LAB_PRIVADAS && (OUT + sep).startsWith(ROOT + sep)) {
  console.error(`exportar: com LAB_PRIVADAS a saída precisa ficar fora de ${ROOT}`);
  process.exit(1);
}
const ERAS = join(LAB, '.versoes');
const {eras} = JSON.parse(readFileSync(join(LAB, 'versoes', 'portfolio.json'), 'utf8'));

function walk(dir, skip = () => false) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (skip(p, name)) continue;
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, skip)); else out.push(p);
  }
  return out;
}
const put = (rel, data) => { const p = join(OUT, rel); mkdirSync(dirname(p), {recursive: true}); writeFileSync(p, data); };
const copy = (src, rel) => { const p = join(OUT, rel); mkdirSync(dirname(p), {recursive: true}); copyFileSync(src, p); };

// 1. Lab itself (never the server or the build helpers) and the site's public assets.
for (const file of walk(LAB, (p, name) => name.startsWith('.') || ['server.mjs', 'vercel', 'node_modules'].includes(name) || p.endsWith(join('versoes', 'preparar.mjs')))) copy(file, relative(LAB, file));
for (const file of walk(join(ROOT, 'public', 'assets'))) copy(file, relative(join(ROOT, 'public'), file));

// 2. Eras: route map from each era's own server.mjs, plus /assets/* → public/assets/*.
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function routesOf(dir) {
  const src = readFileSync(join(dir, 'server.mjs'), 'utf8');
  const routes = new Map();
  for (const [, path, file] of src.matchAll(/\[\s*'(\/[^']*)'\s*,\s*'([^']+)'\s*\]/g)) if (existsSync(join(dir, file))) routes.set(path, file);
  for (const [, path, file] of src.matchAll(/'(\/[^']*)'\s*:\s*\[\s*'\.\/([^']+)'/g)) if (existsSync(join(dir, file))) routes.set(path, file);
  if (!routes.has('/') && existsSync(join(dir, 'index.html'))) routes.set('/', 'index.html');
  return routes;
}
function prefixesOf(dir, routes) {
  const names = new Set();
  for (const base of [dir, join(dir, 'public')]) if (existsSync(base)) for (const n of readdirSync(base)) if (!n.startsWith('.') && n !== 'node_modules') names.add(n);
  for (const path of routes.keys()) { const first = path.split('/')[1]; if (first) names.add(first); }
  names.delete('v');
  return [...names];
}
function rewriter(id, prefixes) {
  const alt = prefixes.map(escapeRe).join('|');
  const quoted = new RegExp(`(["'\`(])\\/(${alt})(?=[\\/"'\`?#)\\s,]|$)`, 'g');
  const srcset = new RegExp(`(,\\s*)\\/(${alt})(?=[\\/\\s,])`, 'g');
  const to = `/v/${id}/`;
  return text => text
    .replace(/srcset=(["'])([^"']*)\1/g, (m, q, val) => `srcset=${q}${val.replace(/^\s*\/(?!\/|v\/)/, ` ${to}`).replace(srcset, `$1${to}$2`).trim()}${q}`)
    .replace(quoted, `$1${to}$2`)
    // Vite's preload helper builds absolute URLs as "/" + "assets/x.js".
    .replace(/return(["`])\/\1\+(\w)\b/g, (m, q, v) => `return${q}${to}${q}+${v}`);
}

// The lab clock goes first in every version page (see lab/_lab/relogio.js).
const RELOGIO = '<script src="/_lab/relogio.js"></script>';
const injetar = text => (/<head(\s[^>]*)?>/i.test(text) ? text.replace(/<head(\s[^>]*)?>/i, m => m + RELOGIO) : RELOGIO + text);

// Eras e00/e01 hotlinked the Fatos mídia-kit deploy, now behind a password. In a private
// export (LAB_FATOS_ESTUDIO = the roblox repo's public/estudio) they are served from the lab.
const ESTUDIO = process.env.LAB_FATOS_ESTUDIO && existsSync(process.env.LAB_FATOS_ESTUDIO) ? process.env.LAB_FATOS_ESTUDIO : '';
const ESTUDIO_URL = 'https://midia-kit-production-c234.up.railway.app/estudio/';
const TEXTO = new Set(['.html', '.css', '.js', '.mjs', '.json']);
if (ESTUDIO) for (const file of walk(ESTUDIO)) copy(file, join('_lab', 'fatos-estudio', relative(ESTUDIO, file)));

const stored = new Set();
let bytes = 0;
function store(data, ext) {
  const sha = createHash('sha1').update(data).digest('hex');
  const rel = `_c/${sha}${ext}`;
  if (!stored.has(rel)) { put(rel, data); stored.add(rel); bytes += data.length; }
  return `/${rel}`;
}

const ok = [];
for (const era of eras) {
  const dir = join(ERAS, era.id);
  if (!existsSync(join(dir, 'server.mjs'))) continue;
  const routes = routesOf(dir);
  const rewrite = rewriter(era.id, prefixesOf(dir, routes));
  const manifest = {};
  const add = (path, file) => {
    const ext = extname(file).toLowerCase();
    let data = readFileSync(file);
    if (ESTUDIO && TEXTO.has(ext) && data.includes(ESTUDIO_URL)) data = Buffer.from(data.toString('utf8').split(ESTUDIO_URL).join('/_lab/fatos-estudio/'));
    if (ext === '.html' || ext === '.css') data = Buffer.from(rewrite(data.toString('utf8')));
    if (ext === '.html') data = Buffer.from(injetar(data.toString('utf8')));
    manifest[path] = store(data, ext || '.bin');
  };
  for (const [path, file] of routes) add(path, join(dir, file));
  if (existsSync(join(dir, 'public'))) for (const file of walk(join(dir, 'public'))) {
    const path = '/' + relative(join(dir, 'public'), file).split('\\').join('/');
    if (!manifest[path]) add(path, file);
  }
  put(`_m/${era.id}.json`, JSON.stringify(manifest));
  ok.push(era.id);
}

// 3. Private builds (smiile, Fatos), only when LAB_PRIVADAS points at <id>/ + <id>.json folders
// outside this repository: the output then must go to a private deploy, never to this repo.
const privadas = [];
const PRIV = process.env.LAB_PRIVADAS;
if (PRIV && existsSync(PRIV)) for (const name of readdirSync(PRIV).filter(n => n.endsWith('.json')).sort()) {
  const meta = JSON.parse(readFileSync(join(PRIV, name), 'utf8'));
  const dir = join(PRIV, String(meta.id));
  if (!/^[\w-]+$/.test(meta.id) || !existsSync(join(dir, 'index.html'))) continue;
  const rewrite = rewriter(meta.id, readdirSync(dir).filter(n => !n.startsWith('.')));
  const manifest = {};
  for (const file of walk(dir)) {
    const ext = extname(file).toLowerCase();
    let data = readFileSync(file);
    if (['.html', '.css', '.js', '.mjs'].includes(ext)) data = Buffer.from(rewrite(data.toString('utf8')));
    if (ext === '.html') data = Buffer.from(injetar(data.toString('utf8')));
    // Single-file apps that route by location.pathname (meta "subcaminho") see the path without /v/<id>.
    if (meta.subcaminho && ['.html', '.js', '.mjs'].includes(ext)) data = Buffer.from(data.toString('utf8').replace(/\blocation\.pathname\b(?!\s*=[^=])/g, `(location.pathname.replace(/^\\/v\\/[\\w-]+/, '') || '/')`));
    manifest['/' + relative(dir, file).split('\\').join('/')] = store(data, ext || '.bin');
  }
  manifest['/'] = manifest['*'] = manifest['/index.html']; // '*': SPA fallback, as lab/server.mjs does
  put(`_m/${meta.id}.json`, JSON.stringify(manifest));
  ok.push(meta.id);
  privadas.push(meta);
}
// Private Drive context (LAB_CONTEXTO, outside this repository), shown in the analysis cards.
if (process.env.LAB_CONTEXTO && existsSync(process.env.LAB_CONTEXTO)) copy(process.env.LAB_CONTEXTO, 'contexto.json');
else put('contexto.json', '{}');
// Private reference videos (LAB_REFERENCIAS), linked to elements by contexto.json.
if (process.env.LAB_REFERENCIAS && existsSync(process.env.LAB_REFERENCIAS)) for (const file of walk(process.env.LAB_REFERENCIAS)) copy(file, join('_lab', 'referencias', relative(process.env.LAB_REFERENCIAS, file)));
put('versoes.json', JSON.stringify({versoes: ok.map(id => ({id, kind: 'static'})), privadas}));
console.log(`exportado: ${ok.length} versões, ${stored.size} arquivos únicos (${Math.round(bytes / 1e6)} MB) em ${OUT}`);
