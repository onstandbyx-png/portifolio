/**
 * Fatos social studio, adapted from onstandbyx-png/roblox @ b9c8270:
 * src/components/islands/estudio/{Instagram,TikTok}.tsx + src/lib/estudio.ts.
 * The 3-frame editorial story uses original local art and the source's phone
 * chronology. No invented engagement counts, publication or advertiser claims.
 */
import { createDeviceFrame, installDemoExplorer } from './device-frame.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const AVATAR = '/assets/portfolio/recovered-fatos/avatar_desconhecidos.webp';
const frames = [
  { src: '/assets/portfolio/recovered-fatos/post-desconhecidos-600.webp', position: '50% 28%', label: 'Gancho', title: 'O que cabe hoje na palma da mão?', detail: 'Um objeto cotidiano abre uma história sobre a transformação da comunicação.', caption: 'Um objeto cotidiano. Quatro décadas de transformação.' },
  { src: '/assets/portfolio/cena-desconhecidos.webp', position: '50% 40%', label: 'Contexto', title: 'Em 1983: cerca de 800 g e 10 horas para recarregar.', detail: 'O primeiro celular de mão à venda dava cerca de 30 minutos de conversa. O contexto explica a dimensão da mudança.', caption: 'Cerca de 30 minutos de conversa. Dez horas para recarregar.' },
  { src: '/assets/portfolio/campanha-desconhecidos.webp', position: '50% 32%', label: 'Conexão', title: 'Hoje: câmera, mapa, carteira e tradutor.', detail: 'A mesma história volta à rotina: funções que antes dependiam de objetos diferentes agora cabem no celular.', caption: 'A tecnologia mudou. A curiosidade continua.' }
];
const paths = {
  back: 'M15 4 7 12l8 8', next: 'm9 4 8 8-8 8', search: 'M10.6 18a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8zM16 16l5 5',
  heart: 'M12 20.3s-7.6-4.6-9.4-9.4C1.4 7.6 3.5 4.3 6.9 4.3c2.2 0 3.7 1.3 5.1 3 1.4-1.7 2.9-3 5.1-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.4 9.4-9.4 9.4z',
  comment: 'M20.6 16.2A9.3 9.3 0 1 0 17 19.9l4.3 1.4z', repost: 'M5.5 10.5V8.2a3 3 0 0 1 3-3h10M15.5 2.2l3 3-3 3M18.5 13.5v2.3a3 3 0 0 1-3 3h-10M8.5 21.8l-3-3 3-3',
  send: 'M3 4.5 21 5.6 10.6 20.6zM10 12.2 16.6 8.4', save: 'M5.5 3h13v18L12 15.2 5.5 21z',
  share: 'M13.4 3.6c0-.7.8-1 1.3-.6l7.6 7.2c.4.4.4 1 0 1.3l-7.6 7.3c-.5.5-1.3.1-1.3-.6v-3.6C7.6 14.5 4.6 16.7 2.4 20.4 2.6 13.3 6 8.5 13.4 7.6z',
  home: 'M3.6 10.1 12 3.4l8.4 6.7V20.6H14.6v-6.1H9.4v6.1H3.6z', friends: 'M9.2 11.4a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8zM2.2 20.6c.5-4 3.3-6.2 7-6.2s6.5 2.2 7 6.2M15.6 3.8a3.9 3.9 0 0 1 0 7.4M17.8 14.6c2.3.7 3.6 2.8 4 6',
  inbox: 'M4.6 4h14.8c.9 0 1.6.7 1.6 1.6v10.6c0 .9-.7 1.6-1.6 1.6h-5.2L12 20.6l-2.2-2.8H4.6c-.9 0-1.6-.7-1.6-1.6V5.6C3 4.7 3.7 4 4.6 4z',
  user: 'M12 12.2a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6zM4.2 21c.6-4.3 3.6-6.6 7.8-6.6s7.2 2.3 7.8 6.6',
  note: 'M9 17.6V5.4l10-2v12.2M9 17.6a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0zM19 15.6a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0z',
  play: 'M8 4v16l12-8Z', pause: 'M8 4v16M16 4v16', plus: 'M12 4v16M4 12h16', menu: 'M3 7h18M3 16h13',
  live: 'm8 2 4 4 4-4M4 6h16v15H4Z M8 11v5h8v-5Z'
};
function icon(name, fill = false) { return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill ? 'currentColor' : 'none'}" stroke="${fill ? 'none' : 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`; }
const decodeCache = new Map();
function decoded(src) {
  if (decodeCache.has(src)) return decodeCache.get(src);
  const image = new Image(); image.decoding = 'async'; image.src = src;
  const promise = (image.decode ? image.decode() : new Promise((resolve, reject) => { if (image.complete && image.naturalWidth) resolve(); else { image.onload = resolve; image.onerror = reject; } })).then(() => { if (!image.naturalWidth) throw Error('Imagem indisponível'); return image; });
  decodeCache.set(src, promise); promise.catch(() => decodeCache.delete(src)); return promise;
}
const paused = () => document.body.classList.contains('is-paused');

function upgradeTabIcons(root) {
  const logos = {
    meta: '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 16c0-6 3-12 7-12 5 0 9 16 14 16 3 0 5-3 5-7 0-5-2-9-5-9-4 0-8 10-11 14-2 3-5 3-7 1-2-1-3-2-3-3Z" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h3c.3 3 1.5 4.4 4 4.7v3a9.7 9.7 0 0 1-4-1.2V17a6 6 0 1 1-7-5.9v3.2a2.7 2.7 0 1 0 4 2.4V3Z" fill="currentColor"/></svg>',
    google: '<svg viewBox="0 0 26 24" aria-hidden="true"><path d="m11 4-9 15a4 4 0 0 0 7 4L18 8Z" fill="currentColor" opacity=".45"/><path d="m11 8 9 15a4 4 0 0 0 7-4L18 4a4 4 0 1 0-7 4Z" transform="translate(-2 -2)" fill="currentColor"/><circle cx="5" cy="19" r="4" fill="currentColor"/></svg>',
    chatgpt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4V4Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9 10 2 2 4-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };
  for (const [key, svg] of Object.entries(logos)) { const holder = $(`[data-ad-tab="${key}"] .ads-tab-icon`, root); if (holder) holder.innerHTML = svg; }
}

function fitPhone(host, frame) {
  const resize = () => {
    if (!host.clientWidth) return;
    const mobile = matchMedia('(max-width:900px)').matches;
    // The hidden CSS probe resolves 100svh to pixels. Browser chrome expanding
    // on Android must not repeatedly resize the phone while the user scrolls.
    const stableViewport = parseFloat(getComputedStyle(host, '::before').height) || innerHeight;
    // Reserve the header, spacing and full 44px frame controls as one unit.
    const exploring = !!host.closest('.is-exploring');
    const height = Math.max(420, Math.min(exploring ? 860 : 720, stableViewport - (exploring ? 100 : mobile ? 140 : 170)));
    const width = Math.min(host.clientWidth, height * 435 / 907, exploring ? 400 : 350);
    frame.root.style.setProperty('--df-pt', `${width / 435}px`);
    host.style.setProperty('--sa-phone-width', `${width}px`);
    host.parentElement.style.setProperty('--sa-phone-width', `${width}px`);
  };
  new ResizeObserver(resize).observe(host); addEventListener('resize', resize, { passive: true }); resize();
}

function createAside(platform) {
  const aside = document.createElement('div'); aside.className = 'mock-aside sa-story-aside';
  aside.innerHTML = `<span>${platform === 'meta' ? 'INSTAGRAM / CARROSSEL' : 'TIKTOK / VÍDEO VERTICAL'}</span><h3>A mesma história.<br>Outro ritmo.</h3><p class="sa-story-detail">${frames[0].detail}</p><div class="sa-sequence" role="group" aria-label="Etapas da história">${frames.map((frame, index) => `<button type="button" ${platform === 'meta' ? `data-rx-social="${index}" aria-current="${!index}"` : `data-frame="${index}" aria-pressed="${!index}"`}><small>0${index + 1}</small><span>${frame.label}</span></button>`).join('')}</div><p class="sa-story-feedback" role="status" aria-live="polite">${platform === 'meta' ? 'Deslize a imagem ou escolha um quadro.' : 'Três quadros, em uma sequência de 12 segundos.'}</p>`;
  return aside;
}

function addExplorer(panel, label) {
  const aside = $('.sa-story-aside', panel);
  const trigger = document.createElement('button');
  trigger.type = 'button'; trigger.className = 'df-explore-trigger';
  trigger.innerHTML = 'Explorar em tamanho maior <span aria-hidden="true">↗</span>';
  aside.prepend(trigger);
  return installDemoExplorer({ source: panel, trigger, title: label, onChange: () => panel.dispatchEvent(new Event('demo:explorationchange')) });
}

function createMeta(panel) {
  const root = document.createElement('div'); root.className = 'sa-social rx-instagram'; root.dataset.platform = 'meta'; root.dataset.socialFrame = '0';
  root.innerHTML = `<div class="sa-device-host"></div><div class="sa-frame-controls"><button type="button" data-rx-social-prev aria-label="Imagem anterior">${icon('back')}</button><span class="sa-frame-label">01 / 03 · Gancho</span><button type="button" data-rx-social-next aria-label="Próxima imagem">${icon('next')}</button></div>`;
  const frame = createDeviceFrame({ tone: 'light', scheme: 'dark', time: '10:09', label: 'Instagram: carrossel editorial Fatos Desconhecidos em três quadros' });
  frame.root.classList.add('sa-device', 'pf-social-device'); $('.sa-device-host', root).append(frame.root);
  frame.screen.innerHTML = `<div class="sa-instagram"><div class="sa-ig-topbar" aria-hidden="true">${icon('back')}<strong>Posts</strong><span>Seguir</span></div><div class="sa-ig-profile"><img src="${AVATAR}" alt="" width="40" height="40" loading="lazy"><div><b>fatosdesconhecidos</b><small>Tecnologia no dia a dia</small></div><span aria-hidden="true">${icon('menu')}</span></div><div class="sa-media rx-ig-photo" role="group" aria-label="Imagem do carrossel"><img src="${frames[0].src}" alt="${frames[0].title}" decoding="async" loading="lazy"><span class="rx-ig-count">1/3</span><div class="rx-ig-overlay"><small>FATOS DESCONHECIDOS</small><h3>${frames[0].title}</h3></div></div><div class="sa-ig-dots" aria-hidden="true"><i data-dot="0" class="is-current"></i><i data-dot="1"></i><i data-dot="2"></i></div><div class="sa-ig-actions" aria-hidden="true">${icon('heart')}${icon('comment')}${icon('repost')}${icon('send')}<span>${icon('save')}</span></div><p class="sa-ig-caption"><b>fatosdesconhecidos</b> <span>${frames[0].caption}</span></p></div>`;
  panel.replaceChildren(root, createAside('meta')); panel.classList.add('sa-panel'); fitPhone($('.sa-device-host', root), frame);
  return { root, frame, area: $('.sa-media', root), image: $('.sa-media>img', root), title: $('.rx-ig-overlay h3', root), caption: $('.sa-ig-caption>span', root) };
}

function createTikTok(panel) {
  const root = document.createElement('div'); root.className = 'sa-social'; root.dataset.platform = 'tiktok'; root.dataset.socialFrame = '0';
  root.innerHTML = `<div class="sa-device-host"></div><div class="sa-frame-controls sa-frame-controls--playback"><button type="button" data-tt-prev aria-label="Quadro anterior">${icon('back')}</button><button type="button" class="sa-play" data-play-story aria-pressed="false" aria-label="Reproduzir sequência"><span class="sa-play-icon">${icon('play')}</span><span class="sa-play-copy"><span class="sa-play-action">Reproduzir</span><span class="sa-frame-label" aria-hidden="true">01 / 03</span></span></button><button type="button" data-tt-next aria-label="Próximo quadro">${icon('next')}</button></div>`;
  const frame = createDeviceFrame({ tone: 'light', scheme: 'dark', time: '10:09', label: 'TikTok: sequência editorial Fatos Desconhecidos, com três quadros controláveis' });
  frame.root.classList.add('sa-device', 'sa-tiktok-device'); $('.sa-device-host', root).append(frame.root);
  frame.screen.innerHTML = `<div class="sa-tiktok"><div class="sa-media sa-tt-media" role="group" aria-label="Quadro do vídeo"><img src="${frames[0].src}" alt="${frames[0].title}" decoding="async" loading="lazy"><div class="sa-tt-copy"><span>FATOS <small>DESCONHECIDOS</small></span><h3>${frames[0].title}</h3></div></div><div class="sa-tt-top" aria-hidden="true">${icon('live')}<span>Seguindo</span><b>Para você</b>${icon('search')}</div><div class="sa-tt-rail" aria-hidden="true"><span class="sa-tt-avatar"><img src="${AVATAR}" alt="" width="40" height="40"><i>${icon('plus')}</i></span>${icon('heart', true)}${icon('comment', true)}${icon('save', true)}${icon('share', true)}<span class="sa-tt-record"><img src="${AVATAR}" alt="" width="30" height="30"></span></div><div class="sa-tt-info"><b>@fatosdesconhecidos</b><p>${frames[0].caption}</p><span>${icon('note')}Histórias do cotidiano · Fatos</span></div><div class="sa-tt-progress" data-social-progress role="progressbar" aria-label="Progresso da sequência" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><div class="sa-tt-nav" aria-hidden="true"><span>${icon('home', true)}<small>Início</small></span><span>${icon('friends')}<small>Amigos</small></span><span class="sa-tt-create">${icon('plus')}</span><span>${icon('inbox')}<small>Caixa de entrada</small></span><span>${icon('user')}<small>Perfil</small></span></div></div>`;
  panel.replaceChildren(root, createAside('tiktok')); panel.classList.add('sa-panel'); fitPhone($('.sa-device-host', root), frame);
  return { root, frame, area: $('.sa-media', root), image: $('.sa-media>img', root), title: $('.sa-tt-copy h3', root), caption: $('.sa-tt-info>p', root) };
}

function wireStory(panel, specimen, platform) {
  const { root, area, image, title, caption } = specimen;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let requested = 0, committed = 0, revision = 0, pointer = null, playing = false, pending = false, raf = 0, elapsed = 0, lastTime = 0, preparing = 0;
  const duration = 12000, step = duration / frames.length;
  const feedback = $('.sa-story-feedback', panel), play = $('[data-play-story]', panel), progress = $('[data-social-progress]', panel);
  const setFeedback = text => { if (feedback.textContent !== text) feedback.textContent = text; };
  function paintProgress(value) { if (!progress) return; const p = Math.max(0, Math.min(1, value)); progress.setAttribute('aria-valuenow', String(Math.round(p * 100))); $('i', progress).style.transform = `scaleX(${p})`; }
  function paintPlay() {
    if (!play) return;
    const action = playing ? 'Pausar' : elapsed >= duration ? 'Rever' : elapsed > 0 ? 'Retomar' : 'Reproduzir';
    play.setAttribute('aria-pressed', String(playing));
    play.setAttribute('aria-label', `${action} sequência`);
    $('.sa-play-icon', play).innerHTML = icon(playing ? 'pause' : 'play');
    $('.sa-play-action', play).textContent = action;
  }
  function stop(message) { const active = playing || pending; preparing++; playing = false; pending = false; cancelAnimationFrame(raf); raf = 0; paintPlay(); if (active && message) setFeedback(message); }
  async function show(index, manual = true) {
    const next = (index + frames.length) % frames.length;
    requested = next;
    const ticket = ++revision, data = frames[next]; area.setAttribute('aria-busy', 'true');
    try {
      await decoded(data.src); if (ticket !== revision) return false;
      image.src = data.src; image.alt = `Fatos Desconhecidos: ${data.title}`; image.style.objectPosition = data.position;
      title.textContent = data.title; caption.textContent = data.caption; committed = next;
      root.dataset.socialFrame = String(next); root.dataset.socialReady = 'true'; area.removeAttribute('data-image-error');
      $('.sa-frame-label', root).textContent = `0${next + 1} / 03${platform === 'meta' ? ` · ${data.label}` : ''}`;
      $('.sa-story-detail', panel).textContent = data.detail;
      if (platform === 'meta') {
        $('.rx-ig-count', root).textContent = `${next + 1}/3`;
        $$('[data-rx-social]', panel).forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.rxSocial) === next)));
        $$('[data-dot]', root).forEach(dot => dot.classList.toggle('is-current', Number(dot.dataset.dot) === next));
      } else {
        $$('[data-frame]', panel).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.frame) === next)));
        if (manual) { elapsed = next * step; paintProgress(elapsed / duration); paintPlay(); }
      }
      if (manual) setFeedback(`Quadro ${next + 1} de 3: ${data.label}. ${platform === 'meta' ? 'Deslize para explorar.' : 'Escolha outro quadro ou reproduza a sequência.'}`);
      decoded(frames[(next + 1) % frames.length].src).catch(() => {}); return true;
    } catch { if (ticket === revision) { requested = committed; area.dataset.imageError = 'true'; setFeedback('A imagem anterior foi mantida. Tente novamente.'); } return false; }
    finally { if (ticket === revision) area.setAttribute('aria-busy', 'false'); }
  }
  const navigate = index => { stop(); show(index); };
  $('[data-rx-social-prev],[data-tt-prev]', root).addEventListener('click', () => navigate(requested - 1));
  $('[data-rx-social-next],[data-tt-next]', root).addEventListener('click', () => navigate(requested + 1));
  $$('[data-rx-social],[data-frame]', panel).forEach(button => button.addEventListener('click', () => navigate(Number(button.dataset.rxSocial ?? button.dataset.frame))));
  area.style.touchAction = 'pan-y';
  area.addEventListener('pointerdown', event => { if (event.isPrimary) pointer = { x: event.clientX, y: event.clientY }; });
  area.addEventListener('pointerup', event => { if (!pointer) return; const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.25) navigate(requested + (dx < 0 ? 1 : -1)); });
  area.addEventListener('pointercancel', () => { pointer = null; });
  if (play) {
    function tick(now) {
      if (!playing) return;
      if (paused() || document.hidden || panel.hidden || reduced.matches) { stop('Sequência pausada. Retome de onde parou.'); return; }
      elapsed = Math.min(duration, elapsed + Math.min(100, now - lastTime)); lastTime = now;
      const target = Math.min(2, Math.floor(elapsed / step)); if (target !== requested) show(target, false);
      paintProgress(elapsed / duration);
      if (elapsed >= duration) { stop(); setFeedback('Sequência concluída: gancho, contexto e conexão.'); return; }
      raf = requestAnimationFrame(tick);
    }
    play.addEventListener('click', async () => {
      if (playing) { stop(); setFeedback('Sequência pausada. Continue de onde parou.'); return; }
      if (paused()) { setFeedback('Use Retomar movimento no controle da página para reproduzir. Os quadros continuam disponíveis.'); return; }
      if (reduced.matches) { navigate((committed + 1) % 3); return; }
      const generation = ++preparing; pending = true; setFeedback('Preparando a sequência…');
      try { await Promise.all(frames.map(frame => decoded(frame.src))); }
      catch { if (generation === preparing) { pending = false; setFeedback('Não foi possível preparar a sequência. Explore os quadros individualmente.'); } return; }
      if (generation !== preparing || paused() || panel.hidden || document.hidden) return;
      if (elapsed >= duration) elapsed = 0;
      await show(Math.min(2, Math.floor(elapsed / step)), false);
      if (generation !== preparing || paused() || panel.hidden || document.hidden) return;
      pending = false; playing = true; lastTime = performance.now(); paintPlay(); setFeedback('Reproduzindo a sequência de 12 segundos.'); raf = requestAnimationFrame(tick);
    });
  }
  // The observed unit includes the phone and its playback controls. Clicking
  // play must never scroll away from the unit whose visibility owns playback.
  new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop('Sequência pausada ao sair do aparelho. Retome de onde parou.'); }, { threshold: .01 }).observe(root);
  new MutationObserver(() => { if (panel.hidden) stop('Sequência pausada ao trocar de formato.'); }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(() => { if (paused()) stop('Sequência pausada pelo controle da página.'); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop('Sequência pausada ao sair da página.'); }); reduced.addEventListener('change', () => stop('Sequência pausada. Os quadros continuam disponíveis.'));
  panel.addEventListener('demo:explorationchange', () => stop('Sequência pausada. Retome de onde parou.'));
  show(0, false);
}

export function mountSocialAds(root = document) {
  const meta = $('#panel-meta', root), tiktok = $('#panel-tiktok', root); if (!meta || !tiktok) return null;
  if ($('.sa-social', meta)) return $('.sa-social', meta);
  upgradeTabIcons(root);
  const instagram = createMeta(meta), video = createTikTok(tiktok);
  wireStory(meta, instagram, 'meta'); wireStory(tiktok, video, 'tiktok');
  addExplorer(meta, 'Instagram · Fatos Desconhecidos');
  addExplorer(tiktok, 'TikTok · Fatos Desconhecidos');
  return instagram.root;
}
