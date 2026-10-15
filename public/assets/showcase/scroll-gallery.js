/* Static work gallery. Legacy chapter helpers remain exported for the older
   narrative modules; this gallery does not take ownership of native scroll. */
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

// R8: the work is visible in full. Images and captions remain in native flow;
// the only motion is a short entrance when a card first reaches the viewport.
export function mountScrollGallery(){
 const gallery=document.querySelector('#trabalhos .work-gallery');
 if(!gallery||gallery.dataset.galleryReady==='true')return gallery;
 const entries=sectionCopy('trabalhos').cards;
 const visual={
  fatos:{image:'fatos-editorial.webp',alt:'Composição editorial Fatos Desconhecidos, com fotografia e hierarquia tipográfica',title:'Pesquisa que vira narrativa.',body:'Pesquisa, texto e direção criativa para conteúdo editorial.'},
  ads:{image:'campanha-meta.webp',alt:'Peça estática de campanha smiile com direção de arte para Meta',title:'Uma ideia. Três canais.',body:'Conceito, copy e direção de arte para Meta, Google e TikTok.'},
  smiile:{image:'trilhas.webp',alt:'Estudo estático da interface Trilhas, com busca e descoberta de percursos',title:'Interfaces para explorar.',body:'Direção visual e UX/UI para sites e aplicativos.'}
 };
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 gallery.classList.add('rg-static-gallery');
 gallery.setAttribute('aria-label','Trabalhos selecionados');
 gallery.innerHTML=entries.filter(entry=>visual[entry.id]).map((entry,index)=>{
  const art=visual[entry.id];
  return `<article class="work-tile work-${escape(entry.id)}" data-work-card="${escape(entry.id)}" aria-labelledby="work-card-${escape(entry.id)}">
   <div class="work-context"><span>${String(index+1).padStart(2,'0')} / ${escape(entry.label)}</span><span>${escape(entry.nature)}</span></div>
   <figure class="rg-art"><img src="/assets/portfolio/static-r8/${art.image}" width="960" height="1200" alt="${escape(art.alt)}" loading="lazy" decoding="async"></figure>
   <div class="tile-caption"><div><h3 id="work-card-${escape(entry.id)}">${escape(art.title)}</h3><p>${escape(art.body)}</p></div><a class="tile-open" href="${escape(entry.href)}"><span>${escape(entry.cta)}</span><i aria-hidden="true">↗</i></a></div>
  </article>`;
 }).join('');
 const motion=createMotion();
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    observer.unobserve(entry.target);
    motion.animate(entry.target,[{opacity:.4,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:520});
   });
  },{threshold:.08});
  gallery.querySelectorAll('.work-tile').forEach(card=>observer.observe(card));
 }
 gallery.dataset.galleryReady='true';
 return gallery;
}
