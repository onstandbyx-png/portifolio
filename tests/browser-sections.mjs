import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,cp} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||'/tmp/portfolio-qa/package.json');
const {chromium}=require('playwright');
const base=process.env.QA_URL||'http://127.0.0.1:4173';
await mkdir('qa/source',{recursive:true});
for(const p of ['index.html','src','public','server.mjs','package.json','scripts','tests'])await cp(p,'qa/source/'+p,{recursive:true});
const server=process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4173'},stdio:'inherit'});
for(let i=0;i<50;i++){try{if((await fetch(base+'/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,200));}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report=[];
try{
 for(const [width,height] of [[1440,900],[390,844],[320,740]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500});
  const page=await context.newPage();page.setDefaultTimeout(12000);
  // The portfolio must not rely on the Fatos preview remaining online.
  await page.route('https://midia-kit-production-c234.up.railway.app/**',route=>route.abort());
  const errors=[],checks=[],result={width,height,checks,errors};report.push(result);
  page.on('pageerror',e=>errors.push(String(e)));
  const check=(label,value)=>{checks.push({label,pass:!!value});assert(value,label)};
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForSelector('html.sm-sections-ready');
   check('All section modules initialized',await page.evaluate(()=>['smWorks','smEditorial','smExperience','smAds','smSystems','smContact','smNavigation'].every(k=>document.documentElement.dataset[k]==='ready')));
   check('Existing badge hero retained',await page.locator('[data-portfolio-badges]').count()===1);
   await page.locator('#trabalhos').scrollIntoViewIfNeeded();
   await page.locator('.sm-work-peek').first().click();await page.waitForTimeout(750);
   check('Project reverses to meaningful back',await page.locator('.sm-work-peek').first().getAttribute('aria-expanded')==='true');
   await page.screenshot({path:`qa/works-back-${width}.png`});
   await page.locator('.sm-work-peek').first().click();await page.waitForTimeout(750);
   await page.locator('[data-case="fatos"]').click();await page.waitForTimeout(700);
   check('Case dialog opens',await page.locator('#case-dialog').evaluate(d=>d.open));
   const thumbs=page.locator('.sm-case-thumbs button');
   if(await thumbs.count()){await thumbs.nth(1).click();check('Original Fatos page selectable',await page.locator('#dialog-image img').getAttribute('src')==='/assets/fatos-roteiro.webp');}
   await page.locator('#dialog-image img').evaluate(im=>im.decode().catch(()=>{}));await page.waitForTimeout(750);
   await page.screenshot({path:`qa/case-${width}.png`});
   await page.locator('#dialog-close').click();
   await page.waitForFunction(()=>!document.querySelector('#case-dialog').open,{},{timeout:3000});
   check('Dialog closes after the transition',!(await page.locator('#case-dialog').evaluate(d=>d.open)));
   await page.locator('.editorial-step').nth(1).click();await page.waitForTimeout(1000);
   check('Editorial chapter changes',await page.locator('.sm-story-count').innerText()==='02 / 03');
   await page.screenshot({path:`qa/editorial-${width}.png`});
   await page.locator('[data-device="mobile"]').click();await page.waitForTimeout(700);
   check('Device changes to mobile',await page.locator('.sm-device').getAttribute('data-mode')==='mobile');
   await page.locator('[data-demo-page="projeto"]').click();await page.locator('button[data-tone="dark"]').click();await page.waitForTimeout(800);
   check('Specimen navigation and theme',await page.locator('.sm-device').getAttribute('data-tone')==='dark'&&await page.locator('.sm-experience').getAttribute('data-page')==='projeto');
   const contrast=await page.locator('.sm-interactive-experience .immersive-content a').evaluate(el=>{
    const s=getComputedStyle(el),l=c=>{const v=(c.match(/[\d.]+/g)||[]).slice(0,3).map(x=>Number(x)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722};
    const f=l(s.color),b=l(s.backgroundColor);return(Math.max(f,b)+.05)/(Math.min(f,b)+.05);
   });
   check('Experience CTA contrast >=4.5',contrast>=4.5);
   await page.locator('.sm-experience').evaluate(el=>window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));await page.waitForTimeout(300);
   await page.screenshot({path:`qa/experience-${width}.png`});
   await page.locator('[data-ad-tab="meta"]').click();await page.waitForTimeout(700);
   for(const channel of ['meta','tiktok']){
    await page.locator(`[data-ad-tab="${channel}"]`).click();await page.waitForTimeout(700);
    const image=page.locator(`#panel-${channel} img`).first();
    const decoded=await image.evaluate(async im=>{im.loading='eager';try{await im.decode();return im.naturalWidth>0}catch{return false}});
    check(`${channel}: local reference image decoded`,decoded);
    check(`${channel}: independent of external preview`,(await image.getAttribute('src'))===({meta:'/assets/fatos-desconhecidos.webp',tiktok:'/assets/fatos-narrativa-detail.webp'})[channel]);
   }
   await page.locator('[data-frame="2"]').click();await page.waitForTimeout(750);
   check('Storyboard frame selected',await page.locator('.vertical-video').getAttribute('data-frame')==='2');
   await page.locator('.vertical-video').evaluate(el=>window.scrollTo({top:window.scrollY+el.getBoundingClientRect().top-85,behavior:'instant'}));await page.waitForTimeout(200);
   await page.screenshot({path:`qa/ads-${width}.png`});
   await page.locator('[data-ad-tab="google"]').click();await page.waitForTimeout(700);
   check('Google channel selected',await page.locator('[data-ad-tab="google"]').getAttribute('aria-selected')==='true');
   await page.locator('.system-step').nth(3).click();await page.waitForTimeout(700);
   check('Evidence graph advances',await page.locator('.sm-network').getAttribute('data-step')==='3');
   await page.screenshot({path:`qa/systems-${width}.png`});
   await page.locator('#brief').fill('Verificação local do briefing, sem envio.');
   check('Briefing preview reflects input',await page.locator('.sm-brief-summary p').innerText()==='Verificação local do briefing, sem envio.');
   check('No page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
   await page.locator('.sm-work-peek').first().click();
   check('Reduced motion preserves controls',await page.locator('.sm-work-peek').first().getAttribute('aria-expanded')==='true');
   check('No JavaScript exceptions',errors.length===0);
  }catch(e){result.failure=String(e);await page.screenshot({path:`qa/failure-${width}.png`});await writeFile(`qa/failure-${width}.html`,await page.content());}
  await context.close();
 }
}finally{await writeFile('qa/results.json',JSON.stringify(report,null,2));await browser.close();server?.kill();}
console.log(JSON.stringify(report,null,2));
if(report.some(r=>r.failure))throw new Error('Browser interaction checks failed; inspect qa/results.json');
