#!/bin/bash
# SessionStart: em sessões na nuvem, instala dependências e gera a build para que testes rodem.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}"
[ -d node_modules ] || npm ci --no-audit --no-fund --silent
[ -d public/assets/badge-build ] || npm run build --silent >/dev/null
echo "Dependências instaladas e build gerada. Playwright global disponível para tests/browser-*.mjs."
