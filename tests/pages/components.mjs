/* Shared components exercised in a real browser before the pages use them:
 * K5 flip, K6 deck, K9 builder, K10 handoff, K11 accordion, K19 check and K7/K8
 * device frames. A fixture is injected into /privacidade (DOM + same-origin
 * stylesheets and modules only, so the page CSP stays untouched). */
import {runningAnimations, settle} from './harness.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const CONSENT = '— Tenho 18 anos ou mais e li o aviso de privacidade (versão 2026-10).';
const HELP = 'Por enquanto atendo só maiores de 18 anos. Se você é responsável por um criador menor de idade, escreva para smillepls@gmail.com e eu converso com você.';

const card = (n, title) => `<article class="pg-deck-card pg-panel" data-deck-card aria-label="${n} de 3: ${title}"><h3>${title}</h3><p>Conteúdo do cartão ${n}.</p></article>`;
const flip = (id, mode = '') => `<article class="pg-flip" id="${id}" data-flip ${mode ? `data-flip-reduced="${mode}"` : ''} data-flip-surface>
  <div class="pg-flip-stage"><div class="pg-flip-rotor">
    <div class="pg-flip-face pg-flip-front pg-panel" data-flip-front><h3>Frente ${id}</h3><button class="pg-btn pg-btn--secondary" type="button" data-flip-open aria-pressed="false">Ver o verso</button></div>
    <div class="pg-flip-face pg-flip-back pg-panel" data-flip-back><h3 tabindex="-1" data-flip-focus>Verso ${id}</h3><p>Lista do verso.</p><button class="pg-btn pg-btn--secondary" type="button" data-flip-close>Voltar para a capa</button></div>
  </div></div></article>`;

export const FIXTURE = `<section class="pg-section pg-section--floresta" id="qa-fixture" aria-label="Componentes em teste"><div class="pg-container">
  ${flip('qa-flip')}
  ${flip('qa-flip-stack', 'stack')}
  <div class="pg-deck" data-deck id="qa-deck">
    <div class="pg-deck-stage" data-deck-stage role="region" aria-roledescription="baralho" aria-label="Cartões de teste" tabindex="0">${card(1, 'Kit')}${card(2, 'Conteúdo')}${card(3, 'Presença')}</div>
    <div class="pg-deck-nav" role="group" aria-label="Navegar pelos cartões"><button type="button" data-deck-prev aria-label="Cartão anterior">←</button><p class="pg-deck-counter" role="status" data-deck-counter>1 de 3</p><button type="button" data-deck-next aria-label="Próximo cartão">→</button></div>
  </div>
  <form id="qa-form" novalidate>
    <div class="pg-error-summary" id="qa-erros" data-error-summary hidden></div>
    <div class="pg-field"><label class="pg-label" for="qa-perfil">Seu @ principal</label><p class="pg-hint" id="qa-perfil-dica">Pode colar o link do perfil.</p><input class="pg-input" id="qa-perfil" name="perfil" autocomplete="off" aria-describedby="qa-perfil-dica"></div>
    <fieldset class="pg-fieldset" id="qa-plataforma" data-chips="single" data-name="plataforma"><legend>Plataforma principal</legend><div class="pg-chip-row"><button class="pg-chip" type="button" aria-pressed="false" data-value="TikTok">TikTok</button><button class="pg-chip" type="button" aria-pressed="false" data-value="Instagram">Instagram</button></div></fieldset>
    <fieldset class="pg-fieldset" id="qa-preciso" data-chips="multi" data-name="preciso"><legend>Preciso de</legend><div class="pg-chip-row"><button class="pg-chip" type="button" aria-pressed="false" data-value="Mídia kit">Mídia kit</button><button class="pg-chip" type="button" aria-pressed="false" data-value="Proposta para marcas">Proposta para marcas</button><button class="pg-chip" type="button" aria-pressed="false" data-value="Ainda não sei" data-exclusive>Ainda não sei</button></div></fieldset>
    <label class="pg-check"><input type="checkbox" id="qa-maior" name="maior"><span class="pg-check-box" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="pg-check-text">Tenho 18 anos ou mais.</span></label>
    <div class="pg-summary" id="qa-resumo"><h3>Seu resumo <span data-summary-count>0 escolhas</span></h3><p data-summary-empty>Seu resumo aparece aqui conforme você escolhe.</p><ul data-summary-list></ul></div>
    <button class="pg-btn pg-btn--primary" type="submit" disabled>Revisar mensagem</button>
    <p data-nojs-fallback>Sem JavaScript? Escreva para <a href="mailto:smillepls@gmail.com?subject=Kit%20para%20marcas">smillepls@gmail.com</a>.</p>
    <section class="pg-review" id="qa-revisao" data-handoff-panel hidden aria-labelledby="qa-revisao-titulo">
      <h3 id="qa-revisao-titulo" data-handoff-title>Sua mensagem está pronta.</h3>
      <div class="pg-review-message" data-handoff-message></div>
      <div class="pg-review-actions"><a class="pg-btn pg-btn--primary" data-handoff="whatsapp" target="_blank" rel="noopener noreferrer">Abrir no WhatsApp <span aria-hidden="true">↗</span></a><a class="pg-btn pg-btn--secondary" data-handoff="email">Prefiro e-mail <span aria-hidden="true">↗</span></a><button class="pg-btn pg-btn--secondary" type="button" data-handoff="copy">Copiar mensagem</button><button class="pg-btn pg-btn--link" type="button" data-handoff="edit">Editar respostas <span aria-hidden="true">↑</span></button></div>
      <p class="pg-review-status" role="status" data-handoff-status></p>
    </section>
  </form>
  <div class="pg-accordion-list"><details class="pg-accordion" name="qa-faq" id="qa-faq-1"><summary><span>Pergunta 1</span><span class="pg-accordion-icon" aria-hidden="true">+</span></summary><div class="pg-accordion-body"><p>Resposta 1.</p></div></details><details class="pg-accordion" name="qa-faq" id="qa-faq-2"><summary><span>Pergunta 2</span><span class="pg-accordion-icon" aria-hidden="true">+</span></summary><div class="pg-accordion-body"><p>Resposta 2.</p></div></details></div>
  <div id="qa-devices"></div>
</div></section>`;

const STYLES = ['/assets/pages/flip.css', '/assets/pages/deck.css', '/assets/pages/accordion.css', '/assets/pages/check.css', '/assets/showcase/device-frame.css', '/assets/showcase/device-premium.css', '/assets/pages/devices.css'];

export async function mountFixture(page) {
  await page.evaluate(async ({html, styles}) => {
    await Promise.all(styles.map(href => new Promise((resolve, reject) => {
      const link = Object.assign(document.createElement('link'), {rel: 'stylesheet', href});
      link.onload = resolve; link.onerror = () => reject(new Error(href));
      document.head.append(link);
    })));
    document.querySelector('main').insertAdjacentHTML('beforeend', html);
    const [{mountFlip}, {mountDeck}, builder, handoff, shell, devices] = await Promise.all([
      import('/assets/pages/flip.js'), import('/assets/pages/deck.js'), import('/assets/pages/builder.js'),
      import('/assets/pages/handoff.js'), import('/assets/pages/shell.js'), import('/assets/pages/devices.js')]);
    window.__qaFlip = mountFlip(document.getElementById('qa-flip'));
    window.__qaFlipStack = mountFlip(document.getElementById('qa-flip-stack'));
    window.__qaDeck = mountDeck(document.getElementById('qa-deck'));
    const form = document.getElementById('qa-form');
    const answers = builder.mountBuilder(form, {summary: document.getElementById('qa-resumo'), describe: v => ({
      lines: [v.perfil && `@${v.perfil} · ${v.plataforma || ''}`.trim(), v.preciso.length ? `Preciso de: ${v.preciso.join(', ')}` : ''],
      count: (v.plataforma ? 1 : 0) + v.preciso.length})});
    const validator = builder.createValidator(form, [
      {id: 'qa-perfil', check: v => (v.perfil ? '' : 'Digite o @ do seu perfil principal.')},
      {id: 'qa-plataforma', check: v => (v.plataforma ? '' : 'Escolha a plataforma principal.')},
      {id: 'qa-preciso', check: v => (v.preciso.length ? '' : 'Escolha pelo menos uma opção em “Preciso de”.')},
      {id: 'qa-maior', check: v => (v.maior ? '' : {message: 'Confirme que você tem 18 anos ou mais.', help: window.__qaHelp})}
    ], {summary: document.getElementById('qa-erros')});
    window.__qaReview = handoff.mountReview({form, panel: document.getElementById('qa-revisao'), validator, page: 'qa', motion: shell.motion, compose: () => {
      const v = answers.values();
      return {lines: ['Oi, Smile! Vim pela página de criadores.', {label: 'Meu perfil principal', value: `@${v.perfil} (${v.plataforma})`},
        {label: 'Quero ajuda com', value: v.preciso.map(item => item.toLowerCase())}, {label: 'Origem', value: handoff.refOrigin()}],
        closing: [window.__qaConsent], subject: `Kit para marcas · @${v.perfil}`};
    }});
    const phone = devices.createPhone({content: '<p>Prévia</p>'});
    const notebook = devices.createNotebook({content: '<p>Cena</p>'});
    const tablet = devices.createTablet({content: '<p>Cena</p>'});
    document.getElementById('qa-devices').append(phone.root, notebook.root, tablet.root);
  }, {html: FIXTURE, styles: STYLES});
}

/* /privacidade has no page CTA; this serves it with one (same response and
 * headers, CSP included) so the shell's header CTA path is tested too. */
export async function withHeaderCta(context, base) {
  const cta = 'Ir para acessibilidade <span aria-hidden="true">↓</span>';
  await context.route(url => url.href.startsWith(base) && url.pathname === '/privacidade', async route => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace('<button id="motion-toggle"', `<a class="pg-btn pg-btn--primary pg-header-cta" href="#acessibilidade" data-header-cta>${cta}</a><button id="motion-toggle"`)
      .replace('<button class="pg-menu-motion"', `<a class="pg-btn pg-btn--primary" href="#acessibilidade" data-menu-item>${cta}</a><button class="pg-menu-motion"`);
    await route.fulfill({response, body});
  });
}

export async function componentChecks(t) {
  const {page, check, width, events} = t;
  await page.evaluate(({consent, help}) => { window.__qaConsent = consent; window.__qaHelp = help; }, {consent: CONSENT, help: HELP});
  await mountFixture(page);
  await settle(page).catch(() => {});

  // K5 flip
  const flipCard = page.locator('#qa-flip');
  await flipCard.scrollIntoViewIfNeeded();
  await flipCard.locator('[data-flip-open]').click();
  const openTiming = await page.evaluate(() => document.getAnimations().map(a => a.effect?.target?.classList?.contains('pg-flip-rotor') ? a.effect.getTiming().duration : null).find(Boolean));
  check('Flip opens in 600 ms', openTiming === 600, openTiming);
  check('Flip shows the back, swaps inert/aria-hidden and moves focus', await page.evaluate(() => {
    const card = document.getElementById('qa-flip'), front = card.querySelector('[data-flip-front]'), back = card.querySelector('[data-flip-back]');
    return card.dataset.face === 'back' && front.inert && !back.inert && front.getAttribute('aria-hidden') === 'true' && back.getAttribute('aria-hidden') === 'false' &&
      card.querySelector('[data-flip-open]').getAttribute('aria-pressed') === 'true' && document.activeElement === back.querySelector('[data-flip-focus]');
  }));
  await pause(650);
  await page.keyboard.press('Escape');
  const closeTiming = await page.evaluate(() => document.getAnimations().map(a => a.effect?.target?.classList?.contains('pg-flip-rotor') ? a.effect.getTiming().duration : null).find(Boolean));
  check('Escape closes the flip in 350 ms and returns focus', closeTiming === 350 && await page.evaluate(() => document.getElementById('qa-flip').dataset.face === 'front' && document.activeElement === document.querySelector('#qa-flip [data-flip-open]')), closeTiming);
  await pause(400);
  await flipCard.locator('.pg-flip-front h3').click();
  check('Tapping the card body flips it (card surface)', await flipCard.getAttribute('data-face') === 'back');
  await flipCard.locator('[data-flip-close]').click();

  // K6 deck
  const deck = page.locator('#qa-deck'), counter = deck.locator('[data-deck-counter]');
  await deck.scrollIntoViewIfNeeded();
  check('Deck stacks the cards with the active one on top', await deck.getAttribute('data-deck-mode') === 'stack' && await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#qa-deck [data-deck-card]')];
    return !cards[0].inert && cards[1].inert && cards[2].inert && cards[1].getAttribute('aria-hidden') === 'true';
  }));
  await pause(450);
  const level1 = await page.evaluate(() => getComputedStyle(document.querySelectorAll('#qa-deck [data-deck-card]')[1]).transform);
  check('Level 1 sits 24 px higher at scaleX(.95)', /^matrix\(0\.95, 0, 0, 1, 0, -24\)$/.test(level1), level1);
  check('Exchange is a 400 ms ease transition', await page.evaluate(() => { const s = getComputedStyle(document.querySelector('#qa-deck [data-deck-card]')); return s.transitionDuration.split(',')[0].trim() === '0.4s' && s.transitionTimingFunction.split(',')[0].trim() === 'ease'; }));
  await deck.locator('[data-deck-stage]').focus();
  await page.keyboard.press('ArrowRight');
  check('ArrowRight shows the next card', await counter.innerText() === '2 de 3');
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowRight');
  check('End reaches the last card and there is no loop', await counter.innerText() === '3 de 3' && await deck.locator('[data-deck-next]').getAttribute('aria-disabled') === 'true');
  await page.keyboard.press('Home');
  check('Home returns to the first card', await counter.innerText() === '1 de 3');
  await pause(450);
  const box = await deck.locator('[data-deck-card]').first().boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let step = 1; step <= 8; step++) await page.mouse.move(cx - step * 22, cy + step);
  await page.mouse.up();
  check('A horizontal drag moves to the next card', await counter.innerText() === '2 de 3');
  await pause(450);
  const box2 = await deck.locator('[data-deck-card]').nth(1).boundingBox();
  await page.mouse.move(box2.x + box2.width / 2, box2.y + 20); await page.mouse.down();
  for (let step = 1; step <= 6; step++) await page.mouse.move(box2.x + box2.width / 2 + step * 2, box2.y + 20 + step * 20);
  await page.mouse.up();
  check('A vertical drag never changes the card (axis lock)', await counter.innerText() === '2 de 3');
  await deck.locator('[data-deck-prev]').click();
  check('Previous button returns', await counter.innerText() === '1 de 3');

  // K9 builder + K10 handoff
  const form = page.locator('#qa-form'), panel = page.locator('#qa-revisao');
  await form.scrollIntoViewIfNeeded();
  check('Submit is enabled by JS and the no-JS note is retired', await form.locator('[type=submit]').isEnabled() && !(await form.locator('[data-nojs-fallback]').isVisible()));
  check('No WhatsApp link exists before the answers are valid', await panel.locator('a[href^="https://wa.me"]').count() === 0);
  await form.locator('[type=submit]').click();
  check('Empty submit focuses the error summary with pt-BR links', await page.evaluate(() => {
    const summary = document.getElementById('qa-erros');
    const links = [...summary.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent]);
    return document.activeElement === summary && summary.querySelector('h3').textContent === 'Falta pouco. Confira:' && JSON.stringify(links) === JSON.stringify([
      ['#qa-perfil', 'Digite o @ do seu perfil principal.'], ['#qa-plataforma', 'Escolha a plataforma principal.'],
      ['#qa-preciso', 'Escolha pelo menos uma opção em “Preciso de”.'], ['#qa-maior', 'Confirme que você tem 18 anos ou mais.']]);
  }));
  check('Invalid fields carry aria-invalid and aria-describedby', await page.evaluate(() => {
    const input = document.getElementById('qa-perfil'), box = document.getElementById('qa-maior'), group = document.getElementById('qa-plataforma');
    return input.getAttribute('aria-invalid') === 'true' && input.getAttribute('aria-describedby').split(' ').includes('qa-perfil-erro') && input.getAttribute('aria-describedby').includes('qa-perfil-dica') &&
      box.getAttribute('aria-invalid') === 'true' && group.dataset.invalid === 'true' && group.getAttribute('aria-describedby').includes('qa-plataforma-erro');
  }));
  check('Under-18 path shows the guardian e-mail and keeps the panel closed', await page.locator('#qa-maior-ajuda-erro').isVisible() && await page.locator('#qa-maior-ajuda-erro a[href="mailto:smillepls@gmail.com"]').count() === 1 && !(await panel.isVisible()));
  await page.locator('#qa-erros a[href="#qa-plataforma"]').click();
  check('Summary link focuses the field', await page.evaluate(() => document.activeElement?.closest('#qa-plataforma') !== null));

  await page.locator('#qa-perfil').fill('ana.ceramica');
  await page.locator('#qa-plataforma [data-value="Instagram"]').click();
  await page.locator('#qa-preciso [data-value="Mídia kit"]').focus();
  await page.keyboard.press('Space');
  await page.locator('#qa-preciso [data-value="Ainda não sei"]').click();
  check('"Ainda não sei" clears the other choices', await page.evaluate(() => [...document.querySelectorAll('#qa-preciso [aria-pressed="true"]')].map(b => b.dataset.value).join() === 'Ainda não sei'));
  await page.locator('#qa-preciso [data-value="Mídia kit"]').click();
  await page.locator('#qa-preciso [data-value="Proposta para marcas"]').focus();
  await page.keyboard.press('Enter');
  check('Another choice clears "Ainda não sei" (chips by click, Space and Enter)', await page.evaluate(() => [...document.querySelectorAll('#qa-preciso [aria-pressed="true"]')].map(b => b.dataset.value).join() === 'Mídia kit,Proposta para marcas'));
  await page.locator('#qa-maior').check();
  const stillInvalid = await page.evaluate(() => [...document.querySelectorAll('#qa-form [aria-invalid="true"],#qa-form [data-invalid="true"]')].map(el => el.id));
  check('Fixed answers clear their errors', stillInvalid.length === 0, stillInvalid);
  check('Live summary follows the answers', await page.locator('#qa-resumo [data-summary-count]').innerText() === '3 escolhas' && (await page.locator('#qa-resumo [data-summary-list]').innerText()).includes('@ana.ceramica · Instagram'));
  const before = page.url();
  await form.locator('[type=submit]').click();
  const ref = new URL(before).searchParams.get('ref');
  const origin = {dm: 'link que você me mandou', bio: 'link da sua bio', email: 'link do seu e-mail', qr: 'QR code'}[ref];
  const expected = ['Oi, Smile! Vim pela página de criadores.', 'Meu perfil principal: @ana.ceramica (Instagram)', 'Quero ajuda com: mídia kit e proposta para marcas', ...(origin ? [`Origem: ${origin}`] : []), CONSENT].join('\n');
  check('Valid submit opens the review panel and focuses its title', await panel.isVisible() && await page.evaluate(() => document.activeElement?.id === 'qa-revisao-titulo'));
  check('Review shows the exact message', await panel.locator('[data-handoff-message]').innerText() === expected, await panel.locator('[data-handoff-message]').innerText());
  check('WhatsApp href equals wa.me + encodeURIComponent(message)', await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href') === `https://wa.me/5511985568208?text=${encodeURIComponent(expected)}`);
  const mail = await panel.locator('a[data-handoff="email"]').getAttribute('href');
  check('E-mail href uses the profile address, the subject and %0D%0A', mail === `mailto:smillepls@gmail.com?subject=${encodeURIComponent('Kit para marcas · @ana.ceramica')}&body=${encodeURIComponent(expected.replace(/\n/g, '\r\n'))}`, mail);
  check('Submitting never navigates, opens a tab or contacts WhatsApp', page.url() === before && events.popups.length === 0 && events.handoff.length === 0, {url: page.url(), before, popups: events.popups.length, handoff: events.handoff});

  await page.locator('#qa-preciso [data-value="Proposta para marcas"]').click();
  check('Changing an answer updates the message and both links', (await panel.locator('[data-handoff-message]').innerText()).includes('Quero ajuda com: mídia kit\n') &&
    decodeURIComponent((await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href')).split('text=')[1]).includes('Quero ajuda com: mídia kit\n'));
  await page.locator('#qa-maior').uncheck();
  check('Unchecking 18+ hides the panel and removes the links', !(await panel.isVisible()) && await panel.locator('a[href]').count() === 0);
  await page.locator('#qa-maior').check();
  await page.locator('#qa-preciso [data-value="Proposta para marcas"]').click();
  await form.locator('[type=submit]').click();

  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('denied')); });
  await panel.locator('[data-handoff="copy"]').click();
  await page.waitForSelector('#qa-revisao [data-handoff-fallback]:not([hidden])');
  check('Without clipboard permission a read-only textarea offers the message', await page.evaluate(expectedText => {
    const area = document.querySelector('#qa-revisao [data-handoff-fallback]');
    return area.readOnly && area.value === expectedText && document.querySelector('#qa-revisao [data-handoff-status]').textContent === 'Não consegui copiar sozinho. Selecione o texto abaixo e copie.';
  }, expected));

  const popup = page.context().waitForEvent('page');
  await panel.locator('a[data-handoff="whatsapp"]').click();
  const opened = await popup;
  await opened.waitForLoadState('domcontentloaded').catch(() => {});
  await pause(200);
  check('wa.me is requested only after the click, and the request is intercepted', events.handoff.length >= 1 && events.handoff[0] === `https://wa.me/5511985568208?text=${encodeURIComponent(expected)}`, events.handoff);
  await opened.close();
  events.popups.length = 0; events.handoff.length = 0;
  check('WhatsApp status line is shown', await panel.locator('[data-handoff-status]').innerText() === 'Abrindo o WhatsApp. Confira a mensagem e toque em enviar lá.');
  const interactions = await page.evaluate(() => window.__qa.interactions);
  check('Interaction events carry no message content or contact data', interactions.some(item => item.event === 'pages_handoff_click' && item.channel === 'whatsapp') &&
    !JSON.stringify(interactions).match(/ana\.ceramica|5511985568208|smillepls/));
  await panel.locator('[data-handoff="edit"]').click();
  check('"Editar respostas" returns focus to the first answer', await page.evaluate(() => document.activeElement?.id === 'qa-perfil'));

  // K11 accordion, K19 check, K7/K8 frames
  await page.locator('#qa-faq-1 summary').click();
  await page.locator('#qa-faq-2 summary').click();
  check('<details name> keeps one FAQ item open', await page.evaluate(() => !document.getElementById('qa-faq-1').open && document.getElementById('qa-faq-2').open));
  check('Accordion summary is at least 48 px tall', await page.evaluate(() => document.querySelector('#qa-faq-1 summary').getBoundingClientRect().height >= 48));
  check('Checkbox target is 44 px and the check is drawn', await page.evaluate(() => {
    const label = document.querySelector('#qa-form .pg-check'), path = label.querySelector('svg');
    return label.getBoundingClientRect().height >= 44 && getComputedStyle(path).opacity === '1';
  }));
  check('Device frames mount standalone with neutral labels', await page.evaluate(() => {
    const frames = [...document.querySelectorAll('#qa-devices > [role=group]')];
    const labels = frames.map(el => el.getAttribute('aria-label')).join(' ');
    const notebook = document.querySelector('#qa-devices .pg-notebook .mbp-lid');
    return frames.length === 3 && !/iphone|ipad|macbook|apple/i.test(labels) &&
      document.querySelector('#qa-devices .pg-phone').getBoundingClientRect().width > 100 && notebook && notebook.getBoundingClientRect().height > 20 &&
      document.querySelector('#qa-devices .pg-tablet .ipad-pro-body').getBoundingClientRect().height > 20;
  }));
  check(`No running animation is left on the fixture (${width})`, await settle(page).then(() => true).catch(() => false));
}

/* SPEC 8.3 item 12 for the components: reduced motion and pause. */
export async function componentReducedChecks(t) {
  const {page, check} = t;
  await page.evaluate(({consent, help}) => { window.__qaConsent = consent; window.__qaHelp = help; }, {consent: CONSENT, help: HELP});
  await mountFixture(page);
  await page.locator('#qa-flip [data-flip-open]').click();
  await pause(50);
  check('Flip changes face with no running animation (reduced)', (await runningAnimations(page)) === 0 && await page.locator('#qa-flip').getAttribute('data-face') === 'back');
  check('"stack" flip lists both faces and hides its buttons (reduced)', await page.evaluate(() => {
    const card = document.getElementById('qa-flip-stack');
    const front = card.querySelector('[data-flip-front]'), back = card.querySelector('[data-flip-back]');
    return !front.inert && !back.inert && back.getBoundingClientRect().top >= front.getBoundingClientRect().bottom - 1 &&
      getComputedStyle(card.querySelector('[data-flip-open]')).display === 'none';
  }));
  check('Deck becomes a static list (reduced)', await page.evaluate(() => {
    const deck = document.getElementById('qa-deck'), cards = [...deck.querySelectorAll('[data-deck-card]')];
    return deck.dataset.deckMode === 'list' && cards.every(c => !c.inert && getComputedStyle(c).transform === 'none') && getComputedStyle(deck.querySelector('.pg-deck-nav')).display === 'none';
  }));
  await page.locator('#qa-perfil').fill('teste.x');
  await page.locator('#qa-plataforma [data-value="TikTok"]').click();
  await page.locator('#qa-preciso [data-value="Mídia kit"]').click();
  await page.locator('#qa-maior').check();
  await page.locator('#qa-form [type=submit]').click();
  await pause(50);
  check('Review panel and check appear without movement (reduced)', (await runningAnimations(page)) === 0 && await page.locator('#qa-revisao').isVisible());
}
