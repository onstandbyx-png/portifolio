import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.QA_PACKAGE||import.meta.url)('playwright');
const output='qa/visual-correction';await mkdir(output,{recursive:true});
const base=process.env.BASE_URL||'http://127.0.0.1:4222';
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4222'},stdio:'ignore'});
let browser;const results=[];
try{
 for(let i=0;i<70;i++){try{if((await fetch(base+'/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[390,844,false],[430,932,false],[1024,768,false],[1440,900,false],[390,844,true]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<500,isMobile:width<500,reducedMotion:reduced?'reduce':'no-preference'});
  page.setDefaultTimeout(12000);
  const row={width,height,reduced,checks:[],errors:[]};results.push(row);
  page.on('pageerror',e=>row.errors.push(e.message));
  const check=(name,pass,detail)=>{row.checks.push({name,pass:!!pass,detail});assert(pass,name)};
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
   await page.waitForSelector('#editorial[data-editorial-ready="true"]');await page.waitForSelector('.campaign-summary');
   const firstArt=await page.locator('.rg-art').first().evaluate(n=>n.getBoundingClientRect().top+scrollY);
   row.firstArt=firstArt;
   if(!reduced&&(width===390||width===1440))check('First gallery artwork is at least as early as the preserved reference',firstArt<=(width===390?1553:1348),firstArt);
   check('Hero leads to the visual work',await page.locator('.hero-actions a').first().getAttribute('href')==='#trabalhos');
   if(width<500)check('Campaign artwork precedes its explanation',await page.evaluate(()=>document.querySelector('.sp-peel-card').getBoundingClientRect().top<document.querySelector('.campaign-summary').getBoundingClientRect().top));
   await page.locator('.es-tabs').evaluate(n=>scrollTo({top:n.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));
   await page.evaluate(()=>{window.originalEditorialNodes=[...document.querySelectorAll('.es-object')];window.originalEditorialFrames=[...document.querySelectorAll('.es-hardware')];});
   const positions=[];
   for(let i=0;i<3;i++){
    await page.locator('[data-editorial-step="'+i+'"]').click();
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    check('Device screen does not load editorial images',await page.locator('#editorial .es-hardware img').count()===0);
    const geometry=await page.evaluate(()=>{
     const stage=document.querySelector('.es-stage'),nav=document.querySelector('.es-swipe-nav');
     const screen=selector=>{const n=document.querySelector(selector),r=n.getBoundingClientRect();return {display:getComputedStyle(n).display,height:r.height}};
     const ipad=document.querySelector('.es-hardware--ipad .es-piece:not([hidden])');
     const visual=ipad.querySelector('.es-ipad-visual'),prototype=visual.querySelector('.es-demo-ipad-window');
     const mac=document.querySelector('.es-hardware--macbook .es-piece:not([hidden])');
     return {stage:stage.getBoundingClientRect().height,nav:nav.getBoundingClientRect().top+scrollY,
      ipadDisplay:getComputedStyle(ipad).display,ipadHeight:ipad.getBoundingClientRect().height,visualHeight:visual.getBoundingClientRect().height,
      ipadPrototypeReady:!!prototype&&prototype.getBoundingClientRect().height>20,macDisplay:getComputedStyle(mac).display,
      sameNodes:window.originalEditorialNodes.every((n,j)=>n===stage.children[j])&&window.originalEditorialFrames.every((n,j)=>n===window.originalEditorialNodes[j].querySelector('.es-hardware'))};
    });
    positions.push(geometry);
    check('Device '+i+': composition survives in center and side previews',geometry.ipadDisplay==='grid'&&geometry.macDisplay==='flex'&&geometry.visualHeight<=geometry.ipadHeight+2&&geometry.ipadPrototypeReady,geometry);
    check('Device '+i+': the same frames stay in their original containers',geometry.sameNodes);
    if(width===390||width===1440)await page.screenshot({path:`${output}/device-${i}-${width}${reduced?'-reduced':''}.png`});
   }
   check('Navigation follows the responsive active device without losing bounds',width<=700?positions.every(x=>x.nav>0&&x.stage>180):Math.max(...positions.map(x=>x.nav))-Math.min(...positions.map(x=>x.nav))<=1,positions);
   await page.locator('[data-editorial-step="0"]').click();
   await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
   if(!reduced){
    await page.locator('[data-editorial-step="1"]').click();
    for(const fraction of [.25,.5,.75]){
     const state=await page.evaluate(fraction=>{
      const objects=[...document.querySelectorAll('.es-object')];
      const frames=objects.map(o=>{const a=o.getAnimations()[0];if(!a)return null;a.pause();a.currentTime=a.effect.getTiming().duration*fraction;return {current:a.currentTime,duration:a.effect.getTiming().duration}});
      return {frames,painted:objects.every(o=>Number(getComputedStyle(o).opacity)>=.6),nav:document.querySelector('.es-swipe-nav').getBoundingClientRect().top+scrollY};
     },fraction);
     check('Objects remain painted at '+fraction,state.painted&&state.frames.every(Boolean)&&(width<=700||Math.abs(state.nav-positions[0].nav)<=1),state);
     if(width===390||width===1440)await page.screenshot({path:`${output}/transition-${fraction}-${width}.png`});
    }
    const interrupted=await page.evaluate(()=>{
     const nodes=[...document.querySelectorAll('.es-object')],before=nodes.map(n=>n.getBoundingClientRect());
     document.querySelector('[data-editorial-step="2"]').click();
     const after=nodes.map(n=>n.getBoundingClientRect());
     return Math.max(...before.map((b,i)=>Math.max(Math.abs(b.x-after[i].x),Math.abs(b.y-after[i].y),Math.abs(b.width-after[i].width),Math.abs(b.height-after[i].height))));
    });
    check('An interrupted selection preserves the painted pose within the adaptive stage',interrupted<=(width<=700?14:2),interrupted);
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    check('Interrupted navigation settles on the latest selection',await page.locator('#editorial').getAttribute('data-editorial-device')==='macbook');
   }else check('Reduced motion selects without spatial animation',await page.locator('.es-object').evaluateAll(nodes=>nodes.every(n=>n.getAnimations().length===0)));
   await page.locator('[data-fatos-next]').click();
   await page.waitForFunction(()=>document.querySelector('#colecao').dataset.active==='1');
   check('Six original CSS cards persist',await page.locator('[data-fatos-card]').count()===6&&await page.locator('#colecao img').count()===0);
   check('No horizontal overflow or runtime errors',row.errors.length===0&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),row.errors);
  }catch(error){row.failure=String(error);await page.screenshot({path:`${output}/failure-${width}${reduced?'-reduced':''}.png`}).catch(()=>{});}
  console.log(JSON.stringify(row));await page.close();
 }
}finally{await browser?.close();server?.kill();await writeFile(output+'/results.json',JSON.stringify(results,null,2));}
assert(results.length===5&&results.every(r=>!r.failure),'Visual correction regression failed');
