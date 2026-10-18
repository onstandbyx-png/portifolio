/** Six distinct, honest showcase prototypes, using the six existing Fatos cards.
 * Each interaction belongs to the reverse, not to the outer flip or deck swipe.
 */
const src='/assets/portfolio/recovered-fatos/';
const photos={
 desconhecidos:src+'cena-desconhecidos.webp',
 esportes:src+'cena-esportes.webp',
 crencas:src+'cena-crencas.webp',
 sobrenaturais:src+'cena-sobrenaturais.webp',
 nerd:src+'cena-nerd.webp',
 negocios:src+'cena-negocios.webp'
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&amp;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={
 desconhecidos:{name:'Posts',why:'Uma ideia, três momentos de leitura.'},
 esportes:{name:'Vídeos',why:'Roteiro, movimento e legenda sincronizados.'},
 crencas:{name:'Blog',why:'Um artigo que organiza pesquisa e aprofundamento.'},
 sobrenaturais:{name:'Loja',why:'Produto demonstrativo e escolha antes do carrinho.'},
 nerd:{name:'Ads',why:'A mesma ideia, formatos realmente diferentes.'},
 negocios:{name:'ChatGPT Ads',why:'Resposta independente e anúncio explicitamente patrocinado.'}
};
const fcard=(label,body)=>'<div class="fd-head"><span class="fd-kicker">ESTUDO AUTORAL · '+esc(label)+'</span><strong>'+esc(body)+'</strong></div>';
function createPosts(card){
 let index=0;
 const labels=['01 · GANCHO','02 · CONTEXTO','03 · CONCLUSÃO'];
 const texts=['Você sabia? Uma pergunta muda a forma de olhar.','O contexto conecta fato, imagem e explicação.','A síntese deixa uma ideia para levar adiante.'];
 const images=[photos.desconhecidos,photos.crencas,photos.negocios];
 card.innerHTML=fcard('POSTS','Carrossel editorial em três páginas')+
 '<div class="fd-post"><img data-fd-post-image alt="Composição editorial Fatos" loading="lazy" decoding="async"><div class="fd-post-copy"><small data-fd-post-kicker></small><p data-fd-post-text></p></div></div>'+
 '<div class="fd-nav"><button type="button" data-fd-previous>←</button><output data-fd-counter>01 / 03</output><button type="button" data-fd-next>→</button></div>';
 const paint=()=>{card.querySelector('[data-fd-post-image]').src=images[index];card.querySelector('[data-fd-post-kicker]').textContent=labels[index];card.querySelector('[data-fd-post-text]').textContent=texts[index];card.querySelector('[data-fd-counter]').textContent='0'+(index+1)+' / 03';};
 card.querySelector('[data-fd-previous]').addEventListener('click',()=>{index=(index+2)%3;paint()});
 card.querySelector('[data-fd-next]').addEventListener('click',()=>{index=(index+1)%3;paint()});
 paint();
}
function createVideo(card){
 const scene=[
 {title:'O instante que muda o jogo.',image:photos.esportes,subtitle:'Gancho · 00–03s'},
 {title:'O contexto explica o momento.',image:photos.desconhecidos,subtitle:'Desenvolvimento · 03–07s'},
 {title:'Toda história pede um desfecho.',image:photos.nerd,subtitle:'Fechamento · 07–10s'}
 ];
 card.innerHTML=fcard('VÍDEOS','Montagem animada de 10 segundos')+
 '<div class="fd-video" role="group" aria-label="Montagem animada demonstrativa de esportes"><img data-fd-video-image loading="lazy" decoding="async" alt="Quadro do estudo editorial"><div class="fd-video-overlay"><small data-fd-video-subtitle></small><strong data-fd-video-title></strong></div><div class="fd-video-progress"><i></i></div></div>'+
 '<div class="fd-nav"><button type="button" data-fd-video-play aria-pressed="false">Reproduzir</button><output data-fd-video-time>00:00 / 00:10</output><button type="button" data-fd-video-replay>↻</button></div>';
 let active=false,elapsed=0,raf=0,last=0,sceneIndex=-1;
 const img=card.querySelector('[data-fd-video-image]'),progress=card.querySelector('.fd-video-progress i'),button=card.querySelector('[data-fd-video-play]');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const paint=()=>{const i=Math.min(2,Math.floor(elapsed/3500));if(i!==sceneIndex){sceneIndex=i;img.src=scene[i].image;card.querySelector('[data-fd-video-title]').textContent=scene[i].title;card.querySelector('[data-fd-video-subtitle]').textContent=scene[i].subtitle;}
 progress.style.transform='scaleX('+(elapsed/10000)+')';card.querySelector('[data-fd-video-time]').textContent='00:'+String(Math.floor(elapsed/1000)).padStart(2,'0')+' / 00:10';};
 const stop=()=>{active=false;cancelAnimationFrame(raf);raf=0;button.setAttribute('aria-pressed','false');button.textContent='Reproduzir';};
 const enabled=()=>!reduced.matches&&!document.hidden&&!document.body.classList.contains('is-paused')&&card.closest('.pf-fatos-card.is-active.is-flipped');
 const tick=now=>{if(!active)return;if(!enabled()){stop();return;}elapsed=Math.min(10000,elapsed+Math.min(80,now-last));last=now;paint();if(elapsed>=10000){stop();return;}raf=requestAnimationFrame(tick)};
 button.addEventListener('click',()=>{if(active){stop();return;}if(reduced.matches||document.body.classList.contains('is-paused')){elapsed=Math.min(10000,elapsed+3500);paint();return;}if(elapsed>=10000)elapsed=0;active=true;button.setAttribute('aria-pressed','true');button.textContent='Pausar';last=performance.now();raf=requestAnimationFrame(tick)});
 card.querySelector('[data-fd-video-replay]').addEventListener('click',()=>{stop();elapsed=0;paint()});
 paint();return stop;
}
function createBlog(card){
 card.innerHTML=fcard('BLOG','A pergunta vira uma leitura aprofundada')+
 '<article class="fd-article"><span>FATOS · ARTIGO</span><h4>Por que certas histórias ficam na memória?</h4><img src="'+photos.crencas+'" alt="Ilustração editorial do artigo" loading="lazy"><p>Uma boa abertura chama a atenção. O contexto transforma essa curiosidade em entendimento.</p><details><summary>Ler desenvolvimento</summary><p>A estrutura combina uma pergunta clara, evidências verificáveis e explicações organizadas em blocos. A conclusão retoma a ideia central sem repetir a abertura.</p><p>Estudo de organização editorial, não um artigo publicado.</p></details></article>';
}
function createStore(card){
 card.innerHTML=fcard('LOJA','Protótipo comercial sem checkout')+
 '<div class="fd-product"><img src="'+photos.sobrenaturais+'" loading="lazy" alt="Arte conceitual de uma edição ilustrada"><div class="fd-product-copy"><small>EDIÇÃO CONCEITUAL</small><h4>Caderno de histórias</h4><p>Objeto editorial demonstrativo</p><div class="fd-options"><button type="button" aria-pressed="true" data-fd-variant="claro">Claro</button><button type="button" aria-pressed="false" data-fd-variant="escuro">Escuro</button></div><button type="button" class="fd-add" data-fd-add>Adicionar ao carrinho simulado</button><span role="status" data-fd-cart>Sem compra ou pagamento</span></div></div>';
 card.querySelectorAll('[data-fd-variant]').forEach(button=>button.addEventListener('click',()=>{card.dataset.variant=button.dataset.fdVariant;card.querySelectorAll('[data-fd-variant]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));}));
 let n=0;card.querySelector('[data-fd-add]').addEventListener('click',()=>{n++;card.querySelector('[data-fd-cart]').textContent=n+' item(ns) no carrinho demonstrativo · sem checkout'});
}
function createAds(card){
 card.innerHTML=fcard('ADS','Mesmo conceito, duas adaptações de canal')+
 '<div class="fd-ad-tabs" role="group" aria-label="Formato"><button type="button" data-fd-ad-format="feed" aria-pressed="true">Feed 4:5</button><button type="button" data-fd-ad-format="stories" aria-pressed="false">Stories 9:16</button></div>'+
 '<div class="fd-ad-preview" data-format="feed"><img src="'+photos.nerd+'" loading="lazy" decoding="async" alt="Criativo ilustrativo de campanha"><span>Estudo de posicionamento</span><strong data-fd-ad-title>Uma história para explorar.</strong></div><p class="fd-ad-caption">Copy e hierarquia adequadas ao enquadramento, sem reutilizar o mesmo recorte.</p>';
 card.querySelectorAll('[data-fd-ad-format]').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.fdAdFormat;card.querySelectorAll('[data-fd-ad-format]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));card.querySelector('.fd-ad-preview').dataset.format=type;card.querySelector('[data-fd-ad-title]').textContent=type==='feed'?'Uma história para explorar.':'Descubra em uma tela.';card.querySelector('.fd-ad-preview img').src=type==='feed'?photos.nerd:photos.desconhecidos;}));
}
function createChatGPTAds(card){
 card.innerHTML=fcard('CHATGPT ADS','Estudo de publicidade contextual em IA')+
 '<div class="fd-ai-chat"><div class="fd-ai-question"><small>Pergunta fictícia</small><p>Como encontro boas ideias para uma campanha?</p></div>'+
 '<div class="fd-ai-answer"><strong>Resposta do assistente</strong><p>Comece pelo público, objetivo e formato. Compare exemplos e valide a mensagem antes de publicar.</p></div>'+
 '<div class="fd-sponsored"><span>Patrocinado · exemplo conceitual</span><strong>Estúdio criativo smiile</strong><p>Direção visual e projetos digitais para transformar ideias em experiências.</p><a href="#contato" data-no-card-flip>Conhecer o projeto ↗</a></div></div>';
}
export function mountDeckDemos(){
 const shell=document.querySelector('#colecao');
 if(!shell||shell.dataset.deckDemos==='ready')return;
 const makers={desconhecidos:createPosts,esportes:createVideo,crencas:createBlog,sobrenaturais:createStore,nerd:createAds,negocios:createChatGPTAds};
 const stops=[];
 shell.querySelectorAll('[data-fatos-card]').forEach(card=>{
  const id=card.dataset.fatosCard,back=card.querySelector('[data-fatos-back]');
  if(!back||!makers[id])return;
  const sample=document.createElement('section');sample.className='fd-demo';sample.dataset.delivery=labels[id].name.toLowerCase();sample.dataset.noCardFlip='';
  sample.setAttribute('aria-label','Demonstração visual: '+labels[id].name);
  back.querySelector('.pf-fatos-back-heading')?.after(sample);
  const stop=makers[id](sample);
  if(typeof stop==='function')stops.push(stop);
  const explanation=document.createElement('p');explanation.className='fd-caption';explanation.textContent=labels[id].why;
  sample.after(explanation);
 });
 const stopAll=()=>stops.forEach(stop=>stop());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll()});
 new MutationObserver(()=>{if(document.body.classList.contains('is-paused'))stopAll()}).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(()=>{
  if(!shell.querySelector('.pf-fatos-card.is-active.is-flipped'))stopAll();
 }).observe(shell.querySelector('.pf-fatos-stage'),{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});
 new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)stopAll()},{threshold:.02}).observe(shell);
 shell.dataset.deckDemos='ready';
}
