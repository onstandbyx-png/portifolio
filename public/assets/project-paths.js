/* The same project, explored through message, campaign and product decisions. */
const categorySection = document.querySelector('#categorias');
if (categorySection && !categorySection.querySelector('#project-paths[data-ready]')) {
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
  const paths = [
    {
      id: 'launch', number: '01', tab: 'Lançar uma oferta', service: 'Projeto integrado',
      eyebrow: 'DA PROPOSTA AO LANÇAMENTO', title: 'Uma oferta que dá<br>vontade de entender.',
      description: 'Organizar o que sua marca oferece em uma mensagem clara, uma identidade visual e um caminho para o próximo passo.',
      scope: [['Conceito e mensagem', 'Posicionamento, argumento central e copy.'], ['Direção de arte', 'Linguagem visual aplicada às peças do lançamento.'], ['Página de apresentação', 'Narrativa, interface e desenvolvimento da landing page.']],
      focus: ['Promessa', 'Benefício', 'Ação'],
      notes: ['A abertura apresenta o que a pessoa ganha: enxergar o projeto inteiro em um lugar.', 'O benefício vira uma situação concreta: encontrar o briefing, a versão atual e a aprovação no mesmo fluxo.', 'O convite acompanha a decisão do visitante: explorar o fluxo antes de assumir um compromisso.'],
      preview: `<div class="path-preview path-landing" data-focus="0">
        <div class="path-example-label"><span>EXEMPLO DE LANDING</span><span>CONCEITUAL</span></div>
        <div class="path-browser-bar"><span class="path-demo-brand"><i></i> LINHA</span><span>Para equipes com ideias.</span><span class="path-demo-menu" aria-hidden="true">☰</span></div>
        <div class="path-landing-body">
          <div class="path-landing-copy"><span class="path-demo-eyebrow">DO BRIEFING À ENTREGA</span><h4 data-path-piece="0">Do briefing<br>ao aprovado.<br><em>No mesmo lugar.</em></h4><p data-path-piece="1">Briefing, versões e aprovações conectados. Para sua equipe saber o que vem depois.</p><button type="button" class="path-demo-cta" data-path-piece="2">Explorar o fluxo ${arrow}</button></div>
          <div class="path-paper-stack" aria-hidden="true"><div class="path-paper-back"></div><div class="path-paper-front"><span>LANÇAMENTO / COLEÇÃO 01</span><strong>A próxima<br>boa ideia.</strong><div class="path-paper-line"></div><div class="path-paper-task"><i></i>Definir a mensagem</div><div class="path-paper-task"><i></i>Dar forma ao conceito</div><div class="path-paper-task"><i></i>Colocar no mundo</div><span class="path-paper-footer">01 — 03 ${arrow}</span></div></div>
        </div><div class="path-demo-bottom"><span>MENSAGEM</span><i></i><span>DESIGN</span><i></i><span>EXPERIÊNCIA</span></div>
      </div>`,
    },
    {
      id: 'demand', number: '02', tab: 'Gerar demanda', service: 'Campanhas e criativos',
      eyebrow: 'DA ATENÇÃO À CONSIDERAÇÃO', title: 'Uma narrativa.<br>Mais de um encontro.',
      description: 'Conectar conteúdo, vídeo e anúncios em uma sequência que apresenta o problema, mostra a proposta e convida a conhecer.',
      scope: [['Conceito de campanha', 'Mensagem central, ângulos e direção visual.'], ['Roteiros e criativos', 'Ganchos, demonstrações e peças por formato.'], ['Desdobramentos', 'Adaptações para social, anúncios e página de destino.']],
      focus: ['Gancho', 'Demonstração', 'Convite'],
      notes: ['Uma pergunta reconhecível abre a conversa. O gancho parte do dia a dia de quem vive o problema.', 'A proposta precisa aparecer em uso. Aqui, o roteiro aproxima o produto de uma tarefa concreta.', 'O próximo passo prolonga a mesma história. O anúncio e a página devem sustentar a mesma promessa.'],
      preview: `<div class="path-preview path-campaign" data-focus="0">
        <div class="path-example-label"><span>SEQUÊNCIA DE CAMPANHA</span><span>CONCEITUAL</span></div>
        <div class="path-campaign-title"><span class="path-demo-brand"><i></i> LINHA</span><p>Uma mensagem.<br><em>Três momentos.</em></p></div>
        <div class="path-story-sequence">
          <article class="path-story" data-path-piece="0"><span class="path-story-index">01 <i>ABRIR</i></span><div class="path-story-visual path-story-tabs" aria-hidden="true"><i></i><i></i><i></i><b>?</b></div><h4>Qual arquivo é<br>o final_final?</h4><p>Vídeo curto · abertura</p></article>
          <article class="path-story" data-path-piece="1"><span class="path-story-index">02 <i>MOSTRAR</i></span><div class="path-story-visual path-story-board" aria-hidden="true"><span>briefing</span><i></i><span>revisão</span><i></i><span>aprovação</span></div><h4>Briefing, revisão<br>e aprovação.</h4><p>Carrossel · demonstração</p></article>
          <article class="path-story" data-path-piece="2"><span class="path-story-index">03 <i>CONVIDAR</i></span><div class="path-story-visual path-story-invite" aria-hidden="true">${arrow}</div><h4>Explore o fluxo.<br>Veja o próximo passo.</h4><p>Anúncio · convite</p></article>
        </div><div class="path-campaign-thread"><span>ATENÇÃO</span><i></i><span>CONTEXTO</span><i></i><span>PRÓXIMO PASSO</span></div>
      </div>`,
    },
    {
      id: 'experience', number: '03', tab: 'Construir uma experiência', service: 'Sites e experiências digitais',
      eyebrow: 'DA IDEIA À TAREFA CONCLUÍDA', title: 'Uma experiência<br>que faz sentido usar.',
      description: 'Transformar a necessidade de uma marca em uma interface clara. Do primeiro fluxo ao site, app ou sistema funcionando.',
      scope: [['Fluxos e conteúdo', 'Tarefas, jornadas e linguagem de cada etapa.'], ['Interface e protótipo', 'Hierarquia, componentes e interações.'], ['Desenvolvimento', 'Experiência responsiva, integrações e estados de uso.']],
      focus: ['Organizar', 'Acompanhar', 'Aprovar'],
      notes: ['O fluxo começa com contexto: objetivo, público e entrega. Uma boa interface reduz a dúvida sobre como começar.', 'O andamento fica visível em uma tarefa simples. A pessoa entende o que está pronto e o que precisa de atenção.', 'A aprovação fecha o percurso com uma decisão clara e um resumo do que acontece depois.'],
      preview: `<div class="path-preview path-product" data-focus="0">
        <div class="path-example-label"><span>FLUXO DE PRODUTO</span><span>DEMO INTERATIVA</span></div>
        <div class="path-product-window"><div class="path-product-nav"><span class="path-demo-brand"><i></i> LINHA</span><span>LANÇAMENTO / COLEÇÃO 01</span><b>SN</b></div>
          <div class="path-product-body"><aside class="path-product-sidebar" aria-hidden="true"><span>VISÃO GERAL</span><i></i><i></i><i></i><div></div><span>SEU PROJETO</span><small>Uma ideia, um percurso.</small></aside>
            <div class="path-product-content">
              <div class="path-product-step" data-path-screen="0"><span class="path-demo-eyebrow">01 / CONTEXTO</span><h4>Antes da forma,<br>o que importa?</h4><div class="path-field"><span>Objetivo do projeto</span><p>Apresentar a coleção 01 com uma narrativa clara.</p></div><div class="path-field"><span>O que vamos criar</span><p>Conceito, campanha e página de apresentação.</p></div><div class="path-product-footer"><span>Contexto organizado</span><b>Próximo: criação</b></div></div>
              <div class="path-product-step" data-path-screen="1" hidden><span class="path-demo-eyebrow">02 / CRIAÇÃO</span><h4>O trabalho avança.<br>A próxima etapa aparece.</h4><div class="path-task-row"><i>✓</i><span>Mensagem central<small>Conceito definido</small></span><b>Pronto</b></div><div class="path-task-row"><i>✓</i><span>Direção visual<small>Linguagem aplicada</small></span><b>Pronto</b></div><div class="path-task-row path-task-current"><i>→</i><span>Página de apresentação<small>Última revisão</small></span><b>Revisão</b></div><div class="path-product-footer"><span>Uma etapa de cada vez</span><b>Próximo: aprovação</b></div></div>
              <div class="path-product-step" data-path-screen="2" hidden><span class="path-demo-eyebrow">03 / APROVAÇÃO</span><div class="path-approval-mark" aria-hidden="true">✓</div><h4>Alinhado.<br>Pronto para seguir.</h4><p class="path-approval-copy">Conceito, linguagem visual e conteúdo reunidos para a decisão final.</p><div class="path-product-footer"><span>Exemplo de estado final</span><b>Próximo: publicação</b></div></div>
            </div>
          </div>
        </div>
      </div>`,
    },
  ];
  const root = categorySection.querySelector('#project-paths') || document.createElement('div');
  root.id = 'project-paths';
  root.className = 'project-paths';
  root.dataset.ready = 'true';
  root.innerHTML = `<header class="path-heading"><div><span class="path-kicker">07 / FORMAS DE TRABALHAR</span><h2 id="project-paths-title">Escolha o desafio.<br><em>Veja a entrega.</em></h2></div><p>O projeto começa pelo que sua marca precisa resolver. Explore três caminhos e as decisões que dão forma a cada um.</p></header>
    <div class="path-tabs" role="tablist" aria-label="Desafios do projeto">${paths.map((path,index) => `<button type="button" id="path-tab-${path.id}" role="tab" data-path-tab="${path.id}" aria-selected="${index === 0}" aria-controls="path-panel-${path.id}" tabindex="${index === 0 ? 0 : -1}"><span>${path.number}</span><strong>${path.tab}</strong>${arrow}</button>`).join('')}</div>
    <div class="path-panels">${paths.map((path,index) => `<section id="path-panel-${path.id}" class="path-panel" role="tabpanel" aria-labelledby="path-tab-${path.id}" tabindex="0" ${index ? 'hidden' : ''}>
      <div class="path-demonstration">${path.preview}<div class="path-decisions"><span>POR TRÁS DA ESCOLHA</span><div class="path-focus-controls" role="group" aria-label="Decisões de ${path.tab.toLowerCase()}">${path.focus.map((label,step) => `<button type="button" data-path-focus="${step}" aria-pressed="${step === 0}" aria-controls="path-note-${path.id}"><span>0${step + 1}</span>${label}</button>`).join('')}</div><p id="path-note-${path.id}" data-path-note role="status">${path.notes[0]}</p></div></div>
      <div class="path-delivery"><span class="path-delivery-kicker">${path.eyebrow}</span><h3>${path.title}</h3><p class="path-delivery-description">${path.description}</p><span class="path-scope-label">O QUE PODE FAZER PARTE</span><ol class="path-scope">${path.scope.map(([title,description],step) => `<li><span>0${step + 1}</span><div><strong>${title}</strong><p>${description}</p></div></li>`).join('')}</ol><a class="path-contact" href="#contato" data-project-need="${path.service}">Conversar sobre este projeto ${arrow}</a><p class="path-scope-note">Escopo definido a partir do contexto da sua marca.</p></div>
    </section>`).join('')}</div>
    <div class="path-footnote"><span class="path-footnote-mark" aria-hidden="true">*</span><p><strong>Um exemplo para tornar as decisões visíveis.</strong> LINHA é uma demonstração conceitual criada para este portfólio; as telas e peças ilustram possibilidades de projeto.</p><span class="path-signature">IDEIA ${arrow} EXECUÇÃO.</span></div>`;
  categorySection.append(root);
  categorySection.setAttribute('aria-labelledby', 'project-paths-title');
  const tabs = [...root.querySelectorAll('[data-path-tab]')];
  const panels = [...root.querySelectorAll('.path-panel')];
  const selectPath = (index, focus = false) => {
    tabs.forEach((tab,position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
    root.dataset.activePath = paths[index].id;
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => selectPath(index));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      selectPath(keys[event.key], true);
    });
  });
  root.querySelector('.path-demo-cta').addEventListener('click', () => {
    selectPath(2);
    panels[2].focus({ preventScroll: true });
  });
  panels.forEach((panel,index) => {
    panel.querySelectorAll('[data-path-focus]').forEach(button => button.addEventListener('click', () => {
      const selected = Number(button.dataset.pathFocus);
      panel.querySelectorAll('[data-path-focus]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
      panel.querySelector('.path-preview').dataset.focus = String(selected);
      panel.querySelector('[data-path-note]').textContent = paths[index].notes[selected];
      panel.querySelectorAll('[data-path-screen]').forEach(screen => { screen.hidden = Number(screen.dataset.pathScreen) !== selected; });
    }));
    panel.querySelector('.path-contact').addEventListener('click', event => {
      const service = document.querySelector('#service');
      if (!service) return;
      const value = event.currentTarget.dataset.projectNeed;
      if ([...service.options].some(option => option.value === value)) {
        service.value = value;
        service.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
  selectPath(0);
}
