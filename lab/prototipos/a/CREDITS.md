# Protótipo A: créditos e licenças

Página estática dos cinco cards de serviço. Não depende de rede externa: tudo é servido da própria pasta. A CSP da página é `default-src 'self'; script-src 'self'; style-src 'self'`, sem script nem estilo inline.

Todas as licenças abaixo permitem uso comercial em site público.

## Componentes

| Parte | Origem | Licença | Onde está | O que mudou |
|---|---|---|---|---|
| Card, badge, botão, carrossel | **daisyUI 5.7.47**: `components/card.css`, `badge.css`, `button.css`, `carousel.css`. Docs: https://daisyui.com/components/card/ · https://daisyui.com/components/badge/ · https://daisyui.com/components/button/ · https://daisyui.com/components/carousel/ · Repositório: https://github.com/saadeghi/daisyui · Pacote npm: `daisyui@5.7.47` (sha256 do .tgz `9d66a336c61db879425b02fa0b9a2946efd5c28579307f6b241b4df4ad3b684b`) | MIT, "Copyright (c) 2020 Pouya Saadeghi" | `vendor/daisyui-port.css`, licença em `vendor/LICENSE-daisyui.txt` | Copiei as regras base das classes usadas: `.card`, `.card-body`, `.card-title`, `.card-actions`, `.badge`, `.btn`, `.btn-block`, `.btn-circle`, `.btn-outline`, `.carousel`, `.carousel-item`. Removi os blocos responsivos duplicados, as variantes de cor e tamanho, a textura de ruído e o `transform` da transição do botão. O cabeçalho MIT foi mantido. As cores do tema vêm da paleta do dono (variáveis em `style.css`). |
| Molduras de celular e tablet | **Android Studio device art**, Android Open Source Project: `pixel_9/back.webp`, `pixel_9/mask.webp`, `pixel_tablet/back.webp` e os arquivos `layout`. https://android.googlesource.com/platform/tools/adt/idea/+/refs/heads/mirror-goog-studio-main/artwork/resources/device-art-resources/ (árvore `a177e3a2d906ae1715c8974f39eee71be0ca4c8d`, obtida em 2026-10-20) | Apache-2.0 (cabeçalho do `device-art.xml`: "Copyright (C) 2025 The Android Open Source Project") | `assets/device/*.webp`, licença em `assets/device/LICENSE-Apache-2.0.txt`, alterações em `assets/device/NOTICE.txt` | Celular: só redimensionado (720 px de largura). Tablet: girado para retrato, moldura clara recolorida para grafite com borda externa clara, redimensionado (880 px). A posição das telas em `devices.css` vem dos arquivos `layout` (celular: tela 1080×2424 em x55 y58; tablet: tela 1600×2560 em x120 y119 depois do giro). As molduras não levam nome de produto; "Pixel" e "Android" são marcas do Google. |
| Posicionamento das molduras | CSS próprio (`devices.css`), escrito a partir da medição dos arquivos `layout` | Do dono do site | `devices.css` | Corrige o x/y da tela do celular, que estava trocado no CSS da pesquisa (`aosp-frames.css`: 59/55 em vez de 55/58). |
| Carrossel: botões e contador | JS próprio (`carousel.js`), 44 linhas, sem dependências | Do dono do site | `carousel.js` | Usa a rolagem nativa (scroll-snap do daisyUI). Sem animação própria; a rolagem suave do navegador é desligada com `prefers-reduced-motion`. |
| Telas dentro dos aparelhos | HTML e CSS próprios: agenda, anúncio em 3 formatos, player de vídeo, página de produto e quadro de marca. Marca fictícia **Ateliê Exemplo**. | Do dono do site | `index.html` e `style.css` (bloco "Live screens") | Layouts genéricos, sem imitar a interface de nenhuma plataforma. Sem métricas, avaliações, depoimentos ou marcas reais. |
| Ícones de seta | SVG inline próprio (dois traços) | Do dono do site | `index.html` | — |
| Favicon | SVG próprio | Do dono do site | `assets/favicon.svg` | — |

## Fontes tipográficas

| Arquivo | Origem | Licença | Observação |
|---|---|---|---|
| `assets/fonts/InterVariable.woff2` | Inter, de Rasmus Andersson: https://github.com/rsms/inter (`docs/font-files/InterVariable.woff2`), copiado de `/home/user/portifolio/public/assets/fonts/` | SIL Open Font License 1.1 (`assets/fonts/Inter-OFL.txt`) | sha256 `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`, sem alteração |

## Imagens

Renders do próprio dono, sem pessoas, copiados de `scratchpad/renders/` sem alteração. Todos aparecem inteiros, na proporção original; nenhum usa `object-fit: cover`.

| Arquivo | Tamanho | Onde aparece | sha256 |
|---|---|---|---|
| `assets/img/vase-sage.webp` | 720×900 | 02 Campanhas: o mesmo criativo em 9:16, 4:5 e 16:9 | `97f93f4f677fb4d223f30d6ce65609707829d4adeb42bdafa09d175338c2673c` |
| `assets/img/mountains-9x16.webp` | 540×965 | 05 Conteúdo: player de vídeo vertical | `a652d3bcb642c6a2100d792e211d2dc4f7c796c82d5bbd901a83c1b0d01dc62c` |
| `assets/img/jar-amber.webp` | 720×900 | 08 E-commerce: página de produto | `8188c14294d2ec2e739a832db70f7efb3ac54ccdad21454149fb7c9e4c6204a7` |
| `assets/img/ceramics-shelf.webp` | 1200×671 | 09 Marca: quadro de marca | `3ada5b11b661487e9af19f8736d5c143cf7da1ac54d7c1e9cf017f59c558fbdb` |

## Referências visuais (só inspiração; nenhum código ou arquivo copiado)

- Os cinco estudos de card do dono (`fiel/ref/`): verde-floresta, badge numerado, nome com subtítulo, traço menta, título em negrito, um aparelho e um botão largo em pílula. Usei o visual e deixei de fora a densidade.
- Sites de referência capturados em `fidelity/handoff-sites/` (Nightshift, Antimatter, How It Works Steps, Card Deck Carousel, DIVISION, Heron), sites e templates da comunidade Framer. Daí vieram o raio grande, o painel interno único para a demonstração e o trilho com botões anterior/próximo. O baralho em leque e as animações ficaram de fora.

## Avaliados e não usados neste protótipo

Flowbite, Magic UI, HeroUI, HyperUI, Preline, react-mockframe e devices.css (todos MIT) foram avaliados na pesquisa (`cards-lib/cards/`, `cards-lib/mockups/SOURCES.json`) e não entraram aqui. Apple Design Resources e Meta Devices foram rejeitados por licença.
