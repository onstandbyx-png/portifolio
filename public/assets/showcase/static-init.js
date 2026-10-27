/** Folhas e módulos de cada seção, carregados sob demanda. No <head> ficam só as folhas da primeira tela;
 * cada seção abaixo do hero ganha as suas quando chega a 1200 px da tela (IntersectionObserver), sem onload
 * inline (CSP). A seção só é montada, e só fica visível ([data-lazy-css]), depois que as folhas dela terminam
 * de carregar. Os links entram sempre na ordem de ORDER, a mesma de antes no <head>, para não mudar a cascata.
 * Os links entram no fim do <body>, para o <head> guardar só as folhas da primeira tela.
 * Links internos #sistemas/<chave> e #laboratorio/<canal> carregam a seção na hora e rolam até ela; o módulo
 * da seção lê o hash ao montar. #mural importa /assets/mural/mural.js (mountMural ou default). */
const S = '/assets/showcase/';
const ORDER = ['/assets/sections/sections.css', S + 'static-presentations.css', S + 'narrative.css', S + 'interaction-upgrades.css', S + 'page-peel.css', S + 'experience-demos.css',
  S + 'channel-mocks.css', S + 'campaign-sites.css', S + 'lab-telas.css', S + 'campaign-search.css', S + 'frame-motion.css', S + 'automation-mocks.css',
  S + 'automation-trace.css', S + 'vitrine-lab.css', '/assets/positioning.css?v=visual-r3', '/assets/mural/mural.css'];
const LAB = ORDER.slice(0, 12).concat(ORDER.slice(13, 15));
const GROUPS = {
  laboratorio: { css: LAB, mount: async () => {
    const [{ mountStaticPresentations }, { mountCampaignFlip }] = await Promise.all([import('./static-presentations.js'), import('./campaign-flip.js')]);
    mountStaticPresentations(); mountCampaignFlip();
  } },
  editorial: { css: LAB, mount: async () => (await import('./vitrine-lab.js')).mountVitrine() },
  sistemas: { css: [...LAB, S + 'automation-trace.css'], mount: async () => (await import('./automation-trace.js')).mountTrace() },
  categorias: { css: [S + 'vitrine-lab.css', '/assets/positioning.css?v=visual-r3'] },
  contato: { css: [S + 'vitrine-lab.css', '/assets/positioning.css?v=visual-r3'] },
  mural: { css: ['/assets/mural/mural.css'], mount: async () => { const m = await import('/assets/mural/mural.js'); await (m.mountMural || m.default)?.(); } },
};
const links = new Map();
function sheet(href) {
  if (links.has(href)) return links.get(href);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  const done = new Promise(resolve => { link.addEventListener('load', resolve, { once: true }); link.addEventListener('error', resolve, { once: true }); });
  const at = ORDER.indexOf(href), next = [...links.keys()].map(h => ORDER.indexOf(h)).filter(i => i > at).sort((a, b) => a - b)[0];
  const before = next === undefined ? null : document.body.querySelector(`link[href="${ORDER[next]}"]`);
  document.body.insertBefore(link, before);
  links.set(href, done);
  return done;
}
const loading = new Map();
function load(id) {
  if (loading.has(id)) return loading.get(id);
  const section = document.getElementById(id), group = GROUPS[id];
  const task = Promise.all(group.css.map(sheet))
    .then(() => group.mount?.())
    .catch(error => console.error(`Portfolio ${id}:`, error))
    .finally(() => { if (section) section.dataset.cssReady = 'true'; });
  loading.set(id, task);
  return task;
}
function start() {
  const sections = Object.keys(GROUPS).map(id => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window)) { sections.forEach(s => load(s.id)); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    load(entry.target.id);
  }), { rootMargin: '1200px 0px' });
  sections.forEach(s => observer.observe(s));
  const deep = () => {
    const match = /^#(sistemas|laboratorio|editorial)\//.exec(location.hash);
    if (!match) return;
    load(match[1]).then(() => {
      const section = document.getElementById(match[1]), rect = section.getBoundingClientRect();
      if (rect.top > innerHeight * .5 || rect.bottom < 0) section.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  };
  addEventListener('hashchange', () => { deep(); pin(); });
  deep();
  pin();
  // Um clique numa âncora interna também segura o alvo enquanto as seções do caminho carregam.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href^="#"]');
    if (link && !event.defaultPrevented) setTimeout(() => pin(link.getAttribute('href')), 0);
  });
}
/* As seções sob demanda crescem quando montam. Enquanto isso, o alvo de um link interno (no carregamento,
 * num hashchange ou num clique) fica no lugar por até 3 s, até a pessoa rolar ou tocar na página. */
let unpin = null;
function pin(hash = location.hash) {
  unpin?.();
  const id = decodeURIComponent(String(hash).slice(1)), target = id && !id.includes('/') && document.getElementById(id);
  if (!target || !('ResizeObserver' in window)) return;
  const main = document.querySelector('main') || document.body;
  let last = main.offsetHeight;
  const ro = new ResizeObserver(() => { if (main.offsetHeight !== last) { last = main.offsetHeight; target.scrollIntoView({ block: 'start' }); } });
  const timer = setTimeout(() => unpin?.(), 3000);
  const kinds = ['wheel', 'touchstart', 'keydown'];
  unpin = () => { ro.disconnect(); clearTimeout(timer); kinds.forEach(k => removeEventListener(k, unpin)); unpin = null; };
  kinds.forEach(k => addEventListener(k, unpin, { passive: true }));
  ro.observe(main);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
