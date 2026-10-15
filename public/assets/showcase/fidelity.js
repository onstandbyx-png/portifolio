/* Visual fidelity layer, preserving source components and their native interactions. */
(() => {
  'use strict';
  const PHOTO = '/assets/showcase/fatos-editorial-scene.webp';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const parse = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  function replacePdfImage(img) {
    if (!img || img.nodeName !== 'IMG' || img.closest('.hero-badge-stage, .hero-standin-card')) return;
    const path = img.getAttribute('src') || '';
    if (!/^\/assets\/fatos-(?:roteiro|cover-detail|editorial-detail|narrativa-detail|desconhecidos)\.webp(?:\?.*)?$/.test(path)) return;
    img.setAttribute('src', PHOTO);
    img.alt = 'Cena editorial ilustrativa: livros, lupa, café e uma lâmpada, estudo visual conceitual do portfólio';
    img.dataset.pfNewArt = 'true';
  }

  function remapArtwork() {
    $$('img').forEach(replacePdfImage);
    const observer = new MutationObserver(entries => {
      for (const entry of entries) {
        if (entry.type === 'attributes') replacePdfImage(entry.target);
        if (entry.type === 'childList') for (const node of entry.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.matches && node.matches('img')) replacePdfImage(node);
          if (node.querySelectorAll) node.querySelectorAll('img').forEach(replacePdfImage);
        }
      }
    });
    observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['src']});
  }

  function enhanceWork() {
    const work = $('.work-fatos .tile-art');
    if (work) {
      work.classList.add('pf-photo-art');
      work.append(parse('<div class="pf-work-artnote"><span>ECOSSISTEMA FATOS</span><b>Uma pergunta<br>abre caminhos.</b><small>REDAÇÃO / NARRATIVA / DIREÇÃO</small></div>'));
    }
    const systemCard = $('.rx-deck-card[data-rx-card="sistemas"] .rx-front');
    if (systemCard) {
      const img = $('img.rx-card-photo', systemCard);
      if (img) img.replaceWith(parse('<div class="pf-system-art" aria-hidden="true"><div class="pf-system-light"></div><div class="pf-system-grid"><i></i><i></i><i></i><i></i></div><div class="pf-system-info"><small>SOTA CI / EVIDÊNCIAS</small><b>Fonte → Relação<br>→ Síntese</b><span>VERIFICABILIDADE / CONTEXTO</span></div></div>'));
    }
    $$('[data-category-index="0"] .card-picture, [data-category-index="1"] .card-picture').forEach((panel,i) => {
      panel.classList.add('pf-category-image');
      panel.append(parse('<span class="pf-image-meta">' + (i === 0 ? 'FATOS / STORYTELLING' : 'ADS / CRIATIVO CONCEITUAL') + '</span>'));
    });
    const note = $('#editorial .editorial-heading p');
    if (note) note.textContent = 'Três momentos de uma narrativa: encontrar a pergunta, organizar as evidências e transformar o conteúdo em uma apresentação clara. Explore a demonstração dentro do dispositivo.';
  }

  function filmDevice() {
    const phone = $('.rx-film-phone');
    if (!phone || phone.classList.contains('pf-matched-phone')) return;
    const picture = $('img', phone), caption = $('span', phone);
    if (!picture || !caption) return;
    phone.classList.add('rx-iphone', 'pf-matched-phone');
    const inner = parse('<div class="rx-iphone-inner pf-film-inner"><div class="rx-device-status"><span>10:09</span><span class="rx-dynamic-island" aria-hidden="true"></span><span>▂ ▂ ▰</span></div><div class="pf-film-appbar"><strong>ECOSSISTEMA <b>FATOS</b></strong><span aria-hidden="true">✦</span></div><div class="pf-film-picture"><div class="pf-film-photo"></div><div class="pf-film-shade" aria-hidden="true"></div></div><div class="pf-film-footer"><div class="pf-film-dots" role="group" aria-label="Explorar formatos"><button type="button" data-pf-film="0" aria-label="Editorial" aria-current="true"></button><button type="button" data-pf-film="1" aria-label="Campanha" aria-current="false"></button><button type="button" data-pf-film="2" aria-label="Produto" aria-current="false"></button></div><span>UM CONCEITO · TRÊS FORMAS</span></div><div class="rx-ig-home" aria-hidden="true"></div></div>');
    phone.replaceChildren(inner);
    const photo = $('.pf-film-photo', inner);
    photo.append(picture, caption);
    caption.classList.add('pf-film-caption');
    const phases = $$('[data-rx-film-to]');
    $$('[data-pf-film]', phone).forEach(btn => btn.addEventListener('click', () => phases[Number(btn.dataset.pfFilm)]?.click()));
    const film = $('.rx-film');
    if (film) new MutationObserver(() => {
      const n = Number(film.dataset.phase || 0);
      $$('[data-pf-film]', phone).forEach((btn,i) => btn.setAttribute('aria-current', String(i === n)));
    }).observe(film, {attributes:true, attributeFilter:['data-phase']});
  }

  function editorialDevice() {
    const page = $('.editorial-page'), original = $('#editorial-image');
    if (!page || !original || page.classList.contains('pf-editorial-device')) return;
    page.classList.add('rx-iphone', 'pf-editorial-device');
    original.classList.add('pf-original-asset');
    const device = parse('<div class="rx-iphone-inner pf-editorial-inner"><div class="rx-device-status"><span>10:09</span><span class="rx-dynamic-island" aria-hidden="true"></span><span>▂ ▂ ▰</span></div><div class="pf-editorial-bar"><span class="pf-fatos-icon">F</span><div><b>Fatos Desconhecidos</b><small>Laboratório editorial · conceito</small></div><span aria-hidden="true">⋯</span></div><div class="pf-editorial-content" tabindex="0" aria-label="Três capítulos de narrativa editorial. Deslize para alternar."><div class="pf-editorial-visual"><img src="/assets/showcase/fatos-editorial-scene.webp" alt="Fotografia conceitual de pesquisa e descoberta"><div class="pf-editorial-overlay"><span data-pf-chapter>01 / A PERGUNTA</span><h3 data-pf-title>Por que isso faz parte do seu dia?</h3><p data-pf-description>Uma pergunta familiar convida à descoberta.</p></div></div><div class="pf-editorial-insight"><span>DA PESQUISA À NARRATIVA</span><b data-pf-insight>Comece pelo que desperta curiosidade.</b><div class="pf-editorial-meter" aria-hidden="true"><i></i></div></div></div><div class="pf-editorial-navigation" role="group" aria-label="Navegar capítulos"><button type="button" data-pf-prev aria-label="Capítulo anterior">‹</button><span data-pf-count>01 / 03</span><button type="button" data-pf-next aria-label="Próximo capítulo">›</button></div><div class="rx-ig-home" aria-hidden="true"></div></div>');
    page.append(device);
    const chapters = [
      ['01 / A PERGUNTA','Por que isso faz parte do seu dia?','Uma pergunta familiar convida à descoberta.','Comece pelo que desperta curiosidade.'],
      ['02 / O CONTEXTO','O que precisamos compreender?','Pesquisa, verificação e ponto de vista dão sustentação.','O contexto evita promessas vazias.'],
      ['03 / A NARRATIVA','Uma ideia, muitas maneiras de contar.','Roteiro, imagem e sequência trabalham juntos.','A forma acompanha a mensagem.']
    ];
    const external = $$('[data-story-step]');
    let current = 0, start = null;
    function select(index) {
      current = Math.max(0, Math.min(chapters.length - 1, index));
      const data = chapters[current];
      $('[data-pf-chapter]', device).textContent = data[0];
      $('[data-pf-title]', device).textContent = data[1];
      $('[data-pf-description]', device).textContent = data[2];
      $('[data-pf-insight]', device).textContent = data[3];
      $('[data-pf-count]', device).textContent = '0' + (current+1) + ' / 03';
      $('.pf-editorial-meter i', device).style.transform = 'scaleX(' + ((current+1)/3) + ')';
      device.dataset.chapter = String(current);
      $('[data-pf-prev]', device).disabled = current === 0;
      $('[data-pf-next]', device).disabled = current === 2;
      if (!reduced.matches && !$('#motion-toggle[aria-pressed="true"]')) {
        const target = $('.pf-editorial-visual', device);
        target?.animate([{opacity:.55, transform:'scale(.98)'},{opacity:1,transform:'scale(1)'}], {duration:360, easing:'ease-out'});
      }
    }
    external.forEach((btn,i) => btn.addEventListener('click', () => select(i)));
    $('[data-pf-prev]',device).addEventListener('click', () => external[Math.max(0,current-1)]?.click());
    $('[data-pf-next]',device).addEventListener('click', () => external[Math.min(2,current+1)]?.click());
    const surface = $('.pf-editorial-content',device);
    surface.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      start = {x:e.clientX,y:e.clientY};
    });
    surface.addEventListener('pointerup',e => {
      if (!start) return;
      const dx=e.clientX-start.x,dy=e.clientY-start.y;
      start=null;
      if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.3) external[Math.max(0,Math.min(2,current + (dx<0?1:-1)))]?.click();
    });
    surface.addEventListener('pointercancel', () => {start=null;});
    surface.addEventListener('keydown', e => {
      if (e.key==='ArrowRight' || e.key==='ArrowLeft') {
        e.preventDefault();
        external[Math.max(0,Math.min(2,current + (e.key==='ArrowRight'?1:-1)))]?.click();
      }
    });
    select(0);
  }

  function referenceDeviceConsistency() {
    const experience = $('.sm-device');
    if (!experience) return;
    const sync = () => experience.classList.toggle('pf-orange-device', experience.dataset.mode === 'mobile');
    sync();
    new MutationObserver(sync).observe(experience, {attributes:true,attributeFilter:['data-mode']});
    const tiktok = $('#panel-tiktok .vertical-video');
    tiktok?.classList.add('pf-video-device');
  }

  function caseStudyArtwork() {
    const dialog = $('#case-dialog');
    if (!dialog) return;
    const sync = () => {
      if (!dialog.open || !$('#dialog-kicker')?.textContent.includes('FATOS')) return;
      const img = $('#dialog-image img');
      if (img) replacePdfImage(img);
    };
    dialog.addEventListener('click', () => queueMicrotask(sync));
    dialog.addEventListener('toggle', sync);
  }

  function init() {
    if (document.documentElement.dataset.pfFidelity) return;
    document.documentElement.dataset.pfFidelity = 'v2';
    enhanceWork();
    filmDevice();
    editorialDevice();
    referenceDeviceConsistency();
    caseStudyArtwork();
    remapArtwork();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(init), {once:true});
  else requestAnimationFrame(init);
})();