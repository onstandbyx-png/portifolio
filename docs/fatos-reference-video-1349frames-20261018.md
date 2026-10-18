# Fidelidade quadro a quadro — Fatos (1000776234.mp4)

## Varredura integral
Vídeo de 25,00 s, 2218 × 1478 px, 1.349 quadros, taxa média 53,96 fps. A análise percorreu todos os quadros e mediu a diferença de luminância/alteração pixel a pixel em uma região correspondente ao baralho, identificando as quatro passagens dominantes.

| Passagem | Janela observada | Pico de energia da troca | Comportamento visual |
|---|---|---:|---|
| 1 | 0,55–1,10 s | 17,99 | A frente desliza para a esquerda com leve inclinação; a próxima entra mantendo as demais cartas empilhadas |
| 2 | 8,45–9,10 s | 14,22 | Troca lateral com a carta nova ficando à frente; a antiga permanece visível durante a passagem |
| 3 | 15,05–15,70 s | 17,31 | Repetição reversível do percurso, inclinação baixa e retorno ao centro |
| 4 | 20,35–21,15 s | 17,03 | Próxima carta cruza à frente da pilha; acomodação sem efeito de virar verso |

A movimentação é concentrada em aproximadamente 0,45–0,55 s. Nos intervalos de repouso, o baralho permanece estável, com duas bordas laterais visíveis. A referência não usa animação contínua incessante.

## Implementação e diferenças deliberadas
- Cartas Fatos permanecem como DOM real, com textos, imagens, verso, teclado e controles.
- Duração Web Animations API = 480ms, em lugar dos 590ms anteriores.
- Inclinação de saída limitada a ±8,5°, em lugar de ±13°, preservando o movimento lateral.
- Saída em cinco pontos e chegada em três pontos, com pequena acomodação de escala (máximo +1,7%).
- CSS de descanso = 500ms para reposição das camadas; não alteramos o gesto de arraste existente.
- Movimento reduzido mantém troca imediata, sem carta sobrevoando outra.
- Mantivemos contraste/editorial Fatos; não reproduzimos marca, conteúdo ou visual exato do website do vídeo.

## Critérios de aceite
1. 6 cartões Fatos persistentes, sem remount.
2. Pilha legível com bordas laterais de pelo menos 22 px e perspectiva não nula.
3. Cartas de saída e chegada coexistem durante a transição, com z-index correto.
4. Animações de 480 ms e rotação final de 8,5°, comprovadas em navegador.
5. Swipe acompanha dedo; soltura escolhe um cartão e não bloqueia a rolagem vertical.
6. Movimento reduzido, pausa, tecla Escape e virada individual seguem funcionais.
7. Verificação em 320px, 390px, 1440px e 390px com reduced motion.

Estes são parâmetros calibrados ao vídeo enviado; não pretendem representar parâmetros do código original do autor.
