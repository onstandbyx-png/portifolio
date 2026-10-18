/* A continuous brand ribbon. Scrolling nudges it; pause and reduced motion win. */
const rail = document.querySelector('[data-brand-rail]');
if (rail) {
  const track = rail.querySelector('.rail-track');
  const group = track.querySelector('.rail-group');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#motion-toggle');
  let animation, inView = false, span = 0, lastY = scrollY;
  for (let i = 0; i < 2; i++) {
    const copy = group.cloneNode(true);
    copy.dataset.railClone = '';
    copy.inert = true;
    track.append(copy);
  }
  function sync() {
    const running = !preference.matches && toggle?.getAttribute('aria-pressed') !== 'true' && inView && !document.hidden;
    animation?.[running ? 'play' : 'pause']();
    rail.dataset.railRunning = String(running);
  }
  function measure() {
    rail.dataset.railMotion = preference.matches ? 'static' : 'animated';
    if (preference.matches) { animation?.cancel(); animation = null; sync(); return; }
    const width = group.getBoundingClientRect().width;
    if (!width || (width === span && animation)) { sync(); return; }
    const phase = animation && span ? Number(animation.currentTime || 0) / (span / 32 * 1000) % 1 : 0;
    animation?.cancel();
    span = width;
    animation = track.animate([{transform:'translateX(0)'},{transform:`translateX(${-span}px)`}], {duration:span / 32 * 1000,iterations:Infinity,easing:'linear'});
    animation.currentTime = phase * span / 32 * 1000;
    sync();
  }
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; lastY = scrollY; sync(); }, {rootMargin:'30px'}).observe(rail);
  new ResizeObserver(measure).observe(group);
  preference.addEventListener('change', measure);
  if (toggle) new MutationObserver(sync).observe(toggle, {attributes:true,attributeFilter:['aria-pressed']});
  document.addEventListener('visibilitychange', sync);
  addEventListener('scroll', () => {
    const delta = scrollY - lastY;
    lastY = scrollY;
    if (animation?.playState === 'running') animation.currentTime = Math.max(0, Number(animation.currentTime || 0) + Math.max(-80, Math.min(80, delta)) * 8);
  }, {passive:true});
  measure();
  document.fonts.ready.then(measure);
}
