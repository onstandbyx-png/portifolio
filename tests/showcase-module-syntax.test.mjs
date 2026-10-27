import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
// Every module the page can load parses: the showcase, the hero (planes) and the mural.
const dirs=['public/assets/showcase','public/assets/planes','public/assets/mural'];
const paths=dirs.flatMap(dir=>readdirSync(dir).filter(f=>f.endsWith('.js')).map(f=>`${dir}/${f}`));
test('The module list covers the section modules',()=>{
 for(const name of ['frame-engine.js','experience-player.js','campaign-channels.js','campaign-search.js','automation-flows.js','automation-trace.js','marcas.js','hero-journey.js','mural.js'])assert(paths.some(p=>p.endsWith('/'+name)),name);
 assert(!paths.some(p=>/fatos|deck-demos/i.test(p)),'retired modules are gone');
});
for(const path of paths){
 test('JavaScript module parses: '+path,()=>{
  const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||'Syntax check failed');
 });
}
