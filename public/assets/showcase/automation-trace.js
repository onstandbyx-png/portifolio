/* "Sistemas e automações": one automation at a time, the iPhone on one side and,
   on the other, the log of what the system records while the customer sees each
   screen (automation-flows.js, the `log` of every frame). The phone plays once
   when it comes into view and stops on its last frame; every log line, step and
   arrow jumps to its frame. The agent flow also has a failure path (the Pix code
   expires, a duplicated webhook is discarded). Without motion (reduced motion,
   paused site, hidden tab) nothing plays by itself.
   Markup: index.html, <div class="vitrine lab-escopo" data-vitrine="sistemas">. */
import { placementByKey, renderMock } from './campaign-channels.js';

const MODULOS = [
  { label: 'Agente e Pix', funcao: 'Qualifica, passa para pessoa e recebe', key: 'whatsapp/agente', falha: 'whatsapp/agente-falha', canal: 'WhatsApp' },
  { label: 'Ligação com IA', funcao: 'Liga em instantes e agenda', key: 'voz/ligacao', canal: 'Voz' },
  { label: 'Chamada no WhatsApp', funcao: 'Pede permissão, liga e transfere', key: 'whatsapp/chamada', canal: 'WhatsApp' },
  { label: 'Comentário e Direct', funcao: 'Do comentário à lista de espera', key: 'instagram/direct', canal: 'Instagram' },
  { label: 'Pix Automático', funcao: 'Cobra todo mês e evita cancelamento', key: 'pix/recorrencia', canal: 'Pix' },
  { label: 'RCS', funcao: 'Da busca à conversa verificada', key: 'rcs/conversa', canal: 'RCS' },
  { label: 'Régua de e-mail', funcao: 'Segue o lead até a reunião', key: 'email/regua', canal: 'E-mail' },
  { label: 'Telegram', funcao: 'Comunidade com assinatura', key: 'telegram/clube', canal: 'Telegram' },
];
/* Colour of each actor of the log (the chip before the event). */
const ATOR = {
  'Anúncio': '#f2b05e', 'Cliente': '#b6c2cf', 'Site': '#b9e07a', 'WhatsApp': '#4fd98a', 'Instagram': '#f07aa8', 'Telegram': '#6cb6f5', 'RCS': '#7fb0ff',
  'Agente IA': '#b9a2ff', 'Humano': '#6fe0b4', 'CRM': '#f59ac9', 'PSP': '#f6d36b', 'Banco': '#8fc3ff', 'Meta CAPI': '#8aa9ff', 'Google Ads': '#8aa9ff',
  'LinkedIn CAPI': '#8aa9ff', 'E-mail': '#ffb27a', 'Sistema': '#d5dde4', 'Telefonia': '#6fe0d6', 'Automação': '#f9a8d4', 'Bot': '#9ad4fb', 'Mini app': '#9ad4fb',
};
const SINAL = /CAPI|Google Ads/;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* The player's frame rules (experience-player.js, applyFrame). */
function apply(screen, list, index) {
  const item = list[index];
  const moved = screen.dataset.scene !== item.cena;
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
  return moved;
}

function mountOne(root) {
  root.classList.add('at');
  root.innerHTML = `<div class="at-mods" role="group" aria-label="Automação">${MODULOS.map((m, k) => `<button type="button" class="at-mod" data-at-mod="${k}" aria-pressed="${k === 0}"><b>${esc(m.label)}</b><small>${esc(m.funcao)}</small></button>`).join('')}</div>
    <div class="at-main">
      <div class="at-phone"><div class="at-stage" data-at-stage tabindex="0" role="group" aria-roledescription="demonstração" aria-describedby="at-caption"></div></div>
      <div class="at-side">
        <div class="at-head"><div><b>Registro de eventos</b><small>O que o sistema registra enquanto a cliente vê cada tela.</small></div><span class="at-badge">Demo · dados simulados</span></div>
        <div class="at-path" data-at-path role="group" aria-label="Caminho" hidden><button type="button" data-at-falha="0" aria-pressed="true">Caminho feliz</button><button type="button" data-at-falha="1" aria-pressed="false">Com falhas</button></div>
        <ol class="at-log" data-at-log aria-label="Eventos da automação"></ol>
        <dl class="at-count" data-at-count></dl>
        <p class="at-caption" id="at-caption" data-at-caption aria-live="polite"></p>
        <div class="at-controls"><button type="button" class="at-ctl" data-at-prev aria-label="Quadro anterior">←</button><button type="button" class="at-play" data-at-play></button><button type="button" class="at-ctl" data-at-next aria-label="Próximo quadro">→</button><span class="at-pos" data-at-pos aria-hidden="true"></span></div>
        <ol class="cx-journey at-steps" data-at-steps aria-label="Jornada em 3 passos"></ol>
        <p class="at-base" data-at-base></p>
        <p class="at-nota">Exemplo ilustrativo, marca fictícia. Interface aproximada. Eventos, campos e horários simulados; nenhum número é resultado de cliente.</p>
      </div>
    </div>`;
  const $ = selector => root.querySelector(selector);
  const stage = $('[data-at-stage]'), log = $('[data-at-log]'), count = $('[data-at-count]'), caption = $('[data-at-caption]'), play = $('[data-at-play]'), steps = $('[data-at-steps]'), pos = $('[data-at-pos]');
  let modulo = 0, falha = false, placement = null, frames = [], screen = null, index = 0, timer = 0, settle = 0, playing = false, started = false;
  const last = () => frames.length - 1;
  const live = () => !reduce.matches && !document.body.classList.contains('is-paused');

  function label() {
    play.textContent = playing ? 'Pausar' : index >= last() ? 'Rever' : live() ? 'Reproduzir' : 'Próximo quadro';
    play.setAttribute('aria-pressed', String(playing));
  }
  /* The finger lands on the element the frame taps, once the scene has settled. */
  function finger(moved) {
    clearTimeout(settle);
    const tap = stage.querySelector('.cx-tap');
    tap.hidden = true; tap.classList.remove('is-on');
    const key = frames[index].toque;
    if (!key) return;
    settle = setTimeout(() => {
      const scene = screen.querySelector('.cm-scene[data-pos="on"]');
      const shown = node => { for (let el = node; el && el !== scene; el = el.parentElement) if (getComputedStyle(el).opacity === '0') return false; return true; };
      const node = [...scene.querySelectorAll(`[data-tap="${key}"]`)].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility === 'visible' && shown(el); }).pop();
      if (!node) return;
      const r = node.getBoundingClientRect(), box = stage.getBoundingClientRect();
      tap.style.left = ((r.left + r.width / 2 - box.left) / box.width * 100).toFixed(2) + '%';
      tap.style.top = ((r.top + r.height / 2 - box.top) / box.height * 100).toFixed(2) + '%';
      tap.hidden = false;
      tap.classList.toggle('is-static', !live());
      void tap.offsetWidth; tap.classList.add('is-on');
      screen.dataset.tap = key;
    }, live() ? (moved ? 820 : 440) : 20);
  }
  function stepOf(i) { return placement.passos.findIndex(p => p.quadros.includes(i)); }
  function paintLog() {
    const current = [];
    let decisoes = 0, pessoas = 0, sinais = 0, eventos = 0;
    log.querySelectorAll('li').forEach(li => {
      const f = Number(li.dataset.frame);
      li.dataset.when = f < index ? 'past' : f === index ? 'now' : 'next';
      if (f === index) current.push(li);
      if (f <= index) {
        eventos++;
        const ator = li.dataset.actor;
        if (ator === 'Agente IA') decisoes++;
        if (ator === 'Humano') pessoas++;
        if (SINAL.test(ator)) sinais++;
      }
    });
    count.innerHTML = [['Eventos', eventos], ['Decisões da IA', decisoes], ['Passagens para pessoa', pessoas], ['Sinais para anúncios', sinais]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    // Keeps the newest line in view inside the log, without scrolling the page.
    const target = current[current.length - 1] || [...log.querySelectorAll('li[data-when="past"]')].pop();
    if (target) log.scrollTo({ top: Math.max(0, target.offsetTop - log.clientHeight + target.offsetHeight + 12), behavior: live() ? 'smooth' : 'auto' });
  }
  function show(i, instant = false) {
    index = Math.max(0, Math.min(last(), i));
    if (instant) screen.classList.add('is-instant');
    const moved = apply(screen, frames, index);
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.remove('is-instant')));
    caption.textContent = frames[index].desc;
    pos.textContent = `${index + 1} / ${frames.length}`;
    const s = stepOf(index);
    steps.querySelectorAll('[data-vitrine-step]').forEach(button => {
      const k = Number(button.dataset.vitrineStep), quadros = placement.passos[k].quadros;
      button.parentElement.dataset.state = k < s ? 'done' : k === s ? 'on' : 'next';
      const p = k < s ? 1 : k > s ? 0 : (quadros.indexOf(index) + 1) / quadros.length;
      button.querySelector('[data-rail]').style.setProperty('--p', p.toFixed(3));
      if (k === s) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    paintLog();
    finger(moved);
    label();
  }
  function tick() {
    clearTimeout(timer);
    if (!playing) return;
    if (index >= last()) { playing = false; label(); return; }
    timer = setTimeout(() => { show(index + 1); tick(); }, frames[index].ms);
  }
  function go(on) {
    playing = on && live();
    if (playing && index >= last()) show(0, true);
    tick();
    label();
  }
  function load() {
    go(false);
    const m = MODULOS[modulo];
    placement = placementByKey(falha && m.falha ? m.falha : m.key);
    frames = placement.quadros;
    stage.innerHTML = `${renderMock(placement)}<span class="cx-tap" aria-hidden="true" hidden></span>`;
    stage.setAttribute('aria-label', `${m.label}: ${placement.frase}`);
    screen = stage.querySelector('.cm-screen');
    root.querySelectorAll('[data-at-mod]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.atMod) === modulo)));
    const chosen = root.querySelector(`[data-at-mod="${modulo}"]`), row = chosen.parentElement;
    if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: chosen.offsetLeft - 16, behavior: live() ? 'smooth' : 'auto' });
    const path = $('[data-at-path]');
    path.hidden = !m.falha;
    path.querySelectorAll('[data-at-falha]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.atFalha === '1') === falha)));
    log.innerHTML = frames.flatMap((f, k) => (f.log || []).map(([ator, evento, detalhe]) => `<li data-frame="${k}" data-actor="${esc(ator)}"><button type="button" data-at-goto="${k}"><span class="at-actor" style="--a:${ATOR[ator] || '#d5dde4'}">${esc(ator)}</span><b>${esc(evento)}</b>${detalhe ? `<code>${esc(detalhe)}</code>` : ''}</button></li>`)).join('');
    steps.innerHTML = placement.passos.map((p, k) => `<li data-state="next"><button type="button" data-vitrine-step="${k}"><span class="cx-step-n" aria-hidden="true">${k + 1}</span><span class="cx-step-t"><b>${esc(p.rotulo)}</b></span><i class="cx-rail" aria-hidden="true"><i data-rail></i></i></button></li>`).join('');
    $('[data-at-base]').textContent = `Baseado em: ${placement.base || ''}`;
    show(0, true);
  }

  root.addEventListener('click', event => {
    const mod = event.target.closest('[data-at-mod]');
    if (mod) { started = true; modulo = Number(mod.dataset.atMod); falha = false; load(); go(true); return; }
    const path = event.target.closest('[data-at-falha]');
    if (path) { started = true; falha = path.dataset.atFalha === '1'; load(); go(true); return; }
    const goto = event.target.closest('[data-at-goto]');
    if (goto) { go(false); show(Number(goto.dataset.atGoto)); return; }
    const step = event.target.closest('[data-vitrine-step]');
    if (step) { go(false); show(placement.passos[Number(step.dataset.vitrineStep)].quadros[0]); return; }
    if (event.target.closest('[data-at-prev]')) { go(false); show(index - 1); return; }
    if (event.target.closest('[data-at-next]')) { go(false); show(index + 1); return; }
    if (event.target.closest('[data-at-play]')) {
      if (!live()) { show(index >= last() ? 0 : index + 1); return; }
      go(!playing);
    }
  });
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(false); show(index + (event.key === 'ArrowRight' ? 1 : -1)); }
  });

  load();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started && live()) { started = true; go(true); }
      else if (!entry.isIntersecting) go(false);
    }, { threshold: .35 }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) go(false); });
  new MutationObserver(() => { if (!live()) go(false); else label(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

export function mountTrace() {
  document.querySelectorAll('[data-vitrine="sistemas"]:not([data-trace-ready])').forEach(root => {
    root.dataset.traceReady = 'true';
    mountOne(root);
  });
}
