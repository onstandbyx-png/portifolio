// Carrossel nativo: o navegador faz a rolagem e o scroll-snap. Este script só liga os botões
// anterior/próximo e mantém o contador "1 de 5" atualizado. Sem física nem animação própria.
const track = document.querySelector('#svc-track');
const prev = document.querySelector('[data-prev]');
const next = document.querySelector('[data-next]');
const count = document.querySelector('[data-count]');

if (track && prev && next && count) {
  const slides = [...track.children];
  const total = slides.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const step = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
  const visible = () => Math.max(1, Math.min(total, Math.round((track.clientWidth + 1) / step())));

  const firstIndex = () => {
    const i = Math.round(track.scrollLeft / step());
    return Math.min(Math.max(i, 0), total - visible());
  };

  const setDisabled = (btn, off) => {
    btn.setAttribute('aria-disabled', String(off));
  };

  const update = () => {
    const vis = visible();
    const i = firstIndex();
    count.textContent = vis === 1 ? `${i + 1} de ${total}` : `${i + 1}–${i + vis} de ${total}`;
    setDisabled(prev, i <= 0);
    setDisabled(next, i + vis >= total);
  };

  const go = (dir) => {
    const target = Math.min(Math.max(firstIndex() + dir, 0), total - visible());
    track.scrollTo({
      left: slides[target].offsetLeft - slides[0].offsetLeft,
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
    });
  };

  prev.addEventListener('click', () => { if (prev.getAttribute('aria-disabled') !== 'true') go(-1); });
  next.addEventListener('click', () => { if (next.getAttribute('aria-disabled') !== 'true') go(1); });

  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
}
