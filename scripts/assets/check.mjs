/**
 * Checks the licensed collection listed in scripts/assets/acervo.json: every photo exists with
 * the listed size and weight, every video lasts 3 to 6 s, has no audio track, weighs at most
 * 1 MB and has its poster, and every file has a line in canais/SOURCES.md.
 * Run: node scripts/assets/check.mjs   (videos need ffprobe on the PATH)
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const base = resolve(root, 'public/assets/portfolio');
const acervo = JSON.parse(readFileSync(resolve(root, 'scripts/assets/acervo.json'), 'utf8'));
const sources = readFileSync(resolve(base, 'canais/SOURCES.md'), 'utf8');
const fails = [];
const fail = (file, why) => fails.push(`${file}: ${why}`);

/* Width and height from the RIFF header (VP8, VP8L and VP8X). */
function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (kind === 'VP8L') {
    const b = buf.subarray(21, 25);
    return [1 + (((b[1] & 0x3f) << 8) | b[0]), 1 + (((b[3] & 0xf) << 10) | (b[2] << 2) | ((b[1] & 0xc0) >> 6))];
  }
  if (kind === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  return null;
}

for (const foto of acervo.fotos) {
  const full = resolve(base, foto.arquivo);
  if (!existsSync(full)) { fail(foto.arquivo, 'não existe'); continue; }
  const size = webpSize(readFileSync(full));
  const [w, h] = foto.tamanho;
  if (!size || size[0] !== w || size[1] !== h) fail(foto.arquivo, `medida ${size?.join('x')} em vez de ${w}x${h}`);
  const kb = statSync(full).size / 1024;
  if (kb > foto.maxKB) fail(foto.arquivo, `${kb.toFixed(0)} KB, limite ${foto.maxKB} KB`);
  if (!sources.includes('`' + basename(foto.arquivo) + '`')) fail(foto.arquivo, 'sem linha em SOURCES.md');
}

const ffprobe = spawnSync('ffprobe', ['-version']).status === 0;
for (const video of acervo.videos ?? []) {
  for (const ext of ['webm', 'mp4', 'webp']) {
    const file = `${video.arquivo}.${ext}`, full = resolve(base, file);
    if (!existsSync(full)) { fail(file, 'não existe'); continue; }
    if (ext === 'webp') continue;
    if (statSync(full).size > 1024 * 1024) fail(file, 'mais de 1 MB');
    if (!ffprobe) continue;
    const probe = JSON.parse(spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', full], { encoding: 'utf8' }).stdout || '{}');
    const duration = Number(probe.format?.duration);
    if (!(duration >= 3 && duration <= 6.05)) fail(file, `duração ${duration} s`);
    if (probe.streams?.some(s => s.codec_type === 'audio')) fail(file, 'tem trilha de áudio');
  }
  if (!sources.includes('`' + basename(video.arquivo))) fail(video.arquivo, 'sem linha em SOURCES.md');
}
if (!ffprobe && acervo.videos?.length) console.log('Aviso: ffprobe ausente, duração e áudio dos vídeos não conferidos.');

const total = acervo.fotos.length + (acervo.videos?.length ?? 0);
if (fails.length) { console.error(fails.join('\n')); console.error(`${fails.length} problema(s) em ${total} item(ns).`); process.exit(1); }
console.log(`Acervo conferido: ${acervo.fotos.length} foto(s) e ${acervo.videos?.length ?? 0} vídeo(s).`);
