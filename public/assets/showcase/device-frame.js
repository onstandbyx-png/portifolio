/**
 * Vanilla adaptation of the operator-owned smiile DeviceFrame.
 * Geometry: 402x874 screen, 435x907 body, 16.5pt concentric bezel,
 * circular 17pt camera. CSS comes from the reference DeviceFrame.css.
 */
const signal = '<svg viewBox="0 0 18 12" class="sg-signal" aria-hidden="true"><rect x="0" y="7.5" width="3" height="4.5" rx="1" fill="currentColor"/><rect x="5" y="5.2" width="3" height="6.8" rx="1" fill="currentColor"/><rect x="10" y="2.9" width="3" height="9.1" rx="1" fill="currentColor"/><rect x="15" y=".6" width="3" height="11.4" rx="1" fill="currentColor"/></svg>';
const wifi = '<svg viewBox="0 0 16 12" class="sg-wifi" aria-hidden="true"><path d="M5.6 8.8 A3.4 3.4 0 0 1 10.4 8.8 L8 11.2Z" fill="currentColor"/><path d="M3.33 6.53A6.6 6.6 0 0 1 12.67 6.53 M1.07 4.27A9.8 9.8 0 0 1 14.93 4.27" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
const battery='<svg viewBox="0 0 26 12.5" class="sg-battery" aria-hidden="true"><rect x=".5" y=".5" width="22.5" height="11.5" rx="3.6" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="2" y="2" width="16" height="8.5" rx="2.2" fill="currentColor"/><rect x="23.8" y="4" width="1.7" height="4.5" rx=".8" fill="currentColor" fill-opacity=".4"/></svg>';
export const DEVICE = Object.freeze({screen:[402,874],realistic:[435,907],bezel:16.5,camera:17,safeArea:[62,34]});
export function createDeviceFrame({tone='light',scheme='dark',time='10:47',label='Demonstração interativa',content}={}){
  const root=document.createElement('div');
  root.className='df df-realistic df-tone-'+tone+' pf-reference-device';
  root.setAttribute('role','group');
  root.setAttribute('aria-label',label);
  root.dataset.skin='realistic';
  root.dataset.tone=tone;
  root.innerHTML='<div class="df-body"><i class="df-metal" aria-hidden="true"></i><i class="df-line" aria-hidden="true"></i><i class="df-bevel" aria-hidden="true"></i><i class="df-glass" aria-hidden="true"></i><div class="df-screen" data-scheme="'+scheme+'"><div class="df-content"></div><div class="df-status" aria-hidden="true"><b class="df-time">'+time+'</b><span class="df-glyphs">'+signal+wifi+battery+'</span></div><span class="df-camera" aria-hidden="true"></span><span class="df-home" data-tone="'+(scheme==='dark'?'light':'dark')+'" aria-hidden="true"></span></div><span class="df-edge" aria-hidden="true"></span></div>';
  const screen=root.querySelector('.df-content');
  if(typeof content==='string')screen.innerHTML=content;
  else if(content instanceof Node)screen.append(content);
  return {root,screen};
}

let explorerSequence = 0;
/** Enlarge the live demo, not a cloned screenshot. State and event handlers stay
 * on the same nodes; native dialog owns focus, Escape and background inertness. */
export function installDemoExplorer({ source, trigger, title, onChange = () => {} }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'df-explorer';
  const titleId = `df-explorer-title-${++explorerSequence}`;
  dialog.setAttribute('aria-labelledby', titleId);
  dialog.innerHTML = `<header class="df-explorer-header"><div><span>EXPLORAR O PROJETO</span><h2 id="${titleId}"></h2></div><button type="button" class="df-explorer-close" aria-label="Fechar exploração e voltar ao portfólio">Fechar <span aria-hidden="true">×</span></button></header><div class="df-explorer-content"></div>`;
  dialog.querySelector('h2').textContent = title;
  const content = dialog.querySelector('.df-explorer-content');
  const close = dialog.querySelector('.df-explorer-close');
  let placeholder, scrollPosition = 0, overflow = '', padding = '';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.addEventListener('click', () => {
    if (dialog.open) return;
    scrollPosition = window.scrollY;
    placeholder = document.createElement('div');
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.cssText = `height:${source.getBoundingClientRect().height}px;min-width:0;flex:1`;
    source.replaceWith(placeholder);
    content.append(source);
    source.classList.add('is-exploring');
    document.body.append(dialog);
    overflow = document.body.style.overflow;
    padding = document.body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    onChange(true);
    window.dispatchEvent(new Event('resize'));
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    onChange(false);
    source.classList.remove('is-exploring');
    placeholder.replaceWith(source);
    document.body.style.overflow = overflow;
    document.body.style.paddingRight = padding;
    dialog.remove();
    window.dispatchEvent(new Event('resize'));
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });
    trigger.focus({ preventScroll: true });
  });
  return { close: () => { if (dialog.open) dialog.close(); } };
}
