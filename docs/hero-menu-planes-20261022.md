# Hero e navegação inspirados na direção Planes — 22/10/2026

## Referência e adaptação

Referência escolhida: a landing smiile registrada na revisão cc19ed2 (https://github.com/onstandbyx-png/smiile-/commit/cc19ed2843d07509c2bcddcbf71ac376f218b66e), especialmente a abertura escura, a tipografia de alto contraste e a navegação por categorias com um painel visual contínuo.

O portfólio mantém a promessa, os destinos e a demonstração física de crachás já existentes. A mudança aplica o campo escuro de largura total, a hierarquia tipográfica e o contraste da referência sem substituir o canvas WebGL, os pôsteres ou os controles próprios do hero.

O menu desktop usa três categorias — trabalhos, serviços e processo — e aponta apenas para seções reais. No celular, as mesmas rotas ficam em acordeões HTML nativos. A composição usa CSS e JavaScript próprios, sem código, thumbnails, shaders Pro ou dependências da Planes.

## Acessibilidade e validação

Os gatilhos preservam href de fallback, aria-expanded e aria-controls; setas e Escape atendem navegação por teclado; links do painel fecham a navegação; movimento reduzido remove transições. A experiência do crachá e a alternativa estática permanecem intactas.

A suíte navigation-menu cobre seleção por clique e hover, troca de categoria, links válidos, teclado, acordeões móveis e overflow. Os testes de geometria e carregamento dos crachás continuam sendo os contratos da demonstração física.
