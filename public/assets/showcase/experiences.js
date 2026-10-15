/* Showcase interactions based on the source Fatos baralho, mobile social studio,
   and smiile "Uma ideia. Muitas formas." scroll stage. No account credentials or ad delivery. */
import {clamp,createMotion} from '../sections/motion.js';
import {createDeviceFrame} from './device-frame.js';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const motion=createMotion();
function parse(markup){const t=document.createElement('template');t.innerHTML=markup.trim();return t.content.firstElementChild;}
const materials=[
 {id:'editorial',name:'Fatos Desconhecidos',tag:'EDITORIAL / PESQUISA',series:'01',accent:'#338bfc',image:'/assets/showcase/scenes/materia-viva.svg',title:'Por que essa história merece atenção?',headline:'O trabalho começa pela pergunta.',description:'Pesquisa, recorte, roteiro e direção narrativa. Experiência editorial apresentada sem vender espaço na rede.',details:['Pesquisa e seleção de pauta','Gancho, texto e roteiro','Estrutura de carrossel e contexto'],cta:'Ver caso editorial',case:'fatos'},
 {id:'campanha',name:'Campanhas & Ads',tag:'CRIAÇÃO / MÍDIA PAGA',series:'02',accent:'#e48e61',image:'/assets/showcase/scenes/campanha.svg',title:'Uma ideia. Diferentes maneiras de comunicar.',headline:'Da ideia até a mensagem em circulação.',description:'Estratégia, criação, operação de mídia paga e páginas de campanha. Aqui, a composição é apenas um estudo visual.',details:['Conceito, copy e variações','Google, Meta e TikTok Ads','Mensuração e otimização'],cta:'Explorar laboratório',href:'#laboratorio'},
 {id:'digital',name:'smiile',tag:'INTERFACES / PRODUTO',series:'03',accent:'#aed4a0',image:'/assets/smiile-landscape.webp',title:'Uma ideia ganha forma quando você interage.',headline:'Do conceito à experiência digital.',description:'Sites, interfaces e sistemas demonstrados por experiências que respondem ao visitante.',details:['Estratégia e interface','Design mobile-first','Componentes e desenvolvimento'],cta:'Ver caso smiile',case:'smiile'},
 {id:'sistemas',name:'SOTA CI Intel',tag:'SISTEMAS / EVIDÊNCIAS',series:'04',accent:'#d5f29d',image:'/assets/showcase/scenes/sistemas.svg',title:'E se cada conclusão pudesse ser verificada?',headline:'O que não se vê sustenta o produto.',description:'Pesquisa estruturada, grafos de evidência e orquestração. O fluxo é didático, não uma consulta real.',details:['Entrada e origem','Evidência e relações','Dossiês com limites explícitos'],cta:'Conhecer o sistema',case:'ci'}
];
function buildCard(m,index){
 const card=document.createElement('article');card.className='rx-deck-card';card.dataset.rxCard=m.id;card.dataset.pos=String(index);
 card.style.setProperty('--rx-accent',m.accent);
 card.innerHTML=[
 '<div class="rx-card-rotor">',
 '<div class="rx-face rx-front">',
 '<img class="rx-card-photo" src="'+m.image+'" alt="" loading="'+(index?'lazy':'eager')+'" decoding="async">',
 '<span class="rx-card-wash" aria-hidden="true"></span>',
 '<div class="rx-card-top"><span class="rx-card-avatar" aria-hidden="true">'+(index<2?'F':index===2?'s':'C')+'</span>',
 '<span class="rx-card-profile"><strong>'+m.name+'</strong><span>Portfólio / experiência própria</span></span><span class="rx-card-serial">'+m.series+'/04</span></div>',
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
 const table=parse('<div class="rx-table-view" hidden><table><thead><tr><th scope="col">Projeto</th><th scope="col">Frente</th><th scope="col">O que demonstrar</th><th scope="col">Explorar</th></tr></thead><tbody><tr><td>Fatos Desconhecidos</td><td>Criação editorial</td><td>Pesquisa, redação e narrativa</td><td><a href="#colecao">Abrir o baralho ↗</a></td></tr><tr><td>smiile</td><td>Design e desenvolvimento</td><td>Interfaces, experiências e sistemas</td><td><a href="#experiencias">Explorar interface ↗</a></td></tr><tr><td>SOTA CI Intel / SH4</td><td>Pesquisa e engenharia</td><td>Rastreabilidade e execução estruturada</td><td><a href="#sistemas">Ver fluxo ↗</a></td></tr></tbody></table></div>');
 gallery.before(control);gallery.after(table);
 $$('[data-rx-view]',control).forEach(btn=>btn.addEventListener('click',()=>{
  const selected=btn.dataset.rxView==='table';gallery.hidden=selected;table.hidden=!selected;
  $$('[data-rx-view]',control).forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  motion.animate(selected?table:gallery,[{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:340});
 }));
}
function mountDeck(){
 const ref=$('#categorias');if(!ref)return;
 const shell=parse('<section class="rx-collection" id="colecao" aria-labelledby="rx-collection-title"><div class="rx-overline">03 / UMA COLEÇÃO PARA EXPLORAR</div><div class="rx-heading"><h2 id="rx-collection-title">A ideia muda.<br><em>O cuidado permanece.</em></h2><p>Um baralho de trabalhos inspirado nas interações reais do Ecossistema Fatos. Arraste, escolha ou vire cada peça para descobrir o processo.</p></div><div class="rx-collection-grid"><div class="rx-deck-info" aria-live="polite"><div class="rx-deck-info-index">01 / FORMATO</div><h3>O trabalho começa pela pergunta.</h3><p>Pesquisa, recorte e narrativa.</p><div class="rx-deck-callouts"><span>Pesquisa</span><span>Criação</span><span>Execução</span></div></div><div class="rx-stage-wrap"><div class="rx-deck-stage" role="region" aria-roledescription="baralho" aria-label="Quatro frentes e trabalhos do portfólio" tabindex="0"></div><div class="rx-deck-actions"><button class="rx-deck-arrow" data-rx-prev type="button" aria-label="Cartão anterior">‹</button><div class="rx-deck-pips" role="group" aria-label="Selecionar um cartão"></div><button class="rx-deck-arrow" data-rx-next type="button" aria-label="Próximo cartão">›</button></div><p class="rx-deck-counter" role="status">1 de 4</p></div></div><p class="rx-deck-caption">DESLIZE NA HORIZONTAL OU USE OS BOTÕES · ROLAGEM VERTICAL LIVRE · EXEMPLOS CONCEITUAIS IDENTIFICADOS</p></section>');
 ref.before(shell);const stage=$('.rx-deck-stage',shell),pips=$('.rx-deck-pips',shell),info=$('.rx-deck-info',shell);
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
 refresh();shell.dataset.ready='true';
 return shell;
}
/**
 * A cinematic aperture, NOT a smartphone. Native scroll owns progress;
 * the format buttons change the concept, never the scroll position state.
 */
function mountScrollFilm(){
 const ref=$('#experiencias');if(!ref)return null;
 const film=parse('<section class="rx-film rv-reveal" id="narrativa-visual" data-format="0" data-reveal-state="entry" aria-label="Uma ideia, muitas formas: janela cinematográfica que abre durante a rolagem"><div class="rv-stage"><div class="rv-overline"><span>DA IDEIA À EXPERIÊNCIA</span><span>CONTEÚDO · FORMATO · CONTEXTO</span></div><div class="rv-compose"><div class="rv-copy rv-left">Uma <em>ideia.</em></div><div class="rv-window" role="img" aria-label="Composição editorial Matéria viva"><img data-rv-image src="/assets/showcase/scenes/materia-viva.svg" alt="Ilustração botânica Matéria viva: folha verde com gotículas"/><div class="rv-image-shade" aria-hidden="true"></div><div class="rv-window-caption"><small data-rv-eyebrow>FATOS / EDITORIAL</small><strong data-rv-title>Matéria viva.</strong><p data-rv-description>Curiosidade como ponto de partida para uma boa história.</p></div></div><div class="rv-copy rv-right">Muitas <em>formas.</em></div></div><div class="rv-footer"><div class="rv-format-switch" role="group" aria-label="Escolher desdobramento da ideia"><button type="button" data-rx-film-to="0" aria-pressed="true"><span>01</span> Editorial</button><button type="button" data-rx-film-to="1" aria-pressed="false"><span>02</span> Contexto</button><button type="button" data-rx-film-to="2" aria-pressed="false"><span>03</span> Narrativa</button></div><p class="rv-film-cue">↓ Role para transformar a ideia. Toque para escolher o formato.</p></div></div></section>');
 ref.before(film);
 const stage=$('.rv-stage',film),windowEl=$('.rv-window',film),picture=$('[data-rv-image]',film),copy=$$('.rv-copy',film),buttons=$$('[data-rx-film-to]',film);
 const formats=[
  {image:'/assets/showcase/scenes/materia-viva.svg',alt:'Matéria viva, composição botânica original',eyebrow:'FATOS / EDITORIAL',title:'Matéria viva.',description:'Curiosidade como ponto de partida para uma boa história.'},
  {image:'/assets/showcase/scenes/contexto.svg',alt:'Contexto, representação de astronomia e conexões',eyebrow:'FATOS / PESQUISA',title:'Um olhar mais profundo.',description:'Fonte, pergunta e contexto dão sentido à descoberta.'},
  {image:'/assets/showcase/scenes/narrativa.svg',alt:'Narrativa, arte editorial em tons de terracota',eyebrow:'FATOS / NARRATIVA',title:'A descoberta vira história.',description:'Uma ideia se desdobra em formatos sem perder a mensagem.'}
 ];
 let active=0,visible=false,frame=0,currentProgress=0;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const smooth=p=>{const x=clamp(p);return x*x*(3-2*x);};
 function setFormat(i){
  active=clamp(i,0,formats.length-1);const scene=formats[active];
  picture.src=scene.image;picture.alt=scene.alt;
  windowEl.setAttribute('aria-label',scene.alt);
  $('[data-rv-eyebrow]',film).textContent=scene.eyebrow;
  $('[data-rv-title]',film).textContent=scene.title;
  $('[data-rv-description]',film).textContent=scene.description;
  film.dataset.format=String(active);
  buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===active)));
  if(!reduced.matches&&!motion.paused())motion.animate(picture,[{opacity:.48,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:420});
 }
 function paint(progress){
  currentProgress=clamp(progress);
  const opening=smooth(clamp((currentProgress-.10)/.72));
  const vw=window.innerWidth,vh=stage.clientHeight;
  const availableH=Math.max(360,vh-124),availableW=Math.max(210,vw-38);
  const finalW=Math.min(availableW,vw>900?980:Math.min(540,availableH*.81));
  const finalH=Math.min(availableH,vw>900?Math.min(560,availableH):Math.max(350,finalW*1.27));
  const firstW=vw>800?142:Math.max(76,Math.min(100,vw*.235)),firstH=firstW*1.72;
  const w=firstW+(finalW-firstW)*opening,h=firstH+(finalH-firstH)*opening;
  windowEl.style.width=w.toFixed(2)+'px';windowEl.style.height=h.toFixed(2)+'px';
  windowEl.style.borderRadius=(18-12*opening).toFixed(2)+'px';
  windowEl.style.setProperty('--rv-overlay',String(clamp((opening-.36)*2.4)));
  windowEl.style.setProperty('--rv-image-scale',String(1.08-.08*opening));
  copy.forEach(el=>{el.style.opacity=String(clamp(1-opening*3.1));el.style.pointerEvents=opening>.2?'none':'';});
  film.dataset.revealState=opening>.94?'open':opening<.05?'entry':'opening';
  film.style.setProperty('--rv-open-progress',String(opening));
 }
 function update(){
  frame=0;if(!visible||motion.paused())return;
  if(reduced.matches){paint(1);return;}
  const r=film.getBoundingClientRect(),travel=Math.max(1,film.offsetHeight-stage.offsetHeight);
  const stickyTop=parseFloat(getComputedStyle(stage).top)||0;
  paint(clamp((stickyTop-r.top)/travel));
 }
 const request=()=>{if(!frame)frame=requestAnimationFrame(update)};
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)request();},{threshold:0,rootMargin:'100px 0px'}).observe(film);
 addEventListener('scroll',request,{passive:true});
 addEventListener('resize',request,{passive:true});
 reduced.addEventListener('change',request);
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  setFormat(i);
  if(currentProgress<.74&&!reduced.matches){
   const top=scrollY+film.getBoundingClientRect().top;
   const travel=Math.max(1,film.offsetHeight-stage.offsetHeight);
   window.scrollTo({top:top+travel*.82,behavior:motion.paused()?'auto':'smooth'});
  }
 }));
 paint(reduced.matches?1:0);setFormat(0);film.dataset.ready='true';return film;
}
function mountSocial(){
 const panel=$('#panel-meta'),old=panel&&$('.mock-phone',panel);if(!panel||!old)return;
 const scene=parse('<div class="rx-instagram" role="region" aria-label="Estudo de publicação em formato social, não veiculada"><div class="rx-iphone"><div class="rx-iphone-inner"><div class="rx-device-status"><span>10:09</span><span class="rx-dynamic-island" aria-hidden="true"></span><span>▂ ▂ ▰</span></div><div class="rx-ig-topbar"><span>‹</span><strong>Posts</strong><span class="rx-follow">Seguir</span></div><div class="rx-ig-profile"><span class="rx-ig-avatar">F</span><div><b>fatosdesconhecidos <span aria-hidden="true">✦</span></b><small>Estudo autoral · não veiculado</small></div><span>≡</span></div><div class="rx-ig-photo"><img src="/assets/showcase/scenes/materia-viva.svg" alt="Composição botânica conceitual Matéria viva" loading="lazy"><span class="rx-ig-count">1/3</span><div class="rx-ig-overlay"><small>ESTUDO DE LINGUAGEM / FATOS</small><h3>Por que isso faz parte do seu dia?</h3></div><div class="rx-ig-nav"><button type="button" data-rx-social-prev aria-label="Imagem anterior">‹</button><button type="button" data-rx-social-next aria-label="Próxima imagem">›</button></div></div><div class="rx-ig-dots" role="group" aria-label="Selecionar quadro"><button type="button" data-rx-social="0" aria-current="true" aria-label="Imagem 1"></button><button type="button" data-rx-social="1" aria-current="false" aria-label="Imagem 2"></button><button type="button" data-rx-social="2" aria-current="false" aria-label="Imagem 3"></button></div><div class="rx-ig-actions"><span>♡ &nbsp; ◯ &nbsp; ↗</span><span>▯</span></div><p class="rx-ig-caption"><strong>fatosdesconhecidos</strong> O começo é uma pergunta. A narrativa organiza o contexto e o formato.</p><span class="rx-ig-date">ESTUDO CONCEITUAL / 2026</span><div class="rx-ig-home"></div></div></div><p class="rx-social-caption">ESTRUTURA DE POST SOCIAL · COMPOSIÇÃO AUTORAL · NÃO REPRESENTA MÍDIA VEICULADA</p></div>');
 old.replaceWith(scene);
 // Reuse the exact smiile metallic frame instead of maintaining a conflicting orange shell.
 const legacy=$('.rx-iphone',scene),inner=$('.rx-iphone-inner',legacy);
 const socialDevice=createDeviceFrame({tone:'dark',scheme:'dark',time:'10:09',label:'Dispositivo metálico com carrossel social interativo'});
 socialDevice.root.classList.add('pf-social-device');
 legacy.replaceWith(socialDevice.root);
 $('.rx-device-status',inner)?.remove();
 $('.rx-ig-home',inner)?.remove();
 socialDevice.screen.append(inner);
 const image=$('.rx-ig-photo img',scene),title=$('.rx-ig-overlay h3',scene),cap=$('.rx-ig-caption',scene),count=$('.rx-ig-count',scene);
 const slides=[
 {image:'/assets/showcase/scenes/materia-viva.svg',headline:'Por que isso faz parte do seu dia?',copy:'O começo é uma pergunta. A narrativa organiza o contexto e o formato.'},
 {image:'/assets/showcase/scenes/contexto.svg',headline:'Que pergunta revela o contexto?',copy:'Pesquisa e contexto sustentam o roteiro.'},
 {image:'/assets/showcase/scenes/narrativa.svg',headline:'Uma descoberta. Muitas formas.',copy:'Do primeiro gancho à narrativa completa, com uma identidade coerente.'}
 ];let selected=0;function show(i){selected=(i+slides.length)%slides.length;const s=slides[selected];image.src=s.image;image.alt='Arte editorial conceitual Fatos, quadro '+(selected+1);title.textContent=s.headline;cap.innerHTML='<strong>fatosdesconhecidos</strong> '+s.copy;count.textContent=(selected+1)+'/3';$$('[data-rx-social]',scene).forEach((n,j)=>n.setAttribute('aria-current',String(selected===j)));motion.animate(image,[{opacity:.4,transform:'scale(1.09)'},{opacity:1,transform:'scale(1)'}],{duration:480});}
 $('[data-rx-social-prev]',scene).addEventListener('click',()=>show(selected-1));$('[data-rx-social-next]',scene).addEventListener('click',()=>show(selected+1));
 $$('[data-rx-social]',scene).forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.rxSocial))));
 let pt=null;const screen=$('.rx-ig-photo',scene);screen.style.touchAction='pan-y';screen.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pt={x:e.clientX,y:e.clientY};});
 screen.addEventListener('pointerup',e=>{if(!pt)return;const dx=e.clientX-pt.x,dy=e.clientY-pt.y;pt=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.25)show(selected+(dx<0?1:-1));});screen.addEventListener('pointercancel',()=>{pt=null;});
 scene.dataset.ready='true';return scene;
}
function mount(){
 try{mountViewSwitcher();const deck=mountDeck(),film=mountScrollFilm(),social=mountSocial();document.documentElement.dataset.rxShowcase=deck&&film&&social?'ready':'partial';}
 catch(e){console.error('Showcase adaptation failed',e);document.documentElement.dataset.rxShowcase='failed';}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
