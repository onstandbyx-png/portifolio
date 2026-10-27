// Frame engine and responsive device (frame-engine.js, experience-player.js, vitrine-lab.js).
// Runs against BASE_URL, or spawns server.mjs on PORT (default 4196). Writes qa/player-engine/results.json.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/player-engine',port=process.env.PORT||'4196';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const report={checks:[],info:[],errors:[]};let browser;
const check=(name,pass,detail)=>{report.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',name,detail!==undefined?JSON.stringify(detail):'');};
const info=(name,value)=>{report.info.push({name,value});console.log('INFO',name,JSON.stringify(value));};
await mkdir(output,{recursive:true});

async function open(viewport,{reduced=true,hash=''}={}){
  const context=await browser.newContext({viewport,isMobile:viewport.width<800,hasTouch:viewport.width<800,reducedMotion:reduced?'reduce':'no-preference',deviceScaleFactor:1});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  page.on('pageerror',error=>report.errors.push(`${viewport.width}x${viewport.height}: ${error}`));
  await page.goto(base+'/'+hash,{waitUntil:'load'});
  // O laboratório monta perto da tela (static-init.js); o link direto já o carrega.
  if(!hash)await page.evaluate(()=>document.querySelector('#laboratorio').scrollIntoView({behavior:'instant'}));
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
const rect=(page,selector)=>page.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,right:r.right,bottom:r.bottom};},selector);
/* Frame measures inside the page: dot against text and finger, small text share. */
const measure=page=>page.evaluate(async()=>{
  const m=await import('/assets/showcase/campaign-channels.js');
  const player=document.querySelector('#laboratorio .cx-player'),stage=player.querySelector('[data-cx-stage]'),screen=stage.querySelector('.cm-screen');
  const pl=m.channelById(player.dataset.platform).placements.find(p=>p.id===player.dataset.placement);
  const index=Number(screen.dataset.frame),item=pl.quadros[index],state=(screen.dataset.state||'').split(' ');
  const tela=stage.querySelector('.ch-iphone-tela').getBoundingClientRect();
  const opaque=(node)=>{for(let el=node;el&&el!==screen;el=el.parentElement){const s=getComputedStyle(el);if(s.display==='none'||Number(s.opacity)<.05)return false;}return getComputedStyle(node).visibility==='visible';};
  const walker=document.createTreeWalker(screen,NodeFilter.SHOW_TEXT),range=document.createRange(),texts=[];let small=0,total=0;
  const active=screen.querySelector('.cm-scene[data-pos="on"]');
  for(let n=walker.nextNode();n;n=walker.nextNode()){
    if(!n.data.trim()||!n.parentElement||!opaque(n.parentElement))continue;
    range.selectNodeContents(n);const rs=[...range.getClientRects()].filter(r=>r.width>0&&r.height>0&&r.right>tela.left&&r.left<tela.right&&r.bottom>tela.top&&r.top<tela.bottom);
    if(!rs.length)continue;texts.push(...rs);
    if(active&&active.contains(n)){total++;if(parseFloat(getComputedStyle(n.parentElement).fontSize)<9)small++;}
  }
  const dot=stage.querySelector('[data-cx-dot]'),tap=stage.querySelector('[data-cx-tap]');
  const dotShown=dot&&!dot.hidden;let crossesText=false,crossesTap=false,insideTela=true;
  if(dotShown){
    const d=dot.getBoundingClientRect(),x=d.left+d.width/2,y=d.top+d.height/2,R=12.5;
    const crosses=r=>{const dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom);return dx*dx+dy*dy<R*R;};
    crossesText=texts.some(crosses);
    if(tap&&!tap.hidden)crossesTap=crosses(tap.getBoundingClientRect());
    insideTela=x-R>=tela.left-1&&x+R<=tela.right+1&&y-R>=tela.top-1&&y+R<=tela.bottom+1;
  }
  return {key:player.dataset.platform+'/'+player.dataset.placement,index,count:pl.quadros.length,toque:Boolean(item?.toque),final:state.includes('done')||state.includes('aviso'),dotShown,crossesText,crossesTap,insideTela,small,total};
});
async function walkFrames(page,keys,{onFrame}={}){
  const rows=[];
  for(const key of keys){
    const [channel,placement]=key.split('/');
    await page.evaluate(({channel,placement})=>window.dispatchEvent(new CustomEvent('cx:abrir',{detail:{canal:channel,formato:placement}})),{channel,placement});
    await page.waitForFunction(({channel,placement})=>{const p=document.querySelector('#laboratorio .cx-player');return p?.dataset.platform===channel&&p.dataset.placement===placement&&p.querySelector('.cm-screen')?.dataset.frame==='0';},{channel,placement});
    await page.locator('#laboratorio [data-cx-stage]').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
    const count=Number(await page.locator('#laboratorio [data-cx-stage]').getAttribute('data-frames'));
    for(let i=0;i<count;i++){
      if(i)await page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage]');s.focus({preventScroll:true});s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});
      await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);
      await page.waitForTimeout(90);
      const row=await measure(page);rows.push(row);onFrame?.(row);
    }
  }
  return rows;
}
const allKeys=async page=>page.evaluate(async()=>{const m=await import('/assets/showcase/campaign-channels.js');return m.channels.flatMap(c=>c.placements.map(p=>c.id+'/'+p.id));});

try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}assert(up,'server reachable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});

  // 1440 x 900: the card and the live panel fill the row; big phone; focus and return control.
  {
    const {context,page}=await open({width:1440,height:900});
    await page.locator('#laboratorio [data-sp-tab="instagram"]').click();
    const card=page.locator('#laboratorio .sp-campaign-card');
    await card.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-90,behavior:'instant'}));
    await page.locator('#laboratorio [data-peel-grip]').click();
    await page.waitForFunction(()=>document.querySelector('#laboratorio .sp-campaign-card').dataset.peelState==='open');
    check('1440: focus moves to the first format after the peel',await page.evaluate(()=>document.activeElement?.matches('.cx-placement')));
    const side=await rect(page,'#laboratorio .cx-side'),cardR=await rect(page,'#laboratorio .sp-peel-card'),layout=await rect(page,'#laboratorio .sp-peel-layout');
    check('1440: the panel is visible and at least 360px wide',side&&side.w>=360&&side.h>0,side);
    check('1440: card and panel take at least 90% of the row',cardR.w+side.w>=.9*layout.w,{card:cardR.w,side:side.w,layout:layout.w});
    check('1440: no child of the panel is display:none',await page.locator('#laboratorio .cx-side').evaluate(el=>[...el.children].every(c=>getComputedStyle(c).display!=='none')));
    const tela=await rect(page,'#laboratorio [data-cx-stage] .ch-iphone-tela'),phone=await rect(page,'#laboratorio [data-cx-stage] .ch-iphone');
    check('1440: phone screen at least 360px wide and the phone fits the height minus 48px',tela.w>=360&&phone.h<=900-48,{tela:tela.w,phone:phone.h});
    const ret=await rect(page,'#laboratorio .sp-peel-return');
    check('1440: Ver a peça is visible, at least 44 x 44',ret&&ret.w>=44&&ret.h>=44&&await page.locator('#laboratorio .sp-peel-return').isVisible(),ret);
    check('1440: the panel shows Na tela and the journey',await page.locator('#laboratorio .cx-side [data-cx-box="tela"]').count()===1&&await page.locator('#laboratorio .cx-side [data-cx-journey] li').count()===3);
    // Ampliar: the same phone moves into a full-screen dialog; Esc brings it back with the focus.
    await page.locator('#laboratorio [data-cx-ampliar]:visible').first().click();
    await page.waitForFunction(()=>document.querySelector('#laboratorio [data-cx-zoom]')?.open);
    const zoomed=await page.evaluate(()=>{const p=document.querySelector('[data-cx-zoom] .ch-iphone');return p?p.getBoundingClientRect().height:0;});
    check('1440: Ampliar opens a dialog with the phone at 90% of the height or more',zoomed>=.9*900,zoomed);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#laboratorio [data-cx-zoom]').open);
    check('1440: Esc returns the phone to the stage and the focus to Ampliar',await page.evaluate(()=>Boolean(document.querySelector('#laboratorio [data-cx-stage] .ch-iphone'))&&document.activeElement?.matches('[data-cx-ampliar]')));
    // Sites e lojas: no fixed indexes; big phone with the panel beside it.
    const source=await readFile('public/assets/showcase/vitrine-lab.js','utf8');
    check('#editorial: DEMOS have no from/to numbers',(source.match(/from:/g)||[]).length===0);
    const vroot=page.locator('[data-vitrine="sites"]');await vroot.scrollIntoViewIfNeeded();await page.waitForTimeout(200);
    const vphone=await rect(page,'[data-vitrine="sites"] .ch-iphone'),vside=await rect(page,'[data-vitrine="sites"] .vitrine-side');
    check('#editorial 1440: phone at least 360px wide with the steps panel beside it',vphone.w>=360&&vside.x>=vphone.right-1&&vside.y<vphone.bottom,{vphone,vside});
    await page.locator('[data-vitrine="sites"] [data-modo="computador"]').click();
    check('#editorial 1440: Computador shows the same site in a desktop browser',await page.locator('[data-vitrine="sites"] .vitrine-desk .cm-screen').count()===1);
    await page.screenshot({path:`${output}/1440.png`});
    await context.close();
  }

  // Deep link and cx:abrir.
  {
    const {context,page}=await open({width:390,height:844},{hash:'#laboratorio/instagram/reels'});
    await page.waitForFunction(()=>document.querySelector('#laboratorio .cx-player')?.dataset.placement==='reels',null,{timeout:8000}).catch(()=>{});
    check('Deep link #laboratorio/instagram/reels presses Reels and starts at frame 0',await page.evaluate(()=>{const p=document.querySelector('#laboratorio .cx-player');const b=[...document.querySelectorAll('#laboratorio [data-cx-placement]')].find(x=>x.getAttribute('aria-pressed')==='true');return p.dataset.platform==='instagram'&&p.dataset.placement==='reels'&&/Reels|Reel/.test(b?.getAttribute('aria-label')||b?.textContent||'')&&p.querySelector('.cm-screen').dataset.frame==='0'&&document.querySelector('#laboratorio .sp-campaign-card').dataset.side==='back';}));
    await page.goto(base+'/#laboratorio/tiktok/infeed');
    await page.waitForFunction(()=>document.querySelector('#laboratorio .cx-player')?.dataset.platform==='tiktok',null,{timeout:8000}).catch(()=>{});
    check('Deep link #laboratorio/tiktok/infeed opens TikTok In-Feed at frame 0',await page.evaluate(()=>{const p=document.querySelector('#laboratorio .cx-player');return p.dataset.platform==='tiktok'&&p.dataset.placement==='infeed'&&p.querySelector('.cm-screen').dataset.frame==='0';}));
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('cx:abrir',{detail:{canal:'whatsapp',formato:'catalog'}})));
    await page.waitForTimeout(200);
    check('cx:abrir opens the asked channel and format',await page.evaluate(()=>{const p=document.querySelector('#laboratorio .cx-player');return p.dataset.platform==='whatsapp'&&p.dataset.placement==='catalog'&&document.querySelector('#laboratorio [data-cx-placement][aria-pressed="true"]')?.dataset.cxPlacement==='1';}));
    await context.close();
  }

  // 390 x 844: phone size, tiles, formats row, one-format channel, every frame of every format.
  {
    const {context,page}=await open({width:390,height:844});
    check('390: format counters on the tiles are at least 12px',await page.locator('#laboratorio .sp-tab-count').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=12));
    await peel(page,'whatsapp');
    const tela=await rect(page,'#laboratorio [data-cx-stage] .ch-iphone-tela');
    check('390: phone screen at least 340px wide',tela.w>=340,tela.w);
    const row=await page.evaluate(async()=>{
      const r=document.querySelector('#laboratorio [data-cx-placements]'),buttons=[...r.querySelectorAll('[data-cx-placement]')],out={reach:true,pressed:true,mask:true,curto:true};
      const m=await import('/assets/showcase/campaign-channels.js'),pls=m.channelById('whatsapp').placements;
      for(const [i,b] of buttons.entries()){
        b.scrollIntoView({inline:'nearest',block:'nearest',behavior:'instant'});await new Promise(x=>requestAnimationFrame(x));
        const a=b.getBoundingClientRect(),c=r.getBoundingClientRect();if(a.left<c.left-1||a.right>c.right+1)out.reach=false;
        if(r.clientWidth<420&&pls[i].curto&&b.textContent.trim()!==pls[i].curto)out.curto=false;
      }
      buttons.at(-1).click();await new Promise(x=>setTimeout(x,700));
      const on=r.querySelector('[aria-pressed="true"]').getBoundingClientRect(),c=r.getBoundingClientRect();
      out.pressed=on.left>=c.left-1&&on.right<=c.right+1;
      r.scrollLeft=0;r.dispatchEvent(new Event('scroll'));await new Promise(x=>setTimeout(x,50));
      if(r.scrollWidth>r.clientWidth+1)out.mask=getComputedStyle(r).maskImage!=='none'||getComputedStyle(r).webkitMaskImage!=='none';
      return out;
    });
    check('390 WhatsApp: every format is reachable inside the row',row.reach);
    check('390 WhatsApp: the pressed format is fully visible',row.pressed);
    check('390 WhatsApp: the row shows a fade when it scrolls',row.mask);
    check('390 WhatsApp: short labels under 420px when the format has one',row.curto);
    await peel(page,'voz');
    check('Channel with one format (voz): no thumb and "Formato:" visible',await page.locator('#laboratorio [data-cx-placements] .cx-thumb').count()===0&&await page.locator('#laboratorio .cx-formato-unico').isVisible()&&/Formato: /.test(await page.locator('#laboratorio .cx-formato-unico').innerText()));
    const keys=await allKeys(page);
    const rows=await walkFrames(page,keys);
    const bad=rows.filter(r=>r.dotShown&&(r.crossesText||r.crossesTap||!r.insideTela)).map(r=>`${r.key}#${r.index}`);
    check('390: in every frame of every format the point crosses no text, no finger and stays on the screen',bad.length===0,bad.slice(0,30));
    const shownWrong=rows.filter(r=>(r.toque||r.final)&&r.dotShown).map(r=>`${r.key}#${r.index}`);
    check('390: the point hides on tap frames and on done or aviso',shownWrong.length===0,shownWrong);
    const steps=rows.filter(r=>r.dotShown).length;info('390: frames with the point visible',`${steps} of ${rows.length}`);
    for(const key of ['instagram/feed','whatsapp/ctwa','voz/ligacao']){
      const list=rows.filter(r=>r.key===key),worst=Math.max(...list.map(r=>r.total?r.small/r.total:0));
      check(`390 ${key}: at most 10% of the visible text under 9px in every frame`,worst<=.10,Math.round(worst*100)+'%');
    }
    await page.screenshot({path:`${output}/390.png`});
    await context.close();
  }

  // 320 x 568 and 844 x 390: phone height and legibility of three formats.
  for(const [width,height] of [[320,568],[844,390]]){
    const {context,page}=await open({width,height});
    await peel(page,'instagram');
    const phone=await rect(page,'#laboratorio [data-cx-stage] .ch-iphone');
    // Short landscape: the phone keeps a legible width (it no longer shrinks to the 390px height) beside the panel.
    if(width===844)check('844x390: the phone keeps at least 280px of width, beside the panel',phone.w>=280&&(await rect(page,'#laboratorio .cx-side')).x>=phone.right-1,{w:phone.w,h:phone.h});
    else info('320x568: phone height (under 360px the phone takes the width, critic 9)',phone.h);
    const rows=await walkFrames(page,['instagram/feed','whatsapp/ctwa','voz/ligacao']);
    for(const key of ['instagram/feed','whatsapp/ctwa','voz/ligacao']){
      const worst=Math.max(...rows.filter(r=>r.key===key).map(r=>r.total?r.small/r.total:0));
      check(`${width}x${height} ${key}: at most 25% of the visible text under 9px in every frame`,worst<=.25,Math.round(worst*100)+'%');
    }
    await page.screenshot({path:`${output}/${width}x${height}.png`});
    await context.close();
  }

  // Engine units with motion: the clock and the transition vocabulary.
  {
    const {context,page}=await open({width:1440,height:900},{reduced:false});
    // Engine units: the clock and the transition vocabulary.
    const units=await page.evaluate(async()=>{
      const e=await import('/assets/showcase/frame-engine.js'),m=await import('/assets/showcase/campaign-channels.js');
      const host=document.createElement('div');host.className='lab-escopo';host.style.cssText='position:fixed;left:0;top:0;width:300px;opacity:.01;pointer-events:none';
      host.innerHTML=m.renderMock(m.placementByKey('instagram/feed'));document.body.append(host);
      const screen=host.querySelector('.cm-screen'),clock=host.querySelector('.ch-iphone-hora');
      e.setStatusTime(screen,[{cena:'ad'},{cena:'ad',hora:'10:13'}],1);const a=clock.textContent;
      e.setStatusTime(screen,[{cena:'ad'},{cena:'ad'}],1);const b=clock.textContent;
      host.remove();
      const kinds=['push','sheet','switch','modal','fade'],sig={};
      for(const kind of kinds){
        const box=document.createElement('div');box.className='lab-escopo';box.style.cssText='position:fixed;left:0;top:0;width:300px;height:600px';
        box.innerHTML=`<div class="ch-iphone-ui" style="position:relative;width:300px;height:600px"><div class="cm-screen"><div class="cm-scene" data-scene="a" data-kind="base"></div><div class="cm-scene" data-scene="b" data-kind="${kind}"></div></div></div>`;
        document.body.append(box);const s=box.querySelector('.cm-screen'),list=[{cena:'a',ms:1000},{cena:'b',ms:1000}];
        e.applyFrame(s,list,0,{instant:true});await new Promise(r=>{const t=()=>s.classList.contains('is-instant')?requestAnimationFrame(t):r();t();});getComputedStyle(box.querySelector('.cm-scene[data-scene="b"]')).transform;
        e.applyFrame(s,list,1);await new Promise(r=>requestAnimationFrame(r));
        const anims=box.querySelector('.cm-scene[data-scene="b"]').getAnimations().map(x=>({p:x.transitionProperty||x.animationName,d:x.effect.getTiming().duration,e:x.effect.getTiming().easing}));
        sig[kind]=anims.filter(x=>x.p!=='visibility');box.remove();
      }
      return {a,b,sig};
    });
    check('Engine: a frame with hora 10:13 sets the status-bar clock',units.a==='10:13',units.a);
    check('Engine: without hora the clock returns to the time the phone was drawn with',/^\d{1,2}:\d{2}$/.test(units.b)&&units.b!=='10:13',units.b);
    const signatures=Object.entries(units.sig).map(([k,list])=>[k,JSON.stringify(list.map(x=>[x.p,x.d]).sort())]);
    check('Motion: each scene kind animates for 240 to 450 ms',Object.values(units.sig).every(list=>list.length&&list.every(x=>x.d>=240&&x.d<=450)),units.sig);
    check('Motion: every scene kind has a distinct animation signature',new Set(signatures.map(([,s])=>s)).size===signatures.length,signatures);
    await context.close();
  }

  // Reading time with motion: each frame stays at least 260 ms per new word (capped at 9 s unless ms asks more).
  {
    const {context,page}=await open({width:1440,height:900},{reduced:false});
    await peel(page,'google');
    await page.evaluate(()=>{window.__frames=[];const screen=()=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen');let last=null;new MutationObserver(()=>{const s=screen();if(!s)return;const f=s.dataset.frame;if(f!==last){last=f;window.__frames.push({f:Number(f),t:performance.now()});}}).observe(document.querySelector('#laboratorio [data-cx-body]'),{attributes:true,subtree:true,attributeFilter:['data-frame']});
      window.__words={};new MutationObserver(()=>{const s=screen();if(s?.dataset.palavras)window.__words[s.dataset.frame]={w:Number(s.dataset.palavras),ms:Number(s.dataset.quadroMs)};}).observe(document.querySelector('#laboratorio [data-cx-body]'),{attributes:true,subtree:true,attributeFilter:['data-palavras','data-quadro-ms']});});
    await page.evaluate(()=>{window.__frames=[];window.dispatchEvent(new CustomEvent('cx:abrir',{detail:{canal:'google',formato:'search'}}));});
    const count=Number(await page.locator('#laboratorio [data-cx-stage]').getAttribute('data-frames'));
    await page.waitForFunction(n=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(n-1),count,{timeout:90000});
    const timing=await page.evaluate(()=>({frames:window.__frames,words:window.__words}));
    const durations=timing.frames.slice(0,-1).map((x,i)=>({f:x.f,ms:timing.frames[i+1].t-x.t,need:Math.min(9000,260*(timing.words[x.f]?.w||0)),w:timing.words[x.f]?.w}));
    info('Reading time (Google Ads, Pesquisa)',durations);
    check('Reading time: every frame stays at least 260 ms per new word and 1.4 s',durations.length>0&&durations.every(d=>d.ms>=Math.max(1400,d.need)-150),durations);
    await context.close();
  }

  // Fronts of the channels (data of WP3 and WP7): no two share an image.
  {
    const {context,page}=await open({width:390,height:844});
    const dupes=await page.evaluate(()=>{const seen={},out=[];document.querySelectorAll('#laboratorio .sp-campaign-panel img').forEach(img=>{const src=img.getAttribute('src');if(seen[src])out.push(src);seen[src]=1;});return out;});
    info('Channel fronts that share an image (to be replaced by the asset packages)',dupes);
    check('Images created by the player and the tiles are lazy and low priority',await page.evaluate(()=>[...document.querySelectorAll('#laboratorio .sp-campaign-panel img')].every(i=>i.loading==='lazy'&&i.decoding==='async'&&i.getAttribute('fetchpriority')==='low')));
    await context.close();
  }
  check('No JavaScript errors',report.errors.length===0,report.errors);
}finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
const failed=report.checks.filter(c=>!c.pass);
console.log(`[player-engine] ${report.checks.length-failed.length} passed, ${failed.length} failed`);
if(failed.length)throw new Error('Player engine checks failed: '+failed.map(c=>c.name).join('; '));
