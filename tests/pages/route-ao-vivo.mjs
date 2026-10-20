/* /criadores/ao-vivo · route block for tests/browser-pages.mjs (SPEC 3.B, 4.B, 8.3).
 * The runner already covers the shell, CSP, network, contrast, targets, idle rAF,
 * reduced motion, pause, no-JS and the 390/1440 screenshots (qa/pages/ao-vivo-*.png).
 * This file adds the page's own checks: track switch, focus order, service flips,
 * overlay scenes (deck + morph + fixed #publi), "Da live ao corte" (click-only
 * playback that stops at 10 s or off screen), the thumbnail slider, and the
 * diagnosis form (pt-BR errors, keyboard path, exact wa.me/mailto, nothing sent). */
import {contrastAudit, runningAnimations} from './harness.mjs';

export const route = '/criadores/ao-vivo';
export const slug = 'ao-vivo';

const ORIGIN = 'https://portifolio-github-production.up.railway.app';
const CONSENT = '— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const SCENE_STATUS = [
  'Começando: a tela de espera já avisa o tema da live.',
  'Ao vivo: o rótulo de publicidade fica na tela durante todo o segmento patrocinado.',
  'Intervalo: a pausa continua com a cara do canal.',
  'Encerrando: o fim já anuncia a próxima live.'
];
const ERRORS = [
  ['#av-plataformas', 'Escolha pelo menos uma plataforma.'],
  ['#av-frequencia', 'Escolha com que frequência você transmite.'],
  ['#av-duracao', 'Escolha a duração média das suas lives.'],
  ['#av-nicho', 'Escolha o seu nicho.'],
  ['#av-objetivo', 'Escolha o que você quer resolver primeiro.'],
  ['#av-maior', 'Confirme que você tem 18 anos ou mais.']
];
const GUARDIAN = 'Por enquanto atendo só maiores de 18 anos. Live com menor de idade tem regras próprias. Se você é responsável por um criador menor, escreva para smillepls@gmail.com e eu converso com você.';

async function reload(t) {
  await t.page.goto(`${t.base}${t.route}`, {waitUntil: 'load'});
  await t.page.waitForSelector('html[data-page-ready="ao-vivo"]', {state: 'attached'});
  await t.page.evaluate(() => document.fonts?.ready);
}
const rafCount = page => page.evaluate(() => window.__qa?.raf ?? 0);
/* Waits until nothing inside `selector` is animating (deck exchange, morph, fades). */
const settleIn = (page, selector) => page.waitForFunction(sel => document.getAnimations().every(a => a.playState !== 'running' || !a.effect?.target?.closest?.(sel)), selector, {timeout: 4000});
const activeScene = page => page.evaluate(() => [...document.querySelectorAll('#demo-overlay [data-deck-card]')].findIndex(card => card.classList.contains('is-active')));

/* Contrast of one element against its first opaque background (SPEC 2.3 spot check). */
function spotContrast(page, selector) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return 0;
    const parse = v => { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p[3] ?? 1}; };
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    let bg = null;
    for (let node = el; node; node = node.parentElement) { const c = parse(getComputedStyle(node).backgroundColor); if (c && c.a >= 1) { bg = c; break; } }
    const fg = parse(getComputedStyle(el).color);
    const [a, b] = [lum(fg), lum(bg || {r: 255, g: 255, b: 255})];
    return Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2));
  }, selector);
}

async function fillValid(page, {keyboard = false} = {}) {
  await page.locator('#av-plataformas [data-value="Twitch"]').click();
  await page.locator('#av-plataformas [data-value="YouTube"]').click();
  if (keyboard) {
    await page.locator('#av-frequencia [data-value="2 a 3 vezes por semana"]').focus();
    await page.keyboard.press('Space');
    await page.locator('#av-duracao [data-value="De 3 a 6 h"]').focus();
    await page.keyboard.press('Enter');
  } else {
    await page.locator('#av-frequencia [data-value="2 a 3 vezes por semana"]').click();
    await page.locator('#av-duracao [data-value="De 3 a 6 h"]').click();
  }
  await page.locator('#av-nicho [data-value="Conversa (Just Chatting)"]').click();
  await page.locator('#av-objetivo [data-value="Crescer fora da live"]').click();
  await page.locator('#av-maior').check();
}

export async function checks(t) {
  const {page, check, width, events} = t;
  await reload(t);

  // ---------- route basics ----------
  check('Title from copy-ao-vivo.md §0', await page.title() === 'Para quem transmite: identidade, cortes e patrocínio · Smile N');
  check('Canonical URL of the route', await page.evaluate(() => document.querySelector('link[rel="canonical"]').href) === `${ORIGIN}/criadores/ao-vivo`);
  check('Single h1 with the hero promise', await page.locator('h1').count() === 1 &&
    await page.getByRole('heading', {level: 1, name: 'A live acaba. O que ela rende, não.', exact: true}).count() === 1);
  check('No iframe, audio or video on the page', await page.evaluate(() => !document.querySelector('iframe,audio,video,embed,object')));
  check('Hero label and the empty partner space are visible', await page.getByText('Exemplo ilustrativo · Ateliê Exemplo (cliente fictício)').first().isVisible() &&
    await page.locator('.av-hero .av-scene-sponsor').isVisible() && await page.locator('.av-hero [data-publi]').count() === 0);

  // ---------- track switch (K4) and focus order ----------
  check('Track switch: "Vídeo e live" is current, "Redes sociais" links to /criadores, 44 px segments', await page.evaluate(() => {
    const links = [...document.querySelectorAll('main .pg-track a')];
    return links.length === 2 && links[0].getAttribute('href') === '/criadores' && !links[0].hasAttribute('aria-current') &&
      links[1].getAttribute('href') === '/criadores/ao-vivo' && links[1].getAttribute('aria-current') === 'page' &&
      links.every(a => a.getBoundingClientRect().height >= 44) && document.querySelector('.pg-track').getAttribute('aria-label') === 'Escolha a página do seu formato';
  }));
  const stops = [];
  for (let i = 0; i < 14 && stops.filter(s => s.inMain).length < 4; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => { const el = document.activeElement; return {inMain: Boolean(el?.closest('main')), href: el?.getAttribute('href'), text: el?.textContent.trim().slice(0, 40), cls: String(el?.className || '')}; }));
  }
  const inMain = stops.filter(s => s.inMain);
  check('Focus order: skip link, header, then the track switch and the hero CTA', stops[0]?.cls.includes('pg-skip') &&
    inMain[0]?.href === '/criadores' && inMain[1]?.href === '/criadores/ao-vivo' && inMain[2]?.href === '#diagnostico' && inMain[3]?.href === '#exemplos', stops);
  check('Header CTA leads to the form', await page.locator('.site-header [data-header-cta]').getAttribute('href') === '#diagnostico');

  // ---------- AV3 · service flips (K5): 600/350 ms, one open at a time, Escape ----------
  const cards = page.locator('#servicos [data-flip]');
  check('Three service cards are ready to flip', await cards.count() === 3 && await page.evaluate(() => [...document.querySelectorAll('#servicos [data-flip]')].every(c => c.dataset.flipReady === 'true')));
  await cards.nth(0).locator('[data-flip-open]').click();
  const openTiming = await page.evaluate(() => document.getAnimations().map(a => a.effect?.target?.closest?.('#frente-identidade') && a.effect.target.classList.contains('pg-flip-rotor') ? a.effect.getTiming().duration : null).find(Boolean));
  check('Opening a service card takes 600 ms and focuses "O que vem"', openTiming === 600 && await cards.nth(0).getAttribute('data-face') === 'back' &&
    await page.evaluate(() => document.activeElement === document.querySelector('#frente-identidade [data-flip-focus]')), openTiming);
  await pause(650);
  await cards.nth(1).locator('[data-flip-open]').click();
  await pause(650);
  check('Opening another card closes the first one', await cards.nth(0).getAttribute('data-face') === 'front' && await cards.nth(1).getAttribute('data-face') === 'back' &&
    await cards.nth(0).locator('[data-flip-open]').getAttribute('aria-pressed') === 'false');
  await page.keyboard.press('Escape');
  const closeTiming = await page.evaluate(() => document.getAnimations().map(a => a.effect?.target?.closest?.('#frente-cortes') && a.effect.target.classList.contains('pg-flip-rotor') ? a.effect.getTiming().duration : null).find(Boolean));
  check('Escape closes the card in 350 ms and returns focus to "Ver o que vem"', closeTiming === 350 && await cards.nth(1).getAttribute('data-face') === 'front' &&
    await page.evaluate(() => document.activeElement === document.querySelector('#frente-cortes [data-flip-open]')), closeTiming);
  await pause(400);

  // ---------- AV4.1 · overlay scenes (K17 + K6 + K8) ----------
  const overlay = page.locator('#demo-overlay');
  await overlay.scrollIntoViewIfNeeded();
  check('Scenes stack as a deck: one active, the others inert', await page.evaluate(() => {
    const deck = document.querySelector('#demo-overlay [data-deck]'), cards = [...deck.querySelectorAll('[data-deck-card]')];
    return deck.dataset.deckMode === 'stack' && cards.length === 4 && cards[0].classList.contains('is-active') && cards.slice(1).every(c => c.inert && c.getAttribute('aria-hidden') === 'true');
  }));
  check('Deck exchange is 400 ms ease', await page.evaluate(() => { const s = getComputedStyle(document.querySelector('#demo-overlay [data-deck-card]')); return s.transitionDuration.split(',')[0].trim() === '0.4s' && s.transitionTimingFunction.split(',')[0].trim() === 'ease'; }));
  await overlay.locator('[data-scene-go="1"]').click();
  check('"Ao vivo" becomes the active scene and the status explains the label', await activeScene(page) === 1 &&
    await overlay.locator('[data-scene-go="1"]').getAttribute('aria-pressed') === 'true' && await overlay.locator('[data-overlay-status]').innerText() === SCENE_STATUS[1]);
  await settleIn(page, '#demo-overlay');
  const publi = overlay.locator('[data-deck-card].is-active [data-publi]');
  const publiShown = async () => await publi.isVisible() && await publi.evaluate(el => { let o = 1; for (let n = el; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity); return o === 1 && el.textContent === '#publi · Publicidade'; });
  const looks = [];
  for (let i = 0; i < 4; i++) { looks.push(await publiShown()); await pause(300); }
  check('"#publi · Publicidade" stays fully visible during the sponsored scene', looks.every(Boolean) && await page.evaluate(() => document.getAnimations().every(a => !a.effect?.target?.closest?.('[data-publi]'))), looks);
  const publiRatio = await spotContrast(page, '#demo-overlay [data-deck-card].is-active [data-publi]');
  check('#publi tag contrast ≥ 4.5:1', publiRatio >= 4.5, publiRatio);
  check('Partner space carries no brand', (await overlay.locator('[data-deck-card].is-active .av-scene-sponsor').innerText()).trim() === 'Espaço da marca parceira');

  await overlay.locator('[data-overlay-ratio="9:16"]').click();
  const morph = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('#demo-overlay [data-overlay-device]')); return [s.transitionDuration, s.transitionTimingFunction]; });
  check('16:9 → 9:16 morphs in 350 ms with cubic-bezier(.2,.9,.25,1.02)', morph[0].split(',')[0].trim() === '0.35s' && morph[1].includes('cubic-bezier(0.2, 0.9, 0.25, 1.02)'), morph);
  await settleIn(page, '#demo-overlay');
  check('9:16 frame is at most 220 px wide and the scene turns portrait', await page.evaluate(() => {
    const device = document.querySelector('#demo-overlay [data-overlay-device]').getBoundingClientRect();
    const scene = document.querySelector('#demo-overlay [data-deck-card].is-active').getBoundingClientRect();
    return device.width <= 220.5 && scene.height > scene.width;
  }) && await overlay.locator('[data-overlay-status]').innerText() === '9:16: a mesma cena, recomposta para o celular.');
  check('#publi remains visible in 9:16', await publiShown());
  await overlay.locator('[data-overlay-ratio="16:9"]').click();
  await settleIn(page, '#demo-overlay');
  check('Back to 16:9 with its status', await overlay.locator('[data-overlay-status]').innerText() === '16:9: a cena para a tela grande.' &&
    await page.evaluate(() => { const r = document.querySelector('#demo-overlay [data-deck-card].is-active').getBoundingClientRect(); return r.width > r.height; }));
  await overlay.locator('[data-deck-stage]').focus();
  await page.keyboard.press('ArrowRight');
  check('ArrowRight on the stage shows "Intervalo"', await activeScene(page) === 2 && await overlay.locator('[data-scene-go="2"]').getAttribute('aria-pressed') === 'true' &&
    await overlay.locator('[data-overlay-status]').innerText() === SCENE_STATUS[2]);
  await page.keyboard.press('End');
  check('End reaches "Encerrando" (no loop)', await activeScene(page) === 3);
  await page.keyboard.press('Home');
  await settleIn(page, '#demo-overlay');
  const box = await overlay.locator('[data-deck-card].is-active').boundingBox();
  const cx = box.x + box.width * .7, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let step = 1; step <= 8; step++) await page.mouse.move(cx - step * 18, cy + step);
  await page.mouse.up();
  check('A horizontal drag on the screen changes the scene', await activeScene(page) === 1);
  await settleIn(page, '#demo-overlay');
  const box2 = await overlay.locator('[data-deck-card].is-active').boundingBox();
  await page.mouse.move(box2.x + box2.width / 2, box2.y + 10); await page.mouse.down();
  for (let step = 1; step <= 6; step++) await page.mouse.move(box2.x + box2.width / 2 + step, box2.y + 10 + step * 12);
  await page.mouse.up();
  check('A vertical drag keeps the scene (axis lock)', await activeScene(page) === 1);
  await settleIn(page, '#demo-overlay');

  // ---------- AV4.2 · Da live ao corte (K15) ----------
  const cut = page.locator('#demo-corte');
  await cut.scrollIntoViewIfNeeded();
  check('Playback never starts by itself', await cut.locator('[data-cut-clock]').innerText() === '00:00' && await cut.locator('[data-cut-play]').getAttribute('aria-label') === 'Assistir');
  await cut.locator('[data-cut-mark="0"]').click();
  check('Choosing 00:42 turns the preview into a 9:16 cut with title and caption', await cut.locator('[data-cut-device]').getAttribute('data-ratio') === '9:16' &&
    await cut.locator('[data-cut-title]').innerText() === 'Rachou ao vivo. E agora?' && await cut.locator('[data-cut-caption]').isVisible() &&
    await cut.locator('[data-cut-caption]').innerText() === '"Calma, dá para salvar. Olha só."' &&
    await cut.locator('[data-cut-status]').innerText() === 'Marcação 00:42: a prévia virou um corte 9:16.' &&
    await cut.locator('[data-cut-mark="0"]').getAttribute('aria-pressed') === 'true');
  const glide = await page.evaluate(() => { const s = getComputedStyle(document.querySelector('#demo-corte .av-cut-rail')); return [s.transitionDuration, s.transitionTimingFunction]; });
  check('The playhead glides to the mark in 500 ms cubic-bezier(.25,.1,.25,1)', glide[0] === '0.5s' && glide[1] === 'cubic-bezier(0.25, 0.1, 0.25, 1)', glide);
  await pause(600);
  check('9:16 cut is at most 220 px wide', await page.evaluate(() => document.querySelector('#demo-corte [data-cut-device]').getBoundingClientRect().width <= 220.5));
  const idleBefore = await rafCount(page);
  await pause(300);
  check('No requestAnimationFrame before "Assistir"', await rafCount(page) === idleBefore);
  await cut.locator('[data-cut-play]').click();
  await pause(700);
  check('"Assistir" plays the storyboard with rAF only while it plays', await rafCount(page) > idleBefore && await cut.locator('[data-cut-play]').getAttribute('aria-label') === 'Pausar');
  if (width >= 1440) {
    await page.waitForFunction(() => document.querySelector('#demo-corte [data-cut-status]').textContent === 'Fim: três cenas em dez segundos.', null, {timeout: 12000});
    check('Playback stops by itself at 10 s', await cut.locator('[data-cut-clock]').innerText() === '00:10' && await cut.locator('[data-cut-play]').getAttribute('aria-label') === 'Assistir' &&
      await cut.locator('[data-cut-title]').innerText() === 'Live completa toda quinta.');
    const afterEnd = await rafCount(page);
    await pause(800);
    check('rAF is idle again after the 10 s storyboard', await rafCount(page) === afterEnd);
  } else {
    await cut.locator('[data-cut-play]').click();
    check('"Pausar" stops playback on the current scene', await cut.locator('[data-cut-status]').innerText() === 'Pausado na cena 1 de 3.' && await cut.locator('[data-cut-play]').getAttribute('aria-label') === 'Assistir');
    const paused = await rafCount(page);
    await pause(500);
    check('rAF is idle after "Pausar"', await rafCount(page) === paused);
    await cut.locator('[data-cut-play]').click();
    await pause(300);
    await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
    await pause(400);
    check('Leaving the screen stops playback (IntersectionObserver)', await page.evaluate(() => document.querySelector('#demo-corte [data-cut-play]').getAttribute('aria-label') === 'Assistir' && /^Pausado na cena \d de 3\.$/.test(document.querySelector('#demo-corte [data-cut-status]').textContent)));
    const offscreen = await rafCount(page);
    await pause(500);
    check('rAF is idle once the demo is off screen', await rafCount(page) === offscreen);
    await cut.scrollIntoViewIfNeeded();
  }
  await cut.locator('[data-cut-ratio="16:9"]').click();
  check('Format control switches back to 16:9', await cut.locator('[data-cut-device]').getAttribute('data-ratio') === '16:9' && await cut.locator('[data-cut-status]').innerText() === '16:9: a cena para a tela grande.');
  await pause(450);

  // ---------- AV4.3 · thumbnail slider (K16) ----------
  const thumb = page.locator('#demo-thumb');
  const range = thumb.locator('[data-compare-range]');
  await thumb.scrollIntoViewIfNeeded();
  await range.focus();
  await page.keyboard.press('ArrowRight');
  check('ArrowRight steps to 60 with a 500 ms glide and the valuetext', await range.inputValue() === '60' && await range.getAttribute('aria-valuetext') === 'Mostrando 60% da versão nova' &&
    await page.evaluate(() => { const root = document.querySelector('#demo-thumb [data-compare]'); return root.classList.contains('is-gliding') && getComputedStyle(root.querySelector('.pg-compare-after')).transitionDuration === '0.5s'; }));
  await pause(650);
  check('The divider follows the value', await page.evaluate(() => {
    const stage = document.querySelector('#demo-thumb [data-compare-stage]').getBoundingClientRect(), handle = document.querySelector('#demo-thumb [data-compare-handle]').getBoundingClientRect();
    return Math.abs(handle.left + handle.width / 2 - (stage.left + stage.width * .6)) < 3;
  }));
  const stageBox = await thumb.locator('[data-compare-stage]').boundingBox();
  const handleBox = await thumb.locator('[data-compare-handle] > span').boundingBox();
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2); await page.mouse.down();
  for (let step = 1; step <= 8; step++) await page.mouse.move(handleBox.x + handleBox.width / 2 - (handleBox.x + handleBox.width / 2 - (stageBox.x + stageBox.width * .25)) * step / 8, handleBox.y + handleBox.height / 2);
  await page.mouse.up();
  const dragged = Number(await range.inputValue());
  check('Dragging the divider moves the comparison', Math.abs(dragged - 25) <= 3 && await range.getAttribute('aria-valuetext') === `Mostrando ${dragged}% da versão nova`, dragged);
  await page.mouse.move(stageBox.x + stageBox.width * .7, stageBox.y + 20); await page.mouse.down();
  for (let step = 1; step <= 6; step++) await page.mouse.move(stageBox.x + stageBox.width * .7 + step, stageBox.y + 20 + step * 14);
  await page.mouse.up();
  check('A vertical drag on the thumbnail keeps the value (axis lock)', Number(await range.inputValue()) === dragged);

  // ---------- AV7 · diagnosis form (SPEC 4.0/4.B) ----------
  const form = page.locator('#diagnostico-form'), panel = page.locator('#av-revisao');
  const sameOrigin = [];
  const onRequest = request => { if (request.url().startsWith(t.base)) sameOrigin.push(`${request.method()} ${request.url()}`); };
  page.on('request', onRequest);
  await form.scrollIntoViewIfNeeded();
  check('JS enables "Revisar mensagem" and retires the no-JS note', await form.locator('[type=submit]').isEnabled() && !(await page.locator('[data-nojs-fallback]').isVisible()));
  check('No WhatsApp or e-mail link exists before the answers are valid', await panel.locator('a[href]').count() === 0);

  await form.locator('#av-plataformas [data-value="YouTube"]').focus();
  const path = [];
  for (let i = 0; i < 40; i++) {
    const where = await page.evaluate(() => { const el = document.activeElement; return el?.matches('[type=submit]') ? 'submit' : (el?.closest('fieldset')?.id || el?.id || ''); });
    if (path.at(-1) !== where) path.push(where);
    if (where === 'submit') break;
    await page.keyboard.press('Tab');
  }
  check('Keyboard path follows the fieldsets in order', JSON.stringify(path) === JSON.stringify(['av-plataformas', 'av-frequencia', 'av-duracao', 'av-nicho', 'av-objetivo', 'av-canal', 'av-maior', 'submit']), path);

  const urlBefore = page.url(), requestsBefore = sameOrigin.length;
  await page.keyboard.press('Enter');
  check('Empty submit focuses "Falta pouco. Confira:" with the pt-BR errors in order', await page.evaluate(errors => {
    const summary = document.getElementById('av-erros');
    const links = [...summary.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent]);
    return document.activeElement === summary && summary.querySelector('h3').textContent === 'Falta pouco. Confira:' && JSON.stringify(links) === JSON.stringify(errors);
  }, ERRORS), await page.locator('#av-erros').innerText());
  check('Errors are inline, linked by aria-describedby, with aria-invalid on the checkbox', await page.evaluate(errors => errors.every(([sel, message]) => {
    const field = document.querySelector(sel), error = document.getElementById(`${field.id}-erro`);
    const linked = (field.getAttribute('aria-describedby') || '').split(' ').includes(error.id);
    const flagged = field.tagName === 'FIELDSET' ? field.dataset.invalid === 'true' : field.getAttribute('aria-invalid') === 'true';
    return error && !error.hidden && error.textContent.trim().endsWith(message) && linked && flagged;
  }), ERRORS));
  check('Under 18: the guardian path by e-mail appears and the review stays closed', await page.locator('#av-maior-ajuda-erro').innerText() === GUARDIAN &&
    await page.locator('#av-maior-ajuda-erro a[href="mailto:smillepls@gmail.com"]').count() === 1 && !(await panel.isVisible()));
  const errorContrast = await contrastAudit(page);
  check('Contrast holds with the errors on screen', errorContrast.failures.length === 0, errorContrast.failures);
  check('Submitting never navigates or requests anything', page.url() === urlBefore && sameOrigin.length === requestsBefore && events.nonGet.length === 0, sameOrigin.slice(requestsBefore));
  await page.locator('#av-erros a[href="#av-objetivo"]').click();
  check('Summary link focuses its field', await page.evaluate(() => Boolean(document.activeElement?.closest('#av-objetivo'))));

  await fillValid(page, {keyboard: true});
  await page.locator('#av-nicho [data-value="Outro"]').click();
  const other = page.locator('#av-nicho-outro');
  check('"Outro" reveals the "Qual?" field', await other.isVisible() && await other.isEnabled() && await page.locator('label[for="av-nicho-outro"]').innerText() === 'Qual?');
  await other.fill('x'.repeat(41));
  check('No error appears while typing', await other.getAttribute('aria-invalid') === null);
  await page.keyboard.press('Tab');
  check('Blur shows "Use até 40 caracteres."', await other.getAttribute('aria-invalid') === 'true' && (await page.locator('#av-nicho-outro-erro').innerText()).includes('Use até 40 caracteres.'));
  await other.fill('Cerâmica ao vivo');
  check('Fixing the answer clears the error while typing', await other.getAttribute('aria-invalid') === null);
  const channel = page.locator('#av-canal');
  await channel.fill('ab cd');
  await channel.blur();
  check('A broken link shows the pt-BR hint', await channel.getAttribute('aria-invalid') === 'true' && (await page.locator('#av-canal-erro').innerText()).includes('Esse link não abre. Ele começa com https://?'));
  await channel.fill('twitch.tv/canal.exemplo');
  await channel.blur();
  const stillInvalid = await page.evaluate(() => [...document.querySelectorAll('#diagnostico-form [aria-invalid="true"],#diagnostico-form [data-invalid="true"]')].map(el => el.id));
  check('Fixed answers clear every error', stillInvalid.length === 0, stillInvalid);
  const summary = await page.locator('#av-resumo [data-summary-list] li').allInnerTexts();
  check('Live summary follows the answers', JSON.stringify(summary) === JSON.stringify(['Transmite em: YouTube e Twitch', '2 a 3 vezes por semana · De 3 a 6 h', 'Nicho: Cerâmica ao vivo', 'Primeiro: Crescer fora da live']), summary);

  const expected = (duration = 'de 3 a 6 h') => ['Oi, Smile! Vim pela página de criadores ao vivo.', 'Transmito em: YouTube e Twitch',
    `Frequência: 2 a 3 vezes por semana · Duração média: ${duration}`, 'Nicho: Cerâmica ao vivo',
    'Quero resolver primeiro: crescer fora da live (cortes e Shorts)', 'Canal: https://twitch.tv/canal.exemplo', CONSENT].join('\n');
  const before = sameOrigin.length;
  await form.locator('[type=submit]').click();
  check('Valid submit opens the review and focuses its title', await panel.isVisible() && await page.evaluate(() => document.activeElement?.id === 'av-revisao-titulo') &&
    await page.locator('#av-revisao-titulo').innerText() === 'Seu diagnóstico está pronto.');
  check('Review shows the exact message', await panel.locator('[data-handoff-message]').innerText() === expected(), await panel.locator('[data-handoff-message]').innerText());
  check('WhatsApp href equals wa.me + encodeURIComponent(message)', await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href') === `https://wa.me/5511985568208?text=${encodeURIComponent(expected())}`);
  const mail = await panel.locator('a[data-handoff="email"]').getAttribute('href');
  check('E-mail href has the page subject and %0D%0A breaks', mail === `mailto:smillepls@gmail.com?subject=${encodeURIComponent('Diagnóstico de live · cortes')}&body=${encodeURIComponent(expected().replace(/\n/g, '\r\n'))}`, mail);
  check('Nothing is sent on submit: same URL, no request, no tab, no WhatsApp call', page.url() === urlBefore && sameOrigin.length === before && events.popups.length === 0 && events.handoff.length === 0,
    {requests: sameOrigin.slice(before), popups: events.popups.length, handoff: events.handoff});
  await settleIn(page, '#av-revisao');
  const reviewContrast = await contrastAudit(page);
  check('Contrast holds with the review panel open', reviewContrast.failures.length === 0, reviewContrast.failures);

  await page.locator('#av-duracao [data-value="Mais de 6 h"]').click();
  check('Changing an answer updates the message and both links', (await panel.locator('[data-handoff-message]').innerText()) === expected('mais de 6 h') &&
    decodeURIComponent((await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href')).split('text=')[1]) === expected('mais de 6 h') &&
    decodeURIComponent((await panel.locator('a[data-handoff="email"]').getAttribute('href')).split('body=')[1]) === expected('mais de 6 h').replace(/\n/g, '\r\n'));
  await page.locator('#av-maior').uncheck();
  check('Unchecking 18+ hides the review and removes both links', !(await panel.isVisible()) && await panel.locator('a[href]').count() === 0);
  await page.locator('#av-maior').check();
  await form.locator('[type=submit]').click();
  const popup = page.context().waitForEvent('page');
  await panel.locator('a[data-handoff="whatsapp"]').click();
  const opened = await popup;
  await opened.waitForLoadState('domcontentloaded').catch(() => {});
  await pause(200);
  check('wa.me is requested only after the tap, and intercepted', events.handoff.length >= 1 && events.handoff[0] === `https://wa.me/5511985568208?text=${encodeURIComponent(expected('mais de 6 h'))}`, events.handoff);
  await opened.close();
  events.popups.length = 0; events.handoff.length = 0;
  check('WhatsApp status line is shown', await panel.locator('[data-handoff-status]').innerText() === 'Abrindo o WhatsApp. Confira a mensagem e toque em enviar lá.');
  await panel.locator('[data-handoff="edit"]').click();
  check('"Editar respostas" returns focus to the first answer', await page.evaluate(() => Boolean(document.activeElement?.closest('#av-plataformas'))));
  page.off('request', onRequest);

  // ---------- ?ref= origin line (allowlist) ----------
  if (width >= 1440) {
    await page.goto(`${t.base}${t.route}?ref=dm`, {waitUntil: 'load'});
    await page.waitForSelector('html[data-page-ready="ao-vivo"]', {state: 'attached'});
    await fillValid(page);
    await page.locator('#diagnostico-form [type=submit]').click();
    check('?ref=dm adds "Origem: link que você me mandou" before the consent line', (await page.locator('#av-revisao [data-handoff-message]').innerText()).endsWith(`Origem: link que você me mandou\n${CONSENT}`));
    await page.goto(`${t.base}${t.route}?ref=spam`, {waitUntil: 'load'});
    await page.waitForSelector('html[data-page-ready="ao-vivo"]', {state: 'attached'});
    await fillValid(page);
    await page.locator('#diagnostico-form [type=submit]').click();
    check('An unknown ?ref= adds no origin line', !(await page.locator('#av-revisao [data-handoff-message]').innerText()).includes('Origem'));
  }
}

/* Reduced motion (reducedMotion: 'reduce'): instant changes, no transform running. */
export async function reduced(t) {
  const {page} = t;
  await page.waitForSelector('html[data-page-ready="ao-vivo"]', {state: 'attached'});
  await motionlessChecks(t, 'reduced motion');
}

/* Pause button (the runner already clicked #motion-toggle). */
export async function paused(t) {
  const {page, check} = t;
  check('Pause is on before the page checks', await page.evaluate(() => document.body.classList.contains('is-paused')));
  await motionlessChecks(t, 'paused');
}

async function motionlessChecks(t, label) {
  const {page, check} = t;
  check(`Service cards list both faces without buttons (${label})`, await page.evaluate(() => [...document.querySelectorAll('#servicos [data-flip]')].every(card => {
    const front = card.querySelector('[data-flip-front]'), back = card.querySelector('[data-flip-back]');
    return !front.inert && !back.inert && back.getBoundingClientRect().top >= front.getBoundingClientRect().bottom - 1 && getComputedStyle(card.querySelector('[data-flip-open]')).display === 'none';
  })));
  const overlay = page.locator('#demo-overlay');
  await overlay.scrollIntoViewIfNeeded();
  check(`Overlay deck shows only the active scene (${label})`, await page.evaluate(() => {
    const deck = document.querySelector('#demo-overlay [data-deck]'), cards = [...deck.querySelectorAll('[data-deck-card]')];
    return deck.dataset.deckMode === 'list' && cards.filter(c => c.getClientRects().length).length === 1 && cards[0].getClientRects().length === 1;
  }));
  const raf = await rafCount(page);
  await overlay.locator('[data-scene-go="1"]').click();
  await pause(50);
  check(`Scenes change instantly with nothing running (${label})`, (await runningAnimations(page)) === 0 && await activeScene(page) === 1 &&
    await overlay.locator('[data-deck-card].is-active [data-publi]').isVisible() && await overlay.locator('[data-overlay-status]').innerText() === SCENE_STATUS[1]);
  await overlay.locator('[data-overlay-ratio="9:16"]').click();
  await pause(50);
  check(`The 9:16 frame appears at once (${label})`, (await runningAnimations(page)) === 0 && await page.evaluate(() => document.querySelector('#demo-overlay [data-overlay-device]').getBoundingClientRect().width <= 220.5));
  const cut = page.locator('#demo-corte');
  await cut.scrollIntoViewIfNeeded();
  await cut.locator('[data-cut-mark="0"]').click();
  await pause(50);
  check(`Choosing a mark is instant (${label})`, (await runningAnimations(page)) === 0 && await cut.locator('[data-cut-device]').getAttribute('data-ratio') === '9:16');
  await cut.locator('[data-cut-play]').click();
  await pause(50);
  check(`"Assistir" steps one scene per tap (${label})`, await cut.locator('[data-cut-status]').innerText() === 'Cena 2 de 3: O trecho da live, com legenda.' && await cut.locator('[data-cut-play]').getAttribute('aria-label') === 'Assistir');
  await cut.locator('[data-cut-play]').click();
  await cut.locator('[data-cut-play]').click();
  check(`Steps wrap to the first scene (${label})`, await cut.locator('[data-cut-status]').innerText() === 'Cena 1 de 3: Rachou ao vivo. E agora?');
  await pause(50);
  check(`No running animation after the steps (${label})`, (await runningAnimations(page)) === 0);
  const range = page.locator('#demo-thumb [data-compare-range]');
  await range.focus();
  await page.keyboard.press('ArrowRight');
  await pause(50);
  check(`Slider steps without a glide (${label})`, await range.inputValue() === '60' && (await runningAnimations(page)) === 0 && !(await page.evaluate(() => document.querySelector('#demo-thumb [data-compare]').classList.contains('is-gliding'))));
  check(`No requestAnimationFrame during the motionless interactions (${label})`, await rafCount(page) === raf);
  await page.locator('#diagnostico-form').scrollIntoViewIfNeeded();
  await fillValid(page);
  await page.locator('#diagnostico-form [type=submit]').click();
  await pause(50);
  check(`Review and check appear without movement (${label})`, (await runningAnimations(page)) === 0 && await page.locator('#av-revisao').isVisible());
}

/* Without JavaScript: everything readable, mailto fallback, disabled submit. */
export async function noJs(t) {
  const {page, check} = t;
  check('Form submit stays disabled without JS', await page.locator('#diagnostico-form [type=submit]').isDisabled());
  const fallback = page.locator('[data-nojs-fallback] a[data-mailto-model="diagnostico"]');
  const href = await fallback.getAttribute('href');
  check('The mailto fallback is visible with the §8.5 subject and body', await fallback.isVisible() && href.startsWith('mailto:smillepls@gmail.com?subject=Diagn%C3%B3stico%20de%20live&body=') &&
    decodeURIComponent(href.split('body=')[1]) === ['Oi, Smile! Vim pela página de criadores ao vivo.', 'Transmito em:', 'Frequência:', 'Duração média:', 'Nicho:', 'Quero resolver primeiro:', CONSENT].join('\r\n'));
  check('Fallback text names the address', (await page.locator('[data-nojs-fallback]').innerText()).startsWith('Sem JavaScript? Escreva para smillepls@gmail.com'));
  check('Both faces of every service card are readable', await page.evaluate(() => [...document.querySelectorAll('#servicos [data-flip]')].every(card => card.querySelector('[data-flip-back]').getBoundingClientRect().height > 40 && getComputedStyle(card.querySelector('[data-flip-open]')).display === 'none')));
  check('All four overlay scenes are listed', await page.evaluate(() => [...document.querySelectorAll('#demo-overlay [data-deck-card]')].every(card => { const r = card.getBoundingClientRect(); return r.height > 60 && getComputedStyle(card).visibility === 'visible'; })));
  check('The three marks of "Da live ao corte" are listed', await page.locator('.av-cut-static li').count() === 3 && await page.locator('.av-cut-static').isVisible());
  check('Both thumbnails sit side by side', await page.evaluate(() => {
    const before = document.querySelector('#demo-thumb .pg-compare-before').getBoundingClientRect(), after = document.querySelector('#demo-thumb .pg-compare-after').getBoundingClientRect();
    return before.width > 80 && after.width > 80 && (after.right <= before.left + 1 || before.right <= after.left + 1) && getComputedStyle(document.querySelector('#demo-thumb .pg-compare-after')).clipPath === 'none';
  }));
  check('JS-only controls are hidden', await page.evaluate(() => [...document.querySelectorAll('[data-js-only]')].every(el => getComputedStyle(el).display === 'none')));
  check('Final strip keeps the e-mail alternative', await page.locator('#comece a[data-mailto-model="diagnostico"]').isVisible());
}
