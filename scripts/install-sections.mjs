import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
for(const path of ['public/assets/sections/motion.js','public/assets/sections/interactions.js'])execFileSync(process.execPath,['--check',new URL(path,root).pathname],{stdio:'inherit'});
execFileSync(process.execPath,['--test',new URL('tests/sections.test.mjs',root).pathname],{stdio:'inherit'});
const file=new URL('index.html',root);let html=await readFile(file,'utf8');
const marker='<!-- portfolio-sections-motion-v1 -->';
if(!html.includes('</head>'))throw new Error('A página precisa conter head.');
if(!html.includes(marker))html=html.replace('</head>',`${marker}\n<link rel="stylesheet" href="/assets/sections/sections.css">\n<script type="module" src="/assets/sections/interactions.js"></script>\n</head>`);
// The existing CTA uses a light surface; the new section must preserve dark text.
if(!html.includes('id="sm-section-refinements"'))html=html.replace('</head>',`<style id="sm-section-refinements">
.sm-interactive-experience .immersive-content a{background:#f2f6df;color:#233c2d;border:1px solid #d2e0bb;border-radius:999px;padding:12px 17px;min-height:44px;display:inline-flex;align-items:center;gap:18px}
.sm-interactive-experience .immersive-content a:hover{background:#ffffff;color:#203a29}
.sm-interactive-experience .sm-demo-copy{min-height:170px}
</style>\n</head>`);
await writeFile(file,html);
console.log('PASS: módulos das seções instalados; hero original preservado');
