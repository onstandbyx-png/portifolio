/* Site interactions: native-scroll capability deck, editorial chapters, functional channel specimens and cases.
   Motion timings/ease are adapted from the user-owned smiile commit b6a2e0d. */
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

  // Header and accessible mobile menu.
  const header = $('#site-header'), menuToggle = $('#menu-toggle'),mobileNav=$('#mobile-nav');
  function closeMenu(){ if(!menuToggle) return; menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Abrir menu');mobileNav.hidden=true; }
  menuToggle?.addEventListener('click',()=>{
    const opening=menuToggle.getAttribute('aria-expanded')!=='true';
    menuToggle.setAttribute('aria-expanded',String(opening));
    menuToggle.setAttribute('aria-label',opening?'Fechar menu':'Abrir menu');
    mobileNav.hidden=!opening;
  });
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

  // Global progress and on-screen motion, no wheel/touch hijacking.
  const progress=$('#reading-progress');let pending=false;
  function requestUpdate(){if(pending) return;pending=true;requestAnimationFrame(()=>{pending=false;updateScroll()})}
  function updateScroll(){
    header?.classList.toggle('is-scrolled',scrollY>12);
    const total=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(progress)progress.style.transform=`scaleX(${clamp(scrollY/total)})`;
    updateCategories();updateZoom();
  }
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  preference.addEventListener?.('change',()=>{reduced=preference.matches;requestUpdate()});

  // Reveal on first meaningful exposure. Never hide content without JS.
  if(!reduced&&'IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.07,rootMargin:'0px 0px 40px 0px'});
    $$('.reveal').forEach(el=>io.observe(el));
  }else $$('.reveal').forEach(el=>el.classList.add('is-visible'));

  // smiile-style native scroll progress with one active hanging card.
  const runway=$('#category-runway'),sticky=$('#category-sticky'),stage=$('#category-stage'),cards=$$('.category-card'),steps=$$('[data-category-go]'),counter=$('#category-counter'),bar=$('#category-progress-fill'),prev=$('#category-prev'),next=$('#category-next');
  const categoryFlow=()=>media.matches&&(innerHeight<720||reduced||paused);
  const zone=runway?.closest('.category-zone');
  let active=0, mostRecentInput=-1;
  function setActive(idx){
    idx=clamp(idx,0,cards.length-1);
    active=idx;
    cards.forEach((card,i)=>{
      const on=i===idx;
      card.classList.toggle('is-active',on);
      if(categoryFlow())card.inert=false;
      else card.inert=!on;
    });
    steps.forEach((b,i)=>{b.classList.toggle('is-current',i===idx);b.setAttribute('aria-current',i===idx?'step':'false')});
    if(counter)counter.textContent=`0${idx+1} / 0${cards.length}`;
    if(prev)prev.disabled=idx<=0;
    if(next)next.disabled=idx>=cards.length-1;
    if(bar)bar.style.width=`${(idx+1)/cards.length*100}%`;
  }
  function updateCategories(){
    if(!runway||!sticky||!stage)return;
    // Keep the selected card stable while its reverse face is being read. Clicking a
    // button must not inadvertently advance the scroll-controlled carousel.
    const openCard=$('.category-card.is-flipped');
    if(openCard && !categoryFlow()){
      const bounds=runway.getBoundingClientRect();
      if(bounds.bottom>sticky.offsetHeight && bounds.top<innerHeight){
        const index=Number(openCard.dataset.categoryIndex);
        if(active!==index)setActive(index);
        return;
      }
      openCard.classList.remove('is-flipped');
      const front=$('[data-card-turn]',openCard),back=$('[data-card-return]',openCard);
      if(front){front.setAttribute('aria-expanded','false');front.tabIndex=0}
      if(back)back.tabIndex=-1;
    }
    const flow=categoryFlow();
    runway.dataset.layout=flow?'flow':'linked';
    zone?.classList.toggle('pf-category-linked',!flow);
    if(flow){
      let best=0,nearest=Infinity;
      const vCenter=innerHeight*.48;
      cards.forEach((card,i)=>{const r=card.getBoundingClientRect();const d=Math.abs((r.top+r.height/2)-vCenter);if(d<nearest){nearest=d;best=i}
        card.style.removeProperty('--slide');card.style.removeProperty('--shift-y');card.style.removeProperty('--scale');card.style.removeProperty('--rot');card.style.removeProperty('--alpha');card.style.removeProperty('--brightness');card.style.zIndex='';});
      setActive(best);return;
    }
    const r=runway.getBoundingClientRect(),sr=sticky.getBoundingClientRect();
    const travel=Math.max(1,runway.offsetHeight-sticky.offsetHeight);
    const p=clamp((sr.top-r.top)/travel),position=p*(cards.length-1);
    const idx=Math.round(position);
    const span=media.matches?Math.min(innerWidth*.77,390):Math.min(innerWidth*.365,450);
    cards.forEach((card,i)=>{
      const delta=i-position,dist=Math.abs(delta);
      card.style.setProperty('--slide',`${delta*span}px`);
      card.style.setProperty('--shift-y',`${Math.min(92,dist*31)}px`);
      card.style.setProperty('--rot',`${(-delta*7)+Number.parseFloat(card.style.getPropertyValue('--angle')||'0')}deg`);
      card.style.setProperty('--scale',String(Math.max(.77,1-dist*.075)));
      card.style.setProperty('--alpha',String(Math.max(.28,1-dist*.24)));
      card.style.setProperty('--brightness',String(Math.max(.79,1-dist*.08)));
      card.style.zIndex=String(50-Math.round(dist*10));
    });
    if(idx!==active)setActive(idx);
  }
  function goToCategory(n){
    n=clamp(n,0,cards.length-1);
    mostRecentInput=n;
    if(categoryFlow()){cards[n].scrollIntoView({block:'center',behavior:smooth()});setActive(n);return;}
    const top=scrollY+runway.getBoundingClientRect().top+(runway.offsetHeight-sticky.offsetHeight)*(n/(cards.length-1));
    window.scrollTo({top,behavior:smooth()});
    if(reduced)setActive(n);
  }
  steps.forEach((b,i)=>b.addEventListener('click',()=>goToCategory(i)));
  prev?.addEventListener('click',()=>goToCategory(active-1));
  next?.addEventListener('click',()=>goToCategory(active+1));
  function flipCard(card,open){
    const current=card.classList.contains('is-flipped');
    const val=typeof open==='boolean'?open:!current;
    card.classList.toggle('is-flipped',val);
    const front=$('[data-card-turn]',card),back=$('[data-card-return]',card);
    front?.setAttribute('aria-expanded',String(val));
    if(front)front.tabIndex=val?-1:0;
    if(back)back.tabIndex=val?0:-1;
    const target=val?back:front;
    requestAnimationFrame(()=>target?.focus({preventScroll:true}));
    requestUpdate();
  }
  cards.forEach((card)=>{
    const flip=$('[data-card-turn]',card),back=$('[data-card-return]',card);
    flip?.addEventListener('click',()=>flipCard(card,true));
    back?.addEventListener('click',()=>flipCard(card,false));
    if(back)back.tabIndex=-1;
    if(categoryFlow())card.inert=false;
  });
  addEventListener('keydown',e=>{if(e.key==='Escape'){const flipped=$('.category-card.is-flipped');if(flipped&&document.activeElement?.closest('.category-card'))flipCard(flipped,false)}});

  // Native view transition fallback for editorial steps; source images from the original Fatos PDF.
  const editorial=[
    {label:'01 / PERGUNTA',title:'Uma pergunta muda o ponto de partida.',description:'Um assunto familiar abre a conversa sem inventar uma promessa.',image:'/assets/showcase/scenes/materia-viva.svg',alt:'Matéria viva, composição botânica para o primeiro capítulo'},
    {label:'02 / CONTEXTO',title:'A pesquisa transforma o olhar.',description:'Fontes, relações e contexto ajudam a compreender o tema.',image:'/assets/showcase/scenes/contexto.svg',alt:'Composição astronômica de pesquisa e conexões'},
    {label:'03 / NARRATIVA',title:'Uma descoberta encontra seu formato.',description:'O roteiro e a direção visual tornam a ideia compreensível.',image:'/assets/showcase/scenes/narrativa.svg',alt:'Composição editorial em camadas para o desdobramento final'}
  ];
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
    const text=$('.video-text');const lines=['E se o óbvio tiver<br>uma história melhor?','Tudo começa<br>com a pergunta.','O contexto dá<br>sentido à resposta.'];let i=0;
    playback=setInterval(()=>{i=(i+1)%lines.length;if(text)text.innerHTML=lines[i]},1550);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback()});

  // CI sequence, explicitly illustrative.
  const sys=[
    ['ETAPA 01 / ENTRADA','Tudo começa por uma pergunta verificável.','Uma entrada autorizada define o objetivo da investigação e os critérios que precisam ser comprovados.'],
    ['ETAPA 02 / FONTE','A informação precisa de uma origem.','Coleta, contexto, cobertura e identificação das fontes são registrados antes de qualquer conclusão.'],
    ['ETAPA 03 / RELAÇÕES','Conectar entidades sem perder a evidência.','A construção de relações permite explorar hipóteses, proveniência e evolução temporal.'],
    ['ETAPA 04 / DOSSIÊ','O resultado mantém seus limites explícitos.','O dossiê liga a síntese às evidências utilizadas, ao grau de cobertura e às lacunas que ainda restam.']
  ];
  $$('.system-step').forEach((b,i)=>b.addEventListener('click',()=>{
    $$('.system-step').forEach((x,j)=>{x.classList.toggle('is-current',j===i);x.setAttribute('aria-pressed',String(j===i))});
    $('#system-step-label').textContent=sys[i][0];$('#system-display-title').textContent=sys[i][1];$('#system-display-copy').textContent=sys[i][2];
  }));

  // Expandable case studies: native dialog with focus return and fixed provenance.
  const cases={
    fatos:{kicker:'FATOS DESCONHECIDOS / EXPERIÊNCIA EDITORIAL',title:'Curiosidade com contexto.',description:'Pesquisa e desenvolvimento de linguagem editorial, pautas, narrativas e formas de apresentação. Material visual do Ecossistema Fatos 2026, incluindo peças identificadas como conceituais.',proof:'O estudo mostra direção e estrutura de conteúdo. Não comprova uma campanha veiculada, números de mídia nem atribui a uma única pessoa todo o trabalho da rede.',image:'/assets/showcase/scenes/materia-viva.svg',source:'https://midia-kit-production-c234.up.railway.app/'},
    smiile:{kicker:'SMIILE / PRODUTO DIGITAL',title:'Da ideia à experiência navegável.',description:'Design de produto, interface interativa, cenas para demonstrar sites, aplicações, execução e orquestração. A seção de categorias deste portfólio adapta o mecanismo de rolagem natural da landing smiile.',proof:'A demonstração comprova a interface publicada no serviço de referência. Não representa todas as funcionalidades técnicas como homologadas ou disponíveis em produção.',image:'https://smiile-landing-preview.up.railway.app/assets/architecture-coast.webp',source:'https://smiile-landing-preview.up.railway.app/?v=b6a2e0d#categorias'},
    ci:{kicker:'SOTA CI INTEL / ARQUITETURA',title:'Investigar sem perder o rastro.',description:'Sistema de investigação e inteligência apoiado em fontes, entidades, grafos e dossiês auditáveis, com distinção entre evidências e hipóteses.',proof:'É um esquema didático da arquitetura documentada, não uma operação real executada ao abrir o portfólio. Nenhum dado privado é consultado nesta demonstração.',source:'https://github.com/smil3nirvan4-beep/sota-ci-intel'}
  };
  const dialog=$('#case-dialog'),dialogImage=$('#dialog-image'),dialogClose=$('#dialog-close');let focusOrigin=null;
  function openCase(id){const c=cases[id];if(!c||!dialog)return;
    focusOrigin=document.activeElement;
    dialogImage.replaceChildren();
    if(c.image){const im=document.createElement('img');im.src=c.image;im.alt=c.kicker;im.loading='eager';dialogImage.appendChild(im)}
    else{const div=document.createElement('div');div.className='dialog-ci';div.textContent='ENTRADA  →  EVIDÊNCIA  →  RELAÇÃO  →  DOSSIÊ';dialogImage.appendChild(div)}
    $('#dialog-kicker').textContent=c.kicker;
    $('#case-dialog-title').textContent=c.title;
    $('#dialog-description').textContent=c.description;
    $('#dialog-proof').textContent=c.proof;
    $('#dialog-source').href=c.source;
    dialog.showModal();dialogClose.focus();
  }
  function closeCase(){if(!dialog?.open)return;dialog.close();focusOrigin?.focus?.({preventScroll:true});}
  $$('[data-case]').forEach(btn=>btn.addEventListener('click',()=>openCase(btn.dataset.case)));
  dialogClose?.addEventListener('click',closeCase);
  dialog?.addEventListener('click',e=>{if(e.target===dialog)closeCase()});
  dialog?.addEventListener('close',()=>focusOrigin?.focus?.({preventScroll:true}));

  // Prepare brief locally; nothing gets silently sent anywhere.
  const brief=$('#brief-form');
  brief?.addEventListener('submit',async e=>{
    e.preventDefault();
    const msg=`Olá! Quero conversar sobre um projeto.\n\nÁrea: ${$('#service').value}\nDescrição: ${$('#brief').value.trim()}\n\nEnviado a partir do portfólio Ideia & Execução.`;
    const status=$('#form-status');
    try{await navigator.clipboard.writeText(msg);status.textContent='Briefing copiado. Cole em uma mensagem para compartilhar.'}
    catch{
      const box=document.createElement('textarea');box.value=msg;box.style.cssText='width:100%;min-height:120px;margin-top:12px';box.setAttribute('aria-label','Briefing pronto para copiar');status.textContent='Selecione e copie o texto preparado abaixo:';status.after(box);box.select();
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
  addEventListener('resize',()=>{if(!matchMedia('(max-width:900px)').matches)closeMenu()});
  setActive(0);
  requestAnimationFrame(()=>{requestUpdate();updateScroll()});
})();