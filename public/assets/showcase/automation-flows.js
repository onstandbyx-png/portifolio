/** Deep automation flows: eight storyboards of the same iPhone that go past the auto-reply. Each placement
 * is a list of frames like the campaign flows, and a frame may carry:
 * - log: what the systems behind the screen record, [ator, evento, detalhe, {t:'HH:MM:SS', tipo, campos?, dia?, bastidor?}].
 *   t grows inside every flow and failure path; dia (ISO) marks a line of another day; campos are short masked
 *   key/value pairs; bastidor {titulo, texto} is what a person receives backstage (the summary of the AI).
 *   Nothing backstage is drawn inside the customer's phone.
 * - fala: [[quem, texto]], the lines of a call, shown beside the phone (the apps show no transcript);
 * - hora: the clock of the status bar from that frame on.
 * Calls run on one clock (linhaDoTempo): every turn frame lasts the time of its line, the call timer counts
 * that turn live and the wave follows who speaks (automation-mocks.css). placement.audio is set only when a
 * recorded file exists (AUDIO below); nothing plays by itself.
 * Names, dates, orders and people come from marcas.js; amounts stay masked; ads are labelled the way each
 * platform does; AI agents say they are virtual assistants and always offer a person. The hidden placements
 * '<canal>/<formato>-falha' are the failure paths shown in "Sistemas e automações".
 *
 * Reveal engine (automation-mocks.css, generated): inside a screen with the class au, data-in="a3" shows once
 * the frame state carries a3 (every listed token), data-out="a5 x1" hides on any of them, data-pick="f1" lights
 * the choice when f1 arrives. */
import { brCode, qrSvg } from './pix-kit.js';

/* Recorded calls, off until a file exists: one clip per turn, measured and joined (about 250 ms apart, mono 64 kbps,
   telephone band), with the measured offsets copied into the turns of linhaDoTempo. */
const AUDIO = { 'voz/ligacao': '', 'whatsapp/chamada': '' };

const GLIFOS = {
  relogio: 'M12 20.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM12 9.2v3.9l2.5 1.6M5.4 4.6 3 7M18.6 4.6 21 7',
  teclado: 'M7 4.5h.01M12 4.5h.01M17 4.5h.01M7 9.5h.01M12 9.5h.01M17 9.5h.01M7 14.5h.01M12 14.5h.01M17 14.5h.01M12 19.5h.01',
  lanterna: 'M8 3.5h8v3l-2 3v11h-4v-11l-2-3zM8 6.5h8M12 12.5v2',
  filtro: 'M4 6h16M7 12h10M10 18h4',
  pessoa: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c.7-3.6 3.5-5.5 7-5.5s6.3 1.9 7 5.5',
  carrinho: 'M3.5 4.5h2.5l2.2 10.5h9.6l2-7.5H7M10 19.5h.01M17 19.5h.01',
  megafone: 'M4 10v4h3l7 4V6L7 10zM17 9.5a3.5 3.5 0 0 1 0 5',
};

export function makeAutomations(H) {
  const { I, pic, kb, marca, esc, scene, screen, logoSvg, LAB, SITES, CLIENTES: C, OFERTAS, PEDIDOS, LEGAL, TERCEIROS, PESSOA, dataCurta, dataLonga, horaFala, P, browserBar, safari, art } = H;
  const T = OFERTAS.turismo, V = OFERTAS.varejo, E = OFERTAS.educacao, CL = OFERTAS.clinica, AU = OFERTAS.automotivo, FI = OFERTAS.financas;
  const B = TERCEIROS.banco, PSP = TERCEIROS.psp, M = E.mensalidade;
  const nome = k => C[k].marca, curta = k => C[k].curta || C[k].marca;
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
  const dia = iso => Number(iso.slice(8, 10));
  const ddmm = iso => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  const somaDias = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const G = (name, cls = '') => GLIFOS[name] ? `<svg class="cm-i cm-i--${name}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${GLIFOS[name]}"/></svg>` : I(name, cls);
  const mask = '<span class="au-mask" aria-label="valor oculto">R$ ••••</span>';
  const xtr = '<span class="au-xtr" aria-label="Estrelas, valor oculto"><i aria-hidden="true">★</i> ••••</span>';
  const passos3 = (a, b, c) => [P('Atenção', a[0], a[1]), P('Retenção', b[0], b[1]), P('Conversão', c[0], c[1])];
  const de = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  /* A line of the log. tipo is one of TIPOS; dia only for a day other than today. */
  const ev = (t, ator, evento, detalhe, tipo, campos, extra) => [ator, evento, detalhe || '', { t, tipo, ...(campos ? { campos } : {}), ...(extra || {}) }];

  /* Spoken times and the clock of a call. */
  const NUM = ['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze'];
  const horaDita = (h, periodo = true) => {
    const [hh, mm] = h.split(':').map(Number), n = hh % 12 || 12;
    const base = hh === 12 ? 'meio-dia' : NUM[n] || 'meio-dia', min = mm === 30 ? ' e meia' : mm ? ` e ${mm}` : '';
    if (!periodo) return mm || hh === 12 ? base + min : `${base} ${n === 1 ? 'hora' : 'horas'}`;
    return base + min + (hh === 12 ? '' : hh < 12 ? ' da manhã' : hh < 18 ? ' da tarde' : ' da noite');
  };
  const palavras = s => (String(s).match(/[\p{L}\p{N}]+/gu) || []).length;
  /* Each line lasts the time to say it (2.8 words a second, 1.3 s at least), then half a second of silence. */
  const linhaDoTempo = (falas, inicio = 1000) => {
    let t = inicio;
    return falas.map(f => { const dur = f.ms || Math.max(1300, Math.round(palavras(f.texto) / 2.8 * 1000)); const seg = { ...f, startMs: t, endMs: t + dur }; t += dur + 500; return seg; });
  };
  const relogio = (s, ios) => `${ios ? String(Math.floor(s / 60)).padStart(2, '0') : Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  /* The live timer of turn n: it counts from the start to the end of the line, in real time. */
  const tempo = (seg, n, ios = false) => {
    const a = Math.floor(seg.startMs / 1000), b = Math.floor(seg.endMs / 1000);
    return `<b class="au-tempo${ios ? ' au-tempo--ios' : ''}" data-in="t${n}"><i style="--de:${a};--ate:${b};--dur:${seg.endMs - seg.startMs}ms"><span class="au-sr">${relogio(b, ios)}</span></i></b>`;
  };
  const tempos = (segs, ios, n0 = 1) => segs.map((seg, i) => tempo(seg, n0 + i, ios)).join('');
  /* 14 bars; the state of the frame says who speaks (fala-ia, fala-eu, fala-rafael) and the bars follow. */
  const onda = (cls = '') => `<span class="au-onda${cls ? ' ' + cls : ''}" aria-hidden="true">${Array.from({ length: 14 }, (_, k) => `<i style="--k:${k};--e:${(0.6 + 0.4 * Math.sin(k / 13 * Math.PI)).toFixed(2)}"></i>`).join('')}</span>`;
  const QUEM = { ia: 'Assistente virtual (IA)', eu: PESSOA.primeiro, rafael: `${AU.consultor}, consultor` };
  const turno = (seg, n, extra = {}) => ({ ms: seg.endMs - seg.startMs + 500, estado: `t${n} fala-${seg.quem}${extra.mais ? ' ' + extra.mais : ''}`, ...(seg.texto ? { fala: [[QUEM[seg.quem], seg.texto]] } : {}), ...extra.q });
  const segmentos = segs => segs.filter(s => s.texto).map(s => ({ quem: QUEM[s.quem], texto: s.texto, startMs: s.startMs, endMs: s.endMs }));
  /* Dynamic Island: the call activity (green timer and the wave) and the pill that closes the call. */
  const ilha = (segs, n0, fim) => `<div class="au-ilha" aria-hidden="true"><span class="au-ilha-ativa"><span class="au-ilha-esq">${I('phone')}${tempos(segs, false, n0)}</span>${onda('au-onda--ilha')}</span><span class="au-ilha-fim"><b>${I('phone')}${esc(fim[0])}</b><small>${esc(fim[1])}</small></span></div>`;

  /* WhatsApp: bubbles, the typing dots before every answer, ticks that turn blue when read. */
  const prox = tok => tok.replace(/\d+$/, d => String(Number(d) + 1));
  const out = (tok, html, time, cls = '') => `<div class="cm-wa-out${cls ? ' ' + cls : ''}"${tok ? ` data-in="${tok}"` : ''}>${html}<small>${time} ${I('ticks', 'au-ticks')}</small></div>`;
  const inn = (tok, html, { who = '', time, cls = '', typing = true, hs = '' } = {}) =>
    `${tok && typing ? `<span class="au-typing" data-in="${tok}" data-out="${prox(tok)}" aria-hidden="true"><i></i><i></i><i></i></span>` : ''}<div class="cm-wa-in${tok && typing ? ' au-tarde' : ''}${cls ? ' ' + cls : ''}"${tok ? ` data-in="${tok}"` : ''}${hs ? ` data-hs="${hs}"` : ''}>${who}${html}<small>${time}</small></div>`;
  const ia = () => '<b class="au-who au-who--ia">Assistente virtual</b>';
  const pessoa = (quem, k) => `<b class="au-who">${esc(quem)} · ${esc(curta(k))}</b>`;
  const sys = (tok, html) => `<span class="cm-wa-sys au-sys"${tok ? ` data-in="${tok}"` : ''}>${html}</span>`;
  const waHead = k => `<div class="cm-wa-head">${I('back')}${marca(k)}<span><b>${esc(nome(k))}</b><small>Conta comercial</small></span>${I('video')}${I('phone')}</div>`;
  const waMeta = '<span class="cm-wa-sys">Esta empresa usa um serviço seguro da Meta para gerenciar esta conversa. Toque para saber mais.</span>';
  const waCompose = ({ text = '', tap = '', attrs = '', preview = '' } = {}) => `<div class="cm-wa-compose"${attrs}>${preview}<span class="cm-wa-row">${I('plus')}<span class="cm-wa-field${text ? '' : ' cm-wa-field--empty'}">${esc(text)}</span>${tap ? `<span class="cm-wa-send" data-tap="${tap}" data-hs="1">${I('send')}</span>` : `${I('camera')}${I('mic')}`}</span></div>`;
  const waGlyph = `${logoSvg('whatsapp', { altura: 16, classe: 'cm-wa-glyph' })}${logoSvg('whatsapp', { altura: 16, mono: 'branco', classe: 'cm-wa-glyph cm-wa-glyph--lit' })}`;
  const waIcon = logoSvg('whatsapp', { altura: 22, mono: 'branco', classe: 'cm-push-glyph' });

  /* The customer's bank (TERCEIROS.banco) in the look of kit.banco (campaign-sites.css), under the reveal engine of
     these flows: the iOS crumb back to the app she came from, the bank's bar and a body. */
  const banco = (inner, deApp) => `<div class="au-bk" style="--bk:${B.cor}">${deApp ? `<span class="cm-crumb">${I('back')}${esc(deApp)}</span>` : ''}<div class="cm-bk-top">${I('back')}<b><i class="cm-bk-mark" aria-hidden="true">${esc(B.sigla)}</i>${esc(B.nome)}</b>${I('dots')}</div><div class="cm-bk-corpo">${inner}</div></div>`;
  const linha = (k, v, cls = '') => `<span class="cm-bk-linha${cls ? ' ' + cls : ''}"><small>${esc(k)}</small><b>${v}</b></span>`;
  const faceId = (tok, out2) => `<div class="cm-bk-face au-face" data-in="${tok}"${out2 ? ` data-out="${out2}"` : ''}><span>${I('face', 'au-face-ico')}${I('check', 'au-face-ok')}</span><small>Face ID</small></div>`;
  const saldo = `<span class="au-bk-saldo"><span><small>Saldo disponível</small><b>${mask}</b></span><span><small>Limite Pix disponível hoje</small><b>${mask}</b></span></span>`;
  const comprovante = ({ tok, para, quando, volta, hs = '3', titulo = 'Comprovante de Pix', extra = '' }) => `<div class="cm-bk-ok au-bank-done" data-in="${tok}" data-hs="${hs}"><span class="cm-bk-check">${I('check')}</span><b>${esc(titulo)}</b><small>${mask} para ${esc(para)}</small><span class="cm-bk-comp">${[['Data', quando], ['ID da transação', 'E2E••••••••'], ['Pagador', `${PESSOA.nome} · ${B.nome}`], ['Recebedor', `${para} · ${PSP.nome}`]].map(([a, b]) => `<span><small>${esc(a)}</small><b>${esc(b)}</b></span>`).join('')}${extra}</span><span class="au-bk-acoes"><span class="cm-bk-volta">${I('share')}Compartilhar comprovante</span><span class="cm-bk-volta au-bk-volta" data-tap="volta">${I('back')}${esc(volta)}</span></span></div>`;
  /* iOS notification banner inside a scene (data-banner drops it in). */
  const banner = (tok, { icone, titulo, texto, tap = '', hs = '', out: sai = '' }) => `<div class="au-banner" data-in="${tok}"${sai ? ` data-out="${sai}"` : ''} data-banner${tap ? ` data-tap="${tap}"` : ''}${hs ? ` data-hs="${hs}"` : ''}><span class="au-banner-ico">${icone}</span><span><span class="au-banner-top"><b>${esc(titulo)}</b><small>agora</small></span><small>${texto}</small></span></div>`;
  const bancoIcone = `<i class="cm-bk-mark au-bk-icone" style="--bk:${B.cor}" aria-hidden="true">${esc(B.sigla)}</i>`;

  /* The pre-booking of the agency and the Pix codes of the flows (real in form, never payable). */
  const s1 = T.saidas[0], s2 = T.saidas[1];
  const periodo = s => `${dia(s.ida)} a ${dia(s.volta)} de maio`;
  const viajantes = `${PESSOA.viajantes.adultos} adultos e ${PESSOA.viajantes.criancas.length} crianças (${PESSOA.viajantes.criancas.join(' e ')} anos)`;
  const pixRcs = brCode({ url: 'pix.jatoba.exemplo/cob/5e0b7d9a41c24f86a3d2e6b1c09f7a34', nome: nome('varejo') });
  const pixAuto = brCode({ url: 'pix.jatoba.exemplo/cob/9f2c41d07a6b4e3c8b15d2e07c4a6f19', rec: 'pix.jatoba.exemplo/rec/4b7e19a2c05d4f6e9a3812cd7f60e5b4', nome: nome('educacao') });
  const codigo = c => `<code class="au-code">${esc(c.slice(0, 64))}…</code>`;

  /* ---------- 1. WhatsApp: ad, AI agent, Flow, consultant, Pix by app switch, order status ---------- */
  const order = (tok, { pago, exp = '', tap, hs = '' }) => `<div class="cm-wa-in au-order" data-in="${tok}"${hs ? ` data-hs="${hs}"` : ''}><span class="au-order-top">${pic('estandarte11', { pos: '50% 40%' })}<span><b>Pré-reserva · Festa do Divino</b><small>${esc(periodo(s1))} de 2027 · 4 viajantes</small></span></span>
      <span class="au-order-itens"><span>Pacote adulto <b>× 2</b></span><span>Pacote criança <b>× 2</b></span></span><span class="au-order-total"><small>Sinal da pré-reserva</small>${mask}</span><span class="au-order-rod">Saldo até 30 dias antes da viagem</span>
      <span class="au-order-pago" data-in="${pago}">${I('check')}pago</span>${exp ? `<span class="au-order-exp" data-in="${exp}">${I('info')}Expirado</span>` : ''}
      <span class="au-wa-btn" data-tap="${tap}" data-out="${pago}${exp ? ' ' + exp : ''}">${I('copy')}Pagar com Pix</span><span class="au-wa-btn au-wa-btn--sec" data-in="${exp || pago}">Ver detalhes</span>${exp ? `<span class="au-wa-btn au-wa-btn--sec" data-in="${pago}" data-out="${exp}">Ver detalhes</span>` : ''}<small>10:12</small></div>`;
  const status = (tok, quando) => `<div class="cm-wa-in au-status" data-in="${tok}"><span class="au-status-ref">${I('doc')}<span><b>Pré-reserva · Festa do Divino</b><small>Status do pedido</small></span></span><span class="au-status-chip">${I('check')}Em processamento</span><small>${quando}</small></div>`;
  const waAgente = () => screen('waag au', scene('ad', 'base', 'escuro', LAB.feedAd({ key: 'turismo', captionOpen: true,
    media: `<div class="cm-wa-art au-art">${pic('pirenopolisRua45', { alt: 'Rua de pedra com casario colonial em Pirenópolis.', pos: '50% 40%' })}<b data-hs="1" style="background:${C.turismo.cor}">Festa do Divino em grupo pequeno</b>${marca('turismo', 'circulo', 'cm-wa-art-mark')}</div>`,
    cta: { text: 'Enviar mensagem pelo WhatsApp', lead: waGlyph },
    caption: { hs: '2', html: `Festa do Divino em maio, em Pirenópolis. <span class="cm-more">mais</span><span class="cm-rest">Monte o orçamento da família pela conversa.</span>` } })) +
    scene('chat', 'push', 'claro', `<span class="cm-crumb">${I('back')}Instagram</span>${waHead('turismo')}
      <div class="cm-wa-body">${waMeta}<span class="cm-wa-day">Hoje</span>
        ${out('a1', `<span class="cm-wa-quote">${pic('estandarte11')}<span><b>${esc(nome('turismo'))}</b><small>Festa do Divino em grupo pequeno</small></span></span>Olá! Quero saber da Festa do Divino.`, '10:09')}
        ${inn('a2', `Oi, ${PESSOA.primeiro}! Sou a assistente virtual da ${esc(curta('turismo'))}, uma inteligência artificial. Monto o orçamento com você e chamo uma consultora quando precisar. Quem vai viajar?`, { who: ia(), time: '10:09', hs: '2' })}
        ${out('a3', 'Eu, meu marido e nossos dois filhos, de 8 e 2 anos. Em maio.', '10:10')}
        ${inn('a4', `Tenho duas saídas com vaga para a ${esc(T.produto.split(',')[0])}. Escolha a sua e confirme as idades:<span class="au-wa-btn" data-tap="flow" data-hs="2">${I('doc')}Montar orçamento</span>`, { who: ia(), time: '10:10', hs: '2' })}
        ${out('a5', `<span class="au-flowreply"><b>${I('doc', 'cm-i--inline')}Orçamento</b><span>${esc(periodo(s1))} · ${esc(viajantes)}</span><span>Dúvida: a de 2 anos vai no colo?</span></span>`, '10:11')}
        ${inn('a5', 'Recebi! Essa dúvida é de tarifa, então quem confirma é a nossa consultora. Já passei o seu resumo para a Júlia.', { who: ia(), time: '10:11', typing: false, cls: 'au-tarde' })}
        ${inn('a6', `Oi, ${PESSOA.primeiro}! Aqui é a ${esc(T.consultora)}. Li o resumo, não precisa repetir nada. Com 2 anos completos, ela já ocupa assento e paga tarifa de criança; no colo, só até 1 ano e 11 meses. Já incluí no valor. Separei a saída de ${esc(dataLonga(s1.ida).replace('-feira', ''))}.`, { who: pessoa(T.consultora, 'turismo'), time: '10:12', hs: '3' })}
        ${order('a7', { pago: 'a8', exp: 'x1', tap: 'pay', hs: '3' })}
        ${inn('x1', 'O código Pix expirou sem pagamento. Gerei um novo, válido por 30 minutos, para a mesma pré-reserva.', { who: ia(), time: '10:42' })}
        ${order('x1', { pago: 'x2', tap: 'pay2' }).replace('<small>10:12</small>', '<small>10:42</small>')}
        ${status('a8', '10:13')}${status('x2', '10:43')}
        ${inn('a8', 'Pagamento confirmado! A pré-reserva está garantida. Mandei o roteiro e os documentos por e-mail.', { who: pessoa(T.consultora, 'turismo'), time: '10:13', hs: '3' })}
        ${inn('x2', 'Pagamento confirmado, com uma cobrança só. A pré-reserva está garantida e o roteiro foi para o seu e-mail.', { who: pessoa(T.consultora, 'turismo'), time: '10:43', hs: '3' })}
      </div>${waCompose({ text: 'Olá! Quero saber da Festa do Divino.', tap: 'send', attrs: ' data-out="a1"', preview: `<span class="cm-wa-preview">${pic('estandarte11')}<span><b>${esc(nome('turismo'))}</b><small>Festa do Divino em grupo pequeno</small></span></span>` })}${waCompose({ attrs: ' data-in="a1"' })}`) +
    scene('flow', 'sheet', 'claro', `<div class="au-flow"><div class="au-flow-top">${I('close')}<b>Montar orçamento</b>${I('vdots')}</div>
      <div class="au-flow-step" data-out="f2"><b class="au-flow-h">Escolha a saída</b><small>${esc(T.produto)}</small>
        <span class="au-opt" data-pick="f1" data-tap="fo"><span><b>${esc(cap(dataCurta(s1.ida)))} a ${esc(dataCurta(s1.volta))}</b><small>${s1.noites} noites · ${esc(T.destaque.split(' (')[0].toLowerCase())}</small></span><i></i></span>
        <span class="au-opt"><span><b>${esc(cap(dataCurta(s2.ida)))} a ${esc(dataCurta(s2.volta))}</b><small>${s2.noites} noites · chega na véspera das cavalhadas</small></span><i></i></span>
        <b class="au-flow-h au-flow-h--sm">Quem vai</b><span class="au-chips"><span class="is-on">2 adultos</span><span class="is-on">2 crianças</span></span>
        <small class="au-flow-nota">${I('info', 'cm-i--inline')}${esc(T.transporte)}.</small></div>
      <div class="au-flow-step" data-in="f2"><b class="au-flow-h">Idades das crianças</b><span class="au-field"><small>Criança 1</small><b>${PESSOA.viajantes.criancas[0]} anos</b></span><span class="au-field"><small>Criança 2</small><b>${PESSOA.viajantes.criancas[1]} anos</b></span><span class="au-field au-field--area"><small>Alguma dúvida para a consultora?</small><b>A de 2 anos vai no colo?</b></span><small class="au-flow-nota">${I('lock', 'cm-i--inline')}${esc(T.politica)}.</small></div>
      <div class="au-flow-foot"><span class="au-flow-go" data-tap="fnext" data-out="f2">Continuar</span><span class="au-flow-go" data-tap="fsend" data-in="f2">Enviar</span><small>Gerenciado pela empresa. ${I('lock', 'cm-i--inline')}Saiba mais</small></div></div>`) +
    scene('pay', 'sheet', 'claro', `<div class="cm-sheet au-pay"><span class="cm-grabber"></span><p class="cm-wa-sheet-top"><span data-tap="fechar">${I('close')}</span><b>Pagar com Pix</b><i></i></p>
      <div class="au-pay-passo" data-out="b1"><span class="au-busca">${I('search')}Buscar banco</span>
        <span class="au-bankpick" data-pick="b1" data-tap="bank" data-hs="3"><i class="cm-bk-mark au-bk-icone" style="--bk:${B.cor}">${esc(B.sigla)}</i><b>${esc(B.nome)}</b><i class="au-radio"></i></span>
        <span class="au-bankpick"><i class="au-bank-mark au-bank-mark--2">BI</i><b>Banco Ipê</b><i class="au-radio"></i></span>
        <span class="au-bankpick"><i class="au-bank-mark au-bank-mark--4">SA</i><b>Cooperativa Serra Azul</b><i class="au-radio"></i></span>
        <span class="au-bankpick"><i class="au-bank-mark au-bank-mark--3">${I('copy')}</i><b>Copiar código Pix</b>${I('chevron')}</span>
        <small class="au-pay-fine">O app do banco abre já na tela de confirmação.</small></div>
      <div class="au-pay-passo" data-in="b1" data-out="b2"><b class="au-pay-h">Informe seu CPF</b><small class="au-pay-fine">Só no primeiro pagamento com Pix no WhatsApp.</small><span class="au-field"><small>CPF</small><b>${esc(PESSOA.cpf)}</b></span>
        <span class="au-tick">${I('check')}Li e aceito os Termos de Pagamentos do WhatsApp</span><span class="cm-btn cm-btn--wa au-pay-go" data-tap="cpf">Continuar</span></div>
      <div class="au-pay-passo" data-in="b2"><b class="au-pay-h">Revisar pagamento</b><span class="au-pay-line">${pic('estandarte11')}<span><b>Pré-reserva · Festa do Divino</b><small>${esc(nome('turismo'))} · 4 viajantes</small></span></span>
        <span class="au-row au-row--total"><small>Total</small><b>${mask}</b></span><span class="au-row"><small>Pagar com</small><b>${esc(B.nome)}</b></span><span class="au-row"><small>Recebedor</small><b>${esc(nome('turismo'))}</b></span>
        <span class="cm-btn cm-btn--wa au-pay-go" data-tap="bgo" data-hs="3">Ir para o ${esc(B.nome)}</span></div></div>`, 'cm-scene--part') +
    scene('bank', 'switch', 'claro', banco(`<div class="cm-bk-rev au-bk-rev" data-in="bk1" data-out="bk3"><small>Pagar com Pix</small><b class="cm-bk-valor">${mask}</b>
        ${linha('Para', esc(nome('turismo')))}${linha('Instituição', esc(PSP.nome))}${linha('CNPJ', '••.•••.•••/0001-••')}${linha('Descrição', 'Pré-reserva Festa do Divino')}${saldo}
        <span class="cm-bk-btn" data-tap="bk-ok" data-hs="3">${I('face')}Pagar com Face ID</span></div>${faceId('bk2', 'bk3')}
      ${comprovante({ tok: 'bk3', para: nome('turismo'), quando: '21/10/2026 · 10:13', volta: 'Voltar ao WhatsApp' })}`, 'WhatsApp')));

  /* ---------- 2. WhatsApp call: permission, the business calls, AI books, transfer to the consultant ---------- */
  const td = AU.testDrive;
  const segChamada = linhaDoTempo([
    { quem: 'ia', texto: `Oi, ${PESSOA.primeiro}! Aqui é a assistente virtual da ${curta('automotivo')}, uma inteligência artificial. Esta ligação é gravada para registro do agendamento. Você pediu um test drive do ${AU.modelo}. Posso confirmar o horário?` },
    { quem: 'eu', texto: 'Pode. Queria no sábado de manhã.' },
    { quem: 'ia', texto: `Sábado, ${dia(td.iso)}, tenho ${horaDita(td.hora, false)} ou ${horaDita(td.alternativa, false)}. Quer que eu chame um consultor para explicar a recarga?` },
    { quem: 'eu', texto: `${cap(horaDita(td.hora, false))}. E quero, sim.` },
    { quem: 'ia', texto: `Vou passar para o ${AU.consultor}, com o resumo da conversa.` },
    { quem: 'espera', texto: '', ms: 3200 },
    { quem: 'rafael', texto: `Oi, ${PESSOA.primeiro}, ${AU.consultor} aqui. Já vi seu pedido: sábado, ${dia(td.iso)}, às ${horaDita(td.hora, false).replace(' horas', '')}. Te mostro a recarga em casa e no eletroposto. Até sábado!` },
  ], 1400);
  const duracaoChamada = Math.floor(segChamada.at(-1).endMs / 1000);
  const waChamada = () => screen('wacall au', scene('chat', 'base', 'claro', `${waHead('automotivo')}
      <div class="cm-wa-body">${waMeta}<span class="cm-wa-day">Hoje</span>
        ${out('', `Quero fazer um test drive do ${esc(AU.modelo)}.`, '10:07')}
        ${inn('', `Oi, ${PESSOA.primeiro}! Sou a assistente virtual da ${esc(curta('automotivo'))}, uma inteligência artificial. Posso te ligar agora pelo WhatsApp para combinar o horário? Leva dois minutos.`, { who: ia(), time: '10:08', typing: false })}
        <div class="cm-wa-in au-perm" data-hs="1"><span class="au-perm-ico">${I('phone')}</span><b>${esc(nome('automotivo'))} quer ligar para você</b><small>Você pode mudar isso a qualquer momento nos dados da conversa.</small>
          <span class="au-perm-btn" data-tap="allow" data-out="a1">Permitir por 7 dias</span><span class="au-perm-btn au-perm-btn--sec" data-out="a1">Sempre permitir</span><span class="au-perm-btn au-perm-btn--no" data-out="a1">Agora não</span><span class="au-perm-ok" data-in="a1">${I('check', 'cm-i--inline')}Chamadas permitidas por 7 dias</span></div>
        ${sys('a1', `${I('phone', 'cm-i--inline')}Você permitiu que ${esc(nome('automotivo'))} ligue para você por 7 dias.`)}
        <div class="cm-wa-in au-calllog" data-in="a2"><span class="au-calllog-ico">${I('phone')}</span><span><b>Chamada de voz</b><small>${relogio(duracaoChamada)}</small></span><small>10:11</small></div>
        ${inn('a2', `<b>Test drive confirmado</b><br>${esc(cap(dataLonga(td.iso)))}, às ${esc(horaFala(td.hora))}, loja ${esc(td.unidade)}: ${esc(TERCEIROS.ruas.automotivo)}. Leve a carteira de motorista. Te espero lá!`, { who: pessoa(AU.consultor, 'automotivo'), time: '10:12', hs: '3' })}
      </div>${waCompose()}`) +
    scene('ring', 'modal', 'escuro', `<div class="au-ring"><span class="au-ring-id"><b>${esc(nome('automotivo'))}</b><small>WhatsApp Áudio</small></span>
      <div class="au-ring-acoes"><span>${G('relogio')}<small>Lembre-me</small></span><span>${I('comment')}<small>Mensagem</small></span></div>
      <div class="au-ring-btns"><span><i class="au-round au-round--no">${I('phone')}</i><small>Recusar</small></span><span><i class="au-round au-round--yes" data-pulse data-tap="accept" data-hs="2">${I('phone')}</i><small>Aceitar</small></span></div></div>`, 'au-grow') +
    scene('call', 'fade', 'escuro', `<div class="au-wacall"><span class="au-wacall-e2e">${I('lock', 'cm-i--inline')}Criptografada de ponta a ponta</span>
      <b>${esc(nome('automotivo'))}</b>
      <span class="au-wacall-st" data-hs="2"><span data-in="c0">Conectando…</span>${tempos(segChamada, false)}<span data-in="fim">Chamada encerrada · ${relogio(duracaoChamada)}</span></span>
      <span class="au-wacall-av">${marca('automotivo', 'circulo')}</span>${onda('au-onda--wa')}<span class="au-wacall-nota" data-in="t6">Transferindo para ${esc(AU.consultor)}…</span>
      <div class="au-wacall-bar"><span>${I('speaker')}</span><span>${I('video')}</span><span>${I('mute')}</span><span class="au-round--end">${I('phone')}</span></div></div>`, 'au-grow') +
    ilha([], 1, ['Encerrada', relogio(duracaoChamada)]));

  /* ---------- 3. Instagram: comment prompt on the Reel, private reply, waiting list, the arrival, a reserved checkout ---------- */
  const branco = V.skus.find(s => s.cor === 'branco'), chega = branco.chegada;
  const reserva = somaDias(chega, 1);
  const igDirect = () => screen('igdm au', scene('reel', 'base', 'escuro', LAB.reelsAd({ key: 'varejo', caption: `${branco.nome} em ${branco.cor}. Chega em ${ddmm(chega)}.`, cta: { text: 'Saiba mais' },
    video: `<div class="cm-shots"><figure class="cm-shot" data-shot="1">${kb('notebookBranco11', { alt: 'Notebook branco aberto sobre fundo claro.', pos: '50% 50%' })}<p class="cm-ontext" data-hs="1">O branco volta em ${ddmm(chega)}.</p>
      <span class="au-prompt" data-tap="cmt" data-hs="1">${I('comment', 'cm-i--inline')}Comente <b>BRANCO</b> e receba o aviso</span></figure></div>` })) +
    scene('comments', 'sheet', 'escuro', `<div class="cm-sheet au-cmts"><span class="cm-grabber"></span><b class="au-cmts-h">Comentários</b>
      <p class="au-cmt">${H.avatar(TERCEIROS.comentaristas[0], 'au-cmt-av')}<span><b>${esc(TERCEIROS.comentaristas[0])}</b>Esse branco fica lindo.</span></p><p class="au-cmt">${H.avatar(TERCEIROS.comentaristas[1], 'au-cmt-av')}<span><b>${esc(TERCEIROS.comentaristas[1])}</b>BRANCO</span></p>
      <p class="au-cmt au-cmt--me" data-in="a1">${H.avatar(PESSOA.nome, 'au-cmt-av')}<span><b>${esc(PESSOA.nome)}</b>BRANCO</span></p>
      <p class="au-cmt au-cmt--reply" data-in="a1" data-hs="2">${marca('varejo')}<span><b>${esc(C.varejo.arroba)}</b>Te mandamos o aviso no Direct.</span></p>
      <span class="au-cmts-in"><span class="cm-typed" data-out="a1"><span>BRANCO</span></span><span class="au-cmts-send" data-tap="csend" data-out="a1">Publicar</span></span></div>`, 'cm-scene--part') +
    scene('dm', 'push', 'escuro', LAB.direct({ key: 'varejo', items: [
      { de: 'sistema', html: 'Respondendo ao seu comentário no Reel' },
      { de: 'marca', html: `Oi, ${PESSOA.primeiro}! Você comentou BRANCO: o ${esc(branco.nome)} ${esc(branco.cor)} chega em ${ddmm(chega)}. Quer entrar na lista e receber o aviso por aqui?<span class="au-dm-btns"><span data-tap="join" data-hs="2">Entrar na lista</span><span>Ver especificações</span></span>` },
      { de: 'eu', html: 'Entrar na lista', in: 'd1' },
      { de: 'marca', html: `Pronto, você está na lista. Aviso uma vez só, por aqui, quando chegar.<span class="au-dm-btns" data-out="d2"><span data-tap="yes">Combinado</span></span>`, in: 'd1', hs: '3' },
      { de: 'eu', html: 'Combinado', in: 'd2' },
      { de: 'sistema', html: `${esc(cap(dataCurta(chega)))} · 18:40`, in: 'd3' },
      { de: 'marca', html: `O ${esc(branco.nome)} ${esc(branco.cor)} chegou! Separei um para você até ${esc(dataCurta(reserva))}, 18:40.<span class="au-dm-btns"><span class="is-primary" data-tap="buy" data-hs="3">Comprar agora</span></span>`, in: 'd3', hs: '3' },
    ] })) +
    scene('loja', 'push', 'claro', `${browserBar(curta('varejo'), C.varejo.dominio)}<div class="au-loja" style="--brand:${C.varejo.cor}"><span class="au-loja-reserva" data-hs="3">${I('lock')}<span><b>Reservado para você</b><small>Até ${esc(dataCurta(reserva))}, 18:40. Depois disso, volta para a lista.</small></span></span>
      <span class="au-loja-item">${pic('notebookBranco11', { pos: '50% 50%' })}<span><b>${esc(branco.nome)}</b><small>32 GB · ${esc(branco.cor)}</small><b>${mask}</b></span></span>
      ${[['Entrega', V.frete], ['Ou retire', TERCEIROS.ruas.varejo], ['Horário da loja', V.horario], ['Pagamento', `Pix à vista ou cartão ${V.parcelamento}`], ['Para', `${PESSOA.nome} · ${PESSOA.bairro}`]].map(([a, b]) => `<span class="au-row"><small>${esc(a)}</small><b>${esc(b)}</b></span>`).join('')}
      <span class="cm-btn au-loja-go">Continuar para o pagamento</span><small class="au-loja-fine">${I('info', 'cm-i--inline')}Pedido vindo do Direct: o mesmo preço da loja, sem cupom.</small></div>`));

  /* ---------- 4. Voice AI: the clinic calls the lead who asked for it ---------- */
  const av = CL.avaliacao, alt = CL.alternativa;
  const segVoz = linhaDoTempo([
    { quem: 'ia', texto: `Oi, ${PESSOA.primeiro}? Aqui é a assistente virtual da ${nome('clinica')}. Sou uma inteligência artificial e esta ligação pode ser gravada. Você pediu uma avaliação pelo site, certo?` },
    { quem: 'eu', texto: `Isso. Queria ver um ${CL.interesse}.` },
    { quem: 'ia', texto: `Tenho ${dataLonga(av.iso).split('-')[0]}, dia ${dia(av.iso)}, às ${horaDita(av.hora)}, ou ${dataLonga(alt.iso).split('-')[0]}, dia ${dia(alt.iso)}, às ${horaDita(alt.hora)}. Qual fica melhor?` },
    { quem: 'eu', texto: `${cap(dataLonga(av.iso).split('-')[0])} às ${horaDita(av.hora, false).replace(' horas', '')}.` },
    { quem: 'ia', texto: `Pronto: ${dataLonga(av.iso).split('-')[0]}, ${dia(av.iso)}, às ${horaDita(av.hora, false).replace(' horas', '')}, na unidade ${av.unidade}. Mando a confirmação no seu WhatsApp. Se preferir falar com a recepção, é só dizer.` },
    { quem: 'eu', texto: 'Não precisa, obrigada!' },
  ], 900);
  const duracaoVoz = Math.floor(segVoz.at(-1).endMs / 1000);
  const telefoneDigitado = `${PESSOA.telefone.slice(0, 8)}765-43${PESSOA.telefone.slice(-2)}`;
  const semana = de(25, 31).map(n => `2026-10-${n}`);
  const vozIA = () => screen('voice au', scene('page', 'base', 'claro', `<div class="au-lead" style="--brand:${C.clinica.cor}"><span class="au-lead-hero">${pic('recepcao45', { alt: 'Recepção da clínica com parede terracota, sofá e plantas.', pos: '50% 55%' })}</span><span class="au-lead-brand">${marca('clinica')}<b>${esc(nome('clinica'))}</b></span>
      <div data-out="a1"><b class="au-lead-h" data-hs="1">Prefere conversar? A gente liga.</b><span class="au-field"><small>Nome</small><b>${esc(PESSOA.nome)}</b></span><span class="au-field"><small>Celular</small><b>${esc(telefoneDigitado)}</b></span><span class="au-field"><small>Interesse</small><b>${esc(cap(CL.interesse))}</b></span>
        <span class="au-check is-on"><i>${I('check')}</i>Aceito receber uma ligação agora. Ela pode ser atendida por uma assistente virtual.</span>
        <span class="cm-btn au-lead-go" data-tap="send" data-hs="1">Pedir ligação</span><small class="cm-legal">${esc(LEGAL.clinica)}</small></div>
      <div class="au-lead-ok" data-in="a1" data-hs="1"><span class="cm-done-check">${I('phone')}</span><b>Recebemos. Vamos te ligar em instantes.</b><small>Se não puder atender, a gente manda mensagem no WhatsApp.</small>
        <ol class="au-lead-passos"><li><b>1</b>A ligação vem identificada: ${esc(nome('clinica'))}, Agendamento.</li><li><b>2</b>Uma assistente virtual oferece os horários livres.</li><li><b>3</b>A confirmação chega no seu WhatsApp.</li></ol></div>
      <span class="au-lead-info">${I('location', 'cm-i--inline')}${esc(TERCEIROS.ruas.clinica)}<br>${I('calendar', 'cm-i--inline')}${esc(CL.horario)}</span></div>
      ${safari(C.clinica.dominio)}${banner('perdida', { icone: `<i class="au-banner-tel">${I('phone')}</i>`, titulo: 'Ligação perdida', texto: esc(nome('clinica')), out: 'wab' })}${banner('wab', { icone: `<i class="au-banner-wa">${waIcon}</i>`, titulo: nome('clinica'), texto: `Oi, ${PESSOA.primeiro}! Tentamos te ligar agora para marcar a avaliação.`, tap: 'wab', hs: '2' })}`) +
    scene('ring', 'modal', 'escuro', `<div class="au-ring au-ring--marca" style="--brand:${C.clinica.cor}"><span class="au-ring-id">${marca('clinica', 'circulo', 'au-ring-av')}<b>${esc(nome('clinica'))}</b><small>Agendamento</small></span>
      <div class="au-ring-acoes"><span>${G('relogio')}<small>Lembre-me</small></span><span>${I('comment')}<small>Mensagem</small></span></div>
      <div class="au-ring-btns"><span><i class="au-round au-round--no">${I('phone')}</i><small>Recusar</small></span><span><i class="au-round au-round--yes" data-pulse data-tap="accept" data-hs="2">${I('phone')}</i><small>Aceitar</small></span></div></div>`, 'au-grow') +
    scene('call', 'fade', 'escuro', `<div class="au-incall"><span class="au-incall-t" data-hs="2">${tempos(segVoz.slice(0, 3), true)}</span><b class="au-incall-nome">${esc(nome('clinica'))}</b><small>Agendamento</small>
      <div class="au-incall-grid">${[['speaker', 'Alto-falante'], ['video', 'FaceTime'], ['mute', 'Mudo'], ['dots', 'Mais'], ['phone', 'Desligar', 1], ['teclado', 'Teclado Numérico']].map(([g, t, fim]) => `<span${fim ? ' class="au-incall-fim"' : ''}><i>${G(g)}</i><small>${t}</small></span>`).join('')}</div></div>`, 'au-grow') +
    scene('agenda', 'push', 'claro', `<div class="au-cal"><div class="au-cal-top"><span>${I('back')}outubro</span><span>${I('search')}${I('plus')}</span></div>
      <div class="au-cal-sem">${semana.map(iso => `<span${iso === av.iso ? ' class="is-on"' : ''}><small>${dataCurta(iso)[0].toUpperCase()}</small><b>${dia(iso)}</b></span>`).join('')}</div>
      <b class="au-cal-dia" data-hs="3">${esc(dataLonga(av.iso, true))}</b>
      <div class="au-cal-grade">${['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map(h => `<span class="au-cal-h"><small>${h.slice(0, 2)}h</small></span>`).join('')}
        <span class="au-cal-ev" style="--de:3;--ate:4">Reunião com a contabilidade<small>${esc(TERCEIROS.empresaPersona)}</small></span><span class="au-cal-ev au-cal-ev--2" style="--de:5;--ate:6">Almoço com a ${esc(TERCEIROS.comentaristas[0].split(' ')[0])}</span></div></div>`) +
    scene('wa', 'push', 'claro', `<span class="cm-crumb">${I('back')}Safari</span>${waHead('clinica')}<div class="cm-wa-body">${waMeta}<span class="cm-wa-day">Hoje</span>
      ${inn('', `Oi, ${PESSOA.primeiro}! Aqui é a ${esc(curta('clinica'))}. Tentamos te ligar agora para marcar a sua avaliação. Quer que a gente ligue às 14h ou prefere marcar por aqui?<span class="au-wa-btns" data-out="w1"><span data-tap="ligar" data-hs="2">Ligar às 14h</span><span>Marcar por aqui</span><span>Falar com a recepção</span></span>`, { time: '10:11', typing: false, hs: '2' })}
      ${out('w1', 'Ligar às 14h', '10:12')}
      ${inn('w1', 'Combinado! A gente liga às 14h. Se mudar de ideia, é só responder por aqui.', { time: '10:12', hs: '3' })}</div>${waCompose()}`) +
    ilha(segVoz.slice(3), 4, ['Encerrada', relogio(duracaoVoz)]));

  /* ---------- 5. RCS: from the search to a verified conversation in iOS Messages, Pix by the PSP link ---------- */
  const grafite = V.skus.find(s => s.id === 'creator15-grafite');
  const pedidoRcs = PEDIDOS['rcs/conversa'];
  const rcsCard = (img, titulo, texto, acoes, cls = '') => `<div class="au-rcs-card${cls ? ' ' + cls : ''}">${img}<span><b>${titulo}</b><small>${texto}</small></span>${acoes.map(([t, tap, hs]) => `<span class="au-rcs-act"${tap ? ` data-tap="${tap}"` : ''}${hs ? ` data-hs="${hs}"` : ''}>${esc(t)}</span>`).join('')}</div>`;
  const rcsChat = () => screen('rcs au', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box" data-hs="1">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed"><span>notebook para edição de vídeo</span></span>${I('close')}${I('mic')}${I('lens')}</div>
      <div class="au-g-sug" data-out="r">${['notebook para edição de vídeo', 'notebook para edição de vídeo 32 gb', 'notebook para edição de vídeo leve', 'notebook para edição de vídeo branco'].map(s => `<span>${I('search')}<b>${esc(s)}</b>${I('arrow')}</span>`).join('')}</div>
      <div class="au-g-res" data-in="r"><div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Shopping</span><span>Imagens</span><span>Vídeos</span></div>
        <div class="cm-g-results"><p class="cm-g-group">Patrocinado</p>
          <div class="cm-g-ad"><div class="cm-g-site">${marca('varejo', 'fav')}<span><b>${esc(nome('varejo'))}</b><small>https://www.${esc(C.varejo.dominio)} › edicao</small></span>${I('vdots')}</div>
          <b class="cm-g-title" data-hs="2">Notebook para edição | ${esc(nome('varejo'))}</b><p>Tire dúvidas por mensagem e pague com Pix pelo link seguro.</p>
          <span class="au-g-chat" data-tap="chat" data-hs="2">${I('comment')}Conversar</span></div>${H.skel(4, 'cm-skel--result')}${H.skel(3, 'cm-skel--result')}</div></div></div>`) +
    scene('chat', 'switch', 'claro', `<div class="au-msg"><span class="cm-crumb" data-out="a3">${I('back')}Google</span><span class="cm-crumb" data-in="a3">${I('back')}${esc(B.nome)}</span><div class="au-msg-head"><span class="au-msg-voltar">${I('back')}</span><span class="au-msg-id">${marca('varejo')}<b>${esc(nome('varejo'))} ${I('check', 'au-verified')}</b></span><span class="au-msg-voltar">${I('phone')}</span></div>
      <div class="au-msg-body"><span class="au-msg-tipo">Mensagem de Texto • RCS</span><span class="au-msg-dia"><b>Hoje</b> 10:09</span>
        <div class="au-rcs-in"><b class="au-who au-who--ia">Assistente virtual</b>${rcsCard(pic('mesaCriador916', { pos: '50% 55%' }), `Oi! Sou a assistente virtual da ${esc(nome('varejo'))}.`, 'Te ajudo a escolher e, se preferir, chamo um vendedor.', [])}</div>
        <p class="au-rcs-out" data-in="a1">Para edição de vídeo</p>
        <div class="au-rcs-in" data-in="a1"><b class="au-who au-who--ia">Assistente virtual</b><p class="au-rcs-txt">Para editar vídeo, estes dois dão conta. O grafite sai hoje; o branco chega em ${ddmm(chega)}.</p></div>
        <div class="au-rcs-row" data-in="a1" data-hs="2">${rcsCard(pic('notebookGrafite11', { pos: '50% 50%' }), `${esc(grafite.nome)} · ${esc(grafite.cor)}`, `32 GB, tela calibrada. ${esc(cap(V.frete))}.`, [['Comprar', 'buy'], ['Detalhes']], 'au-rcs-card--sm')}${rcsCard(pic('notebookBranco11', { pos: '50% 50%' }), `${esc(branco.nome)} · ${esc(branco.cor)}`, `Chega em ${ddmm(chega)}. Avisamos por aqui.`, [['Avise-me'], ['Detalhes']], 'au-rcs-card--sm')}</div>
        <p class="au-rcs-out" data-in="a2">Comprar ${esc(grafite.nome)} ${esc(grafite.cor)}</p>
        <div class="au-rcs-in" data-in="a2" data-out="a3">${rcsCard('', `Pedido ${pedidoRcs}`, `${esc(grafite.nome)}, 32 GB, ${esc(grafite.cor)}<br>Total ${mask} · Pix vence em 30 min`, [['Pagar com Pix', 'pix', '3'], ['Falar com vendedor']], 'au-rcs-card--pedido')}</div>
        <div class="au-rcs-in" data-in="a3" data-hs="3">${rcsCard('', `${I('check', 'cm-i--inline')}Pagamento confirmado`, `Pedido ${pedidoRcs} · ${esc(grafite.nome)} ${esc(grafite.cor)}<span class="au-steps"><i class="is-on">Pago</i><i class="is-on">Separando</i><i>Enviado</i><i>Entregue</i></span>`, [['Acompanhar pedido'], ['Falar com vendedor']], 'au-rcs-card--ok')}</div></div>
      <span class="au-rcs-sug" data-out="a1"><span data-tap="edit" data-hs="2">Para edição de vídeo</span><span>Para jogos</span><span>Falar com vendedor</span></span>
      <div class="au-msg-in">${I('plus')}<span>Mensagem de Texto • RCS</span>${I('mic')}</div></div>`) +
    scene('psp', 'switch', 'claro', `<div class="au-psp"><span class="cm-crumb">${I('back')}Mensagens</span><div class="au-psp-top"><b>${esc(PSP.nome)}</b><small>Pagamento seguro para ${esc(nome('varejo'))}</small></div>
      <div class="au-psp-card"><small>Pedido ${pedidoRcs} · ${esc(grafite.nome)}</small><b class="au-psp-valor">${mask}</b>${qrSvg(pixRcs, 'au-qr')}<span class="au-psp-vence">${I('calendar', 'cm-i--inline')}Pix copia e cola · vence em 30 min</span>${codigo(pixRcs)}
        <span class="cm-btn au-psp-go" data-tap="copy" data-hs="3" data-out="c1">${I('copy')}Copiar código</span><span class="cm-btn au-psp-go au-psp-ok" data-in="c1">${I('check')}Código copiado</span>
        <small class="au-psp-fine">Abra o app do seu banco e escolha Pix copia e cola. A ${esc(curta('varejo'))} confirma por mensagem quando o Pix cair.</small></div></div>${safari(`pix.jatoba.exemplo`)}`) +
    scene('bank', 'switch', 'claro', banco(`<div class="cm-bk-home" data-out="bk1 bk3">${saldo}<span class="cm-bk-atalhos"><span>${I('send')}Pix</span><span>${I('doc')}Pagar</span><span>${I('repost')}Transferir</span><span>${I('tag')}Cartões</span></span></div>
      <div class="cm-bk-achou au-bk-achou" data-out="bk1 bk3"><span class="cm-bk-ico">${I('copy')}</span><b>Encontramos um código Pix copiado</b><small>Pix copia e cola · ${esc(pixRcs.slice(0, 26))}…</small><span class="cm-bk-btn" data-tap="bk-go" data-hs="3">Pagar</span></div>
      <div class="cm-bk-rev au-bk-rev" data-in="bk1" data-out="bk3"><small>Pix copia e cola</small><b class="cm-bk-valor">${mask}</b>${linha('Para', esc(nome('varejo')))}${linha('Instituição', esc(PSP.nome))}${linha('CNPJ', '••.•••.•••/0001-••')}${linha('Quando', `Hoje, ${esc(dataCurta(H.HOJE.iso))}`)}
        <span class="cm-bk-btn" data-tap="bk-ok" data-hs="3">${I('face')}Pagar com Face ID</span></div>${faceId('bk2', 'bk3')}
      ${comprovante({ tok: 'bk3', para: nome('varejo'), quando: '21/10/2026 · 10:11', volta: 'Voltar ao Safari' })}`, 'Safari') +
      banner('ban', { icone: `<i class="au-banner-msg">${I('comment')}</i>`, titulo: nome('varejo'), texto: `Pagamento confirmado. Pedido ${pedidoRcs} em separação.`, tap: 'ban', hs: '3' }) +
      banner('sms', { icone: `<i class="au-banner-msg">${I('comment')}</i>`, titulo: '29017', texto: `${esc(nome('varejo'))}: pagamento confirmado. Pedido ${pedidoRcs} em separação. Acompanhe: ${esc(C.varejo.dominio)}/p/${pedidoRcs}`, tap: 'sms', hs: '3' })) +
    scene('sms', 'switch', 'claro', `<div class="au-msg au-msg--sms"><span class="cm-crumb">${I('back')}${esc(B.nome)}</span><div class="au-msg-head"><span class="au-msg-voltar">${I('back')}</span><span class="au-msg-id"><i class="au-msg-av">${G('pessoa')}</i><b>29017</b></span><span class="au-msg-voltar">${I('info')}</span></div>
      <div class="au-msg-body"><span class="au-msg-tipo">Mensagem de Texto • SMS</span><span class="au-msg-dia"><b>Hoje</b> 10:12</span>
        <p class="au-sms-in" data-hs="3">${esc(nome('varejo'))}: pagamento confirmado. Pedido ${pedidoRcs} em separação. Acompanhe: <u>${esc(C.varejo.dominio)}/p/${pedidoRcs}</u></p>
        <small class="au-msg-nota">Mensagens de remetentes desconhecidos podem ir para o filtro de Desconhecidos.</small></div>
      <div class="au-msg-in">${I('plus')}<span>Mensagem de Texto • SMS</span>${I('mic')}</div></div>`));

  /* ---------- 6. Pix Automático, journey 3: pay the first, authorize the next, the notices, a failed debit ---------- */
  const [c1, c2] = M.cobrancas, falha = M.falha;
  const pixBanco = () => banco(`<div class="cm-bk-home" data-out="bk1 bk3">${saldo}<span class="cm-bk-atalhos"><span>${I('send')}Pix</span><span>${I('doc')}Pagar</span><span>${I('regen')}Automático</span><span>${I('tag')}Cartões</span></span></div>
      <div class="cm-bk-achou au-bk-achou" data-out="bk1 bk3"><span class="cm-bk-ico">${I('regen')}</span><b>Pix com Pix Automático</b><small>Encontramos um código copiado: pagamento agora e autorização das próximas mensalidades.</small><span class="cm-bk-btn" data-tap="bk-go" data-hs="2">Continuar</span></div>
      <div class="cm-bk-rev au-bk-rev au-auth" data-in="bk1" data-out="bk3"><small>Pedido de autorização de Pix Automático</small><b class="au-auth-h">${esc(nome('educacao'))}</b><span class="au-auth-cnpj">CNPJ ••.•••.•••/0001-••</span>
        <span class="au-auth-bloco"><small>Pagamento agora · 1ª mensalidade</small><b>${mask}</b></span>
        ${linha('Objeto', esc(M.objeto))}${linha('Início', `${esc(dataCurta(M.inicio).split(', ')[1])} · Sem data final`)}${linha('Periodicidade', 'Mensal')}${linha('Valor', `${mask} fixo`)}
        <span class="au-field au-auth-max"><small>Valor máximo (opcional)</small><b>${mask}</b></span>
        ${linha('Permite novas tentativas', 'sim')}<span class="au-auth-toggle"><span>Usar limite de crédito se faltar saldo</span><i></i></span>
        <span class="cm-bk-btn" data-tap="auth" data-hs="2">${I('face')}Pagar e autorizar</span></div>${faceId('bk2', 'bk3')}
      ${comprovante({ tok: 'bk3', para: nome('educacao'), quando: '21/10/2026 · 10:12', volta: 'Voltar ao Safari', hs: '2', titulo: 'Pix enviado e Pix Automático autorizado', extra: `<span><small>Recorrência</small><b>RR••••••••</b></span><span><small>Gerenciar</small><b>Pix › Automático</b></span>` })}`, 'Safari');
  const nota = (tok, out2, { titulo, texto, hora = 'agora', icone = bancoIcone, de = B.nome, acoes = '', tap = '', hs = '' }) => `<div class="au-note"${tok ? ` data-in="${tok}"` : ''}${out2 ? ` data-out="${out2}"` : ''}${tap ? ` data-tap="${tap}"` : ''}${hs ? ` data-hs="${hs}"` : ''}><span class="au-note-ico">${icone}</span><span><span class="au-note-top"><b>${esc(de)}</b><small>${hora}</small></span><b class="au-note-t">${esc(titulo)}</b><small>${texto}</small>${acoes}</span></div>`;
  const pixAutoMock = () => screen('pixa au', scene('page', 'base', 'claro', `<div class="au-plan" style="--brand:${C.educacao.cor}"><span class="au-lead-brand">${marca('educacao')}<b>${esc(nome('educacao'))}</b></span>
      <small class="au-plan-k">${esc(E.clube)} · nível ${esc(E.nivel)}</small><b class="au-plan-h" data-hs="1">Pague a 1ª mensalidade e autorize as próximas</b>
      <span class="au-plan-li">${I('check', 'cm-i--inline')}Turma de até 6 alunos, quintas às 19h</span><span class="au-plan-li">${I('check', 'cm-i--inline')}Pausa de um mês quando precisar</span>
      <div class="au-plan-pix">${qrSvg(pixAuto, 'au-qr')}<span><b>Pix Automático</b><small>Você paga agora e autoriza as próximas no app do seu banco. Para cancelar, é lá mesmo.</small></span></div>
      <span class="au-plan-code"><small>Pix copia e cola</small>${codigo(pixAuto)}</span>
      <span class="cm-btn au-lead-go" data-tap="copy" data-hs="1" data-out="c1">${I('copy')}Copiar código</span><span class="cm-btn au-lead-go au-psp-ok" data-in="c1">${I('check')}Código copiado</span>
      <ol class="au-lead-passos"><li><b>1</b>Você paga a 1ª mensalidade agora, no app do seu banco.</li><li><b>2</b>As próximas saem todo dia ${dia(M.inicio)}, a partir de ${esc(dataCurta(M.inicio).split(', ')[1])}, com aviso na véspera.</li><li><b>3</b>Dá para cancelar um pagamento até 23h59 da véspera, ou a autorização inteira, no banco.</li></ol>
      <span class="au-lead-info">${I('location', 'cm-i--inline')}${esc(TERCEIROS.ruas.educacao)} · ${esc(E.horario)}</span></div>${safari(C.educacao.dominio)}`) +
    scene('bank', 'switch', 'claro', pixBanco()) +
    scene('lock', 'fade', 'escuro', `<div class="au-lock"><span class="au-lock-data">${[['a1', 'a2', somaDias(c1, -1)], ['a2', 'a3', c1], ['a3', 'a4', falha.aviso], ['a4', '', falha.iso]].map(([a, b, iso]) => `<small data-in="${a}"${b ? ` data-out="${b}"` : ''}>${esc(dataLonga(iso))}</small>`).join('')}</span>
      <span class="au-lock-hora">${[['a1', 'a2', '19:05'], ['a2', 'a3', '08:02'], ['a3', 'a4', '19:10'], ['a4', '', '08:04']].map(([a, b, h]) => `<b data-in="${a}"${b ? ` data-out="${b}"` : ''}>${h}</b>`).join('')}</span>
      <div class="au-lock-notas">
        ${nota('a1', 'a2', { titulo: 'Pix Automático amanhã', texto: `${mask} para ${esc(nome('educacao'))}, ${esc(dataLonga(c1))}.`, hs: '2' })}
        ${nota('a2', 'a3', { titulo: 'Pix Automático pago', texto: `${mask} para ${esc(nome('educacao'))}. O comprovante está no app.`, hora: '07:41' })}
        ${nota('a3', 'a4', { titulo: 'Pix Automático amanhã', texto: `${mask} para ${esc(nome('educacao'))}, ${esc(dataLonga(c2))}.`, acoes: `<span class="au-note-acoes"><span data-tap="cancela" data-hs="3">${esc(falha.cancelar)}</span><span>Ver no app</span></span>` })}
        ${nota('a4', '', { titulo: 'Pix Automático não realizado', texto: `Saldo insuficiente para ${esc(nome('educacao'))}. A escola pode tentar de novo nos próximos dias.`, hora: '07:58' })}
        ${nota('a4', '', { titulo: nome('educacao'), de: 'WhatsApp', icone: `<i class="au-banner-wa">${waIcon}</i>`, texto: `Oi, ${PESSOA.primeiro}! O Pix Automático de dezembro não passou. Posso ajudar?`, tap: 'wa', hs: '3' })}
      </div><span class="au-lock-pe"><i>${G('lanterna')}</i><i>${I('camera')}</i></span></div>`) +
    scene('cancela', 'switch', 'claro', banco(`<div class="cm-bk-rev au-bk-rev" data-out="x1"><small>Pix Automático · ${esc(nome('educacao'))}</small><b class="au-auth-h">Cancelar este pagamento?</b>
        ${linha('Data', esc(cap(dataLonga(c2))))}${linha('Valor', mask)}${linha('Recebedor', esc(nome('educacao')))}
        <p class="au-bk-nota">${I('info', 'cm-i--inline')}A autorização continua ativa. Só o pagamento de ${ddmm(c2)} não será feito.</p>
        <span class="cm-bk-btn au-bk-btn--perigo" data-tap="cx" data-hs="3">Cancelar pagamento</span><span class="au-bk-link">Manter pagamento</span></div>
      <div class="cm-bk-ok" data-in="x1" data-hs="3"><span class="cm-bk-check">${I('check')}</span><b>Pagamento cancelado</b><small>${esc(nome('educacao'))} · ${esc(dataCurta(c2))}. O Pix Automático segue autorizado.</small><span class="cm-bk-volta">${I('regen')}Ver em Pix › Automático</span></div>`)) +
    scene('wa', 'push', 'claro', `${waHead('educacao')}<div class="cm-wa-body">${waMeta}<span class="cm-wa-day">${esc(cap(dataCurta(c2)))}</span>
      ${inn('', `Oi, ${PESSOA.primeiro}! O Pix Automático de dezembro não passou por saldo. Quer tentar de novo amanhã ou pausar um mês sem perder a vaga?<span class="au-wa-btns" data-out="w1"><span>Tentar amanhã</span><span data-tap="pause" data-hs="3">Pausar 1 mês</span><span>Falar com a escola</span></span>`, { time: '08:15', typing: false, cls: 'au-ret', hs: '3' }).replace('class="cm-wa-in', 'data-out="x2" class="cm-wa-in')}
      ${inn('x2', `Oi, ${PESSOA.primeiro}! Vimos que você cancelou o Pix Automático de ${ddmm(c2)}. Sua vaga de quinta continua reservada. Quer pausar dezembro?<span class="au-wa-btns" data-out="x3"><span data-tap="pause2" data-hs="3">Pausar 1 mês</span><span>Pagar por Pix agora</span><span>Falar com a escola</span></span>`, { time: '08:20', typing: false })}
      ${out('w1', 'Pausar 1 mês', '08:16')}${out('x3', 'Pausar 1 mês', '08:21')}
      ${inn('w1', `Pausado. Sua vaga de quinta às 19h continua reservada e a cobrança volta em ${esc(dataCurta(M.retomada))}.`, { time: '08:16', hs: '3' })}
      ${inn('x3', `Pausado. Sua vaga de quinta às 19h continua reservada e a cobrança volta em ${esc(dataCurta(M.retomada))}.`, { time: '08:21', hs: '3' })}
      ${sys('w1', `${I('regen', 'cm-i--inline')}Assinatura pausada até janeiro`)}${sys('x3', `${I('regen', 'cm-i--inline')}Assinatura pausada até janeiro`)}</div>${waCompose()}`));

  /* ---------- 7. E-mail: the sequence after the guide in iOS Mail, the meeting booked, the sequence ends ---------- */
  const [g0, g3, g9] = FI.regua, cv = FI.conversa;
  const mailRow = (cls, extra, html) => `<div class="au-mail-row${cls ? ' ' + cls : ''}"${extra}>${html}</div>`;
  const valoreRow = (assunto, previa, quando, attrs = '', cls = '') => mailRow(cls, attrs, `${marca('financas')}<span><b>${esc(nome('financas'))}</b><strong>${esc(assunto)}</strong><small>${esc(previa)}</small></span><small>${esc(quando)}</small>`);
  const vizinho = ({ nome: n, assunto }, quando, previa) => mailRow('au-mail-row--old', '', `${H.avatar(n, 'au-mail-av')}<span><b>${esc(n)}</b><strong>${esc(assunto)}</strong><small>${esc(previa)}</small></span><small>${esc(quando)}</small>`);
  const [condo, caderno, escola] = TERCEIROS.caixa;
  const emailRegua = () => screen('mailbox au', scene('inbox', 'base', 'claro', `<div class="cm-safe au-mail"><div class="au-mail-top">${I('back')}<span>Caixas</span><b>Editar</b></div><b class="au-mail-h">Caixa de Entrada</b>
      <span class="au-mail-busca">${I('search')}Buscar${I('mic')}</span>
      <div class="au-mail-cats"><span>${G('pessoa')}</span><span>${G('carrinho')}</span><span class="is-on">${G('megafone')}<b>Atualizações</b></span><span>${I('tag')}</span></div>
      <div class="au-mail-lista">
        ${valoreRow('Marina, quer revisar o seu caso em 30 minutos?', 'Separei três horários na próxima semana…', g9.hora.replace(/^0/, ''), ' data-in="a2" data-tap="open" data-hs="2"', 'au-mail-row--new')}
        ${vizinho(condo, 'Ontem', 'Pauta, horário e o modelo de procuração…')}
        ${vizinho(caderno, 'sáb', 'O que decidir antes de passar a empresa adiante…')}
        ${valoreRow('Três perguntas antes de separar o patrimônio', 'A segunda costuma mudar a decisão…', cap(dataCurta(g3.iso).slice(0, 3)), ' data-in="a1" data-hs="2"')}
        ${vizinho(escola, '14/10/26', 'Os horários de quinta e a pauta da reunião…')}
        ${valoreRow('Seu guia chegou', `${FI.guia.titulo}, em PDF…`, `${ddmm(g0.iso)}/26`, ' data-hs="1"')}</div>
      <div class="au-mail-pe">${G('filtro')}<span>Atualizado agora</span>${I('edit')}</div></div>`) +
    scene('open', 'push', 'claro', `<div class="cm-safe au-mail au-mail-open"><div class="au-mail-top">${I('back')}<span>Atualizações</span>${I('vdots')}</div>
      <span class="au-mail-lista-aviso" data-out="u2">Esta mensagem é de uma lista de e-mails. <u data-tap="unsub" data-hs="2">Cancelar inscrição</u></span><span class="au-mail-lista-aviso au-mail-lista-aviso--ok" data-in="u2">${I('check', 'cm-i--inline')}Inscrição cancelada. ${esc(nome('financas'))} vai parar de enviar.</span>
      <b class="au-mail-subj" data-hs="2">Marina, quer revisar o seu caso em 30 minutos?</b><span class="au-mail-from">${marca('financas')}<span><b>${esc(nome('financas'))}</b><small>para mim · ${g9.hora.replace(/^0/, '')}</small></span></span>
      <p>${esc(PESSOA.primeiro)}, você leu o guia e as três perguntas. O próximo passo costuma ser olhar o seu caso com calma.</p><p>Uma conversa de 30 minutos, por vídeo, com um especialista em sucessão. Sem compromisso e sem oferta de produto. Separei três horários:</p>
      <span class="au-mail-horas">${[[cv.iso, cv.hora], [somaDias(cv.iso, 1), '15:00'], [somaDias(cv.iso, 3), '09:00']].map(([d, h]) => `<span>${esc(cap(dataCurta(d)))} · ${h}</span>`).join('')}</span>
      <span class="cm-btn au-mail-cta" data-tap="cta" data-hs="3" style="background:${C.financas.cor}">Agendar conversa</span>
      <p class="au-mail-ass">Até breve,<br>Equipe ${esc(curta('financas'))}</p><small class="au-mail-foot">${esc(nome('financas'))} · ${esc(TERCEIROS.ruas.financas)}<br>${esc(LEGAL.financas)}<br>Você recebe porque baixou o guia. <u>Cancelar inscrição</u></small>
      <div class="au-alerta" data-in="u1" data-out="u2"><b>Cancelar inscrição?</b><small>O Mail vai pedir a ${esc(nome('financas'))} que pare de enviar mensagens para ${esc(PESSOA.email)}.</small><span data-tap="unsub-ok" data-hs="2">Cancelar Inscrição</span><span>Agora Não</span></div></div>`) +
    scene('page', 'push', 'claro', `<span class="cm-crumb">${I('back')}Mail</span>${SITES.arrimo()}${safari(C.financas.dominio)}`, 'cm-scene--web'));

  /* ---------- 8. Telegram: the community group, a message only she sees, the miniapp, Stars, the class group ---------- */
  const ate = somaDias(H.HOJE.iso, 30);
  const tgHead = (titulo, sub) => `<div class="au-tg-head"><span class="au-tg-voltar">${I('back')}</span><span class="au-tg-titulo"><b>${esc(titulo)}</b><small>${esc(sub)}</small></span>${marca('educacao', 'circulo', 'au-tg-av')}</div>`;
  const tgClube = () => screen('tg au', scene('chat', 'base', 'claro', `<div class="au-tg">${tgHead(`Clube ${curta('educacao')}`, 'grupo')}
      <div class="au-tg-body">
        <div class="au-tg-msg au-tg-post" data-hs="1"><b class="au-tg-name">${esc(curta('educacao'))}</b>${pic('fonesCor45', { alt: 'Fones de ouvido coloridos sobre a mesa.', pos: '50% 45%' })}<p>Desafio da semana: complete a frase.<br><b>I'm looking forward ___ it.</b></p><small>10:00</small></div>
        <span class="au-tg-kb"><span data-tap="reply" data-hs="1">Responder</span><span>Regras ↗</span></span>
        <div class="au-tg-msg"><b class="au-tg-name au-tg-name--2">${esc(TERCEIROS.comentaristas[1])}</b><p>Esse eu sempre erro.</p><small>10:04</small></div>
        <div class="au-tg-eph" data-in="a1" data-hs="2"><span class="au-tg-badge">${I('lock', 'cm-i--inline')}Visível só para você</span><p data-out="a2">Escolha a palavra que falta:<br><b>I'm looking forward ___ it.</b></p><p data-in="a2"><b>Certo!</b> Seu nível é ${esc(E.nivel)}. Quer praticar às quintas no clube de conversação?</p><small><span data-in="a2">editada </span>10:09</small></div>
        <span class="au-tg-kb" data-in="a1" data-out="a2"><span>for</span><span data-tap="to" data-hs="2">to</span><span>at</span></span>
        <span class="au-tg-kb" data-in="a2" data-out="a3"><span data-tap="plan" data-hs="2">Ver o plano ↗</span></span>
        <div class="au-tg-eph au-tg-eph--ok" data-in="a3" data-hs="3"><span class="au-tg-badge">${I('lock', 'cm-i--inline')}Visível só para você</span><p><b>Assinatura ativa até ${ddmm(ate)}.</b> Seu convite para a turma de quinta, de uso único:</p><small>10:11</small></div>
        <span class="au-tg-kb" data-in="a3"><span data-tap="join" data-hs="3">Entrar no grupo ↗</span></span></div>
      <div class="au-tg-in">${I('plus')}<span>Mensagem</span>${I('mic')}</div></div>`) +
    scene('mini', 'sheet', 'claro', `<div class="au-mini"><div class="au-mini-top"><b>Fechar</b><span>${esc(curta('educacao'))}</span>${I('dots')}</div>
      <div class="au-mini-body" style="--brand:${C.educacao.cor}">${marca('educacao', 'app')}<b class="au-plan-h">Clube de conversação · nível ${esc(E.nivel)}</b>
        <span class="au-plan-li">${I('check', 'cm-i--inline')}Turma de até 6 pessoas, por vídeo</span><span class="au-plan-li">${I('check', 'cm-i--inline')}Desafios no grupo e correção de áudio</span><span class="au-plan-li">${I('check', 'cm-i--inline')}Cancele quando quiser em Ajustes › Estrelas</span>
        <span class="au-mini-agenda"><b>Agenda das quintas</b><span><small>19:00</small>Conversação ${esc(E.nivel)} · 30 min</span><span><small>19:40</small>Pronúncia, em dupla · 20 min</span><span><small>20:10</small>Plantão de dúvidas no grupo</span></span>
        <span class="au-mini-preco">${xtr} por mês</span></div>
      <span class="au-mini-go" data-tap="sub" data-hs="3" data-out="s1">Assinar por ${xtr} / mês</span>
      <div class="au-stars" data-in="s1" data-out="s4"><span class="cm-grabber"></span><b>${xtr} Estrelas Necessárias</b><small>Compre Estrelas para assinar o Clube de conversação.</small>
        ${[['••••', '••••'], ['••••', '••••'], ['••••', '••••']].map((_, i) => `<span class="au-stars-pack"${i === 0 ? ' data-tap="pack" data-hs="3"' : ''}><i aria-hidden="true">★</i><b>•••• Estrelas</b><small>${mask}</small></span>`).join('')}<small class="au-stars-fine">Saldo: <i aria-hidden="true">★</i> ••</small></div>
      <div class="au-loja-ios" data-in="s2" data-out="s4"><b>Compra no App</b><span class="au-loja-ios-item">${logoSvg('telegram', { altura: 40, classe: 'au-loja-ios-ico' })}<span><b>•••• Estrelas</b><small>Telegram · Compra no app</small></span></span>
        <span class="au-row"><small>Conta</small><b>marina.alves@•••</b></span><span class="au-row"><small>Valor</small><b>${mask}</b></span>
        <span class="au-loja-ios-go" data-out="s3" data-tap="buy" data-hs="3"><i>${I('face')}</i>Clique duas vezes para pagar</span><span class="au-loja-ios-ok" data-in="s3">${I('check')}Concluído</span></div>
      <div class="au-stars au-stars--sub" data-in="s4" data-out="ok"><span class="cm-grabber"></span><small class="au-stars-saldo">Saldo <i aria-hidden="true">★</i> ••••</small>${marca('educacao', 'circulo', 'au-stars-av')}<b>Assinar</b>
        <small>Deseja assinar <b>Clube de conversação</b> em <b>${esc(curta('educacao'))}</b> por ${xtr} por mês?</small><span class="au-mini-go" data-tap="pay" data-hs="3">Assinar por ${xtr} / mês</span><small class="au-stars-fine">Ao se inscrever, você aceita os Termos de Serviço.</small></div>
      <div class="au-stars au-stars--ok" data-in="ok"><span class="cm-done-check">${I('check')}</span><b class="au-stars-ok" data-hs="3">Assinatura concluída!</b><small>Tudo certo! Volte ao chat para entrar no grupo.</small><span class="au-mini-go" data-tap="back">Voltar ao chat</span></div></div>`, 'cm-scene--part') +
    scene('turma', 'push', 'claro', `<div class="au-tg">${tgHead(`Turma de quinta · ${curta('educacao')}`, 'grupo')}
      <div class="au-tg-body"><span class="au-tg-svc">${esc(PESSOA.primeiro)} entrou no grupo pelo link de convite</span>
        <div class="au-tg-eph au-tg-eph--boas" data-hs="3"><span class="au-tg-badge">${I('lock', 'cm-i--inline')}Visível só para você</span><p><b>Boas-vindas, ${esc(PESSOA.primeiro)}!</b> Aqui a gente pratica inglês toda quinta.</p>
          <ul class="au-tg-regras"><li>Fale em inglês, mesmo com erro</li><li>Áudio de até 1 minuto</li><li>Nada de correção em público sem pedir</li></ul>
          <p class="au-tg-agenda"><b>Quinta, ${dia('2026-10-22')}/10</b> · 19:00 conversação · 19:40 pronúncia</p><small>10:12</small></div>
        <span class="au-tg-kb"><span>Regras</span><span>Agenda ↗</span></span></div>
      <div class="au-tg-in">${I('plus')}<span>Mensagem</span>${I('mic')}</div></div>`));

  const mocks = { waAgente, waChamada, igDirect, vozIA, rcsChat, pixAuto: pixAutoMock, emailRegua, tgClube };
  const SCREEN = { waAgente: { tema: 'escuro', fundo: '#0c1014' }, igDirect: { tema: 'escuro', fundo: '#000' } };

  /* ---------- Storyboards ---------- */
  const agenteBase = [
    { ms: 1500, cena: 'ad', desc: `Anúncio da ${curta('turismo')} no Instagram: Festa do Divino em grupo pequeno, em Pirenópolis.`, log: [ev('10:08:41', 'Anúncio', 'Anúncio de clique para o WhatsApp entregue', 'campanha festa-do-divino · objetivo conversas', 'anuncio', { ad_id: '••••' })] },
    { ms: 1600, cena: 'ad', estado: 'open lit', desc: 'A legenda convida a montar o orçamento da família pela conversa. O botão acende.' },
    { ms: 900, cena: 'ad', estado: 'open lit', toque: 'cta', desc: 'Toque em Enviar mensagem pelo WhatsApp.', log: [ev('10:08:55', 'Anúncio', 'Clique no botão do anúncio', 'abre o WhatsApp com a mensagem pronta', 'anuncio', { 'referral.source_type': 'ad' })] },
    { ms: 1500, cena: 'chat', hora: '10:09', desc: 'A conversa abre com a prévia do anúncio e a mensagem pronta no campo.' },
    { ms: 900, cena: 'chat', toque: 'send', desc: 'Toque em enviar.' },
    { ms: 1500, cena: 'chat', estado: 'a1', desc: 'A mensagem sai com a citação do anúncio.', log: [ev('10:09:02', 'WhatsApp', 'Mensagem recebida com referral', 'a conversa veio do anúncio', 'webhook', { 'referral.ctwa_clid': '••••', from: 'mascarado' }), ev('10:09:02', 'Sistema', 'Janela gratuita aberta', 'conversa iniciada por anúncio: até 7 dias', 'sistema', { janela: 'FEP 7 dias' })] },
    { ms: 2000, cena: 'chat', estado: 'a1 a2', desc: 'A assistente virtual se apresenta como inteligência artificial e pergunta quem vai viajar.', log: [ev('10:09:05', 'Agente IA', 'Intenção identificada', 'pacote da Festa do Divino', 'ia', { intencao: 'pacote_festa', confianca: 'alta' }), ev('10:09:06', 'Agente IA', 'Apresenta-se como assistente virtual', 'e oferece uma consultora', 'ia')] },
    { ms: 2000, cena: 'chat', estado: 'a1 a2 a3', hora: '10:10', desc: `${PESSOA.primeiro} responde: ela, o marido e os dois filhos, de 8 e 2 anos, em maio.`, log: [ev('10:10:01', 'Agente IA', 'Ferramenta: buscar_saidas', '2 saídas com vaga', 'ferramenta', { mes: 'maio de 2027', viajantes: '2 adultos, 2 crianças' })] },
    { ms: 1900, cena: 'chat', estado: 'a1 a2 a3 a4', desc: 'A assistente oferece montar o orçamento num formulário dentro do WhatsApp.', log: [ev('10:10:04', 'WhatsApp', 'Flow enviado', 'formulário Montar orçamento', 'webhook', { flow: 'orcamento', modo: 'data_exchange' })] },
    { ms: 900, cena: 'chat', estado: 'a1 a2 a3 a4', toque: 'flow', desc: 'Toque em Montar orçamento.' },
    { ms: 1500, cena: 'flow', desc: `O formulário abre sobre a conversa: duas saídas em maio, ${dataCurta(s1.ida)} e ${dataCurta(s2.ida)}.` },
    { ms: 900, cena: 'flow', toque: 'fo', desc: `Toque na saída de ${dataCurta(s1.ida)}, com as cavalhadas de domingo a terça.` },
    { ms: 1100, cena: 'flow', estado: 'f1', desc: 'A saída fica marcada, com 2 adultos e 2 crianças.' },
    { ms: 900, cena: 'flow', estado: 'f1', toque: 'fnext', desc: 'Toque em Continuar.', log: [ev('10:10:31', 'WhatsApp', 'Flow: troca de dados', 'saída validada no servidor', 'webhook', { saida: dataCurta(s1.ida), vagas: 'confirmadas' })] },
    { ms: 1500, cena: 'flow', estado: 'f1 f2', desc: 'Idades das crianças, 8 e 2 anos, e a dúvida para a consultora: a de 2 anos vai no colo?' },
    { ms: 900, cena: 'flow', estado: 'f1 f2', toque: 'fsend', desc: 'Toque em Enviar.' },
    { ms: 2300, cena: 'chat', estado: 'a1 a2 a3 a4 a5', hora: '10:11', desc: 'O orçamento volta para a conversa. A dúvida é de tarifa, então a assistente chama a consultora.', log: [ev('10:11:02', 'Agente IA', 'Confiança abaixo do limite', 'tarifa infantil fica com uma pessoa', 'ia', { motivo: 'tarifa' }), ev('10:11:03', 'WhatsApp', 'Conversa passada para as consultoras', 'roteamento com resumo gerado por IA', 'sistema', { acao: 'pass', fila: 'consultoras' }), ev('10:11:20', 'Humano', `${T.consultora} assume a conversa`, 'lê o resumo antes de responder', 'pessoa', null, { bastidor: { titulo: 'Bastidor · o que a consultora recebe', texto: `Família de 4 (2 adultos; crianças de 8 e 2 anos), Festa do Divino, saída de ${periodo(s1)}. Dúvida: a de 2 anos vai no colo? Veio do anúncio. Resumo gerado por IA.` } })] },
    { ms: 2400, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6', hora: '10:12', desc: `${T.consultora} responde pelo nome: com 2 anos completos, a criança ocupa assento; no colo, só até 1 ano e 11 meses.`, log: [ev('10:12:05', 'Humano', `${T.consultora} responde a dúvida`, 'a cliente não repete nada', 'pessoa'), ev('10:12:06', 'CRM', 'Negócio criado', 'etapa orçamento · origem anúncio', 'crm', { etapa: 'orçamento' })] },
    { ms: 2200, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7', desc: 'Chega a pré-reserva: 4 viajantes, o sinal e o botão Pagar com Pix.', log: [ev('10:12:30', 'PSP', 'Cobrança Pix criada', 'válida por 30 minutos', 'pagamento', { txid: '••••', expiracao: '1800 s' }), ev('10:12:31', 'WhatsApp', 'Pedido com Pix enviado', 'abre o app do banco', 'webhook', { tipo: 'order_details', flow_type: 'APPSWITCH' })] },
    { ms: 900, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7', toque: 'pay', desc: 'Toque em Pagar com Pix.' },
    { ms: 1500, cena: 'pay', desc: `A lista de bancos, com busca e a opção de copiar o código. O ${B.nome} aparece primeiro.` },
    { ms: 900, cena: 'pay', toque: 'bank', desc: `Toque em ${B.nome}.` },
    { ms: 1500, cena: 'pay', estado: 'b1', desc: 'No primeiro pagamento, o CPF e os termos de pagamentos do WhatsApp, uma vez só.' },
    { ms: 900, cena: 'pay', estado: 'b1', toque: 'cpf', desc: 'Toque em Continuar.' },
    { ms: 1500, cena: 'pay', estado: 'b1 b2', desc: `Revisão: pré-reserva, total, ${B.nome} e o recebedor.` },
  ];
  const agente = [...agenteBase,
    { ms: 900, cena: 'pay', estado: 'b1 b2', toque: 'bgo', desc: `Toque em Ir para o ${B.nome}.` },
    { ms: 1700, cena: 'bank', estado: 'bk1', hora: '10:13', desc: 'O app do banco abre já na confirmação, com o saldo e o limite Pix do dia.' },
    { ms: 900, cena: 'bank', estado: 'bk1', toque: 'bk-ok', desc: 'Toque em Pagar com Face ID.' },
    { ms: 1200, cena: 'bank', estado: 'bk1 bk2', desc: 'O Face ID confirma que é ela.' },
    { ms: 1900, cena: 'bank', estado: 'bk3', desc: 'O comprovante de Pix, com o ID da transação e as duas instituições.', log: [ev('10:13:08', 'PSP', 'Webhook pix recebido', 'txid conferido com a cobrança', 'webhook', { txid: '••••', endToEndId: 'E2E••••' })] },
    { ms: 900, cena: 'bank', estado: 'bk3', toque: 'volta', desc: 'Toque em Voltar ao WhatsApp.' },
    { ms: 2400, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 a8', desc: 'A pré-reserva aparece paga e a consultora confirma. O roteiro vai por e-mail.', log: [ev('10:13:12', 'WhatsApp', 'Status do pedido atualizado', 'pago, conferido no PSP', 'pagamento', { order_status: 'processing' }), ev('10:13:13', 'Meta CAPI', 'Evento Purchase enviado', 'a campanha aprende com quem pagou', 'sinal', { action_source: 'business_messaging', ctwa_clid: '••••', event_id: '••••' }), ev('10:13:14', 'CRM', 'Etapa: pré-reserva paga', 'roteiro e documentos por e-mail', 'crm')] },
  ];
  const agenteFalha = [...agenteBase,
    { ms: 900, cena: 'pay', estado: 'b1 b2', toque: 'fechar', desc: `${PESSOA.primeiro} fecha a revisão sem pagar.` },
    { ms: 1600, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7', desc: 'A pré-reserva continua na conversa, com o código válido por 30 minutos.', log: [ev('10:12:52', 'Sistema', 'Pagamento pendente', 'lembrete só se o código expirar', 'sistema', { expira: '10:42' })] },
    { ms: 2400, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 x1', hora: '10:42', desc: 'Meia hora depois, o código expira e fica desabilitado. A assistente manda um novo para a mesma pré-reserva.', log: [ev('10:42:31', 'PSP', 'Cobrança expirou sem pagamento', 'expirada também no PSP', 'webhook', { status: 'REMOVIDA_PELO_USUARIO_RECEBEDOR' }), ev('10:42:32', 'Agente IA', 'Reenvia a cobrança', 'novo txid, mesma pré-reserva', 'retentativa', { txid: '••••' })] },
    { ms: 900, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 x1', toque: 'pay2', desc: 'Toque em Pagar com Pix no código novo.' },
    { ms: 1300, cena: 'pay', estado: 'b1 b2', desc: `A revisão já vem com o ${B.nome}: o CPF não é pedido de novo.` },
    { ms: 900, cena: 'pay', estado: 'b1 b2', toque: 'bgo', desc: `Toque em Ir para o ${B.nome}.` },
    { ms: 1500, cena: 'bank', estado: 'bk1', hora: '10:43', desc: 'O banco abre na confirmação do código novo.' },
    { ms: 900, cena: 'bank', estado: 'bk1', toque: 'bk-ok', desc: 'Toque em Pagar com Face ID.' },
    { ms: 1100, cena: 'bank', estado: 'bk1 bk2', desc: 'O Face ID confirma.' },
    { ms: 1800, cena: 'bank', estado: 'bk3', desc: 'O comprovante do Pix.', log: [ev('10:43:06', 'PSP', 'Webhook pix recebido', 'segundo código, primeiro pagamento', 'webhook', { txid: '••••' }), ev('10:43:07', 'PSP', 'Webhook duplicado descartado', 'mesmo txid, ignorado', 'webhook', { idempotencia: 'já processado' })] },
    { ms: 900, cena: 'bank', estado: 'bk3', toque: 'volta', desc: 'Toque em Voltar ao WhatsApp.' },
    { ms: 2400, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 x1 x2', desc: 'O código antigo segue expirado, o novo aparece pago e a consultora confirma uma cobrança só.', log: [ev('10:43:10', 'WhatsApp', 'Status do pedido atualizado', 'um pedido, um pagamento', 'pagamento', { order_status: 'processing' }), ev('10:43:11', 'Meta CAPI', 'Evento Purchase enviado uma vez', 'event_id evita contar em dobro', 'sinal', { event_id: '••••' })] },
  ];

  const segFrames = (segs, n0, extra = {}) => segs.map((seg, i) => turno(seg, n0 + i, { q: { cena: 'call', desc: '', ...extra } }));
  const chamada = [
    { ms: 1800, cena: 'chat', desc: `Na conversa com a ${curta('automotivo')}, a assistente virtual pede para ligar pelo WhatsApp.`, log: [ev('10:08:20', 'WhatsApp', 'Pedido de permissão de chamada', 'mensagem interativa dentro das 24 h', 'permissao', { limite: '1 por dia, 2 por semana' })] },
    { ms: 900, cena: 'chat', toque: 'allow', desc: 'Toque em Permitir por 7 dias.' },
    { ms: 1500, cena: 'chat', estado: 'a1', desc: 'Chamadas permitidas por 7 dias. Ela pode mudar isso nos dados da conversa.', log: [ev('10:08:31', 'WhatsApp', 'Permissão concedida', 'temporária', 'permissao', { validade: '7 dias', revoga: 'após 4 não atendidas' })] },
    { ms: 1700, cena: 'ring', hora: '10:09', desc: `O iPhone toca: ${nome('automotivo')}, WhatsApp Áudio, com Recusar e Aceitar.`, log: [ev('10:09:02', 'Telefonia', 'Chamada iniciada pela empresa', 'agente de voz conectado por SIP', 'turno', { destino: PESSOA.telefone })] },
    { ms: 900, cena: 'ring', toque: 'accept', desc: 'Toque em Aceitar.' },
    { ms: 1300, cena: 'call', estado: 'c0', desc: 'Conectando. A chamada é criptografada de ponta a ponta.' },
    ...segFrames(segChamada, 1),
    { ms: 1600, cena: 'call', estado: 'fim', desc: `Chamada encerrada, depois de ${relogio(duracaoChamada)}.` },
    { ms: 2600, cena: 'chat', estado: 'a1 a2', hora: '10:12', desc: `Na conversa, o registro da chamada e a confirmação escrita do ${AU.consultor}.`, log: [ev('10:11:48', 'CRM', 'Resumo e transcrição salvos', 'próximo passo: test drive', 'crm', { gravacao: 'avisada no início' }), ev('10:11:50', 'Meta CAPI', 'Evento Schedule enviado', 'origem: conversa do WhatsApp', 'sinal', { action_source: 'business_messaging' })] },
  ];
  // Turn frames: description, log and the dot.
  const [cIa1, cEu1, cIa2, cEu2, cIa3, cEsp, cRafa] = chamada.slice(6, 13);
  Object.assign(cIa1, { desc: 'A assistente se apresenta como inteligência artificial e avisa que a ligação é gravada.', log: [ev('10:09:06', 'Agente IA', 'Abre a ligação se identificando', 'avisa a gravação', 'turno', { ia: 'declarada', gravacao: 'avisada' })] });
  Object.assign(cEu1, { desc: `${PESSOA.primeiro} pede sábado de manhã. O cronômetro conta a ligação.` });
  Object.assign(cIa2, { desc: `A assistente oferece ${horaFala(td.hora)} ou ${horaFala(td.alternativa)} e pergunta se ela quer um consultor.`, log: [ev('10:09:26', 'Agente IA', 'Ferramenta: agenda_test_drive', '2 horários', 'ferramenta', { dia: dataCurta(td.iso), unidade: td.unidade })] });
  Object.assign(cEu2, { desc: `Ela escolhe ${horaFala(td.hora)} e quer entender a recarga.` });
  Object.assign(cIa3, { desc: `A assistente avisa que vai passar para o ${AU.consultor}, com o resumo.`, log: [ev('10:09:41', 'Agente IA', 'Transferência com contexto', 'resumo enviado ao consultor', 'pessoa', { sip: 'REFER' }, { bastidor: { titulo: 'Bastidor · o que o consultor recebe', texto: `${PESSOA.nome} quer test drive do ${AU.modelo} em ${dataCurta(td.iso)}, ${td.hora}, loja ${td.unidade}. Quer entender a recarga em casa. Resumo gerado por IA.` } })] });
  Object.assign(cEsp, { desc: `Transferindo para ${AU.consultor}: a onda para enquanto a ligação espera.`, log: [ev('10:09:45', 'Humano', `${AU.consultor} aceita a transferência`, 'já com o resumo na tela', 'pessoa')] });
  Object.assign(cRafa, { desc: `${AU.consultor} assume, confirma ${dataCurta(td.iso)} às ${horaFala(td.hora)} e promete mostrar a recarga.`, log: [ev('10:10:02', 'Agenda', 'Test drive agendado', 'confirmado pelo consultor', 'agenda', { quando: `${dataCurta(td.iso)} ${td.hora}`, unidade: td.unidade })] });

  const direct = [
    { ms: 1600, cena: 'reel', video: 1, desc: `Reel da ${curta('varejo')}: o ${branco.nome} ${branco.cor} chega em ${ddmm(chega)}. Comente BRANCO e receba o aviso.`, log: [ev('10:09:10', 'Anúncio', 'Reel com pedido de comentário', 'palavra-chave BRANCO', 'anuncio', { formato: 'prompt de comentário' })] },
    { ms: 900, cena: 'reel', estado: 'lit', video: 1, toque: 'cmt', desc: 'Toque em Comente BRANCO.' },
    { ms: 1500, cena: 'comments', desc: 'Os comentários abrem com BRANCO já digitado.' },
    { ms: 900, cena: 'comments', toque: 'csend', desc: 'Toque em Publicar.' },
    { ms: 1800, cena: 'comments', estado: 'a1', hora: '10:10', desc: `O comentário aparece e a loja responde em público: o aviso vai pelo Direct.`, log: [ev('10:10:03', 'Instagram', 'Webhook de comentário', 'palavra-chave em qualquer cópia do anúncio', 'webhook', { field: 'comments', texto: 'BRANCO' })] },
    { ms: 2000, cena: 'dm', desc: `No Direct, a mensagem explica o que é e pergunta se ela quer entrar na lista.`, log: [ev('10:10:05', 'Automação', 'Resposta privada ao comentário', 'uma mensagem por comentário', 'sistema', { private_reply: 'comment_id ••••' })] },
    { ms: 900, cena: 'dm', toque: 'join', desc: 'Toque em Entrar na lista.' },
    { ms: 1800, cena: 'dm', estado: 'd1', desc: 'Pronto, ela está na lista. O aviso vai uma vez só, por aqui.', log: [ev('10:10:11', 'Sistema', 'Janela de conversa aberta', 'a resposta dela abre 24 h', 'sistema', { janela: '24 h' }), ev('10:10:12', 'CRM', 'Contato na lista de espera', `${branco.nome} ${branco.cor}`, 'crm', { origem: 'comentário no anúncio' })] },
    { ms: 900, cena: 'dm', estado: 'd1', toque: 'yes', desc: 'Toque em Combinado.' },
    { ms: 1400, cena: 'dm', estado: 'd1 d2', desc: 'Combinado, sem outras mensagens até a chegada.' },
    { ms: 2400, cena: 'dm', estado: 'd1 d2 d3', hora: '18:40', desc: `${cap(dataCurta(chega))}, 18:40: o branco chegou e um está separado para ela até o dia seguinte.`, log: [ev('18:40:00', 'CRM', 'Estoque atualizado dispara o aviso', 'com a etiqueta de atualização', 'crm', { tag: 'POST_PURCHASE_UPDATE' }, { dia: chega }), ev('18:40:02', 'Meta CAPI', 'Evento Lead com origem no comentário', 'event_id para deduplicação', 'sinal', { event_id: '••••' }, { dia: chega })] },
    { ms: 900, cena: 'dm', estado: 'd1 d2 d3', toque: 'buy', desc: 'Toque em Comprar agora.' },
    { ms: 2300, cena: 'loja', desc: `A loja abre com o ${branco.nome} reservado para ela por 24 horas, entrega e pagamento.`, log: [ev('18:41:15', 'Site', 'Checkout com reserva', 'reservado até o dia seguinte, 18:40', 'sistema', { reserva: '24 h', origem: 'Direct' }, { dia: chega })] },
  ];

  const vozBase = [
    { ms: 1800, cena: 'page', desc: `Página da ${curta('clinica')}: prefere conversar? A gente liga. Nome, celular e o aceite da ligação.`, log: [ev('10:09:12', 'Site', 'Formulário com consentimento de ligação', 'aceite registrado com data e origem', 'sistema', { telefone: PESSOA.telefone, origem: 'site' })] },
    { ms: 900, cena: 'page', toque: 'send', desc: 'Toque em Pedir ligação.' },
    { ms: 1700, cena: 'page', estado: 'a1', desc: 'Recebemos. Vamos te ligar em instantes.', log: [ev('10:09:15', 'Sistema', 'Contato na fila de discagem', 'meta: ligar em menos de 1 minuto', 'sistema', { horario: 'dentro do permitido' }), ev('10:09:16', 'Telefonia', 'Confere os limites da Anatel', 'chamadas curtas abaixo de 85%', 'sistema', { regra: 'Despacho 100/2026' })] },
    { ms: 1800, cena: 'ring', hora: '10:10', desc: `O iPhone toca: ${nome('clinica')}, Agendamento. Lembre-me, Mensagem, Recusar e Aceitar.`, log: [ev('10:09:58', 'Telefonia', 'Chamada originada', 'identificação de ligação comercial', 'turno', { departamento: 'Agendamento' })] },
  ];
  const vozTurnos = segVoz.map((seg, i) => turno(seg, i + 1, { mais: i >= 3 ? 'ilha' : '', q: { cena: i >= 3 ? 'agenda' : 'call', desc: '' } }));
  const voz = [...vozBase,
    { ms: 900, cena: 'ring', toque: 'accept', desc: 'Toque em Aceitar.' },
    ...vozTurnos,
    { ms: 2200, cena: 'agenda', estado: 'fim ilha t5', desc: `Ligação encerrada depois de ${relogio(duracaoVoz, true)}. A ilha mostra o fim e volta ao normal.`, log: [ev('10:10:42', 'CRM', 'Resumo e transcrição salvos', 'evento neutro para a área da saúde', 'crm', { evento: 'appointment_booked' })] },
  ];
  const [vIa1, vEu1, vIa2, vEu2, vIa3, vEu3] = vozTurnos;
  Object.assign(vIa1, { desc: 'A ligação começa: a assistente diz que é uma inteligência artificial e que a ligação pode ser gravada.', log: [ev('10:10:01', 'Agente IA', 'Abre a ligação se identificando', 'oferece a recepção', 'turno', { ia: 'declarada', gravacao: 'avisada' })] });
  Object.assign(vEu1, { desc: `${PESSOA.primeiro} confirma e diz o que quer: um ${CL.interesse}.` });
  Object.assign(vIa2, { desc: `A assistente oferece ${dataCurta(av.iso)} às ${horaFala(av.hora)} ou ${dataCurta(alt.iso)} às ${horaFala(alt.hora)}.`, log: [ev('10:10:14', 'Agente IA', 'Ferramenta: horarios_livres', '2 opções', 'ferramenta', { unidade: av.unidade, interesse: CL.interesse })] });
  Object.assign(vEu2, { desc: `Ela abre o Calendário e a ligação vira a ilha. Quinta de manhã está livre: escolhe ${horaFala(av.hora)}.` });
  Object.assign(vIa3, { desc: `Agendado: ${dataCurta(av.iso)}, ${horaFala(av.hora)}, unidade ${av.unidade}. A confirmação vai pelo WhatsApp.`, log: [ev('10:10:30', 'Agente IA', 'Ferramenta: agendar', 'avaliação marcada', 'ferramenta', { quando: `${dataCurta(av.iso)} ${av.hora}`, unidade: av.unidade }), ev('10:10:31', 'Agenda', 'Avaliação na agenda da clínica', `com a ${CL.responsavel}`, 'agenda')] });
  Object.assign(vEu3, { desc: 'Ela agradece e desliga.' });
  const vozFalha = [...vozBase,
    { ms: 1900, cena: 'page', estado: 'a1 perdida', desc: 'Ela não atende a tempo: a ligação perdida aparece na tela.', log: [ev('10:10:28', 'Telefonia', 'Não atendida em 30 s', 'primeira tentativa', 'retentativa', { tentativa: '1 de 2' })] },
    { ms: 1900, cena: 'page', estado: 'a1 perdida wab', hora: '10:11', desc: `Logo depois, a ${curta('clinica')} manda mensagem no WhatsApp.`, log: [ev('10:11:02', 'WhatsApp', 'Retorno por modelo de utilidade', 'em vez de ligar de novo na hora', 'webhook', { template: 'retorno_ligacao' })] },
    { ms: 900, cena: 'page', estado: 'a1 perdida wab', toque: 'wab', desc: 'Toque na mensagem.' },
    { ms: 1900, cena: 'wa', desc: 'A clínica pergunta se liga às 14h ou se ela prefere marcar por mensagem.' },
    { ms: 900, cena: 'wa', toque: 'ligar', desc: 'Toque em Ligar às 14h.' },
    { ms: 1900, cena: 'wa', estado: 'w1', hora: '10:12', desc: 'Combinado: a clínica liga às 14h, dentro do horário de atendimento.', log: [ev('10:12:04', 'Agenda', 'Nova tentativa agendada', 'só dentro do horário permitido', 'retentativa', { quando: 'hoje 14:00', janela: CL.horario })] },
    { ms: 1800, cena: 'ring', hora: '14:00', desc: `Às 14h, o iPhone toca de novo: ${nome('clinica')}, Agendamento.`, log: [ev('14:00:01', 'Telefonia', 'Segunda tentativa', 'no horário que ela escolheu', 'retentativa', { tentativa: '2 de 2' })] },
    { ms: 900, cena: 'ring', toque: 'accept', desc: 'Toque em Aceitar.' },
    { ...vIa1, hora: '14:00', desc: 'Desta vez ela atende, e a assistente se apresenta como inteligência artificial.', log: [ev('14:00:05', 'Agente IA', 'Abre a ligação se identificando', 'segunda tentativa atendida', 'turno', { ia: 'declarada' })] },
  ];

  const rcsBase = [
    { ms: 1500, cena: 'serp', estado: 'typing', desc: 'Busca no Google: notebook para edição de vídeo, com as sugestões enquanto ela digita.' },
    { ms: 1800, cena: 'serp', estado: 'r', desc: `O resultado patrocinado da ${curta('varejo')} tem o botão Conversar.`, log: [ev('10:08:40', 'Anúncio', 'Resultado com botão de conversa', 'piloto do Google no Brasil', 'anuncio', { formato: 'Message Ads' })] },
    { ms: 900, cena: 'serp', estado: 'r', toque: 'chat', desc: 'Toque em Conversar.', log: [ev('10:08:52', 'Anúncio', 'Clique no botão Conversar', 'identificador do clique guardado', 'anuncio', { gclid: '••••' })] },
    { ms: 2000, cena: 'chat', hora: '10:09', desc: `O app Mensagens abre a conversa RCS com a ${curta('varejo')}, empresa verificada. A assistente se apresenta.`, log: [ev('10:09:01', 'RCS', 'Conversa aberta pelo anúncio', 'remetente verificado', 'webhook', { capacidade: 'RCS no aparelho' }), ev('10:09:02', 'Agente IA', 'Apresenta-se como assistente virtual', 'oferece um vendedor', 'ia')] },
    { ms: 900, cena: 'chat', toque: 'edit', desc: 'Toque em Para edição de vídeo.' },
    { ms: 2300, cena: 'chat', estado: 'a1', desc: `Dois cartões: o ${grafite.nome} grafite, que sai hoje, e o branco, que chega em ${ddmm(chega)}.`, log: [ev('10:09:14', 'Agente IA', 'Ferramenta: catalogo.buscar', '2 modelos para edição', 'ferramenta', { uso: 'edição de vídeo' })] },
    { ms: 900, cena: 'chat', estado: 'a1', toque: 'buy', desc: `Toque em Comprar no ${grafite.nome} grafite.` },
    { ms: 2000, cena: 'chat', estado: 'a1 a2', hora: '10:10', desc: `O pedido ${pedidoRcs} chega com o total e o botão Pagar com Pix, que abre o link seguro do PSP.`, log: [ev('10:10:03', 'PSP', 'Cobrança Pix criada', `pedido ${pedidoRcs}`, 'pagamento', { txid: '••••', expiracao: '1800 s' })] },
    { ms: 900, cena: 'chat', estado: 'a1 a2', toque: 'pix', desc: 'Toque em Pagar com Pix.' },
    { ms: 1900, cena: 'psp', desc: `O Safari abre a página da ${PSP.nome}: valor, QR e o Pix copia e cola, que vence em 30 minutos.`, log: [ev('10:10:09', 'Site', 'Página de pagamento aberta', 'vinda da conversa RCS', 'sinal', { origem: 'rcs' })] },
    { ms: 900, cena: 'psp', toque: 'copy', desc: 'Toque em Copiar código.' },
    { ms: 1300, cena: 'psp', estado: 'c1', desc: 'Código copiado. Agora é pagar no app do banco.' },
    { ms: 1600, cena: 'bank', hora: '10:11', desc: `O app do ${B.nome} encontra o código copiado.` },
    { ms: 900, cena: 'bank', toque: 'bk-go', desc: 'Toque em Pagar.' },
    { ms: 1500, cena: 'bank', estado: 'bk1', desc: `Para ${nome('varejo')}, via ${PSP.nome}: confira e pague com Face ID.` },
    { ms: 900, cena: 'bank', estado: 'bk1', toque: 'bk-ok', desc: 'Toque em Pagar com Face ID.' },
    { ms: 1100, cena: 'bank', estado: 'bk1 bk2', desc: 'O Face ID confirma.' },
    { ms: 1800, cena: 'bank', estado: 'bk3', desc: 'O comprovante do Pix.', log: [ev('10:11:20', 'PSP', 'Webhook pix recebido', 'conciliado com o pedido', 'webhook', { txid: '••••', endToEndId: 'E2E••••' })] },
  ];
  const rcs = [...rcsBase,
    { ms: 2000, cena: 'bank', estado: 'bk3 ban', desc: `A mensagem da ${curta('varejo')} chega na notificação: pagamento confirmado.`, log: [ev('10:11:22', 'RCS', 'Cartão de pagamento confirmado enviado', 'entrega confirmada', 'webhook', { fallback: 'SMS se não entregar' })] },
    { ms: 900, cena: 'bank', estado: 'bk3 ban', toque: 'ban', desc: 'Toque na notificação.' },
    { ms: 2600, cena: 'chat', estado: 'a1 a2 a3', desc: `De volta ao Mensagens: pedido ${pedidoRcs} pago, separando, com a entrega a seguir.`, log: [ev('10:11:30', 'Google Ads', 'Conversão offline enviada', 'com o identificador do clique', 'sinal', { gclid: '••••' }), ev('10:11:31', 'CRM', `Pedido ${pedidoRcs} pago`, 'separação iniciada', 'crm')] },
  ];
  const rcsFalha = [...rcsBase,
    { ms: 2000, cena: 'bank', estado: 'bk3', desc: 'A confirmação por RCS não chega: o aparelho deixou de aceitar mensagens comerciais.', log: [ev('10:11:22', 'RCS', 'Entrega não confirmada em 60 s', 'mensagens RCS comerciais desligadas', 'webhook', { status: 'não entregue' }), ev('10:11:23', 'Sistema', 'Mensagem RCS revogada', 'antes de mandar o SMS', 'sistema', { revoke: 'ok' })] },
    { ms: 2000, cena: 'bank', estado: 'bk3 sms', hora: '10:12', desc: 'A mesma confirmação chega por SMS, só com texto e o link do pedido.', log: [ev('10:12:01', 'Sistema', 'SMS de reserva enviado', 'texto e link do pedido', 'sistema', { canal: 'SMS', link: 'acompanhar pedido' })] },
    { ms: 900, cena: 'bank', estado: 'bk3 sms', toque: 'sms', desc: 'Toque no SMS.' },
    { ms: 2400, cena: 'sms', desc: 'No Mensagens, o SMS em balão verde, de um número curto, com o link para acompanhar o pedido.', log: [ev('10:12:09', 'CRM', `Pedido ${pedidoRcs} pago`, 'aviso entregue por SMS', 'crm')] },
  ];

  const pixBase = [
    { ms: 2000, cena: 'page', desc: `Página da ${curta('educacao')}: pague a 1ª mensalidade e autorize as próximas, com QR e Pix copia e cola.`, log: [ev('10:11:05', 'Site', 'Plano mensal escolhido', 'Pix Automático, jornada 3', 'assinatura', { qr: 'composto' })] },
    { ms: 900, cena: 'page', toque: 'copy', desc: 'Toque em Copiar código.', log: [ev('10:11:20', 'PSP', 'Cobrança e recorrência criadas', 'o mesmo código paga e autoriza', 'assinatura', { txid: '••••', idRec: 'RR••••', politicaRetentativa: 'PERMITE_3R_7D' })] },
    { ms: 1300, cena: 'page', estado: 'c1', desc: 'Código copiado.' },
    { ms: 1600, cena: 'bank', hora: '10:12', desc: `O ${B.nome} reconhece o código: pagamento agora e autorização das próximas.` },
    { ms: 900, cena: 'bank', toque: 'bk-go', desc: 'Toque em Continuar.' },
    { ms: 8000, cena: 'bank', estado: 'bk1', desc: `Pedido de autorização: CNPJ, objeto, início em ${dataCurta(M.inicio)}, valor fixo, valor máximo e novas tentativas.` },
    { ms: 900, cena: 'bank', estado: 'bk1', toque: 'auth', desc: 'Toque em Pagar e autorizar.' },
    { ms: 1200, cena: 'bank', estado: 'bk1 bk2', desc: 'O Face ID confirma.' },
    { ms: 2200, cena: 'bank', estado: 'bk3', desc: 'Pix enviado e Pix Automático autorizado. Ela gerencia tudo em Pix › Automático.', log: [ev('10:12:31', 'PSP', 'Webhook pix recebido', '1ª mensalidade', 'webhook', { txid: '••••' }), ev('10:12:32', 'PSP', 'Recorrência aprovada', 'autorização única no banco dela', 'assinatura', { status: 'APROVADA', idRec: 'RR••••' })] },
    { ms: 2300, cena: 'lock', estado: 'a1', hora: '19:05', desc: `Na véspera, ${dataLonga(somaDias(c1, -1))}, o banco avisa: amanhã tem Pix Automático para a escola.`, log: [ev('10:30:00', 'PSP', 'Cobrança de novembro enviada ao banco', 'agendada com aviso', 'assinatura', { vencimento: ddmm(c1), status: 'ATIVA' }, { dia: somaDias(c1, -4) })] },
    { ms: 2000, cena: 'lock', estado: 'a2', hora: '08:02', desc: `${cap(dataLonga(c1))}: Pix Automático pago.`, log: [ev('07:41:00', 'PSP', 'Pix Automático liquidado', 'mensalidade de novembro', 'webhook', { status: 'CONCLUIDA' }, { dia: c1 })] },
    { ms: 2600, cena: 'lock', estado: 'a3', hora: '19:10', desc: `${cap(dataLonga(falha.aviso))}: o aviso de amanhã traz a opção de cancelar este pagamento até 23h59.`, log: [ev('10:40:00', 'PSP', 'Cobrança de dezembro agendada', 'aviso na véspera', 'assinatura', { vencimento: ddmm(c2) }, { dia: somaDias(c2, -4) })] },
  ];
  const pix = [...pixBase,
    { ms: 2300, cena: 'lock', estado: 'a4', hora: '08:04', desc: `${cap(dataLonga(falha.iso))}: o débito não passa por saldo e a escola escreve no WhatsApp.`, log: [ev('07:58:00', 'PSP', 'Tentativa não realizada', 'saldo insuficiente', 'webhook', { status: 'NAO_REALIZADA' }, { dia: c2 }), ev('07:58:01', 'PSP', 'Nova tentativa permitida', 'até 3 em 7 dias', 'retentativa', { politicaRetentativa: 'PERMITE_3R_7D' }, { dia: c2 }), ev('07:58:02', 'Sistema', 'Régua de recuperação iniciada', 'WhatsApp primeiro, e-mail depois', 'sistema', null, { dia: c2 })] },
    { ms: 900, cena: 'lock', estado: 'a4', toque: 'wa', desc: `Toque na mensagem da ${curta('educacao')}.` },
    { ms: 2000, cena: 'wa', hora: '08:15', desc: 'A escola oferece tentar de novo amanhã ou pausar um mês sem perder a vaga.', log: [ev('08:15:10', 'WhatsApp', 'Modelo de utilidade enviado', 'três botões de resposta', 'webhook', { template: 'cobranca_nao_realizada' }, { dia: c2 })] },
    { ms: 900, cena: 'wa', toque: 'pause', desc: 'Toque em Pausar 1 mês.' },
    { ms: 2600, cena: 'wa', estado: 'w1', hora: '08:16', desc: `Pausado até janeiro: a vaga de quinta continua dela e a cobrança volta em ${dataCurta(M.retomada)}.`, log: [ev('08:16:12', 'PSP', 'Cobrança de dezembro cancelada', 'a autorização continua', 'assinatura', { cobranca: 'CANCELADA', recorrencia: 'APROVADA' }, { dia: c2 }), ev('08:16:13', 'CRM', 'Pausa no lugar do cancelamento', 'vaga mantida na turma', 'crm', null, { dia: c2 }), ev('08:16:14', 'Agenda', 'Próxima cobrança', ddmm(M.retomada) + '/2027', 'agenda', { vencimento: M.retomada }, { dia: c2 })] },
  ];
  const pixFalha = [...pixBase,
    { ms: 900, cena: 'lock', estado: 'a3', toque: 'cancela', desc: 'Ela toca em Cancelar este pagamento, na véspera.' },
    { ms: 2000, cena: 'cancela', hora: '19:12', desc: `O ${B.nome} pergunta se cancela só o pagamento de ${ddmm(c2)}; a autorização continua.` },
    { ms: 900, cena: 'cancela', toque: 'cx', desc: 'Toque em Cancelar pagamento.' },
    { ms: 2000, cena: 'cancela', estado: 'x1', desc: 'Pagamento cancelado. O Pix Automático segue autorizado.', log: [ev('19:12:40', 'PSP', 'Agendamento cancelado pela pagadora', 'a escola recebe o aviso', 'webhook', { status: 'CANCELADA', motivo: 'pagador' }, { dia: falha.aviso })] },
    { ms: 2200, cena: 'wa', estado: 'x2', hora: '08:20', desc: 'No dia seguinte, a escola escreve: a vaga continua e ela pode pausar dezembro.', log: [ev('08:20:00', 'Sistema', 'Régua de retenção iniciada', 'sem cobrar de novo', 'sistema', null, { dia: c2 })] },
    { ms: 900, cena: 'wa', estado: 'x2', toque: 'pause2', desc: 'Toque em Pausar 1 mês.' },
    { ms: 2400, cena: 'wa', estado: 'x2 x3', hora: '08:21', desc: `Pausado até janeiro. A cobrança volta em ${dataCurta(M.retomada)}.`, log: [ev('08:21:20', 'CRM', 'Pausa registrada', 'vaga mantida, autorização ativa', 'crm', { recorrencia: 'APROVADA' }, { dia: c2 })] },
  ];

  const emailBase = [
    { ms: 1800, cena: 'inbox', desc: `Caixa de Entrada em Atualizações: o guia da ${curta('financas')} chegou em ${ddmm(g0.iso)}.`, log: [ev('08:40:12', 'CRM', 'Lead do LinkedIn sincronizado', 'campo oculto com a campanha de origem', 'crm', { origem: 'LinkedIn Lead Gen' }, { dia: g0.iso }), ev('08:40:15', 'E-mail', 'Boas-vindas com o guia', 'dia 0', 'email', { SPF: 'ok', DKIM: 'ok', DMARC: 'p=quarantine' }, { dia: g0.iso }), ev('08:40:16', 'E-mail', 'Logo no lugar da inicial', 'BIMI exige DMARC em quarentena ou rejeição', 'email', { BIMI: 'logo da marca' }, { dia: g0.iso })] },
    { ms: 1900, cena: 'inbox', estado: 'a1', desc: `Três dias depois, ${dataCurta(g3.iso)}: três perguntas antes de separar o patrimônio.`, log: [ev('09:05:00', 'E-mail', 'Conteúdo do dia 3', 'só para quem clicou no guia', 'email', { regra: 'clique, não abertura' }, { dia: g3.iso })] },
    { ms: 2000, cena: 'inbox', estado: 'a1 a2', hora: '09:13', desc: 'Hoje, 9:12: o convite para revisar o caso em 30 minutos, ainda não lido.', log: [ev('09:12:00', 'E-mail', 'Convite do dia 9', 'leu dois e-mails e ainda não agendou', 'email', { dia: '9' })] },
    { ms: 900, cena: 'inbox', estado: 'a1 a2', toque: 'open', desc: 'Toque no convite.' },
    { ms: 9000, cena: 'open', desc: 'O e-mail aberto: no alto, o Mail avisa que é uma lista e oferece cancelar a inscrição; embaixo, Agendar conversa.', log: [ev('09:13:20', 'E-mail', 'Descadastro em um clique no cabeçalho', 'o Mail mostra a faixa no alto', 'descadastro', { 'List-Unsubscribe-Post': 'One-Click' })] },
  ];
  const email = [...emailBase,
    { ms: 900, cena: 'open', toque: 'cta', desc: 'Toque em Agendar conversa.', log: [ev('09:13:31', 'Site', 'Clique no convite', 'utm da régua', 'sinal', { utm_campaign: 'regua-guia' })] },
    { ms: 1600, cena: 'page', hora: '09:14', desc: `A agenda da ${curta('financas')} abre no Safari: conversa de 30 minutos por vídeo, com os dias livres.` },
    { ms: 900, cena: 'page', toque: 'a', desc: `Toque em ${dataCurta(cv.iso)}.` },
    { ms: 1200, cena: 'page', estado: 'q1', desc: 'Os horários do dia aparecem.' },
    { ms: 900, cena: 'page', estado: 'q1', toque: 'b', desc: `Toque em ${cv.hora}.` },
    { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque em Próximo.' },
    { ms: 1400, cena: 'page', estado: 'w2 q2', desc: 'Nome e e-mail já preenchidos. Falta o assunto da conversa.' },
    { ms: 900, cena: 'page', estado: 'w2 q2', toque: 'd', desc: 'Toque em Sucessão.' },
    { ms: 800, cena: 'page', estado: 'w2 q2 q3', toque: 'e', desc: 'Toque em Agendar.' },
    { ms: 2600, cena: 'page', estado: 'w3 done', hora: '09:15', desc: `Conversa agendada: ${dataLonga(cv.iso)}, ${horaFala(cv.hora)}, por vídeo. A régua de e-mail para aqui.`, log: [ev('09:15:02', 'Agenda', 'Conversa agendada', 'convite e lembrete por e-mail', 'agenda', { quando: `${dataCurta(cv.iso)} ${cv.hora}`, formato: cv.formato }), ev('09:15:03', 'Sistema', 'Régua encerrada: agendou', 'sai dos e-mails e dos anúncios', 'sistema', { supressao: 'e-mail e públicos' }), ev('09:15:04', 'LinkedIn CAPI', 'Conversão enviada', 'reunião agendada', 'sinal', { evento: 'agendamento' })] },
  ];
  const emailFalha = [...emailBase,
    { ms: 900, cena: 'open', toque: 'unsub', desc: 'Toque em Cancelar inscrição, na faixa do alto.' },
    { ms: 1800, cena: 'open', estado: 'u1', desc: `O Mail pergunta se ela quer mesmo sair da lista da ${curta('financas')}.` },
    { ms: 900, cena: 'open', estado: 'u1', toque: 'unsub-ok', desc: 'Toque em Cancelar Inscrição.' },
    { ms: 2600, cena: 'open', estado: 'u2', desc: 'Inscrição cancelada em um clique. Nenhum outro e-mail da régua sai.', log: [ev('09:13:40', 'E-mail', 'Pedido de descadastro recebido', 'um clique, sem página', 'descadastro', { RFC: '8058', prazo: 'até 48 h' }), ev('09:13:41', 'CRM', 'Contato marcado como não contatar', 'por pedido dela', 'crm', { status: 'não contatar' }), ev('09:13:42', 'Sistema', 'Régua parada', 'e fora dos públicos de anúncio', 'sistema', { supressao: 'e-mail e públicos' })] },
  ];

  const clube = [
    { ms: 1800, cena: 'chat', desc: `No grupo Clube ${curta('educacao')}, o desafio da semana com botões embaixo da mensagem.`, log: [ev('10:00:02', 'Bot', 'Desafio publicado no grupo', 'foto, texto e botões', 'grupo', { metodo: 'sendPhoto', botoes: 'inline' })] },
    { ms: 900, cena: 'chat', toque: 'reply', desc: 'Toque em Responder.' },
    { ms: 2000, cena: 'chat', estado: 'a1', desc: 'Uma mensagem que só ela vê traz as três opções. O grupo não vê nada.', log: [ev('10:09:03', 'Bot', 'Mensagem efêmera para uma pessoa', 'só ela vê a resposta', 'grupo', { receiver_user_id: '••••' })] },
    { ms: 900, cena: 'chat', estado: 'a1', toque: 'to', desc: 'Toque em to.' },
    { ms: 4000, cena: 'chat', estado: 'a1 a2', desc: `A mesma mensagem é editada: certo, nível ${E.nivel}, e o botão Ver o plano.`, log: [ev('10:09:10', 'Bot', 'Resultado salvo no perfil', `nível ${E.nivel}`, 'crm', { interesse: 'conversação' })] },
    { ms: 900, cena: 'chat', estado: 'a1 a2', toque: 'plan', desc: 'Toque em Ver o plano.' },
    { ms: 2200, cena: 'mini', desc: 'O miniapp abre com o clube, os benefícios e a agenda das quintas.', log: [ev('10:09:20', 'Mini app', 'Dados de abertura validados no servidor', 'assinatura do Telegram conferida', 'sistema', { initData: 'conferido' })] },
    { ms: 900, cena: 'mini', toque: 'sub', desc: 'Toque em Assinar.' },
    { ms: 1900, cena: 'mini', estado: 's1', desc: 'Faltam Estrelas: o Telegram mostra os pacotes para comprar.', log: [ev('10:09:31', 'Bot', 'Fatura de assinatura criada', 'cobrada em Estrelas', 'assinatura', { metodo: 'createInvoiceLink', currency: 'XTR', subscription_period: '2592000' })] },
    { ms: 900, cena: 'mini', estado: 's1', toque: 'pack', desc: 'Toque no primeiro pacote.' },
    { ms: 1800, cena: 'mini', estado: 's1 s2', desc: 'A folha de compra do sistema, com a conta e o valor.' },
    { ms: 900, cena: 'mini', estado: 's1 s2', toque: 'buy', desc: 'Clique duas vezes no botão lateral para pagar.' },
    { ms: 1400, cena: 'mini', estado: 's1 s2 s3', desc: 'Concluído. As Estrelas entram no saldo.' },
    { ms: 2000, cena: 'mini', estado: 's4', desc: 'Com saldo, a folha de assinatura: o clube por um valor em Estrelas por mês.' },
    { ms: 900, cena: 'mini', estado: 's4', toque: 'pay', desc: 'Toque em Assinar.' },
    { ms: 2200, cena: 'mini', estado: 's4 ok', desc: 'Assinatura concluída. Volte ao chat para entrar no grupo.', log: [ev('10:10:58', 'Bot', 'Pré-checkout respondido', 'em menos de 10 s', 'pagamento', { pre_checkout_query: 'ok' }), ev('10:11:00', 'Telegram', 'Pagamento confirmado', 'assinatura de 30 dias', 'pagamento', { update: 'successful_payment', telegram_payment_charge_id: '••••', is_recurring: 'true' })] },
    { ms: 900, cena: 'mini', estado: 's4 ok', toque: 'back', desc: 'Toque em Voltar ao chat.' },
    { ms: 2000, cena: 'chat', estado: 'a1 a2 a3', hora: '10:11', desc: `Só para ela: assinatura ativa até ${ddmm(ate)} e o convite de uso único para a turma.`, log: [ev('10:11:03', 'Bot', 'Convite de uso único criado', 'só ela entra com ele', 'grupo', { metodo: 'createChatInviteLink', member_limit: '1' })] },
    { ms: 900, cena: 'chat', estado: 'a1 a2 a3', toque: 'join', desc: 'Toque em Entrar no grupo.' },
    { ms: 2600, cena: 'turma', hora: '10:12', desc: 'Na turma de quinta, as boas-vindas que só ela vê: regras e a agenda.', log: [ev('10:12:01', 'Bot', 'Boas-vindas só para quem entrou', 'regras e agenda', 'grupo'), ev('10:12:02', 'Bot', 'Renovação acompanhada', 'se falhar, o bot tira do grupo', 'assinatura', { update: 'BotSubscriptionUpdated' })] },
  ];

  /* Placements added to existing channels. */
  const extra = {
    whatsapp: [
      { id: 'agente', label: 'Agente e Pix', curto: 'Agente', mock: 'waAgente', cliente: 'turismo', selo: 'Anúncio',
        objetivo: 'Transformar a conversa do anúncio em pré-reserva paga, com uma consultora quando a dúvida pede.',
        frase: 'Uma agência qualifica com IA, passa para uma consultora com o resumo e recebe o Pix na conversa.',
        base: 'WhatsApp Business Platform: roteamento de conversas, Flows, Payments BR (Pix com troca para o app do banco, 16/10/2026) e Conversions API.',
        passos: passos3(['Anúncio abre a conversa', de(0, 5)], ['IA qualifica e chama a consultora', de(6, 17)], ['Pré-reserva, Pix e confirmação', de(18, agente.length - 1)]),
        quadros: agente },
      { id: 'chamada', label: 'Chamada', mock: 'waChamada', cliente: 'automotivo', selo: 'Conversa, não é anúncio',
        objetivo: 'Agendar o test drive por voz e passar para o consultor sem ela repetir nada.',
        frase: 'Uma concessionária pede permissão, liga pelo WhatsApp, a IA agenda e passa para o consultor.',
        base: 'WhatsApp Business Calling API: pedido de permissão (1 por dia, 2 por semana), chamadas iniciadas pela empresa, gravação com aviso e transferência por SIP.',
        passos: passos3(['Pedido de permissão na conversa', de(0, 2)], ['IA atende e agenda por voz', de(3, 10)], ['Consultor assume e confirma', de(11, chamada.length - 1)]),
        quadros: chamada },
    ],
    instagram: [
      { id: 'direct', label: 'Comentário e Direct', curto: 'Direct', mock: 'igDirect', cliente: 'varejo', selo: 'Anúncio',
        objetivo: 'Transformar um comentário em lista de espera e a chegada do produto em compra reservada.',
        frase: 'Uma loja transforma um comentário no Reel em conversa no Direct e avisa uma vez quando o produto chega.',
        base: 'Instagram API: prompt de comentário (28/09/2026), comentários de todas as cópias do anúncio (20/10/2026) e resposta privada.',
        passos: passos3(['Pedido de comentário no Reel', de(0, 4)], ['Comentário vira conversa no Direct', de(5, 9)], ['Aviso de chegada e compra reservada', de(10, direct.length - 1)]),
        quadros: direct },
    ],
  };

  /* New channels. Without an official logo file they get a generic glyph (static-presentations.js). */
  const ui = {
    voz: `<span class="au-ui au-ui--call">${marca('clinica', 'circulo')}<span><b>${esc(nome('clinica'))}</b><small>Agendamento</small></span><i class="au-ui-no">${I('phone')}</i><i class="au-ui-yes">${I('phone')}</i></span>`,
    pix: `<span class="au-ui au-ui--pix"><i class="cm-bk-mark au-bk-icone" style="--bk:${B.cor}">${esc(B.sigla)}</i><span><b>Autorizar Pix Automático</b><small>${esc(nome('educacao'))} · Mensal · sem data final</small></span>${I('chevron')}</span>`,
    telegram: `<span class="au-ui au-ui--tg"><span class="au-ui-post"><b>Desafio da semana</b><small>I'm looking forward ___ it.</small></span><span class="au-ui-kb"><i>for</i><i>to</i><i>at</i></span></span>`,
    rcs: `<span class="au-ui au-ui--rcs"><span class="au-ui-rcs-id">${marca('varejo')}<b>${esc(nome('varejo'))} ${I('check', 'au-verified')}</b></span><span class="au-ui-chips"><i>Para edição de vídeo</i><i>Falar com vendedor</i></span></span>`,
    email: `<span class="au-ui au-ui--mail">${[['Marina, quer revisar o seu caso?', '9:12'], ['Três perguntas antes de separar…', 'qui'], ['Seu guia chegou', '12/10']].map(([a, b], i) => `<span${i === 0 ? ' class="is-new"' : ''}>${marca('financas')}<b>${esc(a)}</b><small>${b}</small></span>`).join('')}</span>`,
  };
  const novos = [
    { id: 'telegram', name: 'Telegram', group: 'local', benefit: 'Comunidade que paga e volta.', glifo: 'send',
      art: art('educacao', 'fonesCor45', '50% 45%', 'Complete a frase e entre no clube', `Peça da ${nome('educacao')}, escola de idiomas fictícia: fones de ouvido coloridos e o desafio da semana com botões.`, { formato: 'ui', cta: 'Entrar no clube', ui: ui.telegram }),
      placements: [
        { id: 'clube', label: 'Grupo', mock: 'tgClube', cliente: 'educacao', selo: 'Grupo, não é anúncio',
          objetivo: 'Vender a assinatura do clube dentro do Telegram, em Estrelas, sem tirar ninguém do grupo.',
          frase: 'Uma escola faz um desafio no grupo, mostra o resultado só para quem respondeu e vende a assinatura em Estrelas.',
          base: 'Telegram Bot API 10.2 e 10.3 (jul. e ago. de 2026): mensagens efêmeras em grupos, botões nas mensagens, boas-vindas e assinaturas em Estrelas.',
          passos: passos3(['Desafio com botões no grupo', [0, 1]], ['Resposta que só ela vê', de(2, 5)], ['Miniapp, Estrelas e a turma', de(6, clube.length - 1)]),
          quadros: clube },
      ] },
    { id: 'rcs', name: 'RCS', group: 'local', benefit: 'Da busca à conversa verificada.', glifo: 'comment',
      art: art('varejo', 'mesaCriador45', '50% 50%', 'Escolha o notebook pela conversa', `Peça da ${nome('varejo')}, loja de tecnologia fictícia: mesa de criador com notebook, vista de cima.`, { formato: 'ui', cta: 'Abrir conversa', ui: ui.rcs }),
      placements: [
        { id: 'conversa', label: 'Conversa', mock: 'rcsChat', cliente: 'varejo', selo: 'Patrocinado',
          objetivo: 'Vender pela conversa verificada e confirmar o pagamento no mesmo lugar.',
          frase: 'Uma loja abre uma conversa verificada a partir da busca e fecha o pedido com Pix. Botão na busca em piloto no Brasil; no iPhone, não confirmado.',
          base: 'RCS for Business (Google): remetente verificado, cartões, respostas sugeridas e ações de link; app Mensagens do iOS 26 com RCS comercial; Message Ads em piloto no Brasil.',
          passos: passos3(['Botão Conversar na busca', de(0, 2)], ['Conversa verificada e cartões', de(3, 8)], ['Pix pelo link, banco e confirmação', de(9, rcs.length - 1)]),
          quadros: rcs },
      ] },
    { id: 'voz', name: 'Voz com IA', group: 'local', benefit: 'Ligar enquanto o interesse está quente.', glifo: 'phone',
      art: art('clinica', 'salaAtendimento45', '50% 50%', 'Peça a ligação. A gente liga agora.', `Peça da ${nome('clinica')}, clínica odontológica fictícia: sala de atendimento clara e a ligação chegando.`, { formato: 'ui', cta: 'Pedir ligação', ui: ui.voz }),
      placements: [
        { id: 'ligacao', label: 'Ligação', mock: 'vozIA', cliente: 'clinica', selo: 'Ligação pedida, não é anúncio',
          objetivo: 'Ligar em instantes para quem pediu e marcar a avaliação na própria ligação.',
          frase: 'Uma clínica liga em instantes para quem pediu, com uma assistente que se identifica como IA e agenda na hora.',
          base: 'Agentes de voz em tempo real (out./2026), Anatel Despacho 100/2026 sobre chamadas abusivas e Decreto 13.135/2026 do SAC.',
          passos: passos3(['Pedido de ligação com consentimento', de(0, 2)], ['IA liga e se identifica', de(3, 7)], ['Agenda na ligação e confirma', de(8, voz.length - 1)]),
          quadros: voz },
      ] },
    { id: 'pix', name: 'Pix Automático', group: 'retencao', benefit: 'Cobrar todo mês sem perder o aluno.', glifo: 'regen',
      art: art('educacao', 'cadernos45', '50% 50%', 'Autorize uma vez. Pause quando precisar.', `Peça da ${nome('educacao')}, escola de idiomas fictícia: cadernos e canetas sobre a mesa e a autorização no banco.`, { formato: 'ui', cta: 'Autorizar Pix', ui: ui.pix }),
      placements: [
        { id: 'recorrencia', label: 'Recorrência', mock: 'pixAuto', cliente: 'educacao', selo: 'Cobrança recorrente, não é anúncio',
          objetivo: 'Receber a mensalidade todo mês e, quando o débito falha, manter a aluna com uma pausa.',
          frase: 'Uma escola cobra a mensalidade com Pix Automático e, quando o débito falha, oferece pausa em vez de cancelamento.',
          base: 'Pix Automático (Banco Central): jornada 3 com QR composto, autorização única no app de quem paga, aviso antes de cada cobrança e novas tentativas.',
          passos: passos3(['Plano e QR no site', [0, 1, 2]], ['Autoriza uma vez no banco', de(3, 10)], ['Falha vira pausa, não cancelamento', de(11, pix.length - 1)]),
          quadros: pix },
      ] },
    { id: 'email', name: 'E-mail', group: 'retencao', benefit: 'Seguir a conversa até a reunião.', glifo: 'mail',
      art: art('financas', 'mesaCafe45', '50% 50%', 'Seu guia chegou. A próxima pergunta também.', `Peça da ${nome('financas')}, gestora de patrimônio fictícia: mesa com café e cadernos e a caixa de entrada com a régua.`, { formato: 'ui', cta: 'Ler o guia', ui: ui.email }),
      placements: [
        { id: 'regua', label: 'Régua', mock: 'emailRegua', cliente: 'financas', selo: 'E-mail com inscrição, não é anúncio',
          objetivo: 'Levar quem baixou o guia até uma conversa marcada e parar de enviar quando ela agenda.',
          frase: 'Uma gestora segue o lead do guia com três e-mails autenticados e para de enviar quando ele agenda.',
          base: 'Regras de remetente do Gmail e do Yahoo (autenticação e descadastro em um clique, RFC 8058), categorias do Mail do iOS e sincronização de leads do LinkedIn.',
          passos: passos3(['Guia entregue na caixa de entrada', [0]], ['Conteúdo e convite no momento certo', de(1, 4)], ['Agenda e sai da régua', de(5, email.length - 1)]),
          quadros: email },
      ] },
  ];
  /* Recorded calls, when a file exists. */
  const audio = (key, segs) => AUDIO[key] ? { src: AUDIO[key], segmentos: segmentos(segs), durationMs: segs.at(-1).endMs } : null;
  const comAudio = (pl, key, segs) => { const a = audio(key, segs); if (a) pl.audio = a; };
  comAudio(extra.whatsapp[1], 'whatsapp/chamada', segChamada);
  comAudio(novos.find(c => c.id === 'voz').placements[0], 'voz/ligacao', segVoz);

  /* Failure paths, played only in "Sistemas e automações" (contract '<canal>/<formato>-falha'). */
  const falhaDe = (base, id, label, passos, quadros) => ({ ...base, id, label, curto: label, passos, quadros });
  const pl = key => { const [c, p] = key.split('/'); return (extra[c] || novos.find(n => n.id === c)?.placements || []).find(x => x.id === p); };
  const hidden = {
    'whatsapp/agente-falha': falhaDe(pl('whatsapp/agente'), 'agente-falha', 'Agente e Pix, com falhas',
      passos3(['Anúncio abre a conversa', de(0, 5)], ['IA qualifica e chama a consultora', de(6, 17)], ['Pix expira, código novo, pago uma vez', de(18, agenteFalha.length - 1)]), agenteFalha),
    'voz/ligacao-falha': falhaDe(pl('voz/ligacao'), 'ligacao-falha', 'Ligação não atendida',
      passos3(['Pedido de ligação com consentimento', de(0, 2)], ['Ninguém atende: retorno no WhatsApp', de(3, 9)], ['Nova tentativa no horário dela', de(10, vozFalha.length - 1)]), vozFalha),
    'rcs/conversa-falha': falhaDe(pl('rcs/conversa'), 'conversa-falha', 'Sem RCS: SMS',
      passos3(['Botão Conversar na busca', de(0, 2)], ['Conversa verificada e cartões', de(3, 8)], ['Pix pago, aviso por SMS', de(9, rcsFalha.length - 1)]), rcsFalha),
    'pix/recorrencia-falha': falhaDe(pl('pix/recorrencia'), 'recorrencia-falha', 'Cancelado na véspera',
      passos3(['Plano e QR no site', [0, 1, 2]], ['Autoriza uma vez no banco', de(3, 10)], ['Cancela na véspera, a escola retém', de(11, pixFalha.length - 1)]), pixFalha),
    'email/regua-falha': falhaDe(pl('email/regua'), 'regua-falha', 'Descadastro',
      passos3(['Guia entregue na caixa de entrada', [0]], ['Conteúdo e convite no momento certo', de(1, 4)], ['Descadastro em um clique', de(5, emailFalha.length - 1)]), emailFalha),
  };

  const AVISOS = {
    'whatsapp/agente': { app: 'mail', cliente: 'turismo', texto: `Pré-reserva confirmada: Festa do Divino, ${periodo(s1)} de 2027. Roteiro e documentos aqui.`, desc: 'O roteiro chega por e-mail, na notificação do iPhone.', log: [ev('10:13:40', 'E-mail', 'Roteiro enviado', 'remetente autenticado', 'email', { descadastro: 'um clique' })] },
    'voz/ligacao': { app: 'whatsapp', cliente: 'clinica', hora: '10:11', texto: `Avaliação confirmada: ${dataCurta(av.iso)}, às ${horaFala(av.hora)}, unidade ${av.unidade}. Para remarcar, é só responder.`, desc: 'A confirmação e o endereço chegam pelo WhatsApp.', log: [ev('10:11:05', 'WhatsApp', 'Confirmação por modelo de utilidade', 'lembrete na véspera agendado', 'webhook', { template: 'confirmacao_avaliacao' })] },
    'pix/recorrencia': { app: 'mail', cliente: 'educacao', hora: '08:17', texto: `Sua assinatura está pausada até janeiro. A vaga de quinta continua sua; a cobrança volta em ${dataCurta(M.retomada)}.`, desc: 'A pausa também chega por e-mail.', log: [ev('08:16:40', 'E-mail', 'Confirmação da pausa', 'a mesma informação, por outro canal', 'email', null, { dia: c2 })] },
  };

  return { mocks, SCREEN, extra, novos, AVISOS, hidden };
}
