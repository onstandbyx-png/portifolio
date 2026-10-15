import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';

// Reuse a running preview with BASE_URL (QA_URL is kept for older runners).
// Otherwise this test serves the already built project; it never changes a build.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
let chromium;
try{({chromium}=require('playwright'));}
catch{({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const port=process.env.PORT||'4175';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const output=process.env.QA_OUTPUT||'qa/conversion';
await mkdir(output,{recursive:true});
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
const report={base,environment:{browser:'Chromium',gpu:'SwiftShader / software rendering',performance:'This is a functional and layout audit, not a real-device performance measurement.'},results:[]};
let browser;
try{
  let healthy=false;
  for(let attempt=0;attempt<60;attempt++){
    try{if((await fetch(`${base}/health`)).ok){healthy=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  assert(healthy,`Preview did not become healthy: ${base}`);
  const executablePath=process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const [width,height] of [[1440,1000],[320,740],[390,844],[430,932]]){
    const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,deviceScaleFactor:1});
    const page=await context.newPage();
    page.setDefaultTimeout(20000);
    await page.addInitScript(()=>{
      window.__qaOpened=[];
      window.__qaInteractions=[];
      window.open=(url,target,features)=>{window.__qaOpened.push({url:String(url),target,features});return null;};
      addEventListener('portfolio:interaction',event=>window.__qaInteractions.push(event.detail));
    });
    const row={width,height,checks:[],errors:[]};report.results.push(row);
    page.on('pageerror',error=>row.errors.push(error.message));
    const localFailures=[];
    page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)localFailures.push({url:response.url(),status:response.status()});});
    // The portfolio must retain its own images without preview-site availability.
    await page.route('https://midia-kit-production-c234.up.railway.app/**',route=>route.abort());
    await page.route('https://smiile-landing-preview.up.railway.app/**',route=>route.abort());
    const check=(label,value,detail)=>{row.checks.push({label,pass:Boolean(value),...(detail===undefined?{}:{detail})});assert(value,label);};
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.waitForSelector('html.sm-sections-ready',{state:'attached',timeout:60000});
      await page.waitForSelector('html[data-rx-showcase="ready"]',{state:'attached',timeout:60000});
      check('Document is identified as Brazilian Portuguese',await page.locator('html').getAttribute('lang')==='pt-BR');
      check('One primary heading defines the professional offer',await page.locator('h1').count()===1);
      const hero=await page.locator('.hero-copy').innerText();
      check('Hero positions creative direction, narrative and technology',/dire[çc][aã]o criativa|diretor criativo/i.test(hero)&&/narrativa|hist[oó]rias/i.test(hero)&&/tecnologia|digitais/i.test(hero));
      check('Fatos is a professional credential near the offer',/Fatos Desconhecidos/i.test(hero));
      check('Hero has a direct path to project contact',await page.locator('.hero-actions a[href="#contato"]').count()>0);
      const visual=page.locator('[data-portfolio-badges]');
      check('Hero retains a usable image during initialization',await visual.evaluate(el=>{const canvas=el.querySelector('canvas'),fallback=el.querySelector('.hero-badge-standin');return [canvas,fallback].some(node=>node&&getComputedStyle(node).display!=='none'&&Number(getComputedStyle(node).opacity)>.05);}));
      await page.screenshot({path:`${output}/hero-${width}.png`,animations:'disabled'});
      // Pause the decorative animation before the remaining functional checks.
      if(await page.locator('#motion-toggle').getAttribute('aria-pressed')!=='true')await page.locator('#motion-toggle').click();
      check('Global motion preference is an accessible toggle',await page.locator('#motion-toggle').getAttribute('aria-pressed')==='true');

      const flip=page.locator('[data-badge-flip]');
      check('Hero offers an explicit badge back control',await flip.count()===1);
      await flip.focus();await page.keyboard.press('Enter');
      check('Badge reverse is keyboard accessible',await flip.getAttribute('aria-pressed')==='true'&&await visual.getAttribute('data-face')==='back');
      await page.keyboard.press('Enter');
      check('Badge returns to the front by keyboard',await flip.getAttribute('aria-pressed')==='false'&&await visual.getAttribute('data-face')==='front');

      if(width<500){
        await page.locator('#menu-toggle').click();
        check('Mobile navigation expands accessibly',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='true'&&await page.locator('#mobile-nav').isVisible());
        await page.locator('#mobile-nav a').first().focus();
        await page.keyboard.press('Escape');
        check('Escape closes mobile navigation and restores focus',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='false'&&await page.locator('#menu-toggle').evaluate(el=>document.activeElement===el));
      }

      const paths=page.locator('#project-paths');
      check('Project choices present three business needs',await paths.locator('[data-path-tab]').count()===3);
      await paths.locator('#path-panel-launch .path-demo-cta').click();
      check('Landing example opens the promised product flow',await paths.getAttribute('data-active-path')==='experience'&&await paths.locator('#path-panel-experience').isVisible());
      check('Opening the product flow moves focus into its panel',await paths.locator('#path-panel-experience').evaluate(el=>document.activeElement===el));
      for(const id of ['launch','demand','experience']){
        const tab=paths.locator(`[data-path-tab="${id}"]`),panel=paths.locator(`#path-panel-${id}`);
        await tab.click();
        check(`${id}: selected project path reveals the matching panel`,await tab.getAttribute('aria-selected')==='true'&&await panel.isVisible()&&await panel.getAttribute('aria-labelledby')===`path-tab-${id}`);
        const originalNote=await panel.locator('[data-path-note]').innerText();
        await panel.locator('[data-path-focus="1"]').click();
        check(`${id}: creative decision changes the explanation`,await panel.locator('[data-path-focus="1"]').getAttribute('aria-pressed')==='true'&&(await panel.locator('[data-path-note]').innerText())!==originalNote);
        const cta=panel.locator('.path-contact');
        const need=await cta.getAttribute('data-project-need');
        await cta.click();
        check(`${id}: project path prepares the appropriate service`,(await page.locator('#service').inputValue())===need);
      }
      const firstPath=paths.locator('[data-path-tab="launch"]');
      await firstPath.focus();await page.keyboard.press('End');
      check('Project tabs support keyboard navigation',await paths.locator('[data-path-tab="experience"]').evaluate(el=>document.activeElement===el)&&await paths.locator('[data-path-tab="experience"]').getAttribute('aria-selected')==='true');
      await page.keyboard.press('Home');
      check('Home returns to the first project path',await firstPath.evaluate(el=>document.activeElement===el)&&await firstPath.getAttribute('aria-selected')==='true');

      await page.locator('#trabalhos [data-case="smiile"]').first().click();
      const selectedCaseTitle=await page.locator('#case-dialog-title').innerText();
      await page.locator('.case-contact').click();
      await page.waitForFunction(()=>!document.querySelector('#case-dialog')?.open);
      check('Case CTA carries the project context to the brief',await page.locator('#brief-context').isVisible()&&(await page.locator('#brief-context').innerText()).includes(selectedCaseTitle)&&(await page.locator('#service').inputValue()).length>0);
      check('Case CTA moves keyboard focus to the briefing field',await page.locator('#brief').evaluate(el=>document.activeElement===el));

      for(const id of ['fatos','smiile','ci']){
        const trigger=page.locator(`#trabalhos [data-case="${id}"]`).first();
        await trigger.click();
        const dialog=page.locator('#case-dialog');
        await page.waitForFunction(()=>document.querySelector('#case-dialog')?.open);
        check(`${id}: case opens as an accessible dialog`,await dialog.getAttribute('aria-labelledby')==='case-dialog-title'&&(await page.locator('#case-dialog-title').innerText()).length>8);
        const caseText=await dialog.innerText();
        check(`${id}: case explains contribution and evidence`,/participa[çc][aã]o|minha atua[çc][aã]o|responsabilidade|contribui[çc][aã]o/i.test(caseText)&&/evid[eê]ncia|demonstra[çc][aã]o|comprova|entrega|estudo/i.test(caseText));
        if(id==='fatos')check('Fatos presents professional background and identifies LINHA as independent',/Fatos Desconhecidos/.test(caseText)&&/independente|estudo separado|não é uma campanha da Fatos/i.test(caseText)&&await dialog.locator('.dialog-trajectory').isVisible()&&await dialog.locator('#dialog-image img').count()===0);
        await page.locator('#dialog-close').focus();await page.keyboard.press('Tab');
        check(`${id}: keyboard focus remains in the modal`,await dialog.evaluate(el=>el.contains(document.activeElement)));
        if(id==='fatos')await page.screenshot({path:`${output}/case-${width}.png`,animations:'disabled'});
        await page.keyboard.press('Escape');
        await page.waitForFunction(()=>!document.querySelector('#case-dialog')?.open);
        check(`${id}: closing returns focus to the opener`,await trigger.evaluate(el=>document.activeElement===el));
      }

      const studio=page.locator('#estudio-interativo');
      await studio.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('#estudio-interativo')?.dataset.ready==='true');
      await page.locator('[data-ks-mode="layers"]').click();
      check('Studio reveals four inspectable creative layers',await studio.locator('[data-layer]').count()===4&&await page.locator('[data-ks-mode="layers"]').getAttribute('aria-pressed')==='true');
      await studio.locator('[data-ks-inspect="2"]').click();
      check('Studio layer inspection reveals a decision',await studio.getAttribute('data-inspect')==='2');
      await page.locator('[data-ks-mode="custom"]').click();
      await page.locator('[data-ks-text]').fill('marca');
      check('Studio personalization changes the live artwork',await page.locator('.ks-word').innerText()==='marca');
      await page.locator('[data-ks-reset]').click();
      check('Studio offers a direct project CTA',await studio.locator('a[href="#contato"]').count()>0);

      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.querySelector('[data-badge-swing]')?.disabled);
      check('Reduced motion keeps exactly one static hero representation',await page.locator('[data-portfolio-badges]').evaluate(stage=>{const visible=selector=>{const el=stage.querySelector(selector),style=el&&getComputedStyle(el);return !!style&&style.visibility!=='hidden'&&style.display!=='none'&&Number(style.opacity)>.95;};return visible('.hero-badge-standin')!==visible('.hero-badge-canvas');}));
      await page.locator('[data-ks-mode="layers"]').click();
      await page.waitForFunction(()=>Number(document.querySelector('#estudio-interativo')?.dataset.layers)>.99);
      check('Reduced motion preserves manual studio controls',Number(await studio.getAttribute('data-layers'))>.99);
      await page.screenshot({path:`${output}/studio-reduced-${width}.png`,animations:'disabled'});

      // Never activate a contact destination: inspect rendered links and their
      // encoded briefing only. No external message, email or request is sent.
      await page.locator('#contato').scrollIntoViewIfNeeded();
      const directContacts=await page.locator('#contato a[href^="mailto:"],#contato a[href*="wa.me/"],#contato a[href*="api.whatsapp.com/"]').evaluateAll(links=>links.map(link=>({href:link.href,text:link.textContent.trim()})));
      check('Contact has a real email or WhatsApp destination',directContacts.some(link=>/mailto:[^?]+@|wa\.me\/\d{10,}|api\.whatsapp\.com/.test(link.href)),directContacts);
      check('Contact links have descriptive accessible text',directContacts.every(link=>link.text.length>3));
      const service=page.locator('#service');
      await page.locator('#brief').fill('Projeto de marca para apresentar uma nova experiência digital. QA local, sem envio.');
      check('Briefing fields retain the visitor’s context',(await page.locator('#brief').inputValue()).includes('experiência digital')&&(await service.inputValue()).length>0);
      check('Contact configuration enables the real destination',await page.locator('#brief-form').getAttribute('data-contact-ready')==='true');
      await page.locator('#brief-form button[type="submit"]').click();
      const prepared=await page.evaluate(()=>window.__qaOpened.at(-1));
      const preparedUrl=prepared&&new URL(prepared.url);
      check('Submit prepares the configured WhatsApp conversation without sending',preparedUrl?.origin==='https://wa.me'&&preparedUrl.pathname==='/5511985568208'&&prepared.target==='_blank'&&prepared.features.includes('noopener'));
      const message=preparedUrl.searchParams.get('text')||'';
      check('Prepared message includes selected work and the visitor’s briefing',message.includes(await service.inputValue())&&message.includes('experiência digital')&&message.includes('Referência do portfólio:'));
      const alternativeService=await service.evaluate(select=>[...select.options].find(option=>option.value&&option.value!==select.value)?.value);
      await service.selectOption(alternativeService);
      await page.locator('#brief-form button[type="submit"]').click();
      const changedMessage=await page.evaluate(()=>new URL(window.__qaOpened.at(-1).url).searchParams.get('text'));
      check('Changing the project type clears stale case attribution',!(await page.locator('#brief-context').isVisible())&&!changedMessage.includes('Referência do portfólio:')&&changedMessage.includes(await service.inputValue()));
      const status=await page.locator('#form-status').innerText();
      check('Status explains review and visitor-controlled sending',/revise/i.test(status)&&/envi/i.test(status)&&!/enviad[ao] com sucesso/i.test(status));
      const email=await page.evaluate(()=>window.PORTFOLIO_CONTACT.createContactHref({...window.PORTFOLIO_PROFILE,preferredChannel:'email'},'Teste de revisão, sem envio.').href);
      const emailUrl=new URL(email);
      check('Email alternative prepares the verified address and encoded body',emailUrl.protocol==='mailto:'&&decodeURIComponent(emailUrl.pathname)==='smillepls@gmail.com'&&emailUrl.searchParams.get('body')==='Teste de revisão, sem envio.');
      const tracking=await page.evaluate(()=>window.__qaInteractions);
      check('Conversion events exclude the visitor’s briefing and contact address',tracking.some(item=>item.event==='portfolio_contact_click')&&!JSON.stringify(tracking).includes('Projeto de marca')&&!JSON.stringify(tracking).includes('5511985568208')&&!JSON.stringify(tracking).includes('smillepls@gmail.com'));
      await page.screenshot({path:`${output}/contact-${width}.png`,animations:'disabled'});

      const targets=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(link=>link.getAttribute('href')).filter((href,index,all)=>href&&href!=='#'&&all.indexOf(href)===index).filter(href=>!document.getElementById(decodeURIComponent(href.slice(1)))));
      check('All local navigation anchors have a destination',targets.length===0,targets);
      const images=await page.locator('.hero-badge-standin img,.work-tile img,.rv-window img').evaluateAll(async items=>Promise.all(items.map(async img=>{img.loading='eager';try{await img.decode();}catch{}return{src:img.getAttribute('src'),decoded:img.naturalWidth>0};})));
      check('Primary visual assets decode locally',images.length>=4&&images.every(img=>img.src.startsWith('/assets/')&&img.decoded),images);
      const overflow=[];
      for(const selector of ['.hero','#trabalhos','#project-paths','#estudio-interativo','#editorial','#laboratorio','#contato']){
        await page.locator(selector).scrollIntoViewIfNeeded();
        const dimensions=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
        if(dimensions.document>dimensions.viewport+2)overflow.push({section:selector,...dimensions});
      }
      check('No horizontal overflow through the complete journey',overflow.length===0,overflow);
      if(width<500)check('Mobile project choices remain reachable without scroll capture',await paths.locator('[data-path-tab]').evaluateAll(tabs=>tabs.every(tab=>{const box=tab.getBoundingClientRect();return box.width>0&&box.left>=0&&box.right<=innerWidth+2;})));
      check('Local resources return successfully',localFailures.length===0,localFailures);
      check('No unhandled JavaScript errors',row.errors.length===0,row.errors);
    }catch(error){
      row.failure=String(error);
      console.error(`[conversion ${width}×${height}] ${row.failure}`);
      await page.screenshot({path:`${output}/failure-${width}.png`,animations:'disabled'}).catch(()=>{});
    }finally{console.log(`[conversion ${width}×${height}] ${row.checks.filter(item=>item.pass).length} checks passed${row.failure?' · failed':''}`);await context.close();}
  }
}finally{
  await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));
  await browser?.close();server?.kill();
}
console.log(JSON.stringify(report,null,2));
if(report.results.some(row=>row.failure))throw new Error(`Conversion audit failed; inspect ${output}/results.json`);
