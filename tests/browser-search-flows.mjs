// Search, local and conversation journeys (campaign-search.js): LinkedIn, Google Pesquisa and Display, SEO,
// ChatGPT, Maps, WhatsApp click to chat and catalog. Walks every frame of the 8 formats at 390x844 (and the
// viewports in VIEWS) and checks the acceptance of the package: copy, data from marcas.js, the point on every
// step, the call clock, the route, the order. Runs against BASE_URL, or spawns server.mjs on PORT (default 4198).
// Writes qa/search-flows/results.json.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/search-flows',port=process.env.PORT||'4198';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const report={checks:[],info:[],errors:[],console:[],missing:[]};let browser;
const check=(name,pass,detail)=>{report.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',name,detail!==undefined?JSON.stringify(detail).slice(0,900):'');};
const info=(name,value)=>{report.info.push({name,value});console.log('INFO',name,JSON.stringify(value).slice(0,600));};
await mkdir(output,{recursive:true});

const ALL=['linkedin/feed','google/search','google/display','seo/organic','chatgpt/answer','maps/local','whatsapp/ctwa','whatsapp/catalog'];
const KEYS=process.env.ONLY?ALL.filter(k=>process.env.ONLY.split(',').includes(k)):ALL;
const PLACEHOLDER=/aparecem aqui|\[RT|\bExemplo\b|0000-0000|\(11\) 9000|Lorem|\bundefined\b|\bNaN\b|\[object Object\]/;
const SOURCES=['public/assets/showcase/campaign-search.js','public/assets/showcase/campaign-search.css'];

async function open(viewport,{reduced=true}={}){
  const context=await browser.newContext({viewport,isMobile:viewport.width<800,hasTouch:viewport.width<800,reducedMotion:reduced?'reduce':'no-preference',deviceScaleFactor:1});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const tag=`${viewport.width}x${viewport.height}`;
  page.on('pageerror',error=>report.errors.push(`${tag}: ${error}`));
  page.on('console',m=>{if(m.type()==='error')report.console.push(`${tag}: ${m.text()}`);});
  page.on('response',r=>{if(r.status()>=400)report.missing.push(`${tag}: ${r.status()} ${r.url().replace(base,'')}`);});
  await page.goto(base+'/',{waitUntil:'load'});
  await page.evaluate(()=>document.querySelector('#laboratorio')?.scrollIntoView({behavior:'instant'}));
  await page.waitForSelector('#laboratorio .cx-player',{state:'attached'});
  await page.evaluate(()=>document.fonts.ready);
  return {context,page};
}
async function peel(page,channel){
  if(channel){await page.locator(`#laboratorio [data-sp-tab="${channel}"]`).click();await page.waitForFunction(id=>document.querySelector('#laboratorio .cx-player')?.dataset.platform===id,channel);}
  const card=page.locator('#laboratorio .sp-campaign-card');
  await card.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-90,behavior:'instant'}));
  if(await card.getAttribute('data-side')!=='back'){await page.locator('#laboratorio [data-peel-grip]').click();await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card').dataset.peelState==='open');}
  await page.waitForTimeout(150);
}
async function go(page,key){
  const [channel,placement]=key.split('/');
  await page.evaluate(({channel,placement})=>window.dispatchEvent(new CustomEvent('cx:abrir',{detail:{canal:channel,formato:placement}})),{channel,placement});
  await page.waitForFunction(({channel,placement})=>{const p=document.querySelector('#laboratorio .cx-player');return document.querySelectorAll('#laboratorio [data-cx-stage]').length===1&&p?.dataset.platform===channel&&p.dataset.placement===placement&&p.querySelector('.cm-screen')?.dataset.frame==='0';},{channel,placement});
  await page.locator('#laboratorio [data-cx-stage]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
}
const next=page=>page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage]');s.focus({preventScroll:true});s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});

/* One frame, measured in the page: visible text of the scene on screen, the point, the page fill and the probes of this package. */
const measure=page=>page.evaluate(()=>{
  const player=document.querySelector('#laboratorio .cx-player'),stage=player.querySelector('[data-cx-stage]'),screen=stage.querySelector('.cm-screen');
  const index=Number(screen.dataset.frame),state=(screen.dataset.state||'').split(' ').filter(Boolean);
  const tela=stage.querySelector('.ch-iphone-tela').getBoundingClientRect();
  const on=screen.querySelector('.cm-scene[data-pos="on"]');
  const opaque=node=>{for(let el=node;el&&el!==screen.parentElement;el=el.parentElement){const s=getComputedStyle(el);if(s.display==='none'||Number(s.opacity)<.05)return false;}return getComputedStyle(node).visibility==='visible';};
  const inside=r=>r.width>0&&r.height>0&&r.right>tela.left+1&&r.left<tela.right-1&&r.bottom>tela.top+1&&r.top<tela.bottom-1;
  const shown=el=>Boolean(el)&&opaque(el)&&inside(el.getBoundingClientRect());
  const walker=document.createTreeWalker(on||screen,NodeFilter.SHOW_TEXT),range=document.createRange(),words=[],boxes=[];
  for(let n=walker.nextNode();n;n=walker.nextNode()){
    if(!n.data.trim()||!n.parentElement||!opaque(n.parentElement))continue;
    range.selectNodeContents(n);const rs=[...range.getClientRects()].filter(inside);if(!rs.length)continue;
    words.push(n.data.trim());boxes.push(...rs);
  }
  (on||screen).querySelectorAll('img,svg,video').forEach(el=>{if(el.tagName.toLowerCase()==='svg'&&el.closest('svg')!==el)return;const r=el.getBoundingClientRect();if(inside(r)&&opaque(el))boxes.push(r);});
  const banner=screen.querySelector('.cm-push');if(banner&&opaque(banner))words.push(banner.textContent.trim());
  const dot=stage.querySelector('[data-cx-dot]'),dotShown=Boolean(dot&&!dot.hidden);
  let gapBelow=null;
  if(on&&(on.classList.contains('cm-scene--web')||on.dataset.scene==='page')){
    const bar=on.querySelector('.cm-safari'),limit=bar&&opaque(bar)?bar.getBoundingClientRect().top:tela.bottom;
    const head=on.querySelector('.cm-site-step[data-step] .cm-site-head')&&[...on.querySelectorAll('.cm-site-head')].find(shown);
    const top=head?head.getBoundingClientRect().bottom:tela.top+tela.height*.08;
    const ys=boxes.filter(r=>r.bottom>top&&r.top<limit).map(r=>Math.min(limit,r.bottom));
    if(ys.length)gapBelow=(limit-Math.max(...ys))/tela.height;
  }
  const q=s=>[...(on||screen).querySelectorAll(s)];
  const probe={
    liPage:q('.sb-li-page').filter(p=>{const r=p.getBoundingClientRect();return r.left>=tela.left-2&&r.right<=tela.right+2;}).map(p=>({n:p.querySelector(':scope>small')?.textContent||'',lines:[...p.querySelectorAll('li')].filter(shown).length})),
    liCount:q('.sb-li-count i').filter(i=>getComputedStyle(i).display!=='none').map(i=>i.textContent).join(''),
    pack:q('.sb-g-pack li').length,packSp:q('.sb-g-pack .sb-g-sp').length,
    callBtns:q('.sb-call-btn').filter(b=>shown(b)&&b.querySelector('small')?.textContent.trim()).length,
    clock:[...screen.querySelectorAll('.sb-tempo')].filter(shown).map(t=>getComputedStyle(t).getPropertyValue('--sb-t').trim()),
    routeHead:q('.sb-route-h').filter(shown).map(e=>e.textContent).join(''),
    routeSheet:(()=>{const e=(on||screen).querySelector('.cm-route-sheet');if(!e)return null;const r=e.getBoundingClientRect();return getComputedStyle(e).visibility==='visible'&&r.top<tela.bottom-2;})(),
    navBar:shown((on||screen).querySelector('.sb-nav-bar')),
    navText:q('.sb-nav').filter(shown).map(e=>e.textContent).join(' '),
    waSent:shown((on||screen).querySelector('.sb-wa-out[data-in="m1"]')),
    waReply:shown((on||screen).querySelector('.sb-wa-in[data-in="m2"]')),
    ckOn:shown((on||screen).querySelector('.sb-seo-ck'))&&state.includes('ck'),
    rooms3:q('.sb-seo-r3 li').map(l=>l.textContent),rooms4:q('.sb-seo-r4 li').map(l=>l.textContent),
  };
  return {key:player.dataset.platform+'/'+player.dataset.placement,index,state,scene:on?.dataset.scene||'',web:Boolean(on?.classList.contains('cm-scene--web')),dotShown,text:words.join(' '),gapBelow,probe};
});
async function walk(page,keys,meta){
  const rows=[];
  for(const key of keys){
    await go(page,key);
    const count=Number(await page.locator('#laboratorio [data-cx-stage]').getAttribute('data-frames'));
    for(let i=0;i<count;i++){
      if(i)await next(page);
      await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);
      await page.waitForTimeout(140);
      let row=await measure(page);
      const item=meta[key].quadros[i]||{};row.toque=Boolean(item.toque);row.final=row.state.includes('done')||row.state.includes('aviso');
      for(let t=0;t<6&&!row.dotShown&&!row.toque&&!row.final;t++){await page.waitForTimeout(140);row={...await measure(page),toque:row.toque,final:row.final};}
      rows.push(row);
    }
  }
  return rows;
}

function frameChecks(tag,rows,meta){
  const steps=[];
  for(const key of KEYS){const list=rows.filter(r=>r.key===key);meta[key].passos.forEach((p,k)=>{if(!p.quadros.some(i=>list.find(r=>r.index===i)?.dotShown))steps.push(`${key} passo ${k+1}`);});}
  // The acceptance asks it at 390 x 844; elsewhere it is reported (a small or landscape phone may leave no free spot).
  if(tag==='390x844')check(`${tag}: every step of the 8 formats has a frame with the point visible`,steps.length===0,steps);
  else info(`${tag}: steps without a visible point`,steps);
  const wrong=rows.filter(r=>(r.toque||r.final)&&r.dotShown).map(r=>`${r.key}#${r.index}`);
  check(`${tag}: the point hides on tap frames and on done or aviso`,wrong.length===0,wrong);
  const holes=rows.filter(r=>PLACEHOLDER.test(r.text)).map(r=>`${r.key}#${r.index}: ${r.text.match(PLACEHOLDER)[0]}`);
  check(`${tag}: no placeholder text on screen in any frame`,holes.length===0,holes);
  const gaps=rows.filter(r=>r.gapBelow!==null&&r.gapBelow>=.25).map(r=>`${r.key}#${r.index}: ${Math.round(r.gapBelow*100)}%`);
  check(`${tag}: in every page frame the empty space under the last content is under 25% of the screen`,gaps.length===0,gaps);
  const of=k=>rows.filter(r=>r.key===k);
  if(KEYS.includes('linkedin/feed')){
    const li=of('linkedin/feed'),p2=li.find(r=>r.state.includes('p2')&&r.scene==='feed'),p3=li.find(r=>r.state.includes('p3')&&r.scene==='feed'),last=li.at(-1);
    const page=(r,n)=>r?.probe.liPage.find(p=>p.n===String(n));
    check(`${tag} linkedin/feed: pages 2 and 3 show at least 3 checklist lines each`,page(p2,2)?.lines>=3&&page(p3,3)?.lines>=3,{p2:page(p2,2),p3:page(p3,3)});
    check(`${tag} linkedin/feed: the page label matches the counter`,p2?.probe.liCount==='2'&&p3?.probe.liCount==='3',{p2:p2?.probe.liCount,p3:p3?.probe.liCount});
    check(`${tag} linkedin/feed: the last frame shows the guide unlocked in the feed (5 de 12)`,last?.scene==='feed'&&last.state.includes('lib')&&/de 12/.test(last.text)&&last.probe.liCount==='5',{scene:last?.scene,state:last?.state,count:last?.probe.liCount});
  }
  if(KEYS.includes('google/search')){
    const g=of('google/search'),r=g.find(x=>x.state.includes('r')&&x.scene==='serp'),call=g.find(x=>x.scene==='ligacao'&&x.state.includes('on'));
    check(`${tag} google/search: a Local Pack with 3 places and one Patrocinado`,r?.probe.pack===3&&r.probe.packSp===1,r?.probe);
    check(`${tag} google/search: the iOS call shows 6 labelled buttons`,call?.probe.callBtns===6,call?.probe.callBtns);
    check(`${tag} google/search: the last frame is the WhatsApp banner`,g.at(-1)?.state.includes('aviso')&&/Avaliação marcada/.test(g.at(-1).text),g.at(-1)?.state);
    const clocks=g.filter(x=>x.scene==='ligacao'&&x.probe.clock.length).map(x=>x.probe.clock[0]);
    check(`${tag} google/search: the call clock changes from turn to turn`,new Set(clocks).size>=5,clocks);
  }
  for(const k of ['google/display','chatgpt/answer'].filter(k=>KEYS.includes(k))){
    const text=of(k).map(r=>r.text).join(' ');
    check(`${tag} ${k}: the journey says maio and never junho`,/maio/.test(text)&&!/junho/i.test(text));
  }
  if(KEYS.includes('chatgpt/answer')){
    const c=of('chatgpt/answer'),sent=c.findIndex(r=>r.scene==='wa'&&r.probe.waSent),reply=c.findIndex(r=>r.scene==='wa'&&r.probe.waReply);
    check(`${tag} chatgpt/answer: a wa scene shows the sent message before any reply`,sent>=0&&(reply<0||sent<reply),{sent,reply});
  }
  if(KEYS.includes('seo/organic')){
    const s=of('seo/organic');
    check(`${tag} seo/organic: a frame shows the consent box ticked`,s.some(r=>r.probe.ckOn));
  }
  if(KEYS.includes('maps/local')){
    const m=of('maps/local'),route=m.find(r=>r.scene==='route'&&r.probe.routeHead),done=m.find(r=>r.scene==='route'&&r.state.includes('done'));
    check(`${tag} maps/local: the route header has min and km`,/min/.test(route?.probe.routeHead||'')&&/km/.test(route?.probe.routeHead||''),route?.probe.routeHead);
    check(`${tag} maps/local: in done the route sheet is hidden and the navigation bar is on screen`,done&&done.probe.routeSheet===false&&done.probe.navBar,done?.probe);
    const chegada=(done?.probe.navText.match(/chegada (\d{2}:\d{2})/)||[])[1];
    check(`${tag} maps/local: the arrival is at or after the opening time (11:30)`,Boolean(chegada)&&chegada>='11:30',chegada);
  }
  if(KEYS.includes('whatsapp/catalog')){
    const text=of('whatsapp/catalog').map(r=>r.text).join(' ');
    check(`${tag} whatsapp/catalog: the conversation shows Pedido 0428 and Pix na retirada`,/Pedido 0428/.test(text)&&/Pix na retirada/.test(text));
  }
}

try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}assert(up,'server reachable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});

  // Sources: no placeholder, no brand name typed by hand, nothing of the old studio.
  {
    const src=Object.fromEntries(await Promise.all(SOURCES.map(async f=>[f,await readFile(f,'utf8')])));
    const grep=SOURCES.flatMap(f=>src[f].split('\n').map((l,i)=>[f,i+1,l]).filter(([, ,l])=>/aparecem aqui|\[RT|\bExemplo\b|0000-0000|\(11\) 9000/.test(l)).map(([f,i])=>`${f}:${i}`));
    check('Sources: no placeholder line',grep.length===0,grep);
    const {CLIENTES}=await import(new URL('../public/assets/showcase/marcas.js',import.meta.url));
    const names=[...new Set(Object.values(CLIENTES).flatMap(c=>[c.marca,c.curta]))];
    const typed=SOURCES.flatMap(f=>names.filter(n=>new RegExp(`(^|[^\\p{L}\\p{N}_])${n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?![\\p{L}\\p{N}_])`,'u').test(src[f])).map(n=>`${f}: ${n}`));
    check('Sources: no brand name typed literally (they come from marcas.js)',typed.length===0,typed);
    check('Sources: no mention of the old studio',SOURCES.every(f=>!/f[a]tos/i.test(src[f])));
  }

  // Data, in the page: descriptions, fronts, saídas, plans, the audio contract and the rendered copy.
  const {context,page}=await open({width:390,height:844});
  const meta=await page.evaluate(async keys=>{
    const m=await import('/assets/showcase/campaign-channels.js'),mk=await import('/assets/showcase/marcas.js');
    const out={};for(const k of keys){const p=m.placementByKey(k);out[k]={passos:p.passos.map(x=>({quadros:x.quadros})),quadros:p.quadros.map(q=>({toque:q.toque||'',cena:q.cena,estado:q.estado||'',desc:q.desc||'',fala:q.fala||null})),audio:p.audio||null,html:m.renderMock(p).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')};}
    const T=mk.OFERTAS.turismo,inc=mk.OFERTAS.incorporadora.plantas;
    const saidas=T.saidas.map(s=>`${Number(s.ida.slice(8))} a ${Number(s.volta.slice(8))} de maio`);
    const arts=['linkedin','google','seo','chatgpt','maps','whatsapp'].map(id=>m.channelById(id)).filter(c=>!c.art?.formato||!c.art?.cta||!c.art?.oferta).map(c=>c.id);
    return {out,saidas,inc,arts};
  },KEYS);
  const M=meta.out;
  const descs=[];for(const k of KEYS)M[k].quadros.forEach((q,i)=>{if(!q.desc||q.desc.length>140||/\b(token|estado|quadro|data-|hs\d)\b/i.test(q.desc))descs.push(`${k}#${i} (${q.desc.length}): ${q.desc}`);});
  check('Every desc is visible copy of at most 140 characters, without internal words',descs.length===0,descs);
  check('The fronts of LinkedIn, Google, SEO, ChatGPT, Maps and WhatsApp have formato, oferta and cta',meta.arts.length===0,meta.arts);
  const holes=KEYS.filter(k=>PLACEHOLDER.test(M[k].html)).map(k=>`${k}: ${M[k].html.match(PLACEHOLDER)[0]}`);
  check('Rendered HTML of the 8 formats has no placeholder text and no Exemplo outside .exemplo domains',holes.length===0,holes);
  check('google/search: no 0000-0000 anywhere in the mock',!/0000-0000/.test(M['google/search']?.html||''));
  for(const k of ['google/display','chatgpt/answer'].filter(k=>KEYS.includes(k)))check(`${k}: the departures match OFERTAS.turismo`,meta.saidas.every(s=>M[k].html.includes(s)),meta.saidas);
  if(KEYS.includes('seo/organic'))check('seo/organic: the room lists are the 3 and 4 bedroom plans of OFERTAS',meta.inc.tres.every(t=>M['seo/organic'].html.includes(t))&&meta.inc.quatro.every(t=>M['seo/organic'].html.includes(t))&&/3 quartos/.test(M['seo/organic'].html)&&/4 quartos/.test(M['seo/organic'].html));
  if(KEYS.includes('whatsapp/catalog'))check('whatsapp/catalog: the mock carries Pedido 0428 and Pix na retirada',/Pedido 0428/.test(M['whatsapp/catalog'].html)&&/Pix na retirada/.test(M['whatsapp/catalog'].html));
  if(KEYS.includes('google/search')){
    const a=M['google/search'].audio,falas=M['google/search'].quadros.filter(q=>q.fala?.length).length;
    check('google/search: placement.audio has one segment per spoken frame, in order, ready for a src',a&&Array.isArray(a.segmentos)&&a.segmentos.length===falas&&a.segmentos.every((s,i,l)=>s.texto&&s.endMs>s.startMs&&(!i||s.startMs>=l[i-1].endMs))&&typeof a.src==='string',{falas,segs:a?.segmentos?.length});
  }
  if(KEYS.includes('chatgpt/answer')){
    // A tap frame keeps the scene and adds at most the highlight of what it taps (q tokens): the result comes in the next frame.
    const q=M['chatgpt/answer'].quadros,bad=[];
    q.forEach((f,i)=>{if(!f.toque||!i)return;const prev=q[i-1],add=f.estado.split(' ').filter(t=>t&&!prev.estado.split(' ').includes(t));if(prev.cena!==f.cena||add.some(t=>!/^q\d$/.test(t)))bad.push(`#${i} ${f.estado}`);});
    check('chatgpt/answer: no frame has the tap and its result together',bad.length===0,bad);
  }

  // Every frame at 390 x 844 (and VIEWS).
  for(const [width,height] of (process.env.VIEWS||'390x844').split(',').map(v=>v.split('x').map(Number))){
    const tag=`${width}x${height}`;
    const ctx=width===390&&height===844?{context,page}:await open({width,height});
    await peel(ctx.page,'linkedin');
    const rows=await walk(ctx.page,KEYS,M);
    frameChecks(tag,rows,M);
    (report.frames||={})[tag]=rows.map(r=>({...r,text:r.text.slice(0,240)}));
    info(`${tag}: frames walked`,rows.length);
    if(ctx.context!==context)await ctx.context.close();
  }
  await context.close();

  // With motion: the call clock runs inside a turn.
  if(KEYS.includes('google/search')){
    const {context,page}=await open({width:390,height:844},{reduced:false});
    await peel(page,'google');await go(page,'google/search');
    const target=M['google/search'].quadros.findIndex(q=>q.estado.split(' ').includes('t2'));
    for(let i=1;i<=target;i++){await next(page);await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);}
    const ok=await page.waitForFunction(()=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.state?.includes('t2'),null,{timeout:5000}).then(()=>true,()=>false);
    await page.waitForTimeout(300);
    const read=()=>page.evaluate(()=>{const t=document.querySelector('#laboratorio [data-cx-stage] .sb-call .sb-tempo');return t?getComputedStyle(t).getPropertyValue('--sb-t').trim():'';});
    const a=await read();await page.waitForTimeout(1600);const b=await read();
    check('Motion: the call clock advances by itself inside a turn',ok&&a&&b&&a!==b,{ok,a,b});
    await context.close();
  }

  check('No JavaScript errors',report.errors.length===0,report.errors);
  check('No console errors',report.console.length===0,[...new Set(report.console)].slice(0,20));
  check('No 404 or other HTTP error during the walk',report.missing.length===0,[...new Set(report.missing)].slice(0,20));
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
const failed=report.checks.filter(c=>!c.pass);
console.log(`${report.checks.length-failed.length}/${report.checks.length} checks passed`);
process.exit(failed.length?1:0);
