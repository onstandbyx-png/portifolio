import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4173'},stdio:'ignore'});
const records=[];
let browser;
const check=(name,pass,actual)=>{const row={name,pass,actual};records.push(row);console.log(JSON.stringify(row));};
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function seek(page,selector,cursor){
 await page.locator(selector).evaluate((root,cursor)=>{
  const header=matchMedia('(max-width:760px)').matches?64:76;
  const heading=root.querySelector('.rf-heading')?.offsetHeight||0;
  const stage=root.querySelector('.rf-stage,.rg-sticky');
  const travel=root.offsetHeight-heading-stage.offsetHeight;
  scrollTo({top:scrollY+root.getBoundingClientRect().top+heading-header+travel*cursor/2,behavior:'instant'});
 },cursor);
 await frames(page);
 await page.waitForTimeout(100);
}
try{
 let healthy=false;
 for(let i=0;i<50;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 assert(healthy,'Server must be reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[390,844],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height}});page.setDefaultTimeout(12000);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.rf-film[data-ready="true"]',{state:'attached'});
  await page.evaluate(()=>document.fonts.ready);
  await seek(page,'.rf-film',0);
  const metrics=await page.evaluate(async()=>{
   const {readingProgress}=await import('/assets/showcase/scroll-gallery.js');
   const f=document.querySelector('.rf-film'),h=f.querySelector('.rf-heading'),s=f.querySelector('.rf-stage');
   const points=[];for(let i=0;i<=1000;i++){const p=i/1000;if(readingProgress(p)>0&&readingProgress(p)<1)points.push(p);}
   return {fraction:points.at(-1)-points[0],filmInterval:(f.offsetHeight-h.offsetHeight-s.offsetHeight)/2};
  });
  check(`${width}: film passage >=450px`,metrics.filmInterval*metrics.fraction>=450,metrics);
  const alphas=[];
  for(const p of [.499,.501]){await seek(page,'.rf-film',p);alphas.push(await page.locator('[data-rf-plane="0"]').evaluate(e=>Number(e.style.getPropertyValue('--rf-alpha'))));}
  check(`${width}: continuous opacity at midpoint`,alphas.every(a=>a>.35&&a<.9)&&Math.abs(alphas[0]-alphas[1])<.03,alphas);
  const gaps=[];
  for(const p of [.35,.45,.5,.55,.65]){await seek(page,'.rg-scroll-shell',p);gaps.push(await page.evaluate(()=>{const a=document.querySelector('[data-rg-index="0"]').getBoundingClientRect(),b=document.querySelector('[data-rg-index="1"]').getBoundingClientRect();return Math.round(b.top-a.bottom);}));}
  check(`${width}: projected cards remain separated`,gaps.every(g=>g>=12),gaps);
  const delayed=await page.evaluate(async()=>{const {createMotion}=await import('/assets/sections/motion.js');const e=document.createElement('span');document.body.append(e);const a=createMotion().animate(e,[{opacity:0},{opacity:1}],{duration:400,delay:300});const opacity=Number(getComputedStyle(e).opacity);a?.cancel();e.remove();return opacity;});
  check(`${width}: delayed entrance has no flash`,delayed===0,delayed);
  await page.locator('#tab-google').click();await page.waitForTimeout(220);
  const overlap=await page.locator('.sp-campaign-panel').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>({id:e.id,opacity:Number(getComputedStyle(e.querySelector('figure')).opacity),accessible:e.getAttribute('aria-hidden')!=='true'&&!e.inert})));
  check(`${width}: two painted layers, one accessible panel`,overlap.length===2&&overlap.every(e=>e.opacity>0&&e.opacity<1)&&overlap.filter(e=>e.accessible).length===1,overlap);
  await page.evaluate(()=>['meta','tiktok','google','tiktok'].forEach(id=>document.querySelector('#tab-'+id).click()));await page.waitForTimeout(800);
  const final=await page.locator('.sp-campaign-panel').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>e.id));
  check(`${width}: rapid navigation settles on last request`,final.length===1&&final[0]==='panel-tiktok',final);
  const tops=[];
  for(let i=0;i<6;i++){await page.locator('[data-fatos-next]').evaluate(e=>e.click());await frames(page);tops.push(await page.locator('.pf-fatos-display').evaluate(e=>Math.round(e.getBoundingClientRect().top+scrollY)));}
  check(`${width}: Fatos copy does not move the deck`,Math.max(...tops)-Math.min(...tops)<=2,tops);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  check(`${width}: no horizontal overflow`,overflow<=1,overflow);
  await page.close();
 }
}finally{
 await browser?.close();server?.kill();
 await mkdir('qa/motion-rhythm',{recursive:true});
 await writeFile('qa/motion-rhythm/results.json',JSON.stringify(records,null,2));
}
assert(records.length===16&&records.every(r=>r.pass),'Motion rhythm regression failed');
