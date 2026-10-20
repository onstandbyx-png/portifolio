/* K14 · "Qual abertura prende mais?" (/criadores, C6).
 * Port of the portfolio's deck-demos "conteudo" back (public/assets/showcase/deck-demos.js):
 * hooks A and B, three frames each (abertura, contexto, convite), arrow keys on
 * the screen, a role="status" line on every change, no winner and no percentage.
 * Changes from the source: the copy (hooks, frames, explanations) is read from
 * the static script in the HTML, which stays readable without JS and is hidden
 * once the player mounts; the frame is the shared K8 notebook (devices.js); the
 * frame title enters in 450 ms with the "snappy" spring and the scenery follows
 * the 500 ms step curve. Reduced motion and pause: instant. No timers, no rAF. */
import {createMotion} from '../../sections/motion.js';
import {DURATION, springEasing} from '../spring.js';
import {createNotebook} from '../devices.js';

const pad = n => String(n).padStart(2, '0');
let uid = 0;
/* One inline SVG landscape (no people, no photos): sky, sun, three ridges and mist. */
const TONES = {
  dusk: ['#2e5752', '#a98b6b', '#e9b072', '#f6d39e', '#fff0d4', '#7b9085', '#45635a', '#1f3d33'],
  dawn: ['#35566a', '#86a2a8', '#d6c3a2', '#f1dbb2', '#fff4de', '#768c98', '#465f6c', '#21384a']
};
export function landscape(tone) {
  const id = `hk-sky-${++uid}`, c = TONES[tone] || TONES.dusk;
  return `<svg class="hk-landscape" data-tone="${tone}" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>` +
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".48" stop-color="${c[1]}"/><stop offset=".72" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/></linearGradient>` +
    `<linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[4]}" stop-opacity="0"/><stop offset="1" stop-color="${c[4]}" stop-opacity=".45"/></linearGradient></defs>` +
    `<rect width="320" height="180" fill="url(#${id})"/>` +
    `<g><circle cx="212" cy="104" r="70" fill="${c[4]}" opacity=".16"/><circle cx="212" cy="104" r="34" fill="${c[4]}" opacity=".3"/><circle cx="212" cy="104" r="14" fill="${c[4]}"/></g>` +
    `<path d="M-20 120L22 92l26 14 36-34 30 26 32-18 38 24 36-30 36 22 32-16 52 22 40-18 40 14V200H-20z" fill="${c[5]}"/>` +
    `<rect x="-20" y="96" width="460" height="44" fill="url(#${id}m)"/>` +
    `<path d="M-20 136l48-26 30 14 40-30 40 30 30-16 40 22 36-26 44 22 32-12 40-20 40 16 30-8V200H-20z" fill="${c[6]}"/>` +
    `<path d="M-20 156c44-18 92-10 132-6 52 6 94-14 146-8 30 4 52 8 82 4 30-4 60-6 90 0V200H-20z" fill="${c[7]}"/></svg>`;
}

/** Hooks from the static script: {a: {why, tone, frames: [{label, name, text}]}, b: …}. */
export function readHooks(script) {
  const hooks = {};
  for (const section of script?.querySelectorAll('[data-hook]') || []) {
    const key = section.dataset.hook;
    hooks[key] = {
      why: section.dataset.why || '',
      tone: key === 'b' ? 'dawn' : 'dusk',
      frames: [...section.querySelectorAll('[data-frame]')].map(item => ({
        label: item.querySelector('[data-frame-label]')?.textContent.trim() || '',
        name: item.dataset.frameName || '',
        text: item.querySelector('[data-frame-text]')?.textContent.trim() || ''
      }))
    };
  }
  return hooks;
}

export function mountHooks(root, {motion = createMotion()} = {}) {
  if (!root || root.dataset.hooksReady) return null;
  const script = root.querySelector('[data-hooks-script]');
  const player = root.querySelector('[data-hooks-player]');
  const slot = root.querySelector('[data-hooks-device]');
  const status = root.querySelector('[data-hooks-status]');
  const buttons = [...root.querySelectorAll('[data-hook-button]')];
  const hooks = readHooks(script);
  if (!player || !slot || !Object.keys(hooks).length) return null;

  const scenery = player.querySelector('[data-hooks-scenery]');
  if (scenery) scenery.innerHTML = landscape('dusk') + landscape('dawn');
  const notebook = createNotebook({content: player});
  slot.replaceChildren(notebook.root);
  if (script) script.hidden = true;

  const title = player.querySelector('[data-hooks-title]');
  const label = player.querySelector('[data-hooks-label]');
  const counter = player.querySelector('[data-hooks-counter]');
  const segments = [...player.querySelectorAll('.hk-segments i')];
  const prev = player.querySelector('[data-hooks-prev]');
  const next = player.querySelector('[data-hooks-next]');
  const entry = springEasing('entry', 'cubic-bezier(.16,1,.3,1)');
  let hook = null, step = 0;

  function paint(announce) {
    const {frames, tone} = hooks[hook];
    const frame = frames[step];
    player.dataset.hook = hook;
    player.dataset.step = String(step);
    if (scenery) scenery.dataset.tone = tone;
    label.textContent = frame.label;
    title.textContent = frame.text;
    motion.animate(title, [{opacity: 0, transform: 'translateY(.45em)'}, {opacity: 1, transform: 'none'}], {duration: DURATION.entry, easing: entry});
    counter.hidden = false;
    counter.textContent = `${pad(step + 1)} / ${pad(frames.length)}`;
    segments.forEach((segment, i) => segment.classList.toggle('is-on', i <= step));
    if (announce && status) status.textContent = announce;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.hookButton;
    if (!hooks[key]) return;
    hook = key; step = 0;
    buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    prev.disabled = false; next.disabled = false;
    paint(hooks[key].why);
  }));
  const move = delta => {
    if (!hook) return;
    const {frames} = hooks[hook];
    step = (step + delta + frames.length) % frames.length;
    paint(`Quadro ${step + 1} de ${frames.length}: ${frames[step].name}.`);
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  player.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  root.dataset.hooksReady = 'true';
  return {choose: key => buttons.find(button => button.dataset.hookButton === key)?.click(), move, state: () => ({hook, step}), notebook};
}
