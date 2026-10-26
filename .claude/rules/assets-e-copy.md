---
paths:
  - "index.html"
  - "public/assets/**"
  - "src/portfolio.js"
  - "src/styles.css"
---

# Assets, HTML e copy

- Todo conteúdo essencial e os contatos existem em HTML nativo; JS só aprimora. Nada crítico pode depender de WebGL, vídeo ou prévia externa.
- Imagens novas em WebP, locais, com `width`/`height`, `decoding="async"`, `alt` descritivo (ou `alt=""` se decorativa) e `loading="lazy"` fora da primeira dobra. Vídeo com WebM + MP4 e pôster.
- Ao trocar um asset já referenciado, atualize o sufixo de cache (`?v=...`) em todas as referências, inclusive `<link rel="preload">`.
- Material recuperado de outro repositório: registre repositório, revisão, caminho original e SHA-256 em `docs/portfolio-sources.json`.
- Não reintroduzir módulos aposentados (`recovery-init`, `social-ads`, `product-demos`, `#estudio-interativo`, narrativa "LINHA"/"SOTA CI"); `tests/structure.mjs` falha se voltarem.
- Animações: respeite `prefers-reduced-motion` e o controle de pausa; prefira um momento orquestrado a efeitos espalhados.
- Copy segue a skill `copy-ptbr`: sem métricas inventadas, estudos identificados como estudos, CTA diz exatamente o que acontece.
