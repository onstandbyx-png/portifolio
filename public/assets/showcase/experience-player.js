/** Channel placement behind the campaign page-peel.
 * For the selected channel it shows, inside the orange iPhone, a fictitious
 * client's ad in its native placement and plays the journey as a finite
 * storyboard: hook, retention beat, the tap on the CTA and the native
 * conversion screen, stopping on that screen with a replay control. Around the
 * phone only a compact interface: official platform mark and name, format
 * chips, the ad label, the client chip ("marca fictícia"), a three-step journey
 * bar synced to the storyboard and one numbered point on the mock.
 * Switching channels while the peel is open keeps it open: the old placement
 * leaves to the side (30px, 300ms), the new one enters with a spring (42px,
 * 620ms) and the journey rises in sequence. Without motion (reduced motion,
 * global pause, hidden tab) nothing plays by itself: the steps are static and
 * selectable, and the header button shows the next frame.
 */
import { createMotion, clamp } from '../sections/motion.js';
import { channels, channelById, renderMock, marca, clienteChip, CLIENTES } from './campaign-channels.js';
import { logoSvg, CHANNEL_LOGO } from './channel-logos.js';

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICONS = {
  play: 'M8 5.5v13l10.5-6.5z',
  pause: 'M8 5.5v13M16 5.5v13',
  replay: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4.5H9',
  next: 'M5 12h13M13 6.5 18.5 12 13 17.5',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[name]}"/></svg>`;
/* Fatos studio photos are AI-generated: the fine print says so where they appear. */
const AI_IMAGES = /campanha-(crencas|esportes|negocios|nerd)/;
const FINE = 'Exemplo ilustrativo, marca fictícia. Interface aproximada.';

export function mountCampaignExperience(lab, underlay) {
  if (!lab || !underlay || underlay.querySelector('.cx-player')) return null;
  const motion = createMotion();
  const player = document.createElement('section');
  player.className = 'cx-player'; player.dataset.noCardFlip = '';
  player.setAttribute('aria-label', 'Como o anúncio aparece no canal');
  player.innerHTML = [
    '<header class="cx-head"><p class="cx-brand" data-cx-brand></p>',
    `<button type="button" class="cx-play" data-cx-play>${icon('play')}<span data-cx-play-label>Reproduzir</span></button></header>`,
    '<div class="cx-chips"><div class="cx-placements" data-cx-placements></div><span class="cx-label" data-cx-label></span></div>',
    '<p class="cx-client" data-cx-client></p>',
    '<div class="cx-body" data-cx-body></div>',
    '<p class="sr-only" role="status" aria-live="polite" data-cx-status></p>',
  ].join('');
  underlay.insertBefore(player, underlay.querySelector('.sp-campaign-note-slot'));
  const noteSlot = underlay.querySelector('.sp-campaign-note-slot');
  const $ = s => player.querySelector(s);
  const brand = $('[data-cx-brand]'), placements = $('[data-cx-placements]'), label = $('[data-cx-label]'), client = $('[data-cx-client]');
  const body = $('[data-cx-body]'), play = $('[data-cx-play]'), playLabel = $('[data-cx-play-label]'), status = $('[data-cx-status]');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let channelId = null, placementIndex = 0, elapsed = 0, frame = -1, step = -1, playing = false, raf = 0, last = 0, visible = false, held = false;
  let ghost = null, animations = [], settleTimer = 0, starts = [], total = 0;
  const channel = () => channelById(channelId);
  const placement = () => channel().placements[placementIndex];
  const frames = () => placement().quadros;
  const open = () => !underlay.inert;
  const live = () => motion.available() && !reduce.matches;
  const canPlay = () => live() && visible && open() && lab.dataset.channel === channelId;
  const screenEl = () => body.querySelector('.cm-screen');
  const stage = () => body.querySelector('[data-cx-stage]');
  const stepOf = index => Math.max(0, placement().passos.findIndex(item => item.quadros.includes(index)));
  const ended = () => elapsed >= total;

  function timeline() {
    let at = 0;
    starts = frames().map(item => { const start = at; at += item.ms; return start; });
    total = at;
  }
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
    const box = stage(); if (box) box.dataset.playing = String(playing);
  }
  function stop() { playing = false; cancelAnimationFrame(raf); raf = 0; setPlayLabel(); }

  /* Rails of the journey and the video progress follow the elapsed time every tick. */
  function paintProgress() {
    const list = placement().passos;
    body.querySelectorAll('[data-cx-rail]').forEach((rail, k) => {
      const ids = list[k].quadros, from = starts[ids[0]], to = starts[ids[ids.length - 1]] + frames()[ids[ids.length - 1]].ms;
      let p = clamp((elapsed - from) / Math.max(1, to - from));
      if (!live() && k === step) p = 1;
      if (k < step) p = 1;
      rail.style.setProperty('--p', p.toFixed(3));
    });
    const bar = screenEl()?.querySelector('[data-cx-progress]');
    if (bar) {
      let done = 0, sum = 0;
      frames().forEach((item, i) => { if (!item.video) return; sum += item.ms; done += clamp(elapsed - starts[i], 0, item.ms); });
      if (sum) bar.style.transform = 'scaleX(' + (done / sum).toFixed(3) + ')';
    }
  }
  /* The numbered point of the active step and, on a tap frame, the finger. Both
     are measured once the scene has settled (after its 420ms transition). */
  function activeScene() { return screenEl()?.querySelector('.cm-scene[data-pos="on"]'); }
  function place(node, rect, x, y) {
    const box = stage().getBoundingClientRect(), tela = stage().querySelector('.ch-iphone-tela').getBoundingClientRect();
    // Never over the status bar and the Dynamic Island (62 of the 412 logical px), never off the screen.
    const px = clamp(x, tela.left + 14, tela.right - 14) - box.left, py = clamp(y, tela.top + tela.width * 62 / 412, tela.bottom - 14) - box.top;
    node.style.left = (px / box.width * 100).toFixed(2) + '%';
    node.style.top = (py / box.height * 100).toFixed(2) + '%';
  }
  function target(selector) {
    const scene = activeScene();
    if (!scene) return null;
    const found = [...scene.querySelectorAll(selector)].filter(node => {
      const r = node.getBoundingClientRect();
      return r.width > 0 && getComputedStyle(node).visibility === 'visible';
    });
    return found[found.length - 1] || null;
  }
  function positionDot(animate) {
    const dot = body.querySelector('[data-cx-dot]');
    if (!dot) return;
    const n = step + 1, node = target(`[data-hs~="${n}"]`);
    if (!node) { dot.hidden = true; return; }
    const r = node.getBoundingClientRect();
    const was = dot.hidden || dot.textContent !== String(n);
    dot.textContent = String(n);
    // On a picture or a card the point sits inside its corner; on a line of text or a button, just above its right end.
    // data-hs-at="tl" keeps the point inside the top-left corner (away from an ad label in the top right).
    const big = r.height > 64, left = node.dataset.hsAt === 'tl';
    place(dot, r, left ? r.left + 20 : big ? r.right - 20 : r.right - 4, big || left ? r.top + 20 : r.top - 12);
    dot.hidden = false;
    if (animate && was && live()) {
      const spring = motion.spring(dot, p => ({ transform: `translate(-50%,-50%) scale(${.6 + .4 * p})`, opacity: clamp(p * 1.6) }), { duration: 420 });
      if (spring) animations.push(spring);
      dot.classList.remove('is-ping'); void dot.offsetWidth; dot.classList.add('is-ping');
    }
  }
  function showTap() {
    const tap = body.querySelector('[data-cx-tap]'), key = frames()[frame]?.toque, screen = screenEl();
    if (!tap || !screen) return;
    if (!key) { tap.hidden = true; delete screen.dataset.tap; return; }
    const node = target(`[data-tap="${key}"]`);
    if (!node) { tap.hidden = true; return; }
    const r = node.getBoundingClientRect();
    place(tap, r, r.left + r.width / 2, r.top + r.height / 2);
    tap.hidden = false;
    tap.classList.toggle('is-static', !live());
    tap.classList.remove('is-on'); void tap.offsetWidth; tap.classList.add('is-on');
    screen.dataset.tap = key;
  }
  function settle(animate, moved) {
    clearTimeout(settleTimer);
    const dot = body.querySelector('[data-cx-dot]'), tap = body.querySelector('[data-cx-tap]');
    if (tap) { tap.hidden = true; tap.classList.remove('is-on'); }
    const wait = live() ? 440 : 20;
    // The point stays put inside a scene; it only hides while a new scene slides in.
    if (dot && live() && moved) dot.hidden = true;
    settleTimer = setTimeout(() => { positionDot(animate); showTap(); }, wait);
  }
  /* Applies one storyboard frame: scene on screen, the scene under it (a sheet or
     a pushed page keeps the previous screen visible), state tokens, journey. */
  function applyFrame(instant) {
    const list = frames(), item = list[frame], screen = screenEl();
    if (!item || !screen) return;
    if (instant) screen.classList.add('is-instant');
    const moved = screen.dataset.scene !== item.cena;
    screen.dataset.frame = String(frame);
    screen.dataset.scene = item.cena;
    // A scene left behind keeps the state it last showed (the video under a sheet stays on its last cut).
    const kept = {};
    for (let k = 0; k < frame; k++) if (list[k].cena !== item.cena) kept[list[k].cena] = list[k].estado || '';
    screen.dataset.state = [...Object.values(kept), item.estado || ''].join(' ').replace(/\s+/g, ' ').trim();
    delete screen.dataset.tap;
    const scenes = [...screen.querySelectorAll('.cm-scene')];
    const current = scenes.find(node => node.dataset.scene === item.cena) || scenes[0];
    let previous = null;
    for (let k = frame - 1; k >= 0; k--) if (list[k].cena !== item.cena) { previous = list[k].cena; break; }
    const kind = current.dataset.kind;
    screen.dataset.enter = kind;
    scenes.forEach(node => { node.dataset.pos = node === current ? 'on' : (kind === 'push' || kind === 'sheet') && node.dataset.scene === previous ? 'under' : 'off'; });
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.remove('is-instant')));
    const nextStep = stepOf(frame), stepChanged = nextStep !== step;
    step = nextStep;
    const fin = frame === list.length - 1 && (ended() || !live());
    body.querySelectorAll('.cx-journey li').forEach((li, k) => {
      const state = k < step || (fin && k === step) ? 'done' : k === step ? 'on' : 'next';
      li.dataset.state = state;
      const button = li.querySelector('button');
      if (k === step) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      button.tabIndex = k === step ? 0 : -1;
      button.setAttribute('aria-label', `Passo ${k + 1}, ${placement().passos[k].fase.toLowerCase()}: ${placement().passos[k].rotulo}${state === 'done' ? ', concluído' : ''}`);
    });
    const desc = body.querySelector('[data-cx-desc]');
    if (desc) desc.textContent = item.desc;
    if (stepChanged || fin) status.textContent = `Passo ${step + 1} de 3, ${placement().passos[step].fase.toLowerCase()}. ${item.desc}`;
    settle(!instant, moved || stepChanged);
  }
  function paint({ instant = false, force = false } = {}) {
    if (!frames().length) return;
    const next = frameAt(Math.min(elapsed, Math.max(0, total - 1)));
    if (next !== frame || force) { frame = next; applyFrame(instant); }
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
    setPlayLabel(); raf = requestAnimationFrame(tick);
  }
  /* Direct navigation: a frame (arrows, halves of the phone, swipe) or a journey step. */
  function move(to) {
    const count = frames().length;
    held = true; stop();
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
  function stageMarkup() {
    const ch = channel(), pl = placement();
    const aria = `${ch.name}, ${pl.label}. Exemplo de ${CLIENTES[pl.cliente].tipo}, marca fictícia.`;
    const steps = pl.passos.map((item, k) => `<li data-state="${k ? 'next' : 'on'}"><button type="button" data-cx-step="${k}"><span class="cx-step-n" aria-hidden="true">${k + 1}</span><span class="cx-step-t"><b>${escape(item.fase)}</b><small>${escape(item.rotulo)}</small></span><i class="cx-rail" aria-hidden="true"><i data-cx-rail></i></i></button></li>`).join('');
    return `<div class="cx-stage-col"><div class="cx-stage" data-cx-stage data-frames="${pl.quadros.length}" role="group" tabindex="0" aria-label="${escape(aria)}" aria-describedby="cx-desc cx-keys">${renderMock(pl)}<span class="cx-dot" data-cx-dot aria-hidden="true" hidden>1</span><span class="cx-tap" data-cx-tap aria-hidden="true" hidden></span></div><p class="sr-only" id="cx-desc" data-cx-desc></p><span class="sr-only" id="cx-keys">Use as setas para trocar de quadro.</span></div>
      <div class="cx-side"><ol class="cx-journey" aria-label="Jornada do anúncio em 3 passos">${steps}</ol></div>`;
  }
  function header() {
    const ch = channel(), pl = placement(), id = CHANNEL_LOGO[ch.id];
    brand.innerHTML = (id ? logoSvg(id, { altura: 22, classe: 'cx-logo' }) : '') + `<b>${escape(ch.name)}</b>`;
    placements.innerHTML = ch.placements.length > 1
      ? `<span class="sr-only" id="cx-format-label">Formato do anúncio</span>` + ch.placements.map((item, i) => `<button type="button" class="cx-placement" aria-pressed="${i === placementIndex}" data-cx-placement="${i}" aria-describedby="cx-format-label">${escape(item.label)}</button>`).join('')
      : `<span class="cx-placement cx-placement--static">${escape(pl.label)}</span>`;
    placements.setAttribute('role', ch.placements.length > 1 ? 'group' : 'presentation');
    if (ch.placements.length > 1) placements.setAttribute('aria-label', 'Formato do anúncio'); else placements.removeAttribute('aria-label');
    label.textContent = pl.selo;
    label.dataset.kind = /Orgânico|não é anúncio/.test(pl.selo) ? 'organic' : 'ad';
    client.innerHTML = `${marca(pl.cliente, 'circulo', 'cx-client-mark')}<span>${escape(clienteChip(pl.cliente)).replace('marca fictícia', '<b>marca fictícia</b>')}</span>`;
    const note = noteSlot?.querySelector('[data-note-title]');
    if (note) note.textContent = pl.frase;
    const fine = noteSlot?.querySelector('[data-note-fine]');
    if (fine) fine.textContent = FINE + (AI_IMAGES.test(renderMock(pl)) ? ' Imagens geradas por IA.' : '');
    player.dataset.platform = ch.id; player.dataset.placement = pl.id;
    lab.dataset.placement = String(placementIndex);
  }
  /* Replaces the placement. With motion and an open peel, a ghost of the old
     placement leaves to the side while the new one springs in from the other. */
  function render({ animate = false, direction = 1 } = {}) {
    stop(); cancelAnimations(); held = false; clearTimeout(settleTimer);
    const moving = animate && live() && open() && body.childElementCount > 0;
    if (moving) {
      ghost = body.cloneNode(true);
      ghost.removeAttribute('data-cx-body');
      ghost.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      ghost.querySelectorAll('[data-campaign-note],[aria-live],[data-note-title],[data-note-fine]').forEach(node => { node.removeAttribute('data-campaign-note'); node.removeAttribute('aria-live'); node.removeAttribute('data-note-title'); node.removeAttribute('data-note-fine'); });
      ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
      ghost.classList.add('cx-ghost');
      ghost.style.top = body.offsetTop + 'px'; ghost.style.left = body.offsetLeft + 'px';
      ghost.style.width = body.offsetWidth + 'px'; ghost.style.height = body.offsetHeight + 'px';
      player.append(ghost);
    }
    noteSlot?.remove();
    header();
    body.innerHTML = stageMarkup();
    if (noteSlot) body.querySelector('.cx-side').append(noteSlot);
    timeline();
    elapsed = 0; frame = -1; step = -1;
    paint({ instant: true, force: true }); setPlayLabel();
    if (moving) {
      const old = ghost;
      const out = motion.animate(old, [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-30 * direction}px) scale(.97)` }], { duration: 300 });
      if (out) { animations.push(out); out.finished.catch(() => {}).finally(() => { old.remove(); if (ghost === old) ghost = null; }); } else { old.remove(); ghost = null; }
      const entry = motion.spring(body.querySelector('.cx-stage'), p => ({ opacity: clamp(p * 1.8), transform: `translateX(${42 * direction * (1 - p)}px) scale(${.96 + .04 * p})` }), { duration: 620 });
      if (entry) animations.push(entry);
      [...body.querySelectorAll('.cx-journey > li, .cx-side .sp-campaign-note > *')].forEach((node, j) => {
        const rise = motion.spring(node, p => ({ opacity: clamp(p), transform: `translateY(${16 * (1 - p)}px)` }), { delay: 80 + j * 45 });
        if (rise) animations.push(rise);
      });
      // The entrance moves the stage: measure the point again once it has landed.
      clearTimeout(settleTimer); settleTimer = setTimeout(() => { positionDot(true); showTap(); }, 680);
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
  function choosePlacement(index) {
    if (index === placementIndex) return;
    const direction = index > placementIndex ? 1 : -1;
    placementIndex = index;
    render({ animate: true, direction });
    placements.querySelector('[data-cx-placement="' + index + '"]')?.focus({ preventScroll: true });
  }
  player.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button) {
      if (button.matches('[data-cx-placement]')) choosePlacement(Number(button.dataset.cxPlacement));
      else if (button.matches('[data-cx-step]')) goToStep(Number(button.dataset.cxStep));
      return;
    }
    // Tapping the left or right part of the phone moves between frames.
    const box = event.target.closest('[data-cx-stage]');
    if (box) {
      const r = box.getBoundingClientRect();
      move(frame + (event.clientX < r.left + r.width * .31 ? -1 : 1));
    }
  });
  play.addEventListener('click', () => {
    if (playing) { held = true; stop(); return; }
    // Without motion, each press shows the next frame instead of playing.
    if (!live()) { move(frame >= frames().length - 1 ? 0 : frame + 1); return; }
    visible = visible || player.getClientRects().length > 0;
    held = false;
    start(ended());
  });
  player.addEventListener('keydown', event => {
    if (event.target.matches('[data-cx-stage]') && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault(); move(frame + (event.key === 'ArrowRight' ? 1 : -1)); return;
    }
    const stepButton = event.target.closest('[data-cx-step]');
    if (stepButton && ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const k = Number(stepButton.dataset.cxStep);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (k + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : 2)) % 3;
      goToStep(next);
      body.querySelector(`[data-cx-step="${next}"]`)?.focus({ preventScroll: true });
    }
  });
  // Direct interaction with the phone owns horizontal swipes; vertical scrolling stays native.
  let pointer = null;
  player.addEventListener('pointerdown', event => { pointer = event.target.closest('[data-cx-stage]') ? { x: event.clientX, y: event.clientY } : null; }, { passive: true });
  player.addEventListener('pointerup', event => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { event.stopPropagation(); move(frame + (dx < 0 ? 1 : -1)); }
  }, { passive: true });
  player.addEventListener('pointercancel', () => { pointer = null; }, { passive: true });
  new MutationObserver(syncChannel).observe(lab, { attributes: true, attributeFilter: ['data-channel'] });
  new MutationObserver(() => { if (document.body.classList.contains('is-paused')) { stop(); paint({ force: true }); } else setPlayLabel(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  // Opening the peel starts the journey once; closing stops it and rewinds.
  new MutationObserver(() => {
    if (underlay.inert) { stop(); cancelAnimations(); held = false; elapsed = 0; paint({ instant: true, force: true }); setPlayLabel(); }
    else start(true);
  }).observe(underlay, { attributes: true, attributeFilter: ['inert'] });
  // A journey that has not started (and was not paused by the visitor) starts when it comes into view.
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) stop(); else if (!playing && !held && elapsed === 0 && open()) start(true); }, { threshold: .02 }).observe(player);
  else visible = true;
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (frame >= 0) { positionDot(false); if (frames()[frame]?.toque && !body.querySelector('[data-cx-tap]')?.hidden) showTap(); } }).observe(body);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reduce.addEventListener('change', () => { stop(); cancelAnimations(); paint({ instant: true, force: true }); });
  motion.onStop(() => { stop(); ghost?.remove(); ghost = null; });
  syncChannel();
  return { root: player, stop, reset: () => { stop(); elapsed = 0; paint({ instant: true, force: true }); setPlayLabel(); } };
}
