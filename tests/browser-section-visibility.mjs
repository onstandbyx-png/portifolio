// Seções da página: cada seção sob demanda ([data-lazy-css]) carrega as folhas, monta e fica visível ao chegar
// perto da tela, com conteúdo de verdade (nada vazio nem escondido), na ordem hero, mural, laboratório, sites,
// sistemas, serviços e contato. Sem JavaScript, o <noscript> mostra as seções. Roda contra BASE_URL ou sobe
// server.mjs na PORT (padrão 4187). Grava qa/section-visibility/results.json.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const port=process.env.PORT||'4187';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const output='qa/section-visibility';await mkdir(output,{recursive:true});
const ORDEM=['mural','laboratorio','editorial','sistemas','categorias','contato'];
const results=[];let browser;
try{
  let healthy=false;for(let i=0;i<60;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(r=>setTimeout(r,150));}assert(healthy,'Server reachable');
  browser=await chromium.launch();
  for(const [width,height,reduced] of [[320,740,false],[390,844,false],[1440,900,false],[390,844,true]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion:reduced?'reduce':'no-preference'});page.setDefaultTimeout(20000);
    const row={width,height,reduced,checks:[],errors:[],missing:[]};results.push(row);
    page.on('pageerror',e=>row.errors.push(String(e)));
    page.on('response',r=>{if(r.status()>=400)row.missing.push(`${r.status()} ${r.url().replace(base,'')}`);});
    const check=(name,pass,detail)=>{row.checks.push({name,pass:!!pass,detail});if(!pass)console.error('FAIL',width,reduced,name,JSON.stringify(detail??'').slice(0,400));};
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
      check('A ordem das seções é hero, mural, laboratório, sites, sistemas, serviços e contato',await page.evaluate(ordem=>{const ids=[...document.querySelectorAll('main > section[id], main section[id]')].map(s=>s.id).filter(id=>ordem.includes(id));return JSON.stringify(ids)===JSON.stringify(ordem)&&Boolean(document.querySelector('.planes-hero'));},ORDEM));
      check('Antes de montar, nenhuma seção abaixo da dobra aparece sem estilo',await page.evaluate(()=>[...document.querySelectorAll('[data-lazy-css]:not([data-css-ready])')].every(s=>getComputedStyle(s).visibility==='hidden')));
      for(const id of ORDEM){
        await page.evaluate(id=>document.getElementById(id).scrollIntoView({behavior:'instant'}),id);
        await page.waitForSelector(`#${id}[data-css-ready="true"]`,{state:'attached'});
        await page.waitForTimeout(250);
        const s=await page.evaluate(id=>{const el=document.getElementById(id),r=el.getBoundingClientRect(),text=el.innerText.replace(/\s+/g,' ').trim();
          return {visivel:getComputedStyle(el).visibility==='visible',altura:Math.round(r.height),texto:text.length,imagens:[...el.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().width>0).length};},id);
        check(`#${id}: monta, fica visível e tem conteúdo`,s.visivel&&s.altura>(id==='mural'?300:200)&&s.texto>60,s);
      }
      check('O mural mostra telas e os 16 canais',await page.locator('#mural .mu-card:not([data-mu-clone])').count()>=12&&await page.locator('#mural .mu-logo').count()===16);
      check('O laboratório mostra os 16 canais',await page.locator('#laboratorio [data-sp-tab]').count()===16);
      check('Sistemas mostra as 8 automações',await page.locator('[data-vitrine="sistemas"] [data-at-mod]').count()===8);
      await page.screenshot({path:`${output}/fim-${width}${reduced?'-reduzido':''}.png`}).catch(()=>{});
      check('Sem rolagem lateral, erro de JavaScript ou resposta 4xx',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)&&row.errors.length===0&&row.missing.length===0,{errors:row.errors,missing:row.missing});
    }catch(error){row.failure=String(error);console.error('FAIL',width,reduced,String(error).slice(0,400));await page.screenshot({path:`${output}/falha-${width}${reduced?'-reduzido':''}.png`}).catch(()=>{});}
    await page.close();
    console.log(width,height,reduced?'reduzido':'',`${row.checks.filter(c=>c.pass).length}/${row.checks.length}`);
  }
  // Sem JavaScript: o <noscript> carrega as folhas e mostra as seções.
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto(base,{waitUntil:'load'});
  const visiveis=await nojs.evaluate(ids=>ids.filter(id=>id!=='mural').every(id=>getComputedStyle(document.getElementById(id)).visibility==='visible'),ORDEM);
  results.push({noJavaScript:true,pass:visiveis});console.log('sem JavaScript',visiveis);await nojs.close();
}finally{await browser?.close();server?.kill();await writeFile(output+'/results.json',JSON.stringify(results,null,2));}
assert(results.every(r=>!r.failure&&r.pass!==false&&(r.checks||[]).every(c=>c.pass)),'Section visibility regression failed; inspect qa/section-visibility/results.json');
console.log('PASS: seções sob demanda visíveis e com conteúdo');
