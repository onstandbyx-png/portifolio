import {readFile,writeFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
for(const path of ['public/assets/sections/motion.js','public/assets/sections/interactions.js'])execFileSync(process.execPath,['--check',new URL(path,root).pathname],{stdio:'inherit'});
execFileSync(process.execPath,['--test',new URL('tests/sections.test.mjs',root).pathname],{stdio:'inherit'});
const file=new URL('index.html',root);let html=await readFile(file,'utf8');
const marker='<!-- portfolio-sections-motion-v1 -->';
if(!html.includes('</head>'))throw new Error('A página precisa conter head.');
if(!html.includes(marker))html=html.replace('</head>',`${marker}\n<link rel="stylesheet" href="/assets/sections/sections.css">\n<script type="module" src="/assets/sections/interactions.js"></script>\n</head>`);
// Local authored, scalable scenes replace source-PDF page screenshots.
const scenes={
  editorial:'/assets/showcase/scenes/materia-viva.svg',
  context:'/assets/showcase/scenes/contexto.svg',
  narrative:'/assets/showcase/scenes/narrativa.svg',
  campaign:'/assets/showcase/scenes/campanha.svg',
  systems:'/assets/showcase/scenes/sistemas.svg'
};
const replacements=[
 ['https://midia-kit-production-c234.up.railway.app/estudio/campanha-desconhecidos.webp',scenes.editorial],
 ['https://midia-kit-production-c234.up.railway.app/estudio/campanha-negocios.webp',scenes.campaign],
 ['Estudo editorial Fatos Desconhecidos em formato social','Composição editorial conceitual em formato social'],
 ['Composição Fatos Negócios para estudo de vídeo vertical','Composição conceitual de campanha em vídeo vertical'],
 ['src="/assets/fatos-roteiro.webp" alt="Página original do roteiro conceitual Fatos: pergunta, contexto e participação"',
  'src="'+scenes.editorial+'" alt="Arte botânica original do conceito Matéria viva"'],
 ['src="/assets/fatos-narrativa-detail.webp" alt="Prancha original de narrativa de campanha Fatos"',
  'src="'+scenes.campaign+'" alt="Arte original de campanha conceitual em tons de coral"'],
 ['src="/assets/fatos-editorial-detail.webp" alt="Pranchas da direção visual Editorial Essencial do Ecossistema Fatos"',
  'src="'+scenes.editorial+'" alt="Arte editorial original Matéria viva para o estudo de caso"'],
 ['src="/assets/fatos-roteiro.webp" alt="Página de roteiro do mídia kit Fatos 2026"',
  'src="'+scenes.editorial+'" alt="Arte editorial original para o primeiro capítulo"']
];
for(const [before,after] of replacements)html=html.replaceAll(before,after);
for(const path of Object.values(scenes))await access(new URL('public'+path,root));
assert(!html.includes('src="https://midia-kit-production-c234.up.railway.app/estudio/'),'Gallery must not depend on authenticated preview images');
console.log('PASS: peças editoriais distintas, SVG local nítido');
if(!html.includes('id="sm-section-refinements"'))html=html.replace('</head>',`<style id="sm-section-refinements">
.sm-interactive-experience .immersive-content a{background:#f2f6df;color:#233c2d;border:1px solid #d2e0bb;border-radius:999px;padding:12px 17px;min-height:44px;display:inline-flex;align-items:center;gap:18px}
.sm-interactive-experience .immersive-content a:hover{background:#ffffff;color:#203a29}
.sm-interactive-experience .sm-demo-copy{min-height:170px}
.sm-device[data-mode=mobile] .sm-demo-copy h3 br{display:initial}
.sm-sections-ready .vertical-video>img{filter:brightness(.28) saturate(.65);object-position:50% 50%}
.sm-sections-ready .mock-phone-image>img{object-position:50% 12%}
</style>\n</head>`);
const showcaseMarker='<!-- portfolio-immersive-reference-v2 -->';
if(!html.includes(showcaseMarker)) {
  html=html.replace('</head>',showcaseMarker+'\n'
    +'<link rel="stylesheet" href="/assets/showcase/experiences.css">\n'
    +'<link rel="stylesheet" href="/assets/showcase/social.css">\n'
    +'<script type="module" src="/assets/showcase/experiences.js"></script>\n</head>');
}
for(const path of ['public/assets/showcase/experiences.js','public/assets/showcase/experiences.css','public/assets/showcase/social.css']) {
  await access(new URL(path,root));
  if(path.endsWith('.js'))execFileSync(process.execPath,['--check',new URL(path,root).pathname],{stdio:'inherit'});
}
// Remove the obsolete orange phone + global MutationObserver remapping.
html=html.replace(/<!-- portfolio-device-fidelity-v2 -->\s*/g,'')
  .replace(/<link rel="stylesheet" href="\/assets\/showcase\/fidelity\.css">\s*/g,'')
  .replace(/<script type="module" src="\/assets\/showcase\/fidelity\.js"><\/script>\s*/g,'');
const rebuildMarker='<!-- portfolio-reference-fidelity-v3 -->';
if(!html.includes(rebuildMarker))html=html.replace('</head>',rebuildMarker+'\n'
    +'<link rel="stylesheet" href="/assets/showcase/device-frame.css">\n'
    +'<link rel="stylesheet" href="/assets/showcase/rebuild.css">\n'
    +'</head>');
for(const path of ['public/assets/showcase/device-frame.js','public/assets/showcase/device-frame.css','public/assets/showcase/rebuild.css'])
 await access(new URL(path,root));
execFileSync(process.execPath,['--check',new URL('public/assets/showcase/device-frame.js',root).pathname],{stdio:'inherit'});
execFileSync(process.execPath,['--test',new URL('tests/fidelity.test.mjs',root).pathname],{stdio:'inherit'});
// Independent interactive pass reconstructed from all 1,536 source frames.
const kineticMarker='<!-- portfolio-kinetic-pass-v1 -->';
if(!html.includes(kineticMarker))html=html.replace('</head>',kineticMarker+'\n'
 +'<link rel="stylesheet" href="/assets/kinetic-pass/kinetic-pass.css">\n'
 +'<script type="module" src="/assets/kinetic-pass/kinetic-pass.js"></script>\n</head>');
for(const path of ['kinetic-pass.js','kinetic-math.js','kinetic-curl.js','kinetic-pass.css','gold-material.svg']){
 await access(new URL('public/assets/kinetic-pass/'+path,root));
 if(path.endsWith('.js'))execFileSync(process.execPath,['--check',new URL('public/assets/kinetic-pass/'+path,root).pathname],{stdio:'inherit'});
}
execFileSync(process.execPath,['--test',new URL('tests/kinetic-pass.test.mjs',root).pathname],{stdio:'inherit'});
await writeFile(file,html);
console.log('PASS: módulos das seções instalados; hero original preservado');
