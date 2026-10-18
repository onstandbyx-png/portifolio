/* Adapted from smiile b6a2e0d: src/motion/tokens.ts and ProjectCards.tsx. */
export const BOUNCE={smooth:0,snappy:.15,bouncy:.3};
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
export function springAt(name,ms,d=.5){if(ms<=0)return 0;const t=ms/1000,w=2*Math.PI/d,z=1-(BOUNCE[name]??0);if(z>=1)return 1-Math.exp(-w*t)*(1+w*t);const root=Math.sqrt(1-z*z),wd=w*root;return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z/root*Math.sin(wd*t));}
export function entryEdge(x,y,width,height){if(width<=0||height<=0)return 'left';return [['left',x/width],['right',1-x/width],['top',y/height],['bottom',1-y/height]].reduce((a,b)=>b[1]<a[1]?b:a)[0];}
export const rotationForEdge=edge=>({x:edge==='top'?180:edge==='bottom'?-180:0,y:edge==='left'?-180:edge==='right'?180:0});
export const chapterAt=(progress,count)=>Math.min(Math.max(0,count-1),Math.floor(clamp(progress)*count));
export const timelineStep=(elapsed,count,frameMs=1600)=>Math.min(count-1,Math.max(0,Math.floor(elapsed/frameMs)));
export function createMotion(){
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set(),stopListeners=new Set();
 const paused=()=>preference.matches||document.body.classList.contains('is-paused')||document.querySelector('.motion-toggle')?.getAttribute('aria-pressed')==='true';
 const available=()=>!paused()&&!document.hidden;
 function finishAll(){for(const a of animations){try{a.finish()}catch{a.cancel()}}animations.clear();for(const stop of stopListeners)stop();}
 preference.addEventListener('change',()=>{if(paused())finishAll()});
 const button=document.querySelector('.motion-toggle');if(button)new MutationObserver(()=>{if(paused())finishAll()}).observe(button,{attributes:true,attributeFilter:['aria-pressed']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishAll()});
 function animate(el,keyframes,{duration=420,delay=0,easing='cubic-bezier(.16,1,.3,1)'}={}){if(!el||!available()||!el.animate)return null;const a=el.animate(keyframes,{duration,delay,easing,fill:'backwards'});animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));return a;}
 function spring(el,frame,{name='snappy',duration=690,delay=0}={}){const frames=Array.from({length:49},(_,i)=>({...frame(i===48?1:springAt(name,i/48*duration)),offset:i/48}));return animate(el,frames,{duration,delay,easing:'linear'});}
 return{paused,available,animate,spring,onStop:fn=>{stopListeners.add(fn);return()=>stopListeners.delete(fn)},finishAll};
}
