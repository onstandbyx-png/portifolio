/* Six independent interactive capabilities using the existing physical deck, gesture physics and accessibility contracts. */
import { clamp, createMotion } from '../sections/motion.js';
import { sectionCopy } from '../content/portfolio-copy.js';
const copy = sectionCopy('colecao');
// One forest family for every card: the accent only tints rules and side-card edges.
const metadata = {
  sites:{short:'Sites',handle:'UX / Desenvolvimento',territory:'Sites e aplicativos',color:'#9CCBB0'},
  conteudo:{short:'Conteúdo',handle:'Redação / Narrativa',territory:'Conteúdo e copy',color:'#9CCBB0'},
  campanhas:{short:'Campanhas',handle:'Estratégia / Formatos',territory:'Campanhas multicanal',color:'#9CCBB0'},
  video:{short:'Vídeo',handle:'Roteiro / Edição',territory:'Vídeo e motion',color:'#9CCBB0'},
  lojas:{short:'Lojas',handle:'Loja / Recompra',territory:'Experiência de compra',color:'#9CCBB0'},
  sistemas:{short:'Sistemas',handle:'Produto / Automação',territory:'Sistemas e IA',color:'#9CCBB0'}
};
/* Cover art: device compositions drawn only with HTML, CSS and inline SVG.
 * Every brand, product and price below is fictional and generic. No photos,
 * no people, no logos, no ratings or results. The art is decorative (aria-hidden). */
const paths = {
  structure:'<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9h17M9.5 9v11.5"/>',
  pointer:'<path d="M6 3.8l11.6 6.7-5 1.5-2.4 4.9z"/><path d="M12.6 12.1l4.4 6.1"/>',
  code:'<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.6 5l-3.2 14"/>',
  bulb:'<path d="M9.2 18h5.6M10.2 21h3.6M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  camera:'<rect x="3" y="6.5" width="13" height="11" rx="2.2"/><path d="M16 10.6l5-3v8.8l-5-3"/>',
  send:'<path d="M20.5 3.5L10.4 13.6M20.5 3.5l-6.3 17-3.8-6.9-6.9-3.8z"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1"/>',
  image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.6 8.5"/>',
  formats:'<rect x="3" y="4" width="7.5" height="11" rx="1.6"/><rect x="13" y="4" width="8" height="16" rx="1.6"/><rect x="3" y="17.5" width="7.5" height="2.5" rx="1"/>',
  script:'<path d="M6.5 3.5h8L19 8v12.5H6.5z"/><path d="M14.5 3.5V8H19M9.6 12.2h6M9.6 15.8h6"/>',
  clapper:'<path d="M4 10h16v9.3a1.7 1.7 0 0 1-1.7 1.7H5.7A1.7 1.7 0 0 1 4 19.3z"/><path d="M4 10l-.6-3.5a1.5 1.5 0 0 1 1.2-1.7l12.7-2.2a1.5 1.5 0 0 1 1.7 1.2l.6 3.3z"/><path d="M8.4 4.8l2.3 3.7M13.6 3.9l2.3 3.7"/>',
  scissors:'<circle cx="6.5" cy="17" r="2.8"/><circle cx="6.5" cy="7" r="2.8"/><path d="M8.8 8.6L20 18M8.8 15.4L20 6"/>',
  bag:'<path d="M5 8h14l-1 12.5H6z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
  card:'<rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="M3 10h18M7 15h4"/>',
  refresh:'<path d="M19.5 9.2A8 8 0 0 0 5.2 7.4M4.5 14.8a8 8 0 0 0 14.3 1.8"/><path d="M5 3.5v4h4M19 20.5v-4h-4"/>',
  inbox:'<path d="M3.5 13.5L6 5.5h12l2.5 8v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M3.5 13.5h5l1.2 2.5h4.6l1.2-2.5h5"/>',
  filter:'<path d="M4 5h16l-6.2 7.6v5.7l-3.6 1.7v-7.4z"/>',
  check:'<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.3l2.6 2.6 5-5.2"/>',
  search:'<circle cx="11" cy="11" r="6.3"/><path d="M20 20l-4.4-4.4"/>',
  menu:'<path d="M4.5 7h15M4.5 12h15M4.5 17h15"/>',
  heart:'<path d="M12 19.6s-7.4-4.5-7.4-9.8A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.4 2.5c0 5.3-7.4 9.8-7.4 9.8z"/>',
  comment:'<path d="M4 5.5h16v10H9.6L5 19.5v-4H4z"/>',
  share:'<path d="M14 5l6 6-6 6M20 11h-9.5A6.5 6.5 0 0 0 4 17.5V19"/>',
  leaf:'<path d="M5 19c0-8 5-13.2 14-14 0 9-5 14-13.2 14"/><path d="M5 19l6.8-6.8"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.6V12l3 2"/>',
  pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  truck:'<path d="M3 6.5h11V16H3zM14 9.5h4l3 3.2V16h-7z"/><circle cx="7" cy="17.6" r="1.8"/><circle cx="17.2" cy="17.6" r="1.8"/>',
  shield:'<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z"/><path d="M8.8 12l2.3 2.3 4.2-4.4"/>',
  feed:'<rect x="4" y="4" width="16" height="16" rx="3.2"/><path d="M4 15l4.5-4.5 4 4 2.5-2.5 5 5"/>',
  stories:'<circle cx="12" cy="12" r="8.6" stroke-dasharray="4.2 2.3"/><circle cx="12" cy="12" r="4.4"/>',
  play:'<path d="M8.5 5.6v12.8l10.6-6.4z" fill="currentColor" stroke="none"/>',
  plus:'<path d="M12 6v12M6 12h12"/>',
  sparkle:'<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1-5.1-1.9 5.1-1.9z"/>',
  arrow:'<path d="M5 12h14M13.2 6.2L19 12l-5.8 5.8"/>',
  chevron:'<path d="M9.5 6l6 6-6 6"/>',
  up:'<path d="M6 14.5l6-6 6 6"/>',
  mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>'
};
const icon = name => `<svg class="pf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
// A people-free landscape (sky, low sun, three mountain ranges). Ids are unique per instance.
const skies = {
  dusk:['#2E4B47','#B9805C','#EDBE86','#F8E2B6'],
  dawn:['#4A6662','#C99B7A','#EFD1A6','#FBEBCB'],
  day:['#5D8580','#9FB9AA','#DCD8B8','#F6EFD2'],
  night:['#16302C','#3D5B55','#8C8C79','#D8D2B4']
};
const landscape = (key, tone = 'dusk') => {
  const [top, mid, low, sun] = skies[tone];
  return `<svg class="pf-scape" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="pf-sky-${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".5" stop-color="${mid}"/><stop offset=".78" stop-color="${low}"/></linearGradient><radialGradient id="pf-glow-${key}" cx=".62" cy=".6" r=".42"><stop offset="0" stop-color="${sun}" stop-opacity=".85"/><stop offset="1" stop-color="${sun}" stop-opacity="0"/></radialGradient></defs><rect width="160" height="100" fill="url(#pf-sky-${key})"/><rect width="160" height="100" fill="url(#pf-glow-${key})"/><circle cx="99" cy="60" r="9" fill="${sun}"/><path d="M0 63L16 51l11 6 17-15 15 12 14-9 16 13 14-10 15 9 14-11 14 8v46H0z" fill="#8E8C80" opacity=".62"/><path d="M0 71l20-14 15 8 18-13 17 12 16-8 18 12 18-9 18 9 20-7v39H0z" fill="#4E695D"/><path d="M0 81q30-12 58-4t56-3 46 3v23H0z" fill="#2C473B"/><path d="M0 91q40-8 80-2t80-3v14H0z" fill="#17302A"/></svg>`;
};
const jar = (cls = '') => `<span class="pf-jar ${cls}"><i class="pf-jar-lid"></i><i class="pf-jar-body"><i class="pf-jar-label">${icon('leaf')}</i></i></span>`;
const bottle = (cls = '') => `<span class="pf-bottle ${cls}"><i class="pf-bottle-cap"></i><i class="pf-bottle-body"></i></span>`;
const dropper = () => '<span class="pf-dropper"><i></i><i></i></span>';
const tube = () => '<span class="pf-tube"><i></i><i></i></span>';
const brandRow = (extra = '') => `<div class="pf-ui-nav"><span class="pf-ui-brand"><i class="pf-ui-mark">${icon('leaf')}</i><b class="t1">Ateliê Exemplo</b></span><span class="pf-ui-icons">${extra}${icon('menu')}</span></div>`;
const tablet = (cls, screen) => `<div class="pf-dev pf-dev--tablet ${cls}"><div class="pf-screen">${screen}</div></div>`;
const phone = (cls, screen) => `<div class="pf-dev pf-dev--phone ${cls}"><div class="pf-screen">${screen}</div></div>`;
const laptop = (cls, screen) => `<div class="pf-dev pf-dev--laptop ${cls}"><div class="pf-laptop-lid"><div class="pf-screen">${screen}</div></div><i class="pf-laptop-base"></i></div>`;
const monitor = (cls, screen) => `<div class="pf-dev pf-dev--monitor ${cls}"><div class="pf-monitor-panel"><div class="pf-screen">${screen}</div></div><i class="pf-monitor-neck"></i><i class="pf-monitor-foot"></i></div>`;
const scene = (id, body) => `<div class="pf-case-scene pf-s-${id}"><i class="pf-floor"></i>${body}</div>`;
const coverScenes = {
  sites:scene('sites',
    tablet('pf-sites-tab', `${brandRow()}<div class="pf-sites-hero"><div class="pf-sites-copy"><small class="t0">AULAS DE CERÂMICA</small><strong class="t5">Agende sua visita</strong><span class="pf-ui-btn t1">Escolher horário</span></div><div class="pf-arch"><i class="pf-arch-sun"></i><i class="pf-vase pf-vase--a"></i><i class="pf-vase pf-vase--b"></i></div></div><div class="pf-sites-tiles"><span>${icon('clock')}<b class="t1">Horários</b></span><span>${icon('pin')}<b class="t1">Endereço</b></span><span>${icon('calendar')}<b class="t1">Turmas</b></span></div>`)+
    phone('pf-sites-phone', `<div class="pf-arch pf-arch--sm"><i class="pf-arch-sun"></i><i class="pf-vase pf-vase--a"></i></div><strong class="t2">Agende sua visita</strong><ul class="pf-slots"><li class="t1">09:00</li><li class="t1 is-on">10:30</li><li class="t1">14:00</li></ul><span class="pf-ui-btn pf-ui-btn--full t1">Confirmar</span>`)),
  conteudo:scene('conteudo',
    laptop('pf-ct-laptop', `<div class="pf-ct-rail"><i></i><i></i><i></i></div><div class="pf-ct-main"><div class="pf-ct-tabs"><b class="t0 is-on">Blog</b><b class="t0">E-mail</b><b class="t0">Social</b></div><div class="pf-ct-hero">${landscape('ct-l')}<strong class="t4">Uma ideia que atravessa canais.</strong></div><p class="pf-ct-lead t1">Pauta, texto e revisão, na mesma voz.</p></div>`)+
    phone('pf-ct-phone', `${landscape('ct-p', 'dawn')}<div class="pf-post-top"><i class="pf-ui-mark">${icon('leaf')}</i><b class="t0">ateliê</b></div><strong class="pf-post-title t2">Uma ideia. Três formatos.</strong><div class="pf-post-actions">${icon('heart')}${icon('comment')}${icon('share')}</div><div class="pf-post-dots"><i class="is-on"></i><i></i><i></i></div>`)),
  campanhas:scene('campanhas',
    monitor('pf-cp-monitor', `<div class="pf-cp-head"><b class="t1">Criativos da campanha</b><span class="pf-chip t0">Prévia</span></div><div class="pf-cp-grid"><div class="pf-cp-tile pf-cp-feed"><span class="pf-cp-label t0">${icon('feed')}Feed</span><div class="pf-cp-art">${bottle()}</div><b class="t1">Leve sua pausa.</b><span class="pf-ui-btn t0">Saiba mais</span></div><div class="pf-cp-tile pf-cp-search"><span class="pf-cp-label t0">${icon('search')}Pesquisa</span><span class="pf-cp-query t0">${icon('search')}garrafa</span><div class="pf-cp-ad"><small class="t0">Patrocinado</small><b class="t1">Garrafa de cerâmica</b><span class="t0">Feita à mão. Escolha a cor.</span></div></div><div class="pf-cp-tile pf-cp-video"><span class="pf-cp-label t0">${icon('play')}Vídeo</span><div class="pf-cp-vid">${landscape('cp-v', 'day')}${bottle('pf-bottle--sm')}<i class="pf-play">${icon('play')}</i><i class="pf-prog"><i></i></i></div></div></div>`)+
    phone('pf-cp-phone', `<div class="pf-st-bars"><i class="is-on"></i><i></i><i></i></div><span class="pf-chip pf-chip--glass t0">${icon('stories')}Stories</span>${bottle('pf-bottle--lg')}<strong class="t2">Leve sua pausa para qualquer lugar.</strong><span class="pf-st-cta t0">${icon('up')}Saiba mais</span>`)),
  video:scene('video',
    tablet('pf-vd-tab', `<div class="pf-vd-player">${landscape('vd-l')}<strong class="t3">Do roteiro ao convite.</strong><i class="pf-play pf-play--lg">${icon('play')}</i><div class="pf-vd-bar"><i class="pf-vd-track"><i></i></i><span class="t0">0:12 / 0:30</span></div></div><div class="pf-vd-timeline"><span>${landscape('vd-t1', 'dawn')}<b class="t0">Cena 1</b></span><span>${landscape('vd-t2', 'day')}<b class="t0">Cena 2</b></span><span>${landscape('vd-t3')}<b class="t0">Cena 3</b></span><span>${landscape('vd-t4', 'night')}<b class="t0">Cena 4</b></span><i class="pf-vd-head"></i></div><div class="pf-vd-wave"></div>`)+
    phone('pf-vd-phone', `${landscape('vd-p')}<span class="pf-chip pf-chip--glass t0">9:16</span><strong class="pf-vd-ptitle t2">Do roteiro ao convite.</strong><i class="pf-play">${icon('play')}</i><div class="pf-vd-bar pf-vd-bar--sm"><i class="pf-vd-track"><i></i></i></div>`)),
  lojas:scene('lojas',
    tablet('pf-shop-tab', `${brandRow(icon('search')+icon('bag'))}<div class="pf-shop-main"><div class="pf-shop-media"><i class="pf-stone"></i>${jar()}</div><div class="pf-shop-info"><b class="t3">Creme facial</b><small class="t0">Hidratante · 50 g</small><strong class="t3">R$ 129,90</strong><span class="pf-ui-btn t0">${icon('bag')}Adicionar ao carrinho</span></div></div><div class="pf-shop-trust"><span>${icon('truck')}<b class="t0">Entrega</b></span><span>${icon('shield')}<b class="t0">Seguro</b></span><span>${icon('refresh')}<b class="t0">Troca</b></span></div>`)+
    phone('pf-shop-phone', `<strong class="t2">Para você, novamente</strong><ul class="pf-shop-list"><li><span class="pf-shop-thumb">${dropper()}</span><span><b class="t0">Sérum</b><small class="t0">R$ 89,90</small></span><i class="pf-shop-add">${icon('plus')}</i></li><li><span class="pf-shop-thumb">${tube()}</span><span><b class="t0">Gel</b><small class="t0">R$ 59,90</small></span><i class="pf-shop-add">${icon('plus')}</i></li><li><span class="pf-shop-thumb">${jar('pf-jar--xs')}</span><span><b class="t0">Kit duo</b><small class="t0">R$ 99,90</small></span><i class="pf-shop-add">${icon('plus')}</i></li></ul>`)+
    `<svg class="pf-leaves" viewBox="0 0 40 60" aria-hidden="true" focusable="false"><path d="M20 60C20 45 18 30 13 16" fill="none" stroke="#2c5a45" stroke-width="1.4"/><path d="M14 31C3 27 0 13 6 4c8 6 12 18 8 27z" fill="#2f6049"/><path d="M19.5 41C33 37 38 23 34 12c-10 4-16 16-14.5 29z" fill="#3b7258"/><path d="M18.5 51C7 51 1 41 3 33c10 2 15.5 10 15.5 18z" fill="#24503d"/><path d="M14 31L7 8M19.5 41L32 15M18.5 51L5 35" fill="none" stroke="#9CCBB0" stroke-opacity=".35" stroke-width=".7"/></svg><div class="pf-shop-object"><i class="pf-stone pf-stone--lg"></i>${jar('pf-jar--lg')}</div>`),
  sistemas:scene('sistemas',
    laptop('pf-sy-laptop', `<div class="pf-sy-head"><b class="t1">Fila de atendimento</b><span class="pf-chip t0">Hoje</span></div><div class="pf-sy-board"><div class="pf-sy-col"><span class="t0">Entrada</span><i class="pf-sy-card is-new"><em class="t0">Agenda</em><b class="t0">Remarcar visita</b></i><i class="pf-sy-card"><em class="t0 is-b">Pedido</em><b class="t0">Segunda via</b></i></div><div class="pf-sy-col"><span class="t0">Triagem</span><i class="pf-sy-card"><em class="t0 is-c">Dúvida</em><b class="t0">Prazo de entrega</b></i></div><div class="pf-sy-col"><span class="t0">Equipe</span><i class="pf-sy-card is-done"><em class="t0">Agenda</em><b class="t0">Recepção</b>${icon('check')}</i></div></div>`)+
    phone('pf-sy-phone', `<div class="pf-sy-ptop"><b class="t1">Novo pedido</b><i>${icon('inbox')}</i></div><p class="pf-sy-msg t1">Olá! Preciso remarcar minha visita de quinta.</p><div class="pf-sy-suggest"><span class="pf-sy-tag t0">${icon('sparkle')}Sugestão (simulada)</span><span class="pf-sy-route"><b class="t1">Agenda</b>${icon('arrow')}<b class="t1">Recepção</b></span></div><span class="pf-ui-btn pf-ui-btn--full t0">Encaminhar${icon('arrow')}</span>`))
};
const stepIcons = {
  sites:['structure','pointer','code'],
  conteudo:['bulb','camera','send'],
  campanhas:['target','image','formats'],
  video:['script','clapper','scissors'],
  lojas:['bag','card','refresh'],
  sistemas:['inbox','filter','check']
};
const coverSteps = brand => `<ol class="pf-case-steps">${brand.steps.map((step, n) => `<li><span class="pf-case-step-icon" aria-hidden="true">${icon(stepIcons[brand.id][n])}</span><span>${escape(step)}</span></li>`).join('')}</ol>`;
const brands = copy.cards.map(card => ({ ...card, ...metadata[card.id], approach: card.context }));
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const make = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const $ = (selector, root) => root.querySelector(selector);

export function mountFatosDeck() {
  const anchor = document.querySelector('#editorial');
  if (!anchor) return null;
  const existing = anchor.querySelector('#colecao');
  if (existing) return existing;
  const motion = createMotion();
  const shell = make(`<section id="colecao" class="pf-fatos-deck shell" aria-label="Seis experiências interativas de criação e desenvolvimento" data-active="0">
    <div class="pf-fatos-intro">
      <div class="pf-fatos-context"><span data-fatos-index>01 / 06</span><strong data-fatos-name></strong><h4 data-fatos-question></h4><p data-fatos-territory></p></div>
    </div>
    <div class="pf-fatos-display"><div class="pf-fatos-stage" role="region" aria-roledescription="carrossel" aria-label="Seis exemplos de serviços interativos" tabindex="0"></div><div class="pf-fatos-navigation" role="group" aria-label="Navegar pelas composições"><button type="button" data-fatos-prev aria-label="Composição anterior"><span aria-hidden="true">←</span></button><p class="pf-fatos-counter" role="status" aria-live="polite"></p><button type="button" data-fatos-next aria-label="Próxima composição"><span aria-hidden="true">→</span></button></div></div>
  </section>`);
  const bottom = anchor.querySelector('.editorial-bottom');
  if (bottom) bottom.before(shell); else anchor.append(shell);
  const stage = $('.pf-fatos-stage', shell);
  let active = 0, drag = null, lastSwipe = -Infinity, arrival = null, departure = null, settlement = null, flightToken = 0;
  const cards = brands.map((brand, i) => {
    const card = make(`<article class="pf-fatos-card" data-fatos-card="${brand.id}" aria-label="${i + 1} de ${brands.length}: ${escape(brand.name)}"><div class="pf-fatos-rotor"><div class="pf-fatos-face pf-fatos-front" data-fatos-front><div class="pf-fatos-shade" aria-hidden="true"></div><div class="pf-fatos-profile"><span class="pf-case-mark" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><strong>${escape(brand.name)}</strong><span>${escape(brand.handle)}</span></div></div><div class="pf-fatos-question"><span class="pf-fatos-rule" aria-hidden="true"></span><h4>${escape(brand.question)}</h4><p class="pf-fatos-support">${escape(brand.support)}</p></div><div class="pf-fatos-art pf-case-art pf-case-art--${brand.id}" aria-hidden="true">${coverScenes[brand.id]}</div>${coverSteps(brand)}<button type="button" class="pf-fatos-flip" data-fatos-flip aria-expanded="false"><span class="pf-fatos-flip-label">${escape(copy.controls.front)}</span> <span class="pf-fatos-flip-arrow" aria-hidden="true">${icon('arrow')}</span></button></div><div class="pf-fatos-face pf-fatos-back" data-fatos-back aria-hidden="true" inert><div class="pf-fatos-back-heading"><span class="pf-case-mark" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><span>PROTÓTIPO INTERATIVO</span><h4 tabindex="-1" data-fatos-back-title>${escape(brand.name)}</h4></div></div><p class="pf-fatos-approach">${escape(brand.approach)}</p><div class="pf-fatos-formats"><span>O QUE ESTA DEMONSTRAÇÃO EXPLORA</span><ul>${brand.formats.map(format => `<li>${escape(format)}</li>`).join('')}</ul></div><button type="button" class="pf-fatos-flip" data-fatos-return>${escape(copy.controls.back)} <span aria-hidden="true">↶</span></button></div></div></article>`);
    card.style.setProperty('--fatos-accent', brand.color);
    $('[data-fatos-flip]', card).addEventListener('click', () => flip(true, true));
    $('[data-fatos-return]', card).addEventListener('click', () => flip(false, true));
    stage.append(card); return card;
  });
  $('[data-fatos-prev]', shell).addEventListener('click', () => go(active - 1));
  $('[data-fatos-next]', shell).addEventListener('click', () => go(active + 1));
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
    // Opening lands at the start of the back, so Tab continues into the demo and its CTA.
    if (open) $('[data-fatos-back]', card).scrollTop = 0;
    if (moveFocus) $(open ? '[data-fatos-back-title]' : '[data-fatos-flip]', card).focus({ preventScroll: true });
  }
  function paint() {
    shell.dataset.active = String(active);
    cards.forEach((card, i) => {
      const position = (i - active + cards.length) % cards.length;
      card.dataset.position = String(position); card.classList.toggle('is-active', i === active);
      card.inert = i !== active; card.setAttribute('aria-hidden', String(i !== active)); setFace(card, false);
    });
    $('[data-fatos-index]', shell).textContent = String(active + 1).padStart(2, '0') + ' / 06';
    $('[data-fatos-name]', shell).textContent = brands[active].name;
    $('[data-fatos-question]', shell).textContent = brands[active].question;
    $('[data-fatos-territory]', shell).textContent = brands[active].approach;
    $('.pf-fatos-counter', shell).textContent = (active + 1) + ' de 6 · ' + brands[active].short;
  }
  const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('is-paused');
  // The reference's idle sections are stable, with a faint patterned light
  // following a fine pointer. Keep this completely independent of card physics.
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  let glintFrame=0,glintCard=null,glintCoordinates=null;
  function clearGlint(){
    if(glintFrame){cancelAnimationFrame(glintFrame);glintFrame=0;}
    glintCard?.classList.remove('is-illuminated');
    glintCard=null;glintCoordinates=null;
  }
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
    if(!finePointer.matches||reduced()||drag||stage.dataset.motion==='exchange'){clearGlint();return;}
    const card=event.target.closest('.pf-fatos-card.is-active:not(.is-flipped)');
    if(!card||!stage.contains(card)){clearGlint();return;}
    if(glintCard!==card){clearGlint();glintCard=card;}
    const rect=card.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    glintCoordinates={
      x:Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100)),
      y:Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))
    };
    if(glintFrame)return;
    glintFrame=requestAnimationFrame(()=>{
      glintFrame=0;
      if(!glintCard||!glintCoordinates)return;
      glintCard.style.setProperty('--fatos-light-x',glintCoordinates.x.toFixed(1)+'%');
      glintCard.style.setProperty('--fatos-light-y',glintCoordinates.y.toFixed(1)+'%');
      glintCard.classList.add('is-illuminated');
    });
  },{passive:true});
  stage.addEventListener('pointerleave',clearGlint,{passive:true});
  stage.addEventListener('pointerdown',clearGlint,{passive:true});
  function clearFlight(){
    clearGlint();
    flightToken++;
    arrival?.cancel();departure?.cancel();settlement?.cancel();
    arrival=null;departure=null;settlement=null;
    cards.forEach(card=>{
      card.classList.remove('is-departing');
      card.style.removeProperty('transition');
      card.style.removeProperty('transform');
      card.style.removeProperty('opacity');
      card.style.removeProperty('z-index');
    });
    stage.dataset.motion='idle';
  }
  // Four exchanges in the 25s reference settle in roughly 0.45–0.55s.
  // Keep each DOM card persistent; only the physical position is animated.
  const EXCHANGE_MS=480;
  function go(index,released=null){
    const next=(index+cards.length)%cards.length;
    if(next===active)return;
    const previous=cards[active],incoming=cards[next];
    const focusWasOnCard=previous.contains(document.activeElement);
    const offset=(next-active+cards.length)%cards.length;
    const direction=released?.direction??(offset<=cards.length/2?1:-1);
    const incomingFrom=released?.incomingFrom||getComputedStyle(incoming).transform;
    const previousFrom=released?.transform||previous.style.transform||'translateX(0px) rotate(0deg) scale(1)';
    cancelDrag(false);
    clearFlight();
    const token=flightToken;
    active=next;
    paint();
    if(!reduced()){
      stage.dataset.motion='exchange';
      stage.dataset.referenceTiming=String(EXCHANGE_MS);
      const distance=Math.min(previous.getBoundingClientRect().width*.76,305);
      const exit='translate3d('+(-direction*distance)+'px,-10px,0) rotate('+(-direction*8.5)+'deg) scale(.946)';
      previous.classList.add('is-departing');
      previous.style.transition='none';
      previous.style.zIndex='12';
      departure=previous.animate([
        {offset:0,transform:previousFrom,opacity:1},
        {offset:.18,transform:'translate3d('+(-direction*distance*.11)+'px,-2px,0) rotate('+(-direction*2)+'deg) scale(.996)',opacity:1},
        {offset:.76,transform:'translate3d('+(-direction*distance*.92)+'px,-10px,0) rotate('+(-direction*7.3)+'deg) scale(.952)',opacity:1},
        {offset:.94,transform:exit,opacity:.96},
        {offset:1,transform:exit,opacity:0}
      ],{duration:EXCHANGE_MS,easing:'cubic-bezier(.23,.74,.24,1)',fill:'both'});
      incoming.style.transition='none';
      arrival=incoming.animate([
        {offset:0,transform:incomingFrom==='none'?'translateX(20px) rotate(4deg) scale(.97)':incomingFrom,opacity:1},
        {offset:.70,transform:'translate3d('+(direction*3)+'px,-2px,0) rotate('+(direction*.65)+'deg) scale(1.017)',opacity:1},
        {offset:1,transform:'translate3d(0,0,0) rotate(0deg) scale(1)',opacity:1}
      ],{duration:EXCHANGE_MS,easing:'cubic-bezier(.20,.78,.22,1)',fill:'both'});
      Promise.allSettled([departure.finished,arrival.finished]).then(()=>{
        if(token!==flightToken)return;
        previous.classList.remove('is-departing');
        previous.style.removeProperty('transition');
        previous.style.removeProperty('z-index');
        incoming.style.removeProperty('transition');
        arrival?.cancel();departure?.cancel();
        arrival=null;departure=null;
        stage.dataset.motion='idle';
      });
    }
    if(focusWasOnCard)$('[data-fatos-flip]',cards[active]).focus({preventScroll:true});
  }
  shell.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cards[active].classList.contains('is-flipped')) { event.preventDefault(); flip(false, true); return; }
    // Keys pressed inside a demo belong to its controls, not to deck navigation.
    if (event.target.closest?.('[data-fatos-back],input,select,textarea,[contenteditable]')) return;
    const destinations = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: brands.length - 1 };
    if (event.key in destinations) { event.preventDefault(); go(destinations[event.key]); }
  });
  // A link elsewhere can name a capability; it opens that card's front without flipping it.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-deck-card]');
    const index = link ? brands.findIndex(brand => brand.id === link.dataset.deckCard) : -1;
    if (index >= 0) go(index);
  });
  function cancelDrag(animate=true){
    const current=drag;
    drag=null;delete stage.dataset.dragging;delete stage.dataset.direction;
    if(!current)return;
    const from=current.card.style.transform;
    current.card.style.removeProperty('transform');
    current.card.style.removeProperty('transition');
    current.card.style.removeProperty('opacity');
    if(current.preview){
      current.preview.style.removeProperty('transition');
      current.preview.style.removeProperty('transform');
      current.preview.style.removeProperty('opacity');
    }
    if(stage.hasPointerCapture?.(current.id))stage.releasePointerCapture(current.id);
    if(animate&&current.axis==='horizontal'&&from&&!reduced()){
      settlement?.cancel();
      settlement=motion.spring(current.card,progress=>({
        transform:'translate3d('+(current.offset*(1-progress))+'px,'+(-5*current.progress*(1-progress))+'px,0) rotate('+(current.rotation*(1-progress))+'deg) scale('+(1-.045*current.progress*(1-progress))+')',
        opacity:1-.1*current.progress*(1-progress)
      }),{duration:380,name:'smooth'});
    }
  }
  stage.addEventListener('pointerdown',event=>{
    if(drag||!event.isPrimary||event.target.closest('button,a,[data-no-card-flip]')||
       !event.target.closest('.pf-fatos-card.is-active')||
       (event.pointerType==='mouse'&&event.button!==0))return;
    clearFlight();
    drag={
      x:event.clientX,y:event.clientY,id:event.pointerId,
      card:cards[active],axis:null,width:cards[active].getBoundingClientRect().width,
      offset:0,rotation:0,progress:0,direction:0,preview:null
    };
  });
  stage.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.axis){
      if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)*1.1){cancelDrag(false);return;}
      if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.35)return;
      drag.axis='horizontal';
      stage.dataset.dragging='true';
      stage.setPointerCapture?.(event.pointerId);
      drag.card.style.transition='none';
    }
    if(event.cancelable)event.preventDefault();
    const direction=dx<0?1:-1;
    if(drag.direction!==direction){
      if(drag.preview){
        drag.preview.style.removeProperty('transform');
        drag.preview.style.removeProperty('opacity');
        drag.preview.style.removeProperty('transition');
      }
      drag.direction=direction;
      drag.preview=cards[(active+direction+cards.length)%cards.length];
      drag.preview.style.transition='none';
    }
    const limit=drag.width*.83;
    drag.offset=clamp(dx,-limit,limit);
    drag.progress=clamp(Math.abs(dx)/(drag.width*.72),0,1);
    drag.rotation=clamp(dx/drag.width*13,-13,13);
    const p=drag.progress;
    drag.card.style.transform='translate3d('+drag.offset+'px,'+(-7*p)+'px,0) rotate('+drag.rotation+'deg) scale('+(1-.055*p)+')';
    drag.card.style.opacity='1';
    const sourceX=direction===1?23:-27,sourceAngle=direction*5;
    drag.preview.style.transform='translate3d('+(sourceX*(1-p))+'px,'+(3*(1-p)-4*p)+'px,0) rotate('+(sourceAngle*(1-p))+'deg) scale('+(.974+.026*p)+')';
    drag.preview.style.opacity='1';
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const current = drag, dx = event.clientX - current.x, dy = event.clientY - current.y;
    const threshold = Math.max(42, Math.min(72, current.width * .22));
    const deliberate = current.axis === 'horizontal' && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.25;
    if (deliberate) {
      lastSwipe = performance.now();
      const transform=current.card.style.transform;
      const incomingFrom=current.preview?.style.transform;
      go(active+(dx<0?1:-1),{transform,incomingFrom,direction:dx<0?1:-1});
    } else cancelDrag(true);
  });
  stage.addEventListener('pointercancel', () => cancelDrag(true));
  stage.addEventListener('lostpointercapture', event => { if (event.target === stage) cancelDrag(true); });
  stage.addEventListener('pointerleave', () => { if (drag && !drag.axis) cancelDrag(false); });
  stage.addEventListener('click', event => { if (performance.now() - lastSwipe < 300) { event.preventDefault(); event.stopPropagation(); } }, true);
  motion.onStop(() => {clearGlint();cancelDrag(false);clearFlight();});
  paint(); shell.dataset.ready = 'true'; return shell;
}
