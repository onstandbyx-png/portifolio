/** Three editorial chapters are three REAL devices. Abertura: iPhone.
 * Contexto: landscape iPad Pro. Fechamento: frontal MacBook Pro.
 * The exact same hardware elements move from center to side previews.
 */
import { sectionCopy } from '../content/portfolio-copy.js';
import { createDeviceFrame } from './device-frame.js';
import { createIPadFrame,createMacBookFrame } from './editorial-hardware.js';
import { createMotion } from '../sections/motion.js';

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
  const pieces=[],duplicates=[];
  devices.forEach((device,i)=>{
    device.root.classList.add('es-hardware','es-hardware--'+types[i]);
    device.root.dataset.editorialModel=types[i];
    device.screen.innerHTML=screenMarkup(copy.steps[i],i);
    const piece=device.screen.querySelector('[data-es-piece]');
    if(!piece)throw new Error('Missing editorial device article: '+i);
    const preview=piece.cloneNode(true);
    preview.removeAttribute('data-es-piece');
    preview.classList.add('es-preview-piece');
    preview.setAttribute('aria-hidden','true');
    preview.hidden=true;
    piece.parentElement.append(preview);
    pieces.push(piece);duplicates.push(preview);
  });
  const peeks=['left','right'].map(side=>{
    const button=document.createElement('button');
    button.type='button';button.className='es-peek es-peek--'+side;
    button.dataset.esPeek=side;
    button.addEventListener('click',()=>render(Number(button.dataset.stepIndex),true));
    return button;
  });
  let active=-1,animations=[];
  const cancelAnimations=()=>{animations.forEach(a=>a?.cancel());animations=[]};
  function sizeDevices(){
    const mobile=matchMedia('(max-width:700px)').matches;
    const available=stage.clientWidth||innerWidth-52;
    const base=[
      mobile?Math.min(340,Math.max(216,Math.min(available-14,innerWidth*.64))):Math.min(340,Math.max(220,available-24)),
      mobile?Math.min(376,Math.max(266,available*.89)):Math.min(655,Math.max(380,available*.75)),
      mobile?Math.min(410,Math.max(274,available*.94)):Math.min(774,Math.max(410,available*.88))
    ];
    const kind=types[active>=0?active:0];
    devices.forEach((device,i)=>{
      const width=Math.round(base[i]*(i===active?1:mobile?.82:.70));
      if(i===0)device.root.style.setProperty('--df-pt',width/435+'px');
      else device.root.style.width=width+'px';
      device.root.style.setProperty('--es-device-unit',(width/100)+'px');
      device.root.dataset.position=i===active?'center':'side';
    });
    // A height tied to the active device used to collapse the mobile scene by
    // more than 200px on every iPhone -> iPad/MacBook change. That moved the
    // pagination and the next section into view mid-gesture, and allowed the
    // taller side iPhone to overlap the chapter tabs. The scene must remain
    // stable; the three REAL hardware shapes retain their own aspect ratios.
    const heights=[base[0]*907/435,base[1]*215.5/281.6,base[2]*.68];
    const activeHeight=heights[active>=0?active:0];
    const targetHeight=Math.ceil((mobile?Math.max(...heights):activeHeight)+(mobile?30:40));
    if(Math.abs((parseFloat(stage.style.height)||0)-targetHeight)>1){
      stage.style.height=targetHeight+'px';
    }
    stage.dataset.heightMode=mobile?'stable-mobile':'adaptive-desktop';
    stage.style.setProperty('--es-stage-height',targetHeight+'px');
    const shift=mobile?Math.max(181,available*.63):Math.max(295,available*.38);
    peeks.forEach(button=>{
      const delta=button.dataset.esPeek==='left'?-shift:shift;
      button.style.setProperty('--side-offset',delta+'px');
    });
  }
  function render(index,focus=false){
    if(index===active)return;
    if(index<0||index>=3)return;
    cancelAnimations();
    const previous=active;
    active=index;
    const step=copy.steps[index],others=devices.map((_,i)=>i).filter(i=>i!==index);
    root.dataset.editorialActive=step.id;
    root.dataset.editorialDevice=types[index];
    stage.dataset.activeDevice=types[index];
    panel.setAttribute('aria-labelledby',tabs[index].id);
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    devices.forEach((device,i)=>{
      const isCurrent=i===index;
      device.root.classList.toggle('es-device',isCurrent);
      device.root.setAttribute('aria-hidden',String(!isCurrent));
      if(isCurrent){device.root.setAttribute('role','group');}
      else device.root.removeAttribute('role');
      pieces[i].hidden=!isCurrent;
      duplicates[i].hidden=isCurrent;
    });
    stage.replaceChildren(devices[index].root,...peeks);
    peeks.forEach((button,k)=>{
      const i=others[k];
      button.dataset.stepIndex=String(i);
      button.dataset.device=types[i];
      button.setAttribute('aria-label','Abrir '+copy.steps[i].label+' em '+({iphone:'iPhone',ipad:'iPad',macbook:'MacBook'}[types[i]]));
      button.replaceChildren(devices[i].root);
    });
    sizeDevices();
    // One restrained entrance regardless of whether a chapter is selected
    // by swipe, tab, arrow or side preview. No device geometry gets morphed.
    if(previous>=0&&!motion.paused()&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
      animations.push(motion.animate(devices[index].root,
        [{opacity:.74,transform:'translateY(8px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],
        {duration:360,easing:'cubic-bezier(.22,.82,.22,1)'}));
    }
    // Keep legacy reading/transcript semantics for assistive technology
    // even though the visual explanation is intentionally hidden.
    context.querySelector('[data-es-label]').textContent='0'+(index+1)+' / '+step.label;
    context.querySelector('[data-es-title]').textContent=step.title;
    context.querySelector('[data-es-body]').textContent=step.body;
    context.querySelector('[data-es-quote]').textContent=step.pieceTitle.replace(/\n/g,' ');
    context.querySelector('[data-es-copy]').textContent=step.pieceCopy;
    root.querySelector('[data-es-status]').textContent=step.label+' · '+(index+1)+' de 3';
    pieces[index].querySelectorAll('.es-mask > span').forEach((line,i)=>{
      animations.push(motion.animate(line,[{transform:'translateY(108%)'},{transform:'translateY(0)'}],{duration:430,delay:i*50}));
    });
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
  new ResizeObserver(sizeDevices).observe(stage);
  addEventListener('resize',sizeDevices,{passive:true});
  render(0);
  root.dataset.editorialReady='true';
  return root;
}
