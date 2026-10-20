/* Laboratório de elementos: análise apenas, fora do site.
 * Serves lab/ at the root and the portfolio's own /assets/* from public/, so the
 * page components run unchanged. Its CSP differs from the site's on purpose:
 * 'wasm-unsafe-eval' for the Rive runtime and connect-src for the original
 * Rive (CC BY) and LottieFiles files, which are loaded from their public CDNs
 * at runtime and never copied into this repository. noindex everywhere. */
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';

const LAB = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC = resolve(LAB, '..', 'public');
const PORT = Number(process.env.PORT) || 4800;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.tsx': 'text/plain; charset=utf-8', '.riv': 'application/octet-stream'
};
const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.md', '.tsx']);
// Never served from lab/ itself.
const PRIVATE = new Set(['server.mjs', 'railway.json']);

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://public.rive.app https://cdn.rive.app https://assets-v2.lottiefiles.com",
  "media-src 'self'",
  "frame-src 'self'",
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

createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, {...HEADERS, Allow: 'GET, HEAD'});
      return res.end();
    }
    const {pathname} = new URL(req.url, 'http://lab');
    if (pathname === '/health') {
      res.writeHead(200, {...HEADERS, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store'});
      return res.end('ok');
    }
    if (pathname === '/robots.txt') {
      res.writeHead(200, {...HEADERS, 'Content-Type': 'text/plain; charset=utf-8'});
      return res.end('User-agent: *\nDisallow: /\n');
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
}).listen(PORT, () => console.log(`laboratório em http://localhost:${PORT}`));
