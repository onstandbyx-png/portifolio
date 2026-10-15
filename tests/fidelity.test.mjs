import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Static presentation assets are local WebP files, including every campaign channel',()=>{
 for(const name of ['fatos-editorial','fatos-esportes','fatos-crencas','fatos-sobrenaturais','fatos-nerd','fatos-negocios','campanha-meta','campanha-google','campanha-tiktok','casa-costa','trilhas']){
  const art=readFileSync(new URL(`../public/assets/portfolio/static-r8/${name}.webp`,import.meta.url));
  assert.equal(art.subarray(0,4).toString(),'RIFF',name);
  assert.equal(art.subarray(8,12).toString(),'WEBP',name);
  assert(art.length>1000,name);
 }
});
test('The active presentation mounts static artwork without retired nested interfaces',()=>{
 const entry=read('public/assets/showcase/static-init.js'),show=read('public/assets/showcase/static-presentations.js'),interaction=read('public/assets/sections/interactions.js');
 assert(entry.includes('mountStaticPresentations')&&entry.includes('mountScrollGallery'));
 for(const source of [entry,show,interaction])assert(!/(?:createDeviceFrame|showModal|data-fatos-flip|data-product-tab|data-app-action|data-call-play)/.test(source));
 assert(show.includes('data-sp-tab')&&show.includes('role="tabpanel"'),'Campaign navigation remains accessible');
});
test('Project services are navigable and do not send data',()=>{
 const s=read('public/assets/project-paths.js');
 for(const marker of ['<details','<summary','data-service-scope','href="#contato"','path-contact','data-service-id','select.dispatchEvent'])assert(s.includes(marker),marker);
 assert(!s.includes('XMLHttpRequest')&&!s.includes('window.open')&&!s.includes('fetch('),'Service selection must not send visitor data');
});
test('No fixed contact CTA obscures reading on mobile',()=>{
 assert(!read('public/assets/direction.js').includes('createElement'));
});
