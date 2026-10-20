/* /criadores · route block for tests/browser-pages.mjs (SPEC 3.A, 4.A, 8.3).
 * The runner already covers the shell, CSP, network, contrast, 44 px targets,
 * idle rAF, reduced motion, pause, no-JS and the 390/1440 screenshots. This
 * module adds the page: track switch and links, focus order to the hero CTA,
 * the media-kit flip, the deck, the live preview (no request while typing),
 * both demos, the form (pt-BR errors, keyboard path, exact wa.me/mailto hrefs,
 * nothing submitted), the FAQ, contrast with errors and the review open, and
 * instant behaviour with reduced motion or the pause button. */
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {contrastAudit, runningAnimations, settle, tabSequence} from './harness.mjs';

export const route = '/criadores';
export const slug = 'criadores';

const root = fileURLToPath(new URL('../../', import.meta.url));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const CLOSING = '— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).';
const MESSAGE = ['Oi, Smile! Vim pela página de criadores.', 'Meu perfil principal: @ana.ceramica (Instagram)',
  'Quero ajuda com: mídia kit e proposta para marcas', 'Prazo: este mês', 'Pode me contar como funciona?', CLOSING].join('\n');
const NOJS_BODY = ['Oi, Smile! Vim pela página de criadores.', 'Meu perfil principal: @', 'Plataforma:', 'Quero ajuda com:', CLOSING].join('\n');
const ERRORS = [
  ['#cr-perfil', 'Digite o @ do seu perfil principal.'],
  ['#cr-plataforma', 'Escolha a plataforma principal.'],
  ['#cr-preciso', 'Escolha pelo menos uma opção em “Preciso de”.'],
  ['#cr-maior', 'Confirme que você tem 18 anos ou mais.']
];
const FORMATS = {
  vertical: ['Vertical 9:16: a publi aparece identificada no primeiro quadro, sem abrir a legenda.', 'Prévia vertical 9:16 de @seuperfil, com selo Parceria paga e #publi: Do barro à mesa, minha primeira peça no torno.'],
  feed: ['Feed 4:5: rótulo da plataforma e #publi visíveis logo de cara.', 'Prévia de feed 4:5 de @seuperfil, com selo Parceria paga. Legenda começa com #publi.'],
  text: ['Post de texto: #publi no começo, não escondido no fim.', 'Prévia de post de texto de @seuperfil, começando com #publi.']
};
/* Linked pages answer 200 once their file exists; until then the route is pending (404). */
const expectedStatus = path => {
  const file = {'/criadores/ao-vivo': 'pages/criadores-ao-vivo.html', '/vagas': 'pages/vagas.html', '/privacidade': 'pages/privacidade.html', '/criadores': 'pages/criadores.html'}[path];
  return file ? (existsSync(root + file) ? 200 : 404) : 200;
};

const animationDurations = (page, selector) => page.evaluate(sel => document.getAnimations()
  .filter(animation => animation.effect?.target?.matches?.(sel)).map(animation => animation.effect.getTiming().duration), selector);
const visibleText = (page, selector) => page.locator(selector).evaluate(el => el.innerText.replace(/\s+/g, ' ').trim());

/** Contrast of chosen elements against their effective background (SPEC 2.3 spot checks). */
async function contrastOf(page, selectors) {
  return page.evaluate(list => {
    const parse = value => {
      let m = value.match(/^rgba?\(([^)]+)\)/);
      if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p[3] ?? 1}; }
      m = value.match(/^color\(srgb ([^)]+)\)/);
      if (m) { const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number); return {r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] ?? 1}; }
      return {r: 0, g: 0, b: 0, a: 0};
    };
    const blend = (top, bottom) => ({r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1});
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    return Object.fromEntries(list.map(selector => {
      const el = document.querySelector(selector);
      if (!el) return [selector, null];
      const layers = [];
      for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
        const color = parse(getComputedStyle(node).backgroundColor);
        if (color.a > 0) { layers.push(color); if (color.a >= 1) break; }
      }
      let bg = {r: 255, g: 255, b: 255, a: 1};
      for (const layer of layers.reverse()) bg = blend(layer, bg);
      const fg = blend(parse(getComputedStyle(el).color), bg);
      const [a, b] = [lum(fg), lum(bg)];
      return [selector, Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2))];
    }));
  }, selectors);
}

async function tabUntil(page, predicate, max = 40) {
  const visited = [];
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      return {id: el?.id || '', value: el?.dataset?.value || '', group: el?.closest?.('fieldset')?.id || '', tag: el?.tagName?.toLowerCase() || '', type: el?.getAttribute?.('type') || '', text: (el?.textContent || '').trim().slice(0, 40)};
    });
    visited.push(info);
    if (predicate(info)) return visited;
  }
  throw new Error(`tabUntil: target not reached · ${JSON.stringify(visited.slice(-6))}`);
}

export async function checks(t) {
  const {page, check, width, events} = t;
  const desktop = width >= 960;
  const requests = [];
  page.on('request', request => requests.push(`${request.method()} ${request.url()}`));
  let navigations = 0;
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations++; });
  await page.waitForSelector('html[data-criadores-ready="true"]', {state: 'attached'});

  /* ---------- head, structure, honest defaults ---------- */
  check('Title comes from the copy deck', await page.title() === 'Para criadores: kit para fechar com marcas · Smile N');
  check('Canonical is the /criadores URL', await page.locator('link[rel=canonical]').getAttribute('href') === 'https://portifolio-github-production.up.railway.app/criadores');
  check('Single h1 with the promise', await page.evaluate(() => document.querySelectorAll('h1').length === 1 && document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim() === 'Seu perfil pronto para fechar com marcas.'));
  check('Creator pool is off in v1 (no #banco-de-criadores)', await page.locator('#banco-de-criadores').count() === 0);
  check('Section colours alternate as in SPEC 3.A', await page.evaluate(() => [...document.querySelectorAll('main > section')].map(s => s.classList.contains('pg-section--floresta') ? 'F' : 'P').join('') === 'FPFPPFPFPF'));

  /* ---------- C0 · track switch and the links it leads to ---------- */
  const track = page.locator('nav.pg-track');
  check('Track switch is labelled and marks "Redes sociais" as the current page', await track.getAttribute('aria-label') === 'Escolha a página do seu formato' &&
    await page.evaluate(() => JSON.stringify([...document.querySelectorAll('nav.pg-track a')].map(a => [a.textContent.trim(), a.getAttribute('href'), a.getAttribute('aria-current')])) ===
      JSON.stringify([['Redes sociais', '/criadores', 'page'], ['Vídeo e live', '/criadores/ao-vivo', null]])));
  check('Track segments are at least 44 px tall', await page.evaluate(() => [...document.querySelectorAll('nav.pg-track a')].every(a => a.getBoundingClientRect().height >= 44)));
  if (width < 600) check('Track switch takes the full width on mobile', await track.evaluate(el => el.getBoundingClientRect().width >= el.parentElement.getBoundingClientRect().width - 1));
  const internal = await page.evaluate(() => [...new Set([...document.querySelectorAll('main a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0] || '/'))]);
  const statuses = {};
  for (const path of internal) { const response = await fetch(`${t.base}${path}`); statuses[path] = response.status; await response.arrayBuffer(); }
  check('Internal links answer 200 (or are pending until their page file exists)', internal.length >= 3 && internal.every(path => statuses[path] === expectedStatus(path)), statuses);

  /* ---------- focus order: skip → brand → nav/menu → track → hero CTA ---------- */
  await page.evaluate(() => { window.scrollTo({top: 0, behavior: 'instant'}); document.activeElement?.blur?.(); });
  await pause(300);
  await page.locator('.pg-skip').focus();
  const order = await tabSequence(page, desktop ? 10 : 6);
  const firstInMain = order.findIndex(item => item.inMain);
  check('Header controls come first, then the track switch, then the hero CTA', firstInMain > 0 && order.slice(0, firstInMain).every(item => item.inHeader) &&
    order[firstInMain]?.href === '/criadores' && order[firstInMain + 1]?.href === '/criadores/ao-vivo' &&
    order[firstInMain + 2]?.href === '#montar' && order[firstInMain + 2]?.cls.includes('cr-hero-cta') &&
    (desktop ? order.slice(1, 5).every(item => item.inHeader && item.href?.startsWith('/')) : order.slice(1, firstInMain).some(item => item.menuToggle)), order);
  await page.evaluate(() => document.activeElement?.blur?.());

  /* ---------- C1 · hero ---------- */
  const firstScreen = await page.evaluate(() => {
    const h1 = document.querySelector('h1').getBoundingClientRect(), cta = document.querySelector('.cr-hero-cta').getBoundingClientRect();
    return {h1Bottom: h1.bottom, ctaBottom: cta.bottom, ctaHeight: cta.height, ctaWidth: cta.width, h1Size: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      container: document.querySelector('.cr-hero-copy').getBoundingClientRect().width, vh: innerHeight};
  });
  if (width !== 320) check('H1 and the hero CTA fit the first screen', firstScreen.h1Bottom <= firstScreen.vh && firstScreen.ctaBottom <= firstScreen.vh, firstScreen);
  if (width < 600) check('Mobile hero: H1 ≥ 40 px, CTA full width and 48 px tall', firstScreen.h1Size >= 40 && firstScreen.ctaHeight >= 48 && firstScreen.ctaWidth >= firstScreen.container - 1, firstScreen);
  check('Hero shows no follower count, reach or price', !/\d/.test(await visibleText(page, '.cr-hero')));
  const kitCard = page.locator('.cr-kit-card');
  const kitBox = await kitCard.boundingBox();
  check('Media-kit card is at most 420 px tall', kitBox.height <= 421, kitBox);
  const label = page.locator('.cr-kit-label');
  check('"Exemplo ilustrativo" label is visible on the front', await label.isVisible() && (await label.innerText()).startsWith('Exemplo ilustrativo.'));
  await kitCard.scrollIntoViewIfNeeded();
  await kitCard.locator('[data-flip-open]').click();
  check('Media-kit card opens in 600 ms', (await animationDurations(page, '.cr-kit-card .pg-flip-rotor')).includes(600));
  check('Back face: inert/aria-hidden swap, aria-pressed and focus on its title', await page.evaluate(() => {
    const card = document.querySelector('.cr-kit-card'), front = card.querySelector('[data-flip-front]'), back = card.querySelector('[data-flip-back]');
    return card.dataset.face === 'back' && front.inert && !back.inert && back.getAttribute('aria-hidden') === 'false' &&
      card.querySelector('[data-flip-open]').getAttribute('aria-pressed') === 'true' && document.activeElement === back.querySelector('[data-flip-focus]');
  }));
  check('"Exemplo ilustrativo" label stays visible on the back', await label.isVisible());
  await pause(650);
  await page.keyboard.press('Escape');
  check('Escape closes the card in 350 ms and returns focus to its button', (await animationDurations(page, '.cr-kit-card .pg-flip-rotor')).includes(350) &&
    await page.evaluate(() => document.querySelector('.cr-kit-card').dataset.face === 'front' && document.activeElement === document.querySelector('.cr-kit-card [data-flip-open]')));
  await pause(400);

  /* ---------- C3 · deck of deliverables ---------- */
  const deck = page.locator('.cr-deck'), counter = deck.locator('[data-deck-counter]');
  await deck.scrollIntoViewIfNeeded();
  await settle(page).catch(() => {});
  check('Deck stacks three cards; the ones behind are inert', await deck.getAttribute('data-deck-mode') === 'stack' && await counter.innerText() === '1 de 3' && await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.cr-deck [data-deck-card]')];
    return cards.length === 3 && !cards[0].inert && cards[1].inert && cards[2].inert;
  }));
  const level1 = await page.evaluate(() => getComputedStyle(document.querySelectorAll('.cr-deck [data-deck-card]')[1]).transform);
  check('Card behind sits 24 px higher at scaleX(.95)', /^matrix\(0\.95, 0, 0, 1, 0, -24\)$/.test(level1), level1);
  check('Deck stage keeps vertical scrolling native (touch-action: pan-y)', await deck.locator('[data-deck-stage]').evaluate(el => getComputedStyle(el).touchAction) === 'pan-y');
  if (width < 600) check('Deck is the usable width minus 24 px', await deck.evaluate(el => Math.abs(el.getBoundingClientRect().width - (el.parentElement.getBoundingClientRect().width - 24)) <= 1));
  await deck.locator('[data-deck-stage]').focus();
  await page.keyboard.press('ArrowRight');
  const second = await counter.innerText();
  await page.keyboard.press('End');
  const last = await counter.innerText();
  await page.keyboard.press('Home');
  check('Keyboard walks the three cards (arrows, End, Home)', second === '2 de 3' && last === '3 de 3' && await counter.innerText() === '1 de 3', [second, last]);
  await pause(450);
  await deck.locator('[data-deck-card]').first().locator('h3').click();
  check('Tapping the active card turns it to "O que vem"', await deck.locator('[data-deck-card]').first().locator('.pg-flip').getAttribute('data-face') === 'back');
  await pause(650);
  await page.keyboard.press('ArrowRight');
  check('Moving on closes the turned card', await counter.innerText() === '2 de 3' && await deck.locator('[data-deck-card]').first().locator('.pg-flip').getAttribute('data-face') === 'front');
  await deck.locator('[data-deck-prev]').click();
  if (width < 600) {
    // A vertical finger drag over the deck scrolls the page and never changes the card.
    await pause(450);
    const box = await deck.locator('[data-deck-stage]').boundingBox();
    const before = await page.evaluate(() => scrollY);
    // A real touch sequence (CDP): 60 px straight up, about 45 px after the touch slop.
    const cdp = await page.context().newCDPSession(page);
    const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + Math.min(box.height - 20, 220));
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    for (let step = 1; step <= 6; step++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - step * 10}]}); await pause(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await cdp.detach();
    await pause(400);
    const after = await page.evaluate(() => scrollY);
    check('A vertical drag of 40+ px on the deck scrolls the page', after - before >= 40 && await counter.innerText() === '1 de 3', {before, after});
  }

  /* ---------- C4 · live preview ---------- */
  const preview = page.locator('#exemplo'), input = preview.locator('[data-preview-input]'), status = preview.locator('[data-preview-status]');
  await input.scrollIntoViewIfNeeded();
  check('Preview renders inside the K7 phone (max 300 px wide)', await preview.locator('.pg-phone [data-preview-screen]').count() === 1 &&
    (await preview.locator('.pg-phone').boundingBox()).width <= 301);
  check('Empty preview shows @seuperfil and no metric values', await preview.locator('.cr-view--perfil [data-preview-handle]').innerText() === '@seuperfil' &&
    !/\d/.test(await visibleText(page, '#exemplo .cr-view--perfil')));
  const quiet = requests.length;
  await input.click();
  await page.keyboard.type('@teste.x', {delay: 20});
  const whileTyping = await status.textContent();
  check('Typing updates the cover with textContent and sends nothing', await preview.locator('.cr-view--perfil [data-preview-handle]').innerText() === '@teste.x' &&
    await preview.locator('.cr-view--kit [data-preview-handle]').textContent() === '@teste.x' && requests.length === quiet, requests.slice(quiet));
  check('Status stays quiet while typing', whileTyping === '', whileTyping);
  await pause(700);
  check('Status announces the preview 600 ms after typing', await status.textContent() === 'Prévia atualizada para @teste.x.');
  check('Nothing is stored in the browser', await page.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0 && !location.search.includes('teste')));
  await input.fill('<b>x</b>');
  check('Markup typed in the preview is never rendered', await page.evaluate(() => !document.querySelector('[data-preview-screen] b') && document.querySelector('.cr-view--perfil [data-preview-handle]').textContent === '@bxb'));
  await input.fill('teste.x');
  await preview.locator('[data-preview-view="kit"]').click();
  check('"Kit" shows the proposal view with aria-pressed', await preview.locator('[data-preview-view="kit"]').getAttribute('aria-pressed') === 'true' &&
    await preview.locator('.cr-view--kit').isVisible() && !(await preview.locator('.cr-view--perfil').isVisible()) &&
    (await visibleText(page, '#exemplo .cr-view--kit')).includes('Proposta para Ateliê Exemplo'));
  check('Profile ↔ Kit morph takes 350 ms', (await animationDurations(page, '#exemplo .cr-view--kit')).includes(350));
  await preview.locator('[data-preview-view="perfil"]').click();
  check('The preview demo is labelled as fictional', (await preview.locator('.cr-demo-label').innerText()) === 'Ateliê Exemplo · exemplo fictício para mostrar o formato. Não é cliente real.');

  /* ---------- C6 · demos ---------- */
  const formats = page.locator('[data-formats]');
  await formats.scrollIntoViewIfNeeded();
  const phoneFrame = formats.locator('.pg-phone');
  check('Formats demo starts on vertical with its status and frame label', await formats.locator('[data-format-button="vertical"]').getAttribute('aria-pressed') === 'true' &&
    await formats.locator('[data-formats-status]').innerText() === FORMATS.vertical[0] && await phoneFrame.getAttribute('aria-label') === FORMATS.vertical[1] && await phoneFrame.getAttribute('role') === 'img');
  for (const key of ['feed', 'text', 'vertical']) {
    await formats.locator(`[data-format-button="${key}"]`).click();
    const durations = await animationDurations(page, `[data-formats] .fm-view--${key} [data-format-media]`);
    check(`Format "${key}": aria-pressed, status, frame label and the identification on the first frame`,
      await formats.locator(`[data-format-button="${key}"]`).getAttribute('aria-pressed') === 'true' &&
      await formats.locator('[data-formats-status]').innerText() === FORMATS[key][0] && await phoneFrame.getAttribute('aria-label') === FORMATS[key][1] &&
      await formats.locator(`.fm-view--${key} .fm-badge`, {hasText: 'Parceria paga'}).isVisible() && await formats.locator(`.fm-view--${key} .fm-badge`, {hasText: '#publi'}).isVisible() &&
      await formats.locator('.fm-view:not([hidden])').count() === 1);
    check(`Format "${key}": the frame morphs in 350 ms`, durations.includes(350), durations);
    await pause(400);
  }
  const hooks = page.locator('[data-hooks]'), player = hooks.locator('[data-hooks-player]');
  await hooks.scrollIntoViewIfNeeded();
  check('Hooks demo plays in the K8 notebook; the static script is hidden', await hooks.locator('.pg-notebook [data-hooks-player]').count() === 1 && !(await hooks.locator('[data-hooks-script]').isVisible()) &&
    await hooks.locator('[data-hooks-prev]').isDisabled() && await hooks.locator('[data-hooks-next]').isDisabled());
  await hooks.locator('[data-hook-button="a"]').click();
  check('Hook A: status, first frame, counter and the #publi label from frame 1', await hooks.locator('[data-hook-button="a"]').getAttribute('aria-pressed') === 'true' &&
    await hooks.locator('[data-hooks-status]').innerText() === 'Gancho A: uma confissão curta desperta curiosidade.' &&
    await player.locator('[data-hooks-title]').innerText() === 'Eu ia jogar esse pote rachado fora.' && await player.locator('[data-hooks-label]').innerText() === 'ABERTURA' &&
    await player.locator('[data-hooks-counter]').innerText() === '01 / 03' && await player.locator('.hk-badge').isVisible() && (await player.locator('.hk-badge').innerText()) === '#publi · Parceria paga');
  check('Frame title enters in 450 ms', (await animationDurations(page, '[data-hooks-title]')).includes(450));
  await player.focus();
  await page.keyboard.press('ArrowRight');
  check('Arrow keys on the screen change the frame and announce it', await hooks.locator('[data-hooks-status]').innerText() === 'Quadro 2 de 3: contexto.' &&
    await player.locator('[data-hooks-counter]').innerText() === '02 / 03' && await player.locator('[data-hooks-title]').innerText() === 'Levei ao Ateliê Exemplo e olha como voltou.');
  await page.keyboard.press('ArrowLeft');
  await hooks.locator('[data-hook-button="b"]').click();
  check('Hook B has its own explanation and frames', await hooks.locator('[data-hooks-status]').innerText() === 'Gancho B: uma lista curta promete algo útil e fácil de seguir.' &&
    await player.locator('[data-hooks-title]').innerText() === '3 coisas que dá para fazer com uma aula de torno.' && await hooks.locator('[data-hook-button="a"]').getAttribute('aria-pressed') === 'false');
  const demosText = await visibleText(page, '.cr-practice');
  check('Demos name no winner and no percentage', !/%/.test(demosText) && (demosText.match(/vencedor/gi) || []).length === 1);

  /* ---------- C8 · form: errors ---------- */
  const form = page.locator('#cr-form'), panel = page.locator('#cr-revisao'), submit = form.locator('[type=submit]');
  await form.scrollIntoViewIfNeeded();
  check('JS enables "Revisar mensagem" and retires the no-JS note', await submit.isEnabled() && !(await form.locator('[data-nojs-fallback]').isVisible()));
  check('No WhatsApp or e-mail link exists before the answers are valid', await panel.locator('a[href]').count() === 0 && !(await panel.isVisible()));
  await submit.click();
  check('Empty submit focuses the summary with the exact pt-BR errors and links', await page.evaluate(expected => {
    const summary = document.getElementById('cr-erros');
    const links = [...summary.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent]);
    return document.activeElement === summary && summary.querySelector('h3').textContent === 'Falta pouco. Confira:' && JSON.stringify(links) === JSON.stringify(expected);
  }, ERRORS));
  check('Inline errors: aria-invalid on fields, data-invalid on chip groups, aria-describedby to the text', await page.evaluate(() => {
    const input = document.getElementById('cr-perfil'), box = document.getElementById('cr-maior');
    const linked = (el, id) => (el.getAttribute('aria-describedby') || '').split(' ').includes(id);
    return input.getAttribute('aria-invalid') === 'true' && linked(input, 'cr-perfil-erro') && linked(input, 'cr-perfil-dica') &&
      box.getAttribute('aria-invalid') === 'true' && linked(box, 'cr-maior-erro') &&
      ['cr-plataforma', 'cr-preciso'].every(id => document.getElementById(id).dataset.invalid === 'true' && linked(document.getElementById(id), `${id}-erro`)) &&
      document.getElementById('cr-perfil-erro').textContent.includes('Digite o @ do seu perfil principal.');
  }));
  check('Under 18: the guardian path by e-mail appears and the review stays closed', await page.locator('#cr-maior-ajuda-erro').isVisible() &&
    (await page.locator('#cr-maior-ajuda-erro').innerText()).startsWith('Por enquanto atendo só maiores de 18 anos.') &&
    await page.evaluate(() => document.querySelector('#cr-maior-ajuda-erro a')?.getAttribute('href') === `mailto:${window.PORTFOLIO_PROFILE.email}`) && !(await panel.isVisible()));
  // Let colour transitions finish first (headless only ticks them while frames are produced).
  await settle(page).catch(() => {});
  const errorContrast = await contrastAudit(page);
  check('Contrast holds with the errors on screen', errorContrast.failures.length === 0, errorContrast.failures);
  const spots = await contrastOf(page, ['#cr-perfil-erro', '#cr-maior-ajuda-erro', '.cr-hero-micro', '.cr-kit-label', '.cr-demo-caption', '.cr-notice', '.cr-summary-count', '#cr-perfil-dica', '.cr-transparency', '.cr-demo-label']);
  check('Spot checks: small and secondary text reach 4.5:1', Object.values(spots).every(ratio => ratio >= 4.5), spots);
  await page.locator('#cr-erros a[href="#cr-plataforma"]').click();
  check('A summary link focuses its field', await page.evaluate(() => document.activeElement?.closest('#cr-plataforma') !== null));

  // @ rules on blur; while typing an error can clear but never appears.
  const field = form.locator('#cr-perfil');
  await field.fill('https://www.tiktok.com/@ana.ceramica?lang=pt');
  check('Fixing the @ while typing clears its error', await field.getAttribute('aria-invalid') === null);
  await field.fill('ana ceramica');
  check('No error appears while typing', await field.getAttribute('aria-invalid') === null);
  await field.blur();
  check('Blur shows the character rule', await field.getAttribute('aria-invalid') === 'true' && (await page.locator('#cr-perfil-erro').innerText()).includes('Use só letras, números, ponto e sublinhado. Sem espaços.'));
  await field.fill('a');
  await field.blur();
  check('Blur shows the length rule', (await page.locator('#cr-perfil-erro').innerText()).includes('O @ precisa ter de 2 a 30 caracteres.'));

  // "Usar @x" shortcut from the preview, never copied by itself.
  const use = form.locator('[data-use-handle]');
  check('The form offers "Usar @teste.x" from the preview without copying it', await use.isVisible() && (await use.innerText()) === 'Usar @teste.x' && await field.inputValue() === 'a',
    {visible: await use.isVisible(), text: await use.innerText(), value: await field.inputValue()});
  await use.click();
  check('"Usar @x" fills the field, clears the error and hides itself', await field.inputValue() === 'teste.x' && await field.getAttribute('aria-invalid') === null && !(await use.isVisible()));
  await input.fill('');

  /* ---------- C8 · keyboard path and handoff ---------- */
  await field.fill('');
  await field.focus();
  await page.keyboard.type('ana.ceramica');
  const path = [];
  path.push(...await tabUntil(page, info => info.value === 'Instagram'));
  await page.keyboard.press('Space');
  path.push(...await tabUntil(page, info => info.value === 'Mídia kit'));
  await page.keyboard.press('Enter');
  path.push(...await tabUntil(page, info => info.value === 'Proposta para marcas'));
  await page.keyboard.press('Space');
  path.push(...await tabUntil(page, info => info.value === 'Este mês'));
  await page.keyboard.press('Enter');
  path.push(...await tabUntil(page, info => info.id === 'cr-maior'));
  await page.keyboard.press('Space');
  path.push(...await tabUntil(page, info => info.type === 'submit'));
  const groupsInOrder = path.map(info => info.group || info.id || info.type).filter((item, i, list) => item && item !== list[i - 1]);
  check('Keyboard order follows the fieldsets: chips → 18+ → submit', JSON.stringify(groupsInOrder) === JSON.stringify(['cr-plataforma', 'cr-preciso', 'cr-prazo', 'cr-maior', 'submit']), groupsInOrder);
  check('Chips answer Space and Enter; the summary follows', await page.evaluate(() =>
    [...document.querySelectorAll('#cr-form [aria-pressed="true"]')].map(b => b.dataset.value).join('|') === 'Instagram|Mídia kit|Proposta para marcas|Este mês' && document.getElementById('cr-maior').checked) &&
    await form.locator('[data-summary-count]').innerText() === '4 escolhas' && (await form.locator('[data-summary-list]').innerText()).includes('@ana.ceramica · Instagram'));
  const url = page.url(), quietForm = requests.length, navBefore = navigations;
  await page.keyboard.press('Enter');
  check('Valid submit opens the review and focuses its title', await panel.isVisible() && await page.evaluate(() => document.activeElement?.id === 'cr-revisao-titulo'));
  check('Review shows the exact message', await panel.locator('[data-handoff-message]').innerText() === MESSAGE, await panel.locator('[data-handoff-message]').innerText());
  const whatsapp = await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href');
  check('WhatsApp href is wa.me + encodeURIComponent(message)', whatsapp === `https://wa.me/5511985568208?text=${encodeURIComponent(MESSAGE)}`, whatsapp);
  const mail = await panel.locator('a[data-handoff="email"]').getAttribute('href');
  check('E-mail href has the subject and a %0D%0A body', mail === `mailto:smillepls@gmail.com?subject=${encodeURIComponent('Kit para marcas · @ana.ceramica')}&body=${encodeURIComponent(MESSAGE.replace(/\n/g, '\r\n'))}`, mail);
  check('Submitting sends nothing: no navigation, no request, no tab, no WhatsApp call', page.url() === url && navigations === navBefore && requests.length === quietForm &&
    events.popups.length === 0 && events.handoff.length === 0, {url: page.url(), navigations: navigations - navBefore, requests: requests.slice(quietForm), popups: events.popups.length});
  await settle(page).catch(() => {});
  const reviewContrast = await contrastAudit(page);
  check('Contrast holds with the review open', reviewContrast.failures.length === 0, reviewContrast.failures);
  if (width === 390 || width === 1440) await page.locator('#montar').screenshot({path: `${t.output}/criadores-review-${width}.png`, animations: 'disabled'});

  await form.locator('#cr-prazo [data-value="Este mês"]').click();
  const withoutDeadline = MESSAGE.replace('Prazo: este mês\n', '');
  check('Clearing the optional deadline drops its line and updates both links', await panel.locator('[data-handoff-message]').innerText() === withoutDeadline &&
    await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href') === `https://wa.me/5511985568208?text=${encodeURIComponent(withoutDeadline)}` &&
    decodeURIComponent((await panel.locator('a[data-handoff="email"]').getAttribute('href')).split('&body=')[1]) === withoutDeadline.replace(/\n/g, '\r\n'));
  await form.locator('#cr-prazo [data-value="Este mês"]').click();

  await page.evaluate(() => { window.__qaCopied = null; navigator.clipboard.writeText = text => { window.__qaCopied = text; return Promise.resolve(); }; });
  await panel.locator('[data-handoff="copy"]').click();
  await page.waitForFunction(() => window.__qaCopied !== null);
  check('"Copiar mensagem" copies the same text', await page.evaluate(() => window.__qaCopied) === MESSAGE && await panel.locator('[data-handoff-status]').innerText() === 'Mensagem copiada. Cole no WhatsApp ou no e-mail.');
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('denied')); });
  await panel.locator('[data-handoff="copy"]').click();
  await page.waitForSelector('#cr-revisao [data-handoff-fallback]:not([hidden])');
  check('Without clipboard access a read-only textarea offers the message', await page.evaluate(text => {
    const area = document.querySelector('#cr-revisao [data-handoff-fallback]');
    return area.readOnly && area.value === text;
  }, MESSAGE));

  const popup = page.context().waitForEvent('page');
  await panel.locator('a[data-handoff="whatsapp"]').click();
  const opened = await popup;
  await opened.waitForLoadState('domcontentloaded').catch(() => {});
  await pause(200);
  check('wa.me is requested only after the tap, and intercepted', events.handoff.length >= 1 && events.handoff[0] === whatsapp, events.handoff);
  await opened.close();
  events.popups.length = 0; events.handoff.length = 0;
  check('WhatsApp status line is shown', await panel.locator('[data-handoff-status]').innerText() === 'Abrindo o WhatsApp. Confira a mensagem e toque em enviar lá.');
  check('Interaction events carry no message content', !JSON.stringify(await page.evaluate(() => window.__qa.interactions)).match(/ana\.ceramica|5511985568208|smillepls/));
  await panel.locator('[data-handoff="edit"]').click();
  check('"Editar respostas" returns focus to the @ field', await page.evaluate(() => document.activeElement?.id === 'cr-perfil'));
  await page.locator('#cr-maior').uncheck();
  check('Unchecking 18+ closes the review and removes the links', !(await panel.isVisible()) && await panel.locator('a[href]').count() === 0);

  /* ---------- C9 FAQ and C10 final strip ---------- */
  const faq = page.locator('.cr-faq details[name="faq"]');
  check('FAQ has ten items', await faq.count() === 10);
  await faq.nth(0).locator('summary').click();
  await faq.nth(8).locator('summary').click();
  check('Only one FAQ item is open; the creator-pool answer is the "off" variant', await page.evaluate(() => {
    const items = [...document.querySelectorAll('.cr-faq details')];
    return !items[0].open && items[8].open && items.filter(item => item.open).length === 1 &&
      items[8].querySelector('.pg-accordion-body').textContent.trim().startsWith('Hoje meu foco é o seu material');
  }));
  check('FAQ summaries are at least 48 px tall', await page.evaluate(() => [...document.querySelectorAll('.cr-faq summary')].every(s => s.getBoundingClientRect().height >= 48)));
  const templates = await page.evaluate(() => [...document.querySelectorAll('a[data-kit-mailto]')].map(a => a.getAttribute('href')));
  const expectedTemplate = `mailto:smillepls@gmail.com?subject=${encodeURIComponent('Kit para marcas')}&body=${encodeURIComponent(NOJS_BODY.replace(/\n/g, '\r\n'))}`;
  check('"Prefere e-mail?" opens the template with subject and %0D%0A', templates.length === 2 && templates.every(href => href === expectedTemplate) && templates[1].includes('%0D%0A'), templates);
  check('Final strip repeats the CTA and links to the live page', await page.locator('.cr-final a[href="#montar"]').evaluate(a => a.textContent.replace(/\s+/g, ' ').trim()) === 'Montar meu kit ↑' &&
    await page.locator('.cr-final a[href="/criadores/ao-vivo"]').count() === 1);
  check('Non-affiliation strip names the five platforms and Meta', (await visibleText(page, '.cr-transparency')).includes('TikTok, Instagram, Facebook, Meta, Snapchat ou X') &&
    (await visibleText(page, '.cr-footer-affiliation')) === 'Sem vínculo com TikTok, Instagram, Facebook, Meta, Snapchat ou X. As marcas citadas pertencem aos seus titulares.');

  /* ---------- ?ref= (closed allowlist) ---------- */
  if (width === 1440) {
    check('No CSP violation before reloading for ?ref=', (await page.evaluate(() => window.__qa.csp)).length === 0);
    for (const [query, origin] of [['?ref=dm', 'link que você me mandou'], ['?ref=spam', null]]) {
      await page.goto(`${t.base}/criadores${query}`, {waitUntil: 'load'});
      await page.waitForSelector('html[data-criadores-ready="true"]', {state: 'attached'});
      await page.locator('#cr-perfil').fill('ana.ceramica');
      await page.locator('#cr-plataforma [data-value="Instagram"]').click();
      await page.locator('#cr-preciso [data-value="Mídia kit"]').click();
      await page.locator('#cr-preciso [data-value="Proposta para marcas"]').click();
      await page.locator('#cr-prazo [data-value="Este mês"]').click();
      await page.locator('#cr-maior').check();
      await page.locator('#cr-form [type=submit]').click();
      const text = await page.locator('#cr-revisao [data-handoff-message]').innerText();
      const expected = origin ? MESSAGE.replace('Pode me contar', `Origem: ${origin}\nPode me contar`) : MESSAGE;
      check(`${query} ${origin ? 'adds the "Origem" line' : 'is ignored'}`, text === expected, text);
    }
    await page.goto(`${t.base}/criadores`, {waitUntil: 'load'});
    await page.waitForSelector('html[data-criadores-ready="true"]', {state: 'attached'});
  }
  await settle(page).catch(() => {});
}

/* SPEC 8.3 item 12: with reduced motion or the pause button every change is instant. */
async function instantChecks(t, mode) {
  const {page, check} = t;
  await page.waitForSelector('html[data-criadores-ready="true"]', {state: 'attached'});
  const idle = async () => { await pause(50); return (await runningAnimations(page)) === 0; };
  await page.locator('.cr-kit-card').scrollIntoViewIfNeeded();
  await page.locator('.cr-kit-card [data-flip-open]').click();
  check(`Media-kit card swaps faces with nothing running (${mode})`, await idle() && await page.locator('.cr-kit-card').getAttribute('data-face') === 'back');
  await page.locator('.cr-kit-card [data-flip-close]').click();
  check(`Deck becomes a static list with both faces of each card (${mode})`, await page.evaluate(() => {
    const deck = document.querySelector('.cr-deck'), cards = [...deck.querySelectorAll('[data-deck-card]')];
    return deck.dataset.deckMode === 'list' && cards.every(card => !card.inert && getComputedStyle(card).transform === 'none') &&
      getComputedStyle(deck.querySelector('.pg-deck-nav')).display === 'none' && getComputedStyle(deck.querySelector('.cr-deck-hint')).display === 'none' &&
      cards.every(card => [...card.querySelectorAll('.pg-flip-face')].every(face => !face.inert && face.getBoundingClientRect().height > 0)) &&
      getComputedStyle(deck.querySelector('[data-flip-open]')).display === 'none';
  }));
  await page.locator('#exemplo [data-preview-view="kit"]').click();
  check(`Profile ↔ Kit switches instantly (${mode})`, await idle() && await page.locator('#exemplo .cr-view--kit').isVisible());
  await page.locator('[data-format-button="feed"]').scrollIntoViewIfNeeded();
  await page.locator('[data-format-button="feed"]').click();
  check(`Format change is instant (${mode})`, await idle() && await page.locator('[data-formats] .fm-view--feed').isVisible() &&
    await page.locator('[data-formats-status]').innerText() === FORMATS.feed[0]);
  await page.locator('[data-hook-button="a"]').click();
  await page.locator('[data-hooks-next]').click();
  check(`Hook frames change instantly (${mode})`, await idle() && await page.locator('[data-hooks-counter]').innerText() === '02 / 03');
  await page.locator('#cr-perfil').fill('teste.x');
  await page.locator('#cr-plataforma [data-value="TikTok"]').click();
  await page.locator('#cr-preciso [data-value="Mídia kit"]').click();
  await page.locator('#cr-maior').check();
  await page.locator('#cr-form [type=submit]').click();
  check(`Review panel and the check appear without movement (${mode})`, await idle() && await page.locator('#cr-revisao').isVisible());
  check(`No transform is animating anywhere (${mode})`, await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length === 0));
}

export async function reduced(t) { await instantChecks(t, 'reduced motion'); }
export async function paused(t) { await instantChecks(t, 'paused'); }

export async function noJs(t) {
  const {page, check} = t;
  check('Without JS the form button is disabled', await page.locator('#cr-form [type=submit]').isDisabled());
  const fallback = page.locator('[data-nojs-fallback]');
  const href = await fallback.locator('a').getAttribute('href');
  check('Without JS the mailto fallback is visible with the template body', await fallback.isVisible() && href.includes('subject=Kit%20para%20marcas') && href.includes('%0D%0A') &&
    decodeURIComponent(href.split('&body=')[1]) === NOJS_BODY.replace(/\n/g, '\r\n'));
  check('Without JS both faces of the media-kit card are readable', await page.getByText('Seus números, tirados dos insights da plataforma').isVisible() && await page.getByText('@seuperfil', {exact: true}).first().isVisible());
  check('Without JS the deck is a list with every card and its contents', await page.evaluate(() => [...document.querySelectorAll('.cr-deck [data-deck-card]')].every(card => card.getBoundingClientRect().height > 0)) &&
    await page.getByText('Mídia kit em PDF e em link').isVisible() && await page.getByText('Landing page para lançamento ou serviço').isVisible());
  check('Without JS the preview shows both views and hides the dead controls', await page.locator('#exemplo .cr-view--perfil').isVisible() && await page.locator('#exemplo .cr-view--kit').isVisible() &&
    !(await page.locator('[data-preview-input]').isVisible()) && !(await page.locator('[data-use-handle]').isVisible()));
  check('Without JS the formats demo lists the three formats', await page.locator('[data-formats] .fm-view').evaluateAll(views => views.length === 3 && views.every(v => v.getBoundingClientRect().height > 0)) &&
    !(await page.locator('.fm-formats').isVisible()));
  check('Without JS the hooks demo shows the script frame by frame', await page.locator('[data-hooks-script]').isVisible() && await page.getByText('Eu ia jogar esse pote rachado fora.').isVisible() &&
    !(await page.locator('[data-hooks-stage]').isVisible()));
  check('Without JS the creator pool is still off', await page.locator('#banco-de-criadores').count() === 0);
}
