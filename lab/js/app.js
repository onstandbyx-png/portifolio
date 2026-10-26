import {PAIRS} from './recriados.js';
import {contarOrigens, mountChatgpt, mountDrive} from './origens.js';
import {mountQuadros} from './quadros.js';
import {mountVersoes} from './versoes.js';
import {mountLottie, mountRive, reducedMotion, renderInputs, renderSetup, whenNear} from './runtime.js';

const PREVIEW = 'https://portfolio-visual-review-production.up.railway.app';
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const html = markup => { const t = document.createElement('template'); t.innerHTML = markup.trim(); return t.content.firstElementChild; };
const ms = n => `${Math.round(n)} ms`;
const RATES = '<option value="1">1×</option><option value="0.5">0,5×</option><option value="0.25">0,25×</option>';
const riveNumber = slug => '#' + slug.split('-')[0];

/* Tabs (hash-addressable; #q-<element> and #qv-<version> open one analysis card) */
const tabs = $$('[role=tab]');
const opened = new Set();
const montados = {};
function montar(id) {
  if (id === 'quadros') montados.quadros = mountQuadros($('[data-quadros]')).then(c => { $('[data-count="quadros"]').textContent = c.elementos + c.versoes; return c; })
    .catch(error => { $('[data-quadros]').innerHTML = `<p class="note">Os quadros não carregaram: ${esc(error.message)}</p>`; });
  if (id === 'versoes') montados.versoes = mountVersoes($('[data-versoes]')).then(c => { $('[data-count="versoes"]').textContent = c.versoes; return c; })
    .catch(error => { $('[data-versoes]').innerHTML = `<p class="note">As versões não carregaram: ${esc(error.message)}</p>`; });
  if (id === 'drive') mountDrive($('[data-drive]')).then(c => { $('[data-count="drive"]').textContent = c.versoes; })
    .catch(error => { $('[data-drive]').innerHTML = `<p class="note">O Drive não carregou: ${esc(error.message)}</p>`; });
  if (id === 'chatgpt') mountChatgpt($('[data-chatgpt]')).then(c => { $('[data-count="chatgpt"]').textContent = c.conversas || ''; })
    .catch(error => { $('[data-chatgpt]').innerHTML = `<p class="note">As conversas não carregaram: ${esc(error.message)}</p>`; });
}
// "Ver os quadros com origem…" in the Drive and ChatGPT tabs: open Quadros with that origin filter.
document.addEventListener('click', event => {
  const b = event.target.closest('[data-og-origem]');
  if (!b) return;
  showTab('quadros');
  scrollTo({top: 0});
  montados.quadros?.then(c => c?.filtrarOrigem(b.dataset.ogOrigem));
});
function showTab(id, {focus = false, push = true} = {}) {
  const foco = /^qv?-/.test(id) ? id : '';
  if (foco) { id = 'quadros'; push = false; }
  const tab = tabs.find(t => t.getAttribute('aria-controls') === id) || tabs[0];
  id = tab.getAttribute('aria-controls');
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $('#' + t.getAttribute('aria-controls')).hidden = !on;
  }
  if (!opened.has(id)) {
    opened.add(id);
    $$('iframe[data-src]', $('#' + id)).forEach(f => { f.src = f.dataset.src; });
    montar(id);
  }
  if (foco) montados.quadros?.then(c => c?.focar(foco));
  if (focus) tab.focus();
  if (push && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
}
addEventListener('lab:comparar', event => {
  showTab('versoes');
  scrollTo({top: 0});
  montados.versoes?.then(c => c?.abrir(event.detail.id, {comparando: true}));
});
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => showTab(tab.getAttribute('aria-controls')));
  tab.addEventListener('keydown', event => {
    const step = {ArrowRight: 1, ArrowLeft: -1}[event.key];
    if (step) { event.preventDefault(); showTab(tabs[(i + step + tabs.length) % tabs.length].getAttribute('aria-controls'), {focus: true}); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); showTab(tabs[event.key === 'Home' ? 0 : tabs.length - 1].getAttribute('aria-controls'), {focus: true}); }
  });
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-tab-link]');
  if (!link) return;
  event.preventDefault();
  showTab(link.hash.slice(1));
  scrollTo({top: 0});
});
addEventListener('hashchange', () => showTab(location.hash.slice(1), {push: false}));
showTab(location.hash.slice(1) || 'quadros', {push: false});
// Drive and ChatGPT counts in the tab labels before the tabs are opened (small files only).
contarOrigens().then(({drive, conversas}) => {
  if (drive && !$('[data-count="drive"]').textContent) $('[data-count="drive"]').textContent = drive;
  if (conversas && !$('[data-count="chatgpt"]').textContent) $('[data-count="chatgpt"]').textContent = conversas;
}).catch(() => {});

/* Frames: width presets and prototype switch */
document.addEventListener('click', event => {
  const button = event.target.closest('[data-frame-width]');
  if (!button) return;
  const frame = document.getElementById(button.dataset.frame);
  $$(`[data-frame="${button.dataset.frame}"]`).forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  frame.style.width = button.dataset.frameWidth ? button.dataset.frameWidth + 'px' : '100%';
});
const PROTO_NOTES = {
  a: 'A · daisyUI 5 (MIT): card, badge, botão e carrossel com scroll-snap; molduras de aparelho do Android Open Source Project (Apache-2.0).',
  b: 'B · Flowbite (MIT) com molduras do react-mockframe (MIT) renderizadas em HTML estático.',
  c: 'C · Magic UI (MIT): bento grid e molduras de celular e navegador em SVG, com Newsreader nos títulos.'
};
$$('[data-proto]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.proto, frame = $('#proto-frame');
  $$('[data-proto]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  frame.dataset.src = `/prototipos/${id}/`;
  if (opened.has('cartoes')) frame.src = frame.dataset.src;
  $('[data-proto-open]').href = `/prototipos/${id}/`;
  $('[data-proto-note]').textContent = PROTO_NOTES[id];
}));
$('[data-proto-note]').textContent = PROTO_NOTES.a;
$('[data-live-links]').innerHTML = [['/criadores', 'Criadores'], ['/criadores/ao-vivo', 'Criadores ao vivo'], ['/vagas', 'Vagas']]
  .map(([path, label]) => `<li><a href="${PREVIEW}${path}" target="_blank" rel="noopener">${label} na prévia ↗</a></li>`).join('');

/* Shared bits */
function timesList(tempos = []) {
  if (!tempos.length) return '';
  return `<h4>Tempos medidos</h4><ul class="times">${tempos.map(t => `<li><span>${esc(t.e)}${t.ease ? `<br><small>${esc(t.ease)}</small>` : ''}</span><span>${esc(t.d)}</span></li>`).join('')}</ul>`;
}
function details(item, label = 'O que mostra, tempos e como recriar') {
  return `<details><summary>${label}</summary><div class="body">${item.mostra ? `<p>${esc(item.mostra)}</p>` : ''}${timesList(item.tempos)}${item.recriar ? `<h4>Como recriar</h4><p>${esc(item.recriar)}</p>` : ''}${item.medida ? `<h4>Teste de aceite</h4><p>${esc(item.medida)}</p>` : ''}</div></details>`;
}
function fail(stage, error) {
  stage.querySelector('.stage-msg')?.remove();
  stage.append(html(`<span class="stage-msg">Não carregou: ${esc(error.message || error)}</span>`));
}

/* Pairs */
function renderPair(pair, data) {
  const orig = pair.rive ? data.rive.find(r => r.slug === pair.rive) : data.lottie.find(l => l.slug === pair.lottie);
  const isRive = Boolean(pair.rive);
  const origTime = isRive ? (orig?.tempos?.[0]?.d || '') : `${orig?.dur} ms`;
  const source = isRive ? `Rive ${riveNumber(pair.rive)} · ${esc(orig?.author)}` : `LottieFiles · ${esc(orig?.author)}`;
  const el = html(`<article class="pair" id="par-${pair.id}">
    <header class="pair-head"><h3>${esc(pair.title)}</h3><p>${esc(pair.intro)}</p></header>
    <div class="pair-cols">
      <div class="side">
        <div class="side-label"><b>Original</b><a href="${esc(orig?.page)}" target="_blank" rel="noopener">${source} ↗</a><span class="tag tag--ok">${isRive ? 'CC BY 4.0' : 'Lottie Simple License'}</span></div>
        <div class="stage" data-orig><span class="stage-msg">carregando o original…</span></div>
        <div class="inputs" data-setup></div>
        <div class="inputs" data-inputs></div>
        <p class="readout">medido no original: ${esc(origTime)}${isRive ? ' · roda sempre em 1×' : ''}</p>
      </div>
      <div class="side">
        <div class="side-label"><b>Recriação</b><span class="tag">SVG, CSS e WAAPI · código próprio</span></div>
        <div class="stage stage--light" data-rec></div>
        <div class="inputs"><span class="tag">Toque na peça para acionar</span></div>
        <p class="readout" data-rec-time>tempo da recriação: toque para medir</p>
      </div>
    </div>
    <footer class="pair-foot">
      <button type="button" class="btn btn--primary" data-both>Tocar os dois</button>
      <button type="button" class="btn" data-reset>Reiniciar</button>
      <label class="controls">Velocidade${isRive ? ' da recriação' : ''} <select data-rate>${RATES}</select></label>
      <span class="note">Onde entrou: ${esc(pair.used)}</span>
    </footer>
    <ul class="diffs">${pair.diffs.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
    ${orig ? details(orig, 'Medição completa do original') : ''}
  </article>`);
  const rec = pair.build();
  $('[data-rec]', el).append(rec.el);
  queueMicrotask(() => rec.mount?.());
  const recTime = $('[data-rec-time]', el), rate = $('[data-rate]', el);
  let on = false, original = null;
  const runRec = async () => {
    const r = Number(rate.value);
    const t = await rec.toggle(r);
    if (t) recTime.textContent = `tempo da recriação: ${ms(t)}${r !== 1 ? ` a ${String(r).replace('.', ',')}× (≈ ${ms(t * r)} em 1×)` : ''}`;
  };
  rec.el.addEventListener('click', () => { if (pair.toggles) on = !on; runRec(); });
  const stage = $('[data-orig]', el);
  whenNear(el, async () => {
    try {
      if (isRive) {
        original = await mountRive(stage, {src: orig.riv, artboard: pair.artboard, stateMachine: pair.sm});
        renderSetup($('[data-setup]', el), original, {onChange: () => renderInputs($('[data-inputs]', el), original)});
        renderInputs($('[data-inputs]', el), original);
      } else {
        const box = html('<div class="lottie-box"></div>');
        stage.append(box);
        original = await mountLottie(box, {path: orig.json});
        stage.style.cursor = 'pointer';
        stage.addEventListener('click', () => { original.setSpeed(Number(rate.value)); original.goToAndPlay(0, true); });
        $('[data-inputs]', el).innerHTML = '<span class="tag">Toque no original para tocar</span>';
      }
      $('.stage-msg', stage)?.remove();
    } catch (error) { fail(stage, error); }
  });
  $('[data-both]', el).addEventListener('click', () => {
    if (pair.toggles) on = !on;
    if (original) {
      if (isRive) { if (!original.playing) original.play(); pair.drive(original, on); }
      else { original.setSpeed(Number(rate.value)); original.goToAndPlay(0, true); }
    }
    runRec();
  });
  $('[data-reset]', el).addEventListener('click', () => {
    on = false;
    rec.reset();
    recTime.textContent = 'tempo da recriação: toque para medir';
    if (original && isRive) original.reset().then(() => renderInputs($('[data-inputs]', el), original));
    else if (original) original.goToAndStop(Math.floor(original.totalFrames) - 1, true);
  });
  return el;
}

/* Rive originals */
function renderRive(item, recreated) {
  const el = html(`<article class="card" data-enviado="${item.enviado}" data-recriado="${recreated}">
    <div class="stage"><span class="stage-msg">carregando…</span></div>
    <div><h3>${esc(item.name)} <small class="by">${riveNumber(item.slug)}</small></h3><p class="by">por ${esc(item.author || 'autor no Rive')} · <a href="${esc(item.page)}" target="_blank" rel="noopener">abrir no Rive ↗</a></p></div>
    <div class="meta"><span class="tag tag--ok">CC BY 4.0</span>${item.enviado ? '<span class="tag">enviado por você</span>' : ''}${recreated ? '<a class="tag tag--ok" href="#recriados" data-tab-link>tem recriação</a>' : ''}</div>
    <div class="controls"><button type="button" class="btn" data-pause disabled>Pausar</button><button type="button" class="btn" data-restart disabled>Reiniciar</button></div>
    <div class="inputs" data-setup></div>
    <div class="inputs" data-inputs></div>
    ${details(item)}
  </article>`);
  const stage = $('.stage', el), pause = $('[data-pause]', el), restart = $('[data-restart]', el);
  whenNear(el, async () => {
    try {
      const startPaused = reducedMotion();
      const ctrl = await mountRive(stage, {src: item.riv, paused: startPaused});
      $('.stage-msg', stage)?.remove();
      renderSetup($('[data-setup]', el), ctrl, {onChange: () => { renderInputs($('[data-inputs]', el), ctrl); sync(); }});
      renderInputs($('[data-inputs]', el), ctrl);
      const sync = () => { pause.textContent = ctrl.playing ? 'Pausar' : 'Tocar'; };
      if (startPaused) { ctrl.playing = false; stage.append(html('<span class="stage-msg">Movimento reduzido ativo: aperte Tocar</span>')); }
      pause.disabled = restart.disabled = false; sync();
      pause.addEventListener('click', () => { if (ctrl.playing) ctrl.pause(); else { ctrl.play(); $('.stage-msg', stage)?.remove(); } sync(); });
      restart.addEventListener('click', async () => { await ctrl.reset(); renderSetup($('[data-setup]', el), ctrl, {onChange: () => { renderInputs($('[data-inputs]', el), ctrl); sync(); }}); renderInputs($('[data-inputs]', el), ctrl); $('.stage-msg', stage)?.remove(); sync(); });
    } catch (error) { fail(stage, error); }
  });
  return el;
}

/* Lottie originals */
function renderLottie(item) {
  const frames = Math.max(1, Math.round(item.frames || 1));
  const el = html(`<article class="card">
    <div class="stage stage--light"><div class="lottie-box"></div><span class="stage-msg">carregando…</span></div>
    <div><h3>${esc(item.tema)}: ${esc(item.name)}</h3><p class="by">por ${esc(item.author || 'autor no LottieFiles')} · <a href="${esc(item.page)}" target="_blank" rel="noopener">abrir no LottieFiles ↗</a></p></div>
    <div class="meta"><span class="tag tag--ok">Lottie Simple License</span><span class="tag">${esc(item.w)}×${esc(item.h)} · ${esc(item.fr)} fps · ${esc(item.dur)} ms</span></div>
    <div class="controls"><button type="button" class="btn btn--primary" data-play disabled>Tocar</button><label><input type="checkbox" data-loop> Repetir</label><label>Velocidade <select data-rate>${RATES}</select></label></div>
    <input type="range" class="scrub" min="0" max="${frames - 1}" step="1" value="${frames - 1}" aria-label="Quadro da animação" disabled>
    <p class="readout" data-readout></p>
    ${details(item)}
  </article>`);
  const box = $('.lottie-box', el), stage = $('.stage', el), play = $('[data-play]', el), loop = $('[data-loop]', el), rate = $('[data-rate]', el), scrub = $('.scrub', el), readout = $('[data-readout]', el);
  if (item.w && item.h) box.style.aspectRatio = `${item.w} / ${item.h}`;
  const fr = Number(item.fr) || 30;
  const show = f => { readout.textContent = `quadro ${Math.round(f)} de ${frames - 1} · ${ms(f / fr * 1000)}`; };
  show(frames - 1);
  whenNear(el, async () => {
    try {
      const anim = await mountLottie(box, {path: item.json});
      $('.stage-msg', stage)?.remove();
      play.disabled = scrub.disabled = false;
      anim.addEventListener('enterFrame', e => { scrub.value = String(Math.round(e.currentTime)); show(e.currentTime); });
      anim.addEventListener('complete', () => { play.textContent = 'Tocar'; });
      play.addEventListener('click', () => {
        if (!anim.isPaused) { anim.pause(); play.textContent = 'Continuar'; return; }
        anim.setSpeed(Number(rate.value)); anim.loop = loop.checked;
        if (Math.round(anim.currentFrame) >= frames - 2) anim.goToAndPlay(0, true); else anim.play();
        play.textContent = 'Pausar';
      });
      loop.addEventListener('change', () => { anim.loop = loop.checked; });
      rate.addEventListener('change', () => anim.setSpeed(Number(rate.value)));
      scrub.addEventListener('input', () => { anim.goToAndStop(Number(scrub.value), true); play.textContent = 'Tocar'; show(Number(scrub.value)); });
    } catch (error) { fail(stage, error); }
  });
  return el;
}

/* References (open at the source) */
function renderRefs(refs) {
  const groups = new Map();
  for (const ref of refs) { if (!groups.has(ref.grupo)) groups.set(ref.grupo, []); groups.get(ref.grupo).push(ref); }
  return [...groups].map(([name, list]) => `<section class="ref-group"><h3>${esc(name)} <span class="count">${list.length}</span></h3><ul class="ref-list">${list.map(ref => {
    const extra = (ref.visual ? `<h4>Visual</h4><p>${esc(ref.visual)}</p>` : '') + timesList(ref.tempos) + (ref.interacao ? `<h4>Interação</h4><p>${esc(ref.interacao)}</p>` : '');
    const live = ref.aoVivo ? `<div class="ref-live" data-live="${esc(ref.aoVivo)}"><button type="button" class="btn btn--primary" data-live-open>Abrir aqui, ao vivo</button></div>` : '';
    const video = ref.video ? `<video class="ref-video" src="${esc(ref.video)}" controls muted playsinline loop preload="none"></video>` : '';
    return `<li class="ref${ref.aoVivo ? ' ref--live' : ''}"><a href="${esc(ref.url)}" target="_blank" rel="noopener">${esc(ref.name)} ↗</a><div class="meta"><span class="tag">${esc(ref.kind)}</span>${ref.enviado ? '<span class="tag tag--ok">enviado por você</span>' : ''}${ref.aoVivo ? '<span class="tag tag--ok">roda ao vivo</span>' : ''}${ref.video ? '<span class="tag">vídeo da fonte</span>' : ''}</div>${live}${video}<p>${esc(ref.mostra)}</p>${extra ? `<details><summary>O que foi medido</summary><div class="body">${extra}</div></details>` : ''}</li>`;
  }).join('')}</ul></section>`).join('');
}

/* Boot */
try {
  const data = await (await fetch('/data/lab-data.json')).json();
  const recreated = new Set(PAIRS.map(p => p.rive).filter(Boolean));
  $('[data-pairs]').append(...PAIRS.map(pair => renderPair(pair, data)));
  $('[data-grid="rive"]').append(...data.rive.map(item => renderRive(item, recreated.has(item.slug))));
  $('[data-grid="lottie"]').append(...data.lottie.map(renderLottie));
  const smiileAtual = {grupo: 'Sites do handoff', name: 'smiile (landing publicada)', url: 'https://smiile-landing-preview.up.railway.app/', kind: 'site', enviado: false, aoVivo: 'https://smiile-landing-preview.up.railway.app/', mostra: 'A landing atual do smiile, a mesma da prévia publicada.', tempos: []};
  $('[data-refs]').innerHTML = renderRefs([...data.refs.filter(r => r.aoVivo), smiileAtual, ...data.refs.filter(r => !r.aoVivo)]);
  $('[data-refs]').addEventListener('click', event => {
    const open = event.target.closest('[data-live-open]');
    if (!open) return;
    const box = open.closest('[data-live]');
    box.innerHTML = `<div class="seg-group" role="group" aria-label="Largura">${[['390', '390'], ['768', '768'], ['', 'Cheia']].map(([w, t]) => `<button type="button" class="seg" data-live-w="${w}"${w === '' ? ' aria-pressed="true"' : ''}>${t}</button>`).join('')}<a class="open" href="${esc(box.dataset.live)}" target="_blank" rel="noopener">Abrir em nova aba ↗</a></div><div class="vs-viewport"><iframe title="Site ao vivo" src="${esc(box.dataset.live)}" allow="fullscreen"></iframe></div>`;
    box.closest('.ref').classList.add('is-open');
  });
  $('[data-refs]').addEventListener('click', event => {
    const w = event.target.closest('[data-live-w]');
    if (!w) return;
    const box = w.closest('[data-live]');
    box.querySelectorAll('[data-live-w]').forEach(b => b.setAttribute('aria-pressed', String(b === w)));
    box.querySelector('iframe').style.width = w.dataset.liveW ? `${w.dataset.liveW}px` : '100%';
  });
  const counts = {recriados: PAIRS.length, rive: data.rive.length, lottie: data.lottie.length, refs: data.refs.length};
  for (const [key, n] of Object.entries(counts)) $(`[data-count="${key}"]`).textContent = n;
  $$('[data-filters="rive"] [data-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-filters="rive"] [data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const f = button.dataset.filter;
    $$('[data-grid="rive"] .card').forEach(card => { card.hidden = f !== 'todos' && card.dataset[f] !== 'true'; });
  }));
} catch (error) {
  $('[data-pairs]').append(html(`<p class="note">Os dados do laboratório não carregaram: ${esc(error.message)}</p>`));
}
