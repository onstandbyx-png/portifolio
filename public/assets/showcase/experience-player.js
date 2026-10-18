/** Branded, operable creative storyboard inside the campaign page-peel.
 * Platform, placement and narrative frame are separate dimensions.
 * New sequences are labeled "Estudo conceitual", never client results.
 */
const photo='/assets/portfolio/smiile-architecture-coast.webp';
const trail='/assets/portfolio/recovered-smiile/landscape.webp';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defs={
 meta:{
  name:'Meta',placements:['Stories','Feed','Reels'],defaultPlacement:'Stories',
  frames:[
   {kicker:'01 · GANCHO',title:'Uma ideia merece sair do papel.',body:'O primeiro olhar transforma curiosidade em atenção.',image:photo},
   {kicker:'02 · DEMONSTRAÇÃO',title:'Do conceito à experiência.',body:'Uma interface, uma imagem e uma escolha concreta.',image:trail},
   {kicker:'03 · CONVITE',title:'Sua ideia ganha forma.',body:'Conheça as possibilidades do projeto.',image:photo}
  ]
 },
 google:{
  name:'Google Ads',placements:['Pesquisa','Display','YouTube'],defaultPlacement:'Pesquisa',
  frames:[
   {kicker:'01 · BUSCA',title:'Criação de site e aplicativo',body:'Uma intenção real é o ponto de entrada.',image:photo},
   {kicker:'02 · ANÚNCIO',title:'Dê vida ao próximo projeto',body:'Estudo de anúncio de pesquisa: solução, benefício e destino.',image:trail},
   {kicker:'03 · DESTINO',title:'A próxima etapa é uma experiência.',body:'A página de destino precisa cumprir a promessa.',image:photo}
  ]
 },
 tiktok:{
  name:'TikTok',placements:['In-Feed'],defaultPlacement:'In-Feed',
  frames:[
   {kicker:'01 · ABERTURA',title:'Uma ideia pode mudar tudo.',body:'Mensagem curta nos primeiros segundos.',image:trail},
   {kicker:'02 · EM USO',title:'Veja o que ela pode se tornar.',body:'A experiência aparece no próprio formato vertical.',image:photo},
   {kicker:'03 · PRÓXIMO PASSO',title:'Crie o próximo capítulo.',body:'Um convite único e claro.',image:trail}
  ]
 }
};
const pill=(label,active)=>'<button type="button" class="cx-placement" aria-pressed="'+String(active)+'" data-cx-placement="'+escape(label)+'">'+escape(label)+'</button>';
export function mountCampaignExperience(lab,underlay){
 if(!lab||!underlay||underlay.querySelector('.cx-player'))return null;
 const player=document.createElement('section');
 player.className='cx-player';player.dataset.noCardFlip='';
 player.setAttribute('aria-label','Demonstração conceitual da campanha');
 player.innerHTML=[
 '<header class="cx-header"><div><small>DEMONSTRAÇÃO INTERATIVA · ESTUDO CONCEITUAL</small><h3 data-cx-platform>Meta · Stories</h3></div>',
 '<button type="button" class="cx-playing" data-cx-play aria-label="Reproduzir sequência" aria-pressed="false">Reproduzir</button></header>',
 '<div class="cx-placements" role="group" aria-label="Formato do anúncio"></div>',
 '<div class="cx-stage" data-cx-stage tabindex="0" role="group" aria-label="Cena da campanha">',
 '<div class="cx-frame" data-cx-frame><div class="cx-progress" aria-hidden="true"><i data-cx-progress></i></div>',
 '<div class="cx-social-chrome" data-cx-chrome><b>smiile.</b><span>Estudo conceitual</span></div>',
 '<div class="cx-art"><img data-cx-image src="'+photo+'" alt="Estudo visual smiile" loading="lazy" decoding="async"></div>',
 '<div class="cx-overlay"><small data-cx-kicker></small><h4 data-cx-title></h4><p data-cx-body></p></div>',
 '<div class="cx-search" hidden data-cx-search><div class="cx-query"><span aria-hidden="true">⌕</span> criar site e aplicativo</div><small>Patrocinado · Estudo conceitual</small><h4 data-cx-search-title></h4><p data-cx-search-copy></p><span>Conhecer a solução ↗</span></div>',
 '<div class="cx-end-mark" aria-hidden="true">smiile.</div>',
 '</div><div class="cx-tap-regions" aria-hidden="true"><span>Anterior</span><span>Próximo</span></div></div>',
 '<div class="cx-transport"><button data-cx-prev type="button" aria-label="Voltar uma etapa">←</button>',
 '<span role="status" aria-live="polite" data-cx-status>01 / 03 · Gancho</span>',
 '<button data-cx-next type="button" aria-label="Avançar uma etapa">→</button>',
 '<button data-cx-replay type="button" aria-label="Reiniciar sequência">↻</button></div>',
 '<p class="cx-contribution">A plataforma altera o enquadramento, a hierarquia e a sequência, não apenas o logotipo.</p>'
 ].join('');
 underlay.insertBefore(player,underlay.querySelector('.sp-campaign-note-slot'));
 const $=s=>player.querySelector(s);
 const placements=$('.cx-placements'),stage=$('[data-cx-stage]'),frame=$('[data-cx-frame]');
 const play=$('[data-cx-play]'),status=$('[data-cx-status]');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 let platform='meta',placement='Stories',step=0,playing=false,raf=0,last=0,elapsed=0,visible=false;
 const duration=5000;
 const canPlay=()=>!reduce.matches&&!document.body.classList.contains('is-paused')&&!document.hidden&&visible&&lab.dataset.channel===platform;
 function stop(){
  playing=false;cancelAnimationFrame(raf);raf=0;
  play.setAttribute('aria-pressed','false');play.textContent='Reproduzir';play.setAttribute('aria-label','Reproduzir sequência');
 }
 function render(){
  const config=defs[platform],scene=config.frames[step];
  player.dataset.platform=platform;player.dataset.placement=placement.toLowerCase().replace(/[^a-z]/g,'-');
  player.dataset.frame=String(step);frame.dataset.placement=player.dataset.placement;
  $('[data-cx-platform]').textContent=config.name+' · '+placement;
  placements.innerHTML=config.placements.map(name=>pill(name,placement===name)).join('');
  $('[data-cx-kicker]').textContent=scene.kicker;
  $('[data-cx-title]').textContent=scene.title;
  $('[data-cx-body]').textContent=scene.body;
  $('[data-cx-image]').src=scene.image;
  $('[data-cx-search-title]').textContent=scene.title;
  $('[data-cx-search-copy]').textContent=scene.body;
  $('[data-cx-search]').hidden=!(platform==='google'&&placement==='Pesquisa');
  $('.cx-social-chrome').hidden=platform==='google'&&placement==='Pesquisa';
  $('[data-cx-prev]').disabled=step===0;
  $('[data-cx-next]').disabled=step===2;
  status.textContent=String(step+1).padStart(2,'0')+' / 03 · '+scene.kicker.slice(5);
  $('[data-cx-progress]').style.transform='scaleX('+Math.min(1,elapsed/duration)+')';
 }
 function move(to){stop();step=Math.max(0,Math.min(2,to));elapsed=0;render();}
 function tick(now){
  if(!playing)return;
  if(!canPlay()){stop();return;}
  elapsed=Math.min(duration,elapsed+Math.min(80,now-last));last=now;
  $('[data-cx-progress]').style.transform='scaleX('+(elapsed/duration)+')';
  if(elapsed===duration){if(step===2){stop();return;}step++;elapsed=0;render();}
  raf=requestAnimationFrame(tick);
 }
 play.addEventListener('click',()=>{
  if(playing){stop();return;}
  if(step===2&&elapsed>=duration){step=0;elapsed=0;render();}
  if(reduce.matches||document.body.classList.contains('is-paused')){move(step===2?0:step+1);return;}
  visible=visible||player.getClientRects().length>0;
  playing=true;play.textContent='Pausar';play.setAttribute('aria-pressed','true');play.setAttribute('aria-label','Pausar sequência');
  last=performance.now();raf=requestAnimationFrame(tick);
 });
 $('[data-cx-prev]').addEventListener('click',()=>move(step-1));
 $('[data-cx-next]').addEventListener('click',()=>move(step+1));
 $('[data-cx-replay]').addEventListener('click',()=>move(0));
 placements.addEventListener('click',event=>{
  const button=event.target.closest('[data-cx-placement]');if(!button)return;
  stop();placement=button.dataset.cxPlacement;elapsed=0;render();
 });
 stage.addEventListener('click',event=>{
  if(event.target.closest('a,button'))return;
  const box=stage.getBoundingClientRect();
  move(step+(event.clientX<box.left+box.width*.31?-1:1));
 });
 stage.addEventListener('keydown',event=>{
  if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
  event.preventDefault();move(step+(event.key==='ArrowRight'?1:-1));
 });
 // Direct interaction with the player owns its gestures; card and document
 // keep vertical native scrolling. Dragging inside never flips the outer paper.
 let pointer=null;
 stage.addEventListener('pointerdown',event=>{pointer={x:event.clientX,y:event.clientY};},{passive:true});
 stage.addEventListener('pointerup',event=>{
  if(!pointer)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;pointer=null;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){event.stopPropagation();move(step+(dx<0?1:-1));}
 },{passive:true});
 stage.addEventListener('pointercancel',()=>{pointer=null;},{passive:true});
 function syncChannel(){
  const name=lab.dataset.channel||'meta';
  if(!defs[name])return;
  if(platform!==name){stop();platform=name;placement=defs[name].defaultPlacement;elapsed=0;render();}
 }
 new MutationObserver(syncChannel).observe(lab,{attributes:true,attributeFilter:['data-channel']});
 new MutationObserver(()=>{if(document.body.classList.contains('is-paused'))stop();}).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(()=>{if(underlay.inert)stop();}).observe(underlay,{attributes:true,attributeFilter:['inert','aria-hidden']});
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible)stop();},{threshold:.02}).observe(player);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 reduce.addEventListener('change',()=>{if(reduce.matches)stop();});
 syncChannel();render();return {root:player,stop,reset:()=>move(0)};
}
