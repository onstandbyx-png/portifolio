/* Portfolio visual evidence: Fatos source photos + smiile previews.
   Sources have clear attribution; paid results are never invented. */
import {clamp,createMotion} from '../sections/motion.js';
import {createDeviceFrame} from './device-frame.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const motion=createMotion();
const make=markup=>{const tpl=document.createElement('template');tpl.innerHTML=markup.trim();return tpl.content.firstElementChild;};
const cards=[
 {id:'fatos',name:'Fatos Desconhecidos',label:'01 / EDITORIAL',category:'Conteúdo e redação',image:'/assets/portfolio/cena-desconhecidos.webp',title:'Curiosidade com contexto.',intro:'Pesquisa, pauta, roteiro e direção editorial.',proof:['Escolha do assunto','Roteiro e narrativa','Direção visual'],anchor:'#editorial'},
 {id:'ads',name:'Campanhas & Ads',label:'02 / MÍDIA',category:'Campanhas e anúncios',image:'/assets/portfolio/cena-negocios.webp',title:'Uma ideia. Mais de um formato.',intro:'Criação, configuração, veiculação e otimização são disciplinas distintas. A composição é um estudo visual.',proof:['Conceito e copy','Canais e formatos','Operação e mensuração'],anchor:'#laboratorio'},
 {id:'smiile',name:'smiile',label:'03 / EXPERIÊNCIA',category:'Sites e apps',image:'/assets/portfolio/smiile-architecture-coast.webp',title:'Uma interface que responde.',intro:'Direção visual, desenvolvimento e experiências responsivas, com exemplos navegáveis.',proof:['Site e aplicativo','Estados interativos','Desenvolvimento'],anchor:'#experiencias'},
 {id:'video',name:'Estúdio de movimento',label:'04 / MOTION',category:'Vídeo e interação',image:'/assets/portfolio/smiile-creative-studio.webp',title:'A ideia ganha movimento.',intro:'Textura em vídeo, tipografia, camada manipulável e transições interativas.',proof:['Vídeo e textura','Materialidade','Controle por toque'],anchor:'#estudio-interativo'}
];
function flipCard(card,open){
 card.classList.toggle('is-flipped',open);
 const front=$('.rx-front',card),back=$('.rx-back',card);
 front.inert=open;back.inert=!open;front.setAttribute('aria-hidden',String(open));back.setAttribute('aria-hidden',String(!open));
 $('[data-rx-flip]',card).setAttribute('aria-expanded',String(open));
}
function mountDeck(){
 const work=$('#trabalhos');if(!work)return null;
 const shell=make('<details id="colecao" class="rx-collection rx-collection-optional"><summary><span><small>EXPLORAÇÃO OPCIONAL</small><strong>Quatro disciplinas. Um processo criativo.</strong></span><span class="rx-collection-toggle" aria-hidden="true">+</span></summary><div class="rx-collection-body"><div class="rx-heading"><h2>Trabalhos com<br><em>histórias diferentes.</em></h2><p>Veja os materiais, vire os cartões e explore o projeto mais próximo do que você precisa.</p></div><div class="rx-collection-grid"><div class="rx-deck-info" aria-live="polite"><div class="rx-deck-info-index"></div><h3></h3><p></p><a class="rx-case-action" href="#editorial">Explorar trabalho ↗</a></div><div class="rx-stage-wrap"><div class="rx-deck-stage" tabindex="0" role="region" aria-roledescription="baralho" aria-label="Explorar quatro trabalhos"></div><div class="rx-deck-actions"><button class="rx-deck-arrow" type="button" data-rx-prev aria-label="Cartão anterior">‹</button><div class="rx-deck-pips" role="group" aria-label="Escolher cartão"></div><button class="rx-deck-arrow" type="button" data-rx-next aria-label="Próximo cartão">›</button></div><p class="rx-deck-counter" role="status"></p></div></div><p class="rx-deck-caption">USE AS SETAS, OS PONTOS OU UM GESTO HORIZONTAL. ROLE A PÁGINA NORMALMENTE.</p></div></details>');
 work.append(shell);
 const stage=$('.rx-deck-stage',shell),pips=$('.rx-deck-pips',shell),info=$('.rx-deck-info',shell);
 let selected=0,lastSwipe=0,drag=null;
 const built=cards.map((data,i)=>{
   const node=make('<article class="rx-deck-card" data-pos="0"><div class="rx-card-rotor"><div class="rx-face rx-front"><img class="rx-card-photo" alt="" decoding="async" loading="lazy"><span class="rx-card-wash" aria-hidden="true"></span><div class="rx-card-top"><span class="rx-card-avatar" aria-hidden="true"></span><span class="rx-card-profile"><strong></strong><span></span></span><span class="rx-card-serial"></span></div><div class="rx-card-bottom"><div class="rx-card-brandline"></div><h3 class="rx-card-title"></h3><p class="rx-card-foot"></p><button type="button" class="rx-open-back" data-rx-flip aria-expanded="false">Ver por dentro <span aria-hidden="true">↗</span></button></div></div><div class="rx-face rx-back"><div class="rx-back-header"><strong></strong><span></span></div><h4></h4><p></p><div class="rx-back-list"></div><button type="button" class="rx-return" data-rx-return>Voltar à capa <span aria-hidden="true">↶</span></button></div></div></article>');
   node.dataset.rxCard=data.id;node.style.setProperty('--rx-accent',i%2===0?'#56a1ff':'#b6da94');
   $('.rx-card-photo',node).src=data.image;$('.rx-card-photo',node).alt='Composição visual de '+data.name;
   $('.rx-card-profile strong',node).textContent=data.name;$('.rx-card-profile span',node).textContent='Material de origem identificado';
   $('.rx-card-avatar',node).textContent=data.name[0];$('.rx-card-serial',node).textContent='0'+(i+1)+'/04';
   $('.rx-card-title',node).textContent=data.title;$('.rx-card-foot',node).textContent=data.category;
   $('.rx-back-header strong',node).textContent=data.name;$('.rx-back-header span',node).textContent=data.label;
   $('.rx-back h4',node).textContent=data.intro;$('.rx-back>p',node).textContent='Consulte o trabalho para identificar a contribuição, o estado e as limitações.';
   $('.rx-back-list',node).replaceChildren(...data.proof.map((s,j)=>{let row=make('<span><b></b><span></span></span>');$('b',row).textContent='0'+(j+1);$('span',row).textContent=s;return row}));
   $('[data-rx-flip]',node).addEventListener('click',()=>{flipCard(node,true);$('[data-rx-return]',node).focus({preventScroll:true})});
   $('[data-rx-return]',node).addEventListener('click',()=>{flipCard(node,false);$('[data-rx-flip]',node).focus({preventScroll:true})});
   stage.append(node);return node;
 });
 const buttons=cards.map((x,i)=>{const b=make('<button type="button"></button>');b.textContent=String(i+1);b.setAttribute('aria-label','Selecionar '+x.name);b.addEventListener('click',()=>go(i));pips.append(b);return b;});
 function paint(){
   built.forEach((c,i)=>{const pos=(i-selected+built.length)%built.length;c.dataset.pos=String(pos);c.inert=pos!==0;c.setAttribute('aria-hidden',String(pos!==0));flipCard(c,false)});
   let data=cards[selected];$('.rx-deck-info-index',info).textContent=data.label;$('h3',info).textContent=data.title;$('p',info).textContent=data.intro;$('.rx-case-action',info).href=data.anchor;
   $('.rx-deck-counter',shell).textContent=(selected+1)+' de '+cards.length;buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===selected)));
 }
 function go(i){const next=(i+cards.length)%cards.length;if(next===selected)return;selected=next;paint();motion.spring(built[selected],p=>({opacity:clamp(p),transform:'translateY('+((1-p)*22)+'px) scale('+(.95+.05*p)+')'}),{duration:550})}
 $('[data-rx-prev]',shell).addEventListener('click',()=>go(selected-1));$('[data-rx-next]',shell).addEventListener('click',()=>go(selected+1));
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(selected+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(selected-1)}if(e.key==='Escape')flipCard(built[selected],false)});
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY}});
 stage.addEventListener('pointercancel',()=>drag=null);
 stage.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25){lastSwipe=performance.now();go(selected+(dx<0?1:-1))}});
 stage.addEventListener('click',e=>{if(performance.now()-lastSwipe<350)e.preventDefault()},true);
 paint();shell.dataset.ready='true';return shell;
}
function mountViewSwitcher(){
 const gal=$('#trabalhos .work-gallery');if(!gal)return;
 const ui=make('<div class="rx-view-controls"><span>Trabalhos selecionados</span><div class="rx-view-switch" role="group" aria-label="Visualização"><button type="button" data-rx-view="cards" aria-pressed="true">Cartões</button><button type="button" data-rx-view="table" aria-pressed="false">Tabela</button></div></div>');
 const table=make('<div class="rx-table-view" hidden><table><thead><tr><th>Projeto</th><th>Área</th><th>Referência</th><th>Explorar</th></tr></thead><tbody></tbody></table></div>');
 cards.forEach(data=>{const tr=make('<tr><td></td><td></td><td></td><td><a>Ver trabalho ↗</a></td></tr>');const t=$$('td',tr);t[0].textContent=data.name;t[1].textContent=data.category;t[2].textContent=data.intro;$('a',tr).href=data.anchor;$('tbody',table).append(tr)});
 gal.before(ui);gal.after(table);
 $$('[data-rx-view]',ui).forEach(b=>b.addEventListener('click',()=>{const isTable=b.dataset.rxView==='table';gal.hidden=isTable;table.hidden=!isTable;$$('[data-rx-view]',ui).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
}
function mountScrollFilm(){
 const anchor=$('#experiencias');if(!anchor)return null;
 const film=make('<section class="rx-film rv-reveal rx-evidence-film" id="narrativa-visual" data-phase="0" aria-labelledby="rx-evidence-title"><div class="rv-stage"><div class="rv-overline"><span>UMA IDEIA / FORMATOS DIFERENTES</span><span>REFERÊNCIAS ATUAIS · FATOS & SMIILE</span></div><div class="rv-compose"><span class="rv-copy rv-left">Uma <em>ideia.</em></span><div class="rv-window"></div><span class="rv-copy rv-right">Muitas <em>formas.</em></span></div><div class="rv-footer"><div class="rv-format-switch" role="group" aria-label="Explorar formatos"><button type="button" data-rx-film-to="0" aria-pressed="true"><span>01</span> Conteúdo</button><button type="button" data-rx-film-to="1" aria-pressed="false"><span>02</span> App</button><button type="button" data-rx-film-to="2" aria-pressed="false"><span>03</span> Vídeo</button></div><p class="rv-film-cue">ROLE PARA SE APROXIMAR · TOQUE PARA MUDAR A PEÇA</p></div></div></section>');
 anchor.before(film);
 const wrap=$('.rv-window',film),phone=createDeviceFrame({tone:'light',scheme:'dark',time:'10:09',label:'Mesmo dispositivo metálico interativo da smiile, com três peças de projetos recentes'});
 phone.root.classList.add('pf-film-device');wrap.append(phone.root);
 const inner=make('<div class="pf-film-inner"><img src="/assets/portfolio/cena-desconhecidos.webp" alt="Peça original da vertical Fatos Desconhecidos"><div class="pf-film-gradient"></div><div class="pf-film-copy"><small>FATOS / EDITORIAL</small><strong>Uma história chama atenção.</strong><p>Pesquisa, roteiro e direção visual.</p></div></div>');phone.screen.append(inner);
 const tabs=$$('[data-rx-film-to]',film);
 const data=[
  {image:'/assets/portfolio/cena-desconhecidos.webp',small:'FATOS / NARRATIVA',title:'Uma história chama atenção.',text:'Pesquisa, roteiro e direção visual.'},
  {image:'/assets/portfolio/smiile-architecture-coast.webp',small:'SMIILE / APP E SITE',title:'Uma ideia ganha forma.',text:'Interface responsiva e demonstração navegável.'},
  {image:'/assets/portfolio/smiile-creative-studio.webp',small:'VÍDEO / MOTION',title:'O movimento conta a história.',text:'Imagem, textura e interação.'}
 ];
 const img=$('img',inner),small=$('small',inner),title=$('strong',inner),desc=$('p',inner),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let active=0,visible=false,frame=0,clickedUntil=0;
 function set(i){active=i;film.dataset.phase=String(i);img.src=data[i].image;img.alt=data[i].title;small.textContent=data[i].small;title.textContent=data[i].title;desc.textContent=data[i].text;tabs.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));motion.animate(img,[{opacity:.4,transform:'scale(1.09)'},{opacity:1,transform:'scale(1)'}],{duration:410})}
 tabs.forEach(b=>b.addEventListener('click',()=>{clickedUntil=performance.now()+2400;set(Number(b.dataset.rxFilmTo))}));
 function update(){frame=0;if(!visible)return;const r=film.getBoundingClientRect(),travel=Math.max(1,film.offsetHeight-innerHeight),p=clamp(-r.top/travel),mobile=innerWidth<761;
  if(reduced.matches||motion.paused()){wrap.style.setProperty('--pf-film-scale','1');return}
  wrap.style.setProperty('--pf-film-scale',String(mobile?1:1+1.9*p*p));wrap.style.setProperty('--pf-film-opacity',String(clamp(1-.2*p)));
  if(!mobile&&performance.now()>clickedUntil){const next=p<.33?0:p<.66?1:2;if(next!==active)set(next);}
 }
 const req=()=>{if(!frame)frame=requestAnimationFrame(update)};
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)req()},{threshold:0}).observe(film);
 addEventListener('scroll',req,{passive:true});addEventListener('resize',req,{passive:true});
 reduced.addEventListener('change',req);set(0);film.dataset.ready='true';return film;
}

function mountSocial(){
 const panel=$('#panel-meta'),old=panel&&$('.mock-phone',panel);if(!panel||!old)return;
 const html=make('<div class="rx-instagram" role="region" aria-label="Carrossel editorial conceitual no formato de anúncio"><div class="rx-iphone"><div class="rx-iphone-inner"><div class="rx-device-status"><span>10:09</span><span class="rx-dynamic-island" aria-hidden="true"></span><span>▂ ▂ ▰</span></div><div class="rx-ig-topbar"><span>‹</span><strong>Posts</strong><span class="rx-follow">Estudo</span></div><div class="rx-ig-profile"><span class="rx-ig-avatar">F</span><div><b>fatosdesconhecidos</b><small>Estudo conceitual · não veiculado</small></div><span>≡</span></div><div class="rx-ig-photo"><img src="/assets/portfolio/cena-desconhecidos.webp" alt="Cena editorial do Ecossistema Fatos"><span class="rx-ig-count">1/3</span><div class="rx-ig-overlay"><small>FATOS / COMPOSIÇÃO VISUAL</small><h3>Uma história começa com uma pergunta.</h3></div><div class="rx-ig-nav"><button type="button" data-rx-social-prev aria-label="Imagem anterior">‹</button><button type="button" data-rx-social-next aria-label="Próxima imagem">›</button></div></div><div class="rx-ig-dots" role="group" aria-label="Selecionar imagem"><button type="button" data-rx-social="0" aria-current="true" aria-label="Imagem 1"></button><button type="button" data-rx-social="1" aria-current="false" aria-label="Imagem 2"></button><button type="button" data-rx-social="2" aria-current="false" aria-label="Imagem 3"></button></div><div class="rx-ig-actions"><span>♡ &nbsp; ◯ &nbsp; ↗</span><span>▯</span></div><p class="rx-ig-caption"><strong>fatosdesconhecidos</strong> Conteúdo, pesquisa e criatividade em uma sequência.</p><span class="rx-ig-date">ESTUDO DE FORMATO · NÃO PUBLICADO</span><div class="rx-ig-home"></div></div></div><p class="rx-social-caption">A EXPERIÊNCIA NA REDE É UMA CREDENCIAL, NÃO UMA OFERTA DE PUBLICAÇÃO</p></div>');
 old.replaceWith(html);
 // Reuse the approved metallic device geometry, not another simulated phone skin.
 const legacy=$('.rx-iphone',html),inner=$('.rx-iphone-inner',legacy);const phone=createDeviceFrame({tone:'dark',scheme:'dark',time:'10:09',label:'Exemplo de carrossel de conteúdo dentro do dispositivo metálico'});
 phone.root.classList.add('pf-social-device');legacy.replaceWith(phone.root);$('.rx-device-status',inner)?.remove();$('.rx-ig-home',inner)?.remove();phone.screen.append(inner);
 const slides=[
  {src:'/assets/portfolio/cena-desconhecidos.webp',headline:'Uma história começa com uma pergunta.',label:'FATOS DESCONHECIDOS / CONTEÚDO'},
  {src:'/assets/portfolio/cena-negocios.webp',headline:'O contexto muda a conversa.',label:'FATOS E NEGÓCIOS / CONTEXTO'},
  {src:'/assets/portfolio/cena-nerd.webp',headline:'O repertório cria novas possibilidades.',label:'FATOS NERD / NARRATIVA'}
 ];
 let ix=0;const img=$('.rx-ig-photo img',html),heading=$('.rx-ig-overlay h3',html),count=$('.rx-ig-count',html),small=$('.rx-ig-overlay small',html);
 function show(n){ix=(n+slides.length)%slides.length;img.src=slides[ix].src;img.alt='Composição visual de origem: '+slides[ix].label;heading.textContent=slides[ix].headline;small.textContent=slides[ix].label;count.textContent=(ix+1)+'/3';$$('[data-rx-social]',html).forEach((b,i)=>b.setAttribute('aria-current',String(i===ix)));motion.animate(img,[{opacity:.5,transform:'scale(1.07)'},{opacity:1,transform:'scale(1)'}],{duration:370})}
 $('[data-rx-social-prev]',html).addEventListener('click',()=>show(ix-1));$('[data-rx-social-next]',html).addEventListener('click',()=>show(ix+1));$$('[data-rx-social]',html).forEach(btn=>btn.addEventListener('click',()=>show(Number(btn.dataset.rxSocial))));
 let start=null;const area=$('.rx-ig-photo',html);area.style.touchAction='pan-y';area.addEventListener('pointerdown',e=>{if(!e.target.closest('button'))start={x:e.clientX,y:e.clientY}});area.addEventListener('pointerup',e=>{if(!start)return;let dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.25)show(ix+(dx<0?1:-1))});area.addEventListener('pointercancel',()=>start=null);html.dataset.ready='true';return html;
}
function init(){
 try{const one=mountDeck(),two=mountScrollFilm(),three=mountSocial();mountViewSwitcher();document.documentElement.dataset.rxShowcase=one&&two&&three?'ready':'partial'}
 catch(error){document.documentElement.dataset.rxShowcase='failed';console.error('Portfolio creative experience:',error)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
