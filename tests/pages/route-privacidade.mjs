/* /privacidade · route block for tests/browser-pages.mjs.
 * Template for the other routes: export `route`, `slug` and `checks(t)`;
 * optional `reduced(t)` (reducedMotion: 'reduce') and `noJs(t)` (JavaScript off).
 * The runner already covers the shell, CSP, network, contrast, targets, rAF,
 * reduced motion, pause, no-JS and the 390/1440 screenshots for every route. */
export const route = '/privacidade';
export const slug = 'privacidade';

export async function checks(t) {
  const {page, check} = t;
  check('Title names the notice', await page.title() === 'Aviso de privacidade · Smile N');
  check('Version 2026-10 is visible', await page.getByText('Versão 2026-10', {exact: true}).isVisible());
  check('Accessibility anchor exists once', await page.locator('#acessibilidade').count() === 1);
  check('No bracketed placeholder is published', !(await page.locator('main').innerText()).match(/\[|\]/));
  check('Notice has no form and sends nothing', await page.locator('form').count() === 0);
  check('Contact links come from PORTFOLIO_PROFILE', await page.evaluate(() => {
    const {email, whatsapp} = window.PORTFOLIO_PROFILE;
    return [...document.querySelectorAll('a[data-profile-link="email"]')].every(a => a.getAttribute('href') === `mailto:${email}`) &&
      [...document.querySelectorAll('a[data-profile-link="whatsapp"]')].every(a => a.getAttribute('href') === `https://wa.me/${whatsapp}`);
  }));
  // Following the footer link lands on the accessibility section.
  await page.locator('.site-footer a[href="/privacidade#acessibilidade"]').click();
  await page.waitForFunction(() => location.hash === '#acessibilidade');
  // Smooth anchor scrolling: wait until the position is stable.
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => scrollY);
    if (y === last) break;
    last = y;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  check('Footer accessibility link scrolls to the section below the sticky header', await page.evaluate(() => {
    const top = document.getElementById('acessibilidade-titulo').getBoundingClientRect().top;
    return top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1;
  }));
}

export async function noJs(t) {
  const {page, check} = t;
  check('Every section of the notice is readable without JS', await page.evaluate(() => document.querySelectorAll('main h2').length === 10 && document.querySelector('#acessibilidade').innerText.includes('WCAG 2.2')));
}
