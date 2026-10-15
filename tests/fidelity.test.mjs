import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
test('same iPhone shell drives editorial and scroll narrative',async()=>{
  const [js,css,source]=await Promise.all([
    read('public/assets/showcase/fidelity.js'),
    read('public/assets/showcase/fidelity.css'),
    read('public/assets/showcase/social.css')
  ]);
  assert.match(source,/\.rx-iphone\{/);
  for(const marker of ['rx-iphone','pf-matched-phone','pf-editorial-device','data-pf-film','data-pf-next','pointerup'])assert(js.includes(marker),marker);
  for(const marker of ['aspect-ratio:412 \/ 825','prefers-reduced-motion','max-width:620px','pf-system-art'])assert(css.includes(marker),marker);
  assert.match(js,/MutationObserver/);
});
test('generated photograph is local, not a copied PDF screenshot',async()=>{
  const asset=await stat(new URL('public/assets/showcase/fatos-editorial-scene.webp',root));
  assert(asset.size>2500 && asset.size<200_000,'Local optimized asset is required');
  const js=await read('public/assets/showcase/fidelity.js');
  assert(!js.includes('src="https://midia-kit-production'));
  assert(js.includes('fatos-editorial-scene.webp'));
});
test('mobile scroll-film scale stays within the intended range',async()=>{
  const source=await read('public/assets/showcase/experiences.js');
  assert(source.includes('innerWidth<620?1.15:2.07'));
});
