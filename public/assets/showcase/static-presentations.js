/* Static artwork remains inside the moving portfolio presentation.
   Campaign channels: grouped tabs with the official platform marks and a
   sliding marker; the outgoing piece leaves to the side (30px, 300ms) and the
   new one enters with a spring (42px, 620ms), as in the earlier channel switch
   of the portfolio. Each front is the piece of a fictitious client. */
import { createMotion, clamp } from '../sections/motion.js';
import { mountArtworkDialog } from './artwork-dialog.js';
import { channels, groups, IMG, CLIENTES, marca } from './campaign-channels.js';
import { logoSvg, CHANNEL_LOGO } from './channel-logos.js';
const ART = '/assets/portfolio/static-r8/';
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function picture(file, alt, className = '') {
  return `<img class="${className}" src="${ART}${file}.webp" alt="${alt}" width="960" height="1200" loading="lazy" decoding="async">`;
}

function tabMarkup(channel, index) {
  const id = CHANNEL_LOGO[channel.id];
  const mark = id ? logoSvg(id, { altura: 16, classe: 'sp-platform-logo' }) : '';
  return `<button type="button" id="tab-${channel.id}" role="tab" data-sp-tab="${channel.id}" aria-controls="panel-${channel.id}" aria-describedby="sp-group-${channel.group}" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}">${mark}<span>${esc(channel.name)}</span></button>`;
}

/* The front of the peel: one photo and the piece's text in HTML (brand, headline, fictitious-brand notice). */
function panelMarkup(channel, index) {
  const { art } = channel, im = IMG[art.img], client = CLIENTES[art.cliente];
  return `<div class="sp-campaign-panel" id="panel-${channel.id}" role="tabpanel" aria-labelledby="tab-${channel.id}" tabindex="0"${index ? ' hidden' : ''}><figure class="sp-art"><img class="sp-art-photo" src="${im.src}" alt="${esc(art.alt)}" width="${im.w}" height="${im.h}" loading="lazy" decoding="async" style="object-position:${art.pos}"><figcaption class="sp-art-cap"><span class="sp-art-brand">${marca(art.cliente)}<b>${esc(client.marca)}</b></span><b class="sp-art-title">${esc(art.titulo)}</b><small class="sp-art-fine">Exemplo ilustrativo de ${esc(client.tipo)}, marca fictícia.</small></figcaption></figure></div>`;
}

function mountCampaign(motion) {
  const lab = document.querySelector('#laboratorio .ads-lab, #laboratorio .sp-campaign');
  if (!lab) return;
  lab.className = 'sp-campaign';
  const groupMarkup = groups.map(group => `<div class="sp-tab-group" role="presentation"><span class="sp-tab-group-label" id="sp-group-${group.id}" aria-hidden="true">${esc(group.label)}</span><div class="sp-tab-group-tabs" role="presentation">${channels.filter(channel => channel.group === group.id).map(channel => tabMarkup(channel, channels.indexOf(channel))).join('')}</div></div>`).join('');
  lab.innerHTML = `<div class="sp-platforms-wrap"><div class="sp-platforms" role="tablist" aria-label="Canais de anúncio"><span class="sp-tab-marker is-instant" aria-hidden="true"></span>${groupMarkup}</div></div>
    <div class="sp-campaign-art">${channels.map(panelMarkup).join('')}</div>`;
  const layout=document.createElement('div');layout.className='sp-campaign-layout';
  const art=lab.querySelector('.sp-campaign-art');art.before(layout);layout.append(art);
  // One short sentence per placement, the fictitious-brand notice and the contact link (the player keeps them in sync with the format).
  const note=document.createElement('aside');note.className='sp-campaign-note';note.id='campaign-note';note.setAttribute('data-campaign-note','');
  note.innerHTML='<p class="sp-note-frase" data-note-title></p><p class="sp-note-fine" data-note-fine>Exemplo ilustrativo, marca fictícia. Interface aproximada.</p><a href="#contato" data-contact-service="Campanhas e anúncios">Conversar sobre uma campanha ↓</a>';
  layout.append(note);
  const wrap = lab.querySelector('.sp-platforms-wrap');
  const list = lab.querySelector('.sp-platforms');
  const marker = list.querySelector('.sp-tab-marker');
  const tabs = Array.from(lab.querySelectorAll('[data-sp-tab]'));
  const panels = Array.from(lab.querySelectorAll('.sp-campaign-panel'));
  const figures = panels.map(panel => panel.querySelector('figure'));
  // The artworks load as the section approaches the viewport, not at page start.
  const warm = () => panels.forEach(panel => { panel.querySelector('img').loading = 'eager'; });
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { near.disconnect(); warm(); } }, { rootMargin: '900px 0px' });
    near.observe(lab);
  } else warm();
  let active = -1;
  let generation = 0;
  let transitions = [];

  // The marker lives inside the scrolling row, so its offset includes scrollLeft.
  function mark(tab = tabs[Math.max(0, active)], instant = false) {
    if (!tab || !list.getClientRects().length) return;
    const a = tab.getBoundingClientRect(), b = list.getBoundingClientRect();
    if (instant) marker.classList.add('is-instant');
    marker.style.width = `${a.width}px`;
    marker.style.height = `${a.height}px`;
    marker.style.transform = `translate(${a.left - b.left + list.scrollLeft}px,${a.top - b.top + list.scrollTop}px)`;
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => marker.classList.remove('is-instant')));
  }
  // Keeps the chosen tab visible inside its own row without scrolling the page.
  function reveal(tab, smooth) {
    const box = tab.getBoundingClientRect(), row = list.getBoundingClientRect();
    const pad = 28, left = box.left - row.left + list.scrollLeft, right = left + box.width;
    let target = null;
    if (left - pad < list.scrollLeft) target = Math.max(0, left - pad);
    else if (right + pad > list.scrollLeft + list.clientWidth) target = right + pad - list.clientWidth;
    if (target !== null) list.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
  }
  function edges() {
    const max = list.scrollWidth - list.clientWidth;
    wrap.dataset.scrollStart = String(list.scrollLeft > 2);
    wrap.dataset.scrollEnd = String(max - list.scrollLeft > 2);
  }
  list.addEventListener('scroll', edges, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => { mark(undefined, true); edges(); }).observe(list);
  document.fonts?.ready.then(() => { mark(undefined, true); edges(); });

  function settle() {
    transitions.forEach(animation => animation?.cancel());
    transitions = [];
    panels.forEach((panel, i) => {
      panel.hidden = i !== active;
      delete panel.dataset.leaving;
      figures[i].style.removeProperty('opacity');
      panel.style.removeProperty('z-index');
    });
    delete lab.dataset.transitioning;
  }

  function select(index, focus = false) {
    if (index === active) return;
    const isChange = active !== -1;
    const direction = index > active ? 1 : -1;
    const token = ++generation;
    const opacity = figures.map((figure, i) => getComputedStyle(panels[i]).display === 'none' ? 0 : Number(getComputedStyle(figure).opacity));
    transitions.forEach(animation => animation?.cancel());
    transitions = [];
    active = index;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
      panels[i].setAttribute('aria-hidden', String(!selected));
      panels[i].inert = !selected;
      panels[i].tabIndex = selected ? 0 : -1;
    });
    const channel = channels[index];
    lab.dataset.direction = direction > 0 ? 'next' : 'prev';
    lab.dataset.channel = channel.id;
    note.querySelector('[data-note-title]').textContent = channel.placements[0].frase;
    panels[index].setAttribute('aria-describedby','campaign-note');
    mark(tabs[index], !isChange);
    if (isChange) reveal(tabs[index], motion.available());
    edges();
    if (isChange && motion.available()) {
      lab.dataset.transitioning = 'true';
      panels.forEach((panel, i) => {
        const selected = i === index;
        // The outgoing piece is inaccessible immediately, but it stays painted
        // above the new one while it slides away. Exactly one panel owns focus.
        if (!selected && opacity[i] > 0) panel.dataset.leaving = 'true';
        else delete panel.dataset.leaving;
        if (!selected && opacity[i] <= 0) return;
        panel.style.zIndex = selected ? '1' : '2';
        let animation;
        if (selected) {
          animation = motion.spring(figures[i], p => ({ opacity: clamp(p * 1.8), transform: `translateX(${42 * direction * (1 - p)}px) scale(${.96 + .04 * p})` }), { duration: 620 });
        } else {
          figures[i].style.opacity = '0';
          animation = motion.animate(figures[i], [
            { opacity: opacity[i], transform: 'translateX(0) scale(1)' },
            { opacity: 0, transform: `translateX(${-30 * direction}px) scale(.97)` },
          ], { duration: 300 });
        }
        if (animation) transitions.push(animation);
      });
      Promise.all(transitions.map(animation => animation.finished.catch(() => {}))).then(() => {
        if (token === generation) settle();
      });
    } else settle();
    if (focus) tabs[index].focus({ preventScroll: true });
  }
  motion.onStop(() => { ++generation; settle(); });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });
  select(0);
  requestAnimationFrame(() => { mark(undefined, true); edges(); });
  return lab;
}

function mountProducts() {
  const section = document.querySelector('#trilhas:not([hidden])');
  const grid = section?.querySelector('.systems-grid, .sp-products-shell');
  if (!grid) return;
  section.setAttribute('aria-labelledby', 'static-systems-title');
  grid.className = 'shell sp-products-shell';
  grid.innerHTML = `<h2 id="static-systems-title" class="sr-only">Interfaces digitais</h2><div class="sp-products">
    <figure>${picture('trilhas', 'Trilhas: interface para descobrir percursos, com busca, paisagem e informações organizadas para a escolha.')}<figcaption><span>Trilhas · Estudo de aplicativo</span></figcaption></figure>
    <article class="sp-product-context"><span class="eyebrow">Outro projeto, outra tarefa</span><h3>Encontrar um caminho.<br>Começar a explorar.</h3><p>Depois de apresentar um lugar em Casa Costa, o desafio aqui é ajudar a escolher um percurso.</p><dl><div><dt>Contribuição</dt><dd>Direção visual e UX/UI.</dd></div><div><dt>Decisão de interface</dt><dd>Busca, fotografia e informações do percurso organizam a escolha antes do próximo passo.</dd></div></dl><div class="sp-product-actions"><a href="${ART}trilhas.webp" data-art-open="trilhas">Ampliar a interface ↗</a><a href="#contato" data-contact-service="Sites e landing pages">Conversar sobre um projeto digital ↗</a></div></article>
  </div>`;
  return grid;
}

function revealPresentations(elements, motion) {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      motion.animate(entry.target, [
        { transform: 'translateY(32px)', opacity: .35 },
        { transform: 'translateY(0)', opacity: 1 },
      ], { duration: 850 });
      entry.target.dataset.presentationRevealed = 'true';
    });
  }, { threshold: .12 });
  elements.filter(Boolean).forEach(element => observer.observe(element));
}

export function mountStaticPresentations() {
  if (document.documentElement.dataset.staticPresentations === 'ready') return;
  const motion = createMotion();
  mountArtworkDialog();
  const campaign = mountCampaign(motion);
  const products = mountProducts();
  revealPresentations([campaign, ...(products?.querySelectorAll('.sp-products > figure') || [])], motion);
  document.documentElement.dataset.staticPresentations = 'ready';
}
