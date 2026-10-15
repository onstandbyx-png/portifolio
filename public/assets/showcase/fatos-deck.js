/* Adapted from Ecossistema Fatos Baralho.tsx and data/data.json.
 * Source: onstandbyx-png/roblox b9c827082edc6e2076c864687451ae3d1a1dcf76.
 * Portfolio context deliberately shows editorial choices, not network metrics. */
import { clamp, createMotion } from '../sections/motion.js';
const brands = [
  {
    "id": "desconhecidos",
    "name": "Fatos Desconhecidos",
    "short": "Desconhecidos",
    "handle": "@fatosdesconhecidos",
    "question": "Por que isso faz parte do seu dia?",
    "territory": "Curiosidades, ciência e histórias do cotidiano.",
    "approach": "Uma pergunta familiar abre espaço para explicar uma ideia, um produto ou um assunto com contexto.",
    "formats": [
      "Vídeo explicativo",
      "Recortes de dúvidas",
      "Carrossel editorial"
    ],
    "color": "#4b91ff"
  },
  {
    "id": "esportes",
    "name": "Fatos Esportes",
    "short": "Esportes",
    "handle": "@fatosesportesbr",
    "question": "O que acontece antes do apito?",
    "territory": "Histórias, personagens e cultura do esporte.",
    "approach": "Histórias e bastidores contextualizam uma marca sem depender só do resultado do jogo.",
    "formats": [
      "Quadro de curiosidades",
      "Narrativa de bastidores",
      "Série temática"
    ],
    "color": "#66c577"
  },
  {
    "id": "crencas",
    "name": "Fatos e Crenças",
    "short": "Crenças",
    "handle": "@fatosecrencas",
    "question": "Que história existe por trás dessa tradição?",
    "territory": "Crenças, tradições e narrativas culturais.",
    "approach": "Narrativas com referências, escuta e cuidado com diferentes contextos culturais.",
    "formats": [
      "Conteúdo explicativo",
      "Série cultural",
      "Projeto temático"
    ],
    "color": "#f2ae63"
  },
  {
    "id": "sobrenaturais",
    "name": "Fatos Sobrenaturais",
    "short": "Sobrenaturais",
    "handle": "@fatossobrenaturaisbr",
    "question": "O que sabemos sobre essa história?",
    "territory": "Mistérios, suspense e narrativas que despertam curiosidade.",
    "approach": "Conduzir a curiosidade separando relato, hipótese e evidência.",
    "formats": [
      "Narrativa temática",
      "Quadro especial",
      "Roteiro de investigação editorial"
    ],
    "color": "#bec6d4"
  },
  {
    "id": "nerd",
    "name": "Fatos Nerd",
    "short": "Nerd",
    "handle": "@fatosnerdoficial",
    "question": "O que mantém uma história em conversa?",
    "territory": "Jogos, entretenimento e cultura pop.",
    "approach": "Relacionar a mensagem aos assuntos do entretenimento, com a linguagem de quem acompanha o tema.",
    "formats": [
      "Quadro especial",
      "Explicação de um tema",
      "Desdobramentos de lançamento"
    ],
    "color": "#f1cd65"
  },
  {
    "id": "negocios",
    "name": "Fatos e Negócios",
    "short": "Negócios",
    "handle": "@fatosenegocio",
    "question": "O que precisa ficar mais simples?",
    "territory": "Ideias, trajetórias e o mundo dos negócios.",
    "approach": "Tornar compreensível o problema, a solução e o contexto em que ela é útil.",
    "formats": [
      "História de empresa",
      "Conteúdo explicativo",
      "Série temática"
    ],
    "color": "#6bcba8"
  }
];
const assets = '/assets/portfolio/recovered-fatos/';
const make = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const $ = (selector, root) => root.querySelector(selector);

export function mountFatosDeck() {
  const anchor = document.querySelector('#editorial');
  if (!anchor) return null;
  const existing = anchor.querySelector('#colecao');
  if (existing) return existing;
  const motion = createMotion();
  const shell = make(`<section id="colecao" class="pf-fatos-deck shell" aria-labelledby="pf-fatos-title" data-active="0">
    <div class="pf-fatos-intro"><span class="pf-fatos-kicker">SEIS UNIVERSOS / UMA CURIOSIDADE</span><h3 id="pf-fatos-title">Cada história pede<br>um novo olhar.</h3><p>Ciência, esporte, cultura, mistério, entretenimento e negócios. Explore como a pergunta, o repertório e a linguagem mudam em cada universo.</p><div class="pf-fatos-context"><span data-fatos-index>01 / 06</span><strong data-fatos-name></strong><p data-fatos-territory></p></div><p class="pf-fatos-hint">Vire a peça para conhecer o recorte editorial.</p></div>
    <div class="pf-fatos-display"><div class="pf-fatos-stage" role="region" aria-roledescription="carrossel" aria-label="Seis universos editoriais Fatos" tabindex="0"></div><div class="pf-fatos-controls"><button type="button" data-fatos-prev aria-label="Universo anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div class="pf-fatos-pips" role="group" aria-label="Escolher universo editorial"></div><button type="button" data-fatos-next aria-label="Próximo universo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div><p class="pf-fatos-counter" role="status" aria-live="polite"></p></div>
    <p class="pf-fatos-source">Artes e identidade do mídia kit Ecossistema Fatos. Peças demonstrativas.</p>
  </section>`);
  const bottom = anchor.querySelector('.editorial-bottom');
  if (bottom) bottom.before(shell); else anchor.append(shell);
  const stage = $('.pf-fatos-stage', shell), pips = $('.pf-fatos-pips', shell);
  let active = 0, drag = null, lastSwipe = 0, arrival = null;
  const cards = brands.map((brand, i) => {
    const card = make(`<article class="pf-fatos-card" data-fatos-card="${brand.id}" aria-label="${i + 1} de ${brands.length}: ${brand.name}"><div class="pf-fatos-rotor"><div class="pf-fatos-face pf-fatos-front" data-fatos-front><img class="pf-fatos-art" src="${assets}cena-${brand.id}.webp" alt="Composição editorial de ${brand.name}" loading="lazy" decoding="async" width="720" height="1273" draggable="false"><div class="pf-fatos-shade" aria-hidden="true"></div><div class="pf-fatos-profile"><img src="${assets}avatar_${brand.id}.webp" alt="" width="48" height="48" loading="lazy" draggable="false"><div><strong>${brand.name}</strong><span>${brand.handle}</span></div></div><div class="pf-fatos-question"><span class="pf-fatos-rule" aria-hidden="true"></span><h4>${brand.question}</h4></div><button type="button" class="pf-fatos-flip" data-fatos-flip aria-expanded="false">Ver o contexto <span aria-hidden="true">↻</span></button></div><div class="pf-fatos-face pf-fatos-back" data-fatos-back aria-hidden="true" inert><div class="pf-fatos-back-heading"><img src="${assets}avatar_${brand.id}.webp" alt="" width="44" height="44" loading="lazy"><span>POR TRÁS DA PERGUNTA</span></div><h4>${brand.name}</h4><p class="pf-fatos-approach">${brand.approach}</p><div class="pf-fatos-formats"><span>DESDOBRAMENTOS</span><ul>${brand.formats.map(format => `<li>${format}</li>`).join('')}</ul></div><button type="button" class="pf-fatos-flip" data-fatos-return>Voltar à peça <span aria-hidden="true">↶</span></button></div></div></article>`);
    card.style.setProperty('--fatos-accent', brand.color);
    $('[data-fatos-flip]', card).addEventListener('click', () => flip(true, true));
    $('[data-fatos-return]', card).addEventListener('click', () => flip(false, true));
    stage.append(card); return card;
  });
  const selectors = brands.map((brand, i) => {
    const button = make(`<button type="button" data-fatos-select="${i}" aria-label="Selecionar ${brand.name}" aria-pressed="false"><img src="${assets}avatar_${brand.id}.webp" alt="" width="32" height="32" loading="lazy"></button>`);
    button.style.setProperty('--fatos-accent', brand.color);
    button.addEventListener('click', () => go(i)); pips.append(button); return button;
  });
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
    selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    $('[data-fatos-index]', shell).textContent = String(active + 1).padStart(2, '0') + ' / 06';
    $('[data-fatos-name]', shell).textContent = brands[active].name;
    $('[data-fatos-territory]', shell).textContent = brands[active].territory;
    $('.pf-fatos-counter', shell).textContent = (active + 1) + ' de 6 · ' + brands[active].short;
  }
  function go(index) {
    const next = (index + brands.length) % brands.length;
    if (next === active) return;
    const hadCardFocus = cards[active].contains(document.activeElement);
    const direction = (next - active + brands.length) % brands.length <= brands.length / 2 ? 1 : -1;
    arrival?.cancel(); active = next; paint();
    arrival = motion.spring(cards[active], progress => ({ opacity: clamp(progress, .4, 1), transform: `translateX(${(1 - progress) * direction * 42}px) rotate(${(1 - progress) * direction * 5}deg)` }), { duration: 560 });
    if (hadCardFocus) $('[data-fatos-flip]', cards[active]).focus({ preventScroll: true });
  }
  $('[data-fatos-prev]', shell).addEventListener('click', () => go(active - 1));
  $('[data-fatos-next]', shell).addEventListener('click', () => go(active + 1));
  shell.addEventListener('keydown', event => {
    const destinations = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: brands.length - 1 };
    if (event.key in destinations) { event.preventDefault(); go(destinations[event.key]); if (event.target.closest('.pf-fatos-pips')) selectors[active].focus({ preventScroll: true }); }
    if (event.key === 'Escape' && cards[active].classList.contains('is-flipped')) { event.preventDefault(); flip(false, true); }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button, a') || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y; drag = null;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) { lastSwipe = performance.now(); go(active + (dx < 0 ? 1 : -1)); }
  });
  stage.addEventListener('pointercancel', () => { drag = null; });
  stage.addEventListener('lostpointercapture', () => { drag = null; });
  paint(); shell.dataset.ready = 'true'; return shell;
}
