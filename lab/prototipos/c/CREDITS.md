# Protótipo C: créditos e licenças

Página estática: `index.html`, `style.css` e `carousel.js` (módulo ES de 2,4 KB). Não usa React nem Tailwind em tempo de execução e não faz nenhuma requisição externa. A página declara a CSP `default-src 'self'; script-src 'self'; style-src 'self'` e não tem estilo, script nem handler inline. O QA não registrou nenhuma violação de CSP.

## Escolhas

| Papel | Escolha | Motivo |
|---|---|---|
| Base do card | **Magic UI: BentoCard** (`bento-grid.tsx`), a 3ª biblioteca de card recomendada | O card escuro com borda fina de 1px e o brilho interno do modo escuro se parece com a borda dos cards de referência. A estrutura (nome, descrição, uma área de demonstração, um CTA) segue o brief: serviço, benefício, uma demonstração, uma ação. |
| Molduras | **Magic UI: Iphone + Safari em modo "simple"**, a 3ª opção de mockup recomendada | Molduras vetoriais genéricas (cerca de 1,5 KB cada) com o retângulo de tela exato documentado na fonte. Escalam sem JS e ficam nítidas em qualquer densidade. |

Card e molduras vêm da mesma biblioteca, e a combinação não ficou mais fraca, então segui com ela. Dois pontos que o dono deve saber:

- As molduras são planas, não fotorrealistas: não há notebook nem tablet, e por isso a demonstração de 08 (E-commerce) e 09 (Marca) aparece numa janela de navegador.
- O BentoCard original não tem selo numerado nem botão em pílula. Os dois foram construídos sobre os slots dele: o ícone de 48px virou o selo e o link com seta virou a pílula.

## Componentes

| Componente | Uso no protótipo | Licença | Fonte | Arquivo local |
|---|---|---|---|---|
| Magic UI: BentoCard | Casca do card (`.mu-card`). **Mantido do original:** coluna flex, `overflow-hidden`, borda `1px solid rgba(255,255,255,.1)`, brilho interno do modo escuro `0 -20px 80px -20px #ffffff1f inset`, ícone de 48px (`h-12 w-12`, virou o selo numerado), nome em `text-xl font-semibold`, descrição em tom secundário, CTA com `ArrowRightIcon`. **Adaptado:** raio de 12px para 28px, paleta do dono, ordem cabeçalho → título → apoio → demonstração → CTA, e CTA sempre visível como pílula de 52px. **Removido:** todo `translate`, `scale` e `opacity` de hover, o CTA escondido até o hover e a camada de hover. | MIT, © Magic UI | https://magicui.design/docs/components/bento-grid · https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/bento-grid.tsx | `style.css` (`.mu-card*`, `.mu-cta`), `vendor/bento-grid.tsx` (fonte original), `vendor/LICENSE-magicui.txt` |
| Magic UI: Iphone | Moldura de celular dos cards 01 e 02. SVG 433×882 com o furo da tela em x 21,25, y 19,25, 389,5×843,5, raio 55,75. A geometria não mudou; só os tons escuros foram puxados para o verde da página. | MIT, © Magic UI | https://magicui.design/docs/components/iphone · https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/iphone.tsx | `assets/frames/mu-iphone.svg`, `vendor/iphone.tsx` |
| Magic UI: Safari, modo "simple" | Janela de navegador dos cards 05, 08 e 09. SVG 1203×753 com a tela em x 1, y 52, 1200×700. O cadeado e o texto da URL foram removidos (no celular ficariam com cerca de 3px); a geometria não mudou e os tons foram puxados para o verde. | MIT, © Magic UI | https://magicui.design/docs/components/safari · https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/safari.tsx | `assets/frames/mu-browser.svg`, `vendor/safari.tsx` |
| Radix Icons: ArrowRightIcon e ArrowLeftIcon | Seta do CTA (é o mesmo ícone que o BentoCard importa) e botões anterior/próximo. Os paths foram copiados de `@radix-ui/react-icons` 1.3.2. | MIT, © 2022 WorkOS | https://www.radix-ui.com/icons · https://github.com/radix-ui/icons · https://www.npmjs.com/package/@radix-ui/react-icons | `index.html` (SVG inline), `vendor/LICENSE-radix-icons.txt` |
| Carrossel | `overflow-x: auto` com `scroll-snap-type: x mandatory`, nativo do navegador. `carousel.js` (próprio) só liga os botões anterior/próximo, as setas do teclado e o contador "1 de 5". Não há física nem animação; com "reduzir movimento" o salto é instantâneo. | Código próprio | — | `carousel.js`, `style.css` (`.rail`) |

**Referência de estilo, sem código:** o painel interno que envolve a demonstração (`.mu-stage`) segue a ideia do card "What we build" do Nightshift, um dos sites de referência do dono. Nenhum código nem asset do Framer foi usado.

**Não usado:** a animação de hover do BentoCard, o `BentoGrid` (não há grade bento; o layout é um carrossel), as variantes de vídeo e `object-cover` das molduras (elas cortam a mídia; aqui a tela é HTML vivo), Magic UI Pro (pago), React e Tailwind.

## Assets

| Asset | Uso | Licença / origem | Arquivo |
|---|---|---|---|
| Inter Variable 4.001 (rsms/inter) | Todo o texto | SIL Open Font License 1.1, © 2016 The Inter Project Authors. Copiado de `/home/user/portifolio/public/assets/fonts/`, sha256 `693b77d4…29a8e3` (igual ao recibo `font-receipt.json`). Origem: https://github.com/rsms/inter | `assets/fonts/InterVariable.woff2`, `assets/fonts/Inter-OFL.txt` |
| Newsreader Italic Variable 1.003 | Logotipo fictício "Ateliê Exemplo" e o "Aa" do quadro de marca, só dentro das telas | SIL Open Font License 1.1, © 2020 The Newsreader Project Authors. Copiado de `/home/user/portifolio/public/assets/fonts/`, sha256 `d184d5e6…fcc6265`. Origem: https://github.com/productiontype/Newsreader | `assets/fonts/Newsreader-Italic-Variable.woff2`, `assets/fonts/Newsreader-OFL.txt` |
| ceramics-shelf.webp (1200×671) | Tela do card 01 (agenda) | Render do próprio dono, sem pessoas e sem marcas (`scratchpad/renders/`) | `assets/img/ceramics-shelf.webp` |
| vase-sage.webp (720×900) | Tela do card 02 (anúncio) | Idem | `assets/img/vase-sage.webp` |
| mountains-16x9.webp (1200×671) | Tela do card 05 (player) | Idem | `assets/img/mountains-16x9.webp` |
| jar-amber.webp (720×900) | Tela do card 08 (página de produto) | Idem | `assets/img/jar-amber.webp` |
| jar-sage.webp (720×900) | Tela do card 09 (quadro de marca) | Idem | `assets/img/jar-sage.webp` |
| favicon.svg | Ícone da aba | Próprio | `assets/favicon.svg` |

As imagens aparecem sempre na proporção natural: largura fixa com altura automática, ou o contrário. Nenhuma usa `object-fit: cover`. O maior desvio de proporção medido foi de 0,014%.

Peso da página: HTML 3,1 KB, CSS 4,4 KB e JS 1,1 KB (gzip); molduras com 1,6 KB no total; imagens com 144 KB; fontes com 592 KB. A Newsreader (240 KB) serve só ao logotipo fictício. Se o dono quiser uma página mais leve, ela pode trocar por Inter.

## Conteúdo

- Cada card traz o número, o serviço, o subtítulo, a linha menta, o título do brief, uma linha de apoio (13, 12, 11, 11 e 12 palavras), uma demonstração e um CTA "Conversar sobre …" apontando para `#contato`.
- Não há métricas, notas, depoimentos nem clientes reais. "Ateliê Exemplo" é marca fictícia. O preço (R$ 89), a duração (1:24) e a data da agenda servem só para compor as telas fictícias.
- As telas são layouts genéricos (agenda, anúncio vertical, player, página de produto, quadro de marca) e não imitam a interface de nenhuma plataforma.
- As telas são decorativas para leitores de tela (`aria-hidden`). Cada palco tem `role="img"` com uma descrição em português.
- **Decisão pendente do dono:** o subtítulo do card 02, "Meta / Google / TikTok / YouTube", veio da referência dele e cita os canais como descrição do serviço, não como clientes. Se ele preferir não citar marcas de terceiros, troque por "Social / Busca / Vídeo". O subtítulo do card 01, "Sites / Apps / Landing pages", foi criado por mim porque não há referência para esse card.

## QA

O script está em `qa/shoot.cjs` (Playwright 1.64.0 com o Chromium 1194 local). Os resultados completos estão em `shots/checks.json`.

| Verificação | Resultado |
|---|---|
| Larguras testadas | 360, 390, 430, 820 e 1440 px |
| Sobreposição entre cards | Nenhuma |
| Elemento fora do card, aparelho fora do palco, conteúdo transbordando ou cortado dentro da tela | Nenhum |
| Card parcialmente visível no trilho | Nenhum: 1 card por vez no celular, 2 no tablet, 3 no desktop |
| Rolagem horizontal da página | Nenhuma |
| Texto do card | Mínimo de 14px |
| Texto dentro das telas (decorativo, `aria-hidden`) | Celular: mínimo de 11,1px em todas as larguras (a altura do aparelho é fixa). Navegador: mínimo de 10,9px a 360px, 12,0px a 390px, 13,7px a 430px e 13,9px a 1440px |
| Rótulos de uma linha | CTA, nome e subtítulo cabem em uma linha em todas as larguras |
| Alvos de toque | CTA com 52px de altura; botões anterior/próximo com 44×44px |
| Contraste | Texto principal 11,6:1; texto secundário 8,2:1 sobre o card; CTA 12,9:1; texto cinza das telas 5,0:1 sobre o papel |
| Rede, console e CSP | Nenhuma requisição externa, nenhum erro de console, nenhuma violação de CSP |
| Desktop 1440×900 | A seção inteira tem 883px de altura e cabe na tela |
