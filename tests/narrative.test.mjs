import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sectionCopy} from '../public/assets/content/portfolio-copy.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('The offer and links describe the actual presentation',()=>{
 // Hero Planes (faixa escura, seda e jornada viva): a oferta numa linha e duas ações, uma delas para uma jornada inteira.
 const html=read('index.html');
 assert.match(html,/<section class="planes-hero" data-tone="dark" aria-labelledby="hero-title">/);
 assert.match(html,/<h1 id="hero-title">[\s\S]*?>Do anúncio<\/span>[\s\S]*?>ao caixa\.<\/span>/);
 assert.match(html,/class="ph-eyebrow">[\s\S]*?Smile N · direção criativa, campanhas e automação/);
 assert.match(html,/class="ph-primary" href="#sistemas\/agente">Ver uma jornada completa/);
 assert.match(html,/class="ph-secondary" href="#laboratorio">Ver campanhas em 16 canais/);
 const description=html.match(/class="ph-description">([\s\S]*?)<\/p>/)[1];
 for(const term of ['campanha','atendimento com IA','pessoa','Pix','anúncio'])assert.ok(description.includes(term),term);
 assert.match(html,/href="#laboratorio">Campanhas</);
 assert.match(html,/<header class="site-header sn-header sn-dark" id="site-header">/);
 assert.match(html,/data-sn-trigger aria-expanded="false" aria-controls="sn-panel-trabalhos">Trabalhos/);
 for(const target of ['#laboratorio','#editorial','#sistemas/agente'])assert.match(html,new RegExp('<a class="sn-link" href="'+target+'" data-sn-item="[a-z]+">'));
 assert.match(html,/id="motion-toggle" class="sn-pause motion-toggle"/);
 assert.match(html,/id="menu-toggle"[^>]*aria-controls="mobile-nav"/);
 assert.match(html,/<nav class="sn-nav sn-nav-mobile" id="mobile-nav"[^>]*hidden>/);
 assert.match(html,/<section id="mural"[^>]*data-mural/);
 assert.doesNotMatch(html,/data-portfolio-badges|hero-v2|badge-build|fatos/i);
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
