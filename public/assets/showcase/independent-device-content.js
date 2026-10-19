/** Original, image-free screens for the three physical device shells.
 * Visual language: matte forest surface, outline number chip, mint rule,
 * tight headline and polished CSS/SVG interfaces. Fictional brand only.
 * Every test hook ([data-es-*]) exists once per piece; choice-specific
 * bodies are decorative (aria-hidden, no focusable elements) and the
 * active one is revealed by #editorial[data-project-choice]. No ids are
 * used because each piece is cloned as an inert side preview.
 */
export const projectTypes={
 site:{name:'Site ou app',hint:'Presença digital',type:'UX / Desenvolvimento',preview:'Landing page responsiva',direction:'Uma página que conduz à decisão.',goal:'Abertura, prova e convite, na ordem da decisão.',functions:['Estrutura','Copy','Interface'],result:'Uma presença que orienta a escolha.',detail:'Copy, identidade e navegação combinadas.',cta:'Conversar sobre um site ou app',service:'Sites e aplicativos'},
 campanha:{name:'Campanha',hint:'Oferta em cada canal',type:'Estratégia / Criativos',preview:'Campanha multicanal',direction:'A mesma oferta em cada formato.',goal:'Um conceito, três enquadramentos, uma chamada.',functions:['Conceito','Copy','Formatos'],result:'Uma oferta, vários formatos.',detail:'Criativos, intenção e destino trabalhando juntos.',cta:'Conversar sobre uma campanha',service:'Campanhas e anúncios'},
 sistema:{name:'Sistema',hint:'Pedidos organizados',type:'Produto / Fluxos',preview:'Painel operacional',direction:'Cada pedido segue um caminho.',goal:'Triagem por regra, revisão humana e um responsável.',functions:['Fluxo','Regras','Painel'],result:'Da solicitação à próxima ação.',detail:'Responsável, prioridade e andamento visíveis.',cta:'Conversar sobre um sistema',service:'Sistemas e automações'}
};
const choices=['site','campanha','sistema'];

/* 24px line icons, drawn with currentColor. */
const paths={
 site:'<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18M6.5 6.8h.01M9.2 6.8h.01"/>',
 campanha:'<path d="M4 10.2v3.6c0 .6.4 1 1 1h2.2l5.3 4V5.2l-5.3 4H5c-.6 0-1 .4-1 1z"/><path d="M16 9.2a4 4 0 0 1 0 5.6M18.6 6.6a7.6 7.6 0 0 1 0 10.8"/>',
 sistema:'<rect x="3" y="4" width="7.5" height="6" rx="1.6"/><rect x="13.5" y="14" width="7.5" height="6" rx="1.6"/><path d="M6.8 10v2.6a2.4 2.4 0 0 0 2.4 2.4h4.3"/>',
 check:'<path d="M5.5 12.6l4 4L18.5 7.5"/>',
 arrow:'<path d="M5 12h13.5M12.8 6.3L18.5 12l-5.7 5.7"/>',
 chevron:'<path d="M9.5 6l6 6-6 6"/>',
 bulb:'<path d="M9.2 17.6h5.6M10.2 20.6h3.6"/><path d="M12 3.4a6 6 0 0 0-3.7 10.7c.7.6 1 1.3 1 2.1v.4h5.4v-.4c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3.4z"/>',
 compass:'<circle cx="12" cy="12" r="8.6"/><path d="M15.4 8.6l-1.9 4.9-4.9 1.9 1.9-4.9z"/>',
 send:'<path d="M20.5 3.8L3.6 10.6l6.8 2.6 2.6 6.9z"/><path d="M10.4 13.2l10.1-9.4"/>',
 leaf:'<path d="M5 19.2c0-8.4 5.3-13.6 14.2-14.2C18.7 14 13.4 19.2 5 19.2z"/><path d="M5 19.2l6.8-6.8"/>',
 truck:'<path d="M3 6.5h10.5v9.3H3zM13.5 9.6h3.9l3.1 3.4v2.8h-7"/><circle cx="7" cy="17.4" r="1.6"/><circle cx="17.2" cy="17.4" r="1.6"/>',
 calendar:'<rect x="3.5" y="5" width="17" height="15" rx="2.2"/><path d="M3.5 9.6h17M8 3v4M16 3v4"/>',
 inbox:'<path d="M3.5 13.2L6.4 5.5h11.2l2.9 7.7v4.9c0 .8-.7 1.4-1.4 1.4H4.9c-.8 0-1.4-.6-1.4-1.4z"/><path d="M3.5 13.2h4.8l1.4 2.4h4.6l1.4-2.4h4.8"/>',
 filter:'<path d="M4.2 5.2h15.6l-6 7.3v5.9l-3.6 1.6v-7.5z"/>',
 briefcase:'<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5.6c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4v1.9M3.5 12.6h17"/>',
 shield:'<path d="M12 3.4l7 2.9v5.4c0 4.3-2.9 8-7 9.1-4.1-1.1-7-4.8-7-9.1V6.3z"/><path d="M9 12.1l2.1 2.1 3.9-4"/>',
 search:'<circle cx="11" cy="11" r="6.3"/><path d="M15.8 15.8l4.4 4.4"/>',
 grid:'<rect x="3.8" y="3.8" width="6.8" height="6.8" rx="1.5"/><rect x="13.4" y="3.8" width="6.8" height="6.8" rx="1.5"/><rect x="3.8" y="13.4" width="6.8" height="6.8" rx="1.5"/><rect x="13.4" y="13.4" width="6.8" height="6.8" rx="1.5"/>',
 lock:'<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
 plus:'<path d="M12 5.5v13M5.5 12h13"/>',
 heart:'<path d="M12 19.2s-7-4.2-7-9.4A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.2c0 5.2-7 9.4-7 9.4z"/>',
 dots:'<path d="M6 12h.01M12 12h.01M18 12h.01"/>'
};
const icon=(name,cls='')=>'<svg class="ds-ico'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+paths[name]+'</svg>';

/* Ceramic bottle, bowl and plinth: flat shapes only, no gradients or ids. */
const vase=(cls='')=>'<svg class="ds-vase'+(cls?' '+cls:'')+'" viewBox="0 0 120 110" aria-hidden="true" focusable="false">'+
 '<circle class="ds-vase-sun" cx="74" cy="40" r="30"/>'+
 '<path class="ds-vase-leaf" d="M27 76c-2-15 4-27 15-33-1 13-6 24-15 33z"/><path class="ds-vase-stem" d="M27 76c3-10 7-18 15-33"/>'+
 '<ellipse class="ds-vase-shadow" cx="62" cy="83" rx="34" ry="4"/>'+
 '<path class="ds-vase-plinth" d="M22 82h80v18c0 1.1-.9 2-2 2H24c-1.1 0-2-.9-2-2z"/><path class="ds-vase-plinth-top" d="M22 82h80l-4-5H26z"/>'+
 '<path class="ds-vase-body" d="M51 22h12v8c0 3 11 7 11 21v19c0 6-5 9-11 9H51c-6 0-11-3-11-9V51c0-14 11-18 11-21z"/>'+
 '<path class="ds-vase-glaze" d="M51 22h12v8c0 3 11 7 11 21v1.5c-8 3.5-26 3.5-34 0V51c0-14 11-18 11-21z"/>'+
 '<path class="ds-vase-lip" d="M49.5 19.5h15v3.5h-15z"/>'+
 '<path class="ds-vase-light" d="M45.5 58c0-6 1.5-10 4-13"/>'+
 '<path class="ds-vase-bowl" d="M76 70h24c0 6-5.4 9.5-12 9.5S76 76 76 70z"/><path class="ds-vase-bowl-rim" d="M76 70h24"/>'+
'</svg>';

/* Shared creative formats: the same fictional offer in three placements. */
const creatives=(size)=>'<div class="ds-creatives ds-creatives--'+size+'">'+
 '<figure class="ds-cr-wrap ds-cr-wrap--feed"><div class="ds-cr ds-cr--feed">'+
  '<div class="ds-cr-top"><i class="ds-cr-avatar">A</i><span><b>Ateliê Exemplo</b><small>Patrocinado</small></span></div>'+
  '<div class="ds-cr-media">'+vase()+'<em>Nova coleção</em></div>'+
  '<div class="ds-cr-foot"><span>Feita à mão, para durar.</span><b>Saiba mais</b></div>'+
 '</div><figcaption>Feed 4:5</figcaption></figure>'+
 '<figure class="ds-cr-wrap ds-cr-wrap--story"><div class="ds-cr ds-cr--story">'+
  '<div class="ds-cr-progress"><i></i><i></i><i></i></div>'+
  '<div class="ds-cr-top"><i class="ds-cr-avatar">A</i><span><b>Ateliê Exemplo</b></span></div>'+
  '<strong>Feita à mão, para durar.</strong>'+vase('ds-vase--story')+
  '<b class="ds-cr-swipe"><span class="ds-cr-long">Ver coleção</span><span class="ds-cr-short">Ver</span></b>'+
 '</div><figcaption>Stories 9:16</figcaption></figure>'+
 '<figure class="ds-cr-wrap ds-cr-wrap--search"><div class="ds-cr ds-cr--search">'+
  '<div class="ds-cr-searchbar">'+icon('search')+'<span>cerâmica feita à mão</span></div>'+
  '<div class="ds-cr-result"><small><b>Patrocinado</b> · Ateliê Exemplo</small>'+
  '<strong>Cerâmica feita à mão | Nova coleção</strong>'+
  '<p>Peças em pequenas tiragens, criadas no ateliê.</p>'+
  '<span class="ds-cr-links"><span>Vasos</span><span>Canecas</span><span>Oficinas</span></span></div>'+
 '</div><figcaption>Pesquisa</figcaption></figure>'+
'</div>';

const variant=(choice,body)=>'<div class="ds-variant" data-ds-variant="'+choice+'" aria-hidden="true">'+body+'</div>';

/* iPad: direction visuals. */
const ipadSite='<div class="ds-map">'+
 '<div class="ds-map-cols">'+
  '<div class="ds-map-col"><span class="ds-map-k">01</span><b>Abertura</b><div class="ds-wire ds-wire--hero"><i class="ds-w-h"></i><i class="ds-w-h ds-w-h--s"></i><i class="ds-w-btn"></i><i class="ds-w-sun"></i></div></div>'+
  '<i class="ds-map-arrow">'+icon('chevron')+'</i>'+
  '<div class="ds-map-col"><span class="ds-map-k">02</span><b>Prova</b><div class="ds-wire ds-wire--proof"><i>'+icon('leaf')+'</i><i>'+icon('truck')+'</i><i>'+icon('calendar')+'</i></div></div>'+
  '<i class="ds-map-arrow">'+icon('chevron')+'</i>'+
  '<div class="ds-map-col"><span class="ds-map-k">03</span><b>Convite</b><div class="ds-wire ds-wire--cta"><i class="ds-w-h"></i><i class="ds-w-h ds-w-h--s"></i><i class="ds-w-pill">'+icon('arrow')+'</i></div></div>'+
 '</div>'+
 '<div class="ds-map-foot"><span class="ds-swatches"><i></i><i></i><i></i><i></i></span><span class="ds-type"><b>Aa</b><small>Títulos 650<br>Texto 400</small></span></div>'+
'</div>';
const ipadSystem='<div class="ds-flow">'+
 '<div class="ds-ticket"><span class="ds-prio ds-prio--alta">Alta</span><span class="ds-ticket-text"><b>Orçamento de reforma</b><small>Novo pedido · hoje, 10:09</small></span><i>'+icon('chevron')+'</i></div>'+
 '<i class="ds-flow-arrow ds-flow-arrow--in">'+icon('arrow')+'</i>'+
 '<div class="ds-flow-nodes">'+
  '<div class="ds-node"><i>'+icon('inbox')+'</i><b>Pedido recebido</b><small>Formulário do site</small></div>'+
  '<i class="ds-flow-arrow">'+icon('arrow')+'</i>'+
  '<div class="ds-node ds-node--focus"><i>'+icon('filter')+'</i><b>Triagem</b><small>Tipo e urgência</small><em class="ds-tag">'+icon('shield')+'Revisão humana</em></div>'+
  '<i class="ds-flow-arrow">'+icon('arrow')+'</i>'+
  '<div class="ds-node"><i>'+icon('briefcase')+'</i><b>Responsável</b><small>Comercial · prazo visível</small></div>'+
 '</div>'+
'</div>';

/* MacBook: delivered results. */
const macSite='<div class="ds-lp">'+
 '<div class="ds-lp-nav"><b class="ds-lp-logo"><i></i>Ateliê Exemplo</b><span class="ds-lp-links"><span>Peças</span><span>Oficinas</span><span>Sobre</span></span><span class="ds-lp-btn ds-lp-btn--ghost">Agendar visita</span></div>'+
 '<div class="ds-lp-hero"><div class="ds-lp-copy"><small>Cerâmica feita à mão</small><strong>Peças para usar todos os dias.</strong><p>Coleções pequenas, criadas no ateliê.</p>'+
  '<span class="ds-lp-actions"><span class="ds-lp-btn">Ver coleção'+icon('arrow')+'</span><span class="ds-lp-link">Como cuidamos</span></span></div>'+
  '<div class="ds-lp-art">'+vase('ds-vase--hero')+'</div></div>'+
 '<div class="ds-lp-cards">'+
  '<span><i>'+icon('leaf')+'</i><b>Feito à mão</b><small>Peças do ateliê</small></span>'+
  '<span><i>'+icon('truck')+'</i><b>Entrega cuidadosa</b><small>Embalagem protegida</small></span>'+
  '<span><i>'+icon('calendar')+'</i><b>Oficinas</b><small>Turmas pequenas</small></span>'+
 '</div>'+
'</div>';
const macCampaign='<div class="ds-board">'+
 '<div class="ds-board-head"><b>Nova coleção</b><span class="ds-board-pill">'+icon('check')+'Prontos para publicar</span></div>'+
 creatives('lg')+
'</div>';
const card=(title,area,prio,extra='')=>'<span class="ds-kb-card"><span class="ds-prio ds-prio--'+prio.toLowerCase()+'">'+prio+'</span><b>'+title+'</b><small>'+area+'</small>'+extra+'</span>';
const macSystem='<div class="ds-kb">'+
 '<div class="ds-kb-side"><i>'+icon('grid')+'</i><i class="is-on">'+icon('inbox')+'</i><i>'+icon('filter')+'</i><i>'+icon('calendar')+'</i></div>'+
 '<div class="ds-kb-main">'+
  '<div class="ds-kb-head"><b>Pedidos</b><span class="ds-kb-search">'+icon('search')+'Buscar pedido</span><span class="ds-kb-new">'+icon('plus')+'Novo pedido</span></div>'+
  '<div class="ds-kb-cols">'+
   '<div class="ds-kb-col"><span class="ds-kb-title">Recebido<i>2</i></span>'+card('Orçamento de reforma','Comercial','Alta')+card('Dúvida sobre entrega','Atendimento','Média')+'</div>'+
   '<div class="ds-kb-col"><span class="ds-kb-title">Em triagem<i>2</i></span>'+card('Troca de produto','Logística','Média','<em class="ds-tag">'+icon('shield')+'Revisão humana</em>')+card('Segunda via de nota','Financeiro','Baixa')+'</div>'+
   '<div class="ds-kb-col"><span class="ds-kb-title">Concluído<i>2</i></span>'+card('Agendamento de visita','Atendimento','Baixa','<em class="ds-done">'+icon('check')+'</em>')+card('Revisão de contrato','Jurídico','Média','<em class="ds-done">'+icon('check')+'</em>')+'</div>'+
  '</div>'+
 '</div>'+
'</div>';

const head=(n,title,sub,subAttr='')=>'<div class="ds-head"><span class="ds-chip" aria-hidden="true">'+n+'</span><span class="ds-head-text"><strong>'+title+'</strong><small'+subAttr+'>'+sub+'</small></span></div><i class="ds-rule" aria-hidden="true"></i>';
const option=(choice,pressed)=>{const item=projectTypes[choice];return '<button type="button" data-es-choice="'+choice+'" data-no-editorial-swipe aria-pressed="'+pressed+'">'+
 '<i class="ds-opt-ico">'+icon(choice)+'</i><b class="ds-opt-text">'+item.name+'<small>'+item.hint+'</small></b><i class="ds-opt-check">'+icon('check')+'</i></button>';};
const step=(name,label,current)=>'<span class="ds-step'+(current?' is-current':'')+'"><i>'+icon(name)+'</i><span>'+label+'</span></span>';

export function deviceMarkup(step_,index){
 if(index===0)return '<div class="es-screen es-screen--iphone ds-screen"><article class="es-piece es-piece-hook ds-phone" data-es-piece="0">'+
  '<div class="ds-phone-inner">'+head('01','Desafio','Ponto de partida')+
  '<h3 class="ds-title">O que sua empresa precisa criar?</h3>'+
  '<p class="ds-support">Escolha uma frente. A direção e a entrega se adaptam.</p>'+
  '<div class="ds-steps" aria-hidden="true">'+step('bulb','Desafio',true)+'<i class="ds-step-chev">'+icon('chevron')+'</i>'+step('compass','Direção')+'<i class="ds-step-chev">'+icon('chevron')+'</i>'+step('send','Entrega')+'</div>'+
  '<div class="ds-options"><p class="ds-options-label">Escolha uma opção</p>'+
  '<div class="es-demo-choice-group ds-choices" role="group" aria-label="Tipo de projeto">'+option('site',true)+option('campanha',false)+option('sistema',false)+'</div></div>'+
  '<button type="button" class="ds-next" data-es-go="1" data-no-editorial-swipe><span>Ver a direção</span>'+icon('arrow')+'</button>'+
  '</div></article></div>';
 if(index===1)return '<div class="es-screen es-screen--ipad ds-screen"><article class="es-piece es-piece-context ds-ipad" data-es-piece="1" hidden>'+
  '<div class="ds-ipad-layout"><div class="es-ipad-info ds-ipad-info">'+head('02','Direção',projectTypes.site.type,' data-es-category')+
  '<h3 class="ds-title" data-es-direction>'+projectTypes.site.direction+'</h3>'+
  '<div class="ds-decision"><i class="ds-decision-ico">'+icon('compass')+'</i><span><small>Decisão</small><p data-es-goal>'+projectTypes.site.goal+'</p></span></div>'+
  '<div class="es-ipad-functions ds-fns">'+projectTypes.site.functions.map(f=>'<span data-es-fn>'+f+'</span>').join('')+'</div></div>'+
  '<div class="es-ipad-visual ds-ipad-visual"><div class="es-demo-ipad-window ds-window">'+
   '<div class="ds-window-bar"><i></i><i></i><i></i><strong data-es-preview>'+projectTypes.site.preview+'</strong><small class="ds-window-tag" data-es-project-name>'+projectTypes.site.name+'</small></div>'+
   '<div class="ds-variants">'+variant('site',ipadSite)+variant('campanha',creatives('sm'))+variant('sistema',ipadSystem)+'</div>'+
  '</div></div></div>'+
 '</article></div>';
 return '<div class="es-screen es-screen--macbook ds-screen"><article class="es-piece es-piece-closing ds-mac" data-es-piece="2" hidden>'+
  '<div class="ds-mac-chrome" aria-hidden="true"><span><i></i><i></i><i></i></span><b class="ds-mac-url">'+icon('lock')+'<span data-es-prototype>'+projectTypes.site.preview+'</span></b><em>Prévia da entrega</em></div>'+
  '<div class="ds-mac-stage"><div class="ds-variants">'+variant('site',macSite)+variant('campanha',macCampaign)+variant('sistema',macSystem)+'</div></div>'+
  '<div class="es-demo-mac-copy ds-dock"><div class="ds-dock-text"><small>03 / Entrega</small>'+
  '<h3 data-es-result>'+projectTypes.site.result+'</h3><p data-es-detail>'+projectTypes.site.detail+'</p></div>'+
  '<a href="#contato" class="ds-cta" data-no-editorial-swipe data-es-cta data-contact-service="'+projectTypes.site.service+'" data-contact-source="editorial" data-contact-case="Uma ideia em três etapas · '+projectTypes.site.name+'"><span data-es-cta-label>'+projectTypes.site.cta+'</span>'+icon('arrow')+'</a></div>'+
 '</article></div>';
}
export function applyDeviceChoice(root,choice){
 if(!choices.includes(choice))choice='site';
 const item=projectTypes[choice];
 root.dataset.projectChoice=choice;
 root.querySelectorAll('[data-es-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.esChoice===choice)));
 const text=(selector,value)=>root.querySelectorAll(selector).forEach(n=>{if(n.textContent!==value)n.textContent=value;});
 text('[data-es-category]',item.type);text('[data-es-goal]',item.goal);text('[data-es-direction]',item.direction);
 text('[data-es-preview]',item.preview);text('[data-es-project-name]',item.name);
 text('[data-es-result]',item.result);text('[data-es-detail]',item.detail);text('[data-es-prototype]',item.preview);
 root.querySelectorAll('.es-ipad-functions').forEach(list=>list.querySelectorAll('[data-es-fn]').forEach((n,i)=>{n.textContent=item.functions[i]||'';}));
 root.querySelectorAll('[data-es-cta]').forEach(a=>{a.querySelector('[data-es-cta-label]').textContent=item.cta;a.dataset.contactService=item.service;a.dataset.contactCase='Uma ideia em três etapas · '+item.name;});
 return item;
}
