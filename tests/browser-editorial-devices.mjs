import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/editorial-devices',port=process.env.PORT||'4206';
const base=(process.env.BASE_URL||('http://127.0.0.1:'+port)).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
await mkdir(output,{recursive:true});
const results=[];let browser;
try{
 let ready=false;
 for(let i=0;i<90;i++){
  try{ready=(await fetch(base+'/health')).ok;if(ready)break;}catch{}
  await new Promise(resolve=>setTimeout(resolve,170));
 }
 assert(ready,'Portfolio server should be available');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,
  args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[320,740,false],[390,844,false],[768,900,false],[1440,900,false],[390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:width<500,isMobile:width<500,
    deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(16000);
  const row={width,height,reduced,checks:[],errors:[],sizes:[]};results.push(row);
  const check=(name,value,details)=>{const ok=Boolean(value);row.checks.push({name,pass:ok});if(!ok)console.error('FAIL '+width+' '+name,details??'');};
  page.on('pageerror',e=>row.errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const editorial=page.locator('#editorial[data-editorial-ready="true"]');
  await editorial.waitFor();
  await page.locator('#editorial .es-peek').first().waitFor();
  check('All three independently typed hardware objects exist',
    await editorial.locator('.es-hardware').evaluateAll(nodes=>
      nodes.length===3&&['iphone','ipad','macbook'].every(model=>nodes.some(n=>n.dataset.editorialModel===model))));
  check('Exactly one primary and two interactive hardware previews exist',
    await editorial.locator('.es-device').count()===1&&await editorial.locator('.es-peek').count()===2);
  check('Video-reference deck has real depth and two independently posed neighbors',
    await editorial.evaluate(root=>{
      const stage=root.querySelector('.es-stage'),side=[...stage.querySelectorAll('.es-object.es-peek')];
      return root.dataset.editorialReference==='layered-deck-25s'&&
        getComputedStyle(stage).perspective!=='none'&&side.length===2&&
        side.every(el=>getComputedStyle(el).transform.startsWith('matrix3d('));
    }));
  const states=[
    {index:0,kind:'iphone',model:'.df-iphone-pro',selectors:['.df-island','.df-home','.df-metal']},
    {index:1,kind:'ipad',model:'.es-hardware--ipad',selectors:['.ipad-pro-body','.ipad-pro-screen','.ipad-pro-camera','.ipad-pro-home']},
    {index:2,kind:'macbook',model:'.es-hardware--macbook',selectors:['.mbp-lid','.mbp-screen','.mbp-camera','.mbp-hinge','.mbp-base']}
  ];
  for(const state of states){
   await page.locator('[data-editorial-step="'+state.index+'"]').click();
   await page.waitForFunction(expected=>document.querySelector('#editorial')?.dataset.editorialDevice===expected,state.kind);
   await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
   const active=editorial.locator(':scope .es-stage .es-hardware.es-device');
   const model=active.locator(state.model);
   // :scope can match the active root itself; use evaluation instead of
   // assuming the component wraps itself in an extra node.
   check(state.kind+' owns the center stage',await active.evaluate((node,expected)=>
     node.dataset.editorialModel===expected,state.kind));
   check(state.kind+' uses its original dedicated hardware frame',
     await active.evaluate((node,selectors)=>selectors.every(sel=>!!node.querySelector(sel)),state.selectors));
   check('A different physical device occupies each chapter',
     await editorial.locator('[data-es-piece]:not([hidden])').evaluateAll((p,index)=>
       p.length===1&&p[0].dataset.esPiece===String(index),state.index));
   // Wait for any desktop scene transition to settle. Mobile now keeps
   // one stage height through iPhone, iPad and MacBook.
   await page.waitForFunction(()=>{
     const stage=document.querySelector('#editorial [data-editorial-stage]');
     return stage&&Math.abs(stage.getBoundingClientRect().height-parseFloat(stage.style.height))<2;
   },null,{timeout:2200});
   const data=await active.evaluate(el=>{
     const r=el.getBoundingClientRect(),stage=el.closest('[data-editorial-stage]'),s=stage.getBoundingClientRect();
     const nav=document.querySelector('#editorial .es-swipe-nav')?.getBoundingClientRect();
     const next=document.querySelector('#colecao')?.getBoundingClientRect();
     const side=[...stage.querySelectorAll(':scope > .es-peek')].map(btn=>{
       const p=btn.getBoundingClientRect();
       return {top:p.top-s.top,bottom:p.bottom-s.top};
     });
     return {device:el.dataset.editorialModel,screenWidth:r.width,screenHeight:r.height,
       stageHeight:s.height,stageMode:stage.dataset.heightMode,
       stageDocumentTop:s.top+scrollY,navDocumentTop:nav?nav.top+scrollY:null,
       nextDocumentTop:next?next.top+scrollY:null,side,
       viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
   });
   row.sizes.push(data);
   check(state.kind+' remains inside the horizontal viewport',
     data.screenWidth>=198&&data.screenWidth<=width+2&&data.scrollWidth<=width+2,data);
   check('Two side previews remain physically typed and selectable',
     await editorial.locator('.es-peek').evaluateAll(btns=>btns.length===2&&btns.every(b=>
       b.dataset.device!==document.querySelector('#editorial').dataset.editorialDevice&&
       !!b.querySelector('.es-hardware'))));
   if(state.kind==='ipad'){
     const geometry=await active.evaluate(el=>{
       const body=el.querySelector('.ipad-pro-body').getBoundingClientRect();
       const screen=el.querySelector('.ipad-pro-screen').getBoundingClientRect();
       return {bodyRatio:body.width/body.height,screenRatio:screen.width/screen.height,camera:!!el.querySelector('.ipad-pro-camera'),
         island:!!el.querySelector('.df-island')};
     });
     check('iPad landscape body is physically proportioned and not a stretched iPhone',
       geometry.bodyRatio>1.29&&geometry.bodyRatio<1.33&&geometry.screenRatio>1.23&&
       geometry.screenRatio<1.42&&geometry.camera&&!geometry.island,geometry);
     check('Direção has a CSS-only interface and three functions',
       await active.locator('[data-es-piece="1"] .es-ipad-functions span').count()===3&&await active.locator('[data-es-piece="1"] .es-demo-ipad-window').count()===1&&await active.locator('img').count()===0);
   }
   if(state.kind==='macbook'){
     const geometry=await active.evaluate(el=>{
       const lid=el.querySelector('.mbp-lid').getBoundingClientRect(),base=el.querySelector('.mbp-base').getBoundingClientRect();
       return {lid:lid.width/lid.height,base:base.width/lid.width,left:base.left,right:base.right,viewport:innerWidth};
     });
     check('MacBook reuses the real lid hinge and aluminum base dimensions',
       geometry.lid>1.47&&geometry.lid<1.73&&geometry.base>1.03&&geometry.left>=-3&&geometry.right<=width+3,geometry);
     check('Entrega has original preview and contextual contact action',
       await active.locator('[data-es-piece="2"] .es-demo-mac-copy').innerText().then(text=>text.includes('Uma presença')&&!text.includes('Casa Costa'))&&await active.locator('[data-es-piece="2"]:not([hidden]) [data-es-cta]').count()===1);
   }
   await active.scrollIntoViewIfNeeded();
   await page.waitForTimeout(reduced?25:100);
   await active.screenshot({path:output+'/'+state.kind+'-'+width+(reduced?'-reduced':'')+'.png',animations:'disabled'});
  }
  {
    const heights=row.sizes.map(s=>s.stageHeight);
    const navPositions=row.sizes.map(s=>s.navDocumentTop);
    const nextPositions=row.sizes.map(s=>s.nextDocumentTop);
    check('Scene height matches the selected hardware without large mobile dead zones',
      width<=700?(heights[0]>heights[1]+80&&heights[0]>heights[2]+80&&row.sizes.every(s=>s.stageMode==='compact-by-step')):(Math.max(...heights)-Math.min(...heights)<2.5&&row.sizes.every(s=>s.stageMode==='stable-desktop')),row.sizes);
    check('Arrows and progress follow the current device without overlap',
      navPositions.every(Number.isFinite)&&row.sizes.every(s=>s.navDocumentTop>=s.stageDocumentTop+s.stageHeight-40),row.sizes);
    check('The card gallery follows the active device layout',
      nextPositions.every(Number.isFinite)&&row.sizes.every(s=>s.nextDocumentTop>=s.navDocumentTop),row.sizes);
    check('Side previews fit alongside the active mobile device',
      row.sizes.every(s=>s.side.length===2&&s.side.every(p=>p.top>=-24&&p.bottom<=s.stageHeight+24)),row.sizes);
  }
  await page.locator('#editorial [data-es-prev]').click();
  check('Previous arrow returns to iPad from MacBook',await editorial.getAttribute('data-editorial-device')==='ipad');
  await page.locator('#editorial [data-es-prev]').click();
  check('Second previous arrow returns to iPhone',await editorial.getAttribute('data-editorial-device')==='iphone');
  check('All screens remain readable to assistive technology',await editorial.locator(':scope .es-stage .es-hardware.es-device').getAttribute('aria-hidden')==='false');
  check('No image elements or external editorial brand in either replaced section',await editorial.evaluate(root=>root.querySelectorAll('img').length===0&&!/Fatos Desconhecidos|Fatos Esportes|Fatos Nerd/i.test(root.textContent)));
  check('No script exceptions during device transitions',row.errors.length===0,row.errors);
  console.log(JSON.stringify({width,height,reduced,checks:row.checks,geometry:row.sizes,errors:row.errors}));
  await context.close();
 }
}finally{
 await browser?.close();server?.kill();
 await writeFile(output+'/results.json',JSON.stringify(results,null,2));
}
assert(results.length===5&&results.every(r=>r.checks.every(c=>c.pass)),
  'Editorial device triptych regression failed');
