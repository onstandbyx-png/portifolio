import type { BadgeScene as BadgeSceneHandle } from "./badge/BadgeScene";
const stage=document.querySelector<HTMLElement>("[data-portfolio-badges]");
const canvas=stage?.querySelector<HTMLCanvasElement>("[data-badge-canvas]");
const swingButton=document.querySelector<HTMLButtonElement>("[data-badge-swing]");
const hint=document.querySelector<HTMLElement>("[data-badge-hint]");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const motionToggle=document.querySelector<HTMLElement>(".motion-toggle");
let instance:BadgeSceneHandle|null=null,near=false,inView=false,visible=!document.hidden,loaded=false,paused=false,disposed=false;
const setState=(value:string)=>{if(stage)stage.dataset.state=value;};
function isPaused(){return paused||reduced.matches||motionToggle?.getAttribute("aria-pressed")==="true";}
function sync(){instance?.setActive(inView&&visible&&!isPaused());}
function failure(reason:unknown){
 console.warn("Fallback estático do crachá disponível.",reason);
 setState("fallback");if(swingButton)swingButton.disabled=false;
}
async function load(){
 if(loaded||!canvas||reduced.matches||!near||disposed)return;loaded=true;
 setState("loading");
 try{
  const { BadgeScene }=await import("./badge/BadgeScene");
  const scene=new BadgeScene(canvas,{enter:true,
   front:{name:"Fatos",label:"EDITORIAL",line:"Pesquisa, pautas, redação e criação."},
   back:{name:"smiile",label:"DIGITAL",line:"Interfaces, experiência e sistemas."},
   onRest(){if(hint&&!stage?.dataset.interacted)hint.textContent="↔ ARRASTE OS CRACHÁS PARA EXPLORAR";},
   onTouch(){if(stage)stage.dataset.interacted="true";if(hint)hint.textContent="↔ BALANCE NOVAMENTE OU ROLE A PÁGINA";}
  });
  await scene.init();
  if(disposed){scene.dispose();return;}
  instance=scene;setState("ready");sync();
 }catch(err){failure(err)}
}
if(stage&&canvas){
 const approach=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){near=true;void load();approach.disconnect()}},{rootMargin:"420px 0px"});
 const view=new IntersectionObserver(([entry])=>{inView=!!entry?.isIntersecting;sync()},{threshold:[0,.06,.2,.4]});
 approach.observe(stage);view.observe(stage);
 new ResizeObserver(()=>instance?.resize()).observe(canvas);
 document.addEventListener("visibilitychange",()=>{visible=!document.hidden;sync()});
 motionToggle&&new MutationObserver(sync).observe(motionToggle,{attributes:true,attributeFilter:["aria-pressed"]});
 reduced.addEventListener("change",()=>{if(reduced.matches){setState("fallback");instance?.setActive(false)}else{if(instance)setState("ready");else if(near)void load();sync()}});
 swingButton?.addEventListener("click",()=>{
  if(instance&&!isPaused()){instance.swing(1);return;}
  stage.classList.remove("badge-fallback-bounce");
  void stage.offsetWidth;
  stage.classList.add("badge-fallback-bounce");
  setTimeout(()=>stage.classList.remove("badge-fallback-bounce"),850);
 });
 swingButton?.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();instance?.swing(e.key==="ArrowLeft"?-1:1)}});
 if(reduced.matches)setState("fallback");
}
