/* "Sistemas e automações": one automation at a time, the iPhone and, beside it, what the system records
   while the customer sees each screen (the `log` of every frame in automation-flows.js).
   - Frames run on the shared engine (frame-engine.js): scene rules, clock, reading time, point and finger.
   - Phones (< 600px): the phone takes the width; under it a sticky dock keeps the current event, the
     caption and the controls; a segmented control swaps the phone for the log, the architecture or the call.
   - 600 to 899px: two columns, the phone sticky on the left. From 900px: phone and an inspector with tabs
     (Registro with time and delta, Arquitetura drawn from the actors, Transcrição and Bastidor).
   - Plays by itself while .at-main is on screen and resumes where it stopped, unless the person paused it.
     Without motion (reduced motion, paused site, hidden tab) nothing plays by itself.
   - Links: #sistemas/<chave> and #sistemas/<chave>/falha open a module (and its failure path).
   Markup: index.html, <div class="vitrine lab-escopo" data-vitrine="sistemas">. */
import { placementByKey, renderMock, marca } from './campaign-channels.js';
import { applyFrame, settle, tempoMinimo, positionDot, clearDot, showTap, hideTap, syncMedia, live, seguirFoco } from './frame-engine.js';
import { CLIENTES, HOJE } from './marcas.js';

const MODULOS = [
  { chave: 'agente', label: 'Agente e Pix', funcao: 'Qualifica, passa para pessoa e recebe', curta: 'IA, consultora e Pix', key: 'whatsapp/agente', glifo: 'chat' },
  { chave: 'voz', label: 'Ligação com IA', funcao: 'Liga em instantes e agenda', curta: 'Liga e agenda na hora', key: 'voz/ligacao', glifo: 'phone' },
  { chave: 'chamada', label: 'Chamada no WhatsApp', funcao: 'Pede permissão, liga e transfere', curta: 'Liga e transfere', key: 'whatsapp/chamada', glifo: 'call' },
  { chave: 'instagram', label: 'Comentário e Direct', funcao: 'Do comentário à lista de espera', curta: 'Do comentário à lista', key: 'instagram/direct', glifo: 'comment' },
  { chave: 'pix', label: 'Pix Automático', funcao: 'Cobra todo mês e evita cancelamento', curta: 'Cobra todo mês', key: 'pix/recorrencia', glifo: 'regen' },
  { chave: 'rcs', label: 'RCS', funcao: 'Da busca à conversa verificada', curta: 'Da busca à conversa', key: 'rcs/conversa', glifo: 'verified' },
  { chave: 'email', label: 'Régua de e-mail', funcao: 'Segue o lead até a reunião', curta: 'Do guia à reunião', key: 'email/regua', glifo: 'mail' },
  { chave: 'telegram', label: 'Telegram', funcao: 'Comunidade com assinatura', curta: 'Clube com assinatura', key: 'telegram/clube', glifo: 'send' },
];
const GLIFOS = {
  chat: 'M7.9 20A9 9 0 1 0 4 16.1L2 22zM8 12h.01M12 12h.01M16 12h.01',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  call: 'M7.9 20A9 9 0 1 0 4 16.1L2 22zM9.2 8.6l1.4-.3 1 2.2-.9.7a5 5 0 0 0 2.1 2.1l.7-.9 2.2 1-.3 1.4a1.4 1.4 0 0 1-1.5 1 7.5 7.5 0 0 1-5.7-5.7 1.4 1.4 0 0 1 1-1.5z',
  comment: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8 9h8M8 13h5',
  regen: 'M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5',
  verified: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8.5 10l2.5 2.5 4.5-4.5',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  ramo: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  ouvir: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3',
};
const glifo = (name, cls = '') => `<svg class="at-g${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${GLIFOS[name]}"/></svg>`;
/* Colour of each actor of the log (chips, nodes of the architecture). */
const ATOR = {
  'Cliente': '#c3ced9', 'Anúncio': '#f2b05e', 'Site': '#b9e07a', 'WhatsApp': '#4fd98a', 'Instagram': '#f07aa8', 'Telegram': '#6cb6f5', 'RCS': '#7fb0ff',
  'Agente IA': '#b9a2ff', 'Humano': '#6fe0b4', 'CRM': '#f59ac9', 'PSP': '#f6d36b', 'Banco': '#8fc3ff', 'Meta CAPI': '#8aa9ff', 'Google Ads': '#8aa9ff',
  'LinkedIn CAPI': '#8aa9ff', 'E-mail': '#ffb27a', 'Sistema': '#d5dde4', 'Telefonia': '#6fe0d6', 'Automação': '#f9a8d4', 'Bot': '#9ad4fb', 'Mini app': '#9ad4fb',
  'Agenda': '#f4a39a',
};
const cor = ator => ATOR[ator] || '#d5dde4';
/* A line without tipo gets one from its actor. */
const TIPO_DO_ATOR = [[/CAPI|Google Ads/, 'sinal'], [/Agente IA/, 'ia'], [/Humano/, 'pessoa'], [/PSP|Banco/, 'pagamento'], [/CRM/, 'crm'], [/E-mail/, 'email'], [/Agenda/, 'agenda'], [/Anúncio/, 'anuncio'], [/WhatsApp|Instagram|Telegram|RCS/, 'webhook']];
const tipoDe = ator => (TIPO_DO_ATOR.find(([re]) => re.test(ator)) || [, 'sistema'])[1];

/* Counters of each module: a line rule (l), a frame rule (q) or the call turns (fala). A counter that ends the
   flow at 0 is not shown; the ones that end above 0 count up from the first frame. */
const sinal = l => l.tipo === 'sinal' && /CAPI|Google Ads/.test(l.ator);
const C = (r, l) => ({ r, l }), Q = (r, q) => ({ r, q }), TURNOS = { r: 'Turnos da ligação', fala: true };
const CONTA = {
  agente: [C('Mensagens da IA', l => l.tipo === 'ia'), C('Passagens para pessoa', l => l.tipo === 'pessoa' && /assume|aceita/i.test(l.texto)),
    C('Cobranças reenviadas', l => l.tipo === 'retentativa'), C('Avisos duplicados descartados', l => /duplicado/i.test(l.texto)),
    C('Pagamentos conferidos', l => /pix recebido/i.test(l.texto)), C('Sinais ao anúncio', sinal)],
  voz: [TURNOS, C('Ferramentas consultadas', l => l.tipo === 'ferramenta'), C('Avaliações agendadas', l => l.tipo === 'agenda'),
    C('Confirmações enviadas', l => /webhook|email/.test(l.tipo) && /Confirma/i.test(l.texto)), C('Ligações não atendidas', l => /Não atendida/i.test(l.texto)),
    C('Retornos pelo WhatsApp', l => /Retorno/i.test(l.texto)), C('Novas tentativas', l => l.tipo === 'retentativa' && /Nova tentativa|Segunda tentativa/i.test(l.texto))],
  chamada: [C('Permissões concedidas', l => l.tipo === 'permissao' && /concedida/i.test(l.texto)), TURNOS,
    C('Transferências para pessoa', l => l.tipo === 'pessoa' && /^Transfer/i.test(l.evento)), C('Test drives agendados', l => l.tipo === 'agenda'), C('Sinais ao anúncio', sinal)],
  instagram: [C('Comentários recebidos', l => l.tipo === 'webhook' && /coment/i.test(l.texto)), C('Respostas privadas', l => /Resposta privada/i.test(l.texto)),
    C('Contatos na lista de espera', l => l.tipo === 'crm' && /lista/i.test(l.texto)), C('Compras reservadas', l => /reserva/i.test(l.evento)), C('Sinais ao anúncio', sinal)],
  pix: [C('Autorizações', l => l.tipo === 'assinatura' && /aprovada/i.test(l.evento)), C('Mensalidades pagas', l => l.tipo === 'webhook' && /recebido|liquidado/i.test(l.evento)),
    C('Retentativas', l => l.tipo === 'retentativa'), C('Cancelamentos na véspera', l => /cancelado pela/i.test(l.evento)),
    C('Pausas no lugar do cancelamento', l => l.tipo === 'crm' && /Pausa/i.test(l.evento)), C('Mensagens de retenção', l => /webhook|email/.test(l.tipo) && /WhatsApp|E-mail/.test(l.ator))],
  rcs: [C('Mensagens verificadas', l => l.ator === 'RCS' && !/não/i.test(l.texto)), Q('Respostas sugeridas tocadas', q => q.toque && q.cena === 'chat'),
    C('Pagamentos conferidos', l => /pix recebido/i.test(l.texto)), C('Avisos por SMS', l => /SMS de reserva/i.test(l.evento)), C('Sinais ao anúncio', sinal)],
  email: [C('E-mails da régua', l => l.tipo === 'email' && /dia \d/i.test(l.texto)), C('Cliques no convite', l => /Clique/i.test(l.evento)),
    C('Reuniões agendadas', l => l.tipo === 'agenda'), C('Descadastros respeitados', l => l.tipo === 'descadastro' && /Pedido de descadastro/i.test(l.evento)),
    C('Saídas da régua', l => /Régua (encerrada|parada)/i.test(l.evento)), C('Sinais ao anúncio', sinal)],
  telegram: [C('Mensagens do bot no grupo', l => l.tipo === 'grupo' && l.ator === 'Bot'), Q('Toques nos botões', q => Boolean(q.toque)),
    C('Assinaturas em Estrelas', l => /Pagamento confirmado/i.test(l.evento)), C('Entradas no grupo', l => /Boas-vindas/i.test(l.evento))],
};
const ABAS = [['tela', 'Tela'], ['registro', 'Registro'], ['arquitetura', 'Arquitetura'], ['fala', 'Transcrição']];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const falaDe = entry => Array.isArray(entry) ? { quem: entry[0], texto: entry[1] } : { quem: entry?.quem || '', texto: entry?.texto || '' };
const corFala = quem => cor(/IA/.test(quem) ? 'Agente IA' : /consultor/i.test(quem) ? 'Humano' : 'Cliente');
const segundos = (dia, t) => Date.parse(`${dia}T${t.length === 5 ? t + ':00' : t}Z`) / 1000;
/* '+2 s', '+1 min 4 s', '+29 min', '+4 h 20 min', '+11 dias' */
function delta(s) {
  if (!Number.isFinite(s) || s < 0) return '';
  const u = (n, unidade) => `${n}\u00a0${unidade}`;
  if (s < 60) return `+${u(s, 's')}`;
  if (s < 3600) { const m = Math.floor(s / 60), r = s % 60; return r && m < 10 ? `+${u(m, 'min')} ${u(r, 's')}` : `+${u(m, 'min')}`; }
  if (s < 86400) { const h = Math.floor(s / 3600), m = Math.round(s % 3600 / 60); return m ? `+${u(h, 'h')} ${u(m, 'min')}` : `+${u(h, 'h')}`; }
  const d = Math.round(s / 86400);
  return `+${u(d, d === 1 ? 'dia' : 'dias')}`;
}
const ddmm = iso => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

function mountOne(root) {
  const uid = 'at' + Math.random().toString(36).slice(2, 7);
  MODULOS.forEach(m => { m.falha = placementByKey(m.key + '-falha') ? m.key + '-falha' : ''; });
  root.classList.add('at');
  root.innerHTML = `<div class="at-mods" role="group" aria-label="Escolha uma automação">${MODULOS.map((m, k) => `<button type="button" class="at-mod" data-at-mod="${k}" aria-pressed="${k === 0}">${glifo(m.glifo, 'at-mod-g')}<span class="at-mod-t"><b>${esc(m.label).replace('e-mail', '<span class="at-nw">e-mail</span>')}</b><small><span class="at-longa">${esc(m.funcao)}</span><span class="at-curta">${esc(m.curta)}</span></small></span>${m.falha ? `<span class="at-mod-falha" title="Tem caminho de falha">${glifo('ramo')}<span class="at-mod-falha-t" aria-hidden="true">tem caminho de falha</span><span class="sr-only">, tem caminho de falha</span></span>` : ''}</button>`).join('')}</div>
    <div class="at-main" data-at-main data-aba="tela">
      <div class="at-head"><div class="at-cliente" data-at-cliente></div><div class="at-head-t"><b>Registro de eventos</b><small>O que o sistema registra enquanto a cliente vê cada tela.</small></div><span class="at-badge">Demo · dados simulados</span></div>
      <div class="at-path" data-at-path role="group" aria-label="Caminho" hidden><button type="button" data-at-falha="0" aria-pressed="true">Caminho feliz</button><button type="button" data-at-falha="1" aria-pressed="false">Com falhas</button></div>
      <div class="at-tabs" role="tablist" aria-label="Ver registro completo">${ABAS.map(([id, nome]) => `<button type="button" role="tab" class="at-tab" id="${uid}-t-${id}" data-at-aba="${id}" aria-controls="${uid}-p-${id}" aria-selected="false" tabindex="-1"><span data-at-aba-nome>${nome}</span></button>`).join('')}</div>
      <div class="at-vista">
      <div class="at-phone" id="${uid}-p-tela" role="tabpanel" aria-labelledby="${uid}-t-tela"><div class="at-stage" data-at-stage tabindex="0" role="group" aria-roledescription="demonstração" aria-describedby="${uid}-cap"></div></div>
      <div class="at-panels">
        <section class="at-panel at-panel--registro" id="${uid}-p-registro" role="tabpanel" aria-labelledby="${uid}-t-registro" data-at-panel="registro"><ol class="at-log" data-at-log aria-label="Eventos da automação"></ol></section>
        <section class="at-panel at-panel--arq" id="${uid}-p-arquitetura" role="tabpanel" aria-labelledby="${uid}-t-arquitetura" data-at-panel="arquitetura"><p class="at-arq-nota">Cada caixa é um sistema que aparece no registro, na ordem em que entra. O que está aceso trabalha agora.</p><div class="at-arq" data-at-arq><svg class="at-arq-svg" data-at-arq-svg aria-hidden="true"></svg></div></section>
        <section class="at-panel at-panel--fala" id="${uid}-p-fala" role="tabpanel" aria-labelledby="${uid}-t-fala" data-at-panel="fala"><div data-at-fala-box></div></section>
      </div>
      <div class="at-dock" data-at-dock>
        <div class="at-agora" data-at-agora aria-live="polite" aria-atomic="true"><p class="at-agora-ev" data-at-ev></p><p class="at-caption" id="${uid}-cap" data-at-caption></p></div>
        <span class="at-progresso" aria-hidden="true"><i data-at-barra></i></span>
        <div class="at-controls"><button type="button" class="at-ctl" data-at-prev aria-label="Quadro anterior">←</button><button type="button" class="at-play" data-at-play></button><button type="button" class="at-ctl" data-at-next aria-label="Próximo quadro">→</button><span class="at-pos" data-at-pos></span></div>
      </div>
      </div>
      <p class="at-objetivo" data-at-objetivo></p>
      <div class="at-rest">
        <ol class="at-steps" data-at-steps aria-label="Jornada em 3 passos"></ol>
        <dl class="at-count" data-at-count aria-label="Contadores da automação"></dl>
        <p class="at-base" data-at-base></p>
        <p class="at-nota">Marca fictícia e interface aproximada. Eventos, campos e horários são simulados; nenhum número é resultado de cliente.</p>
      </div>
      <svg class="at-fio" data-at-fio aria-hidden="true"><path/></svg>
    </div>`;
  const $ = selector => root.querySelector(selector);
  const main = $('[data-at-main]'), stage = $('[data-at-stage]'), log = $('[data-at-log]'), count = $('[data-at-count]'), caption = $('[data-at-caption]');
  const agora = $('[data-at-agora]'), ev = $('[data-at-ev]'), play = $('[data-at-play]'), steps = $('[data-at-steps]'), pos = $('[data-at-pos]');
  const barra = $('[data-at-barra]'), arq = $('[data-at-arq]'), arqSvg = $('[data-at-arq-svg]'), falaBox = $('[data-at-fala-box]'), fio = $('[data-at-fio]');
  const estreito = matchMedia('(max-width:599px)'), largo = matchMedia('(min-width:900px)'), compacto = matchMedia('(max-width:480px), (max-height:480px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const deitado = matchMedia('(orientation:landscape) and (max-height:520px)');

  let modulo = 0, falha = false, placement = null, frames = [], linhas = [], screen = null, quadro = -1, aba = 'tela';
  let playing = false, pausado = false, visivel = false, timer = 0, geracao = 0, inicio = 0, gasto = 0, duracao = 0;
  let contadores = [], grafo = null, lidoEm = -Infinity, audio = null;
  const last = () => frames.length - 1;
  const passoDe = i => Math.max(0, placement.passos.findIndex(p => p.quadros.includes(i)));
  const abaVista = () => !estreito.matches && aba === 'tela' ? 'registro' : aba;

  /* Every log line, flat, with its frame and its absolute second (day + time). */
  function lerLinhas() {
    let antes = null;
    return frames.flatMap((q, k) => (q.log || []).map(([ator, evento, detalhe, meta = {}]) => {
      const t = meta.t || '', dia = meta.dia || HOJE.iso, s = t ? segundos(dia, t) : NaN;
      const linha = { k, ator, evento, detalhe: detalhe || '', t, dia: meta.dia || '', tipo: meta.tipo || tipoDe(ator), campos: meta.campos || null,
        bastidor: meta.bastidor || null, texto: `${evento} ${detalhe || ''}`, delta: Number.isFinite(s) && Number.isFinite(antes) ? delta(s - antes) : '' };
      if (Number.isFinite(s)) antes = s;
      return linha;
    }));
  }
  const falasAte = i => frames.slice(0, i + 1).flatMap((q, k) => (q.fala || []).map(entry => ({ ...falaDe(entry), k })));
  const temFala = () => frames.some(q => q.fala?.length), temBastidor = () => linhas.some(l => l.bastidor);

  /* Counters: computed for every frame once, shown when they end above 0. */
  function contar() {
    const spec = CONTA[MODULOS[modulo].chave] || [];
    const valores = spec.map(() => frames.map(() => 0));
    frames.forEach((q, k) => spec.forEach((c, j) => {
      const antes = k ? valores[j][k - 1] : 0;
      const agora = c.fala ? (q.fala || []).length : c.q ? (c.q(q) ? 1 : 0) : linhas.filter(l => l.k === k && c.l(l)).length;
      valores[j][k] = antes + agora;
    }));
    return spec.map((c, j) => ({ r: c.r, v: valores[j] })).filter(c => c.v[c.v.length - 1] > 0).slice(0, 6);
  }

  /* Scrolls a panel (never the page) so el sits at frac of its height. */
  function rolarAte(box, el, frac) {
    const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    const top = box.scrollTop + r.top - b.top - (box.clientHeight - r.height) * frac;
    box.scrollTo({ top: Math.max(0, Math.round(top)), behavior: live() ? 'smooth' : 'auto' });
  }
  /* Architecture: the customer and the actors in order of first appearance; an edge each time the work passes
     from one actor to another (a tap hands it back to the customer). */
  function montarGrafo() {
    const nos = ['Cliente'], arestas = new Map(), primeiro = { Cliente: 0 }, porQuadro = [];
    let atual = 'Cliente';
    frames.forEach((q, k) => {
      if (q.toque) atual = 'Cliente';
      let viva = null;
      linhas.filter(l => l.k === k).forEach(l => {
        if (!nos.includes(l.ator)) { nos.push(l.ator); primeiro[l.ator] = k; }
        if (l.ator !== atual) {
          const id = `${atual}>${l.ator}`;
          if (!arestas.has(id)) arestas.set(id, { id, a: atual, b: l.ator, k });
          viva = id;
        }
        atual = l.ator;
      });
      const doQuadro = linhas.filter(l => l.k === k);
      // Without a log line, the one who acts is the speaker of the call line, else the customer.
      const fala = (q.fala || []).map(falaDe).pop(), voz = fala && (/IA/.test(fala.quem) ? 'Agente IA' : /consultor/i.test(fala.quem) ? 'Humano' : 'Cliente');
      porQuadro.push({ ativo: doQuadro.length ? doQuadro[doQuadro.length - 1].ator : voz && nos.includes(voz) ? voz : 'Cliente', viva });
    });
    return { nos, arestas: [...arestas.values()], primeiro, porQuadro };
  }
  function desenharGrafo() {
    arq.querySelectorAll('.at-no').forEach(n => n.remove());
    arq.insertAdjacentHTML('beforeend', grafo.nos.map(n => `<span class="at-no" data-no="${esc(n)}" style="--a:${cor(n)}"><i aria-hidden="true"></i><span class="at-no-t"><b>${esc(n === 'Cliente' ? 'Cliente no celular' : n)}</b><small data-no-ult></small></span><em data-no-n></em></span>`).join(''));
    arrumarGrafo();
  }
  /* Arc diagram: the actors stacked in order of first appearance; the next actor is one short arrow below,
     longer jumps forward arc on the right and the way back arcs on the left, each in its own lane. */
  function arrumarGrafo() {
    const w = arq.clientWidth;
    if (!w || !grafo) return;
    const idx = n => grafo.nos.indexOf(n);
    const pistas = { dir: [], esq: [] }, lane = {};
    const arcos = grafo.arestas.map(e => ({ e, i: idx(e.a), j: idx(e.b) })).filter(x => x.j !== x.i + 1)
      .sort((x, y) => Math.abs(x.j - x.i) - Math.abs(y.j - y.i));
    arcos.forEach(x => {
      const lado = x.j > x.i ? 'dir' : 'esq', lo = Math.min(x.i, x.j), hi = Math.max(x.i, x.j);
      let k = pistas[lado].findIndex(lista => lista.every(([a, b]) => hi <= a || lo >= b));
      if (k < 0) { pistas[lado].push([]); k = pistas[lado].length - 1; }
      pistas[lado][k].push([lo, hi]);
      lane[x.e.id] = { lado, k };
    });
    const passo = 9, esq = 16 + pistas.esq.length * passo, dir = 18 + pistas.dir.length * passo;
    arq.style.setProperty('--esq', esq + 'px'); arq.style.setProperty('--dir', dir + 'px');
    const box = arq.getBoundingClientRect();
    const rect = n => { const r = arq.querySelector(`.at-no[data-no="${CSS.escape(n)}"]`).getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, y: r.top - box.top + r.height / 2, x: r.left - box.left + Math.min(28, r.width / 2) }; };
    const f = v => v.toFixed(1);
    const paths = grafo.arestas.map(e => {
      const A = rect(e.a), B = rect(e.b), pista = lane[e.id];
      let d;
      if (!pista) d = `M${f(A.x)} ${f(A.b + 2)}L${f(B.x)} ${f(B.t - 3)}`;
      else {
        const off = (pista.lado === 'dir' ? 1 : -1) * (12 + pista.k * passo), x0 = pista.lado === 'dir' ? A.r : A.l, x1 = pista.lado === 'dir' ? B.r : B.l;
        const ya = A.y + (pista.k % 3 - 1) * 4, yb = B.y + (pista.k % 3 - 1) * 4;
        d = `M${f(x0 + Math.sign(off) * 2)} ${f(ya)}C${f(x0 + off * 1.35)} ${f(ya)} ${f(x1 + off * 1.35)} ${f(yb)} ${f(x1 + Math.sign(off) * 4)} ${f(yb)}`;
      }
      return `<path class="at-aresta" data-aresta="${esc(e.id)}" d="${d}" marker-end="url(#${uid}-seta)"/><path class="at-aresta-vivo" data-vivo="${esc(e.id)}" d="${d}"/>`;
    }).join('');
    arqSvg.setAttribute('viewBox', `0 0 ${box.width.toFixed(0)} ${box.height.toFixed(0)}`);
    arqSvg.setAttribute('width', box.width.toFixed(0)); arqSvg.setAttribute('height', box.height.toFixed(0));
    arqSvg.innerHTML = `<defs><marker id="${uid}-seta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z"/></marker></defs>${paths}`;
    pintarGrafo();
  }
  function pintarGrafo() {
    if (!grafo || quadro < 0) return;
    const agora = grafo.porQuadro[quadro] || {};
    let ativo = null;
    arq.querySelectorAll('.at-no').forEach(node => {
      const n = node.dataset.no, on = n === agora.ativo;
      node.classList.toggle('is-ativo', on);
      node.classList.toggle('is-feito', grafo.primeiro[n] <= quadro);
      const minhas = n === 'Cliente' ? [] : linhas.filter(l => l.ator === n && l.k <= quadro);
      const toques = n === 'Cliente' ? frames.slice(0, quadro + 1).filter(q => q.toque).length : 0;
      const total = n === 'Cliente' ? toques : minhas.length;
      node.querySelector('[data-no-n]').textContent = total ? `${total} ${n === 'Cliente' ? (total === 1 ? 'toque' : 'toques') : (total === 1 ? 'evento' : 'eventos')}` : '';
      node.querySelector('[data-no-ult]').textContent = n === 'Cliente' ? (on ? frames[quadro].desc || '' : '') : minhas.length ? minhas[minhas.length - 1].evento : '';
      if (on) ativo = node;
    });
    arqSvg.querySelectorAll('[data-aresta]').forEach(p => { const e = grafo.arestas.find(x => x.id === p.dataset.aresta); p.classList.toggle('is-feito', Boolean(e) && e.k <= quadro); });
    arqSvg.querySelectorAll('[data-vivo]').forEach(p => p.classList.toggle('is-vivo', p.dataset.vivo === agora.viva));
    // The active actor stays in view inside the panel, unless the person is reading it.
    const painel = arq.closest('.at-panel');
    if (ativo && painel?.clientHeight && performance.now() - lidoEm > 4000) {
      const r = ativo.getBoundingClientRect(), pr = painel.getBoundingClientRect();
      if (r.top < pr.top + 8 || r.bottom > pr.bottom - 8) rolarAte(painel, ativo, estreito.matches ? .25 : .5);
    }
  }

  /* The log: every line with time, delta, actor, event, detail and the masked fields; next lines stay short. */
  function montarLog() {
    log.innerHTML = linhas.map((l, i) => `<li data-frame="${l.k}" data-linha="${i}" data-tipo="${esc(l.tipo)}"><button type="button" data-at-goto="${l.k}">
      <span class="at-quando">${l.dia ? `<small>${ddmm(l.dia)}</small>` : ''}<time>${esc(l.t || '--:--:--')}</time>${l.delta ? `<span class="at-delta">${l.delta}</span>` : ''}</span>
      <span class="at-linha"><span class="at-actor" style="--a:${cor(l.ator)}">${esc(l.ator)}</span><b>${esc(l.evento)}</b>${l.detalhe ? `<span class="at-det">${esc(l.detalhe)}</span>` : ''}${l.campos ? `<span class="at-campos">${Object.entries(l.campos).map(([k, v]) => `<span><i>${esc(k)}</i> <code>${esc(v)}</code></span>`).join('')}</span>` : ''}${l.bastidor ? `<span class="at-tem-bastidor">${glifo('chat')}Resumo enviado para quem assume</span>` : ''}</span>
    </button></li>`).join('') || '<li class="at-vazio">Este fluxo não registra eventos.</li>';
  }
  function pintarLog() {
    let alvo = null;
    log.querySelectorAll('li[data-frame]').forEach(li => {
      const f = Number(li.dataset.frame);
      li.dataset.when = f < quadro ? 'past' : f === quadro ? 'now' : 'next';
      if (f <= quadro) alvo = li;
    });
    // The newest line stays in view inside the log, unless the person is reading it.
    if (alvo && performance.now() - lidoEm > 4000 && log.clientHeight) {
      // On phones the dock covers the bottom of the list, so the line sits in the upper part.
      rolarAte(log, alvo, estreito.matches ? .2 : .75);
    }
    requestAnimationFrame(desenharFio);
  }
  /* Desktop: a thin line from the phone to the current log line, drawn again at every frame. */
  function desenharFio() {
    const path = fio.firstElementChild;
    const atual = [...log.querySelectorAll('li[data-when="now"]')].pop();
    if (!largo.matches || abaVista() !== 'registro' || !atual) { fio.classList.remove('is-on'); return; }
    const box = main.getBoundingClientRect(), phone = stage.getBoundingClientRect(), lr = log.getBoundingClientRect(), r = atual.getBoundingClientRect();
    const y1 = r.top + Math.min(r.height / 2, 22);
    if (y1 < lr.top + 4 || y1 > lr.bottom - 4) { fio.classList.remove('is-on'); return; }
    const x0 = phone.right - box.left + 6, x1 = r.left - box.left - 4;
    const y0 = Math.max(phone.top + 70, Math.min(phone.bottom - 70, y1)) - box.top, y = y1 - box.top;
    const mid = (x0 + x1) / 2;
    fio.setAttribute('viewBox', `0 0 ${box.width.toFixed(0)} ${box.height.toFixed(0)}`);
    path.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)}C${mid.toFixed(1)} ${y0.toFixed(1)} ${mid.toFixed(1)} ${y.toFixed(1)} ${x1.toFixed(1)} ${y.toFixed(1)}`);
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    fio.classList.add('is-on');
    if (reduce.matches || !live()) { path.style.transition = 'none'; path.style.strokeDashoffset = '0'; return; }
    path.style.transition = 'none'; path.style.strokeDashoffset = `${length}`;
    void path.getBoundingClientRect();
    path.style.transition = ''; path.style.strokeDashoffset = '0';
  }

  /* Transcript of the call and what the person receives backstage, outside the phone. */
  function montarFala() {
    const seg = placement.audio?.src ? Math.round(placement.audio.duracaoS || (placement.audio.durationMs || 0) / 1000) : 0;
    falaBox.innerHTML = `${temFala() ? `<div class="at-fala"><h4>Transcrição da ligação</h4><p class="at-fala-nota">Fora do celular: o app não mostra a transcrição.</p>${seg ? `<button type="button" class="at-ouvir" data-at-ouvir aria-pressed="false">${glifo('ouvir')}<span>Ouvir a ligação (${seg} s)</span></button>` : ''}<ol class="at-falas" data-at-falas></ol></div>` : ''}${temBastidor() ? `<div class="at-bastidores" data-at-bastidores></div>` : ''}`;
    const tab = $('[data-at-aba="fala"]');
    tab.hidden = !temFala() && !temBastidor();
    tab.querySelector('[data-at-aba-nome]').textContent = temFala() && temBastidor() ? 'Ligação e resumo' : temFala() ? 'Transcrição' : 'Bastidor';
    tab.dataset.curto = temFala() ? 'Ligação' : 'Bastidor';
    if (tab.hidden && aba === 'fala') aba = 'tela';
  }
  function pintarFala() {
    const lista = falaBox.querySelector('[data-at-falas]');
    if (lista) {
      const falas = falasAte(quadro);
      lista.innerHTML = falas.length ? falas.map(f => `<li${f.k === quadro ? ' data-agora' : ''} data-texto="${esc(f.texto)}"><b style="--a:${corFala(f.quem)}">${esc(f.quem)}</b><span>${esc(f.texto)}</span></li>`).join('') : '<li class="at-vazio">A transcrição começa quando a ligação é atendida.</li>';
      const atual = lista.querySelector('[data-agora]');
      const painel = falaBox.closest('.at-panel');
      if (atual && painel.clientHeight && performance.now() - lidoEm > 4000) rolarAte(painel, atual, estreito.matches ? .2 : .5);
    }
    const caixa = falaBox.querySelector('[data-at-bastidores]');
    if (caixa) {
      const vistos = linhas.filter(l => l.bastidor && l.k <= quadro);
      caixa.innerHTML = vistos.length ? vistos.map(l => `<article class="at-bastidor${l.k === quadro ? ' is-novo' : ''}"><h4>${esc(l.bastidor.titulo)}</h4><p>${esc(l.bastidor.texto)}</p><small>${esc(l.ator)} · ${esc(l.t)}</small></article>`).join('')
        : `<article class="at-bastidor is-vazio"><h4>Bastidor</h4><p>Quando a IA passa a conversa para uma pessoa, o resumo que ela recebe aparece nesta aba. A cliente não vê esse resumo.</p></article>`;
    }
  }

  /* The dock: the line being spoken or the latest event, the caption and the controls. */
  function pintarDock() {
    const item = frames[quadro], fala = (item.fala || []).map(falaDe).pop();
    const ultima = [...linhas].reverse().find(l => l.k <= quadro);
    if (fala) {
      ev.dataset.tipo = 'fala'; ev.dataset.novo = 'true';
      ev.innerHTML = `<span class="at-actor" style="--a:${corFala(fala.quem)}">${esc(fala.quem)}</span><q>${esc(fala.texto)}</q>`;
    } else if (ultima) {
      ev.dataset.tipo = 'log'; ev.dataset.novo = String(ultima.k === quadro);
      ev.innerHTML = `<span class="at-actor" style="--a:${cor(ultima.ator)}">${esc(ultima.ator)}</span><b>${esc(ultima.evento)}</b>${ultima.detalhe ? ` <small>${esc(ultima.detalhe)}</small>` : ''}<time>${ultima.dia ? ddmm(ultima.dia) + ' ' : ''}${esc(ultima.t)}</time>`;
    } else {
      ev.dataset.tipo = 'vazio'; ev.dataset.novo = 'false';
      ev.innerHTML = `<span class="at-actor" style="--a:${cor('Cliente')}">Cliente</span><b>Nada registrado ainda</b> <small>ela está vendo a tela</small>`;
    }
    caption.textContent = item.desc || '';
    pos.textContent = `${quadro + 1} / ${frames.length}`;
    agora.setAttribute('aria-live', playing ? 'off' : 'polite');
  }
  function pintarContadores() {
    count.innerHTML = contadores.map(c => `<div><dt>${esc(c.r)}</dt><dd>${c.v[quadro]}</dd></div>`).join('');
  }
  function pintarPassos() {
    const s = passoDe(quadro), fim = quadro === last();
    steps.querySelectorAll('li').forEach((li, k) => {
      const ids = placement.passos[k].quadros;
      li.dataset.state = k < s || (fim && k === s) ? 'done' : k === s ? 'on' : 'next';
      const p = k < s ? 1 : k > s ? 0 : (ids.indexOf(quadro) + 1) / ids.length;
      li.querySelector('[data-rail]').style.setProperty('--p', p.toFixed(3));
      const button = li.querySelector('button');
      if (k === s) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
  }
  function rotulo() {
    const fim = quadro >= last();
    if (live()) {
      play.textContent = playing ? 'Pausar' : fim ? 'Rever' : 'Reproduzir';
      play.setAttribute('aria-pressed', String(playing));
      play.setAttribute('aria-label', playing ? 'Pausar a automação' : fim ? 'Rever do início' : 'Reproduzir a automação');
    } else {
      play.textContent = fim ? 'Rever' : 'Próximo';
      play.removeAttribute('aria-pressed');
      play.setAttribute('aria-label', fim ? 'Voltar ao primeiro quadro' : 'Próximo quadro');
    }
    main.dataset.playing = String(playing);
    main.dataset.live = String(live());
    agora.setAttribute('aria-live', playing ? 'off' : 'polite');
  }

  /* One frame through the engine, then the panel; the point and the finger land once the scene settles. */
  function mostrar(i, { instant = false } = {}) {
    quadro = Math.max(0, Math.min(last(), i));
    applyFrame(screen, frames, quadro, { instant: instant || !live(), playing });
    pintarDock(); pintarLog(); pintarContadores(); pintarPassos(); pintarGrafo(); pintarFala();
    rotulo();
    const g = ++geracao, item = frames[quadro];
    clearTimeout(timer);
    clearDot(stage); hideTap(stage);
    inicio = performance.now(); gasto = 0; duracao = 0;
    pintarBarra();
    settle(screen, item).then(() => {
      if (g !== geracao || !screen) return;
      duracao = tempoMinimo(screen, frames, quadro);
      showTap(stage, screen, item);
      positionDot(stage, screen, item, passoDe(quadro) + 1);
      // Phones: the sticky dock covers the bottom of the phone; while playing, the page brings the button, the
      // point or (in a call) the voice wave above it.
      if (playing && (estreito.matches || deitado.matches)) seguirFoco(stage, { barra: estreito.matches ? $('[data-at-dock]') : null, extra: item.fala ? '.au-onda:not(.au-onda--ilha), .au-wacall-bar, .au-incall-grid' : '' });
      agendar();
    });
  }
  /* The thin bar of the dock: how much of this frame has passed; it runs to the end while playing. */
  function pintarBarra() {
    const feito = duracao ? Math.min(1, (playing ? performance.now() - inicio : gasto) / duracao) : 0;
    barra.style.transition = 'none';
    barra.style.transform = `scaleX(${feito.toFixed(3)})`;
    if (!playing || !duracao) return;
    void barra.offsetWidth;
    barra.style.transition = `transform ${Math.round(Math.max(0, duracao - (performance.now() - inicio)))}ms linear`;
    barra.style.transform = 'scaleX(1)';
  }
  function agendar() {
    clearTimeout(timer);
    pintarBarra();
    if (!playing || !duracao) return;
    const resta = Math.max(0, duracao - (performance.now() - inicio));
    timer = setTimeout(() => {
      if (!playing) return;
      if (quadro >= last()) { playing = false; syncMedia(screen, false); rotulo(); return; }
      mostrar(quadro + 1);
    }, resta);
  }
  /* Plays from where it stopped (or from the start once it has ended). */
  function tocar() {
    if (!live() || !frames.length) { rotulo(); return; }
    pausado = false;
    if (quadro >= last() && !playing) { playing = true; mostrar(0, { instant: true }); return; }
    playing = true;
    inicio = performance.now() - gasto;
    syncMedia(screen, true);
    agendar(); rotulo();
  }
  function parar(manual = false) {
    if (playing) gasto = performance.now() - inicio;
    playing = false;
    clearTimeout(timer);
    if (manual) pausado = true;
    if (screen) syncMedia(screen, false);
    pintarBarra(); rotulo();
  }
  const podeTocar = () => visivel && !pausado && live();

  function carregar() {
    parar(); pararAudio();
    const m = MODULOS[modulo];
    placement = placementByKey(falha && m.falha ? m.falha : m.key);
    frames = placement.quadros;
    linhas = lerLinhas();
    contadores = contar();
    grafo = montarGrafo();
    quadro = -1;
    stage.innerHTML = `${renderMock(placement)}<span class="cx-dot" data-cx-dot aria-hidden="true" hidden>1</span><span class="cx-tap" data-cx-tap aria-hidden="true" hidden></span>`;
    stage.querySelector('.ch-iphone')?.classList.toggle('ch-iphone--compacto', compacto.matches);
    screen = stage.querySelector('.cm-screen');
    const c = CLIENTES[placement.cliente] || {};
    const caminhos = placementByKey(m.key)?.caminhos || ['Caminho feliz', 'Com falhas'];
    stage.setAttribute('aria-label', `${m.label}${falha ? `, ${caminhos[1].toLowerCase()}` : ''}. ${c.marca ? c.marca + ', marca fictícia. ' : ''}${placement.frase || ''}`);
    root.dataset.modulo = m.chave; root.dataset.falha = String(falha);
    root.querySelectorAll('[data-at-mod]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.atMod) === modulo)));
    const path = $('[data-at-path]');
    path.hidden = !m.falha;
    path.querySelectorAll('[data-at-falha]').forEach(b => { b.setAttribute('aria-pressed', String((b.dataset.atFalha === '1') === falha)); b.textContent = caminhos[Number(b.dataset.atFalha)]; });
    $('[data-at-cliente]').innerHTML = c.marca ? `${marca(placement.cliente, 'circulo', 'at-marca')}<span><b>${esc(c.marca)}</b><small>${esc(c.tipo)} · marca fictícia</small></span>` : '';
    $('[data-at-objetivo]').innerHTML = placement.objetivo ? `<b>Objetivo</b> ${esc(placement.objetivo)}` : '';
    $('[data-at-base]').textContent = placement.base ? `Baseado em: ${placement.base}` : '';
    steps.innerHTML = placement.passos.map((p, k) => `<li data-state="next"><button type="button" data-at-step="${k}"><span class="at-step-n" aria-hidden="true">${k + 1}</span><span class="at-step-t">${esc(p.rotulo)}</span><i class="at-rail" aria-hidden="true"><i data-rail></i></i></button></li>`).join('');
    montarLog(); montarFala(); desenharGrafo(); mostrarAba();
    mostrar(0, { instant: true });
  }
  /* A module or a path chosen by the person (or by a link): plays at once, scrolls only if the phone is away. */
  function escolher(k, comFalha, { hash = true } = {}) {
    modulo = k; falha = Boolean(comFalha && MODULOS[k].falha);
    carregar();
    if (hash) history.replaceState(history.state, '', `#sistemas/${MODULOS[k].chave}${falha ? '/falha' : ''}`);
    const alvo = estreito.matches && aba !== 'tela' ? $('.at-panels') : stage, r = alvo.getBoundingClientRect();
    if (hash && (r.bottom < 60 || r.top > innerHeight - 60)) alvo.scrollIntoView({ block: 'nearest', behavior: live() ? 'smooth' : 'auto' });
    pausado = false;
    if (live() && (visivel || hash)) tocar();
  }
  function lerHash() {
    const m = /^#sistemas\/([a-z]+)(\/falha)?\/?$/.exec(location.hash);
    const k = m ? MODULOS.findIndex(x => x.chave === m[1]) : -1;
    if (k < 0) return false;
    if (k !== modulo || Boolean(m[2]) !== falha || !placement) escolher(k, Boolean(m[2]), { hash: false });
    return true;
  }

  /* Tabs: on phones Tela | Registro | Arquitetura (| Transcrição) swap the view in place of the phone;
     from 600px the phone stays and the tabs swap the inspector. */
  function mostrarAba() {
    if (!estreito.matches && aba === 'tela') aba = 'registro';
    const vista = abaVista();
    main.dataset.aba = vista;
    root.querySelectorAll('[data-at-aba]').forEach(tab => {
      const on = tab.dataset.atAba === vista;
      tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1;
    });
    root.querySelectorAll('[data-at-panel]').forEach(p => { p.hidden = p.dataset.atPanel !== vista; });
    // The phone is a tab panel only where Tela is a tab (phones).
    const phone = $('.at-phone');
    if (estreito.matches) { phone.setAttribute('role', 'tabpanel'); phone.setAttribute('aria-labelledby', `${uid}-t-tela`); }
    else { phone.removeAttribute('role'); phone.removeAttribute('aria-labelledby'); }
    if (vista === 'arquitetura') requestAnimationFrame(arrumarGrafo);
    lidoEm = -Infinity;
    if (vista === 'registro' && quadro >= 0) pintarLog();
    if (vista === 'fala' && quadro >= 0) pintarFala();
    requestAnimationFrame(desenharFio);
  }

  /* Optional recorded call (placement.audio = {src, segmentos, durationMs}): never plays by itself; it shows
     the frame of the line being spoken. */
  function pararAudio() {
    if (!audio) return;
    audio.pause(); audio = null;
    root.querySelector('[data-at-ouvir]')?.setAttribute('aria-pressed', 'false');
  }
  function ouvir(button) {
    if (audio) { pararAudio(); return; }
    const a = placement.audio;
    if (!a?.src) return;
    parar(true);
    const segs = (a.segmentos || a.segments || []).map(s => ({ texto: s.texto || s.text, startMs: s.startMs, endMs: s.endMs }));
    audio = new Audio(a.src);
    audio.addEventListener('timeupdate', () => {
      const ms = audio.currentTime * 1000, seg = segs.find(s => ms >= s.startMs && ms < s.endMs);
      if (!seg) return;
      const k = frames.findIndex(q => (q.fala || []).some(f => falaDe(f).texto === seg.texto));
      if (k >= 0 && k !== quadro) mostrar(k);
    });
    audio.addEventListener('ended', pararAudio);
    audio.play().then(() => button.setAttribute('aria-pressed', 'true')).catch(pararAudio);
  }

  root.addEventListener('click', event => {
    const mod = event.target.closest('[data-at-mod]');
    if (mod) { escolher(Number(mod.dataset.atMod), false); return; }
    const path = event.target.closest('[data-at-falha]');
    if (path) { escolher(modulo, path.dataset.atFalha === '1'); return; }
    const tab = event.target.closest('[data-at-aba]');
    if (tab) { aba = tab.dataset.atAba; mostrarAba(); return; }
    const goto = event.target.closest('[data-at-goto]');
    if (goto) { parar(true); mostrar(Number(goto.dataset.atGoto)); return; }
    const step = event.target.closest('[data-at-step]');
    if (step) { parar(true); mostrar(placement.passos[Number(step.dataset.atStep)].quadros[0]); return; }
    if (event.target.closest('[data-at-prev]')) { parar(true); mostrar(quadro - 1); return; }
    if (event.target.closest('[data-at-next]')) { parar(true); mostrar(quadro + 1); return; }
    const ouvirBtn = event.target.closest('[data-at-ouvir]');
    if (ouvirBtn) { ouvir(ouvirBtn); return; }
    if (event.target.closest('[data-at-play]')) {
      if (!live()) { pausado = true; mostrar(quadro >= last() ? 0 : quadro + 1); return; }
      if (playing) parar(true); else tocar();
    }
  });
  stage.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault(); parar(true); mostrar(quadro + (event.key === 'ArrowRight' ? 1 : -1));
  });
  $('.at-tabs').addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const tabs = [...root.querySelectorAll('[data-at-aba]')].filter(t => !t.hidden && getComputedStyle(t).display !== 'none');
    const at = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const next = tabs[(at + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    if (!next) return;
    event.preventDefault(); aba = next.dataset.atAba; mostrarAba(); next.focus();
  });
  // Reading the log or the transcript never pauses; it only holds the automatic scroll of the list for a while.
  const lendo = () => { lidoEm = performance.now(); };
  [log, falaBox, arq].forEach(box => ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(kind => box.addEventListener(kind, lendo, { passive: true })));
  log.addEventListener('scroll', () => requestAnimationFrame(desenharFio), { passive: true });

  estreito.addEventListener('change', () => { if (estreito.matches) aba = 'tela'; mostrarAba(); });
  largo.addEventListener('change', () => requestAnimationFrame(desenharFio));
  compacto.addEventListener('change', () => stage.querySelector('.ch-iphone')?.classList.toggle('ch-iphone--compacto', compacto.matches));
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (abaVista() === 'arquitetura') arrumarGrafo(); desenharFio(); }).observe(main);

  /* A link shows the phone: after the section loader has brought the section up, the panel comes to the top and
     stays there for up to 3 s while the sections above it load and grow, until the person scrolls or touches. */
  let soltar = null;
  // The panel's top on screen; when the phone (and on phones the dock under it) would end below the window, a
  // little further, so it fits whole while its top stays on screen.
  function alinhar() {
    const r = stage.getBoundingClientRect(), dock = estreito.matches ? ($('[data-at-dock]')?.offsetHeight || 0) + 8 : 0;
    const topo = scrollY + r.top, fim = scrollY + r.bottom + dock;
    let y = scrollY + main.getBoundingClientRect().top - (parseFloat(getComputedStyle(main).scrollMarginTop) || 0);
    if (fim - y > innerHeight - 12) y = Math.min(fim - innerHeight + 12, topo - 12);
    scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  }
  function mostrarPalco() {
    soltar?.();
    const page = document.querySelector('main') || document.body, kinds = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    let altura = page.offsetHeight;
    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { if (page.offsetHeight !== altura) { altura = page.offsetHeight; alinhar(); } }) : null;
    const timer = setTimeout(() => soltar?.(), 3000);
    soltar = () => { ro?.disconnect(); clearTimeout(timer); kinds.forEach(k => removeEventListener(k, soltar)); soltar = null; };
    kinds.forEach(k => addEventListener(k, soltar, { passive: true }));
    setTimeout(() => { alinhar(); ro?.observe(page); }, 60);
  }
  if (lerHash()) mostrarPalco(); else { modulo = 0; carregar(); }
  addEventListener('hashchange', () => {
    if (!lerHash()) return;
    mostrarPalco();
    pausado = false;
    if (live() && visivel) tocar();
  });
  if ('IntersectionObserver' in window) {
    // A quarter of .at-main on screen (or 40% of the screen filled by it, when it is taller than 4 screens).
    new IntersectionObserver(([entry]) => {
      visivel = entry.isIntersecting && (entry.intersectionRatio >= .25 || entry.intersectionRect.height >= innerHeight * .4);
      if (!visivel) parar();
      else if (podeTocar() && !playing && quadro < last()) tocar();
    }, { threshold: [0, .1, .25, .4, .6] }).observe(main);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); else if (podeTocar() && quadro < last()) tocar(); });
  reduce.addEventListener('change', () => { if (!live()) parar(); else rotulo(); });
  new MutationObserver(() => { if (!live()) parar(); else if (podeTocar() && !playing && quadro < last()) tocar(); else rotulo(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

export function mountTrace() {
  document.querySelectorAll('[data-vitrine="sistemas"]:not([data-trace-ready])').forEach(root => {
    root.dataset.traceReady = 'true';
    mountOne(root);
  });
}
