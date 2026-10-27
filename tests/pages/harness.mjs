/* Shared Playwright harness for tests/browser-pages.mjs (SPEC 8.3).
 * Route modules (tests/pages/route-*.mjs) receive a `t` object from openPage():
 *   t.page, t.context, t.width, t.height, t.route, t.slug, t.base, t.output,
 *   t.check(label, value, detail), t.events (console, pageErrors, nonGet,
 *   external, failures, popups, handoff), t.reducedMotion, t.javaScriptEnabled.
 * Every external request is intercepted and aborted; wa.me / api.whatsapp.com
 * requests are recorded in t.events.handoff so a test can prove they only happen
 * after the visitor's click. Nothing is ever sent. Scrolls use behavior
 * 'instant' because the pages scroll anchors smoothly. */
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {stackPngs} from './png.mjs';

export const VIEWPORTS = Object.freeze([[320, 740], [390, 844], [1440, 1000]]);
export const SCREENSHOT_WIDTHS = Object.freeze([390, 1440]);
export const HANDOFF_HOSTS = /^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//;
export const DESKTOP_NAV = 960;

/* Runs in the page before any script: CSP violations, rAF calls, popups, events. */
function instrument() {
  window.__qa = {csp: [], raf: 0, opened: [], interactions: []};
  document.addEventListener('securitypolicyviolation', event => {
    window.__qa.csp.push({directive: event.violatedDirective, blocked: event.blockedURI, sample: event.sample});
  });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = callback => { window.__qa.raf++; return raf(callback); };
  window.open = (...args) => { window.__qa.opened.push(String(args[0])); return null; };
  addEventListener('portfolio:interaction', event => window.__qa.interactions.push(event.detail));
}

export async function openPage(env, {route, slug = route.replace(/^\//, '').replace(/\//g, '-') || 'home', width, height, reducedMotion = 'no-preference', javaScriptEnabled = true, permissions = [], label = '', mobile = width < 500} = {}) {
  const {browser, base, report} = env;
  const context = await browser.newContext({
    viewport: {width, height}, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile,
    reducedMotion, javaScriptEnabled, locale: 'pt-BR'
  });
  if (permissions.length) await context.grantPermissions(permissions, {origin: base});
  const events = {console: [], pageErrors: [], nonGet: [], external: [], failures: [], popups: [], handoff: []};
  const origin = new URL(base).origin;
  await context.route(url => url.origin !== origin && !/^(?:data|blob|about):/.test(url.protocol), route => {
    const url = route.request().url();
    if (HANDOFF_HOSTS.test(url)) events.handoff.push(url); else events.external.push(url);
    return route.abort();
  });
  const page = await context.newPage();
  context.on('page', popup => { if (popup !== page) events.popups.push(popup); });
  page.setDefaultTimeout(15000);
  if (javaScriptEnabled) await page.addInitScript(instrument);
  page.on('console', message => { if (message.type() === 'error') events.console.push(message.text()); });
  page.on('pageerror', error => events.pageErrors.push(error.message));
  page.on('request', request => {
    if (request.method() !== 'GET') events.nonGet.push(`${request.method()} ${request.url()}`);
  });
  page.on('response', response => {
    if (response.url().startsWith(base) && response.status() >= 400) events.failures.push({url: response.url(), status: response.status()});
  });
  const row = {route, slug, width, height, reducedMotion, javaScriptEnabled, label, checks: [], errors: events.pageErrors};
  report.results.push(row);
  const check = (name, value, detail) => {
    row.checks.push({label: name, pass: Boolean(value), ...(detail === undefined ? {} : {detail})});
    assert(value, `${name}${detail === undefined ? '' : ` · ${JSON.stringify(detail).slice(0, 600)}`}`);
  };
  return {page, context, width, height, route, slug, base, output: env.output, check, events, row, reducedMotion, javaScriptEnabled, env};
}

export async function gotoRoute(t) {
  const response = await t.page.goto(`${t.base}${t.route}`, {waitUntil: 'load'});
  if (t.javaScriptEnabled) await t.page.waitForSelector('html[data-shell-ready="true"]', {state: 'attached'});
  await t.page.evaluate(() => document.fonts?.ready);
  return response;
}

/** Waits until no animation is running (heading reveal, entries, menu). */
export async function settle(page, timeout = 4000) {
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running') &&
    ![...document.querySelectorAll('[data-reveal-heading]')].some(el => el.dataset.headingReveal === 'revealing'), null, {timeout});
}

export const runningAnimations = page => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

/* Horizontal overflow. innerWidth is not a ruler: with isMobile the layout viewport
 * grows to the content, so innerWidth follows scrollWidth. The page must fit the
 * root's clientWidth and the configured viewport width. */
export async function overflowState(page, width) {
  return page.evaluate(w => {
    const root = document.documentElement;
    return {scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, innerWidth, width: w};
  }, width);
}
export const fitsWidth = state => state.scrollWidth <= Math.min(state.clientWidth, state.width);

/* ---------- SPEC 8.3 items 1–5: route, CSP, console, network, overflow ---------- */
export async function routeChecks(t, response) {
  const {check} = t;
  check('Route answers 200', response?.status() === 200, response?.status());
  check('Response CSP equals the home CSP', response?.headers()['content-security-policy'] === t.env.homeCsp);
  check('Document is pt-BR with one h1', await t.page.evaluate(() => document.documentElement.lang === 'pt-BR' && document.querySelectorAll('h1').length === 1));
  check('Landmarks: header, main#conteudo, footer outside main', await t.page.evaluate(() => {
    const main = document.querySelector('main#conteudo'), footer = document.querySelector('footer.site-footer');
    return Boolean(document.querySelector('header.site-header') && main && footer && !main.contains(footer));
  }));
  const overflow = await overflowState(t.page, t.width);
  check('No horizontal scroll', fitsWidth(overflow), overflow);
  check('Every link that opens a new tab says so to screen readers', await t.page.evaluate(() =>
    [...document.querySelectorAll('a[target="_blank"]')].every(a => /\(abre em nova aba\)/.test(a.querySelector('.pg-visually-hidden')?.textContent || ''))));
}

export async function cleanChecks(t) {
  const {check, events} = t;
  if (t.javaScriptEnabled) {
    const csp = await t.page.evaluate(() => window.__qa?.csp ?? []);
    check('No CSP violation', csp.length === 0, csp);
    const opened = await t.page.evaluate(() => window.__qa?.opened ?? []);
    check('No window.open', opened.length === 0, opened);
  }
  check('No console.error', events.console.length === 0, events.console);
  check('No page error', events.pageErrors.length === 0, events.pageErrors);
  check('Only GET requests', events.nonGet.length === 0, events.nonGet);
  check('No request to another host', events.external.length === 0, events.external);
  check('No 4xx/5xx response', events.failures.length === 0, events.failures);
  const overflow = await overflowState(t.page, t.width);
  check('No horizontal scroll after interactions', fitsWidth(overflow), overflow);
}

/* ---------- shell (K1): focus order, motion toggle, menu, header CTA, footer ---------- */
async function activeInfo(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return {tag: 'body'};
    return {tag: el.tagName.toLowerCase(), id: el.id, cls: String(el.className?.baseVal ?? el.className ?? ''), text: (el.textContent || '').trim().slice(0, 60),
      href: el.getAttribute('href'), inPanel: Boolean(el.closest('#mobile-nav')), inMain: Boolean(el.closest('main')), inHeader: Boolean(el.closest('.site-header')),
      menuToggle: el.id === 'menu-toggle'};
  });
}

export async function tabSequence(page, count) {
  const sequence = [];
  for (let i = 0; i < count; i++) { await page.keyboard.press('Tab'); sequence.push(await activeInfo(page)); }
  return sequence;
}

export async function shellChecks(t) {
  const {page, check, width} = t;
  // Must run on a fresh load: Tab starts from the top of the document.
  const sequence = await tabSequence(page, width >= DESKTOP_NAV ? 3 : 4);
  check('Skip link is the first focus stop', sequence[0]?.cls.includes('pg-skip') && sequence[0]?.href === '#conteudo', sequence[0]);
  check('Brand is the second focus stop', sequence[1]?.cls.includes('pg-brand'), sequence[1]);
  if (width >= DESKTOP_NAV) check('Desktop navigation follows the brand', sequence[2]?.inHeader && sequence[2]?.href?.startsWith('/'), sequence[2]);
  else check('Menu button comes before the content on mobile', sequence.slice(2).some(item => item.menuToggle) && !sequence.slice(2).some(item => item.inMain), sequence);
  check('Skip link target exists', await page.evaluate(() => Boolean(document.getElementById('conteudo'))));

  // Motion toggle (compatible with /assets/sections/motion.js).
  const toggle = page.locator('#motion-toggle');
  check('Motion toggle starts unpressed with the home label', await toggle.getAttribute('aria-pressed') === 'false' && await toggle.getAttribute('aria-label') === 'Pausar movimento e reprodução');
  await toggle.click();
  check('Motion toggle pauses the page', await page.evaluate(() => document.body.classList.contains('is-paused')) && await toggle.getAttribute('aria-pressed') === 'true' && await toggle.getAttribute('aria-label') === 'Retomar movimento e reprodução');
  check('Paused page has no running animation', (await runningAnimations(page)) === 0);
  await toggle.click();
  check('Motion toggle resumes the page', !(await page.evaluate(() => document.body.classList.contains('is-paused'))) && await toggle.getAttribute('aria-pressed') === 'false');

  const menuToggle = page.locator('#menu-toggle'), panel = page.locator('#mobile-nav');
  if (width < DESKTOP_NAV) {
    check('Menu button is visible on mobile', await menuToggle.isVisible());
    await menuToggle.click();
    await pause(450);
    check('Menu opens as a full-screen panel', await menuToggle.getAttribute('aria-expanded') === 'true' && await panel.isVisible() &&
      await panel.evaluate(el => { const r = el.getBoundingClientRect(); return r.width >= innerWidth - 1 && r.bottom >= innerHeight - 1; }));
    check('Menu label switches to "Fechar menu"', await menuToggle.getAttribute('aria-label') === 'Fechar menu');
    check('Menu moves focus into the panel', (await activeInfo(page)).inPanel);
    check('Menu locks page scroll and makes the page inert', await page.evaluate(() => document.body.style.overflow === 'hidden' && document.documentElement.dataset.scrollLocked === 'true' && document.querySelector('main').inert && document.querySelector('.site-footer').inert));
    const stops = await page.evaluate(() => [document.getElementById('menu-toggle'), ...document.querySelectorAll('#mobile-nav a[href], #mobile-nav button')].filter(el => el.getClientRects().length).length);
    const trapped = await tabSequence(page, stops + 2);
    check('Tab stays inside the menu (focus trap)', trapped.every(item => item.inPanel || item.menuToggle), trapped);
    await menuToggle.focus();
    await page.keyboard.press('Shift+Tab');
    check('Shift+Tab from the menu button wraps to the last menu item', (await activeInfo(page)).inPanel);
    await page.keyboard.press('Escape');
    check('Escape closes the menu and returns focus to its button', await menuToggle.getAttribute('aria-expanded') === 'false' && !(await panel.isVisible()) && (await activeInfo(page)).menuToggle);
    check('Closing the menu restores scroll and the page', await page.evaluate(() => document.body.style.overflow === '' && !document.documentElement.dataset.scrollLocked && !document.querySelector('main').inert));
    check('Menu lists the four links, the motion control and the page CTA when present', await page.evaluate(() => {
      const links = [...document.querySelectorAll('#mobile-nav nav a')].map(a => a.getAttribute('href'));
      const cta = document.querySelector('[data-header-cta]');
      return JSON.stringify(links) === JSON.stringify(['/#trabalhos', '/#categorias', '/criadores', '/criadores/ao-vivo']) &&
        Boolean(document.querySelector('#mobile-nav [data-motion-proxy]')) &&
        (!cta || [...document.querySelectorAll('#mobile-nav a.pg-btn')].some(a => a.getAttribute('href') === cta.getAttribute('href')));
    }));
  } else {
    check('Desktop shows the main navigation, not the menu button', await page.locator('.pg-nav').isVisible() && !(await menuToggle.isVisible()));
    check('Main navigation has the four links', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('.pg-nav a')].map(a => a.getAttribute('href'))) === JSON.stringify(['/#trabalhos', '/#categorias', '/criadores', '/criadores/ao-vivo'])));
  }
  const current = await page.evaluate(route => [...document.querySelectorAll('.pg-nav a[aria-current=page]')].map(a => a.getAttribute('href')), t.route);
  check('aria-current marks only the current page in the navigation', current.every(href => href === t.route));

  // Header CTA: hidden on the hero, shown after it (≥ 720 px).
  const cta = page.locator('.site-header [data-header-cta]');
  if (await cta.count() && width >= 720) {
    await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
    await pause(300);
    check('Header CTA is hidden while the hero is visible', !(await cta.isVisible()));
    await page.evaluate(() => { const hero = document.querySelector('[data-hero]') || document.querySelector('main > :first-child'); window.scrollTo({top: hero.getBoundingClientRect().bottom + scrollY + 40, behavior: 'instant'}); });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-header [data-header-cta]')).visibility === 'visible');
    await pause(300);
    check('Header CTA appears after the hero', await cta.isVisible());
    await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  }

  check('Footer has the privacy notice, the accessibility anchor and both contacts', await page.evaluate(() => {
    const footer = document.querySelector('.site-footer');
    const hrefs = [...footer.querySelectorAll('a')].map(a => a.getAttribute('href'));
    return hrefs.includes('/privacidade') && hrefs.includes('/privacidade#acessibilidade') && hrefs.includes('/vagas') &&
      hrefs.some(h => /^https:\/\/wa\.me\/\d+$/.test(h)) && hrefs.some(h => /^mailto:[^?]+@/.test(h)) &&
      Boolean(footer.querySelector('a[href="/privacidade#acessibilidade"] svg[aria-hidden="true"]'));
  }));
}

/* ---------- SPEC 8.3 item 8: contrast of visible text and focus rings ---------- */
export async function contrastAudit(page) {
  return page.evaluate(() => {
    const parse = value => {
      if (!value || value === 'transparent') return {r: 0, g: 0, b: 0, a: 0};
      let m = value.match(/^rgba?\(([^)]+)\)/);
      if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p[3] ?? 1}; }
      m = value.match(/^color\(srgb ([^)]+)\)/);
      if (m) { const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number); return {r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p[3] ?? 1}; }
      return null;
    };
    const blend = (top, bottom) => ({r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1});
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    function background(el) {
      const layers = [];
      for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.backgroundImage !== 'none') return null;
        const color = parse(style.backgroundColor);
        if (color && color.a > 0) { layers.push(color); if (color.a >= 1) break; }
      }
      let result = {r: 255, g: 255, b: 255, a: 1};
      for (const layer of layers.reverse()) result = blend(layer, result);
      return result;
    }
    const opacity = el => { let o = 1; for (let node = el; node && node.nodeType === 1; node = node.parentElement) o *= Number(getComputedStyle(node).opacity); return o; };
    const failures = [], seen = new Set();
    let checked = 0, skipped = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, el = node.parentElement;
      if (!node.textContent.trim() || !el || seen.has(el)) continue;
      seen.add(el);
      // Decorative (aria-hidden), hidden, inert and disabled text is exempt (WCAG 1.4.3).
      if (el.closest('[aria-hidden="true"],[hidden],[inert],script,style,noscript,template,button:disabled,[aria-disabled="true"]:not(.motion-toggle)')) continue;
      const style = getComputedStyle(el), rect = el.getBoundingClientRect();
      if (style.visibility !== 'visible' || style.display === 'none' || rect.width <= 1 || rect.height <= 1) continue;
      const alpha = opacity(el);
      if (alpha < .1) continue;
      const fg = parse(style.color), bg = background(el);
      if (!fg || !bg) { skipped++; continue; }
      const color = blend({...fg, a: fg.a * alpha}, bg);
      const size = parseFloat(style.fontSize), weight = Number(style.fontWeight) || 400;
      const required = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
      const value = ratio(color, bg);
      checked++;
      if (value + 1e-6 < required) failures.push({text: node.textContent.trim().slice(0, 50), ratio: Number(value.toFixed(2)), required, size, color: style.color, background: bg, tag: el.tagName.toLowerCase(), cls: String(el.className)});
    }
    return {checked, skipped, failures};
  });
}

export async function focusRingAudit(page, stops = 24) {
  await page.evaluate(() => { window.scrollTo({top: 0, behavior: 'instant'}); document.activeElement?.blur?.(); });
  const failures = [];
  let checked = 0;
  for (let i = 0; i < stops; i++) {
    await page.keyboard.press('Tab');
    const result = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const parse = value => { const m = value.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p[3] ?? 1}; };
      const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
      let bg = null;
      for (let node = el.parentElement; node; node = node.parentElement) { const c = parse(getComputedStyle(node).backgroundColor); if (c && c.a >= 1) { bg = c; break; } }
      bg ||= {r: 255, g: 255, b: 255};
      const ring = parse(style.outlineColor);
      const width = parseFloat(style.outlineWidth) || 0;
      const visible = style.outlineStyle !== 'none' && width >= 2 && ring;
      const ratio = ring ? (Math.max(lum(ring), lum(bg)) + .05) / (Math.min(lum(ring), lum(bg)) + .05) : 0;
      return {tag: el.tagName.toLowerCase(), cls: String(el.className?.baseVal ?? el.className), text: (el.textContent || '').trim().slice(0, 30), visible: Boolean(visible), ratio: Number(ratio.toFixed(2)), width};
    });
    if (!result) continue;
    checked++;
    if (!result.visible || result.ratio < 3) failures.push(result);
  }
  return {checked, failures};
}

/* ---------- SPEC 8.3 item 9: 44 × 44 targets (links in running text exempt) ---------- */
export async function targetAudit(page) {
  return page.evaluate(() => {
    const selector = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[tabindex]:not([tabindex="-1"])';
    const failures = [];
    let checked = 0;
    for (const el of document.querySelectorAll(selector)) {
      if (el.closest('[hidden],[inert]') || el.matches('.pg-skip')) continue;
      const style = getComputedStyle(el), rect = el.getBoundingClientRect();
      if (style.visibility !== 'visible' || style.display === 'none' || rect.width === 0 || rect.height === 0) continue;
      if (el.tagName === 'INPUT' && Number(style.opacity) === 0 && el.closest('label')) {
        const box = el.closest('label').getBoundingClientRect();
        if (box.height >= 43.5) { checked++; continue; }
      }
      // Inline link inside a sentence: exempt (WCAG 2.5.8 inline exception).
      if (el.tagName === 'A' && style.display === 'inline') {
        const block = el.closest('p,li,dd,td,figcaption,label');
        if (block && block.textContent.trim().length > el.textContent.trim().length + 2) continue;
      }
      checked++;
      if (rect.width < 43.5 || rect.height < 43.5) failures.push({tag: el.tagName.toLowerCase(), text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40), width: Math.round(rect.width), height: Math.round(rect.height)});
    }
    return {checked, failures};
  });
}

/* ---------- SPEC 8.3 item 13: no perpetual requestAnimationFrame ---------- */
export async function idleRafCheck(t, label = 'after load') {
  await settle(t.page).catch(() => {});
  await pause(250);
  const before = await t.page.evaluate(() => window.__qa.raf);
  await pause(2000);
  const after = await t.page.evaluate(() => window.__qa.raf);
  t.check(`No requestAnimationFrame for 2 s ${label}`, after === before, {before, after});
}

/* ---------- SPEC 8.3 item 12: reduced motion and pause ---------- */
export async function reducedMotionChecks(t) {
  const {page, check, width} = t;
  const toggle = page.locator('#motion-toggle');
  check('System preference is shown on the motion control', await toggle.getAttribute('data-motion-state') === 'system' && await toggle.getAttribute('aria-label') === 'Movimento reduzido pelo sistema');
  check('Headings appear without masks', await page.evaluate(() => [...document.querySelectorAll('[data-reveal-heading]')].every(el => !el.querySelector('.hr-heading-visual'))));
  check('Nothing animates after load', (await runningAnimations(page)) === 0);
  if (width < DESKTOP_NAV) {
    await page.locator('#menu-toggle').click();
    await pause(50);
    check('Menu opens without running animations (reduced motion)', (await runningAnimations(page)) === 0 && await page.locator('#mobile-nav').isVisible());
    await page.keyboard.press('Escape');
  }
}

export async function pausedChecks(t) {
  const {page, check, width} = t;
  await page.locator('#motion-toggle').click();
  check('Pause button sets body.is-paused', await page.evaluate(() => document.body.classList.contains('is-paused')));
  if (width < DESKTOP_NAV) {
    await page.locator('#menu-toggle').click();
    await pause(50);
    check('Menu opens without running animations (paused)', (await runningAnimations(page)) === 0 && await page.locator('#mobile-nav').isVisible());
    const proxy = page.locator('#mobile-nav [data-motion-proxy]');
    check('Menu motion control mirrors the pause', await proxy.getAttribute('aria-pressed') === 'true');
    await page.keyboard.press('Escape');
  }
  await page.evaluate(() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'}));
  await pause(50);
  check('Scrolling while paused starts no animation', (await runningAnimations(page)) === 0);
}

/* ---------- SPEC 8.3 item 15: without JavaScript ---------- */
export async function noJsChecks(t) {
  const {page, check} = t;
  check('h1 is visible without JS', await page.locator('h1').isVisible());
  check('No content is hidden behind .reveal or the heading reveal', await page.evaluate(() =>
    [...document.querySelectorAll('main *')].filter(el => el.textContent.trim() && !el.closest('[hidden],[aria-hidden="true"]')).every(el => Number(getComputedStyle(el).opacity) === 1 && getComputedStyle(el).visibility === 'visible')));
  check('Dead JS-only controls are hidden without JS', !(await page.locator('#menu-toggle').isVisible()) && !(await page.locator('#motion-toggle').isVisible()));
  check('Footer navigation reaches every page without JS', await page.evaluate(() => ['/', '/#trabalhos', '/criadores', '/criadores/ao-vivo', '/vagas', '/privacidade'].every(href => document.querySelector(`.site-footer a[href="${href}"]`))));
  const overflow = await overflowState(page, t.width);
  check('No horizontal scroll without JS', fitsWidth(overflow), overflow);
  check('Form chips are disabled without JS (they only list the options)', await page.evaluate(() => [...document.querySelectorAll('[data-chips] button')].every(chip => chip.disabled)));
}

/* Widths between the three main viewports (phones in landscape, tablets, small
 * laptops): no horizontal overflow at load, and no large layout shift (CLS). */
export const SWEEP_WIDTHS = Object.freeze([560, 600, 640, 720, 768, 820, 844, 900, 960, 1024, 1100, 1200, 1263, 1280]);
export async function layoutSweep(t) {
  const {page, check} = t;
  const failures = [];
  for (const width of SWEEP_WIDTHS) {
    await page.setViewportSize({width, height: 900});
    // Crossing a breakpoint can run a 350 ms width morph; measure the settled layout.
    await pause(80);
    await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'), null, {timeout: 2000}).catch(() => {});
    const state = await overflowState(page, width);
    if (!fitsWidth(state)) failures.push(state);
  }
  await page.setViewportSize({width: t.width, height: t.height});
  await pause(80);
  check(`No horizontal overflow from ${SWEEP_WIDTHS[0]} to ${SWEEP_WIDTHS.at(-1)} px`, failures.length === 0, failures);
}
export async function cumulativeLayoutShift(page) {
  return page.evaluate(() => new Promise(resolve => {
    let total = 0;
    const sources = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        total += entry.value;
        sources.push({value: Number(entry.value.toFixed(4)), at: Math.round(entry.startTime), nodes: (entry.sources || []).map(s => s.node?.className || s.node?.nodeName || '').slice(0, 3)});
      }
    }).observe({type: 'layout-shift', buffered: true});
    setTimeout(() => resolve({total: Number(total.toFixed(4)), sources}), 300);
  }));
}

/* SwiftShader (the suite's GL) caps one capture at 8192 px; below that line a taller
 * full-page shot repeats the top of the page. Taller pages are captured in slices. */
const MAX_CAPTURE = 8000;
export async function screenshot(t) {
  if (!SCREENSHOT_WIDTHS.includes(t.width)) return;
  await t.page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  const path = `${t.output}/${t.slug}-${t.width}.png`;
  const height = await t.page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
  if (height <= MAX_CAPTURE) { await t.page.screenshot({path, fullPage: true, animations: 'disabled'}); return; }
  const slices = [];
  for (let y = 0; y < height; y += MAX_CAPTURE)
    slices.push(await t.page.screenshot({fullPage: true, clip: {x: 0, y, width: t.width, height: Math.min(MAX_CAPTURE, height - y)}, animations: 'disabled'}));
  await writeFile(path, stackPngs(slices));
}
