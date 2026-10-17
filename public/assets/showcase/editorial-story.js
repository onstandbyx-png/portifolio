/** One editorial story, one device and one set of controls. */
import { sectionCopy } from '../content/portfolio-copy.js';
import { createDeviceFrame } from './device-frame.js';
import { createMotion } from '../sections/motion.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines = value => escape(value).split('\n').map(line => `<span class="es-mask"><span>${line}</span></span>`).join('');
const icons = {
  camera: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 2-3h4l2 3"/><circle cx="12" cy="13" r="4"/>',
  map: '<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2V5Zm6-2v15m6-12v15"/>',
  message: '<path d="M20 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3v4l5-4h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M7 8h10M7 12h7"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;

export function mountEditorialStory() {
  const root = document.querySelector('#editorial');
  const stage = root?.querySelector('[data-editorial-stage]');
  if (!stage || root.dataset.editorialReady === 'true') return stage ? root : null;
  const copy = sectionCopy('editorial');
  const motion = createMotion();
  const tabs = [...root.querySelectorAll('[data-editorial-step]')];
  const panel = root.querySelector('#editorial-story-panel');
  const context = root.querySelector('[data-editorial-context]');
  const image = '/assets/portfolio/recovered-fatos/post-desconhecidos-600.webp';
  const frame = createDeviceFrame({tone:'light', scheme:'dark', time:'10:09', label:'Tecnologia no cotidiano: uma história em três momentos'});
  frame.root.classList.add('es-device');
  // Only hide duplicate semantics while the adjacent reading text is exposed.
  // With the text archived, the retained artwork remains readable to assistive technology.
  if (!context.hidden) {
    frame.root.setAttribute('aria-hidden', 'true');
    frame.root.removeAttribute('role');
    frame.root.removeAttribute('aria-label');
  }
  frame.screen.innerHTML = `<div class="es-screen">${copy.steps.map((step, i) => `<article class="es-piece es-piece-${step.id}" data-es-piece="${i}"${i ? ' hidden' : ''}>
    <img class="es-piece-art" src="${image}" alt="" loading="eager" decoding="async" width="600" height="750">
    <div class="es-piece-shade"></div>
    <div class="es-piece-meta"><img src="/assets/portfolio/recovered-fatos/avatar_desconhecidos.webp" width="38" height="38" alt=""><span>FATOS<br><small>TECNOLOGIA NO COTIDIANO</small></span></div>
    <div class="es-piece-copy"><span class="es-piece-kicker">${String(i + 1).padStart(2, '0')} / ${escape(step.label)}</span><h3>${lines(step.pieceTitle)}</h3><p>${escape(step.pieceCopy)}</p></div>
    ${i === 1 ? `<div class="es-functions"><div>${icon('camera')}<span>Câmera</span></div><div>${icon('map')}<span>Mapa</span></div><div>${icon('message')}<span>Mensagens</span></div></div>` : ''}
    <div class="es-piece-footer"><span>ESTUDO EDITORIAL</span><span>${i + 1} / 3</span></div>
  </article>`).join('')}</div>`;
  stage.replaceChildren(frame.root);
  const pieces = [...frame.screen.querySelectorAll('[data-es-piece]')];
  let active = -1;
  let animations = [];
  const cancelAnimations = () => { animations.forEach(animation => animation?.cancel()); animations = []; };
  function render(index, focus = false) {
    if (index === active) return;
    cancelAnimations();
    active = index;
    const step = copy.steps[index];
    root.dataset.editorialActive = step.id;
    panel.setAttribute('aria-labelledby', tabs[index].id);
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      pieces[i].hidden = i !== index;
    });
    context.querySelector('[data-es-label]').textContent = `0${index + 1} / ${step.label}`;
    context.querySelector('[data-es-title]').textContent = step.title;
    context.querySelector('[data-es-body]').textContent = step.body;
    context.querySelector('[data-es-quote]').textContent = step.pieceTitle.replace(/\n/g, ' ');
    context.querySelector('[data-es-copy]').textContent = step.pieceCopy;
    root.querySelector('[data-es-status]').textContent = `${step.label} · ${index + 1} de ${copy.steps.length}`;
    pieces[index].querySelectorAll('.es-mask > span').forEach((line, i) => {
      animations.push(motion.animate(line, [{transform:'translateY(108%)'}, {transform:'translateY(0)'}], {duration:560, delay:i * 65}));
    });
    pieces[index].querySelectorAll('.es-functions > div').forEach((item, i) => {
      animations.push(motion.animate(item, [{transform:'translateX(22px)',opacity:0},{transform:'translateX(0)',opacity:1}], {duration:420,delay:80 + i * 70}));
    });
    animations.push(motion.animate(context, [{transform:'translateY(12px)',opacity:.45},{transform:'translateY(0)',opacity:1}], {duration:420}));
    if (focus) tabs[index].focus({preventScroll:true});
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => render(i));
    tab.addEventListener('keydown', event => {
      const index = {ArrowRight:(i + 1) % tabs.length, ArrowLeft:(i + tabs.length - 1) % tabs.length, Home:0, End:tabs.length - 1}[event.key];
      if (index === undefined) return;
      event.preventDefault();
      render(index, true);
    });
  });
  const sizeFrame = () => {
    // Keep the central image comfortably readable while revealing meaningful
    // slices of the two neighboring editorial phones on narrow screens.
    const width = matchMedia('(max-width:700px)').matches
      ? Math.min(340, Math.max(218, Math.min(stage.clientWidth - 20, innerWidth * .64)))
      : Math.min(340, Math.max(220, stage.clientWidth - 24));
    frame.root.style.setProperty('--df-pt', `${width / 435}px`);
  };
  new ResizeObserver(sizeFrame).observe(stage);
  sizeFrame();
  render(0);
  root.dataset.editorialReady = 'true';
  return root;
}
