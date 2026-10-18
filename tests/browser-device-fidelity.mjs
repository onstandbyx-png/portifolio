import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/device-fidelity';
await mkdir(output,{recursive:true});
const base=(process.env.BASE_URL||'http://127.0.0.1:4188').replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4188'},stdio:'ignore'});
let browser;const reports=[];
const check=(row,name,pass,details)=>{row.checks.push({name,pass:!!pass,details});if(!pass)console.error('FAIL '+row.width+': '+name,details);};
try{
 let healthy=false;
 for(let n=0;n<80;n++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(r=>setTimeout(r,150));}
 assert(healthy,'Portfolio server available');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[320,740,false],[390,844,false],[768,900,false],[1440,900,false],[390,844,true]]){
  const row={width,height,reduced,checks:[],errors:[],geometry:{}};reports.push(row);
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();
  page.on('pageerror',e=>row.errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('#editorial .es-device').waitFor();
  await page.locator('#narrativa-visual[data-ready="true"]').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const phones=page.locator('.df-iphone-pro');
  check(row,'All shared smartphone frames use the iPhone Pro hardware treatment',await phones.count()>=2&&await phones.evaluateAll(v=>v.every(el=>el.dataset.model==='iphone-pro')));
  check(row,'Each physical phone has a Dynamic Island instead of a circular Android camera',await phones.evaluateAll(v=>v.every(el=>el.querySelector('.df-island')&&getComputedStyle(el.querySelector('.df-island')).display!=='none'&&getComputedStyle(el.querySelector('.df-camera')).display==='none')));
  check(row,'iPhone includes titanium rails, home indicator and tactile side buttons',await phones.evaluateAll(v=>v.every(el=>el.querySelectorAll('.df-side-button').length===4&&el.querySelector('.df-metal')&&el.querySelector('.df-home'))));
  const phone=page.locator('#editorial .es-device');
  const island=phone.locator('.df-island');
  const frame=await phone.boundingBox(),pill=await island.boundingBox();
  row.geometry.iphone={frame,pill};
  check(row,'Island centered and proportionate to phone body',!!frame&&!!pill&&pill.width>frame.width*.17&&pill.width<frame.width*.45&&Math.abs(pill.x+pill.width/2-frame.x-frame.width/2)<3);
  check(row,'Abertura uses one real iPhone screen and retains home indicator',await phone.locator('.df-screen [data-es-piece="0"]').count()===1&&await phone.locator('.df-home').count()===1);
  await page.locator('#editorial [data-es-piece="0"] .es-piece-art').evaluate(img=>img.decode().catch(()=>{}));
  check(row,'Editorial photo loads into the iPhone preview before it is shown',await page.locator('#editorial [data-es-piece="0"] .es-piece-art').evaluate(img=>img.complete&&img.naturalWidth>0));
  check(row,'The side previews use the actual iPad and MacBook hardware shells',
    await page.locator('#editorial .es-peek').evaluateAll(peeks=>peeks.length===2&&
      peeks.some(x=>x.dataset.device==='ipad'&&!!x.querySelector('.ipad-pro-body'))&&
      peeks.some(x=>x.dataset.device==='macbook'&&!!x.querySelector('.mbp-base'))));
  const mbp=page.locator('.rf-macbook[data-device="macbook-pro"]');
  check(row,'Casa Costa Site is presented in real laptop anatomy',await mbp.count()===1&&await mbp.locator('.mbp-lid,.mbp-display,.mbp-screen,.mbp-camera,.mbp-hinge,.mbp-base,.mbp-front-groove').count()===7);
  check(row,'Existing Casa Costa photograph and interface survive inside the screen',await mbp.locator('.mbp-screen .rf-web-nav strong').innerText()==='Casa Costa'&&await mbp.locator('.mbp-screen .rf-web-hero img').count()===1);
  await page.locator('#narrativa-visual').scrollIntoViewIfNeeded();
  if(!reduced){
    await page.locator('[data-rx-film-to="2"]').click();
    await page.waitForFunction(()=>document.querySelector('#narrativa-visual')?.dataset.phase==='2',null,{timeout:8000});
  }
  // Off-stage planes are intentionally invisible until the film chooses Site.
  // Never scroll a 3D-transformed off-stage laptop before selecting the step.
  await mbp.scrollIntoViewIfNeeded();
  await page.waitForTimeout(160);
  const geometry=await mbp.evaluate(el=>{
    const d=el.querySelector('.mbp-device'),lid=el.querySelector('.mbp-lid'),screen=el.querySelector('.mbp-screen'),base=el.querySelector('.mbp-base');
    const box=e=>{const r=e.getBoundingClientRect();return{w:r.width,h:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
    return{outer:box(el),device:box(d),lid:box(lid),screen:box(screen),base:box(base),scrollWidth:document.documentElement.scrollWidth,innerWidth};
  });
  row.geometry.macbook=geometry;
  check(row,'Notebook lid retains landscape display proportions',geometry.lid.w>geometry.lid.h*1.48&&geometry.lid.w<geometry.lid.h*1.73,geometry);
  check(row,'Aluminum base extends beyond lid and sits beneath its display',geometry.base.w>geometry.lid.w&&geometry.base.top>=geometry.lid.bottom-9,geometry);
  check(row,'Screen remains inside bezel and displays a usable preview',geometry.screen.w<geometry.lid.w&&geometry.screen.h<geometry.lid.h&&geometry.screen.w>190&&geometry.scrollWidth<=geometry.innerWidth+2,geometry);
  if(width<500)check(row,'Notebook aluminum deck is fully visible on mobile',geometry.base.left>=-2&&geometry.base.right<=geometry.innerWidth+2,geometry);
  if(!reduced){await page.locator('[data-rx-film-to="1"]').click();await page.waitForTimeout(900);await page.locator('[data-rx-film-to="2"]').click();await page.waitForTimeout(900);
    check(row,'Editorial-Social-Site controls still select the website',await page.locator('#narrativa-visual').getAttribute('data-phase')==='2');}
  await page.screenshot({path:output+'/first-screen-'+width+(reduced?'-reduced':'')+'.png',animations:'disabled'});
  await mbp.screenshot({path:output+'/macbook-'+width+(reduced?'-reduced':'')+'.png',animations:'disabled'});
  await page.locator('#editorial .es-device').screenshot({path:output+'/iphone-'+width+(reduced?'-reduced':'')+'.png',animations:'disabled'});
  check(row,'No browser errors during device rendering',row.errors.length===0,row.errors);
  console.log(JSON.stringify({width,height,reduced,checks:row.checks,errors:row.errors}));
  await context.close();
 }
} finally {
 await browser?.close();
 server?.kill();
 await writeFile(output+'/results.json',JSON.stringify(reports,null,2));
}
assert(reports.length===5&&reports.every(r=>r.checks.every(c=>c.pass)),'Device fidelity regression failed');
