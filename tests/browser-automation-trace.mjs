// "Sistemas e automações" (automation-trace.js, automation-trace.css): the panel beside the phone.
// Checks the sources, then in the browser at 390x844, 768x1024, 844x390 and 1440x900: the eight automations
// visible without sideways scroll, the sticky dock with the phone on screen, two columns from 600px with the
// whole phone in the viewport, the links #sistemas/<chave>[/falha], the counters of every module (and failure
// path) above 0 at the end, the time on every log line, the architecture (4+ nodes, one active per frame),
// 44px targets, autoplay that resumes and a manual pause that holds, no autoplay with reduced motion and the
// log read without pausing. Runs against BASE_URL, or spawns server.mjs on PORT (default 4207).
// Writes qa/automation-trace/results.json.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/automation-trace',port=process.env.PORT||'4207';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const report={checks:[],info:[],errors:[],console:[],missing:[]};let browser;
const check=(name,pass,detail)=>{report.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',name,detail!==undefined?JSON.stringify(detail).slice(0,900):'');};
const info=(name,value)=>{report.info.push({name,value});console.log('INFO',name,JSON.stringify(value).slice(0,600));};
await mkdir(output,{recursive:true});

const MODS=['agente','voz','chamada','instagram','pix','rcs','email','telegram'];
const FALHAS=['agente','voz','pix','rcs','email'];
const FILES=['public/assets/showcase/automation-trace.js','public/assets/showcase/automation-trace.css'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function open(viewport,{reduced=true,hash=''}={}){
  const context=await browser.newContext({viewport,isMobile:viewport.width<800,hasTouch:viewport.width<800,reducedMotion:reduced?'reduce':'no-preference',deviceScaleFactor:1});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const tag=`${viewport.width}x${viewport.height}`;
  page.on('pageerror',error=>report.errors.push(`${tag}: ${error}`));
  page.on('console',m=>{if(m.type()==='error')report.console.push(`${tag}: ${m.text()}`);});
  page.on('response',r=>{if(r.status()>=400)report.missing.push(`${tag}: ${r.status()} ${r.url().replace(base,'')}`);});
  await page.goto(base+'/'+(hash?'#'+hash:''),{waitUntil:'load'});
  if(!hash)await page.evaluate(()=>document.getElementById('sistemas').scrollIntoView({behavior:'instant'}));
  await page.waitForSelector('#sistemas .at-main .cm-screen',{state:'attached'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(300);
  return {context,page};
}
/* Puts the top of .at-main (or of the stage) at y on screen. */
const scrollTo=(page,selector,y)=>page.evaluate(({selector,y})=>{const el=document.querySelector(selector);scrollBy({top:el.getBoundingClientRect().top-y,behavior:'instant'});},{selector,y});
const frame=page=>page.evaluate(()=>Number(document.querySelector('#sistemas .at-stage .cm-screen').dataset.frame));
const pressed=page=>page.locator('#sistemas [data-at-play]').getAttribute('aria-pressed');
/* Chooses a module (and path) by clicking, like a person. */
async function choose(page,chave,falha=false){
  const k=MODS.indexOf(chave);
  await page.locator(`#sistemas [data-at-mod="${k}"]`).click();
  if(falha)await page.locator('#sistemas [data-at-falha="1"]').click();
  await page.waitForFunction(({chave,falha})=>{const r=document.querySelector('#sistemas .at');return r.dataset.modulo===chave&&r.dataset.falha===String(falha);},{chave,falha});
}
/* Walks to frame i with the arrow keys of the stage (reduced motion: instant frames). */
async function goTo(page,i){
  await page.evaluate(i=>{const s=document.querySelector('#sistemas [data-at-stage]');for(let n=0;n<200;n++){const f=Number(s.querySelector('.cm-screen').dataset.frame);if(f===i)break;s.dispatchEvent(new KeyboardEvent('keydown',{key:f<i?'ArrowRight':'ArrowLeft',bubbles:true}));}},i);
  await page.waitForFunction(i=>document.querySelector('#sistemas .at-stage .cm-screen')?.dataset.frame===String(i),i);
}
const lastFrame=page=>page.evaluate(()=>Number(document.querySelector('#sistemas [data-at-pos]').textContent.split('/')[1])-1);

try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await sleep(120);}assert(up,'server reachable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});

  // Sources: no placeholders, no Fatos, no brand typed by hand (names come from marcas.js).
  {
    const marcas=await readFile('public/assets/showcase/marcas.js','utf8');
    const nomes=[...marcas.matchAll(/marca: '([^']+)'/g)].map(m=>m[1]);
    for(const file of FILES){
      const src=await readFile(file,'utf8');
      const bad=src.split('\n').map((l,i)=>[i+1,l.replace(/[\w-]+\.exemplo\b/g,'')]).filter(([,l])=>/\bExemplo\b/.test(l)||/Fatos|\[RT|0000-0000|aparecem aqui|Lorem/i.test(l)).map(([i])=>`${file}:${i}`);
      check(`Sources: ${file} has no Fatos, Exemplo, [RT, 0000-0000 or placeholder`,bad.length===0,bad);
      const typed=nomes.filter(n=>src.includes(n));
      check(`Sources: ${file} types no brand name (marcas.js is the single source)`,typed.length===0,typed);
    }
    check('Sources: the brand list was read from marcas.js',nomes.length===8,nomes);
  }

  // 390x844: selector, dock with the phone, segmented views, links.
  {
    const vp={width:390,height:844};
    const {context,page}=await open(vp);
    const mods=await page.evaluate(()=>{
      const row=document.querySelector('#sistemas .at-mods'),shell=document.querySelector('#sistemas .shell').getBoundingClientRect();
      const r=[...row.querySelectorAll('[data-at-mod]')].map(b=>{const x=b.getBoundingClientRect();return {l:Math.round(x.left),r:Math.round(x.right),h:Math.round(x.height),text:b.querySelector('b').scrollHeight<=b.querySelector('b').clientHeight+1};});
      return {r,scroll:row.scrollWidth-row.clientWidth,gutter:Math.round(shell.left),vw:innerWidth};
    });
    check('390x844: the 8 automations are inside the screen, no sideways scroll',mods.r.length===8&&mods.scroll<=0&&mods.r.every(x=>x.l>=0&&x.r<=mods.vw),mods);
    check('390x844: the first automation starts at the gutter or after it',mods.r[0].l>=mods.gutter,{left:mods.r[0].l,gutter:mods.gutter});
    check('390x844: every automation is at least 48px tall and shows its whole name',mods.r.every(x=>x.h>=48&&x.text),mods.r);

    // Dock: phone at least 60% visible, dock inside the viewport, its text changes at every frame.
    const docks=[];
    for(const top of [90,-60,-180]){
      await scrollTo(page,'#sistemas .at-stage',top);await page.waitForTimeout(150);
      for(let n=0;n<4;n++){
        const before=await page.locator('#sistemas .at-dock').innerText();
        await page.locator('#sistemas [data-at-next]').click();
        await page.waitForTimeout(120);
        docks.push(await page.evaluate(before=>{
          const st=document.querySelector('#sistemas .at-stage').getBoundingClientRect(),d=document.querySelector('#sistemas .at-dock').getBoundingClientRect();
          const seen=Math.max(0,Math.min(innerHeight,st.bottom)-Math.max(0,st.top))/st.height;
          return {seen:+seen.toFixed(2),inside:d.top>=0&&d.bottom<=innerHeight+.5,changed:document.querySelector('#sistemas .at-dock').innerText!==before,live:document.querySelector('#sistemas [data-at-agora]').getAttribute('aria-live')};
        },before));
      }
    }
    const relevant=docks.filter(d=>d.seen>=.6);
    check('390x844: with the phone 60%+ visible the dock is whole on screen and changes at every frame',relevant.length>=8&&relevant.every(d=>d.inside&&d.changed),docks);
    check('390x844: the dock speaks on manual steps (aria-live polite)',docks.every(d=>d.live==='polite'),docks.map(d=>d.live));

    // Segmented: Tela | Registro | Arquitetura, with the dock still visible.
    await page.locator('#sistemas [data-at-aba="registro"]').click();
    await scrollTo(page,'#sistemas .at-panels',140);await page.waitForTimeout(150);
    const seg=await page.evaluate(()=>{const p=document.querySelector('#sistemas .at-panels').getBoundingClientRect(),st=document.querySelector('#sistemas .at-phone'),d=document.querySelector('#sistemas .at-dock').getBoundingClientRect();
      return {panel:p.height>300,phoneHidden:getComputedStyle(st).display==='none',dock:d.top>=0&&d.bottom<=innerHeight+.5,label:document.querySelector('#sistemas .at-tabs').getAttribute('aria-label')};});
    check('390x844: Registro takes the place of the phone and the dock stays on screen',seg.panel&&seg.phoneHidden&&seg.dock,seg);
    check('390x844: the segmented control is labelled Ver registro completo',seg.label==='Ver registro completo',seg.label);
    await page.locator('#sistemas [data-at-aba="tela"]').click();
    await context.close();

    // Links.
    {
      const {context,page}=await open(vp,{hash:'sistemas/voz'});
      await page.waitForTimeout(900);
      const r=await page.evaluate(()=>{const b=document.querySelector('#sistemas [data-at-mod="1"]'),st=document.querySelector('#sistemas .at-main').getBoundingClientRect();return {pressed:b.getAttribute('aria-pressed'),label:b.querySelector('b').textContent,onScreen:st.top<innerHeight&&st.bottom>0};});
      check('/#sistemas/voz selects Ligação com IA and shows the panel',r.pressed==='true'&&r.label==='Ligação com IA'&&r.onScreen,r);
      await context.close();
    }
    {
      const {context,page}=await open(vp,{hash:'sistemas/agente/falha'});
      const r=await page.evaluate(()=>({mod:document.querySelector('#sistemas .at').dataset.modulo,falha:document.querySelector('#sistemas .at').dataset.falha,btn:document.querySelector('#sistemas [data-at-falha="1"]').getAttribute('aria-pressed')}));
      check('/#sistemas/agente/falha opens the failure path',r.mod==='agente'&&r.falha==='true'&&r.btn==='true',r);
      await choose(page,'pix');
      check('Choosing a module writes its link (#sistemas/pix)',await page.evaluate(()=>location.hash)==='#sistemas/pix',await page.evaluate(()=>location.hash));
      await context.close();
    }
  }

  // Two columns from 600px, with the whole phone in the viewport.
  for(const vp of [{width:768,height:1024},{width:844,height:390}]){
    const {context,page}=await open(vp);
    await scrollTo(page,'#sistemas .at-main',0);await page.waitForTimeout(200);
    await page.evaluate(()=>scrollBy(0,40));await page.waitForTimeout(200);
    const r=await page.evaluate(()=>{const m=document.querySelector('#sistemas .at-main'),ph=document.querySelector('#sistemas .at-stage .ch-iphone').getBoundingClientRect();
      return {cols:getComputedStyle(m).gridTemplateColumns.split(' ').length,phone:{top:Math.round(ph.top),bottom:Math.round(ph.bottom),h:Math.round(ph.height)},vh:innerHeight};});
    check(`${vp.width}x${vp.height}: .at-main has 2 columns`,r.cols===2,r);
    check(`${vp.width}x${vp.height}: the phone fits the height of the viewport`,r.phone.h<=r.vh&&r.phone.top>=0&&r.phone.bottom<=r.vh+.5,r);
    await context.close();
  }

  // Every module and failure path at 1440x900: counters, log times, architecture, tabs, 44px targets.
  {
    const vp={width:1440,height:900};
    const {context,page}=await open(vp);
    await scrollTo(page,'#sistemas .at-main',20);
    const rows=[];
    for(const [chave,falha] of [...MODS.map(m=>[m,false]),...FALHAS.map(m=>[m,true])]){
      await choose(page,chave,falha);
      const end=await lastFrame(page);
      await page.locator('#sistemas [data-at-aba="arquitetura"]').click();
      let ativos=[];
      for(let i=0;i<=end;i++){
        await goTo(page,i);
        ativos.push(await page.evaluate(()=>({nos:document.querySelectorAll('#sistemas .at-no').length,ativos:document.querySelectorAll('#sistemas .at-no.is-ativo').length})));
      }
      const res=await page.evaluate(()=>({
        counts:[...document.querySelectorAll('#sistemas [data-at-count] div')].map(d=>({r:d.querySelector('dt').textContent,v:Number(d.querySelector('dd').textContent)})),
        times:[...document.querySelectorAll('#sistemas [data-at-log] li[data-frame]')].map(li=>li.querySelector('time')?.textContent||''),
        arestas:document.querySelectorAll('#sistemas .at-arq-svg [data-aresta]').length,
      }));
      const key=`${chave}${falha?'/falha':''}`;
      rows.push({key,counts:res.counts.map(c=>`${c.r}=${c.v}`).join(', ')});
      check(`${key}: at the last frame 3+ counters show, all above 0`,res.counts.length>=3&&res.counts.every(c=>c.v>0),res.counts);
      check(`${key}: every log line shows its time`,res.times.length>0&&res.times.every(t=>/^\d{2}:\d{2}:\d{2}$/.test(t)),res.times.filter(t=>!/^\d{2}:\d{2}:\d{2}$/.test(t)));
      check(`${key}: the architecture has 4+ nodes and exactly one active node in every frame`,ativos.every(a=>a.nos>=4&&a.ativos===1)&&res.arestas>=3,{arestas:res.arestas,bad:ativos.map((a,i)=>[i,a]).filter(([,a])=>a.nos<4||a.ativos!==1)});
    }
    info('Counters at the last frame',rows);
    // Tabs and the call panel.
    await choose(page,'voz');
    const tabs=await page.evaluate(()=>[...document.querySelectorAll('#sistemas [data-at-aba]')].filter(t=>getComputedStyle(t).display!=='none').map(t=>t.textContent.trim()));
    check('1440x900: inspector tabs Registro, Arquitetura and Transcrição (voice call)',tabs.join('|')==='Registro|Arquitetura|Transcrição',tabs);
    await page.locator('#sistemas [data-at-aba="fala"]').click();
    await goTo(page,7);
    const fala=await page.evaluate(()=>({lines:document.querySelectorAll('#sistemas [data-at-falas] li[data-texto]').length,now:document.querySelectorAll('#sistemas [data-at-falas] li[data-agora]').length,phone:/Transcrição/.test(document.querySelector('#sistemas .at-stage').textContent)}));
    check('1440x900: the transcript lives outside the phone and marks the line of now',fala.lines>=2&&fala.now===1&&!fala.phone,fala);
    await choose(page,'agente');
    await page.locator('#sistemas [data-at-aba="fala"]').click();
    await goTo(page,17);
    const bast=await page.evaluate(()=>document.querySelector('#sistemas .at-bastidor h4')?.textContent||'');
    check('1440x900: the agent module has the Bastidor card of what the consultant receives',/Bastidor · o que a consultora recebe/.test(bast),bast);
    await page.locator('#sistemas [data-at-aba="registro"]').click();
    await page.waitForTimeout(400);
    check('1440x900: a line joins the phone and the current log line',await page.evaluate(()=>document.querySelector('#sistemas .at-fio').classList.contains('is-on')));
    const small=await page.evaluate(()=>[...document.querySelectorAll('#sistemas :is([data-at-falha],[data-at-prev],[data-at-next],[data-at-play],[data-at-aba],[data-at-step])')]
      .filter(b=>b.getClientRects().length&&getComputedStyle(b).display!=='none').map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent.trim().slice(0,20),w:Math.round(r.width),h:Math.round(r.height)};}).filter(r=>r.w<44||r.h<44));
    check('1440x900: path buttons, tabs and controls are 44x44 or larger',small.length===0,small);
    await context.close();
  }
  {
    const {context,page}=await open({width:390,height:844},{hash:'sistemas/agente'});
    await scrollTo(page,'#sistemas .at-main',10);
    const small=await page.evaluate(()=>[...document.querySelectorAll('#sistemas :is([data-at-falha],[data-at-prev],[data-at-next],[data-at-play],[data-at-aba])')]
      .filter(b=>b.getClientRects().length&&getComputedStyle(b).display!=='none').map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent.trim().slice(0,20),w:Math.round(r.width),h:Math.round(r.height)};}).filter(r=>r.w<44||r.h<44));
    check('390x844: path buttons, segments and controls are 44x44 or larger',small.length===0,small);
    const fonts=await page.evaluate(()=>({actor:parseFloat(getComputedStyle(document.querySelector('#sistemas .at-dock .at-actor')).fontSize),dt:parseFloat(getComputedStyle(document.querySelector('#sistemas [data-at-count] dt')).fontSize)}));
    check('390x844: actor chips 12px+ and counter labels 12.5px+',fonts.actor>=12&&fonts.dt>=12.5,fonts);
    await context.close();
  }

  // Autoplay with motion at 390x844: plays in view, resumes after leaving, a manual pause holds. The position is
  // the frame plus how much of it has passed (the bar of the dock).
  {
    const {context,page}=await open({width:390,height:844},{reduced:false});
    const where=()=>page.evaluate(()=>{const f=Number(document.querySelector('#sistemas .at-stage .cm-screen').dataset.frame),m=getComputedStyle(document.querySelector('#sistemas [data-at-barra]')).transform.match(/matrix\(([^,]+)/);return +(f+(m?Number(m[1]):0)).toFixed(3);});
    await scrollTo(page,'#sistemas .at-stage',80);
    await page.waitForFunction(()=>Number(document.querySelector('#sistemas .at-stage .cm-screen').dataset.frame)>=1,null,{timeout:15000}).catch(()=>{});
    const a0=await where();await page.waitForTimeout(3000);const a1=await where();
    check('Autoplay: in view, the automation plays by itself (position moves in 3 s)',a0>=1&&a1>a0,{a0,a1});
    check('Autoplay: the dock stays quiet while playing (aria-live off)',await page.locator('#sistemas [data-at-agora]').getAttribute('aria-live')==='off');
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(700);
    const away=await pressed(page),b0=await where();
    await page.waitForTimeout(1500);
    const b0b=await where();
    await scrollTo(page,'#sistemas .at-stage',80);await page.waitForTimeout(3000);
    const b1=await where();
    check('Autoplay: leaving the section pauses it and coming back resumes from the same point',away==='false'&&b0b===b0&&b0>=a1&&b1>b0&&b1-b0<3,{away,b0,b0b,b1,a1});
    await page.locator('#sistemas [data-at-play]').click();
    const c0=await where(),p0=await pressed(page);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(600);
    await scrollTo(page,'#sistemas .at-stage',80);await page.waitForTimeout(3000);
    const c1=await where(),p1=await pressed(page);
    check('Autoplay: after a manual pause the section stays paused when it comes back',p0==='false'&&p1==='false'&&c1===c0,{p0,p1,c0,c1});
    await page.locator('#sistemas [data-at-play]').click();await page.waitForTimeout(2500);
    check('Autoplay: Reproduzir after the pause plays again from the same point',await pressed(page)==='true'&&await where()>c0,{c0,now:await where()});
    await context.close();
  }
  // Reading the log does not pause (1440x900, with motion).
  {
    const {context,page}=await open({width:1440,height:900},{reduced:false});
    await scrollTo(page,'#sistemas .at-main',20);
    await page.waitForFunction(()=>document.querySelector('#sistemas [data-at-play]').getAttribute('aria-pressed')==='true',null,{timeout:6000}).catch(()=>{});
    const before=await pressed(page);
    await page.locator('#sistemas [data-at-log]').hover();
    for(let i=0;i<4;i++){await page.mouse.wheel(0,160);await page.waitForTimeout(250);}
    await page.evaluate(()=>{const l=document.querySelector('#sistemas [data-at-log]');l.scrollTop=0;l.dispatchEvent(new Event('scroll'));});
    await page.waitForTimeout(500);
    const after=await pressed(page);
    check('Reading the log (scrolling the panel) keeps [data-at-play] pressed',before==='true'&&after==='true',{before,after});
    await context.close();
  }
  // Reduced motion: nothing plays by itself.
  {
    const {context,page}=await open({width:390,height:844},{reduced:true});
    await scrollTo(page,'#sistemas .at-stage',80);
    const f0=await frame(page);await page.waitForTimeout(3000);const f1=await frame(page);
    const label=await page.locator('#sistemas [data-at-play]').innerText();
    check('Reduced motion: no autoplay, the button steps (Próximo)',f0===0&&f1===0&&label==='Próximo'&&await pressed(page)===null,{f0,f1,label});
    await context.close();
  }

  check('No page errors',report.errors.length===0,report.errors);
  check('No console errors',report.console.length===0,report.console);
  check('No missing files',report.missing.length===0,report.missing);
}catch(error){report.errors.push(String(error?.stack||error));check('The run finished',false,String(error));}
finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
const failed=report.checks.filter(c=>!c.pass);
console.log(`${report.checks.length-failed.length}/${report.checks.length} checks pass`);
process.exitCode=failed.length?1:0;
