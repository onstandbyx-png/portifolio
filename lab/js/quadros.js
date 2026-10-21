/* Quadros: one analysis card per element and per version, in the format of the
 * Lottie cards. The stage is the real version running same-origin in an iframe,
 * cropped to the element; the card measures it live (size, CSS/WAAPI animations,
 * script frames through the lab clock in /_lab/relogio.js) and drives it: play
 * and pause, repeat, speed, a scrubber over animation time or page scroll with a
 * frame readout, hover and click, and the notes from the catalog and the Drive.
 * Only a few cards are live at once; the others come back when scrolled to. */
import {FAMILIAS, PROJETOS, STATUS, caminhoDe, carregar, esc, localizar, localizarDetalhado} from './catalogo.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const html = markup => { const t = document.createElement('template'); t.innerHTML = markup.trim(); return t.content.firstElementChild; };
const ms = n => `${Math.round(n)} ms`;
const num = n => Math.round(n).toLocaleString('pt-BR');
const espera = t => new Promise(ok => setTimeout(ok, t));
const RATES = '<option value="1">1×</option><option value="0.5">0,5×</option><option value="0.25">0,25×</option><option value="2">2×</option>';
const TELAS = {1280: 800, 390: 844};
const QUADRO = 1000 / 60;
const PAGINA = 24;
const CELULAR = matchMedia('(max-width: 720px)').matches;
const MAX_VIVOS = CELULAR ? 2 : 4;
const TELA = CELULAR ? 390 : 1280;
const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const FAMILIA = Object.fromEntries(FAMILIAS);
const TIPOS_NOTA = [['especificacao', 'Especificação'], ['tempo', 'Tempos'], ['recriacao', 'Como recriar'], ['decisao', 'Decisões'], ['pendencia', 'Pendências'], ['problema', 'Problemas']];
const curto = (texto, n) => (texto.length > n ? `${texto.slice(0, n - 1)}…` : texto);
const rotuloVersao = v => `${v.data} · ${curto(v.rotulo, 26)}`;
const guardar = (chave, valor) => { try { if (valor == null) localStorage.removeItem(chave); else localStorage.setItem(chave, valor); } catch {} };
const lido = chave => { try { return localStorage.getItem(chave); } catch { return null; } };

/* Live budget: the most recently opened cards stay live, the oldest off-screen one goes. */
const vivos = [];
function ocupar(q) {
  const i = vivos.indexOf(q);
  if (i >= 0) vivos.splice(i, 1);
  vivos.push(q);
  while (vivos.length > MAX_VIVOS) {
    const sai = vivos.find(v => v !== q && !v.visivel && !v.fixo) || vivos.find(v => v !== q && !v.fixo) || vivos.find(v => v !== q);
    vivos.splice(vivos.indexOf(sai), 1);
    sai.desligar();
  }
}
function liberar(q) { const i = vivos.indexOf(q); if (i >= 0) vivos.splice(i, 1); }
const olho = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const q = entry.target.__quadro;
    if (!q) continue;
    q.visivel = entry.isIntersecting;
    // A card opened from a link stays live until it has been seen and then scrolled away.
    if (q.visivel) q.visto = true; else if (q.visto) q.fixo = false;
    clearTimeout(q.espera);
    if (q.visivel && !q.vivo) q.espera = setTimeout(() => { if (q.visivel) q.ligar(); }, 450);
  }
}, {rootMargin: '80px 0px'});

/* Stage: the iframe at a real screen size, scaled and cropped into the card. */
function palco(stage, titulo) {
  const view = html('<div class="q-view"></div>');
  stage.prepend(view);
  const p = {stage, frame: null, doc: null, win: null, tela: 1280};
  p.montar = (src, tela, pronto) => {
    p.desmontar();
    p.tela = tela;
    const frame = document.createElement('iframe');
    frame.title = titulo;
    frame.style.width = `${tela}px`;
    frame.style.height = `${TELAS[tela]}px`;
    frame.addEventListener('load', () => {
      try { p.doc = frame.contentDocument; p.win = frame.contentWindow; } catch { p.doc = p.win = null; }
      if (p.doc?.location.href !== 'about:blank') pronto();
    });
    frame.src = src;
    view.replaceChildren(frame);
    p.frame = frame;
  };
  p.desmontar = () => { p.frame?.remove(); p.frame = p.doc = p.win = null; };
  // Crop to the element (scrolling the page to it first unless told not to), or show the whole
  // screen. The crop window stays inside the page, so the stage shows the element's surroundings.
  p.enquadrar = (alvo, {seguir = true, margem = 16} = {}) => {
    if (!p.frame || !p.win) return null;
    const W = p.tela, H = TELAS[W], sw = stage.clientWidth, sh = stage.clientHeight;
    let x = 0, y = 0, w = W, h = H;
    if (alvo?.isConnected) {
      let r = alvo.getBoundingClientRect();
      if (seguir && (r.top < 0 || r.bottom > H)) {
        p.win.scrollTo({top: p.win.scrollY + r.top - Math.max(margem, (H - r.height) / 2), behavior: 'instant'});
        r = alvo.getBoundingClientRect();
      }
      w = Math.min(W, Math.max(Math.min(W, 360), r.width + 2 * margem));
      h = Math.min(H, Math.max(Math.min(H, 220), Math.min(r.height, H) + 2 * margem));
      x = r.left + r.width / 2 - w / 2;
      y = Math.max(r.top, 0) + Math.min(r.height, H) / 2 - h / 2;
    }
    const s = Math.min(sw / w, sh / h, 2), vw = sw / s, vh = sh / s;
    const cx = x + w / 2, cy = y + h / 2;
    const x0 = vw >= W ? (W - vw) / 2 : Math.min(Math.max(0, cx - vw / 2), W - vw);
    const y0 = vh >= H ? (H - vh) / 2 : Math.min(Math.max(0, cy - vh / 2), H - vh);
    p.frame.style.transform = `translate(${-x0 * s}px, ${-y0 * s}px) scale(${s})`;
    return {w, h, s};
  };
  return p;
}

function animacoes(raiz) { try { return raiz.getAnimations({subtree: true}); } catch { return []; } }
function fimDe(a) {
  const t = a.effect?.getComputedTiming?.();
  if (!t) return 0;
  return Number.isFinite(t.endTime) ? t.endTime : (t.delay || 0) + (Number(t.duration) || 0);
}
function descrever(a) {
  const t = a.effect?.getTiming?.() || {}, alvo = a.effect?.target;
  return {
    nome: a.animationName || a.transitionProperty || a.id || 'Web Animation',
    onde: alvo ? alvo.tagName.toLowerCase() + (alvo.classList?.[0] ? `.${alvo.classList[0]}` : '') : '',
    dur: Number(t.duration) || 0, atraso: t.delay || 0, rep: t.iterations, curva: t.easing || 'linear'
  };
}
function caminhoCss(n) {
  const partes = [];
  for (; n && n.nodeType === 1 && n.tagName !== 'HTML'; n = n.parentElement) {
    if (n.id && !/\d{4,}/.test(n.id)) { partes.unshift(`#${CSS.escape(n.id)}`); break; }
    const irmaos = n.parentElement ? [...n.parentElement.children].filter(c => c.tagName === n.tagName) : [];
    partes.unshift(n.tagName.toLowerCase() + (irmaos.length > 1 ? `:nth-of-type(${irmaos.indexOf(n) + 1})` : ''));
  }
  return partes.join(' > ');
}

/* CSS :hover cannot be forced from script, so hover rules are copied onto [data-lab-hover]
 * (with hover/pointer media queries flattened, so it also works on a phone). */
function regrasHover(rules, out) {
  for (const r of rules) {
    if (r.selectorText) { if (r.selectorText.includes(':hover')) out.push(r.cssText.replace(r.selectorText, r.selectorText.replace(/:hover/g, '[data-lab-hover]'))); continue; }
    if (!r.cssRules) continue;
    const dentro = [];
    regrasHover(r.cssRules, dentro);
    if (!dentro.length) continue;
    if (/hover|pointer/.test(r.media?.mediaText || r.conditionText || '')) out.push(...dentro);
    else out.push(`${r.cssText.slice(0, r.cssText.indexOf('{'))}{${dentro.join('')}}`);
  }
}
function pontoCentral(doc, alvo, H) {
  const r = alvo.getBoundingClientRect();
  const x = Math.min(Math.max(r.left + r.width / 2, 1), doc.documentElement.clientWidth - 1);
  const y = Math.min(Math.max(r.top + Math.min(r.height, H) / 2, 1), H - 1);
  return {x, y, no: doc.elementFromPoint(x, y) || alvo};
}
function eventos(no, nomes, x, y) {
  const win = no.ownerDocument.defaultView;
  for (const nome of nomes) {
    const Tipo = nome.startsWith('pointer') ? win.PointerEvent : win.MouseEvent;
    no.dispatchEvent(new Tipo(nome, {bubbles: !/enter|leave/.test(nome), cancelable: true, clientX: x, clientY: y, view: win, pointerType: 'mouse', isPrimary: true}));
  }
}
function simularHover(p, alvo, ligado) {
  const doc = p.doc;
  if (!doc || !alvo) return;
  if (!doc.getElementById('lab-hover')) {
    const out = [];
    for (const sheet of doc.styleSheets) { try { regrasHover(sheet.cssRules, out); } catch {} }
    const style = doc.createElement('style');
    style.id = 'lab-hover';
    style.textContent = out.join('\n');
    doc.head.append(style);
  }
  doc.querySelectorAll('[data-lab-hover]').forEach(n => n.removeAttribute('data-lab-hover'));
  const {x, y, no} = pontoCentral(doc, alvo, TELAS[p.tela]);
  if (ligado) {
    for (let n = no; n && n.nodeType === 1; n = n.parentElement) n.setAttribute('data-lab-hover', '');
    eventos(no, ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointermove', 'mousemove'], x, y);
  } else eventos(no, ['pointerout', 'pointerleave', 'mouseout', 'mouseleave'], x, y);
}
/* Recipe that brings an element to the state its card is about (menu open, dialog shown, frame
 * scrolled…): [{rolar: sel}, {clicar: sel}, {pairar: sel}, {rolarY: px}, {esperar: ms}]. */
async function executarReceita(p, passos = []) {
  for (const passo of passos) {
    if (!p.doc) return;
    const [acao, valor] = Object.entries(passo)[0] || [];
    let no = null;
    try { no = typeof valor === 'string' ? p.doc.querySelector(valor) : null; } catch {}
    if (acao === 'esperar') await espera(Math.min(Number(valor) || 300, 5000));
    else if (acao === 'rolarY') p.win.scrollTo({top: Number(valor) || 0, behavior: 'instant'});
    else if (acao === 'rolar' && no) no.scrollIntoView({block: 'center', behavior: 'instant'});
    else if (acao === 'clicar' && no) {
      no.scrollIntoView({block: 'center', behavior: 'instant'});
      const {x, y} = pontoCentral(p.doc, no, TELAS[p.tela]);
      eventos(no, ['pointerdown', 'mousedown', 'pointerup', 'mouseup'], x, y);
      no.click();
    } else if (acao === 'pairar' && no) {
      no.scrollIntoView({block: 'center', behavior: 'instant'});
      simularHover(p, no, true);
    }
    await espera(250);
  }
}
function isolar(doc, alvo, ligado) {
  doc.getElementById('lab-isolar')?.remove();
  doc.querySelectorAll('[data-lab-keep],[data-lab-root]').forEach(n => { n.removeAttribute('data-lab-keep'); n.removeAttribute('data-lab-root'); });
  if (!ligado || !alvo) return;
  alvo.setAttribute('data-lab-root', '');
  for (let n = alvo.parentElement; n && n !== doc.documentElement; n = n.parentElement) n.setAttribute('data-lab-keep', '');
  const style = doc.createElement('style');
  style.id = 'lab-isolar';
  style.textContent = 'body :not([data-lab-keep]):not([data-lab-root]):not([data-lab-root] *){display:none!important}[data-lab-root]{margin:24px auto!important}';
  doc.head.append(style);
}
function destacar(alvo) {
  if (!alvo) return;
  const antes = [alvo.style.outline, alvo.style.outlineOffset];
  alvo.style.outline = '3px solid #2F7A57';
  alvo.style.outlineOffset = '4px';
  setTimeout(() => { [alvo.style.outline, alvo.style.outlineOffset] = antes; }, 1600);
}

function notasHtml(notas, fontes) {
  if (!notas.length) return '';
  const fonte = n => { const f = fontes[n.fonte]; return f ? ` <a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(curto(f.titulo || 'fonte', 48))}${f.data ? `, ${esc(f.data)}` : ''} ↗</a>` : ''; };
  return TIPOS_NOTA.map(([tipo, titulo]) => {
    const lista = notas.filter(n => (n.tipo || 'especificacao') === tipo);
    return lista.length ? `<h4>${titulo} (Drive)</h4><ul class="q-notas">${lista.map(n => `<li>${esc(n.texto)}${n.tempos ? ` <code>${esc(n.tempos)}</code>` : ''}${fonte(n)}</li>`).join('')}</ul>` : '';
  }).join('');
}
// Reference videos the element was built from (private deploy only, under /_lab/referencias/).
function referenciasHtml(refs) {
  if (!refs.length) return '';
  return `<h4>Referência em vídeo</h4>${refs.map(r => `<figure class="q-ref"><video src="/_lab/referencias/${encodeURI(r.arquivo)}" controls muted playsinline loop preload="none"></video><figcaption>${esc(r.titulo)}${r.medida ? ` · ${esc(r.medida)}` : ''}${r.descricao ? `<br>${esc(r.descricao)}` : ''}</figcaption></figure>`).join('')}`;
}
/* Reuse package of an element in one version (private deploy only, under /_lab/reuso/<versao>/<id>.json):
 * probable source files at the version's commit, the piece's HTML, the CSS rules that apply to it,
 * resolved tokens, keyframes, fonts, assets and origin flags. Generated by lab-build/reuso. */
const reusos = new Map();
const pacoteDe = (versao, id) => {
  const k = `${versao}/${id}`;
  if (!reusos.has(k)) reusos.set(k, fetch(`/_lab/reuso/${encodeURIComponent(versao)}/${encodeURIComponent(id)}.json`).then(r => (r.ok ? r.json() : null)).catch(() => null));
  return reusos.get(k);
};
const tokensCss = t => (Object.keys(t || {}).length ? `:root {\n${Object.entries(t).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}` : '');
const cssDe = pk => [...(pk.fontFaces || []), tokensCss(pk.tokens), ...(pk.keyframes || []), pk.css || ''].filter(Boolean).join('\n\n');
// "Tudo junto" wraps the piece in what it inherited from its page (font, colour, backdrop), so it renders the same on its own.
const contextoDe = pk => Object.entries(pk.herdado || {}).map(([k, v]) => `${k}: ${v}`).join('; ');
const textoReuso = (pk, tipo) => (tipo === 'html' ? pk.html || '' : tipo === 'css' ? cssDe(pk) : tipo === 'tokens' ? tokensCss(pk.tokens)
  : `<style>\n${cssDe(pk)}\n</style>\n<div style="${contextoDe(pk).replace(/"/g, '&quot;')}">\n${pk.html || ''}\n</div>`);
function copiar(texto, botao) {
  const feito = ok => { const antes = botao.textContent; botao.textContent = ok ? 'Copiado' : 'Selecione e copie'; setTimeout(() => { botao.textContent = antes; }, 1600); };
  const reserva = () => { const t = Object.assign(document.createElement('textarea'), {value: texto}); document.body.append(t); t.select(); const ok = document.execCommand('copy'); t.remove(); feito(ok); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(texto).then(() => feito(true), reserva); else reserva();
}
function reusoHtml(pk, e) {
  if (!pk) return `<p class="hint">Ainda sem pacote de reuso para esta versão.${e.fonte ? ` Fonte no catálogo: <code>${esc(e.fonte)}</code>` : ''}</p>`;
  const f = pk.fontes || {};
  const link = a => (a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener"><code>${esc(a.arquivo)}:${a.linha}</code> ↗</a>` : `<code>${esc(a.arquivo)}:${a.linha}</code>`);
  const grupos = [['marcacao', 'Marcação'], ['estilo', 'Estilo'], ['comportamento', 'Comportamento']].filter(([k]) => f[k]?.length)
    .map(([k, t]) => `<li><span>${t}</span> ${f[k].map(link).join(' ')}</li>`).join('');
  const fontes = f.arquivos ? `<p>Protótipo do Drive${f.drive ? ` <code>${esc(f.drive)}</code>` : ''}: ${f.arquivos.map(link).join(' ') || 'nomes da peça não encontrados no arquivo'}</p>`
    : grupos ? `<p class="hint">Arquivos prováveis no commit <code>${esc(String(f.commit || '').slice(0, 7))}</code> de <code>${esc(f.repo || '')}</code>, pela busca dos nomes da peça (${esc((f.nomes || []).slice(0, 5).join(', '))}):</p><ul class="q-reuso-arq">${grupos}</ul>`
    : f.erro ? `<p class="hint">${esc(f.erro)}</p>` : '<p class="hint">Nenhum arquivo-fonte encontrado pelos nomes da peça.</p>';
  const resumo = pk.erro ? `<p class="hint">A peça não aparece na página sem interação (${esc(pk.erro)}), então não há HTML e CSS extraídos; os arquivos acima vêm do código.</p>`
    : `<p>${pk.regras} regras CSS, ${Object.keys(pk.tokens || {}).length} tokens, ${(pk.keyframes || []).length} animações${pk.familias?.length ? `, fontes ${esc(pk.familias.join(', '))}` : ''}${pk.ativos?.length ? `, ${pk.ativos.length} arquivos de imagem ou mídia` : ''}${pk.htmlCortado ? ' (HTML cortado em 120 KB)' : ''}.</p>
      <div class="q-reuso-acoes">${[['html', 'Copiar HTML'], ['css', 'Copiar CSS'], ['tokens', 'Copiar tokens'], ['tudo', 'Copiar tudo junto']].map(([k, t]) => `<button type="button" class="btn" data-q-copiar="${k}">${t}</button>`).join('')}
      <a class="btn" href="/_lab/reuso/${encodeURIComponent(pk.versao)}/${encodeURIComponent(pk.id)}.json" download="${esc(`${pk.id}--${pk.versao}.json`)}">Baixar pacote</a></div>`;
  const fid = pk.fidelidade;
  const fiel = !fid ? '' : typeof fid.igual === 'number'
    ? `<p>Fora da página, o pacote fica <strong>${String(fid.igual).replace('.', ',')}% igual</strong> à peça original (comparação pixel a pixel, animações paradas)${fid.igual < 85 ? '; a diferença costuma vir de conteúdo que só o script preenche ou de imagens de fundo da página' : ''}.</p>`
    : `<p class="hint">Conferência fora da página: ${esc(fid.erro)}.</p>`;
  return `<div class="meta">${(pk.marcas || []).map(m => `<span class="tag${m.tipo === 'origem' ? '' : ' tag--warn'}">${esc(m.texto)}</span>`).join('')}</div>${fontes}${resumo}${fiel}
    <p class="hint">Caminhos de imagens e fontes como no projeto original, a partir da raiz do site. O comportamento em JS não é extraído: está nos arquivos de comportamento.</p>`;
}

function temposHtml(anims) {
  if (!anims.length) return '<li><span>nenhuma animação CSS ou Web Animation ativa agora</span><span></span></li>';
  const vistos = new Set();
  return anims.map(descrever).filter(d => { const k = `${d.nome}|${d.onde}|${d.dur}|${d.atraso}`; if (vistos.has(k)) return false; vistos.add(k); return true; }).slice(0, 30)
    .map(d => `<li><span>${esc(d.nome)} <small>${esc(d.onde)}</small><br><small>${esc(d.curva)}${d.atraso ? ` · atraso ${ms(d.atraso)}` : ''}${d.rep === Infinity ? ' · sem fim' : d.rep > 1 ? ` · ${d.rep}×` : ''}</small></span><span>${ms(d.dur)}</span></li>`).join('');
}

/* Shared player for both card kinds: the live stage plus play/pause, repeat, speed and scrubber. */
function tocador(card, p, st, {aoMedir}) {
  const tocar = $('[data-q-tocar]', card), repetir = $('[data-q-repetir]', card), vel = $('[data-q-vel]', card);
  const scrub = $('.scrub', card), leitura = $('[data-q-leitura]', card);
  let loop = 0, inicio = 0, de = 0, relogioChip = 0;
  const relogio = () => p.win?.__labRelogio;
  const videos = fn => p.doc?.querySelectorAll('video').forEach(v => { try { fn(v); } catch {} });
  const intervalo = () => {
    const H = TELAS[p.tela], max = Math.max(0, (p.doc?.documentElement.scrollHeight || 0) - H);
    if (!st.alvo || st.tipo === 'versao') return [0, max];
    const r = st.alvo.getBoundingClientRect(), topo = r.top + p.win.scrollY;
    let a = Math.max(0, topo - H), b = Math.min(max, topo + r.height);
    if (b - a < 60) { a = Math.max(0, topo - H / 2); b = Math.min(max, a + H); }
    return [a, b];
  };
  const mostrar = () => {
    if (st.regua === 'tempo') {
      const t = Number(scrub.value) * QUADRO;
      leitura.textContent = st.total ? `quadro ${scrub.value} de ${scrub.max} · ${ms(t)}` : 'sem animação CSS aqui: use Rolagem, Passar o mouse ou Clicar';
    } else {
      const [a, b] = intervalo(), y = a + (b - a) * Number(scrub.value) / Math.max(1, Number(scrub.max));
      leitura.textContent = st.tipo === 'versao' ? `${aoMedir.secao?.(y) || ''}${num(y)} de ${num(b + TELAS[p.tela])} px` : `rolagem ${Math.round(Number(scrub.value) / Math.max(1, Number(scrub.max)) * 100)}% · ${num(y)} px`;
    }
  };
  const estado = on => { st.tocando = on; tocar.textContent = on ? 'Pausar' : 'Tocar'; };
  const parar = () => { cancelAnimationFrame(loop); loop = 0; };
  const pausar = () => {
    parar();
    estado(false);
    st.anims.forEach(a => { try { a.pause(); } catch {} });
    relogio()?.pause();
    videos(v => v.pause());
  };
  const aplicarVelocidade = () => {
    const r = Number(vel.value);
    relogio()?.setRate(r);
    st.anims.forEach(a => { try { a.playbackRate = r; } catch {} });
    videos(v => { v.playbackRate = r; });
  };
  const acompanhar = () => {
    parar();
    const passo = () => {
      if (!p.win) return;
      if (st.regua === 'tempo' && st.total) {
        const t = Math.max(0, ...st.anims.map(a => Number(a.currentTime) || 0));
        scrub.value = String(Math.round((t % (st.total + 1)) / QUADRO));
        mostrar();
        const finitas = st.anims.filter(a => fimDe(a) && a.effect?.getComputedTiming?.().endTime !== Infinity);
        if (finitas.length === st.anims.length && st.anims.every(a => a.playState === 'finished')) {
          if (repetir.checked) { st.anims.forEach(a => { a.currentTime = 0; a.play(); }); } else { estado(false); return; }
        }
      }
      loop = requestAnimationFrame(passo);
    };
    loop = requestAnimationFrame(passo);
  };
  const rolar = () => {
    parar();
    const [a, b] = intervalo(), max = Number(scrub.max) || 1;
    if (Number(scrub.value) >= max) scrub.value = '0';
    de = Number(scrub.value) / max;
    inicio = performance.now();
    const velocidade = (st.tipo === 'versao' ? 520 : 260) * Number(vel.value);
    const passo = now => {
      if (!p.win) return;
      const f = de + (now - inicio) * velocidade / 1000 / Math.max(1, b - a);
      if (f >= 1) {
        if (repetir.checked) { de = 0; inicio = now; } else { scrub.value = String(max); irPara(max); estado(false); return; }
      }
      scrub.value = String(Math.round(Math.min(1, f) * max));
      irPara(Number(scrub.value));
      loop = requestAnimationFrame(passo);
    };
    loop = requestAnimationFrame(passo);
  };
  const irPara = v => {
    if (!p.win) return;
    if (st.regua === 'tempo') {
      const t = v * QUADRO;
      st.anims.forEach(a => { try { a.pause(); a.currentTime = Math.min(t, fimDe(a) || t); } catch {} });
    } else {
      const [a, b] = intervalo();
      p.win.scrollTo({top: a + (b - a) * v / Math.max(1, Number(scrub.max)), behavior: 'instant'});
      if (st.tipo === 'elemento' && !st.pagina) p.enquadrar(st.alvo, {seguir: false});
    }
    mostrar();
  };
  const play = () => {
    estado(true);
    aplicarVelocidade();
    relogio()?.play();
    videos(v => v.play().catch(() => {}));
    if (st.regua === 'rolagem') return rolar();
    if (st.total) {
      const t = Math.max(0, ...st.anims.map(a => Number(a.currentTime) || 0));
      const recomecar = t >= st.total - QUADRO;
      st.anims.forEach(a => { try { if (recomecar) a.currentTime = 0; a.play(); } catch {} });
    }
    acompanhar();
  };
  const regua = () => {
    if (st.regua === 'tempo') {
      scrub.max = String(Math.max(0, Math.round(st.total / QUADRO)));
      scrub.disabled = !st.total;
    } else {
      scrub.max = '600';
      const [a, b] = intervalo();
      scrub.value = String(Math.round(Math.min(1, Math.max(0, (p.win.scrollY - a) / Math.max(1, b - a))) * 600));
      scrub.disabled = false;
    }
    mostrar();
  };

  tocar.addEventListener('click', () => { if (!p.win) return st.ligar(); if (st.tocando) pausar(); else play(); });
  vel.addEventListener('change', aplicarVelocidade);
  scrub.addEventListener('input', () => { parar(); if (st.tocando) { st.anims.forEach(a => { try { a.pause(); } catch {} }); estado(false); } irPara(Number(scrub.value)); });
  return {
    // Called after each load: measure, start in the page's own state (paused when motion is reduced).
    pronto() {
      aoMedir.medir();
      regua();
      if (reduzido()) pausar(); else { estado(true); acompanhar(); }
      clearInterval(relogioChip);
      relogioChip = setInterval(() => { if (!p.win) return clearInterval(relogioChip); if (st.visivel()) { aoMedir.medir(); if (st.tocando) aplicarVelocidade(); if (st.regua === 'tempo' && !st.tocando) regua(); } }, 1200);
    },
    regua, pausar, parar: () => { parar(); clearInterval(relogioChip); estado(false); }, mostrar
  };
}

function quadroElemento(e, ctx) {
  const versoes = e.versoes.filter(id => ctx.porId.has(id));
  const notas = ctx.contexto.elementos[e.id] || [];
  const refs = (ctx.contexto.referencias || []).filter(r => (r.elementos || []).includes(e.id));
  const card = html(`<article class="card q-card" id="q-${esc(e.id)}">
    <div class="stage q-stage"><span class="stage-msg">${versoes.length ? 'entra ao vivo quando chegar aqui' : 'sem versão viva deste elemento'}</span></div>
    <div><h3>${esc(e.nome)}</h3><p class="by">${esc(PROJETOS[e.projeto])} · ${esc(e.era || '')} · <a data-q-abrir target="_blank" rel="noopener">abrir na versão ↗</a></p></div>
    <div class="meta"><span class="tag${e.status === 'atual' ? ' tag--ok' : e.status === 'rejeitado' || e.status === 'removido' ? ' tag--warn' : ''}">${esc(STATUS[e.status] || e.status || '')}</span><span class="tag">${esc(FAMILIA[e.familia] || e.familia || '')}</span><span class="tag" data-q-medida>tamanho medido ao vivo</span><span class="tag" data-q-anim hidden></span>${notas.length ? `<span class="tag tag--ok">${notas.length} ${notas.length > 1 ? 'notas' : 'nota'} do Drive</span>` : ''}${refs.length ? `<span class="tag tag--ok">${refs.length > 1 ? `${refs.length} vídeos` : 'vídeo'} de referência</span>` : ''}</div>
    ${versoes.length > 6 ? `<label class="vs-field q-versao-sel">Versão <select data-q-versao-sel>${versoes.map((id, i) => `<option value="${esc(id)}"${i === versoes.length - 1 ? ' selected' : ''}>${esc(`${ctx.porId.get(id).data} · ${ctx.porId.get(id).rotulo}`)}</option>`).join('')}</select></label>`
      : versoes.length > 1 ? `<div class="seg-group q-versoes" role="group" aria-label="Versão">${versoes.map((id, i) => `<button type="button" class="seg" data-q-versao="${esc(id)}" title="${esc(ctx.porId.get(id).rotulo)}"${i === versoes.length - 1 ? ' aria-pressed="true"' : ''}>${esc(rotuloVersao(ctx.porId.get(id)))}</button>`).join('')}</div>` : ''}
    <div class="controls">
      <button type="button" class="btn btn--primary" data-q-tocar${versoes.length ? '' : ' disabled'}>Tocar</button>
      <label><input type="checkbox" data-q-repetir> Repetir</label>
      <label>Velocidade <select data-q-vel>${RATES}</select></label>
      <div class="seg-group" role="group" aria-label="Tela">${[1280, 390].map(w => `<button type="button" class="seg" data-q-tela="${w}"${w === TELA ? ' aria-pressed="true"' : ''}>${w === 1280 ? 'Computador' : 'Celular'}</button>`).join('')}</div>
    </div>
    <div class="controls q-acoes">
      <div class="seg-group" role="group" aria-label="O que a régua controla">${[['tempo', 'Régua: tempo'], ['rolagem', 'Régua: rolagem']].map(([id, t]) => `<button type="button" class="seg" data-q-regua="${id}">${t}</button>`).join('')}</div>
      <button type="button" class="btn" data-q-hover aria-pressed="false" disabled>Passar o mouse</button>
      <button type="button" class="btn" data-q-clicar disabled>Clicar</button>
      <button type="button" class="btn" data-q-entrar disabled>Repetir entrada</button>
      <button type="button" class="btn" data-q-isolar aria-pressed="false" disabled>Isolar</button>
      <button type="button" class="btn" data-q-pagina aria-pressed="false" disabled>Ver a tela toda</button>
      <button type="button" class="btn" data-q-escolher aria-pressed="false" disabled>Escolher no quadro</button>
      ${versoes.length > 1 ? '<button type="button" class="btn" data-q-comparar>Comparar versões</button>' : ''}
    </div>
    <input type="range" class="scrub" min="0" max="0" step="1" value="0" aria-label="Posição da régua" disabled>
    <p class="readout" data-q-leitura></p>
    <details data-q-detalhes><summary>O que mostra, tempos e como recriar</summary><div class="body">
      ${e.interacao ? `<h4>O que mostra</h4><p>${esc(e.interacao)}</p>` : ''}
      ${e.aprovacao ? `<h4>Histórico</h4><p>${esc(e.aprovacao)}</p>` : ''}
      <h4>Onde está</h4><p>${esc(e.tipo || '')}${e.seletor ? ` · <code>${esc(e.seletor)}</code>` : ''}${e.caminho ? ` · <code>${esc(e.caminho)}</code>` : ''}<br>${versoes.length ? versoes.map(id => esc(`${ctx.porId.get(id).data} · ${ctx.porId.get(id).rotulo}`)).join('<br>') : `sem versão viva${e.sem_versao_viva ? `: ${esc(e.sem_versao_viva)}` : ''}`}</p>
      <h4>Código para reaproveitar</h4><div class="q-reuso" data-q-reuso><p class="hint">carrega quando os detalhes abrem</p></div>
      <h4>Tempos medidos ao vivo</h4><ul class="times" data-q-tempos><li><span>aparecem quando o quadro está ao vivo</span><span></span></li></ul>
      ${referenciasHtml(refs)}
      ${notasHtml(notas, ctx.contexto.fontes)}
    </div></details>
  </article>`);
  const stage = $('.q-stage', card), p = palco(stage, e.nome);
  const st = {tipo: 'elemento', versao: versoes.at(-1), tela: TELA, regua: '', alvo: null, anims: [], total: 0, isolar: false, pagina: false, hover: false, escolhendo: false, tocando: false, visivel: () => q.visivel};
  const q = {card, visivel: false, vivo: false};
  card.__quadro = q;
  const msg = texto => { $('.stage-msg', stage)?.remove(); if (texto) stage.append(html(`<span class="stage-msg">${esc(texto)}</span>`)); };
  const chave = () => `lab:alvo:${e.id}:${st.versao}`;
  const src = () => `/v/${st.versao}/${encodeURI(caminhoDe(e, st.versao))}`;
  const acoes = () => $$('.q-acoes .btn:not([data-q-comparar])', card).forEach(b => { b.disabled = !p.win; });
  const protegida = () => ctx.porId.get(st.versao)?.protegida;

  const medidor = {
    medir() {
      if (!p.doc) return;
      const r = st.alvo?.getBoundingClientRect();
      $('[data-q-medida]', card).textContent = r ? `${num(r.width)}×${num(r.height)} px na tela ${st.tela}` : `tela ${st.tela}×${TELAS[st.tela]}`;
      st.anims = st.alvo ? animacoes(st.alvo) : [];
      st.total = Math.max(0, ...st.anims.map(fimDe));
      const fps = p.win.__labRelogio?.fps?.() || 0;
      const maior = Math.max(0, ...st.anims.map(a => Number(a.effect?.getTiming?.().duration) || 0));
      const chip = $('[data-q-anim]', card);
      const partes = [st.anims.length ? `${st.anims.length} ${st.anims.length > 1 ? 'animações' : 'animação'} CSS · maior ${ms(maior)}` : '', fps >= 5 ? `script ${fps} quadros/s` : ''].filter(Boolean);
      chip.hidden = !partes.length;
      chip.textContent = partes.join(' · ');
      const detalhes = $('[data-q-detalhes]', card);
      if (detalhes.open) $('[data-q-tempos]', card).innerHTML = temposHtml(st.anims);
    }
  };
  const player = tocador(card, p, st, {aoMedir: medidor});
  st.ligar = () => ligar();

  function escolherRegua(id) {
    st.regua = id;
    $$('[data-q-regua]', card).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.qRegua === id)));
    if (p.win) player.regua();
  }
  async function preparar() {
    const salvo = lido(chave());
    await espera(650);
    if (!p.doc) return;
    let alvo = null, metodo = salvo ? 'escolhido' : null;
    if (salvo) { try { alvo = p.doc.querySelector(salvo); } catch {} }
    await executarReceita(p, e.receitas?.[st.versao]);
    if (!p.doc) return;
    if (!alvo) ({no: alvo, metodo} = localizarDetalhado(p.doc, e, st.versao));
    st.alvo = alvo;
    st.metodo = metodo;
    isolar(p.doc, st.alvo, st.isolar);
    const caixa = p.enquadrar(st.pagina ? null : st.alvo);
    if (caixa && !stage.dataset.proporcao) {
      stage.dataset.proporcao = '1';
      stage.style.aspectRatio = String(Math.min(16 / 9, Math.max(3 / 4, caixa.w / caixa.h)));
      p.enquadrar(st.pagina ? null : st.alvo);
    }
    medidor.medir();
    if (!st.regua) escolherRegua(st.total ? 'tempo' : 'rolagem');
    player.pronto();
    acoes();
    const ausente = e.ausencias?.[st.versao], acao = e.receitas?.[st.versao] ? '' : e.acoes?.[st.versao];
    msg(ausente && !st.alvo ? `não está nesta versão: ${curto(ausente, 140)}`
      : !st.alvo ? 'não achei este elemento sozinho nesta versão: use Escolher no quadro'
      : protegida() ? 'a proteção da prévia escurece a página quando o quadro perde o foco: toque nele para ver'
      : st.metodo === 'secao' ? 'mostrando a seção onde ele fica, ainda sem recorte próprio'
      : e.demos?.[st.versao] === 'sistema' ? 'vale para a página toda: o recorte mostra um exemplo'
      : acao ? `para ver: ${curto(acao, 120)}` : '');
  }
  function ligar() {
    if (q.vivo || !st.versao) return;
    const irmao = e.mesmoRecorte?.[st.versao];
    if (irmao && !st.verMesmoAssim) {
      $('.stage-msg', stage)?.remove();
      stage.append(html(`<span class="stage-msg q-irmao">mesmo recorte do quadro <a href="#q-${esc(irmao)}">${esc(curto(ctx.elementos.find(x => x.id === irmao)?.nome || irmao, 60))}</a> · <button type="button" class="btn" data-q-ver>Ver mesmo assim</button></span>`));
      $('[data-q-ver]', stage).addEventListener('click', () => { st.verMesmoAssim = true; ligar(); });
      return;
    }
    q.vivo = true;
    ocupar(q);
    msg('carregando a versão…');
    $('[data-q-abrir]', card).href = src();
    p.montar(src(), st.tela, preparar);
  }
  q.ligar = ligar;
  q.desligar = () => {
    player.parar();
    p.desmontar();
    q.vivo = false;
    liberar(q);
    acoes();
    msg('saiu do ar para poupar o aparelho; volta ao vivo quando você chegar aqui');
  };
  const recarregar = () => { if (!q.vivo) return ligar(); player.parar(); msg('carregando a versão…'); p.montar(src(), st.tela, preparar); };

  $('[data-q-abrir]', card).href = st.versao ? src() : '#';
  $('[data-q-versao-sel]', card)?.addEventListener('change', event => {
    st.versao = event.target.value;
    $('[data-q-abrir]', card).href = src();
    mostrarReuso();
    if (q.vivo) recarregar(); else ligar();
  });
  card.addEventListener('click', event => {
    const b = event.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.qVersao) {
      st.versao = b.dataset.qVersao;
      $$('[data-q-versao]', card).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $('[data-q-abrir]', card).href = src();
      mostrarReuso();
      if (q.vivo) recarregar(); else ligar();
    } else if (b.dataset.qTela) {
      st.tela = Number(b.dataset.qTela);
      $$('[data-q-tela]', card).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      delete stage.dataset.proporcao;
      recarregar();
    } else if (b.dataset.qRegua) escolherRegua(b.dataset.qRegua);
    else if ('qHover' in b.dataset) {
      st.hover = !st.hover;
      b.setAttribute('aria-pressed', String(st.hover));
      simularHover(p, st.alvo || p.doc?.body, st.hover);
      setTimeout(() => medidor.medir(), 400);
    } else if ('qClicar' in b.dataset) {
      if (!p.doc) return;
      const {x, y, no} = pontoCentral(p.doc, st.alvo || p.doc.body, TELAS[st.tela]);
      eventos(no, ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'], x, y);
      setTimeout(() => { medidor.medir(); player.regua(); }, 400);
    } else if ('qEntrar' in b.dataset) recarregar();
    else if ('qIsolar' in b.dataset) {
      st.isolar = !st.isolar;
      b.setAttribute('aria-pressed', String(st.isolar));
      isolar(p.doc, st.alvo, st.isolar);
      setTimeout(() => p.enquadrar(st.pagina ? null : st.alvo), 60);
    } else if ('qPagina' in b.dataset) {
      st.pagina = !st.pagina;
      b.setAttribute('aria-pressed', String(st.pagina));
      p.enquadrar(st.pagina ? null : st.alvo);
      if (st.pagina) destacar(st.alvo);
    } else if ('qEscolher' in b.dataset) escolher(b);
    else if ('qComparar' in b.dataset) dispatchEvent(new CustomEvent('lab:comparar', {detail: {id: e.id}}));
  });
  const detalhes = $('[data-q-detalhes]', card);
  const mostrarReuso = () => {
    if (!detalhes.open || !st.versao) return;
    const versao = st.versao, caixa = $('[data-q-reuso]', card);
    pacoteDe(versao, e.id).then(pk => { if (st.versao === versao) { caixa.innerHTML = reusoHtml(pk, e); caixa.__pacote = pk; } });
  };
  detalhes.addEventListener('toggle', event => {
    if (!event.target.open) return;
    if (p.win) $('[data-q-tempos]', card).innerHTML = temposHtml(st.anims);
    mostrarReuso();
  });
  card.addEventListener('click', event => {
    const b = event.target.closest('[data-q-copiar]'), pk = $('[data-q-reuso]', card).__pacote;
    if (b && pk) copiar(textoReuso(pk, b.dataset.qCopiar), b);
  });
  new ResizeObserver(() => { if (p.win) p.enquadrar(st.pagina ? null : st.alvo, {seguir: false}); }).observe(stage);

  // Pick the element by hand inside the stage; remembered per element and version.
  function escolher(botao) {
    if (!p.doc) return;
    st.escolhendo = !st.escolhendo;
    botao.setAttribute('aria-pressed', String(st.escolhendo));
    card.classList.toggle('is-escolhendo', st.escolhendo);
    if (!st.escolhendo) return;
    st.pagina = true;
    p.enquadrar(null);
    msg('toque no elemento dentro do quadro');
    let marcado = null;
    const doc = p.doc;
    const sobre = ev => { if (marcado) marcado.style.outline = ''; marcado = ev.target; marcado.style.outline = '2px dashed #2F7A57'; };
    const pegar = ev => {
      ev.preventDefault();
      ev.stopPropagation();
      if (marcado) marcado.style.outline = '';
      doc.removeEventListener('mouseover', sobre, true);
      doc.removeEventListener('click', pegar, true);
      st.alvo = ev.target;
      guardar(chave(), caminhoCss(ev.target));
      st.escolhendo = false;
      st.pagina = false;
      botao.setAttribute('aria-pressed', 'false');
      $('[data-q-pagina]', card).setAttribute('aria-pressed', 'false');
      card.classList.remove('is-escolhendo');
      msg('');
      isolar(doc, st.alvo, st.isolar);
      p.enquadrar(st.alvo);
      medidor.medir();
      player.regua();
    };
    doc.addEventListener('mouseover', sobre, true);
    doc.addEventListener('click', pegar, true);
  }
  return q;
}

function quadroVersao(v, ctx) {
  const els = ctx.elementos.filter(e => e.versoes.includes(v.id));
  const notas = ctx.contexto.versoes[v.id] || [];
  const linha = (ctx.contexto.linha || []).filter(l => l.versao === v.id);
  const card = html(`<article class="card q-card q-card--versao" id="qv-${esc(v.id)}">
    <div class="stage q-stage"><span class="stage-msg">entra ao vivo quando chegar aqui</span></div>
    <div><h3>${esc(v.rotulo)}</h3><p class="by">${esc(PROJETOS[v.projeto])} · ${esc(v.data)} · <code>${esc(v.commit)}</code> · <a href="/v/${esc(v.id)}/" target="_blank" rel="noopener">abrir a versão ↗</a></p></div>
    <div class="meta"><span class="tag">${els.length} ${els.length === 1 ? 'elemento' : 'elementos'}</span><span class="tag" data-q-altura>altura medida ao vivo</span><span class="tag" data-q-anim hidden></span>${notas.length ? `<span class="tag tag--ok">${notas.length} ${notas.length > 1 ? 'notas' : 'nota'} do Drive</span>` : ''}</div>
    <div class="controls">
      <button type="button" class="btn btn--primary" data-q-tocar>Tocar</button>
      <label><input type="checkbox" data-q-repetir> Repetir</label>
      <label>Velocidade <select data-q-vel>${RATES}</select></label>
      <div class="seg-group" role="group" aria-label="Tela">${[1280, 390].map(w => `<button type="button" class="seg" data-q-tela="${w}"${w === TELA ? ' aria-pressed="true"' : ''}>${w === 1280 ? 'Computador' : 'Celular'}</button>`).join('')}</div>
    </div>
    <input type="range" class="scrub" min="0" max="600" step="1" value="0" aria-label="Posição na página" disabled>
    <p class="readout" data-q-leitura></p>
    ${els.length ? `<div class="q-els" aria-label="Ir até um elemento">${els.map(e => `<button type="button" class="tag q-el" data-q-ir="${esc(e.id)}">${esc(curto(e.nome, 42))}</button>`).join('')}</div>` : ''}
    <details><summary>O que mostra, tempos e como recriar</summary><div class="body">
      ${v.nota ? `<h4>Sobre esta versão</h4><p>${esc(v.nota)}</p>` : ''}
      <h4>Código</h4><p>commit <code>${esc(v.commit)}</code> · ${esc(v.data)}</p>
      ${linha.length ? `<h4>Linha do tempo (Drive)</h4><ul class="q-notas">${linha.map(l => `<li>${esc(l.data || '')} · ${esc(l.evento)}</li>`).join('')}</ul>` : ''}
      ${notasHtml(notas.map(n => ({tipo: n.tipo || 'especificacao', ...n})), ctx.contexto.fontes)}
      ${els.length ? `<h4>Elementos desta versão</h4><ul class="q-notas">${els.map(e => `<li><a href="#q-${esc(e.id)}">${esc(e.nome)}</a></li>`).join('')}</ul>` : ''}
    </div></details>
  </article>`);
  const stage = $('.q-stage', card), p = palco(stage, v.rotulo);
  const st = {tipo: 'versao', tela: TELA, regua: 'rolagem', alvo: null, anims: [], total: 0, pagina: true, tocando: false, visivel: () => q.visivel};
  const q = {card, visivel: false, vivo: false};
  card.__quadro = q;
  const msg = texto => { $('.stage-msg', stage)?.remove(); if (texto) stage.append(html(`<span class="stage-msg">${esc(texto)}</span>`)); };
  let secoes = [];
  const medidor = {
    medir() {
      if (!p.doc) return;
      const altura = p.doc.documentElement.scrollHeight;
      secoes = $$('main > section, body > section, main > div > section, section[id]', p.doc).filter((s, i, all) => !all.some(o => o !== s && o.contains(s)));
      $('[data-q-altura]', card).textContent = `altura ${num(altura)} px · ${secoes.length} ${secoes.length === 1 ? 'seção' : 'seções'} na tela ${st.tela}`;
      const fps = p.win.__labRelogio?.fps?.() || 0, css = p.doc.getAnimations().length;
      const chip = $('[data-q-anim]', card);
      chip.hidden = !(fps >= 5 || css);
      chip.textContent = [css ? `${css} ${css > 1 ? 'animações' : 'animação'} CSS agora` : '', fps >= 5 ? `script ${fps} quadros/s` : ''].filter(Boolean).join(' · ');
    },
    secao(y) {
      if (!secoes.length) return '';
      let i = 0;
      secoes.forEach((s, k) => { if (s.getBoundingClientRect().top + p.win.scrollY <= y + TELAS[st.tela] / 3) i = k; });
      return `seção ${i + 1} de ${secoes.length} · `;
    }
  };
  const player = tocador(card, p, st, {aoMedir: medidor});
  const preparar = async () => {
    await espera(500);
    if (!p.doc) return;
    stage.style.aspectRatio = st.tela === 1280 ? '16 / 10' : '3 / 4';
    p.enquadrar(null);
    player.pronto();
    msg(v.protegida ? 'a proteção da prévia escurece a página quando o quadro perde o foco: toque nele para ver' : '');
  };
  function ligar() {
    if (q.vivo) return;
    q.vivo = true;
    ocupar(q);
    msg('carregando a versão…');
    p.montar(`/v/${v.id}/`, st.tela, preparar);
  }
  st.ligar = ligar;
  q.ligar = ligar;
  q.desligar = () => { player.parar(); p.desmontar(); q.vivo = false; liberar(q); msg('saiu do ar para poupar o aparelho; volta ao vivo quando você chegar aqui'); };
  card.addEventListener('click', event => {
    const b = event.target.closest('button');
    if (!b) return;
    if (b.dataset.qTela) {
      st.tela = Number(b.dataset.qTela);
      $$('[data-q-tela]', card).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      player.parar();
      if (q.vivo) { msg('carregando a versão…'); p.montar(`/v/${v.id}/`, st.tela, preparar); } else ligar();
    } else if (b.dataset.qIr && p.doc) {
      const e = els.find(x => x.id === b.dataset.qIr), alvo = e && localizar(p.doc, e, v.id);
      if (!alvo) { b.classList.add('tag--warn'); b.title = 'não achei este elemento sozinho nesta versão'; return; }
      player.pausar();
      alvo.scrollIntoView({block: 'center', behavior: 'instant'});
      destacar(alvo);
      player.regua();
    }
  });
  new ResizeObserver(() => { if (p.win) p.enquadrar(null); }).observe(stage);
  return q;
}

export async function mountQuadros(root) {
  const ctx = await carregar();
  const elementos = ctx.elementos, versoes = ctx.versoes;
  const familias = FAMILIAS.filter(([id]) => id === 'todas' || elementos.some(e => e.familia === id));
  root.innerHTML = `
    <div class="q-bar">
      <div class="seg-group" role="group" aria-label="Tipo de quadro"><button type="button" class="seg" data-q-tipo="elementos" aria-pressed="true">Elementos <span class="count">${elementos.length}</span></button><button type="button" class="seg" data-q-tipo="versoes" aria-pressed="false">Versões <span class="count">${versoes.length}</span></button></div>
      <label class="vs-field">Projeto <select data-q-projeto><option value="todos">Todos</option>${Object.entries(PROJETOS).map(([id, t]) => `<option value="${id}">${t}</option>`).join('')}</select></label>
      <label class="vs-field">Versão <select data-q-fver></select></label>
      <label class="vs-field">Família <select data-q-familia>${familias.map(([id, t]) => `<option value="${id}">${t}</option>`).join('')}</select></label>
      <label class="vs-field">Situação <select data-q-status><option value="todas">Todas</option>${Object.entries(STATUS).map(([id, t]) => `<option value="${id}">${t}</option>`).join('')}</select></label>
      <label class="vs-field q-busca">Buscar <input type="search" data-q-busca placeholder="nome, seletor ou nota" autocomplete="off"></label>
    </div>
    <p class="note" data-q-contagem></p>
    <div class="grid q-grid" data-q-grid></div>
    <div class="q-mais"><button type="button" class="btn" data-q-mais hidden>Mostrar mais quadros</button></div>`;
  const grid = $('[data-q-grid]', root), mais = $('[data-q-mais]', root);
  const f = {tipo: 'elementos', projeto: $('[data-q-projeto]', root), versao: $('[data-q-fver]', root), familia: $('[data-q-familia]', root), status: $('[data-q-status]', root), busca: $('[data-q-busca]', root)};
  const feitos = new Map();
  let lista = [], mostrados = 0;

  const opcoesVersao = () => {
    const p = f.projeto.value;
    f.versao.innerHTML = `<option value="todas">Todas</option>${versoes.filter(v => p === 'todos' || v.projeto === p).map(v => `<option value="${v.id}">${esc(PROJETOS[v.projeto])} · ${esc(rotuloVersao(v))}</option>`).join('')}`;
  };
  const texto = e => `${e.nome} ${e.seletor || ''} ${e.tipo || ''} ${e.interacao || ''} ${(ctx.contexto.elementos[e.id] || []).map(n => n.texto).join(' ')}`.toLowerCase();
  function filtrar() {
    const p = f.projeto.value, ver = f.versao.value, fam = f.familia.value, sit = f.status.value, busca = f.busca.value.trim().toLowerCase();
    if (f.tipo === 'versoes') lista = versoes.filter(v => (p === 'todos' || v.projeto === p) && (ver === 'todas' || v.id === ver) && (!busca || `${v.rotulo} ${v.nota || ''} ${v.id}`.toLowerCase().includes(busca)));
    else lista = elementos.filter(e => (p === 'todos' || e.projeto === p) && (ver === 'todas' || e.versoes.includes(ver)) && (fam === 'todas' || e.familia === fam) && (sit === 'todas' || e.status === sit) && (!busca || texto(e).includes(busca)));
    [f.familia, f.status].forEach(s => { s.closest('label').hidden = f.tipo === 'versoes'; });
    grid.replaceChildren();
    mostrados = 0;
    vivos.slice().forEach(q => q.desligar());
    $('[data-q-contagem]', root).textContent = f.tipo === 'versoes' ? `${lista.length} ${lista.length === 1 ? 'versão' : 'versões'}` : `${lista.length} ${lista.length === 1 ? 'elemento' : 'elementos'} · ${lista.filter(e => e.versoes.some(id => ctx.porId.has(id))).length} com versão viva`;
    pagina();
  }
  function quadro(item) {
    const chave = `${f.tipo}:${item.id}`;
    if (!feitos.has(chave)) feitos.set(chave, f.tipo === 'versoes' ? quadroVersao(item, ctx) : quadroElemento(item, ctx));
    return feitos.get(chave);
  }
  function pagina(ate = mostrados + PAGINA) {
    const novos = lista.slice(mostrados, ate).map(quadro);
    novos.forEach(q => { grid.append(q.card); olho.observe(q.card); });
    mostrados = Math.min(lista.length, ate);
    mais.hidden = mostrados >= lista.length;
    mais.textContent = `Mostrar mais quadros (${lista.length - mostrados})`;
  }

  root.addEventListener('click', event => {
    const t = event.target.closest('[data-q-tipo]');
    if (t) {
      f.tipo = t.dataset.qTipo;
      $$('[data-q-tipo]', root).forEach(b => b.setAttribute('aria-pressed', String(b === t)));
      filtrar();
    }
  });
  mais.addEventListener('click', () => pagina());
  f.projeto.addEventListener('change', () => { opcoesVersao(); filtrar(); });
  [f.versao, f.familia, f.status].forEach(s => s.addEventListener('change', filtrar));
  let atraso = 0;
  f.busca.addEventListener('input', () => { clearTimeout(atraso); atraso = setTimeout(filtrar, 250); });

  opcoesVersao();
  filtrar();
  return {
    elementos: elementos.length, versoes: versoes.length,
    // Open one card from a link (#q-<element id> or #qv-<version id>), resetting the filters if needed.
    focar(alvo) {
      const versao = alvo.startsWith('qv-'), id = alvo.slice(versao ? 3 : 2);
      const tipo = versao ? 'versoes' : 'elementos';
      if (f.tipo !== tipo || !lista.some(i => i.id === id)) {
        f.tipo = tipo;
        $$('[data-q-tipo]', root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.qTipo === tipo)));
        f.projeto.value = 'todos'; opcoesVersao(); f.familia.value = 'todas'; f.status.value = 'todas'; f.busca.value = '';
        filtrar();
      }
      const i = lista.findIndex(x => x.id === id);
      if (i < 0) return;
      if (i >= mostrados) pagina(i + 1);
      const q = quadro(lista[i]);
      const ir = () => q.card.scrollIntoView({block: 'start', behavior: 'instant'});
      ir();
      q.visivel = true;
      q.fixo = true;
      q.visto = false;
      q.ligar();
      // Cards above settle their height while loading; land on the card again once they have.
      setTimeout(ir, 400);
      setTimeout(ir, 1500);
    }
  };
}
