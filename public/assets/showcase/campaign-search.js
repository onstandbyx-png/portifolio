/* Search, local and conversation formats of "Campanhas e anúncios": LinkedIn,
   Google Pesquisa and Display, SEO, ChatGPT, Maps, WhatsApp (clique para
   conversar e catálogo). campaign-channels.js calls makeSearch with its shared
   helpers and merges what comes back:
   - mocks: { name: () => html } added to the mock table;
   - placements: { 'channel/placement': placement } replacing (or joining) by key;
   - channels: { channel: { benefit, art } } fields merged into the channel;
   - SCREEN: { mockName: { tema, fundo } } app theme behind the status bar;
   - AVISOS: { 'channel/placement': aviso | null } the closing banner (null removes it).
   Every mock here is a .cm-screen.cm-sb with data-mock="<name>"; campaign-search.css
   draws them and nothing else. Brands, dates, orders, people and streets come from
   marcas.js; the third parties invented here (two dental offices, two sites and a
   receptionist) are fictitious too. A step reveals content with data-in="token"
   (shown while the frame state has the token) and data-out="token" (hidden from then on).
   The Google call has no audio file yet: placement.audio carries the segments, so a
   recording dropped into audio.src plays in sync with the transcript beside the phone. */
import { CLIENTES as C, PESSOA, PEDIDOS, OFERTAS, LEGAL, TERCEIROS, dataCurta, dataLonga, diaSemana } from './marcas.js';

const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
const dia = iso => Number(String(iso).slice(8, 10));
const mes = iso => Number(String(iso).slice(5, 7));
const dd = iso => `${String(dia(iso)).padStart(2, '0')}/${String(mes(iso)).padStart(2, '0')}`;
const somaMin = (h, n) => { const [a, b] = h.split(':').map(Number), t = a * 60 + b + n; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
const horaFala = h => { const [hh, mm] = String(h).split(':'); return `${Number(hh)}h${mm && mm !== '00' ? mm : ''}`; };
const PRECO = 'R$ ••••';

/* Glyphs this module needs beyond the shared set: generic strokes on the 24 grid. */
const PATHS = {
  horse: 'M18.5 21.5c.8-3 1.4-6 1-9.3-.3-2.6-1.4-4.7-3-6.2l-1-3.5-1.7 2.6c-2.5.6-4.4 2.1-5.8 4.1L5 12.6c-.7.9-.5 2.2.4 2.8.7.5 1.6.6 2.4.3l3-1.2c.6 1.2.4 2.6-.4 3.9L8.6 21.5M12.4 8.6h.01M6.4 13.6h.01',
  mask: 'M2.5 8.5c3.2-1.6 6.4-1.6 9.5.2 3.1-1.8 6.3-1.8 9.5-.2-.1 4.1-1.6 7.2-4.6 7.6-2 .3-3.6-.9-4.9-2.7-1.3 1.8-2.9 3-4.9 2.7-3-.4-4.5-3.5-4.6-7.6zM6.2 11.4c.9-.6 2-.6 2.9 0M14.9 11.4c.9-.6 2-.6 2.9 0',
  keypad: 'M6 5h.01M12 5h.01M18 5h.01M6 11h.01M12 11h.01M18 11h.01M6 17h.01M12 17h.01M18 17h.01M12 22h.01',
  micoff: 'M12 14.5a2.8 2.8 0 0 0 2.8-2.8V6.3a2.8 2.8 0 0 0-5.6 0v5.4a2.8 2.8 0 0 0 2.8 2.8zM6.3 11.2a5.7 5.7 0 0 0 11.4 0M12 17v3.8M4.5 4.5l15 15',
  turn: 'M7 21v-8.5A3.5 3.5 0 0 1 10.5 9H19M15 5l4 4-4 4',
  nav: 'M12 2.5 20 21l-8-4.6L4 21z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.2 2',
  site: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z',
  ruler: 'M4 15.5 15.5 4 20 8.5 8.5 20zM8 12l1.8 1.8M11 9l1.8 1.8M14 6l1.8 1.8',
  build: 'M4 20.5h16M6 20.5V7l6-3.5 6 3.5v13.5M10 20.5v-4h4v4M9.5 9.5h.01M14.5 9.5h.01M9.5 13h.01M14.5 13h.01',
  checkbox: 'M5 4.5h14a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5z',
};

export function makeSearch(ctx = {}) {
  const { I, pic, marca, esc, scene, logoSvg, LAB, art, safari, browserBar } = ctx;
  const kit = ctx.kit || ctx.SITES?.kit;
  const planta = ctx.planta || (() => '');
  const avatar = ctx.avatar || (nome => `<i class="sb-av" aria-hidden="true">${esc(nome.split(' ').map(p => p[0]).slice(0, 2).join(''))}</i>`);
  if (!I || !pic || !marca || !scene || !kit) return { mocks: {}, placements: {}, channels: {}, SCREEN: {}, AVISOS: {} };
  const L = ctx.L || ((t, ator, evento, detalhe = '', tipo = 'evento') => [ator, evento, detalhe, { t, tipo }]);
  const P = (fase, rotulo, quadros) => ({ fase, rotulo, quadros });
  const passos3 = (a, b, c) => [P('Atenção', a[0], a[1]), P('Retenção', b[0], b[1]), P('Conversão', c[0], c[1])];
  const ic = (name, cls = '') => PATHS[name] ? `<svg class="cm-i cm-i--${name}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>` : I(name, cls);
  const tela = (cls, mock, html) => `<div class="cm-screen cm-sb cm-sb--${cls}" data-mock="${mock}" data-frame="0">${html}</div>`;
  const curta = k => C[k].curta || C[k].marca;
  const { site, body, foot, cta, pk, label, field, tick, ok, back, ticket, trilha, lista, legal } = kit;
  const head = k => `<header class="cm-site-head sb-site-head">${marca(k)}<b>${esc(curta(k))}</b></header>`;
  const onda = (n = 9) => `<span class="sb-onda" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>`;
  const digitando = (de, ate, cls = '') => `<span class="sb-wa-typing${cls ? ' ' + cls : ''}"${de ? ` data-in="${de}"` : ''} data-out="${ate}"><span data-typing><i></i><i></i><i></i></span></span>`;
  /* WhatsApp chat chrome: header of a business account, the wallpaper body, the intro card and the
     notice of a conversation managed through the Cloud API. */
  const waHead = k => `<div class="sb-wa-head">${I('back')}${marca(k)}<span><b>${esc(C[k].marca)}</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>`;
  const waIntro = (k, linhas) => `<div class="sb-wa-card">${marca(k, 'circulo', 'sb-wa-card-mark')}<b>${esc(C[k].marca)}</b><small>Conta comercial · ${esc(C[k].tipo)}</small>${linhas.map(([icon, text]) => `<span>${ic(icon)}${esc(text)}</span>`).join('')}</div>
    <span class="sb-wa-sys">${I('info', 'cm-i--inline')}Esta empresa usa um serviço seguro da Meta para gerenciar esta conversa.</span><span class="sb-wa-day">Hoje</span>`;
  const bolha = (lado, html, hora, at = '', cls = '') => `<div class="sb-wa-${lado}${cls ? ' ' + cls : ''}"${at}>${html}<small>${hora}${lado === 'out' ? ' ' + I('ticks') : ''}</small></div>`;
  const sai = (html, hora, at = '', cls = '') => bolha('out', html, hora, at, cls);
  const entra = (html, hora, at = '', cls = '') => bolha('in', html, hora, at, cls);
  /* Target of the numbered point that stops counting once the frame state has "ate": an empty layer over its
     parent, so a message that scrolls away or a button already answered no longer draws the point. */
  const alvo = (hs, ate = '', at = 'out-left') => `<i class="sb-alvo" data-hs="${hs}"${at ? ` data-hs-at="${at}"` : ''}${ate ? ` data-ate="${ate}"` : ''} aria-hidden="true"></i>`;
  /* Reply buttons fixed under the bubble (at most 3 of 20 characters); "gasto" greys them once answered. */
  const botoes = (lista, { tap = '', escolha = -1, gasto = '', hs = '3' } = {}) => `<span class="sb-wa-btns"${gasto ? ` data-gasto="${gasto}"` : ''}>${hs ? alvo(hs, gasto) : ''}${lista.map((t, i) => `<span${i === escolha && tap ? ` data-tap="${tap}"` : ''}>${esc(t)}</span>`).join('')}</span>`;

  /* ---------- LinkedIn: document ad of the wealth manager, Lead Gen form, the guide unlocked in the feed ---------- */
  const FI = OFERTAS.financas;
  const liFeed = () => {
    const k = 'financas', nome = C[k].marca, guia = FI.guia.titulo, total = 12;
    const caixa = (t, marcado) => `<li${marcado ? ' class="is-on"' : ''}><i>${marcado ? I('check') : ''}</i><span>${esc(t)}</span></li>`;
    const pagina = (n, titulo, itens, nota, cls = '') => `<figure class="sb-li-page${cls}"><small>${n}</small><b>${esc(titulo)}</b><ul>${itens.map(([t, m]) => caixa(t, m)).join('')}</ul><p>${esc(nota)}</p><em>${esc(nome)} · ${n} de ${total}</em></figure>`;
    const pessoa = TERCEIROS.comentaristas[3];
    return tela('li', 'liFeed', scene('feed', 'base', 'claro', `<div class="cm-safe sb-li"><div class="sb-li-top"><i class="sb-li-me">${esc(PESSOA.iniciais)}</i><span class="sb-li-search">${I('search')}Pesquisar</span>${I('comment')}</div>
      <article class="sb-li-post"><div class="sb-li-intro">${alvo('1', '', '')}<header class="sb-li-head">${marca(k, 'quadrado')}<span><b>${esc(nome)}</b><small>Promovido</small></span><span class="sb-li-follow">${I('plus')}Seguir</span></header>
      <p class="sb-li-text">Empresa e família no mesmo patrimônio? Três sinais de que é hora de separar. <span>…mais</span></p></div>
      <div class="sb-li-doc"><div class="sb-li-docbar">${I('doc')}<b>${esc(guia)}</b><span class="sb-li-dl">${I('down')}Baixar</span></div><div class="sb-li-view" data-hs="2"><div class="sb-li-track">
        <figure class="sb-li-page sb-li-page--capa">${pic('reuniao45', { alt: 'Mesa de reunião de madeira vista de cima, capa do guia.', pos: '50% 60%' })}<figcaption><small>${esc(nome)}</small><b>${esc(guia)}</b><span>12 páginas para separar o que é da empresa e o que é da família</span></figcaption></figure>
        ${pagina(2, 'Contas que se misturam', [['Conta PJ pagando despesa da casa', true], ['Pró-labore x distribuição de lucros', false], ['Bens da empresa no CPF do sócio', true]], 'Marque o que já acontece na sua empresa.')}
        ${pagina(3, 'Sucessão sem plano', [['Quem assume se o sócio faltar?', true], ['Acordo de sócios', false], ['Holding: quando faz sentido', false]], 'Duas marcas aqui pedem conversa antes de qualquer assinatura.')}
        <figure class="sb-li-page sb-li-page--gate"><div class="sb-li-blur" aria-hidden="true"><small>4</small><b>Por onde começar</b><p>Junte o contrato social, a lista dos bens e quem depende de cada um. Depois, combine com a família quem decide o quê.</p></div>
          <span class="sb-li-gatebox" data-out="lib"><b>Para continuar lendo, envie suas informações.</b><span class="sb-li-unlock" data-tap="cta" data-hs="3">Desbloquear</span></span></figure>
        ${pagina(5, 'Os 5 primeiros documentos', [['Contrato social e alterações', false], ['Acordo de sócios, se houver', false], ['Matrículas dos imóveis', false], ['Extratos das contas PJ e PF', false], ['Regime de bens do casamento', false]], 'Com eles em mãos, a conversa sobre sucessão leva metade do tempo.', ' sb-li-page--cinco')}
      </div><span class="sb-li-count"><b>${[1, 2, 3, 4, 5].map(n => `<i data-n="${n}">${n}</i>`).join('')}</b> de ${total}</span><span class="sb-li-ok" data-in="lib">${I('unlock')}Liberado</span></div></div>
      <div class="sb-li-actions"><span>${I('thumb')}Gostei</span><span>${I('comment')}Comentar</span><span>${I('repost')}Compartilhar</span><span>${I('send')}Enviar</span></div></article>
      <article class="sb-li-post sb-li-next"><header class="sb-li-head">${avatar(pessoa, 'sb-li-av')}<span><b>${esc(pessoa)} <em>· Seguindo</em></b><small>Contador em São Paulo · 1 d</small></span>${I('dots')}</header><p class="sb-li-text">Três clientes reviram o pró-labore neste mês. O que pesou em cada caso, sem números de ninguém:</p></article></div>
      <nav class="sb-li-tabs" aria-hidden="true">${[['home', 'Início', 1], ['people', 'Minha rede'], ['plus', 'Publicar'], ['bell', 'Notificações'], ['briefcase', 'Vagas']].map(([i, t, on]) => `<span${on ? ' class="is-on"' : ''}>${I(i)}<small>${t}</small></span>`).join('')}</nav>`) +
      scene('form', 'sheet', 'claro', liForm()));
  };
  /* The Lead Gen form opens inside LinkedIn: profile data, one question of the advertiser, the thank-you. */
  const liForm = () => {
    const k = 'financas', nome = C[k].marca, guia = FI.guia.titulo;
    const [primeiro, ...resto] = PESSOA.nome.split(' ');
    const top = `<div class="sb-lf-top">${I('close')}<b>${esc(nome)}</b></div>`;
    const prog = (t, p) => `<div class="sb-lf-prog"><small>${esc(t)}</small><span style="--p:${p}"><i></i></span></div>`;
    return site(k, 'linkedin', [
      `${top}${body(`<span class="sb-lf-brand">${marca(k, 'quadrado')}<span><b>${esc(guia)}</b><small>${esc(nome)} · PDF, 12 páginas</small></span></span>${prog('Informações de contato, 1 de 2', .5)}
        <p class="sb-lf-note" data-hs="3">${I('user', 'cm-i--inline')}Preenchido com as informações do seu perfil.</p>
        ${field('Nome', primeiro)}${field('Sobrenome', resto.join(' '))}${field('E-mail', PESSOA.email)}${field('Cargo', PESSOA.cargo)}${field('Empresa', TERCEIROS.empresaPersona)}`)}${foot(cta('Avançar', 'a', ''))}`,
      `${top}${body(`${prog('Mais uma pergunta, 2 de 2', 1)}<b class="sb-lf-h" data-hs="3">Qual é o seu momento?</b>
        <div class="cm-radios">${pk('Organizar as contas da empresa e da família', { cls: 'cm-radio' })}${pk('Planejar a sucessão', { cls: 'cm-radio', q: 'q1', tap: 'b' })}${pk('Só quero me informar', { cls: 'cm-radio' })}</div>
        <div class="sb-lf-review"><small>Vai para ${esc(nome)}</small><span>${esc(PESSOA.nome)} · ${esc(PESSOA.cargo)}, ${esc(TERCEIROS.empresaPersona)}</span><span>${esc(PESSOA.email)}</span></div>
        <p class="cm-site-tick" data-pick="q2" data-tap="e" data-hs="3"><i>${I('check')}</i>${esc(`Quero receber conteúdos da ${nome}`)}</p><p class="cm-legal">Ao enviar, você aceita que ${esc(nome)} use suas informações conforme a política de privacidade dela. Você pode apagar o envio nas configurações do LinkedIn.</p>`)}${foot(cta('Enviar', 'c', ''))}`,
      `${top}${body(`${ok(`Obrigado, ${PESSOA.primeiro}`, 'O guia completo está liberado no post do feed.')}<div class="sb-lf-file">${I('doc')}<span><b>${esc(guia)}</b><small>PDF, 12 páginas · liberado</small></span>${I('down')}</div>
        ${trilha([['Formulário enviado', 'Agora', true], ['Guia liberado no feed', 'Página 5 em diante'], ['E-mail da gestora', 'O guia também por e-mail, como você marcou']])}${legal(k)}`, 'cm-site-body--end')}${foot(cta('Ver documento', 'd', ''))}`,
    ], '#0a66c2');
  };

  /* ---------- Google Pesquisa: the clinic ad with a call button, the Local Pack, the iOS call ---------- */
  const CL = OFERTAS.clinica, av = CL.avaliacao, alt = CL.alternativa, kc = 'clinica';
  const numero = '(11) 3•••-••00';
  const vizinhos = [['Consultório Dra. Lia Bastos', 'Aberto até 18:30'], ['Consultório Dr. Otávio Lemos', 'Aberto até 20:00']];
  /* The call, turn by turn: who speaks, the line and how long the turn lasts on screen (ms). */
  const recepcao = 'Carla, recepção';
  const LIGACAO = [
    ['c', `${C[kc].marca}, bom dia! Aqui é a Carla.`, 4200],
    ['m', 'Bom dia! Vi vocês no Google e queria marcar uma avaliação.', 5200],
    ['c', 'Claro. É a primeira consulta? Pode me dizer seu nome completo?', 5000],
    ['m', `É a primeira, sim. ${PESSOA.nome}.`, 3800],
    ['c', `A avaliação leva 30 minutos, com a ${CL.responsavel}. Tenho ${diaSemana(av.iso)}, dia ${dia(av.iso)}, às ${horaFala(av.hora)}, ou ${diaSemana(alt.iso)}, às ${horaFala(alt.hora)}.`, 8400],
    ['m', `${cap(diaSemana(av.iso))} às ${horaFala(av.hora)}, por favor.`, 3600],
    ['c', 'Marcado. Mando agora a confirmação no seu WhatsApp, com o endereço.', 5600],
    ['m', 'Pode mandar, vou conferir aqui.', 3800],
  ];
  const TOQUE = 2800;
  const turnos = LIGACAO.reduce((list, [quem, texto, ms]) => {
    const prev = list[list.length - 1], inicio = prev ? prev.inicio + prev.ms : TOQUE;
    list.push({ quem: quem === 'c' ? recepcao : PESSOA.primeiro, lado: quem, texto, ms, inicio, s: Math.round((inicio - TOQUE) / 1000) + 1 });
    return list;
  }, []);
  const tempos = turnos.map((t, i) => `--t${i + 1}:${t.s}`).join(';');
  const tempo = cls => `<i class="sb-tempo${cls ? ' ' + cls : ''}" style="${tempos}" aria-hidden="true"></i>`;
  const gSearch = () => {
    const nome = C[kc].marca;
    const pack = [[nome, 'Aberto até 19:00', true], ...vizinhos];
    return tela('g', 'gSearch', scene('serp', 'base', 'claro', `<div class="cm-safe sb-g"><div class="sb-g-head"><div class="sb-g-box">${logoSvg('google', { altura: 18, classe: 'sb-g-logo' })}<span class="sb-typed"><span>dentista perto de mim</span></span>${I('close')}${I('mic')}${I('lens')}</div>
      <div class="sb-g-tabs"><span>Modo IA</span><b>Todas</b><span>Mapas</span><span>Imagens</span><span>Notícias</span></div></div>
      <ul class="sb-g-suggest" data-out="r" data-hs="1" data-hs-at="tr"><li>${I('search')}dentista perto de mim</li><li>${I('search')}dentista perto de mim aberto agora</li><li>${I('search')}dentista em Pinheiros</li><li>${I('search')}avaliação odontológica primeira consulta</li></ul>
      <div class="sb-g-results" data-in="r"><p class="sb-g-group">Resultados patrocinados</p>
        <div class="sb-g-ad"><div class="sb-g-site">${marca(kc, 'fav')}<span><b>${esc(nome)}</b><small>https://www.${esc(C[kc].dominio)} › avaliacao</small></span>${I('vdots')}</div>
          <b class="sb-g-title" data-hs="2">Avaliação com hora marcada | ${esc(nome)}</b>
          <p>Avaliação de 30 minutos, sem procedimento, com plano de tratamento por escrito. Unidade ${esc(av.unidade)}. ${esc(LEGAL[kc] || '')}</p>
          <span class="sb-g-links"><span>Agendar avaliação</span><span>Clareamento</span><span>Como chegar</span></span>
          <span class="sb-g-call" data-tap="cta">${I('phone')}Ligar</span></div>
        <span class="sb-g-hide">Ocultar resultados patrocinados ${I('up')}</span>
        <section class="sb-g-pack"><p class="sb-g-h">Locais</p><span class="sb-g-map">${pic('mapa', { pos: '40% 46%' })}${[[34, 40], [58, 62], [76, 30]].map(([x, y], i) => `<i style="left:${x}%;top:${y}%">${i + 1}</i>`).join('')}</span>
          <ul>${pack.map(([n, h, sp], i) => `<li${sp ? ' class="is-sp"' : ''}><span>${sp ? '<small class="sb-g-sp">Patrocinado</small>' : ''}<b>${i + 1}. ${esc(n)}</b><small>Dentista · ${esc(av.unidade)}</small><small><em>${esc(h.split(' ')[0])}</em> ${esc(h.split(' ').slice(1).join(' '))}</small></span><span class="sb-g-acts">${I('globe')}${I('route')}</span></li>`).join('')}</ul></section>
        <article class="sb-g-org"><div class="sb-g-site"><i class="sb-g-fav">B</i><span><b>Boca Saudável</b><small>bocasaudavel.exemplo › primeira-consulta</small></span></div><b class="sb-g-otitle">Avaliação odontológica: o que acontece na primeira consulta</b><p>A primeira consulta começa pela conversa e pelo exame clínico. O dentista pede exames só quando precisa e termina com o plano de tratamento.</p></article>
        <article class="sb-g-org"><div class="sb-g-site"><i class="sb-g-fav sb-g-fav--b">G</i><span><b>Guia do Bairro</b><small>guiadobairro.exemplo › pinheiros › saude</small></span></div><b class="sb-g-otitle">Dentistas em Pinheiros: o que perguntar antes de marcar</b><p>Quem é o responsável técnico, se a clínica atende urgência e como fica a remarcação.</p></article></div>
      <div class="sb-ilha" data-in="ilha" aria-hidden="true"><span class="sb-ilha-l">${I('phone')}${tempo('sb-tempo--ilha')}</span>${onda(7)}</div></div>`) +
      scene('call', 'sheet', 'claro', `<div class="sb-ios-sheet"><span class="sb-ios-group"><small>${esc(numero)}</small><span data-tap="go" data-hs="3">${I('phone')}Ligar</span></span><span class="sb-ios-cancel">Cancelar</span></div>`, 'cm-scene--part') +
      scene('ligacao', 'fade', 'escuro', `<div class="sb-call"><div class="sb-call-top">${alvo('3', 'on', '')}<b class="sb-call-name">${esc(nome)}</b><small class="sb-call-sub"><span class="sb-call-ring">chamando…</span><span class="sb-call-on">${tempo()}</span></small><small class="sb-call-num">${esc(numero)}</small></div>
        <div class="sb-call-grid">${[['speaker', 'Alto-falante'], ['video', 'FaceTime'], ['micoff', 'Silenciar'], ['dots', 'Mais'], ['phone', 'Encerrar', 'fim'], ['keypad', 'Teclado']].map(([icon, t, x]) => `<span class="sb-call-btn${x ? ' sb-call-btn--' + x : ''}"><i>${ic(icon)}</i><small>${t}</small></span>`).join('')}</div></div>`));
  };
  const gFala = turnos.map(t => [[t.quem, t.texto]]);

  /* ---------- Google Display: the agency banner inside a travel article, the departure and the pre-booking ---------- */
  const T = OFERTAS.turismo, [s1, s2] = T.saidas, kt = 'turismo';
  const intervalo = s => `${dia(s.ida)} a ${dia(s.volta)} de maio de 2027`;
  const semana = s => `${diaSemana(s.ida).slice(0, 3)} a ${diaSemana(s.volta).slice(0, 3)}`;
  const [cav1, , cav3] = T.cavalhadas;
  const viagem = `${PESSOA.viajantes.adultos} adultos e ${PESSOA.viajantes.criancas.length} crianças (${PESSOA.viajantes.criancas.join(' e ')} anos)`;
  const gDisplay = () => {
    const portal = TERCEIROS.portal, nome = C[kt].marca;
    const saidaStep = `${head(kt)}${body(`<div class="cm-bd-hero">${pic('bandeirolas916', { pos: '50% 38%', alt: 'Bandeirolas coloridas sobre a rua de Pirenópolis à noite.' })}<span>Festa do Divino · maio de 2027</span></div><b class="cm-bd-title">${esc(T.produto)}</b>
        <div class="cm-bd-facts"><span>${I('people')}Até 12 pessoas</span><span>${I('user')}Guia da cidade</span><span>${I('home')}Hotel no centro</span></div>
        ${label('Escolha a saída')}<div class="cm-radios">${pk(intervalo(s1), { cls: 'cm-radio', sub: `${s1.noites} noites, ${semana(s1)} · as três cavalhadas`, q: 'q1', tap: 'a' })}${pk(intervalo(s2), { cls: 'cm-radio', sub: `${s2.noites} noites, ${semana(s2)} · as três cavalhadas` })}</div>
        <p class="cm-site-note">${I('info')}${esc(T.destaque)}. ${esc(T.transporte)}.</p>`)}${foot(cta('Continuar', 'b'))}`;
    const quemStep = `${head(kt)}${body(`${back('Quem vai')}<div class="sb-bd-rows"><span><b>Adultos</b><em>${PESSOA.viajantes.adultos}</em></span><span><b>Crianças</b><small>${esc(PESSOA.viajantes.criancas.join(' e '))} anos</small><em>${PESSOA.viajantes.criancas.length}</em></span></div>
        <p class="cm-site-note">${I('people')}${esc(T.criancas)}.</p>
        ${label('Como prefere seguir?')}<div class="cm-radios">${pk('Pagar o sinal agora (Pix)', { cls: 'cm-radio', sub: 'A vaga fica garantida na hora' })}${pk('Só reservar', { cls: 'cm-radio', sub: 'A consultora confirma e manda o Pix do sinal depois', q: 'q2', tap: 'c' })}</div>
        <p class="cm-site-note">${I('info')}${esc(T.politica)}.</p>
        ${lista('Incluído na saída', [T.transporte, 'Hotel no centro histórico, a pé das festas', 'Guia da cidade nos três dias de cavalhadas'])}`)}${foot(cta('Continuar', 'd'))}`;
    const dadosStep = `${head(kt)}${body(`${back('Seus dados')}<div class="cm-bd-sum"><b>Festa do Divino, ${esc(intervalo(s1))}</b><small>${esc(cap(viagem))} · só reserva, sinal depois</small></div>
        ${field('Nome', PESSOA.nome)}${field('WhatsApp', PESSOA.telefone)}${field('E-mail', PESSOA.email)}
        <p class="cm-site-note">${I('phone')}A consultora ${esc(T.consultora)} responde pelo WhatsApp. ${esc(T.horario)}.</p>
        ${lista('Na pré-reserva', ['Nenhum pagamento agora', 'Roteiro e hotel confirmados pela consultora', 'Sinal por Pix só depois da confirmação'])}`)}${foot(cta('Enviar pré-reserva', 'e'))}`;
    const fimStep = `${head(kt)}${body(`${ok('Pré-reserva recebida', `A consultora ${T.consultora} chama você no WhatsApp ainda hoje.`)}${ticket([['Saída', `${dia(s1.ida)} a ${dia(s1.volta)} mai 2027`, 1], ['Viajantes', cap(viagem), 1], ['Sinal', 'Pix, depois da confirmação', 1]], 'cm-ticket--bd')}
        ${trilha([['Pré-reserva', 'Agora', true], ['Confirmação pelo WhatsApp', 'Com o roteiro e o hotel'], ['Sinal por Pix', 'Depois que você aprovar'], ['Saldo', 'Até 30 dias antes da viagem']])}
        <p class="cm-site-note">${I('people')}${esc(T.criancas)}.</p><p class="cm-site-note">${I('phone')}${esc(T.horario)}. Fora desse horário, a ${esc(T.consultora)} responde no dia seguinte.</p>`, 'cm-site-body--end')}`;
    return tela('gd', 'gDisplay', scene('article', 'base', 'claro', `<div class="cm-safe sb-gd"><div class="sb-gd-host"><b>${esc(portal.nome)}</b><small>Viagem</small></div>
      <small class="sb-gd-kicker">Goiás · Festas populares</small><b class="sb-gd-title">O que ver na Festa do Divino em Pirenópolis</b><small class="sb-gd-by">Redação ${esc(portal.nome)} · 6 min de leitura</small>
      <p>Em Pirenópolis, a Festa do Divino Espírito Santo ocupa a cidade nas semanas que antecedem Pentecostes. Em 2027, o ponto alto cai entre ${dia(cav1)} e ${dia(cav3)} de maio.</p>
      <div class="sb-gd-ad"><span class="sb-gd-flag"><i>i</i>${I('close')}</span><span class="sb-gd-img" data-hs="1" data-hs-at="tl">${pic('pirenopolisRua45', { alt: 'Rua de pedra do centro histórico de Pirenópolis, com casario colonial.', pos: '50% 42%' })}</span>
        <div class="sb-gd-body"><span><b class="sb-gd-h" data-hs="2"><span>Festa do Divino em grupo pequeno</span><span>Saídas de ${dia(s1.ida)} e ${dia(s2.ida)} de maio de 2027</span></b><small>${esc(nome)}</small></span><span class="sb-gd-go" data-tap="cta">${I('chevron')}</span></div></div>
      <b class="sb-gd-inter">Cavalhadas e mascarados</b>
      <p>As cavalhadas encenam, a cavalo, a batalha entre mouros e cristãos, de domingo a terça. Nas ruas de pedra, os mascarados passam com máscaras de boi enfeitadas e fitas coloridas.</p>
      <p>Chegue um dia antes para ver o centro histórico com calma e reserve a hospedagem cedo: a cidade lota.</p></div>${safari(portal.dominio)}`) +
      scene('page', 'push', 'claro', `${site(kt, 'bandeirola', [saidaStep, quemStep, dadosStep, fimStep])}${safari(C[kt].dominio)}`, 'cm-scene--web'));
  };

  /* ---------- SEO: the developer's organic result, People also ask, the floor plans and the PDF by e-mail ---------- */
  const INC = OFERTAS.incorporadora, ki = 'incorporadora';
  const seoOrganic = () => {
    const nome = C[ki].marca, dom = C[ki].dominio;
    const comodos = (list, cls) => `<ul class="sb-seo-rooms ${cls}">${list.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
    const paa = [
      ['As casas na falésia têm planta de 4 quartos?', `Sim. Há plantas de 3 quartos (2 banheiros) e de 4 quartos (3 banheiros e lavabo), todas com a sala e a varanda voltadas para o mar.`],
      ['Dá para visitar o decorado sem hora marcada?', ''],
      ['Quando a obra fica pronta?', ''],
    ];
    return tela('seo', 'seoOrganic', scene('serp', 'base', 'claro', `<div class="cm-safe sb-g"><div class="sb-g-head"><div class="sb-g-box">${logoSvg('google', { altura: 18, classe: 'sb-g-logo' })}<span class="sb-typed is-done"><span>casa na falésia à venda</span></span>${I('close')}${I('mic')}${I('lens')}</div>
      <div class="sb-g-tabs"><span>Modo IA</span><b>Todas</b><span>Imagens</span><span>Mapas</span><span>Notícias</span></div></div>
      <div class="sb-g-results"><article class="sb-g-org sb-seo-res cm-g-result--organic"><div class="sb-g-site">${marca(ki, 'fav')}<span><b>${esc(nome)}</b><small>${esc(dom)} › plantas</small></span>${I('vdots')}</div>
        <div class="sb-seo-main"><b class="sb-g-otitle" data-hs="1">Casas na falésia com a sala voltada para o mar</b>${pic('salaMar11', { cls: 'sb-seo-thumb', pos: '50% 50%' })}</div>
        <p>Plantas de 3 e 4 quartos, varanda de frente para o mar e visita ao decorado com hora marcada. Veja as plantas e receba o PDF.</p>
        <span class="sb-seo-links"><span data-tap="link">Plantas${I('chevron')}</span><span>Localização${I('chevron')}</span><span>Agendar visita${I('chevron')}</span></span></article>
        <section class="sb-seo-paa" data-hs="2"><p class="sb-g-h">Pessoas também perguntam</p>${paa.map(([q, a], i) => `<div class="sb-seo-q${i === 0 ? ' sb-seo-q--1' : ''}"><b>${esc(q)}${I('up', 'cm-i--flip')}</b>${a ? `<div class="sb-seo-a" data-in="paa"><p>${esc(a)}</p><span>${marca(ki, 'fav')}<small>${esc(nome)} · ${esc(dom)} › plantas</small></span></div>` : ''}</div>`).join('')}</section>
        <article class="sb-g-org"><div class="sb-g-site"><i class="sb-g-fav sb-g-fav--c">L</i><span><b>Litoral em Pauta</b><small>litoralempauta.exemplo › imoveis</small></span></div><b class="sb-g-otitle">Casa de frente para o mar: o que olhar antes de comprar</b><p>Orientação do terreno, acesso à praia e o registro de incorporação na matrícula.</p></article></div></div>`) +
      scene('page', 'push', 'claro', `<div class="sb-seo-page">${site(ki, 'falesia', [`${head(ki)}${body(`<span class="sb-seo-hero">${pic('salaMar45', { pos: '50% 34%', alt: 'Sala da casa com janela de vidro e o mar ao fundo.' })}<small>Imagem ilustrativa</small></span>
        <b class="cm-site-h sb-seo-h">Plantas</b>
        <span class="sb-seo-seg" data-hs="2"><span class="sb-seo-seg3">3 quartos</span><span class="sb-seo-seg4" data-tap="q4">4 quartos</span></span>
        <div class="sb-seo-planta">${planta('3', 'sb-seo-svg')}${comodos(INC.plantas.tres, 'sb-seo-r3')}${comodos(INC.plantas.quatro, 'sb-seo-r4')}</div>
        <span class="sb-seo-pdf" data-tap="pdf" data-hs="3">${I('down')}Receber as plantas em PDF</span>
        <ul class="sb-seo-info"><li>${I('location')}<span><b>Localização</b><small>${esc(TERCEIROS.ruas.incorporadora)}</small></span></li><li>${ic('build')}<span><b>Entrega prevista: a definir</b><small>O cronograma sai com o registro da obra</small></span></li><li>${I('calendar')}<span><b>Agendar visita ao decorado</b><small>${esc(INC.horario)}</small></span></li></ul>`)}`])}
        <div class="sb-seo-sheet" data-in="mail"><span class="sb-grabber"></span><b>Receber as plantas</b><p>Mandamos o PDF com as plantas de 3 e 4 quartos e a ficha da casa.</p>${field('Seu e-mail', PESSOA.email)}
          <span class="sb-seo-ck" data-tap="ck" data-hs="3"><i>${I('check')}</i><span>Concordo que a ${esc(curta(ki))} use meu e-mail para mandar as plantas e falar sobre a visita, conforme a política de privacidade.</span></span>
          <span class="sb-seo-send" data-tap="send" data-hs="3">Enviar</span></div>
        <div class="sb-seo-done" data-in="done"><span class="cm-site-ok" data-hs="3">${I('check')}</span><b>Enviamos as plantas para o seu <span class="sb-nowrap">e-mail</span></b><p>${esc(PESSOA.email)}</p>
          <div class="sb-seo-file">${I('doc')}<span><b>Plantas de 3 e 4 quartos</b><small>PDF com as duas plantas e a ficha da casa</small></span></div>
          <div class="sb-seo-next">${I('calendar')}<span><b>Quer ver o decorado?</b><small>${esc(INC.horario)}. O e-mail traz os horários livres.</small></span></div>
          <div class="sb-seo-next">${I('location')}<span><b>Central de vendas</b><small>${esc(TERCEIROS.ruas.incorporadora)}</small></span></div>${LEGAL[ki] ? `<small class="cm-legal">${esc(LEGAL[ki])}</small>` : ''}</div></div>${safari(dom)}`, 'cm-scene--web'));
  };

  /* ---------- ChatGPT: the answer, the sponsored card after the divider, the trip builder and WhatsApp ---------- */
  const pedidoGpt = `4 noites, saindo de São Paulo, eu, meu marido e nossos filhos de ${PESSOA.viajantes.criancas.join(' e ')} anos. Queremos ver as cavalhadas.`;
  const msgWa = `Olá! Montei este roteiro: ${s1.noites} noites em Pirenópolis, de ${dia(s1.ida)} a ${dia(s1.volta)} de maio, com mascarados e cavalhadas. Somos ${viagem}.`;
  const gptAnswer = () => {
    const nome = C[kt].marca;
    const fontes = `<span class="sb-gpt-src"><i></i><i></i><i></i>Fontes</span>`;
    const acoes = (extra = '') => `<div class="sb-gpt-actions">${I('copy')}${I('thumb')}${I('thumb', 'cm-i--flip')}${I('share')}${I('regen')}${extra}</div>`;
    const tile = (icon, text, opts = {}) => pk(text, { cls: 'cm-bd-tile', ...opts }).replace('<span>', `${ic(icon)}<span>`);
    const roteiro = [
      `${head(kt)}${body(`<div class="sb-bd-q"><small>Monte seu roteiro, 1 de 2</small><span style="--p:.5"><i></i></span></div><b class="cm-bd-title">Quantas noites?</b>
        <div class="cm-bd-big">${pk(`${s1.noites} noites`, { sub: `${dia(s1.ida)} a ${dia(s1.volta)} de maio`, q: 'q1', tap: 'a', cls: 'cm-bd-card' })}${pk(`${s2.noites} noites`, { sub: `${dia(s2.ida)} a ${dia(s2.volta)} de maio`, cls: 'cm-bd-card' })}</div>
        ${field('Saindo de', 'São Paulo')}${label('Quem vai')}<span class="cm-pks">${pk('Casal')}${pk('Família', { q: 'q2', tap: 'b' })}${pk('Amigos')}</span>
        <p class="cm-site-note sb-show-q2">${I('people')}${esc(cap(viagem))}. ${esc(T.criancas)}.</p>
        ${lista('As duas saídas incluem', [T.transporte, 'Hotel no centro histórico', 'Guia da cidade nas cavalhadas'])}`)}${foot(cta('Continuar', 'c'))}`,
      `${head(kt)}${body(`<div class="sb-bd-q"><small>Monte seu roteiro, 2 de 2</small><span style="--p:1"><i></i></span></div><b class="cm-bd-title">O que você quer ver?</b>
        <div class="cm-bd-tiles">${tile('mask', 'Mascarados')}${tile('horse', 'Cavalhadas', { q: 'q3', tap: 'd' })}${tile('people', 'Procissão')}${tile('fork', 'Comida típica')}</div>
        <p class="cm-site-note">${I('info')}${esc(T.destaque)}.</p>
        <div class="sb-bd-why">${pic('estandarte11', { pos: '50% 50%', alt: 'Estandarte vermelho do Divino Espírito Santo, com a pomba bordada.' })}<span><b>Festa do Divino</b><small>Cavalhadas, mascarados, procissão e a comida da festa, nos dias que você escolher.</small></span></div>`)}${foot(cta('Gerar roteiro', 'e'))}`,
      `${head(kt)}${body(`<div class="cm-bd-hero cm-bd-hero--sm">${pic('matrizNoite45', { pos: '50% 86%', alt: 'Igreja matriz de Pirenópolis iluminada à noite.' })}<span>Roteiro sugerido</span></div><b class="cm-bd-title">${s1.noites} noites em ${esc(T.cidade)}</b>
        <ol class="cm-bd-days"><li><b>${esc(cap(dataCurta(s1.ida).split(',')[0]))} ${dia(s1.ida)}</b><span>Voo até Brasília e traslado</span></li><li><b>${esc(cap(dataCurta(s2.ida).split(',')[0]))} ${dia(s2.ida)}</b><span>Centro histórico e mascarados</span></li><li><b>${dia(cav1)} a ${dia(cav3)}</b><span>As três cavalhadas e a volta na terça</span></li></ol>
        <div class="cm-bd-hotel">${I('home')}<span><b>Hotel no centro histórico</b><small>A pé das festas · ${esc(cap(viagem))}</small></span></div>
        <p class="cm-site-note">${I('info')}${esc(T.politica)}. A consultora ${esc(T.consultora)} confirma vagas e valores pelo WhatsApp.</p>`)}${foot(`<span class="cm-site-cta cm-site-cta--wa" data-tap="f" data-hs="3">${I('comment')}Falar com um consultor</span>`)}`,
    ];
    return tela('gpt', 'gptAnswer', scene('chat', 'base', 'claro', `<div class="sb-gpt-top"><span class="sb-glass">${I('menu')}</span><b>ChatGPT</b><span class="sb-glass sb-glass--pill">${I('edit')}${I('dots')}</span></div>
      <div class="sb-gpt-flow"><p class="sb-gpt-user" data-hs="1" data-hs-at="tl">Quero ver uma festa tradicional no interior em maio. Por onde começo?</p>
        <span class="sb-gpt-think" data-out="s1"><i></i>Procurando festas tradicionais de maio</span>
        <div class="sb-gpt-answer" data-in="s1"><p data-stream>Em maio, as Festas do Divino Espírito Santo tomam várias cidades do interior. Para indicar a que mais combina com você, me diga:</p><ul data-stream><li>quantos <b>dias</b> você tem;</li><li>de qual <b>cidade</b> sai;</li><li><b>quem vai</b> com você;</li><li>se prefere <b>procissão, música ou cavalhadas</b>.</li></ul></div>
        <span data-in="s1">${acoes()}</span>
        <p class="sb-gpt-user" data-in="s3">${esc(pedidoGpt)}</p>
        <span class="sb-gpt-think" data-in="s3" data-out="s4"><i></i>Comparando festas com cavalhadas em maio de 2027</span>
        <div class="sb-gpt-answer" data-in="s4"><p data-stream>Para ver cavalhadas, eu iria para <b>${esc(T.cidade)}</b>. Na Festa do Divino, os mascarados tomam as ruas e as cavalhadas vão de domingo a terça: em 2027, de ${dia(cav1)} a ${dia(cav3)} de maio.</p>
          <ul data-stream><li><b>${esc(cap(diaSemana(s1.ida)))}, ${dia(s1.ida)}:</b> voo até Brasília e 2 horas de carro;</li><li><b>${esc(cap(diaSemana(s2.ida)))}, ${dia(s2.ida)}:</b> centro histórico e mascarados;</li><li><b>${dia(cav1)} a ${dia(cav3)}:</b> as três cavalhadas e a volta.</li></ul>
          <p data-stream>Com a criança de 2 anos: a partir dessa idade ela viaja em assento próprio, com tarifa de criança.</p></div>
        <span data-in="s4">${acoes(fontes)}</span>
        <hr class="sb-gpt-s2"><div class="sb-gpt-ad sb-gpt-s2" data-tap="cta" data-hs="2" data-hs-at="tl">${pic('pirenopolisRua45', { cls: 'sb-gpt-ad-img', pos: '50% 35%', alt: 'Rua de pedra de Pirenópolis com casario colonial.' })}<span class="sb-gpt-ad-body"><span class="sb-gpt-ad-top">${marca(kt, 'fav')}<span>${esc(nome)}</span><small class="sb-gpt-chip">Patrocinado</small>${I('dots')}</span><b>Festa do Divino em grupo pequeno</b><small>Saídas de ${dia(s1.ida)} e ${dia(s2.ida)} de maio de 2027, com guia da cidade e hotel no centro histórico.</small></span></div></div>
      <div class="sb-gpt-input">${I('plus')}<span class="sb-gpt-ph" data-out="ty">Pergunte qualquer coisa</span><span class="sb-gpt-typed" data-in="ty" data-out="s3"><span data-stream>${esc(pedidoGpt)}</span></span>${I('mic')}<i class="sb-gpt-wave" data-out="ty">${I('wave')}</i><i class="sb-gpt-send" data-in="ty" data-out="s3" data-tap="gsend">${I('up')}</i></div>`) +
      scene('page', 'sheet', 'claro', `${browserBar(nome, C[kt].dominio, 'share')}${site(kt, 'bandeirola', roteiro)}`) +
      scene('wa', 'switch', 'claro', `<span class="sb-crumb">${I('back')}ChatGPT</span>${waHead(kt)}
        <div class="sb-wa-body">${waIntro(kt, [['location', TERCEIROS.ruas.turismo], ['clock', T.horario]])}
          ${sai(`<span class="sb-wa-link">${pic('estandarte11', { pos: '50% 50%' })}<span><b>Roteiro: Festa do Divino, ${s1.noites} noites</b><small>${esc(C[kt].dominio)}</small></span></span>${esc(msgWa)}`, '10:11', ' data-in="m1"').replace('<div class="sb-wa-out" data-in="m1">', `<div class="sb-wa-out" data-in="m1">${alvo('3', 'm2')}`)}
          ${digitando('m1', 'm2')}
          ${entra(`Oi, ${esc(PESSOA.primeiro)}! Aqui é a ${esc(T.consultora)}, da ${esc(curta(kt))}. Recebi seu roteiro. Para ${dia(s1.ida)} a ${dia(s1.volta)} de maio ainda tem vaga no hotel do centro, e a criança de 2 anos entra com tarifa de criança. Posso montar a pré-reserva? O sinal é por Pix, só depois que você aprovar.`, '10:12', ' data-in="m2" data-hs="3" data-hs-at="out-left"')}</div>
        <div class="sb-wa-compose"><span class="sb-wa-preview" data-out="m1">${pic('estandarte11', { pos: '50% 50%' })}<span><b>Roteiro: Festa do Divino, ${s1.noites} noites</b><small>${esc(C[kt].dominio)}</small></span></span>
          <span class="sb-wa-row">${I('plus')}<span class="sb-wa-field" data-out="m1">${esc(msgWa)}</span><span class="sb-wa-field sb-wa-field--empty" data-in="m1"></span><span class="sb-wa-send" data-out="m1" data-tap="send" data-hs="3">${I('send')}</span><span class="sb-wa-idle" data-in="m1">${I('camera')}${I('mic')}</span></span></div>`));
  };

  /* ---------- Google Maps: square promoted pin, the place sheet, the route drawn and the navigation ---------- */
  const R = OFERTAS.restaurante, kr = 'restaurante';
  const ROTA = 'M108,544 L108,464 L180,464 L180,304 L252,304 L252,224';
  /* Street of mapa-cidade.svg that the route takes after the first turn (its own label on the drawing). */
  const MAPA = { avenida: 'Av. Central' };
  const saidaRota = '11:16', chegada = somaMin(saidaRota, 14);
  const mapsLocal = () => {
    const nome = C[kr].marca;
    const area = (inner, cls = '') => `<div class="sb-map${cls}">${pic('mapa', { cls: 'sb-map-bg' })}<div class="sb-map-area">${inner}</div></div>`;
    const gotas = [[86, 150], [300, 420], [60, 290], [214, 520], [316, 176]].map(([x, y]) => `<span class="sb-drop" style="left:${x / 3.6}%;top:${y / 6.4}%">${I('fork')}</span>`).join('');
    const promo = `<span class="sb-promo" style="left:${252 / 3.6}%;top:${224 / 6.4}%" data-hs="1" data-hs-at="out-left">${marca(kr, 'quadrado', 'sb-promo-sq')}<span class="sb-promo-text"><b>${esc(nome)}</b><small>Patrocinado</small></span></span>`;
    const eu = `<span class="sb-me" style="left:${108 / 3.6}%;top:${544 / 6.4}%"></span>`;
    return tela('maps', 'mapsLocal', scene('map', 'base', 'claro', `${area(`${gotas}${promo}${eu}`)}
      <div class="sb-maps-search" data-hs="1">${I('back')}<span class="sb-typed"><span>almoço perto de mim</span></span>${I('close')}</div>
      <div class="sb-maps-chips" aria-hidden="true"><span class="is-on">${I('fork')}Restaurantes</span><span>Aberto agora</span><span>Almoço</span><span>Até 5 km</span></div>
      <div class="sb-place" data-out="typing"><span class="sb-grabber"></span>
        <div class="sb-place-peek"><span><small class="sb-sp">Patrocinado</small><b>${esc(nome)}</b><small>Restaurante · 4,2 km</small><small><em>${esc(R.abreHoje)}</em></small></span>${pic('fachada43', { alt: 'Fachada de madeira do restaurante, com flores e mesas na calçada.', pos: '50% 40%' })}</div>
        <div class="sb-place-full"><span class="sb-place-top"><small class="sb-sp">Patrocinado ${I('vdots')}</small><span><i>${I('share')}</i><i>${I('close')}</i></span></span><b class="sb-place-name">${esc(nome)}</b><small>Restaurante · cozinha brasileira · 4,2 km</small><small><em>${esc(R.abreHoje)}</em> · almoço até 15h30</small>
          <span class="sb-place-ad" data-hs="2"><b>Feijoada no tacho aos sábados</b><small>Almoço de terça a domingo, a partir das 11h30. Reserve a mesa pelo site ou chegue sem reserva.</small><small>${esc(C[kr].dominio)}</small></span>
          <span class="sb-place-chips"><span class="is-primary" data-tap="cta" data-hs="3">${I('route')}Rotas</span><span>${I('phone')}Ligar</span><span>${ic('site')}Site</span><span>${I('bookmark')}Salvar</span><span>${I('share')}Compartilhar</span></span>
          <span class="sb-place-photos">${pic('fachada43', { pos: '50% 40%' })}${pic('panela11')}${pic('prato11')}</span>
          <span class="sb-place-row">${I('location')}${esc(TERCEIROS.ruas[kr])}</span></div></div>`) +
      scene('route', 'fade', 'claro', `${area(`<svg class="sb-route" viewBox="0 0 360 640" preserveAspectRatio="none" aria-hidden="true"><path d="${ROTA}" class="sb-route-casing"/><path d="${ROTA}" class="sb-route-line" pathLength="1"/></svg><span class="sb-route-name" style="left:${150 / 3.6}%;top:${461 / 6.4}%">${esc(TERCEIROS.ruas.rota[0])}</span><span class="sb-promo sb-promo--fim" style="left:${252 / 3.6}%;top:${224 / 6.4}%">${marca(kr, 'quadrado', 'sb-promo-sq')}</span>${eu}<span class="sb-chev" style="left:${108 / 3.6}%;top:${544 / 6.4}%">${ic('nav')}</span>`, ' sb-map--rota')}
      <div class="sb-route-top"><span class="sb-route-ends"><span><i class="sb-route-a"></i>Seu local</span><span>${I('location')}${esc(nome)}</span></span><span class="sb-route-modes"><b>${I('car')}14 min</b><span>${I('bus')}38 min</span><span>${I('walk')}52 min</span></span></div>
      <div class="cm-route-sheet sb-route-sheet"><span class="sb-grabber"></span><b class="sb-route-h" data-hs="3"><em>14 min</em> (4,2 km)</b><small>Rota mais rápida · trânsito normal para o horário</small><small>Chegada às ${chegada} · ${esc(R.abreHoje)}</small><span class="sb-route-go" data-tap="go">${ic('nav')}Iniciar</span></div>
      <div class="sb-nav" data-in="done"><div class="sb-nav-card">${ic('turn')}<span><b>200 m</b><small>Vire à direita na ${esc(TERCEIROS.ruas.rota[0])}</small></span></div><span class="sb-nav-then">Depois ${ic('turn', 'sb-i-left')} ${esc(MAPA.avenida)}</span>
        <div class="sb-nav-bar" data-hs="3"><span><b>14 min</b><small>4,2 km · chegada ${chegada}</small></span><span class="sb-nav-exit">Sair</span></div></div>`));
  };

  /* ---------- WhatsApp click-to-chat: the clinic ad on Instagram, the pre-filled message, list and reply buttons ---------- */
  const h1 = `${cap(diaSemana(av.iso).slice(0, 3))} ${dd(av.iso)}, ${horaFala(av.hora)}`;
  const h2 = `${cap(diaSemana(alt.iso).slice(0, 3))} ${dd(alt.iso)}, ${horaFala(alt.hora)}`;
  const waAd = () => {
    const nome = C[kc].marca;
    const opcoes = [['Avaliação odontológica', 'Primeira consulta, 30 minutos', 'opt'], ['Limpeza e prevenção', '45 minutos'], ['Dor ou urgência', 'Encaixe no mesmo dia, conforme a agenda'], ['Falar com a recepção', CL.horario]];
    const quote = `<span class="sb-wa-quote">${pic('recepcao45')}<span><b>${esc(nome)}</b><small>Avaliação com hora marcada</small></span></span>`;
    return tela('wa', 'waAd', scene('ad', 'base', 'escuro', LAB.feedAd({ key: kc, captionOpen: true,
      media: `<div class="sb-wa-art">${pic('recepcao45', { alt: 'Recepção da clínica com parede terracota, sofá e plantas.' })}<b data-hs="1">Avaliação com hora marcada</b>${marca(kc, 'circulo', 'sb-wa-art-mark')}</div>`,
      cta: { text: 'Enviar mensagem pelo WhatsApp', hs: '2 3', lead: `${logoSvg('whatsapp', { altura: 16, classe: 'cm-wa-glyph' })}${logoSvg('whatsapp', { altura: 16, mono: 'branco', classe: 'cm-wa-glyph cm-wa-glyph--lit' })}` },
      caption: { html: `Avaliação com hora marcada. <span class="cm-more">mais</span><span class="cm-rest">Conte o que você sente e escolha o horário pela conversa, com a ${esc(CL.responsavel)}.</span>` } })) +
      scene('chat', 'switch', 'claro', `<span class="sb-crumb">${I('back')}Instagram</span>${waHead(kc)}
        <div class="sb-wa-body">${waIntro(kc, [['location', TERCEIROS.ruas.clinica], ['clock', CL.horario]])}
          ${sai(`${alvo('3', 'm2')}${quote}Olá! Quero agendar uma avaliação.`, '10:10', ' data-in="m1"')}
          ${digitando('m1', 'm2')}
          ${entra(`Oi, ${esc(PESSOA.primeiro)}! Sou a assistente virtual da ${esc(nome)}. Marco sua avaliação por aqui ou passo para a recepção, se preferir. O que você procura?<span class="sb-wa-listbtn" data-tap="list">${alvo('3', 'm3', '')}${I('menu')}Ver opções</span>`, '10:10', ' data-in="m2"')}
          ${sai('Avaliação odontológica', '10:10', ' data-in="m3"')}
          ${digitando('m3', 'm4', 'sb-wa-typing--late')}
          ${entra(`A avaliação leva 30 minutos, com a ${esc(CL.responsavel)}, na unidade ${esc(av.unidade)}. Escolha um horário:${botoes([h1, h2, 'Outro dia'], { tap: 'hor', escolha: 0, gasto: 'm5' })}`, '10:10', ' data-in="m3"', 'sb-wa-late')}
          ${sai(esc(h1), '10:11', ' data-in="m5"')}
          ${digitando('m5', 'm6')}
          ${entra(`<b class="sb-wa-ok">${I('check', 'cm-i--inline')}Avaliação marcada</b><span>${esc(cap(dataLonga(av.iso)))}, às ${esc(horaFala(av.hora))}</span><span>Avaliação odontológica, 30 minutos, com a ${esc(CL.responsavel)}</span><span>Para remarcar, é só responder aqui.</span>`, '10:11', ' data-in="m6" data-hs="3" data-hs-at="out-left"')}
          ${entra(`<span class="sb-wa-map">${pic('mapa', { pos: '62% 36%' })}<i>${I('location')}</i></span><b>${esc(nome)}</b><span>${esc(TERCEIROS.ruas.clinica)}</span>`, '10:11', ' data-in="m6"', 'sb-wa-loc')}</div>
        <div class="sb-wa-sheet" data-in="ls"><span class="sb-grabber"></span><p class="sb-wa-sheet-top">${I('close')}<b>Ver opções</b><i></i></p><small>Atendimentos</small>
          ${opcoes.map(([t, d, tap]) => `<span class="sb-wa-opt${tap ? ' sb-wa-opt--pick' : ''}"${tap ? ` data-tap="${tap}" data-hs="3"` : ''}><span><b>${esc(t)}</b><small>${esc(d)}</small></span><i></i></span>`).join('')}
          <span class="sb-wa-sheet-send" data-tap="lsend" data-hs="3">Enviar</span></div>
        <div class="sb-wa-compose"><span class="sb-wa-preview" data-out="m1">${pic('recepcao45')}<span><b>${esc(nome)}</b><small>Avaliação com hora marcada</small></span></span><span class="sb-wa-row">${I('plus')}<span class="sb-wa-field" data-out="m1">Olá! Quero agendar uma avaliação.</span><span class="sb-wa-field sb-wa-field--empty" data-in="m1"></span><span class="sb-wa-send" data-out="m1" data-tap="send" data-hs="3">${I('send')}</span><span class="sb-wa-idle" data-in="m1">${I('camera')}${I('mic')}</span></span></div>`));
  };

  /* ---------- WhatsApp catalog: profile, collections, item, cart, the order and the automatic service ---------- */
  const enc = R.encomenda, pedido = PEDIDOS['whatsapp/catalogo'];
  const waCatalog = () => {
    const nome = C[kr].marca;
    const sab = `${cap(diaSemana(enc.iso))}, ${dd(enc.iso)}`;
    const item = (img, n, d, tap = '') => `<li${tap ? ` data-tap="${tap}"` : ''}>${pic(img)}<span><b>${esc(n)}</b><small>${esc(d)}</small><em>${PRECO}</em></span></li>`;
    return tela('wacat', 'waCatalog', scene('profile', 'base', 'claro', `<div class="cm-safe sb-wc-profile"><div class="sb-wa-bar">${I('back')}<span></span>${I('dots')}</div><div class="sb-wc-id">${marca(kr, 'circulo', 'sb-wc-av')}<b>${esc(nome)}</b><small>Conta comercial</small><span class="sb-wc-tools"><span>${I('phone')}Áudio</span><span>${I('video')}Vídeo</span><span>${I('search')}Pesquisar</span></span></div>
      <p class="sb-wc-desc">Cozinha brasileira de tacho. Feijoada ${esc(R.feijoada)}, encomendas até sexta às 18h.</p>
      <ul class="sb-wc-info"><li>${I('location')}<span>${esc(TERCEIROS.ruas[kr])}</span></li><li>${ic('clock')}<span>${esc(R.horario)}</span></li><li>${ic('site')}<span>${esc(C[kr].dominio)}</span></li></ul>
      <div class="sb-wc-shelf" data-hs="1"><p><b>Catálogo</b><span data-tap="more">Ver tudo ${I('chevron')}</span></p><span class="sb-wc-thumbs">${[['panela11', 'Feijoada para 4'], ['escondidinho11', 'Escondidinho'], ['pudim11', 'Pudim de leite']].map(([img, n]) => `<span>${pic(img)}<b>${esc(n)}</b><small>${PRECO}</small></span>`).join('')}</span></div></div>`) +
      scene('catalog', 'push', 'claro', `<div class="cm-safe sb-wc"><div class="sb-wa-bar">${I('back')}<span><b>Catálogo</b><small>${esc(nome)}</small></span>${I('share')}</div>
        <div class="sb-wc-coll"><p><b>Encomendas de sábado</b><small>Retirada no balcão ou entrega</small></p><ul data-hs="2">${item('panela11', enc.item, 'Carnes separadas, arroz, couve, farofa e laranja.', 'item')}${item('escondidinho11', 'Escondidinho de carne-seca', 'Gratinado na panelinha, serve 2.')}${item('prato11', 'Feijoada individual', 'Prato montado, com os acompanhamentos.')}</ul>
        <p><b>Doces</b><small>Inteiros, feitos na casa</small></p><ul>${item('pudim11', 'Pudim de leite', 'Serve 6.')}</ul></div></div>`) +
      scene('item', 'push', 'claro', `<div class="cm-safe sb-wc"><div class="sb-wa-bar">${I('back')}<span></span>${I('share')}</div><span class="sb-wc-photo">${pic('panela11', { alt: 'Feijoada completa com arroz, couve e farofa.' })}</span><div class="sb-wc-item"><b>${esc(enc.item)}</b><em>${PRECO}</em><p>Carnes separadas, arroz, couve, farofa e laranja. Serve 4. Encomenda até sexta às 18h, para o almoço de sábado.</p><span class="sb-wc-qty"><i>−</i><b>1</b><i>+</i></span><span class="sb-wc-btn" data-tap="add" data-hs="3">Adicionar ao carrinho</span><span class="sb-wc-msg">${I('comment', 'cm-i--inline')}Conversar com a empresa</span></div>
        <span class="sb-wc-cartbar" data-in="ct" data-tap="cart" data-hs="3">${I('cart')}<b>Ver carrinho</b><small>1 item</small></span></div>`) +
      scene('cart', 'sheet', 'claro', `<div class="sb-wc-cart"><span class="sb-grabber"></span><p class="sb-wa-sheet-top">${I('close')}<b>Carrinho</b><i></i></p><div class="sb-wc-line">${pic('panela11')}<span><b>${esc(enc.item)}</b><small>${esc(nome)}</small><em>${PRECO}</em></span><span class="sb-wc-qty sb-wc-qty--sm"><i>−</i><b>1</b><i>+</i></span></div>
        <span class="sb-wc-note">${I('edit', 'cm-i--inline')}Observação: para ${esc(diaSemana(enc.iso))}, ${dd(enc.iso)}</span><p class="sb-wc-sub"><span>Subtotal estimado</span><b>${PRECO}</b></p><small class="sb-wc-fine">O total e a forma de pagamento são combinados na conversa com a empresa.</small><span class="sb-wc-btn" data-tap="order" data-hs="3">Fazer pedido</span></div>`, 'cm-scene--part') +
      scene('chat', 'push', 'claro', `${waHead(kr)}<div class="sb-wa-body sb-wa-body--cat"><span class="sb-wa-day">Hoje</span>
          ${sai(`<span class="sb-wa-orderthumb">${pic('panela11')}<span><b>${I('cart', 'cm-i--inline')}1 item</b><small>Subtotal estimado ${PRECO}</small></span></span><span class="sb-wa-orderlink">Ver itens enviados</span>`, '10:10')}
          ${digitando('', 'k1')}
          ${entra(`Oi, ${esc(PESSOA.primeiro)}! Sou a assistente virtual da ${esc(nome)}. Recebi seu pedido para ${esc(diaSemana(enc.iso))}. Como prefere receber?${botoes(['Retirar no balcão', 'Entrega'], { tap: 'r1', escolha: 0, gasto: 'k2' })}`, '10:10', ' data-in="k1"')}
          ${sai('Retirar no balcão', '10:10', ' data-in="k2"')}
          ${entra(`Para que horário de ${esc(diaSemana(enc.iso))}?${botoes(['11h30', horaFala(enc.hora), '13h'], { tap: 'r2', escolha: 1, gasto: 'k3' })}`, '10:10', ' data-in="k2"', 'sb-wa-late')}
          ${sai(esc(horaFala(enc.hora)), '10:11', ' data-in="k3"')}
          ${entra(`<b>Resumo do pedido ${esc(pedido)}</b><span>${esc(enc.item)}</span><span>Retirada no balcão: ${esc(sab)}, às ${esc(horaFala(enc.hora))}</span><span>Pagamento: ${esc(enc.pagamento)}</span><span>Subtotal estimado: ${PRECO}</span><span class="sb-wa-order-btn" data-tap="ok" data-gasto="k4">Confirmar pedido</span>${alvo('3', 'k4')}`, '10:11', ' data-in="k3"', 'sb-wa-order sb-wa-late')}
          ${sai('Confirmar pedido', '10:11', ' data-in="k4"')}
          ${entra(`<b class="sb-wa-ok">${I('check', 'cm-i--inline')}Pedido ${esc(pedido)} confirmado</b><span>${esc(sab)}, às ${esc(horaFala(enc.hora))}, no balcão.</span><span>Pagamento: ${esc(enc.pagamento)}.</span><span>Avisamos aqui quando estiver pronto.</span><span class="sb-wa-status">${I('check', 'cm-i--inline')}Recebido</span>`, '10:11', ' data-in="k4" data-hs="3" data-hs-at="out-left"', 'sb-wa-late')}</div>
        <div class="sb-wa-compose"><span class="sb-wa-row">${I('plus')}<span class="sb-wa-field sb-wa-field--empty"></span>${I('camera')}${I('mic')}</span></div>`));
  };

  /* ---------- Storyboards ---------- */
  const t = s => `10:${s}`;
  const placements = {
    'linkedin/feed': { id: 'feed', label: 'Documento', curto: 'Documento', mock: 'liFeed', cliente: 'financas', selo: 'Promovido', frase: 'Uma gestora entrega o guia em troca do contato, sem sair do LinkedIn.',
      objetivo: 'Leads de sócios com o guia liberado no feed',
      base: 'LinkedIn Ads: anúncio de documento e formulário de geração de leads (até 3 perguntas personalizadas, campos preenchidos pelo perfil).',
      passos: passos3(['A dor do sócio na primeira frase', [0]], ['Páginas 2 e 3 com a lista de verificação', [1, 2, 3]], ['Formulário do perfil e guia liberado', [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]]),
      quadros: [
        { ms: 1800, cena: 'feed', hora: '08:37', desc: `Post promovido da ${C.financas.marca}: empresa e família no mesmo patrimônio? O guia começa na capa.` },
        { ms: 2200, cena: 'feed', estado: 'p2', desc: 'Página 2: conta PJ pagando despesa da casa, pró-labore e bens da empresa no CPF do sócio.' },
        { ms: 2200, cena: 'feed', estado: 'p3', desc: 'Página 3: quem assume se o sócio faltar, acordo de sócios e quando a holding faz sentido.' },
        { ms: 1800, cena: 'feed', estado: 'p4', desc: 'A página 4 vem desfocada: para continuar lendo, envie suas informações.' },
        { ms: 900, cena: 'feed', estado: 'p4', toque: 'cta', desc: 'Toque em Desbloquear.' },
        { ms: 2000, cena: 'form', desc: 'O formulário do LinkedIn sobe com nome, e-mail, cargo e empresa já preenchidos pelo perfil.' },
        { ms: 800, cena: 'form', toque: 'a', desc: 'Toque em Avançar.' },
        { ms: 1800, cena: 'form', estado: 'w2', desc: 'Uma pergunta da gestora: qual é o seu momento? E o resumo do que vai ser enviado.' },
        { ms: 900, cena: 'form', estado: 'w2 q1', toque: 'b', desc: 'Toque em Planejar a sucessão.' },
        { ms: 900, cena: 'form', estado: 'w2 q1 q2', toque: 'e', desc: `Toque em Quero receber conteúdos da ${C.financas.marca}: sem essa marca, a gestora não manda e-mail.` },
        { ms: 800, cena: 'form', estado: 'w2 q1 q2', toque: 'c', desc: 'Toque em Enviar.' },
        { ms: 2000, cena: 'form', estado: 'w3', hora: '08:39', desc: `Obrigado, ${PESSOA.primeiro}: o guia completo está liberado no post do feed e também vai por e-mail.`,
          log: [L('08:39:52', 'LinkedIn', 'Lead Gen Form enviado', 'nome, e-mail, cargo, empresa, a resposta e o aceite de e-mails', 'conversao'), L('08:39:53', 'CRM', 'Lead criado', 'origem: anúncio de documento no LinkedIn', 'dado'), L('08:39:55', 'LinkedIn CAPI', 'lead', 'o CRM devolve o lead à campanha', 'sinal')] },
        { ms: 800, cena: 'form', estado: 'w3', toque: 'd', desc: 'Toque em Ver documento.' },
        { ms: 2600, cena: 'feed', estado: 'p5 lib done', desc: 'A folha fecha e o guia aparece liberado no feed: página 5 de 12, com o botão Baixar.' },
      ] },
    'google/search': { id: 'search', label: 'Pesquisa', curto: 'Pesquisa', mock: 'gSearch', cliente: kc, selo: 'Resultado patrocinado', frase: 'Uma clínica responde à busca com uma ligação que já marca a avaliação.',
      objetivo: 'Ligações que viram avaliação marcada',
      base: 'Google Ads: recurso de ligação no anúncio de pesquisa, número de encaminhamento e conversão de chamada por duração mínima.',
      audio: { src: '', segmentos: turnos.map(x => ({ quem: x.quem, texto: x.texto, startMs: x.inicio, endMs: x.inicio + x.ms })), duracaoS: Math.round((TOQUE + turnos.reduce((a, x) => a + x.ms, 0)) / 1000) },
      passos: passos3(['A busca já diz a intenção', [0]], ['Anúncio que responde, ao lado do mapa', [1]], ['Ligar, marcar e receber a confirmação', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]]),
      quadros: [
        { ms: 1600, cena: 'serp', estado: 'typing', desc: 'Busca no Google: dentista perto de mim.' },
        { ms: 2400, cena: 'serp', estado: 'r', desc: `Resultado patrocinado da ${C[kc].marca} com o botão Ligar e, abaixo, os locais no mapa.` },
        { ms: 900, cena: 'serp', estado: 'r', toque: 'cta', desc: 'Toque em Ligar.', log: [L('10:09:24', 'Google Ads', 'Clique em Ligar', 'o número de encaminhamento do Google registra a chamada', 'sinal')] },
        { ms: 1500, cena: 'call', estado: 'r', desc: `O iPhone pergunta se quer ligar para ${numero}.` },
        { ms: 800, cena: 'call', estado: 'r', toque: 'go', desc: 'Toque em Ligar.' },
        { ms: TOQUE, cena: 'ligacao', estado: 'ring', desc: `Chamando a ${C[kc].marca}.` },
        ...turnos.slice(0, 7).map((x, i) => ({ ms: x.ms, cena: 'ligacao', estado: `on t${i + 1}`, fala: gFala[i],
          desc: [
            'A recepção atende e o tempo da ligação começa a contar.',
            'Você conta que viu a clínica no Google e quer marcar uma avaliação.',
            'A recepção pergunta se é a primeira consulta e pede o nome completo.',
            'Você confirma que é a primeira consulta e diz o nome.',
            `A recepção oferece ${dataCurta(av.iso)}, às ${horaFala(av.hora)}, ou ${dataCurta(alt.iso)}, às ${horaFala(alt.hora)}.`,
            `Você escolhe ${diaSemana(av.iso)} às ${horaFala(av.hora)}.`,
            'A avaliação fica marcada e a confirmação vai pelo WhatsApp.',
          ][i],
          ...(i === 0 ? { log: [L('10:09:31', 'Google Ads', 'Chamada atendida', 'origem: anúncio de pesquisa', 'evento')] } : {}),
          ...(i === 6 ? { hora: t('10'), log: [L('10:10:02', 'Agenda da clínica', 'Avaliação marcada', `${dataCurta(av.iso)} · ${av.hora}`, 'dado'), L('10:10:04', 'Google Ads', 'Conversão de chamada', 'a ligação passou da duração mínima', 'conversao')] } : {}) })),
        { ms: turnos[7].ms, cena: 'serp', estado: `r ilha t8 vm`, fala: gFala[7], hora: t('10'), desc: 'A ligação vira a pílula da Dynamic Island, com o tempo e a voz. No Google, os locais e o endereço.',
          log: [L('10:10:06', 'WhatsApp Cloud API', 'Confirmação enviada', 'modelo de agendamento com o endereço', 'dado')] },
      ] },
    'google/display': { id: 'display', label: 'Display', curto: 'Display', mock: 'gDisplay', cliente: kt, selo: 'Anúncio', frase: 'Uma agência aparece na matéria sobre o destino.',
      objetivo: 'Pré-reservas da Festa do Divino',
      base: 'Google Ads: anúncio responsivo de display (títulos que se alternam, ícone AdChoices) e importação de conversão com gclid.',
      passos: passos3(['Anúncio no meio da matéria', [0]], ['Título muda, oferta continua', [1]], ['Saída, viajantes e pré-reserva', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]]),
      quadros: [
        { ms: 2200, cena: 'article', desc: `Matéria do ${TERCEIROS.portal.nome} sobre a Festa do Divino, com o anúncio da ${C[kt].marca} no meio do texto.` },
        { ms: 1900, cena: 'article', estado: 's2', desc: `O título do anúncio muda: saídas de ${dia(s1.ida)} e ${dia(s2.ida)} de maio de 2027.` },
        { ms: 900, cena: 'article', estado: 's2', toque: 'cta', desc: 'Toque no anúncio.' },
        { ms: 2000, cena: 'page', desc: 'A página da agência abre no Safari com as duas saídas de maio de 2027.', log: [L('10:09:30', 'Google Ads', 'Clique com gclid', 'a página guarda o gclid com a pré-reserva', 'sinal')] },
        { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: `Toque em ${intervalo(s1)}.` },
        { ms: 800, cena: 'page', estado: 'q1', toque: 'b', desc: 'Toque em Continuar.' },
        { ms: 2000, cena: 'page', estado: 'w2 q1', desc: `Quem vai: ${viagem}. Pagar o sinal agora ou só reservar?` },
        { ms: 900, cena: 'page', estado: 'w2 q1 q2', toque: 'c', desc: 'Toque em Só reservar.' },
        { ms: 800, cena: 'page', estado: 'w2 q1 q2', toque: 'd', desc: 'Toque em Continuar.' },
        { ms: 1800, cena: 'page', estado: 'w3 q1 q2', desc: 'Nome, WhatsApp e e-mail preenchidos, com o resumo da viagem.' },
        { ms: 800, cena: 'page', estado: 'w3 q1 q2', toque: 'e', desc: 'Toque em Enviar pré-reserva.' },
        { ms: 2400, cena: 'page', estado: 'w4 done', hora: t('10'), desc: `Pré-reserva recebida: a ${T.consultora} chama no WhatsApp e o sinal por Pix vem depois da confirmação.`,
          log: [L('10:10:08', 'Site', 'Pré-reserva enviada', `saída de ${dia(s1.ida)} a ${dia(s1.volta)} mai, 4 viajantes`, 'conversao'), L('10:10:09', 'CRM', 'Lead com gclid', 'a conversão volta para o Google Ads', 'dado')] },
      ] },
    'seo/organic': { id: 'organic', label: 'Orgânico', curto: 'Orgânico', mock: 'seoOrganic', cliente: ki, selo: 'Orgânico, sem anúncio', frase: 'Uma incorporadora aparece na busca sem pagar pelo clique.',
      objetivo: 'Contatos com interesse em planta definida',
      base: 'Google Search Central: título, trecho e sitelinks do resultado orgânico; GA4 generate_lead no envio do formulário.',
      passos: passos3(['Título com o que foi buscado', [0]], ['Resposta do site e plantas que dá para comparar', [1, 2, 3, 4, 5]], ['PDF em troca do e-mail, com consentimento', [6, 7, 8, 9, 10, 11]]),
      quadros: [
        { ms: 2000, cena: 'serp', desc: `Busca no Google: casa na falésia à venda. O resultado da ${C[ki].marca} vem sem rótulo de anúncio.` },
        { ms: 2200, cena: 'serp', estado: 'paa', desc: 'Em Pessoas também perguntam, a resposta sobre as plantas vem do site da incorporadora.' },
        { ms: 900, cena: 'serp', estado: 'paa', toque: 'link', desc: 'Toque no atalho Plantas.' },
        { ms: 2000, cena: 'page', desc: 'A página de plantas abre no Safari: casa de 3 quartos, com a sala voltada para o mar.', log: [L('10:09:28', 'Site', 'Visita orgânica', 'origem: Google, sem anúncio', 'sinal')] },
        { ms: 900, cena: 'page', toque: 'q4', desc: 'Toque em 4 quartos.' },
        { ms: 2200, cena: 'page', estado: 'p4', desc: 'A planta muda para 4 quartos: suíte, mais três quartos, três banheiros e lavabo.' },
        { ms: 900, cena: 'page', estado: 'p4', toque: 'pdf', desc: 'Toque em Receber as plantas em PDF.' },
        { ms: 2000, cena: 'page', estado: 'p4 mail', desc: 'A folha pede o e-mail, já preenchido, e o consentimento, que começa desmarcado.' },
        { ms: 900, cena: 'page', estado: 'p4 mail', toque: 'ck', desc: 'Toque na caixa de consentimento.' },
        { ms: 1400, cena: 'page', estado: 'p4 mail ck', desc: 'A caixa fica marcada e o botão Enviar acende.' },
        { ms: 800, cena: 'page', estado: 'p4 mail ck', toque: 'send', desc: 'Toque em Enviar.' },
        { ms: 2400, cena: 'page', estado: 'p4 done', hora: t('10'), desc: 'Plantas enviadas para o seu e-mail, com o convite para ver o decorado.',
          log: [L('10:10:04', 'GA4', 'generate_lead', 'formulário de plantas, com consentimento', 'conversao'), L('10:10:05', 'CRM', 'Contato criado', 'interesse: 4 quartos', 'dado')] },
      ] },
    'chatgpt/answer': { id: 'answer', label: 'Resposta', curto: 'Resposta', mock: 'gptAnswer', cliente: kt, selo: 'Patrocinado', frase: 'Uma agência aparece depois da resposta, separada dela, e a conversa segue no WhatsApp.',
      objetivo: 'Roteiros que viram conversa com a consultora',
      base: 'ChatGPT: anúncios no Brasil desde 04/08/2026, abaixo da linha que separa a resposta, só nos planos Free e Go.',
      passos: passos3(['A conversa de quem planeja a viagem', [0, 1, 2, 3, 4, 5]], ['A opção vem depois da linha cinza', [6]], ['Roteiro montado e mensagem enviada', [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]),
      quadros: [
        { ms: 1600, cena: 'chat', desc: 'No ChatGPT: quero ver uma festa tradicional no interior em maio. Por onde começo?' },
        { ms: 2200, cena: 'chat', estado: 's1', desc: 'A resposta pede os dias, a cidade de saída, quem vai e o que você quer ver.' },
        { ms: 2000, cena: 'chat', estado: 's1 ty', desc: `Você responde: ${s1.noites} noites, saindo de São Paulo, com o marido e os filhos de ${PESSOA.viajantes.criancas.join(' e ')} anos.` },
        { ms: 800, cena: 'chat', estado: 's1 ty', toque: 'gsend', desc: 'Toque em enviar.' },
        { ms: 1600, cena: 'chat', estado: 's1 s3', desc: 'A pergunta sobe e o ChatGPT compara festas com cavalhadas em maio.' },
        { ms: 2600, cena: 'chat', estado: 's1 s3 s4', desc: `A resposta indica Pirenópolis: mascarados e cavalhadas de ${dia(cav1)} a ${dia(cav3)} de maio de 2027, com as fontes.` },
        { ms: 2200, cena: 'chat', estado: 's1 s3 s4 s2', desc: `Depois da linha cinza, separado da resposta, o cartão Patrocinado da ${C[kt].marca}.` },
        { ms: 900, cena: 'chat', estado: 's1 s3 s4 s2', toque: 'cta', desc: 'Toque no cartão patrocinado.' },
        { ms: 2000, cena: 'page', desc: 'O navegador do ChatGPT abre o montador de roteiro da agência: quantas noites?', log: [L('10:09:44', 'Site', 'Visita vinda do ChatGPT', 'utm do anúncio', 'sinal')] },
        { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: `Toque em ${s1.noites} noites, de ${dia(s1.ida)} a ${dia(s1.volta)} de maio.` },
        { ms: 900, cena: 'page', estado: 'q1 q2', toque: 'b', desc: 'Toque em Família.' },
        { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque em Continuar.' },
        { ms: 1700, cena: 'page', estado: 'w2 q1 q2', desc: 'O que você quer ver: mascarados, cavalhadas, procissão ou comida típica.' },
        { ms: 900, cena: 'page', estado: 'w2 q1 q2 q3', toque: 'd', desc: 'Toque em Cavalhadas.' },
        { ms: 800, cena: 'page', estado: 'w2 q1 q2 q3', toque: 'e', desc: 'Toque em Gerar roteiro.' },
        { ms: 2400, cena: 'page', estado: 'w3 q1 q2 q3', desc: `Roteiro de ${s1.noites} noites: centro histórico, mascarados e as três cavalhadas, com hotel no centro.`, log: [L('10:10:20', 'ChatGPT Ads', 'Conversão do pixel', 'roteiro gerado; a agência vê só dados agregados', 'sinal')] },
        { ms: 900, cena: 'page', estado: 'w3 q1 q2 q3', toque: 'f', desc: 'Toque em Falar com um consultor.' },
        { ms: 2200, cena: 'wa', hora: t('11'), desc: 'O WhatsApp abre a conversa da agência com a mensagem pronta e o roteiro anexado.' },
        { ms: 800, cena: 'wa', toque: 'send', desc: 'Toque em enviar.' },
        { ms: 1800, cena: 'wa', estado: 'm1', desc: 'A mensagem com o roteiro chega à agência. A consultora está digitando.', log: [L('10:11:05', 'WhatsApp Cloud API', 'Mensagem recebida', 'com o link do roteiro', 'dado')] },
        { ms: 2800, cena: 'wa', estado: 'm1 m2 done', hora: t('12'), desc: `A ${T.consultora} responde: há vaga para ${dia(s1.ida)} a ${dia(s1.volta)} de maio e ela monta a pré-reserva, com o sinal por Pix depois.` },
      ] },
    'maps/local': { id: 'local', label: 'Local', curto: 'Local', mock: 'mapsLocal', cliente: kr, selo: 'Patrocinado', frase: 'Um restaurante aparece no mapa na hora do almoço e leva até a porta.',
      objetivo: 'Pedidos de rota para o almoço de hoje',
      base: 'Google Ads: anúncios locais no Maps (alfinete quadrado, ficha com Patrocinado, ação de rotas).',
      passos: passos3(['Alfinete quadrado no caminho', [0, 1]], ['A ficha mostra prato e horário', [2]], ['Rota traçada e navegação', [3, 4, 5, 6]]),
      quadros: [
        { ms: 1500, cena: 'map', estado: 'typing', hora: '11:14', desc: 'Busca no Google Maps: almoço perto de mim.' },
        { ms: 2000, cena: 'map', hora: '11:14', desc: `Entre os alfinetes, o quadrado da ${C[kr].marca}, com Patrocinado na ficha embaixo.` },
        { ms: 2200, cena: 'map', estado: 's2', hora: '11:15', desc: `A ficha sobe: ${R.abreHoje.toLowerCase()}, feijoada no tacho aos sábados, a 4,2 km.` },
        { ms: 900, cena: 'map', estado: 's2', toque: 'cta', hora: '11:15', desc: 'Toque em Rotas.', log: [L('11:15:20', 'Google Maps', 'Clique em rotas', 'alfinete promovido', 'sinal'), L('11:15:21', 'Google Ads', 'Ação local: rotas', 'conta como visita à loja', 'conversao')] },
        { ms: 2200, cena: 'route', hora: '11:15', desc: `A rota de carro aparece no mapa: 14 min, 4,2 km, chegada às ${chegada}.` },
        { ms: 900, cena: 'route', toque: 'go', hora: '11:15', desc: 'Toque em Iniciar.' },
        { ms: 2800, cena: 'route', estado: 'done', hora: saidaRota, desc: `A navegação começa: em 200 m, vire à direita. Chegada às ${chegada}, quando o restaurante abre.` },
      ] },
    'whatsapp/ctwa': { id: 'ctwa', label: 'Clique para conversar', curto: 'Conversa', mock: 'waAd', cliente: kc, selo: 'Anúncio', frase: 'Uma clínica começa o agendamento numa conversa que a assistente virtual conduz.',
      objetivo: 'Avaliações marcadas pela conversa',
      base: 'Meta: anúncio de clique para o WhatsApp (referral com ctwa_clid), mensagens de lista e de botões, Conversions API para mensagens.',
      passos: passos3(['Hora marcada na própria imagem', [0]], ['A legenda convida a contar mais', [1]], ['Mensagem pronta, lista e horário', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]]),
      quadros: [
        { ms: 1800, cena: 'ad', desc: `Anúncio da ${C[kc].marca} no Instagram: avaliação com hora marcada.` },
        { ms: 2000, cena: 'ad', estado: 'open lit', desc: 'A legenda abre e o botão Enviar mensagem pelo WhatsApp acende.' },
        { ms: 900, cena: 'ad', estado: 'open lit', toque: 'cta', desc: 'Toque em Enviar mensagem pelo WhatsApp.' },
        { ms: 2200, cena: 'chat', hora: t('10'), desc: 'O WhatsApp abre a conversa com a mensagem pronta, a prévia do anúncio e o endereço da clínica.' },
        { ms: 800, cena: 'chat', toque: 'send', desc: 'Toque em enviar.' },
        { ms: 1600, cena: 'chat', estado: 'm1', desc: 'A mensagem sai com a citação do anúncio. A assistente virtual está digitando.', log: [L('10:10:04', 'WhatsApp Cloud API', 'Mensagem com referral', 'ctwa_clid do anúncio', 'sinal')] },
        { ms: 2200, cena: 'chat', estado: 'm1 m2', desc: `A assistente virtual se apresenta e oferece a lista de atendimentos ou a recepção.` },
        { ms: 800, cena: 'chat', estado: 'm1 m2', toque: 'list', desc: 'Toque em Ver opções.' },
        { ms: 1600, cena: 'chat', estado: 'm1 m2 ls', desc: 'A lista abre: avaliação, limpeza, dor ou urgência e recepção.' },
        { ms: 900, cena: 'chat', estado: 'm1 m2 ls', toque: 'opt', desc: 'Toque em Avaliação odontológica.' },
        { ms: 1200, cena: 'chat', estado: 'm1 m2 ls lp', desc: 'Avaliação odontológica fica marcada na lista e o Enviar acende.' },
        { ms: 800, cena: 'chat', estado: 'm1 m2 ls lp', toque: 'lsend', desc: 'Toque em Enviar.' },
        { ms: 2600, cena: 'chat', estado: 'm1 m2 m3', desc: `A escolha vira mensagem e a assistente oferece dois horários com a ${CL.responsavel}.` },
        { ms: 900, cena: 'chat', estado: 'm1 m2 m3', toque: 'hor', desc: `Toque em ${h1}.` },
        { ms: 2800, cena: 'chat', estado: 'm1 m2 m3 m5 m6 done', hora: t('11'), desc: `Avaliação marcada: ${dataLonga(av.iso)}, às ${horaFala(av.hora)}, com a localização da clínica.`,
          log: [L('10:11:02', 'Agenda da clínica', 'Avaliação marcada', `${dataCurta(av.iso)} · ${av.hora}`, 'dado'), L('10:11:03', 'Meta CAPI para mensagens', 'LeadSubmitted', 'action_source: business_messaging, com o ctwa_clid', 'conversao')] },
      ] },
    'whatsapp/catalog': { id: 'catalog', label: 'Catálogo', curto: 'Catálogo', mock: 'waCatalog', cliente: kr, selo: 'Catálogo, não é anúncio', frase: 'Um restaurante recebe a encomenda pelo catálogo e fecha o pedido no atendimento automático.',
      objetivo: 'Encomendas para sábado, com retirada no balcão',
      base: 'WhatsApp Business: catálogo, carrinho e mensagem de pedido (order); mensagens com botões de resposta.',
      passos: passos3(['A vitrine dentro do perfil', [0, 1]], ['Itens por ocasião, com preço', [2, 3]], ['Carrinho, pedido e confirmação', [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]]),
      quadros: [
        { ms: 2000, cena: 'profile', desc: `Perfil comercial da ${C[kr].marca} no WhatsApp: descrição, endereço, horário, site e o catálogo.` },
        { ms: 800, cena: 'profile', toque: 'more', desc: 'Toque em Ver tudo.' },
        { ms: 2000, cena: 'catalog', desc: 'O catálogo separa Encomendas de sábado e Doces, com o preço de cada item.' },
        { ms: 900, cena: 'catalog', toque: 'item', desc: `Toque em ${enc.item}.` },
        { ms: 2000, cena: 'item', desc: 'A página do item mostra foto, preço, o que vem e a quantidade.' },
        { ms: 800, cena: 'item', toque: 'add', desc: 'Toque em Adicionar ao carrinho.' },
        { ms: 1400, cena: 'item', estado: 'ct', desc: 'A barra Ver carrinho, 1 item, aparece embaixo.' },
        { ms: 800, cena: 'item', estado: 'ct', toque: 'cart', desc: 'Toque em Ver carrinho.' },
        { ms: 2000, cena: 'cart', estado: 'ct', desc: 'O carrinho mostra a feijoada, a observação para sábado e o subtotal estimado.' },
        { ms: 800, cena: 'cart', estado: 'ct', toque: 'order', desc: 'Toque em Fazer pedido.' },
        { ms: 1600, cena: 'chat', hora: t('10'), desc: 'O pedido chega na conversa como mensagem de carrinho. A assistente virtual está digitando.', log: [L('10:10:02', 'Catálogo', 'Order recebido', 'webhook com o item e a quantidade', 'dado')] },
        { ms: 2000, cena: 'chat', estado: 'k1', desc: 'A assistente virtual se apresenta e pergunta como você prefere receber.' },
        { ms: 800, cena: 'chat', estado: 'k1', toque: 'r1', desc: 'Toque em Retirar no balcão.' },
        { ms: 2000, cena: 'chat', estado: 'k1 k2', desc: `A resposta aparece na conversa e a assistente pergunta o horário de ${diaSemana(enc.iso)}.` },
        { ms: 800, cena: 'chat', estado: 'k1 k2', toque: 'r2', desc: `Toque em ${horaFala(enc.hora)}.` },
        { ms: 2600, cena: 'chat', estado: 'k1 k2 k3', hora: t('11'), desc: `Resumo do pedido ${pedido}: retirada às ${horaFala(enc.hora)} e pagamento por Pix na retirada.` },
        { ms: 800, cena: 'chat', estado: 'k1 k2 k3', toque: 'ok', desc: 'Toque em Confirmar pedido.' },
        { ms: 2800, cena: 'chat', estado: 'k1 k2 k3 k4 done', hora: t('11'), desc: `Pedido ${pedido} confirmado, com o aviso pelo WhatsApp quando estiver pronto.`,
          log: [L('10:11:20', 'Cozinha', `Pedido ${pedido} na fila de sábado`, `retirada às ${enc.hora}`, 'dado'), L('10:11:21', 'WhatsApp Cloud API', 'Status do pedido', 'recebido; pronto vai na próxima mensagem', 'conversao')] },
      ] },
  };

  /* Front piece of each channel: native frame (link), offer line and the button. */
  const channels = {
    linkedin: { benefit: 'Falar com quem decide.', art: art('financas', 'reuniao45', '50% 55%', FI.guia.titulo, `Peça da ${C.financas.marca}, gestora de patrimônio fictícia: mesa de reunião vista de cima, capa do guia.`, { formato: 'link', oferta: FI.guia.titulo, cta: 'Baixar' }) },
    google: { benefit: 'Responder a quem já procura.', art: art(kc, 'consultorio45', '50% 50%', C[kc].assinatura, `Peça da ${C[kc].marca}, clínica odontológica fictícia: consultório claro com cadeira e janela.`, { formato: 'link', oferta: `Avaliação odontológica em ${av.unidade}`, cta: 'Ligar' }) },
    seo: { benefit: 'Ser encontrado sem pagar pelo clique.', art: art(ki, 'salaMar45', '50% 40%', C[ki].assinatura, `Peça da ${C[ki].marca}, incorporadora fictícia: sala da casa com o mar ao fundo.`, { formato: 'link', oferta: 'Plantas de 3 e 4 quartos', cta: 'Ver plantas' }) },
    chatgpt: { benefit: 'Aparecer depois da resposta.', art: art(kt, 'pirenopolisRua45', '50% 45%', C[kt].assinatura, `Peça da ${C[kt].marca}, agência de viagens fictícia: rua de pedra do centro histórico de Pirenópolis.`, { formato: 'link', oferta: 'Roteiro da Festa do Divino', cta: 'Falar com consultor' }) },
    maps: { benefit: 'Ser a escolha no caminho.', art: art(kr, 'fachada45', '50% 50%', C[kr].assinatura, `Peça da ${C[kr].marca}, restaurante fictício: fachada de madeira, com flores e mesas na calçada.`, { formato: 'link', oferta: 'Feijoada no tacho aos sábados', cta: 'Rotas' }) },
    whatsapp: { benefit: 'Transformar interesse em conversa.', art: art(kc, 'recepcao45', '50% 50%', 'Conte o que sente e escolha o horário', `Peça da ${C[kc].marca}, clínica odontológica fictícia: recepção com parede terracota, sofá e plantas.`, { formato: 'link', oferta: 'Avaliação pelo WhatsApp', cta: 'Conversar' }) },
  };

  /* Banners that close a journey after the conversion. */
  const AVISOS = {
    'google/search': { app: 'whatsapp', cliente: kc, hora: t('10'), texto: `Avaliação marcada: ${diaSemana(av.iso)}, ${dia(av.iso)}, às ${horaFala(av.hora)}. ${TERCEIROS.ruas.clinica}.`, desc: 'A confirmação chega pelo WhatsApp ainda durante a ligação, com o endereço.' },
    'google/display': { app: 'whatsapp', cliente: kt, hora: t('11'), texto: `Oi, ${PESSOA.primeiro}! Aqui é a ${T.consultora}, da ${curta(kt)}. Recebi sua pré-reserva para ${dia(s1.ida)} a ${dia(s1.volta)} de maio. Posso mandar o roteiro?`, desc: `A consultora ${T.consultora} chama pelo WhatsApp para confirmar a pré-reserva.` },
    'seo/organic': { app: 'mail', cliente: ki, hora: t('11'), texto: 'Suas plantas chegaram: 3 e 4 quartos, em PDF, com os horários do decorado.', desc: 'O e-mail com as plantas chega na notificação do iPhone.' },
  };

  const mocks = { liFeed, gSearch, gDisplay, seoOrganic, gptAnswer, mapsLocal, waAd, waCatalog };
  const SCREEN = {
    liFeed: { fundo: '#f4f2ee' }, gSearch: { fundo: '#fff' }, gDisplay: { fundo: '#fff' }, seoOrganic: { fundo: '#fff' },
    gptAnswer: { fundo: '#fff' }, mapsLocal: { fundo: '#f3f1ec' }, waAd: { tema: 'escuro', fundo: '#0c1014' }, waCatalog: { fundo: '#fff' },
  };
  return { mocks, placements, channels, SCREEN, AVISOS };
}
