import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

// This gate deliberately holds real module responses. It does not expose a
// debug scene or change rendering behavior to make loading states pass.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/badge-loading',port=process.env.PORT||'4189';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
const report=[];let browser;
await mkdir(output,{recursive:true});
const state=page=>page.evaluate(()=>{
 const stage=document.querySelector('[data-portfolio-badges]'),poster=stage?.querySelector('[data-badge-poster]'),canvas=stage?.querySelector('[data-badge-canvas]');
 const visible=element=>{if(!element)return false;const r=element.getBoundingClientRect();if(!r.width||!r.height)return false;for(let node=element;node?.nodeType===1;node=node.parentElement){const s=getComputedStyle(node);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}return true;};
 return {state:stage?.dataset.state,poster:visible(poster),canvas:visible(canvas),decoded:!!poster?.complete&&poster.naturalWidth>0,src:poster?.getAttribute('src'),legacy:stage?.querySelectorAll('.hero-standin-card,.hero-badge-cords,.hero-standin-hole,.hero-standin-fatos,.hero-standin-smiile').length||0};
});
async function placeHero(page,noScript=false){
 await page.locator('[data-portfolio-badges]').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-76,behavior:'instant'}));
 if(!noScript){await page.locator('[data-badge-poster]').evaluate(img=>img.decode());await page.evaluate(()=>document.fonts.ready);}
 if(!noScript)await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function startFrames(page){
 await page.evaluate(()=>{window.__badgeLoadingFrames=[];window.__badgeLoadingObserve=true;const visible=element=>{if(!element)return false;const r=element.getBoundingClientRect();if(!r.width||!r.height)return false;for(let node=element;node?.nodeType===1;node=node.parentElement){const s=getComputedStyle(node);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}return true;};function sample(){const stage=document.querySelector('[data-portfolio-badges]');window.__badgeLoadingFrames.push({state:stage?.dataset.state,poster:visible(stage?.querySelector('[data-badge-poster]')),canvas:visible(stage?.querySelector('[data-badge-canvas]'))});if(window.__badgeLoadingObserve)requestAnimationFrame(sample);}requestAnimationFrame(sample);});
}
async function compareArt(page,before,after){
 return page.evaluate(async({a,b})=>{
  const load=async src=>{const image=new Image();image.src=src;await image.decode();return image;};
  const [first,second,mask]=await Promise.all([load(a),load(b),load(document.querySelector('[data-badge-poster]').src)]);
  if(first.width!==second.width||first.height!==second.height)return{dimensionsMatch:false};
  const w=first.width,h=first.height,make=()=>Object.assign(document.createElement('canvas'),{width:w,height:h});
  const one=make().getContext('2d',{willReadFrequently:true}),two=make().getContext('2d',{willReadFrequently:true}),alpha=make().getContext('2d',{willReadFrequently:true});
  one.drawImage(first,0,0);two.drawImage(second,0,0);const scale=Math.min(w/mask.width,h/mask.height),mw=mask.width*scale,mh=mask.height*scale;alpha.drawImage(mask,(w-mw)/2,(h-mh)/2,mw,mh);
  const x=one.getImageData(0,0,w,h).data,y=two.getImageData(0,0,w,h).data,z=alpha.getImageData(0,0,w,h).data;
  let total=0,large=0,pixels=0,allTotal=0,maxDifference=0;for(let i=0;i<x.length;i+=4){const channels=[Math.abs(x[i]-y[i]),Math.abs(x[i+1]-y[i+1]),Math.abs(x[i+2]-y[i+2])],difference=channels.reduce((a,b)=>a+b,0)/3;allTotal+=difference;maxDifference=Math.max(maxDifference,...channels);if(z[i+3]<96)continue;total+=difference;large+=Number(difference>50);pixels++;}
  return{dimensionsMatch:true,artPixels:pixels,artMeanDifference:total/Math.max(1,pixels),largeDifferenceRatio:large/Math.max(1,pixels),allMeanDifference:allTotal/(w*h),maxDifference};
 },{a:'data:image/png;base64,'+before.toString('base64'),b:'data:image/png;base64,'+after.toString('base64')});
}
try{
 let healthy=false;for(let attempt=0;attempt<60;attempt++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(resolve=>setTimeout(resolve,150));}assert(healthy,'Server is reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const widths=process.env.QA_WIDTHS?.split(',').map(Number),modes=process.env.QA_MODES?.split(',');
 for(const [width,height] of [[390,748],[320,640],[1440,900]].filter(([w])=>!widths||widths.includes(w))){
  for(const mode of ['entry-delayed','chunk-delayed','chunk-failed','reduced','no-script'].filter(m=>!modes||modes.includes(m))){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<500,hasTouch:width<500,reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-script'});
   const page=await context.newPage();page.setDefaultTimeout(20000);
   const row={width,height,mode,checks:[],errors:[],chunkRequests:[]};report.push(row);let release,releasePoster,posterIntercepted=false;
   const gate=new Promise(resolve=>{release=resolve;});let intercepted=false;
   page.on('pageerror',error=>row.errors.push(String(error)));
   page.on('request',request=>{const p=new URL(request.url()).pathname;if(p.startsWith('/assets/badge-build/')&&!p.endsWith('/index.js'))row.chunkRequests.push(p);});
   if(mode==='entry-delayed')await page.route('**/assets/badge-build/index.js',async route=>{intercepted=true;await gate;await route.continue().catch(()=>{});});
   if(mode==='chunk-delayed'||mode==='chunk-failed')await page.route('**/assets/badge-build/**',async route=>{if(new URL(route.request().url()).pathname.endsWith('/index.js'))return route.continue();intercepted=true;if(mode==='chunk-failed')return route.abort('failed');await gate;await route.continue().catch(()=>{});});
   if(mode==='reduced'){
    const posterGate=new Promise(resolve=>{releasePoster=resolve;});
    await page.route('**/assets/badges/poster-bf.webp',async route=>{posterIntercepted=true;await posterGate;await route.continue().catch(()=>{});});
   }
   const check=(name,pass)=>{row.checks.push({name,pass:!!pass});assert(pass,name);};
   const capture=async name=>page.locator('[data-portfolio-badges]').screenshot({path:`${output}/${name}-${mode}-${width}.png`,animations:'disabled'});
   try{
    // Deferred modules may prevent DOMContentLoaded; the static image must be
    // usable while the response is still held, not only after scripts finish.
    await page.goto(base,{waitUntil:mode==='entry-delayed'?'commit':'domcontentloaded'});
    await page.locator('[data-badge-poster]').waitFor({state:'attached'});await placeHero(page,mode==='no-script');
    if(mode==='chunk-delayed')await page.waitForFunction(()=>document.querySelector('[data-portfolio-badges]').dataset.state==='loading');
    if(mode==='chunk-failed'||mode==='reduced')await page.waitForFunction(()=>document.querySelector('[data-portfolio-badges]').dataset.state==='fallback');
    const initial=await state(page);row.initial=initial;
    check('No legacy HTML cards, CSS cords or old blue hero image exist',initial.legacy===0&&await page.locator('[data-portfolio-badges] img[src*="cena-desconhecidos"]').count()===0);
    check('The same 3D poster is decoded and visible before the live canvas',initial.poster&&initial.decoded&&!initial.canvas);
    check('All four static faces use distinct poster assets',await page.locator('[data-badge-poster]').evaluate(img=>{const sources=['ff','fb','bf','bb'].map(face=>img.getAttribute('data-poster-'+face));return sources.every(src=>src?.includes('/assets/badges/poster-'))&&new Set(sources).size===4;}));
    const before=await capture('poster');
    if(mode.endsWith('delayed')){
     check('The requested module response is genuinely delayed',intercepted);
     await startFrames(page);await page.waitForTimeout(250);release();
     await page.waitForFunction(()=>document.querySelector('[data-portfolio-badges]').dataset.state==='ready',null,{timeout:25000});
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     const ready=await state(page),after=await capture('live');row.ready=ready;
     check('A complete live scene replaces the poster exclusively',ready.canvas&&!ready.poster&&ready.legacy===0);
     row.frames=await page.evaluate(()=>{window.__badgeLoadingObserve=false;return window.__badgeLoadingFrames;});
     check('Handoff never displays the poster and canvas together',row.frames.every(frame=>!(frame.poster&&frame.canvas)));
     row.comparison=await compareArt(page,before,after);
     check('Poster and live canvas retain the same artwork and framing',row.comparison.dimensionsMatch&&row.comparison.artPixels>1000&&row.comparison.artMeanDifference<18&&row.comparison.largeDifferenceRatio<.18);
     if(mode==='chunk-delayed'){
      await page.locator('[data-badge-card-flip="0"]').click();await page.waitForTimeout(800);
      const supported=await page.evaluate(()=>{const canvas=document.querySelector('[data-badge-canvas]'),gl=canvas.getContext('webgl2')||canvas.getContext('webgl');window.__badgeLossExtension=gl?.getExtension('WEBGL_lose_context');window.__badgeLossExtension?.loseContext();return !!window.__badgeLossExtension;});
      check('The browser supports an actual WebGL context-loss simulation',supported);
      await page.waitForFunction(()=>document.querySelector('[data-portfolio-badges]').dataset.state==='fallback');await page.locator('[data-badge-poster]').evaluate(img=>img.decode());
      const lost=await state(page);row.contextLost=lost;
      check('Context loss retains the selected face in the same poster design',lost.poster&&!lost.canvas&&await page.locator('[data-badge-poster]').evaluate(img=>img.getAttribute('src')===img.getAttribute('data-poster-bf')));
      await capture('context-lost');await page.evaluate(()=>window.__badgeLossExtension.restoreContext());
      await page.waitForFunction(()=>document.querySelector('[data-portfolio-badges]').dataset.state==='ready',null,{timeout:25000});
      check('Context restoration resumes one renderer with the face preserved',!(await state(page)).poster&&(await state(page)).canvas&&await page.locator('[data-portfolio-badges]').getAttribute('data-fatos-face')==='back');
      await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('[data-badge-swing]').disabled);
      const frozenBefore=await capture('reduced-first-frame');await page.waitForTimeout(200);
      const frozenAfter=await capture('reduced-later-frame'),reducedState=await state(page);
      row.frozenComparison=await compareArt(page,frozenBefore,frozenAfter);
      // Compositor rounding may change one or two RGB levels with no movement.
      check('Enabling reduced motion keeps the existing 3D scene frozen',reducedState.canvas&&!reducedState.poster&&await page.locator('[data-badge-swing]').isDisabled()&&row.frozenComparison.maxDifference<=3&&row.frozenComparison.allMeanDifference<.15);
     }
    }else if(mode!=='no-script'){
     if(mode==='reduced'){
      await page.locator('[data-badge-card-flip="0"]').click();
      await page.waitForTimeout(100);
      const pending=await state(page);check('A pending poster decode retains the previous complete artwork',posterIntercepted&&pending.decoded&&await page.locator('[data-badge-poster]').getAttribute('data-faces')==='ff');
      await page.locator('[data-badge-card-flip="1"]').click();await page.locator('[data-badge-card-flip="0"]').click();
      await page.waitForFunction(()=>document.querySelector('[data-badge-poster]').dataset.faces==='fb');
      const response=page.waitForResponse(url=>url.url().includes('/assets/badges/poster-bf.webp'));releasePoster();await(await response).finished();await page.waitForTimeout(150);
      check('Rapid face changes discard a stale poster after its late decode',await page.locator('[data-badge-poster]').getAttribute('data-faces')==='fb'&&(await state(page)).decoded);
      await page.unroute('**/assets/badges/poster-bf.webp');await page.locator('[data-badge-card-flip="0"]').focus();await page.keyboard.press('Escape');
      await page.waitForFunction(()=>document.querySelector('[data-badge-poster]').dataset.faces==='ff');
     }
     for(const [index,face] of [[0,'bf'],[1,'bb'],[0,'fb'],[1,'ff']]){
      await page.locator(`[data-badge-card-flip="${index}"]`).click();
      await page.waitForFunction(face=>{const img=document.querySelector('[data-badge-poster]');return img.dataset.faces===face&&img.getAttribute('src')===img.getAttribute('data-poster-'+face)&&img.complete&&img.naturalWidth>0;},face);
      const flipped=await state(page);check(`Static controls preserve the 3D design for face ${face}`,flipped.poster&&!flipped.canvas&&flipped.legacy===0);
     }
     if(mode==='reduced')check('Reduced motion avoids downloading the 3D scene',row.chunkRequests.length===0);
    }
    check('No uncaught page errors in the loading scenario',row.errors.length===0);
   }catch(error){row.failure=String(error);await page.screenshot({path:`${output}/failure-${mode}-${width}.png`}).catch(()=>{});console.error(`[badge loading ${width}/${mode}] ${error}`);}
   finally{release();releasePoster?.();await context.close();}
   console.log(`[badge loading ${width}/${mode}] ${row.checks.filter(c=>c.pass).length} passed${row.failure?', FAILED':''}`);
  }
 }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/${process.env.QA_REPORT||'results.json'}`,JSON.stringify(report,null,2));}
if(report.some(row=>row.failure))throw new Error('Badge loading regression failed; inspect qa/badge-loading/results.json');
