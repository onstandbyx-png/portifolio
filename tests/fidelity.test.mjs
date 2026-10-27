import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

const webp=(file,name)=>{
 const art=readFileSync(new URL('../'+file,import.meta.url));
 assert.equal(art.subarray(0,4).toString(),'RIFF',name);
 assert.equal(art.subarray(8,12).toString(),'WEBP',name);
 return art.length;
};
test('Static presentation assets are local WebP files, including every campaign channel',()=>{
 // Cada foto de IMG (campaign-channels.js) e das outras telas aponta para um arquivo local; as WebP são WebP de verdade.
 const sources=['campaign-channels.js','campaign-search.js','automation-flows.js','campaign-sites.js','lab-telas.js'].map(f=>read('public/assets/showcase/'+f)).join('\n');
 const paths=new Set([...sources.matchAll(/A \+ '([^']+\.(?:webp|svg))'|\/assets\/portfolio\/([\w/-]+\.(?:webp|svg))/g)].map(m=>'public/assets/portfolio/'+(m[1]||m[2])));
 assert(paths.size>=30,'IMG lists the licensed collection');
 for(const file of paths){assert(existsSync(new URL('../'+file,import.meta.url)),file);if(file.endsWith('.webp'))assert(webp(file,file)>1000,file);}
 for(const name of ['campanha-meta','campanha-google','campanha-tiktok','casa-costa','trilhas'])webp(`public/assets/portfolio/static-r8/${name}.webp`,name);
 // As fotos geradas que vinham do outro projeto saíram do repositório.
 for(const gone of ['canais/campanha-crencas','canais/cena-nerd','campanha-nerd','cena-negocios'])assert(!existsSync(new URL(`../public/assets/portfolio/${gone}.webp`,import.meta.url)),gone);
});
test('The mural shows 12 to 16 captured frames, each a light local WebP read from mural.json',()=>{
 const list=JSON.parse(read('public/assets/portfolio/mural/mural.json'));
 assert(list.length>=12&&list.length<=16,String(list.length));
 for(const q of list){
  assert.match(q.src,/^\/assets\/portfolio\/mural\/[a-z]+-[a-z]+-f\d+\.webp$/);
  assert(webp('public'+q.src,q.src)<=40*1024,q.src);
  assert.match(q.href,/^#(laboratorio\/[a-z]+\/[a-z]+|sistemas\/[a-z]+)$/);
  for(const key of ['cliente','canal','formato','rotulo','etapa'])assert(q[key]!==undefined&&q[key]!=='',key);
 }
 // Nomes de marca só em marcas.js: o JSON guarda a chave do cliente.
 assert.doesNotMatch(JSON.stringify(list),/Casa Amaro|Vilela|Atlântica|Ponto Tech|Destino Certo|Speak Up|Valore|EcoDrive/);
});
test('Outer presentations remain interactive while product mock content stays static',()=>{
 const entry=read('public/assets/showcase/static-init.js'),show=read('public/assets/showcase/static-presentations.js'),interaction=read('public/assets/sections/interactions.js');
 for(const mount of ['mountStaticPresentations','mountCampaignFlip','mountVitrine','mountTrace','mountMural'])assert(entry.includes(mount),mount);
 assert.doesNotMatch(entry,/mountFatosDeck|fatos/i);
 for(const source of [entry,show,interaction])assert(!/(?:showModal|data-product-tab|data-app-action|data-call-play)/.test(source));
 assert(show.includes('data-sp-tab')&&show.includes('role="tabpanel"'),'Campaign navigation remains accessible');
});
test('Project services are navigable and do not send data',()=>{
 const s=read('public/assets/project-paths.js');
 const html=read('index.html');
 for(const marker of ['<details','<summary','data-service-scope','href="#contato"','path-contact','data-service-id'])assert(html.includes(marker),marker);
 assert(s.includes('select.dispatchEvent'));
 assert(!s.includes('XMLHttpRequest')&&!s.includes('window.open')&&!s.includes('fetch('),'Service selection must not send visitor data');
});
test('No fixed contact CTA obscures reading on mobile',()=>{
 assert(!read('public/assets/direction.js').includes('createElement'));
});
