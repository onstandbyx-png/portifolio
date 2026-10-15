/* Reference R1: whole planes fold through native page scroll. The existing
   flip rotor and case buttons stay mounted inside a separate camera plane. */
import {clamp,createMotion} from '../sections/motion.js';

export function createChapterState(count,initial=0){
 let value=initial,mode='scroll',held=false;
 return {
  get value(){return value},get mode(){return mode},get held(){return held},
  scroll(next){if(mode==='scroll'&&!held)value=clamp(next,0,count-1);return value},
  choose(next){value=clamp(next,0,count-1);mode='manual';return value},
  resume(next){mode='scroll';if(!held)value=clamp(next,0,count-1);return value},
  pause(next){held=Boolean(next);return value}
 };
}

export function galleryPose(index,cursor,mobile=false){
 const whole=Math.floor(cursor),phase=clamp((cursor-whole-.25)/.5),eased=phase*phase*(3-2*phase);
 const distance=index-(whole+eased),amount=clamp(Math.abs(distance)),sign=Math.sign(distance);
 return {y:distance*(mobile?69:73),angle:-sign*amount*(mobile?57:68),scale:1-.12*amount,
  z:-amount*(mobile?100:180),opacity:clamp(1-Math.max(0,Math.abs(distance)-.8)*.75),active:Math.round(cursor)===index};
}

export function mountScrollGallery(){
 const gallery=document.querySelector('#trabalhos .work-gallery');
 if(!gallery||gallery.classList.contains('rg-gallery'))return null;
 const cards=[...gallery.querySelectorAll(':scope > .work-tile')];if(!cards.length)return null;
 const shell=document.createElement('div');shell.className='rg-scroll-shell';
 shell.innerHTML='<div class="rg-sticky"><div class="rg-toolbar"><p><span data-rg-count>01 / 04</span> <span data-rg-name>Conteúdo editorial</span></p><button type="button" class="rg-resume" data-rg-resume hidden>Retomar rolagem <span aria-hidden="true">↓</span></button></div><div class="rg-viewport"></div><div class="rg-navigation"><button type="button" data-rg-prev aria-label="Trabalho anterior">←</button><p data-rg-status role="status" aria-live="polite">Role para explorar os trabalhos</p><button type="button" data-rg-next aria-label="Próximo trabalho">→</button></div></div>';
 gallery.before(shell);shell.querySelector('.rg-viewport').append(gallery);gallery.classList.add('rg-gallery');
 gallery.setAttribute('role','region');gallery.setAttribute('aria-label','Trabalhos em perspectiva');
 shell.style.setProperty('--rg-count',String(cards.length));
 const planes=cards.map((card,index)=>{
  const plane=document.createElement('div');plane.className='rg-plane';plane.dataset.rgIndex=String(index);
  card.before(plane);plane.append(card);card.querySelectorAll('.tile-caption h3 br').forEach(br=>br.before(document.createTextNode(' ')));card.classList.remove('reveal');card.classList.add('is-visible');return plane;
 });
 const motion=createMotion(),state=createChapterState(cards.length),short=matchMedia('(max-height: 700px)'),mobile=matchMedia('(max-width: 760px)');
 const resume=shell.querySelector('[data-rg-resume]'),count=shell.querySelector('[data-rg-count]'),name=shell.querySelector('[data-rg-name]'),status=shell.querySelector('[data-rg-status]');
 let visible=false,frame=0,lastIndex=-1,scrollValue=0;
 function render(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  shell.classList.toggle('rg-natural',short.matches||reduced);
  shell.dataset.mode=state.mode;
  const natural=short.matches||reduced,index=Math.round(state.value);
  planes.forEach((plane,i)=>{
   const pose=galleryPose(i,state.value,mobile.matches);
   plane.style.setProperty('--rg-y',`${pose.y}%`);plane.style.setProperty('--rg-angle',`${pose.angle}deg`);
   plane.style.setProperty('--rg-scale',String(pose.scale));plane.style.setProperty('--rg-z',`${pose.z}px`);
   plane.style.setProperty('--rg-opacity',String(pose.opacity));plane.style.zIndex=String(cards.length-Math.abs(i-index));
   plane.classList.toggle('rg-active',pose.active);plane.inert=!natural&&!pose.active;
   plane.setAttribute('aria-hidden',String(!natural&&!pose.active));
  });
  resume.hidden=state.mode!=='manual'||natural;resume.disabled=motion.paused();
  shell.querySelector('[data-rg-prev]').disabled=index===0;
  shell.querySelector('[data-rg-next]').disabled=index===cards.length-1;
  if(index!==lastIndex){
   lastIndex=index;count.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
   name.textContent=cards[index].querySelector('.tile-caption small')?.textContent||'Trabalho selecionado';
  }
  status.textContent=natural?'Todos os trabalhos, em sequência':state.mode==='manual'?'Seleção mantida · explore a peça':motion.paused()?'Movimento pausado · use as setas':'Role para explorar · ou use as setas';
 }
 function update(){
  frame=0;if(!visible||shell.hidden)return;
  const rect=shell.getBoundingClientRect(),header=parseFloat(getComputedStyle(shell).getPropertyValue('--rg-header'))||76;
  const distance=Math.max(1,shell.offsetHeight-(innerHeight-header));
  scrollValue=clamp((header-rect.top)/distance)*(cards.length-1);
  state.pause(motion.paused());state.scroll(scrollValue);render();
 }
 const request=()=>{if(!frame)frame=requestAnimationFrame(update)};
 function choose(index){
  state.choose(index);render();
  if(shell.classList.contains('rg-natural'))cards[Math.round(state.value)].scrollIntoView({behavior:'instant',block:'center'});
 }
 shell.querySelector('[data-rg-prev]').addEventListener('click',()=>choose(Math.round(state.value)-1));
 shell.querySelector('[data-rg-next]').addEventListener('click',()=>choose(Math.round(state.value)+1));
 resume.addEventListener('click',()=>{state.resume(scrollValue);render()});
 gallery.addEventListener('pointerdown',event=>{
  if(!event.target.closest('button,a'))return;
  const plane=event.target.closest('.rg-plane');if(plane){state.choose(plane.classList.contains('rg-active')?state.value:Number(plane.dataset.rgIndex));render()}
 });
 gallery.addEventListener('focusin',event=>{
  const plane=event.target.closest('.rg-plane');if(plane){state.choose(plane.classList.contains('rg-active')?state.value:Number(plane.dataset.rgIndex));render()}
 });
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()},{rootMargin:'100px'}).observe(shell);
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
 short.addEventListener('change',request);mobile.addEventListener('change',request);
 motion.onStop(()=>{state.pause(motion.paused());render()});
 const pause=document.querySelector('.motion-toggle');
 if(pause)new MutationObserver(request).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',request);
 render();shell.dataset.ready='true';return shell;
}
