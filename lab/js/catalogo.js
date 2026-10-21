/* Shared catalog for the Versões tab and the Quadros: every live version (portfolio
 * eras plus the private smiile/Fatos versions the deploy lists), every cataloged
 * element, the private Drive context when the deploy carries it, and the rule that
 * finds an element inside a version page. */
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export const FAMILIAS = [['todas', 'Todas'], ['cartoes', 'Cartões'], ['cracha', 'Crachá'], ['aparelhos', 'Aparelhos'], ['heroi', 'Heróis'],
  ['galeria-rolagem', 'Galeria e rolagem'], ['anuncio-post', 'Anúncios e posts'], ['formulario', 'Formulários'], ['navegacao', 'Navegação'],
  ['microinteracao', 'Microinterações'], ['marca', 'Marca'], ['secoes', 'Seções']];
export const STATUS = {atual: 'atual', substituido: 'substituído', rejeitado: 'recusado', legado: 'legado', removido: 'removido', rascunho: 'rascunho'};
export const PROJETOS = {portfolio: 'Portfólio', smiile: 'smiile', fatos: 'Fatos', outros: 'Outros (Claude)'};

const VAZIO = {elementos: {}, versoes: {}, fontes: {}, linha: [], naoImplementados: [], referencias: []};
let cache = null;
export function carregar() {
  cache ||= Promise.all([
    fetch('/versoes/portfolio.json').then(r => r.json()),
    fetch('/versoes.json').then(r => r.json()).catch(() => ({versoes: [], privadas: []})),
    fetch('/contexto.json').then(r => (r.ok ? r.json() : null)).catch(() => null)
  ]).then(([portfolio, servidor, contexto]) => {
    const vivas = new Set(servidor.versoes.map(v => v.id));
    const versoes = [
      ...portfolio.eras.map(e => ({id: e.id, projeto: 'portfolio', data: e.date, rotulo: e.label, commit: e.commit.slice(0, 7)})),
      ...servidor.privadas.map(p => ({id: p.id, projeto: p.projeto, data: p.data, rotulo: p.rotulo, commit: (p.commit || '').slice(0, 7), nota: p.nota, protegida: Boolean(p.protegida)}))
    ].filter(v => vivas.has(v.id));
    const elementos = [
      ...portfolio.elementos.map(e => ({...e, projeto: 'portfolio'})),
      ...servidor.privadas.flatMap(p => (p.elementos || []).map(e => ({...e, projeto: p.projeto, versoes: e.versoes || [p.id]})))
    ];
    return {versoes, elementos, porId: new Map(versoes.map(v => [v.id, v])), contexto: {...VAZIO, ...(contexto || {})}};
  });
  return cache;
}

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
// Page of a version where the element lives (some live on inner pages, per version).
export const caminhoDe = (el, versao) => el?.caminhos?.[versao] ?? el?.caminho ?? '';
// The node an element crops to, and how it was found: "verificado" (per-version selector checked
// by hand), "seletor" (catalog selector), "frase" (quoted text from its name) or "secao" (only the
// section it usually lives in — not the element itself).
export function localizarDetalhado(doc, el, versao) {
  const visivel = n => n && n.getBoundingClientRect().height > 0;
  const q = sel => { try { return doc.querySelector(sel.replace(/[.,;:]+$/, '')); } catch { return null; } };
  const proprio = versao && el.seletores?.[versao];
  if (proprio) { const n = q(proprio); if (n) return {no: n, metodo: 'verificado'}; }
  if (el.seletor) { const n = q(el.seletor); if (visivel(n)) return {no: n, metodo: 'seletor'}; }
  const citado = el.nome.match(/[“"‘']([^”"’']{8,})[”"’']/);
  if (citado) {
    const alvo = citado[1].slice(0, 26).toLowerCase();
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (t.textContent.toLowerCase().includes(alvo) && visivel(t.parentElement)) return {no: t.parentElement.closest('section, article, figure') || t.parentElement, metodo: 'frase'};
    }
  }
  const texto = `${el.nome} ${el.tipo || ''}`;
  for (const [rx, sels] of SECOES) {
    if (!rx.test(texto)) continue;
    for (const sel of sels) { const n = q(sel); if (visivel(n)) return {no: n, metodo: 'secao'}; }
  }
  return {no: null, metodo: null};
}
export const localizar = (doc, el, versao) => localizarDetalhado(doc, el, versao).no;
