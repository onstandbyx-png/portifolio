/* Two demonstrations of the home, "Sistemas e automações" and "Sites e lojas", cut
   from the lab's own storyboards: the same iPhone, mocks and frames as "Sua oferta.
   Em cada canal.", one flow each. The phone plays once when it comes into view and
   stops on its last frame; the steps jump to a part of the flow. Without motion
   (reduced motion, hidden tab, no IntersectionObserver) nothing plays by itself: the
   button shows the next frame. The markup is in index.html: <div data-vitrine="...">. */
import { channelById, renderMock } from './campaign-channels.js';

/* from and to are indexes of the placement's frames (inclusive). The steps are
   [label, first, last] in the cut's own indexes. */
const DEMOS = {
  automacao: { channel: 'whatsapp', placement: 'catalog', from: 4, to: 13,
    steps: [['Pedido no carrinho', 0, 1], ['Atendimento automático', 2, 6], ['Confirmação', 7, 9]] },
  loja: { channel: 'tiktok', placement: 'infeed', from: 3, to: 12,
    steps: [['Produto', 0, 2], ['Carrinho', 3, 5], ['Pagamento e pedido', 6, 9]] },
};
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

/* The player's frame rules (experience-player.js, applyFrame), without the point and the finger. */
function apply(screen, list, index) {
  const item = list[index];
  screen.dataset.frame = String(index);
  screen.dataset.scene = item.cena;
  const kept = {};
  for (let k = 0; k < index; k++) if (list[k].cena !== item.cena) kept[list[k].cena] = list[k].estado || '';
  screen.dataset.state = [...Object.values(kept), item.estado || ''].join(' ').replace(/\s+/g, ' ').trim();
  delete screen.dataset.tap;
  const scenes = [...screen.querySelectorAll('.cm-scene')];
  const current = scenes.find(node => node.dataset.scene === item.cena) || scenes[0];
  let previous = null;
  for (let k = index - 1; k >= 0; k--) if (list[k].cena !== item.cena) { previous = list[k].cena; break; }
  const kind = current.dataset.kind;
  screen.dataset.enter = kind;
  scenes.forEach(node => { node.dataset.pos = node === current ? 'on' : (kind === 'push' || kind === 'sheet') && node.dataset.scene === previous ? 'under' : 'off'; });
  if (item.toque) screen.dataset.tap = item.toque;
}

function mountOne(root) {
  const demo = DEMOS[root.dataset.vitrine];
  const placement = channelById(demo.channel).placements.find(item => item.id === demo.placement);
  const frames = placement.quadros.slice(demo.from, demo.to + 1);
  root.innerHTML = `<div class="vitrine-phone">${renderMock(placement)}</div>
    <div class="vitrine-side">
      <ol class="vitrine-steps">${demo.steps.map(([label], k) => `<li><button type="button" data-vitrine-step="${k}"><span aria-hidden="true">${k + 1}</span>${label}</button></li>`).join('')}</ol>
      <p class="vitrine-caption" data-caption></p>
      <button type="button" class="vitrine-play" data-play>Reproduzir</button>
      <p class="vitrine-nota">Exemplo ilustrativo, marca fictícia. Interface aproximada.</p>
    </div>`;
  const screen = root.querySelector('.cm-screen');
  const play = root.querySelector('[data-play]');
  const caption = root.querySelector('[data-caption]');
  const steps = [...root.querySelectorAll('[data-vitrine-step]')];
  const last = frames.length - 1;
  let index = 0, timer = 0, playing = false, started = false;

  function stepOf(i) { return demo.steps.findIndex(([, first, end]) => i >= first && i <= end); }
  function label() {
    play.textContent = playing ? 'Pausar' : index >= last ? 'Rever' : reduce.matches ? 'Próximo quadro' : 'Reproduzir';
  }
  function show(i) {
    index = Math.max(0, Math.min(last, i));
    screen.classList.add('is-instant');
    apply(screen, frames, index);
    requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.remove('is-instant')));
    caption.textContent = frames[index].desc;
    const current = stepOf(index);
    steps.forEach((button, k) => { if (k === current) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
    label();
  }
  function tick() {
    clearTimeout(timer);
    if (!playing) return;
    if (index >= last) { playing = false; label(); return; }
    timer = setTimeout(() => { show(index + 1); tick(); }, frames[index].ms);
  }
  function go(on) {
    playing = on && !reduce.matches;
    if (playing && index >= last) show(0);
    tick();
    label();
  }

  play.addEventListener('click', () => {
    if (reduce.matches) { show(index >= last ? 0 : index + 1); return; }
    go(!playing);
  });
  steps.forEach((button, k) => button.addEventListener('click', () => { go(false); show(demo.steps[k][1]); }));

  show(0);
  // Plays once when the phone comes into view; leaving the view pauses it.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started && !reduce.matches) { started = true; go(true); }
      else if (!entry.isIntersecting) go(false);
    }, { threshold: .4 }).observe(root);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) go(false); });
}

export function mountVitrine() {
  document.querySelectorAll('[data-vitrine]:not([data-vitrine-ready])').forEach(root => {
    root.dataset.vitrineReady = 'true';
    mountOne(root);
  });
}
