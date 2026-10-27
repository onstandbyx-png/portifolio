/* Mural de jornadas, logo depois do hero: quadros reais dos fluxos (capturados por scripts/capture-mural.mjs,
   lista em /assets/portfolio/mural/mural.json), cada um com link para o formato no laboratório
   (#laboratorio/<canal>/<formato>) ou para a automação (#sistemas/<chave>). A marca de cada cartão vem de
   marcas.js. Faixa arrastável (ponteiro e toque), scroll-snap, setas do teclado e rolagem lenta automática,
   que para em hover, foco, toque, movimento reduzido, body.is-paused, aba oculta ou fora da tela. Abaixo, os
   16 canais, com os logos oficiais de channel-logos.js. */
import { CLIENTES, MARCAS } from '/assets/showcase/marcas.js';
import { logoSvg, CHANNEL_LOGO } from '/assets/showcase/channel-logos.js';

const DADOS = '/assets/portfolio/mural/mural.json';
const VELOCIDADE = 22; // px por segundo
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

/* Os 16 canais do laboratório, na ordem da grade. Sem logo oficial, um glifo de traço sobre a cor do grupo. */
const CANAIS = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['linkedin', 'LinkedIn'],
  ['google', 'Google Ads'], ['seo', 'Busca orgânica'], ['chatgpt', 'ChatGPT'], ['maps', 'Google Maps'], ['whatsapp', 'WhatsApp'],
  ['telegram', 'Telegram'], ['rcs', 'RCS', 'chat', '#2b7650'], ['voz', 'Voz com IA', 'fone', '#2b7650'],
  ['pix', 'Pix Automático', 'ciclo', '#a3482b'], ['email', 'E-mail', 'carta', '#a3482b'], ['blog', 'Publieditorial', 'doc', '#7a5a24']];
const GLIFO = {
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  fone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  ciclo: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>',
  carta: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  doc: '<path d="M6 3.5h8l4 4V20.5H6zM14 3.5v4h4M9 12h6M9 15.5h6"/>',
};
const glifo = n => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${GLIFO[n]}</svg>`;
const SETA = '<svg class="mu-seta" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';
const ICONE = {
  prev: '<path d="m15 18-6-6 6-6"/>', next: '<path d="m9 18 6-6-6-6"/>',
  pausa: '<path d="M9 5v14M15 5v14"/>', toca: '<path d="M7 4.5v15l12-7.5z"/>',
};
const icone = n => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONE[n]}</svg>`;

function cartao(q, i, clone) {
  const c = CLIENTES[q.cliente];
  if (!c) return '';
  const alt = `Tela de ${q.rotulo} da ${c.marca}, fictícia: ${q.etapa.toLowerCase()}.`;
  const attrs = clone ? ' aria-hidden="true" data-mu-clone' : '';
  return `<li class="mu-card"${attrs}><a class="mu-link" href="${esc(q.href)}" data-canal="${esc(q.canal)}" data-formato="${esc(q.formato)}" draggable="false" tabindex="${!clone && i === 0 ? 0 : -1}">
    <span class="mu-tela"><img src="${esc(q.src)}" width="${q.w}" height="${q.h}" alt="${clone ? '' : esc(alt)}" loading="lazy" decoding="async" fetchpriority="low" draggable="false"></span>
    <span class="mu-leg"><span class="mu-marca" style="--c:${esc(c.cor)}" aria-hidden="true">${MARCAS[q.cliente]}</span><span class="mu-txt"><b>${esc(c.marca)}</b><span>${esc(q.rotulo)} · ${esc(q.etapa)}</span></span>${SETA}</span></a></li>`;
}
function logos() {
  return CANAIS.map(([id, nome, g, cor]) => {
    const logo = CHANNEL_LOGO[id] ? logoSvg(CHANNEL_LOGO[id], { altura: 20 }) : `<span class="mu-glifo" style="--g:${cor}">${glifo(g)}</span>`;
    return `<li><a class="mu-logo" href="#laboratorio/${id}" data-canal="${id}" aria-label="${esc(nome)}" title="${esc(nome)}">${logo}</a></li>`;
  }).join('');
}

export async function mountMural() {
  const root = document.getElementById('mural');
  if (!root || root.dataset.muReady) return;
  root.dataset.muReady = 'true';
  let lista;
  try { lista = await (await fetch(DADOS)).json(); } catch { root.hidden = true; return; }
  lista = lista.filter(q => CLIENTES[q.cliente]);
  if (!lista.length) { root.hidden = true; return; }
  const loop = !reduced.matches;
  root.insertAdjacentHTML('beforeend', `<div class="mu" data-mu>
    <div class="mu-head"><p class="mu-kicker" aria-hidden="true">Jornadas em andamento</p>
      <p class="mu-sub">Telas dos exemplos desta página. Toque numa para ver a jornada inteira.</p>
      <div class="mu-ctl"><button type="button" class="mu-btn" data-mu-prev aria-label="Tela anterior">${icone('prev')}</button><button type="button" class="mu-btn" data-mu-pausa aria-pressed="false" aria-label="Pausar a rolagem"${loop ? '' : ' hidden'}>${icone('pausa')}</button><button type="button" class="mu-btn" data-mu-next aria-label="Próxima tela">${icone('next')}</button></div></div>
    <ul class="mu-strip" data-mu-strip aria-label="Telas das jornadas: use as setas para trocar">${lista.map((q, i) => cartao(q, i, false)).join('')}${loop ? lista.map((q, i) => cartao(q, i, true)).join('') : ''}</ul>
    <nav class="mu-canais" aria-label="Os 16 canais dos exemplos"><p class="mu-canais-tit" aria-hidden="true">16 canais</p><ul class="mu-logos">${logos()}</ul></nav></div>`);

  const strip = root.querySelector('[data-mu-strip]'), pausa = root.querySelector('[data-mu-pausa]');
  const cards = [...strip.querySelectorAll('.mu-card:not([data-mu-clone]) .mu-link')];
  const passo = () => { const [a, b] = strip.querySelectorAll('.mu-card'); return b ? b.offsetLeft - a.offsetLeft : strip.clientWidth; };
  const volta = () => { const clone = strip.querySelector('[data-mu-clone]'); return clone ? clone.offsetLeft - strip.firstElementChild.offsetLeft : Infinity; };

  /* Rolagem automática: um quadro de animação por vez, com a posição em ponto flutuante. */
  let pos = strip.scrollLeft, ultimo = 0, raf = 0, hover = false, foco = false, toque = 0, visivel = false, arrastando = false;
  const parado = () => !loop || reduced.matches || document.body.classList.contains('is-paused') || document.hidden ||
    pausa.getAttribute('aria-pressed') === 'true' || hover || foco || arrastando || !visivel || performance.now() < toque;
  function tique(t) {
    raf = 0;
    if (parado()) { strip.classList.remove('is-auto'); return; }
    strip.classList.add('is-auto');
    if (Math.abs(strip.scrollLeft - pos) > 2) pos = strip.scrollLeft; // a pessoa rolou: segue de onde ela deixou
    pos += Math.min(64, t - (ultimo || t)) * VELOCIDADE / 1000;
    const v = volta();
    if (pos >= v) pos -= v;
    strip.scrollLeft = pos;
    ultimo = t;
    raf = requestAnimationFrame(tique);
  }
  const anda = () => { if (!raf && !parado()) { ultimo = 0; pos = strip.scrollLeft; raf = requestAnimationFrame(tique); } };
  const segura = (ms = 4000) => { toque = performance.now() + ms; strip.classList.remove('is-auto'); setTimeout(anda, ms + 30); };

  /* Setas e botões: um cartão por vez. No teclado, o foco anda entre os cartões (tabindex móvel). */
  const ir = (link, focar) => {
    cards.forEach(a => { a.tabIndex = a === link ? 0 : -1; });
    if (focar) link.focus({ preventScroll: true });
    const alvo = link.parentElement.offsetLeft - strip.firstElementChild.offsetLeft;
    strip.scrollTo({ left: alvo, behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  const atual = () => {
    const x = strip.scrollLeft + strip.firstElementChild.offsetLeft;
    let k = cards.findIndex(a => a.parentElement.offsetLeft >= x - 4);
    if (k < 0) k = 0;
    return k;
  };
  const move = d => { segura(); ir(cards[(atual() + d + cards.length) % cards.length], false); };
  root.querySelector('[data-mu-prev]').addEventListener('click', () => move(-1));
  root.querySelector('[data-mu-next]').addEventListener('click', () => move(1));
  pausa.addEventListener('click', () => {
    const p = pausa.getAttribute('aria-pressed') !== 'true';
    pausa.setAttribute('aria-pressed', String(p));
    pausa.setAttribute('aria-label', p ? 'Continuar a rolagem' : 'Pausar a rolagem');
    pausa.innerHTML = icone(p ? 'toca' : 'pausa');
    if (!p) anda();
  });
  strip.addEventListener('keydown', event => {
    const link = event.target.closest('.mu-link'), k = cards.indexOf(link);
    if (k < 0) return;
    const n = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: cards.length - 1 }[event.key];
    if (n === undefined) return;
    event.preventDefault();
    ir(cards[(n + cards.length) % cards.length], true);
  });

  /* Arrastar com o mouse; o toque usa a rolagem nativa com scroll-snap. Um arraste não vira clique. */
  let inicio = null, moveu = false;
  strip.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) { segura(); return; }
    inicio = { x: event.clientX, left: strip.scrollLeft, id: event.pointerId }; moveu = false;
  });
  strip.addEventListener('pointermove', event => {
    if (!inicio || event.pointerId !== inicio.id) return;
    const dx = event.clientX - inicio.x;
    if (!moveu && Math.abs(dx) < 5) return;
    if (!moveu) { moveu = true; arrastando = true; strip.classList.add('is-drag'); strip.setPointerCapture(inicio.id); }
    strip.scrollLeft = inicio.left - dx;
  });
  const solta = () => {
    if (!inicio) return;
    inicio = null;
    if (!moveu) return;
    strip.classList.remove('is-drag'); arrastando = false;
    ir(cards[atual() % cards.length] || cards[0], false);
    segura(2500);
  };
  strip.addEventListener('pointerup', solta);
  strip.addEventListener('pointercancel', solta);
  strip.addEventListener('click', event => { if (moveu) { event.preventDefault(); event.stopPropagation(); moveu = false; } }, true);
  strip.addEventListener('dragstart', event => event.preventDefault());
  strip.addEventListener('wheel', event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) segura(); }, { passive: true });
  // Volta ao primeiro conjunto quando a rolagem manual para entre os clones (mesma imagem, sem salto visível).
  strip.addEventListener('scrollend', () => { if (strip.classList.contains('is-auto')) return; const v = volta(); if (strip.scrollLeft >= v) strip.scrollLeft -= v; });

  /* Abrir: o hash novo segue o link; o mesmo hash de novo reabre pelo evento cx:abrir ou por um hashchange. */
  root.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || location.hash !== link.getAttribute('href')) return;
    event.preventDefault();
    const { canal, formato } = link.dataset, lab = document.querySelector('#laboratorio .cx-player');
    if (link.getAttribute('href').startsWith('#laboratorio') && lab) window.dispatchEvent(new CustomEvent('cx:abrir', { detail: { canal, formato } }));
    else window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL: location.href, newURL: location.href }));
  });

  strip.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hover = true; } });
  strip.addEventListener('pointerleave', () => { hover = false; anda(); });
  root.addEventListener('focusin', () => { foco = true; });
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) { foco = false; anda(); } });
  new MutationObserver(anda).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', anda);
  reduced.addEventListener('change', anda);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visivel = e.isIntersecting; anda(); }, { threshold: .15 }).observe(strip);
  else { visivel = true; anda(); }
}
export default mountMural;
