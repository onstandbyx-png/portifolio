/** Original, image-free screens for the three physical device shells. */
export const projectTypes={
 site:{name:'Site ou app',type:'UX + DESENVOLVIMENTO',preview:'Landing page responsiva',goal:'Presença digital clara e navegável',result:'Uma presença que orienta a escolha.',detail:'Copy, identidade e navegação combinadas.',cta:'Explorar o projeto',service:'Sites e aplicativos'},
 campanha:{name:'Campanha',type:'ESTRATÉGIA + CRIATIVOS',preview:'Campanha multicanal',goal:'Apresentar uma oferta em diferentes canais',result:'Uma oferta, vários formatos.',detail:'Criativos, intenção e destino trabalhando juntos.',cta:'Ver proposta',service:'Campanhas e anúncios'},
 sistema:{name:'Sistema',type:'PRODUTO + FLUXOS',preview:'Painel operacional',goal:'Organizar um pedido até a próxima ação',result:'Da solicitação à próxima ação.',detail:'Responsável, prioridade e andamento visíveis.',cta:'Explorar solução',service:'Sistemas e automações'}
};
export function deviceMarkup(step,index){
 if(index===0)return '<div class="es-screen es-screen--iphone"><article class="es-piece es-piece-hook es-independent-phone" data-es-piece="0">'+
  '<div class="es-demo-phone-header"><b class="es-demo-mark">S.</b><span>STUDIO / EXPERIÊNCIAS</span></div>'+
  '<div class="es-demo-phone-main"><small>01 / DESAFIO</small><h3>O que sua empresa precisa criar?</h3><p>Escolha um desafio. A solução se adapta a você.</p>'+
  '<div class="es-demo-choice-title">SELECIONE UMA NECESSIDADE</div>'+
  '<div class="es-demo-choice-group" role="group" aria-label="Tipo de projeto">'+
  '<button type="button" data-es-choice="site" data-no-editorial-swipe aria-pressed="true">Site ou app <span>↗</span></button>'+
  '<button type="button" data-es-choice="campanha" data-no-editorial-swipe aria-pressed="false">Campanha <span>↗</span></button>'+
  '<button type="button" data-es-choice="sistema" data-no-editorial-swipe aria-pressed="false">Sistema <span>↗</span></button></div></div>'+
  '<div class="es-demo-phone-bottom"><span>PROTÓTIPO ORIGINAL</span><span>01 / 03</span></div>'+
 '</article></div>';
 if(index===1)return '<div class="es-screen es-screen--ipad"><article class="es-piece es-piece-context es-ipad-editorial es-independent-ipad" data-es-piece="1" hidden>'+
  '<div class="es-ipad-info"><div class="es-ipad-brand"><b class="es-demo-mark">S.</b><span>SMILE N <small data-es-category>UX + DESENVOLVIMENTO</small></span></div>'+
  '<span class="es-ipad-step">02 / DIREÇÃO</span><h3>Uma proposta que você pode explorar.</h3>'+
  '<p data-es-goal>Presença digital clara e navegável</p>'+
  '<div class="es-ipad-functions"><span>Estrutura</span><span>Copy</span><span>Interface</span></div></div>'+
  '<div class="es-ipad-visual"><div class="es-demo-ipad-window"><div class="es-demo-ipad-toolbar"><i></i><i></i><i></i><span>PRÉVIA DO PROJETO</span></div>'+
  '<div class="es-demo-ipad-panel"><small>PROTÓTIPO · ETAPA 02</small><strong data-es-preview>Landing page responsiva</strong>'+
  '<div class="es-demo-ipad-lines"><i></i><i></i><i></i></div><div class="es-demo-ipad-blocks"><i></i><i></i><i></i></div>'+
  '<p data-es-project-name>Site ou app</p></div></div></div>'+
 '</article></div>';
 return '<div class="es-screen es-screen--macbook"><article class="es-piece es-piece-closing es-macbook-editorial es-independent-mac" data-es-piece="2" hidden>'+
  '<div class="es-mac-browser"><span><i></i><i></i><i></i></span><b>PROTÓTIPO / DEMONSTRAÇÃO</b></div>'+
  '<div class="es-mac-nav"><strong>Smile N.</strong><span>Visão geral · Interface · Entrega</span><small>03 / ENTREGA</small></div>'+
  '<div class="es-mac-hero"><div class="es-demo-mac-layout"><div class="es-demo-mac-copy"><small>03 / RESULTADO NAVEGÁVEL</small>'+
  '<h3 data-es-result>Uma presença que orienta a escolha.</h3><p data-es-detail>Copy, identidade e navegação combinadas.</p>'+
  '<a href="#contato" data-no-editorial-swipe data-es-cta data-contact-service="Sites e aplicativos">Explorar o projeto ↗</a></div>'+
  '<div class="es-demo-mac-preview"><div class="es-demo-mac-surface"><div class="es-demo-mac-bar"><i></i><i></i><i></i></div>'+
  '<small>INTERFACE DESENVOLVIDA</small><strong data-es-prototype>Landing page responsiva</strong>'+
  '<div class="es-demo-mac-lines"><i></i><i></i><i></i></div><div class="es-demo-mac-tiles"><i></i><i></i><i></i></div>'+
  '</div></div></div></div>'+
 '</article></div>';
}
export function applyDeviceChoice(root,choice){
 const item=projectTypes[choice]||projectTypes.site;
 root.dataset.projectChoice=choice;
 root.querySelectorAll('[data-es-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.esChoice===choice)));
 const text=(selector,value)=>root.querySelectorAll(selector).forEach(n=>n.textContent=value);
 text('[data-es-category]',item.type);text('[data-es-goal]',item.goal);
 text('[data-es-preview]',item.preview);text('[data-es-project-name]',item.name);
 text('[data-es-result]',item.result);text('[data-es-detail]',item.detail);text('[data-es-prototype]',item.preview);
 root.querySelectorAll('[data-es-cta]').forEach(a=>{a.textContent=item.cta+' ↗';a.dataset.contactService=item.service});
}
