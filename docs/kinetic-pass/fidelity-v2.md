# Reconstrução cinemática v3 · 15/10/2026

## Escopo
Só a seção `#estudio-interativo`. O hero, o baralho, os cases e as demais seções permanecem intactos. Mantemos uma peça original adaptada ao portfólio, sem reutilizar código de terceiros nem apresentar os controles do vídeo como código original.

## Material contínuo
- Clipping de uma região de textura luminosa do vídeo enviado, `sssx.io_1792031061213.mp4`.
- `public/assets/kinetic-pass/material-loop.mp4`: H.264 sem áudio, 256 × 128 px, 16 fps e 1,75 s; 25.241 bytes. O arquivo foi transferido como blob Git, e o SHA de Git (`1ac50e1a32f22d5ab52c41914113395a38d43abc`) corresponde aos bytes locais.
- O vídeo ocupa apenas a matéria-prima do passe e fica visível através da tipografia `multiply`, não é um player incorporado à seção.
- Quando o codec não reproduz, a rotina de Canvas 2D com amostras interpoladas continua disponível como fallback.
- Pausa global, pausa local, visibilidade da aba e preferência por movimento reduzido interrompem a reprodução.

## Dobra 3D e UX
- A malha WebGL da v2 permanece opcional, com curva cilíndrica e luz dependente da posição; o polígono SVG é fallback.
- A inspeção dos quatro planos agora distingue textura em vídeo, base, tipografia e impressão.
- A dobra pode ser aberta por toque, mouse, teclado e slider; modos sem movimento preservam os controles.

## Validação requerida antes do merge
1. `npm run check && npm run build` (inclui os testes da geometria).
2. Chromium em 1440×1000, 390×844, 320×740 e 844×390.
3. Media `GET` e `Range` com Content-Type `video/mp4` e status 206, comprovação de decode H.264.
4. Video em execução quando visível; pausa local/global; timeline e gestos funcionando.
5. Inspeção visual dos 12 checkpoints, sem clipping ou colisão. Capturas automatizadas não provam fidelidade pixel a pixel.
6. Após aprovação, merge e deploy SUCCESS no Railway; conferir página pública.

## Limitações
A textura foi comprimida a um loop curto e menor resolução, não são todos os 1.536 frames da referência reproduzidos em vídeo. A dinâmica da dobra continua aproximação física, não simulação de colisão. Testes de Chromium emulado não medem FPS em aparelhos físicos.

Base estável anterior: `2a246463b354055d862f9d08a59296681fd3dd2a`.
