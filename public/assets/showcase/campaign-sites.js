/* Advertisers' sites inside the in-app browsers and Safari: one site per client,
   each with its own look (the brand theme of marcas.js: title face, corner radius
   and where the second colour goes) and the steps its real flow has. The steps
   live in one scene and slide inside the fixed browser chrome (frame states w2 to
   w8); a choice lights up when the finger lands on it (q1 to q8, data-pick), and
   what a choice reveals appears with it (data-show). Taps use the keys a to k.
   Every step fills the screen with real content (what is included, the next
   steps, the address, the sector line) and every control on a site is either
   tapped in some frame or plain information. Names, dates, orders, people and
   streets come from marcas.js; everything is fictitious. Prices stay masked. */
import { CLIENTES, OFERTAS, LEGAL, TERCEIROS, PESSOA, PEDIDOS, HOJE, dataCurta, dataLonga } from './marcas.js';

const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
/* '09:00' → '9h', '11:30' → '11h30' */
export const horaFala = h => { const [hh, mm] = String(h).split(':'); return `${Number(hh)}h${mm && mm !== '00' ? mm : ''}`; };
/* a business day count from today, skipping the weekend */
const uteis = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); while (n > 0) { d.setUTCDate(d.getUTCDate() + 1); if (d.getUTCDay() % 6) n--; } return d.toISOString().slice(0, 10); };
const dia = iso => Number(iso.slice(8, 10));
/* '13:00' plus 15 minutes → '13:15' */
const somaMin = (h, n) => { const [a, b] = h.split(':').map(Number), t = a * 60 + b + n; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
const PRECO = 'R$ ••••';

/* A Pix QR drawn from a fixed seed: finder squares and modules, never a payable code. */
function qrSvg(cls = 'cm-qr') {
  let seed = 20261021, cells = '';
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const finder = (x, y) => `<path d="M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z" fill-rule="evenodd"/>`;
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
    const inFinder = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
    if (!inFinder && rnd() > .52) cells += `M${x} ${y}h1v1h-1z`;
  }
  return `<svg class="${cls}" viewBox="-1 -1 27 27" aria-hidden="true"><rect x="-1" y="-1" width="27" height="27" fill="#fff"/><g fill="currentColor">${finder(0, 0)}${finder(18, 0)}${finder(0, 18)}<path d="${cells}"/></g></svg>`;
}
const BR_CODE = '00020101021226870014br.gov.bcb.pix2565qrpix.jatoba.pag/v2/cobv/7f3a9c51e2d84b6a5204000053039865802BR5910PONTO TECH6009SAO PAULO62070503***6304B1E7';

export function makeSites({ I, pic, marca, esc, avatar = () => '', planta = () => '' }) {
  const step = (n, html, cls = '') => `<section class="cm-site-step${cls ? ' ' + cls : ''}" data-step="${n}">${html}</section>`;
  /* A site with the brand theme: colour, second colour, title face, radius and accent. */
  const site = (key, cls, steps, brand = CLIENTES[key].cor) => {
    const c = CLIENTES[key], t = c.tema || {};
    const style = `--brand:${brand};--brand2:${c.cor2 || brand};--site-font:${t.fonte || 'inherit'};--site-fs:${t.estilo || 'normal'};--site-fw:${t.peso || 700};--site-r:calc(var(--u)*${t.raio ?? 12})`;
    return `<div class="cm-site cm-site--${cls}" data-acento="${t.acento || ''}" style="${esc(style)}">${steps.map((html, i) => step(i + 1, html)).join('')}</div>`;
  };
  const body = (html, cls = '') => `<div class="cm-site-body${cls ? ' ' + cls : ''}">${html}</div>`;
  const foot = html => `<div class="cm-site-foot">${html}</div>`;
  const cta = (text, tap, hs = '3', cls = '') => `<span class="cm-site-cta${cls ? ' ' + cls : ''}" data-tap="${tap}"${hs ? ` data-hs="${hs}"` : ''}>${esc(text)}</span>`;
  const pk = (text, { q = '', on = false, tap = '', cls = '', sub = '', off = false, icon = '', hs = '' } = {}) => `<span class="cm-pk${on ? ' is-on' : ''}${off ? ' is-off' : ''}${cls ? ' ' + cls : ''}"${q ? ` data-pick="${q}"` : ''}${tap ? ` data-tap="${tap}"` : ''}${hs ? ` data-hs="${hs}"` : ''}>${icon ? I(icon) : ''}<span>${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</span></span>`;
  const label = text => `<p class="cm-site-label">${esc(text)}</p>`;
  const field = (lab, value) => `<div class="cm-site-field"><small>${esc(lab)}</small><span>${esc(value)}</span></div>`;
  const tick = (text, on = true) => `<p class="cm-site-tick${on ? ' is-on' : ''}"><i>${I('check')}</i>${esc(text)}</p>`;
  const show = (q, html, cls = '') => `<div class="cm-show${cls ? ' ' + cls : ''}" data-show="${q}">${html}</div>`;
  const ok = (title, text) => `<span class="cm-site-ok" data-hs="3">${I('check')}</span><b class="cm-site-h">${esc(title)}</b><p class="cm-site-p">${esc(text)}</p>`;
  /* Next actions on a confirmation: only the ones a frame taps ([icon, text, tap]). */
  const actions = items => `<div class="cm-site-actions">${items.map(([icon, text, tap]) => `<span${tap ? ` data-tap="${tap}"` : ''}>${I(icon)}${esc(text)}</span>`).join('')}</div>`;
  const back = text => `<p class="cm-site-back">${I('back')}<b>${esc(text)}</b></p>`;
  const days = (list, q, tap) => `<div class="cm-days">${list.map(([d, n, flag]) => pk(n, { sub: d, cls: 'cm-day', q: flag === 'q' ? q : '', tap: flag === 'q' ? tap : '', on: flag === 'on', off: flag === 'off' })).join('')}</div>`;
  const slots = (list, pick, q, tap, cls = '') => `<div class="cm-slots${cls ? ' ' + cls : ''}">${list.map(t => pk(t, t === pick ? { q, tap } : {})).join('')}</div>`;
  const ticket = (rows, cls = '') => `<div class="cm-ticket${cls ? ' ' + cls : ''}">${rows.map(([k, v, wide]) => `<span${wide ? ` class="${wide === 2 ? 'is-half' : 'is-wide'}"` : ''}><small>${esc(k)}</small><b>${esc(v)}</b></span>`).join('')}</div>`;
  /* What happens next, as a vertical tracker: [title, detail, on]. */
  const trilha = (rows, cls = '') => `<ol class="cm-track${cls ? ' ' + cls : ''}">${rows.map(([t, d, on]) => `<li${on ? ' class="is-on"' : ''}><i>${on ? I('check') : ''}</i><span><b>${esc(t)}</b><small>${esc(d)}</small></span></li>`).join('')}</ol>`;
  /* A short list with a title: information, never a control. */
  const lista = (title, items, icon = 'check') => `<div class="cm-site-list"><b>${esc(title)}</b><ul>${items.map(t => `<li>${I(icon)}<span>${esc(t)}</span></li>`).join('')}</ul></div>`;
  const legal = key => LEGAL[key] ? `<small class="cm-legal">${esc(LEGAL[key])}</small>` : '';
  const horario = key => `<p class="cm-site-hours">${I('calendar')}<span><b>Horário</b><small>${esc(OFERTAS[key].horario)}</small></span></p>`;
  /* Month calendar of October 2026 (it starts on a Thursday); past days are faded, free days carry a dot. */
  const calendar = ({ free, pick, q, tap, on = 0 }) => `<div class="cm-cal"><p><b>Outubro de 2026</b><span>${I('back')}${I('chevron')}</span></p><div class="cm-cal-grid">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => `<small>${d}</small>`).join('')}${'<i></i>'.repeat(4)}${Array.from({ length: 31 }, (_, k) => { const d = k + 1, hoje = dia(HOJE.iso); return d === on ? `<span class="cm-cal-free is-on">${d}</span>` : d === pick ? `<span class="cm-cal-free" data-pick="${q}" data-tap="${tap}">${d}</span>` : `<span class="${d < hoje ? 'is-past' : d === hoje ? 'is-today' : free.includes(d) ? 'cm-cal-free' : ''}">${d}</span>`; }).join('')}</div></div>`;
  const mapa = (place, address) => `<div class="cm-site-map">${pic('mapa', { cls: 'cm-site-map-img', pos: '62% 36%' })}<span class="cm-site-pin">${I('location')}</span><span class="cm-site-map-cap"><b>${esc(place)}</b><small>${esc(address)}</small></span></div>`;
  /* The place: a photo of the front, the address and how to get there (information, not a control). */
  const lugar = (img, title, text) => `<div class="cm-site-place">${pic(img, { pos: '50% 45%' })}<span><b>${esc(title)}</b><small>${esc(text)}</small></span></div>`;
  const head = (key, cls, extra = '') => `<header class="cm-site-head cm-${cls}-head">${marca(key)}<b>${esc(CLIENTES[key].curta || CLIENTES[key].marca)}</b>${extra}</header>`;

  /* Restaurant: warm paper, the menu first. Table booking (day, people, time, details,
     confirmation and what happens next) or pickup (bag, pickup window, pay at pickup,
     order tracker). At 10:09 the place is closed: it opens at 11:30. */
  function tacho({ variant = 'reserva', slot = OFERTAS.restaurante.reserva.hora, people = String(OFERTAS.restaurante.reserva.pessoas), area = 'Salão', agenda = false } = {}) {
    const k = 'restaurante', R = OFERTAS.restaurante, rua = TERCEIROS.ruas.restaurante;
    const top = head(k, 'tm', I('menu'));
    const hero = (title, img = 'panela11') => `<div class="cm-tm-hero">${pic(img, { pos: '50% 40%' })}<span><em>${esc(R.abreHoje)}</em><b>${esc(title)}</b><small>${esc(rua)}</small></span></div>`;
    const dish = (img, name, text, tag, add = '') => `<li>${pic(img)}<span><b>${esc(name)}</b><small>${esc(text)}</small><em>${esc(tag)}</em></span>${add}</li>`;
    const sab = R.reserva.iso, enc = R.encomenda;
    if (variant === 'retirada') {
      const add = `<span class="cm-tm-add" data-tap="a" data-pick="q1"><i class="cm-tm-plus">${I('plus')}</i><i class="cm-tm-one">1</i></span>`;
      const janela = `${enc.hora} a ${enc.hora.replace(':00', ':30')}`;
      return site(k, 'tacho', [
        `${top}${body(`${hero('Encomendas para sábado', 'panela11')}
          <p class="cm-tm-info">${I('store')}<span><b>Retirada no balcão</b><small>${esc(cap(dataLonga(enc.iso)))}, das 11h30 às 14h</small></span></p>
          <ul class="cm-tm-menu">${dish('panela11', enc.item, 'Carnes separadas, arroz, couve, farofa e laranja.', 'Serve 4', add)}${dish('escondidinho11', 'Escondidinho de carne-seca', 'Gratinado na panelinha.', 'Serve 2')}${dish('pudim11', 'Pudim de leite', 'Inteiro, feito na casa.', 'Serve 6')}</ul>
          <p class="cm-site-note">${I('info')}Encomendas para sábado até sexta às 18h.</p>`)}
          ${show('q1', `<span class="cm-tm-bag" data-tap="b" data-hs="3"><i>1</i><b>Ver sacola</b><small>Retirada no balcão</small></span>`, 'cm-show--foot')}`,
        `${top}${body(`${back('Sua sacola')}<div class="cm-tm-line">${pic('panela11')}<span><b>${esc(enc.item)}</b><small>Serve 4</small></span><b class="cm-price">${PRECO}</b></div>
          ${label(`Retirada no balcão, ${dataLonga(enc.iso)}`)}${slots(['11:30 a 12:00', janela, '12:30 a 13:00', '13:00 a 13:30'], janela, 'q2', 'c', 'cm-slots--wide')}
          <p class="cm-site-note">${I('info')}A cozinha separa o seu pedido 30 minutos antes da janela escolhida.</p>
          ${lista('Na sacola vai', ['Feijão com carnes separadas, em pote térmico', 'Arroz, couve, farofa e laranja à parte', 'Talheres só se você pedir'])}`)}${foot(cta('Continuar', 'd'))}`,
        `${top}${body(`${back('Finalizar pedido')}${label('Pagamento na retirada')}<div class="cm-radios">${pk('Pix no balcão', { on: true, cls: 'cm-radio', sub: 'Você paga quando chegar' })}${pk('Cartão no balcão', { cls: 'cm-radio', sub: 'Débito ou crédito' })}</div>
          ${label('Quem retira')}${field('Nome', PESSOA.nome)}${field('WhatsApp', PESSOA.telefone)}<p class="cm-site-note">${I('phone')}Avisamos pelo WhatsApp quando estiver pronto.</p>
          <div class="cm-site-sum"><span>${esc(enc.item)}</span><b>${PRECO}</b><span>Total</span><b>${PRECO}</b></div>
          ${lugar('fachada43', 'Retirada no balcão', `${rua}. Mostre o número do pedido no caixa.`)}`)}${foot(cta('Fazer pedido', 'e'))}`,
        `${top}${body(`${ok(`Pedido ${PEDIDOS['instagram/live']} recebido`, `Retirada no balcão, ${dataLonga(enc.iso)}, entre ${horaFala(enc.hora)} e ${horaFala(enc.hora.replace(':00', ':30'))}.`)}
          ${trilha([['Recebido', 'Agora', true], ['Em preparo', `${cap(dataCurta(enc.iso))}, a partir das 11h30`], ['Pronto para retirar', 'Avisamos pelo WhatsApp']])}
          ${ticket([['Pedido', PEDIDOS['instagram/live']], ['Retirada', `${dataCurta(enc.iso).split(', ')[1]}, ${enc.hora}`], ['Pagamento', enc.pagamento, 1]])}${mapa(CLIENTES[k].marca, rua)}`, 'cm-site-body--end')}`,
      ]);
    }
    const booking = `${top}${body(`${back('Reservar mesa')}${label('Dia')}${days([['Sex', '23'], ['Sáb', String(dia(sab)), 'on'], ['Dom', '25'], ['Seg', 'Fechado', 'off']])}
      <div class="cm-row-2"><span>${label('Pessoas')}<span class="cm-stepper"><i>−</i><b>${esc(people)}</b><i>+</i></span></span><span>${label('Onde sentar')}<span class="cm-pks">${pk('Salão', { on: area === 'Salão' })}${pk('Varanda', { on: area === 'Varanda' })}</span></span></div>
      ${label('Horário do almoço')}${slots(['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'], slot, 'q1', 'b')}
      <p class="cm-site-note">${I('info')}A mesa fica guardada por 15 minutos. Grupos acima de 8 pessoas reservam pelo WhatsApp.</p>
      ${lugar('fachada43', CLIENTES[k].marca, `${TERCEIROS.ruas.restaurante}. Estacionamento conveniado na rua de trás.`)}`)}${foot(cta('Continuar', 'c'))}`;
    const details = `${top}${body(`${back('Seus dados')}<div class="cm-tm-summary">${I('calendar')}<span><b>${esc(cap(dataLonga(sab)))}</b><small>${esc(slot)}, ${esc(people)} pessoas, ${esc(area.toLowerCase())}</small></span></div>
      ${field('Nome', PESSOA.nome)}${field('WhatsApp', PESSOA.telefone)}${label('É uma ocasião especial?')}<span class="cm-pks">${pk('Aniversário', { q: 'q2', tap: 'd' })}${pk('Encontro')}${pk('Não')}</span>
      <p class="cm-site-note">${I('phone')}A confirmação chega pelo WhatsApp em até 15 minutos.</p>
      ${lista('Combinados da casa', ['A mesa fica guardada por 15 minutos', 'Para cancelar, responda a mensagem de confirmação', 'Cadeirão para crianças, é só pedir'])}`)}${foot(cta('Confirmar reserva', 'e'))}`;
    const fim = `${top}${body(`${ok('Reserva solicitada', `O ${CLIENTES[k].curta} confirma pelo WhatsApp.`)}${ticket([['Dia', dataCurta(sab)], ['Horário', slot], ['Pessoas', people], ['Mesa', area], ['Ocasião', 'Aniversário', 2]])}
      ${trilha([['Pedido de reserva', 'Agora', true], ['Confirmação pelo WhatsApp', 'Em até 15 minutos'], ['Mesa guardada', `Até ${horaFala(somaMin(slot, 15))} de ${dataLonga(sab).split(',')[0]}`]])}
      ${agenda ? actions([['calendar', 'Adicionar à agenda', 'g']]) : ''}${mapa(CLIENTES[k].marca, rua)}${horario(k)}`, 'cm-site-body--end')}`;
    if (variant === 'direto') return site(k, 'tacho', [booking, details, fim]);
    return site(k, 'tacho', [
      `${top}${body(`${hero(CLIENTES[k].assinatura, 'panela11')}
        <p class="cm-tm-info">${I('fork')}<span><b>Cardápio de sábado</b><small>${esc(R.horario)}</small></span></p>
        <ul class="cm-tm-menu">${dish('panela11', 'Feijoada completa', 'Carnes separadas, arroz, couve, farofa e laranja.', 'Serve 2')}${dish('escondidinho11', 'Escondidinho de carne-seca', 'Gratinado na panelinha.', 'Serve 1')}${dish('pudim11', 'Pudim de leite', 'Fatia ou inteiro, feito na casa.', 'Sobremesa')}</ul>`)}${foot(cta('Reservar mesa', 'a'))}`,
      booking, details, fim,
    ]);
  }

  /* Language school: coral, round shapes, a quiz first. The level test (three quick
     questions with the answer lighting up), the level, the class and the confirmation. */
  function sotaque({ variant = 'teste' } = {}) {
    const k = 'educacao', E = OFERTAS.educacao, A = E.aulaExperimental;
    const top = head(k, 'sl');
    const pergunta = (n, title, opts, right, q, tap, fb, ctx = '') => `${top}${body(`<div class="cm-sl-q"><small>Pergunta ${n} de 3</small><span class="cm-site-progress" style="--p:${(n / 3).toFixed(3)}"><i></i></span></div><b class="cm-sl-title">${esc(title)}</b>
      <div class="cm-options">${opts.map(o => pk(o, o === right ? { cls: 'cm-option cm-option--right', q, tap } : { cls: 'cm-option' })).join('')}</div>
      ${show(q, `<p class="cm-sl-feedback">${I('check')}${esc(fb)}</p>`)}
      ${ctx ? `<div class="cm-sl-ctx">${I('comment')}<span><small>Na vida real</small>${esc(ctx)}</span></div>` : ''}
      <div class="cm-sl-tip">${I('info')}<span>Sem cronômetro. Se não souber, escolha a que soa mais natural.</span></div>`)}`;
    const quando = cap(dataLonga(A.iso));
    const agenda = `${top}${body(`<div class="cm-sl-level"><small>Seu nível</small><b>Intermediário (${esc(E.nivel)})</b><span class="cm-sl-meter">${['A1', 'A2', 'B1', 'B2', 'C1'].map(l => `<i${l === E.nivel ? ' class="is-on"' : ''}>${l}</i>`).join('')}</span><span class="cm-sl-why">Você entende expressões do dia a dia e trava quando precisa responder rápido.</span></div>
      ${label('Aula experimental, 30 minutos')}${days([['Ter', '27'], ['Qui', String(dia(A.iso)), 'on'], ['Sáb', '31']])}
      ${label('Horário')}${slots(['18:00', A.hora, '20:00'], A.hora, 'q4', 'f')}
      ${label('Formato')}<span class="cm-seg2">${pk('On-line', { on: true })}${pk('Na unidade')}</span>
      ${lista('Na aula de 30 min', ['Conversa sobre um tema do seu dia a dia', 'Correção na hora, sem constranger', 'Plano sugerido no fim'])}`)}${foot(cta('Continuar', 'g'))}`;
    const dados = `${top}${body(`${back('Seus dados')}<div class="cm-sl-chip">${I('calendar')}${esc(quando)}, ${esc(A.hora)}</div>${field('Nome', PESSOA.nome)}${field('E-mail', PESSOA.email)}${field('WhatsApp', PESSOA.telefone)}${tick('Quero receber o material da aula por e-mail')}
      <p class="cm-site-note">${I('video')}A aula é por vídeo. O link da sala chega no e-mail e no convite da agenda.</p>
      <div class="cm-sl-level cm-sl-level--sm"><small>Seu teste</small><b>3 de 3 certas · ${esc(E.nivel)}</b><span class="cm-sl-why">Break a leg, it’s up to you e o presente contínuo.</span></div>`)}${foot(cta('Confirmar aula', 'h'))}`;
    const fim = `${top}${body(`${ok('Aula marcada', 'O convite com o link da sala chega por e-mail.')}${ticket([['Dia', dataCurta(A.iso)], ['Horário', A.hora], ['Nível', E.nivel], ['Duração', A.duracao], ['Aula', 'On-line, com professor', 1]], 'cm-ticket--sl')}
      <div class="cm-sl-before"><b>Antes da aula</b>${tick('Teste o fone e a câmera')}${tick('Pense numa série que você vê sem legenda', false)}${tick('Separe 5 minutos antes para entrar na sala', false)}</div>
      ${trilha([['Convite no e-mail', PESSOA.email, true], ['Lembrete', 'Uma hora antes, pelo WhatsApp'], ['Aula experimental', `${cap(dataCurta(A.iso))}, ${A.hora}`]])}
      <p class="cm-site-note">${I('info')}Depois da aula, o professor sugere o plano. ${esc(E.clube)}.</p>`, 'cm-site-body--end')}`;
    return site(k, 'sotaque', [
      `${top}${body(`<div class="cm-sl-hero">${pic('escola45', { pos: '50% 46%' })}<span>Aula experimental</span></div><b class="cm-sl-title">Descubra seu nível e marque uma aula de 30 min</b>
        ${tick('Professor ao vivo, por vídeo')}${tick('Três perguntas, sem cronômetro')}${tick('Horários à noite e aos sábados')}
        <ol class="cm-sl-how"><li><b>1</b>Teste de nível</li><li><b>2</b>Aula experimental</li><li><b>3</b>Plano sugerido</li></ol>`)}${foot(cta('Fazer o teste de nível', 'a'))}`,
      pergunta(1, 'Como se diz “boa sorte” antes de uma apresentação?', ['Good lucky to you', 'Break a leg', 'Hit the road'], 'Break a leg', 'q1', 'b', 'Isso. Ninguém quebra a perna: é “boa sorte”.', 'A colega vai apresentar o projeto e você quer desejar boa sorte, em inglês, antes de ela entrar na sala.'),
      pergunta(2, 'O que quer dizer “it’s up to you”?', ['Está acima de você', 'Você que decide', 'Chegou a sua vez'], 'Você que decide', 'q2', 'c', 'Certo. É “você que decide”.', 'Num jantar, alguém pergunta onde vocês vão sentar e responde: it’s up to you.'),
      `${pergunta(3, 'Complete: “I’ve been ___ English for two years.”', ['learn', 'learning', 'learned'], 'learning', 'q3', 'd', 'Certo. Essa é do nível intermediário.', 'Você conta há quanto tempo estuda inglês numa conversa com alguém de fora.')}${foot(cta('Ver meu resultado', 'e'))}`,
      agenda, dados, fim,
    ]);
  }

  /* Dental clinic: white and mint, a three-step booking bar. Service, a month calendar
     with free days, the times of the day, patient data, confirmation with the map. */
  function seixo() {
    const k = 'clinica', C = OFERTAS.clinica, av = C.avaliacao, rua = TERCEIROS.ruas.clinica;
    const top = n => `<header class="cm-site-head cm-sx-head">${marca(k)}<span><b>${esc(CLIENTES[k].marca)}</b><small>Agendamento on-line</small></span></header><ol class="cm-sx-steps">${['Serviço', 'Horário', 'Seus dados'].map((s, i) => `<li${i < n ? ' class="is-done"' : i === n ? ' class="is-on"' : ''}><i>${i < n ? I('check') : i + 1}</i>${s}</li>`).join('')}</ol>`;
    const cal = calendar({ free: [22, 23, 27, 28, 29, 30], pick: dia(av.iso), q: 'q2', tap: 'c' });
    return site(k, 'seixo', [
      `${top(0)}${body(`${label('O que você precisa?')}<div class="cm-radios">${pk('Avaliação odontológica', { cls: 'cm-radio', sub: '30 minutos, sem procedimento', q: 'q1', tap: 'a' })}${pk('Limpeza e prevenção', { cls: 'cm-radio', sub: '45 minutos' })}${pk('Clareamento', { cls: 'cm-radio', sub: 'Começa com uma avaliação' })}${pk('Dor ou urgência', { cls: 'cm-radio', sub: 'Encaixe conforme a agenda do dia' })}</div>
        ${label('Atendimento')}<span class="cm-seg2">${pk('Particular', { on: true })}${pk('Convênio')}</span>
        <p class="cm-site-note">${I('info')}${esc(CLIENTES[k].assinatura)}</p>`)}${foot(cta('Ver horários', 'b'))}`,
      `${top(1)}${body(`${cal}${show('q2', `${label(cap(dataLonga(av.iso)))}${slots(['08:30', av.hora, '10:30', '14:00', '16:30'], av.hora, 'q3', 'd')}`)}
        <p class="cm-site-note">${I('location')}Unidade ${esc(av.unidade)} · ${esc(rua)}</p>${horario(k)}`)}${foot(cta('Continuar', 'e'))}`,
      `${top(2)}${body(`<div class="cm-sx-sum">${I('calendar')}<span><b>Avaliação odontológica</b><small>${esc(cap(dataLonga(av.iso)))}, ${esc(av.hora)}</small></span></div>${field('Nome completo', PESSOA.nome)}${field('Celular', PESSOA.telefone)}${field('E-mail', PESSOA.email)}
        ${label('Primeira vez na clínica?')}<span class="cm-seg2">${pk('Sim', { on: true })}${pk('Não')}</span>${tick('Lembrete pelo WhatsApp um dia antes')}
        ${lista('Na avaliação', ['Conversa sobre o que incomoda', `Exame com a ${OFERTAS.clinica.responsavel}`, 'Plano por escrito, com prazos'])}`)}${foot(cta('Confirmar agendamento', 'f'))}`,
      `${top(3)}${body(`${ok('Avaliação agendada', `O lembrete chega pelo WhatsApp na ${dataLonga(new Date(Date.parse(av.iso + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10)).split(',')[0]}.`)}${ticket([['Dia', dataCurta(av.iso)], ['Horário', av.hora], ['Duração', '30 min'], ['Serviço', 'Avaliação odontológica', 1]], 'cm-ticket--sx')}
        ${lista('Antes da consulta', ['Chegue 10 minutos antes', 'Traga um documento com foto', 'Se tiver, traga exames recentes'])}${mapa(CLIENTES[k].marca, rua)}${legal(k)}`, 'cm-site-body--end')}`,
    ]);
  }

  /* Developer: editorial and quiet, sand and deep teal, serif. Gallery of the show house,
     the Plantas tab that switches the plan from 3 to 4 bedrooms, kind of visit, day and
     time, contact, confirmation with the address. */
  function falesia() {
    const k = 'incorporadora', V = OFERTAS.incorporadora.visita, rua = TERCEIROS.ruas.incorporadora;
    const top = (light) => `<header class="cm-site-head cm-mf2-head${light ? ' is-light' : ''}">${marca(k)}<b>${esc(CLIENTES[k].curta)}</b>${I('menu')}</header>`;
    return site(k, 'falesia', [
      `<div class="cm-mf2-gallery">${pic('salaMar45', { pos: '50% 50%', cls: 'cm-mf2-g1' })}${pic('coast', { pos: '34% 50%', cls: 'cm-mf2-g2' })}</div>${top(true)}
        ${body(`<small class="cm-mf2-kicker">Decorado aberto</small><b class="cm-mf2-title">${esc(CLIENTES[k].assinatura)}</b>
        <div class="cm-mf2-facts"><span><b>3 e 4</b><small>quartos</small></span><span><b>Mar</b><small>da sala e da suíte</small></span><span><b>Todo dia</b><small>visitas</small></span></div>
        <nav class="cm-mf2-tabs"><b data-tap="p" data-pick="p4">Plantas</b></nav><div class="cm-mf2-plan">${planta('3', 'cm-planta--site')}</div>`, 'cm-mf2-body')}${foot(cta('Agendar visita', 'a'))}`,
      `${top(false)}${body(`${back('Agendar visita')}${label('Como você quer conhecer')}<div class="cm-radios">${pk('No decorado', { cls: 'cm-radio', icon: 'home', sub: 'Com um corretor, cerca de 1 hora', q: 'q1', tap: 'b' })}${pk('Por vídeo', { cls: 'cm-radio', icon: 'video', sub: 'Tour ao vivo pelo celular' })}</div>
        ${label('Dia')}${days([['Sáb', String(dia(V.iso)), 'on'], ['Dom', '25'], ['Ter', '27'], ['Qua', '28']])}${label('Horário')}${slots(['10:00', V.hora, '15:00', '16:30'], V.hora, 'q2', 'c')}`)}${foot(cta('Continuar', 'd'))}`,
      `${top(false)}${body(`${back('Seus dados')}<div class="cm-mf2-sum"><b>${esc(cap(dataLonga(V.iso)))}, ${esc(V.hora)}</b><small>No decorado, com corretor</small></div>${field('Nome', PESSOA.nome)}${field('E-mail', PESSOA.email)}${field('WhatsApp', PESSOA.telefone)}
        ${label('Interesse')}<span class="cm-pks">${pk('3 quartos')}${pk('4 quartos', { on: true })}</span><p class="cm-legal">Ao confirmar, você aceita receber o contato da ${esc(CLIENTES[k].marca)} sobre esta visita.</p>`)}${foot(cta('Confirmar visita', 'e'))}`,
      `${top(false)}${body(`${ok('Visita agendada', 'Um corretor recebe você no decorado.')}${ticket([['Dia', dataCurta(V.iso)], ['Horário', V.hora], ['Duração', '~1 h'], ['Visita', 'No decorado, com corretor', 1]], 'cm-ticket--mf')}${mapa(V.local, rua)}${legal(k)}`, 'cm-site-body--end')}`,
    ]);
  }

  /* Tech store: clean white, violet, product first. Product page (memory, colour,
     masked price in up to 10 payments, delivery), the add button that fills and the
     cart badge, cart, delivery and payment, the review step, the Pix QR and copy-paste
     code, the paid order with tracking. Or the waiting list of the white model. */
  function teclaria({ variant = 'compra' } = {}) {
    const k = 'varejo', V = OFERTAS.varejo, [grafite, branco] = V.skus;
    const top = `<header class="cm-site-head cm-tc-head">${marca(k)}<b>${esc(CLIENTES[k].curta)}</b>${I('search')}<span class="cm-tc-cart" data-tap="c">${I('cart')}<i class="cm-tc-badge">1</i></span></header>`;
    const preco = `<p class="cm-tc-price"><b>${PRECO}</b><span>${esc(V.parcelamento)} sem juros no cartão</span></p>`;
    if (variant === 'espera') return site(k, 'teclaria', [
      `${top}${body(`<div class="cm-tc-gallery cm-tc-gallery--claro">${pic('notebookBranco11', { pos: '50% 50%' })}<span class="cm-tc-soon">${esc(cap(branco.estado))}</span></div><b class="cm-tc-title">${esc(branco.nome)} branco</b><p class="cm-site-p cm-tc-sub">15 polegadas, tela calibrada para edição de vídeo.</p>${preco}
        ${label('Cor')}<span class="cm-tc-colors">${pk('Grafite', { cls: 'cm-tc-swatch cm-tc-swatch--g', sub: cap(grafite.estado) })}${pk('Branco', { cls: 'cm-tc-swatch cm-tc-swatch--w', sub: cap(branco.estado), on: true })}</span>
        ${field('Avisar no e-mail', PESSOA.email)}${tick('Quero receber só esse aviso')}`)}${foot(cta('Quero ser avisado', 'a'))}`,
      `${top}${body(`${ok('Você está na lista', `Avisamos por e-mail no dia em que o branco chegar: ${dataCurta(branco.chegada)}.`)}
        ${trilha([['Inscrição feita', PESSOA.email, true], ['Aviso de chegada', `${cap(dataCurta(branco.chegada))}, um e-mail só`], ['Unidade separada para você', 'Por 48 horas depois do aviso']])}
        <div class="cm-tc-alt">${pic('notebookGrafite11', { pos: '50% 50%' })}<span><b>O grafite está disponível</b><small>${esc(cap(V.frete))}. ${esc(cap(V.parcelamento))}.</small></span></div>
        <p class="cm-site-note">${I('mail')}Você pode sair da lista pelo link do próprio e-mail.</p>`, 'cm-site-body--end')}`,
    ]);
    const entrega = dataCurta(uteis(HOJE.iso, 2));
    const passos = n => `<ol class="cm-tc-steps">${['Entrega', 'Pagamento', 'Revisão'].map((s, i) => `<li class="${i < n ? 'is-done' : i === n ? 'is-on' : ''}">${s}</li>`).join('')}</ol>`;
    const endereco = `<div class="cm-tc-address">${I('location')}<span><b>${esc(PESSOA.nome)}</b><small>${esc(PESSOA.bairro)} · CEP 05422-•••</small></span></div>`;
    const linha = `<div class="cm-tm-line">${pic('notebookGrafite11', { pos: '50% 50%' })}<span><b>${esc(grafite.nome)}</b><small>32 GB, ${esc(grafite.cor)}</small></span><b class="cm-price">${PRECO}</b></div>`;
    return site(k, 'teclaria', [
      `${top}${body(`<div class="cm-tc-gallery">${pic('notebookGrafite11', { pos: '50% 50%' })}<span class="cm-tc-dots"><i class="is-on"></i><i></i><i></i></span></div><b class="cm-tc-title">${esc(grafite.nome)}</b><p class="cm-site-p cm-tc-sub">15 polegadas, tela calibrada para edição de vídeo.</p>${preco}
        ${label('Memória')}<span class="cm-pks">${pk('16 GB')}${pk('32 GB', { q: 'q1', tap: 'a' })}</span>
        ${label('Cor')}<span class="cm-tc-colors">${pk('Grafite', { cls: 'cm-tc-swatch cm-tc-swatch--g', on: true, sub: cap(grafite.estado) })}${pk('Branco', { cls: 'cm-tc-swatch cm-tc-swatch--w', sub: cap(branco.estado), off: true })}</span>
        <div class="cm-tc-ship">${I('car')}<span><b>${esc(cap(V.frete))}</b><small>${esc(PESSOA.bairro)}</small></span></div>`)}
        ${foot(`<span class="cm-tc-add" data-tap="b" data-pick="q2" data-hs="3"><i class="cm-tc-add-bar"></i><span class="cm-tc-add-a">Adicionar ao carrinho</span><span class="cm-tc-add-b">${I('check')}No carrinho</span></span>`)}`,
      `${top}${body(`${back('Carrinho (1)')}${linha}
        ${label('Entrega')}<div class="cm-radios">${pk('Padrão', { cls: 'cm-radio', on: true, sub: `Chega ${entrega}` })}</div>
        <div class="cm-site-sum"><span>Produto</span><b>${PRECO}</b><span>Entrega</span><b>${PRECO}</b><span>Total</span><b>${PRECO}</b></div>
        <p class="cm-site-note">${I('info')}Preço oculto, valor ilustrativo. ${esc(cap(V.parcelamento))} no cartão ou à vista no Pix.</p>
        ${lista('Garantia e troca', ['Um ano de garantia do fabricante', 'Troca em até 7 dias depois da entrega', 'Nota fiscal no e-mail'])}`)}${foot(cta('Finalizar compra', 'd'))}`,
      `${top}${body(`${passos(1)}${endereco}${field('CPF', PESSOA.cpf)}
        ${label('Forma de pagamento')}<div class="cm-radios">${pk('Pix', { cls: 'cm-radio', sub: 'Aprovação na hora', q: 'q3', tap: 'e' })}${pk('Cartão de crédito', { cls: 'cm-radio', sub: cap(V.parcelamento) })}${pk('Boleto', { cls: 'cm-radio', sub: 'Compensa em até 2 dias úteis' })}</div>
        ${linha}`)}${foot(cta('Continuar', 'f'))}`,
      `${top}${body(`${passos(2)}${linha}<div class="cm-site-review"><span><small>Entrega</small><b>${esc(PESSOA.bairro)}, chega ${esc(entrega)}</b></span><span><small>Pagamento</small><b>Pix, à vista</b></span><span><small>Total</small><b>${PRECO}</b></span></div>
        <p class="cm-site-note">${I('info')}O Pix vale por 30 minutos. O pedido só é confirmado quando o pagamento cai.</p>`)}${foot(cta('Finalizar pedido', 'g'))}`,
      `${top}${body(`<b class="cm-site-h cm-tc-pixh">Pix pronto</b><p class="cm-site-p">Pague para reservar seu pedido.</p><span class="cm-tc-timer">${I('calendar')}Expira em 29:58</span>
        <div class="cm-tc-pix">${qrSvg('cm-tc-qr')}<span class="cm-tc-code"><small>Código Pix copia e cola</small><code>${esc(BR_CODE.slice(0, 54))}…</code></span>
        <span class="cm-tc-copy" data-tap="h" data-pick="q5" data-hs="3"><span class="cm-tc-copy-a">${I('copy')}Copiar código</span><span class="cm-tc-copy-b">${I('check')}Código copiado</span></span></div>
        <p class="cm-tc-wait"><i></i>Aguardando pagamento</p>
        <ol class="cm-tc-como"><li><b>1</b>Copie o código</li><li><b>2</b>Abra o app do banco</li><li><b>3</b>Pague em Pix copia e cola</li></ol>
        <p class="cm-site-note">${I('info')}Esta página confirma sozinha quando o Pix cair. Não precisa enviar comprovante.</p>`)}`,
      `${top.replace('<i class="cm-tc-badge">1</i>', '<i class="cm-tc-badge cm-tc-badge--zero">0</i>')}${body(`${ok('Pagamento aprovado', `Pedido ${PEDIDOS['tiktok/infeed']} confirmado. O recibo foi para o seu e-mail.`)}
        ${trilha([['Pagamento aprovado', 'Agora, por Pix', true], ['Separação', 'Hoje'], ['Enviado', 'Com o código de rastreio'], ['Entrega', cap(entrega)]])}
        ${ticket([['Pedido', PEDIDOS['tiktok/infeed']], ['Pagamento', 'Pix'], ['Entrega', entrega]], 'cm-ticket--tc')}${linha}${endereco}
        <p class="cm-site-note">${I('comment')}Dúvidas sobre o pedido: ${esc(V.horario)}.</p>`, 'cm-site-body--end')}`,
    ]);
  }

  /* Travel agency: ochre, festive, big cards. The trip builder (days, people, what to
     see, a suggested itinerary and the consultant) or a departure with a pre-booking. */
  function bandeirola({ variant = 'roteiro' } = {}) {
    const k = 'turismo', T = OFERTAS.turismo, [s1, s2] = T.saidas;
    const top = head(k, 'bd', I('menu'));
    const saida = s => `${dia(s.ida)} a ${dia(s.volta)} de maio de 2027`;
    if (variant === 'saida') return site(k, 'bandeirola', [
      `${top}${body(`<div class="cm-bd-hero">${pic('crencas', { pos: '50% 30%' })}<span>Festa do Divino</span></div><b class="cm-bd-title">${esc(T.produto)}</b>
        <div class="cm-bd-facts"><span>${I('calendar')}${s1.noites} noites</span><span>${I('people')}Até 12 pessoas</span><span>${I('user')}Guia da cidade</span></div>
        ${label('Escolha a saída')}<div class="cm-radios">${pk(saida(s1), { cls: 'cm-radio', sub: T.transporte, q: 'q1', tap: 'a' })}${pk(saida(s2), { cls: 'cm-radio', sub: `${s2.noites} noites` })}</div>
        <p class="cm-site-note">${I('info')}${esc(T.destaque)}.</p>`)}${foot(cta('Garantir minha vaga', 'b'))}`,
      `${top}${body(`${back('Pré-reserva')}<div class="cm-bd-sum"><b>Festa do Divino, ${esc(saida(s1))}</b><small>${esc(PESSOA.viagem)}</small></div>${field('Nome', PESSOA.nome)}${field('WhatsApp', PESSOA.telefone)}${field('E-mail', PESSOA.email)}
        <p class="cm-site-note">${I('info')}${esc(T.politica)}.</p><p class="cm-site-note">${I('people')}${esc(T.criancas)}.</p>`)}${foot(cta('Enviar pré-reserva', 'c'))}`,
      `${top}${body(`${ok('Pré-reserva recebida', `A consultora ${T.consultora} chama você pelo WhatsApp.`)}${ticket([['Saída', `${dia(s1.ida)} a ${dia(s1.volta)} mai`], ['Viajantes', '4'], ['Noites', String(s1.noites)]], 'cm-ticket--bd')}
        ${trilha([['Pré-reserva', 'Agora', true], ['Confirmação pelo WhatsApp', 'Com o roteiro e o hotel'], ['Sinal por Pix', 'Só depois da confirmação']])}`, 'cm-site-body--end')}`,
    ]);
    const tile = (icon, text, opts = {}) => pk(text, { icon, cls: 'cm-bd-tile', ...opts });
    return site(k, 'bandeirola', [
      `${top}${body(`<div class="cm-sl-q"><small>Monte seu roteiro, 1 de 2</small><span class="cm-site-progress" style="--p:.5"><i></i></span></div><b class="cm-bd-title">Quantos dias você tem?</b>
        <div class="cm-bd-big">${pk(`${s2.noites} noites`, { sub: saida(s2), q: 'q1', tap: 'a', cls: 'cm-bd-card' })}${pk(`${s1.noites} noites`, { sub: saida(s1), cls: 'cm-bd-card' })}</div>
        ${field('Saindo de', 'São Paulo')}${label('Com quem')}<span class="cm-pks">${pk('Casal', { on: true })}${pk('Família')}${pk('Amigos')}</span>`)}${foot(cta('Continuar', 'b'))}`,
      `${top}${body(`<div class="cm-sl-q"><small>Monte seu roteiro, 2 de 2</small><span class="cm-site-progress" style="--p:1"><i></i></span></div><b class="cm-bd-title">O que você quer ver?</b>
        <div class="cm-bd-tiles">${tile('music', 'Mascarados', { on: true })}${tile('car', 'Cavalhadas', { q: 'q2', tap: 'c' })}${tile('people', 'Procissão')}${tile('fork', 'Comida típica')}</div>
        <p class="cm-site-note">${I('info')}${esc(T.destaque)}.</p>`)}${foot(cta('Gerar roteiro', 'd'))}`,
      `${top}${body(`<div class="cm-bd-hero cm-bd-hero--sm">${pic('cenaCrencas', { pos: '50% 40%' })}<span>Roteiro sugerido</span></div><b class="cm-bd-title">${s2.noites} noites em ${esc(T.cidade)}</b>
        <ol class="cm-bd-days"><li><b>Dia 1</b><span>Chegada e centro histórico</span></li><li><b>Dia 2</b><span>Mascarados e cavalhadas</span></li><li><b>Dia 3</b><span>Cavalhadas e volta</span></li></ol>
        <div class="cm-bd-hotel">${I('home')}<span><b>Hotel no centro histórico</b><small>A pé das festas</small></span></div>
        ${show('q3', `<p class="cm-bd-toast">${I('check')}A consultora ${esc(T.consultora)} chama você no WhatsApp.</p>`)}`)}${foot(`<span class="cm-site-cta cm-site-cta--wa" data-tap="e" data-pick="q3" data-hs="3">${I('comment')}Falar com a consultora</span>`)}`,
    ]);
  }

  /* Wealth manager: navy and paper, serif, quiet. A scheduling page: host card, month
     calendar, times of the chosen day, what to bring, the subject, the invitation. */
  function arrimo() {
    const k = 'financas', F = OFERTAS.financas, cv = F.conversa;
    const top = head(k, 'ar');
    return site(k, 'arrimo', [
      `${top}${body(`<div class="cm-ar-host"><b>Conversa com um especialista</b><span>${I('calendar')}${esc(cv.duracao)}</span><span>${I('video')}Por ${esc(cv.formato)}</span></div>${calendar({ free: [22, 23, 27, 28, 30], pick: dia(cv.iso), q: 'q1', tap: 'a' })}
        ${show('q1', `${label(cap(dataLonga(cv.iso)))}<div class="cm-ar-times">${['09:00', cv.hora, '15:00', '16:30'].map(t => pk(t, t === cv.hora ? { q: 'q2', tap: 'b' } : {})).join('')}</div>`)}
        <p class="cm-site-note">${I('info')}Sem custo e sem compromisso. ${esc(F.horario)}.</p>`)}${foot(cta('Próximo', 'c'))}`,
      `${top}${body(`${back('Seus dados')}<div class="cm-ar-sum">${I('calendar')}<span><b>${esc(cap(dataLonga(cv.iso)))}, ${esc(cv.hora)}</b><small>${esc(cv.duracao)}, por ${esc(cv.formato)}</small></span></div>${field('Nome', PESSOA.nome)}${field('E-mail', PESSOA.email)}
        ${label('Sobre o que quer conversar?')}<span class="cm-pks">${pk('Sucessão', { q: 'q3', tap: 'd' })}${pk('Separar patrimônio')}${pk('Investimentos')}</span>
        ${lista('Para a conversa render', ['Contrato social da empresa', 'Lista dos bens em nome da família', 'Quem deve participar da decisão'], 'doc')}`)}${foot(cta('Agendar', 'e'))}`,
      `${top}${body(`${ok('Conversa agendada', 'O convite com o link chega por e-mail.')}${ticket([['Dia', dataCurta(cv.iso)], ['Horário', cv.hora], ['Duração', cv.duracao], ['Assunto', 'Sucessão', 1]], 'cm-ticket--ar')}
        ${trilha([['Convite enviado', PESSOA.email, true], ['Lembrete', 'Uma hora antes, por e-mail'], ['Conversa por vídeo', `${cap(dataCurta(cv.iso))}, ${cv.hora}`]])}${legal(k)}`, 'cm-site-body--end')}`,
    ]);
  }

  /* Car dealer: dark green and white. Version (with a spec line each), store and time,
     contact with driver's licence, the booked test drive. */
  function ondara() {
    const k = 'automotivo', A = OFERTAS.automotivo, td = A.testDrive, rua = TERCEIROS.ruas.automotivo, curta = CLIENTES[k].curta;
    const top = head(k, 'od', I('menu'));
    const versao = (v, opts) => pk(`${curta} ${v.nome}`, { cls: 'cm-radio cm-od-ver', sub: `Autonomia: ${v.autonomia} · Recarga AC e DC · 5 lugares`, ...opts });
    return site(k, 'ondara', [
      `${top}${body(`<div class="cm-od-hero">${pic('recarga169', { pos: '50% 50%' })}<span>Test drive</span></div><b class="cm-od-title">Qual versão você quer dirigir?</b>
        <div class="cm-radios">${versao(A.versoes[0], { q: 'q1', tap: 'a' })}${versao(A.versoes[1], {})}</div>
        ${lista('No test drive', ['A recarga em casa (AC) e na rua (DC)', 'O painel que mostra a carga para a volta', 'Cerca de 40 minutos, com o consultor ao lado'])}`)}${foot(cta('Escolher loja', 'b'))}`,
      `${top}${body(`${back('Loja e horário')}<div class="cm-radios">${pk(`${curta} ${td.unidade}`, { cls: 'cm-radio', icon: 'location', sub: rua, q: 'q2', tap: 'c' })}</div>
        ${label('Dia')}${days([['Sáb', String(dia(td.iso)), 'on'], ['Dom', '25'], ['Seg', '26'], ['Ter', '27']])}${label('Horário')}${slots(['09:00', td.hora, td.alternativa, '14:00'], td.hora, 'q3', 'd')}
        ${horario(k)}${mapa(`${curta} ${td.unidade}`, rua)}`)}${foot(cta('Continuar', 'e'))}`,
      `${top}${body(`${back('Seus dados')}${field('Nome', PESSOA.nome)}${field('WhatsApp', PESSOA.telefone)}${label('Tem carteira de motorista válida?')}<span class="cm-seg2">${pk('Sim', { on: true })}${pk('Não')}</span>${tick('Receber a confirmação pelo WhatsApp')}
        ${lista('Para o dia', ['Leve a carteira de motorista', 'Chegue 10 minutos antes', 'Pergunte sobre a recarga em casa'])}`)}${foot(cta('Solicitar test drive', 'f'))}`,
      `${top}${body(`${ok('Test drive agendado', `O consultor ${A.consultor} confirma pelo WhatsApp.`)}${ticket([['Versão', A.versoes[0].nome], ['Dia', dataCurta(td.iso)], ['Horário', td.hora], ['Loja', `${curta} ${td.unidade}`, 1]], 'cm-ticket--od')}
        ${trilha([['Pedido enviado', 'Agora', true], ['Confirmação pelo WhatsApp', `Com o consultor ${A.consultor}`], ['Test drive', `${cap(dataCurta(td.iso))}, ${td.hora}`]])}${mapa(`${curta} ${td.unidade}`, rua)}${legal(k)}`, 'cm-site-body--end')}`,
    ]);
  }

  /* Meta instant form, as the app shows it: intro, one question of the advertiser, the
     contact filled from the profile, review (higher intent), and the conclusion: a
     calendar to book the time, or the thank-you with the way back to the video. */
  function metaForm({ key = 'incorporadora', cover = 'coast', pos = '40% 60%', title = 'Visita ao decorado', text = '', pergunta = 'Quantos quartos você procura?', opcoes = ['3 quartos', '4 quartos'], escolha = '4 quartos', fim = 'agenda', hora = OFERTAS.incorporadora.visita.hora, iso = OFERTAS.incorporadora.visita.iso, horas = ['10:00', '11:30', '15:00'], obrigado = '' } = {}) {
    const marcaNome = CLIENTES[key].marca;
    const topo = (p, close = true) => `<div class="cm-mt-top">${close ? I('close') : I('back')}<span class="cm-site-progress" style="--p:${p}"><i></i></span></div>`;
    const contato = [['Nome completo', PESSOA.nome], ['E-mail', PESSOA.email], ['Número do WhatsApp', PESSOA.telefone]];
    const conclusao = fim === 'agenda'
      ? `${topo(1, false)}${body(`<b class="cm-mt-h">Pronto! Escolha um horário</b><p class="cm-mt-note">${I('info')}Seus dados já estão no convite.</p>${calendar({ free: [24, 25, 27, 28, 31], on: dia(iso) })}${label(cap(dataLonga(iso)))}${slots(horas, hora, 'q2', 'e')}
          ${show('q3', `<p class="cm-mt-booked">${I('check')}Visita marcada para ${esc(dataLonga(iso))}, às ${esc(horaFala(hora))}. O convite chega no seu e-mail.</p>`)}`, 'cm-mt-body')}${foot(`<span class="cm-site-cta" data-tap="f" data-pick="q3" data-hs="3">Marcar horário</span>`)}`
      : `<div class="cm-mt-cover cm-mt-cover--sm">${pic(cover, { pos })}<span class="cm-mt-x">${I('close')}</span></div>${body(`${ok('Obrigado!', obrigado)}${trilha([['Formulário enviado', 'Agora', true], ['Contato pelo WhatsApp', 'Hoje, em horário comercial'], ['Test drive confirmado', `${cap(dataCurta(iso))}, ${hora}`]])}`, 'cm-site-body--end cm-mt-body')}${foot(cta('Voltar ao vídeo', 'f', ''))}`;
    return site(key, 'meta', [
      `<div class="cm-mt-cover">${pic(cover, { pos })}<span class="cm-mt-x">${I('close')}</span></div>${body(`<span class="cm-mt-brand">${marca(key)}<small>${esc(marcaNome)}</small></span><b class="cm-mt-title">${esc(title)}</b><p class="cm-mt-text">${esc(text || CLIENTES[key].assinatura)}</p>
        ${lista('Como funciona', ['Responda uma pergunta', 'Confira seus dados, que já vêm do perfil', 'Escolha o horário no final'], 'check')}`, 'cm-mt-body')}${foot(cta('Continuar', 'a'))}`,
      `${topo(.5)}${body(`<b class="cm-mt-h">${esc(pergunta)}</b>${opcoes.map(o => pk(o, o === escolha ? { cls: 'cm-radio', q: 'q1', tap: 'b' } : { cls: 'cm-radio' })).join('')}<b class="cm-mt-h">Seus dados</b><p class="cm-mt-note">${I('info')}Preenchido com as informações do seu perfil.</p>${contato.map(([a, b]) => field(a, b)).join('')}<p class="cm-legal">${esc(marcaNome)} pode entrar em contato com você sobre este pedido.</p>`, 'cm-mt-body')}${foot(cta('Continuar', 'c'))}`,
      `${topo(.85, false)}${body(`<b class="cm-mt-h">Revise suas informações</b><div class="cm-mt-review">${[[pergunta, escolha], ...contato].map(([a, b]) => `<span><small>${esc(a)}</small><b>${esc(b)}</b>${I('edit')}</span>`).join('')}</div><p class="cm-legal">Ao tocar em Enviar, você envia suas informações para ${esc(marcaNome)}, que as usa conforme a própria política de privacidade.</p>`, 'cm-mt-body')}${foot(cta('Enviar', 'd'))}`,
      conclusao,
    ], '#0866ff');
  }

  /* LinkedIn Lead Gen form: contact info from the profile, review, thank-you with the download. */
  function linkedinForm() {
    const k = 'financas', marcaNome = CLIENTES[k].marca, guia = OFERTAS.financas.guia.titulo;
    const [nome, ...resto] = PESSOA.nome.split(' ');
    const top = `<div class="cm-li2-top">${I('close')}<b>${esc(marcaNome)}</b></div>`;
    return site(k, 'linkedin', [
      `${top}${body(`<span class="cm-li2-brand">${marca(k, 'quadrado')}<span><b>${esc(guia)}</b><small>${esc(marcaNome)}</small></span></span><div class="cm-sl-q"><small>Informações de contato, 1 de 2</small><span class="cm-site-progress" style="--p:.5"><i></i></span></div>
        ${field('Nome', nome)}${field('Sobrenome', resto.join(' '))}${field('E-mail', PESSOA.email)}${field('Cargo', PESSOA.cargo)}${field('Empresa', TERCEIROS.empresaPersona)}`)}${foot(cta('Avançar', 'a'))}`,
      `${top}${body(`<div class="cm-sl-q"><small>Revisar, 2 de 2</small><span class="cm-site-progress" style="--p:1"><i></i></span></div><b class="cm-mt-h">Revise suas informações</b><div class="cm-mt-review">${[['Nome', PESSOA.nome], ['E-mail', PESSOA.email], ['Cargo', PESSOA.cargo], ['Empresa', TERCEIROS.empresaPersona]].map(([a, b]) => `<span><small>${esc(a)}</small><b>${esc(b)}</b></span>`).join('')}</div>
        ${tick(`Quero receber conteúdos da ${marcaNome}`, false)}<p class="cm-legal">Suas informações serão enviadas para ${esc(marcaNome)}, conforme a política de privacidade dela.</p>`)}${foot(cta('Enviar', 'b'))}`,
      `${top}${body(`${ok(`Obrigado, ${PESSOA.primeiro}`, 'O guia completo está liberado.')}<div class="cm-li2-file">${I('doc')}<span><b>${esc(guia)}</b><small>PDF, 12 páginas</small></span>${I('down')}</div>${legal(k)}`, 'cm-site-body--end')}`,
    ], '#0a66c2');
  }

  /* The fictitious bank app (TERCEIROS.banco): top bar with the initials badge, a body and
     the iOS crumb back to the app the person came from. Used for Pix copy and paste. */
  function banco(inner, { de = '', cls = '' } = {}) {
    const B = TERCEIROS.banco;
    return `<div class="cm-bk${cls ? ' ' + cls : ''}" style="--bk:${B.cor}">${de ? `<span class="cm-crumb">${I('back')}${esc(de)}</span>` : ''}<div class="cm-bk-top">${I('back')}<b><i class="cm-bk-mark" aria-hidden="true">${esc(B.sigla)}</i>${esc(B.nome)}</b>${I('dots')}</div>${inner}</div>`;
  }

  const kit = { step, site, body, foot, cta, pk, label, field, tick, show, ok, actions, back, days, slots, ticket, calendar, mapa, trilha, lista, legal, horario, banco, qr: qrSvg, BR_CODE, PRECO, horaFala, cap, uteis, somaMin };
  return { tacho, sotaque, seixo, falesia, teclaria, bandeirola, arrimo, ondara, metaForm, linkedinForm, kit };
}
