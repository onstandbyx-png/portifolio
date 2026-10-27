/* Platform screens of the campaign section, measured on the app captures of
   09/10/2026 (1080 x 2400 / 2.62 = var(--u) on the 412 x 895.2 iPhone screen):
   Instagram (feed, story with a poll, live, Reels, Explore, Direct), TikTok "Para
   você", YouTube (watch page and live), Facebook (feed, Reels viewer, video player)
   and an article in Safari. Here the posts are ads of fictitious clients: the second
   line says the label each app uses in pt-BR ("Anúncio" on Instagram and Facebook,
   "Patrocinado" on TikTok and YouTube) and the ad CTA sits under the media. No
   engagement counts anywhere (the apps let likes be hidden). People who comment
   show a display name and a coloured monogram, never a handle. */
import { TERCEIROS, HOJE, dataLonga } from './marcas.js';

export const IG_FUNDO = '#0c1014';

/* The app's stroke icons in 24 x 24, the same in feed, story and Reels. */
const IG = {
  coracao: 'M12 20.3s-7.6-4.6-9.4-9.4C1.4 7.6 3.5 4.3 6.9 4.3c2.2 0 3.7 1.3 5.1 3 1.4-1.7 2.9-3 5.1-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.4 9.4-9.4 9.4z',
  comentario: 'M20.6 16.2A9.3 9.3 0 1 0 17 19.9l4.3 1.4z',
  repost: 'M5.5 10.5V8.2a3 3 0 0 1 3-3h10M15.5 2.2l3 3-3 3M18.5 13.5v2.3a3 3 0 0 1-3 3h-10M8.5 21.8l-3-3 3-3',
  enviar: 'M3 4.5 21 5.6 10.6 20.6zM10 12.2 16.6 8.4',
  salvar: 'M5.5 3h13v18L12 15.2 5.5 21z',
  fechar: 'M5 5l14 14M19 5 5 19',
  criar: 'M12 4.5v15M4.5 12h15',
  inicio: 'M3.6 10.1 12 3.4l8.4 6.7V20.6H14.6v-6.1H9.4v6.1H3.6z',
  busca: 'M10.6 3.6a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM15.8 15.8 20.8 20.8',
  musica: 'M9.5 17.5V5.5l10-2v11.6M9.5 17.5a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0zM19.5 15.1a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0z',
  link: 'M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1',
  seta: 'M9 5.5 15.5 12 9 18.5',
  voltar: 'M15 5.5 8.5 12l6.5 6.5',
  video: 'M3.5 7h11.5v10H3.5zM15 10.5l5.5-3v9l-5.5-3z',
  fone: 'M7 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5 5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5 5.7 2 2 0 0 1 7 3.5z',
  camera: 'M4 8h3.5l2-3h5l2 3H20v11H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM6 11a6 6 0 0 0 12 0M12 17v4',
  check: 'M5 12.5 10 17.5 19 7',
};
const ico = (d, cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const mais = cls => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>`;
const opcoes = '<svg class="ig-opcoes" viewBox="0 0 18 10" aria-hidden="true"><path d="M1 1.2h16M1 8.8h11.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
const reelsIco = '<svg class="igr-nav-ico igr-nav-reels" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2"/><path d="M3 8.2h18M8.4 3l2.9 5.2M14.4 3l2.9 5.2"/><path class="igr-nav-play" d="M10 11.2v6.4l5.4-3.2z"/></svg>';

/* TikTok "Para você": filled and stroked icons of the app, no brand glyph. */
const TT = {
  coracao: 'M12 21.2c-.4 0-.8-.1-1.1-.4C6.3 17 2 13.4 2 8.9 2 5.8 4.4 3.4 7.4 3.4c1.9 0 3.6 1 4.6 2.5 1-1.5 2.7-2.5 4.6-2.5 3 0 5.4 2.4 5.4 5.5 0 4.5-4.3 8.1-8.9 11.9-.3.3-.7.4-1.1.4z',
  balao: 'M12 3.2c-5.3 0-9.6 3.6-9.6 8.1 0 2.5 1.3 4.8 3.4 6.3l-.5 3.4 3.8-1.9c.9.2 1.9.3 2.9.3 5.3 0 9.6-3.6 9.6-8.1S17.3 3.2 12 3.2z',
  favorito: 'M6.2 2.6h11.6c.9 0 1.6.7 1.6 1.6v16.6c0 .6-.7 1-1.2.6L12 17.2l-6.2 4.2c-.5.4-1.2 0-1.2-.6V4.2c0-.9.7-1.6 1.6-1.6z',
  compartilhar: 'M13.4 3.6c0-.7.8-1 1.3-.6l7.6 7.2c.4.4.4 1 0 1.3l-7.6 7.3c-.5.5-1.3.1-1.3-.6v-3.6C7.6 14.5 4.6 16.7 2.4 20.4 2.6 13.3 6 8.5 13.4 7.6z',
  inicio: 'M3.4 10.1 12 3l8.6 7.1v10.2c0 .6-.5 1.1-1.1 1.1h-4.9v-6.2H9.4v6.2H4.5c-.6 0-1.1-.5-1.1-1.1z',
  amigos: 'M9.2 11.4a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8zM2.2 20.6c.5-4 3.3-6.2 7-6.2s6.5 2.2 7 6.2M15.6 3.8a3.9 3.9 0 0 1 0 7.4M17.8 14.6c2.3.7 3.6 2.8 4 6',
  caixa: 'M4.6 4h14.8c.9 0 1.6.7 1.6 1.6v10.6c0 .9-.7 1.6-1.6 1.6h-5.2L12 20.6l-2.2-2.8H4.6c-.9 0-1.6-.7-1.6-1.6V5.6C3 4.7 3.7 4 4.6 4z',
  perfil: 'M12 12.2a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6zM4.2 21c.6-4.3 3.6-6.6 7.8-6.6s7.2 2.3 7.8 6.6',
  busca: 'M10.6 18a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8zM16 16l5 5',
  nota: 'M9 17.6V5.4l10-2v12.2M9 17.6a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0zM19 15.6a2.6 2.6 0 1 1-5.2 0 2.6 2.6 0 0 1 5.2 0z',
};
const cheio = (d, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="currentColor"/></svg>`;
const traco = (d, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ttLive = '<svg class="tt-live" viewBox="0 0 30 24" aria-hidden="true"><path d="M11 2.6 15 6.2l4-3.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="6.4" width="26" height="15.6" rx="3.4" fill="none" stroke="currentColor" stroke-width="1.9"/><text x="15" y="17.6" text-anchor="middle" font-size="8.4" font-weight="800" fill="currentColor">LIVE</text></svg>';
const mais12 = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
/* YouTube watch screen: generic stroked action glyphs. */
const YT = {
  gostei: 'M7.5 10.5V20H4.2a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM7.5 10.5l3.6-6.6c.3-.6 1-.9 1.6-.6 1 .4 1.5 1.5 1.2 2.6l-.8 3h5.1a2 2 0 0 1 2 2.4l-1.3 6.8a2.4 2.4 0 0 1-2.4 1.9H7.5',
  naoGostei: 'M16.5 13.5V4h3.3a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1zM16.5 13.5l-3.6 6.6c-.3.6-1 .9-1.6.6-1-.4-1.5-1.5-1.2-2.6l.8-3H5.8a2 2 0 0 1-2-2.4l1.3-6.8A2.4 2.4 0 0 1 7.5 4h9',
  compartilhar: 'M13.5 5 20.5 11.6l-7 6.6v-3.7c-4.8 0-7.7 1.4-9.7 4.6.5-5.2 3.4-9.3 9.7-10.2z',
  baixar: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14',
  salvar: 'M4 6.5h11M4 11.5h11M4 16.5h7M18 13v7M14.5 16.5h7',
  opcoes: 'M12 5.5h.01M12 12h.01M12 18.5h.01',
  externo: 'M14 4.5h5.5V10M19.5 4.5 11 13M17 14v5.5H4.5V7H10',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.8h.01',
  pular: 'M6 5.5 15 12l-9 6.5zM18 5.5v13',
};
const yti = (d, cls = 'yt-i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* Facebook in the middle of the feed: tabs at the foot, as on iOS. */
const FB = {
  inicio: 'M3.2 10.4 12 3l8.8 7.4V20a1 1 0 0 1-1 1H15v-6.2H9V21H4.2a1 1 0 0 1-1-1z',
  video: 'M3 6.2A2.2 2.2 0 0 1 5.2 4h13.6A2.2 2.2 0 0 1 21 6.2v11.6a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 17.8zM10 9v6l5-3z',
  amigos: 'M9 11.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM2.5 20c.5-3.6 3.1-5.8 6.5-5.8s6 2.2 6.5 5.8zM16 4.3a3.4 3.4 0 0 1 0 6.6M17.6 14.4c2.2.6 3.6 2.6 3.9 5.6',
  loja: 'M4 9.5V20h16V9.5M3 5h18l-1.2 4.2a2.6 2.6 0 0 1-5 0 2.6 2.6 0 0 1-5.6 0 2.6 2.6 0 0 1-5 0zM9.5 20v-5h5v5',
  sino: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.6 2H4.4zM10 21h4',
  menu: 'M4 6.5h16M4 12h16M4 17.5h16',
  pontos: 'M5 12h.01M12 12h.01M19 12h.01',
  fechar: 'M6 6l12 12M18 6 6 18',
  curtir: 'M7.5 10.5V20H4.2a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM7.5 10.5l3.6-6.6c.3-.6 1-.9 1.6-.6 1 .4 1.5 1.5 1.2 2.6l-.8 3h5.1a2 2 0 0 1 2 2.4l-1.3 6.8a2.4 2.4 0 0 1-2.4 1.9H7.5',
  comentar: 'M12 3.5c5 0 9 3.5 9 7.9s-4 7.9-9 7.9c-1.2 0-2.3-.2-3.3-.5L4 20.5l1.2-3.9C3.8 15.2 3 13.4 3 11.4c0-4.4 4-7.9 9-7.9z',
  compartilhar: 'M13.5 4.5 21 11.6l-7.5 7v-4c-5.2 0-8.3 1.6-10.5 5 .6-5.6 3.6-10 10.5-11z',
  voltar: 'M15 5 8 12l7 7',
  busca: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.5-4.5',
  mudo: 'M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4zM16 9.5l5 5M21 9.5l-5 5',
  tela: 'M4 9V4.5h4.5M15.5 4.5H20V9M20 15v4.5h-4.5M8.5 19.5H4V15',
  pausa: 'M8 5v14M16 5v14',
};
const fbi = (d, { cheio = false, cls = 'fb-i' } = {}) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="${cheio ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${cheio ? 0 : 1.9}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const globo = '<svg class="fb-globo" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M1.6 8h12.8M8 1.4c1.8 1.8 2.7 4 2.7 6.6S9.8 12.8 8 14.6M8 1.4C6.2 3.2 5.3 5.4 5.3 8s.9 4.8 2.7 6.6" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>';
/* Article in Safari of iOS 26. */
const BL = { voltar: 'M14.5 5.5 8 12l6.5 6.5', opcoes: 'M5.5 12h.01M12 12h.01M18.5 12h.01', menu: 'M4 7h16M4 12h16M4 17h16', busca: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.4 15.4 20 20' };
const bli = (d, cls = 'blog-i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* A display name in a coloured circle with its initials (hue from a hash of the name). */
const iniciais = nome => String(nome).split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
const matiz = nome => { let h = 0; for (const c of String(nome)) h = (h * 31 + c.codePointAt(0)) % 360; return h; };
export const avatar = (nome, cls = '') => `<i class="cm-av${cls ? ' ' + cls : ''}" style="--h:${matiz(nome)}" aria-hidden="true">${iniciais(nome)}</i>`;

export function makeLabScreens({ marca, esc, CLIENTES, pic }) {
  const user = key => CLIENTES[key].arroba;
  const ROTULO_IG = 'Anúncio';
  /* Post header: avatar, user name and the second line (Posts screen measurements). */
  const cab = (key, second = ROTULO_IG) => `<div class="ig-cab" data-linhas="2">${marca(key, 'circulo', 'ig-avatar')}<div class="ig-cab-txt"><b>${esc(user(key))}</b><span class="ig-parceria">${esc(second)}</span></div>${opcoes}</div>`;
  const acoes = (dots = '') => `<div class="ig-acoes">${ico(IG.coracao, 'ig-acao')}${ico(IG.comentario, 'ig-acao')}${ico(IG.repost, 'ig-acao')}${ico(IG.enviar, 'ig-acao')}${dots}${ico(IG.salvar, 'ig-acao ig-salvar')}</div>`;
  /* Instagram's bottom bar of 2026: home, Reels, messages in the centre, search and profile. */
  const nav = (on = 'inicio') => `<div class="igr-nav${on === 'inicio' ? ' igr-nav--feed' : ''}">${ico(IG.inicio, 'igr-nav-ico' + (on === 'inicio' ? ' is-on' : ''))}${reelsIco}${ico(IG.enviar, 'igr-nav-ico')}${ico(IG.busca, 'igr-nav-ico' + (on === 'busca' ? ' is-on' : ''))}<span class="igr-nav-perfil"></span></div>`;
  /* Home feed bar: notifications only (no wordmark drawn by hand, no create button). */
  const feedTop = `<div class="ig-topo ig-topo--home">${ico(IG.coracao, 'ig-home-coracao')}</div>`;
  const seguinte = TERCEIROS.criadores.instagram;

  /** Feed ad: header with Anúncio, 4:5 media (one piece or a sliding carousel), the ad CTA bar, actions, caption, the next post. */
  function feedAd({ key, media, carousel = 0, cta, caption, captionOpen = false }) {
    const dots = carousel ? `<span class="ig-pontos ig-pontos--acoes" aria-hidden="true">${Array.from({ length: carousel }, () => '<i></i>').join('')}</span>` : '';
    const count = carousel ? `<span class="ig-contador cm-count">${Array.from({ length: carousel }, (_, i) => `<i>${i + 1}</i>`).join('')}/${carousel}</span><span class="ig-som"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4zM16 9.5l5 5M21 9.5l-5 5"/></svg></span>` : '';
    return `<div class="ig ig--feed">${feedTop}
      <article class="ig-post">${cab(key)}<div class="ig-midia${carousel ? ' cm-carousel' : ''}">${media}${count}</div>
        <div class="ig-cta${cta.cls ? ' ' + cta.cls : ''}" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}">${cta.lead || ''}<b>${esc(cta.text)}</b>${ico(IG.seta, 'ig-cta-seta')}</div>
        ${acoes(dots)}
        <p class="ig-legenda cm-ig-caption${captionOpen ? ' cm-ig-caption--open' : ''}"${caption.hs ? ` data-hs="${caption.hs}"` : ''}><b>${esc(user(key))}</b> ${caption.html}</p></article>
      <article class="ig-post ig-seguinte"><div class="ig-cab">${avatar(seguinte, 'ig-avatar')}<div class="ig-cab-txt"><b>${esc(seguinte)}</b></div>${opcoes}</div><div class="ig-midia ig-midia--x"></div></article>
      ${nav('inicio')}<span class="ig-navegacao"></span></div>`;
  }

  /** Story ad: rounded 9:16 card under the safe area, progress bars, header with Anúncio, a poll
      sticker (no CTA sticker with it) or the ad's CTA sticker, and the message field at the foot. */
  function storyAd({ key, media, cta = null, poll = null, bars = 2, campo = { text: 'Enviar mensagem' } }) {
    const enquete = poll ? `<div class="igs-poll" data-hs="${poll.hs || '2'}"><b>${esc(poll.q)}</b>${poll.options.map((o, i) => `<span class="igs-poll-op"${i === poll.pick ? ` data-tap="${poll.tap || 'poll'}" data-pick="${poll.state || 'vt'}"` : ''}>${i === poll.pick ? ico(IG.check, 'igs-poll-ok') : ''}${esc(o)}</span>`).join('')}</div>` : '';
    const sticker = cta ? `<span class="igs-link igs-link--ad" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}">${esc(cta.text)}${ico(IG.seta, '')}</span>` : '';
    return `<div class="igs"><div class="igs-cartao"><div class="igs-arte">${media}</div>
        <div class="igs-progresso">${Array.from({ length: bars }, (_, i) => `<i${i === 0 ? ' data-estado="agora"' : ''}>${i === 0 ? '<b data-cx-progress></b>' : ''}</i>`).join('')}</div>
        <div class="igs-cab">${marca(key, 'circulo', 'igs-avatar')}<div class="igs-cab-txt"><span class="igs-nome"><b>${esc(user(key))}</b></span><span class="igs-parceria">${ROTULO_IG}</span></div>${mais('igs-ico igs-mais')}${ico(IG.fechar, 'igs-ico igs-fechar')}</div>
        ${enquete}${sticker}</div>
      <div class="igs-pe">${campo.digitado
        ? `<span class="igs-campo igl-campo"><span class="igl-vazio">${esc(campo.text)}</span><span class="igl-digitado">${esc(campo.digitado)}</span></span><span class="igl-enviar" data-tap="${campo.tap || 'send'}" data-hs="${campo.hs || '3'}">${ico(IG.enviar, 'igs-pe-ico')}</span>`
        : `<span class="igs-campo">${esc(campo.text)}</span>${ico(IG.coracao, 'igs-pe-ico')}${ico(IG.enviar, 'igs-pe-ico')}`}</div></div>`;
  }

  /** Live of the advertiser in the story frame: Ao vivo badge and Anúncio, comments over the video
      (display names, monograms; one arrives with a frame state), and the comment field. */
  function liveAd({ key, media, comments, campo = null, cta = null }) {
    const linha = c => {
      const [who, text, own, hs, entra] = Array.isArray(c) ? c : [c.who, c.text, c.own, c.hs, c.in];
      return `<p class="igl-comentario${own ? ' is-marca' : ''}${entra ? ' igl-entra' : ''}"${hs ? ` data-hs="${hs}"` : ''}${entra ? ` data-entra="${entra}"` : ''}>${own ? marca(key, 'circulo', 'igl-av') : avatar(who, 'igl-av')}<span><b>${esc(own ? user(key) : who)}</b>${esc(text)}</span></p>`;
    };
    const fixado = cta ? `<span class="igl-fixado" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}">${ico(IG.link, '')}<span><small>Fixado por ${esc(user(key))}</small><b>${esc(cta.text)}</b></span>${ico(IG.seta, 'igl-seta')}</span>` : '';
    const pe = campo ? `<span class="igs-campo igl-campo"><span class="igl-vazio">Comentar…</span><span class="igl-digitado">${esc(campo.text)}</span></span><span class="igl-enviar" data-tap="${campo.tap || 'send'}" data-hs="${campo.hs || '3'}">${ico(IG.enviar, 'igs-pe-ico')}</span>` : `<span class="igs-campo">Comentar…</span>${ico(IG.coracao, 'igs-pe-ico')}${ico(IG.enviar, 'igs-pe-ico')}`;
    return `<div class="igs igl"><div class="igs-cartao"><div class="igs-arte">${media}</div>
        <div class="igs-cab">${marca(key, 'circulo', 'igs-avatar')}<div class="igs-cab-txt"><span class="igs-nome"><b>${esc(user(key))}</b><em class="igl-ao-vivo">Ao vivo</em></span><span class="igs-parceria">${ROTULO_IG}</span></div>${ico(IG.fechar, 'igs-ico igs-fechar')}</div>
        <div class="igl-comentarios">${comments.map(linha).join('')}</div>${fixado}</div>
      <div class="igs-pe">${pe}</div></div>`;
  }

  /** Reels ad: video to the nav bar, Reels and Amigos (or the way back to Explore), the action column,
      page, caption, Anúncio, audio, the ad CTA and progress. */
  function reelsAd({ key, video, caption, cta, audio = 'Áudio original', voltar = '' }) {
    const topo = voltar ? `<div class="igr-topo igr-topo--voltar">${ico(IG.voltar, 'igr-voltar')}<b>${esc(voltar)}</b></div>` : `<div class="igr-topo">${ico(IG.criar, 'igr-criar')}<span class="igr-abas"><b>Reels</b><span>Amigos</span></span></div>`;
    return `<div class="igr"><div class="igr-video">${video}</div>
      ${topo}
      <div class="igr-acoes">${ico(IG.coracao, 'igr-acao')}${ico(IG.comentario, 'igr-acao')}${ico(IG.repost, 'igr-acao')}${ico(IG.enviar, 'igr-acao')}${mais('igr-acao igr-mais')}${marca(key, 'quadrado', 'igr-capa-audio')}</div>
      <div class="igr-pe"><span class="igr-perfil">${marca(key, 'circulo', 'igr-avatar')}<b>${esc(user(key))}</b><span class="igr-seguir">Seguir</span></span>
        <span class="igr-legenda"><span class="igr-legenda-txt">${esc(caption)}</span><span class="igr-legenda-mais">mais</span></span>
        <span class="igr-parceria">${ROTULO_IG}</span><span class="igr-audio">${ico(IG.musica, 'igr-audio-ico')}${esc(audio)}</span>
        <span class="igr-cta" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}"><b>${esc(cta.text)}</b>${ico(IG.seta, 'igr-cta-seta')}</span></div>
      <span class="igr-progresso"><i data-cx-progress></i></span>${nav('reels')}</div>`;
  }

  /** Explore grid in dark mode, with the search field. */
  function explore({ cells }) {
    return `<div class="ig igx"><div class="igx-busca">${ico(IG.busca, 'igx-busca-ico')}<span>Pesquisar</span></div><div class="igx-grade">${cells}</div>${nav('busca')}<span class="ig-navegacao"></span></div>`;
  }

  /** A post opened from Explore: the Posts bar ("Explorar"), then the same ad post as the feed. */
  function postAberto({ key, media, cta, caption }) {
    return `<div class="ig ig--feed"><div class="ig-topo"><svg class="ig-voltar" viewBox="0 0 12 19" aria-hidden="true"><path d="M10 1.5 2 9.5l8 8"/></svg><b class="ig-titulo">Explorar</b></div>
      <article class="ig-post">${cab(key)}<div class="ig-midia">${media}</div>
        <div class="ig-cta" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}"><b>${esc(cta.text)}</b>${ico(IG.seta, 'ig-cta-seta')}</div>
        ${acoes()}<p class="ig-legenda cm-ig-caption"><b>${esc(user(key))}</b> ${caption}</p></article><span class="ig-navegacao"></span></div>`;
  }

  /** Instagram Direct in dark mode: the advertiser's header, the messages and the composer.
      items: [{de:'eu'|'marca'|'sistema', html, in?, hs?, cls?}] (in = the frame token that shows it). */
  function direct({ key, items, composer = 'Mensagem…', pasta = '' }) {
    const balao = it => it.de === 'sistema'
      ? `<p class="igd-sys"${it.in ? ` data-in="${it.in}"` : ''}>${it.html}</p>`
      : `<div class="igd-msg igd-msg--${it.de === 'eu' ? 'eu' : 'marca'}${it.cls ? ' ' + it.cls : ''}"${it.in ? ` data-in="${it.in}"` : ''}${it.out ? ` data-out="${it.out}"` : ''}${it.hs ? ` data-hs="${it.hs}"` : ''}>${it.de === 'eu' ? '' : marca(key, 'circulo', 'igd-av')}<div class="igd-bolha">${it.html}</div></div>`;
    return `<div class="igd"><div class="igd-top">${ico(IG.voltar, 'igd-voltar')}${marca(key, 'circulo', 'igd-topav')}<span><b>${esc(CLIENTES[key].marca)}</b><small>${esc(user(key))}${pasta ? ` · ${esc(pasta)}` : ''}</small></span>${ico(IG.fone, 'igd-ico')}${ico(IG.video, 'igd-ico')}</div>
      <div class="igd-corpo"><div class="igd-perfil">${marca(key, 'circulo', 'igd-perfil-av')}<b>${esc(CLIENTES[key].marca)}</b><small>${esc(user(key))} · Instagram</small><small>Conta comercial · ${esc(CLIENTES[key].tipo)}</small><span class="igd-perfil-btn">Ver perfil</span></div>${items.map(balao).join('')}</div>
      <div class="igd-pe"><span class="igd-cam">${ico(IG.camera, '')}</span><span class="igd-campo">${esc(composer)}</span>${ico(IG.mic, 'igd-ico')}</div></div>`;
  }

  /** TikTok "Para você" with an ad: LIVE, tabs and search; video to the app bar; the action column without counts;
      name, caption, the Patrocinado label, the sound line, the ad CTA (text first, then the colour taken from the
      video); the app bar of 2026. */
  function tiktokAd({ key, video, caption, cta, sound }) {
    return `<div class="tt"><div class="tt-video">${video}<span class="tt-progresso"><i data-cx-progress></i></span></div>
      <div class="tt-topo">${ttLive}<span class="tt-abas"><span class="tt-aba">Seguindo</span><span class="tt-aba" data-on>Para você</span></span>${traco(TT.busca, 'tt-busca')}</div>
      <div class="tt-trilho"><span class="tt-perfil">${marca(key, 'circulo', 'tt-av')}<span class="tt-seguir">${mais12}</span></span>${cheio(TT.coracao, 'tt-acao')}<span class="tt-acao tt-comentar">${cheio(TT.balao)}<i></i></span>${cheio(TT.favorito, 'tt-acao tt-favorito')}${cheio(TT.compartilhar, 'tt-acao')}<span class="tt-disco">${marca(key, 'circulo', 'tt-disco-av')}</span></div>
      <div class="tt-info"><b class="tt-nome">${esc(user(key))}</b><p class="tt-legenda">${esc(caption)}</p><span class="tt-selo">Patrocinado</span><span class="tt-som">${traco(TT.nota)}<span class="tt-som-texto"><span><span>${esc(sound)}</span><span>${esc(sound)}</span></span></span></span>
        <span class="tt-cta" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}"${cta.cor ? ` style="--tt-cta:${cta.cor}"` : ''}><b>${esc(cta.text)}</b>${ico(IG.seta, 'tt-cta-seta')}</span></div>
      <div class="tt-nav"><span class="tt-nav-item" data-on>${cheio(TT.inicio)}Início</span><span class="tt-nav-item">${traco(TT.amigos)}Amigos</span><span class="tt-criar"><i>${mais12}</i></span><span class="tt-nav-item">${traco(TT.caixa)}Caixa de entrada</span><span class="tt-nav-item">${traco(TT.perfil)}Perfil</span></div></div>`;
  }

  const ytActions = `<div class="yt-pilulas"><span class="yt-pilula yt-pilula-gostei">${yti(YT.gostei)}<i class="yt-divisor"></i>${yti(YT.naoGostei)}</span><span class="yt-pilula">${yti(YT.compartilhar)}Compartilhar</span><span class="yt-pilula">${yti(YT.baixar)}Baixar</span><span class="yt-pilula">${yti(YT.salvar)}Salvar</span></div>`;
  const canal = TERCEIROS.criadores.youtube;
  const ytChannel = (name = canal) => `<div class="yt-canal">${avatar(name, 'yt-avatar yt-avatar--x')}<b class="yt-canal-nome">${esc(name)}</b><span class="yt-inscrever">Inscrever-se</span></div>`;

  /** YouTube watch screen with an in-stream ad: the ad in the 16:9 player (position in the ad block and time
      left, Visitar anunciante, the Pular pill after 5 s, the yellow bar), the action card of the advertiser,
      then the video page (title, channel, action pills, comments and the next video). */
  function youtubeAd({ key, player, panel, title, meta, bloco = 'Patrocinado: 1 de 2 · 0:20', seguinte = { title: 'Os gols da rodada, editados em dez minutos', dur: '12:08', img: 'cenaEsportes' } }) {
    return `<div class="yt"><div class="yt-player cm-yt-player">${player}
        <span class="cm-yt-label"><span class="cm-yt-bloco">${esc(bloco)}</span>${yti(YT.info, 'cm-i')}</span><span class="cm-yt-visit">Visitar anunciante${yti(YT.externo, 'cm-i')}</span>
        <span class="cm-yt-skip">Pular${yti(YT.pular, 'cm-i')}</span><span class="cm-yt-adbar"><i data-cx-progress></i></span></div>
      <div class="yt-ad-painel">${marca(key, 'circulo', 'yt-ad-av')}<span><b>${esc(panel.title)}</b><small><b>Patrocinado</b> · ${esc(CLIENTES[key].dominio)}</small></span><span class="yt-ad-btn" data-tap="${panel.tap || 'cta'}" data-hs="${panel.hs || '3'}">${esc(panel.button)}</span></div>
      <div class="yt-info"><p class="yt-titulo">${esc(title)}</p><p class="yt-meta">${meta}</p></div>
      ${ytChannel()}${ytActions}
      <div class="yt-comentarios"><b>Comentários</b><span class="yt-comentar"><i class="yt-comentar-avatar"></i>Adicione um comentário…</span></div>
      <div class="yt-seguinte"><div class="yt-miniatura">${pic(seguinte.img, { pos: '50% 60%' })}<span class="yt-duracao">${esc(seguinte.dur)}</span></div><div class="yt-seguinte-info">${avatar(canal, 'yt-avatar yt-avatar--x')}<span><b>${esc(seguinte.title)}</b><small>${esc(canal)}</small></span>${yti(YT.opcoes, 'yt-i yt-i-opcoes')}</div></div>
      <span class="yt-navegacao"></span></div>`;
  }

  /** YouTube live of a creator with the paid promotion notice: player, title, channel and the live chat. */
  function youtubeLive({ player, title, meta, chat }) {
    return `<div class="yt yt--live"><div class="yt-player cm-yt-player">${player}</div>
      <div class="yt-info"><p class="yt-titulo">${esc(title)}</p><p class="yt-meta">${meta}</p></div>
      ${ytChannel()}${chat}<span class="yt-navegacao"></span></div>`;
  }

  /** Facebook feed with an ad: header with Anúncio and the globe, text, the media (one photo or event with the
      link bar, or a carousel of cards), Curtir, Comentar and Compartilhar without counts, the next post and the tabs. */
  function facebookAd({ key, text, media, after = '', next }) {
    const vizinho = next.name || TERCEIROS.criadores.facebook;
    return `<div class="fb"><div class="fb-abas"><span class="fb-aba" data-on>${fbi(FB.inicio, { cheio: true })}</span><span class="fb-aba">${fbi(FB.video)}</span><span class="fb-aba">${fbi(FB.amigos)}</span><span class="fb-aba">${fbi(FB.loja)}</span><span class="fb-aba">${fbi(FB.sino)}</span><span class="fb-aba">${fbi(FB.menu)}</span></div>
      <article class="fb-post"><div class="fb-cab">${marca(key, 'circulo', 'fb-avatar')}<div class="fb-cab-txt"><b class="fb-nome">${esc(CLIENTES[key].marca)}</b><span class="fb-tempo">Anúncio · ${globo}</span></div><span class="fb-cab-botoes">${fbi(FB.pontos, { cls: 'fb-i fb-i-pontos' })}${fbi(FB.fechar)}</span></div>
        <p class="fb-texto">${text}</p>${media}${after}
        <div class="fb-acoes"><span>${fbi(FB.curtir)}Curtir</span><span>${fbi(FB.comentar)}Comentar</span><span>${fbi(FB.compartilhar)}Compartilhar</span></div></article>
      <article class="fb-post fb-seguinte"><div class="fb-cab">${avatar(vizinho, 'fb-avatar')}<div class="fb-cab-txt"><b class="fb-nome">${esc(vizinho)}</b><span class="fb-tempo">${esc(next.time)} · ${globo}</span></div><span class="fb-cab-botoes">${fbi(FB.pontos, { cls: 'fb-i fb-i-pontos' })}${fbi(FB.fechar)}</span></div><p class="fb-texto">${esc(next.text)}</p><div class="fb-midia">${next.media || ''}</div></article></div>`;
  }

  /** Facebook Reels viewer (9:16): back and search on top, the action column, the page name, Anúncio, the
      caption, the CTA bar, and the player strip with progress, time and mute. */
  function facebookReel({ key, video, caption, cta, tempo = '0:14' }) {
    return `<div class="fbr"><div class="fbr-video">${video}</div>
      <div class="fbr-topo">${fbi(FB.voltar)}<b>Reels</b>${fbi(FB.busca)}</div>
      <div class="fbr-acoes"><span>${fbi(FB.curtir)}<small>Curtir</small></span><span>${fbi(FB.comentar)}<small>Comentar</small></span><span>${fbi(FB.compartilhar)}<small>Compartilhar</small></span>${fbi(FB.pontos, { cls: 'fb-i fb-i-pontos' })}</div>
      <div class="fbr-pe"><span class="fbr-quem">${marca(key, 'circulo', 'fbr-av')}<b>${esc(CLIENTES[key].marca)}</b><span class="fbr-seguir">Seguir</span></span><span class="fbr-rotulo">Anúncio · ${globo}</span><p class="fbr-legenda">${esc(caption)}</p>
        <span class="fbr-cta" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}"><b>${esc(cta.text)}</b>${ico(IG.seta, 'fbr-cta-seta')}</span></div>
      <div class="fbr-player"><span class="fbr-barra"><i data-cx-progress></i></span><span class="fbr-tempo">${esc(tempo)}</span>${fbi(FB.mudo, { cls: 'fb-i fbr-mudo' })}</div>
      <div class="fb-abas fb-abas--escuro"><span class="fb-aba">${fbi(FB.inicio)}</span><span class="fb-aba" data-on>${fbi(FB.video, { cheio: true })}</span><span class="fb-aba">${fbi(FB.amigos)}</span><span class="fb-aba">${fbi(FB.loja)}</span><span class="fb-aba">${fbi(FB.sino)}</span><span class="fb-aba">${fbi(FB.menu)}</span></div></div>`;
  }

  /** A video post of a page in the Facebook feed with the in-stream ad break: the page header with Seguir,
      the player (content or ad, the player strip with time and mute), reactions, and the context card under
      the player where the ad's CTA lives. */
  function facebookWatch({ pagina, texto, player, contexto = '', depois = null }) {
    const vizinho = TERCEIROS.comentaristas[2];
    if (depois === null) depois = `<article class="fb-post fb-seguinte"><div class="fb-cab">${avatar(vizinho, 'fb-avatar')}<div class="fb-cab-txt"><b class="fb-nome">${esc(vizinho)}</b><span class="fb-tempo">1 h · ${globo}</span></div><span class="fb-cab-botoes">${fbi(FB.pontos, { cls: 'fb-i fb-i-pontos' })}${fbi(FB.fechar)}</span></div><p class="fb-texto">Terminei o livro do clube de leitura. O próximo encontro é na quinta.</p><div class="fb-midia">${pic('explorar05', { pos: '50% 50%' })}</div></article>`;
    return `<div class="fb fbw"><div class="fb-abas"><span class="fb-aba">${fbi(FB.inicio)}</span><span class="fb-aba" data-on>${fbi(FB.video, { cheio: true })}</span><span class="fb-aba">${fbi(FB.amigos)}</span><span class="fb-aba">${fbi(FB.loja)}</span><span class="fb-aba">${fbi(FB.sino)}</span><span class="fb-aba">${fbi(FB.menu)}</span></div>
      <article class="fb-post"><div class="fb-cab">${avatar(pagina, 'fb-avatar')}<div class="fb-cab-txt"><b class="fb-nome">${esc(pagina)} · <span class="fbw-seguir">Seguir</span></b><span class="fb-tempo">2 h · ${globo}</span></div><span class="fb-cab-botoes">${fbi(FB.pontos, { cls: 'fb-i fb-i-pontos' })}</span></div>
        <p class="fb-texto">${esc(texto)}</p><div class="fbw-player">${player}</div>${contexto}
        <div class="fb-acoes"><span>${fbi(FB.curtir)}Curtir</span><span>${fbi(FB.comentar)}Comentar</span><span>${fbi(FB.compartilhar)}Compartilhar</span></div></article>${depois}</div>`;
  }
  /* The strip of a Facebook player: progress, time and mute. */
  const fbStrip = (tempo, cls = '') => `<span class="fbw-strip${cls ? ' ' + cls : ''}"><span class="fbw-barra"><i></i></span><span class="fbw-tempo">${tempo}</span>${fbi(FB.mudo, { cls: 'fb-i fbw-mudo' })}${fbi(FB.tela, { cls: 'fb-i fbw-tela' })}</span>`;

  /** Sponsored article in Safari (iOS 26): the publication's header, the Publicidade band above the title, the
      Oferecido por line, the studio byline, photo, text, the offer block and the compact Safari bar at the foot. */
  function blogArticle({ key, site, domain, kicker, title, by, photo, body, offer, tail = '', data = dataLonga(HOJE.iso, true).split(', ')[1] }) {
    return `<div class="blog"><div class="blog-navegador"><span class="blog-botao">${bli(BL.voltar)}</span><span class="blog-endereco"><span class="blog-url">${esc(domain)}</span></span><span class="blog-botao">${bli(BL.opcoes, 'blog-i blog-i-opcoes')}</span></div>
      <div class="blog-site">${bli(BL.menu)}<b class="blog-nome">${esc(site)}</b>${bli(BL.busca)}<span class="cm-read"><i></i></span></div>
      <div class="blog-pagina blog-rolagem"><p class="blog-selo" data-hs="1" data-hs-at="after">Publicidade</p><small class="blog-kicker">${esc(kicker)}</small><p class="blog-titulo">${esc(title)}</p>
        <p class="blog-por">${marca(key, 'circulo', 'blog-por-av')}<span>Oferecido por <b>${esc(CLIENTES[key].marca)}</b></span></p>
        <p class="blog-autor"><span>${esc(by)}</span><span>${esc(data)} · 4 min de leitura</span></p>
        <div class="blog-foto">${photo}<span>Imagem ilustrativa</span></div>${body}
        <div class="blog-oferecido">${marca(key, 'circulo', 'blog-circulo')}<span class="blog-oferecido-txt"><small>Oferecido por</small><b>${esc(CLIENTES[key].marca)}</b></span><p class="blog-oferecido-produto">${esc(offer.text)}</p><span class="blog-oferecido-botao" data-tap="${offer.tap || 'cta'}" data-hs="${offer.hs || '3'}">${esc(offer.button)}</span>${offer.legal ? `<small class="blog-oferecido-legal">${esc(offer.legal)}</small>` : ''}</div>${tail}</div></div>`;
  }

  return { feedAd, storyAd, liveAd, reelsAd, explore, postAberto, direct, tiktokAd, youtubeAd, youtubeLive, facebookAd, facebookReel, facebookWatch, fbStrip, blogArticle, avatar };
}
