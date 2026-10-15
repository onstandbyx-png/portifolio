/* Whole-plane folds follow native scroll. Controls navigate the actual page;
   neither focus nor touch changes ownership of the scroll position. */
import {clamp,createMotion,entryEdge,rotationForEdge} from '../sections/motion.js';
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

// Reading poses keep 44% of each chapter interval. The 56% passage stays
// continuous and reversible instead of compressing every movement into a flick.
export function readingProgress(cursor){
 const whole=Math.floor(cursor),phase=clamp((cursor-whole-.22)/.56);
 return whole+phase*phase*(3-2*phase);
}

let viewportProbe;
export function stableViewportHeight(){
 if(!viewportProbe){viewportProbe=document.createElement('div');viewportProbe.setAttribute('aria-hidden','true');viewportProbe.style.cssText='position:fixed;left:-1px;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none';document.body.append(viewportProbe)}
 return viewportProbe.offsetHeight||innerHeight;
}

export function galleryPose(index,cursor,mobile=false){
 const distance=index-readingProgress(cursor),amount=clamp(Math.abs(distance)),sign=Math.sign(distance);
 return {y:distance*(mobile?94:100),angle:-sign*amount*68,scale:1-.12*amount,
  z:-amount*(mobile?100:180),opacity:clamp(1-Math.max(0,Math.abs(distance)-.8)*2.5),active:Math.round(cursor)===index};
}

// R9: static artwork stays inside an animated physical card. The outer chapter
// follows native page scrolling; card controls never capture wheel or touch input.
export function mountScrollGallery(){
 const gallery=document.querySelector('#trabalhos .work-gallery');
 if(!gallery||gallery.classList.contains('rg-gallery'))return gallery?.closest('.rg-scroll-shell')||null;
 const copy=sectionCopy('trabalhos'),entries=copy.cards;
 const visual={
  fatos:{image:'fatos-editorial.webp',alt:'Composição editorial Fatos Desconhecidos, com fotografia e hierarquia tipográfica',title:'Pesquisa que vira\nnarrativa.',body:'Pesquisa, texto e direção criativa para conteúdo editorial.'},
  ads:{image:'campanha-meta.webp',alt:'Peça estática de campanha smiile com direção de arte para Meta',title:'Uma ideia.\nTrês canais.',body:'Conceito, copy e direção de arte para Meta, Google e TikTok.'},
  smiile:{image:'trilhas.webp',alt:'Estudo estático da interface Trilhas, com busca e descoberta de percursos',title:'Interfaces\npara explorar.',body:'Direção visual e UX/UI para sites e aplicativos.'}
 };
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 gallery.classList.remove('rg-static-gallery');
 gallery.innerHTML=entries.filter(entry=>visual[entry.id]).map((entry,index)=>{
  const art=visual[entry.id],title=art.title.split('\n').map(line=>`<span class="rg-title-line"><span>${escape(line)}</span></span>`).join('');
  return `<article class="work-tile work-${escape(entry.id)}" data-work-card="${escape(entry.id)}" aria-labelledby="work-card-${escape(entry.id)}">
   <div class="work-context"><span>${String(index+1).padStart(2,'0')} / ${escape(entry.label)}</span><span>${escape(entry.nature)}</span></div>
   <div class="rg-card-stage" data-face="front">
    <div class="rg-card-rotor">
     <figure class="rg-art rg-card-front"><img src="/assets/portfolio/static-r8/${art.image}" width="960" height="1200" alt="${escape(art.alt)}" loading="lazy" decoding="async"></figure>
     <div class="rg-card-back" id="rg-back-${escape(entry.id)}" aria-hidden="true" inert><span>Contribuição</span><h4>${escape(entry.contribution)}</h4><p>${escape(entry.nature)}</p><a href="${escape(entry.href)}">${escape(entry.cta)} <i aria-hidden="true">↗</i></a></div>
    </div>
    <button class="rg-flip" type="button" data-rg-flip aria-pressed="false" aria-controls="rg-back-${escape(entry.id)}" aria-label="Ver contribuição: ${escape(entry.label)}" title="Ver contribuição"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M19.5 8.5A8 8 0 1 0 20 15M19.5 8.5V3.5M19.5 8.5H14.5" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
   </div>
   <div class="tile-caption"><div><h3 id="work-card-${escape(entry.id)}">${title}</h3><p>${escape(art.body)}</p></div><a class="tile-open" href="${escape(entry.href)}"><span>${escape(entry.cta)}</span><i aria-hidden="true">↗</i></a></div>
  </article>`;
 }).join('');
 const cards=[...gallery.querySelectorAll(':scope > .work-tile')];if(!cards.length)return null;
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
  natural=reduced.matches;shell.classList.toggle('rg-natural',natural);
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
 cards.forEach(card=>{
  const stage=card.querySelector('.rg-card-stage'),rotor=card.querySelector('.rg-card-rotor'),front=card.querySelector('.rg-card-front'),back=card.querySelector('.rg-card-back'),button=card.querySelector('[data-rg-flip]');
  const label=entries.find(entry=>entry.id===card.dataset.workCard)?.label||'trabalho';
  let edge='right',flipped=false,turn=null,rotation={x:0,y:180};
  function flip(){
   const current=getComputedStyle(rotor).transform;turn?.cancel();
   if(!flipped){rotation=rotationForEdge(edge);back.style.transform=`rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;}
   flipped=!flipped;const target=`rotateX(${flipped?rotation.x:0}deg) rotateY(${flipped?rotation.y:0}deg)`;
   stage.dataset.face=flipped?'back':'front';rotor.style.transform=target;
   front.inert=flipped;front.setAttribute('aria-hidden',String(flipped));back.inert=!flipped;back.setAttribute('aria-hidden',String(!flipped));
   button.setAttribute('aria-pressed',String(flipped));button.setAttribute('aria-label',(flipped?'Voltar à imagem: ':'Ver contribuição: ')+label);button.title=flipped?'Voltar à imagem':'Ver contribuição';
   state.settle();render();
   turn=motion.animate(rotor,[{transform:current==='none'?'rotateY(0deg)':current},{transform:target}],{duration:650});
  }
  stage.addEventListener('pointerenter',event=>{if(!flipped&&event.pointerType==='mouse'){const rect=stage.getBoundingClientRect();edge=entryEdge(event.clientX-rect.left,event.clientY-rect.top,rect.width,rect.height);}});
  button.addEventListener('click',flip);
  stage.addEventListener('keydown',event=>{if(event.key==='Escape'&&flipped){event.preventDefault();flip();button.focus({preventScroll:true});}});
 });
 // No pointerdown/focusin handler: a card action must never change its pose
 // between mouse-down and mouse-up, and a vertical gesture always stays native.
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()},{rootMargin:'100px'}).observe(shell);
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
 mobile.addEventListener('change',request);reduced.addEventListener('change',request);
 motion.onStop(()=>{state.pause(motion.paused());render()});
 const pause=document.querySelector('.motion-toggle');if(pause)new MutationObserver(request).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
 natural=reduced.matches;shell.classList.toggle('rg-natural',natural);
 render();shell.dataset.ready='true';gallery.dataset.galleryReady='true';return shell;
}
