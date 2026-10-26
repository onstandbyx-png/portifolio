---
paths:
  - "tests/**"
---

# Testes

- `*.test.mjs` usam `node:test` + `node:assert/strict` e leem fontes com `readFileSync`; mantenha-os rápidos e sem rede.
- `browser-*.mjs` resolvem Playwright via `createRequire(process.env.QA_PACKAGE||import.meta.url)` e iniciam `server.mjs` quando não há `BASE_URL`/`QA_URL`. Preserve esse contrato ao criar suítes novas.
- Lance Chromium com os mesmos args SwiftShader das suítes existentes; WebGL em software não mede desempenho real.
- Cubra 320, 390 e 1440 px e um caso com `reducedMotion: 'reduce'`. Sempre verifique overflow horizontal e exceções JS.
- Contato: intercepte WhatsApp/mailto; nunca abra cliente externo nem envie mensagem. Bloqueie prévias externas para provar independência de assets.
- Grave evidências em `qa/<suite>/` (ignorado pelo git). Nova suíte de CI: adicione o nome à matriz em `.github/workflows/verify.yml`.
- Nunca enfraqueça, pule ou apague um assert para ficar verde; se o critério mudou por decisão de produto, diga qual decisão no commit.
