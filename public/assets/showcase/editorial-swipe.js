/** Navigation for the three REAL hardware objects managed by editorial-story.
 * This module controls arrows, pagination and native horizontal swipes only.
 * It never paints a fake phone or swaps screenshot art in a different shell.
 */
import {sectionCopy} from '../content/portfolio-copy.js';
export function mountEditorialSwipe(){
  const root=document.querySelector('#editorial[data-editorial-story]');
  const stage=root?.querySelector('[data-editorial-stage]');
  const panel=root?.querySelector('#editorial-story-panel');
  const tabs=[...(root?.querySelectorAll('[data-editorial-step]')||[])];
  if(!stage||!panel||tabs.length!==3||root.dataset.swipeReady==='true')return;
  root.dataset.swipeReady='true';
  const steps=sectionCopy('editorial').steps;
  const nav=document.createElement('nav');
  nav.className='es-swipe-nav';
  nav.setAttribute('aria-label','Navegação da história editorial');
  nav.innerHTML=[
    '<button type="button" data-es-prev aria-label="Etapa anterior da história"><span aria-hidden="true">←</span></button>',
    '<div class="es-swipe-center"><div class="es-swipe-dots" aria-hidden="true">',
      '<span data-es-dot></span><span data-es-dot></span><span data-es-dot></span>',
    '</div><span data-es-count class="es-swipe-count"></span>',
      '<span class="es-swipe-hint"><span aria-hidden="true">←</span> Deslize para explorar <span aria-hidden="true">→</span></span>',
    '</div>',
    '<button type="button" data-es-next aria-label="Próxima etapa da história"><span aria-hidden="true">→</span></button>'
  ].join('');
  panel.after(nav);
  const prev=nav.querySelector('[data-es-prev]'),next=nav.querySelector('[data-es-next]');
  const dots=[...nav.querySelectorAll('[data-es-dot]')];
  const count=root.querySelector('[data-es-heading-count]');
  const index=()=>Math.max(0,tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true'));
  function update(){
    const i=index();
    prev.disabled=i===0;
    next.disabled=i===2;
    dots.forEach((dot,j)=>dot.classList.toggle('is-current',i===j));
    const label=String(i+1).padStart(2,'0')+' / 03';
    if(count)count.textContent=label;
    nav.querySelector('[data-es-count]').textContent=label+' · '+steps[i].label;
  }
  function choose(target){
    const from=index(),to=Math.max(0,Math.min(2,target));
    if(from===to)return;
    // Animation is centralized in editorial-story.render for every input,
    // preventing a double animation when a swipe/arrow changes the device.
    tabs[to].click();update();
  }
  prev.addEventListener('click',()=>choose(index()-1));
  next.addEventListener('click',()=>choose(index()+1));
  tabs.forEach(tab=>tab.addEventListener('click',update));
  new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['data-editorial-active']});
  let gesture=null,touchGesture=null,lastSwipeAt=-1000;
  function finish(dx,dy,yStart,timeStart){
    const now=performance.now();
    if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.35||
       Math.abs(scrollY-yStart)>14||now-timeStart>1100||now-lastSwipeAt<350)return false;
    lastSwipeAt=now;window.getSelection()?.removeAllRanges();
    choose(index()+(dx<0?1:-1));return true;
  }
  stage.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,scrollY:scrollY,time:performance.now()};
  },{passive:true});
  window.addEventListener('pointerup',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const g=gesture;gesture=null;
    finish(event.clientX-g.x,event.clientY-g.y,g.scrollY,g.time);
  },{passive:true});
  stage.addEventListener('pointercancel',()=>{gesture=null},{passive:true});
  stage.addEventListener('touchstart',event=>{
    if(event.touches.length!==1){touchGesture=null;return;}
    const t=event.touches[0];
    touchGesture={id:t.identifier,x:t.clientX,y:t.clientY,scrollY:scrollY,time:performance.now()};
  },{passive:true});
  window.addEventListener('touchmove',event=>{
    if(!touchGesture||event.touches.length!==1)return;
    const g=touchGesture,t=Array.from(event.touches).find(t=>t.identifier===g.id);
    if(!t)return;
    const dx=t.clientX-g.x,dy=t.clientY-g.y;
    if(Math.abs(dx)<88||Math.abs(dx)<Math.abs(dy)*1.7)return;
    if(finish(dx,dy,g.scrollY,g.time)){gesture=null;touchGesture=null;}
  },{passive:true});
  window.addEventListener('touchend',event=>{
    if(!touchGesture)return;
    const g=touchGesture,t=Array.from(event.changedTouches).find(t=>t.identifier===g.id);
    if(!t)return;
    touchGesture=null;
    finish(t.clientX-g.x,t.clientY-g.y,g.scrollY,g.time);
  },{passive:true});
  window.addEventListener('touchcancel',()=>{touchGesture=null},{passive:true});
  stage.addEventListener('dragstart',event=>event.preventDefault());
  stage.addEventListener('keydown',event=>{
    if(event.target!==stage||!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();choose(index()+(event.key==='ArrowRight'?1:-1));
  });
  update();
}
