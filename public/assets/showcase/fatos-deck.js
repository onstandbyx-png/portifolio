/* Six independent interactive capabilities using the existing physical deck, gesture physics and accessibility contracts. */
import { clamp, createMotion } from '../sections/motion.js';
import { referenceCards, referenceFront, referenceBack, mountReferenceInteractions } from './reference-cards.js';
// Four services rebuilt from the owner's reference cards; the deck physics below are unchanged.
const brands = referenceCards.map(card => ({ ...card, question: card.plainTitle, approach: card.lead, color: '#9CCBB0' }));
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const make = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const $ = (selector, root) => root.querySelector(selector);

export function mountFatosDeck() {
  const anchor = document.querySelector('#editorial');
  if (!anchor) return null;
  const existing = anchor.querySelector('#colecao');
  if (existing) return existing;
  const motion = createMotion();
  const shell = make(`<section id="colecao" class="pf-fatos-deck shell" aria-label="Quatro serviços em cartões interativos" data-active="0">
    <div class="pf-fatos-intro">
      <div class="pf-fatos-context"><span data-fatos-index>01 / ${String(brands.length).padStart(2,'0')}</span><strong data-fatos-name></strong><h4 data-fatos-question></h4><p data-fatos-territory></p></div>
    </div>
    <div class="pf-fatos-display"><div class="pf-fatos-stage" role="region" aria-roledescription="carrossel" aria-label="Cartões de serviços" tabindex="0"></div><div class="pf-fatos-navigation" role="group" aria-label="Navegar pelas composições"><button type="button" data-fatos-prev aria-label="Composição anterior"><span aria-hidden="true">←</span></button><p class="pf-fatos-counter" role="status" aria-live="polite"></p><button type="button" data-fatos-next aria-label="Próxima composição"><span aria-hidden="true">→</span></button></div></div>
  </section>`);
  const bottom = anchor.querySelector('.editorial-bottom');
  if (bottom) bottom.before(shell); else anchor.append(shell);
  const stage = $('.pf-fatos-stage', shell);
  let active = 0, drag = null, lastSwipe = -Infinity, arrival = null, departure = null, settlement = null, flightToken = 0;
  const cards = brands.map((brand, i) => {
    const card = make(`<article class="pf-fatos-card" data-fatos-card="${brand.id}" data-ref-card data-tone="${brand.tone}" aria-label="${i + 1} de ${brands.length}: ${escape(brand.name)}"><div class="pf-fatos-rotor"><div class="pf-fatos-face pf-fatos-front rc-face rc-front" data-fatos-front>${referenceFront(brand)}</div><div class="pf-fatos-face pf-fatos-back rc-face rc-back" data-fatos-back aria-hidden="true" inert>${referenceBack(brand)}</div></div></article>`);
    card.style.setProperty('--fatos-accent', brand.color);
    $('[data-fatos-flip]', card).addEventListener('click', () => flip(true, true));
    $('[data-fatos-return]', card).addEventListener('click', () => flip(false, true));
    stage.append(card); return card;
  });
  mountReferenceInteractions(stage);
  $('[data-fatos-prev]', shell).addEventListener('click', () => go(active - 1));
  $('[data-fatos-next]', shell).addEventListener('click', () => go(active + 1));
  function setFace(card, open) {
    card.classList.toggle('is-flipped', open);
    const front = $('[data-fatos-front]', card), back = $('[data-fatos-back]', card);
    front.inert = open; back.inert = !open;
    front.setAttribute('aria-hidden', String(open)); back.setAttribute('aria-hidden', String(!open));
    $('[data-fatos-flip]', card).setAttribute('aria-expanded', String(open));
  }
  function flip(open, moveFocus = false) {
    if (performance.now() - lastSwipe < 250) return;
    const card = cards[active]; setFace(card, open);
    // Opening lands at the start of the back, so Tab continues into the demo and its CTA.
    if (open) $('[data-fatos-back]', card).scrollTop = 0;
    if (moveFocus) $(open ? '[data-fatos-back-title]' : '[data-fatos-flip]', card).focus({ preventScroll: true });
  }
  function paint() {
    shell.dataset.active = String(active);
    cards.forEach((card, i) => {
      const position = (i - active + cards.length) % cards.length;
      card.dataset.position = String(position); card.classList.toggle('is-active', i === active);
      card.inert = i !== active; card.setAttribute('aria-hidden', String(i !== active)); setFace(card, false);
    });
    $('[data-fatos-index]', shell).textContent = String(active + 1).padStart(2, '0') + ' / ' + String(brands.length).padStart(2,'0');
    $('[data-fatos-name]', shell).textContent = brands[active].name;
    $('[data-fatos-question]', shell).textContent = brands[active].question;
    $('[data-fatos-territory]', shell).textContent = brands[active].approach;
    $('.pf-fatos-counter', shell).textContent = (active + 1) + ' de ' + brands.length + ' · ' + brands[active].short;
  }
  const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('is-paused');
  // The reference's idle sections are stable, with a faint patterned light
  // following a fine pointer. Keep this completely independent of card physics.
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  let glintFrame=0,glintCard=null,glintCoordinates=null;
  function clearGlint(){
    if(glintFrame){cancelAnimationFrame(glintFrame);glintFrame=0;}
    glintCard?.classList.remove('is-illuminated');
    glintCard=null;glintCoordinates=null;
  }
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
    if(!finePointer.matches||reduced()||drag||stage.dataset.motion==='exchange'){clearGlint();return;}
    const card=event.target.closest('.pf-fatos-card.is-active:not(.is-flipped)');
    if(!card||!stage.contains(card)){clearGlint();return;}
    if(glintCard!==card){clearGlint();glintCard=card;}
    const rect=card.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    glintCoordinates={
      x:Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100)),
      y:Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))
    };
    if(glintFrame)return;
    glintFrame=requestAnimationFrame(()=>{
      glintFrame=0;
      if(!glintCard||!glintCoordinates)return;
      glintCard.style.setProperty('--fatos-light-x',glintCoordinates.x.toFixed(1)+'%');
      glintCard.style.setProperty('--fatos-light-y',glintCoordinates.y.toFixed(1)+'%');
      glintCard.classList.add('is-illuminated');
    });
  },{passive:true});
  stage.addEventListener('pointerleave',clearGlint,{passive:true});
  stage.addEventListener('pointerdown',clearGlint,{passive:true});
  function clearFlight(){
    clearGlint();
    flightToken++;
    arrival?.cancel();departure?.cancel();settlement?.cancel();
    arrival=null;departure=null;settlement=null;
    cards.forEach(card=>{
      card.classList.remove('is-departing');
      card.style.removeProperty('transition');
      card.style.removeProperty('transform');
      card.style.removeProperty('opacity');
      card.style.removeProperty('z-index');
    });
    stage.dataset.motion='idle';
  }
  // Four exchanges in the 25s reference settle in roughly 0.45–0.55s.
  // Keep each DOM card persistent; only the physical position is animated.
  const EXCHANGE_MS=480;
  function go(index,released=null){
    const next=(index+cards.length)%cards.length;
    if(next===active)return;
    const previous=cards[active],incoming=cards[next];
    const focusWasOnCard=previous.contains(document.activeElement);
    const offset=(next-active+cards.length)%cards.length;
    const direction=released?.direction??(offset<=cards.length/2?1:-1);
    const incomingFrom=released?.incomingFrom||getComputedStyle(incoming).transform;
    const previousFrom=released?.transform||previous.style.transform||'translateX(0px) rotate(0deg) scale(1)';
    cancelDrag(false);
    clearFlight();
    const token=flightToken;
    active=next;
    paint();
    if(!reduced()){
      stage.dataset.motion='exchange';
      stage.dataset.referenceTiming=String(EXCHANGE_MS);
      const distance=Math.min(previous.getBoundingClientRect().width*.76,305);
      const exit='translate3d('+(-direction*distance)+'px,-10px,0) rotate('+(-direction*8.5)+'deg) scale(.946)';
      previous.classList.add('is-departing');
      previous.style.transition='none';
      previous.style.zIndex='12';
      departure=previous.animate([
        {offset:0,transform:previousFrom,opacity:1},
        {offset:.18,transform:'translate3d('+(-direction*distance*.11)+'px,-2px,0) rotate('+(-direction*2)+'deg) scale(.996)',opacity:1},
        {offset:.76,transform:'translate3d('+(-direction*distance*.92)+'px,-10px,0) rotate('+(-direction*7.3)+'deg) scale(.952)',opacity:1},
        {offset:.94,transform:exit,opacity:.96},
        {offset:1,transform:exit,opacity:0}
      ],{duration:EXCHANGE_MS,easing:'cubic-bezier(.23,.74,.24,1)',fill:'both'});
      incoming.style.transition='none';
      arrival=incoming.animate([
        {offset:0,transform:incomingFrom==='none'?'translateX(20px) rotate(4deg) scale(.97)':incomingFrom,opacity:1},
        {offset:.70,transform:'translate3d('+(direction*3)+'px,-2px,0) rotate('+(direction*.65)+'deg) scale(1.017)',opacity:1},
        {offset:1,transform:'translate3d(0,0,0) rotate(0deg) scale(1)',opacity:1}
      ],{duration:EXCHANGE_MS,easing:'cubic-bezier(.20,.78,.22,1)',fill:'both'});
      Promise.allSettled([departure.finished,arrival.finished]).then(()=>{
        if(token!==flightToken)return;
        previous.classList.remove('is-departing');
        previous.style.removeProperty('transition');
        previous.style.removeProperty('z-index');
        incoming.style.removeProperty('transition');
        arrival?.cancel();departure?.cancel();
        arrival=null;departure=null;
        stage.dataset.motion='idle';
      });
    }
    if(focusWasOnCard)$('[data-fatos-flip]',cards[active]).focus({preventScroll:true});
  }
  shell.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cards[active].classList.contains('is-flipped')) { event.preventDefault(); flip(false, true); return; }
    // Keys pressed inside a demo belong to its controls, not to deck navigation.
    if (event.target.closest?.('[data-fatos-back],input,select,textarea,[contenteditable]')) return;
    const destinations = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: brands.length - 1 };
    if (event.key in destinations) { event.preventDefault(); go(destinations[event.key]); }
  });
  // A link elsewhere can name a capability; it opens that card's front without flipping it.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-deck-card]');
    const index = link ? brands.findIndex(brand => brand.id === link.dataset.deckCard) : -1;
    if (index >= 0) go(index);
  });
  function cancelDrag(animate=true){
    const current=drag;
    drag=null;delete stage.dataset.dragging;delete stage.dataset.direction;
    if(!current)return;
    const from=current.card.style.transform;
    current.card.style.removeProperty('transform');
    current.card.style.removeProperty('transition');
    current.card.style.removeProperty('opacity');
    if(current.preview){
      current.preview.style.removeProperty('transition');
      current.preview.style.removeProperty('transform');
      current.preview.style.removeProperty('opacity');
    }
    if(stage.hasPointerCapture?.(current.id))stage.releasePointerCapture(current.id);
    if(animate&&current.axis==='horizontal'&&from&&!reduced()){
      settlement?.cancel();
      settlement=motion.spring(current.card,progress=>({
        transform:'translate3d('+(current.offset*(1-progress))+'px,'+(-5*current.progress*(1-progress))+'px,0) rotate('+(current.rotation*(1-progress))+'deg) scale('+(1-.045*current.progress*(1-progress))+')',
        opacity:1-.1*current.progress*(1-progress)
      }),{duration:380,name:'smooth'});
    }
  }
  stage.addEventListener('pointerdown',event=>{
    if(drag||!event.isPrimary||event.target.closest('button,a,[data-no-card-flip]')||
       !event.target.closest('.pf-fatos-card.is-active')||
       (event.pointerType==='mouse'&&event.button!==0))return;
    clearFlight();
    drag={
      x:event.clientX,y:event.clientY,id:event.pointerId,
      card:cards[active],axis:null,width:cards[active].getBoundingClientRect().width,
      offset:0,rotation:0,progress:0,direction:0,preview:null
    };
  });
  stage.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.axis){
      if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)*1.1){cancelDrag(false);return;}
      if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.35)return;
      drag.axis='horizontal';
      stage.dataset.dragging='true';
      stage.setPointerCapture?.(event.pointerId);
      drag.card.style.transition='none';
    }
    if(event.cancelable)event.preventDefault();
    const direction=dx<0?1:-1;
    if(drag.direction!==direction){
      if(drag.preview){
        drag.preview.style.removeProperty('transform');
        drag.preview.style.removeProperty('opacity');
        drag.preview.style.removeProperty('transition');
      }
      drag.direction=direction;
      drag.preview=cards[(active+direction+cards.length)%cards.length];
      drag.preview.style.transition='none';
    }
    const limit=drag.width*.83;
    drag.offset=clamp(dx,-limit,limit);
    drag.progress=clamp(Math.abs(dx)/(drag.width*.72),0,1);
    drag.rotation=clamp(dx/drag.width*13,-13,13);
    const p=drag.progress;
    drag.card.style.transform='translate3d('+drag.offset+'px,'+(-7*p)+'px,0) rotate('+drag.rotation+'deg) scale('+(1-.055*p)+')';
    drag.card.style.opacity='1';
    const sourceX=direction===1?23:-27,sourceAngle=direction*5;
    drag.preview.style.transform='translate3d('+(sourceX*(1-p))+'px,'+(3*(1-p)-4*p)+'px,0) rotate('+(sourceAngle*(1-p))+'deg) scale('+(.974+.026*p)+')';
    drag.preview.style.opacity='1';
  });
  stage.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const current = drag, dx = event.clientX - current.x, dy = event.clientY - current.y;
    const threshold = Math.max(42, Math.min(72, current.width * .22));
    const deliberate = current.axis === 'horizontal' && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.25;
    if (deliberate) {
      lastSwipe = performance.now();
      const transform=current.card.style.transform;
      const incomingFrom=current.preview?.style.transform;
      go(active+(dx<0?1:-1),{transform,incomingFrom,direction:dx<0?1:-1});
    } else cancelDrag(true);
  });
  stage.addEventListener('pointercancel', () => cancelDrag(true));
  stage.addEventListener('lostpointercapture', event => { if (event.target === stage) cancelDrag(true); });
  stage.addEventListener('pointerleave', () => { if (drag && !drag.axis) cancelDrag(false); });
  stage.addEventListener('click', event => { if (performance.now() - lastSwipe < 300) { event.preventDefault(); event.stopPropagation(); } }, true);
  motion.onStop(() => {clearGlint();cancelDrag(false);clearFlight();});
  paint(); shell.dataset.ready = 'true'; return shell;
}
