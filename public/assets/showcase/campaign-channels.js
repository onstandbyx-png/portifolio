/** "Sua oferta. Em cada canal.": the channels and formats of the campaign section,
 * each one advertising a fictitious CLIENT brand of one of the client types the
 * portfolio serves (restaurant, dental clinic, developer, tech store, travel agency,
 * language school, wealth manager, car dealer). Every placement is a finite
 * storyboard inside the same iPhone: hook, retention beat, the tap on the native
 * CTA and the native conversion screen, with what the systems record at each step.
 * Rules: brands, people, streets and numbers are fictitious (marcas.js is the single
 * source) and every example says so outside the phone; no metrics, results, ratings,
 * review counts or testimonials; prices stay masked; ads identified the way each
 * platform does in pt-BR. Platform logos are only the official files of
 * channel-logos.js, used where the app itself shows the mark; every other interface
 * glyph is generic. Photos are licensed stock (IMG_META carries the credit), videos
 * are short muted clips that play only on the scene on screen.
 *
 * Data shape of a placement:
 *   {id, label, mock, cliente, selo, frase, aria?, curto?, objetivo?, base?, art?, audio?,
 *    passos:[{fase, rotulo, quadros:[frame indexes]}],   always 3: Atenção, Retenção, Conversão
 *    quadros:[{ms, cena, estado?, toque?, video?, hora?, fala?, log?, desc}]}
 * log: [[ator, evento, detalhe, {t:'HH:MM:SS', tipo}]] is what the systems record on that frame.
 * A mock is a .cm-screen with .cm-scene children (data-scene, data-kind = base | push |
 * sheet | fade | switch | modal, data-tema = claro | escuro). The engine (frame-engine.js)
 * sets on the screen data-frame, data-scene, data-state (space separated tokens) and
 * data-tap; CSS draws each state. [data-hs~="n"] marks the element the numbered point
 * of step n sits on; [data-tap="key"] is the element a frame taps.
 */
import { logoSvg } from './channel-logos.js';
import { makeSites, horaFala } from './campaign-sites.js';
import { makeLabScreens, IG_FUNDO, avatar } from './lab-telas.js';
import * as AUTOMACOES from './automation-flows.js';
import * as BUSCA from './campaign-search.js';
import { CLIENTES, MARCAS, HOJE, PESSOA, PEDIDOS, OFERTAS, LEGAL, TERCEIROS, dataCurta, dataLonga, diaSemana } from './marcas.js';

export { CLIENTES };
const C = CLIENTES;
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';

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
  salaAtendimento45: { src: A + 'canais/clinica-sala-atendimento-4x5.webp', w: 960, h: 1200 },
  salaMar11: { src: A + 'canais/incorporadora-sala-mar-1x1.webp', w: 620, h: 620 },
  salaMar45: { src: A + 'canais/incorporadora-sala-mar-4x5.webp', w: 700, h: 875 },
  coast: { src: A + 'smiile-architecture-coast.webp', w: 1400, h: 933 },
  mapa: { src: A + 'canais/mapa-cidade.svg', w: 360, h: 640 },
  notebookBranco11: { src: A + 'canais/varejo-creator15-branco-1x1.webp', w: 960, h: 960 },
  notebookGrafite11: { src: A + 'canais/varejo-creator15-grafite-1x1.webp', w: 720, h: 720 },
  mesaNoite45: { src: A + 'canais/varejo-mesa-noite-4x5.webp', w: 768, h: 960 },
  mesaCriador45: { src: A + 'canais/varejo-mesa-criador-4x5.webp', w: 960, h: 1200 },
  mesaCriador916: { src: A + 'canais/varejo-mesa-criador-9x16.webp', w: 720, h: 1280 },
  pirenopolisRua916: { src: A + 'canais/turismo-pirenopolis-rua-9x16.webp', w: 720, h: 1280 },
  pirenopolisRua45: { src: A + 'canais/turismo-pirenopolis-rua-4x5.webp', w: 960, h: 1200 },
  bandeirolas916: { src: A + 'canais/turismo-bandeirolas-noite-9x16.webp', w: 720, h: 1280 },
  matrizNoite45: { src: A + 'canais/turismo-matriz-noite-4x5.webp', w: 960, h: 1200 },
  estandarte11: { src: A + 'canais/turismo-estandarte-divino-1x1.webp', w: 720, h: 720 },
  recarga169: { src: A + 'canais/automotivo-recarga-16x9.webp', w: 1600, h: 900 },
  recarga916: { src: A + 'canais/automotivo-recarga-9x16.webp', w: 720, h: 1280 },
  painel169: { src: A + 'canais/automotivo-painel-16x9.webp', w: 1600, h: 900 },
  estadio169: { src: A + 'canais/esporte-estadio-16x9.webp', w: 960, h: 540 },
  reuniao45: { src: A + 'canais/financas-reuniao-4x5.webp', w: 960, h: 1200 },
  reuniao916: { src: A + 'canais/financas-reuniao-9x16.webp', w: 720, h: 1280 },
  salaJantar45: { src: A + 'canais/financas-sala-jantar-4x5.webp', w: 960, h: 1200 },
  mesaCafe45: { src: A + 'canais/financas-mesa-cafe-4x5.webp', w: 960, h: 1200 },
  fonesCor45: { src: A + 'canais/educacao-fones-4x5.webp', w: 960, h: 1200 },
  cadernos45: { src: A + 'canais/educacao-cadernos-4x5.webp', w: 960, h: 1200 },
  explorar01: { src: A + 'canais/explorar-01-cafe-1x1.webp', w: 600, h: 600 },
  explorar02: { src: A + 'canais/explorar-02-tenis-1x1.webp', w: 600, h: 600 },
  explorar03: { src: A + 'canais/explorar-03-plantas-1x1.webp', w: 600, h: 600 },
  explorar04: { src: A + 'canais/explorar-04-praia-1x1.webp', w: 600, h: 600 },
  explorar05: { src: A + 'canais/explorar-05-livraria-1x1.webp', w: 600, h: 600 },
  explorar06: { src: A + 'canais/explorar-06-bicicleta-1x1.webp', w: 600, h: 600 },
  explorar07: { src: A + 'canais/explorar-07-ceramica-1x1.webp', w: 600, h: 600 },
  explorar08: { src: A + 'canais/explorar-08-cidade-1x1.webp', w: 600, h: 600 },
  explorar09: { src: A + 'canais/explorar-09-cachorro-1x1.webp', w: 600, h: 600 },
};
/* Former keys, kept for the modules that still call them: each one now points at a licensed photo. */
Object.assign(IMG, {
  nerd: IMG.mesaNoite45,
  cenaNerd: IMG.mesaCriador916,
  crencas: IMG.pirenopolisRua916,
  cenaCrencas: IMG.matrizNoite45,
  esportes: IMG.recarga169,
  cenaEsportes: IMG.estadio169,
  negocios: IMG.reuniao45,
});

/* Short muted clips (webm VP9, mp4 H.264 and a webp poster each), licensed on Wikimedia Commons. */
const V = A + 'canais/video/';
export const VIDEOS = {
  fogo: { nome: 'restaurante-fogo-lenha-4x5', w: 576, h: 720, credito: 'Vídeo do fogo a lenha: Berser25, CC BY-SA 4.0, Wikimedia Commons.' },
  frigideira: { nome: 'culinaria-frigideira-16x9', w: 1280, h: 720, credito: 'Vídeo da frigideira: WhirlieWheeter, CC BY 4.0, Wikimedia Commons.' },
  teclado916: { nome: 'varejo-teclado-grafite-9x16', w: 720, h: 1280, credito: 'Vídeo do teclado: C40115, CC BY 4.0, Wikimedia Commons.' },
  teclado169: { nome: 'varejo-teclado-grafite-16x9', w: 1280, h: 720, credito: 'Vídeo do teclado: C40115, CC BY 4.0, Wikimedia Commons.' },
};

/* Credit and origin of every picture, read by the player for the note under the phone. */
const CREDITO = {
  'restaurante-feijoada-completa': 'Foto da feijoada: Bradleyzm, CC BY-SA 4.0, Wikimedia Commons.',
  'turismo-pirenopolis-rua': 'Fotos de Pirenópolis: Marcosviniciusrs, CC BY-SA 4.0, Wikimedia Commons.',
  'turismo-bandeirolas-noite': 'Fotos de Pirenópolis: Marcosviniciusrs, CC BY-SA 4.0, Wikimedia Commons.',
  'turismo-matriz-noite': 'Fotos de Pirenópolis: Marcosviniciusrs, CC BY-SA 4.0, Wikimedia Commons.',
  'turismo-estandarte-divino': 'Foto do estandarte: Marcosviniciusrs, CC BY 4.0, Wikimedia Commons.',
  'automotivo-recarga': 'Foto da recarga: Ivan Radic, CC BY 2.0, Wikimedia Commons.',
  'automotivo-painel': 'Foto do painel: Kārlis Dambrāns, CC BY 2.0, Wikimedia Commons.',
  'clinica-sala-atendimento': 'Foto da sala: Harrison Keely, CC BY 4.0, Wikimedia Commons.',
};
export const IMG_META = Object.fromEntries([
  ...Object.entries(IMG).map(([key, im]) => [key, { src: im.src, credito: Object.entries(CREDITO).find(([nome]) => im.src.includes(nome))?.[1] || null, ia: false }]),
  ...Object.entries(VIDEOS).map(([key, v]) => [`video:${key}`, { src: `${V}${v.nome}.webp`, credito: v.credito, ia: false }]),
]);

/* Fictitious advertisers: the marks of marcas.js in a circle (avatars), square (page, app icon) or pin. */
export const marca = (key, forma = 'circulo', cls = '') => `<span class="cm-mark cm-mark--${forma}${cls ? ' ' + cls : ''}" style="--c:${C[key].cor}" aria-hidden="true">${MARCAS[key]}</span>`;
export const clienteChip = key => `Marca fictícia: ${C[key].tipo}`;

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
  face: 'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M9 9.5v1M15 9.5v1M12 9.5V13h-1M9.5 15.5c1.4 1.2 3.6 1.2 5 0',
  star: 'm12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  pause: 'M8 5v14M16 5v14',
  mute: 'M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4zM16 9.5l5 5M21 9.5l-5 5',
};
const I = (name, cls = '') => `<svg class="cm-i cm-i--${name}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>`;
/* Glyph of a channel without an official logo file (static-presentations.js, experience-player.js). */
export const glifo = (name, cls = '') => I(name, cls);
/* Every picture is lazy, low priority and sized; alt text only on the first view of a scene. */
const pic = (key, { alt = '', cls = '', pos = '' } = {}) => {
  const im = IMG[key];
  return `<img class="${cls}" src="${im.src}" alt="${esc(alt)}" width="${im.w}" height="${im.h}" loading="lazy" decoding="async" fetchpriority="low"${pos ? ` style="object-position:${pos}"` : ''}>`;
};
/* A muted clip: it loads nothing until the engine plays it on the scene on screen; the poster shows before. */
const video = (key, { cls = '', pos = '' } = {}) => {
  const v = VIDEOS[key];
  return `<video class="cm-video${cls ? ' ' + cls : ''}" muted playsinline loop preload="none" poster="${V}${v.nome}.webp" width="${v.w}" height="${v.h}" aria-hidden="true"${pos ? ` style="object-position:${pos}"` : ''}><source src="${V}${v.nome}.webm" type="video/webm"><source src="${V}${v.nome}.mp4" type="video/mp4"></video>`;
};
const scene = (id, kind, tema, html, cls = '', gestos = '') => `<div class="cm-scene${cls ? ' ' + cls : ''}" data-scene="${id}" data-kind="${kind}" data-tema="${tema}"${gestos ? ` data-gestos="${gestos}"` : ''}>${html}</div>`;
const screen = (key, html) => `<div class="cm-screen cm-${key}" data-frame="0">${html}</div>`;
const skel = (rows, cls = '') => `<span class="cm-skel${cls ? ' ' + cls : ''}" aria-hidden="true">${Array.from({ length: rows }, (_, i) => `<i style="--w:${[92, 74, 84, 58, 88][i % 5]}%"></i>`).join('')}</span>`;
/* Page parts shared by the advertisers' landing pages. */
const input = (label, value) => `<div class="cm-input"><small>${esc(label)}</small><span>${esc(value)}</span></div>`;
const btn = (text, tap, hs = '3', cls = '') => `<span class="cm-btn${cls ? ' ' + cls : ''}"${tap ? ` data-tap="${tap}"` : ''}${hs ? ` data-hs="${hs}"` : ''}>${esc(text)}</span>`;
const done = (title, text, extra = '') => `<div class="cm-done" data-hs="3"><span class="cm-done-check">${I('check')}</span><b>${esc(title)}</b><p>${esc(text)}</p>${extra}</div>`;
/* In-app browser of Instagram, TikTok, Facebook and ChatGPT: close, page title over the domain, more. */
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

/* Floor plan of the developer, drawn from OFERTAS.incorporadora.plantas: the same shell with
   3 bedrooms (2 bathrooms) or 4 bedrooms (3 bathrooms and a powder room), labelled rooms and
   "área ilustrativa". tipo '3' or '4' shows one plan; 'anim' draws the walls of the 4-bedroom
   plan in after a pause; the screen state p4 switches any plan to 4 bedrooms. */
const PLANTA = {
  paredes: 'M4 84h146M150 4v152M56 4v80M150 70h86M150 100h86M86 4v80M56 44h30',
  paredes4: 'M118 4v80M56 64h30M4 112h34M38 84v28',
  rotulos3: [['Cozinha', 30, 46], ['Banho', 71, 28], ['Quarto 3', 118, 46], ['Suíte', 193, 40], ['Banho', 193, 88], ['Quarto 2', 193, 132], ['Sala e varanda', 77, 124]],
  rotulos4: [['Cozinha', 30, 46], ['Banho', 71, 28], ['Banho', 71, 77], ['Quarto 3', 102, 40], ['Quarto 4', 134, 40], ['Suíte', 193, 40], ['Banho', 193, 88], ['Quarto 2', 193, 132], ['Lavabo', 21, 101], ['Sala e varanda', 94, 128]],
};
const planta = (tipo = '3', cls = '') => {
  if (!['3', '4', 'anim'].includes(String(tipo))) { cls = tipo; tipo = '3'; }
  const txt = (list, k) => `<g class="cm-planta-${k}">${list.map(([t, x, y]) => `<text x="${x}" y="${y}">${esc(t)}</text>`).join('')}</g>`;
  const quartos = String(tipo) === '4' ? OFERTAS.incorporadora.plantas.quatro : OFERTAS.incorporadora.plantas.tres;
  return `<svg class="cm-planta cm-planta--t${tipo}${cls ? ' ' + cls : ''}" viewBox="0 0 240 176" role="img" aria-label="${esc(`Planta ilustrativa: ${quartos.join(', ')}`)}"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><rect x="4" y="4" width="232" height="152" rx="2"/><path d="${PLANTA.paredes}"/><path class="cm-planta-4 cm-planta-paredes" d="${PLANTA.paredes4}" pathLength="1"/><path d="M4 146h146" stroke-dasharray="4 4" stroke-width="1.6"/></g><g fill="currentColor" font-family="Inter,Arial,sans-serif" font-size="9.5" text-anchor="middle">${txt(PLANTA.rotulos3, 3)}${txt(PLANTA.rotulos4, 4)}<text class="cm-planta-nota" x="236" y="172" text-anchor="end" font-size="8">Área ilustrativa</text></g></svg>`;
};

/* Each client's own site, with the steps of its real flow (campaign-sites.js), and the
   platform screens (lab-telas.js). */
const SITES = makeSites({ I, pic, marca, esc, avatar, planta });
const kit = SITES.kit;
const LAB = makeLabScreens({ marca, esc, CLIENTES, pic });
const P = (fase, rotulo, quadros) => ({ fase, rotulo, quadros });
const passos3 = (a, b, c) => [P('Atenção', a[0], a[1]), P('Retenção', b[0], b[1]), P('Conversão', c[0], c[1])];
/* Backstage line: [ator, evento, detalhe, {t, tipo}]. */
const L = (t, ator, evento, detalhe = '', tipo = 'evento') => [ator, evento, detalhe, { t, tipo }];
const curta = k => C[k].curta || C[k].marca;
const R = OFERTAS.restaurante, E = OFERTAS.educacao, CL = OFERTAS.clinica, AU = OFERTAS.automotivo, VA = OFERTAS.varejo, FI = OFERTAS.financas, INC = OFERTAS.incorporadora;
const banco = TERCEIROS.banco, psp = TERCEIROS.psp, revista = TERCEIROS.revista;

/* A shot of a short video built from stills: a slow push-in on the photo and the text on screen word by word. */
const shot = (n, media, texto = '', { cls = 'cm-ontext', hs = '', at = '' } = {}) => `<figure class="cm-shot" data-shot="${n}">${media}${texto ? `<p class="${cls}" data-stream${hs ? ` data-hs="${hs}"` : ''}${at ? ` data-hs-at="${at}"` : ''}>${texto}</p>` : ''}</figure>`;
const kb = (key, opts = {}) => pic(key, { ...opts, cls: `cm-kb${opts.cls ? ' ' + opts.cls : ''}` });

/* Instagram Direct conversation of the clinic that starts from a story reply. */
const avaliacao = CL.avaliacao, ruaClinica = TERCEIROS.ruas.clinica;
const opcaoHorario = (iso, hora) => `${dataCurta(iso)} · ${hora}`;

const mocks = {
  /* Instagram feed: carousel of the language school, CTA bar that lights up, Instagram browser, level test. */
  igFeed: () => screen('ig', scene('ad', 'base', 'escuro', LAB.feedAd({ key: 'educacao', carousel: 3, cta: { text: 'Inscrever-se agora' },
    media: `<div class="cm-track">
      <figure class="cm-card cm-card--photo">${pic('escola45', { alt: 'Fone de ouvido sobre a mesa, com a pergunta Você entende a série sem legenda?' })}<figcaption><b data-hs="1">Você entende a série sem legenda?</b></figcaption></figure>
      <figure class="cm-card cm-card--coral" data-hs="2"><small>Três expressões</small><b>Que a legenda traduz ao pé da letra</b><ol><li>Break a leg</li><li>It’s up to you</li><li>Piece of cake</li></ol></figure>
      <figure class="cm-card cm-card--cream" data-hs="2"><b>Break a leg!</b>${I('arrow')}<b class="cm-card-pt">Boa sorte!</b><small>Descubra seu nível em 3 perguntas e marque uma aula de 30 min.</small></figure></div>`,
    caption: { html: `${esc(C.educacao.assinatura)} Teste de nível grátis e aula experimental de 30 min. <span class="cm-more">… mais</span>` } })) +
    scene('page', 'sheet', 'claro', `${browserBar(curta('educacao'), C.educacao.dominio)}${SITES.sotaque()}`)),

  /* Instagram Story: the clinic, a poll sticker, the reply that turns into a Direct conversation with the
     clinic's virtual assistant and the booked appointment. */
  igstory: () => screen('igstory', scene('story', 'base', 'escuro', LAB.storyAd({ key: 'clinica', bars: 3,
    media: `${kb('recepcao45', { alt: 'Recepção da clínica com parede terracota, sofá e plantas.', pos: '50% 40%' })}<p class="igs-texto" data-hs="1" data-stream>${esc(C.clinica.assinatura)}</p>`,
    poll: { q: 'Você tem medo de dentista?', options: ['Um pouco', 'Não'], pick: 0, tap: 'poll', state: 'vt', hs: '2' },
    campo: { text: 'Enviar mensagem', digitado: 'Um pouco. Como é a avaliação?', tap: 'send', hs: '3' } })) +
    scene('dm', 'push', 'escuro', LAB.direct({ key: 'clinica', items: [
      { de: 'sistema', html: 'Hoje 10:09' },
      { de: 'eu', in: 'd1', html: `<span class="igd-story">${pic('recepcao45', { pos: '50% 40%' })}<small>Você respondeu ao story</small></span>Um pouco. Como é a avaliação?` },
      { de: 'marca', in: 'd2', cls: 'igd-digita', html: `Oi, ${esc(PESSOA.primeiro)}! Sou a assistente virtual da ${esc(C.clinica.marca)}. A avaliação leva 30 minutos, sem nenhum procedimento: a ${esc(CL.responsavel)} examina e explica o plano por escrito. Quer ver os horários?<span class="igd-rapidas"><span data-tap="h">Ver horários</span><span>Falar com a recepção</span></span>` },
      { de: 'eu', in: 'd3', html: 'Ver horários' },
      { de: 'marca', in: 'd3', cls: 'igd-digita', html: `Tenho estes na unidade ${esc(avaliacao.unidade)}:<span class="igd-opcoes" data-hs="3"><span data-tap="hr" data-pick="d4">${esc(opcaoHorario(avaliacao.iso, avaliacao.hora))}</span><span>${esc(opcaoHorario(CL.alternativa.iso, CL.alternativa.hora))}</span></span>` },
      { de: 'eu', in: 'd4', html: esc(opcaoHorario(avaliacao.iso, avaliacao.hora)) },
      { de: 'marca', in: 'd4', cls: 'igd-digita', hs: '3', html: `<span class="igd-card"><b>${I('check')}Avaliação agendada</b><span>${esc(cap(dataLonga(avaliacao.iso)))}, ${esc(horaFala(avaliacao.hora))}</span><span>Unidade ${esc(avaliacao.unidade)} · ${esc(ruaClinica)}</span><small>Para remarcar, é só responder aqui.</small></span>` },
    ] }))),

  /* Instagram Live: the restaurant cooks live; a comment with the keyword turns into a private message with
     the menu, and the order for pickup is made on the site. */
  iglive: () => screen('iglive', scene('live', 'base', 'escuro', LAB.liveAd({ key: 'restaurante',
    media: video('fogo', { pos: '50% 60%' }),
    comments: [
      { who: TERCEIROS.comentaristas[0], text: 'Que cheiro daqui!' },
      { who: TERCEIROS.comentaristas[1], text: 'Esse tacho é de ferro?' },
      { who: TERCEIROS.comentaristas[4], text: 'Dá para encomendar para sábado?', in: 'c1' },
      { own: true, text: 'Dá sim! Comenta FEIJOADA que a gente manda o menu de sábado por mensagem.', in: 'c2', hs: '2' },
      { who: PESSOA.nome, text: 'FEIJOADA', in: 'c3' },
    ],
    campo: { text: 'FEIJOADA', tap: 'send', hs: '3' } }) + `<span class="cm-igbanner" data-tap="bn" data-hs="3">${marca('restaurante', 'circulo', 'cm-igbanner-av')}<span><b>${esc(C.restaurante.arroba)}</b><small>Enviou uma mensagem: o menu de sábado está aqui.</small></span></span>`) +
    scene('dm', 'push', 'escuro', LAB.direct({ key: 'restaurante', pasta: 'Solicitações', items: [
      { de: 'sistema', html: `${esc(C.restaurante.arroba)} respondeu ao seu comentário na live` },
      { de: 'marca', html: `Oi, ${esc(PESSOA.primeiro)}! Aqui é a assistente virtual da ${esc(C.restaurante.marca)}. Recebi o seu FEIJOADA: o menu de sábado está no link, com retirada no balcão.<span class="igd-card igd-card--menu">${pic('panela11')}<b>Encomendas para sábado</b><small>${esc(cap(dataLonga(R.encomenda.iso)))}</small><span class="igd-botao" data-tap="menu" data-hs="3">Ver menu</span><span class="igd-botao">Falar com a casa</span></span>` },
    ] })) +
    scene('page', 'sheet', 'claro', `${browserBar(curta('restaurante'), C.restaurante.dominio)}${SITES.tacho({ variant: 'retirada' })}`)),

  /* Instagram Explore: a grid of other people's photos with one ad block (only the mark and Anúncio); the
     tap opens the immersive Reels viewer, then the clinic's booking. */
  igexplore: () => screen('igexplore', scene('grid', 'base', 'escuro', LAB.explore({ cells: `${pic('explorar01')}${pic('explorar02')}<span class="igx-alto">${pic('explorar06')}<i class="igx-tipo">${I('reels')}</i></span>
        ${pic('explorar03')}<span class="cm-xp-ad" data-tap="ad" data-hs="1">${pic('consultorio45', { alt: 'Bloco de anúncio no Explorar: consultório odontológico com luz natural.', pos: '50% 45%' })}<span class="cm-xp-tag">${marca('clinica', 'circulo', 'cm-xp-mark')}<em>Anúncio</em></span></span>
        ${pic('explorar04')}${pic('explorar05')}<span class="igx-alto">${pic('explorar07')}<i class="igx-tipo">${I('copy')}</i></span>${pic('explorar08')}${pic('explorar09')}` })) +
    scene('reel', 'modal', 'escuro', LAB.reelsAd({ key: 'clinica', voltar: 'Explorar', caption: `${C.clinica.assinatura} Agende pelo site.`, cta: { text: 'Solicitar horário' },
      video: `<div class="cm-shots">${shot(1, kb('consultorio45', { alt: 'Consultório odontológico claro, com cadeira e janela.', pos: '50% 50%' }), 'Avaliação sem pressa.<br>Plano por escrito.', { hs: '2' })}</div>` })) +
    scene('page', 'sheet', 'claro', `${browserBar('Agendamento on-line', C.clinica.dominio)}${SITES.seixo()}`)),

  /* Instagram Reels: the restaurant, a cut from the fire under the pot to the plate, browser, table booking. */
  igReels: () => screen('reels', scene('video', 'base', 'escuro', LAB.reelsAd({ key: 'restaurante', caption: `${C.restaurante.assinatura} Reserve a mesa do almoço.`, cta: { text: 'Ver menu' },
    video: `<div class="cm-shots">${shot(1, video('fogo', { pos: '50% 60%' }), 'O feijão vai pro tacho às 6h.', { hs: '1' })}${shot(2, kb('panela916', { alt: 'Prato de feijoada completa com carnes, linguiça, arroz, farofa e couve.' }), 'Sábado tem feijoada completa.', { hs: '2' })}</div>` })) +
    scene('page', 'sheet', 'claro', `${browserBar(curta('restaurante'), C.restaurante.dominio)}${SITES.tacho()}`)),

  /* Facebook feed: carousel of the developer (square cards, gray Saiba mais) and the instant form with the
     calendar at the end. */
  fbFeed: () => screen('fb', scene('ad', 'base', 'escuro', LAB.facebookAd({ key: 'incorporadora', text: `${esc(C.incorporadora.assinatura)} Visita ao decorado com hora marcada.`,
    media: `<div class="cm-fb-carousel"><div class="cm-track">
      <figure class="cm-fb-card"><span class="cm-fb-img" data-hs="1">${pic('coast', { alt: 'Casa de concreto e madeira na falésia, sobre o mar.', pos: '34% 50%' })}</span><figcaption><span><b>Casa na falésia</b><small>Decorado aberto</small></span><span class="cm-fb-btn">Saiba mais</span></figcaption></figure>
      <figure class="cm-fb-card"><span class="cm-fb-img" data-hs="2">${pic('salaMar11')}</span><figcaption><span><b>Sala voltada para o mar</b><small>Da sala e da suíte</small></span><span class="cm-fb-btn">Saiba mais</span></figcaption></figure>
      <figure class="cm-fb-card"><span class="cm-fb-img cm-fb-img--plan" data-hs="2">${planta('anim')}</span><figcaption><span><b>Plantas de 3 e 4 quartos</b><small>Área ilustrativa</small></span><span class="cm-fb-btn" data-tap="cta" data-hs="3">Saiba mais</span></figcaption></figure>
    </div></div>`,
    next: { name: 'Ateliê da Praça', time: '5 h', text: 'Feira de cerâmica neste fim de semana, na praça.', media: pic('explorar07', { pos: '50% 50%' }) } })) +
    scene('form', 'sheet', 'escuro', SITES.metaForm({ key: 'incorporadora', cover: 'coast', title: 'Visita ao decorado', text: `${C.incorporadora.assinatura} Escolha o horário no fim do formulário.` }), 'cm-scene--part', 'claro')),

  /* Facebook post: the restaurant's event "Feijoada de sábado"; Tenho interesse, the event details and the table booking. */
  fbpost: () => {
    const sab = R.reserva.iso, [ds, dn] = [dataCurta(sab).split(', ')[0], String(Number(sab.slice(8)))];
    return screen('fbpost', scene('post', 'base', 'escuro', LAB.facebookAd({ key: 'restaurante', text: `${esc(C.restaurante.assinatura)} Marque interesse e reserve a mesa do almoço.`,
      media: `<div class="fb-evento"><span class="fb-evento-capa" data-hs="1">${pic('fachada43', { alt: 'Fachada de madeira do restaurante, com flores e mesas na calçada.', pos: '50% 45%' })}</span>
        <div class="fb-evento-info" data-hs="2"><span class="fb-evento-dia"><small>${esc(ds.toUpperCase())}</small><b>${dn}</b></span><span><small>${esc(cap(dataLonga(sab)).toUpperCase())}, 11:30</small><b>Feijoada de sábado</b><small>${esc(C.restaurante.marca)} · ${esc(TERCEIROS.ruas.restaurante.split(' · ')[1])}</small></span></div>
        <span class="fb-evento-btn" data-tap="cta" data-hs="3"><span class="fb-evento-a">${I('star')}Tenho interesse</span><span class="fb-evento-b">${I('check')}Interessado</span></span></div>`,
      next: { time: '3 h', text: 'Café coado na hora: a água entra antes de ferver, devagar.', media: pic('explorar01', { pos: '50% 50%' }) } }) + `<span class="cm-fbtoast">${I('bell')}Você vai receber um lembrete antes do evento.</span>`) +
      scene('evento', 'sheet', 'escuro', `<div class="fb-ev"><span class="cm-grabber"></span><span class="fb-ev-capa">${pic('fachada43', { pos: '50% 45%' })}</span><small class="fb-ev-data">${esc(cap(dataLonga(sab)))}, das 11:30 às 15:30</small><b class="fb-ev-titulo">Feijoada de sábado</b>
        <span class="fb-ev-local">${I('location')}<span><b>${esc(C.restaurante.marca)}</b><small>${esc(TERCEIROS.ruas.restaurante)}</small></span></span>
        <span class="fb-ev-acoes"><span class="is-on">${I('check')}Interessado</span><span>${I('share')}Compartilhar</span></span>
        <p class="fb-ev-sobre">Feijoada no tacho, carnes separadas, couve, farofa e laranja. Mesas no salão e na varanda.</p>
        <span class="fb-ev-reserva" data-hs="3"><span><b>Reserva de mesa</b><small>${esc(C.restaurante.dominio)}</small></span><span class="fb-ev-btn" data-tap="rsv">Reservar mesa</span></span>
        <b class="fb-ev-h">Detalhes</b><span class="fb-ev-det"><span>${I('people')}38 pessoas interessadas</span><span>${I('user')}Evento de ${esc(C.restaurante.marca)}</span><span>${I('globe')}Público · qualquer pessoa, dentro ou fora do Facebook</span><span>${I('bell')}Lembrete no dia, às 9h</span></span></div>`, 'cm-scene--part') +
      scene('page', 'sheet', 'claro', `${browserBar(curta('restaurante'), C.restaurante.dominio)}${SITES.tacho({ variant: 'direto' })}`));
  },

  /* Facebook video: the restaurant in the Reels viewer of Facebook, the player strip running to the end, the
     table booking and the calendar of the iPhone. */
  fbvid: () => screen('fbvid', scene('video', 'base', 'escuro', LAB.facebookReel({ key: 'restaurante', caption: `${C.restaurante.assinatura} Reserve a mesa do almoço.`, cta: { text: 'Reservar agora' }, tempo: '0:12',
    video: `<div class="cm-shots">${shot(1, kb('prato916', { alt: 'Prato de feijoada servido com farofa, couve e laranja.' }), 'Do tacho para a mesa.', { hs: '1' })}${shot(2, kb('pudim11', { alt: 'Pudim de leite no prato branco.', pos: '50% 50%' }), 'E o pudim da casa.', { hs: '2' })}</div>` })) +
    scene('page', 'sheet', 'claro', `${browserBar(curta('restaurante'), C.restaurante.dominio)}${SITES.tacho({ variant: 'direto', agenda: true })}`) +
    scene('cal', 'sheet', 'claro', `<div class="cm-sheet cm-ioscal"><span class="cm-grabber"></span><p class="cm-ioscal-top"><span>Cancelar</span><b>Novo evento</b><span class="cm-ioscal-add" data-tap="add" data-hs="3">Adicionar</span></p>
      <div class="cm-ioscal-grupo"><b>Almoço no ${esc(curta('restaurante'))}</b><small>${esc(TERCEIROS.ruas.restaurante)}</small></div>
      <div class="cm-ioscal-grupo"><span><small>Começa</small><b>${esc(dataCurta(R.reserva.iso))} · ${esc(R.reserva.hora)}</b></span><span><small>Termina</small><b>${esc(dataCurta(R.reserva.iso))} · 14:30</b></span></div>
      <div class="cm-ioscal-grupo"><span><small>Alerta</small><b>1 hora antes</b></span><span><small>Notas</small><b>Mesa para ${R.reserva.pessoas}, salão. Aniversário.</b></span></div>
      <p class="cm-ioscal-ok">${I('check')}Adicionado ao Calendário</p></div>`, 'cm-scene--part')),

  /* Facebook ad break: a cooking video of a page; the ad plays inside the same player, without a skip button,
     with the CTA on the context card under it; the instant form; the video goes on. */
  fbbreak: () => screen('fbbreak', scene('video', 'base', 'escuro', LAB.facebookWatch({ pagina: TERCEIROS.criadores.facebook, texto: 'Hambúrguer na frigideira de ferro, do jeito de casa.',
    player: `<div class="fbw-conteudo" data-hs="1">${video('frigideira')}${LAB.fbStrip('<b class="fbw-t1">1:05</b><b class="fbw-t2">1:06</b> / 8:40', 'fbw-strip--conteudo')}</div>
      <div class="fbw-anuncio">${kb('recarga169', { alt: 'Carro elétrico prata recarregando na rua, cabo encaixado.', pos: '50% 50%' })}<span class="fbw-rotulo">Anúncio · <b class="fbw-c1">0:08</b><b class="fbw-c2">0:05</b></span><span class="fbw-continua">O vídeo continua em <b class="fbw-c1">8</b><b class="fbw-c2">5</b></span><p class="fbw-texto" data-stream>A recarga, explicada no test drive.</p><span class="fbw-progresso"><i></i></span></div>`,
    contexto: `<div class="fbw-cartao" data-hs="2">${marca('automotivo', 'circulo', 'fbw-av')}<span><b>${esc(C.automotivo.marca)}</b><small>Anúncio · ${esc(C.automotivo.assinatura)}</small></span><span class="fbw-btn" data-tap="cta" data-hs="3">Reservar agora</span></div>` })) +
    scene('form', 'sheet', 'escuro', SITES.metaForm({ key: 'automotivo', cover: 'recarga169', pos: '50% 50%', title: 'Test drive com a recarga explicada', text: `Escolha a versão. O consultor ${AU.consultor} confirma o horário de ${dataLonga(AU.testDrive.iso)} pelo WhatsApp.`,
      pergunta: 'Qual versão você quer dirigir?', opcoes: AU.versoes.map(v => `${curta('automotivo')} ${v.nome}`), escolha: `${curta('automotivo')} ${AU.versoes[0].nome}`, fim: 'obrigado', iso: AU.testDrive.iso, hora: AU.testDrive.hora,
      obrigado: `O consultor ${AU.consultor} chama você no WhatsApp para confirmar ${dataLonga(AU.testDrive.iso)}, às ${horaFala(AU.testDrive.hora)}.` }), 'cm-scene--part', 'claro')),

  /* TikTok In-Feed: the tech store; the CTA shows its text, then takes the colour of the video; the store in the
     TikTok browser with review, Pix QR and copy-paste code, the bank app with Face ID, the paid order. */
  ttFeed: () => screen('tt', scene('video', 'base', 'escuro', LAB.tiktokAd({ key: 'varejo', caption: `${C.varejo.assinatura} Tela calibrada e 32 GB.`, sound: `Música promocional - ${C.varejo.arroba}`, cta: { text: 'Comprar agora', cor: '#b0703c' },
    video: `<div class="cm-shots">${shot(1, video('teclado916'), '<span>Edita à noite e</span><span>o notebook esquenta?</span>', { cls: 'cm-tt-text', hs: '1' })}${shot(2, kb('mesaCriador916', { alt: 'Mesa de madeira vista de cima, com notebook, flores e caderno.' }), '<span>De noite, a edição.</span><span>De dia, a entrega.</span>', { cls: 'cm-tt-text', hs: '2' })}</div>` })) +
    scene('page', 'sheet', 'claro', `${browserBar(curta('varejo'), C.varejo.dominio)}${SITES.teclaria()}`) +
    scene('banco', 'switch', 'claro', kit.banco(`<div class="cm-bk-corpo">
        <div class="cm-bk-home" data-out="bk1"><span class="cm-bk-saldo"><small>Saldo disponível</small><b>${kit.PRECO}</b></span>
          <span class="cm-bk-atalhos"><span>${I('send')}Pix</span><span>${I('doc')}Pagar</span><span>${I('repost')}Transferir</span><span>${I('tag')}Cartões</span></span>
          <span class="cm-bk-hist"><b>Atividade recente</b><span><i>${I('send')}</i><span>Pix enviado<small>Ontem</small></span><b>${kit.PRECO}</b></span><span><i>${I('doc')}</i><span>Conta de luz<small>${esc(dataCurta('2026-10-19'))}</small></span><b>${kit.PRECO}</b></span><span><i>${I('down')}</i><span>Pix recebido<small>${esc(dataCurta('2026-10-17'))}</small></span><b>${kit.PRECO}</b></span></span></div>
        <div class="cm-bk-achou" data-out="bk1"><span class="cm-bk-ico">${I('copy')}</span><b>Encontramos um código Pix copiado</b><small>Pix copia e cola · ${esc(kit.BR_CODE.slice(0, 26))}…</small><span class="cm-bk-btn" data-tap="bk-go" data-hs="3">Pagar</span></div>
        <div class="cm-bk-rev" data-in="bk1"><small>Pix copia e cola</small><b class="cm-bk-valor">${kit.PRECO}</b>
          <span class="cm-bk-linha"><small>Para</small><b>${esc(C.varejo.marca)}</b></span><span class="cm-bk-linha"><small>Instituição</small><b>${esc(psp.nome)}</b></span><span class="cm-bk-linha"><small>CNPJ</small><b>••.•••.•••/0001-••</b></span><span class="cm-bk-linha"><small>Quando</small><b>Hoje, ${esc(dataCurta(HOJE.iso))}</b></span>
          <span class="cm-bk-btn" data-tap="bk-ok" data-hs="3">${I('face')}Pagar com Face ID</span></div>
        <div class="cm-bk-face" data-in="bk2" data-out="bk3"><span>${I('face')}</span><small>Face ID</small></div>
        <div class="cm-bk-ok" data-in="bk3"><span class="cm-bk-check">${I('check')}</span><b>Pix enviado</b><small>${kit.PRECO} para ${esc(C.varejo.marca)}</small><span class="cm-bk-comp"><span><small>Data</small><b>${esc(dataCurta(HOJE.iso))}, 10:11</b></span><span><small>Instituição</small><b>${esc(psp.nome)}</b></span><span><small>Autenticação</small><b>E3B7••••••••41C2</b></span></span><span class="cm-bk-volta" data-tap="volta" data-hs="3">${I('back')}Voltar ao TikTok</span></div>
      </div>`, { de: 'TikTok' }))),

  /* YouTube in-stream: the car dealer before a creator's video; two cuts (the charging cable, then the dashboard),
     Pular after 5 s, the action card, the test drive page. */
  ytInstream: () => screen('yt', scene('watch', 'base', 'escuro', LAB.youtubeAd({ key: 'automotivo', title: 'Como editar os melhores momentos de um jogo', meta: '<span>há 2 dias</span><b>…mais</b>', panel: { title: 'Test drive com a recarga explicada', button: 'Agendar' },
    player: `<div class="cm-shots">${shot(1, kb('recarga169', { alt: 'Carro elétrico prata recarregando na rua, cabo encaixado na tampa.', pos: '50% 50%' }), 'Saiu do jogo. Quanto de carga sobra?', { cls: 'cm-yt-burn', hs: '1', at: 'tl' })}${shot(2, kb('painel169', { alt: 'Painel de carro elétrico com volante e seletor de marcha.', pos: '50% 50%' }), 'No test drive, a recarga explicada.', { cls: 'cm-yt-burn', hs: '2', at: 'tl' })}</div><span class="cm-yt-dim"></span>` })) +
    scene('page', 'push', 'claro', `${browserBar('Test drive', C.automotivo.dominio)}${SITES.ondara()}`)),

  /* YouTube Shorts: the language school's app; an exercise holds the swipe, Instalar appears at 3 s; the App Store
     sheet in the YouTube app; Face ID; Abrir; the app opens on its level test. */
  ytShorts: () => {
    const app = `${curta('educacao')}: conversação`;
    return screen('shorts', scene('video', 'base', 'escuro', `<div class="cm-shots">${shot(1, kb('escola916', { alt: 'Fone de ouvido sobre a mesa de madeira.' }), 'Pare de traduzir na cabeça.', { hs: '1' })}</div>
    <span class="cm-shade"></span>
    <div class="cm-quiz" data-hs="2"><small>Complete</small><b>It’s <span class="cm-blank"><i>up</i></span> to you.</b><span class="cm-quiz-ok">${I('check')}Certo: você que decide.</span></div>
    <div class="cm-shorts-top">${I('search')}${I('vdots')}</div>
    <div class="cm-rail cm-rail--yt"><span>${I('thumb')}<small>Gostei</small></span><span>${I('thumb', 'cm-i--flip')}<small>Não gostei</small></span><span>${I('comment')}<small>Comentar</small></span><span>${I('forward')}<small>Compartilhar</small></span><span class="cm-cover cm-cover--sq" style="background-image:url(${IMG.escola45.src})"></span></div>
    <div class="cm-vmeta cm-vmeta--yt"><span class="cm-who">${marca('educacao')}<b>@${esc(C.educacao.arroba)}</b><small class="cm-pill">Patrocinado</small></span><p>${esc(C.educacao.assinatura)}</p></div>
    <div class="cm-vcta cm-vcta--yt" data-tap="cta" data-hs="3"><b>Instalar</b></div>
    <div class="cm-vprogress"><i data-cx-progress></i></div>${tabbar(TABS.youtube, 'cm-tabbar--dark')}`) +
    scene('store', 'sheet', 'escuro', `<div class="cm-sheet cm-store"><span class="cm-grabber"></span><div class="cm-store-head"><span class="cm-store-icone" data-hs="3">${marca('educacao', 'app')}</span><span><b>${esc(app)}</b><small>Inglês para quem trava na hora de falar</small><small class="cm-store-chip">Anúncio</small></span><span class="cm-store-get" data-tap="go"><b>Obter</b><i class="cm-ring"></i><b>Abrir</b></span></div>
      <div class="cm-store-meta"><span><small>Idade</small><b>4+</b></span><span><small>Categoria</small><b>Educação</b></span><span><small>Desenvolvedor</small><b>${esc(C.educacao.marca)}</b></span><span><small>Idioma</small><b>PT</b></span></div>
      <div class="cm-store-shots"><span class="cm-store-shot cm-store-shot--aula"><small>Aula ao vivo</small><i class="cm-store-video"></i><i class="cm-bubble">How was your weekend?</i><i class="cm-bubble cm-bubble--me">Pretty good, thanks!</i></span><span class="cm-store-shot"><small>Teste de nível</small><b>It’s up to you.</b><i class="cm-bubble">Você que decide.</i><span class="cm-store-meter"><i></i><i></i><i class="is-on"></i><i></i><i></i></span></span><span class="cm-store-shot"><small>Sequência</small><b>7 dias seguidos</b><span class="cm-store-dias">${'<i class="is-on"></i>'.repeat(5)}<i></i><i></i></span></span></div>
      <div class="cm-store-face">${I('face')}<b>Clique duas vezes para instalar</b><small>Botão lateral</small></div></div>`, 'cm-scene--part', 'claro') +
    scene('app', 'switch', 'claro', `<div class="cm-app" style="--brand:${C.educacao.cor}"><div class="cm-app-top">${marca('educacao')}<b>${esc(curta('educacao'))}</b><small><span class="cm-app-p1">Passo 1 de 2</span><span class="cm-app-p2">Passo 2 de 2</span></small></div>
      <div class="cm-app-corpo"><span class="cm-app-bar"><i></i></span><small class="cm-app-k">Teste de nivelamento</small><b class="cm-app-h">Qual resposta soa natural?</b><p class="cm-app-q">“How long have you lived here?”</p>
        <span class="cm-app-op" data-tap="ans" data-pick="a2">For three years.</span><span class="cm-app-op">Since three years.</span><span class="cm-app-op">Three years ago.</span>
        <p class="cm-app-dica" data-out="a2">${I('info')}Sem cronômetro. Teste rápido: o app ajusta cada pergunta pela sua resposta e mostra o nível na hora.</p>
        <div class="cm-app-fim" data-in="a2"><span class="cm-app-nivel"><small>Seu nível</small><b>${esc(E.nivel)} · Intermediário</b></span><p>Plano sugerido: ${esc(E.clube.toLowerCase())}, 19h. A primeira aula experimental é ${esc(dataLonga(E.aulaExperimental.iso))}.</p><span class="cm-app-btn">Começar</span></div></div></div>`));
  },

  /* YouTube live: a creator shows the tech store's notebook, paid promotion notice for the first seconds,
     the pinned message with the waiting list of the white model. */
  ytLive: () => screen('ytlive', scene('live', 'base', 'escuro', LAB.youtubeLive({ title: 'Montando o setup de edição ao vivo #publi', meta: '<span>Transmitindo agora</span><span>#publi</span><b>…mais</b>',
    player: `${video('teclado169')}
      <span class="cm-paid" data-hs="1">${I('tag')}Inclui promoção paga${I('chevron')}</span><span class="cm-onair">Ao vivo</span>
      <span class="cm-lower" data-hs="2"><small>#publi</small><b>${esc(curta('varejo'))}</b><span>O notebook deste setup</span></span>`,
    chat: `<div class="cm-chat"><div class="cm-chat-head"><b>Chat ao vivo</b>${I('vdots')}</div>
      <div class="cm-chat-pin" data-hs="3" data-hs-at="tr"><span class="cm-chat-pinico">${I('pin')}</span><span><b>${esc(TERCEIROS.criadores.youtube)}</b> Lista de espera do ${esc(VA.skus[1].nome)} branco, que chega em ${esc(VA.skus[1].chegada.slice(8, 10))}/${esc(VA.skus[1].chegada.slice(5, 7))}: <u data-tap="link">entrar na lista</u></span></div>
      <div class="cm-chat-list">${[[TERCEIROS.comentaristas[0], 'boa noite, canal!'], [TERCEIROS.comentaristas[1], 'que setup bonito'], [TERCEIROS.comentaristas[2], 'qual programa de edição você usa?'], [TERCEIROS.comentaristas[3], 'esse notebook aguenta 4K?'], [TERCEIROS.comentaristas[4], 'tem a versão branca?'], ['Tati Rezende', 'curti o teclado'], ['Hugo Sá', 'manda o link do branco'], ['Nina Couto', 'a tela é fosca?'], ['Beto Lago', 'quanto tempo de bateria editando?', 'cm-chat-more'], ['Iara Melo', 'entrei na lista!', 'cm-chat-more']].map(([n, t, cls]) => `<p${cls ? ` class="${cls}"` : ''}>${avatar(n, 'cm-chat-av')}<b>${esc(n)}</b> ${esc(t)}</p>`).join('')}</div>
      <span class="cm-chat-input">Diga algo…</span></div>` })) +
    scene('page', 'push', 'claro', `${browserBar(`${VA.skus[1].nome} branco`, C.varejo.dominio)}${SITES.teclaria({ variant: 'espera' })}`)),

  /* LinkedIn: document ad with a lead form of the wealth manager. */
  liFeed: () => screen('li', scene('feed', 'base', 'claro', `<div class="cm-safe"><div class="cm-li-top"><i class="cm-tab-me"></i><span class="cm-li-search">${I('search')}Pesquisar</span>${I('comment')}</div>
    <article class="cm-li-post"><header class="cm-li-head">${marca('financas', 'quadrado')}<span><b>${esc(C.financas.marca)}</b><small>Promovido</small></span><span class="cm-li-follow">${I('plus')}Seguir</span></header>
    <p class="cm-li-text" data-hs="1">Empresa e família no mesmo patrimônio? Três sinais de que é hora de separar. <span>…mais</span></p>
    <div class="cm-doc"><div class="cm-doc-bar">${I('doc')}<b>${esc(FI.guia.titulo)}</b></div><div class="cm-doc-view" data-hs="2"><div class="cm-track">
      <figure class="cm-doc-page cm-doc-page--cover">${pic('reuniao45', { alt: 'Mesa de reunião de madeira vista de cima, capa do guia.', pos: '50% 60%' })}<figcaption><small>${esc(C.financas.marca)}</small><b>${esc(FI.guia.titulo)}</b></figcaption></figure>
      <figure class="cm-doc-page"><small>1</small><b>Contas que se misturam</b>${skel(4)}</figure>
      <figure class="cm-doc-page"><small>2</small><b>Sucessão sem plano</b>${skel(4)}</figure>
      <figure class="cm-doc-page cm-doc-page--gate">${skel(5)}<span><b>Para continuar lendo, envie suas informações.</b>${btn('Desbloquear', 'cta')}</span></figure>
    </div><span class="cm-doc-count"><i>1</i><i>2</i><i>3</i><i>4</i> de 4</span></div></div>
    <div class="cm-li-actions"><span>${I('thumb')}Gostei</span><span>${I('comment')}Comentar</span><span>${I('repost')}Compartilhar</span><span>${I('send')}Enviar</span></div></article><div class="cm-li-post">${skel(3)}</div></div>${tabbar(TABS.linkedin)}`) +
    scene('form', 'sheet', 'claro', SITES.linkedinForm())),

  /* Google Search: the dental clinic answers "dentista perto de mim" with a call. */
  gSearch: () => screen('g', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box" data-hs="1">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed"><span>dentista perto de mim</span></span>${I('close')}${I('mic')}${I('lens')}</div>
    <div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Mapas</span><span>Imagens</span><span>Notícias</span></div>
    <ul class="cm-g-suggest"><li>${I('search')}dentista perto de mim</li><li>${I('search')}dentista perto de mim aberto agora</li><li>${I('search')}dentista perto de mim avaliação</li></ul><div class="cm-g-results"><p class="cm-g-group">Resultado patrocinado</p>
      <div class="cm-g-ad"><div class="cm-g-site">${marca('clinica', 'fav')}<span><b>${esc(C.clinica.marca)}</b><small>https://www.${esc(C.clinica.dominio)} › avaliacao</small></span>${I('vdots')}</div>
      <b class="cm-g-title" data-hs="2">Avaliação com hora marcada | ${esc(C.clinica.marca)}</b>
      <p>Avaliação de 30 minutos, sem procedimento, para planejar o tratamento. ${esc(LEGAL.clinica || '')}</p>
      <span class="cm-g-links"><span>Agendar avaliação</span><span>Especialidades</span><span>Como chegar</span></span>
      <span class="cm-g-call" data-tap="cta" data-hs="3">${I('phone')}Ligar</span></div>
      <span class="cm-g-hide">Ocultar resultados patrocinados ${I('up')}</span>${skel(4, 'cm-skel--result')}${skel(3, 'cm-skel--result')}</div></div>`) +
    scene('call', 'sheet', 'claro', `<div class="cm-ios-sheet"><span class="cm-ios-group"><small>(11) 3•••-•120</small><span data-tap="go" data-hs="3">${I('phone')}Ligar</span></span><span class="cm-ios-cancel">Cancelar</span></div>
      <div class="cm-call"><small>chamando…</small><b data-hs="3">${esc(C.clinica.marca)}</b><span class="cm-call-keys"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="cm-call-end">${I('phone')}</span></div>`, 'cm-scene--part')),

  /* Google Display: the travel agency banner inside an article; the headline rotates as Google combines assets. */
  gDisplay: () => screen('gd', scene('article', 'base', 'claro', `<div class="cm-safe cm-web"><div class="cm-web-host"><b>${esc(TERCEIROS.portal.nome)}</b>${I('menu')}</div><small class="cm-web-kicker">Viagem</small><b class="cm-web-title">Festa do Divino: o que ver em ${esc(OFERTAS.turismo.cidade)}</b>${skel(5)}
    <div class="cm-gd-ad"><span class="cm-gd-flag">Anúncio ${I('close')}</span><span class="cm-gd-img" data-hs="1" data-hs-at="tl">${pic('pirenopolisRua45', { alt: 'Rua de pedra do centro histórico, com casario colonial.', pos: '50% 40%' })}</span>
      <div class="cm-gd-body"><span><b class="cm-gd-h" data-hs="2"><span>Festa do Divino em grupo pequeno</span><span>Guia da cidade e hotel no centro</span></b><small>${esc(C.turismo.marca)}</small></span><span class="cm-gd-go" data-tap="cta" data-hs="3">${I('chevron')}</span></div></div>${skel(5)}${skel(4)}</div>${safari(TERCEIROS.portal.dominio)}`) +
    scene('page', 'push', 'claro', `${SITES.bandeirola({ variant: 'saida' })}${safari(C.turismo.dominio)}`, 'cm-scene--web')),

  /* SEO: organic result of the developer with sitelinks; the floor plans page trades the PDF for an e-mail. */
  seoOrganic: () => screen('g', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed is-done"><span>casa na falésia à venda</span></span>${I('close')}${I('mic')}${I('lens')}</div>
    <div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Imagens</span><span>Mapas</span><span>Notícias</span></div>
    <div class="cm-g-faded" aria-hidden="true">${skel(3)}</div>
    <div class="cm-g-result cm-g-result--organic"><div class="cm-g-site">${marca('incorporadora', 'fav')}<span><b>${esc(C.incorporadora.marca)}</b><small>${esc(C.incorporadora.dominio)} › plantas</small></span>${I('vdots')}</div>
      <div class="cm-g-main"><b class="cm-g-title" data-hs="1">Casas na falésia com vista para o mar</b>${pic('coast', { cls: 'cm-g-thumb', pos: '30% 50%' })}</div>
      <p>Plantas de 3 e 4 quartos, sala voltada para o mar e visita ao decorado com hora marcada.</p>
      <span class="cm-g-list"><span data-tap="link">Plantas${I('chevron')}</span><span>Localização${I('chevron')}</span><span>Agendar visita${I('chevron')}</span></span></div>${skel(3, 'cm-skel--result')}</div>`) +
    scene('page', 'push', 'claro', `<div class="cm-lp" style="--brand:${C.incorporadora.cor}"><span class="cm-lp-hero">${pic('salaMar45', { pos: '50% 40%' })}</span><div class="cm-lp-body"><span class="cm-lp-brand">${marca('incorporadora')}<b>${esc(C.incorporadora.marca)}</b></span><b class="cm-lp-title">Plantas</b>
      <span class="cm-seg" data-hs="2"><span class="cm-seg-3">3 quartos</span><span class="cm-seg-4">4 quartos</span></span>${planta('cm-planta--lp')}${btn('Receber as plantas em PDF', 'pdf')}</div>
      <div class="cm-sheet cm-mail"><span class="cm-grabber"></span><b class="cm-lp-title">Receber as plantas</b>${input('Seu e-mail', PESSOA.email)}${btn('Enviar', 'send')}</div>
      ${done('Enviamos as plantas para o seu e-mail', 'Plantas de 3 e 4 quartos, em PDF.', `<small class="cm-legal">${esc(LEGAL.incorporadora || '')}</small>`)}</div>${safari(C.incorporadora.dominio)}`, 'cm-scene--web')),

  /* ChatGPT: the travel agency card below an answer, separated from it, and the in-app browser. */
  gptAnswer: () => screen('gpt', scene('chat', 'base', 'claro', `<div class="cm-gpt-top"><span class="cm-glass">${I('menu2')}</span><b>ChatGPT</b><span class="cm-glass cm-glass--pill">${I('edit')}${I('dots')}</span></div>
    <div class="cm-gpt-flow"><p class="cm-gpt-user" data-hs="1" data-hs-at="tl">Quero ver uma festa tradicional no interior em maio. Por onde começo?</p>
      <span class="cm-gpt-think sf-activity" aria-hidden="true"><span class="sf-activity-dot"></span><span>Procurando festas tradicionais de maio</span></span>
      <div class="cm-gpt-answer"><p>Se você me disser:</p><ul><li>quantos <b>dias</b> você tem,</li><li>de qual <b>cidade</b> sai,</li><li>se prefere <b>procissão, música ou cavalhadas</b>,</li><li>e se viaja <b>com crianças</b>,</li></ul><p>eu indico as 3 cidades que mais combinam com a sua viagem.</p></div>
      <div class="cm-gpt-actions">${I('copy')}${I('thumb', 'cm-i--flip')}${I('share')}${I('regen')}${I('dots')}<span class="cm-gpt-src"><i>R</i><i>G</i><i>T</i>Fontes</span></div>
      <p class="cm-gpt-user cm-gpt-q2" data-hs="1" data-hs-at="tl">3 dias, saindo de SP, cavalhadas</p>
      <span class="cm-gpt-think cm-gpt-think2 sf-activity" aria-hidden="true"><span class="sf-activity-dot"></span><span>Comparando cidades com cavalhadas</span></span>
      <div class="cm-gpt-answer cm-gpt-a2"><p>Com 3 dias, eu iria para <b>${esc(OFERTAS.turismo.cidade)}</b>: na Festa do Divino tem mascarados pelas ruas e as cavalhadas de domingo a terça.</p><ul><li><b>Dia 1:</b> voo até Brasília e 2 horas de carro;</li><li><b>Dia 2:</b> centro histórico e mascarados;</li><li><b>Dia 3:</b> cavalhadas e volta.</li></ul></div>
      <div class="cm-gpt-actions cm-gpt-a2">${I('copy')}${I('thumb', 'cm-i--flip')}${I('share')}${I('regen')}${I('dots')}</div>
      <div class="sf-suggestions cm-gpt-a2" aria-hidden="true"><span class="sf-suggestion">Quando são as cavalhadas?</span><span class="sf-suggestion">Onde ficar em Pirenópolis?</span></div>
      <hr><p class="cm-gpt-lead">Para a sua viagem para ver as cavalhadas, aqui está uma opção para considerar.</p>
      <div class="cm-gpt-ad" data-tap="cta" data-hs="2 3" data-hs-at="tl">${pic('pirenopolisRua916', { cls: 'cm-gpt-ad-img', pos: '50% 30%' })}<span class="cm-gpt-ad-body"><span class="cm-gpt-ad-top">${marca('turismo', 'fav')}<span>${esc(C.turismo.marca)}</span><small class="cm-gpt-chip">Patrocinado</small>${I('dots')}</span><b>Festa do Divino em grupo pequeno</b><small>Roteiros com guia da cidade e hotel no centro histórico. Saiba mais.</small></span></div>
      <span class="cm-gpt-down" aria-hidden="true">${I('up', 'cm-i--flip')}</span></div>
    <div class="cm-gpt-input">${I('plus')}<span class="cm-gpt-ph">Pergunte ao ChatGPT</span><span class="cm-typed cm-gpt-typed"><span>3 dias, saindo de SP, cavalhadas</span></span>${I('mic')}<i class="cm-gpt-wave">${I('wave')}</i><i class="cm-gpt-send" data-tap="gsend">${I('up')}</i></div>`) +
    scene('page', 'sheet', 'claro', `${browserBar(C.turismo.marca, C.turismo.dominio, 'share')}${SITES.bandeirola()}`)),

  /* Google Maps: promoted square pin and sponsored place sheet of the restaurant, then the route. */
  mapsLocal: () => {
    const area = inner => `<div class="cm-map">${pic('mapa', { cls: 'cm-map-bg' })}<div class="cm-map-area">${inner}</div></div>`;
    const drops = [[86, 150], [178, 118], [130, 360], [300, 420], [60, 290]].map(([x, y]) => `<span class="cm-drop" style="left:${x / 3.6}%;top:${y / 6.4}%">${I('fork')}</span>`).join('');
    const nome = C.restaurante.marca;
    return screen('maps', scene('map', 'base', 'claro', `${area(`${drops}<span class="cm-promo cm-promo--left" style="left:${252 / 3.6}%;top:${224 / 6.4}%"><span class="cm-promo-sq" data-hs="1">${I('fork')}</span><span class="cm-promo-text"><b>${esc(nome)}</b><small>Feijoada completa aos sábados</small></span></span><span class="cm-me" style="left:${108 / 3.6}%;top:${544 / 6.4}%"></span>`)}
      <div class="cm-maps-search">${I('back')}<span class="cm-typed"><span>feijoada perto de mim</span></span>${I('close')}</div>
      <div class="cm-maps-chips" aria-hidden="true"><span class="is-on">${I('fork')}Restaurantes</span><span>Aberto agora</span><span>Para o almoço</span><span>Mais bem localizados</span></div>
      <div class="cm-place"><span class="cm-grabber"></span>
        <div class="cm-place-row"><span><small class="cm-sp">Patrocinado</small><b>${esc(nome)}</b><small>Restaurante · <em>${esc(R.abreHoje)}</em></small></span>${pic('fachada43', { alt: 'Fachada de madeira do restaurante à noite, com flores e mesas na calçada.', pos: '50% 40%' })}</div>
        <div class="cm-place-full"><span class="cm-place-top"><small class="cm-sp">Patrocinado ${I('vdots')}</small><span><i>${I('share')}</i><i>${I('close')}</i></span></span><b class="cm-place-name">${esc(nome)}</b><small>Restaurante</small><small><em>${esc(R.abreHoje)}</em></small>
          <span class="cm-place-ad" data-hs="2"><b>Feijoada completa aos sábados</b><small>Encomendas e mesa para o almoço.</small><small>${esc(C.restaurante.dominio)}</small><span>Acessar site</span></span>
          <span class="cm-place-chips"><span class="is-primary" data-tap="cta" data-hs="3">${I('route')}Rotas</span><span>${I('calendar')}Reservar</span><span>${I('phone')}Ligar</span><span>${I('share')}Compartilhar</span></span>
          <span class="cm-place-photos">${pic('fachada43', { pos: '50% 40%' })}${pic('prato11')}</span></div></div>`) +
      scene('route', 'fade', 'claro', `${area(`<svg class="cm-route" viewBox="0 0 360 640" preserveAspectRatio="none" aria-hidden="true"><path d="M108,544 L108,464 L180,464 L180,304 L252,304 L252,224" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="M108,544 L108,464 L180,464 L180,304 L252,304 L252,224" fill="none" stroke="#1a73e8" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="cm-promo cm-promo--end" style="left:${252 / 3.6}%;top:${224 / 6.4}%"><span class="cm-promo-sq">${I('fork')}</span></span><span class="cm-me" style="left:${108 / 3.6}%;top:${544 / 6.4}%"></span>`)}
      <div class="cm-route-top"><span class="cm-route-ends"><span><i class="cm-route-a"></i>Seu local</span><span>${I('location')}${esc(nome)}</span></span><span class="cm-route-modes"><b>${I('car')}</b>${I('bus')}${I('walk')}</span></div>
      <div class="cm-route-sheet"><span class="cm-grabber"></span><b>De carro</b><small>Pelo caminho indicado no mapa</small>${btn('Iniciar', 'go', '3', 'cm-btn--maps')}</div>
      <div class="cm-route-nav" data-hs="3"><b>Siga pela ${esc(TERCEIROS.ruas.rota[0])}</b><small>Navegação iniciada até ${esc(nome)}</small></div>`));
  },

  /* WhatsApp click-to-chat: Instagram ad of the dental clinic, app switch, pre-filled message, quick replies. */
  waAd: () => {
    const nome = C.clinica.marca, quinta = opcaoHorario(avaliacao.iso, avaliacao.hora);
    return screen('wa', scene('ad', 'base', 'escuro', LAB.feedAd({ key: 'clinica', captionOpen: true,
      media: `<div class="cm-wa-art">${pic('recepcao45', { alt: 'Recepção da clínica com parede terracota, com a frase Avaliação com hora marcada.' })}<b data-hs="1">Avaliação com hora marcada</b>${marca('clinica', 'circulo', 'cm-wa-art-mark')}</div>`,
      cta: { text: 'Enviar mensagem pelo WhatsApp', lead: `${logoSvg('whatsapp', { altura: 16, classe: 'cm-wa-glyph' })}${logoSvg('whatsapp', { altura: 16, mono: 'branco', classe: 'cm-wa-glyph cm-wa-glyph--lit' })}` },
      caption: { hs: '2', html: 'Avaliação com hora marcada. <span class="cm-more">mais</span><span class="cm-rest">Conte o que você sente e escolha o horário pela conversa.</span>' } })) +
      scene('chat', 'push', 'claro', `<span class="cm-crumb">${I('back')}Instagram</span><div class="cm-wa-head">${I('back')}${marca('clinica')}<span><b>${esc(nome)}</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>
        <div class="cm-wa-body"><span class="cm-wa-sys">As mensagens são protegidas com a criptografia de ponta a ponta.</span><span class="cm-wa-day">Hoje</span>
          <div class="cm-wa-out cm-wa-msg1"><span class="cm-wa-quote">${pic('recepcao45')}<span><b>${esc(nome)}</b><small>Avaliação com hora marcada</small></span></span>Olá! Quero agendar uma avaliação.<small>10:09 ${I('ticks')}</small></div>
          <span class="cm-wa-typing cm-wa-msg2" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wa-msg2 cm-arrive">Olá! Aqui é a assistente virtual da ${esc(nome)}. Como posso ajudar?<small>10:09</small><span class="cm-wa-listbtn" data-tap="list" data-hs="3">${I('menu')}Ver opções</span></div>
          <div class="cm-wa-out cm-wa-msg3">Avaliação odontológica<small>10:09 ${I('ticks')}</small></div>
          <span class="cm-wa-typing cm-wa-msg3" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wa-msg3 cm-arrive">Perfeito. Qual período fica melhor para você?<small>10:09</small></div>
          <span class="cm-wa-replies cm-wa-replies--row cm-wa-msg3 cm-wa-r3 cm-arrive cm-arrive--late"><span data-tap="per">Manhã</span><span>Tarde</span><span>Noite</span></span>
          <div class="cm-wa-out cm-wa-msg4">Manhã<small>10:10 ${I('ticks')}</small></div>
          <span class="cm-wa-typing cm-wa-msg4" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wa-msg4 cm-arrive">Tenho estes horários pela manhã:<small>10:10</small></div>
          <span class="cm-wa-replies cm-wa-msg4 cm-wa-r4 cm-arrive cm-arrive--late" data-hs="3"><span data-tap="hor">${esc(quinta)}</span><span>${esc(opcaoHorario('2026-10-30', '10:30'))}</span><span>Outro dia</span></span>
          <div class="cm-wa-out cm-wa-msg5">${esc(quinta)}<small>10:10 ${I('ticks')}</small></div>
          <span class="cm-wa-typing cm-wa-msg5" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wa-msg5 cm-arrive cm-wa-confirm" data-hs="3"><b>Avaliação agendada</b><span>${esc(cap(dataLonga(avaliacao.iso)))}, às ${esc(horaFala(avaliacao.hora))}</span><span>Avaliação odontológica, 30 minutos</span><span>Se precisar remarcar, é só responder aqui.</span><small>10:10</small></div>
          <div class="cm-wa-in cm-wa-msg5 cm-arrive cm-arrive--late cm-wa-loc"><span class="cm-wa-map">${pic('mapa', { pos: '62% 36%' })}<i>${I('location')}</i></span><b>${esc(nome)}</b><span>${esc(ruaClinica)}</span><small>10:10</small></div></div>
        <div class="cm-wa-sheet" aria-hidden="true"><span class="cm-grabber"></span><p class="cm-wa-sheet-top">${I('close')}<b>Ver opções</b><i></i></p><small>Atendimentos</small>
          <span class="cm-wa-opt cm-wa-opt--pick" data-tap="opt"><span><b>Avaliação odontológica</b><small>Primeira consulta, 30 minutos</small></span><i></i></span>
          <span class="cm-wa-opt"><span><b>Limpeza e prevenção</b><small>45 minutos</small></span><i></i></span>
          <span class="cm-wa-opt"><span><b>Dor ou urgência</b><small>Encaixe no mesmo dia, conforme a agenda</small></span><i></i></span>
          <span class="cm-wa-opt"><span><b>Falar com a recepção</b><small>Horário comercial</small></span><i></i></span>
          <span class="cm-wa-sheet-send" data-tap="lsend">Enviar</span></div>
        <div class="cm-wa-compose"><span class="cm-wa-preview">${pic('recepcao45')}<span><b>${esc(nome)}</b><small>Avaliação com hora marcada</small></span></span><span class="cm-wa-row">${I('plus')}<span class="cm-wa-field">Olá! Quero agendar uma avaliação.</span><span class="cm-wa-send" data-tap="send" data-hs="3">${I('send')}</span><span class="cm-wa-idle">${I('camera')}${I('mic')}</span></span></div>`));
  },

  /* WhatsApp Business catalog (not an ad): profile, collections, item, message with the item attached. */
  waCatalog: () => {
    const nome = C.restaurante.marca, enc = R.encomenda;
    return screen('wacat', scene('profile', 'base', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span></span>${I('dots')}</div><div class="cm-wa-profile">${marca('restaurante', 'circulo', 'cm-mark--xl')}<b>${esc(nome)}</b><small>Conta comercial</small><span class="cm-wa-tools"><span>${I('phone')}Áudio</span><span>${I('video')}Vídeo</span><span>${I('search')}Pesquisar</span></span><small class="cm-wa-cat">Restaurante · Cozinha brasileira</small></div>
      <div class="cm-wa-shelf"><p><b>Catálogo</b><span data-tap="more">Ver tudo ${I('chevron')}</span></p><span class="cm-wa-thumbs" data-hs="1">${pic('panela11')}${pic('escondidinho11')}${pic('pudim11')}</span></div>
      <div class="cm-wa-rows"><span>${I('bell')}Silenciar notificações</span><span>${I('lock')}Criptografia</span></div></div>`) +
      scene('catalog', 'push', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span><b>Catálogo</b><small>${esc(nome)}</small></span>${I('share')}</div>
        <div class="cm-wa-coll"><p><b>Encomendas de sábado</b><span>Ver tudo</span></p><ul data-hs="2"><li data-tap="item">${pic('panela11')}<span><b>${esc(enc.item)}</b><small>Carnes separadas, arroz, couve e farofa.</small></span></li><li>${pic('escondidinho11')}<span><b>Escondidinho de carne-seca</b><small>Gratinado na panelinha, para 2.</small></span></li></ul>
        <p><b>Doces</b><span>Ver tudo</span></p><ul><li>${pic('pudim11')}<span><b>Pudim de leite</b><small>Inteiro, feito na casa.</small></span></li></ul></div></div>`) +
      scene('item', 'push', 'claro', `<div class="cm-safe"><div class="cm-wa-bar">${I('back')}<span></span>${I('share')}</div><span class="cm-wa-photo">${pic('panela11')}</span><div class="cm-wa-item"><b>${esc(enc.item)}</b><p>Carnes separadas, arroz, couve e farofa. Encomenda até sexta.</p><span class="cm-wa-qty"><i>−</i><b>1</b><i>+</i></span>${btn('Adicionar ao carrinho', 'add', '3', 'cm-btn--wa')}<span class="cm-wa-msglink">${I('comment', 'cm-i--inline')}Conversar com a empresa</span></div>
        <span class="cm-wa-cartbar" data-tap="cart">${I('cart')}<b>Ver carrinho</b><small>1 item</small></span></div>`) +
      scene('cart', 'sheet', 'claro', `<div class="cm-sheet cm-wa-cart"><span class="cm-grabber"></span><p class="cm-wa-sheet-top">${I('close')}<b>Carrinho</b><i></i></p><div class="cm-wa-cartline">${pic('panela11')}<span><b>${esc(enc.item)}</b><small>${esc(nome)}</small></span><span class="cm-wa-qty cm-wa-qty--sm"><i>−</i><b>1</b><i>+</i></span></div><span class="cm-wa-note">${I('edit', 'cm-i--inline')}Adicionar observação: para sábado</span>${btn('Fazer pedido', 'order', '3', 'cm-btn--wa')}</div>`, 'cm-scene--part') +
      scene('chat', 'push', 'claro', `<div class="cm-wa-head">${I('back')}${marca('restaurante')}<span><b>${esc(nome)}</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>
        <div class="cm-wa-body"><span class="cm-wa-day">Hoje</span>
          <div class="cm-wa-out cm-wa-orderout"><span class="cm-wa-orderthumb">${pic('panela11')}<span><b>${I('cart', 'cm-i--inline')}1 item</b><small>Pedido para sábado</small></span></span><span class="cm-wa-orderlink">Ver itens enviados</span><small>10:09 ${I('ticks')}</small></div>
          <span class="cm-wa-typing cm-wc1" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wc1 cm-arrive">Oi! Aqui é a assistente virtual da ${esc(nome)}. Como prefere receber?<small>10:09</small></div>
          <span class="cm-wa-replies cm-wc1 cm-wcg cm-wr1 cm-arrive cm-arrive--late" data-hs="3"><span data-tap="r1">Retirar no balcão</span><span>Entrega</span></span>
          <div class="cm-wa-out cm-wc2">Retirar no balcão<small>10:09 ${I('ticks')}</small></div>
          <span class="cm-wa-typing cm-wc2" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wc2 cm-arrive">Perfeito. Para qual horário de sábado?<small>10:09</small></div>
          <span class="cm-wa-replies cm-wa-replies--row cm-wc2 cm-wcg cm-wr2 cm-arrive cm-arrive--late"><span>11h</span><span data-tap="r2">12h</span><span>13h</span></span>
          <div class="cm-wa-out cm-wc3">12h<small>10:09 ${I('ticks')}</small></div>
          <span class="cm-wa-typing cm-wc3" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wa-order cm-wc3 cm-arrive"><b>Resumo do pedido</b><span>${esc(enc.item)}</span><span>Retirada no balcão, sábado às 12h</span><span class="cm-wa-order-btn cm-wr3" data-tap="ok">Confirmar pedido</span><small>10:09</small></div>
          <span class="cm-wa-typing cm-wc4" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="cm-wa-in cm-wc4 cm-arrive">Pedido ${esc(PEDIDOS['whatsapp/catalogo'])} confirmado. Você recebe um lembrete no sábado às 9h.<small>10:09</small></div>
        </div>
        <div class="cm-wa-compose"><span class="cm-wa-row">${I('plus')}<span class="cm-wa-field cm-wa-field--empty"></span>${I('camera')}${I('mic')}</span></div>`));
  },

  /* Sponsored article: the wealth manager's content in a fictitious publication, identified above the title,
     signed by the publication's studio, with a checklist; the offer block and the scheduling page. */
  blogArticle: () => {
    const k = 'financas', nome = C[k].marca;
    const corpo = `<p class="blog-texto">Em muitas empresas familiares, o patrimônio da família e o da empresa cresceram juntos. Quando chega a hora de passar o comando, a mistura vira dúvida: o que é de quem, quem decide e o que acontece se alguém sair.</p>
      <b class="blog-inter" data-hs="2">Comece pelo inventário</b><p class="blog-texto">Antes de falar em holding ou testamento, liste o que existe: participações, imóveis, contas e dívidas, em nome de quem estão e quem depende de cada coisa.</p>
      <blockquote class="blog-citacao">“A sucessão começa numa planilha, não num cartório.”</blockquote>
      <b class="blog-inter">Converse antes de assinar</b><p class="blog-texto">Sucessão é decisão de família. Reúna quem vai assumir, quem vai sair e quem só herda, e combine as regras por escrito antes de escolher o instrumento.</p>
      <div class="blog-check" data-hs="2"><b>Checklist: 5 documentos para começar a sucessão</b><ol><li>Contrato social e alterações</li><li>Matrículas dos imóveis</li><li>Extratos de contas e investimentos</li><li>Certidão de casamento e regime de bens</li><li>Lista de dívidas e garantias</li></ol></div>
      <b class="blog-inter">Escolha o instrumento depois</b><p class="blog-texto">Doação com reserva de usufruto, holding familiar e testamento resolvem problemas diferentes. Cada um tem custo, imposto e efeito para a família.</p>
      <div class="blog-autor-bloco">${marca(k, 'circulo', 'blog-autor-av')}<span><b>Estúdio ${esc(revista.nome)}</b><small>Conteúdo produzido para ${esc(nome)}. A redação não participou.</small></span></div>`;
    return screen('blog', scene('article', 'base', 'escuro', LAB.blogArticle({ key: k, site: revista.nome, domain: revista.dominio, kicker: 'Empresa & família',
      title: 'Sucessão na empresa familiar: por onde começar', by: `Estúdio ${revista.nome} para ${nome}`, data: dataLonga(FI.guia.iso, true).split(', ')[1],
      photo: pic('salaJantar45', { alt: 'Mesa branca com duas cadeiras e um vaso de orquídea, imagem de abertura do artigo.', pos: '50% 55%' }),
      body: corpo,
      offer: { text: 'Um especialista explica cada decisão antes de você assinar. Conversa de 30 minutos, por vídeo.', button: 'Agendar conversa', legal: LEGAL[k] || '' },
      tail: `<div class="blog-leia"><b>Leia também</b><span>Testamento, doação ou holding: o que muda para a família</span><span>Como falar de sucessão com quem vai assumir</span></div>` }), '', 'claro') +
      scene('page', 'push', 'claro', `${SITES.arrimo()}${safari(C[k].dominio)}`, 'cm-scene--web'));
  },

  /* TikTok bank switch is inside ttFeed; YouTube Shorts store and app are inside ytShorts. */
};

/* Front of the peel per channel: the piece of the first placement's client, in the native frame of the
   format (formato), with one line of offer and a CTA chip. */
const art = (cliente, img, pos, titulo, alt, extra = {}) => ({ cliente, img, pos, titulo, alt, ...extra });

export const groups = [
  { id: 'social', label: 'Redes sociais' },
  { id: 'search', label: 'Busca e IA' },
  { id: 'local', label: 'Local e conversa' },
  { id: 'content', label: 'Conteúdo' },
  { id: 'retencao', label: 'Pagamento e retenção' },
];

/* Backstage of the Meta flows that end on a site: what the Pixel, the site, the CRM and the
   Conversions API record. */
const metaSite = (t, detalhe) => [L(t, 'Meta Pixel', 'ViewContent', detalhe, 'sinal')];
const metaLead = (t1, t2, t3, oque, origem) => [L(t1, 'Site', 'Lead enviado', oque, 'conversao'), L(t2, 'CRM', 'Contato criado', origem, 'dado'), L(t3, 'Meta CAPI', 'Lead com event_id deduplicado', 'o mesmo evento do navegador e do servidor conta uma vez', 'sinal')];

const aula = E.aulaExperimental, td = AU.testDrive, reserva = R.reserva, conversa = FI.conversa;
export const channels = [
  { id: 'instagram', name: 'Instagram', group: 'social', benefit: 'Prender no feed e levar à ação.',
    art: art('educacao', 'escola45', '50% 50%', C.educacao.assinatura, `Peça da ${C.educacao.marca}, escola de idiomas fictícia: fone de ouvido sobre a mesa e a pergunta Você entende a série sem legenda?`, { formato: '4:5', oferta: 'Teste de nível grátis e aula experimental de 30 min', cta: 'Fazer o teste' }),
    placements: [
      { id: 'feed', label: 'Feed', mock: 'igFeed', cliente: 'educacao', selo: 'Anúncio', frase: 'Uma escola de idiomas leva do carrossel ao teste de nível e à aula marcada.',
        objetivo: 'Leads: aula experimental marcada',
        passos: passos3(['Pergunta que o aluno reconhece', [0]], ['Deslizar revela a expressão', [1, 2]], ['Teste de nível e aula marcada', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]]),
        quadros: [
          { ms: 1400, cena: 'ad', desc: `Anúncio da ${curta('educacao')} no feed do Instagram: Você entende a série sem legenda?` },
          { ms: 1400, cena: 'ad', estado: 'c2', desc: 'O carrossel desliza: três expressões que a legenda traduz ao pé da letra.' },
          { ms: 1500, cena: 'ad', estado: 'c3 lit', desc: 'Break a leg quer dizer boa sorte. A barra Inscrever-se agora ganha cor.' },
          { ms: 900, cena: 'ad', estado: 'c3 lit', toque: 'cta', desc: 'Toque em Inscrever-se agora.' },
          { ms: 1800, cena: 'page', toque: 'a', desc: `O site da ${curta('educacao')} abre no navegador do Instagram: teste de nível e aula de 30 min. Toque em Fazer o teste.`, log: metaSite('10:09:31', 'página da aula experimental, fbclid no link') },
          { ms: 1100, cena: 'page', estado: 'w2', toque: 'b', desc: 'Pergunta 1 de 3: como se diz boa sorte antes de uma apresentação? Toque em Break a leg.' },
          { ms: 1100, cena: 'page', estado: 'w3 q1', toque: 'c', desc: 'Pergunta 2 de 3: o que quer dizer it’s up to you? Toque em Você que decide.' },
          { ms: 1100, cena: 'page', estado: 'w4 q1 q2', toque: 'd', desc: 'Pergunta 3 de 3: complete a frase. Toque em learning.' },
          { ms: 900, cena: 'page', estado: 'w4 q1 q2 q3', toque: 'e', desc: 'Certo, essa é do nível intermediário. Toque em Ver meu resultado.' },
          { ms: 1600, cena: 'page', estado: 'w5 q3', desc: `Resultado: nível ${E.nivel}. A aula de 30 min fica para ${dataLonga(aula.iso)}, on-line.`, log: [L('10:10:12', 'Site', 'Teste de nível concluído', `resultado ${E.nivel}`, 'dado')] },
          { ms: 900, cena: 'page', estado: 'w5 q3', toque: 'f', desc: `Toque em ${aula.hora}.` },
          { ms: 800, cena: 'page', estado: 'w5 q3 q4', toque: 'g', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w6 q4', toque: 'h', desc: 'Nome, e-mail e WhatsApp já preenchidos. Toque em Confirmar aula.' },
          { ms: 2000, cena: 'page', estado: 'w7 done', hora: '10:11', desc: `Aula marcada: ${dataLonga(aula.iso)}, ${horaFala(aula.hora)}, on-line, 30 min. O convite chega por e-mail.`, log: metaLead('10:11:02', '10:11:03', '10:11:04', `aula experimental, ${dataCurta(aula.iso)} ${aula.hora}`, 'origem: Instagram, carrossel do teste') },
        ] },
      { id: 'reels', label: 'Reels', mock: 'igReels', cliente: 'restaurante', selo: 'Anúncio', frase: 'Um restaurante leva do Reels à reserva de mesa.',
        objetivo: 'Reservas para o almoço de sábado',
        passos: passos3(['O fogo sob o tacho no primeiro segundo', [0]], ['Corte para o prato servido', [1]], ['Menu, horário e reserva', [2, 3, 4, 5, 6, 7, 8, 9]]),
        quadros: [
          { ms: 1500, cena: 'video', video: 1, desc: `Reels da ${C.restaurante.marca} com Anúncio: o fogo aceso sob o tacho e O feijão vai pro tacho às 6h.` },
          { ms: 1900, cena: 'video', estado: 's2 lit', video: 1, desc: 'Corta para o prato: Sábado tem feijoada completa. O botão Ver menu ganha cor.' },
          { ms: 900, cena: 'video', estado: 's2 lit', video: 1, toque: 'cta', desc: 'Toque em Ver menu.' },
          { ms: 1700, cena: 'page', desc: `O site abre no navegador do Instagram: ${R.abreHoje.toLowerCase()}, com o cardápio de sábado.`, log: metaSite('10:09:28', 'cardápio de sábado, fbclid no link') },
          { ms: 800, cena: 'page', toque: 'a', desc: 'Toque em Reservar mesa.' },
          { ms: 1300, cena: 'page', estado: 'w2', toque: 'b', desc: `Sábado, ${Number(reserva.iso.slice(8))}, para ${reserva.pessoas} pessoas, no salão. Toque em ${reserva.hora}.` },
          { ms: 800, cena: 'page', estado: 'w2 q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1300, cena: 'page', estado: 'w3 q1', toque: 'd', desc: 'Nome e WhatsApp já preenchidos. É uma ocasião especial? Toque em Aniversário.' },
          { ms: 800, cena: 'page', estado: 'w3 q1 q2', toque: 'e', desc: 'Toque em Confirmar reserva.' },
          { ms: 2000, cena: 'page', estado: 'w4 done', hora: '10:10', desc: `Reserva solicitada: ${dataLonga(reserva.iso)}, ${horaFala(reserva.hora)}, ${reserva.pessoas} pessoas. A confirmação chega pelo WhatsApp.`, log: metaLead('10:10:21', '10:10:22', '10:10:23', `mesa para ${reserva.pessoas}, ${dataCurta(reserva.iso)} ${reserva.hora}`, 'origem: Instagram, Reels') },
        ] },
      { id: 'story', label: 'Story', mock: 'igstory', cliente: 'clinica', selo: 'Anúncio', frase: 'Uma clínica pergunta numa enquete e marca a avaliação pela conversa no Direct.',
        objetivo: 'Conversas que viram agendamento',
        passos: passos3(['A frase da clínica na foto', [0]], ['Enquete: você tem medo de dentista?', [1, 2, 3]], ['Resposta no Direct e horário marcado', [4, 5, 6, 7, 8, 9, 10]]),
        quadros: [
          { ms: 1500, cena: 'story', video: 1, desc: `Story da ${C.clinica.marca} com Anúncio: ${C.clinica.assinatura}` },
          { ms: 1500, cena: 'story', estado: 'pl', video: 1, desc: 'Uma enquete entra no story: Você tem medo de dentista?' },
          { ms: 900, cena: 'story', estado: 'pl', video: 1, toque: 'poll', desc: 'Toque em Um pouco.' },
          { ms: 1400, cena: 'story', estado: 'pl vt', video: 1, desc: 'O voto fica marcado. Embaixo, o campo Enviar mensagem leva a conversa para o Direct.', log: [L('10:09:24', 'Instagram', 'Voto na enquete', 'resposta: um pouco', 'sinal')] },
          { ms: 1300, cena: 'story', estado: 'pl vt ty', video: 1, toque: 'send', desc: 'Você responde ao story: Um pouco. Como é a avaliação? Toque em enviar.' },
          { ms: 1500, cena: 'dm', estado: 'd1', desc: 'A conversa abre no Direct da clínica, com o story respondido e a sua mensagem.', log: [L('10:09:33', 'Instagram API', 'Mensagem recebida', 'resposta ao story do anúncio', 'dado')] },
          { ms: 2400, cena: 'dm', estado: 'd1 d2', desc: `A assistente virtual se apresenta: 30 minutos, sem procedimento, e a ${CL.responsavel} explica o plano.`, log: [L('10:09:36', 'Agente', 'Assistente virtual responde', 'diz que é IA e oferece a recepção', 'evento')] },
          { ms: 800, cena: 'dm', estado: 'd1 d2', toque: 'h', desc: 'Toque em Ver horários.' },
          { ms: 1700, cena: 'dm', estado: 'd1 d2 d3', desc: `Horários livres: ${dataCurta(avaliacao.iso)}, ${horaFala(avaliacao.hora)}, ou ${dataCurta(CL.alternativa.iso)}, ${horaFala(CL.alternativa.hora)}.`, log: [L('10:09:44', 'Agenda', 'Horários consultados', `unidade ${avaliacao.unidade}`, 'dado')] },
          { ms: 800, cena: 'dm', estado: 'd1 d2 d3', toque: 'hr', desc: `Toque em ${dataCurta(avaliacao.iso)}, ${avaliacao.hora}.` },
          { ms: 2400, cena: 'dm', estado: 'd1 d2 d3 d4 done', hora: '10:10', desc: `Avaliação marcada no Direct: ${dataLonga(avaliacao.iso)}, ${horaFala(avaliacao.hora)}, com o endereço da unidade.`, log: [L('10:10:02', 'Agenda', 'Avaliação marcada', `${dataCurta(avaliacao.iso)} ${avaliacao.hora}`, 'conversao'), L('10:10:03', 'CRM', 'Contato criado', 'origem: Instagram, story com enquete', 'dado'), L('10:10:04', 'Meta CAPI', 'Lead com event_id deduplicado', 'evento de conversa, origem do anúncio', 'sinal')] },
        ] },
      { id: 'live', label: 'Live', mock: 'iglive', cliente: 'restaurante', selo: 'Anúncio', frase: 'Um restaurante cozinha ao vivo e recebe o pedido para retirada.',
        objetivo: 'Encomendas para retirada',
        passos: passos3(['Ao vivo: o fogo sob o tacho', [0]], ['Comentário respondido na live', [1, 2]], ['Menu por mensagem e pedido', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]]),
        quadros: [
          { ms: 1500, cena: 'live', video: 1, desc: `Live da ${C.restaurante.marca} com Anúncio: o fogo sob o tacho, ao vivo, e os comentários passando.` },
          { ms: 1500, cena: 'live', estado: 'c1', video: 1, desc: 'Chega um comentário: Dá para encomendar para sábado?' },
          { ms: 1900, cena: 'live', estado: 'c1 c2', video: 1, desc: 'A casa responde na live: comenta FEIJOADA que o menu de sábado chega por mensagem.' },
          { ms: 1300, cena: 'live', estado: 'c1 c2 ty', video: 1, toque: 'send', desc: 'Você escreve FEIJOADA no campo. Toque em enviar.' },
          { ms: 1700, cena: 'live', estado: 'c1 c2 c3 bn', video: 1, desc: 'Seu comentário aparece na live e chega uma mensagem da casa.', log: [L('10:09:41', 'Instagram API', 'Comentário com FEIJOADA', 'chega pelo webhook de comentários da live', 'dado'), L('10:09:42', 'Agente', 'Resposta privada enviada', 'uma por comentário, com a live no ar', 'evento')] },
          { ms: 800, cena: 'live', estado: 'c1 c2 c3 bn', video: 1, toque: 'bn', desc: 'Toque na mensagem.' },
          { ms: 1900, cena: 'dm', desc: 'Em Solicitações, a assistente virtual da casa manda o menu de sábado, com retirada no balcão.' },
          { ms: 800, cena: 'dm', toque: 'menu', desc: 'Toque em Ver menu.' },
          { ms: 1700, cena: 'page', toque: 'a', desc: `O menu abre no navegador do Instagram: encomendas para ${dataLonga(R.encomenda.iso)}. Toque em adicionar a feijoada.`, log: metaSite('10:09:58', 'encomendas de sábado') },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'b', desc: 'A sacola aparece embaixo. Toque em Ver sacola.' },
          { ms: 1200, cena: 'page', estado: 'w2 q1', toque: 'c', desc: `Retirada no sábado, ${Number(R.encomenda.iso.slice(8))}. Toque na janela das ${horaFala(R.encomenda.hora)} às ${horaFala(R.encomenda.hora.replace(':00', ':30'))}.` },
          { ms: 800, cena: 'page', estado: 'w2 q1 q2', toque: 'd', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w3 q2', toque: 'e', desc: 'Pix ou cartão no balcão, e quem retira. Toque em Fazer pedido.' },
          { ms: 2100, cena: 'page', estado: 'w4 done', hora: '10:11', desc: `Pedido ${PEDIDOS['instagram/live']} recebido: retirada ${dataLonga(R.encomenda.iso)}, ao meio-dia, com o acompanhamento.`, log: metaLead('10:11:10', '10:11:11', '10:11:12', `pedido ${PEDIDOS['instagram/live']}, pagamento na retirada`, 'origem: Instagram, live da cozinha') },
        ] },
      { id: 'explorar', label: 'Explorar', mock: 'igexplore', cliente: 'clinica', selo: 'Anúncio', frase: 'Uma clínica aparece entre fotos de interesse e leva ao horário.',
        objetivo: 'Avaliações agendadas pelo site',
        passos: passos3(['Bloco do anúncio entre as fotos', [0]], ['Tela cheia, no formato do Reels', [1, 2, 3]], ['Serviço, dia, horário e dados', [4, 5, 6, 7, 8, 9, 10, 11]]),
        quadros: [
          { ms: 1500, cena: 'grid', desc: `Explorar: fotos de interesse e, entre elas, a foto do consultório da ${curta('clinica')}, com o selo de Anúncio no canto.` },
          { ms: 900, cena: 'grid', toque: 'ad', desc: 'Toque no bloco do anúncio.' },
          { ms: 1700, cena: 'reel', video: 1, desc: `O anúncio abre em tela cheia, no formato do Reels: ${C.clinica.assinatura}` },
          { ms: 900, cena: 'reel', estado: 'lit', video: 1, toque: 'cta', desc: 'O botão Solicitar horário ganha cor. Toque nele.' },
          { ms: 1600, cena: 'page', desc: 'O agendamento on-line abre no navegador do Instagram: avaliação, limpeza ou clareamento, em três etapas.', log: metaSite('10:09:26', 'agendamento on-line, fbclid no link') },
          { ms: 800, cena: 'page', toque: 'a', desc: 'Toque em Avaliação odontológica.' },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Ver horários.' },
          { ms: 1200, cena: 'page', estado: 'w2 q1', toque: 'c', desc: `Calendário de outubro com os dias livres. Toque em ${dataCurta(avaliacao.iso)}.` },
          { ms: 1000, cena: 'page', estado: 'w2 q1 q2', toque: 'd', desc: `Os horários do dia aparecem. Toque em ${avaliacao.hora}.` },
          { ms: 800, cena: 'page', estado: 'w2 q1 q2 q3', toque: 'e', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w3 q3', toque: 'f', desc: 'Dados e lembrete pelo WhatsApp já marcados. Toque em Confirmar agendamento.' },
          { ms: 2000, cena: 'page', estado: 'w4 done', hora: '10:10', desc: `Avaliação agendada: ${dataLonga(avaliacao.iso)}, ${horaFala(avaliacao.hora)}, com o endereço e o que levar.`, log: metaLead('10:10:15', '10:10:16', '10:10:17', `avaliação, ${dataCurta(avaliacao.iso)} ${avaliacao.hora}`, 'origem: Instagram, Explorar') },
        ] },
    ] },
  { id: 'facebook', name: 'Facebook', group: 'social', benefit: 'Receber o pedido sem sair do app.',
    art: art('incorporadora', 'coast', '30% 50%', C.incorporadora.assinatura, `Peça da ${C.incorporadora.marca}, incorporadora fictícia: casa de concreto e madeira na falésia, sobre o mar.`, { formato: 'link', oferta: 'Visita ao decorado aos sábados', cta: 'Agendar visita' }),
    placements: [
      { id: 'feed', label: 'Feed', mock: 'fbFeed', cliente: 'incorporadora', selo: 'Anúncio', frase: 'Uma incorporadora recebe o pedido de visita e marca o horário sem sair do Facebook.',
        objetivo: 'Leads qualificados: visita ao decorado',
        passos: passos3(['Vista do mar no primeiro cartão', [0]], ['Sala, e a planta de 3 para 4 quartos', [1, 2]], ['Formulário e horário no calendário', [3, 4, 5, 6, 7, 8, 9, 10, 11]]),
        quadros: [
          { ms: 1500, cena: 'ad', desc: `Anúncio da ${C.incorporadora.marca} no feed do Facebook: casa na falésia e o botão Saiba mais.` },
          { ms: 1400, cena: 'ad', estado: 'c2', desc: 'O carrossel desliza para a sala voltada para o mar.' },
          { ms: 2200, cena: 'ad', estado: 'c3', desc: 'Terceiro cartão: a planta passa de 3 para 4 quartos, área ilustrativa.' },
          { ms: 900, cena: 'ad', estado: 'c3', toque: 'cta', desc: 'Toque em Saiba mais.' },
          { ms: 1700, cena: 'form', toque: 'a', desc: 'O formulário abre por cima do feed: visita ao decorado, com o horário no fim. Toque em Continuar.' },
          { ms: 1300, cena: 'form', estado: 'w2', toque: 'b', desc: 'Quantos quartos você procura? Toque em 4 quartos. Nome, e-mail e WhatsApp vêm do perfil.' },
          { ms: 800, cena: 'form', estado: 'w2 q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1300, cena: 'form', estado: 'w3 q1', toque: 'd', desc: 'Revise suas informações. Toque em Enviar.', log: [L('10:09:52', 'Meta', 'Formulário enviado', 'o lead chega ao CRM em segundos', 'conversao')] },
          { ms: 1500, cena: 'form', estado: 'w4 q1', desc: 'Pronto! Escolha um horário: o calendário abre dentro do próprio formulário.', log: [L('10:09:54', 'CRM', 'Contato criado', 'etapa: lead do Facebook', 'dado')] },
          { ms: 900, cena: 'form', estado: 'w4 q1', toque: 'e', desc: `Toque em ${INC.visita.hora} de ${dataLonga(INC.visita.iso).split(',')[0]}, ${Number(INC.visita.iso.slice(8))}.` },
          { ms: 800, cena: 'form', estado: 'w4 q1 q2', toque: 'f', desc: 'Toque em Marcar horário.' },
          { ms: 2100, cena: 'form', estado: 'w4 q1 q2 q3 done', hora: '10:10', desc: `Visita marcada para ${dataLonga(INC.visita.iso)}, às ${horaFala(INC.visita.hora)}. O convite chega no e-mail.`, log: [L('10:10:08', 'CRM', 'Etapa: visita agendada', `${dataCurta(INC.visita.iso)} ${INC.visita.hora}`, 'conversao'), L('10:10:09', 'Meta CAPI', 'Lead com event_id deduplicado', 'a etapa do CRM volta para a campanha', 'sinal')] },
        ] },
      { id: 'post', label: 'Post', mock: 'fbpost', cliente: 'restaurante', selo: 'Anúncio', frase: 'Um restaurante anuncia a feijoada de sábado como evento e fecha a reserva.',
        objetivo: 'Mesas para o almoço de sábado',
        passos: passos3(['Evento com a foto da casa', [0]], ['Data e lugar à vista', [1, 2, 3]], ['Detalhes do evento e reserva', [4, 5, 6, 7, 8, 9, 10]]),
        quadros: [
          { ms: 1500, cena: 'post', desc: `Anúncio da ${C.restaurante.marca} no feed: o evento Feijoada de sábado, dia ${Number(reserva.iso.slice(8))}, com Tenho interesse.` },
          { ms: 1300, cena: 'post', estado: 'lit', desc: `${cap(dataLonga(reserva.iso))}, a partir das 11h30, na ${TERCEIROS.ruas.restaurante.split(' · ')[1]}. O botão fica em destaque.` },
          { ms: 900, cena: 'post', estado: 'lit', toque: 'cta', desc: 'Toque em Tenho interesse.' },
          { ms: 1500, cena: 'post', estado: 'lit int', desc: 'O botão vira Interessado e o Facebook avisa que lembra você antes do evento.', log: [L('10:09:21', 'Meta', 'Interesse no evento', 'resposta ao anúncio de evento', 'sinal')] },
          { ms: 1800, cena: 'evento', desc: 'Os detalhes do evento sobem: almoço das 11h30 às 15h30 e a reserva de mesa pelo site.' },
          { ms: 800, cena: 'evento', toque: 'rsv', desc: 'Toque em Reservar mesa.' },
          { ms: 1500, cena: 'page', toque: 'b', desc: `O site abre direto na reserva: sábado, ${Number(reserva.iso.slice(8))}, ${reserva.pessoas} pessoas, salão. Toque em ${reserva.hora}.`, log: metaSite('10:09:40', 'reserva de mesa, a partir do evento') },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1200, cena: 'page', estado: 'w2 q1', toque: 'd', desc: 'Nome e WhatsApp preenchidos. Toque em Aniversário.' },
          { ms: 800, cena: 'page', estado: 'w2 q1 q2', toque: 'e', desc: 'Toque em Confirmar reserva.' },
          { ms: 2000, cena: 'page', estado: 'w3 done', hora: '10:10', desc: `Reserva solicitada para ${dataLonga(reserva.iso)}, às ${horaFala(reserva.hora)}, com o evento salvo no Facebook.`, log: metaLead('10:10:11', '10:10:12', '10:10:13', `mesa para ${reserva.pessoas}, ${dataCurta(reserva.iso)} ${reserva.hora}`, 'origem: Facebook, anúncio de evento') },
        ] },
      { id: 'video', label: 'Vídeo', mock: 'fbvid', cliente: 'restaurante', selo: 'Anúncio', frase: 'Um restaurante leva do vídeo à reserva e ao almoço na agenda do iPhone.',
        objetivo: 'Reservas com lembrete na agenda',
        passos: passos3(['O prato no primeiro quadro', [0]], ['O vídeo chega ao fim com o convite', [1]], ['Reserva e agenda do iPhone', [2, 3, 4, 5, 6, 7, 8, 9, 10]]),
        quadros: [
          { ms: 1500, cena: 'video', video: 1, desc: `Vídeo da ${C.restaurante.marca} no Reels do Facebook, com Anúncio: do tacho para a mesa.` },
          { ms: 2000, cena: 'video', estado: 's2 lit', video: 1, desc: 'Corta para o pudim da casa. A barra do vídeo chega ao fim e Reservar agora ganha cor.' },
          { ms: 900, cena: 'video', estado: 's2 lit', toque: 'cta', desc: 'Toque em Reservar agora.' },
          { ms: 1500, cena: 'page', desc: `O site abre direto na reserva: sábado, ${Number(reserva.iso.slice(8))}, ${reserva.pessoas} pessoas, salão.`, log: metaSite('10:09:18', 'reserva de mesa, a partir do vídeo') },
          { ms: 800, cena: 'page', toque: 'b', desc: `Toque em ${reserva.hora}.` },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1200, cena: 'page', estado: 'w2 q1', toque: 'd', desc: 'Nome e WhatsApp preenchidos. Toque em Aniversário.' },
          { ms: 800, cena: 'page', estado: 'w2 q1 q2', toque: 'e', desc: 'Toque em Confirmar reserva.' },
          { ms: 1500, cena: 'page', estado: 'w3 q2', toque: 'g', desc: 'Reserva solicitada. Toque em Adicionar à agenda.', log: metaLead('10:09:50', '10:09:51', '10:09:52', `mesa para ${reserva.pessoas}, ${dataCurta(reserva.iso)} ${reserva.hora}`, 'origem: Facebook, vídeo no Reels') },
          { ms: 1500, cena: 'cal', toque: 'add', desc: `O iPhone mostra o evento: almoço no ${curta('restaurante')}, ${dataCurta(reserva.iso)}, ${reserva.hora}. Toque em Adicionar.` },
          { ms: 2000, cena: 'cal', estado: 'add done', hora: '10:10', desc: 'O almoço entra na agenda do iPhone, com o endereço e um alerta uma hora antes.' },
        ] },
      { id: 'breaks', label: 'Ad breaks', mock: 'fbbreak', cliente: 'automotivo', selo: 'Anúncio', frase: 'Uma concessionária entra no intervalo de um vídeo e leva ao test drive.',
        objetivo: 'Leads de test drive',
        passos: passos3(['Vídeo de culinária aos 1:05', [0]], ['Intervalo no mesmo player, sem pular', [1, 2]], ['Formulário e volta ao vídeo', [3, 4, 5, 6, 7, 8, 9, 10]]),
        quadros: [
          { ms: 1500, cena: 'video', video: 1, desc: `Vídeo de culinária da página ${TERCEIROS.criadores.facebook} no Facebook, aos 1:05.` },
          { ms: 1700, cena: 'video', estado: 'ad', video: 1, desc: `O intervalo começa no mesmo player: Anúncio · 0:08, e o cartão da ${curta('automotivo')} aparece embaixo.` },
          { ms: 1700, cena: 'video', estado: 'ad ad2', video: 1, desc: 'O vídeo continua em 5. Não há botão Pular: o cartão do anúncio fica embaixo do player.' },
          { ms: 900, cena: 'video', estado: 'ad ad2', video: 1, toque: 'cta', desc: 'Toque em Reservar agora.' },
          { ms: 1700, cena: 'form', toque: 'a', desc: 'O formulário abre por cima do vídeo: test drive com a recarga explicada. Toque em Continuar.' },
          { ms: 1300, cena: 'form', estado: 'w2', toque: 'b', desc: `Qual versão? Toque em ${curta('automotivo')} ${AU.versoes[0].nome}. Os dados vêm do perfil.` },
          { ms: 800, cena: 'form', estado: 'w2 q1', toque: 'c', desc: 'Toque em Continuar.' },
          { ms: 1300, cena: 'form', estado: 'w3 q1', toque: 'd', desc: 'Revise suas informações. Toque em Enviar.', log: [L('10:09:47', 'Meta', 'Formulário enviado', 'lead do intervalo do vídeo', 'conversao')] },
          { ms: 1900, cena: 'form', estado: 'w4 q1', desc: `Obrigado! O consultor ${AU.consultor} chama no WhatsApp para confirmar ${dataCurta(td.iso)}, às ${horaFala(td.hora)}.`, log: [L('10:09:49', 'CRM', 'Contato criado', `test drive, ${dataCurta(td.iso)} ${td.hora}`, 'dado')] },
          { ms: 800, cena: 'form', estado: 'w4 q1', toque: 'f', desc: 'Toque em Voltar ao vídeo.' },
          { ms: 2000, cena: 'video', estado: 'volta', video: 1, hora: '10:10', desc: 'O vídeo de culinária continua de onde parou.', log: [L('10:10:02', 'Meta CAPI', 'Lead com event_id deduplicado', 'origem: intervalo do vídeo', 'sinal')] },
        ] },
    ] },
  { id: 'tiktok', name: 'TikTok', group: 'social', benefit: 'Do vídeo ao Pix pago.',
    art: art('varejo', 'mesaNoite45', '50% 40%', C.varejo.assinatura, `Peça da ${C.varejo.marca}, loja de tecnologia fictícia: mesa à noite com luminária e notebook aberto.`, { formato: '9:16', oferta: 'Notebook para editar vídeo, em até 10x', cta: 'Comprar' }),
    placements: [
      { id: 'infeed', label: 'In-Feed', mock: 'ttFeed', cliente: 'varejo', selo: 'Patrocinado', frase: 'Uma loja de tecnologia leva do vídeo ao Pix pago no app do banco.',
        objetivo: 'Vendas com Pix conferido',
        passos: passos3(['Pergunta nativa no primeiro segundo', [0]], ['Corte e o botão com a cor do vídeo', [1, 2]], ['Carrinho, revisão, Pix e banco', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]]),
        quadros: [
          { ms: 1500, cena: 'video', video: 1, desc: `Anúncio da ${curta('varejo')} no Para você do TikTok, com Patrocinado: Edita à noite e o notebook esquenta?` },
          { ms: 1700, cena: 'video', estado: 's2 ct', video: 1, desc: 'Corte para a mesa: De noite, a edição. De dia, a entrega. O botão Comprar agora aparece.' },
          { ms: 1300, cena: 'video', estado: 's2 ct lit', video: 1, desc: 'O botão Comprar agora ganha a cor do vídeo.' },
          { ms: 900, cena: 'video', estado: 's2 ct lit', video: 1, toque: 'cta', desc: 'Toque em Comprar agora.' },
          { ms: 1800, cena: 'page', toque: 'a', desc: `A loja abre no navegador do TikTok: preço oculto, ${VA.parcelamento}, entrega em 2 dias úteis. Toque em 32 GB.`, log: [L('10:09:22', 'TikTok Pixel', 'ViewContent', `${VA.skus[0].nome}, ttclid no link`, 'sinal')] },
          { ms: 1500, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Adicionar ao carrinho. O botão enche, vira No carrinho, e o carrinho mostra 1.', log: [L('10:09:27', 'TikTok Pixel', 'AddToCart', '32 GB, grafite', 'sinal')] },
          { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque no carrinho.' },
          { ms: 1400, cena: 'page', estado: 'w2 q1 q2', toque: 'd', desc: 'Carrinho com o notebook e a entrega padrão. Toque em Finalizar compra.', log: [L('10:09:33', 'TikTok Pixel', 'InitiateCheckout', '1 item', 'sinal')] },
          { ms: 1200, cena: 'page', estado: 'w3 q2', toque: 'e', desc: 'Endereço e CPF já preenchidos. Toque em Pix.' },
          { ms: 800, cena: 'page', estado: 'w3 q2 q3', toque: 'f', desc: 'Toque em Continuar.' },
          { ms: 1500, cena: 'page', estado: 'w4 q2 q3', toque: 'g', desc: 'Revisão: o produto, a entrega, Pix à vista e o total. Toque em Finalizar pedido.' },
          { ms: 1600, cena: 'page', estado: 'w5 q2', desc: 'Pix pronto: QR, código copia e cola e 30 minutos para pagar.', log: [L('10:09:44', 'PSP', 'Pix criado', `${psp.nome}, vence em 30 min`, 'dado')] },
          { ms: 800, cena: 'page', estado: 'w5 q2', toque: 'h', desc: 'Toque em Copiar código.' },
          { ms: 1300, cena: 'page', estado: 'w5 q2 q5', desc: 'Código copiado. Agora é pagar no app do banco.' },
          { ms: 1500, cena: 'banco', toque: 'bk-go', desc: `O app do ${banco.nome} encontra o código copiado. Toque em Pagar.` },
          { ms: 1500, cena: 'banco', estado: 'bk1', toque: 'bk-ok', desc: `Para ${C.varejo.marca}, via ${psp.nome}: confira e toque em Pagar com Face ID.` },
          { ms: 1100, cena: 'banco', estado: 'bk1 bk2', desc: 'O Face ID confirma que é você.' },
          { ms: 1600, cena: 'banco', estado: 'bk1 bk3', toque: 'volta', hora: '10:11', desc: 'Pix enviado, com o comprovante. Toque em Voltar ao TikTok.', log: [L('10:11:03', 'Banco', 'Pix enviado', `pelo app do ${banco.nome}`, 'evento')] },
          { ms: 2200, cena: 'page', estado: 'w6 q2 done', hora: '10:11', desc: `Pagamento aprovado: pedido ${PEDIDOS['tiktok/infeed']} confirmado, com o rastreio. O carrinho volta a zero.`, log: [L('10:11:05', 'PSP', 'Webhook: Pix pago', 'valor conferido com o pedido', 'conversao'), L('10:11:06', 'Events API', 'Purchase', 'enviado pelo servidor, com o mesmo event_id', 'sinal')] },
        ] },
    ] },
  { id: 'youtube', name: 'YouTube', group: 'social', benefit: 'Ganhar os primeiros segundos.',
    art: art('automotivo', 'recarga169', '50% 50%', C.automotivo.assinatura, `Peça da ${C.automotivo.marca}, concessionária fictícia: carro elétrico prata recarregando na rua, à noite.`, { formato: '16:9', oferta: 'Test drive com recarga explicada', cta: 'Agendar' }),
    placements: [
      { id: 'instream', label: 'Anúncio no vídeo', mock: 'ytInstream', cliente: 'automotivo', selo: 'Patrocinado', frase: 'Uma concessionária leva do anúncio antes do vídeo ao test drive.',
        curto: 'No vídeo', objetivo: 'Test drives agendados',
        passos: passos3(['Mensagem antes do Pular', [0]], ['Segundo corte: a recarga explicada', [1]], ['Versão, loja e horário', [2, 3, 4, 5, 6, 7, 8, 9, 10]]),
        quadros: [
          { ms: 1600, cena: 'watch', video: 1, desc: `Antes do vídeo, o anúncio da ${curta('automotivo')}: Saiu do jogo. Quanto de carga sobra?` },
          { ms: 2000, cena: 'watch', estado: 's2', video: 1, desc: 'Segundo corte: o painel do carro e a recarga explicada no test drive. O botão Pular aparece aos 5 s.' },
          { ms: 900, cena: 'watch', estado: 's2', video: 1, toque: 'cta', desc: 'Toque em Agendar, no cartão abaixo do vídeo.' },
          { ms: 1700, cena: 'page', desc: 'A página do test drive abre: duas versões, com autonomia, recarga e lugares.', log: [L('10:09:23', 'Google Ads', 'Clique com gclid', 'no iPhone, com wbraid', 'sinal')] },
          { ms: 800, cena: 'page', toque: 'a', desc: `Toque em ${curta('automotivo')} ${AU.versoes[0].nome}.` },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Escolher loja.' },
          { ms: 1300, cena: 'page', estado: 'w2 q1', toque: 'c', desc: `Loja de ${td.unidade}, ${dataLonga(td.iso).split(',')[0]}, ${Number(td.iso.slice(8))}. Toque na loja.` },
          { ms: 900, cena: 'page', estado: 'w2 q1 q2', toque: 'd', desc: `Toque em ${td.hora}.` },
          { ms: 800, cena: 'page', estado: 'w2 q1 q2 q3', toque: 'e', desc: 'Toque em Continuar.' },
          { ms: 1400, cena: 'page', estado: 'w3 q3', toque: 'f', desc: 'Nome, WhatsApp e carteira de motorista. Toque em Solicitar test drive.' },
          { ms: 2100, cena: 'page', estado: 'w4 done', hora: '10:10', desc: `Test drive agendado: ${curta('automotivo')} ${AU.versoes[0].nome}, ${dataLonga(td.iso)}, às ${horaFala(td.hora)}, em ${td.unidade}.`, log: [L('10:10:05', 'Site', 'Test drive agendado', `${dataCurta(td.iso)} ${td.hora}`, 'conversao'), L('10:10:06', 'Conversão', 'Test drive agendado', 'importada no Google Ads pelo gclid', 'sinal')] },
        ] },
      { id: 'shorts', label: 'Shorts', mock: 'ytShorts', cliente: 'educacao', selo: 'Patrocinado', frase: 'Uma escola de idiomas leva do Shorts ao app instalado e ao teste de nível.',
        objetivo: 'Instalações com teste concluído',
        passos: passos3(['Frase curta antes da marca', [0]], ['Exercício segura o deslize', [1, 2]], ['App Store, Face ID e o app aberto', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]]),
        quadros: [
          { ms: 1500, cena: 'video', video: 1, desc: `Shorts da ${curta('educacao')}, com Patrocinado: Pare de traduzir na cabeça.` },
          { ms: 1500, cena: 'video', estado: 'q ct', video: 1, desc: 'O exercício entra na tela: complete It’s, lacuna, to you. O botão Instalar aparece.' },
          { ms: 1400, cena: 'video', estado: 'q ok ct lit', video: 1, desc: 'A resposta aparece: up, você que decide. O botão Instalar fica branco.' },
          { ms: 900, cena: 'video', estado: 'q ok ct lit', video: 1, toque: 'cta', desc: 'Toque em Instalar.' },
          { ms: 2000, cena: 'store', desc: 'A ficha da App Store sobe por cima do Shorts: ícone, idade, categoria e três telas do app.' },
          { ms: 800, cena: 'store', toque: 'go', desc: 'Toque em Obter.' },
          { ms: 1300, cena: 'store', estado: 'fid', desc: 'O iPhone pede o Face ID: clique duas vezes no botão lateral para instalar.' },
          { ms: 1100, cena: 'store', estado: 'load', desc: 'O app é baixado.', log: [L('10:09:41', 'App Store', 'Instalação', 'atribuída ao clique no Shorts', 'conversao')] },
          { ms: 1200, cena: 'store', estado: 'inst', desc: 'O botão vira Abrir.' },
          { ms: 800, cena: 'store', estado: 'inst', toque: 'go', desc: 'Toque em Abrir.' },
          { ms: 1800, cena: 'app', desc: 'O app abre no teste de nivelamento: qual resposta soa natural?', log: [L('10:09:49', 'App', 'Primeira abertura', 'instalação vinda do Shorts', 'dado')] },
          { ms: 900, cena: 'app', toque: 'ans', desc: 'Toque em For three years.' },
          { ms: 2300, cena: 'app', estado: 'a2 done', hora: '10:10', desc: `Resultado: ${E.nivel}. O app sugere ${E.clube.toLowerCase()} e a aula experimental de ${dataLonga(aula.iso)}.`, log: [L('10:10:02', 'App', 'Teste de nível concluído', `resultado ${E.nivel}`, 'dado'), L('10:10:03', 'Google Ads', 'Conversão no app', 'teste concluído, ligado à campanha', 'sinal')] },
        ] },
      { id: 'live', label: 'Live', mock: 'ytLive', cliente: 'varejo', selo: 'Inclui promoção paga', frase: 'Uma loja de tecnologia entra na live de um criador, com a publi identificada.',
        objetivo: 'Lista de espera do lançamento',
        passos: passos3(['Aviso de publi nos primeiros segundos', [0]], ['O criador mostra o setup em uso', [1]], ['Mensagem fixada leva à lista', [2, 3, 4, 5]]),
        quadros: [
          { ms: 1700, cena: 'live', estado: 'paid', video: 1, desc: `Live do canal ${TERCEIROS.criadores.youtube} com o aviso Inclui promoção paga nos primeiros segundos.` },
          { ms: 1900, cena: 'live', estado: 's2', video: 1, desc: `A cartela #publi mostra a ${curta('varejo')}: o notebook deste setup. O chat pergunta pelo branco.` },
          { ms: 1700, cena: 'live', estado: 's2 s3', video: 1, desc: `O canal fixa a lista de espera do branco, que chega em ${dataCurta(VA.skus[1].chegada).split(', ')[1]}.` },
          { ms: 900, cena: 'live', estado: 's2 s3', video: 1, toque: 'link', desc: 'Toque em entrar na lista.' },
          { ms: 1800, cena: 'page', toque: 'a', desc: 'A página do branco abre, com a data de chegada e o e-mail já preenchido. Toque em Quero ser avisado.', log: [L('10:09:30', 'Site', 'Visita vinda da live', 'link da mensagem fixada', 'sinal')] },
          { ms: 2200, cena: 'page', estado: 'w2 done', hora: '10:09', desc: `Você está na lista: um e-mail em ${dataCurta(VA.skus[1].chegada)} e a unidade separada por 24 horas.`, log: [L('10:09:41', 'CRM', 'Lista de espera', `aviso agendado para ${dataCurta(VA.skus[1].chegada)}`, 'conversao')] },
        ] },
    ] },
  { id: 'linkedin', name: 'LinkedIn', group: 'social', benefit: 'Falar com quem decide.',
    art: art('financas', 'reuniao45', '50% 55%', FI.guia.titulo, `Peça da ${C.financas.marca}, gestora de patrimônio fictícia: mesa de reunião vista de cima, capa do guia.`, { formato: '4:5', oferta: 'Guia gratuito em PDF', cta: 'Baixar guia' }),
    placements: [
      { id: 'feed', label: 'Documento', mock: 'liFeed', cliente: 'financas', selo: 'Promovido', frase: 'Uma gestora entrega o guia em troca do contato.',
        passos: passos3(['Problema do sócio na primeira frase', [0]], ['Páginas de amostra no feed', [1, 2]], ['Dados do perfil, revisão e PDF', [3, 4, 5, 6]]),
        quadros: [
          { ms: 1400, cena: 'feed', desc: `Post promovido da ${C.financas.marca} no LinkedIn: Empresa e família no mesmo patrimônio?` },
          { ms: 1300, cena: 'feed', estado: 'p2', desc: 'O documento passa para a página 1: contas que se misturam.' },
          { ms: 1300, cena: 'feed', estado: 'p3', desc: 'Página 2: sucessão sem plano.' },
          { ms: 1300, cena: 'feed', estado: 'p4', toque: 'cta', desc: 'Para continuar lendo, envie suas informações. Toque em Desbloquear.' },
          { ms: 1600, cena: 'form', toque: 'a', desc: 'O formulário do LinkedIn abre com nome, e-mail, cargo e empresa do perfil. Toque em Avançar.' },
          { ms: 1400, cena: 'form', estado: 'w2', toque: 'b', desc: 'Revise suas informações. Toque em Enviar.' },
          { ms: 2000, cena: 'form', estado: 'w3 done', desc: `Obrigado, ${PESSOA.primeiro}. O guia completo em PDF está liberado.` },
        ] },
    ] },
  { id: 'google', name: 'Google Ads', group: 'search', benefit: 'Responder a quem já procura.',
    art: art('clinica', 'consultorio45', '50% 50%', C.clinica.assinatura, `Peça da ${C.clinica.marca}, clínica odontológica fictícia: consultório claro com cadeira e janela.`, { formato: 'link', oferta: 'Avaliação de 30 min, sem procedimento', cta: 'Ligar' }),
    placements: [
      { id: 'search', label: 'Pesquisa', mock: 'gSearch', cliente: 'clinica', selo: 'Resultado patrocinado', frase: 'Uma clínica responde à busca com uma ligação.',
        passos: passos3(['Busca já diz a intenção', [0]], ['Título responde à busca', [1]], ['Ligar com um toque', [2, 3, 4]]),
        quadros: [
          { ms: 1500, cena: 'serp', estado: 'typing', desc: 'Busca no Google: dentista perto de mim.' },
          { ms: 1900, cena: 'serp', estado: 'r', desc: `Resultado patrocinado da ${C.clinica.marca}: Avaliação com hora marcada, com sitelinks e o botão Ligar.` },
          { ms: 1000, cena: 'serp', estado: 'r', toque: 'cta', desc: 'Toque em Ligar.' },
          { ms: 1400, cena: 'call', toque: 'go', desc: 'A folha do iPhone pergunta se quer ligar. Toque em Ligar.' },
          { ms: 2000, cena: 'call', estado: 'done', desc: `Chamando ${C.clinica.marca}.` },
        ] },
      { id: 'display', label: 'Display', mock: 'gDisplay', cliente: 'turismo', selo: 'Anúncio', frase: 'Uma agência lembra quem já leu sobre o destino.',
        passos: passos3(['Banner no assunto da matéria', [0]], ['Título muda, oferta continua', [1]], ['Saída escolhida, pré-reserva', [2, 3, 4, 5, 6, 7]]),
        quadros: [
          { ms: 1500, cena: 'article', desc: `Anúncio da ${C.turismo.marca} numa matéria sobre a Festa do Divino: em grupo pequeno.` },
          { ms: 1700, cena: 'article', estado: 's2', desc: 'O título do anúncio muda: guia da cidade e hotel no centro.' },
          { ms: 900, cena: 'article', estado: 's2', toque: 'cta', desc: 'Toque na seta do anúncio.' },
          { ms: 1500, cena: 'page', desc: `A página da agência abre no Safari: ${OFERTAS.turismo.produto}.` },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: `Toque na saída de ${Number(OFERTAS.turismo.saidas[0].ida.slice(8))} a ${Number(OFERTAS.turismo.saidas[0].volta.slice(8))} de maio.` },
          { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Garantir minha vaga.' },
          { ms: 1400, cena: 'page', estado: 'w2', toque: 'c', desc: 'Dados preenchidos, sinal só depois. Toque em Enviar pré-reserva.' },
          { ms: 2000, cena: 'page', estado: 'w3 done', desc: 'Pré-reserva recebida, com os próximos passos: confirmação pelo WhatsApp e sinal por Pix depois.' },
        ] },
    ] },
  { id: 'seo', name: 'SEO', group: 'search', benefit: 'Ser encontrado sem pagar pelo clique.',
    art: art('incorporadora', 'salaMar45', '50% 50%', 'Casas na falésia com vista para o mar', `Peça da ${C.incorporadora.marca}, incorporadora fictícia: varanda e sala da casa na falésia, com mata ao redor.`, { formato: 'link', oferta: 'Plantas de 3 e 4 quartos em PDF', cta: 'Ver plantas' }),
    placements: [
      { id: 'organic', label: 'Orgânico', mock: 'seoOrganic', cliente: 'incorporadora', selo: 'Orgânico, sem anúncio', frase: 'Uma incorporadora aparece na busca sem pagar pelo clique.',
        passos: passos3(['Título com o que foi buscado', [0]], ['Plantas que dá para comparar', [1, 2, 3]], ['PDF em troca do e-mail', [4, 5, 6]]),
        quadros: [
          { ms: 1400, cena: 'serp', desc: `Resultado orgânico da ${C.incorporadora.marca} para casa na falésia à venda, sem rótulo de anúncio.` },
          { ms: 900, cena: 'serp', toque: 'link', desc: 'Toque no atalho Plantas.' },
          { ms: 1300, cena: 'page', desc: 'A página de plantas abre com 3 quartos.' },
          { ms: 1200, cena: 'page', estado: 'p4', desc: 'A planta muda para 4 quartos.' },
          { ms: 1000, cena: 'page', estado: 'p4', toque: 'pdf', desc: 'Toque em Receber as plantas em PDF.' },
          { ms: 1400, cena: 'page', estado: 'p4 mail', toque: 'send', desc: 'O e-mail já está preenchido. Toque em Enviar.' },
          { ms: 1800, cena: 'page', estado: 'p4 done', desc: 'Enviamos as plantas para o seu e-mail.' },
        ] },
    ] },
  { id: 'chatgpt', name: 'ChatGPT', group: 'search', benefit: 'Aparecer depois da resposta.',
    art: art('turismo', 'pirenopolisRua45', '50% 45%', C.turismo.assinatura, `Peça da ${C.turismo.marca}, agência de viagens fictícia: rua de pedra do centro histórico de Pirenópolis.`, { formato: 'link', oferta: 'Festa do Divino em grupo pequeno', cta: 'Saiba mais' }),
    placements: [
      { id: 'answer', label: 'Resposta', mock: 'gptAnswer', cliente: 'turismo', selo: 'Patrocinado', frase: 'Uma agência aparece depois da resposta, separada dela.',
        passos: passos3(['Conversa de quem planeja a viagem', [0, 1, 2, 3, 4, 5]], ['Opção logo abaixo da resposta', [6]], ['Roteiro montado e consultora', [7, 8, 9, 10, 11, 12, 13, 14]]),
        quadros: [
          { ms: 1100, cena: 'chat', desc: 'Conversa no ChatGPT: quero ver uma festa tradicional no interior em maio. O ChatGPT começa a responder.' },
          { ms: 1700, cena: 'chat', estado: 's1', desc: 'A resposta pede dias, cidade de saída, tipo de festa e se a viagem é com crianças.' },
          { ms: 1500, cena: 'chat', estado: 's1 ty', desc: 'Você responde no campo: 3 dias, saindo de SP, cavalhadas.' },
          { ms: 700, cena: 'chat', estado: 's1 ty', toque: 'gsend', desc: 'Toque em enviar.' },
          { ms: 1100, cena: 'chat', estado: 's1 s3', desc: 'A pergunta sobe para o alto da tela e o ChatGPT pensa.' },
          { ms: 1900, cena: 'chat', estado: 's1 s3 s4', desc: 'A resposta indica Pirenópolis, com mascarados e cavalhadas, e um roteiro de 3 dias.' },
          { ms: 1900, cena: 'chat', estado: 's1 s3 s4 s2', desc: `Depois de um divisor, o cartão Patrocinado da ${C.turismo.marca}, separado da resposta.` },
          { ms: 900, cena: 'chat', estado: 's1 s3 s4 s2', toque: 'cta', desc: 'Toque no cartão do anúncio.' },
          { ms: 1400, cena: 'page', desc: 'O navegador do ChatGPT abre Monte seu roteiro: quantas noites você tem?' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em 3 noites.' },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'b', desc: 'Saindo de São Paulo, viagem de casal. Toque em Continuar.' },
          { ms: 1300, cena: 'page', estado: 'w2 q2', toque: 'c', desc: 'O que você quer ver: mascarados já marcado. Toque em Cavalhadas.' },
          { ms: 800, cena: 'page', estado: 'w2 q2', toque: 'd', desc: 'Toque em Gerar roteiro.' },
          { ms: 1500, cena: 'page', estado: 'w3', desc: 'Roteiro sugerido: 3 noites em Pirenópolis, com mascarados, cavalhadas e hotel no centro.' },
          { ms: 2000, cena: 'page', estado: 'w3 q3 done', toque: 'e', desc: `Toque em Falar com a consultora. A ${OFERTAS.turismo.consultora} chama no WhatsApp.` },
        ] },
    ] },
  { id: 'maps', name: 'Google Maps', group: 'local', benefit: 'Ser a escolha no caminho.',
    art: art('restaurante', 'fachada45', '50% 50%', C.restaurante.assinatura, `Peça da ${C.restaurante.marca}, restaurante fictício: fachada de madeira à noite, com flores e mesas na calçada.`, { formato: 'link', oferta: 'Feijoada completa aos sábados', cta: 'Rotas' }),
    placements: [
      { id: 'local', label: 'Local', mock: 'mapsLocal', cliente: 'restaurante', selo: 'Patrocinado', frase: 'Um restaurante aparece no mapa e traça a rota.',
        passos: passos3(['Pin destacado no caminho', [0, 1]], ['Ficha mostra prato e horário', [2]], ['Rota traçada com um toque', [3, 4, 5]]),
        quadros: [
          { ms: 1300, cena: 'map', estado: 'typing', desc: 'Busca no Google Maps: feijoada perto de mim.' },
          { ms: 1500, cena: 'map', desc: `Alfinete quadrado da ${C.restaurante.marca} e o resultado Patrocinado.` },
          { ms: 1900, cena: 'map', estado: 's2', desc: `A ficha patrocinada sobe: ${R.abreHoje.toLowerCase()}, feijoada completa aos sábados.` },
          { ms: 1000, cena: 'map', estado: 's2', toque: 'cta', desc: 'Toque em Rotas.' },
          { ms: 1700, cena: 'route', toque: 'go', desc: 'A rota de carro aparece no mapa. Toque em Iniciar.' },
          { ms: 1800, cena: 'route', estado: 'done', desc: `Navegação iniciada até a ${C.restaurante.marca}.` },
        ] },
    ] },
  { id: 'whatsapp', name: 'WhatsApp Business', group: 'local', benefit: 'Transformar interesse em conversa.',
    art: art('clinica', 'recepcao45', '50% 50%', 'Conte o que sente e escolha o horário', `Peça da ${C.clinica.marca}, clínica odontológica fictícia: recepção com parede terracota, sofá e plantas.`, { formato: '4:5', oferta: 'Avaliação marcada pela conversa', cta: 'Enviar mensagem' }),
    placements: [
      { id: 'ctwa', label: 'Clique para conversar', mock: 'waAd', cliente: 'clinica', selo: 'Anúncio', frase: 'Uma clínica começa o agendamento numa conversa.',
        passos: passos3(['Hora marcada na própria imagem', [0]], ['Legenda convida a contar mais', [1]], ['Menu, período, horário e endereço', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]]),
        quadros: [
          { ms: 1400, cena: 'ad', desc: `Anúncio da ${C.clinica.marca} no Instagram: Avaliação com hora marcada.` },
          { ms: 1700, cena: 'ad', estado: 'open lit', desc: 'A legenda abre: conte o que você sente e escolha o horário pela conversa. A barra Enviar mensagem pelo WhatsApp acende.' },
          { ms: 900, cena: 'ad', estado: 'open lit', toque: 'cta', desc: 'Toque em Enviar mensagem pelo WhatsApp.' },
          { ms: 1500, cena: 'chat', toque: 'send', desc: 'O WhatsApp abre a conversa com a mensagem pronta e a prévia do anúncio. Toque em enviar.' },
          { ms: 1700, cena: 'chat', estado: 'm2', desc: 'A assistente virtual digita e pergunta como pode ajudar, com o botão Ver opções.' },
          { ms: 800, cena: 'chat', estado: 'm2', toque: 'list', desc: 'Toque em Ver opções.' },
          { ms: 1100, cena: 'chat', estado: 'm2 ls', desc: 'A lista de atendimentos abre: avaliação, limpeza, dor ou urgência, recepção.' },
          { ms: 900, cena: 'chat', estado: 'm2 ls lp', toque: 'opt', desc: 'Toque em Avaliação odontológica.' },
          { ms: 800, cena: 'chat', estado: 'm2 ls lp', toque: 'lsend', desc: 'Toque em Enviar.' },
          { ms: 1700, cena: 'chat', estado: 'm2 m3', desc: 'A escolha vira mensagem. A assistente pergunta o período: manhã, tarde ou noite.' },
          { ms: 800, cena: 'chat', estado: 'm2 m3', toque: 'per', desc: 'Toque em Manhã.' },
          { ms: 1700, cena: 'chat', estado: 'm2 m3 m4', desc: `Horários da manhã: ${dataCurta(avaliacao.iso)}, às ${horaFala(avaliacao.hora)}; ou outro dia.` },
          { ms: 800, cena: 'chat', estado: 'm2 m3 m4', toque: 'hor', desc: `Toque em ${dataCurta(avaliacao.iso)}, ${avaliacao.hora}.` },
          { ms: 2400, cena: 'chat', estado: 'm2 m3 m4 m5', desc: `Avaliação agendada para ${dataLonga(avaliacao.iso)}, às ${horaFala(avaliacao.hora)}, e a localização da clínica na conversa.` },
        ] },
      { id: 'catalog', label: 'Catálogo', mock: 'waCatalog', cliente: 'restaurante', selo: 'Catálogo, não é anúncio', frase: 'Um restaurante recebe a encomenda pelo catálogo e fecha o pedido no atendimento automático.',
        passos: passos3(['Vitrine dentro do perfil', [0, 1]], ['Itens organizados por ocasião', [2, 3]], ['Carrinho, pedido e atendimento automático', [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]]),
        quadros: [
          { ms: 1400, cena: 'profile', desc: `Perfil comercial da ${C.restaurante.marca} no WhatsApp, com a faixa Catálogo.` },
          { ms: 900, cena: 'profile', toque: 'more', desc: 'Toque em Ver tudo.' },
          { ms: 1500, cena: 'catalog', toque: 'item', desc: `Catálogo com as coleções Encomendas de sábado e Doces. Toque em ${R.encomenda.item}.` },
          { ms: 1400, cena: 'item', toque: 'add', desc: 'Página do item, sem preço, com quantidade. Toque em Adicionar ao carrinho.' },
          { ms: 1000, cena: 'item', estado: 'ct', toque: 'cart', desc: 'A barra Ver carrinho, 1 item, aparece embaixo. Toque nela.' },
          { ms: 1400, cena: 'cart', toque: 'order', desc: 'Carrinho com a feijoada e a observação para sábado. Toque em Fazer pedido.' },
          { ms: 1300, cena: 'chat', desc: 'O pedido chega na conversa como uma mensagem de carrinho: 1 item, pedido para sábado.' },
          { ms: 1700, cena: 'chat', estado: 'k1', desc: 'A assistente virtual pergunta como prefere receber: retirar no balcão ou entrega.' },
          { ms: 800, cena: 'chat', estado: 'k1', toque: 'r1', desc: 'Toque em Retirar no balcão.' },
          { ms: 1700, cena: 'chat', estado: 'k1 k2', desc: 'A assistente pergunta o horário de sábado: 11h, 12h ou 13h.' },
          { ms: 800, cena: 'chat', estado: 'k1 k2', toque: 'r2', desc: 'Toque em 12h.' },
          { ms: 1800, cena: 'chat', estado: 'k1 k2 k3', desc: 'Resumo do pedido: feijoada para 4, retirada no balcão sábado às 12h, com o botão Confirmar pedido.' },
          { ms: 800, cena: 'chat', estado: 'k1 k2 k3', toque: 'ok', desc: 'Toque em Confirmar pedido.' },
          { ms: 2200, cena: 'chat', estado: 'k1 k2 k3 k4', desc: `Pedido ${PEDIDOS['whatsapp/catalogo']} confirmado, com lembrete no sábado às 9h.` },
        ] },
    ] },
  { id: 'blog', name: 'Publieditorial', group: 'content', benefit: 'Explicar antes de vender, sempre identificado.',
    art: art('financas', 'salaJantar45', '50% 55%', C.financas.assinatura, `Peça da ${C.financas.marca}, gestora de patrimônio fictícia: mesa branca com duas cadeiras e uma orquídea.`, { formato: 'link', oferta: 'Sucessão na empresa familiar: por onde começar', cta: 'Ler' }),
    placements: [
      { id: 'article', label: 'Artigo', mock: 'blogArticle', cliente: 'financas', selo: 'Publicidade', frase: 'Uma gestora explica antes de vender, sempre identificada.',
        objetivo: 'Conversas agendadas a partir do conteúdo',
        passos: passos3(['Faixa Publicidade antes do título', [0]], ['Leitura útil, com o checklist', [1, 2]], ['Oferecido por, dia e assunto', [3, 4, 5, 6, 7, 8, 9, 10]]),
        quadros: [
          { ms: 1600, cena: 'article', desc: `Artigo no ${revista.nome} com a faixa Publicidade acima do título e Oferecido por ${C.financas.marca}.` },
          { ms: 2000, cena: 'article', estado: 's2', desc: 'A leitura começa pelo inventário: o que existe, em nome de quem e quem depende de cada coisa.' },
          { ms: 2000, cena: 'article', estado: 's3', desc: 'No meio do texto, o checklist com 5 documentos para começar a sucessão.' },
          { ms: 1800, cena: 'article', estado: 's4', desc: `No fim, o bloco Oferecido por ${C.financas.marca}: um especialista explica cada decisão antes de você assinar.` },
          { ms: 900, cena: 'article', estado: 's4', toque: 'cta', desc: 'Toque em Agendar conversa.' },
          { ms: 1600, cena: 'page', toque: 'a', desc: `A agenda da ${curta('financas')} abre no Safari: conversa de 30 min por vídeo. Toque em ${dataCurta(conversa.iso)}.`, log: [L('10:09:40', 'Site', 'Visita vinda do artigo', 'utm: conteúdo patrocinado', 'sinal')] },
          { ms: 900, cena: 'page', estado: 'q1', toque: 'b', desc: `Os horários do dia aparecem. Toque em ${conversa.hora}.` },
          { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque em Próximo.' },
          { ms: 1400, cena: 'page', estado: 'w2 q2', toque: 'd', desc: 'Nome e e-mail preenchidos. Sobre o que quer conversar? Toque em Sucessão.' },
          { ms: 800, cena: 'page', estado: 'w2 q2 q3', toque: 'e', desc: 'Toque em Agendar.' },
          { ms: 2000, cena: 'page', estado: 'w3 done', hora: '10:10', desc: `Conversa agendada: ${dataLonga(conversa.iso)}, ${horaFala(conversa.hora)}, por vídeo. O convite chega por e-mail.`, log: [L('10:10:12', 'Site', 'Conversa agendada', `${dataCurta(conversa.iso)} ${conversa.hora}`, 'conversao'), L('10:10:13', 'CRM', 'Origem: conteúdo patrocinado', `artigo do ${revista.nome}`, 'dado')] },
        ] },
    ] },
];

/* The helpers shared with the modules of search, local and conversation formats (campaign-search.js) and
   of the deep automations (automation-flows.js). Fields are only ever added here, never removed. */
export const H = { I, pic, marca, esc, scene, screen, logoSvg, LAB, SITES, kit, CLIENTES, MARCAS, HOJE, OFERTAS, PEDIDOS, LEGAL, TERCEIROS, PESSOA, dataCurta, dataLonga, diaSemana, horaFala, P, passos3, browserBar, safari, btn, input, done, tabbar, TABS, art, skel, planta, avatar, video, kb, shot, IMG, VIDEOS, L };

/* Search, local and conversation formats (campaign-search.js): each placement it returns replaces the one
   with the same "channel/placement" key, or joins that channel; its mocks, screens and banners join the
   shared tables. It may also return canais: [[id, {placements, art, benefit}]] to replace a channel's. */
const fazBusca = BUSCA.makeSearch || BUSCA.makeSearchLocal;
const SEARCH = { mocks: {}, placements: {}, channels: {}, SCREEN: {}, AVISOS: {}, ...(fazBusca ? fazBusca(H) || {} : {}) };
Object.assign(mocks, SEARCH.mocks || {});
for (const [key, placement] of Object.entries(SEARCH.placements || {})) {
  const [id, pid] = key.split('/');
  const list = channels.find(channel => channel.id === id)?.placements;
  if (!list) continue;
  const at = list.findIndex(item => item.id === pid);
  if (at >= 0) list[at] = placement; else list.push(placement);
}
for (const [id, fields] of Object.entries(SEARCH.channels || {})) { const ch = channels.find(channel => channel.id === id); if (ch) Object.assign(ch, fields); }
for (const [id, canal] of SEARCH.canais || []) {
  const ch = channels.find(channel => channel.id === id);
  if (!ch || !canal) continue;
  ['placements', 'art', 'benefit'].forEach(field => { if (canal[field]) ch[field] = canal[field]; });
}
/* Deep automation flows (automation-flows.js): new placements in WhatsApp and Instagram and new channels,
   placed before the sponsored article. */
const AUTO = { mocks: {}, extra: {}, novos: [], SCREEN: {}, AVISOS: {}, hidden: {}, ...(AUTOMACOES.makeAutomations ? AUTOMACOES.makeAutomations(H) || {} : {}) };
Object.assign(mocks, AUTO.mocks || {});
for (const [id, list] of Object.entries(AUTO.extra || {})) channels.find(channel => channel.id === id)?.placements.push(...list);
channels.splice(channels.findIndex(channel => channel.id === 'blog'), 0, ...(AUTO.novos || []));
/* Front piece of the channels that arrive with the automations: a link card with its button when the package
   sends none (static-presentations reads art.formato and art.cta). */
const ART_PADRAO = { telegram: 'Entrar no clube', rcs: 'Abrir conversa', voz: 'Pedir ligação', pix: 'Autorizar Pix', email: 'Ler o guia' };
for (const channel of AUTO.novos || []) if (channel.art) channel.art = { formato: 'link', cta: ART_PADRAO[channel.id] || 'Saiba mais', ...channel.art };

/* What happens after the conversion, as it happens on the phone: a confirmation that the page promises by
   WhatsApp or by e-mail ends the journey on the iOS notification banner. Formats that end in a Direct
   conversation, a calendar or an app have no banner. */
const AVISOS = {
  'instagram/feed': { app: 'mail', cliente: 'educacao', hora: '10:12', texto: `Convite: aula experimental, ${dataLonga(aula.iso)}, ${horaFala(aula.hora)}. O link da sala está no convite.`, desc: 'O convite da aula chega por e-mail, com o link da sala.' },
  'instagram/reels': { app: 'whatsapp', cliente: 'restaurante', hora: '10:12', texto: `Reserva confirmada: ${dataCurta(reserva.iso)}, às ${horaFala(reserva.hora)}, mesa para ${reserva.pessoas}. Parabéns pelo aniversário!`, desc: 'O restaurante confirma a reserva pelo WhatsApp.' },
  'instagram/live': { app: 'whatsapp', cliente: 'restaurante', hora: '10:12', texto: `Pedido ${PEDIDOS['instagram/live']} recebido: feijoada para 4, retirada ${dataCurta(R.encomenda.iso)}, ao meio-dia. Avisamos quando estiver pronto.`, desc: 'O restaurante confirma o pedido pelo WhatsApp.' },
  'instagram/explorar': { app: 'whatsapp', cliente: 'clinica', hora: '10:11', texto: `Avaliação confirmada: ${dataCurta(avaliacao.iso)}, às ${horaFala(avaliacao.hora)}, unidade ${avaliacao.unidade}. Para remarcar, é só responder.`, desc: 'A clínica confirma a avaliação pelo WhatsApp.' },
  'facebook/feed': { app: 'whatsapp', cliente: 'incorporadora', hora: '10:13', texto: `Olá, ${PESSOA.primeiro}! Sou o corretor da ${C.incorporadora.curta}. Até ${dataCurta(INC.visita.iso)}, às ${horaFala(INC.visita.hora)}, na central de vendas.`, desc: 'O corretor confirma a visita pelo WhatsApp.' },
  'facebook/post': { app: 'whatsapp', cliente: 'restaurante', hora: '10:12', texto: `Reserva confirmada para a Feijoada de sábado: ${dataCurta(reserva.iso)}, ${horaFala(reserva.hora)}, mesa para ${reserva.pessoas}.`, desc: 'O restaurante confirma a reserva pelo WhatsApp.' },
  'facebook/breaks': { app: 'whatsapp', cliente: 'automotivo', hora: '10:14', texto: `Oi, ${PESSOA.primeiro}! Aqui é o ${AU.consultor}, da ${C.automotivo.curta}. Seu test drive fica para ${dataCurta(td.iso)}, às ${horaFala(td.hora)}. Confirma?`, desc: 'O consultor chama pelo WhatsApp para confirmar o test drive.' },
  'tiktok/infeed': { app: 'mail', cliente: 'varejo', hora: '10:12', texto: `Pedido ${PEDIDOS['tiktok/infeed']} confirmado. Pagamento por Pix aprovado. Entrega até ${dataCurta(kit.uteis(HOJE.iso, 2))}.`, desc: 'O recibo do pedido chega por e-mail.' },
  'youtube/instream': { app: 'mail', cliente: 'automotivo', hora: '10:11', texto: `Test drive confirmado: ${dataCurta(td.iso)}, às ${horaFala(td.hora)}, loja ${td.unidade}. Leve a carteira de motorista.`, desc: 'A confirmação do test drive chega por e-mail.' },
  'youtube/live': { app: 'mail', cliente: 'varejo', hora: '10:10', texto: `Você está na lista do ${VA.skus[1].nome} branco. Avisamos em ${dataCurta(VA.skus[1].chegada)}.`, desc: 'A confirmação da lista de espera chega por e-mail.' },
  'blog/article': { app: 'mail', cliente: 'financas', hora: '10:11', texto: `Convite: conversa de 30 minutos, ${dataCurta(conversa.iso)}, às ${horaFala(conversa.hora)}, por vídeo.`, desc: 'O convite da conversa chega por e-mail.' },
  'google/display': { app: 'whatsapp', cliente: 'turismo', texto: 'Recebemos sua pré-reserva da Festa do Divino.', desc: 'A agência confirma a pré-reserva pelo WhatsApp.' },
  'seo/organic': { app: 'mail', cliente: 'incorporadora', texto: 'Plantas de 3 e 4 quartos, em PDF.', desc: 'O e-mail com as plantas chega na notificação do iPhone.' },
};
Object.assign(AVISOS, AUTO.AVISOS || {});
for (const [key, aviso] of Object.entries(SEARCH.AVISOS || {})) { if (aviso) AVISOS[key] = aviso; else delete AVISOS[key]; }
channels.forEach(channel => channel.placements.forEach(placement => {
  const aviso = AVISOS[`${channel.id}/${placement.id}`];
  if (!aviso || placement.aviso) return;
  const last = placement.quadros[placement.quadros.length - 1];
  placement.aviso = aviso;
  placement.quadros.push({ ms: 2400, cena: last.cena, estado: `${last.estado || ''} aviso`.trim(), desc: aviso.desc, ...(aviso.hora ? { hora: aviso.hora } : {}), ...(aviso.log ? { log: aviso.log } : {}) });
  const fim = placement.passos[placement.passos.length - 1].quadros;
  if (!fim.includes(placement.quadros.length - 1)) fim.push(placement.quadros.length - 1);
}));
export const channelById = id => channels.find(channel => channel.id === id) || channels[0];
/* A placement by "channel/placement", including the ones played only in "Sistemas e automações". */
export const placementByKey = key => {
  const [channel, id] = key.split('/');
  return channels.find(item => item.id === channel)?.placements.find(item => item.id === id) || AUTO.hidden?.[key] || null;
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
  fbbreak: { tema: 'escuro', fundo: '#18191a' },
  ttFeed: { tema: 'escuro', fundo: '#000' },
  ytInstream: { tema: 'escuro', fundo: '#0f0f0f' },
  ytLive: { tema: 'escuro', fundo: '#0f0f0f' },
  fbFeed: { tema: 'escuro', fundo: '#242526' },
  fbpost: { tema: 'escuro', fundo: '#242526' },
  blogArticle: { tema: 'escuro', fundo: '#ffffff' },
  ytShorts: { tema: 'escuro', fundo: '#000' },
  liFeed: { fundo: '#f4f2ee' },
  ...(SEARCH.SCREEN || {}),
  ...(AUTO.SCREEN || {}),
};

/* iPhone 17 Pro Max in cosmic orange: body, action button, volume up and down, side button, Camera
   Control, screen, Dynamic Island, iOS status bar with signal, wi-fi and battery, and the home indicator.
   No manufacturer name or logo. The screen is a 412 x 895.2 logical canvas (var(--u)); "tema" is the
   app theme behind the status bar ("claro" = light app, dark text). The status bar and the home
   indicator follow the theme of the scene on screen (channel-mocks.css). */
export const STATUS_TIME = HOJE.hora;
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
const push = ({ app, cliente, texto }) => `<div class="cm-push" aria-hidden="true"><span class="cm-push-icon cm-push-icon--${app}">${app === 'whatsapp' ? logoSvg('whatsapp', { altura: 22, mono: 'branco', classe: 'cm-push-glyph' }) : I('mail')}</span><span class="cm-push-body"><span class="cm-push-top"><b>${esc(C[cliente].marca)}</b><small>agora</small></span><span class="cm-push-text">${esc(texto)}</span></span></div>`;
export function renderMock(placement) {
  const name = mocks[placement.mock] ? placement.mock : 'igFeed';
  let html = mocks[name]();
  // The banner lives inside the screen, so the frame states (data-state~="aviso") show it.
  if (placement.aviso) html = html.slice(0, -'</div>'.length) + push(placement.aviso) + '</div>';
  return iphone(html, SCREEN[name]);
}
