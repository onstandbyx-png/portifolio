/** Static artwork and animated presentation are independent layers. */
import {mountScrollGallery} from './scroll-gallery.js';
import {mountFatosDeck} from './fatos-deck.js';
import {mountDeckDemos} from './deck-demos.js';
import {mountStaticPresentations} from './static-presentations.js';
import {mountScrollFilm} from './scroll-film.js';
import {mountCardSurfaces} from './card-surface.js';
import {mountCampaignFlip,mountGalleryFlipHints} from './campaign-flip.js';
import {mountVitrine} from './vitrine-lab.js';
function mount(){
  for(const [name,initialize] of Object.entries({gallery:mountScrollGallery,fatos:mountFatosDeck,deckDemos:mountDeckDemos,artwork:mountStaticPresentations,film:mountScrollFilm,cardSurfaces:mountCardSurfaces,campaignFlip:mountCampaignFlip,galleryHints:mountGalleryFlipHints,vitrine:mountVitrine})){
    try { initialize(); }
    catch(error){ console.error(`Portfolio ${name}:`,error); }
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
