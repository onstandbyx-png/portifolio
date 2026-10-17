# Correção visual e de hierarquia — 17/10/2026

O catálogo antecipado adiou a primeira peça da galeria e aumentou a repetição. Esta revisão devolve prioridade ao trabalho visual e aproxima categoria, aplicação e contribuição.

## Composição e copy

- Abertura com escopo e benefício explícitos; CTA principal para os trabalhos.
- Galeria após a abertura, com contraste Inter/Newsreader recuperado. Catálogo e processo ficam depois das demonstrações.
- Categorias ganham prioridade sobre os nomes dos projetos. A natureza conceitual das composições é indicada nas legendas.
- Campanhas apresenta arte antes da explicação no celular, mantendo peel, logos reais e decisões por canal.
- Sistemas começa com um resultado preenchido. Editar, encaminhar, concluir e reiniciar continuam funcionais e locais.
- Processo e catálogo têm menos texto e espaço repetido. Seções anteriormente ocultas continuam ocultas.

## Continuidade dos dispositivos

Os três frames permanecem em contêineres próprios. A seleção muda sua posição, escala, inclinação e profundidade, sem reparentear o hardware ou alterar a composição interna da tela.

O palco considera a altura disponível e permanece estável tanto no desktop quanto no celular. Interrupções partem da pose pintada. Movimento reduzido e pausa selecionam o estado final sem movimento espacial. Arrastar não dispara também um clique na prévia que acabou de se mover.

A regra que forçava `display:block` nas prévias foi removida: iPad conserva grid, MacBook conserva flex. O baralho Fatos mantém seus seis cartões e a implementação existente de saída lateral.

## Evidência e critérios

Na primeira captura local, a primeira arte da galeria aparece em 1.522 px a 390 × 844 e em 1.328 px a 1.440 × 900. Na prévia anterior, aparecia em 2.784 e 2.445 px; no estado preservado, em 1.553 e 1.348 px.

A verificação de dispositivos passou em 320, 390, 768 e 1.440 px, incluindo movimento reduzido. A variação de posição da navegação entre os três modelos foi 0 px em todos esses cenários.

Critérios adicionais: mesma identidade dos objetos durante as trocas; grid/flex e imagens corretos nas laterais; conteúdo pintado em 25%, 50% e 75% da transição; interrupção sem salto; arte de Campanhas antes do texto no celular; resultado de Sistemas visível antes do preenchimento; foco, teclado e rolagem nativa preservados.

`browser-visual-correction.mjs` registra a geometria e os quadros intermediários. Capturas usam o header real. Testes funcionais e geométricos não equivalem à aprovação estética do usuário, nem a uma comparação quadro a quadro com o vídeo original.

## Recuperação

- Estado de referência: `b3e5a8bee099c5a74bd935b356316d84dd5e2cbf`, na branch remota `rollback/portfolio-before-positioning-20261017-b3e5a8b`.
- Prévia anterior: `6223a56f5584351348533f0c228adb5d4ea869f5`, na branch remota `rollback/portfolio-preview-before-visual-20261017`.
- O alvo desta entrega é o serviço independente `portfolio-positioning-preview`. O principal `portfolio-visual-review` continua como referência preservada.
- Para retornar, publicar o SHA correspondente no mesmo serviço. Não usar reset ou force-push na branch compartilhada.

Referências aplicadas: [Instrument](https://www.instrument.com/services/), [Sania Saleh](https://www.sania.io/), [DepthDeckCarousel](https://www.framer.com/marketplace/components/depthdeckcarousel/), [W3C — Carousels](https://www.w3.org/WAI/tutorials/carousels/animations/) e [web.dev — Animation Guide](https://web.dev/articles/animations-guide). A pesquisa completa foi entregue separadamente antes da implementação.
