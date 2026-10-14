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
// The reference site's image endpoints require authentication (HTTP 401).
// Use the user's original editorial materials already versioned in this public repo.
const replacements=[
 ['https://midia-kit-production-c234.up.railway.app/estudio/campanha-desconhecidos.webp','/assets/fatos-desconhecidos.webp'],
 ['https://midia-kit-production-c234.up.railway.app/estudio/campanha-negocios.webp','/assets/fatos-narrativa-detail.webp'],
 ['Estudo editorial Fatos Desconhecidos em formato social','Material editorial original do Fatos em um estudo de formato social'],
 ['Composição Fatos Negócios para estudo de vídeo vertical','Direção visual original do Fatos para um estudo de narrativa em vídeo']
];
for(const [before,after] of replacements)html=html.replaceAll(before,after);
for(const name of ['fatos-desconhecidos.webp','fatos-narrativa-detail.webp'])await access(new URL('public/assets/'+name,root));
assert(!html.includes('src="https://midia-kit-production-c234.up.railway.app/estudio/'),'Public gallery cannot depend on authenticated reference images');
console.log('PASS: imagens editoriais locais, sem dependência de endpoints protegidos');
if(!html.includes('id="sm-section-refinements"'))html=html.replace('</head>',`<style id="sm-section-refinements">
.sm-interactive-experience .immersive-content a{background:#f2f6df;color:#233c2d;border:1px solid #d2e0bb;border-radius:999px;padding:12px 17px;min-height:44px;display:inline-flex;align-items:center;gap:18px}
.sm-interactive-experience .immersive-content a:hover{background:#ffffff;color:#203a29}
.sm-interactive-experience .sm-demo-copy{min-height:170px}
.sm-device[data-mode=mobile] .sm-demo-copy h3 br{display:initial}
.sm-sections-ready .vertical-video>img{filter:brightness(.28) saturate(.65);object-position:50% 50%}
.sm-sections-ready .mock-phone-image>img{object-position:50% 12%}
</style>\n</head>`);
await writeFile(file,html);
console.log('PASS: módulos das seções instalados; hero original preservado');
