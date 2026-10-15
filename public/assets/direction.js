/* Small navigation enhancements. Essential content and contact links are native HTML. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const direct = document.createElement('a');
  direct.className = 'mobile-project-cta';
  direct.href = '#contato';
  direct.innerHTML = '<span>Vamos conversar sobre seu projeto</span><small>Smile N ↗</small>';
  document.body.append(direct);
  const hero = $('.hero'), contact = $('#contato');
  let heroVisible = true, contactVisible = false;
  const update = () => direct.classList.toggle('is-visible', !heroVisible && !contactVisible && !$('#case-dialog')?.open && $('#menu-toggle')?.getAttribute('aria-expanded') !== 'true');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === contact) contactVisible = entry.isIntersecting;
      }
      update();
    }, {threshold:0});
    if (hero) observer.observe(hero);
    if (contact) observer.observe(contact);
  }
  const stateObserver = new MutationObserver(update);
  if ($('#case-dialog')) stateObserver.observe($('#case-dialog'),{attributes:true,attributeFilter:['open']});
  if ($('#menu-toggle')) stateObserver.observe($('#menu-toggle'),{attributes:true,attributeFilter:['aria-expanded']});
})();
