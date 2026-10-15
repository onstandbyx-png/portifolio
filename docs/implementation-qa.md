# Validação da implementação · 15/10/2026

O ciclo combina testes de estrutura e matemática com navegação real em Chromium. A suíte de conversão verifica a proposta profissional, autoria e classificação dos cases, acesso por teclado, caminhos para contato, integridade dos recursos locais e uso das interações em diferentes tamanhos de tela.

## Execução

```sh
npm run check
node --test tests/*.test.mjs
node tests/browser-conversion.mjs
node tests/browser-sections.mjs
node tests/browser-kinetic-pass.mjs
```

Os testes de navegador usam a build existente. O responsável pela integração deve executar `npm run build` antes da validação; os testes não reescrevem o HTML nem publicam alterações.

`BASE_URL` permite validar um servidor já iniciado; `QA_URL` é compatível com os runners anteriores. Sem essas variáveis, cada teste inicia `server.mjs`, usando `PORT` ou sua porta padrão. `QA_PACKAGE` permite resolver Playwright em outra instalação e `CHROMIUM_PATH` escolhe o executável. A resolução padrão tenta Playwright do projeto e depois o runtime global do Codex. Os runners com Playwright instalado continuam compatíveis.

## Cobertura

| Suíte | Cobertura |
|---|---|
| Conversão | Desktop 1440×1000; mobile 320×740, 390×844 e 430×932. Hero e credencial, CTA, verso dos crachás por teclado, menu, três caminhos de projeto com decisões e briefing, três cases e foco, estúdio, movimento reduzido, contato real sem envio, imagens e links locais, overflow e exceções JavaScript. |
| Seções | Coleção opcional quando presente, troca de perspectiva, cards e modal, narrativa, dispositivos metálicos, canais de campanha, sistemas e resumo de briefing. A demonstração LINHA aplica uma revisão e avança para aprovação. |
| Estúdio | Material local, HTTP Range, dobra, quatro camadas, inspeção, personalização, reset, teclado, arraste, linha do tempo, pausa e movimento reduzido. Também verifica acabamento prata no vídeo, iluminação em movimento com dobra estável e explicação de 7,5 s. Captura 13 momentos, incluindo a dobra secundária em 23,55 s. |

Os testes de contato inspecionam os destinos e a preparação do briefing sem abrir WhatsApp, cliente de email ou enviar mensagem. Links externos de projetos não são acionados. A suíte de conversão bloqueia os previews externos de Fatos e smiile para verificar a independência das imagens principais.

## Evidências e limites

Resultados e capturas ficam em `qa/conversion/`, `qa/kinetic-pass/` e `qa/`. A inspeção visual deve acompanhar os testes automatizados: passar nos asserts não comprova qualidade de composição ou fidelidade estética.

Chromium usa renderização de GPU por software (SwiftShader) nesta execução. Tempo de compilação WebGL e frames nesse ambiente não representam desempenho em telefone físico. Ainda é necessário medir LCP, INP e CLS no navegador de aparelhos reais ou por dados de campo. O teste valida que a imagem de fallback continua visível e que as funções essenciais continuam acessíveis.

## Resultados

A suíte de conversão concluiu **241 verificações aprovadas**: 58 em 1440×1000 e 61 em cada uma das telas 320×740, 390×844 e 430×932. Nenhuma exceção JavaScript, falha de recurso local ou overflow horizontal. O fluxo de WhatsApp foi interceptado no navegador, o email foi inspecionado e nenhuma mensagem foi enviada. Relatório: `qa/conversion/results.json`.

A suíte de seções concluiu **138 verificações aprovadas**, 46 em cada viewport: 1440×900, 390×844 e 320×740. Inclui revisão e aprovação da LINHA, explicação da decisão de copy, quatro CTAs de campanha abrindo a demonstração correspondente, modal e retorno de foco, dispositivos e sistemas. Nenhuma exceção JavaScript nem overflow horizontal. Relatório: `qa/results.json`.

A matriz do estúdio foi concluída em Chromium: **137 verificações aprovadas**, sem exceções JavaScript nem overflow horizontal. Foram 35 verificações em 1440×1000 e 34 em cada uma das telas 390×844, 320×740 e 844×390. As 52 capturas cobrem 13 estados por viewport. Relatório: `qa/kinetic-pass/results.json`.

Esperas de duração fixa foram substituídas por esperas pelo estado esperado para decodificação, avanço de vídeo, abertura e retorno da dobra e início da sequência. O limite permite a execução funcional em GPU por software sem confundir uma animação emulada com desempenho em aparelho físico.

A última alteração foi validada incrementalmente em 1440, 320, 390 e 430 px: **12 verificações aprovadas**. O botão “Explorar o fluxo” do exemplo de landing abre a experiência e transfere o foco para o painel; a nova arte editorial do hero decodifica localmente em 1000 px. Nenhuma exceção JavaScript. Relatório: `qa/conversion/path-cta-incremental.json`. As duas verificações do CTA também foram incorporadas ao teste principal de conversão para execuções futuras.

Total deste ciclo: **528 verificações de navegador aprovadas**. As rodadas finais substituem os diagnósticos preliminares. Não foi necessário alterar o produto para tolerar falhas de teste: os ajustes no harness acompanharam as mudanças intencionais de narrativa e fluxo, a resolução adequada das imagens e a espera por estados reais sob GPU por software.
