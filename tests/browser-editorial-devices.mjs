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
  // Real screen text (headline, support, labels, controls) keeps a 12px floor;
  // decorative text drawn inside the fictional interfaces never drops below 8px.
  const screenText=()=>page.evaluate(()=>{
    const piece=document.querySelector('#editorial [data-es-piece]:not([hidden])');
    const shown=el=>{for(let n=el;n&&n!==piece.parentElement;n=n.parentElement){const c=getComputedStyle(n);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)===0)return false;}const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
    const walker=document.createTreeWalker(piece,NodeFilter.SHOW_TEXT),small=[];let count=0;
    while(walker.nextNode()){
      const el=walker.currentNode.parentElement;if(!walker.currentNode.textContent.trim()||!shown(el))continue;
      count++;
      const size=parseFloat(getComputedStyle(el).fontSize),floor=el.closest('.ds-variant,.ds-mac-chrome,.ds-window-tag')?8:12;
      if(size<floor-.01)small.push(walker.currentNode.textContent.trim().slice(0,28)+' '+size+'px');
    }
    return {count,small,images:piece.querySelectorAll('img,image').length};
  });
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
     return stage&&stage.dataset.heightMotion!=='glide'&&Math.abs(stage.getBoundingClientRect().height-Number(stage.dataset.stageHeight))<2;
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
   {
     const text=await screenText();
     check(state.kind+' screen text keeps its pixel floors without raster art',text.count>=6&&text.small.length===0&&text.images===0,text);
   }
   if(state.kind==='macbook')check('MacBook contact action keeps a 44px touch target',
     await active.locator('[data-es-piece="2"] [data-es-cta]').evaluate(a=>a.getBoundingClientRect().height>=44));
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
  {
    // Desafio: one choice drives the iPhone, the iPad direction and the MacBook result.
    const status=()=>page.locator('#editorial [data-es-status]').textContent();
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    await page.locator('#editorial [data-es-piece="0"] [data-es-choice="sistema"]').click();
    check('Choosing on the iPhone presses one option and announces the project',
      await page.locator('#editorial [data-es-piece="0"] [data-es-choice][aria-pressed="true"]').evaluateAll(b=>b.length===1&&b[0].dataset.esChoice==='sistema')&&
      await editorial.getAttribute('data-project-choice')==='sistema'&&/Desafio · 1 de 3 · Escolha: Sistema/.test(await status()));
    const go=page.locator('#editorial [data-es-piece="0"] [data-es-go]');
    check('The iPhone continue action is a real 44px control outside swipe gestures',
      await go.count()===1&&/Ver a direção/.test(await go.innerText())&&
      await go.evaluate(b=>b.matches('button[data-no-editorial-swipe]')&&b.getBoundingClientRect().height>=44));
    await go.click();
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialDevice==='ipad');
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    check('Ver a direção opens Direção and moves focus to its tab',
      await page.evaluate(()=>document.activeElement?.id==='editorial-tab-context')&&/Direção · 2 de 3 · Escolha: Sistema/.test(await status()));
    const ipadState=await page.locator('#editorial [data-es-piece="1"]:not([hidden])').evaluate(piece=>{
      const shown=[...piece.querySelectorAll('.ds-variant')].filter(v=>getComputedStyle(v).visibility==='visible').map(v=>v.dataset.dsVariant);
      return {shown,preview:piece.querySelector('[data-es-preview]').textContent,direction:piece.querySelector('[data-es-direction]').textContent,
        functions:[...piece.querySelectorAll('.es-ipad-functions span')].map(n=>n.textContent),
        flow:piece.querySelector('.ds-variant[data-ds-variant="sistema"]').textContent,
        decorative:[...piece.querySelectorAll('.ds-variant')].every(v=>v.getAttribute('aria-hidden')==='true'&&!v.querySelector('a,button,input,[tabindex]')),
        leak:[...piece.querySelectorAll('.es-ipad-visual span')].some(n=>getComputedStyle(n).position==='absolute')};
    });
    check('iPad direction shows only the chosen system flow with human review',
      ipadState.shown.join()==='sistema'&&ipadState.preview==='Painel operacional'&&/Cada pedido/.test(ipadState.direction)&&
      ipadState.functions.length===3&&/Pedido recebido[\s\S]*Triagem[\s\S]*Responsável/.test(ipadState.flow)&&/Revisão humana/.test(ipadState.flow)&&
      ipadState.decorative&&!ipadState.leak,ipadState);
    await page.locator('[data-editorial-step="2"]').click();
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialDevice==='macbook');
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    const macState=await page.locator('#editorial [data-es-piece="2"]:not([hidden])').evaluate(piece=>{
      const board=piece.querySelector('.ds-variant[data-ds-variant="sistema"]');
      return {visible:getComputedStyle(board).visibility==='visible',text:board.textContent,cta:piece.querySelectorAll('[data-es-cta]').length,
        label:piece.querySelector('[data-es-cta-label]').textContent,service:piece.querySelector('[data-es-cta]').dataset.contactService};
    });
    check('MacBook delivers the request board with areas and priorities',
      macState.visible&&/Recebido[\s\S]*Em triagem[\s\S]*Concluído/.test(macState.text)&&/Comercial/.test(macState.text)&&/Alta/.test(macState.text)&&
      macState.cta===1&&macState.label==='Conversar sobre um sistema'&&macState.service==='Sistemas e automações',macState);
    {
      const text=await screenText();
      check('System delivery text keeps its pixel floors',text.small.length===0,text);
    }
    // Hinge: the notebook opens when Entrega becomes active and rests half-closed at the side.
    const lidPose=()=>page.evaluate(()=>{
      const lid=document.querySelector('#editorial .es-hardware--macbook .mbp-lid'),m=new DOMMatrixReadOnly(getComputedStyle(lid).transform);
      return {m22:m.m22,running:lid.getAnimations().filter(a=>a.playState==='running').length,motion:document.querySelector('#editorial').dataset.editorialMotion};
    });
    const open=await lidPose();
    check('The active MacBook lid settles fully open',Math.abs(open.m22-1)<.001&&open.running===0,open);
    await page.locator('[data-editorial-step="1"]').click();
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    const side=await lidPose();
    check('The waiting MacBook rests half-closed',side.m22<.8&&side.m22>.3&&side.running===0,side);
    if(!reduced){
      await page.locator('[data-editorial-step="2"]').click();
      const opening=await lidPose();
      check('Opening the MacBook animates its lid inside the editorial transition',opening.running===1&&opening.motion==='transition',opening);
      await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
      const settled=await lidPose();
      check('Editorial motion stays active until the hinge settles',settled.running===0&&Math.abs(settled.m22-1)<.001,settled);
      // Interruption continues from the painted angle instead of jumping to an endpoint.
      await page.locator('[data-editorial-step="1"]').click();
      await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
      await page.locator('[data-editorial-step="2"]').click();
      const jump=await page.evaluate(()=>{
        const lid=document.querySelector('#editorial .es-hardware--macbook .mbp-lid'),read=()=>new DOMMatrixReadOnly(getComputedStyle(lid).transform).m22;
        // Freeze the opening a little after its delay, then interrupt in the same task.
        const opening=lid.getAnimations()[0];if(!opening)return {before:NaN,after:NaN,delta:NaN};
        opening.pause();opening.currentTime=215;
        const before=read();document.querySelector('[data-editorial-step="1"]').click();const after=read();
        return {before,after,delta:Math.abs(before-after)};
      });
      check('An interrupted hinge continues from its painted angle',jump.before>.3&&jump.before<.999&&jump.delta<.03,jump);
      await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    }else{
      await page.locator('[data-editorial-step="2"]').click();
      const instant=await lidPose();
      check('Reduced motion opens the MacBook lid instantly',instant.running===0&&Math.abs(instant.m22-1)<.001&&instant.motion==='idle',instant);
    }
    // Stage height: glides on mobile when motion is allowed, lands exactly on its target, instant otherwise.
    const glide=await page.evaluate(()=>{
      const stage=document.querySelector('#editorial [data-editorial-stage]'),before=stage.getBoundingClientRect().height;
      document.querySelector('[data-editorial-step="0"]').click();
      return {before,after:stage.getBoundingClientRect().height,target:Number(stage.dataset.stageHeight),mode:stage.dataset.heightMotion,transition:getComputedStyle(stage).transitionProperty};
    });
    const instantTarget=Math.abs(glide.after-glide.target)<1&&glide.mode==='idle';
    check('Stage height glides only when motion is allowed',
      width>700?instantTarget&&Math.abs(glide.before-glide.target)<1:
      reduced?instantTarget:(glide.mode==='glide'&&Math.abs(glide.after-glide.before)<1&&Math.abs(glide.target-glide.before)>80),glide);
    const landed=await page.waitForFunction(()=>{const stage=document.querySelector('#editorial [data-editorial-stage]');
      return stage.dataset.heightMotion==='idle'&&Math.abs(stage.getBoundingClientRect().height-Number(stage.dataset.stageHeight))<1;},null,{timeout:2500}).then(()=>true,()=>false);
    check('Stage height lands exactly on the active device height',landed);
    await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialMotion==='idle');
    await page.locator('#editorial [data-es-piece="0"] [data-es-choice="site"]').click();
  }
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
