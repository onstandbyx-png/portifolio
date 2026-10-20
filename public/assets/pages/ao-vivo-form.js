/* /criadores/ao-vivo · "Montar meu diagnóstico" (SPEC 4.B, copy-ao-vivo.md §8).
 * Pure functions only (no DOM at import), so node:test can check the exact
 * message, the e-mail subject, the URL rule and the pt-BR errors. The page
 * entry (ao-vivo.js) wires them to builder.js and handoff.js.
 * Contact data never appears here: handoff.js reads PORTFOLIO_PROFILE. */
import {NOTICE_VERSION, joinList, refOrigin} from './handoff.js';

export const PAGE = 'ao-vivo';
export const GREETING = 'Oi, Smile! Vim pela página de criadores ao vivo.';
export const CONSENT_LINE = `— Tenho 18 anos ou mais e li o aviso de privacidade (versão ${NOTICE_VERSION}).`;
export const NICHE_MAX = 40;

/* Chip labels exactly as on the page (data-value) → text used in the message. */
export const FREQUENCIA = Object.freeze({
  '1 vez por semana': '1 vez por semana',
  '2 a 3 vezes por semana': '2 a 3 vezes por semana',
  '4 ou mais vezes por semana': '4 ou mais vezes por semana',
  'Sem agenda fixa': 'sem agenda fixa'
});
export const DURACAO = Object.freeze({
  'Até 1 h': 'até 1 h',
  'De 1 a 3 h': 'de 1 a 3 h',
  'De 3 a 6 h': 'de 3 a 6 h',
  'Mais de 6 h': 'mais de 6 h'
});
/* objetivo → [message text, short e-mail subject, summary support line]. */
export const OBJETIVO = Object.freeze({
  'Live com cara profissional': Object.freeze({message: 'live com cara profissional (identidade e overlay)', subject: 'identidade'}),
  'Crescer fora da live': Object.freeze({message: 'crescer fora da live (cortes e Shorts)', subject: 'cortes'}),
  'Fechar patrocínio': Object.freeze({message: 'fechar patrocínio (proposta e roteiro de publi)', subject: 'patrocínio'}),
  'Vender ao vivo': Object.freeze({message: 'vender ao vivo (roteiro e cenário)', subject: 'venda ao vivo'})
});
export const PLATAFORMAS = Object.freeze(['YouTube', 'Twitch', 'Kick', 'TikTok LIVE', 'Instagram Live', 'Kwai', 'Venda ao vivo (TikTok Shop, Shopee ou outra)', 'Outra']);
export const NICHOS = Object.freeze(['Games', 'Conversa (Just Chatting)', 'Música', 'Educação', 'Venda ao vivo', 'Esporte', 'IRL (vida real)', 'Outro']);
export const OTHER_NICHE = 'Outro';

/* copy-ao-vivo.md §8.2, verbatim. The guardian help needs the e-mail address,
 * so it is a function of the address read from PORTFOLIO_PROFILE. */
export const ERRORS = Object.freeze({
  plataformas: 'Escolha pelo menos uma plataforma.',
  frequencia: 'Escolha com que frequência você transmite.',
  duracao: 'Escolha a duração média das suas lives.',
  nicho: 'Escolha o seu nicho.',
  nichoOutroVazio: 'Escreva o seu nicho em poucas palavras.',
  nichoOutroLongo: 'Use até 40 caracteres.',
  objetivo: 'Escolha o que você quer resolver primeiro.',
  canal: 'Esse link não abre. Ele começa com https://?',
  maior: 'Confirme que você tem 18 anos ou mais.'
});
export const guardianHelp = email => `Por enquanto atendo só maiores de 18 anos. Live com menor de idade tem regras próprias. Se você é responsável por um criador menor, escreva para ${email} e eu converso com você.`;

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

/** Channel link (optional): http(s) only; without a scheme, https:// is added.
 * Returns {ok, url} where url is '' for an empty answer. */
export function normalizeChannelUrl(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return {ok: true, url: ''};
  if (/\s/.test(value)) return {ok: false, url: ''};
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value.replace(/^\/+/, '')}`;
  let url;
  try { url = new URL(candidate); } catch { return {ok: false, url: ''}; }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.hostname.startsWith('.') || url.hostname.endsWith('.') || url.username || url.password) return {ok: false, url: ''};
  return {ok: true, url: url.href};
}

/** The niche shown in the summary and the message: the chip, or the free text of "Outro". */
export function nicheText(values = {}) {
  if (values.nicho !== OTHER_NICHE) return clean(values.nicho);
  return clean(values.nichoOutro).slice(0, NICHE_MAX) || '';
}

/** One message per field, in DOM order; '' when the answer is valid. */
export function fieldErrors(values = {}, {email = ''} = {}) {
  const errors = {
    plataformas: (values.plataformas || []).length ? '' : ERRORS.plataformas,
    frequencia: values.frequencia ? '' : ERRORS.frequencia,
    duracao: values.duracao ? '' : ERRORS.duracao,
    nicho: values.nicho ? '' : ERRORS.nicho,
    nichoOutro: '',
    objetivo: values.objetivo ? '' : ERRORS.objetivo,
    canal: normalizeChannelUrl(values.canal).ok ? '' : ERRORS.canal,
    maior: values.maior ? '' : ERRORS.maior
  };
  if (values.nicho === OTHER_NICHE) {
    const text = clean(values.nichoOutro);
    errors.nichoOutro = !text ? ERRORS.nichoOutroVazio : text.length > NICHE_MAX ? ERRORS.nichoOutroLongo : '';
  }
  return {errors, help: errors.maior && email ? guardianHelp(email) : ''};
}

/** Live summary lines (copy §8.1 "Resumo ao vivo"). Empty answers drop out. */
export function summaryLines(values = {}) {
  const platforms = joinList(values.plataformas || []);
  const rhythm = [values.frequencia, values.duracao].map(clean).filter(Boolean).join(' · ');
  const niche = values.nicho === OTHER_NICHE ? (nicheText(values) || OTHER_NICHE) : clean(values.nicho);
  return [
    platforms && `Transmite em: ${platforms}`,
    rhythm,
    niche && `Nicho: ${niche}`,
    values.objetivo && `Primeiro: ${clean(values.objetivo)}`
  ].filter(Boolean);
}

/** {lines, closing, subject} for handoff.buildHandoff() (copy §8.4). */
export function composeDiagnostico(values = {}, search = globalThis.location?.search ?? '') {
  const objetivo = OBJETIVO[values.objetivo];
  const frequencia = FREQUENCIA[values.frequencia] ?? clean(values.frequencia).toLowerCase();
  const duracao = DURACAO[values.duracao] ?? clean(values.duracao).toLowerCase();
  const rhythm = frequencia && duracao ? `Frequência: ${frequencia} · Duração média: ${duracao}` : null;
  return {
    lines: [
      GREETING,
      {label: 'Transmito em', value: values.plataformas || []},
      rhythm,
      {label: 'Nicho', value: nicheText(values)},
      {label: 'Quero resolver primeiro', value: objetivo?.message ?? ''},
      {label: 'Canal', value: normalizeChannelUrl(values.canal).url},
      {label: 'Origem', value: refOrigin(search)}
    ],
    closing: [CONSENT_LINE],
    subject: `Diagnóstico de live · ${objetivo?.subject ?? ''}`.replace(/ · $/, '')
  };
}

/* No-JS e-mail model (copy §8.5): subject and body of the visible mailto. */
export const NOJS_SUBJECT = 'Diagnóstico de live';
export const NOJS_BODY = [GREETING, 'Transmito em:', 'Frequência:', 'Duração média:', 'Nicho:', 'Quero resolver primeiro:', CONSENT_LINE].join('\n');
