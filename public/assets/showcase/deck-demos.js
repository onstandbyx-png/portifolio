/** Six independent mini-experiences on the card backs, all local, fictional and image-free.
 * Every back follows one grammar: number chip + title + "Verso do cartão" pill, a short
 * headline, one interactive device scene drawn in HTML/CSS/inline SVG, one status line and
 * the contextual CTA. Controls never start deck gestures, transactions, requests or publications.
 */
const $=(root,selector)=>root.querySelector(selector);
const $$=(root,selector)=>Array.from(root.querySelectorAll(selector));
const ICONS={
 chevron:'<path d="M9 6l6 6-6 6"/>',
 chevronLeft:'<path d="M15 6l-6 6 6 6"/>',
 chevronUp:'<path d="M6 15l6-6 6 6"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 check:'<path d="M5 12.5l4.2 4.2L19 7"/>',
 play:'<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
 pause:'<path d="M7.5 5h3.2v14H7.5zM13.3 5h3.2v14h-3.2z" fill="currentColor" stroke="none"/>',
 replay:'<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
 back:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
 calendar:'<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.8 1.8"/>',
 list:'<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="4.8" cy="7" r=".9"/><circle cx="4.8" cy="12" r=".9"/><circle cx="4.8" cy="17" r=".9"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
 bag:'<path d="M5.5 8.5h13l-1 11.5h-11z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
 cart:'<path d="M3.5 5h2.2l2 10.5h10.2l1.8-7.5H7"/><circle cx="9.5" cy="19" r="1.2"/><circle cx="16.5" cy="19" r="1.2"/>',
 receipt:'<path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z"/><path d="M9 8.5h6M9 12.5h6"/>',
 feed:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 15.5h16"/>',
 stories:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M10 6.5h4"/>',
 heart:'<path d="M12 19.5s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.3-7 9.6-7 9.6z"/>',
 comment:'<path d="M4.5 5.5h15v10.5H10l-5.5 4z"/>',
 send:'<path d="M4 11.5L20 4l-6.5 16-2.6-6.2z"/>',
 dots:'<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>',
 spark:'<path d="M12 3.5l2 5.3 5.5 2-5.5 2-2 5.7-2-5.7-5.5-2 5.5-2z"/>',
 layers:'<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12.5l8 4 8-4"/>',
 megaphone:'<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
 film:'<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M3.5 9.5h17M8 5v4.5M16 5v4.5"/>',
 inbox:'<path d="M4 13l2.6-7.5h10.8L20 13v6H4z"/><path d="M4 13h4.8l1.2 2.2h4l1.2-2.2H20"/>',
 userCheck:'<circle cx="10" cy="8" r="3.5"/><path d="M4 20a6 6 0 0 1 11.2-3"/><path d="M15.5 16.5l2 2 3.5-3.8"/>',
 tag:'<path d="M4 12.5V4.5h8l8 8-8 8z"/><circle cx="8.3" cy="8.8" r="1.3"/>',
 lifebuoy:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/><path d="M6.4 6.4l3.2 3.2M14.4 14.4l3.2 3.2M17.6 6.4l-3.2 3.2M9.6 14.4l-3.2 3.2"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
};
const icon=name=>'<svg class="fdb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+ICONS[name]+'</svg>';
let uid=0;
/* One inline SVG landscape (no people, no photos): sky, sun, three ridges and mist. */
const TONES={
 dusk:['#2e5752','#a98b6b','#e9b072','#f6d39e','#fff0d4','#7b9085','#45635a','#1f3d33'],
 dawn:['#35566a','#86a2a8','#d6c3a2','#f1dbb2','#fff4de','#768c98','#465f6c','#21384a']
};
function landscape(tone){
 const id='fdb-sky-'+(++uid),c=TONES[tone];
 return '<svg class="fdb-landscape" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>'+
  '<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset=".48" stop-color="'+c[1]+'"/><stop offset=".72" stop-color="'+c[2]+'"/><stop offset="1" stop-color="'+c[3]+'"/></linearGradient>'+
  '<linearGradient id="'+id+'m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[4]+'" stop-opacity="0"/><stop offset="1" stop-color="'+c[4]+'" stop-opacity=".45"/></linearGradient></defs>'+
  '<rect width="320" height="180" fill="url(#'+id+')"/>'+
  '<g class="fdb-l-sun"><circle cx="212" cy="104" r="70" fill="'+c[4]+'" opacity=".16"/><circle cx="212" cy="104" r="34" fill="'+c[4]+'" opacity=".3"/><circle cx="212" cy="104" r="14" fill="'+c[4]+'"/></g>'+
  '<g class="fdb-l-far"><path d="M-20 120L22 92l26 14 36-34 30 26 32-18 38 24 36-30 36 22 32-16 52 22 40-18 40 14V200H-20z" fill="'+c[5]+'"/></g>'+
  '<rect class="fdb-l-mist" x="-20" y="96" width="460" height="44" fill="url(#'+id+'m)"/>'+
  '<g class="fdb-l-mid"><path d="M-20 136l48-26 30 14 40-30 40 30 30-16 40 22 36-26 44 22 32-12 40-20 40 16 30-8V200H-20z" fill="'+c[6]+'"/></g>'+
  '<g class="fdb-l-near"><path d="M-20 156c44-18 92-10 132-6 52 6 94-14 146-8 30 4 52 8 82 4 30-4 60-6 90 0V200H-20z" fill="'+c[7]+'"/></g></svg>';
}
const jar=extra=>'<span class="fdb-jar'+(extra||'')+'" aria-hidden="true"><i class="fdb-jar-lid"></i><i class="fdb-jar-body"><b></b></i></span>';
const examples={
 sites:{title:'Sites e apps',sub:'UX / Desenvolvimento',headline:'Do clique ao horário marcado.',status:'Escolha um serviço para ver os horários.',service:'Sites e aplicativos',cta:'Conversar sobre site ou app',steps:[['list','Serviço'],['clock','Horário'],['check','Pronto']]},
 conteudo:{title:'Conteúdo e copy',sub:'Redação / Narrativa',headline:'Qual abertura prende mais?',status:'Escolha A ou B para ver a sequência.',service:'Conteúdo e redação',cta:'Conversar sobre conteúdo',steps:[['spark','Abertura'],['layers','Contexto'],['send','Convite']]},
 campanhas:{title:'Campanhas e Ads',sub:'Estratégia / Ads',headline:'Uma oferta, três superfícies.',status:'',service:'Campanhas e anúncios',cta:'Conversar sobre uma campanha',steps:null},
 video:{title:'Vídeo e movimento',sub:'Direção / Movimento',headline:'Três cenas, um ritmo.',status:'Assista: dez segundos em três cenas.',service:'Vídeo e motion',cta:'Conversar sobre um vídeo',steps:[['spark','Gancho'],['film','Ação'],['megaphone','Convite']]},
 lojas:{title:'Lojas e produtos',sub:'Comércio / Interface',headline:'Da vitrine ao carrinho.',status:'Escolha a cor e adicione ao carrinho.',service:'Lojas e e-commerce',cta:'Conversar sobre uma loja',steps:[['bag','Produto'],['cart','Carrinho'],['receipt','Revisão']]},
 sistemas:{title:'Sistemas e IA',sub:'Produto / Automação',headline:'A IA sugere. Uma pessoa aprova.',status:'Classifique o pedido para ver a sugestão.',service:'Sistemas e automações',cta:'Conversar sobre um sistema',steps:[['inbox','Tipo'],['spark','Sugestão'],['userCheck','Aprovação']]}
};
const headline=ex=>'<p class="fdb-headline">'+ex.headline+'</p>';
const stepsRow=ex=>ex.steps?'<ol class="fdb-steps" aria-hidden="true">'+ex.steps.map(([name,label])=>'<li><span class="fdb-step-icon">'+icon(name)+'</span><span>'+label+'</span></li>').join('')+'</ol>':'';
const statusLine=text=>'<p class="fdb-status" role="status" data-fdb-status>'+text+'</p>';
const setStatus=(node,text)=>{$(node,'[data-fdb-status]').textContent=text;};
const setStep=(node,index)=>$$(node,'.fdb-steps li').forEach((li,i)=>{li.classList.toggle('is-done',i<index);li.classList.toggle('is-current',i===index);});
const focusQuietly=element=>element?.focus({preventScroll:true});
// The label names the conversation it opens; the demo title travels to the brief as context.
const makeCTA=(id,example)=>{const a=document.createElement('a');a.className='fd-project-link';a.href='#contato';a.dataset.contactService=example.service;a.dataset.contactSource='deck:'+id;a.dataset.contactCase=example.title+' · demonstração interativa';a.dataset.noCardFlip='';a.innerHTML='<span></span><span class="fdb-cta-arrow" aria-hidden="true">'+icon('arrow')+'</span>';a.firstChild.textContent=example.cta;return a;};

function sites(node,ex){
 const services=[{id:'aula',name:'Aula avulsa',meta:'60 min'},{id:'consultoria',name:'Consultoria',meta:'45 min'},{id:'oficina',name:'Oficina',meta:'2 horas'}];
 const times=['09:30','11:00','14:30','16:00'];
 node.innerHTML=headline(ex)+
 '<div class="fdb-stage fdb-stage--sites">'+
  '<div class="fdb-tablet fdb-site-tablet" aria-hidden="true"><div class="fdb-screen fdb-web">'+
   '<div class="fdb-web-nav"><i class="fdb-mark"></i><b>Ateliê Exemplo</b><span>Aulas</span><span>Agenda</span></div>'+
   '<div class="fdb-web-art"><i class="fdb-ps-sun"></i><i class="fdb-vase"></i><i class="fdb-bowl"></i></div>'+
   '<div class="fdb-web-copy"><strong>Aprenda no seu ritmo.</strong><span>'+icon('calendar')+'Agendar aula</span></div>'+
  '</div></div>'+
  '<div class="fdb-phone fdb-site-phone"><div class="fdb-screen fdb-app" data-fd-site-frame="servico">'+
   '<div class="fdb-statusbar" aria-hidden="true"><b>9:41</b><i></i></div>'+
   '<div class="fdb-app-bar" aria-hidden="true"><b>Agendar</b><span class="fdb-dots"><i></i><i></i><i></i></span></div>'+
   '<div class="fdb-view" data-view="servico"><p class="fdb-view-title" tabindex="-1">Qual serviço?</p><div class="fdb-rows" role="group" aria-label="Serviço">'+
    services.map(s=>'<button type="button" class="fdb-row" data-fd-site="'+s.id+'"><span><b>'+s.name+'</b><small>'+s.meta+'</small></span>'+icon('chevron')+'</button>').join('')+'</div></div>'+
   '<div class="fdb-view" data-view="horario" hidden><p class="fdb-view-title" tabindex="-1">Quinta, 24</p><p class="fdb-app-note" data-fd-site-chosen></p><div class="fdb-times" role="group" aria-label="Horário">'+
    times.map(t=>'<button type="button" class="fdb-chip" data-fd-site-time="'+t+'">'+t+'</button>').join('')+'</div></div>'+
   '<div class="fdb-view fdb-done" data-view="pronto" hidden><span class="fdb-done-mark">'+icon('check')+'</span><p class="fdb-view-title" tabindex="-1">Pronto</p><p class="fdb-done-text" data-fd-site-summary></p><button type="button" class="fdb-ghost" data-fd-site-reset>Recomeçar</button></div>'+
  '</div></div>'+
 '</div>'+stepsRow(ex)+statusLine(ex.status);
 const app=$(node,'[data-fd-site-frame]');let service=null;
 const show=(view,focus)=>{app.dataset.fdSiteFrame=view;$$(app,'.fdb-view').forEach(v=>{v.hidden=v.dataset.view!==view;});
  $$(app,'.fdb-dots i').forEach((dot,i)=>dot.classList.toggle('is-on',i<=['servico','horario','pronto'].indexOf(view)));
  setStep(node,['servico','horario','pronto'].indexOf(view));if(focus)focusQuietly($(app,'[data-view="'+view+'"] .fdb-view-title'));};
 $$(node,'[data-fd-site]').forEach(button=>button.addEventListener('click',()=>{service=services.find(s=>s.id===button.dataset.fdSite);$(node,'[data-fd-site-chosen]').textContent=service.name+' · '+service.meta;setStatus(node,service.name+': agora escolha um horário.');show('horario',true);}));
 $$(node,'[data-fd-site-time]').forEach(button=>button.addEventListener('click',()=>{const time=button.dataset.fdSiteTime;
  const summary=$(node,'[data-fd-site-summary]');summary.textContent='';const strong=document.createElement('b');strong.textContent=service?service.name:'Serviço';summary.append(strong,'Quinta, 24 · '+time);setStatus(node,'Horário '+time+' escolhido. Nada foi reservado.');show('pronto',true);}));
 $(node,'[data-fd-site-reset]').addEventListener('click',()=>{service=null;setStatus(node,ex.status);show('servico',true);});
 show('servico',false);
}

function conteudo(node,ex){
 const hooks={
  a:{line:'Só uma mochila?',tone:'dusk',why:'Gancho A: uma pergunta direta faz a pessoa responder por dentro.',seq:['Você levaria só uma mochila?','Mostre o que ficou de fora.','Conte o que não pode faltar.']},
  b:{line:'Leve só 3 itens',tone:'dawn',why:'Gancho B: uma lista curta promete algo útil e fácil de seguir.',seq:['Leve só 3 itens na trilha.','Um item por cena, e o porquê.','Salve para a próxima saída.']}
 };
 const labels=['ABERTURA','CONTEXTO','CONVITE'];
 const hookButton=key=>'<button type="button" class="fdb-hook" data-fd-hook="'+key+'" aria-pressed="false"><span class="fdb-hook-thumb">'+landscape(hooks[key].tone)+'<i>'+icon('play')+'</i></span><span class="fdb-hook-copy"><b>'+key.toUpperCase()+'</b><span>'+hooks[key].line+'</span></span></button>';
 node.innerHTML=headline(ex)+
 '<div class="fdb-stage fdb-stage--conteudo">'+
  '<div class="fdb-laptop fdb-hook-laptop"><div class="fdb-lid"><div class="fdb-screen fdb-player" data-fd-hook-screen="none">'+
   '<div class="fdb-scenery" data-tone="dusk">'+landscape('dusk')+landscape('dawn')+'</div>'+
   '<div class="fdb-segments" aria-hidden="true"><i></i><i></i><i></i></div>'+
   '<div class="fdb-player-copy"><small data-fd-story-label aria-hidden="true">TESTE DE GANCHO</small><strong data-fd-story-title>Escolha uma abertura.</strong></div>'+
   '<button type="button" class="fdb-tap fdb-tap--prev" data-fd-story-prev aria-label="Quadro anterior" disabled>'+icon('chevronLeft')+'</button>'+
   '<button type="button" class="fdb-tap fdb-tap--next" data-fd-story-next aria-label="Próximo quadro" disabled>'+icon('chevron')+'</button>'+
   '<span class="fdb-counter" data-fd-story-counter hidden>01 / 03</span>'+
  '</div></div><div class="fdb-base" aria-hidden="true"></div></div>'+
  '<div class="fdb-hook-panel" role="group" aria-label="Teste de gancho"><p class="fdb-hook-title">Teste de gancho</p><div class="fdb-hook-pair">'+hookButton('a')+'<span class="fdb-vs" aria-hidden="true">vs</span>'+hookButton('b')+'</div></div>'+
 '</div>'+stepsRow(ex)+statusLine(ex.status);
 let hook=null,step=0;const screen=$(node,'.fdb-player');
 const paint=announce=>{const h=hooks[hook];screen.dataset.fdHookScreen=hook;$(node,'.fdb-scenery').dataset.tone=h.tone;screen.dataset.step=String(step);
  $(node,'[data-fd-story-label]').innerHTML='<span class="fdb-label-hook">GANCHO '+hook.toUpperCase()+' · </span>'+labels[step];
  const title=$(node,'[data-fd-story-title]');title.textContent=h.seq[step];title.classList.remove('is-entering');void title.offsetWidth;title.classList.add('is-entering');
  const counter=$(node,'[data-fd-story-counter]');counter.hidden=false;counter.textContent=String(step+1).padStart(2,'0')+' / 03';
  $$(node,'.fdb-segments i').forEach((seg,i)=>seg.classList.toggle('is-on',i<=step));setStep(node,step);
  if(announce)setStatus(node,announce);};
 $$(node,'[data-fd-hook]').forEach(button=>button.addEventListener('click',()=>{hook=button.dataset.fdHook;step=0;
  $$(node,'[data-fd-hook]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $$(node,'.fdb-tap').forEach(b=>{b.disabled=false;});paint(hooks[hook].why);}));
 const move=delta=>{if(!hook)return;step=(step+delta+3)%3;paint('Quadro '+(step+1)+' de 3: '+labels[step].toLowerCase()+'.');};
 $(node,'[data-fd-story-prev]').addEventListener('click',()=>move(-1));
 $(node,'[data-fd-story-next]').addEventListener('click',()=>move(1));
 screen.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
}

function campanhas(node,ex){
 const formats={
  feed:{label:'Feed',ratio:'4:5',icon:'feed',status:'Feed 4:5: a imagem para a rolagem; o título vende.',aria:'Prévia no feed, formato 4:5: Ateliê Exemplo, patrocinado. Cerâmica feita à mão. Botão Saiba mais.'},
  stories:{label:'Stories',ratio:'9:16',icon:'stories',status:'Stories 9:16: a oferta ocupa a tela inteira.',aria:'Prévia em stories, formato 9:16: Cerâmica feita à mão, patrocinado, com Saiba mais na base.'},
  search:{label:'Pesquisa',ratio:'texto',icon:'search',status:'Pesquisa: o título responde ao que foi buscado.',aria:'Prévia de anúncio de pesquisa: Cerâmica feita à mão, Ateliê Exemplo, patrocinado, com links Coleção e Saiba mais.'}
 };
 const scene='<span class="fdb-product-scene" aria-hidden="true"><i class="fdb-ps-sun"></i><i class="fdb-ps-shelf"></i><i class="fdb-vase"></i><i class="fdb-bowl"></i></span>';
 const head='<span class="fdb-post-head"><i class="fdb-avatar"></i><span><b>Ateliê Exemplo</b><small>Patrocinado</small></span>'+icon('dots')+'</span>';
 node.innerHTML=headline(ex)+
 '<div class="fdb-stage fdb-stage--campanhas">'+
  '<div class="fdb-phone fdb-ad-phone"><div class="fdb-screen fdb-ad-screen" data-fd-campaign="feed" role="img" aria-label="'+formats.feed.aria+'">'+
   '<div class="fdb-ad" data-view="feed"><div class="fdb-statusbar"><b>9:41</b><i></i></div><div class="fdb-feed-top"><b>Feed</b>'+icon('heart')+icon('send')+'</div>'+head+
    '<div class="fdb-creative fdb-creative--feed">'+scene+'<strong>Cerâmica feita à mão</strong></div>'+
    '<div class="fdb-ad-cta"><b>Saiba mais</b>'+icon('chevron')+'</div><div class="fdb-post-icons">'+icon('heart')+icon('comment')+icon('send')+'</div><p class="fdb-post-cap"><b>Ateliê Exemplo</b> Peças únicas para a sua mesa.</p></div>'+
   '<div class="fdb-ad fdb-ad--stories" data-view="stories" hidden><div class="fdb-creative fdb-creative--story">'+scene+'</div><div class="fdb-story-bars"><i></i><i></i><i></i></div>'+head+
    '<strong class="fdb-story-title">Cerâmica feita à mão</strong><span class="fdb-story-sub">Peças únicas, coleção nova.</span><span class="fdb-story-cta">'+icon('chevronUp')+'<b>Saiba mais</b></span></div>'+
   '<div class="fdb-ad fdb-ad--search" data-view="search" hidden><div class="fdb-statusbar"><b>9:41</b><i></i></div><div class="fdb-search-bar">'+icon('search')+'<span>cerâmica feita à mão</span></div><div class="fdb-search-tabs"><b>Todos</b><span>Imagens</span><span>Mapas</span></div>'+
    '<div class="fdb-search-ad"><small>Patrocinado</small><span class="fdb-url"><i class="fdb-avatar"></i>atelie.exemplo</span><strong>Cerâmica feita à mão | Ateliê Exemplo</strong><p>Peças únicas para mesa e decoração. Conheça a coleção.</p><span class="fdb-sitelinks"><b>Coleção</b><b>Saiba mais</b></span></div>'+
    '<div class="fdb-search-org"><span class="fdb-url">guia.exemplo</span><strong>Como cuidar de peças de cerâmica</strong><p>Limpeza, uso diário e armazenamento.</p></div></div>'+
  '</div></div>'+
  '<div class="fdb-formats" role="group" aria-label="Formato do anúncio">'+Object.entries(formats).map(([key,f])=>'<button type="button" data-fd-channel="'+key+'" aria-pressed="false"><span class="fdb-format-icon">'+icon(f.icon)+'</span><span class="fdb-format-text"><b>'+f.label+'</b><small>'+f.ratio+'</small></span></button>').join('')+'</div>'+
 '</div>'+statusLine(formats.feed.status);
 const screen=$(node,'[data-fd-campaign]');
 const paint=type=>{screen.dataset.fdCampaign=type;screen.setAttribute('aria-label',formats[type].aria);$$(screen,'.fdb-ad').forEach(v=>{v.hidden=v.dataset.view!==type;});
  $$(node,'[data-fd-channel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fdChannel===type)));setStatus(node,formats[type].status);};
 $$(node,'[data-fd-channel]').forEach(b=>b.addEventListener('click',()=>paint(b.dataset.fdChannel)));paint('feed');
}

function video(node,ex){
 const scenes=[{tag:'01 · GANCHO',headline:'Uma ideia no primeiro quadro.'},{tag:'02 · AÇÃO',headline:'O movimento mostra como funciona.'},{tag:'03 · CONVITE',headline:'O fim aponta o próximo passo.'}];
 node.innerHTML=headline(ex)+
 '<div class="fdb-stage fdb-stage--video">'+
  '<div class="fdb-video-box"><div class="fdb-video-device" data-fd-ratio="16:9"><div class="fdb-video-frame"><div class="fdb-screen fdb-video-screen" role="group" aria-label="Storyboard animado de dez segundos" data-fd-motion-scene="0">'+
   '<div class="fdb-video-scenery">'+landscape('dusk')+'</div>'+
   '<div class="fdb-video-copy"><small data-fd-motion-tag aria-hidden="true"></small><strong data-fd-motion-title></strong></div>'+
   '<div class="fdb-video-bar"><span class="fdb-video-track" aria-hidden="true"><i data-fd-video-progress></i></span><output class="fdb-video-time" data-fd-video-time aria-live="off"><span data-fd-time-now>00:00</span><span class="fdb-time-total"> / 00:10</span></output></div>'+
  '</div></div><div class="fdb-base" aria-hidden="true"></div></div></div>'+
  '<div class="fdb-video-controls"><button type="button" class="fdb-play" data-fd-video-play aria-pressed="false" aria-label="Assistir"><span class="fdb-play-icon">'+icon('play')+'</span><span class="fdb-play-label">Assistir</span></button>'+
   '<button type="button" class="fdb-round" data-fd-video-replay aria-label="Reiniciar">'+icon('replay')+'</button>'+
   '<span class="fdb-seg" role="group" aria-label="Formato do vídeo"><button type="button" data-fd-video-ratio="16:9" aria-pressed="true">16:9</button><button type="button" data-fd-video-ratio="9:16" aria-pressed="false">9:16</button></span></div>'+
 '</div>'+stepsRow(ex)+statusLine(ex.status);
 let active=false,elapsed=0,last=0,raf=0,sceneIndex=-1;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const play=$(node,'[data-fd-video-play]'),time=$(node,'[data-fd-video-time]'),screen=$(node,'.fdb-video-screen'),device=$(node,'.fdb-video-device');
 const setPlayLabel=playing=>{const label=playing?'Pausar':'Assistir';play.setAttribute('aria-label',label);play.setAttribute('aria-pressed',String(playing));$(play,'.fdb-play-label').textContent=label;$(play,'.fdb-play-icon').innerHTML=icon(playing?'pause':'play');};
 const paint=()=>{const index=Math.min(2,Math.floor(elapsed/3500));
  if(index!==sceneIndex){sceneIndex=index;$(node,'[data-fd-motion-tag]').textContent=scenes[index].tag;
   const title=$(node,'[data-fd-motion-title]');title.innerHTML=scenes[index].headline.split(' ').map((word,i)=>'<span style="--i:'+i+'">'+word+'</span>').join(' ');
   title.classList.remove('is-entering');void title.offsetWidth;title.classList.add('is-entering');setStep(node,index);}
  $(node,'[data-fd-video-progress]').style.transform='scaleX('+Math.min(1,elapsed/10000)+')';
  $(node,'[data-fd-time-now]').textContent='00:'+String(Math.floor(elapsed/1000)).padStart(2,'0');
  screen.dataset.fdMotionScene=String(index);};
 // The clock updates every frame while playing; it is announced once playback stops.
 const announce=()=>{time.setAttribute('aria-live','polite');requestAnimationFrame(()=>{const now=$(time,'[data-fd-time-now]');now.textContent=now.textContent;});};
 const stop=()=>{const wasPlaying=active;active=false;cancelAnimationFrame(raf);raf=0;if(wasPlaying)announce();setPlayLabel(false);if(node.classList.contains('is-playing'))node.classList.remove('is-playing');};
 const available=()=>!reduce.matches&&!document.hidden&&!document.body.classList.contains('is-paused')&&Boolean(node.closest('.pf-fatos-card.is-active.is-flipped'));
 const tick=now=>{if(!active)return;if(!available()){stop();return;}elapsed=Math.min(10000,elapsed+Math.min(90,Math.max(0,now-last)));last=Math.max(last,now);paint();if(elapsed>=10000){stop();setStatus(node,'Fim: três cenas em dez segundos.');return;}raf=requestAnimationFrame(tick);};
 play.addEventListener('click',()=>{if(active){stop();setStatus(node,'Pausado na cena '+(sceneIndex+1)+' de 3.');return;}
  // Without motion, each press steps to the next scene instead of animating.
  if(reduce.matches||document.body.classList.contains('is-paused')){elapsed=elapsed>=10000?0:Math.min(10000,Math.floor(elapsed/3500)*3500+3500);paint();setStatus(node,'Cena '+(sceneIndex+1)+' de 3: '+scenes[sceneIndex].headline);return;}
  if(elapsed>=10000)elapsed=0;active=true;time.setAttribute('aria-live','off');node.classList.add('is-playing');setPlayLabel(true);last=performance.now();raf=requestAnimationFrame(tick);});
 $(node,'[data-fd-video-replay]').addEventListener('click',()=>{stop();elapsed=0;sceneIndex=-1;paint();setStatus(node,ex.status);});
 $$(node,'[data-fd-video-ratio]').forEach(button=>button.addEventListener('click',()=>{const ratio=button.dataset.fdVideoRatio;device.dataset.fdRatio=ratio;
  $$(node,'[data-fd-video-ratio]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  setStatus(node,ratio==='9:16'?'9:16: a mesma cena, recomposta para o celular.':'16:9: a cena horizontal, para tela grande.');}));
 reduce.addEventListener('change',()=>{if(reduce.matches)stop();});paint();return stop;
}

function lojas(node,ex){
 const variants={amber:'Âmbar',sage:'Sálvia'};
 node.innerHTML=headline(ex)+
 '<div class="fdb-stage fdb-stage--lojas" data-fd-color="amber">'+
  '<div class="fdb-shop-object" aria-hidden="true">'+jar(' fdb-jar--object')+'<i class="fdb-stone"></i><i class="fdb-leaf"></i></div>'+
  '<div class="fdb-tablet fdb-shop-tablet"><div class="fdb-screen fdb-shop">'+
   '<div class="fdb-shop-nav" aria-hidden="true"><i class="fdb-mark"></i><b>Ateliê Exemplo</b><span>'+icon('search')+'<span class="fdb-bag">'+icon('bag')+'<em data-fd-bag-count hidden>1</em></span></span></div>'+
   '<div class="fdb-shop-hero" aria-hidden="true">'+jar('')+'<i class="fdb-stone"></i></div>'+
   '<div class="fdb-shop-row"><div class="fdb-shop-info"><p class="fdb-shop-name">Creme facial</p><p class="fdb-shop-price">R$ 129,90</p></div>'+
    '<div class="fdb-swatches" role="group" aria-label="Cor do pote">'+Object.entries(variants).map(([key,label])=>'<button type="button" data-fd-variant="'+key+'" aria-pressed="'+(key==='amber')+'" aria-label="'+label+'"><i></i></button>').join('')+'</div></div>'+
   '<p class="fdb-shop-variant" aria-hidden="true">Cor: <b data-fd-variant-label>Âmbar</b></p>'+
   '<button type="button" class="fdb-add" data-fd-add>'+icon('bag')+'<span>Adicionar ao carrinho</span></button>'+
   '<div class="fdb-cart" data-fd-cart role="region" aria-label="Carrinho de demonstração" tabindex="-1" hidden>'+
    '<p class="fdb-cart-title">Carrinho · <span data-fd-cart-count>1 item</span></p>'+
    '<div class="fdb-cart-line"><span class="fdb-cart-thumb" aria-hidden="true">'+jar('')+'</span><span><b>Creme facial</b><small data-fd-cart-variant>Âmbar · R$ 129,90</small></span></div>'+
    '<p class="fdb-cart-note">Pagamento não incluído</p><button type="button" class="fdb-ghost" data-fd-cart-close>Continuar</button></div>'+
  '</div></div>'+
 '</div>'+stepsRow(ex)+statusLine(ex.status);
 const stage=$(node,'.fdb-stage'),cart=$(node,'[data-fd-cart]');let count=0;
 $$(node,'[data-fd-variant]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.fdVariant;stage.dataset.fdColor=key;$(node,'[data-fd-variant-label]').textContent=variants[key];
  $$(node,'[data-fd-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));setStatus(node,'Cor '+variants[key]+' escolhida.');}));
 $(node,'[data-fd-add]').addEventListener('click',()=>{count++;const items=count+(count===1?' item':' itens');const label=variants[stage.dataset.fdColor];
  $(node,'[data-fd-cart-count]').textContent=items;$(node,'[data-fd-cart-variant]').textContent=label+' · R$ 129,90';
  const badge=$(node,'[data-fd-bag-count]');badge.hidden=false;badge.textContent=String(count);
  cart.hidden=false;setStep(node,1);focusQuietly(cart);setStatus(node,items+' no carrinho de demonstração, sem pagamento.');});
 $(node,'[data-fd-cart-close]').addEventListener('click',()=>{cart.hidden=true;setStep(node,0);focusQuietly($(node,'[data-fd-add]'));setStatus(node,'Carrinho mantido. Nada foi cobrado.');});
 setStep(node,0);
}

function sistemas(node,ex){
 const types={orcamento:{label:'Orçamento',icon:'tag',queue:'Comercial',action:'Preparar proposta'},suporte:{label:'Suporte',icon:'lifebuoy',queue:'Suporte',action:'Responder com prazo'},parceria:{label:'Parceria',icon:'link',queue:'Parcerias',action:'Agendar conversa'}};
 node.innerHTML=headline(ex)+
 '<div class="fdb-stage fdb-stage--sistemas">'+
  '<div class="fdb-tablet fdb-ops-tablet"><div class="fdb-screen fdb-ops" data-fd-flow-view="entrada">'+
   '<div class="fdb-ops-bar"><i class="fdb-mark" aria-hidden="true"></i><b aria-hidden="true">Atendimento</b><span class="fdb-state" data-fd-flow-state>Entrada</span></div>'+
   '<div class="fdb-ops-body"><div class="fdb-ops-side" aria-hidden="true">'+icon('inbox')+icon('spark')+icon('userCheck')+'</div>'+
    '<div class="fdb-view fdb-ops-entry" data-view="entrada"><div class="fdb-msg"><p class="fdb-view-title" tabindex="-1">Nova mensagem</p><p class="fdb-msg-text">“Olá! Quero um site com agenda on-line.”</p><small aria-hidden="true">agora · formulário</small></div>'+
     '<div class="fdb-types" role="group" aria-label="Tipo do pedido">'+Object.entries(types).map(([key,t])=>'<button type="button" data-fd-flow-type="'+key+'">'+icon(t.icon)+'<span>'+t.label+'</span></button>').join('')+'</div></div>'+
    '<div class="fdb-view fdb-ops-suggest" data-view="sugestao" hidden><p class="fdb-view-title" tabindex="-1">'+icon('spark')+'<span>Sugestão de encaminhamento <em>(simulada)</em></span></p>'+
     '<dl class="fdb-route"><div><dt>Fila</dt><dd data-fd-flow-queue></dd></div><div><dt>Próximo passo</dt><dd data-fd-flow-action></dd></div></dl>'+
     '<div class="fdb-ops-actions"><button type="button" class="fdb-primary" data-fd-flow-next>'+icon('userCheck')+'<span>Aprovar</span></button><button type="button" class="fdb-ghost" data-fd-flow-reset>Voltar</button></div></div>'+
    '<div class="fdb-view fdb-done" data-view="pronto" hidden><span class="fdb-done-mark">'+icon('check')+'</span><p class="fdb-view-title" tabindex="-1">Pronto</p><p class="fdb-done-text" data-fd-flow-summary></p><button type="button" class="fdb-ghost" data-fd-flow-reset>Recomeçar</button></div>'+
   '</div>'+
  '</div></div>'+
 '</div>'+stepsRow(ex)+statusLine(ex.status);
 const screen=$(node,'.fdb-ops');let type=null;
 const show=(view,state,focus)=>{screen.dataset.fdFlowView=view;$$(screen,'.fdb-view').forEach(v=>{v.hidden=v.dataset.view!==view;});$(node,'[data-fd-flow-state]').textContent=state;
  setStep(node,['entrada','sugestao','pronto'].indexOf(view));if(focus)focusQuietly($(screen,'[data-view="'+view+'"] .fdb-view-title'));};
 $$(node,'[data-fd-flow-type]').forEach(button=>button.addEventListener('click',()=>{type=types[button.dataset.fdFlowType];
  $(node,'[data-fd-flow-queue]').textContent=type.queue;$(node,'[data-fd-flow-action]').textContent=type.action;
  setStatus(node,'Sugestão simulada: fila '+type.queue+'. Uma pessoa decide.');show('sugestao','Sugestão',true);}));
 $(node,'[data-fd-flow-next]').addEventListener('click',()=>{$(node,'[data-fd-flow-summary]').textContent='Tarefa criada na fila '+(type?type.queue:'Comercial')+'. Nenhuma mensagem foi enviada.';
  setStatus(node,'Aprovado por uma pessoa. Nada foi enviado.');show('pronto','Pronto',true);});
 $$(node,'[data-fd-flow-reset]').forEach(button=>button.addEventListener('click',()=>{type=null;setStatus(node,ex.status);show('entrada','Entrada',true);}));
 show('entrada','Entrada',false);
}

/* Reverse heading in the reference grammar: chip, title, discipline and "Verso do cartão". */
function dressBack(back,id){
 const example=examples[id],heading=$(back,'.pf-fatos-back-heading');
 if(heading&&!$(heading,'.fdb-verso')){
  const sub=$(heading,':scope>div>span');if(sub){sub.textContent=example.sub;sub.classList.add('fdb-sub');}
  const pill=document.createElement('span');pill.className='fdb-verso';pill.textContent='Verso do cartão';
  const rule=document.createElement('span');rule.className='fdb-rule';rule.setAttribute('aria-hidden','true');
  heading.append(pill,rule);
 }
 // The return control keeps its accessible name while it is drawn as a compact icon button.
 const ret=$(back,'[data-fatos-return]');
 if(ret&&!$(ret,'.fdb-return-icon')){const label=ret.textContent.replace(/[↶↻]/g,'').trim()||'Voltar ao cartão';ret.setAttribute('aria-label',label);ret.title=label;ret.classList.add('fdb-return');
  const glyph=document.createElement('span');glyph.className='fdb-return-icon';glyph.setAttribute('aria-hidden','true');glyph.innerHTML=icon('back');ret.append(glyph);}
}
export function mountDeckDemos(){
 const shell=document.querySelector('#colecao');
 if(!shell||shell.dataset.deckDemos==='ready')return;
 const factories={sites,conteudo,campanhas,video,lojas,sistemas},stoppers=[];
 $$(shell,'[data-fatos-card]').forEach(card=>{
  const id=card.dataset.fatosCard,back=$(card,'[data-fatos-back]');if(!back||!factories[id])return;
  back.classList.add('fdb-back');dressBack(back,id);
  const sample=document.createElement('section');sample.className='fd-demo fd-demo--'+id;sample.dataset.noCardFlip='';sample.setAttribute('aria-label','Demonstração visual de '+examples[id].title);
  $(back,'.pf-fatos-back-heading')?.after(sample);
  const stop=factories[id](sample,examples[id]);if(typeof stop==='function')stoppers.push(stop);
  sample.append(makeCTA(id,examples[id]));
 });
 const stopAll=()=>stoppers.forEach(stop=>stop());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
 new MutationObserver(()=>{if(document.body.classList.contains('is-paused'))stopAll();}).observe(document.body,{attributes:true,attributeFilter:['class']});
 const stage=$(shell,'.pf-fatos-stage');
 if(stage)new MutationObserver(()=>{if(!$(shell,'.pf-fatos-card.is-active.is-flipped'))stopAll();}).observe(stage,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
 if(typeof IntersectionObserver!=='undefined')new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)stopAll();},{threshold:.02}).observe(shell);
 shell.dataset.deckDemos='ready';
}
