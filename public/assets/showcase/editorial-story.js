/** Three editorial chapters are three REAL devices. Abertura: iPhone.
 * Contexto: landscape iPad Pro. Fechamento: frontal MacBook Pro.
 * The exact same hardware elements move from center to side previews.
 */
import { sectionCopy } from '../content/portfolio-copy.js';
import { createDeviceFrame } from './device-frame.js';
import { createIPadFrame,createMacBookFrame } from './editorial-hardware.js';
import { createMotion } from '../sections/motion.js';
import { stableViewportHeight } from './scroll-gallery.js';
import {deviceMarkup,applyDeviceChoice,projectTypes} from './independent-device-content.js';

const types=['iphone','ipad','macbook'];
const screenMarkup=(step,index)=>deviceMarkup(step,index);
export function mountEditorialStory(){
  const root=document.querySelector('#editorial');
  const stage=root?.querySelector('[data-editorial-stage]');
  if(!stage||root.dataset.editorialReady==='true')return stage?root:null;
  const copy=sectionCopy('editorial'),motion=createMotion();
  const tabs=[...root.querySelectorAll('[data-editorial-step]')];
  const panel=root.querySelector('#editorial-story-panel');
  const context=root.querySelector('[data-editorial-context]');
  const devices=[
    createDeviceFrame({tone:'light',scheme:'dark',time:'10:09',label:'Desafio em iPhone Pro'}),
    createIPadFrame({label:'Direção em iPad Pro horizontal'}),
    createMacBookFrame({label:'Entrega em MacBook Pro'})
  ];
  const pieces=[],duplicates=[],objects=[],controls=[];
  // Source video: front card exits sideways as the next real device advances.
  root.dataset.editorialReference='layered-deck-25s';
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
    preview.inert=true; // Preview is decorative: only the currently active device owns controls.
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
  const status=root.querySelector('[data-es-status]');
  // The live status always names the current chapter AND the chosen project,
  // so selecting an option on the iPhone is announced without moving focus.
  const statusText=()=>{
    const index=Math.max(0,active),step=copy.steps[index];
    const choice=projectTypes[root.dataset.projectChoice]||projectTypes.site;
    return step.label+' · '+(index+1)+' de 3 · Escolha: '+choice.name;
  };
  const updateStatus=()=>{if(status)status.textContent=statusText();};
  root.addEventListener('click',event=>{
    const choice=event.target.closest('[data-es-choice]');
    if(choice&&root.contains(choice)){event.stopPropagation();applyDeviceChoice(root,choice.dataset.esChoice);updateStatus();return;}
    const go=event.target.closest('[data-es-go]');
    if(go&&root.contains(go)){event.stopPropagation();render(Number(go.dataset.esGo),true);}
  });
  stage.tabIndex=0;
  stage.setAttribute('aria-label','Três dispositivos. Use as setas para mudar de etapa.');
  let active=-1,animations=[],generation=0,layoutKey='',mobile=false,shift=0,modelHeights=[],lidAnimation=null;
  const cancelAnimations=()=>{animations.forEach(a=>a?.cancel());animations=[]};
  // The MacBook lid rests half-closed while the notebook waits at the side and
  // opens on its hinge when Entrega becomes active (pose lives in CSS).
  const lid=devices[2].root.querySelector('.mbp-lid');
  function pose(i){
    const others=devices.map((_,j)=>j).filter(j=>j!==active);
    const side=i===active?0:others.indexOf(i)===0?-1:1;
    const ownHeight=modelHeights[i]||1,primaryHeight=modelHeights[Math.max(0,active)]||ownHeight;
    const sideScale=mobile?Math.min(.73,(primaryHeight*.84)/ownHeight):.70;
    return {
      transform:`translate(-50%,-50%) translate3d(${side*shift}px,${side?12:0}px,${side?-38:0}px) rotateY(${side*-4.5}deg) rotateZ(${side*(mobile?3:4)}deg) scale(${side?sideScale:1})`,
      opacity:side?(mobile?.62:.72):1,
      zIndex:side?1:4
    };
  }
  function applyPose(i){
    const target=pose(i);
    Object.assign(objects[i].style,{transform:target.transform,opacity:String(target.opacity),zIndex:String(target.zIndex)});
    return target;
  }
  // Mobile stage height follows the active device and glides between heights.
  // The glide is frame-driven, but a timer always lands the exact layout height
  // on schedule, so a delayed frame can never leave the page at a stale height.
  // Reduced motion and the global pause apply the height instantly.
  const heightGlide={raf:0,timer:0};
  function setStageHeight(px,glide){
    cancelAnimationFrame(heightGlide.raf);clearTimeout(heightGlide.timer);
    stage.style.setProperty('--es-stage-height',px+'px');stage.dataset.stageHeight=String(px);
    const from=parseFloat(stage.style.height);
    if(!glide||!motion.available()||!Number.isFinite(from)||Math.abs(from-px)<1){stage.style.height=px+'px';stage.dataset.heightMotion='idle';return;}
    const start=performance.now(),duration=360,ease=t=>1-Math.pow(1-t,3);
    stage.dataset.heightMotion='glide';
    const land=()=>{cancelAnimationFrame(heightGlide.raf);clearTimeout(heightGlide.timer);stage.style.height=px+'px';stage.dataset.heightMotion='idle';};
    const frame=()=>{const t=Math.min(1,(performance.now()-start)/duration);if(t>=1){land();return;}stage.style.height=(from+(px-from)*ease(t)).toFixed(2)+'px';heightGlide.raf=requestAnimationFrame(frame);};
    heightGlide.raf=requestAnimationFrame(frame);
    heightGlide.timer=setTimeout(land,duration+24);
  }
  function resizeStage(glide=false){if(!modelHeights.length)return;const height=mobile?modelHeights[Math.max(0,active)]:Math.max(...modelHeights);setStageHeight(Math.ceil(height+(mobile?48:32)),glide);}
  function sizeDevices(){
    mobile=matchMedia('(max-width:700px)').matches;
    const available=stage.clientWidth||innerWidth-36;
    const budget=Math.max(300,Math.min(640,stableViewportHeight()-(mobile?260:320)));
    const key=[mobile,available,budget].join(':');
    if(key===layoutKey)return;
    layoutKey=key;++generation;cancelAnimations();
    const base=[
      mobile?Math.min(330,available*.90):Math.min(340,budget*435/907),
      mobile?Math.min(376,available*.94):Math.min(655,available*.75,budget*281.6/215.5),
      mobile?Math.min(410,available*.98):Math.min(774,available*.88,budget/.68)
    ];
    devices.forEach((device,i)=>{
      const width=Math.round(base[i]);
      if(i===0)device.root.style.setProperty('--df-pt',width/435+'px');
      else device.root.style.width=width+'px';
      device.root.style.setProperty('--es-device-unit',(width/100)+'px');
    });
    modelHeights=[base[0]*907/435,base[1]*215.5/281.6,base[2]*.68];
    resizeStage();
    stage.dataset.heightMode=mobile?'compact-by-step':'stable-desktop';
    shift=mobile?Math.max(112,available*.41):Math.max(245,available*.38);
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
    const lidStart=lid?getComputedStyle(lid).transform:'none';
    const lidMoving=!!lidAnimation&&lidAnimation.playState==='running';
    cancelAnimations();lidAnimation=null;
    const token=++generation;
    active=index;
    resizeStage(previous>=0);
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
      pieces[i].hidden=!current;pieces[i].inert=!current;duplicates[i].hidden=current;duplicates[i].inert=true;
      objects[i].classList.toggle('es-peek',!current);
      objects[i].classList.toggle('es-peek--left',i===others[0]);
      objects[i].classList.toggle('es-peek--right',i===others[1]);
      objects[i].dataset.stepIndex=String(i);
      controls[i].hidden=current;
      const target=applyPose(i);
      if(previous>=0&&motion.available()){
        // The video exchange uses release, overlap, then a small front-only settle.
        const direction=index>previous?-1:1;
        const settle=i===index?{
          transform:`translate(-50%,-50%) translate3d(${direction*12}px,-3px,11px) rotateY(${direction*-1.7}deg) rotateZ(${direction*.7}deg) scale(1.017)`,
          opacity:1
        }:target;
        const animation=motion.animate(objects[i],[
          {...starts[i],offset:0},
          {transform:starts[i].transform,opacity:starts[i].opacity,zIndex:starts[i].zIndex,offset:.12},
          {zIndex:starts[i].zIndex,offset:.43},
          {zIndex:String(target.zIndex),offset:.57},
          {...settle,zIndex:String(target.zIndex),offset:.84},
          {...target,zIndex:String(target.zIndex),offset:1}
        ],{duration:610,easing:'cubic-bezier(.22,.8,.22,1)'});
        if(animation)animations.push(animation);
      }
    });
    // Hinge: continue from the painted lid angle toward the pose of the new
    // position. Reduced motion and the global pause leave the CSS pose instant.
    if(lid&&previous>=0&&motion.available()&&(index===2||previous===2||lidMoving)){
      const lidEnd=getComputedStyle(lid).transform;
      if(lidEnd!==lidStart){
        const opening=index===2;
        lidAnimation=motion.animate(lid,[{transform:lidStart},{transform:lidEnd}],
          opening?{duration:520,delay:150,easing:'cubic-bezier(.2,.72,.18,1)'}:{duration:340,easing:'cubic-bezier(.4,0,.2,1)'});
        if(lidAnimation)animations.push(lidAnimation);
      }
    }
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
    updateStatus();
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
  motion.onStop(()=>{++generation;cancelAnimations();resizeStage();root.dataset.editorialMotion='idle';});
  render(0);sizeDevices();applyDeviceChoice(root,'site');updateStatus();
  new ResizeObserver(sizeDevices).observe(stage);
  addEventListener('resize',sizeDevices,{passive:true});
  root.dataset.editorialReady='true';
  return root;
}
