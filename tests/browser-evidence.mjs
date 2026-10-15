import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(process.env.QA_PACKAGE||'/tmp/portfolio-qa/package.json');
const {chromium}=require('playwright');
const base=process.env.BASE_URL||process.env.QA_URL||'http://127.0.0.1:4173';
const server=(process.env.BASE_URL||process.env.QA_URL)?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4173'},stdio:'inherit'});
for(let i=0;i<65;i++){try{if((await fetch(base+'/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,200));}
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
await mkdir('qa/evidence',{recursive:true});const records=[];
try{
 for(const [width,height] of [[1440,900],[390,844],[320,740]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,deviceScaleFactor:1});const page=await context.newPage();page.setDefaultTimeout(13000);
 const report={width,height,checks:[],errors:[]};records.push(report);
 page.on('pageerror',e=>report.errors.push(String(e)));
 const pass=(name,value)=>{report.checks.push({name,pass:!!value});assert(value,name)};
 try{
 await page.route('https://midia-kit-production-c234.up.railway.app/**',r=>r.abort());
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('html.sm-sections-ready',{timeout:10000});await page.waitForSelector('html[data-rx-showcase="ready"]',{timeout:10000});
 pass('No obsolete product or CI visible',!/(?:\bLINHA\b|final_final|SOTA CI)/i.test(await page.locator('main').innerText()));
 pass('Four direct visual work cards',await page.locator('#trabalhos .work-evidence-gallery>.work-tile').count()===4);
 pass('The Fatos hero badge preserved',await page.locator('[data-portfolio-badges]').count()===1);
 pass('No fixed mobile CTA',await page.locator('.mobile-project-cta').count()===0);
 const art=await page.locator('.work-evidence-gallery .tile-art>img').evaluateAll(async images=>Promise.all(images.map(async i=>{i.loading='eager';try{await i.decode();return i.naturalWidth>0}catch{return false}})));
 pass('Original photographic assets load',art.length===4&&art.every(Boolean));await page.locator('#trabalhos .work-fatos').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-115,behavior:'instant'}));
 await page.waitForTimeout(700);
 const rect=await page.locator('#trabalhos .work-fatos').evaluate(el=>{const img=el.querySelector('.tile-art img'),r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,opacity:Number(getComputedStyle(el).opacity),naturalWidth:img?.naturalWidth||0}});
 pass('First work card is painted inside the viewport',rect.naturalWidth>0&&rect.opacity>.9&&rect.top<height-70&&rect.bottom>140);
 await page.screenshot({path:'qa/evidence/work-'+width+'.png'});
 await page.locator('#trabalhos .work-fatos .sm-work-stage').screenshot({path:'qa/evidence/work-tile-'+width+'.png'});
 await page.locator('.work-fatos [data-case]').click();await page.waitForTimeout(180);
 pass('Fatos case opens with image',await page.locator('#case-dialog').evaluate(d=>d.open)&&await page.locator('#dialog-image img').count()===1);
 await page.locator('#dialog-close').click();await page.waitForFunction(()=>!document.querySelector('#case-dialog').open,null,{timeout:4500});
 pass('Case closes with focus restored',!(await page.locator('#case-dialog').evaluate(d=>d.open)));
 await page.locator('.editorial-step').nth(1).click();await page.waitForTimeout(250);
 pass('Editorial device changes real scenes',await page.locator('[data-pf-count]').innerText()==='02 / 03'&&(await page.locator('.pf-story-image').getAttribute('src')).endsWith('cena-negocios.webp'));
 pass('Editorial uses same metallic device',await page.locator('#editorial .pf-reference-device .df-metal').count()===1);
 await page.locator('#editorial').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/evidence/editorial-'+width+'.png'});
 await page.locator('#narrativa-visual [data-rx-film-to="1"]').click();await page.waitForTimeout(150);
 pass('New scroll film changes to a smiile asset',await page.locator('#narrativa-visual').getAttribute('data-phase')==='1'&&await page.locator('.pf-film-device .df-metal').count()===1);
 await page.locator('#narrativa-visual').scrollIntoViewIfNeeded();await page.screenshot({path:'qa/evidence/film-'+width+'.png'});
 await page.locator('#laboratorio [data-ad-tab="meta"]').click();await page.waitForTimeout(250);
 pass('Social mock uses a metallic device',await page.locator('#panel-meta .pf-social-device .df-metal').count()===1);
 await page.locator('[data-rx-social-next]').click();pass('Social slide advances',await page.locator('.rx-ig-count').innerText()==='2/3');
 await page.locator('[data-rx-social="2"]').click();pass('Third slide selectable',await page.locator('.rx-ig-count').innerText()==='3/3');
 await page.screenshot({path:'qa/evidence/social-'+width+'.png'});
 await page.locator('#laboratorio [data-ad-tab="tiktok"]').click();await page.waitForTimeout(120);
 await page.locator('[data-frame="2"]').click();pass('Video story has navigable frames',await page.locator('.vertical-video').getAttribute('data-frame')==='2');
 await page.locator('#laboratorio [data-ad-tab="google"]').click();pass('Google search specimen selectable',await page.locator('#tab-google').getAttribute('aria-selected')==='true');
 await page.locator('#sistemas [data-system-step="3"]').click();pass('App demonstration reaches result',await page.locator('[data-app-stage]').innerText()!=='01 / IDEIA');
 await page.locator('#categorias [data-path-tab="demand"]').click();pass('Business project path switches',await page.locator('#project-paths').getAttribute('data-active-path')==='demand');
 await page.locator('#brief').fill('Gostaria de discutir um site e aplicativo. QA local.');
 pass('Briefing remains local',await page.locator('.sm-brief-summary p').innerText()==='Gostaria de discutir um site e aplicativo. QA local.');
 await page.locator('#colecao summary').click();await page.waitForTimeout(200);
 pass('Optional baralho available',await page.locator('.rx-deck-card').count()===4);
 await page.locator('#colecao [data-rx-next]').click();pass('Baralho advances',await page.locator('#colecao .rx-deck-counter').innerText()==='2 de 4');
 await page.locator('#colecao .rx-deck-card[data-pos="0"] [data-rx-flip]').click();pass('Card flips',await page.locator('#colecao .rx-deck-card[data-pos="0"]').evaluate(e=>e.classList.contains('is-flipped')));
 pass('No horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 await page.emulateMedia({reducedMotion:'reduce'});pass('Reduced motion still retains controls',await page.locator('[data-rx-social-next]').count()===1);
 pass('No JS uncaught errors',report.errors.length===0);
 }catch(e){report.failure=String(e);await page.screenshot({path:'qa/evidence/failure-'+width+'.png'}).catch(()=>{});await writeFile('qa/evidence/failure-'+width+'.html',await page.content()).catch(()=>{});}
 finally{await context.close();}
 }
}finally{await browser.close();server?.kill();await writeFile('qa/evidence/results.json',JSON.stringify(records,null,2))}
console.log(JSON.stringify(records.map(r=>({width:r.width,pass:r.checks.filter(c=>c.pass).length,failure:r.failure}))));
if(records.some(r=>r.failure))throw new Error('Visual-evidence browser checks failed');
