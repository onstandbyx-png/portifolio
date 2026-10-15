import {mountScrollGallery} from './scroll-gallery.js';
import {mountStaticPresentations} from './static-presentations.js';
function mount(){
  mountScrollGallery();
  mountStaticPresentations();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
