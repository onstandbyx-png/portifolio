import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const port=process.env.PORT||'4188';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
let browser;
const report=[];
try{
 for(let attempt=0;attempt<60;attempt++){
  try{if((await fetch(base+'/health')).ok)break;}catch{}
  await new Promise(resolve=>setTimeout(resolve,150));
 }
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [width,height] of [[1440,900],[390,748],[320,640]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:'reduce'});
  const page=await context.newPage();
  const archivedRequests=[],errors=[],checks=[];
  page.on('request',request=>{if(request.url().includes('/assets/kinetic-pass/'))archivedRequests.push(request.url());});
  page.on('pageerror',error=>errors.push(String(error)));
  const check=(label,result)=>{checks.push({label,pass:!!result});assert(result,label);};
  const row={width,height,checks,archivedRequests,errors};report.push(row);
  try{
   await page.goto(base+'/#estudio-interativo',{waitUntil:'networkidle'});
   await page.waitForSelector('html[data-rx-showcase="ready"]',{state:'attached'});
   check('Old hash does not mount the studio',await page.locator('#estudio-interativo,.ks-section').count()===0);
   check('No public link targets the hidden studio',await page.locator('a[href*="#estudio-interativo"]').count()===0);
   check('Hero and all four work categories remain',await page.locator('[data-portfolio-badges]').count()===1&&await page.locator('[data-work-card]').count()===4);
   await page.locator('[data-case="video"]').click();
   const link=page.locator('#case-dialog .case-explore[href="#narrativa-visual"]');
   check('Fourth case points to the active composition',await link.count()>0);
   await link.click();
   check('Composition opens and the dialog closes',await page.locator('#narrativa-visual').isVisible()&&!await page.locator('#case-dialog').evaluate(dialog=>dialog.open));
   check('No archived scripts, styles or video are requested',archivedRequests.length===0);
   check('No page errors',errors.length===0);
  }catch(error){row.failure=String(error);throw error;}
  finally{await context.close();}
 }
}finally{
 await mkdir('qa/hidden-studio',{recursive:true});
 await writeFile('qa/hidden-studio/results.json',JSON.stringify(report,null,2));
 await browser?.close();server?.kill();
}
console.log(JSON.stringify(report,null,2));
