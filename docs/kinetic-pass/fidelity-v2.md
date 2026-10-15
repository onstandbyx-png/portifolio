# Reconstrução cinemática v2 · 15/10/2026

A seção #estudio-interativo foi reconstruída sem modificar as outras seções. O componente original do vídeo segue como referência de proporções e enquadramento, não como código reaproveitado.

## Mudanças

- Texto vazado: mantém o substrato preto e o mix-blend-mode multiply, isolado da impressão sobreposta.
- Matéria-prima: **superfície contínua em Canvas 2D**, obtida de 16 amostras do vídeo fornecido, com interpolação suave de quadro e pontos de luz dinâmicos. Não é um vídeo MP4 em loop nem reproduz todos os quadros do material original. Elimina quatro bandas horizontais repetidas.
- Dobra: malha WebGL (75×125 células, 18.750 triângulos), deformação cilíndrica e iluminação da curvatura. A dobra vetorial SVG continua como fallback quando WebGL falha.
- Selo: reflexo angular isolado e paleta com brilho variável.
- Camadas: controle de inspeção independente de textura, base, tipografia e impressão.
- Movimento: processamento visível em requestAnimationFrame, pausa global/local e prefers-reduced-motion mantidos.
- QA: 12 checkpoints produzidos em cada uma das quatro resoluções testadas, com capturas verificáveis, além de testes da geometria e ações de apontamento.

## Limites documentados

A abertura da aba usa uma curva aproximada por malha, não simulação de colisão. O WebGL não foi medido em aparelhos físicos. Os 16 recortes originais interpolados não equivalem ao vídeo contínuo integral; não anunciar como vídeo nativo. As capturas automatizadas são evidência, mas a fidelidade visual ainda demanda inspeção humana. Uma correção só pode ser promovida após QA sem falhas e revisão dos screenshots reais.

## Voltar

Versão estável de referência anterior: `2a246463b354055d862f9d08a59296681fd3dd2a`.
