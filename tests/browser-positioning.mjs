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
   await page.waitForSelector('.campaign-summary');await page.waitForSelector('[data-workflow][data-state="example"]');
   check('The first screen states role and five concrete services',/DIRETOR CRIATIVO E REDATOR/.test(await page.locator('.hero-issue').innerText())&&/identidades, conteúdos, anúncios, sites e sistemas/.test(await page.locator('.hero-description').innerText()));
   const order=await page.evaluate(()=>['trabalhos','editorial','laboratorio','narrativa-visual','sistemas','categorias','como-trabalho','contato'].map(id=>({id,top:document.getElementById(id).getBoundingClientRect().top+scrollY})));
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
   // The request form is now the visible starting point (it used to be hidden behind an edit toggle).
   check('The request form is the visible starting point, next to an example result',await page.locator('.workflow-form').isVisible()&&await page.locator('[data-workflow-result]').isVisible()&&await page.evaluate(()=>{const form=document.querySelector('.workflow-form').getBoundingClientRect(),result=document.querySelector('[data-workflow-result]').getBoundingClientRect();return innerWidth<=760?form.top<result.top:form.left<result.left;}));
   await page.locator('[data-workflow-edit]').click();
   const sample='Revisar pedido <b>sem perder contexto</b>';
   await page.locator('#workflow-request').fill(sample);await page.locator('#workflow-area').selectOption('atendimento');await page.locator('#workflow-priority').selectOption('Urgente');
   await page.locator('.workflow-form [type="submit"]').click();
   check('Workflow creates a safely rendered record with chosen route and priority',await page.locator('[data-request-title]').innerText()===sample&&await page.locator('[data-request-title] b').count()===0&&/Atendimento/.test(await page.locator('[data-request-route]').innerText())&&await page.locator('[data-request-priority]').innerText()==='Urgente');
   await page.locator('[data-workflow-complete]').click();check('Workflow changes state',await page.locator('[data-workflow]').getAttribute('data-state')==='completed'&&await page.locator('[data-request-state]').innerText()==='Resolvido');
   await page.locator('#sistemas').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-84,behavior:'instant'}));
   await page.screenshot({path:`${output}/systems-${width}${reduced?'-reduced':''}.png`,animations:'disabled'});
   await page.locator('[data-workflow-reset]').click();check('Workflow can restart',await page.locator('[data-workflow]').getAttribute('data-state')==='example'&&await page.locator('[data-workflow-result]').isVisible());
   await page.locator('#workflow-request').fill('curto');await page.locator('.workflow-form [type="submit"]').click();
   check('A short request shows an inline pt-BR error tied to the field',await page.locator('#workflow-request-error').isVisible()&&/pelo menos 8 caracteres/.test(await page.locator('#workflow-request-error').innerText())&&await page.locator('#workflow-request').getAttribute('aria-invalid')==='true'&&await page.locator('#workflow-request').evaluate(el=>el===document.activeElement&&el.closest('form').noValidate&&el.getAttribute('aria-describedby')==='workflow-request-error'));
   await page.locator('[data-workflow-reset]').click();check('Restart clears the inline error',await page.locator('#workflow-request-error').isHidden()&&await page.locator('#workflow-request').getAttribute('aria-invalid')===null);
   await page.locator('.systems-contact').click();check('Systems example leads to the correct service',await page.locator('#service').inputValue()==='Sistemas e automações');
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
assert(report.length===5&&report.every(row=>!row.failure),'Positioning and workflow regression failed');
