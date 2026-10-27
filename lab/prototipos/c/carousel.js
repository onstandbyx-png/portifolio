// Carrossel nativo: quem rola é o navegador (overflow-x + scroll-snap).
// Este módulo só liga os botões anterior/próximo e mantém o contador "1 de 5".
// Sem física, sem animação própria; com "reduzir movimento" o salto é instantâneo.
document.documentElement.classList.add('js');

const rail = document.getElementById('svc-rail');
const prev = document.querySelector('[data-prev]');
const next = document.querySelector('[data-next]');
const count = document.querySelector('[data-count]');

if (rail && prev && next && count) {
  const items = Array.from(rail.children);
  const total = items.length;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Distância entre o início de dois cards (largura + gap).
  const step = () => (total > 1 ? items[1].offsetLeft - items[0].offsetLeft : rail.clientWidth);
  // Quantos cards cabem inteiros na área visível (1 no celular, 2 no tablet, 3 no desktop).
  const perView = () => Math.max(1, Math.min(total, Math.round((rail.clientWidth + 1) / step())));
  const lastStart = () => total - perView();
  const current = () => Math.min(Math.max(Math.round(rail.scrollLeft / step()), 0), lastStart());

  const render = () => {
    const i = current();
    const n = perView();
    count.textContent = n === 1 ? `${i + 1} de ${total}` : `${i + 1}–${i + n} de ${total}`;
    prev.setAttribute('aria-disabled', String(i <= 0));
    next.setAttribute('aria-disabled', String(i >= lastStart()));
  };

  const go = (delta) => {
    const target = Math.min(Math.max(current() + delta, 0), lastStart());
    rail.scrollTo({ left: items[target].offsetLeft - items[0].offsetLeft, behavior: reduce.matches ? 'auto' : 'smooth' });
  };

  prev.addEventListener('click', () => { if (prev.getAttribute('aria-disabled') !== 'true') go(-1); });
  next.addEventListener('click', () => { if (next.getAttribute('aria-disabled') !== 'true') go(1); });

  // Setas do teclado quando o foco está no trilho (além da rolagem nativa).
  rail.addEventListener('keydown', (e) => {
    if (e.target !== rail) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  let raf = 0;
  rail.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(render);
  }, { passive: true });
  new ResizeObserver(render).observe(rail);
  render();
}
