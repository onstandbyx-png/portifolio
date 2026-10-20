/* Vercel Routing Middleware for the static lab export (lab/vercel/exportar.mjs):
 * HTTP Basic auth (LAB_USUARIO / LAB_SENHA), then /v/<id>/<path> is rewritten
 * to the stored file listed in _m/<id>.json. Absolute requests a version makes
 * without the /v/<id>/ prefix (from its JavaScript) are routed by Referer;
 * page navigations are redirected to the prefixed URL. Runs on every path, so
 * the stored files (_c/) and manifests (_m/) are behind the password too. */
const manifests = new Map();
function manifest(id, origin, authorization) {
  if (!manifests.has(id)) {
    const load = fetch(`${origin}/_m/${id}.json`, {headers: authorization ? {authorization} : {}}).then(r => (r.ok ? r.json() : null)).catch(() => null);
    manifests.set(id, load);
    load.then(map => { if (!map) manifests.delete(id); });
  }
  return manifests.get(id);
}
const next = () => new Response(null, {headers: {'x-middleware-next': '1'}});
const rewrite = url => new Response(null, {headers: {'x-middleware-rewrite': String(url)}});

export default async function middleware(request) {
  const url = new URL(request.url);
  const user = process.env.LAB_USUARIO, pass = process.env.LAB_SENHA;
  // Fails closed: without both variables nothing is served.
  if (!user || !pass) return new Response('Laboratório sem senha configurada', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
  const header = request.headers.get('authorization') || '';
  let given = '';
  try { given = header.startsWith('Basic ') ? atob(header.slice(6)) : ''; } catch {}
  if (given !== `${user}:${pass}`) {
    return new Response('Acesso restrito', {status: 401, headers: {'WWW-Authenticate': 'Basic realm="Laboratorio de elementos", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8'}});
  }
  if (url.pathname.startsWith('/_m/') || url.pathname.startsWith('/_c/')) return next();
  let id = null, path = null;
  const own = url.pathname.match(/^\/v\/([\w-]+)(\/.*)?$/);
  if (own) {
    id = own[1];
    path = own[2];
    if (!path) return Response.redirect(`${url.origin}/v/${id}/${url.search}`, 308);
  } else {
    try {
      const ref = new URL(request.headers.get('referer') || '');
      const from = ref.origin === url.origin && ref.pathname.match(/^\/v\/([\w-]+)\//);
      if (from) {
        const dest = request.headers.get('sec-fetch-dest');
        if (dest === 'document' || dest === 'iframe') return Response.redirect(`${url.origin}/v/${from[1]}${url.pathname}${url.search}`, 302);
        id = from[1];
        path = url.pathname;
      }
    } catch {}
  }
  if (!id) return next();
  const map = await manifest(id, url.origin, request.headers.get('authorization'));
  if (!map) return own ? new Response('Versão não encontrada', {status: 404}) : next();
  let clean = path;
  try { clean = decodeURIComponent(path); } catch {}
  const target = map[clean] || map[clean.replace(/\/$/, '')] || map[clean.endsWith('/') ? `${clean}index.html` : `${clean}/index.html`]
    || (own && !/\.\w+$/.test(clean) ? map['*'] : null);
  if (target) return rewrite(new URL(target + url.search, url.origin));
  return own ? new Response('Não encontrado', {status: 404, headers: {'Content-Type': 'text/plain; charset=utf-8'}}) : next();
}
