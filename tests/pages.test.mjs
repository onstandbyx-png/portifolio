/* Unit contracts of the parallel pages (SPEC 8.2): routes, redirects, CSP,
 * HTML rules, network-free modules, handoff links and motion tokens.
 * Pages that do not exist yet are reported as pending (404) and checked
 * automatically as soon as their pages/*.html file is added.
 * Page-specific unit tests go in tests/pages-<route>.test.mjs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join, relative} from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const ORIGIN = 'https://portifolio-github-production.up.railway.app';
const PAGES = Object.freeze([
  {route: '/criadores', file: 'pages/criadores.html', kind: 'criadores'},
  {route: '/criadores/ao-vivo', file: 'pages/criadores-ao-vivo.html', kind: 'criadores'},
  {route: '/vagas', file: 'pages/vagas.html', kind: 'vagas'},
  {route: '/privacidade', file: 'pages/privacidade.html', kind: 'privacidade'},
  {route: '/creditos', file: 'pages/creditos.html', kind: 'creditos'}
]);
const present = PAGES.filter(page => existsSync(join(root, page.file)));

/* ---------- helpers ---------- */
const withoutComments = html => html.replace(/<!--[\s\S]*?-->/g, '');
function visibleText(html) {
  return withoutComments(html)
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}
const walk = dir => readdirSync(dir).flatMap(name => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});
const pageModules = () => walk(join(root, 'public/assets/pages'));

/* ---------- server ---------- */
const PORT = 4317;
const base = `http://127.0.0.1:${PORT}`;
let server;
async function startServer() {
  if (server) return;
  server = spawn(process.execPath, ['server.mjs'], {cwd: root, env: {...process.env, PORT: String(PORT)}, stdio: 'ignore'});
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('server.mjs did not start on PORT=4317');
}
test.after(() => server?.kill());

test('server.mjs declares the four exact routes and the four trailing-slash redirects', () => {
  const source = read('server.mjs');
  for (const page of PAGES) assert.ok(source.includes(`['${page.route}','${page.file}']`), `route ${page.route}`);
  for (const page of PAGES) assert.ok(source.includes(`['${page.route}/','${page.route}']`), `redirect ${page.route}/`);
  assert.match(source, /if\(redirects\.has\(path\)\)\{res\.writeHead\(308,\{Location:redirects\.get\(path\)\+url\.search,\.\.\.headers\}\)/);
  assert.ok(source.indexOf("path==='/health'") < source.indexOf('redirects.has(path)'), 'redirects come right after /health');
});

test('routes answer 200 with the same CSP as /, or 404 while the page file is pending', async () => {
  await startServer();
  const home = await fetch(`${base}/`);
  assert.equal(home.status, 200, '/ stays 200');
  const csp = home.headers.get('content-security-policy');
  assert.match(csp, /script-src 'self'/);
  assert.ok(present.some(page => page.route === '/privacidade'), '/privacidade is mandatory (SPEC 2.1)');
  for (const page of PAGES) {
    const response = await fetch(`${base}${page.route}`);
    if (present.includes(page)) {
      assert.equal(response.status, 200, page.route);
      assert.match(response.headers.get('content-type'), /^text\/html/);
      assert.equal(response.headers.get('content-security-policy'), csp, `${page.route} keeps the home CSP`);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(response.headers.get('cache-control'), 'no-cache');
      assert.ok((await response.text()).includes('<html lang="pt-BR">'));
    } else {
      assert.equal(response.status, 404, `${page.route} is pending until ${page.file} exists`);
      await response.arrayBuffer();
    }
  }
});

test('trailing-slash forms redirect with 308 and keep the query string', async () => {
  await startServer();
  const csp = (await fetch(`${base}/`)).headers.get('content-security-policy');
  for (const page of PAGES) {
    for (const query of ['', '?ref=dm', '?ref=qr&x=1%202']) {
      const response = await fetch(`${base}${page.route}/${query}`, {redirect: 'manual'});
      assert.equal(response.status, 308, `${page.route}/${query}`);
      assert.equal(response.headers.get('location'), page.route + query);
      assert.equal(response.headers.get('content-security-policy'), csp);
    }
  }
  // Location is always a same-site path taken from the redirects map.
  const odd = await fetch(`${base}/vagas/?next=https://example.com/%0D%0AX:1`, {redirect: 'manual'});
  assert.equal(odd.status, 308);
  assert.match(odd.headers.get('location'), /^\/vagas\?next=https:\/\/example\.com\/%0D%0AX:1$/);
});

test('pages/*.html are served only through their routes', async () => {
  await startServer();
  for (const path of ['/pages/criadores.html', '/pages/privacidade.html', '/assets/../pages/privacidade.html', '/criadores.html', '/privacidade.html']) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 404, path);
    await response.arrayBuffer();
  }
  assert.equal((await fetch(`${base}/health`)).status, 200);
});

/* ---------- HTML rules ---------- */
for (const page of present) {
  test(`${page.file}: CSP-safe markup and the shared shell`, () => {
    const raw = read(page.file);
    const html = withoutComments(raw);
    assert.match(raw, /^<!doctype html>/i, 'standards mode');
    assert.ok(html.includes('<html lang="pt-BR">'));
    for (const tag of html.match(/<script\b[^>]*>/gi) || []) assert.match(tag, /\bsrc="\/assets\/[^"]+"/, `script without src: ${tag}`);
    assert.doesNotMatch(html, /<script\b[^>]*>[^<]+<\/script>/i, 'no inline script body');
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'no on* handlers');
    assert.doesNotMatch(html, /style\s*=\s*"[^"]*url\(\s*['"]?(?:https?:)?\/\//i, 'no external url() in style');
    assert.doesNotMatch(html, /<(?:iframe|embed|object)\b/i, 'no third-party embeds');
    assert.doesNotMatch(html, /<form\b[^>]*\b(?:action|method)\s*=/i, 'forms never post anywhere');
    for (const form of html.match(/<form\b[^>]*>/gi) || []) assert.match(form, /\bnovalidate\b/, 'forms use novalidate');
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, 'one h1');
    assert.match(html, /<a class="pg-skip" href="#conteudo">Pular para o conteúdo<\/a>/);
    assert.match(html, /<main id="conteudo"/);
    assert.ok(html.indexOf('</main>') < html.indexOf('<footer class="site-footer"'), 'footer outside main');
    assert.match(html, /<button id="motion-toggle" class="motion-toggle"/);
    assert.match(html, /id="menu-toggle"[^>]*aria-controls="mobile-nav"/);
    assert.match(html, /id="mobile-nav"[^>]*hidden/);
    assert.ok(html.includes(`<link rel="canonical" href="${ORIGIN}${page.route}">`), 'canonical');
    assert.ok(html.includes('href="/privacidade#acessibilidade"'), 'accessibility anchor in the footer');
    assert.ok(html.includes('href="/privacidade"'), 'privacy notice link');
    assert.ok(html.includes('<script src="/assets/profile.js" defer></script>'), 'profile.js loads before the modules');
    const profile = html.indexOf('/assets/profile.js'), module = html.search(/<script type="module"/);
    assert.ok(module > profile, 'classic profile script precedes module scripts');
    for (const link of html.match(/<a\b[^>]*target="_blank"[^>]*>[\s\S]*?<\/a>/gi) || [])
      assert.match(link, /<span class="pg-visually-hidden"> \(abre em nova aba\)<\/span><\/a>$/, `new-tab link without a screen-reader warning: ${link.slice(0, 120)}`);
    for (const img of html.match(/<img\b[^>]*>/gi) || []) {
      assert.doesNotMatch(img, /src="[^"]*brands\//i, 'no platform brand assets');
      assert.doesNotMatch(img, /src="[^"]*(?:tiktok|instagram|youtube|twitch|kick|kwai|snapchat|facebook|meta|whatsapp)/i, `no platform logo: ${img}`);
    }
  });

  test(`${page.file}: every /assets reference exists and every script parses`, () => {
    const html = withoutComments(read(page.file));
    const refs = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)/g)].map(match => match[1]);
    assert.ok(refs.length > 0);
    for (const ref of refs) {
      const file = join(root, 'public', ref);
      assert.ok(existsSync(file), `missing ${ref}`);
      if (ref.endsWith('.js')) {
        const result = spawnSync(process.execPath, ['--check', file], {encoding: 'utf8'});
        assert.equal(result.status, 0, `${ref}: ${result.stderr}`);
      }
    }
  });
}

test('base.css: viewport-fit=cover gutters clear the safe-area insets on both sides', () => {
  const css = read('public/assets/pages/base.css');
  assert.match(css, /--gutter:max\(20px,env\(safe-area-inset-left,0px\),env\(safe-area-inset-right,0px\)\)/);
  assert.match(css, /@media \(max-width:359px\)\{:root\{--gutter:max\(16px,env\(safe-area-inset-left,0px\),env\(safe-area-inset-right,0px\)\)\}\}/);
  for (const page of present) assert.match(read(page.file), /viewport-fit=cover/, page.file);
});

/* ---------- text guards (SPEC 6 and 8.2; visible text only) ---------- */
for (const page of present.filter(item => item.kind === 'criadores')) {
  test(`${page.file}: no invented numbers, prices or implied partnerships`, () => {
    const text = visibleText(read(page.file));
    assert.doesNotMatch(text, /R\$/);
    assert.doesNotMatch(text, /\d+\s?%/);
    assert.doesNotMatch(text, /\d+\s?(?:mil|k)\s+seguidores/i);
    assert.doesNotMatch(text, /aprovado pelo CONAR/i);
    assert.doesNotMatch(text, /Backstage/i);
    assert.doesNotMatch(text, /vincular sua conta/i);
  });
}
for (const page of present.filter(item => item.kind === 'vagas')) {
  test(`${page.file}: honest talent pool, never a job posting`, () => {
    const raw = read(page.file), text = visibleText(raw);
    assert.doesNotMatch(raw, /JobPosting|schema\.org\/JobPosting/);
    assert.doesNotMatch(text, /Candidatar-se/i);
    assert.doesNotMatch(text, /Estamos contratando/i);
    for (const match of text.matchAll(/Vagas abertas:\s*(.{0,20})/g)) assert.match(match[1], /^nenhuma no momento/, 'Vagas abertas: only "nenhuma no momento"');
    const allowed = ['Ainda não tenho vaga aberta', 'Tem vaga aberta?'];
    const occurrences = (text.match(/vaga aberta/gi) || []).length;
    const permitted = allowed.reduce((sum, phrase) => sum + text.split(phrase).length - 1, 0);
    assert.equal(occurrences, permitted, '"vaga aberta" only in the negative or interrogative copy');
  });
}

test('privacidade: Appendix A text, version 2026-10 and the accessibility anchor', () => {
  const raw = read('pages/privacidade.html'), text = visibleText(raw);
  assert.match(raw, /id="acessibilidade"/);
  assert.match(text, /Versão 2026-10/);
  assert.doesNotMatch(text, /\[|\]/, 'no bracketed placeholder is ever published');
  for (const heading of ['Quem cuida dos seus dados', 'O que eu coleto e para quê', 'Como o contato acontece', 'Com quem eu compartilho', 'Por quanto tempo', 'Seus direitos (LGPD, art. 18)', 'Menores de 18 anos', 'Segurança', 'Mudanças', 'Acessibilidade'])
    assert.ok(raw.includes(`>${heading}</h2>`), heading);
  for (const sentence of [
    'O formulário não envia nada sozinho.',
    'Pedido de proposta sem contrato: até 12 meses depois do último contato.',
    'Banco de talentos: até 12 meses. Depois disso, apago, a não ser que você renove.',
    'Não peço e não uso foto, idade, estado civil, dados de saúde, origem racial, religião nem documentos.',
    'O site não usa cookies de publicidade nem ferramentas de análise de terceiros.',
    'Estas páginas seguem as diretrizes WCAG 2.2 nível AA'
  ]) assert.ok(text.includes(sentence), sentence);
  assert.doesNotMatch(text, /banco de criadores/i, 'creator pool item stays out while Q1 is off');
});

/* ---------- modules: no network, no storage of answers ---------- */
test('public/assets/pages modules parse and never use network or storage APIs', () => {
  const files = pageModules();
  assert.ok(files.some(file => file.endsWith('shell.js')) && files.some(file => file.endsWith('handoff.js')));
  for (const file of files.filter(name => name.endsWith('.js'))) {
    const name = relative(root, file), source = readFileSync(file, 'utf8');
    const result = spawnSync(process.execPath, ['--check', file], {encoding: 'utf8'});
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);
    for (const [pattern, label] of [
      [/\bfetch\s*\(/, 'fetch('], [/XMLHttpRequest/, 'XMLHttpRequest'], [/sendBeacon/, 'sendBeacon'],
      [/window\.open\s*\(|\bopen\s*\(\s*['"`]https?:/, 'window.open'], [/localStorage/, 'localStorage'],
      [/\bWebSocket\b|\bEventSource\b/, 'WebSocket/EventSource'], [/location\.(?:assign|replace)\s*\(|location\.href\s*=|location\s*=\s*['"`]/, 'navigation by script'],
      [/\beval\s*\(|new Function\s*\(/, 'eval'], [/WebAssembly/, 'wasm'], [/method\s*[:=]\s*['"]post['"]/i, 'POST'],
      [/importScripts|serviceWorker/, 'workers']
    ]) assert.doesNotMatch(source, pattern, `${name} uses ${label}`);
    assert.doesNotMatch(source, /5511985568208|smillepls@gmail\.com/, `${name} must read contact data from PORTFOLIO_PROFILE`);
    assert.doesNotMatch(source, /from\s+['"]https?:/, `${name} imports only local modules`);
  }
  for (const file of files.filter(name => name.endsWith('.css'))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/url\(\s*['"]?([^'")]+)/g)) {
      assert.ok(match[1].startsWith('/assets/') || match[1].startsWith('data:'), `${relative(root, file)}: local url() only (${match[1]})`);
      if (match[1].startsWith('/assets/')) assert.ok(existsSync(join(root, 'public', match[1])), `missing ${match[1]}`);
    }
  }
});

/* ---------- handoff (pure functions) ---------- */
await import('../public/assets/profile.js');
const handoff = await import('../public/assets/pages/handoff.js');

test('handoff builds wa.me with encodeURIComponent and mailto with %0D%0A from PORTFOLIO_PROFILE', () => {
  const lines = ['Oi, Smile! Vim pela página de criadores.', {label: 'Meu perfil principal', value: '@ana.ceramica (Instagram)'}, {label: 'Quero ajuda com', value: ['mídia kit', 'proposta para marcas']}, 'Pode me contar como funciona?'];
  const closing = ['— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).'];
  const result = handoff.buildHandoff({lines, closing, subject: 'Kit para marcas · @ana.ceramica'});
  const expected = 'Oi, Smile! Vim pela página de criadores.\nMeu perfil principal: @ana.ceramica (Instagram)\nQuero ajuda com: mídia kit e proposta para marcas\nPode me contar como funciona?\n— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).';
  assert.equal(result.text, expected);
  assert.equal(result.whatsapp, `https://wa.me/${globalThis.PORTFOLIO_PROFILE.whatsapp}?text=${encodeURIComponent(expected)}`);
  assert.equal(result.whatsapp, `https://wa.me/5511985568208?text=${encodeURIComponent(expected)}`);
  assert.ok(result.email.startsWith('mailto:smillepls@gmail.com?subject='));
  const body = result.email.split('&body=')[1];
  assert.ok(body.includes('%0D%0A'));
  assert.doesNotMatch(body.replace(/%0D%0A/g, ''), /%0A|%0D/, 'no lone %0A or %0D');
  assert.equal(decodeURIComponent(body), expected.replace(/\n/g, '\r\n'));
  assert.equal(decodeURIComponent(result.email.split('?subject=')[1].split('&')[0]), 'Kit para marcas · @ana.ceramica');
  assert.equal(new URL(result.whatsapp).searchParams.get('text'), expected);
});

test('handoff drops empty optional lines and keeps the consent line of /vagas', () => {
  const consent = '— Tenho 18 anos ou mais. Li o aviso de privacidade (versão 2026-10) e autorizo guardar estes dados no banco de talentos por até 12 meses para contato sobre oportunidades. Posso pedir a exclusão quando quiser.';
  const result = handoff.buildHandoff({
    lines: ['Olá, Smile! Quero entrar no banco de talentos.', {label: 'Nome', value: 'Rafa'}, {label: 'Outro link', value: '   '}, {label: 'Para ver primeiro', value: ''}, null, false, ['Área', 'Edição de vídeo']],
    closing: [consent, '(enviado pela página /vagas)'],
    subject: 'Banco de talentos · Edição de vídeo · Rafa'
  });
  assert.equal(result.text, ['Olá, Smile! Quero entrar no banco de talentos.', 'Nome: Rafa', 'Área: Edição de vídeo', consent, '(enviado pela página /vagas)'].join('\n'));
  assert.ok(result.text.includes(`versão ${handoff.NOTICE_VERSION}`));
  assert.ok(!/Outro link|Para ver primeiro/.test(result.text));
});

test('handoff never exceeds 1,500 characters and keeps the closing lines', () => {
  const closing = ['— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).'];
  const result = handoff.buildHandoff({lines: ['Oi!', {label: 'Destaque', value: 'x'.repeat(5000)}], closing});
  assert.ok(result.text.length <= handoff.MAX_MESSAGE_LENGTH);
  assert.ok(result.text.endsWith(closing[0]));
  assert.ok(result.text.length <= 1500);
  const short = handoff.composeMessage(['a'], ['b']);
  assert.equal(short, 'a\nb');
  assert.equal(handoff.composeMessage([{label: 'Linha', value: 'um\ndois  três'}]), 'Linha: um dois três', 'answers stay on one line');
});

test('?ref= accepts only dm, bio, email and qr', () => {
  assert.deepEqual(Object.keys(handoff.REF_ORIGINS), ['dm', 'bio', 'email', 'qr']);
  for (const ref of ['dm', 'bio', 'email', 'qr']) {
    assert.equal(handoff.readRef(`?ref=${ref}`), ref);
    assert.equal(handoff.refOrigin(`?ref=${ref}`), handoff.REF_ORIGINS[ref]);
  }
  assert.equal(handoff.refOrigin('?ref=dm'), 'link que você me mandou');
  for (const bad of ['', '?', '?ref=', '?ref=DM', '?ref=dm%20', '?ref=__proto__', '?ref=constructor', '?ref=toString', '?ref=<script>', '?ref=https://evil.example', '?x=dm'])
    assert.equal(handoff.readRef(bad), null, bad);
  assert.equal(handoff.refOrigin('?ref=instagram'), '');
  const lines = ['Oi!', {label: 'Origem', value: handoff.refOrigin('?ref=spam')}];
  assert.equal(handoff.composeMessage(lines), 'Oi!', 'an ignored ref adds no line');
});

test('handoff refuses invented or invalid destinations', () => {
  const none = handoff.buildHandoff({lines: ['Oi'], profile: {}, contact: globalThis.PORTFOLIO_CONTACT});
  assert.equal(none.whatsapp, null);
  assert.equal(none.email, null);
  const missingContact = handoff.profileDestinations(globalThis.PORTFOLIO_PROFILE, null);
  assert.deepEqual(missingContact, {whatsapp: null, email: null});
  const bad = handoff.profileDestinations({whatsapp: 'javascript:alert(1)', email: 'a\n@b.c'}, globalThis.PORTFOLIO_CONTACT);
  assert.deepEqual(bad, {whatsapp: null, email: null});
  assert.equal(handoff.mailtoHref({subject: 'Linha\nquebrada', body: 'a\nb'}, {email: 'smillepls@gmail.com'}), 'mailto:smillepls@gmail.com?subject=Linha%20quebrada&body=a%0D%0Ab');
  assert.equal(handoff.whatsappHref('', {whatsapp: '5511985568208'}), 'https://wa.me/5511985568208');
  assert.equal(handoff.joinList(['Twitch', 'YouTube']), 'Twitch e YouTube');
  assert.equal(handoff.joinList(['a', 'b', 'c']), 'a, b e c');
  assert.equal(handoff.recordInteraction('handoff_click', {page: 'criadores', channel: 'whatsapp'}).event, 'pages_handoff_click');
});

/* ---------- motion tokens (SPEC 2.5) ---------- */
const spring = await import('../public/assets/pages/spring.js');

test('spring presets respect the overshoot and settling limits', () => {
  for (const [name, preset] of Object.entries(spring.PRESETS)) {
    const overshoot = spring.springOvershoot(preset);
    const limit = spring.OVERSHOOT_EXCEPTIONS.includes(name) ? 10 : 2;
    assert.ok(overshoot <= limit, `${name}: ${overshoot.toFixed(2)}% > ${limit}%`);
    assert.ok(spring.springSettle(preset) <= 1200, `${name} settles within 1.2 s`);
    const samples = spring.springSamples(preset);
    assert.equal(samples[0], 0);
    assert.equal(samples.at(-1), 1);
    assert.match(spring.springLinear(preset), /^linear\(0, [\d., %]+, 1\)$/);
  }
  assert.equal(spring.PRESETS.flipOpen.duration, 600);
  assert.equal(spring.PRESETS.flipClose.duration, 350);
  assert.equal(spring.PRESETS.entry.duration, 450);
  assert.deepEqual([spring.DURATION.deck, spring.DURATION.morph, spring.DURATION.step, spring.DURATION.menu, spring.DURATION.menuStagger, spring.DURATION.headerCta], [400, 350, 500, 280, 30, 240]);
  assert.equal(spring.EASE.step, 'cubic-bezier(.25,.1,.25,1)');
  assert.equal(spring.EASE.deck, 'ease');
  // 95% of the opening flip lands near the measured ~316 ms; closing near ~190 ms.
  const at95 = preset => { for (let ms = 0; ms < 2000; ms++) if (spring.springValue(preset.name, ms, preset.period) >= .95) return ms; };
  assert.ok(Math.abs(at95(spring.PRESETS.flipOpen) - 316) <= 10);
  assert.ok(Math.abs(at95(spring.PRESETS.flipClose) - 190) <= 10);
  assert.ok(spring.springOvershoot('check') > 2, 'check keeps its approved bounce');
  const frames = spring.springKeyframes(p => ({opacity: p}), 'entry', 10);
  assert.equal(frames.length, 11);
  assert.equal(frames[0].offset, 0);
  assert.equal(frames.at(-1).offset, 1);
  assert.equal(frames.at(-1).opacity, 1);
});

test('deck geometry: -24 px and scaleX(.95) per level', async () => {
  // deck.js touches the DOM only inside mountDeck(), so it imports under node.
  const {deckLevel, DECK} = await import('../public/assets/pages/deck.js');
  assert.deepEqual(deckLevel(0), {y: 0, scaleX: 1});
  assert.deepEqual(deckLevel(1), {y: -24, scaleX: .95});
  assert.deepEqual(deckLevel(2), {y: -48, scaleX: .9025});
  assert.equal(DECK.duration, 400);
  assert.equal(DECK.easing, 'ease');
});

test('verify.yml runs the pages browser suite', () => {
  const workflow = read('.github/workflows/verify.yml');
  const suites = workflow.match(/suite: \[([^\]]+)\]/)[1].split(',').map(item => item.trim());
  assert.ok(suites.includes('pages'));
  assert.ok(existsSync(join(root, 'tests/browser-pages.mjs')));
});
