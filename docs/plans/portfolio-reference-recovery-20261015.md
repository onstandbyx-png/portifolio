# Portfólio - plano de recuperação visual, animação e interação

Data da análise: 15/10/2026. Escopo: análise e plano de implementação; nenhuma mudança ou publicação executada nesta rodada.

## 1. Direção principal

O portfólio deve fazer o visitante perceber o valor do trabalho vendo peças prontas, navegando por interfaces e entendendo a contribuição de Smile N. Preservar o hero, os crachás, os dispositivos metálicos, o passe com dobra, o vídeo e as camadas. A evolução deve melhorar sua composição, exposição e conteúdo.

Organizar cada caso como **peça visível -> gesto útil -> contribuição breve -> próximo passo**. A animação precisa revelar um trabalho ou uma relação entre entregas. O contexto aprofundado pode ficar no verso ou no detalhe. Manter a identificação de estudos conceituais e a atribuição correta, em uma legenda clara por caso; retirar repetições dessa explicação de todas as camadas da interface.

Não recolocar SOTA CI, LINHA ou documentos técnicos como narrativa da home. Evitar que a mesma foto genérica represente simultaneamente redação, anúncio, app e vídeo.

## 2. Fontes e versões verificadas

| Fonte | Revisão verificada | Uso correto |
|---|---|---|
| `onstandbyx-png/portifolio` | `main`, `702344b5e26e21c7a80713560130e9da969aa289`, 15/10 | Base do próximo trabalho. Deploy Railway SUCCESS no serviço principal, criado às 12:40 BRT. |
| `onstandbyx-png/roblox` | `ccr-5c63854e-4gxtzf`, `b9c827082edc6e2076c864687451ae3d1a1dcf76`, 13/10 | Contém o mídia kit Fatos na raiz e Feitio em `saas/`. Deploy do mídia kit confirmado nessa revisão. Não identifiquei um jogo Roblox nessa árvore. |
| Feitio, no mesmo repositório | `feitio/tarefa-01-corte-sem-preto-aparelho-estavel-20261013`, `3b992ce1150075b2da158ec3d016c80fa3651028` | Branch 18 commits à frente da base, alterações restritas ao Feitio. Fonte candidata para transições e estabilidade do aparelho. Não equivale a versão publicada do portfólio. |
| Landing smiile | `fix/sh4-135-agents-mobile-20261012`, `a2e6d42c526aa721d5059a6baad00cc86418ca3d` | `sites/smiile-landing/`. Fonte de dispositivos, apps, cards, vídeo e agentes. |
| Landing smiile publicada | `e8dadbda0d98be37ad1d674f11f609c48ae5d75e`, 13/10 | Deploy SUCCESS. A comparação com `a2e6d42` altera somente um documento de handoff, preservando o código da landing. |
| Sites `smiile-experience` | versão 8, atualização em 11/10 | Referência visual complementar enviada pelo usuário. Exige login e não é a base atual do portfólio. |

A `main` de `smiile-` está em `ef51996`, de 06/10, e não contém a landing examinada. Recuperar simplesmente a branch padrão faria perder os elementos mais recentes. A branch de passe do portfólio `ef7f748` diverge da `main`; não fazer merge integral para recuperar material, pois a base atual já contém a evolução cinética e a recuperação visual de hoje.

## 3. Diagnóstico com evidência

| Prioridade | Evidência atual | Consequência | Correção proposta |
|---|---|---|---|
| P0 | `mountDeck()` cria `details#colecao` sem `open`. | Um elemento visual solicitado fica fechado em “Exploração opcional”. | Expor o baralho como seção editorial própria, preservando também os cartões de projetos. |
| P0 | `mountScrollFilm()` só troca a cena com scroll quando `!mobile`; CSS mobile aplica `transform:none!important`. | A interação por rolagem não permanece equivalente no celular. | Reconstruir capítulos por scroll com layout mobile próprio e controles manuais sincronizados. |
| P0 | CSS define aparelho `435*.29` por `907*.29`: cerca de 126 x 263 px; a área tem 620 a 790 px de altura. Abaixo de 380 px, aparelho de aproximadamente 109 x 227 px. | O trabalho fica pequeno no espaço disponível. Esses valores são derivados do código, não medidos em aparelho físico. | Ajustar composição a altura útil, aumentar o trabalho visível e tornar a UI interna responsiva. |
| P0 | App atual usa imagem, quatro etapas textuais e alteração de estado. | A seção comunica processo, mas mostra pouco do app funcional já existente. | Usar lista, detalhe, mapa e salvar da `InteractiveTrailApp`. |
| P1 | `index.html` e a montagem de caminhos repetem “Escolha o desafio. Veja a entrega.”; a coleta pública retorna os dois títulos. | A narrativa repete uma promessa antes de entregar nova evidência. | Uma abertura por seção; manter entregas diversas e retirar títulos duplicados. |
| P1 | JS de narrativa troca a imagem diretamente por `img.src`; Feitio mais recente já tem `PilhaQuadros`. | Risco de transição vazia em rede lenta ou toque rápido, ainda sem reprodução comprovada nesta rodada. | Decodificar a próxima imagem e preservar a anterior até a transição acabar. |
| P1 | `.portfolio-recovery.css` contém várias regras com `!important` sobre estruturas compartilhadas. | Novos patches podem esconder imagens ou desligar movimentos anteriores. | Dar propriedade clara a cada seção e consolidar apenas seus estilos conflitantes. |

O passe já possui textura em vídeo e dobra WebGL. Os crachás já têm física, cordões, captura de ponteiro, materiais e pausa. Esses elementos devem ser refinados e testados; não substituídos por imagens estáticas.

## 4. Leitura das três referências em vídeo

Tempos abaixo são checkpoints aproximados dos arquivos enviados. A técnica original e os parâmetros exatos não são recuperáveis apenas pelo vídeo. Os valores da implementação propostos na seção 6 são decisões de reconstrução.

### R1 - `1000772829.mp4`: cartões com perspectiva no scroll

- Arquivo: 17,05 s, 1416 x 1080, 60 fps.
- 1,0 s: cartão principal aberto, próxima peça antecipada abaixo.
- 3,5 s: peça atual frontal; anterior inclinada acima; próxima peça comprimida em perspectiva abaixo.
- 5,0 a 8,5 s: a sequência avança por diferentes projetos mantendo alinhamento e hierarquia.
- 13,5 s em diante: retorno pela sequência, útil como referência de reversibilidade.
- Mecanismo observado: mudança de plano, escala e posição de cartões inteiros. A gravação não prova uma malha flexível; a primeira reconstrução pode usar planos CSS 3D.
- Adaptação: quatro trabalhos distintos - Fatos, campanhas, smiile e motion. Cada cartão mostra uma peça concluída, uma linha sobre a contribuição e um botão de abertura.
- Na home, usar esse movimento para percorrer os trabalhos. O baralho Fatos continua dentro do caso editorial para explorar verticais, evitando repetir o mesmo conteúdo com dois mecanismos.

### R2 - `1000772827.mp4`: viagem por uma composição de telas

- Arquivo: 14,5 s, 900 x 720, 30 fps.
- 0,5 s: hero em perspectiva com telefones e elementos em planos separados.
- 3,0 s: travessia de grupos de conteúdo; primeiro plano desfocado e foco no plano central.
- 6,0 s: travessia das seções intermediárias, com depoimento e foco no conteúdo central.
- 8,5 s: chegada ao rodapé e início do afastamento.
- 12,0 s: reenquadramento do hero e do produto.
- Mecanismo observado: trajetória de câmera, paralaxe, mudança de escala, profundidade e retorno à visão de conjunto. Pode ser uma apresentação em vídeo; não há evidência suficiente de que o site original execute tudo por scroll.
- Adaptação: “uma campanha em diferentes pontos de contato”: peça editorial -> post/carrossel -> vídeo -> site -> app. Usar o mesmo caso quando se afirma uma campanha integrada; não unir projetos desconexos como se fossem uma entrega única.
- Tornar o movimento interativo é uma proposta para o portfólio. O visitante controla o avanço, pode pular à peça e abrir o exemplo real.

### R3 - `1000772828.mp4`: crachás suspensos e verso individual

- Arquivo: 13,65 s, 1554 x 1080, 60 fps.
- 0,2 s: quatro cartões pendurados em uma linha comum.
- 2,0 s: um verso aparece enquanto os outros cartões preservam o estado.
- 5,5 s: cartão quase de perfil, demonstrando espessura e rotação no eixo vertical.
- 8,0 a 11,5 s: deslocamento e balanço com ancoragem superior e acomodação gradual.
- A legenda da referência menciona hover para brilho e click/tap para virar. Não é possível extrair por imagem os coeficientes do sistema físico.
- Adaptação: manter os dois crachás atuais como âncoras de experiência editorial e produto digital. Melhorar virada individual, brilho discreto, encosto entre peças e legibilidade do verso. Não inventar uma equipe de quatro pessoas para copiar a composição.

## 5. Leitura das nove imagens

| Arquivo | O que preservar ou aprender | Adaptação |
|---|---|---|
| `1000773316.png` e `1000773315.png` | Registro do pedido para manter dispositivos, crachás e interações; menções a QA não comprovam a fidelidade visual. | Criar uma lista explícita de elementos preservados antes de editar. |
| `1000773307.png` | Relação entre frase lateral, peça central e zoom; grande vazio no recorte mobile enviado. | Composição vertical no celular, peça maior e transição por capítulo. |
| `1000772691.png` | Passe “init”: recortes, furo, barcode, tipografia preenchida por material e canto dobrado. | Evoluir o passe atual do portfólio com arte própria, dobra curva, verso e sombra coerentes. Não duplicar o nome, identidade ou credenciais da referência. |
| `1000772643.png` | Telefone metálico, ligação, legenda e controles. | Mostrar voz como trecho opcional do caso smiile, com áudio acionado pelo visitante e transcrição sincronizada. |
| `1000772622.png` | Baralho Fatos, sobreposição, profundidade, marcadores de verticais e gesto. | Mostrar trabalhos editoriais completos; evitar título ou CTA cortado no cartão ativo. |
| `1000772625.png` | Alternância cartão/tabela e números com origem. | Reutilizar o modo de comparação dentro do caso Fatos. Métricas de rede permanecem atribuídas ao ecossistema, com data e sem equipará-las a resultados pessoais. |
| `1000772624.png` | Feed com identidade, arte, legenda, paginação e estrutura social. | Recuperar o componente social completo e seus assets, incluindo recorte e interação, em lugar de imitação genérica. |
| `1000772616.png` | Card de projeto com imagem dominante e ação clara. | Reaproveitar em sites/apps; acrescentar estado navegável e a contribuição em uma linha. |

## 6. Especificações propostas de reconstrução

### 6.1 Galeria de trabalhos no scroll

`p = clamp((scrollY - inicio) / (alturaSecao - alturaUtil), 0, 1)`. Derivar desse progresso o cartão ativo, a posição e a inclinação; não iniciar timers que concorram com a rolagem.

Para cada transição local `q` de 0 a 1: 0-0,2 mantém a peça atual frontal; 0,2-0,55 a leva para cima e inclina; 0,55-0,85 abre a próxima; 0,85-1 estabiliza a leitura. Ponto de partida de calibração: perspectiva de 1100 a 1600 px, inclinação máxima de 65 a 75 graus, escala de 0,82 a 1, sombras vinculadas à distância. Texto do cartão ativo permanece frontal e legível. Os intervalos são propostas, não medidas da referência.

Desktop: dois ou três planos simultâneos, área de leitura estável. Mobile: uma peça por vez e pequena antecipação da próxima; texto acima da mídia quando necessário. Altura proposta de 70 a 100 svh de percurso por troca, a validar sem prolongar a página artificialmente. Em telas baixas, usar fluxo vertical natural. Nenhum `preventDefault` global para wheel/touch.

### 6.2 Composição cinematográfica

Cinco atos no progresso da seção: visão geral (0-15%), peça editorial (15-35%), formatos sociais e vídeo (35-60%), interface site/app (60-85%), conjunto e CTA (85-100%). Apenas três planos vizinhos precisam permanecer renderizados. Na leitura, profundidade diminui e a tela fica frontal. Blur serve à transição, nunca ao conteúdo ativo.

Mobile: limitar inclinação a 8-15 graus nos planos de passagem; desfoque decorativo máximo inicial de 2-4 px. Evitar coluna estreita mostrando uma página inteira minúscula. A tela ativa ocupa a maior parte da largura útil. A rolagem inversa recompõe o estado sem resetar o que foi feito no exemplo.

### 6.3 Crachás

Reusar `BadgeScene.ts`, `physics.ts`, `rig.ts` e `portfolioArt.ts`. Preservar geometria, espessura e cordões. Hoje `setFlipped` atua sobre a rotação de `this.model`; a referência pede seleção e verso individual. Introduzir estado por crachá e botão de acesso equivalente no DOM.

Toque curto vira; arraste horizontal após limiar de intenção manipula; gesto vertical mantém a rolagem. Proposta inicial de limiar: 8-12 px, com predominância horizontal de 1,3x. O retorno usa o sistema físico existente; não sobrepor um tween no mesmo transform da física. Expor “Ver verso” e “Explorar projeto” individualmente. Enter/Espaço acionam e Escape volta. Parar a simulação ao acomodar ou sair da tela.

### 6.4 Passe, material e camadas

Preservar os três modos atuais: peça, por dentro e personalização. Canto: curva progressiva, verso visível e sombra de contato que muda com a abertura. A imagem estática `2691` confirma a aparência do canto, mas não sua curva temporal; calibrar a dinâmica com o passe atual e a direção pretendida.

O arquivo atual de textura documentado tem 256 x 128 px e 1,75 s de loop. Isso é um limite de resolução a revisar em aproximações; aumentar a resolução somente onde a inspeção mostrar perda de materialidade. Não escalar o vídeo da referência para disfarçar falta de implementação. As quatro camadas devem mostrar base, imagem/material, tipografia e acabamento, com uma decisão concreta por camada. Palavra editável com limite que preserve a composição.

### 6.5 Dispositivos e conteúdo

Uma moldura estável recebe conteúdo variável. Calcular a largura pelo espaço disponível e altura útil, mantendo a proporção do aparelho. No mobile, meta inicial de 260-320 px de largura em telas usuais; telas baixas usam fluxo natural. Essa faixa não substitui o cálculo responsivo. UI interna com tipografia própria legível, sem depender de reduzir todo o desktop.

Ao trocar canal/formato, manter o aparelho montado, pré-carregar e decodificar a próxima imagem, sobrepor o novo quadro e só então retirar o anterior. Retomar a última escolha manual; nenhuma automação deve sobrescrevê-la após poucos segundos.

## 7. Estrutura da página e conteúdo de cada seção

| Ordem | Seção | Conteúdo concreto | Interação principal |
|---|---|---|---|
| 1 | Abertura | Nome, atuação e dois crachás Fatos/smiile | Balanço e verso individual; acesso direto aos trabalhos |
| 2 | Trabalhos selecionados | Quatro entregas visuais distintas | Galeria em perspectiva inspirada em R1; abrir caso |
| 3 | Fatos: história e presença | Peças editoriais, verticais, formatos e contribuição | Baralho Fatos visível; virar para contexto e comparar |
| 4 | Campanhas em contexto | Um conjunto coerente de carrossel, vertical e landing | Troca de plataforma no aparelho; sequência curta e controlável |
| 5 | Sites e apps | Casa Costa e app Trilha do Arco | Navegar, selecionar, salvar, abrir mapa e voltar |
| 6 | Movimento e material | Passe, camadas, filme e composição de telas | Dobra/camadas; R2 como entrada do caso ou visão de conjunto |
| 7 | Projeto integrado smiile | Pedido, ligação e proposta, em resumo | Três momentos principais; fluxo completo opcional |
| 8 | Contato | Entrega vista + serviço relacionado | CTA contextual prepara o resumo revisável |

Não obrigar o visitante a consumir todas as animações antes do contato. Manter links de salto por categoria. Retirar a repetição de “ideia -> processo -> entrega” entre blocos. O mesmo material só reaparece quando mostra uma adaptação nova.

## 8. Mapa de recuperação de componentes e assets

### Portfólio: base atual

- `index.html`: preservar IDs públicos e conteúdo acessível; remover títulos repetidos e ajustar a ordem.
- `src/badges/badge/{BadgeScene,physics,rig,portfolioArt}.ts`: preservar base física; evoluir seleção e verso por peça.
- `public/assets/showcase/experiences.js`: expor coleção; substituir o filme de imagens por composição real; evitar nova montagem duplicada.
- `public/assets/sections/interactions.js`: manter ações válidas, retirar estados genéricos substituídos por interfaces reais.
- `public/assets/showcase/device-frame.{js,css}`: manter casca metálica e normalizar slots de conteúdo.
- `public/assets/kinetic-pass/{kinetic-pass,kinetic-curl,kinetic-math}.js`: preservar e calibrar.
- `public/assets/portfolio-recovery.css`, `showcase/rebuild.css`, `sections/sections.css`: revisar conflitos por seção; não empilhar mais uma folha global de overrides.

### Fatos: `roblox@b9c8270`, raiz

- `src/components/islands/Baralho.tsx` e `src/styles/baralho.css`: gestos, camada ativa, verso, dots, molas e rotação.
- `src/components/islands/Marcas.tsx`, `Comparador.tsx`: estruturas de cartão, tabela e comparação; valores da rede com escopo e data.
- `src/components/islands/Estudio.tsx` e `estudio/{Aparelho,Instagram,TikTok,Facebook,YouTube}.tsx`: dispositivos e formatos completos.
- `public/estudio/cena-*.webp`, `campanha-*.webp`, `public/heroi/post-*-600.webp`, `public/marca/avatar_*.webp`: conjunto visual atual. A procedência do repositório não comprova publicação de campanha nem autoria individual de todas as peças.

### Feitio: `roblox@3b992ce`, em `saas/`

- `src/components/islands/estudio/PilhaQuadros.tsx`: mantém a imagem anterior até decodificar a nova; cobre troca rápida.
- `PilhaTelas.tsx`: troca a tela preservando a moldura montada.
- `src/lib/movimento.ts`: tokens com corte geral de 280 ms, vídeo de 80 ms e story de 120 ms; usar como base de ajuste, não prova de desempenho do portfólio.
- `src/catalogo/` e `public/exemplos/`: peças por nicho para campanhas com contexto consistente. Selecionar poucos exemplos completos; não importar todas as variações para a home.

### smiile: `a2e6d42`, em `sites/smiile-landing/`

- `src/components/DeviceFrame.tsx` e `src/showcase/agents/MacBookFrame.tsx`: molduras e acabamento.
- `src/components/ProjectCards.tsx`: virada direcional e abertura do projeto.
- `src/components/ScrollZoomPreview.tsx`: máscara e aproximação; adaptar o mobile, pois o original também usa estado assentado em retrato.
- `src/showcase/apps/InteractiveTrailApp.tsx`: lista, detalhe, mapa, salvar, progresso e retorno preservado.
- `src/showcase/scenes/SiteScene.tsx`: Casa Costa com galeria e escolha de visita local.
- `src/landing/VideoStudio.tsx`, `src/landing/film/FormaFilm.tsx`: player, cenas, título e formato da mesma composição.
- `src/showcase/scenes/AgentsScene.tsx`, `agents/Phone.tsx`, `agents/ProposalInspector.tsx`, `public/media/agents-call-pt-br.{mp3,json}`: voz e proposta conectadas ao mesmo caso.
- `src/motion/tokens.ts`, `src/showcase/playback.ts`: ritmos e pausa por visibilidade.
- `public/assets/{architecture-coast,creative-studio,direction-editorial,direction-detail,direction-poster}.webp`: arte recuperável.
- O projeto também contém `GameScene.tsx`; é demo de jogo de navegador, não evidência de jogo Roblox. Pode entrar em detalhe de produto após as frentes prioritárias.

## 9. Arquitetura de implementação

Manter o shell atual em HTML/JS, esbuild e Three. A migração integral de framework não é necessária para esse plano. Montar componentes React recuperados como ilhas isoladas e carregadas quando necessárias; se o custo não se justificar, portar apenas o comportamento para o módulo nativo. Em qualquer caso, não colar TSX sem seus dados, CSS, dependências e contratos.

Um coordenador de movimento controla: visibilidade, pausa global, movimento reduzido, interação ativa e capítulo selecionado. Prioridade: movimento reduzido/pausa -> gesto ou seleção manual -> scroll -> reprodução decorativa. Uma propriedade visual pertence a um motor por vez. Física cuida do crachá; scroll cuida da câmera; animação de UI cuida da troca de conteúdo.

Contratos propostos: `caseId`, `sectionProgress`, `activeItem`, `interactionMode`, `paused`, `reducedMotion`, `isVisible`. O estado manual persiste até ação explícita de retomar. Na exploração de um app, a câmera fica estável; ao sair, a página volta ao mesmo capítulo.

Registrar em `docs/portfolio-sources.json` o repositório, SHA, caminho, hash do arquivo, finalidade e créditos de cada material recuperado. Proibir referências de produção a branch móvel ou URL autenticada de asset. Os nomes de novos arquivos neste plano são propostos, não arquivos já existentes.

## 10. Ordem de implementação e aceite por entrega

| Fase | Entrega | Arquivos / fronteira | Critério de pronto |
|---|---|---|---|
| 0 | Inventário preservado e baseline | Fontes e screenshots internos do estado atual; `docs/portfolio-sources.json` proposto | Hero, crachás, passe, vídeo, camadas, molduras e navegações enumerados; SHA da base confirmado |
| 1 | Conteúdo e composição mobile | `index.html`, CSS por seção, `experiences.js` | Baralho exposto, títulos únicos, peças legíveis, nenhuma seção principal formada apenas por texto e foto genérica |
| 2 | Recuperação dos exemplos reais | Ilhas Fatos/Feitio/smiile, assets locais e slots de aparelho | Carrossel muda peças completas; app navega/salva/volta; site responde; aparelho não remonta |
| 3 | Galeria em perspectiva R1 | Novo módulo de scroll e estado por item | Avanço/retorno reproduzíveis; peça atual legível; nenhum salto de índice em rolagem rápida |
| 4 | Crachás e passe R3/2691 | Base Three e passe existentes | Verso individual; física preservada; canto sem buraco; conteúdo do verso acessível |
| 5 | Composição de telas R2 e voz/vídeo | Módulo de câmera; player e áudio sob demanda | Mesma história nas telas; foco estável para interação; áudio só após ação; quadro anterior preservado |
| 6 | Revisão e publicação futura | Suites visuais e funcionais do portfólio | Evidências por estado, comparação com referências, versão publicada correspondente ao SHA aprovado |

Executar fases em ordem, com entregas pequenas e comparáveis. Não consolidar branches antigas inteiras. A fase 6 é parte da implementação futura, não uma publicação realizada nesta análise.

## 11. Critérios finais de aceite

- Viewports: 320x740, 390x844, 430x932, 768x1024, 1440x900 e orientação horizontal. Validar também um Android e um iPhone reais quando disponíveis; emulação não prova FPS em hardware.
- Todos os trabalhos essenciais visíveis sem hover; sem scroll horizontal global, texto cortado ou CTA fixo sobre conteúdo.
- Controles de toque com pelo menos 44x44 px; leitura confortável; foco visível; ordem de tabulação coerente; Escape fecha detalhes e retorna ao acionador.
- Scroll, clique e toque nunca controlam a mesma propriedade ao mesmo tempo. Arraste não captura o scroll vertical por acidente. Avanço, reversão e mudança de orientação preservam o capítulo.
- Fotografias e vídeos decodificados antes da troca. Testar rede lenta, toque repetido, fallback de imagem, perda de contexto WebGL, aba oculta e retorno.
- Movimento reduzido apresenta estados completos com navegação manual, sem parallax, giro decorativo ou avanço automático. Pausa global também para vídeo, áudio e física conforme o estado da seção.
- Uma cena de maior custo em atividade por vez; assets carregados por proximidade; DPR inicial limitado a 1,5 no mobile e 2 no desktop, como já existe nos crachás. Medir antes de ampliar efeitos.
- Metas propostas, ainda não medidas: LCP <= 2,5 s, CLS <= 0,1 e INP <= 200 ms em coleta apropriada; perfil local busca quadros próximos de 16,7 ms. Se houver queda, reduzir planos, sombras e blur antes de retirar conteúdo.
- Revisão visual de cinco checkpoints por referência: repouso, início, meio, fim e retorno. Comparar geometria, hierarquia, material, oclusão, texto e resposta ao gesto, além de testes funcionais.
- Sucesso significa que o visitante consegue ver uma peça, interagir e compreender a contribuição. Uma contagem alta de testes não substitui esse aceite.

## 12. Cobertura e limites desta análise

Foram analisadas as nove imagens e os três vídeos enviados, com metadados, pranchas de sequência e 15 checkpoints em resolução ampliada. Foram lidos componentes atuais e consultadas branches, comparações e deploys. A inspeção ao vivo via Firecrawl recuperou a página pública do portfólio; TinyFish confirmou a presença das seções e a troca Meta/TikTok no desktop, em uma execução limitada.

O TinyFish não conseguiu fixar viewport mobile; a tentativa adicional de interação Firecrawl falhou por erro interno, sem sessão utilizável. Portanto, não há aprovação visual mobile nem medição de desempenho físico nesta rodada. Diagnósticos mobile citados acima são derivados do código e das capturas fornecidas. O mídia kit e a versão Sites retornaram 401 publicamente; seus conteúdos não foram declarados como auditados ao vivo. O mídia kit foi analisado pelo repositório autorizado e pelas imagens enviadas.

## 13. Links de referência verificáveis

- Portfólio publicado: https://portifolio-github-production.up.railway.app/
- Portfólio base: https://github.com/onstandbyx-png/portifolio/tree/702344b5e26e21c7a80713560130e9da969aa289
- Fatos/Feitio base: https://github.com/onstandbyx-png/roblox/tree/b9c827082edc6e2076c864687451ae3d1a1dcf76
- Feitio, transições recentes: https://github.com/onstandbyx-png/roblox/tree/3b992ce1150075b2da158ec3d016c80fa3651028/saas
- smiile, landing atual: https://github.com/onstandbyx-png/smiile-/tree/a2e6d42c526aa721d5059a6baad00cc86418ca3d/sites/smiile-landing
- Landing publicada: https://smiile-landing-preview.up.railway.app/
- Referência Sites enviada: https://smiile-experience.equal-angel-9545.chatgpt.site/
- Mídia kit: https://midia-kit-production-c234.up.railway.app/
- Registro de inspeção TinyFish: https://agent.tinyfish.ai/runs/0c33a436-09ba-4978-857e-924be5b5c0f1

Os links GitHub privados dependem do acesso do proprietário. Não foram copiadas credenciais nem alterados serviços nesta rodada.
