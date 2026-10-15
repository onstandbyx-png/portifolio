import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const path=new URL('../public/assets/kinetic-pass/kinetic-math.js',import.meta.url);
test('reference reconstruction has its independent geometry module',()=>assert(existsSync(path),'kinetic-math.js must exist'));
if(existsSync(path)){
 const {peelGeometry,sampleTimeline,normalizeTitle,WIDTH,HEIGHT}=await import(path);
 test('pass retains the measured 3:5 proportions',()=>assert.equal(WIDTH/HEIGHT,.6));
 test('closed corner is a small top-right fold',()=>{const p=peelGeometry(0);assert(p.front.length>=4);assert(p.flap.length>=3);assert(p.depth<25);});
 test('peel stays finite and inside sensible bounds for all 1536 time samples',()=>{for(let i=0;i<1536;i++){const q=sampleTimeline(i/60);const p=peelGeometry(q.peel);for(const [x,y] of [...p.front,...p.flap])assert(Number.isFinite(x)&&Number.isFinite(y));assert(q.peel>=0&&q.peel<=1);assert(q.layers>=0&&q.layers<=1);}});
 test('full reveal reaches the middle without growing the card',()=>{const p=peelGeometry(1);assert(p.depth>200&&p.depth<250);assert.equal(p.width,300);assert.equal(p.height,500);});
 test('source chronology preserves peel, layer disassembly and final return',()=>{assert(sampleTimeline(3.6).peel>.85);assert(sampleTimeline(12).layers>.95);assert(sampleTimeline(16).layers<.01);assert(sampleTimeline(25.6).peel<.02);});
 test('title validation caps the string and treats markup as data',()=>{assert.equal(normalizeTitle('   '),'ideia');assert.equal(normalizeTitle('123456789abcdef'),'12345678');assert.equal(normalizeTitle('CRIE!'),'CRIE!');assert(!normalizeTitle('<img src=x>').includes('<'));});
 test('new module is scoped and has no global image remapping',()=>{const js=readFileSync(new URL('../public/assets/kinetic-pass/kinetic-pass.js',import.meta.url),'utf8');assert(js.includes('estudio-interativo'));assert(!js.includes("observe(document.body"));assert(!js.includes('preventDefault();window.scroll'));});
}
