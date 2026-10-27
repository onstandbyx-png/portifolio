/* K17 · Overlay scenes (SPEC 3.B AV4.1, copy-ao-vivo.md §4.1).
 * Four overlay scenes of the fictional Ateliê Exemplo drawn in HTML and CSS
 * inside the notebook frame (K8, markup of createMacBookFrame() written in the
 * page so it renders without JS), stacked with the generalized deck (K6):
 * an exchange takes 400 ms `ease`, each scene behind sits 24 px higher at
 * scaleX(.95), a horizontal drag locks its axis and arrows/Home/End work on the
 * stage. The "Cena" buttons drive the same deck. "16:9 | 9:16" morphs the frame
 * in 350 ms (cubic-bezier(.2,.9,.25,1.02)) and recomposes the scene.
 * Reduced motion or pause: the deck turns into its list mode, where only the
 * active scene is shown (overlay.css), so scenes change instantly.
 * In the "Ao vivo" scene the "#publi · Publicidade" tag is static markup: it
 * never animates, never hides and stays for the whole sponsored segment. */
import {mountDeck} from '../deck.js';
import {onMotionPreferenceChange} from '../spring.js';

export const SCENES = Object.freeze(['Começando', 'Ao vivo', 'Intervalo', 'Encerrando']);
export const STATUS = Object.freeze({
  scene: Object.freeze([
    'Começando: a tela de espera já avisa o tema da live.',
    'Ao vivo: o rótulo de publicidade fica na tela durante todo o segmento patrocinado.',
    'Intervalo: a pausa continua com a cara do canal.',
    'Encerrando: o fim já anuncia a próxima live.'
  ]),
  ratio: Object.freeze({'16:9': '16:9: a cena para a tela grande.', '9:16': '9:16: a mesma cena, recomposta para o celular.'})
});

const $$ = (root, selector) => [...root.querySelectorAll(selector)];

export function mountOverlay(root) {
  if (!root || root.dataset.overlayReady) return null;
  const deckRoot = root.querySelector('[data-deck]');
  const device = root.querySelector('[data-overlay-device]');
  const status = root.querySelector('[data-overlay-status]');
  const chips = $$(root, '[data-scene-go]');
  const say = text => { if (status) status.textContent = text; };
  const syncChips = index => chips.forEach(chip => chip.setAttribute('aria-pressed', String(Number(chip.dataset.sceneGo) === index)));

  // Mount without the first transition: the cards settle into the stack at once.
  root.classList.add('is-mounting');
  const deck = mountDeck(deckRoot, {onChange: index => { syncChips(index); say(STATUS.scene[index]); }});
  void root.offsetWidth;
  root.classList.remove('is-mounting');
  if (!deck) return null;

  chips.forEach(chip => chip.addEventListener('click', () => {
    const index = Number(chip.dataset.sceneGo);
    if (!deck.go(index)) { syncChips(index); say(STATUS.scene[index]); }
  }));
  function setRatio(ratio, {announce = true} = {}) {
    if (!STATUS.ratio[ratio]) return;
    device.dataset.ratio = ratio;
    root.dataset.ratio = ratio;
    $$(root, '[data-overlay-ratio]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.overlayRatio === ratio)));
    if (announce) say(STATUS.ratio[ratio]);
  }
  $$(root, '[data-overlay-ratio]').forEach(button => button.addEventListener('click', () => setRatio(button.dataset.overlayRatio)));
  onMotionPreferenceChange(() => syncChips(deck.active()));

  syncChips(deck.active());
  setRatio(device?.dataset.ratio || '16:9', {announce: false});
  root.dataset.overlayReady = 'true';
  return {deck, setRatio, go: index => deck.go(index), active: () => deck.active()};
}
