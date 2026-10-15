import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

// Interaction checks for the recovered reference components. This suite keeps
// the archived kinetic-pass section hidden: a passing DOM check is not a
// substitute for inspecting the captured states against the supplied videos.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
let chromium;
try{({chromium}=require('playwright'));}
catch{({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const port=process.env.PORT||'4180';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const output='qa/reference-recovery';
const reportName=process.env.QA_REPORT||'results.json';
const records=[];
const selectedGroups=process.env.QA_GROUPS?.split(',');
await mkdir(output,{recursive:true});
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
let browser;

async function scrollProgress(page,selector,progress){
  await page.locator(selector).evaluate((el,p)=>{
    const header=parseFloat(getComputedStyle(el).getPropertyValue('--rg-header'))||(innerWidth<=760?64:76);
    const heading=el.querySelector('.rf-heading')?.offsetHeight||0;
    const stage=el.querySelector('.rf-stage,.rg-sticky')?.offsetHeight||(innerHeight-header);
    const start=scrollY+el.getBoundingClientRect().top+heading-header;
    const travel=Math.max(1,el.offsetHeight-heading-stage);
    scrollTo({top:start+travel*p,behavior:'instant'});
  },progress);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function swipe(page,locator,mobile){
  await locator.scrollIntoViewIfNeeded();
  // aria-expanded describes the requested face before the 670ms CSS turn has
  // finished. A swipe during that turn can hit the moving return button and
  // correctly be ignored. Wait for the actual frontal pose and a usable hit.
  const surface=await locator.elementHandle();
  await page.waitForFunction(stage=>{
    const card=stage.querySelector('.pf-fatos-card.is-active');
    const rotor=card?.querySelector('.pf-fatos-rotor');
    if(!card||!rotor||card.classList.contains('is-flipped'))return false;
    const matrix=new DOMMatrixReadOnly(getComputedStyle(rotor).transform);
    if(Math.abs(matrix.m11-1)>.0001||Math.abs(matrix.m33-1)>.0001||Math.abs(matrix.m13)>.001||Math.abs(matrix.m31)>.001)return false;
    const box=stage.getBoundingClientRect(),x=box.x+box.width*.8,y=Math.max(100,Math.min(innerHeight-110,box.y+box.height*.33));
    const hit=document.elementFromPoint(x,y);
    return hit?.closest('.pf-fatos-card.is-active')===card&&!hit.closest('button,a');
  },surface);
  const box=await locator.boundingBox();
  const start={x:box.x+box.width*.8,y:Math.max(100,Math.min(page.viewportSize().height-110,box.y+box.height*.33))};
  const end={x:box.x+box.width*.2,y:start.y+4};
  if(mobile){
    const session=await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
    for(let step=1;step<=8;step++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*step/8,y:start.y+4*step/8}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await session.detach();
  }else{
    await page.mouse.move(start.x,start.y);await page.mouse.down();
    await page.mouse.move(end.x,end.y,{steps:8});await page.mouse.up();
  }
}
async function decodeVisibleImages(locator){
  return locator.evaluateAll(async images=>Promise.all(images.map(async image=>{
    image.loading='eager';
    try{await image.decode();return {src:image.getAttribute('src'),ok:image.naturalWidth>0};}
    catch{return {src:image.getAttribute('src'),ok:false};}
  })));
}

try{
  let healthy=false;
  for(let attempt=0;attempt<60;attempt++){
    try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  assert(healthy,`Local server did not become available at ${base}`);
  const executablePath=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const selectedWidths=process.env.QA_WIDTHS?.split(',').map(Number);
  const scenarios=[{width:1440,height:900},{width:390,height:844},{width:320,height:740},{width:390,height:844,reduced:true}]
    .filter(({width,reduced})=>(!selectedWidths||selectedWidths.includes(width))&&(process.env.QA_REDUCED!=='0'||!reduced));
  for(const scenario of scenarios){
    const {width,height,reduced=false}=scenario;
    const label=`${width}${reduced?'-reduced':''}`;
    const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
    const page=await context.newPage();page.setDefaultTimeout(12000);
    const record={...scenario,browser:browser.version(),checks:[],errors:[],failures:[]};records.push(record);
    const mutations=[],studioMediaRequests=[];
    page.on('pageerror',error=>record.errors.push(String(error)));
    page.on('request',request=>{if(!['GET','HEAD','OPTIONS'].includes(request.method()))mutations.push({method:request.method(),url:request.url()});if(/\/assets\/kinetic-pass\/material-loop\.(?:webm|mp4)(?:$|\?)/.test(request.url()))studioMediaRequests.push(request.url());});
    await page.route('https://midia-kit-production-c234.up.railway.app/**',route=>route.abort());
    const check=(name,value)=>{record.checks.push({name,pass:!!value});assert(value,name);};
    const capture=async(name,locator=page)=>locator.screenshot({path:`${output}/${name}-${label}.png`,animations:'disabled'});
    const group=async(name,run)=>{
      if(selectedGroups&&!selectedGroups.includes(name))return;
      try{await run();console.log(`[reference ${label}/${name}] PASS`);}
      catch(error){record.failures.push({group:name,error:String(error)});await capture('failure-'+name).catch(()=>{});console.error(`[reference ${label}/${name}] ${String(error)}`);}
    };
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.waitForSelector('html[data-rx-showcase="ready"]',{state:'attached',timeout:30000});
      await group('baseline',async()=>{
        check('Hero and one editorial story device remain mounted',await page.locator('[data-portfolio-badges]').count()===1&&await page.locator('#editorial .es-device .df-metal').count()===1);
        check('The archived layered studio section is not visible',!await page.locator('#estudio-interativo').isVisible()&&!/A ideia tem camadas/i.test(await page.locator('main').innerText()));
        check('No navigation link targets the archived layered studio',await page.locator('a[href$="#estudio-interativo"]').count()===0);
        check('The archived studio does not request its video assets',studioMediaRequests.length===0&&await page.locator('video.ks-video').count()===0);
        check('Three distinct cases remain inside gallery planes',await page.locator('#trabalhos .rg-plane .work-tile').count()===3);
        check('No obsolete LINHA or SOTA CI narrative is visible',!/(?:\bLINHA\b|SOTA CI)/i.test(await page.locator('main').innerText()));
        check('Only one project-path heading is visible',(await page.locator('main').innerText()).split('Escolha o desafio. Veja a entrega.').length-1<=1);
      });
      await group('header',async()=>{
        check('Global motion control stays in the header with a 44px target',await page.locator('#motion-toggle').evaluate(button=>{const r=button.getBoundingClientRect();return Boolean(button.closest('.site-header'))&&r.width>=44&&r.height>=44;}));
        if(width<500){
          check('Mobile wordmark, pause and menu do not overlap',await page.evaluate(()=>{const mark=document.querySelector('.wordmark').getBoundingClientRect(),pause=document.querySelector('#motion-toggle').getBoundingClientRect(),menu=document.querySelector('#menu-toggle').getBoundingClientRect();return mark.right<=pause.left+1&&pause.right<=menu.left+1&&menu.right<=innerWidth&&menu.width>=44&&menu.height>=44;}));
          await page.locator('#menu-toggle').click();
          check('Mobile menu opens independently of motion controls',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='true'&&await page.locator('#mobile-nav').isVisible());
          await page.keyboard.press('Escape');
          check('Escape closes the mobile menu and returns its focus',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='false'&&await page.locator('#menu-toggle').evaluate(button=>button===document.activeElement));
        }
        await capture('header');
      });
      await group('editorial',async()=>{
        const story=page.locator('#editorial'),tabs=story.locator('[data-editorial-step]');
        const device=await story.locator('.es-device').elementHandle();
        check('One story has three moments and one persistent device',await tabs.count()===3&&await story.locator('.es-device').count()===1&&await story.locator('[data-es-piece]:not([hidden])').count()===1);
        await tabs.nth(0).focus();await page.keyboard.press('ArrowRight');
        check('Keyboard selects the context and updates the matching readable text',await story.getAttribute('data-editorial-active')==='context'&&await tabs.nth(1).getAttribute('aria-selected')==='true'&&await tabs.nth(1).evaluate(el=>el===document.activeElement)&&(await story.locator('[data-es-copy]').innerText()).includes('Câmera, mapa, mensagens'));
        check('The selected story panel is labelled by its active tab',await story.locator('[role="tabpanel"]').getAttribute('aria-labelledby')===await tabs.nth(1).getAttribute('id'));
        await page.keyboard.press('End');
        check('The closing moment follows the same story and keeps only one piece visible',await story.getAttribute('data-editorial-active')==='closing'&&(await story.locator('[data-es-copy]').innerText()).includes('Qual função do celular')&&await story.locator('[data-es-piece]:not([hidden])').count()===1);
        await page.keyboard.press('Home');
        check('Returning to the opening preserves the physical device',await story.getAttribute('data-editorial-active')==='hook'&&await device.evaluate(el=>el.isConnected&&el===document.querySelector('#editorial .es-device')));
        const images=await decodeVisibleImages(story.locator('.es-piece:not([hidden]) img'));
        check('Editorial imagery decodes locally',images.length>0&&images.every(image=>image.ok&&image.src.startsWith('/assets/')));
        await capture('editorial',story);
      });
      await group('services',async()=>{
        const scopes=page.locator('#project-paths [data-service-scope]');
        check('Three service scopes use native disclosure controls',await scopes.count()===3&&await scopes.evaluateAll(items=>items.every(item=>item.tagName==='DETAILS'&&item.querySelector('summary'))));
        for(const id of ['content','campaigns','digital']){
          const scope=page.locator(`[data-service-scope="${id}"]`);
          if(!await scope.evaluate(el=>el.open))await scope.locator('summary').click();
          const link=scope.locator('.path-contact');
          const expected=await link.getAttribute('data-project-need'),before=mutations.length;
          await link.click();
          check(`${id}: scope prefills the local briefing without sending data`,await page.locator('#service').inputValue()===expected&&mutations.length===before);
        }
      });
      await group('badges',async()=>{
        const stage=page.locator('[data-portfolio-badges]');
        const fatos=page.locator('[data-badge-select="0"]'),smiile=page.locator('[data-badge-select="1"]'),flip=page.locator('[data-badge-flip]');
        await fatos.focus();await page.keyboard.press('Escape');
        await fatos.click();await flip.click();
        check('Fatos badge flips independently',await stage.getAttribute('data-fatos-face')==='back'&&await stage.getAttribute('data-smiile-face')==='front'&&await fatos.getAttribute('aria-pressed')==='true'&&await smiile.getAttribute('aria-pressed')==='false');
        await smiile.focus();await page.keyboard.press('Space');await flip.focus();await page.keyboard.press('Space');
        check('Second badge responds to keyboard without resetting the first',await stage.getAttribute('data-fatos-face')==='back'&&await stage.getAttribute('data-smiile-face')==='back'&&await stage.getAttribute('data-selected-card')==='1');
        await page.keyboard.press('Escape');
        check('Escape restores both badge fronts and keeps keyboard focus',await stage.getAttribute('data-fatos-face')==='front'&&await stage.getAttribute('data-smiile-face')==='front'&&await flip.evaluate(el=>el===document.activeElement));
        await fatos.click();await flip.click();
        check('One contextual flip control affects only the selected card',await flip.count()===1&&await stage.getAttribute('data-fatos-face')==='back'&&await stage.getAttribute('data-smiile-face')==='front');
        await fatos.focus();await page.keyboard.press('Escape');
        check('Selection and flip controls have readable usable touch targets',await page.locator('[data-badge-select],[data-badge-flip]').evaluateAll(buttons=>buttons.length===3&&buttons.every(button=>{const r=button.getBoundingClientRect();return r.width>=44&&r.height>=44&&parseFloat(getComputedStyle(button).fontSize)>=14;})));
        check('Legacy impulse and duplicate flip controls are absent',await page.locator('[data-badge-swing],[data-badge-card-flip]').count()===0);
        check('Removed explanatory blocks are absent from the hero',await page.locator('.hero-badge-detail,[data-badge-hint],.hero-support,.scroll-indicator').count()===0);
        await capture('badges');
      });
      await group('gallery',async()=>{
        const shell=page.locator('.rg-scroll-shell[data-ready="true"]');
        const active=()=>page.locator('.rg-plane.rg-active').getAttribute('data-rg-index');
        if(reduced||width<=760){
          check('Mobile and reduced motion present all three works in normal flow',await shell.evaluate(el=>el.classList.contains('rg-natural'))&&await page.locator('.rg-plane').evaluateAll(planes=>planes.length===3&&planes.every(plane=>!plane.inert&&getComputedStyle(plane).visibility!=='hidden')));
          check('Natural flow exposes a direct case action for every work',await page.locator('.rg-plane .tile-open').evaluateAll(buttons=>buttons.length===3&&buttons.every(button=>!button.disabled&&!button.closest('[inert]')&&getComputedStyle(button).visibility!=='hidden')));
          for(const index of [2,0]){
            await page.locator(`.rg-plane[data-rg-index="${index}"]`).evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
            await page.waitForFunction(value=>document.querySelector('.rg-active')?.dataset.rgIndex===String(value),index);
            check(`Native flow reaches work ${index+1} in either direction`,Number(await active())===index);
          }
        }else{
          await scrollProgress(page,'.rg-scroll-shell',.08);
          await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='0');
          await scrollProgress(page,'.rg-scroll-shell',.9);
          await page.waitForFunction(()=>Number(document.querySelector('.rg-active')?.dataset.rgIndex)>=2);
          check('Native forward scroll reveals later projects',Number(await active())>=2);
          await scrollProgress(page,'.rg-scroll-shell',.08);
          await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='0');
          check('Reverse scroll restores the earlier project',await active()==='0');
          await page.locator('#motion-toggle').click();
          await scrollProgress(page,'.rg-scroll-shell',.9);
          await page.waitForFunction(()=>Number(document.querySelector('.rg-active')?.dataset.rgIndex)>=2);
          check('Global pause preserves scroll navigation and a frontal active card',Number(await active())>=2&&await shell.getAttribute('data-paused')==='true'&&await page.locator('.rg-plane.rg-active').evaluate(el=>parseFloat(getComputedStyle(el).getPropertyValue('--rg-angle'))===0&&parseFloat(getComputedStyle(el).getPropertyValue('--rg-y'))===0&&parseFloat(getComputedStyle(el).getPropertyValue('--rg-scale'))===1));
          await page.locator('#motion-toggle').click();
          await scrollProgress(page,'.rg-scroll-shell',.08);
          await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='0');
          await page.locator('[data-rg-next]').click();
          await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='1');
          await scrollProgress(page,'.rg-scroll-shell',.85);
          await page.waitForFunction(()=>Number(document.querySelector('.rg-active')?.dataset.rgIndex)>=2);
          check('Gallery selection keeps subsequent scrolling active',await shell.getAttribute('data-mode')==='scroll'&&Number(await active())>=2);
          check('Gallery requires no resume control',await page.locator('[data-rg-resume]').count()===0);
          await scrollProgress(page,'.rg-scroll-shell',.08);
          await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='0');
        }
        const media=await decodeVisibleImages(page.locator('.rg-active .tile-art img'));
        check('Active project shows decoded local artwork',media.length===1&&media.every(image=>image.ok&&image.src.startsWith('/assets/')));
        await capture('gallery');
      });
      await group('fatos',async()=>{
        const deck=page.locator('#colecao.pf-fatos-deck');
        check('Six Fatos universes are directly visible without an accordion',await deck.count()===1&&await deck.locator('[data-fatos-card]').count()===6&&await deck.evaluate(el=>el.tagName!=='DETAILS'));
        await deck.locator('[data-fatos-select="0"]').click();
        await deck.locator('.pf-fatos-stage').focus();await page.keyboard.press('ArrowRight');
        check('Fatos keyboard navigation changes the complete editorial piece',await deck.getAttribute('data-active')==='1'&&await deck.locator('.is-active').getAttribute('data-fatos-card')==='esportes');
        const selected=deck.locator('.is-active');
        await selected.locator('[data-fatos-flip]').click();
        check('Active Fatos card exposes its editorial context and accessible return action',await selected.evaluate(el=>el.classList.contains('is-flipped'))&&await selected.locator('[data-fatos-back]').getAttribute('aria-hidden')==='false'&&(await selected.locator('.pf-fatos-approach').innerText()).length>30);
        await capture('fatos-back',selected);
        await selected.locator('[data-fatos-return]').click();
        check('Fatos card returns to its artwork',await selected.locator('[data-fatos-flip]').getAttribute('aria-expanded')==='false');
        await swipe(page,deck.locator('.pf-fatos-stage'),width<500);
        await page.waitForFunction(()=>document.querySelector('#colecao')?.dataset.active==='2');
        check('Horizontal pointer or touch swipe advances Fatos',await deck.getAttribute('data-active')==='2');
        await deck.locator('[data-fatos-select="5"]').click();
        check('All six Fatos universes have a direct selector',await deck.getAttribute('data-active')==='5'&&await deck.locator('.is-active').getAttribute('data-fatos-card')==='negocios');
        await deck.locator('.pf-fatos-stage').focus();await page.keyboard.press('ArrowRight');
        check('Fatos wraps back to the initial universe',await deck.getAttribute('data-active')==='0');
        const images=await decodeVisibleImages(deck.locator('.pf-fatos-art'));
        check('All six original editorial photographs decode locally',images.length===6&&images.every(image=>image.ok&&image.src.startsWith('/assets/')));
        await capture('fatos-front',deck.locator('.is-active'));
      });
      await group('film',async()=>{
        const film=page.locator('#narrativa-visual.rf-film');
        await film.locator('[data-rx-film-to="1"]').click();
        await page.waitForFunction(()=>document.querySelector('#narrativa-visual')?.dataset.phase==='1');
        check('Film chapter selection reveals the social composition',await film.getAttribute('data-phase')==='1'&&await film.getAttribute('data-mode')!=='manual');
        await film.locator('[data-rx-film-to="2"]').click();
        await page.waitForFunction(()=>document.querySelector('#narrativa-visual')?.dataset.phase==='2');
        check('Film exposes the real site chapter',await film.getAttribute('data-phase')==='2');
        await capture('film-site');
        if(!reduced){
          check('Film keeps scroll active without a resume control',await film.getAttribute('data-mode')==='scroll'&&await page.locator('[data-rf-resume]').count()===0);
          await scrollProgress(page,'#narrativa-visual',.08);
          await page.waitForFunction(()=>document.querySelector('#narrativa-visual')?.dataset.phase==='0');
          await scrollProgress(page,'#narrativa-visual',.8);
          await page.waitForFunction(()=>Number(document.querySelector('#narrativa-visual')?.dataset.phase)>=2);
          check('Film advances through native scroll',Number(await film.getAttribute('data-phase'))>=2);
          await scrollProgress(page,'#narrativa-visual',.08);
          await page.waitForFunction(()=>document.querySelector('#narrativa-visual')?.dataset.phase==='0');
          check('Film reverse scroll restores its initial composition',await film.getAttribute('data-phase')==='0');
        }
      });
      await group('app',async()=>{
        await page.locator('[data-product-tab="app"]').click();
        const app=page.locator('[data-testid="apps-demo"]');
        const viewport=app.locator('.pd-app-viewport');
        check('Recovered app opens with a usable trail list',await app.getAttribute('data-screen')==='list'&&await app.locator('[data-app-action="open"]').count()===1);
        await app.getByRole('searchbox',{name:'Buscar trilhas'}).fill('inexistente');
        check('App search changes results rather than decorative text',await app.locator('[data-app-action="open"]').count()===0&&await app.locator('.pd-trail-empty').isVisible());
        await app.getByRole('searchbox',{name:'Buscar trilhas'}).fill('Arco');
        await app.locator('[data-app-action="save"]').click();
        await app.locator('[data-app-filter="saved"]').click();
        check('Saved filter includes the chosen trail',await app.locator('[data-app-action="save"]').getAttribute('aria-pressed')==='true'&&await app.locator('[data-app-action="open"]').count()===1);
        await viewport.evaluate(el=>{el.scrollTop=120;});
        await app.locator('[data-app-action="open"]').scrollIntoViewIfNeeded();
        const listPosition=await viewport.evaluate(el=>({inner:el.scrollTop,outer:window.scrollY}));
        const device=await app.locator('.df-metal').elementHandle();
        await app.locator('[data-app-action="open"]').click();
        check('Trail opens a distinct detail screen',await app.getAttribute('data-screen')==='detail'&&await app.locator('.pd-elevation').count()===1);
        await app.locator('[data-app-action="map"]').first().click();
        check('App map is an interactive route with progress',await app.getAttribute('data-screen')==='map'&&await app.locator('.pd-route-position').count()===1);
        const explore=page.locator('.pd-explore-trigger');await explore.scrollIntoViewIfNeeded();
        const beforeExplore=await page.evaluate(()=>scrollY),mapNode=await app.elementHandle();
        await explore.click();const dialog=page.locator('.df-explorer:modal');await dialog.waitFor();
        check('Exploration moves the live app into one native dialog',await page.locator('[data-testid="apps-demo"]').count()===1&&await mapNode.evaluate(el=>el===document.querySelector('.df-explorer [data-testid="apps-demo"]')));
        check('Exploration preserves the route screen and readable controls',await app.getAttribute('data-screen')==='map'&&await dialog.locator('.pd-app-filters button').count()===0&&await dialog.locator('.df-explorer-close').evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44;}));
        // :modal stops matching before the asynchronous close event restores
        // the original DOM, scroll and focus. Detachment marks completed cleanup.
        await capture('app-exploration',dialog);await page.keyboard.press('Escape');await page.locator('.df-explorer').waitFor({state:'detached'});
        check('Closing exploration preserves app state, scroll and focus',await app.getAttribute('data-screen')==='map'&&Math.abs((await page.evaluate(()=>scrollY))-beforeExplore)<=2&&await explore.evaluate(el=>el===document.activeElement));
        check('Exploration never recreates the metallic hardware',await device.evaluate(el=>el.isConnected&&el===document.querySelector('[data-testid="apps-demo"] .df-metal')));

        await app.locator('[data-app-action="run"]').click();
        await page.waitForFunction(()=>Number(document.querySelector('[data-testid="apps-demo"] .pd-progress')?.getAttribute('aria-valuenow'))>0);
        check('Starting the route changes actual progress',Number(await app.locator('.pd-progress').getAttribute('aria-valuenow'))>0);
        await capture('app-map');
        await app.locator('[data-app-action="finish"]').click();
        check('The same route reaches a coherent completion screen',await app.getAttribute('data-screen')==='summary'&&(await app.locator('.pd-trail-summary').innerText()).includes('Você chegou'));
        await app.locator('[data-app-action="list"]').click();
        check('Returning preserves saved state and list filter',await app.getAttribute('data-screen')==='list'&&await app.locator('[data-app-filter="saved"]').getAttribute('aria-pressed')==='true'&&await app.locator('[data-app-action="save"]').getAttribute('aria-pressed')==='true');
        const restored=await viewport.evaluate(el=>({inner:el.scrollTop,outer:window.scrollY}));
        check('Returning restores the list and page position',Math.abs(restored.inner-listPosition.inner)<=2&&Math.abs(restored.outer-listPosition.outer)<=2);
        check('Navigating never remounts the metallic phone frame',await device.evaluate(el=>el.isConnected&&el===document.querySelector('[data-testid="apps-demo"] .df-metal')));
        const images=await decodeVisibleImages(app.locator('img'));
        check('App artwork is local and decodes',images.length>0&&images.every(image=>image.ok&&image.src.startsWith('/assets/')));
        await capture('app-list');
      });
      await group('site',async()=>{
        await page.locator('[data-product-tab="site"]').click();
        const site=page.locator('[data-product-panel="site"]');
        await site.locator('[data-site-tab="gallery"]').click();
        const photo=site.locator('.pd-gallery-image img');
        const initialPosition=await photo.evaluate(el=>getComputedStyle(el).objectPosition);
        await site.locator('[data-site-photo="2"]').click();
        await page.waitForFunction(position=>getComputedStyle(document.querySelector('.pd-gallery-image img')).objectPosition!==position,initialPosition);
        check('Casa Costa gallery changes the image framing',await site.locator('[data-site-photo="2"]').getAttribute('aria-pressed')==='true'&&await photo.evaluate(el=>getComputedStyle(el).objectPosition)!==initialPosition);
        const images=await decodeVisibleImages(photo);
        check('Casa Costa gallery uses a decoded local photograph',images.length===1&&images[0].ok&&images[0].src.startsWith('/assets/'));
        await capture('site-gallery');
        await site.locator('[data-site-tab="home"]').click();
        await site.locator('[data-site-action="visit"]').click();
        check('The visit CTA moves focus into the booking form',await site.locator('.pd-visit-form h4').evaluate(el=>el===document.activeElement));
        const chosenDay=await site.locator('[data-site-day="2"]').getAttribute('aria-label');
        await site.locator('[data-site-day="2"]').click();
        await site.locator('[data-site-time="16h"]').click();
        const mutationsBefore=mutations.length;
        await site.locator('[data-site-form] button[type="submit"]').click();
        const confirmation=site.locator('[data-testid="site-confirmation"]');
        check('Local booking confirms the exact chosen day and time',(await confirmation.innerText()).includes(chosenDay)&&(await confirmation.innerText()).includes('16h'));
        check('Booking is clearly local and makes no external mutation',(await confirmation.innerText()).includes('Nenhuma visita foi reservada')&&mutations.length===mutationsBefore);
        check('Booking confirmation receives keyboard focus',await confirmation.evaluate(el=>el===document.activeElement));
        await capture('site-confirmation');
        await site.locator('[data-site-action="change"]').click();
        check('Changing the booking returns focus to the form',await site.locator('.pd-visit-form h4').evaluate(el=>el===document.activeElement));
      });
      await group('voice',async()=>{
        const audio=page.locator('[data-call-audio]');
        check('Voice audio has not autoplayed while other demonstrations were used',await audio.evaluate(el=>el.paused&&el.currentTime===0&&!el.autoplay&&el.preload==='none'));
        await page.locator('[data-product-tab="voice"]').click();
        const voice=page.locator('[data-product-panel="voice"]');
        check('Entering the voice tab does not start audio',await audio.evaluate(el=>el.paused&&el.currentTime===0));
        await page.locator('#motion-toggle').click();
        await voice.locator('[data-call-play]').click();
        check('Global pause prevents a new audio start',await audio.evaluate(el=>el.paused&&el.currentTime===0)&&(await voice.locator('.pd-call-feedback').innerText()).includes('Retomar animações e reprodução'));
        await page.locator('#motion-toggle').click();
        await voice.locator('[data-call-play]').click();
        await page.waitForFunction(()=>{const audio=document.querySelector('[data-call-audio]');return audio&&!audio.paused&&audio.currentTime>0;});
        check('Voice playback begins only after explicit click',await voice.locator('[data-call-play]').getAttribute('aria-pressed')==='true'&&await audio.evaluate(el=>el.readyState>=2&&!el.error));
        await voice.locator('[data-call-play]').click();
        check('The visitor can pause the recorded call',await audio.evaluate(el=>el.paused));
        await capture('voice-phone',voice.locator('.pd-call-host'));
        await voice.locator('[data-proposal-version="2"]').click();
        check('Proposal previous version shows the original total',await voice.locator('.pd-proposal-body').getAttribute('data-total')==='12000'&&await voice.locator('[data-proposal-approve]').isDisabled());
        await voice.locator('[data-proposal-version="3"]').click();
        check('Updated proposal adds the requested item and revised total',await voice.locator('.pd-proposal-body').getAttribute('data-total')==='13900'&&(await voice.locator('.pd-proposal-body').innerText()).includes('Banco da mesa'));
        const mutationsBefore=mutations.length;
        await voice.locator('[data-proposal-approve]').click();
        check('Proposal approval changes local state without sending anything',await voice.locator('[data-proposal-approve]').isDisabled()&&(await voice.locator('.pd-proposal-status').innerText()).includes('Esta ação não envia a proposta.')&&mutations.length===mutationsBefore);
        await capture('voice-proposal');
      });
      await group('retained-interactions',async()=>{
        const media=[];
        for(const channel of ['meta','tiktok']){
          await page.locator(`[data-ad-tab="${channel}"]`).click();
          const image=page.locator(channel==='meta'?'#panel-meta .rx-ig-photo img':'#panel-tiktok .sa-tt-media>img');
          const decoded=await decodeVisibleImages(image);
          check(`${channel}: the social artwork is decoded and visibly painted`,decoded.length===1&&decoded[0].ok&&await image.evaluate(el=>Number(getComputedStyle(el).opacity)>.95&&getComputedStyle(el).display!=='none'));
          media.push(...decoded);
        }
        check('Social artwork is independent of authenticated or remote previews',media.every(image=>image.src.startsWith('/assets/')));
        await page.locator('[data-ad-tab="meta"]').click();
        await page.locator('[data-rx-social-next]').click();
        await page.waitForFunction(()=>document.querySelector('.rx-ig-count')?.textContent==='2/3');
        check('Original social carousel still advances',await page.locator('.rx-ig-count').innerText()==='2/3');
        const explore=page.locator('#panel-meta .df-explore-trigger');await explore.scrollIntoViewIfNeeded();
        const beforeExplore=await page.evaluate(()=>scrollY),socialNode=await page.locator('#panel-meta .sa-social').elementHandle();
        await explore.click();const dialog=page.locator('.df-explorer:modal');await dialog.waitFor();
        check('Social exploration retains the live frame and readable caption',await page.locator('.rx-ig-count').innerText()==='2/3'&&await dialog.locator('.sa-ig-caption').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14)&&await socialNode.evaluate(el=>el===document.querySelector('.df-explorer .sa-social')));
        await dialog.locator('[data-rx-social-next]').click();
        check('The social carousel remains interactive in the enlarged view',await dialog.locator('.rx-ig-count').innerText()==='3/3');
        await capture('social-exploration',dialog);await dialog.locator('.df-explorer-close').click();await page.locator('.df-explorer').waitFor({state:'detached'});
        check('Closing social exploration preserves its selected slide, page and focus',await page.locator('.rx-ig-count').innerText()==='3/3'&&Math.abs((await page.evaluate(()=>scrollY))-beforeExplore)<=2&&await explore.evaluate(el=>el===document.activeElement));

        await page.locator('[data-rx-social="0"]').click();
        // Bring the first work into the gallery before clicking its case action.
        if(!reduced){
          await scrollProgress(page,'.rg-scroll-shell',.15);
          await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='0');
        }
        const trigger=page.locator('.work-fatos [data-case]');
        await trigger.click();
        await page.waitForFunction(()=>document.querySelector('#case-dialog').open);
        await page.locator('#dialog-image img').waitFor({state:'attached'});
        check('Original case dialog still opens with real artwork',await page.locator('#case-dialog').evaluate(el=>el.open)&&await page.locator('#dialog-image img').count()===1);
        await page.locator('#dialog-close').click();
        await page.waitForFunction(()=>!document.querySelector('#case-dialog').open);
        check('Closing the case restores focus to its action',await trigger.evaluate(el=>el===document.activeElement));
        const mutationsBefore=mutations.length;
        await page.locator('#brief').fill('Quero conversar sobre um site e um aplicativo. Verificação local.');
        check('The briefing preview remains editable and local',await page.locator('.sm-brief-summary p').innerText()==='Quero conversar sobre um site e um aplicativo. Verificação local.'&&mutations.length===mutationsBefore);
      });
      await group('page',async()=>{
        check('No horizontal document overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
        check('No JavaScript exceptions',record.errors.length===0);
      });
    }catch(error){record.failures.push({group:'initialization',error:String(error)});await capture('failure-initialization').catch(()=>{});}
    finally{await context.close();}
    console.log(`[reference ${label}] ${record.checks.filter(check=>check.pass).length} passed; ${record.failures.length} groups failed`);
  }
}finally{
  await browser?.close();server?.kill();
  await writeFile(`${output}/${reportName}`,JSON.stringify({base,selectedGroups,records},null,2));
}
if(records.some(record=>record.failures.length))throw new Error(`Reference recovery checks failed; inspect ${output}/${reportName}`);
