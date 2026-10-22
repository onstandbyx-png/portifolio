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

export function makeLabScreens({ marca, esc, CLIENTES }) {
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

  return { feedAd, storyAd, liveAd, reelsAd, explore, postAberto };
}
