/** Direct gestures enhance the current artwork, never replace it with a mock. */
import {createMotion} from '../sections/motion.js';
import {bindCardSurface} from './card-surface.js';

function mountCampaignFlip() {
  const lab=document.querySelector('.sp-campaign');
  const card=lab?.querySelector('.sp-campaign-layout');
  if(!card||card.dataset.face)return;
  const front=card.querySelector('.sp-campaign-art');
  const back=card.querySelector('.sp-campaign-note');
  if(!front||!back)return;
  const motion=createMotion();
  const rotor=document.createElement('div');rotor.className='sp-flip-inner';
  card.classList.add('sp-flip-card');card.dataset.face='front';
  card.prepend(rotor);rotor.append(front,back);
  const cue=document.createElement('button');
  cue.type='button';cue.className='card-turn-cue';cue.dataset.campaignFlip='';
  cue.setAttribute('aria-controls',back.id);cue.setAttribute('aria-pressed','false');
  card.append(cue);
  let flipped=false,turn=null;
  function sync(){
    card.dataset.face=flipped?'back':'front';
    front.inert=flipped;back.inert=!flipped;
    front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped));
    cue.setAttribute('aria-pressed',String(flipped));
    cue.textContent=flipped?'Toque para voltar à peça':'Toque no cartão para ver o verso';
    cue.setAttribute('aria-label',flipped?'Voltar à peça da campanha':'Virar cartão: ver a decisão da campanha');
  }
  function flip(next=!flipped,animate=true){
    if(next===flipped)return;
    const current=getComputedStyle(rotor).transform;
    turn?.cancel();flipped=next;
    if((flipped?front:back).contains(document.activeElement))cue.focus({preventScroll:true});
    sync();const target=`rotateY(${flipped?180:0}deg)`;rotor.style.transform=target;
    if(animate)turn=motion.animate(rotor,[{transform:current==='none'?'rotateY(0deg)':current},{transform:target}],{duration:650});
  }
  cue.addEventListener('click',()=>flip());
  card.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&flipped){event.preventDefault();flip(false);cue.focus({preventScroll:true});}
  });
  // Channel changes keep their original crossfade and always present the new artwork.
  lab.querySelectorAll('[data-sp-tab]').forEach(tab=>{
    new MutationObserver(()=>{if(tab.getAttribute('aria-selected')==='true')flip(false,false);}).observe(tab,{attributes:true,attributeFilter:['aria-selected']});
  });
  bindCardSurface(card,()=>cue);sync();
}

function mountGalleryCues(){
  document.querySelectorAll('.rg-gallery [data-work-card]').forEach(card=>{
    const cue=card.querySelector('[data-rg-flip]'),caption=card.querySelector('.tile-caption'),link=caption?.querySelector('.tile-open');
    if(!cue||!link||card.querySelector('.rg-action-row'))return;
    const actions=document.createElement('div');actions.className='rg-action-row';
    caption.append(actions);actions.append(link,cue);cue.classList.add('card-turn-cue');
    const sync=()=>{cue.textContent=cue.getAttribute('aria-pressed')==='true'?'Voltar à imagem':'Toque para virar';};
    sync();new MutationObserver(sync).observe(cue,{attributes:true,attributeFilter:['aria-pressed']});
    card.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&cue.getAttribute('aria-pressed')==='true'){
        event.preventDefault();cue.click();cue.focus({preventScroll:true});
      }
    });
  });
}

function mountEditorialSwipe(){
  const root=document.querySelector('#editorial');
  const frame=root?.querySelector('.es-device'),stage=frame?.parentElement;
  const pieces=[...(root?.querySelectorAll('[data-es-piece]')||[])];
  const tabs=[...(root?.querySelectorAll('[data-editorial-step]')||[])];
  if(!frame||pieces.length<2||tabs.length!==pieces.length||root.dataset.editorialSwipe)return;
  const motion=createMotion();
  const current=()=>tabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true');
  const labels=['Abertura','Contexto','Fechamento'];
  const hint=document.createElement('p');hint.className='es-swipe-hint';hint.id='editorial-swipe-hint';
  hint.textContent='Deslize sobre a peça para continuar';stage.prepend(hint);
  const nav=document.createElement('div');nav.className='es-swipe-navigation';
  nav.innerHTML='<button type="button" data-es-prev aria-label="Etapa editorial anterior">←</button><div class="es-swipe-progress"><span data-es-position aria-hidden="true"></span><div class="es-swipe-dots" aria-hidden="true">'+pieces.map(()=>'<i></i>').join('')+'</div></div><button type="button" data-es-next aria-label="Próxima etapa editorial">→</button>';
  stage.append(nav);
  frame.tabIndex=0;frame.setAttribute('role','group');frame.setAttribute('aria-roledescription','carrossel');
  frame.setAttribute('aria-label','História editorial em três etapas');frame.setAttribute('aria-describedby',hint.id);
  const prev=nav.querySelector('[data-es-prev]'),next=nav.querySelector('[data-es-next]');
  let gesture=null,animations=[],generation=0,switching=false;
  function sync(){
    const index=current();prev.disabled=index===0;next.disabled=index===pieces.length-1;
    nav.querySelector('[data-es-position]').textContent=`${labels[index]} · ${index+1} de ${pieces.length}`;
    nav.querySelectorAll('i').forEach((dot,i)=>dot.classList.toggle('is-current',i===index));
    pieces.forEach(piece=>{piece.inert=piece.hidden;piece.setAttribute('aria-hidden',String(piece.hidden));});
  }
  function clear(){
    ++generation;animations.forEach(a=>a?.cancel());animations=[];
    pieces.forEach(piece=>{
      delete piece.dataset.esSwipePreview;piece.style.removeProperty('transform');piece.style.removeProperty('opacity');
    });
    delete frame.dataset.dragging;sync();
  }
  function cancel(){
    const old=gesture;gesture=null;
    if(old&&frame.hasPointerCapture?.(old.id))frame.releasePointerCapture(old.id);
    clear();
  }
  function goTo(index,offset=0){
    const from=current(),target=Math.max(0,Math.min(pieces.length-1,index));
    clear();
    if(target===from){
      if(offset)animations.push(motion.animate(pieces[from],[{transform:`translateX(${offset}px)`},{transform:'translateX(0)'}],{duration:260}));
      return;
    }
    const direction=target>from?1:-1,width=frame.querySelector('.es-screen').clientWidth;
    switching=true;tabs[target].click();switching=false;sync();
    if(!motion.available())return;
    const token=++generation;
    pieces[from].dataset.esSwipePreview='true';
    animations=[
      motion.animate(pieces[from],[{transform:`translateX(${offset}px)`},{transform:`translateX(${-direction*width}px)`}],{duration:380,easing:'cubic-bezier(.22,.75,.25,1)'}),
      motion.animate(pieces[target],[{transform:`translateX(${direction*width+offset}px)`},{transform:'translateX(0)'}],{duration:380,easing:'cubic-bezier(.22,.75,.25,1)'})
    ].filter(Boolean);
    Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(token===generation)clear();});
  }
  tabs.forEach(tab=>tab.addEventListener('click',()=>{if(!switching)cancel();else sync();}));
  prev.addEventListener('click',()=>goTo(current()-1));next.addEventListener('click',()=>goTo(current()+1));
  frame.addEventListener('keydown',event=>{
    if(event.target!==frame)return;
    const target={ArrowLeft:current()-1,ArrowRight:current()+1,Home:0,End:pieces.length-1}[event.key];
    if(target!==undefined){event.preventDefault();goTo(target);}
  });
  frame.addEventListener('dragstart',event=>event.preventDefault());
  frame.addEventListener('pointerdown',event=>{
    if(!event.isPrimary){cancel();return;}
    if(event.button!==0||event.target.closest('a,button,input,select,textarea'))return;
    cancel();gesture={id:event.pointerId,x:event.clientX,y:event.clientY,started:performance.now(),dx:0,locked:false};
  });
  frame.addEventListener('pointermove',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if(!gesture.locked){
      if(Math.abs(dy)>10&&Math.abs(dy)>=Math.abs(dx)){cancel();return;}
      if(Math.abs(dx)<10||Math.abs(dx)<Math.abs(dy)*1.25)return;
      gesture.locked=true;frame.setPointerCapture(event.pointerId);frame.dataset.dragging='true';
    }
    gesture.dx=dx;
    if(!motion.available())return;
    const index=current(),direction=dx<0?1:-1,target=index+direction;
    const width=frame.querySelector('.es-screen').clientWidth;
    const bounded=target<0||target>=pieces.length;
    const offset=bounded?dx*.2:Math.sign(dx)*Math.min(Math.abs(dx),width);
    pieces.forEach((piece,i)=>{if(i!==index){delete piece.dataset.esSwipePreview;piece.style.removeProperty('transform');}});
    pieces[index].style.transform=`translateX(${offset}px)`;
    if(!bounded){pieces[target].dataset.esSwipePreview='true';pieces[target].style.transform=`translateX(${direction*width+offset}px)`;}
  });
  frame.addEventListener('pointerup',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;
    const old=gesture;gesture=null;
    if(frame.hasPointerCapture(event.pointerId))frame.releasePointerCapture(event.pointerId);
    if(!old.locked){clear();return;}
    const dx=event.clientX-old.x,width=frame.querySelector('.es-screen').clientWidth;
    const speed=Math.abs(dx)/Math.max(1,performance.now()-old.started);
    const commit=Math.abs(dx)>=Math.max(32,Math.min(60,width*.18))||(Math.abs(dx)>24&&speed>.45);
    const index=current(),target=index+(dx<0?1:-1),bounded=target<0||target>=pieces.length;
    const offset=motion.available()?(bounded?dx*.2:Math.sign(dx)*Math.min(Math.abs(dx),width)):0;
    goTo(commit?target:index,offset);
  });
  frame.addEventListener('pointercancel',cancel);
  // Transferring implicit touch capture from a child must not cancel our drag.
  frame.addEventListener('lostpointercapture',event=>{if(gesture&&event.target===frame&&!frame.hasPointerCapture(event.pointerId))cancel();});
  addEventListener('resize',cancel,{passive:true});motion.onStop(cancel);
  sync();root.dataset.editorialSwipe='ready';
}

export function mountDirectInteractions(){
  if(document.documentElement.dataset.directInteractions)return;
  document.documentElement.dataset.directInteractions='loading';
  const style=document.createElement('link');style.rel='stylesheet';style.href='/assets/showcase/direct-interactions.css';
  style.addEventListener('load',()=>{
    for(const mount of [mountCampaignFlip,mountGalleryCues,mountEditorialSwipe]){
      try{mount();}catch(error){console.error('Portfolio direct interaction:',error);}
    }
    document.documentElement.dataset.directInteractions='ready';
  },{once:true});
  style.addEventListener('error',()=>{delete document.documentElement.dataset.directInteractions;},{once:true});
  document.head.append(style);
}
