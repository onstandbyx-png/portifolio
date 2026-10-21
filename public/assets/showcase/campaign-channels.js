/** "Sua oferta. Em cada canal.": eleven channels, sixteen placements, each one
 * advertising a fictitious CLIENT brand of one of the main client types the
 * portfolio serves (restaurant, dental clinic, developer, tech store, travel
 * agency, language school, wealth manager, car dealer). Every placement is a
 * finite storyboard inside the same orange iPhone 17 Pro Max: hook, retention
 * beat, the tap on the native CTA and the native conversion screen.
 * Rules: brands are fictitious and every example says so outside the phone;
 * no real company, person or celebrity; no metrics, results, ratings, review
 * counts, testimonials or prices; ads identified the way each platform does in
 * pt-BR. Platform logos are only the official files of channel-logos.js, used
 * where the app itself shows the mark; every other interface glyph is generic.
 *
 * Data shape of a placement:
 *   {id, label, mock, cliente, selo, frase, aria,
 *    passos:[{fase, rotulo, quadros:[frame indexes]}],   always 3: Atenção, Retenção, Conversão
 *    quadros:[{ms, cena, estado?, toque?, video?, desc}]}
 * A mock is a .cm-screen with .cm-scene children (data-scene, data-kind =
 * base | push | sheet | fade, data-tema = claro | escuro). The player sets on the
 * screen data-frame, data-scene, data-state (space separated tokens) and
 * data-tap; CSS draws each state. [data-hs~="n"] marks the element the numbered
 * point of step n sits on; [data-tap="key"] is the element a frame taps.
 */
import { logoSvg } from './channel-logos.js';

const A = '/assets/portfolio/';
export const IMG = {
  escola45: { src: A + 'canais/escola-fones-caderno-4x5.webp', w: 960, h: 1200 },
  escola916: { src: A + 'canais/escola-fones-caderno-9x16.webp', w: 675, h: 1200 },
  panela916: { src: A + 'canais/restaurante-feijoada-panela-9x16.webp', w: 675, h: 1200 },
  prato916: { src: A + 'canais/restaurante-feijoada-prato-9x16.webp', w: 675, h: 1200 },
  panela11: { src: A + 'canais/restaurante-feijoada-panela-1x1.webp', w: 900, h: 900 },
  prato11: { src: A + 'canais/restaurante-feijoada-prato-1x1.webp', w: 900, h: 900 },
  escondidinho11: { src: A + 'canais/restaurante-escondidinho-1x1.webp', w: 900, h: 900 },
  pudim11: { src: A + 'canais/restaurante-pudim-1x1.webp', w: 900, h: 900 },
  fachada45: { src: A + 'canais/restaurante-fachada-4x5.webp', w: 960, h: 1200 },
  fachada43: { src: A + 'canais/restaurante-fachada-4x3.webp', w: 1140, h: 855 },
  consultorio45: { src: A + 'canais/clinica-consultorio-4x5.webp', w: 960, h: 1200 },
  recepcao45: { src: A + 'canais/clinica-recepcao-4x5.webp', w: 960, h: 1200 },
  salaMar11: { src: A + 'canais/incorporadora-sala-mar-1x1.webp', w: 620, h: 620 },
  salaMar45: { src: A + 'canais/incorporadora-sala-mar-4x5.webp', w: 700, h: 875 },
  mapa: { src: A + 'canais/mapa-cidade.svg', w: 360, h: 640 },
  crencas: { src: A + 'canais/campanha-crencas.webp', w: 720, h: 1273 },
  esportes: { src: A + 'canais/campanha-esportes.webp', w: 720, h: 1273 },
  negocios: { src: A + 'canais/campanha-negocios-sem-grafico.webp', w: 720, h: 913 },
  nerd: { src: A + 'campanha-nerd.webp', w: 720, h: 1273 },
  coast: { src: A + 'smiile-architecture-coast.webp', w: 1400, h: 933 },
};

/* Fictitious advertisers, one per client type. Names checked on 21/10/2026
   (clientes.md, 2.2); every mark is a simple shape drawn for this section,
   except Arrimo, the glyph of the Fatos studio logo (LogosFicticios.tsx). */
export const CLIENTES = {
  restaurante: { tipo: 'restaurante', marca: 'Tacho Miúdo', arroba: 'tachomiudo', dominio: 'tachomiudo.exemplo', cor: '#a4462a' },
  clinica: { tipo: 'clínica odontológica', marca: 'Seixo Odontologia', arroba: 'seixoodontologia', dominio: 'seixo.exemplo', cor: '#2f6f73' },
  incorporadora: { tipo: 'incorporadora', marca: 'Morada Falésia', arroba: 'moradafalesia', dominio: 'moradafalesia.exemplo', cor: '#1f4e5f' },
  varejo: { tipo: 'loja de tecnologia', marca: 'Teclaria', arroba: 'teclaria', dominio: 'teclaria.exemplo', cor: '#5b3df5' },
  turismo: { tipo: 'agência de viagens', marca: 'Bandeirola Viagens', arroba: 'bandeirola', dominio: 'bandeirola.exemplo', cor: '#d9822b' },
  educacao: { tipo: 'escola de idiomas', marca: 'Sotaque Livre Idiomas', curta: 'Sotaque Livre', arroba: 'sotaquelivre', dominio: 'sotaquelivre.exemplo', cor: '#e5533d' },
  financas: { tipo: 'gestora de patrimônio', marca: 'Arrimo Patrimônio', arroba: 'arrimo', dominio: 'arrimo.exemplo', cor: '#0f1a2c' },
  automotivo: { tipo: 'concessionária', marca: 'Ondara Elétricos', arroba: 'ondara', dominio: 'ondara.exemplo', cor: '#0f6b5c' },
};
const MARCAS = {
  restaurante: '<svg viewBox="0 0 100 100"><text x="50" y="63" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="40" letter-spacing="-2" fill="#fff">tm</text></svg>',
  clinica: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="52" rx="27" ry="18" transform="rotate(-14 50 52)" fill="#fff"/></svg>',
  incorporadora: '<svg viewBox="0 0 100 100"><path d="M16 64h22l11-22h35" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M18 76c8-5 14-5 22 0s14 5 22 0 14-5 22 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/></svg>',
  varejo: '<svg viewBox="0 0 100 100"><rect x="25" y="29" width="50" height="42" rx="9" fill="none" stroke="#fff" stroke-width="6.5"/><path d="M39 57h22" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>',
  turismo: '<svg viewBox="0 0 100 100"><path d="M14 33q36 16 72 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M24 38l9 25 9-21zM45 43l7 25 9-25zM66 41l7 22 10-25z" fill="#fff"/></svg>',
  educacao: '<svg viewBox="0 0 100 100"><path d="M29 28h42a9 9 0 0 1 9 9v21a9 9 0 0 1-9 9H49l-15 12V67h-5a9 9 0 0 1-9-9V37a9 9 0 0 1 9-9z" fill="#fff"/></svg>',
  financas: '<svg viewBox="24 12 52 50"><path d="M50 19 31 50h7.5L50 30.5 61.5 50H69z" fill="#d8b866"/><path d="M41 44h18" stroke="#d8b866" stroke-width="3.2"/><path d="M33 53.5h34" stroke="#d8b866" stroke-width="1.6"/></svg>',
  automotivo: '<svg viewBox="0 0 100 100"><path d="M17 60c10-17 22-18 32-6s22 11 34-12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg>',
};
/* A fictitious brand mark: circle (avatars), square (company page, app icon) or pin. */
export const marca = (key, forma = 'circulo', cls = '') => `<span class="cm-mark cm-mark--${forma}${cls ? ' ' + cls : ''}" style="--c:${CLIENTES[key].cor}" aria-hidden="true">${MARCAS[key]}</span>`;
export const clienteChip = key => `Exemplo: ${CLIENTES[key].tipo}, marca fictícia`;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Generic interface glyphs (24 x 24, stroked). None of them is a platform logo. */
const PATHS = {
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  comment: 'M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.3-4A8 8 0 1 1 20 11.5z',
  send: 'M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z',
  repost: 'M4 10V8.5A2.5 2.5 0 0 1 6.5 6H18l-3-3M20 14v1.5a2.5 2.5 0 0 1-2.5 2.5H6l3 3',
  bookmark: 'M6.5 3.5h11v17l-5.5-4-5.5 4z',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  vdots: 'M12 5h.01M12 12h.01M12 19h.01',
  chevron: 'm9 6 6 6-6 6',
  up: 'm6 15 6-6 6 6',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6 6 18',
  search: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.5-4.5',
  plus: 'M12 5v14M5 12h14',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z',
  thumb: 'M7 10.5V20H4v-9.5zM7 10.5 11 3a2 2 0 0 1 3 1.9L13.3 9H19a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 17.7 20H7',
  share: 'M12 15V3.5M7.5 8 12 3.5 16.5 8M5 13v7h14v-7',
  forward: 'M14 5l7 6.5-7 6.5v-3.8c-5.6 0-8.7 1.8-11 5.3.9-6 4.4-10 11-10.8z',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  regen: 'M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5',
  speaker: 'M4 9.5h4l5-4v13l-5-4H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM6 11a6 6 0 0 0 12 0M12 17v4',
  wave: 'M5 10v4M9 7v10M13 5v14M17 8v8M21 11v2',
  camera: 'M4 8h3.5l2-3h5l2 3H20v11H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z',
  lens: 'M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9M20 15v2.5a2.5 2.5 0 0 1-2.5 2.5H15M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  skip: 'M6 5.5 15 12l-9 6.5zM18 5.5v13',
  menu2: 'M4.5 9h15M4.5 15h10',
  menu: 'M4 7h16M4 12h16M4 17h16',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  lock: 'M7.5 11V8a4.5 4.5 0 0 1 9 0v3M6 11h12v9H6z',
  ticks: 'M2.5 12.5 6 16l7.5-8.5M10 15.5l.5.5L18 7.5',
  check: 'M5 12.5 10 17.5 19 7',
  pin: 'M15 4.5 19.5 9l-3 1.5-3 3 .5 4.5-2 2-3.5-3.5L4 20M10.5 8.5l2-2L15 4.5',
  phone: 'M7 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5 5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5 5.7 2 2 0 0 1 7 3.5z',
  video: 'M3.5 7h11.5v10H3.5zM15 10.5l5.5-3v9l-5.5-3z',
  home: 'M3.5 10.5 12 3.5l8.5 7V20.5h-6v-6h-5v6h-6z',
  reels: 'M7 3.5h10A3.5 3.5 0 0 1 20.5 7v10a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5zM10 8.5l5.5 3.5-5.5 3.5z',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.2 3.2 0 0 1 0 6.3M18 14.8c1.9.6 3.2 2.4 3.5 5.2',
  bell: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 21h4',
  briefcase: 'M3.5 8h17v11.5h-17zM8.5 8V5.5h7V8M3.5 13h17',
  subs: 'M4 9h16v11H4zM6 6h12M8 3h8M10.5 12v5l4-2.5z',
  store: 'M4.5 9.5 6 4.5h12l1.5 5M4.5 9.5h15M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M6 12.5V20h12v-7.5M10 20v-4.5h4V20',
  tv: 'M3.5 7.5h17v12h-17zM8.5 3.5l3.5 4 3.5-4',
  music: 'M9 18V5.5l10-2V16M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  remix: 'M4 8h12l-3-3M20 16H8l3 3',
  car: 'M5 16.5V12l2-5h10l2 5v4.5zM5 16.5v2h2.5v-2M16.5 16.5v2H19v-2M8 13.5h.01M16 13.5h.01M5 12h14',
  bus: 'M6 4h12v12H6zM6 11h12M8.5 16v3M15.5 16v3M9 13.5h.01M15 13.5h.01',
  walk: 'M13.5 5.5a1.5 1.5 0 1 0 0-.01M11.5 8.5 9 13l3 2v5M11.5 8.5l3 3 3 .5M11.5 8.5 8.5 21',
  fork: 'M7 3v7M5 3v4.5a2 2 0 0 0 4 0V3M7 10v11M16.5 3c-1.7 1.4-2.5 3.6-2.5 6.5V13h2.5M16.5 3v18',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.8h.01',
  tag: 'M3.5 12.5V4h8.5l8.5 8.5-8.5 8.5zM8 8h.01',
  sticker: 'M12 21a9 9 0 1 1 9-9c0 5-4 9-9 9zM8.5 14.5c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  doc: 'M6 3.5h8l4 4V20.5H6zM14 3.5v4h4',
  unlock: 'M7.5 11V8a4.5 4.5 0 0 1 8.7-1.6M6 11h12v9H6z',
  cart: 'M3.5 4.5h2.5l2.2 10.5h9.6l2-7.5H7M10 19.5h.01M17 19.5h.01',
  route: 'M12 2.8 21.2 12 12 21.2 2.8 12zM9 14v-3h5.5M12.5 8.5l2.5 2.5-2.5 2.5',
  disc: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6',
  location: 'M12 21.5s6.5-6 6.5-11.5a6.5 6.5 0 1 0-13 0c0 5.5 6.5 11.5 6.5 11.5zM12 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z',
};
const I = (name, cls = '') => `<svg class="cm-i cm-i--${name}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>`;
/* Every picture is lazy and sized; alt text only on the first view of a scene (the stage carries the description). */
const pic = (key, { alt = '', cls = '', pos = '' } = {}) => {
  const im = IMG[key];
  return `<img class="${cls}" src="${im.src}" alt="${esc(alt)}" width="${im.w}" height="${im.h}" loading="lazy" decoding="async"${pos ? ` style="object-position:${pos}"` : ''}>`;
};
const scene = (id, kind, tema, html, cls = '', gestos = '') => `<div class="cm-scene${cls ? ' ' + cls : ''}" data-scene="${id}" data-kind="${kind}" data-tema="${tema}"${gestos ? ` data-gestos="${gestos}"` : ''}>${html}</div>`;
const screen = (key, html) => `<div class="cm-screen cm-${key}" data-frame="0">${html}</div>`;
const skel = (rows, cls = '') => `<span class="cm-skel${cls ? ' ' + cls : ''}" aria-hidden="true">${Array.from({ length: rows }, (_, i) => `<i style="--w:${[92, 74, 84, 58, 88][i % 5]}%"></i>`).join('')}</span>`;
/* Page parts shared by the advertisers' landing pages. */
const chips = (label, options, on, cls = '') => `<div class="cm-field${cls ? ' ' + cls : ''}"><small>${esc(label)}</small><span class="cm-chips">${options.map((o, i) => `<span class="cm-chip${i === on ? ' is-on' : ''}">${i === on ? I('check') : ''}${esc(o)}</span>`).join('')}</span></div>`;
const input = (label, value) => `<div class="cm-input"><small>${esc(label)}</small><span>${esc(value)}</span></div>`;
const btn = (text, tap, hs = '3', cls = '') => `<span class="cm-btn${cls ? ' ' + cls : ''}"${tap ? ` data-tap="${tap}"` : ''}${hs ? ` data-hs="${hs}"` : ''}>${esc(text)}</span>`;
const done = (title, text, extra = '') => `<div class="cm-done" data-hs="3"><span class="cm-done-check">${I('check')}</span><b>${esc(title)}</b><p>${esc(text)}</p>${extra}</div>`;
/* In-app browser of Instagram, TikTok and ChatGPT: close, page title over the domain, more. */
const browserBar = (title, domain, right = 'dots') => `<div class="cm-browser"><span class="cm-browser-x">${I('close')}</span><span class="cm-browser-title"><b>${esc(title)}</b><small>${I('lock')}${esc(domain)}</small></span><span class="cm-browser-x">${I(right)}</span></div>`;
/* Safari in the iOS 26 compact layout, floating at the bottom of a web page. */
const safari = domain => `<div class="cm-safari" aria-hidden="true"><span class="cm-safari-btn">${I('back')}</span><span class="cm-safari-url">${esc(domain)}</span><span class="cm-safari-btn">${I('dots')}</span></div>`;
const tabbar = (items, cls = '') => `<div class="cm-tabbar${cls ? ' ' + cls : ''}" aria-hidden="true">${items.map(([icon, label, on]) => `<span${on ? ' class="is-on"' : ''}>${icon === 'me' ? '<i class="cm-tab-me"></i>' : icon === 'create' ? `<i class="cm-tab-create">${I('plus')}</i>` : I(icon)}${label ? `<small>${esc(label)}</small>` : ''}</span>`).join('')}</div>`;
const TABS = {
  instagram: [['home', '', 1], ['reels'], ['send'], ['search'], ['me']],
  reels: [['home'], ['reels', '', 1], ['send'], ['search'], ['me']],
  facebook: [['home', 'Início', 1], ['reels', 'Vídeo'], ['people', 'Amigos'], ['store', 'Marketplace'], ['bell', 'Notificações'], ['me', 'Menu']],
  linkedin: [['home', 'Início', 1], ['people', 'Minha rede'], ['plus', 'Publicar'], ['bell', 'Notificações'], ['briefcase', 'Vagas']],
  tiktok: [['home', 'Início', 1], ['people', 'Amigos'], ['create'], ['comment', 'Caixa de entrada'], ['me', 'Perfil']],
  youtube: [['home', 'Início'], ['reels', 'Shorts', 1], ['create'], ['subs', 'Inscrições'], ['me', 'Você']],
};
/* Instagram post header and the CTA bar under the media ("Patrocinado" in the second line). */
const igHead = key => `<header class="cm-ig-head">${marca(key)}<span><b>${CLIENTES[key].arroba}</b><small>Patrocinado</small></span>${I('dots')}</header>`;
const igBar = `<div class="cm-ig-bar">${I('plus')}<b class="cm-ig-name">Instagram</b>${I('heart')}</div>`;
const igActions = (middle = '') => `<div class="cm-ig-actions">${I('heart')}${I('comment')}${I('repost')}${I('send')}<span class="cm-ig-mid">${middle}</span>${I('bookmark')}</div>`;
/* A landing page of the advertiser: hero, title, choices and one primary button. */
const landing = ({ key, hero = '', title, sub = '', body = '', button, tap = 'go', confirm }) => `<div class="cm-lp" style="--brand:${CLIENTES[key].cor}">${hero}<div class="cm-lp-body"><span class="cm-lp-brand">${marca(key)}<b>${esc(CLIENTES[key].marca)}</b></span><b class="cm-lp-title">${esc(title)}</b>${sub ? `<p class="cm-lp-sub">${esc(sub)}</p>` : ''}${body}${btn(button, tap)}</div>${confirm || ''}</div>`;

/* Floor plan of the incorporadora (3 or 4 bedrooms), an original line drawing. */
const planta = cls => `<svg class="cm-planta${cls ? ' ' + cls : ''}" viewBox="0 0 200 150" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="6" width="188" height="138" rx="2"/><path d="M6 78h86M92 6v138M92 60h102M150 60v84"/><path class="cm-planta-4" d="M150 6v54M6 112h86"/></g><g fill="currentColor" font-family="Inter,Arial,sans-serif" font-size="10"><text x="22" y="44">Sala</text><text x="104" y="38">Varanda</text><text x="104" y="108">Quarto</text><text x="158" y="108">Suíte</text><text x="22" y="104">Cozinha</text></g></svg>`;

const mocks = {
  /* 2.1 Instagram feed: carousel of a language school, CTA bar that lights up, Instagram browser. */
  igFeed: () => screen('ig', scene('ad', 'base', 'claro', `<div class="cm-safe">${igBar}<article class="cm-ig-post">${igHead('educacao')}
    <div class="cm-ig-media cm-carousel"><div class="cm-track">
      <figure class="cm-card cm-card--photo">${pic('escola45', { alt: 'Fone de ouvido sobre a mesa, com a pergunta Você entende a série sem legenda?' })}<figcaption><b data-hs="1">Você entende a série sem legenda?</b></figcaption></figure>
      <figure class="cm-card cm-card--coral"><small>Três expressões</small><b>Que a legenda traduz errado</b><ol><li>It's up to you</li><li>I'm looking forward to it</li><li>Break a leg</li></ol></figure>
      <figure class="cm-card cm-card--cream"><b>I'm looking forward to it.</b>${I('arrow')}<b class="cm-card-pt">Mal posso esperar.</b><small>Aula experimental com horário marcado</small></figure>
    </div><span class="cm-count"><i>1</i><i>2</i><i>3</i>/3</span></div>
    <div class="cm-ig-cta" data-tap="cta" data-hs="3"><b>Inscrever-se agora</b>${I('chevron')}</div>
    ${igActions('<span class="cm-pager" data-hs="2"><i></i><i></i><i></i></span>')}
    <p class="cm-ig-caption"><b>sotaquelivre</b> Aula experimental com horário marcado. Escolha o nível e o horário no link. <span>mais</span></p></article></div>${tabbar(TABS.instagram)}`) +
    scene('page', 'sheet', 'claro', `${browserBar('Aula experimental', 'sotaquelivre.exemplo')}${landing({ key: 'educacao', title: 'Aula experimental', sub: 'Escolha o nível e o horário da sua aula.', body: chips('Qual é o seu nível?', ['Começando', 'Intermediário', 'Avançado'], 1) + chips('Escolha um horário', ['Ter 19h', 'Qui 19h', 'Sáb 10h'], 1), button: 'Agendar aula experimental', confirm: done('Aula experimental agendada', 'Quinta, 19h. O link da aula chega por e-mail.', btn('Adicionar ao calendário', '', '', 'cm-btn--ghost')) })}`)),

  /* 2.3 Instagram Story: a language school, the sticker that holds the tap, then the course page. */
  igstory: () => screen('igstory', scene('story', 'base', 'escuro', `<div class="cm-st">
      ${pic('escola916', { alt: 'Fone de ouvido sobre o caderno de anotações, em luz de fim de tarde.' })}
      <div class="cm-st-bars" aria-hidden="true"><i class="is-on"></i><i></i></div>
      <div class="cm-st-top">${marca('educacao')}<span><b>sotaquelivre</b><small>Patrocinado</small></span>${I('dots')}${I('close')}</div>
      <p class="cm-st-text" data-hs="1">Você entende a série sem legenda?</p>
      <div class="cm-st-cta"><span class="cm-st-sticker" data-tap="cta" data-hs="3">${I('arrow')}<b>Agendar aula</b></span></div>
    </div>`) + scene('page', 'sheet', 'claro', `${browserBar('Aula experimental', 'sotaquelivre.exemplo')}${landing({ key: 'educacao', title: 'Aula experimental', sub: 'Escolha o nível e o horário da sua aula.', body: chips('Qual é o seu nível?', ['Começando', 'Intermediário', 'Avançado'], 1), button: 'Agendar aula experimental', confirm: done('Aula experimental agendada', 'Quinta, 19h. O link da aula chega por e-mail.') })}`)),

  /* 2.4 Instagram Live: a restaurant cooking live with the paid label, comments and the menu sheet. */
  iglive: () => screen('iglive', scene('live', 'base', 'escuro', `<div class="cm-lv">
      ${pic('panela916', { alt: 'Tacho de feijoada no fogão, com a concha erguendo a linguiça.' })}
      <span class="cm-lv-badge">Ao vivo</span>
      <div class="cm-lv-top">${marca('restaurante')}<span><b>tachomiudo</b><small>Patrocinado</small></span>${I('close')}</div>
      <p class="cm-lv-comment" data-hs="1"><b>cliente_12</b> Qual o horário do almoço?</p>
      <p class="cm-lv-comment"><b>tachomiudo</b> Sábado, feijoada no tacho a partir das 12h.</p>
      <div class="cm-lv-cta" data-tap="cta" data-hs="3"><b>Ver cardápio</b>${I('chevron')}</div>
    </div>`) + scene('page', 'sheet', 'claro', `${browserBar('Cardápio de sábado', 'tachomiudo.exemplo')}${landing({ key: 'restaurante', title: 'Cardápio de sábado', sub: 'Feijoada no tacho, com mesa para o almoço.', body: chips('Quantas pessoas?', ['2', '4', '6'], 0), button: 'Reservar mesa', confirm: done('Pedido de reserva enviado', 'O restaurante confirma pelo WhatsApp.') })}`)),

  /* 2.5 Instagram Explorar: a grid of photos with one sponsored post that opens full screen, then the booking page. */
  igexplore: () => screen('igexplore', scene('grid', 'base', 'claro', `<div class="cm-xp">
      <div class="cm-xp-bar">${I('search')}<span>Pesquisar</span></div>
      <div class="cm-xp-grid">
        ${pic('prato11', { alt: '' })}${pic('pudim11', { alt: '' })}${pic('panela11', { alt: '' })}
        ${pic('recepcao45', { alt: '' })}<span class="cm-xp-ad" data-tap="ad" data-hs="1">${pic('consultorio45', { alt: 'Consultório odontológico com cadeira e luz natural, publicação patrocinada.' })}<em>Patrocinado</em></span>${pic('escondidinho11', { alt: '' })}
        ${pic('salaMar11', { alt: '' })}${pic('fachada45', { alt: '' })}${pic('pudim11', { alt: '' })}
      </div></div>
    <div class="cm-tabbar-wrap">${tabbar(TABS.instagram)}</div>`) + scene('post', 'sheet', 'claro', `<article class="cm-post-full">${igHead('clinica')}${pic('consultorio45', { alt: 'Consultório odontológico com cadeira e luz natural.' })}<div class="cm-ig-cta" data-tap="cta" data-hs="3"><b>Agendar avaliação</b>${I('chevron')}</div><p class="cm-ig-caption"><b>seixoodontologia</b> Avaliação com dentista, horário marcado. <span>mais</span></p></article>`) + scene('page', 'sheet', 'claro', `${browserBar('Agendar avaliação', 'seixo.exemplo')}${landing({ key: 'clinica', title: 'Agendar avaliação', sub: 'Escolha o dia e o horário.', body: chips('Dia', ['Seg', 'Ter', 'Qua'], 1) + chips('Horário', ['9h', '14h', '17h'], 0), button: 'Confirmar horário', confirm: done('Avaliação agendada', 'Você recebe a confirmação por mensagem.') })}`)),

  /* 2.2 Instagram Reels: a restaurant, two cuts, Instagram browser with the menu and the table booking sheet. */
  igReels: () => screen('reels', scene('video', 'base', 'escuro', `<div class="cm-shots">
      <figure class="cm-shot" data-shot="1">${pic('panela916', { alt: 'Tacho de feijoada com a concha erguendo linguiça.' })}<p class="cm-ontext" data-hs="1">Sábado tem feijoada no tacho.</p></figure>
      <figure class="cm-shot" data-shot="2">${pic('prato916')}<p class="cm-ontext">Fogo baixo desde cedo.</p></figure></div>
    <span class="cm-shade"></span>
    <div class="cm-reels-top">${I('plus')}<span><b>Reels</b><span>Amigos</span></span><i></i></div>
    <div class="cm-rail">${I('heart')}${I('comment')}${I('repost')}${I('send')}${I('dots')}<span class="cm-cover" style="background-image:url(${IMG.panela11.src})"></span></div>
    <div class="cm-vmeta"><span class="cm-who">${marca('restaurante')}<b>tachomiudo</b><span class="cm-follow">Seguir</span></span><small>Patrocinado</small><p>Feijoada no tacho aos sábados. Mesa para o almoço. <span>mais</span></p><small class="cm-audio">${I('music')}Áudio original</small></div>
    <div class="cm-vcta" data-tap="cta" data-hs="3"><b>Ver cardápio</b>${I('chevron')}</div>
    <div class="cm-vprogress" data-hs="2"><i data-cx-progress></i></div>${tabbar(TABS.reels, 'cm-tabbar--dark')}`) +
    scene('page', 'sheet', 'claro', `${browserBar('Cardápio de sábado', 'tachomiudo.exemplo')}<div class="cm-lp" style="--brand:${CLIENTES.restaurante.cor}"><div class="cm-lp-body"><span class="cm-lp-brand">${marca('restaurante')}<b>Tacho Miúdo</b></span><b class="cm-lp-title">Cardápio de sábado</b>
      <ul class="cm-menu"><li>${pic('panela11')}<span><b>Feijoada no tacho</b><small>Carnes separadas, arroz, couve e farofa.</small></span></li><li>${pic('escondidinho11')}<span><b>Escondidinho de carne-seca</b><small>Gratinado na panelinha.</small></span></li><li>${pic('pudim11')}<span><b>Pudim de leite</b><small>Feito na casa.</small></span></li></ul>
      ${btn('Reservar mesa', 'go')}</div></div>`) +
    scene('reserva', 'sheet', 'claro', `<div class="cm-sheet cm-sheet--part" style="--brand:${CLIENTES.restaurante.cor}"><span class="cm-grabber"></span><b class="cm-lp-title">Reservar mesa</b>${chips('Pessoas', ['2', '4', '6'], 0)}${chips('Horário', ['12h', '13h', '14h'], 1)}${btn('Pedir reserva', 'send')}${done('Pedido de reserva enviado', 'O restaurante confirma pelo WhatsApp.')}</div>`, 'cm-scene--part')),

  /* 2.3 Facebook feed: lead ad carousel of a developer and the Meta instant form. */
  /* 3.2 Facebook feed post: one photo of a development, the link bar that holds the tap, then the visit page. */
  fbpost: () => screen('fbpost', scene('post', 'base', 'claro', `<article class="cm-fbpost">
      <header class="cm-fbpost-head">${marca('incorporadora')}<span><b>Morada Falésia</b><small>Patrocinado · ${I('globe', 'cm-i--inline')}</small></span>${I('dots')}${I('close')}</header>
      <p class="cm-fbpost-text">Casas na falésia com a sala voltada para o mar. Agende uma visita ao decorado.</p>
      ${pic('salaMar45', { alt: 'Sala de estar com janela para o mar, em luz de fim de tarde.', cls: 'cm-fbpost-photo' })}
      <div class="cm-fbpost-cta" data-hs="3"><span><b>moradafalesia.exemplo</b><small>Visita ao decorado</small></span><span class="cm-fbpost-btn" data-tap="cta">Agendar agora</span></div>
    </article>`) + scene('page', 'sheet', 'claro', `${browserBar('Visita ao decorado', 'moradafalesia.exemplo')}${landing({ key: 'incorporadora', title: 'Visita ao decorado', sub: 'Escolha o dia da visita.', body: chips('Quando prefere visitar?', ['Durante a semana', 'Fim de semana'], 1), button: 'Agendar visita', confirm: done('Visita agendada', 'Você recebe a confirmação por e-mail.') })}`)),

  /* 3.3 Facebook video: a restaurant video in portrait with the reserve button that lights up. */
  fbvid: () => screen('fbvid', scene('video', 'base', 'escuro', `<div class="cm-fbv">
      ${pic('prato916', { alt: 'Prato de feijoada servido com farofa e couve.' })}
      <span class="cm-fbv-play" aria-hidden="true">${I('video')}</span>
      <div class="cm-fbv-meta" data-hs="1"><span>${marca('restaurante')}<span><b>tachomiudo</b><small>Patrocinado</small></span></span><p>Feijoada no tacho aos sábados. Mesa para o almoço.</p></div>
      <div class="cm-fbv-cta" data-tap="cta" data-hs="3"><b>Reservar mesa</b>${I('chevron')}</div>
    </div>`) + scene('page', 'sheet', 'claro', `${browserBar('Reserva', 'tachomiudo.exemplo')}${landing({ key: 'restaurante', title: 'Reservar mesa', sub: 'Feijoada aos sábados, com mesa para o almoço.', body: chips('Quantas pessoas?', ['2', '4', '6'], 0), button: 'Pedir reserva', confirm: done('Pedido de reserva enviado', 'O restaurante confirma pelo WhatsApp.') })}`)),

  /* 3.4 Facebook ad break: a video pauses for an ad card with a skip button, then the course page. */
  fbbreak: () => screen('fbbreak', scene('video', 'base', 'escuro', `<div class="cm-fbb">
      ${pic('panela916', { alt: 'Tacho de feijoada no fogão, em plano fechado.' })}
      <span class="cm-fbb-tag">Vídeo</span></div>`) + scene('ad', 'sheet', 'escuro', `<div class="cm-fbb-ad">
      ${pic('escola916', { alt: 'Fone de ouvido sobre o caderno de anotações.' })}
      <span class="cm-fbb-label">Patrocinado</span>
      <span class="cm-fbb-skip" data-hs="1"><span class="cm-fbb-s1">Pular em 5</span><span class="cm-fbb-s2">Pular</span></span>
      <div class="cm-fbb-cta" data-tap="cta" data-hs="3"><span><b>Sotaque Livre Idiomas</b><small>Aula experimental</small></span>${I('chevron')}</div>
    </div>`) + scene('page', 'sheet', 'claro', `${browserBar('Aula experimental', 'sotaquelivre.exemplo')}${landing({ key: 'educacao', title: 'Aula experimental', sub: 'Escolha o nível e o horário da sua aula.', body: chips('Qual é o seu nível?', ['Começando', 'Intermediário', 'Avançado'], 1), button: 'Agendar aula experimental', confirm: done('Aula experimental agendada', 'Quinta, 19h. O link da aula chega por e-mail.') })}`)),

  fbFeed: () => screen('fb', scene('ad', 'base', 'claro', `<div class="cm-safe"><div class="cm-fb-bar"><b class="cm-fb-name">Facebook</b><span><i>${I('plus')}</i><i>${I('search')}</i><i>${I('comment')}</i></span></div>
    <article class="cm-fb-post"><header class="cm-fb-head">${marca('incorporadora')}<span><b>Morada Falésia</b><small>Patrocinado · ${I('globe', 'cm-i--inline')}</small></span>${I('dots')}${I('close')}</header>
    <p class="cm-fb-text">Casas na falésia com a sala voltada para o mar. Agende uma visita ao decorado.</p>
    <div class="cm-fb-carousel" data-hs="2"><div class="cm-track">
      <figure class="cm-fb-card"><span class="cm-fb-img" data-hs="1">${pic('coast', { alt: 'Casa de concreto e madeira na falésia, sobre o mar.', pos: '34% 50%' })}</span><figcaption><span><b>Casa na falésia</b><small>Visita ao decorado</small></span><span class="cm-fb-btn">Agendar agora</span></figcaption></figure>
      <figure class="cm-fb-card"><span class="cm-fb-img">${pic('salaMar11')}</span><figcaption><span><b>Sala voltada para o mar</b><small>Visita ao decorado</small></span><span class="cm-fb-btn">Agendar agora</span></figcaption></figure>
      <figure class="cm-fb-card"><span class="cm-fb-img cm-fb-img--plan">${planta()}</span><figcaption><span><b>Plantas de 3 e 4 quartos</b><small>Visita ao decorado</small></span><span class="cm-fb-btn" data-tap="cta" data-hs="3">Agendar agora</span></figcaption></figure>
    </div></div>
    <div class="cm-fb-actions"><span>${I('thumb')}Curtir</span><span>${I('comment')}Comentar</span><span>${I('forward')}Compartilhar</span></div></article><div class="cm-fb-post cm-fb-next">${skel(4)}</div></div>${tabbar(TABS.facebook)}`) +
    scene('form', 'sheet', 'escuro', `<div class="cm-mf"><div class="cm-mf-cover">${pic('coast', { pos: '40% 60%' })}<span class="cm-mf-x">${I('close')}</span></div><div class="cm-mf-body">${marca('incorporadora')}<small>Morada Falésia</small><b class="cm-mf-title">Visita ao decorado</b>
      <p class="cm-mf-section">Seus dados</p>${input('Nome completo', 'Seu nome')}${input('E-mail', 'voce@exemplo.com')}${input('Telefone', '(11) 90000-0000')}${chips('Quando prefere visitar?', ['Durante a semana', 'Fim de semana'], 1)}
      <p class="cm-mf-legal">Ao tocar em Enviar, você envia suas informações para Morada Falésia, que as usa conforme a própria política de privacidade.</p></div>
      <div class="cm-mf-foot">${btn('Enviar', 'send')}</div>
      ${done('Obrigado!', 'Recebemos seu pedido de visita. Um corretor entra em contato para combinar o horário.', btn('Ver site', '', '', 'cm-btn--ghost') + '<small class="cm-legal">Imagens ilustrativas. CRECI e registro de incorporação aparecem aqui.</small>')}</div>`, '', 'claro')),

  /* 2.4 TikTok In-Feed: a tech store, native text, CTA that takes the brand colour, TikTok browser. */
  ttFeed: () => screen('tt', scene('video', 'base', 'escuro', `<div class="cm-shots">
      <figure class="cm-shot" data-shot="1">${pic('nerd', { alt: 'Notebook com a tela acesa numa mesa escura.' })}<p class="cm-tt-text" data-hs="1"><span>Joga à noite</span><span>e edita de dia?</span></p></figure>
      <figure class="cm-shot cm-shot--zoom" data-shot="2">${pic('nerd', { pos: '50% 34%' })}<p class="cm-tt-text" data-hs="2"><span>De noite, o jogo.</span><span>De dia, a edição.</span></p></figure></div>
    <span class="cm-shade"></span>
    <div class="cm-tt-top">${I('tv')}<span><span>Seguindo</span><b>Para você</b></span>${I('search')}</div>
    <div class="cm-rail cm-rail--tt"><span class="cm-tt-avatar">${marca('varejo')}<i>${I('plus')}</i></span>${I('heart')}${I('comment')}${I('bookmark')}${I('forward')}<span class="cm-disc">${marca('varejo')}</span></div>
    <div class="cm-vmeta cm-vmeta--tt"><b>teclaria</b><p>Um notebook para os dois turnos.</p><small class="cm-pill">Patrocinado</small><small class="cm-audio">${I('music')}Música promocional</small></div>
    <div class="cm-vcta cm-vcta--tt" data-tap="cta" data-hs="3"><b>Comprar agora</b>${I('chevron')}</div>
    <div class="cm-vprogress cm-vprogress--tt"><i data-cx-progress></i></div>${tabbar(TABS.tiktok, 'cm-tabbar--dark')}`) +
    scene('page', 'sheet', 'claro', `${browserBar('teclaria', 'teclaria.exemplo')}${landing({ key: 'varejo', hero: `<span class="cm-lp-hero cm-lp-hero--sq">${pic('nerd', { pos: '50% 30%' })}</span>`, title: 'Teclaria Pro 15', sub: 'Notebook para jogar e editar.', body: chips('Memória', ['16 GB', '32 GB'], 1) + chips('Cor', ['Grafite', 'Branco'], 0), button: 'Adicionar ao carrinho', confirm: done('Adicionado ao carrinho', 'Teclaria Pro 15, 32 GB, grafite.', btn('Ver carrinho', '', '', 'cm-btn--ghost')) })}`)),

  /* 2.5 YouTube in-stream: a car dealer before a chosen video, skip after 5 s, panel CTA, test drive page. */
  ytInstream: () => screen('yt', scene('watch', 'base', 'claro', `<div class="cm-safe"><div class="cm-yt-player">${pic('esportes', { alt: 'SUV elétrico verde carregando no estacionamento de um estádio ao pôr do sol.', pos: '50% 32%' })}<span class="cm-yt-dim"></span>
      <p class="cm-yt-burn" data-hs="1">Saiu do jogo. Quanto de carga sobra?</p>
      <div class="cm-yt-dash" data-hs="2"><small>Carga para a volta</small><span><i></i></span><b>O painel mostra antes de você sair.</b></div>
      <span class="cm-yt-label">Patrocinado · 0:12 ${I('info')}</span><span class="cm-yt-wait">Pular em 4</span><span class="cm-yt-skip">Pular ${I('skip')}</span>
      <span class="cm-yt-adbar"><i data-cx-progress></i></span></div>
    <div class="cm-yt-panel">${marca('automotivo')}<span><b>Test drive do SUV elétrico</b><small><b>Patrocinado</b> · ondara.exemplo</small></span><span class="cm-yt-btn" data-tap="cta" data-hs="3">Agendar</span></div>
    <div class="cm-yt-info"><b>Melhores momentos da rodada</b><span class="cm-yt-channel"><i></i><b>Canal Exemplo</b><span class="cm-yt-sub">Inscrever-se</span></span></div>
    <div class="cm-yt-recs">${Array.from({ length: 4 }, () => `<span><i></i>${skel(2)}</span>`).join('')}</div></div>`) +
    scene('page', 'push', 'claro', `${browserBar('Test drive', 'ondara.exemplo')}${landing({ key: 'automotivo', hero: `<span class="cm-lp-hero">${pic('esportes', { pos: '50% 34%' })}</span>`, title: 'Test drive do SUV elétrico', body: chips('Escolha o dia', ['Sáb', 'Dom'], 0) + chips('Período', ['Manhã', 'Tarde'], 0) + input('Seu WhatsApp', '(11) 90000-0000'), button: 'Solicitar test drive', confirm: done('Pedido enviado', 'A Ondara confirma o horário com você.', '<small class="cm-legal">Mensagem educativa de trânsito aqui (CTB, art. 77‑B).</small>') })}`)),

  /* 2.6 YouTube Shorts: the app of a language school, an exercise that holds attention, App Store sheet. */
  ytShorts: () => screen('shorts', scene('video', 'base', 'escuro', `<div class="cm-shots"><figure class="cm-shot" data-shot="1">${pic('escola916', { alt: 'Fone de ouvido sobre a mesa de madeira.' })}<p class="cm-ontext" data-hs="1">Pare de traduzir na cabeça.</p></figure></div>
    <span class="cm-shade"></span>
    <div class="cm-quiz" data-hs="2"><small>Complete</small><b>I'm looking forward <span class="cm-blank"><i>to</i></span> it.</b><span class="cm-quiz-ok">${I('check')}Certo</span></div>
    <div class="cm-shorts-top">${I('search')}${I('vdots')}</div>
    <div class="cm-rail cm-rail--yt"><span>${I('thumb')}<small>Gostei</small></span><span>${I('thumb', 'cm-i--flip')}<small>Não gostei</small></span><span>${I('comment')}<small>Comentários</small></span><span>${I('forward')}<small>Compartilhar</small></span><span>${I('remix')}<small>Remixar</small></span><span class="cm-cover cm-cover--sq" style="background-image:url(${IMG.escola45.src})"></span></div>
    <div class="cm-vmeta cm-vmeta--yt"><span class="cm-who">${marca('educacao')}<b>@sotaquelivre</b><small class="cm-pill">Patrocinado</small></span><p>Conversação em inglês, um pouco por dia.</p></div>
    <div class="cm-vcta cm-vcta--yt" data-tap="cta" data-hs="3"><b>Instalar</b></div>
    <div class="cm-vprogress"><i data-cx-progress></i></div>${tabbar(TABS.youtube, 'cm-tabbar--dark')}`) +
    scene('store', 'sheet', 'escuro', `<div class="cm-sheet cm-store"><span class="cm-grabber"></span><div class="cm-store-head">${marca('educacao', 'app')}<span><b>Sotaque Livre</b><small>Conversação todos os dias</small></span><span class="cm-store-get" data-tap="go" data-hs="3"><b>Obter</b><i class="cm-ring"></i><b>Abrir</b></span></div>
      <div class="cm-store-shots"><span><i class="cm-bubble">How was your day?</i><i class="cm-bubble cm-bubble--me">Pretty good, thanks!</i></span><span><small>Uma frase por dia</small><b>I'm looking forward to it.</b><i class="cm-bubble">Mal posso esperar.</i></span></div>
      </div>`, 'cm-scene--part', 'claro')),

  /* 2.7 YouTube live: a creator shows the tech store's notebook, paid promotion notice, pinned link. */
  ytLive: () => screen('ytlive', scene('live', 'base', 'claro', `<div class="cm-safe"><div class="cm-yt-player">${pic('nerd', { alt: 'Setup do criador: notebook com a tela acesa na mesa.', pos: '50% 19%' })}
      <span class="cm-paid" data-hs="1">${I('tag')}Inclui promoção paga${I('chevron')}</span><span class="cm-onair">Ao vivo</span>
      <span class="cm-lower" data-hs="2"><small>#publi</small><b>Teclaria</b><span>O notebook deste setup</span></span></div>
    <div class="cm-yt-info"><b>Montando o setup de edição ao vivo</b><span class="cm-yt-channel"><i>C</i><b>Canal Exemplo</b><span class="cm-yt-sub">Inscrever-se</span></span></div>
    <div class="cm-chat"><div class="cm-chat-head"><b>Chat ao vivo</b>${I('vdots')}</div>
      <div class="cm-chat-pin">${I('pin')}<span><b>Canal Exemplo</b> Lista de espera do Teclaria Pro 15 branco: <u data-tap="link" data-hs="3">teclaria.exemplo/branco</u></span></div>
      <div class="cm-chat-list"><p><i></i><b>bia.rocha</b> boa noite, canal!</p><p><i></i><b>lucas_dev</b> que setup bonito</p><p><i></i><b>marina.t</b> qual programa de edição você usa?</p><p><i></i><b>jogador1</b> qual é esse notebook?</p><p><i></i><b>edita_noite</b> a tela aguenta bem as cores?</p><p class="cm-chat-more"><i></i><b>ana.cortes</b> vai ter branco?</p><p class="cm-chat-more"><i></i><b>pedro_lima</b> curti o teclado</p></div>
      <span class="cm-chat-input">Diga algo…</span></div></div>`) +
    scene('page', 'push', 'claro', `${browserBar('Teclaria Pro 15 branco', 'teclaria.exemplo')}${landing({ key: 'varejo', hero: `<span class="cm-lp-hero">${pic('nerd', { pos: '50% 22%' })}</span>`, title: 'Teclaria Pro 15 branco', sub: 'Avise-me quando chegar.', body: input('Seu e-mail', 'voce@exemplo.com'), button: 'Quero ser avisado', confirm: done('Pronto', 'Você recebe só esse aviso.') })}`)),

  /* 2.8 LinkedIn: document ad with a lead form of a wealth manager. */
  liFeed: () => screen('li', scene('feed', 'base', 'claro', `<div class="cm-safe"><div class="cm-li-top"><i class="cm-tab-me"></i><span class="cm-li-search">${I('search')}Pesquisar</span>${I('comment')}</div>
    <article class="cm-li-post"><header class="cm-li-head">${marca('financas', 'quadrado')}<span><b>Arrimo Patrimônio</b><small>Promovido</small></span><span class="cm-li-follow">${I('plus')}Seguir</span></header>
    <p class="cm-li-text" data-hs="1">Empresa e família no mesmo patrimônio? Três sinais de que é hora de separar. <span>…mais</span></p>
    <div class="cm-doc"><div class="cm-doc-bar">${I('doc')}<b>Guia: patrimônio da empresa e da família</b></div><div class="cm-doc-view" data-hs="2"><div class="cm-track">
      <figure class="cm-doc-page cm-doc-page--cover">${pic('negocios', { alt: 'Mesa escura com caneta e cartão, capa do guia.', pos: '50% 100%' })}<figcaption><small>Arrimo Patrimônio</small><b>Guia: patrimônio da empresa e da família</b></figcaption></figure>
      <figure class="cm-doc-page"><small>1</small><b>Contas que se misturam</b>${skel(4)}</figure>
      <figure class="cm-doc-page"><small>2</small><b>Sucessão sem plano</b>${skel(4)}</figure>
      <figure class="cm-doc-page cm-doc-page--gate">${skel(5)}<span><b>Para continuar lendo, envie suas informações.</b>${btn('Desbloquear', 'cta')}</span></figure>
    </div><span class="cm-doc-count"><i>1</i><i>2</i><i>3</i><i>4</i> de 4</span></div></div>
    <div class="cm-li-actions"><span>${I('thumb')}Gostei</span><span>${I('comment')}Comentar</span><span>${I('repost')}Compartilhar</span><span>${I('send')}Enviar</span></div></article><div class="cm-li-post">${skel(3)}</div></div>${tabbar(TABS.linkedin)}`) +
    scene('form', 'sheet', 'claro', `<div class="cm-lf"><div class="cm-lf-top">${I('close')}<b>Arrimo Patrimônio</b></div><div class="cm-lf-body">${marca('financas', 'quadrado')}<b class="cm-lf-title">Guia: patrimônio da empresa e da família</b>
      <p class="cm-mf-section">Informações de contato</p>${input('Nome', 'Seu nome')}${input('Sobrenome', 'Seu sobrenome')}${input('E-mail', 'voce@exemplo.com')}${input('Cargo', 'Seu cargo')}${input('Empresa', 'Sua empresa')}
      <p class="cm-mf-legal">Suas informações serão enviadas para Arrimo Patrimônio. Política de privacidade da Arrimo Patrimônio.</p></div>
      <div class="cm-lf-foot">${btn('Enviar', 'send')}</div>
      ${done('Informações enviadas para Arrimo Patrimônio', 'O guia completo já está liberado no post.', btn('Visitar site', '', '', 'cm-btn--ghost') + '<small class="cm-legal">Investimentos envolvem riscos.</small>')}</div>`)),

  /* 2.9 Google Search: a dental clinic answers "dentista perto de mim" with a call. */
  gSearch: () => screen('g', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box" data-hs="1">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed"><span>dentista perto de mim</span></span>${I('close')}${I('mic')}${I('lens')}</div>
    <div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Mapas</span><span>Imagens</span><span>Notícias</span></div>
    <ul class="cm-g-suggest"><li>${I('search')}dentista perto de mim</li><li>${I('search')}dentista perto de mim aberto agora</li><li>${I('search')}dentista perto de mim avaliação</li></ul><div class="cm-g-results"><p class="cm-g-group">Resultado patrocinado</p>
      <div class="cm-g-ad"><div class="cm-g-site">${marca('clinica', 'fav')}<span><b>Seixo Odontologia</b><small>https://www.seixo.exemplo › avaliacao</small></span>${I('vdots')}</div>
      <b class="cm-g-title" data-hs="2">Avaliação com hora marcada | Seixo Odontologia</b>
      <p>Consulta de avaliação para planejar o tratamento com calma. Agende pelo site ou ligue. [RT e CRO]</p>
      <span class="cm-g-links"><span>Agendar avaliação</span><span>Especialidades</span><span>Como chegar</span></span>
      <span class="cm-g-call" data-tap="cta" data-hs="3">${I('phone')}Ligar</span></div>
      <span class="cm-g-hide">Ocultar resultados patrocinados ${I('up')}</span>${skel(4, 'cm-skel--result')}${skel(3, 'cm-skel--result')}</div></div>`) +
    scene('call', 'sheet', 'claro', `<div class="cm-ios-sheet"><span class="cm-ios-group"><small>(11) 0000-0000</small><span data-tap="go" data-hs="3">${I('phone')}Ligar</span></span><span class="cm-ios-cancel">Cancelar</span></div>
      <div class="cm-call"><small>chamando…</small><b data-hs="3">Seixo Odontologia</b><span class="cm-call-keys"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="cm-call-end">${I('phone')}</span></div>`, 'cm-scene--part')),

  /* 2.16 Google Display: a travel agency banner inside an article; the headline rotates as Google combines assets. */
  gDisplay: () => screen('gd', scene('article', 'base', 'claro', `<div class="cm-safe cm-web"><div class="cm-web-host"><b>Portal Exemplo</b>${I('menu')}</div><small class="cm-web-kicker">Viagem</small><b class="cm-web-title">O que ver nas festas de junho no interior</b>${skel(5)}
    <div class="cm-gd-ad"><span class="cm-gd-flag">Anúncio ${I('close')}</span><span class="cm-gd-img" data-hs="1" data-hs-at="tl">${pic('crencas', { alt: 'Rua de pedra com bandeirolas e igreja ao entardecer.', pos: '50% 9%' })}</span>
      <div class="cm-gd-body"><span><b class="cm-gd-h" data-hs="2"><span>Festa do Divino em grupo pequeno</span><span>Guia da cidade e hotel no centro</span></b><small>Bandeirola Viagens</small></span><span class="cm-gd-go" data-tap="cta" data-hs="3">${I('chevron')}</span></div></div>${skel(5)}${skel(4)}</div>${safari('portal.exemplo')}`) +
    scene('page', 'push', 'claro', `${landing({ key: 'turismo', hero: `<span class="cm-lp-hero cm-lp-hero--wide">${pic('crencas', { pos: '50% 9%' })}</span>`, title: 'Festa do Divino em grupo pequeno', sub: 'Grupo pequeno, guia da cidade e hotel no centro.', body: chips('Próximas saídas', ['Maio', 'Junho'], 1) + input('Seu nome', 'Seu nome') + input('Seu WhatsApp', '(11) 90000-0000'), button: 'Garantir minha vaga', confirm: done('Pré-reserva recebida', 'Falamos com você pelo WhatsApp para confirmar.') })}${safari('bandeirola.exemplo')}`, 'cm-scene--web')),

  /* 2.10 SEO: organic result of a developer with sitelinks; the floor plans page trades the PDF for an e-mail. */
  seoOrganic: () => screen('g', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed is-done"><span>casa na falésia à venda</span></span>${I('close')}${I('mic')}${I('lens')}</div>
    <div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Imagens</span><span>Mapas</span><span>Notícias</span></div>
    <div class="cm-g-faded" aria-hidden="true">${skel(3)}</div>
    <div class="cm-g-result cm-g-result--organic"><div class="cm-g-site">${marca('incorporadora', 'fav')}<span><b>Morada Falésia</b><small>moradafalesia.exemplo › plantas</small></span>${I('vdots')}</div>
      <div class="cm-g-main"><b class="cm-g-title" data-hs="1">Casas na falésia com vista para o mar</b>${pic('coast', { cls: 'cm-g-thumb', pos: '30% 50%' })}</div>
      <p>Plantas de 3 e 4 quartos, sala voltada para o mar e visita ao decorado com hora marcada.</p>
      <span class="cm-g-list"><span data-tap="link">Plantas${I('chevron')}</span><span>Localização${I('chevron')}</span><span>Agendar visita${I('chevron')}</span></span></div>${skel(3, 'cm-skel--result')}</div>`) +
    scene('page', 'push', 'claro', `<div class="cm-lp" style="--brand:${CLIENTES.incorporadora.cor}"><span class="cm-lp-hero">${pic('salaMar45', { pos: '50% 40%' })}</span><div class="cm-lp-body"><span class="cm-lp-brand">${marca('incorporadora')}<b>Morada Falésia</b></span><b class="cm-lp-title">Plantas</b>
      <span class="cm-seg" data-hs="2"><span class="cm-seg-3">3 quartos</span><span class="cm-seg-4">4 quartos</span></span>${planta('cm-planta--lp')}${btn('Receber as plantas em PDF', 'pdf')}</div>
      <div class="cm-sheet cm-mail"><span class="cm-grabber"></span><b class="cm-lp-title">Receber as plantas</b>${input('Seu e-mail', 'voce@exemplo.com')}${btn('Enviar', 'send')}</div>
      ${done('Enviamos as plantas para o seu e-mail', 'Plantas de 3 e 4 quartos, em PDF.', '<small class="cm-legal">Imagens ilustrativas. CRECI e registro de incorporação aparecem aqui.</small>')}</div>${safari('moradafalesia.exemplo')}`, 'cm-scene--web')),

  /* 2.14 ChatGPT: the travel agency card below an answer, separated from it, and the in-app browser. */
  gptAnswer: () => screen('gpt', scene('chat', 'base', 'claro', `<div class="cm-gpt-top"><span class="cm-glass">${I('menu2')}</span><b>ChatGPT</b><span class="cm-glass cm-glass--pill">${I('edit')}${I('dots')}</span></div>
    <div class="cm-gpt-flow"><p class="cm-gpt-user" data-hs="1" data-hs-at="tl">Quero ver uma festa tradicional no interior em junho. Por onde começo?</p>
      <span class="cm-gpt-think" aria-hidden="true"><i></i></span>
      <div class="cm-gpt-answer"><p>Se você me disser:</p><ul><li>quantos <b>dias</b> você tem,</li><li>de qual <b>cidade</b> sai,</li><li>se prefere <b>procissão, música ou cavalhadas</b>,</li><li>e se viaja <b>com crianças</b>,</li></ul><p>eu indico as 3 cidades que mais combinam com a sua viagem.</p></div>
      <div class="cm-gpt-actions">${I('copy')}${I('thumb', 'cm-i--flip')}${I('share')}${I('regen')}${I('dots')}<span class="cm-gpt-src"><i>R</i><i>G</i><i>T</i>Fontes</span></div>
      <hr><p class="cm-gpt-lead">Para a sua busca por festas de junho no interior, aqui está uma opção para considerar.</p>
      <div class="cm-gpt-ad" data-tap="cta" data-hs="2 3" data-hs-at="tl">${pic('crencas', { cls: 'cm-gpt-ad-img', pos: '50% 8%' })}<span class="cm-gpt-ad-body"><span class="cm-gpt-ad-top">${marca('turismo', 'fav')}<span>Bandeirola Viagens</span><small class="cm-gpt-chip">Anúncio</small>${I('dots')}</span><b>Festas de junho em grupo pequeno</b><small>Roteiros com guia da cidade e hotel no centro histórico. Saiba mais.</small></span></div>
      <span class="cm-gpt-down" aria-hidden="true">${I('up', 'cm-i--flip')}</span></div>
    <div class="cm-gpt-input">${I('plus')}<span>Pergunte ao ChatGPT</span>${I('mic')}<i>${I('wave')}</i></div>`) +
    scene('page', 'sheet', 'claro', `${browserBar('Bandeirola Viagens', 'bandeirola.exemplo', 'share')}${landing({ key: 'turismo', hero: `<span class="cm-lp-hero">${pic('crencas', { pos: '50% 14%' })}</span>`, title: 'Monte seu roteiro', body: chips('Quantos dias?', ['3', '5'], 0) + chips('O que você quer ver?', ['Festas', 'Cidades históricas'], 0), button: 'Ver roteiro sugerido', confirm: `<div class="cm-done cm-done--list" data-hs="3"><b>Roteiro sugerido: 3 dias em Pirenópolis</b><ol><li><b>Dia 1</b> Chegada e centro histórico</li><li><b>Dia 2</b> Mascarados nas ruas</li><li><b>Dia 3</b> Cavalhadas</li></ol>${btn('Falar com um consultor', '', '')}</div>` })}`)),

  /* 2.11 Google Maps: promoted square pin and sponsored place sheet of a restaurant, then the route. */
  mapsLocal: () => {
    const area = inner => `<div class="cm-map">${pic('mapa', { cls: 'cm-map-bg' })}<div class="cm-map-area">${inner}</div></div>`;
    const drops = [[86, 150], [178, 118], [130, 360], [300, 420], [60, 290]].map(([x, y]) => `<span class="cm-drop" style="left:${x / 3.6}%;top:${y / 6.4}%">${I('fork')}</span>`).join('');
    return screen('maps', scene('map', 'base', 'claro', `${area(`${drops}<span class="cm-promo cm-promo--left" style="left:${252 / 3.6}%;top:${224 / 6.4}%"><span class="cm-promo-sq" data-hs="1">${I('fork')}</span><span class="cm-promo-text"><b>Tacho Miúdo</b><small>Feijoada no tacho aos sábados</small></span></span><span class="cm-me" style="left:${108 / 3.6}%;top:${544 / 6.4}%"></span>`)}
      <div class="cm-maps-search">${I('back')}<span>feijoada perto de mim</span>${I('close')}</div>
      <div class="cm-place"><span class="cm-grabber"></span>
        <div class="cm-place-row"><span><small class="cm-sp">Patrocinado</small><b>Tacho Miúdo</b><small>Restaurante · <em>Aberto</em></small></span>${pic('fachada43', { alt: 'Fachada de madeira do restaurante à noite, com flores e mesas na calçada.', pos: '50% 40%' })}</div>
        <div class="cm-place-full"><span class="cm-place-top"><small class="cm-sp">Patrocinado ${I('vdots')}</small><span><i>${I('share')}</i><i>${I('close')}</i></span></span><b class="cm-place-name">Tacho Miúdo</b><small>Restaurante</small><small><em>Aberto</em> · Fecha às 23:00</small>
          <span class="cm-place-ad" data-hs="2"><b>Feijoada no tacho aos sábados</b><small>Encomendas e mesa para o almoço.</small><small>tachomiudo.exemplo</small><span>Acessar site</span></span>
          <span class="cm-place-chips"><span class="is-primary" data-tap="cta" data-hs="3">${I('route')}Rotas</span><span>${I('calendar')}Reservar</span><span>${I('phone')}Ligar</span><span>${I('share')}Compartilhar</span></span>
          <span class="cm-place-photos">${pic('fachada43', { pos: '50% 40%' })}${pic('prato11')}</span></div></div>`) +
      scene('route', 'fade', 'claro', `${area(`<svg class="cm-route" viewBox="0 0 360 640" preserveAspectRatio="none" aria-hidden="true"><path d="M108,544 L108,464 L180,464 L180,304 L252,304 L252,224" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="M108,544 L108,464 L180,464 L180,304 L252,304 L252,224" fill="none" stroke="#1a73e8" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="cm-promo cm-promo--end" style="left:${252 / 3.6}%;top:${224 / 6.4}%"><span class="cm-promo-sq">${I('fork')}</span></span><span class="cm-me" style="left:${108 / 3.6}%;top:${544 / 6.4}%"></span>`)}
      <div class="cm-route-top"><span class="cm-route-ends"><span><i class="cm-route-a"></i>Seu local</span><span>${I('location')}Tacho Miúdo</span></span><span class="cm-route-modes"><b>${I('car')}</b>${I('bus')}${I('walk')}</span></div>
      <div class="cm-route-sheet"><span class="cm-grabber"></span><b>De carro</b><small>Pelo caminho indicado no mapa</small>${btn('Iniciar', 'go', '3', 'cm-btn--maps')}</div>
      <div class="cm-route-nav" data-hs="3"><b>Siga pela avenida</b><small>Navegação iniciada até Tacho Miúdo</small></div>`));
  },

  /* 2.12 WhatsApp click-to-chat: Instagram ad of a dental clinic, app switch, pre-filled message, quick replies. */
  waAd: () => screen('wa', scene('ad', 'base', 'claro', `<div class="cm-safe">${igBar}<article class="cm-ig-post">${igHead('clinica')}
    <div class="cm-ig-media cm-wa-art">${pic('consultorio45', { alt: 'Consultório odontológico claro, com a frase Avaliação com hora marcada.' })}<b data-hs="1">Avaliação com hora marcada</b>${marca('clinica', 'circulo', 'cm-wa-art-mark')}</div>
    <div class="cm-ig-cta cm-ig-cta--wa" data-tap="cta" data-hs="3">${logoSvg('whatsapp', { altura: 17, classe: 'cm-wa-glyph' })}${logoSvg('whatsapp', { altura: 17, mono: 'branco', classe: 'cm-wa-glyph cm-wa-glyph--lit' })}<b>Enviar mensagem pelo WhatsApp</b>${I('chevron')}</div>
    ${igActions()}
    <p class="cm-ig-caption cm-ig-caption--open" data-hs="2"><b>seixoodontologia</b> Avaliação com hora marcada. <span class="cm-more">mais</span><span class="cm-rest">Conte o que você sente e escolha o horário pela conversa.</span></p></article></div>${tabbar(TABS.instagram)}`) +
    scene('chat', 'push', 'claro', `<span class="cm-crumb">${I('back')}Instagram</span><div class="cm-wa-head">${I('back')}${marca('clinica')}<span><b>Seixo Odontologia</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>
      <div class="cm-wa-body"><span class="cm-wa-sys">As mensagens são protegidas com a criptografia de ponta a ponta.</span><span class="cm-wa-day">Hoje</span>
        <div class="cm-wa-out cm-wa-msg1"><span class="cm-wa-quote">${pic('consultorio45')}<span><b>Seixo Odontologia</b><small>Avaliação com hora marcada</small></span></span>Olá! Quero agendar uma avaliação.<small>10:09 ${I('ticks')}</small></div>
        <div class="cm-wa-in cm-wa-msg2">Olá! Que bom falar com você. Qual horário fica melhor para a avaliação?<small>10:09</small></div>
        <span class="cm-wa-replies cm-wa-msg2" data-hs="3"><span data-tap="reply">Quinta, 9h</span><span>Sexta, 14h</span><span>Outro horário</span></span>
        <div class="cm-wa-out cm-wa-msg3">Quinta, 9h<small>10:09 ${I('ticks')}</small></div>
        <div class="cm-wa-in cm-wa-msg3" data-hs="3">Combinado. Enviamos a confirmação por aqui.<small>10:09</small></div></div>
      <div class="cm-wa-compose"><span class="cm-wa-preview">${pic('consultorio45')}<span><b>Seixo Odontologia</b><small>Avaliação com hora marcada</small></span></span><span class="cm-wa-row">${I('plus')}<span class="cm-wa-field">Olá! Quero agendar uma avaliação.</span><span class="cm-wa-send" data-tap="send" data-hs="3">${I('send')}</span><span class="cm-wa-idle">${I('camera')}${I('mic')}</span></span></div>`)),

  /* 2.13 WhatsApp Business catalog (not an ad): profile, collections, item, message with the item attached. */
  waCatalog: () => screen('wacat', scene('profile', 'base', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span></span>${I('dots')}</div><div class="cm-wa-profile">${marca('restaurante', 'circulo', 'cm-mark--xl')}<b>Tacho Miúdo</b><small>Conta comercial</small><span class="cm-wa-tools"><span>${I('phone')}Áudio</span><span>${I('video')}Vídeo</span><span>${I('search')}Pesquisar</span></span><small class="cm-wa-cat">Restaurante · Cozinha brasileira</small></div>
    <div class="cm-wa-shelf"><p><b>Catálogo</b><span data-tap="more">Ver tudo ${I('chevron')}</span></p><span class="cm-wa-thumbs" data-hs="1">${pic('panela11')}${pic('escondidinho11')}${pic('pudim11')}</span></div>
    <div class="cm-wa-rows"><span>${I('bell')}Silenciar notificações</span><span>${I('lock')}Criptografia</span></div></div>`) +
    scene('catalog', 'push', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span><b>Catálogo</b><small>Tacho Miúdo</small></span>${I('share')}</div>
      <div class="cm-wa-coll"><p><b>Encomendas de sábado</b><span>Ver tudo</span></p><ul data-hs="2"><li data-tap="item">${pic('panela11')}<span><b>Feijoada no tacho para 4</b><small>Carnes separadas, arroz, couve e farofa.</small></span></li><li>${pic('escondidinho11')}<span><b>Escondidinho de carne-seca</b><small>Gratinado na panelinha, para 2.</small></span></li></ul>
      <p><b>Doces</b><span>Ver tudo</span></p><ul><li>${pic('pudim11')}<span><b>Pudim de leite</b><small>Inteiro, feito na casa.</small></span></li></ul></div></div>`) +
    scene('item', 'push', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span></span>${I('share')}</div><span class="cm-wa-photo">${pic('panela11')}</span><div class="cm-wa-item"><b>Feijoada no tacho para 4</b><p>Carnes separadas, arroz, couve e farofa. Encomenda até sexta.</p>${btn('Conversar com a empresa', 'cta', '3', 'cm-btn--wa')}</div></div>`) +
    scene('chat', 'push', 'claro', `<div class="cm-wa-head">${I('back')}${marca('restaurante')}<span><b>Tacho Miúdo</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>
      <div class="cm-wa-body"><span class="cm-wa-day">Hoje</span><div class="cm-wa-out"><span class="cm-wa-quote cm-wa-quote--item">${pic('panela11')}<span><b>Feijoada no tacho para 4</b><small>Ver</small></span></span>Olá! Quero encomendar este item para sábado.<small>10:09 ${I('ticks')}</small></div>
        <div class="cm-wa-in">Anotado! Retira no local ou prefere entrega?<small>10:09</small></div><span class="cm-wa-replies" data-hs="3"><span>Retirar</span><span>Entrega</span></span></div>
      <div class="cm-wa-compose"><span class="cm-wa-row">${I('plus')}<span class="cm-wa-field cm-wa-field--empty"></span>${I('camera')}${I('mic')}</span></div>`)),

  /* 2.15 Publieditorial: a wealth manager's sponsored article in a fictitious magazine, identified before the title. */
  blogArticle: () => screen('blog', scene('article', 'base', 'claro', `<div class="cm-web-host cm-web-host--blog"><b>Revista Exemplo</b>${I('menu')}<span class="cm-read"><i></i></span></div>
    <div class="cm-blog-flow"><p class="cm-blog-paid" data-hs="1">Conteúdo patrocinado por Arrimo Patrimônio</p><small class="cm-web-kicker">Finanças da família</small>
      <b class="cm-blog-title">Por onde começar a organizar o patrimônio da família</b><small class="cm-blog-by">Por Redação, em parceria com Arrimo Patrimônio</small>
      <span class="cm-blog-img">${pic('negocios', { alt: 'Mesa escura com caneta e cartão, imagem de abertura do artigo.', pos: '50% 11%' })}</span>
      <p class="cm-blog-p">Patrimônio da família e da empresa costumam crescer juntos. Separar os dois evita decisões apressadas.</p>
      <div class="cm-blog-steps" data-hs="2"><b>1. Separe o que é da empresa</b><p class="cm-blog-p">Contas, bens e despesas em nomes diferentes.</p><b>2. Escreva os objetivos</b><p class="cm-blog-p">Proteger, transmitir ou investir pedem caminhos diferentes.</p><b>3. Pergunte antes de assinar</b><p class="cm-blog-p">Cada documento tem consequências para a família.</p></div>
      <aside class="cm-blog-brand"><small>Oferecido por</small><span class="cm-blog-brand-head">${marca('financas')}<b>Arrimo Patrimônio</b></span><p>Um especialista explica cada decisão antes de você assinar.</p>${btn('Agendar conversa', 'cta', '3')}</aside></div>${safari('revista.exemplo')}`) +
    scene('page', 'push', 'claro', `${landing({ key: 'financas', title: 'Agendar conversa', sub: '30 minutos, por vídeo.', body: chips('Dia', ['Ter', 'Qua'], 0) + chips('Horário', ['10h', '15h'], 0), button: 'Confirmar', confirm: done('Conversa agendada', 'O convite chega por e-mail.', '<small class="cm-legal">Investimentos envolvem riscos.</small>') })}${safari('arrimo.exemplo')}`, 'cm-scene--web')),
};

/* Front of the peel per channel: the piece of the first placement's client. */
const art = (cliente, img, pos, titulo, alt) => ({ cliente, img, pos, titulo, alt });

export const groups = [
  { id: 'social', label: 'Redes sociais' },
  { id: 'search', label: 'Busca e IA' },
  { id: 'local', label: 'Local e conversa' },
  { id: 'content', label: 'Conteúdo' },
];

const P = (fase, rotulo, quadros) => ({ fase, rotulo, quadros });
export const channels = [
  { id: 'instagram', name: 'Instagram', group: 'social', benefit: 'Prender no feed e levar à ação.',
    art: art('educacao', 'escola45', '50% 50%', 'Você entende a série sem legenda?', 'Peça da Sotaque Livre Idiomas, escola de idiomas fictícia: fone de ouvido sobre a mesa e a pergunta Você entende a série sem legenda?'),
    placements: [
      { id: 'feed', label: 'Feed', mock: 'igFeed', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas leva do carrossel à aula experimental.',
        passos: [P('Atenção', 'Pergunta que o aluno reconhece', [0]), P('Retenção', 'Deslizar revela a resposta', [1, 2]), P('Conversão', 'Nível e horário em dois toques', [3, 4, 5])],
        quadros: [
          { ms: 1300, cena: 'ad', desc: 'Post patrocinado da Sotaque Livre no feed do Instagram: Você entende a série sem legenda?' },
          { ms: 1500, cena: 'ad', estado: 'c2', desc: 'O carrossel desliza: três expressões que a legenda traduz errado.' },
          { ms: 1500, cena: 'ad', estado: 'c3 lit', desc: 'Último cartão: I\'m looking forward to it, mal posso esperar. A barra Inscrever-se agora acende.' },
          { ms: 1000, cena: 'ad', estado: 'c3 lit', toque: 'cta', desc: 'Toque em Inscrever-se agora.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'O navegador do Instagram abre a aula experimental: nível intermediário, quinta às 19h. Toque em Agendar.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Aula experimental agendada para quinta, 19h.' },
        ] },
      { id: 'reels', label: 'Reels', mock: 'igReels', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante leva do Reels à reserva de mesa.',
        passos: [P('Atenção', 'Tacho fervendo no primeiro segundo', [0]), P('Retenção', 'Corte curto segura até a mesa', [1]), P('Conversão', 'Cardápio e reserva sem sair', [2, 3, 4, 5])],
        quadros: [
          { ms: 1400, cena: 'video', video: 1, desc: 'Reels patrocinado do Tacho Miúdo: o tacho de feijoada e o texto Sábado tem feijoada no tacho.' },
          { ms: 1800, cena: 'video', estado: 's2 lit', video: 1, desc: 'Corte para o prato servido: Fogo baixo desde cedo. O botão Ver cardápio ganha cor.' },
          { ms: 1000, cena: 'video', estado: 's2 lit', video: 1, toque: 'cta', desc: 'Toque em Ver cardápio.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'O navegador do Instagram abre o cardápio de sábado. Toque em Reservar mesa.' },
          { ms: 1500, cena: 'reserva', toque: 'send', desc: 'Reserva para 2 pessoas às 13h. Toque em Pedir reserva.' },
          { ms: 2000, cena: 'reserva', estado: 'done', desc: 'Pedido de reserva enviado. O restaurante confirma pelo WhatsApp.' },
        ] },
      { id: 'story', label: 'Story', mock: 'igstory', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas leva da história à aula experimental.',
        passos: [P('Atenção', 'Pergunta sobre a foto', [0]), P('Retenção', 'Adesivo de link aparece', [1]), P('Conversão', 'Agendamento na página', [2, 3, 4])],
        quadros: [
          { ms: 1300, cena: 'story', desc: 'Story patrocinado da Sotaque Livre: foto da escola e a pergunta Você entende a série sem legenda?' },
          { ms: 1400, cena: 'story', estado: 'lit', desc: 'O adesivo Agendar aula ganha cor no fim da história.' },
          { ms: 900, cena: 'story', estado: 'lit', toque: 'cta', desc: 'Toque no adesivo.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'A página da aula abre no navegador do Instagram. Toque em Agendar aula experimental.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Aula experimental agendada para quinta, 19h.' },
        ] },
      { id: 'live', label: 'Live', mock: 'iglive', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante cozinha ao vivo e leva à reserva.',
        passos: [P('Atenção', 'Selo Ao vivo e o tacho', [0]), P('Retenção', 'Comentário respondido pela marca', [1]), P('Conversão', 'Cardápio e reserva', [2, 3, 4])],
        quadros: [
          { ms: 1400, cena: 'live', desc: 'Live patrocinada do Tacho Miúdo: o tacho de feijoada com o selo Ao vivo.' },
          { ms: 1600, cena: 'live', estado: 'lit', desc: 'Um comentário pergunta o horário do almoço. O botão Ver cardápio ganha cor.' },
          { ms: 900, cena: 'live', estado: 'lit', toque: 'cta', desc: 'Toque em Ver cardápio.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'O cardápio de sábado abre no navegador. Toque em Reservar mesa.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Pedido de reserva enviado.' },
        ] },
      { id: 'explorar', label: 'Explorar', mock: 'igexplore', cliente: 'clinica', selo: 'Patrocinado', frase: 'Uma clínica aparece entre fotos de interesse e leva ao horário.',
        passos: [P('Atenção', 'Publicação entre as fotos', [0]), P('Retenção', 'Publicação abre em tela cheia', [1, 2]), P('Conversão', 'Agendamento em dois toques', [3, 4, 5])],
        quadros: [
          { ms: 1300, cena: 'grid', desc: 'Explorar: grade de fotos e uma publicação patrocinada da Seixo Odontologia.' },
          { ms: 1200, cena: 'grid', estado: 'lit', toque: 'ad', desc: 'Toque na publicação patrocinada.' },
          { ms: 1600, cena: 'post', desc: 'A publicação abre em tela cheia, com Patrocinado e o botão Agendar avaliação.' },
          { ms: 900, cena: 'post', estado: 'lit', toque: 'cta', desc: 'Toque em Agendar avaliação.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'Página de agendamento: dia e horário. Toque em Confirmar horário.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Avaliação agendada.' },
        ] },
    ] },
  { id: 'facebook', name: 'Facebook', group: 'social', benefit: 'Receber o pedido sem sair do app.',
    art: art('incorporadora', 'coast', '30% 50%', 'Casas na falésia com a sala voltada para o mar.', 'Peça da Morada Falésia, incorporadora fictícia: casa de concreto e madeira na falésia, sobre o mar.'),
    placements: [
      { id: 'feed', label: 'Feed', mock: 'fbFeed', cliente: 'incorporadora', selo: 'Patrocinado', frase: 'Uma incorporadora recebe o pedido de visita sem sair do Facebook.',
        passos: [P('Atenção', 'Vista do mar no primeiro cartão', [0]), P('Retenção', 'Deslizar mostra sala e planta', [1, 2]), P('Conversão', 'Formulário já vem preenchido', [3, 4, 5])],
        quadros: [
          { ms: 1400, cena: 'ad', desc: 'Anúncio patrocinado da Morada Falésia no feed do Facebook: casa na falésia e o botão Agendar agora.' },
          { ms: 1400, cena: 'ad', estado: 'c2', desc: 'O carrossel desliza para a sala voltada para o mar.' },
          { ms: 1400, cena: 'ad', estado: 'c3', desc: 'Terceiro cartão: plantas de 3 e 4 quartos.' },
          { ms: 1000, cena: 'ad', estado: 'c3', toque: 'cta', desc: 'Toque em Agendar agora.' },
          { ms: 1800, cena: 'form', toque: 'send', desc: 'O formulário instantâneo abre com os dados do perfil e a preferência fim de semana. Toque em Enviar.' },
          { ms: 2200, cena: 'form', estado: 'done', desc: 'Obrigado. Recebemos seu pedido de visita.' },
        ] },
      { id: 'post', label: 'Post', mock: 'fbpost', cliente: 'incorporadora', selo: 'Patrocinado', frase: 'Uma incorporadora leva a foto da sala à visita agendada.',
        passos: [P('Atenção', 'Sala com vista para o mar', [0]), P('Retenção', 'Legenda e link à mostra', [1]), P('Conversão', 'Agendamento na página', [2, 3, 4])],
        quadros: [
          { ms: 1300, cena: 'post', desc: 'Post patrocinado da Morada Falésia no feed: a sala voltada para o mar e o texto de convite.' },
          { ms: 1200, cena: 'post', estado: 'lit', desc: 'O botão Agendar agora ganha cor na barra do link.' },
          { ms: 900, cena: 'post', estado: 'lit', toque: 'cta', desc: 'Toque em Agendar agora.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'A página da visita abre no navegador. Toque em Agendar visita.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Visita agendada. A confirmação chega por e-mail.' },
        ] },
      { id: 'video', label: 'Vídeo', mock: 'fbvid', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante leva do vídeo à reserva de mesa.',
        passos: [P('Atenção', 'Feijoada no primeiro quadro', [0]), P('Retenção', 'Convite antes do fim do vídeo', [1]), P('Conversão', 'Reserva em duas etapas', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'video', desc: 'Vídeo patrocinado do Tacho Miúdo: o prato de feijoada e o texto Feijoada no tacho aos sábados.' },
          { ms: 1800, cena: 'video', estado: 'lit', desc: 'No fim do vídeo, o botão Reservar mesa ganha cor.' },
          { ms: 900, cena: 'video', estado: 'lit', toque: 'cta', desc: 'Toque em Reservar mesa.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'A página de reserva abre no navegador. Toque em Pedir reserva.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Pedido de reserva enviado.' },
        ] },
      { id: 'breaks', label: 'Ad breaks', mock: 'fbbreak', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas entra na pausa do vídeo e leva à aula.',
        passos: [P('Atenção', 'Vídeo começa e a pausa aparece', [0]), P('Retenção', 'Anúncio com pular em 5 segundos', [1, 2]), P('Conversão', 'Aula experimental em dois toques', [3, 4, 5])],
        quadros: [
          { ms: 1300, cena: 'video', desc: 'O vídeo do Tacho Miúdo começa; a pausa do anúncio chega com o selo Patrocinado.' },
          { ms: 1500, cena: 'ad', desc: 'Anúncio da Sotaque Livre na pausa, com o botão Pular em 5 segundos.' },
          { ms: 1600, cena: 'ad', estado: 'skip', desc: 'Depois de cinco segundos, o botão vira Pular.' },
          { ms: 900, cena: 'ad', estado: 'skip lit', toque: 'cta', desc: 'O cartão Aula experimental acende. Toque nele.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'A página da aula abre no navegador. Toque em Agendar aula experimental.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Aula experimental agendada para quinta, 19h.' },
        ] },
    ] },
  { id: 'tiktok', name: 'TikTok', group: 'social', benefit: 'Do vídeo ao carrinho em um toque.',
    art: art('varejo', 'nerd', '50% 28%', 'Joga à noite e edita de dia?', 'Peça da Teclaria, loja de tecnologia fictícia: notebook com a tela acesa numa mesa escura.'),
    placements: [
      { id: 'infeed', label: 'In-Feed', mock: 'ttFeed', cliente: 'varejo', selo: 'Patrocinado', frase: 'Uma loja de tecnologia leva do vídeo ao carrinho.',
        passos: [P('Atenção', 'Pergunta nativa no primeiro segundo', [0]), P('Retenção', 'Corte mostra os dois usos', [1]), P('Conversão', 'Do vídeo ao carrinho', [2, 3, 4])],
        quadros: [
          { ms: 1400, cena: 'video', video: 1, desc: 'Vídeo patrocinado da Teclaria no Para você do TikTok: Joga à noite e edita de dia?' },
          { ms: 1900, cena: 'video', estado: 's2 lit', video: 1, desc: 'Corte para a tela: De noite, o jogo. De dia, a edição. O botão Comprar agora ganha cor.' },
          { ms: 1000, cena: 'video', estado: 's2 lit', video: 1, toque: 'cta', desc: 'Toque em Comprar agora.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'O navegador do TikTok abre o Teclaria Pro 15 com 32 GB e cor grafite. Toque em Adicionar ao carrinho.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Adicionado ao carrinho.' },
        ] },
    ] },
  { id: 'youtube', name: 'YouTube', group: 'social', benefit: 'Ganhar os primeiros segundos.',
    art: art('automotivo', 'esportes', '50% 58%', 'Saiu do jogo. Quanto de carga sobra?', 'Peça da Ondara Elétricos, concessionária fictícia: SUV elétrico verde carregando no estacionamento do estádio ao pôr do sol.'),
    placements: [
      { id: 'instream', label: 'Anúncio no vídeo', mock: 'ytInstream', cliente: 'automotivo', selo: 'Patrocinado', frase: 'Uma concessionária leva do anúncio ao test drive.',
        passos: [P('Atenção', 'Mensagem antes do Pular', [0]), P('Retenção', 'Painel responde à dúvida', [1]), P('Conversão', 'Dia e período, sem ligação', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'watch', video: 1, desc: 'Anúncio patrocinado da Ondara antes de um vídeo no YouTube: Saiu do jogo. Quanto de carga sobra?' },
          { ms: 2000, cena: 'watch', estado: 's2', video: 1, desc: 'O painel do carro mostra a carga para a volta. O botão Pular aparece, e o vídeo continua.' },
          { ms: 1000, cena: 'watch', estado: 's2', video: 1, toque: 'cta', desc: 'Toque em Agendar, no painel abaixo do vídeo.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'A página de test drive abre com sábado de manhã escolhido. Toque em Solicitar test drive.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Pedido enviado. A Ondara confirma o horário.' },
        ] },
      { id: 'shorts', label: 'Shorts', mock: 'ytShorts', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas leva do Shorts ao app instalado.',
        passos: [P('Atenção', 'Frase curta antes da marca', [0]), P('Retenção', 'Exercício segura até a resposta', [1, 2]), P('Conversão', 'Instalar sem sair do vídeo', [3, 4, 5, 6])],
        quadros: [
          { ms: 1400, cena: 'video', video: 1, desc: 'Shorts patrocinado da Sotaque Livre: Pare de traduzir na cabeça.' },
          { ms: 1200, cena: 'video', estado: 'q', video: 1, desc: 'Exercício na tela: complete I\'m looking forward, lacuna, it.' },
          { ms: 1100, cena: 'video', estado: 'q ok lit', video: 1, desc: 'A resposta aparece: to. Certo. O botão Instalar fica branco.' },
          { ms: 1000, cena: 'video', estado: 'q ok lit', video: 1, toque: 'cta', desc: 'Toque em Instalar.' },
          { ms: 1500, cena: 'store', toque: 'go', desc: 'A folha da loja de apps abre com Sotaque Livre. Toque em Obter.' },
          { ms: 900, cena: 'store', estado: 'load', desc: 'O app está sendo instalado.' },
          { ms: 1700, cena: 'store', estado: 'done', desc: 'App instalado: o botão mostra Abrir.' },
        ] },
      { id: 'live', label: 'Live', mock: 'ytLive', cliente: 'varejo', selo: 'Inclui promoção paga', frase: 'Uma marca de tecnologia entra na live com publi identificada.',
        passos: [P('Atenção', 'Aviso de publi logo no começo', [0]), P('Retenção', 'Criador mostra o setup em uso', [1]), P('Conversão', 'Link fixado leva à lista', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'live', estado: 'paid', desc: 'Live de um criador no YouTube com o aviso Inclui promoção paga.' },
          { ms: 1800, cena: 'live', estado: 's2', desc: 'Cartela #publi Teclaria: o notebook deste setup. O chat continua.' },
          { ms: 1400, cena: 'live', estado: 's2 s3', toque: 'link', desc: 'Mensagem fixada do criador com a lista de espera. Toque no link.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'A página Teclaria Pro 15 branco abre com o e-mail preenchido. Toque em Quero ser avisado.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Pronto. Você recebe só esse aviso.' },
        ] },
    ] },
  { id: 'linkedin', name: 'LinkedIn', group: 'social', benefit: 'Falar com quem decide.',
    art: art('financas', 'negocios', '50% 100%', 'Guia: patrimônio da empresa e da família', 'Peça da Arrimo Patrimônio, gestora de patrimônio fictícia: mesa escura com caneta e cartão, capa do guia.'),
    placements: [
      { id: 'feed', label: 'Documento', mock: 'liFeed', cliente: 'financas', selo: 'Promovido', frase: 'Uma gestora entrega o guia em troca do contato.',
        passos: [P('Atenção', 'Problema do sócio na primeira frase', [0]), P('Retenção', 'Páginas de amostra no feed', [1, 2]), P('Conversão', 'Formulário com dados do perfil', [3, 4, 5])],
        quadros: [
          { ms: 1400, cena: 'feed', desc: 'Post promovido da Arrimo Patrimônio no LinkedIn: Empresa e família no mesmo patrimônio?' },
          { ms: 1300, cena: 'feed', estado: 'p2', desc: 'O documento passa para a página 1: contas que se misturam.' },
          { ms: 1300, cena: 'feed', estado: 'p3', desc: 'Página 2: sucessão sem plano.' },
          { ms: 1300, cena: 'feed', estado: 'p4', toque: 'cta', desc: 'Para continuar lendo, envie suas informações. Toque em Desbloquear.' },
          { ms: 1800, cena: 'form', toque: 'send', desc: 'O formulário abre com os dados do perfil preenchidos. Toque em Enviar.' },
          { ms: 2100, cena: 'form', estado: 'done', desc: 'Informações enviadas para Arrimo Patrimônio. O guia completo está liberado.' },
        ] },
    ] },
  { id: 'google', name: 'Google Ads', group: 'search', benefit: 'Responder a quem já procura.',
    art: art('clinica', 'consultorio45', '50% 50%', 'Avaliação com hora marcada', 'Peça da Seixo Odontologia, clínica odontológica fictícia: consultório claro com cadeira e janela.'),
    placements: [
      { id: 'search', label: 'Pesquisa', mock: 'gSearch', cliente: 'clinica', selo: 'Resultado patrocinado', frase: 'Uma clínica responde à busca com uma ligação.',
        passos: [P('Atenção', 'Busca já diz a intenção', [0]), P('Retenção', 'Título responde à busca', [1]), P('Conversão', 'Ligar com um toque', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'serp', estado: 'typing', desc: 'Busca no Google: dentista perto de mim.' },
          { ms: 1900, cena: 'serp', estado: 'r', desc: 'Resultado patrocinado da Seixo Odontologia: Avaliação com hora marcada, com sitelinks e o botão Ligar.' },
          { ms: 1000, cena: 'serp', estado: 'r', toque: 'cta', desc: 'Toque em Ligar.' },
          { ms: 1400, cena: 'call', toque: 'go', desc: 'A folha do iPhone pergunta se quer ligar. Toque em Ligar.' },
          { ms: 2000, cena: 'call', estado: 'done', desc: 'Chamando Seixo Odontologia.' },
        ] },
      { id: 'display', label: 'Display', mock: 'gDisplay', cliente: 'turismo', selo: 'Anúncio', frase: 'Uma agência lembra quem já leu sobre o destino.',
        passos: [P('Atenção', 'Banner no assunto da matéria', [0]), P('Retenção', 'Título muda, oferta continua', [1]), P('Conversão', 'Data escolhida, vaga pré-reservada', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'article', desc: 'Anúncio da Bandeirola Viagens numa matéria sobre festas de junho: Festa do Divino em grupo pequeno.' },
          { ms: 1700, cena: 'article', estado: 's2', desc: 'O título do anúncio muda: guia da cidade e hotel no centro.' },
          { ms: 1000, cena: 'article', estado: 's2', toque: 'cta', desc: 'Toque na seta do anúncio.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'A página da agência abre com a saída de junho escolhida. Toque em Garantir minha vaga.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Pré-reserva recebida. A agência confirma pelo WhatsApp.' },
        ] },
    ] },
  { id: 'seo', name: 'SEO', group: 'search', benefit: 'Ser encontrado sem pagar pelo clique.',
    art: art('incorporadora', 'salaMar45', '50% 50%', 'Casas na falésia com vista para o mar', 'Peça da Morada Falésia, incorporadora fictícia: varanda e sala da casa na falésia, com mata ao redor.'),
    placements: [
      { id: 'organic', label: 'Orgânico', mock: 'seoOrganic', cliente: 'incorporadora', selo: 'Orgânico, sem anúncio', frase: 'Uma incorporadora aparece na busca sem pagar pelo clique.',
        passos: [P('Atenção', 'Título com o que foi buscado', [0]), P('Retenção', 'Plantas que dá para comparar', [1, 2, 3]), P('Conversão', 'PDF em troca do e-mail', [4, 5, 6])],
        quadros: [
          { ms: 1400, cena: 'serp', desc: 'Resultado orgânico da Morada Falésia para a busca casa na falésia à venda, sem rótulo de anúncio.' },
          { ms: 900, cena: 'serp', toque: 'link', desc: 'Toque no atalho Plantas.' },
          { ms: 1300, cena: 'page', desc: 'A página de plantas abre com 3 quartos.' },
          { ms: 1200, cena: 'page', estado: 'p4', desc: 'A planta muda para 4 quartos.' },
          { ms: 1000, cena: 'page', estado: 'p4', toque: 'pdf', desc: 'Toque em Receber as plantas em PDF.' },
          { ms: 1400, cena: 'page', estado: 'p4 mail', toque: 'send', desc: 'O e-mail já está preenchido. Toque em Enviar.' },
          { ms: 1800, cena: 'page', estado: 'p4 done', desc: 'Enviamos as plantas para o seu e-mail.' },
        ] },
    ] },
  { id: 'chatgpt', name: 'ChatGPT', group: 'search', benefit: 'Aparecer depois da resposta.',
    art: art('turismo', 'crencas', '50% 22%', 'Festas tradicionais em grupo pequeno', 'Peça da Bandeirola Viagens, agência de viagens fictícia: rua de pedra com bandeirolas e igreja ao entardecer.'),
    placements: [
      { id: 'answer', label: 'Resposta', mock: 'gptAnswer', cliente: 'turismo', selo: 'Anúncio', frase: 'Uma agência aparece depois da resposta, separada dela.',
        passos: [P('Atenção', 'Pergunta de quem planeja a viagem', [0, 1]), P('Retenção', 'Opção logo abaixo da resposta', [2]), P('Conversão', 'Roteiro montado em dois toques', [3, 4, 5])],
        quadros: [
          { ms: 1100, cena: 'chat', desc: 'Conversa no ChatGPT: quero ver uma festa tradicional no interior em junho. O ChatGPT começa a responder.' },
          { ms: 1700, cena: 'chat', estado: 's1', desc: 'A resposta pede dias, cidade de saída, tipo de festa e se a viagem é com crianças. Abaixo, ações e o chip Fontes.' },
          { ms: 1900, cena: 'chat', estado: 's1 s2', desc: 'Depois de um divisor, uma frase cinza apresenta a opção e o cartão com a etiqueta Anúncio: Bandeirola Viagens, Festas de junho em grupo pequeno.' },
          { ms: 1000, cena: 'chat', estado: 's1 s2', toque: 'cta', desc: 'Toque no cartão do anúncio.' },
          { ms: 1700, cena: 'page', toque: 'go', desc: 'O navegador do ChatGPT abre Monte seu roteiro: 3 dias, festas. Toque em Ver roteiro sugerido.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Roteiro sugerido de 3 dias em Pirenópolis e o botão Falar com um consultor.' },
        ] },
    ] },
  { id: 'maps', name: 'Google Maps', group: 'local', benefit: 'Ser a escolha no caminho.',
    art: art('restaurante', 'fachada45', '50% 50%', 'Feijoada no tacho aos sábados', 'Peça do Tacho Miúdo, restaurante fictício: fachada de madeira à noite, com flores e mesas na calçada.'),
    placements: [
      { id: 'local', label: 'Local', mock: 'mapsLocal', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante aparece no mapa e traça a rota.',
        passos: [P('Atenção', 'Pin destacado no caminho', [0]), P('Retenção', 'Ficha mostra prato e horário', [1]), P('Conversão', 'Rota traçada com um toque', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'map', desc: 'Busca feijoada perto de mim no Google Maps: alfinete quadrado do Tacho Miúdo e o resultado Patrocinado.' },
          { ms: 1900, cena: 'map', estado: 's2', desc: 'A ficha patrocinada sobe: restaurante aberto, fecha às 23h, feijoada no tacho aos sábados.' },
          { ms: 1000, cena: 'map', estado: 's2', toque: 'cta', desc: 'Toque em Rotas.' },
          { ms: 1700, cena: 'route', toque: 'go', desc: 'A rota de carro aparece no mapa. Toque em Iniciar.' },
          { ms: 1800, cena: 'route', estado: 'done', desc: 'Navegação iniciada até o Tacho Miúdo.' },
        ] },
    ] },
  { id: 'whatsapp', name: 'WhatsApp Business', group: 'local', benefit: 'Transformar interesse em conversa.',
    art: art('clinica', 'recepcao45', '50% 50%', 'Conte o que sente e escolha o horário', 'Peça da Seixo Odontologia, clínica odontológica fictícia: recepção com parede terracota, sofá e plantas.'),
    placements: [
      { id: 'ctwa', label: 'Clique para conversar', mock: 'waAd', cliente: 'clinica', selo: 'Patrocinado', frase: 'Uma clínica começa o agendamento numa conversa.',
        passos: [P('Atenção', 'Hora marcada na própria imagem', [0]), P('Retenção', 'Legenda convida a contar mais', [1]), P('Conversão', 'Mensagem pronta e horário', [2, 3, 4, 5])],
        quadros: [
          { ms: 1400, cena: 'ad', desc: 'Anúncio patrocinado da Seixo Odontologia no Instagram: Avaliação com hora marcada.' },
          { ms: 1700, cena: 'ad', estado: 'open lit', desc: 'A legenda abre: conte o que você sente e escolha o horário pela conversa. A barra Enviar mensagem pelo WhatsApp acende.' },
          { ms: 1000, cena: 'ad', estado: 'open lit', toque: 'cta', desc: 'Toque em Enviar mensagem pelo WhatsApp.' },
          { ms: 1600, cena: 'chat', toque: 'send', desc: 'O WhatsApp abre a conversa com a mensagem pronta: Olá! Quero agendar uma avaliação. Toque em enviar.' },
          { ms: 1800, cena: 'chat', estado: 'm2', toque: 'reply', desc: 'Resposta automática pergunta o horário. Toque em Quinta, 9h.' },
          { ms: 1900, cena: 'chat', estado: 'm2 m3', desc: 'Horário escolhido: quinta, 9h. A clínica confirma pela conversa.' },
        ] },
      { id: 'catalog', label: 'Catálogo', mock: 'waCatalog', cliente: 'restaurante', selo: 'Catálogo, não é anúncio', frase: 'Um restaurante recebe encomendas pelo catálogo.',
        passos: [P('Atenção', 'Vitrine dentro do perfil', [0]), P('Retenção', 'Itens organizados por ocasião', [1, 2]), P('Conversão', 'Item vai junto na mensagem', [3, 4])],
        quadros: [
          { ms: 1400, cena: 'profile', desc: 'Perfil comercial do Tacho Miúdo no WhatsApp, com a faixa Catálogo.' },
          { ms: 900, cena: 'profile', toque: 'more', desc: 'Toque em Ver tudo.' },
          { ms: 1500, cena: 'catalog', toque: 'item', desc: 'Catálogo com as coleções Encomendas de sábado e Doces. Toque em Feijoada no tacho para 4.' },
          { ms: 1500, cena: 'item', toque: 'cta', desc: 'Página do item, sem preço. Toque em Conversar com a empresa.' },
          { ms: 2200, cena: 'chat', desc: 'A conversa abre com o item anexado e a mensagem enviada. O restaurante pergunta se é retirada ou entrega.' },
        ] },
    ] },
  { id: 'blog', name: 'Publieditorial', group: 'content', benefit: 'Explicar antes de vender, sempre identificado.',
    art: art('financas', 'negocios', '50% 100%', 'Por onde começar a organizar o patrimônio da família', 'Peça da Arrimo Patrimônio, gestora de patrimônio fictícia: mesa escura com caneta e cartão.'),
    placements: [
      { id: 'article', label: 'Artigo', mock: 'blogArticle', cliente: 'financas', selo: 'Conteúdo patrocinado', frase: 'Uma gestora explica antes de vender, sempre identificada.',
        passos: [P('Atenção', 'Aviso de patrocínio antes do título', [0]), P('Retenção', 'Leitura útil, marca no fim', [1]), P('Conversão', 'Conversa marcada pelo próprio bloco', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'article', desc: 'Artigo na Revista Exemplo com o aviso Conteúdo patrocinado por Arrimo Patrimônio acima do título.' },
          { ms: 1900, cena: 'article', estado: 's2', desc: 'A leitura passa pelos três passos: separe o que é da empresa, escreva os objetivos, pergunte antes de assinar.' },
          { ms: 1400, cena: 'article', estado: 's3', toque: 'cta', desc: 'Bloco Oferecido por Arrimo Patrimônio. Toque em Agendar conversa.' },
          { ms: 1600, cena: 'page', toque: 'go', desc: 'A página da Arrimo abre com terça às 10h. Toque em Confirmar.' },
          { ms: 2000, cena: 'page', estado: 'done', desc: 'Conversa agendada. O convite chega por e-mail.' },
        ] },
    ] },
];
export const channelById = id => channels.find(channel => channel.id === id) || channels[0];

/* App theme behind the status bar and the screen colour while a placement loads. */
const SCREEN = {
  igReels: { tema: 'escuro', fundo: '#000' },
  igstory: { tema: 'escuro', fundo: '#000' },
  iglive: { tema: 'escuro', fundo: '#000' },
  igexplore: { tema: 'claro', fundo: '#fff' },
  fbpost: { tema: 'claro', fundo: '#fff' },
  fbvid: { tema: 'escuro', fundo: '#000' },
  fbbreak: { tema: 'escuro', fundo: '#000' },
  ttFeed: { tema: 'escuro', fundo: '#000' },
  ytShorts: { tema: 'escuro', fundo: '#000' },
  liFeed: { fundo: '#f4f2ee' },
};

/* iPhone 17 Pro Max in cosmic orange, ported from the Fatos studio phone
   (Aparelho.tsx): body, action button, volume up and down, side button, Camera
   Control, screen, Dynamic Island, iOS status bar at 10:09 with signal, wi-fi and
   battery, and the home indicator. No manufacturer name or logo. The screen is a
   412 x 895.2 logical canvas (var(--u)); "tema" is the app theme behind the
   status bar ("claro" = light app, dark text). The status bar and the home
   indicator follow the theme of the scene on screen (channel-mocks.css). */
export const STATUS_TIME = '10:09';
const STATUS_ICONS = '<span class="ch-iphone-icones">' +
  '<svg class="ch-iphone-sinal" viewBox="0 0 18 12" aria-hidden="true" focusable="false"><rect x="0" y="7.6" width="3.2" height="4.4" rx="0.9" fill="currentColor"/><rect x="4.9" y="5.4" width="3.2" height="6.6" rx="0.9" fill="currentColor"/><rect x="9.8" y="2.9" width="3.2" height="9.1" rx="0.9" fill="currentColor"/><rect x="14.7" y="0" width="3.2" height="12" rx="0.9" fill="currentColor"/></svg>' +
  '<svg class="ch-iphone-wifi" viewBox="0 0 17 12" aria-hidden="true" focusable="false"><path d="M8.5 2.3c2.3 0 4.4.9 6 2.4.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7A11.3 11.3 0 0 0 .7 2.9c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0 1.6-1.5 3.7-2.4 6-2.4Z" fill="currentColor"/><path d="M8.5 6c1.3 0 2.5.5 3.4 1.3.2.2.5.2.7 0l1.1-1.1c.2-.2.2-.5 0-.7a7.6 7.6 0 0 0-10.4 0c-.2.2-.2.5 0 .7l1.1 1.1c.2.2.5.2.7 0C6 6.5 7.2 6 8.5 6Z" fill="currentColor"/><path d="m10.8 9.4-1.9 1.9a.6.6 0 0 1-.8 0L6.2 9.4a.5.5 0 0 1 0-.7 3.4 3.4 0 0 1 4.6 0c.2.2.2.5 0 .7Z" fill="currentColor"/></svg>' +
  '<svg class="ch-iphone-bateria" viewBox="0 0 27 13" aria-hidden="true" focusable="false"><rect x="0.6" y="0.6" width="23" height="11.8" rx="3.6" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.1"/><rect x="2.3" y="2.3" width="15.4" height="8.4" rx="2.1" fill="currentColor"/><path d="M25 4.4v4.2c.8-.3 1.4-1.2 1.4-2.1S25.8 4.7 25 4.4Z" fill="currentColor" fill-opacity="0.45"/></svg>' +
  '</span>';
export function iphone(content, { tema = 'claro', temaGestos = tema, fundo = '#fff', status = true } = {}) {
  return '<div class="ch-iphone" data-tema="' + tema + '" data-cor="laranja">' +
    '<div class="ch-iphone-corpo">' +
    ['acao', 'volume-mais', 'volume-menos', 'lateral', 'camera'].map(b => '<i class="ch-iphone-botao" data-botao="' + b + '" aria-hidden="true"></i>').join('') +
    '<div class="ch-iphone-tela" style="--ch-tela-fundo:' + fundo + '"><div class="ch-iphone-ui">' + content +
    (status ? '<div class="ch-iphone-status" data-tema="' + tema + '" aria-hidden="true"><span class="ch-iphone-hora">' + STATUS_TIME + '</span>' + STATUS_ICONS + '</div>' : '') +
    '<span class="ch-iphone-ilha" aria-hidden="true"></span>' +
    '<span class="ch-iphone-gestos" data-tema="' + temaGestos + '" aria-hidden="true"></span>' +
    '</div></div></div></div>';
}
export function renderMock(placement) {
  const name = mocks[placement.mock] ? placement.mock : 'igFeed';
  return iphone(mocks[name](), SCREEN[name]);
}
