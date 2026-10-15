/**
 * Native adaptation of smiile's current interactive demos, pinned to a2e6d42.
 * Original source/asset provenance: ../portfolio/recovered-smiile/SOURCES.md.
 * Prepared examples only. No GPS, booking, call or messaging service is invoked.
 */
import { createDeviceFrame } from './device-frame.js';
import { TRAIL, MAP, ROUTE_D, WAYPOINTS, PROFILE, trailAt, routeSplit, fmt } from '../portfolio/recovered-smiile/trail-data.js';

const ASSET = '/assets/portfolio/recovered-smiile/';
const HOUSE = '/assets/portfolio/smiile-architecture-coast.webp';
const iconPaths = {
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4Z"/>', search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  mountain: '<path d="m2 20 7-15 5 10 3-6 5 11Zm4-8 3 2 2-2"/>', map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>', pause: '<path d="M8 4v16M16 4v16"/>', check: '<path d="m5 12 4 4L20 5"/>',
  phone: '<path d="m8 3 3 5-3 3c2 3 3 4 6 5l3-3 4 3c-1 7-5 5-9 3S3 11 3 6c0-2 2-3 5-3Z"/>',
  volume: '<path d="M3 9h4l5-5v16l-5-5H3Zm13-2c3 3 3 7 0 10m3-13c5 5 5 11 0 16"/>',
  file: '<path d="M5 3h9l5 5v13H5Zm9 0v6h5M8 13h8m-8 4h6"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 5 3 2 4-4"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.arrow}</svg>`;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const globallyPaused = () => document.body.classList.contains('is-paused');
const statMarkup = () => `<dl class="pd-trail-stats"><div><dt>Distância</dt><dd>${fmt.km1(TRAIL.distanceKm)}</dd></div><div><dt>Subida</dt><dd>${fmt.m(TRAIL.gainM)}</dd></div><div><dt>Duração</dt><dd>${TRAIL.durationText}</dd></div></dl>`;
const segments = [
  { speaker: 'Maestro', text: 'Oi, Ana! Sou o Maestro, o assistente. Sexta às 10h funciona?', start: .6, end: 6.36 },
  { speaker: 'Ana', text: 'Funciona. Dá para incluir o banco da mesa?', start: 6.96, end: 11.2 },
  { speaker: 'Maestro', text: 'Dá sim. Mando a proposta atualizada hoje.', start: 11.8, end: 15.48 },
  { speaker: 'Ana', text: 'Perfeito, obrigada!', start: 16.08, end: 18.8 }
];

function routeMap(progress = 0, miniature = false) {
  const point = trailAt(progress);
  return `<svg class="pd-route-map" viewBox="${miniature ? '65 70 420 690' : '30 60 450 700'}" role="img" aria-label="Mapa demonstrativo da Trilha do Arco, da Vila do Farol à Praia do Arco">
    <image href="${ASSET}trail-map.svg" width="${MAP.width}" height="${MAP.height}"/>
    <path d="${ROUTE_D}" fill="none" stroke="white" stroke-width="11" stroke-linecap="round"/>
    <path d="${ROUTE_D}" fill="none" stroke="#94ac8c" stroke-width="6" stroke-linecap="round"/>
    <path class="pd-route-done" d="${routeSplit(progress).done}" fill="none" stroke="#264e3e" stroke-width="7" stroke-linecap="round"/>
    ${WAYPOINTS.filter(point => point.id === 'start' || point.id === 'end').map(point => `<circle cx="${point.x}" cy="${point.y}" r="10" fill="#264e3e" stroke="white" stroke-width="4"/>`).join('')}
    <g class="pd-route-position" transform="translate(${point.x} ${point.y})"><circle r="23" fill="#264e3e" opacity=".16"/><circle r="10" fill="#264e3e" stroke="white" stroke-width="4"/></g>
  </svg>`;
}

function installPhone(host, { scheme = 'light', label, time = '7:12' } = {}) {
  const frame = createDeviceFrame({ tone: 'light', scheme, time, label });
  host.append(frame.root);
  const resize = () => frame.root.style.setProperty('--df-pt', `${Math.min(370, host.clientWidth) / 435}px`);
  resize();
  new ResizeObserver(resize).observe(host);
  return frame;
}

function createTrailDemo(panel, reduced) {
  panel.innerHTML = `<div class="pd-demo-layout"><div class="pd-device-host" data-testid="apps-demo" data-screen="list"></div><aside class="pd-demo-context"><span class="pd-overline">APP / TRILHAS</span><h3>O próximo caminho<br>começa com um toque.</h3><p>Busque uma trilha, salve sua escolha e acompanhe o mesmo percurso até a chegada.</p><ol class="pd-journey"><li data-journey="list">Explore os caminhos</li><li data-journey="detail">Conheça o percurso</li><li data-journey="map">Acompanhe no mapa</li><li data-journey="summary">Guarde a experiência</li></ol><p class="pd-small">Interface navegável do projeto smiile.<br>O percurso é uma simulação sem GPS.</p></aside></div>`;
  const host = $('[data-testid="apps-demo"]', panel);
  const phone = installPhone(host, { label: 'App Trilhas: busca, detalhes, mapa e percurso interativos' });
  phone.screen.innerHTML = '<div class="pd-app-viewport"></div>';
  const viewport = $('.pd-app-viewport', panel);
  let screen = 'list', saved = false, savedOnly = false, query = '', progress = 0, running = false, timer = null;
  let listScroll = 0, listPageScroll = 0;
  const searchText = normalize(`${TRAIL.name} ${TRAIL.from} ${TRAIL.to} ${TRAIL.difficulty} Bahia costa`);

  function listResult() {
    const visible = searchText.includes(normalize(query)) && (!savedOnly || saved);
    return `<div class="pd-result-heading"><b>${savedOnly ? 'Seus caminhos' : 'Um caminho especial'}</b><span role="status">${visible ? '1 trilha' : '0 trilhas'}</span></div>${visible ? `<article class="pd-trail-card"><button class="pd-trail-open" data-app-action="open" aria-label="Abrir Trilha do Arco"><div class="pd-trail-photo"><img src="${ASSET}landscape.webp" width="1400" height="933" alt="Falésias e mar na costa da Trilha do Arco" loading="lazy" decoding="async"><span>Moderada</span><i>${icon('arrow')}</i></div><div class="pd-trail-copy"><h4>Trilha do Arco</h4><p>Vila do Farol → Praia do Arco</p><div>8,4 km <i>·</i> 2h40 <i>·</i> 312 m</div></div></button><button class="pd-save" data-app-action="save" aria-pressed="${saved}" aria-label="${saved ? 'Remover Trilha do Arco das salvas' : 'Salvar Trilha do Arco'}">${icon('bookmark')}</button></article>` : `<div class="pd-trail-empty">${icon('search')}<h4>${savedOnly ? 'Seus caminhos ficam aqui.' : 'Nenhuma trilha encontrada.'}</h4><p>${savedOnly ? 'Salve a Trilha do Arco para encontrá-la depois.' : 'Busque por Arco, Farol ou Bahia.'}</p><button data-app-action="clear">Ver todas as trilhas ${icon('arrow')}</button></div>`}`;
  }
  function updateList() { const results = $('.pd-list-results', viewport); if (results) results.innerHTML = listResult(); }
  function elevation() {
    const path = PROFILE.map((value, index) => `${index ? 'L' : 'M'}${index / (PROFILE.length - 1) * 300},${65 - value / 173 * 60}`).join(' ');
    return `<div class="pd-elevation"><div><b>Perfil de altitude</b><span>Máx. 173 m</span></div><svg viewBox="0 0 300 70" role="img" aria-label="Perfil de altitude com três subidas"><path d="${path} L300 70 L0 70 Z" fill="#dfe7d9"/><path d="${path}" fill="none" stroke="#567454" stroke-width="2"/></svg><div><span>0 km</span><span>8,4 km</span></div></div>`;
  }
  function render() {
    host.dataset.screen = screen;
    $$('.pd-journey li', panel).forEach(item => item.classList.toggle('is-current', item.dataset.journey === screen));
    if (screen === 'list') viewport.innerHTML = `<div class="pd-trail-list"><header class="pd-app-header"><b>${icon('mountain')}trilhas</b><span aria-label="Perfil ilustrativo Bia">B</span></header><div class="pd-app-intro"><span>BAHIA, BRASIL</span><h3 tabindex="-1">O lado de fora<br>te espera.</h3><p>Encontre seu próximo caminho.</p></div><label class="pd-search">${icon('search')}<input type="search" aria-label="Buscar trilhas" placeholder="Buscar trilhas" autocomplete="off"></label><div class="pd-app-filters" role="group" aria-label="Filtrar trilhas"><button data-app-filter="all" aria-pressed="${!savedOnly}">Explorar</button><button data-app-filter="saved" aria-pressed="${savedOnly}">${icon('bookmark')}Salvas</button></div><div class="pd-list-results">${listResult()}</div><p class="pd-list-foot">${icon('map')}Uma rota, do primeiro passo à chegada.</p></div>`;
    if (screen === 'detail') viewport.innerHTML = `<div class="pd-detail-photo"><img src="${ASSET}landscape.webp" alt="Costa e falésias da Trilha do Arco" decoding="async"><div class="pd-photo-nav"><button data-app-action="list" aria-label="Voltar para a lista">${icon('back')}</button><button data-app-action="save" aria-pressed="${saved}" aria-label="${saved ? 'Remover Trilha do Arco das salvas' : 'Salvar Trilha do Arco'}">${icon('bookmark')}</button></div><div class="pd-photo-caption"><span>MODERADA</span><h3 tabindex="-1">Trilha do Arco</h3><p>Vila do Farol → Praia do Arco</p></div></div><div class="pd-detail-body">${statMarkup()}<p>Entre falésias e o mar. Um caminho pela costa, com uma pausa no mirante antes de chegar ao Arco.</p><button class="pd-map-preview" data-app-action="map" aria-label="Abrir mapa da Trilha do Arco">${routeMap(progress, true)}<span>${icon('map')}Ver mapa do percurso ${icon('arrow')}</span></button>${elevation()}<button class="pd-primary" data-app-action="map">Explorar percurso ${icon('arrow')}</button></div>`;
    if (screen === 'map') viewport.innerHTML = `<header class="pd-map-heading"><button data-app-action="detail" aria-label="Voltar para os detalhes">${icon('back')}</button><div><span>TRILHA DO ARCO</span><h3 tabindex="-1">Seu percurso</h3></div><span class="pd-north">N ↑</span></header><div class="pd-live-map">${routeMap(progress)}<span>Vila do Farol → Praia do Arco</span></div><div class="pd-route-panel"><div class="pd-route-title"><span>PERCURSO SIMULADO</span><b>Trilha do Arco</b></div><div class="pd-route-metrics"><div><b data-metric="km"></b><span>de 8,4 km</span></div><div><b data-metric="gain"></b><span>subida</span></div><div><b data-metric="time"></b><span>tempo</span></div></div><div class="pd-progress" role="progressbar" aria-label="Percurso simulado" aria-valuemin="0" aria-valuemax="100"><i></i></div><p class="pd-small">Simulação acelerada · sem acesso ao GPS.</p><button class="pd-primary" data-app-action="run"></button><button class="pd-secondary" data-app-action="finish">Concluir percurso ${icon('check')}</button></div>`;
    if (screen === 'summary') viewport.innerHTML = `<div class="pd-trail-summary"><button class="pd-back" data-app-action="detail" aria-label="Voltar para os detalhes">${icon('back')}</button><div class="pd-summary-check">${icon('check')}</div><span class="pd-overline">PERCURSO DO EXEMPLO CONCLUÍDO</span><h3 tabindex="-1">Você chegou<br>ao Arco.</h3><p>A mesma trilha, do primeiro toque<br>ao último passo.</p><div class="pd-summary-map">${routeMap(1, true)}</div>${statMarkup()}<p class="pd-small">Resumo da simulação. Nenhuma atividade real foi registrada.</p><button class="pd-primary" data-app-action="save" aria-pressed="${saved}">${icon(saved ? 'check' : 'bookmark')}${saved ? 'Trilha salva neste exemplo' : 'Salvar trilha'}</button><button class="pd-secondary" data-app-action="list">Voltar para a lista ${icon('arrow')}</button><button class="pd-text-button" data-app-action="restart">Repetir percurso</button></div>`;
    if (screen === 'list') $('input', viewport).value = query;
    if (screen === 'map') updateProgress();
    viewport.scrollTop = screen === 'list' ? listScroll : 0;
  }
  function navigate(next) {
    if (screen === 'list') { listScroll = viewport.scrollTop; listPageScroll = window.scrollY; }
    stop(); screen = next; render();
    const focus = next === 'list' ? $('[data-app-action="open"]', viewport) || $('input', viewport) : $('h3', viewport);
    focus?.focus({ preventScroll: true });
    if (next === 'list') window.scrollTo({ top: listPageScroll, behavior: 'instant' });
  }
  function stop() {
    clearInterval(timer); timer = null; running = false;
    if (screen === 'map') updateProgress();
  }
  function updateProgress() {
    if (screen !== 'map') return;
    const point = trailAt(progress);
    $('[data-metric="km"]', viewport).textContent = fmt.km1(point.km);
    $('[data-metric="gain"]', viewport).textContent = fmt.m(point.gainM);
    $('[data-metric="time"]', viewport).textContent = fmt.hm(point.elapsedS);
    $('.pd-route-position', viewport).setAttribute('transform', `translate(${point.x} ${point.y})`);
    $('.pd-route-done', viewport).setAttribute('d', routeSplit(progress).done);
    const track = $('.pd-progress', viewport);
    track.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    $('i', track).style.transform = `scaleX(${progress})`;
    const button = $('[data-app-action="run"]', viewport);
    button.innerHTML = `${icon(running ? 'pause' : 'play')}${reduced.matches || globallyPaused() ? 'Avançar 25% do percurso' : running ? 'Pausar percurso' : progress ? 'Retomar percurso' : 'Iniciar percurso simulado'}`;
    $('[data-app-action="finish"]', viewport).hidden = progress === 0;
  }
  viewport.addEventListener('input', event => { if (event.target.matches('input[type="search"]')) { query = event.target.value; updateList(); } });
  viewport.addEventListener('click', event => {
    const filter = event.target.closest('[data-app-filter]');
    if (filter) { savedOnly = filter.dataset.appFilter === 'saved'; $$('[data-app-filter]', viewport).forEach(button => button.setAttribute('aria-pressed', String((button.dataset.appFilter === 'saved') === savedOnly))); updateList(); return; }
    const button = event.target.closest('[data-app-action]'); if (!button) return;
    const action = button.dataset.appAction;
    if (action === 'open' || action === 'detail') navigate('detail');
    else if (action === 'list') navigate('list');
    else if (action === 'map') navigate('map');
    else if (action === 'save') {
      saved = screen === 'summary' ? true : !saved;
      if (screen === 'list') { updateList(); $('[data-app-action="save"]', viewport)?.focus({ preventScroll: true }); }
      else if (screen === 'summary') { button.setAttribute('aria-pressed', 'true'); button.innerHTML = `${icon('check')}Trilha salva neste exemplo`; }
      else { button.setAttribute('aria-pressed', String(saved)); button.setAttribute('aria-label', saved ? 'Remover Trilha do Arco das salvas' : 'Salvar Trilha do Arco'); }
    } else if (action === 'clear') { query = ''; savedOnly = false; render(); $('input', viewport).focus({ preventScroll: true }); }
    else if (action === 'finish') { progress = 1; navigate('summary'); }
    else if (action === 'restart') { progress = 0; navigate('map'); }
    else if (action === 'run') {
      if (reduced.matches || globallyPaused()) { progress = Math.min(1, progress + .25); if (progress === 1) navigate('summary'); else updateProgress(); }
      else if (running) stop();
      else { running = true; updateProgress(); timer = setInterval(() => { progress = Math.min(1, progress + .01); if (progress >= 1) navigate('summary'); else updateProgress(); }, 300); }
    }
  });
  render();
  return { pause: stop };
}

// Snapshot the next three local calendar days once, so selected and confirmed
// dates stay coherent even when the page remains open across midnight.
const visits = [1, 2, 3].map(offset => {
  const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + offset);
  return { day: String(date.getDate()).padStart(2, '0'), short: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(), full: date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) };
});

function createSiteDemo(panel) {
  panel.innerHTML = `<div class="pd-site-intro"><span class="pd-overline">SITE / CASA COSTA</span><h3>Uma casa para desacelerar.<br>Um site para explorar.</h3><p>Da paisagem ao próximo encontro: navegue pela página e experimente o agendamento.</p></div><div class="pd-mac"><div class="pd-mac-display"><div class="pd-browser-chrome"><span aria-hidden="true"><i></i><i></i><i></i></span><small>Casa Costa · página de exemplo</small></div><div class="pd-site"><nav class="pd-site-nav" aria-label="Páginas da Casa Costa"><strong>Casa Costa</strong><div role="tablist" aria-label="Explorar Casa Costa">${[['home', 'A casa'], ['gallery', 'Galeria'], ['visit', 'Visita']].map(([id, title], index) => `<button type="button" id="pd-site-tab-${id}" role="tab" aria-selected="${!index}" aria-controls="pd-site-content" tabindex="${index ? -1 : 0}" data-site-tab="${id}">${title}</button>`).join('')}</div></nav><div class="pd-site-content" id="pd-site-content" role="tabpanel" aria-labelledby="pd-site-tab-home"></div><footer class="pd-site-foot"><b>Casa Costa</b><span>Navegação e agendamento locais</span></footer></div></div><div class="pd-mac-base" aria-hidden="true"></div></div>`;
  const content = $('.pd-site-content', panel);
  let tab = 'home', photo = 0, day = 0, time = '10h', confirmed = false;
  function render() {
    content.setAttribute('aria-labelledby', `pd-site-tab-${tab}`);
    $$('[data-site-tab]', panel).forEach(button => { const active = button.dataset.siteTab === tab; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
    if (tab === 'home') content.innerHTML = `<div class="pd-house-photo"><img src="${HOUSE}" width="1400" height="933" alt="Casa contemporânea em uma paisagem costeira" loading="lazy" decoding="async"><div><span>UBATUBA · LITORAL NORTE</span><h4>Mais perto<br>do mar.</h4></div></div><div class="pd-house-intro"><p>Uma casa para desacelerar. Luz natural, materiais honestos e o horizonte por perto.</p><button type="button" data-site-action="visit">Conhecer de perto ${icon('arrow')}</button></div>`;
    if (tab === 'gallery') content.innerHTML = `<div class="pd-house-gallery"><div class="pd-gallery-image"><img src="${HOUSE}" width="1400" height="933" alt="Casa Costa — ${['vista completa', 'detalhe da fachada', 'paisagem costeira'][photo]}" style="object-position:${['center', '20% center', '90% center'][photo]};transform:scale(${photo ? 1.45 : 1})"></div><div class="pd-gallery-controls" role="group" aria-label="Enquadramento da Casa Costa">${['Vista completa', 'Fachada', 'Paisagem'].map((label, index) => `<button data-site-photo="${index}" aria-pressed="${photo === index}">${label}</button>`).join('')}</div><p>Uma mesma imagem, três pontos de vista.</p></div>`;
    if (tab === 'visit') content.innerHTML = confirmed ? `<div class="pd-visit-confirmation" data-testid="site-confirmation" role="status" tabindex="-1">${icon('calendar')}<span class="pd-overline">CONFIRMAÇÃO DO EXEMPLO</span><h4>Seu próximo encontro<br>com o mar.</h4><p>${visits[day].full}<br><strong>${time}</strong> · Casa Costa, Ubatuba</p><small>Simulação local. Nenhuma visita foi enviada ou reservada.</small><button data-site-action="change">${icon('back')}Escolher outro horário</button></div>` : `<form class="pd-visit-form" data-site-form><span class="pd-overline">CASA COSTA · UBATUBA</span><h4 tabindex="-1">Venha conhecer.</h4><p>Escolha uma data e um horário para testar o agendamento.</p><fieldset><legend>Dia da visita</legend><div class="pd-visit-days">${visits.map((visit, index) => `<button type="button" data-site-day="${index}" aria-pressed="${day === index}" aria-label="${visit.full}"><span>${visit.short}</span><b>${visit.day}</b><small>${visit.month}</small></button>`).join('')}</div></fieldset><fieldset><legend>Horário</legend><div class="pd-visit-times">${['10h', '14h', '16h'].map(slot => `<button type="button" data-site-time="${slot}" aria-pressed="${time === slot}">${slot}</button>`).join('')}</div></fieldset><button type="submit" class="pd-site-submit">Confirmar visita no exemplo ${icon('arrow')}</button></form>`;
  }
  function changeTab(next) { tab = next; render(); }
  panel.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.siteTab) changeTab(button.dataset.siteTab);
    else if (button.hasAttribute('data-site-photo')) { photo = Number(button.dataset.sitePhoto); const image = $('.pd-gallery-image img', panel); image.style.objectPosition = ['center', '20% center', '90% center'][photo]; image.style.transform = `scale(${photo ? 1.45 : 1})`; image.alt = `Casa Costa — ${['vista completa', 'detalhe da fachada', 'paisagem costeira'][photo]}`; $$('[data-site-photo]', panel).forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.sitePhoto) === photo))); }
    else if (button.hasAttribute('data-site-day')) { day = Number(button.dataset.siteDay); $$('[data-site-day]', panel).forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.siteDay) === day))); }
    else if (button.dataset.siteTime) { time = button.dataset.siteTime; $$('[data-site-time]', panel).forEach(item => item.setAttribute('aria-pressed', String(item.dataset.siteTime === time))); }
    else if (button.dataset.siteAction === 'visit') { changeTab('visit'); $('.pd-visit-form h4, .pd-visit-confirmation', panel)?.focus({ preventScroll: true }); }
    else if (button.dataset.siteAction === 'change') { confirmed = false; render(); $('.pd-visit-form h4', panel)?.focus({ preventScroll: true }); }
  });
  panel.addEventListener('submit', event => { if (!event.target.matches('[data-site-form]')) return; event.preventDefault(); confirmed = true; render(); $('.pd-visit-confirmation', panel)?.focus({ preventScroll: true }); });
  panel.addEventListener('keydown', event => { const button = event.target.closest('[data-site-tab]'); if (!button) return; const tabs = ['home', 'gallery', 'visit']; const current = tabs.indexOf(tab); const next = event.key === 'ArrowRight' ? (current + 1) % 3 : event.key === 'ArrowLeft' ? (current + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : -1; if (next < 0) return; event.preventDefault(); changeTab(tabs[next]); $(`[data-site-tab="${tab}"]`, panel).focus(); });
  render();
}

function createVoiceDemo(panel) {
  panel.innerHTML = `<div class="pd-voice-intro"><span class="pd-overline">VOZ + DOCUMENTO / ESTÚDIO FORMA</span><h3>Uma conversa.<br>A proposta atualizada.</h3><p>Ana confirma a visita e pede um novo item. Ouça a ligação e compare o documento antes de aprovar.</p></div><div class="pd-voice-layout"><div class="pd-device-host pd-call-host"></div><div class="pd-proposal"><div class="pd-proposal-heading"><span>${icon('file')}ESTÚDIO FORMA</span><b>Proposta</b></div><div class="pd-version-picker" role="group" aria-label="Versão da proposta"><button data-proposal-version="2" aria-pressed="false">v2 · Antes</button><button data-proposal-version="3" aria-pressed="true">v3 · Depois</button></div><div class="pd-proposal-body"></div><button class="pd-primary" data-proposal-approve>Aprovar revisão no exemplo ${icon('check')}</button><p class="pd-proposal-status" role="status">Confira a versão 3 antes de aprovar.</p></div></div><audio data-call-audio preload="none" src="${ASSET}agents-call-pt-br.mp3"></audio>`;
  const phone = installPhone($('.pd-call-host', panel), { scheme: 'dark', time: '10:47', label: 'Ligação ilustrativa entre Maestro e Ana, com transcrição e áudio' });
  phone.screen.innerHTML = `<div class="pd-call"><span class="pd-call-state">Ligação gravada · 0:19</span><h4>Estúdio Forma</h4><p>Maestro e Ana</p><div class="pd-transcript" tabindex="0" aria-label="Transcrição da ligação"><span>Transcrição · Maestro por você</span>${segments.map((segment, index) => `<p data-call-segment="${index}"><b>${segment.speaker}</b>${segment.text}</p>`).join('')}</div><button class="pd-call-play" data-call-play aria-pressed="false">${icon('play')}Ouvir ligação</button><div class="pd-call-progress" role="progressbar" aria-label="Reprodução da ligação" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><p class="pd-call-feedback" role="status">Áudio do projeto · toque para ouvir.</p><small>Gravação ilustrativa. Nenhuma ligação é realizada.</small></div>`;
  const audio = $('[data-call-audio]', panel), playButton = $('[data-call-play]', panel), feedback = $('.pd-call-feedback', panel);
  let version = 3, approved = false, spokenSegment = -1;
  function renderProposal() {
    const body = $('.pd-proposal-body', panel);
    body.dataset.version = String(version); body.dataset.total = String(version === 3 ? 13900 : 12000); body.dataset.visit = version === 3 ? 'sexta, 10h' : 'quinta, 15h';
    body.innerHTML = `<span class="pd-overline">PARA ANA · PROPOSTA V${version}</span><h4>Uma composição<br>para a sala.</h4><div class="pd-proposal-item"><span><b>Mesa de jantar em freijó</b><small>2,2 × 0,9 m · acabamento natural</small></span><strong>R$ 7.800</strong></div><div class="pd-proposal-item"><span><b>Aparador · 1,6 m</b><small>Freijó · duas portas</small></span><strong>R$ 4.200</strong></div>${version === 3 ? '<div class="pd-proposal-item is-added"><span><b>Banco da mesa</b><small>Pedido pela Ana na ligação</small></span><strong>R$ 1.900</strong></div>' : ''}<div class="pd-proposal-item"><span><b>Visita técnica</b><small>${version === 3 ? 'sexta, 10h' : 'quinta, 15h'}</small></span><strong>Incluída</strong></div><div class="pd-proposal-total"><span>Total v${version}</span><strong>R$ ${version === 3 ? '13.900' : '12.000'}</strong></div><p>${version === 3 ? 'Mesa e aparador preservados. O acréscimo corresponde ao banco solicitado.' : 'Antes da ligação: mesa e aparador, sem o banco.'}</p>`;
    const approve = $('[data-proposal-approve]', panel); approve.disabled = version !== 3 || approved;
    approve.innerHTML = approved ? `${icon('check')}Revisão aprovada no exemplo` : `Aprovar revisão no exemplo ${icon('check')}`;
    $('.pd-proposal-status', panel).textContent = approved ? 'Aprovação registrada apenas neste exemplo. Nenhum envio realizado.' : version === 3 ? 'Confira a versão 3 antes de aprovar.' : 'Selecione a versão 3 para revisar a atualização.';
    $$('[data-proposal-version]', panel).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.proposalVersion) === version)));
  }
  function syncAudio() {
    const playing = !audio.paused;
    playButton.setAttribute('aria-pressed', String(playing));
    playButton.innerHTML = `${icon(playing ? 'pause' : 'play')}${playing ? 'Pausar ligação' : audio.ended ? 'Ouvir novamente' : audio.currentTime > 0 ? 'Retomar ligação' : 'Ouvir ligação'}`;
    feedback.textContent = globallyPaused() ? 'Use Retomar movimento no controle da página para ouvir a ligação.' : playing ? 'Reproduzindo a gravação.' : audio.ended ? 'Ligação encerrada. Compare a proposta ao lado.' : audio.currentTime > 0 ? 'Gravação pausada.' : 'Áudio do projeto · toque para ouvir.';
  }
  playButton.addEventListener('click', async () => {
    // Global playback pause is deliberate; reduced-motion alone never mutes
    // user-requested audio. Keep the control discoverable and explain the gate.
    if (globallyPaused()) { audio.pause(); syncAudio(); return; }
    if (!audio.paused) { audio.pause(); return; }
    try { if (audio.ended) audio.currentTime = 0; await audio.play(); }
    catch { feedback.textContent = 'Não foi possível tocar o áudio. A transcrição completa continua disponível.'; }
  });
  ['play', 'pause', 'ended'].forEach(type => audio.addEventListener(type, syncAudio));
  audio.addEventListener('timeupdate', () => {
    const progress = Math.min(1, audio.currentTime / (audio.duration || 19.4));
    const track = $('.pd-call-progress', panel); track.setAttribute('aria-valuenow', String(Math.round(progress * 100))); $('i', track).style.transform = `scaleX(${progress})`;
    $$('[data-call-segment]', panel).forEach((item, index) => item.classList.toggle('is-speaking', audio.currentTime >= segments[index].start && audio.currentTime < segments[index].end));
    const speaking = segments.findIndex(segment => audio.currentTime >= segment.start && audio.currentTime < segment.end);
    if (speaking >= 0 && speaking !== spokenSegment) {
      spokenSegment = speaking;
      const transcript = $('.pd-transcript', panel), line = $(`[data-call-segment="${speaking}"]`, panel);
      const box = transcript.getBoundingClientRect(), current = line.getBoundingClientRect();
      if (current.bottom > box.bottom - 10 || current.top < box.top + 10) transcript.scrollTop += current.top - box.top - 25;
    }
  });
  panel.addEventListener('click', event => { const selector = event.target.closest('[data-proposal-version]'); if (selector) { version = Number(selector.dataset.proposalVersion); renderProposal(); } if (event.target.closest('[data-proposal-approve]') && version === 3 && !approved) { approved = true; renderProposal(); } });
  renderProposal();
  return { pause: () => { audio.pause(); syncAudio(); }, sync: syncAudio };
}

export function mountProductDemos() {
  const host = $('.systems-demo'); if (!host || host.dataset.productDemos === 'ready') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  host.classList.add('pd-workbench');
  host.innerHTML = `<div class="pd-workbench-top"><span>SMIILE / EXPERIÊNCIAS NAVEGÁVEIS</span><span>TOQUE E EXPLORE ↗</span></div><div class="pd-product-tabs" role="tablist" aria-label="Explorar experiências digitais">${[['app', 'App de trilhas', 'mountain'], ['site', 'Site de arquitetura', 'map'], ['voice', 'Voz e proposta', 'phone']].map(([id, label, glyph], index) => `<button type="button" id="pd-tab-${id}" role="tab" aria-selected="${!index}" tabindex="${index ? -1 : 0}" aria-controls="pd-panel-${id}" data-product-tab="${id}">${icon(glyph)}<span>${label}</span></button>`).join('')}</div><div class="pd-stage">${['app', 'site', 'voice'].map((id, index) => `<div id="pd-panel-${id}" data-product-panel="${id}" class="pd-panel" role="tabpanel" aria-labelledby="pd-tab-${id}"${index ? ' hidden' : ''}></div>`).join('')}</div><div class="pd-workbench-foot"><span>PROJETOS DIGITAIS / INTERAÇÕES REAIS</span><a href="https://smiile-landing-preview.up.railway.app/#categorias" target="_blank" rel="noopener noreferrer">Explorar a smiile ↗</a></div>`;
  const app = createTrailDemo($('[data-product-panel="app"]', host), reduced);
  createSiteDemo($('[data-product-panel="site"]', host));
  const voice = createVoiceDemo($('[data-product-panel="voice"]', host));
  const tabs = ['app', 'site', 'voice']; let active = 'app';
  function select(next) {
    app.pause(); voice.pause(); active = next;
    $$('[data-product-tab]', host).forEach(button => { const current = button.dataset.productTab === next; button.setAttribute('aria-selected', String(current)); button.tabIndex = current ? 0 : -1; });
    $$('[data-product-panel]', host).forEach(panel => { panel.hidden = panel.dataset.productPanel !== next; });
    host.dataset.activeProduct = next;
  }
  $('.pd-product-tabs', host).addEventListener('click', event => { const button = event.target.closest('[data-product-tab]'); if (button) select(button.dataset.productTab); });
  $('.pd-product-tabs', host).addEventListener('keydown', event => { const index = tabs.indexOf(active); const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : -1; if (next < 0) return; event.preventDefault(); select(tabs[next]); $(`[data-product-tab="${active}"]`, host).focus(); });
  const pause = () => { app.pause(); voice.pause(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, { threshold: .01 }).observe(host);
  reduced.addEventListener('change', pause);
  new MutationObserver(() => { if (globallyPaused()) pause(); else { app.pause(); voice.sync(); } }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  host.dataset.productDemos = 'ready'; host.dataset.activeProduct = 'app';
}
