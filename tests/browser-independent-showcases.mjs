/** Image-free showcase acceptance: mobile, desktop, reduced motion and six functional backs. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/independent-showcases',port=process.env.PORT||'4249';
const base=(process.env.BASE_URL||'http://127.0.0.1:'+port).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const results=[];let browser;
await mkdir(output,{recursive:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
 let ok=false;for(let i=0;i<80;i++){try{ok=(await fetch(base+'/health')).ok;if(ok)break;}catch{}await pause(150);}
 assert(ok,'Preview web server available');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[320,740,false],[360,800,false],[390,844,false],[430,932,false],[768,900,false],[1440,900,false],[390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(16000);
  const row={width,height,reduced,checks:[],errors:[]};results.push(row);
  page.on('pageerror',e=>row.errors.push(e.message));
  const writes=[];page.on('request',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.method()))writes.push(r.url());});
  await page.addInitScript(()=>{window.__opened=0;window.open=()=>{window.__opened++;return null;};});
  const check=(name,value)=>{row.checks.push({name,pass:!!value});assert(value,name+' at '+width)};
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.locator('#editorial[data-editorial-ready="true"]').waitFor();
   const deck=page.locator('#colecao[data-ready="true"]');await deck.waitFor();
   await page.waitForFunction(()=>document.querySelector('#colecao')?.dataset.deckDemos==='ready');
   check('Zero image elements or legacy visual brands within replaced scenes',
    await page.locator('#editorial').evaluate(root=>root.querySelectorAll('img').length===0&&!/Fatos Desconhecidos|Fatos Esportes|Fatos Nerd|Ecossistema Fatos|@fatos/i.test(root.textContent)));
   check('Three real hardware shells and six original CSS cards',
    await page.locator('#editorial .es-hardware').count()===3&&await deck.locator('.pf-fatos-card').count()===6&&
    await deck.locator('.pf-case-art').count()===6);
   check('All six interactive demos mounted',
    await deck.locator('.fd-demo').count()===6);
   await page.locator('#editorial [data-es-choice="campanha"]').first().click();
   check('Selecting campaign changes the state',await page.locator('#editorial').getAttribute('data-project-choice')==='campanha');
   await page.locator('#editorial [data-editorial-step="1"]').click();
   await page.waitForTimeout(reduced?30:440);
   check('iPad inherits selected campaign',
    await page.locator('#editorial .es-device [data-es-piece="1"]:not([hidden]) [data-es-preview]').innerText().then(s=>s.includes('Campanha multicanal')));
   const ipadHeight=await page.locator('#editorial .es-stage').evaluate(n=>n.getBoundingClientRect().height);
   await page.locator('#editorial [data-editorial-step="2"]').click();
   await page.waitForTimeout(reduced?30:440);
   check('MacBook inherits the same campaign and CTA',
    await page.locator('#editorial .es-device [data-es-piece="2"]:not([hidden]) [data-es-result]').innerText().then(s=>s.includes('Uma oferta'))&&
    await page.locator('#editorial .es-device [data-es-piece="2"]:not([hidden]) [data-es-cta]').count()===1);
   const macHeight=await page.locator('#editorial .es-stage').evaluate(n=>n.getBoundingClientRect().height);
   await page.locator('#editorial [data-editorial-step="0"]').click();
   await page.waitForTimeout(reduced?30:440);
   const phoneHeight=await page.locator('#editorial .es-stage').evaluate(n=>n.getBoundingClientRect().height);
   if(width<=700)check('Mobile stage follows device height instead of reserving an empty iPhone scene',phoneHeight>ipadHeight+75&&phoneHeight>macHeight+75);
   if([320,390,1440].includes(width)){await page.locator('#editorial .es-tabs').scrollIntoViewIfNeeded();await page.locator('#editorial .es-stage').screenshot({path:output+'/device-'+width+'.png',animations:'disabled',timeout:30000});}
   const ids=['sites','conteudo','campanhas','video','lojas','sistemas'];
   for(let i=0;i<ids.length;i++){
    await deck.locator('.pf-fatos-card.is-active [data-fatos-flip]').click();
    await page.waitForTimeout(reduced?40:720); // Card reverse settles before its interactive surface receives a tap.
    check('Card '+ids[i]+' has active responsive demo',await deck.locator('.pf-fatos-card.is-active').getAttribute('data-fatos-card')===ids[i]&&await deck.locator('.pf-fatos-card.is-active .fd-demo').count()===1);
    const active=deck.locator('.pf-fatos-card.is-active');
    check('Card '+ids[i]+' CTA names the conversation it opens',await active.locator('.fd-project-link').innerText().then(s=>/^Conversar sobre/.test(s.trim())));
    if(ids[i]==='sites'){await active.locator('[data-fd-site="app"]').click();check('Site app switch',await active.locator('[data-fd-site-frame]').getAttribute('data-fd-site-frame')==='app');
     await page.keyboard.press('ArrowRight');await page.keyboard.press('End');await page.waitForTimeout(reduced?30:550);
     check('Keys on a demo control keep the card and its back',await deck.getAttribute('data-active')==='0'&&await active.evaluate(card=>card.classList.contains('is-flipped')));
     const heading=await active.locator('[data-fatos-back-title]').boundingBox();await page.mouse.click(heading.x+heading.width/2,heading.y+heading.height/2);await page.waitForTimeout(reduced?30:300);
     check('A tap on the back heading does not turn the card',await active.evaluate(card=>card.classList.contains('is-flipped')));}
    if(ids[i]==='conteudo'){await active.locator('[data-fd-story-next]').click();check('Copy slides',await active.locator('[data-fd-story-counter]').innerText()==='02 / 03');}
    if(ids[i]==='campanhas'){await active.locator('[data-fd-channel="stories"]').click();check('Campaign placements',await active.locator('[data-fd-campaign]').getAttribute('data-fd-campaign')==='stories');}
    if(ids[i]==='video'){await active.locator('[data-fd-video-play]').click();if(!reduced)await pause(90);check('Motion controls',await active.locator('[data-fd-video-time]').count()===1);await active.locator('[data-fd-video-replay]').click();
     await active.locator('.fd-project-link').click();
     check('Video CTA preselects the content front and keeps its demo as brief reference',await page.locator('#service').inputValue()==='Conteúdo e redação'&&await page.locator('#brief-context').innerText().then(s=>s.includes('Vídeo e movimento')));}
    if(ids[i]==='lojas'){await active.locator('[data-fd-variant="clay"]').click();await active.locator('[data-fd-add]').click();check('Simulated cart has feedback',await active.locator('[data-fd-cart]').innerText().then(x=>x.includes('1 item')));}
    if(ids[i]==='sistemas'){await active.locator('[data-fd-flow-next]').click();await active.locator('[data-fd-flow-next]').click();check('Workflow three steps',await active.locator('[data-fd-flow-state]').innerText()==='Pronto');}
    await active.locator('[data-fatos-return]').click();
    if(i<ids.length-1){await deck.locator('[data-fatos-next]').click();await page.waitForTimeout(reduced?30:550);}
   }
   await page.locator('#editorial [data-editorial-step="2"]').click();
   await page.waitForTimeout(reduced?30:690);
   await page.locator('#editorial [data-es-piece="2"]:not([hidden]) [data-es-cta]').click();
   check('Commercial CTA preselects the demonstrated campaign without submitting any data',
     await page.locator('#service').inputValue()==='Campanhas e anúncios'&&writes.length===0&&await page.evaluate(()=>window.__opened)===0);
   check('MacBook CTA label announces a conversation and the brief keeps the chosen project',
     await page.locator('#editorial [data-es-piece="2"]:not([hidden]) [data-es-cta]').innerText().then(s=>/^Conversar sobre uma campanha/.test(s.trim()))&&
     await page.locator('#brief-context').innerText().then(s=>s.includes('Campanha')));
   check('Native page width and browser errors',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3)&&row.errors.length===0);
   if(width===390){await deck.scrollIntoViewIfNeeded();await page.screenshot({path:output+'/cards-mobile.png',animations:'disabled'});}
  }catch(error){row.failure=String(error);await page.screenshot({path:output+'/failure-'+width+'.png'}).catch(()=>{});}
  console.log(JSON.stringify(row));await context.close();
 }
}finally{await browser?.close();server?.kill();await writeFile(output+'/results.json',JSON.stringify(results,null,2));}
assert(results.length===7&&results.every(row=>!row.failure&&row.checks.every(c=>c.pass)),'Independent showcase acceptance failed');
