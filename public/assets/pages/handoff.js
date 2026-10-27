/* K10 · WhatsApp and e-mail handoff for the parallel pages (SPEC 4.0).
 * Nothing is ever sent from the page: the form only validates and builds a
 * message the visitor reviews; real <a href> links (wa.me / mailto:) open the
 * visitor's own app on their tap. No fetch, no POST, no window.open, no storage.
 * Contact data comes only from PORTFOLIO_PROFILE / PORTFOLIO_CONTACT
 * (/assets/profile.js, loaded as a classic deferred script before the modules).
 * The pure functions below run in node:test as well as in the browser. */

export const NOTICE_VERSION = '2026-10';
export const MAX_MESSAGE_LENGTH = 1500;
/* SPEC 2.8 · closed ?ref= allowlist. Any other value is ignored. */
export const REF_ORIGINS = Object.freeze({
  dm: 'link que você me mandou',
  bio: 'link da sua bio',
  email: 'link do seu e-mail',
  qr: 'QR code'
});
/* Status lines shared by the three copy decks (§8.3 / etapa 5). */
export const STATUS = Object.freeze({
  whatsapp: 'Abrindo o WhatsApp. Confira a mensagem e toque em enviar lá.',
  email: 'Abrindo o seu e-mail. Confira a mensagem e envie de lá.',
  copied: 'Mensagem copiada. Cole no WhatsApp ou no e-mail.',
  copyFailed: 'Não consegui copiar sozinho. Selecione o texto abaixo e copie.',
  desktop: 'No computador, o link abre o WhatsApp Web ou o aplicativo.'
});

const singleLine = value => String(value ?? '').replace(/\s+/g, ' ').trim();

/** Validated ?ref= key, or null. */
export function readRef(search = globalThis.location?.search ?? '') {
  let value = null;
  try { value = new URLSearchParams(search).get('ref'); } catch { return null; }
  return value !== null && Object.hasOwn(REF_ORIGINS, value) ? value : null;
}
/** Human label for the "Origem" line, or '' when ?ref= is absent or not allowed. */
export const refOrigin = (search = globalThis.location?.search ?? '') => {
  const ref = readRef(search);
  return ref ? REF_ORIGINS[ref] : '';
};

/** "a, b e c" (pt-BR list). */
export function joinList(items, conjunction = 'e') {
  const list = (items || []).map(singleLine).filter(Boolean);
  if (list.length < 2) return list.join('');
  return `${list.slice(0, -1).join(', ')} ${conjunction} ${list.at(-1)}`;
}

/** A message line. Strings are fixed lines; {label, value} lines disappear when
 * the value is empty (optional answers). Values are flattened to one line. */
export function messageLine(entry) {
  if (entry === null || entry === undefined || entry === false) return null;
  if (typeof entry === 'string') return entry.trim() ? entry.trim() : null;
  const [label, raw] = Array.isArray(entry) ? entry : [entry.label, entry.value];
  const value = Array.isArray(raw) ? joinList(raw) : singleLine(raw);
  if (!value) return null;
  return label ? `${singleLine(label)}: ${value}` : value;
}

/** Joins the lines; the closing lines (consent and notice version) always
 * survive. Free text is shortened so the message never exceeds the limit. */
export function composeMessage(lines = [], closing = [], max = MAX_MESSAGE_LENGTH) {
  const body = lines.map(messageLine).filter(Boolean);
  const end = closing.map(messageLine).filter(Boolean);
  const text = [...body, ...end].join('\n');
  if (text.length <= max) return text;
  const tail = end.join('\n');
  const room = Math.max(0, max - tail.length - (tail ? 1 : 0));
  const head = body.join('\n').slice(0, Math.max(0, room - 1)).trimEnd() + '…';
  return (tail ? `${head}\n${tail}` : head).slice(0, max);
}

/** Validated destinations from profile.js. Never hard-code the values here. */
export function profileDestinations(profile = globalThis.PORTFOLIO_PROFILE, contact = globalThis.PORTFOLIO_CONTACT) {
  if (!profile || typeof contact?.contactDestination !== 'function') return {whatsapp: null, email: null};
  const phone = contact.contactDestination({...profile, preferredChannel: 'whatsapp', email: ''});
  const mail = contact.contactDestination({...profile, preferredChannel: 'email', whatsapp: ''});
  return {
    whatsapp: phone?.channel === 'whatsapp' ? phone.address : null,
    email: mail?.channel === 'email' ? mail.address : null
  };
}

export function whatsappHref(text = '', destinations = profileDestinations()) {
  if (!destinations?.whatsapp) return null;
  return `https://wa.me/${destinations.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** RFC 6068: line breaks in a mailto body must be %0D%0A. */
export const crlf = text => String(text ?? '').replace(/\r\n|\r|\n/g, '\r\n');

export function mailtoHref({subject = '', body = ''} = {}, destinations = profileDestinations()) {
  if (!destinations?.email) return null;
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(singleLine(subject))}`);
  if (body) params.push(`body=${encodeURIComponent(crlf(body))}`);
  return `mailto:${encodeURIComponent(destinations.email).replace('%40', '@')}${params.length ? `?${params.join('&')}` : ''}`;
}

/** Message plus both links. `lines`/`closing` follow messageLine(). */
export function buildHandoff({lines = [], closing = [], subject = '', profile, contact} = {}) {
  const destinations = profileDestinations(profile ?? globalThis.PORTFOLIO_PROFILE, contact ?? globalThis.PORTFOLIO_CONTACT);
  const text = composeMessage(lines, closing);
  const cleanSubject = singleLine(subject);
  return {
    text, subject: cleanSubject, length: text.length,
    whatsapp: whatsappHref(text, destinations),
    email: mailtoHref({subject: cleanSubject, body: text}, destinations)
  };
}

/** Action-only analytics hook (SPEC 2.8): a local CustomEvent, never message content. */
export function recordInteraction(event, details = {}) {
  const payload = Object.freeze({event: `pages_${event}`, ...details});
  try { globalThis.dispatchEvent?.(new CustomEvent('portfolio:interaction', {detail: payload})); } catch { /* optional */ }
  return payload;
}

/* ---------- DOM (browser only) ---------- */

/** Panel contract (documented in pages/privacidade.html):
 * [data-handoff-panel] > [data-handoff-title] [data-handoff-message]
 * a[data-handoff=whatsapp] a[data-handoff=email] button[data-handoff=copy]
 * button[data-handoff=edit] [data-handoff-status]. Links start without href. */
export function renderHandoff(panel, handoff) {
  if (!panel) return;
  const message = panel.querySelector('[data-handoff-message]');
  if (message) message.textContent = handoff?.text ?? '';
  for (const channel of ['whatsapp', 'email']) {
    for (const link of panel.querySelectorAll(`a[data-handoff="${channel}"]`)) {
      const href = handoff?.[channel];
      if (href) { link.href = href; link.hidden = false; }
      else { link.removeAttribute('href'); link.hidden = true; }
    }
  }
  const fallback = panel.querySelector('[data-handoff-fallback]');
  if (fallback && !fallback.hidden) fallback.value = handoff?.text ?? '';
}

export function clearHandoff(panel) { renderHandoff(panel, null); }

/** Copies the message; without clipboard permission a read-only textarea appears. */
export async function copyMessage(text, {panel, status, labels = STATUS} = {}) {
  const say = message => { if (status) status.textContent = message; };
  try {
    if (!globalThis.navigator?.clipboard?.writeText) throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText(text);
    const fallback = panel?.querySelector('[data-handoff-fallback]');
    if (fallback) fallback.hidden = true;
    say(labels.copied);
    return true;
  } catch {
    let fallback = panel?.querySelector('[data-handoff-fallback]');
    if (panel && !fallback) {
      fallback = document.createElement('textarea');
      fallback.readOnly = true; fallback.rows = 8;
      fallback.className = 'pg-review-fallback';
      fallback.dataset.handoffFallback = '';
      fallback.setAttribute('aria-label', 'Mensagem pronta para copiar');
      if (status && panel.contains(status)) status.after(fallback); else panel.append(fallback);
    }
    if (fallback) { fallback.hidden = false; fallback.value = text; fallback.focus(); fallback.select(); }
    say(labels.copyFailed);
    return false;
  }
}

/** Binds the panel buttons. getText() returns the current message. */
export function bindHandoffPanel(panel, {getText, page = '', onEdit, labels = STATUS} = {}) {
  if (!panel || panel.dataset.handoffBound) return;
  panel.dataset.handoffBound = 'true';
  const status = panel.querySelector('[data-handoff-status]');
  panel.addEventListener('click', event => {
    const control = event.target.closest?.('[data-handoff]');
    if (!control || !panel.contains(control)) return;
    const action = control.dataset.handoff;
    if (action === 'whatsapp' || action === 'email') {
      // A real link the visitor tapped; the browser opens the app. Nothing is sent here.
      if (!control.getAttribute('href')) { event.preventDefault(); return; }
      if (status) status.textContent = labels[action];
      recordInteraction('handoff_click', {page, channel: action});
    } else if (action === 'copy') {
      event.preventDefault();
      copyMessage(getText?.() ?? '', {panel, status, labels}).then(ok => recordInteraction(ok ? 'message_copied' : 'message_copy_fallback', {page}));
    } else if (action === 'edit') {
      event.preventDefault();
      onEdit?.();
    }
  });
}

const firstControl = form => form?.querySelector('input:not([type=hidden]):not([disabled]),select,textarea,button.pg-chip,[data-chips] button');

/** Single-step form flow (/criadores, /criadores/ao-vivo):
 * submit → validate → error summary, or review panel with focus on its title.
 * `validator` comes from builder.js createValidator(); `compose()` returns
 * {lines, closing, subject}. Later answers update the message and both links. */
export function mountReview({form, panel, validator, compose, page = '', labels = STATUS, motion = null, onShow} = {}) {
  if (!form || !panel || !validator || typeof compose !== 'function') throw new Error('mountReview: form, panel, validator and compose are required');
  form.noValidate = true;
  let current = null, shown = false;
  const title = panel.querySelector('[data-handoff-title]');
  if (title && !title.hasAttribute('tabindex')) title.tabIndex = -1;
  const update = () => { current = buildHandoff(compose()); renderHandoff(panel, current); return current; };
  const hide = () => { shown = false; current = null; panel.hidden = true; clearHandoff(panel); };
  clearHandoff(panel);
  panel.hidden = true;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const errors = validator.validate({focusSummary: true});
    if (errors.length) { hide(); return; }
    update();
    const wasShown = shown;
    shown = true; panel.hidden = false;
    const status = panel.querySelector('[data-handoff-status]');
    if (status) status.textContent = '';
    if (!wasShown) motion?.animate?.(panel, [{opacity: 0, transform: 'translateY(12px)'}, {opacity: 1, transform: 'none'}], {duration: 450});
    title?.focus({preventScroll: false});
    onShow?.(current);
    recordInteraction('review_opened', {page});
  });
  const refresh = () => {
    if (!shown) return;
    if (validator.check().length) hide(); else update();
  };
  for (const type of ['input', 'change', 'builder:change']) form.addEventListener(type, refresh);
  bindHandoffPanel(panel, {page, labels, getText: () => current?.text ?? '', onEdit: () => {
    const target = firstControl(form);
    target?.focus({preventScroll: true});
    target?.scrollIntoView?.({block: 'center'});
  }});
  // JavaScript is running: enable the real submit and retire the no-JS mailto note.
  form.querySelectorAll('[type="submit"]').forEach(button => { button.disabled = false; });
  (form.closest('section') || form.parentElement)?.querySelectorAll('[data-nojs-fallback]').forEach(el => { el.hidden = true; });
  return {update, hide, current: () => current, isShown: () => shown};
}
