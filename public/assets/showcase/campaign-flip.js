/** Flip the complete campaign artwork to reveal its existing creative brief. */
import {bindCardSurface} from './card-surface.js';
export function mountCampaignFlip(){
 const lab=document.querySelector('#laboratorio .sp-campaign'),layout=lab?.querySelector('.sp-campaign-layout');
 const art=layout?.querySelector('.sp-campaign-art'),note=layout?.querySelector('[data-campaign-note]');
 if(!lab||!layout||!art||!note||layout.dataset.flipReady)return;
 layout.dataset.flipReady='true';layout.classList.add('sp-campaign-flip-layout');
 const card=document.createElement('div');card.className='sp-campaign-card';card.dataset.side='front';
 card.innerHTML=[
 '<div class="sp-campaign-card-inner">',
 '<div class="sp-campaign-face sp-campaign-face-front" data-sp-card-front>',
 '<div class="sp-campaign-image-slot"></div>',
 '<button type="button" class="sp-card-flip-cue" data-sp-card-turn="front" aria-label="Ver a decisão criativa no verso"><span aria-hidden="true">↶</span><span>Toque no cartão para virar</span><span aria-hidden="true">1 / 2</span></button>',
 '</div>',
 '<div class="sp-campaign-face sp-campaign-face-back" data-sp-card-back aria-hidden="true" inert>',
 '<div class="sp-campaign-note-slot"></div>',
 '<button type="button" class="sp-card-flip-cue" data-sp-card-turn="back" aria-label="Voltar à peça da campanha"><span aria-hidden="true">↶</span><span>Toque no cartão para voltar</span><span aria-hidden="true">2 / 2</span></button>',
 '</div></div>'
 ].join('');
 layout.append(card);card.querySelector('.sp-campaign-image-slot').append(art);card.querySelector('.sp-campaign-note-slot').append(note);
 const front=card.querySelector('[data-sp-card-front]'),back=card.querySelector('[data-sp-card-back]');
 const frontButton=card.querySelector('[data-sp-card-turn="front"]'),backButton=card.querySelector('[data-sp-card-turn="back"]');
 function show(side,focus=false){
  if(card.dataset.side===side)return;
  const reversed=side==='back';card.dataset.side=side;
  front.inert=reversed;back.inert=!reversed;
  front.setAttribute('aria-hidden',String(reversed));back.setAttribute('aria-hidden',String(!reversed));
  if(focus)(reversed?backButton:frontButton).focus({preventScroll:true});
 }
 frontButton.addEventListener('click',event=>show('back',event.detail===0));
 backButton.addEventListener('click',event=>show('front',event.detail===0));
 bindCardSurface(card,()=>card.dataset.side==='back'?backButton:frontButton);
 new MutationObserver(()=>show('front')).observe(lab,{attributes:true,attributeFilter:['data-channel']});
}
export function mountGalleryFlipHints(){
 document.querySelectorAll('#trabalhos .rg-gallery [data-work-card]').forEach(card=>{
  const caption=card.querySelector('.tile-caption > div');
  if(!caption||caption.querySelector('.rg-flip-hint'))return;
  const hint=document.createElement('small');hint.className='rg-flip-hint';
  hint.textContent='Toque no cartão para ver o verso';caption.append(hint);
 });
}
