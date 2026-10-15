import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
test('original smiile physical geometry is preserved without orange universal phone',async()=>{
 const [device,css,render,installer]=await Promise.all([
  read('public/assets/showcase/device-frame.js'),
  read('public/assets/showcase/device-frame.css'),
  read('public/assets/sections/interactions.js'),
  read('scripts/install-sections.mjs')
 ]);
 for(const s of ['435','907','402','874','16.5','17'])assert(device.includes(s),'Device dimension '+s);
 for(const s of ['.df-metal','.df-line','.df-bevel','.df-glass','.df-camera','.df-status','.df-home'])assert(css.includes(s),s);
 assert(render.includes("createDeviceFrame("),'editorial and experience use the reference device');
 assert(installer.includes('portfolio-reference-fidelity-v3'));
 assert(installer.includes("replace(/<script type=\"module\" src=\"\\/assets\\/showcase\\/fidelity\\.js\">"));
});
test('native scroll opens a photographic-style window instead of scaling the phone',async()=>{
 const [js,css]=await Promise.all([read('public/assets/showcase/experiences.js'),read('public/assets/showcase/rebuild.css')]);
 assert.match(js,/function mountScrollFilm\(\)/);
 assert(js.includes('rv-reveal')&&js.includes('rv-window'),'aperture must replace phone');
 assert(!js.includes('rx-film-phone'),'previous phone should not exist');
 assert(js.includes('const opening=smooth')&&js.includes('windowEl.style.width'));
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
test('linked mobile categories rely on usable height and preserve native vertical scrolling',async()=>{
 const [js,css]=await Promise.all([read('src/portfolio.js'),read('public/assets/showcase/rebuild.css')]);
 assert(js.includes('innerHeight<720'));
 assert(js.includes("zone?.classList.toggle('pf-category-linked',!flow)"));
 assert(css.includes('.category-zone.pf-category-linked .category-sticky'));
 assert(css.includes('touch-action:pan-y')||((await read('src/styles.css')).includes('touch-action:pan-y')));
});
