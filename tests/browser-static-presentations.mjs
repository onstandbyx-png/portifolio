import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

// The browser and its child server live in the same process environment. Static
// portfolio artwork stays an image; only real site navigation is interactive.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/static-presentations',port=process.env.PORT||'4194';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
const records=[];let browser;
await mkdir(output,{recursive:true});
try{
  let healthy=false;for(let i=0;i<60;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(resolve=>setTimeout(resolve,150));}assert(healthy,'Server reachable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const widths=process.env.QA_WIDTHS?.split(',').map(Number);
  for(const [width,height,reduced] of [[320,740,false],[390,844,false],[1440,900,false],[390,844,true]].filter(([w])=>!widths||widths.includes(w))){
    const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:reduced?'reduce':'no-preference',deviceScaleFactor:1});
    const page=await context.newPage();page.setDefaultTimeout(15000);
    const row={width,height,reduced,checks:[],errors:[],failedRequests:[],mutations:[]};records.push(row);
    const check=(name,pass)=>{row.checks.push({name,pass:Boolean(pass)});assert(pass,name);};
    const capture=async(name)=>page.screenshot({path:`${output}/${name}-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
    page.on('pageerror',error=>row.errors.push(String(error)));
    page.on('response',response=>{if(response.status()>=400)row.failedRequests.push({status:response.status(),url:response.url()});});
    page.on('request',request=>{if(!['GET','HEAD','OPTIONS'].includes(request.method()))row.mutations.push({method:request.method(),url:request.url()});});
    await page.addInitScript(()=>{window.__copiedBrief=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedBrief=text;}}});});
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.waitForSelector('html[data-static-presentations="ready"]',{state:'attached'});
      await page.waitForSelector('.rg-static-gallery[data-gallery-ready="true"]',{state:'attached'});
      await page.evaluate(()=>document.fonts.ready);
      check('The physical badge hero remains available',await page.locator('[data-portfolio-badges]').count()===1&&await page.locator('[data-badge-select]').count()===2&&await page.locator('[data-badge-flip]').count()===1);
      check('Removed hero explanations remain absent',await page.locator('.hero-badge-detail,[data-badge-hint],.hero-support,.scroll-indicator').count()===0);
      check('Header pause target remains accessible',await page.locator('#motion-toggle').evaluate(button=>{const r=button.getBoundingClientRect();return button.closest('.site-header')&&r.width>=44&&r.height>=44&&button.getAttribute('aria-label');}));
      if(width<500){
        check('Mobile header controls do not overlap',await page.evaluate(()=>{const mark=document.querySelector('.wordmark').getBoundingClientRect(),pause=document.querySelector('#motion-toggle').getBoundingClientRect(),menu=document.querySelector('#menu-toggle').getBoundingClientRect();return mark.right<=pause.left+1&&pause.right<=menu.left+1&&menu.right<=innerWidth&&menu.width>=44&&menu.height>=44;}));
        await page.locator('#menu-toggle').click();
        check('Mobile menu opens and focuses its first destination',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='true'&&await page.locator('#mobile-nav').isVisible()&&await page.locator('#mobile-nav a').first().evaluate(el=>el===document.activeElement));
        await page.keyboard.press('Escape');
        check('Escape closes navigation and restores focus',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='false'&&await page.locator('#menu-toggle').evaluate(el=>el===document.activeElement));
        await page.locator('#menu-toggle').click();await page.locator('#mobile-nav a[href="#editorial"]').click();
        check('Mobile navigation reaches the actual editorial section',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='false'&&await page.locator('#editorial').evaluate(el=>el===document.activeElement));
      }
      const rail=page.locator('[data-brand-rail]');await rail.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('[data-brand-rail]').dataset.railMotion);
      if(reduced)check('Reduced motion presents a stationary brand rail',await rail.getAttribute('data-rail-motion')==='static'&&await rail.getAttribute('data-rail-running')==='false');
      else await page.waitForFunction(()=>document.querySelector('[data-brand-rail]').dataset.railRunning==='true');
      await page.locator('#motion-toggle').click();
      await page.waitForFunction(()=>document.querySelector('[data-brand-rail]').dataset.railRunning==='false');
      check('Global pause stops decorative motion and announces its state',await page.locator('#motion-toggle').getAttribute('aria-pressed')==='true'&&await page.locator('body').evaluate(el=>el.classList.contains('is-paused')));
      await page.locator('#motion-toggle').click();
      check('The visitor can resume the motion preference',await page.locator('#motion-toggle').getAttribute('aria-pressed')==='false'&&!await page.locator('body').evaluate(el=>el.classList.contains('is-paused')));

      const gallery=page.locator('#trabalhos .rg-static-gallery');
      check('Three work cards stay in normal document flow',await gallery.locator('[data-work-card]').evaluateAll(cards=>cards.length===3&&cards.every(card=>{const style=getComputedStyle(card);return !card.inert&&style.display!=='none'&&style.visibility!=='hidden'&&!['absolute','fixed','sticky'].includes(style.position);})));
      check('Each work has one real destination and no flip or demo controls',await gallery.evaluate(root=>{const cards=[...root.querySelectorAll('[data-work-card]')],targets=['#editorial','#laboratorio','#sistemas'];return cards.every((card,i)=>card.querySelectorAll('a.tile-open').length===1&&card.querySelector('a.tile-open').getAttribute('href')===targets[i]&&document.querySelector(targets[i]))&&!root.querySelector('button,[data-case],.sm-work-stage,.sm-work-peek,.sm-work-back');}));
      check('Editorial is one static composition and six directly visible Fatos pieces',await page.locator('#editorial .sp-editorial-art img').count()===1&&await page.locator('#colecao .sp-fatos-grid figure').count()===6&&await page.locator('#colecao .sp-fatos-grid figcaption').count()===6);
      check('The two digital projects are static images',await page.locator('#sistemas .sp-products figure').count()===2&&await page.locator('#sistemas .sp-products figure img').count()===2);
      check('Static presentations have no nested fake controls or media',await page.locator('.sp-editorial-art,.sp-fatos-grid,.sp-products,.sp-campaign-panel').evaluateAll(roots=>roots.every(root=>!root.querySelector('button,input,select,textarea,[contenteditable],iframe,video,audio,canvas,[role="button"],[role="tab"],.df-explore'))));
      check('Legacy demo, flip and explorer interfaces are not mounted',await page.locator('.df-explorer,.df-device,.sm-work-stage,[data-fatos-flip],[data-fatos-select],[data-editorial-step],[data-product-tab],[data-call-play],[data-rx-film-to],[data-case],#case-dialog').count()===0);
      check('Archived studio is absent from public navigation',await page.locator('a[href$="#estudio-interativo"],video.ks-video').count()===0);

      const tabs=page.locator('#laboratorio [data-sp-tab]');
      check('Only the three actual campaign channels remain selectable',await tabs.count()===3&&await tabs.evaluateAll(items=>items.every(tab=>{const r=tab.getBoundingClientRect();return tab.getAttribute('role')==='tab'&&r.width>=44&&r.height>=44;})));
      for(let index=0;index<3;index++){
        await tabs.nth(index).click();
        const panelId=await tabs.nth(index).getAttribute('aria-controls'),panel=page.locator(`#${panelId}`);
        check(`Campaign ${index+1}: selection exposes exactly its labelled static panel`,await tabs.nth(index).getAttribute('aria-selected')==='true'&&await panel.isVisible()&&await panel.getAttribute('aria-labelledby')===await tabs.nth(index).getAttribute('id')&&await page.locator('.sp-campaign-panel:not([hidden])').count()===1);
        await panel.locator('img').evaluate(img=>img.decode());
        check(`Campaign ${index+1}: the local artwork is decoded and contained`,await panel.locator('img').evaluate(img=>{const r=img.getBoundingClientRect();return img.naturalWidth>0&&img.getAttribute('src').startsWith('/assets/')&&img.alt.trim().length>12&&r.width>0&&r.left>=-1&&r.right<=innerWidth+1;}));
        await capture(`campaign-${index}`);
      }
      await tabs.first().focus();await page.keyboard.press('ArrowRight');
      check('Arrow navigation selects and focuses the next campaign',await tabs.nth(1).getAttribute('aria-selected')==='true'&&await tabs.nth(1).evaluate(el=>el===document.activeElement));
      await page.keyboard.press('End');
      check('End selects the final campaign',await tabs.nth(2).getAttribute('aria-selected')==='true'&&await tabs.nth(2).evaluate(el=>el===document.activeElement));
      await page.keyboard.press('Home');
      check('Home restores the first campaign',await tabs.first().getAttribute('aria-selected')==='true'&&await tabs.first().evaluate(el=>el===document.activeElement));

      const artwork=page.locator('.rg-art img,.sp-editorial-art img,.sp-fatos-grid img,.sp-products img');
      check('The gallery and static sections expose all twelve expected artworks',await artwork.count()===12);
      for(const image of await artwork.all()){
        await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());
        const result=await image.evaluate(img=>{const r=img.getBoundingClientRect();return {src:img.getAttribute('src'),alt:img.alt,decoded:img.naturalWidth>0&&img.naturalHeight>0,local:img.getAttribute('src').startsWith('/assets/'),labelled:img.alt.trim().length>12,sized:Number(img.getAttribute('width'))>0&&Number(img.getAttribute('height'))>0,contained:r.left>=-1&&r.right<=innerWidth+1&&r.width>0,visible:getComputedStyle(img).visibility!=='hidden'&&Number(getComputedStyle(img).opacity)>0};});
        row.images??=[];row.images.push(result);
        check(`Static artwork is readable, labelled and local: ${result.src}`,result.decoded&&result.local&&result.labelled&&result.sized&&result.contained&&result.visible);
      }
      for(const id of ['trabalhos','editorial','colecao','sistemas']){await page.locator(`#${id}`).scrollIntoViewIfNeeded();await capture(id);}
      check('All internal navigation links resolve to existing sections',await page.locator('.main-nav a,#mobile-nav a,.rg-static-gallery a').evaluateAll(links=>links.every(link=>link.hash&&document.getElementById(link.hash.slice(1)))));
      const before=await page.evaluate(()=>scrollY);await page.mouse.move(width*.5,height*.5);await page.mouse.wheel(0,220);
      await page.waitForFunction(before=>scrollY>before+60,before);
      check('The static projects preserve native page scrolling',await page.evaluate(()=>scrollY)>before+60);

      await page.locator('[data-contact-service="Campanhas e gestão de mídia"]').click();
      check('Campaign contact action prefills the exact service without sending',await page.locator('#service').inputValue()==='Campanhas e gestão de mídia'&&row.mutations.length===0);
      await page.locator('#service').selectOption({label:'Sites, apps e sistemas'});
      const brief='Quero criar um site e um aplicativo. Teste local de revisão.';await page.locator('#brief').fill(brief);
      check('The contact summary reflects the editable local draft',await page.locator('.sm-brief-summary p').innerText()===brief&&await page.locator('#brief-form').getAttribute('data-contact-ready')==='true');
      await page.locator('.brief-copy').click();
      const copied=await page.evaluate(()=>window.__copiedBrief);
      check('Copying the briefing preserves its service and text without sending',copied?.includes('Sites, apps e sistemas')&&copied.includes(brief)&&row.mutations.length===0);
      check('The real contact destinations remain available',await page.locator('[data-contact-direct="whatsapp"]').getAttribute('href')==='https://wa.me/5511985568208'&&await page.locator('[data-contact-direct="email"]').getAttribute('href')==='mailto:smillepls@gmail.com');
      check('No horizontal document overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
      check('No broken local resources or JavaScript exceptions',row.failedRequests.length===0&&row.errors.length===0);
    }catch(error){row.failure=String(error);await capture('failure').catch(()=>{});console.error(`[static ${width}${reduced?'/reduced':''}] ${error}`);}
    finally{await context.close();}
    console.log(`[static ${width}${reduced?'/reduced':''}] ${row.checks.filter(item=>item.pass).length} passed${row.failure?', FAILED':''}`);
  }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/${process.env.QA_REPORT||'results.json'}`,JSON.stringify(records,null,2));}
if(records.some(row=>row.failure))throw new Error('Static presentation regression failed; inspect qa/static-presentations/results.json');
