/* Versões: every era of the portfolio (and the private smiile/Fatos versions
 * listed by the server) running live under /v/<id>/. The frames are same-origin,
 * so the lab can scroll to an element, highlight it, isolate it and line up the
 * same element across versions. */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

const FAMILIAS = [['todas', 'Todas'], ['cartoes', 'Cartões'], ['cracha', 'Crachá'], ['aparelhos', 'Aparelhos'], ['heroi', 'Heróis'],
  ['galeria-rolagem', 'Galeria e rolagem'], ['anuncio-post', 'Anúncios e posts'], ['formulario', 'Formulários'], ['navegacao', 'Navegação'],
  ['microinteracao', 'Microinterações'], ['marca', 'Marca'], ['secoes', 'Seções']];
const STATUS = {atual: 'atual', substituido: 'substituído', rejeitado: 'recusado', legado: 'legado', removido: 'removido', rascunho: 'rascunho'};
const PROJETOS = {portfolio: 'Portfólio', smiile: 'smiile', fatos: 'Fatos'};


/* Where an element lives inside a version: its own selector, then a quoted
 * phrase from its name found in the page text, then the section its name
 * points to (ids used across the portfolio, smiile and Fatos versions). */
const SECOES = [
  [/crach|badge/i, ['[data-portfolio-badges]', '[data-badge-stage]', '#hero']],
  [/sistema|pedido/i, ['#sistemas', '#pedidos']],
  [/categoria|o que podemos|frentes/i, ['#categorias']],
  [/como trabalho|processo|etapas/i, ['#como-trabalho', '#processo']],
  [/contato|formul|briefing|whatsapp|e-mail/i, ['#contato']],
  [/narrativa|casa costa|trilha|filme de rolagem/i, ['#trilhas', '#narrativa-visual']],
  [/laborat|campanha|peel|papel|storyboard|anúnc|ads\b|meta|tiktok/i, ['#laboratorio', '#campanhas']],
  [/editorial|iphone|ipad|macbook|aparelho|tríptico|hardware/i, ['#editorial', '#experiencias', '#estudio']],
  [/baralho|cartas?\b|cartões|deck|coleção/i, ['#colecao', '[data-fatos-deck]', '#trabalhos', '#categorias', '#criacoes', '#marcas']],
  [/galeria|trabalhos|repertório/i, ['#trabalhos']],
  [/experiên/i, ['#experiencias']],
  [/cap[ií]tulo.*v[ií]deo|mesa de dire|v[ií]deo/i, ['#cap-video']],
  [/celulares|app de trilhas|cap[ií]tulo apps/i, ['#cap-apps']],
  [/jogo|pixel/i, ['#cap-games']],
  [/\bcad\b|drone/i, ['#cap-cad']],
  [/pcb|placa/i, ['#cap-pcb']],
  [/agente/i, ['#cap-agents']],
  [/capacidade/i, ['#capacidades']],
  [/cria[çc][õo]es|projeto/i, ['#criacoes']],
  [/planos?\b|preço/i, ['#planos', '#plano', '#abrir-plano']],
  [/universo/i, ['#universo']],
  [/recurso/i, ['#recursos']],
  [/estúdio|estudio/i, ['#estudio']],
  [/marcas/i, ['#marcas']],
  [/escala|constela/i, ['#escala']],
  [/formatos/i, ['#formatos']],
  [/como funciona/i, ['#como-funciona']],
  [/her[oó]i|hero|vitrine/i, ['main > section:first-of-type', 'section']]
];
function localizar(doc, el) {
  const visivel = n => n && n.getBoundingClientRect().height > 0;
  const q = sel => { try { return doc.querySelector(sel.replace(/[.,;:]+$/, '')); } catch { return null; } };
  if (el.seletor) { const n = q(el.seletor); if (visivel(n)) return n; }
  const citado = el.nome.match(/[“"‘']([^”"’']{8,})[”"’']/);
  if (citado) {
    const alvo = citado[1].slice(0, 26).toLowerCase();
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (t.textContent.toLowerCase().includes(alvo) && visivel(t.parentElement)) return t.parentElement.closest('section, article, figure') || t.parentElement;
    }
  }
  const texto = `${el.nome} ${el.tipo || ''}`;
  for (const [rx, sels] of SECOES) {
    if (!rx.test(texto)) continue;
    for (const sel of sels) { const n = q(sel); if (visivel(n)) return n; }
  }
  return null;
}

export async function mountVersoes(root) {
  const [portfolio, servidor] = await Promise.all([
    fetch('/versoes/portfolio.json').then(r => r.json()),
    fetch('/versoes.json').then(r => r.json()).catch(() => ({versoes: [], privadas: []}))
  ]);
  const vivas = new Set(servidor.versoes.map(v => v.id));
  const versoes = [
    ...portfolio.eras.map(e => ({id: e.id, projeto: 'portfolio', data: e.date, rotulo: e.label, commit: e.commit.slice(0, 7)})),
    ...servidor.privadas.map(p => ({id: p.id, projeto: p.projeto, data: p.data, rotulo: p.rotulo, commit: (p.commit || '').slice(0, 7), nota: p.nota}))
  ].filter(v => vivas.has(v.id));
  const elementos = [
    ...portfolio.elementos.map(e => ({...e, projeto: 'portfolio'})),
    ...servidor.privadas.flatMap(p => (p.elementos || []).map(e => ({...e, projeto: p.projeto, versoes: e.versoes || [p.id]})))
  ];
  const porId = new Map(versoes.map(v => [v.id, v]));

  root.innerHTML = `
    <div class="vs-bar">
      <label class="vs-field">Projeto <select data-projeto>${['todos', ...Object.keys(PROJETOS)].map(p => `<option value="${p}">${p === 'todos' ? 'Todos' : PROJETOS[p]}</option>`).join('')}</select></label>
      <label class="vs-field">Versão <select data-versao></select></label>
      <div class="seg-group" role="group" aria-label="Largura">${[['390', '390'], ['768', '768'], ['1280', '1280'], ['', 'Cheia']].map(([w, t]) => `<button type="button" class="seg" data-vs-largura="${w}"${w === '' ? ' aria-pressed="true"' : ''}>${t}</button>`).join('')}</div>
      <a class="open" data-vs-abrir target="_blank" rel="noopener">Abrir em tela cheia ↗</a>
    </div>
    <div class="vs-familias" role="group" aria-label="Família de elementos">${FAMILIAS.map(([id, t], i) => `<button type="button" class="seg" data-familia="${id}"${i === 0 ? ' aria-pressed="true"' : ''}>${t}</button>`).join('')}</div>
    <div class="vs-layout">
      <aside class="vs-lista" aria-label="Elementos"><p class="note" data-vs-contagem></p><ul data-vs-elementos></ul></aside>
      <section class="vs-palco" aria-label="Versões ao vivo">
        <div class="vs-acoes" data-vs-acoes hidden>
          <p data-vs-titulo></p>
          <div class="controls"><button type="button" class="btn" data-vs-ir>Ir até o elemento</button><button type="button" class="btn" data-vs-isolar aria-pressed="false">Isolar</button><button type="button" class="btn" data-vs-comparar aria-pressed="false">Comparar versões</button></div>
        </div>
        <div class="vs-frames" data-vs-frames></div>
      </section>
    </div>`;

  const selProjeto = $('[data-projeto]', root), selVersao = $('[data-versao]', root), frames = $('[data-vs-frames]', root);
  let familia = 'todas', largura = '', atual = null, comparar = false, isolar = false;

  function listaVersoes() {
    const p = selProjeto.value;
    const lista = versoes.filter(v => p === 'todos' || v.projeto === p);
    selVersao.innerHTML = lista.map(v => `<option value="${v.id}">${esc(PROJETOS[v.projeto])} · ${esc(v.data)} · ${esc(v.rotulo)}</option>`).join('');
  }
  function listaElementos() {
    const p = selProjeto.value;
    const lista = elementos.filter(e => (p === 'todos' || e.projeto === p) && (familia === 'todas' || e.familia === familia));
    $('[data-vs-contagem]', root).textContent = `${lista.length} elementos · ${lista.filter(e => e.versoes.some(id => porId.has(id))).length} com versão viva`;
    $('[data-vs-elementos]', root).innerHTML = lista.map(e => {
      const vivas = e.versoes.filter(id => porId.has(id));
      return `<li><button type="button" class="vs-el${atual?.id === e.id ? ' is-on' : ''}" data-el="${esc(e.id)}"${vivas.length ? '' : ' disabled'}>
        <b>${esc(e.nome)}</b><span>${esc(PROJETOS[e.projeto])} · ${esc(e.era)} · ${esc(STATUS[e.status] || e.status || '')}${vivas.length ? ` · ${vivas.length} ${vivas.length > 1 ? 'versões' : 'versão'}` : ' · sem versão viva'}</span></button></li>`;
    }).join('');
  }

  function frame(id, foco) {
    const v = porId.get(id);
    const wrap = document.createElement('figure');
    wrap.className = 'vs-frame';
    wrap.innerHTML = `<figcaption><b>${esc(PROJETOS[v.projeto])} · ${esc(v.data)}</b> ${esc(v.rotulo)} <code>${esc(v.commit)}</code></figcaption><div class="vs-viewport"><iframe title="${esc(v.rotulo)}" src="/v/${id}/${foco?.caminho ? encodeURI(foco.caminho) : ''}"></iframe></div>`;
    const iframe = wrap.querySelector('iframe');
    iframe.style.width = largura ? `${largura}px` : '100%';
    iframe.addEventListener('load', () => { if (foco) setTimeout(() => focar(iframe, foco), 600); });
    return wrap;
  }

  function focar(iframe, el) {
    let doc;
    try { doc = iframe.contentDocument; } catch { return; }
    if (!doc || !el) return;
    const alvo = localizar(doc, el);
    const aviso = iframe.closest('.vs-frame')?.querySelector('figcaption');
    aviso?.querySelector('.vs-aviso')?.remove();
    if (!alvo) { aviso?.insertAdjacentHTML('beforeend', ' <span class="vs-aviso">· não achei o elemento nesta versão; role a página</span>'); return; }
    alvo.scrollIntoView({block: 'center', behavior: 'instant'});
    alvo.style.outline = '3px solid #2F7A57';
    alvo.style.outlineOffset = '4px';
    setTimeout(() => { alvo.style.outline = ''; alvo.style.outlineOffset = ''; }, 2200);
    aplicarIsolar(doc, alvo);
  }

  function aplicarIsolar(doc, alvo) {
    doc.getElementById('lab-isolar')?.remove();
    doc.querySelectorAll('[data-lab-keep],[data-lab-root]').forEach(n => { n.removeAttribute('data-lab-keep'); n.removeAttribute('data-lab-root'); });
    if (!isolar || !alvo) return;
    alvo.setAttribute('data-lab-root', '');
    for (let n = alvo.parentElement; n && n !== doc.documentElement; n = n.parentElement) n.setAttribute('data-lab-keep', '');
    const style = doc.createElement('style');
    style.id = 'lab-isolar';
    style.textContent = 'body :not([data-lab-keep]):not([data-lab-root]):not([data-lab-root] *){display:none!important}[data-lab-root]{margin:24px auto!important}';
    doc.head.append(style);
  }

  function mostrar() {
    frames.replaceChildren();
    const ids = atual ? atual.versoes.filter(id => porId.has(id)) : [selVersao.value];
    const lista = comparar ? ids : [atual && ids.includes(selVersao.value) ? selVersao.value : ids[0]];
    frames.classList.toggle('is-comparar', comparar && lista.length > 1);
    lista.filter(Boolean).forEach(id => frames.append(frame(id, atual)));
    const id = lista[0];
    $('[data-vs-abrir]', root).href = id ? `/v/${id}/` : '#';
    $('[data-vs-acoes]', root).hidden = !atual;
    if (atual) $('[data-vs-titulo]', root).innerHTML = `<b>${esc(atual.nome)}</b> — ${esc(atual.interacao || '')}`;
    $('[data-vs-ir]', root).disabled = !atual;
    $('[data-vs-isolar]', root).disabled = !atual;
  }

  selProjeto.addEventListener('change', () => { listaVersoes(); listaElementos(); atual = null; mostrar(); });
  selVersao.addEventListener('change', () => { if (atual && !atual.versoes.includes(selVersao.value)) atual = null; mostrar(); listaElementos(); });
  root.addEventListener('click', event => {
    const fam = event.target.closest('[data-familia]');
    if (fam) {
      familia = fam.dataset.familia;
      root.querySelectorAll('[data-familia]').forEach(b => b.setAttribute('aria-pressed', String(b === fam)));
      listaElementos();
      return;
    }
    const w = event.target.closest('[data-vs-largura]');
    if (w) {
      largura = w.dataset.vsLargura;
      root.querySelectorAll('[data-vs-largura]').forEach(b => b.setAttribute('aria-pressed', String(b === w)));
      frames.querySelectorAll('iframe').forEach(f => { f.style.width = largura ? `${largura}px` : '100%'; });
      return;
    }
    const el = event.target.closest('[data-el]');
    if (el) {
      atual = elementos.find(e => e.id === el.dataset.el);
      const primeira = atual.versoes.find(id => porId.has(id));
      if (primeira) { selProjeto.value = selProjeto.value === 'todos' ? 'todos' : atual.projeto; listaVersoes(); selVersao.value = primeira; }
      listaElementos();
      mostrar();
      frames.scrollIntoView({block: 'start', behavior: 'smooth'});
      return;
    }
    if (event.target.closest('[data-vs-ir]')) frames.querySelectorAll('iframe').forEach(f => focar(f, atual));
    if (event.target.closest('[data-vs-isolar]')) {
      isolar = !isolar;
      event.target.closest('[data-vs-isolar]').setAttribute('aria-pressed', String(isolar));
      frames.querySelectorAll('iframe').forEach(f => focar(f, atual));
    }
    if (event.target.closest('[data-vs-comparar]')) {
      comparar = !comparar;
      event.target.closest('[data-vs-comparar]').setAttribute('aria-pressed', String(comparar));
      mostrar();
    }
  });

  listaVersoes();
  listaElementos();
  mostrar();
  return {versoes: versoes.length, elementos: elementos.length};
}
