/* Campo de seda do hero (SilkField de PlanesHero.tsx, smiile cc19ed2) sem React.
   52 linhas senoidais em canvas 2D, devicePixelRatio limitado a 1,5, redimensiona com
   ResizeObserver e só anima com o hero à vista e a aba visível. body.is-paused (botão do
   cabeçalho) e prefers-reduced-motion param o laço e deixam um quadro parado. */
const hero = document.querySelector('.planes-hero');
const canvas = hero?.querySelector('.ph-silk');
const context = canvas?.getContext('2d');
if (hero && canvas && context) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduced.matches || document.body.classList.contains('is-paused');
  let width = 1200, height = 800, clock = 0, frame = 0, last = 0, inView = false, visible = !document.hidden;

  function paint(time) {
    context.clearRect(0, 0, width, height);
    for (let line = 0; line < 52; line++) {
      const offset = line / 52;
      context.beginPath();
      for (let step = 0; step <= 70; step++) {
        const u = step / 70;
        const px = u * width;
        const wave = Math.sin(u * 5.6 + time * 0.00012 + offset * 0.85);
        const py = height * (0.24 + offset * 0.36) + wave * height * (0.16 + offset * 0.1) + Math.cos(u * 8 - time * 0.00008 + offset) * height * 0.055;
        if (step === 0) context.moveTo(px, py); else context.lineTo(px, py);
      }
      context.strokeStyle = `rgba(204,217,220,${0.02 + Math.sin(offset * Math.PI) * 0.075})`;
      context.lineWidth = 0.5 + offset * 0.9;
      context.stroke();
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(500, rect.height);
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(clock);
  }
  function tick(now) {
    frame = 0;
    if (!inView || !visible || still()) { last = 0; return; }
    const delta = last ? now - last : 0;
    last = now;
    clock += Math.min(delta, 40);
    paint(clock);
    frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (!frame && inView && visible && !still()) frame = requestAnimationFrame(tick);
  }
  // A entrada em CSS termina em 1,6 s; depois disso (ou ao pausar) o estado final fica fixo,
  // para que retomar o movimento não repita o desfoque das palavras.
  let settleTimer = 0;
  function settle() { clearTimeout(settleTimer); hero.dataset.entered = 'true'; }
  function sync() { if (still()) settle(); wake(); }

  resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { inView = !!entry?.isIntersecting; wake(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = 0; wake(); });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', sync);
  if (still() || performance.now() > 2500 || scrollY > 80) settle(); else settleTimer = setTimeout(settle, 1700);
}
