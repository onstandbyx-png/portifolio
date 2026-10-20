/* Recreations in plain SVG/CSS + WAAPI, each next to its original. Timings come
 * from the frame-by-frame measurements of the originals (matrix-result).
 * Every recreation exposes {el, toggle(rate) → Promise<ms>, reset()} and an
 * optional mount() called once el is in the document. */
const html = markup => { const t = document.createElement('template'); t.innerHTML = markup.trim(); return t.content.firstElementChild; };
const finished = anims => Promise.all(anims.map(a => a.finished.catch(() => null)));
// Measured on the animation timeline (start → finish), so main-thread latency
// before the first frame does not count; precision is one frame.
const timed = async (anims, rate) => {
  anims.forEach(a => { a.playbackRate = rate; });
  await finished(anims);
  const end = document.timeline.currentTime;
  return Math.round(end - Math.min(...anims.map(a => a.startTime ?? end)));
};

/* 1 · LottieFiles "Check Mark - Success": keyframes transcribed from the JSON
 * (80×80, 30 fps, 40 frames = 1333 ms). Lottie ease {o:.333,0 i:.667,1}. */
export function checkLottie() {
  const el = html(`<div class="rec-check-lottie"><svg viewBox="0 0 80 80" aria-hidden="true" focusable="false">
    <g class="fillo" opacity="0"><circle class="fill t" cx="40" cy="40" r="32" fill="#6DCC5B"/></g>
    <path class="ring t" d="M40 10A30 30 0 1 1 40 70A30 30 0 1 1 40 10" pathLength="100" fill="none" stroke="#6DCC5B" stroke-width="3" stroke-linecap="round" stroke-dasharray="100 102" stroke-dashoffset="101"/>
    <g class="flash" opacity="0"><circle class="t" cx="40" cy="40" r="32" fill="#87F572"/></g>
    <path class="tick" d="M25.562 42L33.312 50L54.437 30" pathLength="100" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="100 102" stroke-dashoffset="101"/></svg></div>`);
  const F = 40, DUR = F / 30 * 1000, o = f => f / F;
  const EIO = 'cubic-bezier(.333,0,.667,1)', ELIN = 'cubic-bezier(.167,.167,.833,.833)';
  const tracks = [
    ['.ring', [{offset: 0, strokeDashoffset: 101, transform: 'scale(1)', easing: EIO}, {offset: o(16), strokeDashoffset: 0, transform: 'scale(1)', easing: EIO},
      {offset: o(22), strokeDashoffset: 0, transform: 'scale(0.8)', easing: EIO}, {offset: o(25), strokeDashoffset: 0, transform: 'scale(1.2)', easing: EIO},
      {offset: o(29), strokeDashoffset: 0, transform: 'scale(1)'}, {offset: 1, strokeDashoffset: 0, transform: 'scale(1)'}]],
    ['.fillo', [{offset: 0, opacity: 0}, {offset: o(21), opacity: 0, easing: ELIN}, {offset: o(28), opacity: .98}, {offset: 1, opacity: .98}]],
    ['.fill', [{offset: 0, transform: 'scale(0)'}, {offset: o(21), transform: 'scale(0)', easing: EIO}, {offset: o(28), transform: 'scale(1)'}, {offset: 1, transform: 'scale(1)'}]],
    ['.flash', [{offset: 0, opacity: 0}, {offset: o(25), opacity: 0, easing: ELIN}, {offset: o(30), opacity: .98, easing: ELIN}, {offset: o(38), opacity: 0}, {offset: 1, opacity: 0}]],
    ['.flash circle', [{offset: 0, transform: 'scale(0)'}, {offset: o(25), transform: 'scale(0)', easing: EIO}, {offset: o(30), transform: 'scale(1)'}, {offset: 1, transform: 'scale(1)'}]],
    ['.tick', [{offset: 0, strokeDashoffset: 101}, {offset: o(25), strokeDashoffset: 101, easing: EIO}, {offset: o(33), strokeDashoffset: 0}, {offset: 1, strokeDashoffset: 0}]]
  ];
  const svg = el.querySelector('svg');
  // Created once the SVG is in the document: Chrome drops animations made on detached nodes.
  let anims = null;
  const ensure = () => (anims ||= tracks.map(([sel, kf]) => svg.querySelector(sel).animate(kf, {duration: DUR, fill: 'both'})));
  const seek = ms => ensure().forEach(a => { a.pause(); a.currentTime = ms; });
  return {el, duration: Math.round(DUR),
    mount() { seek(DUR); },
    toggle(rate = 1) { ensure().forEach(a => { a.currentTime = 0; a.play(); }); return timed(anims, rate); },
    reset() { seek(DUR); }};
}

/* 2 · Rive #475 "animated checkbox": ring → fill overshoot (peak 167 ms) → settle
 * → dots (367–517) → check stroke (517–667); 833 ms on, 850 ms off. */
export function checkRive() {
  const dots = Array.from({length: 8}, (_, i) => { const a = i * Math.PI / 4; return `<circle cx="${(20 + Math.cos(a) * 17).toFixed(2)}" cy="${(20 + Math.sin(a) * 17).toFixed(2)}" r="1.9"/>`; }).join('');
  const el = html(`<button type="button" class="rec-check stage-btn" aria-pressed="false" aria-label="Marcar (recriação)"><svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g class="dots">${dots}</g><circle class="ring" cx="20" cy="20" r="11.5"/><circle class="fill" cx="20" cy="20" r="11.5"/><path class="path" d="M14.6 20.4l3.7 3.6 7.1-7.4" pathLength="1"/></svg></button>`);
  const svg = el.querySelector('svg');
  const [ring, fill, dotG, path] = ['.ring', '.fill', '.dots', '.path'].map(s => svg.querySelector(s));
  let on = false;
  function toggle(rate = 1) {
    on = !on;
    el.setAttribute('aria-pressed', String(on));
    svg.getAnimations({subtree: true}).forEach(a => a.cancel());
    const o = {duration: on ? 833 : 850, fill: 'both', easing: 'linear'};
    const anims = on ? [
      ring.animate([{opacity: 1, offset: 0}, {opacity: 1, offset: .12}, {opacity: 0, offset: .16}, {opacity: 0, offset: 1}], o),
      fill.animate([{transform: 'scale(0)', offset: 0}, {transform: 'scale(.42)', offset: .08}, {transform: 'scale(.94)', offset: .14}, {transform: 'scale(1.36)', offset: .2}, {transform: 'scale(1.16)', offset: .26}, {transform: 'scale(1)', offset: .32}, {transform: 'scale(.9)', offset: .38}, {transform: 'scale(.98)', offset: .44}, {transform: 'scale(1.06)', offset: .5}, {transform: 'scale(1)', offset: .56}, {transform: 'scale(1)', offset: 1}], o),
      dotG.animate([{opacity: 0, transform: 'scale(.82)', offset: 0}, {opacity: 0, transform: 'scale(.82)', offset: .41}, {opacity: 1, transform: 'scale(1)', offset: .44}, {opacity: 1, transform: 'scale(1.12)', offset: .56}, {opacity: .6, transform: 'scale(1.22)', offset: .68}, {opacity: 0, transform: 'scale(1.28)', offset: .8}, {opacity: 0, transform: 'scale(1.28)', offset: 1}], o),
      path.animate([{strokeDashoffset: 1, offset: 0}, {strokeDashoffset: 1, offset: .6}, {strokeDashoffset: .55, offset: .68}, {strokeDashoffset: .18, offset: .74}, {strokeDashoffset: 0, offset: .8}, {strokeDashoffset: 0, offset: 1}], o)
    ] : [
      path.animate([{strokeDashoffset: 0}, {strokeDashoffset: 1, offset: .3}, {strokeDashoffset: 1}], o),
      fill.animate([{transform: 'scale(1)'}, {transform: 'scale(1.12)', offset: .25}, {transform: 'scale(0)', offset: .62}, {transform: 'scale(0)'}], o),
      ring.animate([{opacity: 0}, {opacity: 0, offset: .5}, {opacity: 1, offset: .7}, {opacity: 0}], o)
    ];
    return timed(anims, rate);
  }
  return {el, duration: 833, toggle, reset() { on = false; el.setAttribute('aria-pressed', 'false'); svg.getAnimations({subtree: true}).forEach(a => a.cancel()); }};
}

/* 3 · Rive #17822 "play button": PressRelease in 117 ms, ease-out. */
export function playButton() {
  const el = html(`<button type="button" class="stage-btn" aria-label="Tocar (recriação)"><span class="rec-play"><span class="rec-play-btn"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 6.8v10.4l8.4-5.2z"/></svg></span></span></button>`);
  const knob = el.querySelector('.rec-play-btn');
  const up = '0 6px 14px #0006, inset 0 1px 0 #ffffff26', down = '0 2px 5px #0005, inset 0 2px 6px #0008';
  return {el, duration: 117,
    toggle(rate = 1) {
      knob.getAnimations().forEach(a => a.cancel());
      const a = knob.animate([{transform: 'scale(1)', boxShadow: up}, {transform: 'scale(.9)', boxShadow: down, offset: .5}, {transform: 'scale(1)', boxShadow: up}], {duration: 117, easing: 'ease-out'});
      return timed([a], rate);
    },
    reset() { knob.getAnimations().forEach(a => a.cancel()); }};
}

/* 4 · Rive #11874 "add to cart": the pill narrows to the icon (≈267 ms), the cart
 * runs with a trail (317–517 ms), then the new label returns; 683 ms. */
export function addToCart() {
  const el = html(`<button type="button" class="rec-cart" aria-pressed="false"><span class="label">Adicionar</span><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 4h2.4l2.2 10.6h10.2l2-7.6H6.6"/><circle cx="9.4" cy="19" r="1.5"/><circle cx="16.6" cy="19" r="1.5"/></svg><i class="trail" aria-hidden="true"></i><span class="done" aria-hidden="true">No carrinho</span></button>`);
  const [label, ico, trail, done] = ['.label', '.ico', '.trail', '.done'].map(s => el.querySelector(s));
  let on = false;
  function cancel() { [el, label, ico, trail, done].forEach(n => n.getAnimations().forEach(a => a.cancel())); }
  function toggle(rate = 1) {
    cancel();
    const before = el.getBoundingClientRect().width;
    on = !on;
    el.classList.toggle('is-added', on);
    el.setAttribute('aria-pressed', String(on));
    if (!on) return Promise.resolve(0);
    const after = el.getBoundingClientRect().width, round = el.getBoundingClientRect().height;
    const pad = getComputedStyle(el), tight = (round - 28) / 2 + 'px';
    const o = {duration: 683, fill: 'both', easing: 'linear'};
    const anims = [
      el.animate([{width: before + 'px', paddingLeft: pad.paddingLeft, paddingRight: pad.paddingRight, gap: pad.columnGap}, {width: round + 'px', paddingLeft: tight, paddingRight: tight, gap: '0px', offset: .39}, {width: round + 'px', paddingLeft: tight, paddingRight: tight, gap: '0px', offset: .76}, {width: after + 'px', paddingLeft: pad.paddingLeft, paddingRight: pad.paddingRight, gap: pad.columnGap}], {...o, easing: 'cubic-bezier(.4,0,.2,1)'}),
      label.animate([{opacity: 1, maxWidth: '180px'}, {opacity: 0, maxWidth: '0px', offset: .32}, {opacity: 0, maxWidth: '0px'}], o),
      ico.animate([{transform: 'translateX(0)'}, {transform: 'translateX(0)', offset: .46}, {transform: 'translateX(14px)', offset: .62}, {transform: 'translateX(-4px)', offset: .7}, {transform: 'translateX(0)', offset: .76}, {transform: 'translateX(0)'}], o),
      trail.animate([{opacity: 0, transform: 'scaleX(0)'}, {opacity: 0, transform: 'scaleX(0)', offset: .46}, {opacity: 1, transform: 'scaleX(1)', offset: .56}, {opacity: 0, transform: 'scaleX(.3)', offset: .74}, {opacity: 0}], o),
      done.animate([{opacity: 0, maxWidth: '0px'}, {opacity: 0, maxWidth: '0px', offset: .76}, {opacity: 1, maxWidth: '180px'}], o)
    ];
    return timed(anims, rate);
  }
  return {el, duration: 683, toggle, reset() { cancel(); on = false; el.classList.remove('is-added'); el.setAttribute('aria-pressed', 'false'); }};
}

/* 5 · Rive #9841 "card flip demo": 250 ms each way. Real rotateY with
 * perspective, height +10.6% at the middle and the face dimmed to ~50%. */
export function cardFlip() {
  const el = html(`<button type="button" class="rec-flip" aria-pressed="false" aria-label="Virar a carta (recriação)"><span class="rotor"><span class="face front"><i>K</i><b>K</b><i>K</i></span><span class="face back"></span><span class="shade"></span></span></button>`);
  const rotor = el.querySelector('.rotor'), shade = el.querySelector('.shade');
  let on = false;
  function toggle(rate = 1) {
    on = !on;
    el.setAttribute('aria-pressed', String(on));
    [rotor, shade].forEach(n => n.getAnimations().forEach(a => a.cancel()));
    const [a, b] = on ? [0, 180] : [180, 360];
    const o = {duration: 250, fill: 'forwards', easing: 'linear'};
    const anims = [
      rotor.animate([{transform: `rotateY(${a}deg) scaleY(1)`, easing: 'cubic-bezier(.45,0,.55,1)'}, {transform: `rotateY(${a + 90}deg) scaleY(1.106)`, offset: .53, easing: 'cubic-bezier(.45,0,.55,1)'}, {transform: `rotateY(${b}deg) scaleY(1)`}], o),
      shade.animate([{opacity: 0}, {opacity: .5, offset: .53}, {opacity: 0}], o)
    ];
    return timed(anims, rate);
  }
  return {el, duration: 250, toggle, reset() { [rotor, shade].forEach(n => n.getAnimations().forEach(a => a.cancel())); on = false; el.setAttribute('aria-pressed', 'false'); }};
}

/* Pair definitions: original (live) × recreation. `drive(ctrl, on)` acts on the
 * original's state machine the same way the recreation's button does. */
export const PAIRS = [
  {id: 'check-lottie', title: 'Check em duas fases', lottie: 'check-mark-success-h9SJbwh6ky', build: checkLottie,
    intro: 'Anel que se desenha, encolhe e volta; depois o disco enche, o check entra por traço e o realce assenta.',
    used: 'Estudo da política de segurança do site: o original precisa do runtime Lottie, a recriação não.',
    diffs: ['Mesmos quadros-chave e curvas do JSON original, transcritos à mão.', 'Sem runtime: 1 SVG de 80×80 e 6 animações WAAPI.']},
  {id: 'check-rive', title: 'Check com anel e pontos', rive: '475-903-animated-checkbox', artboard: 'checkbox', sm: 'State Machine 1', build: checkRive,
    drive: ctrl => ctrl.input('Tap')?.fire(), toggles: true,
    intro: 'Disco que enche com estouro grande, recua, solta pontos e só então desenha o check. Desmarcar faz o inverso.',
    used: 'Baralho recusado (20/10): células da matriz e ganchos do cartão Conteúdo.',
    diffs: ['Na recriação o estouro chega a 1,36× aos 167 ms; no original, ~1,4×.', 'Cores trocadas para o verde do portfólio; o original é azul.']},
  {id: 'play', title: 'Play que afunda', rive: '17822-33458-play-button', sm: 'button', build: playButton,
    drive: ctrl => ctrl.input('buttonListener')?.fire(),
    intro: 'Botão escuro e skeuomórfico que afunda e volta em 117 ms.',
    used: 'Baralho recusado (20/10): botão sobre as miniaturas de vídeo do cartão Conteúdo.',
    diffs: ['O original tem sombra com feathering vetorial; a recriação usa box-shadow, mais dura.', 'A recriação diminui para 0,9×; o original afunda com sombra interna e quase não muda de tamanho.']},
  {id: 'cart', title: 'Adicionar ao carrinho', rive: '11874-22660-add-to-cart', artboard: 'Artboard 2', sm: 'State Machine 1', build: addToCart,
    drive: (ctrl, on) => { const h = ctrl.input('isHover'), add = ctrl.input('Add'); if (h) h.value = on; if (add) add.value = on; }, toggles: true,
    intro: 'Pílula que vira ícone, carrinho que corre com rastro e marcas de parada, anel de pontos no Add.',
    used: 'Baralho recusado (20/10): botão do cartão E-commerce.',
    diffs: ['Diferença grande: no original a pílula se achata na VERTICAL até virar linha; a recriação encolhe na largura.', 'O anel de pontos do Add não foi recriado.', 'No original o efeito começa no hover; na recriação, no clique.']},
  {id: 'flip', title: 'Virar a carta', rive: '9841-18767-card-flip-demo', artboard: 'Interaction', sm: 'State Machine 1', build: cardFlip,
    drive: (ctrl, on) => { const f = ctrl.input('isFlipped'); if (f) f.value = on; }, toggles: true,
    intro: 'Virada de 250 ms: a carta estreita até 4 px no meio, cresce ~10% na altura e escurece até ~50%.',
    used: 'Medição para o cartão do baralho. Os cartões grandes do site usam 600/350 ms (padrão Abode).',
    diffs: ['O original é um achatamento 2D; a recriação usa rotação 3D real com perspectiva.', 'A arte do rei é do autor e não foi copiada: a recriação usa uma carta simples.']}
];
