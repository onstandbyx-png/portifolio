# Recuperação das referências — 15/10/2026

Esta revisão parte de `702344b5e26e21c7a80713560130e9da969aa289`. Recupera materiais e interações para tornar os projetos exploráveis, preservando os dispositivos, os crachás físicos e o estudo cinético existentes.

## Referência → implementação

| Referência | Implementação no portfólio | Comportamento adaptado |
| --- | --- | --- |
| Vídeo 1000772829: planos inteiros em perspectiva | Galeria de quatro trabalhos, `scroll-gallery.js` | A rolagem inclina o plano externo. A virada e a abertura do caso permanecem independentes. Interagir fixa a pose atual; “Retomar rolagem” devolve o controle ao scroll. |
| Vídeo 1000772827: percurso entre peças em profundidade | Narrativa visual da Casa Costa, `experiences.js` | Capa, social e site usam o mesmo projeto. Desktop inclui visões de conjunto; celular oferece três enquadramentos legíveis, com seleção manual persistente. |
| Vídeo 1000772828: crachás suspensos independentes | `BadgeScene.ts` e controles acessíveis | Virada individual por toque/clique ou botão. O rig, o balanço e os cordões existentes são mantidos. A virada é uma transformação de apresentação separada do solver físico. |
| Mídia kit Fatos: baralho de seis verticais | `fatos-deck.js` | Artes originais, avatares, navegação, gesto horizontal e frente/verso. O verso apresenta contexto editorial e formatos; não transforma audiência do grupo em resultado pessoal. |
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

`npm run check` e `npm run build` aprovados; o build executa 28 testes de contratos e comportamento. A suíte `tests/browser-reference-recovery.mjs` verifica as demonstrações em Chromium nas larguras 1440, 390 e 320 px, além de 390 px com movimento reduzido. A suíte legada de evidências agora delega a essa cobertura.

Capturas foram inspecionadas em desktop e celular emulado, incluindo frente/verso do Fatos, app/site/voz, narrativa visual e galeria. Essa revisão revelou e corrigiu: sobreposição de controles, legenda encoberta pelo plano seguinte, salto de pose durante o clique, controles de áudio cortados em 320 px e perda de foco na confirmação do agendamento.

O estúdio cinético foi verificado separadamente em 390 × 844 px: 36 verificações aprovadas, incluindo vídeo local, byte ranges, dobra, camadas, pausa global, teclado e movimento reduzido. O workflow executa também sua matriz completa.

As capturas automatizadas e relatórios são gerados em `qa/`, ignorado pelo Git, e publicados como artefato do workflow. Emulação de Chromium não substitui uma revisão em aparelhos físicos e Safari.

## Revisão isolada

Branch: `feat/portfolio-reference-recovery-20261015`.

A prévia usa o serviço existente `portfolio-visual-review`, separadamente do serviço principal. A revisão precisa ser observada em movimento: um teste aprovado não comprova, por si só, fidelidade visual.
