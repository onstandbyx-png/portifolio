/* /vagas · answers, validation rules and the prefilled message (SPEC 4.C,
 * copy-vagas.md §5). Pure functions: no DOM, no storage, no network, so the
 * same module runs in the browser and under node:test.
 * The message lists only what the form asks: never photo, age, birth date,
 * marital status, documents, phone, e-mail, salary or health (SPEC 4.C). */
import {NOTICE_VERSION} from './handoff.js';

export const STEP_COUNT = 5;
export const RETENTION_MONTHS = 12;
export const OTHER_AREA = 'Outra';
export const LIMITS = Object.freeze({areaOther: 40, highlight: 280, nameMin: 2, nameMax: 60});

/* V3 order (vagas.md §2.B): production capacity first, then the first fixed role. */
export const AREAS = Object.freeze([
  Object.freeze({value: 'Edição de vídeo', hint: 'video'}),
  Object.freeze({value: 'Design gráfico e identidade', hint: 'design'}),
  Object.freeze({value: 'Motion design', hint: 'video'}),
  Object.freeze({value: 'Design UI e web', hint: 'design'}),
  Object.freeze({value: 'Atendimento e produção', hint: 'general'}),
  Object.freeze({value: 'Social media e conteúdo', hint: 'general'}),
  Object.freeze({value: 'Desenvolvimento front-end', hint: 'frontend'}),
  Object.freeze({value: 'Redação e roteiro', hint: 'general'}),
  Object.freeze({value: 'Captação e videomaker', hint: 'video'}),
  Object.freeze({value: 'Tráfego pago', hint: 'general'}),
  Object.freeze({value: 'Comercial', hint: 'general'})
]);

/* Hint under "Link do portfólio", by area (copy §5, etapa 3). */
export const LINK_HINTS = Object.freeze({
  video: 'YouTube não listado, Vimeo ou Drive com acesso liberado.',
  design: 'Behance, Dribbble, site ou PDF com acesso liberado.',
  frontend: 'Site no ar ou GitHub.',
  general: 'Site, Drive ou PDF com acesso liberado.'
});

/* Radio label → text inside the message (copy §5, "Como preencher"). */
export const LEVELS = Object.freeze({
  'Estudante': 'estudante',
  'Começando (até 2 anos de prática)': 'começando (até 2 anos de prática)',
  'Já toco projetos sozinho(a)': 'já toco projetos sozinho(a)',
  'Lidero ou oriento outras pessoas': 'lidero ou oriento outras pessoas'
});
export const FORMATS = Object.freeze({
  'Por projeto (freela)': 'por projeto (freela)',
  'Meio período': 'meio período',
  'Período integral': 'período integral'
});
export const STARTS = Object.freeze({
  'Agora': 'agora',
  'Em até 30 dias': 'em até 30 dias',
  'Só quero ficar no radar': 'só quero ficar no radar'
});

export const ERRORS = Object.freeze({
  area: 'Escolha uma área para continuar.',
  areaOther: 'Escreva a área em poucas palavras.',
  areaOtherLong: 'Use até 40 caracteres.',
  level: 'Escolha a opção que mais combina com você.',
  link1Empty: 'Cole o link do seu portfólio.',
  linkBroken: 'Esse link não abre. Ele começa com https://?',
  linkScheme: 'Use um link que comece com https:// ou http://.',
  linkSame: 'Esse link é igual ao primeiro.',
  format: 'Escolha como você pode trabalhar.',
  start: 'Escolha quando você poderia começar.',
  name: 'Diga como quer ser chamado(a).',
  nameLong: 'Use até 60 caracteres.',
  adult: 'Confirme que você tem 18 anos ou mais.',
  adultHelp: 'Por enquanto, o banco é só para maiores de 18 anos.',
  consent: 'Para entrar no banco, marque a autorização. Sem ela, eu não posso guardar seus dados.'
});
export const highlightError = count => `Use até 280 caracteres. Agora são ${count}.`;

export const GREETING = 'Olá, Smile! Quero entrar no banco de talentos.';
export const CONSENT_LINE = `— Tenho 18 anos ou mais. Li o aviso de privacidade (versão ${NOTICE_VERSION}) e autorizo guardar estes dados no banco de talentos por até ${RETENTION_MONTHS} meses para contato sobre oportunidades. Posso pedir a exclusão quando quiser.`;
export const SIGNATURE = '(enviado pela página /vagas)';
export const SUBJECT_PREFIX = 'Banco de talentos';

/* Without JavaScript (copy §5, "Sem JavaScript"): subject and template body. */
export const NOJS_SUBJECT = 'Banco de talentos';
export const NOJS_BODY = [GREETING, 'Nome:', 'Área:', 'Experiência:', 'Portfólio:', 'Disponibilidade:', CONSENT_LINE].join('\n');

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const lowerFirst = value => value ? value.charAt(0).toLocaleLowerCase('pt-BR') + value.slice(1) : '';

export function linkHint(area) {
  const match = AREAS.find(item => item.value === area);
  return LINK_HINTS[match?.hint || 'general'];
}

/* A scheme is a word before ":" without a dot ("https:", "ftp:", "javascript:");
 * "vimeo.com:443/x" is a host with a port. Links without a scheme get https://. */
const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/** {status: 'empty'|'ok'|'broken'|'scheme', url, key}. `url` keeps the visitor's
 * text (plus https:// when the scheme is missing); `key` compares two links. */
export function normalizeLink(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return {status: 'empty', url: '', key: ''};
  if (/\s/.test(value)) return {status: 'broken', url: '', key: ''};
  const scheme = value.match(SCHEME);
  const explicit = Boolean(scheme && !scheme[1].includes('.'));
  if (explicit && !/^https?$/i.test(scheme[1])) return {status: 'scheme', url: '', key: ''};
  const url = explicit ? value : `https://${value}`;
  let parsed;
  try { parsed = new URL(url); } catch { return {status: 'broken', url: '', key: ''}; }
  const host = parsed.hostname;
  const labels = host.split('.');
  if (!/^https?:$/.test(parsed.protocol) || labels.length < 2 || labels.some(label => !label) || parsed.username || parsed.password)
    return {status: 'broken', url: '', key: ''};
  const key = `${host}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname.replace(/\/+$/, '')}${parsed.search}${parsed.hash}`.toLowerCase();
  return {status: 'ok', url, key};
}

/* ---------- validation rules (one function per field; '' means valid) ---------- */

export function checkArea(values) { return values.area ? '' : ERRORS.area; }
export function checkAreaOther(values) {
  if (values.area !== OTHER_AREA) return '';
  const text = clean(values.areaOutra);
  if (!text) return ERRORS.areaOther;
  return text.length > LIMITS.areaOther ? ERRORS.areaOtherLong : '';
}
export function checkLevel(values) { return values.nivel ? '' : ERRORS.level; }
export function checkLink1(values) {
  const link = normalizeLink(values.link1);
  if (link.status === 'empty') return ERRORS.link1Empty;
  if (link.status === 'scheme') return ERRORS.linkScheme;
  return link.status === 'ok' ? '' : ERRORS.linkBroken;
}
export function checkLink2(values) {
  const link = normalizeLink(values.link2);
  if (link.status === 'empty') return '';
  if (link.status === 'scheme') return ERRORS.linkScheme;
  if (link.status !== 'ok') return ERRORS.linkBroken;
  const first = normalizeLink(values.link1);
  return first.status === 'ok' && first.key === link.key ? ERRORS.linkSame : '';
}
/** `raw` is the untrimmed textarea value: maxlength counts it the same way. */
export function checkHighlight(values, raw = values.destaque) {
  const count = String(raw ?? '').length;
  return count > LIMITS.highlight ? highlightError(count) : '';
}
export function checkFormat(values) { return values.formato ? '' : ERRORS.format; }
export function checkStart(values) { return values.inicio ? '' : ERRORS.start; }
export function checkName(values) {
  const name = clean(values.nome);
  if (name.length < LIMITS.nameMin) return ERRORS.name;
  return name.length > LIMITS.nameMax ? ERRORS.nameLong : '';
}
export function checkAdult(values) { return values.maior ? '' : {message: ERRORS.adult, help: ERRORS.adultHelp}; }
export function checkConsent(values) { return values.consentimento ? '' : ERRORS.consent; }

/** Area text for the message: the radio label, or the free text of "Outra". */
export const areaText = values => (values.area === OTHER_AREA ? clean(values.areaOutra) : clean(values.area));

/** {lines, closing, subject} for handoff.buildHandoff(). Empty optional lines drop out;
 * the consent line and the page signature are always kept. */
export function composeVagas(values = {}) {
  const area = areaText(values);
  const name = clean(values.nome);
  const level = LEVELS[values.nivel] ?? lowerFirst(clean(values.nivel));
  const format = FORMATS[values.formato] ?? lowerFirst(clean(values.formato));
  const start = STARTS[values.inicio] ?? lowerFirst(clean(values.inicio));
  const availability = format && start ? `${format} · início: ${start}` : format || (start ? `início: ${start}` : '');
  return {
    lines: [
      GREETING,
      {label: 'Nome', value: name},
      {label: 'Área', value: area},
      {label: 'Experiência', value: level},
      {label: 'Portfólio', value: normalizeLink(values.link1).url},
      {label: 'Outro link', value: normalizeLink(values.link2).url},
      {label: 'Para ver primeiro', value: values.destaque},
      {label: 'Disponibilidade', value: availability}
    ],
    closing: [CONSENT_LINE, SIGNATURE],
    subject: [SUBJECT_PREFIX, area, name].filter(Boolean).join(' · ')
  };
}
