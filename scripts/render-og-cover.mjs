/* Capa de prévia de link (og:image, 1200 x 630) feita do próprio hero: título, descrição, a peça de origem,
   o telefone e o registro no quadro final (movimento reduzido), sem cabeçalho nem botões.
   Uso: node scripts/render-og-cover.mjs [BASE_URL], com o servidor no ar (padrão http://127.0.0.1:3000). */
import {createRequire} from 'node:module';
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
const {chromium}=require('playwright');
const base=(process.argv[2]||process.env.BASE_URL||'http://127.0.0.1:3000').replace(/\/$/,'');
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:1600,height:840},deviceScaleFactor:.75,reducedMotion:'reduce'});
 const page=await context.newPage();
 await page.goto(base+'/',{waitUntil:'load'});
 await page.waitForSelector('.ph-journey[data-ready]');
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'.sn-header{display:none!important}.planes-hero{padding-top:64px!important;min-height:840px!important}.ph-chips,.ph-honesty,.hj-link,.ph-actions{display:none!important}.ph-description{max-width:34ch!important;font-size:19px!important}.ph-journey{--hj-ph:300px!important;--hj-card:160px!important;--hj-log:196px!important}'});
 await page.waitForTimeout(1500);
 await page.screenshot({path:'public/assets/creative/og-cover.png'});
 console.log('public/assets/creative/og-cover.png 1200 x 630');
}finally{await browser.close();}
