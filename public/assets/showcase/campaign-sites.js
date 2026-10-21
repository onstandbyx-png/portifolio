/* Advertisers' sites inside the in-app browsers and Safari: one site per client,
   each with its own look and the steps its real flow has. The steps live in one
   scene and slide inside the fixed browser chrome (frame states w2 to w6); a
   choice lights up when the finger lands on it (q1 to q6, data-pick), and what a
   choice reveals appears with it (data-show). Taps use the keys a to h.
   Patterns from the lab: one question per step (K18 form, e18), the cart button
   that turns into progress (alternative pages), the calendar and time list of the
   Fatos plan drawer, suggested chips (smiile chat). Everything is fictitious:
   brands, addresses, people and numbers. No prices, ratings or results. */
export function makeSites({ I, pic, marca, esc, CLIENTES }) {
  const step = (n, html, cls = '') => `<section class="cm-site-step${cls ? ' ' + cls : ''}" data-step="${n}">${html}</section>`;
  const site = (key, cls, steps) => `<div class="cm-site cm-site--${cls}" style="--brand:${CLIENTES[key].cor}">${steps.map((html, i) => step(i + 1, html)).join('')}</div>`;
  const body = (html, cls = '') => `<div class="cm-site-body${cls ? ' ' + cls : ''}">${html}</div>`;
  const foot = html => `<div class="cm-site-foot">${html}</div>`;
  const cta = (text, tap, hs = '3', cls = '') => `<span class="cm-site-cta${cls ? ' ' + cls : ''}" data-tap="${tap}"${hs ? ` data-hs="${hs}"` : ''}>${esc(text)}</span>`;
  const pk = (text, { q = '', on = false, tap = '', cls = '', sub = '', off = false, icon = '' } = {}) => `<span class="cm-pk${on ? ' is-on' : ''}${off ? ' is-off' : ''}${cls ? ' ' + cls : ''}"${q ? ` data-pick="${q}"` : ''}${tap ? ` data-tap="${tap}"` : ''}>${icon ? I(icon) : ''}<span>${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</span></span>`;
  const label = text => `<p class="cm-site-label">${esc(text)}</p>`;
  const field = (lab, value) => `<div class="cm-site-field"><small>${esc(lab)}</small><span>${esc(value)}</span></div>`;
  const tick = (text, on = true) => `<p class="cm-site-tick${on ? ' is-on' : ''}"><i>${I('check')}</i>${esc(text)}</p>`;
  const show = (q, html, cls = '') => `<div class="cm-show${cls ? ' ' + cls : ''}" data-show="${q}">${html}</div>`;
  const ok = (title, text) => `<span class="cm-site-ok">${I('check')}</span><b class="cm-site-h">${esc(title)}</b><p class="cm-site-p">${esc(text)}</p>`;
  const actions = items => `<div class="cm-site-actions">${items.map(([icon, text]) => `<span>${I(icon)}${esc(text)}</span>`).join('')}</div>`;
  const back = text => `<p class="cm-site-back">${I('back')}<b>${esc(text)}</b></p>`;
  const days = (list, q, tap) => `<div class="cm-days">${list.map(([d, n, flag]) => pk(n, { sub: d, cls: 'cm-day', q: flag === 'q' ? q : '', tap: flag === 'q' ? tap : '', on: flag === 'on', off: flag === 'off' })).join('')}</div>`;
  const slots = (list, pick, q, tap, cls = '') => `<div class="cm-slots${cls ? ' ' + cls : ''}">${list.map(t => pk(t, t === pick ? { q, tap } : {})).join('')}</div>`;
  const ticket = (rows, cls = '') => `<div class="cm-ticket${cls ? ' ' + cls : ''}" data-hs="3">${rows.map(([k, v, wide]) => `<span${wide ? ` class="${wide === 2 ? 'is-half' : 'is-wide'}"` : ''}><small>${esc(k)}</small><b>${esc(v)}</b></span>`).join('')}</div>`;
  const mapa = (place, address) => `<div class="cm-site-map">${pic('mapa', { cls: 'cm-site-map-img', pos: '62% 36%' })}<span class="cm-site-pin">${I('location')}</span><span class="cm-site-map-cap"><b>${esc(place)}</b><small>${esc(address)}</small></span></div>`;

  /* Restaurant: warm paper, serif titles, the menu first. Reservation (date, people,
     time, details, ticket) or pickup (bag, pickup window, pay on pickup, order tracker). */
  function tacho({ variant = 'reserva', slot = '13:00', people = '2', area = 'Salão' } = {}) {
    const head = `<header class="cm-tm-head">${marca('restaurante')}<b>Tacho Miúdo</b>${I('menu')}</header>`;
    const hero = `<div class="cm-tm-hero">${pic('panela11', { pos: '50% 40%' })}<span><em>Aberto agora</em><b>Sábado tem feijoada no tacho</b><small>Rua Exemplo, 88, Vila Madalena</small></span></div>`;
    const dish = (img, name, text, tag, add = '') => `<li>${pic(img)}<span><b>${esc(name)}</b><small>${esc(text)}</small><em>${esc(tag)}</em></span>${add}</li>`;
    if (variant === 'retirada') {
      const add = `<span class="cm-tm-add" data-tap="a" data-pick="q1"><i class="cm-tm-plus">${I('plus')}</i><i class="cm-tm-one">1</i></span>`;
      return site('restaurante', 'tacho', [
        `${head}${body(`${hero}<nav class="cm-tm-tabs"><span>Reservas</span><b>Retirada</b><span>Como chegar</span></nav>
          <ul class="cm-tm-menu">${dish('panela11', 'Feijoada no tacho', 'Carnes separadas, arroz, couve, farofa e laranja.', 'Serve 2', add)}${dish('escondidinho11', 'Escondidinho de carne-seca', 'Gratinado na panelinha.', 'Serve 1', `<span class="cm-tm-add"><i class="cm-tm-plus">${I('plus')}</i></span>`)}${dish('pudim11', 'Pudim de leite', 'Inteiro, feito na casa.', 'Serve 6', `<span class="cm-tm-add"><i class="cm-tm-plus">${I('plus')}</i></span>`)}</ul>`)}
          ${show('q1', `<span class="cm-tm-bag" data-tap="b" data-hs="3"><i>1</i><b>Ver sacola</b><small>Retirada no balcão</small></span>`, 'cm-show--foot')}`,
        `${head}${body(`${back('Sua sacola')}<div class="cm-tm-line">${pic('panela11')}<span><b>Feijoada no tacho</b><small>Serve 2</small></span><span class="cm-stepper cm-stepper--sm"><i>−</i><b>1</b><i>+</i></span></div>
          ${label('Retirada no balcão, sábado, 24 de outubro')}${slots(['12:00 a 12:30', '12:30 a 13:00', '13:00 a 13:30', '13:30 a 14:00'], '12:30 a 13:00', 'q2', 'c', 'cm-slots--wide')}
          <p class="cm-site-note">${I('info')}A cozinha começa o seu pedido 30 minutos antes da janela escolhida.</p>`)}${foot(cta('Continuar', 'd'))}`,
        `${head}${body(`${back('Finalizar pedido')}${label('Pagamento na retirada')}<div class="cm-radios">${pk('Pix no balcão', { on: true, cls: 'cm-radio' })}${pk('Cartão no balcão', { cls: 'cm-radio' })}</div>
          ${label('Quem retira')}${field('Nome', 'Marina Alves')}${field('WhatsApp', '(11) 90000-0000')}<p class="cm-site-note">${I('phone')}Avisamos pelo WhatsApp quando estiver pronto.</p>`)}${foot(cta('Fazer pedido', 'e'))}`,
        `${head}${body(`${ok('Pedido 0427 recebido', 'Retirada no balcão, sábado, entre 12:30 e 13:00.')}
          <ol class="cm-track" data-hs="3"><li class="is-on"><i>${I('check')}</i><span><b>Recebido</b><small>Agora</small></span></li><li><i></i><span><b>Em preparo</b><small>A partir das 12:00</small></span></li><li><i></i><span><b>Pronto para retirar</b><small>Avisamos pelo WhatsApp</small></span></li></ol>
          ${actions([['route', 'Como chegar'], ['phone', 'Ligar']])}`, 'cm-site-body--end')}`,
      ]);
    }
    const booking = `${head}${body(`${back('Reservar mesa')}${label('Dia')}${days([['Sex', '23'], ['Sáb', '24', 'on'], ['Dom', '25'], ['Seg', 'Fechado', 'off']])}
      <div class="cm-row-2"><span>${label('Pessoas')}<span class="cm-stepper"><i>−</i><b>${esc(people)}</b><i>+</i></span></span><span>${label('Onde sentar')}<span class="cm-pks">${pk('Salão', { on: area === 'Salão' })}${pk('Varanda', { on: area === 'Varanda' })}</span></span></div>
      ${label('Horário do almoço')}${slots(['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'], slot, 'q1', 'b')}`)}${foot(cta('Continuar', 'c'))}`;
    const details = `${head}${body(`${back('Seus dados')}<div class="cm-tm-summary">${I('calendar')}<span><b>Sábado, 24 de outubro</b><small>${esc(slot)}, ${esc(people)} pessoas, ${esc(area.toLowerCase())}</small></span></div>
      ${field('Nome', 'Marina Alves')}${field('WhatsApp', '(11) 90000-0000')}${label('É uma ocasião especial?')}<span class="cm-pks">${pk('Aniversário', { q: 'q2', tap: 'd' })}${pk('Encontro')}${pk('Não')}</span>
      <p class="cm-site-note">${I('info')}A mesa fica guardada por 15 minutos. A confirmação chega pelo WhatsApp.</p>`)}${foot(cta('Confirmar reserva', 'e'))}`;
    const done = `${head}${body(`${ok('Reserva solicitada', 'O Tacho Miúdo confirma pelo WhatsApp.')}${ticket([['Dia', 'Sáb, 24 out'], ['Horário', slot], ['Pessoas', people], ['Mesa', area], ['Ocasião', variant === 'reserva' ? 'Aniversário' : 'Não informada', 2]])}${actions([['calendar', 'Adicionar à agenda'], ['route', 'Como chegar']])}`, 'cm-site-body--end')}`;
    if (variant === 'direto') return site('restaurante', 'tacho', [booking, details, done]);
    return site('restaurante', 'tacho', [
      `${head}${body(`${hero}<nav class="cm-tm-tabs"><b>Cardápio</b><span>Reservas</span><span>Como chegar</span></nav><ul class="cm-tm-menu">${dish('panela11', 'Feijoada no tacho', 'Carnes separadas, arroz, couve, farofa e laranja.', 'Serve 2')}${dish('escondidinho11', 'Escondidinho de carne-seca', 'Gratinado na panelinha.', 'Serve 1')}${dish('pudim11', 'Pudim de leite', 'Inteiro, feito na casa.', 'Serve 6')}</ul>`)}${foot(cta('Reservar mesa', 'a'))}`,
      booking, details, done,
    ]);
  }

  /* Language school: coral, round shapes, a quiz first. Level test (landing, one
     question at a time, level meter) or straight to the class schedule. */
  function sotaque({ variant = 'teste', pick = 'nivel' } = {}) {
    const head = `<header class="cm-sl-head">${marca('educacao')}<b>Sotaque Livre</b><span>Entrar</span></header>`;
    const schedule = (withLevel) => `${withLevel ? `<div class="cm-sl-level"><small>Seu nível</small><b>Intermediário (B1)</b><span class="cm-sl-meter">${['A1', 'A2', 'B1', 'B2', 'C1'].map(l => `<i${l === 'B1' ? ' class="is-on"' : ''}>${l}</i>`).join('')}</span></div>` : `${label('Seu nível')}<span class="cm-pks">${pk('Começando')}${pk('Intermediário', pick === 'nivel' ? { q: 'q1', tap: 'a' } : { on: true })}${pk('Avançado')}</span>`}
      ${label('Dia da aula experimental')}${days([['Ter', '27'], ['Qui', '29', 'on'], ['Sáb', '31']])}
      ${label('Horário')}${slots(['18:00', '19:00', '20:00'], '19:00', withLevel ? 'q2' : 'q2', withLevel ? 'd' : 'b')}
      ${label('Como prefere')}<span class="cm-seg2">${pk('Online', pick === 'modalidade' ? {} : { on: true })}${pk('Na unidade', pick === 'modalidade' ? { q: 'q1', tap: 'a' } : {})}</span>`;
    const form = (tap) => `${head}${body(`${back('Seus dados')}<div class="cm-sl-chip">${I('calendar')}Quinta, 29 de outubro, 19:00</div>${field('Nome', 'Marina Alves')}${field('E-mail', 'marina@exemplo.com')}${field('WhatsApp', '(11) 90000-0000')}${tick('Quero receber o material da aula por e-mail')}`)}${foot(cta('Confirmar aula', tap))}`;
    const done = (where) => `${head}${body(`${ok('Aula marcada', where === 'Na unidade' ? 'Endereço e horário chegam por e-mail.' : 'O link da sala chega por e-mail.')}${ticket([['Dia', 'Qui, 29 out'], ['Horário', '19:00'], ['Nível', 'Intermediário'], ['Aula', where], ['Duração', '30 minutos', 2]], 'cm-ticket--sl')}
      <div class="cm-sl-before"><b>Antes da aula</b>${tick(where === 'Na unidade' ? 'Chegue 10 minutos antes' : 'Teste o fone e a câmera')}${tick('Pense em uma série que você gosta', false)}</div>${actions([['calendar', 'Adicionar ao calendário']])}`, 'cm-site-body--end')}`;
    if (variant === 'agenda') {
      const where = pick === 'modalidade' ? 'Na unidade' : 'Online';
      return site('educacao', 'sotaque', [`${head}${body(`${back('Aula experimental')}${schedule(false)}`)}${foot(cta('Continuar', 'c'))}`, form('d'), done(where)]);
    }
    return site('educacao', 'sotaque', [
      `${head}${body(`<div class="cm-sl-hero">${pic('escola45', { pos: '50% 46%' })}<span>Aula experimental</span></div><b class="cm-sl-title">Descubra seu nível e marque uma aula de 30 minutos</b>
        ${tick('Professor ao vivo')}${tick('Online ou na unidade')}${tick('Horários à noite e aos sábados')}`)}${foot(cta('Fazer o teste de nível', 'a'))}`,
      `${head}${body(`<div class="cm-sl-q"><small>Pergunta 3 de 3</small><span class="cm-site-progress" style="--p:1"><i></i></span></div><b class="cm-sl-title">Como se diz “mal posso esperar” em inglês?</b>
        <div class="cm-options">${pk('I can’t wait it', { cls: 'cm-option' })}${pk('I’m looking forward to it', { cls: 'cm-option cm-option--right', q: 'q1', tap: 'b' })}${pk('I look forward it', { cls: 'cm-option' })}</div>
        ${show('q1', `<p class="cm-sl-feedback">${I('check')}Isso. Essa expressão é do nível intermediário.</p>`)}`)}${foot(cta('Ver meu resultado', 'c'))}`,
      `${head}${body(schedule(true))}${foot(cta('Continuar', 'e'))}`,
      form('f'),
      done('Online'),
    ]);
  }

  /* Dental clinic: white and mint, a three-step booking bar. Service, a month
     calendar with free days, time list, patient data, confirmation with the map. */
  function seixo() {
    const head = n => `<header class="cm-sx-head">${marca('clinica')}<span><b>Seixo Odontologia</b><small>Agendamento online</small></span></header><ol class="cm-sx-steps">${['Serviço', 'Horário', 'Seus dados'].map((s, i) => `<li${i < n ? ' class="is-done"' : i === n ? ' class="is-on"' : ''}><i>${i < n ? I('check') : i + 1}</i>${s}</li>`).join('')}</ol>`;
    const free = [22, 23, 27, 28, 29, 30];
    const cal = `<div class="cm-cal"><p><b>Outubro de 2026</b><span>${I('back')}${I('chevron')}</span></p><div class="cm-cal-grid">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => `<small>${d}</small>`).join('')}${'<i></i>'.repeat(4)}${Array.from({ length: 31 }, (_, k) => { const d = k + 1; return d === 29 ? `<span class="cm-cal-free" data-pick="q2" data-tap="c">${d}</span>` : `<span class="${d < 21 ? 'is-past' : d === 21 ? 'is-today' : free.includes(d) ? 'cm-cal-free' : ''}">${d}</span>`; }).join('')}</div></div>`;
    return site('clinica', 'seixo', [
      `${head(0)}${body(`${label('O que você precisa?')}<div class="cm-radios">${pk('Avaliação odontológica', { cls: 'cm-radio', sub: '30 minutos, para quem vem pela primeira vez', q: 'q1', tap: 'a' })}${pk('Limpeza e prevenção', { cls: 'cm-radio', sub: '45 minutos' })}${pk('Clareamento', { cls: 'cm-radio', sub: 'Começa com uma avaliação' })}${pk('Dor ou urgência', { cls: 'cm-radio', sub: 'Encaixe conforme a agenda do dia' })}</div>
        ${label('Atendimento')}<span class="cm-seg2">${pk('Particular', { on: true })}${pk('Convênio')}</span>`)}${foot(cta('Ver horários', 'b'))}`,
      `${head(1)}${body(`${cal}${show('q2', `${label('Quinta, 29 de outubro')}${slots(['08:30', '09:00', '10:30', '14:00', '16:30'], '09:00', 'q3', 'd')}`)}`)}${foot(cta('Continuar', 'e'))}`,
      `${head(2)}${body(`<div class="cm-sx-sum">${I('calendar')}<span><b>Avaliação odontológica</b><small>Quinta, 29 de outubro, 09:00</small></span></div>${field('Nome completo', 'Marina Alves')}${field('Celular', '(11) 90000-0000')}${field('Data de nascimento', '12/03/1990')}
        ${label('Primeira vez na clínica?')}<span class="cm-seg2">${pk('Sim', { on: true })}${pk('Não')}</span>${tick('Lembrete pelo WhatsApp um dia antes')}`)}${foot(cta('Confirmar agendamento', 'f'))}`,
      `${head(3)}${body(`${ok('Avaliação agendada', 'Você recebe o lembrete pelo WhatsApp na quarta.')}${ticket([['Dia', 'Qui, 29 out'], ['Horário', '09:00'], ['Duração', '30 minutos'], ['Serviço', 'Avaliação odontológica', 1]], 'cm-ticket--sx')}${mapa('Seixo Odontologia', 'Rua Exemplo, 120, Pinheiros')}${actions([['calendar', 'Adicionar à agenda'], ['route', 'Como chegar']])}<small class="cm-legal">Responsável técnico e CRO aparecem aqui.</small>`, 'cm-site-body--end')}`,
    ]);
  }

  /* Developer: editorial and quiet, sand and deep teal, serif. Gallery of the show
     house, kind of visit, day and time, contact, confirmation with the address. */
  function falesia() {
    const head = (light) => `<header class="cm-mf2-head${light ? ' is-light' : ''}">${marca('incorporadora')}<b>Morada Falésia</b>${I('menu')}</header>`;
    return site('incorporadora', 'falesia', [
      `<div class="cm-mf2-gallery">${pic('salaMar45', { pos: '50% 50%', cls: 'cm-mf2-g1' })}${pic('coast', { pos: '34% 50%', cls: 'cm-mf2-g2' })}<span class="cm-mf2-count">1/12</span></div>${head(true)}
        ${body(`<small class="cm-mf2-kicker">Decorado aberto</small><b class="cm-mf2-title">Casas na falésia, com a sala voltada para o mar</b>
        <div class="cm-mf2-facts"><span><b>3 e 4</b><small>quartos</small></span><span><b>Mar</b><small>da sala e da suíte</small></span><span><b>Sáb e dom</b><small>visitas</small></span></div>
        <nav class="cm-mf2-tabs"><b>Plantas</b><span>Localização</span><span>Lazer</span></nav>`, 'cm-mf2-body')}${foot(cta('Agendar visita', 'a'))}`,
      `${head(false)}${body(`${back('Agendar visita')}${label('Como você quer conhecer')}<div class="cm-radios">${pk('No decorado', { cls: 'cm-radio', icon: 'home', sub: 'Com um corretor, cerca de 1 hora', q: 'q1', tap: 'b' })}${pk('Por vídeo', { cls: 'cm-radio', icon: 'video', sub: 'Tour ao vivo pelo celular' })}</div>
        ${label('Dia')}${days([['Sáb', '24', 'on'], ['Dom', '25'], ['Ter', '27'], ['Qua', '28']])}${label('Horário')}${slots(['10:00', '11:30', '15:00', '16:30'], '11:30', 'q2', 'c')}`)}${foot(cta('Continuar', 'd'))}`,
      `${head(false)}${body(`${back('Seus dados')}<div class="cm-mf2-sum"><b>Sábado, 24 de outubro, 11:30</b><small>No decorado, com corretor</small></div>${field('Nome', 'Marina Alves')}${field('E-mail', 'marina@exemplo.com')}${field('WhatsApp', '(11) 90000-0000')}
        ${label('Interesse')}<span class="cm-pks">${pk('3 quartos')}${pk('4 quartos', { on: true })}</span><p class="cm-legal">Ao confirmar, você aceita receber o contato da Morada Falésia sobre esta visita.</p>`)}${foot(cta('Confirmar visita', 'e'))}`,
      `${head(false)}${body(`${ok('Visita agendada', 'Um corretor recebe você no decorado.')}${ticket([['Dia', 'Sáb, 24 out'], ['Horário', '11:30'], ['Duração', 'Cerca de 1 hora'], ['Visita', 'No decorado, com corretor', 1]], 'cm-ticket--mf')}${mapa('Decorado Morada Falésia', 'Av. Exemplo, 400, Praia do Exemplo')}${actions([['calendar', 'Adicionar à agenda'], ['route', 'Como chegar']])}<small class="cm-legal">Imagens ilustrativas. CRECI e registro de incorporação aparecem aqui.</small>`, 'cm-site-body--end')}`,
    ]);
  }

  return { tacho, sotaque, seixo, falesia };
}
