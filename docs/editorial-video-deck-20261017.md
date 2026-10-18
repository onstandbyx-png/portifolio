# Referência de movimento dos cards — 1000776234.mp4

**Origem**: vídeo enviado pelo operador, 25 segundos, 2218×1478 px, 1349 quadros (~53,96 fps).
**Método**: verificação de quadros a cada 0,5 s e quadros intermediários nas passagens. Não reproduzir logotipos, textos ou cores do produto de referência.

## Sequência observada
| Tempo aproximado | Transformação percebida | Tradução para o portfólio |
|---|---|---|
| 0,0–1,0 s | Cartão inicial recua para a esquerda, próximo avança; pilha continua visível | iPhone → iPad no mesmo palco |
| 1,0–8,2 s | Repouso com leves detalhes internos; cabeçalho e controles fixos | Sem animação contínua de hardware nem salto de layout |
| 8,3–9,1 s | O cartão frontal muda de pose, há sobreposição e acomodação | iPad → MacBook com camadas e profundidade |
| 14,8–15,6 s | Nova transição lateral, sem girar o verso do cartão | Navegação reversível pelos controles existentes |
| 20,4–21,1 s | Última chegada ao centro, com profundidade e sombra de contato | Retorno à Abertura com transição simétrica |

## Parâmetros implementados
- O mesmo objeto de hardware permanece montado ao mudar de posição; nenhuma imagem congelada substitui iPhone, iPad ou MacBook.
- Retaguarda: 38px no eixo Z, ±4,5° em Y, ±3–4° em Z e escala de 0,70/0,73 desktop/mobile.
- Duração 610ms: 0–12% liberação; 12–84% passagem e troca discreta de z-index; 84–100% acomodação do objeto entrante com excesso de escala limitado a 1,7%.
- Cabeçalho, navegação por teclado, swipe nativo, setas e seleção de prévia preservados.
- Movimento reduzido e pausa desligam a animação e mostram imediatamente a posição final.

## Critérios de aceite
- Um único objeto em primeiro plano e dois dispositivos físicos reconhecíveis nas laterais.
- Sem transformações que convertam iPad ou MacBook em cartão vertical.
- Troca de dispositivo não desloca os controles ou a seção seguinte.
- Swipe horizontal não sequestra rolagem vertical; clique na prévia e nas setas sincronizam a etapa.
- Testar 320, 390, 768 e 1440px, além de 390px com `prefers-reduced-motion: reduce`.
