/** Deep automation flows (27/10/2026), built on the research of the same day
 * (reports/Automações complexas por canal.md). Each placement is a storyboard of
 * the same iPhone, like the 22 campaign flows, and each frame may carry a `log`:
 * the events the system behind the screen would record ([actor, event, detail]).
 * "Sistemas e automações" shows that log beside the phone (automation-trace.js);
 * the campaign section plays the same storyboards without it.
 * Rules of campaign-channels.js apply: fictitious brands, no metrics, prices or
 * results (amounts are masked), ads identified as each platform does. AI agents
 * always say they are AI and always offer a person. Field names in the log are
 * the ones of the official docs read on 27/10/2026; features in pilot or not in
 * Brazil say so in the placement's sentence.
 *
 * Reveal engine (automation-mocks.css): an element with data-in="a3" only shows
 * once the frame state carries a3; data-out="a5" hides it again when a5 arrives.
 */
export function makeAutomations({ I, pic, marca, esc, scene, screen, logoSvg, LAB, SITES, CLIENTES, P, browserBar, btn, art, skel }) {
  const ticks = I('ticks');
  /* WhatsApp bubbles. `who` labels a business message: the AI says it is a virtual assistant, a person says her name. */
  const out = (tok, html, time = '10:09', cls = '') => `<div class="cm-wa-out${cls ? ' ' + cls : ''}"${tok ? ` data-in="${tok}"` : ''}>${html}<small>${time} ${ticks}</small></div>`;
  const inn = (tok, html, { who = '', time = '10:09', cls = '', typing = true, hs = '' } = {}) =>
    `${typing ? `<span class="cm-wa-typing" data-in="${tok}" aria-hidden="true"><i></i><i></i><i></i></span>` : ''}<div class="cm-wa-in${tok ? ' cm-arrive' : ''}${cls ? ' ' + cls : ''}"${tok ? ` data-in="${tok}"` : ''}${hs ? ` data-hs="${hs}"` : ''}>${who}${html}<small>${time}</small></div>`;
  const ia = (texto = 'Assistente virtual · IA') => `<em class="au-who au-who--ia">${I('sticker', 'cm-i--inline')}${esc(texto)}</em>`;
  const pessoa = nome => `<em class="au-who">${esc(nome)}</em>`;
  const sys = (tok, html, cls = '') => `<span class="au-sys cm-arrive${cls ? ' ' + cls : ''}" data-in="${tok}">${html}</span>`;
  const tool = (tok, text, cls = '') => `<span class="au-tool cm-arrive${cls ? ' ' + cls : ''}" data-in="${tok}"><i class="au-spin" aria-hidden="true"></i>${I('check', 'au-tool-ok')}<span>${esc(text)}</span></span>`;
  const waHead = (key, sub = 'Conta comercial') => `<div class="cm-wa-head">${I('back')}${marca(key)}<span><b>${esc(CLIENTES[key].marca)}</b><small>${esc(sub)}</small></span>${I('video')}${I('phone')}</div>`;
  const waCompose = (text = '', tap = '', attrs = '') => `<div class="cm-wa-compose"${attrs}><span class="cm-wa-row">${I('plus')}<span class="cm-wa-field${text ? '' : ' cm-wa-field--empty'}">${esc(text)}</span>${tap ? `<span class="cm-wa-send" data-tap="${tap}" data-hs="3">${I('send')}</span>` : `${I('camera')}${I('mic')}`}</span></div>`;
  const mask = '<span class="au-mask" aria-label="valor oculto">R$ ••••</span>';
  const waGlyph = `${logoSvg('whatsapp', { altura: 16, classe: 'cm-wa-glyph' })}${logoSvg('whatsapp', { altura: 16, mono: 'branco', classe: 'cm-wa-glyph cm-wa-glyph--lit' })}`;

  /* A fictitious bank app, used where a Pix is authorized (no real bank's colours or marks). */
  const banco = (inner, cls = '') => `<div class="au-bank${cls ? ' ' + cls : ''}"><div class="au-bank-top">${I('back')}<b><i class="au-bank-mark" aria-hidden="true">BE</i>Banco Exemplo</b>${I('dots')}</div>${inner}</div>`;
  const row = (k, v) => `<span class="au-row"><small>${esc(k)}</small><b>${v}</b></span>`;

  const mocks = {
    /* WhatsApp: click-to-WhatsApp ad, AI agent with tools, a Flow, handoff to a person
       with the AI summary, order_details with Pix by bank app switch, payment
       reconciled, order_status. The failure path (x1–x3) lets the Pix expire first. */
    waAgente: () => screen('waag au', scene('ad', 'base', 'escuro', LAB.feedAd({ key: 'turismo', captionOpen: true,
      media: `<div class="cm-wa-art au-art">${pic('crencas', { alt: 'Rua de pedra com bandeirolas e uma igreja ao entardecer.', pos: '50% 18%' })}<b data-hs="1" style="background:${CLIENTES.turismo.cor}">Festa do Divino em grupo pequeno</b>${marca('turismo', 'circulo', 'cm-wa-art-mark')}</div>`,
      cta: { text: 'Enviar mensagem pelo WhatsApp', lead: waGlyph },
      caption: { hs: '2', html: 'Festa do Divino em junho. <span class="cm-more">mais</span><span class="cm-rest">Monte o orçamento da família pela conversa.</span>' } })) +
      scene('chat', 'push', 'claro', `<span class="cm-crumb">${I('back')}Instagram</span>${waHead('turismo')}
        <div class="cm-wa-body"><span class="cm-wa-sys">As mensagens são protegidas com a criptografia de ponta a ponta.</span><span class="cm-wa-day">Hoje</span>
          ${out('a1', `<span class="cm-wa-quote">${pic('crencas', { pos: '50% 18%' })}<span><b>Bandeirola Viagens</b><small>Festa do Divino em grupo pequeno</small></span></span>Olá! Quero saber da Festa do Divino.`)}
          ${inn('a2', 'Oi! Sou a assistente virtual da Bandeirola. Monto o orçamento com você agora e chamo uma consultora quando precisar. Quem vai viajar?', { who: ia() })}
          ${out('a3', 'Eu, meu marido e duas crianças, em junho.')}
          ${tool('a3', 'Consultando saídas de junho para 4 pessoas')}
          ${inn('a4', `Tenho duas saídas com vaga. Escolha a sua e as idades por aqui:<span class="au-wa-btn" data-tap="flow" data-hs="2">${I('doc')}Montar orçamento</span>`, { who: ia(), hs: '2' })}
          ${out('a5', `<span class="au-flowreply"><b>${I('doc', 'cm-i--inline')}Orçamento</b><span>19 a 22 de junho · 2 adultos e 2 crianças (2 e 9 anos)</span><span>Criança de 2 anos paga aéreo?</span></span>`, '10:11')}
          ${inn('a5', 'Essa resposta depende da tarifa, então quem confirma é a nossa consultora. Já passei o resumo para a Júlia.', { who: ia(), time: '10:11' })}
          <div class="au-summary cm-arrive" data-in="a6" data-out="a7"><small>${I('people', 'cm-i--inline')}Bastidor · o que a consultora recebe</small><b>Família de 4, Festa do Divino, 19 a 22 de junho.</b><span>Dúvida: criança de 2 anos no aéreo. Veio do anúncio. Resumo gerado por IA.</span></div>
          ${inn('a7', 'Oi, Marina! Aqui é a Júlia. Li o resumo, não precisa repetir nada. Criança até 2 anos viaja no colo, sem assento. Separei a saída de 19 de junho:', { who: pessoa('Júlia · Bandeirola Viagens'), time: '10:12' })}
          <div class="cm-wa-in au-order cm-arrive" data-in="a7"><span class="au-order-top">${pic('crencas', { pos: '50% 18%' })}<span><b>Pré-reserva · Festa do Divino</b><small>19 a 22 de junho · 4 viajantes</small></span></span><span class="au-order-total"><small>Sinal da pré-reserva</small>${mask}</span>
            <span class="au-order-state" data-in="x1" data-out="x2">${I('info', 'cm-i--inline')}Código Pix expirado</span>
            <span class="au-order-state au-order-state--ok" data-in="a8" data-hs="3">${I('check', 'cm-i--inline')}Pagamento confirmado</span>
            <span class="au-wa-btn au-wa-btn--pay" data-tap="pay" data-hs="3" data-out="a8">Revisar e pagar</span><small>10:12</small></div>
          ${inn('x1', `O código Pix expirou sem pagamento. Gerei um novo, válido por 30 minutos, para a mesma pré-reserva.<span class="au-wa-btn" data-tap="pay2" data-out="a8">Pagar com o novo código</span>`, { who: ia(), time: '10:44' })}
          ${inn('a8', 'Pagamento confirmado! A pré-reserva está garantida. Mandei o roteiro e os documentos por e-mail.', { who: pessoa('Júlia · Bandeirola Viagens'), time: '10:13' })}
        </div>${waCompose('Olá! Quero saber da Festa do Divino.', 'send', ' data-out="a1"')}${waCompose('', '', ' data-in="a1"')}`) +
      scene('flow', 'sheet', 'claro', `<div class="au-flow"><div class="au-flow-top">${I('close')}<b>Montar orçamento</b>${I('vdots')}</div>
        <div class="au-flow-step" data-out="f2"><b class="au-flow-h">Escolha a saída</b><small>Festa do Divino · grupo pequeno</small>
          <span class="au-opt"><span><b>12 a 15 de junho</b><small>Quinta a domingo</small></span><i></i></span>
          <span class="au-opt au-opt--pick" data-pick="f1" data-tap="fo"><span><b>19 a 22 de junho</b><small>Cavalhadas no sábado</small></span><i></i></span>
          <b class="au-flow-h au-flow-h--sm">Quem vai</b><span class="au-chips"><span class="is-on">2 adultos</span><span class="is-on">2 crianças</span></span></div>
        <div class="au-flow-step" data-in="f2"><b class="au-flow-h">Idades das crianças</b><span class="au-field"><small>Criança 1</small><b>2 anos</b></span><span class="au-field"><small>Criança 2</small><b>9 anos</b></span><span class="au-field au-field--area"><small>Alguma dúvida para a consultora?</small><b>Criança de 2 anos paga aéreo?</b></span></div>
        <div class="au-flow-foot"><span class="au-flow-go" data-tap="fnext" data-out="f2">Continuar</span><span class="au-flow-go" data-tap="fsend" data-in="f2">Enviar</span><small>Gerenciado pela empresa. ${I('lock', 'cm-i--inline')}Saiba mais</small></div></div>`) +
      scene('pay', 'sheet', 'claro', `<div class="cm-sheet au-pay"><span class="cm-grabber"></span><p class="cm-wa-sheet-top">${I('close')}<b>Revisar pedido</b><i></i></p>
        <span class="au-pay-line">${pic('crencas', { pos: '50% 18%' })}<span><b>Pré-reserva · Festa do Divino</b><small>Bandeirola Viagens · 4 viajantes</small></span></span>
        <span class="au-row au-row--total"><small>Total</small><b>${mask}</b></span>
        <small class="au-pay-label">Pagar com Pix · escolha seu banco</small>
        <span class="au-bankpick" data-pick="b1" data-tap="bank"><i class="au-bank-mark" aria-hidden="true">BE</i><b>Banco Exemplo</b><i class="au-radio"></i></span>
        <span class="au-bankpick"><i class="au-bank-mark au-bank-mark--2" aria-hidden="true">BM</i><b>Banco Modelo</b><i class="au-radio"></i></span>
        <span class="au-bankpick"><i class="au-bank-mark au-bank-mark--3" aria-hidden="true">${I('copy')}</i><b>Outro banco · Pix copia e cola</b><i class="au-radio"></i></span>
        <span class="cm-btn cm-btn--wa au-pay-go" data-tap="bgo" data-hs="3">Continuar no app do banco</span></div>`, 'cm-scene--part') +
      scene('bank', 'push', 'claro', banco(`<div class="au-bank-body" data-out="ok"><small>Pagar com Pix</small><b class="au-bank-h">Confirme o pagamento</b>
        ${row('Para', 'Bandeirola Viagens')}${row('Instituição', 'PSP Exemplo')}${row('Valor', mask)}${row('Descrição', 'Pré-reserva Festa do Divino')}
        <span class="au-bank-go" data-tap="bok" data-hs="3">${I('lock', 'cm-i--inline')}Confirmar com Face ID</span></div>
        <div class="au-bank-done" data-in="ok"><span class="cm-done-check">${I('check')}</span><b>Pix enviado</b><small>Para Bandeirola Viagens</small><span class="au-bank-back">${I('back', 'cm-i--inline')}Voltar ao WhatsApp</span></div>`))),

    /* WhatsApp Business Calling: the business asks permission, calls, an AI voice
       agent books the test drive and transfers to a salesperson with context. */
    waChamada: () => screen('wacall au', scene('chat', 'base', 'claro', `${waHead('automotivo')}
        <div class="cm-wa-body"><span class="cm-wa-day">Hoje</span>
          ${out('', 'Quero fazer um test drive do SUV elétrico.', '10:07')}
          ${inn('', 'Oi, Marina! Sou a assistente virtual da Ondara. Posso te ligar agora pelo WhatsApp para combinar? Leva dois minutos.', { who: ia(), time: '10:08', typing: false })}
          <div class="cm-wa-in au-perm" data-hs="1"><span class="au-perm-ico">${I('phone')}</span><b>Ondara Elétricos quer ligar para você</b><small>Você pode mudar isso a qualquer momento nas configurações da conversa.</small><span class="au-perm-btn" data-tap="allow" data-out="a1">Permitir chamadas</span><span class="au-perm-btn au-perm-btn--no" data-out="a1">Agora não</span><span class="au-perm-ok" data-in="a1">${I('check', 'cm-i--inline')}Chamadas permitidas</span></div>
          ${sys('a1', `${I('phone', 'cm-i--inline')}Você permitiu que Ondara Elétricos ligue para você`)}
          <div class="cm-wa-in au-calllog cm-arrive" data-in="a2"><span class="au-calllog-ico">${I('phone')}</span><span><b>Chamada de voz</b><small>3 min</small></span><small>10:13</small></div>
          ${inn('a2', '<b>Test drive agendado</b><br>Sábado, 24 de outubro, às 9h, loja Pinheiros. Leve a carteira de motorista. O Rafael te recebe.', { who: pessoa('Rafael · Ondara Elétricos'), time: '10:13', hs: '3' })}
        </div>${waCompose()}`) +
      scene('call', 'fade', 'escuro', `<div class="au-wacall"><span class="au-wacall-e2e">${I('lock', 'cm-i--inline')}Criptografada de ponta a ponta</span>${marca('automotivo', 'circulo', 'au-wacall-av')}<b>Ondara Elétricos</b>
        <small class="au-wacall-st" data-out="c1">Chamada de voz do WhatsApp</small><small class="au-wacall-st" data-in="c1"><span data-out="c4">0:04 · Assistente virtual (IA)</span><span data-in="c4">1:52 · Rafael, vendedor</span></small>
        <div class="au-caps" data-in="c1"><small>${I('wave', 'cm-i--inline')}Legendas ao vivo</small>
          <p class="au-cap au-cap--them cm-arrive" data-in="c1" data-out="c3"><b>Ondara</b>Olá, Marina! Aqui é a assistente virtual da Ondara. Se preferir, chamo um vendedor a qualquer momento.</p>
          <p class="au-cap au-cap--me cm-arrive" data-in="c2" data-out="c4"><b>Você</b>Quero testar no sábado de manhã.</p>
          <p class="au-cap au-cap--them cm-arrive" data-in="c2" data-out="c4"><b>Ondara</b>Tenho 9h ou 10h30 na loja Pinheiros.</p>
          <p class="au-cap au-cap--me cm-arrive" data-in="c3" data-out="c4"><b>Você</b>9h. Dá para levar a cadeirinha das crianças?</p>
          <p class="au-cap au-cap--them cm-arrive" data-in="c3" data-out="c4"><b>Ondara</b>Boa pergunta para o vendedor. Vou te passar para o Rafael com o resumo.</p>
          <p class="au-cap au-cap--sys cm-arrive" data-in="c4">Transferido para Rafael, com o resumo da conversa</p>
          <p class="au-cap au-cap--them cm-arrive" data-in="c4"><b>Rafael</b>Oi, Marina! Dá sim, o carro tem Isofix. Sábado às 9h está confirmado.</p></div>
        <div class="au-wacall-in" data-out="c1"><span class="au-round au-round--no">${I('phone')}</span><span class="au-round au-round--yes" data-tap="accept" data-hs="2">${I('phone')}</span></div>
        <div class="au-wacall-bar" data-in="c1"><span>${I('speaker')}</span><span>${I('video')}</span><span>${I('mic')}</span><span class="au-round--end">${I('phone')}</span></div></div>`)),

    /* Instagram: a Reel with a native comment prompt; the keyword comment gets a
       private reply in Direct (one per comment), the reply opens the 24 h window. */
    igDirect: () => screen('igdm au', scene('reel', 'base', 'escuro', LAB.reelsAd({ key: 'varejo', caption: 'Teclaria Pro 15 em branco. Lista de espera aberta.', cta: { text: 'Saiba mais' },
      video: `<div class="cm-shots"><figure class="cm-shot" data-shot="1">${pic('nerd', { alt: 'Notebook com a tela acesa numa mesa escura.', pos: '50% 30%' })}<p class="cm-ontext" data-hs="1">O branco volta em novembro.</p>
        <span class="au-prompt" data-tap="cmt" data-hs="2">${I('comment', 'cm-i--inline')}Comente <b>BRANCO</b> e receba o link</span></figure></div>` })) +
      scene('comments', 'sheet', 'escuro', `<div class="cm-sheet au-cmts"><span class="cm-grabber"></span><b class="au-cmts-h">Comentários</b>
        <p class="au-cmt"><i></i><span><b>edita_noite</b>já quero</span></p><p class="au-cmt"><i></i><span><b>lucas_dev</b>BRANCO</span></p>
        <p class="au-cmt au-cmt--me cm-arrive" data-in="a1"><i></i><span><b>marina.alves</b>BRANCO</span></p>
        <p class="au-cmt au-cmt--reply cm-arrive" data-in="a1">${marca('varejo')}<span><b>teclaria</b>Te mandamos o link no Direct.</span></p>
        <span class="au-cmts-in"><span class="cm-typed" data-out="a1"><span>BRANCO</span></span><span class="au-cmts-send" data-tap="csend" data-out="a1">Publicar</span></span></div>`, 'cm-scene--part') +
      scene('dm', 'push', 'escuro', `<div class="au-dm"><div class="au-dm-head">${I('back')}${marca('varejo')}<span><b>teclaria</b><small>Empresa</small></span>${I('phone')}${I('video')}</div>
        <div class="au-dm-body"><span class="au-dm-ctx">Respondendo ao seu comentário no Reel</span>
          <p class="au-dm-in cm-arrive"><em class="au-who au-who--dark">Resposta automática</em>Oi, Marina! Aqui está a lista de espera do Teclaria Pro 15 branco.<span class="au-dm-btns"><span data-tap="join" data-hs="2">Entrar na lista</span><span>Ver especificações</span></span></p>
          <p class="au-dm-out" data-in="a2">Entrar na lista</p>
          <p class="au-dm-in cm-arrive" data-in="a2">Pronto, você está na lista. Quer o aviso por aqui quando chegar?<span class="au-dm-btns"><span data-tap="yes" data-out="a3">Sim, me avise</span></span></p>
          <p class="au-dm-out" data-in="a3">Sim, me avise</p>
          <p class="au-dm-in cm-arrive" data-in="a3">Combinado. Aviso por aqui, sem spam.</p>
          <span class="au-dm-day" data-in="a4">Hoje 18:40</span>
          <p class="au-dm-in cm-arrive" data-in="a4" data-hs="3">O branco chegou! Separamos um para você até amanhã.<span class="au-dm-btns"><span class="is-primary">Comprar agora</span></span></p></div>
        <div class="au-dm-in-bar"><i class="au-dm-cam">${I('camera')}</i><span>Mensagem…</span>${I('mic')}</div></div>`)),

    /* AI voice: the lead asks for a call on the clinic's page; the AI calls in
       seconds, says it is AI, books with a tool call and confirms on WhatsApp. */
    vozIA: () => screen('voice au', scene('page', 'base', 'claro', `${browserBar('Seixo Odontologia', 'seixo.exemplo')}<div class="au-lead" style="--brand:${CLIENTES.clinica.cor}"><span class="au-lead-hero">${pic('recepcao45', { alt: 'Recepção da clínica com parede terracota, sofá e plantas.', pos: '50% 55%' })}</span><span class="au-lead-brand">${marca('clinica')}<b>Seixo Odontologia</b></span>
        <div data-out="a1"><b class="au-lead-h" data-hs="1">Prefere conversar? A gente liga.</b><span class="au-field"><small>Nome</small><b>Marina Alves</b></span><span class="au-field"><small>Celular</small><b>(11) 9••••-••00</b></span>
          <span class="au-check is-on"><i>${I('check')}</i>Aceito receber uma ligação agora. Ela pode ser atendida por uma assistente virtual.</span>
          <span class="cm-btn au-lead-go" data-tap="send" data-hs="1">Pedir ligação</span><small class="cm-legal">[RT e CRO]</small></div>
        <div class="au-lead-ok" data-in="a1"><span class="cm-done-check">${I('phone')}</span><b>Recebemos. Vamos te ligar em instantes.</b><small>Se não puder atender, retornamos pelo WhatsApp.</small></div></div>`) +
      scene('ring', 'fade', 'escuro', `<div class="au-ios-call"><small>celular</small><b>Seixo Odontologia</b><span class="au-ios-call-sub">Assistente virtual · ligação pode ser gravada</span>
        <div class="au-ios-call-btns"><span><i class="au-round au-round--no">${I('phone')}</i>Recusar</span><span><i class="au-round au-round--yes" data-tap="accept" data-hs="2">${I('phone')}</i>Aceitar</span></div></div>`) +
      scene('call', 'fade', 'escuro', `<div class="au-ios-call au-ios-call--on"><b>Seixo Odontologia</b><small class="au-ios-timer"><span data-out="c4">0:06</span><span data-in="c4">Chamada encerrada · 1:24</span></small>
        <div class="au-caps"><small>${I('wave', 'cm-i--inline')}Legendas ao vivo</small>
          <p class="au-cap au-cap--them cm-arrive" data-out="c3"><b>Seixo</b>Oi, Marina! Aqui é a assistente virtual da Seixo. Esta ligação é atendida por IA. Se quiser, passo para a recepção.</p>
          <p class="au-cap au-cap--me cm-arrive" data-in="c2"><b>Você</b>Quero uma avaliação, de manhã.</p>
          <p class="au-cap au-cap--tool cm-arrive" data-in="c2" data-out="c3">${I('calendar', 'cm-i--inline')}Consultando a agenda</p>
          <p class="au-cap au-cap--them cm-arrive" data-in="c2"><b>Seixo</b>Tenho quinta, 29, às 9h ou sexta, 30, às 10h30.</p>
          <p class="au-cap au-cap--me cm-arrive" data-in="c3"><b>Você</b>Quinta às 9h.</p>
          <p class="au-cap au-cap--them cm-arrive" data-in="c3" data-hs="3" data-hs-at="tl"><b>Seixo</b>Agendado. Mando a confirmação e o endereço no WhatsApp.</p></div>
        <div class="au-ios-grid" data-out="c4"><span>${I('mic')}<small>silenciar</small></span><span>${I('menu')}<small>teclado</small></span><span>${I('speaker')}<small>áudio</small></span><span>${I('plus')}<small>adicionar</small></span><span>${I('video')}<small>FaceTime</small></span><span>${I('user')}<small>contatos</small></span></div>
        <span class="au-round au-round--no au-ios-end" data-out="c4">${I('phone')}</span></div>`)),

    /* RCS business messaging: a search result with a chat button (Message Ads,
       pilot in Brazil), a verified sender, rich cards, Pix and the delivery card. */
    rcsChat: () => screen('rcs au', scene('serp', 'base', 'claro', `<div class="cm-safe"><div class="cm-g-box" data-hs="1">${logoSvg('google', { altura: 18, classe: 'cm-g-logo' })}<span class="cm-typed"><span>notebook para edição de vídeo</span></span>${I('close')}${I('mic')}${I('lens')}</div>
        <div class="cm-g-tabs"><span>Modo IA</span><b>Todas</b><span>Shopping</span><span>Imagens</span><span>Vídeos</span></div>
        <div class="cm-g-results"><p class="cm-g-group">Resultado patrocinado</p>
          <div class="cm-g-ad"><div class="cm-g-site">${marca('varejo', 'fav')}<span><b>Teclaria</b><small>https://www.teclaria.exemplo › edicao</small></span>${I('vdots')}</div>
          <b class="cm-g-title" data-hs="2">Notebook para edição | Teclaria</b><p>Tire dúvidas por mensagem e pague com Pix na própria conversa.</p>
          <span class="au-g-chat" data-tap="chat" data-hs="2">${I('comment')}Conversar</span></div>${skel(4, 'cm-skel--result')}${skel(3, 'cm-skel--result')}</div></div>`) +
      scene('chat', 'push', 'claro', `<div class="au-rcs"><div class="au-rcs-head">${I('back')}${marca('varejo')}<span><b>Teclaria ${I('check', 'au-verified')}</b><small>Empresa verificada</small></span>${I('phone')}${I('vdots')}</div>
        <div class="au-rcs-body"><span class="au-rcs-day">Mensagem de chat (RCS) · Hoje</span>
          <div class="au-rcs-card cm-arrive">${pic('cenaNerd', { pos: '50% 62%' })}<span><b>Oi! Quer ajuda para escolher?</b><small>Respondo por aqui e você paga com Pix sem sair da conversa.</small></span></div>
          <span class="au-rcs-chips" data-out="a1"><span data-tap="edit" data-hs="2">Para edição de vídeo</span><span>Para jogos</span><span>Falar com vendedor</span></span>
          <p class="au-rcs-out" data-in="a1">Para edição de vídeo</p>
          <div class="au-rcs-row cm-arrive" data-in="a1"><div class="au-rcs-card au-rcs-card--sm">${pic('nerd', { pos: '50% 22%' })}<span><b>Teclaria Pro 15</b><small>32 GB · tela calibrada</small></span><span class="au-rcs-act" data-tap="buy" data-out="a2">Comprar</span><span class="au-rcs-act">Detalhes</span></div><div class="au-rcs-card au-rcs-card--sm">${pic('nerd', { pos: '85% 28%' })}<span><b>Teclaria Air 14</b><small>16 GB · leve</small></span><span class="au-rcs-act">Comprar</span><span class="au-rcs-act">Detalhes</span></div></div>
          <p class="au-rcs-out" data-in="a2">Comprar Teclaria Pro 15</p>
          <div class="au-rcs-pay cm-arrive" data-in="a2" data-out="a3"><b>Pedido 10482</b><span>Teclaria Pro 15, 32 GB, branco</span>${row('Total', mask)}<span class="au-rcs-act au-rcs-act--fill" data-tap="pix" data-hs="3">Pagar com Pix</span></div>
          <div class="au-rcs-pay au-rcs-pay--ok cm-arrive" data-in="a3" data-hs="3"><b>${I('check', 'cm-i--inline')}Pagamento confirmado</b><span>Pedido 10482 · separando para envio</span><span class="au-steps"><i class="is-on"></i><i class="is-on"></i><i></i><i></i></span><span class="au-rcs-act">Acompanhar entrega</span></div>
          <small class="au-rcs-fallback" data-in="a3">Sem RCS, a mesma conversa chega por SMS, só com texto.</small></div>
        <div class="au-rcs-in">${I('plus')}<span>Mensagem de chat</span>${I('mic')}</div></div>`)),

    /* Pix Automático: authorized once in the bank app; the D-1 notice; a failed
       debit becomes a WhatsApp message that offers a pause instead of a cancel. */
    pixAuto: () => screen('pixa au', scene('page', 'base', 'claro', `${browserBar('Sotaque Livre', 'sotaquelivre.exemplo')}<div class="au-plan" style="--brand:${CLIENTES.educacao.cor}"><span class="au-lead-hero">${pic('escola45', { alt: 'Fone de ouvido sobre a mesa, ao lado do caderno.', pos: '50% 45%' })}</span><span class="au-lead-brand">${marca('educacao')}<b>Sotaque Livre Idiomas</b></span>
        <small class="au-plan-k">Plano mensal</small><b class="au-plan-h" data-hs="1">Conversação às quintas, 19h</b><span class="au-plan-li">${I('check', 'cm-i--inline')}Turma de até 6 alunos</span><span class="au-plan-li">${I('check', 'cm-i--inline')}Pausa de um mês quando precisar</span>
        <span class="au-plan-pay"><b>Pague todo mês com Pix Automático</b><small>Você autoriza uma vez no app do seu banco. Dá para cancelar lá mesmo, quando quiser.</small></span>
        <span class="cm-btn au-lead-go" data-tap="sign" data-hs="1">Assinar com Pix Automático</span></div>`) +
      scene('bank', 'push', 'claro', banco(`<div class="au-bank-body" data-out="ok"><small>Pix Automático</small><b class="au-bank-h" data-hs="2">Autorizar pagamentos recorrentes</b>
        ${row('Recebedor', 'Sotaque Livre Idiomas')}${row('Periodicidade', 'Mensal')}${row('Primeiro pagamento', '5 de novembro')}${row('Valor', mask)}${row('Limite máximo', 'Você define')}
        <span class="au-bank-go" data-tap="auth" data-hs="2">${I('lock', 'cm-i--inline')}Autorizar</span><small class="au-bank-fine">Você recebe um aviso antes de cada pagamento.</small></div>
        <div class="au-bank-done" data-in="ok"><span class="cm-done-check">${I('check')}</span><b>Pix Automático autorizado</b><small>Sotaque Livre Idiomas · mensal</small><span class="au-bank-back">Gerenciar em Pix › Automático</span></div>`)) +
      scene('lock', 'fade', 'escuro', `<div class="au-lock"><small>terça-feira, 4 de novembro</small><b class="au-lock-time">10:09</b>
        <div class="au-note cm-arrive" data-out="a2"><span class="au-note-ico"><i class="au-bank-mark">BE</i></span><span><b>Banco Exemplo</b><small>Amanhã: Pix Automático para Sotaque Livre Idiomas.</small></span><small>agora</small></div>
        <div class="au-note cm-arrive" data-in="a2"><span class="au-note-ico"><i class="au-bank-mark">BE</i></span><span><b>Banco Exemplo</b><small>Pix Automático não realizado: saldo insuficiente.</small></span><small>9:01</small></div>
        <div class="au-note cm-arrive" data-in="a2" data-tap="wa" data-hs="3"><span class="au-note-ico au-note-ico--wa">${logoSvg('whatsapp', { altura: 22, mono: 'branco', classe: 'cm-push-glyph' })}</span><span><b>Sotaque Livre Idiomas</b><small>Oi, Marina! O pagamento de novembro não passou. Posso ajudar?</small></span><small>agora</small></div></div>`) +
      scene('wa', 'push', 'claro', `${waHead('educacao')}<div class="cm-wa-body"><span class="cm-wa-day">Hoje</span>
        ${inn('', `Oi, Marina! O Pix Automático de novembro não passou por saldo. Quer tentar de novo amanhã ou pausar um mês sem perder a vaga na turma?<span class="au-wa-btns" data-out="a3"><span>Tentar amanhã</span><span data-tap="pause" data-hs="3">Pausar 1 mês</span><span>Falar com a escola</span></span>`, { typing: false, time: '10:09' })}
        ${out('a3', 'Pausar 1 mês')}
        ${inn('a3', 'Pausado. Sua vaga de quinta às 19h continua reservada e a cobrança volta em dezembro. Até lá!', { hs: '3' })}
        </div>${waCompose()}`)),

    /* E-mail lifecycle: welcome, content and invite in the inbox, authenticated
       sender, one-click unsubscribe, the meeting booked and the lead suppressed. */
    emailRegua: () => screen('mailbox au', scene('inbox', 'base', 'claro', `<div class="cm-safe au-mail"><div class="au-mail-top">${I('back')}<span>Caixas</span><b>Editar</b></div><b class="au-mail-h">Caixa de Entrada</b>
        <div class="au-mail-row au-mail-row--new cm-arrive" data-in="a2" data-tap="open" data-hs="2">${marca('financas')}<span><b>Arrimo Patrimônio ${I('check', 'au-verified')}</b><strong>Marina, quer revisar o seu caso em 30 minutos?</strong><small>Separei três horários na próxima semana…</small></span><small>9:12</small></div>
        <div class="au-mail-row cm-arrive" data-in="a1">${marca('financas')}<span><b>Arrimo Patrimônio ${I('check', 'au-verified')}</b><strong>Três perguntas antes de separar o patrimônio</strong><small>A segunda costuma mudar a decisão…</small></span><small>Qui</small></div>
        <div class="au-mail-row" data-hs="1">${marca('financas')}<span><b>Arrimo Patrimônio ${I('check', 'au-verified')}</b><strong>Seu guia chegou</strong><small>Guia: patrimônio da empresa e da família, em PDF…</small></span><small>Seg</small></div>
        ${[['Revista Exemplo', 'Finanças da família, edição de outubro', 'Testamento, doação ou holding: o que muda…', 'Seg'], ['Condomínio Exemplo', 'Assembleia de novembro', 'Pauta e horário da reunião no salão…', 'Dom'], ['Loja Exemplo', 'Seu pedido saiu para entrega', 'Acompanhe o envio pelo link…', 'Sáb']].map(([de, assunto, previa, dia]) => `<div class="au-mail-row au-mail-row--old"><i class="au-mail-av" aria-hidden="true">${esc(de[0])}</i><span><b>${esc(de)}</b><strong>${esc(assunto)}</strong><small>${esc(previa)}</small></span><small>${dia}</small></div>`).join('')}</div>`) +
      scene('open', 'push', 'claro', `<div class="cm-safe au-mail au-mail-open"><div class="au-mail-top">${I('back')}<span>Caixa de Entrada</span>${I('vdots')}</div>
        <b class="au-mail-subj">Marina, quer revisar o seu caso em 30 minutos?</b><span class="au-mail-from">${marca('financas')}<span><b>Arrimo Patrimônio ${I('check', 'au-verified')}</b><small>para mim · 9:12</small></span></span>
        <p>Você leu o guia e as três perguntas. O próximo passo costuma ser olhar o seu caso com calma.</p><p>Uma conversa de 30 minutos, por vídeo, sem compromisso.</p>
        <span class="cm-btn au-mail-cta" data-tap="cta" data-hs="3" style="background:${CLIENTES.financas.cor}">Agendar conversa</span>
        <small class="au-mail-foot">Arrimo Patrimônio · Investimentos envolvem riscos.<br><u>Cancelar inscrição</u> com um clique.</small></div>`) +
      scene('page', 'push', 'claro', `${SITES.arrimo()}`, 'cm-scene--web')),

    /* Telegram: a channel post with buttons, a private view for one person, a
       Mini App with the plan and the subscription paid in Stars (digital goods). */
    tgClube: () => screen('tg au', scene('chat', 'base', 'claro', `<div class="au-tg"><div class="au-tg-head">${I('back')}${marca('educacao')}<span><b>Sotaque Livre · Clube</b><small>comunidade</small></span>${I('search')}${I('vdots')}</div>
        <div class="au-tg-body">
          <div class="au-tg-post" data-hs="1"><b class="au-tg-name">Sotaque Livre</b>${pic('escola45', { alt: 'Fone de ouvido sobre a mesa.', pos: '50% 40%' })}<p>Desafio da semana: complete a frase.<br><b>I'm looking forward ___ it.</b></p><small>10:00</small>
            <span class="au-tg-kb"><span data-tap="reply" data-hs="1">Responder</span><span>Ver ranking</span></span></div>
          <div class="au-tg-eph cm-arrive" data-in="a1"><small>${I('lock', 'cm-i--inline')}Só você vê esta mensagem</small><b>Escolha a palavra que falta:</b><span class="au-tg-kb au-tg-kb--3"><span>for</span><span data-tap="to" data-pick="a2">to</span><span>at</span></span>
            <p class="au-tg-res" data-in="a2"><b>Certo!</b> Seu nível é B1. Quer praticar três vezes por semana no grupo de conversação?</p>
            <span class="au-tg-kb" data-in="a2"><span data-tap="plan" data-hs="2">Ver o plano</span></span></div>
          <div class="au-tg-eph au-tg-eph--ok cm-arrive" data-in="a3" data-hs="3"><b>${I('check', 'cm-i--inline')}Assinatura ativa por 30 dias</b><p>Seu convite para o grupo de conversação:</p><span class="au-tg-kb"><span class="is-primary">Entrar no grupo</span></span></div></div>
        <div class="au-tg-in">${I('plus')}<span>Mensagem</span>${I('mic')}</div></div>`) +
      scene('mini', 'sheet', 'claro', `<div class="au-mini"><div class="au-mini-top"><b>${I('close', 'cm-i--inline')}Fechar</b><span>Sotaque Livre<small>mini app</small></span>${I('vdots')}</div>
        <div class="au-mini-body" style="--brand:${CLIENTES.educacao.cor}">${marca('educacao', 'app')}<b class="au-plan-h">Clube de conversação</b><small>Nível B1 · três encontros por semana · grupo no Telegram</small>
          <span class="au-plan-li">${I('check', 'cm-i--inline')}Desafios diários no canal</span><span class="au-plan-li">${I('check', 'cm-i--inline')}Correção de áudio pela professora</span>
          <span class="au-mini-go" data-tap="stars" data-hs="2" data-out="s1"><i class="au-star" aria-hidden="true">★</i>Assinar por 30 dias</span><small class="au-bank-fine">Prefere Pix? Assine pelo site da escola.</small></div>
        <div class="au-stars cm-arrive" data-in="s1"><span class="cm-grabber"></span><b>Confirmar assinatura</b><small>Clube de conversação · renova a cada 30 dias</small><span class="au-row"><small>Valor</small><b><i class="au-star" aria-hidden="true">★</i> ••••</b></span><span class="au-mini-go" data-tap="pay" data-hs="3" data-out="ok"><i class="au-star" aria-hidden="true">★</i>Confirmar e pagar</span><b class="au-stars-ok" data-in="ok">${I('check', 'cm-i--inline')}Pagamento confirmado</b></div></div>`, 'cm-scene--part')),
  };

  const SCREEN = {
    waAgente: { tema: 'escuro', fundo: '#0c1014' },
    igDirect: { tema: 'escuro', fundo: '#000' },
  };

  const passos3 = (a, b, c) => [P('Atenção', a[0], a[1]), P('Retenção', b[0], b[1]), P('Conversão', c[0], c[1])];

  /* Placements added to existing channels. */
  const extra = {
    whatsapp: [
      { id: 'agente', label: 'Agente e Pix', mock: 'waAgente', cliente: 'turismo', selo: 'Patrocinado',
        frase: 'Uma agência qualifica com IA, passa para uma consultora com o resumo e recebe o Pix na conversa.',
        base: 'WhatsApp Business Platform: Conversation Routing, Flows, Payments BR (Pix por redirecionamento, 16/10/2026) e Conversions API.',
        passos: passos3(['Anúncio abre a conversa', [0, 1, 2]], ['IA qualifica e monta o orçamento', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]], ['Consultora assume, Pix e confirmação', [13, 14, 15, 16, 17, 18, 19, 20, 21]]),
        quadros: [
          { ms: 1400, cena: 'ad', desc: 'Anúncio patrocinado da Bandeirola Viagens no Instagram: Festa do Divino em grupo pequeno.', log: [['Anúncio', 'Anúncio de clique para o WhatsApp entregue', 'campanha: festa-do-divino · objetivo: conversas']] },
          { ms: 1500, cena: 'ad', estado: 'open lit', desc: 'A legenda convida a montar o orçamento pela conversa. A barra Enviar mensagem pelo WhatsApp acende.' },
          { ms: 900, cena: 'ad', estado: 'open lit', toque: 'cta', desc: 'Toque em Enviar mensagem pelo WhatsApp.', log: [['Cliente', 'Toque no anúncio', 'abre o WhatsApp com a mensagem pronta']] },
          { ms: 1400, cena: 'chat', toque: 'send', desc: 'A conversa abre com a prévia do anúncio. Toque em enviar.' },
          { ms: 1500, cena: 'chat', estado: 'a1', desc: 'A mensagem sai com a citação do anúncio.', log: [['WhatsApp', 'Mensagem recebida pelo webhook', 'referral.ctwa_clid capturado (mascarado)'], ['Sistema', 'Janela gratuita aberta', 'conversa iniciada por anúncio: até 7 dias']] },
          { ms: 2100, cena: 'chat', estado: 'a1 a2', desc: 'A assistente virtual se apresenta como IA e pergunta quem vai viajar.', log: [['Agente IA', 'Intenção identificada', 'pacote_festa · confiança alta'], ['Agente IA', 'Identifica-se como assistente virtual', 'caminho para uma pessoa sempre disponível']] },
          { ms: 2000, cena: 'chat', estado: 'a1 a2 a3', desc: 'Marina responde: ela, o marido e duas crianças, em junho. A IA consulta as saídas.', log: [['Agente IA', 'Ferramenta: buscar_saidas', 'junho · 2 adultos e 2 crianças → 2 saídas com vaga']] },
          { ms: 2000, cena: 'chat', estado: 'a1 a2 a3 a4', desc: 'A IA oferece montar o orçamento num formulário dentro do WhatsApp.', log: [['WhatsApp', 'Flow enviado', 'endpoint de dados criptografado']] },
          { ms: 900, cena: 'chat', estado: 'a1 a2 a3 a4', toque: 'flow', desc: 'Toque em Montar orçamento.' },
          { ms: 1500, cena: 'flow', desc: 'O formulário abre sobre a conversa: escolha da saída e quem vai.' },
          { ms: 900, cena: 'flow', toque: 'fo', desc: 'Toque em 19 a 22 de junho, com cavalhadas no sábado.' },
          { ms: 900, cena: 'flow', estado: 'f1', toque: 'fnext', desc: 'A saída fica marcada. Toque em Continuar.', log: [['WhatsApp', 'Flow: troca de dados', 'saída 19–22/06 validada no servidor']] },
          { ms: 1400, cena: 'flow', estado: 'f1 f2', toque: 'fsend', desc: 'Idades das crianças, 2 e 9 anos, e uma dúvida: criança de 2 anos paga aéreo? Toque em Enviar.' },
          { ms: 2300, cena: 'chat', estado: 'a1 a2 a3 a4 a5', desc: 'O orçamento chega na conversa. A IA explica que a tarifa quem confirma é a consultora.', log: [['Agente IA', 'Confiança abaixo do limite', 'dúvida tarifária fora da política'], ['WhatsApp', 'Transferência para a caixa humana', 'pass_thread_control com resumo gerado por IA']] },
          { ms: 2200, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6', desc: 'Nos bastidores, a consultora Júlia recebe a conversa com o resumo gerado pela IA.', log: [['Humano', 'Consultora assume com o histórico', 'a cliente não repete nada (Decreto 13.135/2026)'], ['CRM', 'Negócio criado', 'etapa: orçamento · origem: anúncio']] },
          { ms: 2300, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7', desc: 'Júlia responde a dúvida e envia a pré-reserva, com o valor e o botão Revisar e pagar.', log: [['WhatsApp', 'order_details enviado', 'pix_dynamic_code · flow_type: APPSWITCH']] },
          { ms: 900, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7', toque: 'pay', desc: 'Toque em Revisar e pagar.' },
          { ms: 1400, cena: 'pay', toque: 'bank', desc: 'Revisão do pedido e a lista de bancos para pagar com Pix. Toque em Banco Exemplo.' },
          { ms: 900, cena: 'pay', estado: 'b1', toque: 'bgo', desc: 'Toque em Continuar no app do banco.' },
          { ms: 1500, cena: 'bank', toque: 'bok', desc: 'O app do banco abre com o Pix pronto, sem copiar código. Toque em Confirmar com Face ID.', log: [['Banco', 'App do banco abre pelo redirecionamento', 'cliente não copia nem cola código']] },
          { ms: 1600, cena: 'bank', estado: 'ok', desc: 'Pix enviado para a Bandeirola Viagens.', log: [['PSP', 'Webhook pix.paid recebido', 'txid conferido (mascarado)'], ['PSP', 'Webhook duplicado descartado', 'chave de idempotência já processada']] },
          { ms: 2200, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 a8', desc: 'De volta ao WhatsApp: pagamento confirmado na pré-reserva e a mensagem da consultora.', log: [['WhatsApp', 'order_status: processing', 'pagamento conferido no PSP, não pelo WhatsApp'], ['Meta CAPI', 'Evento Purchase enviado', 'com ctwa_clid e event_id para deduplicação'], ['CRM', 'Etapa: pré-reserva paga', 'o anúncio aprende com quem pagou']] },
        ] },
      { id: 'chamada', label: 'Chamada', mock: 'waChamada', cliente: 'automotivo', selo: 'Conversa, não é anúncio',
        frase: 'Uma concessionária pede permissão, liga pelo WhatsApp, a IA agenda e passa para o vendedor.',
        base: 'WhatsApp Business Calling API: pedido de permissão (1 por dia, 2 por semana), chamadas iniciadas pela empresa no Brasil, SIP.',
        passos: passos3(['Pedido de permissão na conversa', [0, 1, 2]], ['IA atende e agenda por voz', [3, 4, 5, 6]], ['Vendedor assume e confirma', [7, 8]]),
        quadros: [
          { ms: 1800, cena: 'chat', desc: 'Conversa com a Ondara Elétricos: a assistente virtual pede para ligar pelo WhatsApp.', log: [['WhatsApp', 'Pedido de permissão de chamada', 'limite: 1 por dia e 2 por semana']] },
          { ms: 900, cena: 'chat', toque: 'allow', desc: 'Toque em Permitir chamadas.' },
          { ms: 1500, cena: 'chat', estado: 'a1', desc: 'Chamadas permitidas.', log: [['WhatsApp', 'Permissão concedida', 'revogada após 4 chamadas não atendidas']] },
          { ms: 1500, cena: 'call', toque: 'accept', desc: 'Chamada de voz do WhatsApp da Ondara Elétricos. Toque em aceitar.', log: [['Telefonia', 'Chamada iniciada pela empresa', 'agente de voz conectado por SIP']] },
          { ms: 2300, cena: 'call', estado: 'c1', desc: 'A assistente se apresenta como IA e oferece um vendedor a qualquer momento. As legendas aparecem ao vivo.', log: [['Agente IA', 'Abre a ligação se identificando', 'caminho para uma pessoa oferecido']] },
          { ms: 2300, cena: 'call', estado: 'c1 c2', desc: 'Marina pede sábado de manhã. A IA oferece 9h ou 10h30 na loja Pinheiros.', log: [['Agente IA', 'Ferramenta: agenda_test_drive', 'sábado · loja Pinheiros → 2 horários']] },
          { ms: 2300, cena: 'call', estado: 'c1 c2 c3', desc: 'Ela escolhe 9h e pergunta da cadeirinha. A IA passa para o vendedor com o resumo.', log: [['Agente IA', 'Transferência com contexto', 'SIP REFER · resumo enviado ao vendedor']] },
          { ms: 2300, cena: 'call', estado: 'c1 c2 c3 c4', desc: 'Rafael, vendedor, assume e confirma o test drive.', log: [['Humano', 'Vendedor atende já sabendo o pedido', 'test drive sábado, 9h']] },
          { ms: 2300, cena: 'chat', estado: 'a1 a2', desc: 'Na conversa, o registro da chamada e o test drive agendado para sábado, 24, às 9h.', log: [['CRM', 'Resumo e transcrição salvos', 'próximo passo: test drive'], ['Meta CAPI', 'Evento Schedule enviado', 'origem: conversa do WhatsApp']] },
        ] },
    ],
    instagram: [
      { id: 'direct', label: 'Comentário', mock: 'igDirect', cliente: 'varejo', selo: 'Patrocinado',
        frase: 'Uma loja transforma um comentário no Reel em conversa no Direct e avisa quando o produto chega.',
        base: 'Instagram API: prompt de comentário (28/09/2026), comentários de todas as cópias do anúncio (20/10/2026), resposta privada.',
        passos: passos3(['Pedido de comentário no Reel', [0, 1]], ['Comentário vira conversa no Direct', [2, 3, 4, 5]], ['Lista de espera e aviso de chegada', [6, 7, 8, 9]]),
        quadros: [
          { ms: 1500, cena: 'reel', video: 1, desc: 'Reel patrocinado da Teclaria: o branco volta em novembro. Comente BRANCO e receba o link.', log: [['Anúncio', 'Reel com pedido de comentário', 'prompt nativo de comentário']] },
          { ms: 900, cena: 'reel', estado: 'lit', video: 1, toque: 'cmt', desc: 'Toque em Comente BRANCO.' },
          { ms: 1500, cena: 'comments', toque: 'csend', desc: 'Os comentários abrem com BRANCO digitado. Toque em Publicar.' },
          { ms: 1700, cena: 'comments', estado: 'a1', desc: 'O comentário aparece e a Teclaria responde: te mandamos o link no Direct.', log: [['Instagram', 'Webhook de comentário', 'palavra-chave BRANCO, em qualquer cópia do anúncio']] },
          { ms: 1800, cena: 'dm', desc: 'No Direct, a resposta automática traz a lista de espera do Teclaria Pro 15 branco.', log: [['Automação', 'Resposta privada ao comentário', 'uma mensagem por comentário, como manda a regra']] },
          { ms: 900, cena: 'dm', toque: 'join', desc: 'Toque em Entrar na lista.' },
          { ms: 1700, cena: 'dm', estado: 'a2', desc: 'Pronto, está na lista. Quer o aviso por aqui?', log: [['Sistema', 'Janela de conversa aberta', 'a resposta da cliente abre 24 h de atendimento']] },
          { ms: 900, cena: 'dm', estado: 'a2', toque: 'yes', desc: 'Toque em Sim, me avise.' },
          { ms: 1600, cena: 'dm', estado: 'a2 a3', desc: 'Combinado: aviso por aqui, sem spam.', log: [['CRM', 'Contato na lista de espera', 'origem: comentário no anúncio']] },
          { ms: 2300, cena: 'dm', estado: 'a2 a3 a4', desc: 'No fim do dia, o aviso: o branco chegou, com o botão Comprar agora.', log: [['CRM', 'Estoque atualizado dispara o aviso', 'dentro da janela de 24 h aberta pela cliente'], ['Meta CAPI', 'Evento Lead com origem no comentário', 'event_id para deduplicação']] },
        ] },
    ],
  };

  /* New channels. Without an official logo file they get a generic glyph (static-presentations.js). */
  const novos = [
    { id: 'telegram', name: 'Telegram', group: 'local', benefit: 'Comunidade que paga e volta.', glifo: 'send',
      art: art('educacao', 'escola45', '50% 40%', 'Complete a frase e entre no clube', 'Peça da Sotaque Livre Idiomas, escola de idiomas fictícia: fone de ouvido sobre a mesa e o desafio da semana.'),
      placements: [
        { id: 'clube', label: 'Comunidade', mock: 'tgClube', cliente: 'educacao', selo: 'Canal, não é anúncio',
          frase: 'Uma escola faz um desafio no canal, mostra o resultado só para quem respondeu e vende a assinatura em Stars.',
          base: 'Telegram Bot API 10.2 e 10.3 (jul. e ago. de 2026): mensagens efêmeras, botões na mensagem, assinaturas em Stars.',
          passos: passos3(['Desafio com botões no canal', [0, 1]], ['Resposta que só você vê', [2, 3, 4, 5]], ['Mini app e assinatura em Stars', [6, 7, 8, 9]]),
          quadros: [
            { ms: 1600, cena: 'chat', desc: 'Canal da Sotaque Livre no Telegram: desafio da semana, complete a frase.', log: [['Telegram', 'Post com botões dentro da mensagem', 'Bot API 10.3']] },
            { ms: 900, cena: 'chat', toque: 'reply', desc: 'Toque em Responder.' },
            { ms: 1600, cena: 'chat', estado: 'a1', desc: 'Uma mensagem que só Marina vê traz as três opções.', log: [['Bot', 'Mensagem efêmera para uma pessoa', 'o grupo não vê a resposta dela']] },
            { ms: 900, cena: 'chat', estado: 'a1', toque: 'to', desc: 'Toque em to.' },
            { ms: 1800, cena: 'chat', estado: 'a1 a2', desc: 'Certo! Nível B1, com o convite para o grupo de conversação.', log: [['Bot', 'Resultado salvo no perfil', 'nível B1 · interesse: conversação']] },
            { ms: 900, cena: 'chat', estado: 'a1 a2', toque: 'plan', desc: 'Toque em Ver o plano.' },
            { ms: 1600, cena: 'mini', toque: 'stars', desc: 'O mini app abre com o clube de conversação. Toque em Assinar por 30 dias.', log: [['Mini app', 'Dados de login validados no servidor', 'assinatura do Telegram conferida']] },
            { ms: 1400, cena: 'mini', estado: 's1', toque: 'pay', desc: 'Confirmação da assinatura em Stars, renovada a cada 30 dias. Toque em Confirmar e pagar.' },
            { ms: 1200, cena: 'mini', estado: 's1 ok', desc: 'Pagamento confirmado.', log: [['Telegram', 'Pagamento em Stars confirmado', 'bens digitais no app exigem Stars']] },
            { ms: 2300, cena: 'chat', estado: 'a1 a2 a3', desc: 'De volta ao canal: assinatura ativa e o convite para entrar no grupo.', log: [['Bot', 'Convite com assinatura de 30 dias', 'acesso sai sozinho se a assinatura acabar']] },
          ] },
      ] },
    { id: 'rcs', name: 'RCS', group: 'search', benefit: 'Da busca à conversa verificada.', glifo: 'comment',
      art: art('varejo', 'nerd', '50% 28%', 'Escolha o notebook pela conversa', 'Peça da Teclaria, loja de tecnologia fictícia: notebook com a tela acesa numa mesa escura.'),
      placements: [
        { id: 'conversa', label: 'Mensagem de chat', mock: 'rcsChat', cliente: 'varejo', selo: 'Resultado patrocinado',
          frase: 'Uma loja abre uma conversa verificada a partir da busca e fecha o pedido com Pix. Botão na busca em piloto no Brasil.',
          base: 'RCS for Business (Google): remetente verificado, cartões ricos, respostas sugeridas; Message Ads em piloto no Brasil.',
          passos: passos3(['Botão Conversar na busca', [0, 1, 2]], ['Remetente verificado e cartões', [3, 4, 5, 6]], ['Pix e entrega na conversa', [7, 8, 9]]),
          quadros: [
            { ms: 1500, cena: 'serp', estado: 'typing', desc: 'Busca no Google: notebook para edição de vídeo.' },
            { ms: 1700, cena: 'serp', estado: 'r', desc: 'O resultado patrocinado da Teclaria tem o botão Conversar.', log: [['Anúncio', 'Resultado com botão de conversa', 'Message Ads (piloto no Brasil)']] },
            { ms: 900, cena: 'serp', estado: 'r', toque: 'chat', desc: 'Toque em Conversar.' },
            { ms: 1800, cena: 'chat', desc: 'O app de mensagens abre a conversa com a Teclaria, empresa verificada, e um cartão com opções.', log: [['RCS', 'Remetente verificado', 'marca, cor e selo aprovados']] },
            { ms: 900, cena: 'chat', toque: 'edit', desc: 'Toque em Para edição de vídeo.' },
            { ms: 2000, cena: 'chat', estado: 'a1', desc: 'Dois notebooks em cartões que deslizam, com Comprar e Detalhes.', log: [['Agente IA', 'Recomenda pelo catálogo', '2 modelos para edição']] },
            { ms: 900, cena: 'chat', estado: 'a1', toque: 'buy', desc: 'Toque em Comprar no Teclaria Pro 15.' },
            { ms: 1800, cena: 'chat', estado: 'a1 a2', desc: 'O pedido 10482 chega na conversa com o botão Pagar com Pix.', log: [['PSP', 'Cobrança Pix criada', 'txid ligado ao pedido']] },
            { ms: 900, cena: 'chat', estado: 'a1 a2', toque: 'pix', desc: 'Toque em Pagar com Pix.' },
            { ms: 2400, cena: 'chat', estado: 'a1 a2 a3', desc: 'Pagamento confirmado e o cartão da entrega. Sem RCS, a conversa chegaria por SMS.', log: [['PSP', 'Pix confirmado', 'conciliado pelo webhook'], ['Google Ads', 'Conversão offline enviada', 'com o identificador do clique']] },
          ] },
      ] },
    { id: 'voz', name: 'Voz com IA', group: 'local', benefit: 'Ligar enquanto o interesse está quente.', glifo: 'phone',
      art: art('clinica', 'consultorio45', '50% 50%', 'Peça a ligação. A gente liga agora.', 'Peça da Seixo Odontologia, clínica odontológica fictícia: consultório claro com cadeira e luz natural.'),
      placements: [
        { id: 'ligacao', label: 'Ligação', mock: 'vozIA', cliente: 'clinica', selo: 'Ligação pedida, não é anúncio',
          frase: 'Uma clínica liga em instantes para quem pediu, com uma assistente que se identifica como IA e agenda na hora.',
          base: 'Agentes de voz em tempo real (out./2026), Anatel Despacho 100/2026 sobre chamadas abusivas e Decreto 13.135/2026 do SAC.',
          passos: passos3(['Pedido de ligação com consentimento', [0, 1, 2]], ['IA liga e se identifica', [3, 4, 5]], ['Agenda na ligação e confirma', [6, 7]]),
          quadros: [
            { ms: 1700, cena: 'page', desc: 'Página da Seixo Odontologia: prefere conversar? A gente liga. Nome, celular e o aceite da ligação.', log: [['Site', 'Formulário com consentimento de ligação', 'aceite registrado com data e origem']] },
            { ms: 900, cena: 'page', toque: 'send', desc: 'Toque em Pedir ligação.' },
            { ms: 1500, cena: 'page', estado: 'a1', desc: 'Recebemos. Vamos te ligar em instantes.', log: [['Sistema', 'Contato na fila de discagem', 'meta: ligar em menos de 1 minuto'], ['Telefonia', 'Confere os limites da Anatel', 'chamadas por número abaixo do teto do dia']] },
            { ms: 1500, cena: 'ring', toque: 'accept', desc: 'O iPhone toca: Seixo Odontologia, assistente virtual. Toque em Aceitar.' },
            { ms: 2300, cena: 'call', estado: 'c1', desc: 'A assistente se apresenta como IA e oferece a recepção. As legendas aparecem ao vivo.', log: [['Agente IA', 'Abre a ligação se identificando', '"Esta ligação é atendida por IA"']] },
            { ms: 2400, cena: 'call', estado: 'c1 c2', desc: 'Marina pede uma avaliação de manhã. A IA consulta a agenda e oferece quinta ou sexta.', log: [['Agente IA', 'Ferramenta: horarios_livres', 'manhã · 2 opções']] },
            { ms: 2300, cena: 'call', estado: 'c1 c2 c3', desc: 'Ela escolhe quinta às 9h. Agendado, com a confirmação no WhatsApp.', log: [['Agente IA', 'Ferramenta: agendar', 'quinta, 29/10, 9h · avaliação']] },
            { ms: 1800, cena: 'call', estado: 'c1 c2 c3 c4', desc: 'Chamada encerrada.', log: [['CRM', 'Resumo e transcrição salvos', 'evento neutro: appointment_booked (área da saúde)']] },
          ] },
      ] },
    { id: 'pix', name: 'Pix Automático', group: 'retencao', benefit: 'Cobrar todo mês sem perder o aluno.', glifo: 'regen',
      art: art('educacao', 'escola916', '50% 50%', 'Autorize uma vez. Pause quando precisar.', 'Peça da Sotaque Livre Idiomas, escola de idiomas fictícia: fone de ouvido sobre o caderno.'),
      placements: [
        { id: 'recorrencia', label: 'Recorrência', mock: 'pixAuto', cliente: 'educacao', selo: 'Cobrança recorrente, não é anúncio',
          frase: 'Uma escola cobra a mensalidade com Pix Automático e, quando o débito falha, oferece pausa em vez de cancelamento.',
          base: 'Pix Automático (Banco Central): autorização única no app do pagador, aviso antes de cada cobrança e novas tentativas.',
          passos: passos3(['Plano mensal no site', [0, 1]], ['Autoriza uma vez no banco', [2, 3, 4, 5]], ['Falha vira pausa, não cancelamento', [6, 7, 8, 9, 10]]),
          quadros: [
            { ms: 1700, cena: 'page', desc: 'Plano mensal da Sotaque Livre: pague todo mês com Pix Automático.', log: [['Site', 'Plano mensal escolhido', 'recebedor habilitado no Pix Automático']] },
            { ms: 900, cena: 'page', toque: 'sign', desc: 'Toque em Assinar com Pix Automático.' },
            { ms: 1800, cena: 'bank', desc: 'O app do banco pede a autorização: recebedor, mensal, primeiro pagamento em 5 de novembro e o limite que ela define.', log: [['Banco', 'Pedido de autorização recebido', 'jornada no app de quem paga']] },
            { ms: 900, cena: 'bank', toque: 'auth', desc: 'Toque em Autorizar.' },
            { ms: 1500, cena: 'bank', estado: 'ok', desc: 'Pix Automático autorizado.', log: [['PSP', 'Autorização confirmada', 'recorrência ativa, sem cartão nem boleto']] },
            { ms: 1900, cena: 'lock', desc: 'Na véspera, o banco avisa na tela bloqueada: amanhã tem Pix Automático para a escola.', log: [['Banco', 'Aviso antes do débito', 'enviado antes de cada cobrança']] },
            { ms: 2100, cena: 'lock', estado: 'a2', desc: 'No dia, o débito não passa por saldo. A escola chama no WhatsApp.', log: [['PSP', 'Cobrança não realizada', 'saldo insuficiente · nova tentativa permitida'], ['Sistema', 'Régua de recuperação iniciada', 'WhatsApp primeiro, e-mail depois']] },
            { ms: 900, cena: 'lock', estado: 'a2', toque: 'wa', desc: 'Toque na mensagem da Sotaque Livre.' },
            { ms: 1800, cena: 'wa', desc: 'A escola oferece tentar de novo amanhã ou pausar um mês sem perder a vaga.' },
            { ms: 900, cena: 'wa', toque: 'pause', desc: 'Toque em Pausar 1 mês.' },
            { ms: 2300, cena: 'wa', estado: 'a3', desc: 'Pausado: a vaga de quinta continua reservada e a cobrança volta em dezembro.', log: [['CRM', 'Pausa no lugar do cancelamento', 'vaga mantida na turma'], ['PSP', 'Próxima cobrança reagendada', 'dezembro de 2026']] },
          ] },
      ] },
    { id: 'email', name: 'E-mail', group: 'retencao', benefit: 'Seguir a conversa até a reunião.', glifo: 'mail',
      art: art('financas', 'negocios', '50% 100%', 'Seu guia chegou. A próxima pergunta também.', 'Peça da Arrimo Patrimônio, gestora de patrimônio fictícia: mesa escura com caneta e cartão.'),
      placements: [
        { id: 'regua', label: 'Régua', mock: 'emailRegua', cliente: 'financas', selo: 'E-mail com inscrição, não é anúncio',
          frase: 'Uma gestora segue o lead do guia com três e-mails autenticados e para de enviar quando ele agenda.',
          base: 'Regras de remetente do Gmail e do Yahoo (autenticação e descadastro em um clique) e sincronização de leads do LinkedIn.',
          passos: passos3(['Guia entregue na caixa de entrada', [0]], ['Conteúdo e convite no momento certo', [1, 2, 3, 4]], ['Agenda e sai da régua', [5, 6, 7, 8, 9, 10, 11]]),
          quadros: [
            { ms: 1700, cena: 'inbox', desc: 'Caixa de entrada: o guia da Arrimo Patrimônio chegou, com o remetente verificado.', log: [['CRM', 'Lead do LinkedIn sincronizado', 'campo oculto com a campanha de origem'], ['E-mail', 'Boas-vindas com o guia', 'SPF, DKIM e DMARC alinhados']] },
            { ms: 1700, cena: 'inbox', estado: 'a1', desc: 'Quinta: três perguntas antes de separar o patrimônio.', log: [['E-mail', 'Conteúdo do terceiro dia', 'só para quem abriu o guia']] },
            { ms: 1800, cena: 'inbox', estado: 'a1 a2', desc: 'Dias depois, o convite: quer revisar o seu caso em 30 minutos?', log: [['E-mail', 'Convite do décimo dia', 'leu dois e-mails e ainda não agendou']] },
            { ms: 900, cena: 'inbox', estado: 'a1 a2', toque: 'open', desc: 'Toque no convite.' },
            { ms: 1800, cena: 'open', desc: 'O e-mail com o botão Agendar conversa e o descadastro em um clique no rodapé.', log: [['E-mail', 'Descadastro em um clique', 'List-Unsubscribe-Post no cabeçalho']] },
            { ms: 900, cena: 'open', toque: 'cta', desc: 'Toque em Agendar conversa.' },
            { ms: 1400, cena: 'page', desc: 'A agenda da Arrimo abre com os dias livres de outubro.' },
            { ms: 1000, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em terça, 27. Os horários do dia aparecem.' },
            { ms: 900, cena: 'page', estado: 'q1 q2', toque: 'b', desc: 'Toque em 10:00.' },
            { ms: 800, cena: 'page', estado: 'q1 q2', toque: 'c', desc: 'Toque em Próximo.' },
            { ms: 1300, cena: 'page', estado: 'w2 q3', toque: 'e', desc: 'Nome, e-mail e assunto preenchidos. Toque em Agendar.' },
            { ms: 2300, cena: 'page', estado: 'w3 done', desc: 'Conversa agendada: terça, 27 de outubro, 10h, por vídeo.', log: [['Sistema', 'Sai da régua de e-mail e dos anúncios', 'quem já agendou não recebe mais convite'], ['LinkedIn CAPI', 'Conversão enviada', 'reunião agendada']] },
          ] },
      ] },
  ];

  /* The failure path of the WhatsApp agent, played only in "Sistemas e automações". */
  const base = extra.whatsapp[0];
  const falha = { ...base, id: 'agente-falha', label: 'Agente e Pix, com falhas',
    passos: passos3(['Anúncio abre a conversa', [0, 1, 2]], ['IA qualifica e monta o orçamento', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]], ['Pix expira, novo código, pago', [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]]),
    quadros: [...base.quadros.slice(0, 18),
      { ms: 1800, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7', desc: 'Marina fecha a revisão sem pagar. A pré-reserva continua aberta na conversa.', log: [['Sistema', 'Pagamento pendente', 'código Pix válido por 30 minutos']] },
      { ms: 2300, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 x1', desc: 'Meia hora depois, o código expira. A IA avisa e envia um novo código para a mesma pré-reserva.', log: [['PSP', 'Cobrança expirou sem pagamento', 'webhook pix.expired'], ['Agente IA', 'Reenvia a cobrança', 'novo txid, mesma pré-reserva, sem refazer o orçamento']] },
      { ms: 900, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 x1', toque: 'pay2', desc: 'Toque em Pagar com o novo código.' },
      { ms: 1400, cena: 'bank', toque: 'bok', desc: 'O app do banco abre com o novo Pix. Toque em Confirmar com Face ID.', log: [['Banco', 'App do banco abre pelo redirecionamento', 'segundo código, primeiro pagamento']] },
      { ms: 1500, cena: 'bank', estado: 'ok', desc: 'Pix enviado.', log: [['PSP', 'Webhook pix.paid recebido duas vezes', 'a cópia é descartada pela chave de idempotência']] },
      { ms: 2300, cena: 'chat', estado: 'a1 a2 a3 a4 a5 a6 a7 x1 x2 a8', desc: 'Pagamento confirmado na pré-reserva, com uma só cobrança registrada.', log: [['WhatsApp', 'order_status: processing', 'um pedido, um pagamento'], ['Meta CAPI', 'Evento Purchase enviado uma vez', 'event_id evita contar em dobro']] },
    ] };

  const AVISOS = {
    'whatsapp/agente': { app: 'mail', cliente: 'turismo', texto: 'Pré-reserva confirmada: Festa do Divino, 19 a 22 de junho. Roteiro e documentos aqui.', desc: 'O roteiro chega por e-mail, na notificação do iPhone.', log: [['E-mail', 'Roteiro enviado', 'remetente autenticado · descadastro em um clique']] },
    'voz/ligacao': { app: 'whatsapp', cliente: 'clinica', texto: 'Avaliação confirmada: quinta, 29, às 9h. Para remarcar, é só responder.', desc: 'A confirmação e o endereço chegam pelo WhatsApp.', log: [['WhatsApp', 'Confirmação por modelo de utilidade', 'lembrete na véspera agendado']] },
    'pix/recorrencia': { app: 'mail', cliente: 'educacao', texto: 'Sua assinatura está pausada até dezembro. A vaga de quinta continua sua.', desc: 'A pausa é confirmada por e-mail.', log: [['E-mail', 'Confirmação da pausa', 'mesma informação do WhatsApp, outro canal']] },
  };

  return { mocks, SCREEN, extra, novos, AVISOS, hidden: { 'whatsapp/agente-falha': falha } };
}
