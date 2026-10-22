/* Two demonstrations of the home, "Sites e lojas" and "Sistemas e automações". Each one
   has a selector of formats, like "Sua oferta. Em cada canal.", and each format is a cut
   of a storyboard that already exists in the lab (campaign-channels.js), on the same
   iPhone. Every format says which screen of the campaign section it repeats. The phone
   plays once when it comes into view and stops on its last frame; the steps jump to a
   part of the flow. Without motion (reduced motion, hidden tab, no IntersectionObserver)
   nothing plays by itself: the button shows the next frame. Markup: index.html,
   <div class="vitrine lab-escopo" data-vitrine="sites|sistemas">. */
import { channelById, renderMock } from './campaign-channels.js';

/* from and to are indexes of the placement's frames (inclusive). The steps are
   [label, first, last] in the cut's own indexes. */
const DEMOS = {
  sites: [
    { label: 'Site', channel: 'instagram', placement: 'explorar', from: 4, to: 12, repete: 'Instagram · Explorar', inicio: true,
      steps: [['Serviço', 0, 2], ['Horário', 3, 5], ['Confirmação', 6, 8]] },
    { label: 'Loja', channel: 'tiktok', placement: 'infeed', from: 3, to: 12, repete: 'TikTok · In-Feed', inicio: true,
      steps: [['Produto', 0, 2], ['Carrinho', 3, 5], ['Pagamento e pedido', 6, 9]] },
    { label: 'Landing', channel: 'instagram', placement: 'feed', from: 4, to: 13, repete: 'Instagram · Feed', inicio: true,
      steps: [['Oferta', 0, 0], ['Teste de nível', 1, 3], ['Horário e confirmação', 4, 9]] },
    { label: 'Publieditorial', channel: 'blog', placement: 'article', from: 0, to: 10, repete: 'Publieditorial · Artigo',
      steps: [['Leitura', 0, 2], ['Agenda', 3, 7], ['Confirmação', 8, 10]] },
  ],
  sistemas: [
    { label: 'Pedido', channel: 'whatsapp', placement: 'catalog', from: 4, to: 13, repete: 'WhatsApp Business · Catálogo',
      steps: [['Pedido no carrinho', 0, 1], ['Atendimento automático', 2, 6], ['Confirmação', 7, 9]] },
    { label: 'Atendimento', channel: 'whatsapp', placement: 'ctwa', from: 3, to: 13, repete: 'WhatsApp Business · Clique para conversar', inicio: true,
      steps: [['Conversa pronta', 0, 1], ['Opções', 2, 6], ['Agendamento', 7, 10]] },
    { label: 'E-mail', channel: 'blog', placement: 'article', from: 3, to: 10, repete: 'Publieditorial · Artigo (agenda)', inicio: true,
      steps: [['Agenda', 0, 3], ['Dados', 4, 5], ['Confirmação por e-mail', 6, 7]] },
  ],
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
  const formats = DEMOS[root.dataset.vitrine];
  // The lab's own controls: segmented formats with a sliding thumb and the three-step journey (experience-demos.css).
  root.innerHTML = `<div class="cx-placements vitrine-formatos" role="group" aria-label="Formato"><span class="cx-thumb is-instant" aria-hidden="true"></span>${formats.map((f, k) => `<button type="button" class="cx-placement" data-formato="${k}" aria-pressed="${k === 0}">${f.label}</button>`).join('')}</div>
    <div class="vitrine-phone" data-phone></div>
    <div class="vitrine-side cx-steps">
      <ol class="cx-journey" data-steps aria-label="Jornada em 3 passos"></ol>
    </div>`;
  const $ = selector => root.querySelector(selector);
  const play = document.createElement('button'), caption = {}, nota = {};
  let demo = null, all = [], frames = [], screen = null, index = 0, timer = 0, playing = false, started = false;
  const last = () => frames.length - 1;

  function thumb() {
    const knob = root.querySelector('.cx-thumb'), on = root.querySelector('[data-formato][aria-pressed="true"]');
    if (!knob || !on || !on.offsetWidth) return;
    knob.style.width = on.offsetWidth + 'px';
    knob.style.transform = `translateX(${on.offsetLeft}px)`;
    const row = knob.parentElement;
    if (on.offsetLeft < row.scrollLeft || on.offsetLeft + on.offsetWidth > row.scrollLeft + row.clientWidth) row.scrollLeft = on.offsetLeft - 8;
    if (knob.classList.contains('is-instant')) requestAnimationFrame(() => requestAnimationFrame(() => knob.classList.remove('is-instant')));
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => thumb()).observe(root);
  function stepOf(i) { return demo.steps.findIndex(([, first, end]) => i >= first && i <= end); }
  function label() {
    play.textContent = playing ? 'Pausar' : index >= last() ? 'Rever' : reduce.matches ? 'Próximo quadro' : 'Reproduzir';
  }
  function show(i) {
    index = Math.max(0, Math.min(last(), i));
    screen.classList.add('is-instant');
    apply(screen, all, demo.from + index);
    requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.remove('is-instant')));
    caption.textContent = all[demo.from + index].desc;
    const current = stepOf(index);
    root.querySelectorAll('[data-vitrine-step]').forEach(button => {
      const s = Number(button.dataset.vitrineStep), [, first, end] = demo.steps[s];
      button.parentElement.dataset.state = s < current ? 'done' : s === current ? 'on' : 'next';
      button.querySelector('[data-rail]').style.setProperty('--p', s < current ? 1 : s > current ? 0 : ((index - first + 1) / (end - first + 1)).toFixed(3));
      if (s === current) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    label();
  }
  function tick() {
    clearTimeout(timer);
    if (!playing) return;
    if (index >= last()) { playing = false; label(); return; }
    timer = setTimeout(() => { show(index + 1); tick(); }, frames[index].ms);
  }
  function go(on) {
    playing = on && !reduce.matches;
    if (playing && index >= last()) show(0);
    tick();
    label();
  }
  function load(k) {
    go(false);
    demo = formats[k];
    const placement = channelById(demo.channel).placements.find(item => item.id === demo.placement);
    all = placement.quadros;
    frames = all.slice(demo.from, demo.to + 1);
    $('[data-phone]').innerHTML = renderMock(placement);
    screen = $('.cm-screen');
    $('[data-steps]').innerHTML = demo.steps.map(([text], s) => `<li data-state="next"><button type="button" data-vitrine-step="${s}"><span class="cx-step-n" aria-hidden="true">${s + 1}</span><span class="cx-step-t"><b>${text}</b></span><i class="cx-rail" aria-hidden="true"><i data-rail></i></i></button></li>`).join('');
    root.querySelectorAll('[data-formato]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.formato) === k)));
    requestAnimationFrame(thumb);
    const inicio = demo.inicio ? 'Começa no destino do anúncio: o selo Patrocinado aparece na seção de campanhas. ' : '';
    nota.textContent = `Repete a seção de campanhas: ${demo.repete}. ${inicio}Exemplo ilustrativo, marca fictícia. Interface aproximada.`;
    show(0);
  }

  root.addEventListener('click', event => {
    const format = event.target.closest('[data-formato]');
    if (format) { started = true; load(Number(format.dataset.formato)); return; }
    const step = event.target.closest('[data-vitrine-step]');
    if (step) { go(false); show(demo.steps[Number(step.dataset.vitrineStep)][1]); return; }
    if (event.target.closest('[data-play]')) {
      if (reduce.matches) { show(index >= last() ? 0 : index + 1); return; }
      go(!playing);
    }
  });

  load(0);
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
