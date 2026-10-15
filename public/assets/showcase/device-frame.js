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
