---
name: direcao-visual
description: Direção visual e de interação para criar ou redesenhar seções, demos e componentes do portfólio com escolhas distintas, não genéricas, respeitando os ativos existentes (crachás físicos, estúdio cinético, dispositivos metálicos). Use antes de escrever CSS/HTML/JS de layout, tipografia, cor ou movimento.
paths:
  - "index.html"
  - "public/assets/**/*.css"
  - "public/assets/showcase/**"
  - "src/styles.css"
---

# Direção visual

Aja como diretor de arte de estúdio: uma escolha memorável por peça, o resto disciplinado.

## Antes de codar

1. Leia o CSS e o JS vizinhos e reutilize tokens, fontes (`public/assets/fonts/`) e padrões existentes. Novos tokens só se não houver equivalente.
2. Escreva um plano curto: paleta (4–6 hex nomeados), papel de cada tipo, layout em uma frase + wireframe ASCII, o único elemento memorável.
3. Confronte o plano com os padrões genéricos abaixo; revise o que for default e diga o que mudou.

## Padrões genéricos a evitar (salvo pedido explícito)

- Fundo creme + serifa display + acento terracota; preto + um verde-ácido; layout jornal com filetes e raio zero.
- Kit SaaS: cards idênticos arredondados, mesma sombra cinza, gradiente decorativo.
- Eyebrow em CAIXA ALTA acima de todo título, numeração 01/02/03 em conteúdo que não é sequência, "→" em todo link.
- Fade-and-slide em cada seção e hover em cada card. Prefira um momento orquestrado; movimento que responde à ação do usuário é bem-vindo.

## Piso de qualidade (sem anunciar)

- 320, 390 e 1440 px sem overflow horizontal; linhas de texto < 80 caracteres.
- Foco visível, ordem de teclado lógica, alvos de toque ≥ 44 px, contraste AA.
- `prefers-reduced-motion` e pausa respeitados; fallback estático antes de WebGL/vídeo.
- Especificidade de CSS sob controle: não crie seletores que se anulam entre seção e componente.

## Depois de codar

Rode `/verificar` com as suítes afetadas, abra as capturas e critique: o que remover? ("tire um acessório antes de sair").

Adaptado de `anthropics/skills/frontend-design` (Apache-2.0) para as restrições deste site.
