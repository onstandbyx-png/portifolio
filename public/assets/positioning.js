/** Context follows the artwork; the workflow starts with a useful result. */
function mountCampaignContext() {
  const lab = document.querySelector('#laboratorio .sp-campaign');
  const layout = lab?.querySelector('.sp-peel-layout');
  const card = layout?.querySelector('.sp-peel-card');
  if (!card || lab.querySelector('.campaign-summary')) return;
  const context = document.createElement('aside');
  context.className = 'campaign-summary';
  context.innerHTML = '<span class="eyebrow">Conceito · copy · direção de arte</span><h3 data-campaign-benefit></h3><p data-campaign-delivery></p><button type="button" class="campaign-decision" aria-controls="campaign-note" aria-expanded="false">Ver decisão criativa <span aria-hidden="true">↗</span></button><a href="#contato" data-contact-service="Campanhas e anúncios">Conversar sobre uma campanha ↗</a>';
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
  const routes = { comercial: 'Comercial → Preparar proposta', atendimento: 'Atendimento → Analisar solicitação', operacao: 'Operação → Planejar tarefa' };
  submit.disabled = false;
  demo.querySelector('.workflow-grid').prepend(demo.querySelector('.workflow-output'));
  function setEditing(open) {
    form.hidden = !open;
    demo.dataset.editing = String(open);
    edit.setAttribute('aria-expanded', String(open));
    edit.firstChild.textContent = open ? 'Fechar edição ' : 'Experimentar outro pedido ';
  }
  function showExample() {
    form.reset();
    form.elements.request.setCustomValidity('');
    result.querySelector('[data-request-title]').textContent = form.elements.request.value;
    result.querySelector('[data-request-route]').textContent = routes.comercial;
    result.querySelector('[data-request-priority]').textContent = 'Normal';
    result.querySelector('[data-request-state]').textContent = 'Pronto para atender';
    result.querySelector('[data-request-next]').textContent = 'Assunto, responsável e próximo passo reunidos para a equipe agir.';
    complete.disabled = false;
    complete.textContent = 'Marcar como resolvido';
    submit.textContent = 'Organizar pedido';
    demo.dataset.state = 'example';
    setEditing(false);
  }
  edit.addEventListener('click', () => {
    const open = form.hidden;
    setEditing(open);
    if (open) form.elements.request.focus({ preventScroll: true });
  });
  showExample();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const description = form.elements.request;
    description.setCustomValidity(description.value.trim().length < 8 ? 'Descreva o pedido com pelo menos 8 caracteres.' : '');
    if (!form.reportValidity()) return;
    result.querySelector('[data-request-title]').textContent = description.value.trim();
    result.querySelector('[data-request-route]').textContent = routes[form.elements.area.value];
    result.querySelector('[data-request-priority]').textContent = form.elements.priority.value;
    result.querySelector('[data-request-state]').textContent = 'Pronto para atender';
    result.querySelector('[data-request-next]').textContent = 'Pedido organizado: assunto, prioridade e próximo passo no mesmo lugar.';
    complete.disabled = false;
    complete.textContent = 'Marcar como resolvido';
    demo.dataset.state = 'created';
    submit.textContent = 'Atualizar pedido';
    status.textContent = 'Pedido organizado. Você pode marcar como resolvido ou ajustar as informações.';
    setEditing(false);
    edit.focus({ preventScroll: true });
  });
  form.elements.request.addEventListener('input', () => form.elements.request.setCustomValidity(''));
  complete.addEventListener('click', () => {
    demo.dataset.state = 'completed';
    result.querySelector('[data-request-state]').textContent = 'Resolvido';
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
