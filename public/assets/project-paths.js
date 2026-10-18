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

/* Contextual showcase CTA. Only preselects a category; never submits customer data. */
const showcaseCategory={
  'Sites e aplicativos':'Sites e landing pages',
  'Conteúdo e redação':'Conteúdo e redação',
  'Campanhas e anúncios':'Campanhas e anúncios',
  'Vídeo e motion':'Conteúdo e redação',
  'Lojas e e-commerce':'Sites e landing pages',
  'Sistemas e automações':'Sistemas e automações'
};
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-contact-service]');
  if(!link)return;
  const select=document.querySelector('#service');
  const requested=showcaseCategory[link.dataset.contactService]||link.dataset.contactService;
  if(!select||![...select.options].some(option=>option.value===requested))return;
  select.value=requested;
  select.dispatchEvent(new Event('change',{bubbles:true}));
});
