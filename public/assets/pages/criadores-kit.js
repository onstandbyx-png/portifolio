/* /criadores · "Montar meu kit" (SPEC 4.A, copy-criadores.md §8).
 * Pure functions shared by the page entry (criadores.js) and node:test:
 * @ normalization and its pt-BR errors, the live summary and the prefilled
 * message. Nothing here touches the DOM, the network or any storage, and the
 * contact data never appears here (handoff.js reads it from PORTFOLIO_PROFILE). */
import {NOTICE_VERSION, joinList} from './handoff.js';

export const HANDLE_ERRORS = Object.freeze({
  empty: 'Digite o @ do seu perfil principal.',
  chars: 'Use só letras, números, ponto e sublinhado. Sem espaços.',
  length: 'O @ precisa ter de 2 a 30 caracteres.'
});
export const KIT_ERRORS = Object.freeze({
  plataforma: 'Escolha a plataforma principal.',
  preciso: 'Escolha pelo menos uma opção em “Preciso de”.',
  maior: 'Confirme que você tem 18 anos ou mais.'
});
/** Help below the 18+ error; `email` comes from PORTFOLIO_PROFILE. */
export const guardianHelp = email => `Por enquanto atendo só maiores de 18 anos. Se você é responsável por um criador menor de idade, escreva para ${email} e eu converso com você.`;

export const PLATFORMS = Object.freeze(['TikTok', 'Instagram', 'X', 'Facebook', 'Snapchat', 'Outra']);
export const NEEDS = Object.freeze(['Mídia kit', 'Proposta para marcas', 'Página de links', 'Identidade', 'Roteiro', 'Edição', 'Landing page', 'Ainda não sei']);
export const DEADLINES = Object.freeze(['Sem pressa', 'Este mês', 'Urgente']);
export const UNSURE = 'Ainda não sei';
export const UNSURE_TEXT = 'ainda não sei, quero conversar';

export const GREETING = 'Oi, Smile! Vim pela página de criadores.';
export const QUESTION = 'Pode me contar como funciona?';
export const CLOSING = `— Tenho 18 anos ou mais e li o aviso de privacidade (versão ${NOTICE_VERSION}).`;
export const SUBJECT = 'Kit para marcas';
/* §8.5 · the no-JS e-mail template (also the "Prefere e-mail?" link of the final strip). */
export const NOJS_BODY = [GREETING, 'Meu perfil principal: @', 'Plataforma:', 'Quero ajuda com:', CLOSING].join('\n');
export const PREVIEW_PLACEHOLDER = 'seuperfil';

const HANDLE = /^[A-Za-z0-9._]+$/;
const URLISH = /^(?:https?:\/\/|www\.)|^[a-z0-9-]+(?:\.[a-z0-9-]+)+\//i;
const lower = value => String(value ?? '').trim().toLocaleLowerCase('pt-BR');

/** "@ana", " ana ", "https://site.example/@ana?x=1" and "site.example/ana/" all give "ana".
 * Inner spaces stay, so validation can explain them. */
export function normalizeHandle(raw) {
  let value = String(raw ?? '').trim();
  if (URLISH.test(value)) {
    try {
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      const last = url.pathname.split('/').filter(Boolean).at(-1) ?? '';
      try { value = decodeURIComponent(last); } catch { value = last; }
    } catch { /* not a URL after all: validate the text as typed */ }
  }
  return value.trim().replace(/^@+/, '');
}

/** '' when the @ is valid, otherwise the pt-BR message of SPEC 4.A. */
export function handleError(raw) {
  const handle = normalizeHandle(raw);
  if (!handle) return HANDLE_ERRORS.empty;
  if (!HANDLE.test(handle)) return HANDLE_ERRORS.chars;
  if (handle.length < 2 || handle.length > 30) return HANDLE_ERRORS.length;
  return '';
}

export const isValidHandle = raw => handleError(raw) === '';

/** Handle shown inside the live preview (C4): allowed characters only, never empty. */
export function previewHandle(raw) {
  const handle = normalizeHandle(raw).replace(/[^A-Za-z0-9._]/g, '').slice(0, 30);
  return handle || PREVIEW_PLACEHOLDER;
}

/** {itens}: lower case, commas and "e" before the last; "Ainda não sei" has its own text. */
export function itemsText(items = []) {
  const list = (Array.isArray(items) ? items : [items]).map(item => String(item ?? '').trim()).filter(Boolean);
  if (list.includes(UNSURE)) return UNSURE_TEXT;
  return joinList(list.map(lower));
}

/** Live summary (copy §8.1): lines and the number of choices (platform, needs, deadline). */
export function summarize({perfil = '', plataforma = '', preciso = [], prazo = ''} = {}) {
  const handle = normalizeHandle(perfil);
  const needs = Array.isArray(preciso) ? preciso.filter(Boolean) : [];
  const lines = [
    [handle && `@${handle}`, plataforma].filter(Boolean).join(' · '),
    needs.length ? `Preciso de: ${itemsText(needs)}` : '',
    prazo ? `Prazo: ${lower(prazo)}` : ''
  ].filter(Boolean);
  return {lines, count: (plataforma ? 1 : 0) + needs.length + (prazo ? 1 : 0)};
}

export const countLabel = n => (n === 1 ? '1 escolha' : `${n} escolhas`);

/** Message for handoff.buildHandoff(): optional lines (Prazo, Origem) drop out when empty. */
export function composeKit({perfil = '', plataforma = '', preciso = [], prazo = ''} = {}, {origin = ''} = {}) {
  const handle = normalizeHandle(perfil);
  return {
    lines: [
      GREETING,
      {label: 'Meu perfil principal', value: `@${handle} (${plataforma})`},
      {label: 'Quero ajuda com', value: itemsText(preciso)},
      {label: 'Prazo', value: lower(prazo)},
      {label: 'Origem', value: origin},
      QUESTION
    ],
    closing: [CLOSING],
    subject: `${SUBJECT} · @${handle}`
  };
}
