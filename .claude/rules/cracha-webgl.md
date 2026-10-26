---
paths:
  - "src/badges/**"
  - "scripts/build-badges.mjs"
  - "scripts/render-badge-posters.mjs"
---

# Crachás WebGL

- Fonte em TypeScript (`src/badges/`), three.js fixado em `0.186.1`; o bundle sai em `public/assets/badge-build/` via `npm run build` e não é versionado.
- A física (`physics.ts`, `rig.ts`) é ativo visual a preservar: mudanças devem manter `tests/badge-stability.test.mjs` e `tests/browser-badge-loading.mjs` verdes.
- O pôster estático (`public/assets/badges/poster-*.webp`) é o fallback antes do primeiro frame e após perda de contexto; se a arte mudar, regenere com `scripts/render-badge-posters.mjs`.
