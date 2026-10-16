import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:4185';
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4185'},stdio:'ignore'});
const output='qa/narrative';await mkdir(output,{recursive:true});
const results=[];let browser;
try{
 let healthy=false;for(let i=0;i<60;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert(healthy);
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[320,740,false],[390,844,false],[1440,900,false],[390,844,true]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:reduced?'reduce':'no-preference'});page.setDefaultTimeout(16000);
  const row={width,height,reduced,checks:[],errors:[],writes:[]};results.push(row);
  page.on('pageerror',e=>row.errors.push(String(e)));
  page.on('request',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.method()))row.writes.push(r.url());});
  const check=(name,pass)=>{row.checks.push({name,pass:!!pass});assert(pass,name);};
  const capture=async name=>page.screenshot({path:`${output}/${name}-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('html[data-static-presentations="ready"]',{state:'attached'});await page.evaluate(()=>document.fonts.ready);
   check('Hero names the actual services',/Conteúdo, campanhas/.test(await page.locator('#hero-title').innerText()));
   check('Native transcript is collapsed and explicitly labelled',await page.locator('details.es-transcript').count()===1&&!await page.locator('.es-transcript').evaluate(e=>e.open));
   row.initial=await page.evaluate(()=>({height:document.documentElement.scrollHeight,sections:Object.fromEntries(['inicio','trabalhos','editorial','laboratorio','narrativa-visual','sistemas','categorias','contato'].map(id=>[id,Math.round((id==='inicio'?document.querySelector('.hero'):document.getElementById(id)).getBoundingClientRect().height)]))}));
   await capture('hero');
   check('Three named gallery shortcuts are present',await page.locator('[data-rg-to]').count()===3);
   check('Digital uses a subtle on-card flip hint instead of a floating icon',await page.locator('#trabalhos .work-smiile .rg-card-interaction-hint').count()===1&&await page.locator('#trabalhos .work-smiile .rg-flip').count()===1);
   check('The Digital preview announces tapping and renders its folded corner',await page.locator('#trabalhos .work-smiile .rg-card-interaction-hint').innerText().then(t=>t.includes('qualquer área'))&&await page.locator('#trabalhos .work-smiile').evaluate(card=>getComputedStyle(card,'::after').content!=='none'));
   if(!reduced){
    await page.locator('[data-rg-to="1"]').click();await page.waitForFunction(()=>document.querySelector('[data-rg-to="1"]').getAttribute('aria-pressed')==='true');await page.waitForTimeout(900);
    await page.locator('[data-work-card="ads"] [data-rg-flip]').click();await page.waitForTimeout(750);
    check('The reverse rewards the click with a decision',await page.locator('#rg-back-ads [data-work-decision]').isVisible());
    await capture('gallery-reverse');
   }
   check('Requested editorial reading blocks are hidden without replacing the artwork',!await page.locator('.es-context').isVisible()&&!await page.locator('.pf-fatos-intro').isVisible()&&await page.locator('.es-device').count()===1);
   await page.locator('[data-editorial-step="1"]').click();check('Editorial selection still updates the active artwork and metadata',await page.locator('#editorial').getAttribute('data-editorial-active')==='context'&&/comparação/.test(await page.locator('[data-es-title]').textContent()));
   const editorialNav=page.locator('#editorial .es-swipe-nav');
   check('Editorial has readable swipe controls and three progress dots',await editorialNav.count()===1&&await editorialNav.locator('[data-es-dot]').count()===3);
   check('The visual carousel renders two usable neighboring phone previews',await page.locator('#editorial .es-peek').count()===2&&await page.locator('#editorial .es-device').count()===1);
   check('The editorial headline matches the visual reference',/Três olhares/.test(await page.locator('#editorial-title').innerText()));
   check('The progress marker follows the selected chapter',await page.locator('[data-es-heading-count]').textContent()==='02 / 03');
   await editorialNav.locator('[data-es-next]').click();
   check('Next arrow reaches Fechamento',await page.locator('#editorial').getAttribute('data-editorial-active')==='closing'&&await editorialNav.locator('[data-es-next]').isDisabled());
   await editorialNav.locator('[data-es-prev]').click();
   check('Previous arrow returns to Contexto',await page.locator('#editorial').getAttribute('data-editorial-active')==='context');
   check('The side previews stay synchronized with Contexto',await page.locator('#editorial .es-peek').evaluateAll(previews=>previews.length===2&&previews.every(preview=>preview.dataset.stepIndex!=='1'&&preview.querySelector('img')?.getAttribute('src')?.startsWith('/assets/portfolio/'))));
   // The side phone intentionally peeks from behind the large central phone.
   // Hit its EXPOSED edge rather than the element center (hidden by the device).
   await page.locator('#editorial [data-editorial-stage]').scrollIntoViewIfNeeded();
   const peekBox=await page.locator('#editorial .es-peek--right').boundingBox();
   const peekX=Math.min(width-13,Math.max(13,peekBox.x+peekBox.width*.33));
   const peekY=Math.max(115,Math.min(height-90,peekBox.y+peekBox.height*.5));
   if(width<500)await page.touchscreen.tap(peekX,peekY);
   else await page.mouse.click(peekX,peekY);
   check('Tapping a side preview navigates to the referenced chapter',await page.locator('#editorial').getAttribute('data-editorial-active')==='closing');
   await page.locator('[data-editorial-step="0"]').click();
   const swipeStage=page.locator('#editorial [data-editorial-stage]');
   await swipeStage.scrollIntoViewIfNeeded();
   const swipeBox=await page.locator('#editorial .es-device').boundingBox();
   const y=Math.max(110,Math.min(height-110,swipeBox.y+swipeBox.height*.5));
   const x0=swipeBox.x+swipeBox.width*.8,x1=swipeBox.x+swipeBox.width*.2;
   if(width<500){
     const session=await page.context().newCDPSession(page);
     await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:x0,y}]});
     for(let k=1;k<=10;k++){
       await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x0+(x1-x0)*k/10,y}]});
       await page.waitForTimeout(12);
     }
     await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     await session.detach();
   }else{
     await page.mouse.move(x0,y);
     await page.mouse.down();
     await page.mouse.move(x1,y,{steps:12});
     await page.mouse.up();
   }
   await page.waitForFunction(()=>document.querySelector('#editorial').dataset.editorialActive==='context');
   check('Horizontal drag on the actual phone advances to Contexto',await page.locator('#editorial').getAttribute('data-editorial-active')==='context');
   check('Swipe affordance retains vertical native scroll',await swipeStage.evaluate(el=>getComputedStyle(el).touchAction==='pan-y'));
   check('Swiping never selects the phone copy',await swipeStage.evaluate(el=>getComputedStyle(el).userSelect==='none'&&window.getSelection().isCollapsed));
   
   const notes=[];
   for(const id of ['meta','google','tiktok']){await page.locator('#tab-'+id).click();notes.push(await page.locator('[data-campaign-note]').innerText());}
   row.campaignNotes=notes;
   // Wait for the pre-existing 600ms channel crossfade to settle before tapping artwork.
   await page.waitForFunction(()=>!document.querySelector('#laboratorio .sp-campaign').dataset.transitioning);
   const campaignFace=page.locator('#laboratorio .sp-campaign-card');
   await campaignFace.scrollIntoViewIfNeeded();
   await campaignFace.locator('.sp-campaign-panel:not([hidden]) img').click();
   check('Campaign artwork itself flips to its real creative explanation',await campaignFace.getAttribute('data-side')==='back'&&await campaignFace.locator('[data-sp-card-back]').getAttribute('aria-hidden')==='false');
   await campaignFace.locator('[data-sp-card-turn="back"]').click();
   check('Campaign can turn back without hiding its original image',await campaignFace.getAttribute('data-side')==='front'&&await campaignFace.locator('.sp-campaign-panel:not([hidden]) img').count()===1);
   check('Each channel explains a different creative decision',new Set(notes).size===3&&notes.every(s=>/adaptação ao canal/i.test(s)&&/entrega/i.test(s)));
   await page.evaluate(()=>['meta','google','tiktok'].forEach(id=>document.querySelector('#tab-'+id).click()));await page.waitForTimeout(800);
   check('Fast changes keep artwork and explanation in sync',await page.locator('.sp-campaign').getAttribute('data-channel')==='tiktok'&&/vertical/.test(await page.locator('[data-note-title]').innerText())&&await page.locator('.sp-campaign-panel:not([hidden])').count()===1);
   await page.locator('.sp-campaign').screenshot({path:`${output}/campaign-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   check('Standalone Trilhas is hidden and Digital retains a destination',await page.locator('#trilhas[hidden]').count()===1&&!await page.locator('#trilhas').isVisible()&&await page.locator('#sistemas.digital-anchor').count()===1);
   check('No hidden Trilhas enlargement control is exposed',await page.locator('[data-art-open="trilhas"]:visible').count()===0);
   for(const id of ['casa']){
    const link=page.locator(`[data-art-open="${id}"]`);await link.click();
    const dialog=page.locator('#artwork-dialog');await dialog.locator('img').evaluate(img=>img.decode());
    check(`${id}: original static artwork enlarges`,await dialog.isVisible()&&await dialog.locator('img').evaluate(img=>img.naturalWidth>=900));
    check(`${id}: close control receives focus`,await dialog.locator('[data-art-close]').evaluate(e=>e===document.activeElement));
    await page.keyboard.press('Tab');check(`${id}: keyboard focus stays in dialog`,await dialog.evaluate(e=>e.contains(document.activeElement)));
    await capture('artwork-'+id);await page.keyboard.press('Escape');
    check(`${id}: Escape restores the original control and scrolling`,!await dialog.isVisible()&&await link.evaluate(e=>e===document.activeElement)&&!await page.locator('html').evaluate(e=>e.classList.contains('has-artwork-dialog')));
   }
   for(const [id,label] of [['content','Direção criativa e conteúdo'],['campaigns','Campanhas e gestão de mídia'],['digital','Sites, apps e sistemas']]){
    const scope=page.locator(`[data-service-scope="${id}"]`);await scope.locator('summary').click();await scope.locator('a').click();check(`${id}: service selection reaches the form`,await page.locator('#service').inputValue()===label);await scope.evaluate(e=>e.open=false);
   }
   await page.locator('#brief').fill('Preciso de um projeto digital com apresentação e prazo definido.');
   await page.locator('.sm-brief-summary summary').click();check('Optional summary reflects the editable brief',/projeto digital/.test(await page.locator('.sm-brief-summary p').innerText()));
   check('Contact channels remain the established real destinations',await page.locator('[data-contact-direct="whatsapp"]').getAttribute('href')==='https://wa.me/5511985568208'&&await page.locator('[data-contact-direct="email"]').getAttribute('href')==='mailto:smillepls@gmail.com');
   await page.locator('#contato').screenshot({path:`${output}/contact-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   check('No horizontal page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   check('No uncaught exceptions or external writes',row.errors.length===0&&row.writes.length===0);
  }catch(error){row.failure=String(error);await capture('failure').catch(()=>{});console.error(row.failure);}
  await page.close();console.log(JSON.stringify(row));
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base);
 assert(/Conteúdo, campanhas/.test(await nojs.locator('#hero-title').innerText()));assert(await nojs.locator('[data-work-card]').count()===3);await nojs.close();
}finally{await browser?.close();server?.kill();await writeFile(output+'/results.json',JSON.stringify(results,null,2));}
assert(results.length===4&&results.every(r=>!r.failure),'Narrative browser regression failed');
