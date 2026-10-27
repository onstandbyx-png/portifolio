/* "Sites e lojas": the sites the campaign flows lead to, on their own ("Sistemas e automações"
   is automation-trace.js). Each format is a cut of a storyboard of campaign-channels.js, cut by
   scene and not by index: from the first frame on the site (scene 'page') to the last frame
   before the confirmation banner ('aviso'), so new frames in the flows never break it. The
   panel beside the phone lists the screens of the cut under the journey steps of the placement
   (its passos inside the cut), synced with the phone. From 1100px a "Celular | Computador"
   switch shows the same site in a desktop browser, so this section does not replay the phone
   of the campaign section. The phone plays once when it comes into view and stops on its last
   frame, each frame for its reading time (frame-engine.js); every screen in the list jumps to
   its frame. Without motion (reduced motion, hidden tab, no IntersectionObserver) nothing
   plays by itself: the button shows the next frame.
   Markup: index.html, <div class="vitrine lab-escopo" data-vitrine="sites">. */
import { channelById, renderMock } from './campaign-channels.js';
import { applyFrame, settle, tempoMinimo, showTap, hideTap, syncMedia, live, seguirFoco } from './frame-engine.js';

const DEMOS = {
  sites: [
    { label: 'Site', channel: 'instagram', placement: 'explorar', repete: 'Instagram · Explorar' },
    { label: 'Loja', channel: 'tiktok', placement: 'infeed', repete: 'TikTok · In-Feed' },
    { label: 'Landing', channel: 'instagram', placement: 'feed', repete: 'Instagram · Feed' },
    { label: 'Publieditorial', channel: 'blog', placement: 'article', repete: 'Publieditorial · Artigo' },
  ],
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const desktopQuery = matchMedia('(min-width:1100px)');
const compactQuery = matchMedia('(max-width:480px), (max-height:480px)'), narrowQuery = matchMedia('(max-width:599px)');

/* The cut of a placement: absolute indexes [from, to] and the steps inside it. */
export function recorte(placement) {
  const list = placement.quadros;
  let from = list.findIndex(item => item.cena === 'page');
  if (from < 0) from = 0;
  const aviso = list.findIndex((item, i) => i > from && /(^| )aviso( |$)/.test(item.estado || ''));
  const to = aviso > from ? aviso - 1 : list.length - 1;
  const passos = placement.passos.map(p => ({ fase: p.fase, rotulo: p.rotulo, quadros: p.quadros.filter(i => i >= from && i <= to) })).filter(p => p.quadros.length);
  return { from, to, passos };
}

function mountOne(root) {
  const formats = DEMOS[root.dataset.vitrine];
  root.innerHTML = `<div class="vitrine-top"><div class="cx-placements vitrine-formatos" role="group" aria-label="Formato"><span class="cx-thumb is-instant" aria-hidden="true"></span>${formats.map((f, k) => `<button type="button" class="cx-placement" data-formato="${k}" aria-pressed="${k === 0}">${esc(f.label)}</button>`).join('')}</div>
      <div class="vitrine-modo" role="group" aria-label="Aparelho"><button type="button" class="vitrine-modo-b" data-modo="celular" aria-pressed="true">Celular</button><button type="button" class="vitrine-modo-b" data-modo="computador" aria-pressed="false">Computador</button></div></div>
    <div class="vitrine-phone" data-phone><div class="vitrine-stage" data-stage></div></div>
    <div class="vitrine-side">
      <div class="vitrine-ctl"><button type="button" class="vitrine-play" data-play></button><span class="vitrine-pos" data-pos aria-hidden="true"></span></div>
      <p class="vitrine-caption" data-caption aria-live="polite"></p>
      <ol class="vitrine-telas" data-telas aria-label="Telas do site"></ol>
      <p class="vitrine-nota" data-nota></p>
    </div>`;
  const $ = selector => root.querySelector(selector);
  const stage = $('[data-stage]'), play = $('[data-play]'), caption = $('[data-caption]'), telas = $('[data-telas]'), nota = $('[data-nota]'), pos = $('[data-pos]');
  let demo = null, placement = null, list = [], cut = null, screen = null, index = 0, timer = 0, playing = false, started = false, token = 0, modo = 'celular';
  // resume: playback was stopped by the page (out of view, hidden tab, global pause), not by the visitor.
  let resume = false, inView = false;
  // ids: the absolute frames shown in this mode. A desktop browser cannot show the phone's bank app,
  // so Computador keeps only the frames on the site itself.
  let ids = [];
  const last = () => Math.max(0, ids.length - 1);
  const frameIds = () => { const out = []; for (let i = cut.from; i <= cut.to; i++) if (modo === 'celular' || list[i].cena === list[cut.from].cena) out.push(i); return out; };

  function thumb() {
    const knob = root.querySelector('.cx-thumb'), on = root.querySelector('[data-formato][aria-pressed="true"]');
    if (!knob || !on || !on.offsetWidth) return;
    knob.style.width = on.offsetWidth + 'px'; knob.style.height = on.offsetHeight + 'px';
    knob.style.transform = `translate(${on.offsetLeft}px,${on.offsetTop}px)`;
    const row = knob.parentElement;
    if (on.offsetLeft < row.scrollLeft || on.offsetLeft + on.offsetWidth > row.scrollLeft + row.clientWidth) row.scrollLeft = on.offsetLeft - 8;
    if (knob.classList.contains('is-instant')) requestAnimationFrame(() => requestAnimationFrame(() => knob.classList.remove('is-instant')));
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => thumb()).observe(root);
  function label() {
    play.textContent = playing ? 'Pausar' : index >= last() ? 'Rever' : live() ? 'Reproduzir' : 'Próximo quadro';
    play.setAttribute('aria-pressed', String(playing));
  }
  /* The list of screens: the steps of the cut and, under each, the screens it shows. */
  function listMarkup() {
    return cut.passos.map(p => ({ ...p, quadros: p.quadros.filter(i => ids.includes(i)) })).filter(p => p.quadros.length).map(p => `<li class="vitrine-passo"><b>${esc(p.fase)}</b><small>${esc(p.rotulo)}</small><ol>${p.quadros.map(i => ids.indexOf(i)).map(n => `<li><button type="button" data-tela="${n}"><span class="vitrine-n" aria-hidden="true">${n + 1}</span><span>${esc(list[ids[n]].desc)}</span></button></li>`).join('')}</ol></li>`).join('');
  }
  function show(i, { instant = true } = {}) {
    index = Math.max(0, Math.min(last(), i));
    const abs = ids[index], item = list[abs];
    applyFrame(screen, list, abs, { instant, playing });
    caption.textContent = item.desc;
    pos.textContent = `${index + 1}/${last() + 1}`;
    telas.querySelectorAll('[data-tela]').forEach(button => {
      const n = Number(button.dataset.tela);
      button.parentElement.dataset.state = n < index ? 'done' : n === index ? 'on' : 'next';
      if (n === index) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    const current = telas.querySelector('[aria-current="step"]');
    if (current && telas.scrollHeight > telas.clientHeight) telas.scrollTo({ top: current.offsetTop - telas.clientHeight / 2, behavior: instant ? 'instant' : 'smooth' });
    label();
    const mine = ++token;
    hideTap(stage);
    return settle(screen, item).then(() => {
      if (mine !== token) return null;
      if (modo === 'celular') showTap(stage, screen, item); else if (item.toque) screen.dataset.tap = item.toque;
      // Phones: a button below the fold comes into view while playing.
      if (playing && modo === 'celular' && narrowQuery.matches) seguirFoco(stage);
      return tempoMinimo(screen, list, abs);
    });
  }
  function tick(ms) {
    clearTimeout(timer);
    if (!playing) return;
    if (index >= last()) { playing = false; syncMedia(screen, false); label(); return; }
    timer = setTimeout(() => { if (!playing || !live()) return; show(index + 1, { instant: false }).then(next => { if (next !== null) tick(next); }); }, ms);
  }
  function go(on) {
    playing = on && live();
    clearTimeout(timer);
    if (!playing) { if (screen) syncMedia(screen, false); label(); return; }
    if (index >= last()) show(0, { instant: false }).then(ms => { if (ms !== null) tick(ms); });
    else tick(1400);
    label();
  }
  /* The phone, or the same screen inside a desktop browser (from 1100px). */
  function mountScreen() {
    const html = renderMock(placement);
    if (modo === 'computador') {
      const holder = document.createElement('div'); holder.innerHTML = html;
      screen = holder.querySelector('.cm-screen');
      const page = screen.querySelector('.cm-scene[data-scene="page"]') || screen;
      const domain = (page.querySelector('.cm-safari-url, .cm-browser-title small')?.textContent || '').trim();
      stage.innerHTML = `<div class="vitrine-desk"><div class="vitrine-desk-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(domain)}</span></div><div class="vitrine-desk-tela"><div class="ch-iphone-ui vitrine-desk-ui"></div></div></div>`;
      stage.querySelector('.vitrine-desk-ui').append(screen);
    } else {
      stage.innerHTML = `${html}<span class="cx-tap" data-cx-tap aria-hidden="true" hidden></span>`;
      screen = stage.querySelector('.cm-screen');
      stage.querySelector('.ch-iphone')?.classList.toggle('ch-iphone--compacto', compactQuery.matches);
    }
    stage.dataset.modo = modo;
    root.dataset.modo = modo;
  }
  function load(k) {
    go(false);
    demo = formats[k];
    placement = channelById(demo.channel).placements.find(item => item.id === demo.placement);
    list = placement.quadros;
    cut = recorte(placement);
    ids = frameIds();
    mountScreen();
    telas.innerHTML = listMarkup();
    root.querySelectorAll('[data-formato]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.formato) === k)));
    requestAnimationFrame(thumb);
    nota.textContent = `O mesmo site do anúncio ${demo.repete} da seção de campanhas, sem o anúncio antes. Exemplo ilustrativo, marca fictícia. Interface aproximada.`;
    show(0);
  }
  function setModo(next) {
    if (next === modo || (next === 'computador' && !desktopQuery.matches)) return;
    const was = ids[index];
    go(false);
    modo = next;
    root.querySelectorAll('.vitrine-modo-b[data-modo]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.modo === modo)));
    ids = frameIds();
    mountScreen();
    telas.innerHTML = listMarkup();
    const at = ids.findIndex(i => i >= was);
    show(at < 0 ? last() : at);
  }

  root.addEventListener('click', event => {
    const format = event.target.closest('[data-formato]');
    if (format) { started = true; resume = false; load(Number(format.dataset.formato)); return; }
    const tela = event.target.closest('[data-tela]');
    if (tela) { started = true; resume = false; go(false); show(Number(tela.dataset.tela)); return; }
    // Only the switch buttons: the root and the stage also carry data-modo.
    const modoButton = event.target.closest('.vitrine-modo-b[data-modo]');
    if (modoButton) { setModo(modoButton.dataset.modo); return; }
    if (event.target.closest('[data-play]')) {
      started = true; resume = false;
      if (!live()) { show(index >= last() ? 0 : index + 1); return; }
      go(!playing);
    }
  });
  desktopQuery.addEventListener('change', () => { if (!desktopQuery.matches && modo === 'computador') setModo('celular'); });
  compactQuery.addEventListener('change', () => stage.querySelector('.ch-iphone')?.classList.toggle('ch-iphone--compacto', compactQuery.matches));

  load(0);
  // Plays once when the phone comes into view. Leaving the view, hiding the tab or the global pause
  // (body.is-paused) stops it, and it goes on from the same frame when that ends; a pause by the visitor stays.
  const halt = () => { if (playing) resume = true; go(false); };
  const proceed = () => { if (resume && inView && live()) { resume = false; go(true); } else label(); };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !started && live()) { started = true; go(true); }
      else if (inView) proceed();
      else halt();
    }, { threshold: .4 }).observe(root);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) halt(); else proceed(); });
  new MutationObserver(() => { if (document.body.classList.contains('is-paused')) halt(); else proceed(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

export function mountVitrine() {
  // "Sistemas e automações" has its own component (automation-trace.js).
  document.querySelectorAll('[data-vitrine]:not([data-vitrine-ready])').forEach(root => {
    if (!DEMOS[root.dataset.vitrine]) return;
    root.dataset.vitrineReady = 'true';
    mountOne(root);
  });
}
