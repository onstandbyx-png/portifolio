/* Single source for the fictitious advertisers and the story every flow tells: brands, marks, the person,
   today, offers, orders, legal lines and third parties. Other modules import from here and never write a
   brand name, a date or an order number by hand. All brands, people, streets and numbers are fictitious. */

/* Dates are computed with Date (UTC noon, so the weekday never shifts with the time zone). */
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dia = iso => {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(iso)) ? new Date(`${iso}T12:00:00Z`) : null;
  if (!d || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) throw new RangeError(`data inválida: ${iso}`);
  return d;
};
const iso = d => d.toISOString().slice(0, 10);
const somaDias = (base, n) => { const d = dia(base); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const somaMeses = (base, n) => { const d = dia(base); d.setUTCMonth(d.getUTCMonth() + n); return iso(d); };
const noites = (ida, volta) => Math.round((dia(volta) - dia(ida)) / 864e5);

/* 'quarta' */
export const diaSemana = data => DIAS[dia(data).getUTCDay()];
/* 'qui, 29 out' */
export const dataCurta = data => { const d = dia(data); return `${DIAS[d.getUTCDay()].slice(0, 3)}, ${d.getUTCDate()} ${MESES[d.getUTCMonth()].slice(0, 3)}`; };
/* 'quinta-feira, 29 de outubro' (with ano: '... de 2027') */
export const dataLonga = (data, ano = false) => {
  const d = dia(data), w = d.getUTCDay();
  return `${w === 0 || w === 6 ? DIAS[w] : DIAS[w] + '-feira'}, ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}${ano ? ' de ' + d.getUTCFullYear() : ''}`;
};

const congela = o => { Object.values(o).forEach(v => v && typeof v === 'object' && congela(v)); return Object.freeze(o); };

/* Theme tokens per brand, for sites and ad art. fonte uses only the vendored OFL faces (Inter, Newsreader italic);
   raio is the corner radius in mock units; acento says where cor2 goes. */
const SERIF = 'Newsreader, Georgia, serif', SANS = "'Inter Variable', Inter, system-ui, sans-serif";

/* Fictitious advertisers, one per client type. Names kept as the owner chose them on 27/10/2026; a later decision
   changes only this file. Keys and the fields tipo, marca, arroba, dominio and cor are the ones the flows already read. */
export const CLIENTES = congela({
  restaurante: { tipo: 'restaurante', marca: 'Casa Amaro', curta: 'Casa Amaro', arroba: 'casaamaro', dominio: 'casaamaro.exemplo', cor: '#a4462a', cor2: '#f3c969',
    tom: 'Fala como a dona da casa: calorosa e direta, sempre com o prato e a hora certos.', assinatura: 'Feijoada no tacho, todo sábado.',
    tema: { fonte: SERIF, estilo: 'italic', peso: 600, raio: 18, acento: 'selo' } },
  clinica: { tipo: 'clínica odontológica', marca: 'Vilela Odontologia', curta: 'Vilela', arroba: 'vilelaodontologia', dominio: 'vilela.exemplo', cor: '#2f6f73', cor2: '#bfe6dc',
    tom: 'Calma e precisa: explica o procedimento antes de falar em horário.', assinatura: 'Avaliação sem pressa, plano por escrito.',
    tema: { fonte: SANS, estilo: 'normal', peso: 560, raio: 12, acento: 'fundo' } },
  incorporadora: { tipo: 'incorporadora', marca: 'Atlântica Incorporadora', curta: 'Atlântica', arroba: 'atlanticaincorporadora', dominio: 'atlantica.exemplo', cor: '#1f4e5f', cor2: '#efd3a8',
    tom: 'Sóbria e concreta: planta, vista e prazo, sem superlativos.', assinatura: 'Casas na falésia, sala voltada para o mar.',
    tema: { fonte: SERIF, estilo: 'italic', peso: 500, raio: 2, acento: 'linha' } },
  varejo: { tipo: 'loja de tecnologia', marca: 'Ponto Tech', curta: 'Ponto Tech', arroba: 'pontotech', dominio: 'pontotech.exemplo', cor: '#5b3df5', cor2: '#ffd43b',
    tom: 'Técnica sem jargão: compara pelo uso, não pela ficha.', assinatura: 'O notebook certo para quem cria.',
    tema: { fonte: SANS, estilo: 'normal', peso: 760, raio: 0, acento: 'botao' } },
  turismo: { tipo: 'agência de viagens', marca: 'Destino Certo Viagens', curta: 'Destino Certo', arroba: 'destinocerto', dominio: 'destinocerto.exemplo', cor: '#d9822b', cor2: '#2f3f86',
    tom: 'Próxima e organizada: diz a data, quem vai e o que está incluído.', assinatura: 'Festas do interior, em grupo pequeno.',
    tema: { fonte: SANS, estilo: 'normal', peso: 700, raio: 20, acento: 'selo' } },
  educacao: { tipo: 'escola de idiomas', marca: 'Speak Up Idiomas', curta: 'Speak Up', arroba: 'speakupidiomas', dominio: 'speakup.exemplo', cor: '#e5533d', cor2: '#ffd0c4',
    tom: 'Leve e encorajadora: corrige sem constranger.', assinatura: 'Conversação para quem trava na hora de falar.',
    tema: { fonte: SANS, estilo: 'normal', peso: 760, raio: 22, acento: 'balao' } },
  financas: { tipo: 'gestora de patrimônio', marca: 'Valore Patrimônio', curta: 'Valore', arroba: 'valorepatrimonio', dominio: 'valore.exemplo', cor: '#0f1a2c', cor2: '#d8b866',
    tom: 'Formal e cuidadosa: explica antes de oferecer e nunca promete rendimento.', assinatura: 'Patrimônio da família, com plano de sucessão.',
    tema: { fonte: SERIF, estilo: 'italic', peso: 500, raio: 4, acento: 'linha' } },
  automotivo: { tipo: 'concessionária', marca: 'EcoDrive Elétricos', curta: 'EcoDrive', arroba: 'ecodrive', dominio: 'ecodrive.exemplo', cor: '#0f6b5c', cor2: '#a6f0c4',
    tom: 'Prática e paciente: tira a dúvida da recarga antes de vender.', assinatura: 'Test drive com a recarga explicada.',
    tema: { fonte: SANS, estilo: 'normal', peso: 640, raio: 10, acento: 'botao' } },
});

/* Brand marks: 64 x 64, drawn white (and cor2) for the coloured circle or square of marca(). At most two colours;
   knock-outs use evenodd, never the background colour. Each one reads at 22 px. */
const W = '#fff', C = k => CLIENTES[k].cor2;
const svg = body => `<svg viewBox="0 0 64 64">${body}</svg>`;
const bandeirola = (x, y, c) => `<path d="M${x - 5} ${y}h10v11l-5-4-5 4z" fill="${c}"/>`;
export const MARCAS = congela({
  /* a copper pot seen from above: the rim is a C, the two handles its terminals, the feijoada inside */
  restaurante: svg(`<path d="M44 20.3A17.5 17.5 0 1 0 44 43.7" fill="none" stroke="${W}" stroke-width="7.5"/><path d="M42 20.3h11M42 43.7h11" stroke="${W}" stroke-width="7.5" stroke-linecap="round"/><circle cx="31" cy="32" r="6.5" fill="${C('restaurante')}"/>`),
  /* V under an arch: the monogram of Vilela, the arch of the teeth without drawing a tooth */
  clinica: svg(`<path d="M13 54V31a19 19 0 0 1 38 0v23" fill="none" stroke="${W}" stroke-width="6.5"/><path d="M22 28l10 22 10-22" fill="none" stroke="${C('clinica')}" stroke-width="6.5" stroke-linejoin="round"/>`),
  /* a cliff over the sea, cut by the horizon, with the sun on the line */
  incorporadora: svg(`<path fill-rule="evenodd" d="M5 58V30C13 22 24 17 35 16l3 6-2 6 5 6-1 7 4 6-1 11z M5 37h40v3.6H5z" fill="${W}"/><path d="M44 38.8h15" stroke="${W}" stroke-width="3.6"/><path d="M46.5 37a6.5 6.5 0 0 1 13 0z" fill="${C('incorporadora')}"/>`),
  /* a square-cornered key with a hollow P and its dot: P. */
  varejo: svg(`<path fill-rule="evenodd" d="M9 9h46v46H9z M22 17h12a9 9 0 0 1 0 18h-5v11h-7z M29 23v6h4.5a3 3 0 0 0 0-6z M9 48.4h46v2.2H9z" fill="${W}"/><path d="M39 38.5h7.5V46H39z" fill="${C('varejo')}"/>`),
  /* a D whose bowl is a string of festival bunting */
  turismo: svg(`<path d="M11 8h7v48h-7z" fill="${W}"/><path d="M18 11C38 11 52 20 52 32S38 53 18 53" fill="none" stroke="${W}" stroke-width="3.4"/>${bandeirola(30, 12.5, C('turismo'))}${bandeirola(43, 18.5, W)}${bandeirola(50.5, 31, C('turismo'))}`),
  /* two overlapping speech bubbles and an acute accent */
  educacao: svg(`<path d="M15 12h22a7 7 0 0 1 7 7v10a7 7 0 0 1-7 7H22l-7 6v-6a7 7 0 0 1-7-7V19a7 7 0 0 1 7-7z" fill="${C('educacao')}"/><path d="M29 24h20a7 7 0 0 1 7 7v11a7 7 0 0 1-7 7h-1v7l-8-7H29a7 7 0 0 1-7-7V31a7 7 0 0 1 7-7z" fill="${W}"/><path d="M41 19l6-9" stroke="${W}" stroke-width="4.5" stroke-linecap="round"/>`),
  /* a V built from two fluted columns, with capitals and a shared base */
  financas: svg(`<path fill-rule="evenodd" d="M11 13h13l9 29 9-29h11L38 55H28z M15.25 16h1.5l12.4 37h-1.5z M19.65 16h1.5l10.4 31.5h-1.5z M46.85 16h1.5l-9.3 31h-1.5z" fill="${C('financas')}"/><path d="M8 10.5h19M37 10.5h19M24 56.5h18" stroke="${C('financas')}" stroke-width="3.5"/>`),
  /* an E whose arms are current waves */
  automotivo: svg(`<path d="M12 10h6.5v44H12z" fill="${W}"/><path d="M18 13q4.5-5 9 0t9 0t9 0t7 0M18 51q4.5-5 9 0t9 0t9 0t7 0" fill="none" stroke="${W}" stroke-width="5.5" stroke-linecap="round"/><path d="M18 32q4.5-5 9 0t9 0t9 0" fill="none" stroke="${C('automotivo')}" stroke-width="5.5" stroke-linecap="round"/>`),
});

/* The day every flow happens: a Wednesday morning. */
export const HOJE = congela({ iso: '2026-10-21', hora: '10:09' });

/* The one customer in every journey. The phone is always masked. */
export const PESSOA = congela({
  nome: 'Marina Alves', primeiro: 'Marina', iniciais: 'MA', bairro: 'Pinheiros, São Paulo', cargo: 'Sócia',
  telefone: '(11) 9 8•••-••21', email: 'marina.alves@correio.exemplo', cpf: '•••.482.317-••',
  viagem: 'Marina, o marido e os dois filhos (8 e 2 anos)', viajantes: { adultos: 2, criancas: [8, 2] },
});

/* Order numbers, one per purchase, never shared between flows. Key: 'canal/formato'. */
export const PEDIDOS = congela({ 'tiktok/infeed': '10482', 'rcs/conversa': '10517', 'instagram/live': '0427', 'whatsapp/catalogo': '0428' });

/* Pix Automático of the school: monthly on the start day. The 2nd charge fails; the bank warns the day before
   and the payer can cancel until 23h59 of that day (BCB rule). */
const MENSAL = '2026-11-05';
const cobrancas = [0, 1, 2].map(n => somaMeses(MENSAL, n));

const SAIDAS = [{ id: 's1', ida: '2027-05-14', volta: '2027-05-18' }, { id: 's2', ida: '2027-05-15', volta: '2027-05-18' }]
  .map(s => ({ ...s, noites: noites(s.ida, s.volta) }));
const HORARIO_RESTAURANTE = 'Almoço ter a dom, 11h30–15h30; jantar qui a sáb, 19h–23h';

/* What each brand offers, with dates in ISO. Render dates with dataCurta and dataLonga. */
export const OFERTAS = congela({
  turismo: {
    produto: 'Festa do Divino em Pirenópolis, em grupo pequeno', cidade: 'Pirenópolis (GO)', saidas: SAIDAS,
    destaque: 'Cavalhadas de domingo a terça (16 a 18 de maio de 2027)', cavalhadas: ['2027-05-16', '2027-05-17', '2027-05-18'],
    transporte: 'Voo São Paulo–Brasília e traslado até Pirenópolis', politica: 'Pré-reserva com sinal por Pix; saldo até 30 dias antes',
    criancas: 'No colo só até 1 ano e 11 meses; a partir de 2 anos, assento com tarifa de criança', consultora: 'Júlia',
    horario: 'Seg a sex, 9h–18h; sáb, 9h–13h',
  },
  varejo: {
    skus: [
      { id: 'creator15-grafite', nome: 'Notebook Creator 15', cor: 'grafite', estado: 'disponível' },
      { id: 'creator15-branco', nome: 'Notebook Creator 15', cor: 'branco', estado: 'chega em 10/11', chegada: '2026-11-10' },
      { id: 'slim14-grafite', nome: 'Notebook Slim 14', cor: 'grafite', estado: 'disponível' },
    ],
    parcelamento: 'em até 10x', frete: 'Entrega em 2 dias úteis em SP', horario: 'Seg a sáb, 10h–20h',
  },
  educacao: {
    aulaExperimental: { iso: '2026-10-29', hora: '19:00', duracao: '30 min', formato: 'on-line' }, nivel: 'B1',
    clube: 'Conversação às quintas',
    mensalidade: {
      inicio: MENSAL, periodicidade: 'mensal', objeto: 'Mensalidade · Conversação às quintas', cobrancas,
      falha: { iso: cobrancas[1], aviso: somaDias(cobrancas[1], -1), cancelar: 'Cancelar este pagamento (até 23h59 de hoje)' },
      retomada: cobrancas[2],
    },
    horario: 'Seg a sex, 8h–21h; sáb, 9h–13h',
  },
  clinica: {
    avaliacao: { iso: '2026-10-29', hora: '09:00', unidade: 'Pinheiros' }, alternativa: { iso: '2026-10-30', hora: '14:00' },
    interesse: 'clareamento', responsavel: 'Dra. Helena Prado', horario: 'Seg a sex, 8h–19h; sáb, 8h–12h',
  },
  restaurante: {
    feijoada: 'aos sábados', horarios: HORARIO_RESTAURANTE, horario: HORARIO_RESTAURANTE, abreHoje: 'Abre hoje às 11h30',
    reserva: { iso: '2026-10-24', hora: '13:00', pessoas: 2 },
    encomenda: { iso: '2026-10-31', hora: '12:00', item: 'Feijoada completa para 4', pagamento: 'Pix na retirada' },
  },
  incorporadora: {
    visita: { iso: '2026-10-24', hora: '11:30', local: 'Central de vendas' },
    plantas: {
      tres: ['Suíte', 'Quarto 2', 'Quarto 3', '2 banheiros', 'Sala e varanda', 'Cozinha'],
      quatro: ['Suíte', 'Quarto 2', 'Quarto 3', 'Quarto 4', '3 banheiros', 'Lavabo', 'Sala e varanda', 'Cozinha'],
    },
    horario: 'Central de vendas: todos os dias, 9h–18h',
  },
  financas: {
    conversa: { iso: '2026-10-27', hora: '10:00', duracao: '30 min', formato: 'vídeo' },
    guia: { titulo: 'Guia: patrimônio da empresa e da família', iso: '2026-10-12' },
    regua: [{ iso: '2026-10-12', dia: 0 }, { iso: '2026-10-15', dia: 3 }, { iso: HOJE.iso, dia: 9, hora: '09:12' }],
    aviso: 'Investimentos envolvem riscos.', horario: 'Seg a sex, 9h–18h',
  },
  automotivo: {
    testDrive: { iso: '2026-10-24', hora: '10:00', unidade: 'Pinheiros', alternativa: '11:30' }, modelo: 'SUV elétrico',
    versoes: [{ nome: 'S', autonomia: 'consulte a ficha' }, { nome: 'S Autonomia', autonomia: 'consulte a ficha' }],
    consultor: 'Rafael', horario: 'Seg a sáb, 9h–19h; dom, 10h–16h',
  },
});

/* Sector lines shown at the end of ads and sites. null means the flow shows no line at all. The traffic message
   of the dealer (CTB art. 77-B) stays null until its official text is checked. */
export const LEGAL = congela({
  restaurante: null,
  clinica: `Responsável técnica: ${OFERTAS.clinica.responsavel} · CRO-SP 98.412 (registro fictício)`,
  incorporadora: `Imagens ilustrativas. ${CLIENTES.incorporadora.marca} · CRECI-SP 41.207-J · Registro de incorporação R.1 da matrícula 58.317 (dados fictícios)`,
  varejo: null,
  turismo: null,
  educacao: null,
  financas: 'Investimentos envolvem riscos. Conteúdo informativo, não é recomendação.',
  automotivo: null,
});

/* Third parties, all invented: bank, payment provider, publications, creators, commenters (display names only,
   no handles), the customer's company, inbox neighbours and streets. */
export const TERCEIROS = congela({
  banco: { nome: 'Banco Pitanga', sigla: 'BP', cor: '#3b4a5a' },
  psp: { nome: 'Jatobá Pagamentos' },
  revista: { nome: 'Caderno Empresa & Família', dominio: 'empresaefamilia.exemplo' },
  portal: { nome: 'Estrada Afora', dominio: 'estradaafora.exemplo' },
  criadores: { youtube: 'Mesa de Edição', facebook: 'Panela de Domingo', instagram: 'Ju Tavares' },
  comentaristas: ['Bia Moraes', 'Caio Lins', 'Dani Furtado', 'Léo Prates', 'Rita Sampaio'],
  empresaPersona: 'Alves & Rocha Contabilidade',
  caixa: [
    { nome: 'Condomínio Ipê-Roxo', assunto: 'Assembleia de novembro: pauta e procuração' },
    { nome: 'Caderno Empresa & Família', assunto: 'Sucessão sem briga: o que decidir antes' },
    { nome: 'Escola Pé de Moleque', assunto: 'Reunião de pais na quinta' },
  ],
  ruas: {
    restaurante: 'Rua das Aroeiras-Vermelhas, 215 · Vila Madalena',
    clinica: 'Rua dos Ipês-Amarelos, 120 · Pinheiros',
    incorporadora: 'Rua dos Jacarandás-Mimosos, 300 · Vila Nova Conceição',
    varejo: 'Rua das Quaresmeiras-Roxas, 77 · Pinheiros',
    turismo: 'Rua dos Cajueiros-Anões, 52, sala 4 · Moema',
    educacao: 'Rua dos Sabiás-Laranjeiras, 66 · Perdizes',
    financas: 'Rua das Pedras-Sabão, 410, 9º andar · Itaim Bibi',
    automotivo: 'Av. das Seriemas-do-Campo, 1500 · Pinheiros',
    rota: ['Rua dos Manacás-da-Serra', 'Rua das Embaúbas-Prateadas'],
  },
});
