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
 const sections=$$('main section[id]').filter(x=>x.id!=='inicio'),links=$$('.main-nav a');
 const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){links.forEach(a=>{const on=a.hash==='#'+e.target.id;a.classList.toggle('sm-nav-active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});}},{rootMargin:'-15% 0px -65% 0px',threshold:0});
 sections.forEach(s=>io.observe(s));
 const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('sm-revealed');rise(e.target,28);reveal.unobserve(e.target);}}),{threshold:.12});
 // R6: editorial-motion.js exclusively owns section heading reveals.
 $$('.source-note').forEach(s=>reveal.observe(s));
});
document.documentElement.classList.add('sm-sections-ready');
