/* Jornada viva do hero: peça, iPhone, registro e o traço entre eles; 6 batidas de 1,6 s e uma pausa (11,2 s).
   Textos em hero-journeys.json, nomes e datas em marcas.js. Para fora da tela, com a aba oculta, com ponteiro
   ou foco dentro e com body.is-paused; com movimento reduzido, quadro final. */
import { CLIENTES, MARCAS, PESSOA, OFERTAS, PEDIDOS, TERCEIROS, HOJE, dataLonga } from '/assets/showcase/marcas.js';

const root = document.querySelector('.ph-journey');
const BEAT = 1600, EASE = 'cubic-bezier(.16,1,.3,1)';
const reduced = matchMedia('(prefers-reduced-motion: reduce)'), stacked = matchMedia('(max-width: 1099px)');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const $ = s => root.querySelector(s), $$ = s => root.querySelectorAll(s), chips = document.querySelectorAll('.ph-chip');

/* {CAMINHO|formato} lê marcas.js; $ é o cliente da jornada. "09:00" vira "9h"; datas do Mail como no iOS. */
const M = { CLIENTES, OFERTAS, PESSOA, PEDIDOS, TERCEIROS, HOJE };
const dmA = iso => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const F = {
  longa: dataLonga, dia: iso => dataLonga(iso).split(', ')[1], d: iso => +iso.slice(8), dm: dmA,
  h: h => h.replace(/^0/, '').replace(/:00$/, 'h').replace(':', 'h'),
  mail: ({ iso, hora: h }) => {
    const d = Math.round((Date.parse(HOJE.iso) - Date.parse(iso)) / 864e5);
    return d === 0 ? h || HOJE.hora : d === 1 ? 'Ontem' : d < 7 ? dataLonga(iso).split(', ')[0] : dmA(iso).replace(/\d\d(\d\d)$/, '$1');
  },
};
let J = null;
const fill = s => esc(String(s ?? '').replace(/\{([\w.$/]+)(?:\|(\w+))?\}/g, (m, p, f) => {
  const v = p.split('.').reduce((o, k) => o?.[k], { ...M, $: CLIENTES[J.cliente] });
  return v == null ? m : f ? F[f](v) : v;
}));
const marca = k => `<span class="hj-marca" style="--c:${CLIENTES[k].cor}">${MARCAS[k]}</span>`;
const ic = n => `<i class="hj-i hj-i--${n}"></i>`, H = esc(HOJE.hora);
const split = (s, sep, f) => fill(s).split(sep).filter(Boolean).map(f).join('');

/* Peça de origem com a CTA que dispara a jornada. */
function card(J) {
  const c = J.card;
  return `<p class="hj-card-label">${esc(c.plataforma)}</p><article class="hj-card-in hj-card--${c.tipo}"><header class="hj-card-head">${marca(J.cliente)}<span><b>${fill(c.nome)}</b><small>${fill(c.selo)}</small></span></header>`
    + (c.busca ? `<p class="hj-q">${fill(c.busca)}</p>` : '')
    + (c.foto ? `<img src="${esc(c.foto)}" alt="${esc(c.alt)}" width="480" height="600" loading="lazy" decoding="async">` : '')
    + `<div class="hj-card-body">${c.titulo ? `<strong>${fill(c.titulo)}</strong>` : ''}${c.texto ? `<p>${fill(c.texto)}</p>` : ''}`
    + split(c.campos, '|', v => `<span class="hj-field">${v}</span>`) + (c.aceite ? `<span class="hj-aceite">${fill(c.aceite)}</span>` : '')
    + (c.opcoes ? `<span class="hj-opcoes">${split(c.opcoes, '|', v => `<span${v === c.cta ? ' class="hj-cta"' : ''}>${v}</span>`)}</span>` : '')
    + `</div>${c.opcoes ? '' : `<span class="hj-cta">${fill(c.cta)}</span>`}<span class="hj-volta">${ic('check')}${fill(c.volta)}</span></article>`;
}

/* Tela do app; cada item leva a batida em que entra. */
function item(x) {
  const b = `class="hj-it hj-${x.k}" data-b="${x.b}"`, time = `<small>${H}</small>`;
  const btns = x.btns ? `<span class="hj-btns">${split(x.btns, '|', v => `<span>${v}</span>`)}</span>` : '';
  switch (x.k) {
    case 'out': return `<div ${b}>${x.cita ? `<span class="hj-cita">${fill(x.cita)}</span>` : ''}<p>${fill(x.t)}</p>${time}</div>`;
    case 'in': return `<div ${b}><p>${fill(x.t)}</p>${time}${btns}</div>`;
    case 'sys': return `<div ${b}>${fill(x.t)}</div>`;
    case 'note': return `<div ${b}><b>${fill(x.q)}<small>agora</small></b><span>${fill(x.t)}</span></div>`;
    case 'row': return `<div ${b}><b>${fill(x.q)}</b><small>${fill(x.h)}</small><strong>${fill(x.t)}</strong><span>${fill(x.p)}</span></div>`;
    case 'pay': {
      const [ck, cv] = fill(x.campo).split('|');
      return `<div ${b} data-pago="${x.pago}"><strong>${fill(x.t)}</strong>${split(x.linhas, ';', r => `<span><small>${r.split('|')[0]}</small><b>${r.split('|')[1]}</b></span>`)}`
        + (x.campo ? `<span class="hj-campo"><small>${ck}</small><i>${cv}</i></span>` : '')
        + `<span class="hj-pay-cta">${fill(x.cta)}</span><span class="hj-pay-ok">${ic('check')}${fill(x.feito)}</span></div>`;
    }
  }
  return '';
}
function screen(J) {
  const a = J.app, t = a.tipo, k = J.cliente, its = a.itens.filter(x => x.k !== 'fala' && x.k !== 'estado');
  const head = t === 'mail' ? `<header class="hj-head"><span class="hj-blue">${ic('back')}Caixas</span><span class="hj-blue">Editar</span></header><h3 class="hj-big">${fill(a.titulo)}</h3>`
    : t === 'call' ? `<header class="hj-call-head">${marca(k)}<b>${fill(a.titulo)}</b><small>${fill(a.sub)}</small><span class="hj-timer">0:00</span><span class="hj-wave">${'<i></i>'.repeat(9)}</span></header>`
    : `<header class="hj-head">${t === 'bank' ? `<span class="hj-banco">${esc(TERCEIROS.banco.sigla)}</span>` : ic('back') + (t === 'tg' ? '' : marca(k))}<span><b>${fill(a.titulo)}</b><small>${fill(a.sub)}</small></span>${t === 'tg' ? marca(k) : ''}${{ wa: ic('video') + ic('call'), ig: ic('call') + ic('video') }[t] || ''}</header>`;
  const foot = t === 'wa' ? `<footer class="hj-compose">${ic('plus')}<span></span>${ic('cam')}${ic('mic')}</footer>`
    : a.campo ? `<footer class="hj-compose"><span>${fill(a.campo)}</span></footer>`
    : t === 'call' ? '<footer class="hj-keys"><i class="hj-key--no"></i><i class="hj-key--ok"></i><i class="hj-key--end"></i></footer>' : '';
  const body = its.filter(x => x.k !== 'note').map(item).join(''), notes = its.filter(x => x.k === 'note').map(item).join('');
  return `<div class="hj-status"><b>${H}</b><i></i></div><div class="hj-app hj-app--${t}" data-fase="0">${head}<div class="hj-body">${t === 'wa' ? '<span class="hj-day">Hoje</span>' : ''}${body}</div>${foot}</div>${notes}`;
}

/* Traço peça, telefone, registro e volta; em coluna, o retorno sobe pela margem. */
let stops = [0, 0, 0, 0, 0, 1], anims = [];
function wire() {
  const box = root.getBoundingClientRect(), svg = $('.hj-wire'), live = $('.hj-wire-live');
  if (!box.width) return;
  const r = el => { const q = el.getBoundingClientRect(), l = q.left - box.left, t = q.top - box.top; return { l, t, r: l + q.width, b: t + q.height, w: q.width, h: q.height }; };
  const tk = $('.hj-ticker'), cd = r($('.hj-card-in') || $('.hj-card')), cta = r($('.hj-card .hj-cta') || $('.hj-card')), ph = r($('.hj-corpo'));
  const lg = r(stacked.matches && getComputedStyle(tk).display !== 'none' ? tk : $('.hj-log')), P = (x, y) => `${Math.round(x)} ${Math.round(y)}`;
  let seg;
  if (stacked.matches) {
    const x = ph.l + ph.w / 2, gx = Math.max(6, ph.l / 2), cx = cta.l + cta.w / 2, my = (cta.b + ph.t) / 2;
    seg = [`M${P(cx, cta.b)}C${P(cx, my)} ${P(x, my)} ${P(x, ph.t)}`, `L${P(x, ph.b)}`, `L${P(x, lg.t)}`, `L${P(x, lg.t + 14)}L${P(gx, lg.t + 14)}`, `L${P(gx, cd.t + cd.h / 2)}L${P(cd.l, cd.t + cd.h / 2)}`];
  } else {
    const y1 = cta.t + cta.h / 2, y2 = lg.t + 30, bot = ph.b + 18, xm = cd.l + cd.w / 2, gx = (lg.l + ph.r) / 2;
    seg = [`M${P(cta.r, y1)}C${P(cta.r + 24, y1)} ${P(ph.l - 24, y1 + 30)} ${P(ph.l, y1 + 30)}`, `L${P(ph.r, y2)}`, `L${P(lg.l, y2)}`,
      `L${P(lg.l + 20, y2)}L${P(lg.l + 20, lg.b - 14)}L${P(gx, lg.b - 14)}L${P(gx, bot - 12)}Q${P(gx, bot)} ${P(gx - 12, bot)}`, `L${P(xm + 12, bot)}Q${P(xm, bot)} ${P(xm, bot - 12)}L${P(xm, cd.b)}`];
  }
  const d = seg.join(''), probe = document.createElementNS('http://www.w3.org/2000/svg', 'path'), lens = [];
  svg.append(probe);
  seg.reduce((acc, s) => { probe.setAttribute('d', acc += s); lens.push(probe.getTotalLength()); return acc; }, '');
  probe.remove();
  const total = lens[4] || 1, f = n => n / total;
  stops = [.015, f(lens[0]), f((lens[0] + lens[1]) / 2), f(lens[1]), f(lens[2]), 1];
  svg.setAttribute('viewBox', `0 0 ${Math.round(box.width)} ${Math.round(box.height)}`);
  svg.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
  live.style.strokeDasharray = `${total} ${total}`;
  live.dataset.total = total;
  $('.hj-dot').style.offsetPath = `path('${d}')`;
  draw(beat, false);
}
function draw(i, animate) {
  const live = $('.hj-wire-live'), dot = $('.hj-dot'), total = +live.dataset.total;
  if (!total) return;
  const to = i < 0 ? 0 : stops[Math.min(i, 5)], from = i <= 0 ? 0 : stops[i - 1];
  if (!animate || reduced.matches) { live.style.strokeDashoffset = total * (1 - to); dot.style.offsetDistance = `${to * 100}%`; return; }
  const o = { duration: BEAT * .8, easing: EASE, fill: 'forwards' };
  anims = [live.animate([{ strokeDashoffset: total * (1 - from) }, { strokeDashoffset: total * (1 - to) }], o),
    dot.animate([{ offsetDistance: `${from * 100}%` }, { offsetDistance: `${to * 100}%` }], o)];
  anims.forEach(a => a.finished.then(() => { a.commitStyles(); a.cancel(); }, () => {}));
}

/* Laço; holds guarda os motivos de pausa. */
let data = null, key = root?.dataset.jornada || 'agente', beat = -1, timers = [], loop = 0, clock = 0;
const holds = new Set(), running = () => !holds.size && !reduced.matches;
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const clear = () => { timers.forEach(clearTimeout); timers = []; clearTimeout(loop); loop = 0; clearInterval(clock); clock = 0; };
function fala(x) {
  const out = $('.hj-fala');
  out.hidden = !x;
  if (x) out.innerHTML = `<b>${x.q === 'ia' ? 'Assistente virtual (IA)' : esc(PESSOA.primeiro)}</b> ${fill(x.t)}`;
  $('.hj-app').dataset.quem = x ? x.q : '';
}
/* Cronômetro da ligação: segue o segundo de cada fala (s). */
function timer(from, to, ms) {
  const el = $('.hj-timer'), t0 = performance.now(), put = s => { if (el) el.textContent = `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
  put(from);
  clearInterval(clock);
  if (ms) clock = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); put(from + (to - from) * k); if (k === 1) clearInterval(clock); }, 250);
}
function apply(x, live) {
  const app = $('.hj-app');
  if (x.k === 'estado') { app.dataset.fase = x.t === 'fim' ? 'fim' : '1'; if (x.t === 'fim') { fala(null); timer(x.s, x.s, 0); } return; }
  if (x.k === 'fala') {
    const next = J.app.itens.find(y => y.s > x.s);
    app.dataset.fase = '2'; fala(x);
    return live && next ? timer(x.s, next.s, (next.b - x.b) * BEAT) : timer(x.s, x.s, 0);
  }
  $$(`.hj-screen [data-b="${x.b}"]`).forEach(el => {
    if (el.matches('.hj-note')) $$('.hj-note.is-in').forEach(n => n.classList.remove('is-in'));
    el.classList.add('is-in');
  });
}
function show(i, live) {
  beat = i;
  root.dataset.beat = i;
  $$('.hj-log li').forEach((li, n) => { li.classList.toggle('is-on', n <= i); li.classList.toggle('is-now', n === i); });
  const line = J.log[Math.max(0, i)], card = $('.hj-card');
  $('.hj-ticker-line').innerHTML = `<b>${esc(line[0])}</b> ${esc(line[1])}`;
  $$('.hj-dots i').forEach((d, n) => d.classList.toggle('is-on', n <= i));
  card.classList.toggle('is-back', i >= 5);
  if (live && i === 0) { card.classList.add('is-tap'); later(() => card.classList.remove('is-tap'), 520); }
  for (const x of J.app.itens) {
    if (live ? Math.floor(x.b) !== i : x.b > i + .99) continue;
    if (live && x.b > i) later(() => apply(x, true), (x.b - i) * BEAT); else apply(x, live);
  }
  $$('.hj-pay').forEach(p => {
    const at = +p.dataset.pago;
    if (at > i) return;
    if (!live || at < i) return p.classList.add('is-pago');
    p.classList.add('is-tap');
    later(() => { p.classList.remove('is-tap'); p.classList.add('is-pago'); }, 260);
  });
  draw(i, live);
}
function tick() {
  if (!running()) return;
  const next = beat >= 6 ? 0 : beat + 1;
  if (!next) {
    root.classList.add('is-reset');
    later(() => {
      $$('.hj-screen .is-in,.hj-screen .is-pago').forEach(el => el.classList.remove('is-in', 'is-pago'));
      $('.hj-app').dataset.fase = '0'; fala(null); timer(0, 0, 0);
      root.classList.remove('is-reset'); show(0, true);
    }, 240);
  } else if (next < 6) show(next, true);
  else beat = 6;
  loop = setTimeout(tick, BEAT);
}
function hold(reason, on) {
  on ? holds.add(reason) : holds.delete(reason);
  if (!running()) { clear(); anims.forEach(a => a.pause()); return; }
  if (loop) return;
  anims.forEach(a => a.cancel());
  if (beat >= 0 && beat < 6) show(beat, false);
  loop = setTimeout(tick, BEAT / 2);
}

function render(k) {
  key = k; J = data[k];
  clear();
  root.dataset.jornada = k;
  $('.hj-card').innerHTML = card(J);
  $('.hj-screen').innerHTML = screen(J);
  $('.hj-log ol').innerHTML = J.log.map(([a, b]) => `<li><b>${esc(a)}</b> <span>${esc(b)}</span></li>`).join('');
  const nota = $('.hj-nota');
  nota.hidden = !J.nota; nota.textContent = J.nota || '';
  fala(null);
  $('.hj-link').setAttribute('href', `#sistemas/${k}`);
  beat = -1;
  wire();
  if (reduced.matches) { for (let i = 0; i <= 5; i++) show(i, false); return; }
  show(0, running());
  if (running()) loop = setTimeout(tick, BEAT);
}
function select(k) {
  if (!data?.[k] || k === key) return;
  chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.jornada === k)));
  if (reduced.matches) return render(k);
  root.classList.add('is-swap');
  setTimeout(() => { render(k); root.classList.remove('is-swap'); }, 240);
}

async function mount() {
  try { data = await (await fetch('/assets/planes/hero-journeys.json')).json(); } catch { return; }
  render(key);
  root.dataset.ready = 'true';
  chips.forEach(b => b.addEventListener('click', () => select(b.dataset.jornada)));
  new ResizeObserver(() => wire()).observe(root);
  new IntersectionObserver(([e]) => hold('fora', !e.isIntersecting), { threshold: .15 }).observe(root);
  document.addEventListener('visibilitychange', () => hold('oculta', document.hidden));
  const sync = () => hold('pausa', document.body.classList.contains('is-paused'));
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
  root.addEventListener('pointerenter', e => e.pointerType === 'mouse' && hold('ponteiro', true));
  root.addEventListener('pointerleave', () => hold('ponteiro', false));
  root.addEventListener('focusin', () => hold('foco', true));
  root.addEventListener('focusout', () => hold('foco', false));
  reduced.addEventListener('change', () => render(key));
  // Logos oficiais nos botões.
  import('/assets/showcase/channel-logos.js').then(({ logoSvg }) => document.querySelectorAll('.ph-chip-ico[data-logo]').forEach(s => { s.innerHTML = logoSvg(s.dataset.logo, { altura: 18 }); }), () => {});
}
if (root) requestAnimationFrame(() => requestAnimationFrame(() => ('requestIdleCallback' in window ? requestIdleCallback(mount, { timeout: 900 }) : setTimeout(mount, 200))));
