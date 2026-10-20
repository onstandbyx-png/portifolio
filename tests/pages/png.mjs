/* Minimal PNG stacker for tests/pages/harness.mjs screenshots.
 * With the suite's SwiftShader flags Chromium cannot capture more than 8192 px
 * in one texture: a taller full-page capture repeats the top of the page below
 * 8192 px. The harness captures slices instead and this stacks them into one
 * image. Supports what Chromium writes: 8-bit RGB/RGBA, non-interlaced. */
import {deflateSync, inflateSync} from 'node:zlib';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CRC_TABLE = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buffer => {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function readChunks(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG');
  const chunks = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    chunks.push({type: buffer.toString('ascii', offset + 4, offset + 8), data: buffer.subarray(offset + 8, offset + 8 + length)});
    offset += 12 + length;
  }
  return chunks;
}

export function decodePng(buffer) {
  const chunks = readChunks(buffer);
  const header = chunks.find(chunk => chunk.type === 'IHDR').data;
  const width = header.readUInt32BE(0), height = header.readUInt32BE(4), depth = header[8], color = header[9], interlace = header[12];
  if (depth !== 8 || interlace !== 0 || (color !== 2 && color !== 6)) throw new Error(`unsupported PNG (depth ${depth}, colour ${color}, interlace ${interlace})`);
  const bpp = color === 6 ? 4 : 3, stride = width * bpp;
  const raw = inflateSync(Buffer.concat(chunks.filter(chunk => chunk.type === 'IDAT').map(chunk => chunk.data)));
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    const previous = y ? pixels.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0, b = previous ? previous[x] : 0, c = previous && x >= bpp ? previous[x - bpp] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[x] = value & 255;
    }
  }
  return {width, height, color, bpp, pixels};
}

const chunk = (type, data) => {
  const head = Buffer.alloc(8), tail = Buffer.alloc(4);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
};

export function encodePng({width, height, color, bpp, pixels}) {
  const stride = width * bpp, raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = color;
  return Buffer.concat([SIGNATURE, chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

/** Stacks same-width PNG slices top to bottom into one PNG buffer. */
export function stackPngs(buffers) {
  const images = buffers.map(decodePng);
  const [first] = images;
  if (images.some(image => image.width !== first.width || image.color !== first.color)) throw new Error('slices differ in width or colour type');
  return encodePng({...first, height: images.reduce((sum, image) => sum + image.height, 0), pixels: Buffer.concat(images.map(image => image.pixels))});
}
