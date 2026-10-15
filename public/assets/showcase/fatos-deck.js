/* Adapted from Ecossistema Fatos Baralho.tsx and data/data.json.
 * Source: onstandbyx-png/roblox b9c827082edc6e2076c864687451ae3d1a1dcf76.
 * Portfolio context deliberately shows editorial choices, not network metrics. */
import { clamp, createMotion } from '../sections/motion.js';
import { sectionCopy } from '../content/portfolio-copy.js';
const copy = sectionCopy('colecao');
const metadata = {
  "desconhecidos": {
    "short": "Desconhecidos",
    "handle": "@fatosdesconhecidos",
    "territory": "Curiosidades, ciência e histórias do cotidiano.",
    "color": "#4b91ff"
  },
  "esportes": {
    "short": "Esportes",
    "handle": "@fatosesportesbr",
    "territory": "Histórias, personagens e cultura do esporte.",
    "color": "#66c577"
  },
  "crencas": {
    "short": "Crenças",
    "handle": "@fatosecrencas",
    "territory": "Crenças, tradições e narrativas culturais.",
    "color": "#f2ae63"
  },
  "sobrenaturais": {
    "short": "Sobrenaturais",
    "handle": "@fatossobrenaturaisbr",
    "territory": "Mistérios, suspense e narrativas que despertam curiosidade.",
    "color": "#bec6d4"
  },
  "nerd": {
    "short": "Nerd",
    "handle": "@fatosnerdoficial",
    "territory": "Jogos, entretenimento e cultura pop.",
    "color": "#f1cd65"
  },
  "negocios": {
    "short": "Negócios",
    "handle": "@fatosenegocio",
    "territory": "Ideias, trajetórias e o mundo dos negócios.",
    "color": "#6bcba8"
  }
};
const brands = copy.cards.map(card => ({ ...card, ...metadata[card.id], approach: card.context }));
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assets = '/assets/portfolio/recovered-fatos/';
const make = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const $ = (selector, root) => root.querySelector(selector);

export function mountFatosDeck() {
  const anchor = document.querySelector('#editorial');
  if (!anchor) return null;
  const existing = anchor.querySelector('#colecao');
  if (existing) return existing;
  const motion = createMotion();
  const shell = make(`<section id="colecao" class="pf-fatos-deck shell" aria-label="Composições editoriais Fatos" data-active="0">
    <div class="pf-fatos-intro">
      <div class="pf-fatos-context"><span data-fatos-index>01 / 06</span><strong data-fatos-name></strong><h4 data-fatos-question></h4><p data-fatos-territory></p></div>
    </div>
    <div class="pf-fatos-display"><div class="pf-fatos-stage" role="region" aria-roledescription="carrossel" aria-label="Seis universos editoriais Fatos" tabindex="0"></div><div class="pf-fatos-navigation" role="group" aria-label="Navegar pelas composições"><button type="button" data-fatos-prev aria-label="Composição anterior"><span aria-hidden="true">←</span></button><p class="pf-fatos-counter" role="status" aria-live="polite"></p><button type="button" data-fatos-next aria-label="Próxima composição"><span aria-hidden="true">→</span></button></div></div>
  </section>`);
  const bottom = anchor.querySelector('.editorial-bottom');
  if (bottom) bottom.before(shell); else anchor.append(shell);
  const stage = $('.pf-fatos-stage', shell);
  let active = 0, drag = null, lastSwipe = -Infinity, arrival = null, settlement = null;
  const cards = brands.map((brand, i) => {
    const card = make(`<article class="pf-fatos-card" data-fatos-card="${brand.id}" aria-label="${i + 1} de ${brands.length}: ${brand.name}"><div class="pf-fatos-rotor"><div class="pf-fatos-face pf-fatos-front" data-fatos-front><img class="pf-fatos-art" src="${assets}cena-${brand.id}.webp" alt="Composição editorial de ${brand.name}" loading="lazy" decoding="async" width="720" height="1273" draggable="false"><div class="pf-fatos-shade" aria-hidden="true"></div><div class="pf-fatos-profile"><img src="${assets}avatar_${brand.id}.webp" alt="" width="48" height="48" loading="lazy" draggable="false"><div><strong>${brand.name}</strong><span>${brand.handle}</span></div></div><div class="pf-fatos-question"><span class="pf-fatos-rule" aria-hidden="true"></span><h4>${brand.question}</h4></div><button type="button" class="pf-fatos-flip" data-fatos-flip aria-expanded="false">${escape(copy.controls.front)} <span aria-hidden="true">↻</span></button></div><div class="pf-fatos-face pf-fatos-back" data-fatos-back aria-hidden="true" inert><div class="pf-fatos-back-heading"><img src="${assets}avatar_${brand.id}.webp" alt="" width="44" height="44" loading="lazy"><div><span>RECORTE EDITORIAL</span><h4>${brand.name}</h4></div></div><p class="pf-fatos-approach">${brand.approach}</p><div class="pf-fatos-formats"><span>DESDOBRAMENTOS</span><ul>${brand.formats.map(format => `<li>${format}</li>`).join('')}</ul></div><button type="button" class="pf-fatos-flip" data-fatos-return>${escape(copy.controls.back)} <span aria-hidden="true">↶</span></button></div></div></article>`);
    card.style.setProperty('--fatos-accent', brand.color);
    $('[data-fatos-flip]', card).addEventListener('click', () => flip(true, true));
    $('[data-fatos-return]', card).addEventListener('click', () => flip(false, true));
    stage.append(card); return card;
  });
  $('[data-fatos-prev]', shell).addEventListener('click', () => go(active - 1));
  $('[data-fatos-next]', shell).addEventListener('click', () => go(active + 1));
  function setFace(card, open) {
    card.classList.toggle('is-flipped', open);
    const front = $('[data-fatos-front]', card), back = $('[data-fatos-back]', card);
    front.inert = open; back.inert = !open;
    front.setAttribute('aria-hidden', String(open)); back.setAttribute('aria-hidden', String(!open));
    $('[data-fatos-flip]', card).setAttribute('aria-expanded', String(open));
  }
  function flip(open, moveFocus = false) {
    if (performance.now() - lastSwipe < 250) return;
    const card = cards[active]; setFace(card, open);
    if (moveFocus) $(open ? '[data-fatos-return]' : '[data-fatos-flip]', card).focus({ preventScroll: true });
  }
  function paint() {
    shell.dataset.active = String(active);
    cards.forEach((card, i) => {
      const position = (i - active + cards.length) % cards.length;
      card.dataset.position = String(position); card.classList.toggle('is-active', i === active);
      card.inert = i !== active; card.setAttribute('aria-hidden', String(i !== active)); setFace(card, false);
    });
    $('[data-fatos-index]', shell).textContent = String(active + 1).padStart(2, '0') + ' / 06';
    $('[data-fatos-name]', shell).textContent = brands[active].name;
    $('[data-fatos-question]', shell).textContent = brands[active].question;
    $('[data-fatos-territory]', shell).textContent = brands[active].approach;
    $('.pf-fatos-counter', shell).textContent = (active + 1) + ' de 6 · ' + brands[active].short;
  }
  function go(index, released = null) {
    const next = (index + brands.length) % brands.length;
    if (next === active) return;
    const hadCardFocus = cards[active].contains(document.activeElement);
    const direction = (next - active + brands.length) % brands.length <= brands.length / 2 ? 1 : -1;
    arrival?.cancel(); settlement?.cancel();
    const previous = cards[active], from = released?.transform;
    cancelDrag(false);
    active = next; paint();
    if (from) {
      previous.style.transition = 'none';
      const destination = getComputedStyle(previous).transform;
      previous.style.removeProperty('transition');
      settlement = motion.animate(previous, [{ transform: from, opacity: 1 }, { transform: destination, opacity: getComputedStyle(previous).opacity }], { duration: 360 });
    }
    arrival = motion.spring(cards[active], progress => ({ opacity: clamp(progress, .4, 1), transform: `translateX(${(1 - progress) * direction * 42}px) rotate(${(1 - progress) * direction * 5}deg)` }), { duration: 560 });
    if (hadCardFocus) $('[data-fatos-flip]', cards[active]).focus({ preventScroll: true });
  }
  shell.addEventListener('keydown', event => {
    const destinations = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: brands.length - 1 };
    if (event.key in destinations) { event.preventDefault(); go(destinations[event.key]); }
    if (event.key === 'Escape' && cards[active].classList.contains('is-flipped')) { event.preventDefault(); flip(false, true); }
  });
  function cancelDrag(animate = true) {
    const current = drag;
    drag = null; delete stage.dataset.dragging;
    if (!current) return;
    const from = current.card.style.transform;
    current.card.style.removeProperty('transform');
    current.card.style.removeProperty('transition');
    if (stage.hasPointerCapture?.(current.id)) stage.releasePointerCapture(current.id);
    if (animate && current.axis === 'horizontal' && from) {
      settlement?.cancel();
      settlement = motion.spring(current.card, progress => ({ transform: `translateX(${current.offset * (1 - progress)}px) rotate(${current.rotation * (1 - progress)}deg)` }), { duration: 380, name: 'smooth' });
    }
  }
  stage.addEventListener('pointerdown', event => {
    if (drag || !event.isPrimary || event.target.closest('button, a') || !event.target.closest('.pf-fatos-card.is-active') || (event.pointerType === 'mouse' && event.button !== 0)) return;
    arrival?.finish(); settlement?.finish();
    const card = cards[active];
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId, card, axis: null, width: card.getBoundingClientRect().width, offset: 0, rotation: 0 };
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.axis) {
      // Vertical intent belongs entirely to the document. A tap never captures.
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.1) { cancelDrag(false); return; }
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
      drag.axis = 'horizontal'; stage.dataset.dragging = 'true';
      drag.card.style.transition = 'none'; stage.setPointerCapture?.(event.pointerId);
    }
    if (event.cancelable) event.preventDefault();
    // Drag follows the finger within one card, with resistance near the edge.
    const limit = drag.width * .3;
    drag.offset = Math.sign(dx) * limit * (1 - Math.exp(-Math.abs(dx) / limit));
    drag.rotation = drag.offset / drag.width * 8;
    drag.card.style.transform = `translateX(${drag.offset}px) rotate(${drag.rotation}deg)`;
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const current = drag, dx = event.clientX - current.x, dy = event.clientY - current.y;
    const threshold = Math.max(42, Math.min(72, current.width * .22));
    const deliberate = current.axis === 'horizontal' && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.25;
    if (deliberate) {
      lastSwipe = performance.now();
      const transform = current.card.style.transform;
      go(active + (dx < 0 ? 1 : -1), { transform });
    } else cancelDrag(true);
  });
  stage.addEventListener('pointercancel', () => cancelDrag(true));
  stage.addEventListener('lostpointercapture', event => { if (event.target === stage) cancelDrag(true); });
  stage.addEventListener('pointerleave', () => { if (drag && !drag.axis) cancelDrag(false); });
  stage.addEventListener('click', event => { if (performance.now() - lastSwipe < 300) { event.preventDefault(); event.stopPropagation(); } }, true);
  motion.onStop(() => cancelDrag(false));
  paint(); shell.dataset.ready = 'true'; return shell;
}
