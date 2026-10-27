import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
// Acceptance of the hero journey and of the page shell (WP1): the seven journeys, reduced motion, pause with a
// hidden tab, the header that follows the page, anchors under the header, internal links to #sistemas, LCP,
// fonts, render-blocking CSS and its first-screen coverage, the common grid, the 320 px form, retired Fatos
// files answering 404 and the og:image.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/hero-journey';await mkdir(output,{recursive:true});
const port=process.env.PORT||'4198';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const results=[];
const check=(name,pass,detail)=>{results.push({name,pass:!!pass,detail});console.log(`${pass?'ok  ':'FAIL'} ${name}${pass?'':' '+JSON.stringify(detail??'')}`);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
try{
 let up=false;for(let i=0;i<60;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await wait(100);}assert(up,'app is reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 const open=async(width,height,options={})=>{const context=await browser.newContext({viewport:{width,height},...options});const page=await context.newPage();page.errors=[];page.on('pageerror',e=>page.errors.push(String(e)));return {context,page};};

 // 1. Seven journeys, six distinct lines each, and the link follows the chip.
 {const {context,page}=await open(1440,900);
  await page.goto(base,{waitUntil:'load'});await page.waitForSelector('.ph-journey[data-ready]',{timeout:10000});
  const keys=await page.$$eval('.ph-chip',chips=>chips.map(c=>c.dataset.jornada));
  check('seven chips are buttons with aria-pressed',keys.length===7&&await page.$$eval('.ph-chip',c=>c.every(b=>b.tagName==='BUTTON'&&b.hasAttribute('aria-pressed'))),keys);
  for(const key of keys){
   await page.click(`.ph-chip[data-jornada="${key}"]`);await page.waitForFunction(k=>document.querySelector('.ph-journey').dataset.jornada===k,key);await wait(400);
   const s=await page.evaluate(()=>({lines:[...document.querySelectorAll('.hj-log li')].map(li=>li.textContent.trim()),href:document.querySelector('.hj-link').getAttribute('href'),pressed:document.querySelector('.ph-chip[aria-pressed="true"]').dataset.jornada,screen:document.querySelector('.hj-screen').textContent,card:document.querySelector('.hj-card').textContent}));
   check(`${key}: 6 distinct log lines`,s.lines.length===6&&new Set(s.lines).size===6,s.lines);
   check(`${key}: the link goes to #sistemas/${key}`,s.href===`#sistemas/${key}`&&s.pressed===key,s.href);
   check(`${key}: no unresolved token, placeholder or number in the log`,!/\{|\}|Exemplo|\[RT|0000-0000/.test(s.screen+s.card)&&!s.lines.some(l=>/\d/.test(l)),s.lines);
   await page.locator('.ph-journey').screenshot({path:`${output}/journey-${key}.png`});
  }
  check('AI agents present themselves as virtual assistants',await page.evaluate(async()=>{const data=await (await fetch('/assets/planes/hero-journeys.json')).json();return ['agente','rcs'].every(k=>JSON.stringify(data[k].app).includes('assistente virtual'))&&data.voz.app.itens.some(i=>i.q==='ia'&&/assistente virtual/.test(i.t));}));
  check('no errors while switching journeys',page.errors.length===0,page.errors);
  await context.close();}

 // 2. Reduced motion: final frame with six lines lit and nothing running inside the journey.
 {const {context,page}=await open(390,844,{reducedMotion:'reduce'});
  await page.goto(base,{waitUntil:'load'});await page.waitForSelector('.ph-journey[data-ready]',{timeout:10000});await wait(600);
  const r=await page.evaluate(()=>({on:document.querySelectorAll('.hj-log li.is-on').length,running:document.querySelector('.ph-journey').getAnimations({subtree:true}).filter(a=>a.playState==='running').length}));
  check('reduced motion: 6 lines lit and no running animation',r.on===6&&r.running===0,r);
  await context.close();}

 // 3. A hidden tab stops the loop for 3 s.
 {const {context,page}=await open(1440,900);
  await page.goto(base,{waitUntil:'load'});await page.waitForSelector('.ph-journey[data-ready]',{timeout:10000});await wait(1800);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
  const before=await page.evaluate(()=>document.querySelector('.ph-journey').dataset.beat);await wait(3000);
  const after=await page.evaluate(()=>document.querySelector('.ph-journey').dataset.beat);
  check('hidden tab: the journey stays on the same beat for 3 s',before===after,{before,after});
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'));});
  await wait(3500);
  check('visible again: the journey moves on',await page.evaluate(b=>document.querySelector('.ph-journey').dataset.beat!==b,after));
  await context.close();}

 // 4. Header that follows the page and anchors under it (390 x 844).
 {const {context,page}=await open(390,844,{hasTouch:true,isMobile:true});
  await page.goto(base,{waitUntil:'load'});await wait(800);
  await page.evaluate(()=>scrollTo(0,3000));await wait(500);
  for(let y=3000;y>=2800;y-=40){await page.evaluate(y=>scrollTo(0,y),y);await wait(60);}
  await wait(600);
  const top=await page.evaluate(()=>{const r=document.getElementById('site-header').getBoundingClientRect();return {top:r.top,bottom:r.bottom,fixed:getComputedStyle(document.getElementById('site-header')).position};});
  check('after scrolling 200 px up, the header is back on screen',top.top>=0&&top.bottom>0&&top.fixed==='fixed',top);
  await page.goto(base+'/#sistemas',{waitUntil:'load'});await wait(1500);
  const a=await page.evaluate(()=>({title:document.getElementById('systems-title').getBoundingClientRect().top,sn:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sn-h'))}));
  check('/#sistemas opens with the title right under the header',a.title>=0&&a.title<=a.sn+24,a);
  const links=await page.$$eval('a[href^="#sistemas"]',l=>l.length);
  check('at least 8 links lead to #sistemas',links>=8,links);
  await context.close();}

 // 5. Performance: LCP, fonts and render-blocking CSS.
 for(const [width,height,slow] of [[390,844,false],[1440,900,false],[390,844,true],[1440,900,true]]){
  const {context,page}=await open(width,height);
  const fonts=new Map();page.on('response',async r=>{if(/\.(?:woff2|ttf)(?:\?|$)/.test(r.url()))fonts.set(r.url(),(await r.body().catch(()=>Buffer.alloc(0))).length);});
  if(slow){const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});}
  await page.addInitScript(()=>{window.__lcp=0;new PerformanceObserver(list=>{for(const e of list.getEntries())window.__lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
  if(!slow)await page.coverage.startCSSCoverage();
  await page.goto(base,{waitUntil:'load',timeout:120000});await wait(slow?5000:2500);
  const lcp=await page.evaluate(()=>window.__lcp);
  check(`LCP ${width}${slow?' (CPU 4x, slow 4G)':''} < ${slow?2500:1200} ms`,lcp>0&&lcp<(slow?2500:1200),Math.round(lcp));
  if(!slow){
   const total=[...fonts.values()].reduce((a,b)=>a+b,0);
   check(`fonts on first load ${width}: <= 140 KB`,total<=140*1024,[...fonts].map(([u,s])=>[u.split('/').pop(),s]));
   check('no Newsreader preload',!(await page.$('link[rel=preload][href*="Newsreader"]')));
   const headSheets=await page.$$eval('head link[rel=stylesheet]',l=>l.map(x=>x.getAttribute('href')));
   check(`<head> has at most 8 stylesheets (${width})`,headSheets.length<=8,headSheets);
   const cov=await page.coverage.stopCSSCoverage();
   if(width===1440){let used=0,all=0;for(const e of cov){const href=new URL(e.url).pathname+new URL(e.url).search;if(!headSheets.some(h=>h===href||h===new URL(e.url).pathname))continue;all+=e.text.length;used+=e.ranges.reduce((a,r)=>a+r.end-r.start,0);}
    check('1440: the first-screen stylesheets use at least 50% of their bytes',all&&used/all>=.5,`${Math.round(100*used/all)}%`);}
  }
  await context.close();}

 // 6. Common grid: titles align with the first block of their section at 1440 and 1920.
 for(const [width,height] of [[1440,900],[1920,1080]]){
  const {context,page}=await open(width,height);
  await page.goto(base,{waitUntil:'load'});
  const H=await page.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=700){await page.evaluate(y=>scrollTo(0,y),y);await wait(70);}await wait(1200);
  const x=await page.evaluate(()=>{const left=s=>Math.round(document.querySelector(s)?.getBoundingClientRect().left??-1);
   return {paths:[left('#project-paths-title'),left('#project-paths .path-scopes')],contact:[left('#contact-title'),left('#contato .contact-grid')],footer:[left('.site-footer'),left('.site-footer .wordmark')],header:[left('.sn-header'),left('#categorias .container')]};});
  for(const [name,[a,b]] of Object.entries(x))check(`${width}: ${name} aligned (±1 px)`,Math.abs(a-b)<=1,[a,b]);
  await context.close();}

 // 7. 320 x 568: the form fits and nothing is hyphenated.
 {const {context,page}=await open(320,568,{hasTouch:true,isMobile:true});
  await page.goto(base+'/#contato',{waitUntil:'load'});await wait(1200);
  await page.selectOption('#service',{index:5});
  const f=await page.evaluate(()=>{const s=document.getElementById('service');return {sw:s.scrollWidth,cw:s.clientWidth,doc:document.documentElement.scrollWidth,hy:[...document.querySelectorAll('#contato *')].some(el=>getComputedStyle(el).hyphens==='auto')};});
  check('320: the selected service fits its field and the page does not scroll sideways',f.sw<=f.cw&&f.doc<=320,f);
  check('320: no automatic hyphenation in the contact',!f.hy);
  await context.close();}

 // 8. Retired files answer 404; the home and what it loads never mention Fatos.
 for(const path of ['/assets/fatos-desconhecidos.webp','/assets/showcase/fatos-deck.css','/assets/portfolio/static-r8/fatos-editorial.webp','/assets/portfolio/recovered-fatos/README.md'])
  check(`404 ${path}`,(await fetch(base+path)).status===404);
 {const {context,page}=await open(1440,900);const hits=[];
  page.on('response',async r=>{const url=r.url();if(/fatos/i.test(url))hits.push(url);else if(/\.(?:js|css|json|html)(?:\?|$)|\/$/.test(url)){const t=await r.text().catch(()=>'');if(/fatos/i.test(t))hits.push(url);}});
  await page.goto(base,{waitUntil:'load'});const H=await page.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=700){await page.evaluate(y=>scrollTo(0,y),y);await wait(80);}await wait(1500);
  check('full scroll: no URL or text response mentions Fatos',hits.length===0,hits);
  await context.close();}

 // 9. og:image of 1200 x 630.
 {const info=await stat(new URL('../public/assets/creative/og-cover.png',import.meta.url)).catch(()=>null);
  const buf=info?(await import('node:fs')).readFileSync(new URL('../public/assets/creative/og-cover.png',import.meta.url)):null;
  check('og-cover.png is 1200 x 630',buf&&buf.readUInt32BE(16)===1200&&buf.readUInt32BE(20)===630);}
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));}
const failed=results.filter(r=>!r.pass);
console.log(`[hero-journey] ${results.length-failed.length} passed, ${failed.length} failed`);
assert(failed.length===0,'Hero journey contracts failed');
