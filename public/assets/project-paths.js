/** Contract scopes follow the work, without introducing another image gallery. */
import { sectionCopy } from './content/portfolio-copy.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const multiline = value => escape(value).replace(/\n/g, '<br>');
const category = document.querySelector('#categorias');
if (category) {
  const copy = sectionCopy('categorias');
  const root = category.querySelector('#project-paths') || document.createElement('div');
  root.id = 'project-paths';
  root.className = 'project-paths';
  root.innerHTML = `<header class="path-heading"><div><span class="path-kicker">${escape(copy.eyebrow)}</span><h2 id="project-paths-title">${multiline(copy.title)}</h2></div><p>${escape(copy.body)}</p></header>
    <div class="path-scopes">${copy.services.map((service, i) => `<details class="path-scope" data-service-scope="${service.id}"${''}>
      <summary><span class="path-number">0${i + 1}</span><span class="path-summary-copy"><strong>${escape(service.label)}</strong><span>${escape(service.title.replace(/\n/g, ' '))}</span></span><span class="path-toggle" aria-hidden="true">+</span></summary>
      <div class="path-scope-content"><p class="path-description">${escape(service.body)}</p><div class="path-deliverables"><span class="path-scope-label">O que podemos construir</span><ul>${service.deliverables.map(deliverable => `<li>${escape(deliverable)}</li>`).join('')}</ul><a class="path-contact" href="#contato" data-project-need="${escape(service.label)}" data-service-id="${service.id}">${escape(service.cta)}<span aria-hidden="true">↗</span></a></div></div>
    </details>`).join('')}</div>
    <div class="path-process"><span class="path-scope-label">Da conversa à entrega</span><ol>${copy.process.map((step, i) => `<li><span>0${i + 1}</span><div><strong>${escape(step.label)}</strong><p>${escape(step.body)}</p></div></li>`).join('')}</ol></div>
    <p class="path-footer">${escape(copy.footer)}</p>`;
  if (!root.isConnected) category.append(root);
  category.setAttribute('aria-labelledby', 'project-paths-title');
  root.querySelectorAll('[data-service-id]').forEach(link => link.addEventListener('click', () => {
    const select = document.querySelector('#service');
    if (!select) return;
    const service = copy.services.find(item => item.id === link.dataset.serviceId);
    const accepted = [link.dataset.projectNeed, service?.label];
    const option = [...select.options].find(item => accepted.includes(item.value) || accepted.includes(item.textContent.trim()));
    if (!option) return;
    select.value = option.value;
    select.dispatchEvent(new Event('change', {bubbles:true}));
  }));
  root.dataset.ready = 'true';
}
