/* Rive and Lottie helpers. Both runtimes are classic scripts loaded with defer
 * before the modules (window.RiveRT, window.LottieRT). Original files come from
 * their public CDNs at runtime; nothing third-party is stored in this repo. */
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const INPUT = {56: 'number', 58: 'trigger', 59: 'boolean'};
let wasmReady = false;

function riveRuntime() {
  const rt = window.RiveRT;
  if (!rt) throw new Error('O runtime do Rive não carregou.');
  if (!wasmReady) {
    rt.RuntimeLoader.setWasmUrl('/vendor/rive.wasm');
    rt.RuntimeLoader.setWasmFallbackUrl?.('/vendor/rive.wasm');
    wasmReady = true;
  }
  return rt;
}

/** Loads a .riv into `host`, plays its first (or the named) state machine and
 *  resolves with a small controller. The file's own listeners stay on, so hover
 *  and click on the canvas behave as on the Rive site. */
export function mountRive(host, {src, artboard, stateMachine, paused = false} = {}) {
  return new Promise((resolve, reject) => {
    let rt;
    try { rt = riveRuntime(); } catch (error) { reject(error); return; }
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    host.append(canvas);
    const ctrl = {rive: null, sm: null, names: [], inputs: [], playing: false,
      input(name) { return this.inputs.find(i => i.name === name) || null; },
      play() { if (this.sm) this.rive.play(this.sm); else this.rive.play(); this.playing = true; },
      pause() { this.rive.pause(); this.playing = false; },
      reset() {
        this.rive.reset({artboard, stateMachines: this.sm || undefined, autoplay: true});
        this.inputs = readInputs(this.rive, this.sm); this.playing = true;
      },
      destroy() { observer.disconnect(); this.rive.cleanup(); canvas.remove(); }
    };
    const observer = new ResizeObserver(() => ctrl.rive?.resizeDrawingSurfaceToCanvas());
    const rive = new rt.Rive({
      src, canvas, artboard, autoplay: false, isTouchScrollEnabled: true,
      layout: new rt.Layout({fit: rt.Fit.Contain, alignment: rt.Alignment.Center}),
      onLoad: () => {
        rive.resizeDrawingSurfaceToCanvas();
        ctrl.names = rive.stateMachineNames || [];
        ctrl.sm = stateMachine && ctrl.names.includes(stateMachine) ? stateMachine : ctrl.names[0] || null;
        ctrl.play();
        // play() is queued until Rive flags readyForPlaying, right after onLoad returns;
        // the inputs only exist once the state machine is instanced.
        setTimeout(() => {
          ctrl.inputs = readInputs(rive, ctrl.sm);
          if (paused) ctrl.pause();
          observer.observe(host);
          resolve(ctrl);
        }, 0);
      },
      onLoadError: event => reject(new Error(typeof event?.data === 'string' ? event.data : 'Falha ao carregar o arquivo .riv'))
    });
    ctrl.rive = rive;
  });
}

function readInputs(rive, sm) {
  if (!sm) return [];
  return (rive.stateMachineInputs(sm) || []).map(input => Object.assign(input, {kind: INPUT[input.type] || 'desconhecida'}));
}

/** One control per state machine input: boolean → toggle, trigger → button, number → slider. */
export function renderInputs(container, ctrl, {onChange} = {}) {
  container.replaceChildren();
  if (!ctrl.inputs.length) {
    const note = document.createElement('span');
    note.className = 'tag';
    note.textContent = ctrl.sm ? 'Sem entradas: interaja direto na animação' : 'Sem máquina de estados: só animação';
    container.append(note);
    return;
  }
  for (const input of ctrl.inputs) {
    if (input.kind === 'boolean') {
      const button = Object.assign(document.createElement('button'), {type: 'button', className: 'btn', textContent: input.name});
      button.setAttribute('aria-pressed', String(Boolean(input.value)));
      button.title = 'Entrada booleana';
      button.addEventListener('click', () => {
        input.value = !input.value;
        button.setAttribute('aria-pressed', String(Boolean(input.value)));
        onChange?.(input);
      });
      container.append(button);
    } else if (input.kind === 'trigger') {
      const button = Object.assign(document.createElement('button'), {type: 'button', className: 'btn', textContent: `${input.name} ▸`});
      button.title = 'Disparo';
      button.addEventListener('click', () => { input.fire(); onChange?.(input); });
      container.append(button);
    } else if (input.kind === 'number') {
      const label = Object.assign(document.createElement('label'), {className: 'num'});
      const range = Object.assign(document.createElement('input'), {type: 'range', min: '0', max: '100', step: '1', value: String(input.value ?? 0)});
      const out = document.createElement('output');
      out.textContent = range.value;
      range.addEventListener('input', () => { input.value = Number(range.value); out.textContent = range.value; onChange?.(input); });
      label.append(`${input.name} `, range, out);
      container.append(label);
    }
  }
}

/** lottie-web (SVG renderer). Shows the last frame as poster until played. */
export function mountLottie(box, {path, poster = 'last'} = {}) {
  return new Promise((resolve, reject) => {
    const rt = window.LottieRT;
    if (!rt) { reject(new Error('O runtime do Lottie não carregou.')); return; }
    const anim = rt.lottie.loadAnimation({container: box, renderer: 'svg', loop: false, autoplay: false, path,
      rendererSettings: {progressiveLoad: false, hideOnTransparent: true}});
    anim.addEventListener('DOMLoaded', () => {
      const last = Math.max(0, Math.floor(anim.totalFrames) - 1);
      anim.goToAndStop(poster === 'last' ? last : 0, true);
      box.querySelector('svg')?.setAttribute('aria-hidden', 'true');
      resolve(anim);
    });
    anim.addEventListener('data_failed', () => reject(new Error('Falha ao baixar o JSON do Lottie')));
  });
}

/** Mounts `create(card)` once the card is near the viewport. */
export function whenNear(element, create, rootMargin = '300px') {
  const io = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { io.disconnect(); create(); }
  }, {rootMargin});
  io.observe(element);
}
