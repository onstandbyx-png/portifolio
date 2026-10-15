import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('The same physical smiile device is reused for editorial, social and cinematic stages',()=>{
 const d=read('public/assets/showcase/device-frame.js'),sections=read('public/assets/sections/interactions.js'),show=read('public/assets/showcase/experiences.js');
 for(const marker of ['435','907','402','874','16.5','17'])assert(d.includes(marker));
 assert(sections.includes('createDeviceFrame('));
 assert(show.includes('createDeviceFrame('));
 assert(show.includes('pf-film-device')&&show.includes('pf-social-device'));
});
test('Visual proof uses local photographic assets from current projects',()=>{
 const h=read('index.html'),exp=read('public/assets/showcase/experiences.js');
 assert(h.includes('/assets/portfolio/cena-desconhecidos.webp'));
 assert(h.includes('/assets/portfolio/smiile-architecture-coast.webp'));
 assert(!/SOTA CI|final_final|LINHA/i.test(h+exp));
});
test('Project services are navigable and do not send data',()=>{
 const s=read('public/assets/project-paths.js');
 for(const marker of ['role','data-path-tab','aria-selected','ArrowRight','ArrowLeft','href','path-contact'])assert(s.includes(marker),marker);
 assert(!/fetch\\s*\\(|XMLHttpRequest|window\\.open/.test(s));
});
test('No fixed contact CTA obscures reading on mobile',()=>{
 assert(!read('public/assets/direction.js').includes('createElement'));
 assert(read('public/assets/portfolio-recovery.css').includes('.mobile-project-cta'));
});
