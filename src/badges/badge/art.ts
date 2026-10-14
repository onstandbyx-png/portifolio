/*
 * Print artwork for the badge cards, drawn at runtime on canvases so the
 * textures stay sharp at any pixel ratio and no image files are shipped.
 * All artwork is original to smiile: the Maestro mascot, the Lume card and
 * its stickers, the brand mark and the type.
 */

export const TEX = { w: 1024, h: 1330 };
const SANS = '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif';
const MONO = 'ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

/** The smiile mark (the brand face), in a 950 × 760 box starting at (180, 296). */
const MARK = [
  "M626.5 1038.6C683.6 1033.4 723.8 1025.4 773.5 1009.3C868.7 978.4 958.3 923.2 1031.8 850.1C1072 810.2 1102.2 767.1 1110 738.6C1112.9 728.3 1112.5 714 1109.3 706.8C1106.1 699.8 1099 692.7 1091.7 689.4C1086.1 686.8 1084.5 686.5 1075 686.5C1057.3 686.6 1053.4 688.8 1017 719.5C1005.2 729.4 991 741.2 985.5 745.6C915.5 801.5 842.3 841.6 763.5 867.3C717.4 882.4 678.2 890.4 622 896.2C602.1 898.3 527.1 897.9 505 895.7C466.4 891.8 443.9 888.3 415 881.9C370.5 872 336.9 861.5 295.3 844.4C277 836.9 269.4 835 258.4 835C239.4 835 225.3 843 217.3 858.2C214.8 863 214.5 864.4 214.5 874C214.5 885.7 215.7 890.2 221.8 900.5C227.4 910 233.7 917.7 244.5 928.5C282.1 966.1 341.4 999.5 403 1017.9C443.2 1029.8 476 1035.7 521 1039C529 1039.6 537.5 1040.2 540 1040.4C550.6 1041.3 610.8 1040 626.5 1038.6Z",
  "M323.7 711C379.6 703.6 422.3 646.6 435.5 562C442.8 515.8 439.5 461.8 426.9 421.3C411.5 371.4 388.4 337.5 359 321.2C345.6 313.7 327 310.1 312.7 312C277.1 316.9 245.8 344.4 222.6 391.1C207.6 421.2 198.5 455.2 194.9 494.3C193.4 510.4 194.2 544.1 196.5 561C206.4 636 241.1 691.4 287.9 707C301.7 711.6 310.9 712.7 323.7 711Z",
  "M684.3 589.9C687.7 588.8 698.8 583.1 708.9 577.3C777 538.2 844 518 905.5 518C937 518 957 520.9 991 530.5C1012.6 536.6 1015.2 537.1 1024.6 537.1C1034.7 537.1 1040.6 535.7 1049.1 531.3C1073.2 518.9 1082.9 488.3 1070.6 463C1061.3 443.8 1031.2 425.3 994.2 416.1C953.4 405.9 913.4 405.9 862.3 416.1C808.7 426.7 755.4 452 709.5 488.3C694.7 500.1 665.8 529.6 658.2 540.8C646.2 558.3 644.1 571.8 651.5 583.1C657 591.5 671 594.4 684.3 589.9Z",
];

/** Maestro, the smiile mascot, as a standalone SVG document. */
function maestroSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 160 160">
<defs>
<linearGradient id="b" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.62" stop-color="#f3f0fa"/><stop offset="1" stop-color="#dcd5ef"/></linearGradient>
<radialGradient id="s" cx="0.32" cy="0.22" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f7bf0"/><stop offset="1" stop-color="#5b47c9"/></linearGradient>
</defs>
<ellipse cx="80" cy="146" rx="44" ry="7" fill="#1b1530" opacity="0.13"/>
<g transform="rotate(-22 122 92)"><line x1="122" y1="92" x2="150" y2="38" stroke="#1d1826" stroke-width="3.4" stroke-linecap="round"/><circle cx="150.5" cy="37" r="3.6" fill="#fff" stroke="#1d1826" stroke-width="1.6"/></g>
<path d="M80 22c30 0 50 22 52 54 2 32-14 62-52 62S26 108 28 76c2-32 22-54 52-54Z" fill="url(#b)" stroke="#1d1826" stroke-opacity="0.1"/>
<path d="M80 26c-24 0-42 16-46 42 10-20 26-30 46-30 9 0 16 2 23 5-6-11-14-17-23-17Z" fill="url(#s)"/>
<circle cx="121" cy="93" r="7.5" fill="#fff" stroke="#1d1826" stroke-opacity="0.14"/>
<svg x="49" y="54" width="62" height="50" viewBox="180 296 950 760"><g fill="#231d2e">${MARK.map((d) => `<path d="${d}"/>`).join("")}</g></svg>
<g transform="translate(80 121)"><path d="M-15-7 -2-1v2l-13 6c-2 1-3 0-3-2v-10c0-2 1-3 3-3Z" fill="url(#t)"/><path d="M15-7 2-1v2l13 6c2 1 3 0 3-2v-10c0-2-1-3-3-3Z" fill="url(#t)"/><rect x="-4" y="-4.5" width="8" height="9" rx="3" fill="#4a37b5"/></g>
</svg>`;
}

function loadSvg(svg: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

function canvas(w = TEX.w, h = TEX.h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** Draws the brand mark centred at (x, y) with the given width. */
function mark(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string) {
  const s = width / 950;
  ctx.save();
  ctx.translate(x - (950 * s) / 2, y - (760 * s) / 2);
  ctx.scale(s, s);
  ctx.translate(-180, -296);
  ctx.fillStyle = color;
  for (const d of MARK) ctx.fill(new Path2D(d));
  ctx.restore();
}

/** `#rrggbb` with zero alpha, so gradients fade without passing through grey. */
function transparent(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
}

function grid(ctx: CanvasRenderingContext2D, height: number, color: string, background: string) {
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, TEX.w, height);
  const cell = 91;
  ctx.save();
  ctx.strokeStyle = color;
  // Thick enough to survive the texture being shown at a third of its size.
  ctx.lineWidth = 4;
  ctx.setLineDash([9, 9]);
  for (let x = cell / 2 + 4; x < TEX.w; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = cell / 2; y < height; y += cell) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TEX.w, y);
    ctx.stroke();
  }
  ctx.restore();
  // The grid dissolves into the plain lower half (fading the same colour, not black).
  const fade = ctx.createLinearGradient(0, height * 0.55, 0, height);
  fade.addColorStop(0, transparent(background));
  fade.addColorStop(1, background);
  ctx.fillStyle = fade;
  ctx.fillRect(0, height * 0.55, TEX.w, height * 0.45);
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  font: string,
  color: string,
  spacing = 0,
) {
  ctx.font = font;
  ctx.fillStyle = color;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
  ctx.fillText(value, x, y);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
}

function wrap(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, max: number, line: number, font: string, color: string) {
  ctx.font = font;
  const words = value.split(" ");
  let row = "";
  for (const word of words) {
    const next = row ? `${row} ${word}` : word;
    if (ctx.measureText(next).width > max && row) {
      text(ctx, row, x, y, font, color);
      row = word;
      y += line;
    } else row = next;
  }
  if (row) text(ctx, row, x, y, font, color);
}

export type CardArt = { front: HTMLCanvasElement; back: HTMLCanvasElement };

async function fontsReady() {
  if (typeof document === "undefined" || !document.fonts) return;
  const wait = Promise.all([
    document.fonts.load(`600 84px ${SANS}`),
    document.fonts.load(`400 52px ${SANS}`),
  ]);
  await Promise.race([wait, new Promise((resolve) => setTimeout(resolve, 1500))]);
}

/** The white card: Maestro, the research agent. */
export async function maestroCard(copy: { name: string; label: string; line: string }): Promise<CardArt> {
  await fontsReady();
  const [front, ctx] = canvas();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, TEX.w, TEX.h);
  grid(ctx, 640, "rgba(120,132,158,0.3)", "#f6f7f9");
  // Avatar: the mascot in a round white medallion.
  const cx = TEX.w / 2,
    cy = 346,
    r = 164;
  ctx.save();
  ctx.shadowColor = "rgba(30,40,80,0.14)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // A violet disc inside the white medallion, so the mascot reads at any size.
  const disc = ctx.createRadialGradient(cx - 40, cy - 60, 20, cx, cy, r - 18);
  disc.addColorStop(0, "#a996ff");
  disc.addColorStop(1, "#5b47c9");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 22, 0, Math.PI * 2);
  ctx.fill();
  const mascot = await loadSvg(maestroSvg());
  ctx.drawImage(mascot, cx - 130, cy - 138, 260, 260);
  text(ctx, copy.name, 70, 806, `600 86px ${SANS}`, "#16171b", -1.5);
  text(ctx, copy.label, 72, 902, `500 44px ${MONO}`, "#7a7f8a", 5);
  wrap(ctx, copy.line, 72, 1010, TEX.w - 150, 68, `400 51px ${SANS}`, "#5b606a");

  const [back, b] = canvas();
  b.fillStyle = "#f3f4f7";
  b.fillRect(0, 0, TEX.w, TEX.h);
  mark(b, TEX.w / 2, 560, 300, "#1f1a2b");
  text(b, "smiile", TEX.w / 2 - 128, 790, `600 92px ${SANS}`, "#1f1a2b", -2);
  text(b, "EQUIPE DE AGENTES", TEX.w / 2 - 232, 1160, `500 40px ${MONO}`, "#9a9ea8", 5);
  return { front, back };
}

/** Stickers on the dark card, all original. */
function stickers(ctx: CanvasRenderingContext2D) {
  const sticker = (x: number, y: number, angle: number, draw: () => void) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    draw();
    ctx.restore();
  };
  const outline = (path: () => void, fill: string) => {
    ctx.fillStyle = "#ffffff";
    path();
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.save();
    ctx.scale(0.88, 0.88);
    ctx.fillStyle = fill;
    path();
    ctx.fill();
    ctx.restore();
  };
  // A sunny smiile face.
  sticker(150, 1140, -0.12, () => {
    outline(() => {
      ctx.beginPath();
      ctx.arc(0, 0, 82, 0, Math.PI * 2);
    }, "#ffd23f");
    mark(ctx, 0, 6, 96, "#1d1826");
  });
  // A pink spark.
  sticker(300, 1170, 0.2, () => {
    outline(() => {
      ctx.beginPath();
      ctx.roundRect(-70, -70, 140, 140, 30);
    }, "#ff8fb1");
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 ? 14 : 44;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  });
  // A mint chart.
  sticker(456, 1136, -0.08, () => {
    outline(() => {
      ctx.beginPath();
      ctx.roundRect(-78, -64, 156, 128, 26);
    }, "#7ff2d8");
    ctx.fillStyle = "#123a33";
    [28, 52, 40, 70].forEach((h, i) => ctx.fillRect(-46 + i * 26, 34 - h, 16, h));
  });
  // An oval seal.
  sticker(680, 1176, -0.14, () => {
    outline(() => {
      ctx.beginPath();
      ctx.ellipse(0, 0, 150, 70, 0, 0, Math.PI * 2);
    }, "#ffffff");
    ctx.strokeStyle = "#16151a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 122, 52, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowColor = "transparent";
    text(ctx, "FEITO COM", -78, -6, `700 28px ${MONO}`, "#16151a", 3);
    text(ctx, "SMIILE", -66, 32, `800 40px ${SANS}`, "#16151a", 4);
  });
  // A routine clock.
  sticker(884, 1150, 0.1, () => {
    outline(() => {
      ctx.beginPath();
      ctx.arc(0, 0, 66, 0, Math.PI * 2);
    }, "#b9a6ff");
    ctx.shadowColor = "transparent";
    text(ctx, "9h", -34, 18, `700 54px ${SANS}`, "#1b1440", -1);
  });
}

/** The dark card: Lume, the data agent. */
export async function lumeCard(copy: { name: string; label: string; line: string }): Promise<CardArt> {
  await fontsReady();
  const [front, ctx] = canvas();
  const bg = ctx.createLinearGradient(0, 0, 0, TEX.h);
  bg.addColorStop(0, "#211f26");
  bg.addColorStop(1, "#131217");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TEX.w, TEX.h);
  grid(ctx, 560, "rgba(255,255,255,0.075)", "#1f1d24");
  text(ctx, copy.name, 70, 690, `600 86px ${SANS}`, "#f6f5fa", -1.5);
  text(ctx, copy.label, 72, 784, `500 44px ${MONO}`, "#8d8a99", 5);
  wrap(ctx, copy.line, 72, 884, TEX.w - 150, 66, `400 50px ${SANS}`, "#a9a6b6");
  stickers(ctx);

  const [back, b] = canvas();
  b.fillStyle = "#17161b";
  b.fillRect(0, 0, TEX.w, TEX.h);
  mark(b, TEX.w / 2, 600, 280, "#f2f0f8");
  return { front, back };
}

/** Woven polyester for the straps (tiles along the strap). */
export function weave() {
  const [c, ctx] = canvas(128, 256);
  ctx.fillStyle = "#6c6c6f";
  ctx.fillRect(0, 0, 128, 256);
  for (let y = -128; y < 256; y += 6) {
    ctx.strokeStyle = y % 12 === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + 128);
    ctx.stroke();
  }
  // Slightly lighter selvedges.
  const edge = ctx.createLinearGradient(0, 0, 128, 0);
  edge.addColorStop(0, "rgba(255,255,255,0.08)");
  edge.addColorStop(0.08, "rgba(255,255,255,0)");
  edge.addColorStop(0.92, "rgba(255,255,255,0)");
  edge.addColorStop(1, "rgba(255,255,255,0.08)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, 128, 256);
  return c;
}

/** Fine vertical brushing for the crimp. */
export function brushed() {
  const [c, ctx] = canvas(256, 256);
  ctx.fillStyle = "#c7c9cd";
  ctx.fillRect(0, 0, 256, 256);
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    const x = random() * 256;
    const shade = 150 + random() * 90;
    ctx.strokeStyle = `rgba(${shade},${shade},${shade + 4},${0.08 + random() * 0.12})`;
    ctx.lineWidth = 0.6 + random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (random() - 0.5) * 2, 256);
    ctx.stroke();
  }
  return c;
}
