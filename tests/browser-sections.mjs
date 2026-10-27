// Mural de jornadas (#mural, public/assets/mural/) e a integração das seções da página.
// Confere em 390x844 e 1440x900 (com movimento) e em 390x844 com movimento reduzido: 12 a 16 cartões com marca de
// marcas.js; cada link abre o formato certo no laboratório (aria-pressed e data-frame) ou a automação certa em
// #sistemas; setas do teclado trocam o cartão; a rolagem lenta anda sozinha, para em hover e no botão de pausa,
// e não anda com movimento reduzido; menu do celular, briefing preenchido pelo serviço e contato direto.
// Roda contra BASE_URL ou sobe server.mjs na PORT (padrão 4191). Grava qa/sections/results.json.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const port=process.env.PORT||'4191',output='qa/sections';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
await mkdir(output,{recursive:true});
const report={checks:[],errors:[],missing:[]};let browser;
const check=(name,pass,detail)=>{report.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',name,detail!==undefined?JSON.stringify(detail).slice(0,700):'');else console.log('ok  ',name);};

async function open(viewport,reduced){
  const context=await browser.newContext({viewport,isMobile:viewport.width<800,hasTouch:viewport.width<800,reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const tag=`${viewport.width}x${viewport.height}${reduced?' reduzido':''}`;
  page.on('pageerror',e=>report.errors.push(`${tag}: ${e}`));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(`${tag}: ${m.text()}`);});
  page.on('response',r=>{if(r.status()>=400)report.missing.push(`${tag}: ${r.status()} ${r.url().replace(base,'')}`);});
  await page.goto(base+'/',{waitUntil:'load'});
  await page.waitForSelector('#mural[data-css-ready="true"] .mu-card',{state:'attached'});
  await page.evaluate(()=>document.fonts.ready);
  return {context,page,tag};
}
const toMural=page=>page.evaluate(()=>{const s=document.querySelector('#mural .mu-strip');scrollTo({top:scrollY+s.getBoundingClientRect().top-120,behavior:'instant'});});

async function mural(viewport,reduced){
  const {context,page,tag}=await open(viewport,reduced);
  await toMural(page);
  const info=await page.evaluate(async()=>{
    const {CLIENTES}=await import('/assets/showcase/marcas.js');
    const list=await (await fetch('/assets/portfolio/mural/mural.json')).json();
    const cards=[...document.querySelectorAll('#mural .mu-card:not([data-mu-clone])')];
    return {n:cards.length,
      marcas:cards.every((c,i)=>c.querySelector('.mu-txt b').textContent===CLIENTES[list[i].cliente].marca),
      hrefs:cards.map(c=>c.querySelector('a').getAttribute('href')),
      lazy:[...document.querySelectorAll('#mural img')].every(i=>i.loading==='lazy'&&i.decoding==='async'),
      alts:cards.every(c=>c.querySelector('img').alt.length>20),
      clones:[...document.querySelectorAll('#mural [data-mu-clone]')].every(c=>c.getAttribute('aria-hidden')==='true'&&c.querySelector('a').tabIndex===-1),
      logos:document.querySelectorAll('#mural .mu-logo').length,
      targets:[...document.querySelectorAll('#mural .mu-btn:not([hidden]),#mural .mu-logo')].every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.height>=44;}),
      pausa:!document.querySelector('#mural [data-mu-pausa]').hidden};
  });
  check(`${tag}: o mural tem de 12 a 16 cartões`,info.n>=12&&info.n<=16,info.n);
  check(`${tag}: a marca de cada cartão vem de marcas.js`,info.marcas);
  check(`${tag}: cada cartão leva a um formato do laboratório ou a uma automação`,info.hrefs.every(h=>/^#(laboratorio\/[a-z]+\/[a-z]+|sistemas\/[a-z]+)$/.test(h)),info.hrefs);
  check(`${tag}: imagens com loading=lazy e texto alternativo`,info.lazy&&info.alts);
  check(`${tag}: as cópias do laço ficam fora do leitor de tela e do Tab`,info.clones);
  check(`${tag}: os 16 canais aparecem e os toques têm 44 px`,info.logos===16&&info.targets);
  check(`${tag}: o botão de pausa só aparece com movimento`,info.pausa===!reduced);

  // Rolagem lenta: anda sozinha com movimento, para no botão de pausa e em hover; nunca anda com movimento reduzido.
  const left=()=>page.locator('#mural .mu-strip').evaluate(s=>s.scrollLeft);
  await page.mouse.move(2,2);
  const a=await left();await page.waitForTimeout(1600);const b=await left();
  if(reduced)check(`${tag}: com movimento reduzido a faixa não rola sozinha`,b===a,[a,b]);
  else{
    check(`${tag}: a faixa rola devagar sozinha`,b-a>10&&b-a<120,[a,b]);
    await page.locator('#mural [data-mu-pausa]').click();
    const c=await left();await page.waitForTimeout(900);
    check(`${tag}: o botão de pausa para a faixa`,await left()===c&&await page.locator('#mural [data-mu-pausa]').getAttribute('aria-pressed')==='true');
    await page.locator('#mural [data-mu-pausa]').click();
    if(viewport.width>=1024){
      const box=await page.locator('#mural .mu-strip').boundingBox();
      await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(300);
      const d=await left();await page.waitForTimeout(900);
      check(`${tag}: o ponteiro sobre a faixa para a rolagem`,Math.abs(await left()-d)<1,[d]);
      await page.mouse.move(2,2);
    }
  }
  // Teclado: com o foco num cartão, → e ← trocam o cartão (tabindex móvel).
  await page.locator('#mural .mu-card:not([data-mu-clone]) a').first().focus();
  await page.keyboard.press('ArrowRight');
  const second=await page.evaluate(()=>{const a=[...document.querySelectorAll('#mural .mu-card:not([data-mu-clone]) a')];return a.indexOf(document.activeElement);});
  await page.keyboard.press('ArrowLeft');
  const first=await page.evaluate(()=>{const a=[...document.querySelectorAll('#mural .mu-card:not([data-mu-clone]) a')];return a.indexOf(document.activeElement)===0&&document.activeElement.tabIndex===0;});
  check(`${tag}: → e ← com o foco no mural trocam o cartão`,second===1&&first,[second,first]);
  await page.keyboard.press('End');
  check(`${tag}: End vai ao último cartão`,await page.evaluate(()=>{const a=[...document.querySelectorAll('#mural .mu-card:not([data-mu-clone]) a')];return a.indexOf(document.activeElement)===a.length-1;}));
  await page.mouse.click(2,viewport.height-2).catch(()=>{});

  // Cada link abre o que promete. O segundo clique no mesmo cartão (mesmo hash) também reabre.
  const wrong=[];
  for(let i=0;i<info.hrefs.length;i++){
    const href=info.hrefs[i];
    await toMural(page);
    await page.locator('#mural .mu-card:not([data-mu-clone]) a').nth(i).evaluate(a=>a.click());
    const m=/^#laboratorio\/([a-z]+)\/([a-z]+)$/.exec(href);
    try{
      if(m)await page.waitForFunction(([canal,formato])=>{
        const p=document.querySelector('#laboratorio .cx-player'),s=p?.querySelector('[data-cx-stage] .cm-screen');
        const buttons=[...(p?.querySelectorAll('[data-cx-placement]')||[])],pressed=buttons.filter(b=>b.getAttribute('aria-pressed')==='true');
        return p?.dataset.platform===canal&&p.dataset.placement===formato&&(buttons.length<2||pressed.length===1)&&s?.dataset.frame==='0'&&document.querySelector('#laboratorio .sp-campaign-card')?.dataset.side==='back';
      },[m[1],m[2]],{timeout:12000});
      else{
        const chave=href.split('/')[1];
        await page.waitForFunction(chave=>{
          const root=document.querySelector('[data-vitrine="sistemas"]'),k=root&&[...root.querySelectorAll('[data-at-mod]')].findIndex(b=>b.getAttribute('aria-pressed')==='true');
          const s=root?.querySelector('.at-main .cm-screen');
          return root?.dataset.modulo===chave&&k>=0&&s&&/^\d+$/.test(s.dataset.frame||'');
        },chave,{timeout:12000});
      }
    }catch{wrong.push(href);}
  }
  check(`${tag}: cada cartão abre o formato (aria-pressed, quadro 0) ou a automação certa`,wrong.length===0,wrong);
  // Mesmo hash de novo: o laboratório reabre pelo evento cx:abrir.
  const lab=info.hrefs.findIndex(h=>h.startsWith('#laboratorio'));
  await page.evaluate(h=>{history.replaceState(null,'',h);},info.hrefs[lab]);
  await page.waitForFunction(()=>document.querySelectorAll('#laboratorio [data-cx-stage]').length===1);
  await page.locator('#laboratorio [data-cx-stage]').evaluate(s=>{s.focus({preventScroll:true});s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});
  await toMural(page);
  await page.locator('#mural .mu-card:not([data-mu-clone]) a').nth(lab).evaluate(a=>a.click());
  const again=await page.waitForFunction(()=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame==='0',null,{timeout:8000}).then(()=>true,()=>false);
  check(`${tag}: clicar de novo no mesmo cartão reabre o formato do começo`,again);
  if(!reduced)await toMural(page).then(()=>page.waitForTimeout(300)).then(()=>page.locator('#mural').screenshot({path:`${output}/mural-${viewport.width}.png`,animations:'disabled'})).catch(()=>{});
  check(`${tag}: sem rolagem lateral na página`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await context.close();
}

async function pagina(){
  const {context,page,tag}=await open({width:390,height:844},false);
  check(`${tag}: documento em pt-BR com um só h1`,await page.locator('html').getAttribute('lang')==='pt-BR'&&await page.locator('h1').count()===1);
  await page.locator('#menu-toggle').click();
  check(`${tag}: o menu do celular abre`,await page.locator('#menu-toggle').getAttribute('aria-expanded')==='true'&&await page.locator('#mobile-nav').isVisible());
  await page.keyboard.press('Escape');
  check(`${tag}: Esc fecha o menu e devolve o foco`,await page.locator('#menu-toggle').getAttribute('aria-expanded')==='false'&&await page.locator('#menu-toggle').evaluate(el=>el===document.activeElement));
  // O serviço escolhido em Serviços preenche o briefing.
  await page.evaluate(()=>document.querySelector('#categorias').scrollIntoView({behavior:'instant'}));
  await page.waitForSelector('#categorias[data-css-ready="true"]',{state:'attached'});
  const scope=page.locator('details[data-service-scope="campaigns"]');
  await scope.locator('summary').click();
  await scope.locator('a.path-contact').evaluate(a=>a.click());
  await page.waitForTimeout(400);
  check(`${tag}: Começar briefing de campanha escolhe o serviço no formulário`,/Campanhas e anúncios/.test(await page.locator('#service').inputValue()),await page.locator('#service').inputValue());
  const direct=await page.locator('#contato [data-contact-direct]').evaluateAll(links=>links.map(a=>({href:a.href,text:a.textContent.trim()})));
  check(`${tag}: contato direto por WhatsApp ou e-mail, com texto que diz o destino`,direct.some(l=>/wa\.me\/\d{10,}|mailto:[^?]+@/.test(l.href))&&direct.every(l=>l.text.length>3),direct);
  await context.close();
}

try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}assert(up,'server reachable');
  browser=await chromium.launch();
  await mural({width:390,height:844},false);
  await mural({width:1440,height:900},false);
  await mural({width:390,height:844},true);
  await pagina();
  check('sem erro de JavaScript nem no console',report.errors.length===0,report.errors);
  check('nenhuma resposta 4xx/5xx',report.missing.length===0,report.missing);
}finally{
  await browser?.close();server?.kill();
  await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));
}
const failed=report.checks.filter(c=>!c.pass);
console.log(`${report.checks.length-failed.length}/${report.checks.length} verificações passaram`);
if(failed.length)process.exit(1);
