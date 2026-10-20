// Prev/next buttons and "1 de 5" counter for the native scroll-snap carousel (daisyUI .carousel).
// No custom animation: scrolling is the browser's own (smooth only when reduced motion is not requested).
const track = document.getElementById('svc-track');
const controls = document.querySelector('.svc-controls');

if (track && controls) {
  const items = Array.from(track.querySelectorAll('.carousel-item'));
  const count = controls.querySelector('.svc-count');
  const prev = controls.querySelector('[data-dir="-1"]');
  const next = controls.querySelector('[data-dir="1"]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = items.length;

  const step = () => (items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth);
  const perView = () => Math.max(1, Math.round((track.clientWidth + 1) / step()));
  const firstIndex = () => Math.min(total - 1, Math.max(0, Math.round(track.scrollLeft / step())));

  const update = () => {
    const first = firstIndex();
    const view = perView();
    const last = Math.min(total, first + view);
    count.textContent = view > 1 ? `${first + 1}–${last} de ${total}` : `${first + 1} de ${total}`;
    prev.disabled = first <= 0;
    next.disabled = last >= total;
  };

  const go = (dir) => {
    const target = Math.min(total - perView(), Math.max(0, firstIndex() + dir));
    track.scrollTo({ left: items[target].offsetLeft - items[0].offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' });
  };

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  let frame = 0;
  track.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);

  controls.hidden = false;
  update();
}
