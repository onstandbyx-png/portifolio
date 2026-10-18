import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Test-only instrumentation measures the rendered production geometry. It
// never changes the camera, physical solver or visual state being evaluated.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const {build}=createRequire(path.resolve('package.json'))('esbuild');
const output='qa/readable-hero',port=process.env.PORT||'4191';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
await mkdir(output,{recursive:true});
const bundle=path.resolve(output,'badge-inspection'),entry=await readFile('src/badges/index.ts','utf8');
assert(entry.includes('instance = pending;'),'Badge instrumentation anchor exists');
await build({stdin:{contents:entry.replace('instance = pending;','instance = pending; (window as any).__badgeScene = instance;'),resolveDir:path.resolve('src/badges'),sourcefile:'index.ts',loader:'ts'},bundle:true,format:'esm',splitting:true,outdir:bundle,entryNames:'index',target:'es2022',logLevel:'silent'});
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
const records=[];let browser;
const geometry=page=>page.evaluate(()=>{
 const s=window.__badgeScene,rect=s.canvas.getBoundingClientRect();s.scene.updateMatrixWorld(true);
 const cards=s.cardArt.map((art,index)=>{
  const mesh=art.children[0];mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox;
  const points=[[box.min.x,box.min.y],[box.max.x,box.min.y],[box.max.x,box.max.y],[box.min.x,box.max.y]].map(([x,y])=>{const point=art.position.clone().set(x,y,.02);art.localToWorld(point);point.project(s.camera);return{x:rect.x+(point.x+1)*rect.width/2,y:rect.y+(1-point.y)*rect.height/2};});
  const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y));
  return{index,visible:art.visible&&s.rigRoots[index].visible,left,right,top,bottom,width:right-left,height:bottom-top,points};
 });
 return{cssWidth:s.canvas.clientWidth,layout:s.canvas.dataset.layout,selected:s.canvas.dataset.selectedCard,cards,rect:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height},angles:[...s.flipAngles],targets:[...s.flipTargets],bodies:s.rigs.map(rig=>rig.cards[0]).map(b=>({p:{...b.p},v:{...b.v},w:{...b.w}}))};
});
const align=page=>page.locator('.hero-badge-exhibit').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-76,behavior:'instant'}));
const norm=v=>Math.hypot(v.x,v.y,v.z);
try{
 let healthy=false;for(let i=0;i<60;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(resolve=>setTimeout(resolve,150));}assert(healthy,'Server reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const widths=process.env.QA_WIDTHS?.split(',').map(Number);
 for(const [width,height,desktopSiteTouch] of [[320,740,false],[390,844,false],[980,820,true],[1024,900,false],[1101,900,false],[1440,900,false]].filter(([width])=>!widths||widths.includes(width))){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500||desktopSiteTouch,hasTouch:width<500||desktopSiteTouch,deviceScaleFactor:1});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  const row={width,height,desktopSiteTouch:!!desktopSiteTouch,checks:[],errors:[],samples:[]};records.push(row);
  const check=(name,pass)=>{row.checks.push({name,pass:Boolean(pass)});assert(pass,name);};
  page.on('pageerror',error=>row.errors.push(String(error)));
  await page.route('**/assets/badge-build/**',route=>route.fulfill({path:path.join(bundle,path.basename(new URL(route.request().url()).pathname)),contentType:'application/javascript'}));
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});await align(page);
   await page.waitForFunction(()=>window.__badgeScene?.initialized&&document.querySelector('[data-portfolio-badges]').dataset.state==='ready',null,{timeout:30000});
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
   const initial=await geometry(page);row.initial=initial;const visible=initial.cards.filter(card=>card.visible),single=initial.cssWidth<540;
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.waitForTimeout(90);
   await page.screenshot({path:`${output}/first-screen-${width}.png`,animations:'disabled'});
   await align(page);
   const layoutCheck=await page.evaluate(()=>{
     const box=element=>{const r=element.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     const hero=document.querySelector('.hero-v2');
     const title=hero.querySelector('#hero-title'),copy=hero.querySelector('.hero-copy'),exhibit=hero.querySelector('.hero-badge-exhibit');
     const actions=[...hero.querySelectorAll('.hero-actions a')];
     return {hero:box(hero),copy:box(copy),exhibit:box(exhibit),title:box(title),eyebrow:box(hero.querySelector('.hero-issue')),actions:actions.map(box),
       proof:box(hero.querySelector('.hero-proof')),font:parseFloat(getComputedStyle(title).fontSize),
       topPadding:parseFloat(getComputedStyle(hero).paddingTop),headerHeight:document.querySelector('.site-header').getBoundingClientRect().height,scrollWidth:document.documentElement.scrollWidth,
       viewport:innerWidth,
       coarse:matchMedia('(pointer:coarse)').matches,
       touch:matchMedia('(hover:none)').matches,
       copyDisplay:getComputedStyle(copy).display,
       copyBackground:getComputedStyle(copy).backgroundImage,
       surfaceBackground:getComputedStyle(hero.querySelector('.hero-surface')).backgroundColor,
       surfaceIsShared:hero.querySelector('.hero-surface').contains(copy)&&hero.querySelector('.hero-surface').contains(exhibit),
       stage:box(hero.querySelector('.hero-badge-stage')),
       controls:box(hero.querySelector('.hero-badge-controls')),
       menuVisible:getComputedStyle(document.querySelector('#menu-toggle')).display!=='none',
       desktopNavigationVisible:getComputedStyle(document.querySelector('.main-nav')).display!=='none'};
   });
   row.heroLayout=layoutCheck;
   check('Hero communicates the services, their benefit and professional repertoire',
     /Direção criativa/.test(await page.locator('#hero-title').innerText()) &&
     await page.locator('.hero-description').innerText().then(t=>['identidades','conteúdos','anúncios','sites','sistemas','comunicar melhor','simplificar processos'].every(term=>t.includes(term))) &&
     await page.locator('.hero-proof').innerText().then(t=>t.includes('Repertório editorial')&&t.includes('Criação e desenvolvimento')));
   check('Primary action opens the work and secondary action opens contact',
     await page.locator('.hero-actions a').evaluateAll(a=>a.length===2&&a.every(link=>!!document.querySelector(link.getAttribute('href'))) &&
       a[0].hash==='#trabalhos'&&a[1].hash==='#contato'));
   check('Fixed navigation never covers the hero eyebrow at rest',
     layoutCheck.eyebrow.top-layoutCheck.hero.top>=layoutCheck.headerHeight+10);
   check('Hero typography, buttons and badge exhibit stay inside viewport',
     layoutCheck.font>=30&&layoutCheck.font<=85&&layoutCheck.topPadding<=100 &&
     layoutCheck.title.width>0&&layoutCheck.title.left>=-1&&layoutCheck.title.right<=layoutCheck.viewport+1 &&
     layoutCheck.exhibit.left>=-1&&layoutCheck.exhibit.right<=layoutCheck.viewport+1 &&
     layoutCheck.actions.every(a=>a.height>=44)&&layoutCheck.scrollWidth<=layoutCheck.viewport+2);
   check('The hero has a shared forest surface rather than two independent panels',
     layoutCheck.surfaceIsShared&&layoutCheck.surfaceBackground==='rgb(25, 59, 45)');
   if(width>=960){
     check('Desktop and desktop-request touch integrate copy and badges side by side',
       layoutCheck.copy.right+18<=layoutCheck.exhibit.left&&layoutCheck.exhibit.width>=350);
     check('The physical scene chooses a pair only when both badges fit',
       (width>=1180)?(!single&&visible.length===2):(single&&visible.length===1));
   }else if(width<=700){
     check('The main badge arrives before the secondary proof in the mobile hero',
       single&&visible.length===1&&layoutCheck.exhibit.top>=layoutCheck.actions.at(-1).bottom+8&&
       layoutCheck.proof.top>=layoutCheck.exhibit.bottom-2);
     check('Mobile printed card occupies most of the useful width without clipping',
       visible[0].width>=layoutCheck.stage.width*.79&&visible[0].width<=layoutCheck.stage.width-.08*layoutCheck.stage.width&&
       visible[0].left>=layoutCheck.stage.left&&visible[0].right<=layoutCheck.stage.right&&
       visible[0].top>=layoutCheck.stage.top&&visible[0].bottom<=layoutCheck.stage.bottom+2);
   }else{
     check('Small tablets retain one readable full-size badge',single&&visible.length===1);
   }
   check('Controls are outside and below the artwork, not over its face',
     layoutCheck.controls.top>=layoutCheck.stage.bottom-2);
   if(desktopSiteTouch){
     check('Android desktop-request mode exposes compact navigation instead of mini desktop links',
       layoutCheck.coarse&&layoutCheck.touch&&layoutCheck.menuVisible&&!layoutCheck.desktopNavigationVisible);
   }
   if(width<=350)check('Narrow hero eyebrow remains on one line',await page.locator('.hero-issue .issue-dot').evaluate(el=>getComputedStyle(el).display==='none'));
   check('Selection is visible without blocking the artwork',
     await page.locator('[data-badge-current-label]').innerText()==='Fatos · selecionado');
   check('Fatos remains the default selected card after initialization',initial.selected==='0'&&await page.locator('[data-portfolio-badges]').getAttribute('data-selected-card')==='0');
   check('Canvas and scene agree on the responsive composition',initial.layout===(single?'single':'pair')&&visible.length===(single?1:2));
   check('Every visible face is fully inside the stage',visible.every(card=>card.left>=initial.rect.left-1&&card.right<=initial.rect.right+1&&card.top>=initial.rect.top-1&&card.bottom<=initial.rect.bottom+1));
   check('The visible card is materially larger than the prior mobile fan',visible.every(card=>card.width>=(width===320?190:width===390?230:190)));
   if(!single)check('Desktop cards do not overlap',visible[0].right<=visible[1].left||visible[1].right<=visible[0].left);
   check('Resting card faces are upright',visible.every(card=>Math.abs(card.points[0].y-card.points[1].y)<2&&Math.abs(card.points[0].x-card.points[3].x)<2));
   check('Only a pair of selectors and one contextual flip are present',await page.locator('[data-badge-select]').count()===2&&await page.locator('[data-badge-flip]').count()===1&&await page.locator('[data-badge-swing],[data-badge-card-flip]').count()===0);
   check('Control text and hit areas are readable',await page.locator('[data-badge-select],[data-badge-flip]').evaluateAll(buttons=>buttons.every(el=>{const r=el.getBoundingClientRect();return parseFloat(getComputedStyle(el).fontSize)>=14&&r.width>=44&&r.height>=44;})));
   check('Browser media source matches the real single/pair WebGL layout',await page.locator('[data-badge-poster-source]').evaluate((source)=>matchMedia(source.media).matches===(document.querySelector('[data-badge-canvas]').clientWidth>=540)));
   check('Removed explanatory blocks are absent from the hero',await page.locator('.hero-badge-detail,[data-badge-hint],.hero-support,.scroll-indicator').count()===0);
   await page.locator('.hero-badge-exhibit').screenshot({path:`${output}/front-${width}.png`,animations:'disabled'});
   await page.locator('[data-badge-flip]').click();await page.waitForFunction(()=>Math.abs(window.__badgeScene.flipAngles[0]-Math.PI)<.03);
   check('Flipping Fatos updates its visible contextual label',
     await page.locator('[data-badge-current-label]').innerText()==='Fatos · verso');
   const firstBack=await geometry(page);check('The selected card turns without turning its neighbour',Math.abs(firstBack.angles[0]-Math.PI)<.03&&Math.abs(firstBack.angles[1])<.03);
   await page.locator('[data-badge-select="1"]').click();await page.waitForTimeout(150);
   check('Selecting smiile updates the active status without perturbing physics',
     await page.locator('[data-badge-current-label]').innerText()==='smiile · selecionado');
   const selected=await geometry(page);check('Selection preserves the first face and presents smiile',selected.selected==='1'&&Math.abs(selected.angles[0]-Math.PI)<.03&&(!single||selected.cards[1].visible&&!selected.cards[0].visible)&&await page.locator('[data-badge-select="1"]').getAttribute('aria-pressed')==='true');
   for(let i=0;i<10;i++){await page.locator('[data-badge-flip]').click();row.samples.push(await geometry(page));}
   await page.waitForFunction(()=>Math.abs(window.__badgeScene.flipAngles[1])<.03,null,{timeout:8000});const settled=await geometry(page);row.settled=settled;
   check('Ten flip clicks add no energy to the suspension',row.samples.every(sample=>sample.bodies.every(body=>norm(body.v)<.05&&norm(body.w)<.05))&&settled.bodies.every(body=>norm(body.v)<.05&&norm(body.w)<.05));
   check('Ten flip clicks finish at the requested face without disturbing the neighbour',Math.abs(settled.angles[0]-Math.PI)<.03&&Math.abs(settled.angles[1])<.03);
   await page.locator('[data-badge-flip]').focus();await page.keyboard.press('Space');await page.waitForFunction(()=>Math.abs(window.__badgeScene.flipAngles[1]-Math.PI)<.03);
   await page.locator('.hero-badge-exhibit').screenshot({path:`${output}/smiile-back-${width}.png`,animations:'disabled'});
   await page.keyboard.press('Escape');check('Escape restores fronts while keeping the control focused',await page.locator('[data-portfolio-badges]').getAttribute('data-fatos-face')==='front'&&await page.locator('[data-portfolio-badges]').getAttribute('data-smiile-face')==='front'&&await page.locator('[data-badge-flip]').evaluate(el=>el===document.activeElement)&&await page.locator('[data-portfolio-badges]').getAttribute('data-selected-card')==='1');
   check('Document has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   check('No uncaught JavaScript errors',row.errors.length===0);
  }catch(error){row.failure=String(error);await page.screenshot({path:`${output}/failure-${width}.png`}).catch(()=>{});console.error(`[readable hero ${width}] ${error}`);}
  finally{await context.close();}
  console.log(`[readable hero ${width}] ${row.checks.filter(c=>c.pass).length} passed${row.failure?', FAILED':''}`);
 }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/${process.env.QA_REPORT||'results.json'}`,JSON.stringify(records,null,2));}
if(records.some(row=>row.failure))throw new Error('Readable hero regression failed; inspect qa/readable-hero/results.json');
