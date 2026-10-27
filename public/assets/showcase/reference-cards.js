/* Service cards rebuilt from the owner's four reference compositions ("Verso do cartão", 941×1672):
 * 02 Campanhas, 05 Conteúdo, 08 E-commerce and 09 Marca. Each reference is split into two legible faces:
 * the front keeps header → rule → headline → lead → photographic scene → CTA; the back keeps the lower half
 * (steps, light panel, three tiles, CTA). Scenes are crops of the owner's own images; "Natura" became
 * "Ateliê" and the watch's "+62%" was removed. Numbers, ratings and testimonials from the studies are left out.
 * Micro-interactions follow the Rive files the owner sent (checkbox #475, play button #17822,
 * add to cart #11874), recreated with WAAPI because their licence is reference-only. */
const P = {
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron:'<path d="M9.5 6l6 6-6 6"/>',
  bulb:'<path d="M9.2 18h5.6M10.2 21h3.6M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  video:'<rect x="3" y="6.5" width="13" height="11" rx="2.4"/><path d="M16 10.4l5-2.9v9l-5-2.9"/>',
  send:'<path d="M20.5 3.5L10.4 13.6M20.5 3.5l-6.3 17-3.8-6.9-6.9-3.8z"/>',
  social:'<rect x="4" y="4" width="16" height="16" rx="4.6"/><circle cx="12" cy="12" r="3.7"/><circle cx="16.9" cy="7.2" r=".7" fill="currentColor"/>',
  search:'<circle cx="11" cy="11" r="6.3"/><path d="M20 20l-4.4-4.4"/>',
  bag:'<path d="M5 8h14l-1 12.5H6z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
  card:'<rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="M3 10h18M7 15h4"/>',
  refresh:'<path d="M19.5 9.2A8 8 0 0 0 5.2 7.4M4.5 14.8a8 8 0 0 0 14.3 1.8"/><path d="M5 3.5v4h4M19 20.5v-4h-4"/>',
  shield:'<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z"/><path d="M8.8 12l2.3 2.3 4.2-4.4"/>',
  bars:'<path d="M5 20v-6M10 20V9M15 20v-8M20 20V5"/>',
  users:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.3 2.8-5.2 5.5-5.2s4.9 1.9 5.5 5.2"/><circle cx="16.6" cy="9.5" r="2.5"/><path d="M15.6 14.4c2.5.1 4.3 1.8 4.9 5.1"/>',
  cart:'<path d="M3 4h2.4l2.2 10.6h10.2l2-7.6H6.6"/><circle cx="9.4" cy="19" r="1.5"/><circle cx="16.6" cy="19" r="1.5"/>',
  leaf:'<path d="M5 19c0-8 5-13.2 14-14 0 9-5 14-13.2 14"/><path d="M5 19l6.8-6.8"/>',
  wave:'<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1"/><path d="M18 6l-4.5 4.5"/>',
  diamond:'<path d="M6.5 4h11l3.5 5-9 11-9-11z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
  layers:'<path d="M12 3.5l8.5 4.6-8.5 4.6-8.5-4.6z"/><path d="M3.5 12.2l8.5 4.6 8.5-4.6M3.5 16.2l8.5 4.6 8.5-4.6"/>',
  eye:'<path d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  hand:'<path d="M8.5 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1V4a1.5 1.5 0 0 1 3 0v6m0 0V5.5a1.5 1.5 0 0 1 3 0V14a6.5 6.5 0 0 1-6.5 6.5c-2.4 0-4-1.2-5.2-3l-2.4-3.8a1.5 1.5 0 0 1 2.4-1.8l1.7 2.1"/>',
  bolt:'<path d="M13 2.8L5 13.5h6.2L10.6 21 19 10.2h-6.2z"/>',
  question:'<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.7v.6"/><circle cx="12" cy="16.9" r=".6" fill="currentColor"/>',
  gift:'<rect x="4" y="9" width="16" height="11.5" rx="1.6"/><path d="M3 9h18M12 9v11.5M12 9c-1.8 0-4.6-.7-4.6-2.7 0-1.4 1.3-2.2 2.5-1.6C11.4 5.5 12 9 12 9zm0 0c1.8 0 4.6-.7 4.6-2.7 0-1.4-1.3-2.2-2.5-1.6C12.6 5.5 12 9 12 9z"/>',
  truck:'<path d="M3 6.5h11V16H3zM14 9.5h4l3 3.2V16h-7z"/><circle cx="7" cy="17.6" r="1.8"/><circle cx="17.2" cy="17.6" r="1.8"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.6V12l3 2"/>',
  swap:'<path d="M5 8h13l-3.5-3.5M19 16H6l3.5 3.5"/>',
  heart:'<path d="M12 19.6s-7.4-4.5-7.4-9.8A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.4 2.5c0 5.3-7.4 9.8-7.4 9.8z"/>',
  image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.6 8.5"/>',
  doc:'<path d="M6.5 3.5h8L19 8v12.5H6.5z"/><path d="M14.5 3.5V8H19M9.6 12.2h6M9.6 15.8h6"/>',
  box:'<path d="M12 3l8 4.3v9.4L12 21l-8-4.3V7.3z"/><path d="M4 7.3l8 4.4 8-4.4M12 11.7V21"/>',
  ret:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'
};
const icon = (name, cls = 'rc-ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name]}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IMG = '/assets/reference-cards/';
const ytMark = '<svg class="rc-logo" viewBox="0 0 28 20" aria-hidden="true" focusable="false"><rect width="28" height="20" rx="5.5" fill="#FF0000"/><path d="M11.2 5.9v8.2l7-4.1z" fill="#fff"/></svg>';

export const referenceCards = [
  {
    id:'campanhas', num:'02', name:'Campanhas', sub:'Meta / Google / TikTok / YouTube', short:'Campanhas',
    service:'Campanhas e anúncios', tone:'night',
    title:'Estratégia, criativos e mídia em sintonia<span class="rc-dot">.</span>',
    plainTitle:'Estratégia, criativos e mídia em sintonia.',
    lead:'Do planejamento à escala, um sistema para gerar demanda e vendas.',
    scene:{src:'02-campanhas-cena.webp', w:760, h:380, alt:'Monitor com criativos de campanha, relógio e tablet com o planejamento dos canais.'},
    platforms:[
      {name:'Meta', logo:'<img class="rc-logo" src="/assets/brands/meta-official-primary.webp" alt="" width="40" height="13" decoding="async">'},
      {name:'Google', logo:'<img class="rc-logo rc-logo--sq" src="/assets/brands/google-ads-official-reference.webp" alt="" width="18" height="18" decoding="async">'},
      {name:'TikTok', logo:'<img class="rc-logo rc-logo--sq" src="/assets/brands/tiktok-official-icon-black-circle.png" alt="" width="18" height="18" decoding="async">'},
      {name:'YouTube', logo:ytMark}
    ],
    front:'Ver estrutura', cta:'Conversar sobre campanhas'
  },
  {
    id:'conteudo', num:'05', name:'Conteúdo', sub:'Vídeo / Social / Blog', short:'Conteúdo',
    service:'Conteúdo e redação', tone:'forest',
    title:'Um sistema de conteúdo que atrai, educa e converte.',
    plainTitle:'Um sistema de conteúdo que atrai, educa e converte.',
    lead:'Do planejamento à distribuição, conteúdos que geram audiência.',
    scene:{src:'05-conteudo-cena.webp', w:760, h:408, alt:'Notebook com um vídeo de paisagem e celular com a versão vertical do mesmo conteúdo.'},
    steps:[['bulb','Ideia','Estratégia e pauta'],['video','Produção','Roteiro, captação e edição'],['send','Distribuição','Publicação e amplificação']],
    tiles:[['video','Vídeo','Conteúdo que prende e engaja.'],['social','Social','Formatos nativos para cada plataforma.'],['search','SEO','Conteúdo preparado para a busca.']],
    front:'Ver engine de conteúdo', cta:'Conversar sobre conteúdo', backTitle:'Uma ideia. Conteúdo para cada canal.'
  },
  {
    id:'ecommerce', num:'08', name:'E-commerce', sub:'Loja / Conversão / CRM', short:'E-commerce',
    service:'Sites e landing pages', tone:'leaf',
    title:'Da página de produto à recompra.',
    plainTitle:'Da página de produto à recompra.',
    lead:'Uma jornada completa para vender mais e construir clientes de longo prazo.',
    scene:{src:'08-ecommerce-cena.webp', w:760, h:474, alt:'Tablet com a página de um creme facial fictício e celular com recomendações de recompra.'},
    steps:[['bag','Produto','Apresenta e encanta'],['card','Checkout','Simples e seguro'],['refresh','Recompra','Relaciona e fideliza']],
    tiles:[['shield','Confiança','Pagamentos seguros e experiência confiável.'],['bars','Ticket médio','Upsell e cross-sell inteligente.'],['users','CRM','Relaciona\u00admento que gera recompra.']],
    front:'Ver jornada de compra', cta:'Conversar sobre minha loja', backTitle:'Escolher e comprar, sem complicação.'
  },
  {
    id:'marca', num:'09', name:'Marca', sub:'Identidade / Posicionamento', short:'Marca',
    service:'Identidade visual', tone:'brand',
    title:'Sistemas de marca para ser reconhecido com clareza.',
    plainTitle:'Sistemas de marca para ser reconhecido com clareza.',
    lead:'Estratégia, identidade e aplicações em um sistema coeso.',
    scene:{src:'09-marca-cena.webp', w:760, h:497, alt:'Tablet com o manual da marca fictícia Ateliê, garrafa e cartão aplicados sobre pedra.'},
    pillars:[['leaf','Essência'],['wave','Tom de voz'],['grid','Aplicações']],
    tiles:[['target','Posiciona\u00admento'],['diamond','Identidade'],['layers','Consis\u00adtência']],
    front:'Ver sistema de marca', cta:'Conversar sobre minha marca', backTitle:'Sua identidade, em cada detalhe.'
  }
];

const head = (card, back = false) => `<header class="rc-head"><span class="rc-badge" aria-hidden="true">${card.num}</span><div class="rc-id">${back ? `<h4 class="rc-name" tabindex="-1" data-fatos-back-title>${esc(card.name)}</h4>` : `<strong class="rc-name">${esc(card.name)}</strong>`}<span class="rc-sub">${esc(card.sub)}</span></div>${back ? '<span class="rc-verso">Verso do cartão</span>' : ''}</header><span class="rc-rule" aria-hidden="true"></span>`;
const scene = card => `<figure class="rc-scene rc-scene--${card.id}"><img src="${IMG + card.scene.src}" width="${card.scene.w}" height="${card.scene.h}" alt="${esc(card.scene.alt)}" loading="lazy" decoding="async" draggable="false"></figure>`;
const steps = (card, boxed = false) => `<ol class="rc-steps${boxed ? ' rc-steps--boxed' : ''}">${card.steps.map(([ico, t, d], n) => `<li><span class="rc-step-ico">${icon(ico)}</span><span class="rc-step-copy"><b>${esc(t)}</b><small>${esc(d)}</small></span>${n < card.steps.length - 1 ? `<span class="rc-step-sep" aria-hidden="true">${icon(boxed ? 'chevron' : 'arrow')}</span>` : ''}</li>`).join('')}</ol>`;
const tiles = list => `<ul class="rc-tiles">${list.map(([ico, t, d]) => `<li><span class="rc-tile-ico">${icon(ico)}</span><b>${esc(t)}</b>${d ? `<small>${esc(d)}</small>` : ''}</li>`).join('')}</ul>`;
const cta = card => `<div class="rc-actions"><a class="rc-cta rc-cta--back" href="#contato" data-contact-service="${esc(card.service)}" data-contact-source="deck:${card.id}" data-contact-case="${esc(card.name)} · cartão de serviço"><span>${esc(card.cta)}</span><span class="rc-cta-arrow" aria-hidden="true">${icon('arrow')}</span></a><button type="button" class="pf-fatos-flip rc-return" data-fatos-return aria-label="Voltar ao cartão">${icon('ret')}</button></div>`;
const checkMark = () => '<span class="rc-check" aria-hidden="true"><svg viewBox="0 0 40 40"><g class="rc-check-dots">' + Array.from({length:8}, (_, i) => { const a = i * Math.PI / 4; return `<circle cx="${(20 + Math.cos(a) * 17).toFixed(2)}" cy="${(20 + Math.sin(a) * 17).toFixed(2)}" r="1.9"/>`; }).join('') + '</g><circle class="rc-check-ring" cx="20" cy="20" r="11.5"/><circle class="rc-check-fill" cx="20" cy="20" r="11.5"/><path class="rc-check-path" d="M14.6 20.4l3.7 3.6 7.1-7.4" pathLength="1"/></svg></span>';

const backBody = {
  campanhas: card => `<section class="rc-block rc-matrix" aria-label="Matriz de testes criativos"><div class="rc-block-head"><b>Matriz de testes criativos</b></div><div class="rc-matrix-grid" role="group" aria-label="Combinação de teste">${[
      ['Ganchos', [['hand','Problema'],['bolt','Desejo'],['question','Curiosidade'],['bars','Resultado']]],
      ['Ofertas', [['gift','Desconto'],['truck','Frete grátis'],['gift','Bônus'],['clock','Condição limitada']]],
      ['Ângulos', [['users','Prova social'],['shield','Autoridade'],['swap','Comparativo'],['heart','Estilo de vida']]]
    ].map(([col, items]) => `<div class="rc-matrix-col" data-col="${esc(col)}"><span class="rc-matrix-th">${esc(col)}</span>${items.map(([ico, label]) => `<button type="button" class="rc-matrix-cell" aria-pressed="false" data-matrix="${esc(col)}">${icon(ico)}<span>${esc(label)}</span>${checkMark()}</button>`).join('')}</div>`).join('')}</div><p class="rc-matrix-out" aria-live="polite">Escolha um item de cada coluna para montar o teste.</p></section>
    
    <section class="rc-block rc-deliver" aria-label="O que eu entrego"><div class="rc-block-head"><span class="rc-deliver-mark">${icon('box')}</span><b>O que eu entrego</b></div><ul>${[['target','Estratégia completa','Público, oferta, criativos e canais integrados.'],['image','Produção de criativos','Roteiros, UGC, variações e testes contínuos.'],['bars','Gestão e otimização','Acompanhamento e ajustes contínuos.'],['doc','Relatórios claros','Aprendizados e próximos passos.']].map(([ico, t, d]) => `<li>${icon(ico)}<span><b>${t}</b><small class="rc-deliver-note">${d}</small></span></li>`).join('')}</ul></section>`,
  conteudo: card => `<section class="rc-panel rc-hooks" aria-label="Teste de gancho"><b class="rc-panel-title">Teste de gancho</b><div class="rc-hooks-row">${[['a','Isso muda tudo na sua viagem.'],['b','5 dicas para viajar melhor.']].map(([k, text], n) => `${n ? '<span class="rc-vs" aria-hidden="true">vs</span>' : ''}<button type="button" class="rc-hook" aria-pressed="false" data-hook="${k}"><span class="rc-hook-thumb"><img src="${IMG}05-gancho-${k}.webp" width="200" height="168" alt="" loading="lazy" decoding="async" draggable="false"><span class="rc-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6.8v10.4l8.4-5.2z"/></svg></span></span><span class="rc-hook-copy">${esc(text)}</span>${checkMark()}</button>`).join('')}</div><p class="rc-hooks-out" aria-live="polite">Toque na abertura que prende mais.</p></section>${tiles(card.tiles)}`,
  ecommerce: card => `<section class="rc-panel rc-repeat" aria-label="Clientes que voltam"><span class="rc-repeat-ico">${icon('shield')}</span><span class="rc-repeat-copy"><b>Clientes que voltam.</b><small>Recompra em um toque.</small></span><button type="button" class="rc-cart" aria-pressed="false"><span class="rc-cart-label">Adicionar</span><span class="rc-cart-ico">${icon('cart')}</span><i class="rc-cart-trail" aria-hidden="true"></i><span class="rc-cart-done" aria-hidden="true">No carrinho</span></button><span class="rc-cart-status" aria-live="polite"></span></section><section class="rc-block rc-recover" aria-label="Recuperação de carrinho"><div class="rc-recover-note"><img src="${IMG}08-pote.webp" width="180" height="185" alt="" loading="lazy" decoding="async"><span><b>Seu carrinho ainda está te esperando.</b><small>Lembrete automático, no canal que o cliente prefere.</small></span></div><ul class="rc-channels"><li>E-mail</li><li>WhatsApp</li><li>Push</li></ul></section>${tiles(card.tiles)}`,
  marca: card => `<figure class="rc-scene rc-scene--detail"><img src="${IMG + card.scene.src}" width="${card.scene.w}" height="${card.scene.h}" alt="" loading="lazy" decoding="async" draggable="false"></figure><div class="rc-paper"><div class="rc-specimen" aria-label="Paleta e tipografia"><span class="rc-swatches" aria-hidden="true"><i style="--c:#173A2B"></i><i style="--c:#7E9B7B"></i><i style="--c:#D8C4A2"></i><i style="--c:#ECE6DB"></i></span><span class="rc-type"><b aria-hidden="true">Aa</b><small>INTER<br>0123456789</small></span></div>${tiles(card.tiles)}</div>`
};

const FUNNEL_STEPS = [['eye','Impressão'],['users','Lead'],['cart','Venda']];
const FUNNEL = () => `<section class="rc-block rc-funnel" aria-label="Funil da campanha"><b>Funil da campanha</b><ol>${FUNNEL_STEPS.map(([ico, t], n) => `<li><span class="rc-funnel-ico">${icon(ico)}</span><span>${t}</span>${n < 2 ? `<i aria-hidden="true">${icon('chevron')}</i>` : ''}</li>`).join('')}</ol></section>`;
export function referenceFront(card) {
  const platforms = card.platforms ? `<div class="rc-arch"><div class="rc-arch-head"><b>Arquitetura da campanha</b><small>Canais integrados, papéis complementares.</small></div><ul>${card.platforms.map(p => `<li>${p.logo}<span>${esc(p.name)}</span></li>`).join('')}</ul></div>` : '';
  const flow = card.steps ? steps(card, card.id === 'ecommerce') : card.id === 'campanhas' ? FUNNEL() : '';
  const pillars = card.pillars ? `<ul class="rc-pillars">${card.pillars.map(([ico, t]) => `<li><span class="rc-pillar-ico">${icon(ico)}</span>${esc(t)}</li>`).join('')}</ul>` : '';
  return `${head(card)}<h4 class="rc-title">${card.title}</h4><p class="rc-lead">${esc(card.lead)}</p>${platforms}${scene(card)}${flow}${pillars ? `<div class="rc-foot">${pillars}` : ''}<button type="button" class="pf-fatos-flip rc-cta rc-cta--front" data-fatos-flip aria-expanded="false"><span>${esc(card.front)}</span><span class="rc-cta-arrow" aria-hidden="true">${icon('arrow')}</span></button>${pillars ? '</div>' : ''}`;
}
export function referenceBack(card) {
  return `${head(card, true)}${card.backTitle ? `<p class="rc-back-title">${esc(card.backTitle)}</p>` : ''}<div class="rc-back-body">${backBody[card.id](card)}</div>${cta(card)}`;
}

/* ---- Micro-interactions ---- */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('is-paused');
// Rive #475 "animated checkbox": ring → fill grows past the ring (peak at 167 ms) → settles → dots burst (367–517) → check stroke (517–667); 833 ms in total.
function playCheck(button, on) {
  const svg = button.querySelector('.rc-check svg'); if (!svg) return;
  const ring = svg.querySelector('.rc-check-ring'), fill = svg.querySelector('.rc-check-fill'), dots = svg.querySelector('.rc-check-dots'), path = svg.querySelector('.rc-check-path');
  svg.getAnimations({subtree:true}).forEach(a => a.cancel());
  if (reduced()) return;
  // Offsets are fractions of 833 ms, read from the Rive frames (17, 67, 117 … 667 ms); easing stays linear between them.
  const o = {duration:on ? 833 : 850, fill:'both', easing:'linear'};
  if (on) {
    ring.animate([{opacity:1,offset:0},{opacity:1,offset:.12},{opacity:0,offset:.16},{opacity:0,offset:1}], o);
    fill.animate([{transform:'scale(0)',offset:0},{transform:'scale(.42)',offset:.08},{transform:'scale(.94)',offset:.14},{transform:'scale(1.36)',offset:.2},{transform:'scale(1.16)',offset:.26},{transform:'scale(1)',offset:.32},{transform:'scale(.9)',offset:.38},{transform:'scale(.98)',offset:.44},{transform:'scale(1.06)',offset:.5},{transform:'scale(1)',offset:.56},{transform:'scale(1)',offset:1}], o);
    dots.animate([{opacity:0,transform:'scale(.82)',offset:0},{opacity:0,transform:'scale(.82)',offset:.41},{opacity:1,transform:'scale(1)',offset:.44},{opacity:1,transform:'scale(1.12)',offset:.56},{opacity:.6,transform:'scale(1.22)',offset:.68},{opacity:0,transform:'scale(1.28)',offset:.8},{opacity:0,transform:'scale(1.28)',offset:1}], o);
    path.animate([{strokeDashoffset:1,offset:0},{strokeDashoffset:1,offset:.6},{strokeDashoffset:.55,offset:.68},{strokeDashoffset:.18,offset:.74},{strokeDashoffset:0,offset:.8},{strokeDashoffset:0,offset:1}], o);
  } else {
    path.animate([{strokeDashoffset:0},{strokeDashoffset:1,offset:.3},{strokeDashoffset:1}], o);
    fill.animate([{transform:'scale(1)'},{transform:'scale(1.12)',offset:.25},{transform:'scale(0)',offset:.62},{transform:'scale(0)'}], o);
    ring.animate([{opacity:0},{opacity:0,offset:.5},{opacity:1,offset:.7},{opacity:0}], o);
  }
}
// Rive #17822 "play button": press-and-release in 117 ms.
function pressPlay(button) {
  const play = button.querySelector('.rc-play'); if (!play || reduced()) return;
  play.animate([{transform:'scale(1)',boxShadow:'0 6px 14px #0006, inset 0 1px 0 #ffffff26'},{transform:'scale(.9)',boxShadow:'0 2px 5px #0005, inset 0 2px 6px #0008',offset:.5},{transform:'scale(1)',boxShadow:'0 6px 14px #0006, inset 0 1px 0 #ffffff26'}], {duration:117, easing:'ease-out'});
}
// Rive #11874 "add to cart": the pill flattens into the icon (0–267 ms), the cart runs right with a trail (217–467 ms), then a ring of dots (467–650 ms).
function runCart(button, on) {
  button.getAnimations({subtree:true}).forEach(a => a.cancel());
  const before = button.getBoundingClientRect().width;
  button.classList.toggle('is-added', on);
  if (reduced() || !on) return;
  const after = button.getBoundingClientRect().width, round = button.getBoundingClientRect().height;
  const label = button.querySelector('.rc-cart-label'), ico = button.querySelector('.rc-cart-ico'), trail = button.querySelector('.rc-cart-trail'), done = button.querySelector('.rc-cart-done');
  // Fractions of 683 ms from the Rive frames: the pill narrows until the icon is alone (≈267 ms), the cart runs with a trail (317–517 ms), then the label returns.
  const o = {duration:683, fill:'both', easing:'linear'};
  const pad = getComputedStyle(button), tight = (round - 18) / 2 + 'px';
  button.animate([{width:before + 'px',paddingLeft:pad.paddingLeft,paddingRight:pad.paddingRight,gap:pad.columnGap},{width:round + 'px',paddingLeft:tight,paddingRight:tight,gap:'0px',offset:.39},{width:round + 'px',paddingLeft:tight,paddingRight:tight,gap:'0px',offset:.76},{width:after + 'px',paddingLeft:pad.paddingLeft,paddingRight:pad.paddingRight,gap:pad.columnGap}], {...o, easing:'cubic-bezier(.4,0,.2,1)'});
  label.animate([{opacity:1,maxWidth:'90px'},{opacity:0,maxWidth:'0px',offset:.32},{opacity:0,maxWidth:'0px'}], o);
  ico.animate([{transform:'translateX(0)'},{transform:'translateX(0)',offset:.46},{transform:'translateX(9px)',offset:.62},{transform:'translateX(-3px)',offset:.7},{transform:'translateX(0)',offset:.76},{transform:'translateX(0)'}], o);
  trail.animate([{opacity:0,transform:'scaleX(0)'},{opacity:0,transform:'scaleX(0)',offset:.46},{opacity:1,transform:'scaleX(1)',offset:.56},{opacity:0,transform:'scaleX(.3)',offset:.74},{opacity:0}], o);
  done.animate([{opacity:0,maxWidth:'0px'},{opacity:0,maxWidth:'0px',offset:.76},{opacity:1,maxWidth:'110px'}], o);
}

export function mountReferenceInteractions(root) {
  root.addEventListener('click', event => {
    const cell = event.target.closest('.rc-matrix-cell');
    if (cell && root.contains(cell)) {
      const col = cell.closest('.rc-matrix-col');
      col.querySelectorAll('.rc-matrix-cell[aria-pressed="true"]').forEach(other => { if (other !== cell) { other.setAttribute('aria-pressed', 'false'); playCheck(other, false); } });
      const on = cell.getAttribute('aria-pressed') !== 'true';
      cell.setAttribute('aria-pressed', String(on)); playCheck(cell, on);
      const grid = cell.closest('.rc-matrix-grid'), out = grid.parentElement.querySelector('.rc-matrix-out');
      const picks = [...grid.querySelectorAll('.rc-matrix-cell[aria-pressed="true"] span:not(.rc-check)')].map(s => s.textContent);
      out.textContent = picks.length === 3 ? `Teste: ${picks.join(' + ')}.` : picks.length ? `Escolhido: ${picks.join(' + ')}.` : 'Escolha um item de cada coluna para montar o teste.';
      return;
    }
    const hook = event.target.closest('.rc-hook');
    if (hook && root.contains(hook)) {
      pressPlay(hook);
      const row = hook.closest('.rc-hooks-row');
      row.querySelectorAll('.rc-hook').forEach(other => { const on = other === hook; if ((other.getAttribute('aria-pressed') === 'true') !== on) { other.setAttribute('aria-pressed', String(on)); playCheck(other, on); } });
      row.parentElement.querySelector('.rc-hooks-out').textContent = `Abertura ${hook.dataset.hook.toUpperCase()} escolhida. No teste real, quem decide é o seu público.`;
      return;
    }
    const cart = event.target.closest('.rc-cart');
    if (cart && root.contains(cart)) {
      const on = cart.getAttribute('aria-pressed') !== 'true';
      cart.setAttribute('aria-pressed', String(on)); runCart(cart, on);
      cart.parentElement.querySelector('.rc-cart-status').textContent = on ? 'Adicionado ao carrinho (demonstração).' : 'Removido do carrinho.';
    }
  });
}
