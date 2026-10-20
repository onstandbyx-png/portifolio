/** Context follows the artwork; the workflow starts from a visible request and an example result. */
function mountCampaignContext() {
  const lab = document.querySelector('#laboratorio .sp-campaign');
  const layout = lab?.querySelector('.sp-peel-layout');
  const card = layout?.querySelector('.sp-peel-card');
  if (!card || lab.querySelector('.campaign-summary')) return;
  const context = document.createElement('aside');
  context.className = 'campaign-summary';
  context.innerHTML = '<span class="eyebrow">Conceito · copy · direção de arte</span><h3 data-campaign-benefit></h3><p data-campaign-delivery></p><button type="button" class="campaign-decision" aria-controls="campaign-note" aria-expanded="false">Ver decisão criativa <span aria-hidden="true">↗</span></button><a href="#contato" data-contact-service="Campanhas e anúncios">Conversar sobre uma campanha ↓</a>';
  layout.append(context);
  const descriptions = {
    meta: ['Dar forma à oferta no feed.', 'Criativo e texto trabalham juntos para apresentar a proposta e despertar interesse.'],
    google: ['Responder a quem já procura.', 'Título e mensagem partem da intenção de busca e mantêm uma conexão clara com o destino.'],
    tiktok: ['Conquistar atenção na vertical.', 'Enquadramento, abertura e mensagem orientam uma peça pensada para o consumo rápido.'],
  };
  const button = context.querySelector('button');
  const sync = () => {
    const [benefit, delivery] = descriptions[lab.dataset.channel] || descriptions.meta;
    context.querySelector('[data-campaign-benefit]').textContent = benefit;
    context.querySelector('[data-campaign-delivery]').textContent = delivery;
    const open = card.dataset.side === 'back';
    button.setAttribute('aria-expanded', String(open));
    button.firstChild.textContent = open ? 'Voltar à peça ' : 'Ver decisão criativa ';
  };
  button.addEventListener('click', () => {
    card.querySelector(card.dataset.side === 'back' ? '[data-sp-card-turn="back"]' : '[data-peel-grip]').click();
    button.focus({ preventScroll: true });
  });
  new MutationObserver(sync).observe(lab, { attributes: true, attributeFilter: ['data-channel'] });
  new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['data-side'] });
  sync();
}
function mountWorkflow() {
  const demo = document.querySelector('[data-workflow]');
  const form = demo?.querySelector('form');
  if (!form) return;
  const result = demo.querySelector('[data-workflow-result]');
  const status = demo.querySelector('[data-workflow-status]');
  const submit = form.querySelector('[type="submit"]');
  const complete = demo.querySelector('[data-workflow-complete]');
  const edit = demo.querySelector('[data-workflow-edit]');
  const request = form.elements.request;
  const error = form.querySelector('#workflow-request-error');
  const state = result.querySelector('[data-request-state]');
  const priority = result.querySelector('[data-request-priority]');
  const routes = { comercial: 'Comercial → Preparar proposta', atendimento: 'Atendimento → Analisar solicitação', operacao: 'Operação → Planejar tarefa' };
  submit.disabled = false;
  // The request is the starting point: the form stays visible before its result (also on mobile).
  function setState(tone, label) { state.dataset.tone = tone; state.textContent = label; }
  function setPriority(value) { priority.textContent = value; priority.dataset.priority = value === 'Urgente' ? 'urgent' : 'normal'; }
  // Inline pt-BR error tied to the field; novalidate keeps native bubbles out.
  function showError(message) {
    if (error) { error.textContent = message; error.hidden = !message; }
    if (message) request.setAttribute('aria-invalid', 'true'); else request.removeAttribute('aria-invalid');
  }
  function showExample() {
    form.reset();
    showError('');
    result.querySelector('[data-request-title]').textContent = request.value;
    result.querySelector('[data-request-route]').textContent = routes.comercial;
    setPriority('Normal');
    setState('ready', 'Pronto para atender');
    result.querySelector('[data-request-next]').textContent = 'Assunto, responsável e próximo passo reunidos para a equipe agir.';
    complete.disabled = false;
    complete.textContent = 'Marcar como resolvido';
    submit.textContent = 'Organizar pedido';
    demo.dataset.state = 'example';
  }
  edit.addEventListener('click', () => { request.focus(); request.select(); });
  showExample();
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (request.value.trim().length < 8) {
      showError('Descreva o pedido com pelo menos 8 caracteres.');
      status.textContent = '';
      request.focus();
      return;
    }
    showError('');
    result.querySelector('[data-request-title]').textContent = request.value.trim();
    result.querySelector('[data-request-route]').textContent = routes[form.elements.area.value];
    setPriority(form.elements.priority.value);
    setState('ready', 'Pronto para atender');
    result.querySelector('[data-request-next]').textContent = 'Pedido organizado: assunto, prioridade e próximo passo no mesmo lugar.';
    complete.disabled = false;
    complete.textContent = 'Marcar como resolvido';
    demo.dataset.state = 'created';
    submit.textContent = 'Atualizar pedido';
    status.textContent = 'Pedido organizado. Você pode marcar como resolvido ou ajustar as informações.';
    edit.focus();
  });
  request.addEventListener('input', () => { if (request.value.trim().length >= 8) showError(''); });
  complete.addEventListener('click', () => {
    demo.dataset.state = 'completed';
    setState('resolved', 'Resolvido');
    result.querySelector('[data-request-next]').textContent = 'A situação foi atualizada. Em um projeto real, esse fluxo pode se conectar às ferramentas da sua equipe.';
    complete.disabled = true;
    complete.textContent = 'Pedido resolvido';
    status.textContent = 'Pedido marcado como resolvido.';
  });
  demo.querySelector('[data-workflow-reset]').addEventListener('click', () => {
    showExample();
    status.textContent = 'Exemplo reiniciado. O pedido está pronto para atender.';
  });
}
function mount() { mountCampaignContext(); mountWorkflow(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
