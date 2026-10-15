/* Portfolio visual evidence: Fatos source photos + smiile previews.
   Sources have clear attribution; paid results are never invented. */
import {clamp,createMotion} from '../sections/motion.js';
import {createDeviceFrame} from './device-frame.js';
import {mountScrollGallery,createChapterState,readingProgress,stableViewportHeight} from './scroll-gallery.js';
import {mountFatosDeck} from './fatos-deck.js';
import {mountSocialAds} from './social-ads.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const motion=createMotion();
const make=markup=>{const tpl=document.createElement('template');tpl.innerHTML=markup.trim();return tpl.content.firstElementChild;};
const cards=[
 {id:'fatos',name:'Fatos Desconhecidos',label:'01 / EDITORIAL',category:'Conteúdo e redação',image:'/assets/portfolio/cena-desconhecidos.webp',title:'Curiosidade com contexto.',intro:'Pesquisa, pauta, roteiro e direção editorial.',proof:['Escolha do assunto','Roteiro e narrativa','Direção visual'],anchor:'#editorial'},
 {id:'ads',name:'Campanhas & Ads',label:'02 / MÍDIA',category:'Campanhas e anúncios',image:'/assets/portfolio/cena-negocios.webp',title:'Uma ideia. Mais de um formato.',intro:'Criação, configuração, veiculação e otimização são disciplinas distintas. A composição é um estudo visual.',proof:['Conceito e copy','Canais e formatos','Operação e mensuração'],anchor:'#laboratorio'},
 {id:'smiile',name:'smiile',label:'03 / EXPERIÊNCIA',category:'Sites e apps',image:'/assets/portfolio/smiile-architecture-coast.webp',title:'Uma interface que responde.',intro:'Direção visual, desenvolvimento e experiências responsivas, com exemplos navegáveis.',proof:['Site e aplicativo','Estados interativos','Desenvolvimento'],anchor:'#experiencias'},
 {id:'video',name:'Direção e movimento',label:'04 / MOTION',category:'Vídeo e interação',image:'/assets/portfolio/smiile-creative-studio.webp',title:'A ideia ganha movimento.',intro:'Composição em profundidade, enquadramentos e transições guiadas pela rolagem.',proof:['Direção visual','Ritmo e composição','Controle por toque'],anchor:'#narrativa-visual'}
];
function mountViewSwitcher(){
 const gal=$('#trabalhos .work-gallery');if(!gal)return;
 const ui=make('<div class="rx-view-controls"><span>Trabalhos selecionados</span><div class="rx-view-switch" role="group" aria-label="Visualização"><button type="button" data-rx-view="cards" aria-pressed="true">Cartões</button><button type="button" data-rx-view="table" aria-pressed="false">Tabela</button></div></div>');
 const table=make('<div class="rx-table-view" hidden><table><thead><tr><th>Projeto</th><th>Área</th><th>Referência</th><th>Explorar</th></tr></thead><tbody></tbody></table></div>');
 cards.forEach(data=>{const tr=make('<tr><td></td><td></td><td></td><td><a>Ver trabalho ↗</a></td></tr>');const t=$$('td',tr);t[0].textContent=data.name;t[1].textContent=data.category;t[2].textContent=data.intro;$('a',tr).href=data.anchor;$('tbody',table).append(tr)});
 const container=gal.closest('.rg-scroll-shell')||gal;container.before(ui);container.after(table);
 $$('[data-rx-view]',ui).forEach(b=>b.addEventListener('click',()=>{const isTable=b.dataset.rxView==='table';container.hidden=isTable;table.hidden=!isTable;$$('[data-rx-view]',ui).forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}));
}
function mountScrollFilm(){
 const anchor=$('#experiencias');if(!anchor)return null;
 const film=make(`<section class="rx-film rf-film" id="narrativa-visual" data-phase="0" data-mode="scroll" aria-labelledby="rx-evidence-title">
  <div class="rf-heading"><div><small>CASA COSTA / DIREÇÃO VISUAL EM TRÊS FORMATOS</small><h2 id="rx-evidence-title">Uma ideia.<br><em>Muitas formas de chegar.</em></h2></div><p>A mesma arquitetura, uma identidade: capa editorial, publicação e site. Explore cada ponto de contato.</p></div>
  <div class="rf-stage"><div class="rf-camera"><div class="rf-world">
   <article class="rf-plane rf-cover" data-rf-plane="0" aria-label="Capa editorial Casa Costa"><img src="/assets/portfolio/smiile-architecture-coast.webp" alt="Casa junto à costa, integrada à vegetação" loading="lazy" decoding="async"><div class="rf-cover-top"><span>FORMA</span><span>CASA COSTA / 01</span></div><div class="rf-cover-copy"><small>ARQUITETURA PARA HABITAR</small><strong>O essencial<br>tem espaço.</strong><p>Luz natural, matéria e paisagem em uma mesma direção.</p></div></article>
   <div class="rf-plane rf-phone-plane" data-rf-plane="1"></div>
   <article class="rf-plane rf-web" data-rf-plane="2" aria-label="Composição do site Casa Costa"><div class="rf-web-chrome"><i></i><i></i><i></i><span>FORMA / CASA COSTA</span></div><div class="rf-web-nav"><strong>forma.</strong><span class="rf-nav-desktop">Arquitetura &nbsp; · &nbsp; Paisagem &nbsp; · &nbsp; Contato</span><span class="rf-nav-mobile">CASA COSTA / 01</span></div><div class="rf-web-hero"><div class="rf-web-copy"><small>CASA COSTA / ARQUITETURA</small><strong>Espaço para o essencial.</strong><p>Uma casa aberta à luz, ao tempo e à paisagem.</p><span>Conheça o projeto ↗</span></div><img src="/assets/portfolio/smiile-architecture-coast.webp" alt="Composição ampla da arquitetura Casa Costa" loading="lazy" decoding="async"></div></article>
  </div></div><div class="rf-footer"><div class="rf-format-switch" role="group" aria-label="Explorar composição de formatos"><button type="button" data-rx-film-to="0" aria-pressed="true">Visão geral</button><button type="button" data-rx-film-to="1" aria-pressed="false">Capa</button><button type="button" data-rx-film-to="2" aria-pressed="false">Social</button><button type="button" data-rx-film-to="3" aria-pressed="false">Site</button><button type="button" data-rx-film-to="4" aria-pressed="false">Conjunto</button></div><div class="rf-footer-line"><p data-rf-status role="status" aria-live="polite">Role para percorrer a composição.</p><a href="#sistemas" data-product-target="site">Explorar o site ↗</a></div></div></div>
 </section>`);
 anchor.before(film);
 const phone=createDeviceFrame({tone:'light',scheme:'light',time:'10:09',label:'Casa Costa: publicação social na moldura metálica da smiile'});
 phone.root.classList.add('rf-phone','pf-film-device');$('[data-rf-plane="1"]',film).append(phone.root);
 phone.screen.innerHTML='<div class="rf-phone-content"><div class="rf-phone-header"><b>f.</b><span><strong>forma.arquitetura</strong><small>Casa Costa · direção visual</small></span></div><div class="rf-phone-image"><img src="/assets/portfolio/smiile-architecture-coast.webp" alt="Casa Costa, adaptação vertical da mesma composição" loading="lazy" decoding="async"><strong>Entre a casa<br>e a paisagem.</strong></div><div class="rf-phone-caption"><span aria-hidden="true">♡ &nbsp; ◯ &nbsp; ↗</span><b>forma.arquitetura</b> Um projeto onde a natureza faz parte de cada escolha.</div></div>';
 const world=$('.rf-world',film),planes=$$('[data-rf-plane]',film),tabs=$$('[data-rx-film-to]',film),status=$('[data-rf-status]',film);
 const state=createChapterState(5),small=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let visible=false,frame=0,lastPhase=-1,natural=false;
 const lerp=(a,b,t)=>a+(b-a)*t;
 function paint(){
  const mobile=small.matches,paused=motion.paused();natural=stableViewportHeight()<700||reduced.matches;
  film.classList.toggle('rf-natural',natural);film.dataset.paused=String(paused);film.dataset.mode=natural?'flow':'scroll';
  const progress=state.value,segment=Math.min(3,Math.floor(progress));
  // Hold each reading state before the next camera movement. Reverse scroll
  // evaluates the same timeline, so planes never reset or jump to a timer.
  const e=readingProgress(progress)-segment,spacing=mobile?innerWidth*.92:430;
  const stops=mobile?[{x:spacing,scale:1,rx:0,ry:0,rz:0},{x:spacing,scale:1,rx:0,ry:0,rz:0},{x:0,scale:1,rx:0,ry:0,rz:0},{x:-spacing,scale:1,rx:0,ry:0,rz:0},{x:-spacing,scale:1,rx:0,ry:0,rz:0}]:[{x:0,scale:.73,rx:15,ry:-7,rz:-4},{x:spacing,scale:1,rx:0,ry:0,rz:0},{x:0,scale:1,rx:0,ry:0,rz:0},{x:-spacing,scale:1,rx:0,ry:0,rz:0},{x:0,scale:.73,rx:12,ry:7,rz:3}];
  const a=stops[segment],b=stops[segment+1],camera={};
  for(const key of ['x','scale','rx','ry','rz'])camera[key]=lerp(a[key],b[key],e);
  if(paused){camera.rx=0;camera.ry=0;camera.rz=0;}
  world.style.setProperty('--rf-camera-x',`${camera.x}px`);world.style.setProperty('--rf-camera-scale',String(camera.scale));
  world.style.setProperty('--rf-camera-rx',`${camera.rx}deg`);world.style.setProperty('--rf-camera-ry',`${camera.ry}deg`);world.style.setProperty('--rf-camera-rz',`${camera.rz}deg`);
  const index=Math.round(progress),overview=!mobile&&(index===0||index===4),focus=mobile?Math.max(0,Math.min(2,index-1)):Math.max(0,Math.min(2,index-1));
  planes.forEach((plane,i)=>{
   const distance=Math.abs(i-focus),active=overview||i===focus;
   plane.style.setProperty('--rf-x',`${(i-1)*spacing}px`);plane.style.setProperty('--rf-y','0px');
   plane.style.setProperty('--rf-z',`${overview?(i===1?55:-45):distance*-80}px`);
   plane.style.setProperty('--rf-ry',`${paused?0:overview?(i-1)*-13:mobile?0:(i-focus)*-9}deg`);
   plane.style.setProperty('--rf-blur',`${!mobile&&!active&&!paused?Math.min(2.5,distance*1.5):0}px`);
   plane.style.setProperty('--rf-alpha',String(active?1:mobile?.18:.4));
   plane.classList.toggle('rf-in-focus',natural||active);plane.setAttribute('aria-hidden',String(!natural&&!active));
   if(natural){const rect=plane.getBoundingClientRect(),height=stableViewportHeight(),offset=clamp((rect.top+rect.height/2-height/2)/height,-1,1);plane.style.setProperty('--rf-flow-angle',`${paused?0:offset*-5}deg`)}
  });
  if(index!==lastPhase){lastPhase=index;film.dataset.phase=String(index);film.dataset.format=String(index)}
  const selectedTab=mobile?Math.max(1,Math.min(3,index)):index;
  tabs.forEach((tab,i)=>{tab.hidden=mobile&&(i===0||i===4);tab.setAttribute('aria-pressed',String(i===selectedTab))});
  const message=natural?'Três formatos completos. Continue rolando.':paused?'Sem animação · role ou escolha um formato.':'Role para percorrer a composição.';
  if(status.textContent!==message)status.textContent=message;
 }
 function update(){
  frame=0;if(!visible)return;
  natural=stableViewportHeight()<700||reduced.matches;film.classList.toggle('rf-natural',natural);
  state.pause(motion.paused());
  if(natural){
   let nearest=0,distance=Infinity;planes.forEach((plane,i)=>{const rect=plane.getBoundingClientRect(),d=Math.abs(rect.top+rect.height/2-stableViewportHeight()/2);if(d<distance){distance=d;nearest=i}});state.choose(nearest+1);
  }else{
   const rect=film.getBoundingClientRect(),heading=$('.rf-heading',film).offsetHeight,header=small.matches?64:76;
   const travel=Math.max(1,film.offsetHeight-heading-$('.rf-stage',film).offsetHeight);
   state.scroll(clamp((header-rect.top-heading)/travel)*4);
  }
  paint();
 }
 const request=()=>{if(!frame)frame=requestAnimationFrame(update)};
 tabs.forEach(tab=>tab.addEventListener('click',()=>{
  const next=Number(tab.dataset.rxFilmTo),behavior=motion.paused()?'instant':'smooth';
  if(natural){planes[Math.max(0,Math.min(2,next-1))].scrollIntoView({behavior,block:'center'});return}
  const heading=$('.rf-heading',film).offsetHeight,header=small.matches?64:76,start=scrollY+film.getBoundingClientRect().top+heading-header;
  const travel=film.offsetHeight-heading-$('.rf-stage',film).offsetHeight;
  if(motion.paused()){state.choose(next);paint()}
  scrollTo({top:start+travel*next/4,behavior});
 }));
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()},{rootMargin:'150px'}).observe(film);
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
 reduced.addEventListener('change',request);small.addEventListener('change',request);
 motion.onStop(()=>{state.pause(motion.paused());paint()});
 const pause=document.querySelector('.motion-toggle');if(pause)new MutationObserver(request).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
 paint();film.dataset.ready='true';return film;
}

function mountSocial(){ return mountSocialAds(); }

function init(){
 try{const one=mountFatosDeck(),two=mountScrollFilm(),three=mountSocial();mountScrollGallery();mountViewSwitcher();document.documentElement.dataset.rxShowcase=one&&two&&three?'ready':'partial'}
 catch(error){document.documentElement.dataset.rxShowcase='failed';console.error('Portfolio creative experience:',error)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
