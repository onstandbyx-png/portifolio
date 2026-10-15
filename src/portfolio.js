import {portfolioCopy, sectionCopy} from '/assets/content/portfolio-copy.js';
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

  // Header and accessible mobile menu.
  const header = $('#site-header'), menuToggle = $('#menu-toggle'),mobileNav=$('#mobile-nav');
  function closeMenu(restoreFocus=false){
    if(!menuToggle||!mobileNav)return;
    menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menu');mobileNav.hidden=true;
    if(restoreFocus){
      const target=matchMedia('(max-width:900px)').matches?menuToggle:$('.main-nav a');
      target?.focus({preventScroll:true});
    }
  }
  menuToggle?.addEventListener('click',()=>{
    const opening=menuToggle.getAttribute('aria-expanded')!=='true';
    menuToggle.setAttribute('aria-expanded',String(opening));
    menuToggle.setAttribute('aria-label',opening?'Fechar menu':'Abrir menu');
    mobileNav.hidden=!opening;
    if(opening)$('a',mobileNav)?.focus({preventScroll:true});
  });
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{
    closeMenu();
    const target=a.hash?document.getElementById(a.hash.slice(1)):null;
    if(target){target.tabIndex=-1;target.focus({preventScroll:true});}
  }));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&menuToggle?.getAttribute('aria-expanded')==='true')closeMenu(true)});

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

  // Channel-accurate specimen structures, intentionally illustrative and not live account dashboards.
  const ads=$$('[data-ad-tab]');
  function setChannel(name,focus=false){
    const selected=ads.find(el=>el.dataset.adTab===name);
    if(!selected)return;
    ads.forEach(btn=>{
      const chosen=btn===selected;
      btn.classList.toggle('is-active',chosen);
      btn.setAttribute('aria-selected',String(chosen));
      btn.tabIndex=chosen?0:-1;
    });
    $$('.ad-panel').forEach(panel=>{panel.hidden=panel.id!==`panel-${name}`});
    const descriptions=Object.fromEntries(sectionCopy('laboratorio').tabs.map(tab=>[tab.id,tab.context]));
    const context=$('#ad-context');if(context)context.textContent=descriptions[name];
    document.dispatchEvent(new CustomEvent('portfolio:channelchange',{detail:{channel:name}}));
    if(focus)selected.focus({preventScroll:true});
  }
  ads.forEach((tab,index)=>{
    tab.addEventListener('click',()=>setChannel(tab.dataset.adTab));
    tab.addEventListener('keydown',e=>{
      if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(e.key))return;
      e.preventDefault();let i=index;
      if(e.key==='Home')i=0;else if(e.key==='End')i=ads.length-1;else i=(index+(e.key==='ArrowDown'||e.key==='ArrowRight'?1:ads.length-1))%ads.length;
      setChannel(ads[i].dataset.adTab,true);
    });
  });
  setChannel('meta');
  // Cases separate professional background, authorial concepts and working demonstrations.
  const caseContext={
    fatos:{image:'/assets/portfolio/recovered-fatos/post-desconhecidos-600.webp',section:'#editorial',source:'https://www.instagram.com/fatosdesconhecidos/',service:'Direção criativa e conteúdo'},
    ads:{image:'/assets/brands/smiile-campaign-editorial.svg',section:'#laboratorio',source:'#laboratorio',service:'Campanhas e gestão de mídia'},
    smiile:{image:'/assets/portfolio/recovered-smiile/landscape.webp',section:'#sistemas',source:'https://smiile-landing-preview.up.railway.app/',service:'Sites, apps e sistemas'}
  };
  const cases=Object.fromEntries(Object.entries(caseContext).map(([id,extra])=>{
    const detail=portfolioCopy.caseDetails[id],card=sectionCopy('trabalhos').cards.find(item=>item.id===id);
    return [id,{...extra,kicker:card.label,title:detail.title,description:detail.context,status:detail.nature,challenge:detail.context,decision:card.body,contribution:detail.contribution,proof:detail.explore,imageAlt:card.label,sourceLabel:detail.sourceLabel,credit:detail.credit,cta:detail.cta,explore:card.cta}];
  }));
  const dialog=$('#case-dialog'),dialogImage=$('#dialog-image'),dialogClose=$('#dialog-close');
  let focusOrigin=null,currentCase=null,contactCase='',contactCaseService='';
  const caseKeys=Object.keys(cases);
  const content=dialog?.querySelector('.dialog-content');
  const source=$('#dialog-source');
  let metadata=null,statusBadge=null,caseCTA=null,caseExplore=null,casePosition=null,caseCredits=null;
  if(content){
    dialog.setAttribute('aria-describedby','dialog-description');
    metadata=document.createElement('dl');metadata.className='case-facts';
    statusBadge=document.createElement('span');statusBadge.className='case-status';
    $('#dialog-kicker')?.before(statusBadge);
    $('#dialog-description')?.after(metadata);
    const actions=document.createElement('div');actions.className='case-actions';
    caseCTA=document.createElement('button');caseCTA.type='button';caseCTA.className='case-contact';
    caseCTA.addEventListener('click',()=>{
      const data=cases[currentCase];
      if(!data)return;
      contactCase=data.title;
      contactCaseService=data.service;
      const select=$('#service');
      if(select){const option=Array.from(select.options).find(item=>item.value===data.service||item.textContent===data.service);if(option)select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));}
      const context=$('#brief-context');
      if(context){context.textContent=`Ponto de partida: ${data.title}`;context.hidden=false;}
      recordInteraction('case_contact',{case:currentCase});
      closeCase(false);
      document.getElementById('contato')?.scrollIntoView({behavior:smooth(),block:'start'});
      $('#brief')?.focus({preventScroll:true});
    });
    caseExplore=document.createElement('a');caseExplore.className='case-explore';
    caseExplore.addEventListener('click',()=>{recordInteraction('case_explore',{case:currentCase});closeCase(false);const target=document.querySelector(caseExplore.getAttribute('href'));if(target){target.tabIndex=-1;target.focus({preventScroll:true});}});
    actions.append(caseCTA,caseExplore);metadata?.after(actions);
    const credits=document.createElement('details');credits.className='case-credits';
    const summary=document.createElement('summary');summary.textContent=portfolioCopy.caseDetails.common.creditSummary;
    caseCredits=document.createElement('p');credits.append(summary,caseCredits);
    if(source)credits.append(source);
    content.append(credits);
    const nav=document.createElement('nav');nav.className='case-navigation';nav.setAttribute('aria-label','Navegar pelas demonstrações');
    const previous=document.createElement('button');previous.type='button';previous.textContent='← Anterior';
    const nextCase=document.createElement('button');nextCase.type='button';nextCase.textContent='Próximo →';
    casePosition=document.createElement('span');casePosition.setAttribute('aria-live','polite');
    function navigate(direction){const index=caseKeys.indexOf(currentCase);openCase(caseKeys[(index+direction+caseKeys.length)%caseKeys.length],true);}
    previous.addEventListener('click',()=>navigate(-1));nextCase.addEventListener('click',()=>navigate(1));
    nav.append(previous,casePosition,nextCase);content.append(nav);
  }
  function openCase(id,navigating=false){
    const c=cases[id];if(!c||!dialog)return;
    if(!dialog.open)focusOrigin=document.activeElement;
    currentCase=id;
    dialog.dataset.case=id;
    dialogImage?.replaceChildren();
    if(c.image){
      const im=document.createElement('img');im.src=c.image;im.alt=c.imageAlt;im.loading='eager';
      im.addEventListener('error',()=>{im.hidden=true;const fallback=document.createElement('div');fallback.className='dialog-ci';fallback.textContent=c.title;dialogImage?.append(fallback);},{once:true});
      dialogImage?.appendChild(im);
    }else if(c.visual==='trajectory'){
      const panel=document.createElement('div');panel.className='dialog-trajectory';
      const label=document.createElement('span');label.textContent='TRAJETÓRIA PROFISSIONAL';
      const title=document.createElement('strong');title.textContent='Fatos Desconhecidos';
      const role=document.createElement('p');role.textContent='Direção criativa';
      const context=document.createElement('small');context.textContent='Experiência em criar conteúdo para grandes audiências.';
      panel.append(label,title,role,context);dialogImage?.append(panel);
    }else{
      const div=document.createElement('div');div.className='dialog-ci';
      for(const [index,label] of ['Ideia','Interface','Interação','Entrega'].entries()){
        const row=document.createElement('span');row.textContent=`0${index+1} / ${label}`;div.append(row);
      }
      dialogImage?.appendChild(div);
    }
    $('#dialog-kicker').textContent=c.kicker;
    $('#case-dialog-title').textContent=c.title;
    $('#dialog-description').textContent=c.description;
    $('#dialog-proof').textContent=c.proof;
    const proofTitle=$('.dialog-proof > span');if(proofTitle)proofTitle.textContent='O QUE EXPLORAR';
    if(statusBadge)statusBadge.textContent=c.status;
    metadata?.replaceChildren();
    for(const [term,description] of [['Minha contribuição',c.contribution]]){
      const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=term;dd.textContent=description;row.append(dt,dd);metadata?.append(row);
    }
    if(source){source.href=c.source;source.textContent=`${c.sourceLabel} ↗`;if(c.source.startsWith('#')){source.removeAttribute('target')}else{source.target='_blank'}}
    if(caseCredits)caseCredits.textContent=c.credit;
    if(caseCTA)caseCTA.textContent=`${c.cta} ↗`;
    if(caseExplore){caseExplore.href=currentCase==='smiile'?'#sistemas':c.section;caseExplore.dataset.productTarget=currentCase==='smiile'?'site':'';caseExplore.textContent=`${c.explore} ↓`;}
    if(casePosition)casePosition.textContent=`${caseKeys.indexOf(id)+1} / ${caseKeys.length}`;
    $('.case-credits',dialog)?.removeAttribute('open');
    if(!dialog.open){dialog.showModal();dialogClose?.focus();}
    if(content)content.scrollTop=0;
    dialog.scrollTop=0;
    if(navigating){const heading=$('#case-dialog-title');heading.tabIndex=-1;heading.focus({preventScroll:true});}
    recordInteraction(navigating?'case_navigate':'case_open',{case:id});
  }
  let returnFocus=true;
  function closeCase(restoreFocus=true){if(!dialog?.open)return;returnFocus=restoreFocus;dialog.close();}
  source?.addEventListener('click',()=>{if(source.getAttribute('href')?.startsWith('#'))closeCase(false)});
  document.addEventListener('click',event=>{const button=event.target.closest?.('[data-case]');if(button&&!button.closest('dialog'))openCase(button.dataset.case)});
  dialogClose?.addEventListener('click',()=>closeCase());
  dialog?.addEventListener('click',e=>{if(e.target===dialog){const bounds=dialog.getBoundingClientRect();if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)closeCase();}});
  dialog?.addEventListener('close',()=>{if(returnFocus)focusOrigin?.focus?.({preventScroll:true});returnFocus=true;});

  // A contact click opens the chosen application. Only the visitor can send the message.
  const brief=$('#brief-form');
  const profile=window.PORTFOLIO_PROFILE||{};
  const contact=window.PORTFOLIO_CONTACT;
  const destination=contact?.contactDestination(profile);
  let copyButton=null,preparedBox=null;
  if(brief){
    const submit=$('button[type="submit"]',brief),status=$('#form-status');
    const context=document.createElement('p');context.id='brief-context';context.className='brief-context';context.hidden=true;
    $('#service')?.before(context);
    $('#service')?.addEventListener('change',()=>{if(contactCase&&$('#service').value!==contactCaseService){contactCase='';contactCaseService='';context.hidden=true;context.textContent='';}});
    brief.dataset.contactReady=String(Boolean(destination));
    if(submit)submit.innerHTML=destination?`Continuar ${destination.channel==='whatsapp'?'no WhatsApp':'por e-mail'} <span aria-hidden="true">↗</span>`:'Copiar meu briefing <span aria-hidden="true">↗</span>';
    if(status)status.textContent=destination?sectionCopy('contato').submitHint:'O canal de contato está em configuração. Você pode preparar e copiar o briefing por aqui.';
    if(destination){
      copyButton=document.createElement('button');copyButton.type='button';copyButton.className='brief-copy';copyButton.textContent='Prefiro copiar o briefing';
      submit?.after(copyButton);
      if(destination.channel==='whatsapp'&&contact.contactDestination({...profile,whatsapp:''})){
        const emailButton=document.createElement('button');emailButton.type='button';emailButton.className='brief-email';emailButton.textContent='Prefiro e-mail';
        emailButton.addEventListener('click',()=>{
          if(!brief.reportValidity())return;
          const emailLink=contact.createContactHref({...profile,preferredChannel:'email'},getBrief());
          if(!emailLink)return;
          recordInteraction('contact_click',{channel:'email',entry:contactCase?'case':'form'});
          if(status)status.textContent='Seu aplicativo de e-mail será aberto com o resumo. Revise e envie para iniciar a conversa. Se não abrir, use a opção de copiar.';
          window.location.href=emailLink.href;
        });
        submit?.after(emailButton);
      }
      const direct=document.createElement('a');direct.className='brief-direct';direct.href=contact.createContactHref(profile).href;direct.textContent=destination.channel==='whatsapp'?'Abrir uma conversa sem preencher o formulário ↗':'Escrever um e-mail sem preencher o formulário ↗';
      if(destination.channel==='whatsapp'){direct.target='_blank';direct.rel='noopener noreferrer';}
      direct.addEventListener('click',()=>recordInteraction('contact_click',{channel:destination.channel,entry:'direct'}));
      brief.append(direct);
    }
    if(profile.name){$$('[data-professional-name]').forEach(el=>{el.textContent=profile.name;});}
  }
  function getBrief(){
    const service=$('#service')?.value||'',description=$('#brief')?.value.trim()||'';
    return contact?contact.buildBrief(service,description,contactCase):`Olá! Quero conversar sobre um projeto.\n\nFrente: ${service}\nContexto: ${description}\n\nConheci seu trabalho no portfólio Ideia & Execução.`;
  }
  async function copyBrief(){
    if(!brief?.reportValidity())return;
    const message=getBrief(),status=$('#form-status');
    try{
      await navigator.clipboard.writeText(message);
      if(status)status.textContent='Briefing copiado. Cole na conversa que preferir; a cópia não envia uma mensagem.';
      if(preparedBox)preparedBox.hidden=true;
      recordInteraction('brief_copied',{entry:contactCase?'case':'form'});
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
    if(!brief.reportValidity())return;
    const link=contact?.createContactHref(profile,getBrief());
    if(!link){copyBrief();return;}
    recordInteraction('contact_click',{channel:link.channel,entry:contactCase?'case':'form'});
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
      const entry=link.matches('[data-project-need]')?'project_need':link.matches('.mobile-project-cta')?'mobile':link.closest('.hero')?'hero':'navigation';
      recordInteraction('contact_intent',{entry});
    }
  });

  // User controls decorative animation independently of OS preference.
  const pauseBtn=$('#motion-toggle');
  pauseBtn?.addEventListener('click',()=>{
    paused=!paused;
    document.body.classList.toggle('is-paused',paused);
    pauseBtn.setAttribute('aria-pressed',String(paused));
    const motionLabel=paused?'Retomar movimento':'Pausar movimento e reprodução';
    pauseBtn.setAttribute('aria-label',motionLabel);
    pauseBtn.setAttribute('title',motionLabel);
    pauseBtn.innerHTML=paused?'▶ <span>Retomar movimento</span>':'Ⅱ <span>Pausar movimento</span>';
  });

  // Missing cross-origin previews degrade to intentional graphic fallback, not fake artwork.
  $$('img[src^="https://smiile-landing-preview.up.railway.app/"]').forEach(img=>{
    img.addEventListener('error',()=>{img.style.opacity='.2';img.setAttribute('alt','Imagem da demonstração smiile indisponível neste momento')},{once:true});
  });
  // Ensure no focus remains behind the mobile nav when it is closed.
  addEventListener('resize',()=>{if(!matchMedia('(max-width:900px)').matches)closeMenu(Boolean(mobileNav?.contains(document.activeElement)))});
  requestAnimationFrame(()=>{requestUpdate();updateScroll()});
})();
