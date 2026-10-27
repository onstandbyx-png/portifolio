/** "Sua oferta. Em cada canal.": sixteen channels, thirty placements, each one
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
import { makeSites } from './campaign-sites.js';
import { makeLabScreens, IG_FUNDO } from './lab-telas.js';
import { makeAutomations } from './automation-flows.js';

const A = '/assets/portfolio/';
export const IMG = {
  escola45: { src: A + 'canais/escola-fones-caderno-4x5.webp', w: 960, h: 1200 },
  escola916: { src: A + 'canais/escola-fones-caderno-9x16.webp', w: 675, h: 1200 },
  panela916: { src: A + 'canais/restaurante-feijoada-completa-9x16.webp', w: 675, h: 1200 },
  prato916: { src: A + 'canais/restaurante-feijoada-prato-9x16.webp', w: 675, h: 1200 },
  panela11: { src: A + 'canais/restaurante-feijoada-completa-1x1.webp', w: 900, h: 900 },
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
  /* scenes of the Fatos studio, mapped in the lab (_lab/fatos-estudio) */
  cenaEsportes: { src: A + 'canais/cena-esportes.webp', w: 720, h: 1273 },
  cenaNerd: { src: A + 'canais/cena-nerd.webp', w: 720, h: 1273 },
  cenaCrencas: { src: A + 'canais/cena-crencas.webp', w: 720, h: 1273 },
};

/* Fictitious advertisers, one per client type. Names chosen on 27/10/2026, at the owner's request, to read
   like real Brazilian businesses (no name search was made). Every mark is a simple shape drawn for this section. */
export const CLIENTES = {
  restaurante: { tipo: 'restaurante', marca: 'Casa Amaro', arroba: 'casaamaro', dominio: 'casaamaro.exemplo', cor: '#a4462a' },
  clinica: { tipo: 'clínica odontológica', marca: 'Vilela Odontologia', arroba: 'vilelaodontologia', dominio: 'vilela.exemplo', cor: '#2f6f73' },
  incorporadora: { tipo: 'incorporadora', marca: 'Atlântica Incorporadora', curta: 'Atlântica', arroba: 'atlanticaincorporadora', dominio: 'atlantica.exemplo', cor: '#1f4e5f' },
  varejo: { tipo: 'loja de tecnologia', marca: 'Ponto Tech', arroba: 'pontotech', dominio: 'pontotech.exemplo', cor: '#5b3df5' },
  turismo: { tipo: 'agência de viagens', marca: 'Destino Certo Viagens', arroba: 'destinocerto', dominio: 'destinocerto.exemplo', cor: '#d9822b' },
  educacao: { tipo: 'escola de idiomas', marca: 'Speak Up Idiomas', curta: 'Speak Up', arroba: 'speakupidiomas', dominio: 'speakup.exemplo', cor: '#e5533d' },
  financas: { tipo: 'gestora de patrimônio', marca: 'Valore Patrimônio', arroba: 'valorepatrimonio', dominio: 'valore.exemplo', cor: '#0f1a2c' },
  automotivo: { tipo: 'concessionária', marca: 'EcoDrive Elétricos', arroba: 'ecodrive', dominio: 'ecodrive.exemplo', cor: '#0f6b5c' },
};
const MARCAS = {
  restaurante: '<svg viewBox="0 0 100 100"><text x="50" y="62" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="38" letter-spacing="-1" fill="#fff">CA</text></svg>',
  clinica: '<svg viewBox="0 0 100 100"><path d="M36 26c-9 0-14 7-14 16 0 9 5 13 7 22 2 8 3 14 8 14 5 0 5-9 8-16 1-3 3-4 5-4s4 1 5 4c3 7 3 16 8 16s6-6 8-14c2-9 7-13 7-22 0-9-5-16-14-16-6 0-9 3-14 3s-8-3-14-3z" fill="#fff"/></svg>',
  incorporadora: '<svg viewBox="0 0 100 100"><path d="M16 64h22l11-22h35" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M18 76c8-5 14-5 22 0s14 5 22 0 14-5 22 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/></svg>',
  varejo: '<svg viewBox="0 0 100 100"><rect x="25" y="29" width="50" height="42" rx="9" fill="none" stroke="#fff" stroke-width="6.5"/><circle cx="50" cy="50" r="6.5" fill="#fff"/></svg>',
  turismo: '<svg viewBox="0 0 100 100"><path d="M50 18c-13 0-23 10-23 23 0 17 23 39 23 39s23-22 23-39c0-13-10-23-23-23z" fill="#fff"/><path d="M41 41l6 6 12-12" fill="none" stroke="#d9822b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  educacao: '<svg viewBox="0 0 100 100"><path d="M29 28h42a9 9 0 0 1 9 9v21a9 9 0 0 1-9 9H49l-15 12V67h-5a9 9 0 0 1-9-9V37a9 9 0 0 1 9-9z" fill="#fff"/></svg>',
  financas: '<svg viewBox="0 0 100 100"><path d="M27 30h11l12 30 12-30h11L55 72H45z" fill="#d8b866"/><path d="M30 80h40" stroke="#d8b866" stroke-width="3"/></svg>',
  automotivo: '<svg viewBox="0 0 100 100"><path d="M27 70C27 44 46 28 74 26c2 28-14 46-40 46" fill="#fff"/><path d="M30 72c10-14 20-23 34-31" fill="none" stroke="#0f6b5c" stroke-width="4.5" stroke-linecap="round"/></svg>',
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
  mail: 'M3.5 6h17v12h-17zM3.5 6.5l8.5 6.5 8.5-6.5',
  down: 'M12 4v11.5M6.5 10.5 12 16l5.5-5.5M5 20h14',
};
const I = (name, cls = '') => `<svg class="cm-i cm-i--${name}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>`;
/* Every picture is lazy and sized; alt text only on the first view of a scene (the stage carries the description). */
/* Glyph of a channel without an official logo file (static-presentations.js, experience-player.js). */
export const glifo = (name, cls = '') => I(name, cls);
const pic = (key, { alt = '', cls = '', pos = '' } = {}) => {
  const im = IMG[key];
  return `<img class="${cls}" src="${im.src}" alt="${esc(alt)}" width="${im.w}" height="${im.h}" loading="lazy" decoding="async"${pos ? ` style="object-position:${pos}"` : ''}>`;
};
const scene = (id, kind, tema, html, cls = '', gestos = '') => `<div class="cm-scene${cls ? ' ' + cls : ''}" data-scene="${id}" data-kind="${kind}" data-tema="${tema}"${gestos ? ` data-gestos="${gestos}"` : ''}>${html}</div>`;
const screen = (key, html) => `<div class="cm-screen cm-${key}" data-frame="0">${html}</div>`;
const skel = (rows, cls = '') => `<span class="cm-skel${cls ? ' ' + cls : ''}" aria-hidden="true">${Array.from({ length: rows }, (_, i) => `<i style="--w:${[92, 74, 84, 58, 88][i % 5]}%"></i>`).join('')}</span>`;
/* Page parts shared by the advertisers' landing pages. */
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

/* Each client's own site, with the steps of its real flow (campaign-sites.js). */
const SITES = makeSites({ I, pic, marca, esc, CLIENTES });
/* The platform screens of the lab: the Fatos studio modules measured on the app captures (lab-telas.js). */
const LAB = makeLabScreens({ marca, esc, CLIENTES, pic });

/* Floor plan of the incorporadora (3 or 4 bedrooms), an original line drawing. */
const planta = cls => `<svg class="cm-planta${cls ? ' ' + cls : ''}" viewBox="0 0 200 150" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="6" width="188" height="138" rx="2"/><path d="M6 78h86M92 6v138M92 60h102M150 60v84"/><path class="cm-planta-4" d="M150 6v54M6 112h86"/></g><g fill="currentColor" font-family="Inter,Arial,sans-serif" font-size="10"><text x="22" y="44">Sala</text><text x="104" y="38">Varanda</text><text x="104" y="108">Quarto</text><text x="158" y="108">Suíte</text><text x="22" y="104">Cozinha</text></g></svg>`;

const mocks = {
  /* 2.1 Instagram feed: carousel of a language school, CTA bar that lights up, Instagram browser. */
  igFeed: () => screen('ig', scene('ad', 'base', 'escuro', LAB.feedAd({ key: 'educacao', carousel: 3, cta: { text: 'Inscrever-se agora' },
    media: `<div class="cm-track">
      <figure class="cm-card cm-card--photo">${pic('escola45', { alt: 'Fone de ouvido sobre a mesa, com a pergunta Você entende a série sem legenda?' })}<figcaption><b data-hs="1">Você entende a série sem legenda?</b></figcaption></figure>
      <figure class="cm-card cm-card--coral"><small>Três expressões</small><b>Que a legenda traduz errado</b><ol><li>It's up to you</li><li>I'm looking forward to it</li><li>Break a leg</li></ol></figure>
      <figure class="cm-card cm-card--cream"><b>I'm looking forward to it.</b>${I('arrow')}<b class="cm-card-pt">Mal posso esperar.</b><small>Aula experimental com horário marcado</small></figure></div>`,
    caption: { html: 'Aula experimental com horário marcado. Escolha o nível e o horário no link. <span class="cm-more">… mais</span>' } })) +
    scene('page', 'sheet', 'claro', `${browserBar('Speak Up', 'speakup.exemplo')}${SITES.sotaque()}`)),

  /* 2.3 Instagram Story: a language school, the sticker that holds the tap, then the course page. */
  igstory: () => screen('igstory', scene('story', 'base', 'escuro', LAB.storyAd({ key: 'educacao', cta: { text: 'Agendar aula' },
    media: `${pic('escola916', { alt: 'Fone de ouvido sobre o caderno de anotações, em luz de fim de tarde.' })}<p class="igs-texto" data-hs="1">Você entende a série sem legenda?</p>` })) + scene('page', 'sheet', 'claro', `${browserBar('Speak Up', 'speakup.exemplo')}${SITES.sotaque({ variant: 'agenda' })}`)),

  /* 2.4 Instagram Live: a restaurant cooking live with the paid label, comments and the menu sheet. */
  iglive: () => screen('iglive', scene('live', 'base', 'escuro', LAB.liveAd({ key: 'restaurante', cta: { text: 'Ver cardápio de sábado' },
    media: pic('panela916', { alt: 'Prato de feijoada completa com carnes, linguiça, arroz, farofa e couve.' }),
    comments: [['bia.rocha', 'Que cheiro daqui!', 0], ['cliente_12', 'Qual o horário do almoço?', 0, '1'], ['casaamaro', 'Sábado, feijoada completa a partir das 12h. Dá para retirar no balcão.', 1]] })) + scene('page', 'sheet', 'claro', `${browserBar('Casa Amaro', 'casaamaro.exemplo')}${SITES.tacho({ variant: 'retirada' })}`)),

  /* 2.5 Instagram Explorar: a grid of photos with one sponsored post that opens full screen, then the booking page. */
  igexplore: () => screen('igexplore', scene('grid', 'base', 'escuro', LAB.explore({ cells: `${pic('prato11', { alt: '' })}${pic('pudim11', { alt: '' })}${pic('panela11', { alt: '' })}
        ${pic('recepcao45', { alt: '' })}<span class="cm-xp-ad" data-tap="ad" data-hs="1">${pic('consultorio45', { alt: 'Consultório odontológico com cadeira e luz natural, publicação patrocinada.' })}<em>Patrocinado</em></span>${pic('escondidinho11', { alt: '' })}
        ${pic('salaMar11', { alt: '' })}${pic('fachada45', { alt: '' })}${pic('pudim11', { alt: '' })}` })) +
    scene('post', 'sheet', 'escuro', LAB.postAberto({ key: 'clinica', cta: { text: 'Agendar avaliação' }, media: pic('consultorio45', { alt: 'Consultório odontológico com cadeira e luz natural.' }), caption: 'Avaliação com dentista, horário marcado. <span class="cm-more">mais</span>' })) + scene('page', 'sheet', 'claro', `${browserBar('Agendamento online', 'vilela.exemplo')}${SITES.seixo()}`)),

  /* 2.2 Instagram Reels: a restaurant, two cuts, Instagram browser with the menu and the table booking sheet. */
  igReels: () => screen('reels', scene('video', 'base', 'escuro', LAB.reelsAd({ key: 'restaurante', caption: 'Feijoada completa aos sábados. Mesa para o almoço.', cta: { text: 'Ver cardápio' },
    video: `<div class="cm-shots">
      <figure class="cm-shot" data-shot="1">${pic('panela916', { alt: 'Prato de feijoada completa com carnes, linguiça, arroz, farofa e couve.' })}<p class="cm-ontext" data-hs="1">Sábado tem feijoada completa.</p></figure>
      <figure class="cm-shot" data-shot="2">${pic('prato916')}<p class="cm-ontext">Fogo baixo desde cedo.</p></figure></div>` })) +
    scene('page', 'sheet', 'claro', `${browserBar('Casa Amaro', 'casaamaro.exemplo')}${SITES.tacho()}`)),

  /* 2.3 Facebook feed: lead ad carousel of a developer and the Meta instant form. */
  /* 3.2 Facebook feed post: one photo of a development, the link bar that holds the tap, then the visit page. */
  fbpost: () => screen('fbpost', scene('post', 'base', 'escuro', LAB.facebookAd({ key: 'incorporadora', text: 'Casas na falésia com a sala voltada para o mar. Agende uma visita ao decorado.',
    media: `<div class="fb-midia" data-hs="1">${pic('salaMar45', { alt: 'Sala de estar com janela para o mar, em luz de fim de tarde.', pos: '50% 50%' })}</div>`,
    after: `<div class="fb-link" data-hs="3"><span><small>ATLANTICA.EXEMPLO</small><b>Visita ao decorado</b></span><span class="fb-link-btn" data-tap="cta">Agendar agora</span></div>`,
    next: { name: 'Página que você segue', time: '5 h', text: 'Feira de artesanato neste fim de semana na praça.', media: pic('cenaCrencas', { pos: '50% 60%' }) } })) + scene('page', 'sheet', 'claro', `${browserBar('Atlântica Incorporadora', 'atlantica.exemplo')}${SITES.falesia()}`)),

  /* 3.3 Facebook video: a restaurant video in portrait with the reserve button that lights up. */
  fbvid: () => screen('fbvid', scene('video', 'base', 'escuro', `<div class="cm-fbv">
      ${pic('prato916', { alt: 'Prato de feijoada servido com farofa e couve.' })}
      <span class="cm-fbv-play" aria-hidden="true">${I('video')}</span>
      <div class="cm-fbv-meta" data-hs="1"><span>${marca('restaurante')}<span><b>casaamaro</b><small>Patrocinado</small></span></span><p>Feijoada completa aos sábados. Mesa para o almoço.</p></div>
      <div class="cm-fbv-cta" data-tap="cta" data-hs="3"><b>Reservar mesa</b>${I('chevron')}</div>
    </div>`) + scene('page', 'sheet', 'claro', `${browserBar('Casa Amaro', 'casaamaro.exemplo')}${SITES.tacho({ variant: 'direto', slot: '12:30', people: '4', area: 'Varanda' })}`)),

  /* 3.4 Facebook ad break: a video pauses for an ad card with a skip button, then the course page. */
  fbbreak: () => screen('fbbreak', scene('video', 'base', 'escuro', `<div class="cm-fbb">
      ${pic('panela916', { alt: 'Feijoada completa em plano fechado.' })}
      <span class="cm-fbb-tag">Vídeo</span></div>`) + scene('ad', 'sheet', 'escuro', `<div class="cm-fbb-ad">
      ${pic('escola916', { alt: 'Fone de ouvido sobre o caderno de anotações.' })}
      <span class="cm-fbb-label">Patrocinado</span>
      <span class="cm-fbb-skip" data-hs="1"><span class="cm-fbb-s1">Pular em 5</span><span class="cm-fbb-s2">Pular</span></span>
      <div class="cm-fbb-cta" data-tap="cta" data-hs="3"><span><b>Speak Up Idiomas</b><small>Aula experimental</small></span>${I('chevron')}</div>
    </div>`) + scene('page', 'sheet', 'claro', `${browserBar('Speak Up', 'speakup.exemplo')}${SITES.sotaque({ variant: 'agenda', pick: 'modalidade' })}`)),

  fbFeed: () => screen('fb', scene('ad', 'base', 'escuro', LAB.facebookAd({ key: 'incorporadora', text: 'Casas na falésia com a sala voltada para o mar. Agende uma visita ao decorado.',
    media: `<div class="cm-fb-carousel" data-hs="2"><div class="cm-track">
      <figure class="cm-fb-card"><span class="cm-fb-img" data-hs="1">${pic('coast', { alt: 'Casa de concreto e madeira na falésia, sobre o mar.', pos: '34% 50%' })}</span><figcaption><span><b>Casa na falésia</b><small>Visita ao decorado</small></span><span class="cm-fb-btn">Agendar agora</span></figcaption></figure>
      <figure class="cm-fb-card"><span class="cm-fb-img">${pic('salaMar11')}</span><figcaption><span><b>Sala voltada para o mar</b><small>Visita ao decorado</small></span><span class="cm-fb-btn">Agendar agora</span></figcaption></figure>
      <figure class="cm-fb-card"><span class="cm-fb-img cm-fb-img--plan">${planta()}</span><figcaption><span><b>Plantas de 3 e 4 quartos</b><small>Visita ao decorado</small></span><span class="cm-fb-btn" data-tap="cta" data-hs="3">Agendar agora</span></figcaption></figure>
    </div></div>`,
    next: { name: 'Página que você segue', time: '5 h', text: 'Feira de artesanato neste fim de semana na praça.', media: pic('cenaCrencas', { pos: '50% 60%' }) } })) +
    scene('form', 'sheet', 'escuro', SITES.metaForm(), 'cm-scene--part', 'claro')),

  /* 2.4 TikTok In-Feed: a tech store, native text, CTA that takes the brand colour, TikTok browser. */
  ttFeed: () => screen('tt', scene('video', 'base', 'escuro', LAB.tiktokAd({ key: 'varejo', caption: 'Um notebook para os dois turnos. #setup #edição', sound: 'Música promocional - pontotech', cta: { text: 'Comprar agora' },
    video: `<div class="cm-shots">
      <figure class="cm-shot" data-shot="1">${pic('nerd', { alt: 'Notebook com a tela acesa numa mesa escura.' })}<p class="cm-tt-text" data-hs="1"><span>Joga à noite</span><span>e edita de dia?</span></p></figure>
      <figure class="cm-shot" data-shot="2">${pic('cenaNerd', { pos: '40% 70%' })}<p class="cm-tt-text"><span>De noite, o jogo.</span><span>De dia, a edição.</span></p></figure></div>` })) +
    scene('page', 'sheet', 'claro', `${browserBar('Ponto Tech', 'pontotech.exemplo')}${SITES.teclaria()}`)),

  /* 2.5 YouTube in-stream: a car dealer before a chosen video, skip after 5 s, panel CTA, test drive page. */
  ytInstream: () => screen('yt', scene('watch', 'base', 'escuro', LAB.youtubeAd({ key: 'automotivo', title: 'Melhores momentos da rodada', meta: '<span>há 2 dias</span><b>…mais</b>', panel: { title: 'Test drive do SUV elétrico', button: 'Agendar' },
    player: `${pic('esportes', { alt: 'SUV elétrico verde carregando no estacionamento de um estádio ao pôr do sol.', pos: '50% 32%' })}<span class="cm-yt-dim"></span>
      <p class="cm-yt-burn" data-hs="1">Saiu do jogo. Quanto de carga sobra?</p>
      <div class="cm-yt-dash" data-hs="2"><small>Carga para a volta</small><span><i></i></span><b>O painel mostra antes de você sair.</b></div>
      <span class="cm-yt-label">Patrocinado · 0:12 ${I('info')}</span><span class="cm-yt-wait">Pular em 4</span><span class="cm-yt-skip">Pular ${I('skip')}</span>
      <span class="cm-yt-adbar"><i data-cx-progress></i></span>` })) +
    scene('page', 'push', 'claro', `${browserBar('Test drive', 'ecodrive.exemplo')}${SITES.ondara()}`)),

  /* 2.6 YouTube Shorts: the app of a language school, an exercise that holds attention, App Store sheet. */
  ytShorts: () => screen('shorts', scene('video', 'base', 'escuro', `<div class="cm-shots"><figure class="cm-shot" data-shot="1">${pic('escola916', { alt: 'Fone de ouvido sobre a mesa de madeira.' })}<p class="cm-ontext" data-hs="1">Pare de traduzir na cabeça.</p></figure></div>
    <span class="cm-shade"></span>
    <div class="cm-quiz" data-hs="2"><small>Complete</small><b>I'm looking forward <span class="cm-blank"><i>to</i></span> it.</b><span class="cm-quiz-ok">${I('check')}Certo</span></div>
    <div class="cm-shorts-top">${I('search')}${I('vdots')}</div>
    <div class="cm-rail cm-rail--yt"><span>${I('thumb')}<small>Gostei</small></span><span>${I('thumb', 'cm-i--flip')}<small>Não gostei</small></span><span>${I('comment')}<small>Comentários</small></span><span>${I('forward')}<small>Compartilhar</small></span><span>${I('remix')}<small>Remixar</small></span><span class="cm-cover cm-cover--sq" style="background-image:url(${IMG.escola45.src})"></span></div>
    <div class="cm-vmeta cm-vmeta--yt"><span class="cm-who">${marca('educacao')}<b>@speakupidiomas</b><small class="cm-pill">Patrocinado</small></span><p>Conversação em inglês, um pouco por dia.</p></div>
    <div class="cm-vcta cm-vcta--yt" data-tap="cta" data-hs="3"><b>Instalar</b></div>
    <div class="cm-vprogress"><i data-cx-progress></i></div>${tabbar(TABS.youtube, 'cm-tabbar--dark')}`) +
    scene('store', 'sheet', 'escuro', `<div class="cm-sheet cm-store"><span class="cm-grabber"></span><div class="cm-store-head">${marca('educacao', 'app')}<span><b>Speak Up</b><small>Conversação todos os dias</small></span><span class="cm-store-get" data-tap="go" data-hs="3"><b>Obter</b><i class="cm-ring"></i><b>Abrir</b></span></div>
      <div class="cm-store-shots"><span><i class="cm-bubble">How was your day?</i><i class="cm-bubble cm-bubble--me">Pretty good, thanks!</i></span><span><small>Uma frase por dia</small><b>I'm looking forward to it.</b><i class="cm-bubble">Mal posso esperar.</i></span></div>
      </div>`, 'cm-scene--part', 'claro')),

  /* 2.7 YouTube live: a creator shows the tech store's notebook, paid promotion notice, pinned link. */
  ytLive: () => screen('ytlive', scene('live', 'base', 'escuro', LAB.youtubeLive({ title: 'Montando o setup de edição ao vivo', meta: '<span>Transmitindo agora</span><span>#publi</span><b>…mais</b>',
    player: `${pic('nerd', { alt: 'Setup do criador: notebook com a tela acesa na mesa.', pos: '50% 19%' })}
      <span class="cm-paid" data-hs="1">${I('tag')}Inclui promoção paga${I('chevron')}</span><span class="cm-onair">Ao vivo</span>
      <span class="cm-lower" data-hs="2"><small>#publi</small><b>Ponto Tech</b><span>O notebook deste setup</span></span>`,
    chat: `<div class="cm-chat"><div class="cm-chat-head"><b>Chat ao vivo</b>${I('vdots')}</div>
      <div class="cm-chat-pin">${I('pin')}<span><b>Canal Exemplo</b> Lista de espera do Notebook Creator 15 branco: <u data-tap="link" data-hs="3">pontotech.exemplo/branco</u></span></div>
      <div class="cm-chat-list"><p><i></i><b>bia.rocha</b> boa noite, canal!</p><p><i></i><b>lucas_dev</b> que setup bonito</p><p><i></i><b>marina.t</b> qual programa de edição você usa?</p><p><i></i><b>jogador1</b> qual é esse notebook?</p><p><i></i><b>edita_noite</b> a tela aguenta bem as cores?</p><p class="cm-chat-more"><i></i><b>ana.cortes</b> vai ter branco?</p><p class="cm-chat-more"><i></i><b>pedro_lima</b> curti o teclado</p></div>
      <span class="cm-chat-input">Diga algo…</span></div>` })) +
    scene('page', 'push', 'claro', `${browserBar('Notebook Creator 15 branco', 'pontotech.exemplo')}${SITES.teclaria({ variant: 'espera' })}`)),

  /* 2.8 LinkedIn: document ad with a lead form of a wealth manager. */
  liFeed: () => screen('li', scene('feed', 'base', 'claro', `<div class="cm-safe"><div class="cm-li-top"><i class="cm-tab-me"></i><span class="cm-li-search">${I('search')}Pesquisar</span>${I('comment')}</div>
    <article class="cm-li-post"><header class="cm-li-head">${marca('financas', 'quadrado')}<span><b>Valore Patrimônio</b><small>Promovido</small></span><span class="cm-li-follow">${I('plus')}Seguir</span></header>
    <p class="cm-li-text" data-hs="1">Empresa e família no mesmo patrimônio? Três sinais de que é hora de separar. <span>…mais</span></p>
    <div class="cm-doc"><div class="cm-doc-bar">${I('doc')}<b>Guia: patrimônio da empresa e da família</b></div><div class="cm-doc-view" data-hs="2"><div class="cm-track">
      <figure class="cm-doc-page cm-doc-page--cover">${pic('negocios', { alt: 'Mesa escura com caneta e cartão, capa do guia.', pos: '50% 100%' })}<figcaption><small>Valore Patrimônio</small><b>Guia: patrimônio da empresa e da família</b></figcaption></figure>
      <figure class="cm-doc-page"><small>1</small><b>Contas que se misturam</b>${skel(4)}</figure>
      <figure class="cm-doc-page"><small>2</small><b>Sucessão sem plano</b>${skel(4)}</figure>
      <figure class="cm-doc-page cm-doc-page--gate">${skel(5)}<span><b>Para continuar lendo, envie suas informações.</b>${btn('Desbloquear', 'cta')}</span></figure>
    </div><span class="cm-doc-count"><i>1</i><i>2</i><i>3</i><i>4</i> de 4</span></div></div>
    <div class="cm-li-actions"><span>${I('thumb')}Gostei</span><span>${I('comment')}Comentar</span><span>${I('repost')}Compartilhar</span><span>${I('send')}Enviar</span></div></article><div class="cm-li-post">${skel(3)}</div></div>${tabbar(TABS.linkedin)}`) +
    scene('form', 'sheet', 'claro', SITES.linkedinForm())),

  /* 2.9 Google Search: a dental clinic answers "dentista perto de mim" with a call. */
  gSearch: () => screen('g', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box" data-hs="1">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed"><span>dentista perto de mim</span></span>${I('close')}${I('mic')}${I('lens')}</div>
    <div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Mapas</span><span>Imagens</span><span>Notícias</span></div>
    <ul class="cm-g-suggest"><li>${I('search')}dentista perto de mim</li><li>${I('search')}dentista perto de mim aberto agora</li><li>${I('search')}dentista perto de mim avaliação</li></ul><div class="cm-g-results"><p class="cm-g-group">Resultado patrocinado</p>
      <div class="cm-g-ad"><div class="cm-g-site">${marca('clinica', 'fav')}<span><b>Vilela Odontologia</b><small>https://www.vilela.exemplo › avaliacao</small></span>${I('vdots')}</div>
      <b class="cm-g-title" data-hs="2">Avaliação com hora marcada | Vilela Odontologia</b>
      <p>Consulta de avaliação para planejar o tratamento com calma. Agende pelo site ou ligue. [RT e CRO]</p>
      <span class="cm-g-links"><span>Agendar avaliação</span><span>Especialidades</span><span>Como chegar</span></span>
      <span class="cm-g-call" data-tap="cta" data-hs="3">${I('phone')}Ligar</span></div>
      <span class="cm-g-hide">Ocultar resultados patrocinados ${I('up')}</span>${skel(4, 'cm-skel--result')}${skel(3, 'cm-skel--result')}</div></div>`) +
    scene('call', 'sheet', 'claro', `<div class="cm-ios-sheet"><span class="cm-ios-group"><small>(11) 0000-0000</small><span data-tap="go" data-hs="3">${I('phone')}Ligar</span></span><span class="cm-ios-cancel">Cancelar</span></div>
      <div class="cm-call"><small>chamando…</small><b data-hs="3">Vilela Odontologia</b><span class="cm-call-keys"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="cm-call-end">${I('phone')}</span></div>`, 'cm-scene--part')),

  /* 2.16 Google Display: a travel agency banner inside an article; the headline rotates as Google combines assets. */
  gDisplay: () => screen('gd', scene('article', 'base', 'claro', `<div class="cm-safe cm-web"><div class="cm-web-host"><b>Portal Exemplo</b>${I('menu')}</div><small class="cm-web-kicker">Viagem</small><b class="cm-web-title">O que ver nas festas de junho no interior</b>${skel(5)}
    <div class="cm-gd-ad"><span class="cm-gd-flag">Anúncio ${I('close')}</span><span class="cm-gd-img" data-hs="1" data-hs-at="tl">${pic('crencas', { alt: 'Rua de pedra com bandeirolas e igreja ao entardecer.', pos: '50% 9%' })}</span>
      <div class="cm-gd-body"><span><b class="cm-gd-h" data-hs="2"><span>Festa do Divino em grupo pequeno</span><span>Guia da cidade e hotel no centro</span></b><small>Destino Certo Viagens</small></span><span class="cm-gd-go" data-tap="cta" data-hs="3">${I('chevron')}</span></div></div>${skel(5)}${skel(4)}</div>${safari('portal.exemplo')}`) +
    scene('page', 'push', 'claro', `${SITES.bandeirola({ variant: 'saida' })}${safari('destinocerto.exemplo')}`, 'cm-scene--web')),

  /* 2.10 SEO: organic result of a developer with sitelinks; the floor plans page trades the PDF for an e-mail. */
  seoOrganic: () => screen('g', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed is-done"><span>casa na falésia à venda</span></span>${I('close')}${I('mic')}${I('lens')}</div>
    <div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Imagens</span><span>Mapas</span><span>Notícias</span></div>
    <div class="cm-g-faded" aria-hidden="true">${skel(3)}</div>
    <div class="cm-g-result cm-g-result--organic"><div class="cm-g-site">${marca('incorporadora', 'fav')}<span><b>Atlântica Incorporadora</b><small>atlantica.exemplo › plantas</small></span>${I('vdots')}</div>
      <div class="cm-g-main"><b class="cm-g-title" data-hs="1">Casas na falésia com vista para o mar</b>${pic('coast', { cls: 'cm-g-thumb', pos: '30% 50%' })}</div>
      <p>Plantas de 3 e 4 quartos, sala voltada para o mar e visita ao decorado com hora marcada.</p>
      <span class="cm-g-list"><span data-tap="link">Plantas${I('chevron')}</span><span>Localização${I('chevron')}</span><span>Agendar visita${I('chevron')}</span></span></div>${skel(3, 'cm-skel--result')}</div>`) +
    scene('page', 'push', 'claro', `<div class="cm-lp" style="--brand:${CLIENTES.incorporadora.cor}"><span class="cm-lp-hero">${pic('salaMar45', { pos: '50% 40%' })}</span><div class="cm-lp-body"><span class="cm-lp-brand">${marca('incorporadora')}<b>Atlântica Incorporadora</b></span><b class="cm-lp-title">Plantas</b>
      <span class="cm-seg" data-hs="2"><span class="cm-seg-3">3 quartos</span><span class="cm-seg-4">4 quartos</span></span>${planta('cm-planta--lp')}${btn('Receber as plantas em PDF', 'pdf')}</div>
      <div class="cm-sheet cm-mail"><span class="cm-grabber"></span><b class="cm-lp-title">Receber as plantas</b>${input('Seu e-mail', 'voce@exemplo.com')}${btn('Enviar', 'send')}</div>
      ${done('Enviamos as plantas para o seu e-mail', 'Plantas de 3 e 4 quartos, em PDF.', '<small class="cm-legal">Imagens ilustrativas. CRECI e registro de incorporação aparecem aqui.</small>')}</div>${safari('atlantica.exemplo')}`, 'cm-scene--web')),

  /* 2.14 ChatGPT: the travel agency card below an answer, separated from it, and the in-app browser. */
  gptAnswer: () => screen('gpt', scene('chat', 'base', 'claro', `<div class="cm-gpt-top"><span class="cm-glass">${I('menu2')}</span><b>ChatGPT</b><span class="cm-glass cm-glass--pill">${I('edit')}${I('dots')}</span></div>
    <div class="cm-gpt-flow"><p class="cm-gpt-user" data-hs="1" data-hs-at="tl">Quero ver uma festa tradicional no interior em junho. Por onde começo?</p>
      <span class="cm-gpt-think sf-activity" aria-hidden="true"><span class="sf-activity-dot"></span><span>Procurando festas tradicionais de junho</span></span>
      <div class="cm-gpt-answer"><p>Se você me disser:</p><ul><li>quantos <b>dias</b> você tem,</li><li>de qual <b>cidade</b> sai,</li><li>se prefere <b>procissão, música ou cavalhadas</b>,</li><li>e se viaja <b>com crianças</b>,</li></ul><p>eu indico as 3 cidades que mais combinam com a sua viagem.</p></div>
      <div class="cm-gpt-actions">${I('copy')}${I('thumb', 'cm-i--flip')}${I('share')}${I('regen')}${I('dots')}<span class="cm-gpt-src"><i>R</i><i>G</i><i>T</i>Fontes</span></div>
      <p class="cm-gpt-user cm-gpt-q2" data-hs="1" data-hs-at="tl">3 dias, saindo de SP, cavalhadas</p>
      <span class="cm-gpt-think cm-gpt-think2 sf-activity" aria-hidden="true"><span class="sf-activity-dot"></span><span>Comparando cidades com cavalhadas</span></span>
      <div class="cm-gpt-answer cm-gpt-a2"><p>Com 3 dias, eu iria para <b>Pirenópolis (GO)</b>: na Festa do Divino tem mascarados pelas ruas e as cavalhadas no fim de semana.</p><ul><li><b>Dia 1:</b> voo até Brasília e 2 horas de carro;</li><li><b>Dia 2:</b> centro histórico e mascarados;</li><li><b>Dia 3:</b> cavalhadas e volta.</li></ul></div>
      <div class="cm-gpt-actions cm-gpt-a2">${I('copy')}${I('thumb', 'cm-i--flip')}${I('share')}${I('regen')}${I('dots')}</div>
      <div class="sf-suggestions cm-gpt-a2" aria-hidden="true"><span class="sf-suggestion">Quando são as cavalhadas?</span><span class="sf-suggestion">Onde ficar em Pirenópolis?</span></div>
      <hr><p class="cm-gpt-lead">Para a sua viagem para ver as cavalhadas, aqui está uma opção para considerar.</p>
      <div class="cm-gpt-ad" data-tap="cta" data-hs="2 3" data-hs-at="tl">${pic('crencas', { cls: 'cm-gpt-ad-img', pos: '50% 8%' })}<span class="cm-gpt-ad-body"><span class="cm-gpt-ad-top">${marca('turismo', 'fav')}<span>Destino Certo Viagens</span><small class="cm-gpt-chip">Anúncio</small>${I('dots')}</span><b>Festas de junho em grupo pequeno</b><small>Roteiros com guia da cidade e hotel no centro histórico. Saiba mais.</small></span></div>
      <span class="cm-gpt-down" aria-hidden="true">${I('up', 'cm-i--flip')}</span></div>
    <div class="cm-gpt-input">${I('plus')}<span class="cm-gpt-ph">Pergunte ao ChatGPT</span><span class="cm-typed cm-gpt-typed"><span>3 dias, saindo de SP, cavalhadas</span></span>${I('mic')}<i class="cm-gpt-wave">${I('wave')}</i><i class="cm-gpt-send" data-tap="gsend">${I('up')}</i></div>`) +
    scene('page', 'sheet', 'claro', `${browserBar('Destino Certo Viagens', 'destinocerto.exemplo', 'share')}${SITES.bandeirola()}`)),

  /* 2.11 Google Maps: promoted square pin and sponsored place sheet of a restaurant, then the route. */
  mapsLocal: () => {
    const area = inner => `<div class="cm-map">${pic('mapa', { cls: 'cm-map-bg' })}<div class="cm-map-area">${inner}</div></div>`;
    const drops = [[86, 150], [178, 118], [130, 360], [300, 420], [60, 290]].map(([x, y]) => `<span class="cm-drop" style="left:${x / 3.6}%;top:${y / 6.4}%">${I('fork')}</span>`).join('');
    return screen('maps', scene('map', 'base', 'claro', `${area(`${drops}<span class="cm-promo cm-promo--left" style="left:${252 / 3.6}%;top:${224 / 6.4}%"><span class="cm-promo-sq" data-hs="1">${I('fork')}</span><span class="cm-promo-text"><b>Casa Amaro</b><small>Feijoada completa aos sábados</small></span></span><span class="cm-me" style="left:${108 / 3.6}%;top:${544 / 6.4}%"></span>`)}
      <div class="cm-maps-search">${I('back')}<span class="cm-typed"><span>feijoada perto de mim</span></span>${I('close')}</div>
      <div class="cm-maps-chips" aria-hidden="true"><span class="is-on">${I('fork')}Restaurantes</span><span>Aberto agora</span><span>Para o almoço</span><span>Mais bem localizados</span></div>
      <div class="cm-place"><span class="cm-grabber"></span>
        <div class="cm-place-row"><span><small class="cm-sp">Patrocinado</small><b>Casa Amaro</b><small>Restaurante · <em>Aberto</em></small></span>${pic('fachada43', { alt: 'Fachada de madeira do restaurante à noite, com flores e mesas na calçada.', pos: '50% 40%' })}</div>
        <div class="cm-place-full"><span class="cm-place-top"><small class="cm-sp">Patrocinado ${I('vdots')}</small><span><i>${I('share')}</i><i>${I('close')}</i></span></span><b class="cm-place-name">Casa Amaro</b><small>Restaurante</small><small><em>Aberto</em> · Fecha às 23:00</small>
          <span class="cm-place-ad" data-hs="2"><b>Feijoada completa aos sábados</b><small>Encomendas e mesa para o almoço.</small><small>casaamaro.exemplo</small><span>Acessar site</span></span>
          <span class="cm-place-chips"><span class="is-primary" data-tap="cta" data-hs="3">${I('route')}Rotas</span><span>${I('calendar')}Reservar</span><span>${I('phone')}Ligar</span><span>${I('share')}Compartilhar</span></span>
          <span class="cm-place-photos">${pic('fachada43', { pos: '50% 40%' })}${pic('prato11')}</span></div></div>`) +
      scene('route', 'fade', 'claro', `${area(`<svg class="cm-route" viewBox="0 0 360 640" preserveAspectRatio="none" aria-hidden="true"><path d="M108,544 L108,464 L180,464 L180,304 L252,304 L252,224" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="M108,544 L108,464 L180,464 L180,304 L252,304 L252,224" fill="none" stroke="#1a73e8" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="cm-promo cm-promo--end" style="left:${252 / 3.6}%;top:${224 / 6.4}%"><span class="cm-promo-sq">${I('fork')}</span></span><span class="cm-me" style="left:${108 / 3.6}%;top:${544 / 6.4}%"></span>`)}
      <div class="cm-route-top"><span class="cm-route-ends"><span><i class="cm-route-a"></i>Seu local</span><span>${I('location')}Casa Amaro</span></span><span class="cm-route-modes"><b>${I('car')}</b>${I('bus')}${I('walk')}</span></div>
      <div class="cm-route-sheet"><span class="cm-grabber"></span><b>De carro</b><small>Pelo caminho indicado no mapa</small>${btn('Iniciar', 'go', '3', 'cm-btn--maps')}</div>
      <div class="cm-route-nav" data-hs="3"><b>Siga pela avenida</b><small>Navegação iniciada até Casa Amaro</small></div>`));
  },

  /* 2.12 WhatsApp click-to-chat: Instagram ad of a dental clinic, app switch, pre-filled message, quick replies. */
  waAd: () => screen('wa', scene('ad', 'base', 'escuro', LAB.feedAd({ key: 'clinica', captionOpen: true,
    media: `<div class="cm-wa-art">${pic('consultorio45', { alt: 'Consultório odontológico claro, com a frase Avaliação com hora marcada.' })}<b data-hs="1">Avaliação com hora marcada</b>${marca('clinica', 'circulo', 'cm-wa-art-mark')}</div>`,
    cta: { text: 'Enviar mensagem pelo WhatsApp', lead: `${logoSvg('whatsapp', { altura: 16, classe: 'cm-wa-glyph' })}${logoSvg('whatsapp', { altura: 16, mono: 'branco', classe: 'cm-wa-glyph cm-wa-glyph--lit' })}` },
    caption: { hs: '2', html: 'Avaliação com hora marcada. <span class="cm-more">mais</span><span class="cm-rest">Conte o que você sente e escolha o horário pela conversa.</span>' } })) +
    scene('chat', 'push', 'claro', `<span class="cm-crumb">${I('back')}Instagram</span><div class="cm-wa-head">${I('back')}${marca('clinica')}<span><b>Vilela Odontologia</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>
      <div class="cm-wa-body"><span class="cm-wa-sys">As mensagens são protegidas com a criptografia de ponta a ponta.</span><span class="cm-wa-day">Hoje</span>
        <div class="cm-wa-out cm-wa-msg1"><span class="cm-wa-quote">${pic('consultorio45')}<span><b>Vilela Odontologia</b><small>Avaliação com hora marcada</small></span></span>Olá! Quero agendar uma avaliação.<small>10:09 ${I('ticks')}</small></div>
        <span class="cm-wa-typing cm-wa-msg2" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wa-msg2 cm-arrive"><em class="cm-wa-auto">Mensagem automática</em>Olá! Aqui é o atendimento da Vilela Odontologia. Como podemos ajudar?<small>10:09</small><span class="cm-wa-listbtn" data-tap="list" data-hs="3">${I('menu')}Ver opções</span></div>
        <div class="cm-wa-out cm-wa-msg3">Avaliação odontológica<small>10:09 ${I('ticks')}</small></div>
        <span class="cm-wa-typing cm-wa-msg3" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wa-msg3 cm-arrive"><em class="cm-wa-auto">Mensagem automática</em>Perfeito. Qual período fica melhor para você?<small>10:09</small></div>
        <span class="cm-wa-replies cm-wa-replies--row cm-wa-msg3 cm-wa-r3 cm-arrive cm-arrive--late"><span data-tap="per">Manhã</span><span>Tarde</span><span>Noite</span></span>
        <div class="cm-wa-out cm-wa-msg4">Manhã<small>10:10 ${I('ticks')}</small></div>
        <span class="cm-wa-typing cm-wa-msg4" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wa-msg4 cm-arrive"><em class="cm-wa-auto">Mensagem automática</em>Tenho estes horários pela manhã:<small>10:10</small></div>
        <span class="cm-wa-replies cm-wa-msg4 cm-wa-r4 cm-arrive cm-arrive--late" data-hs="3"><span data-tap="hor">Qui, 29 de out, 9h</span><span>Sex, 30 de out, 10h30</span><span>Outro dia</span></span>
        <div class="cm-wa-out cm-wa-msg5">Qui, 29 de out, 9h<small>10:10 ${I('ticks')}</small></div>
        <span class="cm-wa-typing cm-wa-msg5" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wa-msg5 cm-arrive cm-wa-confirm" data-hs="3"><b>Avaliação agendada</b><span>Quinta, 29 de outubro, às 9h</span><span>Avaliação odontológica, 30 minutos</span><span>Se precisar remarcar, é só responder aqui.</span><small>10:10</small></div>
        <div class="cm-wa-in cm-wa-msg5 cm-arrive cm-arrive--late cm-wa-loc"><span class="cm-wa-map">${pic('mapa', { pos: '62% 36%' })}<i>${I('location')}</i></span><b>Vilela Odontologia</b><span>Rua Exemplo, 120, Pinheiros</span><small>10:10</small></div></div>
      <div class="cm-wa-sheet" aria-hidden="true"><span class="cm-grabber"></span><p class="cm-wa-sheet-top">${I('close')}<b>Ver opções</b><i></i></p><small>Atendimentos</small>
        <span class="cm-wa-opt cm-wa-opt--pick" data-tap="opt"><span><b>Avaliação odontológica</b><small>Primeira consulta, 30 minutos</small></span><i></i></span>
        <span class="cm-wa-opt"><span><b>Limpeza e prevenção</b><small>45 minutos</small></span><i></i></span>
        <span class="cm-wa-opt"><span><b>Dor ou urgência</b><small>Encaixe no mesmo dia, conforme a agenda</small></span><i></i></span>
        <span class="cm-wa-opt"><span><b>Falar com a recepção</b><small>Horário comercial</small></span><i></i></span>
        <span class="cm-wa-sheet-send" data-tap="lsend">Enviar</span></div>
      <div class="cm-wa-compose"><span class="cm-wa-preview">${pic('consultorio45')}<span><b>Vilela Odontologia</b><small>Avaliação com hora marcada</small></span></span><span class="cm-wa-row">${I('plus')}<span class="cm-wa-field">Olá! Quero agendar uma avaliação.</span><span class="cm-wa-send" data-tap="send" data-hs="3">${I('send')}</span><span class="cm-wa-idle">${I('camera')}${I('mic')}</span></span></div>`)),

  /* 2.13 WhatsApp Business catalog (not an ad): profile, collections, item, message with the item attached. */
  waCatalog: () => screen('wacat', scene('profile', 'base', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span></span>${I('dots')}</div><div class="cm-wa-profile">${marca('restaurante', 'circulo', 'cm-mark--xl')}<b>Casa Amaro</b><small>Conta comercial</small><span class="cm-wa-tools"><span>${I('phone')}Áudio</span><span>${I('video')}Vídeo</span><span>${I('search')}Pesquisar</span></span><small class="cm-wa-cat">Restaurante · Cozinha brasileira</small></div>
    <div class="cm-wa-shelf"><p><b>Catálogo</b><span data-tap="more">Ver tudo ${I('chevron')}</span></p><span class="cm-wa-thumbs" data-hs="1">${pic('panela11')}${pic('escondidinho11')}${pic('pudim11')}</span></div>
    <div class="cm-wa-rows"><span>${I('bell')}Silenciar notificações</span><span>${I('lock')}Criptografia</span></div></div>`) +
    scene('catalog', 'push', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span><b>Catálogo</b><small>Casa Amaro</small></span>${I('share')}</div>
      <div class="cm-wa-coll"><p><b>Encomendas de sábado</b><span>Ver tudo</span></p><ul data-hs="2"><li data-tap="item">${pic('panela11')}<span><b>Feijoada completa para 4</b><small>Carnes separadas, arroz, couve e farofa.</small></span></li><li>${pic('escondidinho11')}<span><b>Escondidinho de carne-seca</b><small>Gratinado na panelinha, para 2.</small></span></li></ul>
      <p><b>Doces</b><span>Ver tudo</span></p><ul><li>${pic('pudim11')}<span><b>Pudim de leite</b><small>Inteiro, feito na casa.</small></span></li></ul></div></div>`) +
    scene('item', 'push', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span></span>${I('share')}</div><span class="cm-wa-photo">${pic('panela11')}</span><div class="cm-wa-item"><b>Feijoada completa para 4</b><p>Carnes separadas, arroz, couve e farofa. Encomenda até sexta.</p><span class="cm-wa-qty"><i>−</i><b>1</b><i>+</i></span>${btn('Adicionar ao carrinho', 'add', '3', 'cm-btn--wa')}<span class="cm-wa-msglink">${I('comment', 'cm-i--inline')}Conversar com a empresa</span></div>
      <span class="cm-wa-cartbar" data-tap="cart">${I('cart')}<b>Ver carrinho</b><small>1 item</small></span></div>`) +
    scene('cart', 'sheet', 'claro', `<div class="cm-sheet cm-wa-cart"><span class="cm-grabber"></span><p class="cm-wa-sheet-top">${I('close')}<b>Carrinho</b><i></i></p><div class="cm-wa-cartline">${pic('panela11')}<span><b>Feijoada completa para 4</b><small>Casa Amaro</small></span><span class="cm-wa-qty cm-wa-qty--sm"><i>−</i><b>1</b><i>+</i></span></div><span class="cm-wa-note">${I('edit', 'cm-i--inline')}Adicionar observação: para sábado</span>${btn('Fazer pedido', 'order', '3', 'cm-btn--wa')}</div>`, 'cm-scene--part') +
    scene('chat', 'push', 'claro', `<div class="cm-wa-head">${I('back')}${marca('restaurante')}<span><b>Casa Amaro</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>
      <div class="cm-wa-body"><span class="cm-wa-day">Hoje</span>
        <div class="cm-wa-out cm-wa-orderout"><span class="cm-wa-orderthumb">${pic('panela11')}<span><b>${I('cart', 'cm-i--inline')}1 item</b><small>Pedido para sábado</small></span></span><span class="cm-wa-orderlink">Ver itens enviados</span><small>10:09 ${I('ticks')}</small></div>
<span class="cm-wa-typing cm-wc1" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wc1 cm-arrive"><em class="cm-wa-auto">Mensagem automática</em>Oi! Aqui é o atendimento do Casa Amaro. Como prefere receber?<small>10:09</small></div>
        <span class="cm-wa-replies cm-wc1 cm-wcg cm-wr1 cm-arrive cm-arrive--late" data-hs="3"><span data-tap="r1">Retirar no balcão</span><span>Entrega</span></span>
        <div class="cm-wa-out cm-wc2">Retirar no balcão<small>10:09 ${I('ticks')}</small></div>
<span class="cm-wa-typing cm-wc2" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wc2 cm-arrive"><em class="cm-wa-auto">Mensagem automática</em>Perfeito. Para qual horário de sábado?<small>10:09</small></div>
        <span class="cm-wa-replies cm-wa-replies--row cm-wc2 cm-wcg cm-wr2 cm-arrive cm-arrive--late"><span>11h</span><span data-tap="r2">12h</span><span>13h</span></span>
        <div class="cm-wa-out cm-wc3">12h<small>10:09 ${I('ticks')}</small></div>
<span class="cm-wa-typing cm-wc3" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wa-order cm-wc3 cm-arrive"><b>Resumo do pedido</b><span>Feijoada completa para 4</span><span>Retirada no balcão, sábado às 12h</span><span class="cm-wa-order-btn cm-wr3" data-tap="ok">Confirmar pedido</span><small>10:09</small></div>
<span class="cm-wa-typing cm-wc4" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="cm-wa-in cm-wc4 cm-arrive"><em class="cm-wa-auto">Mensagem automática</em>Pedido confirmado. Você recebe um lembrete no sábado às 9h.<small>10:09</small></div>
      </div>
      <div class="cm-wa-compose"><span class="cm-wa-row">${I('plus')}<span class="cm-wa-field cm-wa-field--empty"></span>${I('camera')}${I('mic')}</span></div>`)),

  /* 2.15 Publieditorial: a wealth manager's sponsored article in a fictitious magazine, identified before the title. */
  blogArticle: () => screen('blog', scene('article', 'base', 'escuro', LAB.blogArticle({ key: 'financas', site: 'Revista Exemplo', domain: 'revista.exemplo', kicker: 'Finanças da família',
    title: 'Por onde começar a organizar o patrimônio da família', by: 'Redação, em parceria com Valore Patrimônio',
    photo: pic('negocios', { alt: 'Mesa escura com caneta e cartão, imagem de abertura do artigo.', pos: '50% 11%' }),
    body: `<p class="blog-texto">Patrimônio da família e da empresa costumam crescer juntos. Separar os dois evita decisões apressadas.</p>
      <div class="cm-blog-steps" data-hs="2"><b>1. Separe o que é da empresa</b><p class="blog-texto">Contas, bens e despesas em nomes diferentes.</p><b>2. Escreva os objetivos</b><p class="blog-texto">Proteger, transmitir ou investir pedem caminhos diferentes.</p><b>3. Pergunte antes de assinar</b><p class="blog-texto">Cada documento tem consequências para a família.</p></div>`,
    offer: { text: 'Um especialista explica cada decisão antes de você assinar.', button: 'Agendar conversa' },
    tail: `<p class="blog-texto">Na próxima parte: como falar de sucessão com quem vai assumir a empresa.</p><div class="blog-leia"><b>Leia também</b><span>Testamento, doação ou holding: o que muda para a família</span><span>Cinco documentos para guardar num só lugar</span></div>` }), '', 'claro') +
    scene('page', 'push', 'claro', `${SITES.arrimo()}${safari('valore.exemplo')}`, 'cm-scene--web')),
};

/* Front of the peel per channel: the piece of the first placement's client. */
const art = (cliente, img, pos, titulo, alt) => ({ cliente, img, pos, titulo, alt });

export const groups = [
  { id: 'social', label: 'Redes sociais' },
  { id: 'search', label: 'Busca e IA' },
  { id: 'local', label: 'Local e conversa' },
  { id: 'content', label: 'Conteúdo' },
  { id: 'retencao', label: 'Pagamento e retenção' },
];

const P = (fase, rotulo, quadros) => ({ fase, rotulo, quadros });
export const channels = [
  { id: 'instagram', name: 'Instagram', group: 'social', benefit: 'Prender no feed e levar à ação.',
    art: art('educacao', 'escola45', '50% 50%', 'Você entende a série sem legenda?', 'Peça da Speak Up Idiomas, escola de idiomas fictícia: fone de ouvido sobre a mesa e a pergunta Você entende a série sem legenda?'),
    placements: [
      { id: 'feed', label: 'Feed', mock: 'igFeed', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas leva do carrossel à aula experimental.',
        passos: [P('Atenção', 'Pergunta que o aluno reconhece', [0]), P('Retenção', 'Deslizar revela a resposta', [1, 2]), P('Conversão', 'Teste de nível e aula marcada', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12])],
        quadros: [
          { ms: 1300, cena: 'ad', desc: 'Post patrocinado da Speak Up no feed do Instagram: Você entende a série sem legenda?' },
          { ms: 1400, cena: 'ad', estado: 'c2', desc: 'O carrossel desliza: três expressões que a legenda traduz errado.' },
          { ms: 1400, cena: 'ad', estado: 'c3 lit', desc: 'Último cartão: I\'m looking forward to it, mal posso esperar. A barra Inscrever-se agora acende.' },
          { ms: 900, cena: 'ad', estado: 'c3 lit', toque: 'cta', desc: 'Toque em Inscrever-se agora.' },
          { ms: 1700, cena: 'page', toque: 'a', desc: 'O navegador do Instagram abre o site da Speak Up: descubra seu nível e marque uma aula de 30 minutos. Toque em Fazer o teste de nível.' },
          { ms: 1200, cena: 'page', estado: 'w2', desc: 'Teste de nível, pergunta 3 de 3: como se diz mal posso esperar em inglês?' },
          { ms: 1100, cena: 'page', estado: 'w2 q1', toque: 'b', desc: 'Toque em I\'m looking forward to it. A resposta está certa, de nível intermediário.' },
          { ms: 800, cena: 'page', estado: 'w2 q1', toque: 'c', desc: 'Toque em Ver meu resultado.' },
          { ms: 1400, cena: 'page', estado: 'w3', desc: 'Resultado: nível intermediário, B1. Quinta, 29, já escolhida, com horários às 18h, 19h e 20h, online.' },
          { ms: 900, cena: 'page', estado: 'w3 q2', toque: 'd', desc: 'Toque em 19:00.' },
          { ms: 800, cena: 'page', estado: 'w3 q2', toque: 'e', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w4', toque: 'f', desc: 'Nome, e-mail e WhatsApp preenchidos. Toque em Confirmar aula.' },
          { ms: 2000, cena: 'page', estado: 'w5 done', desc: 'Aula marcada: quinta, 29 de outubro, 19h, online, 30 minutos. Lista do que preparar antes da aula.' },
        ] },
      { id: 'reels', label: 'Reels', mock: 'igReels', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante leva do Reels à reserva de mesa.',
        passos: [P('Atenção', 'Feijoada completa no primeiro segundo', [0]), P('Retenção', 'Corte curto segura até a mesa', [1]), P('Conversão', 'Cardápio, horário e reserva', [2, 3, 4, 5, 6, 7, 8, 9, 10])],
        quadros: [
          { ms: 1400, cena: 'video', video: 1, desc: 'Reels patrocinado do Casa Amaro: o prato de feijoada completa e o texto Sábado tem feijoada completa.' },
          { ms: 1800, cena: 'video', estado: 's2 lit', video: 1, desc: 'Corte para o prato servido: Fogo baixo desde cedo. O botão Ver cardápio ganha cor.' },
          { ms: 900, cena: 'video', estado: 's2 lit', video: 1, toque: 'cta', desc: 'Toque em Ver cardápio.' },
          { ms: 1700, cena: 'page', toque: 'a', desc: 'O navegador do Instagram abre o site do Casa Amaro: aberto agora, cardápio de sábado. Toque em Reservar mesa.' },
          { ms: 1200, cena: 'page', estado: 'w2', desc: 'Reserva: sábado, 24, já escolhido, 2 pessoas, salão. Horários do almoço.' },
          { ms: 900, cena: 'page', estado: 'w2 q1', toque: 'b', desc: 'Toque em 13:00.' },
          { ms: 800, cena: 'page', estado: 'w2 q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1200, cena: 'page', estado: 'w3', desc: 'Seus dados: nome e WhatsApp preenchidos. É uma ocasião especial?' },
          { ms: 900, cena: 'page', estado: 'w3 q2', toque: 'd', desc: 'Toque em Aniversário.' },
          { ms: 800, cena: 'page', estado: 'w3 q2', toque: 'e', desc: 'Toque em Confirmar reserva.' },
          { ms: 1900, cena: 'page', estado: 'w4 done', desc: 'Reserva solicitada: sábado, 24 de outubro, 13h, 2 pessoas, aniversário. O restaurante confirma pelo WhatsApp.' },
        ] },
      { id: 'story', label: 'Story', mock: 'igstory', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas leva da história à aula experimental.',
        passos: [P('Atenção', 'Pergunta sobre a foto', [0]), P('Retenção', 'Adesivo de link aparece', [1]), P('Conversão', 'Nível, horário e aula marcada', [2, 3, 4, 5, 6, 7, 8])],
        quadros: [
          { ms: 1300, cena: 'story', desc: 'Story patrocinado da Speak Up: foto da escola e a pergunta Você entende a série sem legenda?' },
          { ms: 1400, cena: 'story', estado: 'lit', desc: 'O adesivo Agendar aula ganha cor no fim da história.' },
          { ms: 900, cena: 'story', estado: 'lit', toque: 'cta', desc: 'Toque no adesivo.' },
          { ms: 1500, cena: 'page', desc: 'O site da Speak Up abre na aula experimental: nível, dia e horário.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em Intermediário.' },
          { ms: 900, cena: 'page', estado: 'q1 q2', toque: 'b', desc: 'Toque em 19:00 de quinta.' },
          { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w2', toque: 'd', desc: 'Dados preenchidos. Toque em Confirmar aula.' },
          { ms: 2000, cena: 'page', estado: 'w3 done', desc: 'Aula marcada: quinta, 29 de outubro, 19h, online.' },
        ] },
      { id: 'live', label: 'Live', mock: 'iglive', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante cozinha ao vivo e leva à reserva.',
        passos: [P('Atenção', 'Selo Ao vivo e a feijoada', [0]), P('Retenção', 'Comentário respondido pela marca', [1]), P('Conversão', 'Sacola, retirada e pedido', [2, 3, 4, 5, 6, 7, 8, 9, 10])],
        quadros: [
          { ms: 1400, cena: 'live', desc: 'Live patrocinada do Casa Amaro: o prato de feijoada completa com o selo Ao vivo.' },
          { ms: 1600, cena: 'live', estado: 'lit', desc: 'Um comentário pergunta o horário do almoço. O botão Ver cardápio ganha cor.' },
          { ms: 900, cena: 'live', estado: 'lit', toque: 'cta', desc: 'Toque em Ver cardápio.' },
          { ms: 1500, cena: 'page', desc: 'O site do Casa Amaro abre na aba Retirada, com o cardápio de sábado.' },
          { ms: 1000, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em adicionar a feijoada completa. A sacola aparece embaixo.' },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Ver sacola.' },
          { ms: 1200, cena: 'page', estado: 'w2', desc: 'Sacola com a feijoada para 2 e as janelas de retirada de sábado.' },
          { ms: 900, cena: 'page', estado: 'w2 q2', toque: 'c', desc: 'Toque em 12:30 a 13:00.' },
          { ms: 800, cena: 'page', estado: 'w2 q2', toque: 'd', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w3', toque: 'e', desc: 'Pagamento na retirada, por Pix ou cartão, e quem retira. Toque em Fazer pedido.' },
          { ms: 2000, cena: 'page', estado: 'w4 done', desc: 'Pedido 0427 recebido, com o acompanhamento: recebido, em preparo e pronto para retirar.' },
        ] },
      { id: 'explorar', label: 'Explorar', mock: 'igexplore', cliente: 'clinica', selo: 'Patrocinado', frase: 'Uma clínica aparece entre fotos de interesse e leva ao horário.',
        passos: [P('Atenção', 'Publicação entre as fotos', [0]), P('Retenção', 'Publicação abre em tela cheia', [1, 2]), P('Conversão', 'Serviço, dia, horário e dados', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12])],
        quadros: [
          { ms: 1300, cena: 'grid', desc: 'Explorar: grade de fotos e uma publicação patrocinada da Vilela Odontologia.' },
          { ms: 1100, cena: 'grid', estado: 'lit', toque: 'ad', desc: 'Toque na publicação patrocinada.' },
          { ms: 1500, cena: 'post', desc: 'A publicação abre em tela cheia, com Patrocinado e o botão Agendar avaliação.' },
          { ms: 900, cena: 'post', estado: 'lit', toque: 'cta', desc: 'Toque em Agendar avaliação.' },
          { ms: 1500, cena: 'page', desc: 'Agendamento online da Vilela, em três etapas: serviço, horário e dados.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em Avaliação odontológica.' },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Ver horários.' },
          { ms: 1100, cena: 'page', estado: 'w2', desc: 'Calendário de outubro com os dias livres marcados.' },
          { ms: 900, cena: 'page', estado: 'w2 q2', toque: 'c', desc: 'Toque em quinta, 29. Os horários do dia aparecem.' },
          { ms: 900, cena: 'page', estado: 'w2 q2 q3', toque: 'd', desc: 'Toque em 09:00.' },
          { ms: 800, cena: 'page', estado: 'w2 q2 q3', toque: 'e', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w3', toque: 'f', desc: 'Dados do paciente preenchidos e lembrete pelo WhatsApp marcado. Toque em Confirmar agendamento.' },
          { ms: 2000, cena: 'page', estado: 'w4 done', desc: 'Avaliação agendada para quinta, 29 de outubro, às 9h, com o endereço no mapa.' },
        ] },
    ] },
  { id: 'facebook', name: 'Facebook', group: 'social', benefit: 'Receber o pedido sem sair do app.',
    art: art('incorporadora', 'coast', '30% 50%', 'Casas na falésia com a sala voltada para o mar.', 'Peça da Atlântica Incorporadora, incorporadora fictícia: casa de concreto e madeira na falésia, sobre o mar.'),
    placements: [
      { id: 'feed', label: 'Feed', mock: 'fbFeed', cliente: 'incorporadora', selo: 'Patrocinado', frase: 'Uma incorporadora recebe o pedido de visita sem sair do Facebook.',
        passos: [P('Atenção', 'Vista do mar no primeiro cartão', [0]), P('Retenção', 'Deslizar mostra sala e planta', [1, 2]), P('Conversão', 'Formulário em três telas', [3, 4, 5, 6, 7, 8, 9])],
        quadros: [
          { ms: 1400, cena: 'ad', desc: 'Anúncio patrocinado da Atlântica Incorporadora no feed do Facebook: casa na falésia e o botão Agendar agora.' },
          { ms: 1400, cena: 'ad', estado: 'c2', desc: 'O carrossel desliza para a sala voltada para o mar.' },
          { ms: 1400, cena: 'ad', estado: 'c3', desc: 'Terceiro cartão: plantas de 3 e 4 quartos.' },
          { ms: 900, cena: 'ad', estado: 'c3', toque: 'cta', desc: 'Toque em Agendar agora.' },
          { ms: 1700, cena: 'form', toque: 'a', desc: 'O formulário instantâneo abre por cima do feed: visita ao decorado da Atlântica Incorporadora. Toque em Continuar.' },
          { ms: 1200, cena: 'form', estado: 'w2', desc: 'Quando prefere visitar? Nome, e-mail e telefone já vêm do perfil.' },
          { ms: 900, cena: 'form', estado: 'w2 q1', toque: 'b', desc: 'Toque em Fim de semana.' },
          { ms: 800, cena: 'form', estado: 'w2 q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1300, cena: 'form', estado: 'w3', toque: 'd', desc: 'Revise suas informações. Toque em Enviar.' },
          { ms: 2100, cena: 'form', estado: 'w4 done', desc: 'Obrigado: recebemos seu pedido de visita. Um corretor combina o horário.' },
        ] },
      { id: 'post', label: 'Post', mock: 'fbpost', cliente: 'incorporadora', selo: 'Patrocinado', frase: 'Uma incorporadora leva a foto da sala à visita agendada.',
        passos: [P('Atenção', 'Sala com vista para o mar', [0]), P('Retenção', 'Legenda e link à mostra', [1]), P('Conversão', 'Tipo de visita, horário e contato', [2, 3, 4, 5, 6, 7, 8, 9])],
        quadros: [
          { ms: 1300, cena: 'post', desc: 'Post patrocinado da Atlântica Incorporadora no feed: a sala voltada para o mar e o texto de convite.' },
          { ms: 1200, cena: 'post', estado: 'lit', desc: 'O botão Agendar agora ganha cor na barra do link.' },
          { ms: 900, cena: 'post', estado: 'lit', toque: 'cta', desc: 'Toque em Agendar agora.' },
          { ms: 1900, cena: 'page', toque: 'a', desc: 'O site da Atlântica Incorporadora abre na galeria do decorado: 3 e 4 quartos, sala voltada para o mar. Toque em Agendar visita.' },
          { ms: 1100, cena: 'page', estado: 'w2', desc: 'Como você quer conhecer: no decorado ou por vídeo.' },
          { ms: 900, cena: 'page', estado: 'w2 q1', toque: 'b', desc: 'Toque em No decorado.' },
          { ms: 900, cena: 'page', estado: 'w2 q1 q2', toque: 'c', desc: 'Toque em 11:30 de sábado.' },
          { ms: 800, cena: 'page', estado: 'w2 q1 q2', toque: 'd', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w3', toque: 'e', desc: 'Contato preenchido e interesse em 4 quartos. Toque em Confirmar visita.' },
          { ms: 2000, cena: 'page', estado: 'w4 done', desc: 'Visita agendada: sábado, 24 de outubro, 11h30, no decorado, com o endereço no mapa.' },
        ] },
      { id: 'video', label: 'Vídeo', mock: 'fbvid', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante leva do vídeo à reserva de mesa.',
        passos: [P('Atenção', 'Feijoada no primeiro quadro', [0]), P('Retenção', 'Convite antes do fim do vídeo', [1]), P('Conversão', 'Reserva direto no horário', [2, 3, 4, 5, 6, 7])],
        quadros: [
          { ms: 1500, cena: 'video', desc: 'Vídeo patrocinado do Casa Amaro: o prato de feijoada e o texto Feijoada completa aos sábados.' },
          { ms: 1800, cena: 'video', estado: 'lit', desc: 'No fim do vídeo, o botão Reservar mesa ganha cor.' },
          { ms: 900, cena: 'video', estado: 'lit', toque: 'cta', desc: 'Toque em Reservar mesa.' },
          { ms: 1500, cena: 'page', desc: 'O site do Casa Amaro abre direto na reserva: sábado, 4 pessoas, varanda.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em 12:30.' },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w2', toque: 'e', desc: 'Nome e WhatsApp preenchidos. Toque em Confirmar reserva.' },
          { ms: 1900, cena: 'page', estado: 'w3 done', desc: 'Reserva solicitada: sábado, 24 de outubro, 12h30, 4 pessoas, na varanda.' },
        ] },
      { id: 'breaks', label: 'Ad breaks', mock: 'fbbreak', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas entra na pausa do vídeo e leva à aula.',
        passos: [P('Atenção', 'Vídeo começa e a pausa aparece', [0]), P('Retenção', 'Anúncio com pular em 5 segundos', [1, 2]), P('Conversão', 'Aula na unidade em três toques', [3, 4, 5, 6, 7, 8, 9])],
        quadros: [
          { ms: 1300, cena: 'video', desc: 'O vídeo do Casa Amaro começa; a pausa do anúncio chega com o selo Patrocinado.' },
          { ms: 1500, cena: 'ad', desc: 'Anúncio da Speak Up na pausa, com o botão Pular em 5 segundos.' },
          { ms: 1500, cena: 'ad', estado: 'skip', desc: 'Depois de cinco segundos, o botão vira Pular.' },
          { ms: 900, cena: 'ad', estado: 'skip lit', toque: 'cta', desc: 'O cartão Aula experimental acende. Toque nele.' },
          { ms: 1500, cena: 'page', desc: 'O site da Speak Up abre na aula experimental: nível, dia, horário e onde fazer a aula.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em Na unidade.' },
          { ms: 900, cena: 'page', estado: 'q1 q2', toque: 'b', desc: 'Toque em 19:00 de quinta.' },
          { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w2', toque: 'd', desc: 'Dados preenchidos. Toque em Confirmar aula.' },
          { ms: 2000, cena: 'page', estado: 'w3 done', desc: 'Aula marcada na unidade: quinta, 29 de outubro, 19h.' },
        ] },
    ] },
  { id: 'tiktok', name: 'TikTok', group: 'social', benefit: 'Do vídeo ao carrinho em um toque.',
    art: art('varejo', 'nerd', '50% 28%', 'Joga à noite e edita de dia?', 'Peça da Ponto Tech, loja de tecnologia fictícia: notebook com a tela acesa numa mesa escura.'),
    placements: [
      { id: 'infeed', label: 'In-Feed', mock: 'ttFeed', cliente: 'varejo', selo: 'Patrocinado', frase: 'Uma loja de tecnologia leva do vídeo ao carrinho.',
        passos: [P('Atenção', 'Pergunta nativa no primeiro segundo', [0]), P('Retenção', 'Corte mostra os dois usos', [1]), P('Conversão', 'Produto, carrinho e Pix', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11])],
        quadros: [
          { ms: 1400, cena: 'video', video: 1, desc: 'Vídeo patrocinado da Ponto Tech no Para você do TikTok: Joga à noite e edita de dia?' },
          { ms: 1900, cena: 'video', estado: 's2 lit', video: 1, desc: 'Corte para a tela: De noite, o jogo. De dia, a edição. O botão Comprar agora ganha cor.' },
          { ms: 900, cena: 'video', estado: 's2 lit', video: 1, toque: 'cta', desc: 'Toque em Comprar agora.' },
          { ms: 1500, cena: 'page', desc: 'O navegador do TikTok abre a página do Notebook Creator 15: memória, cor e entrega no CEP.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em 32 GB.' },
          { ms: 1500, cena: 'page', estado: 'q1 q2', toque: 'b', desc: 'Toque em Adicionar ao carrinho. O botão enche, vira No carrinho, e o contador do carrinho sobe para 1.' },
          { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque no carrinho.' },
          { ms: 1500, cena: 'page', estado: 'w2 q2', toque: 'd', desc: 'Carrinho: Notebook Creator 15, 32 GB, grafite, entrega padrão. Toque em Finalizar compra.' },
          { ms: 1100, cena: 'page', estado: 'w3 q2', desc: 'Pagamento: endereço já preenchido; Pix, cartão ou boleto.' },
          { ms: 900, cena: 'page', estado: 'w3 q2 q3', toque: 'e', desc: 'Toque em Pix.' },
          { ms: 800, cena: 'page', estado: 'w3 q2 q3', toque: 'f', desc: 'Toque em Finalizar pedido.' },
          { ms: 2000, cena: 'page', estado: 'w4 q2 done', desc: 'Pedido 10482 feito, com o Pix copia e cola e o acompanhamento até o envio.' },
        ] },
    ] },
  { id: 'youtube', name: 'YouTube', group: 'social', benefit: 'Ganhar os primeiros segundos.',
    art: art('automotivo', 'esportes', '50% 58%', 'Saiu do jogo. Quanto de carga sobra?', 'Peça da EcoDrive Elétricos, concessionária fictícia: SUV elétrico verde carregando no estacionamento do estádio ao pôr do sol.'),
    placements: [
      { id: 'instream', label: 'Anúncio no vídeo', mock: 'ytInstream', cliente: 'automotivo', selo: 'Patrocinado', frase: 'Uma concessionária leva do anúncio ao test drive.',
        passos: [P('Atenção', 'Mensagem antes do Pular', [0]), P('Retenção', 'Painel responde à dúvida', [1]), P('Conversão', 'Versão, loja e horário', [2, 3, 4, 5, 6, 7, 8, 9])],
        quadros: [
          { ms: 1500, cena: 'watch', video: 1, desc: 'Anúncio patrocinado da EcoDrive antes de um vídeo no YouTube: Saiu do jogo. Quanto de carga sobra?' },
          { ms: 2000, cena: 'watch', estado: 's2', video: 1, desc: 'O painel do carro mostra a carga para a volta. O botão Pular aparece, e o vídeo continua.' },
          { ms: 900, cena: 'watch', estado: 's2', video: 1, toque: 'cta', desc: 'Toque em Agendar, no painel abaixo do vídeo.' },
          { ms: 1400, cena: 'page', desc: 'A página de test drive da EcoDrive abre: qual versão você quer dirigir?' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em EcoDrive S.' },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Escolher loja.' },
          { ms: 1300, cena: 'page', estado: 'w2 q2', toque: 'c', desc: 'Toque em EcoDrive Pinheiros, a 2,1 km. Sábado de manhã já escolhido.' },
          { ms: 800, cena: 'page', estado: 'w2 q2', toque: 'd', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w3', toque: 'e', desc: 'Nome, WhatsApp e carteira de motorista. Toque em Solicitar test drive.' },
          { ms: 2000, cena: 'page', estado: 'w4 done', desc: 'Pedido enviado: EcoDrive S, sábado de manhã, na loja de Pinheiros.' },
        ] },
      { id: 'shorts', label: 'Shorts', mock: 'ytShorts', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas leva do Shorts ao app instalado.',
        passos: [P('Atenção', 'Frase curta antes da marca', [0]), P('Retenção', 'Exercício segura até a resposta', [1, 2]), P('Conversão', 'Instalar sem sair do vídeo', [3, 4, 5, 6])],
        quadros: [
          { ms: 1400, cena: 'video', video: 1, desc: 'Shorts patrocinado da Speak Up: Pare de traduzir na cabeça.' },
          { ms: 1200, cena: 'video', estado: 'q', video: 1, desc: 'Exercício na tela: complete I\'m looking forward, lacuna, it.' },
          { ms: 1100, cena: 'video', estado: 'q ok lit', video: 1, desc: 'A resposta aparece: to. Certo. O botão Instalar fica branco.' },
          { ms: 1000, cena: 'video', estado: 'q ok lit', video: 1, toque: 'cta', desc: 'Toque em Instalar.' },
          { ms: 1500, cena: 'store', toque: 'go', desc: 'A folha da loja de apps abre com Speak Up. Toque em Obter.' },
          { ms: 900, cena: 'store', estado: 'load', desc: 'O app está sendo instalado.' },
          { ms: 1700, cena: 'store', estado: 'done', desc: 'App instalado: o botão mostra Abrir.' },
        ] },
      { id: 'live', label: 'Live', mock: 'ytLive', cliente: 'varejo', selo: 'Inclui promoção paga', frase: 'Uma marca de tecnologia entra na live com publi identificada.',
        passos: [P('Atenção', 'Aviso de publi logo no começo', [0]), P('Retenção', 'Criador mostra o setup em uso', [1]), P('Conversão', 'Link fixado leva à lista', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'live', estado: 'paid', desc: 'Live de um criador no YouTube com o aviso Inclui promoção paga.' },
          { ms: 1800, cena: 'live', estado: 's2', desc: 'Cartela #publi Ponto Tech: o notebook deste setup. O chat continua.' },
          { ms: 1400, cena: 'live', estado: 's2 s3', toque: 'link', desc: 'Mensagem fixada do criador com a lista de espera. Toque no link.' },
          { ms: 1800, cena: 'page', toque: 'a', desc: 'A página do Notebook Creator 15 branco abre: lista de espera, com o e-mail preenchido. Toque em Quero ser avisado.' },
          { ms: 2000, cena: 'page', estado: 'w2 done', desc: 'Você está na lista e recebe só o aviso de chegada.' },
        ] },
    ] },
  { id: 'linkedin', name: 'LinkedIn', group: 'social', benefit: 'Falar com quem decide.',
    art: art('financas', 'negocios', '50% 100%', 'Guia: patrimônio da empresa e da família', 'Peça da Valore Patrimônio, gestora de patrimônio fictícia: mesa escura com caneta e cartão, capa do guia.'),
    placements: [
      { id: 'feed', label: 'Documento', mock: 'liFeed', cliente: 'financas', selo: 'Promovido', frase: 'Uma gestora entrega o guia em troca do contato.',
        passos: [P('Atenção', 'Problema do sócio na primeira frase', [0]), P('Retenção', 'Páginas de amostra no feed', [1, 2]), P('Conversão', 'Dados do perfil, revisão e PDF', [3, 4, 5, 6])],
        quadros: [
          { ms: 1400, cena: 'feed', desc: 'Post promovido da Valore Patrimônio no LinkedIn: Empresa e família no mesmo patrimônio?' },
          { ms: 1300, cena: 'feed', estado: 'p2', desc: 'O documento passa para a página 1: contas que se misturam.' },
          { ms: 1300, cena: 'feed', estado: 'p3', desc: 'Página 2: sucessão sem plano.' },
          { ms: 1300, cena: 'feed', estado: 'p4', toque: 'cta', desc: 'Para continuar lendo, envie suas informações. Toque em Desbloquear.' },
          { ms: 1600, cena: 'form', toque: 'a', desc: 'O formulário do LinkedIn abre com nome, e-mail, cargo e empresa do perfil. Toque em Avançar.' },
          { ms: 1400, cena: 'form', estado: 'w2', toque: 'b', desc: 'Revise suas informações. Toque em Enviar.' },
          { ms: 2000, cena: 'form', estado: 'w3 done', desc: 'Obrigado, Marina. O guia completo em PDF está liberado.' },
        ] },
    ] },
  { id: 'google', name: 'Google Ads', group: 'search', benefit: 'Responder a quem já procura.',
    art: art('clinica', 'consultorio45', '50% 50%', 'Avaliação com hora marcada', 'Peça da Vilela Odontologia, clínica odontológica fictícia: consultório claro com cadeira e janela.'),
    placements: [
      { id: 'search', label: 'Pesquisa', mock: 'gSearch', cliente: 'clinica', selo: 'Resultado patrocinado', frase: 'Uma clínica responde à busca com uma ligação.',
        passos: [P('Atenção', 'Busca já diz a intenção', [0]), P('Retenção', 'Título responde à busca', [1]), P('Conversão', 'Ligar com um toque', [2, 3, 4])],
        quadros: [
          { ms: 1500, cena: 'serp', estado: 'typing', desc: 'Busca no Google: dentista perto de mim.' },
          { ms: 1900, cena: 'serp', estado: 'r', desc: 'Resultado patrocinado da Vilela Odontologia: Avaliação com hora marcada, com sitelinks e o botão Ligar.' },
          { ms: 1000, cena: 'serp', estado: 'r', toque: 'cta', desc: 'Toque em Ligar.' },
          { ms: 1400, cena: 'call', toque: 'go', desc: 'A folha do iPhone pergunta se quer ligar. Toque em Ligar.' },
          { ms: 2000, cena: 'call', estado: 'done', desc: 'Chamando Vilela Odontologia.' },
        ] },
      { id: 'display', label: 'Display', mock: 'gDisplay', cliente: 'turismo', selo: 'Anúncio', frase: 'Uma agência lembra quem já leu sobre o destino.',
        passos: [P('Atenção', 'Banner no assunto da matéria', [0]), P('Retenção', 'Título muda, oferta continua', [1]), P('Conversão', 'Saída escolhida, pré-reserva sem pagar', [2, 3, 4, 5, 6, 7])],
        quadros: [
          { ms: 1500, cena: 'article', desc: 'Anúncio da Destino Certo Viagens numa matéria sobre festas de junho: Festa do Divino em grupo pequeno.' },
          { ms: 1700, cena: 'article', estado: 's2', desc: 'O título do anúncio muda: guia da cidade e hotel no centro.' },
          { ms: 900, cena: 'article', estado: 's2', toque: 'cta', desc: 'Toque na seta do anúncio.' },
          { ms: 1500, cena: 'page', desc: 'A página da agência abre no Safari: Festa do Divino em grupo pequeno, 4 dias, até 12 pessoas.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque na saída de 18 a 21 de junho.' },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Garantir minha vaga.' },
          { ms: 1400, cena: 'page', estado: 'w2', toque: 'c', desc: 'Dados preenchidos, sem pagamento agora. Toque em Enviar pré-reserva.' },
          { ms: 2000, cena: 'page', estado: 'w3 done', desc: 'Pré-reserva recebida, com os próximos passos: confirmação pelo WhatsApp e sinal só depois.' },
        ] },
    ] },
  { id: 'seo', name: 'SEO', group: 'search', benefit: 'Ser encontrado sem pagar pelo clique.',
    art: art('incorporadora', 'salaMar45', '50% 50%', 'Casas na falésia com vista para o mar', 'Peça da Atlântica Incorporadora, incorporadora fictícia: varanda e sala da casa na falésia, com mata ao redor.'),
    placements: [
      { id: 'organic', label: 'Orgânico', mock: 'seoOrganic', cliente: 'incorporadora', selo: 'Orgânico, sem anúncio', frase: 'Uma incorporadora aparece na busca sem pagar pelo clique.',
        passos: [P('Atenção', 'Título com o que foi buscado', [0]), P('Retenção', 'Plantas que dá para comparar', [1, 2, 3]), P('Conversão', 'PDF em troca do e-mail', [4, 5, 6])],
        quadros: [
          { ms: 1400, cena: 'serp', desc: 'Resultado orgânico da Atlântica Incorporadora para a busca casa na falésia à venda, sem rótulo de anúncio.' },
          { ms: 900, cena: 'serp', toque: 'link', desc: 'Toque no atalho Plantas.' },
          { ms: 1300, cena: 'page', desc: 'A página de plantas abre com 3 quartos.' },
          { ms: 1200, cena: 'page', estado: 'p4', desc: 'A planta muda para 4 quartos.' },
          { ms: 1000, cena: 'page', estado: 'p4', toque: 'pdf', desc: 'Toque em Receber as plantas em PDF.' },
          { ms: 1400, cena: 'page', estado: 'p4 mail', toque: 'send', desc: 'O e-mail já está preenchido. Toque em Enviar.' },
          { ms: 1800, cena: 'page', estado: 'p4 done', desc: 'Enviamos as plantas para o seu e-mail.' },
        ] },
    ] },
  { id: 'chatgpt', name: 'ChatGPT', group: 'search', benefit: 'Aparecer depois da resposta.',
    art: art('turismo', 'crencas', '50% 22%', 'Festas tradicionais em grupo pequeno', 'Peça da Destino Certo Viagens, agência de viagens fictícia: rua de pedra com bandeirolas e igreja ao entardecer.'),
    placements: [
      { id: 'answer', label: 'Resposta', mock: 'gptAnswer', cliente: 'turismo', selo: 'Anúncio', frase: 'Uma agência aparece depois da resposta, separada dela.',
        passos: [P('Atenção', 'Conversa de quem planeja a viagem', [0, 1, 2, 3, 4, 5]), P('Retenção', 'Opção logo abaixo da resposta', [6]), P('Conversão', 'Roteiro montado e consultor', [7, 8, 9, 10, 11, 12, 13, 14])],
        quadros: [
          { ms: 1100, cena: 'chat', desc: 'Conversa no ChatGPT: quero ver uma festa tradicional no interior em junho. O ChatGPT começa a responder.' },
          { ms: 1700, cena: 'chat', estado: 's1', desc: 'A resposta pede dias, cidade de saída, tipo de festa e se a viagem é com crianças.' },
          { ms: 1500, cena: 'chat', estado: 's1 ty', desc: 'Você responde no campo: 3 dias, saindo de SP, cavalhadas.' },
          { ms: 700, cena: 'chat', estado: 's1 ty', toque: 'gsend', desc: 'Toque em enviar.' },
          { ms: 1100, cena: 'chat', estado: 's1 s3', desc: 'A pergunta sobe para o alto da tela e o ChatGPT pensa.' },
          { ms: 1900, cena: 'chat', estado: 's1 s3 s4', desc: 'A resposta indica Pirenópolis, com mascarados e cavalhadas, e um roteiro de 3 dias.' },
          { ms: 1900, cena: 'chat', estado: 's1 s3 s4 s2', desc: 'Depois de um divisor, uma frase cinza apresenta a opção e o cartão com a etiqueta Anúncio: Destino Certo Viagens, separado da resposta.' },
          { ms: 900, cena: 'chat', estado: 's1 s3 s4 s2', toque: 'cta', desc: 'Toque no cartão do anúncio.' },
          { ms: 1400, cena: 'page', desc: 'O navegador do ChatGPT abre Monte seu roteiro, da Destino Certo: quantos dias você tem?' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em 3 dias.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'b', desc: 'Saindo de São Paulo, viagem de casal. Toque em Continuar.' },
          { ms: 1300, cena: 'page', estado: 'w2 q2', toque: 'c', desc: 'O que você quer ver: mascarados já marcado. Toque em Cavalhadas.' },
          { ms: 800, cena: 'page', estado: 'w2 q2', toque: 'd', desc: 'Toque em Gerar roteiro.' },
          { ms: 1500, cena: 'page', estado: 'w3', desc: 'Roteiro sugerido: 3 dias em Pirenópolis, com mascarados e cavalhadas e hotel no centro histórico.' },
          { ms: 2000, cena: 'page', estado: 'w3 q3 done', toque: 'e', desc: 'Toque em Falar com um consultor. Um consultor vai chamar no WhatsApp.' },
        ] },
    ] },
  { id: 'maps', name: 'Google Maps', group: 'local', benefit: 'Ser a escolha no caminho.',
    art: art('restaurante', 'fachada45', '50% 50%', 'Feijoada completa aos sábados', 'Peça do Casa Amaro, restaurante fictício: fachada de madeira à noite, com flores e mesas na calçada.'),
    placements: [
      { id: 'local', label: 'Local', mock: 'mapsLocal', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante aparece no mapa e traça a rota.',
        passos: [P('Atenção', 'Pin destacado no caminho', [0, 1]), P('Retenção', 'Ficha mostra prato e horário', [2]), P('Conversão', 'Rota traçada com um toque', [3, 4, 5])],
        quadros: [
          { ms: 1300, cena: 'map', estado: 'typing', desc: 'Busca no Google Maps: feijoada perto de mim.' },
          { ms: 1500, cena: 'map', desc: 'Busca feijoada perto de mim no Google Maps: alfinete quadrado do Casa Amaro e o resultado Patrocinado.' },
          { ms: 1900, cena: 'map', estado: 's2', desc: 'A ficha patrocinada sobe: restaurante aberto, fecha às 23h, feijoada completa aos sábados.' },
          { ms: 1000, cena: 'map', estado: 's2', toque: 'cta', desc: 'Toque em Rotas.' },
          { ms: 1700, cena: 'route', toque: 'go', desc: 'A rota de carro aparece no mapa. Toque em Iniciar.' },
          { ms: 1800, cena: 'route', estado: 'done', desc: 'Navegação iniciada até o Casa Amaro.' },
        ] },
    ] },
  { id: 'whatsapp', name: 'WhatsApp Business', group: 'local', benefit: 'Transformar interesse em conversa.',
    art: art('clinica', 'recepcao45', '50% 50%', 'Conte o que sente e escolha o horário', 'Peça da Vilela Odontologia, clínica odontológica fictícia: recepção com parede terracota, sofá e plantas.'),
    placements: [
      { id: 'ctwa', label: 'Clique para conversar', mock: 'waAd', cliente: 'clinica', selo: 'Patrocinado', frase: 'Uma clínica começa o agendamento numa conversa.',
        passos: [P('Atenção', 'Hora marcada na própria imagem', [0]), P('Retenção', 'Legenda convida a contar mais', [1]), P('Conversão', 'Menu, período, horário e endereço', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])],
        quadros: [
          { ms: 1400, cena: 'ad', desc: 'Anúncio patrocinado da Vilela Odontologia no Instagram: Avaliação com hora marcada.' },
          { ms: 1700, cena: 'ad', estado: 'open lit', desc: 'A legenda abre: conte o que você sente e escolha o horário pela conversa. A barra Enviar mensagem pelo WhatsApp acende.' },
          { ms: 900, cena: 'ad', estado: 'open lit', toque: 'cta', desc: 'Toque em Enviar mensagem pelo WhatsApp.' },
          { ms: 1500, cena: 'chat', toque: 'send', desc: 'O WhatsApp abre a conversa com a mensagem pronta e a prévia do anúncio: Olá! Quero agendar uma avaliação. Toque em enviar.' },
          { ms: 1700, cena: 'chat', estado: 'm2', desc: 'A clínica digita. A mensagem automática pergunta como pode ajudar, com o botão Ver opções.' },
          { ms: 800, cena: 'chat', estado: 'm2', toque: 'list', desc: 'Toque em Ver opções.' },
          { ms: 1100, cena: 'chat', estado: 'm2 ls', desc: 'A lista de atendimentos abre: avaliação, limpeza, dor ou urgência, recepção.' },
          { ms: 900, cena: 'chat', estado: 'm2 ls lp', toque: 'opt', desc: 'Toque em Avaliação odontológica.' },
          { ms: 800, cena: 'chat', estado: 'm2 ls lp', toque: 'lsend', desc: 'Toque em Enviar.' },
          { ms: 1700, cena: 'chat', estado: 'm2 m3', desc: 'A escolha vira mensagem. A clínica digita e pergunta o período: manhã, tarde ou noite.' },
          { ms: 800, cena: 'chat', estado: 'm2 m3', toque: 'per', desc: 'Toque em Manhã.' },
          { ms: 1700, cena: 'chat', estado: 'm2 m3 m4', desc: 'Horários da manhã: quinta, 29, às 9h; sexta, 30, às 10h30; ou outro dia.' },
          { ms: 800, cena: 'chat', estado: 'm2 m3 m4', toque: 'hor', desc: 'Toque em quinta, 29 de outubro, 9h.' },
          { ms: 2400, cena: 'chat', estado: 'm2 m3 m4 m5', desc: 'Avaliação agendada para quinta, 29, às 9h, e a localização da clínica na própria conversa.' },
        ] },
      { id: 'catalog', label: 'Catálogo', mock: 'waCatalog', cliente: 'restaurante', selo: 'Catálogo, não é anúncio', frase: 'Um restaurante recebe a encomenda pelo catálogo e fecha o pedido no atendimento automático.',
        passos: [P('Atenção', 'Vitrine dentro do perfil', [0, 1]), P('Retenção', 'Itens organizados por ocasião', [2, 3]), P('Conversão', 'Carrinho, pedido e atendimento automático', [4, 5, 6, 7, 8, 9, 10, 11, 12, 13])],
        quadros: [
          { ms: 1400, cena: 'profile', desc: 'Perfil comercial do Casa Amaro no WhatsApp, com a faixa Catálogo.' },
          { ms: 900, cena: 'profile', toque: 'more', desc: 'Toque em Ver tudo.' },
          { ms: 1500, cena: 'catalog', toque: 'item', desc: 'Catálogo com as coleções Encomendas de sábado e Doces. Toque em Feijoada completa para 4.' },
          { ms: 1400, cena: 'item', toque: 'add', desc: 'Página do item, sem preço, com quantidade. Toque em Adicionar ao carrinho.' },
          { ms: 1000, cena: 'item', estado: 'ct', toque: 'cart', desc: 'A barra Ver carrinho, 1 item, aparece embaixo. Toque nela.' },
          { ms: 1400, cena: 'cart', toque: 'order', desc: 'Carrinho com a feijoada e a observação para sábado. Toque em Fazer pedido.' },
          { ms: 1300, cena: 'chat', desc: 'O pedido chega na conversa como uma mensagem de carrinho: 1 item, pedido para sábado.' },
          { ms: 1700, cena: 'chat', estado: 'k1', desc: 'O atendimento automático digita: como prefere receber? Opções Retirar no balcão e Entrega.' },
          { ms: 800, cena: 'chat', estado: 'k1', toque: 'r1', desc: 'Toque em Retirar no balcão.' },
          { ms: 1700, cena: 'chat', estado: 'k1 k2', desc: 'A automação digita e pergunta o horário de sábado: 11h, 12h ou 13h.' },
          { ms: 800, cena: 'chat', estado: 'k1 k2', toque: 'r2', desc: 'Toque em 12h.' },
          { ms: 1800, cena: 'chat', estado: 'k1 k2 k3', desc: 'Resumo do pedido: feijoada para 4, retirada no balcão sábado às 12h, com o botão Confirmar pedido.' },
          { ms: 800, cena: 'chat', estado: 'k1 k2 k3', toque: 'ok', desc: 'Toque em Confirmar pedido.' },
          { ms: 2200, cena: 'chat', estado: 'k1 k2 k3 k4', desc: 'Pedido confirmado, com lembrete no sábado às 9h.' },
        ] },
    ] },
  { id: 'blog', name: 'Publieditorial', group: 'content', benefit: 'Explicar antes de vender, sempre identificado.',
    art: art('financas', 'negocios', '50% 100%', 'Por onde começar a organizar o patrimônio da família', 'Peça da Valore Patrimônio, gestora de patrimônio fictícia: mesa escura com caneta e cartão.'),
    placements: [
      { id: 'article', label: 'Artigo', mock: 'blogArticle', cliente: 'financas', selo: 'Conteúdo patrocinado', frase: 'Uma gestora explica antes de vender, sempre identificada.',
        passos: [P('Atenção', 'Aviso de patrocínio antes do título', [0]), P('Retenção', 'Leitura útil, marca no fim', [1]), P('Conversão', 'Dia, horário e assunto da conversa', [2, 3, 4, 5, 6, 7, 8, 9])],
        quadros: [
          { ms: 1500, cena: 'article', desc: 'Artigo na Revista Exemplo com o aviso Conteúdo patrocinado por Valore Patrimônio acima do título.' },
          { ms: 1900, cena: 'article', estado: 's2', desc: 'A leitura passa pelos três passos: separe o que é da empresa, escreva os objetivos, pergunte antes de assinar.' },
          { ms: 1400, cena: 'article', estado: 's3', toque: 'cta', desc: 'Bloco Oferecido por Valore Patrimônio. Toque em Agendar conversa.' },
          { ms: 1400, cena: 'page', desc: 'A agenda da Valore abre: conversa de 30 minutos por vídeo, com os dias livres de outubro.' },
          { ms: 1000, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em terça, 27. Os horários do dia aparecem.' },
          { ms: 900, cena: 'page', estado: 'q1 q2', toque: 'b', desc: 'Toque em 10:00.' },
          { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque em Próximo.' },
          { ms: 1300, cena: 'page', estado: 'w2 q3', toque: 'd', desc: 'Nome e e-mail preenchidos. Toque em Separar patrimônio.' },
          { ms: 800, cena: 'page', estado: 'w2 q3', toque: 'e', desc: 'Toque em Agendar.' },
          { ms: 2000, cena: 'page', estado: 'w3 done', desc: 'Conversa agendada: terça, 27 de outubro, 10h, 30 minutos, por vídeo.' },
        ] },
    ] },
];
/* Deep automation flows (automation-flows.js): new placements in WhatsApp and
   Instagram and five channels (Telegram, RCS, Voz com IA, Pix Automático, E-mail),
   placed before the publieditorial. */
const AUTO = makeAutomations({ I, pic, marca, esc, scene, screen, logoSvg, LAB, SITES, CLIENTES, P, browserBar, btn, art, skel });
Object.assign(mocks, AUTO.mocks);
for (const [id, list] of Object.entries(AUTO.extra)) channels.find(channel => channel.id === id).placements.push(...list);
channels.splice(channels.findIndex(channel => channel.id === 'blog'), 0, ...AUTO.novos);
/* What happens after the conversion, as it happens on the phone: a confirmation
   that the page promises by WhatsApp or by e-mail ends the journey on the iOS
   notification banner (lab: fatos-mk-barra-celular-toast, redrawn as iOS). */
const AVISOS = {
  'instagram/feed': { app: 'mail', cliente: 'educacao', texto: 'Sua aula experimental: quinta, 29, às 19h. O link da sala está aqui.', desc: 'A confirmação da aula chega por e-mail, na notificação do iPhone.' },
  'instagram/reels': { app: 'whatsapp', cliente: 'restaurante', texto: 'Reserva confirmada: sábado, 24, às 13h, mesa para 2. Parabéns pelo aniversário!', desc: 'O restaurante confirma a reserva pelo WhatsApp.' },
  'instagram/story': { app: 'mail', cliente: 'educacao', texto: 'Sua aula experimental: quinta, 29, às 19h. O link da sala está aqui.', desc: 'A confirmação da aula chega por e-mail, na notificação do iPhone.' },
  'instagram/live': { app: 'whatsapp', cliente: 'restaurante', texto: 'Pedido 0427 recebido. Avisamos aqui quando estiver pronto para retirar.', desc: 'O restaurante avisa pelo WhatsApp que recebeu o pedido.' },
  'instagram/explorar': { app: 'whatsapp', cliente: 'clinica', texto: 'Avaliação confirmada: quinta, 29, às 9h. Qualquer dúvida, é só responder.', desc: 'A clínica confirma a avaliação pelo WhatsApp.' },
  'facebook/post': { app: 'mail', cliente: 'incorporadora', texto: 'Visita ao decorado: sábado, 24, às 11h30. Endereço e corretor neste e-mail.', desc: 'A confirmação da visita chega por e-mail.' },
  'facebook/video': { app: 'whatsapp', cliente: 'restaurante', texto: 'Reserva confirmada: sábado, 24, às 12h30, varanda para 4.', desc: 'O restaurante responde pelo WhatsApp.' },
  'facebook/breaks': { app: 'mail', cliente: 'educacao', texto: 'Aula experimental na unidade: quinta, 29, às 19h. Veja o endereço.', desc: 'A confirmação da aula chega por e-mail.' },
  'youtube/instream': { app: 'whatsapp', cliente: 'automotivo', texto: 'Recebemos seu pedido de test drive para sábado de manhã.', desc: 'A concessionária confirma o horário pelo WhatsApp.' },
  'google/display': { app: 'whatsapp', cliente: 'turismo', texto: 'Recebemos sua pré-reserva da saída de junho.', desc: 'A agência confirma a pré-reserva pelo WhatsApp.' },
  'seo/organic': { app: 'mail', cliente: 'incorporadora', texto: 'Plantas de 3 e 4 quartos, em PDF.', desc: 'O e-mail com as plantas chega na notificação do iPhone.' },
  'tiktok/infeed': { app: 'mail', cliente: 'varejo', texto: 'Pedido 10482 recebido. Pague o Pix para confirmar o envio.', desc: 'O e-mail do pedido chega na notificação do iPhone.' },
  'facebook/feed': { app: 'whatsapp', cliente: 'incorporadora', texto: 'Olá, Marina! Sou corretor da Atlântica Incorporadora. Podemos combinar a visita de sábado?', desc: 'Um corretor da incorporadora chama pelo WhatsApp.' },
  'blog/article': { app: 'mail', cliente: 'financas', texto: 'Convite: conversa de 30 minutos, terça às 10h.', desc: 'O convite da conversa chega por e-mail.' },
};
Object.assign(AVISOS, AUTO.AVISOS);
channels.forEach(channel => channel.placements.forEach(placement => {
  const aviso = AVISOS[`${channel.id}/${placement.id}`];
  if (!aviso) return;
  const last = placement.quadros[placement.quadros.length - 1];
  placement.aviso = aviso;
  placement.quadros.push({ ms: 2400, cena: last.cena, estado: `${last.estado || ''} aviso`.trim(), desc: aviso.desc, ...(aviso.log ? { log: aviso.log } : {}) });
  placement.passos[placement.passos.length - 1].quadros.push(placement.quadros.length - 1);
}));
export const channelById = id => channels.find(channel => channel.id === id) || channels[0];
/* A placement by "channel/placement", including the ones played only in "Sistemas e automações". */
export const placementByKey = key => {
  const [channel, id] = key.split('/');
  return channels.find(item => item.id === channel)?.placements.find(item => item.id === id) || AUTO.hidden[key] || null;
};

/* App theme behind the status bar and the screen colour while a placement loads. */
const SCREEN = {
  igFeed: { tema: 'escuro', fundo: IG_FUNDO },
  waAd: { tema: 'escuro', fundo: IG_FUNDO },
  igReels: { tema: 'escuro', fundo: '#000' },
  igstory: { tema: 'escuro', fundo: '#000' },
  iglive: { tema: 'escuro', fundo: '#000' },
  igexplore: { tema: 'escuro', fundo: IG_FUNDO },
  fbvid: { tema: 'escuro', fundo: '#000' },
  fbbreak: { tema: 'escuro', fundo: '#000' },
  ttFeed: { tema: 'escuro', fundo: '#000' },
  ytInstream: { tema: 'escuro', fundo: '#0f0f0f' },
  ytLive: { tema: 'escuro', fundo: '#0f0f0f' },
  fbFeed: { tema: 'escuro', fundo: '#242526' },
  fbpost: { tema: 'escuro', fundo: '#242526' },
  blogArticle: { tema: 'escuro', fundo: '#ffffff' },
  ytShorts: { tema: 'escuro', fundo: '#000' },
  liFeed: { fundo: '#f4f2ee' },
  ...AUTO.SCREEN,
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
/* iOS notification banner: app icon, sender, "agora" and two lines of text. */
const push = ({ app, cliente, texto }) => `<div class="cm-push" aria-hidden="true"><span class="cm-push-icon cm-push-icon--${app}">${app === 'whatsapp' ? logoSvg('whatsapp', { altura: 22, mono: 'branco', classe: 'cm-push-glyph' }) : I('mail')}</span><span class="cm-push-body"><span class="cm-push-top"><b>${esc(CLIENTES[cliente].marca)}</b><small>agora</small></span><span class="cm-push-text">${esc(texto)}</span></span></div>`;
export function renderMock(placement) {
  const name = mocks[placement.mock] ? placement.mock : 'igFeed';
  let html = mocks[name]();
  // The banner lives inside the screen, so the frame states (data-state~="aviso") show it.
  if (placement.aviso) html = html.slice(0, -'</div>'.length) + push(placement.aviso) + '</div>';
  return iphone(html, SCREEN[name]);
}
