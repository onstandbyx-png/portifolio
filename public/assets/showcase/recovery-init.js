import {mountProductDemos} from './product-demos.js';
function mount(){
  try { mountProductDemos(); document.documentElement.dataset.productRecovery='ready'; }
  catch(error){ document.documentElement.dataset.productRecovery='failed'; console.error('Product demonstrations:',error); }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();

document.addEventListener('click',event=>{
  const target=event.target.closest('[data-product-target]')?.dataset.productTarget;
  if(!['app','site','voice'].includes(target))return;
  document.querySelector(`[data-product-tab="${target}"]`)?.click();
});
