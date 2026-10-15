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
| Estúdio | Vídeo nativo local, HTTP Range exato para WebM e MP4, recuperação de uma interrupção de reprodução, dobra, quatro camadas, inspeção, personalização, reset, teclado, arraste, linha do tempo, pausa e movimento reduzido. Também verifica acabamento prata no vídeo, iluminação em movimento com dobra estável e explicação de 7,5 s. Captura 13 momentos, incluindo a dobra secundária em 23,55 s. |

Os testes de contato inspecionam os destinos e a preparação do briefing sem abrir WhatsApp, cliente de email ou enviar mensagem. Links externos de projetos não são acionados. A suíte de conversão bloqueia os previews externos de Fatos e smiile para verificar a independência das imagens principais.

## Evidências e limites

Resultados e capturas ficam em `qa/conversion/`, `qa/kinetic-pass/` e `qa/`. A inspeção visual deve acompanhar os testes automatizados: passar nos asserts não comprova qualidade de composição ou fidelidade estética.

Chromium usa renderização de GPU por software (SwiftShader) nesta execução. Tempo de compilação WebGL e frames nesse ambiente não representam desempenho em telefone físico. Ainda é necessário medir LCP, INP e CLS no navegador de aparelhos reais ou por dados de campo. O teste valida que a imagem de fallback continua visível e que as funções essenciais continuam acessíveis.

## Resultados

A suíte de conversão concluiu **241 verificações aprovadas**: 58 em 1440×1000 e 61 em cada uma das telas 320×740, 390×844 e 430×932. Nenhuma exceção JavaScript, falha de recurso local ou overflow horizontal. O fluxo de WhatsApp foi interceptado no navegador, o email foi inspecionado e nenhuma mensagem foi enviada. Relatório: `qa/conversion/results.json`.

A suíte de seções concluiu **138 verificações aprovadas**, 46 em cada viewport: 1440×900, 390×844 e 320×740. Inclui revisão e aprovação da LINHA, explicação da decisão de copy, quatro CTAs de campanha abrindo a demonstração correspondente, modal e retorno de foco, dispositivos e sistemas. Nenhuma exceção JavaScript nem overflow horizontal. Relatório: `qa/results.json`.

A matriz final do estúdio foi concluída em **Playwright 1.64.0 / Chrome Headless Shell 156.0.8078.4**, acompanhando a versão do CI: **142 verificações aprovadas**, sem exceções JavaScript nem overflow horizontal. Foram 36 verificações em 1440×1000 e 390×844, e 35 em 320×740 e 844×390. Todas as telas selecionaram e reproduziram o WebM nativo. As 52 capturas cobrem 13 estados por viewport. Relatório: `qa/kinetic-pass/results.json`.

Esperas de duração fixa foram substituídas por esperas pelo estado esperado para decodificação, avanço de vídeo, abertura e retorno da dobra e início da sequência. O limite permite a execução funcional em GPU por software sem confundir uma animação emulada com desempenho em aparelho físico.

A última alteração foi validada incrementalmente em 1440, 320, 390 e 430 px: **12 verificações aprovadas**. O botão “Explorar o fluxo” do exemplo de landing abre a experiência e transfere o foco para o painel; a nova arte editorial do hero decodifica localmente em 1000 px. Nenhuma exceção JavaScript. Relatório: `qa/conversion/path-cta-incremental.json`. As duas verificações do CTA também foram incorporadas ao teste principal de conversão para execuções futuras.

Total deste ciclo, usando a última matriz do estúdio: **533 verificações de navegador aprovadas**. As rodadas finais substituem os diagnósticos preliminares.

## Reprodução nativa e compatibilidade do CI

O primeiro CI interrompeu a suíte no requisito de decodificação do vídeo. A investigação acrescentou WebM/VP9 antes do MP4/H.264 e corrigiu uma corrida de `video.play()`: uma rejeição temporária `AbortError` não pode invalidar uma mídia já decodificada. O vídeo mantém o quadro e permite uma nova tentativa; a indisponibilidade real de mídia continua usando o fallback.

A regressão em 390×844 injeta exatamente um `AbortError`, move a seção para fora e para dentro da tela e exige que a textura continue sendo vídeo nativo e que `currentTime` volte a avançar. Decodificação, progresso, pausa local e pausa global permanecem obrigatórios. Os dois formatos também precisam responder a `Range: bytes=0-127` com status 206, `Content-Range` correto e exatamente 128 bytes.

Não se confirmou ausência de H.264 na reprodução local com a versão do CI. Bloquear o WebM no Chrome Headless Shell 156 selecionou o MP4, com `readyState=4`, nenhum erro e avanço de reprodução. Evidência: `qa/kinetic-pass/ci-codec-diagnostic.json`. Portanto a diferença de codec não é apresentada como causa comprovada da falha original.

O runner agora registra a versão e o executável do navegador, a fonte selecionada, `video.error`, `readyState`, `networkState`, `canPlayType` para os dois formatos e as respostas HTTP de mídia em caso de falha. A suíte do estúdio bloqueia apenas o bundle 3D do hero, que já tem cobertura própria, para concentrar a GPU em sua interação. Conversão e seções não foram repetidas nesta correção localizada; os 12 testes unitários do estúdio e a matriz completa relacionada passaram.
