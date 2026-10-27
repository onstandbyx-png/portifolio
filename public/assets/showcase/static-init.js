/** Static artwork and animated presentation are independent layers. */
import {mountStaticPresentations} from './static-presentations.js';
import {mountCampaignFlip,mountGalleryFlipHints} from './campaign-flip.js';
import {mountVitrine} from './vitrine-lab.js';
import {mountTrace} from './automation-trace.js';
function mount(){
  for(const [name,initialize] of Object.entries({artwork:mountStaticPresentations,campaignFlip:mountCampaignFlip,galleryHints:mountGalleryFlipHints,vitrine:mountVitrine,trace:mountTrace})){
    try { initialize(); }
    catch(error){ console.error(`Portfolio ${name}:`,error); }
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
