# Hero integrado · 16/10/2026

## Escopo autorizado
Integrar crachás e texto em um único hero, harmonizar a paleta no celular e ampliar a presença da peça sem substituir a física WebGL ou as imagens existentes. As demais seções permanecem inalteradas.

## Implementação
- Superfície comum verde-floresta, texto creme e crachás sem painel claro independente.
- Composição lado a lado a partir de 960 CSS px, inclusive viewport touch de 980px.
- Mobile com título compacto, peça mais cedo, seletor e controle de verso abaixo da arte.
- Mesmo enquadramento CSS no canvas e no pôster de fallback: escala individual 1.20, dupla 1.075, origem inferior. O aumento recorta apenas espaço excedente da suspensão; a arte deve permanecer integralmente visível.
- Não altera câmera, solver, materiais, conteúdo dos crachás, CTAs ou destinos.
- Consolida os overrides anteriores hero-refinement/hero-distinct numa folha hero-composition; arquivos anteriores mantidos como histórico.

## Segurança
Base de produção: 8b94b40352742d9afd59e970e55ea02417e2fc42.
Rollback preservado: rollback/hero-before-integration-20261016-8b94b40.
Trabalho isolado: feat/hero-integrated-fit-20261016, PR #14.
Railway só recebe um SHA explicitamente validado. Para restaurar, fixar novamente o SHA base no serviço portfolio-visual-review.

## Verificação
O primeiro commit contém apenas o novo aceite de geometria e capturas do baseline, deliberadamente vermelho nas condições ausentes. A implementação é validada por oito suítes de navegador, incluindo hero-fit, geometria WebGL, carregamento/fallback, gestos, narrativa e cenas de rolagem. Testes atualizados medem clientWidth para o breakpoint lógico e boundingClientRect/vertices projetados para o enquadramento visual após escala. Não se relaxam os contratos de física nem o tamanho mínimo dos alvos de interação.

Prévia local usou as imagens de fallback reais porque o navegador local não oferece WebGL; aprovação da física e da troca de pôster depende das execuções CI. Nenhuma captura local de fallback deve ser apresentada como teste de WebGL em produção.
