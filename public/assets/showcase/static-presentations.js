/* Static artwork remains inside the moving portfolio presentation. */
import { createMotion } from '../sections/motion.js';
import { mountArtworkDialog } from './artwork-dialog.js';
const ART = '/assets/portfolio/static-r8/';

const campaignNotes = [
 {title:'Mostrar a ideia antes de explicá-la.',message:'Sua ideia ganha forma.',decision:'A proposta vem primeiro. As duas composições mostram como a mesma direção visual se desdobra em site e aplicativo.',delivery:'Conceito, copy e direção de arte para uma peça de feed.'},
 {title:'Responder à intenção de busca.',message:'Um site à altura da sua ideia.',decision:'A busca parte de uma necessidade concreta. O título responde ao pedido e a imagem conecta o anúncio ao projeto Casa Costa.',delivery:'Estudo de anúncio de pesquisa e ligação visual com o destino.'},
 {title:'Um convite pensado para a tela vertical.',message:'O próximo passo começa com um olhar.',decision:'O cenário ocupa a tela vertical. O texto conduz o olhar até a apresentação do aplicativo, mantendo um único convite.',delivery:'Peça vertical e direção visual para desdobramento em vídeo.'}
];

const campaigns = [
  { id: 'meta', name: 'Meta', logo: '/assets/brands/meta-official-primary.webp', width: 100, height: 28,
    alt: 'Campanha smiile para Meta: direção de arte para apresentar sites e aplicativos.' },
  { id: 'google', name: 'Google Ads', logo: '/assets/brands/google-ads-official-reference.webp', width: 32, height: 32,
    alt: 'Campanha smiile para Google: anúncio de pesquisa e continuidade visual da página.' },
  { id: 'tiktok', name: 'TikTok', logo: '/assets/brands/tiktok-official-icon-black-circle.png', width: 32, height: 32,
    alt: 'Campanha smiile para TikTok: composição vertical sobre explorar uma nova experiência.' },
];

function picture(file, alt, className = '') {
  return `<img class="${className}" src="${ART}${file}.webp" alt="${alt}" width="960" height="1200" loading="lazy" decoding="async">`;
}

function mountCampaign(motion) {
  const lab = document.querySelector('#laboratorio .ads-lab, #laboratorio .sp-campaign');
  if (!lab) return;
  lab.className = 'sp-campaign';
  lab.innerHTML = `<div class="sp-platforms" role="tablist" aria-label="Canais da campanha smiile">${campaigns.map((campaign, i) => `<button type="button" id="tab-${campaign.id}" role="tab" data-sp-tab="${campaign.id}" aria-controls="panel-${campaign.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}"><img class="sp-platform-logo sp-platform-logo--${campaign.id}" src="${campaign.logo}" alt="" width="${campaign.width}" height="${campaign.height}" aria-hidden="true"><span>${campaign.name}</span></button>`).join('')}</div>
    <div class="sp-campaign-art">${campaigns.map((campaign, i) => `<div class="sp-campaign-panel" id="panel-${campaign.id}" role="tabpanel" aria-labelledby="tab-${campaign.id}" tabindex="0"${i ? ' hidden' : ''}><figure>${picture(`campanha-${campaign.id}`, campaign.alt)}</figure></div>`).join('')}</div>`;
  const layout=document.createElement('div');layout.className='sp-campaign-layout';
  const art=lab.querySelector('.sp-campaign-art');art.before(layout);layout.append(art);
  const note=document.createElement('aside');note.className='sp-campaign-note';note.id='campaign-note';note.setAttribute('data-campaign-note','');note.setAttribute('aria-live','polite');note.setAttribute('aria-atomic','true');
  note.innerHTML='<span class="eyebrow">A decisão por trás da peça</span><h3 data-note-title></h3><dl><div><dt>Mensagem</dt><dd data-note-message></dd></div><div><dt>Adaptação ao canal</dt><dd data-note-decision></dd></div><div><dt>Entrega</dt><dd data-note-delivery></dd></div></dl><a href="#contato" data-contact-service="Campanhas e gestão de mídia">Conversar sobre uma campanha ↗</a>';
  layout.append(note);
  const tabs = Array.from(lab.querySelectorAll('[data-sp-tab]'));
  const panels = Array.from(lab.querySelectorAll('.sp-campaign-panel'));
  const figures = panels.map(panel => panel.querySelector('figure'));
  panels.forEach(panel => { panel.querySelector('img').loading = 'eager'; });
  let active = -1;
  let generation = 0;
  let transitions = [];

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
    lab.dataset.channel = campaigns[index].id;
    for(const field of ['title','message','decision','delivery'])note.querySelector('[data-note-'+field+']').textContent=campaignNotes[index][field];
    panels[index].setAttribute('aria-describedby','campaign-note');
    if (isChange && motion.available()) {
      lab.dataset.transitioning = 'true';
      panels.forEach((panel, i) => {
        const selected = i === index;
        // The outgoing panel is inaccessible immediately, but its exit remains
        // painted until the fade finishes. Exactly one panel owns focus.
        if (!selected && opacity[i] > 0) panel.dataset.leaving = 'true';
        else delete panel.dataset.leaving;
        if (!selected && opacity[i] <= 0) return;
        panel.style.zIndex = selected ? '2' : '1';
        figures[i].style.opacity = selected ? '1' : '0';
        const animation = motion.animate(figures[i], [
          { opacity: opacity[i] }, { opacity: selected ? 1 : 0 },
        ], { duration: 600, easing: 'cubic-bezier(.4,0,.2,1)' });
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
  return lab;
}

function mountProducts() {
  const section = document.querySelector('#sistemas');
  const grid = section?.querySelector('.systems-grid, .sp-products-shell');
  if (!grid) return;
  section.setAttribute('aria-labelledby', 'static-systems-title');
  grid.className = 'shell sp-products-shell';
  grid.innerHTML = `<h2 id="static-systems-title" class="sr-only">Interfaces digitais</h2><div class="sp-products">
    <figure>${picture('trilhas', 'Trilhas: interface para descobrir percursos, com busca, paisagem e informações organizadas para a escolha.')}<figcaption><span>Trilhas · Estudo de aplicativo</span></figcaption></figure>
    <article class="sp-product-context"><span class="eyebrow">Outro projeto, outra tarefa</span><h3>Encontrar um caminho.<br>Começar a explorar.</h3><p>Depois de apresentar um lugar em Casa Costa, o desafio aqui é ajudar a escolher um percurso.</p><dl><div><dt>Contribuição</dt><dd>Direção visual e UX/UI.</dd></div><div><dt>Decisão de interface</dt><dd>Busca, fotografia e informações do percurso organizam a escolha antes do próximo passo.</dd></div></dl><div class="sp-product-actions"><a href="${ART}trilhas.webp" data-art-open="trilhas">Ampliar a interface ↗</a><a href="#contato" data-contact-service="Sites, apps e sistemas">Conversar sobre um projeto digital ↗</a></div></article>
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
