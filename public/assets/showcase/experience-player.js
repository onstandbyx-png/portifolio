/** Channel placement behind the campaign page-peel, with its live side panel.
 * Behind the paper: the channel header (official mark, name, play), the formats as one
 * segmented control, the orange iPhone with a fictitious client's ad in its native
 * placement and, under the phone, the "Agora" strip: what the screen shows, the current
 * line of a call or the latest backstage event, ← ▶ → and "Ampliar tela". Beside the card
 * from 900px (under it on phones, only while the paper is open) the side panel: client
 * chip, ad label, objective, sentence, the three journey steps, "Na tela", the call
 * transcript, "Nos bastidores", "Baseado em" and the contact link. From 900px the header
 * and the formats move into the panel, so the phone keeps the height of the screen.
 * The journey is a finite storyboard played by frame-engine.js: each frame stays at least
 * its reading time, the point and the finger land once the scene has settled, and the
 * player stops on the conversion screen with a replay control. Switching channels while
 * the peel is open keeps it open: the old placement leaves to the side (30px, 300ms), the
 * new one enters with a spring (42px, 620ms). Without motion (reduced motion, global
 * pause, hidden tab) nothing plays by itself: the steps are static and selectable, and
 * the play button shows the next frame.
 * Deep link: #laboratorio/<canal>[/<formato>] and the window event cx:abrir {canal, formato}
 * select the channel, open the paper, press the format and bring the phone into view.
 */
import { createMotion, clamp } from '../sections/motion.js';
import * as canais from './campaign-channels.js';
import { CLIENTES } from './marcas.js';
import { logoSvg, CHANNEL_LOGO, LOGOS } from './channel-logos.js';
import { applyFrame, settle, positionDot, clearDot, showTap, hideTap, tempoMinimo, syncMedia, live as engineLive, seguirFoco } from './frame-engine.js';

const { channels, channelById, renderMock, marca, glifo } = canais;
const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICONS = {
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8 5.5v13M16 5.5v13',
  replay: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4.5H9',
  next: 'M5 12h13M13 6.5 18.5 12 13 17.5',
  prev: 'M19 12H6M11 6.5 5.5 12l5.5 5.5',
  zoom: 'M14.5 4.5h5v5M9.5 19.5h-5v-5M19.5 4.5 13.5 10.5M4.5 19.5l6-6',
  close: 'M6 6l12 12M18 6 6 18',
  ear: 'M4.5 9.5h4l5-4v13l-5-4h-4zM16.5 9a4 4 0 0 1 0 6',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[name]}"/></svg>`;
/* Image notices: credits of IMG_META in campaign-channels.js ({chave:{src, credito}}); the local list is the fallback. */
const CREDITS = [[/restaurante-feijoada-completa/, 'Foto da feijoada: Bradleyzm, CC BY-SA 4.0, Wikimedia Commons.']];
const FINE = 'Exemplo ilustrativo, marca fictícia. Interface aproximada.';
function fineFor(html) {
  const meta = canais.IMG_META;
  if (meta && typeof meta === 'object') {
    const used = Object.values(meta).filter(item => item?.src && html.includes(item.src));
    const creditos = [...new Set(used.map(item => item.credito).filter(Boolean))];
    return FINE + creditos.map(text => ' ' + text).join('');
  }
  return FINE + CREDITS.filter(([re]) => re.test(html)).map(([, text]) => ' ' + text).join('');
}
/* Under 360px the longest channel names shorten. */
const CURTO = { whatsapp: 'WhatsApp', blog: 'Publi.' };
const narrowQuery = matchMedia('(max-width:359px)');
const nomeCanal = ch => narrowQuery.matches && CURTO[ch.id] ? `<span title="${escape(ch.name)}">${escape(CURTO[ch.id])}</span>` : escape(ch.name);
/* Colour of an actor of the backstage log. */
const ATOR = [[/Anúncio|CAPI|Google Ads|Pixel|Events API|Conversão/, '#3f5fbf'], [/Agente|IA|Bot/, '#6b4fc4'], [/Humano|Consultor|Vendedor|Recep/, '#1f7a52'], [/PSP|Banco|Pix|Pagamento/, '#9a6a00'], [/CRM|Lead/, '#a33a74'], [/WhatsApp|Instagram|Telegram|RCS|E-mail|Site|Mini app|Telefonia/, '#2f6f73']];
const corAtor = ator => (ATOR.find(([re]) => re.test(ator)) || [, '#55634f'])[1];
const falaDe = entry => Array.isArray(entry) ? { quem: entry[0], texto: entry[1] } : { quem: entry?.quem || '', texto: entry?.texto || '' };
const norm = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export function mountCampaignExperience(lab, underlay) {
  if (!lab || !underlay || underlay.querySelector('.cx-player')) return null;
  const motion = createMotion();
  const card = underlay.closest('.sp-peel-card'), layout = underlay.closest('.sp-peel-layout') || card?.parentElement;
  const player = document.createElement('section');
  player.className = 'cx-player'; player.dataset.noCardFlip = '';
  player.setAttribute('aria-label', 'Como o anúncio aparece no canal');
  player.innerHTML = [
    '<div class="cx-top" data-cx-top><header class="cx-head"><p class="cx-brand" data-cx-brand></p>',
    `<button type="button" class="cx-play" data-cx-play>${icon('play')}<span data-cx-play-label>Reproduzir</span></button></header>`,
    '<div class="cx-formatos" data-cx-formatos><div class="cx-placements" data-cx-placements></div></div></div>',
    '<div class="cx-body" data-cx-body></div>',
    '<div class="cx-agora" data-cx-agora><div class="cx-agora-txt" data-cx-agora-txt><p class="cx-agora-desc"><b>Agora</b> <span data-cx-agora-desc></span></p><p class="cx-agora-linha" data-cx-agora-linha></p></div>',
    `<div class="cx-ctl"><button type="button" class="cx-ctl-b" data-cx-prev aria-label="Quadro anterior">${icon('prev')}</button><button type="button" class="cx-ctl-b cx-ctl-play" data-cx-toggle aria-label="Reproduzir">${icon('play')}</button><button type="button" class="cx-ctl-b" data-cx-next aria-label="Próximo quadro">${icon('next')}</button><span class="cx-pos" data-cx-pos aria-hidden="true"></span><button type="button" class="cx-ctl-b cx-ampliar" data-cx-ampliar aria-label="Ampliar tela">${icon('zoom')}<span>Ampliar tela</span></button></div></div>`,
    '<p class="sr-only" role="status" aria-live="polite" data-cx-status></p>',
    '<dialog class="cx-zoom lab-escopo" aria-label="Tela ampliada" data-cx-zoom><div class="cx-zoom-in"><div class="cx-stage cx-zoom-stage" data-cx-zoom-stage><span class="cx-dot" data-cx-dot aria-hidden="true" hidden>1</span><span class="cx-tap" data-cx-tap aria-hidden="true" hidden></span></div>',
    `<div class="cx-zoom-bar"><p class="cx-zoom-desc" data-cx-zoom-desc></p><div class="cx-ctl"><button type="button" class="cx-ctl-b" data-cx-prev aria-label="Quadro anterior">${icon('prev')}</button><button type="button" class="cx-ctl-b cx-ctl-play" data-cx-toggle aria-label="Reproduzir">${icon('play')}</button><button type="button" class="cx-ctl-b" data-cx-next aria-label="Próximo quadro">${icon('next')}</button><button type="button" class="cx-ctl-b" data-cx-zoom-close aria-label="Fechar a tela ampliada">${icon('close')}</button></div></div></div></dialog>`,
  ].join('');
  underlay.insertBefore(player, underlay.querySelector('.sp-peel-return'));
  // The side panel: the note the presentation created, now the live journey panel beside the card.
  let side = lab.querySelector('[data-campaign-note]');
  if (!side) { side = document.createElement('aside'); side.id = 'campaign-note'; side.dataset.campaignNote = ''; }
  side.className = 'campaign-summary cx-side'; // not .sp-campaign-note: older sheets style that note
  side.dataset.cxSide = ''; side.dataset.mode = 'intro';
  side.setAttribute('aria-label', 'Jornada e bastidores do exemplo');
  side.innerHTML = '<div class="cx-side-slot" data-cx-slot></div><div class="cx-side-body" data-cx-side-body></div>';
  layout?.append(side);
  const $ = s => player.querySelector(s);
  const top = $('[data-cx-top]'), brand = $('[data-cx-brand]'), formatos = $('[data-cx-formatos]'), placements = $('[data-cx-placements]');
  const body = $('[data-cx-body]'), play = $('[data-cx-play]'), playLabel = $('[data-cx-play-label]'), status = $('[data-cx-status]');
  const strip = $('[data-cx-agora]'), stripText = $('[data-cx-agora-txt]');
  const zoom = $('[data-cx-zoom]'), zoomStage = $('[data-cx-zoom-stage]'), slot = side.querySelector('[data-cx-slot]'), sideBody = side.querySelector('[data-cx-side-body]');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const wideQuery = matchMedia('(min-width:900px), (min-width:600px) and (max-height:520px) and (orientation:landscape)');
  const compactQuery = matchMedia('(max-width:480px), (max-height:480px)');
  const shortQuery = matchMedia('(orientation:landscape) and (max-height:520px)');
  let channelId = null, placementIndex = 0, elapsed = 0, frame = -1, step = -1, playing = false, raf = 0, last = 0, visible = false, held = false;
  // resume: the journey was stopped by the page (out of view, hidden tab, global pause), not by the visitor.
  let resume = false;
  let ghost = null, animations = [], rising = [], generation = 0, durations = [], measured = [], starts = [], total = 0, screen = null, phone = null, audio = null;
  const channel = () => channelById(channelId);
  const placement = () => channel().placements[placementIndex];
  const frames = () => placement().quadros;
  const open = () => !underlay.inert;
  const live = () => motion.available() && !reduce.matches;
  const canPlay = () => live() && visible && open() && lab.dataset.channel === channelId;
  const mainStage = () => body.querySelector('[data-cx-stage]');
  const stage = () => zoom.open ? zoomStage : mainStage();
  const stepOf = index => Math.max(0, placement().passos.findIndex(item => item.quadros.includes(index)));
  const ended = () => elapsed >= total;
  const temFala = () => frames().some(item => item.fala?.length);
  const temLog = () => frames().some(item => item.log?.length);

  /* Each frame lasts its reading time: an estimate first, the measured time once it has settled. */
  function recalc() { let at = 0; starts = durations.map(ms => { const start = at; at += ms; return start; }); total = at; }
  function timeline() { durations = frames().map(item => Math.max(item.ms || 0, 1400)); measured = []; recalc(); }
  function frameAt(time) {
    let index = 0;
    for (let i = 0; i < starts.length; i++) if (time >= starts[i]) index = i;
    return index;
  }
  function cancelAnimations() {
    animations.splice(0).forEach(animation => { try { animation.cancel(); } catch {} });
    ghost?.remove(); ghost = null;
  }
  function setPlayLabel() {
    const fin = ended() || (!live() && frame >= frames().length - 1);
    let text, name, aria;
    if (live()) {
      text = playing ? 'Pausar' : fin ? 'Rever' : 'Reproduzir';
      name = playing ? 'pause' : fin ? 'replay' : 'play';
      aria = playing ? 'Pausar a jornada' : fin ? 'Rever a jornada do início' : 'Reproduzir a jornada';
      play.setAttribute('aria-pressed', String(playing));
    } else {
      text = fin ? 'Rever' : 'Próximo';
      name = fin ? 'replay' : 'next';
      aria = fin ? 'Voltar ao primeiro quadro' : 'Próximo quadro';
      play.removeAttribute('aria-pressed');
    }
    playLabel.textContent = text;
    play.querySelector('svg').outerHTML = icon(name);
    play.setAttribute('aria-label', aria);
    // The strip with the round toggle moves into the side panel on wide screens: both roots.
    [player, side].forEach(root => root.querySelectorAll('[data-cx-toggle]').forEach(button => { button.querySelector('svg').outerHTML = icon(name); button.setAttribute('aria-label', aria); }));
    const box = mainStage(); if (box) box.dataset.playing = String(playing);
    player.dataset.live = side.dataset.live = String(live());
  }
  function stop() { playing = false; cancelAnimationFrame(raf); raf = 0; if (screen) syncMedia(screen, false); setPlayLabel(); }

  /* Rails of the journey (over the phone and in the panel) and the video progress follow the elapsed time. */
  function paintProgress() {
    const list = placement().passos;
    [body, side].forEach(root => root.querySelectorAll('[data-cx-journey]').forEach(journey => journey.querySelectorAll('[data-cx-rail]').forEach((rail, k) => {
      const ids = list[k].quadros, from = starts[ids[0]], to = starts[ids[ids.length - 1]] + durations[ids[ids.length - 1]];
      let p = clamp((elapsed - from) / Math.max(1, to - from));
      if ((!live() && k === step) || k < step) p = 1;
      rail.style.setProperty('--p', p.toFixed(3));
    })));
    const bar = screen?.querySelector('[data-cx-progress]');
    if (bar) {
      let done = 0, sum = 0;
      frames().forEach((item, i) => { if (!item.video) return; sum += durations[i]; done += clamp(elapsed - starts[i], 0, durations[i]); });
      if (sum) bar.style.transform = 'scaleX(' + (done / sum).toFixed(3) + ')';
    }
  }
  /* After the scene settles: the measured reading time, then the point and the finger. */
  function land(index) {
    const token = ++generation, item = frames()[index];
    clearDot(stage()); hideTap(stage());
    settle(screen, item).then(() => {
      if (token !== generation || frame !== index || !screen) return;
      if (!measured[index]) {
        measured[index] = true;
        const ms = tempoMinimo(screen, frames(), index);
        if (ms !== durations[index]) { durations[index] = ms; recalc(); }
      }
      showTap(stage(), screen, item);
      positionDot(stage(), screen, item, step + 1);
      // Phones: the sticky Agora strip covers the bottom of the phone (a short landscape has no room for the
      // whole phone); while playing, the page brings the button or the point into view.
      if (playing && !zoom.open && (!wideQuery.matches || shortQuery.matches)) seguirFoco(stage(), { barra: wideQuery.matches ? null : strip });
      // Ampliar on a short screen: the dialog scrolls to the button or the point of the frame.
      if (zoom.open && zoom.scrollHeight > zoom.clientHeight + 8) {
        const focus = [...zoomStage.querySelectorAll('[data-cx-tap]:not([hidden]), [data-cx-dot]:not([hidden]), [data-cx-ring]:not([hidden])')].map(node => node.getBoundingClientRect()).filter(r => r.height);
        const r = zoomStage.getBoundingClientRect(), y = focus.length ? (Math.min(...focus.map(f => f.top)) + Math.max(...focus.map(f => f.bottom))) / 2 : r.top + r.height * .62;
        zoom.scrollTo({ top: Math.max(0, zoom.scrollTop + y - zoom.clientHeight / 2), behavior: live() ? 'smooth' : 'instant' });
      }
    });
  }
  function journeyState(root) {
    root.querySelectorAll('[data-cx-journey]').forEach(journey => journey.querySelectorAll('li').forEach((li, k) => {
      const fin = frame === frames().length - 1 && (ended() || !live());
      const state = k < step || (fin && k === step) ? 'done' : k === step ? 'on' : 'next';
      li.dataset.state = state;
      const button = li.querySelector('button');
      if (k === step) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      if (journey.dataset.cxJourney === 'card') button.tabIndex = k === step ? 0 : -1;
      const passo = placement().passos[k];
      button.setAttribute('aria-label', `Passo ${k + 1}, ${passo.fase.toLowerCase()}: ${passo.rotulo}${state === 'done' ? ', concluído' : ''}`);
    }));
  }
  /* Live boxes of the panel and the "Agora" strip. */
  function falasAte(index) {
    return frames().slice(0, index + 1).flatMap((item, i) => (item.fala || []).map(entry => ({ ...falaDe(entry), i })));
  }
  function logsAte(index) {
    return frames().slice(0, index + 1).flatMap((item, i) => (item.log || []).map(([ator, evento, detalhe, meta]) => ({ ator, evento, detalhe, t: meta?.t, i })));
  }
  function paintLive() {
    const item = frames()[frame];
    if (!item) return;
    const agora = stripText.querySelector('[data-cx-agora-desc]'), linha = stripText.querySelector('[data-cx-agora-linha]'), pos = strip.querySelector('[data-cx-pos]');
    if (agora) agora.textContent = item.desc || '';
    const zoomDesc = player.querySelector('[data-cx-zoom-desc]'); if (zoomDesc) zoomDesc.textContent = item.desc || '';
    const falas = falasAte(frame), logs = logsAte(frame);
    const atual = falas.filter(entry => entry.i === frame).pop(), evento = logs.filter(entry => entry.i === frame).pop();
    if (linha) {
      linha.textContent = atual ? `${atual.quem}: ${atual.texto}` : evento ? `${evento.ator} · ${evento.evento}` : '';
      linha.dataset.kind = atual ? 'fala' : evento ? 'log' : '';
      stripText.dataset.linha = String(Boolean(linha.textContent));
    }
    if (pos) pos.textContent = `${frame + 1}/${frames().length}`;
    if (side.dataset.mode !== 'live') return;
    const telaBox = sideBody.querySelector('[data-cx-box="tela"] p');
    if (telaBox) telaBox.textContent = item.desc || '';
    const lista = sideBody.querySelector('[data-cx-falas]');
    if (lista) {
      const shown = falas.slice(-8);
      lista.innerHTML = shown.length ? shown.map(entry => `<li${entry.i === frame ? ' data-agora' : ''} data-texto="${escape(norm(entry.texto))}"><b>${escape(entry.quem)}</b> ${escape(entry.texto)}</li>`).join('') : '<li class="cx-vazio">A ligação começa no próximo quadro.</li>';
      lista.scrollTop = lista.scrollHeight;
    }
    const registro = sideBody.querySelector('[data-cx-logs]');
    if (registro) {
      const shown = logs.slice(-6);
      registro.innerHTML = shown.length ? shown.map(entry => `<li${entry.i === frame ? ' data-agora' : ''}><span class="cx-ator" style="--a:${corAtor(entry.ator)}">${escape(entry.ator)}</span><span class="cx-evento"><b>${escape(entry.evento)}</b>${entry.detalhe ? `<small>${escape(entry.detalhe)}</small>` : ''}</span>${entry.t ? `<time>${escape(entry.t)}</time>` : ''}</li>`).join('') : '<li class="cx-vazio">O primeiro evento aparece no próximo quadro.</li>';
    }
    if (audio && !audio.paused) highlightAudio();
  }
  /* Applies one storyboard frame through the engine and syncs the journey, the panel and the strip. */
  function showFrame(instant) {
    const list = frames(), item = list[frame];
    if (!item || !screen) return;
    applyFrame(screen, list, frame, { instant, playing });
    const nextStep = stepOf(frame), stepChanged = nextStep !== step;
    step = nextStep;
    journeyState(body); journeyState(side);
    const now = body.querySelector('[data-cx-now]');
    if (now && stepChanged) now.textContent = placement().passos[step].rotulo;
    const desc = body.querySelector('[data-cx-desc]');
    if (desc) desc.textContent = item.desc;
    const fin = frame === list.length - 1 && (ended() || !live());
    if (stepChanged || fin) status.textContent = `Passo ${step + 1} de 3, ${placement().passos[step].fase.toLowerCase()}. ${item.desc}`;
    paintLive();
    land(frame);
  }
  function paint({ instant = false, force = false } = {}) {
    if (!frames().length) return;
    const next = frameAt(Math.min(elapsed, Math.max(0, total - 1)));
    if (next !== frame || force) { frame = next; showFrame(instant); }
    paintProgress();
  }
  function tick(now) {
    if (!playing) return;
    if (!canPlay()) { stop(); return; }
    elapsed = Math.min(total, elapsed + Math.min(80, Math.max(0, now - last))); last = now;
    paint();
    if (ended()) { stop(); paint({ force: true }); return; }
    raf = requestAnimationFrame(tick);
  }
  function start(fromStart = false) {
    if (fromStart || ended()) { elapsed = 0; paint({ instant: true, force: true }); }
    if (!canPlay()) { setPlayLabel(); return; }
    playing = true; last = performance.now();
    syncMedia(screen, true);
    setPlayLabel(); raf = requestAnimationFrame(tick);
  }
  /* Direct navigation: a frame (arrows, halves of the phone, swipe) or a journey step. */
  function move(to) {
    const count = frames().length;
    held = true; resume = false; stop();
    const target = Math.max(0, Math.min(count - 1, to));
    elapsed = starts[target];
    paint({ instant: !live(), force: true });
    setPlayLabel();
  }
  function goToStep(k) {
    const ids = placement().passos[k].quadros;
    const tapFrame = k === 2 ? ids.find(i => frames()[i].toque) : undefined;
    move(tapFrame ?? ids[0]);
  }
  function togglePlay() {
    if (!open()) { openPeel(); return; }
    if (playing) { held = true; resume = false; stop(); return; }
    // Without motion, each press shows the next frame instead of playing.
    if (!live()) { move(frame >= frames().length - 1 ? 0 : frame + 1); return; }
    visible = visible || player.getClientRects().length > 0;
    held = false;
    mainStage()?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    start(ended());
  }
  const journeyMarkup = (where, k0) => placement().passos.map((item, k) => `<li data-state="${k ? 'next' : 'on'}"><button type="button" data-cx-step="${k}"${where === 'card' && k !== k0 ? ' tabindex="-1"' : ''}><span class="cx-step-n" aria-hidden="true">${k + 1}</span><span class="cx-step-t"><b>${escape(item.fase)}</b><small>${escape(item.rotulo)}</small></span><i class="cx-rail" aria-hidden="true"><i data-cx-rail></i></i></button></li>`).join('');
  function stageMarkup() {
    const ch = channel(), pl = placement();
    const aria = `${ch.name}, ${pl.label}. Exemplo de ${CLIENTES[pl.cliente]?.tipo || 'cliente'}, marca fictícia.`;
    return `<div class="cx-steps"><ol class="cx-journey" data-cx-journey="card" aria-label="Jornada do anúncio em 3 passos">${journeyMarkup('card', 0)}</ol><div class="cx-now-row"><p class="cx-now" aria-hidden="true" data-cx-now></p><button type="button" class="cx-ctl-b cx-ampliar cx-ampliar--topo" data-cx-ampliar aria-label="Ampliar tela">${icon('zoom')}</button></div></div>
      <div class="cx-stage-col"><div class="cx-stage" data-cx-stage data-frames="${pl.quadros.length}" role="group" tabindex="0" aria-label="${escape(aria)}" aria-describedby="cx-desc cx-keys">${renderMock(pl)}<span class="cx-dot" data-cx-dot aria-hidden="true" hidden>1</span><span class="cx-tap" data-cx-tap aria-hidden="true" hidden></span></div>
      <p class="sr-only" id="cx-desc" data-cx-desc></p><span class="sr-only" id="cx-keys">Use as setas para trocar de quadro.</span></div>`;
  }
  /* The panel: always the client, label, objective, sentence, steps, base and contact; while open, the live boxes. */
  function sideMarkup() {
    const ch = channel(), pl = placement(), c = CLIENTES[pl.cliente] || {};
    const organic = /Orgânico|não é anúncio/.test(pl.selo);
    const vivo = side.dataset.mode === 'live';
    const caso = `${ch.name} · ${pl.label}`;
    const audioInfo = pl.audio?.src ? Math.round(pl.audio.duracaoS || (pl.audio.durationMs || 0) / 1000) : 0;
    return [
      `<div class="cx-side-meta"><p class="cx-side-cliente">${marca(pl.cliente, 'circulo', 'cx-client-mark')}<span><b>${escape(c.marca || '')}</b>, marca fictícia · ${escape(c.tipo || '')}</span></p><p class="cx-label" data-kind="${organic ? 'organic' : 'ad'}">${escape(pl.selo)}</p></div>`,
      `<h3 class="cx-side-frase">${escape(pl.frase)}</h3>`,
      pl.objetivo ? `<p class="cx-side-objetivo"><b>Objetivo</b> ${escape(pl.objetivo)}</p>` : '',
      `<ol class="cx-journey cx-side-steps" data-cx-journey="side" aria-label="Jornada do anúncio em 3 passos">${journeyMarkup('side')}</ol>`,
      vivo ? `<section class="cx-box" data-cx-box="tela"><h4>Na tela</h4><p></p></section>` : '',
      vivo && temFala() ? `<section class="cx-box cx-box--fala" data-cx-box="fala"><h4>Transcrição</h4><p class="cx-box-nota">Fora do celular: o app não mostra a transcrição.</p>${audioInfo ? `<button type="button" class="cx-ouvir" data-cx-ouvir aria-pressed="false">${icon('ear')}<span>Ouvir a ligação (${audioInfo} s)</span></button>` : ''}<ol class="cx-falas" data-cx-falas aria-live="off"></ol></section>` : '',
      vivo && temLog() ? `<section class="cx-box cx-box--log" data-cx-box="log"><h4>Nos bastidores</h4><ol class="cx-logs" data-cx-logs></ol></section>` : '',
      pl.base ? `<p class="cx-side-base"><b>Baseado em</b> ${escape(pl.base)}</p>` : '',
      `<div class="cx-side-acoes"><button type="button" class="campaign-decision" data-cx-open aria-expanded="${open()}">${open() ? 'Voltar à peça' : 'Ver o anúncio no canal'}</button><a href="#contato" data-contact-service="Campanhas e anúncios" data-contact-case="${escape(caso)}">Quero algo assim <span aria-hidden="true">↓</span></a></div>`,
      `<p class="sp-note-fine" data-note-fine>${escape(fineFor(renderMock(pl)))}</p>`,
    ].join('');
  }
  function paintSide(rise = false) {
    sideBody.innerHTML = sideMarkup();
    journeyState(side); paintProgress(); paintLive();
    if (rise && live()) {
      rising.splice(0).forEach(animation => { try { animation.cancel(); } catch {} });
      [...sideBody.children].forEach((node, j) => {
        const animation = motion.spring(node, p => ({ opacity: clamp(p), transform: `translateY(${16 * (1 - p)}px)` }), { delay: 80 + j * 40 });
        if (animation) rising.push(animation);
      });
    }
  }
  function header() {
    const ch = channel(), pl = placement(), id = CHANNEL_LOGO[ch.id], many = ch.placements.length > 1;
    brand.innerHTML = (id ? logoSvg(id, { altura: 22, classe: 'cx-logo' }) : ch.glifo ? glifo(ch.glifo, 'cx-logo cx-logo--glifo') : '') + `<b>${nomeCanal(ch)}</b>` + (many ? '' : `<small class="cx-formato-unico">Formato: ${escape(pl.label)}</small>`);
    /* Formats as one segmented control (lab: smiile-segmented-control): a thumb slides to the chosen format;
       rebuilt only when the channel changes. A channel with one format has no control. */
    if (!many) formatos.remove(); else if (!formatos.isConnected) top.append(formatos);
    // Under 420px of row the formats use their short label (placement.curto) when they have one.
    const curto = many && usarCurto();
    if (placements.dataset.channel !== ch.id || placements.dataset.curto !== String(curto)) {
      placements.dataset.channel = ch.id; placements.dataset.curto = String(curto);
      placements.innerHTML = many ? '<span class="cx-thumb is-instant" aria-hidden="true"></span>' + ch.placements.map((item, i) => {
        const short = curto && item.curto && item.curto.length < item.label.length;
        return `<button type="button" class="cx-placement" aria-pressed="${i === placementIndex}" data-cx-placement="${i}"${short ? ` aria-label="${escape(item.label)}"` : ''}>${escape(short ? item.curto : item.label)}</button>`;
      }).join('') : '';
    } else placements.querySelectorAll('[data-cx-placement]').forEach((item, i) => item.setAttribute('aria-pressed', String(i === placementIndex)));
    if (many) { placements.setAttribute('role', 'group'); placements.setAttribute('aria-label', 'Formato do anúncio'); }
    requestAnimationFrame(thumb);
    player.dataset.platform = ch.id; player.dataset.placement = pl.id;
    const cor = id ? LOGOS[id].cor : '#1e4530';
    player.style.setProperty('--ch', cor); side.style.setProperty('--ch', cor);
    lab.dataset.placement = String(placementIndex);
  }
  function usarCurto() { return (formatos.clientWidth || top.clientWidth || player.clientWidth) < 420; }
  function thumb() {
    const knob = placements.querySelector('.cx-thumb'), on = placements.querySelector('[aria-pressed="true"]');
    if (!knob || !on || !on.offsetWidth) return;
    knob.style.width = on.offsetWidth + 'px'; knob.style.height = on.offsetHeight + 'px';
    knob.style.transform = `translate(${on.offsetLeft}px,${on.offsetTop}px)`;
    // A row that does not fit scrolls inside itself, with a fade at the edge that still has formats.
    const over = placements.scrollWidth > placements.clientWidth + 1;
    placements.dataset.overflow = String(over);
    if (over && (on.offsetLeft < placements.scrollLeft || on.offsetLeft + on.offsetWidth > placements.scrollLeft + placements.clientWidth)) on.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'instant' });
    edge();
    if (knob.classList.contains('is-instant')) requestAnimationFrame(() => requestAnimationFrame(() => knob.classList.remove('is-instant')));
  }
  function edge() { placements.dataset.end = String(placements.scrollLeft + placements.clientWidth >= placements.scrollWidth - 2); }
  placements.addEventListener('scroll', edge, { passive: true });
  /* From 900px (and in short landscape) the header and the formats sit at the top of the panel. */
  function arrange() {
    // The strip: sticky under the phone on phones (text and controls); in the panel from 900px (controls only).
    if (wideQuery.matches) { if (top.parentElement !== slot) slot.append(top); if (strip.parentElement !== slot) slot.append(strip); stripText.remove(); }
    else {
      if (top.parentElement !== player) player.prepend(top);
      if (strip.parentElement !== player) body.after(strip);
      if (!stripText.isConnected) strip.prepend(stripText);
    }
    side.dataset.wide = String(wideQuery.matches);
    requestAnimationFrame(thumb);
  }
  function compact() { phone?.classList.toggle('ch-iphone--compacto', compactQuery.matches); }
  /* Replaces the placement. With motion and an open peel, a ghost of the old
     placement leaves to the side while the new one springs in from the other. */
  function render({ animate = false, direction = 1 } = {}) {
    stop(); cancelAnimations(); held = false; resume = false; generation++;
    stopAudio();
    if (zoom.open) { restorePhone(); zoom.close(); }
    const moving = animate && live() && open() && body.childElementCount > 0;
    if (moving) {
      ghost = body.cloneNode(true);
      ghost.removeAttribute('data-cx-body');
      ghost.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      ghost.querySelectorAll('[aria-live]').forEach(node => node.removeAttribute('aria-live'));
      ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
      ghost.classList.add('cx-ghost');
      ghost.style.top = body.offsetTop + 'px'; ghost.style.left = body.offsetLeft + 'px';
      ghost.style.width = body.offsetWidth + 'px'; ghost.style.height = body.offsetHeight + 'px';
      player.append(ghost);
    }
    header();
    body.innerHTML = stageMarkup();
    screen = body.querySelector('.cm-screen'); phone = body.querySelector('.ch-iphone');
    compact();
    timeline();
    elapsed = 0; frame = -1; step = -1;
    paintSide(animate);
    paint({ instant: true, force: true }); setPlayLabel();
    if (moving) {
      const old = ghost;
      const out = motion.animate(old, [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-30 * direction}px) scale(.97)` }], { duration: 300 });
      if (out) { animations.push(out); out.finished.catch(() => {}).finally(() => { old.remove(); if (ghost === old) ghost = null; }); } else { old.remove(); ghost = null; }
      const entry = motion.spring(body.querySelector('.cx-stage'), p => ({ opacity: clamp(p * 1.8), transform: `translateX(${42 * direction * (1 - p)}px) scale(${.96 + .04 * p})` }), { duration: 620 });
      if (entry) animations.push(entry);
      [...body.querySelectorAll('.cx-journey > li, .cx-now')].forEach((node, j) => {
        const rise = motion.spring(node, p => ({ opacity: clamp(p), transform: `translateY(${16 * (1 - p)}px)` }), { delay: 80 + j * 45 });
        if (rise) animations.push(rise);
      });
      // The entrance moves the stage: measure the point again once it has landed.
      if (entry) entry.finished.catch(() => {}).then(() => land(frame));
    }
    if (open()) start(true);
  }
  function syncChannel() {
    const id = lab.dataset.channel || channels[0].id;
    if (id === channelId) return;
    const before = channels.findIndex(item => item.id === channelId);
    const after = channels.findIndex(item => item.id === id);
    const direction = lab.dataset.direction === 'prev' || (before > after && before !== -1) ? -1 : 1;
    const first = channelId === null;
    channelId = id; placementIndex = 0;
    render({ animate: !first, direction });
  }
  function choosePlacement(index, { focus = true } = {}) {
    if (index !== placementIndex) {
      const direction = index > placementIndex ? 1 : -1;
      placementIndex = index;
      render({ animate: true, direction });
    }
    if (focus) placements.querySelector('[data-cx-placement="' + index + '"]')?.focus({ preventScroll: true });
    // A format on screen keeps the phone in view (phones scroll to it when it is out of sight).
    if (open()) mainStage()?.scrollIntoView({ block: 'nearest', behavior: live() ? 'smooth' : 'instant' });
  }
  function openPeel() { if (card?.dataset.side !== 'back') card?.querySelector('[data-peel-grip]')?.click(); }
  function closePeel() { if (card?.dataset.side === 'back') card.querySelector('[data-sp-card-turn="back"]')?.click(); }

  /* Ampliar: the same phone moves (not a copy) into a full-screen dialog; Esc brings it back. */
  function restorePhone() { if (phone && phone.parentElement === zoomStage) mainStage()?.prepend(phone); zoomStage.querySelectorAll('.ch-iphone').forEach(node => node.remove()); }
  function ampliar() {
    if (!phone || zoom.open || typeof zoom.showModal !== 'function') return;
    zoomStage.querySelectorAll('.ch-iphone').forEach(node => node.remove());
    zoomStage.prepend(phone);
    zoom.showModal();
    zoom.querySelector('[data-cx-zoom-close]').focus({ preventScroll: true });
    paintLive(); land(frame);
  }
  zoom.addEventListener('close', () => {
    restorePhone();
    clearDot(zoomStage); hideTap(zoomStage);
    [...document.querySelectorAll('[data-cx-ampliar]')].find(button => player.contains(button) || side.contains(button) ? button.offsetParent : false)?.focus({ preventScroll: true });
    land(frame);
  });
  zoom.addEventListener('click', event => { if (event.target === zoom) zoom.close(); });

  /* Optional call audio (placement.audio = {src, segmentos, duracaoS}); it never plays by itself and highlights the line being spoken. */
  function segmentos() { const a = placement().audio || {}; return (a.segmentos || a.segments || []).map(seg => ({ texto: norm(seg.texto || seg.text), startMs: seg.startMs, endMs: seg.endMs })); }
  function highlightAudio() {
    if (!audio) return;
    const ms = audio.currentTime * 1000, seg = segmentos().find(item => ms >= item.startMs && ms < item.endMs);
    sideBody.querySelectorAll('[data-cx-falas] li').forEach(li => li.toggleAttribute('data-falando', Boolean(seg) && li.dataset.texto === seg.texto));
    if (!seg) return;
    const at = frames().findIndex(item => (item.fala || []).some(entry => norm(falaDe(entry).texto) === seg.texto));
    if (at >= 0 && at !== frame) move(at);
  }
  function stopAudio() {
    if (!audio) return;
    audio.pause(); audio = null;
    side.querySelectorAll('[data-cx-ouvir]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  }
  function toggleAudio(button) {
    if (audio && !audio.paused) { stopAudio(); return; }
    const src = placement().audio?.src;
    if (!src) return;
    stop(); held = true;
    audio = new Audio(src);
    audio.addEventListener('timeupdate', highlightAudio);
    audio.addEventListener('ended', stopAudio);
    audio.play().then(() => button.setAttribute('aria-pressed', 'true')).catch(stopAudio);
  }

  function onClick(event) {
    const button = event.target.closest('button');
    if (button) {
      if (button.matches('[data-cx-placement]')) { const i = Number(button.dataset.cxPlacement); if (!open()) openPeel(); choosePlacement(i); }
      else if (button.matches('[data-cx-step]')) { if (!open()) openPeel(); goToStep(Number(button.dataset.cxStep)); }
      else if (button.matches('[data-cx-prev]')) move(frame - 1);
      else if (button.matches('[data-cx-next]')) move(frame + 1);
      else if (button.matches('[data-cx-toggle], [data-cx-play]')) togglePlay();
      else if (button.matches('[data-cx-ampliar]')) ampliar();
      else if (button.matches('[data-cx-zoom-close]')) zoom.close();
      else if (button.matches('[data-cx-open]')) { if (open()) closePeel(); else openPeel(); }
      else if (button.matches('[data-cx-ouvir]')) toggleAudio(button);
      return;
    }
    // Tapping the left or right part of the phone moves between frames.
    const box = event.target.closest('[data-cx-stage], [data-cx-zoom-stage]');
    if (box) {
      const r = box.getBoundingClientRect();
      move(frame + (event.clientX < r.left + r.width * .31 ? -1 : 1));
    }
  }
  player.addEventListener('click', onClick);
  side.addEventListener('click', onClick);
  function onKey(event) {
    if (event.target.matches('[data-cx-stage]') && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault(); move(frame + (event.key === 'ArrowRight' ? 1 : -1)); return;
    }
    if (zoom.open && (event.key === 'ArrowRight' || event.key === 'ArrowLeft') && !event.target.closest('button')) {
      event.preventDefault(); move(frame + (event.key === 'ArrowRight' ? 1 : -1)); return;
    }
    const stepButton = event.target.closest('[data-cx-step]');
    if (stepButton && ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const k = Number(stepButton.dataset.cxStep);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (k + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : 2)) % 3;
      if (!open()) openPeel();
      goToStep(next);
      stepButton.closest('[data-cx-journey]')?.querySelector(`[data-cx-step="${next}"]`)?.focus({ preventScroll: true });
    }
  }
  player.addEventListener('keydown', onKey);
  side.addEventListener('keydown', onKey);
  // Direct interaction with the phone owns horizontal swipes; vertical scrolling stays native.
  let pointer = null;
  player.addEventListener('pointerdown', event => { pointer = event.target.closest('[data-cx-stage], [data-cx-zoom-stage]') ? { x: event.clientX, y: event.clientY } : null; }, { passive: true });
  player.addEventListener('pointerup', event => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { event.stopPropagation(); move(frame + (dx < 0 ? 1 : -1)); }
  }, { passive: true });
  player.addEventListener('pointercancel', () => { pointer = null; }, { passive: true });

  /* Deep link and the cx:abrir event: channel, open paper, format, phone in view. */
  function abrir({ canal, formato } = {}) {
    const ch = channels.find(item => item.id === canal);
    if (!ch) return false;
    const tab = lab.querySelector(`[data-sp-tab="${ch.id}"]`);
    if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    syncChannel();
    openPeel();
    let index = ch.placements.findIndex(item => item.id === formato);
    if (index < 0 && /^\d+$/.test(String(formato ?? ''))) index = Math.min(ch.placements.length - 1, Number(formato));
    if (index >= 0 && index !== placementIndex) choosePlacement(index, { focus: false });
    else if (index >= 0 || formato === undefined) { stop(); elapsed = 0; paint({ instant: true, force: true }); if (open()) start(true); }
    requestAnimationFrame(() => {
      // Wide screens: the player's top on screen, or further down when the phone would end below the window.
      if (wideQuery.matches) {
        const st = mainStage()?.getBoundingClientRect(), top = player.getBoundingClientRect().top;
        scrollBy({ top: st ? Math.min(Math.max(top, st.bottom - innerHeight + 12), st.top - 12) : top, behavior: live() ? 'smooth' : 'instant' });
      } else (mainStage() || player).scrollIntoView({ block: 'nearest', behavior: live() ? 'smooth' : 'instant' });
    });
    return true;
  }
  function fromHash() {
    const match = /^#laboratorio\/([\w-]+)(?:\/([\w-]+))?\/?$/.exec(decodeURIComponent(location.hash || ''));
    if (match) abrir({ canal: match[1], formato: match[2] });
  }
  window.addEventListener('cx:abrir', event => abrir(event.detail || {}));
  window.addEventListener('hashchange', fromHash);

  new MutationObserver(syncChannel).observe(lab, { attributes: true, attributeFilter: ['data-channel'] });
  // Out of view, a hidden tab and the global pause stop the journey; it goes on from the same point when that ends.
  const halt = () => { if (playing) resume = true; stop(); };
  const proceed = () => { if (resume && visible && !held && open() && live()) { resume = false; start(false); } else setPlayLabel(); };
  new MutationObserver(() => { if (document.body.classList.contains('is-paused')) { halt(); paint({ force: true }); } else proceed(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  // Opening the peel starts the journey once and turns the panel live; closing stops it and rewinds.
  new MutationObserver(() => {
    side.dataset.mode = open() ? 'live' : 'intro';
    if (underlay.inert) { stop(); stopAudio(); cancelAnimations(); held = false; resume = false; elapsed = 0; if (zoom.open) zoom.close(); paintSide(); paint({ instant: true, force: true }); setPlayLabel(); }
    else { paintSide(); start(true); }
  }).observe(underlay, { attributes: true, attributeFilter: ['inert'] });
  // A journey that has not started (and was not paused by the visitor) starts when it comes into view.
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) halt(); else if (!playing && !held && elapsed === 0 && open()) start(true); else if (!playing) proceed(); }, { threshold: .02 }).observe(player);
  else visible = true;
  if ('ResizeObserver' in window) new ResizeObserver(() => { placements.querySelector('.cx-thumb')?.classList.add('is-instant'); thumb(); if (frame >= 0) land(frame); }).observe(body);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { halt(); stopAudio(); } else if (!playing) proceed(); });
  reduce.addEventListener('change', () => { stop(); cancelAnimations(); paint({ instant: true, force: true }); });
  wideQuery.addEventListener('change', arrange);
  narrowQuery.addEventListener('change', () => { if (channelId) header(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (channelId && channel().placements.length > 1 && placements.dataset.curto !== String(usarCurto())) header(); }).observe(formatos);
  compactQuery.addEventListener('change', compact);
  motion.onStop(() => { halt(); ghost?.remove(); ghost = null; });
  arrange();
  syncChannel();
  if (/^#laboratorio\//.test(location.hash)) requestAnimationFrame(fromHash);
  return { root: player, side, abrir, stop, live: engineLive, reset: () => { stop(); elapsed = 0; paint({ instant: true, force: true }); setPlayLabel(); } };
}
