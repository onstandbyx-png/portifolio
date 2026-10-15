import {createMotion,clamp} from './motion.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const M=createMotion();
const copy=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content.firstElementChild;};
function rise(node,distance=24,delay=0){return M.spring(node,p=>({opacity:clamp(p),transform:`translateY(${distance*(1-p)}px)`}),{delay});}
function mount(name,fn){try{fn();document.documentElement.dataset[`sm${name}`]='ready';}catch(e){document.documentElement.dataset[`sm${name}`]='failed';console.error(`Seção ${name}:`,e);}}

mount('Contact',()=>{
 const group=$('.contact-formats'),form=$('#brief-form'),service=$('#service'),brief=$('#brief');if(!group||!form||!service||!brief)return;
 const notes=['Uma entrega definida, com escopo e revisão combinados.','Narrativa, campanha e desenvolvimento conectados pela mesma necessidade.','Uma colaboração contínua, com prioridades e responsabilidades claras.'];
 const explanation=copy('<p class="sm-collaboration-note" role="status"></p>');group.after(explanation);group.setAttribute('role','group');group.setAttribute('aria-label','Forma de colaboração');
 $$('span',group).forEach((span,i)=>{const b=document.createElement('button');b.type='button';b.textContent=span.textContent;b.setAttribute('aria-pressed',String(i===0));span.replaceWith(b);b.addEventListener('click',()=>{$$('button',group).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));explanation.textContent=notes[i];rise(explanation,8);if(i===1){service.value='Projeto integrado';service.dispatchEvent(new Event('change',{bubbles:true}));}});});
 explanation.textContent=notes[0];
 const summary=copy('<div class="sm-brief-summary"><div><span>SEU PONTO DE PARTIDA</span><span class="sm-brief-dot">RASCUNHO LOCAL</span></div><strong>Escolha uma frente para começar.</strong><p>Defina a ideia, o contexto e o que precisa ser entregue.</p></div>');
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
