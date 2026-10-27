import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

// Campaign section: the channel tiles, the paper peel and the placement behind it with its live panel.
// The hero, the gallery and the film have their own tests. Runs against BASE_URL or spawns server.mjs on PORT.
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
    // Screenshots are evidence, not checks: a slow software-GL frame must not fail the run.
    const capture=async(name)=>page.screenshot({path:`${output}/${name}-${width}${reduced?'-reduced':''}.png`,animations:'disabled',timeout:8000}).catch(()=>{});
    page.on('pageerror',error=>row.errors.push(String(error)));
    page.on('response',response=>{if(response.status()>=400)row.failedRequests.push({status:response.status(),url:response.url()});});
    page.on('request',request=>{if(!['GET','HEAD','OPTIONS'].includes(request.method()))row.mutations.push({method:request.method(),url:request.url()});});
    await page.addInitScript(()=>{
      window.__presentationAnimations=[];const animate=Element.prototype.animate;
      Element.prototype.animate=function(...args){const animation=animate.apply(this,args);if(this.matches('.sp-campaign-panel figure'))window.__presentationAnimations.push({kind:'campaign',frames:animation.effect.getKeyframes()});return animation;};
    });
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      // O laboratório monta perto da tela (static-init.js).
      await page.evaluate(()=>document.querySelector('#laboratorio').scrollIntoView({behavior:'instant'}));
      await page.waitForSelector('html[data-static-presentations="ready"]',{state:'attached'});
      await page.waitForSelector('#laboratorio .cx-player',{state:'attached'});
      await page.evaluate(()=>document.fonts.ready);
      // The header hides on scroll down (nav.js), so the global pause is pressed through the DOM, as a keyboard user would.
      const toggleMotion=()=>page.locator('#motion-toggle').evaluate(button=>button.click());

      const tabs=page.locator('#laboratorio [data-sp-tab]');
      const channelIds=['instagram','facebook','tiktok','youtube','linkedin','google','seo','chatgpt','maps','whatsapp','telegram','rcs','voz','pix','email','blog'];
      const glyphIds=['rcs','voz','pix','email','blog'];
      check('The sixteen campaign channels are selectable tiles named with their group and number of formats',JSON.stringify(await tabs.evaluateAll(items=>items.map(tab=>tab.dataset.spTab)))===JSON.stringify(channelIds)&&await tabs.evaluateAll(items=>items.every(tab=>{const r=tab.getBoundingClientRect();return tab.getAttribute('role')==='tab'&&r.width>=44&&r.height>=44&&/, (Redes sociais|Busca e IA|Local e conversa|Conteúdo|Pagamento e retenção), \d+ formatos?$/.test(tab.getAttribute('aria-label')||'');})));
      check('Channels with an official file show its mark; the others a filled badge in the colour of their group',await tabs.evaluateAll((items,glyphIds)=>items.every(tab=>glyphIds.includes(tab.dataset.spTab)?!tab.querySelector('svg.ch-logo,img')&&Boolean(tab.querySelector('.sp-selo svg.sp-platform-logo--doc'))&&getComputedStyle(tab.querySelector('.sp-selo')).backgroundColor!=='rgba(0, 0, 0, 0)':Boolean(tab.querySelector('svg.ch-logo'))&&!tab.querySelector('img')),glyphIds));
      check('Format counters are at least 12px and the names 12.5px',await page.locator('#laboratorio .sp-platforms').evaluate(list=>[...list.querySelectorAll('.sp-tab-count')].every(c=>parseFloat(getComputedStyle(c).fontSize)>=12&&c.getBoundingClientRect().width>=20)&&[...list.querySelectorAll('.sp-tab-name')].every(n=>parseFloat(getComputedStyle(n).fontSize)>=12.5)));
      check('Every channel tile is visible at once, without scrolling or widening the page',await page.locator('#laboratorio .sp-platforms').evaluate(list=>{const b=list.getBoundingClientRect();return list.scrollWidth<=list.clientWidth+1&&[...list.querySelectorAll('[role="tab"]')].every(tab=>{const r=tab.getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1&&tab.querySelector('.sp-tab-name').scrollWidth<=tab.querySelector('.sp-tab-name').clientWidth+1;})&&b.right<=innerWidth+1&&document.documentElement.scrollWidth<=innerWidth+2;}));
      const markerOnTab=()=>page.locator('#laboratorio .sp-platforms').evaluate(list=>{const tab=list.querySelector('[aria-selected="true"]'),marker=list.querySelector('.sp-tab-marker');const a=tab.getBoundingClientRect(),b=list.getBoundingClientRect(),m=getComputedStyle(marker).transform;const x=new DOMMatrixReadOnly(m==='none'?undefined:m).m41;return Math.abs(x-(a.left-b.left+list.scrollLeft))<2&&Math.abs(parseFloat(marker.style.width)-a.width)<2&&a.left>=b.left-1&&a.right<=b.right+1;});
      await page.locator('#laboratorio .sp-platforms').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-90,behavior:'instant'}));
      for(let index=0;index<channelIds.length;index++){
        const beforeMotion=await page.evaluate(()=>window.__presentationAnimations.length);
        await tabs.nth(index).click();
        const panelId=await tabs.nth(index).getAttribute('aria-controls'),panel=page.locator(`#${panelId}`);
        if(index>0)check(`Campaign ${index+1}: outer transition respects the motion preference`,await page.evaluate(({beforeMotion,reduced})=>{const after=window.__presentationAnimations.length;return reduced?after===beforeMotion:after>beforeMotion;},{beforeMotion,reduced}));
        check(`Campaign ${index+1}: selection exposes exactly its labelled panel`,await tabs.nth(index).getAttribute('aria-selected')==='true'&&await panel.isVisible()&&await panel.getAttribute('aria-labelledby')===await tabs.nth(index).getAttribute('id')&&await page.locator('.sp-campaign-panel:not([hidden])').count()===1);
        await page.waitForFunction(()=>!document.querySelector('#laboratorio .sp-campaign').dataset.transitioning);
        await panel.locator('img').evaluate(img=>img.decode());
        check(`Campaign ${index+1}: the local artwork is decoded, lazy and contained`,await panel.locator('img').evaluate(img=>{const r=img.getBoundingClientRect();return img.naturalWidth>0&&img.getAttribute('src').startsWith('/assets/')&&img.alt.trim().length>12&&img.loading==='lazy'&&r.width>0&&r.left>=-1&&r.right<=innerWidth+1;}));
        await page.waitForTimeout(reduced?30:560);
        check(`Campaign ${index+1}: the sliding marker sits under the selected tab`,await markerOnTab());
        if(index<2||index===channelIds.length-1)await capture(`campaign-${index}`);
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

      // The sheet stays in its plane: pulling the corner peels the photo away and shows the ad in its channel.
      const campaignCard=page.locator('#laboratorio .sp-campaign-card');
      await campaignCard.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-118,behavior:'instant'}));
      await page.waitForTimeout(180);
      check('Campaign starts with its artwork and a visible pull corner',await campaignCard.getAttribute('data-side')==='front'&&await campaignCard.locator('[data-peel-grip]').count()===1&&await campaignCard.locator('.sp-peel-fold').count()===1);
      const grip=campaignCard.locator('[data-peel-grip]');
      const gripBox=await grip.boundingBox();
      check('The folded tip is actually hittable and not covered by the header',await page.evaluate(({x,y})=>Boolean(document.elementFromPoint(x,y)?.closest('[data-peel-grip]')),{x:gripBox.x+gripBox.width*.55,y:gripBox.y+gripBox.height*.46}));
      if(width<500){
        const session=await page.context().newCDPSession(page);
        try{
          const sx=gripBox.x+gripBox.width*.55,sy=gripBox.y+gripBox.height*.46;
          await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y:sy,id:1}]});
          for(let step=1;step<=12;step++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx-step*14,y:sy+step*14,id:1}]});await page.waitForTimeout(22);}
          check('Pulling the corner progressively exposes more of the layer behind',Number(await campaignCard.getAttribute('data-peel-progress'))>.24);
          await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        }finally{await session.detach();}
      }else{
        await page.mouse.move(gripBox.x+gripBox.width*.55,gripBox.y+gripBox.height*.46);
        await page.mouse.down();
        await page.mouse.move(gripBox.x-230,gripBox.y+295,{steps:18});
        check('Desktop drag visibly moves the paper corner',Number(await campaignCard.getAttribute('data-peel-progress'))>.24);
        await page.mouse.up();
      }
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='open');
      check('Pulling reveals what is behind without rotating the card',await campaignCard.getAttribute('data-side')==='back'&&await campaignCard.locator('[data-sp-card-back]').getAttribute('aria-hidden')==='false'&&Number(await campaignCard.getAttribute('data-peel-progress'))>.99);
      const side=page.locator('#laboratorio .cx-side');
      check('Behind the paper: the channel placement in the orange iPhone; beside it the live panel with label, client and journey',
        await page.locator('#laboratorio .cx-player').getAttribute('data-platform')===await page.locator('.sp-campaign').getAttribute('data-channel')&&
        /Patrocinado|Anúncio/.test(await campaignCard.locator('[data-cx-stage]').innerText())&&
        await campaignCard.locator('[data-cx-stage] .ch-iphone[data-cor="laranja"]').count()===1&&
        await page.locator('#laboratorio .cx-brand svg.ch-logo').count()===1&&
        await side.getAttribute('data-mode')==='live'&&
        /Anúncio|Patrocinado/.test(await side.locator('.cx-label').innerText())&&
        /marca fictícia/.test(await side.locator('.cx-side-cliente').innerText())&&
        await side.locator('[data-cx-journey] li').count()===3&&
        await side.locator('[data-cx-journey] [aria-current="step"]').count()===1&&
        /\S/.test(await side.locator('[data-cx-box="tela"] p').innerText())&&
        !/smiile/i.test(await page.locator('#laboratorio .cx-player').innerText()));
      const labels={tiktok:/Patrocinado/,linkedin:/Promovido/,chatgpt:/Anúncio|Patrocinado/,maps:/Patrocinado/,blog:/Conteúdo patrocinado por Valore Patrimônio|Publicidade/i,seo:/atlantica(incorporadora)?\.exemplo/};
      for(const [id,label] of Object.entries(labels)){
        await page.locator('#tab-'+id).click();
        await page.waitForFunction(id=>document.querySelector('#laboratorio .cx-player')?.dataset.platform===id,id);
        check(`Switching to ${id} keeps the peel open and updates what is behind`,await campaignCard.getAttribute('data-side')==='back'&&label.test(await campaignCard.locator('[data-cx-stage]').first().innerText()));
      }
      check('The organic result is not labelled as an ad',!/Patrocinado/.test(await campaignCard.locator('.cm-g-result--organic').innerText()));
      await page.locator('#tab-tiktok').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .cx-player')?.dataset.platform==='tiktok');
      await campaignCard.locator('[data-cx-body] .cx-stage').scrollIntoViewIfNeeded();
      const screenFrame=()=>campaignCard.locator('[data-cx-body] .cm-screen').getAttribute('data-frame');
      const lastFrame=String(Number(await campaignCard.locator('[data-cx-body] .cx-stage').getAttribute('data-frames'))-1);
      if(reduced){
        check('Reduced motion never autoplays the journey and offers the next frame',await screenFrame()==='0'&&await side.locator('[data-cx-step="0"]').getAttribute('aria-current')==='step'&&/Próximo/.test(await page.locator('#laboratorio [data-cx-play]').innerText()));
        await page.locator('#laboratorio [data-cx-play]').click();
        check('Without motion the journey advances one frame on request',await screenFrame()==='1');
        await side.locator('[data-cx-step="2"]').click();
        await page.waitForTimeout(120);
        check('Choosing the conversion step shows the tap on the CTA as a static mark',await side.locator('[data-cx-step="2"]').getAttribute('aria-current')==='step'&&await campaignCard.locator('[data-cx-body] .cx-tap.is-static:not([hidden])').count()===1&&Boolean(await campaignCard.locator('[data-cx-body] .cm-screen').getAttribute('data-tap')));
      }else{
        await page.waitForFunction(last=>document.querySelector('#laboratorio [data-cx-body] .cm-screen')?.dataset.frame===last&&document.querySelector('#laboratorio [data-cx-play]').getAttribute('aria-pressed')==='false',lastFrame,{timeout:150000});
        await page.waitForTimeout(700);
        check('The journey plays once to the native conversion screen and stops there with a replay control',await screenFrame()===lastFrame&&/(^| )done( |$)/.test(await campaignCard.locator('[data-cx-body] .cm-screen').getAttribute('data-state'))&&await side.locator('[data-cx-journey] li[data-state="done"]').count()===3&&/Rever/.test(await page.locator('#laboratorio [data-cx-play]').innerText()));
      }
      await page.locator('#tab-instagram').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .cx-player')?.dataset.platform==='instagram');
      const back=campaignCard.locator('[data-sp-card-turn="back"]');
      check('Ver a peça is visible, at least 44 x 44',await back.isVisible()&&await back.evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44&&/Ver a peça/.test(el.textContent);}));
      await back.click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='closed');
      check('The return control restores the artwork after peeling',await campaignCard.getAttribute('data-side')==='front'&&Number(await campaignCard.getAttribute('data-peel-progress'))<.06);
      await campaignCard.locator('[data-peel-grip]').click();
      await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card')?.dataset.peelState==='open');
      check('Tapping the folded corner opens it and moves the focus to the first format',await campaignCard.getAttribute('data-side')==='back'&&await page.evaluate(()=>document.activeElement?.matches('.cx-placement')));
      await side.locator('[data-contact-service="Campanhas e anúncios"]').click();
      check('Campaign contact action prefills the exact service without sending',await page.locator('#service').inputValue()==='Campanhas e anúncios'&&row.mutations.length===0);
      await capture('contact');
      check('No horizontal document overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
      check('No broken local resources or JavaScript exceptions',row.failedRequests.length===0&&row.errors.length===0);
    }catch(error){row.failure=String(error);await capture('failure').catch(()=>{});console.error(`[static ${width}${reduced?'/reduced':''}] ${error}`);}
    finally{await context.close();}
    console.log(`[static ${width}${reduced?'/reduced':''}] ${row.checks.filter(item=>item.pass).length} passed${row.failure?', FAILED':''}`);
  }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/${process.env.QA_REPORT||'results.json'}`,JSON.stringify(records,null,2));}
if(records.some(row=>row.failure))throw new Error('Portfolio presentation regression failed; inspect qa/static-presentations/results.json');
