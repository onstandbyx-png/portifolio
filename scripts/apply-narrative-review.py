from pathlib import Path
import json,re
R=Path('.')
def edit(path,old,new):
 p=R/path;s=p.read_text();assert old in s,(path,old[:70]);p.write_text(s.replace(old,new))
# Shared editorial source; no post-render copy overlay.
p=R/'public/assets/content/portfolio-copy.js';s=p.read_text();a=s.index('{');b=s.rindex('\n};')+2;d=json.loads(s[a:b]);sec=lambda key:next(x for x in d['sections'] if x['id']==key)
d['status']='aplicada ao portfólio';d['reviewedRevision']='9c920416'
sec('inicio').update(title='Conteúdo, campanhas\ne produtos digitais.',body='Direção criativa, redação e desenvolvimento para transformar ideias em peças, sites e aplicativos.')
sec('inicio')['primaryCta']['label']='Ver projetos';sec('inicio')['secondaryCta']['label']='Falar sobre meu projeto'
sec('trabalhos')['body']='Escolha uma frente. Veja a peça e a decisão por trás dela.'
for card,label,decision,cta in zip(sec('trabalhos')['cards'],['Fatos · Conteúdo editorial','smiile · Campanha multicanal','smiile · Interfaces digitais'],['A pergunta parte do cotidiano; a pesquisa dá contexto à curiosidade.','A mesma proposta ganha uma abertura e uma hierarquia para cada canal.','A imagem apresenta o destino; a hierarquia torna o próximo passo claro.'],['Ver conteúdo','Ver campanha','Ver interfaces']):card.update(label=label,decision=decision,cta=cta)
sec('editorial')['body']='Pesquisa, texto e direção visual. Veja como uma mesma história ganha abertura, contexto e fechamento.'
for step,title,body in zip(sec('editorial')['steps'],['Uma pergunta antes da explicação.','A comparação torna a mudança visível.','O fechamento volta para quem lê.'],['O objeto familiar aproxima o tema. A pergunta cria uma razão para continuar.','Câmera, mapa e mensagens dão exemplos concretos, em vez de uma explicação abstrata.','A pergunta final conecta a descoberta à rotina da pessoa e encerra a história com sentido.']):step.update(title=title,body=body)
sec('laboratorio')['body']='Uma ideia, três linguagens. Compare a mensagem, o formato e a decisão criativa em cada canal.'
sec('narrativa-visual')['cta'].update(label='Ampliar interface final',href='/assets/portfolio/static-r8/casa-costa.webp')
sec('narrativa-visual')['body']='Casa Costa: da composição editorial à publicação e à interface final.'
sec('categorias').update(title='Em que parte\ndo projeto eu entro?',body='Uma entrega específica ou direção e execução juntas.')
for svc,title in zip(sec('categorias')['services'],['Pesquisa, textos, roteiros e direção visual.','Conceito, criativos e operação de mídia.','Interfaces, desenvolvimento e integrações.']):svc['title']=title
sec('categorias')['process']=[{'label':'Contexto','body':'Objetivo e materiais.'},{'label':'Direção','body':'Escopo e linguagem.'},{'label':'Entrega','body':'Criação e revisão.'}]
sec('contato').update(title='Vamos criar\nseu próximo projeto.',body='Conte a entrega que você precisa, o contexto e o prazo.',formTitle='Seu projeto, em poucas palavras.')
d['metadata']['ogTitle']='Conteúdo, campanhas e produtos digitais | Smile N'
p.write_text(s[:a]+json.dumps(d,ensure_ascii=False,indent=2)+s[b:])
# Keep usable static HTML before modules load.
p=R/'index.html';s=p.read_text();s=s.replace('motion-restored-20261015-r9','narrative-20261016-r11').replace('Criatividade com direção. Do conceito à entrega.',d['metadata']['ogTitle'])
s=s.replace('Criatividade com direção. <br><em>Do conceito à entrega.</em>','Conteúdo, campanhas<br><em>e produtos digitais.</em>')
s=s.replace('Dou forma à mensagem da sua marca — nos conteúdos que ela publica, nas campanhas que coloca no mundo e nas experiências digitais que oferece.',sec('inicio')['body'])
s=s.replace('Conhecer os trabalhos <span','Ver projetos <span',1)
s=s.replace('Duas frentes do meu trabalho','Fatos: experiência editorial · smiile: projeto próprio')
s=s.replace('Da pesquisa à interface. Uma seleção de conteúdo, campanhas e projetos digitais.',sec('trabalhos')['body'])
s=s.replace('Meu trabalho conecta pesquisa, texto e direção visual: encontrar um recorte, organizar a história e dar a ela uma forma que faça sentido para o público.',sec('editorial')['body'])
s=s.replace('Começar pelo que a pessoa reconhece.',sec('editorial')['steps'][0]['title']).replace('Uma pergunta próxima da rotina cria o ponto de entrada para um assunto maior.',sec('editorial')['steps'][0]['body'])
s=s.replace('<div class="es-transcript"><span>A peça, em palavras</span>','<details class="es-transcript"><summary>Ler o texto da peça</summary>').replace('Um objeto cotidiano pode abrir uma história sobre como a nossa forma de viver mudou.</p></div>','Um objeto cotidiano pode abrir uma história sobre como a nossa forma de viver mudou.</p></details>')
s=s.replace('Uma campanha conecta mensagem, público e ação. Desenvolvo o conceito, os criativos e seus desdobramentos para que cada canal tenha uma função clara.',sec('laboratorio')['body'])
s,n=re.subn(r'  <div class="sa-campaign-services">.*?</div></div>\n','',s);assert n==1
s=s.replace('Qual é o próximo <br><em>projeto da sua marca?</em>','Vamos criar<br><em>seu próximo projeto.</em>').replace('Me conte o que precisa sair do papel, o que já existe e o prazo que você tem em mente.',sec('contato')['body'])
s,n=re.subn(r'<div class="contact-formats">.*?</div>','',s);assert n==1
s=s.replace('<span class="eyebrow">UM PONTO DE PARTIDA</span><h3>Comece pelo contexto.</h3>','<h3>Seu projeto, em poucas palavras.</h3>')
s=s.replace('<link rel="stylesheet" href="/assets/showcase/static-presentations.css">','<link rel="stylesheet" href="/assets/showcase/static-presentations.css">\n  <link rel="stylesheet" href="/assets/showcase/narrative.css">')
p.write_text(s)
# Named shortcuts reuse native scroll navigation.
edit('public/assets/showcase/scroll-gallery.js','<p>${escape(entry.nature)}</p><a href=','<p data-work-decision>${escape(entry.decision)}</p><a href=')
edit('public/assets/showcase/scroll-gallery.js',"shell.style.setProperty('--rg-count',String(cards.length));", """shell.style.setProperty('--rg-count',String(cards.length));
 const shortcuts=document.createElement('div');shortcuts.className='rg-shortcuts';shortcuts.setAttribute('role','group');shortcuts.setAttribute('aria-label','Escolher trabalho');
 ['Fatos','Campanhas','Digital'].forEach((label,i)=>{const button=document.createElement('button');button.type='button';button.dataset.rgTo=String(i);button.textContent=label;button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>navigate(i));shortcuts.append(button);});
 shell.querySelector('.rg-toolbar').append(shortcuts);
 shell.querySelector('[data-rg-name]').classList.add('sr-only');
 shell.querySelector('.rg-scroll-cue').remove();""")
edit('public/assets/showcase/scroll-gallery.js','const index=Math.round(state.value);shell.dataset.mode=',"const index=Math.round(state.value);shortcuts.querySelectorAll('[data-rg-to]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));shell.dataset.mode=")
edit('public/assets/showcase/scroll-film.js','data-product-target="site">','data-product-target="site" data-art-open="casa">')
edit('public/assets/showcase/scroll-film.js','A direção visual continua em uma experiência navegável.','A fotografia e a hierarquia conduzem a leitura da interface final.')
edit('public/assets/project-paths.js',"${i === 0 ? ' open' : ''}","${''}")
# Editable local summary becomes optional; contact destinations stay unchanged.
p=R/'public/assets/sections/interactions.js';s=p.read_text();a=s.index(" const group=$('.contact-formats')");b=s.index(' const summary=copy',a)
s=s[:a]+" const form=$('#brief-form'),service=$('#service'),brief=$('#brief');if(!form||!service||!brief)return;\n"+s[b:]
s=s.replace('<div class="sm-brief-summary"><div><span>SEU PONTO DE PARTIDA</span><span class="sm-brief-dot">RASCUNHO LOCAL</span></div><strong>','<details class="sm-brief-summary"><summary>Revisar resumo</summary><strong>')
s=s.replace("Defina a ideia, o contexto e o que precisa ser entregue.</p></div>'","Defina a ideia, o contexto e o que precisa ser entregue.</p></details>'");p.write_text(s)
p=R/'src/portfolio.js';s=p.read_text();a=s.index("      const direct=document.createElement('a');");b=s.index('      brief.append(direct);',a)+len('      brief.append(direct);')
s=s[:a]+"      const alternatives=document.createElement('div');alternatives.className='brief-alternatives';\n      submit?.after(alternatives);\n      brief.querySelectorAll('.brief-email,.brief-copy').forEach(button=>alternatives.append(button));"+s[b:];p.write_text(s)
# Channel-specific content; crossfade state and token ownership are retained.
edit('public/assets/showcase/static-presentations.js',"import { createMotion } from '../sections/motion.js';","import { createMotion } from '../sections/motion.js';\nimport { mountArtworkDialog } from './artwork-dialog.js';")
notes="""
const campaignNotes = [
 {title:'Mostrar a ideia antes de explicá-la.',message:'Sua ideia ganha vida.',decision:'A interface é a prova visual da proposta. O título apresenta a possibilidade sem competir com a peça.',delivery:'Conceito e direção de arte para feed e carrossel.'},
 {title:'Responder à intenção de busca.',message:'Sites e aplicativos com uma proposta clara.',decision:'O anúncio organiza oferta, benefício e convite em texto. A mensagem se mantém coerente com o projeto apresentado.',delivery:'Copy de pesquisa e continuidade da página de destino.'},
 {title:'Uma abertura pensada para a tela vertical.',message:'E se essa ideia fosse um app?',decision:'A pergunta abre o roteiro; a interface apresenta a resposta. O enquadramento dá espaço à mensagem e ao próximo passo.',delivery:'Direção visual e roteiro para vídeo vertical.'}
];
"""
edit('public/assets/showcase/static-presentations.js',"const ART = '/assets/portfolio/static-r8/';","const ART = '/assets/portfolio/static-r8/';\n"+notes)
edit('public/assets/showcase/static-presentations.js',"  const tabs = Array.from(lab.querySelectorAll('[data-sp-tab]'));","""  const layout=document.createElement('div');layout.className='sp-campaign-layout';
  const art=lab.querySelector('.sp-campaign-art');art.before(layout);layout.append(art);
  const note=document.createElement('aside');note.className='sp-campaign-note';note.id='campaign-note';note.setAttribute('data-campaign-note','');note.setAttribute('aria-live','polite');note.setAttribute('aria-atomic','true');
  note.innerHTML='<span class="eyebrow">A decisão por trás da peça</span><h3 data-note-title></h3><dl><div><dt>Mensagem</dt><dd data-note-message></dd></div><div><dt>Adaptação ao canal</dt><dd data-note-decision></dd></div><div><dt>Entrega</dt><dd data-note-delivery></dd></div></dl><a href="#contato" data-contact-service="Campanhas e gestão de mídia">Conversar sobre uma campanha ↗</a>';
  layout.append(note);
  const tabs = Array.from(lab.querySelectorAll('[data-sp-tab]'));""")
edit('public/assets/showcase/static-presentations.js',"    lab.dataset.channel = campaigns[index].id;","""    lab.dataset.channel = campaigns[index].id;
    for(const field of ['title','message','decision','delivery'])note.querySelector('[data-note-'+field+']').textContent=campaignNotes[index][field];
    panels[index].setAttribute('aria-describedby','campaign-note');""")
p=R/'public/assets/showcase/static-presentations.js';s=p.read_text();a=s.index('  grid.innerHTML =');b=s.index('  return grid;',a)
s=s[:a]+'''  grid.innerHTML = `<h2 id="static-systems-title" class="sr-only">Interfaces digitais</h2><div class="sp-products">
    <figure>${picture('trilhas', 'Trilhas: interface para descobrir percursos, com busca, paisagem e informações organizadas para a escolha.')}<figcaption><span>Trilhas · Estudo de aplicativo</span></figcaption></figure>
    <article class="sp-product-context"><span class="eyebrow">Outro projeto, outra tarefa</span><h3>Encontrar um caminho.<br>Começar a explorar.</h3><p>Depois de apresentar um lugar em Casa Costa, o desafio aqui é ajudar a escolher um percurso.</p><dl><div><dt>Contribuição</dt><dd>Direção visual e UX/UI.</dd></div><div><dt>Decisão de interface</dt><dd>Busca, fotografia e informações do percurso organizam a escolha antes do próximo passo.</dd></div></dl><div class="sp-product-actions"><a href="${ART}trilhas.webp" data-art-open="trilhas">Ampliar a interface ↗</a><a href="#contato" data-contact-service="Sites, apps e sistemas">Conversar sobre um projeto digital ↗</a></div></article>
  </div>`;
'''+s[b:]
s=s.replace('  const motion = createMotion();\n  const campaign','  const motion = createMotion();\n  mountArtworkDialog();\n  const campaign');p.write_text(s)
# Only deliberate presentation changes alter previous browser expectations.
p=R/'tests/browser-static-presentations.mjs';s=p.read_text().replace("'The two digital project interiors remain static images'","'The next digital project remains a static image without repeating Casa Costa'").replace("page.locator('#sistemas .sp-products figure').count()===2","page.locator('#sistemas .sp-products figure').count()===1").replace("page.locator('#sistemas .sp-products figure img').count()===2","page.locator('#sistemas .sp-products figure img').count()===1").replace("'Both digital project artworks remain available',await artwork.count()===2","'The next digital artwork remains available',await artwork.count()===1")
s=s.replace("check('The contact summary reflects the editable local draft'","await page.locator('.sm-brief-summary summary').click();\n      check('The contact summary reflects the editable local draft'");p.write_text(s)
print('Applied approved narrative changes. Badge physics, film travel and gallery poses were not changed.')
