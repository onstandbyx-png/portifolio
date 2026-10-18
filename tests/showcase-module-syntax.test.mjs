import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
for(const path of [
 'public/assets/showcase/editorial-story.js',
 'public/assets/showcase/independent-device-content.js',
 'public/assets/showcase/fatos-deck.js',
 'public/assets/showcase/deck-demos.js',
 'public/assets/showcase/editorial-swipe.js'
]){
 test('JavaScript module parses: '+path,()=>{
  const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||'Syntax check failed');
 });
}
