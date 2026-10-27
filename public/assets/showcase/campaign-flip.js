/** A pullable paper corner reveals, behind each artwork, the ad in its channel (experience-player.js).
 * Native page scrolling remains untouched outside the 64px folded-corner grip. Opening moves the
 * focus to the first format of the player; "Ver a peça" puts the paper back.
 */
import {bindCardSurface} from './card-surface.js';
import {mountCampaignExperience} from './experience-player.js';

export function mountCampaignFlip() {
  const lab=document.querySelector('#laboratorio .sp-campaign');
  const layout=lab?.querySelector('.sp-campaign-layout');
  const art=layout?.querySelector('.sp-campaign-art');
  if (!lab||!layout||!art||layout.dataset.flipReady)return;
  layout.dataset.flipReady='true';
  layout.classList.add('sp-campaign-flip-layout','sp-peel-layout');
  const card=document.createElement('div');
  card.className='sp-campaign-card sp-peel-card';
  card.dataset.side='front';
  card.dataset.peelState='closed';
  card.dataset.peelProgress='0.05';
  card.innerHTML=[
    '<div class="sp-peel-stack">',
      '<section class="sp-peel-underlay" data-sp-card-back aria-hidden="true" inert>',
        '<button type="button" class="sp-peel-return" data-sp-card-turn="back"><span aria-hidden="true">↗</span> Ver a peça</button>',
      '</section>',
      '<div class="sp-peel-sheet" data-sp-card-front>',
        '<div class="sp-campaign-image-slot"></div>',
        '<p class="sp-peel-cue" aria-hidden="true"><span class="sp-peel-cue-arrow">↙</span><span>Puxe a pontinha para descobrir o que há por trás</span><span>01 / 02</span></p>',
      '</div>',
      '<svg class="sp-peel-fold" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">',
        '<defs><linearGradient id="sp-peel-paper-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffef8"/><stop offset=".36" stop-color="#f3efe5"/><stop offset=".72" stop-color="#d4dbce"/><stop offset="1" stop-color="#aebdad"/></linearGradient></defs>',
        '<path data-sp-peel-flap fill="url(#sp-peel-paper-gradient)"></path>',
        '<path data-sp-peel-crease fill="none" stroke="#50624d" stroke-opacity=".30" stroke-width="1.7"></path>',
      '</svg>',
      '<button class="sp-peel-grip" type="button" data-sp-card-turn="front" data-peel-grip aria-label="Segure e puxe a ponta superior direita para revelar o conteúdo atrás" aria-describedby="sp-peel-instructions"><span class="sp-peel-grip-symbol" aria-hidden="true">↙</span></button>',
    '</div>',
    '<span class="sr-only" id="sp-peel-instructions">Arraste a ponta para baixo e para a esquerda; toque na imagem para revelar diretamente. Use o botão para recolocar a peça.</span>'
  ].join('');
  layout.prepend(card);
  const sheet=card.querySelector('.sp-peel-sheet');
  const underlay=card.querySelector('.sp-peel-underlay');
  const grip=card.querySelector('[data-peel-grip]');
  const backButton=card.querySelector('[data-sp-card-turn="back"]');
  const fold=card.querySelector('.sp-peel-fold');
  const flap=card.querySelector('[data-sp-peel-flap]');
  const crease=card.querySelector('[data-sp-peel-crease]');
  card.querySelector('.sp-campaign-image-slot').append(art);
  const campaignExperience=mountCampaignExperience(lab,underlay);
  const BASE=.05,clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
  const prefersReduced=matchMedia('(prefers-reduced-motion:reduce)');
  let progress=BASE,animation=0,gesture=null,ignoreSyntheticClick=false;
  const paused=()=>prefersReduced.matches||document.body.classList.contains('is-paused');
  // The first format of the player (in the panel from 900px), else the phone, else "Ver a peça".
  const firstFocus=()=>lab.querySelector('[data-cx-placements] .cx-placement')||underlay.querySelector('[data-cx-stage]')||backButton;

  // A sampled curved crease replaces the oversize triangular reveal.
  // The flap has its own highlight/shadow and stays tied to the pointer.
  function paint(next) {
    progress=clamp(next,0,1);
    const w=sheet.offsetWidth,h=sheet.offsetHeight;
    if(!w||!h)return;
    const early=progress<=.5,t=early?progress*2:(progress-.5)*2;
    const a=early?{x:w*(1-t),y:0}:{x:0,y:h*t};
    const b=early?{x:w,y:h*t}:{x:w*(1-t),y:h};
    const dx=b.x-a.x,dy=b.y-a.y;
    const length=Math.max(1,Math.hypot(dx,dy));
    const nx=-dy/length,ny=dx/length;
    const bend=Math.min(36,w*.062)*Math.sin(Math.PI*Math.min(1,progress*1.3));
    const edge=[];
    for(let i=0;i<=20;i++){
      const u=i/20,p=Math.sin(Math.PI*u)*bend;
      edge.push({x:a.x+dx*u+nx*p,y:a.y+dy*u+ny*p});
    }
    const px=v=>v.x.toFixed(2)+'px '+v.y.toFixed(2)+'px';
    const poly=early?[{x:0,y:0},...edge,{x:w,y:h},{x:0,y:h}]:[...edge,{x:0,y:h}];
    sheet.style.clipPath='polygon('+poly.map(px).join(',')+')';
    sheet.style.webkitClipPath=sheet.style.clipPath;
    fold.setAttribute('viewBox','0 0 '+w+' '+h);
    // The open back grows to its content (no nested scroll); the fold keeps the sheet's size.
    fold.style.height=h+'px';
    card.style.setProperty('--peel-sheet-h',h+'px');
    const band=Math.min(31,Math.max(12,w*.045))*(1-.30*progress);
    const outside=edge.map(v=>({x:clamp(v.x-nx*band,0,w),y:clamp(v.y-ny*band,0,h)}));
    const path=points=>points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');
    flap.setAttribute('d',path(edge)+' '+path(outside.reverse()).replace(/^M/,'L')+' Z');
    crease.setAttribute('d',path(edge));
    fold.style.opacity=String(clamp(1-progress*1.18,0,1));
    grip.style.opacity=String(clamp(1-progress*3,0,1));
    card.dataset.peelProgress=progress.toFixed(2);
    card.style.setProperty('--peel-progress',progress.toFixed(3));
    card.style.setProperty('--peel-bend',(bend/w).toFixed(4));
  }
  function stopAnimation(){if(animation){cancelAnimationFrame(animation);animation=0;}}
  function semantics(open) {
    // Focus on the face being hidden follows to the other face whatever opened it
    // (keyboard, mouse, tap or a screen-reader double-tap), so inert never drops it to <body>.
    const active=document.activeElement;
    const handOff=open?(grip.contains(active)||sheet.contains(active))&&firstFocus():underlay.contains(active)&&grip;
    card.dataset.side=open?'back':'front';
    underlay.inert=!open;
    underlay.setAttribute('aria-hidden',String(!open));
    sheet.inert=open;
    sheet.setAttribute('aria-hidden',String(open));
    grip.setAttribute('aria-expanded',String(open));
    // An open corner is invisible: it must not keep a focus stop or a hit area.
    grip.inert=open;
    if(handOff)handOff.focus({preventScroll:true});
    card.dataset.peelState=open?'open':'closed';
    if(!open)campaignExperience?.stop();
  }
  function animateTo(target,focus=false){
    stopAnimation();
    target=clamp(target);
    const goingOpen=target>.5;
    semantics(goingOpen);
    if(paused()){
      paint(target);
      if(focus)(goingOpen?firstFocus():grip).focus({preventScroll:true});
      return;
    }
    const start=performance.now(),from=progress;
    const duration=goingOpen?680:550;
    card.dataset.peelState=goingOpen?'opening':'closing';
    card.style.setProperty('--peel-illuminance',String(target));
    function tick(now){
      const t=clamp((now-start)/duration);
      const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      paint(from+(target-from)*eased);
      if(t<1)animation=requestAnimationFrame(tick);
      else {animation=0;card.dataset.peelState=goingOpen?'open':'closed';}
    }
    animation=requestAnimationFrame(tick);
    if(focus)(goingOpen?firstFocus():grip).focus({preventScroll:true});
  }
  // The entire artwork can still be tapped, but the distinctive interaction
  // is pulling the folded corner with real-time physical feedback.
  grip.addEventListener('click',event=>{
    if(ignoreSyntheticClick&&event.detail!==0){
      ignoreSyntheticClick=false;
      event.preventDefault();
      return;
    }
    animateTo(card.dataset.side==='front'?1:BASE,event.detail===0);
  });
  backButton.addEventListener('click',event=>animateTo(BASE,event.detail===0));
  bindCardSurface(card,()=>card.dataset.side==='front'?grip:backButton);

  grip.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
    // A NEW pointerdown is a fresh tap, never the synthetic click generated
    // after the preceding drag. Prevents a stale suppression on Android.
    ignoreSyntheticClick=false;
    stopAnimation();
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,initial:progress,maxDistance:0,scrollY:scrollY};
    card.dataset.peelState='dragging';
    try{grip.setPointerCapture(event.pointerId);}catch{}
  });
  grip.addEventListener('pointermove',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    const left=Math.max(0,gesture.x-event.clientX);
    const down=Math.max(0,event.clientY-gesture.y);
    const distance=left*.95+down*.72;
    gesture.maxDistance=Math.max(gesture.maxDistance,distance);
    const width=Math.max(1,sheet.clientWidth),height=Math.max(1,sheet.clientHeight);
    paint(gesture.initial+distance/(width*.75+height*.55));
  });
  function finish(event,cancel=false){
    if(!gesture||gesture.id!==event.pointerId)return;
    const dragged=gesture.maxDistance>9;
    if(dragged){
      ignoreSyntheticClick=true;
      animateTo(!cancel&&(progress>.26||gesture.maxDistance>140)?1:BASE);
    }else if(cancel){
      animateTo(BASE);
    }else{
      card.dataset.peelState='closed';
    }
    gesture=null;
  }
  grip.addEventListener('pointerup',event=>finish(event));
  grip.addEventListener('pointercancel',event=>finish(event,true));
  grip.addEventListener('lostpointercapture',event=>{if(gesture&&gesture.id===event.pointerId)finish(event,true);});
  grip.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowDown'){
      event.preventDefault();animateTo(1,true);
    }
  });
  const observer=new ResizeObserver(()=>paint(progress));
  observer.observe(sheet);
  paint(BASE);
  // Channel switching replaces what is behind the same paper sheet: a closed
  // sheet keeps its corner ready for the new channel, and an open one stays
  // open while the player swaps the placement, so channels can be compared.
  // If focus was inside the replaced placement, it returns to the open back.
  new MutationObserver(()=>{
    if(card.dataset.side==='back'&&!underlay.contains(document.activeElement)&&card.contains(document.activeElement))backButton.focus({preventScroll:true});
    if(card.dataset.side==='front')paint(progress);
  }).observe(lab,{attributes:true,attributeFilter:['data-channel']});
  const motionSwitch=document.querySelector('#motion-toggle');
  if(motionSwitch)new MutationObserver(()=>{
    if(paused()&&animation){
      const wasOpening=card.dataset.side==='back';
      animateTo(wasOpening?1:BASE);
    }
  }).observe(motionSwitch,{attributes:true,attributeFilter:['aria-pressed']});
}

export function mountGalleryFlipHints(){
 document.querySelectorAll('#trabalhos .rg-gallery [data-work-card]').forEach(card=>{
  const caption=card.querySelector('.tile-caption > div');
  if(!caption)return;
  if(card.dataset.workCard==='smiile'){
    caption.querySelector('.rg-flip-hint')?.remove();
    const stage=card.querySelector('.rg-card-stage');
    if(!stage||stage.querySelector('.rg-card-interaction-hint'))return;
    const hint=document.createElement('span');
    hint.className='rg-card-interaction-hint';
    hint.setAttribute('aria-hidden','true');
    const update=()=>{hint.textContent=stage.dataset.face==='back'?'Toque para voltar':'Toque em qualquer área para ver o verso';};
    stage.append(hint);
    new MutationObserver(update).observe(stage,{attributes:true,attributeFilter:['data-face']});
    update();
  }else if(!caption.querySelector('.rg-flip-hint')){
    const hint=document.createElement('small');
    hint.className='rg-flip-hint';
    hint.textContent='Toque no cartão para ver o verso';
    caption.append(hint);
  }
 });
}
