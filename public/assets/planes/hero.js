/* Campo de seda do hero (SilkField de PlanesHero.tsx, smiile cc19ed2) sem React.
   52 linhas senoidais em canvas 2D no verde da Smile N (#2c5a46, alfa de .06 a .18), devicePixelRatio
   limitado a 1,5 e no máximo 30 quadros por segundo. Só anima com o hero à vista, a aba visível e alguém
   mexendo na página: depois de 8 s sem ponteiro, toque ou rolagem, para num quadro fixo e volta no próximo
   gesto. body.is-paused e prefers-reduced-motion deixam um quadro parado. Também marca data-entered no
   fim da entrada em CSS, para que retomar o movimento não a repita. */
const hero = document.querySelector('.planes-hero');
const canvas = hero?.querySelector('.ph-silk');
const context = canvas?.getContext('2d');
if (hero && canvas && context) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduced.matches || document.body.classList.contains('is-paused');
  const FRAME = 1000 / 30, IDLE = 8000;
  let width = 1200, height = 800, clock = 0, frame = 0, last = 0, drawn = 0, inView = false, visible = !document.hidden, active = performance.now();

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
      context.strokeStyle = `rgba(44,90,70,${(0.06 + Math.sin(offset * Math.PI) * 0.12).toFixed(3)})`;
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
  const awake = now => now - active < IDLE;
  function tick(now) {
    frame = 0;
    if (!inView || !visible || still() || !awake(now)) { last = 0; return; }
    const delta = last ? now - last : 0;
    last = now;
    clock += Math.min(delta, 40);
    if (now - drawn >= FRAME - 1) { drawn = now; paint(clock); }
    frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (!frame && inView && visible && !still() && awake(performance.now())) frame = requestAnimationFrame(tick);
  }
  function poke() { active = performance.now(); wake(); }
  let settleTimer = 0;
  function settle() { clearTimeout(settleTimer); hero.dataset.entered = 'true'; }
  function sync() { if (still()) settle(); wake(); }

  resize();
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { inView = !!entry?.isIntersecting; wake(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = 0; wake(); });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', sync);
  for (const type of ['pointermove', 'pointerdown', 'scroll', 'keydown']) addEventListener(type, poke, { passive: true });
  if (still() || performance.now() > 2500 || scrollY > 80) settle(); else settleTimer = setTimeout(settle, 900);
}
