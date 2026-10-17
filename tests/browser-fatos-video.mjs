/** Frame-by-frame acceptance for Fatos-only persistent card choreography. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const out='qa/fatos-video',port=process.env.PORT||'4184';
const base=(process.env.BASE_URL||'http://127.0.0.1:'+port).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
const reports=[];let browser;
await mkdir(out,{recursive:true});
const pause=ms=>new Promise(ok=>setTimeout(ok,ms));
try{
  let reachable=false;
  for(let i=0;i<80;i++){try{reachable=(await fetch(base+'/health')).ok;if(reachable)break;}catch{}await pause(150);}
  assert(reachable,'Portfolio server available');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const [width,height,reduced] of [[320,740,false],[390,844,false],[1440,900,false],[390,844,true]]){
    const row={width,height,reduced,checks:[],errors:[]};reports.push(row);
    const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
    const page=await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',e=>row.errors.push(e.message));
    const check=(name,passed)=>{row.checks.push({name,pass:!!passed});assert(passed,name);};
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      const deck=page.locator('#colecao[data-ready="true"]');await deck.waitFor();
      await deck.scrollIntoViewIfNeeded();await pause(140);
      const stage=deck.locator('.pf-fatos-stage');
      const cards=deck.locator('[data-fatos-card]');
      check('Six original Fatos cards remain persistent',await cards.count()===6);
      check('Active and adjacent cards form a physically visible stack',await stage.evaluate(el=>{
        const front=el.querySelector('[data-position="0"]'),next=el.querySelector('[data-position="1"]'),previous=el.querySelector('[data-position="5"]');
        const a=front.getBoundingClientRect(),b=next.getBoundingClientRect(),c=previous.getBoundingClientRect();
        return [front,next,previous].every(card=>getComputedStyle(card).visibility==='visible')&&
          b.x>a.x+8&&c.x<a.x-8&&getComputedStyle(el).touchAction==='pan-y';
      }));
      await stage.screenshot({path:out+'/fatos-before-'+width+(reduced?'-reduced':'')+'.png',animations:'disabled'});
      await deck.locator('[data-fatos-next]').click();
      check('Counter and active card update without remounting',await deck.getAttribute('data-active')==='1'&&await cards.count()===6);
      if(!reduced){
        check('Departing Fatos Desconhecidos stays above Fatos Esportes',await stage.evaluate(el=>{
          const a=el.querySelector('[data-fatos-card="desconhecidos"]'),b=el.querySelector('[data-fatos-card="esportes"]');
          return a.classList.contains('is-departing')&&getComputedStyle(a).visibility==='visible'&&
            Number(getComputedStyle(a).zIndex)>Number(getComputedStyle(b).zIndex);
        }));
        await pause(125);
        check('Both outgoing and incoming cards stay visible at mid-transition',await stage.evaluate(el=>{
          const a=el.querySelector('[data-fatos-card="desconhecidos"]'),b=el.querySelector('[data-fatos-card="esportes"]');
          return a.getAnimations().length>0&&b.getAnimations().length>0&&
                 getComputedStyle(a).visibility==='visible'&&getComputedStyle(b).visibility==='visible';
        }));
        await stage.screenshot({path:out+'/fatos-passage-'+width+'.png'});
        await page.waitForFunction(()=>document.querySelector('#colecao .pf-fatos-stage').dataset.motion==='idle',{timeout:2000});
        check('Departure settles and removes overlay',await stage.locator('.is-departing').count()===0);
      }else{
        check('Reduced motion swaps instantly with no flying overlay',await stage.locator('.is-departing').count()===0);
      }
      await deck.locator('[data-fatos-prev]').click();
      check('Reverse arrow returns to Fatos Desconhecidos',await deck.getAttribute('data-active')==='0');
      if(!reduced)await page.waitForFunction(()=>document.querySelector('#colecao .pf-fatos-stage').dataset.motion==='idle',{timeout:2000});
      await deck.locator('.pf-fatos-card.is-active [data-fatos-flip]').click();
      check('Original card reverse still works',await deck.locator('.pf-fatos-card.is-active [data-fatos-back]').getAttribute('aria-hidden')==='false');
      await page.keyboard.press('Escape');
      check('Escape returns the original card front',await deck.locator('.pf-fatos-card.is-active [data-fatos-front]').getAttribute('aria-hidden')==='false');
      if(!reduced){
        await deck.scrollIntoViewIfNeeded();
        const rect=await deck.locator('.pf-fatos-card.is-active').boundingBox();
        const sx=rect.x+rect.width*.68,sy=rect.y+rect.height*.55,ex=sx-Math.min(170,rect.width*.56);
        if(width<500){
          const cdp=await context.newCDPSession(page);
          try{
            await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:sx,y:sy}]});
            for(let k=1;k<=12;k++){
              await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:sx+(ex-sx)*k/12,y:sy}]});
              await pause(17);
            }
            check('The card tracks the real touch and lifts the next Fatos card',await stage.evaluate(el=>el.dataset.dragging==='true'&&el.querySelector('[data-position="1"]').style.transform.includes('translate3d')));
            await stage.screenshot({path:out+'/fatos-drag-'+width+'.png'});
            await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          }finally{await cdp.detach();}
        }else{
          await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(ex,sy,{steps:14});
          check('The mouse drag progressively lifts the next card',await stage.evaluate(el=>el.dataset.dragging==='true'&&el.querySelector('[data-position="1"]').style.transform.includes('translate3d')));
          await stage.screenshot({path:out+'/fatos-drag-'+width+'.png'});
          await page.mouse.up();
        }
        await page.waitForFunction(()=>document.querySelector('#colecao').dataset.active==='1',null,{timeout:5000});
        check('Swipe selects Fatos Esportes without replacing the DOM cards',await cards.count()===6);
      }
      await stage.screenshot({path:out+'/fatos-after-'+width+(reduced?'-reduced':'')+'.png',animations:'disabled'});
      check('No runtime JS errors',row.errors.length===0);
      console.log(JSON.stringify(row));
    }finally{await context.close();}
  }
}finally{
  await browser?.close();server?.kill();
  await writeFile(out+'/results.json',JSON.stringify(reports,null,2));
}
assert(reports.length===4&&reports.every(r=>r.checks.every(c=>c.pass)),'Fatos reference-video regression failed');
