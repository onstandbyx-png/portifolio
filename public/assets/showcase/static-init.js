/** Static artwork and animated presentation are independent layers. */
import {mountScrollGallery} from './scroll-gallery.js';
import {mountEditorialStory} from './editorial-story.js';
import {mountFatosDeck} from './fatos-deck.js';
import {mountStaticPresentations} from './static-presentations.js';
import {mountScrollFilm} from './scroll-film.js';
import {mountCardSurfaces} from './card-surface.js';
function mount(){
  for(const [name,initialize] of Object.entries({gallery:mountScrollGallery,editorial:mountEditorialStory,fatos:mountFatosDeck,artwork:mountStaticPresentations,film:mountScrollFilm,cardSurfaces:mountCardSurfaces})){
    try { initialize(); }
    catch(error){ console.error(`Portfolio ${name}:`,error); }
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
