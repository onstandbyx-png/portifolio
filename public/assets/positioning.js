/** Context follows the artwork: the campaign summary changes with the channel and the placement. */
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
function mount() { mountCampaignContext(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
