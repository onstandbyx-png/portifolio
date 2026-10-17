import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sectionCopy} from '../public/assets/content/portfolio-copy.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('The offer and links describe the actual presentation',()=>{
 assert.match(read('index.html'),/Direção criativa/);
 assert.match(read('index.html'),/Ver soluções/);
 assert.match(read('index.html'),/Estudo conceitual/);
 assert.doesNotMatch(sectionCopy('narrativa-visual').cta.label,/Entrar no site/);
 assert.match(sectionCopy('narrativa-visual').cta.label,/Ampliar/);
});
test('Every gallery reverse explains a decision',()=>{
 for(const card of sectionCopy('trabalhos').cards)assert.ok(card.decision?.length>45,card.id);
 assert.match(read('public/assets/showcase/scroll-gallery.js'),/data-rg-to/);
});
test('Editorial transcript is an optional accessible expansion',()=>{
 assert.match(read('index.html'),/<details class="es-transcript">/);
 assert.match(read('index.html'),/Ler o texto da peça/);
});
test('Campaign context supplements the safe crossfade',()=>{
 const js=read('public/assets/showcase/static-presentations.js');
 assert.match(js,/data-campaign-note/);
 assert.match(js,/duration: 600/);
 assert.match(js,/generation/);
});
test('Static art can be enlarged without a fake application',()=>{
 assert.match(read('public/assets/showcase/static-presentations.js'),/mountArtworkDialog/);
 const js=read('public/assets/showcase/artwork-dialog.js');
 assert.match(js,/showModal/);assert.match(js,/data-art-open/);
});
