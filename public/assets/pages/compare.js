/* K16 · Before/after comparison slider in plain JS (SPEC 2.6, AV4).
 * Pattern of the smiile landing ImageExperience comparison (two stacked layers,
 * the new one revealed with clip-path, a divider dragged with pointer capture
 * and a native <input type="range"> with aria-valuetext), rewritten without
 * React. The range is the real control: keyboard and screen readers get it
 * for free. A horizontal drag on the stage locks its axis; a vertical gesture
 * stays native scroll (touch-action: pan-y). Arrow keys and Page/Home/End move
 * in steps with a 500 ms cubic-bezier(.25,.1,.25,1) glide; reduced motion or
 * the pause button make every change instant.
 *
 * Markup (without JS both layers are shown side by side; see compare.css):
 * <div class="pg-compare" data-compare>
 *   <div class="pg-compare-stage" data-compare-stage>
 *     <figure class="pg-compare-layer pg-compare-before">…</figure>
 *     <figure class="pg-compare-layer pg-compare-after">…</figure>
 *     <span class="pg-compare-divider" data-compare-handle aria-hidden="true"></span>
 *   </div>
 *   <div class="pg-compare-control"><label for="…">…</label><input type="range" data-compare-range …></div>
 * </div> */
import {clamp} from '../sections/motion.js';
import {motionReduced, onMotionPreferenceChange} from './spring.js';

export const COMPARE = Object.freeze({step: 10, glide: 500, easing: 'cubic-bezier(.25,.1,.25,1)'});
export const percent = value => Math.round(clamp(Number(value), 0, 100));
/** aria-valuetext (copy-ao-vivo.md §4.3). */
export const compareValueText = value => `Mostrando ${percent(value)}% da versão nova`;
/** Next value for a key press, or null when the key is not a slider key. */
export function keyStep(key, value, step = COMPARE.step) {
  const v = percent(value);
  const map = {ArrowRight: v + step, ArrowUp: v + step, ArrowLeft: v - step, ArrowDown: v - step, PageUp: v + step * 2, PageDown: v - step * 2, Home: 0, End: 100};
  return key in map ? percent(map[key]) : null;
}

export function mountCompare(root, {onChange} = {}) {
  if (!root || root.dataset.compareReady) return null;
  const stage = root.querySelector('[data-compare-stage]');
  const range = root.querySelector('[data-compare-range]');
  if (!stage || !range) return null;
  let value = percent(range.value || 50), drag = null, glideTimer = 0;

  function paint(next, {glide = false} = {}) {
    value = percent(next);
    const animate = glide && !motionReduced();
    clearTimeout(glideTimer);
    root.classList.toggle('is-gliding', animate);
    if (animate) glideTimer = setTimeout(() => root.classList.remove('is-gliding'), COMPARE.glide + 40);
    root.style.setProperty('--compare-x', `${value}%`);
    range.value = String(value);
    range.setAttribute('aria-valuetext', compareValueText(value));
    onChange?.(value);
  }
  const fromPointer = event => {
    const rect = stage.getBoundingClientRect();
    return rect.width ? (event.clientX - rect.left) / rect.width * 100 : value;
  };

  range.addEventListener('input', () => paint(range.value));
  range.addEventListener('keydown', event => {
    const next = keyStep(event.key, value);
    if (next === null) return;
    event.preventDefault();
    paint(next, {glide: true});
  });

  stage.addEventListener('pointerdown', event => {
    if (drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const onHandle = Boolean(event.target.closest('[data-compare-handle]'));
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, axis: onHandle ? 'horizontal' : null};
    if (onHandle) { event.preventDefault(); stage.setPointerCapture?.(event.pointerId); root.dataset.dragging = 'true'; paint(fromPointer(event)); }
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.axis) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      // Vertical intent returns the gesture to native scrolling.
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.1) { drag = null; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
      drag.axis = 'horizontal';
      root.dataset.dragging = 'true';
      stage.setPointerCapture?.(event.pointerId);
    }
    if (event.cancelable) event.preventDefault();
    paint(fromPointer(event));
  });
  const end = event => {
    if (!drag || (event && drag.id !== event.pointerId)) return;
    if (stage.hasPointerCapture?.(drag.id)) stage.releasePointerCapture(drag.id);
    drag = null;
    delete root.dataset.dragging;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('lostpointercapture', () => { drag = null; delete root.dataset.dragging; });
  onMotionPreferenceChange(reduced => { if (reduced) { clearTimeout(glideTimer); root.classList.remove('is-gliding'); } });

  paint(value);
  root.dataset.compareReady = 'true';
  return {set: (next, options) => paint(next, options), value: () => value};
}
