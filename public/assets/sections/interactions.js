import {createDeviceFrame} from '../showcase/device-frame.js';
import {createMotion,clamp,entryEdge,rotationForEdge,chapterAt} from './motion.js';
import {sectionCopy} from '../content/portfolio-copy.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const M=createMotion(),fine=matchMedia('(hover:hover) and (pointer:fine)');
const copy=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content.firstElementChild;};
function cloneVisual(node){const c=node.cloneNode(true);c.removeAttribute('id');$$('[id]',c).forEach(n=>n.removeAttribute('id'));c.setAttribute('aria-hidden','true');c.inert=true;c.classList.add('sm-outgoing');return c;}
function rise(node,distance=24,delay=0){return M.spring(node,p=>({opacity:clamp(p),transform:`translateY(${distance*(1-p)}px)`}),{delay});}
function mount(name,fn){try{fn();document.documentElement.dataset[`sm${name}`]='ready';}catch(e){document.documentElement.dataset[`sm${name}`]='failed';console.error(`Seção ${name}:`,e);}}

mount('Works',()=>{
 const workLabels=sectionCopy('trabalhos').controls;
 const data={fatos:['Por trás de cada pauta.','Pesquisa, roteiro e direção editorial.','Assunto e recorte','Texto e storytelling','Peças em diferentes formatos'],ads:['Por trás do anúncio.','Estratégia, criação e mídia paga.','Conceito e público','Formatos e copy','Operação e melhoria'],smiile:['Por trás do produto.','Sites, apps e experiências digitais.','Direção visual','Interação real','Desenvolvimento frontend'],video:['Por trás do movimento.','Vídeo, textura e materialidade.','Cena e narrativa','Camadas e animações','Experiência interativa']};
 let origin=null;
 $$('.work-tile').forEach((tile,i)=>{
  const kind=tile.dataset.workCard,details=data[kind];if(!details)return;
  const art=$('.tile-art',tile);if(!art)return;
  const stage=copy('<div class="sm-work-stage"><div class="sm-work-rotor"></div></div>');
  art.before(stage);const rotor=$('.sm-work-rotor',stage);rotor.append(art);art.classList.add('sm-work-front');
  const back=copy(`<div class="sm-work-back" id="sm-back-${kind}" aria-hidden="true"><span class="sm-overline">0${i+1} / PROCESSO E CONTRIBUIÇÃO</span><h3>${details[0]}</h3><p>${details[1]}</p><div class="sm-back-lines">${details.slice(2).map((v,j)=>`<span><i>0${j+1}</i>${v}</span>`).join('')}</div><small>Abra o case para conhecer o contexto e a minha contribuição.</small><span class="sm-back-sign">ideia ↗ execução.</span></div>`);
  back.inert=true;rotor.append(back);
  const peek=copy(`<button type="button" class="sm-work-peek" aria-expanded="false" aria-controls="sm-back-${kind}"><span>${workLabels.reveal}</span><b aria-hidden="true">↶</b></button>`);stage.append(peek);
  stage.append(copy('<span class="sm-work-sheen" aria-hidden="true"></span>'));
  let edge='right',flipped=false,raf=0,turn=null;
  function flip(){
   turn?.cancel();flipped=!flipped;const r=rotationForEdge(edge);stage.dataset.face=flipped?'back':'front';
   peek.setAttribute('aria-expanded',String(flipped));$('span',peek).textContent=flipped?workLabels.return:workLabels.reveal;
   art.inert=flipped;art.setAttribute('aria-hidden',String(flipped));back.inert=!flipped;back.setAttribute('aria-hidden',String(!flipped));
   back.style.transform=`rotateX(${r.x}deg) rotateY(${r.y}deg)`;
   rotor.style.transform=flipped?`rotateX(${r.x}deg) rotateY(${r.y}deg)`:'rotateX(0deg) rotateY(0deg)';
   turn=M.spring(rotor,p=>{const q=flipped?p:1-p;return{transform:`rotateX(${r.x*q}deg) rotateY(${r.y*q}deg)`};},{name:'snappy',duration:690});
  }
  peek.addEventListener('click',flip);
  stage.addEventListener('keydown',e=>{if(e.key==='Escape'&&flipped){e.preventDefault();flip();peek.focus({preventScroll:true});}});
  stage.addEventListener('pointerenter',e=>{if(!flipped){const b=stage.getBoundingClientRect();edge=entryEdge(e.clientX-b.left,e.clientY-b.top,b.width,b.height);}});
  stage.addEventListener('pointermove',e=>{
   if(!fine.matches||!M.available())return;cancelAnimationFrame(raf);
   const x=e.clientX,y=e.clientY;raf=requestAnimationFrame(()=>{const b=stage.getBoundingClientRect(),nx=clamp((x-b.left)/b.width),ny=clamp((y-b.top)/b.height);stage.style.setProperty('--tilt-x',`${(ny-.5)*-4}deg`);stage.style.setProperty('--tilt-y',`${(nx-.5)*4}deg`);stage.style.setProperty('--shine-x',`${nx*100}%`);stage.style.setProperty('--shine-y',`${ny*100}%`);});
  });
  const reset=()=>{cancelAnimationFrame(raf);stage.style.setProperty('--tilt-x','0deg');stage.style.setProperty('--tilt-y','0deg');};
  stage.addEventListener('pointerleave',reset);M.onStop(reset);
  $('[data-case]',tile)?.addEventListener('click',()=>{origin=stage.getBoundingClientRect();},{capture:true});
 });
 const dialog=$('#case-dialog'),close=$('#dialog-close');if(!dialog||!close)return;
 let allowClose=false,closing=false;
 function animateClose(e){
  if(allowClose||!dialog.open||M.paused())return;
  e?.preventDefault();e?.stopImmediatePropagation();if(closing)return;closing=true;
  const a=M.animate($('.dialog-layout',dialog),[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(22px) scale(.96)'}],{duration:230});
  const done=()=>{closing=false;allowClose=true;close.click();allowClose=false;};
  if(a)a.finished.catch(()=>{}).then(done);else done();
 }
 close.addEventListener('click',animateClose,true);dialog.addEventListener('cancel',animateClose,true);
 dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))animateClose(e);},true);
 new MutationObserver(()=>{
  if(!dialog.open)return;
  const b=dialog.getBoundingClientRect(),from=origin;
  if(from)M.spring($('.dialog-layout',dialog),p=>({opacity:clamp(p*1.8),transform:`translate(${(from.left-b.left)*(1-p)}px,${(from.top-b.top)*(1-p)}px) scale(${from.width/b.width+(1-from.width/b.width)*p},${from.height/b.height+(1-from.height/b.height)*p})`,transformOrigin:'0 0'}),{duration:600});
  $('.sm-case-thumbs',dialog)?.remove();
  $$('.dialog-kicker,.dialog-content h2,.dialog-content>p,.dialog-proof',dialog).forEach((n,i)=>rise(n,18,70+i*45));
 }).observe(dialog,{attributes:true,attributeFilter:['open','data-case']});
});

// R6: editorial-story.js owns the editorial scene and its controls.

mount('Experience',()=>{
 const frame=$('#immersive-frame');if(!frame)return;frame.classList.add('sm-interactive-experience');
 const preview=copy(`<div class="sm-experience"><div class="sm-device-tools"><span>EXPERIMENTE A INTERFACE</span><div role="group" aria-label="Formato da prévia"><button type="button" data-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-device="mobile" aria-pressed="false">Mobile</button></div></div><div class="sm-device" data-mode="desktop" data-tone="light"><div class="sm-browser-chrome"><span>● ● ●</span><span>casa costa / demonstração</span><span>↗</span></div><div class="sm-demo-nav"><strong>Casa Costa</strong><div role="group" aria-label="Navegação da prévia"><button type="button" data-demo-page="inicio" aria-pressed="true">Início</button><button type="button" data-demo-page="projeto" aria-pressed="false">Projeto</button></div></div><div class="sm-demo-body"><div class="sm-demo-picture"><img src="/assets/smiile-landscape.webp" alt="Casa Costa, conceito de arquitetura para demonstração da smiile" loading="lazy"><span>UM LUGAR PARA EXISTIR.</span></div><div class="sm-demo-copy"><small>ARQUITETURA / EXPERIÊNCIA</small><h3>Entre a casa<br>e o horizonte.</h3><p>Um refúgio imaginado entre a natureza e o tempo de estar presente.</p><button type="button" class="sm-demo-action">Conhecer o projeto <span>↗</span></button></div></div><div class="sm-demo-footer"><span>DEMONSTRAÇÃO SMIILE</span><div role="group" aria-label="Direção visual da prévia"><button type="button" data-tone="light" aria-pressed="true">Clara</button><button type="button" data-tone="dark" aria-pressed="false">Grafite</button></div></div></div><div class="sm-experience-note"><span>MUDE O FORMATO. EXPLORE AS PÁGINAS.</span><span>CASA COSTA / PROJETO CONCEITUAL</span></div></div>`);
 frame.append(preview);const device=$('.sm-device',preview);let activePage='inicio';
 const host=device.parentElement;
 const phone=createDeviceFrame({tone:'light',scheme:'light',time:'10:47',label:'Prévia interativa Casa Costa dentro do dispositivo metálico'});
 phone.root.classList.add('pf-experience-device');phone.root.hidden=true;host.append(phone.root);
 let insidePhone=false;
 function setDeviceMode(mobile){
  if(insidePhone===mobile)return;
  if(mobile){phone.screen.append(device);phone.root.hidden=false;}
  else{host.insertBefore(device,phone.root);phone.root.hidden=true;}
  insidePhone=mobile;
 }
 $$('[data-device]',preview).forEach(button=>button.addEventListener('click',()=>{
  const oldWidth=Math.max(1,device.getBoundingClientRect().width);
  device.dataset.mode=button.dataset.device;
  $$('[data-device]',preview).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  setDeviceMode(button.dataset.device==='mobile');
  if(!insidePhone&&M.available()){
   const nextWidth=Math.max(1,device.getBoundingClientRect().width);
   M.spring(device,p=>({transform:'scaleX('+(oldWidth/nextWidth+(1-oldWidth/nextWidth)*p)+')',transformOrigin:'50% 50%'}),{duration:530});
  }
  rise($('.sm-demo-copy',preview),14,90);
 }));
 function setPage(page){
  activePage=page;const isHome=page==='inicio';$$('[data-demo-page]',preview).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demoPage===page)));
  $('.sm-demo-copy h3',preview).innerHTML=isHome?'Entre a casa<br>e o horizonte.':'O espaço.<br>A experiência.';
  $('.sm-demo-copy p',preview).textContent=isHome?'Um refúgio imaginado entre a natureza e o tempo de estar presente.':'Luz natural, linhas abertas e materiais que aproximam a casa da paisagem.';
  $('.sm-demo-action',preview).innerHTML=isHome?'Conhecer o projeto <span>↗</span>':'Voltar ao início <span>↶</span>';
  preview.dataset.page=page;$('.sm-demo-picture>span',preview).textContent=isHome?'UM LUGAR PARA EXISTIR.':'LUZ · MATÉRIA · PAISAGEM';$('.sm-demo-picture img',preview).style.objectPosition=isHome?'50% 50%':'76% 50%';M.animate($('.sm-demo-picture img',preview),[{transform:'scale(1.12)',opacity:.6},{transform:'scale(1)',opacity:1}],{duration:700});rise($('.sm-demo-copy',preview),22);
 }
 $$('[data-demo-page]',preview).forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.demoPage)));
 $('.sm-demo-action',preview).addEventListener('click',()=>setPage(activePage==='inicio'?'projeto':'inicio'));
 $$('button[data-tone]',preview).forEach(b=>b.addEventListener('click',()=>{device.dataset.tone=b.dataset.tone;$('.df-screen',phone.root).dataset.scheme=b.dataset.tone==='dark'?'dark':'light';$('.df-home',phone.root).dataset.tone=b.dataset.tone==='dark'?'light':'dark';$$('button[data-tone]',preview).forEach(t=>t.setAttribute('aria-pressed',String(t===b)));rise($('.sm-demo-copy',preview),10);}));
});

// R6: platform panels own their transitions; do not stack a second spring.

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
 $$('.category-card').forEach(c=>{const flip=$('.category-flipper',c),front=$('.category-front',c),back=$('.category-back',c);if(!flip||!front||!back)return;function sync(){const open=c.classList.contains('is-flipped');front.inert=open;back.inert=!open;front.setAttribute('aria-hidden',String(open));back.setAttribute('aria-hidden',String(!open));}new MutationObserver(sync).observe(c,{attributes:true,attributeFilter:['class']});sync();});
});
document.documentElement.classList.add('sm-sections-ready');
