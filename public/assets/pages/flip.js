/* K5 · Direction-aware flip card (SPEC 2.5/2.6).
 * Ported from the portfolio's scroll-gallery flip (P6) and card-surface (P7):
 * the card turns around the axis of the side the mouse entered from; opening
 * takes 600 ms (smooth spring, d ≈ .42 s) and closing 350 ms (d ≈ .25 s).
 * Front and back swap inert/aria-hidden, Escape closes, focus follows the face.
 *
 * Markup (works without JS: both faces are shown stacked):
 * <article class="pg-flip" data-flip [data-flip-reduced="swap|stack"] [data-flip-surface]>
 *   <div class="pg-flip-stage"><div class="pg-flip-rotor">
 *     <div class="pg-flip-face pg-flip-front" data-flip-front>… <button type="button" data-flip-open aria-pressed="false">…</button></div>
 *     <div class="pg-flip-face pg-flip-back" data-flip-back><h3 tabindex="-1" data-flip-focus>…</h3> … <button type="button" data-flip-close>…</button></div>
 *   </div></div>
 * </article>
 * Reduced motion or pause: "swap" (default) changes face instantly; "stack"
 * shows both faces stacked and hides the buttons. */
import {createMotion, entryEdge, rotationForEdge} from '../sections/motion.js';
import {bindCardSurface} from '../showcase/card-surface.js';
import {DURATION, EASE, PRESETS, motionReduced, onMotionPreferenceChange, springEasing} from './spring.js';

const motion = createMotion();
const mounted = new WeakMap();

export function mountFlip(card, {onToggle, group = null} = {}) {
  if (!card || mounted.has(card)) return mounted.get(card) || null;
  const rotor = card.querySelector('.pg-flip-rotor');
  const front = card.querySelector('[data-flip-front]');
  const back = card.querySelector('[data-flip-back]');
  if (!rotor || !front || !back) return null;
  const openers = [...card.querySelectorAll('[data-flip-open]')];
  const closers = [...card.querySelectorAll('[data-flip-close]')];
  const stackMode = card.dataset.flipReduced === 'stack';
  let flipped = false, edge = 'right', rotation = rotationForEdge('right'), turn = null;

  const stacked = () => stackMode && motionReduced();
  function applyFaces() {
    if (stacked()) {
      front.inert = false; back.inert = false;
      front.removeAttribute('aria-hidden'); back.removeAttribute('aria-hidden');
      rotor.style.transform = ''; back.style.transform = '';
      return;
    }
    front.inert = flipped; back.inert = !flipped;
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
  }
  function setPressed() {
    for (const button of openers) {
      button.setAttribute('aria-pressed', String(flipped));
      if (button.hasAttribute('aria-expanded')) button.setAttribute('aria-expanded', String(flipped));
    }
    card.dataset.face = flipped ? 'back' : 'front';
  }
  function toggle(next = !flipped, {focus = true, source = 'button'} = {}) {
    if (next === flipped || stacked()) return;
    if (next && group) group.closeOthers(api);
    const current = getComputedStyle(rotor).transform;
    turn?.cancel();
    if (next) {
      rotation = rotationForEdge(edge);
      back.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    }
    flipped = next;
    const target = flipped ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : 'rotateX(0deg) rotateY(0deg)';
    rotor.style.transform = target;
    setPressed();
    applyFaces();
    const spec = flipped ? PRESETS.flipOpen : PRESETS.flipClose;
    turn = motion.animate(rotor, [{transform: current === 'none' ? 'rotateX(0deg) rotateY(0deg)' : current}, {transform: target}],
      {duration: flipped ? DURATION.flipOpen : DURATION.flipClose, easing: springEasing(spec, EASE.flip)});
    if (focus) {
      const destination = flipped ? (back.querySelector('[data-flip-focus]') || closers[0]) : openers[0];
      destination?.focus({preventScroll: true});
    }
    onToggle?.(flipped, {card, source});
  }
  card.querySelector('.pg-flip-stage')?.addEventListener('pointerenter', event => {
    if (flipped || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    edge = entryEdge(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
  });
  openers.forEach(button => button.addEventListener('click', () => toggle(true)));
  closers.forEach(button => button.addEventListener('click', () => toggle(false)));
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape' && flipped && !stacked()) { event.preventDefault(); event.stopPropagation(); toggle(false); }
  });
  if (card.hasAttribute('data-flip-surface')) bindCardSurface(card, () => (flipped || stacked() ? null : openers[0]));
  const api = {card, toggle, open: options => toggle(true, options), close: options => toggle(false, options), isOpen: () => flipped};
  onMotionPreferenceChange(() => { turn?.finish?.(); applyFaces(); });
  setPressed();
  applyFaces();
  card.dataset.flipReady = 'true';
  mounted.set(card, api);
  return api;
}

/** One card open at a time inside root (AV3, V3). */
export function mountFlipGroup(root = document, options = {}) {
  const members = [];
  const group = {closeOthers(except) { members.forEach(member => { if (member !== except && member.isOpen()) member.close({focus: false}); }); }};
  root.querySelectorAll('[data-flip]').forEach(card => {
    const api = mountFlip(card, {...options, group});
    if (api) members.push(api);
  });
  return {members, closeAll: () => group.closeOthers(null)};
}
