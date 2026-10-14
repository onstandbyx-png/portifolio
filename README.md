# Ideia & Execução | Portfólio

Portfólio pessoal **mobile-first**, apresentando trabalhos e capacidades em redação, criação editorial, campanhas/gestão de mídia paga, sites e sistemas. O layout foi reconstruído a partir de elementos reais da smiile e dos materiais originais do Ecossistema Fatos 2026.

## Preview publicado

- GitHub: https://github.com/onstandbyx-png/portifolio
- Railway (serviço conectado à branch `main`): https://portifolio-github-production.up.railway.app/
- Referência de movimento da smiile: https://smiile-landing-preview.up.railway.app/?v=b6a2e0d#categorias
- Referência editorial pública Fatos: https://midia-kit-production-c234.up.railway.app/

## Componentes interativos

1. Hero editorial com **páginas reais** dos documentos do Fatos e preview da smiile.
2. Estudos de caso com expansão modal acessível, rótulos de autoria e links de origem.
3. Quatro categorias em **rolagem nativa**, cards suspensos, efeitos de profundidade e flip acessível. Comportamento baseado em `CapabilityDeck.tsx` / `.css` da smiile, commit `b6a2e0d8312f91268a4d190b1a7a082ee1b59b38`.
4. Processo editorial interativo com três capítulos, ilustrados por imagens originais do Fatos.
5. Zoom durante o scroll, sem interceptar eventos de roda ou touch, inspirado em `ScrollZoomPreview` da smiile.
6. Laboratório de mídia com layouts conceituais específicos para Meta, TikTok, Google e ChatGPT Ads.
7. Representação didática navegável do fluxo CI: entrada, fonte, relações e dossiê.
8. Menu mobile, opção de pausar movimento, suporte a `prefers-reduced-motion` e formulário local para preparar briefing.

## Materiais e limites

As imagens `public/assets/fatos-*.webp` foram extraídas dos PDFs originais de direção visual e mídia kit Fatos 2026 já fornecidos. As imagens de demonstração da smiile são referenciadas a partir da landing original pública, sob domínio Railway do mesmo operador. A interface de anúncio é **conceitual**, sem dados de conta ou campanhas reais. A participação editorial do Fatos não representa oferta de veiculação na rede.

O portfólio é sobre a atuação profissional do operador. A origem de uma amostra não implica autoria individual integral de todos os elementos, nem aceitação técnica de todas as integrações demonstradas no produto original.

## Execução

```bash
npm run check
npm start
# localhost:3000
```

Sem dependências em tempo de execução: HTML semântico, CSS e JavaScript com servidor Node 20+ e assets versionados. `PORT` é configurado pelo Railway.

## Checks

`npm run check` valida a estrutura, estados e JavaScript. Além disso, o protótipo foi submetido localmente a teste com Chromium em larguras de 320, 390 e 1440 pixels por meio de um harness em que HTML, CSS, JS e imagens originais foram incorporados para inspeção offline. Não confundir isso com ensaio de navegadores físicos ou validação de conversões.

## Deploy

O serviço Railway `portifolio-github` acompanha a branch `main`. Pushes autorizados acionam o processo de build e nova implantação. O serviço Railway Function anterior foi mantido como preview independente e não é necessário para esse repositório.