# Portfólio Smile N · ideia ↗ execução

Site estático de portfólio (redação, direção criativa, campanhas/Ads, sites, apps, vídeo). Público: marcas e empresas. O visitante entende o trabalho vendo peças e interações, não arquitetura de software. Idioma do conteúdo, commits e docs: **português do Brasil**.

## Comandos

```sh
npm ci                       # Node >= 20 (CI usa 22)
npm run check                # estrutura + node --check em portfolio.js e server.mjs
npm run build                # esbuild dos crachás (src/badges) + valida imports de index.html
node --test tests/*.test.mjs # unitários (rápidos, ~1 s)
node tests/browser-<suite>.mjs  # Playwright/Chromium; saída JSON longa, capturas em qa/
npm start                    # server.mjs em PORT (padrão 3000), /health responde ok
```

- Rode `npm run build` antes de qualquer suíte de navegador: os testes usam a build existente.
- Suítes do CI (`.github/workflows/verify.yml`): visual-correction, positioning, fatos-video, editorial-devices, device-fidelity, hero-fit, section-visibility, narrative, motion-rhythm, static-presentations, badge-loading, gestures, readable-hero, independent-showcases.
- Variáveis dos testes: `BASE_URL`/`QA_URL` (servidor já iniciado), `QA_PACKAGE` (Playwright de outra instalação), `CHROMIUM_PATH`, `PORT`.
- Deploy: Railway (`railway.json`, builder RAILPACK, healthcheck `/health`).

## Mapa

- `index.html`: página única e fallback HTML estático de todo o conteúdo essencial.
- `src/portfolio.js`, `src/styles.css`: servidos como `/assets/portfolio.js` e `/assets/portfolio.css`.
- `src/badges/`: cena WebGL dos crachás (three.js, TypeScript) → `public/assets/badge-build/` (gerado, ignorado pelo git).
- `public/assets/`: módulos JS sem bundler, CSS por seção, imagens WebP, vídeo. `showcase/` = apresentações e demos; `content/portfolio-copy.js` = copy; `kinetic-pass/` = estúdio cinético arquivado (não inicializar a partir do HTML).
- `scripts/`: build e renderização de pôsteres/estáticos. `install-sections.mjs` valida, nunca reescreve conteúdo editorial.
- `tests/`: `structure.mjs`, `*.test.mjs` (node:test) e `browser-*.mjs` (Playwright).
- `docs/`: decisões datadas, QA e manifesto de fontes (`portfolio-sources.json` com revisão e SHA-256).

## Regras do produto (não negociáveis)

- Não inventar números, alcance, vendas, ROAS, clientes ou depoimentos. Estudos conceituais ficam identificados como estudos; o mock de anúncios não significa publicação.
- Fatos Desconhecidos é experiência editorial profissional, não inventário de mídia, e não atribui autoria integral de todos os materiais a uma pessoa.
- Contato abre WhatsApp ou e-mail com briefing editável; nada é enviado automaticamente e nunca se afirma envio. Sem barra fixa de contato no mobile.
- Preservar crachás físicos do hero e o estúdio cinético como ativos visuais. Não reconstruir a home em torno de produto fictício único ou dossiê técnico.
- Assets essenciais são locais; demos não dependem de prévias externas. Registrar origem de material recuperado em `docs/portfolio-sources.json`.
- Qualidade mínima: 320, 390 e 1440 px sem overflow horizontal, foco visível por teclado, `prefers-reduced-motion` respeitado, fallback antes do primeiro frame WebGL.

## Como trabalhar

- Mudanças cirúrgicas: cada linha alterada deve responder ao pedido. Siga o estilo compacto existente (JS denso, sem framework, ESM). Não refatore o que não foi pedido.
- Antes de dizer que algo funciona, rode o comando que prova e leia a saída. Asserts verdes não provam composição: abra as capturas em `qa/` ao mexer em visual.
- Mudou visual ou interação: rode `npm run check && npm run build && node --test tests/*.test.mjs` e as suítes de navegador afetadas.
- Commits no formato `tipo(escopo): descrição` em pt-BR (`feat`, `fix`, `test`, `style`, `docs`, `ci`, `release`).
- Decisão relevante de produto ou visual: registre em `docs/` com data no nome do arquivo (`assunto-AAAAMMDD.md`).
