/* K12 · Heading reveal for the parallel pages.
 * Ported from /assets/editorial-motion.js (approved on the home: 660 ms lines,
 * 75 ms apart) with SELECTOR = '[data-reveal-heading]' and without the home's
 * hero-specific branches. The real heading text stays in flow; an aria-hidden
 * visual copy is masked line by line, so wraps, height, focus order and the
 * accessible name never change. Pause, reduced motion and hidden tabs settle it. */
import {DURATION, EASE} from './spring.js';

const SELECTOR = '[data-reveal-heading]';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const states = new Map();
const blocked = () => reduced.matches || document.hidden || document.body.classList.contains('is-paused') ||
  document.querySelector('.motion-toggle')?.getAttribute('aria-pressed') === 'true';
let observer, scanFrame = 0, started = false;

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
      if (rect.width && rect.height) words.push({node, start: match.index, end: match.index + match[0].length, rect});
    }
  }
  return words;
}

function splitLines(heading) {
  const source = document.createElement('span');
  source.className = 'hr-heading-source';
  source.append(...heading.childNodes);
  heading.append(source);
  heading.classList.add('hr-heading');
  const font = getComputedStyle(heading);
  const lineHeight = parseFloat(font.lineHeight) || parseFloat(font.fontSize) * 1.1;
  const groups = [];
  for (const word of wordsIn(source)) {
    const center = word.rect.top + word.rect.height / 2;
    const previous = groups.at(-1);
    // Italic accents share a line with different metrics; only a new line moves the center.
    if (!previous || Math.abs(center - previous.center) > lineHeight * .55) groups.push({center, words: [word]});
    else previous.words.push(word);
  }
  if (!groups.length) { source.replaceWith(...source.childNodes); heading.classList.remove('hr-heading'); return null; }
  const visual = document.createElement('span');
  visual.className = 'hr-heading-visual';
  visual.setAttribute('aria-hidden', 'true');
  const lines = groups.map(group => {
    const first = group.words[0], last = group.words.at(-1);
    const range = document.createRange();
    range.setStart(first.node, first.start);
    range.setEnd(last.node, last.end);
    const mask = document.createElement('span'), line = document.createElement('span');
    mask.className = 'hr-line-mask'; line.className = 'hr-line';
    let fragment = range.cloneContents();
    // cloneContents() drops a shared inline ancestor (a whole line inside <em>): keep its font.
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
    return {mask, line, sourceTop: first.rect.top};
  });
  heading.append(visual);
  for (const entry of lines) {
    const measured = wordsIn(entry.line)[0];
    if (measured) entry.mask.style.top = `${entry.sourceTop - measured.rect.top}px`;
  }
  source.classList.add('hr-source-covered');
  return {source, visual, lines};
}

function settle(state) {
  if (!state) return;
  state.done = true;
  for (const animation of state.animations) animation.cancel();
  state.animations.length = 0;
  if (state.split) {
    const {source, visual} = state.split;
    visual.remove();
    source.replaceWith(...source.childNodes);
    state.split = null;
  }
  state.heading.classList.remove('hr-heading');
  state.heading.dataset.headingReveal = 'settled';
  observer?.unobserve(state.heading);
}

function reveal(state) {
  if (state.done || state.animations.length) return;
  if (blocked() || !state.heading.animate) { settle(state); return; }
  // A heading already read while fonts or modules loaded is not replayed.
  if (state.visibleAtStart && performance.now() > 1800) { settle(state); return; }
  const split = splitLines(state.heading);
  if (!split) { settle(state); return; }
  state.split = split;
  state.heading.dataset.headingReveal = 'revealing';
  split.lines.forEach((entry, i) => {
    state.animations.push(entry.line.animate([
      {transform: 'translateY(103%)', opacity: .15},
      {transform: 'translateY(0)', opacity: 1}
    ], {duration: DURATION.heading, delay: i * DURATION.headingStagger, easing: EASE.heading, fill: 'both'}));
  });
  Promise.allSettled(state.animations.map(animation => animation.finished)).then(() => settle(state));
}

function scan() {
  scanFrame = 0;
  for (const heading of document.querySelectorAll(SELECTOR)) {
    if (states.has(heading) || !heading.textContent.trim()) continue;
    const rect = heading.getBoundingClientRect();
    const state = {heading, done: false, split: null, animations: [], visibleAtStart: rect.top < innerHeight && rect.bottom > 0};
    states.set(heading, state);
    heading.dataset.headingReveal = 'waiting';
    if (blocked() || !observer) settle(state); else observer.observe(heading);
  }
  for (const [heading, state] of states) if (!heading.isConnected) { settle(state); states.delete(heading); }
}

function syncPreference() {
  document.documentElement.dataset.headingRevealPaused = String(blocked());
  if (blocked()) for (const state of states.values()) settle(state);
}

export async function startHeadingReveal() {
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
    // Split just before the heading reaches the fold (12% early, about one wheel
    // notch), so its plain text is never on screen first and then blanked to replay.
  }, {threshold: 0, rootMargin: '0px 0px 12% 0px'});
  scan(); syncPreference();
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches?.(SELECTOR) || node.querySelector?.(SELECTOR))))) {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan);
    }
  }).observe(document.querySelector('main') || document.body, {subtree: true, childList: true});
  new MutationObserver(syncPreference).observe(document.body, {attributes: true, attributeFilter: ['class']});
  const toggle = document.querySelector('.motion-toggle');
  if (toggle) new MutationObserver(syncPreference).observe(toggle, {attributes: true, attributeFilter: ['aria-pressed']});
  reduced.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', syncPreference);
  // A resize or font swap restores the original flow instead of keeping stale lines.
  const settleRunning = () => { for (const state of states.values()) if (state.animations.length) settle(state); };
  addEventListener('resize', settleRunning, {passive: true});
  document.fonts?.addEventListener?.('loadingdone', settleRunning);
  document.documentElement.classList.add('heading-reveal-ready');
}
