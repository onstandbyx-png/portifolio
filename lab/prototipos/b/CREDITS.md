# Protótipo B: créditos e licenças

O protótipo é uma página estática (index.html, style.css e carousel.js). Não usa runtime de React nem de Tailwind e não faz nenhuma requisição externa. Ele funciona sob `script-src 'self'`; a página já declara a CSP `default-src 'self'` e não tem estilo nem script inline.

## Escolhas

| Papel | Escolha | Motivo |
|---|---|---|
| Base do card | **Flowbite 4**, a 2ª biblioteca de card recomendada | "Card with image" e "Card with button" já trazem a anatomia das referências: selo, título forte e um botão. Foram portados para CSS puro. |
| Molduras de dispositivo | **react-mockframe 1.3.0**, a 2ª opção de mockup recomendada | Molduras realistas em CSS, incluindo o único notebook realista disponível. Usei só o markup estático e o CSS; o React não roda na página. |

A combinação não ficou mais fraca, então segui com ela. Dois cuidados:

- As molduras têm tamanho fixo em px. Em vez do `fit.js` da pesquisa, a escala é calculada só com CSS, com container queries e `tan(atan2())`. Cada aparelho cabe inteiro no palco, sem corte e sem JS.
- As formas de tablet e notebook lembram aparelhos da Apple, sem logotipo. Os nomes de produto (`pixel10`, `ipad-pro`, `macbook-pro`) existem só como classes CSS da biblioteca e nunca aparecem para o visitante.

## Componentes

| Componente | Uso no protótipo | Licença | Fonte | Arquivo local |
|---|---|---|---|---|
| Flowbite 4: Card with image, Card with button | Casca do card: fundo, borda, raio, espaçamento, título (`text-2xl font-semibold tracking-tight`) e texto (`text-body`). Portado para as classes `.fb-card*`. | MIT, © 2023 Bergside Inc. | https://flowbite.com/docs/components/card/#card-with-image · https://flowbite.com/docs/components/card/#card-with-button · https://github.com/themesberg/flowbite/blob/main/content/components/card.md | style.css (`.fb-card`, `.fb-card-title`, `.fb-card-text`), vendor/LICENSE-flowbite.txt |
| Flowbite 4: Badge | Virou o bloco numerado quadrado (`.fb-badge`) | MIT, © 2023 Bergside Inc. | https://flowbite.com/docs/components/badge/ | style.css |
| Flowbite 4: Button | Virou a pílula larga do CTA (`.fb-btn`); o anel de foco virou contorno menta | MIT, © 2023 Bergside Inc. | https://flowbite.com/docs/components/buttons/ | style.css |
| Flowbite 4: tokens do tema | Mantive os nomes dos tokens (`--color-neutral-primary-soft`, `--color-default`, `--color-heading`, `--color-body`, `--color-brand`, `--radius-base`), apontando para a paleta do dono | MIT, © 2023 Bergside Inc. | https://github.com/themesberg/flowbite/blob/main/src/themes/default.css | style.css `:root` |
| react-mockframe 1.3.0 | Molduras: celular (`pixel10 obsidian`, cards 01 e 08), tablet deitado (`ipad-pro landscape`, card 02), tablet em pé (`ipad-pro`, card 09) e notebook (`macbook-pro`, card 05). O markup veio de `renderToStaticMarkup` e o CSS é um recorte literal do pacote, só com essas três famílias. | MIT, © 2026 Mohammed Banani | https://www.npmjs.com/package/react-mockframe · https://github.com/mbdev3/react-mockframe | vendor/mockframe-subset.css (9,4 KB; 2,6 KB gzip), vendor/LICENSE-react-mockframe.txt |
| Marvel devices.css (base do CSS do react-mockframe) | Mesma folha de estilo, adaptada pelo react-mockframe | MIT, © 2014 Marvelapp | https://github.com/marvelapp/devices.css | O aviso está no cabeçalho de vendor/mockframe-subset.css e em vendor/LICENSE-react-mockframe.txt |

**Não usado:** o JS e o carrossel do Flowbite (o carrossel aqui é scroll-snap nativo mais um script de 2 KB próprio), as molduras do Flowbite, os Flowbite Blocks (pagos), o runtime do React e o Tailwind.

## Assets

| Asset | Uso | Licença / origem | Arquivo |
|---|---|---|---|
| Inter Variable (rsms/inter) | Todo o texto, inclusive o das telas | SIL Open Font License 1.1, © 2016 The Inter Project Authors. Copiada de `/home/user/portifolio/public/assets/fonts/` (recibo em `font-receipt.json`: https://github.com/rsms/inter, sha256 693b77d4…a8e3) | assets/fonts/InterVariable.woff2, assets/fonts/Inter-OFL.txt |
| ceramics-shelf.webp (1200×671) | Tela do card 01 (agenda) e do card 09 (quadro de marca) | Render original gerado para este portfólio, sem pessoas e sem marcas (asset do dono, de `scratchpad/renders/`) | assets/img/ceramics-shelf.webp |
| vase-sage.webp (720×900) | Tela do card 02 (anúncio) | Idem | assets/img/vase-sage.webp |
| mountains-16x9.webp (1200×671) | Tela do card 05 (player de vídeo) | Idem | assets/img/mountains-16x9.webp |
| jar-amber.webp (720×900) | Tela do card 08 (página de produto) | Idem | assets/img/jar-amber.webp |
| Ícones de seta e sacola (SVG inline) | Botões anterior/próximo, CTA e cabeçalho da loja no card 08 | Desenhados para este protótipo. A seta segue o traço do ícone arrow-right do Flowbite Icons (MIT). | index.html |
| favicon.svg | Ícone da aba | Próprio | assets/favicon.svg |

Todas as imagens aparecem na proporção original (`width: 100%; height: auto` ou altura fixa com largura automática), sem `object-fit: cover`. O QA mediu desvio de proporção abaixo de 0,01%.

## Conteúdo

- Os títulos, subtítulos e CTAs seguem o brief. Cada linha de apoio tem no máximo 14 palavras.
- Não há métricas, notas, depoimentos nem clientes reais. "Ateliê Exemplo" é marca fictícia, e a única cifra é o preço de um produto fictício (R$ 89).
- As telas são layouts genéricos: agenda, anúncio, player, página de produto e quadro de marca. Nenhuma imita a interface de uma plataforma.
- **Decisão pendente do dono:** o subtítulo do card 02, "Meta / Google / TikTok / YouTube", veio da referência dele e cita os canais pelo nome, como descrição do serviço. Se ele preferir não citar nenhuma marca de terceiros, troque por "Social / Busca / Vídeo".

## QA

- Script: `cards-lib/scripts/shoot-proto-B.cjs`, rodando Playwright 1.64.0 com Chromium 1194.
- Medições: `shots/checks.json`, em 360, 390, 430 e 1440 px.
- Resultado: nada cortado, nenhum card sobreposto e nenhuma rolagem horizontal na página. O menor texto do card tem 14 px e o menor texto de tela, depois da escala, tem 12 px. O CTA tem 54 px de altura e os botões de navegação 48 × 48. Os contrastes de texto ficam entre 6,15:1 e 13,7:1. Nenhum erro de console ou de CSP.
