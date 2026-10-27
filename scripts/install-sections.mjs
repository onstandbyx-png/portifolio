/* Validate current section imports. Build never rewrites editorial source. */
import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
assert(html.includes('/assets/showcase/static-init.js'),'Static presentation entry missing');
assert(!/\b(?:src|href)=["'][^"']*\/kinetic-pass\//.test(html),'Archived studio must not initialize or preload assets');
const aliases={'/assets/portfolio.js':'src/portfolio.js','/assets/portfolio.css':'src/styles.css'};
const references=new Set([...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+)["']/g)].map(match=>match[1].split('?')[0]));
for(const reference of references){
 const file=new URL(aliases[reference]||'public'+reference,root);await access(file);
 if(reference.endsWith('.js'))execFileSync(process.execPath,['--check',file.pathname],{stdio:'inherit'});
}
for(const module of ['sections/motion.js','content/portfolio-copy.js','showcase/scroll-gallery.js','showcase/static-presentations.js','showcase/editorial-story.js','showcase/scroll-film.js'])execFileSync(process.execPath,['--check',new URL('public/assets/'+module,root).pathname],{stdio:'inherit'});
for(const asset of ['poster-pair-ff','poster-pair-bf','poster-pair-fb','poster-pair-bb','poster-single-0f','poster-single-0b','poster-single-1f','poster-single-1b'])await access(new URL(`public/assets/badges/${asset}.webp`,root));
assert(!html.includes('src="https://midia-kit-production'),'Artwork must be served locally');
execFileSync(process.execPath,['--test',...['sections','fidelity','contact','scroll-gallery','marcas','narrative','showcase-module-syntax'].map(name=>new URL('tests/'+name+'.test.mjs',root).pathname)],{stdio:'inherit'});
console.log('PASS: current imports, static artwork, contact and badge contracts; source unchanged');
