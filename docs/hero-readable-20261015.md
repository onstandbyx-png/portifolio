# Hero e leitura das demonstrações — R5

A versão anterior mantinha o mesmo design no carregamento, mas a composição em leque reduzia as faces, escondia parte da segunda peça e tornava os textos pequenos. A pausa também podia deixar uma seção entre dois capítulos. Esta revisão prioriza a leitura e mantém a manipulação como interação secundária.

## Hero

- Uma peça selecionável no celular e duas peças independentes quando a área da cena tem pelo menos 540 px. As faces ficam inteiras, frontais e sem sobreposição no repouso.
- Cada peça tem sua própria suspensão curta. O arraste é limitado; soltar retorna ao repouso. Virar altera apenas a face selecionada e não injeta energia na simulação.
- Os controles são Fatos, smiile e uma única ação contextual de frente/verso. A descrição e o link do projeto são HTML com texto de 16 px; os alvos de interação têm pelo menos 44 px.
- O título e os CTAs foram compactados para apresentar a peça mais cedo no celular. Experiência profissional e escopo continuam no hero, abaixo da cena no mobile.
- Oito posters são gerados pelo mesmo `BadgeScene`: quatro combinações para o par e frente/verso de cada peça para a composição individual. A imagem permanece até o primeiro frame pronto, sem dois desenhos simultâneos.
- A seleção inicial Fatos e as faces escolhidas sobrevivem ao carregamento e à restauração WebGL. Escape restaura as frentes sem trocar a seleção.

## Seções e mocks

- A galeria e a narrativa de formatos reservam 70% de cada intervalo de capítulo à pose de leitura. O restante é uma transição reversível pela rolagem.
- Pausar assenta no capítulo mais próximo. A rolagem continua mudando de capítulo, sem animação entre eles. Retomar só devolve a transição contínua após um novo deslocamento real da página.
- Abrir os bastidores assenta o cartão após o clique, sem deslocá-lo entre pressionar e soltar. Os planos vizinhos da narrativa ficam menos salientes que o ativo.
- Mocks sociais e smiile oferecem exploração ampliada em diálogo nativo. O mesmo conteúdo interativo é movido, preservando estado, imagens e molduras metálicas; não há cópia concorrente da demonstração.
- A exploração usa reflow e fontes reais de 14–16 px, com transcrição de 16 px. Fechar ou pressionar Escape restaura foco e posição da página. A reprodução é pausada ao abrir/fechar.
- “A ideia tem camadas” continua oculta, conforme solicitado.

## Validação

- `npm run check` e `npm run build`; 41 testes unitários e de contratos, incluindo 13 de física.
- Capturas de hero inspecionadas em 390 e 1440 px; dez larguras verificadas para composição/poster e overflow, incluindo os limites 573/574, 760/761 e 1100/1101.
- Regressões de carregamento cobrem atraso/falha de JS, ausência de JS, movimento reduzido, respostas de imagem fora de ordem e perda/restauração de contexto.
- Regressões de interação cobrem viradas repetidas, arraste independente, leitura frontal, rolagem em pausa e exploração com estado/foco preservados.
- Mocks e seções conferidos em 320, 390 e 1440 px; ligação também em 320 × 640.

As capturas e verificações usam Chromium e emulação de viewport/toque. Não representam uma certificação em Safari ou aparelho físico. As referências orientam a composição e os gestos; não se afirma equivalência quadro a quadro com o vídeo.

## Publicação

Marcador: `hero-readable-20261015-r5`.

Prévia: https://portfolio-visual-review-production.up.railway.app/?v=hero-r5

A revisão pertence à branch `feat/portfolio-reference-recovery-20261015` e à PR #6. O serviço de revisão recebe o commit validado; o serviço principal não é alterado por esta publicação.
