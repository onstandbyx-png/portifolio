/* K2 · Motion tokens for the parallel pages (SPEC 2.5).
 * springAt() is reused from /assets/sections/motion.js. createMotion().spring()
 * always uses a 0.5 s period, so this wrapper accepts `period` and turns the
 * same spring into CSS `linear()` curves or WAAPI keyframes.
 * Relative imports keep the module loadable by the browser and by node:test. */
import {springAt} from '../sections/motion.js';

/* Measured durations (ms). */
export const DURATION = Object.freeze({
  flipOpen: 600, flipClose: 350, deck: 400, morph: 350, entry: 450, entryStagger: 60,
  step: 500, menu: 280, menuStagger: 30, headerCta: 240, heading: 660, headingStagger: 75,
  reducedFade: 120
});

/* Non-spring curves (CSS). Morph peaks at ~0.2% overshoot, inside the 2% limit. */
export const EASE = Object.freeze({
  deck: 'ease',
  morph: 'cubic-bezier(.2,.9,.25,1.02)',
  step: 'cubic-bezier(.25,.1,.25,1)',
  flip: 'cubic-bezier(.25,1,.5,1)',
  menu: 'cubic-bezier(.2,.8,.2,1)',
  heading: 'cubic-bezier(.22,.72,.2,1)'
});

/* Spring presets: name (damping family of motion.js), duration and period d (s).
 * smooth d=.42: 95% at ~318 ms; smooth d=.25: 95% at ~190 ms; snappy: 0.63%
 * overshoot; bouncy: ~4.6% overshoot, allowed only for check, seal and deck snap. */
export const PRESETS = Object.freeze({
  flipOpen: Object.freeze({name: 'smooth', duration: 600, period: .42}),
  flipClose: Object.freeze({name: 'smooth', duration: 350, period: .25}),
  entry: Object.freeze({name: 'snappy', duration: 450, period: .40}),
  check: Object.freeze({name: 'bouncy', duration: 600, period: .40}),
  seal: Object.freeze({name: 'bouncy', duration: 600, period: .40}),
  deckSnap: Object.freeze({name: 'bouncy', duration: 560, period: .35})
});
/* Presets allowed above 2% overshoot (never above 10%). */
export const OVERSHOOT_EXCEPTIONS = Object.freeze(['check', 'seal', 'deckSnap']);

const preset = value => typeof value === 'string' ? PRESETS[value] : value;

export const springValue = (name, ms, period = .5) => springAt(name, ms, period);

/** Progress samples from 0 to 1; the final sample is forced to 1 like createMotion().spring(). */
export function springSamples(spec, samples = 48) {
  const {name, duration, period} = preset(spec);
  return Array.from({length: samples + 1}, (_, i) => i === samples ? 1 : springAt(name, i / samples * duration, period));
}

/** CSS `linear()` easing that reproduces the spring over its duration. */
export function springLinear(spec, samples = 40) {
  const values = springSamples(spec, samples);
  return 'linear(' + values.map((value, i) => {
    const v = Number(value.toFixed(4));
    if (i === 0 || i === samples) return String(v);
    return `${v} ${Number((i / samples * 100).toFixed(2))}%`;
  }).join(', ') + ')';
}

/** WAAPI keyframes: frame(progress) returns the properties for that progress. */
export function springKeyframes(frame, spec, samples = 48) {
  return springSamples(spec, samples).map((value, i) => ({...frame(value), offset: i / samples}));
}

/** Peak overshoot in percent (0 for critically damped curves). */
export function springOvershoot(spec, step = 1) {
  const {name, duration, period} = preset(spec);
  let peak = 0;
  for (let ms = 0; ms <= Math.max(duration, 3000); ms += step) peak = Math.max(peak, springAt(name, ms, period));
  return Math.max(0, (peak - 1) * 100);
}

/** Time (ms) after which the curve stays within `tolerance` of 1. */
export function springSettle(spec, tolerance = .005, step = 1) {
  const {name, period} = preset(spec);
  let last = 0;
  for (let ms = 0; ms <= 3000; ms += step) if (Math.abs(springAt(name, ms, period) - 1) > tolerance) last = ms;
  return last;
}

export function supportsLinearEasing() {
  try { return typeof CSS !== 'undefined' && CSS.supports('animation-timing-function', 'linear(0, 1)'); }
  catch { return false; }
}

/** Easing string for CSS/WAAPI: the spring as linear(), or a no-overshoot fallback. */
export function springEasing(spec, fallback = EASE.flip) {
  return supportsLinearEasing() ? springLinear(spec) : fallback;
}

/** True when motion must be instant: system preference, pause button or hidden tab.
 * Mirrors createMotion().paused() from /assets/sections/motion.js. */
export function motionReduced() {
  const doc = globalThis.document;
  if (!doc) return true;
  return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    doc.body?.classList.contains('is-paused') ||
    doc.querySelector('.motion-toggle')?.getAttribute('aria-pressed') === 'true');
}

/** Calls back whenever the reduced/paused state may have changed. Returns a stop function. */
export function onMotionPreferenceChange(callback) {
  const doc = globalThis.document;
  if (!doc || typeof callback !== 'function') return () => {};
  const query = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  const run = () => callback(motionReduced());
  query?.addEventListener?.('change', run);
  const observer = new MutationObserver(run);
  if (doc.body) observer.observe(doc.body, {attributes: true, attributeFilter: ['class']});
  const toggle = doc.querySelector('.motion-toggle');
  if (toggle) observer.observe(toggle, {attributes: true, attributeFilter: ['aria-pressed']});
  return () => { query?.removeEventListener?.('change', run); observer.disconnect(); };
}

/** Exposes the spring curves as custom properties so CSS components use the
 * same motion as the scripts (e.g. check.css, flip.css). Safe to call twice. */
export function applySpringTokens(root = globalThis.document?.documentElement) {
  if (!root?.style || !supportsLinearEasing()) return false;
  for (const [key, spec] of Object.entries(PRESETS)) {
    const name = key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    root.style.setProperty(`--pg-ease-${name}`, springLinear(spec));
  }
  return true;
}
