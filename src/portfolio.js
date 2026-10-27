import {sectionCopy} from '/assets/content/portfolio-copy.js';
/* Site interactions: editorial chapters, channel specimens, professional context and contact. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = preference.matches;
  let paused = false;
  const smooth=()=>reduced||paused?'auto':'smooth';
  // Events describe actions only. Brief text and contact details never enter analytics.
  function recordInteraction(event, details={}){
    const payload=Object.freeze({event:`portfolio_${event}`, ...details});
    window.dispatchEvent(new CustomEvent('portfolio:interaction',{detail:payload}));
    try{if(Array.isArray(window.dataLayer))window.dataLayer.push({...payload});}catch{/* Optional analytics must not block a contact action. */}
  }

  // Header and accessible mobile menu. While open, the page behind is locked and inert and focus stays in the menu.
  const header = $('#site-header'), menuToggle = $('#menu-toggle'),mobileNav=$('#mobile-nav');
  let menuInert=[];
  const menuOpen=()=>menuToggle?.getAttribute('aria-expanded')==='true';
  function setMenuState(open){
    menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');mobileNav.hidden=!open;
    document.documentElement.classList.toggle('menu-open',open);
    if(open){menuInert=[...document.body.children,...$$('.header-inner>*',header)].filter(el=>el!==header&&el!==menuToggle&&!el.inert);menuInert.forEach(el=>{el.inert=true;});}
    else{menuInert.forEach(el=>{el.inert=false;});menuInert=[];}
  }
  function closeMenu(restoreFocus=false){
    if(!menuToggle||!mobileNav||!menuOpen())return;
    setMenuState(false);
    if(restoreFocus){
      const target=matchMedia('(max-width:900px)').matches?menuToggle:$('.main-nav a');
      target?.focus({preventScroll:true});
    }
  }
  menuToggle?.addEventListener('click',()=>{
    if(menuOpen()){closeMenu(true);return;}
    setMenuState(true);
    $('a',mobileNav)?.focus({preventScroll:true});
  });
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{
    closeMenu();
    // The contact action is handled with the other contact CTAs below: it lands on the form heading.
    const target=a.hash&&!a.classList.contains('mobile-nav-cta')?document.getElementById(a.hash.slice(1)):null;
    if(target){target.tabIndex=-1;target.focus({preventScroll:true});}
  }));
  // Tab cycles between the toggle (the close control) and the panel links.
  function trapMenuFocus(event){
    const items=[menuToggle,...$$('a[href],button:not([disabled])',mobileNav)],at=items.indexOf(document.activeElement);
    if(event.shiftKey&&at<=0){event.preventDefault();items[items.length-1].focus();}
    else if(!event.shiftKey&&(at<0||at===items.length-1)){event.preventDefault();items[0].focus();}
  }
  addEventListener('keydown',e=>{if(!menuOpen())return;if(e.key==='Escape')closeMenu(true);else if(e.key==='Tab')trapMenuFocus(e);});
  // A tap outside the header (the inert page) closes the menu.
  document.addEventListener('click',e=>{if(menuOpen()&&!header?.contains(e.target))closeMenu(true);});

  // Global progress and on-screen motion, no wheel/touch hijacking.
  const progress=$('#reading-progress');let pending=false;
  function requestUpdate(){if(pending) return;pending=true;requestAnimationFrame(()=>{pending=false;updateScroll()})}
  function updateScroll(){
    header?.classList.toggle('is-scrolled',scrollY>12);
    const total=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(progress)progress.style.transform=`scaleX(${clamp(scrollY/total)})`;
  }
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  preference.addEventListener?.('change',()=>{reduced=preference.matches;requestUpdate()});

  // Reveal on first meaningful exposure. Never hide content without JS.
  if(!reduced&&'IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.07,rootMargin:'0px 0px 40px 0px'});
    $$('.reveal').forEach(el=>io.observe(el));
  }else $$('.reveal').forEach(el=>el.classList.add('is-visible'));

  // A demonstration CTA carries its origin into the brief; the visitor still decides what to send.
  let contactCase='',contactCaseService='',contactSource='',briefContext=null;
  // Showcases name finer capabilities than the five fronts offered in the form.
  const showcaseCategory={
    'Sites e aplicativos':'Sites e landing pages',
    'Vídeo e motion':'Conteúdo e redação',
    'Lojas e e-commerce':'Sites e landing pages'
  };
  function setContactCase(label='',service='',source=''){
    contactCase=label;contactCaseService=label?service:'';contactSource=label?source:'';
    if(!briefContext)return;
    briefContext.textContent=label?`Referência do portfólio: ${label}`:'';
    briefContext.hidden=!label;
  }

  // A contact click opens the chosen application. Only the visitor can send the message.
  const brief=$('#brief-form');
  const profile=window.PORTFOLIO_PROFILE||{};
  const contact=window.PORTFOLIO_CONTACT;
  const destination=contact?.contactDestination(profile);
  let copyButton=null,preparedBox=null;
  if(brief){
    const submit=$('button[type="submit"]',brief),status=$('#form-status');
    briefContext=document.createElement('p');briefContext.id='brief-context';briefContext.className='brief-context';briefContext.hidden=true;briefContext.setAttribute('aria-live','polite');
    $('#service')?.before(briefContext);
    $('#service')?.addEventListener('change',()=>{if(contactCase&&$('#service').value!==contactCaseService)setContactCase();});
    brief.dataset.contactReady=String(Boolean(destination));
    if(submit)submit.innerHTML=destination?`Continuar ${destination.channel==='whatsapp'?'no WhatsApp':'por e-mail'} <span aria-hidden="true">↗</span>`:'Copiar meu briefing <span aria-hidden="true">↗</span>';
    if(status)status.textContent=destination?sectionCopy('contato').submitHint:'O canal de contato está em configuração. Você pode preparar e copiar o briefing por aqui.';
    if(destination){
      copyButton=document.createElement('button');copyButton.type='button';copyButton.className='brief-copy';copyButton.textContent='Prefiro copiar o briefing';
      submit?.after(copyButton);
      if(destination.channel==='whatsapp'&&contact.contactDestination({...profile,whatsapp:''})){
        const emailButton=document.createElement('button');emailButton.type='button';emailButton.className='brief-email';emailButton.textContent='Prefiro e-mail';
        emailButton.addEventListener('click',()=>{
          if(!validateBrief())return;
          const emailLink=contact.createContactHref({...profile,preferredChannel:'email'},getBrief());
          if(!emailLink)return;
          recordInteraction('contact_click',{channel:'email',entry:contactCase?'case':'form',service:$('#service')?.value||'',source:contactSource});
          if(status)status.textContent='Seu aplicativo de e-mail será aberto com o resumo. Revise e envie para iniciar a conversa. Se não abrir, use a opção de copiar.';
          window.location.href=emailLink.href;
        });
        submit?.after(emailButton);
      }
      const alternatives=document.createElement('div');alternatives.className='brief-alternatives';
      submit?.after(alternatives);
      brief.querySelectorAll('.brief-email,.brief-copy').forEach(button=>alternatives.append(button));
    }
    if(profile.name){$$('[data-professional-name]').forEach(el=>{el.textContent=profile.name;});}
  }
  // Inline pt-BR errors replace the browser's validation bubbles (the form is novalidate).
  const fieldErrors={service:'Escolha uma frente de trabalho para continuar.',brief:'Conte um pouco sobre o projeto, com pelo menos 8 caracteres.'};
  const briefFields=[$('#service'),$('#brief')].filter(Boolean),statusHint=$('#form-status')?.textContent||'';
  const fieldError=field=>field.id==='service'?(field.value?'':fieldErrors.service):(field.value.trim().length>=8?'':fieldErrors.brief);
  function showFieldError(field,message){
    const error=document.getElementById(field.id+'-error');
    if(error){error.textContent=message;error.hidden=!message;}
    if(message){field.setAttribute('aria-invalid','true');if(error)field.setAttribute('aria-describedby',error.id);}
    else{field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');}
  }
  function validateBrief(){
    const invalid=briefFields.filter(field=>{const message=fieldError(field);showFieldError(field,message);return message;});
    const status=$('#form-status');
    if(invalid.length){invalid[0].focus();if(status)status.textContent=sectionCopy('contato').validation;}
    return !invalid.length;
  }
  briefFields.forEach(field=>field.addEventListener(field.tagName==='SELECT'?'change':'input',()=>{
    if(field.getAttribute('aria-invalid')!=='true')return;
    showFieldError(field,fieldError(field));
    const status=$('#form-status');
    if(status&&!briefFields.some(item=>item.getAttribute('aria-invalid')==='true'))status.textContent=statusHint;
  }));
  function getBrief(){
    const service=$('#service')?.value||'',description=$('#brief')?.value.trim()||'';
    return contact?contact.buildBrief(service,description,contactCase):`Olá! Quero conversar sobre um projeto.\n\nFrente: ${service}\nContexto: ${description}\n\nConheci seu trabalho no portfólio Ideia & Execução.`;
  }
  async function copyBrief(){
    if(!brief||!validateBrief())return;
    const message=getBrief(),status=$('#form-status');
    try{
      await navigator.clipboard.writeText(message);
      if(status)status.textContent='Briefing copiado. Cole na conversa que preferir; a cópia não envia uma mensagem.';
      if(preparedBox)preparedBox.hidden=true;
      recordInteraction('brief_copied',{entry:contactCase?'case':'form',service:$('#service')?.value||'',source:contactSource});
    }catch{
      if(!preparedBox){preparedBox=document.createElement('textarea');preparedBox.id='prepared-brief';preparedBox.readOnly=true;preparedBox.rows=8;preparedBox.className='prepared-brief';preparedBox.setAttribute('aria-label','Briefing pronto para copiar');status?.after(preparedBox);}
      preparedBox.hidden=false;preparedBox.value=message;
      if(status)status.textContent='Selecione e copie o texto abaixo. Nenhuma mensagem foi enviada.';
      preparedBox.focus();preparedBox.select();
    }
  }
  copyButton?.addEventListener('click',copyBrief);
  brief?.addEventListener('submit',e=>{
    e.preventDefault();
    if(!validateBrief())return;
    const link=contact?.createContactHref(profile,getBrief());
    if(!link){copyBrief();return;}
    recordInteraction('contact_click',{channel:link.channel,entry:contactCase?'case':'form',service:$('#service')?.value||'',source:contactSource});
    const status=$('#form-status');
    if(status)status.textContent=link.channel==='whatsapp'?'O WhatsApp será aberto com seu resumo. Revise e toque em enviar para iniciar a conversa.':'Seu aplicativo de e-mail será aberto com o resumo. Revise e envie para iniciar a conversa. Se não abrir, use a opção de copiar.';
    if(link.channel==='whatsapp')window.open(link.href,'_blank','noopener,noreferrer');
    else window.location.href=link.href;
  });
  // The HTML submit starts disabled, so a missing script cannot reload and discard a draft.
  const contactSubmit=brief?.querySelector('button[type="submit"]');
  if(contactSubmit)contactSubmit.disabled=false;
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a');
    if(!link)return;
    const channel=link.dataset.contactDirect;
    if(channel==='whatsapp'||channel==='email')recordInteraction('contact_click',{channel,entry:'direct'});
    else if(link.getAttribute('href')==='#contato'){
      const service=$('#service');
      const requested=showcaseCategory[link.dataset.contactService]||link.dataset.contactService||'';
      const available=Boolean(requested&&service&&[...service.options].some(option=>option.value===requested));
      // Every contact link defines the reference: a plain link clears a previous demonstration.
      setContactCase(available?link.dataset.contactCase||'':'',requested,link.dataset.contactSource||'');
      if(available){service.value=requested;service.dispatchEvent(new Event('change',{bubbles:true}));}
      // #colecao lives inside #editorial, so the deck is checked first.
      const entry=link.matches('[data-project-need]')?'project_need':link.closest('#colecao')?'deck':link.closest('#editorial')?'editorial':
        link.closest('#laboratorio')?'campaign':link.closest('#sistemas')?'systems':link.closest('.hero')?'hero':'navigation';
      recordInteraction('contact_intent',{entry,service:available?requested:link.dataset.projectNeed||'',source:link.dataset.contactSource||''});
      // Navigation links go to the section; contact CTAs land on the form heading instead.
      const navigation=link.closest('nav')&&!link.classList.contains('mobile-nav-cta');
      if(!navigation&&!event.defaultPrevented&&event.button===0&&!(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)&&revealBrief())event.preventDefault();
    }
  });
  // On a stacked layout the form starts about a screen below the section title, so the page scrolls to the form itself.
  function revealBrief(){
    const section=$('#contato'),heading=$('#brief-title');
    if(!section||!brief||!heading)return false;
    const stacked=brief.getBoundingClientRect().top-section.getBoundingClientRect().top>innerHeight*.4;
    (stacked?brief:section).scrollIntoView({block:'start',behavior:reduced||paused?'instant':'smooth'});
    if(location.hash!=='#contato')history.pushState(null,'','#contato');
    heading.focus({preventScroll:true});
    return true;
  }

  // User controls decorative animation. A system reduced-motion preference is reflected (paused, not resumable here).
  const pauseBtn=$('#motion-toggle');let userPaused=false;
  function syncMotionToggle(){
    if(!pauseBtn)return;
    paused=reduced||userPaused;
    document.body.classList.toggle('is-paused',paused);
    pauseBtn.setAttribute('aria-pressed',String(paused));
    if(reduced)pauseBtn.setAttribute('aria-disabled','true');else pauseBtn.removeAttribute('aria-disabled');
    const motionLabel=reduced?'Movimento reduzido pelo sistema':paused?'Retomar movimento':'Pausar movimento e reprodução';
    pauseBtn.setAttribute('aria-label',motionLabel);
    pauseBtn.setAttribute('title',motionLabel);
    const text=$('span',pauseBtn);if(text)text.textContent=reduced?'Movimento reduzido':paused?'Retomar movimento':'Pausar movimento';
  }
  pauseBtn?.addEventListener('click',()=>{if(reduced)return;userPaused=!userPaused;syncMotionToggle();});
  preference.addEventListener?.('change',syncMotionToggle);
  syncMotionToggle();

  // Missing cross-origin previews degrade to intentional graphic fallback, not fake artwork.
  $$('img[src^="https://smiile-landing-preview.up.railway.app/"]').forEach(img=>{
    img.addEventListener('error',()=>{img.style.opacity='.2';img.setAttribute('alt','Imagem da demonstração smiile indisponível neste momento')},{once:true});
  });
  // Ensure no focus remains behind the mobile nav when it is closed.
  addEventListener('resize',()=>{if(!matchMedia('(max-width:900px)').matches)closeMenu(Boolean(mobileNav?.contains(document.activeElement)))});
  requestAnimationFrame(()=>{requestUpdate();updateScroll()});
})();
