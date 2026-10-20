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
    const ctrl = {rive: null, canvas, artboard, sm: null, animation: null, names: [], inputs: [], contents: null, playing: false, hovering: false,
      input(name) { return this.inputs.find(i => i.name === name) || null; },
      play() { if (this.sm) this.rive.play(this.sm); else if (this.animation) this.rive.play(this.animation); else this.rive.play(); this.playing = true; },
      pause() { this.rive.pause(); this.playing = false; },
      reset() { return this.select({artboard: this.artboard, sm: this.sm, animation: this.animation}); },
      // Switch artboard and state machine or plain animation; resolves once the new inputs exist.
      select({artboard: ab = this.artboard, sm = null, animation = null} = {}) {
        this.artboard = ab; this.sm = sm; this.animation = sm ? null : animation;
        this.rive.reset({artboard: ab, stateMachines: sm || undefined, animations: this.animation || undefined, autoplay: true, autoBind: true});
        this.playing = true; this.hovering = false;
        return new Promise(ok => setTimeout(() => { this.inputs = readInputs(this.rive, this.sm); ok(this); }, 0));
      },
      // Synthetic mouse events at a point of the canvas: the file's own hover/move listeners react as on desktop.
      hover(on, fx = .5, fy = .5) {
        const r = canvas.getBoundingClientRect();
        const x = r.left + r.width * fx, y = r.top + r.height * fy;
        if (on) { canvas.dispatchEvent(new MouseEvent('mouseover', {clientX: x, clientY: y, bubbles: true})); canvas.dispatchEvent(new MouseEvent('mousemove', {clientX: x, clientY: y, bubbles: true})); }
        else canvas.dispatchEvent(new MouseEvent('mouseout', {clientX: r.left - 40, clientY: r.top - 40, bubbles: true}));
        this.hovering = on;
      },
      viewModel() { return this.rive.viewModelInstance || null; },
      destroy() { observer.disconnect(); this.rive.cleanup(); canvas.remove(); }
    };
    const observer = new ResizeObserver(() => ctrl.rive?.resizeDrawingSurfaceToCanvas());
    const rive = new rt.Rive({
      src, canvas, artboard, autoplay: false, autoBind: true, isTouchScrollEnabled: true,
      layout: new rt.Layout({fit: rt.Fit.Contain, alignment: rt.Alignment.Center}),
      onLoad: () => {
        rive.resizeDrawingSurfaceToCanvas();
        ctrl.names = rive.stateMachineNames || [];
        ctrl.contents = rive.contents || {artboards: []};
        ctrl.artboard = artboard || ctrl.contents.artboards[0]?.name;
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

const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };

/** Artboard + state machine/animation pickers, simulated hover and a drag mode for touch screens. */
export function renderSetup(container, ctrl, {onChange} = {}) {
  container.replaceChildren();
  const boards = ctrl.contents?.artboards || [];
  const board = boards.find(b => b.name === ctrl.artboard) || boards[0];
  if (boards.length > 1) {
    const sel = el('select', {title: 'Prancheta'}, ...boards.map(b => el('option', {value: b.name, textContent: `Prancheta: ${b.name}`, selected: b.name === ctrl.artboard})));
    sel.addEventListener('change', async () => { const b = boards.find(x => x.name === sel.value); await ctrl.select({artboard: b.name, sm: b.stateMachines[0]?.name || null, animation: b.stateMachines[0] ? null : b.animations[0]}); onChange?.(); });
    container.append(el('label', {className: 'pick'}, sel));
  }
  const modes = [...(board?.stateMachines || []).map(m => ['sm', m.name, `Máquina de estados: ${m.name}`]), ...(board?.animations || []).map(a => ['anim', a, `Animação: ${a}`])];
  if (modes.length > 1) {
    const sel = el('select', {title: 'O que tocar'}, ...modes.map(([k, n, t]) => el('option', {value: `${k}:${n}`, textContent: t, selected: (k === 'sm' && n === ctrl.sm) || (k === 'anim' && n === ctrl.animation)})));
    sel.addEventListener('change', async () => { const [k, ...rest] = sel.value.split(':'); const n = rest.join(':'); await ctrl.select({sm: k === 'sm' ? n : null, animation: k === 'anim' ? n : null}); onChange?.(); });
    container.append(el('label', {className: 'pick'}, sel));
  }
  const hover = el('button', {type: 'button', className: 'btn', textContent: 'Simular mouse por cima', title: 'Dispara a entrada do ponteiro no centro, como passar o mouse'});
  hover.setAttribute('aria-pressed', 'false');
  hover.addEventListener('click', () => { ctrl.hover(!ctrl.hovering); hover.setAttribute('aria-pressed', String(ctrl.hovering)); });
  const drag = el('button', {type: 'button', className: 'btn', textContent: 'Arrastar sem rolar', title: 'No celular, o dedo passa a mover o ponteiro dentro da animação em vez de rolar a página'});
  drag.setAttribute('aria-pressed', 'false');
  drag.addEventListener('click', () => { const on = drag.getAttribute('aria-pressed') !== 'true'; drag.setAttribute('aria-pressed', String(on)); ctrl.canvas.style.touchAction = on ? 'none' : ''; });
  container.append(hover, drag);
}

/** One control per state machine input (boolean → toggle, trigger → button, number → slider) and per data-binding property. */
export function renderInputs(container, ctrl, {onChange} = {}) {
  container.replaceChildren();
  const vm = ctrl.viewModel?.();
  const props = vm ? vm.properties.filter(p => ['boolean', 'number', 'trigger', 'enumType', 'string', 'color'].includes(p.type)) : [];
  for (const p of props) {
    if (p.type === 'boolean') {
      const prop = vm.boolean(p.name), b = el('button', {type: 'button', className: 'btn', textContent: `${p.name} (dados)`});
      b.setAttribute('aria-pressed', String(Boolean(prop?.value)));
      b.addEventListener('click', () => { prop.value = !prop.value; b.setAttribute('aria-pressed', String(Boolean(prop.value))); onChange?.(); });
      container.append(b);
    } else if (p.type === 'trigger') {
      const prop = vm.trigger(p.name), b = el('button', {type: 'button', className: 'btn', textContent: `${p.name} ▸ (dados)`});
      b.addEventListener('click', () => { prop.trigger(); onChange?.(); });
      container.append(b);
    } else if (p.type === 'number') {
      const prop = vm.number(p.name), r = el('input', {type: 'range', min: '0', max: '100', step: '1', value: String(prop?.value ?? 0)}), out = el('output', {textContent: String(prop?.value ?? 0)});
      r.addEventListener('input', () => { prop.value = Number(r.value); out.textContent = r.value; onChange?.(); });
      container.append(el('label', {className: 'num'}, `${p.name} `, r, out));
    } else if (p.type === 'enumType') {
      const prop = vm.enum(p.name), s2 = el('select', {}, ...(prop?.values || []).map(v => el('option', {value: v, textContent: v, selected: v === prop.value})));
      s2.addEventListener('change', () => { prop.value = s2.value; onChange?.(); });
      container.append(el('label', {className: 'pick'}, `${p.name} `, s2));
    } else if (p.type === 'string') {
      const prop = vm.string(p.name), t = el('input', {type: 'text', value: prop?.value ?? '', size: 12});
      t.addEventListener('input', () => { prop.value = t.value; onChange?.(); });
      container.append(el('label', {className: 'num'}, `${p.name} `, t));
    }
  }
  if (!ctrl.inputs.length && !props.length) {
    const note = document.createElement('span');
    note.className = 'tag';
    note.textContent = ctrl.sm ? 'Sem entradas: toque ou use Simular mouse por cima' : 'Animação sem máquina de estados';
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
