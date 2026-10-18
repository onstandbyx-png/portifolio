import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// CDP dispatches trusted browser touch input. scrollTo is used only to place a
// section before a gesture; assertions about native scrolling use touch/wheel.
// Physics inspection is injected into a test-only esbuild bundle. Production
// files and solver behavior are not changed to expose or improve test results.
const require=createRequire(process.env.QA_PACKAGE||import.meta.url);
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const {build}=createRequire(path.resolve('package.json'))('esbuild');
const output='qa/gestures',port=process.env.PORT||'4186';
const base=(process.env.BASE_URL||process.env.QA_URL||`http://127.0.0.1:${port}`).replace(/\/$/,'');
const groups=process.env.QA_GROUPS?.split(',');
const records=[];
await mkdir(output,{recursive:true});
const bundle=path.resolve(output,'badge-inspection');
const entry=await readFile('src/badges/index.ts','utf8');
assert(entry.includes('instance = pending;'),'Badge test instrumentation anchor exists');
await build({stdin:{contents:entry.replace('instance = pending;','instance = pending; (window as any).__badgeScene = instance;'),resolveDir:path.resolve('src/badges'),sourcefile:'index.ts',loader:'ts'},bundle:true,format:'esm',splitting:true,outdir:bundle,entryNames:'index',target:'es2022',logLevel:'silent'});
const server=process.env.BASE_URL||process.env.QA_URL?null:spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port},stdio:'inherit'});
let browser;

const align=async(page,selector,top=76)=>{
  await page.locator(selector).evaluate((el,offset)=>scrollTo({top:scrollY+el.getBoundingClientRect().top-offset,behavior:'instant'}),top);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
};
async function touchPath(page,start,end,{cancel=false,samples=12,observe}={}){
  const session=await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});
  for(let i=1;i<=samples;i++){
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/samples,y:start.y+(end.y-start.y)*i/samples,id:1}]});
    await page.waitForTimeout(22);if(observe)await observe();
  }
  await session.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
  await session.detach();
}
const metrics=page=>page.evaluate(()=>{
  const s=window.__badgeScene;if(!s)return null;
  const r=s.canvas.getBoundingClientRect();
  const projected=s.cardArt.map(art=>{
    const point=(x,y,z=.02)=>{const p=art.position.clone().set(x,y,z);art.localToWorld(p);p.project(s.camera);return{x:r.x+(p.x+1)*r.width/2,y:r.y+(1-p.y)*r.height/2};};
    const geometry=art.children[0].geometry;geometry.computeBoundingBox();const box=geometry.boundingBox;
    const corners=[point(box.min.x,box.min.y),point(box.max.x,box.min.y),point(box.max.x,box.max.y),point(box.min.x,box.max.y)];
    return{visible:art.visible&&s.rigRoots[s.cardArt.indexOf(art)].visible,center:point(0,-.2),corners,bounds:{left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))}};
  });
  return{time:performance.now(),dragging:s.dragging,pending:Boolean(s.pendingPointer),running:s.running,moving:s.rigs.some(rig=>rig.moving),angles:[...s.flipAngles],targets:[...s.flipTargets],cards:s.rigs.map(rig=>rig.cards[0]).map(b=>({p:{...b.p},q:{...b.q},v:{...b.v},w:{...b.w}})),projected,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
});
const norm=v=>Math.hypot(v.x,v.y,v.z);
const signedArea=points=>points.reduce((sum,p,i)=>{const next=points[(i+1)%points.length];return sum+p.x*next.y-p.y*next.x;},0)/2;
function intersectionArea(subject,clip){
  let output=subject;const winding=Math.sign(signedArea(clip));
  for(let i=0;i<clip.length;i++){
    const a=clip[i],b=clip[(i+1)%clip.length],side=p=>((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))*winding;
    const input=output;output=[];if(!input.length)break;
    let previous=input.at(-1),before=side(previous);
    for(const current of input){const now=side(current);if((now>=0)!==(before>=0)){const t=before/(before-now);output.push({x:previous.x+(current.x-previous.x)*t,y:previous.y+(current.y-previous.y)*t});}if(now>=0)output.push(current);previous=current;before=now;}
  }
  return Math.abs(signedArea(output));
}

const finiteSample=sample=>sample.cards.every(card=>Object.values(card).every(vector=>Object.values(vector).every(Number.isFinite)))&&sample.angles.every(Number.isFinite);

try{
  let healthy=false;for(let i=0;i<60;i++){try{healthy=(await fetch(base+'/health')).ok;if(healthy)break;}catch{}await new Promise(resolve=>setTimeout(resolve,200));}assert(healthy,'Server is reachable');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const widths=process.env.QA_WIDTHS?.split(',').map(Number);
  for(const [width,height] of [[390,748],[320,640],[1440,900]].filter(([w])=>!widths||widths.includes(w))){
    const mobile=width<500,context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
    const page=await context.newPage();page.setDefaultTimeout(12000);
    const row={width,height,checks:[],failures:[],errors:[],physics:[]};records.push(row);
    page.on('pageerror',error=>row.errors.push(String(error)));
    await page.addInitScript(()=>{window.__trustedGestureEvents=[];for(const type of ['pointerdown','pointerup','pointercancel'])document.addEventListener(type,event=>{if(event.target.closest?.('[data-badge-canvas],.pf-fatos-stage,.sa-media'))window.__trustedGestureEvents.push({type:event.type,trusted:event.isTrusted,pointer:event.pointerType});},true);});
    await page.route('**/assets/badge-build/**',route=>route.fulfill({path:path.join(bundle,path.basename(new URL(route.request().url()).pathname)),contentType:'application/javascript'}));
    const check=(name,value)=>{row.checks.push({name,pass:Boolean(value)});assert(value,name);};
    const capture=async(name,locator=page)=>locator.screenshot({path:`${output}/${name}-${width}x${height}.png`,animations:'disabled'});
    const group=async(name,run)=>{if(groups&&!groups.includes(name))return;try{await run();}catch(error){row.failures.push({group:name,error:String(error)});await capture('failure-'+name).catch(()=>{});console.error(`[gestures ${width}/${name}] ${String(error)}`);}};
    try{
      await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('html[data-static-presentations="ready"]',{state:'attached',timeout:30000});
      await group('hero-physics',async()=>{
        await align(page,'.hero-badge-exhibit');await page.waitForFunction(()=>window.__badgeScene?.initialized,null,{timeout:25000});
        await page.waitForTimeout(150);
        const collect=async(label)=>{const sample=await metrics(page);row.physics.push({label,...sample});return sample;};
        let state=await collect('initial');check('Hero uses the live WebGL rig',await page.locator('[data-portfolio-badges]').getAttribute('data-state')==='ready'&&state.cards.length===2);
        const firstPoint=state.projected[0].center,beforeTargets=state.targets;
        if(mobile)await page.touchscreen.tap(firstPoint.x,firstPoint.y);else await page.mouse.click(firstPoint.x,firstPoint.y);
        await page.waitForFunction(previous=>window.__badgeScene.flipTargets.some((target,index)=>target!==previous[index]),beforeTargets);
        check('A tap on the actual canvas turns a physical card mesh',await page.evaluate(previous=>window.__badgeScene.flipTargets.some((target,index)=>target!==previous[index]),beforeTargets));
        await page.locator('[data-badge-flip]').focus();await page.keyboard.press('Escape');
        for(let i=0;i<12;i++){await page.locator('[data-badge-flip]').click();await page.waitForTimeout(24);await collect('rapid-flip-'+i);}
        check('Repeated flipping does not add physical impulses',row.physics.filter(s=>s.label.startsWith('rapid-flip-')).every(s=>s.cards.every(c=>norm(c.v)<.05&&norm(c.w)<.05)));
        check('No separate push control competes with the contextual flip',await page.locator('[data-badge-swing],[data-badge-card-flip]').count()===0);
        await page.locator('[data-badge-flip]').focus();await page.keyboard.press('Escape');await align(page,'.hero-badge-exhibit');
        await page.locator('[data-badge-flip]').click();
        await page.waitForFunction(()=>Math.abs(window.__badgeScene.flipAngles[0]-Math.PI)<.03,null,{timeout:6000});
        state=await collect('reverse-before-drag');
        check('The actual card mesh has turned to its reverse',Math.abs(state.angles[0]-Math.PI)<.03);
        const start=state.projected[0].center,end={x:Math.min(width-8,start.x+(mobile?180:280)),y:Math.max(80,start.y-(mobile?72:200))};
        if(mobile)await touchPath(page,start,end,{observe:()=>collect('reverse-touch-drag')});
        else{await page.mouse.move(start.x,start.y);await page.mouse.down();for(let i=1;i<=12;i++){await page.mouse.move(start.x+(end.x-start.x)*i/12,start.y+(end.y-start.y)*i/12);await page.waitForTimeout(22);await collect('reverse-mouse-drag');}await page.mouse.up();}
        // A relative clamp must not be re-based farther away with every drag.
        for(let gesture=0;gesture<20;gesture++){
          const current=await collect('repeat-start-'+gesture),from=current.projected[0].center,to={x:Math.min(width-8,from.x+120),y:Math.max(80,from.y-15)};
          if(mobile)await touchPath(page,from,to,{samples:6,observe:()=>collect('repeat-drag-'+gesture)});
          else{await page.mouse.move(from.x,from.y);await page.mouse.down();for(let i=1;i<=6;i++){await page.mouse.move(from.x+(to.x-from.x)*i/6,from.y+(to.y-from.y)*i/6);await page.waitForTimeout(22);await collect('repeat-drag-'+gesture);}await page.mouse.up();}
        }
        for(let i=0;i<18;i++){await page.waitForTimeout(80);await collect('release-'+i);}
        check('The real pointer gesture acquired and released the physical drag joint',row.physics.some(s=>s.dragging>=0)&&(await metrics(page)).dragging===-1);
        check('Rapid flips and reverse dragging keep finite physical poses',row.physics.every(finiteSample));
        check('Linear speed remains within the 1.6 unit/s solver limit',Math.max(...row.physics.flatMap(s=>s.cards.map(c=>norm(c.v))))<=1.6001);
        check('Angular speed remains within the 2.4 rad/s solver limit',Math.max(...row.physics.flatMap(s=>s.cards.map(c=>norm(c.w))))<=2.4001);
        check('Card centers stay inside the canvas throughout the gesture',row.physics.every(s=>s.projected.filter(p=>p.visible).every(p=>p.center.x>=s.rect.left-10&&p.center.x<=s.rect.right+10&&p.center.y>=s.rect.top-10&&p.center.y<=s.rect.bottom+10)));
        await page.waitForFunction(()=>window.__badgeScene.rigs.every(rig=>!rig.moving),null,{timeout:18000});
        state=await collect('settled');
        check('The rig settles after release without drifting indefinitely',!state.moving&&state.cards.every(c=>norm(c.v)<.05&&norm(c.w)<.05));
        const visible=state.projected.filter(p=>p.visible);
        if(mobile)check('Mobile shows a single readable card silhouette',visible.length===1);
        else {const [first,second]=visible.map(p=>p.corners),overlap=intersectionArea(first,second);check('Desktop badge faces remain entirely uncovered',visible.length===2&&overlap<1);}
        await capture('hero-after-gestures',page.locator('.hero-badge-exhibit'));
        if(mobile){
          const cancelStart=state.projected[0].center;
          await touchPath(page,cancelStart,{x:Math.min(width-8,cancelStart.x+110),y:cancelStart.y-12},{cancel:true,observe:()=>collect('before-cancel')});
          check('Touch cancellation releases the joint and pending tap',await page.evaluate(()=>window.__badgeScene.dragging===-1&&!window.__badgeScene.pendingPointer));
          const faces=await page.locator('[data-portfolio-badges]').getAttribute('data-face'),before=await page.evaluate(()=>scrollY);
          const canvas=await page.locator('[data-badge-canvas]').boundingBox();const x=canvas.x+canvas.width/2,y=Math.min(height-70,canvas.y+canvas.height*.73);
          await touchPath(page,{x,y},{x:x+2,y:y-200});await page.waitForTimeout(80);
          check('Vertical touch on the hero scrolls the document without flipping a card',await page.evaluate(()=>scrollY)>before+60&&await page.locator('[data-portfolio-badges]').getAttribute('data-face')===faces);
          check('Touch regression uses trusted touch input, including cancellation',await page.evaluate(()=>window.__trustedGestureEvents.some(e=>e.type==='pointercancel'&&e.trusted&&e.pointer==='touch')));
        }
      });
      await group('page',async()=>{check('No document overflow at the tested viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));check('No uncaught JavaScript errors',row.errors.length===0);});
    }finally{await context.close();}
    console.log(`[gestures ${width}x${height}] ${row.checks.filter(c=>c.pass).length} passed, ${row.failures.length} failed groups`);
  }
}finally{await browser?.close();server?.kill();await writeFile(`${output}/${process.env.QA_REPORT||'results.json'}`,JSON.stringify({base,groups,records},null,2));}
if(records.some(row=>row.failures.length))throw new Error('Gesture regression failed; inspect qa/gestures/results.json');
