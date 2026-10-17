/** Three editorial chapters are three REAL devices. Abertura: iPhone.
 * Contexto: landscape iPad Pro. Fechamento: frontal MacBook Pro.
 * The exact same hardware elements move from center to side previews.
 */
import { sectionCopy } from '../content/portfolio-copy.js';
import { createDeviceFrame } from './device-frame.js';
import { createIPadFrame,createMacBookFrame } from './editorial-hardware.js';
import { createMotion } from '../sections/motion.js';
import { stableViewportHeight } from './scroll-gallery.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const types=['iphone','ipad','macbook'];
const photos=[
  '/assets/portfolio/recovered-fatos/post-desconhecidos-600.webp',
  '/assets/portfolio/recovered-fatos/cena-desconhecidos.webp',
  '/assets/portfolio/recovered-fatos/cena-desconhecidos.webp'
];
const icons={
  camera:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="m8 6 2-3h4l2 3"/><circle cx="12" cy="13" r="4"/>',
  map:'<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2V5Zm6-2v15m6-12v15"/>',
  message:'<path d="M20 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3v4l5-4h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M7 8h10M7 12h7"/>'
};
const icon=name=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
const titleLines=s=>escape(s).split('\n').map(line=>'<span class="es-mask"><span>'+line+'</span></span>').join('');
function screenMarkup(step,index){
  const n=String(index+1).padStart(2,'0'),title=escape(step.pieceTitle),body=escape(step.pieceCopy),label=escape(step.label),image=photos[index];
  if(index===0)return [
    '<div class="es-screen es-screen--iphone">',
      '<article class="es-piece es-piece-hook" data-es-piece="0">',
      '<img class="es-piece-art" src="'+image+'" width="600" height="750" alt="" loading="eager" decoding="async">',
      '<div class="es-piece-shade"></div>',
      '<div class="es-piece-meta"><img src="/assets/portfolio/recovered-fatos/avatar_desconhecidos.webp" width="38" height="38" alt=""><span>FATOS<br><small>TECNOLOGIA NO COTIDIANO</small></span></div>',
      '<div class="es-piece-copy"><span class="es-piece-kicker">01 / ABERTURA</span><h3>'+titleLines(step.pieceTitle)+'</h3><p>'+body+'</p></div>',
      '<div class="es-piece-footer"><span>ESTUDO EDITORIAL</span><span>1 / 3</span></div>',
      '</article>',
    '</div>'
  ].join('');
  if(index===1)return [
    '<div class="es-screen es-screen--ipad">',
      '<article class="es-piece es-piece-context es-ipad-editorial" data-es-piece="1" hidden>',
        '<div class="es-ipad-info"><div class="es-ipad-brand"><img src="/assets/portfolio/recovered-fatos/avatar_desconhecidos.webp" alt="" width="32" height="32"><span>FATOS <small>CONTEXTO EDITORIAL</small></span></div>',
          '<span class="es-ipad-step">02 / '+label.toLocaleUpperCase('pt-BR')+'</span>',
          '<h3>'+titleLines(step.pieceTitle)+'</h3>',
          '<p>'+body+'</p>',
          '<div class="es-ipad-functions"><span>'+icon('camera')+' Câmera</span><span>'+icon('map')+' Mapa</span><span>'+icon('message')+' Mensagens</span></div>',
        '</div>',
        '<div class="es-ipad-visual"><img src="'+image+'" alt="" loading="lazy" decoding="async" width="700" height="560"><span>UMA HISTÓRIA, NOVAS PERSPECTIVAS</span></div>',
      '</article>',
    '</div>'
  ].join('');
  return [
    '<div class="es-screen es-screen--macbook">',
      '<article class="es-piece es-piece-closing es-macbook-editorial" data-es-piece="2" hidden>',
        '<div class="es-mac-browser"><span><i></i><i></i><i></i></span><b>FATOS / ESTUDO EDITORIAL</b></div>',
        '<div class="es-mac-nav"><strong>FATOS</strong><span>Pesquisa &nbsp; · &nbsp; Contexto &nbsp; · &nbsp; Síntese</span><small>03 / FECHAMENTO</small></div>',
        '<div class="es-mac-hero"><img src="'+image+'" alt="" loading="lazy" decoding="async" width="960" height="700"><div class="es-mac-hero-copy"><small>UMA HISTÓRIA COMPLETA</small><h3>'+titleLines(step.pieceTitle)+'</h3><p>'+body+'</p></div></div>',
      '</article>',
    '</div>'
  ].join('');
}

export function mountEditorialStory(){
  const root=document.querySelector('#editorial');
  const stage=root?.querySelector('[data-editorial-stage]');
  if(!stage||root.dataset.editorialReady==='true')return stage?root:null;
  const copy=sectionCopy('editorial'),motion=createMotion();
  const tabs=[...root.querySelectorAll('[data-editorial-step]')];
  const panel=root.querySelector('#editorial-story-panel');
  const context=root.querySelector('[data-editorial-context]');
  const devices=[
    createDeviceFrame({tone:'light',scheme:'dark',time:'10:09',label:'Abertura em iPhone Pro'}),
    createIPadFrame({label:'Contexto em iPad Pro horizontal'}),
    createMacBookFrame({label:'Fechamento em MacBook Pro'})
  ];
  const pieces=[],duplicates=[],objects=[],controls=[];
  devices.forEach((device,i)=>{
    device.root.classList.add('es-hardware','es-hardware--'+types[i]);
    device.root.dataset.editorialModel=types[i];
    device.screen.innerHTML=screenMarkup(copy.steps[i],i);
    device.screen.querySelectorAll('img').forEach(image=>{image.loading='eager';});
    const piece=device.screen.querySelector('[data-es-piece]');
    const preview=piece.cloneNode(true);
    preview.removeAttribute('data-es-piece');
    preview.classList.add('es-preview-piece');
    preview.setAttribute('aria-hidden','true');
    piece.parentElement.append(preview);
    pieces.push(piece);duplicates.push(preview);
    // Each object owns one physical frame for its entire lifetime. Selection
    // only changes its pose; content and hardware are never reparented.
    const object=document.createElement('div');
    object.className='es-object';object.dataset.device=types[i];
    const control=document.createElement('button');
    control.type='button';control.className='es-object-select';
    control.setAttribute('aria-label','Abrir '+copy.steps[i].label+' em '+({iphone:'iPhone',ipad:'iPad',macbook:'MacBook'}[types[i]]));
    control.addEventListener('click',()=>render(i,true));
    object.append(device.root,control);objects.push(object);controls.push(control);
  });
  stage.replaceChildren(...objects);
  stage.tabIndex=0;
  stage.setAttribute('aria-label','Três dispositivos. Use as setas para mudar de etapa.');
  let active=-1,animations=[],generation=0,layoutKey='',mobile=false,shift=0;
  const cancelAnimations=()=>{animations.forEach(a=>a?.cancel());animations=[]};
  function pose(i){
    const others=devices.map((_,j)=>j).filter(j=>j!==active);
    const side=i===active?0:others.indexOf(i)===0?-1:1;
    return {
      transform:`translate(-50%,-50%) translate3d(${side*shift}px,${side?12:0}px,0) rotate(${side*(mobile?3:4)}deg) scale(${side?(mobile?.72:.68):1})`,
      opacity:side?(mobile?.62:.72):1,
      zIndex:side?1:4
    };
  }
  function applyPose(i){
    const target=pose(i);
    Object.assign(objects[i].style,{transform:target.transform,opacity:String(target.opacity),zIndex:String(target.zIndex)});
    return target;
  }
  function sizeDevices(){
    mobile=matchMedia('(max-width:700px)').matches;
    const available=stage.clientWidth||innerWidth-36;
    const budget=Math.max(300,Math.min(640,stableViewportHeight()-(mobile?260:320)));
    const key=[mobile,available,budget].join(':');
    if(key===layoutKey)return;
    layoutKey=key;++generation;cancelAnimations();
    const base=[
      Math.min(mobile?Math.min(340,available-14,innerWidth*.64):340,budget*435/907),
      Math.min(mobile?Math.min(376,available*.89):Math.min(655,available*.75),budget*281.6/215.5),
      Math.min(mobile?Math.min(410,available*.94):Math.min(774,available*.88),budget/.68)
    ];
    devices.forEach((device,i)=>{
      const width=Math.round(base[i]);
      if(i===0)device.root.style.setProperty('--df-pt',width/435+'px');
      else device.root.style.width=width+'px';
      device.root.style.setProperty('--es-device-unit',(width/100)+'px');
    });
    const targetHeight=Math.ceil(Math.max(base[0]*907/435,base[1]*215.5/281.6,base[2]*.68)+(mobile?30:32));
    stage.style.height=targetHeight+'px';
    stage.dataset.heightMode=mobile?'stable-mobile':'stable-desktop';
    stage.style.setProperty('--es-stage-height',targetHeight+'px');
    shift=mobile?Math.max(166,available*.60):Math.max(245,available*.38);
    objects.forEach((_,i)=>applyPose(i));
    root.dataset.editorialMotion='idle';
  }
  function render(index,focus=false){
    if(index===active||index<0||index>=3)return;
    const previous=active;
    // Read the painted pose before cancelling: interrupted navigation continues
    // from the current frame instead of restarting from either endpoint.
    const starts=objects.map(object=>{
      const style=getComputedStyle(object);
      return {transform:style.transform,opacity:Number(style.opacity),zIndex:style.zIndex};
    });
    cancelAnimations();
    const token=++generation;
    active=index;
    const step=copy.steps[index];
    const others=devices.map((_,i)=>i).filter(i=>i!==index);
    root.dataset.editorialActive=step.id;
    root.dataset.editorialDevice=types[index];
    stage.dataset.activeDevice=types[index];
    panel.setAttribute('aria-labelledby',tabs[index].id);
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    devices.forEach((device,i)=>{
      const current=i===index;
      device.root.classList.toggle('es-device',current);
      device.root.dataset.position=current?'center':'side';
      device.root.setAttribute('aria-hidden',String(!current));
      if(current)device.root.setAttribute('role','group');else device.root.removeAttribute('role');
      pieces[i].hidden=!current;duplicates[i].hidden=current;
      objects[i].classList.toggle('es-peek',!current);
      objects[i].classList.toggle('es-peek--left',i===others[0]);
      objects[i].classList.toggle('es-peek--right',i===others[1]);
      objects[i].dataset.stepIndex=String(i);
      controls[i].hidden=current;
      const target=applyPose(i);
      if(previous>=0&&motion.available()){
        const animation=motion.animate(objects[i],[
          {...starts[i],offset:0},
          {zIndex:starts[i].zIndex,offset:.44},
          {zIndex:String(target.zIndex),offset:.56},
          {...target,offset:1}
        ],{duration:620,easing:'cubic-bezier(.4,0,.2,1)'});
        if(animation)animations.push(animation);
      }
    });
    root.dataset.editorialMotion=animations.length?'transition':'idle';
    if(animations.length)Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{
      if(token!==generation)return;
      animations=[];root.dataset.editorialMotion='idle';
    });
    context.querySelector('[data-es-label]').textContent='0'+(index+1)+' / '+step.label;
    context.querySelector('[data-es-title]').textContent=step.title;
    context.querySelector('[data-es-body]').textContent=step.body;
    context.querySelector('[data-es-quote]').textContent=step.pieceTitle.replace(/\n/g,' ');
    context.querySelector('[data-es-copy]').textContent=step.pieceCopy;
    root.querySelector('[data-es-status]').textContent=step.label+' · '+(index+1)+' de 3';
    if(focus)tabs[index].focus({preventScroll:true});
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>render(i));
    tab.addEventListener('keydown',event=>{
      const index={ArrowRight:(i+1)%3,ArrowLeft:(i+2)%3,Home:0,End:2}[event.key];
      if(index===undefined)return;
      event.preventDefault();render(index,true);
    });
  });
  motion.onStop(()=>{++generation;cancelAnimations();root.dataset.editorialMotion='idle';});
  render(0);sizeDevices();
  new ResizeObserver(sizeDevices).observe(stage);
  addEventListener('resize',sizeDevices,{passive:true});
  root.dataset.editorialReady='true';
  return root;
}
