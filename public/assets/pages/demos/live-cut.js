/* K15 · "Da live ao corte" (SPEC 3.B AV4.2, copy-ao-vivo.md §4.2).
 * Port of the portfolio's own storyboard demo (deck-demos.js → video, P10):
 * a 10 s storyboard that only plays on a click, with the 16:9 ↔ 9:16 switch.
 * Changes from P10:
 * - available() no longer depends on an open deck card: playback runs only
 *   while the demo is on screen (IntersectionObserver), the tab is visible and
 *   motion is not reduced or paused; otherwise it stops;
 * - a 3-hour live timeline with three fictional marks; choosing a mark turns the
 *   preview into a 9:16 cut with title and caption, and the playhead glides to
 *   the mark in 500 ms cubic-bezier(.25,.1,.25,1);
 * - the frame morphs in 350 ms (cubic-bezier(.2,.9,.25,1.02)) instead of .45 s;
 * - requestAnimationFrame runs only while playing and stops at 10 s.
 * With reduced motion or pause, each "Assistir" press steps to the next scene.
 * No <audio>, no <video>, no embed: the storyboard is HTML and CSS. */
import {createMotion} from '../../sections/motion.js';
import {DURATION, motionReduced, onMotionPreferenceChange, springEasing} from '../spring.js';

export const STORYBOARD_MS = 10000;
export const SCENE_MS = 3500;
export const MARKS = Object.freeze([
  Object.freeze({time: '00:42', label: 'A peça rachou', at: 42 / 180, title: 'Rachou ao vivo. E agora?', caption: '"Calma, dá para salvar. Olha só."'}),
  Object.freeze({time: '01:15', label: 'Pergunta do chat', at: 75 / 180, title: 'Qual barro usar para começar?', caption: '"Essa pergunta apareceu três vezes no chat."'}),
  Object.freeze({time: '02:30', label: 'Forno aberto', at: 150 / 180, title: 'O momento de abrir o forno', caption: '"Nunca sei o que vou encontrar."'})
]);
export const STATUS = Object.freeze({
  mark: time => `Marcação ${time}: a prévia virou um corte 9:16.`,
  end: 'Fim: três cenas em dez segundos.',
  paused: n => `Pausado na cena ${n} de 3.`,
  step: (n, title) => `Cena ${n} de 3: ${title}`,
  ratio: {'16:9': '16:9: a cena para a tela grande.', '9:16': '9:16: a mesma cena, recomposta para o celular.'}
});

/** The three storyboard scenes for a mark (01 GANCHO uses the mark's title). */
export function storyboard(mark = MARKS[0]) {
  return [
    {tag: '01 · GANCHO', headline: mark.title},
    {tag: '02 · CONTEXTO', headline: 'O trecho da live, com legenda.'},
    {tag: '03 · CONVITE', headline: 'Live completa toda quinta.'}
  ];
}
export const sceneAt = elapsed => Math.min(2, Math.max(0, Math.floor(elapsed / SCENE_MS)));
export const clockText = elapsed => `00:${String(Math.min(10, Math.floor(Math.max(0, elapsed) / 1000))).padStart(2, '0')}`;
/** Reduced motion: the next scene start for a press (wraps after the third). */
export const nextStep = elapsed => ((sceneAt(elapsed) + 1) % 3) * SCENE_MS;

const $ = (root, selector) => root.querySelector(selector);
const $$ = (root, selector) => [...root.querySelectorAll(selector)];

export function mountLiveCut(root) {
  if (!root || root.dataset.liveCutReady) return null;
  const motion = createMotion();
  const device = $(root, '[data-cut-device]');
  const screen = $(root, '[data-cut-screen]');
  const play = $(root, '[data-cut-play]');
  const status = $(root, '[data-cut-status]');
  const progress = $(root, '[data-cut-progress]');
  const clock = $(root, '[data-cut-clock]');
  const tag = $(root, '[data-cut-tag]');
  const title = $(root, '[data-cut-title]');
  const caption = $(root, '[data-cut-caption]');
  const timeline = $(root, '[data-cut-timeline]');
  if (!device || !screen || !play || !title) return null;
  const titleEasing = springEasing('entry', 'cubic-bezier(.16,1,.3,1)');
  let mark = MARKS[0], chosen = false, elapsed = 0, scene = -1, playing = false, raf = 0, last = 0, inView = false;

  const say = text => { if (status) status.textContent = text; };
  const setPlayLabel = on => {
    const label = on ? 'Pausar' : 'Assistir';
    play.setAttribute('aria-label', label);
    const text = $(play, '[data-cut-play-label]');
    if (text) text.textContent = label;
    play.dataset.state = on ? 'playing' : 'idle';
  };
  function paint({force = false} = {}) {
    const index = sceneAt(elapsed);
    if (index !== scene || force) {
      const changed = index !== scene;
      scene = index;
      const current = storyboard(mark)[index];
      if (tag) tag.textContent = current.tag;
      title.textContent = current.headline;
      screen.dataset.scene = String(index);
      if (changed && playing) motion.animate(title, [{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'none'}], {duration: DURATION.entry, easing: titleEasing});
    }
    if (progress) progress.style.transform = `scaleX(${Math.min(1, elapsed / STORYBOARD_MS)})`;
    if (clock) clock.textContent = clockText(elapsed);
  }
  const canPlay = () => inView && !document.hidden && !motionReduced();
  function stop(message = '') {
    const was = playing;
    playing = false;
    cancelAnimationFrame(raf); raf = 0;
    setPlayLabel(false);
    root.classList.remove('is-playing');
    if (was && message) say(message);
  }
  function tick(now) {
    if (!playing) return;
    if (!canPlay()) { stop(STATUS.paused(scene + 1)); return; }
    elapsed = Math.min(STORYBOARD_MS, elapsed + Math.min(90, Math.max(0, now - last)));
    last = Math.max(last, now);
    paint();
    if (elapsed >= STORYBOARD_MS) { stop(STATUS.end); return; }
    raf = requestAnimationFrame(tick);
  }
  function setRatio(ratio, {announce = true} = {}) {
    device.dataset.ratio = ratio;
    $$(root, '[data-cut-ratio]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cutRatio === ratio)));
    if (announce) say(STATUS.ratio[ratio]);
  }
  function choose(index) {
    const next = MARKS[index];
    if (!next) return;
    stop();
    mark = next; chosen = true; elapsed = 0;
    root.dataset.cut = 'true';
    if (caption) caption.textContent = mark.caption;
    timeline?.style.setProperty('--cut-head', String(mark.at));
    $$(root, '[data-cut-mark]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.cutMark) === index)));
    setRatio('9:16', {announce: false});
    paint({force: true});
    say(STATUS.mark(mark.time));
  }

  play.addEventListener('click', () => {
    if (playing) { stop(STATUS.paused(scene + 1)); return; }
    // Without motion, each press shows the next scene instead of playing.
    if (motionReduced()) {
      elapsed = nextStep(elapsed);
      paint();
      say(STATUS.step(scene + 1, storyboard(mark)[scene].headline));
      return;
    }
    if (!canPlay()) return;
    if (elapsed >= STORYBOARD_MS) { elapsed = 0; paint(); }
    playing = true;
    root.classList.add('is-playing');
    setPlayLabel(true);
    last = performance.now();
    raf = requestAnimationFrame(tick);
  });
  $(root, '[data-cut-replay]')?.addEventListener('click', () => {
    stop();
    elapsed = 0;
    paint({force: true});
    say(STATUS.step(1, storyboard(mark)[0].headline));
  });
  $$(root, '[data-cut-ratio]').forEach(button => button.addEventListener('click', () => setRatio(button.dataset.cutRatio)));
  $$(root, '[data-cut-mark]').forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.cutMark))));

  // Playback policy (S4): on screen, visible tab, no pause, no reduced motion.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView && playing) stop(STATUS.paused(scene + 1));
    }, {threshold: .25}).observe(root);
  } else inView = true;
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(STATUS.paused(scene + 1)); });
  onMotionPreferenceChange(reduced => { if (reduced && playing) stop(STATUS.paused(scene + 1)); });
  motion.onStop(() => { if (playing && !canPlay()) stop(STATUS.paused(scene + 1)); });

  setPlayLabel(false);
  setRatio(device.dataset.ratio || '16:9', {announce: false});
  paint({force: true});
  root.dataset.liveCutReady = 'true';
  return {choose, setRatio, stop, isPlaying: () => playing, elapsed: () => elapsed, scene: () => scene};
}
