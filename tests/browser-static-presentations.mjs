import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {verifyGallery,verifyFilm} from './presentation-motion.mjs';

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
        check('Open mobile menu locks the page, makes it inert and ends with a contact action',await page.evaluate(()=>getComputedStyle(document.documentElement).overflow==='hidden'&&document.querySelector('main').inert&&document.querySelector('.site-footer-band').inert)&&await page.locator('#mobile-nav .mobile-nav-cta[href="#contato"]').isVisible());
        await page.keyboard.press('Shift+Tab');await page.keyboard.press('Shift+Tab');
        check('Focus stays inside the open mobile menu',await page.locator('#mobile-nav .mobile-nav-cta').evaluate(el=>el===document.activeElement));
        await page.keyboard.press('Tab');
        check('Focus wraps from the last menu item to the close control',await page.locator('#menu-toggle').evaluate(el=>el===document.activeElement));
        await page.keyboard.press('Escape');
        check('Escape closes navigation and restores focus',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='false'&&await page.locator('#menu-toggle').evaluate(el=>el===document.activeElement));
        check('Closing the menu restores page scroll and interactivity',await page.evaluate(()=>getComputedStyle(document.documentElement).overflow!=='hidden'&&!document.querySelector('main').inert&&!document.querySelector('.site-footer-band').inert));
        await page.locator('#menu-toggle').click();await page.locator('#mobile-nav a[href="#categorias"]').click();
        check('Mobile navigation reaches the service catalogue',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='false'&&await page.locator('#categorias').evaluate(el=>el===document.activeElement));
        await page.locator('#menu-toggle').click();await page.locator('#mobile-nav .mobile-nav-cta').click();
        await page.waitForFunction(()=>{const top=document.querySelector('#brief-form').getBoundingClientRect().top;return top>=60&&top<=120;});
        check('Mobile contact action scrolls to the form and focuses its heading',await page.locator('#brief-title').evaluate(el=>el===document.activeElement&&el.tabIndex===-1));
      }
      const rail=page.locator('[data-brand-rail]');await rail.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('[data-brand-rail]').dataset.railMotion);
      if(reduced)check('Reduced motion presents a stationary brand rail',await rail.getAttribute('data-rail-motion')==='static'&&await rail.getAttribute('data-rail-running')==='false');
      else await page.waitForFunction(()=>document.querySelector('[data-brand-rail]').dataset.railRunning==='true');
      // Under the system preference the toggle is aria-disabled, so the click is forced to prove it changes nothing.
      const toggleMotion=()=>page.locator('#motion-toggle').click({force:reduced});
      check('Motion toggle draws SVG icons instead of emoji-prone glyphs',await page.locator('#motion-toggle').evaluate(button=>button.querySelectorAll('svg[aria-hidden="true"]').length===2&&!/[\u25b6\u2161]/.test(button.textContent)));
      if(reduced)check('The system reduced-motion preference is reflected in the toggle state and label',await page.locator('#motion-toggle').evaluate(button=>button.getAttribute('aria-pressed')==='true'&&button.getAttribute('aria-disabled')==='true'&&/sistema/.test(button.getAttribute('aria-label'))&&document.body.classList.contains('is-paused')));
      await toggleMotion();
      await page.waitForFunction(()=>document.querySelector('[data-brand-rail]').dataset.railRunning==='false');
      check('Global pause stops decorative motion and announces its state',await page.locator('#motion-toggle').getAttribute('aria-pressed')==='true'&&await page.locator('body').evaluate(el=>el.classList.contains('is-paused')));
      await toggleMotion();
      // With reduced motion the system preference wins: the toggle stays paused instead of claiming to resume.
      if(reduced)check('The system preference keeps motion paused after a click',await page.locator('#motion-toggle').getAttribute('aria-pressed')==='true'&&await page.locator('body').evaluate(el=>el.classList.contains('is-paused')));
      else check('The visitor can resume the motion preference',await page.locator('#motion-toggle').getAttribute('aria-pressed')==='false'&&!await page.locator('body').evaluate(el=>el.classList.contains('is-paused')));

      await verifyGallery({page,width,reduced,check,capture});
      check('Sites e lojas and Sistemas e automações mount the lab flows',await page.locator('[data-vitrine="loja"] .cm-screen').count()===1&&await page.locator('[data-vitrine="automacao"] .cm-screen').count()===1);
      await verifyFilm({page,width,reduced,check,capture});
      check('Standalone Trilhas is hidden without removing the Digital destination',await page.locator('#trilhas[hidden]').count()===1&&!await page.locator('#trilhas').isVisible()&&await page.locator('#sites.digital-anchor').count()===1);
      check('Campaign and product interiors have no nested fake controls or media',await page.locator('.sp-products,.sp-campaign-panel').evaluateAll(roots=>roots.every(root=>!root.querySelector('button,input,select,textarea,[contenteditable],iframe,video,audio,canvas,[role="button"],[role="tab"],.df-explore'))));
      check('Retired interactive product demos and explorers remain absent',await page.locator('.df-explorer,[data-product-tab],[data-call-play],[data-app-action],[data-case],#case-dialog').count()===0);
      check('Archived studio is absent from public navigation',await page.locator('a[href$="#estudio-interativo"],video.ks-video').count()===0);

      const tabs=page.locator('#laboratorio [data-sp-tab]');
      const channelIds=['instagram','facebook','tiktok','youtube','linkedin','google','seo','chatgpt','maps','whatsapp','blog'];
      check('The eleven campaign channels are selectable tiles named with their group and number of formats',JSON.stringify(await tabs.evaluateAll(items=>items.map(tab=>tab.dataset.spTab)))===JSON.stringify(channelIds)&&await tabs.evaluateAll(items=>items.every(tab=>{const r=tab.getBoundingClientRect();return tab.getAttribute('role')==='tab'&&r.width>=44&&r.height>=44&&/, (Redes sociais|Busca e IA|Local e conversa|Conteúdo), \d+ formatos?$/.test(tab.getAttribute('aria-label')||'');})));
      check('Each channel tile carries its official platform mark as inline SVG (the publieditorial a generic document glyph)',await tabs.evaluateAll(items=>items.every(tab=>tab.dataset.spTab==='blog'?!tab.querySelector('svg.ch-logo,img')&&Boolean(tab.querySelector('svg.sp-platform-logo--doc')):Boolean(tab.querySelector('svg.ch-logo'))&&!tab.querySelector('img'))));
      check('Every channel tile is visible at once, without scrolling or widening the page',await page.locator('#laboratorio .sp-platforms').evaluate(list=>{const b=list.getBoundingClientRect();return list.scrollWidth<=list.clientWidth+1&&[...list.querySelectorAll('[role="tab"]')].every(tab=>{const r=tab.getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1&&tab.querySelector('.sp-tab-name').scrollWidth<=tab.querySelector('.sp-tab-name').clientWidth+1;})&&b.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+2;}));
      const markerOnTab=()=>page.locator('#laboratorio .sp-platforms').evaluate(list=>{const tab=list.querySelector('[aria-selected="true"]'),marker=list.querySelector('.sp-tab-marker');const a=tab.getBoundingClientRect(),b=list.getBoundingClientRect(),m=getComputedStyle(marker).transform;const x=new DOMMatrixReadOnly(m==='none'?undefined:m).m41;return Math.abs(x-(a.left-b.left+list.scrollLeft))<2&&Math.abs(parseFloat(marker.style.width)-a.width)<2&&a.left>=b.left-1&&a.right<=b.right+1;});
      for(let index=0;index<channelIds.length;index++){
        const beforeMotion=await page.evaluate(()=>window.__presentationAnimations.filter(item=>item.kind==='campaign').length);
        await tabs.nth(index).click();
        const panelId=await tabs.nth(index).getAttribute('aria-controls'),panel=page.locator(`#${panelId}`);
        if(index>0)check(`Campaign ${index+1}: outer transition respects the motion preference`,await page.evaluate(({beforeMotion,reduced})=>{const after=window.__presentationAnimations.filter(item=>item.kind==='campaign').length;return reduced?after===beforeMotion:after>beforeMotion;},{beforeMotion,reduced}));
        check(`Campaign ${index+1}: selection exposes exactly its labelled static panel`,await tabs.nth(index).getAttribute('aria-selected')==='true'&&await panel.isVisible()&&await panel.getAttribute('aria-labelledby')===await tabs.nth(index).getAttribute('id')&&await page.locator('.sp-campaign-panel:not([hidden])').count()===1);
        // Containment is measured once the entrance (a 42px spring) has settled.
        await page.waitForFunction(()=>!document.querySelector('#laboratorio .sp-campaign').dataset.transitioning);
        await panel.locator('img').evaluate(img=>img.decode());
        check(`Campaign ${index+1}: the local artwork is decoded and contained`,await panel.locator('img').evaluate(img=>{const r=img.getBoundingClientRect();return img.naturalWidth>0&&img.getAttribute('src').startsWith('/assets/')&&img.alt.trim().length>12&&r.width>0&&r.left>=-1&&r.right<=innerWidth+1;}));
        await page.waitForTimeout(reduced?30:560);
        check(`Campaign ${index+1}: the sliding marker sits under the selected tab, which stays visible in its row`,await markerOnTab());
        if(index<3||index===channelIds.length-1)await capture(`campaign-${index}`);
      }
      await tabs.first().focus();await page.keyboard.press('ArrowRight');
      check('Arrow navigation selects and focuses the next campaign',await tabs.nth(1).getAttribute('aria-selected')==='true'&&await tabs.nth(1).evaluate(el=>el===document.activeElement));
      await page.keyboard.press('End');
      check('End selects the final campaign',await tabs.last().getAttribute('aria-selected')==='true'&&await tabs.last().evaluate(el=>el===document.activeElement));
      await page.keyboard.press('Home');
      check('Home restores the first campaign',await tabs.first().getAttribute('aria-selected')==='true'&&await tabs.first().evaluate(el=>el===document.activeElement));
      await toggleMotion();
      const pausedAnimations=await page.evaluate(()=>window.__presentationAnimations.length);await tabs.nth(2).click();
      check('Global pause keeps campaign selection usable without starting an animation',await tabs.nth(2).getAttribute('aria-selected')==='true'&&await page.evaluate(count=>window.__presentationAnimations.length===count,pausedAnimations));
      await toggleMotion();await tabs.first().click();

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
        // On desktop the sheet is ~700px wide: use a meaningful pull travel.
        await page.mouse.move(gripBox.x-230,gripBox.y+295,{steps:18});
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
      // Behind the paper: a fictitious client's ad in its native placement, inside the orange iPhone,
      // with the official platform mark, the ad label, the client chip and the three-step journey (no long text block).
      check('The back shows the selected channel placement with its ad label, client chip and journey',
        await campaignCard.locator('.cx-player').getAttribute('data-platform')===await page.locator('.sp-campaign').getAttribute('data-channel')&&
        /Patrocinado/.test(await campaignCard.locator('.cx-stage').innerText())&&
        await campaignCard.locator('.cx-stage .ch-iphone[data-cor="laranja"]').count()===1&&
        await campaignCard.locator('.cx-brand svg.ch-logo').count()===1&&
        /Patrocinado/.test(await campaignCard.locator('.cx-label').innerText())&&
        /marca fictícia/.test(await campaignCard.locator('.cx-client').innerText())&&
        await campaignCard.locator('.cx-journey li').count()===3&&
        await campaignCard.locator('.cx-journey [aria-current="step"]').count()===1&&
        await campaignCard.locator('.cx-positioning,.campaign-facts').count()===0&&
        !/smiile/i.test(await campaignCard.locator('.cx-player').innerText()));
      const labels={tiktok:/Patrocinado/,linkedin:/Promovido/,chatgpt:/Anúncio/,maps:/Patrocinado/,blog:/Conteúdo patrocinado por Arrimo Patrimônio/,seo:/moradafalesia\.exemplo/};
      for(const [id,label] of Object.entries(labels)){
        await page.locator('#tab-'+id).click();
        await page.waitForFunction(id=>document.querySelector('#laboratorio .cx-player')?.dataset.platform===id,id);
        check(`Switching to ${id} keeps the peel open and updates what is behind`,await campaignCard.getAttribute('data-side')==='back'&&label.test(await campaignCard.locator('.cx-stage').first().innerText()));
      }
      check('The organic result is not labelled as an ad',!/Patrocinado/.test(await campaignCard.locator('.cm-g-result--organic').innerText()));
      await page.locator('#tab-tiktok').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .cx-player')?.dataset.platform==='tiktok');
      await campaignCard.locator('[data-cx-body] .cx-stage').scrollIntoViewIfNeeded();
      const screenFrame=()=>campaignCard.locator('[data-cx-body] .cm-screen').getAttribute('data-frame');
      const lastFrame=String(Number(await campaignCard.locator('[data-cx-body] .cx-stage').getAttribute('data-frames'))-1);
      if(reduced){
        check('Reduced motion never autoplays the journey and offers the next frame',await screenFrame()==='0'&&await campaignCard.locator('[data-cx-body] [data-cx-step="0"]').getAttribute('aria-current')==='step'&&/Próximo/.test(await campaignCard.locator('[data-cx-play]').innerText()));
        await campaignCard.locator('[data-cx-play]').click();
        check('Without motion the journey advances one frame on request',await screenFrame()==='1');
        await campaignCard.locator('[data-cx-body] [data-cx-step="2"]').click();
        await page.waitForTimeout(80);
        check('Choosing the conversion step shows the tap on the CTA as a static mark',await campaignCard.locator('[data-cx-body] [data-cx-step="2"]').getAttribute('aria-current')==='step'&&await campaignCard.locator('[data-cx-body] .cx-tap.is-static:not([hidden])').count()===1&&Boolean(await campaignCard.locator('[data-cx-body] .cm-screen').getAttribute('data-tap')));
      }else{
        await page.waitForFunction(last=>document.querySelector('#laboratorio [data-cx-body] .cm-screen')?.dataset.frame===last&&document.querySelector('#laboratorio [data-cx-play]').getAttribute('aria-pressed')==='false',lastFrame,{timeout:30000});
        await page.waitForTimeout(700);
        check('The journey plays once to the native conversion screen and stops there with a replay control',await screenFrame()===lastFrame&&/(^| )done( |$)/.test(await campaignCard.locator('[data-cx-body] .cm-screen').getAttribute('data-state'))&&await campaignCard.locator('[data-cx-body] .cx-journey li[data-state="done"]').count()===3&&/Rever/.test(await campaignCard.locator('[data-cx-play]').innerText()));
      }
      await page.locator('#tab-instagram').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .cx-player')?.dataset.platform==='instagram');
      await campaignCard.locator('[data-sp-card-turn="back"]').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='closed');
      check('The return control restores the artwork after peeling',
        await campaignCard.getAttribute('data-side')==='front'&&
        Number(await campaignCard.getAttribute('data-peel-progress'))<.06);
      await campaignCard.locator('[data-peel-grip]').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='open');
      check('Tapping the folded corner is an accessible alternative to dragging',
        await campaignCard.getAttribute('data-side')==='back');
      await campaignCard.locator('[data-contact-service="Campanhas e anúncios"]').click();
      check('Campaign contact action prefills the exact service without sending',await page.locator('#service').inputValue()==='Campanhas e anúncios'&&row.mutations.length===0);
      await page.locator('#service').selectOption({label:'Sites e landing pages'});
      const brief='Quero criar um site e um aplicativo. Teste local de revisão.';await page.locator('#brief').fill(brief);
      await page.locator('.sm-brief-summary summary').click();
      check('The contact summary reflects the editable local draft',await page.locator('.sm-brief-summary p').innerText()===brief&&await page.locator('#brief-form').getAttribute('data-contact-ready')==='true');
      await page.locator('.brief-copy').click();
      const copied=await page.evaluate(()=>window.__copiedBrief);
      check('Copying the briefing preserves its service and text without sending',copied?.includes('Sites e landing pages')&&copied.includes(brief)&&row.mutations.length===0);
      check('The real contact destinations remain available',await page.locator('[data-contact-direct="whatsapp"]').getAttribute('href')==='https://wa.me/5511985568208'&&await page.locator('[data-contact-direct="email"]').getAttribute('href')==='mailto:smillepls@gmail.com');
      await page.locator('#service').selectOption('');await page.locator('#brief').fill('');await page.locator('#brief-form button[type="submit"]').click();
      check('An empty brief shows inline pt-BR errors tied to its fields, without sending',await page.evaluate(()=>{const form=document.querySelector('#brief-form'),fields=[...form.querySelectorAll('#service,#brief')];return form.noValidate&&fields.every(field=>{const error=document.getElementById(field.getAttribute('aria-describedby')||'');return field.getAttribute('aria-invalid')==='true'&&error&&!error.hidden&&error.textContent.trim().length>10;})&&document.activeElement===fields[0];})&&row.mutations.length===0);
      await page.locator('#service').selectOption({label:'Sites e landing pages'});await page.locator('#brief').fill(brief);
      check('Correcting the fields clears their errors',await page.locator('#service,#brief').evaluateAll(fields=>fields.every(field=>!field.hasAttribute('aria-invalid')&&document.getElementById(field.id+'-error').hidden)));
      check('The footer is a contentinfo landmark outside main, with 44px targets and the navigation names',await page.evaluate(()=>{const footer=document.querySelector('body>footer');const links=[...footer.querySelectorAll('a')];return footer&&!footer.closest('main')&&links.every(link=>link.getBoundingClientRect().height>=44)&&[...document.querySelectorAll('.main-nav a')].every(nav=>links.some(link=>link.hash===nav.hash&&link.textContent.trim()===nav.textContent.trim()));}));
      if(width>900)for(const id of ['editorial','laboratorio','sistemas']){
        await page.locator('#'+id).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));
        check(`#${id} keeps Trabalhos marked in the header`,await page.waitForFunction(()=>document.querySelector('.main-nav a[aria-current="location"]')?.hash==='#trabalhos',null,{timeout:4000}).then(()=>true,()=>false));
      }
      check('No horizontal document overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
      check('No broken local resources or JavaScript exceptions',row.failedRequests.length===0&&row.errors.length===0);
    }catch(error){row.failure=String(error);await capture('failure').catch(()=>{});console.error(`[static ${width}${reduced?'/reduced':''}] ${error}`);}
    finally{await context.close();}
    console.log(`[static ${width}${reduced?'/reduced':''}] ${row.checks.filter(item=>item.pass).length} passed${row.failure?', FAILED':''}`);
  }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/${process.env.QA_REPORT||'results.json'}`,JSON.stringify(records,null,2));}
if(records.some(row=>row.failure))throw new Error('Portfolio presentation regression failed; inspect qa/static-presentations/results.json');
