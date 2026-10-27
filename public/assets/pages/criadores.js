/* /criadores · page entry (SPEC 3.A, 4.A). Loaded as the page's only module,
 * after the classic /assets/profile.js. Wires the shared components:
 * K1 shell, K5 media-kit card, K6 + K5 deck of deliverables, K7 phone preview,
 * K13/K14 demos, K9/K10 "Montar meu kit" with review and handoff.
 * Nothing is ever sent: the form validates and builds a message the visitor
 * reviews; real wa.me / mailto: links open their own app on their tap.
 * No fetch, no storage, no timers left running, no animation-frame loops. */
import {initShell, motion} from './shell.js';
import {mountFlip, mountFlipGroup} from './flip.js';
import {mountDeck} from './deck.js';
import {createValidator, mountBuilder} from './builder.js';
import {mailtoHref, mountReview, profileDestinations, refOrigin} from './handoff.js';
import {createPhone} from './devices.js';
import {DURATION, EASE} from './spring.js';
import {mountFormats} from './demos/formats.js';
import {mountHooks} from './demos/hooks.js';
import {
  KIT_ERRORS, NOJS_BODY, SUBJECT, composeKit, countLabel, guardianHelp, handleError,
  isValidHandle, normalizeHandle, previewHandle, summarize
} from './criadores-kit.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const PREVIEW_STATUS_DELAY = 600;

/* C1 · media-kit card: turns from the pointer's side, 600/350 ms, Escape closes. */
function mountHero() {
  return mountFlip($('.cr-kit-card'));
}

/* C3 · deck (400 ms ease, −24 px / scaleX .95 per level) of flip cards; one open at a time. */
function mountDeliverables() {
  const root = $('.cr-deck');
  if (!root) return null;
  const flips = mountFlipGroup(root);
  const deck = mountDeck(root, {onChange: () => flips.closeAll()});
  return {deck, flips};
}

/* C4 · live preview: updates on `input` only, escaped with textContent; nothing leaves the page. */
function mountPreview() {
  const section = $('#exemplo');
  const input = section && $('[data-preview-input]', section);
  const screen = section && $('[data-preview-screen]', section);
  const slot = section && $('[data-preview-device]', section);
  if (!input || !screen || !slot) return null;
  const status = $('[data-preview-status]', section);
  const buttons = $$('[data-preview-view]', section);
  const views = new Map($$('[data-view]', screen).map(view => [view.dataset.view, view]));
  const handles = $$('[data-preview-handle]', screen);
  const phone = createPhone({content: screen, tone: 'light', scheme: 'light'});
  screen.classList.add('is-in-device');
  slot.replaceChildren(phone.root);

  let current = null, timer = 0;
  function show(name, {animate = true} = {}) {
    const next = views.get(name);
    if (!next || name === current) return;
    views.forEach((view, key) => { view.hidden = key !== name; });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.previewView === name)));
    if (animate && current) motion.animate(next, [{opacity: 0, transform: 'scale(.97)'}, {opacity: 1, transform: 'none'}], {duration: DURATION.morph, easing: EASE.morph});
    current = name;
    section.dataset.previewView = name;
  }
  const render = () => {
    const handle = previewHandle(input.value);
    handles.forEach(el => { el.textContent = `@${handle}`; });
    return handle;
  };
  input.addEventListener('input', () => {
    const handle = render();
    // Quiet while typing; one announcement 600 ms after the last keystroke.
    clearTimeout(timer);
    if (status) status.textContent = '';
    timer = setTimeout(() => { if (status) status.textContent = `Prévia atualizada para @${handle}.`; }, PREVIEW_STATUS_DELAY);
  });
  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.previewView)));
  show('perfil', {animate: false});
  render();
  return {input, phone, show};
}

/* C8 · "Montar meu kit" (SPEC 4.A): chips, inline pt-BR errors, live summary,
 * review panel and handoff links that exist only while the answers are valid. */
function mountKitForm(preview) {
  const form = $('#cr-form'), panel = $('#cr-revisao');
  if (!form || !panel) return null;
  const builder = mountBuilder(form, {summary: $('#cr-resumo'), describe: summarize, countLabel});
  const email = profileDestinations().email;
  const validator = createValidator(form, [
    {id: 'cr-perfil', check: values => handleError(values.perfil)},
    {id: 'cr-plataforma', check: values => (values.plataforma ? '' : KIT_ERRORS.plataforma)},
    {id: 'cr-preciso', check: values => (values.preciso.length ? '' : KIT_ERRORS.preciso)},
    {id: 'cr-maior', check: values => (values.maior ? '' : {message: KIT_ERRORS.maior, help: email ? guardianHelp(email) : ''})}
  ], {summary: $('#cr-erros'), values: builder.values});
  const review = mountReview({
    form, panel, validator, page: 'criadores', motion,
    compose: () => composeKit(builder.values(), {origin: refOrigin()})
  });

  // "Usar @x": offered when the preview has a valid @, never copied by itself.
  const field = $('#cr-perfil', form), use = $('[data-use-handle]', form), useValue = $('[data-use-handle-value]', form);
  if (preview?.input && field && use && useValue) {
    const sync = () => {
      const raw = preview.input.value;
      const handle = normalizeHandle(raw);
      useValue.textContent = handle;
      use.hidden = !raw.trim() || !isValidHandle(raw) || normalizeHandle(field.value) === handle;
    };
    preview.input.addEventListener('input', sync);
    field.addEventListener('input', sync);
    use.addEventListener('click', () => {
      field.value = normalizeHandle(preview.input.value);
      field.focus({preventScroll: true});
      field.dispatchEvent(new Event('input', {bubbles: true}));
      validator.validateField('cr-perfil');
      sync();
    });
    sync();
  }
  return {builder, validator, review};
}

/* No-JS template links ("Escrever e-mail", "Prefere e-mail?") rebuilt from PORTFOLIO_PROFILE. */
function syncMailtoTemplates() {
  const href = mailtoHref({subject: SUBJECT, body: NOJS_BODY});
  if (href) $$('a[data-kit-mailto]').forEach(link => { link.href = href; });
}

function safely(name, mount) {
  try { return mount(); }
  catch (error) { console.error(`criadores: ${name} did not mount`, error); return null; }
}

let started = false;
export function initCriadores() {
  if (started) return;
  started = true;
  initShell();
  safely('hero', mountHero);
  safely('deck', mountDeliverables);
  const preview = safely('preview', mountPreview);
  safely('formats', () => mountFormats($('[data-formats]'), {motion}));
  safely('hooks', () => mountHooks($('[data-hooks]'), {motion}));
  safely('form', () => mountKitForm(preview));
  safely('mailto', syncMailtoTemplates);
  document.documentElement.dataset.criadoresReady = 'true';
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCriadores, {once: true});
else initCriadores();
