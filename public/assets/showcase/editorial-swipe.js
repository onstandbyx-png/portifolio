/** Swipe the existing three editorial tabs without blocking vertical scroll. */
export function mountEditorialSwipe(){
 const root=document.querySelector('#editorial[data-editorial-story]'),stage=root?.querySelector('[data-editorial-stage]'),panel=root?.querySelector('#editorial-story-panel');
 const tabs=[...(root?.querySelectorAll('[data-editorial-step]')||[])];
 if(!root||!stage||!panel||tabs.length!==3||root.dataset.swipeReady)return;
 root.dataset.swipeReady='true';
 const nav=document.createElement('nav');nav.className='es-swipe-nav';nav.setAttribute('aria-label','Navegação da história editorial');
 nav.innerHTML=[
 '<button type="button" data-es-prev aria-label="Etapa anterior da história"><span aria-hidden="true">←</span></button>',
 '<div class="es-swipe-center"><div class="es-swipe-dots" aria-hidden="true"><span data-es-dot></span><span data-es-dot></span><span data-es-dot></span></div><span data-es-count class="es-swipe-count"></span><span class="es-swipe-hint">Deslize sobre o celular para mudar de etapa <span aria-hidden="true">↔</span></span></div>',
 '<button type="button" data-es-next aria-label="Próxima etapa da história"><span aria-hidden="true">→</span></button>'
 ].join('');panel.after(nav);
 const prev=nav.querySelector('[data-es-prev]'),next=nav.querySelector('[data-es-next]'),dots=[...nav.querySelectorAll('[data-es-dot]')];
 const current=()=>Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-selected')==='true'));
 function update(){const i=current();prev.disabled=i===0;next.disabled=i===tabs.length-1;
  dots.forEach((dot,k)=>dot.classList.toggle('is-current',i===k));
  nav.querySelector('[data-es-count]').textContent=(i+1)+' / '+tabs.length+' · '+tabs[i].textContent.trim().replace(/^[0-9]+\s*/, '');
 }
 function select(step){
  const before=current(),to=Math.max(0,Math.min(tabs.length-1,step));
  if(before===to)return;tabs[to].click();update();
  const device=stage.querySelector('.es-device');
  if(device?.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('is-paused'))
   device.animate([{transform:'translateX('+(to>before?18:-18)+'px)',opacity:.83},{transform:'translateX(0)',opacity:1}],{duration:440,easing:'cubic-bezier(.22,.8,.22,1)'});
 }
 prev.addEventListener('click',()=>select(current()-1));next.addEventListener('click',()=>select(current()+1));
 tabs.forEach(tab=>tab.addEventListener('click',update));
 new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['data-editorial-active']});
 let gesture=null;
 stage.addEventListener('pointerdown',e=>{if(!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,scrollY:scrollY,time:performance.now()};},{passive:true});
 stage.addEventListener('pointerup',e=>{if(!gesture||e.pointerId!==gesture.id)return;
  const g=gesture;gesture=null;const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.35||Math.abs(scrollY-g.scrollY)>14||performance.now()-g.time>1100)return;
  select(current()+(dx<0?1:-1));
 },{passive:true});
 stage.addEventListener('pointercancel',()=>{gesture=null},{passive:true});
 update();
}
