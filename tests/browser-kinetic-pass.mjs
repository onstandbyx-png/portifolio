import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||'/tmp/portfolio-qa/package.json');
const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:4174';
await mkdir('qa/kinetic-pass',{recursive:true});
const server=process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4174'},stdio:'inherit'});
for(let i=0;i<55;i++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,180));}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const report=[];
try{
 for(const [width,height] of [[1440,1000],[390,844],[320,740],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,deviceScaleFactor:1});
  const page=await context.newPage();page.setDefaultTimeout(14000);
  const errors=[],checks=[],row={width,height,checks,errors};report.push(row);
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://midia-kit-production-c234.up.railway.app/**',r=>r.abort());
  const check=(label,value)=>{checks.push({label,pass:!!value});assert(value,label);};
  try{
   await page.goto(base+'/?qa=kinetic#estudio-interativo',{waitUntil:'domcontentloaded'});
   const root=page.locator('#estudio-interativo');await root.waitFor();await page.waitForFunction(()=>document.querySelector('#estudio-interativo')?.dataset.ready==='true');
   await page.locator('.ks-stage').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#estudio-interativo')?.dataset.texture==='flow');
   check('isolated section is mounted once',await root.count()===1);
   check('existing hero and sections remain',await page.locator('[data-portfolio-badges]').count()===1&&await page.locator('#editorial').count()===1&&await page.locator('#narrativa-visual').count()===1);
   check('all 1536 source frames are recorded',await root.getAttribute('data-reference-frames')==='1536');
   check('four separate material layers, no embedded demonstration video',await root.locator('[data-layer]').count()===4&&await root.locator('video,iframe').count()===0);
   check('knockout uses actual blend mode',await page.locator('.ks-stencil').evaluate(e=>getComputedStyle(e).mixBlendMode==='multiply'));
   check('pass dimensions match 300x500',await page.locator('.ks-stack').evaluate(e=>e.offsetWidth===300&&e.offsetHeight===500));
   check('one full-surface interpolated original sample stream is active',await root.getAttribute('data-texture')==='flow');
   check('curved WebGL or SVG fallback is available',['webgl','svg'].includes(await root.getAttribute('data-curl')));
   const firstTexture=await root.locator('.ks-canvas').evaluate(c=>c.toDataURL());
   await page.waitForTimeout(330);
   check('texture changes continuously while visible',firstTexture!==await root.locator('.ks-canvas').evaluate(c=>c.toDataURL()));
   await page.locator('[data-ks-pause]').click();await page.locator('.ks-stage').scrollIntoViewIfNeeded();
   const pausedImage=await root.locator('.ks-canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(240);
   check('local pause freezes procedural interpolation',pausedImage===await root.locator('.ks-canvas').evaluate(c=>c.toDataURL()));
   await page.screenshot({path:`qa/kinetic-pass/closed-${width}.png`});
   await page.locator('#ks-peel').evaluate(e=>{e.value='93';e.dispatchEvent(new Event('input',{bubbles:true}));});
   check('peel responds precisely, including while paused',Number(await root.getAttribute('data-peel'))>.9);
   check('fallback fold and physical curve have valid geometry',await page.locator('.ks-flap').getAttribute('d')?.then(d=>d.length>30)&&await page.locator('.ks-fold-hole').getAttribute('transform')?.then(x=>x.startsWith('matrix(')));
   if(await root.getAttribute('data-curl')==='webgl')check('curved WebGL mesh stays active',await root.locator('.ks-curl-webgl').evaluate(c=>c.width>300&&getComputedStyle(c).display!=='none'));

   await page.locator('.ks-stage').scrollIntoViewIfNeeded();await page.screenshot({path:`qa/kinetic-pass/peeled-${width}.png`});
   await page.locator('[data-ks-mode="layers"]').click();
   check('exploded view separates all four layers',Number(await root.getAttribute('data-layers'))>.99&&await page.locator('[data-ks-mode="layers"]').getAttribute('aria-pressed')==='true');
   await page.locator('.ks-stage').scrollIntoViewIfNeeded();await page.screenshot({path:`qa/kinetic-pass/layers-${width}.png`});
   await root.locator('[data-ks-inspect="2"]').click();
   check('individual layer inspection selects typography',await root.getAttribute('data-inspect')==='2'&&await root.locator('[data-ks-inspect="2"]').getAttribute('aria-pressed')==='true');
   check('layer projection stays inside stage horizontally',await page.evaluate(()=>{const r=document.querySelector('.ks-stage').getBoundingClientRect();return [...document.querySelectorAll('#estudio-interativo [data-layer]')].every(e=>{const b=e.getBoundingClientRect();return b.left>=r.left-3&&b.right<=r.right+3;});}));
   await page.locator('[data-ks-mode="custom"]').click();await page.locator('[data-ks-text]').fill('crie!');
   check('text editing changes real knockout type',await page.locator('.ks-word').innerText()==='crie!');
   await page.locator('[data-ks-finish]').selectOption('silver');
   check('finish changes the material',await root.getAttribute('data-finish')==='silver');
   await page.locator('[data-ks-text]').fill('<x>');
   check('user text is not interpreted as HTML',await page.locator('.ks-word').innerText()==='x'&&await root.locator('x').count()===0);
   await page.locator('[data-ks-reset]').click();await page.locator('.ks-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
   check('reset restores piece and content',await page.locator('.ks-word').innerText()==='ideia'&&await root.getAttribute('data-finish')==='gold'&&Number(await root.getAttribute('data-peel'))<.02);
   await page.locator('.ks-grab').focus();await page.keyboard.press('Enter');await page.waitForTimeout(700);
   check('corner has a working keyboard equivalent',Number(await root.getAttribute('data-peel'))>.75);
   await page.locator('[data-ks-reset]').click();await page.locator('.ks-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
   const grab=await page.locator('.ks-grab').boundingBox();
   await page.mouse.move(grab.x+grab.width*.6,grab.y+grab.height*.55);await page.mouse.down();await page.mouse.move(grab.x+grab.width*.4,grab.y+grab.height*.55+115,{steps:8});
   check('pointer drag physically reveals the material',Number(await root.getAttribute('data-peel'))>.2);
   await page.mouse.up();await page.waitForTimeout(1000);
   check('release returns the fold to the corner',Number(await root.getAttribute('data-peel'))<.035);
   await page.locator('[data-ks-replay]').click();await page.locator('.ks-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(450);
   check('reference sequence has a real seekable timeline',await page.locator('.ks-playback').isVisible()&&Number(await page.locator('[data-ks-time]').inputValue())>0);
   await page.locator('[data-ks-time]').evaluate(e=>{e.value='12';e.dispatchEvent(new Event('input',{bubbles:true}));});
   check('reference 12 second frame corresponds to exploded layers',Number(await root.getAttribute('data-layers'))>.99);
   await page.locator('[data-ks-time]').evaluate(e=>{e.value='3.6';e.dispatchEvent(new Event('input',{bubbles:true}));});
   check('reference 3.6 second frame corresponds to full peel',Number(await root.getAttribute('data-peel'))>.9);
   await page.locator('[data-ks-reset]').click();await page.locator('.ks-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
   await page.locator('#motion-toggle').click();const before=await root.locator('.ks-canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(180);
   check('global motion control freezes material canvas',before===await root.locator('.ks-canvas').evaluate(c=>c.toDataURL()));
   await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-ks-mode="layers"]').click();
   check('reduced motion preserves manual exploration',Number(await root.getAttribute('data-layers'))===1);
   check('no document horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   check('controls never overlay the stage',await page.evaluate(()=>{const s=document.querySelector('.ks-stage').getBoundingClientRect(),c=document.querySelector('.ks-controls').getBoundingClientRect();return c.top>=s.bottom-1;}));
   check('no JavaScript exceptions',errors.length===0);
   // Twelve reference checkpoints. Capture the genuine interaction state,
   // not the recorded desktop chrome from the supplied screen capture.
   const checkpoints=[0,.8,1.8,2.7,3.6,4.9,7.5,10.2,12.3,14.7,19.5,25.1];
   for(const second of checkpoints){
     await page.locator('[data-ks-time]').evaluate((e,t)=>{e.value=String(t);e.dispatchEvent(new Event('input',{bubbles:true}));},second);
     await root.locator('.ks-stage').screenshot({path:'qa/kinetic-pass/frames/state-'+width+'-'+String(second).replace('.','_')+'.png'});
   }
  }catch(error){row.failure=String(error);await page.screenshot({path:`qa/kinetic-pass/failure-${width}.png`});}
  await context.close();
 }
}finally{await writeFile('qa/kinetic-pass/results.json',JSON.stringify(report,null,2));await browser.close();server?.kill();}
console.log(JSON.stringify(report,null,2));if(report.some(r=>r.failure))throw new Error('Kinetic pass failed; inspect qa/kinetic-pass/results.json');
