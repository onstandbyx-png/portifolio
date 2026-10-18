import { TEX, type CardArt } from "./art";

type Ctx = CanvasRenderingContext2D;
type Picture = HTMLImageElement | null;
const SANS = '"Inter Variable", Inter, Arial, sans-serif';
const SERIF = 'Newsreader, Georgia, serif';
const INK = "#202923", MUTED = "#58665a", PAPER = "#fcfbf6";
const files = new Map<string, Promise<Picture>>();

function picture(src: string): Promise<Picture> {
  if (files.has(src)) return files.get(src)!;
  const promise = new Promise<Picture>(resolve => {
    const image = new Image(); image.decoding = "async";
    let done = false;
    const finish = (value: Picture) => { if (done) return; done = true; clearTimeout(timer); resolve(value); };
    const timer = setTimeout(() => finish(null), 5000);
    image.onload = () => finish(image); image.onerror = () => finish(null); image.src = src;
  });
  files.set(src, promise); return promise;
}

// Explicitly request the faces before drawing both the live textures and posters.
// fonts.ready alone does not request a face that has not appeared in the DOM yet.
async function fontsReady() {
  if (!document.fonts) return;
  const loaded = await Promise.all([
    document.fonts.load(`500 64px ${SANS}`),
    document.fonts.load(`650 64px ${SANS}`),
    document.fonts.load(`italic 450 96px ${SERIF}`),
  ]);
  if (loaded.some(faces => faces.length === 0)) throw new Error("As fontes da arte do crachá não foram carregadas.");
  await document.fonts.ready;
}
function surface(color = PAPER): [HTMLCanvasElement, Ctx] {
  const canvas = document.createElement("canvas"); canvas.width = TEX.w; canvas.height = TEX.h;
  const ctx = canvas.getContext("2d")!; ctx.fillStyle = color; ctx.fillRect(0, 0, TEX.w, TEX.h); return [canvas, ctx];
}
function text(ctx: Ctx, value: string, x: number, y: number, size: number, color = INK, weight = 500, family = SANS) {
  ctx.fillStyle = color; ctx.textBaseline = "alphabetic"; ctx.font = `${family === SERIF ? "italic " : ""}${weight} ${size}px ${family}`; ctx.fillText(value, x, y);
}
function rule(ctx: Ctx, y: number, color = "#d8ded3") {
  ctx.beginPath(); ctx.moveTo(72, y); ctx.lineTo(952, y); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
}
function cover(ctx: Ctx, image: Picture, x: number, y: number, w: number, h: number, color: string, positionY = .5) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.clip(); ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  if (image?.naturalWidth) {
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight), sw = w / scale, sh = h / scale;
    ctx.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) * positionY, sw, sh, x, y, w, h);
  }
  ctx.restore();
}
function arrow(ctx: Ctx, x: number, y: number, color: string) {
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(x - 14, y + 14); ctx.lineTo(x + 14, y - 14);
  ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 14, y - 14); ctx.lineTo(x + 14, y + 12); ctx.stroke();
}
function footer(ctx: Ctx, label: string, dark = false) {
  const color = dark ? "#fafaf4" : INK;
  rule(ctx, 1194, dark ? "#ffffff36" : "#d8ded3"); text(ctx, label, 74, 1264, 47, color, 550); arrow(ctx, 912, 1248, color);
}
function brand(ctx: Ctx, kind: "fatos" | "smiile", avatar: Picture = null, dark = false) {
  const color = dark ? "#fafaf4" : INK;
  if (kind === "fatos") {
    cover(ctx, avatar, 74, 100, 112, 112, "#e8ece8");
    text(ctx, "Fatos", 210, 151, 65, color, 650); text(ctx, "Desconhecidos", 212, 204, 40, dark ? "#c2cfc3" : MUTED);
  } else {
    text(ctx, "smiile", 74, 175, 94, color, 650); text(ctx, "PROJETO PRÓPRIO", 76, 226, 34, dark ? "#bdcfc0" : MUTED, 550);
  }
  text(ctx, kind === "fatos" ? "01" : "02", 856, 164, 52, dark ? "#bdcfc0" : MUTED);
}
function steps(ctx: Ctx, rows: Array<[string, string]>, dark = false) {
  const fg = dark ? "#f7f7ef" : INK, quiet = dark ? "#bacdbb" : MUTED;
  rows.forEach(([title, note], i) => {
    const y = 638 + i * 170;
    rule(ctx, y - 62, dark ? "#ffffff26" : "#d8ded3"); text(ctx, `0${i + 1}`, 74, y, 38, quiet);
    text(ctx, title, 174, y, 57, fg, 550); text(ctx, note, 175, y + 58, 40, quiet);
  });
}

/** Original Fatos identity and compositions recovered from the user's media kit. */
export async function editorialCard(_copy: { name: string; label: string; line: string }): Promise<CardArt> {
  await fontsReady();
  const [avatar, photo] = await Promise.all([
    picture("/assets/portfolio/recovered-fatos/avatar_desconhecidos.webp"),
    picture("/assets/portfolio/recovered-fatos/cena-desconhecidos.webp"),
  ]);
  const [front, ctx] = surface(); brand(ctx, "fatos", avatar);
  cover(ctx, photo, 64, 260, 896, 606, "#1552ae", .94);
  text(ctx, "Pesquisa, conteúdo", 74, 982, 84, INK, 450, SERIF);
  text(ctx, "e direção criativa.", 74, 1074, 84, INK, 450, SERIF);
  text(ctx, "EXPERIÊNCIA PROFISSIONAL", 77, 1142, 35, MUTED, 550); footer(ctx, "Conhecer minha atuação");
  const [back, b] = surface("#edf0e7"); brand(b, "fatos", avatar);
  text(b, "O recorte dá forma", 74, 373, 85, INK, 450, SERIF); text(b, "à história.", 74, 470, 98, INK, 450, SERIF);
  steps(b, [["Pesquisa e pauta", "Encontrar a pergunta."], ["Texto e roteiro", "Organizar a narrativa."], ["Direção criativa", "Dar forma à mensagem."]]);
  footer(b, "Ver atuação editorial"); return { front, back };
}

/** Capture of the actual interactive app, shared by live scene and poster. */
export async function digitalCard(_copy: { name: string; label: string; line: string }): Promise<CardArt> {
  await fontsReady(); const screenshot = await picture("/assets/badges/smiile-interface.webp");
  const [front, ctx] = surface("#22382e"); brand(ctx, "smiile", null, true);
  ctx.save(); ctx.beginPath(); ctx.roundRect(64, 270, 896, 596, 24); ctx.clip();
  const bg = ctx.createLinearGradient(64, 270, 960, 866); bg.addColorStop(0, "#dce7d6"); bg.addColorStop(1, "#a8bca7");
  ctx.fillStyle = bg; ctx.fillRect(64, 270, 896, 596);
  if (screenshot?.naturalWidth) {
    // Preserve screen geometry. The print window crops its continuation instead of squeezing the UI.
    const width = 760, height = screenshot.naturalHeight * width / screenshot.naturalWidth;
    ctx.drawImage(screenshot, (TEX.w - width) / 2, -560, width, height);
  } else {
    text(ctx, "Interface interativa", 148, 542, 65, INK, 450, SERIF); text(ctx, "Explore o projeto abaixo", 150, 610, 44, MUTED);
  }
  ctx.restore();
  text(ctx, "Interfaces, produtos", 74, 982, 81, "#fafaf3", 450, SERIF); text(ctx, "e novas possibilidades.", 74, 1074, 76, "#fafaf3", 450, SERIF);
  text(ctx, "DIREÇÃO VISUAL + DESENVOLVIMENTO", 76, 1142, 32, "#bdcfc0", 550); footer(ctx, "Explorar o projeto", true);
  const [back, b] = surface("#22382e"); brand(b, "smiile", null, true);
  text(b, "Do visual ao que", 74, 373, 85, "#fafaf3", 450, SERIF); text(b, "acontece depois.", 74, 470, 85, "#fafaf3", 450, SERIF);
  steps(b, [["Site navegável", "Da página ao próximo passo."], ["Aplicativo de trilhas", "Busca, detalhe e mapa."], ["Voz e proposta", "Conversa com contexto."]], true);
  footer(b, "Explorar as experiências", true); return { front, back };
}
