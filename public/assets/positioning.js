/** Context follows the artwork; the workflow starts from a visible request and an example result. */
import { createMotion, clamp } from './sections/motion.js';
import { channelById, marca, clienteChip } from './showcase/campaign-channels.js';
import { logoSvg, CHANNEL_LOGO } from './showcase/channel-logos.js';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* Compact summary beside the campaign card: official platform mark and name,
   one benefit line, format chips with the ad label, the client chip of the
   format on screen ("marca fictícia") and the two actions. On each channel
   change its parts rise in sequence (16px, snappy spring, 80ms + 45ms per
   item), as the side texts of the earlier channel switch did. Without motion
   they simply change. */
function mountCampaignContext() {
  const lab = document.querySelector('#laboratorio .sp-campaign');
  const layout = lab?.querySelector('.sp-peel-layout');
  const card = layout?.querySelector('.sp-peel-card');
  if (!card || lab.querySelector('.campaign-summary')) return;
  const motion = createMotion();
  const context = document.createElement('aside');
  context.className = 'campaign-summary';
  context.setAttribute('aria-label', 'Resumo do canal');
  context.innerHTML = '<p class="campaign-channel" data-campaign-channel></p><h3 data-campaign-benefit></h3><ul class="campaign-chips" data-campaign-chips></ul><p class="campaign-client" data-campaign-client></p><div class="campaign-actions"><button type="button" class="campaign-decision" aria-controls="campaign-note" aria-expanded="false">Ver o anúncio no canal <span aria-hidden="true">↗</span></button><a href="#contato" data-contact-service="Campanhas e anúncios">Conversar sobre uma campanha ↓</a></div>';
  layout.append(context);
  const button = context.querySelector('button');
  let shown = null, rising = [];
  const rise = () => {
    rising.splice(0).forEach(animation => { try { animation.cancel(); } catch {} });
    [...context.children].forEach((node, j) => {
      const animation = motion.spring(node, p => ({ opacity: clamp(p), transform: `translateY(${16 * (1 - p)}px)` }), { delay: 80 + j * 45 });
      if (animation) rising.push(animation);
    });
  };
  const sync = () => {
    const channel = channelById(lab.dataset.channel);
    const placement = channel.placements[Number(lab.dataset.placement) || 0] || channel.placements[0];
    const key = channel.id + ':' + placement.id;
    if (shown !== key) {
      const id = CHANNEL_LOGO[channel.id];
      context.querySelector('[data-campaign-channel]').innerHTML = (id ? logoSvg(id, { altura: 20, classe: 'campaign-logo' }) : '') + `<span>${esc(channel.name)}</span>`;
      context.querySelector('[data-campaign-benefit]').textContent = channel.benefit;
      context.querySelector('[data-campaign-chips]').innerHTML = channel.placements.map(item => `<li${item === placement ? ' aria-current="true"' : ''}>${esc(item.label)}</li>`).join('') + `<li class="is-label">${esc(placement.selo)}</li>`;
      context.querySelector('[data-campaign-client]').innerHTML = `${marca(placement.cliente)}<span>${esc(clienteChip(placement.cliente))}</span>`;
      context.dataset.channel = channel.id;
      if (shown !== null && shown.split(':')[0] !== channel.id) rise();
      shown = key;
    }
    const open = card.dataset.side === 'back';
    button.setAttribute('aria-expanded', String(open));
    button.firstChild.textContent = open ? 'Voltar à peça ' : 'Ver o anúncio no canal ';
  };
  button.addEventListener('click', () => {
    card.querySelector(card.dataset.side === 'back' ? '[data-sp-card-turn="back"]' : '[data-peel-grip]').click();
    button.focus({ preventScroll: true });
  });
  motion.onStop(() => { rising.splice(0); });
  new MutationObserver(sync).observe(lab, { attributes: true, attributeFilter: ['data-channel', 'data-placement'] });
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
      const message = 'Descreva o pedido com pelo menos 8 caracteres.';
      showError(message);
      // Enter in the field keeps focus where it is, so the live region announces the error.
      status.textContent = message;
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
  request.addEventListener('input', () => { if (request.value.trim().length >= 8 && request.hasAttribute('aria-invalid')) { showError(''); status.textContent = ''; } });
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
