// Browser acceptance helpers for outer motion. These do not modify components
// or fabricate pointer events; touch input is delivered through Chromium CDP.
const frames=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const align=async(page,selector)=>{await page.locator(selector).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-80,behavior:'instant'}));await frames(page);};
async function touch(page,start,end){
 const session=await page.context().newCDPSession(page);
 try{
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});
  for(let i=1;i<=12;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/12,y:start.y+(end.y-start.y)*i/12,id:1}]});await page.waitForTimeout(22);}
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }finally{await session.detach();}
}
async function seek(page,selector,progress,{heading=null,stage}={}){
 await page.locator(selector).evaluate((root,{progress,heading,stage})=>{
  const header=matchMedia('(max-width:760px)').matches?64:76;
  const headingHeight=heading?root.querySelector(heading).offsetHeight:0;
  const travel=root.offsetHeight-headingHeight-root.querySelector(stage).offsetHeight;
  scrollTo({top:scrollY+root.getBoundingClientRect().top+headingHeight-header+travel*progress,behavior:'instant'});
 },{progress,heading,stage});await frames(page);
}
async function nativeScroll(page,mobile){
 const {width,height}=page.viewportSize();
 // Clicking a film format invokes native smooth scrolling. Wait until it has
 // settled before sending an independent wheel gesture; otherwise Chromium
 // can finish the earlier scroll after the wheel and undo the measurement.
 if(!mobile)await page.waitForTimeout(650);
 const before=await page.evaluate(()=>scrollY);
 if(mobile)await touch(page,{x:width*.53,y:height*.7},{x:width*.53+2,y:height*.7-220});
 else{
  // Scroll over the empty stage margin, not the projected, focusable web mock.
  await page.mouse.move(width*.08,height*.68);
  await page.mouse.wheel(0,360);
 }
 try{
  await page.waitForFunction(before=>scrollY>before+60,before,null,{timeout:3500});
 }catch(error){
  if(mobile)throw error;
  // Still use a genuine mouse wheel event. This fallback exercises scrolling
  // after a smooth/scroll-restoration race, not a programmatic jump.
  await page.mouse.move(width*.91,height*.72);
  await page.mouse.wheel(0,420);
  await page.waitForFunction(before=>scrollY>before+60,before,null,{timeout:6500});
 }
 return await page.evaluate(()=>scrollY)>before+60;
}
async function imageChecks(images){
 return images.evaluateAll(async images=>Promise.all(images.map(async image=>{
  try{await image.decode();}catch{return false;}
  return image.naturalWidth>0&&image.naturalHeight>0&&image.getAttribute('src').startsWith('/assets/')&&image.alt.trim().length>10;
 })));
}

export async function verifyGallery({page,width,reduced,check,capture}){
 const shell=page.locator('.rg-scroll-shell[data-ready="true"]');await shell.waitFor();
 check('Three animated outer work cards retain one static artwork each',await shell.locator('[data-work-card]').count()===3&&await shell.locator('.rg-art img').count()===3);
 check('Work cards retain working section links',await shell.locator('.tile-open').evaluateAll(links=>links.length===3&&links.every(link=>link.hash&&document.getElementById(link.hash.slice(1)))));
 const natural=await shell.evaluate(el=>el.classList.contains('rg-natural'));
 if(reduced){
  check('Reduced motion exposes all projects in native flow',natural&&await shell.locator('.rg-plane').evaluateAll(planes=>planes.every(plane=>!plane.inert&&getComputedStyle(plane).visibility!=='hidden')));
  await shell.locator('.rg-plane').first().scrollIntoViewIfNeeded();
 }else{
  check('Desktop and mobile retain the scroll perspective presentation',!natural);
  await seek(page,'.rg-scroll-shell',.24,{stage:'.rg-sticky'});
  await page.waitForFunction(()=>[...document.querySelectorAll('.rg-plane')].some(plane=>Math.abs(parseFloat(getComputedStyle(plane).getPropertyValue('--rg-angle')))>5&&getComputedStyle(plane).transform!=='none'));
  check('Scrolling produces a visible outer perspective transition',await shell.locator('.rg-plane').evaluateAll(planes=>planes.some(plane=>Math.abs(parseFloat(getComputedStyle(plane).getPropertyValue('--rg-angle')))>5&&getComputedStyle(plane).transform!=='none')));
  await page.locator('#motion-toggle').click();
  await page.waitForFunction(()=>{const plane=document.querySelector('.rg-active');return document.querySelector('.rg-scroll-shell').dataset.paused==='true'&&Math.abs(parseFloat(getComputedStyle(plane).getPropertyValue('--rg-angle')))<.01;});
  check('Global pause settles the active work into a frontal reading pose',await shell.locator('.rg-active').evaluate(el=>parseFloat(getComputedStyle(el).getPropertyValue('--rg-y'))===0&&parseFloat(getComputedStyle(el).getPropertyValue('--rg-scale'))===1));
  await page.locator('#motion-toggle').click();
  await seek(page,'.rg-scroll-shell',.96,{stage:'.rg-sticky'});
  await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='2');
  check('Forward scroll reaches the last work',await shell.locator('.rg-active').getAttribute('data-rg-index')==='2');
  await seek(page,'.rg-scroll-shell',.02,{stage:'.rg-sticky'});
  await page.waitForFunction(()=>document.querySelector('.rg-active')?.dataset.rgIndex==='0');
  check('Reverse scroll restores the first work',await shell.locator('.rg-active').getAttribute('data-rg-index')==='0');
 }
 const card=shell.locator('[data-work-card]').first(),flip=card.locator('[data-rg-flip]');
 await flip.focus();await page.keyboard.press('Enter');
 check('Keyboard turns only the selected work and exposes its contribution',await flip.getAttribute('aria-pressed')==='true'&&await card.locator('.rg-card-back').getAttribute('aria-hidden')==='false'&&await card.locator('.rg-card-back').evaluate(el=>!el.inert)&&await shell.locator('[data-rg-flip][aria-pressed="true"]').count()===1);
 await page.keyboard.press('Escape');
 check('Escape returns the work image and retains usable keyboard focus',await flip.getAttribute('aria-pressed')==='false'&&await card.locator('.rg-card-back').evaluate(el=>el.inert)&&await flip.evaluate(el=>el===document.activeElement));
 check('Work artworks decode from local files',(await imageChecks(shell.locator('.rg-art img'))).every(Boolean));
 check('Native page scroll still responds after a work flip',await nativeScroll(page,width<500));
 await capture('work-motion');
}

export async function verifyEditorial({page,width,check,capture}){
 const story=page.locator('#editorial[data-editorial-ready="true"]');await story.waitFor();
 const tabs=story.locator('[data-editorial-step]');
 // Adjacent reading blocks were explicitly hidden; artwork controls remain.
 check('Editorial text and deck introduction stay outside the visible layout',!await story.locator('.es-context').isVisible()&&!await story.locator('.pf-fatos-intro').isVisible());
 check('The original editorial story keeps three moments and one device',await tabs.count()===3&&await story.locator('.es-device').count()===1&&await story.locator('[data-es-piece]:not([hidden])').count()===1);
 await tabs.first().focus();await page.keyboard.press('ArrowRight');
 check('Editorial keyboard navigation updates readable text and focus',await story.getAttribute('data-editorial-active')==='context'&&await tabs.nth(1).getAttribute('aria-selected')==='true'&&await tabs.nth(1).evaluate(el=>el===document.activeElement)&&(await story.locator('[data-es-copy]').textContent()).includes('Câmera, mapa, mensagens'));
 await page.keyboard.press('End');
 check('Editorial navigation reaches its closing moment',await story.getAttribute('data-editorial-active')==='closing'&&await story.locator('[data-es-piece]:not([hidden])').count()===1);
 await page.keyboard.press('Home');
 check('Editorial navigation reverses to the opening',await story.getAttribute('data-editorial-active')==='hook'&&await story.locator('#editorial-story-panel').getAttribute('aria-labelledby')===await tabs.first().getAttribute('id'));
 const deck=page.locator('#colecao[data-ready="true"]');await deck.waitFor();
 check('Six original Fatos cards return without the removed headings, pips or footer',await deck.locator('[data-fatos-card]').count()===6&&await page.locator('.pf-fatos-kicker,.pf-fatos-intro>h3,.pf-fatos-intro>p,.pf-fatos-pips,.pf-fatos-source,.editorial-bottom').count()===0);
 check('Previous and next are accessible alternatives to dragging',await deck.locator('[data-fatos-prev],[data-fatos-next]').evaluateAll(buttons=>buttons.length===2&&buttons.every(button=>{const r=button.getBoundingClientRect();return r.width>=44&&r.height>=44&&button.getAttribute('aria-label');})));
 await deck.locator('[data-fatos-next]').click();
 check('Next selects the second original card',await deck.getAttribute('data-active')==='1');
 await deck.locator('[data-fatos-prev]').click();
 check('Previous restores the first original card',await deck.getAttribute('data-active')==='0');
 const stage=deck.locator('.pf-fatos-stage');await stage.focus();await page.keyboard.press('End');
 check('Keyboard reaches the sixth Fatos card',await deck.getAttribute('data-active')==='5');
 await page.keyboard.press('Home');await align(page,'.pf-fatos-display');
 const first=deck.locator('.pf-fatos-card.is-active');await first.locator('[data-fatos-flip]').click();
 check('Fatos flip exposes its editorial context and focuses the return action',await first.locator('[data-fatos-back]').getAttribute('aria-hidden')==='false'&&await first.locator('[data-fatos-return]').evaluate(el=>el===document.activeElement));
 await page.keyboard.press('Escape');
 check('Escape restores the Fatos front and focus',await first.locator('[data-fatos-front]').getAttribute('aria-hidden')==='false'&&await first.locator('[data-fatos-flip]').evaluate(el=>el===document.activeElement));
 const box=await first.boundingBox(),start={x:box.x+box.width*.8,y:box.y+box.height*.4},end={x:box.x+box.width*.2,y:start.y+2};
 if(width<500)await touch(page,start,end);else{await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});await page.mouse.up();}
 await page.waitForFunction(()=>document.querySelector('#colecao').dataset.active==='1');
 check('A real horizontal gesture advances one Fatos card',await deck.getAttribute('data-active')==='1');
 const photos=await imageChecks(deck.locator('.pf-fatos-art'));
 check('The restored Fatos photographs decode locally',photos.length===6&&photos.every(Boolean));
 await align(page,'.pf-fatos-display');const selected=await deck.getAttribute('data-active');
 check('Vertical native scrolling remains available over the Fatos section',await nativeScroll(page,width<500)&&await deck.getAttribute('data-active')===selected);
 await capture('editorial-deck');
}

export async function verifyFilm({page,width,reduced,check,capture}){
 const film=page.locator('#narrativa-visual[data-ready="true"]');await film.waitFor();
 check('The scroll composition restores three outer planes',await film.locator('[data-rf-plane]').count()===3&&await film.locator('[data-rx-film-to]').count()===3);
 if(reduced){
  check('Reduced motion keeps all film planes in native flow',await film.getAttribute('data-mode')==='flow'&&await film.locator('[data-rf-plane]').evaluateAll(planes=>planes.every(el=>el.getAttribute('aria-hidden')==='false')));
  await film.locator('[data-rf-plane]').first().scrollIntoViewIfNeeded();
 }else{
  await seek(page,'#narrativa-visual',.96,{heading:'.rf-heading',stage:'.rf-stage'});
  await page.waitForFunction(()=>document.querySelector('#narrativa-visual').dataset.phase==='2');
  check('Forward film scroll reveals the site composition',await film.getAttribute('data-phase')==='2');
  await seek(page,'#narrativa-visual',.02,{heading:'.rf-heading',stage:'.rf-stage'});
  await page.waitForFunction(()=>document.querySelector('#narrativa-visual').dataset.phase==='0');
  check('Reverse film scroll restores the cover composition',await film.getAttribute('data-phase')==='0');
  await seek(page,'#narrativa-visual',.24,{heading:'.rf-heading',stage:'.rf-stage'});
  await page.locator('#motion-toggle').click();
  await page.waitForFunction(()=>document.querySelector('#narrativa-visual').dataset.paused==='true');
  check('Pause removes film tilt while keeping the selected composition',await film.locator('[data-rf-plane]').evaluateAll(planes=>planes.every(el=>parseFloat(el.style.getPropertyValue('--rf-ry'))===0&&parseFloat(el.style.getPropertyValue('--rf-z'))===0)));
  await page.locator('#motion-toggle').click();
  await film.locator('[data-rx-film-to="2"]').click();
  await page.waitForFunction(()=>{const root=document.querySelector('#narrativa-visual'),header=matchMedia('(max-width:760px)').matches?64:76,target=scrollY+root.getBoundingClientRect().top+root.offsetHeight-root.querySelector('.rf-stage').offsetHeight-header;return root.dataset.phase==='2'&&Math.abs(scrollY-target)<2;});
  check('Format selection remains available without entering a manual scroll lock',await film.getAttribute('data-mode')==='scroll'&&await page.locator('[data-rf-resume]').count()===0);
 }
 check('Native scroll remains available after film navigation',await nativeScroll(page,width<500));
 await capture('scroll-film');
}
