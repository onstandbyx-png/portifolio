/* Static portfolio plates: artwork stays still; navigation belongs to the page. */
const ART = '/assets/portfolio/static-r8/';

const editorialScenes = [
  ['desconhecidos', 'Fatos Desconhecidos', 'Composição editorial sobre curiosidades e descobertas.'],
  ['esportes', 'Fatos Esportes', 'Composição editorial de histórias do esporte.'],
  ['crencas', 'Fatos e Crenças', 'Composição editorial sobre crenças e tradições.'],
  ['sobrenaturais', 'Fatos Sobrenaturais', 'Composição editorial de mistério e suspense.'],
  ['nerd', 'Fatos Nerd', 'Composição editorial de cultura pop e entretenimento.'],
  ['negocios', 'Fatos e Negócios', 'Composição editorial sobre negócios e trajetórias.'],
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

function mountEditorial() {
  const section = document.querySelector('#editorial');
  if (!section) return;
  const workbench = section.querySelector('.es-workbench, .sp-editorial');
  if (workbench) {
    workbench.className = 'shell sp-editorial';
    workbench.innerHTML = `<figure class="sp-editorial-art">${picture('fatos-editorial', 'Peça editorial Fatos Desconhecidos: uma pergunta cotidiana conduz a uma descoberta.')}<figcaption>Fatos Desconhecidos <span>Direção criativa e conteúdo</span></figcaption></figure>`;
  }

  let collection = section.querySelector('#colecao');
  if (!collection) {
    collection = document.createElement('section');
    collection.id = 'colecao';
    section.append(collection);
  }
  collection.className = 'shell sp-fatos-collection';
  collection.setAttribute('aria-label', 'Composições do ecossistema Fatos');
  collection.innerHTML = `<div class="sp-fatos-grid">${editorialScenes.map(([id, name, alt]) => `<figure><img class="sp-fatos-scene" src="${ART}${id === 'desconhecidos' ? 'fatos-editorial' : `fatos-${id}`}.webp" alt="${alt}" width="960" height="1200" loading="lazy" decoding="async"><figcaption>${name}</figcaption></figure>`).join('')}</div>`;
}

function mountCampaign() {
  const lab = document.querySelector('#laboratorio .ads-lab, #laboratorio .sp-campaign');
  if (!lab) return;
  lab.className = 'sp-campaign';
  lab.innerHTML = `<div class="sp-platforms" role="tablist" aria-label="Canais da campanha smiile">${campaigns.map((campaign, i) => `<button type="button" id="tab-${campaign.id}" role="tab" data-sp-tab="${campaign.id}" aria-controls="panel-${campaign.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? '0' : '-1'}"><img class="sp-platform-logo sp-platform-logo--${campaign.id}" src="${campaign.logo}" alt="" width="${campaign.width}" height="${campaign.height}" aria-hidden="true"><span>${campaign.name}</span></button>`).join('')}</div>
    <div class="sp-campaign-art">${campaigns.map((campaign, i) => `<div class="sp-campaign-panel" id="panel-${campaign.id}" role="tabpanel" aria-labelledby="tab-${campaign.id}" tabindex="0"${i ? ' hidden' : ''}><figure>${picture(`campanha-${campaign.id}`, campaign.alt)}</figure></div>`).join('')}</div>`;
  const tabs = Array.from(lab.querySelectorAll('[data-sp-tab]'));
  const panels = Array.from(lab.querySelectorAll('.sp-campaign-panel'));

  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    lab.dataset.channel = campaigns[index].id;
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
}

export function mountStaticPresentations() {
  if (document.documentElement.dataset.staticPresentations === 'ready') return;
  mountEditorial();
  mountCampaign();
  mountProducts();
  document.documentElement.dataset.staticPresentations = 'ready';
}
