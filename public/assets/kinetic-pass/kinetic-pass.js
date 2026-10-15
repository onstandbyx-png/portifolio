/* A new, isolated portfolio study reconstructed from the supplied reference video.
   The pass, print, cutout, paper fold and depth view are real DOM/SVG/canvas layers.
   No third-party script, full-video embed, or remapping of other portfolio assets. */
import {WIDTH,HEIGHT,DURATION,clamp,ease,normalizeTitle,peelGeometry,points,polygonPath,sampleTimeline} from './kinetic-math.js';
import {createCurlRenderer} from './kinetic-curl.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const SHAPE='<svg xmlns="http://www.w3.org/2000/svg" width="300" height="500" viewBox="0 0 300 500"><defs><mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="500"><rect width="300" height="500" rx="19" fill="white"/><rect x="120" y="21" width="60" height="12" rx="6" fill="black"/><circle cx="0" cy="377" r="14" fill="black"/><circle cx="300" cy="377" r="14" fill="black"/></mask></defs><rect width="300" height="500" fill="white" mask="url(#cut)"/></svg>';
const parse=s=>{const t=document.createElement('template');t.innerHTML=s.trim();return t.content.firstElementChild;};
function printArtwork(){
 let wire='';
 // Two continuous curve families, following the dome/wire-grid in the source pass.
 for(let i=0;i<20;i++){
  const q=i/19;
  wire+='<path d="M '+(-135+q*660)+' 585 C '+(-72+q*470)+' '+(295-q*30)+' '+(65+q*150)+' '+(61+q*19)+' '+(381+q*54)+' '+(67+q*21)+'"/>';
  wire+='<path d="M -55 '+(190+q*381)+' C '+(40+q*15)+' '+(33+q*461)+' '+(221+q*65)+' '+(42+q*430)+' 365 '+(97+q*452)+'"/>';
 }
 let bars='',x=31;
 for(let i=0;i<113&&x<270;i++){const width=[1,2.4,.85,1.7,1,3.4,1.3][(i*7+i*i)%7];bars+='<rect x="'+x.toFixed(2)+'" y="414" width="'+width+'" height="39"/>';x+=width+[.8,1.3,2.2,.75][i%4];}
 let seal='';
 for(let ring=0;ring<4;ring++){
  let d='';for(let i=0;i<56;i++){const a=i*Math.PI*2/56+ring*.055,r=i%2?22+ring*.4:29-ring*.3;d+=(i?'L':'M')+(247+r*Math.cos(a)).toFixed(2)+' '+(259+r*Math.sin(a)).toFixed(2);}seal+='<path d="'+d+'Z" stroke="'+['#c4abdc','#cfb6df','#a7d2d7','#d1b38b'][ring]+'"/>';
 }
 return '<svg class="ks-print-art" viewBox="0 0 300 500" aria-hidden="true"><g stroke="#7c8181" stroke-width=".58" fill="none" opacity=".48">'+wire+'</g><g fill="white">'+bars+'</g><g class="ks-foil" fill="none" stroke-width=".62">'+seal+'<circle cx="247" cy="259" r="16" stroke="#c9b6e8"/><ellipse cx="247" cy="259" rx="7" ry="16" stroke="#c9b6e8"/><ellipse cx="247" cy="259" rx="16" ry="6" stroke="#9cdbe5"/><path d="M231 259H263M247 243V275" stroke="#d5c3e9"/></g><path d="M25 318H275" stroke="#aaa" opacity=".32" stroke-width=".6"/><path d="M14 377H286" stroke="#ccc" opacity=".36" stroke-width=".6" stroke-dasharray="2 2"/></svg><div class="ks-ink" aria-hidden="true"><div class="ks-pass-meta"><b>PASSE CRIATIVO</b><b>IDEIA → EXECUÇÃO</b></div><div class="ks-pass-name"><strong>ideia &amp; execução.</strong><span><b>ESTÚDIO</b><i>Design · Código · Movimento</i></span></div><div class="ks-pass-data"><span><small>CONCEITO</small><b>Clareza</b></span><span><small>PROCESSO</small><b>Interação</b></span><span><small>ENTREGA</small><b>Experiência</b></span></div><div class="ks-pass-serial"><span>Nº 0001</span><span>EXPLORE POR DENTRO</span></div></div>';

}
function mount(){
 if($('#estudio-interativo'))return;
 const anchor=$('#trabalhos');if(!anchor)return;
 const root=parse('<section id="estudio-interativo" class="ks-section" aria-labelledby="ks-title"><div class="ks-intro shell"><div><p class="ks-eyebrow">ESTÚDIO INTERATIVO / 01</p><h2 id="ks-title">A ideia tem <em>camadas.</em></h2></div><p>Uma peça para explorar de verdade. Incline, puxe o canto e descubra o que acontece entre o design e o código.</p></div><div class="ks-lab shell"><div class="ks-toolbar"><div class="ks-modes" role="group" aria-label="Modo de exploração"><button type="button" data-ks-mode="piece" aria-pressed="true">A peça</button><button type="button" data-ks-mode="layers" aria-pressed="false">Por dentro</button><button type="button" data-ks-mode="custom" aria-pressed="false">Personalizar</button></div><span class="ks-live"><i aria-hidden="true"></i> FEITO PARA INTERAGIR</span></div><div class="ks-stage" aria-label="Passe criativo com dobra interativa e quatro camadas"><div class="ks-floor" aria-hidden="true"></div><div class="ks-assembly"><div class="ks-stack"><div class="ks-plane ks-material" data-layer="0"><canvas class="ks-canvas" width="480" height="800" aria-hidden="true"></canvas></div><div class="ks-plane ks-base" data-layer="1" aria-hidden="true"></div><div class="ks-plane ks-stencil" data-layer="2" aria-hidden="true"><span class="ks-word">ideia</span></div><div class="ks-plane ks-print" data-layer="3">'+printArtwork()+'</div><canvas class="ks-curl-webgl" width="600" height="1000" aria-hidden="true"></canvas><svg class="ks-fold" viewBox="0 0 300 500" aria-hidden="true"><defs><linearGradient id="ks-fold-light" gradientUnits="userSpaceOnUse" x1="260" y1="0" x2="290" y2="30"><stop offset="0" stop-color="#222529"/><stop offset=".26" stop-color="#6a6d70"/><stop offset=".42" stop-color="#404246"/><stop offset="1" stop-color="#2c2e32"/></linearGradient><filter id="ks-fold-shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter><mask id="ks-fold-mask"><path class="ks-flap-mask" fill="white"/><rect class="ks-fold-hole" x="120" y="21" width="60" height="12" rx="6" fill="black"/></mask></defs><path class="ks-flap-shadow" fill="#000" opacity=".42" filter="url(#ks-fold-shadow)"/><path class="ks-flap" fill="url(#ks-fold-light)" mask="url(#ks-fold-mask)"/><path class="ks-fold-edge" fill="none" stroke="#d7d9d7" stroke-opacity=".28" stroke-width=".65"/></svg><button type="button" class="ks-grab" aria-label="Puxar ou recolher o canto do passe" aria-pressed="false"><span class="sr-only">Puxar canto</span></button></div></div><div class="ks-annotations" aria-hidden="true"><div class="ks-note ks-note-print"><b>04 / A impressão</b><span>Identidade, linhas, selo e detalhes.<br>O que torna a peça reconhecível.</span></div><div class="ks-note ks-note-type"><b>03 / A tipografia</b><span>As letras revelam o movimento.<br>A mensagem continua legível.</span></div><div class="ks-note ks-note-mask"><b>02 / O recorte</b><span>Uma camada preta controla<br>onde a textura aparece.</span></div><div class="ks-note ks-note-film"><b>01 / A matéria-prima</b><span>Textura amostrada do vídeo.<br>Luz em movimento sob a peça.</span></div></div><p class="ks-gesture" aria-hidden="true"><span>↖</span> Puxe o canto. Descubra o material.</p><div class="ks-stage-label"><span>DESIGN + ENGENHARIA</span><span data-ks-phase>A peça</span></div></div><div class="ks-legend" hidden role="group" aria-label="Inspecionar as quatro camadas"><button type="button" data-ks-inspect="0" aria-pressed="false"><b>01</b> Vídeo</button><button type="button" data-ks-inspect="1" aria-pressed="false"><b>02</b> Base</button><button type="button" data-ks-inspect="2" aria-pressed="false"><b>03</b> Letras</button><button type="button" data-ks-inspect="3" aria-pressed="false"><b>04</b> Impressão</button><p class="ks-inspector-label" role="status">Selecione uma camada para examinar seus detalhes.</p></div><div class="ks-custom" hidden><label>Palavra da peça<input type="text" data-ks-text maxlength="8" value="ideia" autocomplete="off" spellcheck="false" aria-label="Personalizar palavra do passe"></label><label>Acabamento<select data-ks-finish aria-label="Acabamento da textura"><option value="gold">Âmbar original</option><option value="silver">Prata</option><option value="copper">Cobre</option></select></label><p>Altere o texto e veja a mesma textura atravessar as letras. A personalização fica apenas nesta página.</p></div><div class="ks-controls"><label class="ks-peel-label" for="ks-peel">Revelar material <span data-ks-percent>0%</span><input id="ks-peel" type="range" min="0" max="100" value="0" aria-label="Quanto revelar do material"></label><div class="ks-buttons"><button type="button" data-ks-replay aria-pressed="false"><span aria-hidden="true">▷</span> Reproduzir sequência</button><button type="button" data-ks-pause aria-pressed="false" aria-label="Pausar movimento desta seção">Ⅱ</button><button type="button" data-ks-reset aria-label="Restaurar peça original">↺</button></div></div><div class="ks-playback" hidden><input data-ks-time type="range" min="0" max="25.6" step="0.0166667" value="0" aria-label="Posição na sequência reconstruída"><span data-ks-time-label>0,0 / 25,6 s</span></div><p class="ks-footnote"><span>UMA PEÇA · QUATRO CAMADAS · CONTROLE REAL</span><span>Estudo de interação adaptado ao portfólio.</span></p><p class="ks-sr-status sr-only" role="status"></p></div></section>');
 anchor.after(root);
 root.style.setProperty('--ks-shape','url("data:image/svg+xml,'+encodeURIComponent(SHAPE)+'")');
 const stage=$('.ks-stage',root),assembly=$('.ks-assembly',root),stack=$('.ks-stack',root),stencil=$('.ks-stencil',root),print=$('.ks-print',root),fold=$('.ks-fold',root),grab=$('.ks-grab',root),peel=$('#ks-peel',root),words=$$('.ks-word',root);
 const ctx=$('.ks-canvas',root).getContext('2d',{alpha:false});
 const curl=createCurlRenderer($('.ks-curl-webgl',root));
 root.dataset.curl=curl?'webgl':'svg';
 if(curl)root.classList.add('ks-has-curl');
 const atlas=new Image();atlas.decoding='async';atlas.src='/assets/kinetic-pass/gold-material.svg';
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,raf=0,last=0,clock=900,painted=-1,localPaused=false,playing=false,time=0,mode='piece',title='ideia',current=0,target=0,velocity=0,depth=0,depthTarget=0,pitch=2,yaw=-6,drag=null,userTitle='ideia',lastRender='',lastGeometry='',inspecting=-1;
 const stopped=()=>localPaused||media.matches||document.hidden||document.body.classList.contains('is-paused')||$('#motion-toggle')?.getAttribute('aria-pressed')==='true';
 function tell(text){$('.ks-sr-status',root).textContent=text;}
 function setTitle(value){title=normalizeTitle(value);words.forEach(el=>{el.textContent=title;el.style.fontSize=(title.length<=4?98:title.length<=5?82:title.length<=6?71:58)+'px';el.style.letterSpacing=(title.length>=7?-3:-5)+'px';});}
 function drawTexture(force=false){
  if(!ctx)return;
  const phase=(clock*.012)%30,section=Math.floor(phase),next=(section+1)%30;
  const frame=i=>i<15?i:30-i,first=frame(section),second=frame(next);
  const alpha=ease(phase-section);
  // One continuous surface: crossfade adjacent original-image samples without
  // repeating four stretched horizontal bands.
  ctx.save();ctx.clearRect(0,0,480,800);
  if(atlas.complete&&atlas.naturalWidth>=512){
   ctx.fillStyle='#9a2b07';ctx.fillRect(0,0,480,800);
   ctx.filter='blur(1px) saturate(1.32)';
   ctx.drawImage(atlas,(first%4)*128,Math.floor(first/4)*64,128,64,0,0,480,800);
   ctx.globalAlpha=alpha;
   ctx.drawImage(atlas,(second%4)*128,Math.floor(second/4)*64,128,64,0,0,480,800);
   ctx.filter='none';ctx.globalAlpha=1;
   root.dataset.texture='flow';
  }else{
   const fallback=ctx.createLinearGradient(0,0,440,800);
   fallback.addColorStop(0,'#ffea65');fallback.addColorStop(.45,'#e8a200');fallback.addColorStop(1,'#721306');
   ctx.fillStyle=fallback;ctx.fillRect(0,0,480,800);
   root.dataset.texture='fallback';
  }
  const t=clock*.001;
  ctx.globalCompositeOperation='screen';
  for(let i=0;i<4;i++){
   const x=240+Math.sin(t*(.24+i*.09)+i*1.9)*160;
   const y=((t*(38+i*12)+i*204)%1080)-120;
   const radius=100+i*20;
   const g=ctx.createRadialGradient(x,y,6,x,y,radius);
   g.addColorStop(0,'rgba(255,251,222,.38)');g.addColorStop(.3,'rgba(255,230,104,.20)');g.addColorStop(1,'rgba(255,160,30,0)');
   ctx.fillStyle=g;ctx.fillRect(x-radius,y-radius,2*radius,2*radius);
  }
  ctx.globalCompositeOperation='source-over';
  const wash=ctx.createLinearGradient(0,0,480,800);
  wash.addColorStop(0,'rgba(255,240,125,.08)');wash.addColorStop(.68,'rgba(200,30,0,.09)');wash.addColorStop(1,'rgba(30,0,0,.22)');
  ctx.fillStyle=wash;ctx.fillRect(0,0,480,800);
  ctx.restore();painted=section;
 }
 function paintFold(){
  const key=current.toFixed(4);if(key===lastGeometry)return;lastGeometry=key;
  const g=peelGeometry(current),path=polygonPath(g.flap),front=points(g.front);
  stencil.style.clipPath='polygon('+g.front.map(([x,y])=>(x/WIDTH*100).toFixed(3)+'% '+(y/HEIGHT*100).toFixed(3)+'%').join(',')+')';print.style.clipPath=stencil.style.clipPath;
  $('.ks-flap',fold).setAttribute('d',path);$('.ks-flap-mask',fold).setAttribute('d',path);$('.ks-flap-shadow',fold).setAttribute('d',path);
  $('.ks-flap-shadow',fold).setAttribute('transform','translate(0 4)');$('.ks-fold-hole',fold).setAttribute('transform','matrix('+g.matrix.join(' ')+')');
  const gradient=$('#ks-fold-light',fold);const cx=WIDTH*.64,cy=g.slope*(cx-WIDTH)+g.depth;
  gradient.setAttribute('x1',String(cx));gradient.setAttribute('y1',String(cy-5));gradient.setAttribute('x2',String(cx-g.slope*45));gradient.setAttribute('y2',String(cy+45));
  $('.ks-fold-edge',fold).setAttribute('d',g.crease.length>=2?'M'+g.crease.map(([x,y])=>x.toFixed(3)+' '+y.toFixed(3)).join('L'):'');
  if(curl)curl.draw({depth:g.depth,slope:g.slope,peel:current,time:clock*.001,yaw});
  root.dataset.peel=current.toFixed(3);$('[data-ks-percent]',root).textContent=Math.round(current*100)+'%';grab.setAttribute('aria-pressed',String(current>.2));
 }
 function render(){
  const h=stage.clientHeight,w=stage.clientWidth,scale=Math.min(w<600?.82:1.06,(h-70)/HEIGHT,(w-50)/WIDTH);
  const rx=pitch*(1-depth)+58*depth,ry=yaw*(1-depth),rz=-1.2*(1-depth)-27*depth;
  const shift=(w>600?90:w<340?-10:0)*depth,dy=210*(h/680)*depth;
  assembly.style.transform='translate3d(calc(-50% + '+shift+'px),calc(-50% + '+dy+'px),'+(-180*depth)+'px) scale('+(scale*(1-(w<340?.39:.30)*depth))+') rotateX('+rx+'deg) rotateY('+ry+'deg) rotateZ('+rz+'deg)';
  $('[data-layer]',root).forEach((el,i)=>{
    el.style.transform='translateZ('+(i*210*depth+i*.15+(i===inspecting?40*depth:0))+'px)';
    el.style.opacity=String(inspecting<0||i===inspecting||depth<.15?1:.69);
  });
  $('.ks-base',root).style.opacity=String(depth);stencil.style.mixBlendMode=depth>.03?'normal':'multiply';stencil.style.background=depth>.03?'rgba(73,75,78,.68)':'#000';
  fold.style.opacity=String(1-depth);fold.style.transform='translateZ('+(1.6+depth*340)+'px)';
  $('.ks-annotations',root).style.opacity=String(clamp((depth-.35)*1.7));$('.ks-floor',root).style.opacity=String(.8-depth*.62);
  stack.style.setProperty('--ks-hologram',String(yaw*4+clock*.009)+'deg');
  stack.style.setProperty('--ks-foil-x',String(clamp(50+yaw*2.4,0,100))+'%');
  stack.style.setProperty('--ks-foil-y',String(clamp(48+pitch*2.1,0,100))+'%');
  root.dataset.layers=depth.toFixed(3);root.dataset.mode=mode;grab.disabled=depth>.08;$('.ks-gesture',root).style.opacity=String((1-depth)*(current<.1?.65:.0));
  paintFold();
 }
 function sync(){
  $$('[data-ks-mode]',root).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ksMode===mode)));
  $('.ks-custom',root).hidden=mode!=='custom';$('.ks-legend',root).hidden=mode!=='layers';
  $('[data-ks-replay]',root).setAttribute('aria-pressed',String(playing));$('[data-ks-replay]',root).innerHTML=playing?'<span aria-hidden="true">Ⅱ</span> Pausar sequência':'<span aria-hidden="true">▷</span> Reproduzir sequência';
  $('.ks-playback',root).hidden=!playing&&time===0;
  $('[data-ks-pause]',root).setAttribute('aria-pressed',String(localPaused));$('[data-ks-pause]',root).textContent=localPaused?'▷':'Ⅱ';
 }
 function setMode(next,announce=true){mode=next;inspecting=-1;playing=false;depthTarget=next==='layers'?1:0;target=0;if(stopped()){depth=depthTarget;current=target;}sync();render();schedule();if(announce)tell(next==='layers'?'As quatro camadas estão separadas.':next==='custom'?'Personalização aberta.':'Peça montada.');}
 function movePeel(value,immediate=false){target=clamp(value);if(immediate||stopped()){current=target;velocity=0;}playing=false;mode=mode==='layers'?'piece':mode;depthTarget=0;if(stopped())depth=0;peel.value=String(Math.round(target*100));sync();render();schedule();}
 function tick(now){
  raf=0;if(!visible||stopped()){last=0;return;}const dt=last?Math.min(.045,(now-last)/1000):.016;last=now;clock+=dt*1000;
  if(playing){time=Math.min(DURATION,time+dt);const ref=sampleTimeline(time);target=ref.peel;depthTarget=ref.layers;pitch=ref.pitch;yaw=ref.yaw;setTitle(ref.title);$('[data-ks-phase]',root).textContent=ref.phase;peel.value=String(Math.round(target*100));$('[data-ks-time]',root).value=String(time);$('[data-ks-time-label]',root).textContent=time.toFixed(1).replace('.',',')+' / 25,6 s';if(time>=DURATION){playing=false;sync();tell('Sequência concluída. Os controles continuam disponíveis.');}}
  velocity+=(target-current)*205*dt;velocity*=Math.exp(-21*dt);current=clamp(current+velocity*dt);if(Math.abs(current-target)<.0002){current=target;velocity=0;}
  depth+=(depthTarget-depth)*(1-Math.exp(-dt*7));if(Math.abs(depth-depthTarget)<.0003)depth=depthTarget;
  drawTexture();render();schedule();
 }
 function schedule(){if(!raf&&visible&&!stopped())raf=requestAnimationFrame(tick);}
 function reconcile(){if(stopped()){cancelAnimationFrame(raf);raf=0;last=0;}else schedule();root.dataset.motion=stopped()?'paused':'running';}
 $('[data-ks-mode]',root).forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.ksMode)));
 const descriptions=['Textura animada: amostras originais interpoladas.','Base preta: o substrato que torna a tipografia legível.','Tipografia: letras reveladas pela composição multiply.','Impressão: identidade, retícula, código e selo holográfico.'];
 $('[data-ks-inspect]',root).forEach(b=>b.addEventListener('click',()=>{
  inspecting=Number(b.dataset.ksInspect);root.dataset.inspect=String(inspecting);
  $('[data-ks-inspect]',root).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  $('.ks-inspector-label',root).textContent=descriptions[inspecting];render();
 }));
 peel.addEventListener('input',()=>movePeel(Number(peel.value)/100,true));
 grab.addEventListener('pointerdown',e=>{if(depth>.08)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:current,moved:false};grab.setPointerCapture(e.pointerId);playing=false;sync();root.classList.add('ks-dragging');});
 grab.addEventListener('pointermove',e=>{if(!drag)return;const dy=e.clientY-drag.y,dx=e.clientX-drag.x;drag.moved=drag.moved||Math.hypot(dx,dy)>4;const s=assembly.getBoundingClientRect().height/HEIGHT;movePeel(drag.start+(dy-dx*.20)/Math.max(170,220*s),true);});
 const release=e=>{if(!drag)return;const moved=drag.moved;try{grab.releasePointerCapture(drag.id);}catch{}drag=null;root.classList.remove('ks-dragging');if(moved)movePeel(0);else movePeel(current>.2?0:.94);};
 grab.addEventListener('pointerup',release);grab.addEventListener('pointercancel',release);
 grab.addEventListener('click',e=>{if(e.detail===0)movePeel(current>.2?0:.94);});
 stage.addEventListener('pointermove',e=>{if(drag||playing||stopped()||e.pointerType!=='mouse'||depth>.02)return;const b=stage.getBoundingClientRect();pitch=2-(e.clientY-b.top-b.height/2)/b.height*15;yaw=(e.clientX-b.left-b.width/2)/b.width*25;render();});
 stage.addEventListener('pointerleave',()=>{if(drag||playing)return;pitch=2;yaw=-6;render();});
 $('[data-ks-text]',root).addEventListener('input',e=>{playing=false;userTitle=normalizeTitle(e.target.value);setTitle(userTitle);sync();});
 $('[data-ks-finish]',root).addEventListener('change',e=>{root.dataset.finish=e.target.value;});
 $('[data-ks-pause]',root).addEventListener('click',()=>{localPaused=!localPaused;sync();reconcile();});
 $('[data-ks-replay]',root).addEventListener('click',()=>{
  if(media.matches){tell('Movimento reduzido ativo. Explore a peça, as camadas e o controle de revelação.');return;}
  playing=!playing;if(playing){if(time>=DURATION||time===0){time=0;setTitle('ideia');}localPaused=false;mode='piece';sync();schedule();}else sync();
 });
 $('[data-ks-time]',root).addEventListener('input',e=>{time=Number(e.target.value);
const q=sampleTimeline(time);playing=false;current=target=q.peel;depth=depthTarget=q.layers;pitch=q.pitch;yaw=q.yaw;setTitle(q.title);$('[data-ks-phase]',root).textContent=q.phase;$('[data-ks-time-label]',root).textContent=time.toFixed(1).replace('.',',')+' / 25,6 s';sync();render();drawTexture(true);});
 $('[data-ks-reset]',root).addEventListener('click',()=>{playing=false;time=0;localPaused=false;userTitle='ideia';setTitle(userTitle);$('[data-ks-text]',root).value=userTitle;$('[data-ks-finish]',root).value='gold';root.dataset.finish='gold';pitch=2;yaw=-6;setMode('piece',false);peel.value='0';tell('Peça original restaurada.');});
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;reconcile();},{threshold:.03}).observe(stage);
 new ResizeObserver(()=>{render();}).observe(stage);
 const global=$('#motion-toggle');if(global)new MutationObserver(reconcile).observe(global,{attributes:true,attributeFilter:['aria-pressed']});
 document.addEventListener('visibilitychange',reconcile);media.addEventListener('change',reconcile);
 atlas.onload=()=>drawTexture(true);atlas.onerror=()=>{root.dataset.texture='fallback';drawTexture(true);};
 setTitle('ideia');drawTexture(true);render();sync();root.dataset.ready='true';root.dataset.referenceFrames='1536';
 if(location.hash==='#estudio-interativo')requestAnimationFrame(()=>root.scrollIntoView({block:'start',behavior:'instant'}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
