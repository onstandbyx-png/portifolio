import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {verifyGallery,verifyEditorial,verifyFilm} from './presentation-motion.mjs';

// The browser and child server share one environment. Outer cards, editorial
// and film move; campaign/product mock content remains local static artwork.
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
    await page.addInitScript(()=>{
      window.__copiedBrief=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedBrief=text;}}});
      window.__presentationAnimations=[];const animate=Element.prototype.animate;
      Element.prototype.animate=function(...args){const animation=animate.apply(this,args);if(this.matches('.sp-campaign-panel figure,.sp-products figure'))window.__presentationAnimations.push({kind:this.closest('.sp-campaign-panel')?'campaign':'product',frames:animation.effect.getKeyframes()});return animation;};
    });
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.waitForSelector('html[data-static-presentations="ready"]',{state:'attached'});
      await page.waitForSelector('.rg-scroll-shell[data-ready="true"]',{state:'attached'});
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

      await verifyGallery({page,width,reduced,check,capture});
      await verifyEditorial({page,width,reduced,check,capture});
      await verifyFilm({page,width,reduced,check,capture});
      check('Standalone Trilhas is hidden without removing the Digital destination',await page.locator('#trilhas[hidden]').count()===1&&!await page.locator('#trilhas').isVisible()&&await page.locator('#sistemas.digital-anchor').count()===1);
      check('Campaign and product interiors have no nested fake controls or media',await page.locator('.sp-products,.sp-campaign-panel').evaluateAll(roots=>roots.every(root=>!root.querySelector('button,input,select,textarea,[contenteditable],iframe,video,audio,canvas,[role="button"],[role="tab"],.df-explore'))));
      check('Retired interactive product demos and explorers remain absent',await page.locator('.df-explorer,[data-product-tab],[data-call-play],[data-app-action],[data-case],#case-dialog').count()===0);
      check('Archived studio is absent from public navigation',await page.locator('a[href$="#estudio-interativo"],video.ks-video').count()===0);

      const tabs=page.locator('#laboratorio [data-sp-tab]');
      check('Only the three actual campaign channels remain selectable',await tabs.count()===3&&await tabs.evaluateAll(items=>items.every(tab=>{const r=tab.getBoundingClientRect();return tab.getAttribute('role')==='tab'&&r.width>=44&&r.height>=44;})));
      for(let index=0;index<3;index++){
        const beforeMotion=await page.evaluate(()=>window.__presentationAnimations.filter(item=>item.kind==='campaign').length);
        await tabs.nth(index).click();
        const panelId=await tabs.nth(index).getAttribute('aria-controls'),panel=page.locator(`#${panelId}`);
        if(index>0)check(`Campaign ${index+1}: outer transition respects the motion preference`,await page.evaluate(({beforeMotion,reduced})=>{const after=window.__presentationAnimations.filter(item=>item.kind==='campaign').length;return reduced?after===beforeMotion:after>beforeMotion;},{beforeMotion,reduced}));
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
      await page.locator('#motion-toggle').click();
      const pausedAnimations=await page.evaluate(()=>window.__presentationAnimations.length);await tabs.nth(2).click();
      check('Global pause keeps campaign selection usable without starting an animation',await tabs.nth(2).getAttribute('aria-selected')==='true'&&await page.evaluate(count=>window.__presentationAnimations.length===count,pausedAnimations));
      await page.locator('#motion-toggle').click();await tabs.first().click();

      check('Hidden product presentation has no visible or focusable controls',await page.locator('#trilhas').evaluate(root=>root.hidden&&root.inert&&root.getBoundingClientRect().height===0));
      for(const id of ['trabalhos','editorial','colecao','narrativa-visual']){await page.locator(`#${id}`).scrollIntoViewIfNeeded();await capture(id);}
      check('All internal navigation links resolve to existing sections',await page.locator('.main-nav a,#mobile-nav a,.rg-scroll-shell a').evaluateAll(links=>links.every(link=>link.hash&&document.getElementById(link.hash.slice(1)))));
      const before=await page.evaluate(()=>scrollY);await page.mouse.move(width*.5,height*.5);await page.mouse.wheel(0,220);
      await page.waitForFunction(before=>scrollY>before+60,before);
      check('The product presentation preserves native page scrolling',await page.evaluate(()=>scrollY)>before+60);

      // The sheet remains in its own plane. A physical pull peels the photo
      // away and exposes the actual creative brief, not a 180-degree rotation.
      const campaignCard=page.locator('#laboratorio .sp-campaign-card');
      await campaignCard.scrollIntoViewIfNeeded();
      // Explicitly align the grip BELOW the fixed desktop/mobile header.
      await campaignCard.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-118,behavior:'instant'}));
      await page.waitForTimeout(180);
      check('Campaign starts with its artwork and a visible pull corner',
        await campaignCard.getAttribute('data-side')==='front'&&
        await campaignCard.locator('[data-peel-grip]').count()===1&&
        await campaignCard.locator('.sp-peel-fold').count()===1);
      const grip=campaignCard.locator('[data-peel-grip]');
      const gripBox=await grip.boundingBox();
      check('The folded tip is actually hittable and not covered by the header',await page.evaluate(({x,y})=>Boolean(document.elementFromPoint(x,y)?.closest('[data-peel-grip]')),{x:gripBox.x+gripBox.width*.55,y:gripBox.y+gripBox.height*.46}));
      if(width<500){
        const session=await page.context().newCDPSession(page);
        try{
          const sx=gripBox.x+gripBox.width*.55,sy=gripBox.y+gripBox.height*.46;
          await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y:sy,id:1}]});
          for(let step=1;step<=12;step++){
            await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx-step*14,y:sy+step*14,id:1}]});
            await page.waitForTimeout(22);
          }
          check('Pulling the corner progressively exposes more of the layer behind',
            Number(await campaignCard.getAttribute('data-peel-progress'))>.24);
          await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        }finally{await session.detach();}
      }else{
        await page.mouse.move(gripBox.x+gripBox.width*.55,gripBox.y+gripBox.height*.46);
        await page.mouse.down();
        await page.mouse.move(gripBox.x-gripBox.width*.7,gripBox.y+gripBox.height*2.6,{steps:13});
        check('Desktop drag visibly moves the paper corner',
          Number(await campaignCard.getAttribute('data-peel-progress'))>.24);
        await page.mouse.up();
      }
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='open');
      check('Pulling reveals the actual note without rotating the card',
        await campaignCard.getAttribute('data-side')==='back'&&
        await campaignCard.locator('[data-sp-card-back]').getAttribute('aria-hidden')==='false'&&
        Number(await campaignCard.getAttribute('data-peel-progress'))>.99&&
        await campaignCard.locator('[data-campaign-note]').count()===1);
      await campaignCard.locator('[data-sp-card-turn="back"]').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='closed');
      check('The return control restores the artwork after peeling',
        await campaignCard.getAttribute('data-side')==='front'&&
        Number(await campaignCard.getAttribute('data-peel-progress'))<.06);
      await campaignCard.locator('[data-peel-grip]').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='open');
      check('Tapping the folded corner is an accessible alternative to dragging',
        await campaignCard.getAttribute('data-side')==='back');
      await page.locator('[data-contact-service="Campanhas e gestão de mídia"]').click();
      check('Campaign contact action prefills the exact service without sending',await page.locator('#service').inputValue()==='Campanhas e gestão de mídia'&&row.mutations.length===0);
      await page.locator('#service').selectOption({label:'Sites, apps e sistemas'});
      const brief='Quero criar um site e um aplicativo. Teste local de revisão.';await page.locator('#brief').fill(brief);
      await page.locator('.sm-brief-summary summary').click();
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
if(records.some(row=>row.failure))throw new Error('Portfolio presentation regression failed; inspect qa/static-presentations/results.json');
