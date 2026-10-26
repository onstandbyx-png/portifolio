/* Menu no modelo Landing Planes (smiile, commit cc19ed2, ShaderNavigation.tsx) sem React.
   O cabeçalho é recriação independente da demonstração pública Planes Shader Nav; não há código do Planes Pro.
   Aqui ficam o painel Trabalhos (hover com intenção, clique, teclado, fechamento por fora e por foco),
   a paleta que segue o link apontado e o shader líquido original em WebGL. O menu móvel em si
   (botão #menu-toggle, nav#mobile-nav, foco e bloqueio da página) continua com portfolio.js. */
const header = document.getElementById('site-header');
const panel = header?.querySelector('.sn-dropdown');
const palettes = {
  create: [[0.96, 0.64, 0.43], [0.64, 0.21, 0.37], [0.19, 0.07, 0.21]],
  discover: [[0.78, 0.61, 0.97], [0.44, 0.23, 0.68], [0.12, 0.07, 0.2]],
  research: [[0.66, 0.76, 0.66], [0.24, 0.44, 0.37], [0.06, 0.16, 0.15]],
  site: [[0.83, 0.7, 0.55], [0.48, 0.32, 0.23], [0.13, 0.09, 0.08]],
  slides: [[0.9, 0.66, 0.42], [0.68, 0.33, 0.3], [0.21, 0.1, 0.15]],
  image: [[0.86, 0.69, 0.97], [0.67, 0.3, 0.55], [0.21, 0.08, 0.25]],
  video: [[0.94, 0.62, 0.31], [0.65, 0.2, 0.23], [0.21, 0.05, 0.16]],
  voice: [[0.89, 0.66, 0.82], [0.62, 0.29, 0.41], [0.22, 0.09, 0.2]],
};
const vertex = 'attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}';
const fragment = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform float u_aspect;
uniform vec3 u_light;
uniform vec3 u_mid;
uniform vec3 u_dark;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.02+vec2(7.2,2.8);a*=.5;}return v;}
void main(){
 vec2 p=vec2(v_uv.x*u_aspect,v_uv.y)*2.7;
 float t=u_time*.13;
 vec2 q=vec2(fbm(p+t*.6),fbm(p+vec2(4.5,2.8)-t*.4));
 vec2 r=vec2(fbm(p+3.7*q+vec2(1.7,9.2)+t*.5),fbm(p+4.2*q+vec2(8.3,2.8)-t*.35));
 float f=fbm(p+4.9*r);
 float fold=pow(abs(sin((f*2.4+r.x*.6)*6.28)),2.7);
 vec3 color=mix(u_dark,u_mid,smoothstep(.05,.8,f+v_uv.y*.25));
 color=mix(color,u_light,smoothstep(.42,.97,f*.6+fold*.54+v_uv.y*.3));
 color*=.76+.24*smoothstep(-.1,.8,v_uv.y);
 color+=vec3(hash(gl_FragCoord.xy)*.017);
 gl_FragColor=vec4(color,1.);
}`;

/* Shader líquido pequeno e original: desenha um quadro só quando pausado ou com movimento reduzido.
   Sem WebGL (ou com o contexto perdido) o canvas fica transparente e o degradê CSS com as mesmas três cores aparece. */
function createLiquid(canvas, palette) {
  let gl = null;
  try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); } catch { return null; }
  if (!gl) return null;
  const context = gl;
  const compile = (type, source) => {
    const shader = context.createShader(type);
    if (!shader) return null;
    context.shaderSource(shader, source);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) { context.deleteShader(shader); return null; }
    return shader;
  };
  const vs = compile(context.VERTEX_SHADER, vertex), fs = compile(context.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) { if (vs) context.deleteShader(vs); if (fs) context.deleteShader(fs); return null; }
  const program = context.createProgram();
  if (!program) { context.deleteShader(vs); context.deleteShader(fs); return null; }
  context.attachShader(program, vs);
  context.attachShader(program, fs);
  context.linkProgram(program);
  if (!context.getProgramParameter(program, context.LINK_STATUS)) { context.deleteProgram(program); context.deleteShader(vs); context.deleteShader(fs); return null; }
  context.useProgram(program);
  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), context.STATIC_DRAW);
  const position = context.getAttribLocation(program, 'a_position');
  context.enableVertexAttribArray(position);
  context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
  const time = context.getUniformLocation(program, 'u_time'), aspect = context.getUniformLocation(program, 'u_aspect');
  const colorLocations = ['u_light', 'u_mid', 'u_dark'].map(name => context.getUniformLocation(program, name));
  let target = palette.map(color => [...color]), current = palette.map(color => [...color]);
  let raf = 0, last = 0, elapsed = 2, inside = false, lost = false, paused = false;
  const render = now => {
    raf = 0;
    if (lost) return;
    const animate = !paused && inside && document.visibilityState !== 'hidden';
    const delta = last ? Math.min((now - last) / 1000, 0.06) : 0;
    last = animate ? now : 0;
    if (animate) elapsed += delta;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(canvas.clientWidth * scale)), height = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; context.viewport(0, 0, width, height); }
    context.uniform1f(time, elapsed);
    context.uniform1f(aspect, width / height);
    current = current.map((color, i) => color.map((n, j) => animate ? n + (target[i][j] - n) * 0.075 : target[i][j]));
    colorLocations.forEach((location, i) => context.uniform3fv(location, current[i]));
    context.drawArrays(context.TRIANGLES, 0, 6);
    canvas.dataset.ready = 'true';
    if (animate) raf = requestAnimationFrame(render);
  };
  const requestDraw = () => { if (!raf && !lost) raf = requestAnimationFrame(render); };
  new IntersectionObserver(entries => { inside = entries.some(entry => entry.isIntersecting); if (inside) requestDraw(); }).observe(canvas);
  new ResizeObserver(requestDraw).observe(canvas);
  document.addEventListener('visibilitychange', () => { last = 0; if (document.visibilityState !== 'hidden') requestDraw(); });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0; delete canvas.dataset.ready; });
  requestDraw();
  return {
    setPalette(colors) { target = colors.map(color => [...color]); requestDraw(); },
    setPaused(value) { paused = value; requestDraw(); },
  };
}

if (header && panel) {
  const $$ = (selector, root = header) => [...root.querySelectorAll(selector)];
  const mobileNav = document.getElementById('mobile-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const triggers = $$('[data-sn-trigger]');
  const mobileTrigger = triggers.find(trigger => mobileNav?.contains(trigger)) || null;
  const desktopTrigger = triggers.find(trigger => trigger !== mobileTrigger) || triggers[0];
  const plainLinks = $$('.sn-nav > a');
  const featured = panel.querySelector('.sn-featured');
  const layout = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduced.matches || document.body.classList.contains('is-paused');
  const menuOpen = () => menuToggle?.getAttribute('aria-expanded') === 'true';
  const firstLink = () => panel.querySelector('.sn-panel-links a, .sn-panel-links button');
  let open = false, openedByHover = false, closeTimer = 0, hoverTimer = 0, hideTimer = 0;

  const liquidCanvas = panel.querySelector('.sn-liquid');
  const liquid = liquidCanvas ? createLiquid(liquidCanvas, palettes.create) : null;
  function setPalette(key) {
    const colors = palettes[key] || palettes.create;
    if (featured) ['--sn-light', '--sn-mid', '--sn-dark'].forEach((name, i) => featured.style.setProperty(name, `rgb(${colors[i].map(n => Math.round(n * 255)).join(' ')})`));
    liquid?.setPalette(colors);
  }

  const clearClose = () => { clearTimeout(closeTimer); closeTimer = 0; };
  const clearHover = () => { clearTimeout(hoverTimer); hoverTimer = 0; };
  // No celular o painel vive dentro do nav móvel, logo abaixo do seu item; no desktop, abaixo da barra.
  function place() {
    if (layout.matches && mobileTrigger) mobileTrigger.after(panel); else header.append(panel);
  }
  function syncTriggers() {
    triggers.forEach(trigger => { trigger.setAttribute('aria-expanded', String(open)); trigger.classList.toggle('is-active', open); });
  }
  function show(hover = false, focusFirst = false) {
    clearClose(); clearHover();
    openedByHover = hover;
    setPalette('create');
    if (!open) {
      open = true;
      clearTimeout(hideTimer);
      panel.classList.remove('is-leaving');
      panel.classList.toggle('is-still', still());
      panel.hidden = false;
      void panel.offsetWidth;
      panel.classList.add('is-open');
      syncTriggers();
    }
    if (focusFirst) firstLink()?.focus();
  }
  function hide() {
    clearClose(); clearHover();
    openedByHover = false;
    if (!open) return;
    open = false;
    syncTriggers();
    const instant = still();
    panel.classList.toggle('is-still', instant);
    panel.classList.remove('is-open');
    panel.classList.add('is-leaving');
    const finish = () => { panel.classList.remove('is-leaving'); panel.hidden = true; };
    clearTimeout(hideTimer);
    if (instant) finish(); else hideTimer = setTimeout(finish, 150);
  }
  function hover() {
    if (layout.matches) return;
    clearClose(); clearHover();
    hoverTimer = setTimeout(() => show(true), 100);
  }
  function toggle() {
    clearHover();
    if (open && !openedByHover) hide(); else show(false);
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hover(); });
    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (open) firstLink()?.focus(); else show(false, true);
    });
  });
  plainLinks.forEach(link => link.addEventListener('pointerenter', () => { clearHover(); if (!layout.matches) hide(); }));
  header.addEventListener('pointerenter', clearClose);
  header.addEventListener('pointerleave', event => {
    clearHover();
    if (event.pointerType === 'mouse' && !menuOpen() && openedByHover && !header.contains(document.activeElement)) {
      clearClose();
      closeTimer = setTimeout(hide, 180);
    }
  });
  header.addEventListener('focusout', event => {
    if (open && event.relatedTarget && !header.contains(event.relatedTarget)) hide();
  });
  document.addEventListener('pointerdown', event => { if (open && !header.contains(event.target)) hide(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !open) return;
    event.preventDefault();
    const trigger = layout.matches && mobileTrigger ? mobileTrigger : desktopTrigger;
    hide();
    // Com o menu móvel aberto, portfolio.js fecha o menu e devolve o foco ao botão do menu.
    if (!menuOpen()) trigger?.focus();
  });
  panel.querySelectorAll('.sn-link').forEach(link => {
    const key = link.dataset.palette;
    link.addEventListener('pointerenter', () => setPalette(key));
    link.addEventListener('focus', () => setPalette(key));
  });
  panel.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    hide();
    // Um link do painel dentro do menu móvel também fecha o menu (portfolio.js só conhece os links presentes ao carregar).
    if (layout.matches && menuOpen()) menuToggle.click();
  });
  layout.addEventListener('change', () => {
    hide();
    place();
    if (!layout.matches && menuOpen()) menuToggle.click();
  });

  const syncStill = () => { const paused = still(); liquid?.setPaused(paused); panel.classList.toggle('is-still', paused); };
  new MutationObserver(syncStill).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', syncStill);

  // O item Trabalhos marca a seção atual como os links simples (interactions.js cuida de Serviços e Contato).
  const groups = [...document.querySelectorAll('main [data-nav-group="trabalhos"]')];
  if (groups.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const mark = () => {
      const other = plainLinks.some(link => link.hasAttribute('aria-current'));
      triggers.forEach(trigger => trigger.toggleAttribute('data-current', seen.size > 0 && !other));
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) entry.isIntersecting ? seen.add(entry.target) : seen.delete(entry.target);
      mark();
    }, { rootMargin: '0px 0px -65% 0px' });
    groups.forEach(section => observer.observe(section));
    plainLinks.forEach(link => new MutationObserver(mark).observe(link, { attributes: true, attributeFilter: ['aria-current'] }));
  }

  place();
  setPalette('create');
  syncStill();
}
