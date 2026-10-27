# Seção de canais: guia para entender e alterar

Seções `#mural`, `#laboratorio` ("Sua oferta. Em cada canal."), `#editorial` ("Sites e lojas") e `#sistemas` ("Sistemas e automações") de `index.html`. Atualizado em 27/10/2026, branch `ccr-94475d26-xmd01y`, depois da revisão em nove pacotes (ficha de marcas, motor de quadros, hero, campanhas, busca, automações, painel de Sistemas, acervo licenciado, mural e QA).

Este guia é para quem vai mexer nessas seções, pessoa ou IA, sem ter acompanhado a construção. Ele explica o que cada seção faz, como o código está montado, quais clientes e fluxos existem e como alterar cada parte com segurança. Os nomes de arquivo são relativos à raiz do repositório.

## Sumário

1. [O que a seção é](#1-o-que-a-seção-é)
2. [O que o visitante vê e faz](#2-o-que-o-visitante-vê-e-faz)
3. [Mapa dos arquivos](#3-mapa-dos-arquivos)
4. [Modelo de dados](#4-modelo-de-dados)
5. [Motor de quadros](#5-motor-de-quadros)
6. [Sites dos anunciantes](#6-sites-dos-anunciantes)
7. [Telas das redes](#7-telas-das-redes)
8. [Clientes fictícios e dados da história](#8-clientes-fictícios-e-dados-da-história)
9. [Os 30 formatos](#9-os-30-formatos)
10. [Automações e caminhos de falha](#10-automações-e-caminhos-de-falha)
11. [Regras de conteúdo](#11-regras-de-conteúdo)
12. [Receitas de alteração](#12-receitas-de-alteração)
13. [Verificar e publicar](#13-verificar-e-publicar)
14. [Armadilhas conhecidas](#14-armadilhas-conhecidas)
15. [Pendências](#15-pendências)
16. [Regras próprias das automações](#16-regras-próprias-das-automações)
17. [Mural de jornadas](#17-mural-de-jornadas)

## 1. O que a seção é

O portfólio vende campanhas, conversas e os sistemas por trás delas para pequenos e médios negócios. Estas seções mostram, sem nenhum número de resultado, que o autor conhece o caminho real de cada canal: onde o anúncio aparece, o que prende a atenção, onde a pessoa toca, qual tela nativa fecha a conversão e o que o sistema registra em cada passo.

São 16 canais e 30 formatos, mais 5 caminhos de falha escondidos. Cada formato é a jornada de um anunciante fictício, de um dos 8 tipos de cliente que o portfólio atende, com a mesma cliente (Marina Alves), as mesmas datas e os mesmos números de pedido em todos os fluxos. Tudo roda dentro de um iPhone desenhado em HTML e CSS, como um storyboard finito que toca sozinho e para na tela de conversão.

Nada é enviado a lugar nenhum. Formulários, conversas, carrinhos, Pix e notificações são estados de CSS trocados por uma linha do tempo em JavaScript. Os únicos links reais são os de contato.

## 2. O que o visitante vê e faz

1. **Mural (`#mural`).** Logo depois do hero, uma faixa de 14 telas reais dos fluxos (seção 17). Cada tela leva ao formato no laboratório ou à automação em Sistemas.
2. **Grade de canais (`#laboratorio`).** Os 16 canais aparecem de uma vez em blocos, sem rolagem lateral, mesmo a 320 px. Cada bloco tem o logo oficial (ou, sem logo oficial, um selo na cor do grupo), o nome curto e um contador de formatos. Um marcador desliza até o bloco escolhido, e uma legenda mostra o nome e o benefício do canal.
3. **Frente.** A peça do cliente no quadro nativo do formato (`art.formato`: carrossel 4:5, 9:16 com trilho de ícones, 16:9 com faixa de anúncio, ou cartão de link), com a oferta, o botão e "Exemplo ilustrativo de …, marca fictícia." Ao trocar de canal, a peça antiga sai de lado e a nova entra com mola.
4. **Papel que dobra.** Puxar a ponta, tocar nela ou usar ← e ↓ no botão da ponta dobra a folha e revela o player. "Ver a peça" fecha.
5. **Player.** O iPhone com o formato e, ao lado (a partir de 900 px) ou abaixo, o painel vivo: cliente, rótulo do anúncio, objetivo, a frase, os 3 passos (Atenção, Retenção, Conversão), "Na tela" (a `desc` do quadro), a transcrição da ligação fora do aparelho, "Nos bastidores" (o registro), "Baseado em" e "Quero algo assim". Abaixo do aparelho, no celular, a faixa fixa "Agora" com a linha atual e ← ▶ →. O botão de ampliar abre a tela num diálogo do tamanho da altura disponível.
6. **Reprodução.** Ao abrir o verso, a jornada toca uma vez até a tela final e para; o botão vira Rever. Cada quadro fica o tempo de leitura (seção 5). Um ponto numerado (1, 2 ou 3) marca o elemento do passo atual sem cobrir texto, e um círculo branco (o dedo) pousa no botão dos quadros de toque.
7. **Navegação manual.** ← e → com o foco no aparelho; toque à esquerda ou à direita da tela; deslizar mais de 50 px; clicar num passo. Com o foco num passo, as setas, Home e End trocam de passo.
8. **Link direto.** `#laboratorio/<canal>/<formato>` (por exemplo `#laboratorio/tiktok/infeed`) abre o canal, dobra a folha e escolhe o formato. O evento `cx:abrir` no `window`, com `{canal, formato}`, faz o mesmo sem mudar o endereço.
9. **Sem movimento.** Com movimento reduzido, a pausa global (`body.is-paused`) ou a aba oculta, nada toca sozinho e as transições se desligam. O botão vira Próximo.
10. **Sites e lojas (`#editorial`).** O mesmo motor, cortado por cena, com a lista de telas ao lado e, a partir de 1100 px, "Celular | Computador" para ver o site num navegador de computador.
11. **Sistemas (`#sistemas`).** Seletor das 8 automações, "Caminho feliz | Com falhas", o aparelho e o inspetor com as abas Registro, Arquitetura e Ligação/Bastidor. No celular, um dock preso ao aparelho mostra o ator, a linha atual e ← Reproduzir →. `#sistemas/<chave>` e `#sistemas/<chave>/falha` abrem a automação.

## 3. Mapa dos arquivos

Tudo fica em `public/assets/showcase/`, salvo indicação.

| Arquivo | Papel | Mexa aqui para |
|---|---|---|
| `marcas.js` | Ficha única: `CLIENTES` (nome, curta, arroba, domínio `.exemplo`, cores, tom, assinatura, tema), `MARCAS` (símbolos 64 x 64), `HOJE`, `PESSOA`, `PEDIDOS`, `OFERTAS`, `LEGAL`, `TERCEIROS` e os auxiliares de data. Tudo congelado. | Trocar um nome, uma data, um pedido ou uma oferta em todos os fluxos de uma vez |
| `static-init.js` | Carrega as folhas e monta cada seção quando ela chega a 1200 px da tela, na ordem de `ORDER`; segura o alvo dos links internos; lê `#sistemas/…` e `#laboratorio/…`. | Raramente |
| `static-presentations.js` e `.css` | Grade de canais, marcador, legenda e a peça da frente (`frameMarkup`). | Grade e frente |
| `campaign-flip.js`, `page-peel.css`, `interaction-upgrades.css` | Folha que dobra, gesto de puxar, foco e `inert`. Monta o player no verso. | Comportamento da dobra |
| `frame-engine.js` | Motor único de quadros (seção 5), usado pelo player, por Sites e lojas e por Sistemas. | Regras de cena, ponto, dedo, relógio, tempo de leitura e vídeo |
| `frame-motion.css` | Transições das cenas (push, sheet, switch, modal, fade), banner, toque, digitando, texto em fluxo, pulso da ligação e chegada das mensagens. Instantâneas sem movimento. | Movimento |
| `experience-player.js` e `experience-demos.css` | Player do laboratório: painel vivo, faixa Agora, Ampliar, formatos, teclado, gestos, link direto e `cx:abrir`. `--phone-w` e `.ch-iphone--compacto` ficam em `experience-demos.css`. | Comportamento do player e tamanho do aparelho |
| `campaign-channels.js` | `IMG`, `IMG_META`, `VIDEOS`, `channels`, `AVISOS`, `SCREEN`, os mocks de Meta, TikTok, YouTube e publieditorial, `renderMock()` e a junção com `campaign-search.js` e `automation-flows.js`. | Formatos de redes sociais e dados gerais |
| `campaign-search.js` e `.css` | `makeSearch(ctx)`: LinkedIn, Google Pesquisa e Display, SEO, ChatGPT, Maps, WhatsApp clique para conversar e catálogo. | Busca, local e conversa |
| `automation-flows.js`, `automation-mocks.css` | `makeAutomations(H)`: as 8 automações, os 5 caminhos de falha, os canais Telegram, RCS, Voz, Pix e E-mail. O CSS vem de `scratchpad/au.src.css` por um gerador que também escreve as regras de revelação. | Automações |
| `pix-kit.js`, `uqr.js` | BR Code do Pix (CRC conferido com o exemplo do manual do BCB) e o gerador de QR (MIT, licença no cabeçalho). | QR e copia e cola |
| `campaign-sites.js` e `.css` | Os 8 sites dos anunciantes, os formulários da Meta e do LinkedIn e o `kit` (passos, calendário, ticket, banco, QR). | Fluxo depois do clique |
| `lab-telas.js` e `.css` | Telas de Instagram, TikTok, YouTube, Facebook e do artigo no Safari. | Telas das redes |
| `channel-mocks.css` | Aparelho, cenas e telas próprias (Shorts, Facebook vídeo e intervalos, Maps, WhatsApp, ChatGPT). | Visual dos mocks |
| `channel-logos.js` | Logos oficiais em SVG, cores, regras de uso e `CHANNEL_LOGO`. | Só com arquivo oficial |
| `vitrine-lab.js` e `.css` | Sites e lojas. | Seção `#editorial` |
| `automation-trace.js` e `.css` | Painel de Sistemas (seletor, dock, inspetor, registro, arquitetura, transcrição). | Seção `#sistemas` |
| `public/assets/mural/mural.js` e `.css` | Mural de jornadas (seção 17). | Faixa depois do hero |
| `public/assets/portfolio/mural/` | Quadros do mural (`<canal>-<formato>-f<n>.webp`) e `mural.json`, gerados por `scripts/capture-mural.mjs`. | Rodar o script de novo |
| `public/assets/portfolio/canais/`, `SOURCES.md` e `scripts/assets/acervo.json` | Fotos e vídeos licenciados, com origem, autor, licença e recorte. `pages/creditos.html` (rota `/creditos`) mostra os créditos. | Trocar ou acrescentar foto |
| `public/assets/planes/hero-journey.js` e `hero-journeys.json` | Jornada viva do hero, com nomes e datas de `marcas.js`. | Hero |
| `tests/` | Ver seção 13. | Quando muda canal, rótulo ou comportamento |
| `reports/Fidelidade por rede.md` | Especificação por rede (rótulos, telas, erros comuns), com fontes. Vale mais que a memória de quem desenha. | Antes de mexer numa tela de rede |
| `docs/plans/clientes-canais-20261021.md` | Plano original. É histórico: o código atual vale mais. | Consulta |

A política de segurança (`vercel.json` e `server.mjs`, que precisam continuar iguais) só aceita scripts, estilos, fontes e mídia do próprio domínio. Não use CDN nem imagem externa, nem script inline: copie o arquivo para `public/assets/`.

## 4. Modelo de dados

Os canais e formatos ficam em `campaign-channels.js` (redes sociais e publieditorial), `campaign-search.js` (busca, local e conversa) e `automation-flows.js` (automações). Todos os campos novos são opcionais para quem lê.

### Canal

| Campo | O que é |
|---|---|
| `id` | Chave do canal. Liga o logo em `CHANNEL_LOGO` e aparece nos testes. |
| `name` | Nome no player e na legenda. |
| `group` | `social`, `search`, `local`, `content` ou `retencao`. |
| `benefit` | Frase curta da legenda da grade. |
| `glifo` | Ícone genérico do bloco quando não há logo oficial. |
| `art` | Peça da frente: `cliente`, `img`, `pos`, `titulo`, `alt` e também `formato` (`'4:5'`, `'9:16'`, `'16:9'` ou `'link'`), `oferta` (uma linha), `cta` (botão) e `ui` (HTML curto já escapado, para uma interface desenhada sobre a foto). Um formato com `art` próprio troca a frente quando é escolhido. |
| `placements` | Formatos do canal. |

### Formato (placement)

| Campo | O que é |
|---|---|
| `id` | Chave do formato. Com o canal forma a chave `'tiktok/infeed'` de `AVISOS`, `PEDIDOS` e dos links. |
| `label` | Nome no controle de formatos. |
| `curto` | Rótulo curto, usado abaixo de 420 px e no painel. |
| `mock` | Função de `mocks` que desenha a tela. |
| `cliente` | Chave de `CLIENTES`. |
| `selo` | Rótulo de identificação igual ao da plataforma (seção 11). |
| `frase` | Frase do painel. |
| `objetivo` | O que o anunciante quer da jornada, em uma linha ("Vendas com Pix conferido"). |
| `base` | Documentação pública em que o fluxo se apoia, mostrada em "Baseado em". |
| `passos` | Sempre 3: `P('Atenção', rótulo, [quadros])`, `P('Retenção', …)`, `P('Conversão', …)`. |
| `quadros` | O storyboard (abaixo). |
| `audio` | Opcional: `{src, segmentos: [{quem, texto, startMs, endMs}], duracaoS}` (ou `segments`, `durationMs`). Com `src`, aparece "Ouvir a ligação (N s)" e a reprodução anda com os segmentos. Hoje nenhuma ligação tem áudio (decisão do dono); `google/search` traz os segmentos com `src` vazio. |
| `aviso` | Posto a partir de `AVISOS`. Não escreva à mão. |

### Quadro

```js
{ ms: 900, cena: 'page', estado: 'w2 q1', toque: 'b', hora: '10:11',
  desc: 'Toque em Continuar.',
  fala: [['Assistente virtual (IA)', 'Oi, Marina! …']],
  log: [['WhatsApp', 'Mensagem recebida', 'origem: anúncio', { t: '10:10:31', tipo: 'webhook', campos: { telefone: '(11) 9 8•••-••21' } }]] }
```

| Campo | O que é |
|---|---|
| `ms` | Duração mínima do quadro. O motor estende pelo tempo de leitura (seção 5). |
| `cena` | Qual `.cm-scene` fica na tela. |
| `estado` | Tokens separados por espaço que o CSS desenha. |
| `toque` | Chave do `[data-tap]` que o dedo toca neste quadro. |
| `video` | `1` quando o quadro conta para a barra de progresso do vídeo. |
| `hora` | `'HH:MM'` da barra de status a partir deste quadro. O relógio nunca volta. |
| `desc` | O que a tela mostra, em uma frase de até 140 caracteres, no presente, sem jargão. É texto visível ("Na tela" e a faixa Agora) e o que o leitor de tela ouve. |
| `fala` | Linhas da ligação deste quadro, `[[quem, texto]]`. Aparecem fora do aparelho, nunca dentro do app. |
| `log` | Linhas do registro: `[ator, evento, detalhe, {t, tipo, campos?, dia?, bastidor?}]`. `t` é `'HH:MM:SS'`; `tipo` é um de `anuncio, webhook, ia, ferramenta, pessoa, pagamento, crm, sinal, permissao, turno, agenda, retentativa, assinatura, grupo, email, descadastro, sistema`; `campos` são pares já mascarados; `dia` (`'AAAA-MM-DD'`) só em linhas de outro dia; `bastidor` (`{titulo, texto}`) é o que a equipe recebe, mostrado no painel e nunca no chat da cliente. A ordem (dia, hora) nunca volta. |

Regras do storyboard:

- Cada índice de quadro pertence a exatamente um passo, e os passos cobrem os quadros em ordem.
- Cada passo tem pelo menos um quadro em que o ponto aparece.
- O quadro de toque vem depois do quadro em que o botão aparece. O toque mostra o dedo; a mudança de tela vem no quadro seguinte. Um site que abre ganha um quadro de leitura antes do primeiro toque.
- O último quadro deixa a confirmação à vista, com `done` quando o mock tem uma. Para os formatos de `AVISOS`, um quadro final com `aviso` é acrescentado sozinho.

### Outros dados

- `IMG`: chave, `src`, `w`, `h` de cada foto licenciada. `IMG_META`: `{src, credito, ia: false}` por chave (e `'video:<chave>'`); o crédito de CC BY e CC BY-SA aparece na nota do player. `VIDEOS`: `{webm, mp4, poster, w, h, s, credito}`.
- `H` (contexto exportado para os outros módulos): `I`, `pic`, `marca`, `esc`, `scene`, `screen`, `logoSvg`, `LAB`, `SITES`, `kit`, os dados de `marcas.js`, `horaFala`, `P`, `passos3`, `browserBar`, `safari`, `btn`, `input`, `done`, `tabbar`, `art`, `skel`, `planta`, `avatar`, `video`, `kb`, `shot` e `L`.
- `pic(key, {alt, cls, pos})` gera o `<img>` com `loading="lazy" decoding="async" fetchpriority="low"`.
- `SCREEN`: tema e fundo do aparelho por mock, enquanto carrega.
- `renderMock(placement)`: chama o mock, injeta o banner do aviso e embrulha no iPhone.

## 5. Motor de quadros

`frame-engine.js` é o único motor. O player do laboratório, Sites e lojas e Sistemas chamam as mesmas funções:

- `applyFrame(screen, list, index, {instant, playing})` põe `data-frame`, `data-scene` e `data-state` (os tokens do quadro mais o último estado de cada cena que saiu), marca as cenas com `data-pos` (`on`, `under` ou `off`; `under` para push, sheet, switch e modal), limpa o toque anterior, escreve o relógio e `--quadro-ms`, toca só o vídeo da cena na tela e começa o texto em fluxo (`[data-stream]`).
- `settle(screen, item)` espera as animações finitas da cena terminarem (até 1200 ms; 20 ms sem movimento).
- `tempoMinimo(screen, list, index)` decide quanto o quadro fica: o maior entre `item.ms` e 1400 ms, mais 820 ms quando a cena muda e 260 ms por palavra nova visível, até 9000 ms.
- `positionDot(stage, screen, item, n)` põe o ponto do passo `n` ao lado do primeiro `[data-hs~="n"]` visível e descoberto, no primeiro lugar que não cruza texto, não cruza o dedo e fica dentro da tela. `data-hs-at` (`after`, `out-left`, `tl`, `tr`) escolhe o lugar preferido. Um anel de 2 px contorna o alvo. Ponto e anel somem nos quadros de toque e com `done` ou `aviso`. `.sb-alvo[data-ate=token]` deixa de ser alvo quando o token entra.
- `showTap` e `hideTap` põem o dedo no último `[data-tap]` visível e o estado pressionado.
- `syncMedia(screen, playing)`: vídeos mudos, em linha, com pôster e `preload="none"`, tocam só na cena ativa e com movimento.
- `live()`: há movimento (sem movimento reduzido, sem `body.is-paused`, aba visível).

Tipos de cena (`scene(id, kind, tema, html, cls, gestos)`): `base` (fundo), `push` (entra pela direita), `sheet` (sobe de baixo), `switch` (troca de app), `modal` e `fade`. `cm-scene--part` é uma folha parcial; `cm-scene--web`, uma página no Safari.

Tamanho do aparelho: `--phone-w` vem da altura e da largura da tela (`experience-demos.css`). A partir de 900 px, até 420 px; abaixo, até 380 px; até 480 px de largura, `100vw - 16px` com o aro fino (`.ch-iphone--compacto`); no celular deitado, `(100svh - 16px) x 0,46`. Abaixo de 300 px de tela, o conteúdo do app aumenta 1,3 vez. Escreva tudo dentro do aparelho em `calc(var(--u)*N)` (`--u` é 1/412 da tela), nunca em px.

Os tokens não são globais: cada mock define os seus. Antes de usar um token, procure `data-state~="token"` no CSS do mock. Nas telas de busca, `[data-in=token]` aparece enquanto o estado tem o token e `[data-out=token]` some a partir dele. Nas automações (classe `au` na tela), as mesmas regras vêm geradas no fim de `automation-mocks.css`.

## 6. Sites dos anunciantes

`campaign-sites.js` exporta `makeSites({I, pic, marca, esc, avatar, planta})`, com uma função por site e o `kit` de peças: `step`, `site`, `body`, `foot`, `cta`, `pk`, `label`, `field`, `tick`, `show`, `ok`, `actions`, `back`, `days`, `slots`, `ticket`, `calendar`, `mapa`, `trilha`, `lista`, `legal`, `horario`, `banco`, `qr`, `BR_CODE`, `PRECO`, `horaFala`.

O motor de passos fica no fim de `campaign-sites.css` ("Step engine (generated)"): `wN` mostra o passo N (até `w8`), `qN` acende `[data-pick~="qN"]` e revela `[data-show~="qN"]` (até `q8`), e as teclas `a` a `k` ganham o estado pressionado. Para ir além, copie a última regra de cada grupo.

Cada site usa o tema da marca (`CLIENTES[k].tema`: fonte, estilo, peso, raio e onde vai o acento) e a assinatura na peça e no anúncio. Os quadros e o site precisam combinar: o `q` de uma escolha fica no estado de todos os quadros seguintes do mesmo passo.

| Site | Cliente | Caminho |
|---|---|---|
| `tacho` | Restaurante | Cardápio de sábado, reserva (dia, pessoas, horário), dados e ocasião; ou retirada com sacola e Pix na retirada |
| `sotaque` | Escola | Teste de nível em 3 perguntas, nível B1, horário, dados, aula marcada |
| `seixo` | Clínica | Serviço, calendário e horário, dados, avaliação agendada com mapa |
| `falesia` | Incorporadora | Galeria do decorado, tipo de visita e horário, contato, visita agendada |
| `teclaria` | Loja | Produto, carrinho, entrega, Pix com QR e copia e cola, banco com Face ID, pedido pago com rastreio; ou lista de espera |
| `bandeirola` | Agência | Montador de roteiro (noites, quem vai, o que ver) ou saída com pré-reserva |
| `arrimo` | Gestora | Calendário e horário, dados e assunto, conversa agendada |
| `ondara` | Concessionária | Versão, loja e dia, dados com carteira de motorista, test drive agendado |
| `metaForm`, `linkedinForm` | Plataformas | Formulário instantâneo da Meta e Lead Gen do LinkedIn, com dados do perfil, uma pergunta e revisão |

## 7. Telas das redes

`lab-telas.js` exporta `makeLabScreens({marca, esc, CLIENTES, pic})` com `feedAd`, `storyAd`, `liveAd`, `reelsAd`, `explore`, `postAberto`, `direct`, `tiktokAd`, `youtubeAd`, `youtubeLive`, `facebookAd`, `facebookReel`, `facebookWatch`, `fbStrip`, `blogArticle` e `avatar`. As telas seguem as medidas dos apps em modo escuro (classes `ig-`, `igs-`, `igr-`, `tt-`, `yt-`, `fb-`, `blog-`) e a especificação de `reports/Fidelidade por rede.md`:

- Instagram e Facebook: "Anúncio" no lugar do antigo "Patrocinado", CTA oficial e nenhuma contagem de curtidas.
- O anúncio no meio do vídeo do Facebook não tem "Pular".
- YouTube: posição do anúncio e "Pular" depois de 5 s; App Store com Obter e depois Abrir.

Sem tela própria nas redes, Shorts, Facebook vídeo e intervalos, Maps, WhatsApp e ChatGPT usam telas de `channel-mocks.css` e `campaign-search.css`.

## 8. Clientes fictícios e dados da história

Os 8 tipos vêm dos serviços que o portfólio mostra. Os nomes ficam só em `marcas.js`: nenhum outro arquivo escreve um nome de marca, e o teste `tests/sections.test.mjs` confere isso no mural.

| Chave | Marca (curta) | Arroba e domínio | Cor | Assinatura | Aviso do setor (`LEGAL`) |
|---|---|---|---|---|---|
| `restaurante` | Casa Amaro | casaamaro, casaamaro.exemplo | `#a4462a` | Feijoada no tacho, todo sábado. | Nenhum |
| `clinica` | Vilela Odontologia (Vilela) | vilelaodontologia, vilela.exemplo | `#2f6f73` | Avaliação sem pressa, plano por escrito. | Responsável técnica e CRO, registro fictício |
| `incorporadora` | Atlântica Incorporadora (Atlântica) | atlanticaincorporadora, atlantica.exemplo | `#1f4e5f` | Casas na falésia, sala voltada para o mar. | Imagens ilustrativas, CRECI e registro de incorporação, dados fictícios |
| `varejo` | Ponto Tech | pontotech, pontotech.exemplo | `#5b3df5` | O notebook certo para quem cria. | Nenhum |
| `turismo` | Destino Certo Viagens (Destino Certo) | destinocerto, destinocerto.exemplo | `#d9822b` | Festas do interior, em grupo pequeno. | Nenhum |
| `educacao` | Speak Up Idiomas (Speak Up) | speakupidiomas, speakup.exemplo | `#e5533d` | Conversação para quem trava na hora de falar. | Nenhum |
| `financas` | Valore Patrimônio (Valore) | valorepatrimonio, valore.exemplo | `#0f1a2c` | Patrimônio da família, com plano de sucessão. | "Investimentos envolvem riscos." |
| `automotivo` | EcoDrive Elétricos (EcoDrive) | ecodrive, ecodrive.exemplo | `#0f6b5c` | Test drive com a recarga explicada. | `null` até conferir o texto do CONTRAN |

**Como os nomes foram escolhidos.** O dono escolheu os 8 nomes em 27/10/2026 para soar como negócios brasileiros e decidiu que não haveria pesquisa de nome nem de arroba (nem registro.br, nem INPI, nem busca na web). A auditoria do mesmo dia achou domínios `.com.br` ativos com cinco desses nomes (speakupidiomas, vilelaodontologia, pontotech, destinocerto e ecodrive); o dono manteve os nomes. Por isso cada exemplo diz "marca fictícia" fora do aparelho, todo domínio termina em `.exemplo` e uma troca futura muda só `marcas.js` (e pede rodar `scripts/capture-mural.mjs` de novo, porque os quadros do mural mostram os nomes).

**Terceiros** (`TERCEIROS`), todos inventados sem pesquisa: Banco Pitanga, Jatobá Pagamentos, a revista Caderno Empresa & Família, o portal Estrada Afora, os criadores Mesa de Edição, Panela de Domingo e Ju Tavares, a empresa Alves & Rocha Contabilidade, comentaristas só com nome de exibição e ruas com nomes de árvores.

**A história de todos os fluxos:**

- **Pessoa:** Marina Alves, sócia, Pinheiros, São Paulo; telefone, e-mail e CPF sempre mascarados (`PESSOA`).
- **Hoje:** quarta-feira, 21/10/2026, 10:09 (`HOJE`). O relógio de cada fluxo anda a partir daí e nunca volta.
- **Pedidos:** 10482 (TikTok), 10517 (RCS), 0427 (live do restaurante), 0428 (catálogo).
- **Agenda:** reserva no sábado, 24/10, às 13h; test drive no sábado, 24/10, às 10h; visita ao decorado no sábado, 24/10, às 11h30; conversa com a gestora na terça, 27/10, às 10h; avaliação na quinta, 29/10, às 9h (alternativa sexta, 30/10, às 14h); aula experimental na quinta, 29/10, às 19h; encomenda para sábado, 31/10, ao meio-dia.
- **Viagem:** Festa do Divino em Pirenópolis, maio de 2027, cavalhadas de 16 a 18/05; saídas de 14 a 18 e de 15 a 18 de maio; família de 4 (filhos de 8 e 2 anos). Criança de 2 anos completos ocupa assento; no colo, só até 1 ano e 11 meses.
- **Pix Automático:** cobranças em 5/11, 5/12 e 5/1; a de 5/12 falha, o aviso chega na sexta, 4/12, com "Cancelar este pagamento (até 23h59 de hoje)", e a cobrança volta em 5/1/2027.

## 9. Os 30 formatos

| Canal e formato | Cliente | Selo | Jornada |
|---|---|---|---|
| Instagram, Feed | Speak Up | Anúncio | Carrossel, teste de nível em 3 perguntas, aula marcada; convite por e-mail |
| Instagram, Reels | Casa Amaro | Anúncio | Vídeo do fogo e do prato, menu, mesa reservada; confirmação no WhatsApp |
| Instagram, Story | Vilela | Anúncio | Enquete, resposta ao story, Direct com a assistente virtual, avaliação marcada |
| Instagram, Live | Casa Amaro | Anúncio | Live, comentário, menu no Direct, pedido 0427 para retirada |
| Instagram, Explorar | Vilela | Anúncio | Bloco no Explorar, Reels, site, avaliação agendada |
| Instagram, Comentário e Direct | Ponto Tech | Anúncio | Automação (seção 10) |
| Facebook, Feed | Atlântica | Anúncio | Carrossel, formulário instantâneo, visita ao decorado |
| Facebook, Post | Casa Amaro | Anúncio | Evento, interesse, reserva |
| Facebook, Vídeo | Casa Amaro | Anúncio | Reels do Facebook, reserva, evento na agenda do iPhone |
| Facebook, Ad breaks | EcoDrive | Anúncio | Intervalo no vídeo, sem Pular, formulário, test drive |
| TikTok, In-Feed | Ponto Tech | Patrocinado | Vídeo, produto, carrinho, revisão, Pix com QR, banco com Face ID, pedido 10482 pago |
| YouTube, Anúncio no vídeo | EcoDrive | Patrocinado | Anúncio antes do vídeo, Pular aos 5 s, página do test drive, agendado |
| YouTube, Shorts | Speak Up | Patrocinado | Exercício, App Store, Obter, app aberto |
| YouTube, Live | Ponto Tech com um criador | Inclui promoção paga | #publi, chat, link fixado, lista de espera |
| LinkedIn, Documento | Valore | Promovido | Guia em páginas, Desbloquear, Lead Gen com uma pergunta, guia liberado no feed |
| Google, Pesquisa | Vilela | Resultado patrocinado | Busca, anúncio com Ligar e locais no mapa, folha do iPhone, ligação com tempo correndo, ilha dinâmica, confirmação no WhatsApp |
| Google, Display | Destino Certo | Anúncio | Matéria do portal, anúncio que troca o título, saídas de maio, pré-reserva com sinal por Pix ou só reserva |
| SEO, Orgânico | Atlântica | Orgânico, sem anúncio | Resultado orgânico, "Pessoas também perguntam", plantas de 3 e 4 quartos, e-mail com consentimento |
| ChatGPT, Resposta | Destino Certo | Patrocinado | Conversa em dois turnos, resposta com fontes, cartão patrocinado depois da linha cinza, montador de roteiro, WhatsApp com o roteiro anexado |
| Google Maps, Local | Casa Amaro | Patrocinado | Busca "almoço perto de mim", alfinete quadrado, ficha, Rotas (14 min, 4,2 km), navegação até a porta |
| WhatsApp, Clique para conversar | Vilela | Anúncio | Cartão da empresa, assistente virtual, lista, botões de resposta, avaliação marcada |
| WhatsApp, Catálogo | Casa Amaro | Catálogo, não é anúncio | Vitrine, carrinho, resumo do pedido 0428, Pix na retirada, recebido |
| WhatsApp, Agente e Pix | Destino Certo | Anúncio | Automação (seção 10) |
| WhatsApp, Chamada | EcoDrive | Conversa, não é anúncio | Automação |
| Telegram, Grupo | Speak Up | Grupo, não é anúncio | Automação |
| RCS, Conversa | Ponto Tech | Patrocinado | Automação |
| Voz com IA, Ligação | Vilela | Ligação pedida, não é anúncio | Automação |
| Pix Automático, Recorrência | Speak Up | Cobrança recorrente, não é anúncio | Automação |
| E-mail, Régua | Valore | E-mail com inscrição, não é anúncio | Automação |
| Publieditorial, Artigo | Valore | Publicidade | Artigo identificado antes do título, "Oferecido por", conversa agendada |

Os formatos sem aviso já terminam numa conversa, numa ligação, numa rota ou num app aberto, que é a confirmação nativa.

## 10. Automações e caminhos de falha

Base: a pesquisa de 27/10/2026 (`reports/Automações complexas por canal.md`). Os fluxos vão além da resposta pronta: agente de IA que se identifica, passagem para uma pessoa com o histórico, pagamento conferido no PSP e conversão devolvida ao anúncio. Todos aparecem no laboratório e em Sistemas.

| Automação (`#sistemas/<chave>`) | Cliente | O que mostra |
|---|---|---|
| `agente`: WhatsApp, Agente e Pix | Destino Certo | Anúncio de clique para o WhatsApp, assistente virtual que se apresenta, formulário (Flow) com as saídas de maio, dúvida de tarifa que chama a consultora Júlia, pré-reserva, lista de bancos, revisão, Banco Pitanga com Face ID, comprovante, confirmação e roteiro por e-mail |
| `chamada`: Chamada no WhatsApp | EcoDrive | Pedido de permissão (7 dias), chamada atendida pela IA que avisa a gravação, cronômetro por turno, onda pela voz, transferência para o consultor Rafael com o resumo, registro da chamada na conversa |
| `instagram`: Comentário e Direct | Ponto Tech | Reel com palavra-chave, resposta privada no Direct, lista de espera do branco e aviso de chegada |
| `pix`: Pix Automático | Speak Up | Jornada 3 do BCB: QR composto e copia e cola, pedido de autorização (CNPJ, valor máximo, novas tentativas), Face ID, comprovante, telas bloqueadas da véspera, do pagamento, do aviso com cancelar e da falha, pausa de um mês |
| `rcs`: RCS | Ponto Tech | Busca com Conversar, Mensagens do iPhone com remetente verificado, cartões, pedido 10517, página do PSP no Safari, banco, notificação e pedido pago |
| `email`: Régua de e-mail | Valore | Três e-mails com o logo da marca, faixa de cancelar inscrição, agenda com três horários e saída da régua quando ela agenda |
| `telegram`: Telegram | Speak Up | Grupo da comunidade, mensagem que só ela vê, resposta editada, mini app da aula de quinta, compra em Estrelas, assinatura e entrada no grupo da turma |
| `voz`: Ligação com IA | Vilela | Pedido de ligação com aceite, chamada da IA que se identifica, agenda consultada com a ligação na ilha dinâmica, confirmação no WhatsApp |

Caminhos de falha (`#sistemas/<chave>/falha` e `placementByKey('<canal>/<formato>-falha')`):

| Caminho | O que acontece |
|---|---|
| `whatsapp/agente-falha` | Marina fecha a revisão sem pagar; o código expira em 30 minutos; a assistente manda um novo para a mesma pré-reserva, e o CPF não é pedido de novo |
| `voz/ligacao-falha` | Ela não atende; a clínica escreve no WhatsApp e combina ligar às 14h, dentro do horário |
| `rcs/conversa-falha` | O aparelho deixa de aceitar RCS comercial; a confirmação chega por SMS, só com texto e o link do pedido |
| `pix/recorrencia-falha` | Ela cancela só o pagamento de 05/12 na véspera; a autorização continua e a escola oferece pausar dezembro |
| `email/regua-falha` | Ela cancela a inscrição em um clique, e nenhum outro e-mail da régua sai |

## 11. Regras de conteúdo

1. **Marcas fictícias.** Todo anunciante é fictício e é identificado fora do aparelho ("Exemplo ilustrativo, marca fictícia."). Nenhuma empresa, pessoa ou celebridade real. Domínios terminam em `.exemplo`; comentaristas têm nome de exibição, sem arroba.
2. **Sem números inventados.** Nada de métrica, resultado, alcance, avaliação, depoimento ou preço. Valores sempre como `R$ ••••`. O registro e os contadores de Sistemas são dados de demonstração rotulados como simulados.
3. **Identificação de publicidade**, como a plataforma faz em pt-BR:
   - Instagram e Facebook: "Anúncio";
   - TikTok, YouTube, Maps e ChatGPT: "Patrocinado";
   - LinkedIn: "Promovido";
   - Google Pesquisa: "Resultado patrocinado";
   - Display: "Anúncio";
   - live de criador: "Inclui promoção paga" e #publi;
   - publieditorial: "Publicidade" antes do título e "Oferecido por".

   Resultado orgânico, catálogo, grupo, ligação pedida, cobrança e e-mail com inscrição nunca levam rótulo de anúncio.
4. **Logos de plataforma.** Só os arquivos oficiais de `channel-logos.js`, sem mudar forma nem cor, e só onde a própria interface mostra a marca. RCS, Voz, Pix Automático, E-mail e Publieditorial usam um glifo genérico.
5. **Fotos e vídeos.**
   - Só acervo licenciado: StockSnap CC0 pela API do Openverse e Wikimedia Commons (CC BY e CC BY-SA). Nenhuma imagem gerada por IA, nenhuma do Unsplash, e Pexels só se abrir sem verificação contra robôs.
   - Nenhuma pessoa identificável, logotipo, placa, texto legível ou preço.
   - Cada arquivo tem fonte, autor, licença e recorte em `scripts/assets/acervo.json`, e aparece em `SOURCES.md` e em `/creditos`. Créditos de CC BY e CC BY-SA aparecem na nota do player (`IMG_META.credito`).
   - Vídeos mudos, em linha, em laço, com pôster `.webp` e `preload="none"`, tocando só na cena ativa.
6. **Avisos de setor** a partir de `LEGAL`, sem número de verdade.
7. **Texto.** pt-BR, concreto, no presente, voz ativa, sem espaço reservado ("Exemplo", "aqui", "0000-0000") e sem jargão interno no que aparece. Datas e horários no formato do app ("qui, 29 out", "19:00"), sempre calculados por `dataCurta`, `dataLonga` e `diaSemana`.
8. **IA sempre se identifica** como assistente virtual e oferece uma pessoa (seção 16).

## 12. Receitas de alteração

### 12.1 Mudar texto, tempo ou ordem de um quadro

Edite o quadro no arquivo do formato (`campaign-channels.js`, `campaign-search.js` ou `automation-flows.js`). Se o texto aparece dentro do aparelho, mude também o HTML do mock ou do site, e mantenha a `desc` igual ao que a tela mostra.

### 12.2 Acrescentar um toque num fluxo

1. No site, dê ao elemento uma escolha e uma tecla livres: `pk('4', { q: 'q3', tap: 'g' })`.
2. Nos quadros, insira `{ ms: 900, cena: 'page', estado: 'w2 q3', toque: 'g', desc: 'Toque em 4 pessoas.' }` e mantenha `q3` nos quadros seguintes do passo.
3. Ajuste os índices de `passos`.
4. Se o `q` ou a tecla passarem de `q8` ou `k`, estenda o motor de passos (seção 6).

### 12.3 Trocar o cliente de um formato

1. `placement.cliente`, `frase`, `objetivo`.
2. No mock, o `key` passado às telas, as fotos, os textos e o site aberto depois do clique.
3. `AVISOS['canal/formato']`.
4. Se for o primeiro formato do canal, `channel.art`.

Nunca escreva o nome da marca: use `CLIENTES[k].marca` ou `.curta`.

### 12.4 Acrescentar um formato a um canal

Copie um formato parecido no arquivo do canal, com `id`, `label`, `curto`, `mock`, `cliente`, `selo`, `frase`, `objetivo`, `base`, os 3 `passos` e os `quadros` (com `hora` e `log` onde fizer sentido). Acrescente o mock, a entrada em `SCREEN` e, se houver confirmação por notificação, a de `AVISOS`. Depois:

- confira se o controle de formatos cabe a 320 px;
- rode `tests/browser-campaign-flows.mjs` (ou o teste do arquivo) e a matriz em 390x844 e 1440x900.

### 12.5 Acrescentar um canal

1. O objeto do canal, com `group` existente e `art` com `formato`, `oferta` e `cta`.
2. Logo: só com arquivo oficial, em `LOGOS` e `CHANNEL_LOGO` de `channel-logos.js`, com a data da consulta e a regra de uso. Sem logo, `glifo`.
3. Nome curto do bloco em `static-presentations.js`.
4. Mock, quadros, `SCREEN` e, se fizer sentido, `AVISOS`.
5. Atualize `channelIds` em `tests/browser-static-presentations.mjs`, a lista de `CANAIS` em `public/assets/mural/mural.js` e as contagens de `index.html` ("16 canais").

### 12.6 Acrescentar um nicho (cliente)

1. **`marcas.js`:** `CLIENTES.<chave>` com todos os campos, `MARCAS.<chave>` (símbolo 64 x 64, branco e `cor2`, sem copiar logo existente), as ofertas e, se houver, o `LEGAL`.
2. **Site** em `makeSites`, com os passos reais do negócio, e o tema em `campaign-sites.css`.
3. **Fotos** licenciadas (seção 11) em `public/assets/portfolio/canais/`, WebP sem metadados, registradas em `acervo.json`; depois rode `scripts/assets/sources-table.py` e `scripts/assets/creditos-page.py`.
4. **Textos de `index.html`** que listam os tipos.

### 12.7 Mudar um site

- Um passo é uma string no array de `site(...)`. Depois de 8 passos, estenda o motor.
- Use as peças do `kit` para manter o visual.
- O leiaute do tema fica em `.cm-site--<cls>`.

### 12.8 Pôr áudio numa ligação

1. Copie o arquivo (MP3 ou M4A, mesma origem) para `public/assets/`.
2. Em `automation-flows.js`, preencha `AUDIO['voz/ligacao']` ou `AUDIO['whatsapp/chamada']`; em `campaign-search.js`, o `src` de `google/search`.
3. Confira os `startMs` e `endMs` de cada segmento contra o arquivo. O player e Sistemas mostram "Ouvir a ligação (N s)" e andam pelos segmentos. O áudio nunca toca sozinho.

## 13. Verificar e publicar

```bash
npm run -s check         # estrutura, hero, seções, nada do material antigo em public/
npm test                 # todos os tests/*.test.mjs (marcas, fidelidade, páginas, narrativa…)
npm run build            # o mesmo que o Railway roda: badges + scripts/install-sections.mjs
PORT=4199 npm run test:browser   # cada suíte de navegador, uma por vez, contra um só server.mjs
```

Os testes de navegador sobem o `server.mjs` sozinhos na `PORT`, ou usam `BASE_URL`. Playwright fica em `/opt/node-tools` (`QA_PACKAGE=/opt/node-tools/package.json`). Os resultados vão para `qa/<suíte>/results.json` (pasta fora do Git).

| Suíte | O que confere |
|---|---|
| `browser-campaign-flows.mjs` | Os 14 formatos de Meta, TikTok, YouTube e publieditorial, quadro a quadro |
| `browser-search-flows.mjs` | Os 8 formatos de busca, local e conversa |
| `browser-automation-flows.mjs` | As 8 automações e os 5 caminhos de falha, com registro, falas e movimento das ligações |
| `browser-automation-trace.mjs` | O painel de Sistemas em quatro telas |
| `browser-player-engine.mjs` | O motor de quadros e o aparelho responsivo |
| `browser-static-presentations.mjs` | Grade, frente, dobra e rótulos dos canais |
| `browser-sections.mjs` | O mural (cartões, links, setas, pausa, rolagem lenta) e o básico da página |
| `browser-section-visibility.mjs` | Cada seção sob demanda monta e aparece com conteúdo |
| `browser-hero-*.mjs`, `browser-readable-hero.mjs`, `browser-positioning.mjs` | Hero, jornada viva e posições |
| `browser-pages.mjs` | Páginas paralelas (`/criadores`, `/vagas`, `/privacidade`…) |
| `browser-responsive-matrix.mjs` | 13 viewports (320x568 a 1920x1080 e 844x390) e as páginas paralelas: rolagem lateral, console, 4xx, texto cortado, toques de 44 px, ponto sobre texto em todos os quadros, tamanho do aparelho e o orçamento da primeira tela a 390 (até 600 KB, sem vídeo nem áudio) |

`MATRIX_ONLY=390x844,1440x900` limita a matriz; `MATRIX_WALK=0` pula o percurso dos quadros (a matriz completa leva uns 10 minutos com 4 viewports em paralelo).

Para conferir um quadro por imagem, use o link direto e as setas, como o visitante:

```js
// node quadro.cjs <canal> <formato> <quadro> <saida.png>
const { chromium } = require('playwright');
(async () => {
  const [canal, formato, n, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await p.goto('http://localhost:4199/', { waitUntil: 'load' });
  await p.evaluate(() => document.querySelector('#laboratorio').scrollIntoView());
  await p.waitForSelector('#laboratorio .cx-player', { state: 'attached' });
  await p.evaluate(d => window.dispatchEvent(new CustomEvent('cx:abrir', { detail: d })), { canal, formato });
  await p.waitForTimeout(800);
  for (let i = 0; i < +n; i++) await p.evaluate(() => { const s = document.querySelector('#laboratorio [data-cx-stage]'); s.focus(); s.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); });
  await p.waitForTimeout(700);
  await p.locator('#laboratorio [data-cx-stage] .ch-iphone-tela').screenshot({ path: out });
  await b.close();
})();
```

`scripts/capture-mural.mjs` usa a mesma receita para os quadros do mural.

Publicação:

- O Railway roda `npm run build` (falha se um teste de `install-sections.mjs` falhar) e `npm start`.
- O Vercel roda `node scripts/build-vercel.mjs` e publica `dist/`. As duas políticas de segurança (`server.mjs` e `vercel.json`) precisam continuar iguais.
- A pasta `docs/` não vai para o site: uma mudança só de documentação não precisa de deploy.

## 14. Armadilhas conhecidas

- **Tokens herdados.** O estado de uma cena que saiu continua em `data-state`. Escope cada regra pelo componente.
- **O dedo ou o ponto somem.** O motor só mira elementos visíveis e descobertos. Se o botão está num bloco com opacidade 0 (um `show` cujo `q` não está no estado) ou sob uma folha, nada aparece. Ponha o `q` no estado do quadro.
- **Especificidade.** Regras genéricas como `.cm-screen ol` já venceram regras de componente. Suba a especificidade com a classe do mock.
- **Texto em caixa alta.** `innerText` devolve o texto com `text-transform` aplicado; nos testes, compare sem diferenciar maiúsculas.
- **Cabeçalho que some.** O cabeçalho do site se esconde ao rolar para baixo. Testes que apertam a pausa global usam o botão pelo DOM.
- **Seções sob demanda.** Cada seção abaixo do hero só monta perto da tela. Testes precisam rolar até ela ou usar o link direto antes de esperar o player. O `#mural` reserva 600 px antes de montar (em `planes/hero.css`); sem isso, o laboratório carregaria na primeira tela do celular.
- **Duas chaves iguais em `SCREEN`.** O JavaScript fica com a última.
- **Quadro de aviso duplicado.** Não escreva o quadro final de aviso: o laço de `AVISOS` acrescenta.
- **Peça estreita.** Abaixo de 260 px de largura (celular deitado), a frente usa `@container` em `static-presentations.css`: tipos menores, foto 3:5 e sem contador, seta e trilho de ícones. Interfaces desenhadas sobre a foto (`art.ui`) encolhem 22%.
- **Mural e nomes.** Os quadros do mural são imagens: depois de mudar um nome, uma data ou um desses fluxos, rode `npm run mural`.

## 15. Pendências

1. **Áudio das ligações.** Nenhuma ligação tem áudio (decisão do dono: o plano gratuito do serviço de voz foi recusado). O contrato `placement.audio` está pronto (receita 12.8).
2. **Vídeos que faltam.** Reels do restaurante (feijoada) em 9:16, recarga do carro, Shorts da escola e Story da clínica seguem com foto parada e movimento de câmera: o Commons não tinha clipe sem logo ou marca d'água.
3. **Mensagem educativa de trânsito** (CTB, art. 77-B) da concessionária: `LEGAL.automotivo` fica `null` até o texto oficial ser conferido.
4. **Avisos de setor** da clínica e da incorporadora usam registros fictícios marcados como tal.
5. **Nomes das marcas.** Cinco coincidem com domínios `.com.br` ativos (seção 8). O dono manteve; a troca, se vier, é em `marcas.js` e no mural.
6. **Sala com vista do mar** (incorporadora) usa recortes de uma foto do projeto smiile, sem foto licenciada equivalente.
7. **Logos sem regra confirmada:** Pix e o logotipo escrito do Instagram não entraram; o Instagram mostra só os ícones.
8. **Conferências nos apps:** rótulo exato de "Abrir no navegador externo" no Instagram, a unidade de anúncio da live, o Stars sem número (os valores ficam mascarados pela regra do projeto) e a disponibilidade de anúncios do ChatGPT no Brasil.
9. **Módulos antigos** ainda publicados sem uso na página (`editorial-story.js`, `independent-device-content.js`, `editorial-swipe.js`, `scroll-film.js`, `social-ads.js`, `recovery-init.js` e folhas antigas) e o código dos crachás do hero (`src/badges/`, ainda empacotado pelo build). Podem sair numa limpeza própria.

## 16. Regras próprias das automações

- A IA sempre diz que é assistente virtual (ou inteligência artificial), avisa quando a ligação é gravada e oferece uma pessoa.
- Valores aparecem mascarados (`R$ ••••`); nenhum preço, métrica ou resultado.
- O que acontece fora da tela da cliente (o resumo que a consultora recebe, a chamada de ferramenta) aparece no painel como bastidor (`log[3].bastidor`), nunca como interface do app.
- Ligações: a tela nativa do app, cronômetro vivo por turno, onda guiada por quem fala, a ilha dinâmica quando ela sai do app e a transcrição sempre fora do aparelho.
- RCS no iPhone é o app Mensagens: remetente verificado no centro, balões verdes de RCS e "Mensagem de Texto • RCS" no campo.
- O banco é fictício (Banco Pitanga, sem cores ou marcas de banco real) e o PSP também (Jatobá Pagamentos).
- Cada formato tem `base` (a documentação em que se apoia), mostrada em "Baseado em".

## 17. Mural de jornadas

Faixa logo depois do hero, no `#mural` de `index.html`. `static-init.js` importa `/assets/mural/mural.js` e `mural.css` quando a seção chega perto da tela.

- **Dados:** `public/assets/portfolio/mural/mural.json`, uma lista de `{src, w, h, cliente, canal, formato, quadro, rotulo, etapa, href}`. O JSON não traz nomes de marca: a legenda é `CLIENTES[cliente].marca · rotulo · etapa`, lida de `marcas.js`.
- **Quadros:** `scripts/capture-mural.mjs` (`npm run mural`) abre cada formato com `cx:abrir`, anda até o quadro com →, esconde ponto, dedo, faixa Agora e cabeçalho, fotografa só `.ch-iphone-tela` a 390x844 com DPR 2 e grava WebP de até 40 KB pelo próprio Chromium. A lista e a ordem dos 14 quadros ficam em `QUADROS`, no começo do script: Reels do restaurante, Agente com o Pix no banco, TikTok com Pix aprovado, Voz com a agenda aberta na ligação, LinkedIn com o guia liberado, Pix Automático autorizando, Google com os locais no mapa, Chamada no WhatsApp, teste de nível do Feed, RCS no iPhone, Maps navegando, YouTube antes do vídeo, ChatGPT entregando ao WhatsApp e Story da clínica.
- **Links:** campanhas vão para `#laboratorio/<canal>/<formato>`, automações para `#sistemas/<chave>`. Clicar de novo no mesmo cartão reabre pelo evento `cx:abrir` (ou por um `hashchange`, se o laboratório ainda não montou).
- **Comportamento:** arrastar com o mouse, rolagem nativa com `scroll-snap` no toque, setas e Home/End com foco num cartão (tabindex móvel), botões ← e → e pausa. A rolagem lenta (22 px/s) dá a volta por um segundo conjunto de cartões (`data-mu-clone`, fora do leitor de tela e do Tab) e para em hover, foco, toque, fora da tela, aba oculta, `body.is-paused` e com movimento reduzido (aí nem os clones existem).
- **Canais:** abaixo da faixa, os 16 canais com o logo oficial ou o glifo, cada um com link para `#laboratorio/<canal>`.
- **Nota:** "Marcas fictícias. As fotos nas telas têm licença aberta: ver créditos.", com link para `/creditos` (as telas reproduzem fotos CC BY e CC BY-SA).
- **Peso:** as imagens só pedem a rede quando a faixa chega a 300 px da tela; o `#mural` reserva 600 px antes de montar.
- **Medidas:** cartões de 148 a 196 px (140 px no celular deitado), toques de 44 px, imagens com `loading="lazy"`.
