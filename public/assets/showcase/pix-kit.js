/* Pix in the BR Code format of the Banco Central (EMV QRCPS-MPM; Manual de Padrões para Iniciação do Pix,
   sections 2.5 and 2.8): the same text is the QR code and the "Pix copia e cola". Each field is ID + length in
   2 digits + value; the last one (63) is the CRC16-CCITT (polynomial 0x1021, start 0xFFFF) over everything,
   "6304" included. Ported from enem src/lib/pix.ts. The codes here are real in form but never payable: the
   payment and recurrence links point to the fictitious PSP on a .exemplo domain, which no bank resolves.
   The QR is drawn with uqr (MIT, vendored in uqr.js). */
import { encode } from './uqr.js';

const campo = (id, valor) => `${id}${String(valor.length).padStart(2, '0')}${valor}`;

export const semAcento = texto => String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

export function crc16(texto) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/* Dynamic Pix (url: the payment link of the PSP, without https://) or, with rec, the composite QR of
   Pix Automático journey 3: pay the first one now and authorize the next ones (field 80). */
export function brCode({ url, rec = '', nome, cidade = 'SAO PAULO' }) {
  const corpo = campo('00', '01') + campo('01', '12') +
    campo('26', campo('00', 'br.gov.bcb.pix') + campo('25', url)) +
    campo('52', '0000') + campo('53', '986') + campo('58', 'BR') +
    campo('59', semAcento(nome).slice(0, 25)) + campo('60', semAcento(cidade).slice(0, 15)) +
    campo('62', campo('05', '***')) +
    (rec ? campo('80', campo('00', 'br.gov.bcb.pix') + campo('25', rec)) : '') + '6304';
  return corpo + crc16(corpo);
}

/* First-level fields of a BR Code (tests and checks). */
export function lerCampos(payload) {
  const out = {};
  for (let i = 0; i < payload.length;) {
    const id = payload.slice(i, i + 2), n = Number(payload.slice(i + 2, i + 4));
    out[id] = payload.slice(i + 4, i + 4 + n);
    i += 4 + n;
  }
  return out;
}

/* The QR as an SVG path: one unit per module, a quiet zone of 2. */
export function qrSvg(texto, cls = 'au-qr') {
  const { data, size } = encode(texto, { ecc: 'M', border: 0 });
  let d = '';
  data.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x} ${y}h1v1h-1z`; }));
  return `<svg class="${cls}" viewBox="-2 -2 ${size + 4} ${size + 4}" aria-hidden="true" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${size + 4}" height="${size + 4}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
}
