import {createMotion,clamp} from './motion.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const M=createMotion();
const copy=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content.firstElementChild;};
function rise(node,distance=24,delay=0){return M.spring(node,p=>({opacity:clamp(p),transform:`translateY(${distance*(1-p)}px)`}),{delay});}
function mount(name,fn){try{fn();document.documentElement.dataset[`sm${name}`]='ready';}catch(e){document.documentElement.dataset[`sm${name}`]='failed';console.error(`Seção ${name}:`,e);}}

mount('Contact',()=>{
 const form=$('#brief-form'),service=$('#service'),brief=$('#brief');if(!form||!service||!brief)return;
 const summary=copy('<details class="sm-brief-summary"><summary>Revisar resumo</summary><strong>Escolha uma frente para começar.</strong><p>Defina a ideia, o contexto e o que precisa ser entregue.</p></details>');
 $('.form-submit',form).before(summary);
 function update(){$('strong',summary).textContent=service.value||'Escolha uma frente para começar.';$('p',summary).textContent=brief.value.trim()||'Defina a ideia, o contexto e o que precisa ser entregue.';}
 service.addEventListener('change',()=>{update();rise(summary,12)});brief.addEventListener('input',update);
});

mount('Navigation',()=>{
 // The current item is the last section whose top passed 35% of the viewport. A section belongs to the item named by
 // its own or an ancestor's data-nav-group (#editorial → Trabalhos); an unlisted one (e.g. the injected #narrativa-visual)
 // keeps the group of the section before it.
 const links=$$('.main-nav a,#mobile-nav a:not(.mobile-nav-cta)'),targets=new Set(links.map(a=>a.hash.slice(1))),visible=new Set();
 function mark(){
  let group='',current='';
  for(const s of $$('main section[id]')){group=s.closest('[data-nav-group]')?.dataset.navGroup||(targets.has(s.id)?s.id:group);if(visible.has(s))current=group;}
  links.forEach(a=>{const on=Boolean(current)&&a.hash==='#'+current;a.classList.toggle('sm-nav-active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 }
 const io=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);mark();},{rootMargin:'0px 0px -65% 0px',threshold:0});
 const observe=()=>$$('main section[id]').forEach(s=>io.observe(s));
 observe();addEventListener('load',observe,{once:true});
 const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('sm-revealed');rise(e.target,28);reveal.unobserve(e.target);}}),{threshold:.12});
 // R6: editorial-motion.js exclusively owns section heading reveals.
 $$('.source-note').forEach(s=>reveal.observe(s));
});
document.documentElement.classList.add('sm-sections-ready');
