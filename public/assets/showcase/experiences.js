/* One direction, three proofs, one digital exploration. */
import {clamp,createMotion} from '../sections/motion.js';
import {sectionCopy} from '../content/portfolio-copy.js';
import {createDeviceFrame} from './device-frame.js';
import {mountScrollGallery,createChapterState,readingProgress,stableViewportHeight} from './scroll-gallery.js';
import {mountFatosDeck} from './fatos-deck.js';
import {mountSocialAds} from './social-ads.js';
import {mountEditorialStory} from './editorial-story.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const lines=value=>escape(value).replace(/\n/g,'<br>');
const make=markup=>{const tpl=document.createElement('template');tpl.innerHTML=markup.trim();return tpl.content.firstElementChild;};
const motion=createMotion();

function mountViewSwitcher(){
 const gal=$('#trabalhos .work-gallery');if(!gal)return;
 const copy=sectionCopy('trabalhos');
 const ui=make(`<div class="rx-view-controls"><span>${escape(copy.eyebrow)}</span><div class="rx-view-switch" role="group" aria-label="Visualização dos trabalhos"><button type="button" data-rx-view="cards" aria-pressed="true">${escape(copy.controls.viewCards)}</button><button type="button" data-rx-view="table" aria-pressed="false">${escape(copy.controls.viewTable)}</button></div></div>`);
 const table=make('<div class="rx-table-view" hidden><table><thead><tr><th>Projeto</th><th>Natureza</th><th>Contribuição</th><th>Explorar</th></tr></thead><tbody></tbody></table></div>');
 copy.cards.forEach(data=>{const tr=make('<tr><td></td><td></td><td></td><td><a></a></td></tr>'),cells=$$('td',tr);cells[0].textContent=data.label;cells[1].textContent=data.nature;cells[2].textContent=data.contribution;$('a',tr).href=data.href;$('a',tr).textContent=data.cta+' ↗';$('tbody',table).append(tr)});
 const container=gal.closest('.rg-scroll-shell')||gal;container.before(ui);container.after(table);
 $$('[data-rx-view]',ui).forEach(button=>button.addEventListener('click',()=>{const isTable=button.dataset.rxView==='table';container.hidden=isTable;table.hidden=!isTable;$$('[data-rx-view]',ui).forEach(item=>item.setAttribute('aria-pressed',String(item===button)));dispatchEvent(new Event('resize'))}));
}

function mountScrollFilm(){
 const anchor=$('#experiencias')||$('#sistemas');if(!anchor||$('#narrativa-visual'))return null;
 const copy=sectionCopy('narrativa-visual');
 const film=make(`<section class="rf-film rf-r6" id="narrativa-visual" data-phase="0" aria-labelledby="rx-evidence-title">
  <div class="rf-heading shell"><div><small>${escape(copy.eyebrow)}</small><h2 id="rx-evidence-title">${lines(copy.title)}</h2></div><p>${escape(copy.body)}</p></div>
  <div class="rf-stage"><div class="rf-camera"><div class="rf-world">
   <article class="rf-plane rf-cover" data-rf-plane="0" aria-label="Casa Costa: composição editorial"><img src="/assets/portfolio/smiile-architecture-coast.webp" alt="Casa entre a paisagem costeira e a vegetação" loading="lazy" decoding="async"><div class="rf-cover-top"><span>FORMA</span><span>CASA COSTA / 01</span></div><div class="rf-cover-copy"><small>ARQUITETURA PARA HABITAR</small><strong>O essencial<br>tem espaço.</strong><p>Luz natural, matéria e paisagem.</p></div></article>
   <div class="rf-plane rf-phone-plane" data-rf-plane="1"></div>
   <article class="rf-plane rf-web" data-rf-plane="2" aria-label="Casa Costa: direção visual do site"><div class="rf-web-chrome"><i></i><i></i><i></i><span>CASA COSTA / ESTUDO DE INTERFACE</span></div><div class="rf-web-nav"><strong>Casa Costa</strong><span>A casa &nbsp; · &nbsp; Galeria &nbsp; · &nbsp; Visita</span></div><div class="rf-web-hero"><img src="/assets/portfolio/smiile-architecture-coast.webp" alt="A arquitetura Casa Costa integrada ao horizonte" loading="lazy" decoding="async"><div class="rf-web-copy"><small>LUZ · MATÉRIA · PAISAGEM</small><strong>Mais perto<br>do mar.</strong><p>Um lugar para desacelerar.</p></div></div></article>
  </div></div><div class="rf-footer"><div class="rf-format-switch" role="group" aria-label="Formatos da composição Casa Costa">${copy.formats.map((label,i)=>`<button type="button" data-rx-film-to="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${escape(label)}</button>`).join('')}</div><div class="rf-caption"><p data-rf-status role="status" aria-live="polite">A composição editorial apresenta a identidade.</p><a href="${escape(copy.cta.href)}" data-product-target="site">${escape(copy.cta.label)} <span aria-hidden="true">↗</span></a></div><small class="rf-credit">${escape(copy.credit)}</small></div></div>
 </section>`);
 anchor.before(film);
 const phone=createDeviceFrame({tone:'light',scheme:'light',time:'10:09',label:'Casa Costa: composição social em um telefone'});
 phone.root.classList.add('rf-phone','pf-film-device');$('[data-rf-plane="1"]',film).append(phone.root);
 phone.screen.innerHTML='<div class="rf-phone-content"><div class="rf-phone-header"><b>f.</b><span><strong>forma.arquitetura</strong><small>Casa Costa · direção visual</small></span></div><div class="rf-phone-image"><img src="/assets/portfolio/smiile-architecture-coast.webp" alt="Enquadramento vertical da arquitetura Casa Costa" loading="lazy" decoding="async"><strong>Entre a casa<br>e a paisagem.</strong></div><div class="rf-phone-caption"><b>forma.arquitetura</b><p>O exterior também faz parte da casa.</p><span>CASA COSTA / DIREÇÃO VISUAL</span></div></div>';
 const world=$('.rf-world',film),camera=$('.rf-camera',film),planes=$$('[data-rf-plane]',film),tabs=$$('[data-rx-film-to]',film),status=$('[data-rf-status]',film),heading=$('.rf-heading',film),stage=$('.rf-stage',film);
 const state=createChapterState(3),small=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)'),revealed=new Set();
 const descriptions=['A composição editorial apresenta a identidade.','O mesmo conceito ganha enquadramento e mensagem próprios.','A direção visual continua em uma experiência navegável.'];
 let visible=false,frame=0,lastPhase=-1;
 const header=()=>small.matches?64:76;
 function paint(){
  const mobile=small.matches,paused=motion.paused(),natural=reduced.matches;
  film.classList.toggle('rf-natural',natural);film.dataset.paused=String(paused);film.dataset.mode=natural?'flow':'scroll';
  if(natural)film.style.removeProperty('--rf-art-height');
  else film.style.setProperty('--rf-art-height',`${Math.min(mobile?500:560,Math.max(180,camera.clientHeight-24))}px`);
  const progress=state.value,reading=readingProgress(progress),index=Math.round(progress),spacing=mobile?innerWidth*1.1:Math.min(950,innerWidth*.72);
  world.style.setProperty('--rf-camera-x',`${(1-reading)*spacing}px`);
  planes.forEach((plane,i)=>{
   const distance=i-reading,active=i===index;
   plane.style.setProperty('--rf-x',`${(i-1)*spacing}px`);
   plane.style.setProperty('--rf-z',`${paused?0:-Math.min(1,Math.abs(distance))*(mobile?32:110)}px`);
   plane.style.setProperty('--rf-ry',`${paused?0:clamp(distance,-1,1)*(mobile?-5:-11)}deg`);
   plane.style.setProperty('--rf-alpha',String(natural||active?1:.26));
   plane.classList.toggle('rf-in-focus',natural||active);plane.setAttribute('aria-hidden',String(!natural&&!active));
   const planeBox=plane.getBoundingClientRect();
   if(visible&&active&&(natural||Math.abs(distance)<.03)&&planeBox.top<stableViewportHeight()-80&&planeBox.bottom>header()&&!revealed.has(i)){
    revealed.add(i);plane.dataset.read='true';
    plane.querySelectorAll('.rf-cover-copy strong,.rf-phone-image strong,.rf-web-copy strong').forEach(title=>{const animation=motion.animate(title,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,delay:90});animation?.effect.updateTiming({fill:'backwards'});});
   }
  });
  tabs.forEach((tab,i)=>tab.setAttribute('aria-pressed',String(i===index)));
  if(index!==lastPhase){lastPhase=index;film.dataset.phase=String(index);film.dataset.format=String(index);status.textContent=descriptions[index];}
 }
 function update(){
  frame=0;if(!visible)return;
  film.style.setProperty('--rf-heading-height',`${heading.offsetHeight}px`);
  state.pause(motion.paused());
  if(reduced.matches){let nearest=0,distance=Infinity;planes.forEach((plane,i)=>{const r=plane.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-stableViewportHeight()/2);if(d<distance){distance=d;nearest=i}});state.choose(nearest)}
  else{const rect=film.getBoundingClientRect(),travel=Math.max(1,film.offsetHeight-heading.offsetHeight-stage.offsetHeight);state.scroll(clamp((header()-rect.top-heading.offsetHeight)/travel)*2)}
  paint();
 }
 const request=()=>{if(!frame)frame=requestAnimationFrame(update)};
 tabs.forEach(tab=>tab.addEventListener('click',()=>{
  const next=Number(tab.dataset.rxFilmTo),behavior=motion.paused()?'instant':'smooth';
  if(reduced.matches){planes[next].scrollIntoView({behavior,block:'center'});return;}
  const start=scrollY+film.getBoundingClientRect().top+heading.offsetHeight-header(),travel=film.offsetHeight-heading.offsetHeight-stage.offsetHeight;
  if(motion.paused()){state.choose(next);paint()}
  scrollTo({top:start+travel*next/2,behavior});
 }));
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request()},{rootMargin:'100px'}).observe(film);
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});small.addEventListener('change',request);reduced.addEventListener('change',request);
 new ResizeObserver(request).observe(heading);
 motion.onStop(()=>{state.pause(motion.paused());paint()});
 const pause=document.querySelector('.motion-toggle');if(pause)new MutationObserver(request).observe(pause,{attributes:true,attributeFilter:['aria-pressed']});
 film.style.setProperty('--rf-heading-height',`${heading.offsetHeight}px`);paint();film.dataset.ready='true';return film;
}
function init(){
 try{mountEditorialStory();const one=mountFatosDeck(),two=mountScrollFilm(),three=mountSocialAds();mountScrollGallery();mountViewSwitcher();document.documentElement.dataset.rxShowcase=one&&two&&three?'ready':'partial'}
 catch(error){document.documentElement.dataset.rxShowcase='failed';console.error('Portfolio creative experience:',error)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
