// Captura os quadros do mural (#mural) a partir dos próprios fluxos do laboratório.
// Abre cada formato pelo evento cx:abrir, anda até o quadro com a seta →, como o visitante, e fotografa só a
// tela do iPhone (.ch-iphone-tela) a 390x844 com DPR 2. Grava public/assets/portfolio/mural/<canal>-<formato>-f<n>.webp
// (até 40 KB) e mural.json. Nenhum nome de marca vai para o JSON: o mural lê a marca de marcas.js pelo cliente.
// Rode de novo depois de mudar um desses fluxos ou um nome em marcas.js:
//   node scripts/capture-mural.mjs            (sobe server.mjs na PORT, padrão 4198)
//   BASE_URL=http://127.0.0.1:3000 node scripts/capture-mural.mjs
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readdir,unlink} from 'node:fs/promises';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const port=process.env.PORT||'4198',out='public/assets/portfolio/mural',MAX=40*1024,LARGURA=400;
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});

/* Os 14 quadros, na ordem do mural: campanhas e automações alternadas, para variar marca e canal.
 * href: '#laboratorio/<canal>/<formato>' abre o formato no laboratório; '#sistemas/<chave>' abre a automação. */
const QUADROS=[
  {canal:'instagram',formato:'reels',quadro:1,rotulo:'Instagram Reels',etapa:'Corte para o prato'},
  {canal:'whatsapp',formato:'agente',quadro:26,rotulo:'WhatsApp',etapa:'Pix no app do banco',href:'#sistemas/agente'},
  {canal:'tiktok',formato:'infeed',quadro:18,rotulo:'TikTok',etapa:'Pix aprovado'},
  {canal:'voz',formato:'ligacao',quadro:8,rotulo:'Ligação com IA',etapa:'Agenda aberta na ligação',href:'#sistemas/voz'},
  {canal:'linkedin',formato:'feed',quadro:12,rotulo:'LinkedIn',etapa:'Guia desbloqueado'},
  {canal:'pix',formato:'recorrencia',quadro:5,rotulo:'Pix Automático',etapa:'Autorização no banco',href:'#sistemas/pix'},
  {canal:'google',formato:'search',quadro:1,rotulo:'Google Pesquisa',etapa:'Anúncio e locais no mapa'},
  {canal:'whatsapp',formato:'chamada',quadro:8,rotulo:'Chamada no WhatsApp',etapa:'Assistente virtual na linha',href:'#sistemas/chamada'},
  {canal:'instagram',formato:'feed',quadro:8,rotulo:'Instagram Feed',etapa:'Teste de nível'},
  {canal:'rcs',formato:'conversa',quadro:5,rotulo:'RCS no iPhone',etapa:'Cartões na conversa',href:'#sistemas/rcs'},
  {canal:'maps',formato:'local',quadro:6,rotulo:'Google Maps',etapa:'Navegação até a porta'},
  {canal:'youtube',formato:'instream',quadro:1,rotulo:'YouTube',etapa:'Anúncio antes do vídeo'},
  {canal:'chatgpt',formato:'answer',quadro:20,rotulo:'ChatGPT',etapa:'Roteiro entregue no WhatsApp'},
  {canal:'instagram',formato:'story',quadro:3,rotulo:'Instagram Story',etapa:'Enquete respondida'},
];

// Some com o que fica por cima da tela do aparelho: ponto, dedo, faixa Agora, cabeçalho e barra do WhatsApp.
const LIMPA=`#laboratorio [data-cx-dot],#laboratorio [data-cx-ring],#laboratorio [data-cx-tap],#laboratorio [data-cx-agora],
  #site-header,.mobile-project-cta,#reading-progress,.skip{visibility:hidden!important}`;

let browser;
try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}
  if(!up)throw new Error('servidor fora do ar em '+base);
  browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const erros=[];page.on('pageerror',e=>erros.push(String(e)));
  await page.goto(base+'/',{waitUntil:'load'});
  await page.evaluate(()=>document.querySelector('#laboratorio')?.scrollIntoView({behavior:'instant'}));
  await page.waitForSelector('#laboratorio .cx-player',{state:'attached'});
  await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:LIMPA});
  const tags=await page.evaluate(async()=>{const m=await import('/assets/showcase/campaign-channels.js');
    return Object.fromEntries(m.channels.flatMap(c=>c.placements.map(p=>[c.id+'/'+p.id,{cliente:p.cliente,n:p.quadros.length,desc:p.quadros.map(q=>q.desc||'')}])));});
  // Página em branco para codificar o WebP no próprio Chromium (canvas.toBlob), sem dependência extra.
  const coder=await context.newPage();
  await mkdir(out,{recursive:true});
  for(const f of await readdir(out))if(f.endsWith('.webp'))await unlink(`${out}/${f}`);
  const lista=[];
  for(const q of QUADROS){
    const key=`${q.canal}/${q.formato}`,meta=tags[key];
    if(!meta)throw new Error('formato inexistente: '+key);
    if(q.quadro>=meta.n)throw new Error(`${key} tem ${meta.n} quadros, não ${q.quadro + 1}`);
    await page.evaluate(({canal,formato})=>window.dispatchEvent(new CustomEvent('cx:abrir',{detail:{canal,formato}})),q);
    await page.waitForFunction(({canal,formato})=>{const p=document.querySelector('#laboratorio .cx-player');return p?.dataset.platform===canal&&p.dataset.placement===formato&&p.querySelector('[data-cx-stage] .cm-screen')?.dataset.frame==='0';},q);
    for(let i=1;i<=q.quadro;i++){
      await page.evaluate(()=>{const s=document.querySelector('#laboratorio [data-cx-stage]');s.focus({preventScroll:true});s.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));});
      await page.waitForFunction(i=>document.querySelector('#laboratorio [data-cx-stage] .cm-screen')?.dataset.frame===String(i),i);
    }
    await page.waitForTimeout(700);
    await page.evaluate(()=>document.fonts.ready);
    // Centraliza a tela no viewport e recorta pela caixa dela (o elemento inteiro cabe nos 844 px).
    const clip=await page.evaluate(()=>{const t=document.querySelector('#laboratorio [data-cx-stage] .ch-iphone-tela');
      let r=t.getBoundingClientRect();scrollBy({top:r.top-(innerHeight-r.height)/2,behavior:'instant'});r=t.getBoundingClientRect();
      return {x:r.left,y:r.top,width:r.width,height:r.height};});
    await page.waitForTimeout(250);
    const png=(await page.screenshot({type:'png',clip,animations:'disabled'})).toString('base64');
    const {bytes,w,h,qualidade}=await coder.evaluate(async({png,MAX,LARGURA})=>{
      const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();
      let w=LARGURA,h=Math.round(img.naturalHeight*w/img.naturalWidth);
      for(;;){
        const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
        g.imageSmoothingQuality='high';g.drawImage(img,0,0,w,h);
        for(const qualidade of [.82,.76,.7,.64,.58,.52,.46]){
          const blob=await new Promise(r=>c.toBlob(r,'image/webp',qualidade));
          if(blob.size<=MAX)return {bytes:[...new Uint8Array(await blob.arrayBuffer())],w,h,qualidade};
        }
        w=Math.round(w*.9);h=Math.round(img.naturalHeight*w/img.naturalWidth);
      }
    },{png,MAX,LARGURA});
    const nome=`${q.canal}-${q.formato}-f${q.quadro}.webp`;
    await writeFile(`${out}/${nome}`,Buffer.from(bytes));
    lista.push({src:`/assets/portfolio/mural/${nome}`,w,h,cliente:meta.cliente,canal:q.canal,formato:q.formato,quadro:q.quadro,
      rotulo:q.rotulo,etapa:q.etapa,href:q.href||`#laboratorio/${q.canal}/${q.formato}`});
    console.log(`${nome}  ${w}x${h}  ${(bytes.length/1024).toFixed(1)} KB  q=${qualidade}  ${meta.desc[q.quadro].slice(0,90)}`);
  }
  await writeFile(`${out}/mural.json`,JSON.stringify(lista,null,1)+'\n');
  if(erros.length)console.error('Erros na página:',erros);
  console.log(`${lista.length} quadros em ${out}/`);
}finally{
  await browser?.close();server?.kill();
}
