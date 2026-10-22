import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/positioning';await mkdir(output,{recursive:true});
const base=(process.env.BASE_URL||'http://127.0.0.1:4199').replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4199'},stdio:'ignore'});
const services=['Identidade visual','Conteúdo e redação','Campanhas e anúncios','Sites e landing pages','Sistemas e automações'];
let browser;const report=[];
try{
 let up=false;for(let i=0;i<60;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert(up,'app is reachable');
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height,reduced] of [[320,740,false],[390,844,false],[768,1024,false],[1440,900,false],[390,844,true]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<800,isMobile:width<800,reducedMotion:reduced?'reduce':'no-preference'});
  page.setDefaultTimeout(12000);
  const row={width,height,reduced,checks:[],errors:[],writes:[]};report.push(row);
  page.on('pageerror',e=>row.errors.push(String(e)));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))row.writes.push(r.url())});
  const check=(name,pass)=>{row.checks.push({name,pass:!!pass});assert(pass,name)};
  try{
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
   await page.waitForSelector('.campaign-summary');await page.waitForSelector('[data-vitrine="automacao"] .cm-screen');
   check('The first screen states role and five concrete services',/DIRETOR CRIATIVO E REDATOR/.test(await page.locator('.hero-issue').innerText())&&/identidades, conteúdos, anúncios, sites e sistemas/.test(await page.locator('.hero-description').innerText()));
   const order=await page.evaluate(()=>['laboratorio','editorial','sistemas','categorias','como-trabalho','contato'].map(id=>({id,top:document.getElementById(id).getBoundingClientRect().top+scrollY})));
   row.sectionOrder=order;
   check('Visual demonstrations precede the detailed service catalogue',order.every((item,i)=>i===0||item.top>order[i-1].top));
   const copy=await page.locator('.path-summary-copy>strong').allTextContents();check('Five consistent service labels',JSON.stringify(copy)===JSON.stringify(services));
   check('Benefits and scope are available before opening details',await page.locator('.path-summary-copy').evaluateAll(nodes=>nodes.length===5&&nodes.every(n=>n.querySelector('span').getBoundingClientRect().height>0&&n.querySelector('small').getBoundingClientRect().height>0)));
   for(let i=0;i<services.length;i++){
    const scope=page.locator('.path-scope').nth(i);await scope.locator('summary').click();await scope.locator('.path-contact').click();
    check(`Contact retains ${services[i]}`,await page.locator('#service').inputValue()===services[i]);
    await scope.evaluate(e=>e.open=false);
   }
   check('Essential internal links have destinations',await page.locator('.main-nav a,.path-proof,.path-contact').evaluateAll(nodes=>nodes.every(n=>!n.hash||document.getElementById(n.hash.slice(1)))));
   await page.locator('#categorias').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));
   await page.screenshot({path:`${output}/solutions-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   await page.locator('[data-sp-tab="google"]').click();
   check('Campaign benefit is visible without peeling',await page.locator('[data-campaign-benefit]').innerText()==='Responder a quem já procura.'&&await page.locator('.sp-peel-card').getAttribute('data-side')==='front');
   await page.locator('.campaign-decision').click();await page.waitForFunction(()=>document.querySelector('.sp-peel-card').dataset.peelState==='open');
   check('Explicit creative decision control opens the retained peel',await page.locator('.campaign-decision').getAttribute('aria-expanded')==='true');
   await page.locator('.campaign-decision').click();await page.waitForFunction(()=>document.querySelector('.sp-peel-card').dataset.peelState==='closed');
   await page.locator('#laboratorio').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));
   await page.screenshot({path:`${output}/campaign-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   check('Automation demo mounts the lab flow in its own phone, with three steps',await page.locator('[data-vitrine="automacao"] .cm-screen').count()===1&&await page.locator('[data-vitrine="automacao"] [data-vitrine-step]').count()===3);
   check('Store demo mounts the lab flow in its own phone, with three steps',await page.locator('[data-vitrine="loja"] .cm-screen').count()===1&&await page.locator('[data-vitrine="loja"] [data-vitrine-step]').count()===3);
   await page.locator('#sistemas').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));
   await page.screenshot({path:`${output}/systems-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   await page.locator('#sistemas .systems-contact').click();check('Systems example leads to the correct service',await page.locator('#service').inputValue()==='Sistemas e automações');
   await page.locator('#como-trabalho').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));
   await page.screenshot({path:`${output}/method-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   await page.locator('#contato').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));
   await page.screenshot({path:`${output}/contact-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   check('No horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   check('No runtime errors or external writes',row.errors.length===0&&row.writes.length===0);
  }catch(error){row.failure=String(error);await page.screenshot({path:`${output}/failure-${width}${reduced?'-reduced':''}.png`}).catch(()=>{});}
  console.log(JSON.stringify(row));await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base);
 assert.equal(await nojs.locator('.path-scope').count(),5);await nojs.locator('.path-scope summary').first().click();assert(await nojs.locator('.path-description').first().isVisible());assert(await nojs.locator('#sistemas').isVisible());await nojs.close();
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
assert(report.length===5&&report.every(row=>!row.failure),'Positioning and demonstration regression failed');
