/* /vagas · route block for tests/browser-pages.mjs (SPEC 3.C, 4.C, 8.3).
 * The runner already covers the shell, CSP, network, contrast at load, targets,
 * rAF, reduced motion, pause, no-JS and the 390/1440 screenshots. This file adds
 * the honest status, the area cards (flip ≥ 720 px, disclosure list below), the
 * five-step form with its pt-BR errors, the keyboard path, the exact wa.me and
 * mailto links, and proof that nothing is submitted. */
import {contrastAudit, runningAnimations, settle} from './harness.mjs';

export const route = '/vagas';
export const slug = 'vagas';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const ORIGIN = 'https://portifolio-github-production.up.railway.app';
const AREAS = ['Edição de vídeo', 'Design gráfico e identidade', 'Motion design', 'Design UI e web', 'Atendimento e produção', 'Social media e conteúdo', 'Desenvolvimento front-end', 'Redação e roteiro', 'Captação e videomaker', 'Tráfego pago', 'Comercial'];
const LEGENDS = ['Em que área você quer entrar no radar?', 'Como você descreveria sua experiência?', 'Onde eu vejo seu trabalho?', 'Como e quando você poderia trabalhar?', 'Revise e escolha por onde enviar'];
const CONSENT = '— Tenho 18 anos ou mais. Li o aviso de privacidade (versão 2026-10) e autorizo guardar estes dados no banco de talentos por até 12 meses para contato sobre oportunidades. Posso pedir a exclusão quando quiser.';
/* The filled example of copy-vagas.md §5, byte for byte. */
export const EXPECTED = [
  'Olá, Smile! Quero entrar no banco de talentos.',
  'Nome: Rafa',
  'Área: Edição de vídeo',
  'Experiência: já toco projetos sozinho(a)',
  'Portfólio: https://vimeo.com/exemplo',
  'Para ver primeiro: O corte vertical da série de cerâmica. Fiz edição e legenda.',
  'Disponibilidade: por projeto (freela) · início: em até 30 dias',
  CONSENT,
  '(enviado pela página /vagas)'
].join('\n');
const SUBJECT = 'Banco de talentos · Edição de vídeo · Rafa';
export const WHATSAPP = `https://wa.me/5511985568208?text=${encodeURIComponent(EXPECTED)}`;
export const MAILTO = `mailto:smillepls@gmail.com?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(EXPECTED.replace(/\n/g, '\r\n'))}`;

const summaryLinks = page => page.evaluate(() => {
  const summary = document.getElementById('vg-erros');
  if (summary.hidden) return null;
  return {focused: document.activeElement === summary, title: summary.querySelector('h3')?.textContent,
    links: [...summary.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent])};
});
const errorOf = (page, id) => page.evaluate(id => {
  const el = document.getElementById(`${id}-erro`);
  return el && !el.hidden && el.getClientRects().length ? el.textContent.replace(/^!/, '').trim() : '';
}, id);
const activeLegend = page => page.evaluate(() => {
  const el = document.activeElement;
  // The no-JS caption inside the legend is hidden with JS, so the name is the question.
  return el?.tagName === 'LEGEND' && el.querySelector('[data-step-caption]').hidden ? el.querySelector('.vg-step-question').textContent.trim() : null;
});

/* Records every WAAPI call (target, duration, easing) so a timing can be read
 * even after a short animation has already finished on a slow machine. */
async function recordAnimations(page) {
  await page.evaluate(() => {
    if (window.__qaAnimate) return;
    window.__qaAnimate = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      window.__qaAnimate.push({target: this, duration: typeof options === 'number' ? options : options?.duration, easing: options?.easing});
      return original.call(this, keyframes, options);
    };
  });
}
const takeAnimations = (page, selector) => page.evaluate(selector => {
  const found = window.__qaAnimate.filter(entry => entry.target.matches(selector)).map(({duration, easing}) => ({duration, easing}));
  window.__qaAnimate.length = 0;
  return found;
}, selector);
const clearAnimations = page => page.evaluate(() => { window.__qaAnimate.length = 0; });

async function waitStep(page, n) {
  await page.waitForFunction(n => document.getElementById('vg-form').dataset.currentStep === String(n) && !document.querySelector('.vg-step.is-leaving'), n);
}
async function submit(page) { await page.locator('[data-step-next]').click(); }

async function areaChecks(t) {
  const {page, check, width} = t;
  const list = page.locator('[data-areas]');
  check('Eleven areas in the vagas.md order, none says "vaga" or "contratando", no internship card', await page.evaluate(expected => {
    const names = [...document.querySelectorAll('[data-area] .vg-area-name')].map(el => el.textContent.trim());
    const text = document.querySelector('[data-areas]').textContent;
    return JSON.stringify(names) === JSON.stringify(expected) && !/\bvagas?\b|contratando/i.test(text) && !/estágio/i.test(text);
  }, AREAS));
  check('Every area front carries the "Banco de talentos" seal and its back the three topics', await page.evaluate(() =>
    [...document.querySelectorAll('[data-area]')].every(card => card.querySelector('.vg-area-tag')?.textContent === 'Banco de talentos' &&
      JSON.stringify([...card.querySelectorAll('dt')].map(dt => dt.textContent)) === JSON.stringify(['O que faz aqui', 'O que eu peço no portfólio', 'Formato']) &&
      card.querySelectorAll('dd')[2].textContent === 'Combinado por projeto.')));
  const named = [];
  for (const area of AREAS) named.push(await page.getByRole('heading', {level: 3, name: area, exact: true}).count() === 1 && await page.getByRole('button', {name: area, exact: true}).count() === 1);
  check('Each area heading and its button are named by the area alone (no repeated seal or "Ver detalhes")', named.every(Boolean), named);
  const mode = await list.getAttribute('data-area-mode');
  check(`Area cards use ${width >= 720 ? 'the flip grid' : 'the disclosure list'} at ${width} px`, mode === (width >= 720 ? 'flip' : 'list'), mode);
  const first = page.locator('#area-edicao-video'), second = page.locator('#area-design-grafico');
  const toggle = first.locator('[data-area-toggle]'), toggle2 = second.locator('[data-area-toggle]');
  await toggle.scrollIntoViewIfNeeded();
  if (mode === 'list') {
    if (width === 390) {
      const height = await page.evaluate(() => document.getElementById('areas').getBoundingClientRect().height);
      check('At 390 px the closed areas section is shorter than 900 px', height < 900, height);
      check('List fronts are 64 px tall', await page.evaluate(() => [...document.querySelectorAll('.vg-area-toggle')].every(b => Math.round(b.getBoundingClientRect().height) === 64)));
    }
    check('Backs are collapsed with aria-expanded="false"', await page.evaluate(() => [...document.querySelectorAll('[data-area]')].every(card => card.querySelector('[data-area-back]').hidden && card.querySelector('[data-area-toggle]').getAttribute('aria-expanded') === 'false' && !card.querySelector('[data-area-toggle]').hasAttribute('aria-pressed'))));
    await toggle.focus();
    await clearAnimations(page);
    await page.keyboard.press('Enter');
    const fade = (await takeAnimations(page, '#area-edicao-video [data-area-back]'))[0]?.duration ?? null;
    check('Enter opens the area below its front (disclosure)', await toggle.getAttribute('aria-expanded') === 'true' && await first.locator('[data-area-back]').isVisible() &&
      await page.evaluate(() => { const card = document.getElementById('area-edicao-video'); return card.querySelector('[data-area-back]').getBoundingClientRect().top >= card.querySelector('.vg-area-front').getBoundingClientRect().bottom - 1; }));
    check('The open area says "Fechar" and keeps focus on its button', await first.locator('[data-area-label]').innerText() === 'Fechar' && await page.evaluate(() => document.activeElement === document.querySelector('#area-edicao-video [data-area-toggle]')));
    check('The back fades in over 150 ms', fade === 150, fade);
    await toggle2.focus();
    await page.keyboard.press('Space');
    check('Opening another area closes the first (one at a time)', await toggle2.getAttribute('aria-expanded') === 'true' && await toggle.getAttribute('aria-expanded') === 'false' && !(await first.locator('[data-area-back]').isVisible()));
    await page.keyboard.press('Enter');
    check('Enter closes it again', await toggle2.getAttribute('aria-expanded') === 'false' && !(await second.locator('[data-area-back]').isVisible()));
  } else {
    check('Cards sit in a 3-column grid (4 from 1200 px)', await page.evaluate(() => getComputedStyle(document.querySelector('[data-areas]')).gridTemplateColumns.split(' ').length === (innerWidth >= 1200 ? 4 : 3)));
    await settle(page).catch(() => {});
    await toggle.focus();
    await clearAnimations(page);
    await page.keyboard.press('Enter');
    const timing = (await takeAnimations(page, '#area-edicao-video .pg-flip-rotor'))[0]?.duration ?? null;
    check('Enter flips the card in 600 ms', timing === 600, timing);
    check('Flipped card toggles aria-expanded and aria-pressed, swaps inert/aria-hidden and focuses the back', await page.evaluate(() => {
      const card = document.getElementById('area-edicao-video'), button = card.querySelector('[data-area-toggle]');
      const front = card.querySelector('.pg-flip-front'), back = card.querySelector('[data-area-back]');
      return button.getAttribute('aria-expanded') === 'true' && button.getAttribute('aria-pressed') === 'true' && front.inert && !back.inert &&
        front.getAttribute('aria-hidden') === 'true' && back.getAttribute('aria-hidden') === 'false' && document.activeElement === card.querySelector('[data-area-focus]');
    }));
    await pause(650);
    const audit = await contrastAudit(page);
    check('Contrast holds on a flipped card (spot check)', audit.failures.length === 0, audit.failures);
    await toggle2.focus().catch(() => {});
    await page.evaluate(() => document.querySelector('#area-design-grafico [data-area-toggle]').click());
    await pause(50);
    check('Flipping another card turns the first back (one at a time)', await toggle.getAttribute('aria-expanded') === 'false' && await toggle2.getAttribute('aria-expanded') === 'true');
    await pause(650);
    await clearAnimations(page);
    await page.keyboard.press('Escape');
    const close = (await takeAnimations(page, '#area-design-grafico .pg-flip-rotor'))[0]?.duration ?? null;
    check('Escape turns the card back in 350 ms and returns focus to its button', close === 350 && await toggle2.getAttribute('aria-expanded') === 'false' &&
      await page.evaluate(() => document.activeElement === document.querySelector('#area-design-grafico [data-area-toggle]')), close);
    await pause(400);
    await first.locator('[data-area-toggle]').click();
    await pause(650);
    await first.locator('[data-area-close]').click();
    check('"Fechar" on the back turns the card to its front', await toggle.getAttribute('aria-expanded') === 'false' && await page.evaluate(() => document.activeElement === document.querySelector('#area-edicao-video [data-area-toggle]')));
    await pause(400);
  }
}

async function formChecks(t) {
  const {page, check, width, events} = t;
  const form = page.locator('#vg-form'), panel = page.locator('[data-handoff-panel]');
  const counter = page.locator('[data-step-counter]');
  const before = page.url();
  const documents = [];
  page.on('request', request => { if (request.resourceType() === 'document' && request.frame() === page.mainFrame()) documents.push(request.url()); });
  await form.scrollIntoViewIfNeeded();

  check('JS enables "Continuar", shows the plain-text counter and retires the no-JS note', await page.locator('[data-step-next]').isEnabled() &&
    await counter.textContent() === 'Etapa 1 de 5' && await counter.getAttribute('aria-live') === 'polite' && !(await page.locator('[data-nojs-fallback]').isVisible()));
  check('One question per step: only step 1 is shown and "Voltar" is hidden', await page.evaluate(() => [...document.querySelectorAll('[data-step]')].map(s => s.hidden).join() === 'false,true,true,true,true') && !(await page.locator('[data-step-back]').isVisible()));
  check('Legends are the exact questions', await page.evaluate(expected => JSON.stringify([...document.querySelectorAll('[data-step] > legend .vg-step-question')].map(el => el.textContent)) === JSON.stringify(expected), LEGENDS));
  check('No progress bar', await page.locator('#vg-form progress, #vg-form [role=progressbar]').count() === 0);
  check('Before valid answers there is no WhatsApp or e-mail link', await panel.locator('a[href^="https://wa.me"], a[href^="mailto:"]').count() === 0 && await panel.locator('a[data-handoff][href]').count() === 0);

  // Step 1 · empty submit, "Outra" and its limits.
  await submit(page);
  let summary = await summaryLinks(page);
  check('Empty step 1 focuses the error summary with the pt-BR message', summary?.focused && summary.title === 'Falta pouco. Confira:' && JSON.stringify(summary.links) === JSON.stringify([['#vg-area', 'Escolha uma área para continuar.']]), summary);
  check('The group error sits under the question and is linked by aria-describedby', await errorOf(page, 'vg-area') === 'Escolha uma área para continuar.' &&
    await page.evaluate(() => { const g = document.getElementById('vg-area'); return g.dataset.invalid === 'true' && g.getAttribute('aria-describedby').includes('vg-area-erro'); }));
  check('Submitting never navigates', page.url() === before && documents.length === 0, documents);
  await page.locator('#vg-erros a').click();
  check('The summary link focuses the first option', await page.evaluate(() => document.activeElement?.name === 'area'));
  check('"Qual área?" stays hidden until "Outra" is chosen', !(await page.locator('#vg-area-outra').isVisible()));
  await page.locator('input[name=area][value="Outra"]').check();
  check('"Outra" reveals "Qual área?" and clears the group error', await page.locator('#vg-area-outra').isVisible() && await errorOf(page, 'vg-area') === '');
  await submit(page);
  summary = await summaryLinks(page);
  check('"Outra" without text: "Escreva a área em poucas palavras." with aria-invalid', JSON.stringify(summary?.links) === JSON.stringify([['#vg-area-outra', 'Escreva a área em poucas palavras.']]) &&
    await page.locator('#vg-area-outra').getAttribute('aria-invalid') === 'true', summary);
  await page.locator('#vg-area-outra').fill('x'.repeat(41));
  check('No error appears while typing', await errorOf(page, 'vg-area-outra') === 'Escreva a área em poucas palavras.');
  await page.locator('#vg-area-outra').blur();
  check('Blur shows "Use até 40 caracteres."', await errorOf(page, 'vg-area-outra') === 'Use até 40 caracteres.');
  await page.locator('#vg-area-outra').fill('Ilustração');
  check('Fixing the answer clears the error while typing', await errorOf(page, 'vg-area-outra') === '' && await page.locator('#vg-area-outra').getAttribute('aria-invalid') === null);

  // Keyboard: pick "Edição de vídeo" and continue with Tab + Enter.
  await page.locator('input[name=area][value="Edição de vídeo"]').focus();
  await page.keyboard.press('Space');
  if (width === 390) {
    // Windows high contrast: the chosen card keeps a visible dot and a system-colour outline.
    await page.emulateMedia({forcedColors: 'active'});
    await pause(300);
    const forced = await page.evaluate(() => {
      const option = document.querySelector('input[name=area]:checked').closest('.vg-option'), other = document.querySelector('input[name=area]:not(:checked)').closest('.vg-option');
      const dot = getComputedStyle(option.querySelector('.vg-option-mark'), '::after'), s = getComputedStyle(option), o = getComputedStyle(other);
      return {dot: dot.backgroundColor, scale: dot.transform, outline: s.outlineStyle, outlineColor: s.outlineColor, otherOutline: o.outlineStyle, canvas: getComputedStyle(document.body).backgroundColor};
    });
    check('Forced colors: the chosen radio card keeps its dot and an outline', forced.dot !== 'rgba(0, 0, 0, 0)' && forced.dot !== forced.canvas && /^matrix\(1, 0, 0, 1,/.test(forced.scale) &&
      forced.outline === 'solid' && forced.outlineColor !== forced.canvas && forced.otherOutline === 'none', forced);
    await page.emulateMedia({forcedColors: 'none'});
  }
  check('Choosing another area hides and disables "Qual área?"', await page.evaluate(() => document.querySelector('input[name=area]:checked')?.value === 'Edição de vídeo' && document.getElementById('vg-area-outra').disabled) && !(await page.locator('#vg-area-outra').isVisible()));
  await page.keyboard.press('Tab');
  check('Tab goes from the options to "Continuar"', await page.evaluate(() => document.activeElement?.matches('[data-step-next]')));
  await clearAnimations(page);
  await page.keyboard.press('Enter');
  const slide = await takeAnimations(page, '.vg-step, .vg-steps');
  check('Step change slides the steps and eases the height for 500 ms with cubic-bezier(.25,.1,.25,1)', slide.length === 3 && slide.every(({duration, easing}) => duration === 500 && easing === 'cubic-bezier(.25,.1,.25,1)'), slide);
  await waitStep(page, 2);
  check('"Continuar" moves focus to the legend of step 2 and announces "Etapa 2 de 5"', await activeLegend(page) === LEGENDS[1] && await counter.textContent() === 'Etapa 2 de 5');
  check('Step 1 is hidden and "Voltar" appears', await page.locator('#vg-area').isHidden() && await page.locator('[data-step-back]').isVisible());

  // Step 2.
  await submit(page);
  summary = await summaryLinks(page);
  check('Empty step 2: "Escolha a opção que mais combina com você."', JSON.stringify(summary?.links) === JSON.stringify([['#vg-nivel', 'Escolha a opção que mais combina com você.']]), summary);
  await page.locator('[data-step-back]').click();
  await waitStep(page, 1);
  check('"Voltar" returns to step 1 with the answer kept and the summary cleared', await activeLegend(page) === LEGENDS[0] &&
    await page.evaluate(() => document.querySelector('input[name=area]:checked')?.value === 'Edição de vídeo' && document.getElementById('vg-erros').hidden));
  await submit(page);
  await waitStep(page, 2);
  await page.keyboard.press('Tab');
  check('Tab from the legend enters the radio group', await page.evaluate(() => document.activeElement?.name === 'nivel'));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  check('Arrow keys choose "Já toco projetos sozinho(a)"', await page.evaluate(() => document.querySelector('input[name=nivel]:checked')?.value === 'Já toco projetos sozinho(a)'));
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  check('Tab reaches "Voltar" then "Continuar"', await page.evaluate(() => document.activeElement?.matches('[data-step-next]')));
  await page.keyboard.press('Enter');
  await waitStep(page, 3);
  check('Step 3 legend takes focus', await activeLegend(page) === LEGENDS[2] && await counter.textContent() === 'Etapa 3 de 5');

  // Step 3 · links.
  check('The link hint follows the area (video)', await page.locator('#vg-link1-dica').innerText() === 'YouTube não listado, Vimeo ou Drive com acesso liberado.');
  await submit(page);
  summary = await summaryLinks(page);
  check('Empty link: "Cole o link do seu portfólio." with aria-invalid and aria-describedby', JSON.stringify(summary?.links) === JSON.stringify([['#vg-link1', 'Cole o link do seu portfólio.']]) &&
    await page.evaluate(() => { const i = document.getElementById('vg-link1'); return i.getAttribute('aria-invalid') === 'true' && i.getAttribute('aria-describedby').split(' ').includes('vg-link1-erro') && i.getAttribute('aria-describedby').includes('vg-link1-dica'); }), summary);
  const link1 = page.locator('#vg-link1'), link2 = page.locator('#vg-link2'), highlight = page.locator('#vg-destaque');
  await link1.fill('ftp://exemplo.com/portfolio');
  await link1.blur();
  check('Other scheme: "Use um link que comece com https:// ou http://."', await errorOf(page, 'vg-link1') === 'Use um link que comece com https:// ou http://.');
  await link1.fill('meu portfolio');
  await link1.blur();
  check('Broken link: "Esse link não abre. Ele começa com https://?"', await errorOf(page, 'vg-link1') === 'Esse link não abre. Ele começa com https://?');
  await link1.fill('vimeo.com/exemplo');
  check('A valid link clears the error while typing', await errorOf(page, 'vg-link1') === '');
  await link2.fill('https://vimeo.com/exemplo/');
  await link2.blur();
  check('Same second link: "Esse link é igual ao primeiro."', await errorOf(page, 'vg-link2') === 'Esse link é igual ao primeiro.');
  await link2.fill('');
  await link2.blur();
  check('The second link is optional', await errorOf(page, 'vg-link2') === '');
  // maxlength stops typing at 280; a script-set value proves the guard and its message.
  await highlight.focus();
  await highlight.evaluate(el => { el.value = 'x'.repeat(300); el.dispatchEvent(new Event('input', {bubbles: true})); });
  await highlight.blur();
  check('Over 280 characters: "Use até 280 caracteres. Agora são 300."', await errorOf(page, 'vg-destaque') === 'Use até 280 caracteres. Agora são 300.');
  check('The textarea keeps maxlength="280"', await highlight.getAttribute('maxlength') === '280');
  await highlight.fill('O corte vertical da série de cerâmica. Fiz edição e legenda.');
  check('The counter shows {n}/280', await page.locator('[data-highlight-count]').innerText() === '60/280');
  await submit(page);
  await waitStep(page, 4);
  check('Step 4 legend takes focus', await activeLegend(page) === LEGENDS[3]);

  // Step 4.
  await submit(page);
  summary = await summaryLinks(page);
  check('Empty step 4 lists format, start and name in order', JSON.stringify(summary?.links) === JSON.stringify([
    ['#vg-formato', 'Escolha como você pode trabalhar.'], ['#vg-inicio', 'Escolha quando você poderia começar.'], ['#vg-nome', 'Diga como quer ser chamado(a).']]), summary);
  await page.locator('#vg-nome').fill('x'.repeat(61));
  await page.locator('#vg-nome').blur();
  check('Long name: "Use até 60 caracteres."', await errorOf(page, 'vg-nome') === 'Use até 60 caracteres.');
  await page.locator('input[name=formato][value="Por projeto (freela)"]').check();
  await page.locator('input[name=inicio][value="Em até 30 dias"]').check();
  await page.locator('#vg-nome').fill('Rafa');
  check('Fixed answers clear the step 4 errors', await page.evaluate(() => !document.querySelector('#vg-disponibilidade [aria-invalid="true"], #vg-disponibilidade [data-invalid="true"]')));
  await page.locator('#vg-nome').press('Enter');
  await waitStep(page, 5);
  check('Enter in the name field continues to step 5 (implicit submit, no navigation)', await activeLegend(page) === LEGENDS[4] && await counter.textContent() === 'Etapa 5 de 5' && page.url() === before && documents.length === 0, documents);
  await settle(page).catch(() => {});

  // Step 5 · review, the two boxes and the links.
  check('Step 5 shows the exact message', await panel.locator('[data-handoff-message]').innerText() === EXPECTED, await panel.locator('[data-handoff-message]').innerText());
  check(`The preview is ${width >= 960 ? 'a neutral bubble in the phone frame' : 'full width, without a phone frame'}`, await page.evaluate(wide => {
    const slot = document.querySelector('[data-preview-slot]'), phone = slot.querySelector('.pg-phone');
    if (wide) return slot.dataset.frame === 'phone' && Boolean(phone?.querySelector('[data-handoff-message]')) && !/iphone|whatsapp/i.test(phone.getAttribute('aria-label'));
    return slot.dataset.frame === 'none' && !phone && slot.getBoundingClientRect().width >= slot.parentElement.getBoundingClientRect().width - 1;
  }, width >= 960));
  check('"Continuar" is gone on the last step; both boxes start unchecked', !(await page.locator('[data-step-next]').isVisible()) && !(await page.locator('#vg-maior').isChecked()) && !(await page.locator('#vg-consentimento').isChecked()));
  check('Without both boxes the links do not exist and the placeholder explains why', await panel.locator('a[data-handoff][href]').count() === 0 && !(await page.locator('[data-handoff-actions]').isVisible()) &&
    await page.locator('[data-handoff-locked]').innerText() === 'Marque as duas caixas para ver os botões de envio.');
  check('While locked, both boxes are described by the lock note, inside a polite live region', await page.evaluate(() =>
    ['vg-maior', 'vg-consentimento'].every(id => document.getElementById(id).getAttribute('aria-describedby')?.split(' ').includes('vg-trava')) &&
    document.querySelector('[data-handoff-gate]').getAttribute('aria-live') === 'polite' && document.querySelector('[data-handoff-gate]').contains(document.querySelector('[data-handoff-actions]'))));
  await page.locator('#vg-consentimento').check();
  check('Consent alone keeps the links away and shows the guardian path (18+ error with its help)', await panel.locator('a[data-handoff][href]').count() === 0 &&
    await errorOf(page, 'vg-maior') === 'Confirme que você tem 18 anos ou mais.' && await page.locator('#vg-maior-ajuda-erro').innerText() === 'Por enquanto, o banco é só para maiores de 18 anos.' &&
    await page.locator('#vg-maior').getAttribute('aria-invalid') === 'true' && await errorOf(page, 'vg-consentimento') === '');
  await page.locator('#vg-maior').focus();
  await page.keyboard.press('Space');
  check('Ticking 18+ clears its error and the lock description', await errorOf(page, 'vg-maior') === '' && await page.locator('#vg-maior').getAttribute('aria-invalid') === null &&
    await page.evaluate(() => ['vg-maior', 'vg-consentimento'].every(id => !(document.getElementById(id).getAttribute('aria-describedby') || '').split(' ').includes('vg-trava'))));
  check('Both boxes reveal "Abrir no WhatsApp", "Abrir no e-mail" and "Copiar mensagem"', await page.locator('[data-handoff-actions]').isVisible() && !(await page.locator('[data-handoff-locked]').isVisible()) &&
    await page.evaluate(() => [...document.querySelectorAll('[data-handoff-actions] .pg-btn')].map(el => el.textContent.trim()).join('|') === 'Abrir no WhatsApp ↗ (abre em nova aba)|Abrir no e-mail ↗|Copiar mensagem'));
  check('WhatsApp href equals wa.me + encodeURIComponent(message)', await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href') === WHATSAPP);
  check('E-mail href has the subject and %0D%0A line breaks', await panel.locator('a[data-handoff="email"]').getAttribute('href') === MAILTO);
  check('Nothing was requested from WhatsApp, no tab opened, no navigation', events.handoff.length === 0 && events.popups.length === 0 && page.url() === before && documents.length === 0);
  // The check is a 120/240 ms transition; software rendering can be slow, so wait for its end state.
  await page.waitForFunction(() => { const s = getComputedStyle(document.querySelector('#vg-consentimento + .pg-check-box svg')); return s.opacity === '1' && parseFloat(s.strokeDashoffset) === 0; }, null, {timeout: 4000}).catch(() => {});
  const drawn = await page.evaluate(() => { const svg = document.querySelector('#vg-consentimento + .pg-check-box svg'), s = getComputedStyle(svg); return {opacity: s.opacity, dash: s.strokeDashoffset, checked: document.getElementById('vg-consentimento').checked}; });
  check('The consent check is drawn (K19)', drawn.checked && Number(drawn.opacity) === 1 && parseFloat(drawn.dash) === 0, drawn);
  if (width === 390) {
    await page.emulateMedia({forcedColors: 'active'});
    await pause(100);
    const tick = await page.evaluate(() => {
      const svg = document.querySelector('#vg-consentimento + .pg-check-box svg'), section = svg.closest('section');
      const box = getComputedStyle(document.querySelector('#vg-consentimento + .pg-check-box'), '::before');
      return {stroke: getComputedStyle(svg).stroke, text: getComputedStyle(section).color, boxBorder: box.borderTopColor, canvas: getComputedStyle(section).backgroundColor};
    });
    check('Forced colors: the tick uses the text colour and the ticked box a system border', tick.stroke === tick.text && tick.stroke !== tick.canvas && tick.boxBorder !== tick.canvas, tick);
    await page.emulateMedia({forcedColors: 'none'});
  }

  await page.locator('#vg-maior').uncheck();
  check('Unchecking 18+ removes the links at once and shows the error with its help', await panel.locator('a[data-handoff][href]').count() === 0 && !(await page.locator('[data-handoff-actions]').isVisible()) &&
    await errorOf(page, 'vg-maior') === 'Confirme que você tem 18 anos ou mais.' && await page.locator('#vg-maior-ajuda-erro').innerText() === 'Por enquanto, o banco é só para maiores de 18 anos.' &&
    await page.locator('#vg-maior').getAttribute('aria-invalid') === 'true');
  await page.locator('#vg-maior').check();
  await page.locator('#vg-consentimento').uncheck();
  check('Unchecking the consent removes the links and explains why', await panel.locator('a[data-handoff][href]').count() === 0 &&
    await errorOf(page, 'vg-consentimento') === 'Para entrar no banco, marque a autorização. Sem ela, eu não posso guardar seus dados.');
  const audit = await contrastAudit(page);
  check('Contrast holds on step 5 with errors visible (spot check)', audit.failures.length === 0 && audit.checked > 10, audit.failures);
  await page.locator('#vg-consentimento').check();
  check('Rechecking brings the links back with the consent line in the message', await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href') === WHATSAPP && (await panel.locator('[data-handoff-message]').innerText()).includes(CONSENT));

  // Editing an earlier answer updates the message and both links.
  await page.locator('[data-step-back]').click();
  await waitStep(page, 4);
  await page.locator('#vg-nome').fill('Rafa Lima');
  await submit(page);
  await waitStep(page, 5);
  const edited = EXPECTED.replace('Nome: Rafa', 'Nome: Rafa Lima');
  check('A changed answer updates the message and both links', await panel.locator('[data-handoff-message]').innerText() === edited &&
    await panel.locator('a[data-handoff="whatsapp"]').getAttribute('href') === `https://wa.me/5511985568208?text=${encodeURIComponent(edited)}` &&
    (await panel.locator('a[data-handoff="email"]').getAttribute('href')).startsWith(`mailto:smillepls@gmail.com?subject=${encodeURIComponent('Banco de talentos · Edição de vídeo · Rafa Lima')}&body=`));
  await page.locator('[data-step-back]').click();
  await waitStep(page, 4);
  await page.locator('#vg-nome').fill('Rafa');
  await submit(page);
  await waitStep(page, 5);
  await settle(page).catch(() => {});

  // Copy, then the visitor's own tap on WhatsApp.
  await page.evaluate(() => { navigator.clipboard.writeText = text => { window.__qaCopied = text; return Promise.resolve(); }; });
  await panel.locator('[data-handoff="copy"]').click();
  await page.waitForFunction(() => window.__qaCopied !== undefined);
  check('"Copiar mensagem" copies the same text', await page.evaluate(() => window.__qaCopied) === EXPECTED && await panel.locator('[data-handoff-status]').innerText() === 'Mensagem copiada. Cole no WhatsApp ou no e-mail.');
  const popup = page.context().waitForEvent('page');
  await panel.locator('a[data-handoff="whatsapp"]').click();
  const opened = await popup;
  await opened.waitForLoadState('domcontentloaded').catch(() => {});
  await pause(200);
  check('wa.me is requested only after the tap, with the exact text (intercepted)', events.handoff.length >= 1 && events.handoff[0] === WHATSAPP, events.handoff);
  await opened.close();
  events.popups.length = 0; events.handoff.length = 0;
  check('WhatsApp status line is shown', await panel.locator('[data-handoff-status]').innerText() === 'Abrindo o WhatsApp. Confira a mensagem e toque em enviar lá.');
  check('The page itself never navigated or posted', page.url() === before && documents.length === 0 && events.nonGet.length === 0, documents);
  const interactions = await page.evaluate(() => window.__qa.interactions);
  check('Interaction events carry no answers or contact data', interactions.some(item => item.event === 'pages_handoff_click') && interactions.some(item => item.event === 'pages_step_changed') &&
    !JSON.stringify(interactions).match(/Rafa|vimeo|cerâmica|5511985568208|smillepls/));
  check('No answer reached storage or the URL', await page.evaluate(() => { try { return sessionStorage.length === 0 && localStorage.length === 0 && !/Rafa|vimeo/.test(location.href); } catch { return true; } }));
  await page.screenshot({path: `${t.output}/${t.slug}-etapa5-${width}.png`, animations: 'disabled'}).catch(() => {});
}

export async function checks(t) {
  const {page, check, width, height} = t;
  await recordAnimations(page);
  check('Title is "Banco de talentos · Smile N"', await page.title() === 'Banco de talentos · Smile N');
  check('Canonical points to /vagas', await page.locator('link[rel=canonical]').getAttribute('href') === `${ORIGIN}/vagas`);
  check('Single h1 "Banco de talentos"', await page.evaluate(() => document.querySelectorAll('h1').length === 1 && document.querySelector('h1').textContent.trim() === 'Banco de talentos'));
  check('No job-posting markup', await page.evaluate(() => !document.querySelector('script[type="application/ld+json"],[itemtype*="JobPosting"]') && !document.documentElement.outerHTML.includes('JobPosting')));
  check('Both status seals are visible in the first screen', await page.evaluate(() => {
    const seals = [...document.querySelectorAll('.vg-seals .pg-seal')];
    const header = document.querySelector('.site-header').getBoundingClientRect().bottom;
    return seals.length === 2 && seals[0].textContent === 'Vagas abertas: nenhuma no momento' && seals[1].textContent === 'Banco de talentos: aberto' &&
      seals.every(el => { const r = el.getBoundingClientRect(); return r.top >= header && r.bottom <= innerHeight; });
  }), {width, height});
  check('No track switch on /vagas; CTAs point to #entrar and #como-funciona', await page.locator('.pg-track').count() === 0 && await page.evaluate(() =>
    document.querySelector('.vg-hero-actions .pg-btn--primary').getAttribute('href') === '#entrar' && document.querySelector('.vg-hero-actions .pg-btn--link').getAttribute('href') === '#como-funciona' &&
    document.querySelector('[data-header-cta]').textContent.trim() === 'Entrar no banco ↓' && document.querySelector('[data-header-cta]').getAttribute('href') === '#entrar' &&
    Boolean(document.getElementById('entrar')) && Boolean(document.getElementById('como-funciona'))));
  check('Footer marks "Banco de talentos" as the current page', await page.locator('.site-footer a[href="/vagas"]').getAttribute('aria-current') === 'page');
  check('FAQ has the seven published questions; "teste pago" and "remoto" stay out', await page.evaluate(() => {
    const questions = [...document.querySelectorAll('#perguntas summary')].map(el => el.textContent.replace('+', '').trim());
    return questions.length === 7 && questions[0] === 'Tem vaga aberta?' && !questions.some(q => /teste|remoto/i.test(q));
  }));
  check('The form asks nothing it must not (no file, e-mail, phone, date or select)', await page.evaluate(() =>
    !document.querySelector('#vg-form input[type=file], #vg-form input[type=email], #vg-form input[type=tel], #vg-form input[type=date], #vg-form select') &&
    JSON.stringify([...new Set([...document.querySelectorAll('#vg-form [name]')].map(el => el.name))]) === JSON.stringify(['area', 'areaOutra', 'nivel', 'link1', 'link2', 'destaque', 'formato', 'inicio', 'nome', 'maior', 'consentimento'])));
  await areaChecks(t);
  await formChecks(t);
}

async function motionlessChecks(t, label) {
  const {page, check} = t;
  check(`Areas fall back to the disclosure list (${label})`, await page.locator('[data-areas]').getAttribute('data-area-mode') === 'list');
  const toggle = page.locator('#area-edicao-video [data-area-toggle]');
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  await pause(50);
  check(`An area opens below its front at once, no running animation (${label})`, (await runningAnimations(page)) === 0 && await page.locator('#area-edicao-video [data-area-back]').isVisible() &&
    await page.evaluate(() => getComputedStyle(document.querySelector('#area-edicao-video .pg-flip-rotor')).transform === 'none'));
  await toggle.click();
  await page.locator('#vg-form').scrollIntoViewIfNeeded();
  await page.locator('input[name=area][value="Comercial"]').check();
  await page.locator('[data-step-next]').click();
  await pause(50);
  check(`A step changes at once with no running animation (${label})`, (await runningAnimations(page)) === 0 && await page.locator('#vg-nivel').isVisible() && await page.locator('#vg-area').isHidden() &&
    await page.locator('[data-step-counter]').textContent() === 'Etapa 2 de 5' && await activeLegend(page) === LEGENDS[1],
    await page.evaluate(() => ({running: document.getAnimations().filter(a => a.playState === 'running').map(a => String(a.effect?.target?.className || a.animationName || '')), active: document.activeElement?.outerHTML.slice(0, 80), counter: document.querySelector('[data-step-counter]').textContent})));
  for (const [name, value] of [['nivel', 'Estudante']]) await page.locator(`input[name=${name}][value="${value}"]`).check();
  await page.locator('[data-step-next]').click();
  await page.locator('#vg-link1').fill('https://exemplo.com.br/portfolio');
  await page.locator('[data-step-next]').click();
  await page.locator('input[name=formato][value="Meio período"]').check();
  await page.locator('input[name=inicio][value="Agora"]').check();
  await page.locator('#vg-nome').fill('Ana');
  await page.locator('[data-step-next]').click();
  await pause(50);
  await page.locator('#vg-maior').focus();
  await page.keyboard.press('Space');
  check(`Ticking 18+ alone shows no premature error (${label})`, await errorOf(page, 'vg-consentimento') === '' && await errorOf(page, 'vg-maior') === '');
  await page.locator('#vg-consentimento').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  check(`Leaving the two boxes with the authorization unticked explains it inline (${label})`,
    await errorOf(page, 'vg-consentimento') === 'Para entrar no banco, marque a autorização. Sem ela, eu não posso guardar seus dados.' && await errorOf(page, 'vg-maior') === '' &&
    !(await page.locator('[data-handoff-actions]').isVisible()));
  await page.locator('#vg-consentimento').check();
  await pause(50);
  check(`Step 5, the preview and the check appear without movement (${label})`, (await runningAnimations(page)) === 0 && await page.locator('[data-handoff-actions]').isVisible() &&
    (await page.locator('[data-handoff-message]').innerText()).startsWith('Olá, Smile! Quero entrar no banco de talentos.\nNome: Ana\nÁrea: Comercial\nExperiência: estudante\nPortfólio: https://exemplo.com.br/portfolio\nDisponibilidade: meio período · início: agora\n'));
}

export async function reduced(t) { await motionlessChecks(t, 'reduced motion'); }
export async function paused(t) {
  await t.page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await motionlessChecks(t, 'paused');
}

export async function noJs(t) {
  const {page, check} = t;
  check('Without JS the five steps read as a plain list of questions', await page.evaluate(() => {
    const steps = [...document.querySelectorAll('[data-step]')];
    return steps.length === 5 && steps.every(step => step.getClientRects().length > 0 && !step.hidden) &&
      [...document.querySelectorAll('[data-step-caption]')].map(el => el.textContent).join('|') === 'Etapa 1 de 5|Etapa 2 de 5|Etapa 3 de 5|Etapa 4 de 5|Etapa 5 de 5';
  }));
  check('"Continuar" stays disabled and nothing can be sent', await page.locator('[data-step-next]').isDisabled() && await page.locator('a[href^="https://wa.me"][data-handoff]').count() === 0 && !(await page.locator('[data-handoff-actions]').isVisible()));
  const mail = await page.locator('[data-nojs-fallback] a').getAttribute('href');
  check('The no-JS mailto carries the template with %0D%0A', await page.locator('[data-nojs-fallback]').isVisible() && mail.startsWith('mailto:smillepls@gmail.com?subject=Banco%20de%20talentos&body=') &&
    decodeURIComponent(mail.split('&body=')[1]) === ['Olá, Smile! Quero entrar no banco de talentos.', 'Nome:', 'Área:', 'Experiência:', 'Portfólio:', 'Disponibilidade:', CONSENT].join('\r\n'), mail);
  check('Every area shows its details without JS', await page.evaluate(() => [...document.querySelectorAll('[data-area-back]')].every(back => back.getClientRects().length > 0 && !back.hidden)));
  check('Status seals and the h1 are readable without JS', await page.locator('.vg-seals').isVisible() && await page.locator('h1').innerText() === 'Banco de talentos');
}
