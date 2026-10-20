/* Laboratório de elementos: análise apenas, fora do site.
 * Serves lab/ at the root and the portfolio's own /assets/* from public/, so the
 * page components run unchanged. Its CSP differs from the site's on purpose:
 * 'wasm-unsafe-eval' for the Rive runtime and connect-src for the original
 * Rive (CC BY) and LottieFiles files, which are loaded from their public CDNs
 * at runtime and never copied into this repository. noindex everywhere.
 * On Railway it runs as its own service with PORTFOLIO_ENTRY=lab/server.mjs
 * (npm start falls back to the site's server.mjs when the variable is unset).
 *
 * Versions (/v/<id>/…): every portfolio era prepared by lab/versoes/preparar.mjs
 * runs with its OWN server.mjs, started on demand and stopped when idle; private
 * versions (smiile, Fatos) are other Railway services reached over private
 * networking, listed in LAB_VERSOES_PRIVADAS (JSON). Both are reverse-proxied
 * under /v/<id>/: absolute paths the version uses are rewritten, anything missed
 * is routed by Referer, and frame-ancestors allows the lab to embed it.
 * LAB_USUARIO + LAB_SENHA put the whole lab behind HTTP Basic auth. */
import {spawn} from 'node:child_process';
import {timingSafeEqual} from 'node:crypto';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
import {createServer, request as httpRequest} from 'node:http';
import {request as httpsRequest} from 'node:https';
import {extname, join, normalize, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';

const LAB = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = resolve(LAB, '..', 'public');
const PORT = Number(process.env.PORT) || 4800;
const USUARIO = process.env.LAB_USUARIO || '';
const SENHA = process.env.LAB_SENHA || '';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.tsx': 'text/plain; charset=utf-8', '.riv': 'application/octet-stream'
};
const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.md', '.tsx']);
// Never served from lab/ itself.
const PRIVATE = new Set(['server.mjs']);

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.designspells.com",
  "font-src 'self'",
  "connect-src 'self' https://public.rive.app https://cdn.rive.app https://assets-v2.lottiefiles.com",
  "media-src 'self' https://cdn.designspells.com https://public.rive.app",
  "frame-src 'self' https://*.framer.website https://heronaiapp.com https://smiile-landing-preview.up.railway.app",
  "frame-ancestors 'self'",
  "worker-src 'self' blob:",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'"
].join('; ');

const HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

/* ---------- versions ---------- */
const VERSOES = new Map();
const {eras = []} = JSON.parse(readFileSync(join(LAB, 'versoes', 'portfolio.json'), 'utf8'));
const ERAS_DIR = join(LAB, '.versoes');
eras.forEach((era, index) => {
  const dir = join(ERAS_DIR, era.id);
  if (!existsSync(join(dir, 'server.mjs'))) return;
  VERSOES.set(era.id, {id: era.id, kind: 'local', dir, port: 7100 + index, prefixes: localPrefixes(dir)});
});
for (const v of JSON.parse(process.env.LAB_VERSOES_PRIVADAS || '[]')) {
  if (!v.id || !v.upstream) continue;
  VERSOES.set(v.id, {id: v.id, kind: 'remote', upstream: new URL(v.upstream), auth: v.usuario ? 'Basic ' + Buffer.from(`${v.usuario}:${v.senha || ''}`).toString('base64') : '',
    prefixes: v.prefixos || ['assets', '_astro', 'fonts', 'images', 'img', 'media', 'static', 'icons', 'favicon.svg', 'favicon.ico']});
}

// Absolute paths an era can use: its top-level files and folders, public/, and the routes in its server.mjs.
function localPrefixes(dir) {
  const names = new Set();
  for (const base of [dir, join(dir, 'public')]) {
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) if (!name.startsWith('.') && name !== 'node_modules') names.add(name);
  }
  const server = readFileSync(join(dir, 'server.mjs'), 'utf8');
  for (const [, first] of server.matchAll(/['"`]\/([a-z][a-z0-9-]*)(?:\/[\w.-]*)*['"`]/g)) names.add(first);
  names.delete('v');
  return [...names];
}

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function rewriter(v) {
  if (v.rewrite) return v.rewrite;
  const alt = v.prefixes.map(escapeRe).join('|');
  const quoted = new RegExp(`(["'\`(])\\/(${alt})(?=[\\/"'\`?#)\\s,]|$)`, 'g');
  const srcset = new RegExp(`(,\\s*)\\/(${alt})(?=[\\/\\s,])`, 'g');
  const to = `/v/${v.id}/`;
  v.rewrite = text => text
    .replace(/srcset=(["'])([^"']*)\1/g, (m, q, val) => `srcset=${q}${val.replace(/^\s*\/(?!\/|v\/)/, ` ${to}`).replace(srcset, `$1${to}$2`).trim()}${q}`)
    .replace(quoted, `$1${to}$2`);
  return v.rewrite;
}

const procs = new Map();
function startLocal(v) {
  const running = procs.get(v.id);
  if (running) { running.last = Date.now(); return running.ready; }
  const child = spawn(process.execPath, ['server.mjs'], {cwd: v.dir, env: {...process.env, PORT: String(v.port), PORTFOLIO_ENTRY: ''}, stdio: 'ignore'});
  const entry = {child, last: Date.now()};
  entry.ready = new Promise((ok, fail) => {
    let tries = 0;
    const probe = () => {
      const req = httpRequest({host: '127.0.0.1', port: v.port, path: '/', method: 'HEAD'}, res => { res.resume(); ok(); });
      req.on('error', () => (++tries > 80 ? fail(new Error('versão não subiu')) : setTimeout(probe, 150)));
      req.end();
    };
    probe();
  });
  child.on('exit', () => procs.delete(v.id));
  procs.set(v.id, entry);
  return entry.ready;
}
setInterval(() => {
  for (const [id, p] of procs) if (Date.now() - p.last > 10 * 60 * 1000) { p.child.kill(); procs.delete(id); }
}, 60 * 1000).unref();

function versionFromReferer(req) {
  try {
    const ref = new URL(req.headers.referer);
    if (ref.host !== req.headers.host) return null;
    const m = ref.pathname.match(/^\/v\/([\w-]+)\//);
    return m && VERSOES.has(m[1]) ? m[1] : null;
  } catch { return null; }
}

function frameCsp(value) {
  const kept = String(value).split(';').map(s => s.trim()).filter(s => s && !/^frame-ancestors\b/i.test(s));
  return [...kept, "frame-ancestors 'self'"].join('; ');
}

async function proxy(req, res, v, path) {
  if (v.kind === 'local') await startLocal(v);
  const target = v.kind === 'local' ? new URL(`http://127.0.0.1:${v.port}`) : v.upstream;
  const headers = {...req.headers, host: target.host, 'accept-encoding': 'identity'};
  delete headers.authorization;
  delete headers.referer;
  if (v.auth) headers.authorization = v.auth;
  const send = target.protocol === 'https:' ? httpsRequest : httpRequest;
  const upstream = send({protocol: target.protocol, hostname: target.hostname, port: target.port, path, method: req.method, headers}, up => {
    const out = {};
    for (const [k, val] of Object.entries(up.headers)) {
      const key = k.toLowerCase();
      if (['x-frame-options', 'content-length', 'content-encoding', 'transfer-encoding', 'connection', 'strict-transport-security', 'referrer-policy', 'content-security-policy-report-only'].includes(key)) continue;
      out[k] = key === 'content-security-policy' ? frameCsp(val) : val;
    }
    out['referrer-policy'] = 'same-origin';
    out['x-robots-tag'] = 'noindex, nofollow, noarchive';
    if (!out['content-security-policy']) out['content-security-policy'] = "frame-ancestors 'self'";
    if (out.location && /^\/(?!\/|v\/)/.test(out.location)) out.location = `/v/${v.id}${out.location}`;
    const type = String(up.headers['content-type'] || '');
    if (req.method !== 'HEAD' && /text\/html|text\/css|javascript|ecmascript/.test(type)) {
      const chunks = [];
      up.on('data', c => chunks.push(c));
      up.on('end', () => {
        const body = Buffer.from(rewriter(v)(Buffer.concat(chunks).toString('utf8')));
        res.writeHead(up.statusCode, {...out, 'content-length': body.length});
        res.end(body);
      });
    } else {
      res.writeHead(up.statusCode, out);
      up.pipe(res);
    }
  });
  upstream.on('error', error => {
    if (!res.headersSent) res.writeHead(502, {...HEADERS, 'Content-Type': 'text/plain; charset=utf-8'});
    res.end(`A versão ${v.id} não respondeu: ${error.message}`);
  });
  req.pipe(upstream);
}

/* ---------- lab files ---------- */
const gzipCache = new Map();

function locate(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  if (clean.split(/[/\\]/).some(part => part.startsWith('.'))) return null;
  if (clean.startsWith('assets' + sep) || clean.startsWith('assets/')) {
    const file = resolve(PUBLIC, clean);
    return file.startsWith(PUBLIC + sep) ? file : null;
  }
  if (PRIVATE.has(clean)) return null;
  const file = resolve(LAB, clean || 'index.html');
  return file.startsWith(LAB) ? file : null;
}

async function send(req, res, file) {
  let info = await stat(file).catch(() => null);
  if (info?.isDirectory()) {
    if (!req.url.split('?')[0].endsWith('/')) {
      res.writeHead(308, {...HEADERS, Location: req.url.split('?')[0] + '/'});
      return res.end();
    }
    file = join(file, 'index.html');
    info = await stat(file).catch(() => null);
  }
  if (!info?.isFile()) return false;
  const ext = extname(file).toLowerCase();
  const headers = {...HEADERS, 'Content-Type': TYPES[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' || ext === '.json' ? 'no-cache' : 'public, max-age=3600'};
  let body = await readFile(file);
  if (TEXT.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    const key = file + ':' + info.mtimeMs;
    if (!gzipCache.has(key)) gzipCache.set(key, gzipSync(body, {level: 9}));
    body = gzipCache.get(key);
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
  }
  headers['Content-Length'] = body.length;
  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
  return true;
}

const same = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
function authorized(req) {
  if (!USUARIO || !SENHA) return true;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const [user, ...rest] = Buffer.from(header.slice(6), 'base64').toString('utf8').split(':');
  return same(user, USUARIO) && same(rest.join(':'), SENHA);
}

createServer(async (req, res) => {
  try {
    const {pathname, search} = new URL(req.url, 'http://lab');
    if (pathname === '/health') {
      res.writeHead(200, {...HEADERS, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store'});
      return res.end('ok');
    }
    if (!authorized(req)) {
      res.writeHead(401, {...HEADERS, 'WWW-Authenticate': 'Basic realm="Laboratorio de elementos", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8'});
      return res.end('Acesso restrito');
    }
    const versioned = pathname.match(/^\/v\/([\w-]+)(\/.*)?$/);
    if (versioned && VERSOES.has(versioned[1])) {
      if (!versioned[2]) { res.writeHead(308, {...HEADERS, Location: `/v/${versioned[1]}/`}); return res.end(); }
      return proxy(req, res, VERSOES.get(versioned[1]), versioned[2] + search);
    }
    const fromVersion = versionFromReferer(req);
    if (fromVersion) {
      const dest = req.headers['sec-fetch-dest'];
      if (req.method === 'GET' && (dest === 'document' || dest === 'iframe')) {
        res.writeHead(302, {...HEADERS, Location: `/v/${fromVersion}${pathname}${search}`});
        return res.end();
      }
      return proxy(req, res, VERSOES.get(fromVersion), pathname + search);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, {...HEADERS, Allow: 'GET, HEAD'});
      return res.end();
    }
    if (pathname === '/robots.txt') {
      res.writeHead(200, {...HEADERS, 'Content-Type': 'text/plain; charset=utf-8'});
      return res.end('User-agent: *\nDisallow: /\n');
    }
    if (pathname === '/versoes.json') {
      const lista = [...VERSOES.values()].map(v => ({id: v.id, kind: v.kind}));
      res.writeHead(200, {...HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache'});
      return res.end(JSON.stringify({versoes: lista, privadas: JSON.parse(process.env.LAB_VERSOES_PRIVADAS || '[]').map(({usuario, senha, upstream, ...rest}) => rest)}));
    }
    const file = locate(pathname);
    if (file && await send(req, res, file)) return;
    res.writeHead(404, {...HEADERS, 'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Não encontrado');
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, {...HEADERS, 'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Erro');
  }
}).listen(PORT, () => console.log(`laboratório em http://localhost:${PORT} (${VERSOES.size} versões)`));
