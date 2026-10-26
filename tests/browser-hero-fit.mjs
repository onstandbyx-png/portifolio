import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
// First-screen fit of the Planes hero (smiile cc19ed2 port): the headline, the two actions and the
// header pill stay inside the viewport on phones, tablets requesting the desktop site and desktops.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/hero-fit';await mkdir(output,{recursive:true});
const base=(process.env.BASE_URL||'http://127.0.0.1:4197').replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4197'},stdio:'ignore'});
let browser;const report=[];
try{
 let up=false;for(let i=0;i<60;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert(up,'app is reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,touch] of [[320,740,true],[360,800,true],[390,844,true],[412,915,true],[430,932,true],[980,1100,true],[1440,900,false]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:1});
  const row={width,height,touch,checks:[],errors:[]};report.push(row);page.on('pageerror',e=>row.errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('.planes-hero')?.dataset.entered==='true',null,{timeout:6000}).catch(()=>{});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const metrics=await page.evaluate(()=>{
    const hero=document.querySelector('.planes-hero'),box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
    return {hero:box(hero),copy:box(hero.querySelector('.ph-copy')),eyebrow:box(hero.querySelector('.ph-eyebrow')),title:box(hero.querySelector('#hero-title')),description:box(hero.querySelector('.ph-description')),actions:[...hero.querySelectorAll('.ph-actions a')].map(box),footnote:box(hero.querySelector('.ph-footnote')),scroll:box(hero.querySelector('.ph-scroll')),
      bar:box(document.querySelector('#site-header .sn-bar')),lines:Math.round(hero.querySelector('#hero-title').getBoundingClientRect().height/parseFloat(getComputedStyle(hero.querySelector('#hero-title')).lineHeight)),
      scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,viewportHeight:innerHeight,background:getComputedStyle(hero).backgroundColor};
  });row.metrics=metrics;
  const check=(name,pass)=>row.checks.push({name,pass:!!pass});
  const inside=b=>b&&b.left>=-1&&b.right<=metrics.viewport+1;
  // The hero starts a few pixels above the viewport, under the floating header (margin-top -92px in the original).
  check('the hero is the black full-bleed first screen',metrics.background==='rgb(8, 9, 9)'&&metrics.hero.left<=1&&metrics.hero.right>=metrics.viewport-1&&metrics.hero.top<=0&&metrics.hero.height>=metrics.viewportHeight-1);
  check('the header pill sits inside the viewport over the hero',inside(metrics.bar)&&metrics.bar.top>=0&&metrics.bar.bottom<metrics.title.top);
  check('the headline keeps two lines inside the viewport width',metrics.lines===2&&inside(metrics.title));
  check('the header never covers the eyebrow',metrics.eyebrow.top>=metrics.bar.bottom+8);
  check('eyebrow, description, actions and footnote stay inside the viewport width',[metrics.eyebrow,metrics.description,metrics.footnote,...metrics.actions].every(inside));
  check('both actions are 44px targets',metrics.actions.length===2&&metrics.actions.every(a=>a.height>=44));
  if(height>=800||width>=960)check('on common screens the actions share the first screen with the headline',metrics.actions.every(a=>a.bottom<=metrics.viewportHeight+1));
  check('the scroll cue stays at the bottom of the first screen',metrics.scroll.bottom<=metrics.hero.bottom&&metrics.scroll.top>metrics.footnote.bottom);
  check('no horizontal document overflow',metrics.scrollWidth<=width+2);check('no runtime errors',row.errors.length===0);
  await page.screenshot({path:`${output}/first-screen-${width}.png`,animations:'disabled'});
  await page.locator('.planes-hero').screenshot({path:`${output}/hero-${width}.png`,animations:'disabled'});
  console.log(JSON.stringify(row));await page.close();
 }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
assert(report.length===7&&report.every(r=>r.checks.every(c=>c.pass)),'Hero first-screen fit contracts failed');
