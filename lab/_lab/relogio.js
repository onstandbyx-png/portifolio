/* Lab clock, injected as the first script of every version page by
 * lab/vercel/exportar.mjs and lab/server.mjs. At 1× and unpaused it only passes
 * calls through; the analysis cards (lab/js/quadros.js) use it to pause and slow
 * down script-driven animation (requestAnimationFrame loops, GSAP, Lottie, Rive,
 * three.js), which the Web Animations API cannot reach. */
(() => {
  if (window.__labRelogio) return;
  const realRaf = window.requestAnimationFrame.bind(window);
  const realCancel = window.cancelAnimationFrame.bind(window);
  const realNow = performance.now.bind(performance);
  const realDate = Date.now.bind(Date);
  const offset = realDate() - realNow();
  let rate = 1, paused = false, base = realNow(), virt = base;
  let frames = 0, lastFrame = 0, since = realNow();

  const now = () => {
    const t = realNow();
    if (!paused) virt += (t - base) * rate;
    base = t;
    return virt;
  };
  performance.now = now;
  Date.now = () => Math.floor(now() + offset);

  // While paused, a queued callback keeps waiting frame after frame without running.
  const pending = new Map();
  let seq = 0;
  window.requestAnimationFrame = callback => {
    const id = ++seq;
    const run = () => {
      if (!pending.has(id)) return;
      if (paused) { pending.set(id, realRaf(run)); return; }
      pending.delete(id);
      const t = realNow();
      if (t - lastFrame > 4) { frames++; lastFrame = t; }
      callback(now());
    };
    pending.set(id, realRaf(run));
    return id;
  };
  window.cancelAnimationFrame = id => {
    const real = pending.get(id);
    if (real === undefined) return realCancel(id);
    realCancel(real);
    pending.delete(id);
  };

  window.__labRelogio = {
    get rate() { return rate; },
    get paused() { return paused; },
    setRate(value) { now(); rate = Number(value) || 1; },
    pause() { now(); paused = true; },
    play() { now(); paused = false; },
    // Script frames per second since the last call (0 when nothing animates by script).
    fps() {
      const t = realNow(), value = frames / Math.max(0.001, (t - since) / 1000);
      frames = 0;
      since = t;
      return Math.round(value);
    }
  };
})();
