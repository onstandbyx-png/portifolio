/** Six independent mini-experiences, all local and image-free.
 * Controls inside card backs do not initiate deck gestures or transactions.
 */
const $=(root,selector)=>root.querySelector(selector);
const $$=(root,selector)=>Array.from(root.querySelectorAll(selector));
const examples={
  sites:{title:'Sites e apps',caption:'Um protótipo navegável com dois formatos.',service:'Sites e aplicativos'},
  conteudo:{title:'Conteúdo e copy',caption:'A mesma ideia em três momentos de leitura.',service:'Conteúdo e redação'},
  campanhas:{title:'Campanhas e Ads',caption:'A oferta se adapta à superfície e à intenção.',service:'Campanhas e anúncios'},
  video:{title:'Vídeo e movimento',caption:'Ritmo e sequenciamento controlados por você.',service:'Vídeo e motion'},
  lojas:{title:'Lojas e produtos',caption:'Escolhas com feedback, sem checkout ou pagamento.',service:'Lojas e e-commerce'},
  sistemas:{title:'Sistemas e IA',caption:'O atendimento vira uma tarefa em um fluxo local.',service:'Sistemas e automações'}
};
const header=(label,lead)=>'<header class="fd-head"><span class="fd-kicker">DEMONSTRAÇÃO ORIGINAL · '+label+'</span><strong>'+lead+'</strong></header>';
const makeCTA=service=>{const a=document.createElement('a');a.className='fd-project-link';a.href='#contato';a.dataset.contactService=service;a.dataset.noCardFlip='';a.textContent='Quero um projeto assim ↗';return a;};
function sites(node){
 node.innerHTML=header('SITES + APPS','Da estrutura à interface navegável.')+
 '<div class="fd-switch" role="group" aria-label="Tipo de interface"><button type="button" data-fd-site="site" aria-pressed="true">Site</button><button type="button" data-fd-site="app" aria-pressed="false">Aplicativo</button></div>'+
 '<div class="fd-site-frame" data-fd-site-frame="site"><div class="fd-site-toolbar"><span></span><span></span><span></span><b data-fd-site-domain>seuprojeto.studio</b></div><div class="fd-site-body"><small data-fd-site-kicker>IDENTIDADE + EXPERIÊNCIA</small><strong data-fd-site-title>Seu projeto merece uma presença própria.</strong><p data-fd-site-desc>Uma mensagem clara. Uma interface intuitiva.</p><div class="fd-site-action" data-fd-site-action>Explorar soluções ↗</div><div class="fd-site-tiles"><i></i><i></i><i></i></div></div></div>'+
 '<p class="fd-caption" role="status" data-fd-site-status>Prévia de um site responsivo.</p>';
 const variants={
 site:{title:'Seu projeto merece uma presença própria.',kicker:'IDENTIDADE + EXPERIÊNCIA',desc:'Uma mensagem clara. Uma interface intuitiva.',domain:'seuprojeto.studio',action:'Explorar soluções ↗',status:'Prévia de um site responsivo.'},
 app:{title:'Tudo o que importa, no seu bolso.',kicker:'PRODUTO + NAVEGAÇÃO',desc:'Escolha uma função, encontre seu próximo passo.',domain:'meu aplicativo',action:'Abrir experiência ↗',status:'Prévia de aplicativo com navegação compacta.'}
 };
 $$(node,'[data-fd-site]').forEach(button=>button.addEventListener('click',()=>{
 const mode=button.dataset.fdSite,data=variants[mode];node.querySelector('[data-fd-site-frame]').dataset.fdSiteFrame=mode;
 for(const [name,value] of Object.entries({title:data.title,kicker:data.kicker,desc:data.desc,domain:data.domain,action:data.action,status:data.status}))$(node,'[data-fd-site-'+name+']').textContent=value;
 $$(node,'[data-fd-site]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 }));
}
function conteudo(node){
 const slides=[
 {label:'01 / ABERTURA',title:'Sua ideia tem algo que merece atenção.',copy:'Uma pergunta concreta abre a conversa.'},
 {label:'02 / CONTEXTO',title:'Mostre por que ela importa.',copy:'Organize benefícios e evidências com clareza.'},
 {label:'03 / CONVITE',title:'Dê ao próximo passo um motivo.',copy:'Finalize com uma ação específica e alcançável.'}
 ];
 node.innerHTML=header('CONTEÚDO + COPY','Uma história em três decisões.')+
 '<div class="fd-story-frame" tabindex="0" role="group" aria-label="Três quadros de redação"><small data-fd-story-label></small><strong data-fd-story-title></strong><p data-fd-story-copy></p><div class="fd-story-steps" aria-hidden="true"><i></i><i></i><i></i></div></div>'+
 '<div class="fd-nav"><button type="button" data-fd-story-prev aria-label="Quadro anterior">←</button><output data-fd-story-counter>01 / 03</output><button type="button" data-fd-story-next aria-label="Próximo quadro">→</button></div>';
 let step=0;const frame=$(node,'.fd-story-frame');
 const paint=()=>{const s=slides[step];$(node,'[data-fd-story-label]').textContent=s.label;$(node,'[data-fd-story-title]').textContent=s.title;$(node,'[data-fd-story-copy]').textContent=s.copy;$(node,'[data-fd-story-counter]').textContent=String(step+1).padStart(2,'0')+' / 03';$$(node,'.fd-story-steps i').forEach((e,i)=>e.classList.toggle('is-current',i===step));};
 const move=d=>{step=(step+d+slides.length)%slides.length;paint();};
 $(node,'[data-fd-story-prev]').addEventListener('click',()=>move(-1));
 $(node,'[data-fd-story-next]').addEventListener('click',()=>move(1));
 frame.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.stopPropagation();e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 paint();
}
function campanhas(node){
 const formats={
 feed:{label:'Feed 4:5',kicker:'PUBLICAÇÃO · FEED',title:'Transforme uma ideia em proposta.',desc:'A mensagem e a hierarquia valorizam a leitura rápida.',status:'Peça demonstrativa para feed.'},
 stories:{label:'Stories 9:16',kicker:'PUBLICAÇÃO · STORIES',title:'Uma mensagem para ocupar a tela.',desc:'Um convite direto para explorar.',status:'Peça demonstrativa vertical, sem vídeo ou publicação real.'},
 search:{label:'Pesquisa',kicker:'PATROCINADO · EXEMPLO',title:'Sites e aplicações sob medida',desc:'Identidade, interface e desenvolvimento em uma experiência.',status:'Exemplo de anúncio de pesquisa. Nenhuma campanha foi veiculada.'}
 };
 node.innerHTML=header('CAMPANHAS + ADS','Uma intenção. Três formatos de comunicação.')+
 '<div class="fd-switch fd-ad-switch" role="group" aria-label="Formato do anúncio"><button type="button" data-fd-channel="feed" aria-pressed="true">Feed</button><button type="button" data-fd-channel="stories" aria-pressed="false">Stories</button><button type="button" data-fd-channel="search" aria-pressed="false">Pesquisa</button></div>'+
 '<div class="fd-campaign-preview" data-fd-campaign="feed"><small data-fd-ad-kicker></small><strong data-fd-ad-title></strong><p data-fd-ad-desc></p><span class="fd-campaign-action">Conhecer projeto ↗</span></div><p class="fd-caption" role="status" data-fd-ad-status></p>';
 const paint=type=>{const x=formats[type];$(node,'[data-fd-campaign]').dataset.fdCampaign=type;$(node,'[data-fd-ad-kicker]').textContent=x.kicker;$(node,'[data-fd-ad-title]').textContent=x.title;$(node,'[data-fd-ad-desc]').textContent=x.desc;$(node,'[data-fd-ad-status]').textContent=x.status;$$(node,'[data-fd-channel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fdChannel===type)));};
 $$(node,'[data-fd-channel]').forEach(b=>b.addEventListener('click',()=>paint(b.dataset.fdChannel)));paint('feed');
}
function video(node){
 const scenes=[
 {tag:'01 / GANCHO',headline:'Uma ideia ocupa o primeiro quadro.'},
 {tag:'02 / DEMONSTRAÇÃO',headline:'O movimento revela como ela funciona.'},
 {tag:'03 / PRÓXIMO PASSO',headline:'A sequência termina com um convite.'}
 ];
 node.innerHTML=header('VÍDEO + MOTION','Três cenas. Dez segundos. Uma narrativa.')+
 '<div class="fd-motion-stage" role="group" aria-label="Storyboard animado de dez segundos"><div class="fd-motion-orbit" aria-hidden="true"><i></i><i></i></div><div class="fd-motion-copy"><small data-fd-motion-tag></small><strong data-fd-motion-title></strong></div><div class="fd-video-progress" aria-hidden="true"><i data-fd-video-progress></i></div></div>'+
 '<div class="fd-nav"><button type="button" data-fd-video-play aria-pressed="false">Reproduzir</button><output role="status" data-fd-video-time>00:00 / 00:10</output><button type="button" data-fd-video-replay aria-label="Reiniciar">↻</button></div>';
 let active=false,elapsed=0,last=0,raf=0,sceneIndex=-1;
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const play=$(node,'[data-fd-video-play]');
 const paint=()=>{const index=Math.min(2,Math.floor(elapsed/3500));if(index!==sceneIndex){sceneIndex=index;$(node,'[data-fd-motion-tag]').textContent=scenes[index].tag;$(node,'[data-fd-motion-title]').textContent=scenes[index].headline;}
 $(node,'[data-fd-video-progress]').style.transform='scaleX('+Math.min(1,elapsed/10000)+')';$(node,'[data-fd-video-time]').textContent='00:'+String(Math.floor(elapsed/1000)).padStart(2,'0')+' / 00:10';
 $(node,'.fd-motion-stage').dataset.fdMotionScene=String(index);};
 const stop=()=>{active=false;cancelAnimationFrame(raf);raf=0;play.setAttribute('aria-pressed','false');play.textContent='Reproduzir';node.classList.remove('is-playing');};
 const available=()=>!reduce.matches&&!document.hidden&&!document.body.classList.contains('is-paused')&&Boolean(node.closest('.pf-fatos-card.is-active.is-flipped'));
 const tick=now=>{if(!active)return;if(!available()){stop();return;}elapsed=Math.min(10000,elapsed+Math.min(90,now-last));last=now;paint();if(elapsed>=10000){stop();return;}raf=requestAnimationFrame(tick);};
 play.addEventListener('click',()=>{if(active){stop();return;}if(reduce.matches||document.body.classList.contains('is-paused')){elapsed=Math.min(10000,elapsed+3500);paint();return;}if(elapsed>=10000)elapsed=0;active=true;node.classList.add('is-playing');play.setAttribute('aria-pressed','true');play.textContent='Pausar';last=performance.now();raf=requestAnimationFrame(tick);});
 $(node,'[data-fd-video-replay]').addEventListener('click',()=>{stop();elapsed=0;sceneIndex=-1;paint();});
 reduce.addEventListener('change',()=>{if(reduce.matches)stop()});paint();return stop;
}
function lojas(node){
 node.innerHTML=header('LOJA + PRODUTO','A escolha muda o produto em tempo real.')+
 '<div class="fd-shop-stage" data-fd-color="sage"><div class="fd-shop-product" aria-hidden="true"><div class="fd-shop-object"><i></i></div></div><div class="fd-shop-details"><small>PRODUTO CONCEITUAL</small><strong>Objeto Studio</strong><p>Uma peça fictícia para mostrar seleção de variantes.</p><div class="fd-switch fd-shop-options" role="group" aria-label="Cor do produto"><button type="button" data-fd-variant="sage" aria-pressed="true">Sálvia</button><button type="button" data-fd-variant="clay" aria-pressed="false">Argila</button></div></div></div>'+
 '<button class="fd-add" type="button" data-fd-add>Adicionar ao carrinho simulado</button><p class="fd-caption" role="status" data-fd-cart>Sem compra ou pagamento.</p>';
 const stage=$(node,'.fd-shop-stage');let n=0;
 $$(node,'[data-fd-variant]').forEach(b=>b.addEventListener('click',()=>{stage.dataset.fdColor=b.dataset.fdVariant;$$(node,'[data-fd-variant]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 $(node,'[data-fd-add]').addEventListener('click',()=>{$(node,'[data-fd-cart]').textContent=++n+' item(ns) no carrinho demonstrativo · sem checkout';});
}
function sistemas(node){
 const stages=[
 {key:'Recebido',headline:'Solicitação recebida',body:'Novo pedido identificado e organizado no painel.',tag:'ENTRADA'},
 {key:'Classificado',headline:'Prioridade e responsável',body:'A solicitação foi classificada para a equipe comercial.',tag:'TRIAGEM'},
 {key:'Pronto',headline:'Próxima ação registrada',body:'Preparar proposta. Nenhuma mensagem foi enviada.',tag:'ENCAMINHAMENTO'}
 ];
 node.innerHTML=header('SISTEMAS + IA','Do contato a uma próxima ação organizada.')+
 '<div class="fd-flow-screen"><div class="fd-flow-top"><strong>Painel de solicitações</strong><span>DEMO LOCAL</span></div><div class="fd-flow-track" aria-hidden="true"><i></i><i></i><i></i></div><small data-fd-flow-tag></small><h4 data-fd-flow-title></h4><p data-fd-flow-body></p><div class="fd-flow-meta"><span>Comercial</span><span data-fd-flow-state>Recebido</span></div></div>'+
 '<div class="fd-nav"><button type="button" data-fd-flow-reset>Recomeçar</button><output role="status" data-fd-flow-step>01 / 03</output><button type="button" data-fd-flow-next>Avançar →</button></div>';
 let index=0;const paint=()=>{const s=stages[index];$(node,'[data-fd-flow-tag]').textContent=s.tag;$(node,'[data-fd-flow-title]').textContent=s.headline;$(node,'[data-fd-flow-body]').textContent=s.body;$(node,'[data-fd-flow-state]').textContent=s.key;$(node,'[data-fd-flow-step]').textContent='0'+(index+1)+' / 03';$(node,'[data-fd-flow-next]').disabled=index===2;$$(node,'.fd-flow-track i').forEach((b,i)=>b.classList.toggle('is-current',i<=index));};
 $(node,'[data-fd-flow-reset]').addEventListener('click',()=>{index=0;paint()});
 $(node,'[data-fd-flow-next]').addEventListener('click',()=>{index=Math.min(2,index+1);paint()});paint();
}
export function mountDeckDemos(){
 const shell=document.querySelector('#colecao');
 if(!shell||shell.dataset.deckDemos==='ready')return;
 const factories={sites,conteudo,campanhas,video,lojas,sistemas},stoppers=[];
 $$(shell,'[data-fatos-card]').forEach(card=>{
  const id=card.dataset.fatosCard,back=$(card,'[data-fatos-back]');if(!back||!factories[id])return;
  const sample=document.createElement('section');sample.className='fd-demo fd-demo--'+id;sample.dataset.noCardFlip='';sample.setAttribute('aria-label','Demonstração visual de '+examples[id].title);
  $(back,'.pf-fatos-back-heading')?.after(sample);
  const stop=factories[id](sample);if(typeof stop==='function')stoppers.push(stop);
  const caption=document.createElement('p');caption.className='fd-caption';caption.textContent=examples[id].caption;sample.append(caption,makeCTA(examples[id].service));
 });
 const stopAll=()=>stoppers.forEach(stop=>stop());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
 new MutationObserver(()=>{if(document.body.classList.contains('is-paused'))stopAll();}).observe(document.body,{attributes:true,attributeFilter:['class']});
 const stage=$(shell,'.pf-fatos-stage');
 if(stage)new MutationObserver(()=>{if(!$(shell,'.pf-fatos-card.is-active.is-flipped'))stopAll();}).observe(stage,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
 if(typeof IntersectionObserver!=='undefined')new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)stopAll();},{threshold:.02}).observe(shell);
 shell.dataset.deckDemos='ready';
}
