/** R6: one smiile campaign, three native formats, one honest destination.
 * Marks are unmodified official assets; campaign art uses the existing smiile
 * projects. No network integrations, ad metrics or publication are simulated.
 */
import { createDeviceFrame, installDemoExplorer } from './device-frame.js';
import { sectionCopy } from '../content/portfolio-copy.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const campaign = sectionCopy('laboratorio');
const tabCopy = id => campaign.tabs.find(tab => tab.id === id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const lines = value => esc(value).replace(/\n/g, '<br>');
const HOUSE = '/assets/portfolio/smiile-architecture-coast.webp';
const COAST = '/assets/portfolio/recovered-smiile/landscape.webp';
const MAP = '/assets/portfolio/recovered-smiile/trail-map.svg';
const MARKS = {
  meta: '/assets/brands/meta-official-primary.webp',
  google: '/assets/brands/google-ads-official-reference.webp',
  tiktok: '/assets/brands/tiktok-official-icon-black-circle.png'
};
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
const paused = () => document.body.classList.contains('is-paused');
const motionAllowed = () => !reduced.matches && !paused();
const paths = {
  back: 'm15 4-8 8 8 8', next: 'm9 4 8 8-8 8', search: 'M10.6 18a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8zM16 16l5 5',
  heart: 'M12 20.3S2.5 15 2.5 8.7c0-5.5 6.5-6 9.5-1.4 3-4.6 9.5-4.1 9.5 1.4 0 6.3-9.5 11.6-9.5 11.6Z',
  comment: 'M20.6 16.2A9.3 9.3 0 1 0 17 19.9l4.3 1.4z', send: 'M3 4.5 21 5.6 10.6 20.6zM10 12.2 16.6 8.4',
  save: 'M5.5 3h13v18L12 15.2 5.5 21z', home: 'M3.6 10.1 12 3.4l8.4 6.7V20.6H14.6v-6.1H9.4v6.1H3.6z',
  play: 'M8 4v16l12-8Z', pause: 'M8 4v16M16 4v16', check: 'm5 12 4 4L20 5', arrow: 'M5 19 19 5M5 5h14v14',
  plus: 'M12 4v16M4 12h16', menu: 'M3 7h18M3 16h13', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c1-9 15-9 16 0'
};
const icon = (name, fill = false) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${fill ? 'currentColor' : 'none'}" stroke="${fill ? 'none' : 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
const link = (copy, target = 'site', className = '') => `<a class="${className}" href="${esc(copy.href)}" data-campaign-destination data-product-target="${target}">${esc(copy.label)} ${icon('arrow')}</a>`;
const cache = new Map();
function decoded(src) {
  if (cache.has(src)) return cache.get(src);
  const image = new Image(); image.src = src;
  const promise = image.decode().then(() => { if (!image.naturalWidth) throw Error('Imagem indisponível'); });
  cache.set(src, promise); promise.catch(() => cache.delete(src)); return promise;
}
function reveal(element) {
  element.getAnimations().forEach(animation => animation.cancel());
  if (motionAllowed()) element.animate([{opacity:.35, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {duration:220, easing:'cubic-bezier(.2,.7,.2,1)'});
}
function brandImages(root) {
  for (const [id, src] of Object.entries(MARKS)) {
    const holder = $(`[data-ad-tab="${id}"] .ads-tab-icon`, root);
    if (holder) { holder.className = `ads-tab-icon sa-brand sa-brand--${id}`; holder.innerHTML = `<img src="${src}" alt="" aria-hidden="true" decoding="async">`; }
  }
}
function fitPhone(host, frame) {
  function resize() {
    if (!host.clientWidth) return;
    const viewport = parseFloat(getComputedStyle(host, '::before').height) || innerHeight;
    const exploring = !!host.closest('.is-exploring');
    const height = Math.max(400, Math.min(exploring ? 900 : 730, viewport - (exploring ? 125 : 160)));
    const width = Math.min(host.clientWidth, height * 435 / 907, exploring ? 430 : 355);
    frame.root.style.setProperty('--df-pt', `${width / 435}px`);
    host.parentElement.style.setProperty('--sa-phone-width', `${width}px`);
  }
  new ResizeObserver(resize).observe(host); addEventListener('resize', resize, {passive:true}); resize();
}
function aside(id) {
  const copy = tabCopy(id), node = document.createElement('div'); node.className = 'mock-aside sa-story-aside';
  node.innerHTML = `<span>${esc(copy.context)}</span><h3>${lines(copy.title)}</h3><p>${esc(copy.body)}</p>${copy.frames ? `<div class="sa-sequence" role="group" aria-label="Etapas do criativo">${copy.frames.map((frame, index) => `<button type="button" ${id === 'meta' ? `data-rx-social="${index}" aria-current="${!index}"` : `data-frame="${index}" aria-pressed="${!index}"`}><small>0${index+1}</small><span>${esc(frame.label)}</span></button>`).join('')}</div>` : ''}<div class="sa-story-current"><span class="sa-story-kicker">${copy.frames ? '01 / '+esc(copy.frames[0].label) : 'Intenção da busca'}</span><p class="sa-story-detail">${esc(copy.frames?.[0].support || copy.query || copy.body)}</p></div>${link(copy.cta, id === 'tiktok' ? 'app' : 'site', 'sa-destination')}<p class="sa-story-feedback" role="status" aria-live="polite">${id === 'meta' ? 'Escolha um quadro ou deslize a peça.' : id === 'tiktok' ? 'Reproduza a cena ou experimente a escolha no app.' : 'A mesma proposta continua nas experiências abaixo.'}</p>`;
  return node;
}
function explorer(panel, title) {
  const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'df-explore-trigger';
  trigger.innerHTML = `${esc(campaign.controls.enlarge)} <span aria-hidden="true">↗</span>`; $('.sa-story-aside', panel).append(trigger);
  const instance = installDemoExplorer({source:panel, trigger, title, onChange:() => panel.dispatchEvent(new Event('demo:explorationchange'))});
  panel.addEventListener('click', event => {
    const anchor = event.target.closest('[data-campaign-destination]'), dialog = panel.closest('.df-explorer');
    if (!anchor || !dialog?.open) return;
    event.preventDefault();
    dialog.addEventListener('close', () => requestAnimationFrame(() => {
      $(`[data-product-tab="${anchor.dataset.productTarget}"]`)?.click();
      document.querySelector(anchor.hash)?.scrollIntoView({behavior:motionAllowed()?'smooth':'instant', block:'start'});
      history.replaceState(null, '', anchor.hash);
    }), {once:true}); instance.close();
  });
}
function controls(platform) {
  return `<div class="sa-frame-controls ${platform === 'tiktok' ? 'sa-frame-controls--playback' : ''}"><button type="button" ${platform==='meta'?'data-rx-social-prev':'data-tt-prev'} aria-label="${esc(campaign.controls.previous)}">${icon('back')}</button>${platform==='meta'?'<span class="sa-frame-label">01 / 03 · Abrir</span>':`<button type="button" class="sa-play" data-play-story aria-pressed="false" aria-label="${esc(campaign.controls.play)}"><span class="sa-play-icon">${icon('play')}</span><span class="sa-play-copy"><span class="sa-play-action">Reproduzir</span><span class="sa-frame-label" aria-hidden="true">01 / 03</span></span></button>`}<button type="button" ${platform==='meta'?'data-rx-social-next':'data-tt-next'} aria-label="${esc(campaign.controls.next)}">${icon('next')}</button></div>`;
}
function createPhone(panel, platform, label, markup) {
  const root = document.createElement('div'); root.className = 'sa-social'; root.dataset.platform = platform; root.dataset.socialFrame = '0';
  root.innerHTML = `<div class="sa-device-host"></div>${controls(platform)}`;
  const frame = createDeviceFrame({tone:'light', scheme:platform==='meta'?'light':'dark', time:'10:09', label});
  frame.root.classList.add('sa-device', platform==='meta'?'pf-social-device':'sa-tiktok-device');
  frame.screen.innerHTML = markup; $('.sa-device-host', root).append(frame.root);
  panel.replaceChildren(root, aside(platform)); panel.classList.add('sa-panel', 'sa-campaign-panel');
  fitPhone($('.sa-device-host', root), frame); return {root, frame};
}
function metaArtwork(index) {
  const copy = tabCopy('meta'), data = copy.frames[index];
  return `<img src="${index===2?COAST:HOUSE}" alt="${index===2?'Paisagem do projeto Trilha do Arco':'Projeto Casa Costa da smiile'}" decoding="async"><div class="sa-meta-shade"></div><div class="rx-ig-overlay"><small>smiile <span>IDEIA → EXPERIÊNCIA</span></small><h3>${lines(data.headline)}</h3><p>${esc(data.support)}</p></div>${index===0?'<div class="sa-site-preview"><span>CASA COSTA <i>↗</i></span><strong>Um lugar<br>para existir.</strong><small>ARQUITETURA · SITE</small></div>':index===1?`<div class="sa-interface-pair"><div class="sa-mini-site"><div><i></i><i></i><i></i><span>Casa Costa</span></div><img src="${HOUSE}" alt=""><strong>A casa.<br>A paisagem.</strong><small>Conhecer →</small></div><div class="sa-mini-app"><img src="${COAST}" alt=""><small>EXPLORAR</small><b>Trilha<br>do Arco</b><span>Ver percurso ↗</span></div></div>`:`<div class="sa-meta-invite">${link(copy.cta, 'site')}<span>Sites · Aplicativos · Experiências</span></div>`}<span class="rx-ig-count">${index+1}/3</span>`;
}
function createMeta(panel) {
  const copy = tabCopy('meta');
  const specimen = createPhone(panel, 'meta', 'Instagram: carrossel conceitual da campanha smiile, em três peças', `<div class="sa-instagram"><div class="sa-ig-topbar" aria-hidden="true">${icon('back')}<strong>Publicação</strong>${icon('menu')}</div><div class="sa-ig-profile"><span class="sa-smiile-avatar" aria-hidden="true">s.</span><div><b>smiile</b><small>Patrocinado · Estudo de campanha</small></div></div><div class="sa-media rx-ig-photo" role="group" aria-label="Peça do carrossel">${metaArtwork(0)}</div><div class="sa-ig-cta">${link(copy.cta, 'site')}</div><div class="sa-ig-dots" aria-hidden="true">${[0,1,2].map(i=>`<i data-dot="${i}" class="${i===0?'is-current':''}"></i>`).join('')}</div><div class="sa-ig-actions" aria-hidden="true">${icon('heart')}${icon('comment')}${icon('send')}<span>${icon('save')}</span></div><p class="sa-ig-caption"><b>smiile</b> ${esc(copy.caption)}</p></div>`);
  let current=0, revision=0;
  const area=$('.rx-ig-photo', specimen.root), feedback=$('.sa-story-feedback',panel);
  async function show(index) {
    const next=(index+3)%3, ticket=++revision; area.setAttribute('aria-busy','true');
    try {
      await decoded(next===2?COAST:HOUSE); if(ticket!==revision)return;
      current=next; area.innerHTML=metaArtwork(next); specimen.root.dataset.socialFrame=String(next); specimen.root.dataset.socialReady='true';
      $('.sa-frame-label',specimen.root).textContent=`0${next+1} / 03 · ${copy.frames[next].label}`;
      $('.sa-story-kicker',panel).textContent=`0${next+1} / ${copy.frames[next].label}`;
      $('.sa-story-detail',panel).textContent=copy.frames[next].support;
      $$('[data-rx-social]',panel).forEach(button=>button.setAttribute('aria-current',String(Number(button.dataset.rxSocial)===next)));
      $$('[data-dot]',panel).forEach(dot=>dot.classList.toggle('is-current',Number(dot.dataset.dot)===next));
      feedback.textContent=`Quadro ${next+1} de 3: ${copy.frames[next].label}.`;
      reveal(area);
    } catch { feedback.textContent='A peça anterior foi mantida. Tente novamente.'; }
    finally { if(ticket===revision)area.setAttribute('aria-busy','false'); }
  }
  $('[data-rx-social-prev]',panel).addEventListener('click',()=>show(current-1));
  $('[data-rx-social-next]',panel).addEventListener('click',()=>show(current+1));
  $$('[data-rx-social]',panel).forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.rxSocial))));
  swipe(area,direction=>show(current+direction));
  show(0); explorer(panel, 'smiile · Criativo para Instagram'); return specimen.root;
}
function swipe(area, navigate) {
  let point=null;
  area.addEventListener('pointerdown',event=>{ if(event.isPrimary&&!event.target.closest('a,button'))point={x:event.clientX,y:event.clientY}; });
  area.addEventListener('pointerup',event=>{if(!point)return;const dx=event.clientX-point.x,dy=event.clientY-point.y;point=null;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.3)navigate(dx<0?1:-1);});
  area.addEventListener('pointercancel',()=>{point=null;});
}
function createTikTok(panel) {
  const copy=tabCopy('tiktok');
  const {root}=createPhone(panel,'tiktok','TikTok: cena vertical smiile, uma escolha na Trilha do Arco e sua consequência',`<div class="sa-tiktok"><div class="sa-media sa-tt-media" role="group" aria-label="Cena da campanha"><img src="${COAST}" alt="Paisagem da Trilha do Arco" decoding="async"><div class="sa-tt-shade"></div><div class="sa-tt-copy"><small>smiile</small><h3>${lines(copy.frames[0].headline)}</h3></div><div class="sa-app-scene" data-app-state="discover"><div class="sa-app-header"><b>arco.</b><span>Seu próximo caminho</span></div><div class="sa-app-discover"><img src="${COAST}" alt=""><div><small>UMA ESCOLHA</small><strong>Trilha do Arco</strong><p>Um caminho. Outra perspectiva.</p><button type="button" data-ad-app-action>${icon('arrow')}<span>Ver percurso</span></button></div></div><div class="sa-app-outcome" hidden><img src="${MAP}" alt="Mapa ilustrativo do percurso da Trilha do Arco"><svg class="sa-route-reveal" viewBox="0 0 240 180" aria-hidden="true"><path d="M40 146C42 123 97 132 94 101S171 109 164 74 208 48 196 26" pathLength="1"/></svg><div class="sa-app-result"><span>${icon('check')}Percurso selecionado</span><strong>Trilha do Arco</strong><button type="button" data-ad-app-reset>Escolher de novo</button></div></div><i class="sa-touch-cursor" aria-hidden="true"></i></div><div class="sa-tt-endcard" hidden><strong>smiile.</strong><p>Sua ideia<br>ganha vida.</p>${link(copy.cta,'app')}</div></div><div class="sa-tt-top" aria-hidden="true"><span>Seguindo</span><b>Para você</b>${icon('search')}</div><div class="sa-tt-rail" aria-hidden="true"><span class="sa-smiile-avatar">s.</span>${icon('heart',true)}${icon('comment',true)}${icon('save',true)}${icon('send')}</div><div class="sa-tt-info"><b>@smiile</b><small>Patrocinado · Estudo de campanha</small><p>${esc(copy.caption)}</p></div><div class="sa-tt-progress" data-social-progress role="progressbar" aria-label="Progresso da cena" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><div class="sa-tt-nav" aria-hidden="true">${icon('home')}<span>Explorar</span>${icon('plus')}<span>Caixa de entrada</span>${icon('user')}</div></div>`);
  const scene=$('.sa-app-scene',root),outcome=$('.sa-app-outcome',root),discover=$('.sa-app-discover',root),end=$('.sa-tt-endcard',root),heading=$('.sa-tt-copy h3',root),progress=$('[data-social-progress]',root),play=$('[data-play-story]',root),feedback=$('.sa-story-feedback',panel);
  const duration=13500,boundaries=[0,4200,10000];
  let elapsed=0,playing=false,last=0,raf=0,frame=0,chosen=false;
  const label=()=>playing?'Pausar':elapsed>=duration?'Rever':elapsed>0?'Retomar':'Reproduzir';
  function paintPlay(){play.setAttribute('aria-pressed',String(playing));play.setAttribute('aria-label',`${label()} sequência`);$('.sa-play-icon',play).innerHTML=icon(playing?'pause':'play');$('.sa-play-action',play).textContent=label();root.classList.toggle('is-playing',playing);}
  function stop(message){const wasPlaying=playing;playing=false;cancelAnimationFrame(raf);paintPlay();if(wasPlaying&&message)feedback.textContent=message;}
  function choose(value){chosen=value;scene.dataset.appState=value?'route':'discover';outcome.hidden=!value;discover.hidden=value;scene.style.setProperty('--route-progress',value?'1':'0');}
  function paint(manual=false){
    const next=elapsed>=10000?2:elapsed>=4200?1:0;
    if(next!==frame||manual){frame=next;root.dataset.socialFrame=String(next);heading.innerHTML=lines(copy.frames[next].headline);$('.sa-frame-label',root).textContent=`0${next+1} / 03`;$('.sa-story-kicker',panel).textContent=`0${next+1} / ${copy.frames[next].label}`;$('.sa-story-detail',panel).textContent=copy.frames[next].support || copy.frames[next].headline.replace(/\n/g, ' ');$$('[data-frame]',panel).forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.frame)===next)));}
    const amount=elapsed/duration;progress.setAttribute('aria-valuenow',String(Math.round(amount*100)));$('i',progress).style.transform=`scaleX(${amount})`;
    scene.classList.toggle('is-featured',elapsed>=2800);scene.classList.toggle('is-tapping',elapsed>=5500&&elapsed<6250);
    if(playing)choose(elapsed>=6250);
    if(chosen&&playing)scene.style.setProperty('--route-progress',String(Math.max(0,Math.min(1,(elapsed-6250)/1500))));
    end.hidden=next!==2;scene.inert=next===2;scene.setAttribute('aria-hidden',String(next===2));
  }
  function seek(index){stop();elapsed=boundaries[(index+3)%3];choose(index===2);paint(true);feedback.textContent=`Cena ${frame+1} de 3: ${copy.frames[frame].label}.`;}
  function tick(now){if(!playing)return;if(paused()||reduced.matches||document.hidden||panel.hidden){stop('Cena pausada. Continue de onde parou.');return;}elapsed=Math.min(duration,elapsed+Math.min(now-last,100));last=now;paint();if(elapsed>=duration){stop();feedback.textContent='Da ideia à escolha: explore agora o aplicativo completo.';return;}raf=requestAnimationFrame(tick);}
  play.addEventListener('click',()=>{if(playing){stop('Cena pausada. Continue de onde parou.');return;}if(paused()){feedback.textContent='O movimento da página está pausado. As etapas e a escolha continuam disponíveis.';return;}if(reduced.matches){seek(frame+1);return;}if(elapsed>=duration){elapsed=0;choose(false);}playing=true;last=performance.now();paintPlay();feedback.textContent='Reproduzindo a cena: pergunta, escolha e percurso.';raf=requestAnimationFrame(tick);});
  $('[data-ad-app-action]',root).addEventListener('click',()=>{stop();elapsed=7100;choose(true);paint(true);feedback.textContent='Você escolheu a trilha. O cartão agora mostra o percurso correspondente.';$('.sa-app-result button',root).focus({preventScroll:true});});
  $('[data-ad-app-reset]',root).addEventListener('click',()=>{stop();elapsed=4200;choose(false);paint(true);feedback.textContent='Escolha restaurada. Experimente Ver percurso.';$('[data-ad-app-action]',root).focus({preventScroll:true});});
  $('[data-tt-prev]',root).addEventListener('click',()=>seek(frame-1));$('[data-tt-next]',root).addEventListener('click',()=>seek(frame+1));
  $$('[data-frame]',panel).forEach(button=>button.addEventListener('click',()=>seek(Number(button.dataset.frame))));swipe($('.sa-media',root),direction=>seek(frame+direction));
  new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)stop('Cena pausada ao sair do aparelho.');},{threshold:.01}).observe(root);
  new MutationObserver(()=>{if(panel.hidden)stop();}).observe(panel,{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(()=>{if(paused())stop('Cena pausada pelo controle da página.');}).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduced.addEventListener('change',()=>stop());panel.addEventListener('demo:explorationchange',()=>stop());
  decoded(COAST).then(()=>{root.dataset.socialReady='true';}).catch(()=>{feedback.textContent='A paisagem não carregou. A escolha da trilha continua disponível.';});
  paint(true);explorer(panel,'smiile · Cena para TikTok');return root;
}
function createGoogle(panel){
  const copy=tabCopy('google');panel.classList.add('sa-panel','sa-campaign-panel','sa-google-panel');
  panel.innerHTML=`<div class="sa-search-scene"><div class="sa-browser-chrome" aria-hidden="true"><span><i></i><i></i><i></i></span><b>Pesquisa · Prévia do criativo</b><span>↗</span></div><div class="sa-query">${icon('search')}<span>${esc(copy.query)}</span></div><div class="sa-search-label"><span>Resultado patrocinado</span><small>Estudo conceitual</small></div><article class="sa-search-result"><div class="sa-search-advertiser"><span class="sa-smiile-avatar">s.</span><div><b>${esc(copy.displayName)}</b><span>Experiências digitais</span></div></div><h3><a href="#sistemas" data-campaign-destination data-product-target="site">${esc(copy.headlines.join(' · '))}</a></h3>${copy.descriptions.map(text=>`<p>${esc(text)}</p>`).join('')}<div class="sa-search-links">${copy.links.map((label,index)=>`<a href="#sistemas" data-campaign-destination data-product-target="${index===1?'app':'site'}">${esc(label)}</a>`).join('')}</div></article><div class="sa-search-connection"><span>O próximo passo</span>${icon('next')}</div><a class="sa-landing-preview" href="#sistemas" data-campaign-destination data-product-target="site"><img src="${HOUSE}" alt="Casa Costa, experiência apresentada no destino do anúncio" loading="lazy"><div><small>SMIILE · PROJETO DIGITAL</small><strong>Uma ideia.<br>Uma experiência.</strong><span>${esc(copy.cta.label)} ↗</span></div></a></div>`;
  panel.append(aside('google'));explorer(panel,'smiile · Criativo para pesquisa');
}
export function mountSocialAds(root=document){
  const meta=$('#panel-meta',root),tiktok=$('#panel-tiktok',root),google=$('#panel-google',root);if(!meta||!tiktok||!google)return null;
  if(meta.dataset.campaignReady)return $('.sa-social',meta);
  brandImages(root);const instagram=createMeta(meta);createTikTok(tiktok);createGoogle(google);
  for(const panel of [meta,tiktok,google]){panel.dataset.campaignReady='true';new MutationObserver(()=>{if(!panel.hidden)reveal(panel);}).observe(panel,{attributes:true,attributeFilter:['hidden']});}
  return instagram;
}
