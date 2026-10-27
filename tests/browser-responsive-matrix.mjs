// Matriz responsiva da página inteira e das páginas paralelas, em 13 viewports.
// Em cada viewport: sem rolagem lateral; nenhum erro no console; nenhuma resposta 4xx/5xx; nenhum texto cortado
// (overflow hidden com o texto passando da caixa) fora dos mocks; toques de 44 px (o ponto de toque é medido com
// elementFromPoint, então ::before que aumenta a área conta); todos os formatos do laboratório e todas as
// automações de #sistemas percorridos quadro a quadro sem o ponto numerado sobre texto; a tela do aparelho com
// 340 px ou mais a partir de 390 px de largura e o aparelho inteiro na altura do viewport.
// Também mede o orçamento da primeira tela a 390x844 (até 600 KB, nenhum byte de vídeo ou áudio, LCP).
// Roda contra BASE_URL ou sobe server.mjs na PORT (padrão 4199). Grava qa/responsive-matrix/results.json.
// MATRIX_ONLY=390x844,1440x900 limita as viewports; MATRIX_WALK=0 pula o percurso dos quadros; MATRIX_JOBS=3.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const port=process.env.PORT||'4199',output='qa/responsive-matrix';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
await mkdir(output,{recursive:true});

const ALL=['320x568','360x740','375x812','390x844','414x896','430x932','768x1024','820x1180','1024x768','1280x800','1440x900','1920x1080','844x390'];
const VIEWPORTS=(process.env.MATRIX_ONLY?ALL.filter(v=>process.env.MATRIX_ONLY.split(',').includes(v)):ALL).map(v=>{const [width,height]=v.split('x').map(Number);return {width,height,tag:v};});
const WALK=process.env.MATRIX_WALK!=='0',JOBS=Number(process.env.MATRIX_JOBS||3);
const PAGES=['/criadores','/criadores/ao-vivo','/vagas','/privacidade','/creditos'];
// Mocks desenham apps com as medidas dos próprios apps; o que fica dentro deles não entra nas regras da página.
const MOCK='.ch-iphone,.cm-screen,.hj-phone,.hj-card,.mu-tela,.cx-zoom,.vl-device,.at-vista .ch-iphone';
const report={viewports:[],pages:[],budget:null};let browser;
const short=v=>JSON.stringify(v).slice(0,900);

/* Medidas feitas na página (texto cortado e toques do trecho visível). */
function sondas(MOCK){
  const visible=el=>{for(let a=el;a&&a!==document.documentElement;a=a.parentElement){const s=getComputedStyle(a);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)<.05)return false;}const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
  const hidden1px=el=>{const r=el.getBoundingClientRect();return r.width<=2||r.height<=2||getComputedStyle(el).clip!=='auto'&&getComputedStyle(el).clip!=='';};
  const name=el=>{let s=el.tagName.toLowerCase();if(el.id)s+='#'+el.id;const c=(el.getAttribute('class')||'').trim().split(/\s+/).filter(Boolean).slice(0,2);if(c.length)s+='.'+c.join('.');return s;};
  const path=el=>{const out=[];for(let e=el,i=0;e&&e!==document.body&&i<3;e=e.parentElement,i++)out.unshift(name(e));return out.join(' > ');};
  window.__cortes=function(){
    const out=[],range=document.createRange();
    for(const el of document.querySelectorAll('body *')){
      if(el.closest(MOCK)||el.closest('[hidden],[aria-hidden="true"],svg,canvas,noscript'))continue;
      const s=getComputedStyle(el);
      if(!/(hidden|clip)/.test(s.overflowX)||el.scrollWidth<=el.clientWidth+1||!visible(el)||hidden1px(el))continue;
      const box=el.getBoundingClientRect();
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
      for(let n=walker.nextNode();n;n=walker.nextNode()){
        if(!n.data.trim()||!n.parentElement||!visible(n.parentElement)||n.parentElement.closest(MOCK))continue;
        range.selectNodeContents(n);
        if([...range.getClientRects()].some(r=>r.width>0&&(r.right>box.right+1.5||r.left<box.left-1.5))){out.push({el:path(el),texto:n.data.trim().slice(0,40),sw:el.scrollWidth,cw:el.clientWidth});break;}
      }
    }
    return out;
  };
  window.__toques=function(vistos){
    const out=[],ih=innerHeight,iw=innerWidth;
    const alvos=document.querySelectorAll('a[href],button,select,textarea,input:not([type=hidden]),summary,[role=tab],[role=button]');
    for(const el of alvos){
      if(el.closest(MOCK)||el.closest('[inert]')||vistos.has(el)||!visible(el)||el.matches('.skip,.pg-skip'))continue;
      const r=el.getBoundingClientRect();
      if(r.top<0||r.bottom>ih||r.left<0||r.right>iw)continue;
      if(el.matches('input[type=radio],input[type=checkbox]')&&(r.width<4||r.height<4)){vistos.add(el);continue;}
      // Link no meio de um parágrafo segue o texto (exceção de WCAG 2.5.8 para alvos em linha).
      if(el.matches('a')&&getComputedStyle(el).display==='inline'&&el.parentElement&&[...el.parentElement.childNodes].some(n=>n.nodeType===3&&n.data.trim().length>2)){vistos.add(el);continue;}
      if(r.width>=43.5&&r.height>=43.5){vistos.add(el);continue;}
      // Menor que 44 px na caixa: vale a área real de toque (::before que aumenta conta), medida com elementFromPoint.
      const cx=r.left+r.width/2,cy=r.top+r.height/2,meio=21.5;
      const hit=(x,y)=>{x=Math.min(iw-1,Math.max(0,x));y=Math.min(ih-1,Math.max(0,y));const at=document.elementFromPoint(x,y);return Boolean(at&&(at===el||el.contains(at)||at.contains(el)&&at.matches('label')));};
      if(!hit(cx,cy))continue; // coberto agora (cabeçalho, barra fixa): mede em outro trecho
      vistos.add(el);
      const w=r.width>=43.5||hit(cx-meio,cy)&&hit(cx+meio,cy),h=r.height>=43.5||hit(cx,cy-meio)&&hit(cx,cy+meio);
      if(!(w&&h))out.push({el:path(el),texto:(el.innerText||el.getAttribute('aria-label')||'').trim().slice(0,30),w:Math.round(r.width),h:Math.round(r.height)});
    }
    return out;
  };
}
// Varre a página de cima a baixo: cada trecho entra na tela, monta, e os toques visíveis são medidos ali.
async function varre(page){
  await page.evaluate(sondas,MOCK);
  const toques=[];await page.evaluate(()=>{window.__vistos=new Set();});
  let y=0;
  for(let i=0;i<120;i++){
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);
    await page.waitForTimeout(220);
    toques.push(...await page.evaluate(()=>window.__toques(window.__vistos)));
    const {h,ih}=await page.evaluate(()=>({h:document.documentElement.scrollHeight,ih:innerHeight}));
    if(y+ih>=h-2)break;
    y+=Math.round(ih*.8);
  }
  const cortes=await page.evaluate(()=>window.__cortes());
  const lateral=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));
  return {toques,cortes,lateral};
}

/* Ponto sobre texto: a caixa do ponto contra cada linha de texto visível da cena na tela. */
const pontoSobreTexto=(page,stageSel)=>page.evaluate(stageSel=>{
  const stage=document.querySelector(stageSel),dot=stage?.querySelector('[data-cx-dot]');
  if(!dot||dot.hidden||getComputedStyle(dot).visibility==='hidden'||Number(getComputedStyle(dot).opacity)<.1)return null;
  const d=dot.getBoundingClientRect(),screen=stage.querySelector('.cm-screen'),on=screen.querySelector('.cm-scene[data-pos="on"]')||screen;
  const opaque=n=>{for(let el=n;el&&el!==screen.parentElement;el=el.parentElement){const s=getComputedStyle(el);if(s.display==='none'||Number(s.opacity)<.05)return false;}return getComputedStyle(n).visibility==='visible';};
  const walker=document.createTreeWalker(on,NodeFilter.SHOW_TEXT),range=document.createRange(),hits=[];
  for(let n=walker.nextNode();n;n=walker.nextNode()){
    if(!n.data.trim()||!n.parentElement||!opaque(n.parentElement))continue;
    range.selectNodeContents(n);
    for(const r of range.getClientRects()){
      const ox=Math.min(d.right,r.right)-Math.max(d.left,r.left),oy=Math.min(d.bottom,r.bottom)-Math.max(d.top,r.top);
      if(ox>4&&oy>4){hits.push(n.data.trim().slice(0,30));break;}
    }
  }
  return hits;
},stageSel);

async function percorreLab(page,tag,linha){
  await page.evaluate(()=>document.querySelector('#laboratorio').scrollIntoView({behavior:'instant'}));
  await page.waitForSelector('#laboratorio .cx-player',{state:'attached'});
  const keys=await page.evaluate(async()=>(await import('/assets/showcase/campaign-channels.js')).channels.flatMap(c=>c.placements.map(p=>c.id+'/'+p.id)));
  let quadros=0,comPonto=0;const tela=[];
  for(const key of keys){
    const [canal,formato]=key.split('/');
    await page.evaluate(d=>window.dispatchEvent(new CustomEvent('cx:abrir',{detail:d})),{canal,formato});
    await page.waitForFunction(({canal,formato})=>{const p=document.querySelector('#laboratorio .cx-player');return document.querySelectorAll('#laboratorio [data-cx-stage]').length===1&&p?.dataset.platform===canal&&p.dataset.placement===formato&&p.querySelector('.cm-screen')?.dataset.frame==='0';},{canal,formato});
    if(tela.length<3){
      await page.locator('#laboratorio [data-cx-stage]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
      tela.push(await page.evaluate(()=>{const t=document.querySelector('#laboratorio [data-cx-stage] .ch-iphone-tela').getBoundingClientRect(),f=document.querySelector('#laboratorio [data-cx-stage] .ch-iphone').getBoundingClientRect();return {tela:Math.round(t.width),altura:Math.round(f.height),ih:innerHeight};}));
    }
    const n=Number(await page.locator('#laboratorio [data-cx-stage]').getAttribute('data-frames'));
    for(let i=0;i<n;i++){
      if(i)await page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage]');s.focus({preventScroll:true});s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});
      await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);
      await page.waitForTimeout(90);
      const hit=await pontoSobreTexto(page,'#laboratorio [data-cx-stage]');
      if(hit?.length)linha.ponto.push(`${key}#${i}: ${hit.join(' | ')}`);
      if(hit)comPonto++;
      quadros++;
    }
  }
  linha.lab={formatos:keys.length,quadros,comPonto,tela};
}
async function percorreSistemas(page,linha){
  await page.evaluate(()=>document.querySelector('#sistemas').scrollIntoView({behavior:'instant'}));
  await page.waitForSelector('[data-vitrine="sistemas"] [data-at-mod]');
  const mods=await page.locator('[data-vitrine="sistemas"] [data-at-mod]').count();let quadros=0,comPonto=0;
  const sel='[data-vitrine="sistemas"] [data-at-stage]';
  for(let k=0;k<mods;k++){
    await page.locator(`[data-vitrine="sistemas"] [data-at-mod="${k}"]`).evaluate(b=>b.click());
    await page.waitForFunction(k=>document.querySelector(`[data-vitrine="sistemas"] [data-at-mod="${k}"]`)?.getAttribute('aria-pressed')==='true',k);
    await page.waitForTimeout(150);
    const total=await page.locator('[data-vitrine="sistemas"] [data-at-pos]').evaluate(el=>Number(el.textContent.split('/')[1]));
    for(let i=0;i<total;i++){
      if(i){const before=await page.locator(`${sel} .cm-screen`).getAttribute('data-frame');await page.locator('[data-vitrine="sistemas"] [data-at-next]').evaluate(b=>b.click());await page.waitForFunction(([sel,b])=>document.querySelector(sel+' .cm-screen')?.dataset.frame!==b,[sel,before]).catch(()=>{});}
      await page.waitForTimeout(90);
      const hit=await pontoSobreTexto(page,sel);
      if(hit?.length)linha.ponto.push(`sistemas/${k}#${i}: ${hit.join(' | ')}`);
      if(hit)comPonto++;
      quadros++;
    }
  }
  const tela=await page.evaluate(sel=>{const st=document.querySelector(sel);st.scrollIntoView({block:'center',behavior:'instant'});const t=st.querySelector('.ch-iphone-tela').getBoundingClientRect(),f=st.querySelector('.ch-iphone').getBoundingClientRect();return {tela:Math.round(t.width),altura:Math.round(f.height),ih:innerHeight};},sel);
  linha.sistemas={modulos:mods,quadros,comPonto,tela};
}

async function viewport(vp){
  const linha={vp:vp.tag,erros:[],respostas:[],ponto:[],checks:[]};
  const ok=(name,pass,detail)=>{linha.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',vp.tag,name,short(detail));};
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.width<800,hasTouch:vp.width<800});
  const page=await ctx.newPage();page.setDefaultTimeout(25000);
  page.on('pageerror',e=>linha.erros.push(String(e).slice(0,300)));
  page.on('console',m=>{if(m.type()==='error')linha.erros.push(m.text().slice(0,300));});
  page.on('response',r=>{if(r.status()>=400)linha.respostas.push(`${r.status()} ${r.url().replace(base,'')}`);});
  try{
    await page.goto(base+'/',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
    const v=await varre(page);
    ok('sem rolagem lateral',v.lateral.sw<=v.lateral.iw+1,v.lateral);
    ok('nenhum texto cortado fora dos mocks',v.cortes.length===0,v.cortes);
    ok('toques de 44 px',v.toques.length===0,v.toques);
    if(WALK){
      // O percurso usa movimento reduzido: cada quadro aparece pronto, sem esperar a transição.
      const rctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.width<800,hasTouch:vp.width<800,reducedMotion:'reduce'});
      const rp=await rctx.newPage();rp.setDefaultTimeout(25000);
      rp.on('pageerror',e=>linha.erros.push('reduzido: '+String(e).slice(0,300)));
      rp.on('response',r=>{if(r.status()>=400)linha.respostas.push(`${r.status()} ${r.url().replace(base,'')}`);});
      await rp.goto(base+'/',{waitUntil:'load'});
      await percorreLab(rp,vp.tag,linha);
      await percorreSistemas(rp,linha);
      await rctx.close();
      ok('o ponto nunca fica sobre texto, em todos os formatos e automações',linha.ponto.length===0,linha.ponto);
      const telas=[...linha.lab.tela,linha.sistemas.tela];
      const retrato=vp.width>=390&&vp.height>=844;
      if(retrato)ok('tela do aparelho com 340 px ou mais',telas.every(t=>t.tela>=340),telas);
      if(vp.width>=390&&vp.height>vp.width)ok('o aparelho inteiro cabe na altura do viewport',telas.every(t=>t.altura<=t.ih),telas);
      linha.info={telas};
    }
    ok('nenhum erro no console',linha.erros.length===0,linha.erros);
    ok('nenhuma resposta 4xx/5xx',linha.respostas.length===0,linha.respostas);
  }catch(error){linha.falha=String(error).slice(0,600);console.error('FAIL',vp.tag,linha.falha);}
  await page.screenshot({path:`${output}/${vp.tag}.png`}).catch(()=>{});
  await ctx.close();
  console.log(vp.tag,`${linha.checks.filter(c=>c.pass).length}/${linha.checks.length}`,linha.lab?`lab ${linha.lab.quadros} quadros (${linha.lab.comPonto} com ponto)`:'',linha.sistemas?`sistemas ${linha.sistemas.quadros} quadros (${linha.sistemas.comPonto} com ponto)`:'');
  report.viewports.push(linha);
}
async function paginas(vp){
  for(const rota of PAGES){
    const linha={vp:vp.tag,rota,erros:[],respostas:[],checks:[]};
    const ok=(name,pass,detail)=>{linha.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',vp.tag,rota,name,short(detail));};
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.width<800,hasTouch:vp.width<800});
    const page=await ctx.newPage();page.setDefaultTimeout(20000);
    page.on('pageerror',e=>linha.erros.push(String(e).slice(0,300)));
    page.on('console',m=>{if(m.type()==='error')linha.erros.push(m.text().slice(0,300));});
    page.on('response',r=>{if(r.status()>=400)linha.respostas.push(`${r.status()} ${r.url().replace(base,'')}`);});
    try{
      await page.goto(base+rota,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
      const v=await varre(page);
      ok('sem rolagem lateral',v.lateral.sw<=v.lateral.iw+1,v.lateral);
      ok('nenhum texto cortado',v.cortes.length===0,v.cortes);
      ok('toques de 44 px',v.toques.length===0,v.toques);
      ok('nenhum erro no console',linha.erros.length===0,linha.erros);
      ok('nenhuma resposta 4xx/5xx',linha.respostas.length===0,linha.respostas);
    }catch(error){linha.falha=String(error).slice(0,600);console.error('FAIL',vp.tag,rota,linha.falha);}
    await ctx.close();
    report.pages.push(linha);
  }
}
async function orcamento(){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await ctx.newPage();let bytes=0;const media=[],imagens=[];
  page.on('requestfinished',async req=>{const s=await req.sizes().catch(()=>null);if(s)bytes+=s.responseBodySize+s.responseHeadersSize;const t=req.resourceType();const u=req.url().replace(base,'');if(t==='media'||/\.(webm|mp4|mp3|m4a|ogg)(\?|$)/.test(u))media.push(u);if(t==='image')imagens.push(u);});
  await page.addInitScript(()=>{window.__lcp=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
  await page.goto(base+'/',{waitUntil:'load'});await page.waitForTimeout(2500);
  const lcp=await page.evaluate(()=>Math.round(window.__lcp));
  await ctx.close();
  report.budget={kb:Math.round(bytes/1024),lcp,media,imagens};
  return report.budget;
}

try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}assert(up,'server reachable');
  browser=await chromium.launch();
  const fila=[...VIEWPORTS];
  await Promise.all(Array.from({length:Math.min(JOBS,fila.length)},async()=>{for(let vp=fila.shift();vp;vp=fila.shift()){await viewport(vp);await paginas(vp);}}));
  const b=await orcamento();
  console.log('orçamento a 390x844:',b.kb,'KB, LCP',b.lcp,'ms, mídia',b.media.length,', imagens',b.imagens.length);
}finally{
  await browser?.close();server?.kill();
  report.viewports.sort((a,b)=>ALL.indexOf(a.vp)-ALL.indexOf(b.vp));
  await writeFile(`${output}/results.json`,JSON.stringify(report,null,2));
}
const falhas=[...report.viewports,...report.pages].flatMap(l=>[...(l.falha?[{name:'falha: '+l.falha}]:[]),...l.checks.filter(c=>!c.pass)].map(c=>`${l.vp}${l.rota?' '+l.rota:''}: ${c.name}`));
if(report.budget&&report.budget.kb>600)falhas.push(`orçamento: ${report.budget.kb} KB na primeira tela a 390x844 (limite 600)`);
if(report.budget?.media.length)falhas.push(`orçamento: vídeo ou áudio antes da cena: ${report.budget.media.join(', ')}`);
console.log(falhas.length?`${falhas.length} falhas:\n`+falhas.join('\n'):'PASS: 13 viewports, páginas paralelas e orçamento da primeira tela');
if(falhas.length)process.exit(1);
