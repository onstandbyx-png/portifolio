/** Extend the existing flip controls to the card body without owning gestures. */
const controls = 'a,button,input,select,textarea,label,summary,[role="button"],[role="link"],[contenteditable]:not([contenteditable="false"]),[data-no-card-flip]';
const mounted = new WeakSet();

export function bindCardSurface(card, getControl) {
  if (!card || mounted.has(card)) return;
  mounted.add(card);
  const view = card.ownerDocument.defaultView;
  const options = { capture: true, passive: true };
  let gesture = null;
  const isControl = target => Boolean(target?.closest?.(controls));
  const track = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10 ||
        Math.abs(view.scrollY - gesture.scrollY) > 6 || Math.abs(view.scrollX - gesture.scrollX) > 6) gesture.cancelled = true;
  };
  card.addEventListener('pointerdown', event => {
    if (!event.isPrimary) { if (gesture) gesture.cancelled = true; return; }
    gesture = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      scrollX: view.scrollX, scrollY: view.scrollY,
      cancelled: event.button !== 0 || isControl(event.target)
    };
  }, options);
  card.addEventListener('pointermove', track, options);
  card.addEventListener('pointerup', track, options);
  const cancel = () => { if (gesture) gesture.cancelled = true; };
  card.addEventListener('pointercancel', cancel, options);
  card.addEventListener('dragstart', cancel, options);
  card.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || isControl(event.target) ||
        event.target?.closest?.('[inert],[hidden]') ||
        view.getSelection()?.isCollapsed === false) return;
    // detail=0 is an assistive/programmatic click, not a completed drag.
    if (event.detail !== 0 && gesture) {
      if (gesture.cancelled || Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 10 ||
          Math.abs(view.scrollY - gesture.scrollY) > 6 || Math.abs(view.scrollX - gesture.scrollX) > 6) return;
    }
    const control = getControl();
    if (!control || control.disabled || control.closest('[inert],[hidden]')) return;
    // Reuse each component's state, direction, focus and reduced-motion logic.
    // The resulting button click is excluded above, so it cannot toggle twice.
    control.click();
  });
  card.style.cursor = 'pointer';
  card.dataset.cardSurfaceFlip = 'ready';
}

export function mountCardSurfaces(root = document) {
  root.querySelectorAll('.rg-gallery [data-work-card]').forEach(card => {
    bindCardSurface(card, () => card.querySelector('[data-rg-flip]'));
  });
  root.querySelectorAll('.pf-fatos-card').forEach(card => {
    bindCardSurface(card, () => card.querySelector(card.classList.contains('is-flipped') ? '[data-fatos-return]' : '[data-fatos-flip]'));
  });
}
