import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:4187';
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4187'},stdio:'ignore'});
const output='qa/section-visibility';await mkdir(output,{recursive:true});
const results=[];let browser;
try {
 let healthy=false;for(let i=0;i<60;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(r=>setTimeout(r,150));}assert(healthy,'Server reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[320,740,false],[390,844,false],[1440,900,false],[390,844,true]]) {
  const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:reduced?'reduce':'no-preference'});page.setDefaultTimeout(15000);
  const row={width,height,reduced,checks:[],errors:[]};results.push(row);page.on('pageerror',e=>row.errors.push(String(e)));
  const check=(name,pass)=>{row.checks.push({name,pass:!!pass});assert(pass,name);};
  try {
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('#colecao[data-ready="true"]');await page.waitForSelector('#narrativa-visual[data-ready="true"]',{state:'attached'});await page.evaluate(()=>document.fonts.ready);
   check('Requested editorial explanation is hidden',!await page.locator('.es-context').isVisible());
   check('Retained editorial artwork remains accessible',await page.locator('.es-device').evaluate(n=>n.getAttribute('role')==='group'&&n.getAttribute('aria-hidden')!=='true'&&!!n.getAttribute('aria-label')));
   check('Requested Fatos introduction is hidden',!await page.locator('.pf-fatos-intro').isVisible());
   check('Trilhas is archived outside the visible page',await page.locator('#trilhas[hidden]').count()===1&&!await page.locator('#trilhas').isVisible());
   check('Hidden reading blocks reserve no layout space',await page.locator('.es-context,.pf-fatos-intro,#trilhas').evaluateAll(nodes=>nodes.length===3&&nodes.every(n=>n.getBoundingClientRect().height===0)));
   check('Editorial status remains accessible without a visible block',await page.locator('.es-status').evaluate(n=>{const r=n.getBoundingClientRect();return n.getAttribute('role')==='status'&&r.height<=1&&r.width<=1;}));
   check('The retained editorial artwork is centered',await page.evaluate(()=>{const panel=document.querySelector('.es-panel').getBoundingClientRect(),stage=document.querySelector('.es-stage').getBoundingClientRect();return Math.abs((panel.left+panel.right-stage.left-stage.right)/2)<3;}));
   check('The Fatos deck has no empty text column',await page.evaluate(()=>{const deck=document.querySelector('#colecao').getBoundingClientRect(),display=document.querySelector('.pf-fatos-display').getBoundingClientRect();return Math.abs((deck.left+deck.right-display.left-display.right)/2)<3;}));
   check('Digital navigation reaches the preserved Casa Costa scene',await page.evaluate(()=>{const anchor=document.querySelector('#sites'),film=document.querySelector('#narrativa-visual');return anchor.classList.contains('digital-anchor')&&anchor.getBoundingClientRect().height===0&&Math.abs(anchor.getBoundingClientRect().top-film.getBoundingClientRect().top)<3;}));
   check('Preserved gallery, editorial controls, badges and film remain present',await page.locator('[data-work-card]').count()===3&&await page.locator('[data-editorial-step]').count()===3&&await page.locator('[data-portfolio-badges]').count()===1&&await page.locator('[data-rf-plane]').count()===3);
   await page.locator('[data-editorial-step="1"]').click();check('Editorial artwork still switches',await page.locator('#editorial').getAttribute('data-editorial-active')==='context');
   await page.locator('[data-fatos-next]').click();check('Fatos navigation still works',await page.locator('#colecao').getAttribute('data-active')==='1');
   await page.locator('.pf-fatos-card.is-active [data-fatos-flip]').click();check('Fatos flip still works',await page.locator('.pf-fatos-card.is-active').evaluate(n=>n.classList.contains('is-flipped')));await page.keyboard.press('Escape');
   await page.locator('.pf-fatos-display').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/fatos-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   await page.locator('.es-tabs').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/editorial-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   check('No horizontal overflow or uncaught errors',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)&&row.errors.length===0);
   row.pageHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
  }catch(error){row.failure=String(error);await page.screenshot({path:`${output}/failure-${width}${reduced?'-reduced':''}.png`}).catch(()=>{});}
  await page.close();console.log(JSON.stringify(row));
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base);
 const fallback={noJavaScript:true,pass:!await nojs.locator('.es-context').isVisible()&&await nojs.locator('#trilhas[hidden]').count()===1&&!await nojs.locator('#trilhas').isVisible()&&await nojs.locator('#sites.digital-anchor').count()===1};results.push(fallback);await nojs.close();
}finally{await browser?.close();server?.kill();await writeFile(output+'/results.json',JSON.stringify(results,null,2));}
assert(results.length===5&&results.every(r=>!r.failure&&r.pass!==false),'Requested section visibility regression failed');
