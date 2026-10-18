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
test('Outer presentations remain interactive while product mock content stays static',()=>{
 const entry=read('public/assets/showcase/static-init.js'),show=read('public/assets/showcase/static-presentations.js'),interaction=read('public/assets/sections/interactions.js');
 for(const mount of ['mountStaticPresentations','mountScrollGallery','mountEditorialStory','mountFatosDeck','mountScrollFilm'])assert(entry.includes(mount),mount);
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
