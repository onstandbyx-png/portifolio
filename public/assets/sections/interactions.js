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
  const back=copy(`<div class="sm-work-back" id="sm-back-${kind}" aria-hidden="true"><span class="sm-overline">0${i+1} / PROCESSO E CONTRIBUIÇÃO</span><h3>${details[0]}</h3><p>${details[1]}</p><div class="sm-back-lines">${details.slice(2).map((v,j)=>`<span><i>0${j+1}</i>${v}</span>`).join('')}</div><small>Abra o estudo para ver materiais, contexto e limites.</small><span class="sm-back-sign">ideia ↗ execução.</span></div>`);
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
 dialog.addEventListener('click',e=>{if(e.target===dialog)animateClose(e);},true);
 new MutationObserver(()=>{
  if(!dialog.open)return;
  const b=dialog.getBoundingClientRect(),from=origin;
  if(from)M.spring($('.dialog-layout',dialog),p=>({opacity:clamp(p*1.8),transform:`translate(${(from.left-b.left)*(1-p)}px,${(from.top-b.top)*(1-p)}px) scale(${from.width/b.width+(1-from.width/b.width)*p},${from.height/b.height+(1-from.height/b.height)*p})`,transformOrigin:'0 0'}),{duration:600});
  const image=$('#dialog-image');if(image){
   $('.sm-case-thumbs',dialog)?.remove();
   if($('#dialog-kicker').textContent.includes('FATOS')){
    const list=copy('<div class="sm-case-thumbs" role="group" aria-label="Explorar materiais do Fatos"></div>');
    const sheets=[['Direção','fatos-editorial-detail.webp'],['Roteiro','fatos-roteiro.webp'],['Narrativa','fatos-narrativa-detail.webp']];
    sheets.forEach(([label,file],i)=>{const btn=copy(`<button type="button" aria-pressed="${i===0}">${label}</button>`);list.append(btn);btn.addEventListener('click',()=>{const img=$('img',image);if(img){img.src='/assets/'+file;img.alt='Material original Fatos: '+label;rise(img,12);}$$('button',list).forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));});});
    image.append(list);
   }
  }
  $$('.dialog-kicker,.dialog-content h2,.dialog-content>p,.dialog-proof',dialog).forEach((n,i)=>rise(n,18,70+i*45));
 }).observe(dialog,{attributes:true,attributeFilter:['open']});
});

mount('Editorial',()=>{
 const feature=$('.editorial-feature'),image=$('#editorial-image'),page=$('.editorial-page'),buttons=$$('.editorial-step');if(!feature||!page||!image||!buttons.length)return;
 const runway=document.createElement('div');runway.className='sm-editorial-runway';feature.before(runway);runway.append(feature);
 page.prepend(copy('<div class="sm-paper-fan" aria-hidden="true"><span></span><span></span></div>'));
 const strip=copy('<div class="sm-editorial-controls"><span class="sm-editorial-cue">ROLE PARA LER A HISTÓRIA ↓</span><div role="group" aria-label="Navegar entre capítulos"><button type="button" data-story-prev aria-label="Capítulo anterior">←</button><span class="sm-story-count">01 / 03</span><button type="button" data-story-next aria-label="Próximo capítulo">→</button></div></div>');feature.append(strip);
 let active=0,auto=false,lockedUntil=0,frame=0,outgoing=null,linked=false;
 function transition(i){
  if(i===active)return;const direction=i>active?1:-1;active=i;
  outgoing?.remove();outgoing=cloneVisual(image);page.append(outgoing);
  queueMicrotask(()=>{
   $('.sm-story-count',strip).textContent=`0${i+1} / 03`;
   $('[data-story-prev]',strip).disabled=i===0;$('[data-story-next]',strip).disabled=i===2;
   feature.style.setProperty('--story-progress',String((i+1)/3));
   const ghost=outgoing;const a=M.animate(ghost,[{opacity:1,transform:'translateX(0) rotate(0deg)'},{opacity:0,transform:`translateX(${-direction*55}px) rotate(${-direction*7}deg)`}],{duration:380});
   if(a)a.finished.catch(()=>{}).finally(()=>ghost?.remove());else ghost?.remove();
   M.spring(image,p=>({opacity:clamp(p*1.6),transform:`translateX(${direction*70*(1-p)}px) rotate(${direction*6*(1-p)}deg) scale(${.94+.06*p})`}),{duration:690});
   $$('#editorial-caption,#editorial-headline,#editorial-description').forEach((el,j)=>rise(el,17,45*j));
  });
 }
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{
  transition(i);
  if(linked&&!auto){lockedUntil=performance.now()+850;const top=scrollY+runway.getBoundingClientRect().top-84+(runway.offsetHeight-feature.offsetHeight)*(i+.1)/3;window.scrollTo({top,behavior:M.paused()?'auto':'smooth'});}
 },true));
 function go(i){buttons[clamp(i,0,2)]?.click();}
 $('[data-story-prev]',strip).disabled=true;
 $('[data-story-prev]',strip).addEventListener('click',()=>go(active-1));$('[data-story-next]',strip).addEventListener('click',()=>go(active+1));
 function measure(){linked=!M.paused()&&innerWidth>=1000&&innerHeight>=690;runway.dataset.linked=String(linked);runway.style.height=linked?`${feature.offsetHeight+innerHeight*1.3}px`:'auto';$('.sm-editorial-cue',strip).textContent=linked?'ROLE PARA LER A HISTÓRIA ↓':'EXPLORE OS CAPÍTULOS ↔';}
 function update(){frame=0;if(!linked||M.paused()||performance.now()<lockedUntil)return;const r=runway.getBoundingClientRect(),length=runway.offsetHeight-feature.offsetHeight;if(r.top>100||r.bottom<100)return;const next=chapterAt((84-r.top)/Math.max(1,length),3);if(next!==active){auto=true;buttons[next].click();auto=false;}}
 const request=()=>{if(!frame)frame=requestAnimationFrame(update);};
 addEventListener('scroll',request,{passive:true});addEventListener('resize',()=>{measure();request();},{passive:true});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{measure();request();});
 M.onStop(()=>{measure();outgoing?.remove();});
 const toggle=$('.motion-toggle');toggle&&new MutationObserver(()=>{measure();request();}).observe(toggle,{attributes:true,attributeFilter:['aria-pressed']});
 measure();new ResizeObserver(()=>{if(linked)runway.style.height=`${feature.offsetHeight+innerHeight*1.3}px`;}).observe(feature);
});

mount('Experience',()=>{
 const frame=$('#immersive-frame');if(!frame)return;frame.classList.add('sm-interactive-experience');
 const preview=copy(`<div class="sm-experience"><div class="sm-device-tools"><span>EXPERIMENTE A INTERFACE</span><div role="group" aria-label="Formato da prévia"><button type="button" data-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-device="mobile" aria-pressed="false">Mobile</button></div></div><div class="sm-device" data-mode="desktop" data-tone="light"><div class="sm-browser-chrome"><span>● ● ●</span><span>casa costa / prévia local</span><span>↗</span></div><div class="sm-demo-nav"><strong>Casa Costa</strong><div role="group" aria-label="Navegação da prévia"><button type="button" data-demo-page="inicio" aria-pressed="true">Início</button><button type="button" data-demo-page="projeto" aria-pressed="false">Projeto</button></div></div><div class="sm-demo-body"><div class="sm-demo-picture"><img src="/assets/smiile-landscape.webp" alt="Casa Costa, composição original demonstrada na smiile" loading="lazy"><span>UM LUGAR PARA EXISTIR.</span></div><div class="sm-demo-copy"><small>ARQUITETURA / EXPERIÊNCIA</small><h3>Entre a casa<br>e o horizonte.</h3><p>Imagem, mensagem e navegação trabalhando juntas.</p><button type="button" class="sm-demo-action">Conhecer o projeto <span>↗</span></button></div></div><div class="sm-demo-footer"><span>CONCEITO DA SMIILE</span><div role="group" aria-label="Direção visual da prévia"><button type="button" data-tone="light" aria-pressed="true">Clara</button><button type="button" data-tone="dark" aria-pressed="false">Grafite</button></div></div></div><div class="sm-experience-note"><span>MUDE O FORMATO. EXPLORE AS PÁGINAS.</span><span>INTERAÇÃO LOCAL / SEM ENVIO</span></div></div>`);
 frame.append(preview);const device=$('.sm-device',preview);let activePage='inicio';
 $$('[data-device]',preview).forEach(button=>button.addEventListener('click',()=>{
  const before=device.getBoundingClientRect();device.dataset.mode=button.dataset.device;$$('[data-device]',preview).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const after=device.getBoundingClientRect();M.spring(device,p=>({transform:`scaleX(${before.width/after.width+(1-before.width/after.width)*p})`,transformOrigin:'50% 50%'}),{duration:600});rise($('.sm-demo-copy',preview),14,90);
 }));
 function setPage(page){
  activePage=page;const isHome=page==='inicio';$$('[data-demo-page]',preview).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.demoPage===page)));
  $('.sm-demo-copy h3',preview).innerHTML=isHome?'Entre a casa<br>e o horizonte.':'O espaço.<br>A experiência.';
  $('.sm-demo-copy p',preview).textContent=isHome?'Imagem, mensagem e navegação trabalhando juntas.':'Uma demonstração de direção visual, leitura responsiva e navegação clara.';
  $('.sm-demo-action',preview).innerHTML=isHome?'Conhecer o projeto <span>↗</span>':'Voltar ao início <span>↶</span>';
  preview.dataset.page=page;M.animate($('.sm-demo-picture img',preview),[{transform:'scale(1.12)',opacity:.6},{transform:'scale(1)',opacity:1}],{duration:700});rise($('.sm-demo-copy',preview),22);
 }
 $$('[data-demo-page]',preview).forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.demoPage)));
 $('.sm-demo-action',preview).addEventListener('click',()=>setPage(activePage==='inicio'?'projeto':'inicio'));
 $$('button[data-tone]',preview).forEach(b=>b.addEventListener('click',()=>{device.dataset.tone=b.dataset.tone;$$('button[data-tone]',preview).forEach(t=>t.setAttribute('aria-pressed',String(t===b)));rise($('.sm-demo-copy',preview),10);}));
});

mount('Ads',()=>{
 const tabs=$$('[data-ad-tab]'),right=$('.ads-right'),list=$('.ads-tablist');if(!right||!list||!tabs.length)return;
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
 const video=$('.vertical-video'),play=$('[data-play-story]');let step=0,start=0,raf=0,running=false;
 function stopStory(){running=false;cancelAnimationFrame(raf);if(play){play.setAttribute('aria-pressed','false');play.innerHTML='Percorrer os quadros <span>▶</span>';}}
 if(!video||!play)return;
 const lines=['E se o óbvio tiver<br>uma história melhor?','Tudo começa<br>com a pergunta.','O contexto dá<br>sentido à resposta.'];
 const controls=copy('<div class="sm-storyboard"><div class="sm-storyboard-title"><span>ROTEIRO EM 3 QUADROS</span><span data-frame-count>01 / 03</span></div><div class="sm-storyboard-frames" role="group" aria-label="Quadros do roteiro"><button type="button" data-frame="0" aria-pressed="true"><b>01</b><span>Gancho</span></button><button type="button" data-frame="1" aria-pressed="false"><b>02</b><span>Contexto</span></button><button type="button" data-frame="2" aria-pressed="false"><b>03</b><span>Mensagem</span></button></div><p>Storyboard de imagens e texto. Não é uma campanha veiculada.</p></div>');
 play.after(controls);video.append(copy('<div class="sm-video-progress" aria-hidden="true"><i></i></div>'));
 function showFrame(index){
  if(index===step&&video.dataset.frame)return;step=index;video.dataset.frame=String(index);$('.video-text',video).innerHTML=lines[index];
  $('[data-frame-count]',controls).textContent=`0${index+1} / 03`;$$('[data-frame]',controls).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.frame)===index)));
  M.animate($('img',video),[{transform:`scale(1.12) translateX(${index===1?-8:8}px)`},{transform:'scale(1) translateX(0)'}],{duration:1100});rise($('.video-text',video),20);
 }
 function tick(now){if(!running||!M.available()){stopStory();return;}const elapsed=now-start;showFrame(timelineStep(elapsed,3));$('.sm-video-progress i',video).style.transform=`scaleX(${clamp(elapsed/4800)})`;if(elapsed>=4800){stopStory();return;}raf=requestAnimationFrame(tick);}
 play.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(running){stopStory();return;}if(!M.available()){showFrame((step+1)%3);return;}running=true;start=performance.now();showFrame(0);play.setAttribute('aria-pressed','true');play.innerHTML='Pausar sequência <span>Ⅱ</span>';raf=requestAnimationFrame(tick);},true);
 $$('[data-frame]',controls).forEach(b=>b.addEventListener('click',()=>{stopStory();showFrame(Number(b.dataset.frame));}));
 new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)stopStory();},{threshold:.01}).observe(video);
 M.onStop(()=>{stopStory();ghost?.remove();});showFrame(0);
});

mount('Systems',()=>{
 const display=$('.system-display'),steps=$$('.system-step');if(!display||steps.length!==4)return;
 const board=copy(`<div class="sm-network" data-step="0"><div class="sm-network-label"><span>CI / PROVENIÊNCIA</span><span>FLUXO DIDÁTICO</span></div><svg viewBox="0 0 620 220" aria-hidden="true"><g class="sm-grid"><path d="M0 40H620M0 90H620M0 140H620M0 190H620M60 0V220M180 0V220M300 0V220M420 0V220M540 0V220"/></g><g class="sm-network-paths"><path data-link="1" d="M88 114C150 114 127 54 215 54" pathLength="1"/><path data-link="2" d="M245 54C315 54 285 142 369 142" pathLength="1"/><path data-link="3" d="M395 142C458 142 442 82 520 82" pathLength="1"/><path class="sm-branch" data-link="2" d="M215 75C245 140 262 196 368 165" pathLength="1"/></g><g class="sm-network-node" data-node="0" transform="translate(34 76)"><rect width="114" height="78" rx="13"/><text x="14" y="26">01 / ENTRADA</text><text class="sm-node-word" x="14" y="53">Pergunta</text></g><g class="sm-network-node" data-node="1" transform="translate(180 16)"><rect width="114" height="78" rx="13"/><text x="14" y="26">02 / FONTE</text><text class="sm-node-word" x="14" y="53">Evidência</text></g><g class="sm-network-node" data-node="2" transform="translate(330 108)"><rect width="114" height="78" rx="13"/><text x="14" y="26">03 / RELAÇÃO</text><text class="sm-node-word" x="14" y="53">Contexto</text></g><g class="sm-network-node" data-node="3" transform="translate(486 44)"><rect width="114" height="78" rx="13"/><text x="14" y="26">04 / DOSSIÊ</text><text class="sm-node-word" x="14" y="53">Síntese</text></g></svg><div class="sm-network-footer"><span>ORIGEM → RELAÇÃO → CONCLUSÃO</span><button type="button" data-flow-play aria-pressed="false">Percorrer fluxo <span>▶</span></button></div></div>`);
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
 const notes=['Uma entrega definida, com escopo e revisão combinados.','Criação, mídia e desenvolvimento conectados pela mesma necessidade.','Uma colaboração contínua, com prioridades e responsabilidades claras.'];
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
