/* /vagas · page entry (SPEC 1.3, 3.C, 4.C, 5.3).
 * - V3 areas: the same DOM in two presentations. From 720 px, with motion
 *   allowed, the button turns the card (K5 flip, 600/350 ms, direction-aware);
 *   below 720 px, with reduced motion or the pause button, it is a disclosure
 *   list: the back appears under the front (150 ms opacity), one open at a time.
 * - V5 "Entrar no banco": K18 stepper over K9 validation, five steps, one question
 *   each. Step 5 shows the exact message; the WhatsApp/e-mail links (K10) exist only
 *   while both boxes (18+ and consent, K19) are checked. From 960 px the preview
 *   sits in the phone frame (K7) as a neutral bubble; below, it takes the full width.
 * Nothing is sent or stored by this page: the visitor taps a real link. */
import {motion} from './shell.js';
import {readValues, createValidator} from './builder.js';
import {buildHandoff, renderHandoff, bindHandoffPanel, recordInteraction} from './handoff.js';
import {mountStepper} from './stepper.js';
import {createPhone} from './devices.js';
import {DURATION, EASE, PRESETS, motionReduced, onMotionPreferenceChange, springEasing} from './spring.js';
import {entryEdge, rotationForEdge} from '../sections/motion.js';
import {
  OTHER_AREA, LIMITS, linkHint, composeVagas,
  checkArea, checkAreaOther, checkLevel, checkLink1, checkLink2, checkHighlight,
  checkFormat, checkStart, checkName, checkAdult, checkConsent
} from './vagas-message.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const PAGE = 'vagas';
const CLOSED = 'rotateX(0deg) rotateY(0deg)';
const LABELS = Object.freeze({open: 'Ver detalhes', close: 'Fechar'});

/* ---------- V3 · areas: flip (≥ 720 px) or disclosure list ---------- */
export function mountAreas(root = $('[data-areas]')) {
  if (!root) return null;
  const wide = matchMedia('(min-width: 720px)');
  let mode = null;
  const items = $$('[data-area]', root).map(card => ({
    card,
    toggle: $('[data-area-toggle]', card),
    front: $('.pg-flip-front', card),
    back: $('[data-area-back]', card),
    rotor: $('.pg-flip-rotor', card),
    label: $('[data-area-label]', card),
    close: $('[data-area-close]', card),
    heading: $('[data-area-focus]', card),
    open: false, edge: 'right', turn: null, fade: null
  })).filter(item => item.toggle && item.front && item.back && item.rotor);

  const rotated = item => { const r = rotationForEdge(item.edge); return `rotateX(${r.x}deg) rotateY(${r.y}deg)`; };
  const wanted = () => (wide.matches && !motionReduced() ? 'flip' : 'list');

  function apply(item) {
    const {card, toggle, front, back, label, open} = item;
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? LABELS.close : LABELS.open;
    card.dataset.face = open ? 'back' : 'front';
    if (mode === 'flip') {
      toggle.setAttribute('aria-pressed', String(open));
      back.hidden = false;
      front.inert = open; back.inert = !open;
      front.setAttribute('aria-hidden', String(open));
      back.setAttribute('aria-hidden', String(!open));
    } else {
      toggle.removeAttribute('aria-pressed');
      front.inert = false; back.inert = false;
      front.removeAttribute('aria-hidden'); back.removeAttribute('aria-hidden');
      back.hidden = !open;
    }
  }

  function setMode() {
    const next = wanted();
    if (next === mode) return;
    mode = next;
    root.dataset.areaMode = mode;
    for (const item of items) {
      item.turn?.cancel(); item.fade?.cancel();
      item.turn = item.fade = null;
      if (mode === 'flip') {
        item.card.dataset.flipReady = 'true';
        item.back.style.transform = item.open ? rotated(item) : '';
        item.rotor.style.transform = item.open ? rotated(item) : '';
      } else {
        delete item.card.dataset.flipReady;
        item.back.style.transform = '';
        item.rotor.style.transform = '';
      }
      apply(item);
    }
  }

  function setOpen(item, next, {focus = true} = {}) {
    if (item.open === next) return;
    if (next) items.forEach(other => { if (other !== item && other.open) setOpen(other, false, {focus: false}); });
    item.open = next;
    if (mode === 'flip') {
      const running = item.turn?.playState === 'running';
      const start = running ? getComputedStyle(item.rotor).transform : (next ? CLOSED : item.rotor.style.transform || rotated(item));
      item.turn?.cancel();
      if (next) item.back.style.transform = rotated(item);
      const target = next ? rotated(item) : CLOSED;
      item.rotor.style.transform = target;
      apply(item);
      const spec = next ? PRESETS.flipOpen : PRESETS.flipClose;
      item.turn = motion.animate(item.rotor, [{transform: start}, {transform: target}],
        {duration: next ? DURATION.flipOpen : DURATION.flipClose, easing: springEasing(spec, EASE.flip)});
      if (focus) (next ? item.heading || item.close : item.toggle)?.focus({preventScroll: true});
    } else {
      apply(item);
      item.fade?.cancel();
      // SPEC V3: the back appears under the front with a 150 ms fade (instant when reduced).
      item.fade = next ? motion.animate(item.back, [{opacity: 0}, {opacity: 1}], {duration: 150, easing: 'ease'}) : null;
    }
    recordInteraction(next ? 'area_opened' : 'area_closed', {page: PAGE, mode});
  }

  for (const item of items) {
    item.toggle.disabled = false;
    item.toggle.addEventListener('click', () => setOpen(item, !item.open));
    item.close?.addEventListener('click', () => setOpen(item, false));
    $('.pg-flip-stage', item.card)?.addEventListener('pointerenter', event => {
      if (item.open || event.pointerType !== 'mouse') return;
      const rect = event.currentTarget.getBoundingClientRect();
      item.edge = entryEdge(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
    });
    item.card.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !item.open || mode !== 'flip') return;
      event.preventDefault(); event.stopPropagation();
      setOpen(item, false);
    });
  }
  wide.addEventListener('change', setMode);
  onMotionPreferenceChange(setMode);
  setMode();
  root.dataset.areasReady = 'true';
  return {items, mode: () => mode, open: (i, options) => setOpen(items[i], true, options), close: (i, options) => setOpen(items[i], false, options)};
}

/* ---------- V5 · step 5 preview: phone frame from 960 px, full width below ---------- */
function mountPreview(slot, bubble) {
  if (!slot || !bubble) return {refresh() {}, frame: () => 'none'};
  const wide = matchMedia('(min-width: 960px)');
  let phone = null, scroller = null;
  const fitScroll = () => {
    // A long message scrolls inside the screen; only then is the area focusable.
    if (!scroller) return;
    const scrolls = scroller.scrollHeight > scroller.clientHeight + 1;
    if (scrolls) { scroller.tabIndex = 0; scroller.setAttribute('role', 'region'); scroller.setAttribute('aria-label', 'Prévia da mensagem'); }
    else { scroller.removeAttribute('tabindex'); scroller.removeAttribute('role'); scroller.removeAttribute('aria-label'); }
  };
  const place = () => {
    if (wide.matches) {
      if (!phone) {
        scroller = document.createElement('div');
        scroller.className = 'vg-phone-scroll';
        phone = createPhone({label: 'Celular com a prévia da mensagem', scheme: 'light', content: scroller});
        phone.root.classList.add('vg-phone');
      }
      scroller.append(bubble);
      if (!phone.root.isConnected) slot.append(phone.root);
      slot.dataset.frame = 'phone';
      fitScroll();
    } else {
      slot.append(bubble);
      phone?.root.remove();
      slot.dataset.frame = 'none';
    }
  };
  wide.addEventListener('change', place);
  place();
  return {refresh: fitScroll, frame: () => slot.dataset.frame, target: () => (slot.dataset.frame === 'phone' ? phone.root : bubble)};
}

/* ---------- V5 · "Entrar no banco" ---------- */
export function mountTalentForm(form = $('[data-talent-form]')) {
  if (!form) return null;
  const summary = $('[data-error-summary]', form);
  const panel = $('[data-handoff-panel]', form);
  const actions = $('[data-handoff-actions]', form);
  const locked = $('[data-handoff-locked]', form);
  const status = $('[data-handoff-status]', form);
  const other = $('[data-area-other]', form);
  const otherInput = $('#vg-area-outra', form);
  const linkHintEl = $('#vg-link1-dica', form);
  const highlight = $('#vg-destaque', form);
  const highlightCount = $('[data-highlight-count]', form);
  const preview = mountPreview($('[data-preview-slot]', form), $('[data-preview-bubble]', form));
  const values = () => readValues(form);

  const rules = [
    [{id: 'vg-area', check: checkArea}, {id: 'vg-area-outra', check: checkAreaOther}],
    [{id: 'vg-nivel', check: checkLevel}],
    [{id: 'vg-link1', check: checkLink1}, {id: 'vg-link2', check: checkLink2}, {id: 'vg-destaque', check: (v, field) => checkHighlight(v, field?.value ?? v.destaque)}],
    [{id: 'vg-formato', check: checkFormat}, {id: 'vg-inicio', check: checkStart}, {id: 'vg-nome', check: checkName}],
    [{id: 'vg-maior', check: checkAdult}, {id: 'vg-consentimento', check: checkConsent}]
  ];
  const validators = rules.map(list => createValidator(form, list, {summary, values}));

  /* "Outra" reveals its text field; the link hint follows the chosen area. */
  const syncArea = () => {
    const area = values().area;
    const isOther = area === OTHER_AREA;
    if (other) other.hidden = !isOther;
    if (otherInput) otherInput.disabled = !isOther;
    if (linkHintEl) linkHintEl.textContent = linkHint(area);
  };
  const syncCount = () => { if (highlight && highlightCount) highlightCount.textContent = `${highlight.value.length}/${LIMITS.highlight}`; };

  let current = null;
  const lastStep = rules.length - 1;
  function renderReview() {
    const answers = values();
    current = buildHandoff(composeVagas(answers));
    const unlocked = Boolean(answers.maior && answers.consentimento);
    renderHandoff(panel, unlocked ? current : {text: current.text, whatsapp: null, email: null});
    if (actions) actions.hidden = !unlocked;
    if (locked) locked.hidden = unlocked;
    if (!unlocked && status) status.textContent = '';
    form.dataset.handoff = unlocked ? 'ready' : 'locked';
    preview.refresh();
    return current;
  }

  const stepper = mountStepper(form, {
    motion,
    summary,
    validateStep: index => validators[index].validate({focusSummary: true}),
    onChange(index) {
      if (index === lastStep) {
        renderReview();
        recordInteraction('review_opened', {page: PAGE});
      }
      recordInteraction('step_changed', {page: PAGE, step: index + 1});
    },
    onSettle(index, {direction}) {
      // The message morphs into view (350 ms) once the review step has slid in.
      if (index !== lastStep || direction < 0) return;
      const el = preview.target?.();
      if (el) motion.animate(el, [{opacity: 0, transform: 'scale(.96)'}, {opacity: 1, transform: 'none'}], {duration: DURATION.morph, easing: EASE.morph});
    }
  });

  form.addEventListener('change', event => {
    if (event.target?.name === 'area') syncArea();
    if (stepper.index() === lastStep) renderReview();
  });
  form.addEventListener('input', event => {
    if (event.target === highlight) syncCount();
  });
  bindHandoffPanel(panel, {page: PAGE, getText: () => current?.text ?? ''});

  // JavaScript is running: the no-JS e-mail note retires and the hidden parts appear.
  $$('[data-nojs-fallback]', form.closest('section') || document).forEach(el => { el.hidden = true; });
  $$('[data-js-only]', form).forEach(el => { el.hidden = false; });
  syncArea();
  syncCount();
  renderReview();
  form.dataset.ready = 'true';
  return {stepper, validators, values, renderReview, preview, current: () => current};
}

mountAreas();
mountTalentForm();
document.documentElement.dataset.vagasReady = 'true';
