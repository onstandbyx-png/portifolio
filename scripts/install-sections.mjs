/* Validate canonical section imports. Build never rewrites editorial source. */
import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
for(const marker of ['portfolio-sections-motion-v1','portfolio-immersive-reference-v2','portfolio-reference-fidelity-v3','portfolio-kinetic-pass-v1'])assert(html.includes(marker),`Missing canonical module ${marker}`);
const modules=['sections/motion.js','sections/interactions.js','showcase/experiences.js','showcase/device-frame.js','kinetic-pass/kinetic-pass.js','kinetic-pass/kinetic-math.js','kinetic-pass/kinetic-curl.js','profile.js','direction.js','project-paths.js'];
for(const path of modules){await access(new URL('public/assets/'+path,root));execFileSync(process.execPath,['--check',new URL('public/assets/'+path,root).pathname],{stdio:'inherit'});}
for(const asset of ['sections/sections.css','showcase/experiences.css','showcase/social.css','showcase/device-frame.css','showcase/rebuild.css','kinetic-pass/kinetic-pass.css','kinetic-pass/gold-material.svg','badge-enhancements.css','direction.css','contact.css','smiile-landscape.webp','project-paths.css','creative/linha-campanha.svg','creative/linha-interface.svg','creative/direcao-editorial.svg','creative/narrativa.svg','creative/hero-editorial.svg','creative/og-cover.png','creative/symbols.ttf'])await access(new URL('public/assets/'+asset,root));
assert(!html.includes('src="https://midia-kit-production'),'Artwork must be served locally');
assert(!html.includes('/assets/showcase/fidelity.js'),'Obsolete universal device layer must not return');
const clip=await readFile(new URL('public/assets/kinetic-pass/material-loop.mp4',root));
assert(clip.length>10000&&clip.subarray(4,8).toString()==='ftyp','Continuous source clip missing or invalid');
const webm=await readFile(new URL('public/assets/kinetic-pass/material-loop.webm',root));
assert(webm.length>10000&&webm.subarray(0,4).toString('hex')==='1a45dfa3','Open-codec texture clip missing or invalid');
execFileSync(process.execPath,['--test',...['sections','fidelity','kinetic-pass','contact'].map(name=>new URL('tests/'+name+'.test.mjs',root).pathname)],{stdio:'inherit'});
console.log('PASS: canonical HTML, local assets, native media and section contracts; source unchanged');
