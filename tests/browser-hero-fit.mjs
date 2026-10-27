import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
// First screen of the Planes hero "Do anúncio ao caixa.": the title and description are readable at the first
// paint (no opacity 0), the words never join on phones, the main action fits the landscape phone, there is no
// cream band at the top or at the bottom of the first screen, the touch targets of the header have 44 px and
// the journey sits whole inside the first screen on desktop.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/hero-fit';await mkdir(output,{recursive:true});
const port=process.env.PORT||'4197';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
let browser;const report=[];
const CREAM='243,241,233';
try{
 let up=false;for(let i=0;i<60;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert(up,'app is reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [width,height,touch] of [[320,568,true],[375,812,true],[390,844,true],[844,390,true],[768,1024,true],[1440,900,false],[1920,1080,false]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:1});
  const row={width,height,touch,checks:[],errors:[]};report.push(row);page.on('pageerror',e=>row.errors.push(String(e)));
  const check=(name,pass,detail)=>row.checks.push({name,pass:!!pass,detail});
  await page.goto(base,{waitUntil:'commit'});
  // 50 ms after the first byte the title is already opaque (the entrance only moves it).
  await page.waitForSelector('#hero-title',{state:'attached'});await page.waitForTimeout(50);
  check('the title is opaque from the first paint',await page.evaluate(()=>getComputedStyle(document.getElementById('hero-title')).opacity==='1'&&getComputedStyle(document.querySelector('.ph-description')).opacity==='1'));
  await page.waitForLoadState('load');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
  const m=await page.evaluate(()=>{
   const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
   const hero=document.querySelector('.planes-hero');
   return {hero:box(hero),bg:getComputedStyle(hero).backgroundColor,title:document.getElementById('hero-title').innerText.replace(/\s+/g,' ').trim(),
    description:document.querySelector('.ph-description').innerText,primary:box(document.querySelector('.ph-primary')),journey:box(document.querySelector('.ph-journey')),
    taps:['.sn-pause','.sn-mobile-toggle','.sn-start','.sn-brand'].map(s=>{const el=document.querySelector(s);const r=el?.getBoundingClientRect();return [s,r&&getComputedStyle(el).display!=='none'?[Math.round(r.width),Math.round(r.height)]:null];}),
    labels:[...document.querySelectorAll('.ph-eyebrow,.ph-honesty,.ph-chip')].map(el=>parseFloat(getComputedStyle(el).fontSize)),
    scrollWidth:document.documentElement.scrollWidth};
  });row.metrics=m;
  check('the hero is the dark band from the top edge',m.bg==='rgb(8, 9, 9)'&&m.hero.top<=0.5&&m.hero.left<=1);
  check('the title reads "Do anúncio ao caixa."',m.title==='Do anúncio ao caixa.',m.title);
  check('the description has the offer and no joined words',m.description.includes('Crio a campanha, a conversa e o sistema')&&!/empresacomunicar|[a-zà-ú][A-ZÀ-Ú]/.test(m.description),m.description);
  check('labels of the hero have at least 12 px',m.labels.every(size=>size>=12),m.labels);
  check('no horizontal overflow',m.scrollWidth<=width+1,m.scrollWidth);
  if(width===844)check('landscape phone: the main action fits the first screen',m.primary.bottom<=390,m.primary.bottom);
  if(width<=390)for(const [selector,size] of m.taps)if(size)check(`${selector} is a 44 px target`,size[0]>=44&&size[1]>=44,size);
  if(width===1440)check('desktop: the whole journey is inside the first screen',m.journey.top>=0&&m.journey.bottom<=height&&m.journey.right<=width,m.journey);
  // Pixel rows: no cream band (rgb 243,241,233) at the top of a large screen or at the foot of the first screen.
  const shot=await page.screenshot();
  const rows=await page.evaluate(async ({png,width,height})=>{
   const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();
   const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');x.drawImage(img,0,0);
   const row=y=>{const d=x.getImageData(0,y,width,1).data;const s=new Set();for(let i=0;i<d.length;i+=4)s.add(d[i]+','+d[i+1]+','+d[i+2]);return [...s];};
   return {top:[...row(0),...row(1)],bottom:Array.from({length:8},(_,i)=>row(height-1-i)).flat()};
  },{png:shot.toString('base64'),width,height});
  if(width===1920)check('rows 0 and 1 are never cream',!rows.top.includes(CREAM));
  if(width===1440)check('the last 8 rows of the first screen are never cream',!rows.bottom.includes(CREAM));
  check('no runtime errors',row.errors.length===0,row.errors);
  await page.screenshot({path:`${output}/first-screen-${width}x${height}.png`});
  console.log(`[hero-fit ${width}x${height}] ${row.checks.filter(c=>c.pass).length}/${row.checks.length}`,row.checks.filter(c=>!c.pass).map(c=>c.name+' '+JSON.stringify(c.detail??'')).join(' | '));
  await page.close();
 }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
assert(report.length===7&&report.every(r=>r.checks.every(c=>c.pass)),'Hero first-screen contracts failed');
console.log('PASS: hero first screen');
