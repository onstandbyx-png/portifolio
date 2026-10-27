/** The complete catalogue is readable in HTML; JavaScript only connects the brief. */
const root = document.querySelector('#project-paths');
if (root) {
  root.querySelectorAll('[data-project-need]').forEach(link => {
    link.addEventListener('click', () => {
      const select = document.querySelector('#service');
      const option = select && [...select.options].find(item => item.value === link.dataset.projectNeed);
      if (!option) return;
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
  root.dataset.ready = 'true';
}

/* Showcase CTAs (data-contact-service) are mapped in portfolio.js with their brief reference. */
