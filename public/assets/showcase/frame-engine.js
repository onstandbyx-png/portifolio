/* Frame engine shared by the campaign player (experience-player.js), "Sites e lojas"
   (vitrine-lab.js) and "Sistemas e automações" (automation-trace.js).

   A mock is a .cm-screen with .cm-scene layers (data-scene, data-kind = base | push |
   sheet | fade | switch | modal). A storyboard is a list of frames
   {ms, cena, estado?, toque?, hora?, fala?, log?, desc}. The stage is the positioned
   box around the phone that holds the overlays: .cx-dot [data-cx-dot], .cx-tap
   [data-cx-tap] and the ring .cx-ring [data-cx-ring] (created when missing).

   API (every function is safe to call with a missing screen or frame):
   - applyFrame(screen, list, index, {instant, playing}) → {item, moved, kind, previous, scene}
     Sets data-frame, data-scene, data-state (the frame's tokens plus the last state of
     every scene that left), data-enter and data-pos (on | under | off) on the scenes,
     clears data-tap and the pressed mark, writes the status-bar clock (setStatusTime)
     and --quadro-ms, plays the <video> of the scene on screen (muted, inline) and pauses
     the others, and starts the word-by-word entrance of [data-stream] text that has just
     appeared. instant skips every transition of this frame.
   - settle(screen, item) → Promise that resolves when the scene on screen has finished
     its finite animations and transitions (at most 1200 ms; 20 ms without motion).
   - positionDot(stage, screen, item, n) → boolean. Places the numbered point n beside
     the first visible, uncovered [data-hs~="n"] of the scene on screen, at the first spot
     that crosses no text and not the finger and stays inside the screen; data-hs-at on
     the target picks the first spot ('after', 'out-left', 'tl', 'tr'). A 2 px ring
     outlines the target. Point and ring hide on a tap frame and on 'done' or 'aviso'.
   - clearDot(stage)
   - showTap(stage, screen, item) → boolean / hideTap(stage): the finger on the last
     visible [data-tap="item.toque"], data-tap on the screen and the pressed mark.
   - setStatusTime(screen, list, index): the clock shows the last frame[k].hora up to
     index, or the time the phone was drawn with (STATUS_TIME).
   - tempoMinimo(screen, list, index) → ms. max(item.ms, 1400, (scene changed ? 820 : 0)
     + 260 per new word), capped at 9000 unless item.ms asks for more. New words are the
     words visible on the phone's screen now that were not visible on the frame measured
     before. Call it after settle(). It also writes --quadro-ms and, for tests,
     data-palavras and data-quadro-ms on the screen.
   - syncMedia(screen, playing): plays or pauses the videos of the screen.
   - live() → boolean: motion is allowed (no reduced motion, no global pause, tab visible).
   - stateAt(list, index) → the data-state string of a frame. */
import { HOJE } from './marcas.js';

export const STATUS_TIME = HOJE.hora;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
export const live = () => !reduce.matches && !document.body.classList.contains('is-paused') && !document.hidden;
/* Scene kinds that keep the previous scene painted under them while they enter. */
const KEEP = new Set(['push', 'sheet', 'switch', 'modal']);
const LIMIT = 1200, CAP = 9000, PISO = 1400, POR_PALAVRA = 260, TROCA = 820, R = 13;

export function stateAt(list, index) {
  const item = list[index];
  if (!item) return '';
  const kept = {};
  for (let k = 0; k < index; k++) if (list[k].cena !== item.cena) kept[list[k].cena] = list[k].estado || '';
  return [...Object.values(kept), item.estado || ''].join(' ').replace(/\s+/g, ' ').trim();
}

export function applyFrame(screen, list, index, { instant = false, playing = true } = {}) {
  const item = list?.[index];
  if (!screen || !item) return null;
  if (instant) screen.classList.add('is-instant');
  const moved = screen.dataset.scene !== item.cena;
  screen.dataset.frame = String(index);
  screen.dataset.scene = item.cena;
  screen.dataset.state = stateAt(list, index);
  delete screen.dataset.tap;
  screen.querySelectorAll('[data-pressed]').forEach(node => node.removeAttribute('data-pressed'));
  const scenes = [...screen.querySelectorAll('.cm-scene')];
  const current = scenes.find(node => node.dataset.scene === item.cena) || scenes[0];
  let previous = null;
  for (let k = index - 1; k >= 0; k--) if (list[k].cena !== item.cena) { previous = list[k].cena; break; }
  const kind = current?.dataset.kind || 'base';
  screen.dataset.enter = kind;
  scenes.forEach(node => { node.dataset.pos = node === current ? 'on' : KEEP.has(kind) && node.dataset.scene === previous ? 'under' : 'off'; });
  setStatusTime(screen, list, index);
  screen.style.setProperty('--quadro-ms', (item.ms || 0) + 'ms');
  stream(screen, instant);
  syncMedia(screen, playing);
  if (instant) requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.remove('is-instant')));
  return { item, moved, kind, previous, scene: current };
}

export function setStatusTime(screen, list, index) {
  const clock = screen?.closest('.ch-iphone-ui, .ch-iphone')?.querySelector('.ch-iphone-hora');
  if (!clock) return;
  if (!clock.dataset.base) clock.dataset.base = clock.textContent.trim() || STATUS_TIME;
  let hora = '';
  for (let k = Math.min(index, (list?.length || 0) - 1); k >= 0 && !hora; k--) hora = list[k]?.hora || '';
  const text = hora || clock.dataset.base;
  if (clock.textContent !== text) clock.textContent = text;
}

/* Videos play only in the scene on screen, only with motion, and never on their own
   while the player is stopped; a paused video keeps its poster or last frame. */
export function syncMedia(screen, playing = true) {
  if (!screen) return;
  const on = screen.querySelector('.cm-scene[data-pos="on"]');
  const ok = playing && live();
  screen.querySelectorAll('video').forEach(video => {
    video.muted = true; video.playsInline = true; video.setAttribute('playsinline', '');
    if (ok && on?.contains(video)) { const p = video.play?.(); p?.catch?.(() => {}); }
    else if (!video.paused) video.pause();
  });
}

/* Streamed text: words become spans once; text that has just appeared gets
   data-streaming, which frame-motion.css turns into a word-by-word entrance. */
const shownBefore = new WeakMap();
function tokens(value) { return String(value || '').split(/\s+/).filter(Boolean); }
function revealed(node, screen, state) {
  const scene = node.closest('.cm-scene');
  if (scene && scene.dataset.pos !== 'on') return false;
  for (let el = node; el && el !== screen; el = el.parentElement) {
    if (el.dataset?.in && !tokens(el.dataset.in).every(t => state.has(t))) return false;
    if (el.dataset?.out && tokens(el.dataset.out).some(t => state.has(t))) return false;
  }
  return true;
}
function splitWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.data.trim()) texts.push(node);
  let i = 0;
  texts.forEach(text => {
    const frag = document.createDocumentFragment();
    text.data.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const word = document.createElement('span');
      word.className = 'fm-w'; word.style.setProperty('--i', String(i++)); word.textContent = part;
      frag.append(word);
    });
    text.replaceWith(frag);
  });
  root.style.setProperty('--fm-palavras', String(i));
  root.dataset.streamReady = 'true';
}
function stream(screen, instant) {
  const state = new Set(tokens(screen.dataset.state));
  screen.querySelectorAll('[data-stream]').forEach(node => {
    if (!node.dataset.streamReady) splitWords(node);
    const on = revealed(node, screen, state), was = shownBefore.get(node) || false;
    if (on && !was && !instant && live()) { node.removeAttribute('data-streaming'); void node.offsetWidth; node.setAttribute('data-streaming', ''); }
    if (!on) node.removeAttribute('data-streaming');
    shownBefore.set(node, on);
  });
}

export function settle(screen, item, { limit = LIMIT } = {}) {
  return new Promise(resolve => {
    if (!screen || !live()) { setTimeout(resolve, 20); return; }
    let done = false;
    const finish = () => { if (!done) { done = true; clearTimeout(timer); resolve(); } };
    const timer = setTimeout(finish, limit);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const scene = screen.querySelector('.cm-scene[data-pos="on"]');
      const running = scene ? scene.getAnimations({ subtree: true }).filter(animation => {
        const timing = animation.effect?.getComputedTiming?.();
        return timing && Number.isFinite(timing.endTime) && animation.playState !== 'finished';
      }) : [];
      Promise.all(running.map(animation => animation.finished.catch(() => {}))).then(finish);
    }));
  });
}

/* Visibility inside the screen: size, visibility, no transparent ancestor up to the screen. */
function opaque(node, stop, cache, min = .05) {
  for (let el = node; el && el !== stop; el = el.parentElement) {
    let value = cache?.get(el);
    if (value === undefined) {
      const style = getComputedStyle(el);
      value = style.display === 'none' ? 0 : Number(style.opacity);
      if (el === node && style.visibility !== 'visible') value = 0;
      cache?.set(el, value);
    }
    if (value < min) return false;
  }
  return true;
}
const telaOf = screen => screen?.closest('.ch-iphone-tela') || screen?.closest('.ch-iphone')?.querySelector('.ch-iphone-tela');
const inside = (r, box) => r.width > 0 && r.height > 0 && r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom;

/* Text rectangles visible on the screen (one per line box of every text node). */
function textRects(root, box) {
  const cache = new Map(), out = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.data.trim() || !node.parentElement) continue;
    if (getComputedStyle(node.parentElement).visibility !== 'visible' || !opaque(node.parentElement, root, cache)) continue;
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) if (inside(r, box)) out.push(r);
  }
  return out;
}
function visibleTexts(screen, box) {
  const cache = new Map(), out = new Set();
  const walker = document.createTreeWalker(screen, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.data.trim() || !node.parentElement) continue;
    if (getComputedStyle(node.parentElement).visibility !== 'visible' || !opaque(node.parentElement, screen, cache, .5)) continue;
    range.selectNodeContents(node);
    if ([...range.getClientRects()].some(r => inside(r, box))) out.add(node);
  }
  return out;
}
export const palavras = text => tokens(text).filter(word => /[\p{L}\p{N}]/u.test(word)).length;

const medido = new WeakMap();
export function tempoMinimo(screen, list, index) {
  const item = list?.[index];
  if (!item) return 0;
  const tela = telaOf(screen);
  let words = 0;
  if (tela && screen) {
    const now = visibleTexts(screen, tela.getBoundingClientRect()), before = medido.get(screen);
    now.forEach(node => { if (!before?.has(node)) words += palavras(node.data); });
    medido.set(screen, now);
  }
  const moved = index === 0 || list[index - 1]?.cena !== item.cena;
  const ms = Math.round(Math.max(item.ms || 0, Math.min(CAP, Math.max(PISO, (moved ? TROCA : 0) + POR_PALAVRA * words))));
  if (screen) {
    screen.style.setProperty('--quadro-ms', ms + 'ms');
    screen.dataset.palavras = String(words);
    screen.dataset.quadroMs = String(ms);
  }
  return ms;
}

/* Targets: visible inside the scene on screen and not covered by something else. */
function covered(node, r) {
  if (getComputedStyle(node).pointerEvents === 'none') return false;
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
  const hit = document.elementFromPoint(x, y);
  if (!hit) return false;
  return !(node.contains(hit) || hit.closest('[data-hs]') === node || hit.closest('[data-tap]') === node || hit.closest('.cx-dot,.cx-tap,.cx-ring'));
}
function candidatesOf(scene, selector, box) {
  const cache = new Map();
  return [...scene.querySelectorAll(selector)].filter(node => {
    const r = node.getBoundingClientRect();
    if (!inside(r, box) || getComputedStyle(node).visibility !== 'visible' || !opaque(node, scene, cache)) return false;
    return !covered(node, r);
  });
}
function overlay(stage, attr, cls) {
  let node = stage.querySelector(`[${attr}]`);
  if (!node) {
    node = document.createElement('span');
    node.className = cls; node.setAttribute(attr, ''); node.setAttribute('aria-hidden', 'true'); node.hidden = true;
    stage.append(node);
  }
  return node;
}
function place(stage, node, x, y) {
  const box = stage.getBoundingClientRect();
  if (!box.width || !box.height) return;
  node.style.left = ((x - box.left) / box.width * 100).toFixed(2) + '%';
  node.style.top = ((y - box.top) / box.height * 100).toFixed(2) + '%';
}
const crosses = (r, x, y, radius) => {
  const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
  return dx * dx + dy * dy < radius * radius;
};
function spots(r, at) {
  const cy = r.top + r.height / 2, big = r.width >= 56 && r.height >= 56;
  const first = {
    after: [[r.right + 16, cy]],
    'out-left': [[r.left - 16, cy]],
    tl: big ? [[r.left + 20, r.top + 20], [r.left + 4, r.top - 16]] : [[r.left + 4, r.top - 16]],
    tr: big ? [[r.right - 20, r.top + 20], [r.right - 4, r.top - 16]] : [[r.right - 4, r.top - 16]],
  }[at] || [];
  const outside = [[r.right + 16, cy], [r.left - 16, cy], [r.right - 4, r.top - 16], [r.left + 4, r.top - 16], [r.left + 16, r.bottom + 16]];
  const within = big ? [[r.right - 20, r.top + 20], [r.left + 20, r.top + 20], [r.right - 20, r.bottom - 20], [r.left + 20, r.bottom - 20]] : [];
  return [...first, ...outside, ...within];
}
export function clearDot(stage) {
  stage?.querySelectorAll('[data-cx-dot], [data-cx-ring]').forEach(node => { node.hidden = true; });
}
export function positionDot(stage, screen, item, n) {
  const dot = stage?.querySelector('[data-cx-dot]');
  if (!dot || !screen) return false;
  const ring = overlay(stage, 'data-cx-ring', 'cx-ring');
  const state = tokens(screen.dataset.state);
  if (!item || !n || item.toque || state.includes('done') || state.includes('aviso')) { clearDot(stage); return false; }
  const scene = screen.querySelector('.cm-scene[data-pos="on"]'), tela = telaOf(screen);
  if (!scene || !tela) { clearDot(stage); return false; }
  const box = tela.getBoundingClientRect();
  const node = candidatesOf(scene, `[data-hs~="${n}"]`, box)[0];
  if (!node) { clearDot(stage); return false; }
  const r = node.getBoundingClientRect();
  const u = box.width / 412, top = box.top + 62 * u, bottom = box.bottom - 22 * u;
  const texts = textRects(screen, box);
  const tap = stage.querySelector('[data-cx-tap]:not([hidden])')?.getBoundingClientRect();
  const fits = ([x, y]) => x - R >= box.left + 2 && x + R <= box.right - 2 && y - R >= top && y + R <= bottom;
  const clean = ([x, y]) => !texts.some(t => crosses(t, x, y, R + 1)) && !(tap && tap.width && crosses(tap, x, y, R + 2));
  const spot = spots(r, node.dataset.hsAt).find(p => fits(p) && clean(p));
  // The ring outlines the target (3 px out), clipped to the screen.
  const pad = 3, left = Math.max(box.left, r.left - pad), right = Math.min(box.right, r.right + pad);
  const up = Math.max(top - 4 * u, r.top - pad), down = Math.min(box.bottom, r.bottom + pad);
  const sb = stage.getBoundingClientRect();
  if (sb.width && right > left && down > up) {
    ring.style.left = ((left - sb.left) / sb.width * 100).toFixed(2) + '%';
    ring.style.top = ((up - sb.top) / sb.height * 100).toFixed(2) + '%';
    ring.style.width = ((right - left) / sb.width * 100).toFixed(2) + '%';
    ring.style.height = ((down - up) / sb.height * 100).toFixed(2) + '%';
    const radius = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
    ring.style.borderRadius = Math.min(radius + pad, (right - left) / 2, (down - up) / 2, 40).toFixed(1) + 'px';
    ring.hidden = false;
  } else ring.hidden = true;
  if (!spot) { dot.hidden = true; return false; }
  dot.textContent = String(n);
  place(stage, dot, spot[0], spot[1]);
  dot.hidden = false;
  return true;
}

export function hideTap(stage) {
  const tap = stage?.querySelector('[data-cx-tap]');
  if (tap) { tap.hidden = true; tap.classList.remove('is-on'); }
}
export function showTap(stage, screen, item) {
  const tap = stage?.querySelector('[data-cx-tap]'), key = item?.toque;
  if (!tap || !screen) return false;
  if (!key) { hideTap(stage); delete screen.dataset.tap; return false; }
  const scene = screen.querySelector('.cm-scene[data-pos="on"]'), tela = telaOf(screen);
  const node = scene && tela ? candidatesOf(scene, `[data-tap="${key}"]`, tela.getBoundingClientRect()).pop() : null;
  if (!node) { hideTap(stage); return false; }
  const r = node.getBoundingClientRect();
  place(stage, tap, r.left + r.width / 2, r.top + r.height / 2);
  tap.hidden = false;
  tap.classList.toggle('is-static', !live());
  tap.classList.remove('is-on'); void tap.offsetWidth; tap.classList.add('is-on');
  screen.dataset.tap = key;
  if (live()) node.setAttribute('data-pressed', '');
  return true;
}
