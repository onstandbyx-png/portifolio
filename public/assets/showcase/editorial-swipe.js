/** One synchronized editorial timeline: real device, side previews and native swipe. */
import {sectionCopy} from '../content/portfolio-copy.js';

export function mountEditorialSwipe(){
  const root=document.querySelector('#editorial[data-editorial-story]');
  const stage=root?.querySelector('[data-editorial-stage]');
  const panel=root?.querySelector('#editorial-story-panel');
  const tabs=[...(root?.querySelectorAll('[data-editorial-step]')||[])];
  if(!root||!stage||!panel||tabs.length!==3||root.dataset.swipeReady)return;
  root.dataset.swipeReady='true';
  const steps=sectionCopy('editorial').steps;
  const previewImages=[
    '/assets/portfolio/recovered-fatos/post-desconhecidos-600.webp',
    '/assets/portfolio/recovered-smiile/landscape.webp',
    '/assets/portfolio/smiile-architecture-coast.webp'
  ];
  const safeText=value=>String(value??'').replace(/\s+/g,' ').trim();
  const nav=document.createElement('nav');
  nav.className='es-swipe-nav';
  nav.setAttribute('aria-label','Navegação da história editorial');
  nav.innerHTML=[
    '<button type="button" data-es-prev aria-label="Etapa anterior da história"><span aria-hidden="true">←</span></button>',
    '<div class="es-swipe-center">',
      '<div class="es-swipe-dots" aria-hidden="true"><span data-es-dot></span><span data-es-dot></span><span data-es-dot></span></div>',
      '<span data-es-count class="es-swipe-count"></span>',
      '<span class="es-swipe-hint"><span aria-hidden="true">←</span> Deslize para explorar <span aria-hidden="true">→</span></span>',
    '</div>',
    '<button type="button" data-es-next aria-label="Próxima etapa da história"><span aria-hidden="true">→</span></button>'
  ].join('');
  panel.after(nav);
  const prev=nav.querySelector('[data-es-prev]');
  const next=nav.querySelector('[data-es-next]');
  const dots=[...nav.querySelectorAll('[data-es-dot]')];
  const headingCount=root.querySelector('[data-es-heading-count]');
  const current=()=>Math.max(0,tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true'));
  const previews=['left','right'].map(side=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='es-peek es-peek--'+side;
    button.dataset.esPeek=side;
    button.innerHTML=[
      '<span class="es-peek-bezel" aria-hidden="true"><span class="es-peek-screen">',
        '<span class="es-peek-clock">10:09 <span>▮▮  ▰</span></span>',
        '<span class="es-peek-step"></span>',
        '<strong class="es-peek-title"></strong>',
        '<span class="es-peek-photo"><img loading="lazy" decoding="async" alt=""></span>',
        '<span class="es-peek-description"></span>',
      '</span></span>'
    ].join('');
    button.addEventListener('click',()=>select(Number(button.dataset.stepIndex)));
    stage.append(button);
    return button;
  });
  let renderedIndex=-1;
  function update(){
    const i=current();
    prev.disabled=i===0;
    next.disabled=i===tabs.length-1;
    dots.forEach((dot,k)=>dot.classList.toggle('is-current',k===i));
    const count=String(i+1).padStart(2,'0')+' / '+String(tabs.length).padStart(2,'0');
    if(headingCount)headingCount.textContent=count;
    nav.querySelector('[data-es-count]').textContent=count+' · '+steps[i].label;
    if(renderedIndex===i)return;
    renderedIndex=i;
    const other=steps.map((_,k)=>k).filter(k=>k!==i);
    previews.forEach((preview,side)=>{
      const stepIndex=other[side],step=steps[stepIndex];
      preview.dataset.stepIndex=String(stepIndex);
      preview.setAttribute('aria-label','Abrir '+step.label+' na história');
      preview.querySelector('.es-peek-step').textContent=String(stepIndex+1).padStart(2,'0')+' / '+step.label.toLocaleUpperCase('pt-BR');
      preview.querySelector('.es-peek-title').textContent=safeText(step.pieceTitle);
      preview.querySelector('.es-peek-description').textContent=safeText(step.pieceCopy);
      const img=preview.querySelector('img');
      if(img.getAttribute('src')!==previewImages[stepIndex])img.src=previewImages[stepIndex];
      if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&!document.body.classList.contains('is-paused')){
        preview.animate([{opacity:.45},{opacity:1}],{duration:420,easing:'ease-out'});
      }
    });
  }
  function select(target){
    const before=current();
    const to=Math.max(0,Math.min(tabs.length-1,target));
    if(to===before)return;
    tabs[to].click();
    update();
    const phone=stage.querySelector('.es-device');
    if(phone?.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('is-paused')){
      phone.animate([
        {transform:'translateX('+(to>before?22:-22)+'px) scale(.985)',opacity:.82},
        {transform:'translateX(0) scale(1)',opacity:1}
      ],{duration:480,easing:'cubic-bezier(.22,.8,.22,1)'});
    }
  }
  prev.addEventListener('click',()=>select(current()-1));
  next.addEventListener('click',()=>select(current()+1));
  tabs.forEach(tab=>tab.addEventListener('click',update));
  new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['data-editorial-active']});
  let gesture=null;
  stage.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,scrollY:window.scrollY,time:performance.now()};
  },{passive:true});
  stage.addEventListener('pointerup',event=>{
    if(!gesture||event.pointerId!==gesture.id)return;
    const g=gesture;gesture=null;
    const dx=event.clientX-g.x,dy=event.clientY-g.y;
    if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.35||
       Math.abs(window.scrollY-g.scrollY)>14||performance.now()-g.time>1100)return;
    window.getSelection()?.removeAllRanges();
    select(current()+(dx<0?1:-1));
  },{passive:true});
  stage.addEventListener('pointercancel',()=>{gesture=null},{passive:true});
  stage.addEventListener('keydown',event=>{
    if(event.target!==stage||!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();
    select(current()+(event.key==='ArrowRight'?1:-1));
  });
  update();
}
