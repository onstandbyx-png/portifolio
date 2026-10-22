# Seção de canais: guia para entender e alterar

Seção "Sua oferta. Em cada canal." (`#laboratorio` em `index.html`). Atualizado em 22/10/2026, commit 6d37ab6.

Este guia é para quem vai mexer na seção, pessoa ou IA, sem ter acompanhado a construção. Ele explica o que a seção faz, como o código está montado, quais nichos e fluxos existem e como alterar cada parte com segurança. Os nomes de arquivo são relativos à raiz do repositório.

## Sumário

1. [O que a seção é](#1-o-que-a-seção-é)
2. [O que o visitante vê e faz](#2-o-que-o-visitante-vê-e-faz)
3. [Mapa dos arquivos](#3-mapa-dos-arquivos)
4. [Modelo de dados](#4-modelo-de-dados)
5. [Motor de estados do aparelho](#5-motor-de-estados-do-aparelho)
6. [Sites dos anunciantes](#6-sites-dos-anunciantes)
7. [Telas do laboratório](#7-telas-do-laboratório)
8. [Nichos e clientes fictícios](#8-nichos-e-clientes-fictícios)
9. [Os 22 fluxos](#9-os-22-fluxos)
10. [Automações demonstradas](#10-automações-demonstradas)
11. [Regras de conteúdo](#11-regras-de-conteúdo)
12. [Receitas de alteração](#12-receitas-de-alteração)
13. [Verificar e publicar](#13-verificar-e-publicar)
14. [Armadilhas conhecidas](#14-armadilhas-conhecidas)
15. [Pendências](#15-pendências)

## 1. O que a seção é

O portfólio vende campanhas e anúncios para pequenos e médios negócios. Esta seção mostra, sem nenhum número de resultado, que o autor conhece o caminho real de cada canal: onde o anúncio aparece, o que prende a atenção, onde a pessoa toca e qual tela nativa fecha a conversão.

São 11 canais e 22 formatos. Cada formato é a campanha de um anunciante fictício, de um dos 8 tipos de cliente que o portfólio atende. Tudo roda dentro de um iPhone 17 Pro Max laranja desenhado em HTML e CSS, como um storyboard finito que toca sozinho e para na tela de conversão.

Nada é enviado a lugar nenhum. Formulários, conversas, carrinhos e notificações são estados de CSS trocados por uma linha do tempo em JavaScript. O único link real da seção é "Conversar sobre uma campanha", que leva ao contato com o serviço "Campanhas e anúncios" preenchido.

## 2. O que o visitante vê e faz

1. **Grade de canais.** Os 11 canais aparecem de uma vez em blocos, sem rolagem lateral, mesmo a 320 px. Cada bloco tem o logo oficial da plataforma, um nome curto e, quando há mais de um formato, um contador. Um marcador branco desliza até o bloco escolhido, e uma legenda mostra o nome e o benefício do canal ("Prender no feed e levar à ação.").
2. **Frente.** Abaixo da grade fica a peça do cliente do primeiro formato do canal (foto, marca, manchete e "Exemplo ilustrativo de restaurante, marca fictícia."). Ao trocar de canal, a peça antiga sai 30 px para o lado em 300 ms e a nova entra com mola de 42 px em 620 ms.
3. **Papel que dobra.** A peça é uma folha com a ponta superior direita dobrada. Puxar a ponta, tocar nela ou usar as setas ← e ↓ no botão da ponta dobra a folha e revela o verso. "Recolocar a peça" fecha.
4. **Verso, o player.** De cima para baixo:
   - logo e nome do canal, com o botão Reproduzir, Pausar ou Rever (sem movimento, Próximo);
   - formatos num controle segmentado, com um marcador que desliza;
   - selo de identificação da plataforma ("Patrocinado", "Promovido", "Anúncio"...) e o chip do cliente ("Restaurante, marca fictícia");
   - jornada em 3 passos (Atenção, Retenção, Conversão), cada um com um trilho de progresso;
   - o iPhone com o anúncio;
   - ao lado, ou abaixo no celular, a frase do formato, o aviso "Exemplo ilustrativo, marca fictícia. Interface aproximada." (mais "Imagens geradas por IA." quando a peça usa foto do estúdio Fatos) e o link de contato.
5. **Reprodução.** Ao abrir o verso, a jornada toca uma vez até a tela de conversão e para, e o botão vira Rever. Um ponto numerado (1, 2 ou 3) marca o elemento do passo atual. Nos quadros de toque, um círculo branco (o dedo) pousa no botão, e o botão fica pressionado.
6. **Navegação manual.**
   - Setas ← e → com o foco no aparelho.
   - Toque nos 31% da esquerda do aparelho volta um quadro; no resto, avança.
   - Deslizar na horizontal por mais de 50 px também troca de quadro.
   - Clicar num passo da jornada pula para ele. O passo 3 vai direto ao quadro do toque no botão de ação.
   - Com o foco num passo, as setas, Home e End trocam de passo.
7. **Comparar.** Trocar de canal com o verso aberto mantém o verso aberto. O formato antigo sai como um "fantasma" e o novo entra.
8. **Sem movimento.** Com movimento reduzido no sistema, a pausa global do site (`body.is-paused`) ou a aba oculta, nada toca sozinho e as transições se desligam. O botão vira Próximo e cada clique mostra o quadro seguinte. O dedo aparece parado, sem animação.
9. **Quando para.** A jornada para quando o player sai da tela, quando a aba fica oculta ou quando a folha fecha (nesse caso ela também volta ao começo). Uma jornada que ainda não começou toca ao entrar na tela.

## 3. Mapa dos arquivos

Tudo fica em `public/assets/showcase/`, salvo indicação.

| Arquivo | Papel | Mexa aqui para |
|---|---|---|
| `index.html` (seção `#laboratorio`) | Casca estática: título, imagem inicial e o crédito com os 8 tipos de cliente. O cartão da galeria (`data-work-card="ads"`) e o serviço "Campanhas e anúncios" também citam "oito tipos" e "onze canais". | Mudar textos fixos ou contagens |
| `static-init.js` | Monta tudo: `mountStaticPresentations` e depois `mountCampaignFlip`. | Raramente |
| `static-presentations.js` e `.css` | Grade de canais (blocos, marcador, legenda), frente com a peça e nota lateral. Nomes curtos em `SHORT` e `TINY`. | Grade e frente |
| `campaign-flip.js` (estilos em `page-peel.css` e `interaction-upgrades.css`) | Folha que dobra, gesto de puxar, foco, `inert`. Monta o player no verso. | Comportamento da dobra |
| `experience-player.js` e `experience-demos.css` | Player: linha do tempo, aplicação dos quadros, ponto numerado, dedo, jornada, formatos, troca animada, teclado e gestos. | Comportamento do storyboard |
| `campaign-channels.js` | Dados e telas: `IMG`, `CLIENTES`, `MARCAS`, ícones genéricos `PATHS`, `mocks`, `groups`, `channels`, `AVISOS`, `SCREEN`, `iphone()`, `renderMock()`. | Quase toda alteração de conteúdo |
| `channel-mocks.css` | Aparelho, cenas e transições, estados dos mocks que não vêm do laboratório (Shorts, LinkedIn, Google, Maps, WhatsApp, ChatGPT...), banner de notificação e conversas. | Visual dos mocks próprios |
| `campaign-sites.js` e `.css` | Os 8 sites dos anunciantes, o formulário instantâneo da Meta e o formulário do LinkedIn, com o motor de passos no fim do CSS. | Fluxo depois do clique |
| `lab-telas.js` e `.css` | Telas portadas do laboratório: Instagram, TikTok, YouTube, Facebook e blog no Safari, mais os elementos de chat do smiile. | Telas das redes |
| `channel-logos.js` | Logos oficiais em SVG, cores e regras de uso; `CHANNEL_LOGO` liga canal e logo. | Só com arquivo oficial |
| `public/assets/portfolio/canais/` e `SOURCES.md` | Fotos dos anunciantes e a origem e licença de cada uma. | Trocar ou acrescentar foto |
| `tests/browser-static-presentations.mjs` | Testes de navegador da seção (e de outras apresentações). | Quando muda canal, rótulo ou comportamento |
| `docs/plans/clientes-canais-20261021.md` | Plano original dos clientes e storyboards. É histórico: o código atual vale mais que ele. | Consulta |

A política de segurança do site (`vercel.json`) só aceita scripts, estilos e fontes do próprio domínio. Não use CDN nem imagem externa: copie o arquivo para `public/assets/`.

## 4. Modelo de dados

Tudo está em `campaign-channels.js`.

### Canal

```js
{ id: 'tiktok', name: 'TikTok', group: 'social', benefit: 'Do vídeo ao carrinho em um toque.',
  art: art('varejo', 'nerd', '50% 28%', 'Joga à noite e edita de dia?', 'Peça da Teclaria, ...'),
  placements: [ ... ] }
```

| Campo | O que é |
|---|---|
| `id` | Chave do canal. Também liga o logo em `CHANNEL_LOGO` e aparece nos testes. |
| `name` | Nome no player e na legenda. |
| `group` | `social`, `search`, `local` ou `content` (rótulos em `groups`). Entra no `aria-label` do bloco. |
| `benefit` | Frase curta da legenda da grade. |
| `art` | Peça da frente: `cliente` (chave de `CLIENTES`), `img` (chave de `IMG`), `pos` (object-position), `titulo` e `alt`. |
| `placements` | Formatos do canal. |

### Formato (placement)

| Campo | O que é |
|---|---|
| `id` | Chave do formato. Junto com o canal forma a chave de `AVISOS` (`'tiktok/infeed'`). |
| `label` | Nome no controle de formatos ("Feed", "Reels", "Anúncio no vídeo"). |
| `mock` | Chave da função em `mocks` que desenha a tela. |
| `cliente` | Chave de `CLIENTES`. Define o chip "marca fictícia". |
| `selo` | Rótulo de identificação, igual ao que a plataforma usa. Se tiver "Orgânico" ou "não é anúncio", o chip fica verde. |
| `frase` | Frase da nota lateral. |
| `passos` | Sempre 3, nesta ordem: `P('Atenção', rótulo, [quadros])`, `P('Retenção', ...)`, `P('Conversão', ...)`. |
| `quadros` | O storyboard (abaixo). |
| `aviso` | Posto automaticamente a partir de `AVISOS`. Não escreva à mão. |

### Quadro

```js
{ ms: 900, cena: 'page', estado: 'w2 q1', toque: 'b', desc: 'Toque em I\'m looking forward to it.' }
```

| Campo | O que é |
|---|---|
| `ms` | Duração do quadro. |
| `cena` | Qual `.cm-scene` do mock fica na tela (`data-scene`). |
| `estado` | Tokens separados por espaço que o CSS desenha (seção 5). |
| `toque` | Chave do elemento `[data-tap="..."]` que o dedo toca neste quadro. |
| `video` | `1` quando o quadro conta para a barra de progresso do vídeo. |
| `desc` | O que a tela mostra, em uma frase. O leitor de tela lê esse texto, e o status anuncia o passo. Escreva como legenda, não como instrução técnica. |

Regras do storyboard:

- Cada índice de quadro pertence a exatamente um passo, e os passos cobrem os quadros em ordem.
- O quadro de toque vem depois do quadro em que o botão aparece ou acende. O toque mostra o dedo; a mudança de tela vem no quadro seguinte.
- O último quadro escrito deve deixar a tela de confirmação à vista, com o token `done` quando o mock tem uma. O teste do TikTok confere `done` no último quadro.
- Para os formatos listados em `AVISOS`, o laço logo abaixo de `AVISOS` acrescenta um quadro final de 2400 ms, na mesma cena, com o estado anterior mais `aviso`, e o põe no passo 3. Esse quadro mostra o banner de notificação do iOS (e-mail ou WhatsApp) com a confirmação.

### Outros dados

- `IMG`: chave, `src`, `w`, `h` de cada foto. `pic(key, { alt, cls, pos })` gera o `<img>` com lazy loading.
- `CLIENTES`: os 8 anunciantes (seção 8). `MARCAS`: o símbolo SVG de cada um. `marca(key, forma, cls)` desenha o símbolo em círculo, quadrado, `app`, `fav` ou alfinete, na cor do cliente.
- `PATHS` e `I(name)`: ícones genéricos de traço, 24 x 24. Nenhum é logo de plataforma.
- `SCREEN`: tema e cor de fundo do aparelho por mock, enquanto carrega (`{ tema: 'escuro', fundo: '#0f0f0f' }`). Sem entrada, vale tela clara e branca.
- `iphone(content, opts)`: corpo, botões, Dynamic Island, barra de status às 10:09 e indicador de início. Sem nome nem logo de fabricante.
- `renderMock(placement)`: chama o mock, injeta o banner do aviso dentro de `.cm-screen` e embrulha no iPhone.

## 5. Motor de estados do aparelho

Um mock devolve um `.cm-screen` com várias `.cm-scene`:

```js
screen('tt',
  scene('video', 'base', 'escuro', LAB.tiktokAd({...})) +
  scene('page', 'sheet', 'claro', `${browserBar('teclaria', 'teclaria.exemplo')}${SITES.teclaria()}`))
```

`scene(id, kind, tema, html, cls, gestos)`:

- `kind` diz como a cena entra:
  - `base` é o fundo;
  - `push` entra pela direita, e a cena anterior recua 26% e escurece um pouco;
  - `sheet` sobe de baixo, e a anterior escurece mais;
  - `fade` aparece no lugar.
- `tema` (`claro` ou `escuro`) da cena na tela pinta a barra de status e o indicador de início. `gestos` troca só a cor do indicador, para uma folha parcial sobre fundo escuro.
- Classes úteis:
  - `cm-scene--part`: fundo transparente, para uma folha parcial por cima da cena anterior;
  - `cm-scene--web`: página aberta no Safari (deixa espaço para a barra de status e para a barra flutuante do Safari).

A cada quadro, `applyFrame` em `experience-player.js` faz o seguinte:

1. **`data-scene` e `data-pos`.** Põe `data-scene` no `.cm-screen` e marca cada cena com `data-pos="on"`, `"under"` ou `"off"`. A cena anterior fica `under` (visível por baixo) só quando a nova é `push` ou `sheet`.
2. **`data-state`.** Escreve no `.cm-screen` os tokens do quadro mais o último estado de cada cena que já saiu. Assim, o vídeo debaixo de uma folha continua no último corte.
3. **`data-tap`.** Remove o `data-tap` do quadro anterior. Depois que a cena assenta, põe o do quadro atual, para o CSS desenhar o botão pressionado.
4. **Espera e posicionamento.** Espera a cena assentar (820 ms quando a cena muda, para a página "carregar"; 440 ms quando não muda; 20 ms sem movimento) e então posiciona:
   - o ponto numerado no último elemento visível com `data-hs~="n"`, em que `n` é o número do passo (1, 2 ou 3). Um elemento pode ter `data-hs="2 3"`. `data-hs-at="tl"` põe o ponto no canto superior esquerdo, longe de um rótulo de anúncio no canto direito;
   - o dedo no último elemento visível com `data-tap` igual ao `toque` do quadro.

   "Visível" quer dizer com tamanho, `visibility: visible` e nenhum ancestral com opacidade 0 dentro da cena. Por isso o dedo não pousa num botão que o quadro ainda não revelou.
5. **Vídeo.** Atualiza a barra `[data-cx-progress]`, somando só os quadros com `video: 1`.

Nem o ponto nem o dedo ficam sobre a barra de status ou a Dynamic Island, nem fora da tela.

### Vocabulário de tokens

Os tokens não são globais: cada mock define os seus no CSS, e o mesmo nome pode ter sentidos diferentes em mocks diferentes. Antes de usar um token, procure `data-state~="token"` no CSS do mock.

| Token | Onde | O que faz |
|---|---|---|
| `lit` | Quase todos os anúncios | A barra ou botão de ação acende (`.ig-cta`, `.igr-cta`, `.igs-link--ad`, `.igl-fixado`, `.tt-cta`, `.fb-link-btn`, `.cm-fbv-cta`, `.cm-fbb-cta`, `.cm-vcta--yt`, `.cm-xp-ad`) |
| `done` | Todos | Tela final: a folha `.cm-done` dos mocks próprios; nos sites, o passo final já tem a confirmação |
| `aviso` | Formatos de `AVISOS` | Banner de notificação do iOS desce do alto |
| `c2`, `c3` | `igFeed`, `fbFeed` | Carrossel no cartão 2 ou 3, com contador e pontos |
| `s2` | `igReels`, `ttFeed` | Segundo corte do vídeo (`.cm-shot[data-shot="2"]`) |
| `s2` | `ytInstream` | Painel do carro e botão Pular |
| `s2` | `gDisplay` | Título alternado do anúncio |
| `s2`, `s3` | `blogArticle` | Rolagem do artigo (os três passos, depois o bloco Oferecido por) |
| `s2` | `mapsLocal` | Ficha patrocinada aberta |
| `paid`, `s2`, `s3` | `ytLive` | Aviso de promoção paga, cartela #publi, mensagem fixada |
| `s1`, `ty`, `s3`, `s4`, `s2` | `gptAnswer` | 1ª resposta; campo digitando; 2ª pergunta e "pensando"; 2ª resposta e sugestões; divisor, frase e cartão do anúncio |
| `typing`, `r` | `gSearch` | Busca digitando; resultados |
| `typing` | `mapsLocal` | Busca digitando |
| `p2` a `p4` | `liFeed` | Páginas do documento |
| `p4`, `mail` | `seoOrganic` | Planta de 4 quartos; folha do e-mail |
| `q`, `ok` | `ytShorts` (cena video) | Exercício na tela; resposta certa |
| `load` | `ytShorts` (cena store) | Instalando |
| `skip` | `fbbreak` | "Pular em 5" vira "Pular" |
| `open` | `waAd` | Legenda aberta |
| `m2` a `m5`, `ls`, `lp` | `waAd` (cena chat) | Mensagens da conversa; lista de opções aberta; opção escolhida |
| `ct` | `waCatalog` (cena item) | Barra "Ver carrinho" |
| `k1` a `k4` | `waCatalog` (cena chat) | Etapas da conversa do pedido |
| `w2` a `w6` | Sites (seção 6) | Passo ativo do site |
| `q1` a `q6` | Sites | Escolha acesa e o que ela revela |

## 6. Sites dos anunciantes

`campaign-sites.js` exporta `makeSites({ I, pic, marca, esc, CLIENTES })`, que devolve uma função por site. Cada site tem visual próprio e os passos do fluxo real daquele tipo de negócio.

### Peças

| Função | Gera |
|---|---|
| `site(key, cls, steps, brand)` | `.cm-site.cm-site--<cls>` com `--brand` (cor do cliente, ou `brand` quando o formulário é da plataforma). Cada item de `steps` vira `section.cm-site-step[data-step=n]`. |
| `body(html, cls)`, `foot(html)` | Corpo rolável e rodapé fixo do passo |
| `cta(text, tap, hs = '3')` | Botão principal com `data-tap` |
| `pk(text, { q, on, tap, cls, sub, off, icon })` | Opção (chip, rádio, dia, horário). `q` liga a opção a um token `qN`; `on` já vem marcada; `off` indisponível |
| `days([[dia, número, flag]], q, tap)` | Fila de dias; flag `'on'`, `'off'` ou `'q'` (a escolhida pelo toque) |
| `slots(lista, escolhido, q, tap, cls)` | Lista de horários |
| `calendar({ free, pick, q, tap })` | Outubro de 2026 (começa na quinta, hoje é dia 21); `free` com ponto, `pick` é o dia tocado |
| `show(q, html)` | Bloco que aparece quando `qN` entra |
| `field`, `label`, `tick`, `back`, `actions` | Campo preenchido, rótulo, item marcado, cabeçalho com voltar, ações finais |
| `ok(title, text)` | Selo de confirmação, que pula quando o passo entra |
| `ticket([[rótulo, valor, largura]])` | Resumo final; largura `1` ocupa a linha toda, `2` ocupa duas colunas |
| `mapa(lugar, endereço)` | Mapa com alfinete |

### Motor de passos

As regras ficam no fim de `campaign-sites.css` ("Step engine (generated)"). Elas foram geradas uma vez e coladas; não há script gerador no repositório.

- O passo 1 aparece por padrão. `wN` mostra o passo N e empurra os anteriores para a esquerda (-28%, apagados).
- `qN` acende `[data-pick~="qN"]` (variável registrada `--pk-on`) e revela `[data-show~="qN"]`.
- `data-tap` de `a` a `h` ganha o estado pressionado quando o quadro toca nele.
- `.cm-site-ok` do passo ativo pula ao aparecer.
- Os limites são `w6`, `q6` e as teclas `a` a `h`. Para ir além, copie a última regra de cada grupo e troque o número ou a letra.

Os quadros e o site precisam combinar. No feed do Instagram (`sotaque()`, variante `teste`):

| Quadro | Estado e toque | No site |
|---|---|---|
| 4 | `toque: 'a'` | "Fazer o teste de nível", passo 1 |
| 5 | `w2` | Pergunta 3 de 3 |
| 6 | `w2 q1`, `toque: 'b'` | A opção certa acende (`data-pick="q1"`) e o retorno aparece (`show('q1', ...)`) |
| 7 | `w2 q1`, `toque: 'c'` | "Ver meu resultado" |
| 8 | `w3` | Nível B1 e horários |
| 9 | `w3 q2`, `toque: 'd'` | 19:00 |
| 10 | `w3 q2`, `toque: 'e'` | Continuar |
| 11 | `w4`, `toque: 'f'` | Dados e "Confirmar aula" |
| 12 | `w5 done` | Aula marcada (ticket) |

### Sites e variantes

| Site | Visual | Variantes e passos |
|---|---|---|
| `tacho` (restaurante) | Papel quente, títulos serifados, cardápio primeiro | `reserva` (padrão): cardápio, dia, pessoas e horário, dados e ocasião, reserva solicitada. `direto` (`{ slot, people, area }`): começa na reserva. `retirada`: cardápio com adicionar e sacola, janela de retirada, pagamento na retirada, pedido 0427 com acompanhamento |
| `sotaque` (escola) | Coral, formas redondas | `teste` (padrão): apresentação, pergunta, nível e horário, dados, aula marcada. `agenda` com `pick: 'nivel'` ou `'modalidade'`: horário, dados, aula marcada (online ou na unidade) |
| `seixo` (clínica) | Branco e verde-água, barra de 3 etapas | Serviço, calendário e horário, dados do paciente, avaliação agendada com mapa |
| `falesia` (incorporadora) | Areia e azul-petróleo, serifa | Galeria do decorado, tipo de visita e horário, contato, visita agendada com mapa |
| `teclaria` (loja) | Branco e violeta, produto primeiro | `compra` (padrão): produto com memória e cor, botão que vira "No carrinho" e contador, carrinho, pagamento com Pix, pedido 10482 com Pix copia e cola. `espera`: lista de espera do branco |
| `bandeirola` (agência) | Ocre, festivo | `roteiro` (padrão): dias e com quem, o que ver, roteiro gerado e consultor no WhatsApp. `saida`: saída e viajantes, pré-reserva sem pagamento, próximos passos |
| `arrimo` (gestora) | Azul-marinho e papel, serifa | Calendário e horário, dados e assunto, conversa agendada |
| `ondara` (concessionária) | Verde-escuro e branco | Versão, loja e período, dados com carteira de motorista, pedido enviado |
| `metaForm` | Formulário instantâneo da Meta (`#0866ff`) | Capa, pergunta e dados do perfil, revisão, obrigado |
| `linkedinForm` | Lead Gen do LinkedIn (`#0a66c2`) | Dados do perfil, revisão, guia liberado em PDF |

Os temas ficam em `campaign-sites.css`, por `.cm-site--<cls>`, com `--site-bg`, `--site-ink`, `--site-line`, `--site-soft`, `--site-muted` e `--site-r`.

## 7. Telas do laboratório

`lab-telas.js` exporta `makeLabScreens({ marca, esc, CLIENTES, pic })` e `IG_FUNDO` (`#0c1014`). As telas foram portadas do estúdio do mídia kit Fatos (repositório privado `onstandbyx-png/roblox`, `src/components/islands/estudio/*.tsx` e `src/styles/estudio-*.css`). Mantêm os mesmos nomes de classe (`ig-`, `igs-`, `igr-`, `tt-`, `yt-`, `fb-`, `blog-`) e as mesmas medidas, em modo escuro, como nas capturas do app.

Adaptações para anúncio:

- a segunda linha do cabeçalho diz "Patrocinado";
- há uma barra de ação sob a mídia que acende com `lit`;
- não há contagem de curtidas, comentários ou visualizações.

| Função | Elemento do laboratório | Usada em | Parâmetros |
|---|---|---|---|
| `feedAd` | fatos-ig-feed-carrossel-v1 | `igFeed`, `waAd` | `{ key, media, carousel, cta: { text, tap, hs, lead, cls }, caption: { html, hs }, captionOpen }` |
| `storyAd` | fatos-ig-story-reels-v1 | `igstory` | `{ key, media, cta, bars }` |
| `liveAd` | Moldura do story, adaptada para live | `iglive` | `{ key, media, comments: [[quem, texto, daMarca, hs]], cta }` |
| `reelsAd` | fatos-ig-story-reels-v1 | `igReels` | `{ key, video, caption, cta, audio }` |
| `explore`, `postAberto` | fatos-ig-feed-carrossel-v1 | `igexplore` | `{ cells }`; `{ key, media, cta, caption }` |
| `tiktokAd` | fatos-tiktok-para-voce-v1 | `ttFeed` | `{ key, video, caption, cta, sound }` |
| `youtubeAd` | fatos-youtube-player-v1 | `ytInstream` | `{ key, player, panel: { title, button, tap, hs }, title, meta }` |
| `youtubeLive` | fatos-youtube-player-v1 | `ytLive` | `{ player, title, meta, chat }` |
| `facebookAd` | fatos-facebook-feed-v1 | `fbFeed`, `fbpost` | `{ key, text, media, after, next: { name, time, text, media } }` |
| `blogArticle` | fatos-blog-safari-v1 | `blogArticle` | `{ key, site, domain, kicker, title, by, photo, body, offer: { text, button }, tail }` |
| `.sf-activity`, `.sf-suggestions` (CSS) | smiile-chat-fiel-atividade-v1, smiile-chatfiel-pedidos-sugeridos-v1 | `gptAnswer` | Classes no HTML do mock |

Outros elementos do laboratório que entraram:

- o seletor de plataforma do estúdio Fatos virou a grade de canais;
- o controle segmentado do smiile virou os formatos;
- formulário em etapas (K18), micro carrinho com progresso e chips sugeridos estão nos sites;
- a barra de notificação do mídia kit virou o banner do iOS;
- as cenas `cena-esportes`, `cena-nerd` e `cena-crencas` do estúdio Fatos são imagens.

Sem módulo no laboratório, estes formatos usam telas próprias em `channel-mocks.css`: Shorts, Facebook vídeo e intervalos, LinkedIn, Google Pesquisa, Display e SEO, Maps, as telas do WhatsApp e a moldura do ChatGPT.

Medidas: `--u` é 1/412 da largura da tela (o aparelho tem tela lógica de 412 x 895,2). `--topo` e `--pe` são as áreas seguras do iOS. Escreva tudo em `calc(var(--u)*N)`, nunca em px, para a tela escalar em qualquer largura.

## 8. Nichos e clientes fictícios

Os 8 tipos vêm dos serviços que o portfólio já mostra. A clínica entra como inferência (é o cliente típico de agendamento por busca e WhatsApp), e a concessionária, pelo alcance.

| Tipo (`CLIENTES`) | Marca | Arroba e domínio | Cor | Símbolo | Formatos | Site | Aviso do setor |
|---|---|---|---|---|---|---|---|
| `restaurante` | Tacho Miúdo | tachomiudo, tachomiudo.exemplo | `#a4462a` | "tm" | Instagram Reels e Live, Facebook Vídeo, Maps, WhatsApp Catálogo (e o vídeo antes do intervalo do Facebook) | `tacho` | Nenhum |
| `clinica` | Seixo Odontologia | seixoodontologia, seixo.exemplo | `#2f6f73` | Seixo (elipse) | Instagram Explorar, Google Pesquisa, WhatsApp clique para conversar | `seixo` | "[RT e CRO]" no anúncio e "Responsável técnico e CRO aparecem aqui." no site |
| `incorporadora` | Morada Falésia | moradafalesia, moradafalesia.exemplo | `#1f4e5f` | Falésia e ondas | Facebook Feed e Post, SEO | `falesia`, `metaForm` | "Imagens ilustrativas. CRECI e registro de incorporação aparecem aqui." |
| `varejo` | Teclaria (loja de tecnologia) | teclaria, teclaria.exemplo | `#5b3df5` | Tecla | TikTok, YouTube Live | `teclaria` | Nenhum |
| `turismo` | Bandeirola Viagens | bandeirola, bandeirola.exemplo | `#d9822b` | Bandeirolas | Google Display, ChatGPT | `bandeirola` | Nenhum |
| `educacao` | Sotaque Livre Idiomas (curta: Sotaque Livre) | sotaquelivre, sotaquelivre.exemplo | `#e5533d` | Balão de fala | Instagram Feed e Story, Facebook intervalos, YouTube Shorts | `sotaque` | Nenhum |
| `financas` | Arrimo Patrimônio | arrimo, arrimo.exemplo | `#0f1a2c` | Glifo dourado (logo fictício do estúdio Fatos) | LinkedIn, Publieditorial | `arrimo`, `linkedinForm` | "Investimentos envolvem riscos." e nenhuma imagem de gráfico de rendimento |
| `automotivo` | Ondara Elétricos | ondara, ondara.exemplo | `#0f6b5c` | Onda | YouTube anúncio no vídeo | `ondara` | Mensagem educativa de trânsito (CTB, art. 77-B), texto oficial a definir |

Dados de exemplo usados nos fluxos:

- **Pessoa:** Marina Alves, (11) 90000-0000, marina@exemplo.com.
- **Endereços:** "Rua Exemplo", "Av. Exemplo", em bairros de São Paulo.
- **Datas:** hoje é quarta, 21/10/2026, e o relógio marca 10:09. Os agendamentos caem em sábado, 24; terça, 27; quinta, 29; e sexta, 30 de outubro. As viagens são em junho.

Verificação dos nomes (busca de 21/10/2026):

- Os 8 nomes não coincidem com negócios do mesmo ramo no Brasil.
- Ondara deve aparecer sempre como "Ondara Elétricos", nunca "Ondara Motors", que existe na Espanha.
- Arco, Rota Viva, Kairo e Casa Costa (como anunciante imobiliário) foram descartados por coincidirem com empresas reais.
- Também foram descartados Brasa Mansa, Nácar, Calmaria, Orvalho, Moara, Movera, Zênite, Alvor, Voltaia, Ravina e Linguar.
- A busca no INPI ainda está pendente.

## 9. Os 22 fluxos

Cada linha resume: onde está o anúncio, o que prende a atenção, o que retém, o caminho da conversão e como termina. "Aviso" é a notificação do iOS acrescentada no fim.

| Canal e formato | Cliente | Selo | Atenção | Retenção | Conversão | Fim | Aviso |
|---|---|---|---|---|---|---|---|
| Instagram, Feed | Sotaque Livre | Patrocinado | Pergunta no 1º cartão do carrossel | Desliza: três expressões e a resposta | Teste de nível com uma pergunta, nível B1, horário, dados | Aula marcada (ticket e lista do que preparar) | E-mail |
| Instagram, Reels | Tacho Miúdo | Patrocinado | Tacho fervendo | Corte para o prato | Cardápio, reserva (dia, pessoas, horário), dados e ocasião | Reserva solicitada | WhatsApp |
| Instagram, Story | Sotaque Livre | Patrocinado | Pergunta sobre a foto | Adesivo de link acende | Nível, horário, dados | Aula marcada | E-mail |
| Instagram, Live | Tacho Miúdo | Patrocinado | Selo Ao vivo e o tacho | A marca responde um comentário | Retirada: adicionar, sacola, janela, pagamento na retirada | Pedido 0427 com acompanhamento | WhatsApp |
| Instagram, Explorar | Seixo | Patrocinado | Post patrocinado na grade | Abre em tela cheia | Serviço, calendário, horário, dados | Avaliação agendada com mapa | WhatsApp |
| Facebook, Feed | Morada Falésia | Patrocinado | Vista do mar no 1º cartão | Sala e planta nos outros cartões | Formulário instantâneo: pergunta, dados do perfil, revisão | Obrigado | WhatsApp do corretor |
| Facebook, Post | Morada Falésia | Patrocinado | Sala com vista | Barra do link acende | Galeria, tipo de visita, horário, contato | Visita agendada com mapa | E-mail |
| Facebook, Vídeo | Tacho Miúdo | Patrocinado | Prato no 1º quadro | Botão acende no fim do vídeo | Reserva direta (12:30, 4 pessoas, varanda), dados | Reserva solicitada | WhatsApp |
| Facebook, Ad breaks | Sotaque Livre | Patrocinado | Vídeo começa e a pausa chega | "Pular em 5" vira "Pular" | Aula na unidade, horário, dados | Aula marcada na unidade | E-mail |
| TikTok, In-Feed | Teclaria | Patrocinado | Pergunta em texto nativo | 2º corte mostra os dois usos | Produto (32 GB), carrinho, pagamento com Pix | Pedido 10482 com Pix copia e cola | E-mail |
| YouTube, Anúncio no vídeo | Ondara | Patrocinado | Mensagem antes do Pular | Painel mostra a carga | Versão, loja e dia, dados com carteira de motorista | Pedido de test drive | WhatsApp |
| YouTube, Shorts | Sotaque Livre | Patrocinado | Frase curta | Exercício com lacuna e resposta | Instalar, folha da loja de apps, Obter | App instalado (Abrir) | Nenhum |
| YouTube, Live | Teclaria com um criador | Inclui promoção paga | Aviso de promoção paga | Cartela #publi e chat | Link fixado, lista de espera | Na lista | Nenhum |
| LinkedIn, Documento | Arrimo | Promovido | Problema do sócio na 1ª frase | Páginas de amostra | Desbloquear, formulário com dados do perfil, revisão | Guia em PDF liberado | Nenhum |
| Google Ads, Pesquisa | Seixo | Resultado patrocinado | "dentista perto de mim" digitando | Título responde à busca | Ligar, folha do iPhone | Chamando | Nenhum |
| Google Ads, Display | Bandeirola | Anúncio | Banner na matéria sobre festas | Título muda (combinação de recursos) | Saída de junho, pré-reserva sem pagamento | Pré-reserva recebida | WhatsApp |
| SEO, Orgânico | Morada Falésia | Orgânico, sem anúncio | Resultado com o termo buscado | Plantas de 3 e 4 quartos | PDF em troca do e-mail | E-mail enviado | E-mail |
| ChatGPT, Resposta | Bandeirola | Anúncio | Conversa em dois turnos | Cartão do anúncio abaixo da resposta, separado dela | Monte seu roteiro (dias, o que ver), roteiro gerado, consultor | Consultor vai chamar | Nenhum |
| Google Maps, Local | Tacho Miúdo | Patrocinado | Alfinete quadrado no caminho | Ficha com prato e horário | Rotas, Iniciar | Navegação iniciada | Nenhum |
| WhatsApp, Clique para conversar | Seixo | Patrocinado | Hora marcada na própria arte | Legenda convida a contar mais | Conversa com mensagem pronta, automação, lista, período, horário | Avaliação agendada e localização | Nenhum |
| WhatsApp, Catálogo | Tacho Miúdo | Catálogo, não é anúncio | Vitrine no perfil | Coleções por ocasião | Item, carrinho, pedido, atendimento automático | Pedido confirmado e lembrete | Nenhum |
| Publieditorial, Artigo | Arrimo | Conteúdo patrocinado | Aviso de patrocínio antes do título | Leitura útil, marca no fim | Agenda: dia, hora, assunto | Conversa agendada | E-mail |

Os formatos sem aviso já terminam numa conversa, numa ligação, numa rota ou num app aberto, que é a confirmação nativa.

## 10. Automações demonstradas

Todas são simuladas por estados de CSS. Servem para mostrar ao cliente o que pode ser configurado, não para afirmar que uma integração existe.

- **WhatsApp, clique para conversar** (`waAd`):
  - o anúncio abre a conversa com a mensagem pronta e a prévia do anúncio citada;
  - a resposta automática ("Mensagem automática") chega com "Ver opções", que abre uma lista de atendimentos;
  - respostas rápidas pedem o período e depois o horário;
  - a confirmação chega com a localização da clínica.

  Cada resposta é antecedida pelos três pontos de "digitando".
- **WhatsApp, catálogo** (`waCatalog`): o carrinho vira uma mensagem de pedido na conversa. A automação pergunta como receber e o horário, manda o resumo com "Confirmar pedido" e confirma com lembrete.
- **Formulário instantâneo da Meta e Lead Gen do LinkedIn:** campos preenchidos a partir do perfil, uma pergunta do anunciante, revisão e obrigado, com o texto de privacidade de cada plataforma.
- **Confirmação depois da conversão** (`AVISOS`): e-mail ou WhatsApp do anunciante na notificação do iPhone.
- **Pedido e pagamento:** acompanhamento de pedido (recebido, em preparo, pronto), Pix copia e cola com prazo e lista de espera com um único aviso.
- **Agenda:** calendário com dias livres, horários do dia escolhido, lembrete pelo WhatsApp marcado no formulário e "Adicionar à agenda".
- **ChatGPT:** linhas de atividade enquanto o assistente pensa e pedidos sugeridos depois da resposta (elementos do chat do smiile). O anúncio vem depois de um divisor, apresentado por uma frase cinza.

## 11. Regras de conteúdo

1. **Marcas fictícias.** Todo anunciante é fictício e é identificado fora do aparelho ("Exemplo ilustrativo, marca fictícia."). Nenhuma empresa, pessoa ou celebridade real.
2. **Sem números inventados.** Nada de métrica, resultado, alcance, avaliação, número de avaliações, depoimento ou preço. Nenhuma contagem de engajamento nas telas: ações só com ícones.
3. **Identificação de publicidade.** Cada anúncio usa o rótulo da plataforma em pt-BR:
   - Instagram, Facebook, TikTok, YouTube e Maps: "Patrocinado";
   - LinkedIn: "Promovido";
   - Google Pesquisa: "Resultado patrocinado";
   - Display e ChatGPT: "Anúncio";
   - live de criador: "Inclui promoção paga" e #publi;
   - publieditorial: "Conteúdo patrocinado por <marca>" antes do título (guia do CONAR).

   Resultado orgânico e catálogo nunca levam rótulo de anúncio (o teste confere o orgânico).
4. **Logos de plataforma.** Só os arquivos oficiais de `channel-logos.js`, sem mudar forma nem cor, e só onde a própria interface mostra a marca. Os outros glifos são genéricos (`PATHS`, ícones portados do laboratório). O publieditorial não tem logo: usa um glifo de documento.
5. **Fotos.**
   - Nenhuma pessoa identificável, logotipo, texto legível ou preço.
   - Origem e licença registradas em `public/assets/portfolio/canais/SOURCES.md`.
   - Fotos geradas por IA (estúdio Fatos) disparam "Imagens geradas por IA." na nota (`AI_IMAGES` em `experience-player.js`).
6. **Avisos de setor** como marcador, sem número inventado (tabela da seção 8).
7. **Texto.**
   - pt-BR, frases em caixa normal, voz ativa.
   - `desc` descreve o que a tela mostra.
   - Datas e horários no formato do app ("Qui, 29 out", "19:00").

## 12. Receitas de alteração

### 12.1 Mudar texto, tempo ou ordem de um quadro

Edite o objeto em `channels` (`campaign-channels.js`). Se o texto aparece dentro do aparelho, mude também o HTML do mock ou do site, e mantenha `desc` igual ao que a tela mostra.

### 12.2 Acrescentar um toque num fluxo

Exemplo: pedir a quantidade de pessoas antes do horário na reserva do Reels.

1. No site (`tacho`), dê ao elemento uma escolha e uma tecla livres no passo: `pk('4', { q: 'q3', tap: 'g' })`.
2. Nos quadros, insira `{ ms: 900, cena: 'page', estado: 'w2 q3', toque: 'g', desc: 'Toque em 4 pessoas.' }` e mantenha `q3` nos quadros seguintes do mesmo passo.
3. Ajuste os índices de `passos` (o passo 3 recebe o novo índice, e os seguintes andam uma casa).
4. Se o `q` ou a tecla passarem do limite (`q6`, `h`), estenda o motor de passos (seção 6).

### 12.3 Trocar o cliente de um formato

1. `placement.cliente` e o texto da `frase`.
2. O mock: `key` passado às telas do laboratório, fotos, textos e o site aberto depois do clique (`SITES.<site>()`).
3. `AVISOS['canal/formato'].cliente` e o texto.
4. Se for o 1º formato do canal, `channel.art` (peça da frente).
5. Os textos fixos de `index.html`, se a lista de tipos mudar.

### 12.4 Acrescentar um formato a um canal

Exemplo: um anúncio de carrossel em Reels para a Teclaria, no Instagram.

```js
// 1. campaign-channels.js, dentro de mocks:
igReelsTec: () => screen('reels', scene('video', 'base', 'escuro', LAB.reelsAd({ key: 'varejo',
    caption: 'Um notebook para os dois turnos.', cta: { text: 'Comprar agora' },
    video: `<div class="cm-shots">
      <figure class="cm-shot" data-shot="1">${pic('nerd', { alt: 'Notebook com a tela acesa.' })}<p class="cm-ontext" data-hs="1">Joga à noite?</p></figure>
      <figure class="cm-shot" data-shot="2">${pic('cenaNerd')}<p class="cm-ontext">E edita de dia.</p></figure></div>` })) +
  scene('page', 'sheet', 'claro', `${browserBar('teclaria', 'teclaria.exemplo')}${SITES.teclaria()}`)),

// 2. No canal instagram, em placements:
{ id: 'reels-loja', label: 'Reels de loja', mock: 'igReelsTec', cliente: 'varejo', selo: 'Patrocinado',
  frase: 'Uma loja de tecnologia leva do Reels ao carrinho.',
  passos: [P('Atenção', 'Pergunta no primeiro segundo', [0]), P('Retenção', 'Corte mostra o uso', [1]), P('Conversão', 'Produto, carrinho e Pix', [2, 3, 4, 5])],
  quadros: [
    { ms: 1400, cena: 'video', video: 1, desc: 'Reels patrocinado da Teclaria: Joga à noite?' },
    { ms: 1800, cena: 'video', estado: 's2 lit', video: 1, desc: 'Corte para a mesa: E edita de dia. O botão Comprar agora ganha cor.' },
    { ms: 900, cena: 'video', estado: 's2 lit', video: 1, toque: 'cta', desc: 'Toque em Comprar agora.' },
    { ms: 1500, cena: 'page', desc: 'O navegador do Instagram abre a página do Teclaria Pro 15.' },
    { ms: 900, cena: 'page', estado: 'q1', toque: 'a', desc: 'Toque em 32 GB.' },
    { ms: 2000, cena: 'page', estado: 'w4 q2 done', desc: 'Pedido feito, com o Pix copia e cola.' },
  ] },

// 3. SCREEN: igReelsTec: { tema: 'escuro', fundo: '#000' },
// 4. Opcional: AVISOS['instagram/reels-loja'] = { app: 'mail', cliente: 'varejo', texto: '...', desc: '...' };
```

Depois:

- confira se o controle de formatos cabe a 320 px (os rótulos não quebram; se não couberem, a fila rola por dentro);
- confira se os textos de `index.html` com contagens continuam certos.

### 12.5 Acrescentar um canal

1. Acrescente o objeto em `channels`, na posição desejada, com `group` existente.
2. Logo: só se houver arquivo oficial. Inclua em `LOGOS` e em `CHANNEL_LOGO` de `channel-logos.js`, com a data da consulta e a regra de uso. Sem logo, use `null`: o bloco recebe o glifo de documento.
3. Nome curto do bloco em `SHORT` (e `TINY` abaixo de 360 px), em `static-presentations.js`.
4. Mock, quadros, `SCREEN` e, se fizer sentido, `AVISOS`.
5. Atualize `channelIds` em `tests/browser-static-presentations.mjs` e os textos com "onze canais" em `index.html`.
6. Teste a grade a 320, 390 e 1440 px: todos os blocos visíveis, sem nome cortado.

### 12.6 Acrescentar um nicho (cliente)

1. **Nome.** Pesquise antes. Não pode coincidir com empresa do mesmo ramo no Brasil (registre a busca nos documentos).
2. **`CLIENTES.<chave>`:** `{ tipo, marca, curta?, arroba, dominio: '<nome>.exemplo', cor }`.
3. **`MARCAS.<chave>`:** símbolo simples em SVG 100 x 100, branco sobre a cor do cliente. Não copie logo existente.
4. **Site.** Uma função em `makeSites` com os passos reais do negócio, mais um tema `.cm-site--<cls>` em `campaign-sites.css`.
5. **Fotos.** Em `public/assets/portfolio/canais/`, em WebP de até 1200 px e 150 KB, sem metadados. Registre a origem e a licença em `SOURCES.md` e a entrada em `IMG`.
6. **Aviso do setor**, se houver (seção 8).
7. **Textos de `index.html`** que listam os tipos.

### 12.7 Mudar um site

- Um passo é uma string no array de `site(...)`. Acrescentar um passo exige `wN` nos quadros e, depois de 6 passos, estender o motor.
- Use os auxiliares (`pk`, `days`, `slots`, `calendar`, `ticket`...) para manter o visual.
- Para o leiaute do tema, edite `.cm-site--<cls>` em `campaign-sites.css`.

### 12.8 Usar uma tela do laboratório num mock próprio

Troque o HTML da cena base por `LAB.<função>({...})` e confira três coisas:

- o `data-tap` e o `data-hs` que a função já coloca (`cta.tap` padrão `'cta'`, `cta.hs` padrão `'3'`);
- a entrada em `SCREEN`, com o fundo do app em modo escuro;
- se o CSS antigo do mock ainda é usado (remova regras órfãs de `channel-mocks.css`).

## 13. Verificar e publicar

```bash
node scripts/build-vercel.mjs              # gera dist/
cd dist && python3 -m http.server 4600     # serve em http://localhost:4600/#laboratorio
npm run -s check                           # estrutura e sintaxe
```

Testes de navegador da seção (sobem o `server.mjs` sozinhos; Playwright pré-instalado em `/opt/node-tools`):

```bash
QA_PACKAGE=/opt/node-tools/package.json QA_WIDTHS=390,1440 PORT=4195 node tests/browser-static-presentations.mjs
```

O teste para no primeiro erro, e 4 verificações do deck Fatos já falham no commit atual. Para ver todas as verificações da seção mesmo assim, rode uma cópia que não interrompe:

```bash
sed 's/assert(pass,name);//' tests/browser-static-presentations.mjs > tests/.tmp-static.mjs
QA_PACKAGE=/opt/node-tools/package.json QA_WIDTHS=390,1440 PORT=4195 node tests/.tmp-static.mjs
node -e "const r=require('./qa/static-presentations/results.json');for(const row of r)for(const c of row.checks)if(!c.pass)console.log(row.width,c.name)"
rm tests/.tmp-static.mjs
```

Captura quadro a quadro, para conferir um fluxo (salve como `frames.cjs` fora do repositório, com o `dist` servido na porta 4600):

```js
// node frames.cjs <saida> <canal> <indiceDoFormato> <quadro:esperaMs,...>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const [out, ch, pl, spec] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:4600/#laboratorio', { waitUntil: 'networkidle' });
  await p.click(`[data-sp-tab="${ch}"]`); await p.waitForTimeout(400);
  await p.locator('[data-peel-grip]').first().click(); await p.waitForTimeout(900);
  if (+pl) await p.click(`[data-cx-placement="${pl}"]`);
  await p.waitForTimeout(800);
  const stage = p.locator('[data-cx-body] .cx-stage'); await stage.scrollIntoViewIfNeeded();
  for (const item of spec.split(',')) {
    const [f, wait] = item.split(':').map(Number);
    await p.evaluate(f => {   // pausa e anda até o quadro com as setas, como o visitante
      const play = document.querySelector('[data-cx-play]');
      if (play.getAttribute('aria-pressed') === 'true') play.click();
      const st = document.querySelector('[data-cx-body] .cx-stage'); st.focus();
      const cur = +document.querySelector('[data-cx-body] .cm-screen').dataset.frame;
      for (let i = 0; i < Math.abs(f - cur); i++) st.dispatchEvent(new KeyboardEvent('keydown', { key: f > cur ? 'ArrowRight' : 'ArrowLeft', bubbles: true }));
    }, f);
    await p.waitForTimeout(wait);
    await stage.screenshot({ path: `${out}-${f}.png` });
  }
  await b.close();
})();
```

Exemplo: `node frames.cjs /tmp/tt tiktok 0 0:900,5:1200,12:1500`. Use uma espera de 900 a 1500 ms depois de mudar de cena, para a página "carregar".

Publicação:

- O Vercel (projeto `prj_HZcKpv7XbNdAVfi7AWivHdZrJc9A`, endereço https://portfolio-visual-review.vercel.app) roda `node scripts/build-vercel.mjs` e publica `dist/` (`vercel.json`).
- O trabalho fica na branch `ccr-982a6ce6-s02tyu`. Faça commit e deploy a cada sessão de mudanças.
- Deploy pela API do Vercel (ferramenta `create_deployment`), depois do push, sem passar `teamId`:

  ```json
  { "name": "portfolio-visual-review", "project": "prj_HZcKpv7XbNdAVfi7AWivHdZrJc9A", "target": "production",
    "gitSource": { "type": "github", "org": "onstandbyx-png", "repo": "portifolio", "ref": "ccr-982a6ce6-s02tyu", "sha": "<commit>" } }
  ```

  Confira com `get_deployment` até `READY` e veja se o alias `portfolio-visual-review.vercel.app` aponta para o novo deploy.
- A pasta `docs/` não vai para o `dist/`: uma mudança só de documentação não precisa de deploy.

## 14. Armadilhas conhecidas

- **Tokens herdados.** O estado de uma cena que saiu continua em `data-state` (seção 5). Uma regra como `[data-state~="lit"] .botao` sem a classe do componente pode acender coisas em outra cena. Sempre escope pelo componente.
- **O dedo some.** O player só mira elementos visíveis. Se o botão está dentro de um bloco com opacidade 0 (por exemplo, um `show` cujo `q` não está no estado), o dedo não aparece. Ponha o `q` no estado do quadro do toque.
- **Especificidade.** Regras genéricas como `.cm-screen ol` venceram regras de componente mais de uma vez (barra de etapas da clínica). Se um estilo não pega, suba a especificidade com a classe do mock.
- **Flex esticando.** Elementos em linha dentro de `display: flex` esticaram (botão de adicionar do restaurante, avatar do YouTube). Use `:not(...)` na regra do flex ou troque `span` por `i` com `font-style: normal`.
- **Cor do formulário.** `site()` usa a cor do cliente. Formulários da plataforma passam a cor da plataforma no 4º parâmetro (`'#0866ff'`, `'#0a66c2'`).
- **Cabeçalho coberto.** No blog, o cabeçalho do site precisa de `z-index: 2` sobre o conteúdo que rola.
- **Duas chaves iguais em `SCREEN`.** O JavaScript fica com a última. Confira antes de acrescentar.
- **Quadro de aviso duplicado.** Não escreva o quadro final de aviso: o laço de `AVISOS` acrescenta.
- **Testes com texto fixo.**
  - A ordem e os ids dos canais estão em `channelIds`.
  - Os rótulos esperados por canal estão em `labels` (TikTok Patrocinado, LinkedIn Promovido, ChatGPT Anúncio, Maps Patrocinado, blog "Conteúdo patrocinado por Arrimo Patrimônio", SEO com `moradafalesia.exemplo`).
  - O TikTok precisa terminar com `done`.
- **Textos com contagem.** "oito tipos de cliente" e "onze canais" aparecem em `index.html` (cartão da galeria, crédito da seção e serviço de campanhas).
- **Comentário do cabeçalho de `campaign-channels.js`.** Mantenha a contagem atualizada (11 canais, 22 formatos).

## 15. Pendências

1. Conferir nos apps os rótulos e estados citados no plano:
   - barra de ação que acende no Instagram e no TikTok;
   - "Pular" no YouTube e "Desbloquear" no LinkedIn;
   - "Ocultar resultados patrocinados" e "Acessar site" no Maps;
   - "Conversar com a empresa" no catálogo;
   - a citação do anúncio na conversa do WhatsApp;
   - "Anúncio" no ChatGPT.
2. Disponibilidade e rótulo dos anúncios do ChatGPT no Brasil.
3. Busca no INPI para os 8 nomes.
4. Aprovação de uso dos ícones do Google Ads e do Maps, e o glifo do Shorts.
5. Texto oficial da mensagem educativa de trânsito da concessionária.
6. Capturas de Shorts, Facebook vídeo e intervalos, LinkedIn, Google, Maps e WhatsApp para levar esses formatos ao mesmo nível de medida das telas do laboratório.
