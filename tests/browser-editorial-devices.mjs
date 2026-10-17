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
  const states=[
    {index:0,kind:'iphone',model:'.df-iphone-pro',selectors:['.df-island','.df-home','.df-metal']},
    {index:1,kind:'ipad',model:'.es-hardware--ipad',selectors:['.ipad-pro-body','.ipad-pro-screen','.ipad-pro-camera','.ipad-pro-home']},
    {index:2,kind:'macbook',model:'.es-hardware--macbook',selectors:['.mbp-lid','.mbp-screen','.mbp-camera','.mbp-hinge','.mbp-base']}
  ];
  for(const state of states){
   await page.locator('[data-editorial-step="'+state.index+'"]').click();
   await page.waitForFunction(expected=>document.querySelector('#editorial')?.dataset.editorialDevice===expected,state.kind);
   const active=editorial.locator(':scope .es-stage > .es-device');
   const model=active.locator(state.model);
   // :scope can match the active root itself; use evaluation instead of
   // assuming the component wraps itself in an extra node.
   check(state.kind+' owns the center stage',await active.evaluate((node,expected)=>
     node.dataset.editorialModel===expected,state.kind));
   check(state.kind+' uses its original dedicated hardware frame',
     await active.evaluate((node,selectors)=>selectors.every(sel=>!!node.querySelector(sel)),state.selectors));
   check('A different physical device occupies each chapter',
     await editorial.locator('[data-es-piece]:not([hidden])').evaluateAll(p=>
       p.length===1&&p[0].dataset.esPiece===String(state.index)));
   const data=await active.evaluate(el=>{
     const r=el.getBoundingClientRect(),stage=el.closest('[data-editorial-stage]'),s=stage.getBoundingClientRect();
     return {device:el.dataset.editorialModel,screenWidth:r.width,screenHeight:r.height,
       stageHeight:s.height,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
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
     check('Contexto retains its image and three functions',
       await active.locator('.es-ipad-functions span').count()===3&&await active.locator('.es-ipad-visual img').count()===1);
   }
   if(state.kind==='macbook'){
     const geometry=await active.evaluate(el=>{
       const lid=el.querySelector('.mbp-lid').getBoundingClientRect(),base=el.querySelector('.mbp-base').getBoundingClientRect();
       return {lid:lid.width/lid.height,base:base.width/lid.width,left:base.left,right:base.right,viewport:innerWidth};
     });
     check('MacBook reuses the real lid hinge and aluminum base dimensions',
       geometry.lid>1.47&&geometry.lid<1.73&&geometry.base>1.03&&geometry.left>=-3&&geometry.right<=width+3,geometry);
     check('Fechamento is Fatos editorial content, not the Casa Costa campaign',
       await active.locator('.es-mac-hero-copy').innerText().then(text=>text.includes('UMA HISTÓRIA COMPLETA')&&!text.includes('Casa Costa')));
   }
   await active.scrollIntoViewIfNeeded();
   await page.waitForTimeout(reduced?25:100);
   await active.screenshot({path:output+'/'+state.kind+'-'+width+(reduced?'-reduced':'')+'.png',animations:'disabled'});
  }
  if(width<500){
    check('Horizontal devices use less vertical space than the portrait iPhone',
      row.sizes[1].stageHeight<row.sizes[0].stageHeight*.82&&row.sizes[2].stageHeight<row.sizes[0].stageHeight*.86,row.sizes);
  }
  await page.locator('#editorial [data-es-prev]').click();
  check('Previous arrow returns to iPad from MacBook',await editorial.getAttribute('data-editorial-device')==='ipad');
  await page.locator('#editorial [data-es-prev]').click();
  check('Second previous arrow returns to iPhone',await editorial.getAttribute('data-editorial-device')==='iphone');
  check('All screens remain readable to assistive technology',await editorial.locator(':scope .es-stage > .es-device').getAttribute('aria-hidden')==='false');
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
