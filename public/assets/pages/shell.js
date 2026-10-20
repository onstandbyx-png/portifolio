/* K1 · Shell of the parallel pages (/criadores, /criadores/ao-vivo, /vagas, /privacidade).
 * - #motion-toggle (read by /assets/sections/motion.js): pauses all motion via body.is-paused;
 * - header CTA that appears after the hero (IntersectionObserver, 240 ms);
 * - full-screen mobile menu: 280 ms + 30 ms stagger, focus trap, Escape, ref-counted
 *   scroll lock and focus return;
 * - .reveal entries: 450 ms spring, once per element, only for elements that enter later;
 * - [data-reveal-heading] titles (K12) and profile-driven contact links.
 * Content never depends on this script: without JS everything stays visible. */
import {createMotion} from '../sections/motion.js';
import {lockPageScroll} from './scroll-lock.js';
import {DURATION, EASE, applySpringTokens, springEasing} from './spring.js';
import {startHeadingReveal} from './heading-reveal.js';
import {profileDestinations} from './handoff.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
const DESKTOP_NAV = '(min-width: 960px)';

export const MOTION_LABELS = Object.freeze({
  pause: Object.freeze({icon: 'Ⅱ', text: 'Pausar movimento', aria: 'Pausar movimento e reprodução'}),
  resume: Object.freeze({icon: '▶', text: 'Retomar movimento', aria: 'Retomar movimento e reprodução'}),
  system: Object.freeze({icon: 'Ⅱ', text: 'Movimento reduzido pelo sistema', aria: 'Movimento reduzido pelo sistema'})
});

export const motion = createMotion();
const state = {menuOpen: false, paused: false};

function setupMotionToggle() {
  const buttons = [$('#motion-toggle'), ...$$('[data-motion-proxy]')].filter(Boolean);
  state.paused = document.body.classList.contains('is-paused');
  const render = () => {
    const system = reducedQuery.matches;
    const key = system ? 'system' : state.paused ? 'resume' : 'pause';
    const label = MOTION_LABELS[key];
    for (const button of buttons) {
      // aria-pressed reflects the visitor's own pause; the system state is a label.
      button.setAttribute('aria-pressed', String(state.paused));
      button.setAttribute('aria-label', label.aria);
      button.title = label.aria;
      button.dataset.motionState = key;
      if (system) button.setAttribute('aria-disabled', 'true'); else button.removeAttribute('aria-disabled');
      const icon = document.createElement('span'), text = document.createElement('span');
      icon.className = 'motion-toggle-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = label.icon;
      text.className = 'motion-toggle-text'; text.textContent = label.text;
      button.replaceChildren(icon, text);
    }
    document.documentElement.dataset.motion = system ? 'reduced' : state.paused ? 'paused' : 'full';
  };
  const toggle = () => {
    if (reducedQuery.matches) return;
    state.paused = !state.paused;
    document.body.classList.toggle('is-paused', state.paused);
    render();
  };
  buttons.forEach(button => button.addEventListener('click', toggle));
  reducedQuery.addEventListener('change', render);
  render();
}

function setupHeaderCta() {
  const header = $('.site-header');
  const cta = header && $('[data-header-cta]', header);
  if (!cta) return;
  const hero = $('[data-hero]') || $('main > :first-child');
  if (!hero || !('IntersectionObserver' in window)) { header.classList.add('is-past-hero'); return; }
  const offset = () => Math.round(header.getBoundingClientRect().height) || 64;
  let observer;
  const observe = () => {
    observer?.disconnect();
    observer = new IntersectionObserver(([entry]) => {
      // Past the hero = the hero is no longer visible below the header and sits above it.
      header.classList.toggle('is-past-hero', !entry.isIntersecting && entry.boundingClientRect.top < offset());
    }, {rootMargin: `-${offset()}px 0px 0px 0px`, threshold: 0});
    observer.observe(hero);
  };
  observe();
  matchMedia(DESKTOP_NAV).addEventListener('change', observe);
}

function setupMenu() {
  const header = $('.site-header'), toggle = $('#menu-toggle'), panel = $('#mobile-nav');
  if (!header || !toggle || !panel) return;
  const desktop = matchMedia(DESKTOP_NAV);
  let unlock = null, animations = [], inerted = [];
  const visible = el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const focusables = () => [toggle, ...$$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', panel).filter(visible)];
  const setInert = on => {
    if (on) {
      inerted = [$('.pg-skip'), $('main'), $('.site-footer'), ...$$('.site-header-inner > *')]
        .filter(el => el && el !== toggle && !el.contains(toggle) && !el.inert);
      inerted.forEach(el => { el.inert = true; });
    } else { inerted.forEach(el => { el.inert = false; }); inerted = []; }
  };
  const stopAnimations = () => { animations.forEach(animation => { try { animation.finish(); } catch { animation.cancel(); } }); animations = []; };
  function open() {
    if (state.menuOpen) return;
    state.menuOpen = true;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    header.classList.add('is-menu-open');
    unlock = lockPageScroll();
    setInert(true);
    stopAnimations();
    const items = $$('[data-menu-item]', panel);
    animations = [
      motion.animate(panel, [{opacity: 0, transform: 'translateY(-8px)'}, {opacity: 1, transform: 'none'}], {duration: DURATION.menu, easing: EASE.menu}),
      ...items.map((item, i) => motion.animate(item, [{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'none'}], {duration: DURATION.menu, delay: (i + 1) * DURATION.menuStagger, easing: EASE.menu}))
    ].filter(Boolean);
    (focusables()[1] || toggle).focus({preventScroll: true});
  }
  function close({restoreFocus = true} = {}) {
    if (!state.menuOpen) return;
    state.menuOpen = false;
    stopAnimations();
    const hadFocus = panel.contains(document.activeElement);
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    header.classList.remove('is-menu-open');
    setInert(false);
    unlock?.(); unlock = null;
    if (restoreFocus) {
      const target = desktop.matches ? $('.pg-nav a', header) : toggle;
      target?.focus({preventScroll: true});
    } else if (hadFocus && desktop.matches) $('.pg-nav a', header)?.focus({preventScroll: true});
  }
  toggle.addEventListener('click', () => (state.menuOpen ? close() : open()));
  panel.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (link && panel.contains(link)) close({restoreFocus: false});
  });
  document.addEventListener('keydown', event => {
    if (!state.menuOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const list = focusables();
    const index = list.indexOf(document.activeElement);
    if (index === -1) { event.preventDefault(); list[0]?.focus(); return; }
    if (event.shiftKey && index === 0) { event.preventDefault(); list.at(-1).focus(); }
    else if (!event.shiftKey && index === list.length - 1) { event.preventDefault(); list[0].focus(); }
  });
  desktop.addEventListener('change', () => { if (desktop.matches) close({restoreFocus: false}); });
  motion.onStop(stopAnimations);
}

function setupReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-visible')); return; }
  const delivered = new WeakSet();
  const easing = springEasing('entry', 'cubic-bezier(.16,1,.3,1)');
  const delayOf = el => {
    const group = el.closest('[data-reveal-group]');
    const index = group ? $$('.reveal', group).indexOf(el) : 0;
    return Math.min(Math.max(index, 0), 5) * DURATION.entryStagger;
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const el = entry.target, first = !delivered.has(el);
      delivered.add(el);
      if (!entry.isIntersecting) continue;
      observer.unobserve(el);
      el.classList.add('is-visible');
      // Already on screen at load: shown as is. Only later entries move, once.
      if (first) continue;
      motion.animate(el, [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: DURATION.entry, delay: delayOf(el), easing});
    }
  }, {threshold: 0});
  items.forEach(el => observer.observe(el));
}

function syncProfileLinks() {
  const {whatsapp, email} = profileDestinations();
  if (whatsapp) $$('a[data-profile-link="whatsapp"]').forEach(link => { link.href = `https://wa.me/${whatsapp}`; });
  if (email) {
    $$('a[data-profile-link="email"]').forEach(link => { link.href = `mailto:${email}`; });
    $$('[data-profile-text="email"]').forEach(el => { el.textContent = email; });
  }
}

let started = false;
export function initShell() {
  if (started) return;
  started = true;
  document.documentElement.classList.add('pg-js');
  applySpringTokens();
  setupMotionToggle();
  setupHeaderCta();
  setupMenu();
  setupReveal();
  syncProfileLinks();
  if ($('[data-reveal-heading]')) startHeadingReveal();
  document.documentElement.dataset.shellReady = 'true';
}

export const isMenuOpen = () => state.menuOpen;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initShell, {once: true});
else initShell();
