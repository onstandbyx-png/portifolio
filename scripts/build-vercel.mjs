/* Static build for the Vercel preview: bundles the badges like build-badges.mjs and copies the site
   into dist/ with the same paths server.mjs serves. It skips install-sections.mjs on purpose: the
   preview may carry unfinished work, and the validation stays in npm run build. */
import {build} from 'esbuild';
import {copyFile, cp, mkdir, rm} from 'node:fs/promises';
await build({entryPoints:['src/badges/index.ts'],outdir:'public/assets/badge-build',bundle:true,splitting:true,format:'esm',platform:'browser',target:['es2022'],minify:true,sourcemap:false,chunkNames:'chunks/[name]-[hash]',logLevel:'info'});
await rm('dist',{recursive:true,force:true});
await mkdir('dist/criadores',{recursive:true});
await cp('public/assets','dist/assets',{recursive:true});
for(const [from,to] of [['index.html','index.html'],['src/styles.css','assets/portfolio.css'],['src/portfolio.js','assets/portfolio.js'],
  ['pages/criadores.html','criadores.html'],['pages/criadores-ao-vivo.html','criadores/ao-vivo.html'],['pages/vagas.html','vagas.html'],['pages/privacidade.html','privacidade.html']])await copyFile(from,'dist/'+to);
console.log('dist/ pronto para o Vercel');
