/* K9 · Chip builder, live summary and inline pt-BR validation (SPEC 4.0).
 * Chips are <button type="button" aria-pressed> inside <fieldset data-chips>:
 *   data-chips="single" | "multi", data-name="<answer key>", data-optional (single
 *   choice that can be cleared) and data-exclusive on a chip that clears the
 *   others ("Ainda não sei"), and vice versa.
 * Validation runs on blur and on submit, never while typing. Errors are text
 * below the field, linked by aria-describedby, with aria-invalid on inputs and
 * a focusable summary ("Falta pouco. Confira:") with links to each field.
 * Nothing here stores or sends answers. */

export const ERROR_SUMMARY_TITLE = 'Falta pouco. Confira:';
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const EMAIL = /[^\s<>@]+@[^\s<>@]+\.[^\s<>@.,;:!?]+/g;

/* ---------- chips ---------- */

function chipGroup(fieldset) {
  const mode = fieldset.dataset.chips === 'multi' ? 'multi' : 'single';
  const chips = () => $$('button[aria-pressed]', fieldset);
  return {
    fieldset, mode, name: fieldset.dataset.name || fieldset.id, chips,
    value() {
      const picked = chips().filter(chip => chip.getAttribute('aria-pressed') === 'true').map(chip => chip.dataset.value ?? chip.textContent.trim());
      return mode === 'multi' ? picked : (picked[0] ?? '');
    }
  };
}

export function pressChip(chip, pressed) {
  chip.setAttribute('aria-pressed', String(Boolean(pressed)));
}

function onChip(group, chip, form) {
  const pressed = chip.getAttribute('aria-pressed') === 'true';
  if (group.mode === 'single') {
    if (pressed && group.fieldset.hasAttribute('data-optional')) pressChip(chip, false);
    else group.chips().forEach(other => pressChip(other, other === chip));
  } else if (!pressed) {
    pressChip(chip, true);
    // An exclusive chip ("Ainda não sei") clears the others, and the others clear it.
    const exclusive = chip.hasAttribute('data-exclusive');
    group.chips().forEach(other => { if (other !== chip && (exclusive || other.hasAttribute('data-exclusive'))) pressChip(other, false); });
  } else pressChip(chip, false);
  // Dispatched from the fieldset so its own validator hears it; it bubbles to the form.
  group.fieldset.dispatchEvent(new CustomEvent('builder:change', {bubbles: true, detail: {name: group.name, value: group.value()}}));
}

/** Answers of a form: chip groups by data-name; inputs by name (checkbox → boolean). */
export function readValues(form, groups = $$('[data-chips]', form).map(chipGroup)) {
  const values = {};
  for (const group of groups) values[group.name] = group.value();
  for (const field of form.elements || []) {
    if (!field.name || field.disabled || field.closest?.('[data-chips]')) continue;
    if (field.type === 'checkbox') values[field.name] = field.checked;
    else if (field.type === 'radio') { if (field.checked) values[field.name] = field.value; else values[field.name] ??= ''; }
    else if (field.tagName !== 'BUTTON' && field.tagName !== 'FIELDSET') values[field.name] = String(field.value ?? '').trim();
  }
  return values;
}

/** Wires the chips of a form and its live summary.
 * summary: element with [data-summary-list], [data-summary-count], [data-summary-empty].
 * describe(values) → {lines: string[], count: number} for the summary. */
export function mountBuilder(form, {summary = null, describe = null, countLabel = n => (n === 1 ? '1 escolha' : `${n} escolhas`)} = {}) {
  if (!form) throw new Error('mountBuilder: form is required');
  const groups = $$('[data-chips]', form).map(chipGroup);
  for (const group of groups) {
    group.chips().forEach(chip => {
      if (!chip.hasAttribute('type')) chip.type = 'button';
      if (!chip.hasAttribute('aria-pressed')) pressChip(chip, false);
      chip.addEventListener('click', () => onChip(group, chip, form));
    });
  }
  const values = () => readValues(form, groups);
  const render = () => {
    if (!summary || typeof describe !== 'function') return;
    const {lines = [], count = 0} = describe(values()) || {};
    const list = summary.querySelector('[data-summary-list]');
    const empty = summary.querySelector('[data-summary-empty]');
    const counter = summary.querySelector('[data-summary-count]');
    if (list) list.replaceChildren(...lines.filter(Boolean).map(line => { const li = document.createElement('li'); li.textContent = line; return li; }));
    if (empty) empty.hidden = lines.filter(Boolean).length > 0;
    if (counter) counter.textContent = countLabel(count);
  };
  for (const type of ['builder:change', 'input', 'change']) form.addEventListener(type, render);
  render();
  return {
    groups, values, render,
    get: name => values()[name],
    set(name, value) {
      const group = groups.find(item => item.name === name);
      if (!group) return;
      const wanted = new Set(Array.isArray(value) ? value : [value]);
      group.chips().forEach(chip => pressChip(chip, wanted.has(chip.dataset.value ?? chip.textContent.trim())));
      group.fieldset.dispatchEvent(new CustomEvent('builder:change', {bubbles: true, detail: {name, value: group.value()}}));
    },
    clear() { groups.forEach(group => group.chips().forEach(chip => pressChip(chip, false))); render(); }
  };
}

/* ---------- inline errors ---------- */

function describedBy(el, id, add) {
  const ids = new Set((el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  if (add) ids.add(id); else ids.delete(id);
  if (ids.size) el.setAttribute('aria-describedby', [...ids].join(' ')); else el.removeAttribute('aria-describedby');
}

/** Text with e-mail addresses turned into mailto links, built without innerHTML. */
export function textWithEmailLinks(text) {
  const fragment = document.createDocumentFragment();
  let last = 0;
  for (const match of String(text).matchAll(EMAIL)) {
    fragment.append(text.slice(last, match.index));
    const link = document.createElement('a');
    link.href = `mailto:${match[0]}`; link.textContent = match[0];
    fragment.append(link);
    last = match.index + match[0].length;
  }
  fragment.append(String(text).slice(last));
  return fragment;
}

const isGroup = el => el?.tagName === 'FIELDSET' || el?.getAttribute?.('role') === 'group' || el?.getAttribute?.('role') === 'radiogroup';
const errorAnchor = el => (el.type === 'checkbox' || el.type === 'radio') ? (el.closest('label') || el) : el;

/** Shows `message` for a field (input, textarea, checkbox or chip fieldset). */
export function setFieldError(field, message, {help = ''} = {}) {
  if (!field) return null;
  const id = `${field.id}-erro`;
  let error = document.getElementById(id);
  if (!error) {
    error = document.createElement('p');
    error.id = id; error.className = 'pg-error'; error.dataset.errorFor = field.id;
    if (isGroup(field)) field.append(error);
    else errorAnchor(field).after(error);
  }
  const icon = document.createElement('span');
  icon.className = 'pg-error-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = '!';
  const text = document.createElement('span');
  text.textContent = message;
  error.replaceChildren(icon, text);
  error.hidden = false;
  const helpId = `${field.id}-ajuda-erro`;
  let helper = document.getElementById(helpId);
  if (help) {
    if (!helper) { helper = document.createElement('p'); helper.id = helpId; helper.className = 'pg-error-help'; error.after(helper); }
    helper.replaceChildren(typeof help === 'string' ? textWithEmailLinks(help) : help);
    helper.hidden = false;
    describedBy(field, helpId, true);
  } else if (helper) { helper.hidden = true; describedBy(field, helpId, false); }
  describedBy(field, id, true);
  if (isGroup(field)) field.dataset.invalid = 'true';
  else field.setAttribute('aria-invalid', 'true');
  return error;
}

export function clearFieldError(field) {
  if (!field) return;
  for (const suffix of ['-erro', '-ajuda-erro']) {
    const el = document.getElementById(field.id + suffix);
    if (el) { el.hidden = true; describedBy(field, el.id, false); }
  }
  field.removeAttribute('aria-invalid');
  delete field.dataset.invalid;
}

/** First control to focus for an error target. */
export function focusTarget(field) {
  if (!field) return null;
  if (isGroup(field)) return field.querySelector('button[aria-pressed="true"],input:checked') || field.querySelector('button,input,select,textarea');
  return field;
}

/** Renders the error summary. errors: [{id, message}] in DOM order. */
export function renderErrorSummary(container, errors, {title = ERROR_SUMMARY_TITLE, focus = true} = {}) {
  if (!container) return;
  if (!errors.length) { container.hidden = true; container.replaceChildren(); return; }
  const heading = document.createElement('h3');
  heading.className = 'pg-error-summary-title';
  heading.id = container.id ? `${container.id}-titulo` : '';
  heading.textContent = title;
  const list = document.createElement('ul');
  for (const error of errors) {
    const item = document.createElement('li'), link = document.createElement('a');
    link.href = `#${error.id}`; link.textContent = error.message;
    link.addEventListener('click', event => {
      event.preventDefault();
      const target = focusTarget(document.getElementById(error.id));
      target?.focus({preventScroll: true});
      target?.scrollIntoView?.({block: 'center'});
    });
    item.append(link); list.append(item);
  }
  container.replaceChildren(heading, list);
  if (heading.id) container.setAttribute('aria-labelledby', heading.id);
  container.tabIndex = -1;
  container.hidden = false;
  if (focus) container.focus({preventScroll: false});
}

/** rules: [{id, check(values, field) → '' | message | {message, help}}] in DOM order.
 * Text fields validate on blur (an error can clear while typing, never appear);
 * chips, checkboxes and radios validate on change. */
export function createValidator(form, rules, {summary = null, values = () => readValues(form)} = {}) {
  const run = rule => {
    const field = document.getElementById(rule.id);
    const result = rule.check(values(), field);
    const {message = '', help = ''} = typeof result === 'string' ? {message: result} : (result || {});
    return {id: rule.id, field, message, help};
  };
  const show = outcome => outcome.message ? setFieldError(outcome.field, outcome.message, {help: outcome.help}) : clearFieldError(outcome.field);
  const validateField = id => {
    const rule = rules.find(item => item.id === id);
    if (!rule) return '';
    const outcome = run(rule); show(outcome);
    // The summary is rebuilt only on submit (GOV.UK pattern): changing it on blur
    // would shift the layout under the pointer between mousedown and click.
    return outcome.message;
  };
  const check = () => rules.map(run).filter(outcome => outcome.message).map(({id, message}) => ({id, message}));
  for (const rule of rules) {
    const field = document.getElementById(rule.id);
    if (!field) continue;
    const touch = () => validateField(rule.id);
    if (isGroup(field)) { field.addEventListener('builder:change', touch); field.addEventListener('change', touch); }
    else if (['checkbox', 'radio'].includes(field.type)) field.addEventListener('change', touch);
    else {
      field.addEventListener('blur', touch);
      // While typing, an error may disappear as soon as the answer is fixed (never
      // appear): the layout settles before the visitor reaches the next control.
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true' && !run(rule).message) clearFieldError(field);
      });
    }
  }
  return {
    check,
    validateField,
    validate({focusSummary = true} = {}) {
      const outcomes = rules.map(run);
      outcomes.forEach(show);
      const errors = outcomes.filter(outcome => outcome.message).map(({id, message}) => ({id, message}));
      renderErrorSummary(summary, errors, {focus: focusSummary && errors.length > 0});
      if (errors.length && !summary && focusSummary) focusTarget(document.getElementById(errors[0].id))?.focus();
      return errors;
    },
    reset() { rules.forEach(rule => clearFieldError(document.getElementById(rule.id))); renderErrorSummary(summary, []); }
  };
}
