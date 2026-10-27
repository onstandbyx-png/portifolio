// Campaign journeys of Meta, TikTok, YouTube and the sponsored article (campaign-channels.js, campaign-sites.js, lab-telas.js).
// Walks every frame of the 14 formats below at 390x844 and 1440x900 and checks copy, data, the point, tickets,
// videos and page fill. Runs against BASE_URL, or spawns server.mjs on PORT (default 4197). Writes qa/campaign-flows/results.json.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/campaign-flows',port=process.env.PORT||'4197';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const report={checks:[],info:[],errors:[],console:[],missing:[]};let browser;
const check=(name,pass,detail)=>{report.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',name,detail!==undefined?JSON.stringify(detail).slice(0,900):'');};
const info=(name,value)=>{report.info.push({name,value});console.log('INFO',name,JSON.stringify(value).slice(0,600));};
await mkdir(output,{recursive:true});

/* The 14 formats of this package (critic 36): Instagram 5, Facebook 4, TikTok 1, YouTube 3, sponsored article 1. */
const ALL=['instagram/feed','instagram/reels','instagram/story','instagram/live','instagram/explorar',
  'facebook/feed','facebook/post','facebook/video','facebook/breaks',
  'tiktok/infeed','youtube/instream','youtube/shorts','youtube/live','blog/article'];
/* ONLY=key,key narrows the walk while debugging; the full run takes the 14. */
const KEYS=process.env.ONLY?ALL.filter(k=>process.env.ONLY.split(',').includes(k)):ALL;
/* Formats with a licensed video on screen; the others move licensed photos (Ken Burns), listed in info. */
const VIDEO_KEYS=['instagram/reels','instagram/live','facebook/breaks','tiktok/infeed','youtube/live'].filter(k=>KEYS.includes(k));
const PLACEHOLDER=/aparecem aqui|\[RT|Exemplo[ ,<]|\bExemplo\b|Canal Exemplo|Portal Exemplo|Página que você segue|cliente_12|0000-0000|\(11\) 9000|Lorem|\bundefined\b|\bNaN\b|\[object Object\]/;
const OLD_IMAGES=/campanha-nerd|cena-nerd|campanha-esportes|cena-esportes|campanha-crencas|cena-crencas|campanha-negocios|f[a]tos/i;
const FILES=['public/assets/showcase/campaign-channels.js','public/assets/showcase/campaign-sites.js','public/assets/showcase/lab-telas.js'];
const SHIPPED=[...FILES,'public/assets/showcase/campaign-sites.css','public/assets/showcase/lab-telas.css','public/assets/showcase/channel-mocks.css'];

async function open(viewport,{reduced=true}={}){
  const context=await browser.newContext({viewport,isMobile:viewport.width<800,hasTouch:viewport.width<800,reducedMotion:reduced?'reduce':'no-preference',deviceScaleFactor:1});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const tag=`${viewport.width}x${viewport.height}`;
  page.on('pageerror',error=>report.errors.push(`${tag}: ${error}`));
  page.on('console',m=>{if(m.type()==='error')report.console.push(`${tag}: ${m.text()}`);});
  page.on('response',r=>{if(r.status()>=400)report.missing.push(`${tag}: ${r.status()} ${r.url().replace(base,'')}`);});
  await page.goto(base+'/',{waitUntil:'load'});
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

/* One frame, measured in the page: visible text of the scene on screen, the point, tickets, videos and the page fill. */
const measure=page=>page.evaluate(async()=>{
  const m=await import('/assets/showcase/campaign-channels.js');
  const player=document.querySelector('#laboratorio .cx-player'),stage=player.querySelector('[data-cx-stage]'),screen=stage.querySelector('.cm-screen');
  const pl=m.channelById(player.dataset.platform).placements.find(p=>p.id===player.dataset.placement);
  const index=Number(screen.dataset.frame),item=pl.quadros[index]||{},state=(screen.dataset.state||'').split(' ').filter(Boolean);
  const tela=stage.querySelector('.ch-iphone-tela').getBoundingClientRect();
  const on=screen.querySelector('.cm-scene[data-pos="on"]');
  const opaque=node=>{for(let el=node;el&&el!==screen.parentElement;el=el.parentElement){const s=getComputedStyle(el);if(s.display==='none'||Number(s.opacity)<.05)return false;}return getComputedStyle(node).visibility==='visible';};
  const inside=r=>r.width>0&&r.height>0&&r.right>tela.left+1&&r.left<tela.right-1&&r.bottom>tela.top+1&&r.top<tela.bottom-1;
  const walker=document.createTreeWalker(on||screen,NodeFilter.SHOW_TEXT),range=document.createRange(),words=[],boxes=[];
  for(let n=walker.nextNode();n;n=walker.nextNode()){
    if(!n.data.trim()||!n.parentElement||!opaque(n.parentElement))continue;
    range.selectNodeContents(n);const rs=[...range.getClientRects()].filter(inside);if(!rs.length)continue;
    words.push(n.data.trim());boxes.push(...rs);
  }
  (on||screen).querySelectorAll('img,svg,video,canvas').forEach(el=>{if(el.closest('svg')!==el&&el.tagName.toLowerCase()==='svg')return;const r=el.getBoundingClientRect();if(inside(r)&&opaque(el))boxes.push(r);});
  const dot=stage.querySelector('[data-cx-dot]'),dotShown=Boolean(dot&&!dot.hidden);
  const tickets=[...(on||screen).querySelectorAll('.cm-ticket b')].filter(b=>opaque(b)&&inside(b.getBoundingClientRect())).filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent);
  const videos=[...screen.querySelectorAll('video')].map(v=>({on:Boolean(on&&on.contains(v)),muted:v.muted&&v.hasAttribute('muted'),inline:v.hasAttribute('playsinline'),poster:Boolean(v.getAttribute('poster')),paused:v.paused}));
  // Page fill (critic 1): in a web page scene, the empty band under the last content node and the largest empty band.
  let gapBelow=null,band=null;
  if(on&&(on.classList.contains('cm-scene--web')||on.dataset.scene==='page')){
    const bar=on.querySelector('.cm-safari'),limit=bar&&opaque(bar)?bar.getBoundingClientRect().top:tela.bottom;
    const head=on.querySelector('.cm-site-head'),top=head?head.getBoundingClientRect().bottom:tela.top+tela.height*.08;
    const ys=boxes.filter(r=>r.bottom>top&&r.top<limit&&!(bar&&bar.contains(document.elementFromPoint(r.left+1,r.top+1)))).map(r=>[Math.max(top,r.top),Math.min(limit,r.bottom)]).sort((a,b)=>a[0]-b[0]);
    if(ys.length){
      const last=Math.max(...ys.map(y=>y[1]));gapBelow=(limit-last)/tela.height;
      let reach=top,widest=0;for(const [a,b] of ys){if(a>reach)widest=Math.max(widest,a-reach);reach=Math.max(reach,b);}
      widest=Math.max(widest,limit-reach);band=widest/tela.height;
    }
  }
  return {key:player.dataset.platform+'/'+player.dataset.placement,index,count:pl.quadros.length,state,scene:on?.dataset.scene||'',web:Boolean(on?.classList.contains('cm-scene--web')),
    toque:Boolean(item.toque),final:state.includes('done')||state.includes('aviso'),dotShown,text:words.join(' '),tickets,videos,gapBelow,band,
    badges:[...(on||screen).querySelectorAll('.cm-tc-cart')].filter(c=>{const r=c.getBoundingClientRect();return inside(r)&&opaque(c)&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('.cm-tc-cart')===c;}).map(c=>c.querySelector('.cm-tc-badge')).map(b=>({text:b.textContent.trim(),zero:b.classList.contains('cm-tc-badge--zero')}))};
});
async function go(page,key){
  const [channel,placement]=key.split('/');
  await page.evaluate(({channel,placement})=>window.dispatchEvent(new CustomEvent('cx:abrir',{detail:{canal:channel,formato:placement}})),{channel,placement});
  await page.waitForFunction(({channel,placement})=>{const p=document.querySelector('#laboratorio .cx-player');return document.querySelectorAll('#laboratorio [data-cx-stage]').length===1&&p?.dataset.platform===channel&&p.dataset.placement===placement&&p.querySelector('.cm-screen')?.dataset.frame==='0';},{channel,placement});
  await page.locator('#laboratorio [data-cx-stage]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
}
const next=page=>page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage]');s.focus({preventScroll:true});s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});
async function walk(page,keys){
  const rows=[];
  for(const key of keys){
    await go(page,key);
    const count=Number(await page.locator('#laboratorio [data-cx-stage]').getAttribute('data-frames'));
    for(let i=0;i<count;i++){
      if(i)await next(page);
      await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);
      await page.waitForTimeout(120);
      let row=await measure(page);
      // The point lands after the frame settles: give it up to 700 ms where a point is expected.
      for(let t=0;t<5&&!row.dotShown&&!row.toque&&!row.final;t++){await page.waitForTimeout(140);row=await measure(page);}
      rows.push(row);
    }
  }
  return rows;
}

/* Frame-level criteria shared by both viewports. */
function frameChecks(tag,rows,placements){
  const steps=[];
  for(const key of KEYS){
    const list=rows.filter(r=>r.key===key),pl=placements[key];
    pl.passos.forEach((p,k)=>{if(!p.quadros.some(i=>list.find(r=>r.index===i)?.dotShown))steps.push(`${key} passo ${k+1}`);});
  }
  check(`${tag}: every step of the 14 formats has a frame with the point visible`,steps.length===0,steps);
  const wrong=rows.filter(r=>(r.toque||r.final)&&r.dotShown).map(r=>`${r.key}#${r.index}`);
  check(`${tag}: the point hides on tap frames and on done or aviso`,wrong.length===0,wrong);
  const overflow=rows.filter(r=>r.final&&r.tickets.length).map(r=>`${r.key}#${r.index}: ${r.tickets.join(' | ')}`);
  check(`${tag}: in every done frame each ticket value fits its cell`,overflow.length===0,overflow);
  const holes=rows.filter(r=>PLACEHOLDER.test(r.text)).map(r=>`${r.key}#${r.index}: ${r.text.match(PLACEHOLDER)[0]}`);
  check(`${tag}: no placeholder text on screen in any frame`,holes.length===0,holes);
  const pages=rows.filter(r=>r.web&&r.gapBelow!==null);
  const gaps=pages.filter(r=>r.gapBelow>=.25).map(r=>`${r.key}#${r.index}: ${Math.round(r.gapBelow*100)}%`);
  check(`${tag}: in every page frame the empty space under the last content is under 25% of the screen (critic 1)`,gaps.length===0,gaps);
  info(`${tag}: page frames whose largest empty band is 25% of the screen or more`,pages.filter(r=>r.band>=.25).map(r=>`${r.key}#${r.index}: ${Math.round(r.band*100)}%`));
  const breaks=rows.filter(r=>r.key==='facebook/breaks');
  if(breaks.length)check(`${tag} facebook/breaks: no Pular on screen and Anúncio · 0:08 shown`,!breaks.some(r=>/\bPular\b/.test(r.text))&&breaks.some(r=>r.text.includes('Anúncio · 0:08')));
  const tt=rows.filter(r=>r.key==='tiktok/infeed'),last=tt.filter(r=>r.scene==='page').at(-1);
  if(tt.length)check(`${tag} tiktok/infeed: Revisão, the bank with Face ID and Pagamento aprovado on screen`,tt.some(r=>r.scene==='page'&&/Revisão/.test(r.text))&&tt.some(r=>r.scene==='banco'&&/Face ID/.test(r.text))&&tt.some(r=>/Pagamento aprovado/.test(r.text)),tt.map(r=>r.scene).join(','));
  if(tt.length)check(`${tag} tiktok/infeed: the cart badge ends at 0`,Boolean(last&&last.badges.length&&last.badges.every(b=>b.zero&&b.text==='0')),last?.badges);
}

try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}assert(up,'server reachable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});

  // Sources: no placeholder, no brand name typed by hand, nothing of the old collection.
  {
    const src=Object.fromEntries(await Promise.all(FILES.map(async f=>[f,await readFile(f,'utf8')])));
    const grep=FILES.flatMap(f=>src[f].split('\n').map((l,i)=>[f,i+1,l]).filter(([, ,l])=>/aparecem aqui|\[RT|Exemplo[ ,<]|Canal Exemplo|Página que você segue|cliente_12|0000-0000|\(11\) 9000/.test(l)).map(([f,i])=>`${f}:${i}`));
    check('Sources: no placeholder line (aparecem aqui, [RT, Exemplo, Canal Exemplo, Página que você segue, cliente_12, 0000-0000, (11) 9000)',grep.length===0,grep);
    const {CLIENTES}=await import(new URL('../public/assets/showcase/marcas.js',import.meta.url));
    const names=[...new Set(Object.values(CLIENTES).flatMap(c=>[c.marca,c.curta]))];
    const typed=FILES.flatMap(f=>names.filter(n=>new RegExp(`(^|[^\\p{L}\\p{N}_])${n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?![\\p{L}\\p{N}_])`,'u').test(src[f])).map(n=>`${f}: ${n}`));
    check('Sources: no brand name or short name typed literally (they come from marcas.js)',typed.length===0,typed);
    const shipped=await Promise.all(SHIPPED.map(async f=>[f,/f[a]tos/i.test(await readFile(f,'utf8'))]));
    check('Shipped files of this package never mention the old studio',shipped.every(([,hit])=>!hit),shipped.filter(([,hit])=>hit).map(([f])=>f));
  }

  // Data, in the page: images, credits, fronts, descriptions, orders and the search channel.
  {
    const {context,page}=await open({width:390,height:844});
    const data=await page.evaluate(async keys=>{
      const m=await import('/assets/showcase/campaign-channels.js');
      const img=Object.entries(m.IMG).map(([k,src])=>({k,src:String(src?.src??src),meta:m.IMG_META[k]}));
      const arts=m.channels.filter(c=>!c.art||!c.art.formato||!c.art.cta).map(c=>c.id);
      const descs=[],orders={},texts={};
      for(const c of m.channels)for(const p of c.placements){
        const key=c.id+'/'+p.id,html=m.renderMock(p),text=html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
        if(keys.includes(key)){texts[key]=text;for(const [i,q] of p.quadros.entries()){const d=q.desc||'';if(!d||d.length>140||/\b(token|estado|quadro|data-|hs\d)\b/i.test(d))descs.push(`${key}#${i} (${d.length}): ${d}`);}}
        for(const n of new Set([...text.matchAll(/Pedido (?:n[ºo°] ?)?#?(\d{3,})/g)].map(x=>x[1])))(orders[n]||=[]).push(key);
      }
      const google=m.channelById('google').placements.map(p=>m.renderMock(p)).join(' ');
      return {img,arts,descs,orders,texts,portal:/Portal Exemplo/.test(google)};
    },KEYS);
    check('No IMG key points at the old collection or at a file of the old studio',data.img.every(x=>!OLD_IMAGES.test(x.src)),data.img.filter(x=>OLD_IMAGES.test(x.src)).map(x=>x.k));
    check('Every IMG key has IMG_META with src, a credit or null, and ia false',data.img.every(x=>x.meta&&x.meta.src&&x.meta.ia===false&&(x.meta.credito===null||typeof x.meta.credito==='string')),data.img.filter(x=>!x.meta||x.meta.ia!==false).map(x=>x.k));
    const missing=[];for(const x of data.img){const r=await page.request.get(new URL(x.src,base+'/').href);if(!r.ok())missing.push(`${x.k}: ${r.status()} ${x.src}`);}
    check('Every IMG file answers 200',missing.length===0,missing);
    check('Every channel.art has formato and cta',data.arts.length===0,data.arts);
    check('Every desc of the 14 formats is visible copy of at most 140 characters, without internal words',data.descs.length===0,data.descs);
    const dupes=Object.entries(data.orders).filter(([,list])=>list.length>1);
    check('Rendered mocks never give the same Pedido number to two different purchases',dupes.length===0,dupes);
    info('Order numbers by format',data.orders);
    const holes=Object.entries(data.texts).filter(([,t])=>PLACEHOLDER.test(t)).map(([k,t])=>`${k}: ${t.match(PLACEHOLDER)[0]}`);
    check('Rendered HTML of the 14 formats has no placeholder text',holes.length===0,holes);
    check('The google channel never shows Portal Exemplo',!data.portal);
    // Old search formats this package keeps until the search package lands: LinkedIn pages and the ChatGPT thinking line.
    await peel(page,'linkedin');
    await go(page,'linkedin/feed');
    const grid=[];for(let i=1;i<=3;i++){await next(page);await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);await page.waitForTimeout(120);
      grid.push(await page.evaluate(()=>[...document.querySelectorAll('#laboratorio [data-cx-stage] .cm-doc-page .cm-skel i')].some(i=>getComputedStyle(i).display==='grid')));}
    check('390 linkedin/feed frames 1-3: the document pages never draw a grid of skeleton lines',grid.every(x=>!x),grid);
    await go(page,'chatgpt/answer');await page.waitForTimeout(200);
    check('390 chatgpt/answer frame 0: no second thinking line visible',await page.evaluate(()=>[...document.querySelectorAll('#laboratorio [data-cx-stage] .cm-gpt-think2')].every(e=>{const s=getComputedStyle(e);return s.display==='none'||s.visibility==='hidden'||Number(s.opacity)<.05;})));
    await context.close();
  }

  // Every frame of the 14 formats at 390 x 844 and 1440 x 900.
  for(const [width,height] of (process.env.VIEWS||'390x844,1440x900').split(',').map(v=>v.split('x').map(Number))){
    const tag=`${width}x${height}`;
    const {context,page}=await open({width,height});
    await peel(page,'instagram');
    const placements=await page.evaluate(async keys=>{const m=await import('/assets/showcase/campaign-channels.js');return Object.fromEntries(keys.map(k=>{const p=m.placementByKey(k);return [k,{passos:p.passos.map(x=>({quadros:x.quadros}))}];}));},KEYS);
    const rows=await walk(page,KEYS);
    frameChecks(tag,rows,placements);
    (report.frames||={})[tag]=rows.map(r=>({...r,text:r.text.slice(0,240)}));
    info(`${tag}: frames walked`,rows.length);
    if(width===390){
      const bad=[];
      for(const key of VIDEO_KEYS){const list=rows.filter(r=>r.key===key);if(!list.some(r=>r.videos.some(v=>v.on&&v.muted&&v.inline&&v.poster)))bad.push(key);}
      check('390: the video formats show a <video muted playsinline> with a poster in the scene',bad.length===0,bad);
      info('Formats that move licensed photos instead of a video (no licensed clip of the theme)',KEYS.filter(k=>!VIDEO_KEYS.includes(k)&&!['instagram/feed','instagram/story','instagram/explorar','facebook/feed','facebook/post','blog/article'].includes(k)));
    }
    await page.screenshot({path:`${output}/${tag}.png`});
    await context.close();
  }

  // With motion: the video plays only while its scene is on screen.
  {
    const {context,page}=await open({width:1440,height:900},{reduced:false});
    await peel(page,'instagram');
    const out={};
    for(const key of VIDEO_KEYS){
      await go(page,key);
      const played=await page.waitForFunction(()=>{const s=document.querySelector('#laboratorio [data-cx-stage] .cm-screen'),on=s?.querySelector('.cm-scene[data-pos="on"]');return [...(on?.querySelectorAll('video')||[])].some(v=>!v.paused);},null,{timeout:6000}).then(()=>true,()=>false);
      const count=Number(await page.locator('#laboratorio [data-cx-stage]').getAttribute('data-frames'));
      let offPaused=true,steps=0;
      for(let i=1;i<count;i++){
        await next(page);await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);await page.waitForTimeout(150);steps++;
        const ok=await page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage] .cm-screen'),on=s.querySelector('.cm-scene[data-pos="on"]');return [...s.querySelectorAll('video')].every(v=>on&&on.contains(v)||v.paused);});
        if(!ok)offPaused=false;
      }
      out[key]={played,offPaused,steps};
    }
    check('Motion: each video starts while its scene is on screen',Object.values(out).every(x=>x.played),out);
    check('Motion: videos outside the scene on screen stay paused',Object.values(out).every(x=>x.offPaused),out);
    await context.close();
  }

  check('No JavaScript errors',report.errors.length===0,report.errors);
  check('No console errors',report.console.length===0,[...new Set(report.console)].slice(0,20));
  check('No 404 or other HTTP error during the walk',report.missing.length===0,[...new Set(report.missing)].slice(0,20));
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
const failed=report.checks.filter(c=>!c.pass);
console.log(`[campaign-flows] ${report.checks.length-failed.length} passed, ${failed.length} failed`);
if(failed.length)throw new Error('Campaign flow checks failed: '+failed.map(c=>c.name).join('; '));
