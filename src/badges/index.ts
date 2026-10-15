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
let failed = false, flipped = false, ready = false;
let fallbackTimer: ReturnType<typeof setTimeout>;

function setState(value: string) {
  if (!stage) return;
  stage.dataset.state = value;
  stage.setAttribute("aria-busy", String(value === "loading"));
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
        if (hint && !stage?.dataset.interacted) hint.textContent = "ARRASTE PARA EXPLORAR · VIRE PARA CONHECER";
      },
      onTouch() {
        if (stage) stage.dataset.interacted = "true";
        if (hint) hint.textContent = "DIREÇÃO CRIATIVA + EXPERIÊNCIAS DIGITAIS";
      },
      onContextLost() {
        ready = false;
        setState("fallback");
      },
      onContextRestored() {
        ready = true;
        instance?.setFlipped(flipped, false);
        sync();
      },
      onError: failure,
    });
    await pending.init();
    if (failed) { pending.dispose(); return; }
    instance = pending;
    instance.setFlipped(flipped, false);
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
  flipButton?.addEventListener("click", () => {
    flipped = !flipped;
    stage.dataset.face = flipped ? "back" : "front";
    flipButton.setAttribute("aria-pressed", String(flipped));
    flipButton.textContent = flipped ? "Ver a frente" : "Ver o verso";
    instance?.setFlipped(flipped, !isPaused());
    if (hint) hint.textContent = flipped ? "FATOS: DIREÇÃO CRIATIVA · SMIILE: PROJETO DIGITAL" : "ARRASTE PARA EXPLORAR · VIRE PARA CONHECER";
  });
  if (reduced.matches) setState("fallback");
}
