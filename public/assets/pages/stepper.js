/* K18 · Stepper: one question per step (GOV.UK question pages), built on K9.
 * - "Continuar" (the form's submit) validates only the current step; errors go
 *   to the summary, which takes focus. "Voltar" keeps every answer.
 * - A step change slides in 500 ms with cubic-bezier(.25,.1,.25,1) (SPEC 2.5);
 *   the step viewport eases its height in the same 500 ms. Reduced motion,
 *   the pause button or a hidden tab change the step instantly.
 * - Focus moves to the legend of the new step and the plain-text counter
 *   ("Etapa 2 de 5", aria-live) announces the position. No progress bar.
 * - Nothing is stored: answers live only in the form controls.
 * Markup:
 *   <form novalidate>
 *     <p data-step-counter aria-live="polite" hidden>Etapa 1 de 5</p>
 *     <div data-error-summary hidden></div>
 *     <div data-step-viewport>
 *       <fieldset data-step><legend tabindex="-1">…</legend>…</fieldset> × N
 *     </div>
 *     <button type="button" data-step-back hidden>Voltar</button>
 *     <button type="submit" data-step-next disabled>Continuar</button>
 *   </form>
 * Without JS every step stays visible, as a plain list of the questions. */
import {DURATION, EASE, motionReduced} from './spring.js';
import {renderErrorSummary} from './builder.js';

export const stepLabel = (n, total) => `Etapa ${n} de ${total}`;

export function mountStepper(form, {motion = null, validateStep = () => [], onChange = null, onSettle = null, summary = form?.querySelector('[data-error-summary]')} = {}) {
  if (!form) throw new Error('mountStepper: form is required');
  const viewport = form.querySelector('[data-step-viewport]');
  const steps = [...form.querySelectorAll('[data-step]')];
  const counter = form.querySelector('[data-step-counter]');
  const next = form.querySelector('[data-step-next]');
  const back = form.querySelector('[data-step-back]');
  if (!viewport || !steps.length) throw new Error('mountStepper: [data-step-viewport] and [data-step] are required');
  const total = steps.length;
  let index = 0, transition = null;

  const legendOf = step => step.querySelector('[data-step-focus]') || step.querySelector('legend');
  steps.forEach(step => {
    const legend = legendOf(step);
    if (legend && !legend.hasAttribute('tabindex')) legend.tabIndex = -1;
    step.querySelectorAll('[data-step-caption]').forEach(caption => { caption.hidden = true; });
  });

  function sync() {
    steps.forEach((step, i) => { if (i !== index && step !== transition?.from) step.hidden = true; });
    steps[index].hidden = false;
    if (counter) { counter.hidden = false; counter.textContent = stepLabel(index + 1, total); }
    if (back) back.hidden = index === 0;
    if (next) next.hidden = index === total - 1;
    form.dataset.currentStep = String(index + 1);
  }

  function finishTransition() {
    if (!transition) return;
    const {from, animations} = transition;
    transition = null;
    animations.forEach(animation => { try { animation.finish(); } catch { animation.cancel(); } });
    cleanup(from);
  }
  function cleanup(from) {
    from.classList.remove('is-leaving');
    from.style.removeProperty('opacity');
    from.inert = false;
    if (from !== steps[index]) from.hidden = true;
    viewport.classList.remove('is-sliding');
  }

  function reveal() {
    const anchor = counter && !counter.hidden ? counter : viewport;
    const top = anchor.getBoundingClientRect().top;
    const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
    // Only scroll when the start of the step is out of view; CSS decides smooth or instant.
    if (top < header || top > innerHeight * .6) anchor.scrollIntoView({block: 'start'});
  }

  /** Moves to step `target` (0-based). Resolves when the change has settled. */
  function go(target, {focus = true} = {}) {
    if (target === index || target < 0 || target >= total) return Promise.resolve(index);
    finishTransition();
    const from = steps[index], to = steps[target], direction = target > index ? 1 : -1;
    const startHeight = viewport.getBoundingClientRect().height;
    renderErrorSummary(summary, []);
    index = target;
    const animate = Boolean(motion?.available?.()) && !motionReduced();
    if (animate) {
      transition = {from, animations: []};
      // The leaving step stays out of the tab order while it slides away.
      from.inert = true;
      from.classList.add('is-leaving');
      viewport.classList.add('is-sliding');
    }
    sync();
    onChange?.(index, {from, to, direction});
    let settled = Promise.resolve();
    if (animate) {
      const endHeight = viewport.getBoundingClientRect().height;
      const options = {duration: DURATION.step, easing: EASE.step};
      // The leaving step keeps its final state inline, so it never flashes back.
      from.style.opacity = '0';
      const animations = [
        motion.animate(from, [{transform: 'translateX(0)', opacity: 1}, {transform: `translateX(${-direction * 100}%)`, opacity: 0}], options),
        motion.animate(to, [{transform: `translateX(${direction * 100}%)`, opacity: 0}, {transform: 'translateX(0)', opacity: 1}], options),
        motion.animate(viewport, [{height: `${startHeight}px`}, {height: `${endHeight}px`}], options)
      ].filter(Boolean);
      const current = transition;
      current.animations = animations;
      settled = Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
        if (transition === current) { transition = null; cleanup(from); }
      });
      if (!animations.length) { transition = null; cleanup(from); }
    }
    if (focus) {
      legendOf(to)?.focus({preventScroll: true});
      reveal();
    }
    return settled.then(() => {
      if (steps[index] === to) onSettle?.(index, {from, to, direction, animated: animate});
      return index;
    });
  }

  form.noValidate = true;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const errors = validateStep(index) || [];
    if (errors.length || index === total - 1) return;
    go(index + 1);
  });
  back?.addEventListener('click', () => go(index - 1));
  // Keep focus in the field while the pointer presses a nav button: a blur error
  // appearing under the field would push the button away before the click lands.
  [next, back].forEach(button => button?.addEventListener('mousedown', event => { if (event.button === 0) event.preventDefault(); }));
  if (next) next.disabled = false;
  if (back) back.type = 'button';
  sync();
  return {
    go,
    next: () => go(index + 1),
    back: () => go(index - 1),
    index: () => index,
    total,
    steps,
    current: () => steps[index],
    finish: finishTransition
  };
}
