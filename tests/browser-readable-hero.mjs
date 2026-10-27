import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

// The home hero and header follow the smiile Landing Planes port (commit cc19ed2): black full-bleed hero with the
// silk field, a headline readable from the first paint, the offer, two actions and the journey chips, a compact
// dark header whose Trabalhos panel (six examples, featured card per item) works with pointer, keyboard and touch,
// and motion (silk and journey) that stops on pause and with reduced motion.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const {CLIENTES}=await import('../public/assets/showcase/marcas.js');
const output='qa/readable-hero',port=process.env.PORT||'4191';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
await mkdir(output,{recursive:true});
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
const records=[];let browser;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sharp=page=>page.locator('#hero-title .ph-line').evaluateAll(lines=>lines.length===2&&lines.every(line=>{const style=getComputedStyle(line);return style.opacity==='1'&&style.filter==='none'&&(style.transform==='none'||style.transform==='matrix(1, 0, 0, 1, 0, 0)');}));
// A coarse signature of the silk canvas: equal signatures mean no frame was painted in between.
const silk=page=>page.locator('.ph-silk').evaluate(canvas=>{const {data}=canvas.getContext('2d').getImageData(0,0,canvas.width,Math.min(canvas.height,480));let sum=0,painted=0;for(let i=3;i<data.length;i+=4*53){sum=(sum*31+data[i])%1000000007;if(data[i])painted++;}return {sum,painted};});
const box=locator=>locator.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};});
try{
 let healthy=false;for(let i=0;i<60;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await wait(150);}assert(healthy,'Server reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const widths=process.env.QA_WIDTHS?.split(',').map(Number);
 for(const [width,height,touch,reduced] of [[320,740,true,false],[390,844,true,false],[980,820,true,false],[1024,900,false,false],[1440,900,false,false],[390,844,true,true],[1440,900,false,true]].filter(([w])=>!widths||widths.includes(w))){
  const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  const row={width,height,touch,reduced,checks:[],errors:[]};records.push(row);
  const check=(name,pass)=>{row.checks.push({name,pass:Boolean(pass)});assert(pass,name);};
  page.on('pageerror',error=>row.errors.push(String(error)));
  page.on('console',message=>{if(message.type()==='error')row.errors.push(message.text());});
  const suffix=`${width}${reduced?'-reduced':''}`;
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});
   if(reduced)check('Reduced motion shows the headline sharp at load, without entrance animations',await sharp(page)&&await page.locator('#hero-title .ph-line').evaluateAll(lines=>lines.every(line=>line.getAnimations().length===0)));
   else check('The headline enters by moving only, already opaque',await page.locator('#hero-title .ph-line').evaluateAll(lines=>lines.length===2&&lines.every(line=>getComputedStyle(line).opacity==='1')));
   await page.evaluate(()=>document.fonts.ready);
   // Software GL (swiftshader) can stall the first frames for several seconds: allow 20 s.
   await page.waitForFunction(()=>document.querySelector('.planes-hero')?.dataset.entered==='true',null,{timeout:20000});
   check('The headline settles sharp and reads the offer',await sharp(page)&&(await page.locator('#hero-title').innerText()).replace(/\s+/g,' ').trim()==='Do anúncio ao caixa.');
   await page.screenshot({path:`${output}/first-screen-${suffix}.png`,animations:'disabled'});
   const hero=page.locator('.planes-hero');
   const copy=await page.evaluate(()=>{
    const hero=document.querySelector('.planes-hero'),actions=[...hero.querySelectorAll('.ph-actions a')];
    const box=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    return {eyebrow:hero.querySelector('.ph-eyebrow').innerText,mark:!!hero.querySelector('.ph-eyebrow svg.mark'),description:hero.querySelector('.ph-description').innerText,
     actions:actions.map(a=>({hash:a.hash,exists:!!document.getElementById(a.hash.slice(1).split('/')[0]),...box(a),primary:a.classList.contains('ph-primary')})),
     chips:[...hero.querySelectorAll('.ph-chip')].map(b=>b.textContent.trim()),pressed:hero.querySelectorAll('.ph-chip[aria-pressed="true"]').length,
     background:getComputedStyle(hero).backgroundColor,hero:box(hero),title:box(hero.querySelector('#hero-title')),titleFont:parseFloat(getComputedStyle(hero.querySelector('#hero-title')).fontSize),
     silkWidth:hero.querySelector('.ph-silk').clientWidth,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,viewportHeight:innerHeight};
   });
   row.copy=copy;
   check('Hero names Smile N and the offer',/SMILE N · DIREÇÃO CRIATIVA, CAMPANHAS E AUTOMAÇÃO/.test(copy.eyebrow)&&copy.mark&&['Crio a campanha','a conversa','o sistema','atendimento com IA','uma pessoa com o histórico','Pix conferido','de volta no anúncio'].every(term=>copy.description.includes(term)));
   check('Primary action opens a full journey and the secondary the campaigns, both 44px targets',copy.actions.length===2&&copy.actions[0].primary&&copy.actions[0].hash==='#sistemas/agente'&&copy.actions[1].hash==='#laboratorio'&&copy.actions.every(a=>a.exists&&a.height>=44));
   check('Seven chips choose the journey, one pressed',copy.chips.join()==='WhatsApp,Instagram,Voz com IA,RCS,Pix Automático,E-mail,Telegram'&&copy.pressed===1);
   // The hero starts a few pixels above the viewport, under the floating header (margin-top -92px in the original).
   check('Hero is black, full-bleed and fills the first screen',copy.background==='rgb(8, 9, 9)'&&copy.hero.left<=1&&copy.hero.right>=copy.viewport-1&&copy.hero.top<=0&&copy.hero.height>=copy.viewportHeight-1&&copy.silkWidth>=copy.viewport-1);
   check('Headline stays inside the viewport at a large size',copy.title.left>=-1&&copy.title.right<=copy.viewport+1&&copy.titleFont>=(width<=760?40:56)&&copy.title.bottom<=copy.viewportHeight);
   const paint=await silk(page);row.silk=paint;
   check('The silk field is painted',paint.painted>0);
   const header=await page.evaluate(()=>{
    const bar=document.querySelector('#site-header .sn-bar'),brand=bar.querySelector('.sn-brand');const r=bar.getBoundingClientRect();
    return {background:getComputedStyle(bar).backgroundColor,top:r.top,left:r.left,right:r.right,height:r.height,brand:brand.innerText.trim(),mark:!!brand.querySelector('svg.mark'),overflow:bar.scrollWidth<=bar.clientWidth+1,
     desktopNav:getComputedStyle(document.querySelector('.sn-nav-desktop')).display,menu:getComputedStyle(document.querySelector('#menu-toggle')).display,ctaText:document.querySelector('.sn-start').innerText.trim()};
   });
   row.header=header;
   check('The header is a compact dark pill above the hero',header.background==='rgba(12, 12, 12, 0.91)'&&header.height>=50&&header.height<=72&&header.top>=0&&header.left>=0&&header.right<=width&&header.brand==='Smile N'&&header.mark&&header.overflow);
   const panel=page.locator('#sn-panel-trabalhos');
   const panelLinks=()=>page.locator('#sn-panel-trabalhos .sn-link').evaluateAll(links=>links.map(a=>({hash:a.hash,exists:!!document.getElementById(a.hash.slice(1).split('/')[0]),title:a.querySelector('strong').innerText,note:a.querySelector('small').innerText,height:a.getBoundingClientRect().height})));
   const opened=()=>page.waitForFunction(()=>{const p=document.querySelector('#sn-panel-trabalhos');return !p.hidden&&p.classList.contains('is-open')&&getComputedStyle(p).opacity==='1';},null,{timeout:4000});
   const closed=()=>page.waitForFunction(()=>document.querySelector('#sn-panel-trabalhos').hidden,null,{timeout:4000});
   if(width>760){
    check('Desktop keeps the inline navigation and hides the menu button',header.desktopNav==='flex'&&header.menu==='none'&&header.ctaText==='Conversar sobre um projeto');
    const trigger=page.locator('.sn-nav-desktop [data-sn-trigger]');
    await trigger.click();await opened();
    const links=await panelLinks();row.panel=links;
    check('The Trabalhos panel lists six examples with existing targets',links.map(l=>l.hash).join()==='#laboratorio,#editorial,#sistemas/agente,#sistemas/voz,#sistemas/pix,#sistemas/instagram'&&links.every(l=>l.exists&&l.height>=44&&l.title&&l.note)&&await trigger.getAttribute('aria-expanded')==='true');
    check('The featured tile starts on the WhatsApp journey',await page.locator('#sn-panel-trabalhos .sn-featured').getAttribute('href')==='#sistemas/agente');
    await wait(350);
    row.liquidReady=await page.locator('#sn-panel-trabalhos .sn-liquid').getAttribute('data-ready');
    check('The liquid tile paints with WebGL or keeps the gradient fallback',row.liquidReady==='true'||await page.locator('#sn-panel-trabalhos .sn-featured').evaluate(el=>getComputedStyle(el).backgroundImage.includes('radial-gradient')));
    await page.locator('#sn-panel-trabalhos .sn-link[href="#sistemas/voz"]').hover();await wait(80);
    const feature=await page.locator('#sn-panel-trabalhos .sn-featured').evaluate(el=>({href:el.getAttribute('href'),title:el.querySelector('[data-sn-title]').textContent,dark:el.style.getPropertyValue('--sn-dark').trim()}));
    check('The featured card follows the hovered item, with the brand from marcas.js and the Smile N palette',feature.href==='#sistemas/voz'&&feature.title.startsWith(CLIENTES.clinica.marca+':')&&feature.dark==='rgb(15 42 32)');
    await page.locator('#sn-panel-trabalhos .sn-link[href="#laboratorio"]').hover();await wait(80);
    check('Campaigns light the featured card in copper',await page.locator('#sn-panel-trabalhos .sn-featured').evaluate(el=>el.style.getPropertyValue('--sn-light').trim()==='rgb(200 116 62)'&&el.getAttribute('href')==='#laboratorio'));
    await page.screenshot({path:`${output}/panel-${suffix}.png`,animations:'disabled',clip:{x:0,y:0,width,height:Math.min(height,560)}});
    await page.keyboard.press('Escape');await closed();
    check('Escape closes the panel and returns focus to its trigger',await trigger.evaluate(el=>el===document.activeElement&&el.getAttribute('aria-expanded')==='false'));
    await page.keyboard.press('ArrowDown');await opened();
    check('ArrowDown opens the panel on its first link',await page.locator('#sn-panel-trabalhos .sn-link').first().evaluate(el=>el===document.activeElement));
    await page.mouse.click(width/2,height-20);await closed();
    check('A pointer outside the header closes the panel',await panel.evaluate(el=>el.hidden));
    if(!touch){
     await page.evaluate(()=>document.activeElement?.blur());
     await trigger.hover();await wait(200);await opened();
     check('Hover opens the panel after the intent delay',await panel.evaluate(el=>!el.hidden));
     await page.mouse.move(width/2,height-20);await wait(400);
     check('Leaving the header closes a hover-opened panel',await panel.evaluate(el=>el.hidden));
    }
   }else{
    check('Mobile shows the menu button, hides the inline navigation and shortens the bar action',header.desktopNav==='none'&&header.menu!=='none'&&header.ctaText==='Conversar');
    await page.locator('#menu-toggle').click();
    check('The menu opens with the dropdown trigger inside it',await page.locator('#menu-toggle').getAttribute('aria-expanded')==='true'&&await page.locator('#mobile-nav').isVisible()&&await page.locator('#mobile-nav [data-sn-trigger]').isVisible());
    await page.locator('#mobile-nav [data-sn-trigger]').click();await opened();
    const links=await panelLinks();row.panel=links;
    check('The panel renders inline under its trigger with the six destinations',await panel.evaluate(el=>!!el.closest('#mobile-nav')&&el.previousElementSibling?.matches('[data-sn-trigger]'))&&links.map(l=>l.hash).join()==='#laboratorio,#editorial,#sistemas/agente,#sistemas/voz,#sistemas/pix,#sistemas/instagram'&&links.every(l=>l.exists&&l.height>=44));
    check('The open menu ends with the contact action',await page.locator('#mobile-nav .mobile-nav-cta').evaluate(el=>el.hash==='#contato'&&el.getBoundingClientRect().height>=44));
    await page.screenshot({path:`${output}/mobile-menu-${suffix}.png`,animations:'disabled'});
    check('Nothing overflows horizontally with the menu open',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.keyboard.press('Escape');await closed();
    check('Escape closes the panel and the menu, returning focus to the menu button',await page.locator('#menu-toggle').evaluate(el=>el.getAttribute('aria-expanded')==='false'&&el===document.activeElement));
   }
   if(!reduced){
    await page.locator('#motion-toggle').click();
    check('The pause control marks the page as paused',await page.evaluate(()=>document.body.classList.contains('is-paused')&&document.querySelector('#motion-toggle').getAttribute('aria-pressed')==='true'));
    const before=await silk(page);const beat=await page.evaluate(()=>document.querySelector('.ph-journey').dataset.beat);await wait(1800);const after=await silk(page);
    check('Paused, the silk field keeps one still frame and the journey stays on its beat',before.sum===after.sum&&beat===await page.evaluate(()=>document.querySelector('.ph-journey').dataset.beat));
    await page.locator('#motion-toggle').click();
    // Headless software rendering can run a handful of frames per second: allow up to 3 s for a new frame.
    let moved=false;for(let i=0;i<15&&!moved;i++){await wait(200);moved=(await silk(page)).sum!==after.sum;}
    check('Resumed, the silk field moves again',moved&&await sharp(page));
   }else{
    const before=await silk(page);await wait(400);
    check('Reduced motion keeps the silk field still and disables the pause control',before.sum===(await silk(page)).sum&&await page.locator('#motion-toggle').getAttribute('aria-disabled')==='true');
   }
   check('Document has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   check('No uncaught JavaScript or console errors',row.errors.length===0);
  }catch(error){row.failure=String(error);await page.screenshot({path:`${output}/failure-${suffix}.png`}).catch(()=>{});console.error(`[readable hero ${suffix}] ${error}`);}
  finally{await context.close();}
  console.log(`[readable hero ${suffix}] ${row.checks.filter(c=>c.pass).length} passed${row.failure?', FAILED':''}`);
 }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/${process.env.QA_REPORT||'results.json'}`,JSON.stringify(records,null,2));}
if(records.some(row=>row.failure))throw new Error('Readable hero regression failed; inspect qa/readable-hero/results.json');
