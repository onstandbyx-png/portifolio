import type { BadgeScene as BadgeSceneHandle } from "./badge/BadgeScene";

const stage = document.querySelector<HTMLElement>("[data-portfolio-badges]");
const canvas = stage?.querySelector<HTMLCanvasElement>("[data-badge-canvas]");
const swingButton = document.querySelector<HTMLButtonElement>("[data-badge-swing]");
const flipButton = document.querySelector<HTMLButtonElement>("[data-badge-flip]");
const hint = document.querySelector<HTMLElement>("[data-badge-hint]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const motionToggle = document.querySelector<HTMLElement>(".motion-toggle");
let instance: BadgeSceneHandle | null = null;
let near = false, inView = false, visible = !document.hidden, loading = false;
let failed = false, ready = false;
const cardFaces: [boolean, boolean] = [false, false];
const cardNames = ["Fatos", "smiile"] as const;
const cardRoles = ["Direção criativa e narrativa: pesquisa, roteiro, arte e conteúdo para grandes audiências.", "Projeto digital: sites, apps, componentes interativos e sistemas."] as const;
const cardButtons: HTMLButtonElement[] = [];
let cardStatus: HTMLElement | null = null;
let fallbackTimer: ReturnType<typeof setTimeout>;

function setState(value: string) {
  if (!stage) return;
  stage.dataset.state = value;
  stage.setAttribute("aria-busy", String(value === "loading"));
}
function reflectCard(index: 0 | 1, flipped: boolean) {
  cardFaces[index] = flipped;
  const allBack = cardFaces.every(Boolean);
  const allFront = cardFaces.every(face => !face);
  if (stage) {
    stage.dataset.face = allBack ? "back" : allFront ? "front" : "mixed";
    stage.dataset[ index === 0 ? "fatosFace" : "smiileFace" ] = flipped ? "back" : "front";
    stage.querySelector<HTMLElement>(index === 0 ? ".hero-standin-fatos" : ".hero-standin-smiile")?.setAttribute("data-face", flipped ? "back" : "front");
  }
  const button = cardButtons[index];
  if (button) {
    button.setAttribute("aria-pressed", String(flipped));
    button.textContent = `${cardNames[index]} · ${flipped ? "ver frente" : "ver verso"}`;
  }
  flipButton?.setAttribute("aria-pressed", allBack ? "true" : allFront ? "false" : "mixed");
  if (flipButton) flipButton.textContent = allBack ? "Ver as frentes" : "Ver os dois versos";
}
function flipCard(index: 0 | 1, flipped: boolean) {
  reflectCard(index, flipped);
  instance?.setCardFlipped(index, flipped, !isPaused());
  if (cardStatus) cardStatus.textContent = flipped ? `${cardNames[index]} — ${cardRoles[index]}` : `${cardNames[index]}: frente da peça.`;
  if (hint) hint.textContent = "TOQUE PARA VIRAR · ARRASTE PARA MOVER";
}
function restoreCardFaces() {
  cardFaces.forEach((flipped, index) => instance?.setCardFlipped(index as 0 | 1, flipped, false));
}
function isPaused() {
  return reduced.matches || motionToggle?.getAttribute("aria-pressed") === "true";
}
function sync() {
  if (instance) {
    instance.setActive(ready && inView && visible && !isPaused());
    if (ready) setState(reduced.matches ? "fallback" : "ready");
  }
  if (isPaused()) {
    clearTimeout(fallbackTimer);
    stage?.classList.remove("badge-fallback-bounce");
  }
}
function failure(reason: unknown) {
  failed = true;
  ready = false;
  instance?.dispose();
  instance = null;
  setState("fallback");
  console.warn("Crachás em modo estático.", reason);
  if (hint) hint.textContent = "EXPLORE A FRENTE E O VERSO";
}

async function load() {
  if (loading || failed || instance || !canvas || reduced.matches || !near) return;
  loading = true;
  setState("loading");
  let pending: BadgeSceneHandle | null = null;
  const timeout = setTimeout(() => {
    failure("Tempo de inicialização excedido.");
    pending?.dispose();
  }, 12000);
  try {
    const { BadgeScene } = await import("./badge/BadgeScene");
    if (failed) return;
    pending = new BadgeScene(canvas, {
      // The first useful image is a visible card, never the offscreen start of a clip.
      enter: false,
      front: { name: "Fatos", label: "DIREÇÃO CRIATIVA", line: "Narrativa e conteúdo para grandes audiências." },
      back: { name: "smiile", label: "PROJETO DIGITAL", line: "Da interface à experiência." },
      onRest() {
        if (hint && !stage?.dataset.interacted) hint.textContent = "TOQUE PARA VIRAR · ARRASTE PARA MOVER";
      },
      onTouch() {
        if (stage) stage.dataset.interacted = "true";
        if (hint) hint.textContent = "DIREÇÃO CRIATIVA + EXPERIÊNCIAS DIGITAIS";
      },
      onCardFlip(index, flipped) {
        reflectCard(index, flipped);
        if (cardStatus) cardStatus.textContent = flipped ? `${cardNames[index]} — ${cardRoles[index]}` : `${cardNames[index]}: frente da peça.`;
      },
      onContextLost() {
        ready = false;
        setState("fallback");
      },
      onContextRestored() {
        ready = true;
        restoreCardFaces();
        sync();
      },
      onError: failure,
    });
    await pending.init();
    if (failed) { pending.dispose(); return; }
    instance = pending;
    restoreCardFaces();
    ready = true;
    sync();
    // One quiet introduction, after a complete frame; no perpetual idle loop.
    if (inView && visible && !isPaused()) instance.swing(1);
  } catch (error) {
    pending?.dispose();
    failure(error);
  } finally {
    clearTimeout(timeout);
    loading = false;
  }
}

if (stage && canvas) {
  const approach = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    near = true;
    void load();
    approach.disconnect();
  }, { rootMargin: "420px 0px" });
  const view = new IntersectionObserver(([entry]) => {
    inView = !!entry?.isIntersecting;
    sync();
  }, { threshold: [0, .06, .2, .4] });
  approach.observe(stage);
  view.observe(stage);
  new ResizeObserver(() => instance?.resize()).observe(canvas);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; sync(); });
  if (motionToggle) new MutationObserver(sync).observe(motionToggle, { attributes: true, attributeFilter: ["aria-pressed"] });
  reduced.addEventListener("change", () => {
    if (reduced.matches) setState("fallback");
    else if (!instance && near) void load();
    sync();
  });
  swingButton?.addEventListener("click", () => {
    if (isPaused()) return;
    if (instance && ready) { instance.swing(1); return; }
    clearTimeout(fallbackTimer);
    stage.classList.remove("badge-fallback-bounce");
    void stage.offsetWidth;
    stage.classList.add("badge-fallback-bounce");
    fallbackTimer = setTimeout(() => stage.classList.remove("badge-fallback-bounce"), 850);
  });
  swingButton?.addEventListener("keydown", event => {
    if (isPaused() || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    instance?.swing(event.key === "ArrowLeft" ? -1 : 1);
  });
  const controls = flipButton?.parentElement;
  if (controls) {
    cardNames.forEach((name, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "badge-swing-button badge-card-button";
      button.dataset.badgeCardFlip = String(index);
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `Virar o crachá ${name}`);
      button.textContent = `${name} · ver verso`;
      button.addEventListener("click", () => flipCard(index as 0 | 1, !cardFaces[index]));
      cardButtons.push(button);
      controls.insertBefore(button, swingButton);
    });
    cardStatus = document.createElement("span");
    cardStatus.className = "sr-only";
    cardStatus.setAttribute("role", "status");
    cardStatus.setAttribute("aria-live", "polite");
    cardStatus.setAttribute("aria-atomic", "true");
    controls.append(cardStatus);
    controls.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      flipCard(0, false);
      flipCard(1, false);
      instance?.rest();
    });
  }
  reflectCard(0, false);
  reflectCard(1, false);
  flipButton?.addEventListener("click", () => {
    const flipped = !cardFaces.every(Boolean);
    flipCard(0, flipped);
    flipCard(1, flipped);
  });
  if (reduced.matches) setState("fallback");
}
