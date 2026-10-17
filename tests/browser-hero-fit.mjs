import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/hero-fit';await mkdir(output,{recursive:true});
const base=(process.env.BASE_URL||'http://127.0.0.1:4197').replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4197'},stdio:'ignore'});
let browser;const report=[];
try{
 let up=false;for(let i=0;i<60;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert(up,'app is reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,touch] of [[320,740,true],[390,844,true],[980,1100,true],[1440,900,false]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:1});
  const row={width,height,touch,checks:[],errors:[]};report.push(row);page.on('pageerror',e=>row.errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>['ready','fallback'].includes(document.querySelector('[data-portfolio-badges]')?.dataset.state),null,{timeout:18000}).catch(()=>{});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const metrics=await page.evaluate(()=>{
    const hero=document.querySelector('.hero-v2'),surface=hero.querySelector('.hero-surface'),copy=hero.querySelector('.hero-copy'),exhibit=hero.querySelector('.hero-badge-exhibit'),stage=hero.querySelector('.hero-badge-stage'),controls=hero.querySelector('.hero-badge-controls');
    const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY,left:r.left,right:r.right,width:r.width,height:r.height};};
    return {surface:box(surface),hero:box(hero),copy:box(copy),exhibit:box(exhibit),stage:box(stage),controls:box(controls),title:box(hero.querySelector('h1')),sameSurface:!!surface&&surface.contains(copy)&&surface.contains(exhibit),scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,header:box(document.querySelector('.site-header')),exhibitBackground:getComputedStyle(exhibit).backgroundColor,exhibitShadow:getComputedStyle(exhibit).boxShadow};
  });row.metrics=metrics;
  const check=(name,pass)=>row.checks.push({name,pass:!!pass});
  check('copy and badge belong to one shared hero surface',metrics.sameSurface);
  check('no nested pale showcase panel competes with the shared surface',metrics.exhibitBackground==='rgba(0, 0, 0, 0)'&&metrics.exhibitShadow==='none');
  check('controls sit below the actual artwork instead of delaying its entrance',metrics.controls.top>=metrics.stage.bottom-2);
  if(width>=960){check('desktop and desktop-request touch keep badge beside copy',metrics.copy.right<=metrics.exhibit.left+2);check('badge and copy occupy the same vertical composition',Math.min(metrics.copy.bottom,metrics.exhibit.bottom)-Math.max(metrics.copy.top,metrics.exhibit.top)>=metrics.copy.height*.8);}
  else{check('mobile title stays compact and the live object arrives early',metrics.title.height<=160&&metrics.stage.top<=580);}
  check('no horizontal document overflow',metrics.scrollWidth<=width+2);check('no runtime errors',row.errors.length===0);
  await page.screenshot({path:`${output}/first-screen-${width}.png`,animations:'disabled'});
  await page.locator('.hero-v2').screenshot({path:`${output}/hero-${width}.png`,animations:'disabled'});
  console.log(JSON.stringify(row));await page.close();
 }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
assert(report.length===4&&report.every(r=>r.checks.every(c=>c.pass)),'Hero integration and mobile presence contracts failed');
