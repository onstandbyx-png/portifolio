/* Configure only verified professional contact details here.
   WhatsApp must include the country code. No contact is inferred from repository accounts. */
(() => {
  'use strict';
  const profile = {
    name: 'Smile N',
    email: 'smillepls@gmail.com',
    whatsapp: '5511985568208',
    preferredChannel: 'whatsapp'
  };

  function contactDestination(settings = profile) {
    const email = String(settings.email || '').trim();
    const rawPhone = String(settings.whatsapp || '').trim();
    const phone = rawPhone.replace(/[\s()+-]/g, '');
    const validEmail = /^[^\s<>@\r\n]+@[^\s<>@\r\n]+\.[^\s<>@\r\n]+$/.test(email);
    const validPhone = /^[+\d\s()-]+$/.test(rawPhone) && /^[1-9]\d{7,14}$/.test(phone);
    const channels = settings.preferredChannel === 'whatsapp' ? ['whatsapp', 'email'] : ['email', 'whatsapp'];
    for (const channel of channels) {
      if (channel === 'email' && validEmail) return {channel, address: email};
      if (channel === 'whatsapp' && validPhone) return {channel, address: phone};
    }
    return null;
  }

  function buildBrief(service, description, project = '') {
    return ['Olá! Quero conversar sobre um projeto.', '', `Frente: ${String(service).trim()}`,
      ...(project ? [`Referência do portfólio: ${String(project).trim()}`] : []),
      `Contexto: ${String(description).trim()}`, '', 'Conheci seu trabalho no portfólio Ideia & Execução.'].join('\n');
  }

  function createContactHref(settings, message = '') {
    const destination = contactDestination(settings);
    if (!destination) return null;
    const {channel, address} = destination;
    const href = channel === 'whatsapp'
      ? `https://wa.me/${address}${message ? `?text=${encodeURIComponent(message)}` : ''}`
      : `mailto:${encodeURIComponent(address).replace('%40', '@')}${message ? `?subject=${encodeURIComponent('Vamos conversar sobre um projeto')}&body=${encodeURIComponent(message)}` : ''}`;
    return {channel, href};
  }

  globalThis.PORTFOLIO_PROFILE = profile;
  globalThis.PORTFOLIO_CONTACT = Object.freeze({contactDestination, buildBrief, createContactHref});
})();
