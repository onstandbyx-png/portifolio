import {createDeviceFrame} from '../showcase/device-frame.js';
import {createMotion,clamp,entryEdge,rotationForEdge,chapterAt,timelineStep} from './motion.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const M=createMotion(),fine=matchMedia('(hover:hover) and (pointer:fine)');
const copy=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content.firstElementChild;};
function cloneVisual(node){const c=node.cloneNode(true);c.removeAttribute('id');$$('[id]',c).forEach(n=>n.removeAttribute('id'));c.setAttribute('aria-hidden','true');c.inert=true;c.classList.add('sm-outgoing');return c;}
function rise(node,distance=24,delay=0){return M.spring(node,p=>({opacity:clamp(p),transform:`translateY(${distance*(1-p)}px)`}),{delay});}
function mount(name,fn){try{fn();document.documentElement.dataset[`sm${name}`]='ready';}catch(e){document.documentElement.dataset[`sm${name}`]='failed';console.error(`Seção ${name}:`,e);}}

mount('Works',()=>{
 const data={fatos:['Por trás da história.','Pesquisa, redação e direção editorial.','Pauta e recorte','Narrativa e roteiro','Aplicação visual'],smiile:['Por trás da interface.','Produto, design e desenvolvimento.','Direção de experiência','Estados de interação','Implementação frontend'],ci:['Por trás da evidência.','Pesquisa estruturada e engenharia.','Origem da informação','Relações e contexto','Síntese com limites']};
 let origin=null;
 $$('.work-tile').forEach((tile,i)=>{
  const kind=tile.dataset.workCard,details=data[kind];if(!details)return;
  const art=$('.tile-art',tile);if(!art)return;
  const stage=copy('<div class="sm-work-stage"><div class="sm-work-rotor"></div></div>');
  art.before(stage);const rotor=$('.sm-work-rotor',stage);rotor.append(art);art.classList.add('sm-work-front');
  const back=copy(`<div class="sm-work-back" id="sm-back-${kind}" aria-hidden="true"><span class="sm-overline">0${i+1} / PROCESSO E CONTRIBUIÇÃO</span><h3>${details[0]}</h3><p>${details[1]}</p><div class="sm-back-lines">${details.slice(2).map((v,j)=>`<span><i>0${j+1}</i>${v}</span>`).join('')}</div><small>Abra o case para conhecer o contexto e a minha contribuição.</small><span class="sm-back-sign">ideia ↗ execução.</span></div>`);
  back.inert=true;rotor.append(back);
  const peek=copy(`<button type="button" class="sm-work-peek" aria-expanded="false" aria-controls="sm-back-${kind}"><span>Ver bastidores</span><b aria-hidden="true">↶</b></button>`);stage.append(peek);
  stage.append(copy('<span class="sm-work-sheen" aria-hidden="true"></span>'));
  let edge='right',flipped=false,raf=0,turn=null;
  function flip(){
   turn?.cancel();flipped=!flipped;const r=rotationForEdge(edge);stage.dataset.face=flipped?'back':'front';
   peek.setAttribute('aria-expanded',String(flipped));$('span',peek).textContent=flipped?'Voltar à capa':'Ver bastidores';
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
   const x=e.clientX,y=e.clientY;raf=requestAnimationFrame(()=>{const b=stage.getBoundingClientRect(),nx=clamp((x-b.left)/b.width),ny=clamp((y-b.top)/b.height);stage.style.setProperty('--tilt-x',`${(ny-.5)*-7}deg`);stage.style.setProperty('--tilt-y',`${(nx-.5)*9}deg`);stage.style.setProperty('--shine-x',`${nx*100}%`);stage.style.setProperty('--shine-y',`${ny*100}%`);});
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

mount('Editorial',()=>{
 const feature=$('.editorial-feature'),page=$('.editorial-page'),buttons=$$('.editorial-step');
 if(!feature||!page||buttons.length!==3)return;
 const runway=document.createElement('div');runway.className='sm-editorial-runway pf-story-runway';feature.before(runway);runway.append(feature);runway.dataset.linked='false';
 page.classList.add('pf-new-device-stage');
 const stories=[
  {label:'01 / GANCHO',before:'Uma plataforma completa para sua equipe.',title:'Qual arquivo é o final_final?',reason:'Uma fricção reconhecível abre a conversa. O visitante entende o problema antes de conhecer o produto.',image:'/assets/creative/linha-campanha.svg'},
  {label:'02 / PROVA',before:'Mais controle para os seus projetos.',title:'Do briefing ao aprovado. No mesmo lugar.',reason:'A promessa ganha funções que podem ser exploradas: briefing, comentário e versão aprovada.',image:'/assets/creative/linha-interface.svg'},
  {label:'03 / AÇÃO',before:'Saiba mais.',title:'Explorar o fluxo.',reason:'Um próximo passo específico. A pessoa sabe o que encontrará ao clicar: uma demonstração do produto.',image:'/assets/creative/linha-campanha.svg'}
 ];
 const content='<div class="pf-story-screen pf-linha-studio" data-scene="0"><img class="pf-story-image" src="'+stories[0].image+'" alt="Direção de arte autoral LINHA"><div class="pf-story-profile"><b class="pf-story-avatar" aria-hidden="true">l</b><span><strong>LINHA / COPY EM AÇÃO</strong><small>Estudo autoral · produto fictício</small></span></div><div class="pf-copy-lab"><span class="pf-story-kicker">01 / GANCHO</span><div class="pf-copy-before"><small>RASCUNHO GENÉRICO</small><p>Uma plataforma completa para sua equipe.</p></div><div class="pf-copy-after"><small>COPY FINAL</small><h3 class="pf-story-title">Qual arquivo é o final_final?</h3></div><button type="button" class="pf-copy-decision" aria-expanded="false">Ver a decisão criativa <span aria-hidden="true">+</span></button><p class="pf-story-explain" hidden></p></div><div class="pf-story-lower"><small>PROBLEMA → PROVA → PRÓXIMO PASSO</small><div class="pf-story-progress" aria-hidden="true"><i></i></div></div><nav class="pf-story-controls" aria-label="Etapas da construção da copy"><button type="button" data-pf-prev aria-label="Capítulo anterior">‹</button><span data-pf-count>01 / 03</span><button type="button" data-pf-next aria-label="Capítulo seguinte">›</button></nav></div>';
 const device=createDeviceFrame({tone:'light',scheme:'dark',time:'10:47',label:'Estúdio interativo de copy LINHA: gancho, prova e ação',content});page.append(device.root);const shell=device.root;
 const strip=copy('<div class="sm-editorial-controls"><span class="sm-editorial-cue">COMPARE O RASCUNHO E A COPY FINAL</span><div role="group" aria-label="Navegar entre capítulos"><button type="button" data-story-prev aria-label="Capítulo anterior">←</button><span class="sm-story-count">01 / 03</span><button type="button" data-story-next aria-label="Próximo capítulo">→</button></div></div>');feature.append(strip);
 let active=0;
 function render(i){
  active=clamp(i,0,2);const story=stories[active];$('.pf-story-screen',shell).dataset.scene=String(active);
  const image=$('.pf-story-image',shell);image.src=story.image;image.alt='Estudo autoral LINHA: '+story.label;
  $('.pf-story-kicker',shell).textContent=story.label;$('.pf-copy-before p',shell).textContent=story.before;$('.pf-story-title',shell).textContent=story.title;$('.pf-story-explain',shell).textContent=story.reason;$('.pf-story-explain',shell).hidden=true;
  $('.pf-copy-decision',shell).setAttribute('aria-expanded','false');
  $('.pf-story-progress i',shell).style.transform='scaleX('+((active+1)/3)+')';$('[data-pf-count]',shell).textContent='0'+(active+1)+' / 03';$('.sm-story-count',strip).textContent='0'+(active+1)+' / 03';
  $('[data-story-prev]',strip).disabled=active===0;$('[data-story-next]',strip).disabled=active===2;$('[data-pf-prev]',shell).disabled=active===0;$('[data-pf-next]',shell).disabled=active===2;
  feature.style.setProperty('--story-progress',String((active+1)/3));rise($('.pf-copy-after',shell),10);
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>render(i),true));
 $('.pf-copy-decision',shell).addEventListener('click',e=>{const button=e.currentTarget,open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));$('.pf-story-explain',shell).hidden=!open;});
 $('[data-pf-prev]',shell).addEventListener('click',()=>buttons[Math.max(0,active-1)].click());$('[data-pf-next]',shell).addEventListener('click',()=>buttons[Math.min(2,active+1)].click());$('[data-story-prev]',strip).addEventListener('click',()=>buttons[Math.max(0,active-1)].click());$('[data-story-next]',strip).addEventListener('click',()=>buttons[Math.min(2,active+1)].click());
 const screen=$('.pf-story-screen',shell);let drag=null;screen.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY};});screen.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3)buttons[clamp(active+(dx<0?1:-1),0,2)].click();});screen.addEventListener('pointercancel',()=>{drag=null;});render(0);
});

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

mount('Ads',()=>{
 const tabs=$$('[data-ad-tab]'),right=$('.ads-right'),list=$('.ads-tablist');if(!right||!list||!tabs.length)return;
 const campaign={
  meta:{label:'FEED / CARROSSEL',title:'Um problema que dispensa apresentação.',copy:'Reconhecimento primeiro. Produto depois. A sequência conduz a uma demonstração que cumpre a promessa.',hook:'Qual arquivo é o final_final?',script:'Quadro 1: versões espalhadas. Quadro 2: briefing, comentário e aprovação juntos. Quadro 3: convite para experimentar.',cta:'Explorar o fluxo',reason:'A pergunta cria identificação. Em seguida, a peça mostra o que muda e oferece um próximo passo concreto.'},
  tiktok:{label:'VÍDEO / STORYBOARD 9:16',title:'A fricção vira demonstração.',copy:'Um roteiro de seis segundos: a confusão das versões dá lugar a um fluxo com começo, revisão e aprovação.',hook:'final_final_agora-vai.pdf?',script:'0–2 s: versões em conflito. 2–4 s: um comentário no lugar certo. 4–6 s: aprovação e convite para explorar.',cta:'Explorar o fluxo',reason:'A transição mostra a função do produto. Storyboard autoral: uma proposta de roteiro, anterior à produção audiovisual.'},
  google:{label:'BUSCA / INTENÇÃO',title:'A resposta cabe na intenção de busca.',copy:'Quem procura organizar a aprovação precisa entender a função do produto antes de clicar.',hook:'Aprovação criativa, do briefing à versão final.',script:'Busca: ferramenta para aprovação de peças. Título responde à necessidade; descrição explicita o fluxo; CTA abre a demonstração.',cta:'Explorar o fluxo',reason:'A copy evita uma promessa vaga de produtividade. Apresenta funções que a pessoa pode verificar na interface.'},
  chatgpt:{label:'CONTEXTO / DESCOBERTA',title:'Uma oferta ligada ao problema da conversa.',copy:'A mensagem apresenta o produto depois de estabelecer o contexto, com identificação clara de publicidade conceitual.',hook:'O feedback precisa estar perto da peça.',script:'Contexto: comentários em lugares diferentes. Orientação útil → proposta relacionada → demonstração opcional.',cta:'Explorar o fluxo',reason:'Relevância vem da relação com a necessidade. A oferta explica por que está ali e deixa a decisão com o visitante.'}
 };
 const brief=copy('<div class="sm-campaign-brief"><span>UM PRODUTO. UMA OFERTA. QUATRO FORMATOS.</span><strong>LINHA</strong><p>Do briefing ao aprovado. No mesmo lugar.</p><small>Estudo autoral · produto fictício</small></div>');list.after(brief);
 Object.entries(campaign).forEach(([key,data])=>{
  const panel=$('#panel-'+key),aside=panel&&$('.mock-aside',panel);if(!aside)return;
  aside.dataset.linhaHost='';$('span',aside).textContent=data.label;$('h3',aside).textContent=data.title;$('p',aside).textContent=data.copy;
  const decision=copy('<details class="sm-creative-decision"><summary>Por dentro da criação <span aria-hidden="true">+</span></summary><dl><div><dt>Gancho</dt><dd>'+data.hook+'</dd></div><div><dt>Roteiro / estrutura</dt><dd>'+data.script+'</dd></div><div><dt>Próximo passo</dt><dd>'+data.cta+'</dd></div></dl><p>'+data.reason+'</p></details>');aside.append(decision);
  aside.append(copy('<button type="button" class="linha-primary linha-ad-cta" data-linha-open aria-expanded="false">Explorar o fluxo <span aria-hidden="true">→</span></button>'));
 });
 const search=$('.search-mock');if(search)search.innerHTML='<div class="search-mock-bar">ferramenta para aprovação de peças <span aria-hidden="true">⌕</span></div><div class="search-result"><small>Publicidade · estudo autoral</small><span>linha / aprovação criativa</span><h3>Do briefing ao aprovado. No mesmo lugar.</h3><p>Organize o briefing, revise com comentários e identifique a versão aprovada. Explore uma demonstração do fluxo LINHA.</p><div>Briefing · Revisão · Aprovação</div></div>';
 const contextual=$('.context-mock');if(contextual)contextual.innerHTML='<span>CONTEXTO / ESTUDO AUTORAL</span><p class="context-question">Como evitar que a equipe aprove uma versão e o cliente comente em outra?</p><div class="context-reply"><i aria-hidden="true">✳</i><p>Centralize a revisão em uma versão identificada. Mantenha os comentários junto da peça e registre a decisão de aprovação.</p></div><div class="context-sponsored"><small>Publicidade · produto fictício</small><h3>O feedback precisa estar perto da peça.</h3><p>LINHA reúne briefing, revisão e aprovação no mesmo fluxo. Veja como uma versão chega ao aprovado.</p><span>Explore a demonstração ao lado.</span></div>';
 const videoArt=$('.vertical-video img');if(videoArt){videoArt.src='/assets/creative/linha-campanha.svg';videoArt.alt='LINHA, direção de arte do storyboard de produto';}
 const videoMeta=$('.video-meta');if(videoMeta)videoMeta.textContent='LINHA / STORYBOARD · PRODUTO FICTÍCIO';
 const marker=copy('<span class="sm-tab-marker" aria-hidden="true"></span>');list.prepend(marker);list.classList.add('sm-tabs-live');
 let from=0,ghost=null;const animations=[];
 function mark(tab){const a=tab.getBoundingClientRect(),b=list.getBoundingClientRect();marker.style.cssText=`width:${a.width}px;height:${a.height}px;transform:translate(${a.left-b.left}px,${a.top-b.top}px)`;}
 tabs.forEach((tab,i)=>tab.addEventListener('click',()=>{
  const current=$('.ad-panel:not([hidden])'),previous=from;from=i;ghost?.remove();animations.splice(0).forEach(a=>{try{a.cancel()}catch{}});const old=current?cloneVisual(current):null;
  queueMicrotask(()=>{
   mark(tab);const next=$('.ad-panel:not([hidden])');if(!next||next===current)return;stopStory();
   if(old&&M.available()){old.classList.add('sm-panel-out');old.style.top=$('.ads-preview-head').offsetHeight+'px';right.append(old);ghost=old;const a=M.animate(old,[{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${i>previous?-30:30}px) scale(.97)`}],{duration:300});if(a){animations.push(a);a.finished.catch(()=>{}).finally(()=>old.remove());}else old.remove();}
   const a=M.spring(next,p=>({opacity:clamp(p*1.8),transform:`translateX(${(i>previous?42:-42)*(1-p)}px) scale(${.96+.04*p})`}),{duration:620});if(a)animations.push(a);$$('.mock-aside>*',next).forEach((n,j)=>rise(n,16,80+j*45));
  });
 },true));
 requestAnimationFrame(()=>mark(tabs.find(t=>t.getAttribute('aria-selected')==='true')||tabs[0]));
 new ResizeObserver(()=>mark(tabs.find(t=>t.getAttribute('aria-selected')==='true')||tabs[0])).observe(list);
 const selectedTabObserver=new MutationObserver(()=>{const current=tabs.find(t=>t.getAttribute('aria-selected')==='true')||tabs[0];mark(current);if(current.dataset.adTab!=='tiktok')stopStory();});tabs.forEach(tab=>selectedTabObserver.observe(tab,{attributes:true,attributeFilter:['aria-selected']}));
 const video=$('.vertical-video'),play=$('[data-play-story]');let step=0,start=0,elapsed=0,raf=0,running=false;
 function stopStory(){
  if(running)elapsed=Math.min(6000,performance.now()-start);running=false;cancelAnimationFrame(raf);
  if(play){play.setAttribute('aria-pressed','false');play.innerHTML=M.paused()?'Próximo quadro <span>→</span>':elapsed>0&&elapsed<6000?'Continuar sequência <span>▶</span>':'Percorrer os quadros <span>▶</span>';}
 }
 if(!video||!play)return;
 const lines=['Qual é o<br>final_final?','Do briefing<br>ao aprovado.','No mesmo lugar.<br>Explore o fluxo.'];
 const controls=copy('<div class="sm-storyboard"><div class="sm-storyboard-title"><span>ROTEIRO EM 3 QUADROS</span><span data-frame-count role="status">01 / 03</span></div><div class="sm-storyboard-frames" role="group" aria-label="Quadros do roteiro LINHA"><button type="button" data-frame="0" aria-pressed="true"><b>01</b><span>Problema</span></button><button type="button" data-frame="1" aria-pressed="false"><b>02</b><span>Produto</span></button><button type="button" data-frame="2" aria-pressed="false"><b>03</b><span>Ação</span></button></div><p>Storyboard autoral. Etapa de criação anterior à produção.</p></div>');
 play.after(controls);video.append(copy('<div class="linha-video-stage" aria-hidden="true"></div>'));video.append(copy('<div class="sm-video-progress" aria-hidden="true"><i></i></div>'));
 function showFrame(index){
  if(index===step&&video.dataset.frame)return;step=index;video.dataset.frame=String(index);$('.video-text',video).innerHTML=lines[index];$('img',video).src=index===1?'/assets/creative/linha-interface.svg':'/assets/creative/linha-campanha.svg';$('.linha-video-stage',video).innerHTML=index===0?'<span class="linha-media-brand">linha.</span><div class="linha-file-pile"><span>v01 <b>final.pdf</b></span><span>v02 <b>final_final.pdf</b></span><span>v03 <b>final_agora-vai.pdf</b></span></div>':index===1?'<span class="linha-media-brand">linha.</span><div class="linha-media-review"><small>V03 / EM REVISÃO</small><strong>Do briefing<br>ao aprovado.</strong><p>● Traga o benefício para a primeira linha.</p></div>':'<span class="linha-media-brand">linha.</span><div class="linha-media-approved"><b>✓</b><strong>v03</strong><span>APROVADO</span></div>';
  $('[data-frame-count]',controls).textContent=`0${index+1} / 03`;$$('[data-frame]',controls).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.frame)===index)));
  M.animate($('img',video),[{transform:`scale(1.12) translateX(${index===1?-8:8}px)`},{transform:'scale(1) translateX(0)'}],{duration:1100});rise($('.video-text',video),20);
 }
 function tick(now){if(!running||!M.available()){stopStory();return;}elapsed=now-start;showFrame(timelineStep(elapsed,3,2000));$('.sm-video-progress i',video).style.transform=`scaleX(${clamp(elapsed/6000)})`;if(elapsed>=6000){stopStory();return;}raf=requestAnimationFrame(tick);}
 play.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(running){stopStory();return;}if(!M.available()){showFrame((step+1)%3);return;}if(elapsed>=6000)elapsed=0;running=true;start=performance.now()-elapsed;showFrame(timelineStep(elapsed,3,2000));play.setAttribute('aria-pressed','true');play.innerHTML='Pausar sequência <span>Ⅱ</span>';raf=requestAnimationFrame(tick);},true);
 $$('[data-frame]',controls).forEach(b=>b.addEventListener('click',()=>{stopStory();showFrame(Number(b.dataset.frame));elapsed=step*2000;$('.sm-video-progress i',video).style.transform=`scaleX(${step/3})`;stopStory();}));
 new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)stopStory();},{threshold:.01}).observe(video);
 M.onStop(()=>{stopStory();ghost?.remove();});showFrame(0);stopStory();
});

mount('Systems',()=>{
 const display=$('.system-display'),steps=$$('.system-step');if(!display||steps.length!==4)return;
 const board=copy(`<div class="sm-network" data-step="0"><div class="sm-network-label"><span>PESQUISA / DECISÃO</span><span>DEMONSTRAÇÃO INTERATIVA</span></div><svg viewBox="0 0 620 220" aria-hidden="true"><g class="sm-grid"><path d="M0 40H620M0 90H620M0 140H620M0 190H620M60 0V220M180 0V220M300 0V220M420 0V220M540 0V220"/></g><g class="sm-network-paths"><path data-link="1" d="M88 114C150 114 127 54 215 54" pathLength="1"/><path data-link="2" d="M245 54C315 54 285 142 369 142" pathLength="1"/><path data-link="3" d="M395 142C458 142 442 82 520 82" pathLength="1"/><path class="sm-branch" data-link="2" d="M215 75C245 140 262 196 368 165" pathLength="1"/></g><g class="sm-network-node" data-node="0" transform="translate(34 76)"><rect width="114" height="78" rx="13"/><text x="14" y="26">01 / ENTRADA</text><text class="sm-node-word" x="14" y="53">Pergunta</text></g><g class="sm-network-node" data-node="1" transform="translate(180 16)"><rect width="114" height="78" rx="13"/><text x="14" y="26">02 / FONTE</text><text class="sm-node-word" x="14" y="53">Evidência</text></g><g class="sm-network-node" data-node="2" transform="translate(330 108)"><rect width="114" height="78" rx="13"/><text x="14" y="26">03 / RELAÇÃO</text><text class="sm-node-word" x="14" y="53">Contexto</text></g><g class="sm-network-node" data-node="3" transform="translate(486 44)"><rect width="114" height="78" rx="13"/><text x="14" y="26">04 / SÍNTESE</text><text class="sm-node-word" x="14" y="53">Síntese</text></g></svg><div class="sm-network-footer"><span>ORIGEM → RELAÇÃO → CONCLUSÃO</span><button type="button" data-flow-play aria-pressed="false">Percorrer fluxo <span>▶</span></button></div></div>`);
 display.before(board);let active=0,timer=null,running=false,programmatic=false;const play=$('[data-flow-play]',board);
 function stop(){clearTimeout(timer);running=false;play.setAttribute('aria-pressed','false');play.innerHTML='Percorrer fluxo <span>▶</span>';}
 function setStep(i){
  active=i;board.dataset.step=String(i);
  $$('[data-node]',board).forEach((n,j)=>{n.classList.toggle('is-current',j===i);n.classList.toggle('is-complete',j<i);if(j===i)M.spring($('rect',n),p=>({opacity:clamp(p),transform:`scale(${.92+.08*p})`,transformOrigin:'center',transformBox:'fill-box'}),{duration:500});});
  $$('[data-link]',board).forEach(p=>{const on=Number(p.dataset.link)<=i;p.style.strokeDashoffset=on?'0':'1';if(on)M.animate(p,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:650});});
  $$('#system-step-label,#system-display-title,#system-display-copy').forEach((n,j)=>rise(n,15,40*j));
 }
 steps.forEach((s,i)=>s.addEventListener('click',()=>{if(!programmatic)stop();queueMicrotask(()=>setStep(i));}));
 function advance(i){if(!running||!M.available()){stop();return;}programmatic=true;steps[i].click();programmatic=false;if(i===3){stop();return;}timer=setTimeout(()=>advance(i+1),1500);}
 play.addEventListener('click',()=>{if(running){stop();return;}if(!M.available()){steps[(active+1)%4].click();return;}running=true;play.setAttribute('aria-pressed','true');play.innerHTML='Pausar percurso <span>Ⅱ</span>';advance(0);});
 new IntersectionObserver(([e])=>{if(!e.isIntersecting)stop();},{threshold:.05}).observe(board);M.onStop(stop);setStep(0);
});

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
 $$('.work-heading,.editorial-heading,.systems-copy,.contact-intro,.source-note').forEach(s=>reveal.observe(s));
 $$('.category-card').forEach(c=>{const flip=$('.category-flipper',c),front=$('.category-front',c),back=$('.category-back',c);if(!flip||!front||!back)return;function sync(){const open=c.classList.contains('is-flipped');front.inert=open;back.inert=!open;front.setAttribute('aria-hidden',String(open));back.setAttribute('aria-hidden',String(!open));}new MutationObserver(sync).observe(c,{attributes:true,attributeFilter:['class']});sync();});
});
document.documentElement.classList.add('sm-sections-ready');
