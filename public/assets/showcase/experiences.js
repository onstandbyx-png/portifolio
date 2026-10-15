/* Optional process collection, a concise narrative transition and an original campaign study. */
import {clamp,createMotion} from '../sections/motion.js';
import {createDeviceFrame} from './device-frame.js';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const motion=createMotion();
function parse(markup){const t=document.createElement('template');t.innerHTML=markup.trim();return t.content.firstElementChild;}
const materials=[
 {id:'editorial',name:'Narrativa editorial',tag:'PROCESSO / ESTUDO AUTORAL',series:'01',accent:'#338bfc',image:'/assets/creative/linha-campanha.svg',title:'Por que essa história merece atenção?',headline:'O trabalho começa pela pergunta.',description:'Trocar uma promessa genérica por uma fricção reconhecível. LINHA é um produto fictício que demonstra posicionamento, narrativa e copy.',details:['Problema e público','Gancho, texto e roteiro','Prova e próximo passo'],cta:'Ver caso editorial',case:'fatos'},
 {id:'campanha',name:'Campanhas & Ads',tag:'CRIAÇÃO / MÍDIA PAGA',series:'02',accent:'#e48e61',image:'/assets/creative/linha-interface.svg',title:'Uma ideia. Diferentes maneiras de comunicar.',headline:'Da ideia até a mensagem em circulação.',description:'Um conceito precisa funcionar no primeiro contato e no próximo clique. O laboratório LINHA explora a mensagem em quatro formatos.',details:['Conceito e promessa central','Copy adaptada ao contexto','Continuidade até o próximo passo'],cta:'Explorar laboratório',href:'#laboratorio'},
 {id:'digital',name:'smiile',tag:'INTERFACES / PRODUTO',series:'03',accent:'#aed4a0',image:'/assets/smiile-landscape.webp',title:'Uma ideia ganha forma quando você interage.',headline:'Do conceito à experiência digital.',description:'Direção visual e desenvolvimento se encontram em uma interface navegável. Casa Costa é uma demonstração de experiência da smiile.',details:['Estratégia e interface','Design mobile-first','Componentes e desenvolvimento'],cta:'Ver caso smiile',case:'smiile'},
 {id:'sistemas',name:'SOTA CI Intel',tag:'SISTEMAS / EVIDÊNCIAS',series:'04',accent:'#d5f29d',image:'/assets/creative/sistemas.svg',title:'E se cada conclusão pudesse ser verificada?',headline:'O que não se vê sustenta o produto.',description:'Pesquisa estruturada, grafos de evidência e orquestração. O fluxo é didático, não uma consulta real.',details:['Entrada e origem','Evidência e relações','Dossiês com limites explícitos'],cta:'Conhecer o sistema',case:'ci'}
];
function buildCard(m,index){
 const card=document.createElement('article');card.className='rx-deck-card';card.dataset.rxCard=m.id;card.dataset.pos=String(index);
 card.style.setProperty('--rx-accent',m.accent);
 card.innerHTML=[
 '<div class="rx-card-rotor">',
 '<div class="rx-face rx-front">',
 '<img class="rx-card-photo" src="'+m.image+'" alt="" loading="'+(index?'lazy':'eager')+'" decoding="async">',
 '<span class="rx-card-wash" aria-hidden="true"></span>',
 '<div class="rx-card-top"><span class="rx-card-avatar" aria-hidden="true">'+(index===0?'n':index===1?'m':index===2?'s':'C')+'</span>',
 '<span class="rx-card-profile"><strong>'+m.name+'</strong><span>Processo criativo / por dentro</span></span><span class="rx-card-serial">'+m.series+'/04</span></div>',
 '<div class="rx-card-bottom"><div class="rx-card-brandline"></div><h3 class="rx-card-title">'+m.title+'</h3>',
 '<p class="rx-card-foot">'+m.tag+'</p><button type="button" class="rx-open-back" data-rx-flip aria-expanded="false">Ver por dentro <span aria-hidden="true">↗</span></button></div>',
 '</div>',
 '<div class="rx-face rx-back" aria-hidden="true"><div class="rx-back-header"><strong>'+m.name+'</strong><span>'+m.series+' / ESTRUTURA</span></div>',
 '<h4>'+m.headline+'</h4><p>'+m.description+'</p>',
 '<div class="rx-back-list">'+m.details.map((v,j)=>'<span><b>0'+(j+1)+'</b>'+v+'</span>').join('')+'</div>',
 '<button class="rx-return" type="button" data-rx-return>Voltar à capa <span>↶</span></button></div></div>'
 ].join('');
 return card;
}
function mountViewSwitcher(){
 const work=$('#trabalhos'),gallery=$('.work-gallery',work);if(!work||!gallery)return;
 const control=parse('<div class="rx-view-controls"><span>Explorar projetos</span><div class="rx-view-switch" role="group" aria-label="Visualização dos trabalhos"><button type="button" aria-pressed="true" data-rx-view="cards">▣ &nbsp; Cartões</button><button type="button" aria-pressed="false" data-rx-view="table">▤ &nbsp; Tabela</button></div></div>');
 const table=parse('<div class="rx-table-view" hidden><table><thead><tr><th scope="col">Projeto</th><th scope="col">Frente</th><th scope="col">Contribuição</th><th scope="col">Explorar</th></tr></thead><tbody><tr><td>Fatos Desconhecidos</td><td>Direção criativa</td><td>Pesquisa, redação e narrativa</td><td><button type="button" data-rx-case="fatos">Abrir case <span aria-hidden="true">↗</span></button></td></tr><tr><td>smiile</td><td>Design e desenvolvimento</td><td>Interfaces, experiências e sistemas</td><td><button type="button" data-rx-case="smiile">Abrir case <span aria-hidden="true">↗</span></button></td></tr><tr><td>SOTA CI Intel / SH4</td><td>Pesquisa e engenharia</td><td>Rastreabilidade e execução estruturada</td><td><button type="button" data-rx-case="ci">Abrir case <span aria-hidden="true">↗</span></button></td></tr></tbody></table></div>');
 gallery.before(control);gallery.after(table);
 $$('[data-rx-case]',table).forEach(button=>button.addEventListener('click',()=>{const target=$('.work-tile [data-case="'+button.dataset.rxCase+'"]');target?.click();}));
 $$('[data-rx-view]',control).forEach(btn=>btn.addEventListener('click',()=>{
  const selected=btn.dataset.rxView==='table';gallery.hidden=selected;table.hidden=!selected;
  $$('[data-rx-view]',control).forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  motion.animate(selected?table:gallery,[{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:340});
 }));
}
function mountDeck(){
 const ref=$('#trabalhos');if(!ref)return;
 const shell=parse('<details class="rx-collection rx-collection-optional" id="colecao"><summary><span><small>BASTIDORES DA CRIAÇÃO</small><strong>O que conecta esses trabalhos?</strong></span><span class="rx-collection-toggle" aria-hidden="true">+</span></summary><div class="rx-collection-body"><div class="rx-heading"><h2 id="rx-collection-title">Uma direção.<br><em>Várias possibilidades.</em></h2><p>Vire as peças para conhecer as decisões por trás de cada frente.</p></div><div class="rx-collection-grid"><div class="rx-deck-info" aria-live="polite"><div class="rx-deck-info-index">01 / PROCESSO</div><h3>O trabalho começa pela pergunta.</h3><p>Pesquisa, recorte e narrativa.</p><div class="rx-deck-callouts"><span>Pesquisa</span><span>Criação</span><span>Execução</span></div></div><div class="rx-stage-wrap"><div class="rx-deck-stage" role="region" aria-roledescription="baralho" aria-label="Processo de criação em quatro frentes" tabindex="0"></div><div class="rx-deck-actions"><button class="rx-deck-arrow" data-rx-prev type="button" aria-label="Cartão anterior">‹</button><div class="rx-deck-pips" role="group" aria-label="Selecionar um cartão"></div><button class="rx-deck-arrow" data-rx-next type="button" aria-label="Próximo cartão">›</button></div><p class="rx-deck-counter" role="status">1 de 4</p></div></div><p class="rx-deck-caption">ESCOLHA UMA PEÇA. DESCUBRA O RACIOCÍNIO NO VERSO.</p></div></details>');
 ref.append(shell);const stage=$('.rx-deck-stage',shell),pips=$('.rx-deck-pips',shell),info=$('.rx-deck-info',shell);
 const cards=materials.map((v,i)=>buildCard(v,i));cards.forEach(card=>stage.append(card));
 let selected=0,flipped=false,busy=false,lastTouch=0;const pickbuttons=[];
 for(let i=0;i<materials.length;i++){const btn=document.createElement('button');btn.type='button';btn.textContent=String(i+1);btn.setAttribute('aria-label','Mostrar '+materials[i].name);btn.addEventListener('click',()=>navigate(i));pips.append(btn);pickbuttons.push(btn);}
 function setFlip(open){
  flipped=open;const card=cards[selected],front=$('.rx-front',card),back=$('.rx-back',card);
  card.classList.toggle('is-flipped',open);front.inert=open;back.inert=!open;
  front.setAttribute('aria-hidden',String(open));back.setAttribute('aria-hidden',String(!open));
  $('[data-rx-flip]',card).setAttribute('aria-expanded',String(open));
 }
 function refresh(){
  materials.forEach((m,i)=>{
   const card=cards[i],pos=(i-selected+cards.length)%cards.length;
   card.dataset.pos=String(pos);card.inert=pos!==0;card.setAttribute('aria-hidden',String(pos!==0));
   card.classList.remove('is-flipped');
   $('.rx-front',card).inert=pos!==0;$('.rx-back',card).inert=true;
   $('.rx-front',card).setAttribute('aria-hidden',String(pos!==0));$('.rx-back',card).setAttribute('aria-hidden','true');
   $('[data-rx-flip]',card).setAttribute('aria-expanded','false');
  });
  flipped=false;const m=materials[selected];
  $('.rx-deck-info-index',info).textContent=m.series+' / '+m.tag;
  $('h3',info).textContent=m.headline;$('p',info).textContent=m.description;
  pickbuttons.forEach((btn,i)=>btn.setAttribute('aria-current',String(i===selected)));
  $('.rx-deck-counter',shell).textContent=(selected+1)+' de '+materials.length;
 }
 function navigate(to){
  to=(to+materials.length)%materials.length;
  if(to===selected)return;
  // Interaction state must never depend on a decorative animation finishing.
  // A cancelled/background-throttled WAAPI animation previously blocked desktop navigation.
  setFlip(false);
  const previous=cards[selected],direction=(to-selected+materials.length)%materials.length<=2?-1:1;
  selected=to;
  refresh();
  const front=$('.rx-front',cards[selected]);
  if(motion.available()){
    motion.animate($('.rx-front',previous),[{opacity:1},{opacity:.42}],{duration:260});
    motion.spring(front,p=>({opacity:clamp(p*1.65),transform:'translateX('+(direction*32*(1-p))+'px) scale('+(.95+.05*p)+')'}),{name:'snappy',duration:640});
  }
 }
 cards.forEach((card,i)=>{
  $('[data-rx-flip]',card).addEventListener('click',()=>{if(selected!==i)return;setFlip(true);$('[data-rx-return]',card).focus({preventScroll:true});});
  $('[data-rx-return]',card).addEventListener('click',()=>{if(selected!==i)return;setFlip(false);$('[data-rx-flip]',card).focus({preventScroll:true});});
 });
 $('[data-rx-prev]',shell).addEventListener('click',()=>navigate(selected-1));
 $('[data-rx-next]',shell).addEventListener('click',()=>navigate(selected+1));
 stage.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();navigate(e.key==='Home'?0:e.key==='End'?3:selected+(e.key==='ArrowRight'?1:-1));}if(e.key==='Escape'&&flipped){setFlip(false);$('[data-rx-flip]',cards[selected]).focus({preventScroll:true});}});
 let start=null;
 function clearDrag(){stage.style.removeProperty('--rx-drag');stage.style.removeProperty('--rx-drag-rotation');stage.style.cursor='';}
 stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||busy)return;
  start={x:e.clientX,y:e.clientY,t:performance.now(),axis:null};
  if(e.pointerType==='mouse')stage.style.cursor='grabbing';
 });
 stage.addEventListener('pointermove',e=>{
  if(!start||busy)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;
  if(!start.axis&&Math.hypot(dx,dy)>12)start.axis=Math.abs(dx)>Math.abs(dy)*1.25?'horizontal':'vertical';
  if(start.axis!=='horizontal')return;
  const movement=clamp(dx/2.6,-84,84);
  stage.style.setProperty('--rx-drag',movement+'px');
  stage.style.setProperty('--rx-drag-rotation',(movement/21)+'deg');
 });
 stage.addEventListener('pointercancel',()=>{start=null;clearDrag();});
 stage.addEventListener('pointerup',e=>{
  if(!start){clearDrag();return;}
  const dx=e.clientX-start.x,dy=e.clientY-start.y,elapsed=performance.now()-start.t;start=null;
  clearDrag();
  if(Math.abs(dx)>58&&Math.abs(dx)>Math.abs(dy)*1.25){lastTouch=performance.now();navigate(selected+(dx<0?1:-1));}
 });
 stage.addEventListener('click',e=>{if(performance.now()-lastTouch<360)e.preventDefault();},true);
 function revealCollection(){if(location.hash==='#colecao')shell.open=true;} addEventListener('hashchange',revealCollection);revealCollection();
 refresh();shell.dataset.ready='true';
 return shell;
}
/** One working product concept connects the narrative and the campaign examples. */
let linhaInstance=0;
function createLinhaFlow(host,{onStep}={}){
 if(host._linhaFlow)return host._linhaFlow;
 const uid='linha-flow-'+(++linhaInstance);
 const flow=parse('<div class="linha-flow" id="'+uid+'" data-step="0" data-applied="false"><div class="linha-appbar"><strong>linha.</strong><span>ESTUDO AUTORAL · PRODUTO FICTÍCIO</span><i aria-hidden="true">l</i></div><div class="linha-project"><span>PROJETO / CAMPANHA 01</span><strong>Do briefing ao aprovado.</strong></div><div class="linha-step-tabs" role="group" aria-label="Etapas da demonstração LINHA"><button type="button" data-linha-step="0" aria-pressed="true">01 Briefing</button><button type="button" data-linha-step="1" aria-pressed="false">02 Revisão</button><button type="button" data-linha-step="2" aria-pressed="false">03 Aprovado</button></div><div class="linha-state" aria-live="polite"></div><div class="linha-flow-foot"><span>UMA VERSÃO. UM CONTEXTO.</span><span>LINHA / CONCEITO</span></div></div>');
 host.append(flow);let active=0,applied=false;
 const pane=$('.linha-state',flow);
 function setStep(i){
  active=clamp(Number(i),0,2);if(active===2)applied=true;
  flow.dataset.step=String(active);flow.dataset.applied=String(applied);
  $$('[data-linha-step]',flow).forEach((b,j)=>b.setAttribute('aria-pressed',String(j===active)));
  if(active===0)pane.innerHTML='<div class="linha-state-heading"><span class="linha-status">BRIEFING DEFINIDO</span><h3 tabindex="-1">Primeiro, a direção.</h3></div><dl class="linha-brief-fields"><div><dt>Para quem</dt><dd>Equipes criativas e seus clientes.</dd></div><div><dt>O problema</dt><dd>Feedback espalhado. Versões sem contexto.</dd></div><div><dt>A mensagem</dt><dd>Do briefing ao aprovado. No mesmo lugar.</dd></div></dl><button type="button" class="linha-primary" data-linha-next>Ver a peça em revisão <span aria-hidden="true">→</span></button>';
  if(active===1)pane.innerHTML='<div class="linha-state-heading"><span class="linha-status is-review">V03 / EM REVISÃO</span><h3 tabindex="-1">Um comentário. Uma decisão.</h3></div><div class="linha-creative"><small>PEÇA / ABERTURA DA CAMPANHA</small><strong>'+(applied?'Do briefing ao aprovado.<br>No mesmo lugar.':'Uma plataforma completa<br>para sua equipe.')+'</strong></div><div class="linha-comment"><b aria-hidden="true">D</b><div><strong>Direção criativa</strong><p>Trazer o benefício para a primeira linha.</p><button type="button" data-linha-apply '+(applied?'disabled':'')+'>'+(applied?'✓ Comentário resolvido':'Aplicar sugestão')+'</button></div></div><button type="button" class="linha-primary" data-linha-approve '+(applied?'':'disabled')+'>Aprovar v03 <span aria-hidden="true">→</span></button>';
  if(active===2)pane.innerHTML='<div class="linha-approved-mark" aria-hidden="true">✓</div><div class="linha-state-heading"><span class="linha-status">V03 / APROVADO</span><h3 tabindex="-1">A versão certa.<br>Para todo mundo.</h3></div><p class="linha-approved-copy">Briefing preservado, comentário resolvido e decisão registrada na mesma sequência.</p><div class="linha-history"><span>✓ Briefing alinhado</span><span>✓ Ajuste aplicado</span><span>✓ Versão aprovada</span></div><button type="button" class="linha-secondary" data-linha-reset>Recomeçar o fluxo <span aria-hidden="true">↶</span></button>';
  $('[data-linha-next]',pane)?.addEventListener('click',()=>{setStep(1);$('h3',pane)?.focus({preventScroll:true});});
  $('[data-linha-apply]',pane)?.addEventListener('click',()=>{applied=true;setStep(1);$('[data-linha-approve]',pane)?.focus({preventScroll:true});});
  $('[data-linha-approve]',pane)?.addEventListener('click',()=>{setStep(2);$('h3',pane)?.focus({preventScroll:true});});
  $('[data-linha-reset]',pane)?.addEventListener('click',()=>{applied=false;setStep(0);$('h3',pane)?.focus({preventScroll:true});});
  onStep?.(active);motion.animate(pane,[{opacity:.5,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:240});
 }
 $$('[data-linha-step]',flow).forEach(b=>b.addEventListener('click',()=>setStep(b.dataset.linhaStep)));
 const api={root:flow,setStep,focus:()=>{$('h3',pane)?.focus({preventScroll:true});}};host._linhaFlow=api;setStep(0);return api;
}
function mountLinhaEntries(){
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-linha-open]');if(!button)return;
  const host=button.closest('[data-linha-host]');if(!host)return;
  let destination=$('.linha-flow-destination',host);if(!destination){destination=document.createElement('div');destination.className='linha-flow-destination';host.append(destination);}
  const flow=createLinhaFlow(destination);destination.hidden=false;button.setAttribute('aria-expanded','true');button.setAttribute('aria-controls',flow.root.id);flow.focus();
  flow.root.scrollIntoView({block:'nearest',behavior:motion.paused()?'auto':'smooth'});
 });
}
function mountScrollFilm(){
 const ref=$('#experiencias');if(!ref)return null;
 const film=parse('<section class="rx-film rv-reveal rv-compact rv-linha" id="narrativa-visual" data-format="0" data-reveal-state="open" aria-labelledby="rv-title"><div class="rv-stage"><div class="rv-overline"><span>DA PROMESSA À PROVA</span><span>LINHA / PRODUTO CONCEITO</span></div><div class="rv-compose"><div class="rv-narrative"><span class="linha-kicker">ESTUDO AUTORAL · PRODUTO FICTÍCIO</span><h2 id="rv-title">A copy faz<br>uma promessa.<br><em>A interface entrega.</em></h2><p>“Do briefing ao aprovado. No mesmo lugar.” Explore o fluxo e veja uma mensagem virar uma experiência utilizável.</p><div class="linha-proof-points"><span>01 Alinhe o briefing</span><span>02 Resolva o comentário</span><span>03 Aprove a versão</span></div><a class="rv-context-link" href="#laboratorio">Ver como essa oferta muda de formato ↗</a></div><div class="rv-window linha-product-window" aria-label="Demonstração interativa LINHA"></div></div><div class="rv-footer"><div class="rv-format-switch" role="group" aria-label="Escolher etapa da demonstração LINHA"><button type="button" data-rx-film-to="0" aria-pressed="true"><span>01</span> Briefing</button><button type="button" data-rx-film-to="1" aria-pressed="false"><span>02</span> Revisão</button><button type="button" data-rx-film-to="2" aria-pressed="false"><span>03</span> Aprovado</button></div><p class="rv-film-cue">Na revisão, aplique o comentário e aprove a versão.</p></div></div></section>');
 ref.before(film);const buttons=$$('[data-rx-film-to]',film);
 const flow=createLinhaFlow($('.rv-window',film),{onStep:i=>{film.dataset.format=String(i);buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));}});
 buttons.forEach((b,i)=>b.addEventListener('click',()=>flow.setStep(i)));
 film.dataset.ready='true';return film;
}
function mountSocial(){
 const panel=$('#panel-meta'),old=panel&&$('.mock-phone',panel);if(!panel||!old)return;
 const scene=parse('<div class="rx-instagram" data-linha-host role="region" aria-label="Estudo de publicação em formato social, não veiculada"><div class="rx-iphone"><div class="rx-iphone-inner"><div class="rx-device-status"><span>10:09</span><span class="rx-dynamic-island" aria-hidden="true"></span><span>▂ ▂ ▰</span></div><div class="rx-ig-topbar"><span>‹</span><strong>Posts</strong><span class="rx-follow">Estudo</span></div><div class="rx-ig-profile"><span class="rx-ig-avatar">l</span><div><b>linha.estudo</b><small>Estudo autoral · produto fictício</small></div><span>≡</span></div><div class="rx-ig-photo"><img src="/assets/creative/linha-campanha.svg" alt="LINHA: campanha de produto conceitual" loading="lazy"><span class="rx-ig-count">1/3</span><div class="rx-ig-overlay"><small>LINHA / ESTUDO AUTORAL</small><h3>Qual arquivo é o final_final?</h3></div><div class="rx-ig-nav"><button type="button" data-rx-social-prev aria-label="Imagem anterior">‹</button><button type="button" data-rx-social-next aria-label="Próxima imagem">›</button></div></div><div class="rx-ig-dots" role="group" aria-label="Selecionar quadro"><button type="button" data-rx-social="0" aria-current="true" aria-label="Imagem 1"></button><button type="button" data-rx-social="1" aria-current="false" aria-label="Imagem 2"></button><button type="button" data-rx-social="2" aria-current="false" aria-label="Imagem 3"></button></div><div class="rx-ig-actions"><span>♡ &nbsp; ◯ &nbsp; ↗</span><span>▯</span></div><p class="rx-ig-caption"><strong>linha.estudo</strong> Versões soltas, feedback espalhado. A revisão pode ter um lugar.</p><span class="rx-ig-date">ESTUDO CONCEITUAL / 2026</span><div class="rx-ig-home"></div></div></div><p class="rx-social-caption">CARROSSEL / ESTUDO AUTORAL · PRODUTO FICTÍCIO</p><button type="button" class="linha-primary linha-social-cta" data-linha-open aria-expanded="false">Explorar o fluxo <span aria-hidden="true">→</span></button></div>');
 old.replaceWith(scene);
 // Reuse the exact smiile metallic frame instead of maintaining a conflicting orange shell.
 const legacy=$('.rx-iphone',scene),inner=$('.rx-iphone-inner',legacy);
 const socialDevice=createDeviceFrame({tone:'dark',scheme:'dark',time:'10:09',label:'Dispositivo metálico com carrossel social interativo'});
 socialDevice.root.classList.add('pf-social-device');
 legacy.replaceWith(socialDevice.root);
 $('.rx-device-status',inner)?.remove();
 $('.rx-ig-home',inner)?.remove();
 socialDevice.screen.append(inner);
 const mediaArt=parse('<div class="linha-feed-art" aria-hidden="true"></div>');$('.rx-ig-photo',scene).append(mediaArt);
 const image=$('.rx-ig-photo img',scene),title=$('.rx-ig-overlay h3',scene),cap=$('.rx-ig-caption',scene),count=$('.rx-ig-count',scene);
 const slides=[
 {image:'/assets/creative/linha-campanha.svg',headline:'Qual arquivo é o final_final?',copy:'Versões soltas, feedback espalhado. A revisão pode ter um lugar.'},
 {image:'/assets/creative/linha-campanha.svg',headline:'Do briefing ao aprovado.',copy:'Briefing, comentários e versão aprovada. No mesmo lugar.'},
 {image:'/assets/creative/linha-campanha.svg',headline:'No mesmo lugar.',copy:'Experimente o fluxo: revise uma peça e aprove a versão.'}
 ];let selected=0;function show(i){selected=(i+slides.length)%slides.length;const s=slides[selected];image.src=s.image;image.alt='';image.setAttribute('aria-hidden','true');mediaArt.innerHTML=selected===0?'<span class="linha-media-brand">linha.</span><div class="linha-file-pile"><span>v01 <b>final.pdf</b></span><span>v02 <b>final_final.pdf</b></span><span>v03 <b>final_agora-vai.pdf</b></span></div>':selected===1?'<span class="linha-media-brand">linha.</span><div class="linha-media-review"><small>V03 / EM REVISÃO</small><strong>Uma versão.<br>Um contexto.</strong><p>● Comentários junto da peça.</p></div>':'<span class="linha-media-brand">linha.</span><div class="linha-media-approved"><b>✓</b><strong>v03</strong><span>APROVADO</span></div>';image.style.objectPosition=['50% 50%','65% 35%','30% 65%'][selected];title.textContent=s.headline;cap.innerHTML='<strong>linha.estudo</strong> '+s.copy;count.textContent=(selected+1)+'/3';$$('[data-rx-social]',scene).forEach((n,j)=>n.setAttribute('aria-current',String(selected===j)));motion.animate(image,[{opacity:.4,transform:'scale(1.09)'},{opacity:1,transform:'scale(1)'}],{duration:480});}
 $('[data-rx-social-prev]',scene).addEventListener('click',()=>show(selected-1));$('[data-rx-social-next]',scene).addEventListener('click',()=>show(selected+1));
 $$('[data-rx-social]',scene).forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.rxSocial))));
 let pt=null;const screen=$('.rx-ig-photo',scene);screen.style.touchAction='pan-y';screen.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pt={x:e.clientX,y:e.clientY};});
 screen.addEventListener('pointerup',e=>{if(!pt)return;const dx=e.clientX-pt.x,dy=e.clientY-pt.y;pt=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.25)show(selected+(dx<0?1:-1));});screen.addEventListener('pointercancel',()=>{pt=null;});
 show(0);scene.dataset.ready='true';return scene;
}
function mount(){
 try{mountLinhaEntries();mountViewSwitcher();const deck=mountDeck(),film=mountScrollFilm(),social=mountSocial();document.documentElement.dataset.rxShowcase=deck&&film&&social?'ready':'partial';}
 catch(e){console.error('Showcase adaptation failed',e);document.documentElement.dataset.rxShowcase='failed';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
