# Estúdio interativo: A ideia tem camadas

Seção independente em `#estudio-interativo`, inserida depois de Trabalhos. Preserva o hero e as outras demonstrações.

## Referência e extração

A fonte enviada é `sssx.io_1792031061213.mp4`: 1080 × 1080, 60 fps, 25,6 s e 1.536 frames de vídeo. Todos foram extraídos em PNG sem conversão de taxa, indexados pelo timestamp e organizados em 16 folhas de contato. O manifesto registra o hash da fonte, os intervalos da sequência e o recorte da textura. Os PNGs completos estão no pacote de evidências da conversa, não no bundle público.

A referência mostra um passe com recorte tipográfico animado, dobra de canto, resposta ao cursor e decomposição em camadas. A implementação é independente: não recupera nem afirma utilizar o código original. Identidade, nome, conteúdo e controles foram adaptados para ideia & execução. O navegador e os cortes de edição da gravação não integram a peça.

## Implementação

- Passe em espaço de desenho 300 × 500, com recorte do cordão e entalhes laterais.
- Quatro camadas DOM reais: matéria-prima em canvas, recorte preto, tipografia com multiply e impressão transparente.
- Recorte geométrico e reflexão da dobra, incluindo o furo refletido e a sombra.
- Material em atlas local de 16 pequenas amostras do vídeo; loop espelhado. Não é reprodução integral do vídeo.
- Inclinação ao cursor, arraste pelo canto, alternativa por teclado e controle deslizante.
- Vista separada das camadas, edição de palavra, três acabamentos, pausa, restauração e sequência de 25,6 s navegável.
- Pausa fora da tela, em aba oculta, com o controle global ou com preferência de movimento reduzido. Controles manuais continuam disponíveis.
- Nenhuma dependência nova de runtime, nenhum formulário enviado e nenhum dado persistido.

## Verificação

`node --test tests/kinetic-pass.test.mjs` testa a geometria, cronologia e validação do texto. A validação de navegador roda `node tests/browser-kinetic-pass.mjs` em 1440 × 1000, 390 × 844, 320 × 740 e 844 × 390. Mantém-se a suíte de regressão das seções anteriores.

As capturas e os resultados ficam em `qa/kinetic-pass/`. Verificar o resultado da execução específica antes de afirmar que está aprovado. Uma comparação de capturas não comprova identidade pixel a pixel, e a emulação não substitui ensaio em todos os aparelhos físicos.
