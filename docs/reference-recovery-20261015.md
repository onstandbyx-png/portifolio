# Recuperação das referências — 15/10/2026

Esta revisão parte de `702344b5e26e21c7a80713560130e9da969aa289`. Recupera materiais e interações para tornar os projetos exploráveis, preservando os dispositivos, os crachás físicos e o estudo cinético existentes.

## Referência → implementação

| Referência | Implementação no portfólio | Comportamento adaptado |
| --- | --- | --- |
| Vídeo 1000772829: planos inteiros em perspectiva | Galeria de quatro trabalhos, `scroll-gallery.js` | A rolagem inclina o plano externo. A virada e a abertura do caso permanecem independentes. A rolagem nativa mantém o controle; setas levam a outro capítulo sem travar o próximo gesto. Em telas de pouca altura, os planos ficam no fluxo normal com entrada e saída discretas. |
| Vídeo 1000772827: percurso entre peças em profundidade | Narrativa visual da Casa Costa, `experiences.js` | Capa, social e site usam o mesmo projeto. Desktop inclui visões de conjunto; celular oferece três enquadramentos legíveis. Selecionar um formato posiciona a página nesse capítulo e a rolagem continua imediatamente. |
| Vídeo 1000772828: crachás suspensos independentes | `BadgeScene.ts` e controles acessíveis | Virada individual por toque/clique ou botão. O rig e os cordões são mantidos. A virada é independente do solver; o arraste tem deslocamento e velocidade limitados, amortecimento e retorno à posição de leitura. Cliques repetidos não somam impulsos. |
| Mídia kit Fatos: baralho de seis verticais | `fatos-deck.js` | Artes originais, avatares, navegação e frente/verso. O arraste acompanha o dedo e troca uma carta por gesto; cancelar retorna à mesma carta. A altura considera a área disponível e mantém os controles visíveis. O verso apresenta contexto editorial e formatos; não transforma audiência do grupo em resultado pessoal. |
| Fatos: Meta e TikTok | `social-ads.js` | Mesmo dispositivo metálico, interfaces sociais completas, três quadros editoriais coerentes, imagens decodificadas e sequência controlável de 12 segundos. |
| smiile: app, site e ligação | `product-demos.js` | App com busca, favoritos, detalhe, mapa e percurso; site com galeria e agendamento; áudio original com transcrição e proposta v2/v3. |
| Ingresso “init”: material, dobra e camadas | Estúdio cinético existente | Preservado. Vídeo, dobra, exploração de camadas e controles continuam funcionais. |

## Fontes e fidelidade

- Fatos: `onstandbyx-png/roblox@b9c827082edc6e2076c864687451ae3d1a1dcf76`. O nome do repositório não caracteriza uma demonstração de jogo: os materiais recuperados são do mídia kit Fatos.
- smiile: `onstandbyx-png/smiile-@a2e6d42c526aa721d5059a6baad00cc86418ca3d`, em `sites/smiile-landing`. O percurso usa os 241 pontos originais; o áudio e a transcrição vêm dos arquivos originais.
- A recuperação usa a revisão visual da smiile; a branch padrão antiga não contém essa experiência. O manifesto registra a origem dos assets e distingue o módulo de dados adaptado dos arquivos copiados sem alteração.
- A galeria da Casa Costa explora três enquadramentos da mesma fotografia, como a origem; não apresenta recortes como três fotografias distintas.
- Datas de visita são locais e próximas da consulta. Agendamento e aprovação são demonstrações locais, sem envio externo.
- No social, uma nova imagem só substitui a anterior após decodificação. Respostas atrasadas não sobrescrevem a seleção mais recente.

## Toque, teclado e movimento

- Áreas de toque do cabeçalho e novos controles principais têm pelo menos 44 × 44 px.
- Pausa global fica no cabeçalho e interrompe movimento/reprodução; não cobre botões dos exemplos.
- Preferência por movimento reduzido transforma a galeria em sequência normal, com todas as peças acessíveis. A narrativa continua navegável pelos controles.
- Áudio exige ação explícita. Pausa global impede reiniciar a reprodução; movimento reduzido permite ouvi-lo por escolha do visitante.
- Ao sair da seção ou ocultar a página, percurso e áudio param. Trocar abas mantém o estado local sem remontar a moldura do telefone.
- Abertura da visita, confirmação e retorno ao formulário transferem o foco para o novo estado sem deslocar a página.

## Validação

`npm run check` e `npm run build` aprovados; o build executa 37 testes de contratos e comportamento, incluindo nove verificações de estabilidade física. A suíte `tests/browser-reference-recovery.mjs` verifica as demonstrações em Chromium nas larguras 1440, 390 e 320 px, além de 390 px com movimento reduzido. A suíte legada de evidências delega a essa cobertura. `tests/browser-gestures.mjs` acrescenta gestos reais de toque via CDP, cancelamento, rolagem nativa, arraste do verso do crachá e cliques repetidos; a instrumentação de física existe somente no bundle de teste.

Capturas foram inspecionadas em desktop e celular emulado, incluindo frente/verso do Fatos, app/site/voz, narrativa visual e galeria. Essa revisão revelou e corrigiu: sobreposição de controles, legenda encoberta pelo plano seguinte, salto de pose durante o clique, controles de áudio cortados em 320 px e perda de foco na confirmação do agendamento.

O estúdio cinético foi verificado separadamente em 390 × 844 px: 36 verificações aprovadas, incluindo vídeo local, byte ranges, dobra, camadas, pausa global, teclado e movimento reduzido. O workflow executa também sua matriz completa.

As capturas automatizadas e relatórios são gerados em `qa/`, ignorado pelo Git, e publicados como artefato do workflow. Emulação de Chromium não substitui uma revisão em aparelhos físicos e Safari.

## Correção de comportamento — R2

A revisão `interaction-fidelity-20261015-r2` responde aos screenshots de 15/10: baralho maior que a tela, mock TikTok genérico e planos sobrepostos com rolagem presa.

- No hero, um toque vira a peça; o arraste horizontal move o crachá; um gesto vertical no celular rola a página. Escape restaura a frente e o repouso em leque, mantendo as duas silhuetas visíveis. Os cartões giram ao redor dos encaixes, sem deslocar os pontos de suspensão. A referência do ponto agarrado fica fixa durante o gesto, inclusive no verso.
- O botão de balanço substitui um impulso pequeno, sem somar energia. Depois das constraints, a física interativa limita velocidades a 1,6 unidade/s e 2,4 rad/s. O alvo de arraste avança gradualmente dentro de uma área fixa; arrastes consecutivos não deslocam essa área.
- A entrada original continua disponível. Ao interagir durante a entrada, a peça conserva a pose e volta suavemente à leitura. Ao estabilizar, o solver entra em repouso real, sem micro-oscilações residuais.
- A galeria mantém perspectiva em 390 × 748 px. Em 320 × 640 px, a altura curta pede cartões completos no fluxo da página. O mesmo vale para a narrativa de formatos; não há botão “Retomar rolagem”.
- O baralho e os telefones usam a altura estável `svh` para não pulsar quando a barra do navegador Android abre ou fecha. A frente, o verso e os controles precisam ser revisados juntos, e não apenas por capturas de componentes recortados.
- Meta e TikTok substituem os posters simplificados. O código anterior de reprodução foi removido para haver somente um controlador da sequência, com pausa ao sair da seção, trocar de aba ou pausar a página.

A inspeção visual e os gestos em navegador emulado complementam os testes de solver; aprovação automática não significa equivalência perfeita ao vídeo de referência.

## Revisão isolada

Branch: `feat/portfolio-reference-recovery-20261015`.

A prévia usa o serviço existente `portfolio-visual-review`, separadamente do serviço principal. A revisão precisa ser observada em movimento: um teste aprovado não comprova, por si só, fidelidade visual.
