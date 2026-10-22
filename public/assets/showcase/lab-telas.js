/* Platform screens from the lab: the Fatos studio modules (lab f-e4, f-e7:
   fatos-ig-feed-carrossel-v1, fatos-ig-story-reels-v1), measured on the
   Instagram captures of 09/10/2026 (1080 x 2400 / 2.62 = var(--u) on the
   412 x 895.2 iPhone screen), dark mode. Ported from Instagram.tsx and
   estudio-instagram.css with the same class names (ig-, igs-, igr-) and
   measurements; here the posts are ads of fictitious clients, so the second
   line of the header says "Patrocinado" and an ad CTA sits under the media.
   No engagement counts anywhere (the app lets likes be hidden). */
export const IG_FUNDO = '#0c1014';

/* The app's stroke icons in 24 x 24, the same in feed, story and Reels (Instagram.tsx, IG_ICONE). */
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
};
const ico = (d, cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const mais = cls => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>`;
const opcoes = '<svg class="ig-opcoes" viewBox="0 0 18 10" aria-hidden="true"><path d="M1 1.2h16M1 8.8h11.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
const reelsIco = '<svg class="igr-nav-ico igr-nav-reels" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2"/><path d="M3 8.2h18M8.4 3l2.9 5.2M14.4 3l2.9 5.2"/><path class="igr-nav-play" d="M10 11.2v6.4l5.4-3.2z"/></svg>';

/* TikTok "Para você" (fatos-tiktok-para-voce-v1, TikTok.tsx): filled and stroked icons of the app, no brand glyph. */
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
/* YouTube watch screen (fatos-youtube-player-v1, YouTube.tsx): generic stroked action glyphs. */
const YT = {
  gostei: 'M7.5 10.5V20H4.2a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM7.5 10.5l3.6-6.6c.3-.6 1-.9 1.6-.6 1 .4 1.5 1.5 1.2 2.6l-.8 3h5.1a2 2 0 0 1 2 2.4l-1.3 6.8a2.4 2.4 0 0 1-2.4 1.9H7.5',
  naoGostei: 'M16.5 13.5V4h3.3a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1zM16.5 13.5l-3.6 6.6c-.3.6-1 .9-1.6.6-1-.4-1.5-1.5-1.2-2.6l.8-3H5.8a2 2 0 0 1-2-2.4l1.3-6.8A2.4 2.4 0 0 1 7.5 4h9',
  compartilhar: 'M13.5 5 20.5 11.6l-7 6.6v-3.7c-4.8 0-7.7 1.4-9.7 4.6.5-5.2 3.4-9.3 9.7-10.2z',
  remixar: 'M5 7h9.5a4.5 4.5 0 0 1 0 9H8M8 13l-3 3 3 3M17 4l3 3-3 3',
  baixar: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14',
  salvar: 'M4 6.5h11M4 11.5h11M4 16.5h7M18 13v7M14.5 16.5h7',
  opcoes: 'M12 5.5h.01M12 12h.01M12 18.5h.01',
};
const yti = (d, cls = 'yt-i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function makeLabScreens({ marca, esc, CLIENTES, pic }) {
  const user = key => CLIENTES[key].arroba;
  /* Post header: avatar, user name and the second line (Posts screen measurements). */
  const cab = (key, second = 'Patrocinado') => `<div class="ig-cab" data-linhas="2">${marca(key, 'circulo', 'ig-avatar')}<div class="ig-cab-txt"><b>${esc(user(key))}</b><span class="ig-parceria">${esc(second)}</span></div>${opcoes}</div>`;
  const acoes = (dots = '') => `<div class="ig-acoes">${ico(IG.coracao, 'ig-acao')}${ico(IG.comentario, 'ig-acao')}${ico(IG.repost, 'ig-acao')}${ico(IG.enviar, 'ig-acao')}${dots}${ico(IG.salvar, 'ig-acao ig-salvar')}</div>`;
  /* Instagram's bottom bar of 2026: home, Reels, messages in the centre, search and profile. */
  const nav = (on = 'inicio') => `<div class="igr-nav${on === 'inicio' ? ' igr-nav--feed' : ''}">${ico(IG.inicio, 'igr-nav-ico' + (on === 'inicio' ? ' is-on' : ''))}${reelsIco}${ico(IG.enviar, 'igr-nav-ico')}${ico(IG.busca, 'igr-nav-ico')}<span class="igr-nav-perfil"></span></div>`;
  /* Home feed bar: create, the app name and notifications. */
  const feedTop = `<div class="ig-topo ig-topo--home">${ico(IG.criar, 'ig-home-criar')}<b class="ig-home-nome">Instagram</b>${ico(IG.coracao, 'ig-home-coracao')}</div>`;

  /** Feed ad: header with Patrocinado, 4:5 media (one piece or a sliding carousel), the ad CTA bar, actions, caption, the next post. */
  function feedAd({ key, media, carousel = 0, cta, caption, captionOpen = false }) {
    const dots = carousel ? `<span class="ig-pontos ig-pontos--acoes" data-hs="2" aria-hidden="true">${Array.from({ length: carousel }, () => '<i></i>').join('')}</span>` : '';
    const count = carousel ? `<span class="ig-contador cm-count">${Array.from({ length: carousel }, (_, i) => `<i>${i + 1}</i>`).join('')}/${carousel}</span><span class="ig-som"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4zM16 9.5l5 5M21 9.5l-5 5"/></svg></span>` : '';
    return `<div class="ig ig--feed">${feedTop}
      <article class="ig-post">${cab(key)}<div class="ig-midia${carousel ? ' cm-carousel' : ''}">${media}${count}</div>
        <div class="ig-cta${cta.cls ? ' ' + cta.cls : ''}" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}">${cta.lead || ''}<b>${esc(cta.text)}</b>${ico(IG.seta, 'ig-cta-seta')}</div>
        ${acoes(dots)}
        <p class="ig-legenda cm-ig-caption${captionOpen ? ' cm-ig-caption--open' : ''}"${caption.hs ? ` data-hs="${caption.hs}"` : ''}><b>${esc(user(key))}</b> ${caption.html}</p></article>
      <article class="ig-post ig-seguinte"><div class="ig-cab">${'<span class="ig-avatar ig-avatar--x"></span>'}<div class="ig-cab-txt"><b>perfil_seguido</b></div>${opcoes}</div><div class="ig-midia ig-midia--x"></div></article>
      ${nav('inicio')}<span class="ig-navegacao"></span></div>`;
  }

  /** Story ad: rounded 9:16 card under the safe area, progress bars, header with Patrocinado, the ad link button and the reply field. */
  function storyAd({ key, media, cta, bars = 2 }) {
    return `<div class="igs"><div class="igs-cartao"><div class="igs-arte">${media}</div>
        <div class="igs-progresso">${Array.from({ length: bars }, (_, i) => `<i${i === 0 ? ' data-estado="agora"' : ''}></i>`).join('')}</div>
        <div class="igs-cab">${marca(key, 'circulo', 'igs-avatar')}<div class="igs-cab-txt"><span class="igs-nome"><b>${esc(user(key))}</b></span><span class="igs-parceria">Patrocinado</span></div>${mais('igs-ico igs-mais')}${ico(IG.fechar, 'igs-ico igs-fechar')}</div>
        <span class="igs-link igs-link--ad" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}">${ico(IG.link, '')}${esc(cta.text)}</span></div>
      <div class="igs-pe"><span class="igs-campo">Enviar mensagem</span>${ico(IG.coracao, 'igs-pe-ico')}${ico(IG.enviar, 'igs-pe-ico')}</div></div>`;
  }

  /** Live of the advertiser in the story frame: Ao vivo badge, comments over the video, the pinned link and the comment field. */
  function liveAd({ key, media, comments, cta }) {
    return `<div class="igs igl"><div class="igs-cartao"><div class="igs-arte">${media}</div>
        <div class="igs-cab">${marca(key, 'circulo', 'igs-avatar')}<div class="igs-cab-txt"><span class="igs-nome"><b>${esc(user(key))}</b><em class="igl-ao-vivo">Ao vivo</em></span><span class="igs-parceria">Patrocinado</span></div>${ico(IG.fechar, 'igs-ico igs-fechar')}</div>
        <div class="igl-comentarios">${comments.map(([who, text, own, hs]) => `<p class="igl-comentario${own ? ' is-marca' : ''}"${hs ? ` data-hs="${hs}"` : ''}>${own ? marca(key, 'circulo', 'igl-av') : '<i class="igl-av"></i>'}<span><b>${esc(who)}</b>${esc(text)}</span></p>`).join('')}</div>
        <span class="igl-fixado" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}">${ico(IG.link, '')}<span><small>Fixado por ${esc(user(key))}</small><b>${esc(cta.text)}</b></span>${ico(IG.seta, 'igl-seta')}</span></div>
      <div class="igs-pe"><span class="igs-campo">Comentar…</span>${ico(IG.coracao, 'igs-pe-ico')}${ico(IG.enviar, 'igs-pe-ico')}</div></div>`;
  }

  /** Reels ad: video to the nav bar, Reels and Amigos, the action column, page, caption, Patrocinado, audio, the ad CTA and progress. */
  function reelsAd({ key, video, caption, cta, audio = 'Áudio original' }) {
    return `<div class="igr"><div class="igr-video">${video}</div>
      <div class="igr-topo">${ico(IG.criar, 'igr-criar')}<span class="igr-abas"><b>Reels</b><span>Amigos</span></span></div>
      <div class="igr-acoes">${ico(IG.coracao, 'igr-acao')}${ico(IG.comentario, 'igr-acao')}${ico(IG.repost, 'igr-acao')}${ico(IG.enviar, 'igr-acao')}${mais('igr-acao igr-mais')}${marca(key, 'quadrado', 'igr-capa-audio')}</div>
      <div class="igr-pe"><span class="igr-perfil">${marca(key, 'circulo', 'igr-avatar')}<b>${esc(user(key))}</b><span class="igr-seguir">Seguir</span></span>
        <span class="igr-legenda"><span class="igr-legenda-txt">${esc(caption)}</span><span class="igr-legenda-mais">mais</span></span>
        <span class="igr-parceria">Patrocinado</span><span class="igr-audio">${ico(IG.musica, 'igr-audio-ico')}${esc(audio)}</span>
        <span class="igr-cta" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}"><b>${esc(cta.text)}</b>${ico(IG.seta, 'igr-cta-seta')}</span></div>
      <span class="igr-progresso" data-hs="2"><i data-cx-progress></i></span>${nav('reels')}</div>`;
  }

  /** Explore grid in dark mode, with the search field. */
  function explore({ cells }) {
    return `<div class="ig igx"><div class="igx-busca">${ico(IG.busca, 'igx-busca-ico')}<span>Pesquisar</span></div><div class="igx-grade">${cells}</div>${nav('busca')}<span class="ig-navegacao"></span></div>`;
  }

  /** A post opened from Explore: the Posts bar of the lab ("Explorar"), then the same ad post as the feed. */
  function postAberto({ key, media, cta, caption }) {
    return `<div class="ig ig--feed"><div class="ig-topo"><svg class="ig-voltar" viewBox="0 0 12 19" aria-hidden="true"><path d="M10 1.5 2 9.5l8 8"/></svg><b class="ig-titulo">Explorar</b></div>
      <article class="ig-post">${cab(key)}<div class="ig-midia">${media}</div>
        <div class="ig-cta" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}"><b>${esc(cta.text)}</b>${ico(IG.seta, 'ig-cta-seta')}</div>
        ${acoes()}<p class="ig-legenda cm-ig-caption"><b>${esc(user(key))}</b> ${caption}</p></article><span class="ig-navegacao"></span></div>`;
  }

  /** TikTok "Para você" with an ad: LIVE, tabs and search; video to the app bar; the action column without counts;
      name, caption, the Patrocinado label, the sound line, the ad CTA; the app bar of 2026. */
  function tiktokAd({ key, video, caption, cta, sound }) {
    return `<div class="tt"><div class="tt-video">${video}<span class="tt-progresso" data-hs="2"><i data-cx-progress></i></span></div>
      <div class="tt-topo">${ttLive}<span class="tt-abas"><span class="tt-aba">Seguindo</span><span class="tt-aba" data-on>Para você</span></span>${traco(TT.busca, 'tt-busca')}</div>
      <div class="tt-trilho"><span class="tt-perfil">${marca(key, 'circulo', 'tt-av')}<span class="tt-seguir">${mais12}</span></span>${cheio(TT.coracao, 'tt-acao')}<span class="tt-acao tt-comentar">${cheio(TT.balao)}<i></i></span>${cheio(TT.favorito, 'tt-acao tt-favorito')}${cheio(TT.compartilhar, 'tt-acao')}<span class="tt-disco">${marca(key, 'circulo', 'tt-disco-av')}</span></div>
      <div class="tt-info"><b class="tt-nome">${esc(user(key))}</b><p class="tt-legenda">${esc(caption)}</p><span class="tt-selo">Patrocinado</span><span class="tt-som">${traco(TT.nota)}<span class="tt-som-texto"><span><span>${esc(sound)}</span><span>${esc(sound)}</span></span></span></span>
        <span class="tt-cta" data-tap="${cta.tap || 'cta'}" data-hs="${cta.hs || '3'}"><b>${esc(cta.text)}</b>${ico(IG.seta, 'tt-cta-seta')}</span></div>
      <div class="tt-nav"><span class="tt-nav-item" data-on>${cheio(TT.inicio)}Início</span><span class="tt-nav-item">${traco(TT.amigos)}Amigos</span><span class="tt-criar"><i>${mais12}</i></span><span class="tt-nav-item">${traco(TT.caixa)}Caixa de entrada</span><span class="tt-nav-item">${traco(TT.perfil)}Perfil</span></div></div>`;
  }

  const ytActions = `<div class="yt-pilulas"><span class="yt-pilula yt-pilula-gostei">${yti(YT.gostei)}<i class="yt-divisor"></i>${yti(YT.naoGostei)}</span><span class="yt-pilula">${yti(YT.compartilhar)}Compartilhar</span><span class="yt-pilula">${yti(YT.remixar)}Remixar</span><span class="yt-pilula">${yti(YT.baixar)}Baixar</span><span class="yt-pilula">${yti(YT.salvar)}Salvar</span></div>`;
  const ytChannel = (name, initial) => `<div class="yt-canal"><i class="yt-avatar yt-avatar--x">${esc(initial)}</i><b class="yt-canal-nome">${esc(name)}</b><span class="yt-inscrever">Inscrever-se</span></div>`;

  /** YouTube watch screen with an in-stream ad: the ad in the 16:9 player, the companion card of the advertiser,
      then the video page of the lab (title, channel, action pills, comments and the next video). */
  function youtubeAd({ key, player, panel, title, meta }) {
    return `<div class="yt"><div class="yt-player cm-yt-player">${player}</div>
      <div class="yt-ad-painel">${marca(key, 'circulo', 'yt-ad-av')}<span><b>${esc(panel.title)}</b><small><b>Patrocinado</b> · ${esc(CLIENTES[key].dominio)}</small></span><span class="yt-ad-btn" data-tap="${panel.tap || 'cta'}" data-hs="${panel.hs || '3'}">${esc(panel.button)}</span></div>
      <div class="yt-info"><p class="yt-titulo">${esc(title)}</p><p class="yt-meta">${meta}</p></div>
      ${ytChannel('Canal Exemplo', 'C')}${ytActions}
      <div class="yt-comentarios"><b>Comentários</b><span class="yt-comentar"><i class="yt-comentar-avatar"></i>Adicione um comentário…</span></div>
      <div class="yt-seguinte"><div class="yt-miniatura">${pic('cenaEsportes', { pos: '50% 64%' })}<span class="yt-duracao">12:08</span></div><div class="yt-seguinte-info"><i class="yt-avatar yt-avatar--x">C</i><span><b>Os gols da rodada em dez minutos</b><small>Canal Exemplo</small></span>${yti(YT.opcoes, 'yt-i yt-i-opcoes')}</div></div>
      <span class="yt-navegacao"></span></div>`;
  }

  /** YouTube live of a creator with the paid promotion notice: player, title, channel and the live chat. */
  function youtubeLive({ player, title, meta, chat }) {
    return `<div class="yt yt--live"><div class="yt-player cm-yt-player">${player}</div>
      <div class="yt-info"><p class="yt-titulo">${esc(title)}</p><p class="yt-meta">${meta}</p></div>
      ${ytChannel('Canal Exemplo', 'C')}${chat}<span class="yt-navegacao"></span></div>`;
  }

  return { feedAd, storyAd, liveAd, reelsAd, explore, postAberto, tiktokAd, youtubeAd, youtubeLive };
}
