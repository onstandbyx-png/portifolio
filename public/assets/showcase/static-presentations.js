/* Static artwork remains inside the moving portfolio presentation. */
import { createMotion } from '../sections/motion.js';
const ART = '/assets/portfolio/static-r8/';

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
  const tabs = Array.from(lab.querySelectorAll('[data-sp-tab]'));
  const panels = Array.from(lab.querySelectorAll('.sp-campaign-panel'));
  let active = -1;
  let transition = null;

  function select(index, focus = false) {
    if (index === active) return;
    const isChange = active !== -1;
    transition?.cancel();
    active = index;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    lab.dataset.channel = campaigns[index].id;
    if (isChange) transition = motion.animate(panels[index].querySelector('figure'), [
      { transform: 'translateY(18px) scale(.985)', opacity: .25 },
      { transform: 'translateY(0) scale(1)', opacity: 1 },
    ], { duration: 600 });
    if (focus) tabs[index].focus({ preventScroll: true });
  }
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
    <figure>${picture('casa-costa', 'Casa Costa: interface de arquitetura com fotografia ampla, navegação clara e informações de visita.')}<figcaption><span>Casa Costa · Estudo de interface</span><h3>Apresentar um lugar.<br>Conduzir uma escolha.</h3></figcaption></figure>
    <figure>${picture('trilhas', 'Trilhas: interface de aplicativo para descobrir percursos, com busca, fotografia da paisagem e cartão da Trilha do Arco.')}<figcaption><span>Trilhas · Estudo de aplicativo</span><h3>Encontrar um caminho.<br>Começar a explorar.</h3></figcaption></figure>
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
  const campaign = mountCampaign(motion);
  const products = mountProducts();
  revealPresentations([campaign, ...(products?.querySelectorAll('.sp-products > figure') || [])], motion);
  document.documentElement.dataset.staticPresentations = 'ready';
}
