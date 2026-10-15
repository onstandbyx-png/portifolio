/* Whole-plane folds follow native scroll. Controls navigate the actual page;
   neither focus nor touch changes ownership of the scroll position. */
import {clamp,createMotion} from '../sections/motion.js';
import {sectionCopy} from '../content/portfolio-copy.js';

export function createChapterState(count,initial=0){
 let progress=clamp(initial,0,count-1),held=false,settled=false;
 return {
  get value(){return held||settled?Math.round(progress):progress},get mode(){return 'scroll'},get held(){return held},
  scroll(next){next=clamp(next,0,count-1);if(Math.abs(next-progress)>.0001)settled=false;progress=next;return this.value},
  choose(next){progress=clamp(next,0,count-1);settled=false;return this.value},
  resume(next){return this.scroll(next)},
  pause(next){next=Boolean(next);if(next!==held)settled=true;held=next;return this.value},
  settle(){settled=true;return this.value}
 };
}

// Seventy percent of each chapter interval belongs to a still reading pose.
// The remaining interval is a reversible passage, shared by both compositions.
export function readingProgress(cursor){
 const whole=Math.floor(cursor),phase=clamp((cursor-whole-.35)/.3);
 return whole+phase*phase*(3-2*phase);
}

let viewportProbe;
export function stableViewportHeight(){
 if(!viewportProbe){viewportProbe=document.createElement('div');viewportProbe.setAttribute('aria-hidden','true');viewportProbe.style.cssText='position:fixed;left:-1px;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none';document.body.append(viewportProbe)}
 return viewportProbe.offsetHeight||innerHeight;
}

export function galleryPose(index,cursor,mobile=false){
 const distance=index-readingProgress(cursor),amount=clamp(Math.abs(distance)),sign=Math.sign(distance);
 return {y:distance*(mobile?69:73),angle:-sign*amount*68,scale:1-.12*amount,
  z:-amount*(mobile?100:180),opacity:clamp(1-Math.max(0,Math.abs(distance)-.8)*2.5),active:Math.round(cursor)===index};
}

export function mountScrollGallery(){
 const gallery=document.querySelector('#trabalhos .work-gallery');
 if(!gallery||gallery.classList.contains('rg-gallery'))return null;
 const copy=sectionCopy('trabalhos'),entries=copy.cards;
 const cards=[...gallery.querySelectorAll(':scope > .work-tile')].filter(card=>{
  if(entries.some(entry=>entry.id===card.dataset.workCard))return true;
  card.remove();return false;
 });if(!cards.length)return null;
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 cards.forEach((card,index)=>{
  const entry=entries.find(item=>item.id===card.dataset.workCard),caption=card.querySelector('.tile-caption');
  if(!entry||!caption)return;
  caption.querySelector('h3').innerHTML=entry.title.split('\n').map(line=>`<span class="rg-title-line"><span>${escape(line)}</span></span>`).join('');
  caption.querySelector('p').textContent=entry.body;
  const context=card.querySelector('.work-context');context.innerHTML=`<span>${String(index+1).padStart(2,'0')} / ${escape(entry.label)}</span><span>${escape(entry.nature)}</span>`;
  const action=card.querySelector('.tile-open');if(action){action.setAttribute('aria-label',entry.cta);action.innerHTML='<span>'+escape(entry.cta)+'</span><i aria-hidden="true">↗</i>';}
  card.querySelector('.tile-chip')?.remove();card.querySelector('.tile-num')?.remove();
  const back=card.querySelector('.sm-work-back');if(back){back.querySelector('h3').textContent=entry.contribution;back.querySelector('p').textContent=entry.body;back.querySelector('.sm-back-lines')?.remove();const label=back.querySelector('small');if(label)label.textContent=entry.nature;}
  if(entry.id==='fatos'){
   const art=card.querySelector('.tile-art'),img=art?.querySelector('img');if(img){img.src='/assets/portfolio/recovered-fatos/post-desconhecidos-600.webp';img.alt='Composição demonstrativa de tecnologia: um telefone diante da cidade';}
   if(art){const editorial=sectionCopy('editorial'),copy=document.createElement('div');copy.className='rg-fatos-copy';copy.innerHTML=`<span class="rg-fatos-label"><i aria-hidden="true"></i>Fatos Desconhecidos</span><div><small>${escape(editorial.studyLabel)}</small><strong>${escape(editorial.steps[0].pieceTitle)}</strong></div>`;art.append(copy);}
  }
  if(entry.id==='ads'){const art=card.querySelector('.tile-art');if(art){art.classList.add('rg-campaign-art');const img=art.querySelector('img');if(img){img.src='/assets/brands/smiile-campaign-editorial.svg';img.alt='Campanha conceitual smiile: Sua ideia ganha vida, com site e aplicativo';}}}
  if(entry.id==='smiile'){const img=card.querySelector('.tile-art>img');if(img){img.src='/assets/badges/smiile-interface.webp';img.alt='Interface do aplicativo Trilha do Arco, projeto próprio smiile';}}
 });
 const shell=document.createElement('div');shell.className='rg-scroll-shell';
 shell.innerHTML='<div class="rg-sticky"><div class="rg-toolbar"><p><span data-rg-count>01 / 03</span> <span data-rg-name>Fatos Desconhecidos</span></p><span class="rg-scroll-cue" aria-hidden="true">Continue rolando ↓</span></div><div class="rg-viewport"></div><div class="rg-navigation"><button type="button" data-rg-prev aria-label="Trabalho anterior">←</button><p data-rg-status role="status" aria-live="polite">Role para explorar os trabalhos</p><button type="button" data-rg-next aria-label="Próximo trabalho">→</button></div></div>';
 gallery.before(shell);shell.querySelector('.rg-viewport').append(gallery);gallery.classList.add('rg-gallery');
 gallery.setAttribute('role','region');gallery.setAttribute('aria-label','Trabalhos em perspectiva');
 shell.style.setProperty('--rg-count',String(cards.length));
 const planes=cards.map((card,index)=>{
  const plane=document.createElement('div');plane.className='rg-plane';plane.dataset.rgIndex=String(index);
  card.before(plane);plane.append(card);card.querySelectorAll('.tile-caption h3 br').forEach(br=>br.before(document.createTextNode(' ')));card.classList.remove('reveal');card.classList.add('is-visible');return plane;
 });
 const motion=createMotion(),state=createChapterState(cards.length),mobile=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const sticky=shell.querySelector('.rg-sticky'),count=shell.querySelector('[data-rg-count]'),name=shell.querySelector('[data-rg-name]'),status=shell.querySelector('[data-rg-status]');
 let visible=false,frame=0,lastIndex=-1,natural=false;
 const revealed=new Set();
 function revealTitle(card,index){
  if(revealed.has(index))return;revealed.add(index);card.dataset.read='true';
  card.querySelectorAll('.rg-title-line>span').forEach((line,i)=>{const animation=motion.animate(line,[{opacity:0,transform:'translateY(105%)'},{opacity:1,transform:'translateY(0)'}],{duration:620,delay:i*75});animation?.effect.updateTiming({fill:'backwards'});});
 }
 const header=()=>mobile.matches?64:76;
 function render(){
  const index=Math.round(state.value);shell.dataset.mode=natural?'flow':'scroll';shell.dataset.paused=String(motion.paused());
  planes.forEach((plane,i)=>{
   const pose=galleryPose(i,state.value,mobile.matches);
   plane.style.setProperty('--rg-y',`${pose.y}%`);plane.style.setProperty('--rg-angle',`${pose.angle}deg`);
   plane.style.setProperty('--rg-scale',String(pose.scale));plane.style.setProperty('--rg-z',`${pose.z}px`);
   plane.style.setProperty('--rg-opacity',String(pose.opacity));plane.style.zIndex=String(cards.length-Math.abs(i-index));
   plane.classList.toggle('rg-active',pose.active);plane.inert=!natural&&!pose.active;
   const titleBox=cards[i].querySelector('.tile-caption h3').getBoundingClientRect();
   if(visible&&pose.active&&(natural||Math.abs(pose.angle)<2)&&titleBox.top<stableViewportHeight()-60&&titleBox.bottom>header())revealTitle(cards[i],i);
   plane.setAttribute('aria-hidden',String(!natural&&!pose.active));
   if(natural){
    const rect=plane.getBoundingClientRect(),height=stableViewportHeight(),offset=clamp((rect.top+rect.height/2-height/2)/height,-1,1);
    plane.style.setProperty('--rg-flow-angle',`${motion.paused()?0:offset*-5}deg`);
   }
  });
  shell.querySelector('[data-rg-prev]').disabled=index===0;
  shell.querySelector('[data-rg-next]').disabled=index===cards.length-1;
  if(index!==lastIndex){lastIndex=index;count.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');name.textContent=entries.find(entry=>entry.id===cards[index].dataset.workCard)?.label||'Trabalho selecionado'}
  const message=natural?copy.controls.scroll:motion.paused()?copy.controls.paused:copy.controls.scroll;
  if(status.textContent!==message)status.textContent=message;
 }
 function update(){
  frame=0;if(!visible||shell.hidden)return;
  natural=mobile.matches||reduced.matches;shell.classList.toggle('rg-natural',natural);
  state.pause(motion.paused());
  if(natural){
   let nearest=0,distance=Infinity;planes.forEach((plane,i)=>{const r=plane.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-stableViewportHeight()/2);if(d<distance){distance=d;nearest=i}});state.choose(nearest);
  }else{
   const rect=shell.getBoundingClientRect(),travel=Math.max(1,shell.offsetHeight-sticky.offsetHeight);
   state.scroll(clamp((header()-rect.top)/travel)*(cards.length-1));
  }
  render();
 }
 const request=()=>{if(!frame)frame=requestAnimationFrame(update)};
 function navigate(index){
  const next=clamp(index,0,cards.length-1),behavior=motion.paused()?'instant':'smooth';
  if(natural){cards[next].scrollIntoView({behavior,block:'center'});return}
  const start=scrollY+shell.getBoundingClientRect().top-header(),travel=shell.offsetHeight-sticky.offsetHeight;
  if(motion.paused()){state.choose(next);render()}
  scrollTo({top:start+travel*next/(cards.length-1),behavior});
 }
 shell.querySelector('[data-rg-prev]').addEventListener('click',()=>navigate(Math.round(state.value)-1));
 shell.querySelector('[data-rg-next]').addEventListener('click',()=>navigate(Math.round(state.value)+1));
 // Settle only after activation, never between pointer-down and pointer-up.
 // A subsequent native scroll immediately returns ownership to its timeline.
 gallery.addEventListener('click',event=>{if(event.target.closest('.sm-work-peek')){state.settle();render()}});
 // No pointerdown/focusin handler: a card action must never change its pose
 // between mouse-down and mouse-up, and a vertical gesture always stays native.
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()},{rootMargin:'100px'}).observe(shell);
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
 mobile.addEventListener('change',request);reduced.addEventListener('change',request);
 motion.onStop(()=>{state.pause(motion.paused());render()});
 const pause=document.querySelector('.motion-toggle');if(pause)new MutationObserver(request).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
 natural=mobile.matches||reduced.matches;shell.classList.toggle('rg-natural',natural);
 render();shell.dataset.ready='true';return shell;
}
