/** R6 editorial motion. Only section headings: scene/card motion has its own owner. */
const SELECTOR = '#hero-title,#work-title,#editorial-title,#ads-title,#systems-title,#contact-title,#rx-evidence-title';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const states = new Map();
const blocked = () => reduced.matches || document.hidden || document.body.classList.contains('is-paused') || document.querySelector('.motion-toggle')?.getAttribute('aria-pressed') === 'true';
const EASE = 'cubic-bezier(.22,.72,.2,1)';
let observer, scanFrame = 0, started = false;

// Keep the actual HTML in flow. An aria-hidden visual layer can move without
// changing line wraps, section height, focus order or accessible heading text.
function wordsIn(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const words = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    for (const match of node.textContent.matchAll(/\S+/gu)) {
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getBoundingClientRect();
      if (rect.width && rect.height) words.push({ node, start: match.index, end: match.index + match[0].length, rect });
    }
  }
  return words;
}

function splitLines(heading) {
  const source = document.createElement('span');
  source.className = 'ed-heading-source';
  source.append(...heading.childNodes);
  heading.append(source);
  heading.classList.add('ed-heading');
  const font = getComputedStyle(heading);
  const lineHeight = parseFloat(font.lineHeight) || parseFloat(font.fontSize) * 1.1;
  const groups = [];
  for (const word of wordsIn(source)) {
    const center = word.rect.top + word.rect.height / 2;
    const previous = groups.at(-1);
    // Different italic/font metrics share a line; a new line moves its center.
    if (!previous || Math.abs(center - previous.center) > lineHeight * .55) {
      groups.push({ center, words: [word] });
    } else previous.words.push(word);
  }
  if (!groups.length) { source.replaceWith(...source.childNodes); heading.classList.remove('ed-heading'); return null; }
  const visual = document.createElement('span');
  visual.className = 'ed-heading-visual';
  visual.setAttribute('aria-hidden', 'true');
  const lines = groups.map(group => {
    const first = group.words[0], last = group.words.at(-1);
    const range = document.createRange();
    range.setStart(first.node, first.start);
    range.setEnd(last.node, last.end);
    const mask = document.createElement('span'), line = document.createElement('span');
    mask.className = 'ed-line-mask'; line.className = 'ed-line';
    let fragment = range.cloneContents();
    // Range.cloneContents omits a common inline ancestor (e.g. a whole line
    // inside <em>). Preserve that ancestor so the visual keeps its real font.
    let ancestor = range.commonAncestorContainer;
    if (ancestor.nodeType !== Node.ELEMENT_NODE) ancestor = ancestor.parentElement;
    while (ancestor && ancestor !== source) {
      const wrapper = ancestor.cloneNode(false);
      wrapper.removeAttribute('id');
      wrapper.append(fragment); fragment = wrapper;
      ancestor = ancestor.parentElement;
    }
    line.append(fragment);
    line.querySelectorAll('br').forEach(br => br.remove());
    line.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    mask.append(line); visual.append(mask);
    return { mask, line, sourceTop: first.rect.top };
  });
  heading.append(visual);
  // Align each clone by its own glyph metrics, including the italic accent.
  for (const entry of lines) {
    const measured = wordsIn(entry.line)[0];
    if (measured) entry.mask.style.top = `${entry.sourceTop - measured.rect.top}px`;
  }
  source.classList.add('ed-source-covered');
  return { source, visual, lines };
}

function settle(state) {
  if (!state) return;
  state.done = true;
  for (const animation of state.animations) animation.cancel();
  state.animations.length = 0;
  if (state.split) {
    const { source, visual } = state.split;
    visual.remove();
    source.replaceWith(...source.childNodes);
    state.split = null;
  }
  state.heading.classList.remove('ed-heading');
  state.heading.dataset.editorialMotion = 'settled';
  observer?.unobserve(state.heading);
}

function reveal(state) {
  if (state.done || state.animations.length) return;
  if (blocked() || !state.heading.animate) { settle(state); return; }
  // Do not replay a hero that was already read while fonts or modules loaded.
  if (state.heading.id === 'hero-title' && (performance.now() > 1800 || scrollY > 80)) { settle(state); return; }
  const split = splitLines(state.heading);
  if (!split) { settle(state); return; }
  state.split = split;
  state.heading.dataset.editorialMotion = 'revealing';
  const hero = state.heading.id === 'hero-title';
  for (let i = 0; i < split.lines.length; i++) {
    const animation = split.lines[i].line.animate([
      { transform: 'translateY(103%)', opacity: .15 },
      { transform: 'translateY(0)', opacity: 1 }
    ], { duration: hero ? 780 : 660, delay: i * 75, easing: EASE, fill: 'both' });
    state.animations.push(animation);
  }
  // A single variable-font accent; layout remains reserved by the real text.
  const accent = hero && split.visual.querySelector('em');
  if (accent) {
    const weight = Number.parseFloat(getComputedStyle(accent).fontWeight) || 400;
    const accentAnimation = accent.animate([
      { fontVariationSettings: `"wght" ${weight}` },
      { fontVariationSettings: `"wght" ${Math.min(weight + 70, 700)}` },
      { fontVariationSettings: `"wght" ${weight}` }
    ], { duration: 850, delay: 130, easing: EASE });
    state.animations.push(accentAnimation);
  }
  Promise.allSettled(state.animations.map(animation => animation.finished)).then(() => settle(state));
}

function scan() {
  scanFrame = 0;
  for (const heading of document.querySelectorAll(SELECTOR)) {
    if (states.has(heading) || !heading.textContent.trim()) continue;
    const state = { heading, done: false, split: null, animations: [] };
    states.set(heading, state);
    heading.dataset.editorialMotion = 'waiting';
    if (blocked() || !observer) settle(state); else observer.observe(heading);
  }
  for (const [heading, state] of states) if (!heading.isConnected) { settle(state); states.delete(heading); }
}

function syncPreference() {
  document.documentElement.dataset.editorialMotionPaused = String(blocked());
  if (blocked()) for (const state of states.values()) settle(state);
}

async function start() {
  if (started) return;
  started = true;
  // Never hide pending content while a font request is slow or unavailable.
  await Promise.race([document.fonts?.ready || Promise.resolve(), new Promise(resolve => setTimeout(resolve, 900))]);
  if ('IntersectionObserver' in window) observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.get(entry.target);
      if (!state) continue;
      if (entry.isIntersecting) reveal(state);
      else if (state.animations.length) settle(state);
    }
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  scan(); syncPreference();
  // Dynamic chapter headings may be mounted after this module. Never watch or
  // animate text inside a scene, dialog, tab panel or draggable card.
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches?.(SELECTOR) || node.querySelector?.(SELECTOR))))) {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan);
    }
  }).observe(document.querySelector('main') || document.body, { subtree: true, childList: true });
  new MutationObserver(syncPreference).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  const toggle = document.querySelector('.motion-toggle');
  if (toggle) new MutationObserver(syncPreference).observe(toggle, { attributes: true, attributeFilter: ['aria-pressed'] });
  reduced.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', syncPreference);
  // A resize or font swap restores original flow instead of keeping stale lines.
  const settleRunning = () => { for (const state of states.values()) if (state.animations.length) settle(state); };
  addEventListener('resize', settleRunning, { passive: true });
  document.fonts?.addEventListener('loadingdone', settleRunning);
  document.documentElement.classList.add('editorial-motion-ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
