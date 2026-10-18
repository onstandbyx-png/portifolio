/** A pullable paper corner reveals the actual campaign brief behind each artwork.
 * Native page scrolling remains untouched outside the 64px folded-corner grip.
 */
import {bindCardSurface} from './card-surface.js';
import {mountCampaignExperience} from './experience-player.js';

export function mountCampaignFlip() {
  const lab=document.querySelector('#laboratorio .sp-campaign');
  const layout=lab?.querySelector('.sp-campaign-layout');
  const art=layout?.querySelector('.sp-campaign-art');
  const note=layout?.querySelector('[data-campaign-note]');
  if (!lab||!layout||!art||!note||layout.dataset.flipReady)return;
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
        '<span class="sp-peel-underlay-kicker" aria-hidden="true">O QUE ESTÁ POR TRÁS DA PEÇA</span>',
        '<div class="sp-campaign-note-slot"></div>',
        '<button type="button" class="sp-peel-return" data-sp-card-turn="back" aria-label="Recolocar a arte na frente"><span aria-hidden="true">↗</span> Recolocar a peça</button>',
      '</section>',
      '<div class="sp-peel-sheet" data-sp-card-front>',
        '<div class="sp-campaign-image-slot"></div>',
        '<p class="sp-peel-cue" aria-hidden="true"><span class="sp-peel-cue-arrow">↙</span><span>Puxe a pontinha para descobrir o que há por trás</span><span>01 / 02</span></p>',
      '</div>',
      '<svg class="sp-peel-fold" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">',
        '<defs><linearGradient id="sp-peel-paper-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffef8"/><stop offset=".36" stop-color="#f3efe5"/><stop offset=".72" stop-color="#d4dbce"/><stop offset="1" stop-color="#aebdad"/></linearGradient></defs>',
        '<polygon data-sp-peel-flap fill="url(#sp-peel-paper-gradient)"></polygon>',
        '<path data-sp-peel-crease fill="none" stroke="#50624d" stroke-opacity=".30" stroke-width="1.7"></path>',
      '</svg>',
      '<button class="sp-peel-grip" type="button" data-sp-card-turn="front" data-peel-grip aria-label="Segure e puxe a ponta superior direita para revelar o conteúdo atrás" aria-describedby="sp-peel-instructions"><span class="sp-peel-grip-symbol" aria-hidden="true">↙</span></button>',
    '</div>',
    '<span class="sr-only" id="sp-peel-instructions">Arraste a ponta para baixo e para a esquerda; toque na imagem para revelar diretamente. Use o botão para recolocar a peça.</span>'
  ].join('');
  layout.append(card);
  const sheet=card.querySelector('.sp-peel-sheet');
  const underlay=card.querySelector('.sp-peel-underlay');
  const grip=card.querySelector('[data-peel-grip]');
  const backButton=card.querySelector('[data-sp-card-turn="back"]');
  const fold=card.querySelector('.sp-peel-fold');
  const flap=card.querySelector('[data-sp-peel-flap]');
  const crease=card.querySelector('[data-sp-peel-crease]');
  card.querySelector('.sp-campaign-image-slot').append(art);
  card.querySelector('.sp-campaign-note-slot').append(note);
  const campaignExperience=mountCampaignExperience(lab,underlay);
  const BASE=.05,clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
  const prefersReduced=matchMedia('(prefers-reduced-motion:reduce)');
  let progress=BASE,animation=0,gesture=null,ignoreSyntheticClick=false;
  const paused=()=>prefersReduced.matches||document.body.classList.contains('is-paused');

  // Compute the true visible paper polygon, rather than turning the card.
  // First half: top-right triangular peel. Second half: the remaining lower-left
  // triangle shrinks until the whole creative brief is exposed.
  function paint(next) {
    progress=clamp(next,0,1);
    const w=sheet.offsetWidth,h=sheet.offsetHeight;
    if(!w||!h)return;
    let a,b,poly;
    if(progress<=.5){
      const t=progress*2;
      a={x:w*(1-t),y:0};
      b={x:w,y:h*t};
      poly=[[0,0],[a.x,0],[w,b.y],[w,h],[0,h]];
    }else{
      const t=(progress-.5)*2;
      a={x:0,y:h*t};
      b={x:w*(1-t),y:h};
      poly=[[0,a.y],[b.x,h],[0,h]];
    }
    const point=([x,y])=>x.toFixed(2)+'px '+y.toFixed(2)+'px';
    sheet.style.clipPath='polygon('+poly.map(point).join(',')+')';
    sheet.style.webkitClipPath=sheet.style.clipPath;
    fold.setAttribute('viewBox','0 0 '+w+' '+h);
    const dx=b.x-a.x,dy=b.y-a.y;
    const length=Math.max(1,Math.hypot(dx,dy));
    const normal={x:-dy/length,y:dx/length};
    const width=Math.min(19,Math.max(9,0.017*Math.max(w,h)));
    let tip;
    // Reflection of the peeled corner across its diagonal fold, capped
    // into the paper surface for a realistic small curled flap.
    if(progress<.3){
      const ax=w-a.x,ay=-a.y;
      const projection=(ax*dx+ay*dy)/(length*length);
      tip={
        x:clamp(2*(a.x+dx*projection)-w,0,w),
        y:clamp(2*(a.y+dy*projection),0,h)
      };
      flap.setAttribute('points',
        [[a.x,a.y],[b.x,b.y],[tip.x,tip.y]].map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' '));
    }else{
      flap.setAttribute('points',
        [[a.x,a.y],[b.x,b.y],[b.x+normal.x*width,b.y+normal.y*width],[a.x+normal.x*width,a.y+normal.y*width]]
          .map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' '));
    }
    crease.setAttribute('d','M '+a.x.toFixed(1)+' '+a.y.toFixed(1)+' L '+b.x.toFixed(1)+' '+b.y.toFixed(1));
    fold.style.opacity=String(clamp(1-progress*2.2,0,1));
    grip.style.opacity=String(clamp(1-progress*3,0,1));
    card.dataset.peelProgress=progress.toFixed(2);
    card.style.setProperty('--peel-progress',progress.toFixed(3));
  }
  function stopAnimation(){if(animation){cancelAnimationFrame(animation);animation=0;}}
  function semantics(open) {
    card.dataset.side=open?'back':'front';
    underlay.inert=!open;
    underlay.setAttribute('aria-hidden',String(!open));
    sheet.inert=open;
    sheet.setAttribute('aria-hidden',String(open));
    grip.setAttribute('aria-expanded',String(open));
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
      if(focus)(goingOpen?backButton:grip).focus({preventScroll:true});
      return;
    }
    const start=performance.now(),from=progress;
    const duration=goingOpen?680:550;
    card.dataset.peelState=goingOpen?'opening':'closing';
    function tick(now){
      const t=clamp((now-start)/duration);
      const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      paint(from+(target-from)*eased);
      if(t<1)animation=requestAnimationFrame(tick);
      else {animation=0;card.dataset.peelState=goingOpen?'open':'closed';}
    }
    animation=requestAnimationFrame(tick);
    if(focus)(goingOpen?backButton:grip).focus({preventScroll:true});
  }
  function reset(){
    stopAnimation();
    semantics(false);
    paint(BASE);
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
  // Channel switching replaces the content behind the same paper sheet,
  // and restores the corner without jarring rotation or stale CTA focus.
  new MutationObserver(()=>{
    if(card.dataset.side==='back'&&underlay.contains(document.activeElement))
      grip.focus({preventScroll:true});
    campaignExperience?.reset();
    reset();
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
