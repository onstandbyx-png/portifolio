// Render the loading/reduced-motion images from the production scene itself.
// No independently designed HTML cards are used as a second representation.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const port=process.env.PORT||'4191';
const base=`http://127.0.0.1:${port}`;
const output='public/assets/badges';
const bundle=await build({entryPoints:['src/badges/badge/BadgeScene.ts'],bundle:true,format:'esm',target:'es2022',write:false,logLevel:'silent'});
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
let browser;
try{
 for(let attempt=0;attempt<60;attempt++){
  try{if((await fetch(base+'/health')).ok)break;}catch{}
  await new Promise(resolve=>setTimeout(resolve,150));
 }
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:870,height:600},deviceScaleFactor:2});
 await page.route('**/assets/poster-renderer.js',route=>route.fulfill({body:bundle.outputFiles[0].text,contentType:'text/javascript'}));
 await page.route(base+'/poster-render',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/assets/portfolio.css"><style>html,body{margin:0;width:100%;height:100%;background:transparent}canvas{display:block;width:100vw;height:100vh}</style><canvas></canvas>'}));
 await page.goto(base+'/poster-render');
 await page.evaluate(async()=>{
  await document.fonts.ready;
  await document.fonts.load('600 32px Inter');
  const {BadgeScene}=await import('/assets/poster-renderer.js');
  window.scene=new BadgeScene(document.querySelector('canvas'),{
   enter:false,
   front:{name:'Fatos',label:'DIREÇÃO CRIATIVA',line:'Narrativa e conteúdo para grandes audiências.'},
   back:{name:'smiile',label:'PROJETO DIGITAL',line:'Da interface à experiência.'}
  });
  await window.scene.init();window.scene.setActive(false);
 });
 await mkdir(output,{recursive:true});
 const variants=[
  ...['ff','bf','fb','bb'].map(faces=>({key:`pair-${faces}`,faces,selected:0,width:870,height:600})),
  ...[0,1].flatMap(selected=>['f','b'].map(face=>({key:`single-${selected}${face}`,faces:selected===0?`${face}f`:`f${face}`,selected,width:410,height:500}))),
 ];
 for(const variant of variants){
  await page.setViewportSize({width:variant.width,height:variant.height});
  const data=await page.evaluate(({faces,selected})=>{
   window.scene.resize();
   window.scene.rest();
   window.scene.setCardFlipped(0,faces[0]==='b',false);
   window.scene.setCardFlipped(1,faces[1]==='b',false);
   window.scene.setSelectedCard(selected,false);
   // snapshot draws synchronously before serializing the transparent buffer.
   window.scene.snapshot();
   return document.querySelector('canvas').toDataURL('image/webp',.94);
  },variant);
  const bytes=Buffer.from(data.split(',')[1],'base64');
  const file=path.join(output,`poster-${variant.key}.webp`);
  await writeFile(file,bytes);console.log(`${file}: ${bytes.length} bytes`);
 }
 await page.evaluate(()=>window.scene.dispose());
}finally{await browser?.close();server.kill();}
