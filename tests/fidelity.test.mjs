import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
test('original smiile physical geometry is preserved without orange universal phone',async()=>{
 const [device,css,render,html]=await Promise.all([
  read('public/assets/showcase/device-frame.js'),
  read('public/assets/showcase/device-frame.css'),
  read('public/assets/sections/interactions.js'),
  read('index.html')
 ]);
 for(const s of ['435','907','402','874','16.5','17'])assert(device.includes(s),'Device dimension '+s);
 for(const s of ['.df-metal','.df-line','.df-bevel','.df-glass','.df-camera','.df-status','.df-home'])assert(css.includes(s),s);
 assert(render.includes("createDeviceFrame("),'editorial and experience use the reference device');
 const showcase=await read('public/assets/showcase/experiences.js');
 assert(showcase.includes('socialDevice=createDeviceFrame('),'Social must share the same frame');
 assert(html.includes('/assets/showcase/device-frame.css'),'Page loads the shared physical frame');
 assert(!html.includes('src="/assets/showcase/fidelity.js"'),'Obsolete global image remapping stays inactive');
});
test('compact narrative transition contains an accessible interactive product',async()=>{
 const [js,css]=await Promise.all([read('public/assets/showcase/experiences.js'),read('public/assets/showcase/rebuild.css')]);
 assert.match(js,/function mountScrollFilm\(\)/);
 assert(js.includes('rv-reveal')&&js.includes('rv-window'),'aperture must replace phone');
 assert(!js.includes('rx-film-phone'),'previous phone should not exist');
 assert(js.includes('rv-compact')&&js.includes('data-reveal-state="open"'),'Story opens without a long scroll gate');
 assert(js.includes('data-rx-film-to')&&js.includes('aria-pressed'),'Chapter controls preserve keyboard and state semantics');
 assert(js.includes('data-linha-apply')&&js.includes('data-linha-approve'),'Product demonstrates revision and approval as separate actions');
 assert(css.includes('.rv-stage')&&css.includes('grid-template-rows'));
 assert(css.includes('.rv-footer'));
});
test('visual assets are distinct sharp vector masters, not one 260px WebP remapped globally',async()=>{
 const names=['materia-viva','contexto','narrativa','campanha','sistemas'];
 const items=await Promise.all(names.map(name=>read('public/assets/showcase/scenes/'+name+'.svg')));
 assert.equal(new Set(items).size,5,'Each visual is distinct');
 for(const svg of items){
  assert.match(svg,/<svg[\s\S]+width="1200" height="1800"/);
  assert(svg.length>4000,'Artwork must contain meaningful detail');
 }
 const installer=await read('scripts/install-sections.mjs');
 assert(!installer.includes('await access(new URL(\'public/assets/showcase/fatos-editorial-scene.webp\''));
});
test('project choices expose keyboard semantics and defer sending to contact',async()=>{
 const js=await read('public/assets/project-paths.js');
 for(const contract of ['role="tablist"','role="tab"','role="tabpanel"','aria-controls','aria-selected','ArrowRight','ArrowLeft','Home','End'])assert(js.includes(contract),contract);
 assert(js.includes('href="#contato"')&&js.includes('data-project-need'),'Choosing a path carries context into the contact form');
 assert(!/window\.open|fetch\s*\(|XMLHttpRequest/.test(js),'Project exploration never sends the visitor’s briefing');
});
