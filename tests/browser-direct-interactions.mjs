import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const port=process.env.PORT||'4316';
const base=process.env.BASE_URL||`http://127.0.0.1:${port}`;
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
let browser; const results=[];
await mkdir('qa/direct-interactions',{recursive:true});
try {
 for(let i=0;i<60;i++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,150));}
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[320,740,false],[390,844,false],[1440,900,false],[390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(7000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-campaign-flip]').count(),1,'Campaign needs a real, accessible flip control');
  const campaign=page.locator('.sp-flip-card');
  await campaign.scrollIntoViewIfNeeded();
  for(const channel of ['meta','google','tiktok']){
   await page.locator('#tab-'+channel).click();await page.waitForTimeout(700);
   await page.locator('#panel-'+channel+' img').click();await page.waitForTimeout(700);
   assert.equal(await campaign.getAttribute('data-face'),'back','Artwork tap turns campaign');
   assert.equal(await page.locator('[data-campaign-note]').evaluate(e=>e.inert),false);
   await page.locator('[data-note-title]').click();await page.waitForTimeout(700);
   assert.equal(await campaign.getAttribute('data-face'),'front','Reverse tap returns to artwork');
  }
  await page.locator('[data-campaign-flip]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(700);
  assert.equal(await campaign.getAttribute('data-face'),'back');
  await page.keyboard.press('Escape');await page.waitForTimeout(700);
  assert.equal(await campaign.getAttribute('data-face'),'front');
  await page.locator('#panel-meta').evaluate(()=>document.querySelector('#tab-meta').click());
  if(reduced)await page.locator('[data-work-card="fatos"]').scrollIntoViewIfNeeded();
  else await page.locator('[data-rg-to="0"]').click();
  await page.waitForTimeout(900);
  const flip=page.locator('[data-work-card="fatos"] [data-rg-flip]');
  assert.equal(await flip.evaluate(e=>getComputedStyle(e).position),'static','Flip cue is not an image overlay');
  assert.match(await flip.innerText(),/virar/i);
  await flip.click();await page.waitForTimeout(750);assert.equal(await flip.getAttribute('aria-pressed'),'true');
  await page.keyboard.press('Escape');await page.waitForTimeout(750);assert.equal(await flip.getAttribute('aria-pressed'),'false');
  const story=page.locator('#editorial');const phone=story.locator('.es-device');
  await phone.scrollIntoViewIfNeeded();
  assert.equal(await story.getAttribute('data-editorial-swipe'),'ready');
  const drag=async(dx,dy=0)=>{
   const b=await phone.boundingBox();const x=b.x+b.width*.6,y=Math.min(height-140,b.y+b.height*.45);
   if(width<500){
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});await page.waitForTimeout(24);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
   }else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:10});await page.mouse.up();}
   await page.waitForTimeout(700);
  };
  await drag(-110);assert.equal(await story.getAttribute('data-editorial-active'),'context','Left swipe opens context');
  await drag(-110);assert.equal(await story.getAttribute('data-editorial-active'),'closing','Second swipe opens closing');
  await drag(110);assert.equal(await story.getAttribute('data-editorial-active'),'context','Right swipe returns');
  await drag(4,-110);assert.equal(await story.getAttribute('data-editorial-active'),'context','Vertical scroll does not change chapter');
  await phone.scrollIntoViewIfNeeded();await drag(110);assert.equal(await story.getAttribute('data-editorial-active'),'hook');
  await drag(110);assert.equal(await story.getAttribute('data-editorial-active'),'hook','First edge is bounded');
  await phone.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(700);assert.equal(await story.getAttribute('data-editorial-active'),'context');
  const firstTab=story.locator('[data-editorial-step]').first();
  await firstTab.click();await firstTab.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(700);
  assert.equal(await story.getAttribute('data-editorial-active'),'context');
  assert.equal(await story.locator('[data-es-position]').innerText(),'Contexto · 2 de 3','Original keyboard tabs synchronize progress');
  assert.equal(await story.locator('[data-es-piece]:not([hidden])').evaluate(el=>el.inert),false,'Keyboard-selected piece remains accessible');
  assert.equal(await page.locator('.es-device').count(),1,'Single original device retained');
  assert.equal(await story.locator('[data-es-piece]:not([hidden])').count(),1);
  assert.equal(await page.locator('#trilhas').isVisible(),false);
  assert.equal(await page.locator('.es-context').isVisible(),false);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
  assert.deepEqual(errors,[]);
  await page.screenshot({path:`qa/direct-interactions/editorial-${width}-${reduced}.png`,animations:'disabled'});
  await campaign.scrollIntoViewIfNeeded();await page.screenshot({path:`qa/direct-interactions/campaign-${width}-${reduced}.png`,animations:'disabled'});
  results.push({width,height,reduced,status:'PASS'});console.log(JSON.stringify(results.at(-1)));await context.close();
 }
}finally{await writeFile('qa/direct-interactions/results.json',JSON.stringify(results,null,2));await browser?.close();server?.kill();}
