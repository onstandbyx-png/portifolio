/* Site interactions: editorial chapters, channel specimens, professional context and contact. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const media = matchMedia('(max-width:760px)');
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
    updateZoom();
  }
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  preference.addEventListener?.('change',()=>{reduced=preference.matches;requestUpdate()});

  // Reveal on first meaningful exposure. Never hide content without JS.
  if(!reduced&&'IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.07,rootMargin:'0px 0px 40px 0px'});
    $$('.reveal').forEach(el=>io.observe(el));
  }else $$('.reveal').forEach(el=>el.classList.add('is-visible'));

  // Present verified source contexts rather than a repeated fictitious product.
  const editorial=[{"label":"01 / ASSUNTO","title":"O que merece ser contado?","description":"A pergunta que abre uma história nasce da curiosidade e da pesquisa.","image":"/assets/portfolio/cena-desconhecidos.webp","alt":"Material visual da marca Fatos Desconhecidos"},{"label":"02 / CONTEXTO","title":"O contexto muda a perspectiva.","description":"Fontes, repertório e a escolha do recorte ajudam a explicar o que é relevante.","image":"/assets/portfolio/cena-negocios.webp","alt":"Composição editorial da vertical Fatos e Negócios"},{"label":"03 / NARRATIVA","title":"Uma mensagem encontra seu formato.","description":"O roteiro e a direção visual traduzem uma ideia para posts, vídeos e outras experiências.","image":"/assets/portfolio/cena-nerd.webp","alt":"Composição editorial da vertical Fatos Nerd"}];
  const editorialImg=$('#editorial-image'),editorialHead=$('#editorial-headline'),editorialCopy=$('#editorial-description'),editorialTag=$('#editorial-caption'),editorialNum=$('#editorial-num');
  let story=0;
  function setStory(i){
    if(i<0||i>=editorial.length)return;
    story=i;const data=editorial[i];
    $$('.editorial-step').forEach((el,j)=>{el.classList.toggle('is-current',j===i);el.setAttribute('aria-pressed',String(j===i))});
    if(editorialImg){editorialImg.src=data.image;editorialImg.alt=data.alt;}
    if(editorialHead)editorialHead.textContent=data.title;
    if(editorialCopy)editorialCopy.textContent=data.description;
    if(editorialTag)editorialTag.textContent=data.label;
    if(editorialNum)editorialNum.textContent=`0${i+1} / 03`;
  }
  $$('.editorial-step').forEach((btn,i)=>btn.addEventListener('click',()=>setStory(i)));
  setStory(0);

  // Scroll-zoom frame. Scroll always stays owned by the browser.
  const zoomTrack=$('#immersive-track'),zoomFrame=$('#immersive-frame');
  function updateZoom(){
    if(!zoomTrack||!zoomFrame)return;
    if(media.matches||reduced||paused){zoomFrame.style.removeProperty('--frame-width');zoomFrame.style.removeProperty('--frame-height');zoomFrame.style.removeProperty('--frame-radius');zoomFrame.style.removeProperty('--frame-scale');zoomFrame.style.removeProperty('--image-zoom');return;}
    const r=zoomTrack.getBoundingClientRect(),distance=zoomTrack.offsetHeight-innerHeight;
    const p=clamp(-r.top/Math.max(1,distance));
    const eased=p*p*(3-2*p);
    zoomFrame.style.setProperty('--frame-width',`${85+15*eased}%`);
    zoomFrame.style.setProperty('--frame-height',`${74+26*eased}%`);
    zoomFrame.style.setProperty('--frame-radius',`${20-20*eased}px`);
    zoomFrame.style.setProperty('--frame-scale',String(.92+.08*eased));
    zoomFrame.style.setProperty('--image-zoom',String(1.08-.08*eased));
  }

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
    const descriptions={meta:'META / FEED 4:5',tiktok:'TIKTOK / VÍDEO 9:16',google:'GOOGLE / SEARCH',chatgpt:'CHATGPT / REPRESENTAÇÃO CONCEITUAL'};
    const context=$('#ad-context');if(context)context.textContent=descriptions[name];
    if(focus)selected.focus();
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
  let playback=null;
  const playBtn=$('[data-play-story]');
  function stopPlayback(){if(playback){clearInterval(playback);playback=null};if(playBtn){playBtn.setAttribute('aria-pressed','false');playBtn.innerHTML='Percorrer os quadros <span>▶</span>';}}
  playBtn?.addEventListener('click',()=>{
    if(playback){stopPlayback();return}
    if(reduced)return;
    playBtn.setAttribute('aria-pressed','true');playBtn.innerHTML='Pausar sequência <span>Ⅱ</span>';
    const text=$('.video-text');const lines=['Uma pergunta abre<br>a história.','A informação ganha<br>contexto.','A narrativa encontra<br>seu formato.'];let i=0;
    playback=setInterval(()=>{i=(i+1)%lines.length;if(text)text.innerHTML=lines[i]},1550);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback()});

  // CI sequence, explicitly illustrative.
  const sys=[["01 / IDEIA","Começa pela necessidade.","Escolher uma tarefa e um resultado útil para quem está usando."],["02 / DESIGN","A interface organiza escolhas.","Tipografia, componentes e hierarquia orientam a navegação."],["03 / INTERAÇÃO","O toque produz uma resposta.","Cada ação deve gerar uma reação compreensível e coerente."],["04 / RESULTADO","A experiência ganha vida.","Estados, responsividade e navegação são testados antes da publicação."]];
  $$('.system-step').forEach((b,i)=>b.addEventListener('click',()=>{
    $$('.system-step').forEach((x,j)=>{x.classList.toggle('is-current',j===i);x.setAttribute('aria-pressed',String(j===i))});
    $('#system-step-label').textContent=sys[i][0];$('#system-display-title').textContent=sys[i][1];$('#system-display-copy').textContent=sys[i][2];
  }));

  // Cases separate professional background, authorial concepts and working demonstrations.
  const cases={"fatos":{"kicker":"FATOS / EXPERIÊNCIA PROFISSIONAL","title":"Redação, direção criativa e narrativa.","description":"Experiência editorial com grandes audiências e múltiplas verticais. A apresentação destaca o trabalho de pesquisar, escolher o recorte e contar histórias.","status":"Experiência profissional","challenge":"Como construir um assunto relevante?","decision":"Começar pelo que merece ser descoberto e organizar informação, roteiro e linguagem visual.","contribution":"Atuação em direção criativa e redação. As imagens da rede pertencem aos projetos Fatos e não são atribuídas integralmente a uma pessoa.","proof":"Veja a narrativa em três momentos e materiais fotográficos da marca.","image":"/assets/portfolio/cena-desconhecidos.webp","imageAlt":"Material de origem da Fatos Desconhecidos","source":"https://www.instagram.com/fatosdesconhecidos/","sourceLabel":"Fonte institucional Fatos","credit":"Conteúdo original da rede, sem oferta de publicação.","service":"Redação e conteúdo","cta":"Conversar sobre projeto","section":"#editorial","explore":"Explorar narrativa"},"ads":{"kicker":"CAMPANHAS / CRIAÇÃO E MÍDIA","title":"Campanhas com conceito e execução.","description":"Estratégia, criatividade, copy, configuração e otimização de anúncios. As peças visuais desta página são estudos de formatos, não anúncios veiculados.","status":"Estudo demonstrativo","challenge":"Como mudar a linguagem sem perder a mensagem?","decision":"Traduzir posicionamento, criativo, formato e ação para o canal certo.","contribution":"Conceitos, roteiros e composições visuais. A operação de Ads é apresentada como capacidade, sem dados financeiros não verificados.","proof":"Compare feed, vídeo, pesquisa paga e proposta contextual no laboratório.","image":"/assets/portfolio/cena-negocios.webp","imageAlt":"Composição de Fatos e Negócios","source":"https://portifolio-github-production.up.railway.app/#laboratorio","sourceLabel":"Laboratório de anúncios","credit":"Estudos conceituais sem métricas ou campanhas verificadas.","service":"Campanhas e criativos","cta":"Conversar sobre campanha","section":"#laboratorio","explore":"Explorar formatos"},"smiile":{"kicker":"SMIILE / SITES E APPS","title":"Experiências que respondem ao toque.","description":"Desenvolvimento de sites, aplicações e componentes interativos com demonstrações visuais reais da smiile.","status":"Produto próprio","challenge":"Como apresentar um produto antes da explicação longa?","decision":"Permitir que o visitante explore páginas, dispositivos e estados de interação.","contribution":"Direção visual, UX/UI, integração de interface e desenvolvimento de projetos próprios.","proof":"Alterne desktop/mobile e páginas; veja a landing smiile publicada.","image":"/assets/portfolio/smiile-architecture-coast.webp","imageAlt":"Experiência Casa Costa da smiile","source":"https://smiile-landing-preview.up.railway.app/","sourceLabel":"Landing smiile atual","credit":"Demonstração com interações locais.","service":"Sites e experiências digitais","cta":"Conversar sobre projeto","section":"#experiencias","explore":"Explorar interface"},"video":{"kicker":"MOTION / ESTÚDIO INTERATIVO","title":"Vídeo, matéria e movimento.","description":"Estudo visual com material em vídeo, recorte, dobra cinética, tipografia e exploração de camadas.","status":"Estudo demonstrativo","challenge":"Como deixar um material visual demonstrar a sua criação?","decision":"Fazer a imagem responder ao visitante por meio de interações verificáveis.","contribution":"Direção visual e desenvolvimento de animações, texturas e experiências com vídeo.","proof":"Explore o vídeo, a dobra de canto, os materiais e os controles manuais do estúdio.","image":"/assets/portfolio/smiile-creative-studio.webp","imageAlt":"Imagem da smiile de estúdio criativo","source":"https://portifolio-github-production.up.railway.app/#estudio-interativo","sourceLabel":"Estúdio de movimento","credit":"Demonstração com interações locais.","service":"Sites e experiências digitais","cta":"Conversar sobre vídeo","section":"#estudio-interativo","explore":"Explorar estúdio"}};
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
    actions.append(caseCTA,caseExplore);$('#dialog-description')?.after(actions);
    const credits=document.createElement('details');credits.className='case-credits';
    const summary=document.createElement('summary');summary.textContent='Contexto e referências';
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
    const proofTitle=$('.dialog-proof > span');if(proofTitle)proofTitle.textContent='O QUE VOCÊ PODE EXPLORAR';
    if(statusBadge)statusBadge.textContent=c.status;
    metadata?.replaceChildren();
    for(const [term,description] of [['O desafio',c.challenge],['A decisão',c.decision],['Participação e contexto',c.contribution]]){
      const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=term;dd.textContent=description;row.append(dt,dd);metadata?.append(row);
    }
    if(source){source.href=c.source;source.textContent=`${c.sourceLabel} ↗`;}
    if(caseCredits)caseCredits.textContent=c.credit;
    if(caseCTA)caseCTA.textContent=`${c.cta} ↗`;
    if(caseExplore){caseExplore.href=c.section;caseExplore.textContent=`${c.explore} ↓`;}
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
  $$('[data-case]').forEach(btn=>btn.addEventListener('click',()=>openCase(btn.dataset.case)));
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
    if(status)status.textContent=destination?'Seu resumo será aberto no aplicativo escolhido. Revise a mensagem e envie quando quiser.':'O canal de contato está em configuração. Você pode preparar e copiar o briefing por aqui.';
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
    pauseBtn.innerHTML=paused?'▶ <span>Retomar movimento</span>':'Ⅱ <span>Pausar movimento</span>';
    if(paused)stopPlayback();
    updateZoom();
  });

  // Missing cross-origin previews degrade to intentional graphic fallback, not fake artwork.
  $$('img[src^="https://smiile-landing-preview.up.railway.app/"]').forEach(img=>{
    img.addEventListener('error',()=>{img.style.opacity='.2';img.setAttribute('alt','Imagem da demonstração smiile indisponível neste momento')},{once:true});
  });
  // Ensure no focus remains behind the mobile nav when it is closed.
  addEventListener('resize',()=>{if(!matchMedia('(max-width:900px)').matches)closeMenu(Boolean(mobileNav?.contains(document.activeElement)))});
  requestAnimationFrame(()=>{requestUpdate();updateScroll()});
})();
