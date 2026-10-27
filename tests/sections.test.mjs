import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const file=new URL('../public/assets/sections/motion.js',import.meta.url);
test('Módulo independente de movimento',()=>assert(existsSync(file)));
const {springAt,entryEdge,rotationForEdge,chapterAt,timelineStep}=await import(file);
test('Molas começam em 0 e estabilizam em 1',()=>{assert.equal(springAt('smooth',0),0);for(const name of ['smooth','snappy','bouncy'])assert(Math.abs(springAt(name,2000)-1)<.001)});
test('Mola bouncy preserva retorno elástico',()=>assert(Math.max(...Array.from({length:90},(_,i)=>springAt('bouncy',i*10)))>1));
test('Borda normalizada em cartões com diferentes proporções',()=>{assert.equal(entryEdge(1,250,300,600),'left');assert.equal(entryEdge(190,1,400,200),'top');assert.equal(entryEdge(200,199,400,200),'bottom');assert.equal(entryEdge(399,100,400,200),'right');assert.equal(entryEdge(0,0,0,0),'left');assert.deepEqual(rotationForEdge('left'),{x:0,y:-180})});
test('Capítulos respeitam limites',()=>{assert.equal(chapterAt(-.4,3),0);assert.equal(chapterAt(.55,3),1);assert.equal(chapterAt(1.4,3),2)});
test('Storyboard finito mantém último quadro',()=>{assert.equal(timelineStep(0,3,1600),0);assert.equal(timelineStep(1900,3,1600),1);assert.equal(timelineStep(9000,3,1600),2)});

// Texto visível dos quadros e das marcas (crítica 2 e 7): desc é legenda curta, sem jargão; cada assinatura aparece.
const canais=await import('../public/assets/showcase/campaign-channels.js');
const {CLIENTES}=await import('../public/assets/showcase/marcas.js');
test('Toda desc de quadro é legenda visível de até 140 caracteres, sem token nem estado',()=>{
 const ruins=[];
 for(const c of canais.channels)for(const p of c.placements)p.quadros.forEach((q,i)=>{const d=q.desc||'';if(!d||d.length>140||/\btoken|\bestado\b/i.test(d))ruins.push(`${c.id}/${p.id}#${i}: ${d.length}`);});
 assert.deepEqual(ruins,[]);
});
test('A assinatura de cada marca aparece pelo menos uma vez nas peças',()=>{
 const pecas=JSON.stringify(canais.channels.map(c=>[c.art,c.placements.map(p=>p.art)]));
 for(const [k,c] of Object.entries(CLIENTES))assert(pecas.includes(c.assinatura.replace(/\.$/,'')),k);
});
test('O mural não escreve nome de marca: lê de marcas.js',async()=>{
 const {readFileSync}=await import('node:fs');
 const nomes=new RegExp(Object.values(CLIENTES).map(c=>c.marca).join('|'));
 assert.doesNotMatch(readFileSync(new URL('../public/assets/mural/mural.js',import.meta.url),'utf8'),nomes);
 assert.doesNotMatch(readFileSync(new URL('../public/assets/portfolio/mural/mural.json',import.meta.url),'utf8'),nomes);
});
