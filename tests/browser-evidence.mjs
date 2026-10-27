// Cobertura de navegador da página inteira: roda, um por vez, cada suíte de tests/browser-*.mjs que ainda vale,
// contra um só server.mjs (PORT, padrão 4189) ou contra BASE_URL. Grava qa/evidence/summary.json e sai com 1 se
// alguma suíte falhar. ONLY=sections,responsive-matrix limita as suítes.
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
const SUITES=['hero-fit','hero-journey','readable-hero','positioning','player-engine','static-presentations','campaign-flows',
  'search-flows','automation-flows','automation-trace','sections','section-visibility','pages','responsive-matrix'];
const only=(process.env.ONLY||'').split(',').filter(Boolean);
const port=process.env.PORT||'4189';
const base=(process.env.BASE_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const server=process.env.BASE_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'ignore'});
const run=suite=>new Promise(resolve=>{
  const start=Date.now();
  const child=spawn(process.execPath,[`tests/browser-${suite}.mjs`],{env:{...process.env,BASE_URL:base},stdio:['ignore','inherit','inherit']});
  child.on('exit',code=>resolve({suite,code,segundos:Math.round((Date.now()-start)/1000)}));
});
const rows=[];
try{
  let up=false;for(let i=0;i<80;i++){try{up=(await fetch(base+'/health')).ok;if(up)break;}catch{}await new Promise(r=>setTimeout(r,120));}
  if(!up)throw new Error('server.mjs fora do ar em '+base);
  for(const suite of SUITES.filter(s=>!only.length||only.includes(s))){
    console.log(`\n=== browser-${suite}`);
    rows.push(await run(suite));
    console.log(`=== browser-${suite}: ${rows.at(-1).code===0?'PASS':'FAIL'} em ${rows.at(-1).segundos} s`);
  }
}finally{
  server?.kill();
  await mkdir('qa/evidence',{recursive:true});
  await writeFile('qa/evidence/summary.json',JSON.stringify(rows,null,2));
}
const falhas=rows.filter(r=>r.code!==0);
console.log(`\n${rows.length-falhas.length}/${rows.length} suítes passaram${falhas.length?': falharam '+falhas.map(r=>r.suite).join(', '):''}`);
if(falhas.length)process.exit(1);
