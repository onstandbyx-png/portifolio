import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sectionCopy} from '../public/assets/content/portfolio-copy.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('The offer and links describe the actual presentation',()=>{
 assert.match(read('index.html'),/Direção criativa/);
 assert.match(read('index.html'),/href="#laboratorio">Campanhas</);
 assert.match(read('index.html'),/Estudo conceitual/);
 assert.doesNotMatch(sectionCopy('narrativa-visual').cta.label,/Entrar no site/);
 assert.match(sectionCopy('narrativa-visual').cta.label,/Ampliar/);
});
test('Every gallery reverse explains a decision',()=>{
 for(const card of sectionCopy('trabalhos').cards)assert.ok(card.decision?.length>45,card.id);
 assert.match(read('public/assets/showcase/scroll-gallery.js'),/data-rg-to/);
});
test('Sites e lojas and Sistemas e automações mount the lab flows, without the old device transcript',()=>{
 const html=read('index.html');
 const secao=id=>html.match(new RegExp('<section[^>]*id="'+id+'"[\\s\\S]*?</section>'))?.[0]||'';
 assert.match(secao('editorial'),/data-vitrine="sites"/);
 assert.match(secao('sistemas'),/data-vitrine="sistemas"/);
 assert.doesNotMatch(html,/<details class="es-transcript">/);
 assert.equal(sectionCopy('colecao').cards.length,6);
});
test('Campaign context supplements the safe crossfade',()=>{
 const js=read('public/assets/showcase/static-presentations.js');
 assert.match(js,/data-campaign-note/);
 assert.match(js,/generation/);
});
test('Static art can be enlarged without a fake application',()=>{
 assert.match(read('public/assets/showcase/static-presentations.js'),/mountArtworkDialog/);
 const js=read('public/assets/showcase/artwork-dialog.js');
 assert.match(js,/showModal/);assert.match(js,/data-art-open/);
});
