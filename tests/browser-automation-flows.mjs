// The eight deep automations (automation-flows.js, automation-mocks.css, pix-kit.js) and their failure paths.
// Checks the sources, the data of every frame (log with time and type, backstage outside the phone, the call
// lines and the optional audio), walks every frame of the eight flows in the campaign player at 390x844 and
// 1440x900, renders the five failure paths frame by frame and checks the call motion (live timer, the wave,
// the scene that grows out of the island). Runs against BASE_URL, or spawns server.mjs on PORT (default 4199).
// Writes qa/automation-flows/results.json.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const output='qa/automation-flows',port=process.env.PORT||'4199';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const report={checks:[],info:[],errors:[],console:[],missing:[]};let browser;
const check=(name,pass,detail)=>{report.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',name,detail!==undefined?JSON.stringify(detail).slice(0,900):'');};
const info=(name,value)=>{report.info.push({name,value});console.log('INFO',name,JSON.stringify(value).slice(0,600));};
await mkdir(output,{recursive:true});

const ALL=['whatsapp/agente','whatsapp/chamada','instagram/direct','telegram/clube','rcs/conversa','voz/ligacao','pix/recorrencia','email/regua'];
const KEYS=process.env.ONLY?ALL.filter(k=>process.env.ONLY.split(',').includes(k)):ALL;
const FALHAS=['whatsapp/agente-falha','voz/ligacao-falha','rcs/conversa-falha','pix/recorrencia-falha','email/regua-falha'];
const TIPOS=['anuncio','webhook','ia','ferramenta','pessoa','pagamento','crm','sinal','permissao','turno','agenda','retentativa','assinatura','grupo','email','descadastro','sistema'];
const PLACEHOLDER=/aparecem aqui|\[RT|\bExemplo\b|0000-0000|\(11\) 9000|Lorem|\bundefined\b|\bNaN\b|\[object Object\]/;
const FILE='public/assets/showcase/automation-flows.js';
const SHIPPED=[FILE,'public/assets/showcase/automation-mocks.css','public/assets/showcase/pix-kit.js'];

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
async function go(page,key){
  const [canal,formato]=key.split('/');
  await page.evaluate(({canal,formato})=>window.dispatchEvent(new CustomEvent('cx:abrir',{detail:{canal,formato}})),{canal,formato});
  await page.waitForFunction(({canal,formato})=>{const p=document.querySelector('#laboratorio .cx-player');return p?.dataset.platform===canal&&p.dataset.placement===formato&&p.querySelector('.cm-screen')?.dataset.frame==='0';},{canal,formato});
  await page.waitForTimeout(400);
  const card=page.locator('#laboratorio .sp-campaign-card');
  if(await card.getAttribute('data-peel-state')==='closed'){await card.evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-90,behavior:'instant'}));await page.locator('#laboratorio [data-peel-grip]').click();await page.waitForTimeout(600);}
  await page.locator('#laboratorio [data-cx-stage]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
}
const next=page=>page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage]');s.focus({preventScroll:true});s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});

/* One frame, measured in the page: visible text of the scene on screen, backstage leaks, timers, the point. */
const measure=page=>page.evaluate(()=>{
  const player=document.querySelector('#laboratorio .cx-player'),stage=player.querySelector('[data-cx-stage]'),screen=stage.querySelector('.cm-screen');
  const tela=stage.querySelector('.ch-iphone-tela').getBoundingClientRect(),phone=stage.querySelector('.ch-iphone');
  const on=screen.querySelector('.cm-scene[data-pos="on"]');
  const opaque=node=>{for(let el=node;el&&el!==screen.parentElement;el=el.parentElement){const s=getComputedStyle(el);if(s.display==='none'||Number(s.opacity)<.05)return false;}return getComputedStyle(node).visibility==='visible';};
  const inside=r=>r.width>0&&r.height>0&&r.right>tela.left+1&&r.left<tela.right-1&&r.bottom>tela.top+1&&r.top<tela.bottom-1;
  const shown=el=>opaque(el)&&inside(el.getBoundingClientRect());
  const walker=document.createTreeWalker(screen,NodeFilter.SHOW_TEXT),range=document.createRange(),words=[];
  for(let n=walker.nextNode();n;n=walker.nextNode()){if(!n.data.trim()||!n.parentElement||!opaque(n.parentElement))continue;range.selectNodeContents(n);if([...range.getClientRects()].some(inside))words.push(n.data.trim());}
  const dot=stage.querySelector('[data-cx-dot]'),index=Number(screen.dataset.frame),state=(screen.dataset.state||'').split(' ').filter(Boolean);
  return {key:player.dataset.platform+'/'+player.dataset.placement,index,scene:on?.dataset.scene||'',state,text:words.join(' '),
    leaks:[...screen.querySelectorAll('.cm-scene .au-tool,.cm-scene .au-summary,.cm-scene .au-caps')].length,
    legendas:/Legendas ao vivo/i.test(phone.textContent),
    tempos:[...screen.querySelectorAll('.au-tempo')].filter(shown).map(t=>t.textContent.trim()),
    face:[...screen.querySelectorAll('.au-face')].some(shown),
    hora:phone.querySelector('.ch-iphone-hora')?.textContent.trim()||'',
    dotShown:Boolean(dot&&!dot.hidden),toque:false,final:state.includes('done')||state.includes('aviso')};
});
async function walk(page,keys){
  const rows=[];
  for(const key of keys){
    await go(page,key);
    const count=Number(await page.locator('#laboratorio [data-cx-stage]').getAttribute('data-frames'));
    const quadros=await page.evaluate(async key=>{const m=await import('/assets/showcase/campaign-channels.js');return m.placementByKey(key).quadros.map(q=>({toque:Boolean(q.toque),fala:Boolean(q.fala?.length)}));},key);
    for(let i=0;i<count;i++){
      if(i)await next(page);
      await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);
      await page.waitForTimeout(120);
      let row=await measure(page);row.toque=quadros[i]?.toque;row.fala=quadros[i]?.fala;
      for(let t=0;t<5&&!row.dotShown&&!row.toque&&!row.final;t++){await page.waitForTimeout(140);row={...row,...await measure(page),toque:row.toque,fala:row.fala};}
      rows.push(row);
    }
  }
  return rows;
}

try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}assert(up,'server reachable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});

  // Sources.
  {
    const src=await readFile(FILE,'utf8');
    const lines=src.split('\n').map((l,i)=>[i+1,l.replace(/[\w-]+\.exemplo\b/g,'')]).filter(([,l])=>/Exemplo|\[RT e CRO\]|BE<\/i>|Banco Exemplo|PSP Exemplo|Legendas ao vivo|Prefere Pix|Mensagem de chat/.test(l)).map(([i])=>`${FILE}:${i}`);
    check('Sources: no Exemplo (except .exemplo domains), [RT e CRO], BE</i>, Legendas ao vivo, Prefere Pix or Mensagem de chat',lines.length===0,lines);
    const {CLIENTES}=await import(new URL('../public/assets/showcase/marcas.js',import.meta.url));
    const names=[...new Set(Object.values(CLIENTES).flatMap(c=>[c.marca,c.curta]))];
    const typed=names.filter(n=>new RegExp(`(^|[^\\p{L}\\p{N}_])${n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?![\\p{L}\\p{N}_])`,'u').test(src));
    check('Sources: no brand name or short name typed literally (they come from marcas.js)',typed.length===0,typed);
    const shipped=await Promise.all(SHIPPED.map(async f=>[f,/f[a]tos/i.test(await readFile(f,'utf8'))]));
    check('Shipped files of this package never mention the old studio',shipped.every(([,hit])=>!hit),shipped.filter(([,hit])=>hit).map(([f])=>f));
    const css=await readFile('public/assets/showcase/automation-mocks.css','utf8');
    check('The CSS no longer draws tool chips, backstage notes or live captions in the phone',!/\.au-(tool|summary|caps|cap)\b/.test(css));
  }

  // Data of every placement, in the page.
  {
    const {context,page}=await open({width:390,height:844});
    const data=await page.evaluate(async ({keys,falhas,tipos})=>{
      const m=await import('/assets/showcase/campaign-channels.js'),pix=await import('/assets/showcase/pix-kit.js');
      const out={logs:[],descs:[],backstage:[],hidden:[],texts:{},scenes:{},audio:{},falas:{},taps:[],brcodes:[]};
      for(const key of [...keys,...falhas]){
        const pl=m.placementByKey(key);if(!pl){out.hidden.push(`${key}: missing`);continue;}
        let last='';
        pl.quadros.forEach((q,i)=>{
          const d=q.desc||'';if(!d||d.length>140||/\b(token|estado|quadro|data-|hs\d)\b/i.test(d))out.descs.push(`${key}#${i} (${d.length}): ${d}`);
          if(q.toque&&(i===0||pl.quadros[i-1].cena!==q.cena))out.taps.push(`${key}#${i}`);
          for(const line of q.log||[]){
            const meta=line[3]||{};
            if(!/^\d\d:\d\d:\d\d$/.test(meta.t||'')||!tipos.includes(meta.tipo))out.logs.push(`${key}#${i} ${JSON.stringify(line)}`);
            const at=`${meta.dia||'2026-10-21'} ${meta.t}`;if(at<last)out.logs.push(`${key}#${i} time goes back: ${last} -> ${at}`);last=at;
            if(meta.bastidor)out.backstage.push(`${key}#${i}: ${meta.bastidor.titulo}`);
          }
          if(q.fala)(out.falas[key]||=[]).push(...q.fala.map(f=>Array.isArray(f)?f:[f.quem,f.texto]));
        });
        const html=m.renderMock(pl),text=html.replace(/<[^>]+>/g,' ').replace(/&#39;/g,"'").replace(/\s+/g,' ');
        out.texts[key]=text;out.scenes[key]=[...html.matchAll(/data-scene="([^"]+)"/g)].map(x=>x[1]);
        if(pl.audio)out.audio[key]={src:pl.audio.src,durationMs:pl.audio.durationMs||Math.round((pl.audio.duracaoS||0)*1000),soma:(pl.audio.segmentos||pl.audio.segments||[]).reduce((a,s)=>Math.max(a,s.endMs),0)};
      }
      // BR Codes in the rendered mocks: the copy-paste text starts like a payload, and the kit's CRC matches the manual.
      const exemplo='00020101021226700014br.gov.bcb.pix2548pix.example.com/8b3da2f39a4140d1a91abd93113bd4415204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***80740014br.gov.bcb.pix2552pix.example.com/rec/2353c790eefb11eaadc10242ac1200026304';
      out.crcManual=pix.crc16(exemplo);
      const auto=pix.brCode({url:'pix.jatoba.exemplo/cob/x',rec:'pix.jatoba.exemplo/rec/y',nome:'Escola'}),campos=pix.lerCampos(auto);
      out.composto={has80:Boolean(campos['80']),has26:Boolean(campos['26']),crcOk:pix.crc16(auto.slice(0,-4))===auto.slice(-4)};
      out.qr=['pix/recorrencia','rcs/conversa'].map(k=>/class="au-qr"[^>]*viewBox="-2 -2 \d+ \d+"/.test(m.renderMock(m.placementByKey(k))));
      out.hiddenKeys=falhas.filter(k=>m.placementByKey(k)?.quadros?.length);
      out.channels=m.channels.filter(c=>['telegram','rcs','voz','pix','email'].includes(c.id)).map(c=>({id:c.id,group:c.group,img:c.art?.img,formato:c.art?.formato,cta:c.art?.cta,ui:Boolean(c.art?.ui)}));
      return out;
    },{keys:ALL,falhas:FALHAS,tipos:TIPOS});
    check('Every log line has t in HH:MM:SS, a type from the vocabulary and time that never goes back (day and time), in every flow and failure path',data.logs.length===0,data.logs);
    check('Every desc is visible copy of at most 140 characters, without internal words',data.descs.length===0,data.descs);
    check('Every tap frame comes after a frame of the same scene, where the button was already on screen',data.taps.length===0,data.taps);
    check('The 5 failure paths exist in hidden (agente, voz, rcs, pix, email)',data.hiddenKeys.length===FALHAS.length,data.hiddenKeys);
    check('The consultant summary is a backstage field of the log, not a bubble',data.backstage.some(b=>b.startsWith('whatsapp/agente#'))&&!/Bastidor/.test(data.texts['whatsapp/agente']),data.backstage);
    const wa=data.texts['whatsapp/agente'];
    check('whatsapp/agente: the text has no colo, só até 1 ano e 11 meses and maio, Face ID and Comprovante de Pix',/no colo, só até 1 ano e 11 meses/.test(wa)&&/maio/.test(wa)&&/Face ID/.test(wa)&&/Comprovante de Pix/.test(wa)&&!/junho/.test(wa));
    const px=data.texts['pix/recorrencia'];
    check('pix/recorrencia: quarta-feira, 4 de novembro and never terça-feira, 4 de novembro; CNPJ, Valor máximo and Cancelar este pagamento',/quarta-feira, 4 de novembro/.test(px)&&!/terça-feira, 4 de novembro/.test(px)&&/CNPJ/.test(px)&&/Valor máximo/.test(px)&&/Cancelar este pagamento/.test(px));
    const rc=data.texts['rcs/conversa'];
    check('rcs/conversa: no Mensagem de chat; the first message says assistente virtual; a bank scene; Mensagem de Texto • RCS',!/Mensagem de chat/.test(rc)&&/assistente virtual/.test(rc.slice(rc.indexOf('Mensagem de Texto • RCS')))&&data.scenes['rcs/conversa'].includes('bank')&&/Mensagem de Texto • RCS/.test(rc));
    const tg=data.texts['telegram/clube'];
    check('telegram/clube: header with grupo, Stars purchase and the welcome in the group, no Prefere Pix',/Clube \S+.*grupo/.test(tg)&&/Estrelas Necessárias/.test(tg)&&/Compra no App/.test(tg)&&/Assinatura concluída!/.test(tg)&&/Boas-vindas/.test(tg)&&!/Prefere Pix/.test(tg)&&data.scenes['telegram/clube'].includes('turma'));
    check('Calls: every turn of voz/ligacao and whatsapp/chamada has its line beside the phone, and the AI says it is an artificial intelligence',['voz/ligacao','whatsapp/chamada'].every(k=>(data.falas[k]||[]).length>=6&&/inteligência artificial/.test(data.falas[k][0][1])),data.falas);
    check('The BR Code of the kit matches the CRC of the Banco Central manual (FB42) and the composite QR has fields 26 and 80',data.crcManual==='FB42'&&data.composto.has26&&data.composto.has80&&data.composto.crcOk,{crc:data.crcManual,...data.composto});
    check('Pix Automático and the PSP page draw a QR from the code (uqr)',data.qr.every(Boolean),data.qr);
    const holes=Object.entries(data.texts).filter(([,t])=>PLACEHOLDER.test(t.replace(/[\w-]+\.exemplo\b/g,''))).map(([k,t])=>`${k}: ${t.replace(/[\w-]+\.exemplo\b/g,'').match(PLACEHOLDER)[0]}`);
    check('Rendered HTML has no placeholder text',holes.length===0,holes);
    check('The five new channels have a front with formato, cta and the native piece (ui); RCS sits in local',data.channels.length===5&&data.channels.every(c=>c.formato&&c.cta&&c.ui)&&data.channels.find(c=>c.id==='rcs')?.group==='local',data.channels);
    // Audio is optional: when a placement declares it, the file answers 200 and the segments match its length.
    const audios=Object.entries(data.audio);info('Placements with recorded audio',audios.map(([k])=>k));
    for(const [k,a] of audios){const r=await page.request.get(new URL(a.src,base+'/').href);check(`${k}: placement.audio.src answers 200 and the segments end within 1 s of durationMs`,r.ok()&&Math.abs(a.soma-a.durationMs)<=1000,{status:r.status(),...a});}
    await context.close();
  }

  // Every frame of the eight flows.
  for(const [width,height] of (process.env.VIEWS||'390x844,1440x900').split(',').map(v=>v.split('x').map(Number))){
    const tag=`${width}x${height}`;
    const {context,page}=await open({width,height});
    const placements=await page.evaluate(async keys=>{const m=await import('/assets/showcase/campaign-channels.js');return Object.fromEntries(keys.map(k=>[k,m.placementByKey(k).passos.map(p=>p.quadros)]));},KEYS);
    const rows=await walk(page,KEYS);
    check(`${tag}: no tool chip, backstage note or caption panel inside a scene in any frame`,rows.every(r=>r.leaks===0),rows.filter(r=>r.leaks).map(r=>`${r.key}#${r.index}`));
    check(`${tag}: no Legendas ao vivo inside the phone`,rows.every(r=>!r.legendas));
    const steps=[];for(const key of KEYS){const list=rows.filter(r=>r.key===key);placements[key].forEach((q,k)=>{if(!q.some(i=>list.find(r=>r.index===i)?.dotShown))steps.push(`${key} passo ${k+1}`);});}
    check(`${tag}: every step has a frame with the point visible`,steps.length===0,steps);
    const wrong=rows.filter(r=>(r.toque||r.final)&&r.dotShown).map(r=>`${r.key}#${r.index}`);
    check(`${tag}: the point hides on tap frames and on done or aviso`,wrong.length===0,wrong);
    const holes=rows.filter(r=>PLACEHOLDER.test(r.text.replace(/[\w-]+\.exemplo\b/g,''))).map(r=>`${r.key}#${r.index}`);
    check(`${tag}: no placeholder text on screen`,holes.length===0,holes);
    for(const key of ['voz/ligacao','whatsapp/chamada'].filter(k=>KEYS.includes(k))){
      const turns=rows.filter(r=>r.key===key&&r.fala).map(r=>r.tempos.join('|'));
      check(`${tag} ${key}: the visible call timer changes on every turn frame`,turns.length>=6&&turns.every(Boolean)&&turns.every((t,i)=>i===0||t!==turns[i-1]),turns);
    }
    if(KEYS.includes('whatsapp/agente')){
      const ag=rows.filter(r=>r.key==='whatsapp/agente');
      check(`${tag} whatsapp/agente: a frame with Face ID, one with Comprovante de Pix, and 10:13 on the clock at the end`,ag.some(r=>r.face)&&ag.some(r=>/Comprovante de Pix/.test(r.text))&&ag.slice(-2).every(r=>r.hora==='10:13'),ag.slice(-2).map(r=>r.hora));
    }
    if(KEYS.includes('rcs/conversa')){const last=rows.filter(r=>r.key==='rcs/conversa').at(-1);check(`${tag} rcs/conversa: the paid order card stays on screen at the end`,/Pagamento confirmado/.test(last.text)&&/Pago/.test(last.text),last.text.slice(-300));}
    info(`${tag}: frames walked`,rows.length);
    await context.close();
  }

  // Failure paths, rendered frame by frame with the engine.
  {
    const {context,page}=await open({width:390,height:844});
    const res=await page.evaluate(async keys=>{
      const m=await import('/assets/showcase/campaign-channels.js'),e=await import('/assets/showcase/frame-engine.js');
      const out={};
      for(const key of keys){
        const pl=m.placementByKey(key),box=document.createElement('div');
        box.className='lab-escopo';box.style.cssText='position:fixed;left:0;top:0;width:380px;z-index:99999';box.innerHTML=m.renderMock(pl);document.body.append(box);
        const screen=box.querySelector('.cm-screen'),seen=new Set();
        for(let i=0;i<pl.quadros.length;i++){
          e.applyFrame(screen,pl.quadros,i,{instant:true});
          await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
          const on=screen.querySelector('.cm-scene[data-pos="on"]');
          const walker=document.createTreeWalker(screen,NodeFilter.SHOW_TEXT);
          for(let n=walker.nextNode();n;n=walker.nextNode()){const el=n.parentElement;if(!n.data.trim()||!el)continue;let ok=true;for(let x=el;x&&x!==box;x=x.parentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden'&&x===el){ok=false;break;}}if(ok&&(on?.contains(el)||!el.closest('.cm-scene')))seen.add(n.data.trim());}
        }
        out[key]=[...seen].join(' ');box.remove();
      }
      return out;
    },FALHAS);
    const want={'whatsapp/agente-falha':/Expirado/,'voz/ligacao-falha':/Ligação perdida.*Ligar às 14h/s,'rcs/conversa-falha':/Mensagem de Texto • SMS/,'pix/recorrencia-falha':/Pagamento cancelado.*Pausar 1 mês/s,'email/regua-falha':/Inscrição cancelada/};
    for(const key of FALHAS)check(`${key}: the failure shows on screen`,want[key].test(res[key]||''),(res[key]||'').slice(0,300));
    await context.close();
  }

  // Motion: the call grows out of the island, the timer counts in real time and the wave moves.
  if(KEYS.includes('whatsapp/chamada')){
    const {context,page}=await open({width:390,height:844},{reduced:false});
    await go(page,'whatsapp/chamada');
    await page.evaluate(()=>{const b=document.querySelector('#laboratorio [data-cx-toggle]');if(b&&/Pausar/.test(b.getAttribute('aria-label')||''))b.click();});
    for(let i=1;i<=3;i++){await next(page);await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);}
    await page.waitForTimeout(900);
    const grow=await page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage] .cm-scene[data-scene="ring"]');return getComputedStyle(s).transitionProperty.includes('clip-path')&&/inset\(0/.test(getComputedStyle(s).clipPath);});
    check('Motion: the incoming call scene grows out of the island (clip-path)',grow);
    for(let i=4;i<=6;i++){await next(page);await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);}
    await page.waitForTimeout(400);
    const live=await page.evaluate(()=>{
      const screen=document.querySelector('#laboratorio [data-cx-stage] .cm-screen');
      const t=[...screen.querySelectorAll('.au-tempo>i')].find(i=>getComputedStyle(i.parentElement).display!=='none');
      const a=t?.getAnimations()[0],bars=[...screen.querySelectorAll('.cm-scene[data-scene="call"] .au-onda i')];
      return {timer:Boolean(a)&&a.playState==='running'&&a.effect.getComputedTiming().duration>2000,wave:bars.length===14&&bars.every(b=>b.getAnimations().some(x=>x.playState==='running')),amp:getComputedStyle(screen.querySelector('.cm-scene[data-scene="call"] .au-onda')).getPropertyValue('--au-amp').trim()};
    });
    check('Motion: the live timer of the turn runs for the length of the line and the 14 bars move while the AI speaks',live.timer&&live.wave&&Number(live.amp)>.5,live);
    await context.close();
  }

  check('No page errors',report.errors.length===0,report.errors);
  check('No missing files',report.missing.length===0,report.missing);
}catch(error){report.errors.push(String(error?.stack||error));check('The run finished',false,String(error));}
finally{await browser?.close();server?.kill();await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));}
const failed=report.checks.filter(c=>!c.pass);
console.log(`${report.checks.length-failed.length}/${report.checks.length} checks pass`);
process.exitCode=failed.length?1:0;
