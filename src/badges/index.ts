import type { BadgeScene as BadgeSceneHandle } from "./badge/BadgeScene";

const stage = document.querySelector<HTMLElement>("[data-portfolio-badges]");
const canvas = stage?.querySelector<HTMLCanvasElement>("[data-badge-canvas]");
const poster = stage?.querySelector<HTMLImageElement>("[data-badge-poster]");
const posterSource = stage?.querySelector<HTMLSourceElement>("[data-badge-poster-source]");
const controls = document.querySelector<HTMLElement>(".hero-badge-controls");
const selectButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-badge-select]")];
const flipButton = document.querySelector<HTMLButtonElement>("[data-badge-flip]");
const cardStatus = document.querySelector<HTMLElement>("[data-badge-status]");
const currentBadgeLabel = document.querySelector<HTMLElement>("[data-badge-current-label]");
const continueLink = document.querySelector<HTMLAnchorElement>("[data-badge-link]");
const touchCue = document.querySelector<HTMLElement>(".badge-touch-cue");
const exhibit = stage?.closest<HTMLElement>(".hero-badge-exhibit");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const motionToggle = document.querySelector<HTMLElement>(".motion-toggle");
let instance: BadgeSceneHandle | null = null;
let near = false, inView = false, visible = !document.hidden, loading = false;
// The 3D bundle waits for the first intent with the badges or an idle moment after load.
let idle = false, intent = false;
let failed = false, ready = false;
let selectedCard: 0 | 1 = 0;
let restoringCardState = false;
let layout: "pair" | "single" = "single";
const cardFaces: [boolean, boolean] = [false, false];
const cards = [
  { name: "Smile N", kicker: "Smile N · Conteúdo e redação", front: "Pesquisa, conteúdo e direção criativa.", back: "O recorte dá forma à história.", body: "Experiência em pesquisa, texto e direção criativa para construir narrativas e conteúdos.", href: "#laboratorio", link: "Ver as campanhas" },
  { name: "smiile", kicker: "smiile · Projeto próprio", front: "Interfaces, produtos e novas possibilidades.", back: "Do visual ao que acontece depois.", body: "Direção visual e desenvolvimento de experiências para sites, aplicativos e sistemas.", href: "#laboratorio", link: "Ver a campanha smiile" },
] as const;
let posterRevision = 0;
const posterDecodes = new Map<string, Promise<void>>();

function decodePoster(source: string) {
  let decoded = posterDecodes.get(source);
  if (!decoded) {
    const image = new Image();
    image.src = source;
    decoded = image.decode().catch(error => { posterDecodes.delete(source); throw error; });
    posterDecodes.set(source, decoded);
  }
  return decoded;
}
function reflectPoster() {
  const revision = ++posterRevision;
  const faces = cardFaces.map(face => face ? "b" : "f").join("");
  const key = layout === "pair" ? `pair-${faces}` : `single-${selectedCard}${cardFaces[selectedCard] ? "b" : "f"}`;
  const source = poster?.getAttribute(`data-poster-${key}`);
  if (!poster || !source) return;
  const apply = () => {
    if (revision !== posterRevision) return;
    // Updating both picture candidates atomically preserves the same decoded
    // design while switching layout, selected card or printed face.
    poster.src = source;
    if (posterSource) posterSource.srcset = source;
    poster.dataset.faces = faces;
    poster.dataset.posterKey = key;
    delete poster.dataset.error;
  };
  if (poster.currentSrc === new URL(source, document.baseURI).href && poster.complete && poster.naturalWidth) { apply(); return; }
  void decodePoster(source).then(apply).catch(() => {
    if (revision === posterRevision) poster.dataset.error = key;
  });
}
function reflectControls() {
  const card = cards[selectedCard];
  const flipped = cardFaces[selectedCard];
  selectButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === selectedCard)));
  if (currentBadgeLabel) currentBadgeLabel.textContent = `${card.name} · ${flipped ? "verso" : "selecionado"}`;
  if (controls) controls.dataset.activeCard = String(selectedCard);
  // The arrows printed on the badge art are not links; this real link names the destination.
  if (continueLink) {
    continueLink.href = card.href;
    continueLink.firstChild!.textContent = `${card.link} `;
  }
  if (flipButton) {
    flipButton.setAttribute("aria-pressed", String(flipped));
    flipButton.setAttribute("aria-label", `Ver ${flipped ? "a frente" : "o verso"} do crachá ${card.name}`);
    flipButton.innerHTML = `${flipped ? "Ver frente" : "Ver verso"} <span aria-hidden="true">↻</span>`;
  }
}
function announce() {
  if (cardStatus) cardStatus.textContent = `${cards[selectedCard].name}: ${cardFaces[selectedCard] ? "verso" : "frente"} da peça. ${cards[selectedCard].body}`;
}
function reflectSelection(index: 0 | 1) {
  selectedCard = index;
  if (stage) stage.dataset.selectedCard = String(index);
  reflectControls();
  reflectPoster();
}
function selectCard(index: 0 | 1) {
  if (index === selectedCard) return;
  reflectSelection(index);
  instance?.setSelectedCard(index, !isPaused());
  announce();
}
function setState(value: string) {
  if (!stage) return;
  stage.dataset.state = value;
  stage.setAttribute("aria-busy", String(value === "loading"));
  reflectCue();
}
// The instruction matches what the visitor can actually do with the current input and renderer.
function reflectCue() {
  if (!touchCue || !stage) return;
  const live = stage.dataset.state !== "fallback" && !reduced.matches;
  touchCue.textContent = !live ? "Use “Ver verso” para ver o outro lado" : matchMedia("(hover: hover) and (pointer: fine)").matches ? "Arraste o crachá · clique para ver o verso" : "Arraste o crachá ou toque para virar";
}
function reflectCard(index: 0 | 1, flipped: boolean) {
  cardFaces[index] = flipped;
  if (stage) {
    stage.dataset.face = cardFaces.every(Boolean) ? "back" : cardFaces.every(face => !face) ? "front" : "mixed";
    stage.dataset[index === 0 ? "editorialFace" : "smiileFace"] = flipped ? "back" : "front";
  }
  reflectPoster();
  reflectControls();
}
function flipCard(index: 0 | 1, flipped: boolean) {
  reflectCard(index, flipped);
  instance?.setCardFlipped(index, flipped, !isPaused());
  announce();
}
function restoreCardState() {
  restoringCardState = true;
  try {
    cardFaces.forEach((flipped, index) => instance?.setCardFlipped(index as 0 | 1, flipped, false));
    instance?.setSelectedCard(selectedCard, false);
  } finally { restoringCardState = false; }
}
function isPaused() {
  return reduced.matches || motionToggle?.getAttribute("aria-pressed") === "true";
}
function sync() {
  if (instance) {
    instance.setActive(ready && inView && visible && !isPaused());
    // A ready scene remains the sole visible design when motion is paused.
    // Reduced motion on first visit uses its exact poster without WebGL.
    if (ready) setState("ready");
  }
}
function resize() {
  const nextLayout = (canvas?.clientWidth || 0) >= 540 ? "pair" : "single";
  if (nextLayout !== layout || !stage?.dataset.layout) {
    layout = nextLayout;
    if (stage) stage.dataset.layout = layout;
    reflectPoster();
  }
  instance?.resize();
}
function failure(reason: unknown) {
  failed = true;
  ready = false;
  instance?.dispose();
  instance = null;
  setState("fallback");
  sync();
  console.warn("Crachás em modo estático.", reason);
}
async function load() {
  if (loading || failed || instance || !canvas || reduced.matches || !(intent || (near && idle))) return;
  loading = true;
  setState("loading");
  let pending: BadgeSceneHandle | null = null;
  const timeout = setTimeout(() => { failure("Tempo de inicialização excedido."); pending?.dispose(); }, 12000);
  try {
    const { BadgeScene } = await import("./badge/BadgeScene");
    if (failed) return;
    pending = new BadgeScene(canvas, {
      enter: false,
      front: { name: "Smile N", label: "DIREÇÃO CRIATIVA", line: "Narrativa e conteúdo para grandes audiências." },
      back: { name: "smiile", label: "PROJETO DIGITAL", line: "Da interface à experiência." },
      onTouch() { if (stage) stage.dataset.interacted = "true"; },
      onCardSelect(index) { if (!restoringCardState) { reflectSelection(index); announce(); } },
      onCardFlip(index, flipped) { if (!restoringCardState) { reflectSelection(index); reflectCard(index, flipped); announce(); } },
      onContextLost() { ready = false; setState("fallback"); },
      onContextRestored() { ready = true; restoreCardState(); sync(); },
      onError: failure,
    });
    await pending.init();
    if (failed) { pending.dispose(); return; }
    instance = pending;
    restoreCardState();
    ready = true;
    sync();
  } catch (error) {
    pending?.dispose();
    failure(error);
  } finally {
    clearTimeout(timeout);
    loading = false;
  }
}
if (stage && canvas) {
  resize();
  const approach = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    near = true;
    void load();
    approach.disconnect();
  }, { rootMargin: "420px 0px" });
  const view = new IntersectionObserver(([entry]) => { inView = !!entry?.isIntersecting; sync(); }, { threshold: [0, .06, .2, .4] });
  approach.observe(stage);
  view.observe(stage);
  // First interaction loads immediately; otherwise wait for idle time after load so the
  // static poster stays the LCP image and parsing never competes with the first tap.
  const firstIntent = () => { intent = true; void load(); };
  for (const type of ["pointerdown", "pointerenter", "focusin"]) exhibit?.addEventListener(type, firstIntent, { once: true, passive: true });
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  const whenIdle = () => {
    if (saveData) return;
    const markIdle = () => { idle = true; void load(); };
    if ("requestIdleCallback" in window) requestIdleCallback(markIdle, { timeout: 2500 });
    else setTimeout(markIdle, 1500);
  };
  if (document.readyState === "complete") whenIdle();
  else addEventListener("load", whenIdle, { once: true });
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; sync(); });
  if (motionToggle) new MutationObserver(sync).observe(motionToggle, { attributes: true, attributeFilter: ["aria-pressed"] });
  reduced.addEventListener("change", () => {
    if (reduced.matches && !instance) setState("fallback");
    else if (!instance) void load();
    reflectCue();
    sync();
  });
  selectButtons.forEach((button, index) => button.addEventListener("click", () => selectCard(index as 0 | 1)));
  flipButton?.addEventListener("click", () => flipCard(selectedCard, !cardFaces[selectedCard]));
  controls?.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      cardFaces[0] = false;
      cardFaces[1] = false;
      restoreCardState();
      reflectCard(0, false);
      reflectCard(1, false);
      instance?.rest();
      announce();
    }
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && (event.target as HTMLElement).matches("[data-badge-select]")) {
      event.preventDefault();
      const next = selectedCard === 0 ? 1 : 0;
      selectCard(next);
      selectButtons[next]?.focus();
    }
  });
  reflectCard(0, false);
  reflectCard(1, false);
  // Warm the four useful fallback states only for the current composition.
  void poster?.decode().then(() => Promise.allSettled((layout === "pair" ? ["pair-ff", "pair-fb", "pair-bf", "pair-bb"] : ["single-0f", "single-0b", "single-1f", "single-1b"]).map(key => {
    const source = poster.getAttribute(`data-poster-${key}`);
    return source ? decodePoster(source) : Promise.resolve();
  }))).catch(() => {});
  setState(reduced.matches ? "fallback" : "idle");
  sync();
}
