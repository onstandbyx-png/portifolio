---
name: verificar
description: Prova com evidência fresca que uma mudança no portfólio funciona antes de afirmar conclusão, commitar ou abrir PR. Use ao terminar qualquer alteração de código, HTML, CSS, assets ou testes, ou quando o usuário pedir "verifique", "rode os testes" ou "está pronto?".
argument-hint: "[suite-de-navegador ...]"
allowed-tools: Bash(npm run check) Bash(npm run build) Bash(node --test *) Bash(node tests/*) Bash(git status *) Bash(git diff *)
---

# Verificar antes de concluir

Sem evidência desta mensagem, não há conclusão. "Deve passar" e "parece certo" não contam.

## Estado atual

!`git status --short`

## Passos

1. Rode e leia a saída completa, com código de saída:
   ```sh
   npm run check && npm run build && node --test tests/*.test.mjs
   ```
2. Escolha as suítes de navegador afetadas. Se `$ARGUMENTS` vier preenchido, use essas; senão, mapeie pelo diff:
   - hero, crachás → `readable-hero`, `hero-fit`, `badge-loading`
   - seções, galeria, cards → `section-visibility`, `static-presentations`, `independent-showcases`
   - dispositivos, editorial → `editorial-devices`, `device-fidelity`, `gestures`
   - copy, narrativa, contato → `narrative`, `positioning`
   - movimento → `motion-rhythm`; vídeo Fatos → `fatos-video`; visual geral → `visual-correction`
3. Rode cada uma com `node tests/browser-<suite>.mjs 2>&1 | tail -20` (ou delegue ao subagente `visual-qa` quando forem várias). Procure `"pass":false`, `errors` e `writes` não vazios.
4. Mudança visual: abra pelo menos uma captura em `qa/` por viewport tocado (320, 390, 1440) e descreva o que vê. Asserts não provam composição.
5. Releia o diff (`git diff`) como revisor hostil: linhas fora do pedido, regra de `AGENTS.md` violada, métrica inventada, asset sem fonte registrada.

## Relatório

Diga o que rodou, quantas verificações passaram e falharam (números da saída), o que as capturas mostram e o que **não** foi verificado (ex.: desempenho em aparelho real, LCP/INP/CLS). Se algo falhou, relate a falha com a saída; não conclua.
