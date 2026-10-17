/** Shared high-fidelity hardware shells for the Fatos editorial carousel.
 * The iPhone and the existing MacBook keep their original CSS material stack.
 * The iPad is a landscape tablet, not an enlarged phone.
 */
export function createIPadFrame({label='Contexto editorial em iPad Pro'}={}) {
  const root=document.createElement('div');
  root.className='es-hardware es-hardware--ipad';
  root.dataset.model='ipad-pro';
  root.setAttribute('role','group');root.setAttribute('aria-label',label);
  root.innerHTML=[
    '<div class="ipad-pro-body">',
      '<div class="ipad-pro-metal" aria-hidden="true"></div>',
      '<div class="ipad-pro-glass">',
        '<div class="ipad-pro-screen"></div>',
      '</div>',
      '<span class="ipad-pro-camera" aria-hidden="true"><i></i></span>',
      '<span class="ipad-pro-power" aria-hidden="true"></span>',
      '<span class="ipad-pro-volume" aria-hidden="true"></span>',
      '<span class="ipad-pro-home" aria-hidden="true"></span>',
    '</div>'
  ].join('');
  return {root,screen:root.querySelector('.ipad-pro-screen')};
}
export function createMacBookFrame({label='Fechamento editorial em MacBook Pro'}={}) {
  const root=document.createElement('div');
  root.className='es-hardware es-hardware--macbook rf-macbook';
  root.dataset.model='macbook-pro';
  root.setAttribute('role','group');root.setAttribute('aria-label',label);
  // Physical structure and classes are the SAME ones used by the Casa Costa
  // MacBook, so refinements to aluminum, hinge and bezel apply to both.
  root.innerHTML=[
    '<div class="mbp-device">',
      '<div class="mbp-lid">',
        '<div class="mbp-display"><div class="mbp-screen"></div></div>',
        '<div class="mbp-camera" aria-hidden="true"><i></i></div>',
      '</div>',
      '<div class="mbp-hinge" aria-hidden="true"></div>',
      '<div class="mbp-base" aria-hidden="true"><span class="mbp-front-groove"></span></div>',
      '<span class="mbp-ground-shadow" aria-hidden="true"></span>',
    '</div>'
  ].join('');
  return {root,screen:root.querySelector('.mbp-screen')};
}
