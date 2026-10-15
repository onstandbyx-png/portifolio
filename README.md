# Smile N · ideia ↗ execução.

Portfólio profissional de direção criativa para projetos de marcas e empresas. Apresenta narrativa, arte, copy, conteúdo, campanhas e desenvolvimento de experiências digitais. A atuação na Fatos Desconhecidos é uma credencial profissional; o portfólio não oferece inventário de mídia da empresa.

- Site: https://portifolio-github-production.up.railway.app/
- Repositório: https://github.com/onstandbyx-png/portifolio
- Contato público: `public/assets/profile.js`

## Percurso

1. Proposta profissional e crachás físicos interativos, com imagem de fallback e controles por teclado/toque.
2. Trabalhos com contexto, participação, natureza do material e referências. As explorações complementares ficam em um painel opcional.
3. Estúdio “A ideia tem camadas”: tipografia, textura, luz, dobra e quatro camadas navegáveis.
4. Campanha **Linha**: estudo autoral de um produto fictício para revisão e aprovação criativa. Problema, oferta, demonstração e ação se conectam entre conteúdo, vídeo, busca e contexto.
5. Experiências digitais em dispositivos metálicos e demonstração de arquitetura de sistemas.
6. Caminhos de projeto: lançar uma oferta, gerar demanda ou construir uma experiência, com exemplos e entregas específicas.
7. Briefing com encaminhamento ao WhatsApp ou e-mail. O visitante revisa e envia no aplicativo de destino; não existe confirmação fictícia de envio.

## Desenvolvimento

Node 20+ (CI usa Node 22):

```sh
npm ci
npm run check
npm run build
npm start
```

O servidor usa `PORT` (3000 por padrão). A build gera o bundle Three.js/esbuild em `public/assets/badge-build/`; os arquivos gerados não são versionados. O HTML é canônico e a build não reescreve conteúdo editorial. Imagens e fontes essenciais são locais, incluindo a paisagem da demonstração smiile.

## Validação

```sh
npm run check && npm run build
node tests/browser-conversion.mjs
node tests/browser-sections.mjs
node tests/browser-kinetic-pass.mjs
```

Os runners precisam de Playwright e Chromium. `QA_PACKAGE` informa a instalação de Playwright; `CHROMIUM_PATH` seleciona o navegador e `BASE_URL` permite usar um servidor já iniciado. Sem `BASE_URL`, cada runner inicia o servidor local. Detalhes e limites em [docs/implementation-qa.md](docs/implementation-qa.md).

Os testes verificam interações, foco, estados acessíveis, imagens, overflow, exceções e preparação dos destinos de contato. Nenhuma mensagem é enviada. Validação em Chromium emulado não substitui mensuração em aparelho físico ou dados reais de conversão.

## Materiais e atribuição

- A trajetória na Fatos Desconhecidos foi informada pelo profissional. Os recortes documentais Fatos têm origem identificada nos detalhes do case; não são apresentados como autoria individual integral.
- **Linha** e as pranchas gráficas são estudos autorais, não campanhas publicadas nem evidência de resultados comerciais. A origem dos elementos está em [public/assets/creative/README.md](public/assets/creative/README.md).
- A demonstração smiile preserva a referência pública e o trabalho original dos dispositivos e crachás. Sua base física vem do `HangingBadges`, commit `b6a2e0d8312f91268a4d190b1a7a082ee1b59b38`, adaptada para este portfólio.
- A demonstração CI representa uma arquitetura de pesquisa. Não consulta dados privados.
- Os vídeos enviados pelo profissional orientam materialidade, movimento e interatividade. Este ciclo não alega reprodução quadro a quadro dessas referências.

## Contato e eventos

`window.PORTFOLIO_PROFILE` configura nome, WhatsApp e e-mail. Os links nativos funcionam sem JavaScript. O formulário só é habilitado após registrar os handlers; texto do briefing não é enviado a um backend do portfólio.

Eventos `portfolio:interaction` registram escolhas e intenção de contato com valores categóricos. O texto do briefing, telefone e e-mail não integram os eventos. Se já existir `dataLayer`, eventos também são publicados nela. Não foi instalado um provedor de analytics; cliques não comprovam mensagens enviadas ou conversões.

## Publicação

O serviço Railway `portifolio-github` acompanha `main`. O workflow Verify Portfolio valida build e navegação antes da integração. A publicação deve ser seguida da confirmação de deployment `SUCCESS` e de uma verificação no site público.
