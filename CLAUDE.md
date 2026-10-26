@AGENTS.md

## Específico do Claude Code

- Regras por área carregam sob demanda de `.claude/rules/` (testes, assets/copy, crachás WebGL).
- Skills do projeto em `.claude/skills/`: `/verificar` (prova antes de concluir), `copy-ptbr` (copy honesta), `direcao-visual` (design distinto com as restrições do site).
- Subagentes em `.claude/agents/`: `visual-qa` roda suítes de navegador e inspeciona capturas fora do contexto principal; `revisor-copy` audita afirmações e atribuição sem editar.
- Saída das suítes `browser-*.mjs` é longa: delegue ao `visual-qa` ou filtre com `| tail`.
- Ao concluir uma correção que o usuário teve de repetir, proponha a regra correspondente em `AGENTS.md` ou `.claude/rules/`.
