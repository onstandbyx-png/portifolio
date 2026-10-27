/* K6 · Generalized card deck (SPEC 2.5, C3 and AV4).
 * Ported from the portfolio's former card deck (P8) without #editorial, sectionCopy or
 * brands: cards behind sit 24 px higher and scaleX(.95) per level, an exchange
 * takes 400 ms `ease`, a horizontal drag locks its axis (a vertical gesture
 * stays native scroll), release snaps back with the "bouncy" spring (inside the
 * 10% exception), arrows/Home/End navigate, there is no loop and the cards
 * behind are inert. Reduced motion or pause turns the deck into a static list.
 *
 * Markup (without JS the cards are a plain vertical list):
 * <div class="pg-deck" data-deck>
 *   <div class="pg-deck-stage" data-deck-stage role="region" aria-roledescription="baralho" aria-label="…" tabindex="0">
 *     <article class="pg-deck-card" data-deck-card aria-label="1 de 3: …">…</article> …
 *   </div>
 *   <div class="pg-deck-nav" role="group" aria-label="Navegar pelos cartões">
 *     <button type="button" data-deck-prev aria-label="Cartão anterior">←</button>
 *     <p class="pg-deck-counter" role="status" data-deck-counter>1 de 3</p>
 *     <button type="button" data-deck-next aria-label="Próximo cartão">→</button>
 *   </div>
 * </div> */
import {clamp, createMotion} from '../sections/motion.js';
import {PRESETS, motionReduced, onMotionPreferenceChange, springKeyframes} from './spring.js';

export const DECK = Object.freeze({offset: -24, scale: .95, duration: 400, easing: 'ease'});
const FORM_CONTROL = 'input,select,textarea,[contenteditable]:not([contenteditable="false"])';

/** Transform values for a card `level` positions behind the active one. */
export function deckLevel(level) {
  const depth = Math.max(0, level);
  return {y: depth ? depth * DECK.offset : 0, scaleX: Number((DECK.scale ** depth).toFixed(4))};
}

export function mountDeck(root, {onChange} = {}) {
  if (!root || root.dataset.deckReady) return null;
  const stage = root.querySelector('[data-deck-stage]') || root;
  const cards = [...root.querySelectorAll('[data-deck-card]')];
  if (!cards.length) return null;
  const prev = root.querySelector('[data-deck-prev]'), next = root.querySelector('[data-deck-next]');
  const counter = root.querySelector('[data-deck-counter]');
  const motion = createMotion();
  let active = 0, drag = null, lastSwipe = -Infinity, snap = null;
  const mode = () => (motionReduced() ? 'list' : 'stack');

  function paint() {
    const current = mode();
    root.dataset.deckMode = current;
    cards.forEach((card, i) => {
      const level = i - active, {y, scaleX} = deckLevel(level);
      card.dataset.level = String(level < 0 ? 'gone' : Math.min(level, 3));
      card.style.setProperty('--deck-y', `${y}px`);
      card.style.setProperty('--deck-sx', String(scaleX));
      card.classList.toggle('is-active', i === active);
      const behind = current === 'stack' && i !== active;
      card.inert = behind;
      if (behind) card.setAttribute('aria-hidden', 'true'); else card.removeAttribute('aria-hidden');
    });
    if (counter) counter.textContent = `${active + 1} de ${cards.length}`;
    // aria-disabled keeps the focused arrow focusable at either end.
    prev?.setAttribute('aria-disabled', String(active === 0));
    next?.setAttribute('aria-disabled', String(active === cards.length - 1));
  }

  function go(index, {focusCard = false} = {}) {
    const target = clamp(Math.round(index), 0, cards.length - 1);
    if (target === active) return false;
    const focusWasInCard = cards[active].contains(document.activeElement);
    cancelDrag(false);
    active = target;
    paint();
    if (focusWasInCard || focusCard) {
      const card = cards[active];
      const focusable = card.querySelector('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus({preventScroll: true});
      else { card.tabIndex = -1; card.focus({preventScroll: true}); }
    }
    onChange?.(active, cards[active]);
    return true;
  }

  prev?.addEventListener('click', () => go(active - 1));
  next?.addEventListener('click', () => go(active + 1));
  root.addEventListener('keydown', event => {
    if (mode() !== 'stack' || event.target.closest?.(FORM_CONTROL)) return;
    const destinations = {ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: cards.length - 1};
    if (!(event.key in destinations)) return;
    event.preventDefault();
    go(destinations[event.key]);
  });

  function cancelDrag(animate = true) {
    const current = drag;
    drag = null;
    delete stage.dataset.dragging;
    if (!current) return;
    const from = current.card.style.transform;
    current.card.style.removeProperty('transform');
    current.card.style.removeProperty('transition');
    if (stage.hasPointerCapture?.(current.id)) stage.releasePointerCapture(current.id);
    if (animate && current.axis === 'horizontal' && from && !motionReduced()) {
      snap?.cancel();
      snap = motion.animate(current.card, springKeyframes(progress => ({
        transform: `translate3d(${current.offset * (1 - progress)}px,0,0) rotate(${current.rotation * (1 - progress)}deg)`
      }), PRESETS.deckSnap), {duration: PRESETS.deckSnap.duration, easing: 'linear'});
    }
  }
  stage.addEventListener('pointerdown', event => {
    if (mode() !== 'stack' || drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (event.target.closest('button,a,input,select,textarea,label,[data-no-deck-drag]')) return;
    const card = event.target.closest('[data-deck-card]');
    if (card !== cards[active]) return;
    snap?.cancel();
    drag = {x: event.clientX, y: event.clientY, id: event.pointerId, card, axis: null, width: card.getBoundingClientRect().width || 1, offset: 0, rotation: 0};
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.axis) {
      // Vertical intent returns the gesture to native scrolling.
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.1) { cancelDrag(false); return; }
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
      drag.axis = 'horizontal';
      stage.dataset.dragging = 'true';
      stage.setPointerCapture?.(event.pointerId);
      drag.card.style.transition = 'none';
    }
    if (event.cancelable) event.preventDefault();
    const atEdge = (dx > 0 && active === 0) || (dx < 0 && active === cards.length - 1);
    const limit = drag.width * .8;
    // No loop: past either end the card resists instead of leaving.
    drag.offset = clamp(atEdge ? dx * .35 : dx, -limit, limit);
    drag.rotation = clamp(drag.offset / drag.width * 6, -6, 6);
    drag.card.style.transform = `translate3d(${drag.offset}px,0,0) rotate(${drag.rotation}deg)`;
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const current = drag, dx = event.clientX - current.x, dy = event.clientY - current.y;
    const threshold = Math.max(42, Math.min(72, current.width * .22));
    const deliberate = current.axis === 'horizontal' && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.25;
    const target = active + (dx < 0 ? 1 : -1);
    if (current.axis === 'horizontal') lastSwipe = performance.now();
    if (deliberate && target >= 0 && target < cards.length) {
      // The CSS transition (400 ms ease) continues from the released position.
      drag = null; delete stage.dataset.dragging;
      if (stage.hasPointerCapture?.(current.id)) stage.releasePointerCapture(current.id);
      current.card.style.removeProperty('transition');
      current.card.style.removeProperty('transform');
      go(target);
    } else cancelDrag(true);
  });
  stage.addEventListener('pointercancel', () => cancelDrag(true));
  stage.addEventListener('lostpointercapture', event => { if (event.target === stage && drag) cancelDrag(true); });
  // A completed drag never becomes a click (flip) on the card.
  stage.addEventListener('click', event => { if (performance.now() - lastSwipe < 300) { event.preventDefault(); event.stopPropagation(); } }, true);
  motion.onStop(() => cancelDrag(false));
  onMotionPreferenceChange(() => { cancelDrag(false); paint(); });

  paint();
  root.dataset.deckReady = 'true';
  return {go, next: () => go(active + 1), prev: () => go(active - 1), active: () => active, cards};
}
