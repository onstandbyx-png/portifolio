/* Drive and ChatGPT: where the material recovered from the owner's Google Drive export and from the
 * ChatGPT conversations lives in the lab. The Drive tab gathers the versions mounted from Drive files
 * (prototypes, documents, renders) with their elements; the ChatGPT tab reads /conversas.json (private
 * deploy only, built from the conversation mapping) and shows, per conversation, the cards it produced,
 * what was developed, the designs, the code and specs saved from it and the live versions made with it. */
import {PROJETOS, carregar, esc} from './catalogo.js';

const $ = (sel, root = document) => root.querySelector(sel);
// Mounted from Drive files, or byte-identical to a Drive package (the version note says so).
const DRIVE = v => /^[spf]-d-|^s-ux2-/.test(v.id) || /\(([^)]*\s)?Drive\)|do Drive/.test(v.rotulo) || /pacote do Drive/.test(v.nota || '');
const GPT = v => /^[spf]-g-/.test(v.id);
const curto = (texto, n) => (String(texto || '').length > n ? `${String(texto).slice(0, n - 1)}…` : String(texto || ''));
const data = iso => (iso ? iso.split('-').reverse().join('/') : '');
const nomeFicha = (ctx, id) => ctx.elementos.find(e => e.id === id)?.nome || id;

function versaoHtml(v, ctx) {
  const n = ctx.elementos.filter(e => e.versoes.includes(v.id)).length;
  return `<article class="card og-versao">
    <div><h3>${esc(v.rotulo)}</h3><p class="by">${esc(PROJETOS[v.projeto] || v.projeto)}${v.data && v.data !== '—' ? ` · ${esc(v.data)}` : ''} · ${n} ${n === 1 ? 'elemento' : 'elementos'}</p></div>
    ${v.nota ? `<p class="og-nota">${esc(curto(v.nota, 420))}</p>` : ''}
    <div class="controls"><a class="btn btn--primary" href="/v/${esc(v.id)}/" target="_blank" rel="noopener">Abrir a versão ↗</a><a class="btn" href="#qv-${esc(v.id)}">Ver o quadro e os elementos</a></div>
  </article>`;
}

// Counts for the tab labels: the catalog is cached by carregar(); conversas-total.json is tiny.
export async function contarOrigens() {
  const [ctx, total] = await Promise.all([carregar(), fetch('/conversas-total.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}))]);
  return {drive: ctx.versoes.filter(DRIVE).length, conversas: total.conversas || 0};
}

export async function mountDrive(root) {
  const ctx = await carregar();
  const versoes = ctx.versoes.filter(DRIVE);
  const porProjeto = Object.keys(PROJETOS).map(p => [p, versoes.filter(v => v.projeto === p)]).filter(([, l]) => l.length);
  if (!versoes.length) {
    root.innerHTML = '<p class="note">As versões montadas a partir do Drive só vêm no deploy privado do laboratório.</p>';
    return {versoes: 0};
  }
  root.innerHTML = `
    <p class="note">${versoes.length} versões montadas a partir de arquivos do Drive. Para ver só os elementos que vieram do Drive, use o filtro <b>Origem: Drive</b> na aba Quadros.</p>
    <div class="controls"><button type="button" class="btn" data-og-origem="drive">Ver os quadros com origem no Drive</button></div>
    ${porProjeto.map(([p, lista]) => `<section class="og-grupo"><h3 class="og-titulo">${esc(PROJETOS[p])} <span class="count">${lista.length}</span></h3><div class="grid og-grid">${lista.map(v => versaoHtml(v, ctx)).join('')}</div></section>`).join('')}`;
  return {versoes: versoes.length};
}

function codigoHtml(c, k) {
  const previa = c.tipo === 'html';
  return `<details class="og-codigo"><summary><code>${esc(c.arquivo)}</code> <small>${Math.max(1, Math.round(c.bytes / 1000))} KB${c.cortado ? ', cortado em 60 KB' : ''}</small></summary>
    ${previa ? `<div class="controls"><button type="button" class="btn" data-og-previa="${k}">Ver a prévia</button></div><div class="og-previa" data-og-previa-caixa="${k}" hidden></div>` : ''}
    <pre class="og-pre"><code>${esc(c.texto)}</code></pre></details>`;
}

function conversaHtml(c, ctx, i) {
  const vivas = ctx.versoes.filter(v => GPT(v) && (v.nota || '').includes(c.curto));
  const fichas = [...new Set([...c.fichas, ...c.pecas.map(p => p.ficha).filter(Boolean), ...c.designs.map(d => d.ficha).filter(Boolean)])];
  return `<details class="og-conversa" data-og-projetos="${esc(c.projetos.join(' '))}" data-og-texto="${esc(`${c.titulo} ${c.pecas.map(p => p.nome).join(' ')} ${c.designs.map(d => d.titulo).join(' ')}`.toLowerCase())}">
    <summary><span class="og-conversa-titulo">${esc(c.titulo)}</span><span class="og-meta">${esc(data(c.inicio))}${c.fim && c.fim !== c.inicio ? ` a ${esc(data(c.fim))}` : ''} · ${c.projetos.map(p => esc(PROJETOS[p] || p)).join(', ')} · ${fichas.length} no laboratório · ${c.pecas.length} peças · ${c.designs.length} designs · ${c.codigo.length} arquivos</span></summary>
    <div class="og-corpo">
      ${vivas.length ? `<h4>Versão ao vivo feita nesta conversa</h4><div class="grid og-grid">${vivas.map(v => versaoHtml(v, ctx)).join('')}</div>` : ''}
      ${fichas.length ? `<h4>No laboratório</h4><p class="og-chips">${fichas.map(id => `<a class="tag" href="#q-${esc(id)}">${esc(curto(nomeFicha(ctx, id), 70))}</a>`).join('')}</p>` : ''}
      ${c.pecas.length ? `<h4>O que foi desenvolvido</h4><ul class="og-lista">${c.pecas.map(p => `<li><b>${esc(p.nome)}</b>${p.tipo ? ` <small>${esc(p.tipo)}</small>` : ''}${p.ficha ? ` · <a href="#q-${esc(p.ficha)}">abrir o quadro</a>` : ' · <span class="og-sem">sem quadro no laboratório</span>'}<br>${esc(curto(p.descricao, 600))}${p.links.length ? `<br>${p.links.map(l => `<a href="${esc(/^https?:/.test(l) ? l : `https://${l}`)}" target="_blank" rel="noopener">${esc(curto(l.replace(/^https?:\/\//, ''), 60))} ↗</a>`).join(' ')}` : ''}</li>`).join('')}</ul>` : ''}
      ${c.designs.length ? `<h4>Designs descritos</h4><ul class="og-lista">${c.designs.map(d => `<li><b>${esc(d.titulo)}</b>${d.ficha ? ` · <a href="#q-${esc(d.ficha)}">abrir o quadro</a>` : ''}<br>${esc(curto(d.descricao, 600))}${d.especificacoes ? `<br><small>${esc(curto(d.especificacoes, 700))}</small>` : ''}</li>`).join('')}</ul>` : ''}
      ${c.codigo.length ? `<h4>Código e especificações salvos da conversa</h4>${c.codigo.map((x, k) => codigoHtml(x, `${i}-${k}`)).join('')}` : ''}
      ${c.links.length ? `<h4>Links citados</h4><p class="og-chips">${c.links.map(l => `<a class="tag" href="${esc(/^https?:/.test(l) ? l : `https://${l}`)}" target="_blank" rel="noopener">${esc(curto(l.replace(/^https?:\/\//, ''), 64))} ↗</a>`).join('')}</p>` : ''}
    </div>
  </details>`;
}

export async function mountChatgpt(root) {
  const [ctx, dados] = await Promise.all([carregar(), fetch('/conversas.json').then(r => (r.ok ? r.json() : {})).catch(() => ({}))]);
  const conversas = dados.conversas || [];
  const vivas = ctx.versoes.filter(GPT);
  if (!conversas.length) {
    root.innerHTML = '<p class="note">As conversas só vêm no deploy privado do laboratório.</p>';
    return {conversas: 0};
  }
  const t = dados.total || {};
  root.innerHTML = `
    <p class="note">${t.conversas} conversas com material dos três projetos: ${t.pecas} peças desenvolvidas, ${t.designs} designs descritos, ${t.codigo} arquivos de código e especificação salvos e ${t.fichas} elementos no laboratório. As imagens geradas no ChatGPT não vêm na exportação; o que elas mostravam está descrito em cada peça.</p>
    ${vivas.length ? `<section class="og-grupo"><h3 class="og-titulo">Versões ao vivo feitas pelo ChatGPT <span class="count">${vivas.length}</span></h3><div class="grid og-grid">${vivas.map(v => versaoHtml(v, ctx)).join('')}</div></section>` : ''}
    <div class="q-bar">
      <label class="vs-field">Projeto <select data-og-projeto><option value="todos">Todos</option>${['portfolio', 'smiile', 'fatos'].map(p => `<option value="${p}">${esc(PROJETOS[p])}</option>`).join('')}</select></label>
      <label class="vs-field q-busca">Buscar <input type="search" data-og-busca placeholder="título, peça ou design" autocomplete="off"></label>
      <button type="button" class="btn" data-og-origem="conversas">Ver os quadros com origem nas conversas</button>
    </div>
    <p class="note" data-og-contagem></p>
    <div class="og-conversas">${conversas.map((c, i) => conversaHtml(c, ctx, i)).join('')}</div>`;
  const filtrar = () => {
    const p = $('[data-og-projeto]', root).value, busca = $('[data-og-busca]', root).value.trim().toLowerCase();
    let n = 0;
    root.querySelectorAll('.og-conversa').forEach(d => {
      const ok = (p === 'todos' || d.dataset.ogProjetos.split(' ').includes(p)) && (!busca || d.dataset.ogTexto.includes(busca));
      d.hidden = !ok;
      if (ok) n++;
    });
    $('[data-og-contagem]', root).textContent = `${n} ${n === 1 ? 'conversa' : 'conversas'}`;
  };
  $('[data-og-projeto]', root).addEventListener('change', filtrar);
  $('[data-og-busca]', root).addEventListener('input', filtrar);
  root.addEventListener('click', event => {
    const b = event.target.closest('[data-og-previa]');
    if (!b) return;
    const k = b.dataset.ogPrevia, caixa = $(`[data-og-previa-caixa="${k}"]`, root);
    const [i, j] = k.split('-').map(Number);
    if (!caixa.firstChild) {
      const f = document.createElement('iframe');
      f.setAttribute('sandbox', '');
      f.title = `Prévia de ${conversas[i].codigo[j].arquivo}`;
      f.srcdoc = conversas[i].codigo[j].texto;
      caixa.append(f);
    }
    caixa.hidden = !caixa.hidden;
    b.textContent = caixa.hidden ? 'Ver a prévia' : 'Esconder a prévia';
  });
  filtrar();
  return {conversas: conversas.length};
}
