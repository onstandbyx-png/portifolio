import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as M from '../public/assets/showcase/marcas.js';

const {CLIENTES, MARCAS, HOJE, PESSOA, PEDIDOS, OFERTAS, LEGAL, TERCEIROS, diaSemana, dataCurta, dataLonga} = M;
const SRC = readFileSync(new URL('../public/assets/showcase/marcas.js', import.meta.url), 'utf8');
const KEYS = ['restaurante', 'clinica', 'incorporadora', 'varejo', 'turismo', 'educacao', 'financas', 'automotivo'];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/* every string in the data exports, with its path */
const strings = (o, path = '') => o == null ? [] : typeof o === 'string' ? [[path, o]]
  : typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k)) : [];
const DATA = {CLIENTES, HOJE, PESSOA, PEDIDOS, OFERTAS, LEGAL, TERCEIROS};
const TEXTOS = strings(DATA);

/* Easter (anonymous Gregorian algorithm), so Pentecost is computed, not typed */
const pascoa = y => {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, mes - 1, dia, 12));
};
const mais = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

test('the module exports exactly the contract', () => {
  assert.deepEqual(Object.keys(M).sort(), ['CLIENTES', 'HOJE', 'LEGAL', 'MARCAS', 'OFERTAS', 'PEDIDOS', 'PESSOA', 'TERCEIROS', 'dataCurta', 'dataLonga', 'diaSemana']);
});

test('the shared data is frozen', () => {
  for (const [nome, v] of Object.entries(DATA)) assert.ok(Object.isFrozen(v), nome);
  assert.ok(Object.isFrozen(CLIENTES.varejo.tema));
  assert.ok(Object.isFrozen(OFERTAS.turismo.saidas[0]));
  assert.ok(Object.isFrozen(MARCAS));
});

test('CLIENTES keeps the eight brands and their current fields, plus the new kit', () => {
  assert.deepEqual(Object.keys(CLIENTES), KEYS);
  const atuais = {
    restaurante: ['restaurante', 'Casa Amaro', 'casaamaro', 'casaamaro.exemplo', '#a4462a'],
    clinica: ['clínica odontológica', 'Vilela Odontologia', 'vilelaodontologia', 'vilela.exemplo', '#2f6f73'],
    incorporadora: ['incorporadora', 'Atlântica Incorporadora', 'atlanticaincorporadora', 'atlantica.exemplo', '#1f4e5f'],
    varejo: ['loja de tecnologia', 'Ponto Tech', 'pontotech', 'pontotech.exemplo', '#5b3df5'],
    turismo: ['agência de viagens', 'Destino Certo Viagens', 'destinocerto', 'destinocerto.exemplo', '#d9822b'],
    educacao: ['escola de idiomas', 'Speak Up Idiomas', 'speakupidiomas', 'speakup.exemplo', '#e5533d'],
    financas: ['gestora de patrimônio', 'Valore Patrimônio', 'valorepatrimonio', 'valore.exemplo', '#0f1a2c'],
    automotivo: ['concessionária', 'EcoDrive Elétricos', 'ecodrive', 'ecodrive.exemplo', '#0f6b5c'],
  };
  for (const k of KEYS) {
    const c = CLIENTES[k];
    assert.deepEqual([c.tipo, c.marca, c.arroba, c.dominio, c.cor], atuais[k], k);
    assert.ok(c.curta && c.marca.startsWith(c.curta), `${k}.curta`);
    assert.match(c.cor2, /^#[0-9a-f]{6}$/, `${k}.cor2`);
    assert.notEqual(c.cor2, c.cor);
    assert.match(c.tom, /^[A-ZÁÉÍÓÚ].{20,}\.$/, `${k}.tom`);
    assert.match(c.assinatura, /^[A-ZÁÉÍÓÚ].{8,60}\.$/, `${k}.assinatura`);
    assert.match(c.tema.fonte, /^(Newsreader|'Inter Variable')/, `${k}.tema.fonte uses a vendored face`);
    assert.ok(['normal', 'italic'].includes(c.tema.estilo));
    assert.ok(c.tema.fonte.startsWith('Newsreader') === (c.tema.estilo === 'italic'), `${k}: Newsreader is vendored only in italic`);
    assert.ok(Number.isFinite(c.tema.raio) && Number.isFinite(c.tema.peso) && c.tema.acento, `${k}.tema`);
  }
  assert.equal(CLIENTES.incorporadora.curta, 'Atlântica');
  assert.equal(CLIENTES.educacao.curta, 'Speak Up');
  assert.equal(new Set(KEYS.map(k => CLIENTES[k].assinatura)).size, 8);
});

test('MARCAS: eight distinct 64 x 64 marks, at most two colours, none of the old shapes', () => {
  assert.deepEqual(Object.keys(MARCAS), KEYS);
  const antigos = ['font-family="Georgia', 'M36 26c-9 0-14 7-14 16', 'M16 64h22l11-22h35', 'M18 76c8-5 14-5 22 0', 'rx="9" fill="none"',
    'M50 18c-13 0-23 10-23 23', 'M41 41l6 6 12-12', 'M29 28h42a9 9 0 0 1 9 9', 'M27 30h11l12 30 12-30h11', 'M27 70C27 44 46 28 74 26', 'M30 72c10-14 20-23 34-31'];
  const formas = new Set();
  for (const k of KEYS) {
    const s = MARCAS[k];
    assert.match(s, /^<svg viewBox="0 0 64 64">.+<\/svg>$/, k);
    assert.doesNotMatch(s, /<text|<image|href=|id=/, `${k}: no text, images or ids`);
    const cores = new Set([...s.matchAll(/(?:fill|stroke)="(#[0-9a-f]{3,6})"/g)].map(m => m[1]));
    assert.ok(cores.size >= 1 && cores.size <= 2, `${k} uses ${[...cores]}`);
    for (const c of cores) assert.ok(c === '#fff' || c === CLIENTES[k].cor2, `${k}: colour ${c} is not white or cor2`);
    for (const a of antigos) assert.ok(!s.includes(a), `${k} reuses an old shape: ${a}`);
    formas.add(s.match(/ d="([^"]+)"/)[1]);
  }
  assert.equal(formas.size, 8, 'no two marks share the base shape');
});

test('HOJE is a Wednesday morning and the helpers are computed', () => {
  assert.equal(HOJE.iso, '2026-10-21');
  assert.equal(HOJE.hora, '10:09');
  assert.equal(diaSemana(HOJE.iso), 'quarta');
  assert.equal(diaSemana('2026-11-04'), 'quarta');
  assert.equal(diaSemana('2027-05-16'), 'domingo');
  assert.equal(diaSemana('2026-10-24'), 'sábado');
  assert.equal(dataCurta('2026-10-29'), 'qui, 29 out');
  assert.equal(dataCurta('2026-10-24'), 'sáb, 24 out');
  assert.equal(dataLonga('2026-10-29'), 'quinta-feira, 29 de outubro');
  assert.equal(dataLonga('2026-10-24'), 'sábado, 24 de outubro');
  assert.equal(dataLonga('2027-05-16', true), 'domingo, 16 de maio de 2027');
  assert.equal(dataLonga('2026-11-05'), 'quinta-feira, 5 de novembro');
  for (const bad of ['2026-02-30', '29/10/2026', '', undefined]) assert.throws(() => dataCurta(bad), RangeError);
  /* agree with the platform calendar for a whole year */
  for (let d = new Date(Date.UTC(2026, 9, 1, 12)); d < Date.UTC(2027, 9, 1); d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const ref = d.toLocaleDateString('pt-BR', {weekday: 'long', timeZone: 'UTC'}).replace('-feira', '');
    assert.equal(diaSemana(iso), ref, iso);
  }
});

test('order numbers are unique', () => {
  const ids = Object.values(PEDIDOS);
  assert.equal(new Set(ids).size, ids.length);
  for (const [k, v] of Object.entries(PEDIDOS)) {
    assert.match(k, /^[a-z]+\/[a-z]+$/);
    assert.match(v, /^\d{4,5}$/);
  }
  assert.deepEqual(Object.keys(PEDIDOS).sort(), ['instagram/live', 'rcs/conversa', 'tiktok/infeed', 'whatsapp/catalogo']);
});

test('every future offer is on or after today', () => {
  const o = OFERTAS;
  const futuras = {
    ...Object.fromEntries(o.turismo.saidas.flatMap(s => [[`turismo.${s.id}.ida`, s.ida], [`turismo.${s.id}.volta`, s.volta]])),
    'turismo.cavalhadas': o.turismo.cavalhadas[0],
    'varejo.chegada': o.varejo.skus.find(s => s.chegada).chegada,
    'educacao.aulaExperimental': o.educacao.aulaExperimental.iso,
    'educacao.mensalidade.inicio': o.educacao.mensalidade.inicio,
    'educacao.mensalidade.falha.aviso': o.educacao.mensalidade.falha.aviso,
    'clinica.avaliacao': o.clinica.avaliacao.iso, 'clinica.alternativa': o.clinica.alternativa.iso,
    'restaurante.reserva': o.restaurante.reserva.iso, 'restaurante.encomenda': o.restaurante.encomenda.iso,
    'incorporadora.visita': o.incorporadora.visita.iso, 'automotivo.testDrive': o.automotivo.testDrive.iso,
    'financas.conversa': o.financas.conversa.iso,
  };
  for (const [k, v] of Object.entries(futuras)) {
    assert.match(v, ISO, k);
    assert.ok(v >= HOJE.iso, `${k} (${v}) is before ${HOJE.iso}`);
  }
  for (const [k, v] of TEXTOS.filter(([, v]) => ISO.test(v))) assert.doesNotThrow(() => dataCurta(v), k);
  /* the past e-mail sequence ends today: days 0, 3 and 9 */
  const r = o.financas.regua;
  assert.deepEqual(r.map(x => x.iso), [r[0].iso, mais(r[0].iso, 3), mais(r[0].iso, 9)]);
  assert.equal(r.at(-1).iso, HOJE.iso);
  assert.equal(o.financas.guia.iso, r[0].iso);
});

test('the same appointment falls on the weekdays the copy says', () => {
  const o = OFERTAS;
  assert.equal(diaSemana(o.educacao.aulaExperimental.iso), 'quinta');
  assert.equal(diaSemana(o.educacao.mensalidade.inicio), 'quinta');
  assert.equal(diaSemana(o.clinica.avaliacao.iso), 'quinta');
  assert.equal(diaSemana(o.clinica.alternativa.iso), 'sexta');
  assert.equal(diaSemana(o.restaurante.reserva.iso), 'sábado');
  assert.equal(diaSemana(o.restaurante.encomenda.iso), 'sábado', 'feijoada only on Saturdays');
  assert.equal(diaSemana(o.incorporadora.visita.iso), 'sábado');
  assert.equal(diaSemana(o.automotivo.testDrive.iso), 'sábado');
  assert.equal(diaSemana(o.financas.conversa.iso), 'terça');
  assert.equal(o.varejo.skus.find(s => s.chegada).estado, `chega em ${o.varejo.skus.find(s => s.chegada).chegada.slice(8)}/${o.varejo.skus.find(s => s.chegada).chegada.slice(5, 7)}`);
});

test('Festa do Divino: cavalhadas on Pentecost 2027 (Sunday to Tuesday) and both departures cover them', () => {
  const pentecostes = new Date(pascoa(2027).getTime() + 49 * 864e5).toISOString().slice(0, 10);
  assert.equal(pentecostes, '2027-05-16');
  const t = OFERTAS.turismo;
  assert.deepEqual(t.cavalhadas, [pentecostes, mais(pentecostes, 1), mais(pentecostes, 2)]);
  assert.deepEqual(t.cavalhadas.map(diaSemana), ['domingo', 'segunda', 'terça']);
  assert.match(t.destaque, /maio de 2027/);
  assert.equal(t.saidas.length, 2);
  for (const s of t.saidas) {
    assert.ok(s.ida <= t.cavalhadas[0] && s.volta >= t.cavalhadas.at(-1), s.id);
    assert.equal(s.noites, Math.round((new Date(s.volta) - new Date(s.ida)) / 864e5));
  }
  assert.equal(new Set(t.saidas.map(s => s.id)).size, 2);
  assert.doesNotMatch(JSON.stringify(t), /junho|-06-/);
  assert.match(t.criancas, /1 ano e 11 meses/);
  assert.match(t.criancas, /a partir de 2 anos, assento/);
  assert.match(t.politica, /Pix/);
});

test('Pix Automático: 2nd charge on 5/12, warned on Friday 4/12 with cancel until 23h59 of that day', () => {
  const m = OFERTAS.educacao.mensalidade;
  assert.equal(m.periodicidade, 'mensal');
  assert.deepEqual(m.cobrancas, ['2026-11-05', '2026-12-05', '2027-01-05']);
  assert.equal(m.cobrancas[0], m.inicio);
  assert.equal(m.falha.iso, '2026-12-05');
  assert.equal(diaSemana(m.falha.iso), 'sábado');
  assert.equal(m.falha.aviso, mais(m.falha.iso, -1));
  assert.equal(dataLonga(m.falha.aviso), 'sexta-feira, 4 de dezembro');
  assert.equal(m.falha.cancelar, 'Cancelar este pagamento (até 23h59 de hoje)');
  assert.equal(m.retomada, '2027-01-05');
});

test('the person is the same everywhere and never fully exposed', () => {
  assert.equal(PESSOA.nome, 'Marina Alves');
  assert.ok(PESSOA.nome.startsWith(PESSOA.primeiro));
  assert.match(PESSOA.telefone, /•/);
  assert.doesNotMatch(PESSOA.telefone, /\d{4}-\d{4}/);
  assert.match(PESSOA.email, /^[a-z.]+@[a-z]+\.exemplo$/);
  assert.match(PESSOA.cpf, /•/);
  assert.equal(PESSOA.viajantes.adultos + PESSOA.viajantes.criancas.length, 4);
  for (const idade of PESSOA.viajantes.criancas) assert.match(PESSOA.viagem, new RegExp(`\\b${idade}\\b`));
});

test('legal lines: one per brand, null where the sector has none or the text is unchecked', () => {
  assert.deepEqual(Object.keys(LEGAL), KEYS);
  for (const [k, v] of Object.entries(LEGAL)) assert.ok(v === null || (typeof v === 'string' && v.endsWith(')') || v.endsWith('.')), k);
  assert.equal(LEGAL.automotivo, null);
  assert.ok(LEGAL.clinica.includes(OFERTAS.clinica.responsavel) && LEGAL.clinica.includes('CRO-SP'));
  assert.ok(LEGAL.incorporadora.startsWith('Imagens ilustrativas.') && LEGAL.incorporadora.includes(CLIENTES.incorporadora.marca) && LEGAL.incorporadora.includes('CRECI'));
  assert.ok(LEGAL.financas.startsWith(OFERTAS.financas.aviso));
  for (const v of Object.values(LEGAL)) if (v) assert.match(v, /fictíci|Conteúdo informativo/, 'invented registry numbers say so');
});

test('third parties are invented, with no handles and no real domains', () => {
  assert.equal(TERCEIROS.banco.nome, 'Banco Pitanga');
  assert.match(TERCEIROS.banco.sigla, /^[A-Z]{2}$/);
  assert.match(TERCEIROS.banco.cor, /^#[0-9a-f]{6}$/);
  assert.ok(TERCEIROS.psp.nome);
  for (const [k, v] of TEXTOS) {
    assert.ok(!v.includes('@') || k === 'PESSOA.email', `${k} has a handle: ${v}`);
    if (/dominio$/.test(k)) assert.match(v, /^[a-z0-9-]+\.exemplo$/, k);
  }
  for (const k of KEYS) assert.match(TERCEIROS.ruas[k], /^(Rua|Av\.) .+, \d+.* · [A-ZÁÉÍÓÚ]/, k);
  assert.ok(TERCEIROS.ruas.rota.length >= 2);
  for (const v of [...TERCEIROS.comentaristas, ...Object.values(TERCEIROS.criadores)]) assert.match(v, /^[A-ZÁÉÍÓÚ][^@]+$/);
});

test('no placeholder, internal or Fatos text anywhere', () => {
  for (const [k, v] of TEXTOS) {
    for (const ruim of ['Exemplo', 'exemplo ', 'aparecem aqui', '[RT', ' aqui (', '0000-0000', 'Lorem', 'TODO', 'XXX']) assert.ok(!v.includes(ruim), `${k}: "${ruim}" in "${v}"`);
    assert.doesNotMatch(v, /\baqui\b/i, k);
    assert.doesNotMatch(v, /\b0{3,}\b/, `${k}: zero-filled number`);
  }
  assert.doesNotMatch(SRC, /fatos/i);
  assert.doesNotMatch(SRC, /\bExemplo\b/);
});
