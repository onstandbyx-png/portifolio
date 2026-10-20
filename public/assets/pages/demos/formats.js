/* K13 · "Um conteúdo, cada formato" (/criadores, C6).
 * Port of the portfolio's deck-demos "campanhas" back (public/assets/showcase/deck-demos.js):
 * the same piece in three formats behind aria-pressed buttons, a role="status"
 * line per change and a frame label for screen readers. Changes from the source:
 * creator formats (vertical 9:16, feed 4:5, text post), neutral "Parceria paga"
 * + "#publi" on the first frame of each format, no platform interface, the copy
 * lives in the HTML (data-status / data-label) and the device is the shared K7
 * phone. The frame morphs in 350 ms (EASE.morph, ~0.2% overshoot); reduced
 * motion and the pause button swap instantly. No timers, no rAF, no requests. */
import {createMotion} from '../../sections/motion.js';
import {DURATION, EASE} from '../spring.js';
import {createPhone} from '../devices.js';

export const FORMATS = Object.freeze(['vertical', 'feed', 'text']);

export function mountFormats(root, {motion = createMotion()} = {}) {
  if (!root || root.dataset.formatsReady) return null;
  const screen = root.querySelector('[data-formats-screen]');
  const slot = root.querySelector('[data-formats-device]');
  const status = root.querySelector('[data-formats-status]');
  const buttons = [...root.querySelectorAll('[data-format-button]')];
  const views = new Map([...root.querySelectorAll('[data-format]')].map(view => [view.dataset.format, view]));
  if (!screen || !slot || !views.size) return null;

  // The phone is the frame; its label describes the format on screen (copy §6.1).
  const phone = createPhone({label: views.get('vertical')?.dataset.label || '', content: screen, tone: 'dark', scheme: 'light'});
  phone.root.setAttribute('role', 'img');
  screen.classList.add('is-in-device');
  slot.replaceChildren(phone.root);

  let current = null;
  const mediaOf = view => view?.querySelector('[data-format-media]');

  function show(format, {announce = true} = {}) {
    const next = views.get(format);
    if (!next || format === current) return false;
    const previous = views.get(current);
    const fromHeight = mediaOf(previous)?.getBoundingClientRect().height || 0;
    views.forEach((view, key) => { view.hidden = key !== format; });
    current = format;
    root.dataset.currentFormat = format;
    phone.root.setAttribute('aria-label', next.dataset.label || '');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.formatButton === format)));
    if (announce && status) status.textContent = next.dataset.status || '';
    // Morph: the new frame grows or shrinks from the previous frame's height.
    const media = mediaOf(next);
    const toHeight = media?.getBoundingClientRect().height || 0;
    if (previous && media && fromHeight && toHeight && Math.abs(fromHeight - toHeight) > 1) {
      motion.animate(media, [{height: `${fromHeight}px`}, {height: `${toHeight}px`}], {duration: DURATION.morph, easing: EASE.morph});
      motion.animate(next, [{opacity: .4}, {opacity: 1}], {duration: DURATION.morph, easing: EASE.morph});
    }
    return true;
  }

  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.formatButton)));
  // The first status line ships in the HTML, so nothing is announced on load.
  show('vertical', {announce: false});
  root.dataset.formatsReady = 'true';
  return {show, current: () => current, phone};
}
