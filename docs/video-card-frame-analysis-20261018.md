# Dissecção temporal de 1.349 quadros — 1000776234.mp4

Fonte: vídeo de referência fornecido pelo usuário (25s, 2218×1478, 1.349 quadros, H.264 com timestamps não uniformes; frequência média 53,96 fps). Medida: diferença média de intensidade de pixels entre quadros consecutivos na região central dos cards, reduzidos a 550×366. **O índice é relativo e não representa movimento em pixels dos objetos.**

## Quatro passagens identificadas
| Troca | Janelas com deslocamento evidente | Sequência |
|---|---|---|
| 1 | 0,57–1,05 s (pico 0,785 s) | Frontal liberta a pilha e sai lateralmente; seguinte avança em profundidade |
| 2 | 8,50–8,98 s (pico 8,643 s) | Preto → azul; ambos permanecem sólidos durante a maior parte da travessia |
| 3 | 15,00–15,46 s (pico 15,213 s) | Azul → preto; saída inclinada e entrada sobreposta, sem rodar o verso |
| 4 | 20,36–20,86 s (picos 20,463 e 20,588 s) | Preto → verde; camada recebida estabiliza no centro |

Os timings incluem início do deslocamento e a última acomodação visível. Não confundir o intervalo entre cliques com duração da animação.

## Referência quadro a quadro
Os 1.349 registros foram exportados para `1349_frames_motion.csv`: índice original, timestamp real do frame, índice de diferença temporal e etapa qualitativa da troca. As imagens de contato em 0,1s cobrem as quatro transições. Nenhum logotipo, design específico ou texto de um produto de terceiro foi copiado.

## Comportamento aplicado e preservado
1. O objeto frontal mantém sua opacidade quase até concluir a saída, como já faz o baralho de seis cards de Fatos.
2. As cartas atrás mantêm posições persistentes e cores próprias, e a segunda assume o centro sem substituir o DOM.
3. Uma microtextura iluminada acompanha o cursor **apenas no repouso** e somente com ponteiro fino, tal como os padrões discretos percebidos entre as trocas; não interfere na física existente.
4. Swipe horizontal, setas, reverso do card, foco de teclado e rolagem vertical continuam independentes.
5. Redução de movimento e pausa desligam a microtextura. iPhone, iPad e MacBook são os três dispositivos físicos da apresentação editorial, preservados nesta intervenção.

## QA
Comparar 320, 390 e 1440px; verificar após pelo menos duas trocas; capturar início, meio, fim e arraste parcial. No desktop confirmar a luz acompanhando o cursor sem alterar o transform do card. No touch e modo reduzido confirmar ausência da microtextura e da animação extra.