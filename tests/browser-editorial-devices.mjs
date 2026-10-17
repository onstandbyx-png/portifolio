import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/editorial-devices';await mkdir(output,{recursive:true});
const base=process.env.BASE_URL||'http://127.0.0.1:4192';
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4192'},stdio:'ignore'});
let browser;const report=[];
try {
 for(let i=0;i<70;i++){try{if((await fetch(base+'/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,150));}
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#editorial[data-editorial-ready="true"]').waitFor();
 for(const [index,device] of ['iphone','ipad','macbook'].entries()){
  await page.locator('[data-editorial-step="'+index+'"]').click();
  const actual=await page.locator('#editorial').getAttribute('data-active-device');
  report.push({index,expected:device,actual});
  assert.equal(actual,device,'Editorial step must select its real '+device+' shell');
  assert.equal(await page.locator('#editorial .ed-slide.is-active').count(),1);
 }
}finally{await browser?.close();server?.kill();await writeFile(output+'/results.json',JSON.stringify(report,null,2));}
